/* Haroe 10 — the rest of the building from the inside. The stairs climb past three floors above ours and go down to the shelter under the
   lobby. On each floor above, the flat over ours has its plan (the building's windows say so) and its own people and furniture, the way
   one of the designs would have it; a second flat opens off the landing to the west. Doors are locked: knock, or find another way in.
   Only the floor you are on is drawn, everything above it cut away, as in the Sims. */
(function(){
'use strict';
const A=window.APP, D=A.D, LB=A.LB, ST=LB.stairs, R=Math.PI, scene=A.scene, H=D.H, L=D.L;
const FF=ST.FF, XB=ST.XB, SU=LB.SU, SD=LB.SD, XH=ST.XH, XHd=ST.XHd, XE=LB.XE, EH=LB.EH, ZA0=ST.ZA0, ZA1=ST.ZA1, ZB0=ST.ZB0, ZB1=ST.ZB1, LO=ST.LO, UPS=ST.UPS;
const zA=(ZA0+ZA1)/2, zB=(ZB0+ZB1)/2, FLAT=['living','kitchen','bed1','bed2','bath','wc'];
const $=function(id){return document.getElementById(id);};

/* ---------- the floors: where you come up the stairs on each, and its rooms ---------- */
const LV=A.levels={};
const NAMES={'-1':'Shelter',1:'First floor',2:'Second floor',3:'Third floor'};
const DESIGN={1:'c',2:'j',3:'k'};                          // how the flat over ours is furnished, floor by floor
LV[-1]={y:LO,spawn:[SU-0.35,zA],pass:[],block:[]};
for(let f=1;f<=UPS;f++) LV[f]={y:f*FF,spawn:[SU-0.35,zB],pass:[],block:[]};
/* the landing on each floor, and the shelter's own, are lobby rooms of their own */
[-1].concat([1,2,3].slice(0,UPS)).forEach(function(f){A.addRoom('land'+f,{name:f<0?'Stairs down':'Landing, '+NAMES[f].toLowerCase(),rs:[[XB,SU,L,EH]],win:null,dl:0.85,node:'hall',on:true,ext:true,lvl:f});});      // part of the stairwell: the lobby's light is theirs
/* the flat over ours, on each floor: our rooms' outlines, its own lights */
for(let f=1;f<=UPS;f++) FLAT.forEach(function(k){const r=A.rooms[k]; A.addRoom(k+'@'+f,{name:r.name,rs:r.rs.map(function(q){return q.slice();}),win:null,dl:r.dl,node:'up'+f,on:true,ext:true,lvl:f,of:k});});

/* ---------- the stairs: a path for walking up or down one floor ---------- */
function up(f){            // from floor f to f+1: flight A along the wall, round the half landing, flight B back to the landing above
  const y=LV[f]?LV[f].y:0, m=y+FF/2, t=y+FF;
  if(f===-1) return [[SU-0.3,y,zA],[SU,y,zA],[XH,m,zA],[XH+0.55,m,zA],[XH+0.55,m,zB],[XHd,m,zB],[SD+0.25,-0.12,zB],[1.25,0,L+1.32],[0.88,0,L+1.22]];
  return [[SU-0.3,y,zA],[SU,y,zA],[XH,m,zA],[XH+0.55,m,zA],[XH+0.55,m,zB],[XH,m,zB],[SU,t,zB],[SU-0.35,t,zB]];
}
function path(from,to){return to>from?up(from):up(to).slice().reverse();}
A.stairsPath=path;

/* ---------- the doors on the landings: a leaf in each doorway, hung like ours, locked ---------- */
const doors={};          // key -> door
function hang(key,f,hx,hz,closed,open,room,col,no,w){
  w=w||0.82; const d=A.doorLeaf(key,hx,hz,closed,open,room,w); d.p.position.y=LV[f].y; d.lvl=f; d.locked=true; d.flat=key; groupFor(f).add(d.p);
  d.p.traverse(function(m){if(m.isMesh){m.userData.lvl=f; m.userData.nonav=true;}});
  const face=new THREE.Mesh(new THREE.PlaneGeometry(0.8,2.0),A.MT(A.canvasTex(64,160,function(g){g.fillStyle=col; g.fillRect(0,0,64,160); g.fillStyle='rgba(255,255,255,0.06)'; for(let i=0;i<40;i++) g.fillRect(Math.random()*64,Math.random()*160,2,2);
    if(no){g.fillStyle='#c9a24a'; g.font='bold 18px serif'; g.textAlign='center'; g.fillText(no,32,44); g.fillStyle='#2a2c2e'; g.beginPath(); g.arc(32,54,2.5,0,7); g.fill();}}),room));
  face.position.set(w/2,1.02,0.0215); face.scale.x=(w-0.02)/0.8; d.p.add(face); doors[key]=d; return d;
}
const LDW=LB.landDoors.west, LDS=LB.landDoors.south;
/* flat numbers: ours is 5 on the floor over the semi-basement; each floor above has the next ones */
const NUM={1:[9,10],2:[13,14],3:[17,18]};
function landingDoors(){
  for(let f=1;f<=UPS;f++){
    hang('over'+f,f,LDS[0],L,0,R/2,'land'+f,['#a9aeb1','#7d6a5a','#9aa6b0'][f-1],String(NUM[f][0]),LDS[1]-LDS[0]);      // over ours, hung as ours is: it swings in toward the flat
    hang('west'+f,f,XB,LDW[1],R/2,R*0.97,'land'+f,['#8a7f72','#a9aeb1','#6f7f75'][f-1],String(NUM[f][1]),LDW[1]-LDW[0]);      // to the west
  }
  hang('shelter',-1,XB,LDW[1],R/2,R*0.97,'land-1','#5a6a5e','מקלט',LDW[1]-LDW[0]);
}

/* ---------- the flat over ours: our flat's shell, built again on each floor, with its own materials and lights ---------- */
const lvlGroups={};          // floor -> group of what was built for it
function groupFor(f){if(!lvlGroups[f]){const g=new THREE.Group(); g.visible=false; g.userData.lvlRoot=f; scene.add(g); lvlGroups[f]=g;} return lvlGroups[f];}
const matRoom=new Map();     // our materials -> [room, lighting entry]
function readMats(){matRoom.clear(); for(const k in A.rooms){if(A.rooms[k].lvl) continue; A.rooms[k].mats.forEach(function(e){matRoom.set(e.m,[k,e]);});}}
function inFlat(b){return b.min.x>-0.35&&b.max.x<D.BXB+0.35&&b.min.z>A.AZ-0.4&&b.max.z<L+0.07&&b.min.y>-0.4&&b.max.y<H+0.4;}
function belongs(o,bb){       // part of our flat's shell, not of the lobby, the furniture or the people
  if(o.userData.live||o.userData.piece||o.userData.lvlRoot!=null||o.isLight) return false;
  let ours=0, other=0; o.traverse(function(m){if(!m.isMesh) return; [].concat(m.material).forEach(function(x){const r=matRoom.get(x); if(!r) return; if(FLAT.indexOf(r[0])>=0) ours++; else other++;});});
  if(other&&!ours) return false;
  bb.setFromObject(o); return !bb.isEmpty()&&inFlat(bb);
}
function cloneInto(src,f,cache){
  const c=src.clone(true);
  c.traverse(function(m){m.userData.lvl=f; if(!m.isMesh) return;
    m.material=Array.isArray(m.material)?m.material.map(function(x){return levelMat(x,f,cache);}):levelMat(m.material,f,cache);});
  return c;
}
function levelMat(x,f,cache){
  let c=cache.get(x); if(c) return c;
  c=x.clone(); cache.set(x,c);
  const r=matRoom.get(x); if(r&&FLAT.indexOf(r[0])>=0){const room=A.rooms[r[0]+'@'+f], e={m:c,b:r[1].b.clone()}; if(r[1].e) e.e=r[1].e.clone(); room.mats.push(e);}
  return c;
}
const upWalls={};             // floor -> walls of the flat over ours, to step aside in front of the camera
const built={};
function buildOver(f){
  built[f]=true;
  const g=groupFor(f), cache=new Map(), bb=new THREE.Box3(), y=LV[f].y, dk=DESIGN[f];
  const shell=new THREE.Group(); shell.position.y=y; g.add(shell);
  const doorG=new Set(A.doors.map(function(d){return d.p;})), wallG=new Map(); for(const k in A.walls) wallG.set(A.walls[k].g,A.walls[k]);
  scene.children.slice().forEach(function(o){
    if(o===g||doorG.has(o)) return;
    if(!belongs(o,bb)) return;
    const c=cloneInto(o,f,cache);
    const only=o.userData.only; if(only&&typeof only==='string'){const like=A.DESIGNS[dk]&&A.DESIGNS[dk].like||'-'; c.visible=only.indexOf(dk)>=0||only.indexOf(like)>=0;}
    shell.add(c);
    const w=wallG.get(o); if(w){(upWalls[f]=upWalls[f]||[]).push({g:c,a:w.a,b:w.b,n:w.n});}
  });
  /* its doors: our inside doors, and its front door onto the landing */
  A.doors.slice().forEach(function(d){if(d.lvl) return; let room=null; d.p.traverse(function(m){if(!room&&m.isMesh){const r=matRoom.get([].concat(m.material)[0]); if(r) room=r[0];}});
    if(FLAT.indexOf(room)<0&&d.id!=='entrance') return;
    const c=cloneInto(d.p,f,cache); c.position.y=y; g.add(c); c.traverse(function(m){m.userData.nonav=true;});
    const nd={id:d.id+'@'+f,p:c,closed:d.closed,open:d.open,cur:0,target:0,force:null,cx:d.cx,cz:d.cz,lvl:f};
    if(d.id==='entrance'){nd.locked=true; nd.flat='over'+f; c.visible=false;} else A.doors.push(nd);      // the front door is hung from the landing side instead
  });
  /* furnished the way design dk has it */
  A.designPieces(dk).forEach(function(q){
    const pg=new THREE.Group(); pg.position.set(q.x,y+q.y,q.z); pg.rotation.y=q.r;
    const room=(A.roomAt(q.x,q.z)||'living')+'@'+f;
    if(q.want&&A.CAT[q.want[0]]){try{A.buildItem(pg,q.want[0],q.want[1],q.want[2],A.rooms[room]?room:'living@'+f);}catch(e){return;}}
    else if(q.custom){q.g.children.forEach(function(ch){if(ch.userData.uid) return; pg.add(cloneInto(ch,f,cache));});}
    else return;
    pg.traverse(function(m){m.userData.lvl=f;});
    g.add(pg);
  });
  LV[f].pass=A.sims?A.sims.PASS.filter(function(p){return p[3]<L+0.4;}):[];
  LV[f].pass.push([LDS[0]+0.12,LDS[1]-0.12,L-0.35,L+0.35]); LV[f].pass[LV[f].pass.length-1].shut=function(){return doors['over'+f].locked;};
  g.traverse(function(m){if(m.isMesh&&m.userData.lvl==null) m.userData.lvl=f;});
}

/* ---------- the flat to the west on each floor, and the shelter: built room by room ---------- */
/* the west flat: on the building's back wall (z=ZW), so its living room and second bedroom get the windows. Entrance hall by the landing,
   a corridor down the middle, kitchen open to the living room, bathroom, two bedrooms. x runs from the landing (0) west; z from the back wall. */
const WZ0=A.AZ-0.2+0.12, WX0=-7.6;
const WROOMS={            // [x0,x1,z0,z1]
  living:[WX0,-2.6,WZ0,1.4], bedB:[-2.6,0,WZ0,1.4], kitchen:[WX0,-4.4,1.4,4.4], hall2:[-4.4,-3.2,1.4,EH], bath:[-3.2,0,1.4,4.4], bedA:[WX0,-4.4,4.4,EH], foyer:[-3.2,0,4.4,EH]};
const WNAMES={living:'Living room',bedB:'Bedroom',kitchen:'Kitchen',hall2:'Corridor',bath:'Bathroom',bedA:'Bedroom',foyer:'Entrance'};
for(let f=1;f<=UPS;f++) for(const k in WROOMS){const r=WROOMS[k]; A.addRoom('w'+f+':'+k,{name:WNAMES[k],rs:[r],win:null,dl:0.9,node:'west'+f,on:true,ext:true,lvl:f});}
const SH=[-6.5,0,L+0.05,EH+3.0];             // the shelter, under the lobby
A.addRoom('shelter',{name:'Shelter',rs:[SH],win:null,dl:0.7,node:'shelter',on:true,ext:true,lvl:-1});

const texCache={};
function tex(key,w,h,draw,rep){if(!texCache[key]){const t=A.canvasTex(w,h,draw); t.wrapS=t.wrapT=THREE.RepeatWrapping; texCache[key]=t;} const t=texCache[key].clone(); t.needsUpdate=true; if(rep) t.repeat.set(rep[0],rep[1]); return t;}
function parquet(g){const r=A.rng(7); g.fillStyle='#b98b5c'; g.fillRect(0,0,256,256);
  for(let j=0;j<16;j++) for(let i=0;i<4;i++){const c=[0xb98b5c,0xa97a4c,0xc79a68,0xb08355][Math.floor(r()*4)], x=i*64+(j%2)*32; g.fillStyle='#'+c.toString(16); g.fillRect(x+1,j*16+1,62,14);
    for(let k=0;k<6;k++){g.fillStyle='rgba(80,50,25,'+(0.05+r()*0.08)+')'; g.fillRect(x+r()*60,j*16+2+r()*12,10+r()*30,1);}}}
function tiles(col,grout,n){return function(g){g.fillStyle=grout; g.fillRect(0,0,128,128); const s=128/n; for(let j=0;j<n;j++) for(let i=0;i<n;i++){g.fillStyle=col; g.fillRect(i*s+1.5,j*s+1.5,s-3,s-3);}};}
function floorPlane(p,x0,x1,z0,z1,t,room){const m=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0,z1-z0),A.MT(t,room,true)); m.rotation.x=-R/2; m.position.set((x0+x1)/2,0.004,(z0+z1)/2); m.receiveShadow=true; m.userData.floor=true; p.add(m); return m;}
function ceilPlane(p,x0,x1,z0,z1,room){const m=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0,z1-z0),A.reg(new THREE.MeshLambertMaterial({color:0xf7f7f4,emissive:0x2c2d2b}),room)); m.rotation.x=R/2; m.position.set((x0+x1)/2,H,(z0+z1)/2); m.userData.floor=true; p.add(m); return m;}
/* a wall from a to b (along x or z), thickness 0.1, with openings [u0,u1,y0,y1] measured from a; it steps aside when it stands in front of the camera */
function wallRun(p,f,ax,az,bx,bz,col,room,holes,list){
  const len=Math.hypot(bx-ax,bz-az), dx=(bx-ax)/len, dz=(bz-az)/len, T=0.1, parts=[];
  const seg=function(u0,u1,y0,y1){if(u1-u0<0.01||y1-y0<0.01) return; const cxm=ax+dx*(u0+u1)/2, czm=az+dz*(u0+u1)/2;
    const m=A.inRoom(room,function(){return A.box(Math.abs(dx)*(u1-u0)+Math.abs(dz)*T,y1-y0,Math.abs(dz)*(u1-u0)+Math.abs(dx)*T,col,cxm,(y0+y1)/2,czm,p);}); m.castShadow=true; parts.push(m);};
  const hs=(holes||[]).slice().sort(function(a,b){return a[0]-b[0];}); let u=0;
  hs.forEach(function(h){seg(u,h[0],0,H); seg(h[0],h[1],0,h[2]); seg(h[0],h[1],h[3],H); u=h[1];}); seg(u,len,0,H);
  if(list) list.push({parts:parts,a:[ax,az],b:[bx,bz]});
  return parts;
}
function opening(pass,ax,az,bx,bz,u0,u1,shut){const len=Math.hypot(bx-ax,bz-az), dx=(bx-ax)/len, dz=(bz-az)/len, x0=ax+dx*u0, z0=az+dz*u0, x1=ax+dx*u1, z1=az+dz*u1;
  const q=[Math.min(x0,x1)+(dx?0.12:-0.32),Math.max(x0,x1)-(dx?0.12:-0.32),Math.min(z0,z1)+(dz?0.12:-0.32),Math.max(z0,z1)-(dz?0.12:-0.32)]; if(shut) q.shut=shut; pass.push(q); return q;}
