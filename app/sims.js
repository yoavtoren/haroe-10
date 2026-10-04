/* Haroe 10 — Sims mode: people, walking, actions, lights and shutters, friends, pajama party */
(function(){
'use strict';
const A=window.APP, D=A.D, K=A.kit, S=A.state, W=D.W, L=D.L, KX=D.KX, KZ=D.KZ, AZ=A.AZ, BA=A.BA, WC=A.WC, ZW=D.ZW, BLK=D.BLK;
const scene=A.scene, camera=A.camera, controls=A.controls, R=Math.PI;
const $=function(id){return document.getElementById(id);};
const actors=new THREE.Group(); actors.userData.nc=true; actors.visible=false; scene.add(actors);

/* =====================================================================
   People
   ===================================================================== */
const LOOKS={
  angela:{id:'angela',name:'Angela',h:1.64,skin:0xe2b28f,hair:0x2e1c14,style:'curly',top:0xd6a21e,pants:0x3d5a80,shoes:0xf3ebdc,pj:0xe9b3a2,slim:true},
  yoav:{id:'yoav',name:'Yoav',h:1.8,skin:0xdcab85,hair:0x2a1e17,style:'short',beard:'goatee',top:0x1f5a41,pants:0x2b2f38,shoes:0x3a2c20,pj:0x9db7dd}
};
const FRIENDS=[
  {id:'maya',name:'Maya',h:1.62,skin:0xd9a47f,hair:0x2a1a12,style:'curly',top:0x9fc4d6,pants:0xf3ebdc,pj:0xf2d98a,slim:true},
  {id:'itai',name:'Itai',h:1.82,skin:0xc99a72,hair:0x1b1512,style:'short',beard:'full',top:0x26386b,pants:0x6b6f76,pj:0xa9c7b0},
  {id:'nofar',name:'Nofar',h:1.66,skin:0xe8bfa0,hair:0x7a4a2a,style:'long',top:0xc4673f,pants:0x2b2f38,pj:0xf1c9d4,slim:true},
  {id:'alon',name:'Alon',h:1.78,skin:0xe4b594,hair:0xb5803f,style:'short',top:0xf3ebdc,pants:0x3d5a80,pj:0xc7b8e6},
  {id:'ben',name:'Ben',h:1.85,skin:0x8a5a3c,hair:0x120d0a,style:'bald',beard:'full',top:0x8fbd9b,pants:0x2b2f38,pj:0x9fd0d8},
  {id:'guy',name:'Guy',h:1.74,skin:0xcf9e78,hair:0x3a2a1c,style:'short',top:0xe8c91a,pants:0x3b3f3c,pj:0xb9d48a}
];
const css=function(c){return '#'+('000000'+c.toString(16)).slice(-6);};

function makePerson(spec){
  const g=new THREE.Group(); actors.add(g);
  const mats=[];
  const mk=function(c){const m=new THREE.MeshLambertMaterial({color:c}); mats.push({m:m,b:new THREE.Color(c)}); return m;};
  const skin=mk(spec.skin), top=mk(spec.top), pants=mk(spec.pants), hair=mk(spec.hair), hair2=mk(spec.hair), shoe=mk(spec.shoes||0x2b2b2b), dark=mk(0x1c1a19), lip=mk(0x9a5046);
  hair2.color.offsetHSL(0,0,0.05); mats[4].b.copy(hair2.color);
  const put=function(geo,mat,p,x,y,z){const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.castShadow=true; p.add(m); return m;};
  const cg=function(rt,rb,h){return new THREE.CylinderGeometry(rt,rb,h,12);}, sg=function(r){return new THREE.SphereGeometry(r,14,10);};
  const sc=spec.h/1.72, ws=spec.slim?0.9:1;
  g.scale.setScalar(sc);
  const rig=new THREE.Group(); g.add(rig);
  const hips=new THREE.Group(); rig.add(hips); hips.position.y=0.88;
  put(cg(0.165*ws,0.15*ws,0.17),pants,hips,0,0,0).scale.z=0.66;
  const torso=new THREE.Group(); hips.add(torso);
  put(cg(0.185*ws,0.15*ws,0.46),top,torso,0,0.3,0).scale.z=0.62;
  [-1,1].forEach(function(s){put(sg(0.085),top,torso,s*0.165*ws,0.5,0);});
  put(cg(0.045,0.05,0.1),skin,torso,0,0.585,0);
  const head=new THREE.Group(); head.position.set(0,0.71,0); torso.add(head);
  put(sg(0.115),skin,head,0,0,0).scale.set(0.95,1.08,1);
  [-1,1].forEach(function(s){put(sg(0.014),dark,head,s*0.04,0.018,0.103);});
  put(sg(0.016),skin,head,0,-0.012,0.115);
  put(new THREE.BoxGeometry(0.04,0.009,0.01),lip,head,0,-0.052,0.104);
  /* hair */
  const cap=function(){const m=put(new THREE.SphereGeometry(0.124,14,10,0,Math.PI*2,0,Math.PI*0.54),hair,head,0,0.012,-0.008); m.rotation.x=-0.38; return m;};
  if(spec.style==='short') cap();
  else if(spec.style==='long'){cap(); put(sg(0.12),hair,head,0,-0.1,-0.075).scale.set(1.02,1.55,0.6);}
  else if(spec.style==='bun'){cap(); put(sg(0.058),hair,head,0,0.135,-0.05);}
  else if(spec.style==='curly'){                       // a full head of curls, down to the shoulders
    const r=A.rng(42);
    for(let i=0;i<64;i++){
      const y=r()*1.35-0.35, a=r()*Math.PI*2, q=Math.sqrt(Math.max(0,1-y*y)), dx=q*Math.cos(a), dz=q*Math.sin(a);
      if(dz>0.3&&y<0.5) continue;
      put(sg(0.036+r()*0.022),i%3?hair:hair2,head,dx*0.128,y*0.135+0.012,dz*0.132-0.006);
    }
    for(let i=0;i<34;i++){
      const a=Math.PI*(1.02+r()*0.96), y=-0.03-r()*0.2, rad=0.125+r()*0.035;
      put(sg(0.036+r()*0.02),i%3?hair:hair2,head,Math.cos(a)*rad,y,Math.sin(a)*rad*0.95+0.01);
    }
    [-1,1].forEach(function(s){for(let i=0;i<5;i++) put(sg(0.035+r()*0.015),hair,head,s*(0.118+r()*0.02),-0.02-i*0.042,0.025-r()*0.03);});
  }
  /* beard */
  if(spec.beard==='goatee'){                           // short French beard: moustache joined to a trimmed chin
    put(new THREE.BoxGeometry(0.074,0.015,0.016),hair,head,0,-0.034,0.106);
    put(sg(0.034),hair,head,0,-0.094,0.083).scale.set(1.2,0.72,0.7);
    [-1,1].forEach(function(s){put(new THREE.BoxGeometry(0.013,0.056,0.014),hair,head,s*0.039,-0.06,0.099);});
  }else if(spec.beard==='full'){
    put(new THREE.SphereGeometry(0.119,14,10,0,Math.PI*2,Math.PI*0.56,Math.PI*0.44),hair,head,0,0.0,0.004).scale.set(0.97,1.1,1.03);
    put(new THREE.BoxGeometry(0.074,0.015,0.016),hair,head,0,-0.034,0.108);
  }
  /* arms and legs */
  const limb=function(s){
    const arm=new THREE.Group(); arm.position.set(s*(0.2*ws+0.035),0.5,0); arm.rotation.z=s*0.07; torso.add(arm);
    put(cg(0.046,0.04,0.28),top,arm,0,-0.14,0);
    const fore=new THREE.Group(); fore.position.y=-0.28; arm.add(fore);
    put(cg(0.037,0.033,0.25),skin,fore,0,-0.125,0); put(sg(0.042),skin,fore,0,-0.27,0);
    const leg=new THREE.Group(); leg.position.set(s*0.085,-0.02,0); hips.add(leg);
    put(cg(0.075,0.06,0.42),pants,leg,0,-0.21,0);
    const knee=new THREE.Group(); knee.position.y=-0.42; leg.add(knee);
    put(cg(0.058,0.045,0.4),pants,knee,0,-0.2,0); put(new THREE.BoxGeometry(0.09,0.06,0.22),shoe,knee,0,-0.415,0.045);
    return {arm:arm,fore:fore,leg:leg,knee:knee};
  };
  const Lm=limb(-1), Rm=limb(1);
  const p={g:g,head:head,mats:mats,sc:sc,sit:0,lie:0,walk:0,sitT:0,lieT:0,walking:false,phase:0,seatY:0.45,lieY:0.45,knee:1,recline:0,pjOn:false};
  const baseTop=new THREE.Color(spec.top), basePants=new THREE.Color(spec.pants), baseShoe=new THREE.Color(spec.shoes||0x2b2b2b);
  p.outfit=function(pj){
    p.pjOn=pj;
    if(pj){mats[1].b.set(spec.pj); mats[2].b.set(spec.pj).multiplyScalar(0.86); mats[5].b.set(0xf3ebdc);}
    else{mats[1].b.copy(baseTop); mats[2].b.copy(basePants); mats[5].b.copy(baseShoe);}
  };
  p.tint=function(t){for(let i=0;i<mats.length;i++) mats[i].m.color.copy(mats[i].b).multiply(t);};
  p.update=function(dt){
    const k=Math.min(1,dt*9);
    p.sit+=(p.sitT-p.sit)*k; p.lie+=(p.lieT-p.lie)*k; p.walk+=((p.walking?1:0)-p.walk)*Math.min(1,dt*10);
    if(p.walking) p.phase+=dt*9.5;
    const sw=Math.sin(p.phase)*0.62*p.walk, s=p.sit, kn=p.knee;
    hips.position.y=0.88+(((p.seatY+0.085)/sc)-0.88)*s+Math.abs(Math.cos(p.phase))*0.018*p.walk;
    Lm.leg.rotation.x=-s*R/2*0.97+sw; Rm.leg.rotation.x=-s*R/2*0.97-sw;
    Lm.knee.rotation.x=s*R/2*kn+Math.max(0,-Math.sin(p.phase))*0.75*p.walk; Rm.knee.rotation.x=s*R/2*kn+Math.max(0,Math.sin(p.phase))*0.75*p.walk;
    Lm.arm.rotation.x=-sw*0.8-0.2*s; Rm.arm.rotation.x=sw*0.8-0.2*s;
    Lm.fore.rotation.x=Rm.fore.rotation.x=-0.25*p.walk-1.05*s*(1-p.lie);
    torso.rotation.x=-p.recline*s;
    rig.rotation.x=-p.lie*R/2; rig.position.set(0,p.lie*(p.lieY+0.11)/sc,p.lie*0.86);
  };
  return p;
}

/* =====================================================================
   Walking: a 10 cm grid over the flat, A* and string pulling
   ===================================================================== */
const CS=0.1, GX0=-0.2, GZ0=AZ-0.2, NX=Math.ceil((KX+0.4)/CS), NZ=Math.ceil((L-AZ+0.4)/CS), RAD=0.13;
const free=new Uint8Array(NX*NZ);
const EX=(D.entrance[0]+D.entrance[1])/2, SPAWN=L-0.5;      // centre of the front door; where people stand just inside it
const PASS=[[D.door1[0]+0.1,D.door1[1]-0.1,-0.35,0.35],[D.door2[0]+0.1,D.door2[1]-0.1,-0.35,0.35],
  [W-0.3,D.LBX+0.35,D.bathDoor[0]+0.1,D.bathDoor[1]-0.1],[D.wcDoor[0]+0.1,D.wcDoor[1]-0.1,ZW-0.45,ZW+0.35],
  [W-0.2,W+0.2,0.2,2.0],[0.2,BLK-0.2,ZW-0.3,ZW+0.3],[0.2,D.NX-0.3,D.NZ-0.3,D.NZ+0.3]];
const bb=new THREE.Box3();
function fillRect(x0,x1,z0,z1,v){
  const i0=Math.max(0,Math.ceil((x0-GX0)/CS-0.5)), i1=Math.min(NX-1,Math.floor((x1-GX0)/CS-0.5));
  const j0=Math.max(0,Math.ceil((z0-GZ0)/CS-0.5)), j1=Math.min(NZ-1,Math.floor((z1-GZ0)/CS-0.5));
  for(let j=j0;j<=j1;j++) for(let i=i0;i<=i1;i++) free[j*NX+i]=v;
}
function collect(o){
  if(!o.visible||o.userData.nc) return;
  if(o.isMesh&&!o.userData.floor){
    const geo=o.geometry; if(!geo.boundingBox) geo.computeBoundingBox();
    bb.copy(geo.boundingBox).applyMatrix4(o.matrixWorld);
    if(bb.max.y>0.1&&bb.min.y<1.25&&bb.max.y-bb.min.y>0.05) fillRect(bb.min.x-RAD,bb.max.x+RAD,bb.min.z-RAD,bb.max.z+RAD,0);
  }
  for(let i=0;i<o.children.length;i++) collect(o.children[i]);
}
function buildNav(){
  free.fill(0);
  for(const k in A.rooms) A.rooms[k].rs.forEach(function(r){fillRect(r[0]+RAD,r[1]-RAD,r[2]+RAD,r[3]-RAD,1);});
  scene.updateMatrixWorld(true); collect(scene);
  PASS.forEach(function(p){fillRect(p[0],p[1],p[2],p[3],1);});
  // keep only what can be reached from just inside the front door
  const start=cell(EX,SPAWN), seen=new Uint8Array(NX*NZ), q=[start]; if(start<0||!free[start]) return; seen[start]=1;
  while(q.length){const c=q.pop(), i=c%NX, j=(c-i)/NX;
    if(i>0&&free[c-1]&&!seen[c-1]){seen[c-1]=1; q.push(c-1);} if(i<NX-1&&free[c+1]&&!seen[c+1]){seen[c+1]=1; q.push(c+1);}
    if(j>0&&free[c-NX]&&!seen[c-NX]){seen[c-NX]=1; q.push(c-NX);} if(j<NZ-1&&free[c+NX]&&!seen[c+NX]){seen[c+NX]=1; q.push(c+NX);}}
  for(let c=0;c<free.length;c++) free[c]=seen[c];
}
function cell(x,z){const i=Math.floor((x-GX0)/CS), j=Math.floor((z-GZ0)/CS); return (i<0||j<0||i>=NX||j>=NZ)?-1:j*NX+i;}
function isFree(x,z){const c=cell(x,z); return c>=0&&free[c]===1;}
function cx(c){return GX0+((c%NX)+0.5)*CS;} function cz(c){return GZ0+(Math.floor(c/NX)+0.5)*CS;}
function nearest(x,z){
  const c0=cell(Math.min(KX+0.1,Math.max(-0.1,x)),Math.min(L+0.1,Math.max(AZ-0.1,z))); if(c0>=0&&free[c0]) return c0;
  const i0=Math.floor((x-GX0)/CS), j0=Math.floor((z-GZ0)/CS); let best=-1, bd=1e9;
  for(let r=1;r<40;r++){
    for(let j=j0-r;j<=j0+r;j++) for(let i=i0-r;i<=i0+r;i++){
      if(Math.max(Math.abs(i-i0),Math.abs(j-j0))!==r||i<0||j<0||i>=NX||j>=NZ) continue;
      const c=j*NX+i; if(!free[c]) continue; const d=Math.hypot(cx(c)-x,cz(c)-z); if(d<bd){bd=d; best=c;}
    }
    if(best>=0&&bd<=(r+1)*CS) return best;
  }
  return best;
}
function los(x0,z0,x1,z1){const d=Math.hypot(x1-x0,z1-z0), n=Math.ceil(d/0.04); for(let i=1;i<n;i++){const t=i/n; if(!isFree(x0+(x1-x0)*t,z0+(z1-z0)*t)) return false;} return true;}
function findPath(x0,z0,x1,z1){
  const s=nearest(x0,z0), t=nearest(x1,z1); if(s<0||t<0) return [];
  const N=NX*NZ, g=new Float32Array(N).fill(1e9), from=new Int32Array(N).fill(-1), done=new Uint8Array(N), heap=[];
  const push=function(f,c){heap.push([f,c]); let i=heap.length-1; while(i>0){const p=(i-1)>>1; if(heap[p][0]<=heap[i][0]) break; const tmp=heap[p]; heap[p]=heap[i]; heap[i]=tmp; i=p;}};
  const pop=function(){const top=heap[0], last=heap.pop(); if(heap.length){heap[0]=last; let i=0; for(;;){const l=2*i+1, r=l+1; let m=i; if(l<heap.length&&heap[l][0]<heap[m][0]) m=l; if(r<heap.length&&heap[r][0]<heap[m][0]) m=r; if(m===i) break; const tmp=heap[m]; heap[m]=heap[i]; heap[i]=tmp; i=m;}} return top;};
  const ti=t%NX, tj=(t-ti)/NX, hh=function(c){const i=c%NX, j=(c-i)/NX, dx=Math.abs(i-ti), dz=Math.abs(j-tj); return (dx+dz)+(Math.SQRT2-2)*Math.min(dx,dz);};
  g[s]=0; push(hh(s),s);
  while(heap.length){
    const c=pop()[1]; if(done[c]) continue; done[c]=1; if(c===t) break;
    const i=c%NX, j=(c-i)/NX;
    for(let dj=-1;dj<=1;dj++) for(let di=-1;di<=1;di++){
      if(!di&&!dj) continue; const ni=i+di, nj=j+dj; if(ni<0||nj<0||ni>=NX||nj>=NZ) continue;
      const n=nj*NX+ni; if(!free[n]||done[n]) continue;
      if(di&&dj&&(!free[c+di]||!free[c+dj*NX])) continue;
      const ng=g[c]+(di&&dj?Math.SQRT2:1); if(ng<g[n]){g[n]=ng; from[n]=c; push(ng+hh(n),n);}
    }
  }
  if(from[t]<0&&t!==s) return [[cx(t),cz(t)]];
  const cells=[]; for(let c=t;c>=0;c=from[c]) cells.push(c); cells.reverse();
  const pts=cells.map(function(c){return [cx(c),cz(c)];});
  if(isFree(x1,z1)) pts.push([x1,z1]);
  const out=[pts[0]]; let i=0;
  while(i<pts.length-1){let j=pts.length-1; while(j>i+1&&!los(pts[i][0],pts[i][1],pts[j][0],pts[j][1])) j--; out.push(pts[j]); i=j;}
  return out;
}
A.nav={build:buildNav,isFree:isFree,path:findPath,free:free,NX:NX,NZ:NZ};

/* =====================================================================
   Actors
   ===================================================================== */
const timers=[];
function later(sec,fn,owner){const t={at:A.t+sec,fn:fn,owner:owner}; timers.push(t); return t;}
function cancelTimers(owner){for(let i=timers.length-1;i>=0;i--) if(timers[i].owner===owner) timers.splice(i,1);}
function angLerp(a,b,k){let d=b-a; while(d>R) d-=2*R; while(d<-R) d+=2*R; return a+d*k;}

function Actor(spec,me){
  this.spec=spec; this.me=!!me; this.p=makePerson(spec);
  this.x=EX; this.z=SPAWN; this.h=R; this.hT=R; this.path=[]; this.cb=null; this.seat=null; this.held=null;
  this.speed=me?2.3:1.8; this.tag=A.tag(spec.name,me?'me':'who'); this.bubble=null; this.zz=null; this.room=null; this.ver=-1; this.slide=null;
  this.gone=false;
}
Actor.prototype.release=function(){
  if(this.held){if(this.held.occ===this) this.held.occ=null; this.held=null;}
  if(this.seat){
    if(this.seat.occ===this) this.seat.occ=null; this.seat=null;
    const c=nearest(this.x,this.z); if(c>=0){this.x=cx(c); this.z=cz(c);}
  }
  this.p.sitT=0; this.p.lieT=0; this.slide=null; this.sleep(false);
};
Actor.prototype.goTo=function(x,z,cb){
  this.release();
  this.path=findPath(this.x,this.z,x,z); this.cb=cb||null;
  if(!this.path.length){this.cb=null; if(cb) cb();}
};
/* walk to a seat, then settle into it. mode: 'floor' sits on a lying spot with legs out */
Actor.prototype.sitOn=function(seat,cb,mode){
  if(seat.occ&&seat.occ!==this) return false;
  this.release(); seat.occ=this; this.held=seat;
  const self=this, ax=seat.x+Math.sin(seat.h)*0.6, az=seat.z+Math.cos(seat.h)*0.6;
  this.path=findPath(this.x,this.z,ax,az);
  this.cb=function(){self.settle(seat,cb,mode);};
  if(!this.path.length){const f=this.cb; this.cb=null; f();}
  return true;
};
Actor.prototype.settle=function(seat,cb,mode){
  const self=this, p=this.p, lie=seat.type==='lie'&&mode!=='floor';
  this.seat=seat; this.held=seat; seat.occ=this;
  const up=seat.type==='lie'&&mode==='floor'?0.3:0;          // sitting up on a mattress: shift toward the pillow
  this.slide={fx:this.x,fz:this.z,tx:seat.x-Math.sin(seat.h)*up,tz:seat.z-Math.cos(seat.h)*up,t:0,dur:0.4,then:cb||null}; this.hT=seat.h;
  p.seatY=seat.y; p.lieY=seat.y; p.recline=seat.recline||0; p.knee=(seat.type==='lie')?0.08:1;
  p.sitT=lie?0:1; p.lieT=lie?1:0;
};
Actor.prototype.say=function(text,sec){
  const self=this; if(this.bubble) this.bubble.remove();
  this.bubble=A.tag(text,'say'); const b=this.bubble;
  later(sec||2.4,function(){b.remove(); if(self.bubble===b) self.bubble=null;},this);
};
Actor.prototype.sleep=function(on){
  if(on&&!this.zz) this.zz=A.tag('z z z','zzz');
  if(!on&&this.zz){this.zz.remove(); this.zz=null;}
};
Actor.prototype.update=function(dt){
  const p=this.p;
  if(this.slide){
    const s=this.slide; s.t=Math.min(1,s.t+dt/s.dur); const e=s.t*s.t*(3-2*s.t);
    this.x=s.fx+(s.tx-s.fx)*e; this.z=s.fz+(s.tz-s.fz)*e; p.walking=false;
    if(s.t>=1){this.slide=null; if(s.then) s.then();}
  }else if(this.path.length){
    let step=this.speed*dt; p.walking=true;
    while(step>0&&this.path.length){
      const t=this.path[0], dx=t[0]-this.x, dz=t[1]-this.z, d=Math.hypot(dx,dz);
      if(d<=step){this.x=t[0]; this.z=t[1]; step-=d; this.path.shift();}
      else{this.x+=dx/d*step; this.z+=dz/d*step; this.hT=Math.atan2(dx,dz); step=0;}
    }
    if(!this.path.length){p.walking=false; const f=this.cb; this.cb=null; if(f) f();}
  }else p.walking=!!this.manual;
  this.h=angLerp(this.h,this.hT,Math.min(1,dt*11));
  p.g.position.set(this.x,0,this.z); p.g.rotation.y=this.h; p.update(dt);
  const rm=A.roomAt(this.x,this.z);
  if(rm!==this.room||this.ver!==A.lightVer){this.room=rm; this.ver=A.lightVer; p.tint(this.z>L+0.05?WHITE:A.rooms[rm].tint);}
};
Actor.prototype.remove=function(){
  this.release(); this.gone=true; cancelTimers(this);
  actors.remove(this.p.g); this.tag.remove(); if(this.bubble) this.bubble.remove();
};
const WHITE=new THREE.Color(1,1,1);
const hv=new THREE.Vector3();
Actor.prototype.headPos=function(v){return this.p.head.getWorldPosition(v);};

let player=null, who='angela';
const guests=[];
function makePlayer(){
  let x=EX, z=SPAWN, h=R;
  if(player){x=player.x; z=player.z; h=player.h; player.remove();}
  player=new Actor(LOOKS[who],true); player.x=x; player.z=z; player.h=player.hT=h;
  const c=nearest(x,z); if(c>=0){player.x=cx(c); player.z=cz(c);}
  if(pj.on) player.p.outfit(true);
  A.player=player;
}

/* =====================================================================
   Player actions
   ===================================================================== */
let doing='', token={};
const DOOR={wc:A.door('wc'),bath:A.door('bath'),entrance:A.door('entrance')};
function toast(text){const t=$('toast'); t.textContent=text; t.classList.add('show'); clearTimeout(toast.h); toast.h=setTimeout(function(){t.classList.remove('show');},3200);}
function stopAction(){
  cancelTimers(token); token={}; doing='';
  DOOR.wc.force=null; DOOR.bath.force=null; shower.on(false);
  if(layoutWait){layoutWait=null;}
}
function seatBy(id){const l=A.liveSeats(); for(let i=0;i<l.length;i++) if(l[i].id===id) return l[i]; return null;}
function firstFree(ids){for(let i=0;i<ids.length;i++){const s=seatBy(ids[i]); if(s&&(!s.occ||s.occ===player)) return s;} return null;}
function needLight(room){if(A.rooms[room].light<0.5) setLight(room,true);}
let layoutWait=null;
function afterLayout(fn){if(A.layoutBusy()) layoutWait=fn; else fn();}
A.layoutFns.push(function(){buildNav(); const f=layoutWait; layoutWait=null; if(f) f();});

function coffeeSpot(){          // where the espresso machine lives in this design: [stand x, stand z, facing]
  if(S.design==='a'||S.design==='c') return [KX-1.5,1.9,0];
  const p=A.pieces[S.design==='b'?'cart':'station'], f=p.to[2], fx=Math.cos(f), fz=-Math.sin(f);
  return [p.to[0]+fx*0.65,p.to[1]+fz*0.65,Math.atan2(-fx,-fz)];
}
const ACT={
  sit:function(){
    stopAction();
    const s=firstFree(['sofaM','sofaL','sofaR']); if(!s){toast('The sofa is full.'); return;}
    doing='walking to the sofa'; player.sitOn(s,function(){doing='sitting on the sofa'; refresh();});
  },
  stand:function(){stopAction(); player.release(); refresh();},
  tv:function(){
    const on=A.goal('tv')<0.5; K.tvShow=pj.on?'movie':'day'; A.set('tv',on?1:0);
    toast(on?'TV on.':'TV off.'); refresh();
  },
  shower:function(){
    stopAction(); const sp=A.showerSpot, tk=token;
    doing='heading for the shower';
    player.goTo(sp.ax,sp.az,function(){
      needLight('bath'); DOOR.bath.force=0;
      player.slide={fx:player.x,fz:player.z,tx:sp.x,tz:sp.z,t:0,dur:0.6,then:function(){
        doing='in the shower'; player.hT=R; shower.on(true); refresh();
        later(8,function(){
          shower.on(false);
          player.slide={fx:player.x,fz:player.z,tx:sp.ax,tz:sp.az,t:0,dur:0.6,then:function(){DOOR.bath.force=null; doing=''; toast('Fresh and clean.'); refresh();}};
        },tk);
      }};
    });
  },
  toilet:function(){
    stopAction(); const s=seatBy('wc'), tk=token; if(!s) return;
    doing='going to the guest toilet';
    player.sitOn(s,function(){
      needLight('wc'); DOOR.wc.force=0; doing='in the guest toilet'; refresh();
      later(5.5,function(){toast('Flush.'); DOOR.wc.force=null; player.release(); doing=''; refresh();},tk);
    });
  },
  coffee:function(){
    stopAction(); const tk=token;
    doing='walking to the coffee machine';
    const sp=coffeeSpot();
    player.goTo(sp[0],sp[1],function(){
      player.hT=sp[2]; doing='pulling a shot'; refresh();
      later(3.2,function(){doing=''; player.say('Espresso!'); toast('Coffee is ready.'); refresh();},tk);
    });
  },
  lunch:function(){
    stopAction(); const tk=token;
    if(!S.table&&A.DESIGNS[S.design].table) A.setTable(true);
    doing='setting the table';
    afterLayout(function(){
      if(tk!==token) return;
      const s=firstFree(S.design==='n'?['chairB','chairA']:['gc1','gc3','gc2','gc4']);
      if(!s){doing=''; refresh(); return;}
      player.sitOn(s,function(){doing='having lunch at the table'; refresh();});
    });
  },
  table:function(){stopAction(); if(player.seat) player.release(); A.setTable(!S.table); refresh();},
  lift:function(){A.setLift(!S.lift); refresh();},
  nook:function(){
    stopAction(); const s=firstFree(['nook','desk3']); if(!s) return;
    doing='walking to bedroom 2';
    player.sitOn(s,function(){needLight('bed2'); doing=s.id==='nook'?'reading in the nook':'at the desk'; refresh();});
  },
  desk:function(){
    stopAction(); const s=firstFree(['desk2','desk1']); if(!s) return;
    doing='walking to the study';
    player.sitOn(s,function(){doing='working at the desk'; refresh();});
  },
  bed:function(){
    stopAction(); const s=firstFree(['bedR','bedL']); if(!s) return;
    doing='going to bed';
    player.sitOn(s,function(){doing='in bed'; refresh();});
  }
};

/* shower effects: falling water, steam and the classic pixel censor */
const shower=(function(){
  const g=new THREE.Group(); g.visible=false; g.userData.nc=true; scene.add(g);
  const sp=A.showerSpot, hx=sp.x, hz=sp.z;
  const dropMat=new THREE.MeshBasicMaterial({color:0xcfeaf7,transparent:true,opacity:0.75}), drops=[], rnd=A.rng(77);
  for(let i=0;i<70;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(0.006,0.07,0.006),dropMat); m.position.set(hx+(rnd()-0.5)*0.34,rnd()*2.1,hz+(rnd()-0.5)*0.34); g.add(m); drops.push(m);}
  const steamMat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.1,depthWrite:false}), steam=[];
  for(let i=0;i<9;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(0.2,10,8),steamMat); m.userData.o=rnd()*6; g.add(m); steam.push(m);}
  const cv=document.createElement('canvas'); cv.width=6; cv.height=8; const cg=cv.getContext('2d'), tex=new THREE.CanvasTexture(cv);
  tex.magFilter=THREE.NearestFilter; tex.minFilter=THREE.NearestFilter;
  const censor=new THREE.Sprite(new THREE.SpriteMaterial({map:tex})); censor.scale.set(0.6,0.95,1); g.add(censor);
  let last=0, on=false;
  A.frameFns.push(function(dt,t){
    if(!on) return;
    drops.forEach(function(m){m.position.y-=dt*4.2; if(m.position.y<0.03) m.position.y=2.12;});
    steam.forEach(function(m){const k=((t*0.35+m.userData.o)%1); m.position.set(hx+Math.sin(m.userData.o*3+t)*0.25,0.7+k*1.9,hz+Math.cos(m.userData.o*5+t*0.7)*0.25); m.scale.setScalar(0.6+k);});
    censor.position.set(player.x,0.98*player.p.sc,player.z);
    if(t-last>0.11){last=t; const c=new THREE.Color(player.spec.skin);
      for(let y=0;y<8;y++) for(let x=0;x<6;x++){const v=0.72+Math.random()*0.4; cg.fillStyle='rgb('+Math.min(255,c.r*255*v|0)+','+Math.min(255,c.g*255*v|0)+','+Math.min(255,c.b*255*v|0)+')'; cg.fillRect(x,y,1,1);}
      tex.needsUpdate=true;}
  });
  return {on:function(v){on=v; g.visible=v; censor.visible=v&&camMode!=='eye';}};
})();

