/* Haroe 10 — the apartment itself: walls, doors, windows, kitchen, bedrooms, bathroom, toilet */
(function(){
'use strict';
const A=window.APP, D=A.D, K=A.kit, W=D.W, L=D.L, H=D.H, KX=D.KX, KZ=D.KZ, ZW=D.ZW, BLK=D.BLK, AZ=A.AZ, SPLIT=A.SPLIT, BA=A.BA, WC=A.WC;
const box=A.box, cyl=A.cyl, sph=A.sph, M=A.M, inRoom=A.inRoom, wall=A.wall, rect=A.rect, G=A.G, scene=A.scene, canvasTex=A.canvasTex;
const R=Math.PI, SAGE=A.SAGE=0x8fbd9b, BLUE=A.BLUE=0x9fc4d6, KGREEN=0x7b8a60;      // kitchen fronts: a muted, yellowish, fairly deep sage
A.seats=[];            // places a person can sit or lie: {id,label,room,x,z,y,h,type,only}
function seat(s){A.seats.push(s); return s;}
A.seat=seat;
/* things you can buy: tap one in Design to get a link. site 'ikea' searches IKEA Israel, anything else searches the web. */
A.shops=[];
A.shop=function(o,name,q,site,note){o.userData.shop={name:name,q:q,site:site||'ikea',note:note||''}; A.shops.push(o); return o;};

/* ---------- floors and ceilings ---------- */
A.slab(0,W,0,ZW,'living'); A.slab(0,BLK,ZW,L,'living'); A.slab(W,KX,0,KZ,'kitchen');
A.slab(0,SPLIT-0.05,AZ,0,'bed1'); A.slab(SPLIT+0.05,KX,AZ,0,'bed2'); A.slab(WC.x0,WC.x1,WC.z0,WC.z1,'wc');
(function(){   // bathroom floor: patterned 20 cm tiles
  const t=canvasTex(128,128,function(g){g.fillStyle='#e9e6de'; g.fillRect(0,0,128,128); g.strokeStyle='#6f6a62'; g.lineWidth=7;
    g.beginPath(); g.arc(64,64,34,0,7); g.stroke(); g.lineWidth=5;
    [[0,0],[128,0],[0,128],[128,128]].forEach(function(p){g.beginPath(); g.arc(p[0],p[1],38,0,7); g.stroke();});
    g.fillStyle='#6f6a62'; g.beginPath(); g.moveTo(64,44); g.lineTo(84,64); g.lineTo(64,84); g.lineTo(44,64); g.fill();});
  t.wrapS=t.wrapT=THREE.RepeatWrapping; A.floorQuad(BA.x0,BA.x1,BA.z0,BA.z1,t,0.2,'bath');
})();
A.ceil('living',0,W,0,ZW); A.ceil('living',0,BLK,ZW,L); A.ceil('kitchen',W,KX,0,KZ); A.ceil('bed1',0,SPLIT-0.05,AZ,0); A.ceil('bed2',SPLIT+0.05,KX,AZ,0);
A.ceil('bath',BA.x0,BA.x1,BA.z0,BA.z1); A.ceil('wc',WC.x0,WC.x1,WC.z0,WC.z1);

/* ---------- walls ---------- */
const d1=D.door1, d2=D.door2, en=D.entrance, bl=SPLIT+0.05, bd=D.bathDoor, wd=D.wcDoor;
wall('far',  [0,0],  [KX,0], [0,1], 'living',{holes:[[d1[0],d1[1]],[d2[0],d2[1]]]});   // bedroom doors, then the cooktop
wall('left', [0,0],  [0,L],  [1,0], 'living');                                          // sofa wall
wall('end',  [0,L],  [BLK,L],[0,-1],'living',{holes:[[en[0],en[1]]]});                  // entrance wall
wall('tv',   [W,KZ], [W,ZW], [-1,0],'living',{holes:[[bd[0]-KZ,bd[1]-KZ]]});            // TV wall, bathroom door at its end
wall('blk_n',[BLK,ZW],[W,ZW],[0,-1],'living',{holes:[[wd[0]-BLK,wd[1]-BLK]]});          // front of the guest toilet
wall('blk_w',[BLK,ZW],[BLK,L],[-1,0],'living');                                         // its side, next to the wardrobe
wall('kback',[W,KZ], [KX,KZ],[0,-1],'kitchen');                                         // kitchen sink wall
wall('win',  [KX,0], [KX,KZ],[-1,0],'kitchen');                                         // kitchen window wall
wall('a_door',[0,0],[SPLIT-0.05,0],[0,-1],'bed1',{holes:[[d1[0],d1[1]]]});
wall('a_l',[0,0],[0,AZ],[1,0],'bed1'); wall('a_far',[0,AZ],[SPLIT-0.05,AZ],[0,1],'bed1'); wall('a_r',[SPLIT-0.05,AZ],[SPLIT-0.05,0],[-1,0],'bed1');
wall('b_door',[bl,0],[KX,0],[0,-1],'bed2',{holes:[[d2[0]-bl,d2[1]-bl]]});
wall('b_l',[bl,0],[bl,AZ],[1,0],'bed2'); wall('b_far',[bl,AZ],[KX,AZ],[0,1],'bed2'); wall('b_r',[KX,AZ],[KX,0],[-1,0],'bed2');
wall('wc_n',[WC.x0,WC.z0],[WC.x1,WC.z0],[0,1],'wc',{holes:[[wd[0]-WC.x0,wd[1]-WC.x0]]});
wall('wc_w',[WC.x0,WC.z0],[WC.x0,WC.z1],[1,0],'wc'); wall('wc_e',[WC.x1,WC.z0],[WC.x1,WC.z1],[-1,0],'wc'); wall('wc_s',[WC.x0,WC.z1],[WC.x1,WC.z1],[0,-1],'wc');
wall('ba_w',[BA.x0,BA.z0],[BA.x0,BA.z1],[1,0],'bath',{holes:[[bd[0]-BA.z0,bd[1]-BA.z0]]});
wall('ba_n',[BA.x0,BA.z0],[BA.x1,BA.z0],[0,1],'bath'); wall('ba_e',[BA.x1,BA.z0],[BA.x1,BA.z1],[-1,0],'bath'); wall('ba_s',[BA.x0,BA.z1],[BA.x1,BA.z1],[0,-1],'bath');

/* ---------- doors: frames on both sides, a hinged leaf in between ---------- */
A.doorFrame('far',d1[0],d1[1]); A.doorFrame('far',d2[0],d2[1]); A.doorFrame('a_door',d1[0],d1[1]); A.doorFrame('b_door',d2[0]-bl,d2[1]-bl);
A.doorFrame('end',en[0],en[1]); A.doorFrame('tv',bd[0]-KZ,bd[1]-KZ); A.doorFrame('ba_w',bd[0]-BA.z0,bd[1]-BA.z0);
A.doorFrame('blk_n',wd[0]-BLK,wd[1]-BLK); A.doorFrame('wc_n',wd[0]-WC.x0,wd[1]-WC.x0);
A.doorLeaf('bed1',d1[1],0,R,R/2,'living',0.78);
A.doorLeaf('bed2',d2[1],0,R,R/2,'living',0.78);
A.doorLeaf('bath',W,bd[0],-R/2,0,'living',0.7);            // hinged on the left as you walk in, swings into the bathroom
A.doorLeaf('wc',wd[1],ZW,R,R/2,'living',0.7);              // swings out into the living room
A.doorLeaf('entrance',en[0],L,0,R/2,'living',0.85);

/* ---------- living room: fixed things on the walls ---------- */
(function(){const p=D.painting;                                     // bus canvas
  rect('far',p[0],p[1],p[2],p[3],0xd9d6cc,0.006); rect('far',p[0]+0.015,p[1]-0.015,p[2]+0.015,p[3]-0.015,0xefece3,0.008);
  const cx=(p[0]+p[1])/2, cy=(p[2]+p[3])/2;
  rect('far',cx-0.33,cx+0.33,cy-0.1,cy+0.14,0x7fc4b5,0.010); rect('far',cx-0.33,cx+0.33,cy-0.13,cy-0.09,0x4f9a8b,0.011);
  rect('far',cx-0.30,cx-0.02,cy-0.02,cy+0.1,0xcfe9e3,0.012); rect('far',cx+0.02,cx+0.3,cy-0.02,cy+0.1,0xcfe9e3,0.012);
  [cx-0.22,cx+0.2].forEach(function(u){rect('far',u-0.045,u+0.045,cy-0.17,cy-0.09,0x2a2d2f,0.012);});
})();
rect('left',L-0.55,L-0.25,1.55,1.95,0xe6e9e5,0.008); rect('left',L-0.53,L-0.27,1.57,1.93,0xf2f4f1,0.009); // electrical panel by the front door
rect('blk_w',0.2,0.3,1.35,1.5,0xd9dcd8,0.008);                              // intercom
rect('tv',1.3,1.38,1.25,1.37,0xdfe2de,0.008);                               // light switch
(function(){                                                                // photo strips on the TV wall (today)
  const photos=canvasTex(128,256,function(g){g.fillStyle='#f7f7f5'; g.fillRect(0,0,128,256);
    const cs=['#5b4a42','#8a6f5e','#3c4a55','#a58b76','#6d7f6a','#2f3438','#b49c8c'];
    for(let r=0;r<14;r++)for(let c=0;c<5;c++){g.fillStyle=cs[(r*3+c*5+r*c)%cs.length]; g.fillRect(6+c*24,6+r*17.6,20,14);}});
  A.only(rect('tv',0.05,0.5,0.75,1.95,A.MT(photos,'living'),0.01),'n');
})();
inRoom('living',function(){
  const n=G(null,'n');
  K.ceilDisc(n,W/2,3.0,'L:living');                                        // today's ceiling light
  // entrance: wardrobe and vacuum on the entrance wall, between the door and the toilet block
  box(0.86,1.75,0.45,0xf8f8f6,1.6,0.875,L-0.225); box(0.006,1.7,0.004,0xc5c9c5,1.6,0.875,L-0.452);
  [1.56,1.64].forEach(function(x){box(0.012,0.12,0.02,0xc9cdc9,x,0.95,L-0.46);});
  box(0.42,0.3,0.36,0x2b2f38,1.42,1.9,L-0.23,n); box(0.3,0.24,0.3,0xc23a4a,1.82,1.87,L-0.22,n);
  box(0.1,1.05,0.14,0x2c2f33,2.11,0.55,L-0.14); box(0.14,0.08,0.26,0x2c2f33,2.11,0.04,L-0.18);
});

/* ---------- kitchen ---------- */
const brick=function(rows,cols){const t=canvasTex(256,256,function(g){g.fillStyle='#f3f1ea'; g.fillRect(0,0,256,256); g.strokeStyle='#d5d2c8'; g.lineWidth=2;
  for(let r=0;r<rows;r++){const y=r*256/rows; g.beginPath(); g.moveTo(0,y); g.lineTo(256,y); g.stroke();
    for(let c=0;c<=cols;c++){const x=(c+(r%2?0.5:0))*256/cols; g.beginPath(); g.moveTo(x,y); g.lineTo(x,y+256/rows); g.stroke();}}}); return A.MT(t,'kitchen');};
rect('kback',0.75,2.6,0.92,1.47,brick(4,8),0.006);                          // sink backsplash
rect('far',KX-1.85,KX,0.92,1.55,brick(5,7),0.006);                          // cooktop backsplash
rect('far',KX-0.6,KX-0.42,1.85,2.1,0x9aa3ad,0.008); rect('far',KX-0.32,KX-0.14,1.85,2.1,0x9fc4d6,0.008); // posters
A.windowOn('win',0.55,2.05,0.05,2.3,2,0,'kitchen');                          // kitchen window
rect('win',0.55,2.05,1.0,1.1,0xe9ece8,0.010);
for(let i=1;i<10;i++){const u=0.6+i*1.4/10; rect('win',u-0.006,u+0.006,0.1,1.0,0xf4f5f3,0.009);} // bars, lower pane
A.sunPatch('kitchen',KX-0.05,1.3,1.5,3.6,-R/2);
inRoom('kitchen',function(){
  const n=G(null,'n'), d=G(null,'abc');              // today / redesigned
  const top=0xebe7dc, line=0x17181a;
  box(0.22,0.28,0.85,0xf6f7f5,KX-0.11,2.55,1.3);                             // air conditioner above the window
  box(KX-W,H-2.35,0.6,A.reg(new THREE.MeshLambertMaterial({color:0xf5f6f3,transparent:true,opacity:0.3})),(W+KX)/2,(H+2.35)/2,KZ-0.3).castShadow=false; // bulkhead (translucent)
  // sink side (z = KZ): 60 | 30 | 30 | 60 doors, counted from the window wall
  const x1=KX, x0=KX-1.8, zf=KZ-0.6;
  // cooktop side (z = 0)
  const c1=KX, c0=KX-1.8;
  const sage=function(){return A.reg(new THREE.MeshLambertMaterial({color:KGREEN,emissive:0x151810}));};   // lifted a little so it reads as pastel on the shaded fronts
  [[n,0x34373c,0xf0d21c],[d,sage(),sage()]].forEach(function(v){   // carcasses: charcoal + yellow today, pastel green in the redesign
    box(1.8,0.76,0.58,v[1],(x0+x1)/2,0.5,KZ-0.29,v[0]);
    box(1.8,0.76,0.58,v[1].isMaterial?sage():v[1],(c0+c1)/2,0.5,0.29,v[0]);
    box(1.15,0.58,0.35,v[2],x0+0.9,1.76,KZ-0.175,v[0]);
  });
  box(0.006,0.56,0.004,0x6c7a55,x0+0.9,1.76,zf+0.248,d);                     // wall cabinet door split
  box(1.8,0.12,0.5,0x1d1f21,(x0+x1)/2,0.06,KZ-0.25); box(1.84,0.04,0.63,top,(x0+x1)/2,0.9,KZ-0.305);
  [x1-0.6,x1-0.9,x1-1.2].forEach(function(x){box(0.006,0.74,0.004,line,x,0.5,zf-0.002);});
  [x1-0.56,x1-0.87,x1-0.93,x1-1.24].forEach(function(x){box(0.012,0.13,0.02,line,x,0.78,zf-0.012);});
  box(0.56,0.02,0.4,0xd9d5c8,x1-1.05,0.915,KZ-0.32);                  // sink
  box(0.03,0.3,0.03,0xb9bdc0,x1-1.05,1.07,KZ-0.1); box(0.03,0.03,0.16,0xb9bdc0,x1-1.05,1.21,KZ-0.17);
  // things on the counter and on top of the cabinet today; cleared in the redesign
  box(0.5,0.2,0.34,0x2a2c2e,x1-0.3,1.02,KZ-0.28,n);                   // dish rack
  box(0.3,0.42,0.005,0xc8b790,x1-0.08,1.13,KZ-0.33,n);                // cutting board
  box(0.2,0.3,0.24,0xe8e2c4,x0+0.25,1.07,KZ-0.3,n);                   // kettle
  cyl(0.04,0.3,0x7fb39a,x0+0.55,1.07,KZ-0.2,n);                        // bottle
  box(0.3,0.18,0.1,0xe8c93a,x0+0.5,2.14,KZ-0.3,n); box(0.25,0.3,0.12,0xf4f2ee,x0+0.95,2.2,KZ-0.3,n); // boxes on top
  // fridge in the opening corner, side covered with photos
  const fx=W+0.36, fz=KZ-0.36;
  box(0.7,1.75,0.72,0xf7f7f5,fx,0.875,fz);
  box(0.66,0.012,0.004,0xb5b9b6,fx,1.22,fz-0.362); box(0.02,0.5,0.03,0xdedfdc,fx+0.28,0.95,fz-0.375); box(0.02,0.25,0.03,0xdedfdc,fx+0.28,1.42,fz-0.375);
  box(0.1,0.14,0.005,0xfdfdfb,fx-0.05,1.48,fz-0.363); box(0.06,0.1,0.005,0x4fb6d6,fx-0.2,1.42,fz-0.363);
  box(0.48,0.28,0.36,0xe9e9e6,fx+0.02,1.89,fz,n); box(0.3,0.2,0.005,0x2b2d2f,fx-0.03,1.89,fz-0.182,n); // microwave
  cyl(0.11,0.24,0x1f2a52,fx-0.18,2.15,fz-0.1,n); box(0.18,0.3,0.2,0x1c2a4a,fx+0.25,1.9,fz,n);           // whey jar, bug zapper
  // cooktop side: 8 cm filler | oven + hob 60 | door | drawers, counted from the window wall.
  // The hob is 45 cm wide and sits close to the window end.
  box(1.8,0.12,0.5,0x1d1f21,(c0+c1)/2,0.06,0.25); box(1.84,0.04,0.63,0xf4f3ee,(c0+c1)/2,0.9,0.305);
  const hx=c1-0.38;
  [c1-0.08,c1-0.68,c1-1.2].forEach(function(x){box(0.006,0.74,0.004,line,x,0.5,0.602);});
  box(0.56,0.56,0.006,0x0f1011,hx,0.56,0.603); box(0.44,0.02,0.03,0x8d9296,hx,0.78,0.615);            // oven
  box(0.45,0.012,0.4,0x101112,hx,0.926,0.3);                                                          // hob
  [[-0.1,-0.09],[0.1,-0.09],[-0.1,0.09],[0.1,0.09]].forEach(function(q){cyl(0.06,0.004,0x2a2c2e,hx+q[0],0.934,0.3+q[1],null,18);});
  box(0.012,0.13,0.02,line,c1-0.74,0.78,0.612);
  [0.34,0.62].forEach(function(y){box(0.58,0.006,0.004,line,c0+0.3,y,0.602);}); [0.26,0.52,0.78].forEach(function(y){box(0.26,0.014,0.02,line,c0+0.3,y,0.612);});
  box(0.5,0.03,0.12,0x9a6b3f,c0+0.3,1.6,0.06);                                                      // spice shelf
  [0,1,2,3,4].forEach(function(i){cyl(0.028,0.11,[0xc63d2f,0xd9b23a,0x5b8f4a,0xb9772e,0xe5e0d2][i],c0+0.12+i*0.09,1.67,0.06);});
  cyl(0.175,0.62,0x2f8f95,KX-0.42,0.31,1.65,n); cyl(0.165,0.08,0x202325,KX-0.42,0.66,1.65,n);       // bin (gone in the redesign)
  K.ceilDisc(n,W+1.3,1.4,'L:kitchen');
  // redesign: pendant, light strip under the wall cabinet, runner, hanging plant
  K.pendant(d,W+1.3,2.25,1.4,'L:kitchen','dome',KGREEN,1.3);
  box(1.1,0.012,0.02,A.lampMat('L:kitchen',0xf4f1e6,0xffe9c4,1),x0+0.9,1.462,KZ-0.33,d);
  A.pool('L:kitchen',0xffd9a0,x0+0.9,0.925,KZ-0.3,0.55,d,0.55);
  const rr=G(d); rr.position.set(W+1.35,0,1.4); rr.rotation.y=R/2; K.rug(rr,0.7,1.9,'runner');
  K.hanging(d,KX-0.24,1.95,2.0,0.75,4);
  A.shop(rr,'Kitchen runner','flatwoven runner rug','ikea');
});

/* ---------- bedroom 1 (the smaller one): today desk + bed, redesigned as a study with two desks ---------- */
A.windowOn('a_far',0.55,1.95,1.0,2.1,3,0,'bed1');
A.sunPatch('bed1',1.25,AZ+0.05,1.3,2.6,0);
inRoom('bed1',function(){
  const n=G(null,'n'), d=G(null,'abc'), r=SPLIT-0.05;
  box(0.85,0.28,0.2,0xf6f7f5,1.3,2.5,AZ+0.11);                          // air conditioner
  box(1.2,0.03,0.6,0xd9bf8c,0.65,0.74,AZ+0.32);                         // desk under the window
  [[0.08,AZ+0.05],[1.22,AZ+0.05],[0.08,AZ+0.59],[1.22,AZ+0.59]].forEach(function(p){box(0.03,0.73,0.03,0xf2f2f0,p[0],0.365,p[1]);});
  box(0.56,0.33,0.03,0x111315,0.7,1.08,AZ+0.16); box(0.2,0.14,0.12,0x111315,0.7,0.83,AZ+0.16); // monitor
  box(0.5,0.08,0.5,0xd8d8d2,0.65,0.48,AZ+0.95); box(0.46,0.6,0.06,0xd8d8d2,0.65,0.85,AZ+1.2); cyl(0.03,0.4,0x8d9092,0.65,0.24,AZ+0.95); cyl(0.28,0.04,0x8d9092,0.65,0.04,AZ+0.95); // chair
  seat({id:'desk1',label:'Desk by the window',room:'bed1',x:0.65,z:AZ+0.95,y:0.52,h:R,type:'sit'});
  box(0.38,1.75,0.38,0xeef0f1,0.25,0.875,-0.25); [0.35,0.7,1.05,1.4].forEach(function(y){box(0.385,0.012,0.385,0xd5d8da,0.25,y,-0.25);});   // plastic cube tower by the door
  // today: bed along the right wall
  box(0.9,0.22,2.0,0xc9a66b,r-0.46,0.2,AZ+1.02,n); box(0.9,0.2,2.0,0xd9c7b0,r-0.46,0.41,AZ+1.02,n); box(0.6,0.1,0.38,0xe9e2d4,r-0.46,0.56,AZ+0.3,n);
  seat({id:'bed1',label:'Bed (bedroom 1)',room:'bed1',x:r-0.46,z:AZ+1.1,y:0.51,h:0,type:'lie',only:'n'});
  K.ceilDisc(n,1.05,-2.0,'L:bed1');
  box(0.6,2.3,1.6,0xe9dfcf,r-0.3,1.15,-1.1);                            // wardrobe
  [-1.6,-1.07,-0.55].forEach(function(z){box(0.004,2.26,0.006,0xcfc4b2,r-0.602,1.15,z);});
  [0.25,0.5,0.75].forEach(function(y){box(0.02,0.012,0.3,0xa9a59c,r-0.61,y,-0.82);});
  [-1.2,-1.0].forEach(function(z){box(0.02,0.2,0.014,0xa9a59c,r-0.61,1.25,z);});
  // redesign: second desk where the bed was, shelves, lamps, rug, plants
  const dz=AZ+1.5;
  box(0.65,0.035,1.1,0xc99a5b,r-0.335,0.74,dz,d);
  [[r-0.62,dz-0.51],[r-0.05,dz-0.51],[r-0.62,dz+0.51],[r-0.05,dz+0.51]].forEach(function(p){box(0.035,0.72,0.035,0x22262a,p[0],0.36,p[1],d);});
  box(0.03,0.36,0.62,0x111315,r-0.16,1.1,dz-0.1,d); box(0.1,0.16,0.18,0x111315,r-0.16,0.84,dz-0.1,d);   // monitor
  box(0.14,0.012,0.4,0xe9e9e6,r-0.42,0.765,dz-0.1,d); box(0.24,0.012,0.32,0xb9bdc0,r-0.35,0.765,dz+0.36,d); // keyboard, laptop
  const lid=box(0.012,0.22,0.32,0xb9bdc0,r-0.22,0.87,dz+0.36,d); lid.rotation.z=-0.25;
  const ch=G(d); ch.position.set(r-1.05,0,dz); K.officeChair(ch,0x8fbd9b); A.shop(ch,'Desk chair','office chair','ikea');
  seat({id:'desk2',label:'New desk',room:'bed1',x:r-1.05,z:dz,y:0.52,h:R/2,type:'sit',only:'abc'});
  [1.32,1.68].forEach(function(y,i){box(0.22,0.03,1.0,0xc99a5b,r-0.11,y,dz,d); K.books(d,r-0.12,y+0.015,dz-0.2+i*0.4,0.45,0.22,0.16,71+i);});
  K.bush(d,r-0.12,1.335,dz+0.38,0.07); cyl(0.05,0.18,0x9fc4d6,r-0.12,1.785,dz-0.36,d,12,0.03);
  K.deskLamp(d,r-0.2,0.758,dz-0.43,'L:bed1',R*0.75); K.deskLamp(d,0.2,0.755,AZ+0.2,'L:bed1',-0.4);
  K.pendant(d,1.05,2.3,-2.0,'L:bed1','rattan',null,1.6);
  const rg=G(d); rg.position.set(0.8,0,-1.9); K.rug(rg,1.2,1.9,'wool'); A.shop(rg,'Wool rug','flatwoven rug natural','ikea');
  K.snake(d,0.25,-0.85,0.75); K.bush(d,1.1,0.755,AZ+0.12,0.06,0x9fc4d6);
  K.curtain(d,0.47,AZ+0.07,0.24,true,0.25,2.3); K.curtain(d,2.06,AZ+0.07,0.16,true,0.25,2.3);
  box(0.02,0.5,0.7,0xcfa97a,0.012,1.45,AZ+1.0,d);                         // cork board on the left wall
  [[1.52,AZ+0.82,0xf3ebdc],[1.58,AZ+1.05,0x9fc4d6],[1.36,AZ+0.95,0x8fbd9b],[1.4,AZ+1.18,0xcfe3ec]].forEach(function(q){box(0.006,0.12,0.14,q[2],0.026,q[0],q[1],d);});
});
K.onlyAll(K.frame('a_l',1.2,1.5,0.5,0.65,9,0xc99a5b).concat(K.frame('a_l',1.85,1.5,0.5,0.65,6,0xc99a5b)),'abc');

/* ---------- bedroom 2, from the photos and the video.
   Coming in through the door: dresser and 3-door wardrobe on the left wall, then a cube shelf standing across the room
   between that wall and a column. Behind them the bed. TV on a wall arm and the big window are on the right-hand wall,
   and the desk stands under the window, opposite the wardrobe. ---------- */
A.windowOn('b_far',0.5,1.3,1.25,2.0,2,5,'bed2');                       // small barred window on the far wall
A.windowOn('b_r',1.4,3.1,0.95,2.2,2,6,'bed2');                         // big window, over the desk
A.sunPatch('bed2',KX-0.05,AZ+2.25,1.6,2.6,-R/2);
inRoom('bed2',function(){
  const n=G(null,'n'), d=G(null,'abc'), l=bl, kz=-2.1, dkz=AZ+2.25;
  // wardrobe with a mirror door and the dresser, both on the left wall, facing the window
  box(0.5,1.9,1.17,0xf8f8f6,l+0.25,0.95,-1.27); [-1.66,-1.27,-0.88].forEach(function(z){box(0.006,1.82,0.37,0xfdfdfb,l+0.503,0.97,z);}); box(0.004,1.4,0.12,0xb9c6cc,l+0.508,1.05,-1.27);
  box(0.36,0.3,0.5,0x202a44,l+0.25,2.05,-1.45,n); box(0.36,0.3,0.4,0x3b3d40,l+0.25,2.05,-0.95,n);
  box(0.45,1.0,0.6,0xc7a878,l+0.225,0.5,-0.37); [0.34,0.67].forEach(function(y){box(0.006,0.012,0.58,0x7d674a,l+0.452,y,-0.37);});
  // 2 x 4 cube shelf between the wall and the column: it screens the bed from the door
  const kx=l+0.385;
  box(0.77,1.47,0.39,0xfafaf8,kx,0.735,kz);
  [0.37,0.735,1.1].forEach(function(y){box(0.73,0.02,0.006,0xcfd2ce,kx,y,kz+0.197);}); box(0.02,1.43,0.006,0xcfd2ce,kx,0.735,kz+0.197);
  [[-0.2,0xf0d21c],[-0.02,0xd9463e],[0.16,0x9fb4c8]].forEach(function(q){box(0.14,0.05,0.07,q[1],kx+q[0],1.5,kz,n);});   // model cars on top
  box(0.4,H,0.4,M(0xf5f6f3),l+0.97,H/2,kz);                             // column
  const sk=box(0.22,0.8,0.06,0x3b8f8a,l+0.2,0.42,kz+0.26,n); sk.rotation.x=-0.2;                                     // skateboard
  cyl(0.07,0.62,0x2b2d30,l+0.12,0.31,-1.98,n,12);                       // yoga mat
  box(0.06,0.06,0.3,0x25272b,KX-0.15,1.6,AZ+0.75);                      // TV arm on the window wall
  // today: bed with its head on the far wall, bedside table, bike under the TV, pine desk under the window
  box(1.5,0.14,2.0,0xc9a66b,l+0.95,0.1,AZ+1.02,n); box(1.5,0.22,2.0,0xf1efec,l+0.95,0.3,AZ+1.02,n); box(1.3,0.1,0.4,0xfafafa,l+0.95,0.46,AZ+0.3,n);
  seat({id:'bedL',label:'Bed, wall side',room:'bed2',x:l+0.6,z:AZ+1.12,y:0.41,h:0,type:'lie',only:'n'});
  seat({id:'bedR',label:'Bed, room side',room:'bed2',x:l+1.3,z:AZ+1.12,y:0.41,h:0,type:'lie',only:'n'});
  box(0.42,0.4,0.36,0xc79a5c,l+2.0,0.2,AZ+0.22,n);
  box(0.04,0.58,1.0,0x25272b,KX-0.42,1.6,AZ+0.7,n).rotation.y=-0.75;    // TV swung toward the bed
  (function(){const g=G(n); g.position.set(KX-0.55,0,AZ+1.15); g.rotation.y=R/2+0.12;      // mountain bike
    [-0.52,0.52].forEach(function(x){A.torus(0.33,0.025,0x1b1c1e,x,0.36,0,g);});
    const a=box(0.62,0.04,0.04,0xd9652c,-0.18,0.62,0,g); a.rotation.z=0.5; const b=box(0.62,0.04,0.04,0x1b1c1e,0.2,0.62,0,g); b.rotation.z=-0.55;
    box(0.7,0.04,0.04,0x1b1c1e,0.02,0.83,0,g); box(0.04,0.04,0.56,0xd98a2b,0.42,0.98,0,g); box(0.2,0.05,0.1,0x1b1c1e,-0.3,0.92,0,g);})();
  box(0.7,0.05,1.6,0xd2b07a,KX-0.36,0.74,dkz,n);
  [dkz-0.75,dkz+0.75].forEach(function(z){box(0.08,0.72,0.08,0xd2b07a,KX-0.66,0.36,z,n); box(0.08,0.72,0.08,0xd2b07a,KX-0.08,0.36,z,n);});
  box(0.04,0.36,0.62,0x111315,KX-0.2,1.1,dkz-0.1,n); box(0.14,0.14,0.2,0x111315,KX-0.2,0.84,dkz-0.1,n); box(0.16,0.02,0.45,0x1b1c1e,KX-0.42,0.775,dkz-0.1,n);
  box(0.5,0.08,0.5,0x2a2d31,KX-1.1,0.48,dkz,n); box(0.06,0.6,0.46,0x2a2d31,KX-1.36,0.85,dkz,n); cyl(0.03,0.4,0x2a2d31,KX-1.1,0.24,dkz,n); cyl(0.3,0.04,0x2a2d31,KX-1.1,0.04,dkz,n);
  seat({id:'desk3',label:'Desk (bedroom 2)',room:'bed2',x:KX-1.1,z:dkz,y:0.52,h:R/2,type:'sit',only:'n'});
  box(0.14,0.06,0.9,0x1b1c1e,KX-0.3,0.12,-0.75,n); box(0.04,1.05,0.04,0x1b1c1e,KX-0.3,0.62,-1.15,n); box(0.5,0.04,0.04,0x1b1c1e,KX-0.3,1.14,-1.15,n);   // electric scooter
  K.ceilDisc(n,(l+KX)/2,-2.0,'L:bed2');
  // proposal: the bed turns 90 degrees so it faces the TV, a reading nook replaces the desk, no bike
  const bz=AZ+0.8;
  box(2.0,0.14,1.5,0xc9a66b,l+1.03,0.1,bz,d); box(2.0,0.22,1.5,0xfbfaf6,l+1.03,0.3,bz,d); box(0.4,0.1,1.3,0xffffff,l+0.33,0.46,bz,d);
  box(0.05,0.6,1.5,0xc99a5b,l+0.03,0.72,bz,d);                          // wood headboard on the left wall
  box(0.7,0.05,1.52,SAGE,l+1.6,0.435,bz,d); box(0.3,0.14,0.36,BLUE,l+0.62,0.5,bz-0.3,d); box(0.3,0.14,0.36,0xcfe3ec,l+0.62,0.5,bz+0.3,d);
  seat({id:'bedL',label:'Bed, window side',room:'bed2',x:l+1.15,z:bz-0.35,y:0.41,h:R/2,type:'lie',only:'abc'});
  seat({id:'bedR',label:'Bed, room side',room:'bed2',x:l+1.15,z:bz+0.35,y:0.41,h:R/2,type:'lie',only:'abc'});
  box(0.36,0.42,0.36,0xc99a5b,l+0.2,0.21,bz+0.96,d); K.tableLamp(d,l+0.2,0.42,bz+0.96,'L:bed2');
  box(0.04,0.58,1.0,0x25272b,KX-0.3,1.45,bz,d);                         // TV straight ahead of the bed
  const brg=G(d); brg.position.set(l+2.75,0,bz); K.rug(brg,1.1,1.6,'stripe'); A.shop(brg,'Striped rug','flatwoven rug blue stripe','ikea');
  const nkz=dkz+0.3, nk=G(d); nk.position.set(KX-0.8,0,nkz); nk.rotation.y=R-0.4; K.armchair(nk,BLUE,0x86adc0); K.cushion(nk,0xfbfaf6,-0.12,0.62,0.05,0.9,0.35);
  A.shop(nk,'Reading armchair','STRANDMON','ikea','A wing chair. Pick a light blue or beige cover.');
  seat({id:'nook',label:'Reading nook',room:'bed2',x:KX-0.8,z:nkz,y:0.43,h:R-0.4+R/2,type:'sit',only:'abc',recline:0.2});
  const fl=G(d); fl.position.set(KX-0.28,0,nkz-0.75); K.floorLamp(fl,'L:bed2'); A.shop(fl,'Reading lamp','floor lamp reading','ikea');
  K.roundRug(d,KX-1.0,nkz,0.9,0xd8ccb2,0xefe7d6);
  const pf=G(d); pf.position.set(KX-1.55,0,nkz+0.5); K.pouf(pf,0xefe7d6); A.shop(pf,'Footstool pouf','SANDARED pouffe','ikea');
  const bc=G(d); box(0.3,0.8,1.0,0xc99a5b,KX-0.16,0.4,-0.75,bc);        // low bookcase after the window
  [0.14,0.47].forEach(function(y,i){box(0.006,0.3,0.94,0x2a2622,KX-0.3,y+0.13,-0.75,bc); K.books(bc,KX-0.2,y,-0.75,0.9,0.26,0.2,90+i);});
  K.tableLamp(bc,KX-0.16,0.8,-0.45,'L:bed2'); K.bush(bc,KX-0.16,0.8,-1.05,0.09); A.shop(bc,'Low bookcase','BILLY bookcase low oak','ikea');
  K.curtain(d,KX-0.07,AZ+1.3,0.2,false,0.2,2.35); K.curtain(d,KX-0.07,AZ+3.2,0.2,false,0.2,2.35);
  K.pendant(d,(l+KX)/2+0.5,2.3,-1.6,'L:bed2','rattan',null,1.8);
  K.pothos(d,kx-0.15,1.47,kz,0.5,17); K.bush(d,kx+0.2,1.47,kz,0.07);
  K.fiddle(d,KX-0.4,AZ+0.4,1.7,8);
});
K.onlyAll(K.frame('b_door',KX-0.9-bl,1.55,0.5,0.6,7,0xc99a5b).concat(K.frame('b_door',KX-1.6-bl,1.55,0.5,0.6,3,0xc99a5b)),'abc');

/* ---------- guest toilet: its door faces the living room, at a right angle to the bathroom door ---------- */
const tileWhite=canvasTex(128,128,function(g){g.fillStyle='#f6f6f3'; g.fillRect(0,0,128,128); g.strokeStyle='#d9dad6'; g.lineWidth=2; g.strokeRect(0,0,128,128);});
tileWhite.wrapS=tileWhite.wrapT=THREE.RepeatWrapping;
function tiled(k,y1){
  const w=A.walls[k], mk=function(u0,u1,a,b){const t=tileWhite.clone(); t.needsUpdate=true; t.repeat.set((u1-u0)/0.6,(b-a)/0.3); rect(k,u0,u1,a,b,A.MT(t,w.room),0.005);};
  A.spans(k).forEach(function(s){mk(s[0],s[1],0,y1);});
  w.holes.forEach(function(h){if(y1>2.06) mk(h[0],h[1],2.05,y1);});
}
inRoom('wc',function(){
  ['wc_n','wc_w','wc_e','wc_s'].forEach(function(k){tiled(k,1.2);});
  const mz=(WC.z0+WC.z1)/2;
  box(0.2,1.15,WC.z1-WC.z0,0xf6f6f3,WC.x1-0.1,0.575,mz);                 // cistern box with ledge
  box(0.5,0.34,0.36,0xfbfbfa,WC.x1-0.45,0.42,mz);
  box(0.01,0.16,0.2,0x3c4043,WC.x1-0.205,0.95,mz);
  box(0.4,0.12,0.24,0xfbfbfa,WC.x0+0.45,0.82,WC.z1-0.13); box(0.36,0.6,0.02,0xb9c9cf,WC.x0+0.45,1.5,WC.z1-0.012);   // basin and mirror, opposite the door
  cyl(0.07,0.1,0xe4dfd2,WC.x1-0.1,1.2,WC.z0+0.25);
  seat({id:'wc',label:'Guest toilet',room:'wc',x:WC.x1-0.5,z:mz,y:0.6,h:-R/2,type:'sit',hidden:true});
});

/* ---------- bathroom: sink on the right as you walk in, washing machine opposite it under the boiler,
   wall-hung toilet further along, shower at the end with its small window ---------- */
inRoom('bath',function(){
  ['ba_w','ba_n','ba_e','ba_s'].forEach(function(k){tiled(k,H);});
  A.windowOn('ba_e',1.2,1.7,1.75,2.25,1,0);                             // frosted window in the shower
  // vanity with a navy cabinet and mirror, on the wall shared with the guest toilet
  const vx=BA.x0+0.75, vz=BA.z1-0.23;
  box(0.8,0.5,0.44,0x26386b,vx,0.6,vz); box(0.84,0.1,0.47,0xfbfbfa,vx,0.88,vz+0.01);
  box(0.03,0.16,0.03,0xb9bdc0,vx,1.0,BA.z1-0.08);
  box(0.6,0.8,0.02,0xb9c9cf,vx,1.6,BA.z1-0.015); box(0.5,0.03,0.12,0xb98a4e,vx,1.15,BA.z1-0.07);
  // washing machine opposite the sink, laundry basket and bucket on top, boiler cabinet above
  const wx=BA.x0+0.55, wz=BA.z0+0.33;
  box(0.6,0.85,0.6,0xfbfbfa,wx,0.425,wz);
  A.torus(0.17,0.03,0xd7d9da,wx,0.42,wz+0.3); cyl(0.15,0.01,0x1a1c1f,wx,0.42,wz+0.302).rotation.x=R/2;
  box(0.36,0.22,0.3,0xf2f0ea,wx-0.1,0.96,wz); cyl(0.13,0.3,0x17181a,wx+0.2,1.0,wz-0.05,null,16,0.15);
  box(0.64,0.75,0.62,0xfbfbfa,wx,2.2,wz); cyl(0.012,0.5,0x2b2d30,wx+0.22,1.58,wz-0.2,null,6);
  // wall-hung toilet
  const tx=BA.x0+1.5;
  box(0.36,0.34,0.5,0xfbfbfa,tx,0.42,BA.z0+0.3); box(0.36,0.4,0.02,0xfbfbfa,tx,0.72,BA.z0+0.03);
  box(0.22,0.16,0.01,0x3c4043,tx,1.12,BA.z0+0.008); cyl(0.05,0.1,0xffffff,tx+0.4,0.8,BA.z0+0.06,null,12).rotation.z=R/2;
  // shower at the far end: glass screen, rain head, hand shower
  const glass=A.reg(new THREE.MeshLambertMaterial({color:0xcfe3e6,transparent:true,opacity:0.35}));
  const sx0=BA.x1-0.9, sz0=BA.z1-0.95;
  box(0.02,2.0,0.95,glass,sx0,1.0,BA.z1-0.475).castShadow=false;
  box(0.9,2.0,0.02,glass,BA.x1-0.45,1.0,sz0).castShadow=false;
  box(0.03,2.0,0.03,0xb9bdc0,sx0,1.0,sz0);
  box(0.3,0.02,0.3,0xb9bdc0,BA.x1-0.45,2.15,BA.z1-0.4); box(0.02,0.02,0.4,0xb9bdc0,BA.x1-0.45,2.17,BA.z1-0.2);  // rain head
  cyl(0.06,0.02,0xb9bdc0,BA.x1-0.6,1.1,BA.z1-0.02).rotation.x=R/2; box(0.02,0.5,0.02,0xb9bdc0,BA.x1-0.3,1.25,BA.z1-0.03);
  box(0.6,0.02,0.45,0x7fb59a,BA.x0+1.9,0.011,BA.z1-0.6).castShadow=false; // bath mat
});
A.showerSpot={x:BA.x1-0.45,z:BA.z1-0.45,ax:BA.x1-1.35,az:BA.z1-0.95};
})();