function windowIn(p,x,z,w,y0,y1,alongX,room){            // glass, a white frame, a roller-shutter box over it, bars outside
  A.inRoom(room,function(){
    const fw=0.05, sx=alongX?w:0.06, sz=alongX?0.06:w;
    A.box(alongX?w+0.1:0.12,0.06,alongX?0.12:w+0.1,0xeceae4,x,y0-0.03,z,p);
    A.box(alongX?w:0.04,y1-y0,alongX?0.04:w,0xffffff,x,(y0+y1)/2,z,p).material=A.reg(new THREE.MeshLambertMaterial({color:0xbcd7e4,transparent:true,opacity:0.35,emissive:0x23404c}),room);
    [[-1],[1]].forEach(function(q){A.box(alongX?fw:0.08,y1-y0,alongX?0.08:fw,0xf4f4f1,x+(alongX?q[0]*(w/2):0),(y0+y1)/2,z+(alongX?0:q[0]*(w/2)),p);});
    A.box(alongX?fw:0.08,y1-y0,alongX?0.08:fw,0xf4f4f1,x,(y0+y1)/2,z,p);
    A.box(alongX?w+0.1:0.2,0.2,alongX?0.2:w+0.1,0xe6e2d8,x,y1+0.1,z,p);
  });
}
function put(p,room,type,ci,x,z,fx,fz,y,cfg){        // a catalog piece standing at x,z, facing (fx,fz)
  const g=new THREE.Group(); g.position.set(x,y||0,z); g.rotation.y=Math.atan2(-fz,fx); p.add(g);
  try{A.buildItem(g,type,ci,cfg||null,room);}catch(e){p.remove(g); return null;}
  return g;
}
function size(type){const d=A.CAT[type]; return d?{w:d.w/100,d:d.d/100,h:d.h/100}:{w:0.5,d:0.5,h:0.5};}
/* against a wall: side 'S' is the wall at z0 (piece faces +z), 'N' at z1, 'W' at x0 (faces +x), 'E' at x1; t from 0 to 1 along it */
function against(p,room,r,side,t,type,ci,cfg,gap){const s=size(type), g0=gap||0.02;
  if(side==='S') return put(p,room,type,ci,r[0]+(r[1]-r[0])*t,r[2]+s.d/2+g0,0,1,0,cfg);
  if(side==='N') return put(p,room,type,ci,r[0]+(r[1]-r[0])*t,r[3]-s.d/2-g0,0,-1,0,cfg);
  if(side==='W') return put(p,room,type,ci,r[0]+s.d/2+g0,r[2]+(r[3]-r[2])*t,1,0,0,cfg);
  return put(p,room,type,ci,r[1]-s.d/2-g0,r[2]+(r[3]-r[2])*t,-1,0,0,cfg);}
