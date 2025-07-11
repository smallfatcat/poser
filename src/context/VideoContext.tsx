import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';

interface VideoContextType {
    videoFile: File | null;
    videoUrl: string | null;
    videoElement: HTMLVideoElement | null;
    isVideoLoaded: boolean;
    videoDuration: number;
    currentVideoTime: number;
    loadVideo: (file: File) => void;
    clearVideo: () => void;
    setVideoTime: (time: number) => void;
    playVideo: () => void;
    pauseVideo: () => void;
    seekVideo: (time: number) => void;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export const useVideo = () => {
    const context = useContext(VideoContext);
    if (context === undefined) {
        throw new Error('useVideo must be used within a VideoProvider');
    }
    return context;
};

interface VideoProviderProps {
    children: React.ReactNode;
}

export const VideoProvider: React.FC<VideoProviderProps> = ({ children }) => {
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const [videoDuration, setVideoDuration] = useState(0);
    const [currentVideoTime, setCurrentVideoTime] = useState(0);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const loadVideo = useCallback((file: File) => {
        // Clean up previous video URL
        if (videoUrl) {
            URL.revokeObjectURL(videoUrl);
        }

        const url = URL.createObjectURL(file);
        setVideoFile(file);
        setVideoUrl(url);
        setIsVideoLoaded(false);
        setCurrentVideoTime(0);

        // Create video element if it doesn't exist
        if (!videoRef.current) {
            videoRef.current = document.createElement('video');
            videoRef.current.crossOrigin = 'anonymous';
            videoRef.current.muted = true;
            videoRef.current.loop = false;
            videoRef.current.preload = 'auto';
            videoRef.current.playsInline = true;
        }

        videoRef.current.src = url;
        videoRef.current.load();

        videoRef.current.addEventListener('loadedmetadata', () => {
            if (videoRef.current) {
                setVideoDuration(videoRef.current.duration * 1000); // Convert to milliseconds
                setIsVideoLoaded(true);
            }
        });

        videoRef.current.addEventListener('timeupdate', () => {
            if (videoRef.current) {
                setCurrentVideoTime(videoRef.current.currentTime * 1000); // Convert to milliseconds
            }
        });
    }, [videoUrl]);

    const clearVideo = useCallback(() => {
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.src = '';
        }
        if (videoUrl) {
            URL.revokeObjectURL(videoUrl);
        }
        setVideoFile(null);
        setVideoUrl(null);
        setIsVideoLoaded(false);
        setVideoDuration(0);
        setCurrentVideoTime(0);
    }, [videoUrl]);

    const setVideoTime = useCallback((time: number) => {
        if (videoRef.current && isVideoLoaded) {
            const videoTime = time / 1000; // Convert from milliseconds to seconds
            // Ensure the time is within valid bounds
            const clampedTime = Math.max(0, Math.min(videoTime, videoRef.current.duration));
            videoRef.current.currentTime = clampedTime;
        }
    }, [isVideoLoaded]);

    const playVideo = useCallback(() => {
        if (videoRef.current && isVideoLoaded) {
            videoRef.current.play();
        }
    }, [isVideoLoaded]);

    const pauseVideo = useCallback(() => {
        if (videoRef.current) {
            videoRef.current.pause();
        }
    }, []);

    const seekVideo = useCallback((time: number) => {
        setVideoTime(time);
    }, [setVideoTime]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (videoUrl) {
                URL.revokeObjectURL(videoUrl);
            }
        };
    }, [videoUrl]);

    const value: VideoContextType = {
        videoFile,
        videoUrl,
        videoElement: videoRef.current,
        isVideoLoaded,
        videoDuration,
        currentVideoTime,
        loadVideo,
        clearVideo,
        setVideoTime,
        playVideo,
        pauseVideo,
        seekVideo,
    };

    return (
        <VideoContext.Provider value={value}>
            {children}
        </VideoContext.Provider>
    );
}; 