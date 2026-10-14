/* Haroe 10 — the game on top of Sims mode. Walk with the keys (WASD or arrows, Shift to run), or tap. Tap anyone or anything you can do
   something to and it lights up, like the sofa does, with what you can do: talk, punch, push or hug people (they fall, hit back, run off,
   call the police), pet the cat and the dog, flip a table and set it back, take the rubbish down to the bins on the street.
   E does the first thing on offer; F throws a punch at whoever is closest. */
(function(){
'use strict';
const A=window.APP, R=Math.PI, scene=A.scene, SM=A.sims, D=A.D, L=D.L, KZ=D.KZ;
if(!SM) return;
const $=function(id){return document.getElementById(id);};
const v1=new THREE.Vector3(), v2=new THREE.Vector3();
const OUTL=function(){return A.LAYER_OUT||5;};
function rnd(a){return a[Math.floor(Math.random()*a.length)];}
function toast(t){SM.toast(t);}

/* ---------- sounds ---------- */
let ac=null;
function actx(){if(!ac){try{ac=new (window.AudioContext||window.webkitAudioContext)();}catch(e){ac=null;}} if(ac&&ac.state==='suspended') ac.resume(); return ac;}
function hit(vol,f){const c=actx(); if(!c) return; const n=Math.floor(c.sampleRate*0.12), b=c.createBuffer(1,n,c.sampleRate), d=b.getChannelData(0); for(let i=0;i<n;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/n,4);
  const s=c.createBufferSource(), g=c.createGain(), fl=c.createBiquadFilter(); fl.type='lowpass'; fl.frequency.value=f||900; s.buffer=b; g.gain.value=vol; s.connect(fl).connect(g).connect(c.destination); s.start();
  const o=c.createOscillator(), og=c.createGain(); o.frequency.setValueAtTime(130,c.currentTime); o.frequency.exponentialRampToValueAtTime(55,c.currentTime+0.14); og.gain.setValueAtTime(vol*0.8,c.currentTime); og.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+0.16); o.connect(og).connect(c.destination); o.start(); o.stop(c.currentTime+0.18);}
function whoosh(){const c=actx(); if(!c) return; const n=Math.floor(c.sampleRate*0.18), b=c.createBuffer(1,n,c.sampleRate), d=b.getChannelData(0); for(let i=0;i<n;i++) d[i]=(Math.random()*2-1)*Math.sin(i/n*R)*0.5;
  const s=c.createBufferSource(), fl=c.createBiquadFilter(), g=c.createGain(); fl.type='bandpass'; fl.frequency.setValueAtTime(600,c.currentTime); fl.frequency.exponentialRampToValueAtTime(1800,c.currentTime+0.18); g.gain.value=0.25; s.buffer=b; s.connect(fl).connect(g).connect(c.destination); s.start();}
function crash(){hit(0.9,500); setTimeout(function(){hit(0.5,2500);},90); setTimeout(function(){hit(0.35,3500);},200);}
function purr(sec){const c=actx(); if(!c) return; const o=c.createOscillator(), lfo=c.createOscillator(), lg=c.createGain(), g=c.createGain(), fl=c.createBiquadFilter(); o.type='sawtooth'; o.frequency.value=26; lfo.frequency.value=22; lg.gain.value=0.04;
  fl.type='lowpass'; fl.frequency.value=240; g.gain.value=0.0001; lfo.connect(lg).connect(g.gain); o.connect(fl).connect(g).connect(c.destination); g.gain.setTargetAtTime(0.05,c.currentTime,0.3); g.gain.setTargetAtTime(0.0001,c.currentTime+sec,0.4); o.start(); lfo.start(); o.stop(c.currentTime+sec+1.5); lfo.stop(c.currentTime+sec+1.5);}
function bark(){[0,0.28].forEach(function(t){const c=actx(); if(!c) return; const o=c.createOscillator(), g=c.createGain(); o.type='square'; o.frequency.setValueAtTime(420,c.currentTime+t); o.frequency.exponentialRampToValueAtTime(180,c.currentTime+t+0.12);
  g.gain.setValueAtTime(0.12,c.currentTime+t); g.gain.exponentialRampToValueAtTime(0.0001,c.currentTime+t+0.16); o.connect(g).connect(c.destination); o.start(c.currentTime+t); o.stop(c.currentTime+t+0.2);});}

/* ---------- keys: WASD or arrows walk (Shift runs), E does the first thing on offer, F punches ---------- */
const keys={}; let kbOn=false;
window.addEventListener('keydown',function(e){
  if(!A.simsOn||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return; const k=e.key.toLowerCase(); keys[k]=true; A.running=!!keys.shift;
  if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' '].indexOf(k)>=0) e.preventDefault();
  if(k==='e'&&!e.repeat){if(A.drive&&A.drive.key&&A.drive.key('e')) return; doFirst();}
  if(k==='f'&&!e.repeat){if(A.drive&&A.drive.on&&A.drive.on()) return; punchNearest();}
  if(k==='escape') select(null);
});
window.addEventListener('keyup',function(e){keys[e.key.toLowerCase()]=false; A.running=!!keys.shift;});
window.addEventListener('blur',function(){for(const k in keys) keys[k]=false; A.running=false;});
function kbFrame(){
  if(A.drive&&A.drive.on&&A.drive.on()) return;
  const st=A.sticks&&A.sticks.move; if(!st) return;
  const x=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0), y=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0);
  if(x||y){const n=Math.hypot(x,y); st.x=x/n*0.95; st.y=y/n*0.95; kbOn=true; if(sel) select(null);}
  else if(kbOn){st.x=0; st.y=0; kbOn=false;}
}

