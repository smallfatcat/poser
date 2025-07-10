import React from 'react';
import styles from './BoneLengthSliders.module.css';

const BoneSlider = ({ name, value, onChange, min = 10, max = 150 }) => (
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
);

const BoneLengthSliders = ({ boneLengths, onBoneLengthChange }) => {
    return (
        <div className={styles.group}>
            <h3 className={styles.groupTitle}>Bone Lengths</h3>
            <div className={styles.slidersContainer}>
                <BoneSlider name="torsoLength" value={boneLengths.torsoLength} onChange={onBoneLengthChange} />
                <BoneSlider name="neckLength" value={boneLengths.neckLength} onChange={onBoneLengthChange} />
                <BoneSlider name="upperArmLength" value={boneLengths.upperArmLength} onChange={onBoneLengthChange} />
                <BoneSlider name="lowerArmLength" value={boneLengths.lowerArmLength} onChange={onBoneLengthChange} />
                <BoneSlider name="handLength" value={boneLengths.handLength} onChange={onBoneLengthChange} />
                <BoneSlider name="upperLegLength" value={boneLengths.upperLegLength} onChange={onBoneLengthChange} />
                <BoneSlider name="lowerLegLength" value={boneLengths.lowerLegLength} onChange={onBoneLengthChange} />
                <BoneSlider name="footLength" value={boneLengths.footLength} onChange={onBoneLengthChange} />
            </div>
        </div>
    );
};

export default BoneLengthSliders; 