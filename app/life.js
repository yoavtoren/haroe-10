/* Haroe 10 — living in the flat: a partner at home, needs, things you can use, a day's to-do list */
(function(){
'use strict';
const A=window.APP, D=A.D, SM=A.sims, K=A.kit, ST=A.state, R=Math.PI, L=D.L, W=D.W, KX=D.KX, KZ=D.KZ, AZ=A.AZ, BA=A.BA;
const $=function(id){return document.getElementById(id);};
const me=function(){return SM.player;};
let partner=null, tok={}, mode='', pin=null, pinT=0;
const WCS=A.WC, mzW=(A.WC.z0+A.WC.z1)/2, tzB=(D.bathDoor[0]+D.bathDoor[1])/2;
const st={dishes:0,need:{energy:72,food:55,fun:60,clean:78},carry:null,outfit:0,pile:null,music:false,asleep:false,chapters:0,done:{},warned:{}};
const NEEDS=[['energy','Energy'],['food','Food'],['fun','Fun'],['clean','Hygiene']];
const GOALS=[['shoes','Take your shoes off at the door'],['coffee','Make a coffee'],['record','Put a record on'],['cook','Cook and eat together'],['dishes','Wash the dishes'],['study','Study a chapter'],
  ['vacuum','Vacuum the flat'],['clothes','Change clothes and deal with the old ones'],['massage','Give or get a massage'],['read','Read a book on the sofa'],['sleep','Go to sleep together']];
const OUTFITS={angela:[[0xd6a21e,0x3d5a80],[0x8fbd9b,0xf3ebdc],[0x9fc4d6,0x2b2f38],[0xc4673f,0x3d5a80]],yoav:[[0x2f6f52,0x2b2f38],[0xf3ebdc,0x3d5a80],[0x26386b,0x6b6f76],[0x9fc4d6,0x2b2f38]]};

/* ---------- small props ---------- */
const props=new THREE.Group(); props.userData.nc=true; A.scene.add(props);
const lam=function(c){return new THREE.MeshLambertMaterial({color:c});};
function mesh(geo,mat,parent){const m=new THREE.Mesh(geo,mat); m.castShadow=true; (parent||props).add(m); return m;}
const book=mesh(new THREE.BoxGeometry(0.03,0.2,0.14),lam(0x26386b)); book.visible=false;
const bundle=mesh(new THREE.SphereGeometry(0.11,10,8),lam(0x8a94a6)); bundle.scale.set(1.2,0.8,1); bundle.visible=false;
const pile=new THREE.Group(); props.add(pile); pile.visible=false;
[[0,0,0,0x8a94a6],[0.08,0.03,0.05,0xd6a21e],[-0.07,0.05,-0.04,0x3d5a80],[0.02,0.08,0.02,0xf3ebdc]].forEach(function(q){const m=mesh(new THREE.SphereGeometry(0.12,10,8),lam(q[3]),pile); m.position.set(q[0],q[1],q[2]); m.scale.set(1.3,0.5,1.1);});
const vac=new THREE.Group(); vac.visible=false;
(function(){const d=lam(0x2c2f33); let m=mesh(new THREE.BoxGeometry(0.05,1.0,0.05),d,vac); m.position.set(0.18,0.52,0.38); m.rotation.x=0.55;
  m=mesh(new THREE.BoxGeometry(0.26,0.06,0.14),d,vac); m.position.set(0.18,0.04,0.68); m=mesh(new THREE.CylinderGeometry(0.05,0.05,0.22,10),lam(0x7a4a8a),vac); m.position.set(0.18,0.78,0.22); m.rotation.x=0.55;})();
const plates=[0,1].map(function(){const g=new THREE.Group(); g.visible=false; props.add(g);
  let m=mesh(new THREE.CylinderGeometry(0.12,0.09,0.02,18),lam(0xfbfaf6),g); m=mesh(new THREE.SphereGeometry(0.06,10,8),lam(0xd9863e),g); m.position.y=0.03; m.scale.y=0.5; return g;});
const steam=[0,1,2,3,4].map(function(i){const m=new THREE.Mesh(new THREE.SphereGeometry(0.06,8,6),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0.25,depthWrite:false})); m.visible=false; m.userData.o=i/5; props.add(m); return m;});
const dirtMat=new THREE.MeshBasicMaterial({color:0x8a7450,transparent:true,opacity:0.6,depthWrite:false}), dirt=[];
function addDirt(x,z){
  if(dirt.length>=45) return;
  const m=new THREE.Mesh(new THREE.CircleGeometry(0.06+Math.random()*0.06,10),dirtMat); m.rotation.x=-R/2; m.position.set(x+(Math.random()-0.5)*0.2,0.019,z+(Math.random()-0.5)*0.2); m.renderOrder=1; props.add(m); dirt.push(m);
}
function cleanNear(x,z,r){for(let i=dirt.length-1;i>=0;i--){const m=dirt[i]; if(Math.hypot(m.position.x-x,m.position.z-z)<r){props.remove(m); m.geometry.dispose(); dirt.splice(i,1);}}}
const notes=[];
function note(x,z){const e=A.tag(['♪','♫','♩'][notes.length%3],'zzz'); e.style.color='#1F5A41'; notes.push({e:e,p:new THREE.Vector3(x+(Math.random()-0.5)*0.5,1.1,z+(Math.random()-0.5)*0.5),t:0});}

