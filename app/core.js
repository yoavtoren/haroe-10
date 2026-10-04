/* Haroe 10 — core: renderer, rooms, light channels, building primitives */
(function(){
'use strict';
const A=window.APP={};

/* =====================================================================
   DIMENSIONS (metres). Edit these when you have tape measurements.
   x: 0 = sofa wall, grows toward the TV wall and the kitchen.
   z: 0 = wall with the two bedroom doors, grows toward the entrance.
   Source of each number: photos scaled against the 80 x 205 cm door
   openings, the 60 cm kitchen units, the 148 cm TV bench and the
   90 cm wardrobe.
   ===================================================================== */
const D=A.D={
  W:3.1,    // living room width at the sofa, sofa wall -> TV wall   (±0.2, not measured)
  L:5.95,   // living room length, bedroom wall -> entrance wall     (±0.3)
  H:2.93,   // ceiling                                                (±0.08)
  T:0.6,    // floor tile                                              (assumed 60 x 60)
  KX:5.7,   // kitchen window wall, i.e. W + 2.6                       (±0.2)
  KZ:2.8,   // kitchen sink wall; the TV wall starts here              (±0.2)
  ZW:4.75,  // front wall of the guest toilet, which juts into the room at the entrance
  BLK:2.3,  // how far that block reaches: the entrance wall is only this wide
  BX:4.9,   // bedroom 2 right-hand wall (window, TV, desk)
  NX:2.05, NZ:-1.9,    // the wardrobe niche in bedroom 2: its back wall, and how far it runs from the door wall
  door1:[0.50,1.28],   // bedroom 1 opening on the far wall
  door2:[2.75,3.53],   // bedroom 2 opening on the far wall, toward the kitchen
  painting:[1.50,2.60,1.40,2.22], // x0,x1,y0,y1 of the bus canvas
  entrance:[0.20,1.05],// front door, right next to the sofa wall
  bathDoor:[3.92,4.62],// bathroom door, in the same plane as the TV wall, right of the TV. Only 0.8 m of wall before it.
  wcDoor:[2.42,3.07],  // guest toilet door (x), at a right angle to the bathroom door
  bedDepth:4.4,        // both bedrooms, door wall -> window wall (guess)
  bedSplit:2.5         // wall between the two bedrooms, behind the niche (guess)
};
const W=D.W, L=D.L, H=D.H, KX=D.KX, KZ=D.KZ;
const AZ=A.AZ=-D.bedDepth, SPLIT=A.SPLIT=D.bedSplit;
const BA=A.BA={x0:W,x1:5.9,z0:KZ+0.1,z1:D.ZW-0.1};   // bathroom: shower, toilet, sink, washing machine
const WC=A.WC={x0:D.BLK,x1:3.95,z0:D.ZW,z1:L};    // guest toilet

const stage=A.stage=document.getElementById('stage'), labelsEl=A.labelsEl=document.getElementById('labels');
const renderer=A.renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.localClippingEnabled=true;
stage.insertBefore(renderer.domElement, labelsEl);
const scene=A.scene=new THREE.Scene();
const camera=A.camera=new THREE.PerspectiveCamera(40,1,0.1,100);
const controls=A.controls=new THREE.OrbitControls(camera,renderer.domElement);
const home=A.home=new THREE.Vector3(2.7,0.6,1.3);
controls.target.copy(home); controls.enableDamping=true; controls.dampingFactor=.08;
controls.maxPolarAngle=Math.PI/2-0.04; controls.minDistance=1.6; controls.maxDistance=50;

scene.add(new THREE.HemisphereLight(0xffffff,0x8d958f,0.66));
const hemi=A.hemi=scene.children[scene.children.length-1];
const sun=A.sun=new THREE.DirectionalLight(0xffffff,0.4);
sun.position.set(6,9,-0.5); sun.target.position.copy(home); scene.add(sun,sun.target);
sun.castShadow=true; sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-10,right:10,top:10,bottom:-10,near:1,far:26}); sun.shadow.radius=4;

/* ---------- rooms and light channels ----------
   Every material belongs to a room and is multiplied by that room's tint,
   which is computed from daylight, shutters and the room's lamps. */
