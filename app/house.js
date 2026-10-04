/* Haroe 10 — the apartment itself: walls, doors, windows, kitchen, bedrooms, bathroom, toilet */
(function(){
'use strict';
const A=window.APP, D=A.D, K=A.kit, W=D.W, L=D.L, H=D.H, KX=D.KX, KZ=D.KZ, ZW=D.ZW, BLK=D.BLK, BX=D.BX, NX=D.NX, NZ=D.NZ, AZ=A.AZ, SPLIT=A.SPLIT, BA=A.BA, WC=A.WC;
const box=A.box, cyl=A.cyl, sph=A.sph, M=A.M, inRoom=A.inRoom, wall=A.wall, rect=A.rect, G=A.G, scene=A.scene, canvasTex=A.canvasTex;
const R=Math.PI, SAGE=A.SAGE=0x8fbd9b, BLUE=A.BLUE=0x9fc4d6, KGREEN=0x7b8a60;      // kitchen fronts: a muted, yellowish, fairly deep sage
A.seats=[];            // places a person can sit or lie: {id,label,room,x,z,y,h,type,only}
function seat(s){A.seats.push(s); return s;}
A.seat=seat;
/* things you can buy: tap one in Design to get a link. site 'ikea' searches IKEA Israel, anything else searches the web. */
A.shops=[];
A.shop=function(o,name,q,site,note){o.userData.shop={name:name,q:q,site:site||'ikea',note:note||''}; A.shops.push(o); return o;};

/* ---------- floors and ceilings ---------- */
const bl=SPLIT+0.05, r2=SPLIT-0.05, rn=NX-0.05;       // bedroom 2 left wall; bedroom 1 right wall at the back; and beside the niche
[['living',0,W,0,ZW],['living',0,BLK,ZW,L],['kitchen',W,KX,0,KZ],['bed1',0,rn,NZ,0],['bed1',0,r2,AZ,NZ],
 ['bed2',bl,BX,AZ,0],['bed2',NX,bl,NZ,0],['wc',WC.x0,WC.x1,WC.z0,WC.z1]].forEach(function(q){A.slab(q[1],q[2],q[3],q[4],q[0]); A.ceil(q[0],q[1],q[2],q[3],q[4]);});
(function(){   // bathroom floor: patterned 20 cm tiles
  const t=canvasTex(128,128,function(g){g.fillStyle='#e9e6de'; g.fillRect(0,0,128,128); g.strokeStyle='#6f6a62'; g.lineWidth=7;
    g.beginPath(); g.arc(64,64,34,0,7); g.stroke(); g.lineWidth=5;
    [[0,0],[128,0],[0,128],[128,128]].forEach(function(p){g.beginPath(); g.arc(p[0],p[1],38,0,7); g.stroke();});
    g.fillStyle='#6f6a62'; g.beginPath(); g.moveTo(64,44); g.lineTo(84,64); g.lineTo(64,84); g.lineTo(44,64); g.fill();});
  t.wrapS=t.wrapT=THREE.RepeatWrapping; A.floorQuad(BA.x0,BA.x1,BA.z0,BA.z1,t,0.2,'bath');
})();
A.ceil('bath',BA.x0,BA.x1,BA.z0,BA.z1);

/* ---------- walls ---------- */
const d1=D.door1, d2=D.door2, en=D.entrance, bd=D.bathDoor, wd=D.wcDoor;
wall('far',  [0,0],  [KX,0], [0,1], 'living',{holes:[[d1[0],d1[1]],[d2[0],d2[1]]]});   // bedroom doors, then the cooktop
wall('left', [0,0],  [0,L],  [1,0], 'living');                                          // sofa wall
wall('end',  [0,L],  [BLK,L],[0,-1],'living',{holes:[[en[0],en[1]]]});                  // entrance wall
wall('tv',   [W,KZ], [W,ZW], [-1,0],'living',{holes:[[bd[0]-KZ,bd[1]-KZ]]});            // TV wall: 0.8 m from the fridge side to the bathroom door
wall('blk_n',[BLK,ZW],[W,ZW],[0,-1],'living',{holes:[[wd[0]-BLK,wd[1]-BLK]]});          // guest toilet door, at a right angle to it
wall('blk_w',[BLK,ZW],[BLK,L],[-1,0],'living');                                         // side of the toilet block, by the entrance
wall('kback',[W,KZ], [KX,KZ],[0,-1],'kitchen');                                         // kitchen sink wall
wall('win',  [KX,0], [KX,KZ],[-1,0],'kitchen',{wins:[[0.6,2.0,0.1,2.25]]});                                         // kitchen window wall
wall('a_door',[0,0],[rn,0],[0,-1],'bed1',{holes:[[d1[0],d1[1]]]});
wall('a_l',[0,0],[0,AZ],[1,0],'bed1'); wall('a_far',[0,AZ],[r2,AZ],[0,1],'bed1',{wins:[[0.6,1.9,1.05,2.05]]});
wall('a_r',[r2,AZ],[r2,NZ],[-1,0],'bed1'); wall('a_ret',[rn,NZ],[r2,NZ],[0,-1],'bed1'); wall('a_rn',[rn,NZ],[rn,0],[-1,0],'bed1');
wall('b_door',[NX,0],[BX,0],[0,-1],'bed2',{holes:[[d2[0]-NX,d2[1]-NX]]});
wall('b_nb',[NX,0],[NX,NZ],[1,0],'bed2'); wall('b_ret',[NX,NZ],[bl,NZ],[0,1],'bed2');  // the wardrobe niche
wall('b_l',[bl,NZ],[bl,AZ],[1,0],'bed2'); wall('b_far',[bl,AZ],[BX,AZ],[0,1],'bed2',{wins:[[0.8,1.5,1.3,1.95]]}); wall('b_r',[BX,AZ],[BX,0],[-1,0],'bed2',{wins:[[2.35,3.95,1.0,2.15]]});
wall('wc_n',[WC.x0,WC.z0],[WC.x1,WC.z0],[0,1],'wc',{holes:[[wd[0]-WC.x0,wd[1]-WC.x0]]});
wall('wc_w',[WC.x0,WC.z0],[WC.x0,WC.z1],[1,0],'wc'); wall('wc_e',[WC.x1,WC.z0],[WC.x1,WC.z1],[-1,0],'wc'); wall('wc_s',[WC.x0,WC.z1],[WC.x1,WC.z1],[0,-1],'wc');
wall('ba_w',[BA.x0,BA.z0],[BA.x0,BA.z1],[1,0],'bath',{holes:[[bd[0]-BA.z0,bd[1]-BA.z0]]});
wall('ba_n',[BA.x0,BA.z0],[BA.x1,BA.z0],[0,1],'bath'); wall('ba_e',[BA.x1,BA.z0],[BA.x1,BA.z1],[-1,0],'bath',{wins:[[(bd[0]+bd[1])/2-BA.z0-0.25,(bd[0]+bd[1])/2-BA.z0+0.25,1.65,2.15],[0.3,0.7,1.8,2.2]]}); wall('ba_s',[BA.x0,BA.z1],[BA.x1,BA.z1],[0,-1],'bath');

/* ---------- doors: frames on both sides, a hinged leaf in between ---------- */
A.doorFrame('far',d1[0],d1[1]); A.doorFrame('far',d2[0],d2[1]); A.doorFrame('a_door',d1[0],d1[1]); A.doorFrame('b_door',d2[0]-NX,d2[1]-NX);
A.doorFrame('end',en[0],en[1]); A.doorFrame('tv',bd[0]-KZ,bd[1]-KZ); A.doorFrame('ba_w',bd[0]-BA.z0,bd[1]-BA.z0);
A.doorFrame('blk_n',wd[0]-BLK,wd[1]-BLK); A.doorFrame('wc_n',wd[0]-WC.x0,wd[1]-WC.x0);
A.doorLeaf('bed1',d1[1],0,R,R/2,'living',0.78);
A.doorLeaf('bed2',d2[1],0,R,R/2,'living',0.78);
A.doorLeaf('bath',W,bd[0],-R/2,0,'living',bd[1]-bd[0]);  // hinged on the left as you walk in, swings into the bathroom
A.doorLeaf('wc',wd[1],ZW,R,R/2,'living',0.65);             // swings out into the living room
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
rect('tv',0.3,0.38,1.25,1.37,0xdfe2de,0.008);                           // light switch
inRoom('living',function(){
  const n=G(null,'n');
  K.ceilDisc(null,W/2,3.2,'L:living'); K.ceilDisc(null,W/2+0.3,1.2,'L:living');   // flush ceiling lights, kept in every option
  // today: wardrobe on the entrance wall. The vacuum stays in every option.
  box(0.86,1.75,0.44,0xf8f8f6,1.6,0.875,L-0.23,n); box(0.006,1.7,0.004,0xc5c9c5,1.6,0.875,L-0.452,n);
  [1.56,1.64].forEach(function(x){box(0.012,0.12,0.02,0xc9cdc9,x,0.95,L-0.46,n);});
  box(0.42,0.3,0.36,0x2b2f38,1.42,1.9,L-0.23,n); box(0.3,0.24,0.3,0xc23a4a,1.82,1.87,L-0.22,n);
  const vg=A.vacuumMesh=G(); vg.position.set(BLK-0.15,0,L-0.16); vg.rotation.y=-R/2; K.vacuum(vg);           // stick vacuum on its dock, by the front door
  box(0.02,0.22,0.08,0xf4f4f1,BLK-0.012,1.0,L-0.16); box(0.006,0.012,0.012,0x8fbd9b,BLK-0.025,1.08,L-0.16);
});

/* ---------- kitchen ---------- */
const brick=function(rows,cols){const t=canvasTex(256,256,function(g){g.fillStyle='#f3f1ea'; g.fillRect(0,0,256,256); g.strokeStyle='#d5d2c8'; g.lineWidth=2;
  for(let r=0;r<rows;r++){const y=r*256/rows; g.beginPath(); g.moveTo(0,y); g.lineTo(256,y); g.stroke();
    for(let c=0;c<=cols;c++){const x=(c+(r%2?0.5:0))*256/cols; g.beginPath(); g.moveTo(x,y); g.lineTo(x,y+256/rows); g.stroke();}}}); return A.MT(t,'kitchen');};
rect('kback',0.75,KX-W,0.92,1.47,brick(4,8),0.006);                          // sink backsplash
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
    box(0.47,0.76,0.58,v[1],x0+0.235,0.5,KZ-0.29,v[0]); box(0.77,0.76,0.58,v[1],x1-0.385,0.5,KZ-0.29,v[0]);          // either side of the sink
    [x1-1.265,x1-0.835].forEach(function(x){box(0.13,0.76,0.03,v[1],x,0.5,KZ-0.565,v[0]);});                              // fixed strips either side of the pull-out bin (built in life.js)
    box(1.8,0.76,0.57,v[1].isMaterial?sage():v[1],(c0+c1)/2,0.5,0.295,v[0]);                                             // backs stop 1 cm short of the wall plane, or they flicker through it into bedroom 2
    box(0.58,0.58,0.35,v[2],x0+1.185,1.76,KZ-0.175,v[0]);                                                                 // wall cabinet: the right half is closed,
    box(0.57,0.02,0.35,v[2],x0+0.61,2.04,KZ-0.175,v[0]); box(0.57,0.02,0.35,v[2],x0+0.61,1.48,KZ-0.175,v[0]);              // the left half is a real cupboard with a shelf
    box(0.02,0.54,0.35,v[2],x0+0.335,1.76,KZ-0.175,v[0]); box(0.55,0.54,0.02,0xf4f1ea,x0+0.61,1.76,KZ-0.012,v[0]); box(0.53,0.015,0.3,0xf4f1ea,x0+0.61,1.765,KZ-0.17,v[0]);
  });
  box(0.006,0.56,0.004,0x6c7a55,x0+0.9,1.76,zf+0.248,d);                     // wall cabinet door split
  box(1.8,0.12,0.5,0x1d1f21,(x0+x1)/2,0.06,KZ-0.25); const sx=x1-1.05, sz=KZ-0.32;        // counter with a cut-out, and the basin sunk into it
  box(0.49,0.04,0.63,top,x0+0.225,0.9,KZ-0.305); box(0.79,0.04,0.63,top,x1-0.375,0.9,KZ-0.305); box(0.56,0.04,0.1,top,sx,0.9,KZ-0.57); box(0.56,0.04,0.12,top,sx,0.9,KZ-0.05);
  box(0.56,0.015,0.4,0xd9d5c8,sx,0.7,sz); [[-0.275,0],[0.275,0]].forEach(function(q){box(0.012,0.22,0.4,0xcfcbbd,sx+q[0],0.81,sz);}); [[-0.195],[0.195]].forEach(function(q){box(0.56,0.22,0.012,0xcfcbbd,sx,0.81,sz+q[0]);});
  cyl(0.025,0.004,0x8d9296,sx,0.71,sz,null,12);
  [x1-0.6,x1-0.9,x1-1.2].forEach(function(x){box(0.006,0.74,0.004,line,x,0.5,zf-0.002);});
  [x1-0.56,x1-0.87,x1-1.24].forEach(function(x){box(0.012,0.13,0.02,line,x,0.78,zf-0.012);});
  // (the basin is built with the counter above)
  // gooseneck tap: riser, an arc, a short nozzle over the middle of the basin, and a lever
  cyl(0.022,0.03,0xc9cdd0,sx,0.935,KZ-0.09,null,14); cyl(0.013,0.26,0xc9cdd0,sx,1.07,KZ-0.09,null,10);
  const arc=A.torus(0.085,0.013,0xc9cdd0,sx,1.2,KZ-0.175,null,R); arc.rotation.y=R/2;
  cyl(0.013,0.05,0xc9cdd0,sx,1.175,KZ-0.26,null,10); box(0.012,0.012,0.07,0xc9cdd0,sx+0.04,0.97,KZ-0.11);
  A.sink={x:sx,z:KZ-0.26,y1:1.15,y0:0.715};
  box(0.3,0.02,0.5,0x2a2c2e,sx,0.135,KZ-0.3);                                 // floor of the bin compartment
  // things on the counter and on top of the cabinet today; cleared in the redesign
  box(0.46,0.02,0.32,0x2a2c2e,x1-0.3,0.93,KZ-0.28,n); [-0.22,0.22].forEach(function(o){box(0.012,0.14,0.32,0x2a2c2e,x1-0.3+o,1.0,KZ-0.28,n);});   // dish rack with a few plates and a mug drying
  for(let i=0;i<5;i++){const pl=cyl(0.1,0.012,0xfbfaf6,x1-0.44+i*0.055,1.04,KZ-0.28,n,20); pl.rotation.z=R/2-0.18;} cyl(0.035,0.09,0x9dc2d5,x1-0.14,0.985,KZ-0.22,n,14);
  box(0.3,0.42,0.005,0xc8b790,x1-0.08,1.13,KZ-0.33,n);                // cutting board
  cyl(0.085,0.2,0xe8e2c4,x0+0.2,1.02,KZ-0.3,n,20,0.07); cyl(0.07,0.02,0x2a2c2e,x0+0.2,1.13,KZ-0.3,n,18,0.05); sph(0.014,0x2a2c2e,x0+0.2,1.15,KZ-0.3,n);      // kettle: body, lid, spout, handle
  box(0.07,0.03,0.03,0xe8e2c4,x0+0.29,1.08,KZ-0.3,n).rotation.z=0.5; A.torus(0.06,0.01,0x2a2c2e,x0+0.11,1.04,KZ-0.3,n,R).rotation.z=R/2;
  cyl(0.04,0.3,0x7fb39a,x0+0.4,1.07,KZ-0.14,n);                        // bottle
  box(0.3,0.18,0.1,0xe8c93a,x0+0.5,2.14,KZ-0.3,n); box(0.25,0.3,0.12,0xf4f2ee,x0+0.95,2.2,KZ-0.3,n); // boxes on top
  // fridge in the opening corner, side covered with photos
  const fx=W+0.36, fz=KZ-0.36;
  // a hollow cabinet: liner, glass shelves, a freezer compartment, food. The door is hung in life.js.
  const wh=0xf7f7f5, ln=0xfbfcfb, fy=1.24;
  box(0.03,1.75,0.72,wh,fx-0.335,0.875,fz); box(0.03,1.75,0.72,wh,fx+0.335,0.875,fz); box(0.7,0.03,0.72,wh,fx,1.735,fz); box(0.7,0.1,0.72,wh,fx,0.05,fz); box(0.7,1.75,0.03,wh,fx,0.875,fz+0.345);
  box(0.64,0.03,0.66,ln,fx,fy,fz-0.015);                                                    // freezer floor
  [0.38,0.66,0.94].forEach(function(y){box(0.62,0.012,0.5,A.reg(new THREE.MeshLambertMaterial({color:0xdfeef0,transparent:true,opacity:0.6})),fx,y,fz+0.05);});
  box(0.6,0.16,0.44,A.reg(new THREE.MeshLambertMaterial({color:0xe8f1f2,transparent:true,opacity:0.55})),fx,0.19,fz+0.02);      // vegetable drawer
  box(0.5,0.02,0.02,A.lampMat('L:kitchen',0xfffbe6,0xfff2c2,0.4),fx,1.2,fz+0.3);
  [[-0.2,0.39,0x5b8f4a,0.12],[0.0,0.39,0xd9463e,0.1],[0.2,0.39,0xf0d21c,0.14]].forEach(function(q){box(0.13,q[3],0.16,q[2],fx+q[0],q[1]+q[3]/2,fz+0.1);});
  [[-0.2,0xfbfaf6],[-0.08,0x9fc4d6],[0.18,0x5b8f4a]].forEach(function(q){cyl(0.035,0.22,q[1],fx+q[0],0.776,fz+0.14,null,12); cyl(0.014,0.05,q[1],fx+q[0],0.91,fz+0.14,null,8);});
  box(0.2,0.08,0.2,0xd9863e,fx+0.12,0.986,fz+0.08); cyl(0.07,0.07,0xfbfaf6,fx-0.14,0.981,fz+0.1,null,16); cyl(0.05,0.1,0xc4673f,fx-0.02,0.716,fz-0.08,null,12);
  [[-0.14,0x8fbd9b],[0.1,0xd9463e]].forEach(function(q){sph(0.045,q[1],fx+q[0],0.3,fz+0.02);});
  box(0.24,0.1,0.3,0xcfe3ec,fx-0.14,fy+0.07,fz+0.05); box(0.2,0.14,0.26,0xe9eef0,fx+0.14,fy+0.09,fz+0.06);     // frozen things
  const ff=A.fridgeFront=G();
  box(0.66,0.012,0.004,0xb5b9b6,fx,1.22,fz-0.362,ff); box(0.02,0.5,0.03,0xdedfdc,fx+0.28,0.95,fz-0.375,ff); box(0.02,0.25,0.03,0xdedfdc,fx+0.28,1.42,fz-0.375,ff);
  box(0.1,0.14,0.005,0xfdfdfb,fx-0.05,1.48,fz-0.363,ff); box(0.06,0.1,0.005,0x4fb6d6,fx-0.2,1.42,fz-0.363,ff);
  const photos=canvasTex(128,256,function(g){g.fillStyle='#f7f7f5'; g.fillRect(0,0,128,256);
    const cs=['#5b4a42','#8a6f5e','#3c4a55','#a58b76','#6d7f6a','#2f3438','#b49c8c'];
    for(let r=0;r<14;r++)for(let c=0;c<5;c++){g.fillStyle=cs[(r*3+c*5+r*c)%cs.length]; g.fillRect(6+c*24,6+r*17.6,20,14);}});
  const ph=new THREE.Mesh(new THREE.PlaneGeometry(0.62,1.5),A.MT(photos)); ph.position.set(fx-0.352,0.98,fz); ph.rotation.y=-Math.PI/2; n.add(ph);   // photo strips on the side of the fridge
  box(0.48,0.28,0.36,0xe9e9e6,fx+0.02,1.89,fz,n); box(0.3,0.2,0.005,0x2b2d2f,fx-0.03,1.89,fz-0.182,n); // microwave
  cyl(0.11,0.24,0x1f2a52,fx-0.18,2.15,fz-0.1,n); box(0.18,0.3,0.2,0x1c2a4a,fx+0.25,1.9,fz,n);           // whey jar, bug zapper
  // cooktop side: 8 cm filler | oven + hob 60 | door | drawers, counted from the window wall.
  // The hob is a two-ring domino: the rings sit one behind the other, toward the left of the oven housing.
  box(1.8,0.12,0.49,0x1d1f21,(c0+c1)/2,0.06,0.255); box(1.84,0.04,0.61,0xf4f3ee,(c0+c1)/2,0.9,0.315);
  const hx=c1-0.38;
  [c1-0.08,c1-0.68,c1-1.2].forEach(function(x){box(0.006,0.74,0.004,line,x,0.5,0.602);});
  box(0.56,0.56,0.006,0x0f1011,hx,0.56,0.603); box(0.44,0.02,0.03,0x8d9296,hx,0.78,0.615);            // oven
  A.rbox(0.3,0.012,0.5,0x101112,hx-0.1,0.926,0.31,null,0.004);                                        // hob
  [[0.19,0.062],[0.42,0.08]].forEach(function(q){cyl(q[1],0.004,0x2a2c2e,hx-0.1,0.934,q[0],null,28); A.torus(q[1]*0.6,0.0025,0x55595c,hx-0.1,0.9365,q[0]).rotation.x=R/2;});
  [-0.03,0.03].forEach(function(o){cyl(0.008,0.002,0x8d9296,hx-0.1+o,0.933,0.535,null,10);});                 // touch controls at the front edge
  box(0.012,0.13,0.02,line,c1-0.74,0.78,0.612);
  [0.34,0.62].forEach(function(y){box(0.58,0.006,0.004,line,c0+0.3,y,0.602);}); [0.26,0.78].forEach(function(y){box(0.26,0.014,0.02,line,c0+0.3,y,0.612);});
  box(0.5,0.03,0.11,0x9a6b3f,c0+0.3,1.6,0.065);                                                     // spice shelf
  [0,1,2,3,4].forEach(function(i){cyl(0.028,0.11,[0xc63d2f,0xd9b23a,0x5b8f4a,0xb9772e,0xe5e0d2][i],c0+0.12+i*0.09,1.67,0.06);});
  K.ceilDisc(null,W+1.3,1.4,'L:kitchen');
  // redesign: pendant, light strip under the wall cabinet, runner, hanging plant
  box(1.1,0.012,0.02,A.lampMat('L:kitchen',0xf4f1e6,0xffe9c4,1),x0+0.9,1.462,KZ-0.33,d);
  A.pool('L:kitchen',0xffd9a0,x0+0.9,0.925,KZ-0.3,0.55,d,0.55);
  const rr=G(d); rr.position.set(W+1.35,0,1.4); rr.rotation.y=R/2; K.rug(rr,0.7,1.9,'runner');
  K.hanging(d,KX-0.24,1.95,2.0,0.75,4);
  A.shop(rr,'Kitchen runner','flatwoven runner rug','ikea');
});