/* ---------- kitchen doors and drawers that open, in both colourways ---------- */
const movers=[];                 // {o, prop axis, closed, open, cur, target}
function mover(o,axis,closed,open){const m={o:o,axis:axis,closed:closed,open:open,cur:0,target:0}; movers.push(m); return m;}
const KIT={fridge:[],cab:[],drawer:[]};
function openK(k,v){KIT[k].forEach(function(m){m.target=v?1:0;});}
A.inRoom('kitchen',function(){
  const x0=KX-1.8;
  // fridge: a door on a hinge, shelves and food behind it
  const fd=A.G(); fd.position.set(W+0.71,0,KZ-0.725); A.box(0.68,1.72,0.03,0xf7f7f5,-0.34,0.875,-0.015,fd); A.box(0.02,0.5,0.03,0xdedfdc,-0.62,0.95,-0.04,fd);
  KIT.fridge.push(mover(fd,'ry',0,-1.75));
  const fin=A.G(); A.box(0.6,1.6,0.006,0xfff6d8,W+0.36,0.86,KZ-0.722,fin); [0.45,0.85,1.25].forEach(function(y){A.box(0.6,0.012,0.02,0xcfd6d8,W+0.36,y,KZ-0.728,fin);});
  [[0.2,0.52,0x5b8f4a],[0.4,0.52,0xd9463e],[0.52,0.93,0xf0d21c],[0.24,0.93,0xfbfaf6],[0.38,1.33,0x9fc4d6],[0.2,1.33,0xd9863e]].forEach(function(q){A.box(0.1,0.12,0.02,q[2],W+q[0],q[1],KZ-0.732,fin);});
  KIT.fridge.fin=fin; fin.visible=false;
  [['n',0x34373c,0xf0d21c],['abcdef',0x7b8a60,0x7b8a60]].forEach(function(v){
    const g=A.G(); g.userData.only2=v[0];
    const cd=A.G(g); cd.position.set(x0+0.325,0,KZ-0.362); A.box(0.56,0.56,0.02,v[2],0.28,1.76,0,cd); A.box(0.012,0.1,0.02,0x17181a,0.52,1.56,-0.016,cd);     // wall cabinet door
    KIT.cab.push(mover(cd,'ry',0,1.6));
    const dr=A.G(g); A.box(0.56,0.24,0.5,v[1],KX-1.5,0.48,0.36,dr); A.box(0.26,0.014,0.02,0x17181a,KX-1.5,0.52,0.618,dr);                                 // pan drawer by the hob
    KIT.drawer.push(mover(dr,'pz',0,0.32));
    KIT[v[0]]=g;
  });
  const cin=A.G(); A.box(0.5,0.5,0.006,0x2a2c2e,x0+0.61,1.76,KZ-0.33,cin); [0,1,2,3].forEach(function(i){A.cyl(0.11,0.012,0xfbfaf6,x0+0.5,1.5+i*0.016,KZ-0.2,cin,16);}); [0,1,2].forEach(function(i){A.cyl(0.035,0.09,0x9fc4d6,x0+0.72+i*0.09,1.54,KZ-0.2,cin,12);});
  KIT.cab.fin=cin; cin.visible=false;
});
const pan=new THREE.Group(); props.add(pan); pan.visible=false;
(function(){let m=mesh(new THREE.CylinderGeometry(0.13,0.11,0.05,20),lam(0x2a2c2e),pan); m=mesh(new THREE.BoxGeometry(0.2,0.02,0.03),lam(0x2a2c2e),pan); m.position.set(0.22,0.01,0);})();
const sinkPile=new THREE.Group(); props.add(sinkPile); sinkPile.position.set(KX-1.05,0.93,KZ-0.32);
const dishMesh=[0,1,2,3,4,5,6,7].map(function(i){const m=i%4===3?mesh(new THREE.CylinderGeometry(0.11,0.1,0.045,16),lam(0x2a2c2e),sinkPile):i%4===2?mesh(new THREE.CylinderGeometry(0.035,0.03,0.09,12),lam(0x9fc4d6),sinkPile):mesh(new THREE.CylinderGeometry(0.1,0.08,0.014,16),lam(0xfbfaf6),sinkPile);
  m.position.set((i%3-1)*0.13,0.02+Math.floor(i/3)*0.03,(i%2?0.06:-0.06)); m.rotation.z=(i%2?0.25:-0.15); m.visible=false; return m;});
function dishes(n){st.dishes=Math.max(0,Math.min(8,n)); dishMesh.forEach(function(m,i){m.visible=i<st.dishes;});}
const food=mesh(new THREE.BoxGeometry(0.12,0.1,0.1),lam(0x5b8f4a)); food.visible=false;
const plateH=mesh(new THREE.CylinderGeometry(0.1,0.08,0.014,16),lam(0xfbfaf6)); plateH.visible=false;
const heap=new THREE.Group(); props.add(heap); heap.visible=false;
[[0,0,0],[0.07,0.03,0.04],[-0.05,0.05,-0.03]].forEach(function(q,i){const m=mesh(new THREE.SphereGeometry(0.11,10,8),lam(0xffffff),heap); m.position.set(q[0],q[1],q[2]); m.scale.set(1.3,0.45,1.1); m.userData.i=i;});

/* ---------- toilets: a lid and a seat on a hinge, each remembered up or down ---------- */
const WCs={};
function toilet(id,hx,z,room,door){
  const t={id:id,x:hx-0.25,z:z,door:door,lid:null,seat:null,seatUp:false};
  A.inRoom(room,function(){
    const sp=A.G(); sp.position.set(hx,0.6,z); A.box(0.42,0.018,0.34,0xf4f4f1,-0.21,0,0,sp); A.box(0.3,0.02,0.22,0x3c4043,-0.21,-0.004,0,sp).visible=false;
    const lp=A.G(); lp.position.set(hx,0.62,z); A.box(0.43,0.02,0.35,0xffffff,-0.215,0,0,lp);
    t.seat=mover(sp,'rz',0,-1.5); t.lid=mover(lp,'rz',0,-1.62);
  });
  WCs[id]=t; return t;
}
toilet('guest',WCS.x1-0.2,mzW,'wc','wc'); toilet('bath',BA.x1-0.03,tzB,'bath','bath');

/* ---------- music: a soft generated loop, no files ---------- */
let ac=null, musicTimer=null, bar=0;
function musicOn(v){
  st.music=v;
  if(!v){if(musicTimer){clearInterval(musicTimer); musicTimer=null;} return;}
  try{ac=ac||new (window.AudioContext||window.webkitAudioContext)(); if(ac.state==='suspended') ac.resume();}catch(e){ac=null;}
  const CH=[[220,261.6,329.6],[174.6,220,261.6],[196,246.9,293.7],[164.8,196,246.9]];
  if(musicTimer) clearInterval(musicTimer);
  musicTimer=setInterval(function(){
    if(!ac) return; const ch=CH[(bar>>2)%4], f=ch[bar%3]*(bar%4===3?2:1), t=ac.currentTime, o=ac.createOscillator(), g=ac.createGain();
    o.type='triangle'; o.frequency.value=f; g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(0.05,t+0.03); g.gain.exponentialRampToValueAtTime(0.0008,t+0.9);
    o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t+1); bar++;
  },420);
}

/* ---------- helpers ---------- */
function begin(m){SM.stop(); tok={}; mode=m||''; return tok;}
function later(sec,fn){const t=tok; SM.later(sec,function(){if(t===tok) fn();},t);}
function goal(k){if(st.done[k]) return; st.done[k]=1; renderGoals(); SM.toast('Done: '+GOALS.filter(function(g){return g[0]===k;})[0][1]+'.');
  if(Object.keys(st.done).length===GOALS.length) SM.later(3.5,function(){SM.toast('A full day at Haroe 10. Good night.');},st);}
