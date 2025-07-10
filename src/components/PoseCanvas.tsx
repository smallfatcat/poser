import React, { useEffect, useRef, forwardRef, memo } from 'react';
import { ikChains } from '../constants/joints';
import { drawPose, drawJoints } from '../utils/drawing';
import styles from './PoseRenderer.module.css';
import { PoseCoordinates, DrawConfig, StyleConfig } from '../types';

interface PoseCanvasProps {
    width: number;
    height: number;
    poseCoordinates: PoseCoordinates;
    strokeColor: string;
    strokeWidth: number;
    headRadius: number;
    jointVisibility: 'always' | 'hover' | 'never';
    draggable: boolean;
    isDragging: boolean;
    useInverseKinematics: boolean;
    draggedJoint: string | null;
    hoveredJoint: string | null;
    excludedJoints: Set<string>;
    className: string;
    style: React.CSSProperties;
    shouldClear?: boolean;
}

const PoseCanvasComponent = forwardRef<HTMLCanvasElement, PoseCanvasProps>(({
    width,
    height,
    poseCoordinates,
    strokeColor,
    strokeWidth,
    headRadius,
    jointVisibility,
    draggable,
    isDragging,
    useInverseKinematics,
    draggedJoint,
    hoveredJoint,
    excludedJoints,
    className,
    style,
    shouldClear = true,
}, ref) => {
    const internalRef = useRef<HTMLCanvasElement>(null);
    const canvasRef = (ref as React.RefObject<HTMLCanvasElement>) || internalRef;
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            ctxRef.current = canvas.getContext('2d');
        }
    }, [canvasRef]);

    useEffect(() => {
        const ctx = ctxRef.current;
        if (ctx && poseCoordinates) {
            const drawConfig: DrawConfig = {
                draggable,
                isDragging,
                useInverseKinematics,
                draggedJoint,
                hoveredJoint,
                excludedJoints,
                ikChains,
                jointVisibility
            };
            const styleConfig: StyleConfig = {
                strokeColor,
                strokeWidth,
                headRadius,
                jointVisibility,
                width,
                height,
                drawJoints
            };
            if(shouldClear) {
                ctx.clearRect(0, 0, width, height);
            }
            drawPose(ctx, poseCoordinates, styleConfig, drawConfig);
        }
    }, [
        poseCoordinates, 
        strokeColor, 
        strokeWidth, 
        headRadius, 
        jointVisibility, 
        draggable, 
        isDragging, 
        useInverseKinematics, 
        draggedJoint, 
        hoveredJoint, 
        excludedJoints,
        ikChains,
        width,
        height,
        shouldClear
    ]);

    const canvasClasses = [
        styles.canvas,
        className,
        draggable ? styles.draggable : '',
        isDragging ? styles.dragging : ''
    ].join(' ');

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className={canvasClasses}
            style={style}
        />
    );
});

export default memo(PoseCanvasComponent); 