/* ---------- who and what can be picked ---------- */
/* every target: kind, the object to hit and light up, where it is, and its name */
function person(kind,o){return o;}
function streetFolk(){const SL=A.streetLife; if(!SL) return [];
  return SL.folk.filter(function(f){return f.kind!=='ride'&&f.p.g.visible;}).map(function(f){return {kind:'person',sub:'street',f:f,p:f.p,root:f.p.g,name:f.kind==='work'?'Barista':f.dog?'Man with a dog':f.kind==='sit'?'At the café':'Passer-by',lvl:0};});}
function actorsHere(){
  const out=[], lv=SM.player?SM.player.lvl:0;
  const add=function(a,name,sub){if(a&&!a.gone&&a.p.g.visible!==false&&(a.lvl||0)===lv) out.push({kind:'person',sub:sub,a:a,p:a.p,root:a.p.g,name:name||a.spec.name,lvl:a.lvl||0});};
  if(A.life&&A.life.partner) add(A.life.partner,null,'partner');
  SM.guests.forEach(function(g){add(g,null,'guest');});
  if(A.floors){for(const k in A.floors.FLATS) A.floors.FLATS[k].folk.forEach(function(a){add(a,null,'resident');}); A.floors.G.cops.forEach(function(c){add(c,c.spec.name,'cop');});}
  return out;
}
function animals(){const SL=A.streetLife, out=[]; if(!SL) return out;
  if(SL.cat) out.push({kind:'cat',root:SL.cat.g,name:'Cat',c:SL.cat,lvl:0}); if(SL.dog) out.push({kind:'dog',root:SL.dog.g,name:'Dog',c:SL.dog,lvl:0});
  pets.forEach(function(pt){if(pt.root.visible!==false&&shown(pt.root)) out.push(pt);}); return out;}
function shown(o){for(;o;o=o.parent){if(!o.visible) return false;} return true;}
const TABLES=['table','dining','lift','gate','round','nest','trunk','ctable'];
function tables(){const out=[], lv=SM.player?SM.player.lvl:0;
  if(!lv) for(const id in A.pieces){const p=A.pieces[id]; if(p.to[3]<1||!p.g.visible) continue; const cat=p.def&&p.def.cat;
    if(TABLES.indexOf(id)>=0||cat==='table'||cat==='dining') out.push({kind:'table',root:p.g,name:p.lbl||A.NAMES[id]||'Table',piece:p,lvl:0});}
  if(A.floors&&A.floors.groups[lv]) A.floors.groups[lv].traverse(function(o){if(o.userData.cat==='table'||o.userData.cat==='dining') out.push({kind:'table',root:o,name:'Table',lvl:lv});});
  return out;}
function things(){const out=[]; if(binProxy&&!(SM.player&&SM.player.lvl)) out.push({kind:'bin',root:binProxy,name:'Kitchen bin',lvl:0}); if(dump) out.push({kind:'dumpster',root:dump.g,name:'Rubbish bin',lvl:0});
  if(A.drive) A.drive.cars().forEach(function(c){out.push({kind:'car',root:c.g,name:c.name,car:c,lvl:0});}); return out;}
function all(){return streetFolk().concat(actorsHere(),animals(),tables(),things());}
function posOf(t,out){out=out||new THREE.Vector3(); if(t.a) return out.set(t.a.x,t.a.p.g.position.y,t.a.z); t.root.getWorldPosition(out); return out;}

/* ---------- lighting up what you picked: each of its parts drawn again a little larger, back faces only, in yellow ---------- */
const rimMat=new THREE.MeshBasicMaterial({color:0xF4D53A,side:THREE.BackSide});
let rims=[];
function rimOn(root){
  rimOff(); const bb=new THREE.Box3(), sz=new THREE.Vector3(), c=new THREE.Vector3();
  root.updateMatrixWorld(true);
  root.traverse(function(m){
    if(!m.isMesh||m.userData.rim||!m.visible||m.isInstancedMesh) return; const mt=[].concat(m.material)[0]; if(!mt||mt.transparent||mt.side!==THREE.FrontSide) return;
    const g=m.geometry; if(!g.boundingBox) g.computeBoundingBox(); bb.copy(g.boundingBox); bb.getSize(sz); bb.getCenter(c);
    const ws=new THREE.Vector3(); m.getWorldScale(ws); const ext=Math.max(sz.x*ws.x,sz.y*ws.y,sz.z*ws.z); if(ext<0.004) return;
    const k=1+Math.min(0.35,0.02/ext);
    const r=new THREE.Mesh(g,rimMat); r.userData.rim=true; r.userData.nc=true; r.scale.setScalar(k); r.position.copy(c).multiplyScalar(1-k); r.layers.mask=m.layers.mask; r.renderOrder=m.renderOrder;
    m.add(r); rims.push(r);});
}
function rimOff(){rims.forEach(function(r){if(r.parent) r.parent.remove(r);}); rims=[];}

