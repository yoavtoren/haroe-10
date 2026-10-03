/* Haroe 10 — the apartment itself: walls, doors, windows, kitchen, bedrooms, bathroom, toilet */
(function(){
'use strict';
const A=window.APP, D=A.D, K=A.kit, W=D.W, L=D.L, H=D.H, KX=D.KX, KZ=D.KZ, AZ=A.AZ, SPLIT=A.SPLIT, BA=A.BA, WC=A.WC;
const box=A.box, cyl=A.cyl, sph=A.sph, M=A.M, inRoom=A.inRoom, wall=A.wall, rect=A.rect, G=A.G, scene=A.scene, canvasTex=A.canvasTex;
const R=Math.PI, SAGE=A.SAGE=0x8fbd9b, KGREEN=0x8f9f72;      // kitchen fronts: sage pushed toward yellow, greyer and darker
A.seats=[];            // places a person can sit or lie: {id,label,room,x,z,y,h,type,only}
function seat(s){A.seats.push(s); return s;}
A.seat=seat;

/* ---------- floors and ceilings ---------- */
A.slab(0,W,0,L,'living'); A.slab(W,KX,0,KZ,'kitchen');
A.slab(0,SPLIT-0.05,AZ,0,'bed1'); A.slab(SPLIT+0.05,KX,AZ,0,'bed2'); A.slab(WC.x0,WC.x1,WC.z0,WC.z1,'wc');
(function(){   // bathroom floor: patterned 20 cm tiles
  const t=canvasTex(128,128,function(g){g.fillStyle='#e9e6de'; g.fillRect(0,0,128,128); g.strokeStyle='#5d5a55'; g.lineWidth=7;
    g.beginPath(); g.arc(64,64,34,0,7); g.stroke(); g.lineWidth=5;
    [[0,0],[128,0],[0,128],[128,128]].forEach(function(p){g.beginPath(); g.arc(p[0],p[1],38,0,7); g.stroke();});
    g.fillStyle='#5d5a55'; g.beginPath(); g.moveTo(64,44); g.lineTo(84,64); g.lineTo(64,84); g.lineTo(44,64); g.fill();});
  t.wrapS=t.wrapT=THREE.RepeatWrapping; A.floorQuad(BA.x0,BA.x1,BA.z0,BA.z1,t,0.2,'bath');
  box(0.8,0.02,0.12,M(0xcfd2cd,'bath'),W+1.25,-0.008,(BA.z1+WC.z0)/2).castShadow=false;     // threshold between toilet and bathroom
})();
A.ceil('living',0,W,0,L); A.ceil('kitchen',W,KX,0,KZ); A.ceil('bed1',0,SPLIT-0.05,AZ,0); A.ceil('bed2',SPLIT+0.05,KX,AZ,0);
A.ceil('bath',BA.x0,BA.x1,BA.z0,BA.z1); A.ceil('wc',WC.x0,WC.x1,WC.z0,WC.z1);

/* ---------- walls ---------- */
const d1=D.door1, d2=D.door2, en=D.entrance, wcU=[D.wcDoor[0]-KZ,D.wcDoor[1]-KZ], bl=SPLIT+0.05;
wall('far',  [0,0],  [W,0],  [0,1], 'living',{holes:[[d1[0],d1[1]],[d2[0],d2[1]]]});   // bedroom doors
wall('kfar', [W,0],  [KX,0], [0,1], 'kitchen');                                         // cooktop wall
wall('left', [0,0],  [0,L],  [1,0], 'living');                                          // sofa wall
wall('end',  [0,L],  [W,L],  [0,-1],'living',{holes:[[en[0],en[1]]]});                  // entrance wall
wall('tv',   [W,KZ], [W,L],  [-1,0],'living',{holes:[wcU]});                            // TV wall
wall('kback',[W,KZ], [KX,KZ],[0,-1],'kitchen');                                         // kitchen sink wall
wall('win',  [KX,0], [KX,KZ],[-1,0],'kitchen');                                         // kitchen window wall
wall('a_door',[0,0],[SPLIT-0.05,0],[0,-1],'bed1',{holes:[[d1[0],d1[1]]]});
wall('a_l',[0,0],[0,AZ],[1,0],'bed1'); wall('a_far',[0,AZ],[SPLIT-0.05,AZ],[0,1],'bed1'); wall('a_r',[SPLIT-0.05,AZ],[SPLIT-0.05,0],[-1,0],'bed1');
wall('b_door',[bl,0],[KX,0],[0,-1],'bed2',{holes:[[d2[0]-bl,d2[1]-bl]]});
wall('b_l',[bl,0],[bl,AZ],[1,0],'bed2'); wall('b_far',[bl,AZ],[KX,AZ],[0,1],'bed2'); wall('b_r',[KX,AZ],[KX,0],[-1,0],'bed2');
wall('wc_door',[WC.x0,WC.z0],[WC.x0,WC.z1],[1,0],'wc',{holes:[[D.wcDoor[0]-WC.z0,D.wcDoor[1]-WC.z0]]});
wall('wc_n',[WC.x0,WC.z0],[WC.x1,WC.z0],[0,1],'wc',{holes:[[0.9,1.6]]});
wall('wc_far',[WC.x1,WC.z0],[WC.x1,WC.z1],[-1,0],'wc'); wall('wc_s',[WC.x0,WC.z1],[WC.x1,WC.z1],[0,-1],'wc');
wall('ba_door',[BA.x0,BA.z1],[BA.x1,BA.z1],[0,-1],'bath',{holes:[[0.9,1.6]]});
wall('ba_l',[BA.x0,BA.z0],[BA.x0,BA.z1],[1,0],'bath'); wall('ba_far',[BA.x0,BA.z0],[BA.x1,BA.z0],[0,1],'bath'); wall('ba_r',[BA.x1,BA.z0],[BA.x1,BA.z1],[-1,0],'bath');

/* ---------- doors: frames on both sides, a hinged leaf in between ---------- */
A.doorFrame('far',d1[0],d1[1]); A.doorFrame('far',d2[0],d2[1]); A.doorFrame('a_door',d1[0],d1[1]); A.doorFrame('b_door',d2[0]-bl,d2[1]-bl);
A.doorFrame('end',en[0],en[1]); A.doorFrame('tv',wcU[0],wcU[1]); A.doorFrame('wc_door',D.wcDoor[0]-WC.z0,D.wcDoor[1]-WC.z0);
A.doorFrame('wc_n',0.9,1.6); A.doorFrame('ba_door',0.9,1.6);
A.doorLeaf('bed1',d1[1],0,R,R/2,'living');
A.doorLeaf('bed2',d2[1],0,R,R/2,'living');
A.doorLeaf('wc',W,D.wcDoor[0],-R/2,-R,'living');
A.doorLeaf('bath',W+1.6,(BA.z1+WC.z0)/2,R,R/2,'wc',0.7);
A.doorLeaf('entrance',en[0],L,0,R/2,'living',0.9);

/* ---------- living room: fixed things on the walls ---------- */
(function(){const p=D.painting;                                     // bus canvas 127 x 95 cm
  rect('far',p[0],p[1],p[2],p[3],0xd9d6cc,0.006); rect('far',p[0]+0.015,p[1]-0.015,p[2]+0.015,p[3]-0.015,0xefece3,0.008);
  const cx=(p[0]+p[1])/2, cy=(p[2]+p[3])/2;
  rect('far',cx-0.33,cx+0.33,cy-0.1,cy+0.14,0x7fc4b5,0.010); rect('far',cx-0.33,cx+0.33,cy-0.13,cy-0.09,0x4f9a8b,0.011);
  rect('far',cx-0.30,cx-0.02,cy-0.02,cy+0.1,0xcfe9e3,0.012); rect('far',cx+0.02,cx+0.3,cy-0.02,cy+0.1,0xcfe9e3,0.012);
  [cx-0.22,cx+0.2].forEach(function(u){rect('far',u-0.045,u+0.045,cy-0.17,cy-0.09,0x2a2d2f,0.012);});
})();
rect('end',0.5,0.8,1.55,1.95,0xe6e9e5,0.008); rect('end',0.52,0.78,1.57,1.93,0xf2f4f1,0.009); // electrical panel
rect('end',1.02,1.12,1.35,1.5,0xd9dcd8,0.008);                              // intercom
rect('tv',1.45,1.53,1.25,1.37,0xdfe2de,0.008);                              // light switch
inRoom('living',function(){
  const n=G(null,'n');
  K.ceilDisc(n,W/2,3.0,'L:living');                                        // today's ceiling light
  // entrance end: wardrobe and vacuum, on the end wall next to the TV corner
  box(0.9,1.75,0.45,0xf8f8f6,2.75,0.875,L-0.225); box(0.006,1.7,0.004,0xc5c9c5,2.75,0.875,L-0.452);
  [2.71,2.79].forEach(function(x){box(0.012,0.12,0.02,0xc9cdc9,x,0.95,L-0.46);});
  box(0.42,0.3,0.36,0x2b2f38,2.55,1.9,L-0.23,n); box(0.3,0.24,0.3,0xc23a4a,2.97,1.87,L-0.22,n);
  box(0.12,1.05,0.14,0x2c2f33,3.32,0.55,L-0.14); box(0.24,0.08,0.26,0x2c2f33,3.32,0.04,L-0.18);
});

/* ---------- kitchen ---------- */
const brick=function(rows,cols){const t=canvasTex(256,256,function(g){g.fillStyle='#f3f1ea'; g.fillRect(0,0,256,256); g.strokeStyle='#d5d2c8'; g.lineWidth=2;
  for(let r=0;r<rows;r++){const y=r*256/rows; g.beginPath(); g.moveTo(0,y); g.lineTo(256,y); g.stroke();
    for(let c=0;c<=cols;c++){const x=(c+(r%2?0.5:0))*256/cols; g.beginPath(); g.moveTo(x,y); g.lineTo(x,y+256/rows); g.stroke();}}}); return A.MT(t,'kitchen');};
rect('kback',0.75,2.6,0.92,1.47,brick(4,8),0.006);                          // sink backsplash
rect('kfar',0.75,KX-W,0.92,1.55,brick(5,7),0.006);                          // cooktop backsplash
rect('kfar',KX-W-0.6,KX-W-0.42,1.85,2.1,0x9aa3ad,0.008); rect('kfar',KX-W-0.32,KX-W-0.14,1.85,2.1,0xc98b6b,0.008); // posters
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
  const sage=function(){return A.reg(new THREE.MeshLambertMaterial({color:KGREEN,emissive:0x1e2218}));};   // lifted a little so it reads as pastel on the shaded fronts
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
  const photos=canvasTex(128,256,function(g){g.fillStyle='#f7f7f5'; g.fillRect(0,0,128,256);
    const cs=['#5b4a42','#8a6f5e','#3c4a55','#a58b76','#6d7f6a','#2f3438','#b49c8c'];
    for(let r=0;r<14;r++)for(let c=0;c<5;c++){g.fillStyle=cs[(r*3+c*5+r*c)%cs.length]; g.fillRect(6+c*24,6+r*17.6,20,14);}});
  const ph=new THREE.Mesh(new THREE.PlaneGeometry(0.62,1.5),A.MT(photos));
  ph.position.set(fx-0.352,0.98,fz); ph.rotation.y=-Math.PI/2; scene.add(ph);
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
});

