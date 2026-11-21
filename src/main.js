import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import './style.css';

const mount=document.querySelector('#game');
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x8daeb0);
scene.fog=new THREE.FogExp2(0x8daeb0,.012);
const camera=new THREE.PerspectiveCamera(68,innerWidth/innerHeight,.1,260);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;mount.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xd5eaff,0x263524,2.25));
const sun=new THREE.DirectionalLight(0xffe5c2,3.4);sun.position.set(-25,45,20);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-55;sun.shadow.camera.right=55;sun.shadow.camera.top=55;sun.shadow.camera.bottom=-55;scene.add(sun);
const mat=(color,roughness=1)=>new THREE.MeshStandardMaterial({color,roughness});
const groundMat=mat(0x526b3d),sandMat=mat(0xc5ae79),rockMat=mat(0x59645d),barkMat=mat(0x493526),leafMat=mat(0x244d35),leaf2=mat(0x376c3d);
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
const gltfLoader=new GLTFLoader();
const modelCache=new Map();
function loadModel(path){if(modelCache.has(path))return modelCache.get(path);const p=new Promise((resolve,reject)=>gltfLoader.load(assetRoot+path,g=>resolve(g.scene),undefined,reject));modelCache.set(path,p);return p}
const treeAssets=['packs/nature-kit/tree-detailed.glb','packs/nature-kit/tree-oak.glb','packs/nature-kit/tree-palmdetailedtall.glb','packs/nature-kit/tree-default-dark.glb'];
const rockAssets=['packs/nature-kit/rock-largea.glb','packs/nature-kit/rock-largec.glb','packs/nature-kit/rock-larged.glb'];
async function addNatureModel(path,x,z,scale=4){try{const model=(await loadModel(path)).clone(true);model.position.set(x,0,z);model.scale.setScalar(scale);model.rotation.y=Math.random()*Math.PI*2;model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});scene.add(model)}catch(e){console.warn('Nature model unavailable',path,e)}}
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

