/* Haroe 10 — movable furniture, the design options and the Design tab */
(function(){
'use strict';
const A=window.APP, D=A.D, K=A.kit, W=D.W, L=D.L, H=D.H, KX=D.KX, KZ=D.KZ, CAT=A.CAT;
const box=A.box, cyl=A.cyl, sph=A.sph, M=A.M, G=A.G, scene=A.scene, canvasTex=A.canvasTex;
// modern rustic palette: white, oak, sage green, light blue
const R=Math.PI, OAK=0xc99a5b, INK=0x3b4a44, SAGE=A.SAGE, BLUE=A.BLUE, WHITE=0xfbfaf6, LINEN=0xefe7d6, RATTAN=0xd9c9a8, CREAM=0xf3ebdc;
const pc=(D.painting[0]+D.painting[1])/2, DC=(D.door1[1]+D.door2[0])/2, EX=(D.entrance[0]+D.entrance[1])/2;
const $=function(id){return document.getElementById(id);};

const P=A.pieces={};
const SZ=3.3;                 // the sofa is centred here, between the top zone and the front door
function piece(id,opt,build){const g=G(); g.userData.piece=id; P[id]=Object.assign({id:id,g:g,cur:[0,0,0,0],to:[0,0,0,0],h:1,y0:0,y:0},opt||{}); if(build) build(g); return P[id];}
/* a piece from the catalog (app/catalog.js). It is built the first time it is shown, and rebuilt when a design or you swap or recolour it. */
function slot(id,type,opt){return piece(id,Object.assign({type0:type,col0:0,cfg0:null,isNew:true},opt||{}),null);}
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

/* ---------- the proposals' pieces. Each comes from the catalog, so it can be swapped for another piece or recoloured. ---------- */
slot('kivik','kivik3',{seatPrefix:'sofa',h:1.15});
slot('rugA','rugWool'); slot('rugB','rugStripe'); slot('rugC','rugJute');
[['poufA',1],['poufB',2]].forEach(function(q){[1,2].forEach(function(i){slot(q[0]+i,'pouf',{col0:q[1],seatLabel:'Pouf '+i,label:i===1?undefined:false});});});
slot('armA','strandmon',{col0:1});
slot('nest','nest',{cfg0:{deco:1}}); slot('round','roundOak',{cfg0:{deco:1}}); slot('trunk','trunk',{cfg0:{deco:1}});
/* TV wall. Only 1.4 m is free between the fridge and the bathroom door, so each option is a cube shelf that hides the side of the fridge plus a 1.3 m bench */
slot('towerA','kallax2x4',{cfg0:{rows:['pb','xb','by','sx'],top:'basket2'}});
slot('towerB','kallax1x4',{cfg0:{rows:['p','b','x','b'],top:'basket'}});
slot('benchA','bestaFloat',{cfg0:{deco:1}}); slot('benchB','havsta',{cfg0:{deco:1}});
slot('kbench','kallaxTV',{cfg0:{rows:['bxpb','ybsx'],deco:1}});         // there is only 0.8 m of wall, so the TV stays on a stand in front of the fridge side
/* what replaces the coffee corner */
slot('ladder','jonaxel',{cfg0:{deco:1}}); slot('music','recordConsole'); slot('bench','perjohan',{cfg0:{deco:1},seatPrefix:'bench'});
slot('cart','raskog',{room:'kitchen',cfg0:{coffee:1}});
/* what replaces the wardrobe at the entrance (built facing +x, back to the wall) */
slot('hallBench','tjusig',{cfg0:{deco:1},seatPrefix:'hall'}); slot('shoeCab','shoeCab',{cfg0:{deco:1}});
/* prints over the sofa and over the record corner, and option F's record shelves */
slot('sofaFrames','frameTrio',{y0:1.37,cfg0:{n:3,w:0.62,h:0.82,gap:0.93,seeds:[0,1,3]}});
slot('recFrames','frameTrio',{y0:1.38,cfg0:{n:2,w:0.48,h:0.6,gap:0.6,seeds:[2,7]}});
slot('recShelves','oakShelves3',{y0:1.185,cfg0:{deco:1}});
/* chairs round the drop-leaf table */
for(let i=1;i<=4;i++) slot('gc'+i,'ingolf',{col0:2,seatLabel:'Table chair '+i,label:false});
for(let i=1;i<=2;i++) slot('fc'+i,'terje',{col0:2,seatLabel:'Table chair '+i,label:false});
/* places the newer designs fill, each with whatever the design puts there */
['rug','ctable','tvUnit','corner','hall','hall2','pouf1','pouf2','lamp1','pendant1','plant1','plant2','hang1','hang2'].forEach(function(id){
  slot(id,{rug:'stoense',ctable:'borgeby',tvUnit:'eketTV',corner:'eketRecord',hall:'eketHall',hall2:'hooks',pouf1:'pouf',pouf2:'pouf',lamp1:'floorLamp',pendant1:'regolit',plant1:'monstera',plant2:'fiddle',hang1:'hangingPlant',hang2:'hangingPlant'}[id],
    {label:/pouf2|hang2|plant2/.test(id)?false:undefined});});


/* ---------- pajama party mattresses (you can step over them) ---------- */
function mattress(id,label,col){
  piece(id,{label:label,h:0.5,seats:[{id:id,label:label,lx:0,lz:0,y:0.17,type:'lie',dh:-R/2}]},function(g){
    g.userData.nc=true;
    A.rbox(0.8,0.15,1.9,0xf3efe6,0,0.075,0,g); A.rbox(0.78,0.05,1.15,col,0,0.165,0.34,g); A.rbox(0.5,0.1,0.32,0xffffff,0,0.19,-0.72,g);
  });
}
mattress('mat1','Mattress by the sofa',0xcfe3ec); mattress('mat2','Mattress by the bedroom doors',0xbfd8c6);

/* ---------- fixed decoration for the proposals ---------- */
const dn=G(null,'abc');
K.stringLights(dn,0,2.42,SZ-1.7,SZ+1.7,24);
box(0.5,0.025,0.05,A.lampMat('L:living',0xb08d4a,0xffe2b0,0.8),pc,2.34,0.07,dn); box(0.02,0.02,0.06,0xb08d4a,pc,2.34,0.04,dn);   // picture light
A.pool('L:living',0xffd9a0,pc,1.8,0.03,0.9,dn,0.32,0);
// entrance: round gold mirror on the side of the toilet block, doormat
A.torus(0.26,0.022,0xd9aa12,D.BLK-0.03,1.6,5.68,dn).rotation.y=R/2; cyl(0.25,0.008,0xcfdadd,D.BLK-0.012,1.6,5.68,dn,40).rotation.z=R/2;
box(0.75,0.014,0.5,0xa89878,EX,0.007,L-0.3,dn).castShadow=false;      // wholly inside, clear of the door and of the mat in the lobby
});
/* ---------- wall treatments for options D, E and F (the sofa wall: u runs from the bedroom end to the front door) ---------- */
A.only(A.rect('left',1.55,L,0.08,H,0xa9c4ad,0.003),'d');                                  // D: the whole sofa wall in sage
const bead=canvasTex(64,64,function(g){g.fillStyle='#fbfaf6'; g.fillRect(0,0,64,64); g.fillStyle='#dedbd2'; g.fillRect(0,0,3,64); g.fillStyle='#ffffff'; g.fillRect(3,0,2,64);});
bead.wrapS=bead.wrapT=THREE.RepeatWrapping; bead.repeat.set(L/0.09,1);
K.onlyAll([A.rect('left',0,L,0.08,1.1,A.MT(bead,'living'),0.004),A.rect('left',0,L,1.1,1.15,0xfbfaf6,0.006),A.rect('left',0,L,1.15,H,0xcfe0e8,0.003)],'e');   // E: white panelling, light blue above
A.only(A.rect('left',0.1,1.75,0.08,H,0xa9c4ad,0.003),'f');                                // F: sage behind the record corner, with shelves of records

