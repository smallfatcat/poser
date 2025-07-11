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
            <div className="group">
                <h3 className="group-title">Video Controls</h3>
                <div style={{ color: '#666', fontSize: '12px', textAlign: 'center', padding: '10px' }}>
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
        <div className="group">
            <h3 className="group-title">Video Controls</h3>
            <div className="control-group">
                <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                    Opacity: {Math.round(videoOpacity * 100)}%
                </label>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={videoOpacity}
                    onChange={(e) => onVideoOpacityChange(parseFloat(e.target.value))}
                    style={{ width: '100%' }}
                />
            </div>
            
            <div className="control-group" style={{ marginTop: '10px' }}>
                <div style={{ fontSize: '11px', color: '#666', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Duration: {formatTime(videoDuration)}</span>
                    <span>Current: {formatTime(currentVideoTime)}</span>
                </div>
            </div>
        </div>
    );
};

export default VideoPanel; 