/* ---------- bedroom 1 (the smaller one): today desk + bed, redesigned as a study with two desks ---------- */
A.windowOn('a_far',0.6,2.0,1.0,2.1,3,0,'bed1');
A.sunPatch('bed1',1.3,AZ+0.05,1.3,2.6,0);
inRoom('bed1',function(){
  const n=G(null,'n'), d=G(null,'abc'), r=SPLIT-0.05;
  box(0.85,0.28,0.2,0xf6f7f5,1.3,2.5,AZ+0.11);                          // air conditioner
  box(1.2,0.03,0.6,0xd9bf8c,0.75,0.74,AZ+0.32);                         // desk under the window
  [[0.18,AZ+0.05],[1.32,AZ+0.05],[0.18,AZ+0.59],[1.32,AZ+0.59]].forEach(function(p){box(0.03,0.73,0.03,0xf2f2f0,p[0],0.365,p[1]);});
  box(0.56,0.33,0.03,0x111315,0.8,1.08,AZ+0.16); box(0.2,0.14,0.12,0x111315,0.8,0.83,AZ+0.16); // monitor
  box(0.5,0.08,0.5,0xd8d8d2,0.8,0.48,AZ+0.95); box(0.46,0.6,0.06,0xd8d8d2,0.8,0.85,AZ+1.2); cyl(0.03,0.4,0x8d9092,0.8,0.24,AZ+0.95); cyl(0.28,0.04,0x8d9092,0.8,0.04,AZ+0.95); // chair
  seat({id:'desk1',label:'Desk by the window',room:'bed1',x:0.8,z:AZ+0.95,y:0.52,h:R,type:'sit'});
  // today: bed along the right wall
  box(1.2,0.22,2.0,0xc9a66b,r-0.62,0.2,AZ+1.02,n); box(1.2,0.2,2.0,0xd9c7b0,r-0.62,0.41,AZ+1.02,n); box(0.6,0.1,0.38,0xe9e2d4,r-0.62,0.56,AZ+0.3,n);
  seat({id:'bed1',label:'Bed (bedroom 1)',room:'bed1',x:r-0.62,z:AZ+1.1,y:0.51,h:0,type:'lie',only:'n'});
  K.ceilDisc(n,1.25,-2.0,'L:bed1');
  box(0.6,2.3,1.6,0xe9dfcf,r-0.3,1.15,-1.1);                            // wardrobe
  [-1.6,-1.07,-0.55].forEach(function(z){box(0.004,2.26,0.006,0xcfc4b2,r-0.602,1.15,z);});
  [0.25,0.5,0.75].forEach(function(y){box(0.02,0.012,0.3,0xa9a59c,r-0.61,y,-0.82);});
  [-1.2,-1.0].forEach(function(z){box(0.02,0.2,0.014,0xa9a59c,r-0.61,1.25,z);});
  // redesign: second desk where the bed was, shelves, lamps, rug, plants
  const dz=-2.75;
  box(0.65,0.035,1.3,0xc99a5b,r-0.335,0.74,dz,d);
  [[r-0.62,dz-0.61],[r-0.05,dz-0.61],[r-0.62,dz+0.61],[r-0.05,dz+0.61]].forEach(function(p){box(0.035,0.72,0.035,0x22262a,p[0],0.36,p[1],d);});
  box(0.03,0.36,0.62,0x111315,r-0.16,1.1,dz-0.1,d); box(0.1,0.16,0.18,0x111315,r-0.16,0.84,dz-0.1,d);   // monitor
  box(0.14,0.012,0.4,0xe9e9e6,r-0.42,0.765,dz-0.1,d); box(0.24,0.012,0.32,0xb9bdc0,r-0.35,0.765,dz+0.42,d); // keyboard, laptop
  const lid=box(0.012,0.22,0.32,0xb9bdc0,r-0.22,0.87,dz+0.42,d); lid.rotation.z=-0.25;
  const ch=G(d); ch.position.set(1.42,0,dz); K.officeChair(ch,0x2f7d4f);
  seat({id:'desk2',label:'New desk',room:'bed1',x:1.42,z:dz,y:0.52,h:R/2,type:'sit',only:'abc'});
  [1.32,1.68].forEach(function(y,i){box(0.22,0.03,1.2,0xc99a5b,r-0.11,y,dz,d); K.books(d,r-0.12,y+0.015,dz-0.25+i*0.5,0.5,0.22,0.16,71+i);});
  K.bush(d,r-0.12,1.335,dz+0.45,0.07); cyl(0.05,0.18,0xc4673f,r-0.12,1.785,dz-0.4,d,12,0.03);
  K.deskLamp(d,r-0.2,0.758,dz-0.52,'L:bed1',R*0.75); K.deskLamp(d,0.28,0.755,AZ+0.2,'L:bed1',-0.4);
  K.pendant(d,1.2,2.3,-2.1,'L:bed1','rattan',null,1.6);
  const rg=G(d); rg.position.set(0.95,0,-1.75); K.rug(rg,1.3,1.9,'wool');
  K.snake(d,0.2,-0.35,0.75); K.bush(d,1.2,0.755,AZ+0.12,0.06,0xc4673f);
  K.curtain(d,0.47,AZ+0.07,0.24,true,0.25,2.3); K.curtain(d,2.13,AZ+0.07,0.24,true,0.25,2.3);
  box(0.02,0.5,0.7,0xcfa97a,0.012,1.45,-3.0,d);                         // cork board on the left wall
  [[1.52,-3.18,0xf3ebdc],[1.58,-2.95,0xd6a21e],[1.36,-3.05,0x8fbd9b],[1.4,-2.82,0xe3b7a0]].forEach(function(q){box(0.006,0.12,0.14,q[2],0.026,q[0],q[1],d);});
});
K.onlyAll(K.frame('a_l',1.2,1.5,0.5,0.65,9,0xc99a5b).concat(K.frame('a_l',1.85,1.5,0.5,0.65,6,0xc99a5b)),'abc');