/* ---------- the bar of things to do, beside what you picked ---------- */
const bar=document.createElement('div'); bar.id='tgtBar';
bar.style.cssText='position:absolute;left:0;top:0;transform:translate(-50%,-100%);z-index:4;display:none;flex-direction:column;align-items:center;gap:5px;max-width:300px;background:var(--label-bg);border:2px solid #F4D53A;border-radius:12px;padding:6px 8px;font-size:13px;text-align:center;box-shadow:0 4px 14px rgba(0,0,0,.25)';
A.stage.appendChild(bar);
const hud=document.createElement('div'); hud.id='hpHud';
hud.style.cssText='position:absolute;left:12px;bottom:calc(30px + env(safe-area-inset-bottom,0px));z-index:3;display:none;align-items:center;gap:8px;background:rgba(23,33,28,.8);color:#fff;font:700 12px/1 inherit;padding:6px 10px;border-radius:99px;pointer-events:none';
A.stage.appendChild(hud);
const big=document.createElement('div');
big.style.cssText='position:absolute;inset:0;z-index:8;display:none;align-items:center;justify-content:center;font:800 64px/1 inherit;letter-spacing:.06em;color:#e0473c;text-shadow:0 4px 24px rgba(0,0,0,.6);background:rgba(0,0,0,.35);pointer-events:none';
A.stage.appendChild(big);
let sel=null;
function select(t){
  if(t&&sel&&t.root===sel.root){return;}
  sel=t; if(t){rimOn(t.root); renderBar();} else{rimOff(); bar.style.display='none';}
}
function actsFor(t){
  const P=[];
  if(t.kind==='person'){
    if(t.sub==='partner') P.push(['Hug',function(){hug(t);}],['Kiss',function(){kiss(t);}],['Talk',function(){talk(t);}],['Punch',function(){punch(t);}],['Push',function(){push(t);}]);
    else if(t.sub==='cop') P.push(['Talk',function(){talk(t);}],['Punch',function(){punch(t);}]);
    else{if(t.f&&t.f.kind==='work') P.push(['Buy a coffee',function(){select(null); if(A.streetPlay) A.streetPlay.order();}]);
      P.push(['Talk',function(){talk(t);}],['Punch',function(){punch(t);}],['Push',function(){push(t);}],['Hug',function(){hug(t);}]);
      if(t.sub!=='guest') P.push(['Pick their pocket',function(){pickpocket(t);}]);}
  }
  else if(t.kind==='cat') P.push(['Pet the cat',function(){pet(t);}]);
  else if(t.kind==='dog') P.push(['Pet the dog',function(){pet(t);}]);
  else if(t.kind==='table') P.push(t.root.userData.flipped?['Set it back up',function(){flip(t,false);}]:['Flip the table',function(){flip(t,true);}]);
  else if(t.kind==='bin') P.push(carryingBag?['You have the bag',function(){toast('Take it down to the green bins on the street.');}]:['Take out the rubbish',function(){trashOut();}]);
  else if(t.kind==='dumpster') P.push(carryingBag?['Throw the bag in',function(){throwBag();}]:['Look inside',function(){peek();}]);
  else if(t.kind==='car') P.push(['Get in and drive',function(){select(null); A.drive.enter(t.car);}]);
  return P;
}
function renderBar(){if(!sel) return; const P=actsFor(sel); bar.innerHTML='<b>'+sel.name+'</b><span style="display:flex;gap:5px;flex-wrap:wrap;justify-content:center"></span>';
  const sp=bar.lastChild; P.forEach(function(q){const b=document.createElement('button'); b.className='fab'; b.textContent=q[0]; b.style.cssText='background:var(--green);color:var(--on);border-color:var(--green)'; b.onclick=function(ev){ev.stopPropagation(); q[1]();}; sp.appendChild(b);});
  bar.style.display='flex';}
function doFirst(){if(sel){const P=actsFor(sel); if(P.length) P[0][1](); return;} const t=nearest(2.2,function(x){return true;}); if(t){select(t);}}
function nearest(r,ok){const p=SM.player; if(!p) return null; let best=null, bd=r; all().forEach(function(t){if((t.lvl||0)!==(p.lvl||0)||!ok(t)) return; const q=posOf(t,v1), d=Math.hypot(q.x-p.x,q.z-p.z); if(d<bd){bd=d; best=t;}}); return best;}
function punchNearest(){const t=nearest(2.0,function(t){return t.kind==='person';}); if(t){select(t); punch(t);} else{const p=SM.player; p.p.act='punch'; whoosh(); SM.later(0.5,function(){p.p.act=null;});}}

