import React, { useRef, useEffect } from 'react';
import { Pose } from '../types';
import { poseToCoordinates } from '../utils/poseAngleToCoordinates';
import { boneConnections } from '../constants/joints';

interface KeyframeThumbnailProps {
    pose: Pose;
    size: number;
    backgroundColor?: string;
    strokeColor?: string;
    canvasWidth: number;
    canvasHeight: number;
}

const KeyframeThumbnail: React.FC<KeyframeThumbnailProps> = ({
    pose,
    size,
    backgroundColor = '#333',
    strokeColor = '#0f0',
    canvasWidth,
    canvasHeight,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const aspectRatio = canvasWidth / canvasHeight;
    const thumbWidth = size;
    const thumbHeight = size / aspectRatio;

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !pose) {
            return;
        }

        const coords = poseToCoordinates(pose);

        const scale = thumbWidth / canvasWidth;
        const offsetX = 0;
        const offsetY = (thumbHeight - canvasHeight * scale) / 2;

        ctx.clearRect(0, 0, thumbWidth, thumbHeight);
        
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, thumbWidth, thumbHeight);

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';

        // Draw bones
        boneConnections.forEach(([startJoint, endJoint]) => {
            const start = coords[startJoint as string];
            const end = coords[endJoint as string];

            if (start && end) {
                ctx.beginPath();
                ctx.moveTo(start.x * scale + offsetX, start.y * scale + offsetY);
                ctx.lineTo(end.x * scale + offsetX, end.y * scale + offsetY);
                ctx.stroke();
            }
        });

        // Draw head
        const headCoord = coords.head;
        if (headCoord) {
            const headRadius = (pose.headRadius || 15) * scale * 0.5;
            ctx.beginPath();
            ctx.arc(
                headCoord.x * scale + offsetX,
                headCoord.y * scale + offsetY,
                headRadius,
                0,
                2 * Math.PI
            );
            ctx.stroke();
        }

    }, [pose, size, backgroundColor, strokeColor, canvasWidth, canvasHeight, thumbWidth, thumbHeight]);

    return (
        <canvas
            ref={canvasRef}
            width={thumbWidth}
            height={thumbHeight}
            style={{ display: 'block' }}
        />
    );
};

export default KeyframeThumbnail; 