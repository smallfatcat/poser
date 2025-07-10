import React, { useState } from 'react';
import PoseRenderer from '../src/components/PoseRenderer';
import { 
    createStandingPose, 
    createWalkingPose, 
    createSittingPose,
    interpolatePose,
    easing 
} from '../src/utils/poseInterpolation';

function AngleBasedExample() {
    const [currentPose, setCurrentPose] = useState(createStandingPose());
    const [isAnimating, setIsAnimating] = useState(false);

    const handlePoseChange = (newPose) => {
        setCurrentPose(newPose);
    };

    const animateToPose = (targetPose, duration = 1000) => {
        if (isAnimating) return;
        
        setIsAnimating(true);
        const startPose = { ...currentPose };
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Use easing function for smooth animation
            const easedProgress = easing.easeInOutQuad(progress);
            
            const interpolatedPose = interpolatePose(startPose, targetPose, easedProgress);
            setCurrentPose(interpolatedPose);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setIsAnimating(false);
            }
        };

        requestAnimationFrame(animate);
    };

    const setStandingPose = () => {
        if (!isAnimating) {
            animateToPose(createStandingPose());
        }
    };

    const setWalkingPose = () => {
        if (!isAnimating) {
            animateToPose(createWalkingPose());
        }
    };

    const setSittingPose = () => {
        if (!isAnimating) {
            animateToPose(createSittingPose());
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Angle-Based Pose System</h1>
            <p>This example uses the new angle-based coordinate system for easier animation.</p>
            
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <button 
                    onClick={setStandingPose} 
                    disabled={isAnimating}
                    style={{ padding: '10px 20px' }}
                >
                    Standing Pose
                </button>
                <button 
                    onClick={setWalkingPose} 
                    disabled={isAnimating}
                    style={{ padding: '10px 20px' }}
                >
                    Walking Pose
                </button>
                <button 
                    onClick={setSittingPose} 
                    disabled={isAnimating}
                    style={{ padding: '10px 20px' }}
                >
                    Sitting Pose
                </button>
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
                <div>
                    <h3>Interactive Canvas</h3>
                    <PoseRenderer 
                        pose={currentPose}
                        draggable={true}
                        onPoseChange={handlePoseChange}
                        strokeColor="#00ff00"
                        strokeWidth={3}
                    />
                </div>
                
                <div>
                    <h3>Pose Data (Angle-Based)</h3>
                    <pre style={{ 
                        background: '#f5f5f5', 
                        padding: '10px', 
                        borderRadius: '5px',
                        fontSize: '12px',
                        maxHeight: '400px',
                        overflow: 'auto'
                    }}>
                        {JSON.stringify(currentPose, null, 2)}
                    </pre>
                </div>
            </div>

            <div style={{ marginTop: '20px' }}>
                <h3>Benefits of Angle-Based System:</h3>
                <ul>
                    <li>✅ Easier to animate between poses</li>
                    <li>✅ More intuitive joint manipulation</li>
                    <li>✅ Consistent pose structure</li>
                    <li>✅ Better for interpolation</li>
                    <li>✅ Reduced coordinate complexity</li>
                </ul>
            </div>
        </div>
    );
}

export default AngleBasedExample; 