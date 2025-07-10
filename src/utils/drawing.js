// Draw joint points
export const drawJoints = (
    ctx, 
    poseCoordinates, 
    { 
        draggable, 
        isDragging, 
        useInverseKinematics, 
        draggedJoint, 
        hoveredJoint, 
        excludedJoints, 
        ikChains, 
        jointVisibility 
    }
) => {
    if (!draggable) return;

    let activeIkChain = [];
    if (isDragging && useInverseKinematics) {
        let chain = null;
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
    ctx, 
    poseData, 
    { 
        strokeColor, 
        strokeWidth, 
        headRadius, 
        jointVisibility, 
        drawJoints,
        width,
        height
    },
    drawConfig
) => {
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Set drawing style
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    
    // Draw head (circle)
    ctx.beginPath();
    ctx.arc(poseData.head.x, poseData.head.y, headRadius, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Draw neck (head to shoulder)
    ctx.beginPath();
    ctx.moveTo(poseData.head.x, poseData.head.y + headRadius);
    ctx.lineTo(poseData.shoulder.x, poseData.shoulder.y);
    ctx.stroke();
    
    // Draw torso (shoulder to hip)
    ctx.beginPath();
    ctx.moveTo(poseData.shoulder.x, poseData.shoulder.y);
    ctx.lineTo(poseData.hip.x, poseData.hip.y);
    ctx.stroke();
    
    // Draw arms
    // Left arm: shoulder -> upper arm -> lower arm -> hand
    ctx.beginPath();
    ctx.moveTo(poseData.shoulder.x, poseData.shoulder.y);
    ctx.lineTo(poseData.leftUpperArm.x, poseData.leftUpperArm.y);
    ctx.lineTo(poseData.leftLowerArm.x, poseData.leftLowerArm.y);
    ctx.lineTo(poseData.leftHand.x, poseData.leftHand.y);
    ctx.stroke();
    
    // Right arm: shoulder -> upper arm -> lower arm -> hand
    ctx.beginPath();
    ctx.moveTo(poseData.shoulder.x, poseData.shoulder.y);
    ctx.lineTo(poseData.rightUpperArm.x, poseData.rightUpperArm.y);
    ctx.lineTo(poseData.rightLowerArm.x, poseData.rightLowerArm.y);
    ctx.lineTo(poseData.rightHand.x, poseData.rightHand.y);
    ctx.stroke();
    
    // Draw legs
    // Left leg: hip -> upper leg -> lower leg -> foot
    ctx.beginPath();
    ctx.moveTo(poseData.hip.x, poseData.hip.y);
    ctx.lineTo(poseData.leftUpperLeg.x, poseData.leftUpperLeg.y);
    ctx.lineTo(poseData.leftLowerLeg.x, poseData.leftLowerLeg.y);
    ctx.lineTo(poseData.leftFoot.x, poseData.leftFoot.y);
    ctx.stroke();
    
    // Right leg: hip -> upper leg -> lower leg -> foot
    ctx.beginPath();
    ctx.moveTo(poseData.hip.x, poseData.hip.y);
    ctx.lineTo(poseData.rightUpperLeg.x, poseData.rightUpperLeg.y);
    ctx.lineTo(poseData.rightLowerLeg.x, poseData.rightLowerLeg.y);
    ctx.lineTo(poseData.rightFoot.x, poseData.rightFoot.y);
    ctx.stroke();

    // Draw joint points if draggable
    if (jointVisibility !== 'never') {
        drawJoints(ctx, poseData, drawConfig);
    }
};
