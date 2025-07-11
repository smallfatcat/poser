import React, { createContext, useState, useContext, ReactNode } from 'react';

type LoopMode = 'none' | 'loop' | 'pingPong';
type JointVisibility = 'always' | 'hover' | 'never';
type TimeDisplayMode = 'seconds' | 'frames';

interface SettingsContextType {
    useRelativeConstraints: boolean;
    setUseRelativeConstraints: (value: boolean) => void;
    useInverseKinematics: boolean;
    setUseInverseKinematics: (value: boolean) => void;
    disableConstraints: boolean;
    setDisableConstraints: (value: boolean) => void;
    jointVisibility: JointVisibility;
    toggleJointVisibility: () => void;
    getJointVisibilityText: () => string;
    onionSkinning: boolean;
    setOnionSkinning: (value: boolean) => void;
    timeDisplayMode: TimeDisplayMode;
    toggleTimeDisplayMode: () => void;
    loopMode: LoopMode;
    toggleLoopMode: () => void;
    limbColoring: boolean;
    setLimbColoring: (value: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [useRelativeConstraints, setUseRelativeConstraints] = useState(true);
    const [useInverseKinematics, setUseInverseKinematics] = useState(true);
    const [disableConstraints, setDisableConstraints] = useState(false);
    const [jointVisibility, setJointVisibility] = useState<JointVisibility>('hover');
    const [onionSkinning, setOnionSkinning] = useState(false);
    const [timeDisplayMode, setTimeDisplayMode] = useState<TimeDisplayMode>('seconds');
    const [loopMode, setLoopMode] = useState<LoopMode>('none');
    const [limbColoring, setLimbColoring] = useState(false);

    const toggleJointVisibility = () => {
        const visibilities: JointVisibility[] = ['hover', 'always', 'never'];
        const currentIndex = visibilities.indexOf(jointVisibility);
        const nextIndex = (currentIndex + 1) % visibilities.length;
        setJointVisibility(visibilities[nextIndex]);
    };

    const getJointVisibilityText = () => {
        switch (jointVisibility) {
            case 'hover': return 'Joints: Hover';
            case 'always': return 'Joints: Always';
            case 'never': return 'Joints: Never';
        }
    };

    const toggleTimeDisplayMode = () => {
        setTimeDisplayMode(prev => prev === 'seconds' ? 'frames' : 'seconds');
    };

    const toggleLoopMode = () => {
        setLoopMode(prev => {
            if (prev === 'none') return 'loop';
            if (prev === 'loop') return 'pingPong';
            return 'none';
        });
    };

    const value = {
        useRelativeConstraints,
        setUseRelativeConstraints,
        useInverseKinematics,
        setUseInverseKinematics,
        disableConstraints,
        setDisableConstraints,
        jointVisibility,
        toggleJointVisibility,
        getJointVisibilityText,
        onionSkinning,
        setOnionSkinning,
        timeDisplayMode,
        toggleTimeDisplayMode,
        loopMode,
        toggleLoopMode,
        limbColoring,
        setLimbColoring,
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}; 