/* taps: anyone or anything listed above */
const rc=new THREE.Raycaster(); rc.layers.enableAll();
A.tapHook=function(ray){
  if(A.drive&&A.drive.on&&A.drive.on()) return true;
  rc.ray.copy(ray.ray); const p=SM.player; let best=null, bd=1e9;
  all().forEach(function(t){if((t.lvl||0)!==(p.lvl||0)) return; const h=rc.intersectObject(t.root,true); for(let i=0;i<h.length;i++){if(h[i].object.userData.rim) continue; if(h[i].distance<bd){bd=h[i].distance; best=t;} break;}});
  if(best){select(best); return true;}
  if(sel){select(null);}
  return false;
};

/* ---------- people: what they do when you get to them ---------- */
function bubble(t,text,sec){
  if(t.a){t.a.say(text,sec||2.4); return;}
  if(t.f){if(A.streetPlay&&A.streetPlay.bubble) A.streetPlay.bubble(t.f,text,sec); else toast(text);} }
const held=[];
function hold(t,sec){if(t.f){if(t.f.kind==='walk'){t.f.wait=Math.max(t.f.wait,sec);} } else if(t.a){t.a.busy=true; t.a.path=[]; t.a.cb=null; t.a._hold=A.t+sec; if(held.indexOf(t.a)<0) held.push(t.a);}}
function face(t,x,z){if(t.a){t.a.hT=Math.atan2(x-t.a.x,z-t.a.z); return;}
  const S=A.street, l=S.st.worldToLocal(v2.set(x,0,z)), q=t.f.kind==='walk'?{x:t.f.x,z:t.f.z}:t.p.g.position, h=Math.atan2(l.x-q.x,l.z-q.z); t.p.g.rotation.y=h; if(t.f.kind==='walk') t.f.h=h;}
function approach(t,dist,cb){
  const p=SM.player; SM.stop(); hold(t,6);
  const q=posOf(t,v1).clone(), dx=p.x-q.x, dz=p.z-q.z, d=Math.hypot(dx,dz)||1, x=q.x+dx/d*dist, z=q.z+dz/d*dist;
  if(Math.hypot(p.x-x,p.z-z)<0.25){after();} else p.goTo(x,z,after);
  function after(){const q2=posOf(t,v1); p.hT=Math.atan2(q2.x-p.x,q2.z-p.z); face(t,p.x,p.z); cb();}
}
function state(t){const o=t.a||t.f; if(!o._g) o._g={hp:100,down:0,mood:null}; return o._g;}
function witnesses(t,r){const p=SM.player, n=all().filter(function(o){return o.kind==='person'&&o.root!==t.root&&(o.lvl||0)===(p.lvl||0)&&posOf(o,v2).distanceTo(posOf(t,v1))<r;}); return n;}
function cops(level){if(!A.floors) return; A.floors.raise(level);}
function knockDown(t,sec){
  const s=state(t), p=t.p; s.down=A.t+sec; p.act=null; p.lieY=0.0; p.lieT=1; if(t.a){t.a.release&&t.a.release(); t.a.path=[]; t.a.busy=true;} hold(t,sec+1);
  SM.later(sec,function(){p.lieT=0; p.act='hurt'; SM.later(0.8,function(){p.act=null; s.down=0; if(t.a) t.a.busy=false; afterFight(t);});});
}
function afterFight(t){
  const s=state(t), p=SM.player;
  if(t.sub==='partner'){bubble(t,rnd(['What is WRONG with you?!','I am going to my mother\'s.','Not funny.']),3); return;}
  if(t.sub==='cop'||(Math.random()<0.45&&s.hp>20)){fightBack(t); return;}
  bubble(t,rnd(['Psycho!','Leave me alone!','Help!','I am calling the police!']),2.4);
  if(t.f&&t.f.kind==='walk'){t.f.dir=-t.f.dir; t.f.speed*=2.2; SM.later(6,function(){t.f.speed/=2.2;}); t.f.wait=0;}
  else if(t.a){const a=t.a; a.busy=false; a.next=A.t+8; if(a.flat){const r=A.rooms[a.flat.rooms[0]].rs[0]; a.goTo((r[0]+r[1])/2,(r[2]+r[3])/2);}}
}
const fighters=[];
function fightBack(t){const s=state(t); if(s.fight) return; s.fight=A.t+14; s.next=A.t+0.6; fighters.push(t); bubble(t,rnd(['Oh, you want a fight?','Come here!','You will regret that!']),2); t.p.act='guard';}
function fighterStep(t,dt){
  const s=state(t), p=SM.player, q=posOf(t,v1), d=Math.hypot(q.x-p.x,q.z-p.z);
  if(A.t>s.fight||s.down||d>12||p.lvl!==(t.lvl||0)||(A.drive&&A.drive.on&&A.drive.on())){s.fight=0; t.p.act=null; if(t.a) t.a.busy=false; return false;}
  face(t,p.x,p.z);
  if(d>0.85){if(t.a){if(!t.a.path.length||A.t>(s.rp||0)){s.rp=A.t+0.7; const k=0.75/d; t.a.busy=true; t.a.goTo(q.x+(p.x-q.x)*(1-k),q.z+(p.z-q.z)*(1-k));}}
    else if(t.f){const S=A.street, l=S.st.worldToLocal(v2.set(p.x,0,p.z)), o=t.f.kind==='walk'?t.f:null; if(o){const dx=l.x-o.x, dz=l.z-o.z, dd=Math.hypot(dx,dz); o.x+=dx/dd*2.2*dt; o.z+=dz/dd*2.2*dt; t.p.g.position.x=o.x; t.p.g.position.z=o.z; t.p.walking=true; t.p.moved=2.2*dt; o.wait=1;}}}
  else if(A.t>s.next){s.next=A.t+1.0+Math.random()*0.5; t.p.act='punch'; whoosh(); SM.later(0.32,function(){
      if(Math.hypot(posOf(t,v1).x-p.x,posOf(t,v1).z-p.z)<1.1&&!G.down){hurtMe(t.sub==='cop'?25:12+Math.floor(Math.random()*8)); hit(0.6);}
      t.p.act='guard';});}
  return true;
}
/* ---------- you: health, and what happens when it runs out ---------- */
const G={hp:100,down:false,regen:0};
function drawHp(){const on=A.simsOn&&G.hp<100; hud.style.display=on?'flex':'none'; if(!on) return;
  hud.innerHTML='♥ <span style="display:inline-block;width:90px;height:8px;border-radius:4px;background:rgba(255,255,255,.2);overflow:hidden"><i style="display:block;height:100%;width:'+G.hp+'%;background:'+(G.hp>40?'#63c398':'#e0473c')+'"></i></span>';}
