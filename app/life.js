/* Haroe 10 — living in the flat: a partner at home, things you can use, a day's to-do list.
   Every action is a short scripted scene: walk there, use the real object, see and hear it happen. */
(function(){
'use strict';
const A=window.APP, D=A.D, SM=A.sims, K=A.kit, ST=A.state, AU=A.audio, R=Math.PI, L=D.L, W=D.W, KX=D.KX, KZ=D.KZ, BA=A.BA, WCS=A.WC;
const $=function(id){return document.getElementById(id);};
const me=function(){return SM.player;};
let partner=null, tok={}, mode='', pin=null, pinT=0;
const mzW=(WCS.z0+WCS.z1)/2, tzB=(D.bathDoor[0]+D.bathDoor[1])/2, SX=KX-1.05, X0=KX-1.8, HOB=[KX-0.48,0.42], SP=A.showerSpot;      // HOB: the front ring of the cooktop
const st={dishes:0,carry:null,outfit:0,pile:null,track:-1,trackT:0,asleep:false,pj:false,chapters:0,done:{},warned:{},wash:0,washDone:false,hung:false,panOut:false};
const GOALS=[['shoes','Take your shoes off at the door'],['coffee','Make a coffee'],['record','Put a record on'],['cook','Cook and eat together'],['dishes','Wash the dishes'],['study','Study a chapter'],
  ['vacuum','Vacuum the flat'],['clothes','Change clothes'],['laundry','Wash the laundry and hang it up'],['massage','Give or get a massage'],['read','Read a book'],['shower','Take a shower'],['sleep','Go to sleep together']];
const OUTFITS={
  angela:[{top:0xd6a21e,pants:0x3d5a80,sleeves:true,knit:true},{top:0x8fbd9b,pants:0xf3ebdc,sleeves:false},{top:0x9fc4d6,pants:0x2b2f38,sleeves:true,knit:true},{top:0xfbfaf6,pants:0x3d5a80,sleeves:false}],
  yoav:[{top:0x2f6f52,pants:0x2b2f38,sleeves:false},{top:0xf3ebdc,pants:0x3d5a80,sleeves:false},{top:0x26386b,pants:0x6b6f76,sleeves:true,knit:true},{top:0x9fc4d6,pants:0x2b2f38,sleeves:true}]};

/* =====================================================================
   Props. Their materials take the light of the room the player is in.
   ===================================================================== */
const props=new THREE.Group(); props.userData.nc=true; A.scene.add(props);
const pmats=[];
const pm=function(c,o){const m=new THREE.MeshLambertMaterial(Object.assign({color:c},o||{})); pmats.push({m:m,b:new THREE.Color(c)}); return m;};
function mesh(geo,mat,parent,x,y,z){const m=new THREE.Mesh(geo,mat); m.castShadow=true; if(x!=null) m.position.set(x,y,z); (parent||props).add(m); return m;}
const grp=function(parent){const g=new THREE.Group(); (parent||props).add(g); return g;};
const cylG=function(rt,rb,h,s,open){return new THREE.CylinderGeometry(rt,rb,h,s||18,1,!!open);}, sphG=function(r){return new THREE.SphereGeometry(r,12,9);}, boxG=function(w,h,d){return new THREE.BoxGeometry(w,h,d);};
const white=pm(0xfbfaf6), steel=pm(0xb9bdc0), dark=pm(0x2a2c2e);
const FOODC=[0xd9463e,0x5b8f4a,0xf0d21c,0xd9863e,0xf3ebdc];
function foodBits(parent,n,r,y){const g=grp(parent); for(let i=0;i<n;i++){const a=i/n*6.283, q=r*(0.25+0.6*((i*7)%5)/5); mesh(i%3?boxG(0.03,0.02,0.03):sphG(0.017),pm(FOODC[i%5]),g,Math.cos(a)*q,y,Math.sin(a)*q).rotation.y=a;} return g;}
// things carried in the hand: built upright, then turned so that "up" is along the forearm's +z
const book=mesh(boxG(0.14,0.2,0.03),pm(0x26386b)); mesh(boxG(0.13,0.19,0.022),pm(0xf7f4ea),book,0.006,0,0);
const bundle=grp(); const bundleM=[pm(0x8a94a6),pm(0xd6a21e),pm(0x3d5a80)];
[[0,0,0],[0.07,0.04,0.04],[-0.06,0.05,-0.03]].forEach(function(q,i){mesh(sphG(0.1),bundleM[i],bundle,q[0],q[1],q[2]).scale.set(1.2,0.7,1);});
const grocery=grp(); mesh(cylG(0.08,0.05,0.045,18),pm(0xf3ebdc),grocery,0,0,0); mesh(sphG(0.028),pm(0xd9463e),grocery,0.025,0.035,0.02); mesh(sphG(0.026),pm(0xf0d21c),grocery,-0.03,0.034,0.025).scale.set(1,1.15,1);
mesh(cylG(0.014,0.014,0.11,10),pm(0x5b8f4a),grocery,0,0.04,-0.03).rotation.z=1.45; mesh(sphG(0.03),pm(0x2f7d4f),grocery,-0.035,0.032,-0.02).scale.set(1.2,0.6,1); mesh(cylG(0.012,0.006,0.1,8),pm(0xd9863e),grocery,0.045,0.04,-0.02).rotation.x=1.2;
const plateH=grp(); mesh(cylG(0.1,0.075,0.016,20),white,plateH); const plateHF=foodBits(plateH,6,0.07,0.018);
const plate2=grp(); const plate2F=[-0.11,0.11].map(function(x){const g=grp(plate2); g.position.x=x; mesh(cylG(0.1,0.075,0.016,20),white,g); return foodBits(g,6,0.07,0.018);});
const cup=grp(); mesh(cylG(0.036,0.028,0.07,14),white,cup); const coffee=mesh(cylG(0.031,0.031,0.004,14),pm(0x3a2416),cup,0,0.03,0); mesh(new THREE.TorusGeometry(0.02,0.006,6,12),white,cup,0.045,0,0);
const pan=grp(); mesh(cylG(0.14,0.115,0.05,24,true),pm(0x26282a,{side:THREE.DoubleSide}),pan); mesh(cylG(0.115,0.115,0.006,24),dark,pan,0,-0.022,0); mesh(boxG(0.2,0.016,0.028),dark,pan,0.23,0.012,0);
const panFood=foodBits(pan,11,0.1,-0.008); panFood.visible=false;
const spatula=grp(); mesh(boxG(0.014,0.24,0.008),pm(0xc99a5b),spatula,0,-0.12,0); mesh(boxG(0.06,0.08,0.005),dark,spatula,0,-0.27,0);
[book,bundle,grocery,plateH,plate2,cup,pan,spatula].forEach(function(o){o.visible=false;});
const CARRY={book:[book,'carry',0],clothes:[bundle,'carry2',0],wet:[bundle,'carry2',0],food:[grocery,'carry',1],plate:[plateH,'carry',1],plates:[plate2,'carry2',1],cup:[cup,'carry',1],pan:[pan,'carry',1]};
function carry(v){
  st.carry=v; [book,bundle,grocery,plateH,plate2,cup].forEach(function(o){props.add(o); o.visible=false;});
  if(pan.parent!==props&&v!=='pan'){props.add(pan); pan.visible=false;}
  const p=me();
  if(p&&v){const c=CARRY[v], o=c[0]; p.p.hand.add(o); o.rotation.set(c[2]?R/2:0,0,0); o.position.set(c[1]==='carry2'?-0.13*(p.p.spec.slim?0.9:1):0,-0.31,c[2]?0.045:0.06); o.visible=true;}
  pose(null);
}
function pose(a){const p=me(); if(p) p.p.act=a||(st.carry?CARRY[st.carry][1]:null);}
function plateFood(v){plateHF.visible=v; plate2F.forEach(function(g){g.visible=v;});}
// an open book that rests in front of the reader, pages toward the eyes
const openBook=grp(); openBook.visible=false;
(function(){const pageT=A.canvasTex(64,96,function(g){g.fillStyle='#f8f5ec'; g.fillRect(0,0,64,96); g.fillStyle='#8a857a'; for(let y=10;y<88;y+=6) g.fillRect(7,y,y%30===10?30:50,1.6);});
  [-1,1].forEach(function(s){const h=grp(openBook); h.rotation.z=s*0.2; mesh(boxG(0.135,0.008,0.2),pm(0x26386b),h,s*0.068,0,0); mesh(boxG(0.125,0.012,0.19),pm(0xf8f5ec,{map:pageT}),h,s*0.066,0.01,0).castShadow=false;});
  const flip=grp(openBook); mesh(new THREE.PlaneGeometry(0.125,0.19),pm(0xfbf9f2,{side:THREE.DoubleSide,map:pageT}),flip,0.063,0.02,0).rotation.x=-R/2; openBook.userData.flip=flip;})();
const pile=grp(); pile.visible=false; [[0,0,0,0x8a94a6],[0.08,0.03,0.05,0xd6a21e],[-0.07,0.05,-0.04,0x3d5a80],[0.02,0.08,0.02,0xf3ebdc]].forEach(function(q){mesh(sphG(0.12),pm(q[3]),pile,q[0],q[1],q[2]).scale.set(1.3,0.5,1.1);});
const heap=grp(); heap.visible=false; const heapM=[pm(0xffffff),pm(0xffffff),pm(0xffffff)];
[[0,0,0],[0.07,0.03,0.04],[-0.05,0.05,-0.03]].forEach(function(q,i){mesh(sphG(0.11),heapM[i],heap,q[0],q[1],q[2]).scale.set(1.3,0.45,1.1);});
function recolor(m,c){for(let i=0;i<pmats.length;i++) if(pmats[i].m===m) pmats[i].b.set(c);}
const vac=K.vacuum(props,pm); vac.visible=false;          // the stick vacuum from the dock by the door, in the hand
const plates=[0,1].map(function(){const g=grp(); g.visible=false; mesh(cylG(0.12,0.09,0.018,20),white,g); foodBits(g,7,0.08,0.02); return g;});
const dirtMat=new THREE.MeshBasicMaterial({color:0x8a7450,transparent:true,opacity:0.6,depthWrite:false}), dirt=[];
function addDirt(x,z){if(dirt.length>=45) return; const m=new THREE.Mesh(new THREE.CircleGeometry(0.06+Math.random()*0.06,10),dirtMat); m.rotation.x=-R/2; m.position.set(x+(Math.random()-0.5)*0.2,0.019,z+(Math.random()-0.5)*0.2); m.renderOrder=1; props.add(m); dirt.push(m);}
function cleanNear(x,z,r){for(let i=dirt.length-1;i>=0;i--){const m=dirt[i]; if(Math.hypot(m.position.x-x,m.position.z-z)<r){props.remove(m); m.geometry.dispose(); dirt.splice(i,1);}}}
const notes=[];
function note(x,z){const e=A.tag(['♪','♫','♩'][notes.length%3],'zzz'); e.style.color='#1F5A41'; notes.push({e:e,p:new THREE.Vector3(x+(Math.random()-0.5)*0.5,1.1,z+(Math.random()-0.5)*0.5),t:0});}

/* ---------- soft effects: steam, running water, the pixel censor ---------- */
const softT=A.canvasTex(64,64,function(g){const r=g.createRadialGradient(32,32,0,32,32,32); r.addColorStop(0,'rgba(255,255,255,1)'); r.addColorStop(0.5,'rgba(255,255,255,.4)'); r.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=r; g.fillRect(0,0,64,64);});
function puffs(n){const l=[]; for(let i=0;i<n;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:softT,transparent:true,opacity:0,depthWrite:false})); s.visible=false; s.userData.o=i/n; props.add(s); l.push(s);} return l;}
function steamAt(l,t,x,y,z,spread,rise,size,op,speed){for(let i=0;i<l.length;i++){const s=l[i], o=s.userData.o, k=(t*speed+o)%1; s.visible=true;
  s.position.set(x+Math.sin(o*40+t*0.9)*spread*(0.3+k),y+k*rise,z+Math.cos(o*33+t*0.7)*spread*(0.3+k)); s.scale.setScalar(size*(0.5+k*1.7)); s.material.opacity=op*Math.sin(k*R);}}