const rooms=A.rooms={
  living:{name:'Living room', rs:[[0,W,0,D.ZW],[0,D.BLK,D.ZW,L]], win:'kitchen', dl:1, node:'lk'},
  kitchen:{name:'Kitchen',    rs:[[W,KX,0,KZ]],          win:'kitchen', dl:1, shutter:true, node:'lk'},
  bed1:{name:'Bedroom 1',     rs:[[0,D.NX-0.05,D.NZ,0],[0,SPLIT-0.05,AZ,D.NZ]],  win:'bed1',    dl:1, shutter:true, node:'bed1'},
  bed2:{name:'Bedroom 2',     rs:[[SPLIT+0.05,D.BX,AZ,0],[D.NX,SPLIT+0.05,D.NZ,0]], win:'bed2',    dl:1, shutter:true, node:'bed2'},
  bath:{name:'Bathroom',      rs:[[BA.x0,BA.x1,BA.z0,BA.z1]], win:null, dl:1, node:'bath'},
  wc:{name:'Guest toilet',    rs:[[WC.x0,WC.x1,WC.z0,WC.z1]], win:null, dl:0.85, node:'wc'},
  hall:{name:'Lobby', rs:[[-6.5,5.3,L,L+6.5],[-1.25,0.05,L+6.5,L+7.6]], win:null, dl:0.75, node:'hall', on:true},
  out:{name:'Outside', rs:[], win:null, dl:1, node:'out', ext:true}       // garden, street and the neighbouring building
};
const chans=A.chans={};
function chan(n,v,rate){return chans[n]||(chans[n]={cur:v||0,target:v||0,rate:rate||5});}
A.chan=chan;
A.set=function(n,v,instant){const c=chan(n); c.target=v; if(instant) c.cur=v; A.dirty=true;};
A.get=function(n){return chan(n).cur;};
A.goal=function(n){return chan(n).target;};
for(const k in rooms){const r=rooms[k]; r.key=k; r.mats=[]; r.tint=new THREE.Color(1,1,1); chan('L:'+k,r.on?1:0,5); chan('F:'+k,1,3);}   // F: 1 = in focus, 0 = dimmed
chan('day',1,1.4); chan('S:kitchen',1,1.5); chan('S:bed1',1,1.5); chan('S:bed2',1,1.5);
chan('tv',0,6); chan('string',0,4); chan('candle',0,3);
function stepChans(dt){
  let moved=false;
  for(const k in chans){const c=chans[k]; if(c.cur!==c.target){const d=c.target-c.cur, s=c.rate*dt; c.cur=Math.abs(d)<=s?c.target:c.cur+Math.sign(d)*s; moved=true;}}
  return moved;
}
A.roomAt=function(x,z){
  let best=null, bd=1e9;
  for(const k in rooms){const rs=rooms[k].rs;
    for(let i=0;i<rs.length;i++){const r=rs[i];
      const dx=Math.max(r[0]-x,0,x-r[1]), dz=Math.max(r[2]-z,0,z-r[3]), d=Math.hypot(dx,dz);
      if(d<bd){bd=d; best=k;}}
  }
  return best;
};

let curRoom='living';
A.inRoom=function(k,fn){const p=curRoom; curRoom=k; try{return fn();}finally{curRoom=p;}};
function reg(mat,room){
  const e={m:mat,b:mat.color.clone()};
  if(mat.emissive&&mat.emissive.getHex()) e.e=mat.emissive.clone();
  rooms[room||curRoom].mats.push(e); return mat;
}
A.reg=reg;
const M=A.M=function(c,room){return reg(new THREE.MeshLambertMaterial({color:c}),room);};
const MB=A.MB=function(c,room){return reg(new THREE.MeshBasicMaterial({color:c}),room);};
A.MT=function(tex,room,lambert){return reg(new (lambert?THREE.MeshLambertMaterial:THREE.MeshBasicMaterial)({map:tex}),room);};
const toMat=function(c){return c&&c.isMaterial?c:M(c);};

