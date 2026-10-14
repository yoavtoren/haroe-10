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
  if(lv>0&&upWalls[lv]&&A.sims&&A.sims.camMode==='follow'){const c=A.camera.position;
    upWalls[lv].forEach(function(w){const front=(c.x-w.a[0])*w.n[0]+(c.z-w.a[1])*w.n[1]>0; w.g.visible=!(front&&segHit(c.x,c.z,p.x,p.z,w.a[0],w.a[1],w.b[0],w.b[1]));});}
});

/* ---------- what you can do on the stairs and at the doors (the bar that pops up by things in Sims mode) ---------- */
function goStairs(dir){
  const p=A.player, S=A.sims; if(!p||p.script) return;
  const from=p.lvl||0, to=from+dir; if(to<-1||to>UPS) return;
  if(LV[to]&&to>0&&!built[to]) buildOver(to);
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
window.addEventListener('load',function(){readMats(); landingDoors();});
A.floors={LV:LV,build:buildOver,groups:lvlGroups,doors:doors,NUM:NUM,DESIGN:DESIGN,readMats:readMats};
})();
