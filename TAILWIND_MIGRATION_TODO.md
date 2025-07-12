# Tailwind CSS Migration Todo List

## ✅ Completed
- [x] Install Tailwind CSS, PostCSS, and Autoprefixer
- [x] Create `tailwind.config.js` with custom theme colors
- [x] Create `postcss.config.js`
- [x] Update `src/index.css` with Tailwind directives
- [x] Configure custom colors matching current dark theme

## 🔄 In Progress
- [ ] Refactor PropertiesPanel (complex component with CSS modules)
- [ ] Refactor complex components (PlayheadDisplay, PoseRenderer)

## 📋 Todo - Phase 1: Core Layout Components

### App.tsx
- [x] Replace `.App` class with Tailwind flexbox classes
- [x] Update loading state styling

### Layout Components
- [x] **Sidebar.tsx** - Convert to Tailwind classes
  - [x] Replace `.sidebar` with `w-sidebar border-r border-gray-300 p-2.5 flex flex-col gap-2.5`
  - [x] Update any child component styling

- [x] **MainContent.tsx** - Convert to Tailwind classes
  - [x] Replace `.main-content` with `flex-1 p-2.5`

- [x] **Viewport.tsx** - Convert to Tailwind classes
  - [x] Update container styling

- [x] **Timeline.tsx** - Convert to Tailwind classes
  - [x] Update timeline container styling

## 📋 Todo - Phase 2: Panel Components

### InspectorPanel.tsx
- [x] Convert to Tailwind classes
- [x] Update panel container styling

### Toolbar.tsx
- [x] Replace `.group` with Tailwind classes
- [x] Replace `.group-title` with `text-lg font-medium text-text-primary border-b border-border-color pb-2 mb-2.5`
- [x] Replace `.button-container` with `flex flex-wrap gap-2`
- [x] Replace `.btn` classes with Tailwind button styles
- [x] Replace `.btn.active` with conditional Tailwind classes
- [x] Replace `.control-row` with `flex flex-col gap-1`

### FileOperationsPanel.tsx
- [x] Convert to Tailwind classes
- [x] Update button styling
- [x] Update file input styling

### VideoPanel.tsx
- [x] Convert to Tailwind classes
- [x] Update opacity slider styling

### PropertiesPanel.tsx
- [x] Remove `PropertiesPanel.module.css` dependency
- [x] Replace `.group` with Tailwind classes
- [x] Replace `.groupTitle` with `text-base text-text-primary border-b border-border-color pb-2 mb-2.5`
- [x] Replace `.sliderContainer` with `flex flex-col items-center w-36`
- [x] Replace `.sliderLabel` with `text-sm text-text-secondary mb-1 capitalize`
- [x] Replace `.sliderInput` with `w-full cursor-pointer`
- [x] Replace `.sliderValue` with `text-sm font-bold text-white mt-1`
- [x] Replace `.slidersContainer` with `flex flex-wrap gap-4 justify-center`

### AnimationPanel.tsx
- [x] Convert to Tailwind classes
- [x] Update form control styling

## 📋 Todo - Phase 3: Complex Components

### PlayheadDisplay.tsx
- [x] Remove `PlayheadDisplay.module.css` dependency
- [x] Convert timeline styling to Tailwind
- [x] Update keyframe markers styling
- [x] Update playhead styling
- [x] Update controls styling

### PoseRenderer.tsx
- [x] Remove `PoseRenderer.module.css` dependency
- [x] Convert canvas container styling to Tailwind
- [x] Keep canvas-specific styles as custom CSS if needed

### KeyframeThumbnail.tsx
- [x] Convert to Tailwind classes
- [x] Update thumbnail styling

### VideoBackground.tsx
- [x] Convert to Tailwind classes
- [x] Update video container styling

## 📋 Todo - Phase 4: Utility Classes & Cleanup

### Create Reusable Component Classes
- [ ] Create `@layer components` for common patterns:
  - [ ] `.btn-primary` - Primary button style
  - [ ] `.btn-secondary` - Secondary button style
  - [ ] `.panel` - Panel container style
  - [ ] `.control-group` - Form control group style
  - [ ] `.slider-control` - Slider input style

### Cleanup
- [ ] Remove unused CSS files:
  - [ ] `src/components/panels/PropertiesPanel.module.css`
  - [ ] `src/components/PlayheadDisplay.module.css`
  - [ ] `src/components/PoseRenderer.module.css`
- [ ] Remove unused CSS classes from `src/index.css`
- [ ] Update any remaining inline styles to use Tailwind

### Testing & Polish
- [ ] Test responsive design on different screen sizes
- [ ] Verify dark theme consistency
- [ ] Test all interactive states (hover, active, disabled)
- [ ] Ensure accessibility is maintained
- [ ] Test animation performance

## 📋 Todo - Phase 5: Advanced Features

### Responsive Design
- [ ] Add responsive breakpoints for mobile/tablet
- [ ] Implement collapsible sidebar for small screens
- [ ] Optimize timeline for mobile viewing

### Dark/Light Theme Support
- [ ] Add theme toggle functionality
- [ ] Create light theme color palette
- [ ] Use Tailwind's dark mode utilities

### Performance Optimization
- [ ] Configure Tailwind JIT mode for production
- [ ] Purge unused CSS classes
- [ ] Optimize bundle size

## 🎯 Migration Strategy

### Priority Order:
1. **Core Layout** - App.tsx, Sidebar, MainContent (highest impact)
2. **Simple Panels** - Toolbar, FileOperations, VideoPanel (quick wins)
3. **Complex Panels** - PropertiesPanel, AnimationPanel (medium complexity)
4. **Specialized Components** - PlayheadDisplay, PoseRenderer (most complex)
5. **Polish & Optimization** - Responsive design, performance

### Guidelines:
- Keep canvas/rendering specific styles as custom CSS
- Use Tailwind's `@apply` directive sparingly
- Maintain existing functionality while improving styling
- Test each component after migration
- Use semantic class names when creating custom components

## 🔧 Custom Tailwind Configuration

### Colors (already configured):
- `app-bg`: #1a1a1a (main background)
- `panel-bg`: #2a2a2a (panel backgrounds)
- `border-color`: #555 (borders)
- `text-primary`: #e0e0e0 (primary text)
- `text-secondary`: #bbb (secondary text)
- `accent-blue`: #007bff (accent color)

### Spacing:
- `sidebar`: 250px (sidebar width)

## 📝 Notes
- Keep complex animations and canvas-specific styles as custom CSS
- Use Tailwind's state variants (hover:, active:, disabled:) for interactive elements
- Consider using Tailwind's arbitrary value syntax for specific measurements
- Maintain TypeScript type safety throughout the migration 