/* Haroe 10 — outside the flat: the lobby and its stairs, the yard one floor down, the neighbouring building, and on the
   street side the two entrance bridges, the square with the café, and Haroe St.
   Compass: the flat's windows face south-east. In model terms +x is roughly south, -z roughly east, +z west (the lobby
   runs that way from our door), and Haroe St is to the north, at -x. */
(function(){
'use strict';
const A=window.APP, D=A.D, K=A.kit, W=D.W, L=D.L, H=D.H, KX=D.KX, AZ=A.AZ;
const box=A.box, cyl=A.cyl, sph=A.sph, M=A.M, inRoom=A.inRoom, wall=A.wall, rect=A.rect, G=A.G, scene=A.scene, canvasTex=A.canvasTex;
const R=Math.PI, GY=-2.9;          // the yard is one floor down

/* ================= the ground-floor lobby, from the photos of the walk in =================
   Over the corner bridge and through the open doorway into a small square hall: the letter boxes and the meter cupboards on
   the wall to your left, a small barred window and flat 2's door ahead, a white cupboard high on the wall to your right.
   Turn right into the long corridor: stone cladding to about 1.5 m on both sides, white plaster above, the old concrete
   vent screens high on the left. At its end, on the left, the wide stone-clad pillar that stands opposite our door; past it
   the landing: flat 3 on its left wall, flat 4 and our door, flat 5, side by side on the far wall. On the right the
   stairwell: a flight up along the wall beside our door, a flight down beside it behind a white railing with a white pole.
   A second bridge further along the front leads into a small hall of its own, for flats 1 and 6. */
const LB=A.LB, XL=LB.XL, CX0=LB.CX0, CX1=LB.CX1, RZ=LB.RZ, SD=LB.SD, SU=LB.SU, EH=LB.EH, BZ=LB.BZ, ZE=LB.ZE, ZC=LB.ZC, XF=LB.XF, XE=LB.XE, ZO=LB.ZO, Z2=LB.Z2, Z2N=Z2+1.15;
const CL=1.47;                                                   // height of the stone cladding
const PX0=CX0-0.35, PX1=CX0+0.28, PZ0=RZ-0.12, PZ1=RZ+0.5;          // the pillar: it stands out into the corridor's mouth and toward the landing
/* the stairs: two flights a floor, each 8 treads of 27 cm, half landings against the far wall */
const FF=H+0.24, NT=8, TD=0.27, XH=SU+NT*TD, XHd=SD+NT*TD, ZA0=L+0.06, ZA1=L+1.26, ZB0=L+1.36, ZB1=EH-0.02, LO=GY, XB=0.0;   // floor to floor; where the half landings begin, above and below; the bands of the flights up (A) and down (B); the lower floor; the back of the landings above and below
A.LB.stairs={FF:FF,NT:NT,TD:TD,XH:XH,XHd:XHd,ZA0:ZA0,ZA1:ZA1,ZB0:ZB0,ZB1:ZB1,XB:XB};
const terrazzo=canvasTex(256,256,function(g){          // the floor: speckled beige cement tiles, 20 cm
  g.fillStyle='#dccb9f'; g.fillRect(0,0,256,256); const r=A.rng(21), cs=['#b39c70','#efe4c8','#8f7b58','#c9b081','#a58d62','#f6efdc'];
  for(let i=0;i<2600;i++){g.fillStyle=cs[Math.floor(r()*cs.length)]; g.fillRect(r()*256,r()*256,1+r()*2.2,1+r()*2);}
  for(let j=0;j<4;j++) for(let i=0;i<4;i++){g.fillStyle='rgba(120,100,60,'+(r()*0.08)+')'; g.fillRect(i*64,j*64,64,64);}
  g.strokeStyle='#8d7c5c'; g.lineWidth=2; for(let k=0;k<=4;k++){g.beginPath(); g.moveTo(k*64,0); g.lineTo(k*64,256); g.stroke(); g.beginPath(); g.moveTo(0,k*64); g.lineTo(256,k*64); g.stroke();}
});
terrazzo.wrapS=terrazzo.wrapT=THREE.RepeatWrapping;
const ashlar=canvasTex(256,256,function(g){           // the cladding: beige stone in courses of mixed height
  const r=A.rng(5), cs=['#d6c39b','#cdb88c','#e0d0ab','#c7b085','#dccaa3','#d1bd93','#e4d6b4'];
  g.fillStyle='#b5a079'; g.fillRect(0,0,256,256);
  let y=0; while(y<256){const h=22+Math.floor(r()*30); let x=-Math.floor(r()*60);
    while(x<256){const w=36+Math.floor(r()*90); g.fillStyle=cs[Math.floor(r()*cs.length)]; g.fillRect(x+1.2,y+1.2,w-2.4,h-2.4);
      for(let i=0;i<w*h/30;i++){g.fillStyle='rgba('+(r()>0.5?'255,250,235':'120,100,70')+','+(0.05+r()*0.1)+')'; g.fillRect(x+r()*w,y+r()*h,1+r()*3,1);}
      if(r()<0.2){g.strokeStyle='rgba(150,120,80,0.35)'; g.lineWidth=1; g.beginPath(); g.moveTo(x+r()*w,y+2); g.lineTo(x+r()*w,y+h-2); g.stroke();}
      x+=w;}
    y+=h;}
});
ashlar.wrapS=ashlar.wrapT=THREE.RepeatWrapping;
const plaster=canvasTex(256,128,function(g){          // white plaster above it, scuffed and stained here and there
  g.fillStyle='#f4f2ec'; g.fillRect(0,0,256,128); const r=A.rng(8);
  for(let i=0;i<6;i++){const x=r()*256, y=r()*128, w=3+r()*9, h=2+r()*5; g.fillStyle='rgba(215,208,190,'+(0.2+r()*0.2)+')'; g.beginPath(); g.ellipse(x,y,w,h,r()*3,0,7); g.fill();}
  for(let i=0;i<14;i++){g.fillStyle='rgba(90,85,75,'+(0.08+r()*0.1)+')'; g.fillRect(r()*256,r()*128,1+r()*2,1+r()*2);}
});
plaster.wrapS=THREE.RepeatWrapping;
const peel=canvasTex(128,256,function(g){             // the pillar above its cladding: paint peeling in layers off old yellowed plaster
  g.fillStyle='#ece6d8'; g.fillRect(0,0,128,256); const r=A.rng(33);
  for(let i=0;i<26;i++){const x=r()*128, y=r()*256, w=6+r()*26, h=8+r()*40;
    g.fillStyle=['#e2d2a6','#d9c79a','#cfc2a4','#f6f3ec'][i%4]; g.beginPath(); g.moveTo(x,y);
    for(let k=0;k<7;k++) g.lineTo(x+Math.cos(k)*w*(0.6+r()*0.6),y+Math.sin(k*1.3)*h*(0.6+r()*0.6)); g.closePath(); g.fill();
    g.strokeStyle='rgba(255,255,255,0.85)'; g.lineWidth=1.2; g.stroke();}
  for(let i=0;i<40;i++){g.fillStyle='rgba(120,100,70,0.25)'; g.fillRect(r()*128,r()*256,1,2+r()*4);}
});
const stepT=canvasTex(128,64,function(g){             // the treads: worn beige stone with a darker nosing
  const r=A.rng(41); g.fillStyle='#d4c4a0'; g.fillRect(0,0,128,64);
  for(let i=0;i<500;i++){g.fillStyle=r()>0.5?'rgba(150,130,95,0.25)':'rgba(255,250,235,0.35)'; g.fillRect(r()*128,r()*64,1+r()*2,1);}
  g.fillStyle='rgba(120,100,70,0.18)'; g.fillRect(0,26,128,12);});
const hallM=function(t){const m=new THREE.MeshLambertMaterial({map:t,emissive:0x4a4944}); m.emissiveMap=t; return A.reg(m,'hall');};      // lit a little from within, like the flat's walls, so the white reads as white
[[XL,SU,L,ZB0-0.02],[XL,SD,ZB0-0.02,RZ],[CX0,SD,RZ,EH],[CX0,CX1,EH,ZE],[CX0,XF,ZE,ZC],[2.6,XF,EH,Z2N]].forEach(function(q){A.floorQuad(q[0],q[1],q[2],q[3],terrazzo,0.8,'hall');});      // no floor over the flight down
[[XL,SU,L,RZ],[CX0,SU,RZ,EH],[CX0,CX1,EH,ZE],[CX0,XF,ZE,ZC],[2.6,XF,EH,Z2N]].forEach(function(q){A.ceil('hall',q[0],q[1],q[2],q[3]);});
const en=D.entrance;
wall('h_s',[XL,L],[SU,L],[0,1],'hall',{holes:[[en[0]-XL,en[1]-XL]]});                  // flat 4 and our door, flat 5
wall('h_ss',[SU,L],[XE,L],[0,1],'hall',{h:FF+H});                                       // the stairwell rises a floor: the flights up and down run along here
wall('h_l3',[XL,L],[XL,RZ],[1,0],'hall');                                                // flat 3
wall('h_rz',[XL,RZ],[PX0,RZ],[0,-1],'hall');                                             // the back of the landing, up to the pillar
wall('h_cl',[CX0,PZ1],[CX0,ZC],[1,0],'hall');                                            // corridor, left: vent screens; then the square hall: flat 2, the barred window
wall('h_n',[CX0,ZC],[XF,ZC],[0,-1],'hall');                                              // the letter boxes and the meter cupboards
wall('h_f',[XF,ZE],[XF,ZC],[-1,0],'hall',{holes:[[ZO-0.65-ZE,ZO+0.65-ZE,2.5]]});         // the street front, with the open doorway to our bridge
wall('h_bn',[CX1,ZE],[XF,ZE],[0,1],'hall');                                              // the hall's side toward the corridor
wall('h_br',[CX1,EH],[CX1,ZE],[-1,0],'hall');                                            // corridor, right: it ends in a pier beside the railing
wall('h_cf',[XE,L],[XE,EH],[-1,0],'hall',{h:FF+H});                                      // the stairwell's far wall
wall('h_se',[XE,EH],[SU,EH],[0,-1],'hall',{h:FF+H});                                     // and its side, behind the corridor's right wall
wall('v_s',[2.6,BZ],[XF,BZ],[0,1],'hall'); wall('v_n',[2.6,Z2N],[XF,Z2N],[0,-1],'hall'); wall('v_w',[2.6,BZ],[2.6,Z2N],[1,0],'hall');   // the second entrance: flats 1 and 6
wall('v_f',[XF,BZ],[XF,Z2N],[-1,0],'hall',{holes:[[Z2-0.65-BZ,Z2+0.65-BZ,2.5]]});
A.doorFrame('h_s',en[0]-XL,en[1]-XL);
const HW=['h_s','h_l3','h_rz','h_cl','h_n','h_f','h_bn','h_br','v_s','v_n','v_w','v_f'];
function clad(k,u0,u1,y0,y1){const t=ashlar.clone(); t.needsUpdate=true; t.repeat.set((u1-u0)/1.2,(y1-y0)/CL); t.offset.x=(u0*0.37)%1; return rect(k,u0,u1,y0,y1,hallM(t),0.005);}
function plas(k,u0,u1,y0,y1){const p=plaster.clone(); p.needsUpdate=true; p.repeat.set((u1-u0)/2.4,(y1-y0)/(H-CL)); p.offset.x=(u0*0.53)%1; return rect(k,u0,u1,y0,y1,hallM(p),0.004);}
HW.forEach(function(k){A.spans(k).forEach(function(s){clad(k,s[0],s[1],0,CL); plas(k,s[0],s[1],CL,H);});});
/* the stairwell's walls: plaster all the way up, cladding that climbs with the flights */
function wallPoly(k,pts,mat,off){const w=A.walls[k], sh=new THREE.Shape(); pts.forEach(function(p,i){const x=w.s*(p[0]-w.len/2); if(i) sh.lineTo(x,p[1]); else sh.moveTo(x,p[1]);});
  const g=new THREE.ShapeGeometry(sh), P=g.attributes.position, U=g.attributes.uv;
  for(let i=0;i<P.count;i++) U.setXY(i,(P.getX(i)+w.len/2)/1.2,P.getY(i)/CL);
  const m=new THREE.Mesh(g,mat); m.position.z=off||0.006; m.receiveShadow=true; w.g.add(m); return m;}
const cladM=hallM(ashlar), uH=XH-SU, uE=XE-SU;
plas('h_ss',0,uE,0,FF+H); plas('h_cf',0,EH-L,0,FF+H); plas('h_se',0,XE-SU,0,FF+H);
[0,FF].forEach(function(y){wallPoly('h_ss',[[0,y],[uH,y+FF/2],[uE,y+FF/2],[uE,y+FF/2+CL],[uH,y+FF/2+CL],[0,y+CL]],cladM);});      // along flight A and its half landing, on each floor
[FF/2,FF*1.5].forEach(function(y){wallPoly('h_cf',[[0,y],[EH-L,y],[EH-L,y+CL],[0,y+CL]],cladM);});                                    // round the half landings
[0,FF].forEach(function(y){wallPoly('h_se',[[0,y+FF/2],[XE-XH,y+FF/2],[XE-SU,y+FF],[XE-SU,y+FF+CL],[XE-XH,y+FF/2+CL],[0,y+FF/2+CL]].map(function(p){return [p[0],Math.min(p[1],FF+H-0.01)];}),cladM);});      // along flight B and its half landing
/* the pillar opposite our door: clad in a warmer stone to about two metres, the paint above it peeling in sheets */
inRoom('hall',function(){
  const pw=PX1-PX0, pd=PZ1-PZ0, pc=new THREE.Vector3((PX0+PX1)/2,0,(PZ0+PZ1)/2);
  box(pw,H,pd,M(0xeee8da),pc.x,H/2,pc.z).castShadow=false;
  const pst=ashlar.clone(); pst.needsUpdate=true; pst.repeat.set(0.5,1.3); const pcl=hallM(pst);
  box(pw+0.03,2.02,pd+0.03,pcl,pc.x,1.01,pc.z);                                            // big slabs of stone, a joint down the middle
  box(0.006,2.0,0.02,0x9c8763,PX1+0.016,1.0,pc.z+0.06); box(0.02,2.0,0.006,0x9c8763,pc.x-0.05,1.0,PZ0-0.016);
  box(pw+0.05,0.03,pd+0.05,0xcbb68b,pc.x,2.035,pc.z);                                     // its capping
  const pp=hallM(peel); [[PX1+0.004,pc.z,R/2,pd],[pc.x,PZ0-0.004,R,pw]].forEach(function(q){const m=new THREE.Mesh(new THREE.PlaneGeometry(q[3],H-2.05),pp); m.position.set(q[0],(H+2.05)/2,q[1]); m.rotation.y=q[2]; scene.add(m);});
});
/* the other flats: grey steel doors in white frames, a brass number and a bell */
function flatDoor(k,u,no){
  const tex=canvasTex(128,256,function(g){
    g.fillStyle='#a9aeb1'; g.fillRect(0,0,128,256); const r=A.rng(no.charCodeAt(0)); for(let i=0;i<300;i++){g.fillStyle='rgba(255,255,255,'+(r()*0.05)+')'; g.fillRect(r()*128,r()*256,2,2);}
    g.fillStyle='#c9a24a'; g.font='bold 20px serif'; g.textAlign='center'; g.fillText(no,64,68); g.fillStyle='#3a3d3f'; g.beginPath(); g.arc(64,80,3,0,7); g.fill();
    g.fillStyle='#d4d7d8'; g.beginPath(); g.arc(18,132,5,0,7); g.fill(); g.fillRect(14,140,8,4); g.beginPath(); g.arc(18,152,5,0,7); g.fill();
  });
  rect(k,u-0.5,u+0.5,0,2.17,0xf3f2ee,0.008); rect(k,u-0.43,u+0.43,0,2.07,hallM(tex),0.01);
  rect(k,u+0.6,u+0.68,1.38,1.48,0xeeeeea,0.009);
}
flatDoor('h_s',-0.8-XL,'4'); flatDoor('h_l3',0.78,'3'); flatDoor('h_cl',ZC-2.65-PZ1,'2'); flatDoor('v_s',1.0,'1'); flatDoor('v_n',XF-2.6-1.0,'6');
rect('h_s',en[1]-XL+0.2,en[1]-XL+0.28,1.38,1.48,0xeeeeea,0.009);                 // our light switch
rect('h_s',-0.27-XL,-0.05-XL,1.28,1.62,0xf2d33a,0.011); rect('h_s',-0.25-XL,-0.07-XL,1.5,1.53,0x6a5a20,0.012);    // a yellow notice on the pier between the doors
/* the concrete vent screens high on the corridor's left, behind a white mesh */
const ventT=canvasTex(128,96,function(g){
  g.fillStyle='#f4f3ef'; g.fillRect(0,0,128,96); g.fillStyle='#d8d4ca'; g.fillRect(8,8,112,80);
  g.fillStyle='#4f4d48'; for(let j=0;j<4;j++) for(let i=0;i<6;i++){g.beginPath(); g.arc(17+i*19+(j%2?9:0),20+j*19,7,0,7); g.fill();}
  g.strokeStyle='rgba(250,250,248,0.85)'; g.lineWidth=1; for(let x=8;x<120;x+=4){g.beginPath(); g.moveTo(x,8); g.lineTo(x,88); g.stroke();} for(let y=8;y<88;y+=4){g.beginPath(); g.moveTo(8,y); g.lineTo(120,y); g.stroke();}
});
function vent(k,u,w){rect(k,u-w/2,u+w/2,1.58,2.4,A.MT(ventT,'hall'),0.012);}
[ZE-0.75,ZE-2.25,L+6.0,L+4.5].forEach(function(z){vent('h_cl',z-PZ1,1.24);}); vent('h_cl',ZC-0.72-PZ1,1.2);
[ZE-1.5,L+5.25].forEach(function(z){rect('h_cl',z-PZ1-0.16,z-PZ1+0.16,1.9,2.16,0x1f2122,0.012);});      // small black boxes between them
rect('h_cl',ZC-1.75-PZ1-0.42,ZC-1.75-PZ1+0.42,1.62,2.08,0xf4f4f1,0.011); rect('h_cl',ZC-1.75-PZ1-0.38,ZC-1.75-PZ1+0.38,1.66,2.04,0x2f3a40,0.012);      // the small barred window you see straight through the doorway
for(let i=0;i<7;i++){const u=ZC-1.75-PZ1-0.33+i*0.11; rect('h_cl',u-0.01,u+0.01,1.66,2.04,0xf4f4f1,0.013);} rect('h_cl',ZC-1.75-PZ1-0.38,ZC-1.75-PZ1+0.38,1.84,1.86,0xf4f4f1,0.013);
rect('h_br',ZE-0.7-EH-0.3,ZE-0.7-EH+0.3,1.85,2.35,0x6b4a2f,0.009); rect('h_br',ZE-0.7-EH-0.26,ZE-0.7-EH+0.26,1.89,2.31,0xc9a46e,0.010);   // an empty cork board
inRoom('hall',function(){
  function bulb(x,y,z,drop){const yb=y-(drop||0.28); box(0.01,y-yb,0.01,0x2a2c2e,x,(y+yb)/2,z).castShadow=false; cyl(0.03,0.05,0xe9e6dc,x,yb+0.02,z,null,10); sph(0.045,A.lampMat('L:hall',0xf6f1e2,0xfff0c8,1.1),x,yb-0.04,z); A.pool('L:hall',0xffe2b0,x,y-H+0.02,z,2.4,null,0.3);}
  bulb(0.2,H,L+1.3); bulb(0.05,H,L+5.6); bulb(2.9,H,ZE+1.8); bulb(3.9,H,Z2,0.2); bulb(XE-0.6,FF/2+2.4,L+0.7,0.3); bulb(XB+0.6,FF+H,L+1.2,0.25);
  box(0.12,0.03,0.12,0xeeeeea,CX0+0.1,2.32,ZE-2.9); sph(0.05,A.lampMat('L:hall',0xf6f1e2,0xfff0c8,1.1),CX0+0.16,2.3,ZE-2.9);      // a bare bulb on the wall in the corridor
  box(0.03,0.025,ZC-PZ1,0xf1f1ee,CX0+0.06,H-0.03,(PZ1+ZC)/2).castShadow=false;           // white trunking along the corridor ceiling
  box(0.12,0.08,0.12,0xf4f4f1,1.2,H-0.05,L+0.3); sph(0.05,0x2a2d30,1.2,H-0.11,L+0.33); box(0.6,0.012,0.012,0xf1f1ee,0.85,H-0.02,L+0.25);   // the security camera over our door
  box(0.6,0.014,0.4,0x8a6a48,(en[0]+en[1])/2,0.007,L+0.3).castShadow=false;               // doormats: ours, flat 4's and flat 3's
  box(0.6,0.014,0.4,0x6f5638,-0.8,0.007,L+0.3).castShadow=false; box(0.4,0.014,0.6,0x7a5e40,XL+0.25,0.007,L+0.78).castShadow=false;
  box(0.55,0.004,0.85,0xe7dcc0,-0.2,0.003,RZ+0.05).castShadow=false;                       // a lighter patch of floor: the access hatch
  const ed=A.door('entrance'); box(0.83,2.03,0.004,0xc2c7ca,0.425,1.02,0.023,ed.p); box(0.124,0.029,0.05,0x5f6466,0.72,1.05,0.05,ed.p);   // our door is grey on the lobby side too,
  const five=new THREE.Mesh(new THREE.PlaneGeometry(0.07,0.09),A.MT(canvasTex(32,40,function(g){g.fillStyle='#b3b8bb'; g.fillRect(0,0,32,40); g.fillStyle='#c9a24a'; g.font='bold 34px serif'; g.textAlign='center'; g.fillText('5',16,33);}),'hall'));
  five.position.set(0.425,1.62,0.026); ed.p.add(five);                                      // with a brass 5

  /* ---------- the stairs ---------- */
  const stepM=hallM(stepT), nose=M(0xb5a37d), soff=M(0xf0eee7), wood=M(0x45301f), iron=M(0x1d1f21), white=M(0xf3f3ef);
  const stairMats=[stepM,nose,soff,wood,iron,white];
  function flight(lx,dir,ly,hy,z0,z1,cap){              // NT treads from the low end (x lx, y ly) toward dir, rising to hy
    const rs=(hy-ly)/(NT+1), w=z1-z0, zc=(z0+z1)/2;
    for(let i=0;i<NT;i++){const y=ly+(i+1)*rs, x0=lx+dir*i*TD, x1=lx+dir*(i+1)*TD; if(cap&&y>cap) break;
      box(TD+0.005,rs+0.12,w,stepM,(x0+x1)/2,y-(rs+0.12)/2,zc); box(0.035,0.02,w,nose,x0+dir*0.0175,y-0.01,zc);}
    const len=Math.hypot(NT*TD,NT*rs)+0.15, a=Math.atan2(rs,TD)*dir, xm=lx+dir*NT*TD/2, ym=ly+rs*NT/2;
    const sf=box(len,0.2,w,soff,xm,ym-0.12-0.1,zc); sf.rotation.z=a;                            // its plastered underside
    return {rs:rs,nose:function(x){return ly+rs+rs*(x-lx)*dir/TD;}};
  }
  function floorAt(x0,x1,z0,z1,y){const g=new THREE.PlaneGeometry(x1-x0,z1-z0), U=g.attributes.uv; for(let i=0;i<U.count;i++) U.setXY(i,U.getX(i)*(x1-x0)/0.8,U.getY(i)*(z1-z0)/0.8);
    const t=terrazzo.clone(); t.needsUpdate=true; const m=new THREE.Mesh(g,hallM(t)); m.rotation.x=-R/2; m.position.set((x0+x1)/2,y,(z0+z1)/2); m.receiveShadow=true; m.userData.floor=true; scene.add(m); return m;}
  const fA=flight(SU,1,0,FF/2,ZA0,ZA1), fB=flight(XH,-1,FF/2,FF,ZB0,ZB1), fC=flight(SU,1,FF,FF*1.5,ZA0,ZA1), fD=flight(XH,-1,FF*1.5,FF*2,ZB0,ZB1,FF+H-0.05);
  const fBd=flight(XHd,-1,LO/2,0,ZB0,ZB1), fAd=flight(SU,1,LO,LO/2,ZA0,ZA1);                 // and down: from our landing to the floor below
  [FF/2,FF*1.5].forEach(function(y){box(XE-XH,0.2,EH-L-0.02,stepM,(XH+XE)/2,y-0.1,(L+EH)/2);});      // half landings
  box(XE-XHd,0.2,EH-ZA1-0.02,stepM,(XHd+XE)/2,LO/2-0.1,(ZA1+EH)/2); box(XE-XH,0.2,ZA1-L,stepM,(XH+XE)/2,LO/2-0.1,(L+ZA1)/2);
  box(SU-XB,FF-H-0.006,EH-L,M(0xf3f1ea),(XB+SU)/2,(H+FF)/2+0.003,(L+EH)/2);                // the edge of the floor above, over our landing
  [[FF,0x9da2a5,'7'],[LO,0x8a6a48,'']].forEach(function(q){const y=q[0];                     // the landings above and below, each with a door
    floorAt(XB,SU,L,EH,y+0.002);
    const back=new THREE.Mesh(new THREE.PlaneGeometry(EH-L,H),(function(){const m=hallM(plaster); m.clippingPlanes=[A.cut]; return m;})()); back.position.set(XB+0.005,y+H/2,(L+EH)/2); back.rotation.y=R/2; scene.add(back);
    const bc=new THREE.Mesh(new THREE.PlaneGeometry(EH-L,CL),hallM(ashlar)); bc.position.set(XB+0.008,y+CL/2,(L+EH)/2); bc.rotation.y=R/2; scene.add(bc);
    box(0.02,2.12,0.98,0xf3f2ee,XB+0.012,y+1.06,L+1.2); box(0.02,2.04,0.86,q[1],XB+0.022,y+1.02,L+1.2); box(0.04,0.02,0.12,0x5f6466,XB+0.05,y+1.05,L+0.85);
    [[L,0],[EH,R]].forEach(function(e){const s=new THREE.Mesh(new THREE.PlaneGeometry(SU-XB,H),hallM(plaster)); s.position.set((XB+SU)/2,y+H/2,e[0]+(e[1]?-0.005:0.005)); s.rotation.y=e[1]; scene.add(s);});
  });
  const top=new THREE.Mesh(new THREE.PlaneGeometry(XE-XB,EH-L),M(0xf7f7f4)); top.rotation.x=R/2; top.position.set((XB+XE)/2,FF+H,(L+EH)/2); scene.add(top);      // the stairwell's ceiling, a floor up
  floorAt(SU,XE,L,EH,LO+0.004);                                                            // and the floor of the shaft below
  /* cladding down in the shaft below our landing: the out building's own faces are its walls */
  function plate(ry,x,z,pts){const sh=new THREE.Shape(); pts.forEach(function(p,i){if(i) sh.lineTo(p[0],p[1]); else sh.moveTo(p[0],p[1]);});
    const g=new THREE.ShapeGeometry(sh), P=g.attributes.position, U=g.attributes.uv; for(let i=0;i<P.count;i++) U.setXY(i,P.getX(i)/1.2,P.getY(i)/CL);
    const m=new THREE.Mesh(g,cladM); m.position.set(x,0,z); m.rotation.y=ry; scene.add(m); return m;}
  plate(0,SU,L+0.006,[[0,LO],[uH,LO/2],[uE,LO/2],[uE,LO/2+CL],[uH,LO/2+CL],[0,LO+CL]]);      // along the flight down to the floor below, and its half landing
  plate(R,XE,EH-0.006,[[XE-SD,-0.02],[XE-XHd,LO/2],[0,LO/2],[0,-0.02]]);                   // along the flight down, on its outer side
  plate(-R/2,XE-0.006,L,[[0,LO/2],[EH-L,LO/2],[EH-L,LO/2+CL],[0,LO/2+CL]]);
  /* railings: dark wooden handrail on black bars along the flights up, black along the flights down, white round the void */
  function rail(x0,x1,f,z,hand,cap){                      // along a flight from x0 to x1, following its nosing line
    const n0=f.nose(x0), n1=f.nose(x1), y0=n0+0.88, y1=n1+0.88, len=Math.hypot(x1-x0,y1-y0), a=Math.atan2(y1-y0,x1-x0);
    if(!(cap&&Math.max(y0,y1)>cap)){const hr=box(len,hand?0.05:0.03,hand?0.06:0.035,hand?wood:iron,(x0+x1)/2,(y0+y1)/2+(hand?0.01:0),z); hr.rotation.z=a;}
    const br=box(len,0.025,0.02,iron,(x0+x1)/2,(n0+n1)/2+0.12,z); br.rotation.z=a;
    const d=Math.abs(x1-x0), sg=Math.sign(x1-x0);
    for(let t=0.06;t<d;t+=0.12){const x=x0+sg*t, n=f.nose(x); if(cap&&n+0.88>cap) continue; box(0.014,0.76,0.014,iron,x,n+0.5,z);}
  }
  const zr=ZA1+0.05;
  rail(SU,XH,fA,zr,true); rail(XH,SU,fB,ZB0-0.04,false); rail(SU,XH,fC,zr,true,FF+H-0.1); rail(SD,XHd,fBd,ZB0-0.04,false); rail(XH,SU,fAd,zr,false);
  box(SU-SD,0.05,0.06,wood,(SD+SU)/2,0.98,zr); box(SU-SD,0.025,0.02,iron,(SD+SU)/2,0.12,zr); for(let x=SD+0.06;x<SU;x+=0.12) box(0.014,0.86,0.014,iron,x,0.55,zr);      // level along the landing, where the flight down begins in front of our door
  box(0.05,1.0,0.05,iron,SD+0.02,0.5,zr);
  box(0.05,1.0,0.05,iron,SU+0.02,0.5,ZA1+0.05); box(0.07,0.06,0.07,wood,SU+0.02,1.0,ZA1+0.05);   // the newel at the bottom
  box(0.04,0.04,ZB0-ZA1+0.08,wood,XH,FF/2+0.92,(ZA1+ZB0)/2);                                   // and the handrail round the well at the half landing
  box(SU-SD+0.03,0.15,0.13,M(0xc9b791),(SD+SU)/2-0.015,0.075,EH+0.045);                        // across the end of the corridor: a stone curb on the edge of the flight down,
  box(SU-SD+0.06,0.02,0.15,0xd9c9a3,(SD+SU)/2-0.015,0.16,EH+0.045);
  box(SU-SD,0.04,0.04,white,(SD+SU)/2,1.02,EH+0.05); box(SU-SD,0.03,0.03,white,(SD+SU)/2,0.27,EH+0.05);      // a white railing on it,
  for(let x=SD+0.08;x<SU-0.02;x+=0.115) box(0.018,0.76,0.018,white,x,0.64,EH+0.05);
  cyl(0.024,H,white,SD-0.03,H/2,EH+0.05,null,10);                                               // and a white pole to the ceiling, flaking
  [0.7,1.4,2.1].forEach(function(y){box(0.05,0.03,0.003,0x6b5a3a,SD-0.03,y,EH+0.075);});
  A.rbox(0.66,0.86,0.025,0x1e2022,(SD+SU)/2+0.05,0.62,EH+0.09,null,0.01); A.rbox(0.66,0.05,0.08,0x1e2022,(SD+SU)/2+0.05,1.04,EH+0.05,null,0.02);   // a black rubber mat hung over it to dry

  stairMats.forEach(function(m){m.clippingPlanes=[A.cut];});                                  // the flights above are cut away with the walls when you cut them low

  /* ---------- the letter boxes and the meter cupboards, on the left as you come in ---------- */
  const wz=ZC;
  box(0.16,H,0.1,0xf3f2ee,XF-0.3,H/2,wz-0.05);                                                  // a white pilaster by the doorway
  const eb=canvasTex(128,96,function(g){g.fillStyle='#d8d4c8'; g.fillRect(0,0,128,96); g.fillStyle='#8a7e66'; g.fillRect(6,6,116,84);
    for(let r=0;r<3;r++) for(let c=0;c<9;c++){g.fillStyle=c%3?'#efe9da':'#2f3133'; g.fillRect(12+c*12,14+r*24,9,16);}
    g.fillStyle='#f2d33a'; g.beginPath(); g.moveTo(98,52); g.lineTo(112,78); g.lineTo(84,78); g.fill(); g.fillStyle='#111'; g.fillRect(96,60,4,12);
    g.fillStyle='#ffffff'; g.fillRect(18,74,40,12); g.fillStyle='#3a6ab0'; g.fillRect(20,76,36,8);});
  box(0.62,0.48,0.15,hallM(eb),XF-0.72,2.25,wz-0.075);                                            // the electricity board, its warning signs
  const vt=canvasTex(64,96,function(g){g.fillStyle='#c4c7c5'; g.fillRect(0,0,64,96); g.fillStyle='#9a9e9c'; for(let y=8;y<80;y+=4) g.fillRect(8,y,30,2);
    g.fillStyle='#f2d33a'; g.fillRect(42,64,16,18); g.fillStyle='#202020'; g.fillRect(42,30,16,14); g.fillStyle='#d23b2f'; g.fillRect(44,32,12,4);});
  box(0.62,0.6,0.2,hallM(vt),XF-1.42,2.27,wz-0.1);                                               // the telecom cabinet, louvred
  box(0.5,0.6,0.16,0xc9ccca,XF-2.02,2.27,wz-0.08); box(0.44,0.54,0.02,0x5b6a72,XF-2.02,2.27,wz-0.17);      // and the one beside it, left open, full of fibre
  for(let i=0;i<14;i++) box(0.006,0.46,0.006,[0xf2f2f0,0xf2d33a,0x5ba7d8][i%3],XF-2.2+i*0.028,2.25,wz-0.19);
  [[XF-1.72,1.9],[XF-2.4,1.95]].forEach(function(q){A.torus(0.09,0.012,0xf2f2f0,q[0],q[1],wz-0.22).rotation.y=0.3; A.torus(0.075,0.01,0xf2f2f0,q[0]+0.02,q[1]-0.02,wz-0.22);});   // coils of white cable hanging off them
  for(let i=0;i<9;i++){const x=XF-0.5-i*0.12; box(0.008,H-2.49,0.008,0xf0f0ee,x,(H+2.49)/2,wz-0.04-i*0.004);}   // bundles of wires up to the trunking
  box(XF-CX0,0.07,0.08,0xf2f2ef,(XF+CX0)/2,H-0.07,wz-0.05); box(0.08,0.07,ZC-PZ1,0xf2f2ef,CX0+0.05,H-0.07,(PZ1+ZC)/2);   // white trunking round the ceiling
  const mb=canvasTex(512,64,function(g){                                                        // the old brass letter boxes: 13 in two rows, papers sticking out
    const r=A.rng(17); g.fillStyle='#b8933e'; g.fillRect(0,0,512,64);
    for(let row=0;row<2;row++) for(let c=0;c<13;c++){const x=4+c*39, y=4+row*30; g.fillStyle='#1f2123'; g.fillRect(x,y,35,26); g.fillStyle='#3a3d40'; g.fillRect(x+3,y+3,29,9);
      g.fillStyle='#d8b65e'; g.fillRect(x+10,y+16,15,5);
      if(r()<0.45){g.fillStyle=['#f6f4ee','#f2d33a','#e44b3a','#ffffff'][Math.floor(r()*4)]; g.fillRect(x+4+r()*14,y-2+r()*8,10+r()*10,7+r()*6);}}});
  box(3.2,0.4,0.06,hallM(mb),XF-0.85-1.6,1.7,wz-0.03);
  for(let i=0;i<5;i++){const x=XF-1.0-i*0.55; box(0.09,0.06+((i*7)%3)*0.02,0.005,[0xf6f4ee,0xe44b3a,0xf2d33a][i%3],x,1.93,wz-0.07).rotation.z=0.3;}      // envelopes poking out
  box(0.26,0.3,0.12,0xc39a45,XF-4.22,1.66,wz-0.06); box(0.22,0.04,0.004,0x2a2a28,XF-4.22,1.62,wz-0.122);           // number 23's own brass box,
  const p24=canvasTex(64,48,function(g){g.fillStyle='#f6f6f2'; g.fillRect(0,0,64,48); g.fillStyle='#222'; g.font='bold 28px sans-serif'; g.textAlign='center'; g.fillText('24',32,36);});
  box(0.24,0.2,0.04,hallM(p24),XF-4.24,1.98,wz-0.03); box(0.2,0.12,0.01,0x8fc4e0,XF-3.98,2.0,wz-0.01);          // and number 24's plate above it
  for(let i=0;i<5;i++){const x=XF-0.88-i*0.33; box(0.28,0.33,0.13,0x18191a,x,1.33,wz-0.065); box(0.18,0.03,0.004,0x3d3f41,x,1.43,wz-0.132);
    box(0.1,0.035,0.004,[0xf6f4ee,0x9fc4d6,0xf6f4ee,0xe8c91a,0xf6f4ee][i],x,1.26,wz-0.132); cyl(0.012,0.01,0xb9bcbe,x-0.09,1.33,wz-0.135,null,8).rotation.x=R/2;}   // five newer black ones underneath
  const n1=canvasTex(64,90,function(g){g.fillStyle='#fbfbf8'; g.fillRect(0,0,64,90); g.fillStyle='#2f7d4f'; g.fillRect(0,0,64,14); g.fillStyle='#d23b2f'; g.font='bold 9px sans-serif'; g.fillText('אזהרה',22,26); g.fillStyle='#777'; for(let y=32;y<84;y+=6) g.fillRect(6,y,52-(y%4)*4,2);});
  const n2=canvasTex(48,70,function(g){g.fillStyle='#f2e43a'; g.fillRect(0,0,48,70); g.fillStyle='#d23b2f'; g.fillRect(4,10,40,8); g.fillStyle='#333'; for(let y=24;y<64;y+=6) g.fillRect(5,y,38-(y%3)*5,2);});
  box(0.21,0.3,0.004,hallM(n1),XF-2.65,1.33,wz-0.004); box(0.14,0.21,0.004,hallM(n2),XF-2.9,1.4,wz-0.004);
  box(0.08,0.12,0.03,0xf1f1ee,XF-0.45,1.55,wz-0.015); box(0.03,0.03,0.006,0x42b56b,XF-0.45,1.57,wz-0.032);   // a switch, a bell button with a green light
  box(0.1,0.1,0.03,0xf1f1ee,XF-0.36,1.2,wz-0.015); box(0.025,0.025,0.006,0xd23b2f,XF-0.36,1.2,wz-0.032);
  (function(){const x=CX0+0.32, z=wz-0.28;                                                            // the stainless pedal bin, "10" on its lid, a pink bag
    A.rbox(0.3,0.58,0.26,0xb6b9bb,x,0.29,z,null,0.03); A.rbox(0.31,0.06,0.27,0xc6c9cb,x,0.6,z,null,0.02); box(0.32,0.04,0.28,0xe8a0a8,x,0.55,z);
    const t10=canvasTex(32,24,function(g){g.fillStyle='#b6b9bb'; g.fillRect(0,0,32,24); g.fillStyle='#222'; g.font='bold 16px sans-serif'; g.fillText('10',6,18);});
    box(0.1,0.08,0.003,hallM(t10),x,0.42,z-0.132); box(0.12,0.02,0.05,0x6d7072,x,0.03,z-0.15);})();
  /* the white cupboard high on the front wall, a coil of green cable on it */
  const cz=ZE+0.75;
  box(0.12,1.2,0.78,0xf4f4f1,XF-0.06,1.9,cz); box(0.004,1.14,0.004,0xd6d8d6,XF-0.122,1.9,cz); [[-0.06],[0.06]].forEach(function(q){box(0.02,0.08,0.02,0xc9cdcf,XF-0.13,1.9,cz+q[0]);});
  A.torus(0.1,0.015,0x2f8a6a,XF-0.14,2.58,cz-0.25).rotation.y=R/2; A.torus(0.08,0.015,0x3b9d7a,XF-0.15,2.56,cz-0.22).rotation.y=R/2-0.4;
  box(0.05,0.07,0.03,0xd23b2f,XF-0.02,2.1,cz-0.6); box(0.04,H-2.5,0.04,0xf2f2ef,XF-0.03,(H+2.5)/2,cz+0.35);
});
/* a block of flats like every other in the street: window, shutter, balcony rail */
const bt=canvasTex(256,256,function(g){
  g.fillStyle='#e6dfcf'; g.fillRect(0,0,256,256); g.fillStyle='#d2cab6'; g.fillRect(0,232,256,24);
  g.fillStyle='#7f98a3'; g.fillRect(24,60,80,110); g.fillStyle='#f3efe4'; g.fillRect(62,60,4,110);
  g.fillStyle='#8aa08a'; for(let y=62;y<168;y+=9) g.fillRect(132,y,92,6); g.strokeStyle='#bdb5a0'; g.lineWidth=4; g.strokeRect(130,58,96,112);
  g.fillStyle='#c9c1ad'; g.fillRect(14,176,228,10); g.strokeStyle='#8f8a7c'; g.lineWidth=2; for(let x=18;x<240;x+=12){g.beginPath(); g.moveTo(x,186); g.lineTo(x,230); g.stroke();}
});
bt.wrapS=bt.wrapT=THREE.RepeatWrapping;

/* ================= outside: the yard one floor down, between us and the neighbours =================
   From the photos out of the kitchen window: a narrow yard of dirt and dry eucalyptus leaves, a concrete path and a
   manhole; about five metres away the back of the next building, its plaster stained and patched, white roller shutters,
   air conditioners on rusty brackets, drain pipes and bundles of cable; gas bottles under a hood and a column of water
   meters at its foot; a eucalyptus leaning up past our windows, and dense trees further along. */
inRoom('out',function(){
  const o=G(); o.userData.nc=true; A.outside=o;
  const ST=A.LB.stairs, XB=ST.XB, LB=A.LB;
  function ground(x0,x1,z0,z1,y,c){const m=box(x1-x0,0.1,z1-z0,c,(x0+x1)/2,y-0.05,(z0+z1)/2,o); m.castShadow=false; return m;}
  const NX=KX+4.9, NZ0=-9, NZ1=4.6, TOPN=12.6;                    // the neighbour's back wall, across the yard
  const dirt=canvasTex(256,256,function(g){const r=A.rng(61); g.fillStyle='#8a7860'; g.fillRect(0,0,256,256);
    for(let i=0;i<900;i++){g.fillStyle=['#6f5f4a','#a08a6c','#7d6a52','#b39b78','#5e5040'][Math.floor(r()*5)]; g.fillRect(r()*256,r()*256,1+r()*3,1+r()*2);}
    for(let i=0;i<120;i++){const x=r()*256, y=r()*256, a=r()*3.14; g.strokeStyle=['#c7a36a','#a87e4a','#d9bf8a','#8f6a3e'][i%4]; g.lineWidth=2+r()*2; g.beginPath(); g.moveTo(x,y); g.lineTo(x+Math.cos(a)*12,y+Math.sin(a)*12); g.stroke();}});
  dirt.wrapS=dirt.wrapT=THREE.RepeatWrapping;
  ground(-30,45,-45,40,GY,0xd8c7a0);                                          // sand round the buildings
  (function(){const z0=-9.5, z1=L, g=new THREE.PlaneGeometry(NX-XF,z1-z0), U=g.attributes.uv; for(let i=0;i<U.count;i++) U.setXY(i,U.getX(i)*(NX-XF)/2.5,U.getY(i)*(z1-z0)/2.5);      // dirt and dry leaves
    const m=new THREE.Mesh(g,A.MT(dirt,'out',true)); m.rotation.x=-R/2; m.position.set((XF+NX)/2,GY+0.012,(z0+z1)/2); m.receiveShadow=true; o.add(m);})();
  ground(NX-0.8,NX,NZ0,NZ1+1.6,GY+0.03,0xa7a39a); ground(XF,XF+0.7,-6,L,GY+0.03,0xa9a59c);      // concrete paths along both walls
  ground(7.1,8.9,-0.3,0.5,GY+0.025,0x9c988f);                                                     // and one across
  cyl(0.32,0.03,0x8e8a82,7.9,GY+0.04,1.4,o,24); A.torus(0.3,0.015,0x77736b,7.9,GY+0.055,1.4,o).rotation.x=R/2;     // a manhole cover
  // the building under and beside us: the floor below opens onto the yard. The stairwell's shaft is left open in it.
  const facade=0xe9e3d3, X7=-7, ZC=LB.ZC, EH=LB.EH, XE=LB.XE, hh=-GY-0.01, yc=GY/2-0.005;
  [[X7,XF,AZ-0.4,L],[X7,XB,L,EH],[XE,XF,L,EH],[X7,XF,EH,ZC]].forEach(function(q){box(q[1]-q[0],hh,q[3]-q[2],facade,(q[0]+q[1])/2,yc,(q[2]+q[3])/2,o);});
  box(D.BXB-XF+0.02,hh,-AZ+0.4,facade,(XF+D.BXB+0.02)/2,yc,(AZ-0.4)/2,o);
  box(XF-3.94,H,L-A.BA.z1-0.04,0xe4ddcc,(3.92+XF)/2,H/2,(A.BA.z1+0.02+L-0.02)/2,o);        // a block of shafts between our bathroom and the stairs
  const winTex=canvasTex(128,128,function(g){g.fillStyle='#e9e3d3'; g.fillRect(0,0,128,128); g.fillStyle='#8fb0bb'; g.fillRect(30,22,68,70); g.fillStyle='#f6f3ea'; g.fillRect(62,22,4,70); g.fillStyle='#cfc8b6'; g.fillRect(24,94,80,6);});
  winTex.wrapS=THREE.RepeatWrapping;
  function strip(len,x,y,z,rotY,hh){const t=winTex.clone(); t.needsUpdate=true; t.repeat.set(Math.round(len/2.6),1); const m=new THREE.Mesh(new THREE.PlaneGeometry(len,hh||2.6),A.MT(t)); m.position.set(x,y,z); m.rotation.y=rotY; o.add(m);}
  strip(L,XF+0.005,GY+1.4,L/2,R/2,2.4); strip(-AZ,D.BXB+0.025,GY+1.4,AZ/2,R/2,2.4); strip(ZC-L,XF+0.005,GY+1.4,(L+ZC)/2,R/2,2.4);      // the yard fronts, and the one down in the sunken strip
  strip(D.BXB-X7,(X7+D.BXB)/2,GY+1.4,AZ-0.405,R,2.4);

  /* ---------- the neighbour's back, across the yard ---------- */
  const nb=G(o), blocks=[{g:nb,axis:'x',face:NX}];
  const stain=canvasTex(512,512,function(g){const r=A.rng(70); g.fillStyle='#d9c3a3'; g.fillRect(0,0,512,512);
    for(let i=0;i<60;i++){const x=r()*512, y=r()*512, w=20+r()*90, h=30+r()*160, gr=g.createLinearGradient(x,y,x,y+h); const c=r()<0.5?'150,120,85':'235,220,195';
      gr.addColorStop(0,'rgba('+c+',0)'); gr.addColorStop(0.5,'rgba('+c+','+(0.15+r()*0.25)+')'); gr.addColorStop(1,'rgba('+c+',0)'); g.fillStyle=gr; g.fillRect(x,y,w,h);}
    for(let i=0;i<14;i++){g.fillStyle='rgba(240,236,226,'+(0.4+r()*0.4)+')'; g.fillRect(r()*512,r()*512,30+r()*90,20+r()*50);}      // patches of newer, whiter plaster
    for(let i=0;i<2500;i++){g.fillStyle='rgba(90,70,50,'+(r()*0.12)+')'; g.fillRect(r()*512,r()*512,1,1+r()*2);}});
  stain.wrapS=stain.wrapT=THREE.RepeatWrapping;
  box(6,TOPN-GY,NZ1-NZ0,0xd2bd9c,NX+3,(GY+TOPN)/2,(NZ0+NZ1)/2,nb);
  const face=new THREE.Mesh(new THREE.PlaneGeometry(NZ1-NZ0,TOPN-GY),(function(){const t=stain.clone(); t.needsUpdate=true; t.repeat.set((NZ1-NZ0)/5,(TOPN-GY)/5); return A.MT(t,'out',true);})());
  face.position.set(NX-0.005,(GY+TOPN)/2,(NZ0+NZ1)/2); face.rotation.y=-R/2; nb.add(face);
  const shut=canvasTex(64,128,function(g){g.fillStyle='#f3f1ec'; g.fillRect(0,0,64,128); g.fillStyle='#cdcac2'; for(let y=0;y<128;y+=5) g.fillRect(0,y,64,1.4); g.fillStyle='#e2ded5'; g.fillRect(0,0,64,8);});
  shut.wrapT=THREE.RepeatWrapping;
  const W0=[-7.6,-4.6,-1.4,1.3,3.5], NB=batch(nb);
  function nwin(z,y0,w,h,open,bars){                     // a window: a white frame, a roller shutter part way down over dark glass, bars in front
    NB.box(0.06,h+0.1,w+0.1,0xeae6dc,NX-0.03,y0+h/2,z); NB.box(0.04,h,w,0x2a3236,NX-0.05,y0+h/2,z);
    const t=shut.clone(); t.needsUpdate=true; t.repeat.set(1,(h*(1-open))/0.6);
    const s=new THREE.Mesh(new THREE.PlaneGeometry(w,h*(1-open)),A.MT(t,'out',true)); s.position.set(NX-0.075,y0+h-h*(1-open)/2,z); s.rotation.y=-R/2; nb.add(s);
    NB.box(0.14,0.16,w+0.12,0xe6e2d8,NX-0.07,y0+h+0.08,z);                                      // the shutter box
    NB.box(0.1,0.04,w+0.16,0xcfc6b4,NX-0.05,y0-0.02,z);                                         // the sill
    if(bars){for(let i=0;i<=Math.round(w/0.12);i++) NB.box(0.018,h+0.06,0.018,0xeeeeea,NX-0.14,y0+h/2,z-w/2+i*w/Math.round(w/0.12)); [0.3,0.7].forEach(function(f){NB.box(0.02,0.025,w+0.06,0xeeeeea,NX-0.14,y0+h*f,z);});}
  }
  [0.55,3.6,6.7,9.8].forEach(function(y,f){W0.forEach(function(z,i){nwin(z,y,i%2?1.1:1.5,1.55,[0.15,0.6,0.35,0.05,0.8][(i+f*2)%5],f===0||i===3);});});
  nwin(-1.2,GY+0.9,1.0,0.75,0.0,false);                                                        // the low window of the floor below, its brown shutter down
  (function(){const t=shut.clone(); t.needsUpdate=true; const m=new THREE.Mesh(new THREE.PlaneGeometry(0.96,0.72),new THREE.MeshLambertMaterial({color:0x8a6a48})); A.reg(m.material,'out'); m.position.set(NX-0.08,GY+1.27,-1.2); m.rotation.y=-R/2; nb.add(m);})();
  (function(){const z=3.55, y=GY+0.75, lat=canvasTex(64,96,function(g){g.fillStyle='#2c3336'; g.fillRect(0,0,64,96); g.strokeStyle='#f1f0ec'; g.lineWidth=3;     // an ornamental lattice over the window below the neighbours' ground floor
      for(let j=0;j<6;j++) for(let i=0;i<4;i++){g.beginPath(); g.moveTo(8+i*16,8+j*16); g.lineTo(16+i*16,16+j*16); g.lineTo(8+i*16,24+j*16); g.lineTo(i*16,16+j*16); g.closePath(); g.stroke();}});
    const m=new THREE.Mesh(new THREE.PlaneGeometry(0.9,1.4),A.MT(lat,'out')); m.position.set(NX-0.07,y+0.7,z); m.rotation.y=-R/2; nb.add(m); NB.box(0.08,1.5,1.0,0xeae6dc,NX-0.04,y+0.7,z);})();
  function ac(z,y,brand){const c=0xf1f1ee, u=B2.at(NX-0.25,y,z,-R/2);              // an air conditioner on a rusty bracket, its fan behind a grille
    u.box(0.82,0.58,0.3,c,0,0,0); u.cyl(0.21,0.02,0x3e4245,0.1,0,0.15,18,null,0,R/2); u.box(0.18,0.08,0.005,brand?0x1d4ea0:0xe8762a,-0.28,0.18,0.152);
    [[-0.3],[0.3]].forEach(function(q){u.box(0.04,0.04,0.4,0x6b4a33,q[0],-0.31,0.05); u.box(0.04,0.4,0.04,0x6b4a33,q[0],-0.12,-0.13,0,0.8);});}
  const B2=batch(nb);
  [[1.9,GY+1.25,1],[3.05,GY+0.92,0],[0.4,1.15,1],[2.7,1.6,0],[-2.4,2.0,1],[1.6,3.9,0],[-0.6,4.8,1],[3.9,4.2,0],[-3.4,6.9,0],[2.2,7.2,1],[0.8,10.1,0],[-5.8,3.95,1]].forEach(function(q){ac(q[0],q[1],q[2]);});
  [[2.45,0x9b9e9c,0.055],[-0.25,0x6f7275,0.05],[2.62,0x1d1f21,0.03],[0.05,0xf0f0ec,0.03]].forEach(function(q){NB.cyl(q[2],TOPN-GY,q[1],NX-0.12,(GY+TOPN)/2,q[0],8);});     // drain pipes and conduits down the wall
  NB.box(0.5,0.04,0.7,0xd9dcdf,NX-0.6,4.55,2.0,0,0.35); for(let i=0;i<6;i++) NB.box(0.52,0.02,0.02,0xc4c7ca,NX-0.6,4.56+i*0.012,1.7+i*0.12,0,0.35);   // a corrugated plastic awning
  (function(){const pts=[]; [[GY+0.55],[GY+0.62],[0.2],[0.28]].forEach(function(q,k){const line=[]; for(let i=0;i<=24;i++){const z=NZ0+0.5+i*(NZ1-NZ0-1)/24; line.push(new THREE.Vector3(NX-0.09,q[0]-0.06*Math.sin(i*0.9+k),z));}
      nb.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(line),new THREE.LineBasicMaterial({color:0x1b1c1d})));});})();      // black cables strung along it
  /* at its foot: a white cabinet, gas bottles under a hood, the water meters */
  NB.box(0.26,0.85,0.55,0xeeeeea,NX-0.15,GY+0.43,0.75); NB.box(0.005,0.8,0.5,0xd8d8d4,NX-0.282,GY+0.43,0.75);
  NB.cyl(0.15,0.62,0xc8cbcd,NX-0.22,GY+0.31,1.35,14); NB.cyl(0.14,0.5,0x2f66b0,NX-0.22,GY+0.25,1.68,14); NB.box(0.45,0.06,0.8,0x8e9294,NX-0.24,GY+0.78,1.5,0,-0.25);      // two gas bottles, a hood
  for(let i=0;i<6;i++){NB.box(0.08,0.07,0.12,0x2f6fd6,NX-0.13,GY+0.45+i*0.2,2.05); NB.cyl(0.012,0.2,0x9aa0a4,NX-0.1,GY+0.55+i*0.2,2.05,6);}      // a column of blue water meters on the supply pipe
  NB.cyl(0.02,1.6,0x9aa0a4,NX-0.07,GY+0.9,2.0,6);
  NB.box(0.3,0.25,0.4,0xc9c4ba,NX-0.3,GY+0.12,1.0); NB.cyl(0.14,0.14,0xbab5aa,NX-0.33,GY+0.32,1.0,12,null,0,R/2);      // an old concrete trough
  NB.done(); B2.done();
  /* trees: the eucalyptus leaning up past the kitchen window, and dense ones further along */
  const C2=batch(o), T=batch(o), bark=0xb9b0a0, leafE=[0x7e9a72,0x93ad84,0x6b8a62,0xa4b78f];
  function euc(x,z,h,lean,ld,seed){                     // a pale trunk, a few limbs, long strands of narrow leaves hanging from them
    const r=A.rng(seed), tx=x+Math.sin(ld)*lean*h, tz=z+Math.cos(ld)*lean*h;
    T.cyl(0.13,h,bark,(x+tx)/2,GY+h/2,(z+tz)/2,8,0.09,ld,Math.atan(lean));
    for(let b=0;b<6;b++){let a=r()*6.28; const bl=1.2+r()*1.6, by=GY+h*(0.55+r()*0.4), bx=x+(tx-x)*(by-GY)/h, bz=z+(tz-z)*(by-GY)/h;
      if(bx+Math.sin(a)*bl<5.75) a=R-a;                                          // never reaching into the flat: limbs that would, grow the other way
      const ex=bx+Math.sin(a)*bl, ez=bz+Math.cos(a)*bl, ey=by+0.6+r()*0.8;
      T.cyl(0.04,Math.hypot(bl,ey-by),bark,(bx+ex)/2,(by+ey)/2,(bz+ez)/2,6,0.025,a,Math.atan2(bl,ey-by));
      for(let s=0;s<16;s++){const t=r(), sx=bx+(ex-bx)*t+(r()-0.5)*0.6, sz=bz+(ez-bz)*t+(r()-0.5)*0.6, sy=by+(ey-by)*t+0.3, n=4+Math.floor(r()*6);
        if(sx<5.6) continue; for(let k=0;k<n;k++){const g=new THREE.BoxGeometry(0.03,0.2,0.004); T.geo(g,leafE[(s+k)%4],sx+(r()-0.5)*0.08,sy-k*0.17,sz+(r()-0.5)*0.08,r()*6.28,(r()-0.5)*0.5);}}}
  }
  euc(7.0,-0.6,5.4,0.12,0.9,3); euc(8.6,3.4,4.6,0.1,2.6,5); euc(7.6,-5.2,6.2,0.08,0.3,9);
  function bushy(x,z,s){for(let i=0;i<9;i++){const a=i*2.3; T.sph(0.6*s,[0x46663f,0x5a7a4c,0x3d5a38][i%3],x+Math.sin(a)*0.7*s,GY+0.6*s+(i%3)*0.5*s,z+Math.cos(a)*0.7*s,1,0.85,1);}}
  bushy(6.4,-2.8,1.3); bushy(6.2,-7.2,1.5); bushy(9.0,-3.6,1.1); bushy(8.9,4.2,0.9);
  [[8.4,-3.0,4.4,1.0],[8.7,-7.4,5.0,1.15]].forEach(function(q){T.cyl(0.16*q[3],q[2],0x6b5a44,q[0],GY+q[2]/2,q[1],8,0.11*q[3]); for(let i=0;i<5;i++){const a=i*1.3; C2.sph(1.3*q[3],[0x3e5f3a,0x4f7146,0x34522f][i%3],q[0]+Math.sin(a)*1.1*q[3],GY+q[2]+0.5+(i%2)*0.6,q[1]+Math.cos(a)*1.1*q[3],1,0.75,1);}});
  T.done(); C2.done();
  for(let i=0;i<10;i++) sph(0.5,i%2?0x3f7d4a:0x4a8a58,-5+i*1.2,GY+0.38,AZ-8.2,o,1,0.8,1);            // a hedge along the east neighbour's edge
  /* the neighbouring building to the east: four floors over a ground floor */
  function block(cx,cz,sx,sz,faceAxis){
    const o2=G(o); blocks.push({g:o2,axis:faceAxis,face:faceAxis==='x'?cx-sx/2:cz+sz/2});
    const top=12.6, hh=top-GY;
    box(sx,hh,sz,0xddd5c3,cx,GY+hh/2,cz,o2);
    const len=faceAxis==='x'?sz:sx, t=bt.clone(); t.needsUpdate=true; t.repeat.set(Math.round(len/3.4),4);
    const m=new THREE.Mesh(new THREE.PlaneGeometry(len,12.4),A.MT(t));
    if(faceAxis==='x'){m.position.set(cx-sx/2-0.02,6.3,cz); m.rotation.y=-R/2;} else{m.position.set(cx,6.3,cz+sz/2+0.02); }
    o2.add(m);
    for(let f=0;f<4;f++){const y=0.25+f*3.1; if(faceAxis==='x') box(1.1,0.12,len-1,0xcfc7b3,cx-sx/2-0.55,y,cz,o2); else box(len-1,0.12,1.1,0xcfc7b3,cx,y,cz+sz/2+0.55,o2);}
    for(let i=0;i<Math.floor(len/5);i++){            // pilotis and the solar water heaters on the roof
      const u=-len/2+2.5+i*5;
      if(faceAxis==='x'){box(0.4,2.9,0.4,0xcfc7b3,cx-sx/2-0.3,GY+1.45,cz+u,o2); cyl(0.3,1.2,0xf6f6f2,cx,top+0.9,cz+u,o2,12).rotation.z=R/2; box(1.6,0.06,1.0,0x2b3d55,cx-1.4,top+0.5,cz+u,o2).rotation.z=0.5;}
      else{box(0.4,2.9,0.4,0xcfc7b3,cx+u,GY+1.45,cz+sz/2+0.3,o2); cyl(0.3,1.2,0xf6f6f2,cx+u,top+0.9,cz,o2,12).rotation.x=R/2; box(1.0,0.06,1.6,0x2b3d55,cx+u,top+0.5,cz+1.4,o2).rotation.x=0.5;}
    }
  }
  block(7,AZ-9-5.5,34,11,'z');
  A.frameFns.push(function(){                      // a neighbour is hidden while the camera is behind or inside it, so it never blocks the view
    const c=A.camera.position; blocks.forEach(function(b){b.g.visible=A.sunReal||(b.axis==='x'?c.x<b.face-0.5:c.z>b.face+1.5);});
  });
});

