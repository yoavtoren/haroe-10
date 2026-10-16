/* Haroe 10 — GTA. In Sims mode the camera rides behind your shoulder and the mouse turns it: click the view to take the mouse (Esc gives it
   back), or drag. W A S D walk the way the camera looks, Shift runs, Space jumps, F gets in and out of a car, R (or the mouse button while
   the view has the mouse) throws a punch, E and the number keys pick from what is on offer, V moves the camera in, out and into your eyes,
   C looks behind you in a car, the wheel zooms. On a phone the left stick walks, the right stick or a drag turns the camera, and the buttons
   on the right run, jump, punch and get in and out of cars. Inside, the camera keeps to the rooms; out in the streets it stays clear of the
   blocks. */
(function(){
'use strict';
const A=window.APP, SM=A.sims, R=Math.PI;
if(!SM) return;
const cam=A.camera, ctl=A.controls, cv=A.renderer.domElement, $=function(id){return document.getElementById(id);};
const TOUCH=!!(window.matchMedia&&(matchMedia('(pointer: coarse)').matches||(navigator.maxTouchPoints>0&&!matchMedia('(any-pointer: fine)').matches)));      /* a phone or a tablet; a laptop with a touch screen and a mouse plays as a computer */
function clamp(v,a,b){return v<a?a:v>b?b:v;}
function wrap(d){while(d>R) d-=2*R; while(d<-R) d+=2*R; return d;}

/* ---------- the state of the camera ---------- */
const C={on:true,yaw:R,pitch:-0.2,zoom:1,dist:3.4,look:-10,lockT:0,back:false,was:false,pos:new THREE.Vector3(),fov:52,shake:0,snap:true};
const FOOT=[2.3,3.4,5.2], CAR=[5.4,7.0,9.4];      // near, middle, far
const pv=new THREE.Vector3(), want=new THREE.Vector3(), lookAt=new THREE.Vector3(), dir=new THREE.Vector3(), dir2=new THREE.Vector3(), tw=new THREE.Vector3();
function active(){return !!(A.simsOn&&SM.player&&SM.camMode==='follow'&&C.on);}
A.gtaCam=active;
function outdoors(){const p=SM.player; return !!(p&&!p.lvl&&(p.room==='street'||p.room==='out'||p.room==='town'));}      // the neighbours' flats and the landings are marked ext too, for their light; they are indoors
function car(){return A.drive&&A.drive.on&&A.drive.on()?A.drive.pos():(A.gtaTaxi?A.gtaTaxi.car():null);}      /* yours, or the taxi you ride in (gta-taxi.js) */

/* the camera may not go through a block in the streets, nor out of the room you are in (the living room and the kitchen are one), except
   through a door standing open */
const LINKS=[['lk','hall','entrance'],['lk','bed1','bed1'],['lk','bed2','bed2'],['lk','wc','wc'],['lk','bath','bath']];
let nodes={};
const HT={bus:3.2,van:2.15,suv:1.95,sedan:1.5,hatch:1.55,mini:1.5};      // how high each kind of car stands
function blocked(x,z,y,lvl,out,walls){
  if(out){const T=A.town; if(T&&T.inBuilding&&T.inBuilding(x,z,0.35)) return true;
    if(walls) return false;
    const OB=T&&T.obstacles, gy0=(SM.ground?SM.ground(x,z):0);
    if(OB&&OB.grid&&y-gy0<2.7){const g=OB.G, i0=Math.floor(x/g), k0=Math.floor(z/g); for(let i=i0-1;i<=i0+1;i++) for(let k=k0-1;k<=k0+1;k++){const l=OB.grid.get(i+','+k); if(l) for(let n=0;n<l.length;n++){const o=l[n]; if(o.off||o[2]<0.45||y-gy0>(o[2]>=1?2.7:1.85)) continue; if(Math.hypot(o[0]-x,o[1]-z)<o[2]+0.15) return true;}}}      /* low, it keeps out of the bottle cages, benches, shelters and crates (thin poles it ignores) */
    if(A.drive&&A.drive.live){const me=car(), gy=gy0; if(y-gy<3.5){const L=A.drive.live; for(let i=0;i<L.length;i++){const k=L[i]; if(k===me||Math.abs(k.x-x)>6||Math.abs(k.z-z)>6||y-gy>(HT[k.kind]||1.6)+0.25) continue; const cs=k.circles(); for(let j=0;j<cs.length;j++) if(Math.hypot(cs[j][0]-x,cs[j][1]-z)<cs[j][2]+0.25) return true;}}}      /* low enough to be in a car's way: a van's roof is higher than a hatchback's */
    return false;}
  let inR=false;
  for(const k in A.rooms){const rm=A.rooms[k]; if((rm.lvl||0)!==lvl||!nodes[rm.node||k]) continue; const rs=rm.rs;
    for(let i=0;i<rs.length&&!inR;i++){const q=rs[i]; if(x>q[0]-0.12&&x<q[1]+0.12&&z>q[2]-0.12&&z<q[3]+0.12) inR=true;}}
  if(!inR) return true;
  if(nodes.hall&&!nodes.lk) return !SM.onLevel(lvl,function(){return SM.isFree(x,z);});      // the lobby and the landings: their pillars and stair walls too
  return false;
}
function collide(from,to,lvl,out,walls){      // walk out from the pivot toward where the camera wants to be; stop short of the first thing in the way
  const d=from.distanceTo(to), n=Math.max(2,Math.ceil(d/0.18)); let k=1;
  for(let i=1;i<=n;i++){const t=i/n, x=from.x+(to.x-from.x)*t, z=from.z+(to.z-from.z)*t, y=from.y+(to.y-from.y)*t; if(blocked(x,z,y,lvl,out,walls)){k=Math.max(0,(i-1.6)/n); break;}}
  return k;
}

/* the crowns of the street trees hang down to about two metres, where the camera rides: it ducks under them, or comes in closer */
let TG=null;
function treeGrid(){if(TG) return TG; TG=new Map(); const T=A.town; (T&&T.trees||[]).forEach(function(q){if(q[2]===2||!q.s) return; const k=Math.floor(q[0]/8)+','+Math.floor(q[1]/8); let l=TG.get(k); if(!l) TG.set(k,l=[]); l.push(q);}); return TG;}
function underCrowns(w,pv){const g=treeGrid(); if(!g.size) return; const U=A.town.U;
  for(let it=0;it<3;it++){let hit=null, hy=0; const i0=Math.floor(w.x/8), k0=Math.floor(w.z/8);
    for(let i=i0-1;i<=i0+1&&!hit;i++) for(let k=k0-1;k<=k0+1&&!hit;k++){const l=g.get(i+','+k); if(!l) continue;
      for(let n=0;n<l.length;n++){const q=l[n], rx=q.s*1.1, ry=q.s*q.sy*0.8, dx=w.x-q[0], dz=w.z-q[1], h2=(dx*dx+dz*dz)/(rx*rx); if(h2>=1) continue;
        const cy=U+q.h, e=h2+Math.pow((w.y-cy)/ry,2); if(e<1){hit=q; hy=cy-ry*Math.sqrt(1-h2)-0.3; break;}}}
    if(!hit) return;
    if(hy>pv.y-0.25){w.y=hy; return;}      // low enough to stay below the leaves
    w.lerp(pv,0.35);}}      // too low a crown: closer in, and look again

/* ---------- the mouse: click the view to take it, Esc to let go; or drag ---------- */
let drag=null;
function locked(){return document.pointerLockElement===cv;}
A.gtaLocked=locked;
function canLock(){return active()&&!TOUCH&&!!cv.requestPointerLock;}
A.gtaTapFloor=function(){if(!canLock()) return false; try{const r=cv.requestPointerLock(); if(r&&r.catch) r.catch(function(){});}catch(e){} return true;};      // a click on nothing in particular takes the mouse
document.addEventListener('pointerlockchange',function(){const on=locked(); document.body.classList.toggle('gtaLock',on); if(on){C.lockT=A.t; hint(true);}});
document.addEventListener('mousemove',function(e){if(!locked()||!active()) return; turn(e.movementX,e.movementY,0.0023);});
cv.addEventListener('pointerdown',function(e){
  if(!active()) return; const fe=document.activeElement; if(fe&&fe!==document.body&&fe.blur) fe.blur();      /* a click in the view: the keys are the game's again */
  if(locked()){e.preventDefault(); if(e.button===0) punch(); return;}
  if(drag&&drag.id!==e.pointerId) return;      /* one finger turns the camera at a time; it need not be the first one down */
  drag={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};
});
window.addEventListener('pointermove',function(e){if(!drag||e.pointerId!==drag.id) return; const dx=e.clientX-drag.x, dy=e.clientY-drag.y;
  if(!drag.moved&&Math.hypot(dx,dy)<6) return; drag.moved=true; drag.x=e.clientX; drag.y=e.clientY; turn(dx,dy,e.pointerType==='touch'?0.006:0.0042);});
window.addEventListener('pointerup',function(e){if(drag&&e.pointerId===drag.id) drag=null;});
window.addEventListener('pointercancel',function(){drag=null;});
cv.addEventListener('contextmenu',function(e){if(active()) e.preventDefault();});
cv.addEventListener('wheel',function(e){if(!active()) return; e.preventDefault(); C.zoom=clamp(C.zoom+(e.deltaY>0?0.12:-0.12),0.55,1.7);},{passive:false});
function turn(dx,dy,s){const S=A.gtaSet, k=S?Math.pow(3,(S.get('sens')-0.5)*2):1, inv=S&&S.get('invert')?-1:1; C.yaw-=dx*s*k; C.pitch=clamp(C.pitch-dy*s*k*inv,-1.25,0.55); C.look=A.t;}      /* mouse speed and up-and-down from the settings (gta-map.js) */

/* ---------- keys ---------- */
const keys={};
window.addEventListener('keydown',function(e){
  if(!A.simsOn||A.paused||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return; const k=e.key.toLowerCase(); keys[k]=true;
  if(e.repeat) return;
  if(k==='alt') e.preventDefault();      /* held, you walk (and the browser's menu bar stays shut) */
  if(k===' '&&!car()){jump(); e.preventDefault();}
  else if(k==='v') cycle();
  else if(k==='r'&&!car()) punch();
  else if(k==='h'&&!car()&&!e.repeat&&A.gtaTaxi&&A.gtaTaxi.whistle) A.gtaTaxi.whistle('loud');      /* on foot, the horn key whistles for a taxi, as GTA's does */
  else if(/^[1-9]$/.test(k)) pick(+k-1);
});
window.addEventListener('keyup',function(e){keys[e.key.toLowerCase()]=false;});
window.addEventListener('blur',function(){for(const k in keys) keys[k]=false;});
/* V: near, middle, far, and through your own eyes */
function cycle(){
  if(SM.camMode==='eye'){SM.setCam('follow'); C.on=true; C.zoom=0.7; C.snap=true; pressCams(); return;}
  if(!C.on){C.on=true; C.snap=true; pressCams(); return;}
  if(C.zoom<0.85) C.zoom=1; else if(C.zoom<1.3) C.zoom=1.55; else if(car()) C.zoom=0.7; else {SM.setCam('eye'); pressCams();}
}
/* the number keys: the n-th thing on offer, in the bar by what you picked or by what is in front of you */
function pick(i){const bars=[$('tgtBar'),$('useBar')];
  for(let b=0;b<bars.length;b++){const el=bars[b]; if(!el||el.hidden||el.style.display==='none') continue; const bs=el.querySelectorAll('button'); if(bs[i]){bs[i].click(); return true;}}
  return false;}
A.gtaPick=pick;
function punch(){if(car()||!A.game) return; if(A.gtaAttack) A.gtaAttack(); else if(A.game.punchNearest) A.game.punchNearest();}      // with the pistol out (gta-arms.js), a shot

/* ---------- jumping ---------- */
const J={y:0,v:0,on:false};
function jump(){const p=SM.player; if(!p||J.on||p.seat||p.script||p.driving||p.riding||(A.game&&A.game.G&&A.game.G.down)||(A.floors&&A.floors.G.busted)) return;
  if(p.path.length&&!p.manual){SM.stop(); p.path=[]; p.cb=null;}
  J.on=true; J.v=3.7; J.y=0.001; if(A.gtaSound) A.gtaSound.jump(); if(A.gtaStats) A.gtaStats.jumps++;}
function jumpStep(dt){const p=SM.player; if(!J.on||!p) {if(p) p.p.air=Math.max(0,(p.p.air||0)-dt*6); return;}
  J.y+=J.v*dt; J.v-=11*dt; p.p.air=Math.min(1,(p.p.air||0)+dt*9);
  if(J.y<=0){J.on=false; J.y=0; J.v=0; if(A.gtaSound) A.gtaSound.land(); C.shake=Math.max(C.shake,0.04);}
  p.p.g.position.y+=J.y;}
A.gtaJump={get y(){return J.y;},get on(){return J.on;}};

/* ---------- how fast you go: a stroll, or Shift to run; the flat is too small to run flat out ---------- */
A.walkSpeed=function(run){const out=outdoors(); if(!out) return run?3.1:1.45; return run?6.6:keys.alt?1.6:3.6;};      /* outside, as GTA on a keyboard: a jog, Shift to sprint, Alt to walk; the flat is too small for any of that */

/* ---------- the camera, every frame ---------- */
const UP=new THREE.Vector3(0,1,0);
function frame(dt){
  const on=active();
  if(!on){if(hid.length) unhide(); if(C.headHid&&SM.player&&SM.camMode!=='eye'){C.headHid=false; SM.player.p.hideHead(false);} if(C.was){C.was=false; if(SM.camMode!=='eye') ctl.enabled=true; if(locked()) document.exitPointerLock(); if(SM.camMode!=='eye'){cam.fov=40; cam.updateProjectionMatrix();}} return;}
  if(!C.was){C.was=true; C.snap=true; const p=SM.player; C.yaw=(function(){const c0=car(); return c0?c0.psi+R/2:p.h;})();      /* behind the car you are in, the taxi too */ C.pitch=outdoors()||car()?-0.2:-0.4; if(A.gtaSet) C.zoom=A.gtaSet.get('dist');
    if(!p.lvl&&Math.hypot(p.x-SM.EX,p.z-SM.SPAWN)<0.4){C.yaw+=0.6; C.pitch=-0.5;}}      /* just in at the front door: looking in at an angle, not through the door frame */
  ctl.enabled=false; if(A.flying()) A.stopFly();
  const p=SM.player, c=car(), out=c?true:outdoors(), lvl=p.lvl||0, ls=A.sticks&&A.sticks.look;
  if(ls&&Math.hypot(ls.x,ls.y)>0.15){C.yaw-=ls.x*Math.abs(ls.x)*dt*2.6; C.pitch=clamp(C.pitch-ls.y*Math.abs(ls.y)*dt*1.4,-1.25,0.55); C.look=A.t;}      // the right stick
  /* the pivot: over your shoulders, or over the car */
  if(c){pv.set(c.x,c.g.position.y+1.45,c.z);}
  else{const s=p.p.sc||1; pv.set(p.x,p.p.g.position.y-J.y*0.6+1.5*s,p.z);}
  /* behind you by itself: always in a car, on foot once you are on the move and have let the mouse be a moment */
  const head=c?c.psi+R/2:p.h, idle=A.t-C.look;
  if(c){const sp=Math.abs(c.v); if(keys.c) {C.yaw=head+R; C.back=true;} else{if(C.back){C.back=false; C.yaw=head;} if(idle>1.2&&sp>1) C.yaw+=wrap(head-C.yaw)*Math.min(1,dt*(1.2+sp*0.12)); C.pitch+=(-0.2-C.pitch)*Math.min(1,dt*(idle>1.2?1.5:0));}}
  else if((p.manual||p.path.length)&&idle>2.5){if(!locked()) C.yaw+=wrap(head-C.yaw)*Math.min(1,dt*0.9); C.pitch+=((out?-0.2:-0.4)-C.pitch)*Math.min(1,dt*1.2);}      // indoors it looks down over your head, the rooms are small
  /* how far back: the zoom, closer indoors, farther the faster the car */
  const aim=!c&&A.gtaAiming&&A.gtaAiming();
  if(aim){pv.x-=Math.cos(C.yaw)*0.55; pv.z+=Math.sin(C.yaw)*0.55; pv.y+=0.12; if(!C.aimWas) C.pitch=Math.max(C.pitch,-0.03);}      // aiming: over the right shoulder, looking level
  C.aimWas=aim;
  const onSt=!!p.script||!!(A.onStairs&&A.onStairs(p));      /* on the stairs, scripted or walked yourself */
  if(onSt){C.pitch+=(-0.32-C.pitch)*Math.min(1,dt*3); C.yaw+=wrap(head-C.yaw)*Math.min(1,dt*3);}      /* climbing: close behind you, turning with you on the landings, under the flight above */
  const base=aim?1.9:onSt?1.35:(c?CAR:FOOT)[1]*C.zoom*(out?1:0.72)+(c?Math.min(3,Math.abs(c.v)*0.09):0);
  C.dist+=(base-C.dist)*Math.min(1,dt*4);
  dir.set(Math.sin(C.yaw)*Math.cos(C.pitch),Math.sin(C.pitch),Math.cos(C.yaw)*Math.cos(C.pitch));
  want.copy(pv).addScaledVector(dir,-C.dist);
  const lvT=Math.max(lvl,p.script?p.script.lvl:lvl,p.stairTo!=null?p.stairTo:lvl);      // on the stairs: the ceiling of the floor you are going to, if it is higher
  if(!out){const top=(lvT&&A.levels&&A.levels[lvT]?A.levels[lvT].y:0)+A.D.H-0.18; if(want.y>top) want.y=top;}
  const gy=(SM.ground?SM.ground(want.x,want.z):0)+0.35; if(out&&want.y<gy) want.y=gy;
  const rm=A.rooms[p.room], nd=rm?(rm.node||p.room):null; nodes={}; nodes[nd]=1;
  if(!lvl) LINKS.forEach(function(l){const d=A.door(l[2]); if(!d||d.cur<0.35) return; if(l[0]===nd) nodes[l[1]]=1; else if(l[1]===nd) nodes[l[0]]=1;});
  let k=onSt?1:collide(pv,want,lvl,out);
  if(out&&!c&&!aim&&k<0.97){const kw=collide(pv,want,lvl,out,true); if(kw>k+0.1) for(let i=1;i<=5;i++){tw.copy(want); tw.y+=i*0.3; const kk=collide(pv,tw,lvl,out); if(kk>=kw-0.03){want.y=tw.y; k=kk; break;}}}      // a bench, a parked car, the bottle cage: up over it, not in against your head
  if(c&&!p.script){const minD=c.dim[0]/2+1.3; if(k*C.dist<minD){const kk=Math.min(1,minD/C.dist); tw.copy(pv); tw.y+=1.7; tw.addScaledVector(dir,-C.dist); if(collide(pv,tw,lvl,out)>=kk){want.copy(tw); k=Math.max(k,kk);} else k=kk;}}      /* never inside the car you are in, as GTA's never is: it rises over what is behind, or stops at the bumper */
  want.lerpVectors(pv,want,Math.max(k,0.08));      // in the stairwell, between floors, it keeps its distance
  /* boxed in, and you are not turning it yourself: it swings round to where there is room, as GTA's does */
  if(!c&&k<0.45&&idle>0.8&&!p.script&&!aim){let best=0, bk=k; [0.7,-0.7,1.4,-1.4,2.1,-2.1,R].forEach(function(o){const y=C.yaw+o; dir2.set(Math.sin(y)*Math.cos(C.pitch),Math.sin(C.pitch),Math.cos(y)*Math.cos(C.pitch)); tw.copy(pv).addScaledVector(dir2,-C.dist); const kk=collide(pv,tw,lvl,out); if(kk>bk+0.15){bk=kk; best=o;}});
    if(best) C.yaw+=wrap(best)*Math.min(1,dt*2.5);}
  if(out&&!c){tw.copy(want); underCrowns(want,pv); if(want.y<tw.y-0.05&&collide(pv,want,lvl,out)<0.97) want.copy(tw);}      /* ducking under the leaves would put it in the bottle cage: it stays up, and the leaves by it fade */
  const hd=Math.hypot(want.x-pv.x,want.z-pv.z); if(!c&&hd<1.4){want.y+=Math.min(0.55,(1.4-hd)*0.6); if(!out){const top=(lvT&&A.levels&&A.levels[lvT]?A.levels[lvT].y:0)+A.D.H-0.12; if(want.y>top) want.y=top;}}      // squeezed against a wall: up, to look down over your head
  /* glide there; pulled in by a wall, at once */
  const d0=C.pos.distanceTo(pv), d1=want.distanceTo(pv);
  if(C.snap||C.pos.distanceTo(want)>12){C.pos.copy(want); C.snap=false;}
  else C.pos.lerp(want,d1<d0-0.05?Math.min(1,dt*20):Math.min(1,dt*(c?9:14)));
  cam.position.copy(C.pos); if(!out) seeThrough(lvl); else if(hid.length) unhide();
  const close=!c&&C.pos.distanceTo(pv)<0.55; if(close!==C.headHid){C.headHid=close; p.p.hideHead(close);}      // right at your head: it is not drawn
  if(C.shake>0){cam.position.x+=(Math.random()-0.5)*C.shake; cam.position.y+=(Math.random()-0.5)*C.shake; C.shake=Math.max(0,C.shake-dt*1.2);}
  lookAt.copy(pv); if(c){const f=c.fwd(); lookAt.x+=f[0]*2.2; lookAt.z+=f[1]*2.2;}
  cam.up.copy(UP); cam.lookAt(lookAt); ctl.target.copy(pv);
  /* a wider lens at speed, and running */
  const fov=aim?42:c?56+Math.min(12,Math.abs(c.v)*0.45):(A.running&&p.manual?55:52);
  C.fov+=(fov-C.fov)*Math.min(1,dt*3); const near=out?0.12:0.06;
  if(Math.abs(cam.fov-C.fov)>0.05||cam.near!==near){cam.fov=C.fov; cam.near=near; cam.updateProjectionMatrix();}
}
A.gtaShake=function(s){C.shake=Math.max(C.shake,s);};
/* a gamepad, as GTA is played: the left stick walks (or steers), the right one looks, the right trigger runs (or is the gas), the left
   one aims (or is the brake); A jumps, B does what is on offer, X punches or shoots, Y takes a car; the bumpers change the weapon and
   the station, Start opens the map, Back changes the camera, clicking the sticks sounds the horn and looks back */
const GP={on:false,held:{},moved:false,was:{}};
function gpKey(name,code,down){if(!!GP.held[name]===!!down) return; GP.held[name]=down; window.dispatchEvent(new KeyboardEvent(down?'keydown':'keyup',{key:name,code:code,bubbles:true,cancelable:true}));}
function gamepad(){const gps=navigator.getGamepads?navigator.getGamepads():null; let g=null; if(gps) for(let i=0;i<gps.length;i++) if(gps[i]&&gps[i].connected){g=gps[i]; break;}
  const S=A.sticks;
  if(!g||!A.simsOn||!SM.player){if(GP.on){GP.on=false; for(const k in GP.held) if(GP.held[k]) gpKey(k,'',false); if(GP.moved&&S){S.move.x=S.move.y=0; S.look.x=S.look.y=0; GP.moved=false;} if(A.gtaAimSet) A.gtaAimSet(false);} return;}
  GP.on=true; const dz=function(v){return Math.abs(v)<0.14?0:v;}, b=function(i){const q=g.buttons[i]; return !!(q&&(q.pressed||q.value>0.5));}, once=function(i){const now=b(i), was=GP.was[i]; GP.was[i]=now; return now&&!was;};
  const lx=dz(g.axes[0]||0), ly=dz(g.axes[1]||0), rx=dz(g.axes[2]||0), ry=dz(g.axes[3]||0), rt=g.buttons[7]?g.buttons[7].value:0, lt=g.buttons[6]?g.buttons[6].value:0, c=car();
  if(A.paused) return;
  if(S){if(c&&(lx||lt>0.1||rt>0.1)){S.move.x=lx; S.move.y=lt>0.1?lt:-rt; GP.moved=true;}      /* in a car the sticks are drive.js's own: steer, gas and brake */
    else if(!c&&(lx||ly)){S.move.x=lx; S.move.y=ly; GP.moved=true;} else if(GP.moved){S.move.x=S.move.y=0; GP.moved=false;}
    if(rx||ry){S.look.x=rx; S.look.y=ry; GP.looked=true;} else if(GP.looked){S.look.x=S.look.y=0; GP.looked=false;}}      /* a pad that merely lies connected leaves the touch sticks alone */
  if(c){gpKey(' ','Space',b(0)); gpKey('h','KeyH',b(10)); gpKey('c','KeyC',b(11)); gpKey('f','KeyF',b(3)); if(once(5)) gpKey('q','KeyQ',true), gpKey('q','KeyQ',false);}
  else{gpKey('shift','ShiftLeft',rt>0.5); gpKey(' ','Space',b(0)); gpKey('e','KeyE',b(1)); gpKey('f','KeyF',b(3));
    const aim=lt>0.5&&!!A.gtaAimSet; if(aim!==!!GP.aim){GP.aim=aim; if(A.gtaAimSet) A.gtaAimSet(aim);}      /* only as the trigger goes down or up: the mouse's own aim stays */
    if(aim){if(once(2)&&A.gtaFire) A.gtaFire();} else gpKey('r','KeyR',b(2));
    if(once(4)){gpKey('Tab','Tab',true); gpKey('Tab','Tab',false);} if(once(10)&&A.gtaTaxi&&A.gtaTaxi.whistle) A.gtaTaxi.whistle('loud');}      /* the weapon key reads e.key, 'Tab' as the browser spells it */
  if(once(9)&&A.gtaMap) A.gtaMap.toggle(); if(once(8)) cycle();
  if(once(12)) gpKey('q','KeyQ',true), gpKey('q','KeyQ',false);}
/* a door standing open between the camera and you is not drawn while it is in the way */
const hid=[];
function unhide(){for(let i=0;i<hid.length;i++) hid[i].visible=true; hid.length=0;}
function cross(ax,az,bx,bz,cx,cz,dx,dz){const r1=bx-ax, r2=bz-az, s1=dx-cx, s2=dz-cz, den=r1*s2-r2*s1; if(Math.abs(den)<1e-9) return false;
  const t=((cx-ax)*s2-(cz-az)*s1)/den, u=((cx-ax)*r2-(cz-az)*r1)/den; return t>0&&t<1&&u>=0&&u<=1;}
function seeThrough(lvl){unhide(); const p=SM.player, c=cam.position;
  for(let i=0;i<A.doors.length;i++){const d=A.doors[i]; if((d.lvl||0)!==lvl||Math.abs(d.p.position.x-p.x)>5||Math.abs(d.p.position.z-p.z)>5) continue;
    if(d._w==null){const m=d.p.children[0], g=m&&m.geometry&&m.geometry.parameters; d._w=(g&&g.width?g.width:0.78)+0.02;}
    const h=d.p.position, ry=d.p.rotation.y, ex=h.x+Math.cos(ry)*d._w, ez=h.z-Math.sin(ry)*d._w;
    if(cross(c.x,c.z,p.x,p.z,h.x,h.z,ex,ez)){d.p.visible=false; hid.push(d.p);}}}

/* ---------- the Camera buttons in the Sims panel: Behind (this), Above (the old view from over the rooms), Eye view ---------- */
function pressCams(){const g=$('camGta'); if(!g) return; const eye=SM.camMode==='eye';
  g.setAttribute('aria-pressed',!eye&&C.on); $('camFollow').setAttribute('aria-pressed',!eye&&!C.on); $('camEye').setAttribute('aria-pressed',eye);}
if($('camGta')){
  $('camGta').onclick=function(){C.on=true; C.snap=true; SM.setCam('follow'); pressCams();};
  $('camFollow').onclick=function(){C.on=false; if(locked()) document.exitPointerLock(); SM.setCam('follow'); ctl.enabled=true; cam.fov=40; cam.updateProjectionMatrix(); pressCams();};
  $('camEye').onclick=function(){SM.setCam('eye'); pressCams();};
}
/* wherever something sends the camera off to you (getting out of a car, waking up at home), behind you it is */
const fly0=SM.flyToPlayer.bind(SM);
SM.flyToPlayer=function(){if(active()){C.snap=true; C.yaw=SM.player.h; C.pitch=outdoors()?-0.2:-0.4; return;} fly0();};

/* ---------- a word on how it works, the first time you take the mouse ---------- */
let told=false;
function hint(on){if(told||!on) return; told=true; if(SM.toast) SM.toast('Mouse looks around · WASD move · Shift run · Space jump · F car · Click/R punch · E and 1–9 act · V camera · M map · Esc frees the mouse');}

/* ---------- on a phone: buttons to run, jump, punch and take a car ---------- */
const pad=document.createElement('div'); pad.id='gtaPad'; pad.hidden=true;
const ICON={run:'<path d="M13 4a2 2 0 1 0 0-.01M9 21l2-6 3 2v5M7 12l3-4 4 1 3 3 3 0M10 8l-1 5" />',jump:'<path d="M12 3v12M7 8l5-5 5 5M5 20h14" />',hit:'<path d="M6 11V7a2 2 0 0 1 4 0v3M10 10V6a2 2 0 0 1 4 0v4M14 10V7a2 2 0 0 1 4 0v6a6 6 0 0 1-6 6h-1a5 5 0 0 1-5-5v-3a2 2 0 0 1 4 0" />',car:'<path d="M5 16V11l2-5h10l2 5v5M5 16h14M3 11h18M7 19v-3M17 19v-3" />',horn:'<path d="M4 10v4h3l5 4V6L7 10zM16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" />',radio:'<path d="M4 9h16v10H4zM7 9l9-5M8 14h.01M16 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4" />',weap:'<path d="M3 10h13l2-2h3v4l-4 1-2 5h-3l1-4H3z" />'};
function btn(id,label,icon){const b=document.createElement('button'); b.className='gtaBtn'; b.id=id; b.setAttribute('aria-label',label); b.innerHTML='<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+ICON[icon]+'</svg><span>'+label+'</span>'; pad.appendChild(b); return b;}
const bRun=btn('gRun','Run','run'), bJump=btn('gJump','Jump','jump'), bHit=btn('gHit','Punch','hit'), bCar=btn('gCar','Car','car'), bHorn=btn('gHorn','Horn','horn'), bRadio=btn('gRadioB','Radio','radio'), bWeap=btn('gWeapB','Weapon','weap');
A.stage.appendChild(pad);
const hold=function(b,on,off){b.addEventListener('pointerdown',function(e){e.preventDefault(); e.stopPropagation(); b.setPointerCapture(e.pointerId); on();}); ['pointerup','pointercancel'].forEach(function(n){b.addEventListener(n,function(){if(off) off();});});};
hold(bRun,function(){A.running=true; bRun.classList.add('on');},function(){A.running=false; bRun.classList.remove('on');});
hold(bJump,jump); hold(bHit,punch); hold(bRadio,function(){if(A.gtaSound) A.gtaSound.station(1);}); hold(bWeap,function(){if(A.gtaArms) A.gtaArms.cycle(1);}); hold(bCar,function(){carKey();}); hold(bHorn,function(){const h=$('dHorn'); if(h) h.click();});
function carKey(){const dn=(A.game&&A.game.G&&A.game.G.down)||(A.floors&&A.floors.G.busted); if(dn) return true; if(A.gtaTaxi&&(A.gtaTaxi.out()||A.gtaTaxi.cancel())) return true; if(car()){A.drive.exit(); return true;} return enterNear();}      /* wasted or busted, F does nothing at all */
function edgeDist(c,x,z){const f=c.fwd(), dx=x-c.x, dz=z-c.z, al=Math.abs(dx*f[0]+dz*f[1])-c.dim[0]/2, sd=Math.abs(dx*f[1]-dz*f[0])-c.dim[1]/2; return Math.max(al,sd,0);}      /* how far you stand from the car's body */
function enterNear(){const p=SM.player; if(!A.drive||!p||p.lvl) return false; let best=null, bd=3.0;
  A.drive.cars().forEach(function(c){const d=edgeDist(c,p.x,p.z); if(d<bd){bd=d; best=c;}});
  const TX=A.gtaTaxi&&A.gtaTaxi.whistle?A.gtaTaxi:null, passing=!!(TX&&TX.whistle('ask'));
  if(best&&(bd<1.0||!passing)){if(best.taxi&&TX&&TX.hail(best)) return true; A.drive.enter(best); return true;}      /* a car within reach is taken (a taxi, with a waypoint set: a ride, not a theft); one farther off loses to a taxi passing */
  return !!(TX&&TX.whistle('quiet'));}      /* no car at hand: a taxi passing is hailed; none, and F is the punch it was */
A.gtaCar=carKey;

let camKey='';
A.frameFns.push(function(dt){gamepad();});
(function pausedPoll(){requestAnimationFrame(pausedPoll); if(!A.paused||!GP.on||!navigator.getGamepads) return; const gps=navigator.getGamepads(); let g=null; for(let i=0;gps&&i<gps.length;i++) if(gps[i]&&gps[i].connected){g=gps[i]; break;}
  if(!g) return; const q=g.buttons[9], now=!!(q&&q.pressed); if(now&&!GP.was[9]&&A.gtaMap) A.gtaMap.toggle(); GP.was[9]=now;})();      /* the frame functions rest while the map is open: Start is watched on its own, to close it */
A.frameFns.push(function(dt){
  jumpStep(dt); frame(dt);
  const ck=A.simsOn+SM.camMode+C.on; if(ck!==camKey){camKey=ck; pressCams();}
  const show=A.simsOn&&TOUCH&&!!SM.player; if(pad.hidden===show) pad.hidden=!show;
  if(show){const c=!!car(); bRun.hidden=c; bJump.hidden=c; bHit.hidden=c; bHorn.hidden=!c; bRadio.hidden=!c; bCar.classList.toggle('on',c);
    const W=A.gtaWeapon; bWeap.hidden=c||!W||!(W.has.bat||W.has.pistol); const gun=W&&W.cur==='pistol'; if(bHit.dataset.gun!==String(gun)){bHit.dataset.gun=gun; bHit.lastChild.textContent=gun?'Shoot':'Punch';}}
});
if(A.gtaSet) A.gtaSet.on(function(k,v){if(k==='dist') C.zoom=v;});
A.gta=Object.assign(A.gta||{},{cam:C,active:active,cycle:cycle,jump:jump,punch:punch,enterNear:enterNear,pressCams:pressCams});
})();
