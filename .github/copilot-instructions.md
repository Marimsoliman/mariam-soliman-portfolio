# Copilot Instructions for Mariam Soliman Portfolio

## Build, Test & Lint

```bash
npm run dev       # Start dev server (http://localhost:3000)
npm run build     # Build for production
npm run lint      # Run ESLint (check for style violations)
npm start         # Run production server
```

All commands use Next.js built-in tooling. No separate test runner is configured.

## High-Level Architecture

This is a **scroll-driven, choreographed Next.js portfolio** combining a 3D sculptural spine with animated DOM overlay, orchestrated by a single GSAP master timeline.

### The Choreography System (Core Pattern)

Everything flows through a **single "choreography" object** defined in `lib/choreo.ts`:

1. **Master Timeline** – One GSAP timeline scrubbed by scroll progress (0–1) drives:
   - **3D Scene**: Camera position, look-at point, rig rotation/scale, color field opacity
   - **DOM Overlay**: Typography reveals, project images, section transitions

2. **Scroll Targets** – Object with animatable properties updated by timeline:
   - `targets.camera` – {x, y, z} world position
   - `targets.lookAt` – {x, y, z} target point for camera
   - `targets.rig` – {x, rotY, scale} for spine geometry
   - `targets.field[id].opacity` – Visibility of each color field

3. **Registry Pattern** – DOM elements self-register by ID:
   - `RegistryContext` passes a `register` callback factory
   - Components call `useReg(id)` to get a ref callback
   - Master timeline looks up elements from `domRefs` map to animate them

### Layer Stack

- **Entry Point**: `app/page.tsx` → `PortfolioExperience` component
- **Container** (`PortfolioExperience.tsx`):
  - Initializes Lenis smooth scroll, GSAP plugins
  - Builds master timeline & DOM registry
  - Mounts Canvas (Three.js), DomOverlay (React), sidebar, progress rail
  - Tracks scroll progress and active chapter
- **3D Scene** (`components/Scene.tsx`):
  - `CameraRig` – reads animated targets every frame, updates camera position/lookAt
  - `SpineRig` – animates 3D spine geometry (position, rotation, scale)
  - `ColorField` – animated atmospheric geometry overlays
- **DOM Overlay** (`components/DomOverlay.tsx`):
  - Hero section, work slides, experiments, contact
  - All positioned absolutely, animated by master timeline via registry
- **Navigation** (`components/SidebarNav.tsx`):
  - Fixed left sidebar with chapter navigation
  - Calls `scrollToChapter()` on click
  - Reflects active chapter based on scroll progress
- **Progress Rail** (`components/ProgressRail.tsx`):
  - Vertical scroll progress indicator (right edge)
  - Reads mutable `progressRef` without React re-renders

### Animation Modes

- **Desktop (Interactive)**: Full 3D + DOM choreography, Lenis smooth scroll, mouse parallax
  - Mode: `isDesktop: true`, `reducedMotion: false`
  - Body height: 7000px (entire journey = one master timeline)
  - Camera moves via parallax pointer tracking
- **Static (Mobile / Reduced Motion)**: Simplified layout, native scroll, no parallax
  - Mode: `isDesktop: false` OR `reducedMotion: true`
  - Class: `is-static` added to `<html>`
  - Sections reflow as stacked vertical layout
  - All sections visible without animation

## Key Conventions

### Adding or Editing Copy

All content is centralized in `lib/content.ts` — single source of truth:
- `identity` – Name, role, email, socials
- `hero`, `about`, `work`, `experiments`, `contact` – Section content
- `projects` array – Work items with slug, title, description, tech, image, demo URL
- `navItems` – Sidebar navigation structure

**Update content first, then update components if layout changes are needed.**

### Animating New Elements

1. Wrap the DOM element with `useReg(id)` to register it
   ```typescript
   const ref = useReg("my-element-id");
   return <div ref={ref} id="my-element-id">...</div>;
   ```

2. In `buildMasterTimeline()` (lib/choreo.ts), reference it:
   ```typescript
   tl.to(domRefs.current["my-element-id"], {
     opacity: 1,
     yPercent: -10,
     duration: 0.8,
     ease: "power2.out",
   }, "labelOrTime");
   ```

3. Timeline variables animate automatically as scroll progresses.

### Adding a 3D Camera Keyframe

1. Add entry to `POSES` in `lib/choreo.ts`:
   ```typescript
   myChapter: {
     camera: { x: 0.5, y: 1.2, z: 14 },
     lookAt: { x: 1.0, y: 0.8, z: 0 },
     rig: { x: 0.2, rotY: 0.15, scale: 1.05 },
   }
   ```

2. In `buildMasterTimeline()`, add tween:
   ```typescript
   tl.to(targets.camera, {
     x: 0.5, y: 1.2, z: 14,
     duration: 1.2,
     ease: "power2.inOut",
   }, "labelOrTime");
   ```

