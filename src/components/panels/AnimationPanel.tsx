import React from 'react';
import styles from './AnimationPanel.module.css';

interface AnimationPanelProps {
    animationDuration: number;
    setAnimationDuration: (duration: number) => void;
    timeDisplayMode: 'seconds' | 'frames';
    toggleTimeDisplayMode: () => void;
}

const AnimationPanel: React.FC<AnimationPanelProps> = ({ animationDuration, setAnimationDuration, timeDisplayMode, toggleTimeDisplayMode }) => {
    const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(e.target.value);
        if (timeDisplayMode === 'seconds') {
            setAnimationDuration(value * 1000);
        } else {
            setAnimationDuration(Math.round(value * (1000 / 60)));
        }
    };

    const getDisplayDuration = () => {
        if (timeDisplayMode === 'seconds') {
            return (animationDuration / 1000).toFixed(2);
        }
        return Math.round(animationDuration / (1000 / 60));
    };

    return (
        <div className={styles.controlSection}>
            <h4>Animation</h4>
            <div className={styles.controlRow}>
                <label htmlFor="duration">
                    Duration ({timeDisplayMode === 'seconds' ? 's' : 'frames'})
                </label>
                <input
                    type="number"
                    id="duration"
                    value={getDisplayDuration()}
                    onChange={handleDurationChange}
                    step={timeDisplayMode === 'seconds' ? 0.1 : 1}
                    className={styles.numberInput}
                />
            </div>
            <div className={styles.controlRow}>
                <label>Time Display</label>
                <button onClick={toggleTimeDisplayMode} className={styles.toggleButton}>
                    {timeDisplayMode === 'seconds' ? 'Seconds' : 'Frames'}
                </button>
            </div>
        </div>
    );
};

export default AnimationPanel; 