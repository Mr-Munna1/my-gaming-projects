# Third-party assets

## Kenney Nature Kit
- Source: https://kenney.nl/assets/nature-kit
- License: Creative Commons CC0 1.0
- Runtime model mirror: https://github.com/Hidencod/tge-assets
- Models loaded: tree-detailed, tree-oak, tree-palmdetailedtall, tree-pinetalla-detailed, rock-large variants, plant-bushdetailed. Tree materials are normalized to natural bark and leaf greens to avoid broken pink/blue tints.
- Use: environment props.

## Kenney Mini Characters
- Source: https://kenney.nl/assets/mini-characters
- License: Creative Commons CC0 1.0
- Runtime model mirror: https://github.com/Hidencod/tge-assets
- Model loaded: character-male-c. Animation clips used: idle, walk, sprint. The player switches clips based on movement and sprint input.

## Gobkit CC0 3D models
- Source: https://gobkit.com/freebies
- License: CC0 1.0 Universal; commercial use and modification permitted, attribution not required.
- Runtime model URLs: https://gobkit.com/freebies/dino/Spinosaurus.glb, https://gobkit.com/freebies/birds/Macaw.glb, https://gobkit.com/freebies/animal012/WildBoar.glb
- Models loaded: animated Spinosaurus guardian, Macaw wildlife, and Wild Boar wildlife. Named idle/walk animation clips are used when present.

The Kenney and Gobkit models are fetched from their public asset hosts at runtime, so an internet connection is required for these external 3D models to appear. The game retains local procedural fallback meshes for the player and guardian if an asset request fails.
