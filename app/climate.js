/* Haroe 10 — Sun & air: real sun position by season and hour, and a small air-flow and temperature model */
(function(){
'use strict';
const A=window.APP, D=A.D, W=D.W, L=D.L, H=D.H, KX=D.KX, KZ=D.KZ, AZ=A.AZ, scene=A.scene;
const $=function(id){return document.getElementById(id);};
const RAD=Math.PI/180;
let on=false;

/* =====================================================================
   Sun. Tel Aviv area, latitude 32.08 N. Compass in the model: +x is south, -z is east,
   so the corner with the windows faces south-east.
   ===================================================================== */
const LAT=32.08*RAD;
const SEASONS={
  winter:{name:'21 December',dec:-23.44,tz:2,out:[11,18]},
  spring:{name:'21 March',dec:0,tz:2,out:[13,23]},
  summer:{name:'21 June',dec:23.44,tz:3,out:[24,32]},
  autumn:{name:'23 September',dec:0,tz:3,out:[22,30]}
};
const sunS={season:'spring',hour:9};
function sunAt(season,hour){
  const s=SEASONS[season], dec=s.dec*RAD, solar=hour+(34.8*4-s.tz*60)/60, h=(solar-12)*15*RAD;
  const el=Math.asin(Math.sin(LAT)*Math.sin(dec)+Math.cos(LAT)*Math.cos(dec)*Math.cos(h));
  const az=Math.atan2(-Math.cos(dec)*Math.sin(h),Math.sin(dec)*Math.cos(LAT)-Math.cos(dec)*Math.sin(LAT)*Math.cos(h));
  return {el:el,az:(az+2*Math.PI)%(2*Math.PI),dir:new THREE.Vector3(-Math.cos(az)*Math.cos(el),Math.sin(el),-Math.sin(az)*Math.cos(el))};
}
function outdoorT(){const s=SEASONS[sunS.season].out; return s[0]+(s[1]-s[0])*Math.max(0,Math.sin((sunS.hour-6)/14*Math.PI));}
const WINDOWS=[
  {id:'kitchen',name:'Kitchen window',wall:'win',room:'kitchen'},
  {id:'bed2',name:'Bedroom 2, big window',wall:'b_r',room:'bed2'},
  {id:'bed2s',name:'Bedroom 2, small window',wall:'b_far',room:'bed2'},
  {id:'bed1',name:'Bedroom 1 window',wall:'a_far',room:'bed1'}
];
WINDOWS.forEach(function(w){const wl=A.walls[w.wall], q=wl.wins[0]; w.u0=q[0]; w.u1=q[1]; w.out=new THREE.Vector3(-wl.n[0],0,-wl.n[1]); w.pos=A.onWall(w.wall,(q[0]+q[1])/2,(q[2]+q[3])/2,-0.4);});
const ray=new THREE.Raycaster();
function lit(w,s){          // does direct sun reach this window?
  if(s.el<=0.02||s.dir.dot(w.out)<=0.05) return false;
  ray.set(w.pos,s.dir); ray.far=80;
  return A.outside?ray.intersectObject(A.outside,true).length===0:true;
}
const hhmm=function(h){const m=Math.round(h*60); return ('0'+Math.floor(m/60)).slice(-2)+':'+('0'+m%60).slice(-2);};
const COMP=['N','NE','E','SE','S','SW','W','NW'];
const sunDef={pos:A.sun.position.clone(),int:A.sun.intensity,hemi:A.hemi.intensity,cam:null};
function applySun(){
  const s=sunAt(sunS.season,sunS.hour), up=Math.max(0,Math.min(1,s.el/(8*RAD)));
  const c=new THREE.Vector3(2.9,0,0.8);
  A.sun.target.position.copy(c); A.sun.position.copy(c).addScaledVector(s.dir.clone().setY(Math.max(0.05,s.dir.y)).normalize(),32);
  A.sun.intensity=0.62*up; A.sun.color.setRGB(1,0.86+0.14*Math.min(1,s.el/(25*RAD)),0.68+0.32*Math.min(1,s.el/(25*RAD)));
  A.hemi.intensity=0.36+0.3*up;
  A.set('day',up); A.touch(3);
  $('sunClock').textContent=hhmm(sunS.hour);
  const litNow=WINDOWS.filter(function(w){return lit(w,s);}).map(function(w){return w.name;});
  $('sunInfo').textContent=s.el<=0?'The sun is below the horizon.':'Sun in the '+COMP[Math.round(s.az/(Math.PI/4))%8]+', '+Math.round(s.el/RAD)+'° high. '+(litNow.length?'Direct sun on: '+litNow.join(', ')+'.':'No direct sun on any window.');
}
function sunTable(){          // when each window gets direct sun on this date
  let h='<tr><td colspan="2" class="note" style="font-weight:400">Direct sun on '+SEASONS[sunS.season].name+', neighbours included</td></tr>';
  WINDOWS.forEach(function(w){
    const spans=[]; let start=null, total=0;
    for(let t=4.5;t<=21;t+=0.25){const l=lit(w,sunAt(sunS.season,t)); if(l&&start==null) start=t; if(!l&&start!=null){spans.push(hhmm(start)+'–'+hhmm(t)); total+=t-start; start=null;}}
    h+='<tr><td>'+w.name+'</td><td class="sw">'+(spans.length?spans.join(', ')+' · '+(Math.round(total*2)/2)+' h':'none')+'</td></tr>';
  });
  $('sunTbl').innerHTML=h;
}
function setSeason(k){sunS.season=k; $('segSeason').querySelectorAll('button').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.s===k);}); applySun(); sunTable(); if(air.mode!=='off') airInfo();}
$('segSeason').onclick=function(e){const b=e.target.closest('button'); if(b) setSeason(b.dataset.s);};
$('sunHour').oninput=function(e){sunS.hour=+e.target.value; playing=false; $('sunPlay').textContent='Play the day'; applySun();};
let playing=false;
$('sunPlay').onclick=function(){playing=!playing; $('sunPlay').textContent=playing?'Pause':'Play the day'; if(playing&&sunS.hour>=19.9) sunS.hour=5;};
function realSun(v){
  A.sunReal=v; A.set('fake',v?0:1);
  A.shells.forEach(function(m){m.castShadow=v;}); A.touch(4);
  const sc=A.sun.shadow.camera;
  if(v){
    if(!sunDef.cam) sunDef.cam={l:sc.left,r:sc.right,t:sc.top,b:sc.bottom,f:sc.far,ms:A.sun.shadow.mapSize.x};
    Object.assign(sc,{left:-13,right:13,top:13,bottom:-13,near:1,far:70}); sc.updateProjectionMatrix();
    const ms=('ontouchstart' in window)?2048:4096; if(A.sun.shadow.mapSize.x!==ms){A.sun.shadow.mapSize.set(ms,ms); if(A.sun.shadow.map){A.sun.shadow.map.dispose(); A.sun.shadow.map=null;}}
    A.sun.shadow.bias=-0.0006; A.sun.shadow.normalBias=0.03; A.sun.shadow.radius=2;
    applySun(); sunTable();
  }else{
    A.sun.position.copy(sunDef.pos); A.sun.target.position.copy(A.home); A.sun.intensity=sunDef.int; A.sun.color.set(0xffffff); A.hemi.intensity=sunDef.hemi;
    if(sunDef.cam){Object.assign(sc,{left:sunDef.cam.l,right:sunDef.cam.r,top:sunDef.cam.t,bottom:sunDef.cam.b,far:sunDef.cam.f}); sc.updateProjectionMatrix();}
    A.sun.shadow.bias=-0.0009; A.sun.shadow.normalBias=0.025; A.sun.shadow.radius=4; A.touch(4);
    A.set('day',1);
  }
}

