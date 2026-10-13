/* Haroe 10 — street life. The street is never empty: people over coffee at the café, neighbours walking by on the far
   pavement, a man and his dog, a cat on its rounds in the alley, pigeons on the square that scatter when you come near,
   cars and a delivery scooter along Haroe St, stopping for whoever is on the crossing. All of it lives in the street's
   own frame (x along our front from number 12's corner, z out toward the street), and is drawn only with the outside. */
(function(){
'use strict';
const A=window.APP, R=Math.PI, S=A.street, det=A.det;
if(!S||!A.makePerson||!det) return;
A.inRoom('street',function(){
const st=S.st, U=S.U, RY=S.RY, KZ=S.KZ, RW=S.RW, D8=S.D8;
const life=new THREE.Group(); st.add(life);
const rnd=A.rng(2026), pick=function(a){return a[Math.floor(rnd()*a.length)];};
const XW=7.1, LANE=KZ+3.5, FAR=KZ+RW+1.45;      // the zebra crossing's line; the lane the traffic keeps to; the far pavement

/* ---------- people ---------- */
const SKIN=[0xf1c9a5,0xe0ac85,0xc68e66,0x9c6a48,0x6e4a32,0xf3d2b6], HAIR=[0x1b1512,0x2e1c14,0x5a3a22,0x8a6a48,0xb9b2a8,0xd8c08a,0x3a2a20];
const TOPS=[0xd84a4a,0x2f6f52,0xf2f2ee,0x26386b,0xe8b81e,0x9fc4d6,0x6b4a8a,0x2b2d30,0xe58ab0,0xc8a27a], PANTS=[0x2b2f38,0x3d5a80,0x6b6f76,0xd8c9a6,0x1d1f21,0x4a5a3a,0xf3ebdc];
let nth=0;
function person(o){
  o=o||{}; const fem=o.fem!=null?o.fem:rnd()<0.5; nth++;
  const spec={h:o.h||(fem?1.58+rnd()*0.12:1.68+rnd()*0.16),skin:o.skin||pick(SKIN),hair:o.hair||pick(HAIR),eyes:pick([0x5a3a22,0x3a2a1a,0x4a6a4a,0x4a6a8a]),style:o.style||(fem?pick(['long','bun','long']):pick(['short','short','bun'])),
    beard:o.beard||(!fem&&rnd()<0.35?pick(['goatee','full']):null),top:o.top||TOPS[(nth*3)%TOPS.length],pants:o.pants||PANTS[(nth*2)%PANTS.length],shoes:pick([0x2b2b2b,0xf1efe8,0x6b4a33,0x3a62b0]),pj:0xf2d98a,slim:fem,sleeves:rnd()<0.3};
  const p=A.makePerson(spec,life);
  p.g.traverse(function(m){if(m.isMesh) m.castShadow=false;});      // the shadow map is only redrawn when something in the flat moves; a walker's shadow would be left behind
  return p;
}
let tintVer=-1; const folk=[];
function tintAll(){if(A.lightVer===tintVer) return; tintVer=A.lightVer; const t=A.rooms.street.tint; folk.forEach(function(f){f.p.tint(t);});}

/* sitting at the café: pairs talking over their cups, someone alone with a newspaper-less morning */
const seats=S.seats.slice(), taken={};
function seatAt(i,act){const q=seats[i]; if(!q||taken[i]) return null; taken[i]=1;
  const p=person(); p.seatY=0.47; p.sitT=p.sit=1; p.g.position.set(q[0],U,q[1]); p.g.rotation.y=q[2]; p.act=act||null;
  const f={p:p,kind:'sit',act:act,next:2+rnd()*6,talkTo:null}; folk.push(f); return f;}
(function(){
  const pairs=[[0,1],[8,9],[13,14]], solo=[4,10,15];      // chairs are made table by table, two or three to a table
  pairs.forEach(function(pr){const a=seatAt(pr[0],'drink'), b=seatAt(pr[1],null); if(a&&b){a.talkTo=b; b.talkTo=a;}});
  solo.forEach(function(i,k){seatAt(i,k%2?'eat':'drink');});
})();

/* behind the counter inside, the barista: steaming milk, wiping down, now and then a look out at the tables */
const barista=(function(){const q=S.inside&&S.inside.barista; if(!q) return null;
  const p=person({fem:true,style:'bun',top:0x2b2d30,pants:0x2b2f38}); p.g.position.set(q[0],U,q[1]); p.g.rotation.y=q[2]; p.act='cook';
  const apron=new THREE.Group(); det.P.box(0.34,0.5,0.02,0x6b4a33,0,-0.05,0.16,apron); det.realize(apron,'street'); p.g.add(apron); apron.position.set(0,0.82,-0.03);
  const f={p:p,kind:'work',next:4,h0:q[2]}; folk.push(f); return f;})();
/* walking: up and down a line of points, pausing at each end; y follows the kerbs */
function groundY(x,z){if(z>KZ-0.02&&z<KZ+RW+0.02) return RY; if(z>=KZ+RW&&x>-1.7&&x<3.9) return RY; return U;}      // the road, and the mouth of Moshe Sharet St, are a kerb lower
function walker(path,o){
  o=o||{}; const p=o.p||person(o), f={p:p,kind:'walk',path:path,i:0,dir:1,speed:o.speed||1.25+rnd()*0.25,wait:o.wait0||0,x:path[0][0],z:path[0][1],h:0,pause:o.pause||[2,6],dog:null,y:U};
  p.walking=true; p.act=o.act||null; folk.push(f); return f;}
const shopper=walker([[-16.5,FAR],[-2.4,FAR],[4.4,FAR],[XW,FAR-0.3],[XW,KZ+RW+0.2],[XW,KZ-0.35],[XW,KZ-1.9],[8.6,KZ-3.4],[9.2,KZ-5.6]],{fem:true});      // home from the shops across the road, over the crossing, into the square
(function(){const b=new THREE.Group(), P=det.P; P.sph(0.12,0xf6f6f2,0,-0.16,0,b,1,1.15,0.55); P.sph(0.06,0xe8a020,0.02,-0.08,0.03,b); P.sph(0.05,0x6aa83a,-0.04,-0.06,0.02,b);      // a plastic bag of shopping, swinging from her hand
  P.tor(0.05,0.008,0xf6f6f2,0,-0.02,0,b,R); det.realize(b,'street'); b.position.set(0,-0.3,0.02); shopper.p.hand.add(b);})();
walker([[27.5,FAR+0.6],[16,FAR+0.6],[5.2,FAR+0.6]],{speed:1.1,pause:[4,9]});
walker([[19.6,KZ-1.15],[31,KZ-1.15]],{speed:2.7,top:0xe8b81e,pants:0x1d1f21,fem:false,pause:[0.5,1.5]});      // a runner along the square's kerb
const dogMan=walker([[-17.5,FAR+0.3],[-6,FAR+0.3],[-2.6,FAR+0.3]],{speed:0.95,fem:false,style:'short',hair:0xb9b2a8,top:0x4a5a3a,pants:0xd8c9a6,pause:[5,9]});

/* the dog: a body on four legs that swing, its tail going, on a lead from his hand */
const dog=(function(){
  const g=new THREE.Group(), P=det.P, brown=0xb07a3e, dk=0x6a4a2a, legs=[];
  P.sph(0.18,brown,0,0.42,0,g,0.85,0.8,1.6); P.sph(0.13,brown,0,0.58,0.3,g,0.9,0.95,1.1); P.sph(0.07,dk,0,0.55,0.43,g,0.9,0.8,1.2); P.sph(0.025,0x111111,0,0.57,0.5,g);
  [-1,1].forEach(function(s){const e=P.sph(0.05,dk,s*0.08,0.66,0.29,g,0.5,1.4,0.9); e.rotation.z=s*0.4; P.sph(0.016,0x111111,s*0.045,0.62,0.4,g);});
  P.box(0.2,0.03,0.04,0xc8202a,0,0.52,0.22,g).rotation.x=0.4;                                                   // red collar
  [[-0.07,0.22],[0.07,0.22],[-0.07,-0.2],[0.07,-0.2]].forEach(function(q){const l=new THREE.Group(); l.position.set(q[0],0.38,q[1]); g.add(l); P.cyl(0.032,0.36,brown,0,-0.18,0,l,8,0.04); P.sph(0.035,dk,0,-0.36,0.02,l,1,0.6,1.3); legs.push(l);});
  const tail=new THREE.Group(); tail.position.set(0,0.5,-0.26); g.add(tail); P.cyl(0.02,0.26,brown,0,0.12,0,tail,6,0.012); tail.rotation.x=-0.7;
  det.realize(g,'street'); g.traverse(function(m){if(m.isMesh) m.castShadow=false;}); life.add(g);
  const lead=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]),new THREE.LineBasicMaterial({color:0xc8202a})); lead.frustumCulled=false; life.add(lead);
  return {g:g,legs:legs,tail:tail,lead:lead,x:dogMan.x+0.6,z:dogMan.z-0.3,h:0,ph:0,sniff:0};
})();
dogMan.dog=dog;

/* ---------- a cat on its rounds in the alley ---------- */
const cat=(function(){
  const g=new THREE.Group(), P=det.P, c=0x8a8a86, stripe=0x5a5a58, legs=[];
  P.sph(0.1,c,0,0.2,0,g,0.85,0.8,1.75); P.sph(0.095,stripe,0,0.215,-0.005,g,0.8,0.78,1.68);      // a tabby's darker back P.sph(0.065,c,0,0.27,0.19,g); P.sph(0.028,0xf2ece0,0,0.25,0.245,g,1.1,0.8,0.8);
  [-1,1].forEach(function(s){P.geo(new THREE.ConeGeometry(0.022,0.05,4),c,s*0.033,0.33,0.19,g); P.sph(0.01,0xb8c84a,s*0.024,0.28,0.248,g);});
  [[-0.045,0.1],[0.045,0.1],[-0.045,-0.1],[0.045,-0.1]].forEach(function(q){const l=new THREE.Group(); l.position.set(q[0],0.19,q[1]); g.add(l); P.cyl(0.018,0.19,c,0,-0.095,0,l,6); legs.push(l);});
  const tail=new THREE.Group(); tail.position.set(0,0.24,-0.16); g.add(tail); P.tube([[0,0,0],[0,0.12,-0.08],[0,0.26,-0.06],[0.02,0.32,0.02]],0.014,c,tail);
  det.realize(g,'street'); g.traverse(function(m){if(m.isMesh) m.castShadow=false;}); life.add(g);
  return {g:g,legs:legs,tail:tail,path:[[2.2,S.AL+0.8],[2.25,13.2],[1.95,17.6]],i:0,dir:1,x:2.2,z:S.AL+0.8,h:0,ph:0,wait:3,sit:0};
})();

/* ---------- pigeons on the square ---------- */
const PIG=[7.2,9.6,11.6+D8,14.0+D8];      // where they feed: x0 x1 z0 z1, on the open paving between the café and the planter
const pigeons=[];
(function(){
  for(let i=0;i<9;i++){
    const g=new THREE.Group(), body=new THREE.Group(), head=new THREE.Group(), P=det.P, grey=[0x8a8f98,0x9a9ea6,0x6f7480,0xb8b4ac][i%4];
    P.sph(0.07,grey,0,0.09,0,body,0.85,0.75,1.3); P.sph(0.042,0x6a5a7a,0,0.12,0.06,body); P.box(0.07,0.02,0.1,0x4a4e56,0,0.09,-0.12,body).rotation.x=0.3;
    [-1,1].forEach(function(s){P.box(0.012,0.04,0.012,0xc06a6a,s*0.02,0.02,0,body);});
    const wings=[-1,1].map(function(s){const w=new THREE.Group(); w.position.set(s*0.05,0.12,0.03); w.userData.s=s; body.add(w); P.box(0.17,0.012,0.08,grey,s*0.085,0,0,w); P.box(0.06,0.013,0.05,0x3a3e46,s*0.15,0,-0.01,w); w.rotation.y=s*1.42; return w;});      // folded back along the body
    head.position.set(0,0.13,0.08); P.sph(0.032,0x5a6070,0,0.02,0.02,head); P.geo(new THREE.ConeGeometry(0.008,0.025,4),0x2b2d2f,0,0.015,0.06,head).rotation.x=R/2; P.sph(0.006,0xe88a2a,0.018,0.03,0.035,head);
    body.add(head); g.add(body); det.realize(g,'street'); g.traverse(function(m){if(m.isMesh) m.castShadow=false;}); life.add(g);
    const x=PIG[0]+rnd()*(PIG[1]-PIG[0]), z=PIG[2]+rnd()*(PIG[3]-PIG[2]);
    pigeons.push({g:g,head:head,wings:wings,x:x,z:z,y:U,h:rnd()*R*2,t:rnd()*3,mode:'peck',vx:0,vz:0,vy:0,tx:x,tz:z});
  }
})();

/* ---------- traffic along Haroe St, one way, keeping to the middle between the parked cars ---------- */
const lampH=A.lampMat('L:street',0xe6ecee,0xfff6dc,1.1), lampT=A.lampMat('L:street',0xb0262a,0xff3a2a,0.9);
const traffic=[];
function vehicle(build,len,speed,rider){
  const g=det.solid(build,'street'); g.visible=false; life.add(g);
  const v={g:g,len:len,cruise:speed,speed:speed,x:-19-len/2,wait:2+traffic.length*6+rnd()*6,rider:rider||null,bump:0};
  traffic.push(v); return v;
}
vehicle(det.car('hatch',{color:0xc23a34,plate:'45-219-71',lamp:lampH,tail:lampT}),4.05,6.5);
vehicle(det.car('sedan',{color:0xf2f2ee,plate:'812-44-306',lamp:lampH,tail:lampT}),4.62,7.5);
vehicle(det.car('suv',{color:0x3a4a5a,plate:'27-583-90',lamp:lampH,tail:lampT}),4.45,6);
(function(){                                                                                          // the delivery scooter, a box on the back, a rider in a helmet
  const m=det.moto('scooter',{color:0xf2f2ee,plate:'86-312',lean:0}); const P=det.P;
  P.rbox(0.42,0.42,0.42,0x2a9ad8,0,1.25,-0.75,m,0.04); P.box(0.3,0.08,0.005,0xf2f2ee,0,1.3,-0.54,m);
  const holder=new THREE.Group(); m.rotation.y=R/2; holder.add(m);
  const v=vehicle(holder,2.0,8.5);
  const p=person({fem:false,top:0x2a9ad8,pants:0x1d1f21,style:'short'}); p.seatY=0.95; p.sitT=p.sit=1; p.act='carry2'; life.remove(p.g); v.g.add(p.g); p.g.position.set(-0.2,0,0); p.g.rotation.y=R/2;
  const helmet=det.realize((function(){const h=new THREE.Group(); det.P.sph(0.135,0xf2f2ee,0,0,0,h,1,0.95,1.1); det.P.box(0.2,0.07,0.02,0x2b2d30,0,-0.02,0.125,h); return h;})(),'street');
  p.head.add(helmet); helmet.position.set(0,0.035,-0.01);
  v.rider=p; folk.push({p:p,kind:'ride'});
})();

/* who is on the crossing: the people of the street, and you */
const pv=new THREE.Vector3();
function onCrossing(){
  for(let i=0;i<folk.length;i++){const f=folk[i]; if(f.kind==='walk'&&Math.abs(f.x-XW)<1.9&&f.z>KZ-0.6&&f.z<KZ+RW+0.6) return true;}
  const sp=A.sims&&A.simsOn&&A.sims.player; if(sp){st.worldToLocal(pv.set(sp.x,0,sp.z)); if(Math.abs(pv.x-XW)<1.9&&pv.z>KZ-0.6&&pv.z<KZ+RW+0.6) return true;}
  return false;
}
function near(x,z,r){                                      // anyone on foot within r: walkers, the dog, you
  for(let i=0;i<folk.length;i++){const f=folk[i]; if(f.kind==='walk'&&Math.hypot(f.x-x,f.z-z)<r) return true;}
  if(Math.hypot(dog.x-x,dog.z-z)<r) return true;
  const sp=A.sims&&A.simsOn&&A.sims.player; if(sp){st.worldToLocal(pv.set(sp.x,0,sp.z)); if(Math.hypot(pv.x-x,pv.z-z)<r) return true;}
  return false;
}
const ang=function(a,b,k){let d=b-a; while(d>R) d-=2*R; while(d<-R) d+=2*R; return a+d*k;};

A.streetLife={folk:folk,traffic:traffic,pigeons:pigeons,cat:cat,dog:dog};
/* ---------- every frame ---------- */
A.frameFns.push(function(dt,t){
  if(!(A.camera.layers.mask&(1<<(A.LAYER_OUT||5)))&&!A.simsOn) return;      // nothing out here is drawn: let it rest
  tintAll();
  const cam=st.worldToLocal(pv.copy(A.camera.position)), cx=cam.x, cz=cam.z;
  folk.forEach(function(f){if(f.kind!=='ride') f.p.g.visible=Math.hypot(f.p.g.position.x-cx,f.p.g.position.z-cz)<45;});      // far off, people are too small to be worth drawing
  /* people */
  folk.forEach(function(f){const p=f.p;
    if(f.kind==='sit'){
      if((f.next-=dt)<0){f.next=3+rnd()*7;
        if(f.talkTo&&rnd()<0.6){p.talk=1.2+rnd()*1.4; if(rnd()<0.3) p.act=p.act==='drink'?null:'drink';}
        else if(!f.talkTo&&rnd()<0.5) p.act=pick(['drink','eat',null]);}
      p.moved=0; p.update(dt); return;}
    if(f.kind==='ride'){p.moved=0; p.update(dt); return;}
    if(f.kind==='work'){if((f.next-=dt)<0){f.next=3+rnd()*6; p.act=pick(['cook','wash','cook',null]);} p.g.rotation.y=f.h0+(p.act?0:Math.sin(t*0.4)*0.5); p.g.visible=p.g.visible&&!!S.inside.n12.visible; p.moved=0; p.update(dt); return;}
    if(f.wait>0){f.wait-=dt; p.walking=false; p.moved=0; p.update(dt); return;}
    const n=f.path[f.i+f.dir]; if(!n){f.dir=-f.dir; f.wait=f.pause[0]+rnd()*(f.pause[1]-f.pause[0]); return;}
    const dx=n[0]-f.x, dz=n[1]-f.z, d=Math.hypot(dx,dz), step=f.speed*dt;
    if(d<=step){f.x=n[0]; f.z=n[1]; f.i+=f.dir;} else {f.x+=dx/d*step; f.z+=dz/d*step;}
    f.h=ang(f.h,Math.atan2(dx,dz),Math.min(1,dt*6)); f.y+=(groundY(f.x,f.z)-f.y)*Math.min(1,dt*12);
    p.walking=true; p.moved=Math.min(step,d); p.g.position.set(f.x,f.y,f.z); p.g.rotation.y=f.h; p.update(dt);
  });
  /* the dog trots after his man on the lead, stopping to sniff */
  (function(){const m=dogMan, sx=Math.sin(m.h), cz=Math.cos(m.h), tx=m.x+sx*0.7+cz*0.35, tz=m.z+cz*0.7-sx*0.35, dx=tx-dog.x, dz=tz-dog.z, d=Math.hypot(dx,dz);
    if(dog.sniff>0) dog.sniff-=dt; else if(m.wait<=0&&rnd()<dt*0.08) dog.sniff=1.5+rnd()*2;
    const sp=dog.sniff>0?0:Math.min(2.4,d*2.2), mv=sp*dt;
    if(d>0.05&&mv>0){dog.x+=dx/d*mv; dog.z+=dz/d*mv; dog.h=ang(dog.h,Math.atan2(dx,dz),Math.min(1,dt*7));}
    dog.ph+=mv*9; const sw=Math.min(1,sp)*0.55;
    dog.legs.forEach(function(l,k){l.rotation.x=Math.sin(dog.ph+(k===0||k===3?0:R))*sw;});
    dog.tail.rotation.z=Math.sin(t*9)*0.5; dog.g.rotation.x=dog.sniff>0?0.25:0;
    const y=groundY(dog.x,dog.z); dog.g.position.set(dog.x,y,dog.z); dog.g.rotation.y=dog.h;
    const hp=m.p.g.position, pa=dog.lead.geometry.attributes.position;
    pa.setXYZ(0,hp.x+Math.cos(m.h)*0.24,hp.y+0.82*m.p.sc,hp.z-Math.sin(m.h)*0.24); pa.setXYZ(1,dog.x+Math.sin(dog.h)*0.22,y+0.52,dog.z+Math.cos(dog.h)*0.22); pa.needsUpdate=true;})();
  /* the cat: walks a little, sits a while, walks on */
  (function(){const c=cat; if(c.wait>0){c.wait-=dt; c.sit=Math.min(1,c.sit+dt*2);} else {c.sit=Math.max(0,c.sit-dt*3);
      const n=c.path[c.i+c.dir]; if(!n){c.dir=-c.dir; c.wait=4+rnd()*8; return;}
      const dx=n[0]-c.x, dz=n[1]-c.z, d=Math.hypot(dx,dz), step=0.45*dt;
      if(d<=step){c.x=n[0]; c.z=n[1]; c.i+=c.dir; if(rnd()<0.5) c.wait=2+rnd()*5;} else {c.x+=dx/d*step; c.z+=dz/d*step;}
      c.h=ang(c.h,Math.atan2(dx,dz),Math.min(1,dt*5)); c.ph+=step*16;}
    const sw=(1-c.sit)*0.5; c.legs.forEach(function(l,k){l.rotation.x=Math.sin(c.ph+(k===0||k===3?0:R))*sw; if(k>1) l.rotation.x+=c.sit*-1.1;});
    c.g.rotation.x=-c.sit*0.45; c.tail.rotation.z=Math.sin(t*1.7)*0.35; c.g.position.set(c.x,U+c.sit*0.05,c.z); c.g.rotation.y=c.h;})();
  /* pigeons: peck and potter about; anyone coming close sends them up, to come down again a little way off */
  pigeons.forEach(function(b){b.t+=dt;
    if(b.mode==='peck'){
      if(near(b.x,b.z,1.4)){b.mode='fly'; const a=rnd()*R*2; b.vx=Math.sin(a)*2.5; b.vz=Math.cos(a)*2.5; b.vy=2.6; b.h=a; b.tx=PIG[0]+rnd()*(PIG[1]-PIG[0]); b.tz=PIG[2]+rnd()*(PIG[3]-PIG[2]); b.air=0;}
      else{const bob=Math.max(0,Math.sin(b.t*(5+(b.x*7)%3)))>0.6; b.head.rotation.x=bob?0.9:0; b.head.position.z=bob?0.11:0.08;
        if(rnd()<dt*0.5){b.h+=(rnd()-0.5)*2;} if(rnd()<dt*0.7){const s=0.15+rnd()*0.2, nx=b.x+Math.sin(b.h)*s, nz=b.z+Math.cos(b.h)*s; if(nx>PIG[0]&&nx<PIG[1]&&nz>PIG[2]&&nz<PIG[3]){b.x=nx; b.z=nz;}}
        b.wings.forEach(function(w){w.rotation.set(0,w.userData.s*1.42,0);});}
    }else{b.air+=dt; const flap=Math.sin(b.t*28)*0.9;
      b.wings.forEach(function(w){w.rotation.set(0,w.userData.s*0.15,-w.userData.s*flap);});
      if(b.air<1.6){b.x+=b.vx*dt; b.z+=b.vz*dt; b.y+=b.vy*dt; b.vy-=1.2*dt;}
      else{const dx=b.tx-b.x, dz=b.tz-b.z, d=Math.hypot(dx,dz); b.h=Math.atan2(dx,dz); b.x+=dx*Math.min(1,dt*1.2); b.z+=dz*Math.min(1,dt*1.2); b.y+=(U-b.y)*Math.min(1,dt*1.5);
        if(b.y-U<0.03&&d<0.1&&!near(b.x,b.z,2.2)){b.y=U; b.mode='peck';}}
      b.head.rotation.x=0;}
    b.g.position.set(b.x,b.y,b.z); b.g.rotation.y=b.h;});
  /* traffic */
  const cross=onCrossing();
  traffic.forEach(function(v,k){
    if(v.wait>0){v.wait-=dt; v.g.visible=false; return;}
    v.g.visible=true;
    const ahead=traffic.reduce(function(m,o){return o!==v&&o.wait<=0&&o.x>v.x?Math.min(m,o.x-o.len/2-(v.x+v.len/2)):m;},99);      // the car in front
    const toX=XW-1.6-(v.x+v.len/2);                                                                   // the stop line before the crossing
    let want=v.cruise; if(cross&&toX>-0.5&&toX<12) want=Math.min(want,Math.max(0,toX*0.8)); if(ahead<9) want=Math.min(want,Math.max(0,(ahead-2.5)*0.9));
    if(Math.abs(v.x-21.6)<4) want=Math.min(want,2.2);                                                  // the speed bump
    v.speed+=(want-v.speed)*Math.min(1,dt*(want<v.speed?3:0.8)); v.x+=v.speed*dt;
    const onBump=Math.max(0,1-Math.abs(v.x-21.6)/0.6);
    v.g.position.set(v.x,RY+onBump*0.06,LANE+(v.rider?-0.2:0)); v.g.rotation.z=(v.x<21.6?1:-1)*onBump*0.02;
    v.g.userData.wheels.forEach(function(w){w.rotation.x-=v.speed*dt/w.userData.wheel;});
    if(v.x>50+v.len/2){v.x=-19-v.len/2; v.wait=5+rnd()*14; v.speed=v.cruise;}
  });
});
});
})();
