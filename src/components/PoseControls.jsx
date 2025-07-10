import React from 'react';
import InteractionSettings from './InteractionSettings';
import FileOperations from './FileOperations';
import BoneLengthSliders from './BoneLengthSliders';
import styles from './PoseControls.module.css';

const PoseControls = ({
    draggable,
    useRelativeConstraints,
    setUseRelativeConstraints,
    useInverseKinematics,
    setUseInverseKinematics,
    jointVisibility,
    toggleJointVisibility,
    getJointVisibilityText,
    savePoseData,
    onPoseLoad,
    boneLengths,
    onBoneLengthChange,
}) => {
    return (
        <div className={styles.container}>
            {draggable && (
                <InteractionSettings
                    useRelativeConstraints={useRelativeConstraints}
                    setUseRelativeConstraints={setUseRelativeConstraints}
                    useInverseKinematics={useInverseKinematics}
                    setUseInverseKinematics={setUseInverseKinematics}
                    jointVisibility={jointVisibility}
                    toggleJointVisibility={toggleJointVisibility}
                    getJointVisibilityText={getJointVisibilityText}
                />
            )}

            <FileOperations savePoseData={savePoseData} onPoseLoad={onPoseLoad} />

            {draggable && onBoneLengthChange && (
                <BoneLengthSliders
                    boneLengths={boneLengths}
                    onBoneLengthChange={onBoneLengthChange}
                />
            )}
        </div>
    );
};

export default PoseControls;
