/* Haroe 10 — the rest of the building from the inside. The stairs climb past three floors above ours and go down to the shelter under the
   lobby. On each floor above, the flat over ours has its plan (the building's windows say so) and its own people and furniture, the way
   one of the designs would have it; a second flat opens off the landing to the west. Doors are locked: knock, or find another way in.
   Only the floor you are on is drawn, everything above it cut away, as in the Sims. */
(function(){
'use strict';
const A=window.APP, D=A.D, LB=A.LB, ST=LB.stairs, R=Math.PI, scene=A.scene, H=D.H, L=D.L;
const FF=ST.FF, XB=ST.XB, SU=LB.SU, SD=LB.SD, SW=LB.SW, X1=ST.X1, XD=ST.XD, XE=LB.XE, EH=LB.EH, LO=ST.LO, UPS=ST.UPS;
const zA=L+SW/2, zB=EH-SW/2, xA=XE-SW/2, FLAT=['living','kitchen','bed1','bed2','bath','wc'];
const $=function(id){return document.getElementById(id);};

/* ---------- the floors: where you come up the stairs on each, and its rooms ---------- */
const LV=A.levels={};
const NAMES={'-1':'Shelter',1:'First floor',2:'Second floor',3:'Third floor'};
const DESIGN={1:'c',2:'j',3:'k'};                          // how the flat over ours is furnished, floor by floor
LV[-1]={y:LO,spawn:[SU-0.35,zA],pass:[],block:[]};
LV[0]={y:0,spawn:[0.9,L+0.6],pass:[],block:[]};      // our own floor: the flats round ours, behind their doors
for(let f=1;f<=UPS;f++) LV[f]={y:f*FF,spawn:[SU-0.35,zB],pass:[],block:[]};
/* the landing on each floor, and the shelter's own, are lobby rooms of their own */
[-1].concat([1,2,3].slice(0,UPS)).forEach(function(f){A.addRoom('land'+f,{name:f<0?'Stairs down':'Landing, '+NAMES[f].toLowerCase(),rs:f<0?[[XB,SU,L,EH]]:[[XB,SU,L,EH],[SU-0.3,XD+0.1,EH-SW+0.02,EH+0.25],[LB.XL,SU,L+LB.D4,LB.RZ],[LB.CX0,LB.CX1,EH-0.25,LB.ZE],[LB.CX0,LB.XF,LB.ZE-0.3,LB.ZC]],win:null,dl:0.85,node:'hall',on:true,ext:true,lvl:f});});      // part of the stairwell: the lobby's light is theirs. Upstairs the landing is as wide as ours, and the corridor and the hall over the entrance go on as on our floor
/* the flats of the plan (plan.js) on every floor, ours too: their rooms */
const PL=A.PLAN, PF=[1,2,3,4,6];
function pkey(n,f){return 'f'+n+'@'+f;}
function proom(n,f,id){return 'p'+f+'.'+n+':'+id;}
for(let f=0;f<=UPS;f++) PF.forEach(function(n){PL.analyse(n).rooms.forEach(function(rm){A.addRoom(proom(n,f,rm.id),{name:rm.name,rs:[rm.r],win:null,dl:0.9,node:'flat'+n+'@'+f,on:true,ext:true,lvl:f||undefined,
  navIf:function(){const d=doors[pkey(n,f)]; return !d||!d.locked;}});});});      // on our floor, walked into only once its door is open
/* the flat over ours, on each floor: our rooms' outlines, its own lights */
for(let f=1;f<=UPS;f++) FLAT.forEach(function(k){const r=A.rooms[k]; A.addRoom(k+'@'+f,{name:r.name,rs:r.rs.map(function(q){return q.slice();}),win:null,dl:r.dl,node:'up'+f,on:true,ext:true,lvl:f,of:k});});

/* ---------- the stairs: a path for walking up or down one floor ---------- */
function up(f){            // from floor f to f+1: the first flight along the wall, round the corner landing, the one across along the far wall, round the second landing, the third back to the landing above
  const y=LV[f]?LV[f].y:0, t=f===-1?0:y+FF, rs=(t-y)/16, ya=y+6*rs, yb=y+11*rs;
  const pts=[[SU-0.3,y,zA],[SU,y,zA],[X1,ya,zA],[xA,ya,zA],[xA,ya,L+SW],[xA,yb,EH-SW],[xA,yb,zB],[X1,yb,zB],[XD,t,zB]];
  return pts.concat(f===-1?[[1.1,0,zB],[0.88,0,L+1.22]]:[[SU-0.35,t,zB]]);      // on our floor, on past the pillar to our door
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
/* flat numbers, from the plan: 1 to 6 on our floor (ours is 5), 7 to 12 on the next, and so on */
function NUMOF(n,f){return f*6+n;}
const NUM={1:[11],2:[17],3:[23]};
/* where a flat's front door is: the side of its room it is in, the doorway along it, the plane the leaf hangs in (on our floor, the lobby's
   wall in front of it), and which way it swings */
function doorSpec(n,f){const d=PL.doorOf(n,f), rm=PL.analyse(n).rooms.find(function(q){return q.id===d[0];}), r=rm.r, side=d[1];
  const c={'x+':r[1],'x-':r[0],'z+':r[3],'z-':r[2]}[side], sg=side[1]==='+'?1:-1, off=f===0&&!(n===1)?0.1:0.06, plane=c+sg*off;
  const along=side[0]==='x'?'z':'x', hx=along==='z'?plane:d[2], hz=along==='z'?d[2]:plane;
  const closed=along==='z'?-R/2:0, open=along==='z'?(sg>0?-R*0.97:-0.03):(sg>0?R/2:-R/2);
  const mid=(d[2]+d[3])/2, ix=side[0]==='x'?c-sg*0.6:mid, iz=side[0]==='x'?mid:c-sg*0.6, ox=side[0]==='x'?plane+sg*0.6:mid, oz=side[0]==='x'?mid:plane+sg*0.6;
  return {room:rm, side:side, c:c, sg:sg, plane:plane, u0:d[2], u1:d[3], hx:hx, hz:hz, closed:closed, open:open, ix:ix, iz:iz, ox:ox, oz:oz, h:Math.atan2(ox-ix,oz-iz)};}
const DOORC=['#a9aeb1','#8a7f72','#9aa6b0','#7d6a5a','#6f7f75','#b9b2a6'];
function landingDoors(){
  for(let f=1;f<=UPS;f++) hang('over'+f,f,LDS[0],L,0,R/2,'land'+f,['#a9aeb1','#7d6a5a','#9aa6b0'][f-1],String(NUM[f][0]),LDS[1]-LDS[0]);      // over ours, hung as ours is: it swings in toward the flat
  for(let f=0;f<=UPS;f++) PF.forEach(function(n){const s=doorSpec(n,f); hang(pkey(n,f),f,s.hx,s.hz,s.closed,s.open,f?'land'+f:'hall',f?DOORC[(n+f)%DOORC.length]:DOORC[0],String(NUMOF(n,f)),s.u1-s.u0);});      // on our floor every door is the same grey steel, as in the photos
  hang('shelter',-1,XB,LDW[1],R/2,R*0.97,'land-1','#5a6a5e','מקלט',LDW[1]-LDW[0]); doors.shelter.locked=false;      // the shelter is open to all
}

/* ---------- the flat over ours: our flat's shell, built again on each floor, with its own materials and lights ---------- */
const lvlGroups={};          // floor -> group of what was built for it
function groupFor(f){if(!lvlGroups[f]){const g=new THREE.Group(); g.visible=+f===0; g.userData.lvlRoot=f; scene.add(g); lvlGroups[f]=g;} return lvlGroups[f];}
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

/* ---------- the shelter, under the lobby ---------- */
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
  const g=new THREE.Group(); g.position.set(x,y||0,z); g.rotation.y=Math.atan2(-fz,fx); p.add(g); g.userData.cat=(A.CAT[type]||{}).cat;
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
function choose(rng,list){return list[Math.floor(rng()*list.length)];}
function colOf(rng,type){const d=A.CAT[type]; return d?Math.floor(rng()*d.col.length):0;}

/* ---------- a flat of the plan, built room by room: floors, ceilings, walls with their doorways and windows, the front door's doorway,
   lights, and furniture for what each room is ---------- */
const planWalls={}, planBuilt={}, ground0=[];      // ground0: the flats round ours, on our floor
const WALLC=[0xf1eee6,0xeef0ec,0xf3ece2,0xefe9df,0xeceee9,0xf2efe8];
function buildFlat(n,f){
  const key=pkey(n,f); if(planBuilt[key]) return; planBuilt[key]=true;
  const g=groupFor(f), p=new THREE.Group(); p.position.y=LV[f].y; g.add(p); if(!f) ground0.push(p);
  const an=PL.analyse(n), rs=an.rooms, rng=A.rng(n*31+f*7+3), K=A.kit, RK=function(id){return proom(n,f,id);}, list=planWalls[f]=planWalls[f]||[], pass=LV[f].pass;
  const wallC=WALLC[(n+f)%WALLC.length], ds=doorSpec(n,f), T=0.1;
  /* floors and ceilings */
  rs.forEach(function(rm){const r=rm.r, k=RK(rm.id), wet=rm.type==='bath'||rm.type==='wc', kit=rm.type==='kitchen';
    floorPlane(p,r[0],r[1],r[2],r[3],wet?tex('btile',128,128,tiles('#dfe7ea','#9fb0b6',6),[(r[1]-r[0])/0.5,(r[3]-r[2])/0.5]):kit?tex('ktile',128,128,tiles('#e9e4da','#bdb6a6',4),[(r[1]-r[0])/0.6,(r[3]-r[2])/0.6]):tex('parq',256,256,parquet,[(r[1]-r[0])/1.6,(r[3]-r[2])/1.6]),k);
    ceilPlane(p,r[0],r[1],r[2],r[3],k);});
  /* walls: each piece inside its own room's edge, so two flats' walls stand back to back and never in one plane */
  const sides={};      // room -> side -> what is on it: doors, windows
  function note(rm,side,u0,u1,what){const k=rm.id+side; (sides[k]=sides[k]||[]).push([u0,u1,what]);}
  function run(axis,c,s0,s1,inward,room,holes){      // a wall along the edge at c (x=c when axis is 'x'), from s0 to s1, set back inward by half its thickness
    const cc=c+inward*T/2, a=axis==='x'?[cc,s0]:[s0,cc], b=axis==='x'?[cc,s1]:[s1,cc];
    wallRun(p,f,a[0],a[1],b[0],b[1],wallC,room,holes.map(function(h){return [h[0]-s0,h[1]-s0,h[2],h[3]];}),list);}
  /* between rooms */
  an.inner.forEach(function(w){const ra=rs[w.a], rb=rs[w.b], holes=w.open?[[w.open[0],w.open[1],0,w.open[2]]]:[];
    run(w.axis,w.c,w.s0,w.s1,0,RK(ra.id),holes);
    if(w.open){opening(pass,w.axis==='x'?w.c:w.open[0],w.axis==='x'?w.open[0]:w.c,w.axis==='x'?w.c:w.open[1],w.axis==='x'?w.open[1]:w.c,0,w.open[1]-w.open[0]);
      const sa=(w.axis==='x'?(ra.r[1]<=rb.r[0]+0.3?'x+':'x-'):(ra.r[3]<=rb.r[2]+0.3?'z+':'z-')), sb=sa[0]+(sa[1]==='+'?'-':'+'); note(ra,sa,w.open[0],w.open[1],'door'); note(rb,sb,w.open[0],w.open[1],'door');}});
  /* round the outside of the flat: against a neighbour, a party wall; onto the open air, windows */
  an.edges.forEach(function(e){const rm=rs[e.room], side=e.axis+(e.out>0?'+':'-'), holes=[], room=RK(rm.id);
    if(rm.id===ds.room.id&&side===ds.side){const u0=Math.max(e.s0,ds.u0), u1=Math.min(e.s1,ds.u1); if(u1-u0>0.3){holes.push([u0,u1,0,2.05]); note(rm,side,u0,u1,'door');}}
    if(e.kind==='out'){const len=e.s1-e.s0, wet=rm.type==='bath'||rm.type==='wc';
      if(len>1.3){const ww=wet?0.6:Math.min(rm.type==='living'?2.0:1.5,len-0.7), m=(e.s0+e.s1)/2, y0=wet?1.5:0.9, y1=wet?2.1:2.2;
        if(!holes.some(function(h){return h[1]>m-ww/2&&h[0]<m+ww/2;})){holes.push([m-ww/2,m+ww/2,y0,y1]); note(rm,side,m-ww/2,m+ww/2,'window');
          const wx=e.axis==='x'?e.c-e.out*0.06:m, wz=e.axis==='x'?m:e.c-e.out*0.06; windowIn(p,wx,wz,ww,y0,y1,e.axis==='z',room);}}}
    run(e.axis,e.c,e.s0,e.s1,-e.out,room,holes);});
  pass.push([Math.min(ds.ix,ds.ox)-(ds.side[0]==='x'?0:0.32),Math.max(ds.ix,ds.ox)+(ds.side[0]==='x'?0:0.32),Math.min(ds.iz,ds.oz)-(ds.side[0]==='z'?0:0.32),Math.max(ds.iz,ds.oz)+(ds.side[0]==='z'?0:0.32)]);
  pass[pass.length-1].shut=function(){return doors[key].locked;};      // the front door: open only when it is
  /* lights */
  rs.forEach(function(rm){const r=rm.r; A.inRoom(RK(rm.id),function(){K.ceilDisc(p,(r[0]+r[1])/2,(r[2]+r[3])/2,'L:'+RK(rm.id));});});
  /* what is on each side of a room, to put things against: the longest stretch of wall free of doors and windows */
  function freeSide(rm,prefer){const r=rm.r, out=[];
    [['S','z-',r[0],r[1]],['N','z+',r[0],r[1]],['W','x-',r[2],r[3]],['E','x+',r[2],r[3]]].forEach(function(q){const len=q[3]-q[2], bad=sides[rm.id+q[1]]||[];
      let best=0, bt=0.5; const cuts=[q[2]].concat(...bad.map(function(b){return [b[0]-0.15,b[1]+0.15];})).concat([q[3]]).sort(function(a,b){return a-b;});
      for(let i=0;i+1<cuts.length;i+=2){const a=Math.max(q[2],cuts[i]), b=Math.min(q[3],cuts[i+1]); if(b-a>best){best=b-a; bt=((a+b)/2-q[2])/len;}}
      const win=bad.some(function(b){return b[2]==='window';}); out.push({side:q[0],free:best,t:bt,win:win,len:len});});
    out.sort(function(a,b){return (b.free-(b.win&&prefer!=='win'?0.6:0))-(a.free-(a.win&&prefer!=='win'?0.6:0));}); return out;}
  const opp={S:'N',N:'S',W:'E',E:'W'};
  rs.forEach(function(rm){const r=rm.r, k=RK(rm.id), fs=freeSide(rm), s0=fs[0];
    if(rm.type==='living'){
      const sofa=choose(rng,['kivik3','ektorp3','vimle3','landskrona3','uppland3','soderhamn3','friheten']); if(s0.free>2.3) against(p,k,r,s0.side,s0.t,sofa,colOf(rng,sofa));
      const o=fs.find(function(q){return q.side===opp[s0.side];}); if(o&&o.free>1.3){const tvT=choose(rng,['bestaTV','hemnesTV','lackTV','brimnesTV']); const tb=against(p,k,r,o.side,o.t,tvT,colOf(rng,tvT)); if(tb) put(tb,k,'tv55',0,0,0,1,0,size(tvT).h);}
      if(r[1]-r[0]>2.6&&r[3]-r[2]>2.6){put(p,k,choose(rng,['rugWool','rugStripe','rugKilim','stoense','langsted']),0,(r[0]+r[1])/2,(r[2]+r[3])/2,1,0); const ct=choose(rng,['lackCT','listerby','borgeby','hemnesCT','roundOak']); put(p,k,ct,colOf(rng,ct),(r[0]+r[1])/2,(r[2]+r[3])/2,1,0);}
      const s1=fs[1]; if(s1&&s1.free>0.9){const ac=choose(rng,['strandmon','poang','ekenaset','koarp']); against(p,k,r,s1.side,s1.t,ac,colOf(rng,ac),null,0.1);}
      const s2=fs[2]; if(s2&&s2.free>0.8) against(p,k,r,s2.side,Math.min(0.9,s2.t+0.2),choose(rng,['monstera','fiddle','olive','strelitzia']),0);}
    else if(rm.type==='bed'){
      const bt=choose(rng,['malmBed160','hemnesBed160','tarvaBed160','idanasBed160','slattum160','kleppstad160','malmBed90']), sz=size(bt);
      if(s0.free>sz.w+0.1&&Math.min(r[1]-r[0],r[3]-r[2])>sz.d+0.6){const bed=against(p,k,r,s0.side,s0.t,bt,colOf(rng,bt));
        const nt=choose(rng,['hemnesNight','malm2','tarvaNight','kullen2']); if(bed&&s0.free>sz.w+1.1) [-1,1].forEach(function(sd){const along=s0.side==='S'||s0.side==='N', bp=bed.position;
          const n2=put(p,k,nt,colOf(rng,nt),bp.x+(along?sd*(sz.w/2+0.3):0)-(s0.side==='W'?sz.d/2-0.25:s0.side==='E'?-(sz.d/2-0.25):0),bp.z+(along?0:sd*(sz.w/2+0.3))-(s0.side==='S'?sz.d/2-0.25:s0.side==='N'?-(sz.d/2-0.25):0),s0.side==='W'?1:s0.side==='E'?-1:0,s0.side==='S'?1:s0.side==='N'?-1:0);
          if(n2) put(n2,k,'tableLamp',0,0,0,1,0,size(nt).h);});}
      else if(rm.id.indexOf('study')===0||s0.free<2){against(p,k,r,s0.side,s0.t,'micke',colOf(rng,'micke'));}
      const s1=fs.find(function(q){return q.side!==s0.side&&q.side!==opp[s0.side];})||fs[1]; if(s1&&s1.free>1.1){const wd=choose(rng,['pax150','hemnesWard','kleppstad3','brimnesWard3','songesand2']); if(s1.free>size(wd).w+0.1) against(p,k,r,s1.side,s1.t,wd,colOf(rng,wd));}}
    else if(rm.type==='kitchen'){
      const front=[0x3a4a5a,0xe9e4da,0x6f8f7f,0xb8c6cc,0xd8c9a6][(n+f)%5], top=[0xd8d2c4,0x2a2c2e,0xe8e2d4][(n+f)%3], sd=s0.side, len=sd==='S'||sd==='N'?r[1]-r[0]:r[3]-r[2], L2=Math.min(s0.free,len-0.2);
      A.inRoom(k,function(){const along=sd==='S'||sd==='N', c0=(along?r[0]:r[2])+0.1, cx=along?(sd==='S'?r[2]+0.31:r[3]-0.31):(sd==='W'?r[0]+0.31:r[1]-0.31), u0=c0+(s0.t*len-L2/2), u1=u0+L2;
        const B=function(w,h,d,col,u,y,o){if(along) A.box(w,h,d,col,u,y,cx+o,p); else A.box(d,h,w,col,cx+o,y,u,p);}, sgn=(sd==='S'||sd==='W')?1:-1;
        B(L2,0.86,0.6,front,(u0+u1)/2,0.43,0); B(L2+0.02,0.04,0.64,top,(u0+u1)/2,0.88,0.01*sgn);
        B(0.5,0.02,0.4,0xc4c8ca,u0+L2*0.35,0.905,0.04*sgn); B(0.52,0.012,0.52,0x111213,u0+L2*0.72,0.907,0.03*sgn);
        if(L2>1.8) B(0.66,1.85,0.68,0xeceeed,u1-0.36,0.925,0.02*sgn);
        B(L2,0.7,0.35,front,(u0+u1)/2,1.85,-0.13*sgn);});
      put(p,k,'fruitBowl',0,(r[0]+r[1])/2,(r[2]+r[3])/2,1,0,0);}
    else if(rm.type==='bath'||rm.type==='wc'){
      A.inRoom(k,function(){const cx=(r[0]+r[1])/2, cz=(r[2]+r[3])/2, wx=r[1]-r[0], wz=r[3]-r[2];
        if(rm.type==='bath'&&Math.max(wx,wz)>1.7){if(wx>=wz){A.box(1.6,0.56,0.72,0xf4f4f2,r[0]+0.85,0.28,r[2]+0.4,p); A.box(1.5,0.02,0.6,0xd8e6ea,r[0]+0.85,0.55,r[2]+0.4,p);}
          else{A.box(0.72,0.56,1.6,0xf4f4f2,r[0]+0.4,0.28,r[2]+0.85,p); A.box(0.6,0.02,1.5,0xd8e6ea,r[0]+0.4,0.55,r[2]+0.85,p);}}
        const tx=r[1]-0.32, tz=r[3]-0.4; A.box(0.38,0.4,0.5,0xf8f8f6,tx,0.2,tz,p); A.box(0.4,0.04,0.44,0xffffff,tx,0.42,tz,p); A.box(0.16,0.42,0.4,0xf8f8f6,tx+0.15,0.62,tz,p);      // the toilet
        A.box(0.5,0.16,0.4,0xf8f8f6,r[1]-0.25,0.82,r[2]+Math.min(wz*0.5,1.0),p); A.box(0.03,0.6,0.5,0xdfe9ec,r[1]-0.03,1.45,r[2]+Math.min(wz*0.5,1.0),p);});}      // the basin and its mirror
    else if(rm.type==='hall'){if(s0.free>0.9){const sc=choose(rng,['hemnesShoe','bissa','shoeCab','tjusig']); against(p,k,r,s0.side,s0.t,sc,colOf(rng,sc));} if(rm.id===ds.room.id) put(p,k,'doormat',0,ds.ix,ds.iz,1,0);}
  });
  p.traverse(function(m){m.userData.lvl=f; if(m.isMesh&&!f&&m.material&&!Array.isArray(m.material)&&!m.userData.floor) m.material.clippingPlanes=[A.cut];});      // on our floor, cut with the rest when the walls are cut low
}
/* the common parts upstairs: the landing as wide as ours, the corridor and the hall over the entrance: floors, ceilings, the landing's walls
   (the flats' own walls stand along the rest) */
const coreBuilt={};
function buildCore(f){
  if(coreBuilt[f]||f<1) return; coreBuilt[f]=true;
  const g=groupFor(f), p=new THREE.Group(); p.position.y=LV[f].y; g.add(p); const k='land'+f, list=planWalls[f]=planWalls[f]||[], wc=0xf3f1ea, XL=LB.XL, D4=LB.D4, RZ=LB.RZ, CX0=LB.CX0, CX1=LB.CX1, ZE=LB.ZE, ZC=LB.ZC, XF=LB.XF;
  const terr=tex('terr',128,128,tiles('#e2d6b8','#b3a37f',4),[1,1]);
  [[XL,XB,L+D4,RZ],[CX0,CX1,EH,ZE],[CX0,XF,ZE,ZC]].forEach(function(r){floorPlane(p,r[0],r[1],r[2],r[3],tex('terr',128,128,tiles('#e2d6b8','#b3a37f',4),[(r[1]-r[0])/0.8,(r[3]-r[2])/0.8]),k); ceilPlane(p,r[0],r[1],r[2],r[3],k);});
  const d3=doorSpec(3,f), d4=doorSpec(4,f), d2=doorSpec(2,f), d6=doorSpec(6,f), d1=doorSpec(1,f);
  wallRun(p,f,XL,L+D4,XL,RZ,wc,k,[[d3.u0-(L+D4),d3.u1-(L+D4),0,2.05]],list);                         // flat 3's door, on the landing's back wall
  wallRun(p,f,XL,L+D4,XB+0.08,L+D4,wc,k,[[d4.u0-XL,d4.u1-XL,0,2.05]],list); wallRun(p,f,XB+0.08,L+D4,XB+0.08,L,wc,k,[],list);      // flat 4's beside ours, a little in front of it
  wallRun(p,f,XL,RZ,CX0,RZ,wc,k,[],list);
  wallRun(p,f,CX0,RZ,CX0,ZC,wc,k,[[d2.u0-RZ,d2.u1-RZ,0,2.05]],list);                                  // the corridor's left: flat 2's door
  wallRun(p,f,CX1,EH,CX1,ZE,wc,k,[[d6.u0-EH,d6.u1-EH,0,2.05]],list);                                  // its right: flat 6's
  wallRun(p,f,CX0,ZC,XF,ZC,wc,k,[[d1.u0-CX0,d1.u1-CX0,0,2.05]],list);                                 // the hall's end: flat 1's
  wallRun(p,f,CX1,ZE,XF-0.06,ZE,wc,k,[],list);
  wallRun(p,f,XF,ZE,XF,ZC,wc,k,[],list);      // its front: over the passage below, between flat 6 and number 12, there is nothing to look out at
  A.inRoom(k,function(){A.kit.ceilDisc(p,(CX0+CX1)/2,(RZ+ZE)/2,'L:'+k); A.kit.ceilDisc(p,(CX0+XF)/2,(ZE+ZC)/2,'L:'+k);});
  p.traverse(function(m){m.userData.lvl=f;});
}
/* the shelter, under the lobby: concrete, a steel door, bunks, benches, the ventilation unit, water and tins */
let shelterBuilt=false;
function buildShelter(){
  if(shelterBuilt) return; shelterBuilt=true;
  const g=groupFor(-1), p=new THREE.Group(); p.position.y=LO; g.add(p); const k='shelter', r=SH, list=planWalls[-1]=[];
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

/* =====================================================================
   The neighbours, and what happens when you let yourself in
   ===================================================================== */
/* ---------- sounds, made here: a knock, the clicks of a pick, a kick, coins, a siren ---------- */
let ac=null;
function actx(){if(!ac){try{ac=new (window.AudioContext||window.webkitAudioContext)();}catch(e){ac=null;}} if(ac&&ac.state==='suspended') ac.resume(); return ac;}
function thud(t,f,vol,len){const c=actx(); if(!c) return; const o=c.createOscillator(), g=c.createGain(); o.type='sine'; o.frequency.setValueAtTime(f,c.currentTime+t); o.frequency.exponentialRampToValueAtTime(f*0.5,c.currentTime+t+len);
  g.gain.setValueAtTime(0.0001,c.currentTime+t); g.gain.exponentialRampToValueAtTime(vol,c.currentTime+t+0.005); g.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+t+len); o.connect(g).connect(c.destination); o.start(c.currentTime+t); o.stop(c.currentTime+t+len+0.02);}
function noise(t,len,vol,hp){const c=actx(); if(!c) return; const n=Math.floor(c.sampleRate*len), b=c.createBuffer(1,n,c.sampleRate), d=b.getChannelData(0); for(let i=0;i<n;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/n,3);
  const s=c.createBufferSource(), g=c.createGain(), fl=c.createBiquadFilter(); fl.type='highpass'; fl.frequency.value=hp||800; s.buffer=b; g.gain.value=vol; s.connect(fl).connect(g).connect(c.destination); s.start(c.currentTime+t);}
const SND={
  knock:function(){[0,0.18,0.36].forEach(function(t){thud(t,140,0.5,0.12); noise(t,0.05,0.15,600);});},
  pick:function(){for(let i=0;i<5;i++) noise(i*0.13+Math.random()*0.05,0.025,0.25,3000);},
  kick:function(){thud(0,90,0.9,0.3); noise(0,0.25,0.5,200);},
  crash:function(){thud(0,70,1,0.5); noise(0,0.6,0.6,150); noise(0.15,0.4,0.3,1200);},
  coin:function(){[0,0.08].forEach(function(t,i){const c=actx(); if(!c) return; const o=c.createOscillator(), g=c.createGain(); o.type='triangle'; o.frequency.value=i?1568:1175; g.gain.setValueAtTime(0.18,c.currentTime+t); g.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+t+0.35); o.connect(g).connect(c.destination); o.start(c.currentTime+t); o.stop(c.currentTime+t+0.4);});},
  bell:function(){[0,0.35].forEach(function(t,i){const c=actx(); if(!c) return; const o=c.createOscillator(), g=c.createGain(); o.type='sine'; o.frequency.value=i?659:830; g.gain.setValueAtTime(0.2,c.currentTime+t); g.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+t+0.6); o.connect(g).connect(c.destination); o.start(c.currentTime+t); o.stop(c.currentTime+t+0.7);});}
};
let siren=null;
function sirenOn(on){const c=actx(); if(!c) return;
  if(on&&!siren){const o=c.createOscillator(), lfo=c.createOscillator(), lg=c.createGain(), g=c.createGain(); o.type='sawtooth'; o.frequency.value=780; lfo.frequency.value=0.55; lg.gain.value=180;
    lfo.connect(lg).connect(o.frequency); const fl=c.createBiquadFilter(); fl.type='lowpass'; fl.frequency.value=1800; g.gain.value=0.0001; o.connect(fl).connect(g).connect(c.destination); o.start(); lfo.start(); siren={o:o,lfo:lfo,g:g};}
  if(siren) siren.g.gain.setTargetAtTime(on?0.05:0.0001,c.currentTime,0.6);
  if(!on&&siren){const s=siren; siren=null; setTimeout(function(){try{s.o.stop(); s.lfo.stop();}catch(e){}},2500);}
}

/* ---------- on the stage: how wanted you are, what you have taken ---------- */
const hud=document.createElement('div'); hud.id='gtaHud';
hud.style.cssText='position:absolute;left:50%;top:calc(52px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:3;display:none;gap:10px;align-items:center;background:rgba(23,33,28,.82);color:#fff;font:700 14px/1 inherit;padding:7px 14px;border-radius:99px;letter-spacing:.02em;pointer-events:none';
A.stage.appendChild(hud);
const G={wanted:0,loot:0,heat:0,cops:[],callAt:0,since:0,safeT:0,busted:false,taken:[]};
function drawHud(){
  const on=A.simsOn&&(G.wanted>0||G.loot>0); hud.style.display=on?'flex':'none'; if(!on) return;
  let s=''; if(G.wanted>0) s+='<span style="color:#f4d53a">'+'★'.repeat(G.wanted)+'<span style="opacity:.3">'+'★'.repeat(Math.max(0,3-G.wanted))+'</span></span>';
  if(G.loot>0) s+='<span>₪ '+G.loot.toLocaleString('en')+'</span>'; if(G.cops.length) s+='<span style="color:#9fc4ff">'+(G.cops.length>1?'Police in the building':'Police on the way')+'</span>';
  hud.innerHTML=s;
}

/* ---------- who lives where ---------- */
const NAMES_HE=[['Ronit',1],['Moshe',0],['Dana',1],['Avi',0],['Shira',1],['Yossi',0],['Tamar',1],['Eli',0],['Noa',1],['Itzik',0],['Galit',1],['Uri',0],['Miri',1],['Benny',0]];
const SKIN=[0xe6b592,0xdfae88,0xc99a72,0xe8bfa0,0x8a5a3c,0xd9a47f,0xf0c8a8], HAIR=[0x2a1e17,0x5a3a22,0x1b1512,0xb5803f,0x8a8a86,0x3a2a1c], TOPS=[0x9fc4d6,0xc4673f,0x26386b,0x8fbd9b,0xe8c91a,0xd9463e,0xf3ebdc,0x6f7f75,0x7d5a8a];
function person(seed){const r=A.rng(seed), n=NAMES_HE[Math.floor(r()*NAMES_HE.length)], she=!!n[1];
  return {id:'n'+seed,name:n[0],h:she?1.6+r()*0.1:1.72+r()*0.12,skin:SKIN[Math.floor(r()*SKIN.length)],hair:HAIR[Math.floor(r()*HAIR.length)],style:she?['curly','long'][Math.floor(r()*2)]:['short','bald','short'][Math.floor(r()*3)],
    beard:!she&&r()<0.4?['goatee','full'][Math.floor(r()*2)]:undefined,top:TOPS[Math.floor(r()*TOPS.length)],pants:[0x2b2f38,0x3d5a80,0x6b6f76,0xf3ebdc][Math.floor(r()*4)],pj:0x9db7dd,slim:she};}
/* each flat: its door, its rooms, who lives there, and whether they are in */
const FLATS={};
/* a flat's key: 'over'+f, the flat over ours (5 on each floor); 'f'+n+'@'+f, flat n of the plan on floor f; 'shelter' */
function flatOf(key){
  if(FLATS[key]) return FLATS[key];
  const plan=key[0]==='f', pn=plan?+key.slice(1,key.indexOf('@')):5, f=key==='shelter'?-1:plan?+key.slice(key.indexOf('@')+1):+key.slice(-1), rng=A.rng(key.length*31+f*7+pn*13);
  const rooms=key==='shelter'?['shelter']:plan?PL.analyse(pn).rooms.map(function(q){return proom(pn,f,q.id);}):FLAT.map(function(k){return k+'@'+f;});
  const n=key==='shelter'?0:1+Math.floor(rng()*(pn===1||pn===2||pn===3||pn===6?3:2)), home=key!=='shelter'&&rng()<0.85;
  const people=[]; for(let i=0;i<n;i++) people.push(person(f*100+pn*17+i*7+3));
  return FLATS[key]={key:key,f:f,n:pn,plan:plan,num:key==='shelter'?0:NUMOF(pn,f),rooms:rooms,people:people,home:home,folk:[],broken:false,searched:{},invited:false,door:doors[key]};
}
function inFlatOf(fl,a){const r=A.roomAt(a.x,a.z,a.lvl); return fl.rooms.indexOf(r)>=0;}
function playerIn(fl){const p=A.player; return p&&p.lvl===fl.f&&!p.script&&inFlatOf(fl,p);}
function randomSpot(fl){const k=fl.rooms[Math.floor(Math.random()*fl.rooms.length)], r=A.rooms[k].rs[0]; return [r[0]+0.5+Math.random()*Math.max(0.1,r[1]-r[0]-1),r[2]+0.5+Math.random()*Math.max(0.1,r[3]-r[2]-1)];}
function settleIn(fl){            // the people of a flat, at home, somewhere inside
  if(!fl.home||fl.folk.length||!A.sims) return;
  fl.people.forEach(function(spec){const a=new A.sims.Actor(spec); a.lvl=fl.f; a.speed=1.0; const s=randomSpot(fl);
    const c=A.sims.onLevel(fl.f,function(){return A.sims.nearestXZ(s[0],s[1]);}), mine=c&&fl.rooms.indexOf(A.roomAt(c[0],c[1],fl.f))>=0&&Math.hypot(c[0]-s[0],c[1]-s[1])<1.5;
    a.x=mine?c[0]:s[0]; a.z=mine?c[1]:s[1]; a.next=A.t+2+Math.random()*6; a.flat=fl; fl.folk.push(a);      // behind a locked door their rooms are not on the walking map: they stay put inside, not at the nearest open spot
    const st=Math.random()<0.55?seatFor(fl,fl.folk.length-1):null;      // on the sofa or in an armchair: reading, a drink, the laptop, the television
    if(st){a.x=st.x; a.z=st.z; a.h=a.hT=st.h; a.p.seatY=st.y; a.p.sitT=a.p.sit=1; a.sitting=true; a.p.act=['read',null,'drink','type',null][Math.floor(Math.random()*5)];}});
}
function seatFor(fl,i){
  const f=fl.f; if(f<0||(f<1&&!fl.plan)) return null;
  if(!fl.plan){const ss=(A.liveSeats?A.liveSeats():[]).filter(function(s){return s.type==='sit'&&['living','kitchen','bed1','bed2'].indexOf(A.roomAt(s.x,s.z,0))>=0;}); const s=ss[(i*3+f)%Math.max(1,ss.length)]; return s?{x:s.x,z:s.z,h:s.h,y:s.y}:null;}      // over ours: the same furniture where ours stands
  const out=[], v=new THREE.Vector3(); if(lvlGroups[f]) lvlGroups[f].traverse(function(o){if(o.userData&&(o.userData.cat==='arm'||o.userData.cat==='chair')){o.getWorldPosition(v); if(fl.rooms.indexOf(A.roomAt(v.x,v.z,f))>=0) out.push({x:v.x,z:v.z,h:o.rotation.y+R/2,y:0.45});}});
  return out.length?out[i%out.length]:null;}
function onMap(a){return A.sims.onLevel(a.lvl,function(){return A.sims.isFree(a.x,a.z);});}      // their rooms are walkable: the door is open, or it is upstairs and reachable
function wander(a){if(a.busy||a.path.length||a.script||(a.sitting&&a.p.sitT>0)) return; if(A.t<a.next) return; a.next=A.t+6+Math.random()*9; if(!onMap(a)) return;
  const s=randomSpot(a.flat); a.goTo(s[0],s[1]);}

/* ---------- at the door ---------- */
const LINES_ANSWER=['Yes?','Hi! Can I help you?','Oh, hello neighbour.','Who is it?','Shalom, what is it?'];
const LINES_CHAT=['The lift? There has never been a lift.','Did you hear the cats last night?','The committee wants 200 shekels for the stairwell again.','You are from five, right? The one with the green door.','Hot today, eh? Thirty-two.','My son lives in Haifa now.'];
const LINES_ANGRY=['Hey! What are you doing in my flat?!','Thief! Get out!','I am calling the police!','Mishtara! Police!'];
function doorPos(fl){if(fl.plan){const s=doorSpec(fl.n,fl.f); return {x:s.ix,z:s.iz,ox:s.ox,oz:s.oz,h:s.h};}      // inside, outside, and facing out
  return fl.key==='shelter'?{x:XB-0.55,z:(LDW[0]+LDW[1])/2,ox:XB+0.6,oz:(LDW[0]+LDW[1])/2,h:R/2}:{x:(LDS[0]+LDS[1])/2,z:L-0.55,ox:(LDS[0]+LDS[1])/2,oz:L+0.6,h:0};}
function answer(fl){            // someone comes to the door, opens it a little, and talks
  const a=fl.folk[0], d=fl.door, dp=doorPos(fl); if(!a) return;
  a.busy=true; const there=function(){a.hT=dp.h+R; d.force=0.45; a.say(LINES_ANSWER[Math.floor(Math.random()*LINES_ANSWER.length)],2.6); fl.atDoor=A.t+14; G.answered=fl; refreshBar();};
  if(onMap(a)) a.goTo(dp.x,dp.z,there); else{a.release(); a.path=[[dp.x,dp.z]]; a.cb=there;}      // behind the shut door: straight across their own hall to it
}
function closeUp(fl){const d=fl.door; if(!fl.broken&&!fl.invited) d.force=null; d.target=0; const a=fl.folk[0]; if(a){a.busy=false; a.next=A.t+3;} if(G.answered===fl) G.answered=null; refreshBar();}
function knock(fl){
  const S=A.sims; SND.knock(); A.player.p.act='reach'; S.later(0.8,function(){A.player.p.act=null;});
  if(fl.key==='shelter'){S.toast('Knock knock. Just the echo.'); return;}
  if(!fl.home){S.toast('Knock knock… nobody answers.'); return;}
  settleIn(fl); S.toast('Footsteps inside…'); S.later(1.5,function(){answer(fl);});
}
function ring(fl){SND.bell(); if(!fl.home){A.sims.toast('The bell rings inside. Nobody comes.'); return;} settleIn(fl); A.sims.later(1.2,function(){answer(fl);});}
function chat(fl){const a=fl.folk[0]; if(!a) return; A.player.say(['Hi! I live downstairs.','Do you have a bit of sugar?','Nice weather, eh?','Have you seen a parcel for flat 5?'][Math.floor(Math.random()*4)],2.4);
  A.sims.later(2.4,function(){a.say(LINES_CHAT[Math.floor(Math.random()*LINES_CHAT.length)],3.2); fl.atDoor=A.t+12;
    if(!fl.invited&&Math.random()<0.45) A.sims.later(3.4,function(){a.say('Come in, come in! I just made coffee.',2.8); fl.invited=true; fl.door.locked=false; fl.door.force=null; A.navDirty(fl.f); a.busy=false; refreshBar();});});}
function bye(fl){A.player.say('Sorry, wrong door!',1.8); A.sims.later(1.6,function(){closeUp(fl);});}

/* ---------- letting yourself in ---------- */
function notice(fl,how){            // somebody heard, or saw: they shout, and call the police
  const a=fl.folk.find(function(x){return !x.gone;});
  if(a){a.busy=true; a.say(LINES_ANGRY[Math.floor(Math.random()*LINES_ANGRY.length)],2.6); A.sims.later(2.8,function(){a.say('Hello, police? Someone is breaking into flat '+fl.num+'!',3.2);});}
  else A.sims.toast(how==='kick'?'A neighbour across the landing heard the crash. They are calling the police.':'Someone downstairs heard you.');
  raise(how==='kick'?2:1);
}
function openUp(fl,how){
  const d=fl.door; fl.broken=true; d.locked=false; d.force=null; A.navDirty(fl.f);
  if(how==='kick'){d.cur=1; d.p.rotation.y=d.closed+(d.open-d.closed)*0.94; SND.crash(); d.force=1; d.p.children.forEach(function(m){if(m.isMesh) m.rotation.z=0.06;});}
  else{d.target=1; d.force=1;}
  A.sims.toast(how==='kick'?'The door flies open.':'Click. The lock gives.'); refreshBar();
  if(fl.home){settleIn(fl); A.sims.later(1.2,function(){notice(fl,how);});}
  else if(how==='kick'&&Math.random()<0.5) A.sims.later(4,function(){notice(fl,'kick');});
}
function pick(fl){
  const S=A.sims, p=A.player, dp=doorPos(fl); S.stop(); S.setDoing('picking the lock');
  p.goTo(dp.ox,dp.oz,function(){p.hT=dp.h+R; p.p.act='reachlow'; let k=0;
    const step=function(){if(!G.picking) return; k++; SND.pick(); S.setDoing('picking the lock… '+Math.min(100,k*20)+'%');
      if(fl.home&&Math.random()<0.12){G.picking=false; p.p.act=null; S.setDoing(''); settleIn(fl); notice(fl,'pick'); return;}
      if(k>=5){G.picking=false; p.p.act=null; S.setDoing(''); if(Math.random()<0.8) openUp(fl,'pick'); else {S.toast('The pick slips. Try again.'); if(fl.home&&Math.random()<0.5){settleIn(fl); notice(fl,'pick');}} return;}
      S.later(0.9,step,G);};
    G.picking=true; S.later(0.6,step,G);});
}
function kick(fl){
  const S=A.sims, p=A.player, dp=doorPos(fl); S.stop(); S.setDoing('kicking the door');
  p.goTo(dp.ox,dp.oz,function(){p.hT=dp.h+R; let k=0;
    const step=function(){k++; p.p.act='reach'; SND.kick(); S.later(0.35,function(){p.p.act=null;}); A.touch(2);
      if(k<3) S.later(0.8,step); else {S.setDoing(''); openUp(fl,'kick');}};
    step();});
}
/* what there is to find in a flat */
const FINDS=[['a wad of shekel notes',[150,600]],['a gold necklace',[800,2400]],['an old iPhone',[300,700]],['a jar of coins',[40,140]],['a PlayStation',[900,1500]],['a bottle of Arak',[60,90]],
  ['a watch',[400,1800]],['a laptop',[1500,3200]],['a passport (you put it back)',[0,0]],['nothing but socks',[0,0]],['a stack of lottery tickets',[5,40]],['a camera',[600,1400]]];
function spots(fl){
  const y=LV[fl.f].y; if(fl.key==='shelter') return [];
  if(fl.plan){const out=[], NM={bed:'Wardrobe',kitchen:'Kitchen drawers',living:'Shelves',bath:'Bathroom cabinet',hall:'Shoe cabinet'};      // in each room, the place you would look
    PL.analyse(fl.n).rooms.forEach(function(q){const nm=NM[q.type]; if(!nm) return; const r=q.r, cx=(r[0]+r[1])/2, cz=(r[2]+r[3])/2, wide=r[1]-r[0]>r[3]-r[2];
      out.push([nm+(q.type==='bed'&&out.some(function(o){return o[0]===nm;})?' ':''),q.id,wide?cx:r[0]+0.75,wide?r[2]+0.75:cz,wide?R:-R/2]);}); return out;}
  return [['Wardrobe','bed2',D.NX+0.95,-1.27,-R/2],['Desk','bed1',1.2,-2.4,R],['Kitchen drawers','kitchen',A.KL.dx,1.25,R],['TV cabinet','living',2.4,4.2,R/2],['Bedside table','bed2',3.6,-3.0,R]];
}
function search(fl,s){
  const S=A.sims, p=A.player; S.stop(); S.setDoing('going through the '+s[0].toLowerCase());
  p.goTo(s[2],s[3],function(){p.hT=s[4]; p.p.act='reachlow'; S.later(1.8,function(){p.p.act=null; S.setDoing('');
    const k=fl.key+'|'+s[0]+'|'+s[1]; fl.searched[k]=true; const fd=FINDS[Math.floor(Math.random()*FINDS.length)], v=fd[1][0]+Math.floor(Math.random()*(fd[1][1]-fd[1][0]+1));
    if(v>0){G.loot+=v; G.taken.push(fd[0]); SND.coin(); S.toast('You found '+fd[0]+'. ₪ '+v+'.');} else S.toast('You found '+fd[0]+'.');
    drawHud(); refreshBar();
    if(fl.home&&fl.folk.some(function(a){return !a.gone&&Math.hypot(a.x-p.x,a.z-p.z)<4;})&&G.wanted===0) notice(fl,'pick');});});
}

/* ---------- the police ---------- */
const COPSPEC=function(i){return {id:'cop'+i,name:i?'Officer Levi':'Officer Cohen',h:1.78,skin:i?0xc99a72:0xe4b594,hair:0x1b1512,style:'short',top:0x1f3a6b,pants:0x1d2a44,pj:0x1f3a6b,shoes:0x111111};};
function raise(n){
  const was=G.wanted; G.wanted=Math.min(5,Math.max(G.wanted,n)); G.since=A.t; drawHud();      // up to five stars, as in GTA
  if(!was&&G.wanted){A.sims.toast('★ Wanted. The police are on their way.'); if(!(A.gtaCops&&A.gtaCops.outside())) sirenOn(true); G.callAt=A.t+(G.wanted>1?16:24);}      // out in the streets their cars bring their own sirens
}
function spawnCops(){
  if(G.cops.length) return; const n=G.wanted>1?2:1;
  for(let i=0;i<n;i++){const a=new A.sims.Actor(COPSPEC(i)); a.lvl=0; a.speed=1.55; a.x=LB.XF-0.8-i*0.5; a.z=LB.ZO; a.cop=true; a.state='hunt'; a.next=0; G.cops.push(a);}
  A.sims.toast('The police are here. Two officers coming up the stairs.'.replace('Two officers',n>1?'Two officers':'An officer')); drawHud();
}
function home(p){return !p.lvl&&FLAT.indexOf(p.room)>=0;}
function huntStep(c){
  const p=A.player; if(c.script||c.busy) return;
  if(A.t<c.next) return; c.next=A.t+1.2;
  if(c.leaving){if(!c.path.length) {c.goTo(LB.XF-0.6,LB.ZO,function(){c.gone=true;});} return;}
  const tl=p.script?p.script.lvl:p.lvl;
  if(c.lvl!==tl){            // to the stairs, and up or down a floor
    const pts=A.stairsPath(c.lvl,c.lvl+(tl>c.lvl?1:-1)); c.goTo(pts[0][0],pts[0][2],function(){c.climb(pts,c.lvl+(tl>c.lvl?1:-1));}); c.next=A.t+3; return;}
  if(home(p)){                // shut in at home: they knock on our door and wait
    const d=A.door('entrance'); c.goTo(D.entrance[0]+0.4,L+0.7,function(){c.hT=R; if(A.t>(c.shout||0)){c.shout=A.t+5; c.say(['Police! Open the door!','We know you are in there!','Open up, please.'][Math.floor(Math.random()*3)],2.6); SND.knock();}});
    if(!G.safeT) G.safeT=A.t; if(A.t-G.safeT>24) giveUp(); return;}
  G.safeT=0;
  c.goTo(p.x,p.z);
}
function giveUp(){A.sims.toast('The police leave. You got away with it… this time.'); G.wanted=0; sirenOn(false); G.cops.forEach(function(c){c.leaving=true; c.next=0;}); drawHud();}
function busted(){
  if(G.busted) return; if(A.drive&&A.drive.on()) A.drive.exit(true); G.busted=true; const S=A.sims, p=A.player; S.stop(); sirenOn(false);
  G.cops.forEach(function(c){c.say('Hands where I can see them!',2.4);}); p.p.act='wave';
  S.later(2.6,function(){
    const lost=G.loot; G.loot=0; G.wanted=0; G.taken=[]; G.busted=false; p.p.act=null;
    G.cops.forEach(function(c){c.remove();}); G.cops=[]; drawHud();
    p.script=null; p.path=[]; p.lvl=0; const c=S.nearestXZ(1.5,3.2)||[S.EX,S.SPAWN]; p.x=c[0]; p.z=c[1]; p.h=p.hT=R; if(S.flyToPlayer) S.flyToPlayer();      // home, in the living room
    S.toast('Busted. A night at the station and a fine'+(lost?', and the ₪ '+lost.toLocaleString('en')+' goes back.':'.'));
    for(const k in FLATS){const fl=FLATS[k]; if(fl.broken){fl.door.p.children.forEach(function(m){if(m.isMesh) m.rotation.z=0;});}}
  });
}

/* ---------- every frame: the neighbours live, the police hunt ---------- */
const tagV=new THREE.Vector3(); let settled0=false;
A.frameFns.push(function(dt){
  const p=A.player;
  if(!A.simsOn||!p){for(const k in FLATS) FLATS[k].folk.forEach(function(a){a.p.g.visible=false; A.place(a.tag,tagV,false);});
    if(G.cops.length||G.wanted){G.cops.forEach(function(c){c.remove();}); G.cops=[]; G.wanted=0; sirenOn(false);} hud.style.display='none'; return;}
  const lv=shownLvl;
  if(!settled0){settled0=true; PF.forEach(function(n){settleIn(flatOf(pkey(n,0)));});}      // the neighbours on our floor, at home
  for(const k in FLATS){const fl=FLATS[k];
    if(fl.atDoor&&A.t>fl.atDoor&&G.answered===fl) closeUp(fl);
    if(fl.invited&&!playerIn(fl)&&fl.door.target===0&&A.t>(fl.atDoor||0)+30){fl.invited=false; fl.door.locked=true; A.navDirty(fl.f);}      // you left: they lock up behind you
    fl.folk.forEach(function(a){const here=a.lvl===lv; a.p.g.visible=here;
      if(here){wander(a); a.update(dt); if(fl.broken&&playerIn(fl)&&!a.angry&&Math.hypot(a.x-p.x,a.z-p.z)<(a.sitting?7:5)){a.angry=true; if(a.sitting){a.sitting=false; a.p.sitT=0; a.p.act=null;} a.hT=Math.atan2(p.x-a.x,p.z-a.z); notice(fl,'pick');}}});
  }
  const outside=A.gtaCops&&A.gtaCops.outside();      // out in the streets the police there (gta-cops.js) take over; these come up the stairs
  if(G.wanted&&!G.cops.length&&A.t>G.callAt&&!outside) spawnCops();
  if(G.wanted&&A.t-G.since>150&&!outside) giveUp();                      // a long while without trouble: they stop looking
  for(let i=G.cops.length-1;i>=0;i--){const c=G.cops[i];
    if(c.gone){c.remove(); G.cops.splice(i,1); if(!G.cops.length) drawHud(); continue;}
    huntStep(c); c.update(dt); c.p.g.visible=c.lvl===lv||!!c.script;
    if(!c.leaving&&!G.busted&&c.lvl===p.lvl&&!c.script&&!p.script&&Math.hypot(c.x-p.x,c.z-p.z)<0.9) busted();}
  [].concat(...Object.values(FLATS).map(function(fl){return fl.folk;}),G.cops).forEach(function(a){a.headPos(tagV); tagV.y+=0.28;
    A.place(a.tag,tagV,A.state.labels&&a.p.g.visible&&!a.bubble); if(a.bubble) A.place(a.bubble,tagV,a.p.g.visible);});
});

/* ---------- the bar that pops up by things: the doors, the people, the places to search ---------- */
let barT=0;
function refreshBar(){barT++; if(A.life&&A.life.hud) A.life.hud();}
function doorActs(fl){
  if(fl.key==='shelter'){return [['Go in',function(){A.walkTo(XB-1.2,(LDW[0]+LDW[1])/2);}]];}
  if(!fl.door.locked) return [['Go in',function(){const dp=doorPos(fl); A.walkTo(dp.x,dp.z);}]];
  const acts=[];
  if(G.answered===fl){acts.push(['Chat',function(){chat(fl);}]); acts.push(['Sorry, wrong door',function(){bye(fl);}]); return acts;}
  acts.push(['Knock',function(){knock(fl);}],['Ring the bell',function(){ring(fl);}],['Pick the lock',function(){pick(fl);}],['Kick it in',function(){kick(fl);}]);
  return acts;
}

/* ---------- which floor is drawn, and everything above it cut away ---------- */
const clip=new THREE.Plane(new THREE.Vector3(0,-1,0),1e6);
let clipping=false, shownLvl=0;
const segHit=function(ax,az,bx,bz,cx_,cz_,dx,dz){const r1=bx-ax, r2=bz-az, s1=dx-cx_, s2=dz-cz_, den=r1*s2-r2*s1; if(Math.abs(den)<1e-9) return false;
  const t=((cx_-ax)*s2-(cz_-az)*s1)/den, u=((cx_-ax)*r2-(cz_-az)*r1)/den; return t>0.02&&t<0.98&&u>=0&&u<=1;};
const wantHide=[];           // what stands in the way when you are down in the shelter
A.hideBelow=function(o){wantHide.push(o);};
let shut0=false;
A.frameFns.push(function(){      // the whole building seen from outside hides the flats round ours behind its walls: they are not drawn then
  const w=!!(A.bldWhole&&A.bldWhole()); if(w!==shut0){shut0=w; ground0.forEach(function(p){p.visible=!w;});}});
A.frameFns.push(function(){
  const p=A.player, on=A.simsOn&&p;
  let lv=0; if(on){lv=p.lvl||0; if(p.script) lv=Math.max(lv,p.script.lvl);}
  if(lv!==shownLvl){shownLvl=lv; for(const f in lvlGroups) lvlGroups[f].visible=+f===lv;
    wantHide.forEach(function(o){o.visible=lv>=0;}); A.touch(3);}
  /* in Sims mode the walls, the stairwell and the landings are cut at the ceiling of the floor you are on, so the flights above never stand
     between the camera and you; out of it, the Design tab's own setting */
  const cutAt=on?(lv?LV[lv].y:0)+H+0.05:($('cCut')&&$('cCut').checked?1.25:100); if(A.cut.constant!==cutAt){A.cut.constant=cutAt; A.touch(2);}
  if(lv){clip.constant=LV[lv].y+H+0.03; if(!clipping||A.renderer.clippingPlanes[0]!==clip){A.renderer.clippingPlanes=[clip]; clipping=true;}}
  else if(clipping){if(A.renderer.clippingPlanes[0]===clip) A.renderer.clippingPlanes=[]; clipping=false;}
  if(lv&&A.sims&&A.sims.camMode==='follow'){const c=A.camera.position;
    (upWalls[lv]||[]).forEach(function(w){const front=(c.x-w.a[0])*w.n[0]+(c.z-w.a[1])*w.n[1]>0; w.g.visible=!(front&&segHit(c.x,c.z,p.x,p.z,w.a[0],w.a[1],w.b[0],w.b[1]));});
    (planWalls[lv]||[]).forEach(function(w){const hide=segHit(c.x,c.z,p.x,p.z,w.a[0],w.a[1],w.b[0],w.b[1]); for(let i=0;i<w.parts.length;i++) w.parts[i].visible=!hide;});}
  else if(lv&&A.sims&&A.sims.camMode==='eye'){(upWalls[lv]||[]).forEach(function(w){w.g.visible=true;}); (planWalls[lv]||[]).forEach(function(w){w.parts.forEach(function(m){m.visible=true;});});}
});

/* ---------- what you can do on the stairs and at the doors (the bar that pops up by things in Sims mode) ---------- */
function goStairs(dir){
  const p=A.player, S=A.sims; if(!p||p.script) return;
  const from=p.lvl||0, to=from+dir; if(to<-1||to>UPS) return;
  if(LV[to]&&to>0&&!built[to]){buildOver(to); buildCore(to); PF.forEach(function(n){buildFlat(n,to);}); A.navDirty(to); settleIn(flatOf('over'+to)); PF.forEach(function(n){settleIn(flatOf(pkey(n,to)));});}
  if(to===-1&&!shelterBuilt){buildShelter(); A.navDirty(-1);}
  const pts=path(from,to);
  S.stop(); S.setDoing(dir>0?'going upstairs':'going downstairs');
  p.goTo(pts[0][0],pts[0][2],function(){
    p.climb(pts,to,function(){S.setDoing(''); S.toast(to===0?'Back on our floor.':NAMES[to]+'.'); if(A.unfightSoon) A.unfightSoon(100);});});
}
A.goStairs=goStairs;
A.moreItems=function(out,p){
  const f=p.lvl||0, y=f?LV[f].y:0;
  const st=f===0?{x:SU-0.05,z:L+1.2,sx:SU-0.35,sz:L+1.0,h:R/2}:{x:SU-0.05,z:(zA+zB)/2,sx:SU-0.4,sz:(zA+zB)/2,h:R/2};
  const acts=[]; if(f<UPS) acts.push([f===-1?'Up to our floor':'Go upstairs',function(){goStairs(1);}]); if(f>-1) acts.push([f===1?'Down to our floor':f===0?'Down to the shelter':'Go downstairs',function(){goStairs(-1);}]);
  out.push({name:'Stairs',x:st.x,z:st.z,y:y+0.8,sx:st.sx,sz:st.sz,h:st.h,acts:acts,box:[SU-0.1,X1,y-0.05,y+1.2,L,L+SW]});
  Object.keys(doors).forEach(function(k){const d=doors[k]; if(d.lvl!==f) return; const fl=flatOf(k);
    if(Math.hypot(d.cx-p.x,d.cz-p.z)>4.5) return;      // only the doors close by
    let x,z,sx,sz,h,box;
    if(fl.plan){const s=doorSpec(fl.n,f), m=(s.u0+s.u1)/2; x=s.side[0]==='x'?s.plane:m; z=s.side[0]==='x'?m:s.plane; sx=s.ox; sz=s.oz; h=s.h+R;
      box=s.side[0]==='x'?[s.plane-0.08,s.plane+0.08,y,y+2.1,s.u0-0.1,s.u1+0.1]:[s.u0-0.1,s.u1+0.1,y,y+2.1,s.plane-0.08,s.plane+0.08];}
    else{const west=k==='shelter'; x=west?XB+0.02:(LDS[0]+LDS[1])/2; z=west?(LDW[0]+LDW[1])/2:L+0.02; sx=west?XB+0.55:x; sz=west?z:L+0.55; h=west?-R/2:R;
      box=west?[XB-0.05,XB+0.1,y,y+2.1,LDW[0]-0.1,LDW[1]+0.1]:[LDS[0]-0.1,LDS[1]+0.1,y,y+2.1,L-0.05,L+0.1];}
    const label=k==='shelter'?'Shelter':'Flat '+fl.num+(fl.broken?' (broken in)':'');
    out.push({name:label,x:x,z:z,y:y+1.0,sx:sx,sz:sz,h:h,acts:doorActs(fl),box:box});});
  for(const k in FLATS){const fl=FLATS[k]; if(fl.f!==f) continue;
    if((fl.broken||fl.invited)&&playerIn(fl)) spots(fl).forEach(function(s){const sk=fl.key+'|'+s[0]+'|'+s[1]; if(fl.searched[sk]) return;
      const bx=s[2], bz=s[3]; out.push({name:s[0],x:bx+Math.sin(s[4])*0.5,z:bz+Math.cos(s[4])*0.5,y:y+0.9,sx:bx,sz:bz,h:s[4],acts:[[fl.invited&&!fl.broken?'Have a look':'Search',function(){search(fl,s);}]]});});
    fl.folk.forEach(function(a){if(a.gone||a.lvl!==f||Math.hypot(a.x-p.x,a.z-p.z)>3) return;
      out.push({name:a.spec.name,x:a.x,z:a.z,y:y+1.0,sx:a.x+Math.sin(a.h)*0.8,sz:a.z+Math.cos(a.h)*0.8,h:a.h+R,acts:[['Chat',function(){a.hT=Math.atan2(p.x-a.x,p.z-a.z); a.say(LINES_CHAT[Math.floor(Math.random()*LINES_CHAT.length)],3.2);}],['Wave',function(){p.p.act='wave'; A.sims.later(1.2,function(){p.p.act=null;}); a.say('Hi!',1.4);}]]});});}
};

/* once everything is built: the doors on the landings */
window.addEventListener('load',function(){readMats(); landingDoors(); PF.forEach(function(n){buildFlat(n,0);}); groupFor(0).traverse(function(o){if((o.isMesh||o.isLine||o.isPoints)&&o.layers.mask===1) o.layers.set(A.LAYER_FLOOR);}); scene.traverse(function(o){if(o.userData.hideBelow) wantHide.push(o);});      // the flats round ours are there from the start
  const was=A.sims&&A.sims.onStop; if(A.sims) A.sims.onStop=function(){G.picking=false; if(was) was();};});
A.floors={siren:sirenOn,coin:SND.coin,drawHud:drawHud,G:G,FLATS:FLATS,flatOf:flatOf,knock:knock,pick:pick,kick:kick,raise:raise,LV:LV,build:buildOver,buildFlat:buildFlat,buildCore:buildCore,pkey:pkey,NUMOF:NUMOF,doorSpec:doorSpec,buildShelter:buildShelter,groups:lvlGroups,doors:doors,NUM:NUM,DESIGN:DESIGN,readMats:readMats,SH:SH,busted:busted};
})();