/* =====================================================================
   Lights, shutters, time of day
   ===================================================================== */
let evening=false, auto=false;
function focusRooms(){          // the room you are in stays bright, the rest of the flat fades back
  const node=A.simsOn&&player?A.rooms[player.room||'living'].node:null;
  for(const k in A.rooms) A.set('F:'+k,(!node||A.rooms[k].node===node)?1:0);
}
function setLight(room,on){A.set('L:'+room,on?1:0); renderRooms();}
function setShutter(win,open){A.set('S:'+win,open?1:0); renderRooms();}
function setEvening(v){
  evening=v; A.set('day',v?0:1); A.set('candle',v?1:0);
  $('tDay').setAttribute('aria-pressed',!v); $('tEve').setAttribute('aria-pressed',v);
  if(v&&A.simsOn&&player&&A.goal('L:'+player.room)<0.5&&!pj.on) setLight(player.room,true);
}
function renderRooms(){
  let h='';
  for(const k in A.rooms){const r=A.rooms[k], on=A.goal('L:'+k)>0.5;
    h+='<tr class="'+(player&&player.room===k&&A.simsOn?'here':'')+'"><td>'+r.name+'</td>'+
       '<td class="sw"><button class="pill" data-l="'+k+'" aria-pressed="'+on+'">'+(on?'Light on':'Light off')+'</button></td><td class="sw">'+
       (r.shutter?'<button class="pill" data-s="'+r.win+'" aria-pressed="'+(A.goal('S:'+r.win)>0.5)+'">'+(A.goal('S:'+r.win)>0.5?'Shutters open':'Shutters closed')+'</button>':'')+'</td></tr>';
  }
  $('roomsTbl').innerHTML=h;
}
$('roomsTbl').addEventListener('click',function(e){
  const b=e.target.closest('button'); if(!b) return;
  if(b.dataset.l) setLight(b.dataset.l,A.goal('L:'+b.dataset.l)<0.5);
  if(b.dataset.s) setShutter(b.dataset.s,A.goal('S:'+b.dataset.s)<0.5);
});
$('cAuto').onchange=function(e){auto=e.target.checked; if(auto&&player) setLight(player.room,true);};
$('tDay').onclick=function(){setEvening(false);}; $('tEve').onclick=function(){setEvening(true);};
function anyoneIn(room,except){
  if(player!==except&&player.room===room) return true;
  for(let i=0;i<guests.length;i++) if(guests[i].room===room) return true; return false;
}