function hurtMe(n){const p=SM.player; G.hp=Math.max(0,G.hp-n); G.regen=A.t+6; p.p.act='hurt'; SM.later(0.45,function(){if(!G.down) p.p.act=null;}); drawHp(); if(G.hp<=0) wasted();}
function wasted(){
  if(G.down) return; G.down=true; const p=SM.player; SM.stop(); p.p.lieY=0; p.p.lieT=1; big.textContent='WASTED'; big.style.display='flex';
  fighters.forEach(function(t){state(t).fight=0; t.p.act=null;}); fighters.length=0;
  SM.later(3.2,function(){big.style.display='none'; p.p.lieT=0; G.down=false; G.hp=100; drawHp();
    p.script=null; p.path=[]; p.lvl=0; const c=SM.nearestXZ(1.5,3.2)||[SM.EX,SM.SPAWN]; p.x=c[0]; p.z=c[1]; p.h=p.hT=R; if(SM.flyToPlayer) SM.flyToPlayer();
    if(A.floors){const g=A.floors.G; const lost=g.loot; g.loot=0; if(g.wanted) {g.wanted=0;} if(A.floors.drawHud) A.floors.drawHud(); toast('You wake up at home, aching.'+(lost?' The ₪ '+lost+' is gone.':''));} else toast('You wake up at home, aching.');});
}

/* ---------- the things you can do to people ---------- */
const TALK={street:['Lovely day, isn\'t it?','Do you know where Rambam Square is?','I am from number 10.','Is the café any good?'],resident:['Hi, I am from downstairs.','Did you hear the noise last night?','Nice place you have.'],partner:['Love you.','What shall we cook tonight?','Want to watch something?'],guest:['Glad you came!','More wine?'],cop:['Evening, officer.','Is there a problem?']};
const ANS={street:['Ha, yes, finally some sun.','Rambam Square? Straight down Haroe, past Herzl.','Oh, number 10! My aunt lived there.','The cappuccino is great.'],resident:['Oh, hi! Come by sometime.','The cats again, every night.','Thanks, we just painted.'],partner:['Love you too.','Shakshuka?','Something light. A comedy.'],guest:['Thanks for having us!','Just a little.'],cop:['Evening.','Not if you behave.']};
function talk(t){const p=SM.player; approach(t,0.9,function(){const k=t.sub==='street'?'street':t.sub; const i=Math.floor(Math.random()*TALK[k].length); p.say(TALK[k][i],2.2);
  SM.later(1.8,function(){bubble(t,(ANS[k][i]||rnd(ANS[k])),2.8);});});}
