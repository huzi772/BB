# Cinematic Birthday Surprise

An interactive, client-side, cinematic single-page web app built with React, Vite, GSAP, and Three.js (@react-three/fiber and @react-three/drei).

## Tech Stack

- **Framework:** React 19 + Vite
- **Animations:** GSAP
- **3D Graphics:** Three.js via `@react-three/fiber` and `@react-three/drei`
- **Design System:** Custom CSS theme ("Midnight Champagne") with Cormorant Garamond & Manrope typography.
- **Deployment:** Static site suitable for Vercel or any static host.

## Prerequisites & Node Version

- **Node.js:** `>=18.0.0` (Tested on Node 22)
- **npm:** `>=9.0.0`

## Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start Development Server:**
   ```bash
   npm run dev
   ```

3. **Build for Production:**
   ```bash
   npm run build
   ```

4. **Preview Production Build:**
   ```bash
   npm run preview
   ```

## Editing Personal Content

All recipient information, dates, letters, gift options, memory captions, and audio paths are centralized in **`src/config.js`**.

To customize the experience, modify the exported `config` object in `src/config.js`:

```javascript
export const config = {
  recipientName: "Friend",
  birthdayDate: "26 September 2026",
  birthdayDateShort: "26 • 09 • 2026",
  finalMessage: "You deserve a beautiful year ahead.",
  letterText: "...",
  giftLabels: ["A Little Message", "Memories", "Something From Me"],
  giftMessage: "...",
  memories: [
    { src: "/images/memory-1.jpg", caption: "..." },
    // ...
  ],
  audio: {
    "background-music": "/audio/background-music.mp3",
    // ...
  }
};
```

No personal content should be hardcoded in any component files.

## Project Structure

```
cinematic-birthday-surprise/
├── public/
│   ├── audio/        # MP3 audio assets (see audio/README.md)
│   ├── fonts/        # Custom fonts
│   ├── images/       # Memory images (memory-1.jpg, etc.)
│   ├── models/       # 3D models (.gltf / .glb)
│   └── favicon.svg
├── src/
│   ├── assets/       # Static module assets
│   ├── audio/        # Audio utilities / controllers
│   ├── components/   # Reusable UI components
│   ├── effects/      # Visual / particle / GSAP effects
│   ├── scenes/       # Individual scene components
│   ├── styles/       # Design system CSS (global, animations, responsive)
│   ├── App.jsx       # Scene state manager & demo layout
│   ├── config.js     # Central configuration & personal content
│   └── main.jsx      # Entry point
├── index.html
├── package.json
└── vite.config.js
```
