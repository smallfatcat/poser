// Helper function to convert angle to radians
export const toRadians = (degrees) => degrees * (Math.PI / 180);

// Helper function to calculate point from origin, angle, and distance
export const calculatePoint = (originX, originY, angleDegrees, distance) => {
    const angleRadians = toRadians(angleDegrees);
    return {
        x: originX + distance * Math.cos(angleRadians),
        y: originY - distance * Math.sin(angleRadians) // Flip Y-axis for canvas coordinate system
    };
};

// Function to convert angle-based pose to coordinate-based pose
export const poseToCoordinates = (pose) => {
    const {
        hip,
        torsoAngle,
        headAngle,
        neckLength,
        headRadius,
        leftUpperArmAngle,
        leftLowerArmAngle,
        leftHandAngle,
        rightUpperArmAngle,
        rightLowerArmAngle,
        rightHandAngle,
        leftUpperLegAngle,
        leftLowerLegAngle,
        leftFootAngle,
        rightUpperLegAngle,
        rightLowerLegAngle,
        rightFootAngle,
        shoulderWidth,
        upperArmLength,
        lowerArmLength,
        handLength,
        torsoLength,
        upperLegLength,
        lowerLegLength,
        footLength
    } = pose;

    // Calculate shoulder position (torso goes up from hip)
    const shoulder = calculatePoint(hip.x, hip.y, 90 + torsoAngle, torsoLength);
    
    // Calculate head position (head goes up from shoulder)
    const neck = calculatePoint(shoulder.x, shoulder.y, 90 + headAngle, neckLength);
    const head = calculatePoint(shoulder.x, shoulder.y, 90 + headAngle, neckLength + headRadius);
    
    // Calculate left arm positions
    const leftUpperArm = calculatePoint(shoulder.x, shoulder.y, leftUpperArmAngle, upperArmLength);
    const leftLowerArm = calculatePoint(leftUpperArm.x, leftUpperArm.y, leftLowerArmAngle, lowerArmLength);
    const leftHand = calculatePoint(leftLowerArm.x, leftLowerArm.y, leftHandAngle, handLength);
    
    // Calculate right arm positions
    const rightUpperArm = calculatePoint(shoulder.x, shoulder.y, rightUpperArmAngle, upperArmLength);
    const rightLowerArm = calculatePoint(rightUpperArm.x, rightUpperArm.y, rightLowerArmAngle, lowerArmLength);
    const rightHand = calculatePoint(rightLowerArm.x, rightLowerArm.y, rightHandAngle, handLength);
    
    // Calculate left leg positions
    const leftUpperLeg = calculatePoint(hip.x, hip.y, leftUpperLegAngle, upperLegLength);
    const leftLowerLeg = calculatePoint(leftUpperLeg.x, leftUpperLeg.y, leftLowerLegAngle, lowerLegLength);
    const leftFoot = calculatePoint(leftLowerLeg.x, leftLowerLeg.y, leftFootAngle, footLength);
    
    // Calculate right leg positions
    const rightUpperLeg = calculatePoint(hip.x, hip.y, rightUpperLegAngle, upperLegLength);
    const rightLowerLeg = calculatePoint(rightUpperLeg.x, rightUpperLeg.y, rightLowerLegAngle, lowerLegLength);
    const rightFoot = calculatePoint(rightLowerLeg.x, rightLowerLeg.y, rightFootAngle, footLength);
    
    return {
        head,
        neck,
        shoulder,
        leftUpperArm,
        leftLowerArm,
        leftHand,
        rightUpperArm,
        rightLowerArm,
        rightHand,
        hip,
        leftUpperLeg,
        leftLowerLeg,
        leftFoot,
        rightUpperLeg,
        rightLowerLeg,
        rightFoot
    };
}; 