/* ---------- bedroom 1: desk under the window, a single bed on the wall beside it, built-in closet by the door.
   In the proposals it becomes a study with a second desk where the bed was. ---------- */
A.windowOn('a_far',0.55,1.95,1.0,2.1,3,0,'bed1');
A.sunPatch('bed1',1.25,AZ+0.05,1.3,2.6,0);
inRoom('bed1',function(){
  const n=G(null,'n'), d=G(null,'abc'), r=r2;
  K.ceilDisc(null,1.2,-2.4,'L:bed1');
  box(0.85,0.28,0.2,0xf6f7f5,1.3,2.5,AZ+0.11);                          // air conditioner
  box(1.2,0.03,0.6,0xd9bf8c,0.65,0.74,AZ+0.32);                         // desk under the window
  [[0.08,AZ+0.05],[1.22,AZ+0.05],[0.08,AZ+0.59],[1.22,AZ+0.59]].forEach(function(p){box(0.03,0.73,0.03,0xf2f2f0,p[0],0.365,p[1]);});
  box(0.56,0.33,0.03,0x111315,0.7,1.08,AZ+0.16); box(0.2,0.14,0.12,0x111315,0.7,0.83,AZ+0.16); // monitor
  const c1=G(); c1.position.set(0.65,0,AZ+0.95); c1.rotation.y=R/2; K.officeChair(c1,0xd8d8d2);                    // chair (faces the desk)
  A.desks={desk1:{chair:c1,dir:[0,-1],screen:K.screen(null,0.5,0.28,0.7,1.08,AZ+0.177,0)}};
  seat({id:'desk1',label:'Desk by the window',room:'bed1',x:0.65,z:AZ+0.95,y:0.52,h:R,type:'sit'});
  box(0.38,1.75,0.38,0xeef0f1,0.25,0.875,-0.25); [0.35,0.7,1.05,1.4].forEach(function(y){box(0.385,0.012,0.385,0xd5d8da,0.25,y,-0.25);});   // plastic cube tower by the door
  box(0.6,2.3,1.5,0xe9dfcf,rn-0.3,1.15,-1.0);                           // built-in closet beside the door
  [-1.5,-1.0,-0.5].forEach(function(z){box(0.004,2.26,0.006,0xcfc4b2,rn-0.602,1.15,z);}); [-1.1,-0.9].forEach(function(z){box(0.02,0.2,0.014,0xa9a59c,rn-0.61,1.25,z);});
  // today: single bed on the right-hand wall
  box(0.9,0.22,2.0,0xc9a66b,r-0.46,0.2,AZ+1.02,n); A.rbox(0.9,0.2,2.0,0xd9c7b0,r-0.46,0.41,AZ+1.02,n); A.rbox(0.6,0.1,0.38,0xe9e2d4,r-0.46,0.56,AZ+0.3,n);
  seat({id:'bed1',label:'Bed (bedroom 1)',room:'bed1',x:r-0.46,z:AZ+1.1,y:0.51,h:0,type:'lie',only:'n'});
  // proposals: second desk where the bed was, shelves above it, two desk lamps, rug, plants
  const dz=AZ+1.4, dk=G(d);
  box(0.65,0.035,1.3,0xc99a5b,r-0.335,0.74,dz,dk);
  [[r-0.62,dz-0.61],[r-0.05,dz-0.61],[r-0.62,dz+0.61],[r-0.05,dz+0.61]].forEach(function(p){box(0.035,0.72,0.035,0xfbfaf6,p[0],0.36,p[1],dk);});
  A.shop(dk,'Second desk','LAGKAPTEN ADILS desk','ikea','Or any 120 to 140 cm desk with an oak top and white legs.');
  box(0.03,0.36,0.62,0x111315,r-0.16,1.1,dz-0.1,d); box(0.1,0.16,0.18,0x111315,r-0.16,0.84,dz-0.1,d);
  box(0.14,0.012,0.4,0xe9e9e6,r-0.42,0.765,dz-0.1,d); box(0.24,0.012,0.32,0xb9bdc0,r-0.35,0.765,dz+0.42,d);
  const ch=G(d); ch.position.set(r-1.05,0,dz); K.officeChair(ch,0x8fbd9b); A.shop(ch,'Desk chair','office chair','ikea');
  A.desks.desk2={chair:ch,dir:[1,0],screen:K.screen(d,0.56,0.3,r-0.177,1.1,dz-0.1,-R/2)};
  seat({id:'desk2',label:'New desk',room:'bed1',x:r-1.05,z:dz,y:0.52,h:R/2,type:'sit',only:'abc'});
  [1.32,1.68].forEach(function(y,i){box(0.22,0.03,1.2,0xc99a5b,r-0.11,y,dz,d); K.books(d,r-0.12,y+0.015,dz-0.25+i*0.5,0.5,0.22,0.16,71+i);});
  K.bush(d,r-0.12,1.335,dz+0.45,0.07); cyl(0.05,0.18,BLUE,r-0.12,1.785,dz-0.4,d,12,0.03);
  K.deskLamp(d,r-0.2,0.758,dz-0.52,'L:bed1',R*0.75); K.deskLamp(d,0.2,0.755,AZ+0.2,'L:bed1',-0.4);
  const rg=G(d); rg.position.set(0.95,0,AZ+1.9); K.rug(rg,1.3,1.9,'wool'); A.shop(rg,'Wool rug','TIPHEDE','ikea');
  K.snake(d,0.25,-0.85,0.75); K.bush(d,1.1,0.755,AZ+0.12,0.06,BLUE);
  K.curtain(d,0.47,AZ+0.07,0.16,true,0.25,2.3); K.curtain(d,2.03,AZ+0.07,0.16,true,0.25,2.3);
  box(0.02,0.5,0.7,0xcfa97a,0.012,1.45,AZ+1.0,d);                       // cork board
  [[1.52,AZ+0.82,0xf3ebdc],[1.58,AZ+1.05,BLUE],[1.36,AZ+0.95,SAGE],[1.4,AZ+1.18,0xcfe3ec]].forEach(function(q){box(0.006,0.12,0.14,q[2],0.026,q[0],q[1],d);});
});
K.onlyAll(K.frame('a_l',1.2,1.5,0.5,0.65,9,0xc99a5b).concat(K.frame('a_l',1.85,1.5,0.5,0.65,6,0xc99a5b)),'abc');

