import React, { useState, useCallback } from 'react';
import PoseRenderer from './PoseRenderer';
import useWindowSize from '../hooks/useWindowSize';
import { usePose } from '../context/PoseContext';
import { toast } from 'react-hot-toast';
import PlayheadDisplay from './PlayheadDisplay';
import PoseControls from './PoseControls';
import { saveAs } from 'file-saver';
import { Pose } from '../types';
import { useAnimation } from '../hooks/useAnimation';
import { useKeyframes } from '../hooks/useKeyframes';

const Editor: React.FC = () => {
    const { width, height } = useWindowSize();
    const { currentPose, setPose } = usePose();
    const [animationDuration, setAnimationDuration] = useState(5000);
    const [currentTime, setCurrentTime] = useState(0);

    const {
        keyframes,
        selectedKeyframeId,
        scrubToTime,
        handleKeyframeTimeChange,
        handleAddKeyframe,
        handleSelectKeyframe,
        handleManualPoseChange
    } = useKeyframes({
        animationDuration,
        setAnimationDuration,
    });

    const handleScrub = useCallback((time: number) => {
        setCurrentTime(time);
        scrubToTime(time);
    }, [setCurrentTime, scrubToTime]);

    const {
        isPlaying,
        handlePlay
    } = useAnimation({
        animationDuration,
        onFrame: handleScrub,
    });

    const [useRelativeConstraints, setUseRelativeConstraints] = useState(true);
    const [useInverseKinematics, setUseInverseKinematics] = useState(true);
    const [jointVisibility, setJointVisibility] = useState<'always' | 'hover' | 'never'>('hover');

    const keyframeTimes = keyframes.length > 0 ? keyframes.map(k => k.time) : [0];
    const maxTime = Math.max(...keyframeTimes);

    const startTime = 0;
    const endTime = Math.max(animationDuration, maxTime);

    const toggleJointVisibility = () => {
        const visibilities: ('always' | 'hover' | 'never')[] = ['hover', 'always', 'never'];
        const currentIndex = visibilities.indexOf(jointVisibility);
        const nextIndex = (currentIndex + 1) % visibilities.length;
        setJointVisibility(visibilities[nextIndex]);
    };

    const getJointVisibilityText = () => {
        switch (jointVisibility) {
            case 'hover': return 'Visible on Hover';
            case 'always': return 'Always Visible';
            case 'never': return 'Never Visible';
        }
    };

    const savePoseData = () => {
        const poseData = JSON.stringify({ version: "1.2.0", pose: currentPose }, null, 2);
        const blob = new Blob([poseData], { type: "application/json" });
        saveAs(blob, "pose.json");
    };

    const onPoseLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const loadedData = JSON.parse(event.target?.result as string);
                    if (loadedData.pose) {
                        setPose(loadedData.pose);
                        toast.success("Pose loaded successfully!");
                    }
                } catch (err) {
                    toast.error("Failed to load or parse pose file.");
                }
            };
            reader.readAsText(file);
        }
    };

    if (!width || !height) {
        return <div>Loading...</div>;
    }

    const canvasSize = Math.min(width * 0.9, height * 0.9, 800);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <PoseRenderer
                draggable={true}
                width={canvasSize}
                height={canvasSize * 0.67}
                pose={currentPose}
                onPoseChange={handleManualPoseChange}
                useRelativeConstraints={useRelativeConstraints}
                useInverseKinematics={useInverseKinematics}
                jointVisibility={jointVisibility}
            />
            <div style={{ display: 'flex', alignItems: 'center', width: canvasSize }}>
                <PlayheadDisplay
                    keyframes={keyframes}
                    selectedKeyframeId={selectedKeyframeId}
                    onKeyframeSelect={handleSelectKeyframe}
                    onAddKeyframe={() => handleAddKeyframe(currentTime)}
                    currentTime={currentTime}
                    startTime={startTime}
                    endTime={endTime}
                    onScrub={handleScrub}
                    onKeyframeTimeChange={handleKeyframeTimeChange}
                    onPlay={handlePlay}
                    isPlaying={isPlaying}
                />
            </div>
            <PoseControls
                draggable={true}
                useRelativeConstraints={useRelativeConstraints}
                setUseRelativeConstraints={setUseRelativeConstraints}
                useInverseKinematics={useInverseKinematics}
                setUseInverseKinematics={setUseInverseKinematics}
                jointVisibility={jointVisibility}
                toggleJointVisibility={toggleJointVisibility}
                getJointVisibilityText={getJointVisibilityText}
                savePoseData={savePoseData}
                onPoseLoad={onPoseLoad}
                boneLengths={currentPose}
                onBoneLengthChange={(name: keyof Pose, value: number) => handleManualPoseChange({ ...currentPose, [name]: value })}
                animationDuration={animationDuration}
                setAnimationDuration={setAnimationDuration}
            />
        </div>
    );
};

export default Editor; 