/* Haroe 10 — weapons and pickups, as in GTA. You start with your fists. A knife lies by the shops, a baseball bat by the green bins in
   the alley, a pistol in one of the gardens, a micro SMG in another, a body-armour vest in a third and first aid by the clinic; they
   turn and glow where they lie, walk over one to take it, and they come back a while later. An officer you knock out drops his pistol.
   Tab changes weapon; held, it opens the weapon wheel (time slows, the mouse or the scroll wheel picks, let go to draw). With a gun,
   hold the right mouse button to aim over your shoulder at the crosshair and click to fire (the SMG fires as long as you hold), or fire
   from the hip with R and it finds whoever is in front of you; on a phone the punch button shoots. A bat, a knife or a bullet knocks
   people out; the street panics at shots, and the police take gunfire as GTA V does: a shot in the air one star, a hit two, a shot at
   them three, and one more each time they see you again. Armour takes most of a hit for you. */
(function(){
'use strict';
const A=window.APP, SM=A.sims, T=A.town, R=Math.PI;
if(!SM||!A.game) return;
const scene=A.scene, cam=A.camera, cv=A.renderer.domElement, OUT=function(){return A.LAYER_OUT||5;};
const TOUCH=!!(window.matchMedia&&(matchMedia('(pointer: coarse)').matches||(navigator.maxTouchPoints>0&&!matchMedia('(any-pointer: fine)').matches)));      /* a phone or a tablet; a laptop with a touch screen and a mouse plays as a computer */
function hyp(a,b){return Math.hypot(a,b);}
function clamp(v,a,b){return v<a?a:v>b?b:v;}
function rnd(a){return a[Math.floor(Math.random()*a.length)];}
if(window.CanvasRenderingContext2D&&!CanvasRenderingContext2D.prototype.roundRect) CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){r=Math.min(r,w/2,h/2); this.moveTo(x+r,y); this.arcTo(x+w,y,x+w,y+h,r); this.arcTo(x+w,y+h,x,y+h,r); this.arcTo(x,y+h,x,y,r); this.arcTo(x,y,x+w,y,r); this.closePath(); return this;};      /* older browsers: the rounded box the icons use */

/* ---------- what there is, and what you carry ---------- */
const KINDS={
  fists:{name:'Fists',melee:true,k:1,act:'punch'},
  knife:{name:'Knife',melee:true,k:1.8,act:'punch',hint:'Knife. Quick, and it cuts deep.'},
  bat:{name:'Baseball bat',melee:true,k:2.4,act:'swing',hint:'Baseball bat.'},
  pistol:{name:'Pistol',gun:true,clip:12,rate:0.32,dmg:75,box:24,hint:'Pistol.'},
  uzi:{name:'Micro SMG',gun:true,clip:30,rate:0.085,dmg:30,box:60,auto:true,spread:true,hint:'Micro SMG. Hold to fire.'}};
const ORDER=['fists','knife','bat','pistol','uzi'];
const W={has:{fists:true,knife:false,bat:false,pistol:false,uzi:false},cur:'fists',ammo:{pistol:0,uzi:0},clip:{pistol:0,uzi:0},reload:0,aim:false,next:0,firing:false,drawT:-9};
function K(){return KINDS[W.cur];}
A.gtaArmor=0;
A.gtaWeapon=W; A.gtaKinds=KINDS;
A.gtaMelee={get act(){return K().act||'punch';},get k(){return K().k||1;}};      // game.js asks: how a blow looks, and how hard it lands
/* the weapons in your right hand */
let held=null;
function kit(){const p=SM.player; if(!p) return null; if(held&&held.p===p.p) return held;
  const P=p.p, mk=function(c,r,m){const mat=new THREE.MeshStandardMaterial({color:c,roughness:r==null?0.6:r,metalness:m||0}); P.mats.push({m:mat,b:new THREE.Color(c)}); return mat;};
  const box=function(g,w,h,d,mat,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat); m.position.set(x||0,y||0,z||0); g.add(m); return m;};
  const dark=mk(0x161718,0.4), steel=mk(0xe2e5e8,0.3,0.35);      // bright steel: too much metal and it mirrors the dark of the sky
  /* the bat */
  const bat=new THREE.Group(); bat.position.set(0,-0.3,0.02); P.hand.add(bat);
  const wood=mk(0xb9844a,0.5), grip=mk(0x1d1f22,0.8); const b1=new THREE.Mesh(new THREE.CylinderGeometry(0.036,0.016,0.72,12),wood); b1.position.y=-0.38; bat.add(b1); const b2=new THREE.Mesh(new THREE.CylinderGeometry(0.018,0.018,0.16,10),grip); b2.position.y=0.04; bat.add(b2);
  /* the knife: a blade down from the fist, a dark handle in it */
  const knife=new THREE.Group(); knife.position.set(0,-0.3,0.03); P.hand.add(knife);
  box(knife,0.022,0.19,0.004,steel,0,-0.12,0).rotation.x=0.1; box(knife,0.012,0.05,0.004,steel,0.005,-0.235,0); box(knife,0.026,0.1,0.022,mk(0x2a2420,0.8),0,0.01,0); box(knife,0.034,0.012,0.026,dark,0,-0.045,0);
  /* the pistol */
  const gun=new THREE.Group(); gun.position.set(0,-0.31,0.03); P.hand.add(gun);
  box(gun,0.036,0.2,0.046,dark,0,-0.05,0); box(gun,0.03,0.2,0.02,mk(0x3a3d42,0.35),0,-0.05,-0.03);      // the slide, a shade lighter, so the gun reads
  box(gun,0.034,0.05,0.11,mk(0x2a2420,0.8),0,0.035,-0.035); const tg=new THREE.Mesh(new THREE.TorusGeometry(0.022,0.004,6,12,R),dark); tg.position.set(0,0.0,0.025); tg.rotation.y=R/2; gun.add(tg);      // the grip and the trigger guard
  gun.scale.setScalar(1.25); const muzzle=new THREE.Object3D(); muzzle.position.set(0,-0.15,0); gun.add(muzzle);
  /* the micro SMG: a squat body, the magazine down out of the grip, a stub of barrel, the folded stock behind */
  const uzi=new THREE.Group(); uzi.position.set(0,-0.3,0.03); P.hand.add(uzi);
  box(uzi,0.05,0.2,0.066,dark,0,-0.06,-0.01); box(uzi,0.036,0.21,0.02,mk(0x3a3d42,0.35),0,-0.06,-0.045); box(uzi,0.03,0.14,0.024,mk(0x202224,0.5),0,0.09,-0.04);      // the body, its top, the magazine
  const bar=new THREE.Mesh(new THREE.CylinderGeometry(0.009,0.009,0.08,8),dark); bar.position.set(0,-0.19,-0.01); uzi.add(bar); box(uzi,0.04,0.045,0.11,mk(0x2a2420,0.8),0,0.03,-0.03); box(uzi,0.012,0.012,0.16,dark,0,-0.02,0.09);
  uzi.scale.setScalar(1.2); const muzzle2=new THREE.Object3D(); muzzle2.position.set(0,-0.23,-0.01); uzi.add(muzzle2);
  bat.visible=knife.visible=gun.visible=uzi.visible=false; P.dirty=true;
  held={p:P,parts:{bat:bat,knife:knife,pistol:gun,uzi:uzi},muzzle:{pistol:muzzle,uzi:muzzle2}}; return held;}
