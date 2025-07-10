import React, { useState } from 'react';
import PoseRenderer from './components/PoseRenderer';
import { createDynamicActionPose } from './utils/poseInterpolation';
import useWindowSize from './hooks/useWindowSize';

function App() {
    const [currentPose, setCurrentPose] = useState(createDynamicActionPose());
    const { width, height } = useWindowSize();

    const handlePoseChange = (newPose) => {
        setCurrentPose(newPose);
    };

    if (!width || !height) {
        return <div>Loading...</div>;
    }

    const canvasSize = Math.min(width * 0.9, height * 0.9, 600);


    return (
        <div className="App">
            <PoseRenderer
                pose={currentPose}
                draggable={true}
                onPoseChange={handlePoseChange}
                width={canvasSize}
                height={canvasSize * 0.67}
            />
        </div>
    );
}

export default App; 