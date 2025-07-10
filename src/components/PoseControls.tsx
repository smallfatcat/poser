import React from 'react';
import InteractionSettings from './InteractionSettings';
import FileOperations from './FileOperations';
import BoneLengthSliders from './BoneLengthSliders';
import styles from './PoseControls.module.css';
import { Pose } from '../types';

interface PoseControlsProps {
    draggable: boolean;
    useRelativeConstraints: boolean;
    setUseRelativeConstraints: (value: boolean | ((prev: boolean) => boolean)) => void;
    useInverseKinematics: boolean;
    setUseInverseKinematics: (value: boolean | ((prev: boolean) => boolean)) => void;
    jointVisibility: 'always' | 'hover' | 'never';
    toggleJointVisibility: () => void;
    getJointVisibilityText: () => string;
    savePoseData: () => void;
    onPoseLoad: (e: React.ChangeEvent<HTMLInputElement>) => void;
    boneLengths: Pose;
    onBoneLengthChange: (name: string, value: number) => void;
}

const PoseControls: React.FC<PoseControlsProps> = ({
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