const hide=function(l){for(let i=0;i<l.length;i++) l[i].visible=false;};
const panSteam=puffs(7), cupSteam=puffs(3), showerSteam=puffs(36); showerSteam.forEach(function(s){s.material.color.set(0xe3ecef);});
const water=new THREE.MeshBasicMaterial({color:0xb4dcf2,transparent:true,opacity:0.8,depthWrite:false});
const tapStream=mesh(cylG(0.007,0.009,A.sink.y1-A.sink.y0,8),water,props,A.sink.x,(A.sink.y1+A.sink.y0)/2,A.sink.z); tapStream.castShadow=false;
const tapRing=mesh(new THREE.TorusGeometry(0.03,0.005,6,16),water,props,A.sink.x,A.sink.y0+0.006,A.sink.z); tapRing.rotation.x=R/2; tapRing.castShadow=false;
const suds=grp(), foam=pm(0xffffff,{transparent:true,opacity:0.85}); for(let i=0;i<26;i++){const a=i*2.4, q=0.02+0.0065*i; mesh(sphG(0.006+0.004*(i%4)),foam,suds,A.sink.x+Math.cos(a)*q*1.3,A.sink.y0+0.008,A.sink.z-0.06+Math.sin(a)*q*0.75).castShadow=false;}
function tapOn(v,bubbles){tapStream.visible=tapRing.visible=v; if(bubbles!=null) suds.visible=bubbles; AU.loop('tap',v);}
tapStream.visible=tapRing.visible=suds.visible=false;
const handStream=mesh(cylG(0.005,0.006,1,8),water,props,0,0,0); handStream.castShadow=false; handStream.visible=false;      // the same water at the two bathroom basins
function basinTap(id){const b=id&&A.basins[id]; handStream.visible=!!b; if(b){handStream.scale.y=b.y1-b.y0; handStream.position.set(b.x,(b.y1+b.y0)/2,b.z);} AU.loop('tap',!!b);}
const brew=mesh(cylG(0.004,0.004,0.1,6),new THREE.MeshBasicMaterial({color:0x4a2c18}),props,0,0,0); brew.castShadow=false; brew.visible=false;
const hobGlow=mesh(cylG(0.08,0.08,0.004,24),new THREE.MeshBasicMaterial({color:0xff5a2a,transparent:true,opacity:0}),props,HOB[0],0.936,HOB[1]); hobGlow.castShadow=false;
// shower: streaks of water under the head, spray where it lands, fog on the glass
const NS=300, rain=new THREE.InstancedMesh(new THREE.BoxGeometry(0.0045,0.11,0.0045),new THREE.MeshBasicMaterial({color:0x9fcbe4,transparent:true,opacity:0.85,depthWrite:false}),NS);
rain.frustumCulled=false; rain.visible=false; rain.castShadow=false; props.add(rain);
const sSeed=[], dm=new THREE.Matrix4(); for(let i=0;i<NS;i++){const a=Math.random()*6.283, q=Math.sqrt(Math.random())*0.125; sSeed.push([Math.cos(a)*q,Math.sin(a)*q,Math.random(),0.8+Math.random()*0.5,Math.cos(a)*q*0.6,Math.sin(a)*q*0.6,q]);}
const NM=220, mGeo=new THREE.BufferGeometry(); mGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(NM*3),3));
const mist=new THREE.Points(mGeo,new THREE.PointsMaterial({color:0xb9dcee,size:0.028,transparent:true,opacity:0.85,depthWrite:false})); mist.frustumCulled=false; mist.visible=false; props.add(mist);
const puddle=mesh(new THREE.CircleGeometry(0.42,28),new THREE.MeshBasicMaterial({color:0xcfe9f5,transparent:true,opacity:0,depthWrite:false}),props,SP.x,0.016,SP.z); puddle.rotation.x=-R/2; puddle.castShadow=false;
let showerOn=false, fog=0;
function showerFx(v){showerOn=v; rain.visible=v; mist.visible=v; AU.loop('shower',v);}
const cCv=document.createElement('canvas'); cCv.width=6; cCv.height=8; const cG=cCv.getContext('2d'), cTex=new THREE.CanvasTexture(cCv); cTex.magFilter=cTex.minFilter=THREE.NearestFilter;
const censor=new THREE.Sprite(new THREE.SpriteMaterial({map:cTex,depthTest:false})); censor.renderOrder=20; censor.visible=false; props.add(censor);
let cens=null, cLast=0;                                    // {a: actor, part: 'body' or 'hips'}
function setCensor(a,part){cens=a?{a:a,part:part}:null; censor.visible=false;}