function show(){const k=kit(); if(!k) return; for(const n in k.parts) k.parts[n].visible=W.cur===n;}
function equip(kind,quiet){if(!W.has[kind]||kind===W.cur) return; W.cur=kind; W.aim=false; W.firing=false; W.drawT=A.t; show(); hud(true); if(!quiet&&A.gtaSound){if(K().gun&&A.gtaSound.cock) A.gtaSound.cock(); else A.gtaSound.blip();}}      // drawn: it grows into the hand (below), with the sound of it
function cycle(d){let i=ORDER.indexOf(W.cur); for(let n=0;n<ORDER.length;n++){i=(i+(d||1)+ORDER.length)%ORDER.length; if(W.has[ORDER[i]]) break;} equip(ORDER[i]);}

/* =====================================================================
   Pickups: turning, glowing, back again a while after you take them
   ===================================================================== */
const ring=new THREE.MeshBasicMaterial({color:0x7fd8ff,transparent:true,opacity:0.5,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
const PU=[];
function model(kind){const g=new THREE.Group(), m=function(c){return new THREE.MeshLambertMaterial({color:c,emissive:c,emissiveIntensity:0.25});}, bx=function(w,h,d,c,x,y,z){const q=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m(c)); q.position.set(x||0,y||0,z||0); g.add(q); return q;};
  if(kind==='bat'){const b=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.022,0.86,12),m(0xb9844a)); b.rotation.z=1.1; g.add(b);}
  else if(kind==='knife'){bx(0.3,0.05,0.008,0xd8dbe0,0.08,0,0); bx(0.14,0.06,0.03,0x3a2e26,-0.14,0,0); bx(0.02,0.08,0.035,0x202224,-0.06,0,0);}
  else if(kind==='pistol'){bx(0.28,0.07,0.05,0x2a2c30); const h=bx(0.07,0.16,0.05,0x2a2c30,-0.08,-0.09,0); h.rotation.z=-0.2;}
  else if(kind==='uzi'){bx(0.34,0.1,0.07,0x2a2c30); bx(0.05,0.2,0.04,0x202224,-0.02,-0.12,0); bx(0.12,0.03,0.03,0x2a2c30,0.22,0.01,0); bx(0.2,0.02,0.02,0x2a2c30,-0.25,0.02,0);}
  else if(kind==='armour'){bx(0.36,0.42,0.12,0x2b4a7a); bx(0.3,0.08,0.13,0xd8d8d8,0,0.06,0);}
  else if(kind==='cash'){bx(0.3,0.05,0.16,0x4a9a5a); bx(0.08,0.056,0.17,0xe8e4d0);}      // a fold of notes
  else{bx(0.34,0.26,0.12,0xf2f2ee); bx(0.2,0.06,0.13,0xd23b3b); bx(0.06,0.2,0.13,0xd23b3b);}
  const r=new THREE.Mesh(new THREE.RingGeometry(0.42,0.5,32).rotateX(-R/2),ring); r.position.y=-0.85; g.add(r);
  return g;}