/* =====================================================================
   Friends
   ===================================================================== */
function roster(){const partner=LOOKS[who==='angela'?'yoav':'angela']; return FRIENDS.concat([partner]).filter(function(f){return !guests.some(function(g){return g.spec.id===f.id;});});}
function freeSeats(){return A.liveSeats().filter(function(s){return s.type==='sit'&&!s.hidden&&s.room==='living'&&!s.occ;});}
function arrive(list,each){
  DOOR.entrance.force=1; player.say('Come in!');
  list.forEach(function(it,i){
    const a=new Actor(it.spec); a.x=EX; a.z=L+0.9+i*0.6; a.h=a.hT=R; guests.push(a);
    if(pj.on) a.p.outfit(true);
    if(it.seat) {it.seat.occ=a; a.held=it.seat;}
    later(0.7+i*1.0,function(){
      a.path=[[EX,SPAWN]];
      a.cb=function(){a.say(['Hi!','Hey!','Shalom!','We are here!'][i%4]); each(a,it);};
    },a);
  });
  later(0.7+list.length*1.0+1.6,function(){if(DOOR.entrance.force===1) DOOR.entrance.force=null; refresh();},guests);
  refresh();
}
function goodbye(){
  if(!guests.length) return;
  if(pj.on) endPJ(true);
  DOOR.entrance.force=1;
  guests.slice().forEach(function(a,i){
    a.leaving=true;
    later(i*0.7,function(){
      a.say('Bye!'); a.goTo(EX,SPAWN,function(){
        a.path=[[EX,L+1.8]]; a.cb=function(){
          a.remove(); const k=guests.indexOf(a); if(k>=0) guests.splice(k,1);
          if(!guests.length){DOOR.entrance.force=null;} refresh();
        };
      });
    },a);
  });
  refresh();
}
let kicking=null;
function kickBar(a){kicking=a; $('guestBar').hidden=!a; if(a) $('guestName').textContent=a.spec.name;}
function kick(a){
  if(!a||a.gone||a.leaving) return;
  a.leaving=true; a.sleep(false); a.say('OK, bye!'); DOOR.entrance.force=1;
  a.goTo(EX,SPAWN,function(){
    a.path=[[EX,L+1.8]]; a.cb=function(){
      a.remove(); const k=guests.indexOf(a); if(k>=0) guests.splice(k,1);
      if(!guests.some(function(g){return g.leaving;})) DOOR.entrance.force=null;
      if(!guests.length&&pj.on) endPJ(true);
      refresh();
    };
  });
  refresh();
}
$('bKick').onclick=function(){const a=kicking; kickBar(null); kick(a);}; $('bGuestKeep').onclick=function(){kickBar(null);};
function clearGuests(){guests.slice().forEach(function(a){a.remove();}); guests.length=0; DOOR.entrance.force=null;}