/* ---------- layouts: x, z, rotation, and for things on a wall its height. A piece that is not listed is hidden. ---------- */
const TVZ=2.9, HALL=[1.6,L-0.225,R/2], CAB=[1.6,L-0.135,R/2], KS=[0.485,SZ,0];      // a few mm clear of the entrance wall, which is also the lobby's wall
const COMMON={kivik:KS, music:[0.22,0.9,0], gate:[DC,0.17,0], rack1:[0.45,-2.0,R/2], sofaFrames:[0.0155,SZ,0], recFrames:[0.0155,0.9,0]};   // the drying rack lives in the study; every proposal keeps the record corner and the drop-leaf table
function lay(o){for(const k in COMMON) if(!(k in o)) o[k]=COMMON[k]; for(const k in o) if(o[k]===null) delete o[k]; return o;}
const LAY={
  n:{sofa:[0.60,SZ,0], table:[1.8,SZ+0.05,0], tvOld:[W-0.24,TVZ,R], station:[0.30,0.72,0],
     dining:[pc,0.48,0], chairA:[pc-0.92,0.50,0], chairB:[pc+0.92,0.50,R], rack1:[1.2,1.38,0], rack2:[2.55,1.5,0]},
  a:lay({rugA:[1.6,SZ,0], lift:[1.75,SZ,0], kbench:[W-0.2,TVZ,R], poufA1:[1.75,SZ-1.03,0], poufA2:[1.75,SZ+1.03,0], shoeCab:CAB}),
  b:lay({rugB:[1.6,SZ,0], nest:[1.8,SZ,0], towerB:[W-0.195,2.3,R], benchB:[W-0.205,3.18,R], cart:[KX-0.24,1.8,R], poufB1:[1.75,SZ+1.0,0], hallBench:HALL}),
  c:lay({rugC:[1.6,SZ,0], table:[1.75,SZ,0], tvOld:[W-0.24,TVZ,R], poufA1:[1.75,SZ+1.03,0], hallBench:HALL}),
  d:lay({rugC:[1.6,SZ,0], round:[1.8,SZ,0], towerB:[W-0.195,2.3,R], benchB:[W-0.205,3.18,R], poufA1:[1.75,SZ-1.0,0], poufA2:[1.75,SZ+1.0,0], shoeCab:CAB}),
  e:lay({rugB:[1.6,SZ,0], trunk:[1.8,SZ,0], kbench:[W-0.2,TVZ,R], poufB1:[1.75,SZ+1.05,0], hallBench:HALL}),
  f:lay({rugA:[1.6,SZ,0], nest:[1.8,SZ,0], towerB:[W-0.195,2.3,R], benchB:[W-0.205,3.18,R], poufA1:[1.75,SZ+1.05,0], shoeCab:CAB, recFrames:null, recShelves:[0.12,0.9,0]}),
  /* the newer ideas */
  g:lay({rug:[1.6,SZ,0], ctable:[1.75,SZ,0], tvUnit:[W-0.19,TVZ,R], corner:[0.19,0.75,0], hall:[1.6,L-0.19,R/2], pouf1:[1.75,SZ+1.0,0], lamp1:[0.25,4.68,0], plant1:[0.3,1.72,0], music:null, recFrames:null}),
  h:lay({kivik:[0.485,SZ+0.15,0], sofaFrames:[0.0155,SZ+0.15,0], corner:[0.162,0.9,0], ctable:[1.75,SZ+0.15,0], rug:[1.6,SZ+0.15,0], tvUnit:[W-0.247,TVZ,R], plant1:[0.32,4.86,0], lamp1:[0.25,2.0,0], pouf1:[1.75,SZ+1.15,0], hall:CAB, music:null, recFrames:null}),
  i:lay({kivik:[0.485,SZ+0.2,0], sofaFrames:[0.0155,SZ+0.2,0,1.05], rug:[1.6,SZ+0.2,0], ctable:[1.75,SZ+0.2,0], pendant1:[1.75,SZ+0.2,0], tvUnit:[W-0.222,TVZ+0.1,R], corner:[0.162,0.95,0], lamp1:[0.25,4.85,0], plant1:[0.27,1.98,0], hall:HALL, music:null, recFrames:null}),
  j:lay({kivik:[0.485,SZ+0.1,0], sofaFrames:[0.0155,SZ+0.25,0], rug:[1.7,SZ+0.15,0], ctable:[1.85,3.65,0], pendant1:[1.85,3.65,0], tvUnit:[W-0.187,TVZ,R], corner:[0.19,0.75,0], lamp1:[0.25,4.98,0], hang1:[0.45,1.55,0], hall:[1.6,L-0.162,R/2], music:null, recFrames:null}),
  k:lay({rug:[1.6,SZ,0], ctable:[1.75,SZ,0], tvUnit:[W-0.19,TVZ,R], corner:[0.207,0.9,0], pouf1:[1.75,SZ+1.0,0], pouf2:[1.75,SZ-1.0,0], lamp1:[0.25,4.68,0], plant1:[0.32,1.93,0], hall:[1.6,L-0.152,R/2], hall2:[1.6,L-0.052,R/2,1.65], music:null, recFrames:null}),
  l:lay({rug:[1.6,SZ,0], ctable:[1.75,SZ,0], pendant1:[1.75,SZ,0], tvUnit:[W-0.207,TVZ,R], corner:[0.162,0.9,0], plant1:[0.35,1.75,0], plant2:[0.3,4.74,0], hang1:[0.7,1.9,0], hang2:[2.85,2.0,0], pouf1:[1.75,SZ+1.0,0], hall:HALL, music:null, recFrames:null})
};
/* what each design puts in each catalog piece: the piece, its colour by IKEA's name, and its settings */
function sp(type,colour,cfg){const d=CAT[type]; let ci=0; if(colour!=null){ci=d.col.findIndex(function(c){return c.n===colour;}); if(ci<0){console.warn('No colour',colour,'for',type); ci=0;}} return [type,ci,cfg||null];}
const SPEC=A.SPEC={
  a:{kivik:sp('kivik3','Kelinge grey-turquoise')},
  b:{kivik:sp('kivik3','Tresund light beige')},
  c:{kivik:sp('kivik3','Tibbleby beige/grey')},
  d:{kivik:sp('kivik3','Tresund light beige')},
  e:{kivik:sp('kivik3','Kelinge grey-turquoise')},
  f:{kivik:sp('kivik3','Tresund anthracite')},
  g:{kivik:sp('kivik3','Tresund light beige'), rug:sp('stoense','Off-white'), ctable:sp('borgeby','Birch veneer'), pouf1:sp('pouf','Light blue'), lamp1:sp('floorLamp','Brass, white shade'), plant1:sp('monstera','White'),
     sofaFrames:sp('frameTrio','White',{n:3,w:0.62,h:0.82,gap:0.93,seeds:[0,1,3]})},
  h:{kivik:sp('kivik3','Tibbleby beige/grey'), corner:sp('ourOak','Golden oak, as it is',{deco:1}), ctable:sp('listerby','Oak veneer'), rug:sp('rugJute'), tvUnit:sp('hemnesTV','Light brown'),
     plant1:sp('fiddle','Terracotta'), lamp1:sp('arcLamp','Brass'), pouf1:sp('pouf','Beige'), hall:sp('shoeCab','White stain',{deco:1})},
  i:{kivik:sp('kivik3','Tresund light beige'), sofaFrames:sp('frameL','Oak',{seed:5}), rug:sp('adum','Off-white'), ctable:sp('listerby','White stained oak veneer'), pendant1:sp('regolit'),
     tvUnit:sp('bestaTV','White stained oak effect'), corner:sp('ivarSideboard','Pine, painted white (DIY)',{tt:1}), lamp1:sp('vidja'), plant1:sp('snake','Beige'), hall:sp('tjusig','Oak, white',{deco:1})},
  j:{kivik:sp('kivikChR','Tresund anthracite'), sofaFrames:sp('frameTrio','Black',{n:3,w:0.5,h:0.7,gap:0.7,seeds:[5,6,9]}), rug:sp('rugKilim'), ctable:sp('roundOak','Walnut veneer'), pendant1:sp('hektarP','Dark grey'),
     tvUnit:sp('lackTV','Black-brown'), corner:sp('eketRecord',null,{base:'legs',tt:true,mods:[{t:'Q',x:0,y:0,c:4},{t:'o',x:4,y:0,c:7},{t:'d',x:4,y:2,c:4}]}),
     lamp1:sp('hektar','Dark grey'), hang1:sp('hangingPlant','Black'), hall:sp('hemnesShoe','Black-brown')},
  k:{kivik:sp('kivik3','Kelinge grey-turquoise'), sofaFrames:sp('frameTrio','White',{n:3,w:0.62,h:0.82,gap:0.93,seeds:[4,1,8]}), rug:sp('rugStripe'), ctable:sp('lackCT','White'),
     corner:sp('kallax4x2','White',{rows:['bxbx','xbxb'],tt:1}), pouf1:sp('pouf','Light blue'), pouf2:sp('pouf','Linen'), lamp1:sp('tagarp','White'), plant1:sp('palm','White'),
     hall:sp('bissa','White'), hall2:sp('hooks','White')},
  l:{kivik:sp('kivik3','Tibbleby beige/grey'), rug:sp('rugJute'), ctable:sp('borgeby','Birch veneer'), pendant1:sp('misterhult'), tvUnit:sp('kallaxLegs','White'), corner:sp('ivar','Pine',{deco:1}),
     plant1:sp('monstera','Terracotta'), plant2:sp('fiddle','Rattan basket'), hang1:sp('hangingPlant','Terracotta',{seed:44}), hang2:sp('hangingPlant','White',{seed:47}), pouf1:sp('pouf','Sage'), hall:sp('tjusig','Oak, white',{deco:1})}
};
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
'ghijkl'.split('').forEach(function(k){PJ[k]={mat1:[k==='j'?2.15:1.95,SZ+(k==='j'?0.35:0),0], mat2:[2.0,1.45,R/2], ctable:null, pouf1:null, pouf2:null, pendant1:null};});

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
  a:{name:'A', title:'A · Lift-top', sub:'Modern rustic: white, oak, sage and light blue. The coffee table also rises to eating height.', table:['Open the dining table for four','Close it to a console'], pal:['#5d7c79','#8fbd9b','#9fc4d6','#C99A5B','#fbfaf6'],
     list:[
      ['Sofa','IKEA KIVIK 3-seat, 228 × 95 cm, in Kelinge grey-turquoise. It is a metre shorter than the sofa you have, which leaves room for a lamp and a plant at its ends.'],
      ['Dining','The drop-leaf table: a 26 cm console with drawers under the bus painting. With one leaf up it stays against the wall and seats two. With both up it moves out and seats four at 75 × 150, clear of both bedroom doors.'],
      ['Coffee table','A 120 × 60 lift-top in oak and white, with a linen pouf at each end. Raised, it is a second eating or laptop spot at the sofa.'],
      ['Record corner','Where the coffee station was: a low white and oak sideboard with the turntable, a speaker and a lamp. The espresso machine moves to the kitchen counter.'],
      ['TV wall','About 1 m of wall between the fridge and the bathroom door, so the TV stays on a stand. A white 4 × 2 cube shelf with woven baskets lies in front of the fridge side and hides its lower half; the TV on top covers most of the rest.'],
      ['Entrance','The wardrobe goes. A slim white shoe cabinet with an oak top takes its place, with the round mirror beside it.'],
      ['Light','The flush round ceiling lights stay. Added: lamp at the record corner, picture light, string lights, candles.'],
      ['Kitchen','Deep muted sage fronts, counter and sink unchanged and cleared, bin gone, light strip, runner.'],
      ['Bedrooms','Bedroom 1 becomes a study with two desks, and the drying rack moves in there, out of the living room. In bedroom 2 the bed turns 90° to face the TV, the bike goes, and a reading nook replaces the desk.']]},
  b:{name:'B', title:'B · Light and open', sub:'The same bones with the lightest furniture: nesting tables and a coffee cart.', table:['Open the dining table for four','Close it to a console'], pal:['#d5cab4','#8fbd9b','#9fc4d6','#C99A5B','#fbfaf6'],
     list:[
      ['Sofa','KIVIK 3-seat in Tresund light beige.'],
      ['Dining','The drop-leaf table, as in option A.'],
      ['Coffee table','Two round nesting tables, easy to push aside, and one light blue pouf.'],
      ['Record corner','As in option A. Here the coffee moves onto a RÅSKOG trolley in the kitchen, by the window.'],
      ['TV wall','A white 1 × 4 cube tower, 42 cm wide, stands against the side of the fridge and hides it from the sofa. Next to it the TV stands on a white bench with an oak top, 130 cm, which ends exactly at the bathroom door frame.'],
      ['Entrance','A bench with shoe baskets and a hook rail replaces the wardrobe.'],
      ['Rug','Cream with light blue stripes, 160 × 230.'],
      ['Kitchen and bedrooms','Same as option A.']]},
  c:{name:'C', title:'C · Keep what works', sub:'The least to buy: your oak coffee table and white TV bench stay; the sofa becomes a KIVIK.', table:['Open the dining table for four','Close it to a console'], pal:['#b1a998','#8fbd9b','#9fc4d6','#C99A5B','#fbfaf6'],
     list:[
      ['Sofa','KIVIK 3-seat in Tibbleby beige/grey, a soft herringbone.'],
      ['Dining','The drop-leaf table replaces the white dining table, as in option A.'],
      ['Coffee table','Your oak and black-steel table stays, on a jute rug, with a linen pouf.'],
      ['Record corner','As in option A, with the espresso machine on the kitchen counter.'],
      ['TV wall','Your white TV bench and the TV stay exactly as they are.'],
      ['Entrance','A bench with shoe baskets and a hook rail replaces the wardrobe.'],
      ['Kitchen and bedrooms','Same as option A.']]},
  d:{name:'D', like:'a', title:'D · Sage wall', sub:'One painted wall changes the room: the sofa wall in soft sage, everything else white and oak.', table:['Open the dining table for four','Close it to a console'], pal:['#d5cab4','#a9c4ad','#C99A5B','#fbfaf6','#9fc4d6'],
     list:[
      ['Walls','The sofa wall is painted soft sage from the record corner to the front door. The oak frames and a light beige KIVIK sit on it.'],
      ['Coffee table','A round oak pedestal table, 80 cm, with a linen pouf on each side. Round is easier to walk past in a 3.1 m room.'],
      ['TV wall','White 1 × 4 cube tower against the fridge side, white TV bench with an oak top.'],
      ['Rug and entrance','Jute rug 160 × 230. Slim shoe cabinet instead of the wardrobe.'],
      ['Everything else','Record corner, drop-leaf dining table, kitchen and bedrooms as in option A.']]},
  e:{name:'E', like:'a', title:'E · Panelled', sub:'The most country of them: white panelling to waist height, light blue above it.', table:['Open the dining table for four','Close it to a console'], pal:['#5d7c79','#cfe0e8','#fbfaf6','#C99A5B','#8fbd9b'],
     list:[
      ['Walls','White tongue-and-groove panelling up to 1.1 m along the sofa wall, with a cap rail, and light blue paint above it.'],
      ['Sofa','KIVIK 3-seat in Kelinge grey-turquoise.'],
      ['Coffee table','A wooden storage chest, 100 × 50. Blankets and board games go inside.'],
      ['TV wall','The white 4 × 2 cube shelf lying down, TV on top, in front of the fridge side.'],
      ['Rug and entrance','Cream rug with light blue stripes. Bench with baskets and a hook rail instead of the wardrobe.'],
      ['Everything else','Record corner, drop-leaf dining table, kitchen and bedrooms as in option A.']]},
  f:{name:'F', like:'a', title:'F · Record wall', sub:'The record corner becomes the feature: a sage panel of wall with three oak shelves of records above the console.', table:['Open the dining table for four','Close it to a console'], pal:['#4a4b4e','#a9c4ad','#C99A5B','#fbfaf6','#9fc4d6'],
     list:[
      ['Record corner','The wall behind it is painted sage, floor to ceiling, 1.65 m wide. Three oak shelves above the console hold the records, facing out.'],
      ['Sofa','KIVIK 3-seat in Tresund anthracite, dark against the sage.'],
      ['Coffee table','Two round nesting tables and one linen pouf.'],
      ['TV wall','White 1 × 4 cube tower against the fridge side, white TV bench with an oak top.'],
      ['Rug and entrance','Natural wool rug 160 × 230. Slim shoe cabinet instead of the wardrobe.'],
      ['Everything else','Drop-leaf dining table, kitchen and bedrooms as in option A.']]},
  g:{name:'G', like:'a', title:'G · EKET play', sub:'EKET cubes in three places: a console under the TV, a record corner, and a cupboard at the door.', table:['Open the dining table for four','Close it to a console'], pal:['#f1f0eb','#aabccb','#d5cab4','#d9bf8c','#9fc4d6'],
     list:[
      ['TV','An EKET console on legs: a door, three drawers in light grey-blue, a door. 140 × 35, the TV on top.'],
      ['Record corner','A 70 × 70 EKET with four compartments for the records, a cube and a door beside it, the turntable on top.'],
      ['Entrance','A tall EKET cupboard for shoes, two drawers for keys and an open cube for a basket, instead of the wardrobe.'],
      ['Sofa and table','KIVIK in Tresund light beige, a round BORGEBY birch table, STOENSE off-white rug, a light blue pouf, ÅRSTID floor lamp, a monstera.'],
      ['Change the cubes','In Edit mode tap any EKET piece, then Edit the combination: add, remove, move and recolour each cube.']]},
  h:{name:'H', like:'a', title:'H · Our oak shelf', sub:'Your own solid oak shelf from the photos stands in the record corner, with the turntable on its middle row.', table:['Open the dining table for four','Close it to a console'], pal:['#b4803f','#b1a998','#b89a63','#b08559','#fbfaf6'],
     list:[
      ['Record corner','Your shelf: 150 × 30 × 205, four rows 43 cm high on V-shaped legs, measured from the photos. The turntable sits on the open end of the third row at standing height, records beside it.'],
      ['Sofa','KIVIK 3-seat in Tibbleby beige/grey. An arc lamp between the shelf and the sofa.'],
      ['Coffee table','LISTERBY in oak, 140 × 60, on a LOHALS jute rug, with a beige pouf.'],
      ['TV and entrance','HEMNES TV bench in light brown, to go with the oak. Slim shoe cabinet at the door.'],
      ['Green','A fiddle-leaf fig in terracotta at the far end of the sofa.']]},
  i:{name:'I', like:'a', title:'I · Japandi calm', sub:'Pale wood, off-white and paper light: low, quiet and uncluttered.', table:['Open the dining table for four','Close it to a console'], pal:['#d5cab4','#dccfb7','#f0eee8','#e3c99d','#4a3426'],
     list:[
      ['Sofa','KIVIK in Tresund light beige under one large print.'],
      ['Light','A REGOLIT paper pendant over the table, a VIDJA column lamp by the sofa.'],
      ['Table and rug','LISTERBY in white-stained oak on a high-pile ÅDUM rug.'],
      ['Record corner','Two IVAR cabinets painted white, on legs, with an oak plank on top and the turntable on it. A DIY classic.'],
      ['TV and entrance','A 180 cm BESTÅ in white-stained oak. A bench with hooks at the door.']]},
  j:{name:'J', like:'a', title:'J · Dark and cosy', sub:'Anthracite, walnut and a red kilim: a room for evenings.', table:['Open the dining table for four','Close it to a console'], pal:['#4a4b4e','#6b4630','#c4673f','#3e4b5b','#d8a63b'],
     list:[
      ['Sofa','KIVIK 3-seat with a chaise longue in Tresund anthracite. The chaise is on the record-corner side, so the path to the door stays clear.'],
      ['Table and light','A round walnut pedestal table with a HEKTAR pendant over it, a HEKTAR floor lamp at the sofa end.'],
      ['Record corner','EKET in dark grey-blue and walnut, with the turntable on top and a pothos hanging above it.'],
      ['TV and entrance','LACK TV bench in black-brown. HEMNES shoe cabinet in black-brown at the door.']]},
  k:{name:'K', like:'a', title:'K · Coastal blue', sub:'White, light blue and grey-turquoise, with stripes and a palm.', table:['Open the dining table for four','Close it to a console'], pal:['#5d7c79','#aabccb','#9fc4d6','#fbfaf6','#efe7d6'],
     list:[
      ['Sofa','KIVIK in Kelinge grey-turquoise, a light blue and a linen pouf.'],
      ['Record corner','A white KALLAX 4 × 2 on its side: records and baskets inside, the turntable on top.'],
      ['TV','EKET console, white with light grey-blue drawers.'],
      ['Table, rug, lamp','White LACK coffee table, the striped rug, a TÅGARP uplighter.'],
      ['Entrance','A BISSA shoe cabinet under a white hook rail.']]},
  l:{name:'L', like:'a', title:'L · Plant jungle', sub:'Pine, rattan and jute, and plants everywhere: on the floor, on the shelves and hanging.', table:['Open the dining table for four','Close it to a console'], pal:['#b1a998','#e3c99d','#b89a63','#3f9160','#b5673f'],
     list:[
      ['Record corner','An IVAR shelf in pine, full of plants, with the turntable on the second shelf.'],
      ['Plants','A monstera and a fiddle-leaf fig at the ends of the sofa, two hanging pothos.'],
      ['Table and light','A round BORGEBY in birch under a bamboo MISTERHULT pendant, on a jute rug.'],
      ['TV','A KALLAX on oak legs, a DIY TV bench.'],
      ['Sofa','KIVIK in Tibbleby beige/grey with a sage pouf.']]}
};

