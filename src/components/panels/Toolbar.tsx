import React, { memo } from 'react';

interface ToolbarProps {
    useRelativeConstraints: boolean;
    setUseRelativeConstraints: (value: boolean | ((prev: boolean) => boolean)) => void;
    useInverseKinematics: boolean;
    setUseInverseKinematics: (value: boolean | ((prev: boolean) => boolean)) => void;
    jointVisibility: 'always' | 'hover' | 'never';
    toggleJointVisibility: () => void;
    getJointVisibilityText: () => string;
    onionSkinning: boolean;
    setOnionSkinning: (value: boolean | ((prev: boolean) => boolean)) => void;
}

const Toolbar: React.FC<ToolbarProps> = memo(({
    useRelativeConstraints,
    setUseRelativeConstraints,
    useInverseKinematics,
    setUseInverseKinematics,
    jointVisibility,
    toggleJointVisibility,
    getJointVisibilityText,
    onionSkinning,
    setOnionSkinning,
}) => {
    return (
        <div className="group">
            <h3 className="group-title">Interaction Settings</h3>
            <div className="button-container">
                <button
                    onClick={() => setUseRelativeConstraints(!useRelativeConstraints)}
                    className={`btn ${useRelativeConstraints ? 'active' : ''}`}
                >
                    {useRelativeConstraints ? 'Constraints: Rel' : 'Constraints: Abs'}
                </button>
                <button
                    onClick={() => setUseInverseKinematics(!useInverseKinematics)}
                    className={`btn ${useInverseKinematics ? 'active' : ''}`}
                >
                    {useInverseKinematics ? 'IK: On' : 'IK: Off'}
                </button>
                <button
                    onClick={toggleJointVisibility}
                    className="btn"
                >
                    {getJointVisibilityText()}
                </button>
                <button
                    onClick={() => setOnionSkinning(!onionSkinning)}
                    className={`btn ${onionSkinning ? 'active' : ''}`}
                >
                    Onion Skin
                </button>
            </div>
        </div>
    );
});

export default Toolbar; 