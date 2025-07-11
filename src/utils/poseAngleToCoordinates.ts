import { Pose, PoseCoordinates, Vector2 } from "../types";

// Helper function to convert angle to radians
export const toRadians = (degrees: number): number => degrees * (Math.PI / 180);

// Helper function to calculate offset from origin, angle, and distance
export const calculateOffset = (angleDegrees: number, distance: number): Vector2 => {
    const angleRadians = toRadians(angleDegrees);
    return {
        x: distance * Math.cos(angleRadians),
        y: -distance * Math.sin(angleRadians) // Flip Y-axis for canvas coordinate system
    };
};

// Function to convert angle-based pose to coordinate-based pose (scaling relative to hip)
export const poseToCoordinates = (pose: Pose, scale: number = 1): PoseCoordinates => {
    const {
        hip,
        torsoAngle,
        headAngle,
        neckLength,
        headRadius,
        leftShoulderAngle,
        rightShoulderAngle,
        leftUpperArmAngle,
        leftLowerArmAngle,
        leftHandAngle,
        rightUpperArmAngle,
        rightLowerArmAngle,
        rightHandAngle,
        leftHipAngle,
        rightHipAngle,
        leftUpperLegAngle,
        leftLowerLegAngle,
        leftFootAngle,
        rightUpperLegAngle,
        rightLowerLegAngle,
        rightFootAngle,
        shoulderWidth,
        // New bone lengths
        leftShoulderLength,
        rightShoulderLength,
        leftHipLength,
        rightHipLength,
        // Left side bone lengths
        leftUpperArmLength,
        leftLowerArmLength,
        leftHandLength,
        // Right side bone lengths
        rightUpperArmLength,
        rightLowerArmLength,
        rightHandLength,
        // Center bone lengths
        torsoLength,
        leftUpperLegLength,
        leftLowerLegLength,
        leftFootLength,
        rightUpperLegLength,
        rightLowerLegLength,
        rightFootLength,
        scale: poseScale = 1
    } = pose;

    if (typeof hip !== 'object' || typeof torsoAngle !== 'number' || typeof headAngle !== 'number' || typeof neckLength !== 'number' || typeof headRadius !== 'number' || typeof leftShoulderAngle !== 'number' || typeof rightShoulderAngle !== 'number' || typeof leftUpperArmAngle !== 'number' || typeof leftLowerArmAngle !== 'number' || typeof leftHandAngle !== 'number' || typeof rightUpperArmAngle !== 'number' || typeof rightLowerArmAngle !== 'number' || typeof rightHandAngle !== 'number' || typeof leftHipAngle !== 'number' || typeof rightHipAngle !== 'number' || typeof leftUpperLegAngle !== 'number' || typeof leftLowerLegAngle !== 'number' || typeof leftFootAngle !== 'number' || typeof rightUpperLegAngle !== 'number' || typeof rightLowerLegAngle !== 'number' || typeof rightFootAngle !== 'number' || typeof leftShoulderLength !== 'number' || typeof rightShoulderLength !== 'number' || typeof leftHipLength !== 'number' || typeof rightHipLength !== 'number' || typeof leftUpperArmLength !== 'number' || typeof leftLowerArmLength !== 'number' || typeof leftHandLength !== 'number' || typeof rightUpperArmLength !== 'number' || typeof rightLowerArmLength !== 'number' || typeof rightHandLength !== 'number' || typeof torsoLength !== 'number' || typeof leftUpperLegLength !== 'number' || typeof leftLowerLegLength !== 'number' || typeof leftFootLength !== 'number' || typeof rightUpperLegLength !== 'number' || typeof rightLowerLegLength !== 'number' || typeof rightFootLength !== 'number') {
        throw new Error("Invalid pose object");
    }

    const totalScale = scale * poseScale;
    // The hip is NOT scaled
    const baseHip = { x: hip.x, y: hip.y };

    // Calculate all offsets from the hip, then apply scale, then add to hip
    // Shoulder (torso goes up from hip)
    const shoulderOffset = calculateOffset(90 + torsoAngle, torsoLength * totalScale);
    const shoulder = { x: baseHip.x + shoulderOffset.x, y: baseHip.y + shoulderOffset.y };

    // Head/neck
    const neckOffset = calculateOffset(90 + headAngle, neckLength * totalScale);
    const neck = { x: shoulder.x + neckOffset.x, y: shoulder.y + neckOffset.y };
    const headOffset = calculateOffset(90 + headAngle, (neckLength + headRadius) * totalScale);
    const head = { x: shoulder.x + headOffset.x, y: shoulder.y + headOffset.y };

    // Left arm
    const leftShoulderOffset = calculateOffset(leftShoulderAngle, leftShoulderLength * totalScale);
    const leftShoulder = { x: shoulder.x + leftShoulderOffset.x, y: shoulder.y + leftShoulderOffset.y };
    const leftUpperArmOffset = calculateOffset(leftUpperArmAngle, leftUpperArmLength * totalScale);
    const leftUpperArm = { x: leftShoulder.x + leftUpperArmOffset.x, y: leftShoulder.y + leftUpperArmOffset.y };
    const leftLowerArmOffset = calculateOffset(leftLowerArmAngle, leftLowerArmLength * totalScale);
    const leftLowerArm = { x: leftUpperArm.x + leftLowerArmOffset.x, y: leftUpperArm.y + leftLowerArmOffset.y };
    const leftHandOffset = calculateOffset(leftHandAngle, leftHandLength * totalScale);
    const leftHand = { x: leftLowerArm.x + leftHandOffset.x, y: leftLowerArm.y + leftHandOffset.y };

    // Right arm
    const rightShoulderOffset = calculateOffset(rightShoulderAngle, rightShoulderLength * totalScale);
    const rightShoulder = { x: shoulder.x + rightShoulderOffset.x, y: shoulder.y + rightShoulderOffset.y };
    const rightUpperArmOffset = calculateOffset(rightUpperArmAngle, rightUpperArmLength * totalScale);
    const rightUpperArm = { x: rightShoulder.x + rightUpperArmOffset.x, y: rightShoulder.y + rightUpperArmOffset.y };
    const rightLowerArmOffset = calculateOffset(rightLowerArmAngle, rightLowerArmLength * totalScale);
    const rightLowerArm = { x: rightUpperArm.x + rightLowerArmOffset.x, y: rightUpperArm.y + rightLowerArmOffset.y };
    const rightHandOffset = calculateOffset(rightHandAngle, rightHandLength * totalScale);
    const rightHand = { x: rightLowerArm.x + rightHandOffset.x, y: rightLowerArm.y + rightHandOffset.y };

    // Left leg
    const leftHipOffset = calculateOffset(leftHipAngle, leftHipLength * totalScale);
    const leftHip = { x: baseHip.x + leftHipOffset.x, y: baseHip.y + leftHipOffset.y };
    const leftUpperLegOffset = calculateOffset(leftUpperLegAngle, leftUpperLegLength * totalScale);
    const leftUpperLeg = { x: leftHip.x + leftUpperLegOffset.x, y: leftHip.y + leftUpperLegOffset.y };
    const leftLowerLegOffset = calculateOffset(leftLowerLegAngle, leftLowerLegLength * totalScale);
    const leftLowerLeg = { x: leftUpperLeg.x + leftLowerLegOffset.x, y: leftUpperLeg.y + leftLowerLegOffset.y };
    const leftFootOffset = calculateOffset(leftFootAngle, leftFootLength * totalScale);
    const leftFoot = { x: leftLowerLeg.x + leftFootOffset.x, y: leftLowerLeg.y + leftFootOffset.y };

    // Right leg
    const rightHipOffset = calculateOffset(rightHipAngle, rightHipLength * totalScale);
    const rightHip = { x: baseHip.x + rightHipOffset.x, y: baseHip.y + rightHipOffset.y };
    const rightUpperLegOffset = calculateOffset(rightUpperLegAngle, rightUpperLegLength * totalScale);
    const rightUpperLeg = { x: rightHip.x + rightUpperLegOffset.x, y: rightHip.y + rightUpperLegOffset.y };
    const rightLowerLegOffset = calculateOffset(rightLowerLegAngle, rightLowerLegLength * totalScale);
    const rightLowerLeg = { x: rightUpperLeg.x + rightLowerLegOffset.x, y: rightUpperLeg.y + rightLowerLegOffset.y };
    const rightFootOffset = calculateOffset(rightFootAngle, rightFootLength * totalScale);
    const rightFoot = { x: rightLowerLeg.x + rightFootOffset.x, y: rightLowerLeg.y + rightFootOffset.y };

    return {
        head,
        neck,
        shoulder,
        leftShoulder,
        rightShoulder,
        leftUpperArm,
        leftLowerArm,
        leftHand,
        rightUpperArm,
        rightLowerArm,
        rightHand,
        hip: baseHip,
        leftHip,
        rightHip,
        leftUpperLeg,
        leftLowerLeg,
        leftFoot,
        rightUpperLeg,
        rightLowerLeg,
        rightFoot
    };
}; 