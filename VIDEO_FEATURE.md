# Video Rotoscoping Feature

This feature allows users to load MP4 video files and use them as reference for rotoscoping animations. The video playback is synchronized with the timeline, making it easy to trace poses frame by frame.

## Features

### Video Loading
- Load MP4 video files through the "Load Video" button in the File Operations panel
- Supported formats: MP4, WebM, and other browser-supported video formats
- Video files are loaded locally and don't require internet connection

### Video Playback
- Video playback is automatically synchronized with the timeline
- When you scrub through the timeline, the video frame updates accordingly
- Video maintains its aspect ratio and fits within the canvas bounds
- Video is rendered behind the pose canvas with adjustable opacity

### Video Controls
- **Opacity Slider**: Adjust video transparency (0% to 100%)
- **Video Duration Display**: Shows total video length
- **Current Time Display**: Shows current video frame time
- **Clear Video**: Remove the loaded video reference

### Timeline Integration
- Video duration automatically extends the timeline if it's longer than the animation
- Timeline scrubbing updates the video frame in real-time
- Video time is calculated proportionally based on timeline position

## How to Use

1. **Load a Video**:
   - Click "Load Video" in the File Operations panel
   - Select an MP4 file from your computer
   - The video will appear behind the pose canvas

2. **Adjust Video Settings**:
   - Use the opacity slider in the Video Controls panel to adjust transparency
   - Monitor video duration and current time in the Video Controls panel

3. **Rotoscope**:
   - Scrub through the timeline to see different video frames
   - Adjust the pose to match the video reference
   - Add keyframes at important poses
   - The video will stay synchronized as you animate

4. **Clear Video**:
   - Click "Clear" next to the video filename to remove the video reference

## Technical Details

- Video is rendered using HTML5 Canvas for optimal performance
- Video frames are drawn with proper aspect ratio scaling
- Video element is muted to avoid audio conflicts
- Video context manages all video-related state and synchronization
- Video background component handles rendering and time synchronization

## File Structure

- `src/context/VideoContext.tsx` - Video state management
- `src/components/VideoBackground.tsx` - Video rendering component
- `src/components/panels/VideoPanel.tsx` - Video controls UI
- `src/components/panels/FileOperationsPanel.tsx` - Video loading UI

## Browser Compatibility

This feature works in all modern browsers that support:
- HTML5 Video API
- Canvas API
- File API
- Blob URLs 