import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import './style.css';

const mount=document.querySelector('#game');
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x526d69);
scene.fog=new THREE.FogExp2(0x526d69,.009);
const camera=new THREE.PerspectiveCamera(62,innerWidth/innerHeight,.1,260);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;mount.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xd5eaff,0x263524,2.25));
const sun=new THREE.DirectionalLight(0xffe5c2,3.4);sun.position.set(-25,45,20);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-55;sun.shadow.camera.right=55;sun.shadow.camera.top=55;sun.shadow.camera.bottom=-55;scene.add(sun);
const mat=(color,roughness=1)=>new THREE.MeshStandardMaterial({color,roughness});
// Procedural tileable ground textures: no remote image download required
function makeGroundTexture(base,shade,seed=1){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
 const ctx=canvas.getContext('2d');ctx.fillStyle=base;ctx.fillRect(0,0,256,256);
 let n=seed;const rand=()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296};
 for(let i=0;i<5200;i++){const x=rand()*256,y=rand()*256,r=.5+rand()*2.4;ctx.globalAlpha=.08+rand()*.2;ctx.fillStyle=shade;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()}
 ctx.globalAlpha=1;const tex=new THREE.CanvasTexture(canvas);tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(9,9);tex.colorSpace=THREE.SRGBColorSpace;return tex;
}
const groundMat=new THREE.MeshStandardMaterial({color:0xffffff,map:makeGroundTexture('#526b3d','#b2c18a',21),roughness:1});
const sandMat=new THREE.MeshStandardMaterial({color:0xffffff,map:makeGroundTexture('#bda879','#f0dca7',42),roughness:1});
const rockMat=mat(0x59645d),barkMat=mat(0x493526),leafMat=mat(0x244d35),leaf2=mat(0x376c3d);
const groundGeometry=new THREE.CircleGeometry(49,120);
const groundPositions=groundGeometry.attributes.position;
for(let i=0;i<groundPositions.count;i++){const x=groundPositions.getX(i),z=groundPositions.getY(i);groundPositions.setZ(i,(Math.sin(x*.16)+Math.cos(z*.14))*0.22+Math.sin((x+z)*.08)*.34)}
groundGeometry.computeVertexNormals();
const ground=new THREE.Mesh(groundGeometry,groundMat);ground.rotation.x=-Math.PI/2;ground.position.y=-.3;ground.receiveShadow=true;scene.add(ground);
const beach=new THREE.Mesh(new THREE.RingGeometry(40,49,64),sandMat);beach.rotation.x=-Math.PI/2;beach.position.y=-.26;scene.add(beach);
const water=new THREE.Mesh(new THREE.CircleGeometry(75,64),new THREE.MeshStandardMaterial({color:0x246b78,roughness:.28,metalness:.15}));water.rotation.x=-Math.PI/2;water.position.y=-.8;scene.add(water);
// Island ridges and scattered boulders
for(let i=0;i<18;i++){const a=i/18*Math.PI*2,r=30+Math.random()*9;const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(3+Math.random()*4,1),rockMat);rock.position.set(Math.cos(a)*r,1.3,Math.sin(a)*r);rock.scale.y=.8;rock.rotation.set(Math.random(),Math.random(),Math.random());rock.castShadow=true;scene.add(rock)}
// Kenney Nature Kit models (CC0): real GLB trees, rocks, bushes and camp props
const assetRoot='https://raw.githubusercontent.com/Hidencod/tge-assets/main/';
const gltfLoader=new GLTFLoader();gltfLoader.setMeshoptDecoder(MeshoptDecoder);
const modelCache=new Map();
function loadModel(path){if(modelCache.has(path))return modelCache.get(path);const url=path.startsWith('http')?path:assetRoot+path;const p=new Promise((resolve,reject)=>gltfLoader.load(url,g=>resolve(g),undefined,reject));modelCache.set(path,p);return p}
const treeAssets=['packs/nature-kit/tree-detailed.glb','packs/nature-kit/tree-oak.glb','packs/nature-kit/tree-palmdetailedtall.glb','packs/nature-kit/tree-pinetalla-detailed.glb'];
const rockAssets=['packs/nature-kit/rock-largea.glb','packs/nature-kit/rock-largec.glb','packs/nature-kit/rock-larged.glb'];
function addProceduralNature(path,x,z,scale){
 const group=new THREE.Group();group.position.set(x,0,z);group.rotation.y=Math.random()*Math.PI*2;
 if(path.includes('tree')){
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.16*scale,.28*scale,2.1*scale,7),barkMat);trunk.position.y=1.05*scale;trunk.castShadow=true;group.add(trunk);
  for(let i=0;i<3;i++){const crown=new THREE.Mesh(new THREE.ConeGeometry((1.05-i*.13)*scale,2.2*scale,7),i%2?leaf2:leafMat);crown.position.set(0,(2.2+i*.65)*scale,0);crown.castShadow=true;group.add(crown)}
 }else if(path.includes('rock')){
  const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(.75*scale,1),rockMat);rock.position.y=.45*scale;rock.scale.y=.75;rock.castShadow=true;group.add(rock);
 }else{
  for(let i=0;i<4;i++){const bush=new THREE.Mesh(new THREE.SphereGeometry(.48*scale,7,6),i%2?leaf2:leafMat);bush.position.set((Math.random()-.5)*scale,.35*scale+Math.random()*.25*scale,(Math.random()-.5)*scale);bush.scale.y=.72;bush.castShadow=true;group.add(bush)}
 }
 scene.add(group);
}
async function addNatureModel(path,x,z,scale=4){try{const gltf=await loadModel(path);const model=gltf.scene.clone(true);model.position.set(x,0,z);model.scale.setScalar(scale);model.rotation.y=Math.random()*Math.PI*2;model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;const naturalize=(m)=>{const n=(m.name||'').toLowerCase();m.map=null;m.vertexColors=false;if(n.includes('leaf')||n.includes('green'))m.color.set(0x326b35);else if(n.includes('wood')||n.includes('bark'))m.color.set(0x62432c);else if(path.includes('tree'))m.color.set(o.position.y<.4?0x62432c:0x39783b);m.roughness=1;m.side=THREE.DoubleSide;m.needsUpdate=true};if(Array.isArray(o.material))o.material.forEach(naturalize);else if(o.material)naturalize(o.material)}});scene.add(model)}catch(e){console.warn('Nature model unavailable; using local procedural asset',path,e);addProceduralNature('tree',x,z,scale)}}
for(let i=0;i<100;i++){const a=Math.random()*Math.PI*2,r=8+Math.random()*34,x=Math.cos(a)*r,z=Math.sin(a)*r;if(Math.abs(x)<5&&z>-20&&z<14)continue;addNatureModel(treeAssets[i%treeAssets.length],x,z,3.5+Math.random()*1.8)}
for(let i=0;i<42;i++){const a=Math.random()*Math.PI*2,r=7+Math.random()*35;addNatureModel(rockAssets[i%rockAssets.length],Math.cos(a)*r,Math.sin(a)*r,1.2+Math.random()*1.5)}
for(let i=0;i<28;i++){const a=Math.random()*Math.PI*2,r=7+Math.random()*28;addNatureModel('packs/nature-kit/plant-bushdetailed.glb',Math.cos(a)*r,Math.sin(a)*r,2.5+Math.random()*1.5)}
// Dense jungle floor, winding dirt trail, fallen logs and glowing fireflies
const trailCurve=new THREE.CatmullRomCurve3([
  new THREE.Vector3(0,-.17,17),new THREE.Vector3(-7,-.17,9),
  new THREE.Vector3(-12,-.17,0),new THREE.Vector3(-8,-.17,-9),
  new THREE.Vector3(3,-.17,-16),new THREE.Vector3(1,-.17,-26),
  new THREE.Vector3(0,-.17,-34)
]);
const trailMat=mat(0x765b37);
const trailGeo=new THREE.CircleGeometry(1.65,10);
for(let i=0;i<=90;i++){
  const p=trailCurve.getPoint(i/90);
  const patch=new THREE.Mesh(trailGeo,trailMat);
  patch.rotation.x=-Math.PI/2;patch.position.set(p.x,-.145,p.z);
  patch.scale.set(1.05,1.35,1);scene.add(patch);
}
const fernMat=mat(0x245b35),fernTipMat=mat(0x4d8a43),logMat=mat(0x493323);
for(let i=0;i<54;i++){
  const a=Math.random()*Math.PI*2,r=9+Math.random()*29,x=Math.cos(a)*r,z=Math.sin(a)*r;
  if(Math.abs(x)<4&&z>-20&&z<19)continue;
  const fern=new THREE.Group();fern.position.set(x,0,z);
  const count=5+Math.floor(Math.random()*3);
  for(let j=0;j<count;j++){
    const angle=j/count*Math.PI*2;
    const leaf=new THREE.Mesh(new THREE.ConeGeometry(.18,1.5,5),j%2?fernMat:fernTipMat);
    leaf.position.set(Math.cos(angle)*.38,.62,Math.sin(angle)*.38);
    leaf.rotation.z=-Math.cos(angle)*.72;leaf.rotation.x=Math.sin(angle)*.72;
    fern.add(leaf);
  }
  const center=new THREE.Mesh(new THREE.CylinderGeometry(.045,.07,.7,5),fernMat);
  center.position.y=.35;fern.add(center);scene.add(fern);
}
for(const [x,z,rot] of [[-22,-10,.4],[24,4,1.1],[-30,18,-.6],[11,-29,.8]]){
  const log=new THREE.Mesh(new THREE.CylinderGeometry(.42,.5,5.5,8),logMat);
  log.position.set(x,.35,z);log.rotation.set(.08,rot,Math.PI/2);log.castShadow=true;scene.add(log);
  for(let k=-1;k<=1;k+=2){
    const cut=new THREE.Mesh(new THREE.CircleGeometry(.39,8),mat(0x9a754b));
    cut.position.set(x+k*2.72,.35,z);cut.rotation.y=Math.PI/2;scene.add(cut);
  }
}
const fireflies=[];
const flyMat=new THREE.MeshBasicMaterial({color:0xbaff72});
for(let i=0;i<26;i++){
  const fly=new THREE.Mesh(new THREE.SphereGeometry(.055,6,6),flyMat);
  fly.position.set((Math.random()-.5)*54,1.2+Math.random()*4,(Math.random()-.5)*54);
  scene.add(fly);fireflies.push({mesh:fly,phase:Math.random()*Math.PI*2,x:fly.position.x,y:fly.position.y,z:fly.position.z});
}
// Hidden jungle cave and treasure chest: optional side mission
const caveRock=mat(0x343c37),goldMat=new THREE.MeshStandardMaterial({color:0xd99b32,metalness:.65,roughness:.28,emissive:0x6b3908,emissiveIntensity:.35});
const cave=new THREE.Group();cave.position.set(-31,0,-25);scene.add(cave);
const caveDome=new THREE.Mesh(new THREE.SphereGeometry(5.2,12,9,0,Math.PI*2,0,Math.PI*.58),caveRock);
caveDome.position.y=1.1;caveDome.scale.set(1.25,1,1);cave.add(caveDome);
const caveDark=new THREE.Mesh(new THREE.CircleGeometry(2.15,16),mat(0x080d0d));
caveDark.position.set(0,1.35,4.2);caveDark.rotation.y=Math.PI;cave.add(caveDark);
const chest=new THREE.Group();chest.position.set(-31,0,-19.8);scene.add(chest);
const chestBase=new THREE.Mesh(new THREE.BoxGeometry(1.6,.9,1.05),mat(0x684020));chestBase.position.y=.55;chest.add(chestBase);
const chestLid=new THREE.Mesh(new THREE.BoxGeometry(1.68,.35,1.1),goldMat);chestLid.position.set(0,1.13,0);chest.add(chestLid);
const chestLock=new THREE.Mesh(new THREE.BoxGeometry(.22,.32,.08),goldMat);chestLock.position.set(0,.82,-.57);chest.add(chestLock);
const treasureGlow=new THREE.PointLight(0xffbd45,1.5,7);treasureGlow.position.set(0,1.5,0);chest.add(treasureGlow);
let treasureFound=false;
let flareAmmo=0;
let bossHealth=100;
let bossAwakened=false;
let bossDefeated=false;
let caveTrapTriggered=false;
const caveLight=new THREE.PointLight(0x55b9a5,2.2,15);caveLight.position.set(-31,2.4,-22.5);scene.add(caveLight);
const trapGroup=new THREE.Group();trapGroup.position.set(-31,0,-22.2);scene.add(trapGroup);
const trapMat=new THREE.MeshStandardMaterial({color:0x87918b,metalness:.72,roughness:.3});
for(let i=0;i<7;i++){const spike=new THREE.Mesh(new THREE.ConeGeometry(.19,.9,5),trapMat);spike.position.set(-1.8+i*.6,.05,.2);spike.rotation.z=Math.PI;spike.castShadow=true;trapGroup.add(spike)}
const trapPlate=new THREE.Mesh(new THREE.BoxGeometry(4.5,.07,1.25),mat(0x51483a));trapPlate.position.set(0,-.12,.2);trapGroup.add(trapPlate);

