/* Haroe 10 — the GTA display. The radar in the corner turns with the camera: the streets round you, the way to your waypoint in purple,
   home and the cafés, the police; under it your health (green) and armour (blue). Top right the wanted stars and your money, bottom right
   the street you are on as you come into it and the car you got into. Messages come in over the radar, what you can do pops up with its
   key, and when it goes wrong the screen drains of colour: wasted, or busted. On a phone the radar sits top left, clear of the sticks.
   It replaces the Sims-mode badges (the round map, the health pill, the stars pill, the speed pill) while it is on. */
(function(){
'use strict';
const A=window.APP, SM=A.sims, T=A.town, MB=A.gtaMapBase, R=Math.PI;
if(!SM||!T||!MB) return;
const TOUCH=('ontouchstart' in window)||navigator.maxTouchPoints>0;
const $=function(id){return document.getElementById(id);};
function hyp(a,b){return Math.hypot(a,b);}
function on(){return !!(A.simsOn&&SM.player&&A.gtaSet.get('hud'));}

const hud=document.createElement('div'); hud.id='gtaHUD'; hud.hidden=true;
hud.innerHTML='<div id="gRadar"><canvas id="gRadarC"></canvas><div id="gFloor" hidden></div><div class="gBars"><i id="gHp"><b></b></i><i id="gAr"><b></b></i></div></div>'+
  '<div id="gTR"><div id="gStars"></div><div id="gCash"></div><div id="gDelta"></div><div id="gClock"></div></div>'+
  '<div id="gArea"><b id="gStreet"></b><span id="gTown"></span></div><div id="gCarName"></div><div id="gHelp" hidden></div>'+
  '<div id="gBig" hidden><div class="gBand"><b id="gBigT"></b><span id="gBigS"></span></div></div><div id="gPass" hidden><b>task complete</b><span id="gPassN"></span><i id="gPassR"></i></div>';
A.stage.appendChild(hud);
document.body.classList.toggle('touch',TOUCH);

/* ---------- the radar ---------- */
const rc=$('gRadarC'), RW=TOUCH?168:236, RH=TOUCH?112:152;
const dpr=Math.min(2,window.devicePixelRatio||1); rc.width=RW*dpr; rc.height=RH*dpr; rc.style.width=RW+'px'; rc.style.height=RH+'px';
$('gRadar').style.width=RW+'px';
const ARROW=1.0;
function radar(){
  const g=rc.getContext('2d'), p=SM.player, c=A.drive&&A.drive.on()?A.drive.pos():null, x=c?c.x:p.x, z=c?c.z:p.z, h=c?A.drive.heading():p.h;
  const cam=A.camera, yaw=Math.atan2(A.controls.target.x-cam.position.x,A.controls.target.z-cam.position.z);
  const W=RW*dpr, H=RH*dpr, cx=W/2, cy=H*(c?0.66:0.58);
  const span=(c?150+Math.min(170,Math.abs(c.v)*7):130)*(p.lvl?0.6:1), sc=W/span;       // pixels on the radar a metre
  g.save(); g.fillStyle=MB.COL.land; g.fillRect(0,0,W,H);
  g.translate(cx,cy); g.rotate(yaw-R/2);
  const k=sc/MB.PX; g.scale(k,k); g.imageSmoothingEnabled=true;
  g.drawImage(MB.canvas,-(z-MB.TZ0)*MB.PX,-(MB.TX0+MB.TS-x)*MB.PX);
  g.setTransform(1,0,0,1,0,0);
  /* world to radar */
  const ca=Math.cos(yaw-R/2), sa=Math.sin(yaw-R/2);
  const to=function(wx,wz){const du=(wz-z)*sc, dv=-(wx-x)*sc; return [cx+du*ca-dv*sa,cy+du*sa+dv*ca];};
  const way=A.gtaWay&&A.gtaWay.path;
  if(way){g.strokeStyle='#b65cf0'; g.lineWidth=Math.max(3,3.4*dpr); g.lineCap=g.lineJoin='round'; g.beginPath(); way.forEach(function(q,i){const s=to(q[0],q[1]); if(i) g.lineTo(s[0],s[1]); else g.moveTo(s[0],s[1]);}); g.stroke();}
  /* the blips, pinned to the edge when they are off it */
  const edge=function(s,pad){return [Math.max(pad,Math.min(W-pad,s[0])),Math.max(pad,Math.min(H-pad,s[1]))];};
  const inR=function(s){return s[0]>0&&s[1]>0&&s[0]<W&&s[1]<H;};
  (A.gtaPOI||[]).forEach(function(q){if(q.big) return; const s=to(q.x,q.z); const keep=q.k==='home'; if(!inR(s)&&!keep) return; const e=edge(s,9*dpr); A.gtaBlip(g,q.k,e[0],e[1],(q.k==='home'?15:12)*dpr,A.t);});
  if(A.gtaCops) A.gtaCops.blips(function(wx,wz,kind){const s=to(wx,wz), e=edge(s,6*dpr); A.gtaBlip(g,kind,e[0],e[1],(inR(s)?11:8)*dpr,A.t);},function(wx,wz,r,col){const s=to(wx,wz); g.fillStyle=col; g.beginPath(); g.arc(s[0],s[1],r*sc,0,7); g.fill();});
  if(A.gtaWay&&A.gtaWay.at){const s=to(A.gtaWay.at[0],A.gtaWay.at[1]), e=edge(s,11*dpr); A.gtaBlip(g,'way',e[0],e[1]-(inR(s)?8*dpr:0),18*dpr);}
  /* north, on the rim */
  const n=to(x+1000,z), nd=hyp(n[0]-cx,n[1]-cy), nx=cx+(n[0]-cx)/nd*Math.min(W,H), ny=cy+(n[1]-cy)/nd*Math.min(W,H), ne=edge([nx,ny],9*dpr);
  g.fillStyle='rgba(10,12,14,0.85)'; g.beginPath(); g.arc(ne[0],ne[1],7.5*dpr,0,7); g.fill(); g.fillStyle='#fff'; g.font='700 '+Math.round(10*dpr)+'px "Barlow Condensed",sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('N',ne[0],ne[1]+0.5*dpr);
  /* you */
  g.save(); g.translate(cx,cy); g.rotate(-(h-yaw)); A.gtaBlip(g,'you',0,0,15*dpr*ARROW); g.restore();
  g.restore();
}
/* ---------- health and armour ---------- */
let hp0=100, flash=0;
function bars(dt){const G=A.game&&A.game.G, hp=G?Math.max(0,G.hp):100, ar=A.gtaArmor||0;
  if(hp<hp0-0.5) flash=0.6; hp0=hp; flash=Math.max(0,flash-dt);
  const b=$('gHp').firstChild; b.style.width=hp+'%'; b.style.background=hp<25?(Math.floor(A.t*4)%2?'#d23b3b':'#7a1f1f'):'#4fae4f'; $('gHp').style.boxShadow=flash>0?'0 0 0 2px rgba(255,80,80,'+flash+')':'none';
  $('gAr').firstChild.style.width=ar+'%';}
/* ---------- the stars and the money ---------- */
const STAR='<svg viewBox="0 0 24 24" width="26" height="26"><path d="M12 2.6l2.8 6 6.5.7-4.9 4.4 1.4 6.4L12 16.8 6.2 20.1l1.4-6.4L2.7 9.3l6.5-.7z" stroke="#000" stroke-width="1.6" stroke-linejoin="round"/></svg>';
let starKey='', cash0=null, deltaT=0, sumD=0;
function stars(){const G=A.floors&&A.floors.G, w=G?G.wanted:0, seen=!A.gtaCops||A.gtaCops.seen!==false, blink=!seen&&Math.floor(A.t*3)%2, max=5;
  const key=w+'|'+(seen?1:blink?2:3); if(key===starKey) return; starKey=key;
  let s=''; if(w>0) for(let i=0;i<max;i++){const lit=i<w; s+='<i class="'+(lit?(blink?'dim':'on'):'off')+'">'+STAR+'</i>';}
  $('gStars').innerHTML=s;}
function cash(dt){const G=A.floors&&A.floors.G, v=G?G.loot:0;
  if(cash0==null) cash0=v;
  if(v!==cash0){const d=v-cash0; sumD+=d; deltaT=2.6; $('gDelta').innerHTML=(sumD>0?'+ <small>₪</small>':'− <small>₪</small>')+Math.abs(sumD).toLocaleString('en'); $('gDelta').className=sumD>0?'up':'down'; if(d>0&&A.gtaStats) A.gtaStats.stolen+=d; cash0=v; if(A.gtaSound&&A.gtaSound.cash&&d>0) A.gtaSound.cash();}
  const t=v.toLocaleString('en'); if($('gCash').dataset.v!==t){$('gCash').dataset.v=t; $('gCash').innerHTML='<small>₪</small>'+t;}      /* the shekel sign from a font that has it */ deltaT=Math.max(0,deltaT-dt); $('gDelta').style.opacity=deltaT>0?Math.min(1,deltaT*2):0; if(deltaT<=0) sumD=0;
  const ck=A.gtaClock?A.gtaClock():''; if($('gClock').textContent!==ck) $('gClock').textContent=ck;}
/* ---------- the street you are on, the car you got into ---------- */
let street='', streetT=0, carWas=null, carT=0;
const FLOOR={'-1':'The shelter',1:'First floor',2:'Second floor',3:'Third floor'};      // as floors.js names them
function area(dt){const p=SM.player, c=A.drive&&A.drive.on()?A.drive.pos():null, x=c?c.x:p.x, z=c?c.z:p.z;
  let nm='';
  if(p.lvl) nm=FLOOR[p.lvl]?'Haroe 10, '+FLOOR[p.lvl].toLowerCase():'Haroe 10';
  else{const rm=A.rooms[p.room]; if(rm&&!rm.ext&&!c) nm='Haroe 10'; else if(p.room==='hall') nm='Haroe 10'; else{const q=T.roadNear(x,z); if(q&&q.d<8&&q.r.name) nm=q.r.name; else if(!T.inside(x,z)||T.kept(x,z)) nm='Haroe St';}}
  if(nm&&nm!==street){street=nm; streetT=4.5; $('gStreet').textContent=nm; $('gTown').textContent='Ramat Gan';}
  streetT=Math.max(0,streetT-dt); $('gArea').style.opacity=streetT>0?Math.min(1,streetT,(4.5-streetT)*3):0;
  if(c!==carWas){carWas=c; if(c){carT=3.4; $('gCarName').textContent=c.name; if(A.gtaStats) A.gtaStats.cars++;}}
  carT=Math.max(0,carT-dt); $('gCarName').style.opacity=carT>0?Math.min(1,carT,(3.4-carT)*3):0;}
/* ---------- a word in the corner: what a key does here ---------- */
let helpKey='';
/* the first time in Sims mode, a few words on how to play, one after another, as GTA starts you off */
const INTRO=TOUCH?['Walk with the left stick, look round with the right one or a drag.','The round buttons: run, jump, punch, take a car.','Tap the radar for the map, and a waypoint to go to.','Do something the police see, and the stars go up.']
  :['Walk with <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>. Click the view to look round with the mouse; <kbd>Esc</kbd> lets it go.','<kbd>Shift</kbd> runs, <kbd>Space</kbd> jumps, <kbd>F</kbd> gets you into a car.','<kbd>E</kbd> and the number keys do what is on offer next to things.','<kbd>M</kbd> opens the map: click it for a waypoint. Settings and keys are there too.','Do something the police see, and the stars go up.'];
let intro=-1, introT=0;
try{if(!localStorage.getItem('haroe-gta-intro')) intro=0;}catch(e){}
function introStep(){if(intro<0||!on()) return ''; if(!introT) introT=A.t+1.5; if(A.t<introT) return ''; const i=Math.floor((A.t-introT)/6); if(i>=INTRO.length){intro=-1; try{localStorage.setItem('haroe-gta-intro','1');}catch(e){} return '';} return INTRO[i];}
function help(){let t=introStep(); if(t){if(t!==helpKey){helpKey=t; $('gHelp').innerHTML=t; $('gHelp').hidden=false;} return;}
  const p=SM.player, c=A.drive&&A.drive.on()&&A.drive.pos();
  if(!c&&!p.lvl&&A.drive&&!SM.getDoing()){let best=null, bd=3.2; A.drive.cars().forEach(function(k){const d=hyp(k.x-p.x,k.z-p.z)-k.dim[0]/2; if(d<bd){bd=d; best=k;}});
    if(best) t=TOUCH?'Tap <b>CAR</b> to get in.':'Press <kbd>F</kbd> to '+(best.traffic?'pull the driver out':'get in the '+best.name)+'.';}
  if(t!==helpKey){helpKey=t; $('gHelp').innerHTML=t; $('gHelp').hidden=!t;}}
/* ---------- wasted, busted ---------- */
let big=null;
function bigShow(kind,sub){if(big===kind) return; big=kind; $('gBigT').textContent=kind; $('gBigS').textContent=sub||''; $('gBig').hidden=false; hud.classList.add('dead'); A.timeScale=0.35;
  if(A.gtaStats){if(kind==='wasted') A.gtaStats.wasted++; else A.gtaStats.busted++;} if(A.gtaSound&&A.gtaSound.sting) A.gtaSound.sting(kind);}
function bigHide(){if(!big) return; big=null; $('gBig').hidden=true; hud.classList.remove('dead'); A.timeScale=1;}
function deaths(){const G=A.game&&A.game.G, F=A.floors&&A.floors.G;
  if(G&&G.down) bigShow('wasted',G.outside?'You come to at the clinic.':'You wake up at home.'); else if(F&&F.busted) bigShow('busted','A night at the station and a fine.'); else bigHide();}

/* ---------- each frame ---------- */
let rt=0, was=false;
A.frameFns.push(function(dt){
  const o=on(); if(o!==was){was=o; hud.hidden=!o; document.body.classList.toggle('gta',o); if(!o){bigHide();}}
  if(!o) return;
  rt+=dt; if(rt>(TOUCH?0.07:0.034)){rt=0; radar();}
  bars(dt); stars(); cash(dt); area(dt); help(); deaths();
  $('gFloor').hidden=!SM.player.lvl; if(SM.player.lvl) $('gFloor').textContent=FLOOR[SM.player.lvl]||'';
});
$('gRadar').addEventListener('click',function(){if(A.gtaMap) A.gtaMap.open(true);});
let simsWas=false;
A.frameFns.push(function(){if(simsWas&&!A.simsOn){const G=A.game&&A.game.G, F=A.floors&&A.floors.G, p=SM.player;      /* out of Sims mode while wasted or busted: the timers that would end it were dropped with the rest */
    if(G&&G.down){G.down=false; G.hp=100;} if(F&&F.busted){F.busted=false; F.wanted=0;} if(p){p.p.lieT=0; p.p.act=null;} bigHide(); A.timeScale=1;}
  simsWas=A.simsOn;});
/* M opens the pause map; the round map's own M is set aside while this display is on */
window.addEventListener('keydown',function(e){if(!on()||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return; const k=e.key.toLowerCase();
  if(k==='m'&&A.gtaMap&&!A.gtaMap.on){A.gtaMap.open(true); e.preventDefault(); e.stopImmediatePropagation();}},true);
/* ---------- one of the day's tasks done: the banner GTA puts up for a mission passed, and a little money ---------- */
let passT=null;
function passed(name,reward,title){if(!on()) return; const el=$('gPass'); el.firstChild.textContent=title||'task complete'; $('gPassN').textContent=name; $('gPassR').innerHTML=reward?'+ <small>₪</small>'+reward:'';
  el.hidden=false; el.style.animation='none'; void el.offsetWidth; el.style.animation=''; clearTimeout(passT); passT=setTimeout(function(){el.hidden=true;},4200);
  if(reward&&A.floors&&A.floors.G){A.floors.G.loot+=reward;} if(A.gtaSound&&A.gtaSound.passed) A.gtaSound.passed();}
/* wasted out in the streets: you come to outside the clinic, and pay for it */
A.gtaRespawn=function(out){if(!out||!T) return false; const cl=(A.gtaPOI||[]).find(function(q){return q.k==='clinic';}); if(!cl) return false; const q=T.nearest(cl.x,cl.z); if(!q) return false;
  const p=SM.player; p.lvl=0; p.x=p.lx=q[0]; p.z=p.lz=q[1]; p.h=p.hT=Math.atan2(cl.x-q[0],cl.z-q[1]); p.room='street';      /* facing the clinic, the camera behind you in the street */ if(SM.flyToPlayer) SM.flyToPlayer();
  const F=A.floors&&A.floors.G, bill=F?Math.min(F.loot,300):0; if(F){F.loot-=bill; F.wanted=0; if(A.floors.drawHud) A.floors.drawHud();}
  SM.toast('You come to outside the Maccabi clinic.'+(bill?' The bill: ₪ '+bill+'.':'')); return true;};
A.gtaHud={on:on,big:bigShow,passed:passed};
})();