/* ---------- dialogs ---------- */
function modal(html){$('sheet').innerHTML=html; $('modal').hidden=false; const f=$('sheet').querySelector('button,select'); if(f) f.focus();}
function closeModal(){$('modal').hidden=true; $('sheet').innerHTML='';}
$('modal').addEventListener('click',function(e){if(e.target===$('modal')) closeModal();});
window.addEventListener('keydown',function(e){if(e.key==='Escape'&&!$('modal').hidden) closeModal();});
function chipsHtml(list,sel){return list.map(function(f,i){return '<button class="chip" data-i="'+i+'" aria-pressed="'+(sel.indexOf(i)>=0)+'"><i style="background:'+css(f.top)+'"></i>'+f.name+'</button>';}).join('');}
function assignHtml(people,opts,pick){
  return people.map(function(f,i){return '<span><i style="background:'+css(f.top)+'"></i>'+f.name+'</span><select data-i="'+i+'">'+
    opts.map(function(o,j){return '<option value="'+j+'"'+(pick[i]===j?' selected':'')+'>'+o.label+'</option>';}).join('')+'</select>';}).join('');
}
function wireAssign(pick,redraw){
  $('sheet').querySelectorAll('select').forEach(function(s){s.onchange=function(){
    const i=+s.dataset.i, v=+s.value, other=pick.indexOf(v); if(other>=0&&other!==i) pick[other]=pick[i]; pick[i]=v; redraw();};});
}
function openInvite(){
  const list=roster(), seats=freeSeats(), max=Math.min(6,seats.length,list.length);
  if(!max){toast('There is nowhere left to sit.'); return;}
  let sel=[0,1].slice(0,Math.min(2,max));
  function step1(){
    modal('<h2>Call friends over</h2><p class="sub">How many friends do you want to invite?</p>'+
      '<div class="stepper"><button class="btn" id="mMinus" aria-label="Fewer">−</button><output id="mN">'+sel.length+'</output><button class="btn" id="mPlus" aria-label="More">+</button></div>'+
      '<h3>Who</h3><div class="chips" id="mChips">'+chipsHtml(list,sel)+'</div>'+
      '<div class="foot"><button class="btn" id="mCancel">Cancel</button><button class="btn primary" id="mNext"'+(sel.length?'':' disabled')+'>Next: seating</button></div>');
    $('mMinus').onclick=function(){if(sel.length>1){sel.pop(); step1();}};
    $('mPlus').onclick=function(){if(sel.length<max){for(let i=0;i<list.length;i++) if(sel.indexOf(i)<0){sel.push(i); break;} step1();}};
    $('mChips').onclick=function(e){const b=e.target.closest('button'); if(!b) return; const i=+b.dataset.i, k=sel.indexOf(i);
      if(k>=0) sel.splice(k,1); else if(sel.length<max) sel.push(i); else toast('Only '+max+' free seats.'); step1();};
    $('mCancel').onclick=closeModal; $('mNext').onclick=function(){step2();};
  }
  let pick=null;
  function step2(){
    const people=sel.map(function(i){return list[i];});
    if(!pick||pick.length!==people.length) pick=people.map(function(_,i){return i;});
    modal('<h2>Where does everyone sit?</h2><p class="sub">Pick a seat for each friend.</p><div class="assign">'+assignHtml(people,seats,pick)+'</div>'+
      '<div class="foot"><button class="btn" id="mBack">Back</button><button class="btn primary" id="mGo">Invite</button></div>');
    wireAssign(pick,step2);
    $('mBack').onclick=step1;
    $('mGo').onclick=function(){
      closeModal(); toast('Calling… they are on their way.');
      arrive(people.map(function(f,i){return {spec:f,seat:seats[pick[i]]};}),function(a,it){a.sitOn(it.seat);});
    };
  }
  step1();
}

