import React, { memo } from 'react';
import styles from './PropertiesPanel.module.css';
import { Pose } from '../../types';

interface BoneSliderProps {
    name: string;
    value: number;
    onChange: (name: string, value: number) => void;
    min?: number;
    max?: number;
}

const BoneSlider: React.FC<BoneSliderProps> = memo(({ name, value, onChange, min = 10, max = 150 }) => {
    const getDisplayName = (name: string) => {
        if (name === 'scale') return 'Scale';
        if (name === 'torsoLength') return 'Torso';
        if (name === 'neckLength') return 'Neck';
        if (name.includes('leftShoulder')) return 'Left Shoulder';
        if (name.includes('rightShoulder')) return 'Right Shoulder';
        if (name.includes('leftUpperArm')) return 'Left Upper Arm';
        if (name.includes('leftLowerArm')) return 'Left Lower Arm';
        if (name.includes('leftHand')) return 'Left Hand';
        if (name.includes('rightUpperArm')) return 'Right Upper Arm';
        if (name.includes('rightLowerArm')) return 'Right Lower Arm';
        if (name.includes('rightHand')) return 'Right Hand';
        if (name.includes('leftHip')) return 'Left Hip';
        if (name.includes('rightHip')) return 'Right Hip';
        if (name.includes('leftUpperLeg')) return 'Left Upper Leg';
        if (name.includes('leftLowerLeg')) return 'Left Lower Leg';
        if (name.includes('leftFoot')) return 'Left Foot';
        if (name.includes('rightUpperLeg')) return 'Right Upper Leg';
        if (name.includes('rightLowerLeg')) return 'Right Lower Leg';
        if (name.includes('rightFoot')) return 'Right Foot';
        return name.replace('Length', ' Length');
    };

    return (
        <div className={styles.sliderContainer}>
            <label htmlFor={`${name}-length`} className={styles.sliderLabel}>
                {getDisplayName(name)}
            </label>
            <input
                type="range"
                id={`${name}-length`}
                name={`${name}-length`}
                min={min}
                max={max}
                value={value}
                onChange={(e) => onChange(name, parseInt(e.target.value, 10))}
                className={styles.sliderInput}
            />
            <span className={styles.sliderValue}>
                {name === 'scale' ? `${value}%` : value}
            </span>
        </div>
    );
});

interface PropertiesPanelProps {
    boneLengths: Pose;
    onBoneLengthChange: (name: string, value: number) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = memo(({ boneLengths, onBoneLengthChange }) => {
    return (
        <div className={styles.group}>
            <h3 className={styles.groupTitle}>Center Bones</h3>
            <div className={styles.slidersContainer}>
                <BoneSlider name="torsoLength" value={boneLengths.torsoLength as number} onChange={onBoneLengthChange} />
                <BoneSlider name="neckLength" value={boneLengths.neckLength as number} onChange={onBoneLengthChange} />
            </div>
            
            <h3 className={styles.groupTitle}>Left Arm</h3>
            <div className={styles.slidersContainer}>
                <BoneSlider name="leftShoulderLength" value={boneLengths.leftShoulderLength as number} onChange={onBoneLengthChange} />
                <BoneSlider name="leftUpperArmLength" value={boneLengths.leftUpperArmLength as number} onChange={onBoneLengthChange} />
                <BoneSlider name="leftLowerArmLength" value={boneLengths.leftLowerArmLength as number} onChange={onBoneLengthChange} />
                <BoneSlider name="leftHandLength" value={boneLengths.leftHandLength as number} onChange={onBoneLengthChange} />
            </div>
            
            <h3 className={styles.groupTitle}>Right Arm</h3>
            <div className={styles.slidersContainer}>
                <BoneSlider name="rightShoulderLength" value={boneLengths.rightShoulderLength as number} onChange={onBoneLengthChange} />
                <BoneSlider name="rightUpperArmLength" value={boneLengths.rightUpperArmLength as number} onChange={onBoneLengthChange} />
                <BoneSlider name="rightLowerArmLength" value={boneLengths.rightLowerArmLength as number} onChange={onBoneLengthChange} />
                <BoneSlider name="rightHandLength" value={boneLengths.rightHandLength as number} onChange={onBoneLengthChange} />
            </div>
            
            <h3 className={styles.groupTitle}>Left Leg</h3>
            <div className={styles.slidersContainer}>
                <BoneSlider name="leftHipLength" value={boneLengths.leftHipLength as number} onChange={onBoneLengthChange} />
                <BoneSlider name="leftUpperLegLength" value={boneLengths.leftUpperLegLength as number} onChange={onBoneLengthChange} />
                <BoneSlider name="leftLowerLegLength" value={boneLengths.leftLowerLegLength as number} onChange={onBoneLengthChange} />
                <BoneSlider name="leftFootLength" value={boneLengths.leftFootLength as number} onChange={onBoneLengthChange} />
            </div>
            
            <h3 className={styles.groupTitle}>Right Leg</h3>
            <div className={styles.slidersContainer}>
                <BoneSlider name="rightHipLength" value={boneLengths.rightHipLength as number} onChange={onBoneLengthChange} />
                <BoneSlider name="rightUpperLegLength" value={boneLengths.rightUpperLegLength as number} onChange={onBoneLengthChange} />
                <BoneSlider name="rightLowerLegLength" value={boneLengths.rightLowerLegLength as number} onChange={onBoneLengthChange} />
                <BoneSlider name="rightFootLength" value={boneLengths.rightFootLength as number} onChange={onBoneLengthChange} />
            </div>
            
            <h3 className={styles.groupTitle}>Transform</h3>
            <div className={styles.slidersContainer}>
                <BoneSlider 
                    name="scale" 
                    value={Math.round((boneLengths.scale as number || 1) * 100)} 
                    onChange={(name, value) => onBoneLengthChange(name, value / 100)}
                    min={10}
                    max={300}
                />
            </div>
        </div>
    );
});

export default PropertiesPanel; 