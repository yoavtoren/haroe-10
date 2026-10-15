/* Haroe 10 — the police, as in GTA, out in the streets. Up to five stars: one or two patrol cars at one or two stars, more after that,
   and a helicopter with a searchlight from four. They come by road with their sirens and lights going, pull up, and two officers get out
   and run after you. At one or two stars they want to arrest you: let one catch you and you are busted. From three they draw their
   pistols and shoot. In a car they chase you and box you in; stop near them and they pull you out. Crimes they see while you are wanted
   add a star. Get out of their sight and out of the circle on the radar where they last saw you, stay out a few seconds, and they lose
   you. Inside our building the officers who come up the stairs (floors.js) take over. */
(function(){
'use strict';
const A=window.APP, SM=A.sims, T=A.town, D=A.drive, R=Math.PI;
if(!SM||!T||!D||!D.Car||!A.floors||!A.gtaRoadPoint) return;
const G=A.floors.G, scene=A.scene, OUT=function(){return A.LAYER_OUT||5;};
function hyp(a,b){return Math.hypot(a,b);}
function clamp(v,a,b){return v<a?a:v>b?b:v;}
function wrap(d){while(d>R) d-=2*R; while(d<-R) d+=2*R; return d;}
function rnd(a){return a[Math.floor(Math.random()*a.length)];}

/* ---------- where you are, and whether they can see you ---------- */
function me(){const c=D.on()?D.pos():null, p=SM.player; return {x:c?c.x:p.x,z:c?c.z:p.z,car:c,p:p};}
function outside(){const p=SM.player; if(!A.simsOn||!p||p.lvl) return false; if(D.on()) return true; return p.room==='street'||p.room==='out'||p.room==='town';}
function los(x0,z0,x1,z1){const d=hyp(x1-x0,z1-z0), n=Math.ceil(d/2.5); for(let i=1;i<n;i++){const t=i/n; if(T.inBuilding(x0+(x1-x0)*t,z0+(z1-z0)*t,0)) return false;} return true;}
const fr=new THREE.Frustum(), pm=new THREE.Matrix4(), tv=new THREE.Vector3();
function inView(x,z){pm.multiplyMatrices(A.camera.projectionMatrix,A.camera.matrixWorldInverse); fr.setFromProjectionMatrix(pm); return fr.containsPoint(tv.set(x,T.U+1,z));}

/* ---------- sounds: the siren, shots ---------- */
let ac=null;
function actx(){if(A.gtaSound&&A.gtaSound.ctx) return A.gtaSound.ctx(); if(!ac){try{ac=new (window.AudioContext||window.webkitAudioContext)();}catch(e){ac=null;}} if(ac&&ac.state==='suspended') ac.resume(); return ac;}
function out(c){return A.gtaSound&&A.gtaSound.bus?A.gtaSound.bus('sfx'):c.destination;}
let siren=null;
function sirenLevel(v){const c=actx(); if(!c) return;
  if(!siren&&v>0.001){const o=c.createOscillator(), l=c.createOscillator(), lg=c.createGain(), g=c.createGain(), f=c.createBiquadFilter(); o.type='sawtooth'; o.frequency.value=900; l.type='sine'; l.frequency.value=0.32; lg.gain.value=320;
    l.connect(lg).connect(o.frequency); f.type='bandpass'; f.frequency.value=1200; f.Q.value=0.8; g.gain.value=0; o.connect(f).connect(g).connect(out(c)); o.start(); l.start(); siren={o:o,l:l,lg:lg,g:g,mode:0,t:0};}
  if(!siren) return; siren.g.gain.setTargetAtTime(v,c.currentTime,0.25);
  siren.t-=1/60; if(siren.t<0){siren.t=4+Math.random()*5; siren.mode=1-siren.mode; siren.l.frequency.setTargetAtTime(siren.mode?3.2:0.32,c.currentTime,0.1); siren.lg.gain.setTargetAtTime(siren.mode?170:320,c.currentTime,0.1);}      // the wail, and now and then the yelp
  if(v<0.001&&siren.g.gain.value<0.002){try{siren.o.stop(); siren.l.stop();}catch(e){} siren=null;}}
function bang(x,z){const c=actx(); if(!c) return; const m=me(), d=hyp(x-m.x,z-m.z), vol=clamp(0.9/(1+d*0.08),0.05,0.8);
  const n=Math.floor(c.sampleRate*0.32), b=c.createBuffer(1,n,c.sampleRate), dd=b.getChannelData(0); for(let i=0;i<n;i++){const t=i/n; dd[i]=(Math.random()*2-1)*Math.pow(1-t,6)*(t<0.01?2:1);}
  const s=c.createBufferSource(), hp=c.createBiquadFilter(), lp=c.createBiquadFilter(), g=c.createGain(); s.buffer=b; hp.type='highpass'; hp.frequency.value=300; lp.type='lowpass'; lp.frequency.value=3500-Math.min(2800,d*30); g.gain.value=vol; s.connect(hp).connect(lp).connect(g).connect(out(c)); s.start();
  const o=c.createOscillator(), og=c.createGain(); o.frequency.setValueAtTime(140,c.currentTime); o.frequency.exponentialRampToValueAtTime(40,c.currentTime+0.15); og.gain.setValueAtTime(vol*0.9,c.currentTime); og.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+0.2); o.connect(og).connect(out(c)); o.start(); o.stop(c.currentTime+0.22);}
function whizz(){const c=actx(); if(!c) return; const o=c.createOscillator(), g=c.createGain(); o.type='sine'; o.frequency.setValueAtTime(2400,c.currentTime); o.frequency.exponentialRampToValueAtTime(700,c.currentTime+0.12); g.gain.setValueAtTime(0.05,c.currentTime); g.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+0.14); o.connect(g).connect(out(c)); o.start(); o.stop(c.currentTime+0.15);}