function add(k,v){st.need[k]=Math.max(0,Math.min(100,st.need[k]+v));}
function walk(x,z,h,cb){const t=tok, p=me(); p.goTo(x,z,function(){if(t!==tok) return; if(h!=null) p.hT=h; if(cb) cb();});}
function front(id,dist){const p=A.pieces[id]; if(!p||p.to[3]<1) return null; const f=p.to[2], c=Math.cos(f), s=Math.sin(f);
  return {x:p.to[0],z:p.to[1],sx:p.to[0]+c*dist,sz:p.to[1]-s*dist,h:Math.atan2(-c,s),obj:p.g};}
function firstPiece(ids,dist){for(let i=0;i<ids.length;i++){const q=front(ids[i],dist); if(q) return q;} return null;}
function cancel(){              // whatever was going on stops here
  SM.cancel(tok); tok={}; mode='';
  const p=me(); if(p){p.p.act=null; if(vac.parent===p.p.g) p.p.g.remove(vac);} vac.visible=false; if(A.vacuumMesh) A.vacuumMesh.visible=true;
  if(partner){partner.p.act=null; partner.busy=false;}
  steam.forEach(function(m){m.visible=false;}); plates.forEach(function(g){g.visible=false;});
  if(st.asleep){st.asleep=false; if(p) p.sleep(false); if(partner) partner.sleep(false);}
  if(p){p.speed=1.7; if(p.p.isNude){p.p.nude(false); p.ver=-1;}}
  heap.visible=false; ['fridge','cab','drawer'].forEach(function(k){openK(k,false);}); if(pan.parent===props&&st.carry!=='pan'&&mode!=='cookdone') pan.visible=false;
  if(st.carry==='food'||st.carry==='plate'||st.carry==='pan') carry(null);
  ['wc','bath'].forEach(function(d){const q=A.door(d); if(q) q.force=null;});
}
SM.onStop=cancel;
function carry(v){st.carry=v; const p=me(); [book,bundle,food,plateH].forEach(function(m){m.visible=false;}); if(pan.parent!==props){props.add(pan); pan.visible=false;} if(!p||!v) return;
  const m=v==='book'?book:v==='food'?food:v==='plate'?plateH:v==='pan'?pan:bundle; p.p.hand.add(m); m.position.set(0,-0.3,0.06); m.visible=true;}

/* =====================================================================
   Things to do
   ===================================================================== */
