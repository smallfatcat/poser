import { useState, useCallback, useEffect, RefObject } from 'react';
import { poseToCoordinates } from '../utils/poseAngleToCoordinates';
import { jointHierarchy, ikChains } from '../constants/joints';
import { calculateInverseKinematics, updateChildJoints, calculateBoneLengthsFromPositions } from '../utils/kinematics';
import { Pose, Vector2, PoseCoordinates, IkChains } from '../types';

interface UsePoseInteractionProps {
    pose: Pose;
    onPoseChange: (pose: Pose) => void;
    draggable: boolean;
    canvasRef: RefObject<HTMLCanvasElement>;
    useInverseKinematics: boolean;
    excludedJoints: Set<string>;
    useRelativeConstraints: boolean;
    disableConstraints: boolean;
    guidePositions: { x: number; y: number };
    setGuidePositions: (positions: { x: number; y: number }) => void;
    width: number;
    height: number;
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
    disableConstraints,
    guidePositions,
    setGuidePositions,
    width,
    height,
}: UsePoseInteractionProps): UsePoseInteractionReturn => {
    const [currentPose, setCurrentPose] = useState<Pose>(pose);
    const [draggedJoint, setDraggedJoint] = useState<string | null>(null);
    const [draggedGuide, setDraggedGuide] = useState<'x' | 'y' | null>(null);
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
            return;
        }

        const guideXPos = (guidePositions.x / 100) * width;
        const guideYPos = (guidePositions.y / 100) * height;
        const guideTolerance = 5;

        if (Math.abs(pos.x - guideXPos) < guideTolerance) {
            setDraggedGuide('x');
        } else if (Math.abs(pos.y - guideYPos) < guideTolerance) {
            setDraggedGuide('y');
        }
    }, [draggable, getEventPos, getJointAtPosition, currentPose, poseCoordinates, guidePositions, width, height]);

    const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!draggable) return;

        if (draggedGuide) {
            const pos = getEventPos(e);
            if (draggedGuide === 'x') {
                const newX = (pos.x / width) * 100;
                setGuidePositions({ ...guidePositions, x: Math.max(0, Math.min(100, newX)) });
            } else {
                const newY = (pos.y / height) * 100;
                setGuidePositions({ ...guidePositions, y: Math.max(0, Math.min(100, newY)) });
            }
            return;
        }

        if (!isDragging || !draggedJoint) return;

        e.preventDefault();
        const mousePos = getEventPos(e);
        
        let newPose = JSON.parse(JSON.stringify(currentPose)); // Deep copy
        
        // Handle unconstrained dragging (disableConstraints = true)
        if (disableConstraints) {
            const targetPos = {
                x: mousePos.x - (dragStartOffset ? dragStartOffset.x : 0),
                y: mousePos.y - (dragStartOffset ? dragStartOffset.y : 0)
            };

            if (draggedJoint === 'hip') {
                newPose.hip = { x: targetPos.x, y: targetPos.y };
            } else if (draggedJoint === 'neck') {
                // Special case for neck: update neckAngle and neckLength relative to shoulder
                const parentPos = (poseToCoordinates(newPose) as any)['shoulder'];
                if (parentPos) {
                    const dx = targetPos.x - parentPos.x;
                    const dy = -(targetPos.y - parentPos.y);
                    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
                    if (angle < 0) angle += 360;
                    angle = (angle - 90 + 360) % 360;
                    newPose.neckAngle = angle;
                    // Update neckLength
                    const dxLen = targetPos.x - parentPos.x;
                    const dyLen = targetPos.y - parentPos.y;
                    const length = Math.sqrt(dxLen * dxLen + dyLen * dyLen) / (newPose.scale || 1);
                    newPose.neckLength = length;
                }
            } else {
                // For all other joints, update angle and bone length from parent
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
                        // Update bone length
                        const dxLen = targetPos.x - parentPos.x;
                        const dyLen = targetPos.y - parentPos.y;
                        const length = Math.sqrt(dxLen * dxLen + dyLen * dyLen) / (newPose.scale || 1);
                        // Find the correct length key
                        const boneLengthMap: { [key: string]: string } = {
                            'hip-shoulder': 'torsoLength',
                            'shoulder-neck': 'neckLength',
                            'shoulder-leftShoulder': 'leftShoulderLength',
                            'leftShoulder-leftUpperArm': 'leftUpperArmLength',
                            'leftUpperArm-leftLowerArm': 'leftLowerArmLength',
                            'leftLowerArm-leftHand': 'leftHandLength',
                            'shoulder-rightShoulder': 'rightShoulderLength',
                            'rightShoulder-rightUpperArm': 'rightUpperArmLength',
                            'rightUpperArm-rightLowerArm': 'rightLowerArmLength',
                            'rightLowerArm-rightHand': 'rightHandLength',
                            'hip-leftHip': 'leftHipLength',
                            'leftHip-leftUpperLeg': 'leftUpperLegLength',
                            'leftUpperLeg-leftLowerLeg': 'leftLowerLegLength',
                            'leftLowerLeg-leftFoot': 'leftFootLength',
                            'hip-rightHip': 'rightHipLength',
                            'rightHip-rightUpperLeg': 'rightUpperLegLength',
                            'rightUpperLeg-rightLowerLeg': 'rightLowerLegLength',
                            'rightLowerLeg-rightFoot': 'rightFootLength',
                        };
                        const boneKey = `${parent}-${draggedJoint}`;
                        const lengthKey = boneLengthMap[boneKey];
                        if (lengthKey) {
                            newPose[lengthKey] = length;
                        }
                    }
                }
            }
            // Calculate new bone lengths from the updated joint positions
            const updatedCoordinates = poseToCoordinates(newPose);
            const newBoneLengths = calculateBoneLengthsFromPositions(updatedCoordinates, newPose);
            // Update the pose with new bone lengths
            Object.assign(newPose, newBoneLengths);
        } else if (useInverseKinematics) {
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
                    // Hip is now always in original coordinates, no conversion needed
                    newPose.hip = { 
                        x: targetPos.x, 
                        y: targetPos.y 
                    };
                } else if (draggedJoint === 'shoulder' && typeof newPose.hip === 'object') {
                    // Use scaled hip position for angle calculations (since targetPos is in scaled coordinates)
                    const scale = newPose.scale || 1;
                    const scaledHipPos = { 
                        x: newPose.hip.x * scale, 
                        y: newPose.hip.y * scale 
                    };
                    const dx = targetPos.x - scaledHipPos.x;
                    const dy = -(targetPos.y - scaledHipPos.y);
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
                // Hip is now always in original coordinates, no conversion needed
                newPose.hip = { 
                    x: targetPos.x, 
                    y: targetPos.y 
                };
            } else if (draggedJoint === 'shoulder' && typeof newPose.hip === 'object') {
                // Use scaled hip position for angle calculations (since targetPos is in scaled coordinates)
                const scale = newPose.scale || 1;
                const scaledHipPos = { 
                    x: newPose.hip.x * scale, 
                    y: newPose.hip.y * scale 
                };
                const dx = targetPos.x - scaledHipPos.x;
                const dy = -(targetPos.y - scaledHipPos.y);
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
        disableConstraints,
        dragStartOffset,
        draggedGuide,
        guidePositions,
        setGuidePositions,
        width,
        height,
    ]);

    const handleDragEnd = useCallback(() => {
        setIsDragging(false);
        setDraggedJoint(null);
        setDragStartPose(null);
        setDraggedGuide(null);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !draggable) return;

        const handleHover = (e: MouseEvent) => {
            if (isDragging || draggedGuide) {
                setHoveredJoint(null);
                return;
            }
            const mousePos = getEventPos(e);
            const jointName = getJointAtPosition(mousePos.x, mousePos.y);
            setHoveredJoint(jointName);

            const guideXPos = (guidePositions.x / 100) * width;
            const guideYPos = (guidePositions.y / 100) * height;
            const guideTolerance = 5;

            if (jointName) {
                canvas.style.cursor = 'grab';
            } else if (Math.abs(mousePos.x - guideXPos) < guideTolerance) {
                canvas.style.cursor = 'ew-resize';
            } else if (Math.abs(mousePos.y - guideYPos) < guideTolerance) {
                canvas.style.cursor = 'ns-resize';
            } else {
                canvas.style.cursor = 'default';
            }
        };
        
        const handleLeave = () => {
            setHoveredJoint(null);
            canvas.style.cursor = 'default';
        };

        const handleDragStartTyped = (e: MouseEvent | TouchEvent) => handleDragStart(e);
        const handleDragMoveTyped = (e: MouseEvent | TouchEvent) => handleDragMove(e);

        canvas.addEventListener('mousedown', handleDragStartTyped);
        canvas.addEventListener('touchstart', handleDragStartTyped, { passive: false });
        
        window.addEventListener('mousemove', handleDragMoveTyped);
        window.addEventListener('touchmove', handleDragMoveTyped, { passive: false });

        window.addEventListener('mouseup', handleDragEnd);
        window.addEventListener('touchend', handleDragEnd);

        canvas.addEventListener('mousemove', handleHover);
        canvas.addEventListener('mouseleave', handleLeave);

        return () => {
            canvas.removeEventListener('mousedown', handleDragStartTyped);
            canvas.removeEventListener('touchstart', handleDragStartTyped);

            window.removeEventListener('mousemove', handleDragMoveTyped);
            window.removeEventListener('touchmove', handleDragMoveTyped);

            window.removeEventListener('mouseup', handleDragEnd);
            window.removeEventListener('touchend', handleDragEnd);

            canvas.removeEventListener('mousemove', handleHover);
            canvas.removeEventListener('mouseleave', handleLeave);
        };
    }, [
        canvasRef, 
        draggable, 
        getEventPos, 
        handleDragStart, 
        handleDragMove, 
        handleDragEnd, 
        getJointAtPosition, 
        isDragging,
        draggedGuide,
        guidePositions,
        width,
        height
    ]);

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