/* ---------- kitchen fittings that open: fridge, crockery cupboard, pan drawer, pull-out bin ---------- */
const movers=[];
function mover(o,axis,closed,open,rate){const m={o:o,axis:axis,closed:closed,open:open,cur:0,target:0,rate:rate||2.4}; movers.push(m); return m;}
const KIT={fridge:[],cab:[],drawer:[],bin:[],pans:[]};
function openK(k,v){KIT[k].forEach(function(m){m.target=v?1:0;}); AU.blip('click');}
A.inRoom('kitchen',function(){
  const fd=A.G(); fd.position.set(W+0.71,0,KZ-0.72); A.box(0.7,1.75,0.03,0xf7f7f5,-0.35,0.875,-0.015,fd);
  A.fridgeFront.position.set(-(W+0.71),0,-(KZ-0.72)-0.032); fd.add(A.fridgeFront);
  [0.35,0.75,1.1].forEach(function(y,i){A.box(0.56,0.1,0.09,0xeef3f3,-0.35,y,0.05,fd); A.cyl(0.03,0.2,[0xfbfaf6,0x8dbb99,0xd9863e][i],-0.2,y+0.1,0.05,fd,10); A.box(0.07,0.14,0.06,[0xd9463e,0xf0d21c,0x9dc2d5][i],-0.45,y+0.08,0.05,fd);});
  KIT.fridge.push(mover(fd,'ry',0,-1.9));
  // crockery in the wall cupboard: plates and bowls below, cups and glasses on the shelf
  const cg=A.G(); for(let i=0;i<6;i++) A.cyl(0.085,0.012,0xfbfaf6,X0+0.47,1.497+i*0.014,KZ-0.17,cg,20,0.105);
  for(let i=0;i<3;i++) A.cyl(0.045,0.05,0x9dc2d5,X0+0.74,1.515+i*0.022,KZ-0.17,cg,18,0.075);
  for(let i=0;i<4;i++){A.cyl(0.027,0.07,[0xfbfaf6,0x8dbb99,0xfbfaf6,0x9dc2d5][i],X0+0.42+i*0.095,1.808,KZ-0.2,cg,14,0.034); A.torus(0.018,0.005,0xfbfaf6,X0+0.42+i*0.095,1.808,KZ-0.245,cg).rotation.y=R/2;}
  const glass=A.reg(new THREE.MeshLambertMaterial({color:0xdff0f2,transparent:true,opacity:0.45})); for(let i=0;i<3;i++) A.cyl(0.025,0.1,glass,X0+0.5+i*0.09,1.823,KZ-0.09,cg,12,0.03);
  const sage=function(){return A.reg(new THREE.MeshLambertMaterial({color:0x7b8a60,emissive:0x151810}));};
  [['n',0x34373c,0xf0d21c],['abcdef',null,null]].forEach(function(v){
    const g=A.G(), c1=v[1]==null?sage():v[1], c2=v[2]==null?sage():v[2];
    const cd=A.G(g); cd.position.set(X0+0.325,0,KZ-0.362); A.box(0.56,0.56,0.02,c2,0.28,1.76,0,cd); A.box(0.012,0.1,0.02,0x17181a,0.52,1.56,-0.016,cd);        // cupboard door
    KIT.cab.push(mover(cd,'ry',0,1.75));
    const dr=A.G(g), dx=KX-1.5;                                                                                                                       // deep drawer by the hob: a pot and the frying pan
    A.box(0.56,0.24,0.02,c1,dx,0.48,0.6,dr); A.box(0.26,0.014,0.02,0x17181a,dx,0.52,0.618,dr); A.box(0.5,0.012,0.46,0xe9e6df,dx,0.375,0.36,dr);
    [-0.25,0.25].forEach(function(o){A.box(0.012,0.16,0.46,0xe9e6df,dx+o,0.45,0.36,dr);}); A.box(0.5,0.16,0.012,0xe9e6df,dx,0.45,0.135,dr);
    A.cyl(0.1,0.12,0xb9bdc0,dx+0.12,0.442,0.3,dr,18); A.cyl(0.105,0.012,0x8d9296,dx+0.12,0.508,0.3,dr,18); A.sph(0.016,0x2a2c2e,dx+0.12,0.526,0.3,dr);
    const dp=A.G(dr); A.cyl(0.115,0.04,0x26282a,dx-0.1,0.402,0.4,dp,20,0.14); A.box(0.18,0.014,0.026,0x2a2c2e,dx-0.1,0.42,0.2,dp).rotation.y=R/2; KIT.pans.push(dp);
    KIT.drawer.push(mover(dr,'pz',0,0.36));
    const bn=A.G(g);                                                                                                                                  // the bin pulls out from under the sink
    A.box(0.3,0.76,0.03,c1,SX,0.5,KZ-0.565,bn); A.box(0.012,0.13,0.02,0x17181a,SX+0.11,0.78,KZ-0.59,bn); A.box(0.26,0.012,0.46,0x8d9296,SX,0.15,KZ-0.33,bn);
    A.cyl(0.1,0.38,0x7b7f82,SX,0.35,KZ-0.34,bn,18,0.115); A.torus(0.115,0.012,0x5b8f4a,SX,0.54,KZ-0.34,bn).rotation.x=R/2; A.cyl(0.105,0.01,0x2a2c2e,SX,0.5,KZ-0.34,bn,18);
    KIT.bin.push(mover(bn,'pz',0,-0.42));
    KIT[v[0]]=g;
  });
});
const sinkPile=grp(); sinkPile.position.set(SX,0.71,KZ-0.32);
const dishMesh=[0,1,2,3,4,5,6,7].map(function(i){const m=i%4===3?mesh(cylG(0.11,0.1,0.045,16),dark,sinkPile):i%4===2?mesh(cylG(0.035,0.03,0.09,12),white,sinkPile):mesh(cylG(0.1,0.08,0.014,16),white,sinkPile);
  m.position.set((i%3-1)*0.13,0.02+Math.floor(i/3)*0.03,(i%2?0.06:-0.06)); m.rotation.z=(i%2?0.25:-0.15); m.visible=false; return m;});
function dishes(n){st.dishes=Math.max(0,Math.min(8,n)); dishMesh.forEach(function(m,i){m.visible=i<st.dishes;});}

/* ---------- toilets: a lid and a seat on a hinge, each remembered up or down ---------- */
const WCs={};
function toilet(id,hx,z,room,door,basin){
  const t={id:id,x:hx-0.25,z:z,door:door,basin:basin,seatUp:false};
  A.inRoom(room,function(){
    const sp=A.G(); sp.position.set(hx,0.6,z); A.rbox(0.42,0.02,0.34,0xf4f4f1,-0.21,0,0,sp,0.008);
    const lp=A.G(); lp.position.set(hx,0.622,z); A.rbox(0.43,0.022,0.35,0xffffff,-0.215,0,0,lp,0.009);
    t.seat=mover(sp,'rz',0,-1.5,3); t.lid=mover(lp,'rz',0,-1.62,3);
  });
  WCs[id]=t;
}
toilet('guest',WCS.x1-0.2,mzW,'wc','wc',[(D.wcDoor[0]+D.wcDoor[1])/2-0.2,WCS.z1-0.6]);
toilet('bath',BA.x1-0.03,tzB,'bath','bath',[BA.x0+0.7,BA.z1-0.8]);

/* ---------- wet laundry over the rails of the drying rack ---------- */
const rackWet=new THREE.Group(); rackWet.visible=false; A.pieces.rack1.g.add(rackWet);
[[-0.52,0.285,0xd6a21e,0.3,0.42],[-0.12,0.285,0x3d5a80,0.34,0.6],[0.36,0.285,0xfbfaf6,0.28,0.36],[-0.4,-0.285,0x8fbd9b,0.3,0.46],[0.02,-0.285,0x2b2f38,0.32,0.58],[0.45,-0.285,0x9fc4d6,0.26,0.34]].forEach(function(q){
  const m=pm(q[2]); mesh(boxG(q[3],q[4],0.012),m,rackWet,q[0],0.905-q[4]/2,q[1]); mesh(boxG(q[3],0.014,0.05),m,rackWet,q[0],0.912,q[1]-Math.sign(q[1])*0.02);});

/* =====================================================================
   Scripting helpers
   ===================================================================== */
const tweens=[];
function tween(dur,fn,done,keep){const o={t:0,dur:dur,fn:fn,done:done,tok:keep?null:tok}; tweens.push(o); fn(0); return o;}
function begin(m){SM.stop(); tok={}; mode=m||''; return tok;}
function later(sec,fn){const t=tok; SM.later(sec,function(){if(t===tok) fn();},t);}
function chain(steps){const t=tok; let i=0; const next=function(){if(t===tok&&i<steps.length) steps[i++](next);}; next();}
const Wk=function(x,z,h){return function(n){walk(x,z,h,n);};}, Ps=function(s){return function(n){later(s,n);};}, Do=function(f){return function(n){f(); n();};};
const doing=function(t){SM.setDoing(t);};
function goal(k){if(st.done[k]) return; st.done[k]=1; renderGoals(); SM.toast('Done: '+GOALS.filter(function(g){return g[0]===k;})[0][1]+'.');
  if(Object.keys(st.done).length===GOALS.length) SM.later(3.5,function(){SM.toast('A full day at Haroe 10. Good night.');},st);}
function walk(x,z,h,cb){const t=tok, p=me(); p.goTo(x,z,function(){if(t!==tok) return; if(h!=null) p.hT=h; if(cb) cb();});}
function slideTo(x,z,dur){const p=me(); p.slide={fx:p.x,fz:p.z,tx:x,tz:z,t:0,dur:dur,then:null};}
function front(id,dist){const p=A.pieceFor?A.pieceFor(id):A.pieces[id]; if(!p||p.to[3]<1) return null; const f=p.to[2], c=Math.cos(f), s=Math.sin(f);
  return {x:p.to[0],z:p.to[1],sx:p.to[0]+c*dist,sz:p.to[1]-s*dist,h:Math.atan2(-c,s),obj:p.g};}
function firstPiece(ids,dist){for(let i=0;i<ids.length;i++){const q=front(ids[i],dist); if(q) return q;} return null;}
function bedKey(){return ST.design==='n'?'n':'p';}
let coverAmt=0, coverT=0, coverKey='', hot=false;
function dressAgain(now){            // out of pyjamas, once they are back on their feet
  if(!st.pj) return; st.pj=false; coverT=0;
  [me(),partner].forEach(function(a){if(!a||a.gone) return; if(now){a.p.outfit(false); return;}
    SM.later(0.9,function(){a.p.twirl=1;},st); SM.later(1.35,function(){if(!st.pj) a.p.outfit(false);},st);});
}
function cancel(){              // whatever was going on stops here, and the flat goes back to rest
  SM.cancel(tok); tok={}; mode='';
  const p=me();
  if(p){p.p.act=null; if(vac.parent===p.p.g) p.p.g.remove(vac); p.speed=1.4; if(p.p.isNude) p.p.nude(false); if(p.p.pantsLv) p.p.pants(0);}
  vac.visible=false; if(A.vacuumMesh) A.vacuumMesh.visible=true;
  if(partner){partner.p.act=null; partner.busy=false;}
  hot=false; hide(panSteam); hide(cupSteam); plates.forEach(function(g){g.visible=false;}); spatula.visible=false; props.add(spatula); brew.visible=false; plateFood(true);
  if(pan.visible){pan.visible=false; props.add(pan); panFood.visible=false; st.panOut=false;}
  tapOn(false,false); handStream.visible=false; heap.visible=false; setCensor(null); if(showerOn) showerFx(false);
  ['sizzle','vacuum'].forEach(function(n){AU.loop(n,false);});
  if(st.asleep){st.asleep=false; if(p) p.sleep(false); if(partner) partner.sleep(false);}
  dressAgain(!A.simsOn);
  ['fridge','cab','drawer','bin'].forEach(function(k){KIT[k].forEach(function(m){m.target=0;});});
  if(openBook.visible){openBook.visible=false; if(st.carry==='book') carry('book');}
  if(st.carry&&st.carry!=='book'&&st.carry!=='clothes'&&st.carry!=='wet') carry(null); else pose(null);
  ['wc','bath'].forEach(function(d){const q=A.door(d); if(q) q.force=null;});
}
SM.onStop=cancel;

/* =====================================================================
   Things to do
   ===================================================================== */
