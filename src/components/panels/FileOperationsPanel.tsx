import React, { memo, useRef } from 'react';
import styles from './FileOperationsPanel.module.css';
import { toast } from 'react-hot-toast';

interface FileOperationsPanelProps {
    onSave: () => void;
    onLoad: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileOperationsPanel: React.FC<FileOperationsPanelProps> = memo(({ onSave, onLoad }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLoadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className={styles.group}>
            <h3 className={styles.groupTitle}>File Operations</h3>
            <div className={styles.buttonContainer}>
                <button onClick={onSave} className={`${styles.button} ${styles.saveButton}`}>
                    Save
                </button>
                <button onClick={handleLoadClick} className={`${styles.button} ${styles.loadButton}`}>
                    Load
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onLoad}
                    style={{ display: 'none' }}
                    accept="application/json"
                />
            </div>
        </div>
    );
});

export default FileOperationsPanel; 