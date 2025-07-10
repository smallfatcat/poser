import React, { useRef, useCallback, useState } from 'react';
import PoseControls from './PoseControls';
import { usePoseInteraction } from '../hooks/usePoseInteraction';
import PoseCanvas from './PoseCanvas';
import { usePose } from '../context/PoseContext.jsx';
import styles from './PoseRenderer.module.css';

const PoseRenderer = ({ 
    width = 600, 
    height = 400, 
    strokeColor = '#00ff00',
    strokeWidth = 3,
    headRadius = 15,
    className = '',
    style = {},
    draggable = false
}) => {
    const canvasRef = useRef(null);
    const { currentPose: poseFromContext, onPoseChange } = usePose();

    const [useRelativeConstraints, setUseRelativeConstraints] = useState(true);
    const [useInverseKinematics, setUseInverseKinematics] = useState(false);
    const [excludedJoints, setExcludedJoints] = useState(new Set());
    const [jointVisibility, setJointVisibility] = useState('always'); // 'always', 'hover', 'never'

    const {
        draggedJoint,
        isDragging,
        hoveredJoint,
        currentPose,
        poseCoordinates,
        getEventPos,
        getJointAtPosition
    } = usePoseInteraction({
        pose: poseFromContext,
        onPoseChange,
        draggable,
        canvasRef,
        useInverseKinematics,
        excludedJoints,
        useRelativeConstraints,
    });
    
    // Handle ctrl-click to exclude joints
    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !draggable) return;

        const handleMouseDown = (e) => {
            if (e.ctrlKey) {
                const pos = getEventPos(e);
                const jointName = getJointAtPosition(pos.x, pos.y);
                if (jointName) {
                    setExcludedJoints(prev => {
                        const newExcluded = new Set(prev);
                        if (newExcluded.has(jointName)) {
                            newExcluded.delete(jointName);
                        } else {
                            newExcluded.add(jointName);
                        }
                        return newExcluded;
                    });
                }
            }
        };

        canvas.addEventListener('mousedown', handleMouseDown);
        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
        };
    }, [draggable, getEventPos, getJointAtPosition]);


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
        e.target.value = null;
    };

    const handleBoneLengthChange = (boneName, value) => {
        const newPose = {
            ...currentPose,
            [boneName]: value,
        };
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
        <div className={styles.container}>
            <div className={styles.canvasContainer} style={{ width, height }}>
                <PoseCanvas
                    canvasRef={canvasRef}
                    width={width}
                    height={height}
                    poseCoordinates={poseCoordinates}
                    strokeColor={strokeColor}
                    strokeWidth={strokeWidth}
                    headRadius={headRadius}
                    jointVisibility={jointVisibility}
                    draggable={draggable}
                    isDragging={isDragging}
                    useInverseKinematics={useInverseKinematics}
                    draggedJoint={draggedJoint}
                    hoveredJoint={hoveredJoint}
                    excludedJoints={excludedJoints}
                    className={className}
                    style={style}
                />
                <div className={styles.version}>
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