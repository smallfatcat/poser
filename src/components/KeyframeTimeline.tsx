import React from 'react';
import styles from './KeyframeTimeline.module.css';
import { Pose } from '../types';
import PoseCanvas from './PoseCanvas';
import { poseToCoordinates } from '../utils/poseAngleToCoordinates';

export interface Keyframe {
  id: string;
  pose: Pose;
  time: number;
}

interface KeyframeTimelineProps {
  keyframes: Keyframe[];
  selectedKeyframeId?: string;
  onKeyframeSelect: (id: string) => void;
  onAddKeyframe: () => void;
}

const KeyframeTimeline: React.FC<KeyframeTimelineProps> = ({
  keyframes,
  selectedKeyframeId,
  onKeyframeSelect,
  onAddKeyframe,
}) => {
  return (
    <div className={styles.timelineWrapper}>
      <h3>Keyframes</h3>
      <div className={styles.timelineContainer}>
        {keyframes.map((keyframe) => {
          const poseCoords = poseToCoordinates(keyframe.pose, 0.2); // Apply a 0.2 scale factor
          return (
            <div
              key={keyframe.id}
              className={`${styles.thumbnail} ${
                keyframe.id === selectedKeyframeId ? styles.selected : ''
              }`}
              onClick={() => onKeyframeSelect(keyframe.id)}
            >
              <PoseCanvas
                width={80}
                height={80}
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
              <div className={styles.timeLabel}>{(keyframe.time / 1000).toFixed(1)}s</div>
            </div>
          );
        })}
        <button className={styles.addButton} onClick={onAddKeyframe}>
          +
        </button>
      </div>
    </div>
  );
};

export default KeyframeTimeline; 