/* =====================================================================
   Air. A 15 cm grid over the flat at head height: incompressible flow (semi-Lagrangian advection and a
   pressure projection), pushed by wind pressure at open windows or by the air conditioners, carrying temperature.
   ===================================================================== */
const h=0.15, X0=-0.3, Z0=AZ-0.3, NX=Math.ceil((KX+0.6-X0)/h), NZ=Math.ceil((L+0.3-Z0)/h), N=NX*NZ;
const u=new Float32Array(N), v=new Float32Array(N), u2=new Float32Array(N), v2=new Float32Array(N), T=new Float32Array(N), T2=new Float32Array(N);
const p=new Float32Array(N), dv=new Float32Array(N), solid=new Uint8Array(N), pfix=new Float32Array(N), isOpen=new Uint8Array(N), roomOf=new Int8Array(N);
const ROOMS=['living','kitchen','bed1','bed2','bath','wc'];
const air={mode:'off',open:{kitchen:true,bed1:true,bed2:false,bath:false},door:{bed1:true,bed2:true,bath:false,wc:false,entrance:false},wind:'W',speed:3,ac:{kitchen:true,bed1:false},set:23,fan:2};
const WIN_NAMES=[['kitchen','Kitchen'],['bed1','Bedroom 1'],['bed2','Bedroom 2'],['bath','Bathroom']], DOOR_NAMES=[['bed1','Bedroom 1'],['bed2','Bedroom 2'],['bath','Bathroom'],['wc','Guest toilet'],['entrance','Front door']];
const WIND={W:[0,-1],E:[0,1],N:[1,0],S:[-1,0]};          // direction the air travels, in (x,z): west wind blows toward the east (-z)
const AC=[{id:'kitchen',x:KX-0.45,z:1.3,dx:-1,dz:0},{id:'bed1',x:1.3,z:AZ+0.45,dx:0,dz:1}];
const DOORS={far:['bed1','bed2'],a_door:['bed1'],b_door:['bed2'],end:['entrance'],tv:['bath'],ba_w:['bath'],blk_n:['wc'],wc_n:['wc']};      // which door each opening in a wall is
const WINKEY={win:'kitchen',a_far:'bed1',b_r:'bed2',b_far:'bed2',ba_e:'bath'};
const ix=function(x){return Math.floor((x-X0)/h);}, iz=function(z){return Math.floor((z-Z0)/h);};
const bb=new THREE.Box3();
function tall(o){             // furniture tall enough to block air at head height
  if(!o.visible||o.userData.nc) return;
  if(o.isMesh&&!o.userData.floor&&o.geometry){
    if(!o.geometry.boundingBox) o.geometry.computeBoundingBox();
    bb.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld);
    if(bb.max.y>1.25&&bb.min.y<0.6&&bb.max.x-bb.min.x<3.5&&bb.max.z-bb.min.z<3.5&&bb.max.y-bb.min.y<2.99)
      for(let j=Math.max(0,iz(bb.min.z+0.04));j<=Math.min(NZ-1,iz(bb.max.z-0.04));j++) for(let i=Math.max(0,ix(bb.min.x+0.04));i<=Math.min(NX-1,ix(bb.max.x-0.04));i++) solid[j*NX+i]=1;
  }
  for(let i=0;i<o.children.length;i++) tall(o.children[i]);
}
function buildMask(){
  solid.fill(1); isOpen.fill(0); pfix.fill(0); roomOf.fill(-1);
  ROOMS.forEach(function(k,ri){A.rooms[k].rs.forEach(function(r){
    for(let j=0;j<NZ;j++) for(let i=0;i<NX;i++){const x=X0+(i+0.5)*h, z=Z0+(j+0.5)*h; if(x>r[0]&&x<r[1]&&z>r[2]&&z<r[3]){solid[j*NX+i]=0; roomOf[j*NX+i]=ri;}}
  });});
  scene.updateMatrixWorld(true); tall(scene);
  const wd=WIND[air.wind], P=air.mode==='win'?0.5*air.speed*air.speed:0;
  for(const k in A.walls){const w=A.walls[k]; if(ROOMS.indexOf(w.room)<0) continue;
    const n=Math.ceil(w.len/(h*0.5));
    for(let s=0;s<=n;s++){
      const t=s/n*w.len, x=w.a[0]+w.d[0]*t, z=w.a[1]+w.d[1]*t, c=iz(z)*NX+ix(x); if(c<0||c>=N) continue;
      let state='wall';
      const hs=w.holes.slice().sort(function(p,q){return p[0]-q[0];});
      hs.forEach(function(q,hi){if(t>q[0]+0.05&&t<q[1]-0.05){const id=(DOORS[k]||[])[hi]; state=!air.door[id]?'wall':id==='entrance'?'open':'gap';}});
      w.wins.forEach(function(q){if(t>q[0]&&t<q[1]&&air.open[WINKEY[k]]) state='open';});
      if(state==='wall'){solid[c]=1; isOpen[c]=0;}
      else if(state==='gap'){if(!isOpen[c]) solid[c]=0;}
      else{solid[c]=0; isOpen[c]=1; const dt_=wd[0]*w.n[0]+wd[1]*w.n[1]; pfix[c]=P*(0.8*Math.max(0,dt_)-0.3*(1-Math.abs(dt_))-0.5*Math.max(0,-dt_))*0.012;}        // wind pushing in through this opening is positive
    }
  }
  for(let c=0;c<N;c++) if(solid[c]){u[c]=v[c]=0;}
}
function sample(f,x,z){
  let gx=(x-X0)/h-0.5, gz=(z-Z0)/h-0.5; gx=Math.max(0,Math.min(NX-1.001,gx)); gz=Math.max(0,Math.min(NZ-1.001,gz));
  const i=gx|0, j=gz|0, fx=gx-i, fz=gz-j, c=j*NX+i;
  return (f[c]*(1-fx)+f[c+1]*fx)*(1-fz)+(f[c+NX]*(1-fx)+f[c+NX+1]*fx)*fz;
}
function step(dt){
  const Tout=outdoorT();
  if(air.mode==='ac') AC.forEach(function(a){if(!air.ac[a.id]) return;
    for(let k=0;k<6;k++) for(let s=-2;s<=2;s++){
      const x=a.x+a.dx*k*h+a.dz*s*h, z=a.z+a.dz*k*h+a.dx*s*h, c=iz(z)*NX+ix(x); if(c<0||c>=N||solid[c]) continue;
      const f=air.fan*(1-k/7);
      u[c]+=a.dx*f*1.6*dt; v[c]+=a.dz*f*1.6*dt; if(k<3) T[c]+=(air.set-T[c])*Math.min(1,air.fan*1.6*dt);
    }});
  for(let j=1;j<NZ-1;j++) for(let i=1;i<NX-1;i++){const c=j*NX+i; if(solid[c]){u2[c]=v2[c]=0; T2[c]=T[c]; continue;}
    const x=X0+(i+0.5)*h-u[c]*dt, z=Z0+(j+0.5)*h-v[c]*dt, d=1-0.35*dt;
    u2[c]=sample(u,x,z)*d; v2[c]=sample(v,x,z)*d; T2[c]=sample(T,x,z);}
  u.set(u2); v.set(v2);
  for(let j=1;j<NZ-1;j++) for(let i=1;i<NX-1;i++){const c=j*NX+i; if(solid[c]) continue;        // temperature: mix with neighbours, slow gain through the envelope
    let s=0, n=0; if(!solid[c-1]){s+=T2[c-1]; n++;} if(!solid[c+1]){s+=T2[c+1]; n++;} if(!solid[c-NX]){s+=T2[c-NX]; n++;} if(!solid[c+NX]){s+=T2[c+NX]; n++;}
    let t=n?T2[c]*0.94+s/n*0.06:T2[c]; t+=(Tout-t)*dt*0.004; if(isOpen[c]) t=Tout; T[c]=t;}
  for(let j=1;j<NZ-1;j++) for(let i=1;i<NX-1;i++){const c=j*NX+i; if(solid[c]){dv[c]=0; continue;}
    dv[c]=0.5*h*((solid[c+1]?0:u[c+1])-(solid[c-1]?0:u[c-1])+(solid[c+NX]?0:v[c+NX])-(solid[c-NX]?0:v[c-NX]));}
  for(let it=0;it<34;it++) for(let j=1;j<NZ-1;j++) for(let i=1;i<NX-1;i++){const c=j*NX+i; if(solid[c]) continue;
    if(isOpen[c]){p[c]=pfix[c]; continue;}
    p[c]=((solid[c-1]?p[c]:p[c-1])+(solid[c+1]?p[c]:p[c+1])+(solid[c-NX]?p[c]:p[c-NX])+(solid[c+NX]?p[c]:p[c+NX])-dv[c])*0.25;}
  for(let j=1;j<NZ-1;j++) for(let i=1;i<NX-1;i++){const c=j*NX+i; if(solid[c]) continue;
    let a=u[c]-0.5*((solid[c+1]?p[c]:p[c+1])-(solid[c-1]?p[c]:p[c-1]))/h, b=v[c]-0.5*((solid[c+NX]?p[c]:p[c+NX])-(solid[c-NX]?p[c]:p[c-NX]))/h;
    const m=Math.hypot(a,b); if(m>3){a*=3/m; b*=3/m;} u[c]=a; v[c]=b;}
}
function resetT(){const t=outdoorT(), start=air.mode==='ac'?Math.max(t,26):t+(sunS.season==='winter'?5:2); T.fill(start); u.fill(0); v.fill(0); p.fill(0);}

