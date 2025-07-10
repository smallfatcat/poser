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
    upperArmLength: number;
    lowerArmLength: number;
    handLength: number;
    torsoLength: number;
    upperLegLength: number;
    lowerLegLength: number;
    footLength: number;
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