/* ---------- pajama party ---------- */
const pj={on:false,asleep:false,spots:{}};
const SPOTS=[{id:'sofaLie',label:'On the sofa',sit:'sofaM'},{id:'mat1',label:'Mattress by the sofa'},{id:'mat2',label:'Mattress by the bedroom doors'}];
function openPJ(){
  if(guests.length){toast('Say goodbye to your guests first.'); return;}
  const list=roster(); let sel=[0,1], pick=null;
  function step1(){
    modal('<h2>Pajama party</h2><p class="sub">Who is sleeping over? Up to three friends.</p><div class="chips" id="mChips">'+chipsHtml(list,sel)+'</div>'+
      '<div class="foot"><button class="btn" id="mCancel">Cancel</button><button class="btn primary" id="mNext"'+(sel.length?'':' disabled')+'>Next: who sleeps where</button></div>');
    $('mChips').onclick=function(e){const b=e.target.closest('button'); if(!b) return; const i=+b.dataset.i, k=sel.indexOf(i);
      if(k>=0) sel.splice(k,1); else if(sel.length<3) sel.push(i); else toast('Three sleeping spots: the sofa and two mattresses.'); step1();};
    $('mCancel').onclick=closeModal; $('mNext').onclick=step2;
  }
  function step2(){
    const people=sel.map(function(i){return list[i];});
    if(!pick||pick.length!==people.length) pick=people.map(function(_,i){return i;});
    modal('<h2>Who sleeps where?</h2><p class="sub">You sleep in your own bed. Everyone else stays in the living room.</p><div class="assign">'+assignHtml(people,SPOTS,pick)+'</div>'+
      '<div class="foot"><button class="btn" id="mBack">Back</button><button class="btn primary" id="mGo">Start the party</button></div>');
    wireAssign(pick,step2);
    $('mBack').onclick=step1;
    $('mGo').onclick=function(){closeModal(); startPJ(people.map(function(f,i){return {spec:f,spot:SPOTS[pick[i]]};}));};
  }
  step1();
}
function startPJ(list){
  stopAction(); player.release();
  pj.on=true; pj.asleep=false; S.pj=true; S.table=0; S.lift=0; A.layout(); A.renderPanel();
  setEvening(true);
  ['living','kitchen'].forEach(function(r){A.set('L:'+r,0);}); A.set('string',1); K.tvShow='movie'; A.set('tv',1);
  player.p.outfit(true); player.ver=-1;
  toast('Pajama party! String lights on, movie on.');
  afterLayout(function(){
    arrive(list,function(a,it){
      a.spot=it.spot;
      const s=seatBy(it.spot.sit||it.spot.id); if(!s) return;
      if(it.spot.sit) a.sitOn(s); else a.sitOn(s,null,'floor');
    });
    const s=firstFree(['sofaL','sofaR']); if(s) player.sitOn(s,function(){doing='watching the movie'; refresh();});
  });
  renderRooms(); refresh();
}
function lightsOut(){
  stopAction(); pj.asleep=true;
  A.set('tv',0); A.set('string',0); for(const k in A.rooms) A.set('L:'+k,0);
  guests.forEach(function(a){
    const s=seatBy(a.spot?a.spot.id:'sofaLie'); if(!s) return;
    a.release(); a.sitOn(s,function(){a.sleep(true);});
  });
  const b=firstFree(['bedR','bedL']);
  doing='going to bed';
  if(b) player.sitOn(b,function(){doing='asleep'; player.sleep(true); refresh();});
  toast('Lights out. Good night.'); renderRooms(); refresh();
}
function endPJ(silent){
  pj.on=false; pj.asleep=false; S.pj=false;
  A.set('string',0); A.set('tv',0); K.tvShow='day';
  player.sleep(false); player.p.outfit(false); player.ver=-1;
  guests.forEach(function(a){a.sleep(false); a.p.outfit(false); a.ver=-1; a.release();});
  A.layout(); A.renderPanel();
  if(!silent) afterLayout(function(){
    guests.forEach(function(a){const f=freeSeats(); if(f.length) a.sitOn(f[0]);});
  });
}
function morning(){
  stopAction(); player.release();
  setEvening(false); ['kitchen','bed1','bed2'].forEach(function(w){A.set('S:'+w,1);});
  for(const k in A.rooms) A.set('L:'+k,0);
  guests.forEach(function(a){a.say('Good morning!');});
  endPJ(false); doing=''; toast('Good morning. Shutters open.'); renderRooms(); refresh();
}

