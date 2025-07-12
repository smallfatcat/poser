import React, { useState } from 'react';
import { useVideo } from '../../context/VideoContext';

interface VideoPanelProps {
    videoOpacity: number;
    onVideoOpacityChange: (opacity: number) => void;
}

const VideoPanel: React.FC<VideoPanelProps> = ({ videoOpacity, onVideoOpacityChange }) => {
    const { isVideoLoaded, videoDuration, currentVideoTime } = useVideo();

    if (!isVideoLoaded) {
        return (
            <div className="mb-5">
                <h3 className="text-lg font-medium text-text-primary border-b border-border-color pb-2 mb-2.5">Video Controls</h3>
                <div className="text-xs text-gray-500 text-center p-2.5">
                    Load a video to access controls
                </div>
            </div>
        );
    }

    const formatTime = (timeMs: number) => {
        const seconds = Math.floor(timeMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="mb-5">
            <h3 className="text-lg font-medium text-text-primary border-b border-border-color pb-2 mb-2.5">Video Controls</h3>
            <div className="mb-2.5">
                <label className="text-xs text-gray-500 mb-1 block">
                    Opacity: {Math.round(videoOpacity * 100)}%
                </label>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={videoOpacity}
                    onChange={(e) => onVideoOpacityChange(parseFloat(e.target.value))}
                    className="w-full cursor-pointer"
                />
            </div>
            
            <div className="mt-2.5">
                <div className="text-xs text-gray-500 flex justify-between">
                    <span>Duration: {formatTime(videoDuration)}</span>
                    <span>Current: {formatTime(currentVideoTime)}</span>
                </div>
            </div>
        </div>
    );
};

export default VideoPanel; 