/* ---------- bedroom 2: bed in the far-left corner, big window on the right wall ---------- */
A.windowOn('b_far',0.5,1.25,1.25,2.0,1,0,'bed2');                      // small window above the bed
A.windowOn('b_r',0.7,2.5,0.95,2.2,2,6,'bed2');                         // big window with bars
A.sunPatch('bed2',KX-0.05,-2.4,1.7,3.0,-R/2);
inRoom('bed2',function(){
  const n=G(null,'n'), d=G(null,'abc'), l=bl;
  box(1.5,0.14,2.0,0xc9a66b,l+0.78,0.1,AZ+1.02); box(1.5,0.22,2.0,0xf1efec,l+0.78,0.3,AZ+1.02); box(1.3,0.1,0.4,0xfafafa,l+0.78,0.46,AZ+0.3); // bed on pallets
  seat({id:'bedL',label:'Bed, wall side',room:'bed2',x:l+0.45,z:AZ+1.12,y:0.41,h:0,type:'lie'});
  seat({id:'bedR',label:'Bed, room side',room:'bed2',x:l+1.12,z:AZ+1.12,y:0.41,h:0,type:'lie'});
  box(0.4,0.4,0.35,0xb98a4e,l+1.78,0.2,AZ+0.22);                        // bedside table
  box(1.0,0.58,0.04,0x25272b,l+2.4,1.75,AZ+0.25).rotation.y=-0.3;       // TV on a wall arm
  box(0.06,0.06,0.25,0x25272b,l+2.5,1.75,AZ+0.12);
  (function(){const g=G(); g.position.set(l+2.35,0,AZ+0.5); g.rotation.y=0.12;      // bike
    [-0.52,0.52].forEach(function(x){A.torus(0.33,0.025,0x1b1c1e,x,0.36,0,g);});
    const a=box(0.62,0.04,0.04,0xc2362c,-0.18,0.62,0,g); a.rotation.z=0.5; const b=box(0.62,0.04,0.04,0xc2362c,0.2,0.62,0,g); b.rotation.z=-0.55;
    box(0.7,0.04,0.04,0x1b1c1e,0.02,0.83,0,g); box(0.04,0.04,0.56,0xd98a2b,0.42,0.98,0,g); box(0.2,0.05,0.1,0x1b1c1e,-0.3,0.92,0,g);})();
  // today: pine desk under the big window
  box(0.7,0.05,1.7,0xd2b07a,KX-0.36,0.74,-2.35,n);
  [-3.15,-1.55].forEach(function(z){box(0.08,0.72,0.08,0xd2b07a,KX-0.66,0.36,z,n); box(0.08,0.72,0.08,0xd2b07a,KX-0.08,0.36,z,n);});
  box(0.04,0.36,0.62,0x111315,KX-0.2,1.1,-2.3,n); box(0.14,0.14,0.2,0x111315,KX-0.2,0.84,-2.3,n);
  box(0.5,0.08,0.5,0x2a2d31,KX-1.1,0.48,-2.4,n); box(0.06,0.6,0.46,0x2a2d31,KX-1.36,0.85,-2.4,n); cyl(0.03,0.4,0x2a2d31,KX-1.1,0.24,-2.4,n); cyl(0.3,0.04,0x2a2d31,KX-1.1,0.04,-2.4,n);
  seat({id:'desk3',label:'Desk (bedroom 2)',room:'bed2',x:KX-1.1,z:-2.4,y:0.52,h:R/2,type:'sit',only:'n'});
  K.ceilDisc(n,(l+KX)/2,-2.0,'L:bed2');
  box(1.17,1.9,0.5,0xf8f8f6,KX-1.55,0.95,-0.25);                        // 3-door wardrobe with mirror
  [KX-1.94,KX-1.55,KX-1.16].forEach(function(x){box(0.37,1.82,0.006,0xfdfdfb,x,0.97,-0.503);}); box(0.12,1.4,0.004,0xb9c6cc,KX-1.55,1.05,-0.508);
  box(0.5,0.3,0.4,0x202a44,KX-1.75,2.05,-0.25,n); box(0.4,0.3,0.36,0x3b3d40,KX-1.25,2.05,-0.25,n);
  box(0.8,1.0,0.45,0xc7a878,KX-0.5,0.5,-0.225); [0.34,0.67].forEach(function(y){box(0.78,0.012,0.006,0x7d674a,KX-0.5,y,-0.452);}); // dresser
  box(0.39,1.47,0.77,0xfafaf8,l+0.2,0.735,-1.75);                       // 2 x 4 cube shelf
  [0.37,0.735,1.1].forEach(function(y){box(0.006,0.02,0.73,0xcfd2ce,l+0.397,y,-1.75);}); box(0.006,1.43,0.02,0xcfd2ce,l+0.397,0.735,-1.75);
  box(0.3,H,0.3,M(0xf5f6f3),l+0.75,H/2,-1.25);                          // column
  box(0.8,0.1,0.25,0x3b8f8a,l+0.1,0.06,-2.6).rotation.y=0.3;            // skateboard
  // redesign: reading nook where the desk was, softer bed, layered light
  const nk=G(d); nk.position.set(KX-0.8,0,-2.55); nk.rotation.y=R-0.5; K.armchair(nk,0x2f7d4f,0x24623f);
  K.cushion(nk,0xd6a21e,-0.12,0.62,0.05,0.9,0.35);
  seat({id:'nook',label:'Reading nook',room:'bed2',x:KX-0.8,z:-2.55,y:0.43,h:R-0.5+R/2,type:'sit',only:'abc',recline:0.2});
  const fl=G(d); fl.position.set(KX-0.28,0,-3.3); K.floorLamp(fl,'L:bed2');
  K.roundRug(d,KX-1.0,-2.5,0.95,0xcbb890,0xe7dcc4);
  cyl(0.2,0.03,0xc99a5b,KX-1.28,0.5,-3.15,d,24); cyl(0.02,0.5,0x22262a,KX-1.28,0.25,-3.15,d,8); cyl(0.14,0.02,0x22262a,KX-1.28,0.01,-3.15,d,16);   // side table
  K.bookStack(d,KX-1.3,0.515,-3.17,3,5); cyl(0.04,0.08,0xf3ebdc,KX-1.2,0.555,-3.05,d,12);
  const pf=G(d); pf.position.set(KX-1.5,0,-2.2); K.pouf(pf,0xd6a21e);
  box(0.3,0.8,1.2,0xc99a5b,KX-0.16,0.4,-1.35,d);                        // low bookcase by the window
  [0.14,0.47].forEach(function(y,i){box(0.006,0.3,1.14,0x2a2622,KX-0.3,y+0.13,-1.35,d); K.books(d,KX-0.2,y,-1.35,1.1,0.26,0.2,90+i);});
  K.tableLamp(d,KX-0.16,0.8,-0.95,'L:bed2'); K.bush(d,KX-0.16,0.8,-1.7,0.09);
  K.fiddle(d,KX-0.34,-3.68,1.75,8);
  K.curtain(d,KX-0.07,-3.42,0.26,false,0.2,2.35); K.curtain(d,KX-0.07,-1.38,0.26,false,0.2,2.35);
  const rg=G(d); rg.position.set(l+1.7,0,-2.75); K.rug(rg,1.3,2.2,'stripe');
  box(1.52,0.05,0.7,SAGE,l+0.78,0.435,AZ+1.6,d);                        // throw across the bed
  box(0.36,0.14,0.3,0xd6a21e,l+0.5,0.5,AZ+0.62,d); box(0.36,0.14,0.3,0xc4673f,l+1.08,0.5,AZ+0.62,d);
  box(1.5,0.55,0.05,0xc99a5b,l+0.78,0.72,AZ+0.035,d);                   // headboard
  K.tableLamp(d,l+1.78,0.4,AZ+0.22,'L:bed2');
  K.pendant(d,(l+KX)/2,2.3,-2.0,'L:bed2','rattan',null,1.8);
});
K.onlyAll(K.frame('b_l',1.75,1.95,0.55,0.4,4,0xc99a5b).concat(K.frame('b_door',KX-0.5-bl,1.55,0.5,0.6,7,0xb08d4a)),'abc');