/* ---------- drawing: moving specks coloured by temperature, and a heat map on the floor ---------- */
const NP=1100, ppos=new Float32Array(NP*3), pcol=new Float32Array(NP*3), page=new Float32Array(NP);
const pg=new THREE.BufferGeometry(); pg.setAttribute('position',new THREE.BufferAttribute(ppos,3)); pg.setAttribute('color',new THREE.BufferAttribute(pcol,3));
const dot=A.canvasTex(32,32,function(g){const r=g.createRadialGradient(16,16,0,16,16,16); r.addColorStop(0,'rgba(255,255,255,1)'); r.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=r; g.fillRect(0,0,32,32);});
const pts=new THREE.Points(pg,new THREE.PointsMaterial({size:0.11,map:dot,vertexColors:true,transparent:true,depthWrite:false,opacity:0.95}));
pts.frustumCulled=false; pts.visible=false; pts.userData.nc=true; pts.renderOrder=4; scene.add(pts);
// the faster the air, the longer the streak behind each speck
const lpos=new Float32Array(NP*6), lcol=new Float32Array(NP*6), lg=new THREE.BufferGeometry();
lg.setAttribute('position',new THREE.BufferAttribute(lpos,3)); lg.setAttribute('color',new THREE.BufferAttribute(lcol,3));
const streaks=new THREE.LineSegments(lg,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:0.9,depthWrite:false}));
streaks.frustumCulled=false; streaks.visible=false; streaks.userData.nc=true; streaks.renderOrder=4; scene.add(streaks);
const hd=new Uint8Array(N*4), htex=new THREE.DataTexture(hd,NX,NZ,THREE.RGBAFormat); htex.magFilter=THREE.LinearFilter; htex.minFilter=THREE.LinearFilter;
const hgeo=new THREE.PlaneGeometry(NX*h,NZ*h); hgeo.rotateX(-Math.PI/2);
const heat=new THREE.Mesh(hgeo,new THREE.MeshBasicMaterial({map:htex,transparent:true,depthWrite:false}));
heat.position.set(X0+NX*h/2,0.035,Z0+NZ*h/2); heat.visible=false; heat.userData.nc=true; heat.renderOrder=3; scene.add(heat);
const col=new THREE.Color();
function tcol(t){const k=Math.max(0,Math.min(1,(t-16)/16)); if(k<0.5) col.setRGB(0.15+1.5*k,0.45+0.9*k,1); else col.setRGB(1,1.35-1.5*(k-0.5)-0.45,1-1.9*(k-0.5)); return col;}
function spawn(i){
  for(let n=0;n<30;n++){const c=(Math.random()*N)|0; if(solid[c]) continue;
    ppos[i*3]=X0+((c%NX)+Math.random())*h; ppos[i*3+1]=1.25+Math.random()*0.5; ppos[i*3+2]=Z0+(((c/NX)|0)+Math.random())*h; page[i]=2+Math.random()*5; return;}
}
let frameNo=0;
function draw(dt){
  for(let i=0;i<NP;i++){
    const x=ppos[i*3], z=ppos[i*3+2], c=iz(z)*NX+ix(x);
    if(c<0||c>=N||solid[c]||(page[i]-=dt)<0){spawn(i); continue;}
    const a=sample(u,x,z), b=sample(v,x,z), sp=Math.hypot(a,b);
    ppos[i*3]=x+a*dt*2.2; ppos[i*3+2]=z+b*dt*2.2;
    tcol(sample(T,x,z)); const f=Math.min(1,sp*2.6), br=0.9-0.75*f;                  // slow air: a dot. fast air: the dot fades and a line takes over
    pcol[i*3]=col.r*br; pcol[i*3+1]=col.g*br; pcol[i*3+2]=col.b*br;
    const len=Math.min(0.9,sp*1.6), k=sp>1e-4?len/sp:0, o=i*6, y=ppos[i*3+1];
    lpos[o]=ppos[i*3]; lpos[o+1]=y; lpos[o+2]=ppos[i*3+2]; lpos[o+3]=ppos[i*3]-a*k; lpos[o+4]=y; lpos[o+5]=ppos[i*3+2]-b*k;
    lcol[o]=col.r; lcol[o+1]=col.g; lcol[o+2]=col.b; lcol[o+3]=col.r*0.15; lcol[o+4]=col.g*0.15; lcol[o+5]=col.b*0.15;
    if(sp<0.02) page[i]-=dt*3;
  }
  pg.attributes.position.needsUpdate=true; pg.attributes.color.needsUpdate=true; lg.attributes.position.needsUpdate=true; lg.attributes.color.needsUpdate=true;
  if(frameNo++%4===0){
    for(let j=0;j<NZ;j++) for(let i=0;i<NX;i++){const c=j*NX+i, o=((NZ-1-j)*NX+i)*4;
      if(solid[c]){hd[o+3]=0; continue;} tcol(T[c]); hd[o]=col.r*255; hd[o+1]=Math.min(255,col.g*255); hd[o+2]=col.b*255; hd[o+3]=120;}
    htex.needsUpdate=true;
  }
}
let infoT=0;
function airInfo(){
  const sum=[0,0,0,0,0,0], cnt=[0,0,0,0,0,0], spd=[0,0,0,0,0,0];
  for(let c=0;c<N;c++){const r=roomOf[c]; if(r<0||solid[c]) continue; sum[r]+=T[c]; spd[r]+=Math.hypot(u[c],v[c]); cnt[r]++;}
  let t='<tr><td class="note" style="font-weight:400">Room</td><td class="sw note">Air</td><td class="sw note">Movement</td></tr>';
  ROOMS.forEach(function(k,i){if(!cnt[i]) return; const s=spd[i]/cnt[i];
    t+='<tr><td>'+A.rooms[k].name+'</td><td class="sw">'+(sum[i]/cnt[i]).toFixed(1)+'°C</td><td class="sw">'+(s<0.03?'still':s<0.12?'light':s<0.3?'moving':'breezy')+'</td></tr>';});
  $('airTbl').innerHTML=t;
  let msg='Outside: '+outdoorT().toFixed(0)+'°C. ';
  if(air.mode==='win'){const n=['kitchen','bed1','bed2','bath'].filter(function(k){return air.open[k];}).length+(air.door.entrance?1:0);
    msg+=n<2?'Only one opening: air barely moves. Open a second one on another side for a cross-breeze.':air.speed<0.5?'No wind, so no cross-breeze.':'';}
  $('airInfo').textContent=msg;
}
function setAir(m){
  air.mode=m; $('segAir').querySelectorAll('button').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.m===m);});
  $('airWin').hidden=m!=='win'; $('airAc').hidden=m!=='ac'; $('airCommon').hidden=m==='off';
  const show=m!=='off'&&on; pts.visible=show; heat.visible=show; streaks.visible=show; renderOpen();
  if(m!=='off'){buildMask(); resetT(); for(let i=0;i<NP;i++) spawn(i); airInfo();}
}
$('segAir').onclick=function(e){const b=e.target.closest('button'); if(b) setAir(b.dataset.m);};
function renderOpen(){             // toggle buttons, and the real windows and doors follow them
  const pill=function(a,k,name,on){return '<button class="chip" data-'+a+'="'+k+'" aria-pressed="'+on+'">'+name+(on?' · open':' · closed')+'</button>';};
  $('airWins').innerHTML=WIN_NAMES.map(function(q){return pill('o',q[0],q[1],air.open[q[0]]);}).join('');
  $('airDrs').innerHTML=DOOR_NAMES.map(function(q){return pill('d',q[0],q[1],air.door[q[0]]);}).join('');
  const act=on&&air.mode!=='off';
  DOOR_NAMES.forEach(function(q){const d=A.door(q[0]); if(d) d.force=act?(air.door[q[0]]?1:0):null;});
}
$('airWins').onclick=function(e){const b=e.target.closest('button'); if(!b) return; air.open[b.dataset.o]=!air.open[b.dataset.o]; renderOpen(); buildMask();};
$('airDrs').onclick=function(e){const b=e.target.closest('button'); if(!b) return; air.door[b.dataset.d]=!air.door[b.dataset.d]; renderOpen(); buildMask();};
$('segWind').onclick=function(e){const b=e.target.closest('button'); if(!b) return; air.wind=b.dataset.w; $('segWind').querySelectorAll('button').forEach(function(x){x.setAttribute('aria-pressed',x===b);}); buildMask();};
$('windSpeed').oninput=function(e){air.speed=+e.target.value; $('windLbl').textContent=air.speed+' m/s'; buildMask();};
$('airAc').onchange=function(e){const k=e.target.dataset.ac; if(k) air.ac[k]=e.target.checked;};
$('acTemp').oninput=function(e){air.set=+e.target.value; $('acTempLbl').textContent=air.set+'°C';};
$('segFan').onclick=function(e){const b=e.target.closest('button'); if(!b) return; air.fan=+b.dataset.f; $('segFan').querySelectorAll('button').forEach(function(x){x.setAttribute('aria-pressed',x===b);});};
$('airReset').onclick=function(){resetT(); airInfo();};
A.layoutFns.push(function(){if(on&&air.mode!=='off') buildMask();});