function place(kind,x,z,once){const g=model(kind), y=(SM.ground?SM.ground(x,z):0)+0.9; g.position.set(x,y,z); g.userData.nc=true; g.traverse(function(o){o.layers.set(OUT());}); scene.add(g);
  const p={kind:kind,x:x,z:z,y:y,g:g,back:0,once:!!once,until:once?A.t+60:Infinity}; PU.push(p); return p;}
function spots(){
  const d=A.game.dump&&A.game.dump(); if(d) place('bat',d.stand.x+0.9,d.stand.z+0.6);      // by the green bins in the alley
  if(!T||!T.mapData) return;
  const parks=T.mapData.parks.filter(function(q){return q.kind!=='playground'&&q.p.length>3;}).map(function(q){let cx=0,cz=0; q.p.forEach(function(v){cx+=v[0]; cz+=v[1];}); return {x:cx/q.p.length,z:cz/q.p.length,name:q.name};})
    .filter(function(q){return T.free(q.x,q.z,0.4);}).sort(function(a,b){return hyp(a.x-A.LB.XF,a.z-A.LB.ZC)-hyp(b.x-A.LB.XF,b.z-A.LB.ZC);});
  if(parks[0]) place('pistol',parks[0].x,parks[0].z); if(parks[2]) place('armour',parks[2].x,parks[2].z); if(parks[4]) place('pistol',parks[4].x,parks[4].z); if(parks[3]) place('uzi',parks[3].x,parks[3].z);
  const cl=(A.gtaPOI||[]).find(function(q){return q.k==='clinic';}); if(cl){const q0=T.nearest(cl.x,cl.z), q=q0&&T.nearest(q0[0]+5,q0[1]+3); if(q) place('health',q[0],q[1]);}      /* a few steps from where you come to after being wasted (gta-hud.js) */
  const sh=(A.gtaPOI||[]).filter(function(q){return q.k==='shop';})[1]; let kq=null; if(sh){const q0=T.nearest(sh.x,sh.z); kq=q0&&T.nearest(q0[0]+3,q0[1]-4);} if(!kq&&parks[1]) kq=[parks[1].x,parks[1].z]; if(kq) place('knife',kq[0],kq[1]);}      // behind the shops, where someone dropped it; or in a garden
function take(p){const S=SM.toast, k=KINDS[p.kind]; p.back=A.t+(p.once?1e9:120); p.g.visible=false;
  if(k&&k.melee){const had=W.has[p.kind]; W.has[p.kind]=true; if(!had||W.cur==='fists') equip(p.kind,true); S&&S(k.hint+(TOUCH?' The weapon button opens the wheel.':' Tab changes weapon, held it opens the wheel.'));}
  else if(k&&k.gun){const had=W.has[p.kind]; W.has[p.kind]=true; W.ammo[p.kind]+=k.box; if(!W.clip[p.kind]){const n=Math.min(k.clip,W.ammo[p.kind]); W.clip[p.kind]=n; W.ammo[p.kind]-=n;} if(!had||!K().gun) equip(p.kind,true);
    S&&S(k.hint+(TOUCH?' The punch button shoots.':' Hold the right mouse button to aim, click to fire; R fires from the hip.'));}
  else if(p.kind==='armour'){A.gtaArmor=100; S&&S('Body armour.');}
  else if(p.kind==='cash'){if(A.floors&&A.floors.G){A.floors.G.loot+=p.amount||20; if(A.floors.drawHud) A.floors.drawHud();}}
  else{if(A.game.G){A.game.G.hp=100;} S&&S('First aid. Health restored.');}
  if(p.kind==='cash') return;      /* the display rings for the money itself (gta-hud.js) */
  show(); hud(true); if(A.gtaSound) A.gtaSound.cash();}