const DO={
  shoes:function(){
    const t=begin(); SM.setDoing('at the door');
    walk(SM.EX+0.35,L-0.8,0,function(){const p=me(), off=p.p.shoesOn; p.p.shoes(!off); p.ver=-1; SM.setDoing('');
      SM.toast(off?'Shoes off. The floor stays clean.':'Shoes on.'); if(off) goal('shoes'); hud();});
  },
  coffee:function(){
    begin('coffee'); SM.setDoing('getting a cup');
    cupboard('plate',function(){SM.ACT.coffee(); tok={}; mode='coffee'; later(10,function(){add('energy',18); dishes(st.dishes+1); goal('coffee');});});
  },
  cook:function(){
    begin('cook'); SM.setDoing('getting food from the fridge');
    fridge(function(){
      SM.setDoing('getting a pan');
      walk(KX-1.5,1.08,R,function(){openK('drawer',true); later(1.3,function(){
        carry('pan'); openK('drawer',false);
        walk(KX-0.38,0.95,R,function(){
          const p=me(); carry(null); props.add(pan); pan.position.set(KX-0.38,0.96,0.3); pan.rotation.set(0,0.6,0); pan.visible=true;
          p.p.act='cook'; SM.setDoing('cooking'); steam.forEach(function(m){m.visible=true;});
          if(partner&&!partner.busy) partner.say(['Smells good!','What are you making?','I am starving.'][Math.floor(Math.random()*3)],3);
          later(7,function(){p.p.act=null; steam.forEach(function(m){m.visible=false;}); SM.setDoing('getting plates');
            cupboard('plate',function(){carry(null); SM.toast('Lunch is ready.'); eat();});});
        });});});
    });
  },
  snack:function(){
    begin('snack'); SM.setDoing('getting a plate');
    cupboard('plate',function(){fridge(function(){
      SM.setDoing('having a snack'); me().p.act='eat';
      later(3.5,function(){me().p.act=null; carry(null); add('food',25); dishes(st.dishes+1); me().say('Mmm.'); SM.setDoing(''); SM.toast('The plate went in the sink.');});});});
  },
  wash:function(){
    if(!st.dishes){SM.toast('The sink is empty.'); return;}
    begin('wash'); SM.setDoing('going to the sink');
    walk(KX-1.05,KZ-1.02,0,function(){me().p.act='cook'; SM.setDoing('washing the dishes');
      (function one(){later(1.1,function(){dishes(st.dishes-1); if(st.dishes>0) one(); else{me().p.act=null; SM.setDoing(''); SM.toast('Sink is clear.'); goal('dishes');}});})();});
  },
  study:function(){
    begin('study'); const s=SM.firstFree(['desk2','desk1','desk3']); if(!s){SM.toast('No free desk.'); return;}
    SM.setDoing('going to study');
    me().sitOn(s,function(){me().p.act='study'; SM.setDoing('studying'); (function chapter(){later(10,function(){st.chapters++; add('fun',-6); SM.toast('Chapter '+st.chapters+' done.'); goal('study'); chapter();});})();});
  },
  tv:function(show){
    begin('tv'); K.tvShow=show||'netflix'; A.set('tv',1); SM.setDoing('going to watch '+(K.tvShow==='football'?'the match':'Netflix'));
    const s=SM.firstFree(['sofaM','sofaL','sofaR']); if(!s) return;
    me().sitOn(s,function(){SM.setDoing(K.tvShow==='football'?'watching football together':'watching Netflix together');});
    if(partner){const q=SM.firstFree(['sofaR','sofaL','sofaM'].filter(function(i){return i!==s.id;})); if(q){partner.busy=true; partner.sitOn(q,function(){partner.say(K.tvShow==='football'?'Come on!':'What are we watching?');});}}
  },
  tvOff:function(){A.set('tv',0); SM.refresh(); hud();},
  toilet:function(id,standing){
    const t=WCs[id], p=me(), tk=begin('toilet'), fem=SM.who==='angela';
    SM.setDoing('going to the toilet');
    walk(t.x-0.62,t.z,R/2,function(){
      A.door(t.door).force=0; A.set('L:'+(id==='guest'?'wc':'bath'),1); SM.renderRooms();
      t.lid.target=1; t.seat.target=standing?1:0; if(!standing&&t.seatUp&&fem) p.say('Who left the seat up?',2.5); t.seatUp=!!standing;
      later(1.0,function(){
        const fin=function(){SM.toast('Flush.'); if(fem){t.lid.target=0;} else if(standing&&partner) SM.later(6,function(){partner.say('Seat down, please!',3);},st); A.door(t.door).force=null; p.release(); add('clean',-4); SM.setDoing(''); hud();};
        if(standing){p.slide={fx:p.x,fz:p.z,tx:t.x-0.42,tz:t.z,t:0,dur:0.4,then:null}; SM.setDoing('at the toilet'); later(5,fin);}
        else{p.settle({id:'wc_'+id,x:t.x-0.02,z:t.z,y:0.6,h:-R/2,type:'sit'},null); SM.setDoing('on the toilet'); later(6,fin);}
      });
    });
  },
  shower:function(where){
    begin('shower'); const p=me(), sp=A.showerSpot; SM.setDoing('heading for the shower');
    walk(sp.ax,sp.az,null,function(){
      A.door('bath').force=0; A.set('L:bath',1); SM.renderRooms(); SM.setDoing('undressing');
      later(1.2,function(){
        const o=OUTFITS[SM.who][st.outfit]; heap.children.forEach(function(m){m.material.color.set(m.userData.i===1?o[1]:o[0]);});
        if(where==='toilet'){WCs.bath.lid.target=0; WCs.bath.seat.target=0; heap.position.set(BA.x1-0.3,0.66,tzB);} else heap.position.set(BA.x0+0.42,0.9,BA.z0+0.5);
        heap.visible=true; p.p.nude(true); p.ver=-1; SM.fx.on(true);
        p.slide={fx:p.x,fz:p.z,tx:sp.x,tz:sp.z,t:0,dur:0.6,then:null}; p.hT=R; SM.setDoing('in the shower');
        later(8,function(){
          p.slide={fx:p.x,fz:p.z,tx:sp.ax,tz:sp.az,t:0,dur:0.6,then:null}; SM.setDoing('getting dressed');
          later(1.6,function(){SM.fx.on(false); p.p.nude(false); p.ver=-1; heap.visible=false; A.door('bath').force=null; st.need.clean=100; SM.setDoing(''); SM.toast('Fresh and clean.'); hud();});
        });
      });
    });
  },
  flop:function(){
    begin('flop'); const s=SM.seatBy('sofaLie'), p=me(); if(!s) return;
    if(partner&&partner.seat&&partner.seat.id.indexOf('sofa')===0) roam(true);
    p.speed=2.9; SM.setDoing('running to the sofa');
    p.sitOn(s,function(){p.speed=1.7; SM.setDoing('flopped on the sofa'); p.say('Aaah.');});
  },
  massage:function(giving){
    if(!partner) return; begin('massage');
    const giver=giving?me():partner, taker=giving?partner:me(), a=SM.seatBy('sofaL'), b=SM.seatBy('sofaM'); if(!a||!b) return;
    if(a.occ&&a.occ!==giver&&a.occ!==taker||b.occ&&b.occ!==giver&&b.occ!==taker){SM.toast('The sofa is taken.'); return;}
    partner.busy=true; partner.release(); me().release(); SM.setDoing(giving?'giving a massage':'getting a massage');
    let n=0; const ready=function(){if(++n<2) return; giver.hT=R/2-0.85; taker.hT=R/2-0.85; giver.p.act='massage'; taker.say('Mmm…',3);
      later(9,function(){giver.p.act=null; giver.hT=taker.hT=R/2; add('fun',giving?14:30); add('energy',giving?-4:18); taker.say('Thank you ♥',2.5); goal('massage'); partner.busy=false; SM.setDoing('sitting on the sofa');});};
    taker.sitOn(b,ready); giver.sitOn(a,ready);
  },
  sleep:function(){
    begin('sleep'); const p=me(), a=SM.seatBy('bedR'), b=SM.seatBy('bedL'); if(!a) return;
    SM.setEvening(true); for(const k in A.rooms) if(!A.rooms[k].ext) A.set('L:'+k,k==='bed2'?1:0); A.set('tv',0); musicOn(false); SM.renderRooms();
    SM.setDoing('going to bed');
    if(partner&&b){partner.busy=true; partner.sitOn(b,function(){partner.sleep(true);});}
    p.sitOn(a,function(){A.set('L:bed2',0); SM.renderRooms(); st.asleep=true; p.sleep(true); SM.setDoing('asleep together'); goal('sleep'); hud();});
  },
  wake:function(){begin(); SM.setEvening(false); ['kitchen','bed1','bed2'].forEach(function(w){A.set('S:'+w,1);}); SM.renderRooms(); me().release(); if(partner){partner.release(); partner.say('Good morning.');} SM.setDoing(''); SM.toast('Good morning.'); hud();},
  wardrobe:function(){
    begin(); SM.setDoing('at the wardrobe');
    walk(D.NX+1.0,-1.27,-R/2,function(){later(2.2,function(){
      const p=me(), list=OUTFITS[SM.who]; st.outfit=(st.outfit+1)%list.length; p.p.setClothes(list[st.outfit][0],list[st.outfit][1]); p.ver=-1;
      carry('clothes'); SM.setDoing(''); SM.toast('Changed. Drop the old clothes on the armchair, or take them to the washing machine.'); hud();});});
  },
  drop:function(){
    const s=SM.seatBy('nook')||SM.seatBy('armA')||SM.seatBy('desk3'); if(!s||st.carry!=='clothes') return;
    begin(); SM.setDoing('carrying clothes');
    walk(s.x+Math.sin(s.h)*0.65,s.z+Math.cos(s.h)*0.65,s.h+R,function(){carry(null); st.pile=s.id; pile.position.set(s.x,s.y+0.08,s.z); pile.visible=true; SM.setDoing(''); goal('clothes'); me().say('Later.'); hud();});
  },
  laundry:function(){
    begin(); SM.setDoing('doing the laundry');
    const fin=function(){walk(BA.x0+0.55,BA.z0+1.0,R,function(){later(2,function(){carry(null); st.pile=null; pile.visible=false; SM.setDoing(''); SM.toast('Laundry is on.'); goal('clothes'); hud();});});};
    if(st.pile&&st.carry!=='clothes'){const s=SM.seatBy(st.pile); if(s){walk(s.x+Math.sin(s.h)*0.65,s.z+Math.cos(s.h)*0.65,null,function(){pile.visible=false; st.pile=null; carry('clothes'); fin();}); return;}}
    fin();
  },
  book:function(){
    const q=shelf(); if(!q) return; begin(); SM.setDoing(st.carry==='book'?'putting the book back':'choosing a book');
    walk(q.sx,q.sz,q.h,function(){later(1.2,function(){carry(st.carry==='book'?null:'book'); SM.setDoing(''); hud();});});
  },
  read:function(){
    if(st.carry!=='book'){const q=shelf(); if(!q) return; begin('read'); SM.setDoing('choosing a book'); walk(q.sx,q.sz,q.h,function(){later(1.2,function(){carry('book'); sitRead();});}); return;}
    begin('read'); sitRead();
  },
  record:function(){
    const q=front('music',0.7)||front('station',0.75); if(!q) return; begin(); SM.setDoing('at the record player');
    walk(q.sx,q.sz,q.h,function(){later(1,function(){musicOn(!st.music); SM.setDoing(''); SM.toast(st.music?'Record on.':'Record off.'); if(st.music){goal('record'); if(partner) partner.say('Love this one.');} hud();});});
  },
  vacuum:function(){
    begin('vacuum'); const p=me(); SM.setDoing('getting the vacuum');
    walk(D.BLK-0.45,L-0.6,0.6,function(){
      if(A.vacuumMesh) A.vacuumMesh.visible=false; p.p.g.add(vac); vac.visible=true; p.p.act='vacuum'; SM.setDoing('vacuuming');
      const pts=dirt.map(function(m){return [m.position.x,m.position.z];});
      [[0.9,4.9],[2.2,2.2],[1.2,1.4],[W+1.2,1.4],[1.9,3.3]].forEach(function(q){pts.push(q);});
      const route=[]; let cx=p.x, cz=p.z;
      while(pts.length&&route.length<26){let bi=0, bd=1e9; pts.forEach(function(q,i){const d=Math.hypot(q[0]-cx,q[1]-cz); if(d<bd){bd=d; bi=i;}}); const q=pts.splice(bi,1)[0]; if(bd>0.35) route.push(q); cx=q[0]; cz=q[1];}
      (function next(){
        if(!route.length){walk(D.BLK-0.45,L-0.6,0.6,function(){p.p.act=null; p.p.g.remove(vac); vac.visible=false; if(A.vacuumMesh) A.vacuumMesh.visible=true; dirt.slice().forEach(function(m){cleanNear(m.position.x,m.position.z,0.1);}); SM.setDoing(''); SM.toast('The flat is clean.'); goal('vacuum'); mode='';}); return;}
        const q=route.shift(); walk(q[0],q[1],null,function(){p.p.act='vacuum'; next();});
        p.p.act='vacuum';
      })();
    });
  }
};
function shelf(){return firstPiece(['kbench','towerB','towerA','benchB','tvOld'],0.75)||(ST.design!=='n'?{sx:D.BX-0.8,sz:-0.75,h:R/2,obj:[D.BX-0.31,D.BX-0.01,0,0.82,-1.25,-0.25]}:null);}
function sitRead(){const s=SM.firstFree(['sofaM','sofaR','sofaL','nook']); if(!s) return; SM.setDoing('finding a seat');
  me().sitOn(s,function(){me().p.act='read'; SM.setDoing('reading'); later(9,function(){goal('read');});});}
