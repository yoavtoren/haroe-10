/* Haroe 10 — movable furniture, the design options and the Design tab */
(function(){
'use strict';
const A=window.APP, D=A.D, K=A.kit, W=D.W, L=D.L, H=D.H, KX=D.KX, KZ=D.KZ;
const box=A.box, cyl=A.cyl, sph=A.sph, M=A.M, G=A.G, scene=A.scene, canvasTex=A.canvasTex;
// modern rustic palette: white, oak, sage green, light blue
const R=Math.PI, OAK=0xc99a5b, INK=0x3b4a44, SAGE=A.SAGE, BLUE=A.BLUE, WHITE=0xfbfaf6, LINEN=0xefe7d6, RATTAN=0xd9c9a8, CREAM=0xf3ebdc;
const pc=(D.painting[0]+D.painting[1])/2, DC=(D.door1[1]+D.door2[0])/2, EX=(D.entrance[0]+D.entrance[1])/2;
const $=function(id){return document.getElementById(id);};

const P=A.pieces={};
const SZ=3.3;                 // the sofa is centred here, between the top zone and the front door
function piece(id,opt,build){const g=G(); P[id]=Object.assign({id:id,g:g,cur:[0,0,0,0],to:[0,0,0,0],h:1},opt||{}); build(g); return P[id];}
/* stretch a unit bar (built 1 long on x) between two points in the xy plane */
function barXY(m,x0,y0,x1,y1){m.position.x=(x0+x1)/2; m.position.y=(y0+y1)/2; m.rotation.z=Math.atan2(y1-y0,x1-x0); m.scale.x=Math.hypot(x1-x0,y1-y0);}
function barYZ(m,y0,z0,y1,z1){m.position.y=(y0+y1)/2; m.position.z=(z0+z1)/2; m.rotation.x=Math.atan2(-(y1-y0),z1-z0); m.scale.z=Math.hypot(y1-y0,z1-z0);}
const tableFns=[], liftFns=[];        // called with the dining table's / the lift-top's open amount 0..1

A.inRoom('living',function(){
/* ---------- what is there today ---------- */
piece('sofa',{label:'Sofa',h:1.2,seats:[
  {id:'sofaL',label:'Sofa, left',lx:0.2,lz:-0.9,y:0.45,type:'sit',recline:0.22},
  {id:'sofaM',label:'Sofa, middle',lx:0.2,lz:0,y:0.45,type:'sit',recline:0.22},
  {id:'sofaR',label:'Sofa, right',lx:0.2,lz:0.9,y:0.45,type:'sit',recline:0.22},
  {id:'sofaLie',label:'Sofa',lx:0.16,lz:0,y:0.46,type:'lie',dh:-R/2}]},function(g){   // about 330 x 120 cm, three seats, big back cushions
  const c=0x1f5a41, d=0x194a36, s=0x153d2d, len=3.3, rb=A.rbox;
  [[-0.5,-1.5],[0.5,-1.5],[-0.5,0],[0.5,0],[-0.5,1.5],[0.5,1.5]].forEach(function(q){cyl(0.03,0.07,0x2a2622,q[0],0.035,q[1],g,10);});   // feet
  rb(1.2,0.3,len,d,0,0.215,0,g,0.07);                                           // base
  rb(0.3,0.5,len,d,-0.45,0.6,0,g,0.1);                                          // back
  [-1,1].forEach(function(e){rb(0.94,0.34,0.3,d,0.13,0.5,e*(len/2-0.15),g,0.11);});   // arms
  [-0.9,0,0.9].forEach(function(z){
    rb(0.86,0.17,0.89,c,0.15,0.435,z,g,0.075); const sm=box(0.82,0.006,0.85,s,0.15,0.435,z,g); sm.castShadow=false;      // seat cushion with a seam
    const p=rb(0.24,0.5,0.86,0x246a4c,-0.2,0.72,z,g,0.11); p.rotation.z=0.2;    // back cushion
    [-0.2,0.2].forEach(function(dz){const b=sph(0.014,s,-0.075,0.76,z+dz,g,0.5,1,1); b.castShadow=false;});       // tufting buttons
  });
  [-1.25,-0.45].forEach(function(z){K.cushion(g,0xe6dccb,-0.5,1.0,z,0.9,0.2);});      // on the ledge of the back, leaning on the wall behind the back cushions
  const n=G(g,'abc');                                   // redesign: more cushions and a throw
  K.cushion(n,BLUE,0.02,0.68,1.15,1,0.35); K.cushion(n,0xfbfaf6,0.015,0.66,0.45,0.9,0.4); K.cushion(n,SAGE,0.02,0.68,-0.86,1,0.35);   // standing on the seat, their tops resting on the back cushions
  rb(0.352,0.5,0.324,LINEN,0.26,0.506,1.5,n,0.006,0.12).rotation.z=R/2;              // a throw folded over the arm: a band a little larger than the arm, lying along it
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
  K.espresso(g,-0.08,0.92,0.05,0); K.grinder(g,-0.1,0.92,-0.22,0);
  box(0.22,0.14,0.3,0xb98a4e,-0.1,0.99,0.42,g);                 // riser with jars
  cyl(0.05,0.1,0xe9e4d6,-0.08,1.11,0.36,g); cyl(0.045,0.08,0x3a4a5e,-0.08,1.1,0.49,g);
  box(0.012,0.56,0.76,0xf8f8f5,-0.29,1.75,-0.12,g);             // pegboard
  [-0.36,-0.14,0.08].forEach(function(z){cyl(0.045,0.08,0xb7bbbf,-0.25,1.9,z,g);});
  box(0.08,0.03,0.4,0xf3f3f0,-0.25,1.58,-0.2,g);
  box(0.008,0.3,0.22,0xd9463e,-0.294,1.8,0.52,g);               // poster
});
piece('dining',{label:'Dining table',h:1.2},function(g){        // white table, about 125 x 75
  box(1.25,0.04,0.75,0xfafaf7,0,0.74,0,g);
  [[-.57,-.32],[.57,-.32],[-.57,.32],[.57,.32]].forEach(function(p){box(0.05,0.72,0.05,0xf0f0ec,p[0],0.36,p[1],g);});
});
const chairSeat=function(id,label){return [{id:id,label:label,lx:0.02,lz:0,y:0.5,type:'sit'}];};
piece('chairA',{seats:chairSeat('chairA','Dining chair, left')},function(g){K.chair(g,0xf4f4f1,0x8fb59c);});
piece('chairB',{seats:chairSeat('chairB','Dining chair, right')},function(g){K.chair(g,0xf4f4f1,0x8fb59c);});
function rack(g){
  g.userData.nc=true;                       // light folding racks: people squeeze past them
  const s=0xb9bec2;
  [-0.27,0.27].forEach(function(z){box(1.5,0.016,0.016,s,0,0.9,z,g);}); [-0.742,0.742].forEach(function(x){box(0.016,0.016,0.556,s,x,0.9,0,g);});     // frame
  for(let i=-3;i<=3;i++) box(1.48,0.006,0.006,s,0,0.9,i*0.068,g).castShadow=false;                                                               // wires
  [-0.5,0.5].forEach(function(x){[-1,1].forEach(function(d){box(0.016,1.0,0.016,s,x,0.45,0,g).rotation.x=d*0.5;}); box(0.016,0.016,0.5,s,x,0.02,0,g);});   // crossed legs
  const drape=function(x,w,c,front,back){A.rbox(w,0.014,0.2,c,x,0.912,0,g,0.006); box(w,front,0.012,c,x,0.912-front/2,-0.1,g); box(w,back,0.012,c,x,0.912-back/2,0.1,g);};
  drape(0.34,0.44,0x2c3a55,0.42,0.3); drape(-0.36,0.36,0xf2f2f2,0.3,0.36);                                                                      // a towel and a shirt already drying
}
piece('rack1',{label:'Drying racks',h:1.3},rack); piece('rack2',{},rack);


/* ---------- rugs, 160 x 230 ---------- */
piece('rugA',{label:'Wool rug 160 × 230',h:0.25,isNew:true,shop:['Flatwoven wool rug','TIPHEDE','ikea','Natural and off-white, 155 × 220.']},function(g){K.rug(g,1.6,2.3,'wool');});
piece('rugB',{label:'Striped rug 160 × 230',h:0.25,isNew:true,shop:['Striped cotton rug','flatwoven rug blue stripe','ikea']},function(g){K.rug(g,1.6,2.3,'stripe');});
piece('rugC',{label:'Jute rug 160 × 230',h:0.25,isNew:true,shop:['Jute rug','LOHALS','ikea','160 × 230.']},function(g){K.rug(g,1.6,2.3,'jute');});

/* ---------- option A: lift-top table. Coffee height by default, rises 32 cm and slides toward the sofa for lunch ---------- */
piece('lift',{label:'Lift-top table',h:1.0,isNew:true,shop:['Lift-top coffee table','שולחן סלון מתרומם עץ אלון','web','IKEA does not carry one. Look for about 120 × 60 cm in oak, with a top that rises to 70 cm or more.']},function(g){
  box(0.56,0.2,1.12,0xfbfaf6,0,0.22,0,g); box(0.52,0.012,1.08,0x8a6a3c,0,0.325,0,g);            // storage body
  [[-.24,-.52],[.24,-.52],[-.24,.52],[.24,.52]].forEach(function(p){box(0.04,0.12,0.04,OAK,p[0],0.06,p[1],g);});
  const top=G(g); top.position.set(0,0.36,0);
  A.rbox(0.6,0.04,1.2,OAK,0,0,0,top,0.012);
  box(0.3,0.015,0.4,INK,0.05,0.028,-0.3,top); K.candle(top,0.0,0.035,-0.4,0.09); K.candle(top,0.1,0.035,-0.28,0.13); K.candle(top,-0.02,0.035,-0.2,0.06);
  K.bookStack(top,0.05,0.02,0.35,3,12); K.bush(top,-0.12,0.02,0.05,0.05,BLUE);
  const arms=[-0.54,0.54].map(function(z){
    return [0.2,-0.1].map(function(bx){const m=box(1,0.02,0.02,0x8d9092,0,0,z,g); m.userData.bx=bx; return m;});
  });
  liftFns.push(function(t){
    top.position.set(-0.2*t,0.36+0.34*t,0);
    arms.forEach(function(pair){pair.forEach(function(m){const bx=m.userData.bx; barXY(m,bx,0.325,bx-0.3-0.2*t,0.345+0.34*t);});});
  });
});
function poufs(prefix,col,label){[1,2].forEach(function(i){
  piece(prefix+i,{label:i===1?label:null,h:0.75,isNew:true,shop:['Pouf','SANDARED pouffe','ikea'],seats:[{id:prefix+i,label:'Pouf '+i,lx:0,lz:0,y:0.42,type:'sit',face:true}]},function(g){K.pouf(g,col);});
});}
poufs('poufA',LINEN,'Poufs'); poufs('poufB',BLUE,'Poufs');
piece('armA',{label:'Armchair',h:1.1,isNew:true,shop:['Wing armchair','STRANDMON','ikea','Choose a light blue or light beige cover.'],seats:[{id:'armA',label:'Armchair',lx:0.1,lz:0,y:0.43,type:'sit',recline:0.18}]},function(g){K.armchair(g,BLUE,0x86adc0); K.cushion(g,WHITE,-0.12,0.62,0.05,0.9,0.35);});
piece('flamp',{shop:['Floor lamp','ÅRSTID floor lamp','ikea'],label:null},function(g){K.floorLamp(g,'L:living');});

/* ---------- option B: table that folds flat against the wall under the painting ---------- */
piece('fold',{label:'Fold-down table',h:1.15,isNew:true,shop:['Wall-mounted drop-leaf table','NORBERG','ikea','Folds flat against the wall. BJURSTA is the wood-veneer alternative.']},function(g){
  box(0.78,0.07,0.03,OAK,0,0.725,0.015,g);                                      // wall cleat
  const leaf=G(g); leaf.position.set(0,0.76,0.03);
  const oak=M(OAK), sage=M(SAGE);
  const lf=new THREE.Mesh(new THREE.BoxGeometry(0.74,0.03,0.72),[oak,oak,oak,sage,oak,oak]); lf.position.set(0,0,0.36); lf.castShadow=true; lf.receiveShadow=true; leaf.add(lf);
  A.torus(0.16,0.012,0xf3ebdc,0,-0.017,0.36,leaf).rotation.x=R/2;                 // ring on the underside, shows when folded
  const stuff=G(leaf); cyl(0.05,0.16,BLUE,0,0.095,0.2,stuff,12,0.03); sph(0.05,0x3f9160,0,0.22,0.2,stuff);
  const struts=[-0.28,0.28].map(function(x){return box(0.025,0.025,1,INK,x,0,0,g);});
  tableFns.push(function(t){
    leaf.rotation.x=(1-t)*R/2; stuff.visible=t>0.97;
    const th=(1-t)*R/2;
    struts.forEach(function(m){barYZ(m,0.2,0.03,0.745-Math.sin(th)*0.5,0.03+Math.cos(th)*0.5);});
  });
});
function sideChairs(prefix,n,frame,seatCol,shop){for(let i=1;i<=n;i++)
  piece(prefix+i,{seats:[{id:prefix+i,label:'Table chair '+i,lx:0.02,lz:0,y:0.5,type:'sit'}],isNew:true,shop:shop},function(g){K.chair(g,frame,seatCol);});}
sideChairs('fc',2,WHITE,SAGE,['Folding chair','TERJE folding chair','ikea','Folds flat and hangs on a hook when the table is up.']);

/* ---------- option C: drop-leaf table. A 26 cm console against the wall, opens to 75 x 150 for four ---------- */
piece('gate',{label:'Drop-leaf dining table',h:1.15,isNew:true,shop:['Gateleg table','NORDEN gateleg table','ikea','Closed it is a narrow console with drawers; both leaves up seats four.']},function(g){
  A.rbox(0.75,0.03,0.26,OAK,0,0.745,0,g,0.01,0.004); box(0.6,0.51,0.18,WHITE,0,0.475,0,g);       // top and leaves have square corners, so they meet along the hinges; the body sits 1 cm inside the legs
  [-0.2,0.05].forEach(function(y){box(0.52,0.004,0.004,0xcfc8b8,0,0.47+y,0.091,g); box(0.52,0.004,0.004,0xcfc8b8,0,0.47+y,-0.091,g);});
  [[-.29,-.08],[.29,-.08],[-.29,.08],[.29,.08]].forEach(function(p){box(0.04,0.72,0.04,OAK,p[0],0.36,p[1],g);});
  const leaves=[1,-1].map(function(s){const lg=G(g); lg.position.set(0,0.745,s*0.13); A.rbox(0.75,0.026,0.62,OAK,0,0,s*0.31,lg,0.01,0.004); return {g:lg,s:s};});
  const legs=[1,-1].map(function(s){return box(0.04,0.72,0.04,OAK,0,0.36,s*0.68,g);});
  const stuff=G(g); cyl(0.06,0.2,BLUE,0.18,0.86,0,stuff,14,0.035); sph(0.07,0x3f9160,0.18,1.0,0,stuff); K.bookStack(stuff,-0.18,0.76,0,3,3);
  tableFns.push(function(t){
    const front=Math.max(t,A.halfT||0);                 // the leaf facing the room also opens on its own, for two
    leaves.forEach(function(l){l.g.rotation.x=l.s*(1-(l.s>0?front:t))*R/2;});
    legs.forEach(function(m,i){const q=i===0?front:t; m.visible=q>0.05; m.scale.y=Math.max(0.01,q); m.position.y=0.73-0.36*q;});
  });
});
sideChairs('gc',4,WHITE,BLUE,['Dining chair','INGOLF chair white','ikea']);

/* ---------- small coffee tables for B and C ---------- */
piece('nest',{label:'Nesting tables',h:0.8,isNew:true,shop:['Nesting coffee tables','nesting tables set of 2','ikea']},function(g){
  cyl(0.36,0.035,OAK,0,0.42,-0.12,g,36); [0,2.1,4.2].forEach(function(a){cyl(0.014,0.4,WHITE,Math.cos(a)*0.26,0.2,-0.12+Math.sin(a)*0.26,g,6);});
  cyl(0.24,0.03,WHITE,0.04,0.33,0.42,g,30); [0.5,2.6,4.7].forEach(function(a){cyl(0.012,0.32,OAK,0.04+Math.cos(a)*0.18,0.16,0.42+Math.sin(a)*0.18,g,6);});
  box(0.22,0.015,0.3,LINEN,0,0.445,-0.15,g); K.candle(g,-0.05,0.452,-0.22,0.1); K.candle(g,0.05,0.452,-0.1,0.14);
  K.bush(g,0.04,0.345,0.42,0.06,BLUE);
});

/* ---------- TV wall. Only 1.4 m is free between the fridge and the bathroom door, so each option is a cube shelf
   that hides the side of the fridge plus a 1.3 m bench ---------- */
piece('towerA',{label:'Cube shelf hides the fridge',h:1.95,isNew:true,shop:['Cube shelf 2 × 4','KALLAX 77x147','ikea','White, with woven inserts.']},function(g){
  const k=K.kallax(g,['pb','xb','by','sx'],WHITE,{box:RATTAN,box2:SAGE});
  box(0.3,0.2,0.34,RATTAN,0,k.h+0.1,-0.17,g); K.pothos(g,0.02,k.h,0.2,0.7,2);          // basket and a trailing plant cover the fridge top
});
piece('towerB',{label:'Cube tower hides the fridge',h:1.95,isNew:true,shop:['Cube shelf 1 × 4','KALLAX 42x147','ikea','White, 42 cm wide. It stands against the side of the fridge.']},function(g){
  const k=K.kallax(g,['p','b','x','b'],WHITE,{box:RATTAN});
  box(0.3,0.26,0.34,RATTAN,0,k.h+0.13,0,g); K.pothos(g,0.1,k.h,0,0.5,6);          // basket and trailing plant reach the top of the fridge
});
function tvBench(id,body,top,floating,shop){
  piece(id,{label:'TV bench 130 cm',h:1.75,isNew:true,shop:shop},function(g){
    const y0=floating?0.25:0.12;
    box(0.38,0.3,1.3,body,0,y0+0.15,0,g); box(0.4,0.025,1.32,top,0,y0+0.31,0,g);
    [-0.22,0.22].forEach(function(z){box(0.004,0.26,0.004,0xb9b3a4,0.191,y0+0.15,z,g);});
    if(!floating) [[-.16,-.6],[.16,-.6],[-.16,.6],[.16,.6]].forEach(function(p){box(0.035,0.12,0.035,OAK,p[0],0.06,p[1],g);});
    K.tv(g,-0.05,y0+0.76,0); box(0.2,0.03,0.5,0x101214,-0.05,y0+0.34,0,g); box(0.04,0.1,0.06,0x101214,-0.05,y0+0.38,0,g);   // on its stand
    K.bookStack(g,0.02,y0+0.325,-0.5,3,7); cyl(0.05,0.2,BLUE,0.02,y0+0.425,0.52,g,14,0.03); K.bush(g,0.02,y0+0.325,0.3,0.06);
    if(floating) A.pool('L:living',0xffc47a,0.25,0.03,0,0.8,g,0.3);
  });
}
tvBench('benchA',OAK,OAK,true,['Wall-mounted TV bench','BESTÅ TV bench 120 wall mounted','ikea','Hang it 25 cm off the floor. An oak top makes it warmer.']);
tvBench('benchB',WHITE,OAK,false,['TV bench','HAVSTA TV bench white','ikea','A panelled white bench; HEMNES is the simpler alternative.']);

/* ---------- what replaces the coffee corner ---------- */
piece('ladder',{label:'Plant shelf',h:2.0,isNew:true,shop:['Open shelf unit','JONAXEL shelving unit','ikea','Or any slim wood-and-metal shelf, about 80 × 35 × 180.']},function(g){              // A: a green corner
  [[-.15,-.39],[.15,-.39],[-.15,.39],[.15,.39]].forEach(function(p){box(0.025,1.8,0.025,WHITE,p[0],0.9,p[1],g);});
  [0.3,0.75,1.2,1.65].forEach(function(y){box(0.34,0.025,0.8,OAK,0,y,0,g);});
  K.books(g,0,0.3125,-0.12,0.45,0.24,0.2,61); K.bush(g,0,0.3125,0.25,0.08,BLUE);
  K.bush(g,0,0.7625,-0.2,0.09); K.bookStack(g,0,0.7625,0.2,4,8);
  K.tableLamp(g,0,1.2125,0.22,'L:living',0.9); cyl(0.05,0.2,BLUE,0,1.3125,-0.2,g,14,0.03);
  K.pothos(g,0,1.6625,-0.15,0.6,14); K.bush(g,0,1.6625,0.24,0.07);
});
piece('music',{label:'Record corner',h:1.2,isNew:true,shop:['Low sideboard','sideboard oak 120','ikea','About 120 × 40 × 60, for the turntable and speaker.']},function(g){              // B: music instead of coffee
  box(0.42,0.38,1.2,WHITE,0,0.45,0,g); box(0.44,0.025,1.22,OAK,0,0.652,0,g); [-0.2,0.2].forEach(function(z){box(0.004,0.34,0.004,0xb9b3a4,0.211,0.45,z,g);});
  [[-.17,-.55],[.17,-.55],[-.17,.55],[.17,.55]].forEach(function(p){cyl(0.016,0.26,OAK,p[0],0.13,p[1],g,8);});
  A.rbox(0.36,0.06,0.44,OAK,0,0.695,-0.34,g,0.012);                                    // turntable: plinth, platter with a record, tonearm
  cyl(0.155,0.01,0xb9bdc0,0.01,0.729,-0.36,g,32);
  const disc=new THREE.Mesh(new THREE.CylinderGeometry(0.148,0.148,0.006,40),[M(0x111214),A.MT(canvasTex(128,128,function(c){
    c.fillStyle='#101113'; c.fillRect(0,0,128,128); for(let q=22;q<62;q+=2){c.strokeStyle='rgba(255,255,255,'+(q%6?0.05:0.13)+')'; c.lineWidth=0.7; c.beginPath(); c.arc(64,64,q,0,7); c.stroke();}
    const gr=c.createLinearGradient(0,0,128,128); gr.addColorStop(0.4,'rgba(255,255,255,0)'); gr.addColorStop(0.5,'rgba(255,255,255,0.22)'); gr.addColorStop(0.6,'rgba(255,255,255,0)'); c.fillStyle=gr; c.beginPath(); c.arc(64,64,62,0,7); c.fill();
    c.fillStyle='#9fc4d6'; c.beginPath(); c.arc(64,64,19,0,7); c.fill(); c.fillStyle='#1F5A41'; c.fillRect(52,58,24,4); c.fillStyle='#fbfaf6'; c.beginPath(); c.arc(74,52,3,0,7); c.fill(); c.fillStyle='#101113'; c.beginPath(); c.arc(64,64,2,0,7); c.fill();}),null,true),M(0x111214)]);
  disc.position.set(0.01,0.738,-0.36); disc.castShadow=true; g.add(disc);
  const arm=G(g); arm.position.set(-0.13,0.75,-0.17); cyl(0.018,0.03,0xb9bdc0,0,-0.005,0,arm,12); box(0.008,0.008,0.21,0xd9dcdc,0,0.012,-0.1,arm); box(0.022,0.014,0.035,0x2b2b2b,0,0.006,-0.2,arm); arm.rotation.y=0.12;
  g.userData.disc=disc; g.userData.arm=arm;
  K.books(g,0.0,0.665,0.02,0.2,0.31,0.3,55);
  box(0.2,0.3,0.2,0xe9e6df,-0.06,0.815,0.45,g); cyl(0.06,0.004,0x9aa39e,0.042,0.825,0.45,g,14).rotation.z=R/2;
  K.tableLamp(g,-0.04,0.665,0.23,'L:living',0.9);
});
piece('bench',{label:'Storage bench',h:0.9,isNew:true,shop:['Bench with storage','PERJOHAN bench with storage','ikea','Pine, about 100 cm. Two side by side fill the corner.'],seats:[{id:'benchA',label:'Bench, left',lx:0.02,lz:-0.35,y:0.5,type:'sit'},{id:'benchB',label:'Bench, right',lx:0.02,lz:0.35,y:0.5,type:'sit'}]},function(g){
  box(0.42,0.06,1.4,OAK,0,0.41,0,g); [[-.17,-.64],[.17,-.64],[-.17,.64],[.17,.64]].forEach(function(p){box(0.04,0.38,0.04,OAK,p[0],0.19,p[1],g);});
  A.rbox(0.4,0.08,0.66,SAGE,0,0.475,-0.35,g,0.035); A.rbox(0.4,0.08,0.66,SAGE,0,0.475,0.35,g,0.035);
  box(0.32,0.24,0.4,RATTAN,0,0.13,-0.35,g); box(0.32,0.24,0.4,RATTAN,0,0.13,0.35,g);
  K.cushion(g,BLUE,-0.14,0.66,-0.5,0.9,0.2); K.cushion(g,WHITE,-0.14,0.66,0.52,0.9,0.2);
});
A.inRoom('kitchen',function(){
  piece('cart',{label:'Coffee cart',h:1.4,isNew:true,shop:['Kitchen trolley','RÅSKOG trolley','ikea','Or a wood-topped trolley such as BEKVÄM.']},function(g){                // B: the coffee rolls into the kitchen
    [0.34,0.85].forEach(function(y){box(0.38,0.02,0.6,OAK,0,y,0,g);});
    [[-.17,-.28],[.17,-.28],[-.17,.28],[.17,.28]].forEach(function(p){box(0.02,0.83,0.02,WHITE,p[0],0.455,p[1],g); cyl(0.025,0.02,INK,p[0],0.025,p[1],g,10).rotation.x=R/2;});
    K.espresso(g,-0.03,0.86,0.13,0); K.grinder(g,-0.05,0.86,-0.17,0);
    [-0.15,0,0.15].forEach(function(z){cyl(0.035,0.08,WHITE,0,0.39,z,g,12);});
  });
  const ka=G(null,'ac'), cx=KX-1.8;                                               // A and C: the coffee sits on the kitchen counter, by the fridge
  K.espresso(ka,cx+0.31,0.92,KZ-0.3,R/2); K.grinder(ka,cx+0.09,0.92,KZ-0.28,R/2);
});

/* ---------- lamp that moves between options ---------- */
piece('arc',{shop:['Arc floor lamp','arc floor lamp','ikea']},function(g){K.arcLamp(g,'L:living');});

/* ---------- pajama party mattresses (you can step over them) ---------- */
function mattress(id,label,col){
  piece(id,{label:label,h:0.5,seats:[{id:id,label:label,lx:0,lz:0,y:0.17,type:'lie',dh:-R/2}]},function(g){
    g.userData.nc=true;
    A.rbox(0.8,0.15,1.9,0xf3efe6,0,0.075,0,g); A.rbox(0.78,0.05,1.15,col,0,0.165,0.34,g); A.rbox(0.5,0.1,0.32,0xffffff,0,0.19,-0.72,g);
  });
}
mattress('mat1','Mattress by the sofa',0xcfe3ec); mattress('mat2','Mattress by the bedroom doors',0xbfd8c6);

/* ---------- two more coffee tables ---------- */
piece('round',{label:'Round oak table',h:0.8,isNew:true,shop:['Round coffee table','round coffee table oak 80','ikea','About 80 cm across, solid or veneered oak.']},function(g){
  cyl(0.4,0.04,OAK,0,0.42,0,g,48); A.torus(0.4,0.02,OAK,0,0.42,0,g).rotation.x=R/2; cyl(0.07,0.36,OAK,0,0.22,0,g,16,0.05); cyl(0.26,0.04,OAK,0,0.02,0,g,30);
  box(0.26,0.015,0.26,LINEN,0.05,0.447,-0.08,g); K.candle(g,0.0,0.455,-0.12,0.1); K.candle(g,0.1,0.455,-0.04,0.14); K.bush(g,-0.15,0.44,0.14,0.05,BLUE);
});
piece('trunk',{label:'Storage chest table',h:0.8,isNew:true,shop:['Wooden storage chest','wooden storage trunk coffee table','web','A pine or oak chest about 100 × 50 × 42 cm. Blankets and games go inside.']},function(g){
  box(0.5,0.38,1.0,OAK,0,0.23,0,g); box(0.52,0.04,1.02,0xb98a4e,0,0.44,0,g);
  [-0.42,0.42].forEach(function(z){box(0.53,0.034,0.04,0x3b4a44,0,0.445,z,g); box(0.004,0.38,0.04,0x3b4a44,0.252,0.23,z,g);});
  [[-.2,-.44],[.2,-.44],[-.2,.44],[.2,.44]].forEach(function(p){box(0.05,0.04,0.05,0x3b4a44,p[0],0.02,p[1],g);});
  box(0.3,0.02,0.4,RATTAN,0,0.47,-0.15,g); K.candle(g,-0.04,0.48,-0.22,0.1); K.bookStack(g,0.02,0.46,0.25,3,9);
});

/* ---------- TV benches for the proposals. There is only 0.8 m of wall, so the TV stays on a stand in front of the fridge side. ---------- */
piece('kbench',{label:'Cube shelf as a TV bench',h:1.7,isNew:true,shop:['Cube shelf 4 × 2, lying down','KALLAX 147x77','ikea','White, with woven inserts. The TV stands on top.']},function(g){
  const k=K.kallax(g,['bxpb','ybsx'],WHITE,{box:RATTAN,box2:SAGE});
  box(0.24,0.03,0.5,0x101214,0.02,k.h+0.015,0,g); box(0.04,0.08,0.06,0x101214,0.0,k.h+0.06,0,g); K.tv(g,0.0,k.h+0.44,0);
  K.bush(g,0.04,k.h,-0.6,0.06,BLUE);
});

/* ---------- what replaces the wardrobe at the entrance (built facing +x, back to the wall) ---------- */
piece('hallBench',{label:'Entrance bench and hooks',h:1.9,isNew:true,shop:['Hall bench with shoe storage','TJUSIG bench with shoe storage','ikea','About 80 to 100 cm wide, with a hook rail above it.'],seats:[{id:'hall',label:'Entrance bench',lx:0.02,lz:0,y:0.5,type:'sit'}]},function(g){
  box(0.34,0.05,0.9,OAK,0,0.46,0,g); [[-.14,-.41],[.14,-.41],[-.14,.41],[.14,.41]].forEach(function(p){box(0.035,0.44,0.035,WHITE,p[0],0.22,p[1],g);});
  box(0.3,0.02,0.84,WHITE,0,0.16,0,g); box(0.26,0.2,0.34,RATTAN,0,0.27,-0.22,g); box(0.22,0.1,0.26,0xe9e6df,0,0.22,0.22,g);
  box(0.02,0.08,0.9,OAK,-0.21,1.7,0,g); [-0.3,0,0.3].forEach(function(z){cyl(0.012,0.07,INK,-0.17,1.7,z,g,8).rotation.z=R/2;});
  box(0.06,0.6,0.3,0x1f5a41,-0.15,1.38,-0.3,g); box(0.05,0.32,0.26,RATTAN,-0.16,1.5,0.3,g); K.cushion(g,BLUE,-0.06,0.6,0.25,0.8,0.1);
});
piece('shoeCab',{label:'Shoe cabinet',h:1.5,isNew:true,shop:['Slim shoe cabinet','HEMNES shoe cabinet','ikea','Only 22 to 30 cm deep, so the entrance stays open.']},function(g){
  box(0.24,0.95,0.9,WHITE,0,0.5,0,g); box(0.26,0.025,0.92,OAK,0,0.99,0,g); [0.35,0.67].forEach(function(y){box(0.004,0.004,0.86,0xb9b3a4,0.121,y,0,g);});
  [0.5,0.82].forEach(function(y){box(0.012,0.02,0.12,OAK,0.126,y,0,g);});
  box(0.16,0.03,0.24,RATTAN,0,1.02,-0.25,g); K.bush(g,0,1.0,0.25,0.07,BLUE); K.tableLamp(g,0,1.0,0,'L:living',0.8);
});

/* ---------- fixed decoration for the proposals ---------- */
const dn=G(null,'abc'), db=G(null,'b');
K.stringLights(dn,0,2.42,SZ-1.7,SZ+1.7,24);
box(0.5,0.025,0.05,A.lampMat('L:living',0xb08d4a,0xffe2b0,0.8),pc,2.34,0.07,dn); box(0.02,0.02,0.06,0xb08d4a,pc,2.34,0.04,dn);   // picture light
A.pool('L:living',0xffd9a0,pc,1.8,0.03,0.9,dn,0.32,0);
// entrance: round gold mirror on the side of the toilet block, doormat, basket on the wardrobe
A.torus(0.26,0.022,0xd9aa12,D.BLK-0.03,1.6,5.68,dn).rotation.y=R/2; cyl(0.25,0.008,0xcfdadd,D.BLK-0.012,1.6,5.68,dn,40).rotation.z=R/2;
box(0.75,0.014,0.5,0xa89878,EX,0.007,L-0.3,dn).castShadow=false;      // wholly inside, clear of the door and of the mat in the lobby
});
K.onlyAll(K.frame('left',SZ-0.93,1.78,0.62,0.82,0,0xc99a5b).concat(K.frame('left',SZ,1.78,0.62,0.82,1,0xc99a5b),K.frame('left',SZ+0.93,1.78,0.62,0.82,3,0xc99a5b)),'abc');
K.onlyAll(K.frame('left',0.6,1.68,0.48,0.6,2,0xc99a5b).concat(K.frame('left',1.2,1.68,0.48,0.6,7,0xc99a5b)),'abc').forEach(function(m){m.userData.not='f';});      // above the record corner
/* ---------- wall treatments for options D, E and F (the sofa wall: u runs from the bedroom end to the front door) ---------- */
A.only(A.rect('left',1.55,L,0.08,H,0xa9c4ad,0.003),'d');                                  // D: the whole sofa wall in sage
const bead=canvasTex(64,64,function(g){g.fillStyle='#fbfaf6'; g.fillRect(0,0,64,64); g.fillStyle='#dedbd2'; g.fillRect(0,0,3,64); g.fillStyle='#ffffff'; g.fillRect(3,0,2,64);});
bead.wrapS=bead.wrapT=THREE.RepeatWrapping; bead.repeat.set(L/0.09,1);
K.onlyAll([A.rect('left',0,L,0.08,1.1,A.MT(bead,'living'),0.004),A.rect('left',0,L,1.1,1.15,0xfbfaf6,0.006),A.rect('left',0,L,1.15,H,0xcfe0e8,0.003)],'e');   // E: white panelling, light blue above
A.only(A.rect('left',0.1,1.75,0.08,H,0xa9c4ad,0.003),'f');                                // F: sage behind the record corner, with shelves of records
A.inRoom('living',function(){
  const g=G(null,'f');
  [1.2,1.58,1.96].forEach(function(y,i){box(0.24,0.03,1.3,OAK,0.12,y,0.9,g); K.books(g,0.13,y+0.015,0.9-0.25+i*0.2,0.7,0.31,0.2,120+i); if(i===1) K.bush(g,0.13,y+0.015,1.4,0.06,BLUE);});
});

/* ---------- layouts: x, z, rotation. A piece that is not listed is hidden. ---------- */
const TVZ=2.9, HALL=[1.6,L-0.225,R/2], CAB=[1.6,L-0.135,R/2];      // a few mm clear of the entrance wall, which is also the lobby's wall
const COMMON={sofa:[0.60,SZ,0], music:[0.22,0.9,0], gate:[DC,0.17,0], rack1:[0.45,-2.0,R/2]};          // the drying rack lives in the study          // every proposal keeps the record corner and the drop-leaf table
function lay(o){for(const k in COMMON) o[k]=COMMON[k]; return o;}
const LAY={
  n:{sofa:[0.60,SZ,0], table:[1.8,SZ+0.05,0], tvOld:[W-0.24,TVZ,R], station:[0.30,0.72,0],
     dining:[pc,0.48,0], chairA:[pc-0.92,0.50,0], chairB:[pc+0.92,0.50,R], rack1:[1.2,1.38,0], rack2:[2.55,1.5,0]},
  a:lay({rugA:[1.75,SZ,0], lift:[1.95,SZ,0], kbench:[W-0.2,TVZ,R], poufA1:[1.95,SZ-1.03,0], poufA2:[1.95,SZ+1.03,0], shoeCab:CAB}),
  b:lay({rugB:[1.75,SZ,0], nest:[1.95,SZ,0], towerB:[W-0.195,2.3,R], benchB:[W-0.205,3.18,R], cart:[KX-0.24,1.8,R], poufB1:[1.95,SZ+1.0,0], hallBench:HALL}),
  c:lay({rugC:[1.75,SZ,0], table:[1.8,SZ,0], tvOld:[W-0.24,TVZ,R], poufA1:[1.95,SZ+1.03,0], hallBench:HALL})
};
LAY.d=lay({rugC:[1.75,SZ,0], round:[1.95,SZ,0], towerB:[W-0.195,2.3,R], benchB:[W-0.205,3.18,R], poufA1:[1.95,SZ-1.0,0], poufA2:[1.95,SZ+1.0,0], shoeCab:CAB});
LAY.e=lay({rugB:[1.75,SZ,0], trunk:[1.95,SZ,0], kbench:[W-0.2,TVZ,R], poufB1:[1.95,SZ+1.05,0], hallBench:HALL});
LAY.f=lay({rugA:[1.75,SZ,0], nest:[1.95,SZ,0], towerB:[W-0.195,2.3,R], benchB:[W-0.205,3.18,R], poufA1:[1.95,SZ+1.05,0], shoeCab:CAB});
const OPEN={gate:[2.15,1.05,0], gc1:[1.52,0.7,0], gc3:[1.52,1.4,0], gc2:[2.78,0.7,R], gc4:[2.78,1.4,R]};   // table set for four
const OPEN2={gc1:[DC-0.57,0.55,0], gc2:[DC,1.2,R/2]};      // one leaf up, table still against the wall: seats two
const PJ={    // pajama party: the coffee table is put away and two mattresses go down
  n:{mat1:[1.95,SZ,0], mat2:[2.0,1.45,R/2], table:null, rack1:null, rack2:null},
  a:{mat1:[1.95,SZ,0], mat2:[2.0,1.45,R/2], lift:null, poufA1:null, poufA2:null},
  b:{mat1:[1.95,SZ,0], mat2:[2.0,1.45,R/2], nest:null, poufB1:null},
  c:{mat1:[1.95,SZ,0], mat2:[2.0,1.45,R/2], table:null, poufA1:null},
  d:{mat1:[1.95,SZ,0], mat2:[2.0,1.45,R/2], round:null, poufA1:null, poufA2:null},
  e:{mat1:[1.95,SZ,0], mat2:[2.0,1.45,R/2], trunk:null, poufB1:null},
  f:{mat1:[1.95,SZ,0], mat2:[2.0,1.45,R/2], nest:null, poufA1:null}
};

/* ---------- copy ---------- */
const DESIGNS=A.DESIGNS={
  n:{name:'Current', title:'Current state', sub:'How the flat is today, modelled from your photos and the video.', table:null, pal:['#1F5A41','#34373c','#f0d21c','#C99A5B','#f3f3ef'],
     list:[
      ['Living room','About 3.1 m wide and 5.95 m long. Between the fridge and the bathroom door there is about 1 m of wall, so the TV bench stands in front of the fridge side. The guest toilet juts in at the entrance, so the entrance wall is 2.3 m: front door, wardrobe, vacuum. Outside the door: the lobby with the stairs on the left, and the bridge to the street.'],
      ['Sofa and TV','Sofa on the long wall, white TV bench opposite, 55 cm from the coffee table.'],
      ['Top of the room','Coffee station in the corner, dining table under the bus painting, drying racks in between.'],
      ['Bathroom','Its door is in the same wall as the TV, right next to it. Sink on the right, washing machine opposite it under the boiler, toilet on the far wall under the window, shower to its right.'],
      ['Guest toilet','Its own door, at a right angle to the bathroom door.'],
      ['Bedroom 2','Dresser and wardrobe in a niche on the left, cube shelf between the wall and the column, bed behind it 40 cm from the TV wall, bike, desk under the big window facing the wardrobe.']]},
  a:{name:'A', title:'A · Lift-top', sub:'Modern rustic: white, oak, sage and light blue. The coffee table also rises to eating height.', table:['Open the dining table for four','Close it to a console'], pal:['#1F5A41','#8fbd9b','#9fc4d6','#C99A5B','#fbfaf6'],
     list:[
      ['Dining','The drop-leaf table: a 26 cm console with drawers under the bus painting. With one leaf up it stays against the wall and seats two. With both up it moves out and seats four at 75 × 150, clear of both bedroom doors.'],
      ['Coffee table','A 120 × 60 lift-top in oak and white, with a linen pouf at each end. Raised, it is a second eating or laptop spot at the sofa.'],
      ['Record corner','Where the coffee station was: a low white and oak sideboard with the turntable, a speaker and a lamp. The espresso machine moves to the kitchen counter.'],
      ['TV wall','About 1 m of wall between the fridge and the bathroom door, so the TV stays on a stand. A white 4 × 2 cube shelf with woven baskets lies in front of the fridge side and hides its lower half; the TV on top covers most of the rest.'],
      ['Entrance','The wardrobe goes. A slim white shoe cabinet with an oak top takes its place, with the round mirror beside it.'],
      ['Light','The flush round ceiling lights stay. Added: lamp at the record corner, picture light, string lights, candles.'],
      ['Kitchen','Deep muted sage fronts, counter and sink unchanged and cleared, bin gone, light strip, runner.'],
      ['Bedrooms','Bedroom 1 becomes a study with two desks, and the drying rack moves in there, out of the living room. In bedroom 2 the bed turns 90° to face the TV, the bike goes, and a reading nook replaces the desk.']]},
  b:{name:'B', title:'B · Light and open', sub:'The same bones with the lightest furniture: nesting tables and a coffee cart.', table:['Open the dining table for four','Close it to a console'], pal:['#1F5A41','#8fbd9b','#9fc4d6','#C99A5B','#fbfaf6'],
     list:[
      ['Dining','The drop-leaf table, as in option A.'],
      ['Coffee table','Two round nesting tables, easy to push aside, and one light blue pouf.'],
      ['Record corner','As in option A. Here the coffee moves onto a cart in the kitchen, by the window.'],
      ['TV wall','A white 1 × 4 cube tower, 42 cm wide, stands against the side of the fridge and hides it from the sofa. Next to it the TV stands on a white bench with an oak top, 130 cm, which ends exactly at the bathroom door frame.'],
      ['Entrance','A bench with shoe baskets and a hook rail replaces the wardrobe.'],
      ['Rug','Cream with light blue stripes, 160 × 230.'],
      ['Kitchen and bedrooms','Same as option A.']]},
  c:{name:'C', title:'C · Keep what works', sub:'The least to buy: your sofa and oak coffee table stay, everything around them gets calmer.', table:['Open the dining table for four','Close it to a console'], pal:['#1F5A41','#8fbd9b','#9fc4d6','#C99A5B','#fbfaf6'],
     list:[
      ['Dining','The drop-leaf table replaces the white dining table, as in option A.'],
      ['Coffee table','Your oak and black-steel table stays, on a jute rug, with a linen pouf.'],
      ['Record corner','As in option A, with the espresso machine on the kitchen counter.'],
      ['TV wall','Your white TV bench and the TV stay exactly as they are.'],
      ['Entrance','A bench with shoe baskets and a hook rail replaces the wardrobe.'],
      ['Kitchen and bedrooms','Same as option A.']]},
  d:{name:'D', like:'a', title:'D · Sage wall', sub:'One painted wall changes the room: the sofa wall in soft sage, everything else white and oak.', table:['Open the dining table for four','Close it to a console'], pal:['#1F5A41','#a9c4ad','#C99A5B','#fbfaf6','#9fc4d6'],
     list:[
      ['Walls','The sofa wall is painted soft sage from the record corner to the front door. The oak frames and the dark green sofa sit on it tone on tone.'],
      ['Coffee table','A round oak pedestal table, 80 cm, with a linen pouf on each side. Round is easier to walk past in a 3.1 m room.'],
      ['TV wall','White 1 × 4 cube tower against the fridge side, white TV bench with an oak top.'],
      ['Rug and entrance','Jute rug 160 × 230. Slim shoe cabinet instead of the wardrobe.'],
      ['Everything else','Record corner, drop-leaf dining table, kitchen and bedrooms as in option A.']]},
  e:{name:'E', like:'a', title:'E · Panelled', sub:'The most country of the six: white panelling to waist height, light blue above it.', table:['Open the dining table for four','Close it to a console'], pal:['#1F5A41','#cfe0e8','#fbfaf6','#C99A5B','#8fbd9b'],
     list:[
      ['Walls','White tongue-and-groove panelling up to 1.1 m along the sofa wall, with a cap rail, and light blue paint above it.'],
      ['Coffee table','A wooden storage chest, 100 × 50. Blankets and board games go inside.'],
      ['TV wall','The white 4 × 2 cube shelf lying down, TV on top, in front of the fridge side.'],
      ['Rug and entrance','Cream rug with light blue stripes. Bench with baskets and a hook rail instead of the wardrobe.'],
      ['Everything else','Record corner, drop-leaf dining table, kitchen and bedrooms as in option A.']]},
  f:{name:'F', like:'a', title:'F · Record wall', sub:'The record corner becomes the feature: a sage panel of wall with three oak shelves of records above the console.', table:['Open the dining table for four','Close it to a console'], pal:['#1F5A41','#a9c4ad','#C99A5B','#fbfaf6','#9fc4d6'],
     list:[
      ['Record corner','The wall behind it is painted sage, floor to ceiling, 1.65 m wide. Three oak shelves above the console hold the records, facing out.'],
      ['Coffee table','Two round nesting tables and one linen pouf.'],
      ['TV wall','White 1 × 4 cube tower against the fridge side, white TV bench with an oak top.'],
      ['Rug and entrance','Natural wool rug 160 × 230. Slim shoe cabinet instead of the wardrobe.'],
      ['Everything else','Drop-leaf dining table, kitchen and bedrooms as in option A.']]}
};

/* ---------- state and layout animation ---------- */
const S=A.state={design:'a',table:0,lift:0,pj:false,labels:false,dims:false,edit:false};
A.tableT=0; A.halfT=0; A.liftT=0; A.layoutFns=[];
let anim=null;
const USER={};
function ukey(){return S.design+S.table+(S.pj?'p':'');}
function targets(){
  const out={}, put=function(o){for(const k in o) out[k]=o[k];};
  put(LAY[S.design]); if(S.table===1&&S.design!=='n') put(OPEN); if(S.table===2&&S.design!=='n') put(OPEN2); if(S.pj) put(PJ[S.design]);
  const u=USER[ukey()]; if(u) for(const k in u) if(out[k]) out[k]=u[k];          // furniture you moved yourself
  return out;
}
A.layout=function(instant){
  const t=targets();
  for(const id in P){const p=P[id], v=t[id];
    p.from=p.cur.slice(); p.to=v?[v[0],v[1],v[2],1]:[p.cur[0],p.cur[1],p.cur[2],0];
    if(p.from[3]<0.02&&v){p.from[0]=v[0]; p.from[1]=v[1]; p.from[2]=v[2];}
  }
  for(let i=0;i<A.onlys.length;i++){const o=A.onlys[i], sp=o.userData.only;          // D, E and F share everything marked for A
    o.visible=(sp.indexOf(S.design)>=0||sp.indexOf(DESIGNS[S.design].like||'-')>=0)&&!(o.userData.not&&o.userData.not.indexOf(S.design)>=0);}
  anim={t0:performance.now(),dur:(instant||A.reduce)?1:800,tf:A.tableT,tt:S.table===1?1:0,hf:A.halfT,ht:S.table===2?1:0,lf:A.liftT,lt:(S.lift&&S.design==='a')?1:0};
  resolveSeats();
  if(instant) stepLayout();
};
function stepLayout(){
  if(anim){
    const k=Math.min(1,(performance.now()-anim.t0)/anim.dur), e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
    for(const id in P){const p=P[id]; for(let i=0;i<4;i++) p.cur[i]=p.from[i]+(p.to[i]-p.from[i])*e;}
    A.tableT=anim.tf+(anim.tt-anim.tf)*e; A.halfT=anim.hf+(anim.ht-anim.hf)*e;
    for(let i=0;i<tableFns.length;i++) tableFns[i](A.tableT);
    A.liftT=anim.lf+(anim.lt-anim.lf)*e; for(let i=0;i<liftFns.length;i++) liftFns[i](A.liftT);
    for(const id in P){const p=P[id];
      p.g.position.set(p.cur[0],0,p.cur[1]); p.g.rotation.y=p.cur[2]; A.touch(3);
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
  A.seats.forEach(function(s){if(!s.only||s.only.indexOf(S.design)>=0||s.only.indexOf(DESIGNS[S.design].like||'-')>=0) live.push(s);});
  for(const id in P){const p=P[id]; if(!p.seats||p.to[3]<1) continue;
    const x=p.to[0], z=p.to[1], f=p.to[2], c=Math.cos(f), sn=Math.sin(f);
    p.seats.forEach(function(s){
      s.x=x+s.lx*c+s.lz*sn; s.z=z-s.lx*sn+s.lz*c; s.room='living';
      s.h=s.face?Math.atan2(1.9-s.x,SZ-s.z):f+R/2+(s.dh||0);
      live.push(s);
    });
  }
}
A.liveSeats=function(){return live;};
A.setDesign=function(k,instant){
  S.design=k; S.table=0; S.lift=0; S.pj=false; if(A.clearPick) A.clearPick();
  A.layout(instant); renderPanel();
  if(A.onDesign) A.onDesign();
};
A.setTable=function(on){S.table=on===2?2:on?1:0; A.layout(); renderPanel();};      // 0 closed, 1 for four, 2 for two
A.setLift=function(on){S.lift=on?1:0; A.layout(); renderPanel();};

/* ---------- labels and dimension lines ---------- */
const fixedLabels=[
 {label:'Kitchen', pos:new THREE.Vector3(W+1.5,2.5,2.05)},
 {label:'Entrance', pos:new THREE.Vector3(EX,2.35,L)},
 {label:'Bedroom 1', alt:'Bedroom 1 · study', pos:new THREE.Vector3(1.2,1.5,-2.3)},
 {label:'Bedroom 2', alt:'Bedroom 2 · reading nook', pos:new THREE.Vector3(3.7,1.5,-1.4)},
 {label:'Bathroom and shower', pos:new THREE.Vector3(4.7,1.6,3.7)},
 {label:'Guest toilet', pos:new THREE.Vector3(3.2,1.6,L-0.5)},
 {label:'Stairs', pos:new THREE.Vector3(6.6,1.9,L+1.6)},
 {label:'Lobby', pos:new THREE.Vector3(-3.2,1.6,L+3.8)},
 {label:'Bridge to the street', pos:new THREE.Vector3(-0.6,1.5,L+7.3)},
 {label:'Second bridge', pos:new THREE.Vector3(3.6,1.5,L+7.3)},
 {label:'Square and café', pos:new THREE.Vector3(-3.5,1.6,L+19)},
 {label:'Haroe St', pos:new THREE.Vector3(5,-0.6,L+28.5)},
 {label:'Yard, one floor down', pos:new THREE.Vector3(9,-1.6,-1)},
 {label:'≈ '+L.toFixed(1)+' m', pos:new THREE.Vector3(-0.3,0.05,L/2), dim:true},
 {label:'≈ '+W.toFixed(1)+' m', pos:new THREE.Vector3(W/2,0.05,2.3), dim:true},
 {label:'ceiling ≈ '+H.toFixed(2)+' m', pos:new THREE.Vector3(0.05,H-0.2,L-1.2), dim:true},
 {label:'kitchen ≈ '+(KX-W).toFixed(1)+' × '+KZ.toFixed(1)+' m', pos:new THREE.Vector3((W+KX)/2,0.05,0.95), dim:true},
 {label:'tiles 60 × 60', pos:new THREE.Vector3(2.2,0.05,2.4), dim:true},
 {label:'doors 78 × 205', pos:new THREE.Vector3((D.door2[0]+D.door2[1])/2,0.1,0.45), dim:true}
];
for(const id in P){const p=P[id]; if(p.label) p.el=A.tag(p.label,p.isNew?'new':'');}
fixedLabels.forEach(function(f){f.el=A.tag(f.label,f.dim?'dim':'');});
const dims=new THREE.Group(); scene.add(dims); dims.visible=false;
(function(){const m=new THREE.LineBasicMaterial({color:0x1F5A41});
  function ln(a,b){dims.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(a[0],a[1],a[2]),new THREE.Vector3(b[0],b[1],b[2])]),m));}
  ln([-0.3,0.02,0],[-0.3,0.02,L]); ln([-0.4,0.02,0],[-0.2,0.02,0]); ln([-0.4,0.02,L],[-0.2,0.02,L]);
  ln([0,0.02,2.3],[W,0.02,2.3]);
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
  const d=DESIGNS[S.design], now=S.design==='n';
  $('d_now').setAttribute('aria-pressed',now); $('d_new').setAttribute('aria-pressed',!now); $('segABC').hidden=now;
  KEYS.forEach(function(k){$('d_'+k).setAttribute('aria-pressed',k===S.design);});
  $('dTitle').textContent=d.title; $('dSub').textContent=d.sub;
  $('dPal').innerHTML=d.pal.map(function(c){return '<i style="background:'+c+'"></i>';}).join('');
  $('list').innerHTML=d.list.map(function(r){return '<li><b>'+r[0]+'</b><span>'+r[1]+'</span></li>';}).join('');
  const bt=$('bTable'); bt.hidden=!d.table; bt.textContent=S.table===1?'Close the dining table':'Open the table for four';
  $('bTable2').hidden=!d.table; $('bTable2').textContent=S.table===2?'Close the dining table':'Open the table for two';
  $('bLift').hidden=S.design!=='a'; $('bLift').textContent=S.lift?'Lower the coffee table':'Raise the coffee table';
  fixedLabels.forEach(function(f){if(f.alt) f.el.textContent=S.design==='n'?f.label:f.alt;});
  $('editNote').textContent=S.edit?'Editing: drag a piece to move it. Tap it for the rotate button.':'Tap a piece of furniture to see where to get it.';
  if(A.onPanel) A.onPanel();
}
A.renderPanel=renderPanel;
let lastNew='a';
const KEYS=['a','b','c','d','e','f'];
KEYS.forEach(function(k){$('d_'+k).onclick=function(){lastNew=k; A.setDesign(k);};});
$('d_now').onclick=function(){A.setDesign('n');}; $('d_new').onclick=function(){A.setDesign(lastNew);};
$('bTable').onclick=function(){A.setTable(S.table===1?0:1);}; $('bTable2').onclick=function(){A.setTable(S.table===2?0:2);}; $('bLift').onclick=function(){A.setLift(!S.lift);};
function fitDist(){const a=A.stage.clientWidth/A.stage.clientHeight; return 19*Math.max(1,1.0/Math.max(a,0.5));}
A.viewPos=function(v){
  const d=fitDist(), t=A.home;
  if(v==='top') return new THREE.Vector3(t.x,d*1.02,t.z+0.01);
  return new THREE.Vector3(t.x+d*0.5,d*0.62,t.z+d*0.6);
};
A.setView=function(v,instant){
  $('b3d').setAttribute('aria-pressed',v==='3d'); $('bTop').setAttribute('aria-pressed',v==='top'); $('bStreet').setAttribute('aria-pressed',v==='street');
  if(v==='street') A.fly(A.streetView[0],A.streetView[1],900,instant); else A.fly(A.viewPos(v),A.home,700,instant);
};
$('b3d').onclick=function(){A.setView('3d');}; $('bTop').onclick=function(){A.setView('top');}; $('bStreet').onclick=function(){A.setView('street');};
A.setLabels=function(on){S.labels=on; $('cLabels').checked=on; $('bLabels').setAttribute('aria-pressed',on); $('bLabels').textContent=on?'Hide labels':'Show labels';};
$('cLabels').onchange=function(e){A.setLabels(e.target.checked);}; $('bLabels').onclick=function(){A.setLabels(!S.labels);};
$('bMenu').onclick=function(){const off=document.body.classList.toggle('nomenu'); $('bMenu').textContent=off?'Show menu':'Hide menu'; $('bMenu').setAttribute('aria-pressed',!off);};
$('cDims').onchange=function(e){S.dims=e.target.checked; dims.visible=S.dims;};
$('cCut').onchange=function(e){A.cut.constant=e.target.checked?1.25:100;};
$('note').textContent='Scaled from photos and a video, not measured. The living room width (3.1 m) is the least certain number; one tape measurement from the sofa wall to the TV wall would settle it. New furniture is drawn at typical catalogue sizes.';
A.renderer.domElement.addEventListener('pointerdown',function(){A.stopFly(); $('hint').style.opacity=0;});

/* ---------- tapping furniture: a shopping link normally, drag-to-move in Edit mode ---------- */
const NAMES={table:'Coffee table',chairA:'Chair',chairB:'Chair',rack1:'Drying rack',rack2:'Drying rack',sofa:'Sofa',tvOld:'TV bench',station:'Coffee station',dining:'Dining table',
  fc1:'Folding chair',fc2:'Folding chair',gc1:'Chair',gc2:'Chair',gc3:'Chair',gc4:'Chair',poufA2:'Pouf',poufB2:'Pouf',flamp:'Floor lamp',arc:'Arc lamp'};
for(const id in P){const p=P[id]; p.g.userData.piece=id; if(p.shop) A.shop(p.g,p.shop[0],p.shop[1],p.shop[2],p.shop[3]);}
const ray=new THREE.Raycaster(), ndc=new THREE.Vector2(), floor=new THREE.Plane(new THREE.Vector3(0,1,0),0), hit=new THREE.Vector3();
let drag=null, sel=null, tap=null;
function aim(e){const r=A.renderer.domElement.getBoundingClientRect(); ndc.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1); ray.setFromCamera(ndc,A.camera);}
function shown(o){for(;o;o=o.parent) if(!o.visible) return false; return true;}
function nearestHit(list){
  let best=null, bd=1e9;
  for(let i=0;i<list.length;i++){const o=list[i]; if(!shown(o)) continue;
    const hs=ray.intersectObject(o,true);
    for(let j=0;j<hs.length;j++){if(!shown(hs[j].object)||hs[j].object.userData.nc) continue; if(hs[j].distance<bd){bd=hs[j].distance; best=o;} break;}
  }
  return best;
}
function pickPiece(){const l=[]; for(const id in P){if(P[id].cur[3]>0.9&&id.indexOf('rug')!==0) l.push(P[id].g);} const o=nearestHit(l); return o?P[o.userData.piece]:null;}
function clampPos(p){
  let x=Math.min(KX-0.15,Math.max(0.1,p.cur[0])), z=Math.min(L-0.1,Math.max(0.1,p.cur[1]));
  if(x>W-0.05&&z>KZ-0.1){if(p.from[0]>W-0.05) z=KZ-0.1; else x=W-0.05;}          // behind the TV wall is the bathroom
  if(z>D.ZW-0.05&&x>D.BLK-0.05) x=D.BLK-0.05;
  p.cur[0]=x; p.cur[1]=z;
}
function place(p){A.touch(3); p.to=[p.cur[0],p.cur[1],p.cur[2],1]; p.g.position.set(p.cur[0],0,p.cur[1]); p.g.rotation.y=p.cur[2];}
function commit(p){
  const k=ukey(); (USER[k]||(USER[k]={}))[p.id]=[p.cur[0],p.cur[1],p.cur[2]];
  resolveSeats(); for(let i=0;i<A.layoutFns.length;i++) A.layoutFns[i]();
  $('bResetMoves').hidden=false;
}
function select(p){sel=p; $('pieceBar').hidden=!p; if(p) $('pieceName').textContent=p.label||NAMES[p.id]||'Item';}
function shopCard(o){
  const c=$('shopCard'); if(!o){c.hidden=true; return;}
  const s=o.userData.shop, q=encodeURIComponent(s.q);
  $('shopName').textContent=s.name; $('shopNote').textContent=s.note;
  const a=$('shopLink'); a.href=s.site==='ikea'?'https://www.ikea.com/il/he/search/?q='+q:'https://www.google.com/search?tbm=shop&q='+q;
  a.textContent=s.site==='ikea'?'Search IKEA Israel':'Search shops';
  c.hidden=false;
}
A.clearPick=function(){select(null); shopCard(null);};
$('shopClose').onclick=function(){shopCard(null);};
A.setEdit=function(on){
  S.edit=on; $('bEdit').setAttribute('aria-pressed',on); $('bEdit').textContent=on?'Done editing':'Edit layout';
  document.body.classList.toggle('editing',on); A.clearPick(); renderPanel();
};
$('bEdit').onclick=function(){A.setEdit(!S.edit);};
A.stage.addEventListener('pointerdown',function(e){
  tap=null;
  if(e.target!==A.renderer.domElement||A.simsOn||anim||e.button) return;
  if(drag){drag=null; A.controls.enabled=true; return;}                           // second finger: this is a pinch, not a move
  tap={x:e.clientX,y:e.clientY,t:performance.now()};
  if(!S.edit) return;
  aim(e); const p=pickPiece(); if(!p){select(null); return;}
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
  if(drag&&e.pointerId===drag.id){
    const d=drag; drag=null; A.controls.enabled=true;
    if(d.moved) commit(d.p); select(d.p); return;
  }
  if(tap&&!S.edit&&!A.simsOn&&e.target===A.renderer.domElement&&Math.hypot(e.clientX-tap.x,e.clientY-tap.y)<7&&performance.now()-tap.t<500){
    aim(e); shopCard(nearestHit(A.shops));
  }
  tap=null;
}
window.addEventListener('pointerup',endDrag); window.addEventListener('pointercancel',function(e){if(drag&&e.pointerId===drag.id){drag=null; A.controls.enabled=true;} tap=null;});
$('bRotate').onclick=function(){if(!sel) return; sel.cur[2]+=R/4; place(sel); commit(sel);};
$('bPieceDone').onclick=function(){select(null);};
$('bResetMoves').onclick=function(){for(const k in USER) delete USER[k]; $('bResetMoves').hidden=true; select(null); A.layout();};
})();