function pickups(dt){const p=SM.player; if(!p) return; const me=(A.drive&&A.drive.on())||(A.gtaTaxi&&A.gtaTaxi.car())?null:p;      /* not from a car, nor from the taxi you ride in */
  PU.forEach(function(q){if(!q.g.visible){if(A.t>q.back){q.g.visible=true;} return;} q.g.rotation.y+=dt*1.8; q.g.position.y=q.y+Math.sin(A.t*2.4+q.x)*0.08;
    if(me&&!p.lvl&&hyp(q.x-p.x,q.z-p.z)<1.1) take(q);});
  for(let i=PU.length-1;i>=0;i--){const q=PU[i]; if(q.once&&(!q.g.visible||A.t>q.until)){scene.remove(q.g); q.g.traverse(function(o){if(o.geometry) o.geometry.dispose(); if(o.material&&o.material!==ring) o.material.dispose();}); PU.splice(i,1);}}}      /* taken, or left a minute: gone, and freed */
/* an officer down drops his pistol; someone knocked down in the street drops a little money, as in GTA (once each) */
function drops(){if(A.gtaCops) A.gtaCops.foot.forEach(function(o){const s=o.a._g; if(s&&s.down&&!o.dropped){o.dropped=true; o.a.gun.visible=false; const q=place('pistol',o.a.x+0.6,o.a.z+0.3,true); q.ammoOnly=true;}});
  people().forEach(function(t){const a=t.a; if(!a||a.cop||a._cashed||t.sub==='cop') return; const s=A.game.state(t); if(!s||!s.down) return; a._cashed=true; if(Math.random()<0.75){const q=place('cash',a.x+0.5,a.z+0.4,true); q.amount=10+5*Math.floor(Math.random()*7);}});}

/* =====================================================================
   Firing
   ===================================================================== */
