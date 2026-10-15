/* Haroe 10 — weapons and pickups, as in GTA. You start with your fists. A baseball bat lies by the green bins in the alley, a pistol in
   one of the gardens, a body-armour vest in another and first aid by the clinic; they turn and glow where they lie, walk over one to take
   it, and they come back a while later. An officer you knock out drops his pistol. Tab changes weapon. With the pistol, hold the right
   mouse button to aim over your shoulder at the crosshair and click to fire, or fire from the hip with R and it finds whoever is in front
   of you; on a phone the punch button shoots. A bat or a bullet knocks people out; the street panics at shots, and the police take
   gunfire seriously: three stars at once, four if you shoot at them. Armour takes most of a hit for you. */
(function(){
'use strict';
const A=window.APP, SM=A.sims, T=A.town, R=Math.PI;
if(!SM||!A.game) return;
const scene=A.scene, cam=A.camera, cv=A.renderer.domElement, OUT=function(){return A.LAYER_OUT||5;};
const TOUCH=('ontouchstart' in window)||navigator.maxTouchPoints>0;
function hyp(a,b){return Math.hypot(a,b);}
function clamp(v,a,b){return v<a?a:v>b?b:v;}
function rnd(a){return a[Math.floor(Math.random()*a.length)];}

/* ---------- what you carry ---------- */
const W={has:{fists:true,bat:false,pistol:false},cur:'fists',ammo:0,clip:0,reload:0,aim:false,next:0};
const NAME={fists:'Fists',bat:'Baseball bat',pistol:'Pistol'}, ORDER=['fists','bat','pistol'];
A.gtaArmor=0;
A.gtaWeapon=W;
A.gtaMelee={get act(){return W.cur==='bat'?'swing':'punch';},get k(){return W.cur==='bat'?2.4:1;}};      // game.js asks: how a blow looks, and how hard it lands
/* the bat and the pistol in your right hand */
let held=null;
function kit(){const p=SM.player; if(!p) return null; if(held&&held.p===p.p) return held;
  const P=p.p, mk=function(c,r){const m=new THREE.MeshStandardMaterial({color:c,roughness:r||0.6}); P.mats.push({m:m,b:new THREE.Color(c)}); return m;};
  const bat=new THREE.Group(); bat.position.set(0,-0.3,0.02); P.hand.add(bat);
  const wood=mk(0xb9844a,0.5), grip=mk(0x1d1f22,0.8); const b1=new THREE.Mesh(new THREE.CylinderGeometry(0.036,0.016,0.72,12),wood); b1.position.y=-0.38; bat.add(b1); const b2=new THREE.Mesh(new THREE.CylinderGeometry(0.018,0.018,0.16,10),grip); b2.position.y=0.04; bat.add(b2);
  const gun=new THREE.Group(); gun.position.set(0,-0.31,0.03); P.hand.add(gun); const gm=mk(0x161718,0.4);
  const gb=new THREE.Mesh(new THREE.BoxGeometry(0.032,0.17,0.04),gm); gb.position.y=-0.04; gun.add(gb); const gg=new THREE.Mesh(new THREE.BoxGeometry(0.03,0.04,0.09),gm); gg.position.set(0,0.03,-0.03); gun.add(gg);
  const muzzle=new THREE.Object3D(); muzzle.position.set(0,-0.14,0); gun.add(muzzle);
  bat.visible=gun.visible=false; P.dirty=true; held={p:P,bat:bat,gun:gun,muzzle:muzzle}; return held;}
function show(){const k=kit(); if(!k) return; k.bat.visible=W.cur==='bat'; k.gun.visible=W.cur==='pistol';}
function cycle(d){let i=ORDER.indexOf(W.cur); for(let n=0;n<3;n++){i=(i+(d||1)+3)%3; if(W.has[ORDER[i]]) break;} W.cur=ORDER[i]; show(); hud(true); if(A.gtaSound) A.gtaSound.blip();}

/* =====================================================================
   Pickups: turning, glowing, back again a while after you take them
   ===================================================================== */
const ring=new THREE.MeshBasicMaterial({color:0x7fd8ff,transparent:true,opacity:0.5,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
const PU=[];
function model(kind){const g=new THREE.Group(), m=function(c){return new THREE.MeshLambertMaterial({color:c,emissive:c,emissiveIntensity:0.25});};
  if(kind==='bat'){const b=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.022,0.86,12),m(0xb9844a)); b.rotation.z=1.1; g.add(b);}
  else if(kind==='pistol'){const b=new THREE.Mesh(new THREE.BoxGeometry(0.28,0.07,0.05),m(0x2a2c30)); g.add(b); const h=new THREE.Mesh(new THREE.BoxGeometry(0.07,0.16,0.05),m(0x2a2c30)); h.position.set(-0.08,-0.09,0); h.rotation.z=-0.2; g.add(h);}
  else if(kind==='armour'){const b=new THREE.Mesh(new THREE.BoxGeometry(0.36,0.42,0.12),m(0x2b4a7a)); g.add(b); const s=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.08,0.13),m(0xd8d8d8)); s.position.y=0.06; g.add(s);}
  else{const b=new THREE.Mesh(new THREE.BoxGeometry(0.34,0.26,0.12),m(0xf2f2ee)); g.add(b); const c1=new THREE.Mesh(new THREE.BoxGeometry(0.2,0.06,0.13),m(0xd23b3b)), c2=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.2,0.13),m(0xd23b3b)); g.add(c1,c2);}
  const r=new THREE.Mesh(new THREE.RingGeometry(0.42,0.5,32).rotateX(-R/2),ring); r.position.y=-0.85; g.add(r);
  return g;}