function put(geo,mat,x,y,z,parent){
  const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; (parent||scene).add(m); return m;
}
A.box=function(w,h,d,color,x,y,z,parent){return put(new THREE.BoxGeometry(w,h,d),toMat(color),x,y,z,parent);};
/* box with rounded edges and corners, for upholstery: same arguments as A.box, radius picked from the size */
A.rbox=function(w,h,d,color,x,y,z,parent,r){
  r=Math.max(0.004,Math.min(r||0.06,w/2-0.004,h/2-0.004,d/2-0.004));
  const a=w/2-r, b=d/2-r, c=Math.min(a,b,0.05)*0.9, s=new THREE.Shape();
  s.moveTo(-a+c,-b); s.lineTo(a-c,-b); s.absarc(a-c,-b+c,c,-Math.PI/2,0,false); s.lineTo(a,b-c); s.absarc(a-c,b-c,c,0,Math.PI/2,false);
  s.lineTo(-a+c,b); s.absarc(-a+c,b-c,c,Math.PI/2,Math.PI,false); s.lineTo(-a,-b+c); s.absarc(-a+c,-b+c,c,Math.PI,Math.PI*1.5,false);
  const g=new THREE.ExtrudeGeometry(s,{depth:h-2*r,bevelEnabled:true,bevelThickness:r,bevelSize:r,bevelSegments:3,curveSegments:4});
  g.rotateX(-Math.PI/2); g.translate(0,-(h/2-r),0);
  return put(g,toMat(color),x,y,z,parent);
};
A.cyl=function(r,h,color,x,y,z,parent,seg,rTop){return put(new THREE.CylinderGeometry(rTop==null?r:rTop,r,h,seg||24),toMat(color),x,y,z,parent);};
A.sph=function(r,color,x,y,z,parent,sx,sy,sz){const m=put(new THREE.SphereGeometry(r,14,10),toMat(color),x,y,z,parent); if(sx) m.scale.set(sx,sy,sz); return m;};
A.torus=function(R,t,color,x,y,z,parent,arc){return put(new THREE.TorusGeometry(R,t,8,28,arc||Math.PI*2),toMat(color),x,y,z,parent);};
A.canvasTex=function(w,h,draw){const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); const t=new THREE.CanvasTexture(c); t.anisotropy=8; return t;};
A.rng=function(seed){let a=seed>>>0; return function(){a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296;};};

/* design-specific visibility: spec is a string of design keys, e.g. 'n', 'abc', 'bc' */
A.onlys=[];
A.only=function(o,spec){o.userData.only=spec; A.onlys.push(o); return o;};
A.G=function(parent,spec){const g=new THREE.Group(); (parent||scene).add(g); if(spec) A.only(g,spec); return g;};