/* ---------- the officers: light blue shirts, navy trousers, a cap, a pistol in the holster ---------- */
const NAMES=['Officer Cohen','Officer Levi','Officer Mizrahi','Officer Peretz','Officer Biton','Officer Dahan','Officer Avraham','Officer Friedman','Officer Azulay','Officer Katz','Officer Shapira','Officer Ohana'];
let nC=0;
function spec(){const r=A.rng(911+(nC++)*17), she=r()<0.3;
  return {id:'pol'+nC,name:NAMES[nC%NAMES.length],h:she?1.65+r()*0.06:1.74+r()*0.12,skin:[0xe4b594,0xc99a72,0xdfae88,0x8a5a3c,0xf0c8a8,0xd9a47f][Math.floor(r()*6)],hair:[0x1b1512,0x2a1e17,0x3a2a1c][Math.floor(r()*3)],
    eyes:0x3a2a1a,style:she?'bun':'short',beard:!she&&r()<0.3?'goatee':undefined,top:0x8db4dc,pants:0x1d2a44,pj:0x8db4dc,shoes:0x101010,slim:she,sleeves:false};}
const navy=0x1b2742, gunC=0x161718;
function kit(a){const P=a.p, mk=function(c){const m=new THREE.MeshStandardMaterial({color:c,roughness:0.6,metalness:0.1}); P.mats.push({m:m,b:new THREE.Color(c)}); return m;};
  const capM=mk(navy), badge=mk(0xd9b23a), gm=mk(gunC);
  const cap=new THREE.Group(); cap.position.set(0,0.085,-0.006); P.head.add(cap);
  const crown=new THREE.Mesh(new THREE.CylinderGeometry(0.112,0.118,0.075,20),capM); crown.position.y=0.02; crown.castShadow=true; cap.add(crown);
  const brim=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.1,0.012,20,1,false,-R/2,R),capM); brim.scale.set(1,1,0.9); brim.position.set(0,-0.012,0.075); cap.add(brim);
  const b=new THREE.Mesh(new THREE.BoxGeometry(0.03,0.025,0.006),badge); b.position.set(0,0.02,0.115); cap.add(b);
  const gun=new THREE.Group(); gun.position.set(0,-0.31,0.03); P.hand.add(gun);
  const body=new THREE.Mesh(new THREE.BoxGeometry(0.032,0.17,0.04),gm); body.position.y=-0.04; gun.add(body);
  const grip=new THREE.Mesh(new THREE.BoxGeometry(0.03,0.04,0.09),gm); grip.position.set(0,0.03,-0.03); gun.add(grip);
  gun.visible=false; a.gun=gun; a.muzzle=new THREE.Object3D(); a.muzzle.position.set(0,-0.14,0); gun.add(a.muzzle);
  a.p.dirty=true;}
function officer(x,z,h){const a=new SM.Actor(spec()); a.lvl=0; a.x=a.lx=x; a.z=a.lz=z; a.h=a.hT=h; a.speed=4.1; a.cop=true; a.town=true; kit(a); return a;}
const SHOUT=['Stop! Police!','Freeze!','Police! Hands up!','Get on the ground!','Stop right there!','Atzor! Mishtara!'], ARREST=['You are under arrest.','Hands behind your back.','Got you. Turn around.'], CAR=['Out of the car! Now!','Step out of the vehicle!','Hands on the wheel!'];

/* =====================================================================
   The units: patrol cars with two officers each, and a helicopter
   ===================================================================== */
const UNITS=[], FOOT=[];
let heli=null;
const Z={x:0,z:0,t:-99,grace:0,lose:0,seen:true,bump:-99,w0:0,lastLos:0};
function radius(){return 40+20*G.wanted;}
function want(){return [0,1,2,2,3,4][G.wanted]||0;}
function spawnCar(){const m=me();
  const ok=function(x,z){return !T.kept(x,z)&&A.nav.isFree(x,z)&&!(hyp(x-m.x,z-m.z)<130&&inView(x,z));};
  const q=A.gtaRoadPoint(m.x,m.z,85,160,ok)||A.gtaRoadPoint(m.x,m.z,70,180,function(x,z){return !T.kept(x,z)&&A.nav.isFree(x,z);}); if(!q) return null;
  const route=A.gtaRoute(q.x,q.z,m.x,m.z,true), nx=route&&route.length>2?route[2]:[m.x,m.z], h=Math.atan2(nx[0]-q.x,nx[1]-q.z);      // pointing the way the route to you goes
  const c=new D.Car({kind:'sedan',col:0xf2f2ee,cop:true,x:q.x,z:q.z,psi:h-R/2}); c.name='Police car'; c.v=8; strobes(c);
  const u={car:c,inside:2,crew:[],state:'drive',route:route,rt:A.t+1.6,stuck:0,rev:0,ghost:0,born:A.t}; c.unit=u; UNITS.push(u); return u;}