/* ---------- bedroom 2, from the photos and the video. About 2.35 m wide.
   Left of the door a niche holds the dresser and the 3-door wardrobe, so they do not stick out in front of the cube shelf
   that stands between the wall and the column. Behind the shelf is the bed, 40 cm from the right-hand wall.
   That wall has the TV on an arm and the big window; the desk under the window faces the wardrobe. ---------- */
A.windowOn('b_far',0.75,1.55,1.25,2.0,2,5,'bed2');                     // small barred window above the bed
A.windowOn('b_r',2.3,4.0,0.95,2.2,2,6,'bed2');                         // big window, over the desk
A.sunPatch('bed2',BX-0.05,-1.25,1.6,2.2,-R/2);
inRoom('bed2',function(){
  const n=G(null,'n'), d=G(null,'abc'), l=bl, kz=-2.1, dkz=-1.25;
  K.ceilDisc(null,(l+BX)/2+0.225,-1.9,'L:bed2');      // clear of the column
  box(0.22,0.28,0.85,0xf6f7f5,BX-0.11,2.5,dkz);                         // air conditioner above the big window
  box(0.5,1.9,1.17,0xf8f8f6,NX+0.25,0.95,-1.27); [-1.66,-1.27,-0.88].forEach(function(z){box(0.006,1.82,0.37,0xfdfdfb,NX+0.503,0.97,z);}); box(0.004,1.4,0.12,0xb9c6cc,NX+0.508,1.05,-1.27);
  box(0.36,0.3,0.5,0x202a44,NX+0.25,2.05,-1.45,n); box(0.36,0.3,0.4,0x3b3d40,NX+0.25,2.05,-0.95,n);
  box(0.45,1.0,0.56,0xc7a878,NX+0.225,0.5,-0.36); [0.34,0.67].forEach(function(y){box(0.006,0.012,0.54,0x7d674a,NX+0.452,y,-0.36);});
  const kx=l+0.385;                                                     // 2 x 4 cube shelf between the wall and the column
  box(0.77,1.47,0.39,0xfafaf8,kx,0.735,kz);
  [0.37,0.735,1.1].forEach(function(y){box(0.73,0.02,0.006,0xcfd2ce,kx,y,kz+0.197);}); box(0.02,1.43,0.006,0xcfd2ce,kx,0.735,kz+0.197);
  [[-0.2,0xf0d21c],[-0.02,0xd9463e],[0.16,0x9fb4c8]].forEach(function(q){box(0.14,0.05,0.07,q[1],kx+q[0],1.5,kz,n);});
  box(0.4,H,0.4,M(0xf5f6f3),l+0.97,H/2,kz);                             // column
  const sk=box(0.22,0.8,0.06,0x3b8f8a,l+0.2,0.42,kz+0.26,n); sk.rotation.x=-0.2;
  box(0.06,0.06,0.3,0x25272b,BX-0.15,1.6,AZ+0.95);                      // TV arm
  // today: bed with its head on the far wall, bedside table in the 40 cm beside it, bike, pine desk under the window
  const bx=BX-0.4-0.75;
  box(1.5,0.14,2.0,0xc9a66b,bx,0.1,AZ+1.02,n); A.rbox(1.5,0.22,2.0,0xf1efec,bx,0.3,AZ+1.02,n,0.06); [-0.37,0.37].forEach(function(dx){A.rbox(0.62,0.09,0.4,0xfafafa,bx+dx,0.453,AZ+0.3,n,0.042);});
  const fn=G(n); A.rbox(1.5,0.07,1.25,0xe9e2d4,bx,0.44,AZ+1.4,fn,0.03);                                      // today's blanket, folded flat
  const cn=G(n); cn.position.set(bx,0,AZ+2.03); A.rbox(1.52,0.31,1.32,0xe9e2d4,0,0.565,-0.66,cn,0.12); cn.visible=false;
  A.beds={n:{flat:fn,cover:cn,axis:'z'}};
  seat({id:'bedL',label:'Bed, left side',room:'bed2',x:bx-0.36,z:AZ+1.04,y:0.41,h:0,type:'lie',only:'n'});
  seat({id:'bedR',label:'Bed, right side',room:'bed2',x:bx+0.36,z:AZ+1.04,y:0.41,h:0,type:'lie',only:'n'});
  box(0.38,0.4,0.36,0xc79a5c,BX-0.2,0.2,AZ+0.22,n);
  box(0.04,0.58,1.0,0x25272b,BX-0.4,1.6,AZ+0.95,n).rotation.y=-0.75;
  (function(){const g=G(n); g.position.set(BX-0.45,0,AZ+2.3); g.rotation.y=R/2+0.15; g.userData.nc=true;      // mountain bike, between the bed and the desk
    [-0.52,0.52].forEach(function(x){A.torus(0.33,0.025,0x1b1c1e,x,0.36,0,g);});
    const a=box(0.62,0.04,0.04,0xd9652c,-0.18,0.62,0,g); a.rotation.z=0.5; const b=box(0.62,0.04,0.04,0x1b1c1e,0.2,0.62,0,g); b.rotation.z=-0.55;
    box(0.7,0.04,0.04,0x1b1c1e,0.02,0.83,0,g); box(0.04,0.04,0.56,0xd98a2b,0.42,0.98,0,g); box(0.2,0.05,0.1,0x1b1c1e,-0.3,0.92,0,g);})();
  box(0.7,0.05,1.5,0xd2b07a,BX-0.36,0.74,dkz,n);
  [dkz-0.7,dkz+0.7].forEach(function(z){box(0.08,0.72,0.08,0xd2b07a,BX-0.66,0.36,z,n); box(0.08,0.72,0.08,0xd2b07a,BX-0.08,0.36,z,n);});
  box(0.04,0.36,0.62,0x111315,BX-0.2,1.1,dkz-0.1,n); box(0.14,0.14,0.2,0x111315,BX-0.2,0.84,dkz-0.1,n); box(0.16,0.02,0.45,0x1b1c1e,BX-0.42,0.775,dkz-0.1,n);
  const c3=G(n); c3.position.set(BX-1.1,0,dkz); K.officeChair(c3,0x2a2d31);
  A.desks.desk3={chair:c3,dir:[1,0],screen:K.screen(n,0.56,0.3,BX-0.222,1.1,dkz-0.1,-R/2)};
  seat({id:'desk3',label:'Desk (bedroom 2)',room:'bed2',x:BX-1.1,z:dkz,y:0.52,h:R/2,type:'sit',only:'n'});
  // proposals: the bed turns 90 degrees to face the TV, a reading nook replaces the desk, the bike goes
  const bz=AZ+0.8;
  A.rbox(2.04,0.12,1.54,0xc99a5b,l+1.03,0.16,bz,d,0.02); [[0.1,-0.68],[1.96,-0.68],[0.1,0.68],[1.96,0.68]].forEach(function(q){cyl(0.03,0.1,0xc99a5b,l+q[0],0.05,bz+q[1],d,10);});   // oak frame on short legs
  A.rbox(2.0,0.2,1.5,0xfbfaf6,l+1.03,0.31,bz,d,0.07);                    // mattress
  const fp=G(d); A.rbox(1.32,0.09,1.56,0xf3efe6,l+1.36,0.42,bz,fp,0.04); A.rbox(0.16,0.1,1.56,0xffffff,l+0.74,0.425,bz,fp,0.045);     // duvet with its turned-back edge
  [-0.36,0.36].forEach(function(dz){A.rbox(0.42,0.09,0.64,0xffffff,l+0.33,0.453,bz+dz,d,0.042); const p2=A.rbox(0.36,0.12,0.58,0xe9eef0,l+0.26,0.56,bz+dz,fp,0.055); p2.rotation.z=0.5;});      // sleeping pillows; the propped ones go with the made bed
  A.rbox(0.07,0.7,1.56,0xc99a5b,l+0.04,0.72,bz,d,0.025); [-0.5,0,0.5].forEach(function(dz){box(0.006,0.6,0.01,0xa9825a,l+0.078,0.72,bz+dz,d);});
  A.rbox(0.62,0.05,1.6,SAGE,l+1.68,0.475,bz,fp,0.022); K.cushion(fp,BLUE,l+0.62,0.6,bz-0.12,0.85,0.9); K.cushion(fp,SAGE,l+0.66,0.58,bz+0.22,0.75,1.0);
  const cp=G(d); cp.position.set(l+2.03,0,bz); A.rbox(1.3,0.31,1.58,0xf3efe6,-0.65,0.565,0,cp,0.12); A.rbox(0.14,0.33,1.58,0xffffff,-1.3,0.565,0,cp,0.07); A.rbox(0.5,0.32,1.6,SAGE,-0.3,0.57,0,cp,0.12); cp.visible=false;
  A.beds.p={flat:fp,cover:cp,axis:'x'};
  seat({id:'bedL',label:'Bed, window side',room:'bed2',x:l+1.07,z:bz-0.35,y:0.41,h:R/2,type:'lie',only:'abc'});
  seat({id:'bedR',label:'Bed, room side',room:'bed2',x:l+1.07,z:bz+0.35,y:0.41,h:R/2,type:'lie',only:'abc'});
  box(0.36,0.42,0.36,0xc99a5b,l+0.2,0.21,bz+0.96,d); K.tableLamp(d,l+0.2,0.42,bz+0.96,'L:bed2');
  box(0.04,0.58,1.0,0x25272b,BX-0.06,1.4,bz,d);                         // TV flat on the wall, straight ahead of the bed
  const nk=G(d); nk.position.set(BX-0.62,0,dkz+0.4); nk.rotation.y=R-0.35;      // toward the door wall, so there is room to walk past the column to the bed
  K.armchair(nk,BLUE,0x86adc0); K.cushion(nk,0xfbfaf6,-0.12,0.62,0.05,0.9,0.35);
  A.shop(nk,'Reading armchair','STRANDMON','ikea','A wing chair. Pick a light blue or beige cover.');
  seat({id:'nook',label:'Reading nook',room:'bed2',x:BX-0.62,z:dkz+0.4,y:0.43,h:R-0.35+R/2,type:'sit',only:'abc',recline:0.2});
  const fl=G(d); fl.position.set(BX-0.26,0,dkz+0.95); K.floorLamp(fl,'L:bed2'); A.shop(fl,'Reading lamp','floor lamp reading','ikea');
  K.roundRug(d,BX-0.9,dkz+0.3,0.8,0xd8ccb2,0xefe7d6);
  const st=G(d); cyl(0.18,0.03,0xc99a5b,BX-0.3,0.5,dkz-0.25,st,24); cyl(0.02,0.5,0xfbfaf6,BX-0.3,0.25,dkz-0.25,st,8); K.bookStack(st,BX-0.3,0.515,dkz-0.25,3,5);
  A.shop(st,'Side table','GLADOM tray table','ikea');
  K.curtain(d,BX-0.07,AZ+2.2,0.2,false,0.2,2.35); K.curtain(d,BX-0.07,AZ+4.1,0.2,false,0.2,2.35);
  K.pothos(d,kx-0.15,1.47,kz,0.5,17); K.bush(d,kx+0.2,1.47,kz,0.07);
});
K.onlyAll(K.frame('b_door',BX-0.6-NX,1.55,0.5,0.6,7,0xc99a5b),'abc');

