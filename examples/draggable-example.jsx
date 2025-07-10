import React, { useState } from 'react';
import PoseRenderer from '../src/components/PoseRenderer';

const examplePose = {
    head: { x: 300, y: 100 },
    neck: { x: 300, y: 130 },
    shoulder: { x: 300, y: 150 },
    leftUpperArm: { x: 270, y: 180 },
    leftLowerArm: { x: 250, y: 225 },
    leftHand: { x: 250, y: 250 },
    rightUpperArm: { x: 330, y: 180 },
    rightLowerArm: { x: 350, y: 225 },
    rightHand: { x: 350, y: 250 },
    hip: { x: 300, y: 230 },
    leftUpperLeg: { x: 280, y: 290 },
    leftLowerLeg: { x: 275, y: 345 },
    leftFoot: { x: 245, y: 345 },
    rightUpperLeg: { x: 320, y: 290 },
    rightLowerLeg: { x: 325, y: 345 },
    rightFoot: { x: 355, y: 345 }
};

function DraggableExample() {
    const [pose, setPose] = useState(examplePose);
    const [poseHistory, setPoseHistory] = useState([]);

    const handlePoseChange = (newPose) => {
        setPose(newPose);
        // Keep a history of the last 10 poses
        setPoseHistory(prev => [...prev.slice(-9), newPose]);
    };

    const resetPose = () => {
        setPose(examplePose);
        setPoseHistory([]);
    };

    const savePose = () => {
        const poseData = JSON.stringify(pose, null, 2);
        // You could save this to localStorage or send to a server
        localStorage.setItem('savedPose', poseData);
        alert('Pose saved!');
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Draggable Pose Editor</h1>
            <p>Drag the white dots to move joints. The pose state is maintained in the parent component.</p>
            
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <button onClick={resetPose} style={{ padding: '10px 20px' }}>
                    Reset Pose
                </button>
                <button onClick={savePose} style={{ padding: '10px 20px' }}>
                    Save Pose
                </button>
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
                <div>
                    <h3>Interactive Canvas</h3>
                    <PoseRenderer 
                        pose={pose}
                        draggable={true}
                        onPoseChange={handlePoseChange}
                        strokeColor="#00ff00"
                        strokeWidth={3}
                    />
                </div>
                
                <div>
                    <h3>Pose Data</h3>
                    <pre style={{ 
                        background: '#f5f5f5', 
                        padding: '10px', 
                        borderRadius: '5px',
                        fontSize: '12px',
                        maxHeight: '400px',
                        overflow: 'auto'
                    }}>
                        {JSON.stringify(pose, null, 2)}
                    </pre>
                </div>
            </div>

            {poseHistory.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                    <h3>Pose History ({poseHistory.length} changes)</h3>
                    <p>Last modified joint: {poseHistory.length > 0 ? 
                        Object.keys(poseHistory[poseHistory.length - 1]).find(key => 
                            poseHistory[poseHistory.length - 1][key] !== 
                            (poseHistory[poseHistory.length - 2]?.[key] || pose[key])
                        ) : 'None'}</p>
                </div>
            )}
        </div>
    );
}

export default DraggableExample; 