/* the light bar's flashes, and the red and blue they throw on the street round the car */
const glowT=A.canvasTex(64,64,function(g){const gr=g.createRadialGradient(32,32,0,32,32,32); gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(0.25,'rgba(255,255,255,0.7)'); gr.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=gr; g.fillRect(0,0,64,64);});
const sR=new THREE.SpriteMaterial({map:glowT,color:0xff2a2a,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}), sB=new THREE.SpriteMaterial({map:glowT,color:0x3a6aff,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
const pR=new THREE.MeshBasicMaterial({map:glowT,color:0xff2020,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,polygonOffset:true,polygonOffsetUnits:-6}), pB=pR.clone(); pB.color.setHex(0x2a5aff);
const poolG=new THREE.PlaneGeometry(9,9).rotateX(-R/2);
function strobes(c){const g=new THREE.Group(); g.userData.nc=true; const r=new THREE.Sprite(sR), b=new THREE.Sprite(sB); r.position.set(-0.3,1.78,0.3); b.position.set(-0.3,1.78,-0.3); r.scale.setScalar(1.3); b.scale.setScalar(1.3);
  const pr=new THREE.Mesh(poolG,pR), pb=new THREE.Mesh(poolG,pB); pr.position.set(0,0.05,2.2); pb.position.set(0,0.05,-2.2); pr.renderOrder=pb.renderOrder=2;
  g.add(r,b,pr,pb); g.traverse(function(o){o.layers.set(OUT());}); c.g.add(g); c.strobe={g:g,r:r,b:b,pr:pr,pb:pb};}
function dropCar(u){u.crew.forEach(function(o){o.gone=true;}); if(u.car) u.car.remove(); const i=UNITS.indexOf(u); if(i>=0) UNITS.splice(i,1);}

/* ---------- a car: by road toward you, straight at you when close ---------- */
function drive(c,tx,tz,sp,dt){
  const da=wrap(Math.atan2(-(tz-c.z),tx-c.x)-c.psi);
  c.steer+=(clamp(da*1.7,-0.62,0.62)*(c.v<0?-1:1)-c.steer)*Math.min(1,dt*6);
  const s=sp*(Math.abs(da)>1.2?0.35:Math.abs(da)>0.55?0.65:1); c.v+=(s-c.v)*Math.min(1,dt*(s<c.v?2.6:1.5));
  move(c,dt);}
function move(c,dt){const npsi=c.psi+c.v/c.dim[2]*Math.tan(c.steer)*dt, f=[Math.cos(npsi),-Math.sin(npsi)], nx=c.x+f[0]*c.v*dt, nz=c.z+f[1]*c.v*dt, hit=D.hitsCar(c,nx,nz,npsi);
  if(!hit&&D.outlineFree(c,nx,nz,npsi)){c.x=nx; c.z=nz; c.psi=npsi;}
  else{if(hit&&hit===D.pos()&&Math.abs(c.v)>3){D.crash(Math.abs(c.v)); hit.v*=0.7; if(A.gtaShake) A.gtaShake(0.25);} c.v*=-0.25;}
  c.place(); c.wheelsTurn(dt); A.touch(1);}
function follow(u,tx,tz,sp,dt){const c=u.car, m=me();
  if(A.t>u.rt||!u.route||!u.route.length){u.rt=A.t+1.6; u.route=A.gtaRoute(c.x,c.z,tx,tz,true)||[[tx,tz]];}
  const r=u.route; while(r.length>1&&hyp(r[0][0]-c.x,r[0][1]-c.z)<5) r.shift();
  /* out of your sight, or stuck too long: along the route as the traffic goes, through whatever is in the way */
  const far=hyp(m.x-c.x,m.z-c.z)>50&&!inView(c.x,c.z);
  if(far||u.ghost>0){u.ghost=Math.max(0,(u.ghost||0)-dt); glide(u,sp,dt); return;}
  let q=r[0]; const look=6+Math.abs(c.v)*0.4; for(let i=0;i<r.length;i++){q=r[i]; if(hyp(q[0]-c.x,q[1]-c.z)>look) break;}
  drive(c,q[0],q[1],sp,dt);}
function glide(u,sp,dt){const c=u.car, r=u.route; let step=sp*dt, tx=c.x, tz=c.z;
  while(step>0&&r.length){const q=r[0], dx=q[0]-c.x, dz=q[1]-c.z, d=hyp(dx,dz); if(d<=step){c.x=q[0]; c.z=q[1]; step-=d; r.shift();} else{c.x+=dx/d*step; c.z+=dz/d*step; step=0;}}
  if(r.length){tx=r[0][0]; tz=r[0][1];} const want=Math.atan2(-(tz-c.z),tx-c.x); if(hyp(tx-c.x,tz-c.z)>0.5) c.psi+=wrap(want-c.psi)*Math.min(1,dt*5);
  c.v=sp; c.steer=0; c.place(); c.wheelsTurn(dt); u.stuck=0;}
function unstick(u,dt,moving){const c=u.car;
  if(u.rev>0){u.rev-=dt; c.steer=u.revSteer; c.v+=(-4.5-c.v)*Math.min(1,dt*3); move(c,dt); return true;}      // back up, wheels the other way, and try again
  if(moving&&Math.abs(c.v)<0.7){u.stuck+=dt; if(u.stuck>1.2){u.stuck=0; u.rev=1.0; u.revSteer=-Math.sign(c.steer||1)*0.6; u.fails=(u.fails||0)+1; if(u.fails>=2) u.ghost=2.5;}} else u.stuck=Math.max(0,u.stuck-dt);
  return false;}
function carStep(u,dt){
  const c=u.car, m=me(), d=hyp(m.x-c.x,m.z-c.z), wantd=G.wanted>0;
  c.alarm=0; if(G.busted){c.v*=Math.pow(0.05,dt); move(c,dt); return;}
  if(u.state==='leave'){if(!unstick(u,dt,true)){if(!u.away){const q=A.gtaRoadPoint(c.x,c.z,120,200); u.away=q?[q.x,q.z]:[c.x+80,c.z]; u.route=null;} follow(u,u.away[0],u.away[1],11,dt);}
    if((d>150&&!inView(c.x,c.z))||A.t-u.left>40) dropCar(u); return;}
  if(!wantd){u.state='leave'; u.left=A.t; recall(u); return;}
  if(u.fails>6&&d>70&&!inView(c.x,c.z)){dropCar(u); return;}      // hopelessly stuck somewhere out of sight: another car comes instead
  if(u.state==='out'){c.v*=Math.pow(0.05,dt); move(c,dt);      // parked with the doors open; back in when you get away in a car
    if(m.car&&Math.abs(m.car.v)>4&&d>14) recall(u);
    if(u.inside>=2&&!u.crew.length) u.state='drive';
    return;}
  /* driving: to you if they can see you, to where they last did if not */
  const tx=Z.seen?m.x:Z.x, tz=Z.seen?m.z:Z.z, dt2=hyp(tx-c.x,tz-c.z);
  if(unstick(u,dt,true)) return;
  if(m.car&&Z.seen&&d<38){drive(c,m.x+Math.cos(m.car.psi)*m.car.v*0.4,m.z-Math.sin(m.car.psi)*m.car.v*0.4,Math.min(24,Math.abs(m.car.v)+6),dt);      // ram, a little ahead of where you are going
    if(Math.abs(m.car.v)<1.4&&d<9){u.stopT=(u.stopT||0)+dt; if(u.stopT>0.8) getOut(u);} else u.stopT=0; return;}
  if(!m.car&&Z.seen&&d<17&&outside()){c.v*=Math.pow(0.02,dt); move(c,dt); if(Math.abs(c.v)<1.5) getOut(u); return;}      // pull up, and out they get
  if(!Z.seen&&dt2<14){u.wander=u.wander||[Z.x+(Math.random()-0.5)*radius(),Z.z+(Math.random()-0.5)*radius()]; follow(u,u.wander[0],u.wander[1],7,dt); if(hyp(u.wander[0]-c.x,u.wander[1]-c.z)<10) u.wander=null; return;}      // searching
  follow(u,tx,tz,dt2>60?17:dt2>25?12:8,dt);
}
function getOut(u){const c=u.car; if(u.inside<=0) return; const f=c.fwd(), s=[f[1],-f[0]], W=c.dim[1]/2+0.6;
  for(let k=0;k<u.inside;k++){const side=k?-1:1, x=c.x+s[0]*W*side, z=c.z+s[1]*W*side, ok=A.nav.isFree(x,z), a=officer(ok?x:c.x-f[0]*(c.dim[0]/2+0.8),ok?z:c.z-f[1]*(c.dim[0]/2+0.8),c.psi+R/2);
    const o={a:a,u:u,state:'chase',next:0,fire:A.t+1+Math.random(),shout:A.t+0.5+k,arrest:0}; u.crew.push(o); FOOT.push(o); a.say(rnd(SHOUT),2);}
  u.inside=0; u.state='out'; doorSnd();}
function recall(u){u.crew.forEach(function(o){if(o.state!=='down') o.state='back';});}
function doorSnd(){const c=actx(); if(!c) return; const n=Math.floor(c.sampleRate*0.12), b=c.createBuffer(1,n,c.sampleRate), d=b.getChannelData(0); for(let i=0;i<n;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/n,3);
  const s=c.createBufferSource(), f=c.createBiquadFilter(), g=c.createGain(); f.type='lowpass'; f.frequency.value=900; s.buffer=b; g.gain.value=0.25; s.connect(f).connect(g).connect(out(c)); s.start();}

/* ---------- an officer on foot ---------- */
const flashM=new THREE.SpriteMaterial({map:A.canvasTex(64,64,function(g){const gr=g.createRadialGradient(32,32,0,32,32,32); gr.addColorStop(0,'rgba(255,250,220,1)'); gr.addColorStop(0.3,'rgba(255,200,90,0.9)'); gr.addColorStop(1,'rgba(255,140,40,0)'); g.fillStyle=gr; g.fillRect(0,0,64,64);}),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
const tracerM=new THREE.LineBasicMaterial({color:0xffe9a8,transparent:true,opacity:0.8,depthWrite:false,blending:THREE.AdditiveBlending});
const fx=[];
function shoot(o){const a=o.a, m=me(), w=new THREE.Vector3(); a.muzzle.getWorldPosition(w);
  const fl=new THREE.Sprite(flashM); fl.scale.set(0.45,0.45,1); fl.position.copy(w); fl.layers.set(OUT()); scene.add(fl); fx.push({o:fl,until:A.t+0.06});
  const d=hyp(m.x-a.x,m.z-a.z), running=m.p.manual&&A.running, chance=clamp(0.44-d*0.013-(m.p.manual?0.08:0)-(running?0.14:0)-(m.car?0.12:0)-(A.gtaJump&&A.gtaJump.on?0.2:0),0.06,0.5), hit=Math.random()<chance;
  const ty=(m.car?m.car.g.position.y+1.0:m.p.p.g.position.y+1.25), tx=m.x+(hit?0:(Math.random()-0.5)*2.4), tz=m.z+(hit?0:(Math.random()-0.5)*2.4);
  const g=new THREE.BufferGeometry().setFromPoints([w.clone(),new THREE.Vector3(tx,hit?ty:T.U+0.3+Math.random()*1.6,tz)]), ln=new THREE.Line(g,tracerM); ln.layers.set(OUT()); scene.add(ln); fx.push({o:ln,until:A.t+0.07,geo:g});
  bang(a.x,a.z);
  if(hit){const dmg=m.car?4+Math.floor(Math.random()*4):7+Math.floor(Math.random()*6); if(A.game&&A.game.hurt) A.game.hurt(dmg); hurtFlash(); if(A.gtaShake) A.gtaShake(0.08);}
  else if(d<14) whizz();}
const hurt=document.createElement('div'); hurt.id='gHurt'; hurt.style.cssText='position:absolute;inset:0;pointer-events:none;z-index:2;opacity:0;transition:opacity .5s;background:radial-gradient(ellipse at center,rgba(160,0,0,0) 45%,rgba(170,0,0,.55) 100%)'; A.stage.appendChild(hurt);
function hurtFlash(){hurt.style.transition='none'; hurt.style.opacity=1; requestAnimationFrame(function(){hurt.style.transition='opacity .9s'; hurt.style.opacity=0;});}
function footStep(o,dt){
  const a=o.a, m=me(), s=a._g; if(a.gone) return false;
  a.p.g.visible=outside()||!!D.on();
  if(s&&s.down){o.state='down'; a.p.act=null; a.gun.visible=false; a.update(dt); return true;}      // knocked down (game.js): lies there, then gets up
  if(o.state==='down') o.state='chase';
  if(s&&s.fight&&A.t<s.fight){a.gun.visible=false; a.update(dt); return true;}      // throwing punches with you (game.js)
  if(G.busted){a.path=[]; a.cb=null; a.gun.visible=false; if(a.p.act==='aim') a.p.act=null; a.update(dt); return true;}      // the arrest: they stand over you
  const d=hyp(m.x-a.x,m.z-a.z);
  if(!G.wanted&&o.state!=='back'&&o.state!=='walk') o.state='back';
  if(o.state==='back'||o.state==='walk'){a.p.act=null; a.gun.visible=false; a.speed=o.state==='back'?3.2:1.4;
    const c=o.u&&o.u.car&&UNITS.indexOf(o.u)>=0?o.u.car:null;
    if(!c){if(!o.away){o.away=[a.x+(a.x-m.x)*3,a.z+(a.z-m.z)*3]; a.goTo(o.away[0],o.away[1]);} if((d>60&&!inView(a.x,a.z))||A.t-(o.t0||(o.t0=A.t))>30) return false; a.update(dt); return true;}
    if(hyp(c.x-a.x,c.z-a.z)<2.3){o.u.inside++; o.u.crew.splice(o.u.crew.indexOf(o),1); if(!o.u.crew.length&&o.u.state!=='leave'){o.u.state='drive';} return false;}      // in, and the door shuts
    if(A.t>o.next){o.next=A.t+1.5; a.goTo(c.x,c.z);} a.update(dt); return true;}
  /* on you: arrest at one or two stars, or when you are this close anyway */
  if(m.car){a.p.act=null; a.gun.visible=false;
    if(Math.abs(m.car.v)<1.5&&d<10){if(A.t>o.next){o.next=A.t+0.5; const f=m.car.fwd(), s2=[f[1],-f[0]], W=m.car.dim[1]/2+0.7; a.goTo(m.x+s2[0]*W,m.z+s2[1]*W);}
      if(d<m.car.dim[1]/2+1.6){o.arrest+=dt; if(o.arrest>0.6&&A.t>(o.said||0)){o.said=A.t+3; a.say(rnd(CAR),2.2);} if(o.arrest>1.6) busted(o,true);} else o.arrest=Math.max(0,o.arrest-dt);}
    else if(d>16) o.state='back';
    a.update(dt); return true;}
  if(d<1.25&&(G.wanted<=2||!m.p.manual)){a.path=[]; a.hT=Math.atan2(m.x-a.x,m.z-a.z); a.p.act='reach'; o.arrest+=dt; if(o.arrest>0.75) busted(o,false); a.update(dt); return true;}
  o.arrest=Math.max(0,o.arrest-dt*2);
  const sees=d<40&&(o.los==null||o.los), armed=G.wanted>=3;
  if(armed&&sees&&d<26&&d>2.4){a.path=[]; a.cb=null; a.hT=Math.atan2(m.x-a.x,m.z-a.z); a.p.act='aim'; a.gun.visible=true;      // stand and shoot
    if(A.t>o.fire){o.fire=A.t+0.75+Math.random()*0.8; shoot(o);}
    if(A.t>o.shout){o.shout=A.t+5+Math.random()*4; a.say(rnd(SHOUT),1.8);} a.update(dt); return true;}
  a.p.act=null; a.gun.visible=armed; a.speed=4.1;
  if(A.t>o.shout&&d<30){o.shout=A.t+5+Math.random()*4; a.say(rnd(SHOUT),1.8);}
  const tx=Z.seen?m.x:Z.x, tz=Z.seen?m.z:Z.z;
  if(sees&&d<9){a.release(); a.path=[[tx,tz]]; a.cb=null;}
  else if(A.t>o.next){o.next=A.t+1.3; if(hyp(tx-a.x,tz-a.z)<70&&A.nav.isFree(tx,tz)) a.goTo(tx,tz); else a.goTo(a.x+(tx-a.x)*0.3,a.z+(tz-a.z)*0.3);}
  a.update(dt); return true;}
function busted(o,car){if(G.busted) return; o.a.say(rnd(ARREST),2.4); o.a.p.act='reach'; if(car&&D.on()) D.exit(true); SM.player.p.act='surrender'; if(A.floors.busted) A.floors.busted();}

/* ---------- the helicopter ---------- */
function heliModel(){const g=new THREE.Group(), m=function(c){return new THREE.MeshLambertMaterial({color:c});}, P=function(geo,mat,x,y,z){const o=new THREE.Mesh(geo,mat); o.position.set(x,y,z); o.castShadow=true; g.add(o); return o;};
  const body=m(0x1d2a44), white=m(0xf0f0ec), glass=new THREE.MeshPhongMaterial({color:0x22303a,specular:0x99aabb,shininess:80}), dark=m(0x15171a);
  P(new THREE.SphereGeometry(1,20,14),body,0,0,0).scale.set(2.1,1.15,1.15);
  P(new THREE.SphereGeometry(1,20,14),glass,0.85,0.18,0).scale.set(1.3,0.85,1.0);
  P(new THREE.BoxGeometry(4.6,0.38,0.32),white,-3.2,0.25,0); P(new THREE.BoxGeometry(0.9,1.3,0.12),body,-5.4,0.75,0);
  [-1,1].forEach(function(s){P(new THREE.CylinderGeometry(0.06,0.06,3.2,8),dark,0.1,-1.25,s*0.85).rotation.z=R/2; P(new THREE.BoxGeometry(0.08,0.5,0.08),dark,0.7,-0.95,s*0.8); P(new THREE.BoxGeometry(0.08,0.5,0.08),dark,-0.6,-0.95,s*0.8);});
  const rotor=new THREE.Group(); rotor.position.set(0,1.32,0); g.add(rotor); P(new THREE.CylinderGeometry(0.12,0.12,0.3,10),dark,0,1.15,0);
  [0,R/2].forEach(function(r){const b=new THREE.Mesh(new THREE.BoxGeometry(10.5,0.05,0.28),dark); b.rotation.y=r; rotor.add(b);});
  const tail=new THREE.Group(); tail.position.set(-5.45,0.85,0.18); g.add(tail); [0,R/2].forEach(function(r){const b=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.12,0.04),dark); b.rotation.z=r; tail.add(b);});
  const red=new THREE.Sprite(new THREE.SpriteMaterial({color:0xff3030,map:flashM.map,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false})), blue=new THREE.Sprite(new THREE.SpriteMaterial({color:0x3a6aff,map:flashM.map,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false}));
  red.position.set(0,-1.15,0.6); blue.position.set(0,-1.15,-0.6); red.scale.setScalar(0.9); blue.scale.setScalar(0.9); g.add(red,blue);
  /* the searchlight: a pale cone down to the ground, and the patch it lights */
  const beamM=new THREE.MeshBasicMaterial({color:0xfff2cc,transparent:true,opacity:0.12,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false});
  const beam=new THREE.Mesh(new THREE.CylinderGeometry(0.25,4.5,1,24,1,true),beamM); scene.add(beam);
  const spotM=new THREE.MeshBasicMaterial({map:flashM.map,color:0xfff0c0,transparent:true,opacity:0.55,depthWrite:false,blending:THREE.AdditiveBlending,polygonOffset:true,polygonOffsetUnits:-8});
  const spot=new THREE.Mesh(new THREE.PlaneGeometry(7,7).rotateX(-R/2),spotM); scene.add(spot);
  g.traverse(function(o){o.layers.set(OUT());}); beam.layers.set(OUT()); spot.layers.set(OUT()); scene.add(g);
  return {g:g,rotor:rotor,tail:tail,red:red,blue:blue,beam:beam,spot:spot,x:0,z:0,y:40,h:0,vx:0,vz:0,ang:Math.random()*6};}
let rotorSnd=null;
function heliStep(dt){const m=me();
  if(G.wanted>=4&&outside()&&!heli){heli=heliModel(); const a=Math.random()*2*R; heli.x=m.x+Math.cos(a)*170; heli.z=m.z+Math.sin(a)*170; heli.y=T.U+40;}
  if(!heli) return;
  const leaving=G.wanted<4||!outside();
  heli.ang+=dt*0.35; const tx=leaving?heli.x+(heli.x-m.x):m.x+Math.cos(heli.ang)*24, tz=leaving?heli.z+(heli.z-m.z):m.z+Math.sin(heli.ang)*24;
  const dx=tx-heli.x, dz=tz-heli.z, dd=hyp(dx,dz)||1, sp=Math.min(20,dd*0.8);
  heli.vx+=((dx/dd)*sp-heli.vx)*Math.min(1,dt*1.2); heli.vz+=((dz/dd)*sp-heli.vz)*Math.min(1,dt*1.2); heli.x+=heli.vx*dt; heli.z+=heli.vz*dt; heli.y+=(T.U+(leaving?60:34)-heli.y)*Math.min(1,dt*0.6);
  const hv=hyp(heli.vx,heli.vz); if(hv>0.5) heli.h=Math.atan2(heli.vx,heli.vz);
  heli.g.position.set(heli.x,heli.y,heli.z); heli.g.rotation.set(0,heli.h-R/2,0); heli.g.rotateZ(-Math.min(0.25,hv*0.012));
  heli.rotor.rotation.y+=dt*28; heli.tail.rotation.z+=dt*40;
  const on=Math.floor(A.t*3)%2; heli.red.visible=!!on; heli.blue.visible=!on;
  /* the searchlight, at night, on you */
  const night=A.gtaFx?A.gtaFx.now.night:0, lit=night>0.25&&!leaving; heli.beam.visible=heli.spot.visible=lit;
  if(lit){const gx=m.x+(Math.sin(A.t*0.7)*1.5), gz=m.z+(Math.cos(A.t*0.5)*1.5), gy=(m.car?m.car.g.position.y:m.p.p.g.position.y)+0.05, top=new THREE.Vector3(heli.x,heli.y-1.1,heli.z), bot=new THREE.Vector3(gx,gy,gz), len=top.distanceTo(bot);
    heli.beam.scale.set(1,len,1); heli.beam.position.copy(top).lerp(bot,0.5); heli.beam.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),top.clone().sub(bot).normalize());
    heli.spot.position.set(gx,gy,gz); heli.beam.material.opacity=0.08*night; heli.spot.material.opacity=0.32*night;}
  /* the chop of the rotor */
  const c=actx(), d=hyp(heli.x-m.x,heli.z-m.z)+Math.abs(heli.y-T.U)*0.5;
  if(c){if(!rotorSnd){const n=Math.floor(c.sampleRate*2), b=c.createBuffer(1,n,c.sampleRate), dd=b.getChannelData(0); let l=0; for(let i=0;i<n;i++){l=(l+0.04*(Math.random()*2-1))/1.04; dd[i]=l*4;}
      const s=c.createBufferSource(), f=c.createBiquadFilter(), g=c.createGain(), am=c.createGain(), lfo=c.createOscillator(), lg=c.createGain(); s.buffer=b; s.loop=true; f.type='lowpass'; f.frequency.value=260; lfo.frequency.value=13; lg.gain.value=0.5; am.gain.value=0.5; lfo.connect(lg).connect(am.gain);
      g.gain.value=0; s.connect(f).connect(am).connect(g).connect(out(c)); s.start(); lfo.start(); rotorSnd={s:s,lfo:lfo,g:g};}
    rotorSnd.g.gain.setTargetAtTime(clamp(1.2/(1+d*0.04),0,0.5),c.currentTime,0.3);}
  if(leaving&&hyp(heli.x-m.x,heli.z-m.z)>220){[heli.g,heli.beam,heli.spot].forEach(function(o){scene.remove(o);}); heli=null; if(rotorSnd){const r=rotorSnd; rotorSnd=null; r.g.gain.setTargetAtTime(0,actx().currentTime,0.4); setTimeout(function(){try{r.s.stop(); r.lfo.stop();}catch(e){}},1500);}}}

