# my-gaming-projects
My HTML Games

# SHADOW ISLAND

A mobile-first 3D survival adventure built with Three.js, Vite and Capacitor.

## Story
Aarav survives a plane crash on a mysterious island. Explore the jungle, collect three energy crystals, evade the creature, and activate the extraction beacon.

## Play locally
```bash
npm install
npm run dev
``

## Build Android APK
GitHub Actions workflow **Build Shadow Island APK** builds an Android debug APK. It runs on pushes to `main` that affect game/build files, or manually from **Actions → Build Shadow Island APK → Run workflow**.

Download `shadow-island-debug-apk` from the completed workflow run's Artifacts section.

## Controls
- Touch: drag the left joystick to move
- RUN: sprint
- USE: interact with extraction beacon
- Desktop: WASD / arrow keys, Shift to sprint

## Tech
- Three.js real-time 3D rendering
- JavaScript + Vite
- Capacitor Android wrapper
- Gradle Android debug build via GitHub Actions

This is an early playable prototype using procedural low-poly scenery and primitive character/enemy models. Replace or extend these with optimized original 3D assets as development continues.
