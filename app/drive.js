/* Haroe 10 — cars. Any car parked down the streets can be driven: walk up to it, tap it (or E beside it) and get in.
   W or up: gas. S or down: brake, then reverse. A and D: steer. Space: handbrake. H: the horn. E: get out. M: the map, tap it to set a
   destination. On a phone the left stick drives. The camera rides behind.
   The cars near you are the finely built ones, swapped in for the plain ones parked farther off, and swapped back when you leave them:
   where you leave a car, it stays. Traffic drives the neighbourhood's streets, keeps to its side and stops for whoever is in the way;
   you can pull a driver out and take theirs. Run somebody down and the police come, in a car with its lights going. */
(function(){
'use strict';
const A=window.APP, T=A.town, det=A.det, SM=A.sims, R=Math.PI, scene=A.scene;
if(!T||!det||!SM) return;
const U=T.U, OUT=function(){return A.LAYER_OUT||5;}, TOUCH=!!(window.matchMedia&&(matchMedia('(pointer: coarse)').matches||(navigator.maxTouchPoints>0&&!matchMedia('(any-pointer: fine)').matches)));      /* a phone or a tablet, as the gta modules decide it: a laptop with a touch screen and a mouse plays as a computer */
const $=function(id){return document.getElementById(id);};
function ang(a,b,k){let d=b-a; while(d>R) d-=2*R; while(d<-R) d+=2*R; return a+d*k;}
function wrap(d){while(d>R) d-=2*R; while(d<-R) d+=2*R; return d;}
const root=new THREE.Group(); root.userData.nc=true; root.userData.nofight=true; scene.add(root);      // not in the way of the walking map; moves, so no flicker search
const lampH=A.lampMat('L:street',0xe6ecee,0xfff6dc,1.1), lampT=A.lampMat('L:street',0xb0262a,0xff3a2a,0.9);
const DIM={mini:[3.6,1.6,2.38],hatch:[4.05,1.76,2.58],sedan:[4.62,1.8,2.7],suv:[4.45,1.84,2.64],van:[4.4,1.78,2.73],bus:[11.8,2.55,5.9]};      // length, width, wheelbase
const NAME={mini:'Ptitim Mini',hatch:'Rishon Hatch',sedan:'Yarkon Saloon',suv:'Negev 4x4',van:'Shuk Van',bus:'City Bus 61'};      // made-up makes, as GTA has its own

/* ---------- sounds ---------- */
let ac=null;
function actx(){if(!ac){try{ac=new (window.AudioContext||window.webkitAudioContext)();}catch(e){ac=null;}} if(ac&&ac.state==='suspended') ac.resume(); return ac;}
function noise(vol,f,len){const c=actx(); if(!c) return; const n=Math.floor(c.sampleRate*(len||0.25)), b=c.createBuffer(1,n,c.sampleRate), d=b.getChannelData(0); for(let i=0;i<n;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/n,3);
  const s=c.createBufferSource(), g=c.createGain(), fl=c.createBiquadFilter(); fl.type='lowpass'; fl.frequency.value=f||700; s.buffer=b; g.gain.value=vol; s.connect(fl).connect(g).connect(c.destination); s.start();}
function crash(v){noise(Math.min(1,0.3+v*0.06),500,0.4); setTimeout(function(){noise(0.3,3000,0.2);},70);}
function thud(){noise(0.7,260,0.2);}
function horn(){const c=actx(); if(!c) return; [392,494].forEach(function(f){const o=c.createOscillator(), g=c.createGain(); o.type='square'; o.frequency.value=f; g.gain.setValueAtTime(0.06,c.currentTime); g.gain.setValueAtTime(0.06,c.currentTime+0.38); g.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+0.45); o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime+0.5);});}
function doorSound(){noise(0.45,900,0.12);}
let eng=null;
function engine(on){if(A.gtaSound){A.gtaSound.engine(on); return;} const c=actx(); if(!c) return;      // gta-sound.js has the better engine
  if(on&&!eng){const o=c.createOscillator(), o2=c.createOscillator(), g=c.createGain(), fl=c.createBiquadFilter(); o.type='sawtooth'; o2.type='square'; o.frequency.value=38; o2.frequency.value=19; fl.type='lowpass'; fl.frequency.value=380;
    const g2=c.createGain(); g2.gain.value=0.35; o.connect(fl); o2.connect(g2).connect(fl); fl.connect(g).connect(c.destination); g.gain.value=0.0001; g.gain.setTargetAtTime(0.05,c.currentTime,0.2); o.start(); o2.start(); eng={o:o,o2:o2,g:g,fl:fl};}
  if(!on&&eng){const e=eng; eng=null; e.g.gain.setTargetAtTime(0.0001,c.currentTime,0.15); setTimeout(function(){try{e.o.stop(); e.o2.stop();}catch(x){}},700);}}
let siren=null;
function sirenOn(on){const c=actx(); if(!c) return;
  if(on&&!siren){const o=c.createOscillator(), l=c.createOscillator(), lg=c.createGain(), g=c.createGain(); o.type='triangle'; o.frequency.value=700; l.frequency.value=0.7; lg.gain.value=230; l.connect(lg).connect(o.frequency); g.gain.value=0.0001; o.connect(g).connect(c.destination); o.start(); l.start(); siren={o:o,l:l,g:g};}
  if(!on&&siren){const s=siren; siren=null; s.g.gain.setTargetAtTime(0.0001,c.currentTime,0.2); setTimeout(function(){try{s.o.stop(); s.l.stop();}catch(x){}},800);}}

