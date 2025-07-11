import React, { useEffect, useRef, forwardRef, memo } from 'react';
import { ikChains } from '../constants/joints';
import { drawPose, drawJoints } from '../utils/drawing';
import styles from './PoseRenderer.module.css';
import { PoseCoordinates, DrawConfig, StyleConfig, Pose } from '../types';
import { poseToCoordinates } from '../utils/poseAngleToCoordinates';

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
    guidePositions?: { x: number; y: number };
    prevPose?: Pose | null;
    nextPose?: Pose | null;
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
    guidePositions,
    prevPose,
    nextPose,
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
            
            const ghostStyle = { ...styleConfig, strokeColor: 'rgba(0, 255, 0, 0.2)' };
            if (prevPose) {
                drawPose(ctx, poseToCoordinates(prevPose), ghostStyle, drawConfig);
            }
            if (nextPose) {
                drawPose(ctx, poseToCoordinates(nextPose), ghostStyle, drawConfig);
            }

            drawPose(ctx, poseCoordinates, styleConfig, drawConfig);

            if (guidePositions) {
                ctx.save();
                ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
                ctx.lineWidth = 1;
                // Draw vertical guide
                ctx.beginPath();
                ctx.moveTo((guidePositions.x / 100) * width, 0);
                ctx.lineTo((guidePositions.x / 100) * width, height);
                ctx.stroke();
                // Draw horizontal guide
                ctx.beginPath();
                ctx.moveTo(0, (guidePositions.y / 100) * height);
                ctx.lineTo(width, (guidePositions.y / 100) * height);
                ctx.stroke();
                ctx.restore();
            }
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
        shouldClear,
        guidePositions,
        prevPose,
        nextPose,
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