function fridgeOpen(){return [Wk(W+0.22,KZ-1.42,0.2),Ps(0.25),Do(function(){openK('fridge',true); pose('reachmid');}),Ps(1.4)];}
function fridgeShut(){return [Ps(0.3),Do(function(){openK('fridge',false); pose(null);}),Ps(0.5)];}
function cupboardTake(what){return [Wk(X0+0.6,KZ-1.02,0),Ps(0.25),Do(function(){openK('cab',true); pose('reach');}),Ps(1.1),Do(function(){carry(what);}),Ps(0.3),Do(function(){openK('cab',false);}),Ps(0.45)];}
function toSink(n){return [Do(function(){doing('taking the dishes to the sink');}),Wk(SX,KZ-1.02,0),Ps(0.3),Do(function(){carry(null); plateFood(true); dishes(st.dishes+n); AU.blip('click');})];}
const wv=new THREE.Vector3(), wq=new THREE.Quaternion();
function shown(o){for(;o;o=o.parent) if(!o.visible) return false; return true;}
function cupSpot(){              // the espresso machine in this layout: where the cup stands under the spout, and where you stand to brew
  for(let i=0;i<K.espressos.length;i++){const m=K.espressos[i]; if(!shown(m)) continue;
    m.updateMatrixWorld(true); const c=m.userData.cup.getWorldPosition(new THREE.Vector3()); wv.set(1,0,0).applyQuaternion(m.getWorldQuaternion(wq));
    return {c:c,s:{sx:c.x+wv.x*0.6,sz:c.z+wv.z*0.6,h:Math.atan2(-wv.x,-wv.z)},obj:m};}
  return null;
}
const DO={
  shoes:function(){
    begin();
    chain([Do(function(){doing('at the door');}),Wk(SM.EX+0.35,L-0.8,0),Ps(0.2),Do(function(){pose('reachlow');}),Ps(0.9),
      Do(function(){const p=me(), off=p.p.shoesOn; p.p.shoes(!off); pose(null); doing(''); SM.toast(off?'Shoes off. The floor stays clean.':'Shoes on.'); if(off) goal('shoes'); hud();})]);
  },
  coffee:function(){
    const q=cupSpot(); if(!q){SM.toast('No coffee machine in this layout.'); return;} begin('coffee');
    chain([Do(function(){doing('getting a cup'); coffee.visible=false;})].concat(cupboardTake('cup'),[
      Do(function(){doing('making coffee');}),Wk(q.s.sx,q.s.sz,q.s.h),Ps(0.3),
      Do(function(){carry(null); props.add(cup); cup.rotation.set(0,0,0); cup.position.copy(q.c); cup.visible=true; pose('reachmid'); AU.blip('pour'); brew.position.set(q.c.x,q.c.y+0.06,q.c.z); brew.visible=true;}),
      Ps(2.4),Do(function(){brew.visible=false; coffee.visible=true; mode='brewed'; pose(null);}),Ps(0.7),
      Do(function(){carry('cup'); mode='sip'; pose('drink'); doing('drinking coffee');}),Ps(5),Do(function(){pose(null); mode='coffee';})],
      toSink(1),[Do(function(){doing(''); me().say('That is better.'); goal('coffee'); hud();})]));
  },
  cook:function(){
    begin('cook');
    chain([Do(function(){doing('getting the pan');}),Wk(KX-1.5,1.25,R),Ps(0.25),Do(function(){openK('drawer',true); pose('reachlow');}),Ps(1.1),
      Do(function(){st.panOut=true; panFood.visible=false; carry('pan');}),Ps(0.3),Do(function(){openK('drawer',false);}),Ps(0.3),
      Wk(HOB[0],0.98,R),Ps(0.3),Do(function(){carry(null); props.add(pan); pan.position.set(HOB[0],0.96,HOB[1]); pan.rotation.set(0,-2.2,0); pan.visible=true; hot=true; AU.blip('click');}),Ps(0.4),
      Do(function(){doing('getting food from the fridge');})].concat(fridgeOpen(),[Do(function(){carry('food');})],fridgeShut(),[
      Do(function(){doing('throwing the wrapping away');}),Wk(SX,KZ-1.3,0),Ps(0.2),Do(function(){openK('bin',true); pose('reachlow');}),Ps(1.1),Do(function(){openK('bin',false); pose(null);}),Ps(0.5),
      Wk(HOB[0],0.98,R),Ps(0.3),Do(function(){pose('reachmid');}),Ps(0.6),
      Do(function(){const p=me(); carry(null); panFood.visible=true;
        p.p.hand.add(spatula); spatula.position.set(0,-0.3,0.02); spatula.rotation.set(0,0,0); spatula.visible=true; pose('cook'); mode='cooking'; AU.loop('sizzle',true); doing('cooking');
        if(partner&&!partner.busy) partner.say(['Smells good!','What are you making?','I am starving.'][Math.floor(Math.random()*3)],3);}),
      Ps(8),Do(function(){mode='cook'; hot=false; AU.loop('sizzle',false); hide(panSteam); props.add(spatula); spatula.visible=false; pose(null); doing('getting plates'); plateFood(false);})],
      cupboardTake('plates'),[Wk(HOB[0]-0.3,0.98,R),Ps(0.3),Do(function(){pose('reachmid');}),Ps(0.7),Do(function(){panFood.visible=false; plateFood(true); pose(null); SM.toast('Lunch is ready.'); eat();})]));
  },
  snack:function(){
    begin('snack');
    chain([Do(function(){doing('getting a plate'); plateFood(false);})].concat(cupboardTake('plate'),[Do(function(){doing('getting something from the fridge');})],fridgeOpen(),[Do(function(){plateFood(true);})],fridgeShut(),[
      Do(function(){const p=me(); doing('having a snack'); p.p.handL.add(plateH); plateH.position.set(0,-0.31,0.045); p.p.act='eat';}),Ps(4.5),Do(function(){plateFood(false); carry('plate'); me().say('Mmm.');})],
      toSink(1),[Do(function(){doing(''); hud();})]));
  },
  wash:function(){
    if(!st.dishes){SM.toast('The sink is empty.'); return;}
    begin('wash');
    chain([Do(function(){doing('going to the sink');}),Wk(SX,KZ-1.02,0),Ps(0.3),
      Do(function(){tapOn(true,true); pose('wash'); doing('washing the dishes');
        (function one(){later(1.2,function(){dishes(st.dishes-1); AU.blip('click'); if(st.dishes>0){one(); return;}
          tapOn(false); later(0.7,function(){suds.visible=false; st.panOut=false; pose(null); doing(''); SM.toast('Sink is clear.'); goal('dishes'); hud();});});})();})]);
  },
  study:function(){
    const s=SM.firstFree(['desk2','desk1','desk3']); if(!s){SM.toast('No free desk.'); return;}
    begin('study'); const dk=A.desks[s.id], p=me(); doing('going to study');
    p.sitOn(s,function(){
      const cx=dk.chair.position.x, cz=dk.chair.position.z, px=p.x, pz=p.z;
      s.onLeave=function(){s.onLeave=null; dk.screen.target=0; const fx=dk.chair.position.x, fz=dk.chair.position.z; tween(0.5,function(e){dk.chair.position.x=fx+(cx-fx)*e; dk.chair.position.z=fz+(cz-fz)*e; A.touch(2);},null,true);};
      tween(0.7,function(e){const o=0.2*e; dk.chair.position.x=cx+dk.dir[0]*o; dk.chair.position.z=cz+dk.dir[1]*o; p.x=px+dk.dir[0]*o; p.z=pz+dk.dir[1]*o; A.touch(2);},function(){
        dk.screen.target=1; AU.blip('click'); pose('type'); doing('studying');
        (function chapter(){later(10,function(){st.chapters++; SM.toast('Chapter '+st.chapters+' done.'); goal('study'); chapter();});})();
      });
    });
  },
  tv:function(show){
    begin('tv'); K.tvShow=show||'netflix'; A.set('tv',1); AU.blip('click'); doing('going to watch '+(K.tvShow==='football'?'the match':'Netflix'));
    const s=SM.firstFree(['sofaM','sofaL','sofaR']); if(!s) return;
    me().sitOn(s,function(){doing(K.tvShow==='football'?'watching football together':'watching Netflix together');});
    if(partner){const q=SM.firstFree(['sofaR','sofaL','sofaM'].filter(function(i){return i!==s.id;})); if(q){partner.busy=true; partner.sitOn(q,function(){partner.say(K.tvShow==='football'?'Come on!':'What are we watching?');});}}
  },
  tvOff:function(){A.set('tv',0); AU.blip('click'); SM.refresh(); hud();},
  toilet:function(id,standing){
    const t=WCs[id], p=me(), fem=SM.who==='angela', room=id==='guest'?'wc':'bath'; begin('toilet');
    chain([Do(function(){doing('going to the toilet');}),Wk(t.x-0.62,t.z,R/2),Ps(0.2),
      Do(function(){A.door(t.door).force=0; A.set('L:'+room,1); SM.renderRooms(); t.lid.target=1; t.seat.target=standing?1:0; pose('reachlow'); AU.blip('click');
        if(!standing&&t.seatUp&&fem) p.say('Who left the seat up?',2.5); t.seatUp=!!standing;}),
      Ps(0.9),Do(function(){pose('undress'); AU.blip('zip');}),Ps(0.55),
      Do(function(){p.p.pants(standing?1:2); setCensor(p,'hips');
        if(standing){slideTo(t.x-0.42,t.z,0.4); pose('pee'); doing('at the toilet');}
        else{pose(null); p.settle({id:'wc_'+id,x:t.x-0.02,z:t.z,y:0.6,h:-R/2,type:'sit'},null); doing('on the toilet');}}),
      Ps(standing?5:6.5),
      Do(function(){if(!standing) p.release(); pose('undress');}),Ps(0.75),Do(function(){p.p.pants(0); setCensor(null); AU.blip('zip'); pose(null);}),Ps(0.35),
      Do(function(){AU.blip('flush'); if(fem||!standing) t.lid.target=0; else if(partner) SM.later(7,function(){partner.say('Seat down, please!',3);},st); doing('washing hands');}),
      Wk(t.basin[0],t.basin[1],0),Ps(0.2),Do(function(){pose('wash'); basinTap(id);}),Ps(1.8),
      Do(function(){basinTap(null); pose(null); A.door(t.door).force=null; doing(''); hud();})]);
  },
  shower:function(where){
    const p=me(); begin('shower');
    chain([Do(function(){doing('heading for the shower');}),Wk(SP.ax,SP.az,R),Ps(0.2),
      Do(function(){A.door('bath').force=0; A.set('L:bath',1); SM.renderRooms(); doing('undressing'); pose('undress');}),Ps(1.1),
      Do(function(){const o=OUTFITS[SM.who][st.outfit]; [o.top,o.pants,o.top].forEach(function(c,i){recolor(heapM[i],c);});
        if(where==='toilet'){WCs.bath.lid.target=0; WCs.bath.seat.target=0; heap.position.set(BA.x1-0.3,0.66,tzB);} else heap.position.set(BA.x0+0.42,0.9,BA.z0+0.5);
        heap.visible=true; p.p.nude(true); setCensor(p,'body'); pose(null); slideTo(SP.x,SP.z,0.7);}),
      Ps(0.8),Do(function(){showerFx(true); pose('shower'); mode='showering'; doing('in the shower');}),Ps(10),
      Do(function(){showerFx(false); mode='shower'; pose(null); doing('drying off'); slideTo(SP.ax,SP.az,0.7); p.hT=R;}),Ps(0.9),
      Do(function(){pose('undress');}),Ps(1.2),
      Do(function(){p.p.nude(false); setCensor(null); heap.visible=false; pose(null); A.door('bath').force=null; doing(''); SM.toast('Fresh and clean.'); goal('shower'); hud();})]);
  },
  flop:function(){
    const s=SM.seatBy('sofaLie'), p=me(); if(!s) return; begin('flop');
    if(partner){const ps=partner.seat||partner.held; if(ps&&ps.id.indexOf('sofa')===0) roam(true);}
    p.speed=2.5; doing('running to the sofa');
    p.sitOn(s,function(){p.speed=1.4; pose('flop'); doing('flopped on the sofa'); p.say('Aaah.');});
  },
  massage:function(giving){
    if(!partner) return;
    const giver=giving?me():partner, taker=giving?partner:me(), a=SM.seatBy('sofaL'), b=SM.seatBy('sofaM'); if(!a||!b) return;
    if(a.occ&&a.occ!==giver&&a.occ!==taker||b.occ&&b.occ!==giver&&b.occ!==taker){SM.toast('The sofa is taken.'); return;}
    begin('massage'); partner.busy=true; partner.release(); me().release(); doing(giving?'giving a massage':'getting a massage');
    let n=0; const ready=function(){if(++n<2) return; giver.hT=R/2-0.85; taker.hT=R/2-0.85; giver.p.act='massage'; taker.say('Mmm…',3);
      later(9,function(){giver.p.act=null; giver.hT=taker.hT=R/2; taker.say('Thank you ♥',2.5); goal('massage'); partner.busy=false; doing('sitting on the sofa');});};
    taker.sitOn(b,ready); giver.sitOn(a,ready);
  },
  sleep:function(){
    const a=SM.seatBy('bedR'), b=SM.seatBy('bedL'); if(!a) return; begin('sleep'); const p=me(); if(st.carry) carry(null);
    SM.setEvening(true); for(const k in A.rooms) if(!A.rooms[k].ext) A.set('L:'+k,k==='bed2'||k==='hall'?1:0); A.set('tv',0); music(-1); SM.renderRooms();
    const side=SM.nearestXZ(a.x+Math.sin(a.h)*0.3+0.2,a.z+Math.cos(a.h)*0.3+0.9)||[a.x,a.z+1], both=!!(partner&&b); let ready=0;
    const t0=tok, tuck=function(){if(t0!==tok||++ready<(both?2:1)) return; coverT=1; later(1.4,function(){A.set('L:bed2',0); A.set('L:hall',0); SM.renderRooms(); st.asleep=true; p.sleep(true); if(both) partner.sleep(true); doing('asleep together'); goal('sleep'); hud();});};
    const change=function(who,then){who.p.twirl=1; later(0.45,function(){st.pj=true; who.p.outfit(true);}); later(1.0,then);};
    doing('getting ready for bed');
    if(both){partner.busy=true; partner.release(); partner.goTo(side[0]+0.4,side[1]+0.3,function(){if(t0===tok) change(partner,function(){partner.sitOn(b,tuck);});});}
    walk(side[0],side[1],null,function(){change(p,function(){doing('getting into bed'); p.sitOn(a,tuck);});});
  },
  wake:function(){
    begin(); SM.setEvening(false); ['kitchen','bed1','bed2'].forEach(function(w){A.set('S:'+w,1);}); SM.renderRooms();
    me().release(); if(partner){partner.release(); partner.say('Good morning.'); partner.busy=false; partner.next=A.t+6;}
    doing(''); SM.toast('Good morning.'); hud();
  },
  wardrobe:function(){
    begin();
    chain([Do(function(){doing('at the wardrobe');}),Wk(D.NX+1.0,-1.27,-R/2),Ps(0.25),Do(function(){pose('reachmid');}),Ps(0.9),
      Do(function(){pose(null); me().p.twirl=1;}),Ps(0.45),
      Do(function(){const p=me(), list=OUTFITS[SM.who], old=list[st.outfit]; recolor(bundleM[1],old.top); recolor(bundleM[2],old.pants);
        st.outfit=(st.outfit+1)%list.length; p.p.outfit(false); p.p.setClothes(list[st.outfit]);}),Ps(0.6),
      Do(function(){carry('clothes'); doing(''); goal('clothes'); SM.toast('Changed. Drop the old clothes on the armchair, or take them to the washing machine.'); hud();})]);
  },
  drop:function(){
    const s=SM.seatBy('nook')||SM.seatBy('armA')||SM.seatBy('desk3'); if(!s||st.carry!=='clothes') return;
    begin(); doing('carrying clothes');
    walk(s.x+Math.sin(s.h)*0.65,s.z+Math.cos(s.h)*0.65,s.h+R,function(){carry(null); st.pile=s.id; pile.position.set(s.x,s.y+0.08,s.z); pile.visible=true; doing(''); me().say('Later.'); hud();});
  },
  laundry:function(){
    if(st.wash>0){SM.toast('The machine is still running.'); return;}
    begin('laundry'); doing('doing the laundry');
    const load=[Wk(BA.x0+0.55,BA.z0+1.0,R),Ps(0.3),Do(function(){pose('reachlow'); AU.blip('click');}),Ps(1.2),
      Do(function(){carry(null); st.pile=null; pile.visible=false; st.wash=45; st.washDone=false; AU.blip('beep'); AU.loop('washer',true); pose(null); doing(''); SM.toast('The wash is on. 45 seconds on the timer.'); hud();})];
    if(st.pile&&st.carry!=='clothes'){const s=SM.seatBy(st.pile); if(s){chain([Wk(s.x+Math.sin(s.h)*0.65,s.z+Math.cos(s.h)*0.65,null),Do(function(){pile.visible=false; st.pile=null; carry('clothes');})].concat(load)); return;}}
    chain(load);
  },
  hang:function(){
    const q=rackSpot(); if(!st.washDone||!q) return; begin('hang');
    chain([Do(function(){doing('emptying the machine');}),Wk(BA.x0+0.55,BA.z0+1.0,R),Ps(0.3),Do(function(){pose('reachlow'); AU.blip('click');}),Ps(1.0),Do(function(){st.washDone=false; carry('wet'); doing('hanging the laundry');}),
      Wk(q.sx,q.sz,q.h),Ps(0.3),Do(function(){pose('reach');}),Ps(1.8),Do(function(){carry(null); st.hung=true; doing(''); SM.toast('The laundry is drying.'); goal('laundry'); hud();})]);
  },
  book:function(){
    const q=shelf(); if(!q) return; begin();
    chain([Do(function(){doing(st.carry==='book'?'putting the book back':'choosing a book');}),Wk(q.sx,q.sz,q.h),Ps(0.25),Do(function(){pose('reachmid');}),Ps(1.0),Do(function(){carry(st.carry==='book'?null:'book'); doing(''); hud();})]);
  },
  read:function(){
    const q=shelf(); if(st.carry!=='book'&&!q){SM.toast('No bookshelf here.'); return;}
    begin('read');
    const sit=function(){const s=SM.firstFree(['sofaM','sofaR','sofaL','nook']); if(!s) return; doing('finding a seat');
      me().sitOn(s,function(){const p=me(); carry(null); st.carry='book'; p.p.lap.add(openBook); openBook.position.set(0,0,0); openBook.visible=true; mode='reading'; pose('read'); doing('reading');
        s.onLeave=function(){s.onLeave=null; if(openBook.visible){openBook.visible=false; if(st.carry==='book') carry('book');}};
        later(9,function(){goal('read');});});};
    if(st.carry==='book'){sit(); return;}
    chain([Do(function(){doing('choosing a book');}),Wk(q.sx,q.sz,q.h),Ps(0.25),Do(function(){pose('reachmid');}),Ps(1.0),Do(function(){carry('book'); sit();})]);
  },
  record:function(dir){
    const q=front('music',0.7); if(!q){SM.toast('There is no record player in this design. Add one in Design, Edit layout.'); return;} begin();
    chain([Do(function(){doing('at the record player');}),Wk(q.sx,q.sz,q.h),Ps(0.25),Do(function(){pose('reachmid');}),Ps(0.9),
      Do(function(){pose(null); doing(''); if(dir===0) music(-1); else{music(st.track<0?0:st.track+1); goal('record'); if(partner) partner.say(['Love this one.','Turn it up!','Nice.'][st.track%3]);} hud();})]);
  },
  vacuum:function(){
    begin('vacuum'); const p=me(); doing('getting the vacuum');
    walk(D.BLK-0.45,L-0.6,0.6,function(){
      if(A.vacuumMesh) A.vacuumMesh.visible=false; p.p.g.add(vac); vac.visible=true; AU.loop('vacuum',true); pose('vacuum'); doing('vacuuming');
      const pts=dirt.map(function(m){return [m.position.x,m.position.z];});
      [[0.9,4.9],[2.2,2.2],[1.2,1.4],[W+1.2,1.4],[1.9,3.3]].forEach(function(q){pts.push(q);});
      const route=[]; let cx=p.x, cz=p.z;
      while(pts.length&&route.length<26){let bi=0, bd=1e9; pts.forEach(function(q,i){const d=Math.hypot(q[0]-cx,q[1]-cz); if(d<bd){bd=d; bi=i;}}); const q=pts.splice(bi,1)[0]; if(bd>0.35) route.push(q); cx=q[0]; cz=q[1];}
      (function next(){
        if(!route.length){walk(D.BLK-0.45,L-0.6,0.6,function(){AU.loop('vacuum',false); p.p.g.remove(vac); vac.visible=false; if(A.vacuumMesh) A.vacuumMesh.visible=true; dirt.slice().forEach(function(m){cleanNear(m.position.x,m.position.z,0.1);}); pose(null); doing(''); SM.toast('The flat is clean.'); goal('vacuum'); mode=''; hud();}); return;}
        const q=route.shift(); walk(q[0],q[1],null,next);
      })();
    });
  }
};
function music(i){if(i<0){st.track=-1; AU.stop(); return;} st.track=((i%AU.tracks.length)+AU.tracks.length)%AU.tracks.length; st.trackT=A.t; AU.play(st.track); SM.toast('Now playing: '+AU.tracks[st.track]+'.');}
function shelf(){return firstPiece(['kbench','towerB','towerA','benchB','tvOld'],0.75)||(ST.design!=='n'?{sx:D.BX-0.8,sz:-0.75,h:R/2,obj:[D.BX-0.31,D.BX-0.01,0,0.82,-1.25,-0.25]}:null);}
function rackSpot(){const p=A.pieces.rack1; if(!p||p.to[3]<1) return null; const f=p.to[2]; return {x:p.to[0],z:p.to[1],sx:p.to[0]+Math.sin(f)*0.62,sz:p.to[1]+Math.cos(f)*0.62,h:f+R,obj:p.g};}
function eat(){
  const n=ST.design==='n', ids=n?['chairB','chairA']:['gc1','gc2'];
  mode='eat'; if(!n&&ST.table===0) A.setTable(2);
  const t=tok;
  SM.afterLayout(function(){
    if(t!==tok) return;
    const a=SM.seatBy(ids[0]), b=SM.seatBy(ids[1]); if(!a) return;
    doing('bringing the plates to the table');
    if(partner&&b){partner.busy=true; partner.sitOn(b,function(){});}
    me().sitOn(a,function(){
      carry(null); [a,b].forEach(function(s,i){if(!s) return; const g=plates[i]; g.position.set(s.x+Math.sin(s.h)*0.36,0.775,s.z+Math.cos(s.h)*0.36); g.visible=true;});
      pose('eat'); if(partner&&partner.seat===b) partner.p.act='eat'; doing('eating together');
      later(9,function(){
        if(partner){partner.p.act=null; partner.busy=false; partner.say('That was great.');} plates.forEach(function(g){g.visible=false;}); goal('cook');
        me().release(); plateFood(false); carry('plates');
        chain(toSink(3).concat([Do(function(){pan.visible=false; doing(''); SM.toast('Plates and the pan are in the sink.'); hud();})]));
      });
    });
  });
}