/* ================= the street side =================
   From the photos of the walk in: Haroe St, the café of number 12 under its umbrellas on a small paved square, a path past
   the café and a fenced garden with a round memorial stone, a few steps down to a lower terrace along the building, and the
   bridge across the sunken strip into the doorway in the corner where number 12's wing meets our front. Inside, the
   corridor turns right toward our door, so this front faces the same way as our kitchen window. The floor below takes
   its light from the sunken strip, full of air-conditioner units. A second bridge further along leads to flats 1 and 6.
   All of this is laid out in a frame of its own, as you see it from the street: x runs to the right along our front,
   starting at that corner; z comes out toward you; y=0 is the lobby floor. The whole is then turned into place. */

/* It is built from a great many small parts, so parts of one colour (or one texture) are merged into a single mesh. */
function batch(parent,lift){             // lift: a little light of their own, for parts on a front that never faces the sun
  const by=new Map(), m4=new THREE.Matrix4(), nm=new THREE.Matrix3(), q=new THREE.Quaternion(), e=new THREE.Euler(), v=new THREE.Vector3(), one=new THREE.Vector3(1,1,1);
  function add(geo,c,x,y,z,ry,rx){              // c: a colour or a material. Turned by ry, after tilting by rx
    let b=by.get(c); if(!b) by.set(c,b={p:[],n:[],u:[],i:[]});
    const P=geo.attributes.position, N=geo.attributes.normal, U=geo.attributes.uv, I=geo.index, base=b.p.length/3;
    m4.compose(v.set(x,y,z+api.oz),q.setFromEuler(e.set(rx||0,ry||0,0,'YXZ')),one); nm.getNormalMatrix(m4);
    for(let k=0;k<P.count;k++){
      v.fromBufferAttribute(P,k).applyMatrix4(m4); b.p.push(v.x,v.y,v.z);
      v.fromBufferAttribute(N,k).applyMatrix3(nm); b.n.push(v.x,v.y,v.z);
      b.u.push(U?U.getX(k):0,U?U.getY(k):0);
    }
    if(I) for(let k=0;k<I.count;k++) b.i.push(base+I.getX(k)); else for(let k=0;k<P.count;k++) b.i.push(base+k);
  }
  const api={
    oz:0,                                      // added to every z: a stretch of the street drawn where it was first measured, moved out as a whole
    geo:add,
    box:function(w,h,d,c,x,y,z,ry,rx){add(new THREE.BoxGeometry(w,h,d),c,x,y,z,ry,rx);},
    cyl:function(r,h,c,x,y,z,seg,rTop,ry,rx){add(new THREE.CylinderGeometry(rTop==null?r:rTop,r,h,seg||10),c,x,y,z,ry,rx);},
    sph:function(r,c,x,y,z,sx,sy,sz){const g=new THREE.SphereGeometry(r,10,7); if(sx) g.scale(sx,sy,sz); add(g,c,x,y,z);},
    at:function(ox,oy,oz,o){                    // the same three, in the frame of a piece that stands at ox,oz and is turned by o
      o=o||0; const cs=Math.cos(o), sn=Math.sin(o), X=function(x,z){return ox+x*cs+z*sn;}, Z=function(x,z){return oz-x*sn+z*cs;};
      return {box:function(w,h,d,c,x,y,z,ry,rx){api.box(w,h,d,c,X(x,z),oy+y,Z(x,z),o+(ry||0),rx);},
              cyl:function(r,h,c,x,y,z,seg,rTop,ry,rx){api.cyl(r,h,c,X(x,z),oy+y,Z(x,z),seg,rTop,o+(ry||0),rx);},
              sph:function(r,c,x,y,z,sx,sy,sz){api.sph(r,c,X(x,z),oy+y,Z(x,z),sx,sy,sz);},
              geo:function(g,c,x,y,z,ry,rx){api.geo(g,c,X(x,z),oy+y,Z(x,z),o+(ry||0),rx);}};
    },
    done:function(){by.forEach(function(b,c){
      const g=new THREE.BufferGeometry();
      g.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(b.n,3));
      g.setAttribute('uv',new THREE.Float32BufferAttribute(b.u,2)); g.setIndex(b.i);
      const m=new THREE.Mesh(g,c.isMaterial?c:A.reg(new THREE.MeshLambertMaterial({color:c,emissive:lift||0}))); m.receiveShadow=true; parent.add(m);});}
  };
  return api;
}