function punch(t){
  const p=SM.player, s=state(t); if(s.down){toast('They are already down.'); return;}
  approach(t,0.7,function(){p.p.act='punch'; whoosh(); SM.later(0.3,function(){
    hit(0.8); t.p.act='hurt'; s.hp-=t.sub==='cop'?20:34; bubble(t,rnd(['Ow!','Ouch!','Hey!!','Argh!']),1.4);
    SM.later(0.5,function(){p.p.act='guard'; SM.later(1.2,function(){if(p.p.act==='guard') p.p.act=null;}); if(t.p.act==='hurt') t.p.act=null;});
    const w=witnesses(t,14);
    if(t.sub==='cop'){cops(3); if(!state(t).fight) fightBack(t);}
    else if(w.length&&Math.random()<0.6&&t.sub!=='partner') {cops(s.hp<=0?2:1); w.slice(0,1).forEach(function(o){bubble(o,rnd(['Police! Someone call the police!','Hey, stop that!','I saw that!']),2.4);});}
    if(s.hp<=0){knockDown(t,4.5);}
    else if(t.sub!=='partner'&&Math.random()<0.5) fightBack(t);
    else if(t.sub==='partner') bubble(t,'OW! What was that for?!',2.4);});});
}
function push(t){const p=SM.player, s=state(t); approach(t,0.65,function(){p.p.act='push'; whoosh(); SM.later(0.25,function(){hit(0.4,600); t.p.act='hurt'; bubble(t,rnd(['Hey!','Watch it!','Don\'t push me!']),1.6);
  if(Math.random()<0.35){s.hp-=10; knockDown(t,2.5);} else SM.later(0.7,function(){t.p.act=null; if(t.sub!=='partner'&&Math.random()<0.35) fightBack(t);}); SM.later(0.6,function(){p.p.act=null;});});});}
function hug(t){const p=SM.player; approach(t,0.42,function(){p.p.act='hug'; const fine=t.sub==='partner'||t.sub==='guest'||Math.random()<0.5; if(fine) t.p.act='hug';
  bubble(t,fine?rnd(['Aww.','Oh! Okay, hello!','♥']):rnd(['Uh… do I know you?','Get off me!','Personal space!']),2.2); SM.later(2.4,function(){p.p.act=null; t.p.act=null;});});}
function kiss(t){const p=SM.player; approach(t,0.38,function(){p.p.act='kiss'; t.p.act='kiss'; bubble(t,'♥',1.8); SM.later(2,function(){p.p.act=null; t.p.act=null;});});}
function pickpocket(t){const p=SM.player; const q=posOf(t,v1); SM.stop(); hold(t,4);
  let hb=t.a?t.a.h:t.p.g.rotation.y+R/2; const bx=q.x-Math.sin(hb)*0.55, bz=q.z-Math.cos(hb)*0.55;
  p.goTo(bx,bz,function(){p.hT=hb; p.p.act='reachlow'; SM.later(1.1,function(){p.p.act=null;
    if(Math.random()<0.62){const v=20+Math.floor(Math.random()*260); if(A.floors){A.floors.G.loot+=v; A.floors.drawHud(); A.floors.coin();} toast('A wallet with ₪ '+v+'. They did not feel a thing.');}
    else{bubble(t,rnd(['Hey! My wallet! Thief!','Stop! Thief!','Police!']),2.4); t.p.act='hurt'; SM.later(0.6,function(){t.p.act=null;}); cops(1); if(Math.random()<0.4) fightBack(t);}});});}

/* ---------- animals ---------- */
const pets=[];
function pet(t){const p=SM.player, c=t.c||{}; SM.stop(); const q=posOf(t,v1).clone(), dx=p.x-q.x, dz=p.z-q.z, d=Math.hypot(dx,dz)||1;
  if(c.wait!=null) c.wait=Math.max(c.wait,9);
  p.goTo(q.x+dx/d*0.55,q.z+dz/d*0.55,function(){p.hT=Math.atan2(q.x-p.x,q.z-p.z); p.p.act='pet';
    if(t.kind==='dog'){bark(); p.say('Who\'s a good boy?',1.8); if(c.sniff!=null) c.sniff=4; const SL=A.streetLife; SM.later(1.6,function(){const own=SL&&SL.folk.find(function(f){return f.dog;}); if(own&&A.streetPlay) A.streetPlay.bubble(own,'Ha, he likes you!',2.4);});}
    else{purr(3.2); heart(q); p.say(rnd(['Hello, kitty.','Psst psst psst.','Who\'s a pretty cat?']),1.8);}
    SM.later(3.2,function(){p.p.act=null;});});}
function heart(q){const el=A.tag('♥','say'); el.style.color='#e0473c'; const h=q.clone(); h.y+=0.5; let k=0; const f=function(){k++; h.y+=0.006; A.place(el,h,A.simsOn); if(k<110) requestAnimationFrame(f); else el.remove();}; f();}
/* a cat in two of the flats upstairs, asleep on the floor or sitting up */
function addPets(){if(!A.det||!A.floors) return; const F=A.floors;
  [[1,'w',-5.6,-0.8,0x2b2d30,true],[2,'o',2.2,2.6,0xd98a3a,false],[3,'w',-1.4,6.2,0xb9b2a8,false]].forEach(function(q){const lv=q[0], grp=F.groups[lv]; if(!grp||grp.userData.cat) return; grp.userData.cat=true;
    const c=A.det.solid(A.det.cat(q[4],{lie:q[5]}),'land'+lv); c.position.set(q[2],F.LV[lv].y,q[3]); c.rotation.y=Math.random()*6; c.traverse(function(m){m.userData.lvl=lv; m.userData.nonav=true;}); grp.add(c);
    pets.push({kind:'cat',root:c,name:'Cat',lvl:lv,c:{}});});}

