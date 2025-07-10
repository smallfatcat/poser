import React, { memo, useRef } from 'react';

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
        <div className="group">
            <h3 className="group-title">File Operations</h3>
            <div className="button-container">
                <button onClick={onSave} className="btn btn-primary">
                    Save
                </button>
                <button onClick={handleLoadClick} className="btn">
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