function place(kind,x,z,once){const g=model(kind), y=(SM.ground?SM.ground(x,z):0)+0.9; g.position.set(x,y,z); g.userData.nc=true; g.traverse(function(o){o.layers.set(OUT());}); scene.add(g);
  const p={kind:kind,x:x,z:z,y:y,g:g,back:0,once:!!once}; PU.push(p); return p;}
function spots(){
  const d=A.game.dump&&A.game.dump(); if(d) place('bat',d.stand.x+0.9,d.stand.z+0.6);      // by the green bins in the alley
  if(!T||!T.mapData) return;
  const parks=T.mapData.parks.filter(function(q){return q.kind!=='playground'&&q.p.length>3;}).map(function(q){let cx=0,cz=0; q.p.forEach(function(v){cx+=v[0]; cz+=v[1];}); return {x:cx/q.p.length,z:cz/q.p.length,name:q.name};})
    .filter(function(q){return T.free(q.x,q.z,0.4);}).sort(function(a,b){return hyp(a.x-A.LB.XF,a.z-A.LB.ZC)-hyp(b.x-A.LB.XF,b.z-A.LB.ZC);});
  if(parks[0]) place('pistol',parks[0].x,parks[0].z); if(parks[2]) place('armour',parks[2].x,parks[2].z); if(parks[4]) place('pistol',parks[4].x,parks[4].z);
  const cl=(A.gtaPOI||[]).find(function(q){return q.k==='clinic';}); if(cl){const q=T.nearest(cl.x,cl.z); if(q) place('health',q[0],q[1]);}}
function take(p){const S=SM.toast; p.back=A.t+(p.once?1e9:120); p.g.visible=false;
  if(p.kind==='bat'){const had=W.has.bat; W.has.bat=true; if(!had||W.cur==='fists') W.cur='bat'; S&&S('Baseball bat. Tab changes weapon.');}
  else if(p.kind==='pistol'){W.has.pistol=true; W.ammo+=24; if(!W.clip){W.clip=Math.min(12,W.ammo); W.ammo-=W.clip;} W.cur='pistol'; S&&S(TOUCH?'Pistol. The punch button shoots.':'Pistol. Hold the right mouse button to aim, click to fire. Tab changes weapon.');}
  else if(p.kind==='armour'){A.gtaArmor=100; S&&S('Body armour.');}
  else{if(A.game.G){A.game.G.hp=100;} S&&S('First aid. Health restored.');}
  show(); hud(true); if(A.gtaSound) A.gtaSound.cash();}