/* =====================================================================
   Panel
   ===================================================================== */
function btn(id,label,cls,dis){return '<button class="btn '+(cls||'')+'" data-a="'+id+'"'+(dis?' disabled':'')+'>'+label+'</button>';}
function refresh(){
  if(!player) return;
  const d=A.DESIGNS[S.design], seated=!!player.seat, tvOn=A.goal('tv')>0.5, isNew=S.design!=='n';
  let h='';
  h+=seated?btn('stand','Stand up','primary'):btn('sit','Sit on the sofa','primary');
  h+=btn('tv',tvOn?'Turn the TV off':'Turn the TV on',tvOn?'on':'');
  h+=btn('shower','Take a shower')+btn('toilet','Guest toilet');
  h+=btn('coffee','Make a coffee')+btn('bed','Go to bed');
  h+=btn('nook',isNew?'Read in the nook':'Desk in bedroom 2')+btn('desk',isNew?'Work in the study':'Desk in bedroom 1');
  if(d.table&&!pj.on) h+=btn('lunch','Have lunch at the table')+btn('table',S.table?'Close the dining table':'Open the dining table')+(S.design==='a'?btn('lift',S.lift?'Lower the coffee table':'Raise the coffee table','full'):'');
  else if(!pj.on) h+=btn('lunch','Sit at the dining table','full');
  $('acts').innerHTML=h;
  const hint=guests.length?'<p class="note" style="grid-column:1/-1;margin:0">Tap a friend to send them home.</p>':'';
  let s='';
  if(pj.on){
    s+=pj.asleep?btn('morning','Good morning','primary full'):btn('lightsout','Lights out, good night','primary full');
    s+=btn('goodbye','End the party','full');
  }else{
    s+=btn('invite','Call friends over','primary')+btn('pj','Pajama party');
    if(guests.length) s+=btn('goodbye','Say goodbye to everyone ('+guests.length+')','full');
  }
  s+=hint;
  $('social').innerHTML=s;
  status();
}
let lastStatus='';
function status(){
  if(!player) return;
  const t=player.spec.name+' · '+A.rooms[player.room||'living'].name+(doing?' · '+doing:player.seat?' · sitting':player.path.length?' · walking':'');
  if(t!==lastStatus){lastStatus=t; $('status').textContent=t;}
}
$('acts').addEventListener('click',function(e){const b=e.target.closest('button'); if(b&&ACT[b.dataset.a]) ACT[b.dataset.a]();});
$('social').addEventListener('click',function(e){
  const b=e.target.closest('button'); if(!b) return; const a=b.dataset.a;
  if(a==='invite') openInvite(); else if(a==='pj') openPJ(); else if(a==='goodbye') goodbye(); else if(a==='lightsout') lightsOut(); else if(a==='morning') morning();
});
function setWho(w){
  who=w; $('whoAngela').setAttribute('aria-pressed',w==='angela'); $('whoYoav').setAttribute('aria-pressed',w==='yoav');
  for(let i=guests.length-1;i>=0;i--) if(guests[i].spec.id===w){guests[i].remove(); guests.splice(i,1);}
  stopAction(); makePlayer(); refresh(); renderRooms();
}
$('whoAngela').onclick=function(){setWho('angela');}; $('whoYoav').onclick=function(){setWho('yoav');};