function fridge(cb){              // walk to the fridge, open it, take something out, close it
  walk(W+0.36,KZ-1.32,0,function(){openK('fridge',true); later(1.5,function(){food.material.color.set([0x5b8f4a,0xd9463e,0xf0d21c][Math.floor(Math.random()*3)]); carry('food'); openK('fridge',false); later(0.5,cb);});});
}
function cupboard(what,cb){        // open the wall cabinet over the sink and take a plate or a cup
  walk(KX-1.2,KZ-1.02,0,function(){openK('cab',true); later(1.3,function(){carry(what); openK('cab',false); later(0.4,cb);});});
}
function eat(){
  const n=ST.design==='n', ids=n?['chairB','chairA']:['gc1','gc2'];
  mode='eat'; if(!n&&ST.table===0) A.setTable(2);
  const t=tok;
  SM.afterLayout(function(){
    if(t!==tok) return;
    const a=SM.seatBy(ids[0]), b=SM.seatBy(ids[1]); if(!a) return;
    SM.setDoing('sitting down to eat');
    [a,b].forEach(function(s,i){if(!s) return; const g=plates[i]; g.position.set(s.x+Math.sin(s.h)*0.36,0.78,s.z+Math.cos(s.h)*0.36); g.visible=true;});
    if(partner&&b){partner.busy=true; partner.sitOn(b,function(){partner.p.act='eat';});}
    me().sitOn(a,function(){me().p.act='eat'; SM.setDoing('eating together');
      later(8,function(){add('food',100); me().p.act=null; if(partner){partner.p.act=null; partner.busy=false; partner.say('That was great.');} plates.forEach(function(g){g.visible=false;}); pan.visible=false; dishes(st.dishes+3); goal('cook'); SM.setDoing('sitting at the table'); SM.toast('Plates and the pan are in the sink.');});});
  });
}

