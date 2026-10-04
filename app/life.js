/* Haroe 10 — living in the flat: a partner at home, needs, things you can use, a day's to-do list */
(function(){
'use strict';
const A=window.APP, D=A.D, SM=A.sims, K=A.kit, ST=A.state, R=Math.PI, L=D.L, W=D.W, KX=D.KX, KZ=D.KZ, AZ=A.AZ, BA=A.BA;
const $=function(id){return document.getElementById(id);};
const me=function(){return SM.player;};
let partner=null, tok={}, mode='', pin=null, pinT=0;
const st={need:{energy:72,food:55,fun:60,clean:78},carry:null,outfit:0,pile:null,music:false,asleep:false,chapters:0,done:{},warned:{}};
const NEEDS=[['energy','Energy'],['food','Food'],['fun','Fun'],['clean','Hygiene']];
const GOALS=[['shoes','Take your shoes off at the door'],['coffee','Make a coffee'],['record','Put a record on'],['cook','Cook and eat together'],['study','Study a chapter'],
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
  if(p) p.speed=1.7;
}
SM.onStop=cancel;
function carry(v){st.carry=v; const p=me(); book.visible=false; bundle.visible=false; if(!p||!v) return;
  const m=v==='book'?book:bundle; p.p.hand.add(m); m.position.set(0,-0.3,0.06); m.visible=true;}

/* =====================================================================
   Things to do
   ===================================================================== */
const DO={
  shoes:function(){
    const t=begin(); SM.setDoing('at the door');
    walk(SM.EX+0.35,L-0.8,0,function(){const p=me(), off=p.p.shoesOn; p.p.shoes(!off); p.ver=-1; SM.setDoing('');
      SM.toast(off?'Shoes off. The floor stays clean.':'Shoes on.'); if(off) goal('shoes'); hud();});
  },
  coffee:function(){SM.ACT.coffee(); mode='coffee'; tok={}; later(9,function(){add('energy',18); goal('coffee');});},
  cook:function(){
    begin('cook'); SM.setDoing('going to cook');
    walk(KX-0.38,0.95,R,function(){
      const p=me(); p.p.act='cook'; SM.setDoing('cooking'); steam.forEach(function(m){m.visible=true;});
      if(partner&&!partner.busy) partner.say(['Smells good!','What are you making?','I am starving.'][Math.floor(Math.random()*3)],3);
      later(7,function(){p.p.act=null; steam.forEach(function(m){m.visible=false;}); SM.toast('Lunch is ready. Setting the table.'); eat();});
    });
  },
  snack:function(){begin(); SM.setDoing('at the fridge'); walk(W+0.36,KZ-1.15,0,function(){later(2,function(){add('food',22); me().say('Mmm.'); SM.setDoing('');});});},
  study:function(){
    begin('study'); const s=SM.firstFree(['desk2','desk1','desk3']); if(!s){SM.toast('No free desk.'); return;}
    SM.setDoing('going to study');
    me().sitOn(s,function(){me().p.act='study'; SM.setDoing('studying'); (function chapter(){later(10,function(){st.chapters++; add('fun',-6); SM.toast('Chapter '+st.chapters+' done.'); goal('study'); chapter();});})();});
  },
  tv:function(){
    begin('tv'); K.tvShow='day'; A.set('tv',1); SM.setDoing('going to watch TV');
    const s=SM.firstFree(['sofaM','sofaL','sofaR']); if(!s) return;
    me().sitOn(s,function(){SM.setDoing('watching TV together');});
    if(partner){const q=SM.firstFree(['sofaR','sofaL','sofaM'].filter(function(i){return i!==s.id;})); if(q){partner.busy=true; partner.sitOn(q,function(){partner.say('What are we watching?');});}}
  },
  tvToggle:function(){SM.ACT.tv(); hud();},
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
      later(8,function(){add('food',100); me().p.act=null; if(partner){partner.p.act=null; partner.busy=false; partner.say('That was great.');} plates.forEach(function(g){g.visible=false;}); goal('cook'); SM.setDoing('sitting at the table');});});
  });
}

