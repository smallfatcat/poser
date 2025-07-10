import { Pose, Vector2 } from "../types";

// Utility functions for pose interpolation and animation

// Interpolate between two numbers
export const interpolate = (start: number, end: number, t: number): number => {
    return start + (end - start) * t;
};

// Interpolate between two angles, taking the shortest path
export const interpolateAngle = (start: number, end: number, t: number): number => {
    let diff = end - start;
    if (diff > 180) {
        diff -= 360;
    } else if (diff < -180) {
        diff += 360;
    }
    return start + diff * t;
};

// Interpolate between two poses
export const interpolatePose = (poseA: Pose, poseB: Pose, t: number): Pose => {
    const interpolatedPose: Pose = { hip: { x: 0, y: 0 } } as Pose;
    
    // Interpolate hip position
    if (typeof poseA.hip === 'object' && typeof poseB.hip === 'object') {
        interpolatedPose.hip = {
            x: interpolate(poseA.hip.x, poseB.hip.x, t),
            y: interpolate(poseA.hip.y, poseB.hip.y, t)
        };
    }
    
    // Interpolate all angles
    const angleProps = [
        'torsoAngle', 'headAngle',
        'leftUpperArmAngle', 'leftLowerArmAngle', 'leftHandAngle',
        'rightUpperArmAngle', 'rightLowerArmAngle', 'rightHandAngle',
        'leftUpperLegAngle', 'leftLowerLegAngle', 'leftFootAngle',
        'rightUpperLegAngle', 'rightLowerLegAngle', 'rightFootAngle'
    ];
    
    angleProps.forEach(prop => {
        if (typeof poseA[prop] === 'number' && typeof poseB[prop] === 'number') {
            interpolatedPose[prop] = interpolateAngle(poseA[prop] as number, poseB[prop] as number, t);
        }
    });
    
    // Interpolate segment lengths
    const lengthProps = [
        'neckLength', 'headRadius', 'shoulderWidth', 'upperArmLength', 'lowerArmLength',
        'handLength', 'torsoLength', 'upperLegLength', 'lowerLegLength', 'footLength'
    ];
    
    lengthProps.forEach(prop => {
        if (typeof poseA[prop] === 'number' && typeof poseB[prop] === 'number') {
            interpolatedPose[prop] = interpolate(poseA[prop] as number, poseB[prop] as number, t);
        }
    });
    
    return interpolatedPose;
};

// Create a pose preset (standing pose)
export const createStandingPose = (hipX = 300, hipY = 200): Pose => ({
    hip: { x: hipX, y: hipY },
    torsoAngle: 0,
    headAngle: 0,
    neckLength: 30,
    headRadius: 15,
    leftUpperArmAngle: 200,
    leftLowerArmAngle: 240,
    leftHandAngle: 270,
    rightUpperArmAngle: 340,
    rightLowerArmAngle: 300,
    rightHandAngle: 270,
    leftUpperLegAngle: 250,
    leftLowerLegAngle: 260,
    leftFootAngle: 180,
    rightUpperLegAngle: 290,
    rightLowerLegAngle: 280,
    rightFootAngle: 0,
    shoulderWidth: 60,
    upperArmLength: 50,
    lowerArmLength: 45,
    handLength: 25,
    torsoLength: 80,
    upperLegLength: 60,
    lowerLegLength: 55,
    footLength: 30
});

// Create a pose preset (walking pose)
export const createWalkingPose = (hipX = 300, hipY = 200): Pose => ({
    hip: { x: hipX, y: hipY },
    torsoAngle: 5,
    headAngle: -5,
    neckLength: 30,
    headRadius: 15,
    leftUpperArmAngle: 210,
    leftLowerArmAngle: 240,
    leftHandAngle: 270,
    rightUpperArmAngle: 330,
    rightLowerArmAngle: 300,
    rightHandAngle: 270,
    leftUpperLegAngle: 240,
    leftLowerLegAngle: 210,
    leftFootAngle: 180,
    rightUpperLegAngle: 300,
    rightLowerLegAngle: 330,
    rightFootAngle: 0,
    shoulderWidth: 60,
    upperArmLength: 50,
    lowerArmLength: 45,
    handLength: 25,
    torsoLength: 80,
    upperLegLength: 60,
    lowerLegLength: 55,
    footLength: 30
});

// Create a dynamic action pose based on the user's image reference
export const createDynamicActionPose = (hipX = 300, hipY = 220): Pose => ({
    hip: { x: hipX, y: hipY },
    torsoAngle: 354.39095320527827,
    headAngle: 352.87072944940746,
    neckLength: 30,
    headRadius: 15,
    leftUpperArmAngle: 227.20426038742943,
    leftLowerArmAngle: 257.20426038742943,
    leftHandAngle: 284.64143851653336,
    rightUpperArmAngle: 280.7885736848833,
    rightLowerArmAngle: 301.379839753169,
    rightHandAngle: 327.5129185251943,
    leftUpperLegAngle: 260.2112248374124,
    leftLowerLegAngle: 250.08344947540064,
    leftFootAngle: 359.7070980008438,
    rightUpperLegAngle: 289.87786972207,
    rightLowerLegAngle: 274.8168901202079,
    rightFootAngle: 359.2944873428671,
    shoulderWidth: 60,
    upperArmLength: 50,
    lowerArmLength: 45,
    handLength: 25,
    torsoLength: 80,
    upperLegLength: 60,
    lowerLegLength: 55,
    footLength: 30
});

// Create a pose preset (sitting pose)
export const createSittingPose = (hipX = 300, hipY = 280): Pose => ({
    hip: { x: hipX, y: hipY },
    torsoAngle: 0,
    headAngle: 0,
    neckLength: 30,
    headRadius: 15,
    leftUpperArmAngle: 240,
    leftLowerArmAngle: 270,
    leftHandAngle: 270,
    rightUpperArmAngle: 300,
    rightLowerArmAngle: 270,
    rightHandAngle: 270,
    leftUpperLegAngle: 180,
    leftLowerLegAngle: 135,
    leftFootAngle: 90,
    rightUpperLegAngle: 0,
    rightLowerLegAngle: 45,
    rightFootAngle: 90,
    shoulderWidth: 60,
    upperArmLength: 50,
    lowerArmLength: 45,
    handLength: 25,
    torsoLength: 80,
    upperLegLength: 60,
    lowerLegLength: 55,
    footLength: 30
});

// Easing functions for smooth animations
export const easing: { [key: string]: (t: number) => number } = {
    linear: t => t,
    easeInQuad: t => t * t,
    easeOutQuad: t => t * (2 - t),
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: t => t * t * t,
    easeOutCubic: t => (--t) * t * t + 1,
    easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
}; 