import { Pose } from '../types';

interface JointInfo {
    parent: string;
    angleParam: string;
    needsOffset: boolean;
}

export const jointHierarchy: { [key: string]: JointInfo } = {
    'head': { parent: 'neck', angleParam: 'headAngle', needsOffset: true },
    'neck': { parent: 'shoulder', angleParam: 'neckAngle', needsOffset: true },
    'shoulder': { parent: 'hip', angleParam: 'torsoAngle', needsOffset: true },
    'leftShoulder': { parent: 'shoulder', angleParam: 'leftShoulderAngle', needsOffset: false },
    'rightShoulder': { parent: 'shoulder', angleParam: 'rightShoulderAngle', needsOffset: false },
    'leftUpperArm': { parent: 'leftShoulder', angleParam: 'leftUpperArmAngle', needsOffset: false },
    'leftLowerArm': { parent: 'leftUpperArm', angleParam: 'leftLowerArmAngle', needsOffset: false },
    'leftHand': { parent: 'leftLowerArm', angleParam: 'leftHandAngle', needsOffset: false },
    'rightUpperArm': { parent: 'rightShoulder', angleParam: 'rightUpperArmAngle', needsOffset: false },
    'rightLowerArm': { parent: 'rightUpperArm', angleParam: 'rightLowerArmAngle', needsOffset: false },
    'rightHand': { parent: 'rightLowerArm', angleParam: 'rightHandAngle', needsOffset: false },
    'leftHip': { parent: 'hip', angleParam: 'leftHipAngle', needsOffset: false },
    'rightHip': { parent: 'hip', angleParam: 'rightHipAngle', needsOffset: false },
    'leftUpperLeg': { parent: 'leftHip', angleParam: 'leftUpperLegAngle', needsOffset: false },
    'leftLowerLeg': { parent: 'leftUpperLeg', angleParam: 'leftLowerLegAngle', needsOffset: false },
    'leftFoot': { parent: 'leftLowerLeg', angleParam: 'leftFootAngle', needsOffset: false },
    'rightUpperLeg': { parent: 'rightHip', angleParam: 'rightUpperLegAngle', needsOffset: false },
    'rightLowerLeg': { parent: 'rightUpperLeg', angleParam: 'rightLowerLegAngle', needsOffset: false },
    'rightFoot': { parent: 'rightLowerLeg', angleParam: 'rightFootAngle', needsOffset: false }
};

export const ikChains = {
    'leftArm': ['hip', 'shoulder', 'leftShoulder', 'leftUpperArm', 'leftLowerArm', 'leftHand'],
    'rightArm': ['hip', 'shoulder', 'rightShoulder', 'rightUpperArm', 'rightLowerArm', 'rightHand'],
    'leftLeg': ['hip', 'leftHip', 'leftUpperLeg', 'leftLowerLeg', 'leftFoot'],
    'rightLeg': ['hip', 'rightHip', 'rightUpperLeg', 'rightLowerLeg', 'rightFoot'],
    'head': ['hip', 'shoulder', 'head']
};

export const boneConnections: [keyof Pose, keyof Pose][] = [
    ['hip', 'shoulder'],
    ['shoulder', 'neck'],
    ['neck', 'head'],
    ['shoulder', 'leftShoulder'],
    ['leftShoulder', 'leftUpperArm'],
    ['leftUpperArm', 'leftLowerArm'],
    ['leftLowerArm', 'leftHand'],
    ['shoulder', 'rightShoulder'],
    ['rightShoulder', 'rightUpperArm'],
    ['rightUpperArm', 'rightLowerArm'],
    ['rightLowerArm', 'rightHand'],
    ['hip', 'leftHip'],
    ['hip', 'rightHip'],
    ['leftHip', 'leftUpperLeg'],
    ['leftUpperLeg', 'leftLowerLeg'],
    ['leftLowerLeg', 'leftFoot'],
    ['rightHip', 'rightUpperLeg'],
    ['rightUpperLeg', 'rightLowerLeg'],
    ['rightLowerLeg', 'rightFoot']
];