/* ---------- tables: flip them over, set them back ---------- */
function flip(t,over){
  const p=SM.player, g=t.root; SM.stop();
  const q=posOf(t,v1).clone(), dx=q.x-p.x, dz=q.z-p.z, d=Math.hypot(dx,dz)||1;
  p.goTo(q.x-dx/d*0.95,q.z-dz/d*0.95,function(){p.hT=Math.atan2(dx,dz); p.p.act='lift';
    SM.later(0.35,function(){
      if(over){g.userData.rot0=g.rotation.clone(); g.userData.pos0=g.position.clone(); const ax=new THREE.Vector3(dz/d,0,-dx/d); const qt=new THREE.Quaternion().setFromAxisAngle(ax,-1.85);
        const q0=g.quaternion.clone(), q1=qt.multiply(q0), p0=g.position.clone(), p1=p0.clone().add(new THREE.Vector3(dx/d*0.45,0.12,dz/d*0.45)); tween(0.45,function(e){g.quaternion.copy(q0).slerp(q1,e); g.position.lerpVectors(p0,p1,e);},function(){crash(); g.userData.flipped=true; react(t); renderBar();});}
      else{const q0=g.quaternion.clone(), p0=g.position.clone(), q1=new THREE.Quaternion().setFromEuler(g.userData.rot0), p1=g.userData.pos0; tween(0.7,function(e){g.quaternion.copy(q0).slerp(q1,e); g.position.lerpVectors(p0,p1,e);},function(){g.userData.flipped=false; renderBar(); toast('Back on its feet.');});}
      SM.later(0.6,function(){p.p.act=null;});});});
}
function react(t){const w=witnesses(t,9); if(!w.length){toast('CRASH.'); return;} w.slice(0,2).forEach(function(o,i){SM.later(0.4+i*0.6,function(){bubble(o,rnd(['What is wrong with you?!','Hey! That was my grandmother\'s!','Are you crazy?!','Calm down!']),2.4);});});}
const tweens=[];
function tween(sec,step,done){tweens.push({t:0,sec:sec,step:step,done:done});}