const flashM=new THREE.SpriteMaterial({map:A.canvasTex(64,64,function(g){const gr=g.createRadialGradient(32,32,0,32,32,32); gr.addColorStop(0,'rgba(255,250,220,1)'); gr.addColorStop(0.3,'rgba(255,200,90,0.9)'); gr.addColorStop(1,'rgba(255,140,40,0)'); g.fillStyle=gr; g.fillRect(0,0,64,64);}),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
const tracerM=new THREE.LineBasicMaterial({color:0xffe9a8,transparent:true,opacity:0.85,depthWrite:false,blending:THREE.AdditiveBlending});
const fx=[]; const v1=new THREE.Vector3(), v2=new THREE.Vector3(), dirV=new THREE.Vector3();
function people(){return A.game.all().filter(function(t){return t.kind==='person'&&(t.lvl||0)===(SM.player.lvl||0)&&t.sub!=='partner';});}
function chest(t,out){if(t.a) return out.set(t.a.x,t.a.p.g.position.y+1.15,t.a.z); t.root.getWorldPosition(out); out.y+=1.1; return out;}
function clear(x0,z0,x1,z1){if(!T||SM.player.lvl) return true; const d=hyp(x1-x0,z1-z0), n=Math.ceil(d/1.5); for(let i=1;i<n;i++){const t=i/n; if(T.inBuilding(x0+(x1-x0)*t,z0+(z1-z0)*t,0)) return false;} return true;}
function pick(aimed){const p=SM.player, list=people(); let best=null, bd=1e9;
  if(aimed){cam.getWorldDirection(dirV); const o=cam.position, h2=dirV.x*dirV.x+dirV.z*dirV.z||1e-6;      // the body as a column from the knees to the top of the head: where the line of sight passes closest to it
    list.forEach(function(t){chest(t,v1); const base=v1.y-1.15, dx=v1.x-o.x, dz=v1.z-o.z, s=(dx*dirV.x+dz*dirV.z)/h2; if(s<1||s>45) return;
      const hx=dx-dirV.x*s, hz=dz-dirV.z*s, y=o.y+dirV.y*s, vy=y<base+0.35?base+0.35-y:y>base+1.8?y-(base+1.8):0, off=Math.hypot(hx,hz,vy);
      if(off>0.22+s*0.006) return; if(!clear(p.x,p.z,v1.x,v1.z)) return; if(s<bd){bd=s; best=t;}});}
  else{const y=A.gtaCam&&A.gtaCam()&&A.gta&&A.gta.cam?A.gta.cam.yaw:p.h, f=[Math.sin(y),Math.cos(y)]; list.forEach(function(t){chest(t,v1); const dx=v1.x-p.x, dz=v1.z-p.z, d=hyp(dx,dz); if(d>22||d<0.5) return; const c=(dx*f[0]+dz*f[1])/d; if(c<0.82) return; if(!clear(p.x,p.z,v1.x,v1.z)) return; const s=d*(1.6-c); if(s<bd){bd=s; best=t;}});}
  return best;}
function fire(){const p=SM.player, k=kit(), g=K(); if(!k||!g.gun||A.t<W.next||W.reload>A.t||p.driving||p.riding||p.seat||p.script||A.paused||wheelOn||(A.game.G&&A.game.G.down)||(A.floors&&A.floors.G.busted)) return;
  const n=W.cur;
  if(W.clip[n]<=0){if(W.ammo[n]>0){W.reload=A.t+1.3; W.next=W.reload; SM.toast&&SM.toast('Reloading…'); SM.later(1.3,function(){const c=Math.min(g.clip,W.ammo[n]); W.clip[n]=c; W.ammo[n]-=c; hud(true);});} else{SM.toast&&SM.toast('Out of ammunition.'); W.has[n]=false; cycle(1);} return;}
  W.next=A.t+g.rate; W.clip[n]--; hud(true); if(A.gtaStats) A.gtaStats.shots=(A.gtaStats.shots||0)+1;
  let t=pick(W.aim); if(t&&g.spread){chest(t,v1); const d=hyp(v1.x-p.x,v1.z-p.z); if(Math.random()<Math.min(0.45,0.08+d*0.014)) t=null;}      // the SMG sprays: the farther, the more goes wide
  if(t&&!W.aim){chest(t,v1); p.h=p.hT=Math.atan2(v1.x-p.x,v1.z-p.z);}
  p.p.act='aim'; W.hold=A.t+0.7;      // the arm stays out a moment after a shot from the hip
  /* the shot: a flash at the muzzle, a streak to where it went */
  k.muzzle[n].getWorldPosition(v2); const fl=new THREE.Sprite(flashM); fl.scale.set(g.auto?0.36:0.45,g.auto?0.36:0.45,1); fl.position.copy(v2); fl.layers.set(OUT()); scene.add(fl); fx.push({o:fl,until:A.t+0.05});
  const end=new THREE.Vector3(); if(t) chest(t,end); else{cam.getWorldDirection(dirV); end.copy(W.aim?cam.position:v2).addScaledVector(W.aim?dirV:dirV.set(Math.sin(p.h),0,Math.cos(p.h)),40); if(g.spread){end.x+=(Math.random()-0.5)*4; end.y+=(Math.random()-0.5)*2; end.z+=(Math.random()-0.5)*4;}}
  const ge=new THREE.BufferGeometry().setFromPoints([v2.clone(),end]), ln=new THREE.Line(ge,tracerM); ln.layers.set(OUT()); scene.add(ln); fx.push({o:ln,until:A.t+0.06,geo:ge});
  if(A.gtaSound&&A.gtaSound.shot) A.gtaSound.shot(p.x,p.z,true,g.auto); if(A.gtaShake) A.gtaShake(g.auto?0.025:0.04);
  if(A.gtaPanic) A.gtaPanic(p.x,p.z,40,2);
  if(t) hitBy(t,'bullet',g.dmg);
  crime(t,t&&t.sub==='cop'?3:t?2:1);}      /* as GTA V counts it: a shot one star, a hit two, a shot at the police three (and one more each time they see you again) */
/* a hit with a bullet or the bat: down for a good while */
function hitBy(t,how,dmg){const s=A.game.state(t); if(s.down) return; s.hp-=how==='bullet'?(dmg||75):0; t.p.act='hurt';
  if(A.game.say) A.game.say(t,rnd(['Aaargh!','I am hit!','Ahh!']));
  if(s.hp<=0||how==='bullet') A.game.knock(t,t.sub==='cop'?14:10);}
function crime(t,n){const G=A.floors&&A.floors.G; if(!G||!A.floors.raise) return; const p=SM.player;
  const near=people().some(function(o){return o!==t&&hyp((o.a?o.a.x:p.x)-p.x,(o.a?o.a.z:p.z)-p.z)<45;})||(A.gtaCops&&A.gtaCops.foot.length);
  if(near||t) A.floors.raise(n);}
/* armour takes most of a hit */
const hurt0=A.game.hurt;
if(hurt0) A.game.hurt=function(n){if(A.gtaArmor>0){const took=Math.min(A.gtaArmor,n*0.7); A.gtaArmor=Math.max(0,A.gtaArmor-took*1.2); n-=took;} hurt0(n);};
/* your attack: R, a click with the mouse taken, the punch button. With a gun, a shot; otherwise a blow (game.js) */
A.gtaAttack=function(){if(K().gun) fire(); else if(A.game.punchNearest) A.game.punchNearest();};
A.gtaFireHold=function(on){W.firing=!!on;};      // the SMG: as long as the button is held (the pad's, the mouse's, R)

/* ---------- aiming with the right mouse button; the left one fires, and keeps firing with the SMG ---------- */
cv.addEventListener('mousedown',function(e){if(!A.simsOn||!SM.player||A.paused||wheelOn) return; if(e.button===2&&K().gun&&A.gtaCam&&A.gtaCam()){W.aim=true; e.preventDefault();} else if(e.button===0&&W.aim){fire(); W.firing=true; e.preventDefault(); e.stopImmediatePropagation();}},true);
window.addEventListener('mouseup',function(e){if(e.button===2) W.aim=false; if(e.button===0) W.firing=false;});
window.addEventListener('blur',function(){W.aim=false; W.firing=false; tabHeld=false; wheel(false);});
window.addEventListener('keydown',function(e){if(!A.simsOn||A.paused||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)||(e.target.closest&&e.target.closest('#gtaMenu,#modal'))||(e.target.closest&&e.target.closest('#panel')&&!document.body.classList.contains('nomenu'))) return;      /* Tab moves through the side panel only while it is shown */
  if(e.key==='Tab'){e.preventDefault(); if(!e.repeat){tabAt=A.t; tabHeld=true; tabShift=e.shiftKey;}}
  if(e.key.toLowerCase()==='r'&&!e.repeat&&K().auto&&!SM.player.driving) W.firing=true;});
window.addEventListener('keyup',function(e){if(e.key==='Tab'){if(!tabHeld) return; tabHeld=false; if(wheelOn) wheel(false,true); else if(A.simsOn&&!A.paused) cycle(tabShift?-1:1);} if(e.key.toLowerCase()==='r') W.firing=false;});
A.gtaAimSet=function(on){W.aim=!!on&&!!K().gun;}; A.gtaFire=function(){if(A.gtaAiming()&&!A.paused) fire();};      /* for a gamepad (gta.js): the left trigger aims, the right one fires */
A.gtaAiming=function(){return W.aim&&!!K().gun&&A.simsOn&&!!SM.player&&!SM.player.driving&&!SM.player.riding&&!!(A.gtaCam&&A.gtaCam());};

/* =====================================================================
   The weapon wheel, as GTA's: Tab held (or the pad's weapon button), time slows, what you carry round a ring, the mouse or the
   scroll wheel or 1–5 picks, let go to draw it
   ===================================================================== */
let tabAt=0, tabHeld=false, tabShift=false, wheelOn=false, wheelPick='', wheelV={x:0,y:0}, scaleWas=1;
const wc=document.createElement('canvas'); wc.id='gWheel'; wc.width=wc.height=360; wc.style.cssText='position:absolute;left:50%;top:50%;width:300px;height:300px;margin:-150px 0 0 -150px;z-index:6;display:none;touch-action:none'; A.stage.appendChild(wc);
function icon(g,kind,cx,cy,s,col){g.save(); g.translate(cx,cy); g.strokeStyle=col; g.fillStyle=col; g.lineWidth=s*0.09; g.lineCap='round'; g.lineJoin='round';      /* small pictograms, white on the ring and in the display */
  if(kind==='fists'){g.beginPath(); g.roundRect(-s*0.32,-s*0.22,s*0.64,s*0.48,s*0.14); g.fill(); g.beginPath(); g.roundRect(-s*0.4,-s*0.02,s*0.2,s*0.3,s*0.08); g.fill(); g.strokeStyle='rgba(0,0,0,.45)'; g.lineWidth=s*0.05; for(let i=0;i<3;i++){g.beginPath(); g.moveTo(-s*0.13+i*s*0.17,-s*0.2); g.lineTo(-s*0.13+i*s*0.17,s*0.02); g.stroke();}}
  else if(kind==='knife'){g.rotate(-0.7); g.beginPath(); g.moveTo(-s*0.05,-s*0.46); g.quadraticCurveTo(s*0.22,-s*0.25,s*0.08,s*0.05); g.lineTo(-s*0.08,s*0.05); g.closePath(); g.fill(); g.fillRect(-s*0.08,s*0.05,s*0.16,s*0.1); g.beginPath(); g.roundRect(-s*0.06,s*0.15,s*0.12,s*0.3,s*0.05); g.fill();}
  else if(kind==='bat'){g.rotate(0.6); g.beginPath(); g.moveTo(-s*0.05,s*0.45); g.lineTo(s*0.05,s*0.45); g.lineTo(s*0.1,-s*0.3); g.quadraticCurveTo(s*0.1,-s*0.48,0,-s*0.48); g.quadraticCurveTo(-s*0.1,-s*0.48,-s*0.1,-s*0.3); g.closePath(); g.fill();}
  else if(kind==='pistol'){g.beginPath(); g.roundRect(-s*0.42,-s*0.2,s*0.84,s*0.2,s*0.04); g.fill(); g.beginPath(); g.moveTo(-s*0.1,0); g.lineTo(-s*0.22,s*0.38); g.lineTo(s*0.02,s*0.38); g.lineTo(s*0.1,0); g.closePath(); g.fill(); g.beginPath(); g.arc(0.12*s,0.1*s,s*0.1,0.6,R+1); g.stroke();}
  else if(kind==='uzi'){g.beginPath(); g.roundRect(-s*0.42,-s*0.2,s*0.74,s*0.22,s*0.03); g.fill(); g.fillRect(s*0.3,-s*0.12,s*0.16,s*0.06); g.beginPath(); g.moveTo(-s*0.14,s*0.02); g.lineTo(-s*0.14,s*0.45); g.lineTo(s*0.02,s*0.45); g.lineTo(s*0.06,s*0.02); g.closePath(); g.fill(); g.beginPath(); g.moveTo(-s*0.42,-s*0.1); g.lineTo(-s*0.5,-s*0.1); g.lineTo(-s*0.5,s*0.18); g.stroke();}
  g.restore();}
function drawWheel(){const g=wc.getContext('2d'), S=wc.width, c=S/2; g.clearRect(0,0,S,S);
  g.fillStyle='rgba(8,10,12,0.72)'; g.beginPath(); g.arc(c,c,c-2,0,7); g.fill(); g.fillStyle='rgba(0,0,0,0.5)'; g.beginPath(); g.arc(c,c,S*0.2,0,7); g.fill();
  const n=ORDER.length, a0=-R/2-R/n;
  ORDER.forEach(function(k,i){const a=a0+i*2*R/n, b=a+2*R/n, has=W.has[k], on=k===wheelPick;
    g.beginPath(); g.arc(c,c,c-6,a,b); g.arc(c,c,S*0.22,b,a,true); g.closePath(); g.fillStyle=on?'rgba(255,255,255,0.92)':has?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.03)'; g.fill(); g.strokeStyle='rgba(0,0,0,0.6)'; g.lineWidth=2; g.stroke();
    const m=(a+b)/2, r=S*0.36; icon(g,k,c+Math.cos(m)*r,c+Math.sin(m)*r,S*0.17,on?'#101214':has?'#fff':'rgba(255,255,255,0.3)');
    if(KINDS[k].gun&&has){g.fillStyle=on?'#101214':'rgba(255,255,255,0.8)'; g.font='700 '+Math.round(S*0.05)+'px "Barlow Condensed",sans-serif'; g.textAlign='center'; g.fillText(W.clip[k]+' / '+W.ammo[k],c+Math.cos(m)*r,c+Math.sin(m)*r+S*0.13);}});
  g.fillStyle='#fff'; g.font='italic 700 '+Math.round(S*0.075)+'px "Barlow Condensed",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(KINDS[wheelPick||W.cur].name,c,c-S*0.01);
  g.font='600 '+Math.round(S*0.045)+'px "Barlow Condensed",sans-serif'; g.fillStyle='rgba(255,255,255,0.55)'; g.fillText(TOUCH?'tap to take':'let go to take',c,c+S*0.06);}
