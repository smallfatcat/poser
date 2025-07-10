import React, { memo, useRef } from 'react';
import styles from './FileOperations.module.css';

interface FileOperationsProps {
    savePoseData: () => void;
    onPoseLoad: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileOperations: React.FC<FileOperationsProps> = memo(({ savePoseData, onPoseLoad }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLoadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className={styles.group}>
            <h3 className={styles.groupTitle}>File Operations</h3>
            <div className={styles.buttonContainer}>
                <button onClick={savePoseData} className={`${styles.button} ${styles.saveButton}`}>
                    Save Pose
                </button>
                <button onClick={handleLoadClick} className={`${styles.button} ${styles.loadButton}`}>
                    Load Pose
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onPoseLoad}
                    style={{ display: 'none' }}
                    accept="application/json"
                />
            </div>
        </div>
    );
});

export default FileOperations; 