/* ---------- emissive lamps and additive light pools ---------- */
const lits=[], glows=[];
A.lit=function(ch,mat,hex,gain){lits.push({c:chan(ch),m:mat,on:new THREE.Color(hex==null?0xffd9a0:hex),gain:gain==null?0.9:gain}); return mat;};
A.lampMat=function(ch,off,on,gain){const m=M(off==null?0xf1ead9:off); A.lit(ch,m,on,gain); return m;};
const radialTex=A.canvasTex(128,128,function(g){
  const gr=g.createRadialGradient(64,64,0,64,64,64); gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(0.35,'rgba(255,255,255,.55)'); gr.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=gr; g.fillRect(0,0,128,128);
});
const beamTex=A.canvasTex(64,128,function(g){
  const gr=g.createLinearGradient(0,0,0,128); gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(0.5,'rgba(255,255,255,.45)'); gr.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=gr; g.fillRect(0,0,64,128);
  const s=g.createLinearGradient(0,0,64,0); s.addColorStop(0,'rgba(0,0,0,1)'); s.addColorStop(0.2,'rgba(0,0,0,0)'); s.addColorStop(0.8,'rgba(0,0,0,0)'); s.addColorStop(1,'rgba(0,0,0,1)');
  g.globalCompositeOperation='destination-out'; g.fillStyle=s; g.fillRect(0,0,64,128);
});
function glowMat(tex,color){return new THREE.MeshBasicMaterial({map:tex,color:color,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});}
/* round pool of light. chs: channel name or list (multiplied). vertical: rotation.y for a wall wash, else lies on the floor */
A.pool=function(chs,color,x,y,z,r,parent,max,vertical){
  const m=new THREE.Mesh(new THREE.PlaneGeometry(2*r,2*r),glowMat(radialTex,color));
  m.position.set(x,y,z); if(vertical==null) m.rotation.x=-Math.PI/2; else m.rotation.y=vertical;
  m.renderOrder=2; m.userData.nc=true; (parent||scene).add(m);
  glows.push({m:m,max:max==null?0.5:max,ch:[].concat(chs).map(function(n){return chan(n);})}); return m;
};
/* daylight falling in through a window: bright at the window, fading along local +z of rotY */
A.sunPatch=function(winKey,x,z,w,len,rotY){
  const g=new THREE.Group(); g.position.set(x,0.021,z); g.rotation.y=rotY; scene.add(g);
  const geo=new THREE.PlaneGeometry(w,len); geo.rotateX(-Math.PI/2); geo.translate(0,0,len/2);
  const m=new THREE.Mesh(geo,glowMat(beamTex,0xfff3d6)); m.renderOrder=2; g.add(m);
  glows.push({m:m,max:0.34,ch:[chan('day'),chan('S:'+winKey),chan('fake',1)]});      // 'fake' goes to 0 when the real sun study is on
};
const glassMats=[];
const cDark=new THREE.Color(0.56,0.66,0.96), cLamp=new THREE.Color(1,0.9,0.74), tmpC=new THREE.Color();
const glassDay=new THREE.Color(0xa9cdd6), glassNight=new THREE.Color(0x141c28), bgNight=new THREE.Color(0x0b1018), bgDay=new THREE.Color(0xE9ECE7);
A.lightVer=0;
function relight(){
  const day=chans.day.cur;
  for(const k in rooms){const r=rooms[k];
    const sh=r.win?chans['S:'+r.win].cur:1;
    const wd=day*r.dl*(0.1+0.9*sh);
    let lamp=chans['L:'+k].cur;
    if(k==='living') lamp=Math.max(lamp,0.4*chans['L:kitchen'].cur,0.42*chans.string.cur,0.22*chans.tv.cur);
    if(k==='kitchen') lamp=Math.max(lamp,0.3*chans['L:living'].cur);
    const wl=0.92*lamp*(1-0.65*wd), light=wd+wl, f=Math.min(1,light), inv=f/Math.max(1e-4,light), d=0.3*(1-f);
    r.tint.setRGB(cDark.r*d+(wd+cLamp.r*wl)*inv, cDark.g*d+(wd+cLamp.g*wl)*inv, cDark.b*d+(wd+cLamp.b*wl)*inv);
    r.light=f;
    const fo=chans['F:'+k].cur; if(fo<1){const g=(r.tint.r+r.tint.g+r.tint.b)/3*0.5, q=0.38+0.62*fo; r.tint.setRGB((g+(r.tint.r-g)*fo)*q+g*(1-fo)*0,(g+(r.tint.g-g)*fo)*q,(g+(r.tint.b-g)*fo)*q);}
    for(let i=0;i<r.mats.length;i++){const e=r.mats[i]; e.m.color.copy(e.b).multiply(r.tint); if(e.e) e.m.emissive.copy(e.e).multiply(r.tint);}
  }
  for(let i=0;i<lits.length;i++){const e=lits[i]; e.m.emissive.copy(e.on).multiplyScalar(e.c.cur*e.gain);}
  for(let i=0;i<glows.length;i++){const g=glows[i]; let v=g.max; for(let j=0;j<g.ch.length;j++) v*=g.ch[j].cur; g.m.material.opacity=v; g.m.visible=v>0.004;}
  tmpC.copy(glassNight).lerp(glassDay,day); for(let i=0;i<glassMats.length;i++) glassMats[i].color.copy(tmpC);
  renderer.setClearColor(tmpC.copy(bgNight).lerp(bgDay,day));
  A.lightVer++;
}
A.relight=relight;
function syncBg(){
  const c=getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()||'#E9ECE7';
  bgDay.set(c); A.dirty=true;
}
new MutationObserver(syncBg).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',syncBg);

