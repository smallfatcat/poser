export interface Vector2 {
    x: number;
    y: number;
}

export type PoseCoordinates = {
    [key: string]: Vector2;
};

export type Pose = {
    [key: string]: number | Vector2;
};

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