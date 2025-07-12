import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useVideo } from '../context/VideoContext';

interface VideoBackgroundProps {
    width: number;
    height: number;
    currentTime: number;
    opacity?: number;
}

const VideoBackground: React.FC<VideoBackgroundProps> = ({
    width,
    height,
    currentTime,
    opacity = 0.5
}) => {
    const { videoElement, isVideoLoaded, videoDuration } = useVideo();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isSeeking, setIsSeeking] = useState(false);
    const [videoFrameRate, setVideoFrameRate] = useState(30);
    const lastRenderTimeRef = useRef<number>(0);
    const animationFrameRef = useRef<number>();

    // Throttled render function to reduce performance impact
    const renderFrame = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        
        if (!canvas || !ctx || !videoElement || !isVideoLoaded) {
            return;
        }

        const now = performance.now();
        const frameInterval = 1000 / videoFrameRate; // Time between frames in ms
        
        // Only render if enough time has passed since last render
        if (now - lastRenderTimeRef.current < frameInterval) {
            return;
        }
            
            try {
                // Clear canvas
                ctx.clearRect(0, 0, width, height);
                
                // Set opacity
                ctx.globalAlpha = opacity;
                
                // Calculate video dimensions to fit canvas while maintaining aspect ratio
                const videoAspect = videoElement.videoWidth / videoElement.videoHeight;
                const canvasAspect = width / height;
                
                let drawWidth, drawHeight, offsetX, offsetY;
                
                if (videoAspect > canvasAspect) {
                    // Video is wider than canvas
                    drawWidth = width;
                    drawHeight = width / videoAspect;
                    offsetX = 0;
                    offsetY = (height - drawHeight) / 2;
                } else {
                    // Video is taller than canvas
                    drawHeight = height;
                    drawWidth = height * videoAspect;
                    offsetX = (width - drawWidth) / 2;
                    offsetY = 0;
                }
                
                // Draw video frame
                ctx.drawImage(
                    videoElement,
                    offsetX,
                    offsetY,
                    drawWidth,
                    drawHeight
                );
                
                // Reset opacity
                ctx.globalAlpha = 1.0;
            
            lastRenderTimeRef.current = now;
            } catch (error) {
                console.error('Error rendering video frame:', error);
            }
    }, [videoElement, isVideoLoaded, width, height, opacity, videoFrameRate]);

    // Optimized video rendering loop
    useEffect(() => {
        if (!videoElement || !isVideoLoaded) {
            return;
                }

        const animate = () => {
            renderFrame();
            animationFrameRef.current = requestAnimationFrame(animate);
            };

        // Start the animation loop
        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [videoElement, isVideoLoaded, renderFrame]);

    // Handle video seeking events and detect frame rate
    useEffect(() => {
        if (!videoElement) return;

        const handleSeeking = () => setIsSeeking(true);
        const handleSeeked = () => {
            setIsSeeking(false);
            // Force a render after seeking
            renderFrame();
        };
        const handleLoadedMetadata = () => {
            // Try to detect frame rate from video properties
            if (videoElement.videoWidth && videoElement.videoHeight) {
                // For most web videos, assume 30fps unless we can detect otherwise
                setVideoFrameRate(30);
            }
        };

        videoElement.addEventListener('seeking', handleSeeking);
        videoElement.addEventListener('seeked', handleSeeked);
        videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);

        return () => {
            videoElement.removeEventListener('seeking', handleSeeking);
            videoElement.removeEventListener('seeked', handleSeeked);
            videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };
    }, [videoElement, renderFrame]);

    // Sync video time with timeline - optimized to reduce frequency
    useEffect(() => {
        if (videoElement && isVideoLoaded && videoDuration > 0 && videoElement.duration > 0 && !isSeeking) {
            // Calculate video time based on current timeline time
            const videoTime = Math.max(0, Math.min((currentTime / videoDuration) * videoElement.duration, videoElement.duration));
            
            // Round to the nearest frame boundary for more precise synchronization
            const frameDuration = 1 / videoFrameRate;
            const roundedVideoTime = Math.round(videoTime / frameDuration) * frameDuration;
            
            // Use a much smaller tolerance for frame-perfect synchronization
            const tolerance = 1 / videoFrameRate;
            
            // Only seek if the difference is significant enough to warrant a seek
            if (Math.abs(videoElement.currentTime - roundedVideoTime) > tolerance) {
                videoElement.currentTime = roundedVideoTime;
            }
        }
    }, [currentTime, videoElement, isVideoLoaded, videoDuration, isSeeking, videoFrameRate]);

    if (!isVideoLoaded) {
        return null;
    }

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="absolute top-0 left-0 z-0 pointer-events-none"
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 0,
                pointerEvents: 'none'
            }}
        />
    );
};

export default VideoBackground; 