/* ---------- the finely built cars: one built for each kind and colour, then copied ---------- */
const built={}, copRed=new THREE.MeshLambertMaterial({color:0xd82a2a}), copBlue=new THREE.MeshLambertMaterial({color:0x2a5ad8});
let plateN=0;
/* the city bus: white with the green band, its windows all down the side, the doors, the route and where it goes in orange lights over the windscreen */
function busModel(col){const P=det.P, g=P.grp(), L=11.8, W=2.5, Hb=3.05, M=det.mat;
  const side=det.tex(1024,256,function(c){c.fillStyle='#f2f2ee'; c.fillRect(0,0,1024,256); c.fillStyle='#22302a'; c.fillRect(40,40,940,110);
    for(let x=40;x<980;x+=94){c.fillStyle='#d9dcd8'; c.fillRect(x,40,6,110);} c.fillStyle='#2f8a4a'; c.fillRect(0,168,1024,26); c.fillStyle='#1f6a36'; c.fillRect(0,198,1024,8);
    [[60,'f'],[560,'m']].forEach(function(d){c.fillStyle='#2a343c'; c.fillRect(d[0],40,84,216); c.fillStyle='#c9cdcf'; c.fillRect(d[0]+40,40,4,216);});      // the doors
    c.fillStyle='#2f8a4a'; c.font='bold 40px sans-serif'; c.fillText('דן',870,240); c.fillStyle='#1d1f21'; c.font='bold 26px sans-serif'; c.fillText('61',700,236);},false);
  const sign=det.tex(256,48,function(c){c.fillStyle='#111'; c.fillRect(0,0,256,48); c.fillStyle='#ffa21a'; c.font='bold 30px sans-serif'; c.textAlign='center'; c.fillText('61 רמת גן',128,36);},false);
  P.rbox(L,Hb-0.4,W,col,0,0.4+(Hb-0.4)/2,0,g,0.1,0.3);
  P.plane(L-0.4,(Hb-0.4)*0.98,M(side),0,0.4+(Hb-0.4)/2,W/2+0.012,g); P.plane(L-0.4,(Hb-0.4)*0.98,M(side),0,0.4+(Hb-0.4)/2,-W/2-0.012,g,R);
  P.box(0.05,1.5,W-0.2,0x26303a,L/2+0.01,1.85,0,g); P.box(0.05,0.3,1.5,M(sign),L/2+0.02,2.78,0,g); P.box(0.05,1.0,W-0.4,0x26303a,-L/2-0.01,2.1,0,g);      // the windscreen, the sign, the rear window
  P.box(0.16,0.35,W,0x1d1f21,L/2+0.02,0.45,0,g); P.box(0.16,0.35,W,0x1d1f21,-L/2-0.02,0.45,0,g); P.box(2.4,0.3,1.4,0xdcdcd8,-1.5,Hb+0.12,0,g);      // bumpers, the air conditioning on the roof
  [-1,1].forEach(function(s){P.box(0.05,0.15,0.3,lampH,L/2+0.03,0.75,s*(W/2-0.3),g); P.box(0.05,0.2,0.24,lampT,-L/2-0.03,0.85,s*(W/2-0.25),g); P.box(0.3,0.18,0.04,0x1d1f21,L/2-0.3,2.3,s*(W/2+0.15),g);
    [L/2-2.5,-L/2+3.1].forEach(function(x){const w=det.wheel(g,0.5,0.3,{style:'car',rim:0xb9bdc0}); w.position.set(x,0.5,s*(W/2-0.2)); w.rotation.order='YXZ'; w.rotation.y=R/2; w.userData.wheel=0.5;});});
  return g;}
/* a taxi's yellow roof sign, lit at night */
let taxiM=null;
function taxiSign(){if(taxiM) return taxiM; const t=det.tex(128,48,function(c){c.fillStyle='#f2c81e'; c.fillRect(0,0,128,48); c.fillStyle='#1d1d1d'; c.font='bold 26px sans-serif'; c.textAlign='center'; c.fillText('מונית',64,33);},false); taxiM=det.mat(t); A.lit('L:street',taxiM,0xffd84a,0.35); return taxiM;}
function model(kind,col,cop,taxi){const k=kind+'|'+col+(cop?'|cop':'')+(taxi?'|taxi':'');
  if(!built[k]&&kind==='bus'){const g=det.solid(busModel(col),'street'); delete g.userData.wheels; built[k]=g;}
  if(!built[k]){const g0=det.car(kind,{color:col,plate:String(11+(plateN*37)%88)+'-'+String(100+(plateN*53)%899)+'-'+String(10+(plateN*7)%89),lamp:lampH,tail:lampT}); plateN++;
    if(cop){const P=det.P; P.box(0.9,0.12,1.2,0x1d1f22,-0.3,DIM[kind][0]>4.5?1.53:1.55,0,g0); P.box(0.36,0.1,0.5,copBlue,-0.3,1.66,-0.3,g0); P.box(0.36,0.1,0.5,copRed,-0.3,1.66,0.3,g0);
      P.box(2.2,0.18,0.012,0x2a5ad8,0.1,0.72,DIM[kind][1]/2+0.01,g0); P.box(2.2,0.18,0.012,0x2a5ad8,0.1,0.72,-DIM[kind][1]/2-0.01,g0);}
    if(taxi) det.P.box(0.62,0.18,0.26,taxiSign(),-0.2,1.6,0,g0);
    const g=det.solid(g0,'street'); delete g.userData.wheels; if(A.gtaPaint) A.gtaPaint(g,col); built[k]=g;}      // a clear coat on the paint and the glass (gta-fx.js)
  const g=built[k].clone(); g.traverse(function(m){m.layers.set(OUT());}); return g;}
function Car(o){
  this.kind=o.kind; this.col=o.col; this.g=model(o.kind,o.col,o.cop,o.taxi); this.dim=DIM[o.kind]||DIM.hatch; this.name=o.cop?'Police car':o.taxi?'Taxi':NAME[o.kind]||'Car'; this.taxi=!!o.taxi;
  this.wheels=this.g.children.filter(function(c){return c.userData.wheel!=null;});
  this.x=o.x; this.z=o.z; this.psi=o.psi; this.v=0; this.steer=0; this.pk=o.pk||null; this.traffic=null; this.moved=false; this.cop=!!o.cop; this.spin=0; this.alarm=0;
  this.roll=0; this.pitch=0; this.hp=100; this.g.rotation.order='YXZ';
  this.g.userData.car=this; root.add(this.g); this.place(); live.push(this);
}
Car.prototype.place=function(){const y=SM.ground?SM.ground(this.x,this.z):U; this.g.position.set(this.x,y,this.z); this.g.rotation.set(this.roll,this.psi,this.pitch);};      // leaning in the corners, nose up as it pulls away and down as it brakes
Car.prototype.fwd=function(){return [Math.cos(this.psi),-Math.sin(this.psi)];};
Car.prototype.wheelsTurn=function(dt){const self=this; this.spin+=this.v*dt/0.31;
  this.wheels.forEach(function(w){w.rotation.x=-self.spin; w.rotation.y=R/2+(w.position.x>0?self.steer:0);});};
