import { useState, useEffect, useRef, useCallback } from 'react';

interface UseAnimationProps {
    animationDuration: number;
    onFrame: (time: number) => void;
}

export const useAnimation = ({ animationDuration, onFrame }: UseAnimationProps) => {
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const animationFrameRef = useRef<number>();

    const handlePlay = useCallback(() => {
        if (currentTime >= animationDuration) {
            setCurrentTime(0);
        }
        setIsPlaying(prevIsPlaying => !prevIsPlaying);
    }, [animationDuration, currentTime]);

    useEffect(() => {
        if (isPlaying) {
            const startTime = Date.now() - currentTime;

            const animate = () => {
                const newTime = Date.now() - startTime;
                if (newTime >= animationDuration) {
                    setIsPlaying(false);
                    onFrame(animationDuration);
                } else {
                    setCurrentTime(newTime);
                    onFrame(newTime);
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
    }, [isPlaying, animationDuration, onFrame, currentTime]);

    return {
        currentTime,
        setCurrentTime,
        isPlaying,
        handlePlay,
    };
}; 