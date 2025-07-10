import React, { createContext, useState, useContext, ReactNode } from 'react';
import { createDynamicActionPose } from '../utils/poseInterpolation';
import { Pose } from '../types';

interface PoseContextType {
    currentPose: Pose;
    onPoseChange: (pose: Pose) => void;
    setPose: React.Dispatch<React.SetStateAction<Pose>>;
}

const PoseContext = createContext<PoseContextType | undefined>(undefined);

export const usePose = (): PoseContextType => {
    const context = useContext(PoseContext);
    if (!context) {
        throw new Error('usePose must be used within a PoseProvider');
    }
    return context;
};

interface PoseProviderProps {
    children: ReactNode;
}

export const PoseProvider = ({ children }: PoseProviderProps) => {
    const [currentPose, setCurrentPose] = useState<Pose>(createDynamicActionPose());

    const handlePoseChange = (newPose: Pose) => {
        setCurrentPose(newPose);
    };

    const value = {
        currentPose,
        onPoseChange: handlePoseChange,
        setPose: setCurrentPose,
    };

    return (
        <PoseContext.Provider value={value}>
            {children}
        </PoseContext.Provider>
    );
}; 