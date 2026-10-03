/* Haroe 10 — movable furniture, the design options and the Design tab */
(function(){
'use strict';
const A=window.APP, D=A.D, K=A.kit, W=D.W, L=D.L, H=D.H, KX=D.KX, KZ=D.KZ;
const box=A.box, cyl=A.cyl, sph=A.sph, M=A.M, G=A.G, scene=A.scene, canvasTex=A.canvasTex;
const R=Math.PI, OAK=0xc99a5b, INK=0x22262a, SAGE=A.SAGE, MUSTARD=0xd6a21e, TERRA=0xc4673f, CREAM=0xf3ebdc;
const pc=(D.painting[0]+D.painting[1])/2, DC=(D.door1[1]+D.door2[0])/2, EX=(D.entrance[0]+D.entrance[1])/2;      // painting centre; centre of the wall between the two bedroom doors
const $=function(id){return document.getElementById(id);};

const P=A.pieces={};
const SOFA={a:3.8,b:3.56,c:4.3};                       // where the sofa is centred in each option; the lights follow it

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

/* ---------- option C: a real dining table for four in the middle of the top zone ---------- */
piece('dtable',{label:'Dining table for four',h:1.15,isNew:true},function(g){
  box(0.85,0.04,1.4,OAK,0,0.74,0,g);
  [[-.36,-.62],[.36,-.62],[-.36,.62],[.36,.62]].forEach(function(p){box(0.05,0.72,0.05,INK,p[0],0.36,p[1],g);});
  box(0.3,0.006,1.1,0xf3ebdc,0,0.763,0,g); cyl(0.06,0.2,0x26386b,0,0.866,0.1,g,14,0.035); sph(0.07,0x3f9160,0,1.0,0.1,g); K.candle(g,0,0.766,-0.25,0.1);
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
piece('mediaC',{label:'Cube wall hides the fridge',h:1.95,isNew:true},function(g){
  const o={box:SAGE,box2:0xd9c9a8,vase:MUSTARD};
  const t1=G(g); t1.position.z=1.112; K.kallax(t1,['pb','bx','yb','sb'],0xf7f5ef,Object.assign({seed:3},o));      // fridge side
  const t2=G(g); t2.position.z=-1.112; K.kallax(t2,['bl','vb','by','xb'],0xf7f5ef,Object.assign({seed:9},o));
  K.kallax(g,['xbsy'],0xf7f5ef,o);
  box(0.39,0.038,1.47,0xf7f5ef,0,1.446,0,g); K.books(g,0.02,1.465,-0.35,0.5,0.22,0.18,44); K.pothos(g,0.02,1.465,0.45,0.12,12);
  K.tv(g,-0.16,0.93,0);
  K.bush(g,0.03,0.41,-0.55,0.06); box(0.24,0.012,0.3,0x22262a,0.03,0.417,0.5,g);
});

/* ---------- what replaces the coffee corner ---------- */
piece('ladder',{label:'Plant shelf',h:2.0,isNew:true},function(g){              // A: a green corner
  [[-.15,-.39],[.15,-.39],[-.15,.39],[.15,.39]].forEach(function(p){box(0.025,1.8,0.025,INK,p[0],0.9,p[1],g);});
  [0.3,0.75,1.2,1.65].forEach(function(y){box(0.34,0.025,0.8,OAK,0,y,0,g);});
  K.books(g,0,0.3125,-0.12,0.45,0.24,0.2,61); K.bush(g,0,0.3125,0.25,0.08,TERRA);
  K.bush(g,0,0.7625,-0.2,0.09); K.bookStack(g,0,0.7625,0.2,4,8);
  K.tableLamp(g,0,1.2125,0.22,'L:living',0.9); cyl(0.05,0.2,MUSTARD,0,1.3125,-0.2,g,14,0.03);
  K.pothos(g,0,1.6625,-0.15,0.6,14); K.bush(g,0,1.6625,0.24,0.07);
});
piece('music',{label:'Record corner',h:1.2,isNew:true},function(g){              // B: music instead of coffee
  box(0.42,0.38,1.3,OAK,0,0.45,0,g); [-0.2,0.2].forEach(function(z){box(0.004,0.34,0.004,0x8a6a3c,0.211,0.45,z,g);});
  [[-.17,-.6],[.17,-.6],[-.17,.6],[.17,.6]].forEach(function(p){cyl(0.016,0.26,INK,p[0],0.13,p[1],g,8);});
  box(0.34,0.06,0.42,INK,0,0.67,-0.38,g); cyl(0.15,0.012,0x111214,0,0.706,-0.38,g,28); cyl(0.045,0.014,TERRA,0,0.708,-0.38,g,16);
  K.books(g,0.0,0.64,0.02,0.22,0.31,0.3,55);
  box(0.2,0.3,0.2,0x2b2b2b,-0.06,0.79,0.5,g); cyl(0.06,0.004,0x55585c,0.042,0.8,0.5,g,14).rotation.z=R/2;
  K.tableLamp(g,-0.04,0.64,0.25,'L:living',0.9);
});
piece('cbar',{label:'Coffee bar',h:1.45,isNew:true},function(g){                  // C: the coffee moves under the painting
  box(0.4,0.75,1.2,OAK,0,0.475,0,g); box(0.42,0.025,1.24,OAK,0,0.862,0,g);
  [-0.2,0.2].forEach(function(z){box(0.004,0.7,0.004,0x8a6a3c,0.201,0.475,z,g);});
  [[-.16,-.55],[.16,-.55],[-.16,.55],[.16,.55]].forEach(function(p){box(0.04,0.1,0.04,INK,p[0],0.05,p[1],g);});
  box(0.3,0.36,0.26,0xc9ccd0,-0.02,1.055,0.28,g); box(0.16,0.4,0.14,0x2b2b2b,-0.04,1.075,-0.02,g);
  box(0.24,0.015,0.34,INK,0.0,0.882,-0.36,g); [-0.44,-0.36,-0.28].forEach(function(z){cyl(0.032,0.07,0xf3ebdc,0.02,0.925,z,g,12);});
});
piece('bench',{label:'Bench',h:0.9,isNew:true,seats:[{id:'benchA',label:'Bench, left',lx:0.02,lz:-0.4,y:0.5,type:'sit'},{id:'benchB',label:'Bench, right',lx:0.02,lz:0.4,y:0.5,type:'sit'}]},function(g){
  box(0.42,0.06,1.6,OAK,0,0.41,0,g); [[-.17,-.74],[.17,-.74],[-.17,.74],[.17,.74]].forEach(function(p){box(0.04,0.38,0.04,INK,p[0],0.19,p[1],g);});
  box(0.4,0.06,0.76,SAGE,0,0.47,-0.4,g); box(0.4,0.06,0.76,SAGE,0,0.47,0.4,g);
  box(0.32,0.24,0.4,0xd9c9a8,0,0.13,-0.4,g); box(0.32,0.24,0.4,0xd9c9a8,0,0.13,0.4,g);
  K.cushion(g,MUSTARD,-0.14,0.66,-0.6,0.9,0.2); K.cushion(g,TERRA,-0.14,0.66,0.62,0.9,0.2);
});
A.inRoom('kitchen',function(){
  piece('cart',{label:'Coffee cart',h:1.4,isNew:true},function(g){                // B: the coffee rolls into the kitchen
    [0.34,0.85].forEach(function(y){box(0.38,0.02,0.6,OAK,0,y,0,g);});
    [[-.17,-.28],[.17,-.28],[-.17,.28],[.17,.28]].forEach(function(p){box(0.02,0.83,0.02,INK,p[0],0.455,p[1],g); cyl(0.025,0.02,INK,p[0],0.025,p[1],g,10).rotation.x=R/2;});
    box(0.28,0.34,0.24,0xc9ccd0,-0.02,1.03,0.14,g); box(0.14,0.36,0.13,0x2b2b2b,-0.04,1.04,-0.16,g);
    [-0.15,0,0.15].forEach(function(z){cyl(0.035,0.08,0xf3ebdc,0,0.39,z,g,12);});
  });
  const ka=G(null,'a'), cx=KX-1.8;                                                // A: the coffee sits on the kitchen counter, by the fridge
  box(0.26,0.36,0.3,0xc9ccd0,cx+0.24,1.1,KZ-0.3,ka); box(0.14,0.4,0.16,0x2b2b2b,cx+0.5,1.12,KZ-0.3,ka);
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
mattress('mat1','Mattress by the sofa',0xe3b7a0); mattress('mat2','Mattress by the TV',0x9db7dd);

/* ---------- fixed decoration for the proposals ---------- */
const dn=G(null,'abc'), dab=G(null,'ab'), dc=G(null,'c'), db=G(null,'b');
['a','b','c'].forEach(function(k){const g=G(null,k), z=SOFA[k];
  K.stringLights(g,0,2.42,z-1.7,z+1.7,24); K.pendant(g,1.875,2.5,z,'L:living','paper',null,1.8);});
box(0.5,0.025,0.05,A.lampMat('L:living',0xb08d4a,0xffe2b0,0.8),pc,2.4,0.07,dn); box(0.02,0.02,0.07,0xb08d4a,pc,2.4,0.035,dn);   // picture light
A.pool('L:living',0xffd9a0,pc,1.85,0.03,0.95,dn,0.32,0);
K.pendant(db,DC,1.78,0.55,'L:living','dome',MUSTARD,1.2);
K.pendant(dc,DC,1.72,1.675,'L:living','dome',MUSTARD,1.4);
// entrance: round gold mirror, doormat, hooks
A.torus(0.26,0.022,0xd9aa12,0.62,1.62,L-0.03,dab); const mir=cyl(0.25,0.008,0xcfdadd,0.62,1.62,L-0.012,dab,40); mir.rotation.x=R/2;
box(0.8,0.014,0.5,0x7a6a4a,EX,0.007,5.9,dn).castShadow=false;
box(0.02,0.07,0.6,OAK,0.012,1.72,5.85,dab); [5.65,5.85,6.05].forEach(function(z){cyl(0.012,0.07,INK,0.05,1.72,z,dab,8).rotation.z=R/2;});
box(0.06,0.55,0.3,0x1f5a41,0.07,1.42,5.68,dab);
box(0.4,0.22,0.36,0xd9c9a8,2.6,1.86,L-0.23,dn);                                  // basket on the wardrobe
});
['a','b','c'].forEach(function(k){const z=SOFA[k];
  K.onlyAll(K.frame('left',z-0.93,1.78,0.62,0.82,0).concat(K.frame('left',z,1.78,0.62,0.82,1),K.frame('left',z+0.93,1.78,0.62,0.82,3)),k);});
K.onlyAll(K.frame('left',0.62,1.5,0.5,0.62,6,0xc99a5b).concat(K.frame('left',1.32,1.5,0.5,0.62,5,0xc99a5b)),'c');
K.onlyAll(K.frame('left',0.62,1.62,0.48,0.6,2).concat(K.frame('left',1.25,1.62,0.48,0.6,7)),'b');

/* ---------- layouts: x, z, rotation. A piece that is not listed is hidden. ---------- */
const LAY={
  n:{sofa:[0.60,4.3,0], table:[1.72,4.2,0], tvOld:[W-0.235,4.3,R], station:[0.30,0.72,0],
     dining:[pc,0.48,0], chairA:[pc-0.95,0.50,0], chairB:[pc+0.95,0.50,R], rack1:[1.0,1.98,0], rack2:[2.45,1.5,0]},
  a:{sofa:[0.60,3.8,0], rugA:[1.85,3.8,0], lift:[1.875,3.8,0], ladder:[0.2,0.62,0],
     towerA:[W-0.195,2.44,R], benchA:[W-0.19,3.80,R], armA:[DC+0.05,0.75,-R/2+0.25], poufA1:[2.1,1.62,0], poufA2:[1.25,1.85,0],
     flamp:[1.5,0.28,0], arc:[0.32,5.82,0.91], monst:[0.36,1.5,0], fid:[W-0.28,4.93,0]},
  b:{sofa:[0.60,3.56,0], rugB:[1.85,3.56,0], nest:[1.9,3.56,0], music:[0.22,0.95,0], cart:[KX-0.24,1.8,R],
     mediaC:[W-0.195,3.555,R], fold:[DC,0,0], poufB1:[1.7,1.85,0], poufB2:[2.3,1.85,0], arc:[0.32,5.6,0.91]},
  c:{sofa:[0.60,4.3,0], rugC:[1.85,4.3,0], nest:[1.9,4.3,0], bench:[0.23,1.0,0], cbar:[DC,0.22,-R/2],
     dtable:[DC,1.675,R/2], gc1:[DC-0.37,0.98,-R/2], gc2:[DC+0.37,0.98,-R/2], gc3:[DC-0.37,2.37,R/2], gc4:[DC+0.37,2.37,R/2],
     towerA:[W-0.195,2.44,R], benchA:[W-0.19,4.08,R], monst:[0.36,2.2,0]}
};
const ALT={   // with the table set for a meal
  a:{poufA1:[2.5,3.45,0], poufA2:[2.5,4.15,0]},
  b:{fc1:[DC-0.52,0.5,0], fc2:[DC+0.52,0.5,R]}
};
const PJ={    // pajama party: the coffee table is put away and two mattresses go down in front of the TV
  n:{mat1:[1.72,4.3,0], mat2:[2.6,4.3,0], table:null, rack1:null, rack2:null},
  a:{mat1:[1.72,3.8,0], mat2:[2.6,3.8,0], lift:null},
  b:{mat1:[1.72,3.56,0], mat2:[2.6,3.56,0], nest:null},
  c:{mat1:[1.72,4.3,0], mat2:[2.6,4.3,0], nest:null}
};
const FOCUS={n:[1.9,4.3],a:[1.9,3.8],b:[1.9,3.56],c:[1.9,4.3]};

/* ---------- copy ---------- */
const DESIGNS=A.DESIGNS={
  n:{name:'Now', title:'How it is today', sub:'No rug, no armchair, drying racks in the middle of the room.', table:null, pal:['#1F5A41','#34373c','#f0d21c','#C99A5B','#f3f3ef'],
     list:[
      ['Sofa and TV','Sofa on the long wall, TV bench opposite, slightly toward the entrance.'],
      ['Dining table','Long side against the wall under the painting, so the chairs at its ends sit in front of the two bedroom doors.'],
      ['Coffee station','On the sofa wall, in the corner next to bedroom 1.'],
      ['Drying racks','Fill the floor between the sofa, the dining table and the kitchen.'],
      ['Kitchen','Charcoal cabinets, a full counter, things stored on top of the cabinet and the fridge.'],
      ['Bedrooms','Bedroom 1: desk and a single bed. Bedroom 2: bed behind the cube shelf and the column, TV on a wall arm, bike under it, pine desk under the big window.']]},
  a:{name:'A', title:'A · Green corner', sub:'Oak, mustard and sage. The coffee corner becomes plants, and one table does coffee and lunch.', table:['Raise the table for lunch','Lower to coffee height'], pal:['#1F5A41','#8fbd9b','#D6A21E','#C99A5B','#F3EBDC'],
     list:[
      ['Coffee corner','Gone. A slim plant shelf and the monstera take the corner. The espresso machine and grinder move to the kitchen counter, next to the fridge.'],
      ['Table','A 140 × 65 lift-top table. Coffee height most of the day. The top rises 34 cm and slides toward the sofa for lunch, and the two poufs pull up as extra seats.'],
      ['TV wall','A white 2 × 4 cube shelf stands against the side of the fridge and hides it. Next to it, the TV hangs over a floating oak bench.'],
      ['Seats','A mustard armchair under the bus painting, between the two bedroom doors, with a floor lamp and two sage poufs.'],
      ['Rug','Jute, 200 × 300, tucked 35 cm under the sofa. 90 cm stays clear between the table and the TV bench.'],
      ['Light','Paper pendant over the table, arc lamp at the sofa, picture light on the painting, string lights, candles.'],
      ['Kitchen','Cabinets in a muted, slightly yellow sage. Counter and sink unchanged and cleared, bin gone. Pendant, light strip, runner.'],
      ['Bedrooms','Bedroom 1 is a study with two desks. In bedroom 2 the bike and scooter go, and a reading nook takes the place of the desk under the big window.']]},
  b:{name:'B', title:'B · Record corner', sub:'Calm and light. Music where the coffee was, a cube wall around the TV, a table that folds into the wall.', table:['Fold the table down','Fold the table away'], pal:['#1F5A41','#8fbd9b','#F3EBDC','#C99A5B','#22262a'],
     list:[
      ['Coffee corner','Becomes a record corner: a low oak console with the turntable, a speaker and a lamp. The coffee moves onto a small cart in the kitchen, by the window.'],
      ['Table','An 80 × 72 leaf hinged to the wall under the bus painting. Folded, it is a sage panel 3 cm deep. Down, it seats two on folding chairs that live in the wardrobe.'],
      ['TV wall','Two 2 × 4 cube towers, a low 4-cube unit and a bridge shelf frame the TV. 3 m wide. The first tower hides the side of the fridge.'],
      ['Sofa','Centred on the TV, 75 cm further from the front door than today.'],
      ['Seats and rug','Two cream poufs, two round nesting tables, a cream rug with sage stripes.'],
      ['Kitchen and bedrooms','Same as option A.']]},
  c:{name:'C', title:'C · Dining first', sub:'The top of the room rearranged into a real dining area by the kitchen, with the coffee right next to it.', table:null, pal:['#1F5A41','#C4673F','#D6A21E','#26386b','#F3EBDC'],
     list:[
      ['Dining','A fixed 85 × 140 table for four stands across the top zone, under its own pendant. Both bedroom doors open onto a clear path past its ends.'],
      ['Coffee corner','The coffee moves 1.5 m, onto an oak sideboard under the bus painting, right by the table. The old corner gets a storage bench with cushions.'],
      ['Sofa','Stays in the entrance corner where it is today, which leaves the whole top zone for dining.'],
      ['TV wall','The white cube shelf hides the fridge. The TV hangs over a floating oak bench, opposite the sofa.'],
      ['Rug','Terracotta kilim, 200 × 300, with two round nesting tables.'],
      ['Kitchen and bedrooms','Same as option A.']]}
};

/* ---------- state and layout animation ---------- */
const S=A.state={design:'a',table:0,pj:false,labels:true,dims:false};
A.tableT=0; A.layoutFns=[];
let anim=null;
const USER={};
function ukey(){return S.design+(S.table?'1':'0')+(S.pj?'p':'');}
function targets(){
  const out={}, put=function(o){for(const k in o) out[k]=o[k];};
  put(LAY[S.design]); if(S.table&&ALT[S.design]) put(ALT[S.design]); if(S.pj) put(PJ[S.design]);
  const u=USER[ukey()]; if(u) for(const k in u) if(out[k]) out[k]=u[k];          // furniture you moved yourself
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
      s.h=s.face?Math.atan2(FOCUS[S.design][0]-s.x,FOCUS[S.design][1]-s.z):f+R/2+(s.dh||0);
      live.push(s);
    });
  }
}
A.liveSeats=function(){return live;};
A.setDesign=function(k,instant){
  S.design=k; S.table=0; S.pj=false; if(typeof select==='function') select(null);
  A.layout(instant); renderPanel();
  if(A.onDesign) A.onDesign();
};
A.setTable=function(on){S.table=on?1:0; A.layout(); renderPanel();};

/* ---------- labels and dimension lines ---------- */
const fixedLabels=[
 {label:'Kitchen', pos:new THREE.Vector3(W+1.5,2.5,2.05)},
 {label:'Entrance', pos:new THREE.Vector3(EX,2.35,L)},
 {label:'Bedroom 1', alt:'Bedroom 1 · study', pos:new THREE.Vector3(1.2,1.5,-2.3)},
 {label:'Bedroom 2', alt:'Bedroom 2 · reading nook', pos:new THREE.Vector3(W+0.9,1.5,-2.0)},
 {label:'Bathroom and shower', pos:new THREE.Vector3(W+1.2,1.6,L-2.1)},
 {label:'Toilet', pos:new THREE.Vector3(W+0.9,1.6,L-0.5)},
 {label:'≈ '+L.toFixed(1)+' m', pos:new THREE.Vector3(-0.3,0.05,L/2), dim:true},
 {label:'≈ '+W.toFixed(1)+' m', pos:new THREE.Vector3(W/2,0.05,L+0.35), dim:true},
 {label:'ceiling ≈ '+H.toFixed(2)+' m', pos:new THREE.Vector3(0.05,H-0.2,L-1.2), dim:true},
 {label:'kitchen ≈ '+(KX-W).toFixed(1)+' × '+KZ.toFixed(1)+' m', pos:new THREE.Vector3((W+KX)/2,0.05,0.95), dim:true},
 {label:'tiles 60 × 60', pos:new THREE.Vector3(2.4,0.05,5.4), dim:true},
 {label:'doors 78 × 205', pos:new THREE.Vector3((D.door2[0]+D.door2[1])/2,0.1,0.45), dim:true}
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
  const now=S.design==='n';
  $('d_now').setAttribute('aria-pressed',now); $('d_new').setAttribute('aria-pressed',!now); $('segABC').hidden=now;
  ['a','b','c'].forEach(function(k){$('d_'+k).setAttribute('aria-pressed',k===S.design);});
  $('dTitle').textContent=d.title; $('dSub').textContent=d.sub;
  $('dPal').innerHTML=d.pal.map(function(c){return '<i style="background:'+c+'"></i>';}).join('');
  $('list').innerHTML=d.list.map(function(r){return '<li><b>'+r[0]+'</b><span>'+r[1]+'</span></li>';}).join('');
  const bt=$('bTable'); bt.hidden=!d.table; if(d.table) bt.textContent=d.table[S.table?1:0];
  fixedLabels.forEach(function(f){if(f.alt) f.el.textContent=S.design==='n'?f.label:f.alt;});
  if(A.onPanel) A.onPanel();
}
A.renderPanel=renderPanel;
let lastNew='a';
['a','b','c'].forEach(function(k){$('d_'+k).onclick=function(){lastNew=k; A.setDesign(k);};});
$('d_now').onclick=function(){A.setDesign('n');}; $('d_new').onclick=function(){A.setDesign(lastNew);};
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
A.setLabels=function(on){S.labels=on; $('cLabels').checked=on; $('bLabels').setAttribute('aria-pressed',on); $('bLabels').textContent=on?'Hide labels':'Show labels';};
$('cLabels').onchange=function(e){A.setLabels(e.target.checked);}; $('bLabels').onclick=function(){A.setLabels(!S.labels);};
$('bMenu').onclick=function(){const off=document.body.classList.toggle('nomenu'); $('bMenu').textContent=off?'Show menu':'Hide menu'; $('bMenu').setAttribute('aria-pressed',!off);};
$('cDims').onchange=function(e){S.dims=e.target.checked; dims.visible=S.dims;};
$('cCut').onchange=function(e){A.cut.constant=e.target.checked?1.25:100;};
$('note').textContent='Scaled from the photos, not measured: living room about '+W.toFixed(1)+' × '+L.toFixed(1)+' m, ceiling '+H.toFixed(2)+' m, kitchen '+(KX-W).toFixed(1)+' × '+KZ.toFixed(1)+' m, tiles 60 × 60 cm. Nothing here was measured with a tape, so the width in particular may be off by 20 to 30 cm. New furniture is drawn at typical catalogue sizes.';
A.renderer.domElement.addEventListener('pointerdown',function(){A.stopFly(); $('hint').style.opacity=0;});

/* ---------- moving furniture: touch a piece and drag it across the floor ---------- */
const NAMES={table:'Coffee table',chairA:'Chair',chairB:'Chair',rack2:'Drying rack',flamp:'Floor lamp',arc:'Arc lamp',monst:'Monstera',fid:'Fiddle-leaf fig',snk:'Snake plant',
  fc1:'Chair',fc2:'Chair',gc1:'Chair',gc2:'Chair',gc3:'Chair',gc4:'Chair',poufA2:'Pouf',poufB2:'Pouf',poufC2:'Pouf'};
for(const id in P) P[id].g.userData.piece=id;
const ray=new THREE.Raycaster(), ndc=new THREE.Vector2(), floor=new THREE.Plane(new THREE.Vector3(0,1,0),0), hit=new THREE.Vector3();
let drag=null, sel=null;
function aim(e){const r=A.renderer.domElement.getBoundingClientRect(); ndc.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1); ray.setFromCamera(ndc,A.camera);}
function shown(o,top){for(;o&&o!==top;o=o.parent) if(!o.visible||o.userData.nc) return false; return true;}
function pick(){
  let best=null, bd=1e9;
  for(const id in P){const p=P[id]; if(p.cur[3]<0.9||id.indexOf('rug')===0) continue;
    const hs=ray.intersectObject(p.g,true);
    for(let i=0;i<hs.length;i++){if(!shown(hs[i].object,p.g)) continue; if(hs[i].distance<bd){bd=hs[i].distance; best=p;} break;}
  }
  return best;
}
function clampPos(p){
  let x=Math.min(KX-0.15,Math.max(0.1,p.cur[0])), z=Math.min(L-0.1,Math.max(0.1,p.cur[1]));
  if(x>W-0.05&&z>KZ-0.1){if(p.from[0]>W-0.05) z=KZ-0.1; else x=W-0.05;}          // the kitchen ends at its sink wall
  p.cur[0]=x; p.cur[1]=z;
}
function place(p){p.to=[p.cur[0],p.cur[1],p.cur[2],1]; p.g.position.set(p.cur[0],0,p.cur[1]); p.g.rotation.y=p.cur[2];}
function commit(p){
  const k=ukey(); (USER[k]||(USER[k]={}))[p.id]=[p.cur[0],p.cur[1],p.cur[2]];
  resolveSeats(); for(let i=0;i<A.layoutFns.length;i++) A.layoutFns[i]();
  $('bResetMoves').hidden=false;
}
function select(p){
  sel=p; $('pieceBar').hidden=!p; if(p) $('pieceName').textContent=p.label||NAMES[p.id]||'Item';
}
A.stage.addEventListener('pointerdown',function(e){
  if(e.target!==A.renderer.domElement||anim||(A.eyeView&&A.eyeView())) return;
  if(drag){drag=null; A.controls.enabled=true; return;}                           // second finger: this is a pinch, not a move
  if(e.button) return;
  aim(e); const p=pick(); if(!p){select(null); return;}
  if(p.seats&&p.seats.some(function(s){return s.occ;})) return;                   // someone is sitting on it
  if(!ray.ray.intersectPlane(floor,hit)) return;
  drag={p:p,ox:hit.x-p.cur[0],oz:hit.z-p.cur[1],sx:e.clientX,sy:e.clientY,moved:false,id:e.pointerId};
  p.from=p.cur.slice(); A.controls.enabled=false;
},true);
window.addEventListener('pointermove',function(e){
  if(!drag||e.pointerId!==drag.id) return;
  if(!drag.moved&&Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)<6) return;
  drag.moved=true; aim(e); if(!ray.ray.intersectPlane(floor,hit)) return;
  const p=drag.p; p.cur[0]=hit.x-drag.ox; p.cur[1]=hit.z-drag.oz; clampPos(p); place(p);
});
function endDrag(e){
  if(!drag||e.pointerId!==drag.id) return;
  const d=drag; drag=null; A.controls.enabled=!(A.eyeView&&A.eyeView());
  if(d.moved){commit(d.p); A.justDragged=performance.now();}
  select(d.p);
}
window.addEventListener('pointerup',endDrag); window.addEventListener('pointercancel',endDrag);
$('bRotate').onclick=function(){if(!sel) return; sel.cur[2]+=R/4; place(sel); commit(sel);};
$('bPieceDone').onclick=function(){select(null);};
$('bResetMoves').onclick=function(){for(const k in USER) delete USER[k]; $('bResetMoves').hidden=true; select(null); A.layout();};
})();
