import React, { memo } from 'react';
import styles from './BoneLengthSliders.module.css';
import { Pose } from '../types';

interface BoneSliderProps {
    name: string;
    value: number;
    onChange: (name: string, value: number) => void;
    min?: number;
    max?: number;
}

const BoneSlider: React.FC<BoneSliderProps> = memo(({ name, value, onChange, min = 10, max = 150 }) => (
    <div className={styles.sliderContainer}>
        <label htmlFor={`${name}-length`} className={styles.sliderLabel}>
            {name.replace('Length', ' Length')}
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
        <span className={styles.sliderValue}>{value}</span>
    </div>
));

interface BoneLengthSlidersProps {
    boneLengths: Pose;
    onBoneLengthChange: (name: string, value: number) => void;
}

const BoneLengthSliders: React.FC<BoneLengthSlidersProps> = memo(({ boneLengths, onBoneLengthChange }) => {
    return (
        <div className={styles.group}>
            <h3 className={styles.groupTitle}>Bone Lengths</h3>
            <div className={styles.slidersContainer}>
                <BoneSlider name="torsoLength" value={boneLengths.torsoLength as number} onChange={onBoneLengthChange} />
                <BoneSlider name="neckLength" value={boneLengths.neckLength as number} onChange={onBoneLengthChange} />
                <BoneSlider name="upperArmLength" value={boneLengths.upperArmLength as number} onChange={onBoneLengthChange} />
                <BoneSlider name="lowerArmLength" value={boneLengths.lowerArmLength as number} onChange={onBoneLengthChange} />
                <BoneSlider name="handLength" value={boneLengths.handLength as number} onChange={onBoneLengthChange} />
                <BoneSlider name="upperLegLength" value={boneLengths.upperLegLength as number} onChange={onBoneLengthChange} />
                <BoneSlider name="lowerLegLength" value={boneLengths.lowerLegLength as number} onChange={onBoneLengthChange} />
                <BoneSlider name="footLength" value={boneLengths.footLength as number} onChange={onBoneLengthChange} />
            </div>
        </div>
    );
});

export default BoneLengthSliders; 