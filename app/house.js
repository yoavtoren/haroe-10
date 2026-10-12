/* Haroe 10 — the apartment itself: walls, doors, windows, kitchen, bedrooms, bathroom, toilet */
(function(){
'use strict';
const A=window.APP, D=A.D, K=A.kit, W=D.W, L=D.L, H=D.H, KX=D.KX, KZ=D.KZ, ZW=D.ZW, BLK=D.BLK, BX=D.BX, NX=D.NX, NZ=D.NZ, AZ=A.AZ, SPLIT=A.SPLIT, BA=A.BA, WC=A.WC;
const box=A.box, cyl=A.cyl, sph=A.sph, M=A.M, inRoom=A.inRoom, wall=A.wall, rect=A.rect, G=A.G, scene=A.scene, canvasTex=A.canvasTex;
const R=Math.PI, SAGE=A.SAGE=0x8fbd9b, BLUE=A.BLUE=0x9fc4d6;
A.seats=[];            // places a person can sit or lie: {id,label,room,x,z,y,h,type,only}
function seat(s){A.seats.push(s); return s;}
A.seat=seat;
/* things you can buy: tap one in Design to get a link. site 'ikea' searches IKEA Israel, anything else searches the web. */
A.shops=[];
A.shop=function(o,name,q,site,note){o.userData.shop={name:name,q:q,site:site||'ikea',note:note||''}; A.shops.push(o); return o;};

/* ---------- floors and ceilings ---------- */
const bl=SPLIT+0.05, r2=SPLIT-0.05, rn=D.RN, BXB=D.BXB, ZJ=AZ+2.0;       // bedroom 2 left wall; bedroom 1 right wall at the back; and beside its door; bedroom 2's wall by the bed, and where it steps in
[['living',0,W,0,ZW],['living',0,BLK,ZW,L],['kitchen',W,KX,0,KZ],['bed1',0,rn,NZ,0],['bed1',0,r2,AZ,NZ],
 ['bed2',bl,BX,AZ,0],['bed2',NX,bl,NZ,0],['bed2',BX,BXB,AZ,ZJ],['wc',WC.x0,WC.x1,WC.z0,WC.z1]].forEach(function(q){A.slab(q[1],q[2],q[3],q[4],q[0]); A.ceil(q[0],q[1],q[2],q[3],q[4]);});
(function(){   // bathroom floor: grey and white patterned cement tiles, 20 cm
  const t=canvasTex(256,256,function(g){const tp='#857b72', wh='#f0eee8', bl='#c3cbcf';      // encaustic tiles from the photos: taupe ground, a white flower, pale blue-grey at the corners
    g.fillStyle=tp; g.fillRect(0,0,256,256);
    const lobe=function(len,w){g.beginPath(); g.moveTo(0,0); g.bezierCurveTo(w,-len*0.25,w*1.1,-len*0.75,0,-len); g.bezierCurveTo(-w*1.1,-len*0.75,-w,-len*0.25,0,0); g.fill();};
    g.save(); g.translate(128,128);
    for(let i=0;i<4;i++){g.rotate(R/2); g.fillStyle=wh; lobe(70,30); g.fillStyle=tp; g.save(); g.scale(0.45,0.55); lobe(70,30); g.restore();
      g.fillStyle=wh; g.beginPath(); g.arc(22,-62,10,0,7); g.arc(-22,-62,10,0,7); g.fill(); g.fillStyle=tp; g.beginPath(); g.arc(22,-62,5,0,7); g.arc(-22,-62,5,0,7); g.fill();}      // petals that curl back at the tips
    g.rotate(R/4); for(let i=0;i<4;i++){g.rotate(R/2); g.fillStyle=wh; lobe(46,9);}
    g.fillStyle=wh; g.beginPath(); g.arc(0,0,16,0,7); g.fill(); g.fillStyle=tp; g.beginPath(); g.arc(0,0,8,0,7); g.fill(); g.restore();
    [[0,0],[256,0],[0,256],[256,256]].forEach(function(p){g.fillStyle=bl; g.beginPath(); g.arc(p[0],p[1],52,0,7); g.fill(); g.fillStyle=tp; g.beginPath(); g.arc(p[0],p[1],36,0,7); g.fill();
      g.fillStyle=wh; g.save(); g.translate(p[0],p[1]); for(let i=0;i<8;i++){g.rotate(R/4); lobe(30,8);} g.restore();});
    [[128,0],[0,128],[256,128],[128,256]].forEach(function(p){g.fillStyle=bl; g.save(); g.translate(p[0],p[1]); for(let i=0;i<4;i++){g.rotate(R/2); lobe(24,10);} g.restore();});
    g.strokeStyle='rgba(60,55,50,0.4)'; g.lineWidth=2; g.strokeRect(1,1,254,254);});
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
wall('win',  [KX,0], [KX,KZ],[-1,0],'kitchen',{wins:[[0.66,2.64,0.1,2.25]]});                                         // kitchen window wall
wall('a_door',[0,0],[rn,0],[0,-1],'bed1',{holes:[[d1[0],d1[1]]]});
wall('a_l',[0,0],[0,AZ],[1,0],'bed1'); wall('a_far',[0,AZ],[r2,AZ],[0,1],'bed1',{wins:[[0.6,1.9,1.05,2.05]]});
wall('a_r',[r2,AZ],[r2,NZ],[-1,0],'bed1'); wall('a_ret',[rn,NZ],[r2,NZ],[0,-1],'bed1'); wall('a_rn',[rn,NZ],[rn,0],[-1,0],'bed1');
wall('b_door',[NX,0],[BX,0],[0,-1],'bed2',{holes:[[d2[0]-NX,d2[1]-NX]]});
A.box(NX-rn,H,-NZ,M(0x7f8682,'bed2'),(rn+NX)/2,H/2,NZ/2).receiveShadow=false;      // the 24 cm between the study's closet wall and bedroom 2's niche is solid
wall('b_nb',[NX,0],[NX,NZ],[1,0],'bed2'); wall('b_ret',[NX,NZ],[bl,NZ],[0,1],'bed2');  // the wardrobe niche
wall('b_l',[bl,NZ],[bl,AZ],[1,0],'bed2'); wall('b_far',[bl,AZ],[BXB,AZ],[0,1],'bed2',{wins:[[1.44,2.18,1.3,1.95]]});
wall('b_rb',[BXB,AZ],[BXB,ZJ],[-1,0],'bed2'); wall('b_rj',[BXB,ZJ],[BX,ZJ],[0,-1],'bed2'); wall('b_r',[BX,ZJ],[BX,0],[-1,0],'bed2',{wins:[[0.15,1.75,1.0,2.15]]});      // the wall by the bed, the step in, and the window wall
wall('wc_n',[WC.x0,WC.z0],[WC.x1,WC.z0],[0,1],'wc',{holes:[[wd[0]-WC.x0,wd[1]-WC.x0]]});
wall('wc_w',[WC.x0,WC.z0],[WC.x0,WC.z1],[1,0],'wc'); wall('wc_e',[WC.x1,WC.z0],[WC.x1,WC.z1],[-1,0],'wc'); wall('wc_s',[WC.x0,WC.z1],[WC.x1,WC.z1],[0,-1],'wc');
wall('ba_w',[BA.x0,BA.z0],[BA.x0,BA.z1],[1,0],'bath',{holes:[[bd[0]-BA.z0,bd[1]-BA.z0]]});
wall('ba_n',[BA.x0,BA.z0],[BA.x1,BA.z0],[0,1],'bath'); wall('ba_e',[BA.x1,BA.z0],[BA.x1,BA.z1],[-1,0],'bath',{wins:[[(bd[0]+bd[1])/2-BA.z0-0.25,(bd[0]+bd[1])/2-BA.z0+0.25,1.65,2.15],[0.3,0.7,1.8,2.2]]}); wall('ba_s',[BA.x0,BA.z1],[BA.x1,BA.z1],[0,-1],'bath');

/* ---------- doors: frames on both sides, a hinged leaf in between ---------- */
A.doorFrame('far',d1[0],d1[1]); A.doorFrame('far',d2[0],d2[1]); A.doorFrame('a_door',d1[0],d1[1]); A.doorFrame('b_door',d2[0]-NX,d2[1]-NX);
A.doorFrame('end',en[0],en[1]); A.doorFrame('tv',bd[0]-KZ,bd[1]-KZ); A.doorFrame('ba_w',bd[0]-BA.z0,bd[1]-BA.z0);
A.doorFrame('blk_n',wd[0]-BLK,wd[1]-BLK); A.doorFrame('wc_n',wd[0]-WC.x0,wd[1]-WC.x0);
A.doorLeaf('bed1',d1[1],0,R,R/2,'living',0.78);
A.doorLeaf('bed2',d2[0],0,0,R*0.44,'living',0.78);      // hinged on the side by the shoe cabinet, it swings in toward the wardrobe
A.doorLeaf('bath',W,bd[0],-R/2,0,'living',bd[1]-bd[0]);  // hinged on the left as you walk in, swings into the bathroom
A.doorLeaf('wc',wd[0],ZW,0,-R/2*0.92,'living',0.65);       // hinged by the wall, it swings in and comes to rest beside the basin
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
rect('left',L-0.62,L-0.42,0.42,0.72,0xe6e9e5,0.008); rect('left',L-0.6,L-0.44,0.44,0.7,0xf2f4f1,0.009);      // and a smaller white box low down, from the photo
rect('blk_w',0.2,0.3,1.35,1.5,0xd9dcd8,0.008);                              // intercom
rect('tv',0.3,0.38,1.25,1.37,0xdfe2de,0.008);                           // light switch
inRoom('living',function(){
  const n=G(null,'n');
  K.ceilDisc(null,W/2,3.6,'L:living'); K.ceilDisc(null,W/2+0.3,1.3,'L:living');   // flush ceiling lights, kept in every option
  // today: wardrobe on the entrance wall. The vacuum stays in every option.
  box(0.86,1.75,0.44,0xf8f8f6,1.6,0.875,L-0.23,n); box(0.006,1.7,0.004,0xc5c9c5,1.6,0.875,L-0.452,n);
  [1.56,1.64].forEach(function(x){box(0.012,0.12,0.02,0xc9cdc9,x,0.95,L-0.46,n);});
  box(0.42,0.3,0.36,0x2b2f38,1.42,1.9,L-0.23,n); box(0.3,0.24,0.3,0xc23a4a,1.82,1.87,L-0.22,n);
  const vg=A.vacuumMesh=G(); vg.position.set(BLK-0.15,0,L-0.16); vg.rotation.y=-R/2; K.vacuum(vg);           // stick vacuum on its dock, by the front door
  box(0.02,0.22,0.08,0xf4f4f1,BLK-0.012,1.0,L-0.16); box(0.006,0.012,0.012,0x8fbd9b,BLK-0.025,1.08,L-0.16);
});

/* ---------- kitchen. The fronts stay charcoal and yellow in every design: they cannot be painted. ---------- */
/* sink run along z = KZ, from the window wall: 60 cupboard | 56 sink over the pull-out bin | 24 cupboard, then the fridge.
   cooktop run along z = 0, from the window wall: 3 filler | 67 oven under a domino hob | 28 door | 57 drawers. */
const KL=A.KL=(function(){const x1=KX, x0=KX-1.4, c1=KX, c0=KX-1.55;
  return {x0:x0,x1:x1,sx:x1-0.88,wl:x1-1.2,c0:c0,c1:c1,hx:c1-0.365,dx:c0+0.285};})();
const brick=function(rows,cols){const t=canvasTex(256,256,function(g){g.fillStyle='#f3f1ea'; g.fillRect(0,0,256,256); g.strokeStyle='#d5d2c8'; g.lineWidth=2;
  for(let r=0;r<rows;r++){const y=r*256/rows; g.beginPath(); g.moveTo(0,y); g.lineTo(256,y); g.stroke();
    for(let c=0;c<=cols;c++){const x=(c+(r%2?0.5:0))*256/cols; g.beginPath(); g.moveTo(x,y); g.lineTo(x,y+256/rows); g.stroke();}}}); return A.MT(t,'kitchen');};
rect('kback',KL.x0-W,KX-W,0.92,1.47,brick(4,6),0.006);                       // sink backsplash
rect('far',KL.c0,KX,0.92,1.55,brick(5,6),0.006);                            // cooktop backsplash
rect('far',KX-0.6,KX-0.42,1.85,2.1,0x9aa3ad,0.008); rect('far',KX-0.32,KX-0.14,1.85,2.1,0x9fc4d6,0.008); // posters
A.windowOn('win',0.61,2.69,0.05,2.3,2,0,'kitchen');                          // kitchen window, 198 wide, between the two runs
rect('win',0.61,2.69,1.0,1.1,0xe9ece8,0.010);
for(let i=1;i<12;i++){const u=0.66+i*1.98/12; rect('win',u-0.006,u+0.006,0.1,1.0,0xf4f5f3,0.009);} // bars, lower pane
A.sunPatch('kitchen',KX-0.05,1.65,1.9,3.0,-R/2);
inRoom('kitchen',function(){
  const n=G(null,'n'), d=G(null,'abc');              // today / redesigned
  const top=0xebe7dc, line=0x17181a, char=0x34373c, yel=0xf0d21c;
  box(0.22,0.28,0.85,0xf6f7f5,KX-0.11,2.55,1.65);                            // air conditioner above the window
  box(KX-W,0.28,0.32,0xf4f4f1,(W+KX)/2,H-0.14,KZ-0.78);                                    // a beam across the kitchen ceiling, out from the sink wall, from the photos
  const x1=KL.x1, x0=KL.x0, zf=KZ-0.6, sx=KL.sx, wl=KL.wl, c1=KL.c1, c0=KL.c0;
  // carcasses: charcoal with yellow wall cupboards
  box(0.23,0.76,0.58,char,x0+0.115,0.5,KZ-0.29); box(0.59,0.76,0.58,char,x1-0.3,0.5,KZ-0.29);                         // either side of the sink
  [x1-1.095,x1-0.665].forEach(function(x){box(0.13,0.76,0.03,char,x,0.5,KZ-0.565);});                                    // fixed strips either side of the pull-out bin (built in life.js)
  box(1.55,0.76,0.57,char,(c0+c1)/2,0.5,0.295);                                                                          // backs stop 1 cm short of the wall plane, or they flicker through it into bedroom 2
  [1.48,2.04].forEach(function(y){box(0.8,0.02,0.35,yel,wl+0.4,y,KZ-0.175);}); [0.01,0.79].forEach(function(o){box(0.02,0.56,0.35,yel,wl+o,1.76,KZ-0.175);});      // the yellow wall cupboard, 80 wide, over the sink
  box(0.78,0.54,0.02,0xf4f1ea,wl+0.4,1.76,KZ-0.012); box(0.76,0.016,0.3,yel,wl+0.4,1.765,KZ-0.17); box(0.76,0.004,0.3,0xf4f1ea,wl+0.4,1.757,KZ-0.17);   // white inside, one shelf with a yellow edge
  [0.06,0.74].forEach(function(o){box(0.02,0.02,0.16,0x9aa0a4,wl+o,1.98,KZ-0.3).rotation.x=0.6;});                                             // the gas struts of its lift-up door
  box(1.4,0.12,0.5,0x1d1f21,(x0+x1)/2,0.06,KZ-0.25);                          // plinth
  box(0.27,0.04,0.63,top,x0+0.125,0.9,KZ-0.305); box(0.62,0.04,0.63,top,x1-0.3,0.9,KZ-0.305); box(0.56,0.04,0.1,top,sx,0.9,KZ-0.57); box(0.56,0.04,0.12,top,sx,0.9,KZ-0.05);   // counter with a cut-out, the basin sunk into it
  const sz=KZ-0.32;
  box(0.56,0.015,0.4,0xd9d5c8,sx,0.7,sz); [[-0.275,0],[0.275,0]].forEach(function(q){box(0.012,0.22,0.4,0xcfcbbd,sx+q[0],0.81,sz);}); [[-0.195],[0.195]].forEach(function(q){box(0.56,0.22,0.012,0xcfcbbd,sx,0.81,sz+q[0]);});
  cyl(0.025,0.004,0x8d9296,sx,0.71,sz,null,12);
  [x1-0.3,x1-0.6,x1-1.16].forEach(function(x){box(0.006,0.74,0.004,line,x,0.5,zf-0.002);});
  [x1-0.34,x1-0.26,x1-1.2].forEach(function(x){box(0.012,0.13,0.02,line,x,0.78,zf-0.012);});
  // gooseneck tap: riser, an arc, a short nozzle over the middle of the basin, and a lever
  cyl(0.022,0.03,0xc9cdd0,sx,0.935,KZ-0.09,null,14); cyl(0.013,0.26,0xc9cdd0,sx,1.07,KZ-0.09,null,10);
  const arc=A.torus(0.085,0.013,0xc9cdd0,sx,1.2,KZ-0.175,null,R); arc.rotation.y=R/2;
  cyl(0.013,0.05,0xc9cdd0,sx,1.175,KZ-0.26,null,10); box(0.012,0.012,0.07,0xc9cdd0,sx+0.04,0.97,KZ-0.11);
  A.sink={x:sx,z:KZ-0.26,y1:1.15,y0:0.715};
  box(0.3,0.02,0.5,0x2a2c2e,sx,0.135,KZ-0.3);                                 // floor of the bin compartment
  // things on the counter and on top of the cabinet today; cleared in the redesign
  A.rbox(0.3,0.42,0.018,0xc9a46a,x1-0.16,1.13,KZ-0.05,n,0.008).rotation.x=-0.12;                               // a bamboo board leaning on the tiles,
  cyl(0.05,0.13,0xb9bdc0,sx+0.38,0.985,KZ-0.12,n,12); for(let i=0;i<5;i++) box(0.012,0.12,0.004,0x2a2c2e,sx+0.36+i*0.012,1.09,KZ-0.12,n).rotation.z=(i-2)*0.15;   // a steel mesh cup of utensils,
  [[0.12,0xe8c93a],[0.2,0x5ba7d8]].forEach(function(q){cyl(0.028,0.12,A.reg(new THREE.MeshLambertMaterial({color:q[1],transparent:true,opacity:0.8}),'kitchen'),sx+q[0],0.98,KZ-0.06,n,10); cyl(0.008,0.04,0xf4f4f1,sx+q[0],1.06,KZ-0.06,n,6);});   // two soap pumps behind the sink,
  cyl(0.035,0.1,A.reg(new THREE.MeshLambertMaterial({color:0xe6f0f2,transparent:true,opacity:0.5}),'kitchen'),sx-0.1,0.97,KZ-0.42,n,12); box(0.07,0.008,0.15,0x2a2c2e,sx-0.32,0.925,KZ-0.45,n).rotation.y=0.3;   // a glass of water, a phone
  (function(){const g=G(n); g.position.set(x0+0.13,0.92,KZ-0.2); A.rbox(0.24,0.36,0.3,0xece4cf,0,0.18,0,g,0.04); box(0.16,0.14,0.005,0xc9c4b4,0,0.16,-0.152,g); box(0.08,0.012,0.08,0x8d9296,0,0.06,-0.1,g);   // the water bar, cream, with its dispensing nook,
    cyl(0.035,0.24,0x5fae3e,0.04,0.48,0.02,g,12); cyl(0.012,0.04,0xd23b2f,0.04,0.62,0.02,g,8);})();                               // and the green dish soap standing on it
  box(0.19,0.27,0.07,0xd9c68a,wl+0.27,2.185,KZ-0.2,n); box(0.17,0.08,0.004,0x2f7d4f,wl+0.27,2.24,KZ-0.236,n);        // on top of the cupboard: a box of cereal,
  cyl(0.045,0.13,A.reg(new THREE.MeshLambertMaterial({color:0xe8f0f2,transparent:true,opacity:0.5}),'kitchen'),wl+0.08,2.115,KZ-0.2,n,12); cyl(0.03,0.04,0x1d1f21,wl+0.42,2.07,KZ-0.2,n,10);
  [0.56,0.64,0.72].forEach(function(x){cyl(0.035,0.09,A.reg(new THREE.MeshLambertMaterial({color:0xe8f0f2,transparent:true,opacity:0.45}),'kitchen'),wl+x,2.14,KZ-0.18,n,12,0.012); cyl(0.004,0.08,0xe8f0f2,wl+x,2.23,KZ-0.18,n,6); cyl(0.03,0.004,0xe8f0f2,wl+x,2.27,KZ-0.18,n,10);});   // wine glasses upside down
  cyl(0.06,0.16,0x23355e,wl+0.84,2.13,KZ-0.18,n,14); cyl(0.062,0.03,0xd23b2f,wl+0.84,2.225,KZ-0.18,n,14);              // and a jar of whey
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
  cyl(0.11,0.26,0x1f2a52,fx-0.12,2.16,fz-0.02,n,16); cyl(0.112,0.05,0xc8323a,fx-0.12,2.31,fz-0.02,n,16); A.rbox(0.25,0.08,0.25,A.reg(new THREE.MeshLambertMaterial({color:0xe6eef0,transparent:true,opacity:0.5}),'kitchen'),fx+0.15,2.07,fz,n,0.03);   // a big whey jar and a glass bowl on the microwave
  box(0.08,0.36,0.08,0x1c1d1f,fx+0.31,1.93,fz+0.15,n);                                                           // and a slim black speaker beside it
  // cooktop side. The oven (67 wide, 58 high) sits under a two-ring domino hob, its rings one behind the other.
  box(1.55,0.12,0.49,0x1d1f21,(c0+c1)/2,0.06,0.255); box(1.57,0.04,0.61,0xf4f3ee,(c0+c1)/2,0.9,0.315);
  const hx=KL.hx;
  [c1-0.03,c1-0.7,c1-0.98].forEach(function(x){box(0.006,0.74,0.004,line,x,0.5,0.602);});
  box(0.62,0.58,0.006,0x0f1011,hx,0.56,0.603); box(0.44,0.27,0.004,0x1b2126,hx,0.48,0.607);              // oven: door with a window,
  box(0.48,0.018,0.026,0x8d9296,hx,0.71,0.622); [-0.22,0.22].forEach(function(o){box(0.016,0.016,0.02,0x8d9296,hx+o,0.71,0.61);});      // a bar handle on stand-offs,
  [-0.23,-0.15,0.15,0.23].forEach(function(o){cyl(0.016,0.014,0x8d9296,hx+o,0.8,0.611,null,14).rotation.x=R/2;}); box(0.1,0.03,0.004,0x24423a,hx,0.8,0.607);   // knobs and a clock
  A.rbox(0.3,0.012,0.5,0x101112,hx-0.1,0.926,0.31,null,0.004);                                        // hob
  [[0.19,0.062],[0.42,0.08]].forEach(function(q){cyl(q[1],0.004,0x2a2c2e,hx-0.1,0.934,q[0],null,28); A.torus(q[1]*0.6,0.0025,0x55595c,hx-0.1,0.9365,q[0]).rotation.x=R/2;});
  [-0.03,0.03].forEach(function(o){cyl(0.008,0.002,0x8d9296,hx-0.1+o,0.933,0.535,null,10);});                 // touch controls at the front edge
  box(0.012,0.13,0.02,line,c1-0.74,0.78,0.612);
  [0.34,0.62].forEach(function(y){box(0.56,0.006,0.004,line,c0+0.285,y,0.602);}); [0.26,0.78].forEach(function(y){box(0.26,0.014,0.02,line,c0+0.285,y,0.612);});
  box(0.5,0.03,0.11,0x9a6b3f,c0+0.3,1.6,0.065);                                                     // spice shelf
  [0,1,2,3,4].forEach(function(i){cyl(0.028,0.11,[0xc63d2f,0xd9b23a,0x5b8f4a,0xb9772e,0xe5e0d2][i],c0+0.12+i*0.09,1.67,0.06);});
  K.ceilDisc(null,W+1.05,1.65,'L:kitchen');
  // redesign: light strip under the wall cabinet, runner, hanging plant
  box(0.76,0.012,0.02,A.lampMat('L:kitchen',0xf4f1e6,0xffe9c4,1),wl+0.4,1.462,KZ-0.33,d);
  A.pool('L:kitchen',0xffd9a0,wl+0.4,0.925,KZ-0.3,0.5,d,0.55);
  const rr=G(d); rr.position.set(W+1.05,0,1.65); rr.rotation.y=R/2; K.rug(rr,0.7,1.9,'runner');
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
  K.keyboard(null,0.7,0.756,AZ+0.42,R/2); K.mouse(null,1.0,0.756,AZ+0.42);
  const c1=G(); c1.position.set(0.65,0,AZ+0.95); c1.rotation.y=R/2; K.officeChair(c1,0xd8d8d2);                    // chair (faces the desk)
  A.desks={desk1:{chair:c1,dir:[0,-1],screen:K.monitor(null,0.7,0.755,AZ+0.17,0,0.54,0.31)}};
  seat({id:'desk1',label:'Desk by the window',room:'bed1',x:0.65,z:AZ+0.95,y:0.52,h:R,type:'sit'});
  box(0.38,1.75,0.38,0xeef0f1,0.25,0.875,-0.25); [0.35,0.7,1.05,1.4].forEach(function(y){box(0.385,0.012,0.385,0xd5d8da,0.25,y,-0.25);});   // plastic cube tower by the door
  const cz0=NZ+0.03, cz1=-0.06, cm=(cz0+cz1)/2;                         // built-in closet beside the door, in the 53 cm step of the wall
  box(0.53,2.3,cz1-cz0,0xe9dfcf,rn-0.265,1.15,cm);
  [cz0+0.01,cm,cz1-0.01].forEach(function(z){box(0.004,2.26,0.006,0xcfc4b2,rn-0.532,1.15,z);}); [cm-0.07,cm+0.07].forEach(function(z){box(0.02,0.2,0.014,0xa9a59c,rn-0.54,1.25,z);});
  // today: single bed on the right-hand wall
  box(0.9,0.22,2.0,0xc9a66b,r-0.46,0.2,AZ+1.02,n); A.rbox(0.9,0.2,2.0,0xd9c7b0,r-0.46,0.41,AZ+1.02,n); A.rbox(0.6,0.1,0.38,0xe9e2d4,r-0.46,0.56,AZ+0.3,n);
  seat({id:'bed1',label:'Bed (bedroom 1)',room:'bed1',x:r-0.46,z:AZ+1.1,y:0.51,h:0,type:'lie',only:'n'});
  // proposals: second desk where the bed was, shelves above it, two desk lamps, rug, plants
  const dz=AZ+1.4, dk=G(d);
  box(0.65,0.035,1.3,0xc99a5b,r-0.335,0.74,dz,dk);
  [[r-0.62,dz-0.61],[r-0.05,dz-0.61],[r-0.62,dz+0.61],[r-0.05,dz+0.61]].forEach(function(p){box(0.035,0.72,0.035,0xfbfaf6,p[0],0.36,p[1],dk);});
  A.shop(dk,'Second desk','LAGKAPTEN ADILS desk','ikea','Or any 120 to 140 cm desk with an oak top and white legs.');
  K.keyboard(d,r-0.42,0.758,dz-0.1,0); K.mouse(d,r-0.42,0.758,dz+0.2); A.rbox(0.24,0.014,0.32,0xb9bdc0,r-0.35,0.765,dz+0.47,d,0.005);      // keyboard, mouse, a closed laptop
  const ch=G(d); ch.position.set(r-1.05,0,dz); K.officeChair(ch,0x8fbd9b); A.shop(ch,'Desk chair','office chair','ikea');
  A.desks.desk2={chair:ch,dir:[1,0],screen:K.monitor(d,r-0.15,0.7575,dz-0.1,-R/2,0.6,0.34)};
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

/* ---------- bedroom 2, from the photos, the video and the tape. Along the left: by the door the chest of drawers and the
   3-door wardrobe side by side in a niche 43 deep, then the cube shelf in the 85.5 between the wall and the column
   (25.5 x 61). Beside the column the bed, 140 wide, in the 178 between the column and the wall, 38 cm from it; that wall
   has the bedside table, the TV on an arm and the bike. From the bed's foot on the wall steps in 26 cm: 152 from the
   column to the big window, with the desk under it facing the wardrobe. ---------- */
A.windowOn('b_far',1.39,2.23,1.25,2.0,2,5,'bed2');                     // small barred window above the bed
A.windowOn('b_r',0.1,1.8,0.95,2.2,2,6,'bed2');                         // big window, over the desk
A.sunPatch('bed2',BX-0.05,-1.13,1.6,2.2,-R/2);
inRoom('bed2',function(){
  const n=G(null,'n'), d=G(null,'abc'), l=bl, kz=NZ-0.25, dkz=ZJ+0.95, CX=l+0.855+0.1275;
  K.ceilDisc(null,CX+0.55,-2.35,'L:bed2');           // the round light over the bed, beside the beam
  box(0.26,0.3,-AZ,0xf3f3ef,CX,H-0.15,AZ/2);          // the beam that rests on the column, from the door wall to the window
  box(0.22,0.28,0.85,0xf6f7f5,BX-0.11,2.5,dkz); box(0.005,0.1,0.1,0xe8762a,BX-0.222,2.53,dkz-0.15);                   // air conditioner above the big window, a sticker on it,
  box(0.03,0.12,0.08,0xf4f4f1,BX-0.015,2.5,dkz+0.62); (function(){const pts=[[BX-0.08,2.4,dkz+0.42],[BX-0.06,2.25,dkz+0.5],[BX-0.07,2.12,dkz+0.46],[BX-0.05,2.18,dkz+0.55],[BX-0.06,2.3,dkz+0.6],[BX-0.03,2.5,dkz+0.62]].map(function(q){return new THREE.Vector3(q[0],q[1],q[2]);});
    const m=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),24,0.006,6,false),M(0xf4f4f1)); scene.add(m);})();      // its cord looped in a knot to the socket
  const wz=NZ+0.02+0.585, cz=-0.03-0.25;                                // the wardrobe at the far end of the niche, the chest of drawers by the door
  box(0.5,1.9,1.17,0xf8f8f6,NX+0.25,0.95,wz); [-0.39,0,0.39].forEach(function(o){box(0.006,1.82,0.37,0xfdfdfb,NX+0.503,0.97,wz+o);}); box(0.004,1.4,0.12,0xb9c6cc,NX+0.508,1.05,wz);
  [-0.23,0.16,0.23].forEach(function(o){box(0.012,0.2,0.012,0xb9bdc0,NX+0.514,1.02,wz+o);});                     // door handles
  A.rbox(0.36,0.42,0.3,0x1e2a44,NX+0.25,2.11,wz-0.38,n,0.08); box(0.003,0.16,0.04,0xf4f4f1,NX+0.432,2.12,wz-0.38,n);       // on the wardrobe: a navy duvet bag,
  box(0.3,0.16,0.22,0x5b8f3a,NX+0.25,1.98,wz-0.1,n); A.rbox(0.38,0.36,0.42,0xd8d8d2,NX+0.25,2.08,wz+0.32,n,0.08);            // a green cool bag, a big check bag,
  for(let i=0;i<4;i++) box(0.004,0.36,0.06,0x2f3133,NX+0.441,2.08,wz+0.16+i*0.11,n);
  /* by the door, beside the wardrobe: an oak-effect shoe cabinet, three tilting flaps, a black gap above each */
  box(0.28,1.32,0.5,0xc9a473,NX+0.14,0.66,cz); box(0.3,0.02,0.52,0xb8925f,NX+0.15,1.33,cz);
  [[0.06,0.48],[0.5,0.92],[0.94,1.3]].forEach(function(q){box(0.022,q[1]-q[0]-0.02,0.48,0xcfab7a,NX+0.29,(q[0]+q[1])/2,cz).rotation.z=-0.04; box(0.004,0.012,0.48,0x1d1f21,NX+0.284,q[1]-0.004,cz);});
  [[0.06,0xc8323a,0.12],[-0.02,0xc8323a,0.11],[0.12,0xd94a3a,0.17]].forEach(function(q,i){box(0.04,q[2],0.06,q[1],NX+0.12,1.34+q[2]/2,cz+0.14-i*0.06,n);});      // deodorants,
  [[-0.04,0x1d1f21,0.24],[-0.17,0x1d1f21,0.22]].forEach(function(q){cyl(0.032,q[2],q[1],NX+0.14,1.34+q[2]/2,cz+q[0],n,12); cyl(0.008,0.04,0x1d1f21,NX+0.14,1.36+q[2],cz+q[0],n,6);});   // black pump bottles,
  [0.02,-0.1].forEach(function(z){box(0.04,0.09,0.03,A.reg(new THREE.MeshLambertMaterial({color:0xe8d9a8,transparent:true,opacity:0.7}),'bed2'),NX+0.08,1.385,cz+z,n);});      // perfume
  box(0.18,0.03,0.05,0x2a2c2e,NX+0.2,1.355,cz-0.22,n);                                                                  // and a brush
  [[0.0],[0.12]].forEach(function(q,i){const g=G(n); g.position.set(NX+0.5,0.02+i*0.1,cz-0.1+q[0]); A.rbox(0.28,0.03,0.11,0xd9c4a3,0,0,0,g,0.012); box(0.07,0.03,0.1,0xb89a72,-0.05,0.03,0,g); box(0.07,0.03,0.1,0xb89a72,0.06,0.03,0,g);});      // a pair of sandals
  sph(0.12,0xd9762e,NX+0.4,0.12,cz+0.17,n); cyl(0.09,0.17,0xf1f1ee,NX+0.62,0.085,cz-0.32,n,14,0.1);                     // a basketball, a paint tub
  (function(){const dl=A.door('bed2').p; box(0.5,0.03,0.025,0x1d1f21,0.38,1.8,-0.035,dl); [0.18,0.3,0.42,0.54].forEach(function(x){box(0.015,0.05,0.035,0x1d1f21,x,1.77,-0.05,dl);});   // on the back of the door: a black hook rail,
    A.rbox(0.3,0.95,0.03,0xf4f3ef,0.2,1.3,-0.07,dl,0.012); A.rbox(0.18,0.08,0.18,0xa89060,0.36,1.72,-0.11,dl,0.03); A.rbox(0.18,0.08,0.18,0x5a2f2f,0.42,1.68,-0.12,dl,0.03);   // a white towel, two caps,
    A.rbox(0.26,0.4,0.12,0x1d1f21,0.5,1.45,-0.1,dl,0.04);})();                                                            // and a black bag
  const kx=l+0.385;                                                     // 2 x 4 cube shelf between the wall and the column
  const ks=G(); ks.position.set(kx,0,kz); ks.rotation.y=-R/2; K.kallax(ks,['bx','sb','yb','xb'],0xfafaf8,{box:0xd9c9a8,box2:SAGE,seed:5});        // open cubes facing the door: books and baskets
  [[-0.28,0x1d1f21],[-0.15,0xf0d21c],[-0.02,0xd9463e],[0.11,0xd9463e],[0.24,0x9fb4c8]].forEach(function(q){const c=G(n); c.position.set(kx+q[0],1.48,kz); box(0.11,0.035,0.05,q[1],0,0.03,0,c); box(0.06,0.025,0.045,0x3a4a5a,-0.005,0.06,0,c); [-0.035,0.035].forEach(function(x){cyl(0.012,0.05,0x111213,x,0.015,0,c,8).rotation.x=R/2;});});      // a row of model cars on top
  box(0.06,0.18,0.12,0x8a6a48,kx-0.36,1.57,kz+0.05,n);
  box(0.255,H,0.61,M(0xf5f6f3),CX,H/2,kz);                              // column, 25.5 x 61
  (function(){const sk=G(n); sk.position.set(l+0.22,0,kz+0.26); sk.rotation.x=-0.22;          // a cruiser skateboard leaning on the shelf, its deck painted
    const dk=canvasTex(32,96,function(g){g.fillStyle='#e8d9b8'; g.fillRect(0,0,32,96); g.fillStyle='#2f7d74'; g.fillRect(4,40,24,34); g.fillStyle='#1f4a8a'; g.font='bold 9px sans-serif'; g.save(); g.translate(18,70); g.rotate(-R/2); g.fillText('SANTA CRUZ',0,0); g.restore();});
    A.rbox(0.22,0.84,0.02,A.MT(dk,'bed2',true),0,0.44,0,sk,0.008,0.09); [0.18,0.7].forEach(function(y){box(0.16,0.03,0.04,0xb9bdc0,0,y,0.04,sk); [-0.08,0.08].forEach(function(x){cyl(0.03,0.04,0x2f8a9a,x,y,0.06,sk,12).rotation.z=R/2;});});})();
  box(0.06,0.06,0.3,0x25272b,BXB-0.15,1.6,AZ+0.95);                     // TV arm
  // today: the bed beside the column, its head on the far wall, bedside table in the 38 cm beside it, bike, pine desk under the window
  const bx=l+1.11+0.7;
  [0.12,0.6,1.1,1.6,1.9].forEach(function(z){box(1.36,0.12,0.09,0xdcc39a,bx,0.06,AZ+z,n);});                                      // pallet slats of pine under it,
  A.rbox(1.4,0.26,2.0,0x5c6a80,bx,0.26,AZ+1.02,n,0.03); A.rbox(1.38,0.06,1.98,0xf4f4f1,bx,0.41,AZ+1.02,n,0.03); [-0.34,0.34].forEach(function(dx){A.rbox(0.6,0.09,0.4,0xfafafa,bx+dx,0.48,AZ+0.3,n,0.042);});   // a grey upholstered base, the mattress, pillows
  const stripe=canvasTex(64,64,function(g){g.fillStyle='#f2f0ea'; g.fillRect(0,0,64,64); g.fillStyle='#5f6f86'; for(let y=0;y<64;y+=16){g.fillRect(0,y,64,6); g.fillStyle='#8a97aa'; g.fillRect(0,y+8,64,1.5); g.fillStyle='#5f6f86';}});
  stripe.wrapS=stripe.wrapT=THREE.RepeatWrapping; stripe.repeat.set(3,4);
  const fn=G(n); A.rbox(1.42,0.08,1.45,A.MT(stripe,'bed2',true),bx,0.47,AZ+1.27,fn,0.035); [[-0.3,0.95],[0.25,1.35],[-0.1,1.7]].forEach(function(q,i){A.rbox(0.7,0.05,0.45,A.MT(stripe,'bed2',true),bx+q[0],0.51,AZ+q[1],fn,0.025,0.2).rotation.y=0.3*(i-1);});   // the striped duvet, rumpled
  const cn=G(n); cn.position.set(bx,0,AZ+2.03); A.rbox(1.42,0.31,1.32,0xe9e2d4,0,0.565,-0.66,cn,0.12); cn.visible=false;
  A.beds={n:{flat:fn,cover:cn,axis:'z'}};
  seat({id:'bedL',label:'Bed, left side',room:'bed2',x:bx-0.33,z:AZ+1.04,y:0.41,h:0,type:'lie',only:'n'});
  seat({id:'bedR',label:'Bed, right side',room:'bed2',x:bx+0.33,z:AZ+1.04,y:0.41,h:0,type:'lie',only:'n'});
  (function(){const g=G(n); g.position.set(BXB-0.2,0,AZ+0.24);                              // an oak bedside table with a rattan drawer, on splayed legs, the TV box on it
    box(0.36,0.025,0.32,0xc9a473,0,0.52,0,g); box(0.34,0.16,0.3,0xc19a68,0,0.43,0,g);
    const rt=canvasTex(32,16,function(c){c.fillStyle='#d9c08f'; c.fillRect(0,0,32,16); c.strokeStyle='rgba(140,110,60,0.5)'; for(let x=0;x<32;x+=3){c.beginPath(); c.moveTo(x,0); c.lineTo(x,16); c.stroke();}});
    box(0.3,0.12,0.005,A.MT(rt,'bed2',true),-0.172,0.43,0,g).rotation.y=R/2; [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){box(0.03,0.36,0.03,0xc9a473,q[0]*0.14,0.18,q[1]*0.12,g).rotation.set(q[1]*0.08,0,-q[0]*0.08);});
    box(0.1,0.025,0.1,0x111213,0.02,0.545,0,g);})();
  box(0.04,0.58,1.0,0x25272b,BXB-0.4,1.6,AZ+0.95,n).rotation.y=-0.75;
  (function(){const g=G(n); g.position.set(BXB-0.2,0,AZ+1.2); g.rotation.y=R/2+0.04; g.userData.nc=true;      // mountain bike against the wall, beside the bed, under the TV
    [-0.52,0.52].forEach(function(x){A.torus(0.33,0.025,0x1b1c1e,x,0.36,0,g);});
    const a=box(0.62,0.04,0.04,0xd9652c,-0.18,0.62,0,g); a.rotation.z=0.5; const b=box(0.62,0.04,0.04,0x1b1c1e,0.2,0.62,0,g); b.rotation.z=-0.55;
    box(0.7,0.04,0.04,0x1b1c1e,0.02,0.83,0,g); box(0.04,0.04,0.36,0xd98a2b,0.42,0.98,0,g); box(0.2,0.05,0.1,0x1b1c1e,-0.3,0.92,0,g);})();
  box(0.7,0.05,1.5,0xd2b07a,BX-0.36,0.74,dkz,n);
  [dkz-0.7,dkz+0.7].forEach(function(z){box(0.08,0.72,0.08,0xd2b07a,BX-0.66,0.36,z,n); box(0.08,0.72,0.08,0xd2b07a,BX-0.08,0.36,z,n);});
  K.keyboard(n,BX-0.42,0.766,dkz-0.1,0,true); K.mouse(n,BX-0.42,0.766,dkz+0.2,true);
  const c3=G(n); c3.position.set(BX-1.1,0,dkz); K.officeChair(c3,0x2a2d31);
  A.desks.desk3={chair:c3,dir:[1,0],screen:K.monitor(n,BX-0.2,0.765,dkz-0.1,-R/2,0.6,0.34)};
  seat({id:'desk3',label:'Desk (bedroom 2)',room:'bed2',x:BX-1.1,z:dkz,y:0.52,h:R/2,type:'sit',only:'n'});
  // proposals: the bed turns 90 degrees to face the TV, a reading nook replaces the desk, the bike goes
  const bz=AZ+0.8;
  A.rbox(2.04,0.12,1.54,0xc99a5b,l+1.03,0.16,bz,d,0.02); [[0.1,-0.68],[1.96,-0.68],[0.1,0.68],[1.96,0.68]].forEach(function(q){cyl(0.03,0.1,0xc99a5b,l+q[0],0.05,bz+q[1],d,10);});   // oak frame on short legs
  A.rbox(2.0,0.2,1.5,0xfbfaf6,l+1.03,0.31,bz,d,0.07);                    // mattress
  const fp=G(d); A.rbox(1.32,0.09,1.56,0xf3efe6,l+1.36,0.42,bz,fp,0.04); A.rbox(0.16,0.1,1.56,0xffffff,l+0.74,0.425,bz,fp,0.045);     // duvet with its turned-back edge
  [-0.36,0.36].forEach(function(dz,i){A.rbox(0.42,0.09,0.64,0xffffff,l+0.33,0.453,bz+dz,d,0.042);                                   // sleeping pillows, flat at the head
    const p2=G(fp); p2.position.set(l+0.2,0.69,bz+dz); p2.rotation.z=0.4; K.cushions.push(p2); A.rbox(0.12,0.4,0.6,0xe9eef0,0,0,0,p2,0.055);     // made bed: a second pair stands on them, leaning back on the headboard,
    K.cushion(fp,i?SAGE:BLUE,l+0.35,0.655,bz+dz,0.85,0.45);});                                                                        // and a cushion leans on each
  A.rbox(0.07,0.7,1.56,0xc99a5b,l+0.04,0.72,bz,d,0.025); [-0.5,0,0.5].forEach(function(dz){box(0.006,0.6,0.01,0xa9825a,l+0.078,0.72,bz+dz,d);});
  A.rbox(0.62,0.05,1.6,SAGE,l+1.68,0.475,bz,fp,0.022);
  const cp=G(d); cp.position.set(l+2.03,0,bz); A.rbox(1.3,0.31,1.58,0xf3efe6,-0.65,0.565,0,cp,0.12); A.rbox(0.14,0.33,1.58,0xffffff,-1.3,0.565,0,cp,0.07); A.rbox(0.5,0.32,1.6,SAGE,-0.3,0.57,0,cp,0.12); cp.visible=false;
  A.beds.p={flat:fp,cover:cp,axis:'x'};
  seat({id:'bedL',label:'Bed, window side',room:'bed2',x:l+1.07,z:bz-0.35,y:0.41,h:R/2,type:'lie',only:'abc'});
  seat({id:'bedR',label:'Bed, room side',room:'bed2',x:l+1.07,z:bz+0.35,y:0.41,h:R/2,type:'lie',only:'abc'});
  box(0.36,0.42,0.36,0xc99a5b,l+0.2,0.21,bz+0.9,d); K.tableLamp(d,l+0.2,0.42,bz+0.9,'L:bed2');
  box(0.04,0.58,1.0,0x25272b,BXB-0.06,1.4,bz,d);                        // TV flat on the wall, straight ahead of the bed
  const nk=G(d); nk.position.set(BX-0.62,0,dkz+0.4); nk.rotation.y=R-0.35;      // toward the door wall, so there is room to walk past the column to the bed
  K.armchair(nk,BLUE,0x86adc0); K.cushion(nk,0xfbfaf6,-0.12,0.62,0.05,0.9,0.35);
  A.shop(nk,'Reading armchair','STRANDMON','ikea','A wing chair. Pick a light blue or beige cover.');
  seat({id:'nook',label:'Reading nook',room:'bed2',x:BX-0.62,z:dkz+0.4,y:0.43,h:R-0.35+R/2,type:'sit',only:'abc',recline:0.2});
  const fl=G(d); fl.position.set(BX-0.26,0,dkz+0.8); K.floorLamp(fl,'L:bed2'); A.shop(fl,'Reading lamp','floor lamp reading','ikea');
  K.roundRug(d,BX-0.9,dkz+0.3,0.8,0xd8ccb2,0xefe7d6);
  const st=G(d); cyl(0.18,0.03,0xc99a5b,BX-0.3,0.5,dkz-0.25,st,24); cyl(0.02,0.5,0xfbfaf6,BX-0.3,0.25,dkz-0.25,st,8); K.bookStack(st,BX-0.3,0.515,dkz-0.25,3,5);
  A.shop(st,'Side table','GLADOM tray table','ikea');
  K.curtain(d,BX-0.07,ZJ+0.07,0.2,false,0.2,2.35); K.curtain(d,BX-0.07,ZJ+1.83,0.2,false,0.2,2.35);
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
    pos.push(Math.sign(s)*Math.pow(Math.abs(s),e)*q[0]+(q[6]||0),q[2],Math.sign(c)*Math.pow(Math.abs(c),e)*q[1]+(q[4]||0));}});
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
  return t;
}
function soap(g,x,z){cyl(0.022,0.085,0x7fb39a,x,0.0425,z,g,14); cyl(0.007,0.035,0xf4f4f1,x,0.1,z,g,8); box(0.012,0.008,0.04,0xf4f4f1,x,0.118,z-0.014,g);}   // pump bottle of hand soap
inRoom('wc',function(){
  /* from the photos: white tiles to 1.2 m. On the far wall a small rectangular basin in the corner by the door, tap on its right, a soap
     pump with a bamboo front on its left, the pipes showing below, a black hand towel on a white hook, and above it a black-framed mirror
     with a wire shelf. The toilet hangs on the wall to the right, a chrome flush plate on its tiled box, and the box's ledge holds a
     monstera print, a small plant, a striped picture, a candle, a reed diffuser and a woven ball. Black roll holder, small bin, a brush. */
  ['wc_n','wc_w','wc_e','wc_s'].forEach(function(k){tiled(k,1.2);});
  const mz=(WC.z0+WC.z1)/2, cr=M(0xc9cdd0), blk=M(0x18191b);
  const pz=WC.x1-0.2;                                                         // the boxed-in cistern along the whole wall, tiled, a ledge on top
  box(0.2,1.15,WC.z1-WC.z0-0.02,0xf6f6f3,WC.x1-0.1,0.575,mz);
  (function(){const t=tileWhite.clone(); t.needsUpdate=true; t.repeat.set((WC.z1-WC.z0)/0.6,1.15/0.3); const m=new THREE.Mesh(new THREE.PlaneGeometry(WC.z1-WC.z0-0.02,1.15),A.MT(t,'wc')); m.position.set(pz-0.002,0.575,mz); m.rotation.y=-R/2; scene.add(m);})();
  box(0.24,0.025,WC.z1-WC.z0-0.02,0xdedfdc,WC.x1-0.12,1.162,mz);
  const tb=A.rbox(0.52,0.33,0.37,0xfbfbfa,pz-0.26,0.425,mz,null,0.07,0.17); box(0.06,0.22,0.2,0xfbfbfa,pz-0.03,0.42,mz);      // the wall-hung bowl
  box(0.012,0.22,0.15,cr,pz-0.006,0.97,mz); cyl(0.045,0.01,0xdfe2e4,pz-0.014,0.97,mz,null,24).rotation.z=R/2; box(0.004,0.07,0.003,0x9aa0a4,pz-0.019,0.97,mz);   // the chrome flush plate and its button
  /* on the ledge */
  const ly=1.175, art=canvasTex(96,128,function(g){g.fillStyle='#f4f4f0'; g.fillRect(0,0,96,128);
    g.fillStyle='#4f7a68'; g.beginPath(); g.moveTo(20,120); g.bezierCurveTo(0,60,40,10,90,20); g.bezierCurveTo(80,60,60,100,20,120); g.fill();
    g.strokeStyle='#f4f4f0'; g.lineWidth=4; for(let i=0;i<6;i++){g.beginPath(); g.moveTo(30+i*8,100-i*12); g.lineTo(60+i*6,50-i*4); g.stroke();}
    g.fillStyle='#365a4c'; g.beginPath(); g.moveTo(10,70); g.bezierCurveTo(0,40,20,20,46,26); g.bezierCurveTo(36,50,26,64,10,70); g.fill();});
  const lean=function(w,h,z,mat,fr,tilt){const g=G(); g.position.set(WC.x1-0.04,ly,z); g.rotation.z=tilt; box(0.02,h,w,fr,-0.01,h/2,0,g); const m=new THREE.Mesh(new THREE.PlaneGeometry(w-0.05,h-0.05),mat); m.position.set(-0.022,h/2,0); m.rotation.y=-R/2; g.add(m); return g;};
  lean(0.42,0.56,5.36,A.MT(art,'wc'),0xd8d6d0,0.09);                                                   // a monstera print in a pale frame, leaning on the wall
  const stp=canvasTex(64,80,function(g){g.fillStyle='#e9e5dc'; g.fillRect(0,0,64,80); g.fillStyle='#b9b2a4'; for(let x=0;x<64;x+=6) g.fillRect(x,0,3,80); g.fillStyle='#3a3836'; g.fillRect(28,14,9,12); g.fillRect(25,26,15,30); g.fillRect(27,56,4,20); g.fillRect(34,56,4,20);});
  lean(0.25,0.3,5.86,A.MT(stp,'wc'),0xc9a46a,0.08);                                                    // a small striped print of a figure
  const pot=canvasTex(32,32,function(g){g.fillStyle='#f4f4f1'; g.fillRect(0,0,32,32); g.strokeStyle='#4a4a4a'; g.lineWidth=1.5; for(let i=-32;i<32;i+=8){g.beginPath(); g.moveTo(i,0); g.lineTo(i+16,16); g.lineTo(i,32); g.stroke();}});
  cyl(0.05,0.09,A.MT(pot,'wc',true),WC.x1-0.13,ly+0.045,5.15,null,12,0.055); cyl(0.05,0.015,blk,WC.x1-0.13,ly+0.008,5.15,null,12);
  for(let i=0;i<9;i++){const a=i*0.7; box(0.012,0.12,0.03,0x4f8a4a,WC.x1-0.13+Math.sin(a)*0.02,ly+0.15,5.15+Math.cos(a)*0.02).rotation.set(Math.cos(a)*0.4,a,Math.sin(a)*0.4);}
  cyl(0.035,0.08,A.reg(new THREE.MeshLambertMaterial({color:0x48b8b0,transparent:true,opacity:0.8}),'wc'),WC.x1-0.1,ly+0.04,5.68,null,14);           // a turquoise candle glass
  cyl(0.022,0.03,0xd9b25a,WC.x1-0.1,ly+0.015,5.95,null,12);                                                     // a little gold candle
  cyl(0.03,0.11,A.reg(new THREE.MeshLambertMaterial({color:0xd8a6b0,transparent:true,opacity:0.75}),'wc'),WC.x1-0.1,ly+0.055,6.05,null,12); cyl(0.012,0.02,0xd8a6b0,WC.x1-0.1,ly+0.12,6.05,null,8);
  for(let i=0;i<4;i++) box(0.004,0.26,0.004,0x8a6a48,WC.x1-0.1+(i%2?0.01:-0.01),ly+0.22,6.05+(i-1.5)*0.012).rotation.x=(i-1.5)*0.12;     // a reed diffuser
  A.torus(0.065,0.008,0xefeee8,WC.x1-0.11,ly+0.075,6.22).rotation.y=0.4; A.torus(0.065,0.008,0xefeee8,WC.x1-0.11,ly+0.075,6.22).rotation.x=1.2; A.torus(0.065,0.008,0xefeee8,WC.x1-0.11,ly+0.075,6.22).rotation.set(0.7,1.1,0);   // a woven white ball
  /* the black roll holder on the door wall, a small black bin under it, the brush on the other side of the bowl */
  const rx=WC.x1-0.42;
  cyl(0.04,0.006,blk,rx,0.74,WC.z0+0.004,null,20).rotation.x=R/2; box(0.012,0.012,0.06,blk,rx,0.74,WC.z0+0.035); box(0.13,0.012,0.012,blk,rx+0.06,0.74,WC.z0+0.065);
  cyl(0.055,0.1,0xfbfbf8,rx+0.07,0.74,WC.z0+0.065,null,16).rotation.z=R/2; box(0.09,0.004,0.18,0xfbfbf8,rx+0.07,0.62,WC.z0+0.13).rotation.x=0.4;
  A.rbox(0.2,0.27,0.18,blk,rx+0.05,0.135,WC.z0+0.12,null,0.02); box(0.2,0.01,0.18,0x2a2c2e,rx+0.05,0.275,WC.z0+0.12);
  cyl(0.04,0.1,0xfbfbfa,pz-0.12,0.05,WC.z1-0.12,null,14); cyl(0.008,0.32,0xfbfbfa,pz-0.12,0.26,WC.z1-0.12,null,8);
  /* the basin in the corner by the door */
  const bxc=WC.x0+0.4, hb=G(), bz=WC.z1-0.135; hb.position.set(bxc,0.85,bz);
  shell([[0.001,0.001,-0.14,2,0],[0.16,0.09,-0.14,6,0],[0.2,0.112,-0.12,10,0],[0.225,0.125,-0.08,12,0],[0.225,0.125,-0.006,12,0],[0.222,0.122,-0.002,12,0],[0.218,0.118,0,12,0],
    [0.13,0.085,0,8,-0.01,0,0.045],[0.126,0.081,-0.003,8,-0.01,0,0.045],[0.12,0.076,-0.02,7,-0.01,0,0.045],[0.1,0.062,-0.07,5,-0.01,0,0.045],[0.06,0.04,-0.1,3,-0.01,0,0.045],[0.001,0.001,-0.104,2,-0.01,0,0.045]],hb);
  cyl(0.016,0.004,cr,0.045,-0.102,-0.01,hb,16);
  const mx=mixer(hb,-0.15,0.07,0.8); mx.rotation.y=-0.9;                                          // the tap on the ledge, its spout turned into the bowl
  const sp=G(hb); sp.position.set(0.165,0,0.06); A.rbox(0.085,0.11,0.06,0xf6f6f3,0,0.055,0,sp,0.012); box(0.06,0.07,0.004,0xc99a5b,0,0.055,-0.031,sp); cyl(0.011,0.03,0xf6f6f3,0,0.125,0,sp,10); box(0.01,0.008,0.035,0xf6f6f3,0,0.14,-0.012,sp);   // soap pump with a bamboo front
  cyl(0.02,0.25,0xf2f2ef,0.045,-0.25,-0.01,hb,10); const dp=cyl(0.02,0.16,0xf2f2ef,0.045,-0.37,0.06,hb,10); dp.rotation.x=R/2;   // the white waste pipe into the wall
  [-0.09,0.12].forEach(function(x,i){box(0.03,0.03,0.04,cr,x,-0.3,0.115,hb); box(0.012,0.012,0.012,i?0xd23b2f:0x2f6fd6,x,-0.28,0.1,hb); const h=A.torus(0.08,0.007,0xb9bdc0,x+(i?-0.04:0.04),-0.22,0.06,hb,R); h.rotation.set(0,R/2,R/2+(i?0.4:-0.4));});      // angle valves and braided hoses
  A.basins={guest:{x:bxc-0.078,z:bz+0.013,y1:0.85+0.062,y0:0.765}};      // where the water leaves the tap, and where it lands
  box(0.025,0.04,0.02,0xf4f4f1,WC.x0+0.1,1.2,WC.z1-0.012); A.rbox(0.28,0.46,0.025,0x17181a,WC.x0+0.1,0.97,WC.z1-0.03,null,0.01);      // a black hand towel on a white hook
  const mir=G(); mir.position.set(bxc+0.02,1.6,WC.z1-0.012);                                    // the mirror: a thin black frame with round corners and a wire shelf under it
  A.rbox(0.4,0.54,0.018,blk,0,0,0,mir,0.006,0.03); A.rbox(0.38,0.52,0.004,0xb9c9cf,0,0,-0.011,mir,0.002,0.025);
  [0.0,0.035].forEach(function(y){box(0.42,0.006,0.006,blk,0,-0.27+y,-0.06,mir);}); box(0.42,0.004,0.07,blk,0,-0.285,-0.035,mir); [-0.2,0.2].forEach(function(x){box(0.006,0.05,0.07,blk,x,-0.27,-0.035,mir);});
  cyl(0.032,0.08,A.reg(new THREE.MeshLambertMaterial({color:0xdfe9ea,transparent:true,opacity:0.6}),'wc'),0.12,-0.24,-0.04,mir,12); for(let i=0;i<5;i++) box(0.003,0.22,0.003,0xc8a46a,0.12+(i-2)*0.008,-0.1,-0.04,mir).rotation.z=(i-2)*0.1;
  seat({id:'wc',label:'Guest toilet',room:'wc',x:WC.x1-0.5,z:mz,y:0.6,h:-R/2,type:'sit',hidden:true});
});

