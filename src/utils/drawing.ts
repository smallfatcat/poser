import { PoseCoordinates, DrawConfig, StyleConfig } from "../types";
import { boneConnections } from "../constants/joints";

// Draw joint points
export const drawJoints = (
    ctx: CanvasRenderingContext2D, 
    poseCoordinates: PoseCoordinates, 
    { 
        draggable, 
        isDragging, 
        useInverseKinematics, 
        draggedJoint, 
        hoveredJoint, 
        excludedJoints, 
        ikChains, 
        jointVisibility 
    }: DrawConfig
) => {
    if (!draggable) return;

    let activeIkChain: string[] = [];
    if (isDragging && useInverseKinematics && draggedJoint) {
        let chain: string[] | undefined = undefined;
        if (draggedJoint === 'head') {
            chain = ikChains.head;
        } else if (["leftHand", "leftUpperArm", "leftLowerArm"].includes(draggedJoint)) {
            chain = ikChains.leftArm;
        } else if (["rightHand", "rightUpperArm", "rightLowerArm"].includes(draggedJoint)) {
            chain = ikChains.rightArm;
        } else if (["leftFoot", "leftUpperLeg", "leftLowerLeg"].includes(draggedJoint)) {
            chain = ikChains.leftLeg;
        } else if (["rightFoot", "rightUpperLeg", "rightLowerLeg"].includes(draggedJoint)) {
            chain = ikChains.rightLeg;
        }
        if (chain) {
            activeIkChain = chain.filter(j => !excludedJoints.has(j));
        }
    }

    Object.entries(poseCoordinates).forEach(([jointName, jointPos]) => {
        if (jointVisibility === 'hover' && jointName !== hoveredJoint) {
            return;
        }
        const isDragged = draggedJoint === jointName;
        const isHovered = jointName === hoveredJoint && !isDragging;
        const isExcluded = excludedJoints.has(jointName);
        const isInIkChain = activeIkChain.includes(jointName);
        const radius = isDragged ? 8 : (isHovered ? 7 : 6);
        
        if (isDragged) {
            ctx.fillStyle = '#ff6600'; // Orange for dragged joint
            ctx.strokeStyle = '#cc3300';
        } else if (isHovered) {
            ctx.fillStyle = '#ffff00'; // Yellow for hovered joint
            ctx.strokeStyle = '#f0d000';
        } else if (isExcluded) {
            ctx.fillStyle = '#808080'; // Gray for excluded joints
            ctx.strokeStyle = '#505050';
        } else if (isInIkChain) {
            ctx.fillStyle = '#0066ff'; // Blue for IK chain joints
            ctx.strokeStyle = '#0033cc';
        } else {
            ctx.fillStyle = '#ffffff'; // White for normal joints
            ctx.strokeStyle = '#000000';
        }
        
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(jointPos.x, jointPos.y, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    });
};

export const drawPose = (
    ctx: CanvasRenderingContext2D, 
    poseData: PoseCoordinates, 
    { 
        strokeColor, 
        strokeWidth, 
        headRadius, 
        jointVisibility, 
        drawJoints,
        width,
        height
    }: StyleConfig,
    drawConfig: DrawConfig
) => {
    if (!ctx) return;

    // Clear canvas is now handled in PoseCanvasComponent
    
    // Set drawing style
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    
    // Draw bones based on connections
    boneConnections.forEach(([startJoint, endJoint]) => {
        const start = poseData[startJoint as string];
        const end = poseData[endJoint as string];

        if (start && end) {
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
        }
    });

    // Draw head (circle)
    if (poseData.head) {
        ctx.beginPath();
        ctx.arc(poseData.head.x, poseData.head.y, headRadius, 0, 2 * Math.PI);
        ctx.stroke();
    }
    
    // Draw joint points if draggable
    if (jointVisibility !== 'never') {
        drawJoints(ctx, poseData, drawConfig);
    }
};