/* =====================================================================
   Seeing you, losing you, and stars for what they see you do
   ===================================================================== */
let losT=0;
function sight(dt){const m=me(), hidden=!outside();
  losT-=dt; const fresh=losT<=0; if(fresh) losT=0.2;
  let seen=false;
  if(!hidden){
    UNITS.forEach(function(u){if(u.state==='leave'||u.inside<=0) return; const c=u.car, d=hyp(m.x-c.x,m.z-c.z); if(d<55){if(fresh) u.los=los(c.x,c.z,m.x,m.z); if(u.los) seen=true;}});
    FOOT.forEach(function(o){const a=o.a, d=hyp(m.x-a.x,m.z-a.z); if(o.state==='down'||o.state==='back') return; if(d<42){if(fresh) o.los=los(a.x,a.z,m.x,m.z); if(o.los) seen=true;} else o.los=false;});
    if(heli&&G.wanted>=4&&hyp(heli.x-m.x,heli.z-m.z)<65) seen=true;}
  if(A.t<Z.grace&&!hidden) seen=true;
  Z.seen=seen;
  if(seen){Z.x=m.x; Z.z=m.z; Z.t=A.t; Z.lose=0;}
  else if(!hidden){const r=radius(); if(hyp(m.x-Z.x,m.z-Z.z)>r){Z.lose+=dt; if(Z.lose>6) lost();} else Z.lose=Math.max(0,Z.lose-dt*0.3);}}