/* ---------- things in the flat you can walk up to and use ---------- */
function items(){
  const out=[], n=ST.design==='n', p=me();
  const add=function(name,q,acts,box){if(q) out.push({name:name,x:q.x==null?q.sx:q.x,z:q.z==null?q.sz:q.z,sx:q.sx,sz:q.sz,h:q.h,acts:acts,box:box||q.obj||null});};
  const around=function(s,rx,rz,y1){return [s.x-rx,s.x+rx,0,y1,s.z-rz,s.z+rz];}, en=D.entrance;
  add('Front door and shoes',{x:SM.EX+0.4,z:L-0.3,sx:SM.EX+0.35,sz:L-0.8,h:0},[[p.p.shoesOn?'Take shoes off':'Put shoes on',DO.shoes]],[en[0],en[1],0,2.05,L-0.08,L]);
  add('Cooktop',{x:KX-0.38,z:0.3,sx:KX-0.38,sz:0.95,h:R},[['Cook a meal',DO.cook]],[KX-0.68,KX-0.08,0.1,0.96,0.02,0.62]);
  add('Fridge',{x:W+0.36,z:KZ-0.36,sx:W+0.36,sz:KZ-1.15,h:0},[['Grab a snack',DO.snack]],[W+0.01,W+0.71,0,1.75,KZ-0.72,KZ]);
  add('Espresso machine',ST.design==='b'?front('cart',0.65):n?front('station',0.65):{x:KX-1.5,z:KZ-0.3,sx:KX-1.5,sz:1.9,h:0},[['Make a coffee',DO.coffee]],(ST.design==='b'||n)?null:[KX-1.72,KX-1.15,0.92,1.34,KZ-0.5,KZ-0.12]);
  add('Television',firstPiece(['tvOld','kbench','benchB','benchA'],1.1),[[A.goal('tv')>0.5?'Turn it off':'Turn it on',DO.tvToggle],['Watch together',DO.tv]]);
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
  add('Shower',{x:A.showerSpot.x,z:A.showerSpot.z,sx:A.showerSpot.ax,sz:A.showerSpot.az,h:0},[['Take a shower',function(){SM.ACT.shower(); mode='shower';}]],[BA.x1-0.9,BA.x1,0,2.0,BA.z0,BA.z0+0.95]);
  return out;
}
const tp=new THREE.Vector3();
let focus=null;
/* yellow outline round whatever you are looking at: twelve bars along the edges of its bounding box */
const hl=new THREE.Group(); hl.visible=false; hl.userData.nc=true; A.scene.add(hl);
const hlMat=new THREE.MeshBasicMaterial({color:0xE8C91A,depthTest:false,transparent:true,opacity:0.95}), bars=[];
for(let i=0;i<12;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),hlMat); m.renderOrder=9; hl.add(m); bars.push(m);}
const bx=new THREE.Box3(), tb=new THREE.Box3(), labelAt=new THREE.Vector3();
function grow(o){if(!o.visible||o.userData.nc) return; if(o.isMesh&&o.geometry){if(!o.geometry.boundingBox) o.geometry.computeBoundingBox(); tb.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld); bx.union(tb);} for(let i=0;i<o.children.length;i++) grow(o.children[i]);}
function outline(b){
  if(!b){hl.visible=false; return false;}
  if(b.isObject3D){bx.makeEmpty(); b.updateMatrixWorld(true); grow(b); if(bx.isEmpty()){hl.visible=false; return false;}}
  else bx.set(new THREE.Vector3(b[0],b[2],b[4]),new THREE.Vector3(b[1],b[3],b[5]));
  bx.expandByScalar(0.03); const a=bx.min, c=bx.max, t=0.022, sx=c.x-a.x, sy=c.y-a.y, sz=c.z-a.z, mx=(a.x+c.x)/2, my=(a.y+c.y)/2, mz=(a.z+c.z)/2; let i=0;
  [a.y,c.y].forEach(function(y){[a.z,c.z].forEach(function(z){bars[i].position.set(mx,y,z); bars[i++].scale.set(sx+t,t,t);});});
  [a.x,c.x].forEach(function(x){[a.z,c.z].forEach(function(z){bars[i].position.set(x,my,z); bars[i++].scale.set(t,sy+t,t);});});
  [a.x,c.x].forEach(function(x){[a.y,c.y].forEach(function(y){bars[i].position.set(x,y,mz); bars[i++].scale.set(t,t,sz+t);});});
  labelAt.set(mx,c.y+0.12,mz); hl.visible=true; return true;
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
  if(!best){bar.hidden=true; hl.visible=false; return;}
  if(!outline(best.box)) labelAt.set(best.x==null?p.x:best.x,1.5,best.z==null?p.z:best.z);
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
const PANEL=[['flop','Flop on the sofa'],['tv','Watch TV together'],['cook','Cook and eat'],['study','Study'],['record','Play a record'],['read','Read a book'],
  ['wardrobe','Change clothes'],['vacuum','Vacuum the flat'],['mgive','Give a massage'],['mget','Ask for a massage'],['shoes','Shoes on / off'],['sleep','Go to sleep together']];
$('lifeActs').innerHTML=PANEL.map(function(a){return '<button class="btn" data-a="'+a[0]+'">'+a[1]+'</button>';}).join('');
$('lifeActs').onclick=function(e){const b=e.target.closest('button'); if(!b) return; const a=b.dataset.a;
  if(st.asleep&&a!=='sleep'){DO.wake(); return;}
  if(a==='mgive') DO.massage(true); else if(a==='mget') DO.massage(false); else if(a==='sleep'&&st.asleep) DO.wake(); else if(DO[a]) DO[a]();};

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
