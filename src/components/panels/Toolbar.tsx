import React, { memo } from 'react';
import styles from './Toolbar.module.css';

interface ToolbarProps {
    useRelativeConstraints: boolean;
    setUseRelativeConstraints: (value: boolean | ((prev: boolean) => boolean)) => void;
    useInverseKinematics: boolean;
    setUseInverseKinematics: (value: boolean | ((prev: boolean) => boolean)) => void;
    jointVisibility: 'always' | 'hover' | 'never';
    toggleJointVisibility: () => void;
    getJointVisibilityText: () => string;
}

const Toolbar: React.FC<ToolbarProps> = memo(({
    useRelativeConstraints,
    setUseRelativeConstraints,
    useInverseKinematics,
    setUseInverseKinematics,
    jointVisibility,
    toggleJointVisibility,
    getJointVisibilityText,
}) => {
    return (
        <div className={styles.group}>
            <h3 className={styles.groupTitle}>Interaction Settings</h3>
            <div className={styles.buttonContainer}>
                <button 
                    onClick={() => setUseRelativeConstraints(!useRelativeConstraints)} 
                    className={`${styles.button} ${styles.relativeConstraintsButton} ${useRelativeConstraints ? styles.active : ''}`}
                >
                    {useRelativeConstraints ? 'Relative Constraints' : 'Absolute Constraints'}
                </button>
                <button 
                    onClick={() => setUseInverseKinematics(!useInverseKinematics)} 
                    className={`${styles.button} ${styles.ikButton} ${useInverseKinematics ? styles.active : ''}`}
                >
                    {useInverseKinematics ? 'IK Enabled' : 'IK Disabled'}
                </button>
                <button 
                    onClick={toggleJointVisibility} 
                    className={`${styles.button} ${styles.visibilityButton} ${styles[jointVisibility]}`}
                >
                    {getJointVisibilityText()}
                </button>
            </div>
        </div>
    );
});

export default Toolbar; 