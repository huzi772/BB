# Cinematic Birthday Surprise

An interactive, client-side, cinematic single-page web app built with React, Vite, GSAP, and Three.js (@react-three/fiber and @react-three/drei).

## Tech Stack

- **Framework:** React 19 + Vite
- **Animations:** GSAP
- **3D Graphics:** Three.js via `@react-three/fiber` and `@react-three/drei`
- **Design System:** Custom CSS theme ("Midnight Champagne") with Cormorant Garamond & Manrope typography.
- **Deployment:** Static site suitable for Vercel or any static host.

## Prerequisites & Node Version

- **Node.js:** `>=18.0.0` (Required for React 19, Vite 6, and @react-three/fiber v9)
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

## Vercel Deployment Instructions

This project is fully static and ready for 1-click deployment on Vercel:

1. **Push to GitHub / GitLab / Bitbucket**: Ensure your repository is pushed to your Git provider.
2. **Import into Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard) -> **Add New** -> **Project**.
   - Select your repository.
3. **Configure Project Settings**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**: None required.
4. **Node.js Version Setting**:
   - In **Project Settings** -> **General** -> **Node.js Version**, select **18.x** or **20.x** (>= 18.0.0).
   - *Note:* Matching Node >= 18.0.0 ensures `@react-three/fiber` v9 and React 19 dependencies compile cleanly on Vercel build servers.
5. **Deploy**: Click **Deploy**. Vercel will build and output static assets to `dist/`.

> **Note on `vercel.json`**: A `vercel.json` file is intentionally omitted because this application is a single-page state-driven SPA with no client-side route rewrites. Plain Vite static hosting on Vercel serves `dist/index.html` directly.

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
