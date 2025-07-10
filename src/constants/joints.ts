interface JointInfo {
    parent: string;
    angleParam: string;
    needsOffset: boolean;
}

export const jointHierarchy: { [key: string]: JointInfo } = {
    'head': { parent: 'shoulder', angleParam: 'headAngle', needsOffset: true },
    'neck': { parent: 'shoulder', angleParam: 'headAngle', needsOffset: true },
    'shoulder': { parent: 'hip', angleParam: 'torsoAngle', needsOffset: true },
    'leftUpperArm': { parent: 'shoulder', angleParam: 'leftUpperArmAngle', needsOffset: false },
    'leftLowerArm': { parent: 'leftUpperArm', angleParam: 'leftLowerArmAngle', needsOffset: false },
    'leftHand': { parent: 'leftLowerArm', angleParam: 'leftHandAngle', needsOffset: false },
    'rightUpperArm': { parent: 'shoulder', angleParam: 'rightUpperArmAngle', needsOffset: false },
    'rightLowerArm': { parent: 'rightUpperArm', angleParam: 'rightLowerArmAngle', needsOffset: false },
    'rightHand': { parent: 'rightLowerArm', angleParam: 'rightHandAngle', needsOffset: false },
    'leftUpperLeg': { parent: 'hip', angleParam: 'leftUpperLegAngle', needsOffset: false },
    'leftLowerLeg': { parent: 'leftUpperLeg', angleParam: 'leftLowerLegAngle', needsOffset: false },
    'leftFoot': { parent: 'leftLowerLeg', angleParam: 'leftFootAngle', needsOffset: false },
    'rightUpperLeg': { parent: 'hip', angleParam: 'rightUpperLegAngle', needsOffset: false },
    'rightLowerLeg': { parent: 'rightUpperLeg', angleParam: 'rightLowerLegAngle', needsOffset: false },
    'rightFoot': { parent: 'rightLowerLeg', angleParam: 'rightFootAngle', needsOffset: false }
};

export const ikChains = {
    'leftArm': ['hip', 'shoulder', 'leftUpperArm', 'leftLowerArm', 'leftHand'],
    'rightArm': ['hip', 'shoulder', 'rightUpperArm', 'rightLowerArm', 'rightHand'],
    'leftLeg': ['hip', 'leftUpperLeg', 'leftLowerLeg', 'leftFoot'],
    'rightLeg': ['hip', 'rightUpperLeg', 'rightLowerLeg', 'rightFoot'],
    'head': ['hip', 'shoulder', 'head']
};