function wheelAt(x,y){const n=ORDER.length; if(hyp(x,y)<12) return; let a=Math.atan2(y,x)+R/2+R/n; while(a<0) a+=2*R; const i=Math.floor(a/(2*R/n))%n; wheelPick=ORDER[i];}
function wheel(on,take){if(on===wheelOn) return; const p=SM.player; if(on&&(!p||p.driving||p.riding||A.paused||(A.game.G&&A.game.G.down)||(A.floors&&A.floors.G.busted))) return;
  wheelOn=on; wc.style.display=on?'block':'none'; document.body.classList.toggle('gtaWheel',on);
  if(on){wheelPick=W.cur; wheelV.x=wheelV.y=0; scaleWas=A.timeScale||1; A.timeScale=0.25; W.aim=false; W.firing=false; drawWheel();}      // time slows while you choose, as GTA's does
  else{if(A.timeScale===0.25) A.timeScale=scaleWas; if(take&&wheelPick&&W.has[wheelPick]) equip(wheelPick);}}      /* only the slow-down it set: a busted or wasted card may have taken over meanwhile */
window.addEventListener('mousemove',function(e){if(!wheelOn) return; wheelV.x+=e.movementX||0; wheelV.y+=e.movementY||0; const l=hyp(wheelV.x,wheelV.y); if(l>80){wheelV.x*=80/l; wheelV.y*=80/l;} const was=wheelPick; wheelAt(wheelV.x,wheelV.y); if(wheelPick!==was) drawWheel();});
window.addEventListener('wheel',function(e){if(!wheelOn) return; e.preventDefault(); let i=ORDER.indexOf(wheelPick); i=(i+(e.deltaY>0?1:-1)+ORDER.length)%ORDER.length; wheelPick=ORDER[i]; drawWheel();},{passive:false});
window.addEventListener('keydown',function(e){if(!wheelOn) return; const d=parseInt(e.key,10); if(d>=1&&d<=ORDER.length){wheelPick=ORDER[d-1]; drawWheel(); e.preventDefault(); e.stopImmediatePropagation();} else if(e.key==='Escape'){tabHeld=false; wheel(false); e.preventDefault(); e.stopImmediatePropagation();}},true);
wc.addEventListener('pointerdown',function(e){e.preventDefault(); if(TOUCH||e.pointerType==='touch'){const r=wc.getBoundingClientRect(); wheelAt(e.clientX-(r.left+r.width/2),e.clientY-(r.top+r.height/2)); drawWheel();} wheel(false,true);});      // on a phone: tap the one you want; with a mouse, the one lit
A.stage.addEventListener('pointerdown',function(e){if(wheelOn&&TOUCH&&e.target!==wc) wheel(false);},true);

