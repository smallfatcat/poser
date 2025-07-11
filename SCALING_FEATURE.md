# Stick Figure Scaling Feature

This feature allows users to scale the entire stick figure while maintaining proportions. The scale affects all bone lengths and the head radius uniformly.

## Features

### Scale Control
- **Scale Slider**: Adjust the overall size of the stick figure (10% to 300%)
- **Real-time Updates**: Changes are applied immediately as you adjust the slider
- **Proportional Scaling**: All bone lengths and head radius scale together
- **Animation Support**: Scale changes are saved in keyframes and interpolated during animation

### How It Works

1. **Access Scale Control**:
   - Go to the Properties panel in the sidebar
   - Find the "Transform" section below "Bone Lengths"
   - Use the "Scale" slider to adjust the figure size

2. **Scale Range**:
   - **Minimum**: 10% (very small figure)
   - **Maximum**: 300% (very large figure)
   - **Default**: 100% (normal size)

3. **What Gets Scaled**:
   - All bone lengths (torso, arms, legs, etc.)
   - Head radius
   - Joint positions (calculated from scaled bone lengths)
   - Maintains proportions and angles

## Technical Implementation

### Data Structure
The scale is stored as a `scale` property in the `Pose` interface:
```typescript
interface Pose {
    // ... other properties
    scale: number; // Default: 1 (100%)
}
```

### Coordinate Calculation
The `poseToCoordinates` function applies scaling to all bone lengths:
```typescript
const totalScale = scale * poseScale;
const scaledHip = { x: hip.x * totalScale, y: hip.y * totalScale };
// All bone lengths are multiplied by totalScale
```

### Head Radius Scaling
The head radius is scaled in the drawing function:
```typescript
const poseScale = currentPose?.scale || 1;
const scaledHeadRadius = headRadius * poseScale;
```

### Animation Interpolation
Scale values are interpolated between keyframes during animation:
```typescript
// Scale is included in lengthProps for interpolation
const lengthProps = [..., 'scale'];
```

### Coordinate System Handling
The system properly handles coordinate transformations when scaling:
- **Hip Position**: Stored in original coordinate space, converted to/from scaled space during dragging
- **Joint Angles**: Calculated using scaled positions for accurate angle computation
- **Drag Interactions**: Mouse coordinates are properly converted between scaled and original spaces

## Usage Examples

### Creating Different Sized Characters
- **Small Character**: Set scale to 50-70%
- **Normal Character**: Keep scale at 100%
- **Large Character**: Set scale to 150-200%

### Animation with Scale Changes
1. Set initial scale (e.g., 100%)
2. Add keyframe at time 0
3. Change scale (e.g., to 150%)
4. Add keyframe at time 2000ms
5. Play animation to see smooth scale transition

### Saving and Loading
Scale values are automatically saved with pose data and restored when loading files.

## File Structure

- `src/types.ts` - Updated Pose interface with scale property
- `src/utils/poseAngleToCoordinates.ts` - Scale application in coordinate calculation
- `src/utils/poseInterpolation.ts` - Scale interpolation in animation
- `src/components/panels/PropertiesPanel.tsx` - Scale control UI
- `src/components/PoseCanvas.tsx` - Head radius scaling

## Browser Compatibility

This feature works in all browsers that support the existing application features, as it only uses standard JavaScript math operations and DOM manipulation. 