/* ---------- things in the flat you can walk up to and use ---------- */
function items(){
  const out=[], n=ST.design==='n', p=me();
  const add=function(name,q,acts,box){if(q) out.push({name:name,x:q.x==null?q.sx:q.x,z:q.z==null?q.sz:q.z,sx:q.sx,sz:q.sz,h:q.h,acts:acts,box:box||q.obj||null});};
  const around=function(s,rx,rz,y1){return [s.x-rx,s.x+rx,0,y1,s.z-rz,s.z+rz];}, en=D.entrance;
  add('Front door and shoes',{x:SM.EX+0.4,z:L-0.3,sx:SM.EX+0.35,sz:L-0.8,h:0},[[p.p.shoesOn?'Take shoes off':'Put shoes on',DO.shoes]],[en[0],en[1],0,2.05,L-0.08,L]);
  add('Cooktop',{x:KX-0.38,z:0.3,sx:KX-0.38,sz:0.95,h:R},[['Cook a meal',DO.cook]],[KX-0.68,KX-0.08,0.1,0.96,0.02,0.62]);
  add('Fridge',{x:W+0.36,z:KZ-0.36,sx:W+0.36,sz:KZ-1.32,h:0},[['Grab a snack',DO.snack]],[W+0.01,W+0.71,0,1.75,KZ-0.72,KZ]);
  add('Espresso machine',ST.design==='b'?front('cart',0.65):n?front('station',0.65):{x:KX-1.5,z:KZ-0.3,sx:KX-1.5,sz:1.9,h:0},[['Make a coffee',DO.coffee]],(ST.design==='b'||n)?null:[KX-1.72,KX-1.15,0.92,1.34,KZ-0.5,KZ-0.12]);
  add('Television',firstPiece(['tvOld','kbench','benchB','benchA'],1.1),[['Netflix',function(){DO.tv('netflix');}],['Football',function(){DO.tv('football');}]].concat(A.goal('tv')>0.5?[['Turn it off',DO.tvOff]]:[]));
  add('Sink',{x:KX-1.05,z:KZ-0.32,sx:KX-1.05,sz:KZ-1.02,h:0},[[st.dishes?'Wash the dishes ('+st.dishes+')':'Sink is clean',DO.wash]],[KX-1.36,KX-0.74,0.86,1.0,KZ-0.56,KZ-0.08]);
  const tacts=function(id){return SM.who==='angela'?[['Use the toilet',function(){DO.toilet(id,false);}]]:[['Pee standing up',function(){DO.toilet(id,true);}],['Sit down',function(){DO.toilet(id,false);}]];};
  add('Guest toilet',{x:WCS.x1-0.45,z:mzW,sx:WCS.x1-1.07,sz:mzW,h:R/2},tacts('guest'),[WCS.x1-0.7,WCS.x1-0.2,0,0.7,mzW-0.2,mzW+0.2]);
  add('Toilet',{x:BA.x1-0.28,z:tzB,sx:BA.x1-0.9,sz:tzB,h:R/2},tacts('bath'),[BA.x1-0.53,BA.x1-0.03,0,0.7,tzB-0.2,tzB+0.2]);
  add('Sofa',front('sofa',1.0),[['Flop down',DO.flop],['Give a massage',function(){DO.massage(true);}],['Ask for a massage',function(){DO.massage(false);}]]);
  add('Record player',front('music',0.7),[[st.music?'Stop the record':'Play a record',DO.record]]);
  add('Bookshelf',shelf(),[[st.carry==='book'?'Put the book back':'Take a book',DO.book],['Read on the sofa',DO.read]]);
  add('Wardrobe',{x:D.NX+0.25,z:-1.27,sx:D.NX+1.0,sz:-1.27,h:-R/2},[['Change clothes',DO.wardrobe]],[D.NX,D.NX+0.51,0,1.9,-1.86,-0.68]);
  const ch=SM.seatBy('nook')||SM.seatBy('armA')||SM.seatBy('desk3');
  if(ch&&(st.carry==='clothes'||st.pile)) add(st.pile?'Clothes on the chair':'Armchair',{x:ch.x,z:ch.z,sx:ch.x+Math.sin(ch.h)*0.65,sz:ch.z+Math.cos(ch.h)*0.65,h:ch.h+R},st.pile?[['Take them to the wash',DO.laundry]]:[['Drop the clothes here',DO.drop]],around(ch,0.45,0.45,1.0));
  add('Washing machine',{x:BA.x0+0.5,z:BA.z0+0.33,sx:BA.x0+0.55,sz:BA.z0+1.0,h:R},[['Do the laundry',DO.laundry]],[BA.x0+0.2,BA.x0+0.8,0,0.86,BA.z0+0.03,BA.z0+0.63]);
  add('Vacuum cleaner',{x:D.BLK-0.1,z:L-0.14,sx:D.BLK-0.45,sz:L-0.6,h:0.6},[['Vacuum the flat',DO.vacuum]],A.vacuumMesh);
  const dk=SM.seatBy('desk2')||SM.seatBy('desk1'); if(dk) add('Desk',{x:dk.x,z:dk.z,sx:dk.x,sz:dk.z,h:dk.h},[['Study',DO.study]],around(dk,0.7,0.7,1.2));
  const bd=SM.seatBy('bedR'); if(bd) add('Bed',{x:bd.x,z:bd.z,sx:bd.x,sz:bd.z,h:bd.h},[[st.asleep?'Wake up':'Go to sleep together',st.asleep?DO.wake:DO.sleep]],[bd.x-1.15,bd.x+0.85,0,0.62,bd.z-1.1,bd.z+0.4]);
  add('Shower',{x:A.showerSpot.x,z:A.showerSpot.z,sx:A.showerSpot.ax,sz:A.showerSpot.az,h:0},[['Shower, clothes on the washer',function(){DO.shower('washer');}],['Shower, clothes on the toilet',function(){DO.shower('toilet');}]],[BA.x1-0.9,BA.x1,0,2.0,BA.z0,BA.z0+0.95]);
  return out;
}
const tp=new THREE.Vector3();
let focus=null;
/* A thin yellow line round the thing you are looking at: each of its parts is redrawn slightly larger,
   back faces only, so just a rim shows round the silhouette. */
