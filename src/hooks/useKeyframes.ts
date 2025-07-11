import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Keyframe } from '../components/PlayheadDisplay';
import { Pose } from '../types';
import { interpolatePose } from '../utils/poseInterpolation';
import { usePose } from '../context/PoseContext';

interface UseKeyframesProps {
    animationDuration: number;
    setAnimationDuration: (duration: number) => void;
}

export const useKeyframes = ({
    animationDuration,
    setAnimationDuration,
}: UseKeyframesProps) => {
    const { currentPose, setPose } = usePose();
    const [keyframes, setKeyframes] = useState<Keyframe[]>([]);
    const [selectedKeyframeId, setSelectedKeyframeId] = useState<string | undefined>(undefined);
    const lastDurationRef = useRef(animationDuration);

    const keyframesRef = useRef(keyframes);
    keyframesRef.current = keyframes;

    useEffect(() => {
        if (lastDurationRef.current !== animationDuration && lastDurationRef.current > 0) {
            const ratio = animationDuration / lastDurationRef.current;
            const updatedKeyframes = keyframesRef.current.map(kf => ({
                ...kf,
                time: Math.round(kf.time * ratio)
            }));
            setKeyframes(updatedKeyframes);
        }
        lastDurationRef.current = animationDuration;
    }, [animationDuration]);

    useEffect(() => {
        if (keyframes.length === 0 && currentPose) {
            const initialKeyframe: Keyframe = {
                id: `keyframe_initial_${Date.now()}`,
                pose: JSON.parse(JSON.stringify(currentPose)), // Deep copy
                time: 0,
            };
            setKeyframes([initialKeyframe]);
            setSelectedKeyframeId(initialKeyframe.id);
        }
    }, [currentPose]);

    const scrubToTime = useCallback((time: number) => {
        const kfs = keyframesRef.current;
        if (kfs.length < 2) {
            if (kfs.length === 1) setPose(kfs[0].pose);
            return;
        }

        const sortedKeyframes = [...kfs].sort((a, b) => a.time - b.time);

        const prevKeyframe = sortedKeyframes.slice().reverse().find(k => k.time <= time);
        const nextKeyframe = sortedKeyframes.find(k => k.time >= time);

        if (prevKeyframe && nextKeyframe) {
            const duration = nextKeyframe.time - prevKeyframe.time;
            if (duration === 0) {
                setPose(prevKeyframe.pose);
                return;
            }
            const progress = (time - prevKeyframe.time) / duration;
            const interpolated = interpolatePose(prevKeyframe.pose, nextKeyframe.pose, progress);
            setPose(interpolated);
        } else if (prevKeyframe) {
            setPose(prevKeyframe.pose);
        } else if (nextKeyframe) {
            setPose(nextKeyframe.pose);
        }
    }, [setPose]);

    const handleKeyframeTimeChange = (id: string, time: number) => {
        const kfs = keyframesRef.current;
        const otherKeyframes = kfs.filter(k => k.id !== id);
        if (otherKeyframes.some(k => Math.abs(k.time - time) < 10)) { // 10ms threshold
            return;
        }

        const updatedKeyframes = kfs.map(k =>
            k.id === id ? { ...k, time } : k
        );

        const sortedNewKeyframes = [...updatedKeyframes].sort((a, b) => a.time - b.time);
        const newLastTime = sortedNewKeyframes[sortedNewKeyframes.length - 1].time;
        
        const sortedOldKeyframes = [...kfs].sort((a, b) => a.time - b.time);
        const oldLastKeyframe = sortedOldKeyframes[sortedOldKeyframes.length - 1];

        if ((oldLastKeyframe && oldLastKeyframe.id === id) || newLastTime > animationDuration) {
            setAnimationDuration(newLastTime);
            lastDurationRef.current = newLastTime;
        }

        setKeyframes(updatedKeyframes);
        scrubToTime(time);
    };

    const handleAddKeyframe = useCallback((time: number): number | undefined => {
        const kfs = keyframesRef.current;
        const keyframeAtCurrentTime = kfs.find(k => Math.abs(k.time - time) < 10);

        if (keyframeAtCurrentTime) {
            const sortedKeyframes = [...kfs].sort((a, b) => a.time - b.time);
            const selectedIndex = selectedKeyframeId ? sortedKeyframes.findIndex(k => k.id === selectedKeyframeId) : -1;

            if (selectedIndex === -1) {
                toast.error("Please select a keyframe to add a new one relative to it.");
                return;
            }

            let newTime: number;
            let didExtendDuration = false;

            if (sortedKeyframes.length === 1) {
                newTime = animationDuration;
            } else {
                const isLastFrame = selectedIndex === sortedKeyframes.length - 1;
                if (isLastFrame) {
                    newTime = animationDuration + 1000;
                    setAnimationDuration(newTime);
                    lastDurationRef.current = newTime;
                    didExtendDuration = true;
                } else {
                    const currentKeyframe = sortedKeyframes[selectedIndex];
                    const nextKeyframe = sortedKeyframes[selectedIndex + 1];
                    newTime = currentKeyframe.time + (nextKeyframe.time - currentKeyframe.time) / 2;
                }
            }

            const keyframeAtNewTime = kfs.find(k => k.time === newTime);
            if (keyframeAtNewTime) {
                toast.error("A keyframe already exists at the calculated time. Please adjust.");
                return;
            }

            if (!didExtendDuration && newTime > animationDuration) {
                setAnimationDuration(newTime);
                lastDurationRef.current = newTime;
            }

            const newKeyframe: Keyframe = {
                id: `keyframe_${Date.now()}`,
                pose: JSON.parse(JSON.stringify(currentPose)),
                time: newTime,
            };

            setKeyframes(prev => [...prev, newKeyframe].sort((a, b) => a.time - b.time));
            setSelectedKeyframeId(newKeyframe.id);
            toast.success("Keyframe added!");
            return newTime;

        } else {
            const newTime = time;
            if (newTime > animationDuration) {
                setAnimationDuration(newTime);
                lastDurationRef.current = newTime;
            }
            const newKeyframe: Keyframe = {
                id: `keyframe_${Date.now()}`,
                pose: JSON.parse(JSON.stringify(currentPose)),
                time: newTime,
            };
            setKeyframes(prev => [...prev, newKeyframe].sort((a, b) => a.time - b.time));
            setSelectedKeyframeId(newKeyframe.id);
            toast.success("Keyframe added!");
            return newTime;
        }
    }, [currentPose, selectedKeyframeId, animationDuration, setAnimationDuration]);

    const handleSelectKeyframe = useCallback((id: string) => {
        const keyframe = keyframesRef.current.find(k => k.id === id);
        if (keyframe && setPose) {
            setPose(keyframe.pose);
            setSelectedKeyframeId(id);
            scrubToTime(keyframe.time);
        }
    }, [setPose, scrubToTime]);

    const handleManualPoseChange = (newPose: Pose) => {
        setPose(newPose);

        if (selectedKeyframeId) {
            const updatedKeyframes = keyframesRef.current.map(k =>
                k.id === selectedKeyframeId ? { ...k, pose: newPose } : k
            );
            setKeyframes(updatedKeyframes);
        }
    };

    return {
        keyframes,
        setKeyframes,
        selectedKeyframeId,
        scrubToTime,
        handleKeyframeTimeChange,
        handleAddKeyframe,
        handleSelectKeyframe,
        handleManualPoseChange
    };
}; 