// Ancient research outpost
const base=new THREE.Mesh(new THREE.BoxGeometry(10,3.2,7),mat(0x68736e));base.position.set(17,1.3,-17);base.castShadow=true;base.receiveShadow=true;scene.add(base);
const roof=new THREE.Mesh(new THREE.BoxGeometry(10.8,.45,7.8),mat(0x263d40));roof.position.set(17,3.1,-17);scene.add(roof);
for(let i=0;i<3;i++){const win=new THREE.Mesh(new THREE.BoxGeometry(.12,1.1,.9),new THREE.MeshStandardMaterial({color:0x75d5cb,emissive:0x164c4a,emissiveIntensity:1.2}));win.position.set(11.94,1.7,-18+i*1.8);scene.add(win)}
// Player character built from simple 3D meshes
const player=new THREE.Group();scene.add(player);player.position.set(0,0,17);
const body=new THREE.Mesh(new THREE.CapsuleGeometry(.48,.9,4,8),mat(0x314e59));body.position.y=1.05;body.castShadow=true;player.add(body);
const head=new THREE.Mesh(new THREE.SphereGeometry(.34,12,10),mat(0xc78e67));head.position.y=1.85;head.castShadow=true;player.add(head);
const pack=new THREE.Mesh(new THREE.BoxGeometry(.55,.7,.28),mat(0x9b7545));pack.position.set(0,1.12,.48);player.add(pack);
const playerPlaceholder=[body,head,pack];
loadModel('packs/mini-characters/character-male-c.glb').then(model=>{playerPlaceholder.forEach(o=>o.visible=false);const hero=model.clone(true);hero.scale.setScalar(1.8);hero.position.y=0;hero.rotation.y=Math.PI;hero.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});player.add(hero)}).catch(e=>console.warn('Hero model unavailable',e));
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
loadModel('packs/space-kit/alien.glb').then(model=>{monsterPlaceholder.forEach(o=>o.visible=false);const creature=model.clone(true);creature.scale.setScalar(3.2);creature.position.y=0;creature.rotation.y=Math.PI;creature.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});enemy.add(creature)}).catch(e=>console.warn('Creature model unavailable',e));
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
function updateHud(){$('health').textContent=health;const fullHealth=$('healthFill');if(fullHealth)fullHealth.style.width=health+'%';$('healthFillMini').style.width=health+'%';$('staminaFill').style.width=stamina+'%';$('crystals').textContent=found+'/3';$('objective').textContent=found<3?'Find '+(3-found)+' energy crystal'+(found===2?'':'s'):'Reach the extraction beacon';$('hint').textContent=found<3?'The jungle is not empty…':'The beacon is active. Reach the coast.';const side=$('sideMission');if(side)side.textContent=treasureFound?'SIDE MISSION COMPLETE: Treasure found · FLARES '+flareAmmo:'SIDE MISSION: Find the hidden jungle treasure';const bossHud=$('bossHud');if(bossHud){bossHud.classList.toggle('hidden',!bossAwakened||bossDefeated);$('bossHealthFill').style.width=bossHealth+'%';$('bossHealthText').textContent=Math.ceil(bossHealth)+'%'}}
$('start').onclick=()=>{started=true;startAmbience();sound(520,.18,'triangle');$('startscreen').classList.add('hidden');toast('AARAV: I need to find the others…')};
$('restart').onclick=()=>location.reload();
$('run').addEventListener('pointerdown',()=>running=true);$('run').addEventListener('pointerup',()=>running=false);$('run').addEventListener('pointercancel',()=>running=false);
function dodge(){if(!started||ended||elapsed<dodgeCooldown||stamina<22){toast(stamina<22?'Too tired to dodge!':'Dodge is recharging');return}const len=Math.hypot(keys.x,keys.y);dodgeDirection.set(keys.x,0,keys.y);if(len<.1)dodgeDirection.set(0,0,1);dodgeDirection.normalize().applyAxisAngle(new THREE.Vector3(0,1,0),cameraYaw);dodgeUntil=elapsed+.38;dodgeCooldown=elapsed+1.25;stamina=Math.max(0,stamina-22);sound(180,.1,'triangle',.035);toast('DODGE!');updateHud()}
$('dodge').addEventListener('pointerdown',dodge);
$('interact').onclick=()=>{const enemyDistance=player.position.distanceTo(enemy.position);if(treasureFound&&flareAmmo>0&&enemyDistance<10&&!bossDefeated){flareAmmo--;bossHealth=Math.max(0,bossHealth-35);sound(240,.18,'sawtooth',.08);setTimeout(()=>sound(720,.22,'triangle',.07),80);enemy.traverse(o=>{if(o.isMesh&&o.material&&o.material.emissive){o.material.emissive.setHex(0xff3b16);setTimeout(()=>o.material.emissive.setHex(0x000000),180)}});if(bossHealth===0){bossDefeated=true;scene.remove(enemy);toast('BOSS DEFEATED! The extraction route is safer now.')}else toast('FLARE HIT! Boss health: '+bossHealth+'%');updateHud();return}if(!treasureFound&&player.position.distanceTo(chest.position)<3.2){treasureFound=true;flareAmmo=3;scene.remove(chest);sound(980,.3,'triangle',.08);updateHud();toast('TREASURE FOUND! You got 3 emergency flares. Use them near the monster!');return}if(found===3&&player.position.distanceTo(beacon.position)<5&&(!bossAwakened||bossDefeated))finish(true);else if(!treasureFound&&player.position.distanceTo(chest.position)<7)toast('Move closer to the treasure chest and press USE');else if(found===3&&bossAwakened&&!bossDefeated)toast('Defeat the island guardian first! Find the cave treasure for flares.');else toast(found===3?'Get closer to the extraction beacon':'Find the glowing crystals first')};
function finish(win){ended=true;sound(win?740:85,.55,win?'triangle':'sawtooth',.08);$('endTitle').textContent=win?'MISSION COMPLETE':'YOU WERE HUNTED';$('endText').textContent=win?'EXTRACTION CONFIRMED. Aarav boards the rescue helicopter as the island disappears into the storm. But a shadow moves beneath the water…':'The island has claimed another explorer. Try a different route.';$('endScreen').classList.remove('hidden');if(win){$('endScreen').classList.add('victoryScreen');$('endTitle').classList.add('victoryTitle')}}
// Touch joystick and keyboard
const joy=$('joystick'),stick=$('stick');let joyId=null;function joyMove(e){const r=joy.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),len=Math.hypot(dx,dy),m=Math.min(38,len),a=Math.atan2(dy,dx);keys.x=Math.cos(a)*m/38;keys.y=Math.sin(a)*m/38;stick.style.transform='translate('+keys.x*28+'px,'+keys.y*28+'px)'}
joy.addEventListener('pointerdown',e=>{joyId=e.pointerId;joy.setPointerCapture(joyId);joyMove(e)});joy.addEventListener('pointermove',e=>{if(e.pointerId===joyId)joyMove(e)});function joyEnd(){joyId=null;keys.x=keys.y=0;stick.style.transform='translate(0,0)'}joy.addEventListener('pointerup',joyEnd);joy.addEventListener('pointercancel',joyEnd);
addEventListener('keydown',e=>{if(e.key==='w'||e.key==='ArrowUp')keys.y=-1;if(e.key==='s'||e.key==='ArrowDown')keys.y=1;if(e.key==='a'||e.key==='ArrowLeft')keys.x=-1;if(e.key==='d'||e.key==='ArrowRight')keys.x=1;if(e.key==='e'||e.key==='E')$('interact').click();if(e.shiftKey)running=true});addEventListener('keyup',e=>{if(['w','s','ArrowUp','ArrowDown'].includes(e.key))keys.y=0;if(['a','d','ArrowLeft','ArrowRight'].includes(e.key))keys.x=0;if(e.key==='Shift')running=false});
const radar=$('minimap')?.getContext('2d');
function drawRadar(){if(!radar)return;const w=radar.canvas.width,h=radar.canvas.height;radar.clearRect(0,0,w,h);radar.fillStyle='rgba(4,18,20,.78)';radar.beginPath();radar.arc(w/2,h/2,w/2-2,0,Math.PI*2);radar.fill();radar.strokeStyle='rgba(190,230,190,.5)';radar.lineWidth=1;radar.beginPath();radar.arc(w/2,h/2,w/2-4,0,Math.PI*2);radar.stroke();const dot=(x,z,color,r=3)=>{const px=w/2+(x-player.position.x)*.92,py=h/2+(z-player.position.z)*.92;if(Math.hypot(px-w/2,py-h/2)<w/2-7){radar.fillStyle=color;radar.beginPath();radar.arc(px,py,r,0,Math.PI*2);radar.fill()}};dot(0,0,'#d9ff9b',4);dot(enemy.position.x,enemy.position.z,'#ff655c',4);dot(beacon.position.x,beacon.position.z,'#69f5d0',4);for(const c of crystals)if(!c.got)dot(c.group.position.x,c.group.position.z,'#66eaff',3);for(const kit of medkits)if(!kit.used)dot(kit.group.position.x,kit.group.position.z,'#6cff9b',3)}
const clock=new THREE.Clock();const cameraOffset=new THREE.Vector3(0,7.5,13);let elapsed=0;
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);elapsed+=dt;const night=(Math.sin(elapsed*.018)+1)*.5;sun.intensity=2.0+night*1.5;scene.fog.color.setHex(night>.72?0x263747:0x8daeb0);scene.background.copy(scene.fog.color);$('staminaFill').style.width=stamina+'%';if(started&&!ended){const len=Math.hypot(keys.x,keys.y);if(len>.05){const sprinting=running&&stamina>1;const speed=sprinting?10:6;if(sprinting)stamina=Math.max(0,stamina-25*dt);else stamina=Math.min(100,stamina+14*dt);if(elapsed-lastFootstep>(sprinting?.28:.48)){sound(sprinting?115:82,.055,'triangle',.018);lastFootstep=elapsed;}
const move=new THREE.Vector3(keys.x/Math.max(1,len),0,keys.y/Math.max(1,len)).applyAxisAngle(new THREE.Vector3(0,1,0),cameraYaw);
const dx=move.x,dz=move.z;player.position.x=THREE.MathUtils.clamp(player.position.x+dx*speed*dt,-43,43);player.position.z=THREE.MathUtils.clamp(player.position.z+dz*speed*dt,-43,43);player.rotation.y=Math.atan2(dx,dz);body.position.y=1.05+Math.sin(elapsed*12)*(running?.08:.035)}
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
enemy.rotation.z=dist<alertRange?Math.sin(elapsed*8)*.035:0;if(!bossDefeated&&dist<2.0&&elapsed-lastHit>1.1&&elapsed>=dodgeUntil){health=Math.max(0,health-(bossAwakened?18:12));$('hud').classList.remove('damageFlash');void $('hud').offsetWidth;$('hud').classList.add('damageFlash');lastHit=elapsed;sound(95,.3,'sawtooth',.09);updateHud();toast('The creature hit you!');if(health<=35&&!lowHealthWarned){toast('LOW HEALTH! Find a green medkit!');lowHealthWarned=true}if(health>35)lowHealthWarned=false;if(!health)finish(false)}
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
const rotatedOffset=cameraOffset.clone().applyAxisAngle(new THREE.Vector3(0,1,0),cameraYaw);
const desired=player.position.clone().add(rotatedOffset);camera.position.lerp(desired,1-Math.pow(.001,dt));camera.lookAt(player.position.x,1.1,player.position.z);
for(const f of fireflies){f.mesh.position.y=f.y+Math.sin(elapsed*2.1+f.phase)*.22;f.mesh.position.x=f.x+Math.cos(elapsed*.7+f.phase)*.28;}drawRadar();renderer.render(scene,camera)}
updateHud();animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.65))});
