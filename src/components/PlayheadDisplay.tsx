import React, { useState, useEffect, useRef } from 'react';
import styles from './PlayheadDisplay.module.css';
import { Pose } from '../types';
import PoseCanvas from './PoseCanvas';
import { poseToCoordinates } from '../utils/poseAngleToCoordinates';

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
  timeDisplayMode: 'seconds' | 'frames';
  setAnimationDuration: (duration: number) => void;
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
  timeDisplayMode,
  setAnimationDuration,
}) => {
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
              className={styles.timeInput}
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
    const sortedKeyframes = [...keyframes].sort((a, b) => a.time - b.time);
    if (id === sortedKeyframes[0]?.id || id === sortedKeyframes[sortedKeyframes.length - 1]?.id) {
        return; // Prevent dragging first and last keyframes
    }
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
    <div className={styles.playheadContainer}>
        <div className={styles.track} onClick={handleTrackClick} ref={trackRef}>
            <div
            className={styles.playhead}
            style={{ left: `${playheadPosition}%` }}
            onMouseDown={handlePlayheadMouseDown}
            />
            {keyframes.map((keyframe) => {
            const keyframePosition = getPosition(keyframe.time);
            const poseCoords = poseToCoordinates(keyframe.pose, 1);
            return (
                <div
                key={keyframe.id}
                className={styles.keyframeContainer}
                style={{ left: `${keyframePosition}%` }}
                onMouseDown={(e) => handleKeyframeMouseDown(e, keyframe.id)}
                onClick={(e) => {
                    e.stopPropagation();
                    onKeyframeSelect(keyframe.id);
                    onScrub(keyframe.time);
                }}
                >
                    <div className={`${styles.keyframe} ${
                        keyframe.id === selectedKeyframeId ? styles.selected : ''
                    }`} />
                    <div className={styles.thumbnail}>
                        <div className={styles.thumbnailCanvasContainer}>
                            <PoseCanvas
                                width={200}
                                height={134}
                                poseCoordinates={poseToCoordinates(keyframe.pose, 0.25)}
                                strokeColor="#fff"
                                strokeWidth={1}
                                headRadius={5}
                                jointVisibility="never"
                                draggable={false}
                                isDragging={false}
                                useInverseKinematics={false}
                                draggedJoint={null}
                                hoveredJoint={null}
                                excludedJoints={new Set()}
                                className=""
                                style={{}}
                                shouldClear={true}
                            />
                        </div>
                        <div className={styles.thumbnailTime}>
                            {timeDisplayMode === 'seconds'
                                ? `${(keyframe.time / 1000).toFixed(2)}s`
                                : `${Math.round(keyframe.time / (1000 / 60))}f`}
                        </div>
                    </div>
                </div>
            );
            })}
        </div>
        <div className={styles.buttonGroup}>
            <button
                onClick={onAddKeyframe}
                className="btn btn-icon"
            >+</button>
            <button
                onClick={onPlay}
                className="btn btn-icon"
            >
                {isPlaying ? '❚❚' : '▶'}
            </button>
        </div>
        <div className={styles.timeDisplay}>
            {renderTimeInput(currentTime, handleTimeChange)}
            <span>/</span>
            {renderTimeInput(duration, handleDurationChange)}
        </div>
    </div>
  );
};

export default PlayheadDisplay; 