import { jointHierarchy } from '../constants/joints';
import { poseToCoordinates } from './poseAngleToCoordinates';

// Function to calculate inverse kinematics for a chain
export const calculateInverseKinematics = (targetPos, chain, currentPose, excludedJoints = new Set()) => {
    // 1. Gather chain info and initial positions
    const chainInfo = chain.map(jointName => ({
        name: jointName,
        angleParam: jointHierarchy[jointName]?.angleParam,
        needsOffset: jointHierarchy[jointName]?.needsOffset || false
    })).filter((joint, index) => joint.angleParam || index === 0);
    if (chainInfo.length < 2) return currentPose;
    const newPose = { ...currentPose };
    const currentCoords = poseToCoordinates(currentPose);
    // Store joint positions as array of {x, y}
    let positions = chainInfo.map(j => ({...currentCoords[j.name]}));
    // Store bone lengths
    let lengths = [];
    for (let i = 0; i < positions.length - 1; i++) {
        const dx = positions[i+1].x - positions[i].x;
        const dy = positions[i+1].y - positions[i].y;
        lengths.push(Math.sqrt(dx*dx + dy*dy));
    }
    // 2. Forward pass: set end effector to target, move up the chain
    positions[positions.length - 1] = { x: targetPos.x, y: targetPos.y };
    for (let i = positions.length - 2; i >= 0; i--) {
        const dx = positions[i].x - positions[i+1].x;
        const dy = positions[i].y - positions[i+1].y;
        const l = Math.sqrt(dx*dx + dy*dy) || 1;
        const r = lengths[i] / l;
        positions[i] = {
            x: positions[i+1].x + dx * r,
            y: positions[i+1].y + dy * r
        };
    }
    // 3. Backward pass: anchor base, move down the chain
    positions[0] = { ...currentCoords[chainInfo[0].name] };
    for (let i = 1; i < positions.length; i++) {
        const dx = positions[i].x - positions[i-1].x;
        const dy = positions[i].y - positions[i-1].y;
        const l = Math.sqrt(dx*dx + dy*dy) || 1;
        const r = lengths[i-1] / l;
        positions[i] = {
            x: positions[i-1].x + dx * r,
            y: positions[i-1].y + dy * r
        };
    }

    // 4. Update angles in newPose using FK logic, ensuring sequential consistency.
    const solvedCoords = { [chainInfo[0].name]: { ...currentCoords[chainInfo[0].name] } };

    for (let i = 1; i < positions.length; i++) {
        const parentName = chainInfo[i - 1].name;
        const childName = chainInfo[i].name;
        const childInfo = chainInfo[i];

        const parentPos = solvedCoords[parentName];
        const childTargetPos = positions[i];

        let dx = childTargetPos.x - parentPos.x;
        let dy = -(childTargetPos.y - parentPos.y);
        let angle = Math.atan2(dy, dx) * (180 / Math.PI);

        if (!excludedJoints.has(childName)) {
            if (childInfo.needsOffset) {
                angle = (angle - 90 + 360) % 360;
            }
            newPose[childInfo.angleParam] = angle;
        }

        const boneLength = lengths[i - 1];
        const finalAngleDegrees = newPose[childInfo.angleParam];
        let worldAngleDegrees = finalAngleDegrees;
        if (childInfo.needsOffset) {
            worldAngleDegrees = (worldAngleDegrees + 90) % 360;
        }
        const worldAngleRad = worldAngleDegrees * (Math.PI / 180);

        const childActualPos = {
            x: parentPos.x + boneLength * Math.cos(worldAngleRad),
            y: parentPos.y - boneLength * Math.sin(worldAngleRad),
        };
        solvedCoords[childName] = childActualPos;
    }

    return newPose;
};

