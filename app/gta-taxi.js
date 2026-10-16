/* Haroe 10 — taxis, as GTA has them. With a waypoint on the map, F by a taxi passing in the traffic hails it: it pulls up, you walk
   to its door and get in, and it drives you there along the streets, in its lane, for a fare paid as you get out at the kerb. F on
   the way gets you out where you are. With the police after you it does not stop. The taxi then goes on its way in the traffic. */
(function(){
'use strict';
const A=window.APP, SM=A.sims, D=A.drive, T=A.town, R=Math.PI;
if(!SM||!D||!T||!A.gtaRoute||!A.gtaWay) return;
function hyp(a,b){return Math.hypot(a,b);}
function wrap(d){while(d>R) d-=2*R; while(d<-R) d+=2*R; return d;}
function clamp(v,a,b){return v<a?a:v>b?b:v;}
function say(s){if(SM.toast) SM.toast(s);}
let ride=null;      // the taxi you hailed: its car and traffic entry, the way there, the fare, and what it is doing (wait, ride, away)
function routeLen(r){let l=0; for(let i=1;i<r.length;i++) l+=hyp(r[i][0]-r[i-1][0],r[i][1]-r[i-1][1]); return l;}
function fareOf(d){return Math.max(10,Math.round((10+d*0.06)/2)*2);}      // ₪10 to get in, and six agorot a metre, rounded to the even shekel
/* the way, as the map gives it, runs down the middle of the streets from junction to junction: moved over into the lane the traffic
   drives in, and the points behind the car dropped, so it neither turns round nor cuts the corners through the parked cars */
function laneRoute(r,c){const f=c.fwd(), out=[], behind=function(q){return (q[0]-c.x)*f[0]+(q[1]-c.z)*f[1]<0;}; if(r.length>1&&hyp(r[0][0]-c.x,r[0][1]-c.z)<0.5) r.shift();      /* the way begins where the car is */
  while(r.length>1&&behind(r[0])) r.shift();
  const lo=function(p){const rn=T.roadNear(p[0],p[1]), k=rn?rn.r.k:1; return k===2||k===3?0:k===1?0.95:2.1;};      // the lane on the right of the way it goes, as drive.js's laneOff has it: the middle of a side street
  if(behind(r[0])){const sd=[f[1],-f[0]], l=lo([c.x,c.z]); out.push([c.x+f[0]*8,c.z+f[1]*8],[c.x+f[0]*10+sd[0]*1.6,c.z+f[1]*10+sd[1]*1.6],[c.x+f[0]*3+sd[0]*(2*l+0.4),c.z+f[1]*3+sd[1]*(2*l+0.4)]);}      /* the way back is behind it: a U-turn first, over into the other lane */
  const dir=function(a,b){const dx=b[0]-a[0], dz=b[1]-a[1], l=hyp(dx,dz)||1; return [dx/l,dz/l];};
  for(let i=0;i<r.length;i++){const p=r[i], l=lo(p), u1=i>0?dir(r[i-1],p):null, u2=i<r.length-1?dir(p,r[i+1]):null;
    if(u1&&u2&&u1[0]*u2[0]+u1[1]*u2[1]<0.94){const k1=Math.max(2,Math.min(7,hyp(p[0]-r[i-1][0],p[1]-r[i-1][1])/2-0.5)), k2=Math.max(2,Math.min(7,hyp(r[i+1][0]-p[0],r[i+1][1]-p[1])/2-0.5));      /* a corner: into the junction on the lane it is in, out of it on the lane it leaves by; less on short stretches, so it never doubles back */
      out.push([p[0]-u1[0]*k1-u1[1]*l,p[1]-u1[1]*k1+u1[0]*l]); out.push([p[0]+u2[0]*k2-u2[1]*l,p[1]+u2[1]*k2+u2[0]*l]);}
    else{const u=u1&&u2?[u1[0]+u2[0],u1[1]+u2[1]]:(u1||u2||f), n=hyp(u[0],u[1])||1; out.push([p[0]-u[1]/n*l,p[1]+u[0]/n*l]);}}
  return out;}

/* ---------- hailing one ---------- */
function hail(c){const p=SM.player; if(!p||ride||!c||!c.taxi||!c.traffic||p.lvl) return false;
  const G=A.floors&&A.floors.G; if(G&&G.wanted>0){say('The taxi speeds up past you: not with the police after you.'); return true;}
  const w=A.gtaWay.at; if(!w) return false;      /* no waypoint: F takes a taxi as it takes any car */
  const route=A.gtaRoute(c.x,c.z,w[0],w[1],true); if(!route||route.length<2){say('The driver shrugs: no way there by road.'); return true;}
  c.held=true; const fare=fareOf(routeLen(route)); if(route.length>2) route.pop();      /* the fare to the pin; the ride to the kerb nearest it, where the road ends */
  ride={car:c,t:c.traffic,route:laneRoute(route,c),fare:fare,state:'wait',since:A.t,stuck:0,rev:0,ghost:0,fails:0};
  const f=c.fwd(), s=[f[1],-f[0]], side=((p.x-c.x)*s[0]+(p.z-c.z)*s[1])>0?1:-1, w2=c.dim[1]/2+0.6;
  let dx=c.x+s[0]*side*w2, dz=c.z+s[1]*side*w2; if(!A.nav.isFree(dx,dz)){dx=c.x-s[0]*side*w2; dz=c.z-s[1]*side*w2;}      // the door on your side, or the other
  SM.stop(); if(A.game&&A.game.select) A.game.select(null); p.release(); p.speed=3.6; p.goTo(dx,dz,function(){p.speed=1.4; board();});
  say('Taxi: to the waypoint, ₪ '+fare+'. Get in.'); return true;}
function board(){const r=ride, p=SM.player; if(!r||r.state!=='wait') return; r.state='ride'; r.from=A.t; p.speed=1.4; p.release(); p.path=[]; p.cb=null; p.p.g.visible=false; p.riding=r.car;
  if(SM.setDoing) SM.setDoing('riding'); if(A.gtaSound&&A.gtaSound.blip) A.gtaSound.blip(); say('Off to the waypoint. F gets you out on the way.');}
/* ---------- getting out: at the waypoint, or wherever you asked ---------- */
function leave(paid){const r=ride, p=SM.player, c=r.car; if(!r) return; const f=c.fwd(), s=[-f[1],f[0]];      /* the kerb side first: the right of the car, in its lane */
  let ox=c.x+s[0]*(c.dim[1]/2+0.8), oz=c.z+s[1]*(c.dim[1]/2+0.8); if(!A.nav.isFree(ox,oz)){ox=c.x-s[0]*(c.dim[1]/2+0.8); oz=c.z-s[1]*(c.dim[1]/2+0.8);}
  const q=A.nav.isFree(ox,oz)?[ox,oz]:(T.nearest?T.nearest(ox,oz):null)||[ox,oz];
  p.riding=null; p.p.g.visible=true; p.x=p.lx=q[0]; p.z=p.lz=q[1]; p.h=p.hT=c.psi+R/2; p.room='street'; p.path=[]; p.cb=null; if(SM.setDoing) SM.setDoing(null);
  const G=A.floors&&A.floors.G; if(G&&paid>0){const take=Math.min(G.loot,paid); G.loot-=take; if(A.floors.drawHud) A.floors.drawHud(); if(A.gtaSound&&A.gtaSound.cash) A.gtaSound.cash(); say((r.done?'Here you are.':'Here?')+' ₪ '+take+'.');}
  /* and the taxi drives off up the road, out of your way, then is traffic again */
  const away=A.gtaRoadPoint?A.gtaRoadPoint(c.x,c.z,120,220):null; r.route=laneRoute(away?(A.gtaRoute(c.x,c.z,away.x,away.z,true)||[[away.x,away.z]]):[[c.x+f[0]*60,c.z+f[1]*60]],c); r.state='away'; r.since=A.t; r.stuck=0; r.rev=0; r.ghost=0;}
/* ---------- driving it: along the route as the police cars go, slower; it waits for what is in the way, and backs off what holds it ---------- */
function aim(c,tx,tz,sp,dt){const da=wrap(Math.atan2(-(tz-c.z),tx-c.x)-c.psi);
  c.steer+=(clamp(da*1.7,-0.62,0.62)-c.steer)*Math.min(1,dt*6);
  const s=sp*(Math.abs(da)>1.2?0.3:Math.abs(da)>0.5?0.6:1); c.v+=(s-c.v)*Math.min(1,dt*(s<c.v?3:1.2));}
function move(c,dt,ghost){const npsi=c.psi+c.v/c.dim[2]*Math.tan(c.steer)*dt, f=[Math.cos(npsi),-Math.sin(npsi)], nx=c.x+f[0]*c.v*dt, nz=c.z+f[1]*c.v*dt;
  const h=D.hitsCar(c,nx,nz,npsi,true), ok=ghost||(!h&&D.outlineFree(c,nx,nz,npsi));      /* the kerb-parked cars do not hold it: the lane beside them is too tight for a driver that is not you */
  if(ok){c.x=nx; c.z=nz; c.psi=npsi;} else c.v*=0.2;      // something in the way: it waits
  c.place(); c.wheelsTurn(dt); A.touch(1); return ok?1:(h&&h.traffic?2:0);}      // went; or held by the traffic, which moves on; or by something that will not
function along(r,c,dt,sp){const rt=r.route; while(rt.length>1&&hyp(rt[0][0]-c.x,rt[0][1]-c.z)<4.5) rt.shift(); const q=rt[0], left=hyp(q[0]-c.x,q[1]-c.z);
  if(r.rev>0){r.rev-=dt; c.steer+=(-(r.revSteer)-c.steer)*Math.min(1,dt*6); c.v+=(-3.5-c.v)*Math.min(1,dt*3); move(c,dt,r.ghost>0); return false;}      // backing off whatever held it
  const slow=rt.length<=1?Math.min(sp,Math.sqrt(2*2.5*Math.max(0,left-3))):sp; aim(c,q[0],q[1],slow,dt);
  const went=move(c,dt,r.ghost>0); r.ghost=Math.max(0,r.ghost-dt);
  if(went!==1){r.stuck+=dt; if(r.stuck>(went===2?4:0.9)){r.stuck=0; r.fails++; r.rev=0.8; r.revSteer=c.steer||0.4; if(r.fails>=2){r.ghost=2.5; r.fails=0;}}} else r.stuck=Math.max(0,r.stuck-dt*0.5);      // held a moment too long (longer behind the traffic): back, and again; held for good: through it
  return rt.length<=1&&left<3.5;}
function sit(c){const p=SM.player; p.x=p.lx=c.x; p.z=p.lz=c.z; p.h=p.hT=c.psi+R/2; p.p.g.position.set(c.x,c.g.position.y,c.z); p.p.walking=false; p.path=[]; p.manual=false;}
function release(){const r=ride; if(!r) return; const c=r.car; ride=null; if(r.state==='wait') SM.player.speed=1.4; if(D.live.indexOf(c)<0) return;
  /* back into the traffic on the road it is on, pointing the way it points */
  const rn=T.roadNear(c.x,c.z), t=r.t; c.held=false; if(!rn||!rn.r.w[0]||rn.r.k===3||!t){if(t) t.gone=true; return;}
  const a=rn.r.p[rn.j-1], b=rn.r.p[rn.j], dx=b[0]-a[0], dz=b[1]-a[1], l=hyp(dx,dz)||1, s=clamp(((c.x-a[0])*dx+(c.z-a[1])*dz)/l,0,l), f=c.fwd(), dir=(f[0]*dx+f[1]*dz)>=0?1:-1;
  t.rd=rn.r; t.j=rn.j-1; t.dir=dir; t.s=dir>0?s:l-s; t.wait=0; t.stop=0; t.cruise=rn.r.k===2?8:12.5;}
A.frameFns.push(function(dt){
  if(!ride) return; const r=ride, c=r.car, p=SM.player;
  if(!A.simsOn||!p||D.live.indexOf(c)<0||(r.state!=='away'&&(p.lvl||(A.game&&A.game.G&&A.game.G.down)||(A.floors&&A.floors.G.busted)))){if(r.state==='ride'){p.riding=null; p.p.g.visible=true;} release(); return;}
  if(A.paused) return;
  if(r.state==='wait'){c.v*=Math.pow(0.02,dt); c.place(); c.wheelsTurn(dt); const d=hyp(p.x-c.x,p.z-c.z); if(d<1.6&&!p.path.length) board(); else if(A.t-r.since>25||d>30||p.driving){release(); say('The taxi drives on.');} return;}      // pulled up, waiting for you
  if(r.state==='ride'){if(c.hp<=0){leave(0); say('The taxi is done for.'); return;} const done=along(r,c,dt,11); sit(c); if(done){r.done=true; leave(r.fare);} return;}      /* wrecked under you: out, and no fare */
  if(r.state==='away'){if(along(r,c,dt,10)||A.t-r.since>20) release();}
});
/* a whistle: the nearest taxi passing within 16 m stops for you (with a waypoint set); quiet (no sound) when only asked whether one is there */
function whistle(quiet){const p=SM.player; if(!p||p.lvl||ride) return false; let best=null, bd=16; D.live.forEach(function(c){if(!c.taxi||!c.traffic||c.held) return; const d=hyp(c.x-p.x,c.z-p.z); if(d<bd){bd=d; best=c;}});
  if(quiet) return !!(best&&A.gtaWay.at); if(A.gtaSound&&A.gtaSound.whistle) A.gtaSound.whistle(); if(!best) return false; if(!A.gtaWay.at){say('Set a waypoint on the map (M) and whistle again: the taxi takes you there.'); return true;} return hail(best);}
/* F on the way: out here, and the fare for the way so far */
function cancel(){const r=ride, p=SM.player; if(!r||r.state!=='wait') return false; p.path=[]; p.cb=null; p.speed=1.4; release(); say('You wave the taxi on.'); return true;}      // F while it waits for you: never mind
A.gtaTaxi={hail:hail,whistle:whistle,cancel:cancel,car:function(){return ride&&ride.state==='ride'?ride.car:null;},state:function(){return ride;},
  out:function(){const r=ride; if(!r||r.state!=='ride') return false; const left=routeLen(r.route); leave(Math.max(10,r.fare-fareOf(left)+10)); return true;}};
})();