A.frameFns.push(function(dt,t){
  if(!on) return;
  if(playing){sunS.hour+=dt*1.5; if(sunS.hour>=20){sunS.hour=20; playing=false; $('sunPlay').textContent='Play the day';} $('sunHour').value=sunS.hour; applySun();}
  (A.panes||[]).forEach(function(p){                    // sliding panes: an open window pushes one half over the other
    const tg=(air.mode!=='off'&&air.open[WINKEY[p.wall]])?1:0; if(p.cur===tg) return;
    const d=tg-p.cur, q=dt*2; p.cur=Math.abs(d)<=q?tg:p.cur+Math.sign(d)*q; p.m.scale.x=1-0.5*p.cur; p.m.position.x=p.x+p.w*0.25*p.cur; A.touch(2);});
  if(air.mode!=='off'){step(0.04); step(0.04); step(0.04); draw(dt); if(t-infoT>0.7){infoT=t; airInfo();}}
});

/* =====================================================================
   The tab
   ===================================================================== */
function setClimate(v){
  if(v===on) return;
  if(v){
    A.setMode(false); A.setEdit(false);
    on=true; $('pDesign').hidden=true; $('pClimate').hidden=false; $('tabDesign').setAttribute('aria-pressed',false); $('tabClimate').setAttribute('aria-pressed',true);
    realSun(true); setAir(air.mode);
    A.fly(new THREE.Vector3(10.5,11,-9.5),new THREE.Vector3(2.9,0.3,0.6),800);
  }else{
    on=false; playing=false; $('sunPlay').textContent='Play the day'; $('pClimate').hidden=true; $('tabClimate').setAttribute('aria-pressed',false);
    pts.visible=false; heat.visible=false; streaks.visible=false; realSun(false); renderOpen();
    (A.panes||[]).forEach(function(q){q.cur=0; q.m.scale.x=1; q.m.position.x=q.x;});
  }
}
A.setClimate=setClimate; A.climate={sun:sunS,air:air,sunAt:sunAt,setSeason:setSeason,setAir:setAir,T:T,u:u,v:v,applySun:applySun,roomTemps:function(){airInfo(); return $('airTbl').textContent;}};
$('tabClimate').onclick=function(){setClimate(true);};
$('tabDesign').addEventListener('click',function(){setClimate(false);}); $('tabSims').addEventListener('click',function(){setClimate(false);});
})();