/* ---------- things in the flat you can walk up to and use ---------- */
function items(){
  const out=[], p=me();
  const add=function(name,q,acts,box){if(q) out.push({name:name,x:q.x==null?q.sx:q.x,z:q.z==null?q.sz:q.z,sx:q.sx,sz:q.sz,h:q.h,acts:acts,box:box||q.obj||null});};
  const around=function(s,rx,rz,y1){return [s.x-rx,s.x+rx,0,y1,s.z-rz,s.z+rz];}, en=D.entrance;
  add('Front door and shoes',{x:SM.EX+0.4,z:L-0.3,sx:SM.EX+0.35,sz:L-0.8,h:0},[[p.p.shoesOn?'Take shoes off':'Put shoes on',DO.shoes]],[en[0],en[1],0,2.05,L-0.08,L]);
  add('Cooktop',{x:HOB[0],z:HOB[1],sx:HOB[0],sz:0.98,h:R},[['Cook a meal',DO.cook]],[KX-0.68,KX-0.08,0.1,0.96,0.02,0.62]);
  add('Fridge',{x:W+0.36,z:KZ-0.36,sx:W+0.22,sz:KZ-1.42,h:0.2},[['Grab a snack',DO.snack]],[W+0.01,W+0.71,0,1.75,KZ-0.72,KZ]);
  const cs=cupSpot(); if(cs) add('Espresso machine',{x:cs.c.x,z:cs.c.z,sx:cs.s.sx,sz:cs.s.sz,h:cs.s.h},[['Make a coffee',DO.coffee]],cs.obj);
  add('Television',firstPiece(['tvOld','kbench','benchB','benchA'],1.1),[['Netflix',function(){DO.tv('netflix');}],['Football',function(){DO.tv('football');}]].concat(A.goal('tv')>0.5?[['Turn it off',DO.tvOff]]:[]));
  add('Sink',{x:SX,z:KZ-0.32,sx:SX,sz:KZ-1.02,h:0},[[st.dishes?'Wash the dishes ('+st.dishes+')':'Sink is clean',DO.wash]],[SX-0.31,SX+0.31,0.86,1.25,KZ-0.56,KZ-0.03]);
  const tacts=function(id){return SM.who==='angela'?[['Use the toilet',function(){DO.toilet(id,false);}]]:[['Pee standing up',function(){DO.toilet(id,true);}],['Sit down',function(){DO.toilet(id,false);}]];};
  add('Guest toilet',{x:WCS.x1-0.45,z:mzW,sx:WCS.x1-1.07,sz:mzW,h:R/2},tacts('guest'),[WCS.x1-0.7,WCS.x1-0.2,0,0.7,mzW-0.2,mzW+0.2]);
  add('Toilet',{x:BA.x1-0.28,z:tzB,sx:BA.x1-0.9,sz:tzB,h:R/2},tacts('bath'),[BA.x1-0.53,BA.x1-0.03,0,0.7,tzB-0.2,tzB+0.2]);
  add('Sofa',front('sofa',1.0),[['Flop down',DO.flop],['Give a massage',function(){DO.massage(true);}],['Ask for a massage',function(){DO.massage(false);}]]);
  add('Record player',front('music',0.7),st.track<0?[['Play a record',function(){DO.record(1);}]]:[['Next record',function(){DO.record(1);}],['Stop',function(){DO.record(0);}]]);
  add('Bookshelf',shelf(),[[st.carry==='book'?'Put the book back':'Take a book',DO.book],['Read on the sofa',DO.read]]);
  add('Wardrobe',{x:D.NX+0.25,z:-1.27,sx:D.NX+1.0,sz:-1.27,h:-R/2},[['Change clothes',DO.wardrobe]],[D.NX,D.NX+0.51,0,1.9,-1.86,-0.68]);
  const ch=SM.seatBy('nook')||SM.seatBy('armA')||SM.seatBy('desk3');
  if(ch&&(st.carry==='clothes'||st.pile)) add(st.pile?'Clothes on the chair':'Armchair',{x:ch.x,z:ch.z,sx:ch.x+Math.sin(ch.h)*0.65,sz:ch.z+Math.cos(ch.h)*0.65,h:ch.h+R},st.pile?[['Take them to the wash',DO.laundry]]:[['Drop the clothes here',DO.drop]],around(ch,0.45,0.45,1.0));
  add('Washing machine',{x:A.washer.x,z:A.washer.z,sx:BA.x0+0.55,sz:BA.z0+1.0,h:R},st.wash>0?[['Washing… '+clock(st.wash),function(){SM.toast('Still washing.');}]]:st.washDone?[['Hang the laundry',DO.hang]]:[['Do the laundry',DO.laundry]],[BA.x0+0.2,BA.x0+0.8,0,0.86,BA.z0+0.03,BA.z0+0.63]);
  add('Vacuum cleaner',{x:D.BLK-0.1,z:L-0.14,sx:D.BLK-0.45,sz:L-0.6,h:0.6},[['Vacuum the flat',DO.vacuum]],A.vacuumMesh);
  const dk=SM.seatBy('desk2')||SM.seatBy('desk1'); if(dk) add('Desk',{x:dk.x,z:dk.z,sx:dk.x,sz:dk.z,h:dk.h},[['Study',DO.study]],around(dk,0.7,0.7,1.2));
  const bd=SM.seatBy('bedR'); if(bd) add('Bed',{x:bd.x,z:bd.z,sx:bd.x,sz:bd.z,h:bd.h},[[st.asleep?'Wake up':'Go to sleep together',st.asleep?DO.wake:DO.sleep]],bedBox(bd));
  add('Shower',{x:SP.x,z:SP.z,sx:SP.ax,sz:SP.az,h:0},[['Shower, clothes on the washer',function(){DO.shower('washer');}],['Shower, clothes on the toilet',function(){DO.shower('toilet');}]],[BA.x1-0.9,BA.x1,0,2.3,BA.z0,BA.z0+0.95]);
  return out;
}
function bedBox(b){return ST.design==='n'?[b.x-1.15,b.x+0.4,0,0.62,b.z-1.15,b.z+0.95]:[b.x-1.15,b.x+0.9,0,0.62,b.z-1.1,b.z+0.4];}
function clock(s){s=Math.ceil(s); return Math.floor(s/60)+':'+('0'+s%60).slice(-2);}
const tp=new THREE.Vector3();
let focus=null;
/* A thin yellow line round the thing you are looking at: each of its parts is redrawn slightly larger,
   back faces only, so just a rim shows round the silhouette. */