function pick(rng,list){return list[Math.floor(rng()*list.length)];}
function colOf(rng,type){const d=A.CAT[type]; return d?Math.floor(rng()*d.col.length):0;}

const westWalls={}, westBuilt={};
function buildWest(f){
  if(westBuilt[f]) return; westBuilt[f]=true;
  const g=groupFor(f), p=new THREE.Group(); p.position.y=LV[f].y; g.add(p);
  const rng=A.rng(100+f*17), K=A.kit, RK=function(k){return 'w'+f+':'+k;}, W=WROOMS, list=westWalls[f]=[], pass=LV[f].pass;
  const wallC=[0xf1eee6,0xeef0ec,0xf3ece2][f-1], accent=[0xa9c4ad,0xcfd9e6,0xe8d5c0][f-1];
  /* floors and ceilings */
  ['living','bedB','bedA','hall2','foyer'].forEach(function(k){const r=W[k]; floorPlane(p,r[0],r[1],r[2],r[3],tex('parq',256,256,parquet,[(r[1]-r[0])/1.6,(r[3]-r[2])/1.6]),RK(k)); ceilPlane(p,r[0],r[1],r[2],r[3],RK(k));});
  [['kitchen',tiles('#e9e4da','#bdb6a6',4),0.6],['bath',tiles('#dfe7ea','#9fb0b6',6),0.5]].forEach(function(q){const r=W[q[0]]; floorPlane(p,r[0],r[1],r[2],r[3],tex(q[0]+'t',128,128,q[1],[(r[1]-r[0])/q[2],(r[3]-r[2])/q[2]]),RK(q[0])); ceilPlane(p,r[0],r[1],r[2],r[3],RK(q[0]));});
  /* walls: the outer ones, then the ones between rooms, each with its doorways */
  const DOOR=[0,0.86,2.05], dw=function(u){return [u,u+0.86,2.05,H];};
  wallRun(p,f,WX0,WZ0,0,WZ0,wallC,RK('living'),[[1.0,2.6,0.9,2.2],[5.6,6.8,0.9,2.2]],list);      // the back wall: windows over the yard
  wallRun(p,f,WX0,WZ0,WX0,EH,wallC,RK('living'),[],list);                                      // the party wall, toward the next flat
  wallRun(p,f,WX0,EH,0,EH,wallC,RK('bedA'),[],list);
  wallRun(p,f,-0.06,WZ0,-0.06,L-0.02,wallC,RK('bedB'),[],list);                                   // against the flat over ours
  wallRun(p,f,-0.07,L,-0.07,EH,wallC,RK('foyer'),[[LDW[0]-L,LDW[1]-L,0,2.05]],list);                // the landing's wall, from inside, with the front door in it
  wallRun(p,f,WX0,1.4,-2.6,1.4,wallC,RK('kitchen'),[[0.3,2.9,0,2.3],[3.3,4.3,0,2.3]],list);      // kitchen open to the living room; the corridor's arch
  wallRun(p,f,-2.6,WZ0,-2.6,1.4,wallC,RK('bedB'),[[4.2,5.06,0,2.05]],list);                     // the second bedroom's door from the living room
  wallRun(p,f,-2.6,1.4,0,1.4,wallC,RK('bath'),[],list);
  wallRun(p,f,-4.4,1.4,-4.4,EH,wallC,RK('kitchen'),[[3.6,4.46,0,2.05]],list);                   // the bedroom's door off the corridor
  wallRun(p,f,-3.2,1.4,-3.2,4.4,wallC,RK('bath'),[[1.2,2.06,0,2.05]],list);                     // the bathroom's door
  wallRun(p,f,WX0,4.4,-4.4,4.4,wallC,RK('bedA'),[],list);
  wallRun(p,f,-3.2,4.4,0,4.4,wallC,RK('foyer'),[],list);
  wallRun(p,f,-3.2,4.4,-3.2,EH,wallC,RK('foyer'),[[0.8,2.0,0,2.3]],list);                       // the corridor opens into the entrance hall
  windowIn(p,WX0+1.8,WZ0+0.03,1.6,0.9,2.2,true,RK('living')); windowIn(p,WX0+6.2,WZ0+0.03,1.2,0.9,2.2,true,RK('bedB'));
  [[WX0,1.4,-2.6,1.4,0.3,2.9],[WX0,1.4,-2.6,1.4,3.3,4.3],[-2.6,WZ0,-2.6,1.4,4.2,5.06],[-4.4,1.4,-4.4,EH,3.6,4.46],[-3.2,1.4,-3.2,4.4,1.2,2.06],[-3.2,4.4,-3.2,EH,0.8,2.0]].forEach(function(q){opening(pass,q[0],q[1],q[2],q[3],q[4],q[5]);});
  pass.push([-0.45,0.35,LDW[0]+0.12,LDW[1]-0.12]); pass[pass.length-1].shut=function(){return doors['west'+f].locked;};      // the front door, open only when it is
  /* inner doors */
  [['bedB',-2.6,WZ0+5.06,R/2,0,0.86],['bedA',-4.4,1.4+4.46,R/2,R,0.86],['bath',-3.2,1.4+2.06,R/2,0,0.86]].forEach(function(q){      // hinged at the far end of each doorway, swinging into the room
    const d=A.doorLeaf('w'+f+q[0],q[1],q[2],q[3],q[4],RK(q[0]),q[5]); d.p.position.y=LV[f].y; d.lvl=f; g.add(d.p); d.p.traverse(function(m){m.userData.nonav=true;});});
  /* lights */
  [['living',-5.2,-1.4],['bedB',-1.3,-1.4],['kitchen',-6.0,2.9],['bath',-1.6,2.9],['bedA',-6.0,6.6],['foyer',-1.6,6.6],['hall2',-3.8,3.0]].forEach(function(q){K.ceilDisc(p,q[1],q[2],'L:'+RK(q[0]));});
  /* the living room */
  const lv=W.living, rr=RK('living');
  against(p,rr,lv,'W',0.45,pick(rng,['kivik3','ektorp3','vimle3','landskrona3','uppland3','soderhamn3','friheten']),null,null);
  const tvT=pick(rng,['bestaTV','hemnesTV','lackTV','brimnesTV','idanasTV']);
  const tb=against(p,rr,lv,'E',0.45,tvT,colOf(rng,tvT)); if(tb) put(tb,rr,'tv55',0,0,0,1,0,size(tvT).h);
  put(p,rr,pick(rng,['rugWool','rugStripe','rugKilim','stoense','langsted','vindum']),0,(lv[0]+lv[1])/2-0.2,lv[2]+(lv[3]-lv[2])*0.45,1,0);
  const ct=pick(rng,['lackCT','listerby','borgeby','hemnesCT','roundOak','vittsjoCT']); put(p,rr,ct,colOf(rng,ct),lv[0]+1.65,lv[2]+(lv[3]-lv[2])*0.45,1,0);
  const ac=pick(rng,['strandmon','poang','ekenaset','koarp','vedbo']); put(p,rr,ac,colOf(rng,ac),lv[0]+1.7,lv[2]+0.7,0,1);
  against(p,rr,lv,'S',0.92,pick(rng,['monstera','fiddle','olive','strelitzia','rubberPlant']),colOf(rng,'monstera'));
  against(p,rr,lv,'S',0.08,pick(rng,['arcLamp','floorLamp','hektar','tagarp']),0);
  const sh=pick(rng,['billy','kallax4x2','hemnesBook','ivar','vittsjoShelf']); against(p,rr,lv,'N',0.15,sh,colOf(rng,sh));
  const dt=pick(rng,['ingatorp','lisabo','melltorp','ekedalen']), ch=pick(rng,['ingolf','terje','lisaboChair','stefan','adde']), dx=lv[0]+3.6, dz=lv[3]-0.95;
  put(p,rr,dt,colOf(rng,dt),dx,dz,1,0); const cc=colOf(rng,ch); [[-0.75,0,1,0],[0.75,0,-1,0],[0,-0.6,0,1],[0,0.6,0,-1]].forEach(function(q){put(p,rr,ch,cc,dx+q[0],dz+q[1],q[2],q[3]);});
  put(p,rr,'frameTrio',0,lv[0]+0.03,1.45,1,0,0,null); const ft=p.children[p.children.length-1]; if(ft){ft.position.set(lv[0]+0.07,1.35,lv[2]+(lv[3]-lv[2])*0.45);}
  /* the bedrooms */
  [['bedB',W.bedB,'S'],['bedA',W.bedA,'N']].forEach(function(b){const r=b[1], k=RK(b[0]), side=b[2];
    const bt=pick(rng,['malmBed160','hemnesBed160','tarvaBed160','idanasBed160','songesandBed160','slattum160','kleppstad160']);
    const bed=b[0]==='bedB'?put(p,k,bt,colOf(rng,bt),(r[0]+r[1])/2,r[2]+size(bt).d/2+0.02,0,1):put(p,k,bt,colOf(rng,bt),(r[0]+r[1])/2+0.2,r[3]-size(bt).d/2-0.02,0,-1);
    const nt=pick(rng,['hemnesNight','malm2','tarvaNight','kullen2']); const bw=size(bt).w/2+0.3, bz=b[0]==='bedB'?r[2]+0.3:r[3]-0.3, bx=b[0]==='bedB'?(r[0]+r[1])/2:(r[0]+r[1])/2+0.2;
    [-1,1].forEach(function(s){const n=put(p,k,nt,colOf(rng,nt),bx+s*bw,bz,0,b[0]==='bedB'?1:-1); if(n) put(n,k,'tableLamp',0,0,0,1,0,size(nt).h);});
    const wd=pick(rng,['pax150','hemnesWard','kleppstad3','brimnesWard3','songesand2']); against(p,k,r,b[0]==='bedB'?'E':'W',0.68,wd,colOf(rng,wd));
    if(b[0]==='bedA'){against(p,k,r,'W',0.18,'micke',colOf(rng,'micke')); put(p,k,'officeChair',0,r[0]+0.75,r[2]+(r[3]-r[2])*0.18,-1,0);}
    else put(p,k,pick(rng,['roundRug','runner','adum']),0,(r[0]+r[1])/2,r[2]+2.4,0,1);
    against(p,k,r,side==='S'?'N':'S',0.12,pick(rng,['snake','zzPlant','satsumas']),0);});
  /* the kitchen: a run of units along the party wall, sink and hob, a fridge, cupboards over */
  (function(){const r=W.kitchen, k=RK('kitchen'), front=[0x3a4a5a,0xe9e4da,0x6f8f7f][f-1], top=[0xd8d2c4,0x2a2c2e,0xe8e2d4][f-1];
    A.inRoom(k,function(){
      const x=r[0]+0.31, z0=r[2]+0.1, z1=r[3]-0.75;
      A.box(0.6,0.86,z1-z0,front,x,0.43,(z0+z1)/2,p); A.box(0.64,0.04,z1-z0+0.02,top,x+0.01,0.88,(z0+z1)/2,p);
      for(let z=z0+0.6;z<z1;z+=0.6) A.box(0.004,0.8,0.006,0x1d1f21,x+0.302,0.45,z,p);
      A.box(0.4,0.02,0.5,0xc4c8ca,x+0.04,0.905,z0+1.1,p); A.box(0.03,0.28,0.03,0xc9cdd0,x-0.18,1.05,z0+1.1,p);      // the sink and its tap
      A.box(0.52,0.012,0.52,0x111213,x+0.03,0.907,z0+2.0,p);                                                         // the hob
      A.box(0.66,1.85,0.68,0xeceeed,x+0.02,0.925,z1+0.36,p);                                                         // the fridge
      A.box(0.35,0.7,z1-z0,front,r[0]+0.18,1.85,(z0+z1)/2,p);                                                        // cupboards over
      A.box(0.02,0.55,z1-z0,0xf2efe8,r[0]+0.02,1.18,(z0+z1)/2,p);                                                    // tiles between
    });
    put(p,k,'fruitBowl',0,r[0]+0.4,r[2]+0.5,1,0,0.9); put(p,k,'pothosPot',0,r[0]+0.4,r[3]-1.2,1,0,0.9);})();
  /* the bathroom: a bath along the back, a basin, a toilet */
  (function(){const r=W.bath, k=RK('bath');
    A.inRoom(k,function(){
      A.box(1.6,0.56,0.72,0xf4f4f2,r[1]-0.82,0.28,r[2]+0.38,p); A.box(1.5,0.02,0.6,0xd8e6ea,r[1]-0.82,0.55,r[2]+0.38,p);      // the bath
      A.box(0.04,1.4,1.0,0xdfe9ec,r[1]-1.62,1.3,r[2]+0.5,p).material.transparent=true;
      const tz=r[3]-0.45; A.box(0.38,0.4,0.5,0xf8f8f6,r[1]-0.3,0.2,tz,p); A.box(0.4,0.04,0.44,0xffffff,r[1]-0.3,0.42,tz+0.02,p); A.box(0.4,0.42,0.16,0xf8f8f6,r[1]-0.09,0.62,tz,p);      // the toilet
      A.box(0.6,0.75,0.12,0xf2f2f0,r[1]-0.06,1.35,r[2]+(r[3]-r[2])*0.55,p);
    });
    const wb=pick(rng,['hemnesWash','enhetWash']); against(p,k,r,'N',0.25,wb,colOf(rng,wb)); against(p,k,r,'N',0.25,'godmorgonMirror',0,null,0.02);
    const mr=p.children[p.children.length-1]; if(mr) mr.position.y=1.35;})();
  /* the entrance hall */
  (function(){const r=W.foyer, k=RK('foyer'); const sc=pick(rng,['hemnesShoe','bissa','shoeCab','tjusig']); against(p,k,r,'N',0.55,sc,colOf(rng,sc));
    put(p,k,'doormat',0,-0.45,(LDW[0]+LDW[1])/2,-1,0); against(p,k,r,'N',0.2,'coatStand',0);})();
  p.traverse(function(m){m.userData.lvl=f;});
}