// Function to update child joints using forward kinematics
export const updateChildJoints = (pose, parentJoint, originalPose, useRelativeConstraints) => {
    // Find all joints that have this joint as their parent
    const childJoints = Object.entries(jointHierarchy)
        .filter(([jointName, jointInfo]) => jointInfo.parent === parentJoint)
        .map(([jointName]) => jointName);
    
    // Recursively update each child joint
    childJoints.forEach(childJoint => {
        const childInfo = jointHierarchy[childJoint];
        if (childInfo) {
            // Special handling for neck and head since they share the same angle parameter
            if (childJoint === 'neck' || childJoint === 'head') {
                // Only update headAngle once (when processing 'head')
                if (childJoint === 'head') {
                    if (useRelativeConstraints) {
                        // Relative constraints: maintain the same relative angle to parent
                        const originalParentAngle = originalPose[jointHierarchy[parentJoint].angleParam] || 0;
                        const originalChildAngle = originalPose[childInfo.angleParam] || 0;
                        // For neck/head, we need to account for the fact that both shoulder and head use 90-degree offsets
                        // in poseToCoordinates. The relative angle should be calculated from the actual world angles.
                        // Calculate the actual world angles (with offsets applied)
                        const originalParentWorldAngle = 90 + originalParentAngle; // shoulder: 90 + torsoAngle
                        const originalChildWorldAngle = 90 + originalChildAngle;   // head: 90 + headAngle
                        // Calculate the relative angle in world space
                        let relativeAngle = originalChildWorldAngle - originalParentWorldAngle;
                        // Normalize relative angle to 0-360 range
                        while (relativeAngle < 0) relativeAngle += 360;
                        while (relativeAngle >= 360) relativeAngle -= 360;
                        // Get the new parent world angle
                        const newParentAngle = pose[jointHierarchy[parentJoint].angleParam] || 0;
                        const newParentWorldAngle = 90 + newParentAngle;
                        // Calculate the new child world angle to maintain the same relative angle
                        let newChildWorldAngle = newParentWorldAngle + relativeAngle;
                        // Normalize new child world angle
                        while (newChildWorldAngle < 0) newChildWorldAngle += 360;
                        while (newChildWorldAngle >= 360) newChildWorldAngle -= 360;
                        // Convert back to the stored angle (remove the 90-degree offset)
                        let newChildAngle = newChildWorldAngle - 90;
                        // Normalize the stored angle
                        while (newChildAngle < 0) newChildAngle += 360;
                        while (newChildAngle >= 360) newChildAngle -= 360;
                        pose[childInfo.angleParam] = newChildAngle;
                    } else {
                        // Absolute constraints: maintain the same absolute angle in world space
                        const originalChildAngle = originalPose[childInfo.angleParam] || 0;
                        pose[childInfo.angleParam] = originalChildAngle;
                    }
                }
                // Skip neck since it uses the same angle parameter as head
                return;
            }
            
            if (useRelativeConstraints) {
                // Relative constraints: maintain the same relative angle to parent
                const originalParentAngle = originalPose[jointHierarchy[parentJoint].angleParam] || 0;
                const originalChildAngle = originalPose[childInfo.angleParam] || 0;
                
                // Calculate the relative angle (how much the child was rotated relative to parent)
                let relativeAngle = originalChildAngle - originalParentAngle;
                
                // Normalize relative angle to 0-360 range
                while (relativeAngle < 0) relativeAngle += 360;
                while (relativeAngle >= 360) relativeAngle -= 360;
                
                // Get the new parent angle
                const newParentAngle = pose[jointHierarchy[parentJoint].angleParam] || 0;
                
                // Calculate the new child angle to maintain the same relative angle
                let newChildAngle = newParentAngle + relativeAngle;
                
                // Normalize new child angle
                while (newChildAngle < 0) newChildAngle += 360;
                while (newChildAngle >= 360) newChildAngle -= 360;
                
                // Apply offset if needed
                if (childInfo.needsOffset) {
                    newChildAngle = (newChildAngle - 90 + 360) % 360;
                }
                
                pose[childInfo.angleParam] = newChildAngle;
            } else {
                // Absolute constraints: maintain the same absolute angle in world space
                const originalChildAngle = originalPose[childInfo.angleParam] || 0;
                pose[childInfo.angleParam] = originalChildAngle;
            }
            
            // Recursively update this child's children
            updateChildJoints(pose, childJoint, originalPose, useRelativeConstraints);
        }
    });
};
