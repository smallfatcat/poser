import React from 'react';
import PoseRenderer from '../src/components/PoseRenderer';

// Example pose data
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

// Basic usage
function BasicExample() {
    return (
        <div>
            <h1>Basic Pose Renderer</h1>
            <PoseRenderer pose={examplePose} />
        </div>
    );
}

// Custom styling example
function CustomStylingExample() {
    return (
        <div>
            <h1>Custom Styled Pose</h1>
            <PoseRenderer 
                pose={examplePose}
                strokeColor="#ff0000"
                strokeWidth={5}
                headRadius={20}
                style={{ border: '2px solid #333' }}
            />
        </div>
    );
}

// Multiple poses example
function MultiplePosesExample() {
    return (
        <div>
            <h1>Multiple Poses</h1>
            <div style={{ display: 'flex', gap: '20px' }}>
                <PoseRenderer pose={examplePose} strokeColor="#ff0000" />
                <PoseRenderer pose={examplePose} strokeColor="#00ff00" />
                <PoseRenderer pose={examplePose} strokeColor="#0000ff" />
            </div>
        </div>
    );
}

export { BasicExample, CustomStylingExample, MultiplePosesExample }; 