function lost(){G.wanted=0; Z.lose=0; if(A.floors.drawHud) A.floors.drawHud(); if(A.floors.siren) A.floors.siren(false); SM.toast('You lost the police.'); if(A.gtaSound&&A.gtaSound.lost) A.gtaSound.lost();}
/* a crime they see while you are wanted: a star more (at most one every few seconds) */
const raise0=A.floors.raise;
A.floors.raise=function(n){const was=G.wanted; if(was>0&&n>0&&Z.seen&&outside()&&A.t-Z.bump>6){n=Math.max(n,was+1); Z.bump=A.t;} raise0(Math.min(5,n));};

/* =====================================================================
   Every frame
   ===================================================================== */
let spawnT=0, wasW=0, active=false;
function clear(){UNITS.slice().forEach(dropCar); FOOT.forEach(function(o){o.a.remove();}); FOOT.length=0; if(heli){[heli.g,heli.beam,heli.spot].forEach(function(o){scene.remove(o);}); heli=null;} sirenLevel(0); if(rotorSnd){try{rotorSnd.s.stop(); rotorSnd.lfo.stop();}catch(e){} rotorSnd=null;}}
A.frameFns.push(function(dt){
  for(let i=fx.length-1;i>=0;i--){const f=fx[i]; if(A.t>f.until){scene.remove(f.o); if(f.geo) f.geo.dispose(); fx.splice(i,1);}}
  if(!A.simsOn||!SM.player){if(active){active=false; clear();} return;}
  active=true;
  const m=me();
  /* the stars went up: they saw it happen here */
  if(G.wanted>wasW){Z.x=m.x; Z.z=m.z; Z.grace=A.t+4; Z.lose=0; if(A.gtaStats) A.gtaStats.wanted=Math.max(A.gtaStats.wanted||0,G.wanted); if(A.gtaSound&&A.gtaSound.dispatch) A.gtaSound.dispatch(G.wanted,m);}
  wasW=G.wanted;
  if(G.wanted>0) sight(dt); else Z.seen=true;
  /* more cars while there are fewer than the stars call for */
  const live=UNITS.filter(function(u){return u.state!=='leave';}).length;
  spawnT-=dt; if(G.wanted>0&&outside()&&live<want()&&spawnT<=0){spawnT=2.5; spawnCar();}
  for(let i=UNITS.length-1;i>=0;i--){const u=UNITS[i]; if(D.live.indexOf(u.car)<0){UNITS.splice(i,1); continue;} carStep(u,dt); const d=hyp(u.car.x-m.x,u.car.z-m.z); if(d>260&&!inView(u.car.x,u.car.z)) dropCar(u);}
  for(let i=FOOT.length-1;i>=0;i--){const o=FOOT[i]; if(!footStep(o,dt)||o.gone){o.a.remove(); FOOT.splice(i,1); if(o.u){const k=o.u.crew.indexOf(o); if(k>=0) o.u.crew.splice(k,1);}}}
  heliStep(dt);
  /* lights going on every car, the siren as loud as the nearest one is close */
  const going=G.wanted>0&&UNITS.some(function(u){return u.state!=='leave';}); let near=1e9; UNITS.forEach(function(u){if(u.state!=='leave') near=Math.min(near,hyp(u.car.x-m.x,u.car.z-m.z));});
  const L=D.copLights, on=Math.floor(A.t*5)%2; if(L){L[0].emissive.setHex(going?(on?0xff2a2a:0x220000):0x110000); L[1].emissive.setHex(going?(on?0x001133:0x3a6aff):0x000011);}
  const night=A.gtaFx?Math.max(0.25,A.gtaFx.now.night):0.5; sR.opacity=on?1:0.1; sB.opacity=on?0.1:1; pR.opacity=(on?0.5:0.05)*night; pB.opacity=(on?0.05:0.5)*night;
  UNITS.forEach(function(u){if(u.car.strobe) u.car.strobe.g.visible=going&&u.state!=='leave';});
  sirenLevel(going&&!A.paused?clamp(0.075/(1+near*0.03),0.004,0.07):0);
});
A.labelFns.push(function(){const v=new THREE.Vector3(); FOOT.forEach(function(o){const a=o.a; if(a.gone) return; a.headPos(v); v.y+=0.28; A.place(a.tag,v,A.state.labels&&a.p.g.visible&&!a.bubble); if(a.bubble) A.place(a.bubble,v,a.p.g.visible);});});

/* ---------- for the radar, the map and game.js ---------- */
A.gtaCops={outside:outside,list:function(){return FOOT.filter(function(o){return !o.a.gone&&o.a.p.g.visible;}).map(function(o){return o.a;});},get seen(){return G.wanted>0?Z.seen:true;},
  blips:function(dot,circle){
    if(G.wanted>0&&!Z.seen&&circle){const k=Math.floor(A.t*2)%2; circle(Z.x,Z.z,radius(),k?'rgba(230,60,60,0.22)':'rgba(60,110,240,0.22)');}
    UNITS.forEach(function(u){if(u.state!=='leave'||G.wanted>0) dot(u.car.x,u.car.z,'policecar');});
    FOOT.forEach(function(o){if(!o.a.gone&&o.state!=='back') dot(o.a.x,o.a.z,'police');});
    if(heli) dot(heli.x,heli.z,'heli');},
  units:UNITS,foot:FOOT,zone:Z,get heli(){return heli;},clear:clear};
})();