// Secret jungle temple and optional relic quest
const temple=new THREE.Group();temple.position.set(29,0,24);scene.add(temple);
const templeStone=mat(0x77766a),templeDark=mat(0x222b27),templeGold=new THREE.MeshStandardMaterial({color:0xd8ae55,metalness:.72,roughness:.25,emissive:0x674313,emissiveIntensity:.55});
const templeBase=new THREE.Mesh(new THREE.BoxGeometry(11,.65,9),templeStone);templeBase.position.y=.12;temple.add(templeBase);
const templeFloor=new THREE.Mesh(new THREE.BoxGeometry(9,.22,7),mat(0x9b9277));templeFloor.position.y=.55;temple.add(templeFloor);
for(const x of [-3.8,3.8])for(const z of [-2.7,2.7]){const column=new THREE.Mesh(new THREE.CylinderGeometry(.48,.62,4.8,8),templeStone);column.position.set(x,2.95,z);column.castShadow=true;temple.add(column);const cap=new THREE.Mesh(new THREE.BoxGeometry(1.35,.35,1.35),templeGold);cap.position.set(x,5.42,z);temple.add(cap)}
const templeRoof=new THREE.Mesh(new THREE.BoxGeometry(9.5,.8,7.8),templeStone);templeRoof.position.y=5.75;temple.add(templeRoof);
const templeDoor=new THREE.Mesh(new THREE.BoxGeometry(3.1,3.6,.25),templeDark);templeDoor.position.set(0,2.35,-3.4);temple.add(templeDoor);
for(let i=0;i<5;i++){const step=new THREE.Mesh(new THREE.BoxGeometry(5.2-i*.45,.32,.8),templeStone);step.position.set(0,.22+i*.28,3.5+i*.62);temple.add(step)}
const templeAltar=new THREE.Group();templeAltar.position.set(0,.7,0);temple.add(templeAltar);
const altarBlock=new THREE.Mesh(new THREE.CylinderGeometry(1.05,1.35,.9,8),templeStone);altarBlock.position.y=.45;templeAltar.add(altarBlock);
const relic=new THREE.Mesh(new THREE.OctahedronGeometry(.72),templeGold);relic.position.y=1.65;templeAltar.add(relic);
const relicRing=new THREE.Mesh(new THREE.TorusGeometry(1.2,.055,8,28),new THREE.MeshBasicMaterial({color:0xffd778}));relicRing.rotation.x=Math.PI/2;relicRing.position.y=1.55;templeAltar.add(relicRing);
const templeGlow=new THREE.PointLight(0xffc75d,2.2,13);templeGlow.position.set(0,2,0);templeAltar.add(templeGlow);
// Three rune switches guard the inner chamber. The glowing hint order is 2-1-3.
const runeOrder=[1,0,2];let runeProgress=0,templeDoorOpen=false;
const runeButtons=[];
for(let i=0;i<3;i++){const rune=new THREE.Group();rune.position.set(-2.35+i*2.35,.72,4.35);temple.add(rune);const baseRune=new THREE.Mesh(new THREE.CylinderGeometry(.62,.72,.22,8),templeStone);rune.add(baseRune);const mark=new THREE.Mesh(new THREE.OctahedronGeometry(.3),new THREE.MeshStandardMaterial({color:0x52645a,emissive:0x17231d,emissiveIntensity:.35}));mark.position.y=.3;rune.add(mark);runeButtons.push({group:rune,mark,index:i,active:false})}
let templeDiscovered=false,templeRelicFound=false;
// Inner chamber hazards and hidden reward cache
const templeHazard=new THREE.Group();templeHazard.position.set(29,0,24);scene.add(templeHazard);
const hazardPlate=new THREE.Mesh(new THREE.BoxGeometry(4.2,.08,1.15),mat(0x4b4b43));hazardPlate.position.set(0,.68,-1.75);templeHazard.add(hazardPlate);
const hazardSpikes=[];for(let i=0;i<7;i++){const spike=new THREE.Mesh(new THREE.ConeGeometry(.22,.95,5),trapMat);spike.position.set(-1.65+i*.55,.72,-1.75);spike.rotation.z=Math.PI;templeHazard.add(spike);hazardSpikes.push(spike)}
const secretWall=new THREE.Group();secretWall.position.set(29,0,24);scene.add(secretWall);const movingBlock=new THREE.Mesh(new THREE.BoxGeometry(1.05,3.2,.55),templeStone);movingBlock.position.set(0,2.15,-5.5);secretWall.add(movingBlock);const wallTrim=new THREE.Mesh(new THREE.BoxGeometry(1.18,.18,.68),templeGold);wallTrim.position.set(0,3.8,-5.5);secretWall.add(wallTrim);
const hiddenCache=new THREE.Group();hiddenCache.position.set(29,0,16.1);scene.add(hiddenCache);const cacheBox=new THREE.Mesh(new THREE.BoxGeometry(1.35,.8,1),mat(0x54331e));cacheBox.position.y=.65;hiddenCache.add(cacheBox);const cacheLid=new THREE.Mesh(new THREE.BoxGeometry(1.42,.28,1.06),templeGold);cacheLid.position.set(0,1.18,0);hiddenCache.add(cacheLid);const cacheGlow=new THREE.PointLight(0xffd16a,1.5,6);cacheGlow.position.y=1.7;hiddenCache.add(cacheGlow);
let templeTrapTriggered=false,hiddenCacheFound=false;
// Ancient research outpost
const base=new THREE.Mesh(new THREE.BoxGeometry(10,3.2,7),mat(0x68736e));base.position.set(17,1.3,-17);base.castShadow=true;base.receiveShadow=true;scene.add(base);
const roof=new THREE.Mesh(new THREE.BoxGeometry(10.8,.45,7.8),mat(0x263d40));roof.position.set(17,3.1,-17);scene.add(roof);
for(let i=0;i<3;i++){const win=new THREE.Mesh(new THREE.BoxGeometry(.12,1.1,.9),new THREE.MeshStandardMaterial({color:0x75d5cb,emissive:0x164c4a,emissiveIntensity:1.2}));win.position.set(11.94,1.7,-18+i*1.8);scene.add(win)}
// Player character built from simple 3D meshes
const player=new THREE.Group();scene.add(player);player.position.set(0,0,17);
const body=new THREE.Mesh(new THREE.CapsuleGeometry(.48,.9,4,8),mat(0x314e59));body.position.y=1.05;body.castShadow=true;player.add(body);
const head=new THREE.Mesh(new THREE.SphereGeometry(.34,12,10),mat(0xc78e67));head.position.y=1.85;head.castShadow=true;player.add(head);
const pack=new THREE.Mesh(new THREE.BoxGeometry(.55,.7,.28),mat(0x9b7545));pack.position.set(0,1.12,.48);player.add(pack);
 // Aarav's emergency machete: procedural low-poly weapon
 const machete=new THREE.Group();machete.position.set(.48,1.05,-.28);machete.rotation.set(-.25,0,-.35);player.add(machete);
 const macheteHandle=new THREE.Mesh(new THREE.CylinderGeometry(.055,.07,.48,7),mat(0x68452d));macheteHandle.rotation.z=-.18;macheteHandle.position.y=-.18;machete.add(macheteHandle);
 const macheteGuard=new THREE.Mesh(new THREE.BoxGeometry(.3,.07,.09),mat(0xb7a36a));macheteGuard.position.y=.08;machete.add(macheteGuard);
 const macheteBlade=new THREE.Mesh(new THREE.BoxGeometry(.13,.72,.045),new THREE.MeshStandardMaterial({color:0xc8d5d2,metalness:.82,roughness:.24}));macheteBlade.position.y=.46;macheteBlade.rotation.z=-.1;macheteBlade.add(new THREE.Mesh(new THREE.ConeGeometry(.075,.2,4),new THREE.MeshStandardMaterial({color:0xc8d5d2,metalness:.82,roughness:.24})));macheteBlade.children[0].position.y=.43;macheteBlade.children[0].rotation.z=Math.PI;machete.add(macheteBlade);
 let macheteSwingUntil=0,macheteCooldown=0;
 // Compact emergency flare pistol
 const pistol=new THREE.Group();pistol.position.set(.48,1.02,-.32);pistol.rotation.set(-.12,0,-.18);player.add(pistol);
 const pistolGrip=new THREE.Mesh(new THREE.BoxGeometry(.14,.34,.17),mat(0x493a31));pistolGrip.position.y=-.12;pistolGrip.rotation.z=-.18;pistol.add(pistolGrip);
 const pistolBody=new THREE.Mesh(new THREE.BoxGeometry(.2,.19,.48),mat(0x394b4a));pistolBody.position.set(0,.09,-.16);pistol.add(pistolBody);
 const pistolBarrel=new THREE.Mesh(new THREE.CylinderGeometry(.055,.065,.38,8),mat(0x202b2b));pistolBarrel.rotation.x=Math.PI/2;pistolBarrel.position.set(0,.1,-.52);pistol.add(pistolBarrel);
 const pistolFlash=new THREE.PointLight(0xffb45b,0,5);pistolFlash.position.set(0,.12,-.72);pistol.add(pistolFlash);
 let pistolAmmo=12,pistolReloading=false,pistolKick=0,pistolDamage=25,pistolUpgraded=false;

