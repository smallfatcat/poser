import { useState, useCallback, useEffect, RefObject } from 'react';
import { poseToCoordinates } from '../utils/poseAngleToCoordinates';
import { jointHierarchy, ikChains } from '../constants/joints';
import { calculateInverseKinematics, updateChildJoints } from '../utils/kinematics';
import { Pose, Vector2, PoseCoordinates, IkChains } from '../types';

interface UsePoseInteractionProps {
    pose: Pose;
    onPoseChange: (pose: Pose) => void;
    draggable: boolean;
    canvasRef: RefObject<HTMLCanvasElement>;
    useInverseKinematics: boolean;
    excludedJoints: Set<string>;
    useRelativeConstraints: boolean;
}

interface UsePoseInteractionReturn {
    draggedJoint: string | null;
    isDragging: boolean;
    hoveredJoint: string | null;
    currentPose: Pose;
    poseCoordinates: PoseCoordinates;
    getEventPos: (e: MouseEvent | TouchEvent) => Vector2;
    getJointAtPosition: (x: number, y: number) => string | null;
}

export const usePoseInteraction = ({
    pose,
    onPoseChange,
    draggable,
    canvasRef,
    useInverseKinematics,
    excludedJoints,
    useRelativeConstraints,
}: UsePoseInteractionProps): UsePoseInteractionReturn => {
    const [currentPose, setCurrentPose] = useState<Pose>(pose);
    const [draggedJoint, setDraggedJoint] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [dragStartPose, setDragStartPose] = useState<Pose | null>(null);
    const [dragStartOffset, setDragStartOffset] = useState<Vector2 | null>(null);
    const [hoveredJoint, setHoveredJoint] = useState<string | null>(null);

    const poseCoordinates = poseToCoordinates(currentPose);

    useEffect(() => {
        setCurrentPose(pose);
    }, [pose]);

    const getEventPos = useCallback((e: MouseEvent | TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        
        let clientX, clientY;
        if (e instanceof TouchEvent) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }

        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }, [canvasRef]);

    const getJointAtPosition = useCallback((x: number, y: number): string | null => {
        const joints = Object.entries(poseCoordinates);
        const tolerance = 15;

        for (const [jointName, jointPos] of joints) {
            const distance = Math.sqrt(
                Math.pow(x - jointPos.x, 2) + Math.pow(y - jointPos.y, 2)
            );
            if (distance <= tolerance) {
                return jointName;
            }
        }
        return null;
    }, [poseCoordinates]);

    const handleDragStart = useCallback((e: MouseEvent | TouchEvent) => {
        if (!draggable) return;

        e.preventDefault();
        const pos = getEventPos(e);
        const jointName = getJointAtPosition(pos.x, pos.y);
        
        if (jointName) {
            if (e instanceof MouseEvent && e.ctrlKey) {
                // This logic will be handled in the component
                return;
            }

            setDraggedJoint(jointName);
            setIsDragging(true);
            setDragStartPose(currentPose);

            const jointPos = (poseCoordinates as any)[jointName];
            const mousePos = getEventPos(e);
            
            const dx = mousePos.x - jointPos.x;
            const dy = mousePos.y - jointPos.y;
            setDragStartOffset({ x: dx, y: dy });
        }
    }, [draggable, getEventPos, getJointAtPosition, currentPose, poseCoordinates]);

    const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!draggable || !isDragging || !draggedJoint) return;

        e.preventDefault();
        const mousePos = getEventPos(e);
        
        let newPose = JSON.parse(JSON.stringify(currentPose)); // Deep copy
        
        if (useInverseKinematics) {
            let ikChain: string[] | null = null;
            if (draggedJoint === 'head') {
                ikChain = (ikChains as IkChains).head;
            } else if (["leftHand", "leftUpperArm", "leftLowerArm"].includes(draggedJoint)) {
                ikChain = (ikChains as IkChains).leftArm;
            } else if (["rightHand", "rightUpperArm", "rightLowerArm"].includes(draggedJoint)) {
                ikChain = (ikChains as IkChains).rightArm;
            } else if (["leftFoot", "leftUpperLeg", "leftLowerLeg"].includes(draggedJoint)) {
                ikChain = (ikChains as IkChains).leftLeg;
            } else if (["rightFoot", "rightUpperLeg", "rightLowerLeg"].includes(draggedJoint)) {
                ikChain = (ikChains as IkChains).rightLeg;
            }
            
            if (ikChain) {
                newPose = calculateInverseKinematics(mousePos, ikChain, newPose, excludedJoints);
            } else {
                const targetPos = {
                    x: mousePos.x - (dragStartOffset ? dragStartOffset.x : 0),
                    y: mousePos.y - (dragStartOffset ? dragStartOffset.y : 0)
                };

                if (draggedJoint === 'hip') {
                    newPose.hip = { x: targetPos.x, y: targetPos.y };
                } else if (draggedJoint === 'shoulder' && typeof newPose.hip === 'object') {
                    const hipPos = newPose.hip;
                    const dx = targetPos.x - hipPos.x;
                    const dy = -(targetPos.y - hipPos.y);
                    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
                    if (angle < 0) angle += 360;
                    angle = (angle - 90 + 360) % 360;
                    newPose.torsoAngle = angle;
                    if (dragStartPose) {
                        updateChildJoints(newPose, 'shoulder', dragStartPose, useRelativeConstraints);
                    }
                } else {
                    const jointInfo = jointHierarchy[draggedJoint];
                    if (jointInfo) {
                        const { parent, angleParam, needsOffset } = jointInfo;
                        const parentPos = (poseToCoordinates(newPose) as any)[parent];
                        if (parentPos) {
                            const dx = targetPos.x - parentPos.x;
                            const dy = -(targetPos.y - parentPos.y);
                            let angle = Math.atan2(dy, dx) * (180 / Math.PI);
                            if (angle < 0) angle += 360;
                            if (needsOffset) angle = (angle - 90 + 360) % 360;
                            newPose[angleParam] = angle;
                            if (dragStartPose) {
                                updateChildJoints(newPose, draggedJoint, dragStartPose, useRelativeConstraints);
                            }
                        }
                    }
                }
            }
        } else {
            const targetPos = {
                x: mousePos.x - (dragStartOffset ? dragStartOffset.x : 0),
                y: mousePos.y - (dragStartOffset ? dragStartOffset.y : 0)
            };
            if (draggedJoint === 'hip') {
                newPose.hip = { x: targetPos.x, y: targetPos.y };
            } else if (draggedJoint === 'shoulder' && typeof newPose.hip === 'object') {
                const hipPos = newPose.hip;
                const dx = targetPos.x - hipPos.x;
                const dy = -(targetPos.y - hipPos.y);
                let angle = Math.atan2(dy, dx) * (180 / Math.PI);
                if (angle < 0) angle += 360;
                angle = (angle - 90 + 360) % 360;
                newPose.torsoAngle = angle;
                if(dragStartPose) {
                    updateChildJoints(newPose, 'shoulder', dragStartPose, useRelativeConstraints);
                }
            } else {
                const jointInfo = jointHierarchy[draggedJoint];
                if (jointInfo) {
                    const { parent, angleParam, needsOffset } = jointInfo;
                    const parentPos = (poseToCoordinates(newPose) as any)[parent];
                    if (parentPos) {
                        const dx = targetPos.x - parentPos.x;
                        const dy = -(targetPos.y - parentPos.y);
                        let angle = Math.atan2(dy, dx) * (180 / Math.PI);
                        if (angle < 0) angle += 360;
                        if (needsOffset) angle = (angle - 90 + 360) % 360;
                        newPose[angleParam] = angle;
                        if (dragStartPose) {
                            updateChildJoints(newPose, draggedJoint, dragStartPose, useRelativeConstraints);
                        }
                    }
                }
            }
        }
        
        setCurrentPose(newPose);
        if (onPoseChange) {
            onPoseChange(newPose);
        }
    }, [
        draggable, 
        isDragging, 
        draggedJoint, 
        getEventPos, 
        useInverseKinematics, 
        ikChains, 
        onPoseChange, 
        dragStartPose,
        currentPose,
        excludedJoints,
        useRelativeConstraints,
        dragStartOffset
    ]);

    const handleDragEnd = useCallback(() => {
        setIsDragging(false);
        setDraggedJoint(null);
        setDragStartPose(null);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !draggable) return;

        const handleHover = (e: MouseEvent) => {
            if (isDragging) {
                setHoveredJoint(null);
                return;
            }
            const mousePos = getEventPos(e);
            const jointName = getJointAtPosition(mousePos.x, mousePos.y);
            setHoveredJoint(jointName);
        };
        
        const handleLeave = () => {
            setHoveredJoint(null);
        };

        const handleDragStartTyped = (e: MouseEvent | TouchEvent) => handleDragStart(e);
        const handleDragMoveTyped = (e: MouseEvent | TouchEvent) => handleDragMove(e);

        canvas.addEventListener('mousedown', handleDragStartTyped);
        canvas.addEventListener('mousemove', handleDragMoveTyped);
        canvas.addEventListener('mousemove', handleHover);
        canvas.addEventListener('mouseup', handleDragEnd);
        canvas.addEventListener('mouseleave', handleDragEnd);
        canvas.addEventListener('mouseleave', handleLeave);

        canvas.addEventListener('touchstart', handleDragStartTyped, { passive: false });
        canvas.addEventListener('touchmove', handleDragMoveTyped, { passive: false });
        canvas.addEventListener('touchend', handleDragEnd);
        canvas.addEventListener('touchcancel', handleDragEnd);


        return () => {
            canvas.removeEventListener('mousedown', handleDragStartTyped);
            canvas.removeEventListener('mousemove', handleDragMoveTyped);
            canvas.removeEventListener('mousemove', handleHover);
            canvas.removeEventListener('mouseup', handleDragEnd);
            canvas.removeEventListener('mouseleave', handleDragEnd);
            canvas.removeEventListener('mouseleave', handleLeave);
            
            canvas.removeEventListener('touchstart', handleDragStartTyped);
            canvas.removeEventListener('touchmove', handleDragMoveTyped);
            canvas.removeEventListener('touchend', handleDragEnd);
            canvas.removeEventListener('touchcancel', handleDragEnd);
        };
    }, [draggable, handleDragStart, handleDragMove, handleDragEnd, isDragging, getEventPos, getJointAtPosition]);

    return {
        draggedJoint,
        isDragging,
        hoveredJoint,
        currentPose,
        poseCoordinates,
        getEventPos,
        getJointAtPosition
    };
}; 