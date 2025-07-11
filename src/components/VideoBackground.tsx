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
    const [isRendering, setIsRendering] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        
        if (!canvas || !ctx || !videoElement || !isVideoLoaded) {
            return;
        }

        const renderFrame = () => {
            if (!videoElement || !ctx || isRendering) return;
            
            setIsRendering(true);
            
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
            } finally {
                setIsRendering(false);
            }
        };

        // Render initial frame
        renderFrame();

        // Set up animation frame loop for smooth playback
        let animationId: number;
        const animate = () => {
            renderFrame();
            animationId = requestAnimationFrame(animate);
        };
        
        if (videoElement.readyState >= 2) { // HAVE_CURRENT_DATA
            animate();
        }

        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
    }, [videoElement, isVideoLoaded, width, height, opacity, isRendering]);

    // Sync video time with timeline
    useEffect(() => {
        if (videoElement && isVideoLoaded && videoDuration > 0) {
            // Calculate video time based on current timeline time
            const videoTime = (currentTime / videoDuration) * videoElement.duration;
            if (Math.abs(videoElement.currentTime - videoTime) > 0.1) {
                videoElement.currentTime = videoTime;
            }
        }
    }, [currentTime, videoElement, isVideoLoaded, videoDuration]);

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