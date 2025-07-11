import React, { useRef, useEffect, useState } from 'react';
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
    const [videoFrameRate, setVideoFrameRate] = useState(30); // Default to 30fps

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        
        if (!canvas || !ctx || !videoElement || !isVideoLoaded) {
            return;
        }

        const renderFrame = () => {
            if (!videoElement || !ctx) return;
            
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
            } catch (error) {
                console.error('Error rendering video frame:', error);
            }
        };

        let callbackId: number;

        if ('requestVideoFrameCallback' in videoElement) {
            const onFrame: VideoFrameRequestCallback = (now, metadata) => {
                renderFrame();
                // Re-register for the next frame if the video is not paused.
                // When paused, we rely on the currentTime effect to trigger a redraw.
                if (!videoElement.paused) {
                    callbackId = videoElement.requestVideoFrameCallback(onFrame);
                }
            };
            callbackId = videoElement.requestVideoFrameCallback(onFrame);
            // Also render a frame immediately in case the video is paused
            renderFrame();
        } else {
            // Fallback for browsers that don't support it
            const animate = () => {
                renderFrame();
                callbackId = requestAnimationFrame(animate);
            };
            callbackId = requestAnimationFrame(animate);
        }

        return () => {
            if ('requestVideoFrameCallback' in videoElement && videoElement.cancelVideoFrameCallback) {
                videoElement.cancelVideoFrameCallback(callbackId);
            } else {
                cancelAnimationFrame(callbackId);
            }
        };
    }, [videoElement, isVideoLoaded, width, height, opacity, currentTime]);

    // Handle video seeking events and detect frame rate
    useEffect(() => {
        if (!videoElement) return;

        const handleSeeking = () => setIsSeeking(true);
        const handleSeeked = () => setIsSeeking(false);
        const handleLoadedMetadata = () => {
            // Try to detect frame rate from video properties
            // This is a rough estimation - browsers don't always provide accurate frame rate info
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
    }, [videoElement]);

    // Sync video time with timeline
    useEffect(() => {
        if (videoElement && isVideoLoaded && videoDuration > 0 && videoElement.duration > 0 && !isSeeking) {
            // Calculate video time based on current timeline time
            // videoDuration here is the animation duration, not the video duration
            const videoTime = Math.max(0, Math.min((currentTime / videoDuration) * videoElement.duration, videoElement.duration));
            
            // Round to the nearest frame boundary for more precise synchronization
            const frameDuration = 1 / videoFrameRate;
            const roundedVideoTime = Math.round(videoTime / frameDuration) * frameDuration;
            
            // Use a much smaller tolerance for frame-perfect synchronization
            // Use the video's frame rate to determine tolerance
            const tolerance = 1 / videoFrameRate;
            
            // Only seek if the difference is significant enough to warrant a seek
            if (Math.abs(videoElement.currentTime - roundedVideoTime) > tolerance) {
                // Use a more precise seeking method
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