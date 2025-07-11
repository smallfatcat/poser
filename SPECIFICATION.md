# Poser - Application Specification

## Overview

Poser is a React-based 2D pose drawing and animation application built with TypeScript and Vite. It provides an interactive canvas for creating and animating stick figure poses using keyframe-based animation techniques.

## Version Information

- **Current Version**: 1.3.2
- **Framework**: React 18.2.0 with TypeScript
- **Build Tool**: Vite 7.0.3
- **Deployment**: GitHub Pages
- **License**: MIT

## Core Features

### 1. Interactive Pose Drawing
- **Canvas-based rendering** using HTML5 Canvas
- **Real-time pose manipulation** through joint dragging
- **Inverse Kinematics (IK)** support for natural joint movement
- **Relative and absolute constraint modes** for joint behavior
- **Configurable joint visibility** (always, hover, never)

### 2. Keyframe Animation System
- **Timeline-based animation** with visual keyframe markers
- **Smooth pose interpolation** between keyframes
- **Real-time scrubbing** through animation timeline
- **Automatic keyframe generation** at current time position
- **Keyframe selection and editing** capabilities

### 3. Animation Playback
- **Play/pause controls** with real-time animation
- **Multiple loop modes**: none, loop, ping-pong
- **Frame-by-frame navigation** (60 FPS)
- **Keyboard shortcuts** for timeline navigation
- **Animation duration control**

### 4. Onion Skinning
- **Ghost pose visualization** of previous and next keyframes
- **Configurable onion skinning** toggle
- **Visual reference** for animation continuity

### 5. File Operations
- **Save animations** as JSON files with version control
- **Load animations** from JSON files
- **Export single poses** as JSON
- **Version compatibility** (supports v1.3.0+)

## Technical Architecture

### Project Structure

```
src/
├── components/
│   ├── layout/           # Layout components (Sidebar, MainContent, Viewport, Timeline)
│   ├── panels/           # Control panels (Toolbar, Inspector, Properties, Animation, FileOps)
│   ├── PoseRenderer.tsx  # Main canvas component
│   ├── PoseCanvas.tsx    # Canvas drawing logic
│   └── PlayheadDisplay.tsx # Timeline and playback controls
├── context/
│   ├── PoseContext.tsx   # Global pose state management
│   └── SettingsContext.tsx # Application settings state
├── hooks/
│   ├── useAnimation.ts   # Animation playback logic
│   ├── useKeyframes.ts   # Keyframe management
│   ├── usePoseInteraction.ts # Pose manipulation and IK
│   └── useWindowSize.ts  # Responsive window sizing
├── utils/
│   ├── kinematics.ts     # Inverse kinematics calculations
│   ├── poseInterpolation.ts # Pose interpolation and easing
│   ├── poseAngleToCoordinates.ts # Coordinate system conversion
│   └── drawing.ts        # Canvas drawing utilities
├── constants/
│   └── joints.ts         # Joint hierarchy and IK chain definitions
├── types.ts              # TypeScript type definitions
└── App.tsx               # Main application component
```

### Data Models

#### Pose Interface
```typescript
interface Pose {
    hip: Vector2;                    // Base position coordinates
    torsoAngle: number;              // Torso rotation angle
    headAngle: number;               // Head rotation angle
    neckLength: number;              // Neck segment length
    headRadius: number;              // Head circle radius
    
    // Arm angles and lengths
    leftUpperArmAngle: number;
    leftLowerArmAngle: number;
    leftHandAngle: number;
    rightUpperArmAngle: number;
    rightLowerArmAngle: number;
    rightHandAngle: number;
    shoulderWidth: number;
    upperArmLength: number;
    lowerArmLength: number;
    handLength: number;
    
    // Leg angles and lengths
    leftUpperLegAngle: number;
    leftLowerLegAngle: number;
    leftFootAngle: number;
    rightUpperLegAngle: number;
    rightLowerLegAngle: number;
    rightFootAngle: number;
    upperLegLength: number;
    lowerLegLength: number;
    footLength: number;
    
    torsoLength: number;             // Torso segment length
}
```