/* ---------- floors, ceilings ---------- */
const cut=A.cut=new THREE.Plane(new THREE.Vector3(0,-1,0),100);   // "cut walls low" moves this down
const tileTex=A.canvasTex(256,256,function(g){
  g.fillStyle='#cdd1cc'; g.fillRect(0,0,256,256);
  const rnd=A.rng(7);
  for(let i=0;i<900;i++){g.fillStyle='rgba('+(i%2?255:120)+','+(i%2?255:125)+','+(i%2?255:120)+',0.05)'; g.fillRect(rnd()*256,rnd()*256,3,3);}
  g.strokeStyle='#a4a9a3'; g.lineWidth=3; g.strokeRect(0,0,256,256);
});
tileTex.wrapS=tileTex.wrapT=THREE.RepeatWrapping;
A.floorQuad=function(x0,x1,z0,z1,tex,pitch,room){
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute([x0,0,z0, x0,0,z1, x1,0,z1, x1,0,z0],3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute([x0/pitch,z0/pitch, x0/pitch,z1/pitch, x1/pitch,z1/pitch, x1/pitch,z0/pitch],2));
  g.setIndex([0,1,2,0,2,3]); g.computeVertexNormals();
  const f=new THREE.Mesh(g,reg(new THREE.MeshLambertMaterial({map:tex}),room)); f.receiveShadow=true; f.userData.floor=true; scene.add(f);
  A.box(x1-x0,0.12,z1-z0,M(0xb4b9b3,room),(x0+x1)/2,-0.062,(z0+z1)/2).castShadow=false;
  return f;
};
A.slab=function(x0,x1,z0,z1,room){return A.floorQuad(x0,x1,z0,z1,tileTex,D.T,room);};
A.ceil=function(room,x0,x1,z0,z1){
  const mat=reg(new THREE.MeshLambertMaterial({color:0xf7f7f4,emissive:0x2c2d2b,clippingPlanes:[cut]}),room);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(x1-x0,z1-z0),mat);
  m.rotation.x=Math.PI/2; m.position.set((x0+x1)/2,H,(z0+z1)/2); scene.add(m); A.shells.push(m); return m;
};