// Reliable local procedural survivor model; never disappears if a remote GLB fails
const playerPlaceholder=[body,head,pack];
const heroLimbs=[];
body.material=mat(0x34566b);body.scale.set(.88,1,.72);
const pantsMat=mat(0x263640),skinMat=mat(0xc78e67),bootMat=mat(0x29251f),hairMat=mat(0x29221c);
for(const x of [-.23,.23]){
 const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.16,.58,4,7),pantsMat);leg.position.set(x,.48,0);leg.castShadow=true;player.add(leg);heroLimbs.push(leg);
 const boot=new THREE.Mesh(new THREE.BoxGeometry(.25,.16,.38),bootMat);boot.position.set(x,.12,-.07);boot.castShadow=true;player.add(boot);heroLimbs.push(boot);
 const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.115,.62,4,7),skinMat);arm.position.set(x*2,1.12,0);arm.rotation.z=x<0?-.12:.12;arm.castShadow=true;player.add(arm);heroLimbs.push(arm);
}
const hair=new THREE.Mesh(new THREE.SphereGeometry(.35,12,8,0,Math.PI*2,0,Math.PI*.58),hairMat);hair.position.set(0,1.94,0);hair.castShadow=true;player.add(hair);
const heroEyeMat=new THREE.MeshBasicMaterial({color:0x171717});
for(const x of [-.12,.12]){const eye=new THREE.Mesh(new THREE.SphereGeometry(.035,6,6),heroEyeMat);eye.position.set(x,1.86,-.3);player.add(eye);heroLimbs.push(eye)}
heroLimbs.push(hair);playerPlaceholder.push(...heroLimbs);
// Replace the blocky fallback with a textured, rigged CC0 survivor character when the model loads.
let playerMixer=null,playerIdle=null,playerWalk=null,playerSprint=null,playerActiveAction=null;
loadModel('packs/mini-characters/character-male-c.glb').then(gltf=>{
 const avatar=gltf.scene.clone(true);const box=new THREE.Box3().setFromObject(avatar);const size=box.getSize(new THREE.Vector3());const center=box.getCenter(new THREE.Vector3());const targetHeight=2.25;avatar.scale.setScalar(targetHeight/Math.max(size.y,.01));avatar.position.set(-center.x*avatar.scale.x,-box.min.y*avatar.scale.y,-center.z*avatar.scale.z);avatar.rotation.y=Math.PI;
 avatar.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});player.add(avatar);playerPlaceholder.forEach(o=>o.visible=false);
 if(gltf.animations?.length){playerMixer=new THREE.AnimationMixer(avatar);const findClip=(keys)=>gltf.animations.find(c=>keys.some(k=>c.name.toLowerCase().includes(k)));const idleClip=findClip(['idle','stand'])||gltf.animations[0];const walkClip=findClip(['walk']);const sprintClip=findClip(['sprint','run']);if(idleClip)playerIdle=playerMixer.clipAction(idleClip);if(walkClip)playerWalk=playerMixer.clipAction(walkClip);if(sprintClip)playerSprint=playerMixer.clipAction(sprintClip);playerActiveAction=playerIdle;if(playerActiveAction)playerActiveAction.play()}
 console.info('CC0 animated survivor loaded',gltf.animations.map(a=>a.name));
}).catch(e=>console.warn('Animated survivor unavailable; using animated local character',e));
const crystalMat=new THREE.MeshStandardMaterial({color:0x7fffe5,emissive:0x18bca4,emissiveIntensity:2,metalness:.3,roughness:.2});
const crystals=[];for(const [x,z] of [[-18,2],[19,12],[18,-28]]){const g=new THREE.Group();const gem=new THREE.Mesh(new THREE.OctahedronGeometry(.8),crystalMat);gem.position.y=1.25;g.add(gem);const ring=new THREE.Mesh(new THREE.TorusGeometry(1.15,.045,8,24),new THREE.MeshBasicMaterial({color:0x7fffe5}));ring.rotation.x=Math.PI/2;ring.position.y=1.25;g.add(ring);g.position.set(x,0,z);scene.add(g);crystals.push({group:g,got:false})}
// Emergency medkits: restore health when collected in the jungle
const medkits=[];
for(const [x,z] of [[-28,-13],[8,27]]){
  const kit=new THREE.Group();
  const box=new THREE.Mesh(new THREE.BoxGeometry(.85,.42,.65),mat(0xd8ded3));
  box.position.y=.48;kit.add(box);
  const crossMat=new THREE.MeshStandardMaterial({color:0x42df8a,emissive:0x126b3c,emissiveIntensity:1.1});
  const barA=new THREE.Mesh(new THREE.BoxGeometry(.16,.5,.08),crossMat);barA.position.set(0,.72,-.34);kit.add(barA);
  const barB=new THREE.Mesh(new THREE.BoxGeometry(.42,.16,.08),crossMat);barB.position.set(0,.72,-.34);kit.add(barB);
  kit.position.set(x,0,z);scene.add(kit);medkits.push({group:kit,used:false});
}
// Creature stalks the player
const enemy=new THREE.Group();scene.add(enemy);enemy.position.set(-14,0,-15);
const monsterMat=mat(0x27332b),eyeMat=new THREE.MeshStandardMaterial({color:0xff5b36,emissive:0xff2200,emissiveIntensity:2});
const torso=new THREE.Mesh(new CapsuleGeometryFallback(.62,1.0),monsterMat);torso.position.y=1.15;enemy.add(torso);
for(const x of [-.23,.23]){const eye=new THREE.Mesh(new THREE.SphereGeometry(.095,8,8),eyeMat);eye.position.set(x,1.75,-.43);enemy.add(eye)}
const monsterClaws=[];
for(let i=0;i<4;i++){const claw=new THREE.Mesh(new THREE.ConeGeometry(.12,.65,6),monsterMat);claw.position.set(i%2?-.45:.45,.65,i<2?-.35:.35);claw.rotation.z=Math.PI;enemy.add(claw);monsterClaws.push(claw)}
function CapsuleGeometryFallback(r,l){return new THREE.CapsuleGeometry(r,l,4,8)}
const monsterPlaceholder=[torso,...enemy.children.filter(o=>o!==torso)];
// A smaller jungle stalker guards the radio tower trail
const stalker=new THREE.Group();stalker.position.set(27,0,-5);scene.add(stalker);
const stalkerMat=mat(0x17251f),stalkerEyeMat=new THREE.MeshStandardMaterial({color:0xffbd45,emissive:0xff6a12,emissiveIntensity:2.4});
const stalkerBody=new THREE.Mesh(new THREE.SphereGeometry(.58,10,8),stalkerMat);stalkerBody.scale.set(1,.72,1.25);stalkerBody.position.y=.72;stalker.add(stalkerBody);
const stalkerHead=new THREE.Mesh(new THREE.SphereGeometry(.34,10,8),stalkerMat);stalkerHead.position.set(0,.88,-.58);stalker.add(stalkerHead);
for(const side of [-1,1]){const eye=new THREE.Mesh(new THREE.SphereGeometry(.085,8,8),stalkerEyeMat);eye.position.set(side*.19,.98,-.86);stalker.add(eye)}
const stalkerLegs=[];for(let i=0;i<6;i++){const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.075,.55,3,6),stalkerMat);leg.position.set((i%2?-.42:.42),.42,(Math.floor(i/2)-1)*.38);leg.rotation.z=(i%2?-.55:.55);stalker.add(leg);stalkerLegs.push(leg)}
let stalkerHitAt=0,stalkerWarned=false,stalkerDefeated=false,stalkerHealth=100;
loadModel('packs/space-kit/alien.glb').then(gltf=>{monsterPlaceholder.forEach(o=>o.visible=false);const creature=gltf.scene.clone(true);creature.scale.setScalar(3.2);creature.position.y=0;creature.rotation.y=Math.PI;creature.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});enemy.add(creature)}).catch(e=>console.warn('Creature model unavailable',e));
// Rescue helicopter: procedural low-poly aircraft, built into the game (no external download)
const helicopter=new THREE.Group();helicopter.visible=false;scene.add(helicopter);
const heliBodyMat=new THREE.MeshStandardMaterial({color:0x344b48,metalness:.55,roughness:.42});
const heliGlassMat=new THREE.MeshStandardMaterial({color:0x7cc9ce,metalness:.35,roughness:.18,transparent:true,opacity:.82,emissive:0x143b40});
const heliYellow=mat(0xd7a94a,.55),heliDark=mat(0x202b2b,.7);
const cabin=new THREE.Mesh(new THREE.SphereGeometry(1,12,9),heliBodyMat);cabin.scale.set(1.55,.72,2.05);cabin.position.y=.15;helicopter.add(cabin);
const cockpit=new THREE.Mesh(new THREE.SphereGeometry(1,12,9),heliGlassMat);cockpit.scale.set(1.18,.48,.78);cockpit.position.set(0,.3,-1.35);helicopter.add(cockpit);
const tailBoom=new THREE.Mesh(new THREE.CylinderGeometry(.13,.28,4.1,8),heliBodyMat);tailBoom.rotation.x=Math.PI/2;tailBoom.position.set(0,.18,3.05);helicopter.add(tailBoom);
const tailFin=new THREE.Mesh(new THREE.BoxGeometry(.16,1.05,.72),heliYellow);tailFin.position.set(0,.72,4.8);helicopter.add(tailFin);
const rotorHub=new THREE.Group();rotorHub.position.y=.92;helicopter.add(rotorHub);
for(let i=0;i<4;i++){const blade=new THREE.Mesh(new THREE.BoxGeometry(.22,.055,6.2),heliDark);blade.position.z=3.05;blade.rotation.y=i*Math.PI/2;rotorHub.add(blade)}
const tailRotor=new THREE.Group();tailRotor.position.set(0,.42,4.85);helicopter.add(tailRotor);
for(let i=0;i<3;i++){const blade=new THREE.Mesh(new THREE.BoxGeometry(.09,.95,.12),heliDark);blade.rotation.z=i*Math.PI/3;tailRotor.add(blade)}
for(const x of [-1,1]){const skid=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,3.1,8),heliDark);skid.rotation.z=Math.PI/2;skid.position.set(x*.95,-.82,.1);helicopter.add(skid);for(const z of [-1.1,1.15]){const strut=new THREE.Mesh(new THREE.CylinderGeometry(.055,.055,.8,6),heliYellow);strut.position.set(x*.78,-.48,z);helicopter.add(strut)}}
const heliLamp=new THREE.SpotLight(0xc9fff0,0,26,Math.PI/7,.55,1.3);heliLamp.position.set(0,-.2,-1.5);heliLamp.target.position.set(0,-5,-5);helicopter.add(heliLamp,heliLamp.target);
let extractionActive=false,extractionElapsed=0;
// Optional rescue radio side mission at the research outpost
const radioTower=new THREE.Group();radioTower.position.set(23,0,-17);scene.add(radioTower);
 // Ammo supply crates and a field weapon bench
 const ammoCrates=[];
 for(const pos of [[-8,0,4],[20,0,-12],[-31,0,-24]]){
  const crate=new THREE.Group();crate.position.set(pos[0],0,pos[2]);scene.add(crate);
  const box=new THREE.Mesh(new THREE.BoxGeometry(.85,.55,.65),mat(0x344b43));box.position.y=.42;crate.add(box);
  const stripe=new THREE.Mesh(new THREE.BoxGeometry(.88,.12,.68),mat(0xe2b34c));stripe.position.y=.55;crate.add(stripe);
  const glow=new THREE.PointLight(0xffc45c,.8,4);glow.position.y=1;crate.add(glow);
  ammoCrates.push({group:crate,used:false});
 }
 const weaponBench=new THREE.Group();weaponBench.position.set(18,0,-11);scene.add(weaponBench);
 const benchTop=new THREE.Mesh(new THREE.BoxGeometry(1.8,.18,.85),mat(0x68472d));benchTop.position.y=1;weaponBench.add(benchTop);
 for(const x of [-.72,.72])for(const z of [-.28,.28]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.12,1,.12),mat(0x493528));leg.position.set(x,.5,z);weaponBench.add(leg)}
 const upgradeLamp=new THREE.PointLight(0x62cfff,1.1,5);upgradeLamp.position.y=1.6;weaponBench.add(upgradeLamp);

