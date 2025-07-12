import React, { useRef, useEffect, useMemo, useState } from 'react';
import { Keyframe } from './PlayheadDisplay';
import { Pose } from '../types';

interface JointAngleGraphProps {
    keyframes: Keyframe[];
    currentTime: number;
    width: number;
    height: number;
    selectedKeyframeId?: string;
    startTime?: number;
    endTime?: number;
}

interface JointData {
    name: string;
    key: keyof Pose;
    color: string;
    label: string;
}

const JointAngleGraph: React.FC<JointAngleGraphProps> = ({
    keyframes,
    currentTime,
    width,
    height,
    selectedKeyframeId,
    startTime = 0,
    endTime
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hiddenJoints, setHiddenJoints] = useState<Set<keyof Pose>>(new Set());

    // Define which joints to plot and their colors
    const jointsToPlot: JointData[] = useMemo(() => [
        { name: 'Torso', key: 'torsoAngle', color: '#FF6B6B', label: 'Torso' },
        { name: 'Head', key: 'headAngle', color: '#4ECDC4', label: 'Head' },
        { name: 'Left Shoulder', key: 'leftShoulderAngle', color: '#45B7D1', label: 'L Shoulder' },
        { name: 'Right Shoulder', key: 'rightShoulderAngle', color: '#96CEB4', label: 'R Shoulder' },
        { name: 'Left Upper Arm', key: 'leftUpperArmAngle', color: '#FFEAA7', label: 'L Upper Arm' },
        { name: 'Right Upper Arm', key: 'rightUpperArmAngle', color: '#DDA0DD', label: 'R Upper Arm' },
        { name: 'Left Lower Arm', key: 'leftLowerArmAngle', color: '#98D8C8', label: 'L Lower Arm' },
        { name: 'Right Lower Arm', key: 'rightLowerArmAngle', color: '#F7DC6F', label: 'R Lower Arm' },
        { name: 'Left Hand', key: 'leftHandAngle', color: '#E74C3C', label: 'L Hand' },
        { name: 'Right Hand', key: 'rightHandAngle', color: '#9B59B6', label: 'R Hand' },
        { name: 'Left Hip', key: 'leftHipAngle', color: '#BB8FCE', label: 'L Hip' },
        { name: 'Right Hip', key: 'rightHipAngle', color: '#85C1E9', label: 'R Hip' },
        { name: 'Left Upper Leg', key: 'leftUpperLegAngle', color: '#F8C471', label: 'L Upper Leg' },
        { name: 'Right Upper Leg', key: 'rightUpperLegAngle', color: '#82E0AA', label: 'R Upper Leg' },
        { name: 'Left Lower Leg', key: 'leftLowerLegAngle', color: '#F1948A', label: 'L Lower Leg' },
        { name: 'Right Lower Leg', key: 'rightLowerLegAngle', color: '#85C1E9', label: 'R Lower Leg' },
    ], []);

    // Calculate the range of angles across all keyframes
    const angleRange = useMemo(() => {
        // Show full 360-degree range from 0 to 360
        return { min: 0, max: 360 };
    }, []);

    // Calculate the time range
    const timeRange = useMemo(() => {
        if (keyframes.length === 0) {
            return { min: startTime, max: endTime || 5000 };
        }
        
        const times = keyframes.map(k => k.time);
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);
        
        // Use the provided start and end times, but ensure we cover all keyframes
        return {
            min: Math.min(startTime, minTime),
            max: Math.max(endTime || maxTime, maxTime)
        };
    }, [keyframes, startTime, endTime]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Set up canvas for high DPI displays
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        // Set canvas CSS size to match the display size
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        // Draw background
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(0, 0, width, height);

        // Draw grid
        drawGrid(ctx, width, height, timeRange, angleRange);

        // Draw joint angle lines (only visible joints)
        jointsToPlot.forEach((joint, index) => {
            if (!hiddenJoints.has(joint.key)) {
                drawJointLine(ctx, keyframes, joint, timeRange, angleRange, width, height, index);
            }
        });

        // Draw current time indicator
        drawCurrentTimeIndicator(ctx, currentTime, timeRange, width, height);

        // Draw legend
        drawLegend(ctx, jointsToPlot, width, height);

    }, [keyframes, currentTime, width, height, timeRange, angleRange, jointsToPlot, selectedKeyframeId, hiddenJoints]);

    const handleLegendClick = (jointKey: keyof Pose) => {
        setHiddenJoints(prev => {
            const newSet = new Set(prev);
            if (newSet.has(jointKey)) {
                newSet.delete(jointKey);
            } else {
                newSet.add(jointKey);
            }
            return newSet;
        });
    };

    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // Check if click is in legend area
        const legendY = height - 20;
        if (clickY >= legendY - 60 && clickY <= legendY) {
            const itemsPerRow = 7;
            const itemWidth = width / itemsPerRow;
            const itemHeight = 15;

            jointsToPlot.forEach((joint, index) => {
                const row = Math.floor(index / itemsPerRow);
                const col = index % itemsPerRow;
                const x = col * itemWidth + 10;
                const y = legendY - (row + 1) * itemHeight;

                // Check if click is within this legend item
                if (clickX >= x && clickX <= x + 80 && clickY >= y && clickY <= y + itemHeight) {
                    handleLegendClick(joint.key);
                }
            });
        }
    };

    const handleShowHideAll = () => {
        if (hiddenJoints.size === 0) {
            // All are visible, hide all
            setHiddenJoints(new Set(jointsToPlot.map(joint => joint.key)));
        } else {
            // Some or all are hidden, show all
            setHiddenJoints(new Set());
        }
    };

    const drawGrid = (
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        timeRange: { min: number; max: number },
        angleRange: { min: number; max: number }
    ) => {
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;

        // Vertical lines (time) - align with timeline
        const timeStep = Math.max(1000, (timeRange.max - timeRange.min) / 10);
        for (let time = timeRange.min; time <= timeRange.max; time += timeStep) {
            const x = ((time - timeRange.min) / (timeRange.max - timeRange.min)) * width;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height - 60); // Leave space for legend
            ctx.stroke();

            // Draw time labels
            ctx.fillStyle = '#888';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${(time / 1000).toFixed(1)}s`, x, height - 40);
        }

        // Horizontal lines (angles) - show full 360-degree range
        const angleStep = 45; // Show every 45 degrees for better readability
        for (let angle = angleRange.min; angle <= angleRange.max; angle += angleStep) {
            const y = height - 60 - ((angle - angleRange.min) / (angleRange.max - angleRange.min)) * (height - 60);
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();

            // Draw angle labels
            ctx.fillStyle = '#888';
            ctx.font = '10px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(`${angle}°`, width - 5, y + 3);
        }

        // Draw center line at 180 degrees (middle of 0-360 range)
        const centerY = height - 60 - ((180 - angleRange.min) / (angleRange.max - angleRange.min)) * (height - 60);
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
    };

    const drawJointLine = (
        ctx: CanvasRenderingContext2D,
        keyframes: Keyframe[],
        joint: JointData,
        timeRange: { min: number; max: number },
        angleRange: { min: number; max: number },
        width: number,
        height: number,
        jointIndex: number
    ) => {
        if (keyframes.length < 2) return;

        const sortedKeyframes = [...keyframes].sort((a, b) => a.time - b.time);
        
        // First, draw the connecting lines
        ctx.strokeStyle = joint.color;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();

        sortedKeyframes.forEach((keyframe, index) => {
            const angle = keyframe.pose[joint.key];
            if (typeof angle !== 'number') return;

            const x = ((keyframe.time - timeRange.min) / (timeRange.max - timeRange.min)) * width;
            const y = height - 60 - ((angle - angleRange.min) / (angleRange.max - angleRange.min)) * (height - 60);

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Then, draw the keyframe points
        sortedKeyframes.forEach((keyframe) => {
            const angle = keyframe.pose[joint.key];
            if (typeof angle !== 'number') return;

            const x = ((keyframe.time - timeRange.min) / (timeRange.max - timeRange.min)) * width;
            const y = height - 60 - ((angle - angleRange.min) / (angleRange.max - angleRange.min)) * (height - 60);

            // Draw keyframe points
            ctx.fillStyle = joint.color;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();

            // Highlight selected keyframe
            if (keyframe.id === selectedKeyframeId) {
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(x, y, 6, 0, 2 * Math.PI);
                ctx.stroke();
                ctx.strokeStyle = joint.color;
                ctx.lineWidth = 2;
            }
        });
    };

    const drawCurrentTimeIndicator = (
        ctx: CanvasRenderingContext2D,
        currentTime: number,
        timeRange: { min: number; max: number },
        width: number,
        height: number
    ) => {
        const x = ((currentTime - timeRange.min) / (timeRange.max - timeRange.min)) * width;
        
        ctx.strokeStyle = '#61dafb';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height - 60);
        ctx.stroke();
        
        ctx.setLineDash([]);
    };

    const drawLegend = (
        ctx: CanvasRenderingContext2D,
        joints: JointData[],
        width: number,
        height: number
    ) => {
        const legendY = height - 20;
        const itemsPerRow = 7;
        const itemWidth = width / itemsPerRow;
        const itemHeight = 15;

        joints.forEach((joint, index) => {
            const row = Math.floor(index / itemsPerRow);
            const col = index % itemsPerRow;
            const x = col * itemWidth + 10;
            const y = legendY - (row + 1) * itemHeight;

            const isHidden = hiddenJoints.has(joint.key);

            // Draw color indicator with opacity for hidden joints
            ctx.fillStyle = isHidden ? '#666' : joint.color;
            ctx.globalAlpha = isHidden ? 0.5 : 1;
            ctx.fillRect(x, y, 10, 10);
            ctx.globalAlpha = 1;

            // Draw label with different color for hidden joints
            ctx.fillStyle = isHidden ? '#666' : '#e0e0e0';
            ctx.font = '10px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(joint.label, x + 15, y + 8);
        });
    };

    return (
        <div className="rounded">
            <div className="flex items-center justify-between mb-2">
                <div className="text-text-primary text-sm font-medium">Joint Angles</div>
                <button
                    onClick={handleShowHideAll}
                    className={`px-2 py-1 text-xs rounded border transition-colors ${
                        hiddenJoints.size === 0
                            ? 'bg-red-600 text-white border-red-600 hover:bg-red-700'
                            : 'bg-green-600 text-white border-green-600 hover:bg-green-700'
                    }`}
                >
                    {hiddenJoints.size === 0 ? 'Hide All' : 'Show All'}
                </button>
            </div>
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className="block cursor-pointer"
                onClick={handleCanvasClick}
            />
        </div>
    );
};

export default JointAngleGraph; 