/* ---------- guest toilet: its door faces the living room, at a right angle to the bathroom door ---------- */
const tileWhite=canvasTex(128,128,function(g){g.fillStyle='#f6f6f3'; g.fillRect(0,0,128,128); g.strokeStyle='#d9dad6'; g.lineWidth=2; g.strokeRect(0,0,128,128);});
tileWhite.wrapS=tileWhite.wrapT=THREE.RepeatWrapping;
function tiled(k,y1){
  const w=A.walls[k], mk=function(u0,u1,a,b){const t=tileWhite.clone(); t.needsUpdate=true; t.repeat.set((u1-u0)/0.6,(b-a)/0.3); rect(k,u0,u1,a,b,A.MT(t,w.room),0.005);};
  A.spans(k).forEach(function(s){mk(s[0],s[1],0,y1);});
  w.holes.forEach(function(h){if(y1>2.06) mk(h[0],h[1],2.05,y1);});
}
/* washbasins: one glazed shell built ring by ring, from the middle of the underside, up the outside, over the rim and down into the bowl.
   A ring is [half-width, half-depth, y, squareness, z shift, squareness of the back half]: 2 is an ellipse, higher is squarer.
   The back is at +z, against the wall; the bowl sits toward the front, which leaves a ledge for the tap. */
function shell(rings,parent){
  const N=48, pos=[], idx=[], v=new THREE.Vector3();
  rings.forEach(function(q){for(let i=0;i<=N;i++){const a=i/N*2*R, s=Math.round(Math.sin(a)*1e6)/1e6, c=Math.round(Math.cos(a)*1e6)/1e6, e=2/(c>0&&q[5]||q[3]);
    pos.push(Math.sign(s)*Math.pow(Math.abs(s),e)*q[0],q[2],Math.sign(c)*Math.pow(Math.abs(c),e)*q[1]+(q[4]||0));}});
  for(let j=0;j<rings.length-1;j++) for(let i=0;i<N;i++){const p=j*(N+1)+i, q=p+N+1; idx.push(p,p+1,q,p+1,q+1,q);}
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setIndex(idx); g.computeVertexNormals();
  const nm=g.attributes.normal;                                           // the seam runs down the back: give both sides of it one normal
  for(let j=0;j<rings.length;j++){const p=j*(N+1), q=p+N; v.set(nm.getX(p)+nm.getX(q),nm.getY(p)+nm.getY(q),nm.getZ(p)+nm.getZ(q)).normalize(); nm.setXYZ(p,v.x,v.y,v.z); nm.setXYZ(q,v.x,v.y,v.z);}
  const m=new THREE.Mesh(g,M(0xfbfbfa)); m.castShadow=true; m.receiveShadow=true; parent.add(m); return m;
}
function mixer(g,x,z,k){            // single-lever basin mixer standing on the ledge, spout toward -z; the water leaves it at (x, 0.077k, z-0.115k)
  const c=M(0xc9cdd0), t=G(g); t.position.set(x,0,z); t.scale.setScalar(k);
  cyl(0.026,0.008,c,0,0.004,0,t,18); cyl(0.02,0.1,c,0,0.058,0,t,16,0.017);                              // base and body
  cyl(0.011,0.115,c,0,0.082,-0.062,t,12).rotation.x=0.2-R/2; cyl(0.012,0.016,c,0,0.085,-0.115,t,12);    // spout, rising a little, and the aerator under its tip
  cyl(0.0175,0.016,c,0,0.116,0,t,16,0.015); box(0.014,0.008,0.075,c,0,0.14,-0.03,t).rotation.x=0.35;    // cap and lever
}
function soap(g,x,z){cyl(0.022,0.085,0x7fb39a,x,0.0425,z,g,14); cyl(0.007,0.035,0xf4f4f1,x,0.1,z,g,8); box(0.012,0.008,0.04,0xf4f4f1,x,0.118,z-0.014,g);}   // pump bottle of hand soap
inRoom('wc',function(){
  ['wc_n','wc_w','wc_e','wc_s'].forEach(function(k){tiled(k,1.2);});
  const mz=(WC.z0+WC.z1)/2, bx=(wd[0]+wd[1])/2;
  box(0.2,1.15,WC.z1-WC.z0-0.02,0xf6f6f3,WC.x1-0.1,0.575,mz);                 // cistern box with ledge
  box(0.5,0.34,0.36,0xfbfbfa,WC.x1-0.45,0.42,mz);
  box(0.01,0.16,0.2,0x3c4043,WC.x1-0.205,0.95,mz);
  // wall-hung basin opposite the door: a real bowl with a ledge for the tap, a waste, a bottle trap running to the wall, and the mirror above
  const hb=G(), hz=-0.027, cr=M(0xc9cdd0); hb.position.set(bx-0.2,0.86,WC.z1-0.162);
  shell([[0.001,0.001,-0.15,2,hz],[0.05,0.05,-0.15,2,hz],[0.13,0.1,-0.13,2.5,-0.01],[0.19,0.135,-0.085,3,0.015,10],[0.21,0.15,-0.045,3,0,12],[0.21,0.15,-0.006,3,0,12],[0.208,0.148,-0.002,3,0,12],[0.204,0.144,0,3,0,12],
    [0.171,0.101,0,2.6,hz],[0.167,0.097,-0.002,2.6,hz],[0.164,0.094,-0.008,2.6,hz],[0.15,0.084,-0.04,2.6,hz],[0.125,0.068,-0.072,2.5,hz],[0.085,0.048,-0.092,2.3,hz],[0.04,0.03,-0.1,2,hz],[0.001,0.001,-0.101,2,hz]],hb);
  cyl(0.02,0.004,cr,0,-0.098,hz,hb,16);
  cyl(0.015,0.08,cr,0,-0.19,hz,hb,10); cyl(0.028,0.07,cr,0,-0.255,hz,hb,14); cyl(0.013,0.18,cr,0,-0.24,hz+0.09,hb,10).rotation.x=R/2; cyl(0.03,0.006,cr,0,-0.24,0.152,hb,14).rotation.x=R/2;
  mixer(hb,0,0.11,0.85); soap(hb,0.13,0.108);
  A.basins={guest:{x:bx-0.2,z:WC.z1-0.162+0.11-0.115*0.85,y1:0.86+0.077*0.85,y0:0.765}};      // where the water leaves the tap, and where it lands
  box(0.36,0.6,0.02,0xb9c9cf,bx-0.2,1.5,WC.z1-0.012);
  seat({id:'wc',label:'Guest toilet',room:'wc',x:WC.x1-0.5,z:mz,y:0.6,h:-R/2,type:'sit',hidden:true});
});

