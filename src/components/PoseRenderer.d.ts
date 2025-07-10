import React from 'react';

export interface PosePoint {
    x: number;
    y: number;
}

export interface PoseCoordinates {
    head: PosePoint;
    neck: PosePoint;
    shoulder: PosePoint;
    leftUpperArm: PosePoint;
    leftLowerArm: PosePoint;
    leftHand: PosePoint;
    rightUpperArm: PosePoint;
    rightLowerArm: PosePoint;
    rightHand: PosePoint;
    hip: PosePoint;
    leftUpperLeg: PosePoint;
    leftLowerLeg: PosePoint;
    leftFoot: PosePoint;
    rightUpperLeg: PosePoint;
    rightLowerLeg: PosePoint;
    rightFoot: PosePoint;
}

export interface PoseAngles {
    // Base position
    hip: PosePoint;
    
    // Angles in degrees
    torsoAngle: number;
    headAngle: number;
    neckLength: number;
    headRadius: number;
    
    // Arm angles
    leftUpperArmAngle: number;
    leftLowerArmAngle: number;
    leftHandAngle: number;
    rightUpperArmAngle: number;
    rightLowerArmAngle: number;
    rightHandAngle: number;
    
    // Leg angles
    leftUpperLegAngle: number;
    leftLowerLegAngle: number;
    leftFootAngle: number;
    rightUpperLegAngle: number;
    rightLowerLegAngle: number;
    rightFootAngle: number;
    
    // Segment lengths
    shoulderWidth: number;
    upperArmLength: number;
    lowerArmLength: number;
    handLength: number;
    torsoLength: number;
    upperLegLength: number;
    lowerLegLength: number;
    footLength: number;
}

export interface PoseRendererProps {
    pose: PoseAngles;
    width?: number;
    height?: number;
    strokeColor?: string;
    strokeWidth?: number;
    headRadius?: number;
    className?: string;
    style?: React.CSSProperties;
    onPoseChange?: (newPose: PoseAngles) => void;
    draggable?: boolean;
}

declare const PoseRenderer: React.FC<PoseRendererProps>;
export default PoseRenderer; 