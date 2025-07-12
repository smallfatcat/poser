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
        limbColoring,
        setLimbColoring,
    } = useSettings();

    const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newScale = parseFloat(e.target.value) / 100;
        onPoseChange({ ...currentPose, scale: newScale });
    };

    return (
        <div className="mb-5">
            <h3 className="text-lg font-medium text-text-primary border-b border-border-color pb-2 mb-2.5">Interaction Settings</h3>
            <div className="flex flex-wrap gap-2 mb-4">
                <button
                    onClick={() => setDisableConstraints(!disableConstraints)}
                    className={`px-3 py-2 text-sm rounded border transition-colors ${
                        disableConstraints 
                            ? 'bg-accent-blue text-white border-accent-blue' 
                            : 'bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300'
                    }`}
                >
                    {disableConstraints ? 'Constraints: Off' : 'Constraints: On'}
                </button>
                <button
                    onClick={() => setUseRelativeConstraints(!useRelativeConstraints)}
                    className={`px-3 py-2 text-sm rounded border transition-colors ${
                        useRelativeConstraints 
                            ? 'bg-accent-blue text-white border-accent-blue' 
                            : 'bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300'
                    } ${disableConstraints ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={disableConstraints}
                >
                    {useRelativeConstraints ? 'Constraints: Rel' : 'Constraints: Abs'}
                </button>
                <button
                    onClick={() => setUseInverseKinematics(!useInverseKinematics)}
                    className={`px-3 py-2 text-sm rounded border transition-colors ${
                        useInverseKinematics 
                            ? 'bg-accent-blue text-white border-accent-blue' 
                            : 'bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300'
                    } ${disableConstraints ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={disableConstraints}
                >
                    {useInverseKinematics ? 'IK: On' : 'IK: Off'}
                </button>
                <button
                    onClick={toggleJointVisibility}
                    className="px-3 py-2 text-sm rounded border bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300 transition-colors"
                >
                    {getJointVisibilityText()}
                </button>
                <button
                    onClick={() => setOnionSkinning(!onionSkinning)}
                    className={`px-3 py-2 text-sm rounded border transition-colors ${
                        onionSkinning 
                            ? 'bg-accent-blue text-white border-accent-blue' 
                            : 'bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300'
                    }`}
                >
                    Onion Skin
                </button>
                <button
                    onClick={() => setLimbColoring(!limbColoring)}
                    className={`px-3 py-2 text-sm rounded border transition-colors ${
                        limbColoring 
                            ? 'bg-accent-blue text-white border-accent-blue' 
                            : 'bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300'
                    }`}
                >
                    {limbColoring ? 'Limb Colors: On' : 'Limb Colors: Off'}
                </button>
            </div>
            <div className="flex flex-col gap-1">
                <label htmlFor="scale-slider" className="text-sm text-text-secondary">
                    Scale: {Math.round((currentPose.scale as number || 1) * 100)}%
                </label>
                <input
                    type="range"
                    id="scale-slider"
                    min="10"
                    max="300"
                    value={Math.round((currentPose.scale as number || 1) * 100)}
                    onChange={handleScaleChange}
                    className="w-full cursor-pointer"
                />
            </div>
        </div>
    );
});

export default Toolbar; 