/* ---------- bathroom. Walking in: sink on the right, washing machine opposite it under the boiler,
   toilet on the far wall under a window, and the shower to the right of the toilet, with its own window ---------- */
inRoom('bath',function(){
  ['ba_w','ba_n','ba_e','ba_s'].forEach(function(k){tiled(k,H);});
  const tz=(bd[0]+bd[1])/2;
  A.windowOn('ba_e',tz-BA.z0-0.3,tz-BA.z0+0.3,1.6,2.2,1,0);              // window above the toilet
  A.windowOn('ba_e',0.25,0.75,1.75,2.25,1,0);                            // frosted window in the shower
  const vx=BA.x0+0.7, vb=G(), vo=-0.015, navy=M(0x26386b), cr=M(0xc9cdd0);   // vanity: navy cabinet on the wall, a ceramic top with the bowl sunk into it, mirror and shelf
  vb.position.set(vx,0.93,BA.z1-0.24);
  box(0.8,0.53,0.02,navy,0,-0.315,-0.2,vb); [-0.39,0.39].forEach(function(x){box(0.02,0.53,0.42,navy,x,-0.315,0.02,vb);}); box(0.76,0.02,0.42,navy,0,-0.57,0.02,vb);   // the cabinet is hollow: the bowl hangs into it
  box(0.006,0.5,0.004,0x1a2749,0,-0.315,-0.211,vb); [-0.045,0.045].forEach(function(x){box(0.012,0.12,0.016,cr,x,-0.2,-0.218,vb);});                               // two doors and their handles
  shell([[0.37,0.18,-0.05,14,0,24],[0.42,0.23,-0.05,14,0,24],[0.42,0.23,-0.05,14,0,24],[0.42,0.23,-0.006,14,0,24],[0.418,0.228,-0.002,14,0,24],[0.414,0.224,0,14,0,24],
    [0.256,0.151,0,3.5,vo],[0.252,0.147,-0.002,3.5,vo],[0.249,0.144,-0.008,3.5,vo],[0.235,0.132,-0.04,3.4,vo],[0.2,0.11,-0.075,3.2,vo],[0.14,0.075,-0.097,2.8,vo],[0.06,0.04,-0.105,2,vo],[0.001,0.001,-0.106,2,vo]],vb);
  cyl(0.022,0.004,cr,0,-0.103,vo,vb,16);
  mixer(vb,0,0.183,1.1); soap(vb,0.24,0.17);
  A.basins.bath={x:vx,z:BA.z1-0.24+0.183-0.115*1.1,y1:0.93+0.077*1.1,y0:0.834};
  box(0.6,0.8,0.02,0xb9c9cf,vx,1.6,BA.z1-0.015); box(0.5,0.03,0.12,0xb98a4e,vx,1.15,BA.z1-0.07);
  const wx=BA.x0+0.5, wz=BA.z0+0.33;                                     // washing machine, basket and bucket on top, boiler cabinet above
  box(0.6,0.85,0.6,0xfbfbfa,wx,0.425,wz);
  A.torus(0.17,0.03,0xd7d9da,wx,0.42,wz+0.3);
  const drum=new THREE.Mesh(new THREE.CircleGeometry(0.15,24),A.MT(canvasTex(128,128,function(g){g.fillStyle='#1a1c1f'; g.fillRect(0,0,128,128);
    [['#8fbd9b',40,50,30],['#d6a21e',80,44,24],['#3d5a80',64,84,30],['#f3ebdc',36,86,18]].forEach(function(q){g.fillStyle=q[0]; g.beginPath(); g.ellipse(q[1],q[2],q[3],q[3]*0.6,q[1]/20,0,7); g.fill();});})));
  drum.position.set(wx,0.42,wz+0.303); scene.add(drum);
  box(0.56,0.1,0.01,0xe9ebe9,wx,0.78,wz+0.302); cyl(0.03,0.02,0xd7d9da,wx-0.2,0.78,wz+0.31).rotation.x=R/2;
  const wcv=document.createElement('canvas'); wcv.width=128; wcv.height=48; const wtex=new THREE.CanvasTexture(wcv);
  const disp=new THREE.Mesh(new THREE.PlaneGeometry(0.17,0.06),new THREE.MeshBasicMaterial({map:wtex})); disp.position.set(wx+0.1,0.78,wz+0.309); scene.add(disp);
  A.washer={x:wx,z:wz,drum:drum,canvas:wcv,tex:wtex};
  box(0.36,0.22,0.3,0xf2f0ea,wx-0.1,0.96,wz); cyl(0.13,0.3,0x17181a,wx+0.2,1.0,wz-0.05,null,16,0.15);
  box(0.64,0.75,0.62,0xfbfbfa,wx,2.2,wz); cyl(0.012,0.5,0x2b2d30,wx+0.22,1.58,wz-0.2,null,6);
  box(0.5,0.34,0.36,0xfbfbfa,BA.x1-0.28,0.42,tz); box(0.02,0.4,0.36,0xfbfbfa,BA.x1-0.03,0.72,tz);   // wall-hung toilet, facing the door
  box(0.01,0.16,0.22,0x3c4043,BA.x1-0.008,1.12,tz);
  const glass=A.reg(new THREE.MeshLambertMaterial({color:0xcfe3e6,transparent:true,opacity:0.35}));   // shower in the corner to the toilet's right
  const sx0=BA.x1-0.9, sz1=BA.z0+0.95;
  box(0.02,2.0,0.95,glass,sx0,1.0,BA.z0+0.475).castShadow=false;
  box(0.9,2.0,0.02,glass,BA.x1-0.45,1.0,sz1).castShadow=false;
  box(0.03,2.01,0.03,0xb9bdc0,sx0,1.005,sz1);
  // rain shower: riser pipe up the wall, an arm, a wide round head with a dotted face; mixer and a hand shower on a rail
  const hx2=BA.x1-0.45, hz2=BA.z0+0.45, chrome=0xc9cdd0;
  cyl(0.012,1.15,chrome,hx2,1.6,BA.z0+0.03,null,10); const sa=cyl(0.012,0.43,chrome,hx2,2.17,BA.z0+0.24,null,10); sa.rotation.x=R/2;
  cyl(0.014,0.06,chrome,hx2,2.14,hz2,null,10); cyl(0.14,0.022,chrome,hx2,2.1,hz2,null,28,0.12);
  cyl(0.128,0.004,A.MT(canvasTex(64,64,function(g){g.fillStyle='#8d9296'; g.fillRect(0,0,64,64); g.fillStyle='#2f3336'; for(let y=4;y<64;y+=7) for(let x=4;x<64;x+=7){g.beginPath(); g.arc(x,y,1.3,0,7); g.fill();}})),hx2,2.088,hz2,null,28);
  cyl(0.055,0.03,chrome,hx2,1.08,BA.z0+0.02,null,18).rotation.x=R/2; box(0.02,0.02,0.09,chrome,hx2+0.03,1.08,BA.z0+0.07);
  cyl(0.008,0.6,chrome,BA.x1-0.22,1.35,BA.z0+0.04,null,8); const hs=cyl(0.03,0.09,chrome,BA.x1-0.22,1.6,BA.z0+0.08,null,12,0.018); hs.rotation.x=0.9;
  box(0.2,0.012,0.12,0xfbfbfa,BA.x1-0.72,1.15,BA.z0+0.07); cyl(0.03,0.14,0x8fbd9b,BA.x1-0.76,1.23,BA.z0+0.07,null,10); cyl(0.028,0.11,0xf3ebdc,BA.x1-0.68,1.215,BA.z0+0.07,null,10);   // shelf with bottles
  A.showerGlass=glass;
  box(0.6,0.02,0.45,0x7fb59a,BA.x1-1.3,0.011,BA.z0+0.95).castShadow=false;
});
A.showerSpot={x:BA.x1-0.45,z:BA.z0+0.45,ax:BA.x1-1.25,az:BA.z0+0.95,headY:2.085};
})();
