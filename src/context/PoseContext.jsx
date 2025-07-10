import React, { createContext, useState, useContext } from 'react';
import { createDynamicActionPose } from '../utils/poseInterpolation';

const PoseContext = createContext();

export const usePose = () => {
    return useContext(PoseContext);
};

export const PoseProvider = ({ children }) => {
    const [currentPose, setCurrentPose] = useState(createDynamicActionPose());

    const handlePoseChange = (newPose) => {
        setCurrentPose(newPose);
    };

    const value = {
        currentPose,
        onPoseChange: handlePoseChange,
    };

    return (
        <PoseContext.Provider value={value}>
            {children}
        </PoseContext.Provider>
    );
}; 