3. **Tune values in dev server** – preview in real-time and adjust until camera angle feels right.

### Responsive Breakpoints

- **Desktop (≥768px)**: Full interactive experience
- **Mobile (<768px)**: Static mode with stacked sections
- Check in components: `const { isDesktop } = mode` or CSS media queries

### Adding a New Section

1. Create component in `components/` (e.g., `NewStage.tsx`)
2. Add content to `lib/content.ts`
3. Mount in `DomOverlay.tsx`
4. Add `POSES` keyframe for camera/rig in `choreo.ts`
5. Add animation tweens in `buildMasterTimeline()`
6. Add to sidebar navigation in `content.ts` → `navItems`

### Smooth Scroll (Lenis) Details

- Desktop: Uses Lenis library (duration 1.35s, smooth wheel enabled)
- Mobile/static mode: Native browser scroll
- `scrollToChapter(id)` in `scroll.ts` respects `prefers-reduced-motion`
- Lenis is synced with ScrollTrigger via `lenis.on("scroll", ScrollTrigger.update)`

### 3D Spine Geometry

Located in `components/SpineGeometry.tsx`:
- 14 vertebrae positioned along an S-curve path
- Each vertebra: body (lathe-turned) + processes (wings/fins) + discs (torus)
- Materials: 5 shader materials (ceramic IVORY, bone, accents, gel DISC with transmission)
- Idle motion: `sin(t * 0.05) * 0.012` micro-rotation (reads as "breathing")

**Don't modify geometry unless you have Three.js/WebGL experience** — tuning poses is safer.

### TypeScript Patterns

- Mode system: `interface Mode { isDesktop, reducedMotion }`
- Scroll targets: `interface ScrollTargets { camera, lookAt, rig, field }`
- Content types: `interface Project { slug, title, ... }` in `content.ts`
- All components are `"use client"` (client-side rendering required)

## File Structure

```
src/
  app/
    layout.tsx              # Metadata, root HTML, font setup
    page.tsx                # Home (mounts PortfolioExperience)
    globals.css             # Tailwind + CSS vars (colors, spacing, type scale)
  components/
    PortfolioExperience.tsx # Master orchestrator (timeline, registry, scroll)
    Scene.tsx               # 3D Canvas (camera rig, spine, fields, lighting)
    SpineGeometry.tsx       # Custom spine mesh (vertebrae, discs, materials)
    SceneElements.tsx       # ColorField + environment
    DomOverlay.tsx          # Hero, work, experiments, contact sections
    HeroContent.tsx         # Hero typography & CTAs
    HeroPoster.tsx          # Hero poster image layer
    SidebarNav.tsx          # Navigation + brand info
    ProgressRail.tsx        # Scroll progress indicator
    WorkStage.tsx           # Project carousel
    ExperimentsStage.tsx    # Type + image composition
    ContactStage.tsx        # CTA + social links
    ChapterNote.tsx         # Section header card
  lib/
    content.ts              # Single source of truth (all copy + data)
    choreo.ts               # Choreography (poses, timeline builder, mode detection)
    scroll.ts               # Lenis setup, scroll-to-chapter
    registry.tsx            # Context for DOM element registration
    textures.ts             # Font loading, canvas textures
```

## Development Workflow

1. **Start dev server**: `npm run dev`
2. **Edit content**: Update `lib/content.ts` first
3. **Update layout**: Modify component JSX
4. **Tune animation**: Adjust POSES in `choreo.ts`, preview in real-time
5. **Test responsive**: Toggle DevTools device emulation (768px breakpoint)
6. **Lint**: `npm run lint` before committing

## Performance Notes

- Lenis + GSAP ScrollTrigger scrub: Smooth 60fps on desktop (scrub: 1.5 means 1.5s lag)
- Spine detail scales with device: `detail: 1.0` desktop, `0.8` mobile
- Canvas DPR: `[1, 1.5]` desktop, `[1, 1.25]` mobile (adaptive for performance)
- No IndexedDB or API calls (fully client-side)

## Common Tasks

### Change Hero Copy
→ Edit `hero.statement`, `hero.roles` in `content.ts`

### Adjust Camera Path Between Sections
→ Edit POSES in `choreo.ts`, tune `camera`, `lookAt`, `rig` per chapter

### Add New Project
→ Add entry to `projects` array in `content.ts`; component auto-renders via `.map()`

### Modify Spine Materials or Geometry
→ Edit `SpineGeometry.tsx` (requires Three.js knowledge)

### Change Sidebar Colors or Layout
→ Edit `SidebarNav.tsx` + color variables in `globals.css`

### Test Reduced Motion
→ DevTools → Rendering → Emulate CSS Media → prefers-reduced-motion: reduce
