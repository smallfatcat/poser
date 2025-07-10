# Poser - A React Pose Application

A React-based pose drawing application that allows for creating and manipulating stick figure poses with interactive controls.

## Features

- 🎨 **Interactive Pose-Drawing Canvas**: A customizable React component for rendering and dragging stick figure poses.
- 🎛️ **Advanced Pose Controls**: A dedicated control panel for fine-tuning poses.
- **Inverse Kinematics (IK)**: Enable or disable IK for realistic joint movement.
- **Relative & Absolute Constraints**: Switch between different constraint modes for dragging.
- **Adjustable Bone Lengths**: Dynamically change the length of limbs and torso.
- **Save & Load Poses**: Save your created poses as JSON files and load them back into the editor.
- **Joint Visibility Control**: Toggle the visibility of joints for a cleaner look.
- ⚡ **Performance Optimized**: Uses React hooks for efficient rendering and state management.
-  TypeScript support for the `PoseRenderer` component.

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

The application consists of two main components: `PoseRenderer` and `PoseControls`.

### `PoseRenderer`

This component renders the stick figure on the canvas. It can be used as a standalone component.

```jsx
import React, { useState } from 'react';
import PoseRenderer from './components/PoseRenderer';
import { initialPose } from './constants/initialPose'; // Assuming you have an initial pose

function MyPoseViewer() {
    const [pose, setPose] = useState(initialPose);

    const handlePoseChange = (newPose) => {
        setPose(newPose);
    };

    return (
        <PoseRenderer 
            pose={pose}
            draggable={true}
            onPoseChange={handlePoseChange}
            width={600}
            height={400}
        />
    );
}
```

### `PoseControls`

This component provides a UI to control various aspects of the pose and the renderer.

```jsx
// Example of integrating PoseControls (simplified)
function PoseEditor() {
    // ... state management for pose, constraints, IK, etc.

    return (
        <div>
            <PoseControls
                // ... pass props for controls
            />
            <PoseRenderer
                // ... pass props for renderer
            />
        </div>
    );
}
```

## `PoseRenderer` Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pose` | `Pose` | **required** | The pose data object. |
| `width` | `number` | `600` | Canvas width in pixels. |
| `height` | `number` | `400` | Canvas height in pixels. |
| `strokeColor` | `string` | `'#00ff00'` | Color of the stick figure. |
| `strokeWidth` | `number` | `3` | Width of the lines. |
| `headRadius` | `number` | `15` | Radius of the head circle. |
| `draggable` | `boolean` | `false` | Enable joint dragging. |
| `onPoseChange`| `function`| `null` | Callback when pose changes during dragging. |
| `jointColor` | `string` | `'#ffffff'` | Color of the draggable joint indicators. |
| `jointRadius`| `number` | `5` | Radius of the joint indicators. |
| `jointVisibility` | `'always' \| 'hover' \| 'never'` | `'hover'` | Controls when the joint indicators are visible. |
| `useRelativeConstraints` | `boolean` | `true`| Whether to use relative constraints when dragging. |
| `useInverseKinematics` | `boolean` | `true` | Whether to use inverse kinematics. |
| `boneLengths`| `object` | `{...}` | An object containing the lengths of the bones. |
| `onBoneLengthChange` | `function` | `null` | Callback when bone lengths are changed via controls. |
| `className` | `string` | `''` | CSS class name for the canvas element. |
| `style` | `object` | `{}` | Inline styles for the canvas element. |


## `PoseControls` Props

The `PoseControls` component offers a user interface for manipulating the pose and its properties.

| Prop | Description |
|------|-------------|
| `draggable` | Determines if interaction settings are shown. |
| `useRelativeConstraints` | State for the relative constraints toggle. |
| `setUseRelativeConstraints`| Function to toggle relative constraints. |
| `useInverseKinematics` | State for the IK toggle. |
| `setUseInverseKinematics`| Function to toggle IK. |
| `jointVisibility` | Current joint visibility mode. |
| `toggleJointVisibility`| Function to cycle through visibility modes. |
| `getJointVisibilityText`| Function that returns the text for the visibility button. |
| `savePoseData` | Function to trigger saving the current pose. |
| `onPoseLoad` | Function to handle loading a pose from a file. |
| `boneLengths` | An object with the current bone lengths for the sliders. |
| `onBoneLengthChange` | Function to handle changes from the bone length sliders. |


## Pose Data Structure

The `pose` object is a collection of points representing the joints of the stick figure.

```typescript
interface PosePoint {
    x: number;
    y: number;
}

interface Pose {
    head: PosePoint;
    neck: PosePoint;
    shoulder: PosePoint;
    leftUpperArm: PosePoint;
    leftLowerArm: PosePoint;
    leftHand: PosePoint;
    rightUpperArm: PosePoint;
    rightLowerArm: PosePoint;
    rightHand: PosePoint;
    hip: PosePoint;
    leftUpperLeg: PosePoint;
    leftLowerLeg: PosePoint;
    leftFoot: PosePoint;
    rightUpperLeg: PosePoint;
    rightLowerLeg: PosePoint;
    rightFoot: PosePoint;
}
```

## TypeScript Support

While the main application is written in JavaScript, the `PoseRenderer` component is fully typed and can be imported into a TypeScript project. A `PoseRenderer.d.ts` file is included.

```typescript
import PoseRenderer, { Pose } from './components/PoseRenderer';

const myPose: Pose = {
    head: { x: 300, y: 100 },
    // ... rest of pose data
};

const handlePoseChange = (newPose: Pose) => {
    console.log('Pose changed:', newPose);
};
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

MIT License 