import * as THREE from 'three';
import './style.css';

const mount=document.querySelector('#game');
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x171d20);
scene.fog=new THREE.Fog(0x171d20,24,78);
const camera=new THREE.PerspectiveCamera(68,innerWidth/innerHeight,.1,180);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.05;
mount.appendChild(renderer.domElement);

const hemi=new THREE.HemisphereLight(0xb8c9d2,0x242321,1.45);scene.add(hemi);
const moon=new THREE.DirectionalLight(0xb8c9d9,1.25);moon.position.set(-18,28,14);moon.castShadow=true;moon.shadow.mapSize.set(1536,1536);moon.shadow.camera.left=-34;moon.shadow.camera.right=34;moon.shadow.camera.top=34;moon.shadow.camera.bottom=-34;scene.add(moon);
const warm=new THREE.PointLight(0xffc98c,22,35);warm.position.set(0,3,8);scene.add(warm);
const mats={
 wall:new THREE.MeshStandardMaterial({color:0x77736a,roughness:.96}),
 wallDark:new THREE.MeshStandardMaterial({color:0x454744,roughness:1}),
 floor:new THREE.MeshStandardMaterial({color:0x68665d,roughness:.88}),
 tile:new THREE.MeshStandardMaterial({color:0x99958a,roughness:.8}),
 ceiling:new THREE.MeshStandardMaterial({color:0x5b5b55,roughness:1}),
 trim:new THREE.MeshStandardMaterial({color:0x393b39,roughness:.85}),
 metal:new THREE.MeshStandardMaterial({color:0x525c60,metalness:.55,roughness:.5}),
 wood:new THREE.MeshStandardMaterial({color:0x493a2d,roughness:.85}),
 glass:new THREE.MeshStandardMaterial({color:0x8ba4a8,metalness:.2,roughness:.25,transparent:true,opacity:.38}),
 fabric:new THREE.MeshStandardMaterial({color:0x9b9b91,roughness:1}),
 rust:new THREE.MeshStandardMaterial({color:0x654d3c,roughness:1}),
 light:new THREE.MeshStandardMaterial({color:0xe0d7bd,emissive:0x6e6045,emissiveIntensity:.55})
};
const floors=[
 {id:-1,name:'BASEMENT',rooms:['GENERATOR ROOM','MORGUE','PROJECT ECHO LAB','ARCHIVE VAULT']},
 {id:0,name:'GROUND FLOOR',rooms:['MAIN RECEPTION','WAITING LOUNGE','SECURITY ROOM','MEDICAL RECORDS']},
 {id:1,name:'FIRST FLOOR',rooms:['PATIENT WARD A','PATIENT WARD B','ICU','NURSES STATION']},
 {id:2,name:'SECOND FLOOR',rooms:['OPERATION THEATRE','DOCTOR OFFICES','RECOVERY ROOM','MEDICAL STORAGE']},
 {id:3,name:'THIRD FLOOR',rooms:['RESTRICTED WARD','ISOLATION CELLS','OBSERVATION ROOM','STAFF LOCKERS']},
 {id:4,name:'ROOFTOP',rooms:['WATER TANK','MAINTENANCE SHED','ROOFTOP ACCESS','HELIPAD']}
];
let currentFloor=0;
const floorGroups=new Map();
const colliders=[];
const interactables=[];
const roomLabels=[];
const boxGeo=new THREE.BoxGeometry(1,1,1);
function box(parent,name,x,y,z,w,h,d,material,solid=true){
 const mesh=new THREE.Mesh(boxGeo,material);mesh.name=name;mesh.position.set(x,y+h/2,z);mesh.scale.set(w,h,d);mesh.castShadow=h>.25;mesh.receiveShadow=true;parent.add(mesh);
 if(solid)colliders.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,minY:y,maxY:y+h,mesh});
 return mesh;
}
function addLabel(parent,text,x,y,z){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const c=canvas.getContext('2d');
 c.fillStyle='#171c1c';c.fillRect(0,0,512,128);c.strokeStyle='#bba17b';c.lineWidth=5;c.strokeRect(5,5,502,118);
 c.fillStyle='#eee6d8';c.font='bold 34px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(text,256,64);
 const tex=new THREE.CanvasTexture(canvas);const m=new THREE.Mesh(new THREE.PlaneGeometry(3.5,.88),new THREE.MeshBasicMaterial({map:tex,transparent:true,side:THREE.DoubleSide}));
 m.position.set(x,y,z);parent.add(m);return m;
}
function addCeilingLight(parent,x,z,y=3.48,color=0xffe2ad){
 const fixture=box(parent,'ceiling light',x,y,z,.85,.09,.22,mats.trim,false);
 const panel=box(parent,'light diffuser',x,y-.05,z,.72,.035,.17,mats.light,false);
 const light=new THREE.PointLight(color,5.5,10,2);light.position.set(x,y-.18,z);parent.add(light);
 return light;
}
function furnitureBed(parent,x,z){
 box(parent,'bed frame',x,.12,z,1.65,.18,2.25,mats.metal);
 box(parent,'mattress',x,.31,z,1.55,.22,2.12,mats.fabric,false);
 box(parent,'pillow',x,.46,z-.78,.9,.15,.38,mats.light,false);
 for(const dx of [-.68,.68])for(const dz of [-.92,.92])box(parent,'bed leg',x+dx,0,z+dz,.09,.3,.09,mats.trim);
 box(parent,'bed headboard',x,.48,z-1.05,1.7,.7,.12,mats.wood,false);
}
function furnitureDesk(parent,x,z){
 box(parent,'desk',x,.78,z,1.9,.12,.85,mats.wood);
 for(const dx of [-.82,.82])box(parent,'desk leg',x+dx,.37,z,.1,.74,.1,mats.trim);
 box(parent,'monitor',x,.98,z-.22,.72,.42,.08,mats.metal,false);
 box(parent,'monitor screen',x,1.0,z-.265,.61,.29,.018,mats.glass,false);
 box(parent,'keyboard',x,.87,z+.16,.65,.035,.22,mats.metal,false);
}
function furnitureCabinet(parent,x,z){
 box(parent,'cabinet',x,0,z,.8,1.9,.55,mats.wallDark);
 for(let y=.45;y<1.8;y+=.43)box(parent,'cabinet shelf',x,y,z-.29,.72,.035,.04,mats.metal,false);
}
function chair(parent,x,z){
 const g=new THREE.Group();g.position.set(x,0,z);parent.add(g);
 box(g,'chair seat',0,.48,0,.55,.12,.55,mats.fabric,false);
 box(g,'chair back',0,.83,-.23,.55,.62,.1,mats.fabric,false);
 for(const dx of [-.2,.2])for(const dz of [-.2,.2])box(g,'chair leg',dx,.22,dz,.055,.45,.055,mats.metal,false);
}
function addDoor(parent,x,z,orientation=0,label='DOOR'){
 const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=orientation;parent.add(g);
 box(g,'door frame left',-.57,0,0,.12,2.55,.18,mats.trim,false);box(g,'door frame right',.57,0,0,.12,2.55,.18,mats.trim,false);box(g,'door lintel',0,2.48,0,1.25,.14,.18,mats.trim,false);
 const leaf=box(g,label,0,0,.025,1.08,2.38,.1,mats.wood,false);
 const handle=box(g,'handle',.38,1.08,.1,.06,.16,.06,mats.metal,false);
 const obj={group:g,leaf,handle,open:false,label,position:new THREE.Vector3(x,0,z)};
 interactables.push({type:'door',obj,position:obj.position,label});
 return obj;
}
function addRoom(parent,name,cx,cz,opts={}){
 const w=opts.w||8.2,d=opts.d||7.2,h=3.65;
 box(parent,'room floor',cx,.01,cz,w,.16,d,mats.floor,false);
 // Three walls; the corridor-facing side has a centered doorway.
 box(parent,'back wall',cx,.1,cz-d/2,w,h,.25,mats.wall);
 box(parent,'left wall',cx-w/2,.1,cz,.25,h,d,mats.wall);
 box(parent,'right wall',cx+w/2,.1,cz,.25,h,d,mats.wall);
 const frontZ=cz+d/2;
 box(parent,'front wall left',cx-w*.34,.1,frontZ,w*.32,h,.25,mats.wall);
 box(parent,'front wall right',cx+w*.34,.1,frontZ,w*.32,h,.25,mats.wall);
 box(parent,'front wall top',cx,.1+2.55,frontZ,w*.36,.9,.25,mats.wall);
 addDoor(parent,cx,frontZ,Math.PI,name);
 addLabel(parent,name,cx,2.85,frontZ-.17);
 const light=addCeilingLight(parent,cx,cz);
 roomLabels.push({name,position:new THREE.Vector3(cx,0,cz),floor:currentFloor});
 if(name.includes('WARD')||name.includes('ICU')||name.includes('RECOVERY')){furnitureBed(parent,cx-1.6,cz-.6);furnitureBed(parent,cx+1.6,cz+.8);chair(parent,cx+2.7,cz-1.8)}
 else if(name.includes('OFFICE')||name.includes('RECORD')||name.includes('SECURITY')||name.includes('STATION')||name.includes('ARCHIVE')){furnitureDesk(parent,cx,cz-1);furnitureCabinet(parent,cx-2.8,cz+1.1);chair(parent,cx,cz+.2)}
 else if(name.includes('OPERATION')){box(parent,'operating table',cx,.95,cz,1.7,.25,2.5,mats.metal);addCeilingLight(parent,cx,cz,3.35,0xe8e5d7);for(let i=0;i<3;i++)box(parent,'medical trolley',cx-2.6+i*2.6,.5,cz+1.9,.65,1,.55,mats.metal)}
 else if(name.includes('MORGUE')){for(let i=0;i<4;i++){box(parent,'morgue drawer',cx-2.4+(i%2)*4,.9,cz-1.4+Math.floor(i/2)*2.5,1.5,.65,2,mats.metal)}}
 else if(name.includes('LAB')){for(let i=0;i<3;i++){box(parent,'lab bench',cx-2.5+i*2.5,.88,cz,1.35,.15,2.7,mats.metal);box(parent,'glass pod',cx-2.5+i*2.5,1.65,cz,.9,1.35,.9,mats.glass,false)}}
 else {furnitureCabinet(parent,cx-2.8,cz);chair(parent,cx+2,cz+1)}
 return light;
}
function makeFloor(id){
 const group=new THREE.Group();group.name=floors.find(f=>f.id===id).name;scene.add(group);floorGroups.set(id,group);
 const y=id*4.2;
 const shell=new THREE.Group();shell.position.y=y;group.add(shell);
 const isRoof=id===4,isBasement=id===-1;
 const floorMat=isRoof?mats.trim:(isBasement?mats.wallDark:mats.floor);
 box(shell,'floor slab',0,-.22,0,40,.42,28,floorMat,false);
 // Perimeter walls and corridor partitions
 box(shell,'north outer wall',0,0,-13.7,40,4,.6,mats.wallDark);
 box(shell,'west outer wall',-19.7,0,0,.6,4,28,mats.wallDark);
 box(shell,'east outer wall',19.7,0,0,.6,4,28,mats.wallDark);
 // South wall has a broad entry opening.
 box(shell,'south wall left',-12,0,13.7,15.4,4,.6,mats.wallDark);
 box(shell,'south wall right',12,0,13.7,15.4,4,.6,mats.wallDark);
 box(shell,'south wall lintel',0,3.35,13.7,8.6,1.3,.6,mats.wallDark);
 // central corridor strip and room blocks on either side
 box(shell,'corridor floor',0,.015,0,38,.12,5.5,mats.tile,false);
 box(shell,'corridor ceiling',0,3.68,0,38,.12,5.5,mats.ceiling,false);
 box(shell,'corridor north wall left',-14,0,-2.95,10,3.7,.25,mats.wall);
 box(shell,'corridor north wall right',14,0,-2.95,10,3.7,.25,mats.wall);
 box(shell,'corridor south wall left',-14,0,2.95,10,3.7,.25,mats.wall);
 box(shell,'corridor south wall right',14,0,2.95,10,3.7,.25,mats.wall);
 const roomNames=floors.find(f=>f.id===id).rooms;
 addRoom(shell,roomNames[0],-10,-8.1);addRoom(shell,roomNames[1],10,-8.1);
 addRoom(shell,roomNames[2],-10,8.1);addRoom(shell,roomNames[3],10,8.1);
 // Reception furniture and distinctive floor landmarks.
 if(id===0){
  box(shell,'reception counter',0,.95,8.4,5.8,1.1,1.2,mats.wood);
  box(shell,'reception front panel',0,.7,9.02,5.5,.8,.12,mats.trim,false);
  furnitureDesk(shell,-7,8.4);chair(shell,-7,10);
  for(let i=0;i<4;i++)chair(shell,6+(i%2)*2,7+Math.floor(i/2)*2);
  addLabel(shell,'BLACKWOOD HOSPITAL',0,3.05,13.15);
 }else if(id===1){
  box(shell,'nurse station counter',0,.9,0,4.5,1,1.1,mats.wood);
  for(let x of [-3,3]){box(shell,'ward privacy screen',x,1.3,8,1.5,2.3,.12,mats.glass,false)}
 }else if(id===2){
  box(shell,'scrub station',0,.8,0,3,.9,.8,mats.metal);
  addCeilingLight(shell,0,0,3.4,0xe4e6df);
 }else if(id===3){
  for(let x of [-12,-4,4,12])box(shell,'isolation cell gate',x,.1,0,1.5,2.8,.12,mats.metal);
 }else if(id===-1){
  box(shell,'generator',0,.9,0,3,1.8,2.5,mats.metal);
  for(let x of [-3.5,3.5])box(shell,'pipe',x,2.7,-5,.22,.22,12,mats.rust);
 }else if(id===4){
  box(shell,'water tank',-10,0,-7,4,3.8,4,mats.metal);
  box(shell,'helipad',5,.02,3,12,.08,12,mats.trim,false);
  const pad=new THREE.Mesh(new THREE.RingGeometry(4.4,5,.05,48),new THREE.MeshBasicMaterial({color:0xc6a77b}));pad.rotation.x=-Math.PI/2;pad.position.set(5,.08,3);shell.add(pad);
 }
 // Elevator lobby and interactive elevator panel at west end of corridor.
 box(shell,'elevator frame left',-17,.1,0,.22,3.1,.35,mats.metal,false);
 box(shell,'elevator frame right',-14.2,.1,0,.22,3.1,.35,mats.metal,false);
 box(shell,'elevator top',-15.6,3,0,3,.2,.35,mats.metal,false);
 const elevatorDoor=box(shell,'elevator doors',-15.6,.1,.1,2.65,2.8,.12,mats.metal,false);
 const panel=box(shell,'elevator call panel',-13.7,1.15,.45,.18,.65,.12,mats.metal,false);
 const glow=new THREE.PointLight(0xc6a77b,1.6,4);glow.position.set(-13.7,1.6,.5);shell.add(glow);
 const liftPos=new THREE.Vector3(-13.7,y,1.1);
 interactables.push({type:'elevator',position:liftPos,label:'ELEVATOR',floor:id});
 // Stairwell access at east end, activated with E.
 const stair=new THREE.Group();stair.position.set(16.5,0,0);shell.add(stair);
 for(let i=0;i<9;i++)box(stair,'stair step',0,i*.36-0.1,(i-4)*.42,2.3,.35,.48,mats.tile,false);
 const stairSign=addLabel(shell,'STAIRS',16.5,2.7,2.3);
 interactables.push({type:'stairs',position:new THREE.Vector3(16.5,y,3.1),label:'STAIRS',floor:id});
 // Decorative wall lights, windows and grime panels.
 for(let x=-16;x<=16;x+=4){addCeilingLight(shell,x,0,3.48,id===-1?0xffb56c:0xffdfb2)}
 for(let side of [-1,1])for(let x of [-15,-5,5,15]){
  const win=box(shell,'frosted window',x,1.8,side*13.36,2.1,1.55,.045,mats.glass,false);
  box(shell,'window sill',x,.98,side*13.3,2.25,.09,.16,mats.trim,false);
 }
 if(isRoof){box(shell,'roof access hut',0,0,-10,5,3.4,4,mats.wallDark);box(shell,'roof access door',0,0,-7.9,1.2,2.4,.1,mats.wood,false)}
 if(isBasement){for(let i=0;i<5;i++)box(shell,'support column',-16+i*8,0,0,.55,3.7,.55,mats.wallDark)}
 // Add floor labels as 3D signage.
 addLabel(shell,floors.find(f=>f.id===id).name,0,3.05,-2.7);
 group.visible=id===currentFloor;
 return group;
}
for(const f of floors)makeFloor(f.id);