Car.prototype.remove=function(){root.remove(this.g); const i=live.indexOf(this); if(i>=0) live.splice(i,1); if(this.blown) this.g.traverse(function(m){if(m.isMesh&&m.material&&m.material.userData.own) m.material.dispose();});};      // a wreck's own blackened materials (gta-drive.js) go with it
/* the car as three circles down its length: for bumping into other cars and people */
Car.prototype.circles=function(){const f=this.fwd(), L=this.dim[0], r=this.dim[1]/2, n=Math.max(3,Math.ceil(L/2.2)), out=[]; for(let i=0;i<n;i++){const s=-L/2+r*0.8+(L-r*1.6)*i/(n-1); out.push([this.x+f[0]*s,this.z+f[1]*s,r]);} return out;};      // a long bus, more of them
const live=[];

/* ---------- parked cars near you are swapped for finely built ones; left far behind, swapped back ---------- */
function park(c){      // the car stays where it was left: the plain one takes its place there
  const pk=c.pk; if(!pk) return;
  if(c.moved){pk.x=c.x; pk.z=c.z; pk.h=c.psi+R/2; (pk.ob||[]).forEach(function(o){o.off=true;}); const f=c.fwd(); pk.ob=[-1.5,-0.5,0.5,1.5].map(function(s){return T.obstacles.add(c.x+f[0]*s,c.z+f[1]*s,0.95);});}
  else (pk.ob||[]).forEach(function(o){o.off=false;});
  T.showParked(pk,true); pk.live=null; c.remove();}
function lod(){const p=SM.player; if(!p) return; const me=driving?driving:p, px=me.x, pz=me.z;
  for(let i=live.length-1;i>=0;i--){const c=live[i]; if(c===driving||c.traffic||c.cop||c.held) continue; const d=Math.hypot(c.x-px,c.z-pz); if(d>(c.pk?40:150)&&!(c.alarm>0)){if(c.pk) park(c); else c.remove();}}
  if(p.lvl) return;
  let added=0; const near=[];
  for(let i=0;i<T.parked.length;i++){const k=T.parked[i]; if(k.live) continue; const d=Math.hypot(k.x-px,k.z-pz); if(d<24) near.push([d,k]);}
  near.sort(function(a,b){return a[0]-b[0];});
  for(let i=0;i<near.length&&added<1&&live.filter(function(c){return c.pk;}).length<12;i++){const k=near[i][1];
    const c=new Car({kind:k.kind,col:k.col,x:k.x,z:k.z,psi:k.h-R/2,pk:k}); k.live=c; T.showParked(k,false); (k.ob||[]).forEach(function(o){o.off=true;}); added++;}}      // in the way now as itself