function pickups(dt){const p=SM.player; if(!p) return; const me=A.drive&&A.drive.on()?null:p;
  PU.forEach(function(q){if(!q.g.visible){if(A.t>q.back){q.g.visible=true;} return;} q.g.rotation.y+=dt*1.8; q.g.position.y=q.y+Math.sin(A.t*2.4+q.x)*0.08;
    if(me&&!p.lvl&&hyp(q.x-p.x,q.z-p.z)<1.1) take(q);});
  for(let i=PU.length-1;i>=0;i--) if(PU[i].once&&!PU[i].g.visible){scene.remove(PU[i].g); PU.splice(i,1);}}
/* an officer down drops his pistol */
function drops(){if(!A.gtaCops) return; A.gtaCops.foot.forEach(function(o){const s=o.a._g; if(s&&s.down&&!o.dropped){o.dropped=true; o.a.gun.visible=false; const q=place('pistol',o.a.x+0.6,o.a.z+0.3,true); q.ammoOnly=true;}});}

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
  else{const f=[Math.sin(p.h),Math.cos(p.h)]; list.forEach(function(t){chest(t,v1); const dx=v1.x-p.x, dz=v1.z-p.z, d=hyp(dx,dz); if(d>22||d<0.5) return; const c=(dx*f[0]+dz*f[1])/d; if(c<0.82) return; if(!clear(p.x,p.z,v1.x,v1.z)) return; const s=d*(1.6-c); if(s<bd){bd=s; best=t;}});}
  return best;}
function fire(){const p=SM.player, k=kit(); if(!k||W.cur!=='pistol'||A.t<W.next||W.reload>A.t||p.driving||p.seat||p.script) return;
  if(W.clip<=0){if(W.ammo>0){W.reload=A.t+1.3; W.next=W.reload; SM.toast&&SM.toast('Reloading…'); SM.later(1.3,function(){const n=Math.min(12,W.ammo); W.clip=n; W.ammo-=n; hud(true);});} else{SM.toast&&SM.toast('Out of ammunition.'); W.has.pistol=false; cycle(1);} return;}
  W.next=A.t+0.32; W.clip--; hud(true); if(A.gtaStats) A.gtaStats.shots=(A.gtaStats.shots||0)+1;
  const t=pick(W.aim); if(t&&!W.aim){chest(t,v1); p.h=p.hT=Math.atan2(v1.x-p.x,v1.z-p.z);}
  p.p.act='aim'; W.hold=A.t+0.7;      // the arm stays out a moment after a shot from the hip
  /* the shot: a flash at the muzzle, a streak to where it went */
  k.muzzle.getWorldPosition(v2); const fl=new THREE.Sprite(flashM); fl.scale.set(0.45,0.45,1); fl.position.copy(v2); fl.layers.set(OUT()); scene.add(fl); fx.push({o:fl,until:A.t+0.05});
  const end=new THREE.Vector3(); if(t) chest(t,end); else{cam.getWorldDirection(dirV); end.copy(W.aim?cam.position:v2).addScaledVector(W.aim?dirV:dirV.set(Math.sin(p.h),0,Math.cos(p.h)),40);}
  const g=new THREE.BufferGeometry().setFromPoints([v2.clone(),end]), ln=new THREE.Line(g,tracerM); ln.layers.set(OUT()); scene.add(ln); fx.push({o:ln,until:A.t+0.06,geo:g});
  if(A.gtaSound&&A.gtaSound.shot) A.gtaSound.shot(p.x,p.z,true); if(A.gtaShake) A.gtaShake(0.04);
  if(A.gtaPanic) A.gtaPanic(p.x,p.z,40,2);
  if(t) hitBy(t,'bullet');
  crime(t,3);}
/* a hit with a bullet or the bat: down for a good while */
function hitBy(t,how){const s=A.game.state(t); if(s.down) return; s.hp-=how==='bullet'?75:0; t.p.act='hurt';
  if(A.game.say) A.game.say(t,rnd(['Aaargh!','I am hit!','Ahh!']));
  if(s.hp<=0||how==='bullet') A.game.knock(t,t.sub==='cop'?14:10);}