/* ---------- toilet room: unchanged ---------- */
const tileWhite=canvasTex(128,128,function(g){g.fillStyle='#f6f6f3'; g.fillRect(0,0,128,128); g.strokeStyle='#d9dad6'; g.lineWidth=2; g.strokeRect(0,0,128,128);});
tileWhite.wrapS=tileWhite.wrapT=THREE.RepeatWrapping;
function tiled(k,y1){
  const w=A.walls[k], mk=function(u0,u1,a,b){const t=tileWhite.clone(); t.needsUpdate=true; t.repeat.set((u1-u0)/0.6,(b-a)/0.3); rect(k,u0,u1,a,b,A.MT(t,w.room),0.005);};
  A.spans(k).forEach(function(s){mk(s[0],s[1],0,y1);});
  w.holes.forEach(function(h){if(y1>2.06) mk(h[0],h[1],2.05,y1);});
}
inRoom('wc',function(){
  ['wc_door','wc_n','wc_far','wc_s'].forEach(function(k){tiled(k,1.2);});
  const mz=(WC.z0+WC.z1)/2;
  box(0.2,1.15,WC.z1-WC.z0,0xf6f6f3,WC.x1-0.1,0.575,mz);                 // cistern box with ledge
  box(0.5,0.34,0.36,0xfbfbfa,WC.x1-0.45,0.42,mz);
  box(0.01,0.16,0.2,0x3c4043,WC.x1-0.205,0.95,mz);
  box(0.02,0.36,0.3,0x2c2f33,WC.x1-0.13,1.33,WC.z1-0.35); cyl(0.07,0.1,0xe4dfd2,WC.x1-0.1,1.2,WC.z0+0.25);
  box(0.4,0.12,0.24,0xfbfbfa,WC.x0+0.6,0.82,WC.z1-0.13); box(0.36,0.6,0.02,0xb9c9cf,WC.x0+0.6,1.5,WC.z1-0.012);
  seat({id:'wc',label:'Guest toilet',room:'wc',x:WC.x1-0.5,z:mz,y:0.6,h:-R/2,type:'sit',hidden:true});
});