const hl=new THREE.Group(); hl.visible=false; hl.userData.nc=true; A.scene.add(hl);
const hlMat=new THREE.MeshBasicMaterial({color:0xF2CF1D,side:THREE.BackSide}), RIM=0.011;
const bx=new THREE.Box3(), tb=new THREE.Box3(), labelAt=new THREE.Vector3(), cv=new THREE.Vector3(), sv=new THREE.Vector3(), mA=new THREE.Matrix4(), mB=new THREE.Matrix4();
let hlKey=null, hlSrc=[];
function solidMesh(o){if(!o.isMesh||!o.geometry||o.userData.floor) return false; const m=Array.isArray(o.material)?o.material[0]:o.material; return !(m.transparent&&!m.depthWrite)&&m.side!==THREE.BackSide;}
function gather(o,out,box){
  if(!o.visible||o===hl||o===props||(me()&&o===me().p.g.parent)) return;
  if(solidMesh(o)){
    if(!o.geometry.boundingBox) o.geometry.computeBoundingBox();
    tb.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld);
    if(!box||(box.containsBox(tb)&&tb.max.y-tb.min.y+tb.max.x-tb.min.x+tb.max.z-tb.min.z>0.02)) out.push(o);
  }
  for(let i=0;i<o.children.length;i++) gather(o.children[i],out,box);
}
function outline(b,key){
  if(!b){hl.visible=false; hlKey=null; return false;}
  if(key!==hlKey){                                 // new target: collect its parts once
    hlKey=key; hlSrc=[]; while(hl.children.length) hl.remove(hl.children[0]);
    if(b.isObject3D){b.updateMatrixWorld(true); gather(b,hlSrc,null);}
    else{A.scene.updateMatrixWorld(true); const q=new THREE.Box3(new THREE.Vector3(b[0]-0.04,b[2]-0.04,b[4]-0.04),new THREE.Vector3(b[1]+0.04,b[3]+0.04,b[5]+0.04)); gather(A.scene,hlSrc,q);}
    hlSrc.forEach(function(o){const m=new THREE.Mesh(o.geometry,hlMat); m.matrixAutoUpdate=false; m.frustumCulled=false; hl.add(m);});
  }
  if(!hlSrc.length){hl.visible=false; return false;}
  bx.makeEmpty();
  hlSrc.forEach(function(o,i){
    const g=o.geometry.boundingBox; g.getCenter(cv); g.getSize(sv);
    mA.makeTranslation(cv.x,cv.y,cv.z); mB.makeScale(1+2*RIM/Math.max(0.02,sv.x),1+2*RIM/Math.max(0.02,sv.y),1+2*RIM/Math.max(0.02,sv.z)); mA.multiply(mB);
    mB.makeTranslation(-cv.x,-cv.y,-cv.z); mA.multiply(mB);
    hl.children[i].matrix.multiplyMatrices(o.matrixWorld,mA); hl.children[i].matrixWorldNeedsUpdate=true;
    tb.copy(g).applyMatrix4(o.matrixWorld); bx.union(tb);
  });
  labelAt.set((bx.min.x+bx.max.x)/2,bx.max.y+0.1,(bx.min.z+bx.max.z)/2); hl.visible=true; return true;
}
A.labelFns.push(function(){            // the action label floats on the outlined thing
  const bar=$('useBar'); if(bar.hidden) return;
  tp.copy(labelAt).project(A.camera); const w=A.stage.clientWidth, h=A.stage.clientHeight;
  let x=(tp.x+1)/2*w, y=(1-tp.y)/2*h; if(tp.z>1){x=w/2; y=h*0.3;}
  bar.style.left=Math.max(90,Math.min(w-90,x))+'px'; bar.style.top=Math.max(70,Math.min(h-20,y))+'px';
});
function hud(){
  const bar=$('useBar'), p=me();
  if(!A.simsOn||!p){bar.hidden=true; hl.visible=false; return;}
  if(!st.asleep&&(SM.getDoing()||p.path.length&&!pin)){bar.hidden=true; hl.visible=false; focus=null; return;}      // busy or walking: no prompt in the way
  let best=pin, bs=1e9; const f=SM.view(), fx=Math.sin(f), fz=Math.cos(f), list=items();
  if(pin){best=null; list.forEach(function(it){if(it.name===pin.name) best=it;}); if(A.t-pinT>7||!best) pin=best=null;}
  if(!best) list.forEach(function(it){
    const keep=focus&&focus.name===it.name;                   // hold on to the current thing a little, so it does not flicker
    const dx=it.x-p.x, dz=it.z-p.z, d=Math.hypot(dx,dz); if(d>(keep?2.3:1.9)) return;
    const c=d<0.05?1:(dx*fx+dz*fz)/d; if(d>1.0&&c<(keep?0:0.35)) return;
    const s=d-0.9*c-(keep?0.5:0); if(s<bs){bs=s; best=it;}
  });
  if(st.asleep){const b0=SM.seatBy('bedR'); best={name:'Asleep',acts:[['Wake up',DO.wake]],box:b0?[b0.x-1.15,b0.x+0.85,0,0.62,b0.z-1.1,b0.z+0.4]:null};}
  focus=best;
  if(!best){bar.hidden=true; outline(null); return;}
  if(!outline(best.box,best.name+ST.design)) labelAt.set(best.x==null?p.x:best.x,1.5,best.z==null?p.z:best.z);
  const key=best.name+'|'+best.acts.map(function(a){return a[0];}).join('|');
  if(bar.dataset.k!==key){bar.dataset.k=key; $('useName').textContent=best.name; $('useBtns').innerHTML=best.acts.map(function(a,i){return '<button class="fab" data-i="'+i+'">'+a[0]+'</button>';}).join('');}
  bar.hidden=false;
}
$('useBtns').onclick=function(e){const b=e.target.closest('button'); if(b&&focus&&focus.acts[+b.dataset.i]){pin=null; focus.acts[+b.dataset.i][1]();}};
function tap(ray){               // tap a thing in the room: walk up to it
  let best=null, bd=1e9; items().forEach(function(it){if(it.sx==null) return; tp.set(it.x,0.8,it.z); const d=ray.distanceToPoint(tp); if(d<0.42&&d<bd){bd=d; best=it;}});
  if(!best||st.asleep) return false;
  begin(); pin=best; pinT=A.t+30; walk(best.sx,best.sz,best.h,function(){pinT=A.t; hud();}); return true;
}

/* ---------- panel ---------- */
function renderNeeds(){
  $('needs').innerHTML=NEEDS.map(function(n){const v=st.need[n[0]]; return '<span>'+n[1]+'</span><i><b class="'+(v<25?'low':'')+'" style="width:'+v.toFixed(0)+'%"></b></i>';}).join('')+
    '<span>Clean floor</span><i><b class="'+(dirt.length>18?'low':'')+'" style="width:'+Math.max(0,100-dirt.length*2.2).toFixed(0)+'%"></b></i>';
}
function renderGoals(){$('goals').innerHTML=GOALS.map(function(g){return '<li class="'+(st.done[g[0]]?'done':'')+'">'+(st.done[g[0]]?'✓ ':'○ ')+g[1]+'</li>';}).join('');}
const PANEL=[['flop','Flop on the sofa'],['netflix','Watch Netflix'],['football','Watch football'],['cook','Cook and eat'],['snack','Snack from the fridge'],['wash','Wash the dishes'],['coffee','Make a coffee'],['shower','Take a shower'],['toilet','Guest toilet'],['study','Study'],['record','Play a record'],['read','Read a book'],
  ['wardrobe','Change clothes'],['vacuum','Vacuum the flat'],['mgive','Give a massage'],['mget','Ask for a massage'],['shoes','Shoes on / off'],['sleep','Go to sleep together']];
$('lifeActs').innerHTML=PANEL.map(function(a){return '<button class="btn" data-a="'+a[0]+'">'+a[1]+'</button>';}).join('');
$('lifeActs').onclick=function(e){const b=e.target.closest('button'); if(!b) return; const a=b.dataset.a;
  if(st.asleep&&a!=='sleep'){DO.wake(); return;}
  if(a==='netflix'||a==='football') DO.tv(a); else if(a==='shower') DO.shower('washer'); else if(a==='toilet') DO.toilet('guest',SM.who==='yoav');
  else if(a==='mgive') DO.massage(true); else if(a==='mget') DO.massage(false); else if(a==='sleep'&&st.asleep) DO.wake(); else if(DO[a]) DO[a]();};

