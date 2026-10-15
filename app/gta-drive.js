/* Haroe 10 — what driving leaves behind, as in GTA. The back tyres lay black marks on the road when the car slides, brakes hard or spins
   on the handbrake, with white smoke off them; a car that has taken knocks smokes from under its bonnet, grey and then black, and a dead
   one burns a little. People see you coming and throw themselves out of the way; the ones you hit fly. */
(function(){
'use strict';
const A=window.APP, SM=A.sims, D=A.drive, R=Math.PI;
if(!SM||!D||!D.live) return;
const scene=A.scene, OUT=function(){return A.LAYER_OUT||5;};
function clamp(v,a,b){return v<a?a:v>b?b:v;}
function rnd(a){return a[Math.floor(Math.random()*a.length)];}
let layered=false;

/* ---------- skid marks: a ring of dark strips where the back wheels slide ---------- */
const SK=520, skM=new THREE.MeshBasicMaterial({color:0x0e0e0e,transparent:true,opacity:0.5,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-4});
const skids=new THREE.InstancedMesh(new THREE.PlaneGeometry(0.22,1).rotateX(-R/2),skM,SK); skids.count=0; skids.frustumCulled=false; skids.renderOrder=1; skids.userData.nc=true; scene.add(skids);
let skN=0; const last=[null,null], m4=new THREE.Matrix4(), q=new THREE.Quaternion(), v3=new THREE.Vector3(), s3=new THREE.Vector3(), YA=new THREE.Vector3(0,1,0);
function mark(a,b,y){const dx=b[0]-a[0], dz=b[1]-a[1], l=Math.hypot(dx,dz); if(l<0.05||l>3) return;
  v3.set((a[0]+b[0])/2,y+0.018,(a[1]+b[1])/2); q.setFromAxisAngle(YA,Math.atan2(dx,dz)); s3.set(1,1,l); m4.compose(v3,q,s3); skids.setMatrixAt(skN%SK,m4); skN++; skids.count=Math.min(SK,skN); skids.instanceMatrix.needsUpdate=true;}

/* ---------- puffs: tyre smoke, engine smoke, a little fire ---------- */
const puffT=A.canvasTex(64,64,function(g){const gr=g.createRadialGradient(32,32,0,32,32,32); gr.addColorStop(0,'rgba(255,255,255,0.9)'); gr.addColorStop(0.5,'rgba(255,255,255,0.45)'); gr.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=gr; g.fillRect(0,0,64,64);});
const PN=70, puffs=[];
for(let i=0;i<PN;i++){const m=new THREE.SpriteMaterial({map:puffT,transparent:true,depthWrite:false,opacity:0}), s=new THREE.Sprite(m); s.visible=false; s.userData.nc=true; scene.add(s); puffs.push({s:s,m:m,t:1,life:1,vy:0,g0:0.4,g1:2,o:0.5});}
let pi=0;
function puff(x,y,z,col,life,g0,g1,op,vy,add){const p=puffs[pi++%PN]; p.s.position.set(x,y,z); p.m.color.setHex(col); p.m.blending=add?THREE.AdditiveBlending:THREE.NormalBlending; p.t=0; p.life=life; p.g0=g0; p.g1=g1; p.o=op; p.vy=vy; p.s.visible=true; p.s.material.rotation=Math.random()*6;}
function puffStep(dt){for(let i=0;i<PN;i++){const p=puffs[i]; if(!p.s.visible) continue; p.t+=dt/p.life; if(p.t>=1){p.s.visible=false; continue;}
  const sc=p.g0+(p.g1-p.g0)*Math.sqrt(p.t); p.s.scale.set(sc,sc,1); p.s.position.y+=p.vy*dt; p.m.opacity=p.o*(1-p.t)*(p.t<0.1?p.t*10:1);}}

/* ---------- each car: its back wheels, and the bonnet ---------- */
let pt=0;
function cars(dt){const me=D.on()?D.pos():null, p=SM.player; pt+=dt; const tick=pt>0.05; if(tick) pt=0;
  /* your car's tyres */
  if(me){const sk=me.skid||0, f=me.fwd(), sn=Math.sin(me.psi), cs=Math.cos(me.psi), back=-me.dim[2]/2, half=me.dim[1]/2-0.22, y=me.g.position.y;
    [-1,1].forEach(function(s,i){const w=[me.x+f[0]*back+sn*half*s,me.z+f[1]*back+cs*half*s];
      if(sk>0.32&&Math.abs(me.v)>1.5){if(last[i]) mark(last[i],w,y); last[i]=w; if(tick&&sk>0.5) puff(w[0],y+0.3,w[1],0xe8e8e8,1.3,0.5,2.6,0.32*sk,0.5);} else last[i]=null;});}
  else{last[0]=last[1]=null;}
  /* any car near you that has been knocked about: smoke from under the bonnet */
  if(!tick) return;
  D.live.forEach(function(c){if(c.hp==null||c.hp>=45) return; if(Math.hypot(c.x-p.x,c.z-p.z)>70) return;
    const f=c.fwd(), x=c.x+f[0]*(c.dim[0]/2-0.7), z=c.z+f[1]*(c.dim[0]/2-0.7), y=c.g.position.y+1.0, k=c.hp<20?1:0;
    if(Math.random()<(k?0.9:0.5)) puff(x+(Math.random()-0.5)*0.3,y,z+(Math.random()-0.5)*0.3,k?0x222222:0x8a8a8a,k?2.2:1.8,0.4,k?2.4:1.8,k?0.55:0.35,1.1+Math.random()*0.5);
    if(c.hp<=10&&Math.random()<0.8) puff(x,y-0.15,z,Math.random()<0.5?0xff8a1a:0xffc23a,0.45,0.35,0.9,0.85,1.6,true);});}      // and flames when it is done for

/* ---------- people jump out of your way; the ones you hit fly ---------- */
const fly=[];
const knock0=A.game&&A.game.knock;
if(knock0) A.game.knock=function(t,sec){knock0(t,sec); const c=D.on()?D.pos():null; if(c&&t.a&&Math.abs(c.v)>5&&Math.hypot(t.a.x-c.x,t.a.z-c.z)<5){const a=t.a, d=c.vdir!=null?c.vdir:c.psi, sg=c.v<0?-1:1, v=Math.abs(c.v);
  fly.push({a:a,vx:Math.cos(d)*v*0.55*sg,vz:-Math.sin(d)*v*0.55*sg,vy:2.2+v*0.17}); a.p.twirl=1; if(A.gtaShake) A.gtaShake(0.12);}};
function flyStep(dt){for(let i=fly.length-1;i>=0;i--){const q=fly[i], a=q.a; if(a.gone){fly.splice(i,1); continue;}
  q.vy-=9.8*dt; a.airY=Math.max(0,(a.airY||0)+q.vy*dt); const nx=a.x+q.vx*dt, nz=a.z+q.vz*dt; if(A.nav.isFree(nx,nz)){a.x=nx; a.z=nz;} else{q.vx*=-0.2; q.vz*=-0.2;}
  if(a.airY<=0&&q.vy<0){q.vx*=0.3; q.vz*=0.3; q.vy=0; if(Math.hypot(q.vx,q.vz)<0.3){a.airY=0; fly.splice(i,1);}}}}
const SCREAM=['Whoa!','Watch it!','Are you crazy?!','Aaah!','Maniac!'];
function dodge(dt){const c=D.on()?D.pos():null; if(!c||Math.abs(c.v)<6||!A.game||!A.game.all) return;
  const d=c.vdir!=null?c.vdir:c.psi, f=[Math.cos(d),-Math.sin(d)], sd=[-f[1],f[0]], sp=Math.abs(c.v), sg=c.v<0?-1:1;
  A.game.all().forEach(function(t){if(t.kind!=='person'||!t.a||(t.lvl||0)) return; const a=t.a; if(a.gone||(a._g&&a._g.down)||A.t<(a._dodge||0)||a.seat) return;
    const rx=a.x-c.x, rz=a.z-c.z, ahead=(rx*f[0]+rz*f[1])*sg, lat=rx*sd[0]+rz*sd[1];
    if(ahead<1.5||ahead>sp*0.8+5||Math.abs(lat)>2.4||Math.random()>dt*7) return;      // they see it coming: a moment to react
    const dir=lat>=0?1:-1, push=2.8-Math.abs(lat)+0.6, tx=a.x+sd[0]*dir*push, tz=a.z+sd[1]*dir*push;
    if(!A.nav.isFree(tx,tz)) return;
    a._dodge=A.t+3; a.release(); a.path=[]; a.cb=null; a.slide={fx:a.x,fz:a.z,tx:tx,tz:tz,t:0,dur:0.42,then:null}; a.hT=Math.atan2(sd[0]*dir,sd[1]*dir);
    a.p.act='cower'; a.say(rnd(SCREAM),1.6); SM.later(1.1,function(){if(a.p.act==='cower') a.p.act=null;},a);});}

A.frameFns.push(function(dt){
  if(!layered&&A.LAYER_OUT!=null){layered=true; skids.layers.set(OUT()); puffs.forEach(function(p){p.s.layers.set(OUT());});}
  if(!A.simsOn||!SM.player){if(skN){skN=0; skids.count=0;} return;}
  cars(dt); puffStep(dt); flyStep(dt); dodge(dt);
});
A.gtaDrive={skids:skids,puff:puff};
})();