/* ---------- driving ---------- */
let driving=null, getting=false, camBack=null;
const keys={};
window.addEventListener('keydown',function(e){if(!A.simsOn||A.paused||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return; const k=keyOf(e); keys[k]=true;
  if(!driving) return; if(k===' ') e.preventDefault(); if(k==='h'&&!e.repeat) honk();});
window.addEventListener('keyup',function(e){keys[keyOf(e)]=false;});
function keyOf(e){const c=e.code||''; return /^Key[A-Z]$/.test(c)?c.slice(3).toLowerCase():e.key.toLowerCase();}      /* the key itself, as game.js reads it */
window.addEventListener('blur',function(){for(const k in keys) keys[k]=false;});
const hud=document.createElement('div'); hud.id='driveHud';
hud.style.cssText='position:absolute;left:50%;transform:translateX(-50%);bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:4;display:none;align-items:center;gap:10px;background:rgba(23,33,28,.86);color:#fff;font:700 13px/1 inherit;padding:7px 8px 7px 16px;border-radius:99px;box-shadow:0 4px 14px rgba(0,0,0,.3)';
hud.innerHTML='<span><b id="dSpd" style="font-size:22px;font-variant-numeric:tabular-nums">0</b> km/h</span><span id="dWhere" style="font-weight:600;opacity:.8;max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"></span><button class="fab" id="dHorn" style="background:#f4d53a;color:#1d1f21;border-color:#f4d53a">Horn</button><button class="fab" id="dOut" style="background:#fff;color:#1d1f21;border-color:#fff">Get out</button>';
A.stage.appendChild(hud);
$('dOut').onclick=function(e){e.stopPropagation(); exit();}; $('dHorn').onclick=function(e){e.stopPropagation(); honk();};
function honk(){horn(); const c=driving; if(!c) return; const f=c.fwd(); (A.game&&A.game.all?A.game.all():[]).forEach(function(t){if(t.kind!=='person'||(t.lvl||0)) return; const q=t.root.getWorldPosition(new THREE.Vector3()); const dx=q.x-c.x, dz=q.z-c.z; if(Math.hypot(dx,dz)<9&&dx*f[0]+dz*f[1]>0&&Math.random()<0.5&&A.game.say) A.game.say(t,['Alright, alright!','Hey! I am walking here!','Relax!'][Math.floor(Math.random()*3)]);});
  traffic.forEach(function(t){if(Math.hypot(t.car.x-c.x,t.car.z-c.z)<12) t.wait=Math.max(t.wait||0,0);});}
function enter(c){
  const p=SM.player; if(!c||driving||getting||p.lvl||(A.game&&A.game.G&&A.game.G.down)||(A.floors&&A.floors.G.busted)) return; SM.stop(); if(A.game&&A.game.select) A.game.select(null);
  if(c.traffic){carjack(c); return;}
  const f=c.fwd(), w=c.dim[1]/2+0.55, doors=[[c.x+f[1]*w,c.z-f[0]*w],[c.x-f[1]*w,c.z+f[0]*w]].filter(function(q){return A.nav.isFree(q[0],q[1]);});      // the driver's door on the left; or the other, and slide across
  const door=doors.sort(function(a,b){return Math.hypot(a[0]-p.x,a[1]-p.z)-Math.hypot(b[0]-p.x,b[1]-p.z);})[0]||[c.x+f[1]*w,c.z-f[0]*w];
  getting=true; c.held=true;
  const go=function(){getting=false; if(driving) return; p.hT=c.psi+R/2; doorSound(); setTimeout(function(){doorSound();},350);
    driving=c; c.held=false; c.moved=true; c.v=0; c.vdir=c.psi; if(c.pk){(c.pk.ob||[]).forEach(function(o){o.off=true;});}
    p.release(); p.path=[]; p.cb=null; p.p.g.visible=false; p.driving=c; engine(true); hud.style.display='flex';
    camBack=SM.camMode; if(SM.camMode==='eye') SM.setCam('follow'); SM.setDoing('driving');
    SM.toast(TOUCH?'Push the left stick to drive: up is gas, down brakes and reverses. Get out with the button.':'W gas · S brake and reverse · A D steer · Space handbrake · H horn · E get out · M map');};
  if(Math.hypot(p.x-door[0],p.z-door[1])<1.2) go(); else{p.speed=3.6; p.goTo(door[0],door[1],function(){p.speed=1.4; go();});}      // a jog to the door, as in GTA
  setTimeout(function(){if(getting&&!driving){getting=false; c.held=false; p.speed=1.4;}},20000);
}
function exit(quiet){
  const c=driving, p=SM.player; if(!c) return; driving=null; engine(false); c.roll=c.pitch=0; c.vdir=c.psi; c.place();      /* it settles level when you leave it */ hud.style.display='none'; p.driving=null; c.v=Math.abs(c.v)<0.5?0:c.v*0.3; c.steer=0;
  const f=c.fwd(), W=c.dim[1]/2+0.6, spots=[[c.x+f[1]*W,c.z-f[0]*W],[c.x-f[1]*W,c.z+f[0]*W],[c.x-f[0]*(c.dim[0]/2+0.8),c.z-f[1]*(c.dim[0]/2+0.8)],[c.x+f[0]*(c.dim[0]/2+0.8),c.z+f[1]*(c.dim[0]/2+0.8)]];
  let s=spots.find(function(q){return A.nav.isFree(q[0],q[1]);})||spots[0];
  p.x=s[0]; p.z=s[1]; p.h=p.hT=c.psi+R/2; p.p.g.visible=true; p.p.sitT=0; p.lx=p.x; p.lz=p.z; SM.setDoing(''); if(!quiet){doorSound(); SM.flyToPlayer();}
}
/* out of someone else's car: they get out shouting, you get in */
function carjack(c){const p=SM.player, t=c.traffic; t.stop=99; c.v=0;
  const f=c.fwd(), door=[c.x+f[1]*(c.dim[1]/2+0.55),c.z-f[0]*(c.dim[1]/2+0.55)];
  p.goTo(door[0],door[1],function(){p.hT=c.psi+R/2; p.p.act='reach'; doorSound();
    const spec={id:'drv'+Math.floor(Math.random()*1e6),name:'Driver',h:1.7,skin:[0xe0ac85,0xc68e66,0xf1c9a5][Math.floor(Math.random()*3)],hair:0x2a1e17,style:'short',top:[0x26386b,0xd84a4a,0x2f6f52][Math.floor(Math.random()*3)],pants:0x2b2f38,pj:0x9db7dd};
    const d=new SM.Actor(spec); d.lvl=0; d.x=door[0]+f[0]*0.9; d.z=door[1]+f[1]*0.9; d.h=d.hT=c.psi; d.speed=2.4; jacked.push({a:d,until:A.t+14});
    setTimeout(function(){p.p.act=null; d.say(['Hey! That is my car!','THIEF! My car!','Are you crazy?! Get out!'][Math.floor(Math.random()*3)],2.6); const away=[d.x-f[0]*30,d.z-f[1]*30]; d.goTo(away[0],away[1]);
      if(A.floors) A.floors.raise(2);
      const i=traffic.indexOf(t); if(i>=0) traffic.splice(i,1); c.traffic=null; c.held=false; enter(c);},700);});}
const jacked=[];

function inputs(){
  const st=A.sticks&&A.sticks.move, sx=st?st.x:0, sy=st?st.y:0;
  let gas=(keys.w||keys.arrowup)?1:0, brk=(keys.s||keys.arrowdown)?1:0, steer=((keys.a||keys.arrowleft)?1:0)-((keys.d||keys.arrowright)?1:0);
  if(Math.hypot(sx,sy)>0.15){if(sy<-0.15) gas=Math.min(1,-sy*1.2); if(sy>0.15) brk=Math.min(1,sy*1.2); if(Math.abs(sx)>0.12) steer=-sx;}
  return {gas:gas,brk:brk,steer:steer,hand:!!keys[' ']};}
function blockedAt(x,z){noDyn=true; try{return !A.nav.isFree(x,z);} finally{noDyn=false;}}
/* the cars as things in the way of whoever walks: the walking map asks */
let noDyn=false;
T.dyn=function(x,z,rad){if(noDyn) return false; for(let i=0;i<live.length;i++){const c=live[i]; if(c===driving||Math.abs(c.x-x)>3.5||Math.abs(c.z-z)>3.5) continue; const cs=c.circles(); for(let k=0;k<3;k++) if(Math.hypot(cs[k][0]-x,cs[k][1]-z)<cs[k][2]+rad) return true;} return false;};
function hitsCar(c,x,z,psi){const f=[Math.cos(psi),-Math.sin(psi)], L=c.dim[0], r=c.dim[1]/2;
  for(let i=0;i<live.length;i++){const o=live[i]; if(o===c) continue; if(Math.hypot(o.x-x,o.z-z)>6) continue; const oc=o.circles();
    for(let s=-1;s<=1;s++){const px=x+f[0]*s*L/3, pz=z+f[1]*s*L/3; for(let k=0;k<3;k++) if(Math.hypot(oc[k][0]-px,oc[k][1]-pz)<oc[k][2]+r*0.95) return o;}}
  return null;}
function outlineFree(c,x,z,psi){const f=[Math.cos(psi),-Math.sin(psi)], s=[f[1],-f[0]], L=c.dim[0]/2-0.05, W=c.dim[1]/2-0.05;
  const P=[[L,W],[L,-W],[-L,W],[-L,-W],[L,0],[-L,0],[0,W],[0,-W],[L*0.5,W],[L*0.5,-W],[-L*0.5,W],[-L*0.5,-W]];
  for(let i=0;i<P.length;i++){const q=P[i]; if(blockedAt(x+f[0]*q[0]+s[0]*q[1],z+f[1]*q[0]+s[1]*q[1])) return false;} return true;}
let hitCool=0;
/* as in GTA: quick, a little twitchy, and the handbrake throws the back out */
const TOP={mini:25,hatch:28,sedan:31,suv:29,van:25,bus:19}, ACC={mini:6.2,hatch:7,sedan:7.8,suv:7.2,van:5.8,bus:3.2};
function drive(c,dt){
  const I=inputs(), v0=c.v, top=c.cop?34:TOP[c.kind]||28, acc=(ACC[c.kind]||7)*(c.hp<=0?0:c.hp<30?0.55:1);      // a wreck hardly pulls, a dead engine not at all
  if(c.vdir==null) c.vdir=c.psi;
  if(I.gas){if(c.v<0) c.v+=12*dt*I.gas; else c.v+=acc*dt*I.gas*(1-0.85*Math.pow(Math.max(0,c.v)/top,2));}
  if(I.brk){if(c.v>0.3) c.v-=15*dt*I.brk; else c.v-=5*dt*I.brk;}
  if(!I.gas&&!I.brk) c.v-=Math.sign(c.v)*Math.min(Math.abs(c.v),(0.6+0.012*c.v*c.v)*dt);
  if(I.hand) c.v-=Math.sign(c.v)*Math.min(Math.abs(c.v),4.5*dt);
  c.v=Math.max(-8,Math.min(top,c.v));
  const sp=Math.abs(c.v), ms=0.62/(1+sp*0.045); c.steer+=(I.steer*ms-c.steer)*Math.min(1,dt*(I.steer?6:8));
  const drift=I.hand&&sp>5, yaw=c.v/c.dim[2]*Math.tan(c.steer)*(drift?1.75:1);
  const npsi=c.psi+yaw*dt;
  /* the way it goes follows the way it points: at once with grip, slowly with the handbrake on, a little late in a fast corner; sliding scrubs speed */
  const grip=drift?1.6:(sp>14&&Math.abs(c.steer)>0.3?6:14), slip=wrap(npsi-c.vdir);
  c.vdir=npsi-slip*Math.exp(-grip*dt); if(Math.abs(slip)>0.08) c.v*=1-Math.min(0.5,Math.abs(slip))*0.6*dt;
  c.skid=Math.max(0,Math.min(1,Math.abs(slip)*sp/5+(drift?0.5:0)+(I.brk&&c.v>9?0.45:0)));
  const f=[Math.cos(c.vdir),-Math.sin(c.vdir)], nx=c.x+f[0]*c.v*dt, nz=c.z+f[1]*c.v*dt;
  let other=hitsCar(c,nx,nz,npsi);
  if(other&&!other.traffic&&!other.cop&&Math.abs(c.v)<9&&outlineFree(c,nx,nz,npsi)){      // a parked car: shove it along
    const px=(nx-c.x)*0.9, pz=(nz-c.z)*0.9, ox=other.x+px, oz=other.z+pz;
    if(outlineFree(other,ox,oz,other.psi)&&!hitsCar(other,ox,oz,other.psi)){other.x=ox; other.z=oz; other.moved=true; other.place(); c.v*=Math.pow(0.4,dt); if(Math.abs(c.v)>1.5&&A.t>hitCool){noise(0.25,400,0.15); hitCool=A.t+0.35;} other=null;}}
  if(other||!outlineFree(c,nx,nz,npsi)){
    if(Math.abs(c.v)>2.5&&A.t>hitCool){crash(Math.abs(c.v)); hitCool=A.t+0.6; shake=Math.min(0.5,Math.abs(c.v)*0.03); if(other){other.alarm=A.t+6; if(other.traffic) other.traffic.angry=A.t+3; other.hp-=Math.min(35,Math.abs(c.v)*1.4);}
      if(Math.abs(c.v)>4) c.hp=Math.max(0,c.hp-Math.min(40,Math.abs(c.v)*1.5));}      // a knock costs the car; enough of them and it smokes, then dies
    if(outlineFree(c,c.x,c.z,npsi)) c.psi=npsi;      // turning on the spot still works against a wall
    c.v=-c.v*0.2; c.vdir=c.psi;
  }else{c.x=nx; c.z=nz; c.psi=npsi;}
  const lat=yaw*c.v, lon=(c.v-v0)/Math.max(dt,1e-3);
  c.roll+=(Math.max(-0.07,Math.min(0.07,lat*0.0045))-c.roll)*Math.min(1,dt*5); c.pitch+=(Math.max(-0.045,Math.min(0.045,lon*0.0045))-c.pitch)*Math.min(1,dt*5);
  c.place(); c.wheelsTurn(dt);
  /* people in the way */
  if(Math.abs(c.v)>2.2&&A.game&&A.game.all){const cs=c.circles(); A.game.all().forEach(function(t){if(t.kind!=='person'||(t.lvl||0)) return; const q=t.a?{x:t.a.x,z:t.a.z}:t.root.getWorldPosition(new THREE.Vector3());
    for(let k=0;k<3;k++){if(Math.hypot(q.x-cs[k][0],q.z-cs[k][1])<cs[k][2]+0.25){runOver(t,c); break;}}});}
  if(A.gtaSound) A.gtaSound.rev(c,I,dt); else if(eng&&ac){const sp=Math.abs(c.v), gear=sp<6?sp/6:sp<12?(sp-6)/6:(sp-12)/7; eng.o.frequency.setTargetAtTime(36+gear*55+sp*1.5,ac.currentTime,0.05); eng.o2.frequency.setTargetAtTime(18+gear*27,ac.currentTime,0.05); eng.fl.frequency.setTargetAtTime(320+sp*30+(I.gas?200:0),ac.currentTime,0.08);}
  const p=SM.player; p.x=c.x; p.z=c.z; p.lx=p.x; p.lz=p.z; p.h=p.hT=c.psi+R/2; p.p.g.position.set(c.x,c.g.position.y,c.z); p.p.walking=false;
  $('dSpd').textContent=Math.round(Math.abs(c.v)*3.6);
  if(v0!==c.v||c.v) A.touch(1);
}
function runOver(t,c){const s=A.game.state(t); if(s.down) return; thud(); c.v*=0.75; s.hp-=60; A.game.knock(t,6); if(A.game.say) A.game.say(t,['AAAH!','My leg!','Are you insane?!'][Math.floor(Math.random()*3)]);
  const w=A.game.witnesses?A.game.witnesses(t,25):[]; if(A.floors) A.floors.raise(w.length?2:1); if(w.length&&A.game.say) A.game.say(w[0],['He ran him over!','Call an ambulance!','Police! Police!'][Math.floor(Math.random()*3)]);}

/* ---------- the camera rides behind ---------- */
let shake=0; const ct=new THREE.Vector3(), cp=new THREE.Vector3();
function chase(c,dt){const f=c.fwd(), back=7.4+Math.abs(c.v)*0.12, y=c.g.position.y;
  cp.set(c.x-f[0]*back,y+3.2+Math.abs(c.v)*0.03,c.z-f[1]*back); ct.set(c.x+f[0]*3,y+1.1,c.z+f[1]*3);
  const k=1-Math.exp(-dt*3.5), cam=A.camera, ctl=A.controls;
  if(A.flying&&A.flying()) A.stopFly&&A.stopFly();
  cam.position.lerp(cp,k); ctl.target.lerp(ct,1-Math.exp(-dt*7));
  if(shake>0){cam.position.x+=(Math.random()-0.5)*shake; cam.position.y+=(Math.random()-0.5)*shake; shake=Math.max(0,shake-dt*1.5);}
  if(!ctl.enabled) cam.lookAt(ctl.target);}

/* =====================================================================
   Traffic: along the streets of the map, both ways, keeping to the right
   ===================================================================== */
const traffic=[], MAXT=TOUCH?7:16, COLS=[0xe9e9e6,0x2f4f7a,0xb5372f,0x7a7f84,0xf2f2ee,0x1d1f21,0xb9bcbe,0x8a1f2a,0x3a4a5a,0x2e5e4e,0xdddddd,0x101214,0xc9b27a];
const drivable=T.net.filter(function(r){return r.k===1||r.k===2||r.k===6||r.k===7;});
function laneOff(rd){return rd.k===2?0.0:rd.k===1?0.95:2.1;}      // between the parked cars on a side street; on a main street, its own side
function segPos(t){const rd=t.rd, a=rd.p[t.j], b=rd.p[t.j+1], dx=b[0]-a[0], dz=b[1]-a[1], l=Math.hypot(dx,dz)||1, s=Math.min(t.s,l), n=[-dz/l,dx/l], lo=laneOff(rd)*t.dir;
  const along=t.dir>0?s:l-s, x=a[0]+dx/l*along+n[0]*lo, z=a[1]+dz/l*along+n[1]*lo; return {x:x,z:z,h:Math.atan2(dx*t.dir,dz*t.dir),l:l};}
const mains=drivable.filter(function(r){return r.k!==2;});
function spawnTraffic(px,pz){const wantBus=!traffic.some(function(o){return o.bus;});
  for(let tries=0;tries<30;tries++){const rd=wantBus&&tries%2===0?mains[Math.floor(Math.random()*mains.length)]:drivable[Math.floor(Math.random()*drivable.length)], j=Math.floor(Math.random()*(rd.p.length-1)), a=rd.p[j], b=rd.p[j+1], l=Math.hypot(b[0]-a[0],b[1]-a[1]); if(l<8) continue;
    const t={rd:rd,j:j,s:Math.random()*l,dir:Math.random()<0.5?1:-1,wait:0,stop:0,cruise:cruiseOf(rd,false)}; const q=segPos(t), d=Math.hypot(q.x-px,q.z-pz);
    if(d<70||d>190||T.kept(q.x,q.z)||nearHome(q.x,q.z)||!A.nav.isFree(q.x,q.z)) continue;
    if(traffic.some(function(o){return Math.hypot(o.car.x-q.x,o.car.z-q.z)<15;})) continue;
    const bus=rd.k!==2&&wantBus, taxi=!bus&&Math.random()<0.16, kinds=['hatch','sedan','hatch','suv','mini','van','sedan'], c=new Car({kind:bus?'bus':taxi?'sedan':kinds[Math.floor(Math.random()*kinds.length)],col:bus||taxi?0xf2f2ee:COLS[Math.floor(Math.random()*COLS.length)],taxi:taxi,x:q.x,z:q.z,psi:q.h-R/2});      /* now and then a taxi, white with its yellow sign */
    if(bus){t.bus=true; t.cruise=cruiseOf(null,true);} c.traffic=t; t.car=c; c.v=t.cruise*0.6; traffic.push(t); return t;}
  return null;}
/* at the end of a stretch: on along the same street, or round the corner onto another */
function nextSeg(t){const rd=t.rd;
  if(t.dir>0&&t.j<rd.p.length-2){t.j++; t.s=0; return turnAt(t,rd.p[t.j]);} if(t.dir<0&&t.j>0){t.j--; t.s=0; return turnAt(t,rd.p[t.j+1]);}
  const end=t.dir>0?rd.p[rd.p.length-1]:rd.p[0]; if(!turnAt(t,end,true)){t.dir=-t.dir; t.s=0;}}
function turnAt(t,pt,must){const n=T.nodes.get(T.key(pt)); if(!n) return false; const opts=[];
  n.roads.forEach(function(r){if(r===t.rd||drivable.indexOf(r)<0||(t.bus&&r.k===2)) return;      /* the bus keeps to the main streets */ const j=r.p.findIndex(function(q){return T.key(q)===T.key(pt);}); if(j<0) return; if(j<r.p.length-1) opts.push({rd:r,j:j,dir:1}); if(j>0) opts.push({rd:r,j:j-1,dir:-1});});
  if(!opts.length||(!must&&Math.random()<0.55)) return !must;
  const o=opts[Math.floor(Math.random()*opts.length)]; t.rd=o.rd; t.j=o.j; t.dir=o.dir; t.s=0; t.cruise=cruiseOf(o.rd,t.bus); return true;}
function cruiseOf(rd,bus){return bus?9.5:rd&&rd.k===2?8:12.5;}      /* as GTA's traffic: 45 km/h down the main streets, 29 in the side streets, the bus 34 */
function aheadClear(t,dist){const c=t.car, f=c.fwd(), p=SM.player;
  const check=function(x,z,lat){const dx=x-c.x, dz=z-c.z, a=dx*f[0]+dz*f[1], s=Math.abs(dx*f[1]-dz*f[0]); return a>0&&a<dist&&s<lat;};
  if(p&&!p.lvl&&!driving&&check(p.x,p.z,1.8)) return 'you';
  if(driving&&check(driving.x,driving.z,2.2)) return 'car';
  for(let i=0;i<live.length;i++){const o=live[i]; if(o!==c&&check(o.x,o.z,1.9)) return 'car';}
  if(A.game&&A.game.all){const ps=A.game.all(); for(let i=0;i<ps.length;i++){const q=ps[i]; if(q.kind!=='person'||!q.a) continue; if(check(q.a.x,q.a.z,1.6)) return 'person';}}
  return null;}
function trafficStep(t,dt){const c=t.car; if(c.held) return;
  if(t.stop>0){t.stop-=dt; c.v=Math.max(0,c.v-10*dt); c.place(); return;}
  const blk=aheadClear(t,9+c.v*0.6+(t.bus?4:0)); let want=blk||c.hp<=0?0:t.cruise;      /* wrecked: it rolls to a stop and stays there, smoking */
  /* the lights at the junction ahead: red, or amber with room to stop, and it waits at the line */
  {const rd=t.rd, q0=segPos(t), end=t.dir>0?rd.p[t.j+1]:rd.p[t.j], sig=T.signals&&T.signals.get(T.key(end));
    if(sig){const st=T.sigState(sig.grp.has(rd)?sig.grp.get(rd):0), toLine=(q0.l-t.s)-(sig.wo+3.2)-c.dim[0]/2;
      if(st!=='g'&&toLine>-0.5&&toLine<40&&!(st==='a'&&toLine<c.v*0.6)) want=Math.min(want,Math.max(0,Math.sqrt(2*4.5*Math.max(0,toLine))-0.5));}
    const nd=T.nodes.get(T.key(end)); if(nd&&nd.roads.length>1){const rem=q0.l-t.s; if(rem<16) want=Math.min(want,Math.max(6,6+(rem-4)*0.55));}}      /* and it slows for the junction itself, to turn or to cross */
  /* the bus pulls in at its stops and waits while people get on */
  if(t.bus&&T.stops) for(let i=0;i<T.stops.length;i++){const s=T.stops[i]; if(s.rd!==t.rd||t.last===s) continue; const f=c.fwd(), dx=s.x-c.x, dz=s.z-c.z, ahead=dx*f[0]+dz*f[1], side=Math.abs(dx*f[1]-dz*f[0]);
    if(side<5&&ahead<2&&ahead>-3){t.last=s; t.stop=7; if(A.busAt) A.busAt(s,c);}}
  if(blk==='you'&&c.hp>0){t.wait=(t.wait||0)+dt; if(t.wait>3&&!t.honked){t.honked=true; horn();}} else{t.wait=0; t.honked=false;}
  c.v+=(want-c.v)*Math.min(1,dt*(want<c.v?3.5:1.2));
  let step=c.v*dt; let q=segPos(t);
  while(step>0){const rem=q.l-t.s; if(step<rem){t.s+=step; step=0;} else{step-=rem; nextSeg(t); q=segPos(t);}}
  q=segPos(t); c.x=q.x; c.z=q.z; c.psi=ang(c.psi,q.h-R/2,Math.min(1,dt*5)); c.place(); c.wheelsTurn(dt);
  if(T.kept(c.x,c.z)||nearHome(c.x,c.z)){t.gone=true;}      // the street round the square has its own traffic
}
function nearHome(x,z){const LB=A.LB; return x>LB.XF-30&&x<LB.XF+50&&z>LB.ZC-56&&z<LB.ZC+24;}

/* =====================================================================
   The police, when the stars are up and you are in a car: a patrol car comes after you, lights going
   ===================================================================== */
let cop=null, copLights=0, bustT=0;
function copStep(dt){
  const G=A.floors&&A.floors.G, want=G&&G.wanted>=1&&driving&&!SM.player.lvl;
  if(!want){if(cop&&(!G||!G.wanted)){cop.remove(); cop=null; sirenOn(false);} return;}
  const me=driving;
  if(!cop){let s=null; for(let k=0;k<20&&!s;k++){const a=Math.random()*2*R, d=45+Math.random()*30, x=me.x+Math.cos(a)*d, z=me.z+Math.sin(a)*d, q=T.nearest(x,z); if(q&&A.nav.isFree(q[0],q[1])) s=q;} if(!s) return;
    cop=new Car({kind:'sedan',col:0xf2f2ee,cop:true,x:s[0],z:s[1],psi:Math.atan2(-(me.z-s[1]),me.x-s[0])}); cop.route=null; cop.rt=0; sirenOn(true); SM.toast('★ A patrol car is after you.');}
  const c=cop, dx=me.x-c.x, dz=me.z-c.z, d=Math.hypot(dx,dz);
  if(d>160){c.remove(); cop=null; return;}
  /* the way to you: the walking map's route, refreshed every second; straight at you when close */
  if(A.t>c.rt){c.rt=A.t+1.0; c.route=d>14?T.path(c.x,c.z,me.x,me.z,true):null;}
  let tx=me.x, tz=me.z; if(c.route&&c.route.length){while(c.route.length>1&&Math.hypot(c.route[0][0]-c.x,c.route[0][1]-c.z)<5) c.route.shift(); tx=c.route[0][0]; tz=c.route[0][1];}
  const want2=Math.atan2(-(tz-c.z),tx-c.x), da=wrap(want2-c.psi), sp=d<8?Math.max(0,Math.abs(me.v)+1):Math.min(17,6+d*0.25);
  c.steer=Math.max(-0.6,Math.min(0.6,da*1.5)); c.v+=(sp*(Math.abs(da)>1.2?0.45:1)-c.v)*Math.min(1,dt*1.5);
  const npsi=c.psi+c.v/c.dim[2]*Math.tan(c.steer)*dt, f=[Math.cos(npsi),-Math.sin(npsi)], nx=c.x+f[0]*c.v*dt, nz=c.z+f[1]*c.v*dt;
  const hit=hitsCar(c,nx,nz,npsi);
  if(hit===me){crash(Math.abs(c.v-me.v)); shake=0.25; c.v*=0.3; me.v*=0.6;}
  if(!hit&&outlineFree(c,nx,nz,npsi)){c.x=nx; c.z=nz; c.psi=npsi;} else{c.v*=-0.3; c.psi=npsi; c.stuck=(c.stuck||0)+dt; if(c.stuck>3){c.stuck=0; const q=T.nearest(me.x-me.fwd()[0]*30,me.z-me.fwd()[1]*30); if(q){c.x=q[0]; c.z=q[1];}}}
  c.place(); c.wheelsTurn(dt);
  copLights+=dt; const on=Math.floor(copLights*5)%2; copRed.emissive.setHex(on?0xff2a2a:0x220000); copBlue.emissive.setHex(on?0x001133:0x3a6aff);
  /* stopped with the patrol car on you: busted */
  if(d<5.5&&Math.abs(me.v)<1.5){bustT+=dt; if(bustT>1.6){bustT=0; SM.toast('Out of the car! Hands on the roof!'); exit(true); if(A.floors&&A.floors.busted) A.floors.busted();}} else bustT=Math.max(0,bustT-dt);
}

/* =====================================================================
   A destination set on the map: a beam of light there, and its distance on the dashboard
   ===================================================================== */
const beam=new THREE.Mesh(new THREE.CylinderGeometry(0.8,0.8,60,16,1,true),new THREE.MeshBasicMaterial({color:0xf4d53a,transparent:true,opacity:0.32,depthWrite:false,side:THREE.DoubleSide,fog:false}));
beam.visible=false; beam.userData.nc=true; scene.add(beam);
let goal=null;
function gps(x,z){goal=[x,z]; beam.position.set(x,30,z); beam.visible=true; beam.layers.set(OUT()); SM.toast('Destination set: follow the yellow light.');}

/* ---------- every frame ---------- */
let lodT=0;
A.frameFns.push(function(dt){
  if(!A.simsOn||!SM.player){if(driving) exit(true); if(live.length) live.slice().forEach(function(c){if(c.pk) park(c); else c.remove();}); traffic.length=0; if(cop){cop=null; sirenOn(false);} hud.style.display='none'; beam.visible=false; return;}
  const p=SM.player;
  lodT-=dt; if(lodT<0){lodT=0.25; lod(); if(!p.lvl){const mx=driving?driving.x:p.x, mz=driving?driving.z:p.z;
    for(let i=traffic.length-1;i>=0;i--){const t=traffic[i]; if(Math.hypot(t.car.x-mx,t.car.z-mz)>240&&!t.car.held){t.car.remove(); traffic.splice(i,1);}}
    if(traffic.length<MAXT&&T.inside(mx,mz)) spawnTraffic(mx,mz);
    else if(!traffic.some(function(o){return o.bus;})&&traffic.length){let far=null; traffic.forEach(function(o){const d=Math.hypot(o.car.x-mx,o.car.z-mz); if(!o.car.held&&(!far||d>far.d)) far={o:o,d:d};}); if(far&&far.d>70){far.o.car.remove(); traffic.splice(traffic.indexOf(far.o),1);}}}}      // make room for a bus
  if(getting&&!driving&&!p.path.length){getting=false; p.cb=null; p.speed=1.4; live.forEach(function(c){if(c.held&&!c.traffic) c.held=false;});}      /* the way to the car's door was called off */
  for(let i=traffic.length-1;i>=0;i--){const t=traffic[i]; trafficStep(t,dt); if(t.gone){t.car.remove(); traffic.splice(i,1);}}
  if(driving){drive(driving,dt); if(!(A.gtaCam&&A.gtaCam())) chase(driving,dt); else if(shake>0){if(A.gtaShake) A.gtaShake(shake); shake=0;}
    const w=T.roadNear(driving.x,driving.z); $('dWhere').textContent=w&&w.d<6&&w.r.name?w.r.name:'';
    if(goal){const d=Math.hypot(goal[0]-driving.x,goal[1]-driving.z); $('dWhere').textContent+=' · '+Math.round(d)+' m to go'; if(d<12){goal=null; beam.visible=false; SM.toast('You have arrived.');}}}
  else if(goal&&Math.hypot(goal[0]-p.x,goal[1]-p.z)<6){goal=null; beam.visible=false;}
  if(!A.gtaCops) copStep(dt);      // gta-cops.js runs the police in the streets
  for(let i=jacked.length-1;i>=0;i--){const j=jacked[i]; j.a.update(dt); if(A.t>j.until){j.a.remove(); jacked.splice(i,1);}}
});

/* the people you knocked down, the cars you can get into: offered to game.js */
A.drive={cars:function(){const p=SM.player; return live.filter(function(c){return c!==driving&&(!p||Math.hypot(c.x-p.x,c.z-p.z)<30);});},
  enter:enter,exit:exit,on:function(){return !!driving;},pos:function(){return driving;},heading:function(){return driving?driving.psi+R/2:0;},gps:gps,
  key:function(k){if(k==='e'&&driving){exit(); return true;} return false;},
  kick:function(c){c.alarm=A.t+7; alarm(c);},
  mapDots:function(fn){traffic.forEach(function(t){fn(t.car.x,t.car.z,'#ffffff');}); if(cop) fn(cop.x,cop.z,'#2a5ad8'); if(goal) fn(goal[0],goal[1],'#f4d53a');},
  traffic:traffic,live:live,Car:Car,hitsCar:hitsCar,outlineFree:outlineFree,copLights:[copRed,copBlue],crash:crash,shake:function(s){shake=Math.max(shake,s);}};
function alarm(c){const ctx=actx(); if(!ctx) return; const o=ctx.createOscillator(), g=ctx.createGain(); o.type='square'; o.frequency.value=900; const l=ctx.createOscillator(), lg=ctx.createGain(); l.frequency.value=3; lg.gain.value=300; l.connect(lg).connect(o.frequency);
  g.gain.value=0.05; o.connect(g).connect(ctx.destination); o.start(); l.start(); o.stop(ctx.currentTime+6); l.stop(ctx.currentTime+6);}
})();
