# THE LAST PATIENT — Exploration Build

A separate 3D hospital exploration prototype in the existing `my-gaming-projects` repository. This does not replace SHADOW ISLAND.

## Current build
- Playable 3D character named **Ranit** (no surname)
- Blackwood Psychiatric Hospital exterior and interior blockout
- Ground floor, three upper floors, basement and rooftop
- Reception, waiting lounge, security, records, patient wards, ICU, nurses station, operation theatre, doctor offices, restricted ward, isolation cells, generator room, morgue and Project Echo lab
- FPP / TPP camera toggle
- Keyboard + mobile joystick controls
- Interactive doors, elevator floor selector and stairs
- Hospital directory / floor list
- No monsters, ghosts, enemies, weapons or jumpscares

## Run locally
From this folder:
```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal. Build with:
```bash
npm run build
```

## Controls
- Desktop: WASD / arrows to move, mouse to look in FPP, E to interact, V to switch camera, Shift to run, Esc to pause.
- Mobile: left joystick to move, drag the right side to look, buttons for run and interact.
- Use the elevator panel near the west side of the corridor to select floors.

This is the first navigable greybox / procedural-geometry pass. It is intended for layout exploration before adding detailed art assets, monster AI, horror sequences, or story missions.