inRoom('street',function(){
  const WELL=1.6, BS=WELL+0.25, LZ=4.2, SZ=LZ+0.32, D8=8, GZ=10.4+D8, AW=3.4, U=0.17, LA=-0.15, RY=U-0.13, KZ=18.55+D8, RW=7, ZF=42+D8, FW=ZC-L, TOP=12.6, BRW=1.3, SQ=19.5;
  const BL=5.0, KB=WELL, FZ=BL+0.38+4.4, AL=FZ+0.45;
  /* WELL: width of the sunken strip along our front; BS, LZ..SZ: the second bridge, the paved patch in front of it (LA, a step below the
     lobby) and two steps up from there to its path through the garden; GZ: where the garden meets the square; AW: width of the alley; U: the
     level of the alley, the café and the street; RY: the road; KZ: the kerb; RW: width of the road; ZF: far edge; FW and TOP: length and
     height of our front. Our own way in, from the photos of the walk: a bridge BL long over sunken ground, its right side bending in toward
     the doorway from KB; a step down from it to a forecourt of old slabs (LA) reaching to FZ, where two broad steps go up to the alley at AL.
     D8: how much farther out the square, the café and the street stand than first drawn, to make room for all of that. */
  const BX=[ZC-ZO,ZC-Z2], P2=[BX[1]-0.8,BX[1]+0.8];    // the two bridges, along the front; the path through the garden to the second one
  const st=G(), can=G(st), fac=G(st), far=[];          // everything; the tree crowns; our own street front; the other buildings
  st.userData.nc=true; st.rotation.y=R/2; st.position.set(XF,0,ZC); st.updateMatrixWorld(true);
  const B=batch(st), C=batch(can), F=batch(fac,0x3c3d3b);
  const iron=0x2b2f2c, green=0x23402f, stone=0xd8d2c4, leaf=[0x3f7d4a,0x4a8a58,0x2f6b45], rnd=A.rng(10);
  const tex=function(w,h,draw,wrap){const t=canvasTex(w,h,draw); if(wrap) t.wrapS=t.wrapT=THREE.RepeatWrapping; return t;};
  function flat(x0,x1,z0,z1,y,mat,pitch){            // a level patch, its texture laid out in metres
    const g=new THREE.BufferGeometry(), p=pitch||1;
    g.setAttribute('position',new THREE.Float32BufferAttribute([x0,y,z0, x0,y,z1, x1,y,z1, x1,y,z0],3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute([x0/p,z0/p, x0/p,z1/p, x1/p,z1/p, x1/p,z0/p],2));
    g.setIndex([0,1,2,0,2,3]); g.computeVertexNormals();
    const m=new THREE.Mesh(g,mat); m.receiveShadow=true; st.add(m); return m;
  }
  function panel(w,h,mat,x,y,z,ry,parent){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat); m.position.set(x,y,z); m.rotation.y=ry||0; (parent||st).add(m); return m;}

  /* ---------- ground. From the square a paved alley runs to our front along number 12's side, a fenced garden on its right. At its end two
     broad steps go down to a forecourt, and from there our bridge crosses the sunken ground to the doorway. A path through the garden leads
     the same way, more shortly, to the second bridge. ---------- */
  const pave=tex(256,256,function(g){                     // the café and the square: brick pavers in red, plum and grey, laid herringbone
    const r=A.rng(44), cs=['#8c5f52','#7f5a4e','#9a6a5c','#7a6460','#8f7a72','#6e5552','#a37766','#857b78'];
    g.fillStyle='#5e4a44'; g.fillRect(0,0,256,256);
    for(let j=-2;j<10;j++) for(let i=-2;i<10;i++){const x=i*32+j*16, y=j*32-i*16;
      g.fillStyle=cs[Math.floor(r()*cs.length)]; g.fillRect(x+1,y+1,30,14); g.fillStyle=cs[Math.floor(r()*cs.length)]; g.fillRect(x+17,y+17,14,30);}
    for(let i=0;i<900;i++){g.fillStyle='rgba(255,255,255,'+(r()*0.08)+')'; g.fillRect(r()*256,r()*256,1,1);}
  },true), paveM=A.MT(pave,null,true);
  const conc=tex(256,256,function(g){                     // the paved area in front of the bridge: old concrete slabs, stained
    const r=A.rng(57); g.fillStyle='#8a857b'; g.fillRect(0,0,256,256);
    for(let j=0;j<2;j++) for(let i=0;i<2;i++){g.fillStyle='rgb('+(170+Math.floor(r()*20))+','+(164+Math.floor(r()*20))+','+(150+Math.floor(r()*20))+')'; g.fillRect(i*128+2,j*128+2,124,124);}
    for(let i=0;i<40;i++){g.fillStyle='rgba(60,50,40,'+(0.05+r()*0.12)+')'; g.beginPath(); g.ellipse(r()*256,r()*256,4+r()*20,3+r()*12,r()*3,0,7); g.fill();}
    for(let i=0;i<60;i++){g.fillStyle=['#a87e4a','#8f6a3e','#6f5a3a'][i%3]; g.fillRect(r()*256,r()*256,3+r()*5,1+r()*2);}
  },true), concM=A.MT(conc,null,true);
  const slabs=tex(256,256,function(g){                    // the alley: worn beige stone slabs, 40 cm
    const r=A.rng(52); g.fillStyle='#9d9384'; g.fillRect(0,0,256,256);
    for(let j=0;j<4;j++) for(let i=0;i<4;i++){const c=200+Math.floor(r()*26); g.fillStyle='rgb('+c+','+(c-8)+','+(c-22)+')'; g.fillRect(i*64+1.5,j*64+1.5,61,61);
      for(let k=0;k<60;k++){g.fillStyle='rgba('+(r()>0.5?'90,80,65':'255,250,235')+','+(0.06+r()*0.1)+')'; g.fillRect(i*64+r()*62,j*64+r()*62,1+r()*3,1+r()*2);}}
  },true), slabM=A.MT(slabs,null,true);
  const chips=tex(128,128,function(g){                    // the landing and the bridges: small speckled tiles, 20 cm
    const r=A.rng(61); g.fillStyle='#b9b2a3'; g.fillRect(0,0,128,128);
    for(let j=0;j<4;j++) for(let i=0;i<4;i++){g.fillStyle='#e6dfcf'; g.fillRect(i*32+1,j*32+1,30,30);}
    for(let k=0;k<700;k++){g.fillStyle=['#a89f8c','#8a8170','#f4efe2','#c4b9a2'][Math.floor(r()*4)]; g.fillRect(r()*128,r()*128,1+r()*1.5,1+r()*1.5);}
  },true), chipM=A.MT(chips,null,true);
  const walkT=tex(256,256,function(g){                   // our bridge: 25 cm terrazzo tiles, beige going pink, finely speckled, grey joints
    const r=A.rng(66); g.fillStyle='#958b7c'; g.fillRect(0,0,256,256);
    for(let j=0;j<4;j++) for(let i=0;i<4;i++){const c=206+Math.floor(r()*16); g.fillStyle='rgb('+c+','+(c-10)+','+(c-26)+')'; g.fillRect(i*64+1.5,j*64+1.5,61,61);
      for(let k=0;k<120;k++){g.fillStyle=['rgba(140,120,95,0.55)','rgba(250,244,230,0.6)','rgba(170,120,110,0.4)'][k%3]; g.fillRect(i*64+2+r()*59,j*64+2+r()*59,1,1);}
      for(let k=0;k<6;k++){g.fillStyle='rgba(90,75,55,'+(0.04+r()*0.06)+')'; g.beginPath(); g.ellipse(i*64+r()*64,j*64+r()*64,3+r()*9,2+r()*5,r()*3,0,7); g.fill();}}
  },true), walkM=A.MT(walkT,null,true);
  const soil=0x4d4334, kerb=0xc9c3b4;

  B.box(AW,LA-GY,FZ-BL,stone,AW/2,(GY+LA)/2,(BL+FZ)/2); flat(0,AW,BL,FZ,LA+0.004,concM,2.4);      // our forecourt, solid ground: its edge is the wall of the sunken ground
  (function(){const ym=(LA+U)/2;                                                                    // two broad steps up to the alley, of the same worn slabs
    B.box(AW,ym-GY,AL-FZ,0xcbc4b3,AW/2,(ym+GY)/2,(FZ+AL)/2); flat(0,AW,FZ,AL,ym+0.004,slabM,1.6); B.box(AW,0.025,0.05,0xb3ac9b,AW/2,ym-0.012,FZ+0.025);
    B.box(AW,U-GY,GZ-AL,stone,AW/2,(GY+U)/2,(AL+GZ)/2); flat(0,AW,AL,GZ,U+0.004,slabM,1.6); B.box(AW,0.025,0.05,0xb3ac9b,AW/2,U-0.012,AL+0.025);})();
  (function(){const x0=P2[0], x1=P2[1], w=x1-x0, xc=(x0+x1)/2;                                     // the second bridge's way: a paved patch, two steps up, a path through the garden
    B.box(w,LA-GY,LZ-WELL,stone,xc,(GY+LA)/2,(WELL+LZ)/2); flat(x0,x1,WELL,LZ,LA+0.004,concM,2.4);
    const ym=(LA+U)/2; B.box(w,ym-GY,0.33,0xcbc4b3,xc,(ym+GY)/2,LZ+0.165); B.box(w,0.025,0.05,0xb3ac9b,xc,ym-0.012,LZ+0.025);
    B.box(w,U-GY,GZ-SZ,stone,xc,(GY+U)/2,(SZ+GZ)/2); flat(x0,x1,SZ,GZ,U+0.004,slabM,1.6); B.box(w,0.025,0.05,0xb3ac9b,xc,U-0.012,SZ+0.025);})();
  [[AW,P2[0]],[P2[1],FW]].forEach(function(q){const w=q[1]-q[0], xc=(q[0]+q[1])/2;                                  // the garden, raised to street level
    B.box(w,U-GY,GZ-WELL,stone,xc,(GY+U)/2,(WELL+GZ)/2); B.box(w-0.16,0.02,GZ-WELL-0.16,soil,xc,U+0.01,(WELL+GZ)/2);
    B.box(0.12,0.22,GZ-WELL,kerb,q[0]+0.06,U+0.11,(WELL+GZ)/2); B.box(0.12,0.22,GZ-WELL,kerb,q[1]-0.06,U+0.11,(WELL+GZ)/2); B.box(w,0.22,0.12,kerb,xc,U+0.11,WELL+0.06);});
  B.box(SQ+19,U-GY,KZ-GZ,stone,(SQ-19)/2,(GY+U)/2,(GZ+KZ)/2); flat(-19,SQ,GZ,KZ-0.16,U+0.004,paveM,1.6);       // the square, at street level
  B.box(50-SQ,U-GY,KZ-16-D8,stone,(SQ+50)/2,(GY+U)/2,(16+D8+KZ)/2); flat(SQ,50,16+D8,KZ-0.16,U+0.004,paveM,1.6);        // and the pavement on past number 8
  B.box(69,RY-GY,ZF-KZ,0x5d6164,15.5,(GY+RY)/2,(KZ+ZF)/2);                                            // asphalt
  B.box(FW,0.04,WELL,0xbdb6a6,FW/2,GY+0.02,WELL/2); B.box(AW,0.04,BL-WELL,0xbdb6a6,AW/2,GY+0.02,(WELL+BL)/2);      // floor of the sunken strip, and of the ground our bridge crosses
  [[-19,-1.7],[3.9,50]].forEach(function(q){                                                          // far pavement, either side of Moshe Sharet St
    B.box(q[1]-q[0],0.13,ZF-KZ-RW,stone,(q[0]+q[1])/2,RY+0.065,(KZ+RW+ZF)/2); flat(q[0],q[1],KZ+RW+0.16,29.05+D8,U+0.004,paveM,1.6);});
  for(let x=-7.5;x<22.5;x+=0.5){const red=x>=3&&x<11, odd=Math.round(x*2)%2;                          // painted kerb: red and white by the crossing, blue and white where you may park
    B.box(0.5,0.14,0.16,odd?(red?0xc23a34:0x3a62b0):0xf1f1ec,x+0.25,U-0.062,KZ-0.07);}
  for(let k=0;k<7;k++) B.box(3.2,0.012,0.5,0xeeeeea,7.1,RY+0.006,KZ+0.6+k);
  B.box(1.6,0.012,0.6,0xd9b93a,7.1,U+0.01,KZ-0.5); B.box(0.6,0.012,3.2,0xd9b93a,7.1,U+0.01,KZ-2.4);  // tactile strip leading in from the crossing
  const shade=tex(256,256,function(g){const r=A.rng(77);                                              // the alley and the square lie in dappled shade all day
    for(let i=0;i<80;i++){const x=r()*256, y=r()*256, q=10+r()*26, gr=g.createRadialGradient(x,y,0,x,y,q);
      gr.addColorStop(0,'rgba(18,28,20,0.32)'); gr.addColorStop(1,'rgba(18,28,20,0)'); g.fillStyle=gr; g.fillRect(x-q,y-q,2*q,2*q);}},true);
  const shadeM=new THREE.MeshBasicMaterial({map:shade,transparent:true,depthWrite:false});
  flat(0,AW,AL,GZ,U+0.02,shadeM,18).renderOrder=1; flat(0,AW,BL,FZ,LA+0.02,shadeM,18).renderOrder=1; flat(0,20,GZ,KZ-0.16,U+0.02,shadeM,18).renderOrder=1;

  /* ---------- the second entrance: a short bridge over the strip to an open doorway ---------- */
  const wrail=0xefefea;
  (function(){const bx=BX[1];
    B.box(BRW,0.22,BS+0.05,0xc9c4b8,bx,-0.107,BS/2-0.025); flat(bx-BRW/2+0.12,bx+BRW/2-0.12,-0.05,BS,0.004,chipM,0.6);      // a narrow concrete slab with kerbs and tiles, white zig-zag railings,
    B.box(BRW,0.04,0.05,0xb3ac9b,bx,-0.02,BS-0.025);                                                                         // ending in a step down to the paved patch
    [-1,1].forEach(function(s){const x=bx+s*(BRW/2-0.06);
      B.box(0.12,0.14,WELL+0.1,0xc9c4b8,x,0.07,WELL/2);
      B.box(0.045,0.045,WELL,wrail,x,1.02,WELL/2); B.box(0.035,0.035,WELL,wrail,x,0.2,WELL/2);
      for(let z=0.05,k=0;z<WELL+0.01;z+=0.2,k++){B.box(0.02,0.82,0.02,wrail,x,0.61,z); if(z+0.2<WELL+0.05) B.box(0.016,0.85,0.016,wrail,x,0.61,z+0.1,0,(k%2?1:-1)*0.235);}});
  })();

  /* ---------- our bridge, from the photos of the walk in: a slab of old concrete five metres long over the sunken ground, tiled in 25 cm
     terrazzo, a heavy concrete kerb along each side with the white zig-zag railing standing on it. You step up onto it from the forecourt;
     it runs straight toward the front, and over the strip along the front its right side turns in, so the walk narrows into the doorway
     in the corner. Air conditioners on racks fill the ground below on both sides. ---------- */
  const WX0=BX[0]-BRW/2, DXR=BX[0]+BRW/2, WX1=WX0+2.1, KW=0.18, kc=0xc2baa7;      // the walk's left edge, in line with the doorway's; the doorway's right side; the walk's right edge along the straight part; kerbs of old concrete
  function prism(pts,y0,y1,c){            // an upright slab over a convex outline in the ground plane (x, z), drawn in c
    const p=[], n=[], uv=[], tri=function(a,b,d,nx,ny,nz){[a,b,d].forEach(function(q){p.push(q[0],q[1],q[2]); n.push(nx,ny,nz); uv.push(q[0],q[2]);});};
    for(let i=1;i<pts.length-1;i++){const a=pts[0], b=pts[i], d=pts[i+1]; tri([a[0],y1,a[1]],[d[0],y1,d[1]],[b[0],y1,b[1]],0,1,0); tri([a[0],y0,a[1]],[b[0],y0,b[1]],[d[0],y0,d[1]],0,-1,0);}
    if(y1-y0>0.01) for(let i=0;i<pts.length;i++){const a=pts[i], b=pts[(i+1)%pts.length], dx=b[0]-a[0], dz=b[1]-a[1], l=Math.hypot(dx,dz)||1, nx=dz/l, nz=-dx/l;
      tri([a[0],y0,a[1]],[b[0],y1,b[1]],[b[0],y0,b[1]],nx,0,nz); tri([a[0],y0,a[1]],[a[0],y1,a[1]],[b[0],y1,b[1]],nx,0,nz);}
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(p,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(n,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
    B.geo(g,c,0,0,0);
  }
  function zig(x0,z0,x1,z1,y0,y1){        // a white railing from one point to another: top and bottom rails, a post at each end, bars that go up straight and come down slanting
    const len=Math.hypot(x1-x0,z1-z0), r=B.at(x0,0,z0,Math.atan2(x1-x0,z1-z0)), h=y1-y0-0.06, n=Math.max(2,Math.round(len/0.2)), sp=len/n;
    r.box(0.045,0.045,len,wrail,0,y1,len/2); r.box(0.035,0.035,len,wrail,0,y0+0.06,len/2);
    r.box(0.05,y1-y0,0.05,wrail,0,(y0+y1)/2,0.03); r.box(0.05,y1-y0,0.05,wrail,0,(y0+y1)/2,len-0.03);
    for(let k=0;k<n;k++){if(k) r.box(0.02,h,0.02,wrail,0,y0+0.06+h/2,k*sp); r.box(0.02,Math.hypot(h,sp),0.02,wrail,0,y0+0.06+h/2,(k+0.5)*sp,0,(k%2?1:-1)*Math.atan2(sp,h));}
  }
  const dn=(function(){const dx=WX1-DXR, dz=KB, l=Math.hypot(dx,dz); return [dz/l,-dx/l];})();      // out from the slanting side
  prism([[WX0-KW,0],[DXR+dn[0]*KW,0],[WX1+KW,KB+0.1],[WX1+KW,BL],[WX0-KW,BL]],-0.26,-0.004,kc);       // the slab under it all
  prism([[WX0,0],[DXR,0],[WX1,KB],[WX1,BL],[WX0,BL]],-0.004,0.004,walkM);                             // the tiles
  B.box(KW,0.52,BL,kc,WX0-KW/2,-0.01,BL/2); B.box(KW,0.52,BL-KB,kc,WX1+KW/2,-0.01,(KB+BL)/2);       // the kerbs: up 25 cm, down to the slab's underside
  (function(){const ax=DXR+dn[0]*KW/2, az=0.02+dn[1]*KW/2, bx=WX1+dn[0]*KW/2, bz=KB+dn[1]*KW/2, l=Math.hypot(bx-ax,bz-az);
    B.box(KW,0.52,l+0.12,kc,(ax+bx)/2,-0.01,(az+bz)/2,Math.atan2(bx-ax,bz-az)); B.box(KW+0.04,0.52,0.22,kc,WX1+KW/2,-0.01,KB+0.02);      // and where it turns in
    zig(ax,az+0.04,bx,bz,0.25,1.05);})();
  zig(WX0-KW/2,0.08,WX0-KW/2,BL-0.06,0.25,1.05); zig(WX1+KW/2,KB+0.06,WX1+KW/2,BL-0.06,0.25,1.05);      // the railings stand on the kerbs
  B.box(WX1-WX0+2*KW,0.15,0.38,0xb8b0a0,(WX0+WX1)/2,LA+0.075,BL+0.19); B.box(WX1-WX0+2*KW,0.03,0.05,0xa79f8f,(WX0+WX1)/2,-0.015,BL+0.355);      // the step up onto it, a block of rough concrete
  zig(0.03,BL+0.04,WX0-KW-0.02,BL+0.04,LA,LA+0.95); zig(WX1+KW+0.02,BL+0.04,AW-0.03,BL+0.04,LA,LA+0.95);      // and railings along the forecourt's edge, either side of it
  B.box(0.3,-0.26-GY,0.3,0xb0a896,(WX0+WX1)/2,(GY-0.26)/2,BL*0.55);                                // a pier under the slab
  const elec=A.MT(tex(64,32,function(g){g.fillStyle='#f1f1ee'; g.fillRect(0,0,64,32); g.fillStyle='#e8762a'; g.beginPath(); g.arc(10,10,6,0,7); g.fill(); g.fillStyle='#333'; g.font='bold 7px sans-serif'; g.fillText('ELECTRA',18,13);}));
  [[4.3,GY,0.42,0],[5.6,GY,0.42,0],[9.3,GY,0.42,0],[10.6,GY,0.42,0],[11.7,GY,0.42,0],          // air conditioners crowding the sunken strip,
   [3.02,-0.95,0.4,0],[3.95,-0.9,0.4,0],[4.9,-1.0,0.4,0],[3.02,-1.62,0.4,0],                  // up on racks under our windows beside the bridge, their tops level with its kerb,
   [0.17,-1.2,2.3,R/2],[0.17,-1.2,3.4,R/2],[0.17,-1.85,2.85,R/2],[0.17,GY,1.2,R/2]].forEach(function(q){      // and stacked against number 12 on the other side of it
    const u=B.at(q[0],q[1],q[2],q[3]);
    u.box(0.82,0.58,0.3,0xeeeeea,0,0.34,0); u.cyl(0.2,0.012,0x3b3f42,0.12,0.36,0.155,18,null,0,R/2); u.box(0.82,0.05,0.34,0xd9d9d4,0,0.05,0); u.box(0.82,0.04,0.04,0x8a8d8f,0,0.02,0.2);
    u.geo(new THREE.PlaneGeometry(0.2,0.1),elec,-0.28,0.52,0.152);
    if(q[1]>GY+0.1) [-0.36,0.36].forEach(function(x){u.box(0.04,q[1]-GY,0.04,0x6b6f72,x,(GY-q[1])/2,0.08);});      // the rack's legs
  });
  B.box(0.04,1.25,0.04,0x6b4a33,0.04,GY+0.62,0.9); B.box(0.85,0.04,0.04,0x6b4a33,0.35,GY+0.6,1.55);
  function fence(x0,z0,x1,z1,y,h,c,hoops){            // iron fence between two points: rails, bars, a post at each end, hoops on top for the municipal kind
    const len=Math.hypot(x1-x0,z1-z0), a=Math.atan2(x1-x0,z1-z0), f=B.at(x0,y,z0,a);
    f.box(0.03,0.03,len,c,0,h,len/2); f.box(0.03,0.03,len,c,0,0.1,len/2);
    for(let d=0.07;d<len;d+=0.14) f.box(0.014,h-0.1,0.014,c,0,(h+0.1)/2,d);
    f.box(0.05,h+0.06,0.05,c,0,(h+0.06)/2,0); f.box(0.05,h+0.06,0.05,c,0,(h+0.06)/2,len);
    if(hoops) for(let d=0.4;d<len-0.3;d+=0.8) B.geo(new THREE.TorusGeometry(0.2,0.012,4,10,R),c,x0+Math.sin(a)*d,y+h,z0+Math.cos(a)*d,a+R/2);
  }
  fence(AW,WELL+0.04,P2[0],WELL+0.04,U+0.22,0.8,wrail); fence(P2[1],WELL+0.04,FW-0.1,WELL+0.04,U+0.22,0.8,wrail);      // along the edge of the sunken strip
  [[AW,AW],[P2[0],P2[0]],[P2[1],P2[1]]].forEach(function(q){fence(q[0]+0.06,WELL+0.12,q[0]+0.06,GZ-0.1,U+0.22,0.62,green);});                                                     // low green fences on the garden's kerbs
  fence(P2[1]-0.06,WELL+0.12,P2[1]-0.06,GZ-0.1,U+0.22,0.62,green); fence(AW+0.1,GZ-0.08,P2[0]-0.1,GZ-0.08,U+0.22,0.62,green); fence(P2[1]+0.1,GZ-0.08,FW-0.1,GZ-0.08,U+0.22,0.62,green);
  fence(FW-0.1,WELL+0.12,FW-0.1,GZ-0.1,U+0.22,0.8,iron); fence(FW,GZ+0.08,SQ-0.1,GZ+0.08,U,0.95,iron); fence(SQ-0.1,GZ+0.08,SQ-0.1,11.4+D8,U,0.95,iron);      // where the garden and the square stand over the yard

  /* ---------- number 12's side of the alley, from the photos: green grilles on the ground floor, air conditioners, and an outside
     stair of white stone climbing along the wall toward our front to a concrete landing that reaches out over the steps ---------- */
  const SB=AL+3.9, SN=11, SR=0.18, ST=0.28, LT=SB-SN*ST, LY=U+SN*SR, LD=FZ-0.1;      // the stair's foot in the alley; its steps; the landing: its near edge, its height, and its far edge out over the steps down
  for(let k=0;k<SN;k++){const y=U+SR*(k+1); B.box(0.96,y-U,ST,0xe9e6de,0.52,U+(y-U)/2,SB-ST*(k+0.5)); B.box(0.98,0.025,0.05,0xd4d0c6,0.53,y-0.012,SB-ST*(k+1)+0.025);}
  B.box(0.96,0.18,LT-LD,0xd7d2c6,0.52,LY-0.09,(LD+LT)/2);                                                         // the landing slab
  (function(){const sl=Math.hypot(SN*ST,SN*SR), a=Math.atan2(SN*SR,SN*ST), r=B.at(1.0,U,SB,0);
    B.box(0.03,0.03,sl,0x1d1f21,1.0,U+0.92+SN*SR/2,SB-SN*ST/2,0,a);                                                  // black handrail up the open side
    for(let k=0;k<SN;k+=2) B.box(0.016,0.9,0.016,0x1d1f21,1.0,U+SR*(k+1)+0.45,SB-ST*(k+0.5));
    const rust=0x6b4a33; B.box(0.03,0.03,LT-LD,rust,0.99,LY+0.95,(LD+LT)/2); B.box(0.98,0.03,0.03,rust,0.5,LY+0.95,LD);      // rusty railing round the landing
    for(let z=LD+0.05;z<LT;z+=0.13) B.box(0.014,0.92,0.014,rust,0.99,LY+0.48,z); for(let x=0.08;x<1.0;x+=0.13) B.box(0.014,0.92,0.014,rust,x,LY+0.48,LD);
    [[0.25,LD+0.35],[0.25,LD+0.7]].forEach(function(q){B.cyl(0.11,0.2,0xf4f2ec,q[0],LY+0.1,q[1],10,0.13); B.sph(0.13,0xb84a5a,q[0],LY+0.28,q[1],1,0.7,1);});})();      // geraniums
  const grille=tex(128,192,function(g){g.fillStyle='#3e6f62'; g.fillRect(0,0,128,192); g.fillStyle='#294c42'; g.fillRect(0,0,128,192);
    g.strokeStyle='#4f8a79'; g.lineWidth=5; g.strokeRect(4,4,120,184); for(let x=16;x<124;x+=14){g.beginPath(); g.moveTo(x,6); g.lineTo(x,186); g.stroke();}
    g.lineWidth=3; [[40,60],[88,60],[40,130],[88,130]].forEach(function(q){g.beginPath(); g.moveTo(q[0],q[1]+12); g.bezierCurveTo(q[0]-16,q[1]-2,q[0]-6,q[1]-16,q[0],q[1]-4); g.bezierCurveTo(q[0]+6,q[1]-16,q[0]+16,q[1]-2,q[0],q[1]+12); g.stroke();});
    g.fillStyle='#4f8a79'; g.fillRect(4,92,120,6);});
  const shutterT=tex(64,128,function(g){g.fillStyle='#f1efe9'; g.fillRect(0,0,64,128); g.fillStyle='#cfccc4'; for(let y=0;y<128;y+=5) g.fillRect(0,y,64,1.5);
    g.strokeStyle='#f8f8f6'; g.lineWidth=2; for(let x=4;x<64;x+=8){g.beginPath(); g.moveTo(x,0); g.lineTo(x,128); g.stroke();}});
  [[SB+0.5,SB+1.85],[SB+2.4,SB+3.75]].forEach(function(q){panel(q[1]-q[0],2.3,A.MT(grille),0.035,U+1.15,(q[0]+q[1])/2,R/2);});            // green grilles with hearts on the ground floor
  function barred(z0,z1,y0,y1){panel(z1-z0,y1-y0,A.MT(shutterT),0.035,(y0+y1)/2,(z0+z1)/2,R/2);           // a window shut behind a white roller shutter, white bars in front, rusting
    for(let z=z0+0.06;z<z1;z+=0.115) B.box(0.022,y1-y0+0.1,0.022,0xeeede6,0.11,(y0+y1)/2,z); [y0+0.05,(y0+y1)/2,y1-0.02].forEach(function(y){B.box(0.03,0.03,z1-z0+0.1,0xeeede6,0.11,y,(z0+z1)/2); B.box(0.03,0.012,z1-z0,0x9a6a3e,0.105,y-0.02,(z0+z1)/2);});
    [z0-0.03,z1+0.03].forEach(function(z){B.box(0.12,0.04,0.04,0xeeede6,0.06,y1-0.02,z); B.box(0.12,0.04,0.04,0xeeede6,0.06,y0+0.05,z);});}
  barred(5.75,7.15,LA+0.45,LA+2.0); barred(7.6,9.0,LA+0.45,LA+2.0); barred(0.75,4.6,0.05,2.55);      // along the forecourt, and the tall one beside our bridge
  panel(0.9,2.0,A.MT(tex(32,64,function(g){g.fillStyle='#8f9496'; g.fillRect(0,0,32,64); g.strokeStyle='#6f7476'; g.strokeRect(3,3,26,58);})),0.035,LY+1.0,(LD+LT)/2,R/2);   // the door off the landing
  [[0.18,U+2.55,15.6,1],[0.18,U+2.95,SB+0.2,1],[0.16,U+2.4,17.4,1],[0.18,LA+0.32,6.1,0],[0.18,LA+0.32,7.35,0],[0.18,LA+0.9,6.7,0],[0.2,U+4.6,12.6,1],[0.2,U+4.3,9.0,1],[0.2,U+7.4,11.0,1],[0.2,U+3.6,4.9,1],[0.2,U+3.2,1.6,1]].forEach(function(q){const u=B.at(q[0],q[1],q[2],R/2);      // air conditioners on the wall up every floor, and three on the forecourt
    u.box(0.8,0.56,0.28,0xeeeeea,0,0,0); u.cyl(0.19,0.012,0x3b3f42,0.13,0.0,0.145,18,null,0,R/2); if(q[3]) u.box(0.06,0.04,0.3,0x6b4a33,-0.36,-0.3,-0.05);});
  B.box(0.02,1.4,0.02,0x8f9294,0.05,U+2.0,9.4);
  /* ---------- planting ---------- */
  function bed(x0,x1,z0,z1,h,y){B.box(x1-x0,h,z1-z0,0xb9ab90,(x0+x1)/2,y+h/2,(z0+z1)/2); B.box(x1-x0-0.36,0.02,z1-z0-0.36,0x4d4334,(x0+x1)/2,y+h+0.002,(z0+z1)/2);}      // planted bed, a low border of washed concrete
  function shrub(x,z,r,c,y){B.sph(r,c,x,y+r*0.6,z,1,0.78,1);}
  function palm(x,z,h,s,y0,n){                         // a trunk, then fronds that rise and droop
    n=n||13; B.cyl(0.085*s,h,0x9a8a6a,x,y0+h/2,z,7,0.065*s);
    for(let k=0;k<n;k++){
      const a=k*2*R/n+h*3, up=0.25+(k%4)*0.2, l=0.95*s, g1=new THREE.BoxGeometry(0.11*s,0.012,l), g2=new THREE.BoxGeometry(0.08*s,0.012,l);
      g1.translate(0,0,l/2); g2.translate(0,0,l/2);
      B.geo(g1,leaf[k%2],x,y0+h,z,a,-up);
      B.geo(g2,leaf[(k+1)%2],x+Math.sin(a)*Math.cos(up)*l,y0+h+Math.sin(up)*l,z+Math.cos(a)*Math.cos(up)*l,a,0.5);
    }
  }
  function ficus(x,z,s,a0,y0,pit){                     // the old trees that roof the square: a thick trunk, heavy limbs, one wide crown
    const bark=0x7d6e5c;
    B.cyl(0.42*s,3.0,bark,x,y0+1.5,z,10,0.3*s); if(pit) B.box(1.5,0.1,1.5,0x4d4334,x,y0+0.052,z);
    for(let k=0;k<4;k++){
      const a=a0+k*R/2+(k%2?0.35:0), t=0.75, len=3.6*s;
      B.cyl(0.17*s,len,bark,x+Math.sin(a)*Math.sin(t)*len/2,y0+2.7+Math.cos(t)*len/2,z+Math.cos(a)*Math.sin(t)*len/2,7,0.1*s,a,t);
      C.sph(2.9*s,leaf[k%3],x+Math.sin(a)*2.8*s,y0+6.4+(k%2?0.5:0),z+Math.cos(a)*2.8*s,1,0.62,1);
    }
    C.sph(3.3*s,leaf[1],x,y0+7.7,z,1,0.6,1);
  }
  function yucca(x,z,h,s,y0){                         // a spiky yucca: a few trunks, each with a burst of stiff, striped leaves
    for(let t=0;t<3;t++){const dx=(t-1)*0.2*s, dz=(t%2)*0.16*s, hh=h*(0.7+0.17*t); B.cyl(0.055*s,hh,0x8a7a5c,x+dx,y0+hh/2,z+dz,6,0.045*s,0,(t-1)*0.1);
      for(let k=0;k<18;k++){const a=k*2.4+t, up=0.15+(k%6)*0.2, l=0.7*s, g1=new THREE.BoxGeometry(0.055*s,0.01,l); g1.translate(0,0,l/2); B.geo(g1,k%3?0x6f8f4a:0xc2c886,x+dx+(t-1)*0.1,y0+hh,z+dz,a,-up);}}
  }
  function tree(x,z,s,a0){                             // a broad old tree: trunk, limbs, and a low crown spreading over the alley
    const bark=0x7d6e5c; B.cyl(0.24*s,2.6,bark,x,U+1.3,z,9,0.18*s);
    for(let k=0;k<3;k++){const a=a0+k*2.1, t=0.8, len=2.2*s; B.cyl(0.1*s,len,bark,x+Math.sin(a)*Math.sin(t)*len/2,U+2.3+Math.cos(t)*len/2,z+Math.cos(a)*Math.sin(t)*len/2,7,0.06*s,a,t);
      C.sph(1.7*s,leaf[k%3],x+Math.sin(a)*1.8*s,U+3.7+(k%2)*0.5,z+Math.cos(a)*1.8*s,1,0.7,1);}
    C.sph(2.0*s,leaf[1],x,U+4.5,z,1,0.65,1);
  }
  const rg=A.rng(23), inPath=function(x){return x>P2[0]-0.45&&x<P2[1]+0.45;};
  const GS=function(z){return WELL+(z-WELL)*(GZ-WELL)/(10.4-WELL);};      // the garden reaches farther out than first drawn: spread what grows in it to match
  tree(5.3,GS(5.4),1.1,4.2); tree(5.2,GS(9.0),0.9,3.6); tree(10.6,GS(5.9),1.0,1.6); tree(12.0,GS(2.6),0.8,0.4); tree(4.8,GS(3.4),1.0,2.6); tree(8.4,GS(8.0),1.0,5.0);      // the old trees that roof the alley and the garden
  for(let z=BL+0.4;z<GZ-0.6;z+=0.9) C.sph(0.6,leaf[Math.floor(z)%3],AW-0.2,U+2.75+Math.sin(z*3)*0.2,z,1,1.3,1);                 // branches hanging low over the alley
  [[4.0,2.4,2.4,1.0],[4.2,8.7,3.0,1.15],[6.3,2.3,1.9,0.9],[9.6,2.6,2.6,1.0],[11.5,8.6,3.2,1.15],[6.2,9.4,2.2,0.95],[9.4,9.4,1.8,0.9],[4.1,6.0,2.6,1.0],[4.4,4.1,1.6,0.85]].forEach(function(q){yucca(q[0],GS(q[1]),q[2],q[3],U);});
  palm(5.0,GS(3.4),0.7,0.9,U); palm(11.9,GS(4.6),1.2,0.8,U);
  for(let i=0;i<60;i++){const z=WELL+0.4+rg()*(GZ-WELL-0.8), y=U+0.5+rg()*1.9, r=0.45+rg()*0.45; B.sph(r,i%4===3?0x2a5a3a:leaf[i%3],AW+0.55+rg()*1.3,y,z,1,0.85+rg()*0.4,1);}      // a wall of green along the fence
  for(let i=0;i<84;i++){const x=AW+0.35+rg()*(FW-AW-0.7), z=WELL+0.35+rg()*(GZ-WELL-0.7); if(inPath(x)) continue; shrub(x,z,0.35+rg()*0.45,i%4===3?0x2a5a3a:leaf[i%3],U);}      // and everything else is green
  for(let i=0;i<22;i++){const x=AW+0.3+rg()*0.6, z=BL+rg()*(GZ-BL-0.4); B.sph(0.42,0x335f3f,x,U+0.65+rg()*0.6,z,1.35,0.45,1.15);}           // big leaves leaning over the fence into the alley
  ficus(17.4,14.15+D8,0.95,2.0,U);

  /* ---------- parked in the alley, as in the photos ---------- */
  function wheel(x,y,z,o,r){B.geo(new THREE.TorusGeometry(r-0.04,0.05,8,22),0x161718,x,y+r,z,o+R/2); B.cyl(r*0.5,0.06,0x8d9296,x,y+r,z,12,null,o+R/2,R/2);}
  function moto(x,y,z,o,c,kind){                       // nose along +z. kind: dirt, scooter, sport or covered
    const m=B.at(x,y,z,o), w=function(dz,r){wheel(x+Math.sin(o)*dz,y,z+Math.cos(o)*dz,o,r);}, dk=0x1d1f21, cr=0x9aa0a4;
    if(kind==='covered'){w(-0.7,0.28); w(0.7,0.28); m.sph(0.5,0x2a2c2e,0,0.78,0,0.62,1.0,2.0); m.sph(0.3,0x2a2c2e,0,1.18,0.55,0.8,1.2,0.7); return;}
    if(kind==='dirt'){w(-0.7,0.34); w(0.72,0.34);
      m.box(0.22,0.28,0.38,0x3a3c3f,0,0.48,-0.02); m.box(0.05,0.05,0.95,dk,0,0.8,-0.02,0,-0.25); m.sph(0.16,c,0,0.98,0.18,0.9,0.7,1.5); m.box(0.2,0.08,0.75,dk,0,1.0,-0.35);
      [-0.09,0.09].forEach(function(s){m.box(0.03,0.75,0.03,cr,s,0.72,0.6,0,-0.38);}); m.box(0.72,0.025,0.025,dk,0,1.16,0.48); m.box(0.18,0.03,0.4,0xd8d8d2,0,0.78,0.7,0,0.2);
      m.box(0.2,0.03,0.5,0xd8d8d2,0,0.95,-0.78,0,-0.35); m.cyl(0.04,0.55,cr,0.14,0.68,-0.42,8,null,0,R/2); m.box(0.16,0.12,0.004,0xe8c21e,0,0.82,-1.04); return;}
    if(kind==='scooter'){w(-0.72,0.27); w(0.75,0.27);
      m.box(0.38,0.14,0.62,dk,0,0.36,0.08); m.sph(0.34,c,0,0.66,-0.42,0.85,0.85,1.65); m.box(0.32,0.09,0.78,dk,0,1.0,-0.36); m.sph(0.3,c,0,0.82,0.58,1.05,1.65,0.6);
      m.box(0.4,0.34,0.02,0x55606a,0,1.32,0.66,0,-0.45); m.box(0.7,0.03,0.03,dk,0,1.12,0.52); m.box(0.08,0.06,0.28,dk,0.14,0.98,-0.86); return;}
    w(-0.68,0.31); w(0.7,0.31);                          // sport
    m.sph(0.3,c,0,0.78,0.36,0.85,1.0,1.55); m.sph(0.22,c,0,0.98,0.0,0.95,0.75,1.3); m.sph(0.17,c,0,0.98,-0.58,0.75,0.65,1.9); m.box(0.22,0.07,0.5,dk,0,1.08,-0.3);
    m.box(0.24,0.26,0.4,0x2a2c2e,0,0.5,0.0); m.box(0.3,0.2,0.02,0x2a3440,0,1.2,0.66,0,-0.6); m.box(0.6,0.025,0.025,dk,0,1.05,0.5); m.cyl(0.05,0.5,cr,0.15,0.62,-0.5,8,null,0,R/2-0.2);
  }
  moto(1.35,U,SB+0.6,0,0x2b2d30,'dirt');                                                                   // a dirt bike at the stair's foot, its yellow plate
  moto(3.0,U,15.0,0.06,0,'covered'); moto(2.98,U,17.0,-0.04,0x2a2c2e,'scooter');                        // a covered bike and a maxi scooter against the garden fence
  moto(2.95,LA,BL+1.5,-0.08,0x2346b8,'sport');                                                            // a blue sports bike down by the bridge
  [[0.75,LA,8.3],[1.05,LA,8.55]].forEach(function(q){B.sph(0.28,0x151617,q[0],q[1]+0.2,q[2],1.2,0.75,1);});      // black rubbish bags against number 12's wall
  (function(){function bike(x,y,z,o,c){const b=B.at(x,y,z,o); [-0.5,0.5].forEach(function(dz){B.geo(new THREE.TorusGeometry(0.33,0.02,6,24),0x1b1c1e,x+Math.sin(o)*dz,y+0.36,z+Math.cos(o)*dz,o+R/2);});
      b.box(0.03,0.03,0.95,c,0,0.62,0.0,0,0.15); b.box(0.03,0.5,0.03,c,0,0.55,-0.25,0,0.3); b.box(0.03,0.45,0.03,c,0,0.6,0.42,0,-0.25); b.box(0.5,0.03,0.03,0x2a2c2e,0,0.95,0.5); b.box(0.1,0.04,0.22,0x2a2c2e,0,0.88,-0.3);}
    bike(3.22,U,AL+0.7,0.05,0x9fd3c0); bike(0.22,U,SB+1.2,0,0x2b2d30);})();                                       // a mint town bike on the fence by the steps, a black one on number 12's wall

  B.oz=C.oz=D8;      // from here to the cars, all of it stands D8 farther out than first drawn
  /* ---------- the café of number 12, from the photo walking out: marble-topped bistro tables on black cast-iron feet, folding
     chairs with wooden slats, big beige parasols with a heater glowing orange on each pole, an evaporative cooler, plants in
     pots against the glass front; on the right the spare furniture stacked up, white plastic chairs and high chairs ---------- */
  const marble=A.MT(tex(64,64,function(g){const r=A.rng(81); g.fillStyle='#e6e3dc'; g.fillRect(0,0,64,64); g.strokeStyle='rgba(150,145,135,0.5)'; g.lineWidth=1;
    for(let i=0;i<9;i++){g.beginPath(); let x=r()*64, y=r()*64; g.moveTo(x,y); for(let k=0;k<5;k++){x+=(r()-0.3)*20; y+=(r()-0.5)*14; g.lineTo(x,y);} g.stroke();}
    g.fillStyle='#2f7d57'; g.beginPath(); g.arc(32,32,5,0,7); g.fill();},true),null,true);
  const castIron=0x1b1c1d, slat=0xa66a35;
  function fchair(x,z,o){const c=B.at(x,U,z,o);                                  // folding chair, facing its local +z: black frame, wooden slats
    [-0.2,0.2].forEach(function(dx){c.box(0.025,0.95,0.025,castIron,dx,0.47,-0.16,0,-0.12); c.box(0.025,0.5,0.025,castIron,dx,0.24,0.18,0,0.32);});
    for(let i=0;i<5;i++) c.box(0.42,0.018,0.06,slat,0,0.46,-0.13+i*0.07);
    for(let i=0;i<3;i++) c.box(0.42,0.05,0.016,slat,0,0.68+i*0.09,-0.23-i*0.012,0,-0.12);}
  function bistro(x,z,n,a0){                                                       // round marble top on a black cast-iron base with three curved feet
    B.cyl(0.33,0.025,marble,x,U+0.735,z,24); B.cyl(0.335,0.02,0xb9bcbe,x,U+0.715,z,24);
    B.cyl(0.03,0.68,castIron,x,U+0.37,z,8);
    for(let k=0;k<3;k++){const a=k*2.094+(a0||0); B.box(0.035,0.035,0.32,castIron,x+Math.sin(a)*0.15,U+0.1,z+Math.cos(a)*0.15,a,-0.35); B.sph(0.03,castIron,x+Math.sin(a)*0.3,U+0.03,z+Math.cos(a)*0.3);}
    for(let i=0;i<n;i++){const a=(a0||0)+0.5+i*2*R/n; fchair(x+Math.sin(a)*0.6,z+Math.cos(a)*0.6,a+R);}
  }
  const heater=A.reg(new THREE.MeshLambertMaterial({color:0xff9440,emissive:0xd8601a}),'street');
  function parasol(x,z,s){                                                         // a big square parasol on ribs, a valance round it
    B.box(0.55,0.22,0.55,0x9a958c,x,U+0.11,z); B.cyl(0.05,2.8,0xb4a58c,x,U+1.4,z,10); B.cyl(0.045,0.6,heater,x,U+2.05,z,12);
    for(let k=0;k<4;k++){const a=R/4+k*R/2; B.box(0.025,0.025,s*0.72,0x9c8f78,x+Math.sin(a)*s*0.33,U+2.62,z+Math.cos(a)*s*0.33,a,0.32);}
    const g=new THREE.ConeGeometry(s*0.7071,0.55,4,1,true).toNonIndexed(); g.computeVertexNormals(); B.geo(g,0xe3d8c0,x,U+2.9,z,R/4);
    const gu=new THREE.ConeGeometry(s*0.7071,0.55,4,1,true).toNonIndexed(); const ix=gu.attributes.position; for(let i=0;i<ix.count;i+=3){const t=[ix.getX(i),ix.getY(i),ix.getZ(i)]; ix.setXYZ(i,ix.getX(i+2),ix.getY(i+2),ix.getZ(i+2)); ix.setXYZ(i+2,t[0],t[1],t[2]);}
    gu.computeVertexNormals(); B.geo(gu,0xc9b48c,x,U+2.89,z,R/4);                  // its underside, warmer where the heater lights it
    [[0,1],[1,0],[0,-1],[-1,0]].forEach(function(q){B.box(q[0]?0.02:s,0.22,q[0]?s:0.02,0xe0d5bc,x+q[0]*s/2,U+2.53,z+q[1]*s/2);});
  }
  const CAFE=[[1.15,11.5,2,0.4],[1.15,13.0,2,0.2],[1.2,14.5,2,0.9],[1.2,16.0,2,0.3],[4.4,13.6,3,0.6],[5.9,14.2,2,1.0],[4.6,15.4,2,0.1],[6.2,15.8,2,0.5]], UMB=[[1.6,12.2,3.0],[1.6,15.0,3.0],[5.2,14.6,3.2]];      // tables down the café's side, the lane to our alley kept clear
  UMB.forEach(function(q){parasol(q[0],q[1],q[2]);}); CAFE.forEach(function(q){bistro(q[0],q[1],q[2],q[3]);});
  B.box(0.12,0.1,0.12,0x8a6a48,1.15,U+0.8,11.5); [0.03,-0.02].forEach(function(o,i){B.box(0.012,0.1,0.03,i?0xf2d33a:0xf6f4ee,1.15+o,U+0.86,11.5);});      // a napkin box with sugar sachets
  (function(){const c=B.at(0.45,U,10.85,R/2), w=0xe9ebeb;                          // the evaporative cooler on its castors, by the café's front, blowing at the tables
    c.box(0.78,0.36,0.52,w,0,0.26,0); c.box(0.74,0.85,0.48,w,0,0.86,0); c.box(0.78,0.1,0.52,0xdfe2e3,0,1.33,0);
    c.box(0.6,0.62,0.02,0xbfc4c6,0,0.9,0.245); c.cyl(0.26,0.02,0x9aa0a2,0,0.9,0.25,24,null,0,R/2); for(let i=0;i<7;i++) c.box(0.56,0.012,0.03,0x8e9598,0,0.66+i*0.08,0.262);
    c.box(0.02,0.6,0.36,0xbfc4c6,0.375,0.9,0); c.box(0.16,0.02,0.1,0x2c3a55,-0.2,1.385,0.1);
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){c.cyl(0.04,0.05,iron,q[0]*0.33,0.04,q[1]*0.2,6,null,0,R/2);});
  })();
  for(let i=0;i<5;i++){const z=11.6+i*0.95; B.cyl(0.15,0.38,0x6f6a62,0.18,U+0.19,z,12,0.18); [[0,0.85],[0.06,0.6],[-0.04,0.7]].forEach(function(q,k){B.sph(0.2,leaf[(i+k)%3],0.18+q[0],U+q[1],z+(k-1)*0.1,0.7,1.6,0.7);});}   // tall plants in pots along the glass front
  (function(){const x=4.05, z=10.75;                                              // the spare furniture, stacked on the right
    for(let i=0;i<6;i++){const c=B.at(x,U+i*0.07,z,0.15); c.box(0.44,0.03,0.42,0xf2f2ef,0,0.45,0); c.box(0.44,0.42,0.03,0xf2f2ef,0,0.68,-0.2,0,-0.15); [[-1],[1]].forEach(function(q){c.box(0.025,0.45,0.025,0xe6e6e2,q[0]*0.2,0.22,0.18,0,0.12);});}
    [[0.55,0.25],[0.7,-0.25]].forEach(function(q){const c=B.at(x+q[0],U,z+q[1],-0.3); c.box(0.36,0.08,0.34,0xf4f4f1,0,0.6,0); c.box(0.36,0.3,0.04,0xf4f4f1,0,0.78,-0.15);
      [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(p){c.box(0.022,0.62,0.022,0xb9bdbf,p[0]*0.2,0.3,p[1]*0.18,0,p[1]*0.12);});});      // white high chairs on splayed legs
    const t=B.at(x+0.6,U,z+0.75,0.1); t.box(0.7,0.04,0.7,0xb07a3e,0,0.76,0); t.cyl(0.035,0.72,castIron,0,0.38,0,8); t.box(0.5,0.04,0.04,castIron,0,0.04,0); t.box(0.04,0.04,0.5,castIron,0,0.04,0);
    B.box(0.55,0.75,0.45,0xeef0ef,x-0.25,U+0.375,z+0.75); B.box(0.5,0.05,0.42,0x2c2f31,x-0.25,U+0.78,z+0.75);       // a white cool box under a black cover
  })();
  [0.95,2.35].forEach(function(x){B.box(1.25,0.45,0.45,0xf1efe8,x,U+0.225,17.55); B.sph(0.42,leaf[0],x-0.3,U+0.72,17.55,1,0.8,0.6); B.sph(0.42,leaf[1],x+0.3,U+0.74,17.55,1,0.8,0.6);});      // hedge in white boxes along the pavement
  B.cyl(0.22,0.6,0xe6dfcd,0.6,U+0.3,16.75,12,0.34); B.sph(0.4,0x6d4a5c,0.6,U+0.85,16.75,1,0.8,1); B.sph(0.25,0x7a9a4a,0.75,U+1.0,16.65);      // big pot of coleus by the corner
  B.box(1.0,0.5,0.5,0xa39c92,10.25,U+0.25,14.9); shrub(10,14.9,0.26,leaf[1],U+0.45); B.sph(0.1,0xe8a04a,10.45,U+0.66,14.85); B.sph(0.1,0xf3f0e8,10.25,U+0.7,15);      // brick planter with flowers
  [[10.95,15.95],[11.45,15.05]].forEach(function(q){B.cyl(0.16,0.4,0xd9cdb4,q[0],U+0.2,q[1],10,0.22); palm(q[0],q[1],0.2,0.55,U+0.4,9);});

  /* ---------- street furniture ---------- */
  function sign(t,w,h,x,y,z,o,round,parent){            // a sign plate: a drawing on the face, grey behind
    const m=new THREE.Mesh(round?new THREE.CircleGeometry(w/2,24):new THREE.PlaneGeometry(w,h),A.MT(t));
    m.position.set(x+Math.sin(o)*0.012,y,z+Math.cos(o)*0.012+(parent?0:B.oz)); m.rotation.y=o; (parent||st).add(m);
    if(round) B.cyl(w/2,0.016,0x9aa0a2,x,y,z,24,null,o,R/2); else if(!parent) B.box(w,h,0.016,0x9aa0a2,x,y,z,o);
  }
  const plate=function(n){return tex(64,64,function(g){g.fillStyle='#1f7a4a'; g.fillRect(0,0,64,64); g.strokeStyle='#fff'; g.lineWidth=3; g.strokeRect(4,4,56,56); g.fillStyle='#fff'; g.font='bold 34px sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(n,32,34);});};
  const tCross=tex(128,128,function(g){
    g.fillStyle='#1f5fb4'; g.fillRect(0,0,128,128); g.fillStyle='#fff'; g.beginPath(); g.moveTo(64,14); g.lineTo(116,108); g.lineTo(12,108); g.fill();
    g.fillStyle='#111'; g.beginPath(); g.arc(66,46,7,0,7); g.fill(); g.strokeStyle='#111'; g.lineWidth=7; g.lineCap='round';
    g.beginPath(); g.moveTo(64,56); g.lineTo(60,78); g.lineTo(48,98); g.moveTo(60,78); g.lineTo(74,96); g.moveTo(63,60); g.lineTo(50,72); g.moveTo(63,60); g.lineTo(78,70); g.stroke();
    g.lineWidth=3; for(let i=0;i<4;i++){g.beginPath(); g.moveTo(32+i*18,104); g.lineTo(42+i*18,104); g.stroke();}});
  const tMoto=tex(128,128,function(g){
    g.fillStyle='#fff'; g.beginPath(); g.arc(64,64,63,0,7); g.fill(); g.strokeStyle='#d1322c'; g.lineWidth=13; g.beginPath(); g.arc(64,64,55,0,7); g.stroke();
    g.strokeStyle='#111'; g.fillStyle='#111'; g.lineWidth=5; g.beginPath(); g.arc(42,80,11,0,7); g.stroke(); g.beginPath(); g.arc(88,80,11,0,7); g.stroke();
    g.lineWidth=6; g.lineCap='round'; g.beginPath(); g.moveTo(42,80); g.lineTo(58,62); g.lineTo(78,62); g.lineTo(88,80); g.moveTo(58,62); g.lineTo(64,80); g.moveTo(78,62); g.lineTo(84,50); g.lineTo(92,50); g.stroke();
    g.beginPath(); g.arc(66,46,6,0,7); g.fill();});
  const tPark=tex(64,64,function(g){g.fillStyle='#1f5fb4'; g.fillRect(0,0,64,64); g.strokeStyle='#fff'; g.lineWidth=4; g.strokeRect(8,8,48,48); g.fillStyle='#fff'; g.font='bold 40px sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('P',32,35);});
  const tNote=tex(64,96,function(g){g.fillStyle='#e9b92c'; g.fillRect(0,0,64,96); g.fillStyle='#3a3320'; for(let y=12;y<88;y+=11) g.fillRect(8,y,48-(y%3)*7,4);});
  const stripe=tex(8,32,function(g){g.fillStyle='#f1f1ec'; g.fillRect(0,0,8,32); g.fillStyle='#2f55a8'; g.fillRect(0,0,8,16);},true); stripe.repeat.set(1,7);
  B.cyl(0.035,3.0,0x9aa0a2,4.6,U+1.5,18,8); sign(tCross,0.6,0.6,4.6,U+2.6,18.04,0.25);                         // zebra crossing sign
  B.cyl(0.04,2.9,A.MT(stripe,null,true),2.2,U+1.45,18.05,10);                                                 // the blue and white pole with the parking rules
  sign(tPark,0.45,0.45,2.2,U+2.62,18.1,0); sign(tNote,0.45,0.62,2.2,U+2.02,18.1,0);
  B.cyl(0.03,2.9,0x9aa0a2,10.4,U+1.45,13.75,8); sign(tMoto,0.6,0.6,10.4,U+2.6,13.79,0,true);                   // no motorcycles on the square
  [5.3,8.9,10.3].forEach(function(x){B.cyl(0.12,0.7,0xa9aaa6,x,U+0.35,18.15,10); B.sph(0.12,0xa9aaa6,x,U+0.7,18.15);});      // concrete bollards
  function bench(x,y,z,o){const b=B.at(x,y,z,o), wood=0x8a5a3c;                                                // park bench, facing its local +z
    for(let i=0;i<3;i++){b.box(1.7,0.035,0.11,wood,0,0.44,-0.13+i*0.13); b.box(1.7,0.11,0.03,wood,0,0.58+i*0.13,-0.24-i*0.03);}
    [-0.7,0.7].forEach(function(dx){b.box(0.05,0.44,0.42,iron,dx,0.22,-0.02); b.box(0.05,0.5,0.05,iron,dx,0.68,-0.27);});}
  bench(12,U,15.45,-R/2);
  B.cyl(0.24,0.8,0x1f4a36,11.1,U+0.4,17.65,12,0.27); B.cyl(0.29,0.12,0x183b2b,11.1,U+0.86,17.65,12,0.2); B.box(0.16,0.16,0.01,0xe8c91a,11.1,U+0.5,17.925);      // municipal bin
  function cabinet(x,z,o){const c=B.at(x,U,z,o); c.box(0.85,0.12,0.34,0x8f9492,0,0.06,0); c.box(0.85,1.3,0.32,0xb9bdbc,0,0.77,0); c.box(0.01,1.2,0.01,0x7d8280,0,0.77,0.162);}      // grey utility cabinet
  cabinet(12,17.9,0);
  const glow=A.lampMat('L:street',0xeeebe0,0xffe7bd,0.95), bulb=A.lampMat('L:street',0xf3eedc,0xffd28a,1);
  [[AW-0.25,10.6,U],[P2[1]+0.25,10.6,U],[12.2,10.5,U]].forEach(function(q){                                               // globe lamps on green poles
    B.cyl(0.045,3.0,green,q[0],q[2]+1.5,q[1],8); B.sph(0.2,glow,q[0],q[2]+3.15,q[1]); A.pool('L:street',0xffd9a0,q[0],q[2]+0.03,q[1]+B.oz,4.2,st,0.42);});
  UMB.forEach(function(q){A.pool('L:street',0xffb070,q[0],U+0.03,q[1]+B.oz,2.4,st,0.35);});      // each heater warms the ground under its parasol

  /* ---------- the fenced garden with the round memorial stone ---------- */
  bed(12.5,18.9,11.55,17.85,0.35,U);
  [[12.6,17.75,18.8,17.75],[18.8,17.75,18.8,11.65],[18.8,11.65,12.6,11.65],[12.6,11.65,12.6,17.75]].forEach(function(q){fence(q[0],q[1],q[2],q[3],U+0.35,0.7,green,true);});
  palm(13.6,15.15,2.6,1.25,U+0.35); palm(16.1,15.85,3.6,1.3,U+0.35); palm(14.8,12.95,3.0,1.2,U+0.35); palm(17.9,16.75,2.2,1.1,U+0.35);
  [[13.4,16.85,0.34,0x9fb04a],[16,17.05,0.3,leaf[1]],[17.1,15.75,0.4,0x9fb04a],[13.8,13.45,0.4,leaf[2]],[18,12.65,0.36,leaf[0]],[15.7,13.95,0.32,0x9fb04a]].forEach(function(q){shrub(q[0],q[1],q[2],q[3],U+0.35);});
  (function(){const x=14.7, y=U+0.35+0.56, z=16.8, lean=0.15;
    B.cyl(0.62,0.22,0xddd6c4,x,y,z,28,null,0,R/2-lean);
    const t=tex(256,256,function(g){
      g.fillStyle='#e9e3d2'; g.beginPath(); g.arc(128,128,128,0,7); g.fill(); const r=A.rng(3); for(let i=0;i<500;i++){g.fillStyle='rgba(120,110,90,'+(0.04+r()*0.08)+')'; g.fillRect(r()*256,r()*256,2,2);}
      g.strokeStyle='#8f8672'; g.lineWidth=2; [[92,72],[164,72]].forEach(function(q){g.beginPath(); g.arc(q[0],q[1],15,0,7); g.stroke(); g.fillStyle='#8f8672'; g.fillRect(q[0]-14,q[1]+22,28,3);});      // two emblems
      g.fillStyle='#7d7460'; g.textAlign='center'; g.font='bold 30px serif'; g.fillText('גינת שלום',128,142);
      g.fillStyle='rgba(125,116,96,0.7)'; [[150,170],[112,192],[84,212]].forEach(function(q){let u=128-q[0]/2; while(u<128+q[0]/2-6){const w=8+r()*16; g.fillRect(u,q[1],Math.min(w,128+q[0]/2-u),4); u+=w+5;}});      // the rest of the inscription, too small to read from here
    });
    const m=new THREE.Mesh(new THREE.CircleGeometry(0.6,28),A.MT(t)); m.position.set(x,y+Math.sin(lean)*0.113,z+Math.cos(lean)*0.113+B.oz); m.rotation.x=-lean; st.add(m);
  })();
  (function(){const b=B.at(18.6,U,17.85,0);                                           // old municipal notice board under a little green roof
    b.box(0.08,1.9,0.08,0x5f6466,-0.6,0.95,0); b.box(0.08,1.9,0.08,0x5f6466,0.6,0.95,0); b.box(1.3,1.1,0.06,0xd98a2b,0,1.3,0); b.box(1.5,0.06,0.34,0x2f7d4f,0,1.95,0);
    [[-0.35,1.5,0xf3ebdc],[0.1,1.35,0x9fc4d6],[0.4,1.6,0xf0d21c],[-0.2,1.0,0xfbfaf6]].forEach(function(q){b.box(0.26,0.34,0.01,q[2],q[0],q[1],0.036);});})();

  B.oz=C.oz=0;
  /* ---------- parked cars ---------- */
  function car(x,z,o,col){const c=B.at(x,RY,z,o);                                      // nose along its local +x
    c.box(4.1,0.55,1.7,col,0,0.52,0); c.box(2.2,0.48,1.5,0x2c3338,-0.15,1.02,0); c.box(2.3,0.05,1.52,col,-0.15,1.28,0);
    [[-1.3,-1],[1.3,-1],[-1.3,1],[1.3,1]].forEach(function(q){c.cyl(0.31,0.2,0x1d1f20,q[0],0.31,q[1]*0.78,12,null,0,R/2);});
    c.box(0.04,0.14,1.3,0xe6e6de,2.05,0.6,0); c.box(0.04,0.14,1.3,0xb43a34,-2.05,0.62,0);}
  car(-4.1,KZ+1.05,0,0xe9e9e6); car(14.9,KZ+1.05,R,0xb9bcbe); car(20,KZ+1.05,R,0xb5372f); car(13.5,KZ+RW-1.05,0,0x3a4a5a);

  /* ---------- the buildings round the square ---------- */
  const gf=tex(128,128,function(g){g.fillStyle='#d8d0bd'; g.fillRect(0,0,128,128); g.fillStyle='#3d4a50'; g.fillRect(10,30,60,74); g.fillStyle='#5a4634'; g.fillRect(86,34,28,94); g.fillStyle='#c9c1ad'; g.fillRect(0,0,128,12);},true);
  function house(x0,x1,z0,z1,faces,hide){              // a neighbouring block: a plain volume, windows on the sides that are seen, water heaters on the roof
    const g=G(st), b=batch(g), sx=x1-x0, sz=z1-z0;
    b.box(sx-0.02,TOP-U,sz-0.02,0xddd5c3,(x0+x1)/2,(U+TOP)/2,(z0+z1)/2); B.box(sx,U+0.03-GY,sz,0xcfc8b6,(x0+x1)/2,(GY+U+0.03)/2,(z0+z1)/2);      // the footing stays when the block itself is hidden
    faces.forEach(function(f){
      const len=f[1]==='z'?sx:sz, x=f==='+x'?x1+0.02:f==='-x'?x0-0.02:(x0+x1)/2, z=f==='+z'?z1+0.02:f==='-z'?z0-0.02:(z0+z1)/2, ry=f==='+x'?R/2:f==='-x'?-R/2:f==='-z'?R:0;
      const t=bt.clone(), t2=gf.clone(); t.needsUpdate=t2.needsUpdate=true; t.repeat.set(Math.round(len/3.4),3); t2.repeat.set(Math.round(len/4),1);
      panel(len,TOP-U-3.2,A.MT(t),x,(TOP+U+3.2)/2,z,ry,g); panel(len,3.2,A.MT(t2),x,U+1.6,z,ry,g);});
    for(let i=0;i<Math.floor(sx/6);i++){const x=x0+3+i*6; b.cyl(0.3,1.2,0xf6f6f2,x,TOP+0.9,(z0+z1)/2,12,null,0,R/2); b.box(1.0,0.06,1.6,0x2b3d55,x,TOP+0.5,(z0+z1)/2+1.4,0,0.5);}
    far.push({g:g,hide:hide}); return {g:g,b:b};
  }
  const n12=house(-12,0,0,16.05+D8,['+x','+z'],function(c){return c.x<1.5||c.z<0.4;});      // number 12 and the wing behind it close the left side of the square; seen only from the street side
  (function(){const b=n12.b, g=n12.g;
    const aw=tex(16,8,function(c){c.fillStyle='#f4f2ea'; c.fillRect(0,0,16,8); c.fillStyle='#2c5a43'; c.fillRect(0,0,8,8);},true); aw.repeat.set(14,1);
    b.geo(new THREE.BoxGeometry(6.8,0.03,2.0),A.MT(aw,null,true),-4.1,U+2.85,17+D8,0,0.35); b.box(6.8,0.2,0.02,0xf4f2ea,-4.1,U+2.42,17.95+D8);      // striped awning over the café front
    b.box(0.55,3.2,0.55,0xd8ccb2,-0.3,U+1.6,16.33+D8);                                        // brick-clad corner column with the house number
    sign(plate('12'),0.3,0.3,-0.3,U+2.5,16.61+D8,0,false,g); sign(plate('12'),0.3,0.3,-0.02,U+2.5,16.33+D8,R/2,false,g);
    const fl=tex(128,96,function(c){c.fillStyle='#fff'; c.fillRect(0,0,128,96); c.fillStyle='#2a4fb0'; c.fillRect(0,10,128,12); c.fillRect(0,74,128,12);
      c.strokeStyle='#2a4fb0'; c.lineWidth=4; [1,-1].forEach(function(s){c.beginPath(); c.moveTo(64,48-s*20); c.lineTo(64+17,48+s*10); c.lineTo(64-17,48+s*10); c.closePath(); c.stroke();});});
    const fm=A.MT(fl); fm.side=THREE.DoubleSide;
    [[-0.3,16.6+D8],[-1.9,16.05+D8]].forEach(function(q){                                        // two flags on poles off the front
      b.cyl(0.015,1.9,0xd9d9d2,q[0],U+3.3+0.59,q[1]+0.74,6,null,0,0.9);
      const m=panel(1.0,0.72,fm,q[0],U+3.72,q[1]+1.0,R/2,g); m.rotation.set(-0.55,R/2,0);});
    [[16.05,4.3],[20.15,4.3],[17.95,7.6],[21.85,10.8],[0.95,3.3],[6.3,5.4],[10.4,7.9]].forEach(function(q){b.box(0.3,0.58,0.82,0xe6e8e6,0.16,U+q[1],q[0]); b.cyl(0.2,0.02,0x3b3f42,0.32,U+q[1],q[0]-0.1,16,null,R/2,R/2);});      // air conditioners on the flank, one high up by our doorway
    const gl=tex(128,64,function(c){c.fillStyle='#2f3a3c'; c.fillRect(0,0,128,64); c.fillStyle='rgba(200,215,210,0.25)'; c.fillRect(0,0,128,30); c.strokeStyle='#c9b98f'; c.lineWidth=3;
      for(let x=0;x<=128;x+=32){c.beginPath(); c.moveTo(x,0); c.lineTo(x,64); c.stroke();} c.strokeRect(1,1,126,62); c.fillStyle='#e8d9a8'; c.fillRect(70,20,16,10);});
    panel(5.2,2.7,A.MT(gl),0.03,U+1.35,13.1+D8,R/2,g); b.box(0.06,0.25,5.4,0xd8ccb2,0.03,U+2.82,13.1+D8);      // the café's glass front, in brass-coloured frames
  })();
  house(-17.5,-1.7,29.05+D8,39.55+D8,['-z','+x'],function(c){return c.z>27.5+D8;}).b.done(); house(3.9,28.5,29.05+D8,39.55+D8,['-z','-x'],function(c){return c.z>27.5+D8;}).b.done();      // across the street
  house(SQ+0.5,38,8.9+D8,16+D8,['-x','+z','-z'],function(c){return c.x>SQ&&c.x<38.5&&c.z>8.4+D8&&c.z<16.5+D8;}).b.done();     // and number 8 closes the right, its back across the yard from our windows
  n12.b.done();

  /* ---------- our own street front ----------
     Drawn only for someone standing outside at street level: from higher up you look straight into the lobby, as on every other side. */
  const gt=tex(2048,256,function(g){
    const X=function(x){return x/FW*2048;}, Y=function(y){return 256-y/H*256;};
    const rc=function(x0,x1,y0,y1,c){g.fillStyle=c; g.fillRect(X(x0),Y(y1),X(x1)-X(x0),Y(y0)-Y(y1));};
    rc(0,FW,0,H,'#ebe6d8'); rc(0,FW,0,0.45,'#d9d2c0'); rc(0,FW,H-0.22,H,'#d6cfbd');                          // plaster, a plinth, the edge of the floor above
    const win=function(x,w){rc(x-0.07,x+w+0.07,0.93,2.32,'#cfc8b6'); rc(x,x+w,1.0,2.25,'#f6f5f0'); for(let y=1.04;y<2.24;y+=0.075) rc(x,x+w,y,y+0.014,'#c6c9c4'); rc(x+w/2-0.02,x+w/2+0.02,1.0,2.25,'#e6e6e0');};      // window behind closed white shutters
    const screen=function(x,w){rc(x,x+w,0.75,2.5,'#7f8b8d'); for(let u=x;u<x+w+0.01;u+=0.14) rc(u-0.012,u+0.012,0.75,2.5,'#e3dfd2'); for(let y=0.75;y<2.51;y+=0.14) rc(x,x+w,y-0.012,y+0.012,'#e3dfd2');};      // lattice that hides the washing
    BX.forEach(function(bx){rc(bx-0.9,bx+0.9,0,H,'#f3f1ea');});                                              // smooth render round each doorway
    const tall=function(x,w){rc(x-0.06,x+w+0.06,0.1,2.5,'#f1f0ec'); rc(x,x+w,0.16,2.42,'#33403f'); rc(x+w*0.48,x+w*0.52,0.16,2.42,'#f1f0ec'); rc(x,x+w,1.25,1.3,'#f1f0ec'); rc(x,x+w,0.16,1.25,'#5c7275');};   // a tall window, its lower panes frosted
    const roll=function(x,w){rc(x-0.05,x+w+0.05,0.45,2.62,'#e7e3d8'); rc(x,x+w,0.5,2.42,'#f3f2ed'); for(let y=0.52;y<2.42;y+=0.06) rc(x,x+w,y,y+0.012,'#c9c7bf'); rc(x-0.05,x+w+0.05,2.42,2.62,'#e1ddd2');};   // shutters rolled down
    tall(2.15,1.1); roll(3.45,2.2); roll(5.95,1.4); tall(9.15,1.1); roll(10.45,1.7);
    const gr=A.rng(19); for(let i=0;i<40;i++){const x=gr()*FW, y=gr()*H; rc(x,x+0.02,y,y+0.25,'rgba(120,100,80,0.18)');}      // streaks of grime
  }), gtM=A.MT(gt);
  function front(x0,x1,y0,y1){                         // one piece of the ground-floor front, cut from that one long drawing
    const g=new THREE.BufferGeometry(), z=0.03;
    g.setAttribute('position',new THREE.Float32BufferAttribute([x0,y0,z, x1,y0,z, x1,y1,z, x0,y1,z],3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute([x0/FW,y0/H, x1/FW,y0/H, x1/FW,y1/H, x0/FW,y1/H],2)); g.setIndex([0,1,2,0,2,3]);
    fac.add(new THREE.Mesh(g,gtM));
  }
  let fx=0; BX.forEach(function(bx){front(fx,bx-BRW/2,0,H); front(bx-BRW/2,bx+BRW/2,2.5,H); fx=bx+BRW/2;}); front(fx,FW,0,H);
  const ft=tex(256,256,function(g){                    // the floors above: closed-in balconies behind white slatted shutters
    g.fillStyle='#ece8dc'; g.fillRect(0,0,256,256); g.fillStyle='#d6cfbd'; g.fillRect(0,236,256,20);
    g.fillStyle='#55626a'; g.fillRect(20,56,150,128); g.fillStyle='#f6f5f0'; g.fillRect(20,56,104,128); g.fillStyle='#cdd0cb'; for(let y=60;y<184;y+=7) g.fillRect(20,y,104,2);
    g.strokeStyle='#fbfaf6'; g.lineWidth=4; g.strokeRect(20,56,150,128); g.fillStyle='#fbfaf6'; g.fillRect(122,56,4,128); g.fillStyle='#d9d3c2'; g.fillRect(12,184,166,10);
    g.fillStyle='#6f7d84'; g.fillRect(198,84,40,62); g.strokeStyle='#fbfaf6'; g.lineWidth=3; g.strokeRect(198,84,40,62);
    g.fillStyle='#e6e8e6'; g.fillRect(194,168,48,30); g.fillStyle='#b9bdbb'; g.fillRect(200,174,36,18);
  },true); ft.repeat.set(FW/3.2,3);
  panel(FW,TOP-H,A.MT(ft),FW/2,(H+TOP)/2,0.03,0,fac);
  const sw=tex(64,128,function(g){g.fillStyle='#fbfaf6'; g.fillRect(0,0,64,128); g.fillStyle='#5b6b73'; for(let i=0;i<3;i++) for(let j=0;j<2;j++) g.fillRect(4+i*20,4+j*62,16,56);},true); sw.repeat.set(1,5);
  const swM=A.MT(sw), p10=A.MT(plate('10')), lantern=A.lampMat('L:street',0xdfe6dc,0xffe7bd,1);
  const hs=tex(128,48,function(g){g.fillStyle='#c9a35a'; g.fillRect(0,0,128,48); g.strokeStyle='#7a5a2a'; g.lineWidth=3; g.strokeRect(2,2,124,44);
    g.fillStyle='#3b2a14'; g.textAlign='center'; g.font='bold 22px sans-serif'; g.fillText('הראה',64,24); g.font='bold 16px sans-serif'; g.fillText('10',64,42);});
  BX.forEach(function(bx,i){                                                                // plain openings in the front, no doors
    [-1,1].forEach(function(s){F.box(0.06,2.5,0.06,0xe9e4d8,bx+s*(BRW/2+0.03),1.25,0.04);}); F.box(BRW+0.12,0.08,0.06,0xe9e4d8,bx,2.54,0.04);
    panel(0.28,0.28,p10,bx+1.0,2.78,0.045,0,fac);                                           // the green number plate,
    if(i===0){panel(0.5,0.19,A.MT(hs),bx+0.45,2.72,0.045,0,fac);                            // the brass street sign over our doorway,
      const gt=B.at(bx+BRW/2+0.14,0,0.08,-0.42), w=0xeeede6, rust=0x9a6a3e;               // the old white grille of the window beside it, bent open and left leaning out over the strip
      [0.12,1.2,2.3].forEach(function(y){gt.box(1.12,0.035,0.035,w,0.56,y,0); gt.box(1.12,0.01,0.04,rust,0.56,y-0.02,0);});
      for(let x=0.03;x<1.12;x+=0.1) gt.box(0.022,2.3,0.022,w,x,1.2,0.06*Math.sin(x*5),0,0.07);
      for(let x=3.5;x<5.62;x+=0.12) F.box(0.02,2.2,0.02,0xeeede6,x,1.5,0.14); [0.55,1.3,2.35].forEach(function(y){F.box(2.2,0.03,0.03,0xeeede6,4.55,y,0.14);});      // bars in front of the shutters, rusting at the joints
      [[3.5,0.14],[5.6,0.14]].forEach(function(q){F.box(0.04,0.04,0.14,0xeeede6,q[0],2.35,0.07); F.box(0.04,0.04,0.14,0xeeede6,q[0],0.55,0.07);});
      for(let i=0;i<10;i++){const x=0.08+i*0.045; F.box(0.012,TOP-1,0.012,0xf2f2ef,x,(TOP+1)/2-0.5,0.08+((i*7)%4)*0.02);}      // a bundle of white cables down the corner
      const ln=function(pts){st.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts.map(function(p){return new THREE.Vector3(p[0],p[1],p[2]);})),new THREE.LineBasicMaterial({color:0xf2f2ef})));};
      for(let k=0;k<6;k++){const pts=[]; for(let i=0;i<=16;i++){const t=i/16; pts.push([0.3+t*(2.9+k*0.3),2.62-0.55*Math.sin(t*R)*(0.4+k*0.12)-0.05*k,0.12+t*0.25]);} ln(pts);}      // and loops of it hanging over the doorway
      const fr=0x262828; [3.5,4.1].forEach(function(y){F.box(FW-1.4,0.04,0.04,fr,(1.2+FW)/2,y,0.42);}); for(let x=1.2;x<FW;x+=1.6){F.box(0.04,0.04,0.42,fr,x,3.5,0.21); F.box(0.04,0.64,0.04,fr,x,3.8,0.42);}      // the iron frame across the first floor
      for(let x=1.25;x<FW-0.2;x+=0.25) F.box(0.006,0.6,0.006,0x3a3c3c,x,3.8,0.42);}
    else F.box(0.12,0.2,0.1,lantern,bx+0.75,2.05,0.2);
  });
  panel(1.5,TOP-0.8-3.0,swM,ZC-(L+EH)/2,(3.0+TOP-0.8)/2,0.05,0,fac);                       // glazing up the front where the stairs are
  B.done(); C.done(); F.done();
  A.streetView=[st.localToWorld(new THREE.Vector3(2.3,U+1.62,12.2+D8)),st.localToWorld(new THREE.Vector3(1.1,1.1,0.4))];      // standing at the café, looking down the alley to our bridge
  /* Sims mode can walk out here: where the ground is (in this frame, turned into the model's), what stands in the way,
     and how high the ground is: the bridges at the lobby's level, the forecourt and the patch a step below, the steps, the square, the road */
  const wr=function(q){return [XF+q[2],XF+q[3],ZC-q[1],ZC-q[0]];};
  A.rooms.street.rs=[[WX0+0.06,DXR-0.04,-0.2,0.75],[WX0+0.06,DXR+0.2,0.35,1.15],[WX0+0.06,DXR+0.42,0.75,1.65],[WX0+0.06,WX1-0.1,1.2,BL+0.45],      // our bridge, in steps along its slanting side; each overlaps the next, as each loses a body's width at its edges
    [BX[1]-0.5,BX[1]+0.5,-0.2,BS+0.45],[0.12,AW-0.12,BL+0.2,GZ+0.3],[P2[0]+0.12,P2[1]-0.12,WELL+0.05,GZ+0.3],
    [0.15,SQ-0.2,GZ-0.3,KZ-0.2],[-3.5,0.4,16.2+D8,KZ-0.2],[SQ-0.6,30,15.9+D8,KZ-0.2],[5.5,8.7,KZ-0.6,KZ+RW+0.6],[3.9,26,KZ+RW+0.1,28.8+D8]].map(wr);
  const tb=CAFE.map(function(q){return [q[0]-0.72,q[0]+0.72,q[1]-0.72+D8,q[1]+0.72+D8];}).concat(UMB.map(function(q){return [q[0]-0.3,q[0]+0.3,q[1]-0.3+D8,q[1]+0.3+D8];}));
  A.streetBlock=[[0,1.08,LT,SB],[0,0.5,5.7,7.8],[0.5,1.3,8.05,8.8],[1.05,1.65,SB-0.2,SB+1.4],[2.6,3.4,14.2,17.9],[2.55,3.4,BL+0.7,BL+2.3],[0,0.45,SB+0.7,SB+1.7],[3.0,3.4,AL+0.3,AL+1.1]].concat(tb,
    [[0.05,0.85,10.45,11.25],[0,0.36,11.3,15.9],[3.55,5.3,10.35,11.85],[P2[1]+0.1,P2[1]+0.4,10.45,10.75],[0.3,4.4,17.3,17.8],[0.3,0.9,16.45,17.05],[11.55,12.45,17.7,18.1],[9.7,10.8,14.6,15.2],[10.75,11.65,14.85,16.15],
    [10.3,10.5,13.65,13.85],[2.1,2.3,17.95,18.15],[4.5,4.7,17.9,18.1],[5.15,5.45,18.0,18.3],[8.75,9.05,18.0,18.3],[10.15,10.45,18.0,18.3],[10.8,11.4,17.35,17.95],
    [11.7,12.2,14.55,16.35],[12.05,12.35,10.35,10.65],[12.4,19.0,11.45,17.95],[17.9,19.3,17.75,17.95]].map(function(b){return [b[0],b[1],b[2]+D8,b[3]+D8];})).map(wr);
  A.streetPass=[[XF-0.4,XF+0.4,ZO-0.45,ZO+0.45],[XF-0.4,XF+0.4,Z2-0.45,Z2+0.45]];
  A.groundAt=function(x,z){
    if(x<XF-0.05) return 0; const q=x-XF, p=ZC-z;      // q: out from our front; p: along it from number 12's corner
    if(q>=GZ) return q<KZ?U:q<KZ+RW?RY:U;
    if(p>P2[0]-0.6&&p<P2[1]+0.6){if(q<BS) return 0; if(q<BS+0.15) return LA*(q-BS)/0.15; if(q<LZ) return LA; if(q<SZ) return LA+(U-LA)*(q-LZ)/(SZ-LZ); return U;}      // the way to the second bridge
    if(q<BL+0.38) return 0; if(q<BL+0.53) return LA*(q-BL-0.38)/0.15; if(q<FZ) return LA; if(q<AL) return LA+(U-LA)*(q-FZ)/(AL-FZ); return U;      // ours
  };
  const tags=[['Bridge to the street'
,BX[0],1.5,BL/2],['Second bridge',BX[1],1.5,WELL/2],['Steps down to the forecourt',AW/2,U+1.3,FZ+0.2],['Number 12',0.3,U+3.4,13],['Café',4,U+3.4,13.5+D8],['Haroe St',12,U+0.6,KZ+3.5]]
    .map(function(q){return {el:A.tag(q[0]),pos:st.localToWorld(new THREE.Vector3(q[1],q[2],q[3]))};});
  A.labelFns.push(function(){const show=A.state.labels&&!A.simsOn; tags.forEach(function(t){A.place(t.el,t.pos,show);});});
  const lc=new THREE.Vector3(); let crowns=true;
  A.frameFns.push(function(){
    const c=st.worldToLocal(lc.copy(A.camera.position)), low=c.y<5.2;      // where the camera is, in the street's own frame
    fac.visible=low&&c.z>0.4&&!(A.simsOn&&!A.eyeView());
    const solid=(low||c.z<0)&&!(A.thinTrees&&A.thinTrees());      // the tree crowns thin to a ghost when the camera is above the square, or in Building view, so they never hide it
    if(solid!==crowns){crowns=solid; can.children.forEach(function(m){m.material.transparent=!solid; m.material.opacity=solid?1:0.22; m.material.depthWrite=solid;});}
    far.forEach(function(b){b.g.visible=!b.hide(c);});
    const eve=A.goal('day')<0.5?0.6:0; if(A.goal('L:street')!==eve) A.set('L:street',eve);      // street lamps and the café's bulbs come on in the evening
  });
});
})();
