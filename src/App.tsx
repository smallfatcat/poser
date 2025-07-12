import React, { useState, useCallback, useEffect } from 'react';
import { PoseProvider, usePose } from './context/PoseContext';
import { VideoProvider, useVideo } from './context/VideoContext';
import { Toaster, toast } from 'react-hot-toast';
import Sidebar from './components/layout/Sidebar';
import MainContent from './components/layout/MainContent';
import Toolbar from './components/panels/Toolbar';
import InspectorPanel from './components/panels/InspectorPanel';
import Viewport from './components/layout/Viewport';
import Timeline from './components/layout/Timeline';
import PoseRenderer from './components/PoseRenderer';
import PlayheadDisplay from './components/PlayheadDisplay';
import JointAngleGraph from './components/JointAngleGraph';
import FileOperationsPanel from './components/panels/FileOperationsPanel';
import PropertiesPanel from './components/panels/PropertiesPanel';
import AnimationPanel from './components/panels/AnimationPanel';
import VideoPanel from './components/panels/VideoPanel';
import useWindowSize from './hooks/useWindowSize';
import { saveAs } from 'file-saver';
import { Pose } from './types';
import { useAnimation } from './hooks/useAnimation';
import { useKeyframes } from './hooks/useKeyframes';
import { SettingsProvider, useSettings } from './context/SettingsContext';

const App: React.FC = () => {
    const { width, height } = useWindowSize();
    const { currentPose, setPose } = usePose();
    const { videoDuration } = useVideo();
    const {
        onionSkinning,
        loopMode,
    } = useSettings();

    const [animationDuration, setAnimationDuration] = useState(5000);
    const [currentTime, setCurrentTime] = useState(0);
    const [guidePositions, setGuidePositions] = useState({ x: 5, y: 90 });
    const [videoOpacity, setVideoOpacity] = useState(0.5);
    const [showJointGraph, setShowJointGraph] = useState(true);

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

    const startTime = 0;
    // Use the animation duration as the fixed end time for the timeline
    const endTime = animationDuration;

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

    const addKeyframeAndAdjustTimeline = useCallback(() => {
        const newTime = handleAddKeyframe(currentTime);
        if (typeof newTime === 'number') {
            // Clamp the new time to the duration
            const clampedTime = Math.min(newTime, endTime);
            handleFrameChange(clampedTime, true);
        }
    }, [currentTime, endTime, handleAddKeyframe, handleFrameChange]);

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
            } else if (e.key === ' ') {
                e.preventDefault();
                addKeyframeAndAdjustTimeline();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentTime, handleScrub, sortedKeyframes, handleSelectKeyframe, addKeyframeAndAdjustTimeline]);

    const handleSave = () => {
        const animationData = {
            version: "1.3.2",
            animationDuration: endTime,
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
        return <div className="flex items-center justify-center h-screen bg-app-bg text-text-primary">Loading...</div>;
    }

    const canvasSize = Math.min(width * 0.9, height * 0.9, 800);
    const canvasWidth = canvasSize;
    const canvasHeight = canvasSize * 0.67;
    
    // Calculate the actual width available for the timeline
    // This should be the full width of the main content area
    const timelineWidth = width - 250; // Subtract sidebar width

    return (
        <div className="flex h-screen bg-app-bg">
            <Toaster />
            <Sidebar>
                <Toolbar
                    currentPose={currentPose}
                    onPoseChange={handleManualPoseChange}
                />
                <InspectorPanel>
                    <FileOperationsPanel onSave={handleSave} onLoad={handleLoad} />
                    <VideoPanel 
                        videoOpacity={videoOpacity}
                        onVideoOpacityChange={setVideoOpacity}
                    />
                    <PropertiesPanel
                        boneLengths={currentPose}
                        onBoneLengthChange={(name: string, value: number) => handleManualPoseChange({ ...currentPose, [name]: value })}
                    />
                    <AnimationPanel />
                </InspectorPanel>
            </Sidebar>
            <MainContent>
                <div className="flex flex-col h-full">
                    <div className="flex-1">
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
                                currentTime={currentTime}
                                videoOpacity={videoOpacity}
                            />
                        </Viewport>
                    </div>
                    <div className="flex-shrink-0">
                        <Timeline
                            canvasWidth={canvasWidth}
                            canvasHeight={canvasHeight}
                            timelineWidth={timelineWidth}
                        >
                            {/* @ts-expect-error Linter doesn't understand props passed via cloneElement */}
                            <PlayheadDisplay
                                keyframes={keyframes}
                                selectedKeyframeId={selectedKeyframeId}
                                onKeyframeSelect={handleSelectKeyframe}
                                onAddKeyframe={addKeyframeAndAdjustTimeline}
                                currentTime={currentTime}
                                startTime={0}
                                endTime={endTime}
                                onScrub={handleScrub}
                                onKeyframeTimeChange={handleKeyframeTimeChange}
                                onPlay={handlePlay}
                                isPlaying={isPlaying}
                                setAnimationDuration={setAnimationDuration}
                            />
                            {showJointGraph && (
                                <JointAngleGraph
                                    keyframes={keyframes}
                                    currentTime={currentTime}
                                    width={timelineWidth - 318} // Subtract space for controls (padding + gaps + buttons + time display + track constraints)
                                    height={200}
                                    selectedKeyframeId={selectedKeyframeId}
                                    startTime={0}
                                    endTime={endTime}
                                />
                            )}
                        </Timeline>
                    </div>
                    <div className="flex-shrink-0 flex items-center justify-between bg-panel-bg border-t border-border-color px-2 py-1">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowJointGraph(!showJointGraph)}
                                className={`px-3 py-1 text-sm rounded border transition-colors ${
                                    showJointGraph 
                                        ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
                                        : 'bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300'
                                }`}
                            >
                                {showJointGraph ? 'Hide' : 'Show'} Joint Graph
                            </button>
                        </div>
                    </div>
                </div>
            </MainContent>
        </div>
    );
}

const Root = () => (
    <PoseProvider>
        <SettingsProvider>
            <VideoProvider>
                <App />
            </VideoProvider>
        </SettingsProvider>
    </PoseProvider>
);

export default Root; 