import React, { useState, useEffect, useRef } from 'react';
import styles from './PlayheadDisplay.module.css';
import buttonStyles from './Button.module.css';
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
}) => {
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
  const [draggedKeyframeId, setDraggedKeyframeId] = useState<string | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const duration = endTime - startTime;

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
            const poseCoords = poseToCoordinates(keyframe.pose, 0.2);
            return (
                <div
                key={keyframe.id}
                className={styles.keyframeContainer}
                style={{ left: `${keyframePosition}%` }}
                onMouseDown={(e) => handleKeyframeMouseDown(e, keyframe.id)}
                onClick={(e) => {
                    e.stopPropagation();
                    onKeyframeSelect(keyframe.id);
                }}
                >
                    <div className={`${styles.keyframe} ${
                        keyframe.id === selectedKeyframeId ? styles.selected : ''
                    }`} />
                    <div className={styles.thumbnail}>
                        <PoseCanvas
                            width={100}
                            height={100}
                            poseCoordinates={poseCoords}
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
        <button 
            onClick={onAddKeyframe} 
            className={`${buttonStyles.button} ${buttonStyles.addButton}`}
        >+</button>
        <button
            onClick={onPlay}
            className={`${buttonStyles.button} ${buttonStyles.playButton}`}
        >
            {isPlaying ? '❚❚' : '▶'}
        </button>
    </div>
  );
};

export default PlayheadDisplay; 