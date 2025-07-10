import React, { useEffect, useRef, useCallback, useState } from 'react';
import { poseToCoordinates } from '../utils/poseAngleToCoordinates';
import { jointHierarchy, ikChains } from '../constants/joints';
import { calculateInverseKinematics, updateChildJoints } from '../utils/kinematics';
import { drawPose, drawJoints } from '../utils/drawing';
import PoseControls from './PoseControls';

const PoseRenderer = ({ 
    pose, 
    width = 600, 
    height = 400, 
    strokeColor = '#00ff00',
    strokeWidth = 3,
    headRadius = 15,
    className = '',
    style = {},
    onPoseChange = null,
    draggable = false
}) => {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const [currentPose, setCurrentPose] = useState(pose);
    const [draggedJoint, setDraggedJoint] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartPose, setDragStartPose] = useState(null);
    const [dragStartOffset, setDragStartOffset] = useState(null);
    const [dragStartJointPos, setDragStartJointPos] = useState(null);
    const [useRelativeConstraints, setUseRelativeConstraints] = useState(true);
    const [useInverseKinematics, setUseInverseKinematics] = useState(false);
    const [excludedJoints, setExcludedJoints] = useState(new Set());
    const [jointVisibility, setJointVisibility] = useState('always'); // 'always', 'hover', 'never'
    const [hoveredJoint, setHoveredJoint] = useState(null);


    // Convert angle-based pose to coordinates for rendering
    const poseCoordinates = poseToCoordinates(currentPose);

    // Update current pose when prop changes
    useEffect(() => {
        setCurrentPose(pose);
    }, [pose]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            ctxRef.current = canvas.getContext('2d');
        }
    }, []);

    const clearCanvas = useCallback(() => {
        const ctx = ctxRef.current;
        if (ctx) {
            ctx.clearRect(0, 0, width, height);
        }
    }, [width, height]);

    // Get joint at mouse position (using coordinates)
    const getJointAtPosition = useCallback((x, y) => {
        const joints = Object.entries(poseCoordinates);
        const tolerance = 15; // pixels - increased from 10 to 15

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

    
    // Draw joint points - MOVED
    
    // Draw pose - MOVED
    
    useEffect(() => {
        const ctx = ctxRef.current;
        if (ctx && poseCoordinates) {
            const drawConfig = {
                draggable,
                isDragging,
                useInverseKinematics,
                draggedJoint,
                hoveredJoint,
                excludedJoints,
                ikChains,
                jointVisibility
            };
            const styleConfig = {
                strokeColor,
                strokeWidth,
                headRadius,
                jointVisibility,
                width,
                height,
                drawJoints
            };
            drawPose(ctx, poseCoordinates, styleConfig, drawConfig);
        }
    }, [
        poseCoordinates, 
        strokeColor, 
        strokeWidth, 
        headRadius, 
        jointVisibility, 
        draggable, 
        isDragging, 
        useInverseKinematics, 
        draggedJoint, 
        hoveredJoint, 
        excludedJoints, 
        ikChains,
        width,
        height,
        drawJoints
    ]);

    // Mouse event handlers
    const getEventPos = useCallback((e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        
        let clientX, clientY;
        if (e.touches) {
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
    }, []);

    const handleDragStart = useCallback((e) => {
        if (!draggable) return;

        e.preventDefault();
        const pos = getEventPos(e);
        const jointName = getJointAtPosition(pos.x, pos.y);
        
        if (jointName) {
            if (e.ctrlKey) {
                setExcludedJoints(prev => {
                    const newExcluded = new Set(prev);
                    if (newExcluded.has(jointName)) {
                        newExcluded.delete(jointName);
                    } else {
                        newExcluded.add(jointName);
                    }
                    return newExcluded;
                });
                return; // Prevent dragging
            }

            setDraggedJoint(jointName);
            setIsDragging(true);
            setDragStartPose(currentPose);

            const jointPos = poseCoordinates[jointName];
            const mousePos = getEventPos(e);
            
            const dx = mousePos.x - jointPos.x;
            const dy = mousePos.y - jointPos.y;
            setDragStartOffset({ x: dx, y: dy });
            setDragStartJointPos(jointPos);
        }
    }, [draggable, getEventPos, getJointAtPosition, currentPose]);

    const handleDragMove = useCallback((e) => {
        if (!draggable || !isDragging || !draggedJoint) return;

        e.preventDefault();
        const mousePos = getEventPos(e);
        
        // Update the angle-based pose
        let newPose = { ...currentPose };
        
        // Check if we should use inverse kinematics
        if (useInverseKinematics) {
            // Determine which IK chain to use based on the dragged joint
            let ikChain = null;
            if (draggedJoint === 'head') {
                ikChain = ikChains.head;
            } else if (["leftHand", "leftUpperArm", "leftLowerArm"].includes(draggedJoint)) {
                ikChain = ikChains.leftArm;
            } else if (["rightHand", "rightUpperArm", "rightLowerArm"].includes(draggedJoint)) {
                ikChain = ikChains.rightArm;
            } else if (["leftFoot", "leftUpperLeg", "leftLowerLeg"].includes(draggedJoint)) {
                ikChain = ikChains.leftLeg;
            } else if (["rightFoot", "rightUpperLeg", "rightLowerLeg"].includes(draggedJoint)) {
                ikChain = ikChains.rightLeg;
            }
            
            if (ikChain) {
                // Use inverse kinematics with the full chain, passing excluded joints
                newPose = calculateInverseKinematics(mousePos, ikChain, newPose, excludedJoints);
            } else {
                // Fall back to forward kinematics for non-IK joints
                const targetPos = {
                    x: mousePos.x - dragStartOffset.x,
                    y: mousePos.y - dragStartOffset.y
                };

                if (draggedJoint === 'hip') {
                    newPose.hip = { x: targetPos.x, y: targetPos.y };
                } else if (draggedJoint === 'shoulder') {
                    const hipPos = newPose.hip;
                    const dx = targetPos.x - hipPos.x;
                    const dy = -(targetPos.y - hipPos.y);
                    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
                    if (angle < 0) angle += 360;
                    angle = (angle - 90 + 360) % 360;
                    newPose.torsoAngle = angle;
                    updateChildJoints(newPose, 'shoulder', dragStartPose, useRelativeConstraints);
                } else {
                    const jointInfo = jointHierarchy[draggedJoint];
                    if (jointInfo) {
                        const { parent, angleParam, needsOffset } = jointInfo;
                        const parentPos = poseToCoordinates(newPose)[parent];
                        if (parentPos) {
                            const dx = targetPos.x - parentPos.x;
                            const dy = -(targetPos.y - parentPos.y);
                            let angle = Math.atan2(dy, dx) * (180 / Math.PI);
                            if (angle < 0) angle += 360;
                            if (needsOffset) angle = (angle - 90 + 360) % 360;
                            newPose[angleParam] = angle;
                            updateChildJoints(newPose, draggedJoint, dragStartPose, useRelativeConstraints);
                        }
                    }
                }
            }
        } else {
            const targetPos = {
                x: mousePos.x - dragStartOffset.x,
                y: mousePos.y - dragStartOffset.y
            };
            if (draggedJoint === 'hip') {
                newPose.hip = { x: targetPos.x, y: targetPos.y };
            } else if (draggedJoint === 'shoulder') {
                const hipPos = newPose.hip;
                const dx = targetPos.x - hipPos.x;
                const dy = -(targetPos.y - hipPos.y);
                let angle = Math.atan2(dy, dx) * (180 / Math.PI);
                if (angle < 0) angle += 360;
                angle = (angle - 90 + 360) % 360;
                newPose.torsoAngle = angle;
                updateChildJoints(newPose, 'shoulder', dragStartPose, useRelativeConstraints);
            } else {
                const jointInfo = jointHierarchy[draggedJoint];
                if (jointInfo) {
                    const { parent, angleParam, needsOffset } = jointInfo;
                    const parentPos = poseToCoordinates(newPose)[parent];
                    if (parentPos) {
                        const dx = targetPos.x - parentPos.x;
                        const dy = -(targetPos.y - parentPos.y);
                        let angle = Math.atan2(dy, dx) * (180 / Math.PI);
                        if (angle < 0) angle += 360;
                        if (needsOffset) angle = (angle - 90 + 360) % 360;
                        newPose[angleParam] = angle;
                        updateChildJoints(newPose, draggedJoint, dragStartPose, useRelativeConstraints);
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
        poseCoordinates,
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

    // Add event listeners
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !draggable) return;

        const handleHover = (e) => {
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

        // Mouse events
        canvas.addEventListener('mousedown', handleDragStart);
        canvas.addEventListener('mousemove', handleDragMove);
        canvas.addEventListener('mousemove', handleHover);
        canvas.addEventListener('mouseup', handleDragEnd);
        canvas.addEventListener('mouseleave', handleDragEnd);
        canvas.addEventListener('mouseleave', handleLeave);

        // Touch events
        canvas.addEventListener('touchstart', handleDragStart, { passive: false });
        canvas.addEventListener('touchmove', handleDragMove, { passive: false });
        canvas.addEventListener('touchend', handleDragEnd);
        canvas.addEventListener('touchcancel', handleDragEnd);


        return () => {
            // Mouse events
            canvas.removeEventListener('mousedown', handleDragStart);
            canvas.removeEventListener('mousemove', handleDragMove);
            canvas.removeEventListener('mousemove', handleHover);
            canvas.removeEventListener('mouseup', handleDragEnd);
            canvas.removeEventListener('mouseleave', handleDragEnd);
            canvas.removeEventListener('mouseleave', handleLeave);
            
            // Touch events
            canvas.removeEventListener('touchstart', handleDragStart);
            canvas.removeEventListener('touchmove', handleDragMove);
            canvas.removeEventListener('touchend', handleDragEnd);
            canvas.removeEventListener('touchcancel', handleDragEnd);
        };
    }, [draggable, handleDragStart, handleDragMove, handleDragEnd, isDragging, getEventPos, getJointAtPosition]);

    // Function to save pose data as JSON file
    const savePoseData = useCallback(() => {
        const poseData = {
            version: __APP_VERSION__,
            pose: currentPose,
            timestamp: new Date().toISOString(),
            description: "Saved pose data"
        };
        
        const dataStr = JSON.stringify(poseData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `pose_data_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
        link.click();
        
        URL.revokeObjectURL(link.href);
    }, [currentPose]);

    const handlePoseLoad = (e) => {
        const file = e.target.files[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const loadedData = JSON.parse(event.target.result);
                if (loadedData && loadedData.pose) {
                    const newPose = { ...currentPose, ...loadedData.pose };
                    setCurrentPose(newPose);
                    if (onPoseChange) {
                        onPoseChange(newPose);
                    }
                } else {
                    alert('Invalid pose file format. The file should have a "pose" key.');
                }
            } catch (error) {
                alert('Error parsing JSON file.');
            }
        };
        reader.readAsText(file);
        // Reset file input to allow loading the same file twice
        e.target.value = null;
    };

    const handleBoneLengthChange = (boneName, value) => {
        const newPose = {
            ...currentPose,
            [boneName]: value,
        };
        setCurrentPose(newPose);
        if (onPoseChange) {
            onPoseChange(newPose);
        }
    };

    const toggleJointVisibility = () => {
        setJointVisibility(prev => {
            if (prev === 'always') return 'hover';
            if (prev === 'hover') return 'never';
            return 'always';
        });
    };

    const getJointVisibilityText = () => {
        if (jointVisibility === 'always') return 'Joints: Always';
        if (jointVisibility === 'hover') return 'Joints: On Hover';
        return 'Joints: Hidden';
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative', width, height }}>
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className={className}
                style={{ ...style, display: 'block', cursor: draggable ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
            />
            <div style={{ position: 'absolute', bottom: '5px', right: '5px', color: 'grey', fontSize: '10px' }}>
                v{__APP_VERSION__}
            </div>
            </div>
            {draggable && (
                 <PoseControls
                    draggable={draggable}
                    useRelativeConstraints={useRelativeConstraints}
                    setUseRelativeConstraints={setUseRelativeConstraints}
                    useInverseKinematics={useInverseKinematics}
                    setUseInverseKinematics={setUseInverseKinematics}
                    jointVisibility={jointVisibility}
                    toggleJointVisibility={toggleJointVisibility}
                    getJointVisibilityText={getJointVisibilityText}
                    savePoseData={savePoseData}
                    onPoseLoad={handlePoseLoad}
                    boneLengths={currentPose}
                    onBoneLengthChange={handleBoneLengthChange}
                />
            )}
        </div>
    );
};

export default PoseRenderer; 