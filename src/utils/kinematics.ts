import { jointHierarchy } from '../constants/joints';
import { poseToCoordinates } from './poseAngleToCoordinates';
import { Pose, Vector2 } from '../types';

// Function to calculate inverse kinematics for a chain
export const calculateInverseKinematics = (
    targetPos: Vector2, 
    chain: string[], 
    currentPose: Pose, 
    excludedJoints: Set<string> = new Set()
): Pose => {
    // 1. Gather chain info and initial positions
    const chainInfo = chain.map(jointName => ({
        name: jointName,
        angleParam: jointHierarchy[jointName]?.angleParam,
        needsOffset: jointHierarchy[jointName]?.needsOffset || false
    })).filter((joint, index) => joint.angleParam || index === 0);
    if (chainInfo.length < 2) return currentPose;
    const newPose = { ...currentPose };
    const currentCoords = poseToCoordinates(currentPose) as any;
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
    const solvedCoords: { [key: string]: Vector2 } = { [chainInfo[0].name]: { ...currentCoords[chainInfo[0].name] } };

    for (let i = 1; i < positions.length; i++) {
        const parentName = chainInfo[i - 1].name;
        const childName = chainInfo[i].name;
        const childInfo = chainInfo[i];

        const parentPos = solvedCoords[parentName];
        const childTargetPos = positions[i];

        let dx = childTargetPos.x - parentPos.x;
        let dy = -(childTargetPos.y - parentPos.y);
        let angle = Math.atan2(dy, dx) * (180 / Math.PI);

        if (!excludedJoints.has(childName) && childInfo.angleParam) {
            if (childInfo.needsOffset) {
                angle = (angle - 90 + 360) % 360;
            }
            newPose[childInfo.angleParam] = angle;
        }

        const boneLength = lengths[i - 1];
        const finalAngleDegrees = childInfo.angleParam ? newPose[childInfo.angleParam] : 0;
        if (typeof finalAngleDegrees === 'number') {
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
    }

    return newPose;
};

// Function to update child joints using forward kinematics
export const updateChildJoints = (
    pose: Pose, 
    parentJoint: string, 
    originalPose: Pose, 
    useRelativeConstraints: boolean
): void => {
    // Find all joints that have this joint as their parent
    const childJoints = Object.entries(jointHierarchy)
        .filter(([_, jointInfo]) => jointInfo.parent === parentJoint)
        .map(([jointName]) => jointName);
    
    // Recursively update each child joint
    childJoints.forEach(childJoint => {
        const childInfo = jointHierarchy[childJoint];
        if (childInfo) {
            // Special handling for neck and head since they share the same angle parameter
            if (childJoint === 'neck' || childJoint === 'head') {
                // Only update headAngle once (when processing 'head')
                if (childJoint === 'head') {
                    const parentAngleParam = jointHierarchy[parentJoint].angleParam;
                    const childAngleParam = childInfo.angleParam;
                    if (useRelativeConstraints) {
                        const originalParentAngle = originalPose[parentAngleParam];
                        const originalChildAngle = originalPose[childAngleParam];

                        if (typeof originalParentAngle === 'number' && typeof originalChildAngle === 'number') {
                            const originalParentWorldAngle = 90 + originalParentAngle;
                            const originalChildWorldAngle = 90 + originalChildAngle;
                            let relativeAngle = originalChildWorldAngle - originalParentWorldAngle;
                            while (relativeAngle < 0) relativeAngle += 360;
                            while (relativeAngle >= 360) relativeAngle -= 360;
                            
                            const newParentAngle = pose[parentAngleParam];
                            if(typeof newParentAngle === 'number') {
                                const newParentWorldAngle = 90 + newParentAngle;
                                let newChildWorldAngle = newParentWorldAngle + relativeAngle;
                                while (newChildWorldAngle < 0) newChildWorldAngle += 360;
                                while (newChildWorldAngle >= 360) newChildWorldAngle -= 360;
                                let newChildAngle = newChildWorldAngle - 90;
                                while (newChildAngle < 0) newChildAngle += 360;
                                while (newChildAngle >= 360) newChildAngle -= 360;
                                pose[childAngleParam] = newChildAngle;
                            }
                        }
                    } else {
                        // Absolute constraints: maintain the same absolute angle in world space
                        const originalChildAngle = originalPose[childAngleParam] || 0;
                        pose[childAngleParam] = originalChildAngle;
                    }
                }
                // Skip neck since it uses the same angle parameter as head
                return;
            }
            
            const parentAngleParam = jointHierarchy[parentJoint].angleParam;
            const childAngleParam = childInfo.angleParam;
            if (useRelativeConstraints) {
                const originalParentAngle = originalPose[parentAngleParam];
                const originalChildAngle = originalPose[childAngleParam];
                
                if (typeof originalParentAngle === 'number' && typeof originalChildAngle === 'number') {
                    let relativeAngle = originalChildAngle - originalParentAngle;
                    
                    while (relativeAngle < 0) relativeAngle += 360;
                    while (relativeAngle >= 360) relativeAngle -= 360;
                    
                    const newParentAngle = pose[parentAngleParam];
                    if (typeof newParentAngle === 'number') {
                        let newChildAngle = newParentAngle + relativeAngle;
                        
                        while (newChildAngle < 0) newChildAngle += 360;
                        while (newChildAngle >= 360) newChildAngle -= 360;
                        
                        if (childInfo.needsOffset) {
                            newChildAngle = (newChildAngle - 90 + 360) % 360;
                        }
                        
                        pose[childAngleParam] = newChildAngle;
                    }
                }
            } else {
                // Absolute constraints: maintain the same absolute angle in world space
                const originalChildAngle = originalPose[childAngleParam] || 0;
                pose[childAngleParam] = originalChildAngle;
            }
            
            // Recursively update this child's children
            updateChildJoints(pose, childJoint, originalPose, useRelativeConstraints);
        }
    });
};