/* ---------- the partner: lives here, potters about, joins in ---------- */
const LINES=['Coffee?','I like it here.','Did you water the plants?','Come sit with me.','Nice light today.','What shall we eat?'];
function spawnPartner(){
  if(partner){partner.remove(); const i=SM.extras.indexOf(partner); if(i>=0) SM.extras.splice(i,1);}
  partner=new SM.Actor(SM.LOOKS[SM.who==='angela'?'yoav':'angela']); partner.p.shoes(false);
  const c=SM.nearestXZ(2.0,1.7)||[2,1.7]; partner.x=c[0]; partner.z=c[1]; partner.h=partner.hT=0; partner.next=3; partner.busy=false; SM.extras.push(partner);
}
function roam(now){
  if(!partner||partner.busy&&!now) return;
  const ids=['sofaR','nook','desk1','armA','benchA','sofaL'].filter(function(i){const s=SM.seatBy(i); return s&&!s.occ;});
  partner.busy=false; partner.next=A.t+25+Math.random()*25;
  if(Math.random()<0.25||!ids.length){const c=SM.nearestXZ(W+1.2,1.5); if(c) partner.goTo(c[0],c[1],function(){partner.hT=R;}); return;}
  partner.sitOn(SM.seatBy(ids[Math.floor(Math.random()*ids.length)]));
}

A.frameFns.push(function(dt){          // doors, drawers and lids ease open and shut; runs in every mode
  for(let i=0;i<movers.length;i++){const m=movers[i]; if(m.cur!==m.target){const d=m.target-m.cur, q=dt*2.6; m.cur=Math.abs(d)<=q?m.target:m.cur+Math.sign(d)*q;
    const v=m.closed+(m.open-m.closed)*m.cur; if(m.axis==='ry') m.o.rotation.y=v; else if(m.axis==='rz') m.o.rotation.z=v; else m.o.position.z=v; A.touch(2);}}
  KIT.fridge.fin.visible=KIT.fridge[0].cur>0.05; KIT.cab.fin.visible=KIT.cab[0].cur>0.05||KIT.cab[1].cur>0.05;
  KIT.n.visible=ST.design==='n'; KIT.abcdef.visible=ST.design!=='n';
});

/* ---------- frame ---------- */
let acc=0, lastRoom=null, lastDrop=[0,0], sayT=20;
A.frameFns.push(function(dt,t){
  if(!A.simsOn||!me()) return;
  const p=me();
  if(partner){partner.update(dt); if(!partner.busy&&!st.asleep&&t>partner.next) roam(); if(!partner.busy&&t>sayT&&!st.asleep){sayT=t+30+Math.random()*30; partner.say(LINES[Math.floor(Math.random()*LINES.length)],3);}}
  // shoes and sand
  if(p.room!==lastRoom){
    if(p.room==='hall'&&lastRoom&&!p.p.shoesOn){p.p.shoes(true); p.ver=-1;}
    if(lastRoom==='hall'&&p.p.shoesOn&&!st.warned.shoes){st.warned.shoes=1; SM.toast('Shoes still on. Take them off at the door, or you will walk sand through the flat.');}
    lastRoom=p.room;
  }
  if(p.p.shoesOn&&p.room!=='hall'&&Math.hypot(p.x-lastDrop[0],p.z-lastDrop[1])>0.75){lastDrop=[p.x,p.z]; addDirt(p.x,p.z);}
  if(mode==='vacuum'&&vac.visible) cleanNear(p.x+Math.sin(p.h)*0.5,p.z+Math.cos(p.h)*0.5,0.6);
  // needs
  const n=st.need, doing=SM.getDoing();
  add('energy',-dt*(st.asleep?-6:mode==='flop'?-1.2:0.16)); add('food',-dt*0.22); add('clean',-dt*(doing==='in the shower'?-12:0.12));
  add('fun',-dt*(mode==='tv'||mode==='read'||mode==='flop'||st.music?-1.1:mode==='study'||mode==='vacuum'?0.5:0.2));
  NEEDS.forEach(function(q){if(n[q[0]]<18&&!st.warned[q[0]]){st.warned[q[0]]=1; p.say({energy:'I need to lie down.',food:'I am hungry.',fun:'I am bored.',clean:'I need a shower.'}[q[0]],3);} if(n[q[0]]>40) st.warned[q[0]]=0;});
  // props
  if(steam[0].visible) steam.forEach(function(m){const k=(t*0.5+m.userData.o)%1; m.position.set(KX-0.38+Math.sin(m.userData.o*9+t)*0.08,1.0+k*0.8,0.3); m.scale.setScalar(0.6+k*1.4); m.material.opacity=0.3*(1-k);});
  if(st.music&&Math.random()<dt*1.6){const q=front('music',0)||front('station',0); if(q) note(q.x,q.z);}
  for(let i=notes.length-1;i>=0;i--){const o=notes[i]; o.t+=dt; o.p.y+=dt*0.35; A.place(o.e,o.p,o.t<2.2&&A.simsOn); if(o.t>2.4){o.e.remove(); notes.splice(i,1);}}
  acc+=dt; if(acc>0.2){acc=0; hud(); renderNeeds(); A.touch(1);}
});

/* ---------- hooks from Sims mode ---------- */
A.life={
  enter:function(){
    if(!partner||partner.gone) spawnPartner();
    const p=me(); if(p&&!st.started){st.started=1; p.p.shoes(true); SM.toast('You just came home. Tap things to use them, or pick from the list.');}
    lastRoom=null; renderNeeds(); renderGoals(); hud();
  },
  reset:function(){SM.cancel(tok); tok={}; mode=''; cancelProps(); hl.visible=false; if(partner&&!partner.gone){partner.release(); partner.path=[]; partner.next=A.t+4; partner.busy=false;} pin=null; $('useBar').hidden=!A.simsOn; if(!A.simsOn) musicOn(false);},
  respawn:function(){const sh=true; spawnPartner(); carry(st.carry); if(me()) me().p.shoes(sh); hud();},
  tap:tap, state:st, DO:DO, get partner(){return partner;}, dirt:dirt
};
function cancelProps(){steam.forEach(function(m){m.visible=false;}); plates.forEach(function(g){g.visible=false;}); vac.visible=false; if(A.vacuumMesh) A.vacuumMesh.visible=true; st.asleep=false;}
})();
