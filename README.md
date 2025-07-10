# PoseRenderer - Reusable React Component

A lightweight, customizable React component for rendering stick figure poses on HTML5 Canvas with interactive dragging capabilities.

## Features

- 🎨 **Customizable styling**: Change colors, stroke width, and head radius
- 📏 **Flexible sizing**: Adjust canvas width and height
- 🎯 **TypeScript support**: Full TypeScript definitions included
- ⚡ **Performance optimized**: Uses React hooks for efficient rendering
- 🎨 **CSS integration**: Supports className and style props
- 🖱️ **Interactive dragging**: Drag joints to modify poses in real-time
- 📊 **State management**: Maintain pose state with change callbacks

## Installation

Copy the `PoseRenderer.jsx` and `PoseRenderer.d.ts` files to your React project.

## Basic Usage

```jsx
import React from 'react';
import PoseRenderer from './components/PoseRenderer';

const examplePose = {
    head: { x: 300, y: 100 },
    neck: { x: 300, y: 130 },
    shoulder: { x: 300, y: 150 },
    leftUpperArm: { x: 270, y: 180 },
    leftLowerArm: { x: 250, y: 225 },
    leftHand: { x: 250, y: 250 },
    rightUpperArm: { x: 330, y: 180 },
    rightLowerArm: { x: 350, y: 225 },
    rightHand: { x: 350, y: 250 },
    hip: { x: 300, y: 230 },
    leftUpperLeg: { x: 280, y: 290 },
    leftLowerLeg: { x: 275, y: 345 },
    leftFoot: { x: 245, y: 345 },
    rightUpperLeg: { x: 320, y: 290 },
    rightLowerLeg: { x: 325, y: 345 },
    rightFoot: { x: 355, y: 345 }
};

function App() {
    return (
        <div>
            <h1>My Pose App</h1>
            <PoseRenderer pose={examplePose} />
        </div>
    );
}
```

## Interactive Dragging

Enable dragging to allow users to modify poses:

```jsx
import React, { useState } from 'react';
import PoseRenderer from './components/PoseRenderer';

function InteractiveApp() {
    const [pose, setPose] = useState(examplePose);

    const handlePoseChange = (newPose) => {
        setPose(newPose);
    };

    return (
        <div>
            <h1>Interactive Pose Editor</h1>
            <PoseRenderer 
                pose={pose}
                draggable={true}
                onPoseChange={handlePoseChange}
            />
        </div>
    );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pose` | `Pose` | **required** | The pose data object |
| `width` | `number` | `600` | Canvas width in pixels |
| `height` | `number` | `400` | Canvas height in pixels |
| `strokeColor` | `string` | `'#00ff00'` | Color of the stick figure |
| `strokeWidth` | `number` | `3` | Width of the lines |
| `headRadius` | `number` | `15` | Radius of the head circle |
| `className` | `string` | `''` | CSS class name |
| `style` | `object` | `{}` | Inline styles |
| `draggable` | `boolean` | `false` | Enable joint dragging |
| `onPoseChange` | `function` | `null` | Callback when pose changes |

## Advanced Usage

### Custom Styling

```jsx
<PoseRenderer 
    pose={myPose}
    strokeColor="#ff0000"
    strokeWidth={5}
    headRadius={20}
    className="my-pose-canvas"
    style={{ border: '2px solid #333' }}
/>
```

### Interactive Pose Editor

```jsx
function PoseEditor() {
    const [pose, setPose] = useState(initialPose);
    const [poseHistory, setPoseHistory] = useState([]);

    const handlePoseChange = (newPose) => {
        setPose(newPose);
        setPoseHistory(prev => [...prev.slice(-9), newPose]);
    };

    const resetPose = () => {
        setPose(initialPose);
        setPoseHistory([]);
    };

    return (
        <div>
            <button onClick={resetPose}>Reset</button>
            <PoseRenderer 
                pose={pose}
                draggable={true}
                onPoseChange={handlePoseChange}
            />
            <pre>{JSON.stringify(pose, null, 2)}</pre>
        </div>
    );
}
```

### Different Sizes

```jsx
// Small pose
<PoseRenderer pose={pose} width={300} height={200} />

// Large pose
<PoseRenderer pose={pose} width={800} height={600} />
```

### Multiple Poses

```jsx
function PoseGallery() {
    return (
        <div className="pose-gallery">
            <PoseRenderer pose={pose1} strokeColor="#ff0000" />
            <PoseRenderer pose={pose2} strokeColor="#00ff00" />
            <PoseRenderer pose={pose3} strokeColor="#0000ff" />
        </div>
    );
}
```

## Pose Data Structure

The pose object should contain the following points:

```typescript
interface Pose {
    head: { x: number, y: number };
    neck: { x: number, y: number };
    shoulder: { x: number, y: number };
    leftUpperArm: { x: number, y: number };
    leftLowerArm: { x: number, y: number };
    leftHand: { x: number, y: number };
    rightUpperArm: { x: number, y: number };
    rightLowerArm: { x: number, y: number };
    rightHand: { x: number, y: number };
    hip: { x: number, y: number };
    leftUpperLeg: { x: number, y: number };
    leftLowerLeg: { x: number, y: number };
    leftFoot: { x: number, y: number };
    rightUpperLeg: { x: number, y: number };
    rightLowerLeg: { x: number, y: number };
    rightFoot: { x: number, y: number };
}
```

## Dragging Features

When `draggable={true}` is enabled:

- **Joint indicators**: White dots appear at each joint position
- **Drag interaction**: Click and drag joints to move them
- **Real-time updates**: Pose updates immediately as you drag
- **State management**: Parent component receives pose changes via `onPoseChange`
- **Visual feedback**: Cursor changes to indicate draggable areas
- **Smooth interaction**: Joints follow mouse movement smoothly

## TypeScript Support

If you're using TypeScript, the component includes full type definitions:

```typescript
import PoseRenderer, { Pose, PosePoint } from './components/PoseRenderer';

const myPose: Pose = {
    head: { x: 300, y: 100 },
    // ... rest of pose data
};

const handlePoseChange = (newPose: Pose) => {
    // console.log('Pose changed:', newPose); // Removed console.log
};
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

MIT License - feel free to use in your projects! 