/* ---------- walls (single sided, so you can look in from outside), with door openings ---------- */
const walls=A.walls={};
A.shells=[];                 // walls and ceilings: they cast shadows only during the sun study
function clipped(mat){mat.clippingPlanes=[cut]; return mat;}
A.wall=function(k,a,b,n,room,opt){
  opt=opt||{};
  const hh=opt.h||H, w={a:a,b:b,n:n,room:room,holes:opt.holes||[]};
  w.len=Math.hypot(b[0]-a[0],b[1]-a[1]); w.d=[(b[0]-a[0])/w.len,(b[1]-a[1])/w.len]; w.rot=Math.atan2(n[0],n[1]);
  w.s=(n[1]*w.d[0]-n[0]*w.d[1])>0?1:-1;            // does local +x run along a->b?
  const g=w.g=new THREE.Group(); g.position.set((a[0]+b[0])/2,0,(a[1]+b[1])/2); g.rotation.y=w.rot; g.userData.nc=true; scene.add(g);
  const hl=w.len/2, he=hl-0.0015, sh=new THREE.Shape();        // ends pulled in a hair so walls that meet at a corner do not z-fight
  const hs=w.holes.map(function(h){const p=w.s*(h[0]-hl), q=w.s*(h[1]-hl); return [Math.min(p,q),Math.max(p,q),h[2]||2.05];}).sort(function(p,q){return p[0]-q[0];});
  sh.moveTo(-he,0);
  hs.forEach(function(h){sh.lineTo(h[0],0); sh.lineTo(h[0],h[2]); sh.lineTo(h[1],h[2]); sh.lineTo(h[1],0);});
  (opt.wins||[]).forEach(function(q){          // window openings: u0,u1,y0,y1
    const p=w.s*(q[0]-hl), r=w.s*(q[1]-hl), x0=Math.min(p,r), x1=Math.max(p,r), pa=new THREE.Path();
    pa.moveTo(x0,q[2]); pa.lineTo(x1,q[2]); pa.lineTo(x1,q[3]); pa.lineTo(x0,q[3]); pa.lineTo(x0,q[2]); sh.holes.push(pa);});
  sh.lineTo(he,0); sh.lineTo(he,hh); sh.lineTo(-he,hh); sh.lineTo(-he,0);
  const mat=reg(clipped(new THREE.MeshLambertMaterial({color:0xf5f6f3,emissive:0x3c3d3b,polygonOffset:true,polygonOffsetFactor:0,polygonOffsetUnits:-2})),room);
  const m=new THREE.Mesh(new THREE.ShapeGeometry(sh),mat); m.receiveShadow=true; g.add(m); A.shells.push(m); w.wins=opt.wins||[];
  walls[k]=w;
  A.spans(k).forEach(function(s){A.rect(k,s[0],s[1],0,0.08,0xe2e5e1,0.004);});   // skirting
  return w;
};
/* stretches of wall between door openings, in u */
A.spans=function(k){
  const w=walls[k], hs=w.holes.slice().sort(function(p,q){return p[0]-q[0];}), out=[]; let u=0;
  hs.forEach(function(h){if(h[0]>u) out.push([u,h[0]]); u=h[1];});
  if(u<w.len) out.push([u,w.len]); return out;
};
A.rect=function(k,u0,u1,y0,y1,color,off){
  const w=walls[k];
  const mat=color.isMaterial?clipped(color):clipped(MB(color,w.room));
  const m=new THREE.Mesh(new THREE.PlaneGeometry(u1-u0,y1-y0),mat);
  m.position.set(w.s*((u0+u1)/2-w.len/2),(y0+y1)/2,off||0.006); w.g.add(m); return m;
};
/* world position of a point on a wall: u along it, y up, o out from it */
A.onWall=function(k,u,y,o){const w=walls[k]; return new THREE.Vector3(w.a[0]+w.d[0]*u+w.n[0]*(o||0),y,w.a[1]+w.d[1]*u+w.n[1]*(o||0));};
A.doorFrame=function(k,u0,u1,top){
  top=top||2.05; const ar=0.10, c=0xe4e7e3;
  A.rect(k,u0-ar,u0,0,top+ar,c); A.rect(k,u1,u1+ar,0,top+ar,c); A.rect(k,u0-ar,u1+ar,top,top+ar,c);
};
/* a real door leaf on a hinge. Angles are rotation.y of the leaf, which extends along local +x. */
const doors=A.doors=[];
A.doorLeaf=function(id,hx,hz,closed,open,room,w){
  w=w||0.8;
  const p=new THREE.Group(); p.position.set(hx,0,hz); p.rotation.y=closed; p.userData.nc=true; scene.add(p);
  const n0=rooms[room].mats.length;
  A.inRoom(room,function(){
    A.box(w-0.02,2.03,0.04,0xfbfbf9,w/2,1.02,0,p);
    A.box(0.12,0.025,0.11,0x6f7570,w-0.13,1.05,0,p); A.box(0.03,0.11,0.06,0x8a908b,w-0.08,1.05,0,p);
  });
  for(let i=n0;i<rooms[room].mats.length;i++) rooms[room].mats[i].keep=true;      // a door is seen from both of its rooms
  const d={id:id,p:p,closed:closed,open:open,cur:0,target:0,force:null,
    cx:hx+Math.cos(closed)*w/2, cz:hz-Math.sin(closed)*w/2};
  doors.push(d); return d;
};
A.door=function(id){for(let i=0;i<doors.length;i++) if(doors[i].id===id) return doors[i]; return null;};