/* =====================================================================
   Camera: follow from above, or look through the player's eyes
   ===================================================================== */
let camMode='follow', yaw=0, pitch=0, lastDrag=-10, freeLook=false;
const eye=new THREE.Vector3(), tgt=new THREE.Vector3(), delta=new THREE.Vector3();
function setCam(m){
  camMode=m; $('camFollow').setAttribute('aria-pressed',m==='follow'); $('camEye').setAttribute('aria-pressed',m==='eye');
  if(m==='eye'){
    controls.enabled=false; wideFov(); camera.near=0.1; yaw=player.h; pitch=-0.05; freeLook=false; player.p.g.visible=false; A.stopFly();
    $('hint').textContent='Drag to look around, tap the floor to walk'; $('hint').style.opacity=1;
  }else{
    controls.enabled=true; camera.fov=40; camera.near=0.1; camera.updateProjectionMatrix(); if(player) player.p.g.visible=true; camera.rotation.order='XYZ';
    if(A.simsOn){$('hint').textContent='Tap the floor to walk. Drag to rotate, pinch or scroll to zoom';}
    if(A.simsOn) flyToPlayer();
  }
}
function wideFov(){          // eye view: an ultra-wide lens, about 125 degrees across, so a whole room fits
  const a=A.stage.clientWidth/Math.max(1,A.stage.clientHeight);
  camera.fov=Math.min(104,Math.max(78,2*Math.atan(Math.tan(62.5*Math.PI/180)/a)*180/Math.PI)); camera.updateProjectionMatrix();
}
window.addEventListener('resize',function(){if(A.simsOn&&camMode==='eye') wideFov();});
function flyToPlayer(){
  tgt.set(player.x,1.0,player.z);
  A.fly(new THREE.Vector3(player.x+3.6,6.6,player.z+4.6),tgt,800);
}
A.eyeView=function(){return A.simsOn&&camMode==='eye';};
$('camFollow').onclick=function(){setCam('follow');}; $('camEye').onclick=function(){setCam('eye');};
function segHit(ax,az,bx,bz,cx_,cz_,dx,dz){
  const r1=bx-ax, r2=bz-az, s1=dx-cx_, s2=dz-cz_, den=r1*s2-r2*s1; if(Math.abs(den)<1e-9) return false;
  const t=((cx_-ax)*s2-(cz_-az)*s1)/den, u=((cx_-ax)*r2-(cz_-az)*r1)/den; return t>0.02&&t<0.98&&u>=0&&u<=1;
}
function wallsVisible(){
  const follow=A.simsOn&&camMode==='follow';
  for(const k in A.walls){const w=A.walls[k]; let vis=true;
    if(follow){const front=(camera.position.x-w.a[0])*w.n[0]+(camera.position.z-w.a[1])*w.n[1]>0;
      if(front&&segHit(camera.position.x,camera.position.z,player.x,player.z,w.a[0],w.a[1],w.b[0],w.b[1])) vis=false;}
    w.g.visible=vis;
  }
}

/* In eye view, only draw rooms you could actually see: your own, plus any reached through an open door.
   Besides saving work, this keeps things standing right behind a wall from flickering through it on phones. */
const NODE={living:'lk',kitchen:'lk',bed1:'bed1',bed2:'bed2',wc:'wc',bath:'bath'};
const LINKS=[['lk','bed1','bed1'],['lk','bed2','bed2'],['lk','wc','wc'],['lk','bath','bath']];
let cullKey='all';
function cullRooms(){
  let vis=null;
  if(A.simsOn&&camMode==='eye'){
    vis={}; const q=[NODE[player.room||'living']]; vis[q[0]]=1;
    while(q.length){const n=q.pop();
      for(let i=0;i<LINKS.length;i++){const l=LINKS[i]; if(A.door(l[2]).cur<=0.02) continue;
        const o=l[0]===n?l[1]:l[1]===n?l[0]:null; if(o&&!vis[o]){vis[o]=1; q.push(o);}}}
  }
  const key=vis?Object.keys(vis).sort().join():'all'; if(key===cullKey) return; cullKey=key;
  for(const k in A.rooms){const on=!vis||!!vis[NODE[k]], ms=A.rooms[k].mats; for(let i=0;i<ms.length;i++) ms[i].m.visible=on||!!ms[i].keep;}
}

/* ---------- pointer: tap the floor to walk, drag to look in eye view ---------- */
const cv=A.renderer.domElement, ray=new THREE.Raycaster(), ndc=new THREE.Vector2(), floorPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0), hit=new THREE.Vector3();
const marker=new THREE.Mesh(new THREE.RingGeometry(0.13,0.19,28),new THREE.MeshBasicMaterial({color:0xE8C91A,transparent:true,opacity:0,depthWrite:false}));
marker.rotation.x=-R/2; marker.position.y=0.03; marker.userData.nc=true; marker.renderOrder=3; scene.add(marker);
let down=null;
cv.addEventListener('pointerdown',function(e){down={x:e.clientX,y:e.clientY,t:performance.now(),lx:e.clientX,ly:e.clientY};});
cv.addEventListener('pointermove',function(e){
  if(!down||!A.simsOn||camMode!=='eye') return;
  yaw+=(e.clientX-down.lx)*0.005; pitch=Math.max(-1.1,Math.min(1.1,pitch-(e.clientY-down.ly)*0.004)); down.lx=e.clientX; down.ly=e.clientY; lastDrag=A.t; freeLook=true;
});
window.addEventListener('pointerup',function(e){
  const d=down; down=null; if(!d||!A.simsOn||e.target!==cv) return;
  if(Math.hypot(e.clientX-d.x,e.clientY-d.y)>7||performance.now()-d.t>500) return;
  const r=cv.getBoundingClientRect(); ndc.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);
  ray.setFromCamera(ndc,camera);
  for(let i=0;i<guests.length;i++){if(guests[i].leaving) continue; if(ray.intersectObject(guests[i].p.g,true).length){kickBar(guests[i]); return;}}   // tap a friend to send them home
  kickBar(null);
  if(!ray.ray.intersectPlane(floorPlane,hit)) return;
  walkTo(hit.x,hit.z);
});
function walkTo(x,z){
  if(x<-0.3||x>KX+0.3||z<AZ-0.3||z>L+0.3) return;
  if(pj.asleep) return;
  stopAction(); const c=nearest(x,z); if(c<0) return;
  marker.position.set(cx(c),0.03,cz(c)); marker.material.opacity=0.9;
  player.goTo(cx(c),cz(c),function(){refresh();}); refresh();
}
A.walkTo=walkTo;

