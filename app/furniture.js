/* Haroe 10 — movable furniture, the design options and the Design tab */
(function(){
'use strict';
const A=window.APP, D=A.D, K=A.kit, W=D.W, L=D.L, H=D.H, KX=D.KX, KZ=D.KZ;
const box=A.box, cyl=A.cyl, sph=A.sph, M=A.M, G=A.G, scene=A.scene, canvasTex=A.canvasTex;
const R=Math.PI, OAK=0xc99a5b, INK=0x22262a, SAGE=A.SAGE, MUSTARD=0xd6a21e, TERRA=0xc4673f, CREAM=0xf3ebdc;
const pc=(D.painting[0]+D.painting[1])/2, DC=2.485;      // painting centre; centre of the wall between the two bedroom doors
const $=function(id){return document.getElementById(id);};

const P=A.pieces={};
function piece(id,opt,build){const g=G(); P[id]=Object.assign({id:id,g:g,cur:[0,0,0,0],to:[0,0,0,0],h:1},opt||{}); build(g); return P[id];}
/* stretch a unit bar (built 1 long on x) between two points in the xy plane */
function barXY(m,x0,y0,x1,y1){m.position.x=(x0+x1)/2; m.position.y=(y0+y1)/2; m.rotation.z=Math.atan2(y1-y0,x1-x0); m.scale.x=Math.hypot(x1-x0,y1-y0);}
function barYZ(m,y0,z0,y1,z1){m.position.y=(y0+y1)/2; m.position.z=(z0+z1)/2; m.rotation.x=Math.atan2(-(y1-y0),z1-z0); m.scale.z=Math.hypot(y1-y0,z1-z0);}
const tableFns=[];        // called with the table's open amount 0..1

A.inRoom('living',function(){
/* ---------- what is there today ---------- */
piece('sofa',{label:'Sofa',h:1.2,seats:[
  {id:'sofaL',label:'Sofa, left',lx:0.2,lz:-0.9,y:0.45,type:'sit',recline:0.22},
  {id:'sofaM',label:'Sofa, middle',lx:0.2,lz:0,y:0.45,type:'sit',recline:0.22},
  {id:'sofaR',label:'Sofa, right',lx:0.2,lz:0.9,y:0.45,type:'sit',recline:0.22},
  {id:'sofaLie',label:'Sofa',lx:0.16,lz:0,y:0.46,type:'lie',dh:-R/2}]},function(g){   // about 330 x 120 cm, three seats, big back cushions
  const c=0x1f5a41, d=0x194a36, len=3.3;
  box(1.2,0.42,len,c,0,0.21,0,g);
  box(0.3,0.44,len,d,-0.45,0.64,0,g);
  box(0.9,0.2,0.3,d,0.15,0.52,-len/2+0.15,g); box(0.9,0.2,0.3,d,0.15,0.52,len/2-0.15,g);
  [-0.9,0,0.9].forEach(function(z){box(0.88,0.03,0.88,0x226246,0.14,0.435,z,g); const p=box(0.22,0.44,0.84,0x246a4c,-0.22,0.68,z,g); p.rotation.z=0.22;});
  [-1.25,-0.45].forEach(function(z){K.cushion(g,0xe6dccb,-0.3,0.95,z,0.9);});
  const n=G(g,'abc');                                   // redesign: more cushions and a throw
  K.cushion(n,MUSTARD,-0.12,0.66,1.22,1); K.cushion(n,TERRA,-0.14,0.64,0.42,0.9,0.4); K.cushion(n,SAGE,-0.12,0.66,-0.86,1);
  box(0.95,0.03,0.5,CREAM,0.15,0.635,1.5,n); box(0.03,0.36,0.5,CREAM,0.615,0.47,1.5,n);
});
piece('table',{},function(g){                           // oak top on a black sled frame, 120 x 55
  box(0.55,0.05,1.2,OAK,0,0.45,0,g);
  [-0.57,0.57].forEach(function(z){box(0.03,0.42,0.03,0x1b1b1b,-0.24,0.21,z,g); box(0.03,0.42,0.03,0x1b1b1b,0.24,0.21,z,g); box(0.51,0.03,0.03,0x1b1b1b,0,0.015,z,g);});
  box(0.14,0.1,0.26,0x2c2a28,-0.05,0.525,-0.2,g); box(0.1,0.03,0.18,0xf4f4f1,-0.05,0.59,-0.2,g);   // tissue box
  cyl(0.06,0.1,0x2d2d2d,0.1,0.525,0.2,g); box(0.12,0.08,0.1,0x2d2d2d,-0.1,0.515,0.15,g);
});
piece('tvOld',{label:'TV',h:1.6},function(g){            // white TV bench 148 x 47 x 57 with open shelves, 55-inch TV
  const w=0xf3f3ef, len=1.48;
  box(0.47,0.035,len,w,0,0.555,0,g); box(0.45,0.03,len-0.04,w,0,0.12,0,g); box(0.43,0.02,len-0.08,w,0,0.33,0,g);
  [-len/2+0.02,-0.26,0.26,len/2-0.02].forEach(function(z){box(0.45,0.44,0.03,w,0,0.335,z,g);});
  [-len/2+0.03,len/2-0.03].forEach(function(z){box(0.05,0.11,0.05,w,-0.19,0.055,z,g); box(0.05,0.11,0.05,w,0.19,0.055,z,g);});
  box(0.015,0.44,len-0.04,0xe7e7e3,-0.215,0.335,0,g);
  K.tv(g,-0.02,0.96,0);
  [-0.4,0.4].forEach(function(z){box(0.24,0.03,0.03,0x101214,-0.02,0.59,z,g);});
  box(0.2,0.1,0.3,0xd9452e,0.05,0.18,0.2,g);
});
piece('station',{label:'Coffee station',h:2.25},function(g){   // 120 x 60 with pegboard above; back to the wall at -x
  box(0.6,0.04,1.2,OAK,0,0.9,0,g);
  [[-.26,-.56],[.26,-.56],[-.26,.56],[.26,.56]].forEach(function(p){box(0.04,0.88,0.04,0x1b1b1b,p[0],0.44,p[1],g);});
  box(0.3,0.36,0.26,0xc9ccd0,-0.08,1.1,0.05,g);                 // espresso machine
  box(0.16,0.4,0.14,0x2b2b2b,-0.1,1.12,-0.2,g);                 // grinder
  box(0.22,0.14,0.3,0xb98a4e,-0.1,0.99,0.42,g);                 // riser with jars
  cyl(0.05,0.1,0xe9e4d6,-0.08,1.11,0.36,g); cyl(0.045,0.08,0x3a4a5e,-0.08,1.1,0.49,g);
  box(0.012,0.56,0.76,0xf8f8f5,-0.29,1.75,-0.12,g);             // pegboard
  [-0.36,-0.14,0.08].forEach(function(z){cyl(0.045,0.08,0xb7bbbf,-0.25,1.9,z,g);});
  box(0.08,0.03,0.4,0xf3f3f0,-0.25,1.58,-0.2,g);
  box(0.008,0.3,0.22,0xd9463e,-0.294,1.8,0.52,g);               // poster
  const n=G(g,'abc'); box(0.5,0.02,1.1,OAK,0,0.3,0,n); box(0.3,0.2,0.4,0xd9c9a8,0,0.41,-0.3,n); box(0.3,0.2,0.4,0xd9c9a8,0,0.41,0.25,n);   // lower shelf with baskets
});
piece('dining',{label:'Dining table',h:1.2},function(g){        // white table, about 125 x 75
  box(1.25,0.04,0.75,0xfafaf7,0,0.74,0,g);
  [[-.57,-.32],[.57,-.32],[-.57,.32],[.57,.32]].forEach(function(p){box(0.05,0.72,0.05,0xf0f0ec,p[0],0.36,p[1],g);});
});
const chairSeat=function(id,label){return [{id:id,label:label,lx:0.02,lz:0,y:0.5,type:'sit'}];};
piece('chairA',{seats:chairSeat('chairA','Dining chair, left')},function(g){K.chair(g,0xf4f4f1,0x8fb59c);});
piece('chairB',{seats:chairSeat('chairB','Dining chair, right')},function(g){K.chair(g,0xf4f4f1,0x8fb59c);});
function rack(g){
  const s=0xb9bec2; box(1.5,0.02,0.55,s,0,0.9,0,g);
  const l1=box(0.02,1.0,0.02,s,-0.3,0.45,0,g); l1.rotation.z=0.5; const l2=box(0.02,1.0,0.02,s,0.3,0.45,0,g); l2.rotation.z=-0.5;
  box(0.5,0.4,0.5,0x2c3a55,0.3,0.72,0,g); box(0.4,0.5,0.5,0xf2f2f2,-0.4,0.67,0,g);
}
piece('rack1',{label:'Drying racks',h:1.3},rack); piece('rack2',{},rack);

/* ---------- rugs ---------- */
piece('rugA',{label:'Rug 200 × 300',h:0.25,lx:0.7,lz:1.3,isNew:true},function(g){K.rug(g,2.0,3.0,'jute');});
piece('rugB',{label:'Rug 200 × 300',h:0.25,lx:0.7,lz:1.3,isNew:true},function(g){K.rug(g,2.0,3.0,'stripe');});
piece('rugC',{label:'Kilim 200 × 300',h:0.25,lx:0.7,lz:1.3,isNew:true},function(g){K.rug(g,2.0,3.0,'kilim');});

/* ---------- option A: lift-top table. Coffee height by default, rises 32 cm and slides toward the sofa for lunch ---------- */
piece('lift',{label:'Lift-top table',h:1.0,isNew:true},function(g){
  box(0.6,0.2,1.3,OAK,0,0.22,0,g); box(0.56,0.012,1.26,0x8a6a3c,0,0.325,0,g);            // storage body
  [[-.26,-.6],[.26,-.6],[-.26,.6],[.26,.6]].forEach(function(p){box(0.04,0.12,0.04,INK,p[0],0.06,p[1],g);});
  const top=G(g); top.position.set(0,0.36,0);
  box(0.65,0.04,1.4,OAK,0,0,0,top);
  box(0.3,0.015,0.4,INK,0.05,0.028,-0.3,top); K.candle(top,0.0,0.035,-0.4,0.09); K.candle(top,0.1,0.035,-0.28,0.13); K.candle(top,-0.02,0.035,-0.2,0.06);
  K.bookStack(top,0.05,0.02,0.35,3,12); K.bush(top,-0.12,0.02,0.05,0.05,TERRA);
  const arms=[-0.62,0.62].map(function(z){
    return [0.2,-0.1].map(function(bx){const m=box(1,0.02,0.02,0x8d9092,0,0,z,g); m.userData.bx=bx; return m;});
  });
  tableFns.push(function(t){
    top.position.set(-0.22*t,0.36+0.34*t,0);
    arms.forEach(function(pair){pair.forEach(function(m){const bx=m.userData.bx; barXY(m,bx,0.325,bx-0.3-0.22*t,0.345+0.34*t);});});
  });
});
function poufs(prefix,col,label){[1,2].forEach(function(i){
  piece(prefix+i,{label:i===1?label:null,h:0.75,isNew:true,seats:[{id:prefix+i,label:'Pouf '+i,lx:0,lz:0,y:0.42,type:'sit',face:true}]},function(g){K.pouf(g,col);});
});}
poufs('poufA',SAGE,'Poufs'); poufs('poufB',CREAM,'Poufs'); poufs('poufC',TERRA,'Poufs');
piece('armA',{label:'Armchair',h:1.1,isNew:true,seats:[{id:'armA',label:'Armchair',lx:0.1,lz:0,y:0.43,type:'sit',recline:0.18}]},function(g){K.armchair(g,MUSTARD,0xb98a14);});
piece('flamp',{},function(g){K.floorLamp(g,'L:living');});

/* ---------- option B: table that folds flat against the wall under the painting ---------- */
piece('fold',{label:'Fold-down table',h:1.15,isNew:true},function(g){
  box(0.84,0.07,0.03,OAK,0,0.725,0.015,g);                                      // wall cleat
  const leaf=G(g); leaf.position.set(0,0.76,0.03);
  const oak=M(OAK), sage=M(SAGE);
  const lf=new THREE.Mesh(new THREE.BoxGeometry(0.8,0.03,0.72),[oak,oak,oak,sage,oak,oak]); lf.position.set(0,0,0.36); lf.castShadow=true; lf.receiveShadow=true; leaf.add(lf);
  A.torus(0.16,0.012,0xf3ebdc,0,-0.017,0.36,leaf).rotation.x=R/2;                 // ring on the underside, shows when folded
  const stuff=G(leaf); cyl(0.05,0.16,TERRA,0,0.095,0.2,stuff,12,0.03); sph(0.05,0x3f9160,0,0.22,0.2,stuff);
  const struts=[-0.3,0.3].map(function(x){return box(0.025,0.025,1,INK,x,0,0,g);});
  tableFns.push(function(t){
    leaf.rotation.x=(1-t)*R/2; stuff.visible=t>0.97;
    const th=(1-t)*R/2;
    struts.forEach(function(m){barYZ(m,0.2,0.03,0.745-Math.sin(th)*0.5,0.03+Math.cos(th)*0.5);});
  });
});
function sideChairs(prefix,n,frame,seatCol){for(let i=1;i<=n;i++)
  piece(prefix+i,{seats:chairSeat(prefix+i,'Table chair '+i),isNew:true},function(g){K.chair(g,frame,seatCol);});}
sideChairs('fc',2,OAK,SAGE);

/* ---------- option C: drop-leaf table. A 26 cm console against the wall, opens to 85 x 150 for four ---------- */
piece('gate',{label:'Drop-leaf table',h:1.15,isNew:true},function(g){
  box(0.85,0.03,0.26,OAK,0,0.745,0,g); box(0.7,0.5,0.2,0xf7f5ef,0,0.47,0,g);
  [-0.2,0.05].forEach(function(y){box(0.66,0.004,0.004,0xcfc8b8,0,0.47+y,0.101,g); box(0.66,0.004,0.004,0xcfc8b8,0,0.47+y,-0.101,g);});
  [[-.33,-.08],[.33,-.08],[-.33,.08],[.33,.08]].forEach(function(p){box(0.04,0.72,0.04,OAK,p[0],0.36,p[1],g);});
  const leaves=[1,-1].map(function(s){const lg=G(g); lg.position.set(0,0.745,s*0.13); box(0.85,0.026,0.62,OAK,0,0,s*0.31,lg); return {g:lg,s:s};});
  const legs=[1,-1].map(function(s){const m=box(0.04,0.72,0.04,OAK,0,0.36,s*0.68,g); return m;});
  const stuff=G(g); cyl(0.06,0.2,0x26386b,0.2,0.86,0,stuff,14,0.035); sph(0.07,0x3f9160,0.2,1.0,0,stuff); K.bookStack(stuff,-0.2,0.76,0,3,3);
  tableFns.push(function(t){
    leaves.forEach(function(l){l.g.rotation.x=l.s*(1-t)*R/2;});
    legs.forEach(function(m){m.visible=t>0.05; m.scale.y=Math.max(0.01,t); m.position.y=0.73-0.36*t;});
  });
});
sideChairs('gc',4,0x22262a,TERRA);

/* ---------- coffee tables for B and C ---------- */
piece('nest',{label:'Nesting tables',h:0.8,isNew:true},function(g){
  cyl(0.42,0.035,OAK,0,0.42,-0.12,g,36); [0,2.1,4.2].forEach(function(a){cyl(0.014,0.4,INK,Math.cos(a)*0.3,0.2,-0.12+Math.sin(a)*0.3,g,6);});
  cyl(0.27,0.03,INK,0.08,0.33,0.48,g,30); [0.5,2.6,4.7].forEach(function(a){cyl(0.012,0.32,INK,0.08+Math.cos(a)*0.2,0.16,0.48+Math.sin(a)*0.2,g,6);});
  box(0.26,0.015,0.36,0xf3ebdc,0,0.445,-0.15,g); K.candle(g,-0.05,0.452,-0.24,0.1); K.candle(g,0.05,0.452,-0.1,0.14); K.candle(g,-0.03,0.452,-0.04,0.07);
  K.bush(g,0.08,0.345,0.48,0.06,MUSTARD);
});

/* ---------- TV wall: each option hides the side of the fridge behind cube shelving ---------- */
piece('towerA',{label:'Cube shelf hides the fridge',h:1.95,isNew:true},function(g){
  const k=K.kallax(g,['pb','xb','by','sx'],0xf7f5ef,{box:MUSTARD,box2:SAGE});
  box(0.3,0.2,0.34,0xd9c9a8,0,k.h+0.1,-0.17,g); K.pothos(g,0.02,k.h,0.2,0.7,2);          // basket and a trailing plant cover the fridge top
});
piece('benchA',{label:'TV on a floating oak bench',h:1.75,isNew:true},function(g){
  box(0.38,0.3,1.8,OAK,0,0.4,0,g); [-0.3,0.3].forEach(function(z){box(0.004,0.26,0.004,0x8a6a3c,0.191,0.4,z,g);});
  K.tv(g,-0.16,1.2,0);
  K.bookStack(g,0.02,0.55,-0.72,3,7); cyl(0.05,0.22,TERRA,0.02,0.66,0.74,g,14,0.03); K.bush(g,0.02,0.55,0.5,0.06);
  A.pool('L:living',0xffc47a,0.25,0.03,0,0.95,g,0.3);
});
piece('towerB',{label:'Oak cube shelf hides the fridge',h:1.95,isNew:true},function(g){
  const k=K.kallax(g,['vb','b ','xp','bx'],OAK,{box:0xf3ebdc,vase:0x22262a});
  K.pothos(g,0.02,k.h,-0.1,0.65,6); box(0.24,0.04,0.3,0x22262a,0.02,k.h+0.02,0.2,g);
});
const caneTex=canvasTex(64,64,function(g){g.fillStyle='#d8c39a'; g.fillRect(0,0,64,64); g.strokeStyle='#b39a6b'; g.lineWidth=2;
  for(let i=-64;i<128;i+=8){g.beginPath(); g.moveTo(i,0); g.lineTo(i+64,64); g.stroke(); g.beginPath(); g.moveTo(i+64,0); g.lineTo(i,64); g.stroke();}});
caneTex.wrapS=caneTex.wrapT=THREE.RepeatWrapping; caneTex.repeat.set(3,3);
piece('sideB',{label:'TV on a cane sideboard',h:1.75,isNew:true},function(g){
  box(0.42,0.46,1.7,OAK,0,0.43,0,g); box(0.44,0.03,1.74,OAK,0,0.675,0,g);
  [[-.17,-.8],[.17,-.8],[-.17,.8],[.17,.8]].forEach(function(p){cyl(0.018,0.2,INK,p[0],0.1,p[1],g,8);});
  [-0.555,0,0.555].forEach(function(z){const m=new THREE.Mesh(new THREE.PlaneGeometry(0.5,0.38),A.MT(caneTex,null,true)); m.position.set(0.2115,0.43,z); m.rotation.y=R/2; g.add(m); cyl(0.012,0.02,INK,0.222,0.56,z+0.2,g,8).rotation.z=R/2;});
  K.tv(g,-0.05,1.13,0); box(0.2,0.08,0.5,0x101214,-0.05,0.73,0,g);
  K.bush(g,0.03,0.69,-0.7,0.07); K.tableLamp(g,0.03,0.69,0.72,'L:living',0.9);
});
piece('mediaC',{label:'Media wall hides the fridge',h:1.95,isNew:true},function(g){
  const o={box:TERRA,box2:0x26386b,vase:MUSTARD};
  const t1=G(g); t1.position.z=1.112; K.kallax(t1,['pb','bx','yb','sb'],0xf7f5ef,Object.assign({seed:3},o));      // fridge side
  const t2=G(g); t2.position.z=-1.112; K.kallax(t2,['bl','vb','by','xb'],0xf7f5ef,Object.assign({seed:9},o));
  K.kallax(g,['xbsy'],0xf7f5ef,o);
  box(0.39,0.038,1.47,0xf7f5ef,0,1.446,0,g); K.books(g,0.02,1.465,-0.35,0.5,0.22,0.18,44); K.pothos(g,0.02,1.465,0.45,0.12,12);
  K.tv(g,-0.16,0.93,0);
  K.bush(g,0.03,0.41,-0.55,0.06); box(0.24,0.012,0.3,0x22262a,0.03,0.417,0.5,g);
});

/* ---------- plants and lamps that move between options ---------- */
piece('arc',{},function(g){K.arcLamp(g,'L:living');});
piece('monst',{},function(g){K.monstera(g,0,0,1.15);});
piece('fid',{},function(g){K.fiddle(g,0,0,1.8);});
piece('snk',{},function(g){K.snake(g,0,0,0.8);});

/* ---------- pajama party mattresses (you can step over them) ---------- */
function mattress(id,label,col){
  piece(id,{label:label,h:0.5,seats:[{id:id,label:label,lx:0,lz:0,y:0.17,type:'lie',dh:-R/2}]},function(g){
    g.userData.nc=true;
    box(0.8,0.15,1.9,0xf3efe6,0,0.075,0,g); box(0.78,0.03,1.15,col,0,0.165,0.34,g); box(0.5,0.08,0.32,0xffffff,0,0.19,-0.72,g);
  });
}
mattress('mat1','Mattress by the table',0xe3b7a0); mattress('mat2','Mattress by the TV',0x9db7dd);

/* ---------- fixed decoration for the redesign ---------- */
const dn=G(null,'abc'), dbc=G(null,'bc');
K.stringLights(dn,0,2.42,1.9,5.4,24);
K.pendant(dn,1.95,2.5,3.65,'L:living','paper',null,1.9);
box(0.5,0.025,0.05,A.lampMat('L:living',0xb08d4a,0xffe2b0,0.8),pc,2.4,0.07,dn); box(0.02,0.02,0.07,0xb08d4a,pc,2.4,0.035,dn);   // picture light
A.pool('L:living',0xffd9a0,pc,1.85,0.03,0.95,dn,0.32,0);
K.pendant(dbc,DC,1.78,0.55,'L:living','dome',MUSTARD,1.2);
// entrance: round gold mirror, shelf, doormat, hooks
A.torus(0.3,0.022,0xd9aa12,0.62,1.56,L-0.03,dn); const mir=cyl(0.29,0.008,0xcfdadd,0.62,1.56,L-0.012,dn,40); mir.rotation.x=R/2;
box(0.6,0.03,0.2,OAK,0.62,0.95,L-0.1,dn); cyl(0.07,0.04,TERRA,0.48,0.985,L-0.1,dn,16,0.09); K.bush(dn,0.78,0.965,L-0.1,0.055);
box(0.8,0.014,0.5,0x7a6a4a,2.45,0.007,5.9,dn).castShadow=false;
box(0.02,0.07,0.7,OAK,0.012,1.72,5.7,dn); [5.45,5.7,5.95].forEach(function(z){cyl(0.012,0.07,INK,0.05,1.72,z,dn,8).rotation.z=R/2;});
box(0.06,0.55,0.3,0x1f5a41,0.07,1.42,5.45,dn); box(0.05,0.3,0.26,0xd9c9a8,0.06,1.5,5.95,dn);
box(0.4,0.22,0.36,0xd9c9a8,3.3,1.86,L-0.23,dn);                                  // basket on the wardrobe
});
K.onlyAll(K.frame('left',2.72,1.78,0.62,0.82,0).concat(K.frame('left',3.65,1.78,0.62,0.82,1),K.frame('left',4.58,1.78,0.62,0.82,3)),'abc');

/* ---------- layouts: x, z, rotation. A piece that is not listed is hidden. ---------- */
const sofaZ=3.65;
const LAY={
  n:{sofa:[0.60,sofaZ,0], table:[1.95,3.60,0], tvOld:[W-0.235,4.05,R], station:[0.30,0.72,0],
     dining:[pc,0.48,0], chairA:[pc-0.95,0.50,0], chairB:[pc+0.95,0.50,R], rack1:[1.30,1.75,R/2], rack2:[2.90,1.55,0]},
  a:{sofa:[0.60,sofaZ,0], station:[0.30,0.72,0], rugA:[1.90,sofaZ,0], lift:[1.95,sofaZ,0],
     towerA:[W-0.195,2.44,R], benchA:[W-0.19,3.80,R], armA:[2.5,0.78,-R/2+0.3], poufA1:[2.75,2.95,0], poufA2:[2.75,4.35,0],
     flamp:[3.1,0.3,0], arc:[0.32,5.62,0.91], monst:[0.36,1.66,0], fid:[4.12,4.93,0], snk:[1.7,5.95,0]},
  b:{sofa:[0.60,sofaZ,0], station:[0.30,0.72,0], rugB:[1.90,sofaZ,0], nest:[1.95,sofaZ,0],
     towerB:[W-0.195,2.44,R], sideB:[W-0.22,3.78,R], fold:[DC,0,0], fc1:[1.80,0.27,-R/2], fc2:[3.17,0.27,-R/2],
     poufB1:[2.72,3.0,0], poufB2:[2.72,4.3,0], arc:[0.32,5.62,0.91], monst:[0.36,1.66,0], fid:[4.12,4.95,0], snk:[1.7,5.95,0]},
  c:{sofa:[0.60,3.56,0], station:[0.30,0.72,0], rugC:[1.90,3.56,0], nest:[1.95,3.56,0],
     mediaC:[W-0.195,3.555,R], gate:[DC,0.17,0], gc1:[1.80,0.27,-R/2], gc2:[3.17,0.27,-R/2],
     poufC1:[2.72,2.95,0], poufC2:[2.72,4.2,0], arc:[0.32,5.62,0.91], monst:[0.36,1.66,0], snk:[1.7,5.95,0]}
};
const ALT={   // with the table set for a meal
  a:{poufA1:[2.62,3.25,0], poufA2:[2.62,4.05,0]},
  b:{fc1:[1.815,0.45,0], fc2:[3.155,0.45,R]},
  c:{gate:[DC,0.93,0], gc1:[1.78,0.6,0], gc2:[3.19,0.6,R], gc3:[1.78,1.25,0], gc4:[3.19,1.25,R]}
};
const PJ={    // pajama party
  n:{mat1:[2.72,3.9,0], mat2:[3.56,3.9,0], rack1:null, rack2:null},
  a:{mat1:[2.72,3.9,0], mat2:[3.56,3.9,0], poufA1:[2.2,1.8,0], poufA2:[3.3,1.9,0]},
  b:{mat1:[2.72,3.9,0], mat2:[3.56,3.9,0], poufB1:[2.2,1.8,0], poufB2:[3.3,1.9,0]},
  c:{mat1:[2.72,3.9,0], mat2:[3.56,3.9,0], poufC1:[2.2,1.8,0], poufC2:[3.3,1.9,0]}
};
const FOCUS=[1.95,3.65];

/* ---------- copy ---------- */
const DESIGNS=A.DESIGNS={
  n:{name:'Now', title:'How it is today', sub:'No rug, no armchair, drying racks in the middle of the room.', table:null, pal:['#1F5A41','#34373c','#f0d21c','#C99A5B','#f3f3ef'],
     list:[
      ['Sofa and TV','Sofa on the long wall, TV bench opposite, slightly toward the entrance.'],
      ['Dining table','Long side against the wall under the painting, so the chairs at its ends sit in front of the two bedroom doors.'],
      ['Coffee station','On the sofa wall, in the corner next to bedroom 1.'],
      ['Drying racks','Fill the floor between the sofa, the dining table and the kitchen.'],
      ['Kitchen','Charcoal cabinets, a full counter, things stored on top of the cabinet and the fridge.'],
      ['Bedrooms','Bedroom 1: desk and a single bed. Bedroom 2: bed, and a pine desk under the big window.']]},
  a:{name:'A', title:'A · Lift-top lunch', sub:'Oak, mustard and sage. One table does both jobs, right in front of the sofa.', table:['Raise the table for lunch','Lower to coffee height'], pal:['#1F5A41','#8fbd9b','#D6A21E','#C99A5B','#F3EBDC'],
     list:[
      ['Table','A 140 × 65 lift-top table. Coffee height most of the day. The top rises 34 cm and slides toward the sofa for lunch, and the two poufs pull up as extra seats.'],
      ['TV wall','A white 2 × 4 cube shelf stands against the side of the fridge and hides it. Next to it, the TV hangs over a floating oak bench, nearly centred on the sofa.'],
      ['Rug','Jute, 200 × 300. Tucked 30 cm under the sofa, ending 1.1 m short of the TV bench so the walkway stays open.'],
      ['Seats','A mustard armchair under the bus painting, between the two bedroom doors, angled at the TV, with a floor lamp. Two sage poufs face the sofa. The kitchen-to-entrance path stays 1 m wide.'],
      ['Light','Paper pendant over the table, arc lamp at the sofa, picture light on the painting, string lights on the sofa wall, candles.'],
      ['Kitchen','Cabinets in a slightly deep pastel green. Counter and sink unchanged, everything cleared off the counter, the cabinet top and the fridge. Bin gone. Pendant, light strip, runner.'],
      ['Bedroom 1','A study: second desk where the bed was, shelves above it, two desk lamps.'],
      ['Bedroom 2','Reading nook where the desk was: green armchair, floor lamp, low bookcase, round rug.']]},
  b:{name:'B', title:'B · Fold-away', sub:'Calm, light, more floor. The dining table disappears into the wall.', table:['Fold the table down','Fold the table away'], pal:['#1F5A41','#8fbd9b','#F3EBDC','#C99A5B','#22262a'],
     list:[
      ['Table','An 80 × 72 leaf hinged to the wall under the bus painting. Folded, it is a sage panel 3 cm deep. Down, it seats two, and both chairs clear the bedroom doors.'],
      ['Coffee table','Two round nesting tables on the rug, light enough to push aside.'],
      ['TV wall','An oak 2 × 4 cube shelf hides the side of the fridge. The TV stands on a low cane-front sideboard.'],
      ['Rug','Cream with sage stripes, 200 × 300.'],
      ['Seats','Two cream poufs opposite the sofa instead of an armchair, so the room stays open.'],
      ['Light','Paper pendant, mustard pendant over the fold-down table, arc lamp, lamp on the sideboard, string lights, candles.'],
      ['Kitchen and bedrooms','Same as option A.']]},
  c:{name:'C', title:'C · Library wall', sub:'The boldest one. A full wall of cubes around the TV, and a table for four when friends come.', table:['Open the table for four','Close it to a console'], pal:['#1F5A41','#C4673F','#D6A21E','#26386b','#F3EBDC'],
     list:[
      ['TV wall','Two 2 × 4 cube towers, a low 4-cube unit and a bridge shelf frame the TV. 3 m wide, from the fridge to just before the toilet door. The first tower hides the side of the fridge.'],
      ['Table','A drop-leaf table. Closed, it is a 26 cm console under the painting. Open, it is 85 × 150 and seats four. Chairs still clear both bedroom doors.'],
      ['Sofa','Moves 9 cm toward the kitchen so it is centred on the TV.'],
      ['Rug','Terracotta kilim, 200 × 300, with two terracotta poufs.'],
      ['Light','Paper pendant, mustard pendant over the table, lamp inside the shelving, arc lamp, string lights, candles.'],
      ['Kitchen and bedrooms','Same as option A.']]}
};

/* ---------- state and layout animation ---------- */
const S=A.state={design:'a',table:0,pj:false,labels:true,dims:false};
A.tableT=0; A.layoutFns=[];
let anim=null;
function targets(){
  const out={}, put=function(o){for(const k in o) out[k]=o[k];};
  put(LAY[S.design]); if(S.table&&ALT[S.design]) put(ALT[S.design]); if(S.pj) put(PJ[S.design]);
  return out;
}
A.layout=function(instant){
  const t=targets();
  for(const id in P){const p=P[id], v=t[id];
    p.from=p.cur.slice(); p.to=v?[v[0],v[1],v[2],1]:[p.cur[0],p.cur[1],p.cur[2],0];
    if(p.from[3]<0.02&&v){p.from[0]=v[0]; p.from[1]=v[1]; p.from[2]=v[2];}
  }
  for(let i=0;i<A.onlys.length;i++){const o=A.onlys[i]; o.visible=o.userData.only.indexOf(S.design)>=0;}
  anim={t0:performance.now(),dur:(instant||A.reduce)?1:800,tf:A.tableT,tt:S.table?1:0};
  resolveSeats();
  if(instant) stepLayout();
};
function stepLayout(){
  if(anim){
    const k=Math.min(1,(performance.now()-anim.t0)/anim.dur), e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
    for(const id in P){const p=P[id]; for(let i=0;i<4;i++) p.cur[i]=p.from[i]+(p.to[i]-p.from[i])*e;}
    A.tableT=anim.tf+(anim.tt-anim.tf)*e;
    for(let i=0;i<tableFns.length;i++) tableFns[i](A.tableT);
    for(const id in P){const p=P[id];
      p.g.position.set(p.cur[0],0,p.cur[1]); p.g.rotation.y=p.cur[2];
      const s=Math.max(0.0001,p.cur[3]); p.g.scale.set(s,s,s); p.g.visible=p.cur[3]>0.02;
    }
    if(k>=1){anim=null; for(let i=0;i<A.layoutFns.length;i++) A.layoutFns[i]();}
  }
}
A.frameFns.push(stepLayout);
A.layoutBusy=function(){return !!anim;};
/* seats that exist in the current design, with world positions */
let live=[];
function resolveSeats(){
  live=[];
  A.seats.forEach(function(s){if(!s.only||s.only.indexOf(S.design)>=0) live.push(s);});
  for(const id in P){const p=P[id]; if(!p.seats||p.to[3]<1) continue;
    const x=p.to[0], z=p.to[1], f=p.to[2], c=Math.cos(f), sn=Math.sin(f);
    p.seats.forEach(function(s){
      s.x=x+s.lx*c+s.lz*sn; s.z=z-s.lx*sn+s.lz*c; s.room='living';
      s.h=s.face?Math.atan2(FOCUS[0]-s.x,FOCUS[1]-s.z):f+R/2+(s.dh||0);
      live.push(s);
    });
  }
}
A.liveSeats=function(){return live;};
A.setDesign=function(k,instant){
  S.design=k; S.table=0; S.pj=false;
  A.layout(instant); renderPanel();
  if(A.onDesign) A.onDesign();
};
A.setTable=function(on){S.table=on?1:0; A.layout(); renderPanel();};

/* ---------- labels and dimension lines ---------- */
const fixedLabels=[
 {label:'Kitchen', pos:new THREE.Vector3(5.9,2.5,2.05)},
 {label:'Entrance', pos:new THREE.Vector3(2.45,2.35,L)},
 {label:'Bedroom 1', alt:'Bedroom 1 · study', pos:new THREE.Vector3(1.2,1.5,-2.3)},
 {label:'Bedroom 2', alt:'Bedroom 2 · reading nook', pos:new THREE.Vector3(4.9,1.5,-2.0)},
 {label:'Bathroom and shower', pos:new THREE.Vector3(5.6,1.6,L-2.1)},
 {label:'Toilet', pos:new THREE.Vector3(5.3,1.6,L-0.5)},
 {label:'≈ '+L.toFixed(1)+' m', pos:new THREE.Vector3(-0.3,0.05,L/2), dim:true},
 {label:'≈ '+W.toFixed(1)+' m', pos:new THREE.Vector3(W/2,0.05,L+0.35), dim:true},
 {label:'ceiling ≈ '+H.toFixed(2)+' m', pos:new THREE.Vector3(0.05,H-0.2,L-1.2), dim:true},
 {label:'kitchen ≈ '+(KX-W).toFixed(1)+' × '+KZ.toFixed(1)+' m', pos:new THREE.Vector3((W+KX)/2,0.05,0.95), dim:true},
 {label:'tiles 80 × 80', pos:new THREE.Vector3(2.0,0.05,5.6), dim:true},
 {label:'doors 80 × 205', pos:new THREE.Vector3((D.door2[0]+D.door2[1])/2,0.1,0.45), dim:true}
];
for(const id in P){const p=P[id]; if(p.label) p.el=A.tag(p.label,p.isNew?'new':'');}
fixedLabels.forEach(function(f){f.el=A.tag(f.label,f.dim?'dim':'');});
const dims=new THREE.Group(); scene.add(dims); dims.visible=false;
(function(){const m=new THREE.LineBasicMaterial({color:0x1F5A41});
  function ln(a,b){dims.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(a[0],a[1],a[2]),new THREE.Vector3(b[0],b[1],b[2])]),m));}
  ln([-0.3,0.02,0],[-0.3,0.02,L]); ln([-0.4,0.02,0],[-0.2,0.02,0]); ln([-0.4,0.02,L],[-0.2,0.02,L]);
  ln([0,0.02,L+0.35],[W,0.02,L+0.35]); ln([0,0.02,L+0.25],[0,0.02,L+0.45]); ln([W,0.02,L+0.25],[W,0.02,L+0.45]);
  ln([0.05,0,L-1.2],[0.05,H,L-1.2]);
  ln([W,0.02,KZ+0.3],[KX,0.02,KZ+0.3]); ln([KX+0.3,0.02,0],[KX+0.3,0.02,KZ]);
})();
const tmp=new THREE.Vector3();
A.labelFns.push(function(){
  const show=S.labels&&!A.simsOn;
  for(const id in P){const p=P[id]; if(!p.el) continue;
    tmp.set(p.cur[0]+(p.lx||0),p.h,p.cur[1]+(p.lz||0)); A.place(p.el,tmp,show&&p.cur[3]>0.6);}
  fixedLabels.forEach(function(f){A.place(f.el,f.pos,f.dim?(S.dims&&!A.simsOn):show);});
});