/* ---------- windows with roller shutters ---------- */
const slatTex=A.canvasTex(32,32,function(g){g.fillStyle='#dfe2dd'; g.fillRect(0,0,32,32); g.fillStyle='#c3c7c1'; g.fillRect(0,26,32,6); g.fillStyle='#eef0ec'; g.fillRect(0,0,32,5);});
slatTex.wrapS=slatTex.wrapT=THREE.RepeatWrapping;
const shutters=A.shutters=[];
A.windowOn=function(k,u0,u1,y0,y1,panes,bars,winKey){
  const gm=new THREE.MeshBasicMaterial({color:0xa9cdd6,transparent:true,opacity:0.3,depthWrite:false}); glassMats.push(gm);
  A.rect(k,u0,u1,y0,y1,0xe9ece8,0.006); A.rect(k,u0+0.05,u1-0.05,y0+0.05,y1-0.05,gm,0.008);
  for(let i=1;i<(panes||1);i++){const u=u0+i*(u1-u0)/panes; A.rect(k,u-0.025,u+0.025,y0,y1,0xe9ece8,0.010);}
  if(bars){for(let i=1;i<bars;i++){const u=u0+0.05+i*(u1-u0-0.1)/bars; A.rect(k,u-0.006,u+0.006,y0+0.05,y1-0.05,0xf4f5f3,0.009);}}
  if(winKey){
    const hh=y1-y0-0.06, t=slatTex.clone(); t.needsUpdate=true; t.repeat.set(1,hh/0.055);
    const s=A.rect(k,u0+0.03,u1-0.03,y0+0.03,y1-0.03,A.MT(t,walls[k].room),0.016);
    s.geometry.translate(0,-hh/2,0); s.position.y=y1-0.03;
    A.rect(k,u0-0.02,u1+0.02,y1,y1+0.13,0xdfe2dd,0.012);            // shutter box
    s.castShadow=true; shutters.push({key:winKey,m:s,tex:t,h:hh});
  }
};
function applyShutters(){
  for(let i=0;i<shutters.length;i++){const s=shutters[i], closed=1-chans['S:'+s.key].cur;
    s.m.scale.y=Math.max(0.001,closed); s.m.visible=closed>0.01; s.tex.repeat.y=Math.max(0.2,s.h*closed/0.055);}
}

/* ---------- labels ---------- */
A.tag=function(text,cls){const e=document.createElement('div'); e.className='tag'+(cls?' '+cls:''); e.textContent=text; labelsEl.appendChild(e); return e;};
const pv=new THREE.Vector3();
A.place=function(el,p,visible){
  pv.copy(p).project(camera);
  const ok=visible&&pv.z<1&&pv.z>-1;
  el.style.opacity=ok?1:0;
  if(ok){el.style.left=((pv.x+1)/2*stage.clientWidth)+'px'; el.style.top=((1-pv.y)/2*stage.clientHeight)+'px';}
};

/* ---------- camera moves, resize, frame loop ---------- */
A.reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let camAnim=null;
A.fly=function(pos,tgt,dur,instant){
  if(instant||A.reduce){camera.position.copy(pos); controls.target.copy(tgt); controls.update(); camAnim=null; return;}
  camAnim={from:camera.position.clone(),to:pos.clone(),tf:controls.target.clone(),tt:tgt.clone(),t0:performance.now(),dur:dur||700};
};
A.stopFly=function(){camAnim=null;};
A.flying=function(){return !!camAnim;};
function resize(){
  const w=stage.clientWidth,h=stage.clientHeight; if(!w||!h) return;
  renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(stage);
A.frameFns=[]; A.labelFns=[]; A.t=0;
let last=0;
function frame(now){
  requestAnimationFrame(frame);
  const dt=Math.min(0.1,Math.max(0.001,(now-last)/1000)); last=now; A.t=now/1000;
  if(stepChans(dt)||A.dirty){A.dirty=false; applyShutters(); relight();}
  for(let i=0;i<doors.length;i++){const d=doors[i], tg=d.force!=null?d.force:d.target;
    if(d.cur!==tg){const s=3.2*dt, df=tg-d.cur; d.cur=Math.abs(df)<=s?tg:d.cur+Math.sign(df)*s; d.p.rotation.y=d.closed+(d.open-d.closed)*d.cur*0.94;}}
  for(let i=0;i<A.frameFns.length;i++) A.frameFns[i](dt,A.t);
  if(camAnim){
    const k=Math.min(1,(now-camAnim.t0)/camAnim.dur), e=1-Math.pow(1-k,3);
    camera.position.lerpVectors(camAnim.from,camAnim.to,e); controls.target.lerpVectors(camAnim.tf,camAnim.tt,e);
    if(k>=1) camAnim=null;
  }
  if(controls.enabled) controls.update();
  renderer.render(scene,camera);
  for(let i=0;i<A.labelFns.length;i++) A.labelFns[i]();
}
A.start=function(){syncBg(); resize(); applyShutters(); relight(); last=performance.now(); requestAnimationFrame(frame);};
})();