/* ---------- rubbish: the bag from the bin under the sink, down to the green bins on the street ---------- */
let binProxy=null, carryingBag=false, bag=null, dump=null;
function makeBin(){
  if(!A.KL) return; const bx=A.KL.sx, m=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.62,0.06),new THREE.MeshBasicMaterial({visible:false})); m.position.set(bx,0.42,KZ-0.57); m.userData.nc=true; scene.add(m); binProxy=m;      // a proxy over the bin's front, to tap
  const g=new THREE.Group(); A.det&&A.det.P.sph(0.17,0x151617,0,0,0,g,1,1.3,0.9); A.det&&A.det.P.sph(0.05,0x151617,0,0.22,0,g,1,1.4,1); if(A.det) A.det.realize(g,'living'); bag=g; bag.visible=false;
}
function trashOut(){
  const p=SM.player, sx=A.KL.sx; select(null); SM.stop(); SM.setDoing('taking out the rubbish');
  p.goTo(sx,KZ-1.02,function(){p.hT=0; if(A.life) A.life.open('bin',true); p.p.act='reachlow';
    SM.later(1.0,function(){p.p.act='carry'; carryingBag=true; p.p.hand.add(bag); bag.position.set(0,-0.28,0.02); bag.visible=true; if(A.life) A.life.open('bin',false);
      SM.setDoing('carrying the rubbish'); toast('Rubbish bag in hand. Down to the green bins on the street.');
      if(dump){const s=dump.stand; SM.later(0.8,function(){p.goTo(s.x,s.z,function(){throwBag();});});}});});
}
function throwBag(){
  if(!carryingBag||!dump) return; const p=SM.player, s=dump.stand; SM.stop(); select(null);
  const go=function(){p.hT=s.h; p.p.act='reach'; tween(0.4,function(e){dump.lid.rotation.x=-1.6*e;},function(){
      bag.visible=false; carryingBag=false; p.p.act=null; hit(0.5,300); SM.later(0.5,function(){tween(0.4,function(e){dump.lid.rotation.x=-1.6*(1-e);},function(){hit(0.6,200);});});
      SM.setDoing(''); toast('Rubbish out. ✓'); if(A.life&&A.life.state&&A.life.state.done) A.life.state.done.trash=1;});};
  if(Math.hypot(p.x-s.x,p.z-s.z)>0.6) p.goTo(s.x,s.z,go); else go();
}
function peek(){const p=SM.player, s=dump.stand; select(null); p.goTo(s.x,s.z,function(){p.hT=s.h; tween(0.35,function(e){dump.lid.rotation.x=-1.4*e;},function(){p.say(rnd(['Ugh.','Pizza boxes and a broken chair.','Someone threw out a perfectly good lamp.']),2.2); SM.later(1.5,function(){tween(0.35,function(e){dump.lid.rotation.x=-1.4*(1-e);});});});});}
function makeDumpster(){        // the city's green bins, in the alley by the garden fence
  const S=A.street; if(!S||!A.det) return; const P=A.det.P, g=new THREE.Group(), green=0x2f6b45, dk=0x1f4a30;
  P.rbox(1.25,1.0,0.95,green,0,0.62,0,g,0.04); P.box(1.29,0.06,0.99,dk,0,0.14,0,g); P.box(1.28,0.05,0.12,dk,0,1.05,-0.5,g);
  [[-0.5,-0.36],[0.5,-0.36],[-0.5,0.36],[0.5,0.36]].forEach(function(q){P.cyl(0.07,0.05,0x111213,q[0],0.07,q[1],g,12).rotation.z=R/2;});
  const lid=new THREE.Group(); lid.position.set(0,1.12,-0.48); g.add(lid); P.box(1.3,0.05,1.0,dk,0,0,0.5,lid); P.box(0.3,0.04,0.06,0x111213,0,0.02,0.98,lid);
  const t=A.canvasTex(128,48,function(c){c.fillStyle='#2f6b45'; c.fillRect(0,0,128,48); c.fillStyle='#f2f2ee'; c.font='bold 15px sans-serif'; c.textAlign='center'; c.fillText('עיריית רמת גן',64,22); c.font='11px sans-serif'; c.fillText('פסולת ביתית',64,40);});
  const lab=new THREE.Mesh(new THREE.PlaneGeometry(0.6,0.22),A.MT(t,'street')); lab.position.set(0,0.75,0.476); g.add(lab);
  A.det.realize(g,'street'); g.traverse(function(m){m.layers.set(OUTL()); m.userData.nc=true;});
  const lx=2.95, lz=S.AL+3.4, w=S.st.localToWorld(new THREE.Vector3(lx,S.U,lz)); g.position.copy(w); g.rotation.y=R/2+R/2; scene.add(g);
  const st=S.st.localToWorld(new THREE.Vector3(lx-1.05,0,lz));
  dump={g:g,lid:lid,stand:{x:st.x,z:st.z,h:Math.atan2(w.x-st.x,w.z-st.z)}};
  if(A.streetBlock) A.streetBlock.push([A.LB.XF+lz-0.55,A.LB.XF+lz+0.55,A.LB.ZC-lx-0.7,A.LB.ZC-lx+0.7]);
}
makeDumpster();

/* ---------- every frame ---------- */
const bp=new THREE.Vector3();
A.frameFns.push(function(dt){
  for(let i=tweens.length-1;i>=0;i--){const w=tweens[i]; w.t=Math.min(1,w.t+dt/w.sec); const e=w.t*w.t*(3-2*w.t); w.step(e); A.touch(1); if(w.t>=1){tweens.splice(i,1); if(w.done) w.done();}}
  if(!A.simsOn||!SM.player){if(sel) select(null); hud.style.display='none'; return;}
  kbFrame();
  const p=SM.player;
  if(G.hp<100&&!G.down&&A.t>G.regen){G.hp=Math.min(100,G.hp+dt*4); drawHp();}
  for(let i=fighters.length-1;i>=0;i--) if(!fighterStep(fighters[i],dt)) fighters.splice(i,1);
  for(let i=held.length-1;i>=0;i--){const a=held[i]; if(A.t>a._hold&&!(a._g&&(a._g.down||a._g.fight))){a.busy=false; held.splice(i,1);}}      // talked to, hugged: back to what they were doing
  if(sel){
    if((sel.lvl||0)!==(p.lvl||0)||!shown(sel.root)){select(null); return;}
    posOf(sel,bp); if(sel.p&&sel.p.head) sel.p.head.getWorldPosition(bp); bp.y+=sel.kind==='person'?0.45:sel.kind==='car'?1.9:0.9;
    const c=bp.project(A.camera), ok=c.z<1&&c.z>-1; bar.style.display=ok?'flex':'none';
    if(ok){bar.style.left=((c.x+1)/2*A.stage.clientWidth)+'px'; bar.style.top=((1-c.y)/2*A.stage.clientHeight)+'px';}
    const ub=$('useBar'); if(ub) ub.hidden=true;
    if(posOf(sel,v1).distanceTo(v2.set(p.x,v1.y,p.z))>25) select(null);
  }
});
window.addEventListener('load',function(){makeBin(); setTimeout(addPets,0);});
A.game={select:select,punch:punch,push:push,hug:hug,talk:talk,pet:pet,flip:flip,trashOut:trashOut,throwBag:throwBag,all:all,G:G,addPets:addPets,dump:function(){return dump;}};
})();
