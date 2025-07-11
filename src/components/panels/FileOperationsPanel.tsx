import React, { memo, useRef } from 'react';
import { useVideo } from '../../context/VideoContext';

interface FileOperationsPanelProps {
    onSave: () => void;
    onLoad: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileOperationsPanel: React.FC<FileOperationsPanelProps> = memo(({ onSave, onLoad }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);
    const { loadVideo, clearVideo, videoFile, isVideoLoaded } = useVideo();

    const handleLoadClick = () => {
        fileInputRef.current?.click();
    };

    const handleLoadVideoClick = () => {
        videoInputRef.current?.click();
    };

    const handleVideoLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('video/')) {
            loadVideo(file);
        }
        e.target.value = '';
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
            
            <h3 className="group-title">Video Reference</h3>
            <div className="button-container">
                {!isVideoLoaded ? (
                    <button onClick={handleLoadVideoClick} className="btn">
                        Load Video
                    </button>
                ) : (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#666' }}>
                            {videoFile?.name}
                        </span>
                        <button onClick={clearVideo} className="btn btn-small">
                            Clear
                        </button>
                    </div>
                )}
                <input
                    type="file"
                    ref={videoInputRef}
                    onChange={handleVideoLoad}
                    style={{ display: 'none' }}
                    accept="video/*"
                />
            </div>
        </div>
    );
});

export default FileOperationsPanel; 