# Poser - A React Pose and Animation Application

A React-based application for creating and animating 2D stick figures with a keyframe-based timeline.

## Features

- 🎨 **Interactive Pose-Drawing Canvas**: A customizable React component for rendering and dragging stick figure poses.
- 🎬 **Keyframe Animation**: Create animations by setting poses at different points in time on a timeline.
- ⏱️ **Timeline & Playback**: A timeline with a playhead, keyframe markers, and playback controls (play, pause, loop).
- 🎛️ **Advanced Interaction Controls**: A toolbar for fine-tuning interaction settings.
- **Inverse Kinematics (IK)**: Enable or disable IK for more natural joint movement when dragging.
- **Adjustable Bone Lengths**: Dynamically change the length of limbs and torso with separate left/right controls.
- **Bone Length Animation**: Animate individual bone lengths for more realistic movement and character development. Works independently of scaling.
- **Save & Load**: Save your animations or static poses as JSON files and load them back into the editor.
- **Joint Visibility Control**: Toggle the visibility of joints for a cleaner look.
- 🧅 **Onion Skinning**: View previous and next keyframes as ghost poses for better animation reference.
- 🔄 **Loop Modes**: Choose between no loop, regular loop, or ping-pong animation modes.
- ⌨️ **Keyboard Shortcuts**: Navigate between keyframes and add keyframes with keyboard controls.
- ⚡ **Built with TypeScript & Vite**: A modern, fast, and type-safe development environment.

## Getting Started

To get the application running on your local machine, follow these steps:

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/smallfatcat/poser.git
    cd poser
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Run the development server:**
    ```sh
    npm run dev
    ```
    This will start the Vite development server, and you can view the application at `http://localhost:5173`.

## How to Use

The application's UI is divided into several panels:

*   **Viewport**: The main canvas where the pose is rendered and can be interactively manipulated.
*   **Timeline**: Below the viewport, this panel shows the animation timeline, keyframes, and playback controls.
*   **Sidebar**: Contains all the control panels.
    *   **Toolbar**: Toggles for Inverse Kinematics, Relative Constraints, Joint Visibility, and Onion Skinning.
    *   **File Operations**: Buttons to save and load animation or pose files.
    *   **Properties**: Sliders to adjust the length of each bone in the pose, with separate controls for left and right sides.
    *   **Animation**: Settings for animation duration, time display (seconds/frames), and loop mode.

## Keyboard Shortcuts

- **Left Arrow**: Navigate to previous keyframe
- **Right Arrow**: Navigate to next keyframe
- **Shift + Left Arrow**: Step back one frame (60 FPS)
- **Shift + Right Arrow**: Step forward one frame (60 FPS)
- **Spacebar**: Add keyframe at current time

## `PoseRenderer` Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pose` | `Pose` | **required** | The pose data object. |
| `onPoseChange`| `(pose: Pose) => void`| **required** | Callback when pose changes during dragging. |
| `width` | `number` | `600` | Canvas width in pixels. |
| `height` | `number` | `400` | Canvas height in pixels. |
| `draggable` | `boolean` | `false` | Enable joint dragging. |
| `useRelativeConstraints` | `boolean` | `true`| Whether to use relative constraints when dragging. |
| `useInverseKinematics` | `boolean` | `true` | Whether to use inverse kinematics. |
| `jointVisibility` | `'always' \| 'hover' \| 'never'` | `'hover'` | Controls when the joint indicators are visible. |
| `strokeColor` | `string` | `'#00ff00'` | Color of the stick figure. |
| `strokeWidth` | `number` | `3` | Width of the lines. |
| `headRadius` | `number` | `15` | Radius of the head circle. |
| `prevPose` | `Pose \| null` | `null` | Previous keyframe pose for onion skinning. |
| `nextPose` | `Pose \| null` | `null` | Next keyframe pose for onion skinning. |

## Data Structure

The application can save and load animations or single poses as JSON files.

### Animation File Structure

```json
{
  "version": "1.3.2",
  "animationDuration": 5000,
  "keyframes": [
    {
      "id": "keyframe_1672000000000",
      "pose": {
        "hip": { "x": 300, "y": 218 },
        "torsoLength": 80,
        // ... other pose properties
      },
      "time": 0
    },
    {
      "id": "keyframe_1672000005000",
      "pose": {
        "hip": { "x": 350, "y": 218 },
        "torsoLength": 80,
        // ... other pose properties
      },
      "time": 5000
    }
  ]
}
```

### Pose File Structure

If the file contains only a single pose (not an animation), it will have a simpler structure:

```json
{
    "pose": {
        "hip": { "x": 300, "y": 218 },
        "torsoLength": 80,
        // ... other pose properties
    }
}
```

The `pose` object itself contains a mix of coordinates, angles, and lengths:
-   `hip`: The `(x, y)` coordinates for the base position of the pose.
-   `...Length`: The length of each body part in pixels. These are adjustable via the "Properties" panel.
-   `...Angle`: The angle of each joint in degrees, relative to its parent.

This structure allows for a flexible and detailed representation of the pose and animations.

## TypeScript

The entire application is built with TypeScript. All components and data structures are fully typed, providing excellent developer experience with autocomplete and type safety.

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+ 