#### Keyframe Interface
```typescript
interface Keyframe {
    id: string;                      // Unique identifier
    pose: Pose;                      // Pose data at this time
    time: number;                    // Time position in milliseconds
}
```

#### Animation File Format
```json
{
    "version": "1.3.2",
    "animationDuration": 5000,
    "keyframes": [
        {
            "id": "keyframe_1672000000000",
            "pose": { /* Pose object */ },
            "time": 0
        }
    ]
}
```

### Core Systems

#### 1. Pose Rendering System
- **Component**: `PoseRenderer.tsx`
- **Canvas Management**: `PoseCanvas.tsx`
- **Drawing Utilities**: `utils/drawing.ts`
- **Coordinate Conversion**: `utils/poseAngleToCoordinates.ts`

**Features:**
- Real-time pose visualization
- Joint highlighting on hover
- Draggable joint manipulation
- Onion skinning support
- Configurable visual styles

#### 2. Inverse Kinematics System
- **File**: `utils/kinematics.ts`
- **Algorithm**: FABRIK (Forward And Backward Reaching Inverse Kinematics)
- **Chains**: Arms, legs, and head IK chains
- **Constraints**: Relative and absolute joint constraints

**IK Chains:**
- Left Arm: `[hip, shoulder, leftUpperArm, leftLowerArm, leftHand]`
- Right Arm: `[hip, shoulder, rightUpperArm, rightLowerArm, rightHand]`
- Left Leg: `[hip, leftUpperLeg, leftLowerLeg, leftFoot]`
- Right Leg: `[hip, rightUpperLeg, rightLowerLeg, rightFoot]`
- Head: `[hip, shoulder, head]`

#### 3. Animation System
- **Hook**: `useAnimation.ts`
- **Playback Engine**: RequestAnimationFrame-based
- **Loop Modes**: None, loop, ping-pong
- **Frame Rate**: 60 FPS

**Features:**
- Smooth real-time playback
- Multiple loop behaviors
- Frame-accurate timing
- Keyboard navigation support

#### 4. Keyframe Management
- **Hook**: `useKeyframes.ts`
- **Interpolation**: `utils/poseInterpolation.ts`
- **Timeline Integration**: `PlayheadDisplay.tsx`

**Features:**
- Automatic keyframe generation
- Pose interpolation between keyframes
- Keyframe selection and editing
- Timeline scrubbing
- Duration management

#### 5. State Management
- **Pose Context**: Global pose state and manipulation
- **Settings Context**: Application-wide settings
- **Local State**: Component-specific state management

## User Interface

### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│                    Application                          │
├─────────────┬───────────────────────────────────────────┤
│   Sidebar   │              Main Content                │
│             │                                           │
│ ┌─────────┐ │  ┌─────────────────────────────────────┐  │
│ │ Toolbar │ │  │            Viewport                 │  │
│ └─────────┘ │  │         (Canvas Area)               │  │
│             │  └─────────────────────────────────────┘  │
│ ┌─────────┐ │  ┌─────────────────────────────────────┐  │
│ │Inspector│ │  │            Timeline                 │  │
│ │ Panel   │ │  │     (Playhead & Keyframes)         │  │
│ └─────────┘ │  └─────────────────────────────────────┘  │
└─────────────┴───────────────────────────────────────────┘
```

### Control Panels

#### Toolbar
- **Inverse Kinematics Toggle**: Enable/disable IK for joint dragging
- **Relative Constraints Toggle**: Switch between relative/absolute joint constraints
- **Joint Visibility Toggle**: Cycle through joint visibility modes
- **Onion Skinning Toggle**: Enable/disable ghost pose visualization

#### Inspector Panel
- **File Operations**: Save/load animation and pose files
- **Properties**: Adjust bone lengths and proportions
- **Animation Settings**: Duration, time display, loop mode controls

#### Timeline
- **Playhead**: Visual indicator of current animation time
- **Keyframe Markers**: Visual representation of keyframes
- **Playback Controls**: Play/pause, loop mode selection
- **Scrubbing**: Click to jump to specific time positions

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Left Arrow` | Navigate to previous keyframe |
| `Right Arrow` | Navigate to next keyframe |
| `Shift + Left Arrow` | Step back one frame (60 FPS) |
| `Shift + Right Arrow` | Step forward one frame (60 FPS) |
| `Spacebar` | Add keyframe at current time |