/* ---------- bathroom, from the photos. The washing machine stands right beside the door, against the same wall, in a niche
   under the boiler cupboard, so the open door rests along its side; the towel rail hangs on the back of the door. Sink on its
   navy cabinet on the right, a mirror and a navy wall cupboard over it; toilet on the far wall under a window, and the
   shower to the right of the toilet, with its own window and striped frosted glass ---------- */
inRoom('bath',function(){
  ['ba_w','ba_n','ba_e','ba_s'].forEach(function(k){tiled(k,H);});
  const tz=(bd[0]+bd[1])/2;
  A.windowOn('ba_e',tz-BA.z0-0.3,tz-BA.z0+0.3,1.6,2.2,1,0);              // window above the toilet
  A.windowOn('ba_e',0.25,0.75,1.75,2.25,1,0);                            // frosted window in the shower
  const vx=W+0.93, vb=G(), va=G(), vo=-0.015, navy=M(0x2b4f96), cr=M(0xc9cdd0);   // vanity, 60 wide, clear of the door's swing: a royal blue cabinet on the wall, a ceramic top with a wide rim and the bowl sunk into it
  vb.position.set(vx,0.93,BA.z1-0.24); vb.scale.x=0.74; va.position.copy(vb.position);
  box(0.8,0.53,0.02,navy,0,-0.315,-0.2,vb); [-0.39,0.39].forEach(function(x){box(0.02,0.53,0.42,navy,x,-0.315,0.02,vb);}); box(0.76,0.02,0.42,navy,0,-0.57,0.02,vb);   // the cabinet is hollow: the bowl hangs into it
  box(0.006,0.5,0.004,0x1d3567,0,-0.315,-0.211,vb); box(0.76,0.012,0.004,0xa87a46,0,-0.055,-0.211,vb);                                                             // two doors, the oak edge showing above them
  shell([[0.37,0.18,-0.05,14,0,24],[0.42,0.23,-0.05,14,0,24],[0.42,0.23,-0.05,14,0,24],[0.42,0.23,-0.006,14,0,24],[0.418,0.228,-0.002,14,0,24],[0.414,0.224,0,14,0,24],
    [0.256,0.151,0,3.5,vo],[0.252,0.147,-0.002,3.5,vo],[0.249,0.144,-0.008,3.5,vo],[0.235,0.132,-0.04,3.4,vo],[0.2,0.11,-0.075,3.2,vo],[0.14,0.075,-0.097,2.8,vo],[0.06,0.04,-0.105,2,vo],[0.001,0.001,-0.106,2,vo]],vb);
  cyl(0.022,0.004,cr,0,-0.103,vo,vb,16); cyl(0.012,0.004,0x5a5f62,0,-0.035,-0.13,vb,12).rotation.x=R/2-0.4;      // the waste and the overflow
  mixer(va,0,0.183,1.1);
  const sp=G(va); sp.position.set(0.15,0,0.17); A.rbox(0.085,0.11,0.06,0xf6f6f3,0,0.055,0,sp,0.012); box(0.06,0.07,0.004,0xc99a5b,0,0.055,-0.031,sp); cyl(0.011,0.03,0xf6f6f3,0,0.125,0,sp,10); box(0.01,0.008,0.035,0xf6f6f3,0,0.14,-0.012,sp);   // the same bamboo soap pump
  [[-0.2,0xf4f4f1],[-0.27,0x1d1f21]].forEach(function(q){const t=G(va); t.position.set(q[0],0,0.205);       // two electric toothbrushes standing in white holders on the wall
    box(0.05,0.025,0.04,0xf4f4f1,0,0.013,0,t); box(0.04,0.08,0.012,0xf4f4f1,0,0.05,0.016,t);
    cyl(0.016,0.19,q[1],0,0.12,0,t,12,0.013); cyl(0.006,0.05,0xf4f4f1,0,0.24,0,t,8); box(0.014,0.024,0.012,0xf4f4f1,0,0.275,-0.004,t); box(0.01,0.016,0.004,0x5fb0d8,0,0.278,-0.011,t);});
  A.basins.bath={x:vx,z:BA.z1-0.24+0.183-0.115*1.1,y1:0.93+0.077*1.1,y0:0.834};
  box(0.5,0.62,0.016,0xc2c7c9,vx+0.12,1.57,BA.z1-0.01); box(0.47,0.59,0.012,0xb9c9cf,vx+0.12,1.57,BA.z1-0.02);           // the mirror in a thin aluminium frame,
  box(0.56,0.03,0.12,0xb98a4e,vx+0.1,1.22,BA.z1-0.07);                                                                         // an oak shelf under it,
  box(0.09,0.12,0.04,0xf4f4f1,vx+0.46,1.2,BA.z1-0.02); box(0.07,0.09,0.005,0xdfe6e8,vx+0.46,1.2,BA.z1-0.042);                // a switched socket under a clear cover,
  box(0.34,0.7,0.16,navy,vx-0.27,1.57,BA.z1-0.08); box(0.33,0.69,0.004,0x2f56a2,vx-0.27,1.57,BA.z1-0.162); sph(0.022,0xc9c6bd,vx-0.15,1.28,BA.z1-0.175);      // and a blue cupboard beside it, its satin knob low on the left
  cyl(0.07,0.03,0xf2f1ec,vx-0.29,2.4,BA.z1-0.015,null,20).rotation.x=R/2;                                                        // the wall light above it: a ribbed glass dome on a white base
  const dome=cyl(0.06,0.12,A.lampMat('L:bath',0xf3efe2,0xfff1cf,1.1),vx-0.29,2.4,BA.z1-0.09,null,16); dome.rotation.x=R/2; for(let i=0;i<6;i++) A.torus(0.061,0.003,0xe7e1d2,vx-0.29,2.4,BA.z1-0.05-i*0.018).rotation.x=0;
  box(BA.x1-(vx-0.08),0.3,0.36,0xf3f2ee,(vx-0.08+BA.x1)/2,H-0.15,BA.z1-0.18);                                                   // the soffit along the top of this wall
  box(0.02,0.1,0.07,0x1d1f21,vx+0.47,0.78,BA.z1-0.04); box(0.12,0.012,0.012,0x1d1f21,vx+0.47,0.78,BA.z1-0.075); cyl(0.055,0.1,0xfbfbf8,vx+0.47,0.72,BA.z1-0.075,null,14).rotation.z=R/2;   // the black roll holder, toward the toilet,
  A.rbox(0.1,0.14,0.07,0xf4f4f1,vx+0.47,0.5,BA.z1-0.035,null,0.015);                                                           // and a white dispenser under it
  A.rbox(0.34,0.62,0.03,0x5f7cab,W+0.22,1.0,BA.z1-0.03,null,0.012); box(0.03,0.04,0.03,0xf4f4f1,W+0.22,1.33,BA.z1-0.015);           // a blue towel on a hook by the door
  /* the washing machine, from the photos: a white Siemens on a black anti-vibration stand in a niche 60 wide and 58 deep,
     between the door's jamb and a white boxed column; a knit laundry basket with a black bucket in it and a pouch of Ariel
     on top; the boiler cupboard juts out above, a black hose curving down from a brass fitting in its underside; on the
     column a clip with two mops, a broom and a squeegee on the floor, and a green mat in front */
  const wz=bd[0]-0.31, wx=W+0.3, wf=W+0.59, wy=0.08, top=wy+0.84;
  box(0.6,0.05,0.6,0x1b1c1e,wx,0.055,wz); [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){box(0.07,0.04,0.07,0x26282a,wx+q[0]*0.25,0.02,wz+q[1]*0.25);});
  A.rbox(0.58,0.84,0.6,0xfbfbfa,wx,wy+0.42,wz,null,0.025,0.03);
  const cy=wy+0.37;
  A.torus(0.205,0.032,0xf4f4f2,wf+0.01,cy,wz).rotation.y=R/2; A.torus(0.165,0.016,0x9aa0a4,wf+0.025,cy,wz).rotation.y=R/2;      // the round door: white rim, grey ring
  const drum=new THREE.Mesh(new THREE.CircleGeometry(0.155,28),A.MT(canvasTex(128,128,function(g){g.fillStyle='#22262a'; g.fillRect(0,0,128,128);
    [['#8fbd9b',40,50,30],['#d6a21e',80,44,24],['#3d5a80',64,84,30],['#f3ebdc',36,86,18]].forEach(function(q){g.globalAlpha=0.55; g.fillStyle=q[0]; g.beginPath(); g.ellipse(q[1],q[2],q[3],q[3]*0.6,q[1]/20,0,7); g.fill();});
    g.globalAlpha=0.25; g.fillStyle='#ffffff'; g.beginPath(); g.ellipse(44,36,30,12,-0.6,0,7); g.fill();})));
  drum.position.set(wf+0.02,cy,wz); drum.rotation.y=R/2; scene.add(drum);
  box(0.02,0.07,0.035,0xd4d7d9,wf+0.03,cy,wz-0.19);                                                                    // its handle
  const pT=canvasTex(256,64,function(g){g.fillStyle='#f6f7f5'; g.fillRect(0,0,256,64); g.fillStyle='#d9dcdc'; g.fillRect(0,58,256,6);
    g.strokeStyle='#b9bec0'; g.lineWidth=2; g.strokeRect(6,10,64,26); g.fillStyle='#c9cdcf'; g.fillRect(22,30,30,3);                  // detergent drawer
    g.fillStyle='#6a7074'; g.font='bold 9px sans-serif'; g.fillText('SIEMENS',8,8);
    for(let i=0;i<5;i++){g.fillStyle='#8a9094'; g.fillRect(80,10+i*9,14,2); g.fillRect(150,10+i*9,14,2); g.fillStyle='#3b4246'; g.fillRect(96,9+i*9,3,3); g.fillRect(146,9+i*9,3,3);}
    g.fillStyle='#8a9094'; for(let i=0;i<4;i++) g.fillRect(170+i*20,46,14,2);});
  const pn=new THREE.Mesh(new THREE.PlaneGeometry(0.58,0.145),A.MT(pT,'bath',true)); pn.position.set(wf+0.002,wy+0.765,wz); pn.rotation.y=R/2; scene.add(pn);
  cyl(0.034,0.025,0xc4c8cb,wf+0.014,wy+0.765,wz+0.028,null,24).rotation.z=R/2; box(0.004,0.03,0.006,0x6a7074,wf+0.028,wy+0.78,wz+0.028);   // the programme dial
  const wcv=document.createElement('canvas'); wcv.width=128; wcv.height=48; const wtex=new THREE.CanvasTexture(wcv);
  const disp=new THREE.Mesh(new THREE.PlaneGeometry(0.15,0.055),new THREE.MeshBasicMaterial({map:wtex})); disp.position.set(wf+0.005,wy+0.77,wz-0.16); disp.rotation.y=R/2; scene.add(disp);
  A.washer={x:wx,z:wz,drum:drum,canvas:wcv,tex:wtex,sx:wx+0.75,sz:wz,h:-R/2,top:top,box:[W+0.01,wf,0,top+0.01,wz-0.3,wz+0.3]};
  const knit=A.MT(canvasTex(64,64,function(g){g.fillStyle='#f5f4f0'; g.fillRect(0,0,64,64); g.fillStyle='rgba(60,60,58,0.55)';
    for(let y=4;y<64;y+=8) for(let x=(y%16?4:0);x<64;x+=8){g.beginPath(); g.ellipse(x+2,y,2.2,1.6,0,0,7); g.fill();}}),'bath',true);
  knit.map.wrapS=knit.map.wrapT=THREE.RepeatWrapping; knit.map.repeat.set(4,2);
  const bk=G(); bk.position.set(wx-0.03,top,wz+0.05);                                                                  // the laundry basket, open, with the bucket in it
  box(0.36,0.012,0.5,0xf1f0ec,0,0.006,0,bk); [-1,1].forEach(function(s){box(0.012,0.26,0.52,knit,s*0.18,0.13,0,bk); box(0.38,0.26,0.012,knit,0,0.13,s*0.255,bk);
    A.rbox(0.03,0.025,0.54,0xf7f6f2,s*0.185,0.265,0,bk,0.01); A.rbox(0.39,0.025,0.03,0xf7f6f2,0,0.265,s*0.26,bk,0.01); box(0.006,0.05,0.12,0x8f9294,0,0.2,s*0.262,bk).rotation.y=R/2;});
  cyl(0.14,0.28,0x17181a,-0.05,0.16,-0.06,bk,24,0.155); A.torus(0.15,0.014,0x111213,-0.05,0.305,-0.06,bk).rotation.x=R/2; cyl(0.13,0.01,0x0d0e0f,-0.05,0.295,-0.06,bk,24);
  const ar=G(); ar.position.set(wx+0.17,top,wz-0.2); ar.rotation.y=0.25;                                               // the pouch of Ariel, standing
  const arT=canvasTex(64,96,function(g){g.fillStyle='#f3f5f4'; g.fillRect(0,0,64,96); g.fillStyle='#1f7d74'; g.beginPath(); g.arc(30,40,16,0,7); g.fill(); g.fillStyle='#f3f5f4'; g.beginPath(); g.arc(34,38,9,0,7); g.fill();
    g.fillStyle='#c8202a'; g.font='bold 10px sans-serif'; g.fillText('ARIEL',18,44); g.fillStyle='#9aa'; for(let i=0;i<6;i++) g.fillRect(8,64+i*4,48-(i%3)*8,2);});
  const pb=box(0.13,0.32,0.22,A.MT(arT,'bath',true),0,0.16,0,ar); pb.scale.set(1,1,1); cyl(0.012,0.03,0xf4f4f1,0.02,0.33,0.08,ar,10);
  const cupZ0=BA.z0, cupZ1=bd[0]+0.02;                                                                                  // the boiler cupboard, jutting out over the niche
  box(0.68,H-2.04,cupZ1-cupZ0,0xf7f7f4,W+0.34,(H+2.04)/2,(cupZ0+cupZ1)/2); box(0.6,0.01,0.56,0xdfe2e3,W+0.31,2.035,wz);
  box(0.06,0.004,0.03,0x2f6fd6,W+0.08,2.031,wz+0.2); box(0.04,0.004,0.06,0x2f6fd6,W+0.5,2.031,wz-0.2);                // bits of blue tape, and the brass fitting
  cyl(0.018,0.05,0xb08a3c,W+0.09,2.0,wz-0.24,null,10);
  const hose=new THREE.CatmullRomCurve3([new THREE.Vector3(W+0.09,1.98,wz-0.24),new THREE.Vector3(W+0.2,1.7,wz-0.26),new THREE.Vector3(W+0.26,1.3,wz-0.28),new THREE.Vector3(W+0.2,1.05,wz-0.28),new THREE.Vector3(W+0.08,top+0.02,wz-0.28)]);
  const hm=new THREE.Mesh(new THREE.TubeGeometry(hose,30,0.011,8,false),M(0x1b1c1e)); hm.castShadow=true; scene.add(hm);                     // its black hose, down the back of the niche
  box(0.6,H,wz-0.3-cupZ0,0xf3f3f0,W+0.3,H/2,(cupZ0+wz-0.3)/2);                                                          // the white boxed column beside the machine
  const cb=box(0.003,0.42,0.12,0xb48c5c,W+0.48,0.62,wz-0.302); cb.rotation.x=0.12;                                     // a piece of cardboard wedged in beside it
  const cf=W+0.6;                                                                                                       // on the column's face: a clip with two mops, and a broom and a squeegee on the floor
  box(0.03,0.04,0.14,0xf4f4f1,cf+0.015,1.32,BA.z0+0.08);
  [[0.05,0x9da3a7],[-0.02,0xb9bec1]].forEach(function(q,i){const m=cyl(0.012,1.42,q[1],cf+0.06+i*0.05,0.71,BA.z0+0.08+q[0],null,8); m.rotation.z=0.06; m.rotation.x=-0.04;
    box(0.03,0.06,0.03,0x1d1f21,cf+0.1+i*0.05,1.43,BA.z0+0.08+q[0]);});
  box(0.26,0.05,0.07,0xc9a46a,cf+0.25,0.025,BA.z0+0.24).rotation.y=0.5; box(0.24,0.03,0.05,0xe9dfc4,cf+0.25,0.06,BA.z0+0.24).rotation.y=0.5;
  box(0.45,0.035,0.05,0x17181a,cf+0.22,0.018,BA.z0+0.45).rotation.y=-0.45;
  const mat=A.MT(canvasTex(64,64,function(g){g.fillStyle='#7aa594'; g.fillRect(0,0,64,64); g.strokeStyle='rgba(255,255,255,0.18)'; g.lineWidth=2; for(let i=-64;i<64;i+=6){g.beginPath(); g.moveTo(i,0); g.lineTo(i+64,64); g.stroke();}}),'bath',true);
  box(0.5,0.012,0.78,mat,W+0.9,0.007,bd[0]+0.12).castShadow=false;                                                    // green mat in front of the machine
  /* the toilet wall: a tiled box with a ledge, the bowl hung on it, the flush plate, and above it the small tilting window in a tiled reveal */
  const pz=BA.x1-0.22, pz0=BA.z0+0.92, pzm=(pz0+BA.z1)/2;
  box(0.22,1.22,BA.z1-pz0,0xf6f6f3,BA.x1-0.11,0.61,pzm);
  (function(){const t=tileWhite.clone(); t.needsUpdate=true; t.repeat.set((BA.z1-pz0)/0.6,1.22/0.3); const m=new THREE.Mesh(new THREE.PlaneGeometry(BA.z1-pz0,1.22),A.MT(t,'bath')); m.position.set(pz-0.002,0.61,pzm); m.rotation.y=-R/2; scene.add(m);})();
  box(0.24,0.025,BA.z1-pz0,0xdedfdc,BA.x1-0.12,1.232,pzm);
  A.rbox(0.52,0.33,0.37,0xfbfbfa,pz-0.26,0.425,tz,null,0.07,0.17); box(0.06,0.22,0.2,0xfbfbfa,pz-0.03,0.42,tz);
  box(0.012,0.22,0.15,M(0xc9cdd0),pz-0.006,0.97,tz); cyl(0.045,0.01,0xdfe2e4,pz-0.014,0.97,tz,null,24).rotation.z=R/2; box(0.004,0.07,0.003,0x9aa0a4,pz-0.019,0.97,tz);
  cyl(0.04,0.1,0xfbfbfa,pz-0.1,0.05,tz-0.33,null,14); cyl(0.008,0.32,0xfbfbfa,pz-0.1,0.26,tz-0.33,null,8);      // a white brush
  cyl(0.03,0.13,0xf1ece0,BA.x1-0.1,1.31,tz-0.24,null,12); cyl(0.008,0.03,0x1d1f21,BA.x1-0.1,1.39,tz-0.24,null,8); box(0.005,0.02,0.04,0x1d1f21,BA.x1-0.1,1.405,tz-0.255);   // lotion on the ledge,
  (function(){const g=G(); g.position.set(BA.x1-0.11,1.245,tz+0.17);                        // and a rope basket with a navy band and leather handles, towels rolled in it
    const rope=A.MT(canvasTex(64,16,function(c){c.fillStyle='#f3f1ea'; c.fillRect(0,0,64,16); c.strokeStyle='#d6d2c6'; c.lineWidth=1.5; for(let x=-16;x<64;x+=4){c.beginPath(); c.moveTo(x,0); c.lineTo(x+8,16); c.stroke();}}),'bath',true);
    box(0.16,0.07,0.34,rope,0,0.035,0,g); box(0.165,0.025,0.345,0x23355e,0,0.06,0,g); [-1,1].forEach(function(e){box(0.03,0.03,0.012,0x9a6a3e,0,0.085,e*0.18,g);});
    [-0.08,0.04].forEach(function(z){cyl(0.04,0.13,0xfbfbf8,0,0.1,z,g,12).rotation.x=R/2;});})();
  [[tz-0.33],[tz+0.33]].forEach(function(q){box(0.22,1.0,0.06,0xf6f6f3,BA.x1-0.11,1.74,q[0]);}); box(0.22,0.06,0.72,0xf6f6f3,BA.x1-0.11,2.27,tz);      // the window's tiled reveal
  (function(){const sh=G(); sh.position.set(BA.x1-0.05,1.62,tz); sh.rotation.z=0.16;            // its sash, tilted in at the top on a stay, frosted
    box(0.04,0.56,0.58,0xf2f2ef,0,0.28,0,sh); box(0.01,0.5,0.52,A.reg(new THREE.MeshLambertMaterial({color:0xdfe7ea,transparent:true,opacity:0.8}),'bath'),-0.01,0.28,0,sh);
    box(0.08,0.012,0.012,0xc9cdd0,-0.04,0.56,0.2,sh);})();
  const glass=A.reg(new THREE.MeshLambertMaterial({color:0xcfe3e6,transparent:true,opacity:0.35}));   // shower in the corner to the toilet's right
  const sx0=BA.x1-0.9, sz1=BA.z0+0.9;
  box(0.02,2.0,0.9,glass,sx0,1.0,BA.z0+0.45).castShadow=false;
  box(0.9,2.0,0.02,glass,BA.x1-0.45,1.0,sz1).castShadow=false;
  [0.3,0.62,0.95,1.28,1.6].forEach(function(y){for(let k=0;k<3;k++){const yy=y+k*0.035, f=A.reg(new THREE.MeshLambertMaterial({color:0xeef2f2,transparent:true,opacity:0.6}),'bath');      // frosted bands, in threes, up both panes
    box(0.88,0.014,0.024,f,BA.x1-0.45,yy,sz1).castShadow=false; box(0.024,0.014,0.88,f,sx0,yy,BA.z0+0.45).castShadow=false;}});
  [[0.95],[1.1]].forEach(function(q,i){box(0.32,0.02,0.02,0xd4d7d9,sx0+0.3,q[0],sz1+(i?-0.03:0.03)); [-0.15,0.15].forEach(function(o){box(0.015,0.015,0.03,0xd4d7d9,sx0+0.3+o,q[0],sz1+(i?-0.015:0.015));});});      // long chrome handles, inside and out
  (function(){const sp=canvasTex(64,96,function(c){c.fillStyle='#e9e1c8'; c.fillRect(0,0,64,96); c.strokeStyle='rgba(150,135,100,0.6)'; c.lineWidth=2;
      c.beginPath(); for(let a=0;a<18;a+=0.2){const r=a*1.3; c.lineTo(32+Math.cos(a)*r,62+Math.sin(a)*r);} c.stroke(); c.strokeRect(6,8,52,30); for(let i=0;i<5;i++){c.beginPath(); c.moveTo(32,34); c.lineTo(10+i*11,10); c.stroke();}});
    const tm=A.MT(sp,'bath',true); box(0.36,0.62,0.02,tm,sx0+0.32,1.71,sz1+0.025); box(0.36,0.28,0.02,tm,sx0+0.32,1.88,sz1-0.025); box(0.36,0.02,0.07,tm,sx0+0.32,2.015,sz1);})();      // a towel thrown over the top of the glass
  const frost=A.reg(new THREE.MeshLambertMaterial({color:0xe9eeee,transparent:true,opacity:0.55}));                    // frosted bands across the glass, as in the mirror
  for(let i=0;i<6;i++){box(0.88,0.035,0.024,frost,BA.x1-0.45,0.95+i*0.075,sz1).castShadow=false; box(0.024,0.035,0.88,frost,sx0,0.95+i*0.075,BA.z0+0.45).castShadow=false;}
  box(0.03,2.01,0.03,0xb9bdc0,sx0,1.005,sz1);
  // rain shower: riser pipe up the wall, an arm, a wide square head with a dotted face; mixer and a hand shower on a rail
  const hx2=BA.x1-0.45, hz2=BA.z0+0.45, chrome=0xc9cdd0;
  cyl(0.012,1.15,chrome,hx2,1.6,BA.z0+0.03,null,10); const sa=cyl(0.012,0.43,chrome,hx2,2.17,BA.z0+0.24,null,10); sa.rotation.x=R/2;
  cyl(0.014,0.06,chrome,hx2,2.14,hz2,null,10); box(0.26,0.02,0.26,chrome,hx2,2.1,hz2);
  box(0.24,0.004,0.24,A.MT(canvasTex(64,64,function(g){g.fillStyle='#8d9296'; g.fillRect(0,0,64,64); g.fillStyle='#2f3336'; for(let y=4;y<64;y+=7) for(let x=4;x<64;x+=7){g.beginPath(); g.arc(x,y,1.3,0,7); g.fill();}})),hx2,2.088,hz2);
  cyl(0.055,0.03,chrome,hx2,1.08,BA.z0+0.02,null,18).rotation.x=R/2; box(0.02,0.02,0.09,chrome,hx2+0.03,1.08,BA.z0+0.07);
  cyl(0.008,0.6,chrome,BA.x1-0.22,1.35,BA.z0+0.04,null,8); const hs=cyl(0.03,0.09,chrome,BA.x1-0.22,1.6,BA.z0+0.08,null,12,0.018); hs.rotation.x=0.9;
  box(0.2,0.012,0.12,0xfbfbfa,BA.x1-0.72,1.15,BA.z0+0.07); cyl(0.03,0.14,0x8fbd9b,BA.x1-0.76,1.23,BA.z0+0.07,null,10); cyl(0.028,0.11,0xf3ebdc,BA.x1-0.68,1.215,BA.z0+0.07,null,10);   // shelf with bottles
  A.showerGlass=glass;
    const dl=A.door('bath').p;                                       // on the back of the bathroom door: a black hook rail and a towel
  box(0.46,0.025,0.025,0x1d1f21,0.36,1.9,-0.035,dl); [0.2,0.36,0.52].forEach(function(x){box(0.015,0.05,0.035,0x1d1f21,x,1.87,-0.05,dl);});
  A.rbox(0.28,0.72,0.025,0xf4f3ef,0.2,1.5,-0.06,dl,0.01);
});
A.showerSpot={x:BA.x1-0.45,z:BA.z0+0.45,ax:BA.x1-1.25,az:BA.z0+1.0,headY:2.085};
})();