/* the shelter, under the lobby: concrete, a steel door, bunks, benches, the ventilation unit, water and tins */
let shelterBuilt=false;
function buildShelter(){
  if(shelterBuilt) return; shelterBuilt=true;
  const g=groupFor(-1), p=new THREE.Group(); p.position.y=LO; g.add(p); const k='shelter', r=SH, list=westWalls[-1]=[];
  const conc=tex('conc',128,128,function(c){const q=A.rng(9); c.fillStyle='#b9b6ae'; c.fillRect(0,0,128,128); for(let i=0;i<500;i++){c.fillStyle='rgba('+(q()<0.5?'90,88,82':'230,228,220')+','+(0.05+q()*0.1)+')'; c.fillRect(q()*128,q()*128,1+q()*3,1+q()*2);}},[ (r[1]-r[0])/1.5,(r[3]-r[2])/1.5]);
  floorPlane(p,r[0],r[1],r[2],r[3],conc,k); ceilPlane(p,r[0],r[1],r[2],r[3],k);
  wallRun(p,-1,r[0],r[2],r[1],r[2],0xd9d6cc,k,[],list); wallRun(p,-1,r[0],r[2],r[0],r[3],0xd9d6cc,k,[],list); wallRun(p,-1,r[0],r[3],r[1],r[3],0xd9d6cc,k,[],list);
  wallRun(p,-1,-0.07,r[2],-0.07,r[3],0xd9d6cc,k,[[LDW[0]-r[2],LDW[1]-r[2],0,2.05]],list);
  LV[-1].pass.push([-0.45,0.35,LDW[0]+0.12,LDW[1]-0.12]); LV[-1].pass[LV[-1].pass.length-1].shut=function(){return doors.shelter.locked;};
  A.inRoom(k,function(){
    A.box(0.04,1.2,(r[3]-r[2])-0.4,0xe3dfd4,r[0]+0.06,0.6,(r[2]+r[3])/2,p);      // the lower walls painted
    for(let i=0;i<3;i++){const z=r[2]+0.8+i*1.4;                                   // bunks against the far wall
      [0.35,1.25].forEach(function(y){A.box(0.8,0.06,1.9,0x5f6b5a,r[0]+0.5,y,z+0.0,p); A.box(0.75,0.12,1.85,0x2f5a8a,r[0]+0.5,y+0.09,z,p);});
      [[0.1,-0.9],[0.9,-0.9],[0.1,0.9],[0.9,0.9]].forEach(function(q){A.box(0.04,1.6,0.04,0x4a4f52,r[0]+q[0],0.8,z+q[1],p);});}
    A.box(1.0,0.75,0.6,0xd8dcdd,r[0]+3.0,0.375,r[3]-0.35,p); for(let i=0;i<6;i++) A.box(0.12,0.3,0.12,0x8fc4e0,r[0]+2.65+i*0.14,0.9,r[3]-0.35,p);      // the ventilation unit, bottles of water on it
    A.box(0.12,0.12,1.4,0xa9adb0,r[0]+3.0,H-0.3,r[3]-1.1,p);
    A.box(2.0,0.45,0.35,0x8a6a48,r[0]+3.4,0.225,r[2]+0.25,p);                      // a bench
    for(let i=0;i<4;i++) A.box(0.35,0.3,0.25,[0xc9a46a,0x8a6a48,0xd9c68a,0xa98a5c][i],r[0]+5.2,0.15+i*0.3,r[2]+0.4,p);      // boxes, stacked
    A.box(0.04,0.02,1.2,0xffffff,r[0]+2.5,H-0.04,(r[2]+r[3])/2,p).material=A.lampMat('L:'+k,0xf2f2ee,0xf4fbff,1.2);       // a fluorescent tube
  });
  put(p,k,'tarnoTable',0,r[0]+2.2,(r[2]+r[3])/2,1,0); [[-0.45,0,1,0],[0.45,0,-1,0]].forEach(function(q){put(p,k,'tarnoChair',0,r[0]+2.2+q[0],(r[2]+r[3])/2+q[1],q[2],q[3]);});
  put(p,k,'klippan2',2,r[0]+4.4,r[3]-0.5,0,-1);
  A.pool('L:'+k,0xeaf4ff,r[0]+2.5,0.03,(r[2]+r[3])/2,3.0,p,0.25);
  /* the sign on the door, in the stairwell: shelter */
  p.traverse(function(m){m.userData.lvl=-1;});
}

