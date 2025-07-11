import React, { useState, useCallback, useEffect } from 'react';
import { PoseProvider, usePose } from './context/PoseContext';
import { Toaster, toast } from 'react-hot-toast';
import Sidebar from './components/layout/Sidebar';
import MainContent from './components/layout/MainContent';
import Toolbar from './components/panels/Toolbar';
import InspectorPanel from './components/panels/InspectorPanel';
import Viewport from './components/layout/Viewport';
import Timeline from './components/layout/Timeline';
import PoseRenderer from './components/PoseRenderer';
import PlayheadDisplay from './components/PlayheadDisplay';
import FileOperationsPanel from './components/panels/FileOperationsPanel';
import PropertiesPanel from './components/panels/PropertiesPanel';
import AnimationPanel from './components/panels/AnimationPanel';
import useWindowSize from './hooks/useWindowSize';
import { saveAs } from 'file-saver';
import { Pose } from './types';
import { useAnimation } from './hooks/useAnimation';
import { useKeyframes } from './hooks/useKeyframes';
import { SettingsProvider, useSettings } from './context/SettingsContext';

const App: React.FC = () => {
    const { width, height } = useWindowSize();
    const { currentPose, setPose } = usePose();
    const {
        onionSkinning,
        loopMode,
    } = useSettings();

    const [animationDuration, setAnimationDuration] = useState(5000);
    const [currentTime, setCurrentTime] = useState(0);
    const [guidePositions, setGuidePositions] = useState({ x: 5, y: 90 });

    const {
        keyframes,
        setKeyframes,
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

    const keyframeTimes = keyframes.length > 0 ? keyframes.map(k => k.time) : [0];
    const maxTime = Math.max(...keyframeTimes);

    const startTime = 0;
    const endTime = Math.max(animationDuration, maxTime);

    const sortedKeyframes = [...keyframes].sort((a, b) => a.time - b.time);
    const currentKeyframeIndex = sortedKeyframes.findIndex(k => k.time >= currentTime);
    
    const prevKeyframePose = onionSkinning && currentKeyframeIndex > 0 ? sortedKeyframes[currentKeyframeIndex - 1].pose : null;
    const nextKeyframePose = onionSkinning && currentKeyframeIndex !== -1 && currentKeyframeIndex < sortedKeyframes.length - 1 ? sortedKeyframes[currentKeyframeIndex + 1].pose : null;

    const handleFrameChange = useCallback((time: number, clamp = true) => {
        const clampedTime = clamp ? Math.max(startTime, Math.min(time, endTime)) : time;
        setCurrentTime(clampedTime);
        scrubToTime(clampedTime);
    }, [setCurrentTime, scrubToTime, endTime, startTime]);

    const {
        isPlaying,
        handlePlay,
        setCurrentTime: setAnimationTime,
    } = useAnimation({
        animationDuration,
        onFrame: handleFrameChange,
        loop: loopMode !== 'none',
        pingPong: loopMode === 'pingPong',
    });

    const handleScrub = useCallback((time: number) => {
        handleFrameChange(time, true);
        setAnimationTime(time);
    }, [handleFrameChange, setAnimationTime]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                if (e.shiftKey) {
                    const frameDuration = 1000 / 60; // 60 FPS
                    handleScrub(currentTime - frameDuration);
                } else {
                    const prevKeyframes = sortedKeyframes.filter(k => k.time < currentTime);
                    if (prevKeyframes.length > 0) {
                        const prevKeyframe = prevKeyframes[prevKeyframes.length - 1];
                        handleSelectKeyframe(prevKeyframe.id);
                        handleScrub(prevKeyframe.time);
                    }
                }
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                if (e.shiftKey) {
                    const frameDuration = 1000 / 60; // 60 FPS
                    handleScrub(currentTime + frameDuration);
                } else {
                    const nextKeyframe = sortedKeyframes.find(k => k.time > currentTime);
                    if (nextKeyframe) {
                        handleSelectKeyframe(nextKeyframe.id);
                        handleScrub(nextKeyframe.time);
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentTime, handleScrub, sortedKeyframes, handleSelectKeyframe]);

    const handleSave = () => {
        const animationData = {
            version: "1.3.0",
            animationDuration,
            keyframes,
        };
        const data = JSON.stringify(animationData, null, 2);
        const blob = new Blob([data], { type: "application/json" });
        saveAs(blob, "animation.json");
    };

    const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const loadedData = JSON.parse(event.target?.result as string);
                    if (loadedData.keyframes && loadedData.animationDuration) {
                        setAnimationDuration(loadedData.animationDuration);
                        if (setKeyframes) {
                            setKeyframes(loadedData.keyframes);
                            if (loadedData.keyframes.length > 0) {
                                const sorted = [...loadedData.keyframes].sort((a: any, b: any) => a.time - b.time);
                                setPose(sorted[0].pose);
                            }
                        }
                        toast.success("Animation loaded successfully!");
                    } else if (loadedData.pose) {
                        setPose(loadedData.pose);
                        if (setKeyframes) {
                            setKeyframes([]);
                        }
                        toast.success("Pose loaded successfully!");
                    } else {
                        toast.error("Invalid file format.");
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
        <div className="App">
            <Toaster />
            <Sidebar>
                <Toolbar />
                <InspectorPanel>
                    <FileOperationsPanel onSave={handleSave} onLoad={handleLoad} />
                    <PropertiesPanel
                        boneLengths={currentPose}
                        onBoneLengthChange={(name: keyof Pose, value: number) => handleManualPoseChange({ ...currentPose, [name]: value })}
                    />
                    <AnimationPanel />
                </InspectorPanel>
            </Sidebar>
            <MainContent>
                <Viewport>
                    <PoseRenderer
                        draggable={true}
                        width={canvasSize}
                        height={canvasSize * 0.67}
                        pose={currentPose}
                        onPoseChange={handleManualPoseChange}
                        guidePositions={guidePositions}
                        setGuidePositions={setGuidePositions}
                        prevPose={prevKeyframePose}
                        nextPose={nextKeyframePose}
                    />
                </Viewport>
                <Timeline>
                    <PlayheadDisplay
                        keyframes={keyframes}
                        selectedKeyframeId={selectedKeyframeId}
                        onKeyframeSelect={handleSelectKeyframe}
                        onAddKeyframe={() => {
                            const newTime = handleAddKeyframe(currentTime);
                            if (typeof newTime === 'number') {
                                const isExtending = newTime > endTime;
                                handleFrameChange(newTime, !isExtending);
                                if (isExtending) {
                                    setAnimationTime(newTime);
                                }
                            }
                        }}
                        currentTime={currentTime}
                        startTime={0}
                        endTime={endTime}
                        onScrub={handleScrub}
                        onKeyframeTimeChange={handleKeyframeTimeChange}
                        onPlay={handlePlay}
                        isPlaying={isPlaying}
                        setAnimationDuration={setAnimationDuration}
                    />
                </Timeline>
            </MainContent>
        </div>
    );
}

const Root = () => (
    <PoseProvider>
        <SettingsProvider>
            <App />
        </SettingsProvider>
    </PoseProvider>
);

export default Root; 