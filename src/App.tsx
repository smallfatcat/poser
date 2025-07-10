import React, { useState, useCallback } from 'react';
import PoseRenderer from './components/PoseRenderer';
import useWindowSize from './hooks/useWindowSize';
import { PoseProvider, usePose } from './context/PoseContext';
import { Toaster } from 'react-hot-toast';
import KeyframeTimeline, { Keyframe } from './components/KeyframeTimeline';

const Editor: React.FC = () => {
    const { width, height } = useWindowSize();
    const { currentPose, onPoseChange } = usePose();

    const [keyframes, setKeyframes] = useState<Keyframe[]>([]);
    const [selectedKeyframeId, setSelectedKeyframeId] = useState<string | undefined>(undefined);

    const handleAddKeyframe = useCallback(() => {
        const newTime = keyframes.length > 0 ? Math.max(...keyframes.map(k => k.time)) + 1000 : 0;
        const newKeyframe: Keyframe = {
            id: `keyframe_${Date.now()}`,
            pose: JSON.parse(JSON.stringify(currentPose)), // Deep copy
            time: newTime,
        };
        setKeyframes(prev => [...prev, newKeyframe].sort((a, b) => a.time - b.time));
        setSelectedKeyframeId(newKeyframe.id);
    }, [currentPose, keyframes]);

    const handleSelectKeyframe = useCallback((id: string) => {
        const keyframe = keyframes.find(k => k.id === id);
        if (keyframe && onPoseChange) {
            onPoseChange(keyframe.pose);
            setSelectedKeyframeId(id);
        }
    }, [keyframes, onPoseChange]);

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
            />
            <KeyframeTimeline
                keyframes={keyframes}
                selectedKeyframeId={selectedKeyframeId}
                onKeyframeSelect={handleSelectKeyframe}
                onAddKeyframe={handleAddKeyframe}
            />
        </div>
    );
};


const App: React.FC = () => {
    return (
        <PoseProvider>
            <div className="App">
                <Toaster />
                <Editor />
            </div>
        </PoseProvider>
    );
}

export default App; 