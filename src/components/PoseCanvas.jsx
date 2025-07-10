import React, { useEffect, useRef } from 'react';
import { ikChains } from '../constants/joints';
import { drawPose, drawJoints } from '../utils/drawing';
import styles from './PoseRenderer.module.css';

const PoseCanvas = ({
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
    canvasRef,
}) => {
    const ctxRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            ctxRef.current = canvas.getContext('2d');
        }
    }, [canvasRef]);

    useEffect(() => {
        const ctx = ctxRef.current;
        if (ctx && poseCoordinates) {
            const drawConfig = {
                draggable,
                isDragging,
                useInverseKinematics,
                draggedJoint,
                hoveredJoint,
                excludedJoints,
                ikChains,
                jointVisibility
            };
            const styleConfig = {
                strokeColor,
                strokeWidth,
                headRadius,
                jointVisibility,
                width,
                height,
                drawJoints
            };
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
};

export default PoseCanvas; 