/* ---------- on screen: the weapon and its rounds, the crosshair ---------- */
const box=document.createElement('div'); box.id='gWeap'; box.style.cssText='pointer-events:none;display:flex;justify-content:flex-end;align-items:center;gap:8px;color:#fff;opacity:0;transition:opacity .4s;font:700 15px/1.2 "Barlow Condensed",sans-serif;text-shadow:0 1px 4px rgba(0,0,0,.85);margin-top:4px';      // under the money, in the display's top-right stack
const ic=document.createElement('canvas'); ic.width=96; ic.height=56; ic.style.cssText='width:48px;height:28px;filter:drop-shadow(0 1px 3px rgba(0,0,0,.8))'; const txt=document.createElement('div'); txt.style.textAlign='right'; box.appendChild(txt); box.appendChild(ic);
const xh=document.createElement('div'); xh.id='gCross'; xh.style.cssText='position:absolute;left:50%;top:50%;width:6px;height:6px;margin:-3px 0 0 -3px;border-radius:50%;background:#fff;box-shadow:0 0 0 1.5px rgba(0,0,0,.7);z-index:4;pointer-events:none;display:none';
(document.getElementById('gTR')||A.stage).appendChild(box); A.stage.appendChild(xh);
let hudT=0, hudKind='';
function hud(on){const k=K(); txt.innerHTML='<span style="font:italic 700 20px/1 Barlow Condensed,sans-serif">'+k.name+'</span>'+(k.gun?'<br><span>'+W.clip[W.cur]+' <span style="opacity:.6">/ '+W.ammo[W.cur]+'</span></span>':'');
  if(hudKind!==W.cur){hudKind=W.cur; const g=ic.getContext('2d'); g.clearRect(0,0,ic.width,ic.height); icon(g,W.cur,48,28,46,'#fff');} if(on) hudT=A.t+3;}

