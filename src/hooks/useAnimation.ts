import { useState, useEffect, useRef, useCallback } from 'react';

interface UseAnimationProps {
    animationDuration: number;
    onFrame: (time: number) => void;
    loop?: boolean;
    pingPong?: boolean;
    framerate?: number;
}

export const useAnimation = ({ animationDuration, onFrame, loop, pingPong, framerate = 60 }: UseAnimationProps) => {
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isReversing, setIsReversing] = useState(false);
    const animationFrameRef = useRef<number>();
    const lastFrameTimeRef = useRef<number>(0);
    const startTimeRef = useRef<number>(0);
    const startAnimationTimeRef = useRef<number>(0);

    const handlePlay = useCallback(() => {
        if (!isPlaying && currentTime >= animationDuration) {
            setCurrentTime(0);
            onFrame(0);
            setIsReversing(false);
        }
        setIsPlaying(prevIsPlaying => !prevIsPlaying);
    }, [animationDuration, currentTime, onFrame, isPlaying]);

    useEffect(() => {
        if (isReversing && !pingPong) {
            setIsReversing(false);
        }
    }, [pingPong, isReversing]);

    useEffect(() => {
        if (isPlaying) {
            // Initialize or reset timing when starting or when framerate changes
            startTimeRef.current = performance.now();
            startAnimationTimeRef.current = isReversing ? animationDuration - currentTime : currentTime;

            const animate = (timestamp: number) => {
                // Throttle to specified framerate
                const frameInterval = 1000 / framerate;
                if (timestamp - lastFrameTimeRef.current < frameInterval) {
                    animationFrameRef.current = requestAnimationFrame(animate);
                    return;
                }

                // Calculate animation time based on real time and framerate
                const realElapsed = timestamp - startTimeRef.current;
                const speedMultiplier = framerate / 60; // 60fps is baseline
                const animationElapsed = startAnimationTimeRef.current + (realElapsed * speedMultiplier);
                let newTime = isReversing ? animationDuration - animationElapsed : animationElapsed;

                if (isReversing) {
                    if (newTime <= 0) {
                        if (loop) {
                            setIsReversing(false);
                            startTimeRef.current = timestamp;
                            startAnimationTimeRef.current = 0;
                            onFrame(0);
                        } else {
                            setIsPlaying(false);
                            onFrame(0);
                        }
                    } else {
                        setCurrentTime(newTime);
                        onFrame(newTime);
                    }
                } else {
                    if (newTime >= animationDuration) {
                        if (loop) {
                            if (pingPong) {
                                setIsReversing(true);
                                startTimeRef.current = timestamp;
                                startAnimationTimeRef.current = 0;
                                onFrame(animationDuration);
                            } else {
                                setCurrentTime(0);
                                startTimeRef.current = timestamp;
                                startAnimationTimeRef.current = 0;
                                onFrame(0);
                            }
                        } else {
                            setIsPlaying(false);
                            setCurrentTime(animationDuration);
                            onFrame(animationDuration);
                        }
                    } else {
                        setCurrentTime(newTime);
                        onFrame(newTime);
                    }
                }

                lastFrameTimeRef.current = timestamp;

                if (isPlaying) {
                    animationFrameRef.current = requestAnimationFrame(animate);
                }
            };
            animationFrameRef.current = requestAnimationFrame(animate);
        } else {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isPlaying, animationDuration, onFrame, loop, pingPong, isReversing, currentTime, framerate]);

    return {
        currentTime,
        setCurrentTime,
        isPlaying,
        handlePlay,
    };
}; 