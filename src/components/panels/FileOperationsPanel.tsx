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
        <div className="mb-5">
            <h3 className="text-lg font-medium text-text-primary border-b border-border-color pb-2 mb-2.5">File Operations</h3>
            <div className="flex flex-wrap gap-2 mb-4">
                <button onClick={onSave} className="px-3 py-2 text-sm rounded border bg-accent-blue text-white border-accent-blue hover:bg-blue-600 transition-colors">
                    Save
                </button>
                <button onClick={handleLoadClick} className="px-3 py-2 text-sm rounded border bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300 transition-colors">
                    Load
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onLoad}
                    className="hidden"
                    accept="application/json"
                />
            </div>
            
            <h3 className="text-lg font-medium text-text-primary border-b border-border-color pb-2 mb-2.5">Video Reference</h3>
            <div className="flex flex-wrap gap-2">
                {!isVideoLoaded ? (
                    <button onClick={handleLoadVideoClick} className="px-3 py-2 text-sm rounded border bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300 transition-colors">
                        Load Video
                    </button>
                ) : (
                    <div className="flex gap-2 items-center">
                        <span className="text-xs text-gray-500">
                            {videoFile?.name}
                        </span>
                        <button onClick={clearVideo} className="px-2 py-1 text-xs rounded border bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300 transition-colors">
                            Clear
                        </button>
                    </div>
                )}
                <input
                    type="file"
                    ref={videoInputRef}
                    onChange={handleVideoLoad}
                    className="hidden"
                    accept="video/*"
                />
            </div>
        </div>
    );
});

export default FileOperationsPanel; 