const hl=new THREE.Group(); hl.visible=false; hl.userData.nc=true; A.scene.add(hl);
const hlMat=new THREE.MeshBasicMaterial({color:0xF4D53A,side:THREE.BackSide}), RIM=0.0045;
const bx=new THREE.Box3(), tb=new THREE.Box3(), labelAt=new THREE.Vector3(), cv=new THREE.Vector3(), sv=new THREE.Vector3(), mA=new THREE.Matrix4(), mB=new THREE.Matrix4();
let hlKey=null, hlSrc=[];
function solidMesh(o){             // leaves, glass and other see-through or two-sided things have no rim
  if(!o.isMesh||o.isInstancedMesh||!o.geometry||o.userData.floor) return false;
  const m=Array.isArray(o.material)?o.material[0]:o.material; return !m.transparent&&!m.alphaTest&&m.side===THREE.FrontSide;
}
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
const washTag=A.tag('','say');
A.labelFns.push(function(){            // the action label floats on the outlined thing; the washing machine shows its timer
  const bar=$('useBar'), p=me();
  if(!bar.hidden){
    tp.copy(labelAt).project(A.camera); const w=A.stage.clientWidth, h=A.stage.clientHeight;
    let x=(tp.x+1)/2*w, y=(1-tp.y)/2*h; if(tp.z>1){x=w/2; y=h*0.3;}
    bar.style.left=Math.max(90,Math.min(w-90,x))+'px'; bar.style.top=Math.max(70,Math.min(h-20,y))+'px';
  }
  tp.set(A.washer.x,1.3,A.washer.z+0.2); A.place(washTag,tp,!!(A.simsOn&&p&&(st.wash>0||st.washDone)&&Math.hypot(p.x-A.washer.x,p.z-A.washer.z)<3.5&&(focus?focus.name!=='Washing machine':true)));
});
function hud(){
  const bar=$('useBar'), p=me();
  if(!A.simsOn||!p){bar.hidden=true; hl.visible=false; return;}
  if(!st.asleep&&SM.getDoing()){bar.hidden=true; hl.visible=false; focus=null; return;}      // busy or walking: no prompt in the way
  let best=pin, bs=1e9; const f=SM.view(), fx=Math.sin(f), fz=Math.cos(f), list=items();
  if(pin){best=null; list.forEach(function(it){if(it.name===pin.name) best=it;}); if(A.t-pinT>7||!best) pin=best=null;}
  if(!best) list.forEach(function(it){                         // the usable thing nearest the centre of the character's view
    const keep=focus&&focus.name===it.name;
    const dx=it.x-p.x, dz=it.z-p.z, d=Math.hypot(dx,dz); if(d>(keep?3.6:3.2)) return;
    const c=d<0.4?1:(dx*fx+dz*fz)/d; if(c<(keep?0.72:0.82)) return;                   // within about 35 degrees of straight ahead
    const s=(1-c)*4+d*0.12-(keep?0.12:0); if(s<bs){bs=s; best=it;}
  });
  if(st.asleep){const b0=SM.seatBy('bedR'); best={name:'Asleep',acts:[['Wake up',DO.wake]],box:b0?bedBox(b0):null};}
  focus=best;
  if(!best){bar.hidden=true; outline(null); return;}
  if(!outline(best.box,best.name+ST.design+ST.table)) labelAt.set(best.x==null?p.x:best.x,1.5,best.z==null?p.z:best.z);
  const key=best.name+'|'+best.acts.map(function(a){return a[0];}).join('|');
  if(bar.dataset.k!==key){bar.dataset.k=key; $('useName').textContent=best.name; $('useBtns').innerHTML=best.acts.map(function(a,i){return '<button class="fab" data-i="'+i+'">'+a[0]+'</button>';}).join('');}
  bar.hidden=false;
}
$('useBtns').onclick=function(e){const b=e.target.closest('button'); if(b&&focus&&focus.acts[+b.dataset.i]){pin=null; AU.unlock(); focus.acts[+b.dataset.i][1]();}};
function tap(ray){               // tap a thing in the room: walk up to it
  let best=null, bd=1e9; items().forEach(function(it){if(it.sx==null) return; tp.set(it.x,0.8,it.z); const d=ray.distanceToPoint(tp); if(d<0.42&&d<bd){bd=d; best=it;}});
  if(!best||st.asleep) return false;
  begin(); pin=best; pinT=A.t+30; walk(best.sx,best.sz,best.h,function(){pinT=A.t; hud();}); return true;
}