const radioPole=new THREE.Mesh(new THREE.CylinderGeometry(.13,.2,7,8),mat(0x64736f));radioPole.position.y=3.5;radioTower.add(radioPole);
for(let i=0;i<3;i++){const brace=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,4.2,6),mat(0x89938b));brace.position.y=2.2;brace.rotation.z=(i-1)*.28;radioTower.add(brace)}
const radioDish=new THREE.Mesh(new THREE.SphereGeometry(1.05,12,8,0,Math.PI*2,0,Math.PI/2),new THREE.MeshStandardMaterial({color:0xb9c7c1,metalness:.65,roughness:.32,side:THREE.DoubleSide}));radioDish.position.set(0,6.3,0);radioDish.rotation.x=-Math.PI/2;radioTower.add(radioDish);
const radioCore=new THREE.Mesh(new THREE.SphereGeometry(.2,10,8),new THREE.MeshStandardMaterial({color:0x62ffe0,emissive:0x18bda3,emissiveIntensity:2}));radioCore.position.set(0,6.25,-.15);radioTower.add(radioCore);
const radioLamp=new THREE.PointLight(0x5bffe0,1.2,10);radioLamp.position.set(0,6.5,0);radioTower.add(radioLamp);
const radioWaves=[];for(let i=0;i<3;i++){const wave=new THREE.Mesh(new THREE.TorusGeometry(1.25+i*.55,.035,6,32),new THREE.MeshBasicMaterial({color:0x66ffe0,transparent:true,opacity:.38-i*.08}));wave.position.set(0,6.3,0);wave.rotation.x=Math.PI/2;radioTower.add(wave);radioWaves.push(wave)}
let radioSignalSent=false;
// Two stranded survivors can be found and escorted to safety
const survivors=[];
const survivorMat=new THREE.MeshStandardMaterial({color:0xb66a3b,roughness:.85});
const survivorSkin=new THREE.MeshStandardMaterial({color:0xc58e69,roughness:.9});
const survivorGlowMat=new THREE.MeshBasicMaterial({color:0x7bffd0,transparent:true,opacity:.72});
for(const [x,z] of [[13,-12],[-24,19]]){const npc=new THREE.Group();npc.position.set(x,0,z);scene.add(npc);const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.34,.72,4,8),survivorMat);torso.position.y=1.05;torso.castShadow=true;npc.add(torso);const headNpc=new THREE.Mesh(new THREE.SphereGeometry(.25,12,10),survivorSkin);headNpc.position.y=1.72;headNpc.castShadow=true;npc.add(headNpc);for(const side of [-1,1]){const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.11,.52,3,6),survivorMat);arm.position.set(side*.43,1.12,0);arm.rotation.z=side*.18;npc.add(arm);const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.13,.52,3,6),mat(0x343c42));leg.position.set(side*.17,.35,0);npc.add(leg)}const ringNpc=new THREE.Mesh(new THREE.TorusGeometry(.75,.035,6,24),survivorGlowMat);ringNpc.rotation.x=Math.PI/2;ringNpc.position.y=.12;npc.add(ringNpc);const lightNpc=new THREE.PointLight(0x65ffd0,.8,5);lightNpc.position.y=1.7;npc.add(lightNpc);survivors.push({group:npc,ring:ringNpc,rescued:false,phase:Math.random()*6})}
let survivorsRescued=0;
// Extraction beacon
const beacon=new THREE.Group();beacon.position.set(0,0,-34);scene.add(beacon);const pillar=new THREE.Mesh(new THREE.CylinderGeometry(.35,.5,3,8),mat(0x566c67));pillar.position.y=1.5;beacon.add(pillar);const beam=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,8,12),new THREE.MeshBasicMaterial({color:0x8affc7,transparent:true,opacity:.38}));beam.position.y=5;beacon.add(beam);const beaconLight=new THREE.PointLight(0x5dffb1,0,20);beaconLight.position.y=3;beacon.add(beaconLight);
let health=100,found=0,started=false,ended=false,lastHit=0,stamina=100,beaconPrompted=false,lowHealthWarned=false,monsterNearWarned=false;
let dodgeUntil=0,dodgeCooldown=0,dodgeDirection=new THREE.Vector3();
const keys={x:0,y:0};let running=false,cameraYaw=0,cameraDrag=null;
renderer.domElement.addEventListener('pointerdown',e=>{cameraDrag={id:e.pointerId,x:e.clientX};renderer.domElement.setPointerCapture(e.pointerId)});
renderer.domElement.addEventListener('pointermove',e=>{if(cameraDrag&&cameraDrag.id===e.pointerId){cameraYaw-=(e.clientX-cameraDrag.x)*.006;cameraDrag.x=e.clientX}});
renderer.domElement.addEventListener('pointerup',e=>{if(cameraDrag?.id===e.pointerId)cameraDrag=null});
renderer.domElement.addEventListener('pointercancel',()=>cameraDrag=null);
const $=id=>document.getElementById(id);
let audioCtx=null,ambientOsc=null,lastFootstep=0,lastGrowl=0;
function sound(freq=440,duration=.12,type='sine',volume=.045){try{audioCtx??=new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.setValueAtTime(freq,audioCtx.currentTime);g.gain.setValueAtTime(volume,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+duration);o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+duration)}catch(e){}}
function startAmbience(){try{audioCtx??=new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();if(ambientOsc)return;ambientOsc=audioCtx.createOscillator();const gain=audioCtx.createGain();ambientOsc.type='sine';ambientOsc.frequency.value=58;gain.gain.value=.012;ambientOsc.connect(gain);gain.connect(audioCtx.destination);ambientOsc.start()}catch(e){}}
const toast=(s)=>{$('toast').textContent=s;$('toast').classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>$('toast').classList.remove('show'),2200)};
function updateHud(){$('ammo').textContent=pistolReloading?'RELOAD':pistolAmmo+'/12';$('health').textContent=health;const fullHealth=$('healthFill');if(fullHealth)fullHealth.style.width=health+'%';$('healthFillMini').style.width=health+'%';$('staminaFill').style.width=stamina+'%';$('crystals').textContent=found+'/3';$('objective').textContent=found<3?'Find '+(3-found)+' energy crystal'+(found===2?'':'s'):'Reach the extraction beacon';$('hint').textContent=found<3?'The jungle is not empty…':'The beacon is active. Reach the coast.';const side=$('sideMission');if(side)side.textContent=survivorsRescued===2?'SURVIVORS RESCUED: Both survivors are safe':survivorsRescued>0?'RESCUE MISSION: Find the second survivor ('+survivorsRescued+'/2)':radioSignalSent?'RESCUE RADIO: Distress signal transmitted':hiddenCacheFound?'SECRET CHAMBER CLEARED: Hidden cache secured':templeRelicFound?'SECRET MISSION COMPLETE: Ancient relic secured':templeDoorOpen?'SECRET MISSION: Find the hidden chamber cache':templeDiscovered?'SECRET TEMPLE: Solve the 3-rune door puzzle':'SIDE MISSION: Find the hidden jungle treasure';const bossHud=$('bossHud');if(bossHud){bossHud.classList.toggle('hidden',!bossAwakened||bossDefeated);$('bossHealthFill').style.width=bossHealth+'%';$('bossHealthText').textContent=Math.ceil(bossHealth)+'%'}}
$('attack').onclick=()=>{if(!started||ended||elapsed<macheteCooldown){if(elapsed<macheteCooldown)toast('Machete is recharging!');return}macheteCooldown=elapsed+.62;macheteSwingUntil=elapsed+.28;const d=player.position.distanceTo(stalker.position);if(!stalkerDefeated&&d<4.4){stalkerHealth=Math.max(0,stalkerHealth-34);stalkerEyeMat.emissiveIntensity=5;setTimeout(()=>{if(!stalkerDefeated)stalkerEyeMat.emissiveIntensity=2.4},180);sound(260,.12,'sawtooth',.07);if(stalkerHealth<=0){stalkerDefeated=true;scene.remove(stalker);health=Math.min(100,health+15);toast('JUNGLE STALKER DEFEATED! +15 HEALTH')}else toast('MACHETE HIT! Stalker health: '+stalkerHealth+'%');updateHud();return}toast('Swing missed! Get closer to the enemy.')};
$('shoot').onclick=()=>{if(!started||ended)return;if(pistolReloading){toast('Reloading…');return}if(pistolAmmo<=0){pistolReloading=true;updateHud();toast('RELOADING PISTOL…');setTimeout(()=>{pistolAmmo=12;pistolReloading=false;updateHud();toast('PISTOL RELOADED!')},1450);return}pistolAmmo--;pistolKick=.16;pistolFlash.intensity=4.5;setTimeout(()=>pistolFlash.intensity=0,75);sound(170,.1,'square',.07);const sd=player.position.distanceTo(stalker.position),bd=player.position.distanceTo(enemy.position);if(!stalkerDefeated&&sd<20&&sd<=bd){stalkerHealth=Math.max(0,stalkerHealth-pistolDamage);if(stalkerHealth===0){stalkerDefeated=true;scene.remove(stalker);health=Math.min(100,health+15);toast('STALKER ELIMINATED! +15 HEALTH')}else toast('PISTOL HIT! Stalker: '+stalkerHealth+'%')}else if(bossAwakened&&!bossDefeated&&bd<20){bossHealth=Math.max(0,bossHealth-pistolDamage);if(bossHealth===0){bossDefeated=true;scene.remove(enemy);toast('ISLAND GUARDIAN DEFEATED!')}else toast('PISTOL HIT! Guardian: '+bossHealth+'%')}else toast('SHOT FIRED! Target is out of range.');updateHud();if(pistolAmmo===0){pistolReloading=true;updateHud();setTimeout(()=>{pistolAmmo=12;pistolReloading=false;updateHud();toast('PISTOL RELOADED!')},1450)}};
$('start').onclick=()=>{started=true;startAmbience();sound(520,.18,'triangle');$('startscreen').classList.add('hidden');toast('AARAV: I need to find the others…')};
$('restart').onclick=()=>location.reload();
$('run').addEventListener('pointerdown',()=>running=true);$('run').addEventListener('pointerup',()=>running=false);$('run').addEventListener('pointercancel',()=>running=false);
function dodge(){if(!started||ended||elapsed<dodgeCooldown||stamina<22){toast(stamina<22?'Too tired to dodge!':'Dodge is recharging');return}const len=Math.hypot(keys.x,keys.y);dodgeDirection.set(keys.x,0,keys.y);if(len<.1)dodgeDirection.set(0,0,1);dodgeDirection.normalize().applyAxisAngle(new THREE.Vector3(0,1,0),cameraYaw);dodgeUntil=elapsed+.38;dodgeCooldown=elapsed+1.25;stamina=Math.max(0,stamina-22);sound(180,.1,'triangle',.035);toast('DODGE!');updateHud()}
$('dodge').addEventListener('pointerdown',dodge);
$('interact').onclick=()=>{const enemyDistance=player.position.distanceTo(enemy.position);
 for(const crate of ammoCrates){if(!crate.used&&player.position.distanceTo(crate.group.position)<3.2){crate.used=true;scene.remove(crate.group);pistolAmmo=Math.min(12,pistolAmmo+12);pistolReloading=false;updateHud();sound(820,.18,'triangle',.06);toast('AMMO COLLECTED! PISTOL: '+pistolAmmo+'/12');return}}
 if(!pistolUpgraded&&treasureFound&&player.position.distanceTo(weaponBench.position)<3.6){pistolUpgraded=true;pistolDamage=40;upgradeLamp.color.setHex(0x7dffb0);upgradeLamp.intensity=2.8;updateHud();sound(540,.2,'triangle',.07);toast('PISTOL UPGRADED! DAMAGE +60%');return}
 if(!pistolUpgraded&&player.position.distanceTo(weaponBench.position)<3.6){toast('WEAPON BENCH: Find the jungle treasure to unlock the pistol upgrade.');return}
 for(const survivor of survivors){if(!survivor.rescued&&player.position.distanceTo(survivor.group.position)<3.4){survivor.rescued=true;survivorsRescued++;scene.remove(survivor.group);health=Math.min(100,health+20);sound(690,.24,'triangle',.07);setTimeout(()=>sound(920,.26,'sine',.06),110);updateHud();toast(survivorsRescued===2?'BOTH SURVIVORS RESCUED! +20 HEALTH.':'SURVIVOR RESCUED! +20 HEALTH. Find the other signal marker.');return}}if(!radioSignalSent&&player.position.distanceTo(radioTower.position)<4.2){radioSignalSent=true;flareAmmo++;radioCore.material.emissiveIntensity=4;radioLamp.intensity=3.5;sound(760,.25,'triangle',.07);setTimeout(()=>sound(1120,.32,'sine',.06),140);for(const wave of radioWaves)wave.material.opacity=.8;updateHud();toast('RESCUE SIGNAL SENT! A flare was added to your gear.');return}if(treasureFound&&flareAmmo>0&&enemyDistance<10&&!bossDefeated){flareAmmo--;bossHealth=Math.max(0,bossHealth-35);sound(240,.18,'sawtooth',.08);setTimeout(()=>sound(720,.22,'triangle',.07),80);enemy.traverse(o=>{if(o.isMesh&&o.material&&o.material.emissive){o.material.emissive.setHex(0xff3b16);setTimeout(()=>o.material.emissive.setHex(0x000000),180)}});if(bossHealth===0){bossDefeated=true;scene.remove(enemy);toast('BOSS DEFEATED! The extraction route is safer now.')}else toast('FLARE HIT! Boss health: '+bossHealth+'%');updateHud();return}if(!treasureFound&&player.position.distanceTo(chest.position)<3.2){treasureFound=true;flareAmmo=3;scene.remove(chest);sound(980,.3,'triangle',.08);updateHud();toast('TREASURE FOUND! You got 3 emergency flares. Use them near the monster!');return}if(!templeDoorOpen&&!templeRelicFound&&player.position.distanceTo(temple.position)<10)toast('The inner door is sealed. Solve the three rune puzzle first!');if(templeDoorOpen&&!templeRelicFound&&player.position.distanceTo(templeAltar.getWorldPosition(new THREE.Vector3()))<4.2){templeRelicFound=true;templeAltar.remove(relic);templeAltar.remove(relicRing);templeGlow.intensity=.35;health=Math.min(100,health+25);sound(880,.24,'triangle',.07);setTimeout(()=>sound(1320,.32,'sine',.05),100);updateHud();toast('ANCIENT RELIC FOUND! The temple restores 25 health.');return}if(templeDoorOpen&&!hiddenCacheFound&&player.position.distanceTo(hiddenCache.position)<3.5){hiddenCacheFound=true;scene.remove(hiddenCache);health=Math.min(100,health+50);sound(1040,.3,'triangle',.08);updateHud();toast('HIDDEN CACHE FOUND! +50 HEALTH. Temple treasure secured.');return}if(!templeDoorOpen&&templeDiscovered){let nearest=null,nearestDist=3.2;for(const rune of runeButtons){const p=rune.group.getWorldPosition(new THREE.Vector3()),d=player.position.distanceTo(p);if(d<nearestDist){nearest=rune;nearestDist=d}}if(nearest){if(nearest.index===runeOrder[runeProgress]){nearest.active=true;nearest.mark.material.color.setHex(0xffcf63);nearest.mark.material.emissive.setHex(0x9a6418);nearest.mark.material.emissiveIntensity=1.6;runeProgress++;sound(620+runeProgress*140,.2,'triangle',.06);if(runeProgress===3){templeDoorOpen=true;templeDoor.rotation.y=-Math.PI/2;templeDoor.position.x=-1.55;templeGlow.intensity=3.5;updateHud();toast('SECRET DOOR OPEN! Enter and claim the relic.')}else toast('Rune '+runeProgress+'/3 activated. Follow the glowing sequence!')}else{runeProgress=0;for(const rune of runeButtons){rune.active=false;rune.mark.material.color.setHex(0x52645a);rune.mark.material.emissive.setHex(0x17231d);rune.mark.material.emissiveIntensity=.35}sound(120,.3,'sawtooth',.06);toast('Wrong rune! Puzzle reset. Hint: 2 - 1 - 3.')}return}}if(found===3&&player.position.distanceTo(beacon.position)<5&&(!bossAwakened||bossDefeated))finish(true);else if(!treasureFound&&player.position.distanceTo(chest.position)<7)toast('Move closer to the treasure chest and press USE');else if(found===3&&bossAwakened&&!bossDefeated)toast('Defeat the island guardian first! Find the cave treasure for flares.');else toast(found===3?'Get closer to the extraction beacon':'Find the glowing crystals first')};