/* ---------- bathroom: unchanged ---------- */
inRoom('bath',function(){
  ['ba_door','ba_l','ba_far','ba_r'].forEach(function(k){tiled(k,H);});
  A.windowOn('ba_far',1.0,1.5,1.75,2.3,1,0); A.windowOn('ba_r',0.25,0.7,1.8,2.3,1,0);
  box(0.6,0.85,0.6,0xfbfbfa,BA.x0+0.33,0.425,BA.z1-0.33);               // washing machine
  A.torus(0.17,0.03,0xd7d9da,BA.x0+0.63,0.42,BA.z1-0.33).rotation.y=Math.PI/2;
  cyl(0.15,0.01,0x1a1c1f,BA.x0+0.632,0.42,BA.z1-0.33).rotation.z=Math.PI/2;
  cyl(0.19,0.36,0x17181a,BA.x0+0.3,1.03,BA.z1-0.4); box(0.36,0.2,0.3,0xf2f0ea,BA.x0+0.3,0.95,BA.z1-0.15);
  // shower in the far corner, striped glass screen
  const glass=A.reg(new THREE.MeshLambertMaterial({color:0xcfe3e6,transparent:true,opacity:0.35}));
  const sx0=BA.x1-1.0, sz1=BA.z0+0.95;
  box(0.02,2.0,0.95,glass,sx0,1.0,BA.z0+0.475).castShadow=false;
  box(1.0,2.0,0.02,glass,BA.x1-0.5,1.0,sz1).castShadow=false;
  [0.9,1.0,1.1,1.3,1.4].forEach(function(y){box(0.024,0.03,0.95,0xe8eef0,sx0,y,BA.z0+0.475); box(1.0,0.03,0.024,0xe8eef0,BA.x1-0.5,y,sz1);});
  box(0.03,2.0,0.03,0xb9bdc0,sx0,1.0,sz1);
  box(0.3,0.02,0.3,0xb9bdc0,BA.x1-0.5,2.15,BA.z0+0.45); box(0.35,0.02,0.02,0xb9bdc0,BA.x1-0.2,2.17,BA.z0+0.45);  // rain head
  cyl(0.06,0.02,0xb9bdc0,BA.x1-0.02,1.1,BA.z0+0.6).rotation.z=Math.PI/2; box(0.02,0.7,0.02,0xb9bdc0,BA.x1-0.03,1.2,BA.z0+0.3);
  // wall-hung toilet straight ahead
  box(0.36,0.34,0.5,0xfbfbfa,BA.x0+1.25,0.42,BA.z0+0.3); box(0.36,0.4,0.02,0xfbfbfa,BA.x0+1.25,0.72,BA.z0+0.03);
  box(0.22,0.16,0.01,0x3c4043,BA.x0+1.25,1.12,BA.z0+0.008);
  // vanity on the right wall with a navy cabinet and mirror
  box(0.44,0.5,0.8,0x26386b,BA.x0+0.23,0.6,BA.z0+1.0); box(0.47,0.1,0.84,0xfbfbfa,BA.x0+0.24,0.88,BA.z0+1.0);
  box(0.03,0.16,0.03,0xb9bdc0,BA.x0+0.08,1.0,BA.z0+1.0);
  box(0.02,0.8,0.6,0xb9c9cf,BA.x0+0.015,1.6,BA.z0+1.0); box(0.12,0.03,0.5,0xb98a4e,BA.x0+0.07,1.15,BA.z0+1.0);
  box(0.3,0.6,0.6,0x26386b,BA.x0+0.16,1.95,BA.z0+1.0);                 // navy wall cabinet
  box(0.45,0.02,0.6,0x7fb59a,BA.x0+1.15,0.011,BA.z0+1.2).castShadow=false; // bath mat
});
A.showerSpot={x:BA.x1-0.5,z:BA.z0+0.5,ax:BA.x1-1.3,az:BA.z0+1.3};
})();
