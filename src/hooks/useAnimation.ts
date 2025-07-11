import { useState, useEffect, useRef, useCallback } from 'react';

interface UseAnimationProps {
    animationDuration: number;
    onFrame: (time: number) => void;
    loop?: boolean;
    pingPong?: boolean;
}

export const useAnimation = ({ animationDuration, onFrame, loop, pingPong }: UseAnimationProps) => {
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isReversing, setIsReversing] = useState(false);
    const animationFrameRef = useRef<number>();

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
            let startTime = performance.now() - (isReversing ? animationDuration - currentTime : currentTime);

            const animate = () => {
                const elapsed = performance.now() - startTime;
                let newTime = isReversing ? animationDuration - elapsed : elapsed;

                if (isReversing) {
                    if (newTime <= 0) {
                        if (loop) {
                            setIsReversing(false);
                            startTime = performance.now(); 
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
                                startTime = performance.now();
                                onFrame(animationDuration);
                            } else {
                                setCurrentTime(0);
                                startTime = performance.now();
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
    }, [isPlaying, animationDuration, onFrame, loop, pingPong, isReversing, currentTime]);


    return {
        currentTime,
        setCurrentTime,
        isPlaying,
        handlePlay,
    };
}; 