function finish(win){ended=true;sound(win?740:85,.55,win?'triangle':'sawtooth',.08);if(win){extractionActive=true;extractionElapsed=0;helicopter.visible=true;helicopter.position.set(0,22,-78);helicopter.rotation.y=Math.PI;heliLamp.intensity=2.2;$('endTitle').textContent='RESCUE INBOUND';$('endText').textContent='A rescue helicopter is approaching through the storm…';$('endScreen').classList.remove('hidden');$('endScreen').classList.add('victoryScreen');$('endTitle').classList.add('victoryTitle')}else{$('endTitle').textContent='YOU WERE HUNTED';$('endText').textContent='The island has claimed another explorer. Try a different route.';$('endScreen').classList.remove('hidden')}}
// Touch joystick and keyboard
const joy=$('joystick'),stick=$('stick');let joyId=null;function joyMove(e){const r=joy.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),len=Math.hypot(dx,dy),m=Math.min(38,len),a=Math.atan2(dy,dx);keys.x=Math.cos(a)*m/38;keys.y=Math.sin(a)*m/38;stick.style.transform='translate('+keys.x*28+'px,'+keys.y*28+'px)'}
joy.addEventListener('pointerdown',e=>{joyId=e.pointerId;joy.setPointerCapture(joyId);joyMove(e)});joy.addEventListener('pointermove',e=>{if(e.pointerId===joyId)joyMove(e)});function joyEnd(){joyId=null;keys.x=keys.y=0;stick.style.transform='translate(0,0)'}joy.addEventListener('pointerup',joyEnd);joy.addEventListener('pointercancel',joyEnd);
addEventListener('keydown',e=>{if(e.key==='w'||e.key==='ArrowUp')keys.y=-1;if(e.key==='s'||e.key==='ArrowDown')keys.y=1;if(e.key==='a'||e.key==='ArrowLeft')keys.x=-1;if(e.key==='d'||e.key==='ArrowRight')keys.x=1;if(e.key==='e'||e.key==='E')$('interact').click();if(e.shiftKey)running=true});addEventListener('keyup',e=>{if(['w','s','ArrowUp','ArrowDown'].includes(e.key))keys.y=0;if(['a','d','ArrowLeft','ArrowRight'].includes(e.key))keys.x=0;if(e.key==='Shift')running=false});
const radar=$('minimap')?.getContext('2d');
function drawRadar(){if(!radar)return;const w=radar.canvas.width,h=radar.canvas.height;radar.clearRect(0,0,w,h);radar.fillStyle='rgba(4,18,20,.78)';radar.beginPath();radar.arc(w/2,h/2,w/2-2,0,Math.PI*2);radar.fill();radar.strokeStyle='rgba(190,230,190,.5)';radar.lineWidth=1;radar.beginPath();radar.arc(w/2,h/2,w/2-4,0,Math.PI*2);radar.stroke();const dot=(x,z,color,r=3)=>{const px=w/2+(x-player.position.x)*.92,py=h/2+(z-player.position.z)*.92;if(Math.hypot(px-w/2,py-h/2)<w/2-7){radar.fillStyle=color;radar.beginPath();radar.arc(px,py,r,0,Math.PI*2);radar.fill()}};dot(0,0,'#d9ff9b',4);dot(enemy.position.x,enemy.position.z,'#ff655c',4);dot(beacon.position.x,beacon.position.z,'#69f5d0',4);for(const c of crystals)if(!c.got)dot(c.group.position.x,c.group.position.z,'#66eaff',3);for(const kit of medkits)if(!kit.used)dot(kit.group.position.x,kit.group.position.z,'#6cff9b',3)}
const clock=new THREE.Clock();const cameraOffset=new THREE.Vector3(0,4.25,10.8);let elapsed=0;
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);elapsed+=dt;const night=(Math.sin(elapsed*.018)+1)*.5;sun.intensity=2.0+night*1.5;scene.fog.color.setHex(night>.72?0x263747:0x8daeb0);scene.background.copy(scene.fog.color);$('staminaFill').style.width=stamina+'%';if(started&&!ended){const len=Math.hypot(keys.x,keys.y);if(len>.05){const sprinting=running&&stamina>1;const speed=sprinting?10:6;if(sprinting)stamina=Math.max(0,stamina-25*dt);else stamina=Math.min(100,stamina+14*dt);if(elapsed-lastFootstep>(sprinting?.28:.48)){sound(sprinting?115:82,.055,'triangle',.018);lastFootstep=elapsed;}
const move=new THREE.Vector3(keys.x/Math.max(1,len),0,keys.y/Math.max(1,len)).applyAxisAngle(new THREE.Vector3(0,1,0),cameraYaw);
const dx=move.x,dz=move.z;player.position.x=THREE.MathUtils.clamp(player.position.x+dx*speed*dt,-43,43);player.position.z=THREE.MathUtils.clamp(player.position.z+dz*speed*dt,-43,43);player.rotation.y=Math.atan2(dx,dz);body.position.y=1.05+Math.sin(elapsed*12)*(running?.08:.035);if(!playerMixer){heroLimbs.forEach((part,i)=>{if(i<2)part.rotation.x=Math.sin(elapsed*(sprinting?13:9)+Math.PI)*.48;if(i>=2&&i<4)part.rotation.x=Math.sin(elapsed*(sprinting?13:9))*.48})}}else if(!playerMixer){heroLimbs.forEach(part=>{part.rotation.x=THREE.MathUtils.lerp(part.rotation.x,0,dt*8)})}if(playerMixer){const desired=len>.05?(running&&stamina>1?(playerSprint||playerWalk||playerIdle):(playerWalk||playerIdle)):playerIdle;if(desired&&desired!==playerActiveAction){desired.reset().fadeIn(.18);playerActiveAction?.fadeOut(.18);playerActiveAction=desired}playerMixer.update(dt)}
for(const kit of medkits){if(!kit.used){kit.group.rotation.y+=dt*.7;kit.group.position.y=.08+Math.sin(elapsed*2.2+kit.group.position.x)*.08;if(player.position.distanceTo(kit.group.position)<2.2){kit.used=true;health=Math.min(100,health+35);scene.remove(kit.group);sound(660,.2,'sine',.06);updateHud();toast('Medkit collected: health restored!')}}}
for(const c of crystals){c.group.rotation.y+=dt*1.2;c.group.position.y=Math.sin(elapsed*2+c.group.position.x)*.12;if(!c.got&&player.position.distanceTo(c.group.position)<2.2){c.got=true;found++;scene.remove(c.group);sound(880,.22,'sine',.07);setTimeout(()=>sound(1180,.28,'sine',.05),90);updateHud();toast('Energy crystal secured!')}}
const toPlayer=new THREE.Vector3().subVectors(player.position,enemy.position);const dist=toPlayer.length();
if(found===3&&!bossAwakened){bossAwakened=true;updateHud();toast('THE ISLAND GUARDIAN HAS AWAKENED! Find a weapon!')}
const alertRange=found>0?29:22;
if(elapsed<dodgeUntil){player.position.addScaledVector(dodgeDirection,18*dt);player.position.x=THREE.MathUtils.clamp(player.position.x,-43,43);player.position.z=THREE.MathUtils.clamp(player.position.z,-43,43);player.rotation.z=Math.sin(elapsed*35)*.16}
if(dist<alertRange&&!bossDefeated){
  toPlayer.normalize();
  const chasingSpeed=dist<5?3.4:dist<12?2.8:2.2;
  enemy.position.addScaledVector(toPlayer,dt*chasingSpeed);
  enemy.lookAt(player.position.x,0,player.position.z);
  if(dist<12&&elapsed-lastGrowl>5){sound(52,.42,'sawtooth',.035);lastGrowl=elapsed}if(dist<8&&!monsterNearWarned){toast('WARNING: The creature is close!');monsterNearWarned=true}if(dist>11)monsterNearWarned=false
}
enemy.position.y=.06+Math.sin(elapsed*5.5)*.09;
// Creature combat animation: hunch, swipe its claws, and flash its eyes during an attack
const attacking=dist<5.2;
torso.rotation.x=attacking?-.22+Math.sin(elapsed*15)*.12:Math.sin(elapsed*3)*.025;
torso.rotation.z=attacking?Math.sin(elapsed*11)*.09:Math.sin(elapsed*2.5)*.018;
monsterClaws.forEach((claw,i)=>{const side=i%2===0?1:-1;claw.rotation.x=attacking?Math.sin(elapsed*13+i*Math.PI)*.62:Math.sin(elapsed*2+i)*.045;claw.rotation.z=Math.PI+(attacking?side*(.28+Math.max(0,Math.sin(elapsed*13+i))* .35):side*.04)});
eyeMat.emissiveIntensity=attacking?2.8+Math.max(0,Math.sin(elapsed*14))*2.2:1.7+Math.sin(elapsed*2)*.3;
enemy.rotation.z=dist<alertRange?Math.sin(elapsed*8)*.035:0;
const stalkerToPlayer=new THREE.Vector3().subVectors(player.position,stalker.position),stalkerDist=stalkerToPlayer.length();
if(!stalkerDefeated&&stalkerDist<17){stalkerToPlayer.normalize();stalker.position.addScaledVector(stalkerToPlayer,dt*(stalkerDist<4?2.5:1.65));stalker.lookAt(player.position.x,0,player.position.z);if(stalkerDist<10&&!stalkerWarned){toast('JUNGLE STALKER! Something is moving in the bushes!');stalkerWarned=true}if(stalkerDist>12)stalkerWarned=false}
if(pistolKick>0){pistol.position.z=-.32+pistolKick;pistolKick=Math.max(0,pistolKick-dt)}else pistol.position.z=THREE.MathUtils.lerp(pistol.position.z,-.32,dt*18);
if(elapsed<macheteSwingUntil){const swing=(macheteSwingUntil-elapsed)/.28;machete.rotation.x=-1.25*swing;machete.rotation.z=-.9*swing}else{machete.rotation.x=THREE.MathUtils.lerp(machete.rotation.x,-.25,dt*14);machete.rotation.z=THREE.MathUtils.lerp(machete.rotation.z,-.35,dt*14)}
stalker.position.y=.035+Math.sin(elapsed*7)*.045;stalkerLegs.forEach((leg,i)=>{leg.rotation.x=Math.sin(elapsed*11+i*1.7)*.24;leg.rotation.z=(i%2?-.55:.55)+Math.sin(elapsed*9+i)*.12});
if(!stalkerDefeated&&stalkerDist<1.65&&elapsed-stalkerHitAt>1.45&&elapsed>=dodgeUntil){health=Math.max(0,health-8);stalkerHitAt=elapsed;sound(110,.18,'sawtooth',.055);$('hud').classList.remove('damageFlash');void $('hud').offsetWidth;$('hud').classList.add('damageFlash');updateHud();toast('The jungle stalker scratched you!');if(health<=0)finish(false)}if(!bossDefeated&&dist<2.0&&elapsed-lastHit>1.1&&elapsed>=dodgeUntil){health=Math.max(0,health-(bossAwakened?18:12));$('hud').classList.remove('damageFlash');void $('hud').offsetWidth;$('hud').classList.add('damageFlash');lastHit=elapsed;sound(95,.3,'sawtooth',.09);updateHud();toast('The creature hit you!');if(health<=35&&!lowHealthWarned){toast('LOW HEALTH! Find a green medkit!');lowHealthWarned=true}if(health>35)lowHealthWarned=false;if(!health)finish(false)}
survivors.forEach((survivor,i)=>{if(!survivor.rescued){survivor.group.position.y=.035+Math.sin(elapsed*2+survivor.phase)*.035;survivor.group.rotation.y=Math.sin(elapsed*.7+survivor.phase)*.16;survivor.ring.rotation.z+=dt*.55}});templeAltar.rotation.y+=dt*.18;relic.rotation.y+=dt*.75;radioCore.rotation.y+=dt*1.4;radioWaves.forEach((wave,i)=>{wave.scale.setScalar(.8+((elapsed*.42+i*.32)%1)*.55);wave.material.opacity=radioSignalSent?.48:Math.max(.08,.28+Math.sin(elapsed*2.4+i)*.12)});radioLamp.intensity=radioSignalSent?2.5:1.1+Math.sin(elapsed*3)*.35;relic.position.y=1.65+Math.sin(elapsed*2.4)*.16;relicRing.rotation.z+=dt*.45;if(!templeDiscovered&&player.position.distanceTo(temple.position)<13){templeDiscovered=true;updateHud();toast('SECRET TEMPLE DISCOVERED! Activate runes in order: 2 - 1 - 3.')};if(templeDoorOpen){movingBlock.position.x=Math.sin(elapsed*1.8)*1.25;if(!templeTrapTriggered&&player.position.distanceTo(new THREE.Vector3(29,.0,22.25))<2.1){templeTrapTriggered=true;health=Math.max(0,health-15);for(const spike of hazardSpikes)spike.position.y=1.12;sound(85,.32,'sawtooth',.075);updateHud();toast('TEMPLE SPIKE TRAP! You lost 15 health.');if(health<=0)finish(false)}if(!hiddenCacheFound)cacheGlow.intensity=1.2+Math.sin(elapsed*3)*.55}
chest.rotation.y+=dt*.12;
caveLight.intensity=1.7+Math.sin(elapsed*2.4)*.35;
if(!caveTrapTriggered&&!treasureFound&&player.position.distanceTo(trapGroup.position)<2.25){
  caveTrapTriggered=true;health=Math.max(0,health-20);updateHud();
  for(const spike of trapGroup.children){if(spike.geometry.type==='ConeGeometry')spike.position.y=.55}
  sound(72,.38,'sawtooth',.085);toast('CAVE TRAP! You lost 20 health!');
  if(health<=0)finish(false);
}
beaconLight.intensity=found===3&&(!bossAwakened||bossDefeated)?3:0;if(found===3&&(!bossAwakened||bossDefeated)&&player.position.distanceTo(beacon.position)<4){beaconLight.intensity=5;if(!beaconPrompted){toast('Extraction beacon: press USE');beaconPrompted=true}}else{beaconPrompted=false}
}
if(extractionActive){extractionElapsed+=dt;const t=Math.min(1,extractionElapsed/6.5);helicopter.position.set(0,22-17*(t*t*(3-2*t)),-78+43*(t*t*(3-2*t)));helicopter.rotation.y=Math.PI+Math.sin(extractionElapsed*1.8)*.035;rotorHub.rotation.y+=dt*27;tailRotor.rotation.z+=dt*19;heliLamp.intensity=2.2+Math.sin(extractionElapsed*8)*.35;if(t>=1){extractionActive=false;$('endTitle').textContent='MISSION COMPLETE';$('endText').textContent='Aarav boards the rescue helicopter. The island vanishes into the storm… but a shadow moves beneath the water.';sound(980,.55,'triangle',.07)}}
const rotatedOffset=cameraOffset.clone().applyAxisAngle(new THREE.Vector3(0,1,0),cameraYaw);
const desired=player.position.clone().add(rotatedOffset);camera.position.lerp(desired,1-Math.pow(.001,dt));camera.lookAt(player.position.x,1.28,player.position.z);
for(const f of fireflies){f.mesh.position.y=f.y+Math.sin(elapsed*2.1+f.phase)*.22;f.mesh.position.x=f.x+Math.cos(elapsed*.7+f.phase)*.28;}drawRadar();renderer.render(scene,camera)}
updateHud();animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.65))});