function crime(t,n){const G=A.floors&&A.floors.G; if(!G||!A.floors.raise) return; const p=SM.player;
  const near=people().some(function(o){return o!==t&&hyp((o.a?o.a.x:p.x)-p.x,(o.a?o.a.z:p.z)-p.z)<45;})||(A.gtaCops&&A.gtaCops.foot.length);
  if(t&&t.sub==='cop') A.floors.raise(4); else if(near||t) A.floors.raise(n);}
/* armour takes most of a hit */
const hurt0=A.game.hurt;
if(hurt0) A.game.hurt=function(n){if(A.gtaArmor>0){const took=Math.min(A.gtaArmor,n*0.7); A.gtaArmor=Math.max(0,A.gtaArmor-took*1.2); n-=took;} hurt0(n);};
/* your attack: R, a click with the mouse taken, the punch button. With the pistol, a shot; otherwise a blow (game.js) */
A.gtaAttack=function(){if(W.cur==='pistol') fire(); else if(A.game.punchNearest) A.game.punchNearest();};

/* ---------- aiming with the right mouse button ---------- */
cv.addEventListener('mousedown',function(e){if(!A.simsOn||!SM.player) return; if(e.button===2&&W.cur==='pistol'){W.aim=true; e.preventDefault();} else if(e.button===0&&W.aim){fire(); e.preventDefault(); e.stopImmediatePropagation();}},true);
window.addEventListener('mouseup',function(e){if(e.button===2) W.aim=false;});
window.addEventListener('blur',function(){W.aim=false;});
window.addEventListener('keydown',function(e){if(!A.simsOn||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return; if(e.key==='Tab'){e.preventDefault(); if(!e.repeat) cycle(e.shiftKey?-1:1);}});
A.gtaAiming=function(){return W.aim&&W.cur==='pistol'&&A.simsOn&&!!SM.player&&!SM.player.driving;};

/* ---------- on screen: the weapon and its rounds, the crosshair ---------- */
const box=document.createElement('div'); box.id='gWeap'; box.style.cssText='pointer-events:none;text-align:right;color:#fff;opacity:0;transition:opacity .4s;font:700 15px/1.2 "Barlow Condensed",sans-serif;text-shadow:0 1px 4px rgba(0,0,0,.85);margin-top:4px';      // under the money, in the display's top-right stack
const xh=document.createElement('div'); xh.id='gCross'; xh.style.cssText='position:absolute;left:50%;top:50%;width:6px;height:6px;margin:-3px 0 0 -3px;border-radius:50%;background:#fff;box-shadow:0 0 0 1.5px rgba(0,0,0,.7);z-index:4;pointer-events:none;display:none';
(document.getElementById('gTR')||A.stage).appendChild(box); A.stage.appendChild(xh);
let hudT=0;
function hud(on){box.innerHTML='<span style="font:italic 700 20px/1 Barlow Condensed,sans-serif">'+NAME[W.cur]+'</span>'+(W.cur==='pistol'?'<br><span>'+W.clip+' <span style="opacity:.6">/ '+W.ammo+'</span></span>':''); if(on) hudT=A.t+3;}

/* ---------- every frame ---------- */
let placed=false, lastPj=null;
A.frameFns.push(function(dt){
  for(let i=fx.length-1;i>=0;i--){const f=fx[i]; if(A.t>f.until){scene.remove(f.o); if(f.geo) f.geo.dispose(); fx.splice(i,1);}}
  if(!A.simsOn||!SM.player){W.aim=false; xh.style.display='none'; box.style.opacity=0; PU.forEach(function(q){q.g.visible=false;}); return;}
  if(!placed){placed=true; spots();}
  const p=SM.player; if(lastPj!==p.p){lastPj=p.p; held=null; show();}      // a new body (Angela or Yoav): the weapon goes into its hand
  pickups(dt); drops();
  const aiming=A.gtaAiming(); xh.style.display=aiming?'block':'none';
  if(aiming){p.p.act='aim'; const y=A.gta&&A.gta.cam?A.gta.cam.yaw:p.h; p.h=p.hT=y;}      // facing where you aim
  else if(p.p.act==='aim'&&A.t>(W.hold||0)) p.p.act=null;
  box.style.opacity=(A.t<hudT||aiming)?1:0;
});
A.gtaArms={W:W,cycle:cycle,fire:fire,pick:pick,pickups:PU,place:place};
})();