/* ---------- state and layout animation ---------- */
const S=A.state={design:'a',table:0,lift:0,pj:false,labels:false,dims:false,edit:false};
A.tableT=0; A.halfT=0; A.liftT=0; A.layoutFns=[];
let anim=null;
const USER=A.USER={};                  // furniture you moved yourself, per design and table state
const EDITS=A.EDITS={};                // per design: t swapped pieces, c colours, f settings, gone removed pieces, items you added
A.edits=function(d){d=d||S.design; return EDITS[d]||(EDITS[d]={t:{},c:{},f:{},gone:{},items:{}});};
function ukey(){return S.design+S.table+(S.pj?'p':'');}
A.ukey=ukey;
function targets(){
  const out={}, put=function(o){for(const k in o) out[k]=o[k];};
  put(LAY[S.design]); if(S.table===1&&S.design!=='n') put(OPEN); if(S.table===2&&S.design!=='n') put(OPEN2); if(S.pj) put(PJ[S.design]);
  const e=EDITS[S.design];
  if(e){for(const k in e.gone) out[k]=null; for(const k in e.items){const it=e.items[k]; if(!it.on&&P[k]) out[k]=[it.x,it.z,it.r,it.y||0];}}
  const u=USER[ukey()]; if(u) for(const k in u) if(out[k]&&!(P[k]&&P[k].item)) out[k]=u[k];
  return out;
}
A.targets=targets;
/* which catalog piece, colour and settings a piece shows in design d */
function wantOf(p,d){
  if(p.item) return [p.item.t,p.item.c||0,p.item.f||null];
  if(!p.type0) return null;
  const s=SPEC[d]&&SPEC[d][p.id], e=EDITS[d]||{}, base=s?s[0]:p.type0, t=(e.t&&e.t[p.id])||base;
  let c=0, f=null;
  if(t===base){c=s?s[1]:p.col0; f=s?(s[2]!=null?s[2]:(s[0]===p.type0?p.cfg0:null)):p.cfg0;}
  if(e.c&&e.c[p.id]!=null) c=e.c[p.id];
  if(e.f&&e.f[p.id]) f=e.f[p.id];
  return [t,c,f];
}
A.wantOf=wantOf;
function attached(o){for(;o;o=o.parent) if(o===scene) return true; return false;}
function prune(list){for(let i=list.length-1;i>=0;i--) if(!attached(list[i])) list.splice(i,1);}
function roomOf(p){
  if(!p.item) return p.room||'living';
  const x=p.item.x, z=p.item.z, r=A.roomAt(x,z);
  return A.rooms[r]&&!A.rooms[r].ext?r:'living';
}
/* (re)build a catalog piece if what it should show has changed */
function ensure(p,force){
  const w=wantOf(p,S.design); if(!w||!CAT[w[0]]) return false;
  const room=roomOf(p), key=w[0]+'|'+w[1]+'|'+JSON.stringify(w[2])+'|'+room;
  if(p.built===key&&!force) return false;
  if(p.built){const old=p.g.children.filter(function(c){return !c.userData.uid;}); old.forEach(function(c){A.forget(c); p.g.remove(c);}); prune(K.cushions); prune(K.espressos); delete p.g.userData.disc; delete p.g.userData.arm;}   // things you put on it stay
  const d=A.buildItem(p.g,w[0],w[1],w[2],room);
  p.type=w[0]; p.col=w[1]; p.cfg=w[2]; p.def=d; p.built=key; p.builtRoom=room; p.flat=!!d.flat;
  p.seats=A.seatsFor(w[0],p.seatPrefix||(p.item&&p.item.seatAs)||p.id);
  if(p.seatLabel) p.seats.forEach(function(s){s.label=p.seatLabel;});
  p.lbl=d.n; p.lh=d.lh; if(p.el) p.el.textContent=d.n;
  p.g.userData.shop={name:d.n,q:d.q,site:d.site||'ikea',note:d.note||''}; if(A.shops.indexOf(p.g)<0) A.shops.push(p.g);
  if(d.flat) p.g.userData.nc=true;
  A.touch(4);
  return true;
}
A.ensurePiece=ensure;
/* pieces you add yourself */
A.addPiece=function(id,item){
  const p=slot(id,null,{item:item,isNew:true,design:S.design});
  p.el=A.tag('', 'new'); ensure(p,true); return p;
};
A.dropPiece=function(id){
  const p=P[id]; if(!p) return;
  A.forget(p.g); scene.remove(p.g); if(p.el) p.el.remove();
  const i=A.shops.indexOf(p.g); if(i>=0) A.shops.splice(i,1);
  prune(K.cushions); prune(K.espressos); delete P[id];
};
A.layout=function(instant){
  if(A.beforeLayout) A.beforeLayout();
  const t=targets();
  for(const id in P){const p=P[id], v=t[id];
    if(v){ensure(p); p.y=v[3]!=null?v[3]:p.y0;}
    p.from=p.cur.slice(); p.to=v?[v[0],v[1],v[2],1]:[p.cur[0],p.cur[1],p.cur[2],0];
    if(p.from[3]<0.02&&v){p.from[0]=v[0]; p.from[1]=v[1]; p.from[2]=v[2];}
  }
  for(let i=0;i<A.onlys.length;i++){const o=A.onlys[i], sp=o.userData.only;          // the newer designs share everything marked for A
    o.visible=(sp.indexOf(S.design)>=0||sp.indexOf(DESIGNS[S.design].like||'-')>=0)&&!(o.userData.not&&o.userData.not.indexOf(S.design)>=0);}
  anim={t0:performance.now(),dur:(instant||A.reduce)?1:800,tf:A.tableT,tt:S.table===1?1:0,hf:A.halfT,ht:S.table===2?1:0,lf:A.liftT,lt:(S.lift&&S.design==='a')?1:0};
  resolveSeats();
  if(A.onLayout) A.onLayout();
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
      p.g.position.set(p.cur[0],p.y||0,p.cur[1]); p.g.rotation.y=p.cur[2]; A.touch(3);
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
      s.x=x+s.lx*c+s.lz*sn; s.z=z-s.lx*sn+s.lz*c; s.room=p.item?A.roomAt(s.x,s.z):'living';
      s.h=s.face?Math.atan2(1.9-s.x,SZ-s.z):f+R/2+(s.dh||0);
      live.push(s);
    });
  }
}
A.resolveSeats=resolveSeats;
A.liveSeats=function(){return live;};
/* the piece that plays a part in Sims mode: the sofa you have in this design, the record player wherever it stands */
function shownObj(o){for(;o;o=o.parent){if(!o.visible) return false; if(o===scene) return true;} return false;}
A.pieceFor=function(id){
  const p=P[id];
  if(id==='music'){
    if(p&&p.to[3]>=1&&p.g.userData.disc&&shownObj(p.g.userData.disc)) return p;
    for(const k in P){const q=P[k]; if(q.to[3]>=1&&q.g.userData.disc&&shownObj(q.g.userData.disc)) return q;}
    return A.findTurntable?A.findTurntable():null;
  }
  if(id==='sofa'&&!(p&&p.to[3]>=1)) for(const k in P){const q=P[k]; if(q.to[3]>=1&&(q.seatPrefix==='sofa'||(q.item&&q.item.seatAs==='sofa'))) return q;}
  return p||null;
};
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
 {label:'Lobby', pos:new THREE.Vector3(1.5,1.6,L+6.5)},
 {label:'Yard, one floor down', pos:new THREE.Vector3(9,-1.6,-1)},
 {label:'≈ '+L.toFixed(1)+' m', pos:new THREE.Vector3(-0.3,0.05,L/2), dim:true},
 {label:'≈ '+W.toFixed(1)+' m', pos:new THREE.Vector3(W/2,0.05,2.3), dim:true},
 {label:'ceiling ≈ '+H.toFixed(2)+' m', pos:new THREE.Vector3(0.05,H-0.2,L-1.2), dim:true},
 {label:'kitchen ≈ '+(KX-W).toFixed(1)+' × '+KZ.toFixed(1)+' m', pos:new THREE.Vector3((W+KX)/2,0.05,0.95), dim:true},
 {label:'tiles 60 × 60', pos:new THREE.Vector3(2.2,0.05,2.4), dim:true},
 {label:'doors 78 × 205', pos:new THREE.Vector3((D.door2[0]+D.door2[1])/2,0.1,0.45), dim:true}
];
for(const id in P){const p=P[id]; if(p.label!==false&&(p.label||p.type0)) p.el=A.tag(p.label||CAT[p.type0].n,p.isNew||p.type0?'new':'');}
fixedLabels.forEach(function(f){f.el=A.tag(f.label,f.dim?'dim':'');});
for(const id in P){const p=P[id]; if(p.shop) A.shop(p.g,p.shop[0],p.shop[1],p.shop[2],p.shop[3]);}
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
    tmp.set(p.cur[0]+(p.lx||0),(p.y||0)+(p.lh||p.h),p.cur[1]+(p.lz||0)); A.place(p.el,tmp,show&&p.cur[3]>0.6);}
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
  if(A.renderEdit) A.renderEdit();
  if(A.onPanel) A.onPanel();
}
A.renderPanel=renderPanel;
let lastNew='a';
const KEYS=A.DESIGN_KEYS=['a','b','c','d','e','f','g','h','i','j','k','l'];
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
$('note').textContent='Scaled from photos and a video, not measured. The living room width (3.1 m) is the least certain number; one tape measurement from the sofa wall to the TV wall would settle it. New furniture is drawn at IKEA catalogue sizes.';
A.renderer.domElement.addEventListener('pointerdown',function(){A.stopFly(); $('hint').style.opacity=0;});
A.NAMES={table:'Coffee table',chairA:'Chair',chairB:'Chair',rack1:'Drying rack',rack2:'Drying rack',sofa:'Sofa',tvOld:'TV bench',station:'Coffee station',dining:'Dining table',
  lift:'Lift-top table',fold:'Fold-down table',gate:'Drop-leaf dining table',mat1:'Mattress',mat2:'Mattress'};
A.CUSTOMCAT={sofa:'sofa',table:'table',tvOld:'media',station:'shelf',dining:'dining',chairA:'chair',chairB:'chair',rack1:'hall',rack2:'hall',lift:'table',fold:'dining',gate:'dining'};
})();