/* ---------- which floor is drawn, and everything above it cut away ---------- */
const clip=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6);
let clipping=false, shownLvl=0;
const segHit=function(ax,az,bx,bz,cx_,cz_,dx,dz){const r1=bx-ax, r2=bz-az, s1=dx-cx_, s2=dz-cz_, den=r1*s2-r2*s1; if(Math.abs(den)<1e-9) return false;
  const t=((cx_-ax)*s2-(cz_-az)*s1)/den, u=((cx_-ax)*r2-(cz_-az)*r1)/den; return t>0.02&&t<0.98&&u>=0&&u<=1;};
const wantHide=[];           // what stands in the way when you are down in the shelter
A.hideBelow=function(o){wantHide.push(o);};
A.frameFns.push(function(){
  const p=A.player, on=A.simsOn&&p;
  let lv=0; if(on){lv=p.lvl||0; if(p.script) lv=Math.max(lv,p.script.lvl);}
  if(lv!==shownLvl){shownLvl=lv; for(const f in lvlGroups) lvlGroups[f].visible=+f===lv;
    wantHide.forEach(function(o){o.visible=lv>=0;}); A.touch(3);}
  if(lv){clip.constant=LV[lv].y+H+0.03; if(!clipping||A.renderer.clippingPlanes[0]!==clip){A.renderer.clippingPlanes=[clip]; clipping=true;}}
  else if(clipping){if(A.renderer.clippingPlanes[0]===clip) A.renderer.clippingPlanes=[]; clipping=false;}
  if(lv&&A.sims&&A.sims.camMode==='follow'){const c=A.camera.position;
    (upWalls[lv]||[]).forEach(function(w){const front=(c.x-w.a[0])*w.n[0]+(c.z-w.a[1])*w.n[1]>0; w.g.visible=!(front&&segHit(c.x,c.z,p.x,p.z,w.a[0],w.a[1],w.b[0],w.b[1]));});
    (westWalls[lv]||[]).forEach(function(w){const hide=segHit(c.x,c.z,p.x,p.z,w.a[0],w.a[1],w.b[0],w.b[1]); for(let i=0;i<w.parts.length;i++) w.parts[i].visible=!hide;});}
  else if(lv&&A.sims&&A.sims.camMode==='eye'){(upWalls[lv]||[]).forEach(function(w){w.g.visible=true;}); (westWalls[lv]||[]).forEach(function(w){w.parts.forEach(function(m){m.visible=true;});});}
});