// Exterior silhouette: weathered hospital block, front steps, sign, and grounds.
const exterior=new THREE.Group();scene.add(exterior);
box(exterior,'hospital exterior body',0,8.4,-18,42,17,2.2,mats.wallDark,false);
for(let level=0;level<4;level++)for(let x=-17;x<=17;x+=5){
 const win=box(exterior,'facade window',x,2.4+level*4.15,-16.82,2.1,2.35,.08,mats.glass,false);
 box(exterior,'facade window frame',x,2.4+level*4.15,-16.9,2.25,2.5,.08,mats.trim,false);
}
box(exterior,'hospital sign board',0,15.8,-16.7,12,1.35,.22,mats.trim,false);
addLabel(exterior,'BLACKWOOD PSYCHIATRIC HOSPITAL',0,15.85,-16.54);
box(exterior,'front steps',0,-.05,15.5,10,.3,2.4,mats.trim,false);
for(let x=-13;x<=13;x+=2.6){const post=box(exterior,'fence post',x,.9,19,.12,1.8,.12,mats.rust,false);box(exterior,'fence rail',x,1.45,19,.12,.12,2.5,mats.rust,false)}
const ground=new THREE.Mesh(new THREE.PlaneGeometry(180,180),new THREE.MeshStandardMaterial({color:0x222a27,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.48;ground.receiveShadow=true;scene.add(ground);
for(let i=0;i<24;i++){
 const x=(Math.random()-.5)*70,z=-30+Math.random()*65;
 const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.18,.3,3.8,7),new THREE.MeshStandardMaterial({color:0x302a24}));trunk.position.set(x,1.4,z);trunk.castShadow=true;scene.add(trunk);
 const crown=new THREE.Mesh(new THREE.ConeGeometry(2.1,5.5,7),new THREE.MeshStandardMaterial({color:0x26362f,roughness:1}));crown.position.set(x,5,z);crown.castShadow=true;scene.add(crown);
}

// Ranit: original procedural patient character, kept visible in third-person.
const ranit=new THREE.Group();ranit.name='Ranit';
const skin=new THREE.MeshStandardMaterial({color:0xb98263,roughness:.88});
const gown=new THREE.MeshStandardMaterial({color:0x9aa7a3,roughness:1});
const dark=new THREE.MeshStandardMaterial({color:0x202a2c,roughness:1});
const hair=new THREE.MeshStandardMaterial({color:0x24201e,roughness:.95});
function bodyPart(parent,geo,material,x,y,z,sx=1,sy=1,sz=1){const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;parent.add(m);return m}
bodyPart(ranit,new THREE.CapsuleGeometry(.32,.72,5,10),gown,0,1.18,0,.92,1,.62);
bodyPart(ranit,new THREE.SphereGeometry(.235,16,12),skin,0,1.93,0,1,1.12,.95);
bodyPart(ranit,new THREE.SphereGeometry(.24,12,10),hair,0,2.08,-.035,1.02,.62,1);
bodyPart(ranit,new THREE.BoxGeometry(.1,.22,.12),skin,-.25,1.85,.015);
bodyPart(ranit,new THREE.BoxGeometry(.1,.22,.12),skin,.25,1.85,.015);
for(const x of [-.15,.15])bodyPart(ranit,new THREE.SphereGeometry(.035,8,8),dark,x,1.95,.208);
bodyPart(ranit,new THREE.BoxGeometry(.12,.045,.025),dark,0,1.82,.225);
for(const x of [-.19,.19]){
 const leg=bodyPart(ranit,new THREE.CapsuleGeometry(.105,.56,4,8),dark,x,.47,0,.9,1,1);
 const foot=bodyPart(ranit,new THREE.BoxGeometry(.2,.12,.34),mats.fabric,x,.12,.09);
 const arm=bodyPart(ranit,new THREE.CapsuleGeometry(.085,.58,4,8),gown,x*.0+x,1.22,0,.9,1,1);arm.rotation.z=x<0?-.13:.13;
}
const wristBand=bodyPart(ranit,new THREE.TorusGeometry(.095,.025,6,12),mats.light,.22,1.56,.02);wristBand.rotation.x=Math.PI/2;
ranit.position.set(0,0,9.8);scene.add(ranit);

const player={pos:new THREE.Vector3(0,0,9.8),yaw:Math.PI,pitch:-.06,velocity:new THREE.Vector3(),speed:3.6,run:false};
let cameraMode='TPP',started=false,paused=false,dragging=false,lastX=0,lastY=0,moveX=0,moveY=0,interactTarget=null;
const keys={};
const toast=document.querySelector('#toast');
let toastTimer;
function showToast(msg){toast.textContent=msg;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2100)}
function setFloor(id){
 if(!floors.some(f=>f.id===id))return;
 currentFloor=id;
 for(const [key,g] of floorGroups)g.visible=key===id;
 player.pos.set(0,0,9.8);ranit.position.copy(player.pos);
 document.querySelector('#floorLabel').textContent=floors.find(f=>f.id===id).name;
 document.querySelector('#areaName').textContent=floors.find(f=>f.id===id).rooms[0];
 document.querySelector('#areaHint').textContent='Explore '+floors.find(f=>f.id===id).name.toLowerCase()+'. No enemies in this build.';
 document.querySelector('#floorPicker').classList.add('hidden');
 showToast('Arrived at '+floors.find(f=>f.id===id).name);
}
function openElevator(){
 const wrap=document.querySelector('#floorButtons');wrap.innerHTML='';
 for(const f of floors){const b=document.createElement('button');b.textContent=f.name;b.addEventListener('click',()=>setFloor(f.id));wrap.appendChild(b)}
 document.querySelector('#floorPicker').classList.remove('hidden');
}
function toggleDoor(obj){
 obj.open=!obj.open;
 obj.leaf.rotation.y=obj.open?-Math.PI/2:0;
 showToast(obj.open?'Door opened':'Door closed');
}
function nearestInteractable(){
 let best=null,bestD=2.6;
 for(const it of interactables){
  if(it.floor!==undefined&&it.floor!==currentFloor)continue;
  const d=Math.hypot(player.pos.x-it.position.x,player.pos.z-it.position.z);
  if(d<bestD){best=it;bestD=d}
 }
 return best;
}
function interact(){
 const target=nearestInteractable();
 if(!target){showToast('Nothing to interact with nearby');return}
 if(target.type==='elevator')openElevator();
 else if(target.type==='stairs'){const next=currentFloor+(player.pos.x>0?1:-1);if(next>=-1&&next<=4)setFloor(next);else showToast('No more stairs in this direction')}
 else if(target.type==='door')toggleDoor(target.obj);
}
function updateInteraction(){
 interactTarget=nearestInteractable();
 const hint=document.querySelector('#interactHint');
 hint.style.display=interactTarget?'block':'none';
 if(interactTarget)hint.textContent='E  '+(interactTarget.type==='elevator'?'USE ELEVATOR':interactTarget.type==='stairs'?'USE STAIRS':'OPEN / CLOSE '+interactTarget.label);
}
function collides(x,z){
 const r=.34,y=player.pos.y;
 for(const c of colliders){
  if(y+1.8<c.minY||y>c.maxY)continue;
  if(x+r>c.minX&&x-r<c.maxX&&z+r>c.minZ&&z-r<c.maxZ)return true;
 }
 return false;
}
function updatePlayer(dt){
 const forward=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0)-moveY;
 const side=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)+moveX;
 const len=Math.hypot(forward,side)||1;
 const f=forward/len,s=side/len;
 const speed=(player.run||keys.ShiftLeft?5.1:3.35);
 const dx=(Math.sin(player.yaw)*f+Math.cos(player.yaw)*s)*speed*dt;
 const dz=(Math.cos(player.yaw)*f-Math.sin(player.yaw)*s)*speed*dt;
 const nx=THREE.MathUtils.clamp(player.pos.x+dx,-18.4,18.4);
 const nz=THREE.MathUtils.clamp(player.pos.z+dz,-12.4,12.4);
 if(!collides(nx,player.pos.z))player.pos.x=nx;
 if(!collides(player.pos.x,nz))player.pos.z=nz;
 ranit.position.set(player.pos.x,0,player.pos.z);
 ranit.rotation.y=player.yaw+Math.PI;
 const moving=Math.abs(forward)+Math.abs(side)>.05;
 const t=performance.now()*.009;
 ranit.position.y=moving?Math.abs(Math.sin(t))*0.045:0;
}
function updateCamera(){
 const target=new THREE.Vector3(player.pos.x,1.55,player.pos.z);
 if(cameraMode==='FPP'){
  camera.position.copy(target).add(new THREE.Vector3(0,.12,0));
  camera.rotation.order='YXZ';camera.rotation.y=player.yaw;camera.rotation.x=player.pitch;
 }else{
  const dist=4.8;
  const offset=new THREE.Vector3(Math.sin(player.yaw)*dist,2.05,Math.cos(player.yaw)*dist);
  camera.position.copy(target).add(offset);
  camera.lookAt(player.pos.x,1.45,player.pos.z);
 }
}
function toggleCamera(){cameraMode=cameraMode==='TPP'?'FPP':'TPP';document.querySelector('#cameraMode').textContent=cameraMode;ranit.visible=cameraMode==='TPP';showToast(cameraMode+' CAMERA')}
document.querySelector('#cameraMode').addEventListener('click',toggleCamera);
document.querySelector('#mapToggle').addEventListener('click',()=>document.querySelector('#mapPanel').classList.toggle('hidden'));
document.querySelector('#closeMap').addEventListener('click',()=>document.querySelector('#mapPanel').classList.add('hidden'));
document.querySelector('#closeElevator').addEventListener('click',()=>document.querySelector('#floorPicker').classList.add('hidden'));
document.querySelector('#interactButton').addEventListener('click',interact);
document.querySelector('#runButton').addEventListener('touchstart',e=>{e.preventDefault();player.run=true},{passive:false});
document.querySelector('#runButton').addEventListener('touchend',()=>player.run=false);
document.querySelector('#runButton').addEventListener('pointerdown',()=>player.run=true);
document.querySelector('#runButton').addEventListener('pointerup',()=>player.run=false);
document.querySelector('#runButton').addEventListener('pointerleave',()=>player.run=false);
document.querySelector('#startButton').addEventListener('click',()=>{started=true;document.querySelector('#startScreen').classList.add('hidden');showToast('Welcome to Blackwood. You are Ranit.')});
document.querySelector('#resumeButton').addEventListener('click',()=>{paused=false;document.querySelector('#pauseScreen').classList.add('hidden');renderer.domElement.requestPointerLock?.()});
document.querySelector('#floorButtons').addEventListener('click',e=>{if(e.target.tagName==='BUTTON'){}});
document.addEventListener('keydown',e=>{
 keys[e.code]=true;
 if(e.code==='KeyE'&&!e.repeat)interact();
 if(e.code==='KeyV'&&!e.repeat)toggleCamera();
 if(e.code==='Escape'&&started){paused=!paused;document.querySelector('#pauseScreen').classList.toggle('hidden',!paused);if(paused)document.exitPointerLock?.()}
});
document.addEventListener('keyup',e=>{keys[e.code]=false});
renderer.domElement.addEventListener('click',()=>{if(started&&!paused&&cameraMode==='FPP'&&innerWidth>800)renderer.domElement.requestPointerLock?.()});
document.addEventListener('mousemove',e=>{
 if(document.pointerLockElement===renderer.domElement){player.yaw-=e.movementX*.0025;player.pitch=THREE.MathUtils.clamp(player.pitch-e.movementY*.002,-.9,.8)}
});
renderer.domElement.addEventListener('pointerdown',e=>{if(innerWidth<=800&&e.clientX>innerWidth*.38){dragging=true;lastX=e.clientX;lastY=e.clientY}});
window.addEventListener('pointerup',()=>dragging=false);
window.addEventListener('pointermove',e=>{if(dragging){player.yaw-=(e.clientX-lastX)*.006;player.pitch=THREE.MathUtils.clamp(player.pitch-(e.clientY-lastY)*.004,-.8,.65);lastX=e.clientX;lastY=e.clientY}});
const joystick=document.querySelector('#joystick'),stick=document.querySelector('#stick');
let joyId=null;
joystick.addEventListener('pointerdown',e=>{joyId=e.pointerId;joystick.setPointerCapture(joyId);updateJoy(e)});
joystick.addEventListener('pointermove',e=>{if(e.pointerId===joyId)updateJoy(e)});
joystick.addEventListener('pointerup',resetJoy);joystick.addEventListener('pointercancel',resetJoy);
function updateJoy(e){const r=joystick.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let x=e.clientX-cx,y=e.clientY-cy;const m=Math.hypot(x,y),max=35;if(m>max){x=x/m*max;y=y/m*max}moveX=x/max;moveY=y/max;stick.style.transform='translate('+x+'px,'+y+'px)'}
function resetJoy(){joyId=null;moveX=0;moveY=0;stick.style.transform='translate(0,0)'}
const mapList=document.querySelector('#mapList');
for(const f of floors){const div=document.createElement('div');div.className='map-floor';div.innerHTML='<h3>'+f.name+'</h3><p>'+f.rooms.join(' · ')+'</p>';mapList.appendChild(div)}
// A little ambient dust, visible in the light but purely decorative.
const dustGeo=new THREE.BufferGeometry(),dustCount=280,dustPositions=new Float32Array(dustCount*3);
for(let i=0;i<dustCount;i++){dustPositions[i*3]=(Math.random()-.5)*38;dustPositions[i*3+1]=Math.random()*3.3;dustPositions[i*3+2]=(Math.random()-.5)*26}
dustGeo.setAttribute('position',new THREE.BufferAttribute(dustPositions,3));
const dust=new THREE.Points(dustGeo,new THREE.PointsMaterial({color:0xc4b9a3,size:.035,transparent:true,opacity:.45}));scene.add(dust);
const clock=new THREE.Clock();
function animate(){
 requestAnimationFrame(animate);
 const dt=Math.min(clock.getDelta(),.04);
 if(started&&!paused){updatePlayer(dt);updateInteraction()}
 updateCamera();
 renderer.render(scene,camera);
}
updateCamera();animate();
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.5))});
