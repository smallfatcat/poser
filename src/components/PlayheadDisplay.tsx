import React, { useState, useEffect, useRef } from 'react';
import './PlayheadDisplay.css';
import { Pose } from '../types';
import KeyframeThumbnail from './KeyframeThumbnail';
import { useSettings } from '../context/SettingsContext';

export interface Keyframe {
  id: string;
  pose: Pose;
  time: number; // in milliseconds
}

interface PlayheadDisplayProps {
  keyframes: Keyframe[];
  selectedKeyframeId?: string;
  onKeyframeSelect: (id: string) => void;
  onAddKeyframe: () => void; // Keeping this for a potential add button
  currentTime: number; // in milliseconds
  startTime: number; // in milliseconds
  endTime: number; // in milliseconds
  onScrub: (time: number) => void;
  onKeyframeTimeChange: (id: string, time: number) => void;
  onPlay: () => void;
  isPlaying: boolean;
  setAnimationDuration: (duration: number) => void;
  canvasWidth: number;
  canvasHeight: number;
}

const PlayheadDisplay: React.FC<PlayheadDisplayProps> = ({
  keyframes,
  selectedKeyframeId,
  onKeyframeSelect,
  currentTime,
  startTime,
  endTime,
  onScrub,
  onAddKeyframe,
  onKeyframeTimeChange,
  onPlay,
  isPlaying,
  setAnimationDuration,
  canvasWidth,
  canvasHeight,
}) => {
  const { timeDisplayMode } = useSettings();
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
  const [draggedKeyframeId, setDraggedKeyframeId] = useState<string | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const duration = endTime - startTime;

  const handleTimeChange = (newTime: number) => {
    onScrub(newTime);
  };

  const handleDurationChange = (newDuration: number) => {
    setAnimationDuration(newDuration);
  };

  const renderTimeInput = (value: number, handler: (value: number) => void) => {
      const displayValue = timeDisplayMode === 'seconds' ? (value / 1000).toFixed(2) : Math.round(value / (1000 / 60));

      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          let newValue = parseFloat(e.target.value);
          if (isNaN(newValue)) newValue = 0;
          if (timeDisplayMode === 'seconds') {
              handler(newValue * 1000);
          } else {
              handler(Math.round(newValue * (1000 / 60)));
          }
      };

      return (
          <input
              type="number"
              value={displayValue}
              onChange={handleInputChange}
              onBlur={(e) => e.target.value = displayValue.toString()}
              step={timeDisplayMode === 'seconds' ? 0.01 : 1}
              className="timeInput"
          />
      );
  };

  const getPosition = (time: number) => {
    if (duration === 0) return 0;
    return ((time - startTime) / duration) * 100;
  };

  const playheadPosition = getPosition(currentTime);

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (trackRef.current) {
        const rect = trackRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        onScrub(startTime + percentage * duration);
    }
  };

  const handlePlayheadMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDraggingPlayhead(true);
  };

  const handleKeyframeMouseDown = (e: React.MouseEvent<HTMLDivElement>, id: string) => {
    e.stopPropagation();
    setDraggedKeyframeId(id);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        if (!isDraggingPlayhead || !trackRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        const clientX = e.clientX;
        const newX = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const percentage = newX / rect.width;
        const newTime = startTime + percentage * duration;
        onScrub(newTime);
    };

    const handleMouseUp = () => {
        setIsDraggingPlayhead(false);
    };

    if (isDraggingPlayhead) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingPlayhead, onScrub, startTime, duration]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        if (!draggedKeyframeId || !trackRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        const newX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const percentage = newX / rect.width;
        const newTime = startTime + percentage * duration;
        // The clamping is now handled in the useKeyframes hook
        onKeyframeTimeChange(draggedKeyframeId, newTime);
    };

    const handleMouseUp = () => {
        setDraggedKeyframeId(null);
    };

    if (draggedKeyframeId) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
}, [draggedKeyframeId, onKeyframeTimeChange, startTime, duration]);

  return (
    <div className="w-full p-2.5 bg-panel-bg rounded-xl shadow-lg flex items-center gap-5">
        <div className="flex-grow h-2 bg-gray-600 relative rounded cursor-pointer" onClick={handleTrackClick} ref={trackRef}>
            <div
            className="playhead"
            style={{ left: `${playheadPosition}%` }}
            onMouseDown={handlePlayheadMouseDown}
            />
            {keyframes.map((keyframe) => {
            const keyframePosition = getPosition(keyframe.time);
            return (
                <div
                key={keyframe.id}
                className="absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer w-5 h-5 flex justify-center items-center keyframeContainer"
                style={{ left: `${keyframePosition}%` }}
                onMouseDown={(e) => handleKeyframeMouseDown(e, keyframe.id)}
                onClick={(e) => {
                    e.stopPropagation();
                    onKeyframeSelect(keyframe.id);
                    onScrub(keyframe.time);
                }}
                >
                    <div className={`keyframe ${
                        keyframe.id === selectedKeyframeId ? 'selected' : ''
                    }`} />
                    <div className="thumbnail">
                        <KeyframeThumbnail
                            pose={keyframe.pose}
                            size={80}
                            backgroundColor="#222"
                            strokeColor="#0f0"
                            canvasWidth={canvasWidth}
                            canvasHeight={canvasHeight}
                        />
                        <div className="bg-black bg-opacity-60 text-white text-center py-1 text-xs font-bold rounded-b w-full">
                            {timeDisplayMode === 'seconds'
                                ? `${(keyframe.time / 1000).toFixed(2)}s`
                                : `${Math.round(keyframe.time / (1000 / 60))}f`}
                        </div>
                    </div>
                </div>
            );
            })}
        </div>
        <div className="flex gap-0">
            <button
                onClick={onAddKeyframe}
                className="px-3 py-2 text-sm rounded border bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300 transition-colors"
            >+</button>
            <button
                onClick={onPlay}
                className="px-3 py-2 text-sm rounded border bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300 transition-colors"
            >
                {isPlaying ? '❚❚' : '▶'}
            </button>
        </div>
        <div className="bg-gray-800 text-white p-2 rounded font-mono text-sm min-w-20 text-center ml-2.5">
            {renderTimeInput(currentTime, handleTimeChange)}
            <span>/</span>
            {renderTimeInput(duration, handleDurationChange)}
        </div>
    </div>
  );
};

export default PlayheadDisplay; 