/* ---------- panel ---------- */
function renderGoals(){$('goals').innerHTML=GOALS.map(function(g){return '<li class="'+(st.done[g[0]]?'done':'')+'">'+(st.done[g[0]]?'✓ ':'○ ')+g[1]+'</li>';}).join('');}
const PANEL=[['flop','Flop on the sofa'],['netflix','Watch Netflix'],['football','Watch football'],['record','Play a record'],['cook','Cook and eat'],['snack','Snack from the fridge'],['coffee','Make a coffee'],['wash','Wash the dishes'],
  ['shower','Take a shower'],['toilet','Use the toilet'],['study','Study'],['read','Read a book'],['wardrobe','Change clothes'],['laundry','Do the laundry'],['vacuum','Vacuum the flat'],['shoes','Shoes on / off'],['mgive','Give a massage'],['mget','Ask for a massage'],['sleep','Go to sleep together']];
$('lifeActs').innerHTML=PANEL.map(function(a){return '<button class="btn" data-a="'+a[0]+'">'+a[1]+'</button>';}).join('');
$('lifeActs').onclick=function(e){const b=e.target.closest('button'); if(!b) return; const a=b.dataset.a; AU.unlock();
  if(st.asleep){DO.wake(); return;}
  if(a==='netflix'||a==='football') DO.tv(a); else if(a==='shower') DO.shower('washer'); else if(a==='toilet') DO.toilet('guest',SM.who==='yoav'); else if(a==='record') DO.record(1);
  else if(a==='laundry'){if(st.washDone) DO.hang(); else DO.laundry();} else if(a==='mgive') DO.massage(true); else if(a==='mget') DO.massage(false); else if(DO[a]) DO[a]();};

/* ---------- the partner: lives here, potters about, joins in ---------- */
const LINES=['Coffee?','I like it here.','Did you water the plants?','Come sit with me.','Nice light today.','What shall we eat?'];
function spawnPartner(){
  if(partner){partner.remove(); const i=SM.extras.indexOf(partner); if(i>=0) SM.extras.splice(i,1);}
  partner=new SM.Actor(SM.LOOKS[SM.who==='angela'?'yoav':'angela']); partner.p.shoes(false);
  const c=SM.nearestXZ(2.0,1.7)||[2,1.7]; partner.x=c[0]; partner.z=c[1]; partner.h=partner.hT=0; partner.next=3; partner.busy=false; SM.extras.push(partner);
}
function roam(now){
  if(!partner||partner.busy&&!now) return;
  const lie=SM.seatBy('sofaLie'), full=!!(lie&&lie.occ);                 // someone is stretched out on the sofa: sit somewhere else
  const ids=['sofaR','nook','desk1','armA','benchA','sofaL'].filter(function(i){const s=SM.seatBy(i); return s&&!s.occ&&!(full&&i.indexOf('sofa')===0);});
  partner.busy=false; partner.next=A.t+25+Math.random()*25; partner.p.act=null;
  if(Math.random()<0.25||!ids.length){const c=SM.nearestXZ(W+1.2,1.5); if(c) partner.goTo(c[0],c[1],function(){partner.hT=R;}); return;}
  const s=SM.seatBy(ids[Math.floor(Math.random()*ids.length)]);
  partner.sitOn(s,function(){if(s.id!=='desk1') return; const sc=A.desks.desk1.screen; partner.p.act='type'; sc.target=1; s.onLeave=function(){s.onLeave=null; sc.target=0; partner.p.act=null;};});
}

/* =====================================================================
   Frame
   ===================================================================== */