/* ---------- Design tab ---------- */
function renderPanel(){
  const d=DESIGNS[S.design];
  ['n','a','b','c'].forEach(function(k){$('d_'+k).setAttribute('aria-pressed',k===S.design);});
  $('dTitle').textContent=d.title; $('dSub').textContent=d.sub;
  $('dPal').innerHTML=d.pal.map(function(c){return '<i style="background:'+c+'"></i>';}).join('');
  $('list').innerHTML=d.list.map(function(r){return '<li><b>'+r[0]+'</b><span>'+r[1]+'</span></li>';}).join('');
  const bt=$('bTable'); bt.hidden=!d.table; if(d.table) bt.textContent=d.table[S.table?1:0];
  fixedLabels.forEach(function(f){if(f.alt) f.el.textContent=S.design==='n'?f.label:f.alt;});
  if(A.onPanel) A.onPanel();
}
A.renderPanel=renderPanel;
['n','a','b','c'].forEach(function(k){$('d_'+k).onclick=function(){A.setDesign(k);};});
$('bTable').onclick=function(){A.setTable(!S.table);};
function fitDist(){const a=A.stage.clientWidth/A.stage.clientHeight; return 19*Math.max(1,1.0/Math.max(a,0.5));}
A.viewPos=function(v){
  const d=fitDist(), t=A.home;
  if(v==='top') return new THREE.Vector3(t.x,d*1.02,t.z+0.01);
  return new THREE.Vector3(t.x+d*0.5,d*0.62,t.z+d*0.6);
};
A.setView=function(v,instant){
  $('b3d').setAttribute('aria-pressed',v==='3d'); $('bTop').setAttribute('aria-pressed',v==='top');
  A.fly(A.viewPos(v),A.home,700,instant);
};
$('b3d').onclick=function(){A.setView('3d');}; $('bTop').onclick=function(){A.setView('top');};
$('cLabels').onchange=function(e){S.labels=e.target.checked;};
$('cDims').onchange=function(e){S.dims=e.target.checked; dims.visible=S.dims;};
$('cCut').onchange=function(e){A.cut.constant=e.target.checked?1.25:100;};
$('note').textContent='Scaled from the photos, not measured: living room about '+W.toFixed(1)+' × '+L.toFixed(1)+' m, ceiling '+H.toFixed(2)+' m, kitchen '+(KX-W).toFixed(1)+' × '+KZ.toFixed(1)+' m, tiles 80 × 80 cm. Width and door positions are good to about 10 cm; length, kitchen depth and the other rooms are rougher. New furniture is drawn at typical catalogue sizes.';
A.renderer.domElement.addEventListener('pointerdown',function(){A.stopFly(); $('hint').style.opacity=0;});
})();