/* ---------- every frame ---------- */
let placed=false, lastPj=null;
A.frameFns.push(function(dt){
  for(let i=fx.length-1;i>=0;i--){const f=fx[i]; if(A.t>f.until){scene.remove(f.o); if(f.geo) f.geo.dispose(); fx.splice(i,1);}}
  if(!A.simsOn||!SM.player){W.aim=false; W.firing=false; xh.style.display='none'; box.style.opacity=0; PU.forEach(function(q){q.g.visible=false;}); if(wheelOn) wheel(false); return;}
  if(!placed){placed=true; spots();}
  const p=SM.player; if(lastPj!==p.p){lastPj=p.p; held=null; show(); hud();}      // a new body (Angela or Yoav): the weapon goes into its hand, and the display says what it is
  if(tabHeld&&!wheelOn&&A.t-tabAt>0.22) wheel(true);
  pickups(dt); drops();
  const aiming=A.gtaAiming(); xh.style.display=aiming?'block':'none';
  if(aiming){p.p.act='aim'; const y=A.gta&&A.gta.cam?A.gta.cam.yaw:p.h; p.h=p.hT=y;}      // facing where you aim
  else if(p.p.act==='aim'&&A.t>(W.hold||0)) p.p.act=null;
  if(W.firing&&K().auto&&!wheelOn) fire();      // the SMG, as long as the button is down
  const k=held; if(k){const d=A.t-W.drawT, s=d<0.25?0.3+0.7*Math.sin(d/0.25*R/2):1; const part=k.parts[W.cur]; if(part){const base=W.cur==='pistol'?1.25:W.cur==='uzi'?1.2:1; part.scale.setScalar(base*s);}}      // drawn: it grows into the hand over a quarter second
  box.style.opacity=(A.t<hudT||aiming||wheelOn)?1:0;
});
A.gtaArms={W:W,KINDS:KINDS,ORDER:ORDER,cycle:cycle,equip:equip,fire:fire,pick:pick,pickups:PU,place:place,wheel:function(on){wheel(on!==false);},get wheelOn(){return wheelOn;}};
})();