A.frameFns.push(function(dt,t){          // runs in every mode: things that ease, spin or count down
  for(let i=tweens.length-1;i>=0;i--){const o=tweens[i]; if(o.tok&&o.tok!==tok){tweens.splice(i,1); continue;}
    o.t=Math.min(1,o.t+dt/o.dur); const k=o.t; o.fn(k*k*(3-2*k)); if(o.t>=1){tweens.splice(i,1); if(o.done) o.done();}}
  for(let i=0;i<movers.length;i++){const m=movers[i]; if(m.cur!==m.target){const d=m.target-m.cur, q=dt*m.rate; m.cur=Math.abs(d)<=q?m.target:m.cur+Math.sign(d)*q;
    const k=m.cur, v=m.closed+(m.open-m.closed)*k*k*(3-2*k); if(m.axis==='ry') m.o.rotation.y=v; else if(m.axis==='rz') m.o.rotation.z=v; else m.o.position.z=v; A.touch(2);}}
  KIT.n.visible=ST.design==='n'; KIT.abcdef.visible=ST.design!=='n'; KIT.pans.forEach(function(g){g.visible=!st.panOut;});
  props.visible=!!A.simsOn; rackWet.visible=st.hung&&!!A.simsOn;
  if(coverAmt!==coverT||coverKey!==bedKey()){coverKey=bedKey(); const d=coverT-coverAmt, q=dt/1.1; coverAmt=Math.abs(d)<=q?coverT:coverAmt+Math.sign(d)*q;
    for(const k in A.beds){const b=A.beds[k], on=k===bedKey()?coverAmt:0, e=on*on*(3-2*on); b.cover.visible=on>0.03; b.flat.visible=on<0.45; b.cover.scale[b.axis]=Math.max(0.05,e);} A.touch(2);}
  const mp=A.pieceFor?A.pieceFor('music'):A.pieces.music; if(mp&&mp.g.userData.disc){const d=mp.g.userData.disc, a=mp.g.userData.arm, on=st.track>=0; if(on) d.rotation.y-=dt*3.5; a.rotation.y+=((on?-0.2-Math.min(0.18,(t-st.trackT)*0.0012):0.12)-a.rotation.y)*Math.min(1,dt*3);}
  if(st.wash>0){st.wash-=dt; A.washer.drum.rotation.z+=dt*(Math.sin(t*0.5)>0?9:-9); if(st.wash<=0){st.wash=0; st.washDone=true; AU.loop('washer',false); if(A.simsOn){AU.blip('ding'); SM.toast('The washing is done. Hang it on the rack.');}}}
  const sec=Math.ceil(st.wash); if(sec!==A.washer.shown||st.washDone!==A.washer.doneShown){A.washer.shown=sec; A.washer.doneShown=st.washDone; const g=A.washer.canvas.getContext('2d');
    g.fillStyle='#0d1411'; g.fillRect(0,0,128,48); g.fillStyle=st.washDone?'#E8C91A':'#63C398'; g.font='bold 34px monospace'; g.textAlign='center'; g.fillText(st.wash>0?clock(st.wash):st.washDone?'End':'--:--',64,36); A.washer.tex.needsUpdate=true;
    washTag.textContent=st.wash>0?'Washing '+clock(st.wash):'Done. Hang it up';}
});
let acc=0, lastRoom=null, lastDrop=[0,0], sayT=20;
const cCol=new THREE.Color();
A.frameFns.push(function(dt,t){
  if(!A.simsOn||!me()) return;
  const p=me();
  if(partner){partner.update(dt); if(!partner.busy&&!st.asleep&&t>partner.next) roam(); if(!partner.busy&&t>sayT&&!st.asleep){sayT=t+30+Math.random()*30; partner.say(LINES[Math.floor(Math.random()*LINES.length)],3);}}
  if(p.room!==lastRoom){                                   // shoes and sand
    if(p.room==='hall'&&lastRoom&&!p.p.shoesOn) p.p.shoes(true);
    if(lastRoom==='hall'&&p.p.shoesOn&&!st.warned.shoes){st.warned.shoes=1; SM.toast('Shoes still on. Take them off at the door, or you will walk sand through the flat.');}
    lastRoom=p.room;
  }
  if(p.p.shoesOn&&p.room!=='hall'&&Math.hypot(p.x-lastDrop[0],p.z-lastDrop[1])>0.75){lastDrop=[p.x,p.z]; addDirt(p.x,p.z);}
  if(mode==='vacuum'&&vac.visible){cleanNear(p.x+Math.sin(p.h)*0.5,p.z+Math.cos(p.h)*0.5,0.6); K.vacuumHold(vac,p.p.hand);}
  // kitchen
  if(hot) hobGlow.material.opacity=0.55+0.12*Math.sin(t*9); else if(hobGlow.material.opacity>0) hobGlow.material.opacity=Math.max(0,hobGlow.material.opacity-dt);
  if(mode==='cooking'){steamAt(panSteam,t,HOB[0],1.0,HOB[1],0.08,0.8,0.24,0.5,0.45);
    panFood.children.forEach(function(m,i){m.position.y=-0.008+Math.max(0,Math.sin(t*6+i*1.7))*0.012; m.rotation.y+=dt*(i%2?2:-2);}); panFood.rotation.y+=dt*0.9;}
  if(tapStream.visible){tapStream.scale.x=tapStream.scale.z=1+0.25*Math.sin(t*31); tapRing.scale.setScalar(0.6+((t*2.2)%1)*1.6);}
  if(suds.visible) suds.children.forEach(function(m,i){m.position.y=A.sink.y0+0.008+Math.sin(t*2+i)*0.003; m.scale.setScalar(0.85+0.25*Math.sin(t*3+i*1.3));});
  if((mode==='brewed'||mode==='sip')&&cup.visible){cup.getWorldPosition(tp); steamAt(cupSteam,t,tp.x,tp.y+0.05,tp.z,0.015,0.22,0.07,0.35,0.6);} else if(cupSteam[0].visible) hide(cupSteam);
  if(mode==='reading'&&openBook.visible){const fl=openBook.userData.flip, k=(t%3.6)/0.6; fl.rotation.z=k<1?k*k*(3-2*k)*R:0; fl.visible=k<1;}
  // shower
  if(showerOn){
    const hy=SP.headY, top=1.5*p.p.sc;                 // water that lands on the head and shoulders stops there and sprays; the rest reaches the floor
    for(let i=0;i<NS;i++){const s=sSeed[i], end=s[6]<0.085?top-(s[6]/0.085)*0.16:0.02, k=(t*s[3]*(end>1?1.5:0.6)+s[2])%1, y=hy-k*(hy-end)-0.055; dm.makeTranslation(SP.x+s[0]+s[4]*k,y,SP.z+s[1]+s[5]*k); rain.setMatrixAt(i,dm);}
    rain.instanceMatrix.needsUpdate=true;
    const b=mGeo.attributes.position.array; for(let i=0;i<NM;i++){const hi=i%3===0, an=i*2.399+t*0.3, k=((t*2.6+i*0.618)%1), q=(hi?0.06:0.1)+((i*37)%100)/100*(hi?0.16:0.3)+k*0.08;
      b[i*3]=SP.x+Math.cos(an)*q; b[i*3+1]=(hi?top-0.1:0.02)+Math.sin(k*R)*(hi?0.1:0.14)*(i%4+1)/2; b[i*3+2]=SP.z+Math.sin(an)*q;}
    mGeo.attributes.position.needsUpdate=true; p.hT+=dt*0.45;
  }
  fog+=((showerOn?1:0)-fog)*Math.min(1,dt*(showerOn?0.5:0.25));
  if(fog>0.03) steamAt(showerSteam,t,SP.x,0.4,SP.z,0.34,2.0,0.55,0.42*fog,0.16); else if(showerSteam[0].visible) hide(showerSteam);
  A.showerGlass.opacity=0.35+0.4*fog; puddle.material.opacity=0.3*fog;
  if(cens){const a=cens.a, body=cens.part==='body', sc=a.p.sc;
    censor.position.set(a.x,body?0.95*sc:(0.9*sc)*(1-a.p.sit)+(a.p.seatY+0.14)*a.p.sit,a.z); censor.scale.set(body?0.62:0.46,body?1.0:0.4,1); censor.visible=true;
    if(t-cLast>0.12){cLast=t; cCol.set(a.spec.skin); for(let y=0;y<8;y++) for(let x=0;x<6;x++){const v=0.72+Math.random()*0.4; cG.fillStyle='rgb('+Math.min(255,cCol.r*255*v|0)+','+Math.min(255,cCol.g*255*v|0)+','+Math.min(255,cCol.b*255*v|0)+')'; cG.fillRect(x,y,1,1);} cTex.needsUpdate=true;}}
  if(st.track>=0&&Math.random()<dt*1.6){const q=front('music',0); if(q) note(q.x,q.z);}
  for(let i=notes.length-1;i>=0;i--){const o=notes[i]; o.t+=dt; o.p.y+=dt*0.35; A.place(o.e,o.p,o.t<2.2&&A.simsOn); if(o.t>2.4){o.e.remove(); notes.splice(i,1);}}
  acc+=dt; if(acc>0.2){acc=0; hud(); cushions(); const tn=A.rooms[p.room||'living'].tint; for(let i=0;i<pmats.length;i++) pmats[i].m.color.copy(pmats[i].b).multiply(tn); A.touch(1);}
});

/* ---------- loose cushions make room: one that would be inside somebody sitting or lying there is put away ---------- */
const cw=new THREE.Vector3();
function cushions(){
  const who=A.simsOn?[me(),partner].concat(SM.guests):[];
  for(let i=0;i<K.cushions.length;i++){const c=K.cushions[i]; let hit=false; c.getWorldPosition(cw);
    for(let j=0;j<who.length&&!hit;j++){const a=who[j]; if(!a||a.gone||!a.seat) continue;
      const fx=Math.sin(a.h), fz=Math.cos(a.h), dx=cw.x-a.x, dz=cw.z-a.z, sc=a.p.sc;
      if(a.p.lieT>0.5){const u=Math.max(-0.85*sc,Math.min(0.95*sc,dx*fx+dz*fz)); hit=Math.hypot(dx-fx*u,dz-fz*u)<0.42;}        // lying: anywhere along the body
      else hit=Math.hypot(dx+fx*0.12,dz+fz*0.12)<0.4&&cw.y<a.p.seatY+0.75;}
    if(c.visible===hit){c.visible=!hit; A.touch(2);}}
}

/* ---------- hooks from Sims mode ---------- */
A.life={
  enter:function(){
    if(!partner||partner.gone) spawnPartner();
    const p=me(); if(p&&!st.started){st.started=1; p.p.shoes(true); SM.toast('You just came home. Tap things to use them, or pick from the list.');}
    if(st.wash>0) AU.loop('washer',true);
    lastRoom=null; renderGoals(); hud();
  },
  reset:function(){cancel(); hl.visible=false; if(partner&&!partner.gone){partner.release(); partner.path=[]; partner.next=A.t+4; partner.busy=false;} pin=null; $('useBar').hidden=!A.simsOn;
    cushions();
    if(!A.simsOn){music(-1); AU.quiet(); hide(showerSteam); fog=0; A.showerGlass.opacity=0.35; notes.forEach(function(o){o.e.remove();}); notes.length=0;}},
  respawn:function(){spawnPartner(); st.outfit=0; carry(st.carry==='book'||st.carry==='clothes'||st.carry==='wet'?st.carry:null); hud();},
  cover:function(v){coverT=v;},
  tap:tap, state:st, DO:DO, open:openK, dishes:dishes, get partner(){return partner;}, dirt:dirt
};
})();
