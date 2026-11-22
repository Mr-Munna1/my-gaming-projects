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
## Shuriken Studio Jungle Temple kit
- Source: https://shuriken.studio/kits/jungle-temple
- License: Shuriken Studio Free Model License; the kit page states free use in any project, no account and no credit required. Each model page also identifies the model as GLB and free to use under that license.
- Models loaded: Jungle Temple Pyramid (9,286 triangles), Jungle Temple Entrance (9,138 triangles), Jungle Waterfall Temple (7,466 triangles), and Jungle Temple Guardian statue (4,830 triangles).
- Runtime GLB endpoints: https://shuriken.studio/models/download/30a31d28-4a02-4cb2-894b-03a30428ef11, https://shuriken.studio/models/download/6bf2a6bf-3919-48d6-9ab6-8ef1c7d63b6c, https://shuriken.studio/models/download/d4aeb49b-ced9-4403-8385-e7de017b2b45, https://shuriken.studio/models/download/00ae3e3c-e098-4501-87ff-f751801835c7
- The imported pyramid replaces the simple temple shell while preserving the existing altar and rune puzzle. The waterfall and guardian statue add separate jungle landmarks.
- Runtime-hosted models require an internet connection; if a download fails, the game keeps its existing gameplay fallback geometry.
