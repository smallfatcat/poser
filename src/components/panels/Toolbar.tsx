import React, { memo } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Pose } from '../../types';

interface ToolbarProps {
    currentPose: Pose;
    onPoseChange: (pose: Pose) => void;
}

const Toolbar: React.FC<ToolbarProps> = memo(({ currentPose, onPoseChange }) => {
    const {
        useRelativeConstraints,
        setUseRelativeConstraints,
        useInverseKinematics,
        setUseInverseKinematics,
        disableConstraints,
        setDisableConstraints,
        toggleJointVisibility,
        getJointVisibilityText,
        onionSkinning,
        setOnionSkinning,
    } = useSettings();

    const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newScale = parseFloat(e.target.value) / 100;
        onPoseChange({ ...currentPose, scale: newScale });
    };

    return (
        <div className="group">
            <h3 className="group-title">Interaction Settings</h3>
            <div className="button-container">
                <button
                    onClick={() => setDisableConstraints(!disableConstraints)}
                    className={`btn ${disableConstraints ? 'active' : ''}`}
                >
                    {disableConstraints ? 'Constraints: Off' : 'Constraints: On'}
                </button>
                <button
                    onClick={() => setUseRelativeConstraints(!useRelativeConstraints)}
                    className={`btn ${useRelativeConstraints ? 'active' : ''}`}
                    disabled={disableConstraints}
                >
                    {useRelativeConstraints ? 'Constraints: Rel' : 'Constraints: Abs'}
                </button>
                <button
                    onClick={() => setUseInverseKinematics(!useInverseKinematics)}
                    className={`btn ${useInverseKinematics ? 'active' : ''}`}
                    disabled={disableConstraints}
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
            <div className="control-row">
                <label htmlFor="scale-slider">
                    Scale: {Math.round((currentPose.scale as number || 1) * 100)}%
                </label>
                <input
                    type="range"
                    id="scale-slider"
                    min="10"
                    max="300"
                    value={Math.round((currentPose.scale as number || 1) * 100)}
                    onChange={handleScaleChange}
                />
            </div>
        </div>
    );
});

export default Toolbar; 