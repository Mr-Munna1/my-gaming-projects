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
// Creature stalks the player
const enemy=new THREE.Group();scene.add(enemy);enemy.position.set(-14,0,-15);
const monsterMat=mat(0x27332b),eyeMat=new THREE.MeshStandardMaterial({color:0xff5b36,emissive:0xff2200,emissiveIntensity:2});
const torso=new THREE.Mesh(new CapsuleGeometryFallback(.62,1.0),monsterMat);torso.position.y=1.15;enemy.add(torso);
for(const x of [-.23,.23]){const eye=new THREE.Mesh(new THREE.SphereGeometry(.095,8,8),eyeMat);eye.position.set(x,1.75,-.43);enemy.add(eye)}
for(let i=0;i<4;i++){const claw=new THREE.Mesh(new THREE.ConeGeometry(.12,.65,6),monsterMat);claw.position.set(i%2?-.45:.45,.65,i<2?-.35:.35);claw.rotation.z=Math.PI;enemy.add(claw)}
function CapsuleGeometryFallback(r,l){return new THREE.CapsuleGeometry(r,l,4,8)}
const monsterPlaceholder=[torso,...enemy.children.filter(o=>o!==torso)];
loadModel('packs/space-kit/alien.glb').then(model=>{monsterPlaceholder.forEach(o=>o.visible=false);const creature=model.clone(true);creature.scale.setScalar(3.2);creature.position.y=0;creature.rotation.y=Math.PI;creature.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});enemy.add(creature)}).catch(e=>console.warn('Creature model unavailable',e));
// Extraction beacon
const beacon=new THREE.Group();beacon.position.set(0,0,-34);scene.add(beacon);const pillar=new THREE.Mesh(new THREE.CylinderGeometry(.35,.5,3,8),mat(0x566c67));pillar.position.y=1.5;beacon.add(pillar);const beam=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,8,12),new THREE.MeshBasicMaterial({color:0x8affc7,transparent:true,opacity:.38}));beam.position.y=5;beacon.add(beam);const beaconLight=new THREE.PointLight(0x5dffb1,0,20);beaconLight.position.y=3;beacon.add(beaconLight);
let health=100,found=0,started=false,ended=false,lastHit=0,stamina=100;
const keys={x:0,y:0};let running=false,cameraYaw=0,cameraDrag=null;
renderer.domElement.addEventListener('pointerdown',e=>{cameraDrag={id:e.pointerId,x:e.clientX};renderer.domElement.setPointerCapture(e.pointerId)});
renderer.domElement.addEventListener('pointermove',e=>{if(cameraDrag&&cameraDrag.id===e.pointerId){cameraYaw-=(e.clientX-cameraDrag.x)*.006;cameraDrag.x=e.clientX}});
renderer.domElement.addEventListener('pointerup',e=>{if(cameraDrag?.id===e.pointerId)cameraDrag=null});
renderer.domElement.addEventListener('pointercancel',()=>cameraDrag=null);
const $=id=>document.getElementById(id);
let audioCtx=null,ambientOsc=null;
function sound(freq=440,duration=.12,type='sine',volume=.045){try{audioCtx??=new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.setValueAtTime(freq,audioCtx.currentTime);g.gain.setValueAtTime(volume,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+duration);o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+duration)}catch(e){}}
function startAmbience(){try{audioCtx??=new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();if(ambientOsc)return;ambientOsc=audioCtx.createOscillator();const gain=audioCtx.createGain();ambientOsc.type='sine';ambientOsc.frequency.value=58;gain.gain.value=.012;ambientOsc.connect(gain);gain.connect(audioCtx.destination);ambientOsc.start()}catch(e){}}
const toast=(s)=>{$('toast').textContent=s;$('toast').classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>$('toast').classList.remove('show'),2200)};
function updateHud(){$('health').textContent=health;const fullHealth=$('healthFill');if(fullHealth)fullHealth.style.width=health+'%';$('healthFillMini').style.width=health+'%';$('staminaFill').style.width=stamina+'%';$('crystals').textContent=found+'/3';$('objective').textContent=found<3?'Find '+(3-found)+' energy crystal'+(found===2?'':'s'):'Reach the extraction beacon';$('hint').textContent=found<3?'The jungle is not empty…':'The beacon is active. Reach the coast.'}
$('start').onclick=()=>{started=true;startAmbience();sound(520,.18,'triangle');$('startscreen').classList.add('hidden');toast('AARAV: I need to find the others…')};
$('restart').onclick=()=>location.reload();
$('run').addEventListener('pointerdown',()=>running=true);$('run').addEventListener('pointerup',()=>running=false);$('run').addEventListener('pointercancel',()=>running=false);
$('interact').onclick=()=>{if(found===3&&player.position.distanceTo(beacon.position)<5)finish(true);else toast(found===3?'Get closer to the extraction beacon':'Find the glowing crystals first')};
function finish(win){ended=true;sound(win?740:85,.55,win?'triangle':'sawtooth',.08);$('endTitle').textContent=win?'MISSION COMPLETE':'YOU WERE HUNTED';$('endText').textContent=win?'Aarav escaped… but something followed him off the island.':'The island has claimed another explorer. Try a different route.';$('endScreen').classList.remove('hidden')}
// Touch joystick and keyboard
const joy=$('joystick'),stick=$('stick');let joyId=null;function joyMove(e){const r=joy.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),len=Math.hypot(dx,dy),m=Math.min(38,len),a=Math.atan2(dy,dx);keys.x=Math.cos(a)*m/38;keys.y=Math.sin(a)*m/38;stick.style.transform='translate('+keys.x*28+'px,'+keys.y*28+'px)'}
joy.addEventListener('pointerdown',e=>{joyId=e.pointerId;joy.setPointerCapture(joyId);joyMove(e)});joy.addEventListener('pointermove',e=>{if(e.pointerId===joyId)joyMove(e)});function joyEnd(){joyId=null;keys.x=keys.y=0;stick.style.transform='translate(0,0)'}joy.addEventListener('pointerup',joyEnd);joy.addEventListener('pointercancel',joyEnd);
addEventListener('keydown',e=>{if(e.key==='w'||e.key==='ArrowUp')keys.y=-1;if(e.key==='s'||e.key==='ArrowDown')keys.y=1;if(e.key==='a'||e.key==='ArrowLeft')keys.x=-1;if(e.key==='d'||e.key==='ArrowRight')keys.x=1;if(e.shiftKey)running=true});addEventListener('keyup',e=>{if(['w','s','ArrowUp','ArrowDown'].includes(e.key))keys.y=0;if(['a','d','ArrowLeft','ArrowRight'].includes(e.key))keys.x=0;if(e.key==='Shift')running=false});
const radar=$('minimap')?.getContext('2d');
function drawRadar(){if(!radar)return;const w=radar.canvas.width,h=radar.canvas.height;radar.clearRect(0,0,w,h);radar.fillStyle='rgba(4,18,20,.78)';radar.beginPath();radar.arc(w/2,h/2,w/2-2,0,Math.PI*2);radar.fill();radar.strokeStyle='rgba(190,230,190,.5)';radar.lineWidth=1;radar.beginPath();radar.arc(w/2,h/2,w/2-4,0,Math.PI*2);radar.stroke();const dot=(x,z,color,r=3)=>{const px=w/2+x*.92,py=h/2+z*.92;if(Math.hypot(px-w/2,py-h/2)<w/2-7){radar.fillStyle=color;radar.beginPath();radar.arc(px,py,r,0,Math.PI*2);radar.fill()}};dot(player.position.x,player.position.z,'#d9ff9b',4);dot(enemy.position.x,enemy.position.z,'#ff655c',4);dot(beacon.position.x,beacon.position.z,'#69f5d0',4);for(const c of crystals)if(!c.got)dot(c.group.position.x,c.group.position.z,'#66eaff',3)}
const clock=new THREE.Clock();const cameraOffset=new THREE.Vector3(0,7.5,13);let elapsed=0;
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);elapsed+=dt;$('staminaFill').style.width=stamina+'%';if(started&&!ended){const len=Math.hypot(keys.x,keys.y);if(len>.05){const sprinting=running&&stamina>1;const speed=sprinting?10:6;if(sprinting)stamina=Math.max(0,stamina-25*dt);else stamina=Math.min(100,stamina+14*dt);
const move=new THREE.Vector3(keys.x/Math.max(1,len),0,keys.y/Math.max(1,len)).applyAxisAngle(new THREE.Vector3(0,1,0),cameraYaw);
const dx=move.x,dz=move.z;player.position.x=THREE.MathUtils.clamp(player.position.x+dx*speed*dt,-43,43);player.position.z=THREE.MathUtils.clamp(player.position.z+dz*speed*dt,-43,43);player.rotation.y=Math.atan2(dx,dz);body.position.y=1.05+Math.sin(elapsed*12)*(running?.08:.035)}
for(const c of crystals){c.group.rotation.y+=dt*1.2;c.group.position.y=Math.sin(elapsed*2+c.group.position.x)*.12;if(!c.got&&player.position.distanceTo(c.group.position)<2.2){c.got=true;found++;scene.remove(c.group);sound(880,.22,'sine',.07);setTimeout(()=>sound(1180,.28,'sine',.05),90);updateHud();toast('Energy crystal secured!')}}
const toPlayer=new THREE.Vector3().subVectors(player.position,enemy.position);const dist=toPlayer.length();if(dist<22){toPlayer.normalize();enemy.position.addScaledVector(toPlayer,dt*(dist<3?1.4:2.5));enemy.lookAt(player.position.x,0,player.position.z)}if(dist<2.0&&elapsed-lastHit>1.1){health=Math.max(0,health-12);lastHit=elapsed;sound(95,.3,'sawtooth',.09);updateHud();toast('The creature hit you!');if(!health)finish(false)}
beaconLight.intensity=found===3?3:0;if(found===3&&player.position.distanceTo(beacon.position)<4){beaconLight.intensity=5;toast('Extraction beacon: press USE')}
}
const rotatedOffset=cameraOffset.clone().applyAxisAngle(new THREE.Vector3(0,1,0),cameraYaw);
const desired=player.position.clone().add(rotatedOffset);camera.position.lerp(desired,1-Math.pow(.001,dt));camera.lookAt(player.position.x,1.1,player.position.z);
drawRadar();renderer.render(scene,camera)}
updateHud();animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.65))});