## Configuration Options

### Pose Renderer Props
```typescript
interface PoseRendererProps {
    pose: Pose;                                    // Required: Current pose data
    onPoseChange: (pose: Pose) => void;           // Required: Pose change callback
    width?: number;                               // Default: 600
    height?: number;                              // Default: 400
    draggable?: boolean;                          // Default: false
    useRelativeConstraints?: boolean;             // Default: true
    useInverseKinematics?: boolean;               // Default: true
    jointVisibility?: 'always' | 'hover' | 'never'; // Default: 'hover'
    strokeColor?: string;                         // Default: '#00ff00'
    strokeWidth?: number;                         // Default: 3
    headRadius?: number;                          // Default: 15
    prevPose?: Pose | null;                       // Default: null (onion skinning)
    nextPose?: Pose | null;                       // Default: null (onion skinning)
}
```

### Settings Configuration
```typescript
interface Settings {
    useRelativeConstraints: boolean;              // Joint constraint mode
    useInverseKinematics: boolean;                // IK system toggle
    jointVisibility: 'always' | 'hover' | 'never'; // Joint display mode
    onionSkinning: boolean;                       // Ghost pose visualization
    timeDisplayMode: 'seconds' | 'frames';        // Timeline display format
    loopMode: 'none' | 'loop' | 'pingPong';       // Animation loop behavior
}
```

## Performance Considerations

### Optimization Strategies
1. **Canvas Rendering**: Efficient drawing with minimal redraws
2. **State Management**: Optimized re-renders using React hooks
3. **Animation Loop**: RequestAnimationFrame for smooth 60 FPS playback
4. **Memory Management**: Proper cleanup of animation frames and event listeners

### Browser Support
- **Chrome**: 60+
- **Firefox**: 55+
- **Safari**: 12+
- **Edge**: 79+

## Development Environment

### Prerequisites
- Node.js (v16+)
- npm or yarn package manager

### Setup Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

### Development Tools
- **TypeScript**: Full type safety and IntelliSense
- **Vite**: Fast development server and build tool
- **React DevTools**: Component inspection and debugging
- **Storybook**: Component development and testing (optional)

## File Format Compatibility

### Version History
- **v1.3.0+**: Current format with animation duration and keyframes
- **Legacy**: Single pose files with pose object only

### Import/Export Support
- **Export**: Animation files with version metadata
- **Import**: Backward compatible with pose-only files
- **Validation**: Error handling for invalid file formats

## Future Enhancements

### Potential Features
1. **Easing Functions**: Additional animation easing options
2. **Layer System**: Multiple pose layers for complex animations
3. **Export Formats**: GIF, MP4, or sprite sheet export
4. **Undo/Redo**: History management for pose changes
5. **Pose Libraries**: Pre-built pose collections
6. **Collaboration**: Real-time multi-user editing
7. **Mobile Support**: Touch-optimized interface
8. **Performance Monitoring**: FPS and memory usage tracking

### Technical Improvements
1. **WebGL Rendering**: Hardware-accelerated graphics
2. **Web Workers**: Background processing for complex calculations
3. **Service Workers**: Offline functionality and caching
4. **PWA Support**: Progressive Web App capabilities
5. **Accessibility**: Screen reader and keyboard navigation support

## Conclusion

Poser is a sophisticated 2D pose animation application that combines modern web technologies with advanced animation techniques. Its modular architecture, comprehensive feature set, and TypeScript foundation make it suitable for both educational and professional animation workflows. The application demonstrates best practices in React development, canvas manipulation, and real-time animation systems. 