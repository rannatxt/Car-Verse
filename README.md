# CARVERSE — Interactive 3D Automotive Studio

CARVERSE is a production-grade interactive 3D car showroom, configurator, and comparator built with **React**, **TypeScript**, **Three.js**, **React Three Fiber**, **Framer Motion**, and **Tailwind CSS**, styled with a bespoke **Apple iOS Theme Pack**.

Experience luxury automotive digital design combining the aesthetic excellence of Apple product pages with the precision engineering of Porsche configurators.

---

## Key Features

- **360° Interactive 3D Showroom**: Full OrbitControls with smooth damping, zoom constraints, and realistic studio turntable.
- **Procedural Automotive Generation**: Real-time procedural 3D automotive models tailored to Sports, Luxury, SUV, EV, and Concept cars using `MeshPhysicalMaterial` (clearcoat, metallics, glass transmission, LED lighting).
- **GLTF/GLB Asset Compatibility**: Seamless drop-in loader for licensed 3D models with robust error boundary fallback.
- **Cinematic Camera Presets**: Smooth tweening between Front, Side, Rear, Top, 3/4 Perspective, and Interior Cabin viewpoints.
- **Bespoke Vehicle Configurator**: Real-time exterior paint finishes, wheel spoke styles, brake caliper colors, studio lighting moods (Day, Sunset, Night), and functional illuminated headlights.
- **Cinematic Drive Simulation**: Wheel rotation with live road vibrations, moving studio speed lines, and dynamic camera tracking.
- **Interactive Engineering Hotspots**: 3D pulsating feature markers for Aerodynamics, Powertrain, Cockpit, Wheels & Brakes, and Matrix LED lighting with Apple-styled engineering briefs.
- **Side-by-Side Comparison Engine**: Head-to-head performance metrics with interactive 3D preview switching and differential indicators.
- **Instant Spotlight Search**: Fast fuzzy search across 15 models, categories, horsepower, and engineering highlights (`Ctrl+K` / `Cmd+K`).
- **iOS Theme Pack Design System**: SF Pro typography, dynamic frosted glass (`backdrop-blur-2xl`), pill segmented controls, and minimal telemetry HUD.
- **Production & Vercel Ready**: Full SPA client routing with `vercel.json` and zero external runtime dependencies.

---

## Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **3D Graphics & WebGL**: Three.js, `@react-three/fiber`, `@react-three/drei`
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Styling**: Tailwind CSS + Custom iOS Glassmorphism
- **Routing**: React Router DOM v6

---

## Vehicle Catalog (15 Models across 5 Categories)

1. **SPORTS**:
   - `01 Apex R1` — Naturally aspirated flat-six pure driver's car (450 HP)
   - `02 Apex GT` — Twin-turbo V8 continental grand tourer (580 HP)
   - `03 Velocity X` — Lightweight high-downforce track weapon (620 HP)
2. **LUXURY**:
   - `01 Aurelia S` — Twin-turbo V12 flagship saloon (520 HP)
   - `02 Aurelia Grand` — Extended-wheelbase starlight limousine (560 HP)
   - `03 Monarch L` — Sovereign luxury saloon with waterfall grille (500 HP)
3. **SUV**:
   - `01 Terra X` — All-terrain luxury expedition vehicle (510 HP)
   - `02 Terra GT` — 650 HP biturbo performance coupe SUV
   - `03 Atlas X` — 7-seat expedition flagship with 10,000 lbs towing (530 HP)
4. **EV**:
   - `01 Volt S` — 800V ultra-fast charging performance sedan (680 HP)
   - `02 Volt GT` — 1,020 HP tri-motor hyper-touring EV (0–100 in 2.1s)
   - `03 Eon X` — Solar-canopy crossover with 710 km range (480 HP)
5. **CONCEPT**:
   - `01 Vision R` — 1,400 HP quad-motor autonomous hypercar (420 km/h)
   - `02 Nova GT` — Liquid hydrogen fuel-cell endurance study (1,200 km range)
   - `03 Aero X` — Extending longtail active-aerodynamic speed record concept (1,150 HP)

---

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation
```bash
npm install
```

### Development
Start the local development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build
Build for production with strict TypeScript type validation:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

---

## Adding a New Vehicle

Open `src/data/cars.ts` and add a new vehicle entry to `CARS_DATA`:

```typescript
{
  id: "quantum-gt",
  name: "Quantum GT",
  category: "CONCEPT",
  modelNumber: "04",
  modelPath: "/models/quantum-gt.glb",
  tagline: "Quantum Flux Hyper-Drive",
  description: "Next-generation aerodynamic hypercar.",
  specs: {
    horsepower: 1250,
    torque: 1400,
    acceleration: "2.0s",
    topSpeed: "400 km/h",
    range: "700 km",
    weight: "1,400 kg",
    driveType: "Quad-Motor AWD",
    transmission: "Direct Drive",
  },
  basePrice: "$2,100,000",
  colors: SHARED_COLORS,
  wheels: SHARED_WHEELS,
  features: ["Active Venturi Tunnels", "Carbon-Ceramic Brakes"],
  hotspots: [...],
  shapeConfig: {
    bodyLength: 4.8,
    bodyWidth: 2.05,
    bodyHeight: 1.15,
    rideHeight: 0.1,
    wheelRadius: 0.38,
    wheelWidth: 0.3,
    hasSpoiler: true,
    spoilerHeight: 0.3,
    hasRoofRails: false,
    roofCurvature: 0.9,
    frontGrilleStyle: "hyper-splitter",
    exhaustType: "none",
  }
}
```

---

## Adding a Custom 3D Model (.glb / .gltf)

1. Place your licensed or custom `.glb` file inside `public/models/`:
   ```
   public/models/apex-r1.glb
   ```
2. Ensure the `modelPath` in `src/data/cars.ts` matches `/models/apex-r1.glb`.
3. If the GLB is missing or fails to load, CARVERSE will automatically and seamlessly fall back to the category-tailored procedural 3D model with zero crashes.

---

## Vercel Deployment

CARVERSE is pre-configured with `vercel.json` for single-page application (SPA) client-side routing and immutable asset caching.

### Deploy via Vercel CLI
```bash
npx vercel
```

### Deploy via GitHub
1. Push this repository to GitHub.
2. Import the project in your [Vercel Dashboard](https://vercel.com).
3. Framework Preset: **Vite**.
4. Click **Deploy**.
