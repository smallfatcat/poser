import React from 'react';
import styles from './AnimationPanel.module.css';

interface AnimationPanelProps {
    animationDuration: number;
    setAnimationDuration: (duration: number) => void;
}

const AnimationPanel: React.FC<AnimationPanelProps> = ({ animationDuration, setAnimationDuration }) => {
    return (
        <div className={styles.controlSection}>
            <h4>Animation</h4>
            <div className={styles.controlRow}>
                <label htmlFor="duration">Duration (ms)</label>
                <input
                    type="number"
                    id="duration"
                    value={animationDuration}
                    onChange={(e) => setAnimationDuration(Number(e.target.value))}
                    step={100}
                    className={styles.numberInput}
                />
            </div>
        </div>
    );
};

export default AnimationPanel; 