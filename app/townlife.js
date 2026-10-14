/* Haroe 10 — people in the streets round us: out walking, some with their shopping, now and then two of them stopped on the pavement to
   talk. Anyone you can talk to, push, hug, rob or pick a fight with, as on our own street (game.js); hurt, they hurry off. They walk the
   pavements near you; the ones you leave behind walk on out of the picture, and new ones come round the corner ahead. */
(function(){
'use strict';
const A=window.APP, T=A.town, SM=A.sims, R=Math.PI;
if(!T||!SM) return;
const MAX=('ontouchstart' in window)||navigator.maxTouchPoints>0?8:16;
const NAMES=[['Ronit',1],['Moshe',0],['Dana',1],['Avi',0],['Shira',1],['Yossi',0],['Tamar',1],['Eli',0],['Noa',1],['Itzik',0],['Galit',1],['Uri',0],['Miri',1],['Benny',0],['Sarit',1],['Kobi',0],['Orly',1],['Dudu',0],['Yael',1],['Amir',0],['Liat',1],['Shlomo',0],['Hila',1],['Ofer',0]];
const SKIN=[0xf1c9a5,0xe0ac85,0xc68e66,0x9c6a48,0x6e4a32,0xf3d2b6,0xe6b592], HAIR=[0x1b1512,0x2e1c14,0x5a3a22,0x8a6a48,0xd8c08a,0x3a2a20,0x2a1e17];
const TOPS=[0xd84a4a,0x2f6f52,0xf2f2ee,0x26386b,0xe8b81e,0x9fc4d6,0x6b4a8a,0x2b2d30,0xe58ab0,0xc8a27a,0x8fbd9b,0xc4673f], PANTS=[0x2b2f38,0x3d5a80,0x6b6f76,0xd8c9a6,0x1d1f21,0x4a5a3a,0xf3ebdc];
let n=0;
function spec(){const r=A.rng(7000+(n++)*31), pick=function(a){return a[Math.floor(r()*a.length)];}, nm=pick(NAMES), she=!!nm[1], old=r()<0.18;
  return {id:'tw'+n,name:nm[0],h:she?1.56+r()*0.12:1.66+r()*0.18,skin:pick(SKIN),hair:old?0xb9b2a8:pick(HAIR),eyes:pick([0x5a3a22,0x3a2a1a,0x4a6a4a,0x4a6a8a]),
    style:she?pick(['long','bun','curly','long']):pick(['short','bald','short']),beard:!she&&r()<0.35?pick(['goatee','full']):undefined,top:pick(TOPS),pants:pick(PANTS),shoes:pick([0x2b2b2b,0xf1efe8,0x6b4a33]),pj:0x9db7dd,slim:she,sleeves:r()<0.4};}
/* a spot on a pavement, between dmin and dmax from x,z */
function pave(x0,z0,dmin,dmax){for(let k=0;k<30;k++){const rd=T.net[Math.floor(Math.random()*T.net.length)], j=1+Math.floor(Math.random()*(rd.p.length-1)), a=rd.p[j-1], b=rd.p[j], l=Math.hypot(b[0]-a[0],b[1]-a[1]); if(l<4) continue;
  const t=Math.random(), sd=Math.random()<0.5?1:-1, off=rd.w[0]/2+rd.w[1]*0.55, nx=-(b[1]-a[1])/l*sd, nz=(b[0]-a[0])/l*sd, x=a[0]+(b[0]-a[0])*t+nx*off, z=a[1]+(b[1]-a[1])*t+nz*off, d=Math.hypot(x-x0,z-z0);
  if(d<dmin||d>dmax||T.kept(x,z)||!T.free(x,z,0.35)) continue; return [x,z];} return null;}
const folk=[];
function spawn(px,pz){const q=pave(px,pz,24,90); if(!q) return; const a=new SM.Actor(spec()); a.lvl=0; a.x=a.lx=q[0]; a.z=a.lz=q[1]; a.speed=0.95+Math.random()*0.45; a.town=true; a.next=A.t+Math.random()*2; a.p.act=Math.random()<0.22?'carry':null;
  a.h=a.hT=Math.random()*2*R; folk.push(a);}
/* waiting for the bus on the bench of a shelter; when it comes they get up, walk to its door and get on */
function spawnWaiter(px,pz){const st=(T.stops||[]).filter(function(s){const d=Math.hypot(s.x-px,s.z-pz); return d<85&&folk.filter(function(a){return a.stop===s;}).length<3;}); if(!st.length) return false;
  const s=st[Math.floor(Math.random()*st.length)], k=folk.filter(function(a){return a.stop===s;}).length, f=[Math.sin(s.h),Math.cos(s.h)], u=[f[1],-f[0]], o=(k-1)*0.75;
  const a=new SM.Actor(spec()); a.lvl=0; a.x=a.lx=s.x-f[0]*0.36+u[0]*o; a.z=a.lz=s.z-f[1]*0.36+u[1]*o; a.h=a.hT=s.h; a.p.seatY=0.47; a.p.sitT=a.p.sit=1; a.stop=s; a.waiting=true; a.busy=true; a.town=true;
  a.p.act=['read',null,'drink',null][Math.floor(Math.random()*4)]; folk.push(a); return true;}
A.busAt=function(s,bus){const f=bus.fwd(); folk.forEach(function(a){if(a.stop!==s||!a.waiting) return; a.waiting=false; a.busy=false; a.p.act=null;
  const dx=bus.x+f[0]*(bus.dim[0]/2-0.8)-a.x, dz=bus.z+f[1]*(bus.dim[0]/2-0.8)-a.z, d=Math.hypot(dx,dz)||1;
  a.goTo(a.x+dx*(1-1.4/d),a.z+dz*(1-1.4/d),function(){a.boarded=true;}); a.busy=true;});};      // to the front door, and in
function walkOn(a){if(a.busy||a.path.length||a.slide) return; if(A.t<a.next) return;
  const hurt=a._g&&a._g.hp<100; if(hurt&&!a.fled){a.fled=true; a.speed=2.4; a.p.act=null;}      // hurt: they hurry away from you
  const p=SM.player, q=pave(hurt?p.x:a.x,hurt?p.z:a.z,hurt?60:30,hurt?140:110); if(!q){a.next=A.t+2; return;}
  a.goTo(q[0],q[1]); a.next=A.t+2+Math.random()*3; if(!a.path.length) a.next=A.t+1;}
const LINES=[['Ma nishma?','Beseder, baruch hashem.'],['Did you see the parking on Herzl?','Impossible. I went round three times.'],['Hot today.','Thirty-two, they said.'],['How is your mother?','Better, thanks. Home already.'],['Going to the market?','Later. First coffee.']];
function chatter(){      // two who meet on the pavement stop for a word
  for(let i=0;i<folk.length;i++){const a=folk[i]; if(a.busy||a.fled||!a.path.length||Math.random()>0.02) continue;
    for(let j=0;j<folk.length;j++){const b=folk[j]; if(b===a||b.busy||b.fled||Math.hypot(a.x-b.x,a.z-b.z)>2.6) continue;
      [a,b].forEach(function(o,k){o.busy=true; o.path=[]; o.cb=null; o._hold=A.t+9; const t=k?a:b; o.hT=Math.atan2(t.x-o.x,t.z-o.z);});
      const l=LINES[Math.floor(Math.random()*LINES.length)]; a.say(l[0],2.6); SM.later(2.8,function(){b.say(l[1],2.8);});
      SM.later(9,function(){a.busy=b.busy=false; a.next=b.next=A.t;}); return;}}}
/* the street cats: in the gardens by the blocks, sitting up or curled asleep; they let you pet them */
const cats=[], CATC=[0x2b2d30,0xd98a3a,0xb9b2a8,0xf2ece0,0x8a6a48,0x5a5a5a,0xc9a27a];
function spawnCat(px,pz){if(!A.det) return; const near=T.outlines.filter(function(b){const d=Math.hypot(b.c[0]-px,b.c[1]-pz); return d>15&&d<80;}); if(!near.length) return;
  for(let k=0;k<20;k++){const b=near[Math.floor(Math.random()*near.length)];
  const q=b.p[Math.floor(Math.random()*b.p.length)], dx=q[0]-b.c[0], dz=q[1]-b.c[1], l=Math.hypot(dx,dz)||1, x=q[0]+dx/l*(1.4+Math.random()*1.6), z=q[1]+dz/l*(1.4+Math.random()*1.6);
  if(!T.free(x,z,0.3)||T.kept(x,z)) continue; const lie=Math.random()<0.4, g=A.det.solid(A.det.cat(CATC[Math.floor(Math.random()*CATC.length)],{lie:lie}),'street');
  g.position.set(x,T.U,z); g.rotation.y=Math.random()*2*R; g.userData.nc=true; g.traverse(function(m){m.layers.set(A.LAYER_OUT||5);}); A.scene.add(g); cats.push({g:g,c:{},x:x,z:z}); return;}}
A.townCats=function(){return cats.map(function(c){return {kind:'cat',root:c.g,name:'Cat',c:c.c,lvl:0};});};
const tv=new THREE.Vector3();
A.frameFns.push(function(dt){
  const p=SM.player;
  for(let i=cats.length-1;i>=0;i--){const c=cats[i]; c.g.visible=!!(A.simsOn&&p&&!p.lvl); if(!A.simsOn||(p&&Math.hypot(c.x-p.x,c.z-p.z)>120)){A.scene.remove(c.g); cats.splice(i,1);}}
  if(A.simsOn&&p&&!p.lvl&&cats.length<6&&T.inside(p.x,p.z)&&Math.random()<0.05) spawnCat(p.x,p.z);
  if(!A.simsOn||!p||p.lvl){folk.forEach(function(a){a.p.g.visible=false; A.place(a.tag,tv,false); if(a.bubble) A.place(a.bubble,tv,false);}); if(!A.simsOn&&folk.length){folk.forEach(function(a){a.remove();}); folk.length=0;} return;}
  const me=A.drive&&A.drive.on()?A.drive.pos():p, mx=me.x, mz=me.z;
  for(let i=folk.length-1;i>=0;i--){const a=folk[i]; a.p.g.visible=true;
    if(Math.hypot(a.x-mx,a.z-mz)>150&&!(a._g&&(a._g.down||a._g.fight))){a.remove(); folk.splice(i,1); continue;}
    if(a._g&&a._g.down&&a.p.lieT>0){a.update(dt); continue;}
    if(a.boarded){a.remove(); folk.splice(i,1); continue;}
    if(a.waiting&&a._g&&a._g.hp<100){a.waiting=false; a.stop=null; a.p.sitT=0;}      // hit on the bench: no more waiting
    if(a.busy&&a._hold&&A.t>a._hold&&!(a._g&&(a._g.down||a._g.fight))){a.busy=false; a._hold=0;}
    walkOn(a); a.update(dt);}
  if(folk.length<MAX&&T.inside(mx,mz)&&Math.random()<0.25){if(!(Math.random()<0.25&&spawnWaiter(mx,mz))) spawn(mx,mz);}
  chatter();
});
A.labelFns.push(function(){folk.forEach(function(a){if(!a.p.g.visible) return; a.headPos(tv); tv.y+=0.28; A.place(a.tag,tv,A.simsOn&&A.state.labels&&!a.bubble&&Math.hypot(a.x-SM.player.x,a.z-SM.player.z)<25); if(a.bubble) A.place(a.bubble,tv,A.simsOn);});});
A.townFolk=function(){return folk.filter(function(a){return a.p.g.visible;});};
})();
