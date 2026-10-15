/* Haroe 10 — people in the streets, as in GTA. Hurt someone, or let the police open fire, and the people round about scream and run, a few
   cower where they are, and one may take out a phone and call the police (stop them, or in a few seconds you are wanted). Walk or run
   into someone and you bump them: they stagger aside and tell you what they think. Some jog past, some walk talking on the phone, some
   stand outside the shops smoking. And people farther than a few metres off are drawn without their fingers, eyelashes and the other
   small parts nobody could see from there, so the streets can be fuller. */
(function(){
'use strict';
const A=window.APP, SM=A.sims, R=Math.PI;
if(!SM) return;
function hyp(a,b){return Math.hypot(a,b);}
function rnd(a){return a[Math.floor(Math.random()*a.length)];}
function folk(){return A.townFolk?A.townFolk():[];}

/* ---------- the small parts of a person, hidden from far off ---------- */
const NEAR=24;
function small(p){if(p._small) return p._small; const out=[]; p.g.traverse(function(m){if(!m.isMesh||m.isInstancedMesh) return; const g=m.geometry; if(!g.boundingSphere) g.computeBoundingSphere();
  const s=Math.max(Math.abs(m.scale.x),Math.abs(m.scale.y),Math.abs(m.scale.z)); if(g.boundingSphere.radius*s<0.035) out.push(m);}); p._small=out; return out;}
let lodT=0;
function lod(dt){lodT-=dt; if(lodT>0) return; lodT=0.25; const c=A.camera.position, pl=SM.player; if(!pl) return; const root=pl.p.g.parent; if(!root) return;
  for(let i=0;i<root.children.length;i++){const g=root.children[i]; if(!g.visible) continue; const far=Math.hypot(g.position.x-c.x,g.position.z-c.z)>NEAR;
    if(g.userData.far===far) continue; g.userData.far=far; const pp=g.userData.person; if(!pp) continue;
    small(pp).forEach(function(m){if(far){if(m.visible){m.visible=false; m.userData.lodHid=true;}} else if(m.userData.lodHid){m.visible=true; m.userData.lodHid=false;}});}}      // only what was shown goes, and only that comes back
/* the person behind each group: people.js does not say, so find it once from the actors we know */
function tagPeople(){const all=[SM.player].concat(SM.guests||[],SM.extras||[],folk(),A.gtaCops?A.gtaCops.list():[]);
  all.forEach(function(a){if(a&&a.p&&!a.p.g.userData.person) a.p.g.userData.person=a.p;});}

/* ---------- what they are doing: jogging, on the phone, smoking outside a shop ---------- */
function role(a){if(a._role) return; const r=Math.random(); a._role=r<0.14?'jog':r<0.28?'phone':r<0.36?'smoke':'walk';
  if(a.waiting||a.cafe){a._role='sit'; return;}
  if(a._role==='jog'){a.speed=2.7+Math.random()*0.6; if(a.p.act==='carry') a.p.act=null;}
  else if(a._role==='phone'&&!a.p.act) a.p.act='phone';
  else if(a._role==='smoke'){a.busy=true; a.path=[]; a.cb=null; a.p.act='smoke'; a._until=A.t+18+Math.random()*25; a.hT=Math.random()*2*R;}}
function roles(){folk().forEach(function(a){role(a); if(a._role==='smoke'&&a._until&&A.t>a._until&&!a._flee){a._until=0; a.busy=false; a.p.act=null; a._role='walk';}});}

/* ---------- bumping into people ---------- */
const BUMP=['Hey! Watch it!','Excuse me?!','Look where you are going!','Ouch! Nu?!','Rude!'];
function bumps(){const p=SM.player; if(!p||p.lvl||p.driving||!p.manual) return; const sp=p.v||0;
  folk().concat(A.gtaCops?A.gtaCops.list():[]).forEach(function(a){if(a.gone||(a._g&&a._g.down)||a.seat||A.t<(a._bump||0)) return; const dx=a.x-p.x, dz=a.z-p.z, d=hyp(dx,dz); if(d>0.62||d<0.01) return;
    a._bump=A.t+1.2; const push=A.running?0.9:0.5, tx=a.x+dx/d*push, tz=a.z+dz/d*push; if(A.nav.isFree(tx,tz)) a.slide={fx:a.x,fz:a.z,tx:tx,tz:tz,t:0,dur:0.32,then:null};
    a.hT=Math.atan2(-dx,-dz); if(Math.random()<0.75) a.say(rnd(BUMP),1.6); if(A.running&&A.gtaShake) A.gtaShake(0.05);
    if(A.running&&Math.random()<0.3&&A.game&&A.game.knock&&!a.cop){const t={a:a,p:a.p,root:a.p.g,kind:'person'}; A.game.knock(t,1.6);}});}      // flat out, you might knock them over

/* ---------- panic ---------- */
const SCREAM=['Aaah!','Help!','Run!','He is crazy!','Somebody help!','Oh my God!'], CALL=['Hello, police? Someone is attacking people on ','Police? Come quick, there is a madman on ','I want to report a fight on '];
function street(x,z){const q=A.town&&A.town.roadNear?A.town.roadNear(x,z):null; return q&&q.d<10&&q.r.name?q.r.name:'Haroe Street';}
A.gtaPanic=function(x,z,r,sev){const G=A.floors&&A.floors.G, cops=A.gtaCops&&A.gtaCops.foot&&A.gtaCops.foot.length;
  let caller=!(G&&G.wanted)&&!cops&&sev<2;      // with the police already here, nobody bothers to call
  let n=0;
  folk().forEach(function(a){if(a.gone||(a._g&&a._g.down)) return; const d=hyp(a.x-x,a.z-z); if(d>r||A.t<(a._flee||0)-6) return; const lag=0.08*(n++);      // a moment apart: each finds its own way out
    if(a.waiting||a.cafe||a.p.sitT>0){a.waiting=false; a.cafe=null; a.stop=null; a.p.sitT=0;}
    const k=Math.random();
    if(caller&&k<0.3&&d>4){caller=false; call(a); return;}
    if(k<0.12&&d<12){a.busy=true; a.path=[]; a.cb=null; a.p.act='cower'; a._flee=A.t+5; a.hT=Math.atan2(x-a.x,z-a.z); SM.later(3+Math.random()*2,function(){if(a.p.act==='cower') a.p.act=null; a.busy=false; flee(a,x,z);},a); if(Math.random()<0.6) a.say(rnd(SCREAM),1.8); return;}
    a._flee=A.t+12; SM.later(lag,function(){flee(a,x,z);},a); if(Math.random()<0.45) a.say(rnd(SCREAM),1.8);});
  if(A.gtaSound&&A.gtaSound.scream&&Math.random()<0.8) A.gtaSound.scream(x,z);};
function flee(a,x,z){const dx=a.x-x, dz=a.z-z, d=hyp(dx,dz)||1, T=A.town; let tx=a.x+dx/d*32, tz=a.z+dz/d*32; const q=T&&T.nearest?T.nearest(tx,tz):null; if(q){tx=q[0]; tz=q[1];}
  a._flee=A.t+12; a.busy=true; a.release(); a.speed=3.3+Math.random()*0.8; a.p.act=null; if(T) T.quick=true; try{a.goTo(tx,tz,function(){a.busy=false; a.speed=a._role==='jog'?2.9:1.1;});} finally{if(T) T.quick=false;} SM.later(14,function(){if(a._flee&&A.t>a._flee){a.busy=false;}},a);}
function call(a){a.busy=true; a.path=[]; a.cb=null; a.p.act='phone'; const m=SM.player; a.hT=Math.atan2(m.x-a.x,m.z-a.z); a._flee=A.t+8;
  SM.later(1.2,function(){if(a.gone||(a._g&&a._g.down)) return; a.say(rnd(CALL)+street(a.x,a.z)+'!',3.2);},a);
  SM.later(5,function(){a.busy=false; a.p.act=null; if(a.gone||(a._g&&a._g.down)) return; const G=A.floors&&A.floors.G; if(G&&!G.wanted&&A.floors.raise){A.floors.raise(1); if(SM.toast) SM.toast('Someone called the police.');} flee(a,m.x,m.z);},a);}
/* someone out here got hurt: everyone round about reacts */
function hurts(){folk().forEach(function(a){const s=a._g; if(!s) return; const hp=s.hp; if(a._hp0==null){a._hp0=hp; return;} if(hp<a._hp0-1){A.gtaPanic(a.x,a.z,22,1);} a._hp0=hp;});}

A.frameFns.push(function(dt){
  if(!A.simsOn||!SM.player) return;
  tagPeople(); lod(dt); roles(); bumps(); hurts();
});
})();