/* ---------- what you can do on the stairs and at the doors (the bar that pops up by things in Sims mode) ---------- */
function goStairs(dir){
  const p=A.player, S=A.sims; if(!p||p.script) return;
  const from=p.lvl||0, to=from+dir; if(to<-1||to>UPS) return;
  if(LV[to]&&to>0&&!built[to]){buildOver(to); buildWest(to); A.navDirty(to);}
  if(to===-1&&!shelterBuilt){buildShelter(); A.navDirty(-1);}
  const pts=path(from,to);
  S.stop(); S.setDoing(dir>0?'going upstairs':'going downstairs');
  p.goTo(pts[0][0],pts[0][2],function(){
    p.climb(pts,to,function(){S.setDoing(''); S.toast(to===0?'Back on our floor.':NAMES[to]+'.'); if(A.unfightSoon) A.unfightSoon(100);});});
}
A.goStairs=goStairs;
const knocks={};
function knock(d){const S=A.sims; S.toast('Knock knock… nobody answers.'); if(A.audio&&A.audio.blip) A.audio.blip('click');}
A.moreItems=function(out,p){
  const f=p.lvl||0, y=f?LV[f].y:0;
  const st=f===0?{x:SU-0.05,z:L+1.2,sx:SU-0.35,sz:L+1.0,h:R/2}:{x:SU-0.05,z:(zA+zB)/2,sx:SU-0.4,sz:(zA+zB)/2,h:R/2};
  const acts=[]; if(f<UPS) acts.push([f===-1?'Up to our floor':'Go upstairs',function(){goStairs(1);}]); if(f>-1) acts.push([f===1?'Down to our floor':f===0?'Down to the shelter':'Go downstairs',function(){goStairs(-1);}]);
  out.push({name:'Stairs',x:st.x,z:st.z,y:y+0.8,sx:st.sx,sz:st.sz,h:st.h,acts:acts,box:[SU-0.1,XH,y-0.05,y+1.2,ZA0,ZA1]});
  if(!f) return;
  Object.keys(doors).forEach(function(k){const d=doors[k]; if(d.lvl!==f) return;
    const west=k.indexOf('west')===0||k==='shelter', x=west?XB+0.02:(LDS[0]+LDS[1])/2, z=west?(LDW[0]+LDW[1])/2:L+0.02;
    const label=k==='shelter'?'Shelter door':'Flat '+(west?NUM[f][1]:NUM[f][0]);
    out.push({name:label,x:x,z:z,y:y+1.0,sx:west?XB+0.55:x,sz:west?z:L+0.55,h:west?-R/2:R,acts:d.locked?[['Knock',function(){knock(d);}]]:[['Go in',function(){A.walkTo(west?XB-0.6:x,west?z:L-0.6);}]],
      box:west?[XB-0.05,XB+0.1,y,y+2.1,LDW[0]-0.1,LDW[1]+0.1]:[LDS[0]-0.1,LDS[1]+0.1,y,y+2.1,L-0.05,L+0.1]});});
};

/* once everything is built: the doors on the landings */
window.addEventListener('load',function(){readMats(); landingDoors(); scene.traverse(function(o){if(o.userData.hideBelow) wantHide.push(o);});});
A.floors={LV:LV,build:buildOver,buildWest:buildWest,buildShelter:buildShelter,groups:lvlGroups,doors:doors,NUM:NUM,DESIGN:DESIGN,readMats:readMats,WROOMS:WROOMS,SH:SH};
})();