/* ---------- on-screen joysticks: left walks, right looks around ---------- */
const TOUCH=('ontouchstart' in window)||navigator.maxTouchPoints>0||/[?&]sticks/.test(location.search);
function stick(el){
  const knob=el.firstElementChild, s={x:0,y:0,id:null};
  const mv=function(e){
    if(e.pointerId!==s.id) return;
    const r=el.getBoundingClientRect(), m=r.width/2-14; let dx=e.clientX-(r.left+r.width/2), dy=e.clientY-(r.top+r.height/2);
    const d=Math.hypot(dx,dy); if(d>m){dx*=m/d; dy*=m/d;}
    s.x=dx/m; s.y=dy/m; knob.style.transform='translate('+dx+'px,'+dy+'px)'; e.preventDefault();
  };
  const end=function(e){if(e.pointerId!==s.id) return; s.id=null; s.x=s.y=0; knob.style.transform='';};
  el.addEventListener('pointerdown',function(e){s.id=e.pointerId; el.setPointerCapture(e.pointerId); mv(e);});
  el.addEventListener('pointermove',mv); el.addEventListener('pointerup',end); el.addEventListener('pointercancel',end);
  return s;
}
const jMove=stick($('stickMove')), jLook=stick($('stickLook')), sphc=new THREE.Spherical(), offv=new THREE.Vector3();
A.sticks={move:jMove,look:jLook};
function showSticks(on){on=on&&TOUCH; $('stickMove').hidden=!on; $('stickLook').hidden=!on; document.body.classList.toggle('sticks',on);}
function driveSticks(dt){
  const mag=Math.hypot(jMove.x,jMove.y);
  player.manual=false;
  if(mag>0.18&&!pj.asleep){
    if(player.seat||player.held||player.path.length||doing){stopAction(); player.release(); player.path=[]; player.cb=null; refresh();}
    let fx, fz;
    if(camMode==='eye'){fx=Math.sin(yaw); fz=Math.cos(yaw);}
    else{fx=controls.target.x-camera.position.x; fz=controls.target.z-camera.position.z; const n=Math.hypot(fx,fz)||1; fx/=n; fz/=n;}
    const mx=fx*(-jMove.y)-fz*jMove.x, mz=fz*(-jMove.y)+fx*jMove.x, sp=2.4*Math.min(1,mag)*dt;
    const nx=player.x+mx/mag*sp, nz=player.z+mz/mag*sp;
    if(isFree(nx,nz)){player.x=nx; player.z=nz;} else if(isFree(nx,player.z)) player.x=nx; else if(isFree(player.x,nz)) player.z=nz;
    player.hT=Math.atan2(mx,mz); player.manual=true;
  }
  if(Math.hypot(jLook.x,jLook.y)>0.15){
    if(camMode==='eye'){yaw-=jLook.x*dt*2.2; pitch=Math.max(-1.1,Math.min(1.1,pitch+jLook.y*dt*1.5)); freeLook=true; lastDrag=A.t;}
    else if(!A.flying()){
      offv.copy(camera.position).sub(controls.target); sphc.setFromVector3(offv);
      sphc.theta-=jLook.x*dt*2.2; sphc.phi=Math.max(0.2,Math.min(Math.PI/2-0.06,sphc.phi-jLook.y*dt*1.4));
      offv.setFromSpherical(sphc); camera.position.copy(controls.target).add(offv);
    }
  }
}

/* =====================================================================
   Frame
   ===================================================================== */
A.frameFns.push(function(dt,t){
  if(!A.simsOn) return;
  for(let i=timers.length-1;i>=0;i--) if(timers[i].at<=t){const f=timers[i].fn; timers.splice(i,1); f();}
  const before=player.room;
  driveSticks(dt);
  player.update(dt); for(let i=0;i<guests.length;i++) guests[i].update(dt);
  if(player.room!==before){
    focusRooms();
    if(auto&&before){if(!anyoneIn(before,player)) A.set('L:'+before,0); A.set('L:'+player.room,1);}
    renderRooms();
  }
  status();
  // doors swing open for anyone walking up to them
  for(let i=0;i<A.doors.length;i++){const d=A.doors[i]; if(d.id==='entrance'){d.target=0; continue;}
    let near=Math.hypot(player.x-d.cx,player.z-d.cz)<1.0&&!player.seat;
    for(let j=0;j<guests.length&&!near;j++) near=Math.hypot(guests[j].x-d.cx,guests[j].z-d.cz)<1.0&&!guests[j].seat;
    d.target=near?1:0;}
  if(marker.material.opacity>0){marker.material.opacity=Math.max(0,marker.material.opacity-dt*(player.path.length?0.25:2.5)); marker.scale.setScalar(1+0.12*Math.sin(t*7));}
  if(camMode==='eye'){
    if(player.path.length||player.slide||player.manual){if(t-lastDrag>1.2) freeLook=false;}
    if(!freeLook) yaw=angLerp(yaw,player.h,Math.min(1,dt*5));
    player.headPos(eye); camera.position.copy(eye); camera.position.y+=0.03;
    camera.rotation.order='YXZ'; camera.rotation.set(-pitch,yaw+R,0);
  }else if(!A.flying()){
    tgt.set(player.x,1.0,player.z); delta.copy(tgt).sub(controls.target).multiplyScalar(1-Math.exp(-dt*5));
    controls.target.add(delta); camera.position.add(delta);
  }
  wallsVisible(); cullRooms();
});
const tv3=new THREE.Vector3();
A.labelFns.push(function(){
  const all=[player].concat(guests);
  for(let i=0;i<all.length;i++){const a=all[i]; if(!a) continue;
    const show=A.simsOn&&S.labels&&!(a.me&&camMode==='eye');
    a.headPos(tv3); tv3.y+=0.28; A.place(a.tag,tv3,show&&!a.zz&&!a.bubble);
    if(a.zz){tv3.y+=0.12; A.place(a.zz,tv3,A.simsOn);}
    if(a.bubble){A.place(a.bubble,tv3,A.simsOn);}
  }
});

/* =====================================================================
   Entering and leaving Sims mode
   ===================================================================== */
function resetSims(){
  stopAction(); clearGuests(); timers.length=0;
  if(pj.on){pj.on=false; pj.asleep=false; S.pj=false; A.set('string',0); A.set('tv',0); K.tvShow='day'; if(player){player.sleep(false); player.p.outfit(false); player.ver=-1;}}
  if(player){player.release(); player.path=[]; player.x=EX; player.z=SPAWN; player.h=player.hT=R;}
}
A.onDesign=function(){resetSims(); afterLayout(function(){if(player){const c=nearest(player.x,player.z); if(c>=0){player.x=cx(c); player.z=cz(c);}} refresh();});};
A.onPanel=function(){if(player) refresh();};
function setMode(sims){
  A.simsOn=sims;
  $('tabDesign').setAttribute('aria-pressed',!sims); $('tabSims').setAttribute('aria-pressed',sims);
  $('pDesign').hidden=sims; $('pSims').hidden=!sims; actors.visible=sims;
  if(sims){
    if(!player){buildNav(); makePlayer();}
    $('hint').textContent='Tap the floor to walk. Drag to rotate, pinch or scroll to zoom'; $('hint').style.opacity=1;
    setCam('follow'); renderRooms(); refresh(); showSticks(true); player.room=A.roomAt(player.x,player.z); focusRooms(); A.setEdit(false);
  }else{
    showSticks(false);
    if(camMode==='eye') setCam('follow');
    const wasPJ=pj.on; resetSims(); if(wasPJ){A.layout(); A.renderPanel();}
    setEvening(false); for(const k in A.rooms) A.set('L:'+k,0); ['kitchen','bed1','bed2'].forEach(function(w){A.set('S:'+w,1);}); A.set('tv',0);
    for(const k in A.walls) A.walls[k].g.visible=true; cullRooms(); focusRooms(); kickBar(null);
    for(let i=0;i<A.doors.length;i++) A.doors[i].target=0;
    $('hint').textContent='Drag to rotate, pinch or scroll to zoom';
    A.setView('3d');
  }
}
A.setMode=setMode;
$('tabDesign').onclick=function(){setMode(false);}; $('tabSims').onclick=function(){setMode(true);};
A.sims={ACT:ACT,guests:guests,pj:pj,setEvening:setEvening,setLight:setLight,setShutter:setShutter,setCam:setCam,setWho:setWho,startPJ:startPJ,lightsOut:lightsOut,morning:morning,arrive:arrive,goodbye:goodbye,roster:roster,freeSeats:freeSeats,openInvite:openInvite,openPJ:openPJ,get player(){return player;}};

/* ---------- phone in portrait: suggest turning it sideways, once ---------- */
(function(){
  const tip=$('rotateTip'); let seen=false;
  try{seen=localStorage.getItem('haroe-rotate-tip')==='1';}catch(e){}
  function upd(){
    const show=!seen&&TOUCH&&window.innerWidth<window.innerHeight&&window.innerWidth<=700; tip.hidden=!show;
    if(show){seen=true; try{localStorage.setItem('haroe-rotate-tip','1');}catch(e){} setTimeout(function(){tip.hidden=true;},9000);}
  }
  $('bTipClose').onclick=function(){tip.hidden=true;};
  upd();
})();

/* ---------- go ---------- */
A.setDesign('a',true); A.setView('3d',true); A.start();
})();
