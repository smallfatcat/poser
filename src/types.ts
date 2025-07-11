export interface Vector2 {
    x: number;
    y: number;
}

export type PoseCoordinates = {
    [key: string]: Vector2;
};

export interface Pose {
    hip: Vector2;
    torsoAngle: number;
    headAngle: number;
    neckLength: number;
    headRadius: number;
    leftUpperArmAngle: number;
    leftLowerArmAngle: number;
    leftHandAngle: number;
    rightUpperArmAngle: number;
    rightLowerArmAngle: number;
    rightHandAngle: number;
    leftUpperLegAngle: number;
    leftLowerLegAngle: number;
    leftFootAngle: number;
    rightUpperLegAngle: number;
    rightLowerLegAngle: number;
    rightFootAngle: number;
    shoulderWidth: number;
    // Left side bone lengths
    leftUpperArmLength: number;
    leftLowerArmLength: number;
    leftHandLength: number;
    // Right side bone lengths
    rightUpperArmLength: number;
    rightLowerArmLength: number;
    rightHandLength: number;
    // Center bone lengths
    torsoLength: number;
    leftUpperLegLength: number;
    leftLowerLegLength: number;
    leftFootLength: number;
    rightUpperLegLength: number;
    rightLowerLegLength: number;
    rightFootLength: number;
    scale: number;
    [key: string]: number | Vector2; // Keep flexible for interpolation
}

export interface IkChains {
    [key: string]: string[];
}

export interface DrawConfig {
    draggable: boolean;
    isDragging: boolean;
    useInverseKinematics: boolean;
    draggedJoint: string | null;
    hoveredJoint: string | null;
    excludedJoints: Set<string>;
    ikChains: IkChains;
    jointVisibility: 'always' | 'hover' | 'never';
}

export interface StyleConfig {
    strokeColor: string;
    strokeWidth: number;
    headRadius: number;
    jointVisibility: 'always' | 'hover' | 'never';
    drawJoints: (ctx: CanvasRenderingContext2D, poseCoordinates: PoseCoordinates, drawConfig: DrawConfig) => void;
    width: number;
    height: number;
} 