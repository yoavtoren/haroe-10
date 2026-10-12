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
   Over the corner bridge and through the open doorway into a small square hall: flat 2's door on the left wall ahead, the
   letter boxes and the meter cupboards on the wall to your left as you come in. Turn right into the long corridor: stone
   cladding to about 1.5 m on both sides, white plaster above, the old concrete vent screens high on the left. At its end a
   wide pillar on the left with flat 3's door in the recess behind it, then flat 4 and our door, flat 5, side by side; the
   stairs open on the right: a flight up along the wall beside our door, a flight down beside it behind a white railing.
   A second bridge further along the front leads into a small hall of its own, for flats 1 and 6. */
const LB=A.LB, XL=LB.XL, CX0=LB.CX0, CX1=LB.CX1, RZ=LB.RZ, EH=LB.EH, BZ=LB.BZ, ZE=LB.ZE, ZC=LB.ZC, XF=LB.XF, XS=LB.XS, ZO=LB.ZO, Z2=LB.Z2, Z2N=Z2+1.15;
const CL=1.47;          // height of the stone cladding
const terrazzo=canvasTex(256,256,function(g){          // the floor: speckled beige tiles, 30 cm
  g.fillStyle='#dccb9f'; g.fillRect(0,0,256,256); const r=A.rng(21), cs=['#b39c70','#efe4c8','#8f7b58','#c9b081','#a58d62','#f6efdc'];
  for(let i=0;i<2600;i++){g.fillStyle=cs[Math.floor(r()*cs.length)]; g.fillRect(r()*256,r()*256,1+r()*2.2,1+r()*2);}
  for(let j=0;j<4;j++) for(let i=0;i<4;i++){g.fillStyle='rgba(120,100,60,'+(r()*0.07)+')'; g.fillRect(i*64,j*64,64,64);}
  g.strokeStyle='#9c8a66'; g.lineWidth=2; for(let k=0;k<=4;k++){g.beginPath(); g.moveTo(k*64,0); g.lineTo(k*64,256); g.stroke(); g.beginPath(); g.moveTo(0,k*64); g.lineTo(256,k*64); g.stroke();}
});
terrazzo.wrapS=terrazzo.wrapT=THREE.RepeatWrapping;
const ashlar=canvasTex(256,256,function(g){           // the wall cladding: beige stone in courses of mixed height, 1.2 m wide, 1.47 high
  const r=A.rng(5), cs=['#d6c39b','#cdb88c','#e0d0ab','#c7b085','#dccaa3','#d1bd93'];
  g.fillStyle='#b9a47c'; g.fillRect(0,0,256,256);
  let y=0; while(y<256){const h=26+Math.floor(r()*30); let x=-Math.floor(r()*60);
    while(x<256){const w=40+Math.floor(r()*80); g.fillStyle=cs[Math.floor(r()*cs.length)]; g.fillRect(x+1.5,y+1.5,w-3,h-3);
      for(let i=0;i<w*h/40;i++){g.fillStyle='rgba('+(r()>0.5?'255,250,235':'120,100,70')+','+(0.05+r()*0.1)+')'; g.fillRect(x+r()*w,y+r()*h,1+r()*3,1);}
      x+=w;}
    y+=h;}
});
ashlar.wrapS=THREE.RepeatWrapping;
const plaster=canvasTex(256,128,function(g){          // white plaster above it, peeling here and there
  g.fillStyle='#f4f2ec'; g.fillRect(0,0,256,128); const r=A.rng(8);
  for(let i=0;i<5;i++){const x=r()*256, y=r()*128, w=3+r()*10, h=2+r()*5; g.fillStyle='rgba(215,208,190,'+(0.2+r()*0.2)+')'; g.beginPath(); g.ellipse(x,y,w,h,r()*3,0,7); g.fill();
    g.strokeStyle='rgba(175,165,140,0.25)'; g.lineWidth=1; g.stroke();}
});
plaster.wrapS=THREE.RepeatWrapping;
[[XL,CX1,L,RZ],[CX0,CX1,RZ,ZE],[CX0,XF,ZE,ZC],[CX1,XF-0.1,EH,BZ],[2.6,XF,BZ,Z2N]].forEach(function(q){A.floorQuad(q[0],q[1],q[2],q[3],terrazzo,1.2,'hall'); A.ceil('hall',q[0],q[1],q[2],q[3]);});
A.floorQuad(CX1,1.4,L,EH,terrazzo,1.2,'hall');                                   // the top step of the stairs, level with the landing
const en=D.entrance;
wall('h_s',[XL,L],[XF-0.1,L],[0,1],'hall',{holes:[[en[0]-XL,en[1]-XL]]});      // flat 4, our door (flat 5), and the wall the stairs climb
wall('h_l3',[XL,L],[XL,RZ],[1,0],'hall');                                        // the recess with flat 3's door
wall('h_rz',[XL,RZ],[CX0,RZ],[0,-1],'hall');                                     // the back of the wide pillar
wall('h_cl',[CX0,RZ],[CX0,ZC],[1,0],'hall');                                     // corridor, left: vent screens, then flat 2 in the square hall
wall('h_n',[CX0,ZC],[XF,ZC],[0,-1],'hall');                                      // the square hall's far side: letter boxes and meter cupboards
wall('h_f',[XF,ZE],[XF,ZC],[-1,0],'hall',{holes:[[ZO-0.65-ZE,ZO+0.65-ZE,2.5]]}); // the street front, with the open doorway to our bridge
wall('h_bn',[CX1,ZE],[XF,ZE],[0,1],'hall');                                      // the block between the corridor and the front, with a barred window
wall('h_br',[CX1,BZ],[CX1,ZE],[-1,0],'hall');                                    // corridor, right
wall('h_bs',[CX1,BZ],[XF-0.1,BZ],[0,-1],'hall');                                 // behind the stairwell railing
wall('h_cf',[XF-0.1,L],[XF-0.1,BZ],[-1,0],'hall');                               // the far side of the stairwell
wall('v_s',[2.6,BZ],[XF,BZ],[0,1],'hall'); wall('v_n',[2.6,Z2N],[XF,Z2N],[0,-1],'hall'); wall('v_w',[2.6,BZ],[2.6,Z2N],[1,0],'hall');   // the second entrance: flats 1 and 6
wall('v_f',[XF,BZ],[XF,Z2N],[-1,0],'hall',{holes:[[Z2-0.65-BZ,Z2+0.65-BZ,2.5]]});
A.doorFrame('h_s',en[0]-XL,en[1]-XL);
const HW=['h_s','h_l3','h_rz','h_cl','h_n','h_f','h_bn','h_br','h_bs','h_cf','v_s','v_n','v_w','v_f'];
HW.forEach(function(k){A.spans(k).forEach(function(s){
  const t=ashlar.clone(); t.needsUpdate=true; t.repeat.set((s[1]-s[0])/1.2,1); t.offset.x=(s[0]*0.37)%1;
  rect(k,s[0],s[1],0,CL,A.MT(t,'hall'),0.005);
  const p=plaster.clone(); p.needsUpdate=true; p.repeat.set((s[1]-s[0])/2.4,1); p.offset.x=(s[0]*0.53)%1;
  rect(k,s[0],s[1],CL,H,A.MT(p,'hall'),0.004);});});
rect('h_cl',0,1.0,CL,2.2,A.MT(ashlar,'hall'),0.006);                             // the wide pillar at the corridor's end is clad higher
/* the other five flats: grey steel doors in white frames, a brass number and a bell */
function flatDoor(k,u,no){
  const tex=canvasTex(128,256,function(g){
    g.fillStyle='#9da2a5'; g.fillRect(0,0,128,256); const r=A.rng(no.charCodeAt(0)); for(let i=0;i<300;i++){g.fillStyle='rgba(255,255,255,'+(r()*0.05)+')'; g.fillRect(r()*128,r()*256,2,2);}
    g.fillStyle='#c9a24a'; g.font='bold 20px serif'; g.textAlign='center'; g.fillText(no,64,68); g.fillStyle='#3a3d3f'; g.beginPath(); g.arc(64,80,3,0,7); g.fill();
    g.fillStyle='#d4d7d8'; g.beginPath(); g.arc(18,132,5,0,7); g.fill(); g.fillRect(14,140,8,4); g.beginPath(); g.arc(18,152,5,0,7); g.fill();
  });
  rect(k,u-0.5,u+0.5,0,2.17,0xf3f2ee,0.008); rect(k,u-0.43,u+0.43,0,2.07,A.MT(tex,'hall'),0.01);
  rect(k,u+0.6,u+0.68,1.2,1.3,0xeeeeea,0.009);
}
flatDoor('h_s',-0.91-XL,'4'); flatDoor('h_l3',0.98,'3'); flatDoor('h_cl',ZE+0.95-RZ,'2'); flatDoor('v_s',1.0,'1'); flatDoor('v_n',XF-2.6-1.0,'6');
rect('h_s',en[1]-XL+0.2,en[1]-XL+0.28,1.2,1.3,0xeeeeea,0.009);                 // our light switch
rect('h_s',-0.27-XL,-0.05-XL,1.28,1.62,0xf2d33a,0.011); rect('h_s',-0.25-XL,-0.07-XL,1.5,1.53,0x6a5a20,0.012);    // a yellow notice on the pier between the doors
/* the concrete vent screens high on the corridor's left, behind a white mesh */
const ventT=canvasTex(128,96,function(g){
  g.fillStyle='#f4f3ef'; g.fillRect(0,0,128,96); g.fillStyle='#d8d4ca'; g.fillRect(8,8,112,80);
  g.fillStyle='#5a5852'; for(let j=0;j<4;j++) for(let i=0;i<6;i++){g.beginPath(); g.arc(17+i*19+(j%2?9:0),20+j*19,7,0,7); g.fill();}
  g.strokeStyle='rgba(250,250,248,0.85)'; g.lineWidth=1; for(let x=8;x<120;x+=4){g.beginPath(); g.moveTo(x,8); g.lineTo(x,88); g.stroke();} for(let y=8;y<88;y+=4){g.beginPath(); g.moveTo(8,y); g.lineTo(120,y); g.stroke();}
});
function vent(z){const u=z-RZ; rect('h_cl',u-0.62,u+0.62,1.6,2.42,A.MT(ventT,'hall'),0.012);}
[ZE-0.4,ZE-1.95,L+6.45,L+4.9,L+3.35].forEach(vent);
[ZE-1.17,L+5.67].forEach(function(z){rect('h_cl',z-RZ-0.16,z-RZ+0.16,1.9,2.16,0x1f2122,0.012);});
rect('h_br',ZE-0.7-BZ-0.3,ZE-0.7-BZ+0.3,1.55,2.35,0x6b4a2f,0.009); rect('h_br',ZE-0.7-BZ-0.26,ZE-0.7-BZ+0.26,1.59,2.31,0xc9a46e,0.010);   // an empty notice board
rect('h_bn',XF-2.0-CX1,XF-0.6-CX1,1.45,2.25,0xf4f4f1,0.008); rect('h_bn',XF-1.95-CX1,XF-0.65-CX1,1.5,2.2,0x3e4a52,0.009);          // the barred window facing the doorway
for(let i=0;i<9;i++){const u=XF-1.9-CX1+i*0.15; rect('h_bn',u-0.012,u+0.012,1.5,2.2,0xf6f6f3,0.011);}
inRoom('hall',function(){
  function bulb(x,z,drop){const y=H-(drop||0.28); box(0.01,H-y,0.01,0x2a2c2e,x,(H+y)/2,z).castShadow=false; sph(0.045,A.lampMat('L:hall',0xf6f1e2,0xfff0c8,1.1),x,y-0.04,z); A.pool('L:hall',0xffe2b0,x,0.02,z,2.4,null,0.3);}
  bulb(0,L+1.2); bulb(0,L+5.2); bulb(0,ZE-1.6); bulb(1.9,ZE+1.5); bulb(3.9,Z2,0.2);
  box(0.03,0.025,ZC-L,0xf1f1ee,CX0+0.35,H-0.02,(L+ZC)/2).castShadow=false;                                    // a conduit along the ceiling
  box(0.12,0.08,0.12,0xf4f4f1,1.15,H-0.05,L+0.3); sph(0.05,0x2a2d30,1.15,H-0.11,L+0.33);                    // the security camera over our door
  box(0.6,0.014,0.4,0x8a6a48,(en[0]+en[1])/2,0.007,L+0.3).castShadow=false;                               // doormats: ours, and flat 3's
  box(0.4,0.014,0.6,0x7a5e40,XL+0.25,0.007,L+0.98).castShadow=false;
  box(0.6,0.004,1.0,0xe7dcc0,0.75,0.003,L+2.3).castShadow=false;                                          // a lighter patch of floor: the access hatch
  const ed=A.door('entrance'); box(0.83,2.03,0.004,0xb3b8bb,0.425,1.02,0.023,ed.p); box(0.124,0.029,0.05,0x5f6466,0.72,1.05,0.05,ed.p);   // our door is grey on the lobby side too,
  const five=new THREE.Mesh(new THREE.PlaneGeometry(0.07,0.09),A.MT(canvasTex(32,40,function(g){g.fillStyle='#9da2a5'; g.fillRect(0,0,32,40); g.fillStyle='#c9a24a'; g.font='bold 34px serif'; g.textAlign='center'; g.fillText('5',16,33);}),'hall'));
  five.position.set(0.425,1.62,0.026); ed.p.add(five);                                                          // with a brass 5
  /* letter boxes and the meter cupboards: on the left as you come in over the bridge */
  for(let r=0;r<2;r++) for(let c=0;c<6;c++){const x=XF-2.15+c*0.3, y=1.15+r*0.32;
    box(0.26,0.28,0.12,0x8f9aa0,x,y,ZC-0.06); box(0.14,0.05,0.006,0x2b2f2c,x,y+0.06,ZC-0.123); box(0.1,0.07,0.008,0xf3ebdc,x,y-0.06,ZC-0.125);}
  box(0.7,1.3,0.22,0x9aa39e,0.15,1.25,ZC-0.11); box(0.006,1.24,0.004,0x6f7672,0.15,1.25,ZC-0.222); box(0.2,0.1,0.004,0xe8c91a,0.3,1.6,ZC-0.223);
  box(0.6,1.0,0.2,0xb9bdc0,0.95,1.2,ZC-0.1); box(0.006,0.94,0.004,0x6f7672,0.95,1.2,ZC-0.202);
  /* the stairs: up along the wall beside our door, down beside it, both climbing away from the landing */
  const stone=0xcdbb94, nose=0xbba982, up=(H+0.24)/20, dn=-GY/20, T=(XS-1.4)/9, zu=(L+0.08+L+1.3)/2, zd=(L+1.5+EH-0.03)/2, fw=1.22;
  for(let i=0;i<9;i++){const x=1.4+(i+0.5)*T;
    const hu=(i+1)*up; box(T,hu,fw,stone,x,hu/2,zu); box(T,0.02,fw,nose,x,hu+0.01,zu);                           // up, solid to the floor
    const hd=-(i+1)*dn; box(T,0.3,fw,stone,x,hd-0.15,zd);                                                        // down
    const hr=10*up+(i+1)*up; if(hr<H+0.05) box(T,0.3,fw,stone,XS-(i+0.5)*T,hr-0.15,zd);                           // the return flight above the down flight, to the floor above
    const hb=-10*dn-(i+1)*dn; box(T,0.3,fw,stone,XS-(i+0.5)*T,hb-0.15,zu);}                                      // and the one below the up flight, to the floor below
  box(XF-0.1-XS,0.2,EH-L-0.08,stone,(XS+XF-0.1)/2,10*up-0.1,(L+0.08+EH)/2);                                      // half landings
  box(XF-0.1-XS,0.2,EH-L-0.08,stone,(XS+XF-0.1)/2,-10*dn-0.1,(L+0.08+EH)/2);
  const sl=Math.hypot(XS-1.4,10*up), sa=Math.atan2(10*up,XS-1.4), so=box(sl,0.14,fw,0xeeece6,(XS+1.4)/2,15*up-0.42,zd); so.rotation.z=-sa;   // the white underside of the flight above
  box(XS-1.4,-GY+0.1,0.2,0xe9e3d3,(1.4+XS)/2,GY/2+0.05,L+1.4);                                                   // the wall between the flights, up to the landing
  const iron=0x1d1f21, rail=function(x0,y0,x1,y1,z){const len=Math.hypot(x1-x0,y1-y0), a=Math.atan2(y1-y0,x1-x0), m=box(len,0.035,0.035,iron,(x0+x1)/2,(y0+y1)/2,z); m.rotation.z=a;
    for(let d=0.12;d<len;d+=0.13){const t=d/len; box(0.014,0.9,0.014,iron,x0+(x1-x0)*t,y0+(y1-y0)*t-0.45,z);}};
  rail(1.45,0.95,XS,10*up+0.95,L+1.33); rail(1.45,0.95,XS,-10*dn+0.95,L+1.47);                                  // black handrails on the wall between them
  const wh=0xf6f6f2;                                                                                             // the white railing round the stairwell, toward the corridor
  box(XF-0.1-1.35,0.04,0.04,wh,(1.35+XF-0.1)/2,1.0,EH); box(XF-0.1-1.35,0.03,0.03,wh,(1.35+XF-0.1)/2,0.08,EH);
  for(let x=1.47;x<XF-0.15;x+=0.12) box(0.018,0.92,0.018,wh,x,0.54,EH);
  box(0.05,H,0.05,wh,1.35,H/2,EH);                                                                               // and its white pole
  box(XF-0.1-XS,0.04,0.04,wh,(XS+XF-0.1)/2,10*up+1.0,EH);
  A.rbox(0.7,0.86,0.025,0x1e2022,2.35,0.62,EH+0.035,null,0.01); A.rbox(0.7,0.04,0.06,0x1e2022,2.35,1.03,EH,null,0.015);   // a black mat hung over it to dry
  /* the floor below: the down flight reaches it, and it has flats of its own under the lobby */
  const lw=0xe9e3d3;
  box(XF-0.1-1.3,0.1,EH-L,stone,(1.3+XF-0.1)/2,GY+0.05,(L+EH)/2);
  box(0.1,-GY,EH-L,lw,1.25,GY/2,(L+EH)/2); box(0.02,2.2,1.0,0x2a2d2b,1.31,GY+1.1,(L+EH)/2);
  K.fiddle(null,XF-0.5,ZC-0.5,1.9,3);
});
/* a block of flats like every other in the street: window, shutter, balcony rail */
const bt=canvasTex(256,256,function(g){
  g.fillStyle='#e6dfcf'; g.fillRect(0,0,256,256); g.fillStyle='#d2cab6'; g.fillRect(0,232,256,24);
  g.fillStyle='#7f98a3'; g.fillRect(24,60,80,110); g.fillStyle='#f3efe4'; g.fillRect(62,60,4,110);
  g.fillStyle='#8aa08a'; for(let y=62;y<168;y+=9) g.fillRect(132,y,92,6); g.strokeStyle='#bdb5a0'; g.lineWidth=4; g.strokeRect(130,58,96,112);
  g.fillStyle='#c9c1ad'; g.fillRect(14,176,228,10); g.strokeStyle='#8f8a7c'; g.lineWidth=2; for(let x=18;x<240;x+=12){g.beginPath(); g.moveTo(x,186); g.lineTo(x,230); g.stroke();}
});
bt.wrapS=bt.wrapT=THREE.RepeatWrapping;

/* ================= outside ================= */
inRoom('out',function(){
  const o=G(); o.userData.nc=true; A.outside=o;
  function ground(x0,x1,z0,z1,y,c){const m=box(x1-x0,0.1,z1-z0,c,(x0+x1)/2,y-0.05,(z0+z1)/2,o); m.castShadow=false; return m;}
  ground(-30,45,-45,40,GY,0xd8c7a0);                                          // the yard is mostly sand
  ground(8.2,11.4,-9.5,-5.5,GY+0.015,0x8fae74); ground(-3,1.5,-11.6,-9,GY+0.015,0x8fae74);     // two worn patches of green
  ground(XF,XF+3.5,AZ-3.5,L,GY+0.02,0xbdb6a6); ground(-7,XF+3.5,AZ-3.5,AZ-0.6,GY+0.02,0xbdb6a6);   // paved path round our corner
  // the building under and beside us: the floor below ("minus one") opens onto the garden
  const facade=0xe9e3d3, X7=-7;
  box(XF-X7,-GY-0.01,ZC-AZ+0.4,facade,(X7+XF)/2,GY/2-0.005,(AZ-0.4+ZC)/2,o);
  box(D.BX-XF+0.02,-GY-0.01,-AZ+0.4,facade,(XF+D.BX+0.02)/2,GY/2-0.005,(AZ-0.4)/2,o);
  box(XF-3.94,H,L-A.BA.z1-0.04,0xe4ddcc,(3.92+XF)/2,H/2,(A.BA.z1+0.02+L-0.02)/2,o);        // a block of shafts between our bathroom and the stairs
  const winTex=canvasTex(128,128,function(g){g.fillStyle='#e9e3d3'; g.fillRect(0,0,128,128); g.fillStyle='#8fb0bb'; g.fillRect(30,22,68,70); g.fillStyle='#f6f3ea'; g.fillRect(62,22,4,70); g.fillStyle='#cfc8b6'; g.fillRect(24,94,80,6);});
  winTex.wrapS=THREE.RepeatWrapping;
  function strip(len,x,y,z,rotY,hh){const t=winTex.clone(); t.needsUpdate=true; t.repeat.set(Math.round(len/2.6),1); const m=new THREE.Mesh(new THREE.PlaneGeometry(len,hh||2.6),A.MT(t)); m.position.set(x,y,z); m.rotation.y=rotY; o.add(m);}
  strip(L,XF+0.005,GY+1.4,L/2,R/2,2.4); strip(-AZ,D.BX+0.025,GY+1.4,AZ/2,R/2,2.4); strip(ZC-L,XF+0.005,GY+1.4,(L+ZC)/2,R/2,2.4);      // the garden fronts, and the one down in the sunken strip
  strip(D.BX-X7,(X7+D.BX)/2,GY+1.4,AZ-0.405,R,2.4);
  // the rest of our ground floor, as plain volumes, so the corridor is not floating
  // garden: trees, hedge, bench, washing line
  function tree(x,z,h,s){cyl(0.14*s,h,0x6b4a2f,x,GY+h/2,z,o,8,0.09*s); sph(1.3*s,0x3f7d4a,x,GY+h+0.6*s,z,o); sph(1.0*s,0x4f9160,x+0.8*s,GY+h+0.1*s,z+0.4*s,o); sph(0.9*s,0x2f6b45,x-0.7*s,GY+h+0.2*s,z-0.5*s,o);}
  tree(9.6,-1.5,3.6,1.0); tree(10.8,3.0,3.0,0.9); tree(9.6,-8,4.2,1.1); tree(2,-10,3.4,0.9); tree(-4.5,-10.2,3.8,1.0); tree(12.6,-10.6,3.4,0.9);
  for(let i=0;i<16;i++) sph(0.5,i%2?0x3f7d4a:0x4a8a58,-5+i*1.2,GY+0.38,AZ-8.2,o,1,0.8,1);            // hedges along the neighbour's edge
  for(let i=0;i<13;i++) sph(0.5,i%2?0x3f7d4a:0x4a8a58,KX+8.2,GY+0.38,AZ-7+i*1.3,o,1,0.8,1);
  box(1.5,0.06,0.4,0x8a6a48,9.6,GY+0.45,1.0,o); box(0.06,0.45,0.36,0x3b3f3c,9.0,GY+0.22,1.0,o); box(0.06,0.45,0.36,0x3b3f3c,10.2,GY+0.22,1.0,o);
  cyl(0.03,2.0,0x9aa39e,11.8,GY+1,-3,o,6); cyl(0.03,2.0,0x9aa39e,11.8,GY+1,-7,o,6); box(0.01,0.01,4,0xffffff,11.8,GY+1.9,-5,o);
  [[-4.2,0xf3ebdc],[-5,0x9fc4d6],[-5.8,0xd9463e]].forEach(function(q){box(0.02,0.6,0.5,q[1],11.8,GY+1.55,q[0],o);});
  /* the neighbouring building, close by to the east: four floors over a ground floor. Across the yard to the south is number 8 (built with the street) */
  const blocks=[];
  function block(cx,cz,sx,sz,faceAxis){
    const og=o, o2=G(og); blocks.push({g:o2,axis:faceAxis,face:faceAxis==='x'?cx-sx/2:cz+sz/2});
    (function(o){
    const top=12.6, hh=top-GY;
    box(sx,hh,sz,0xddd5c3,cx,GY+hh/2,cz,o);
    const len=faceAxis==='x'?sz:sx, t=bt.clone(); t.needsUpdate=true; t.repeat.set(Math.round(len/3.4),4);
    const m=new THREE.Mesh(new THREE.PlaneGeometry(len,12.4),A.MT(t));
    if(faceAxis==='x'){m.position.set(cx-sx/2-0.02,6.3,cz); m.rotation.y=-R/2;} else{m.position.set(cx,6.3,cz+sz/2+0.02); }
    o.add(m);
    for(let f=0;f<4;f++){const y=0.25+f*3.1; if(faceAxis==='x') box(1.1,0.12,len-1,0xcfc7b3,cx-sx/2-0.55,y,cz,o); else box(len-1,0.12,1.1,0xcfc7b3,cx,y,cz+sz/2+0.55,o);}
    for(let i=0;i<Math.floor(len/5);i++){            // pilotis and the solar water heaters on the roof
      const u=-len/2+2.5+i*5;
      if(faceAxis==='x'){box(0.4,2.9,0.4,0xcfc7b3,cx-sx/2-0.3,GY+1.45,cz+u,o); cyl(0.3,1.2,0xf6f6f2,cx,top+0.9,cz+u,o,12).rotation.z=R/2; box(1.6,0.06,1.0,0x2b3d55,cx-1.4,top+0.5,cz+u,o).rotation.z=0.5;}
      else{box(0.4,2.9,0.4,0xcfc7b3,cx+u,GY+1.45,cz+sz/2+0.3,o); cyl(0.3,1.2,0xf6f6f2,cx+u,top+0.9,cz,o,12).rotation.x=R/2; box(1.0,0.06,1.6,0x2b3d55,cx+u,top+0.5,cz+1.4,o).rotation.x=0.5;}
    }
    })(o2);
  }
  const GAP=9;                                     // a tight yard: the neighbour stands this close
  block(7,AZ-GAP-5.5,34,11,'z');                   // east side
  A.frameFns.push(function(){                      // a neighbour is hidden while the camera is behind or inside it, so it never blocks the view
    const c=A.camera.position; blocks.forEach(function(b){b.g.visible=A.sunReal||(b.axis==='x'?c.x<b.face-1.5:c.z>b.face+1.5);});
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
    m4.compose(v.set(x,y,z),q.setFromEuler(e.set(rx||0,ry||0,0,'YXZ')),one); nm.getNormalMatrix(m4);
    for(let k=0;k<P.count;k++){
      v.fromBufferAttribute(P,k).applyMatrix4(m4); b.p.push(v.x,v.y,v.z);
      v.fromBufferAttribute(N,k).applyMatrix3(nm); b.n.push(v.x,v.y,v.z);
      b.u.push(U?U.getX(k):0,U?U.getY(k):0);
    }
    if(I) for(let k=0;k<I.count;k++) b.i.push(base+I.getX(k)); else for(let k=0;k<P.count;k++) b.i.push(base+k);
  }
  const api={
    geo:add,
    box:function(w,h,d,c,x,y,z,ry,rx){add(new THREE.BoxGeometry(w,h,d),c,x,y,z,ry,rx);},
    cyl:function(r,h,c,x,y,z,seg,rTop,ry,rx){add(new THREE.CylinderGeometry(rTop==null?r:rTop,r,h,seg||10),c,x,y,z,ry,rx);},
    sph:function(r,c,x,y,z,sx,sy,sz){const g=new THREE.SphereGeometry(r,10,7); if(sx) g.scale(sx,sy,sz); add(g,c,x,y,z);},
    at:function(ox,oy,oz,o){                    // the same three, in the frame of a piece that stands at ox,oz and is turned by o
      o=o||0; const cs=Math.cos(o), sn=Math.sin(o), X=function(x,z){return ox+x*cs+z*sn;}, Z=function(x,z){return oz-x*sn+z*cs;};
      return {box:function(w,h,d,c,x,y,z,ry,rx){api.box(w,h,d,c,X(x,z),oy+y,Z(x,z),o+(ry||0),rx);},
              cyl:function(r,h,c,x,y,z,seg,rTop,ry,rx){api.cyl(r,h,c,X(x,z),oy+y,Z(x,z),seg,rTop,o+(ry||0),rx);},
              sph:function(r,c,x,y,z,sx,sy,sz){api.sph(r,c,X(x,z),oy+y,Z(x,z),sx,sy,sz);}};
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
  const WELL=1.6, TZ=8.6, U=0.68, RY=U-0.13, KZ=18.55, RW=7, ZF=42, FW=ZC-L, TOP=12.6, BRW=1.3, SQ=19.5;      // width of the sunken strip; where the garden drops; street level, road level; kerb; width of the road; far edge; length and height of our front
  const BX=[ZC-ZO,ZC-Z2];                              // the two bridges, along the front
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

  /* ---------- ground: the terrace by the building, the square, the kerb, Haroe St with its zebra crossing, Moshe Sharet St running off opposite ---------- */
  const pave=tex(256,256,function(g){
    const r=A.rng(44), cs=['#8c6455','#7f5a4e','#96705f','#84675c','#8f7a6e','#77564b'];
    g.fillStyle='#6a4f45'; g.fillRect(0,0,256,256);
    for(let j=0;j<16;j++) for(let i=-1;i<8;i++){g.fillStyle=cs[Math.floor(r()*cs.length)]; g.fillRect(i*32+(j%2?16:0)+1,j*16+1,30,14);}
  },true), paveM=A.MT(pave,null,true);
  B.box(FW,-GY,TZ-WELL,stone,FW/2,GY/2,(WELL+TZ)/2); flat(0,FW,WELL,TZ,0.004,paveM,1.6);              // the lower terrace is solid ground: its edge is the retaining wall of the sunken strip
  B.box(SQ+19,U-GY,KZ-TZ,stone,(SQ-19)/2,(GY+U)/2,(TZ+KZ)/2); flat(-19,SQ,TZ,KZ-0.16,U+0.004,paveM,1.6);      // the square, at street level
  B.box(50-SQ,U-GY,KZ-16,stone,(SQ+50)/2,(GY+U)/2,(16+KZ)/2); flat(SQ,50,16,KZ-0.16,U+0.004,paveM,1.6);        // and the pavement on past number 8
  B.box(69,RY-GY,ZF-KZ,0x5d6164,15.5,(GY+RY)/2,(KZ+ZF)/2);                                            // asphalt
  B.box(FW,0.04,WELL,0xbdb6a6,FW/2,GY+0.02,WELL/2);                                                   // floor of the sunken strip
  [[-19,-1.7],[3.9,50]].forEach(function(q){                                                          // far pavement, either side of Moshe Sharet St
    B.box(q[1]-q[0],0.13,ZF-KZ-RW,stone,(q[0]+q[1])/2,RY+0.065,(KZ+RW+ZF)/2); flat(q[0],q[1],KZ+RW+0.16,29.05,U+0.004,paveM,1.6);});
  for(let x=-7.5;x<22.5;x+=0.5){const red=x>=3&&x<11, odd=Math.round(x*2)%2;                          // painted kerb: red and white by the crossing, blue and white where you may park
    B.box(0.5,0.14,0.16,odd?(red?0xc23a34:0x3a62b0):0xf1f1ec,x+0.25,U-0.062,KZ-0.07);}
  for(let k=0;k<7;k++) B.box(3.2,0.012,0.5,0xeeeeea,7.1,RY+0.006,KZ+0.6+k);
  B.box(1.6,0.012,0.6,0xd9b93a,7.1,U+0.01,KZ-0.5); B.box(0.6,0.012,3.2,0xd9b93a,7.1,U+0.01,KZ-2.4);  // tactile strip leading in from the crossing
  const shade=tex(256,256,function(g){const r=A.rng(77);                                              // the square lies in dappled shade all day
    for(let i=0;i<80;i++){const x=r()*256, y=r()*256, q=10+r()*26, gr=g.createRadialGradient(x,y,0,x,y,q);
      gr.addColorStop(0,'rgba(18,28,20,0.32)'); gr.addColorStop(1,'rgba(18,28,20,0)'); g.fillStyle=gr; g.fillRect(x-q,y-q,2*q,2*q);}},true);
  const shadeM=new THREE.MeshBasicMaterial({map:shade,transparent:true,depthWrite:false});
  flat(0,FW,WELL,TZ,0.02,shadeM,18).renderOrder=1; flat(0,20,TZ,KZ-0.16,U+0.02,shadeM,18).renderOrder=1;

  /* ---------- the two entrances: a bridge over the sunken strip to an open doorway ---------- */
  const wrail=0xefefea;
  BX.forEach(function(bx){
    B.box(BRW,0.22,WELL+0.1,0xc9c4b8,bx,-0.107,WELL/2);                           // a narrow concrete slab with kerbs, white zig-zag railings
    [-1,1].forEach(function(s){const x=bx+s*(BRW/2-0.06);
      B.box(0.12,0.14,WELL+0.1,0xc9c4b8,x,0.07,WELL/2);
      B.box(0.045,0.045,WELL,wrail,x,1.02,WELL/2); B.box(0.035,0.035,WELL,wrail,x,0.2,WELL/2);
      for(let z=0.05,k=0;z<WELL+0.01;z+=0.2,k++){B.box(0.02,0.82,0.02,wrail,x,0.61,z); if(z+0.2<WELL+0.05) B.box(0.016,0.85,0.016,wrail,x,0.61,z+0.1,0,(k%2?1:-1)*0.235);}});
  });
  for(let i=0;i<7;i++){const x=[1.95,3.0,4.3,5.6,9.3,10.6,11.7][i], u=B.at(x,GY,0.42,0);                  // air conditioners crowding the sunken strip
    u.box(0.82,0.58,0.3,0xeeeeea,0,0.34,0); u.cyl(0.2,0.012,0x3b3f42,0.12,0.36,0.155,18,null,0,R/2); u.box(0.82,0.05,0.34,0xd9d9d4,0,0.05,0);}
  function fence(x0,z0,x1,z1,y,h,c,hoops){            // iron fence between two points: rails, bars, a post at each end, hoops on top for the municipal kind
    const len=Math.hypot(x1-x0,z1-z0), a=Math.atan2(x1-x0,z1-z0), f=B.at(x0,y,z0,a);
    f.box(0.03,0.03,len,c,0,h,len/2); f.box(0.03,0.03,len,c,0,0.1,len/2);
    for(let d=0.07;d<len;d+=0.14) f.box(0.014,h-0.1,0.014,c,0,(h+0.1)/2,d);
    f.box(0.05,h+0.06,0.05,c,0,(h+0.06)/2,0); f.box(0.05,h+0.06,0.05,c,0,(h+0.06)/2,len);
    if(hoops) for(let d=0.4;d<len-0.3;d+=0.8) B.geo(new THREE.TorusGeometry(0.2,0.012,4,10,R),c,x0+Math.sin(a)*d,y+h,z0+Math.cos(a)*d,a+R/2);
  }
  fence(BX[0]+BRW/2+0.05,WELL+0.1,BX[1]-BRW/2-0.05,WELL+0.1,0,0.95,wrail); fence(BX[1]+BRW/2+0.05,WELL+0.1,FW-0.1,WELL+0.1,0,0.95,wrail);      // along the edge of the sunken strip
  fence(FW-0.1,WELL+0.1,FW-0.1,TZ-0.1,0,0.95,wrail);                                                                                                  // and where the terrace ends above the yard

  /* ---------- where the garden drops: a low retaining wall across the square, and two flights of four steps ---------- */
  const FL=[[2.2,3],[BX[1]+0.75,3]];                         // the flights: centre and width. The left one is on our way in, the right one leads to the second bridge
  FL.forEach(function(q){
    for(let i=1;i<=3;i++) B.box(q[1],U-0.17*i,0.3,0xcfc8b8,q[0],(U-0.17*i)/2,TZ-0.3*i+0.15);
    [-1,1].forEach(function(s){const x=q[0]+s*(q[1]/2+0.09);                      // a plastered block either side, handrail on top
      B.box(0.18,U+0.1,1.0,0xf0eee8,x,(U+0.1)/2,TZ-0.5);
      B.box(0.04,0.04,1.06,iron,x,U+0.645,TZ-0.45,0,-Math.atan2(0.51,0.9)); B.box(0.03,0.8,0.03,iron,x,U+0.5,TZ-0.05); B.box(0.03,0.32,0.03,iron,x,U+0.26,TZ-0.85);});
  });
  fence(FL[0][0]+1.7,TZ+0.1,FL[1][0]-1.7,TZ+0.1,U,0.95,iron); fence(FL[1][0]+1.7,TZ+0.1,SQ-0.1,TZ+0.1,U,0.95,iron); fence(SQ-0.1,TZ+0.1,SQ-0.1,11.4,U,0.95,iron);      // railing along the top of the wall

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
  bed(1.9,BX[1]-BRW/2-0.2,WELL+0.3,3.4,0.32,0); bed(BX[1]+BRW/2+0.2,FW-0.2,WELL+0.3,3.4,0.32,0);      // along the building, clear of the two bridges
  [[2.45,2.55,0.42],[3.15,2.95,0.32],[2.85,2.2,0.26]].forEach(function(q){B.sph(q[2],0x8f8c86,q[0],0.3+q[2]*0.55,q[1],1.15,0.8,0.9);});      // boulders, near our bridge
  for(let i=0;i<4;i++) shrub(4.2+i*0.7,2.3+(i%3)*0.36,0.3+rnd()*0.2,leaf[i%3],0.3);
  palm(9.6,2.65,0.45,0.9,0.3); palm(10.7,2.5,1.3,0.7,0.3); for(let i=0;i<2;i++) shrub(11.4+i*0.5,2.3+(i%3)*0.36,0.3+rnd()*0.2,leaf[(i+1)%3],0.3);
  bed(4,FL[1][0]-1.75,TZ+0.25,TZ+1.1,0.28,U); bed(FL[1][0]+1.75,SQ-0.2,TZ+0.25,TZ+1.1,0.28,U);          // and a hedge behind the railing where the garden drops
  for(let i=0;i<4;i++) shrub(4.45+i*0.62,TZ+0.68,0.34,leaf[i%3],U+0.26); for(let i=0;i<10;i++) shrub(FL[1][0]+2.15+i*0.8,TZ+0.68,0.34,leaf[(i+2)%3],U+0.26);
  B.cyl(1.15,0.36,0xb9ab90,7,0.18,6,20); B.cyl(0.98,0.02,0x4d4334,7,0.37,6,20);                      // round bed in the middle of the terrace
  shrub(7,6,0.42,leaf[0],0.36); for(let i=0;i<7;i++){const a=i*0.9; B.sph(0.11,i%2?0xf3f0e8:0xe8c44a,7+Math.sin(a)*0.68,0.45,6+Math.cos(a)*0.68);}
  ficus(3.6,6.2,1.0,0.4,0,true); ficus(10.6,6.4,0.9,1.2,0,true); ficus(17.4,14.15,0.95,2.0,U);

  /* ---------- the café of number 12, spilling onto the square ---------- */
  const gingham=function(col){return A.MT(tex(64,64,function(g){g.fillStyle='#f6f3ec'; g.fillRect(0,0,64,64); g.globalAlpha=0.55; g.fillStyle=col; for(let i=0;i<8;i+=2){g.fillRect(i*8,0,8,64); g.fillRect(0,i*8,64,8);}},true),null,true);};
  const cloths=[gingham('#c8323a'),gingham('#2f7d57')];
  function chair(x,z,o){const c=B.at(x,U,z,o);                                     // bistro chair, facing its local +z
    c.box(0.42,0.04,0.42,0xe8e1cf,0,0.45,0); c.box(0.42,0.34,0.03,0xe8e1cf,0,0.72,-0.2);
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){c.box(0.03,q[1]<0?0.9:0.45,0.03,0xb58c5a,q[0]*0.19,q[1]<0?0.45:0.225,q[1]*0.19);});}
  function table(x,z,k,n){                                                         // a small table under a checked cloth, with n chairs round it
    const g=new THREE.BoxGeometry(0.8,0.24,0.8), u=g.attributes.uv; for(let i=0;i<24;i++) if(i<8||i>=16) u.setY(i,u.getY(i)*0.3);      // keep the checks square where the cloth hangs down
    B.geo(g,cloths[k%2],x,U+0.63,z); B.cyl(0.035,0.5,iron,x,U+0.26,z,6); B.cyl(0.22,0.03,iron,x,U+0.015,z,10);
    for(let i=0;i<n;i++){const a=i*2*R/n+(k%2?R/2:0); chair(x+Math.sin(a)*0.66,z+Math.cos(a)*0.66,a+R);}
  }
  function umbrella(x,z,s){                                                        // big square parasol on a timber post
    B.box(0.5,0.25,0.5,0x8f8f8a,x,U+0.125,z); B.box(0.09,2.75,0.09,0x9a7b55,x,U+1.4,z);
    const g=new THREE.ConeGeometry(s*0.7071,0.7,4).toNonIndexed(); g.computeVertexNormals(); B.geo(g,0xe9e4d6,x,U+2.72,z,R/4);
    [[0,1],[1,0],[0,-1],[-1,0]].forEach(function(q){B.box(q[0]?0.02:s,0.2,q[0]?s:0.02,0xe2dccb,x+q[0]*s/2,U+2.28,z+q[1]*s/2);});
  }
  umbrella(2.4,13.1,3.6); umbrella(5.8,14.5,3.2);
  [[1.45,12.2,2],[3.35,12.2,3],[1.45,14,2],[3.35,14,4],[5,13.9,2],[6.6,13.9,2],[5.8,15.35,3],[5.3,11.3,2]].forEach(function(q,i){table(q[0],q[1],i,q[2]);});
  [0.95,2.35,3.75].forEach(function(x){B.box(1.25,0.45,0.45,0xf1efe8,x,U+0.225,17.55); B.sph(0.42,leaf[0],x-0.3,U+0.72,17.55,1,0.8,0.6); B.sph(0.42,leaf[1],x+0.3,U+0.74,17.55,1,0.8,0.6);});      // hedge in white boxes along the pavement
  B.cyl(0.22,0.6,0xe6dfcd,0.6,U+0.3,16.75,12,0.34); B.sph(0.4,0x6d4a5c,0.6,U+0.85,16.75,1,0.8,1); B.sph(0.25,0x7a9a4a,0.75,U+1.0,16.65);      // big pot of coleus by the corner
  (function(){const c=B.at(9.2,U,13.85,-R/2), w=0xe9ebeb;                         // the evaporative cooler on its castors, blowing at the tables
    c.box(0.78,0.36,0.52,w,0,0.26,0); c.box(0.74,0.85,0.48,w,0,0.86,0); c.box(0.78,0.1,0.52,0xdfe2e3,0,1.33,0);
    c.box(0.6,0.62,0.02,0xbfc4c6,0,0.9,0.245); for(let i=0;i<7;i++) c.box(0.6,0.02,0.03,0x8e9598,0,0.64+i*0.085,0.255);
    c.box(0.02,0.6,0.36,0xbfc4c6,0.375,0.9,0); c.box(0.16,0.02,0.1,0x2c3a55,-0.2,1.385,0.1);
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){c.cyl(0.04,0.05,iron,q[0]*0.33,0.04,q[1]*0.2,6,null,0,R/2);});
  })();
  B.box(1.0,0.5,0.5,0xa39c92,10.25,U+0.25,14.9); shrub(10,14.9,0.26,leaf[1],U+0.45); B.sph(0.1,0xe8a04a,10.45,U+0.66,14.85); B.sph(0.1,0xf3f0e8,10.25,U+0.7,15);      // brick planter with flowers
  [[10.95,15.95],[11.45,15.05]].forEach(function(q){B.cyl(0.16,0.4,0xd9cdb4,q[0],U+0.2,q[1],10,0.22); palm(q[0],q[1],0.2,0.55,U+0.4,9);});

  /* ---------- street furniture ---------- */
  function sign(t,w,h,x,y,z,o,round,parent){            // a sign plate: a drawing on the face, grey behind
    const m=new THREE.Mesh(round?new THREE.CircleGeometry(w/2,24):new THREE.PlaneGeometry(w,h),A.MT(t));
    m.position.set(x+Math.sin(o)*0.012,y,z+Math.cos(o)*0.012); m.rotation.y=o; (parent||st).add(m);
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
  bench(5.2,0,3.95,0); bench(8.6,0,7.9,R); bench(12,U,15.45,-R/2);
  B.cyl(0.24,0.8,0x1f4a36,11.1,U+0.4,17.65,12,0.27); B.cyl(0.29,0.12,0x183b2b,11.1,U+0.86,17.65,12,0.2); B.box(0.16,0.16,0.01,0xe8c91a,11.1,U+0.5,17.925);      // municipal bin
  function cabinet(x,z,o){const c=B.at(x,U,z,o); c.box(0.85,0.12,0.34,0x8f9492,0,0.06,0); c.box(0.85,1.3,0.32,0xb9bdbc,0,0.77,0); c.box(0.01,1.2,0.01,0x7d8280,0,0.77,0.162);}      // grey utility cabinet
  cabinet(0.22,10.6,R/2); cabinet(0.22,11.6,R/2); cabinet(12,17.9,0);
  const glow=A.lampMat('L:street',0xeeebe0,0xffe7bd,0.95), bulb=A.lampMat('L:street',0xf3eedc,0xffd28a,1);
  [[0.45,5.2,0],[11.7,4.4,0],[12.2,10.5,U]].forEach(function(q){                                               // globe lamps on green poles
    B.cyl(0.045,3.0,green,q[0],q[2]+1.5,q[1],8); B.sph(0.2,glow,q[0],q[2]+3.15,q[1]); A.pool('L:street',0xffd9a0,q[0],q[2]+0.03,q[1],4.2,st,0.42);});
  (function(){                                                                                                 // a string of bulbs from the building over the tables to the sign post
    const pts=[[0,U+3.5,11],[2.4,U+3.12,13.1],[5.8,U+3.12,14.5],[10.4,U+2.9,13.75]], line=[];
    for(let i=0;i<pts.length-1;i++){const a=pts[i], b=pts[i+1], n=Math.round(Math.hypot(b[0]-a[0],b[2]-a[2])/0.45);
      for(let k=0;k<=n;k++){const t=k/n, p=new THREE.Vector3(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t-0.3*4*t*(1-t),a[2]+(b[2]-a[2])*t); line.push(p); if(k&&k<n) B.sph(0.035,bulb,p.x,p.y-0.04,p.z);}}
    st.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(line),new THREE.LineBasicMaterial({color:iron})));
    A.pool('L:street',0xffd9a0,4,U+0.03,13.5,5.5,st,0.4);
  })();

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
    const m=new THREE.Mesh(new THREE.CircleGeometry(0.6,28),A.MT(t)); m.position.set(x,y+Math.sin(lean)*0.113,z+Math.cos(lean)*0.113); m.rotation.x=-lean; st.add(m);
  })();
  (function(){const b=B.at(18.6,U,17.85,0);                                           // old municipal notice board under a little green roof
    b.box(0.08,1.9,0.08,0x5f6466,-0.6,0.95,0); b.box(0.08,1.9,0.08,0x5f6466,0.6,0.95,0); b.box(1.3,1.1,0.06,0xd98a2b,0,1.3,0); b.box(1.5,0.06,0.34,0x2f7d4f,0,1.95,0);
    [[-0.35,1.5,0xf3ebdc],[0.1,1.35,0x9fc4d6],[0.4,1.6,0xf0d21c],[-0.2,1.0,0xfbfaf6]].forEach(function(q){b.box(0.26,0.34,0.01,q[2],q[0],q[1],0.036);});})();

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
  const n12=house(-12,0,0,16.05,['+x','+z'],function(c){return c.x<1.5||c.z<0.4;});      // number 12 and the wing behind it close the left side of the square; seen only from the street side
  (function(){const b=n12.b, g=n12.g;
    const aw=tex(16,8,function(c){c.fillStyle='#f4f2ea'; c.fillRect(0,0,16,8); c.fillStyle='#2c5a43'; c.fillRect(0,0,8,8);},true); aw.repeat.set(14,1);
    b.geo(new THREE.BoxGeometry(6.8,0.03,2.0),A.MT(aw,null,true),-4.1,U+2.85,17,0,0.35); b.box(6.8,0.2,0.02,0xf4f2ea,-4.1,U+2.42,17.95);      // striped awning over the café front
    b.box(0.55,3.2,0.55,0xd8ccb2,-0.3,U+1.6,16.33);                                        // brick-clad corner column with the house number
    sign(plate('12'),0.3,0.3,-0.3,U+2.5,16.61,0,false,g); sign(plate('12'),0.3,0.3,-0.02,U+2.5,16.33,R/2,false,g);
    const fl=tex(128,96,function(c){c.fillStyle='#fff'; c.fillRect(0,0,128,96); c.fillStyle='#2a4fb0'; c.fillRect(0,10,128,12); c.fillRect(0,74,128,12);
      c.strokeStyle='#2a4fb0'; c.lineWidth=4; [1,-1].forEach(function(s){c.beginPath(); c.moveTo(64,48-s*20); c.lineTo(64+17,48+s*10); c.lineTo(64-17,48+s*10); c.closePath(); c.stroke();});});
    const fm=A.MT(fl); fm.side=THREE.DoubleSide;
    [[-0.3,16.6],[-1.9,16.05]].forEach(function(q){                                        // two flags on poles off the front
      b.cyl(0.015,1.9,0xd9d9d2,q[0],U+3.3+0.59,q[1]+0.74,6,null,0,0.9);
      const m=panel(1.0,0.72,fm,q[0],U+3.72,q[1]+1.0,R/2,g); m.rotation.set(-0.55,R/2,0);});
    [[8.05,4.3],[12.15,4.3],[9.95,7.6],[13.85,10.8]].forEach(function(q){b.box(0.3,0.5,0.8,0xe6e8e6,0.16,U+q[1],q[0]);});      // air conditioners on the flank
  })();
  house(-17.5,-1.7,29.05,39.55,['-z','+x'],function(c){return c.z>27.5;}).b.done(); house(3.9,28.5,29.05,39.55,['-z','-x'],function(c){return c.z>27.5;}).b.done();      // across the street
  house(SQ+0.5,38,8.9,16,['-x','+z','-z'],function(c){return c.x>SQ&&c.x<38.5&&c.z>8.4&&c.z<16.5;}).b.done();     // and number 8 closes the right, its back across the yard from our windows
  n12.b.done();

  /* ---------- our own street front ----------
     Drawn only for someone standing outside at street level: from higher up you look straight into the lobby, as on every other side. */
  const gt=tex(2048,256,function(g){
    const X=function(x){return x/FW*2048;}, Y=function(y){return 256-y/H*256;};
    const rc=function(x0,x1,y0,y1,c){g.fillStyle=c; g.fillRect(X(x0),Y(y1),X(x1)-X(x0),Y(y0)-Y(y1));};
    rc(0,FW,0,H,'#ebe6d8'); rc(0,FW,0,0.45,'#d9d2c0'); rc(0,FW,H-0.22,H,'#d6cfbd');                          // plaster, a plinth, the edge of the floor above
    const win=function(x,w){rc(x-0.07,x+w+0.07,0.93,2.32,'#cfc8b6'); rc(x,x+w,1.0,2.25,'#f6f5f0'); for(let y=1.04;y<2.24;y+=0.075) rc(x,x+w,y,y+0.014,'#c6c9c4'); rc(x+w/2-0.02,x+w/2+0.02,1.0,2.25,'#e6e6e0');};      // window behind closed white shutters
    const screen=function(x,w){rc(x,x+w,0.75,2.5,'#7f8b8d'); for(let u=x;u<x+w+0.01;u+=0.14) rc(u-0.012,u+0.012,0.75,2.5,'#e3dfd2'); for(let y=0.75;y<2.51;y+=0.14) rc(x,x+w,y-0.012,y+0.012,'#e3dfd2');};      // lattice that hides the washing
    win(2.4,1.5); screen(4.3,1.4); win(9.2,1.5); rc(11.0,11.5,1.6,2.2,'#6f7d84');
    BX.forEach(function(bx){rc(bx-0.9,bx+0.9,0,H,'#f3f1ea');});                                              // smooth render round each doorway
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
    if(i===0){panel(0.5,0.19,A.MT(hs),bx-0.1,2.72,0.045,0,fac);                            // the brass street sign over our doorway,
      const gt=B.at(bx+BRW/2+0.02,0,0.06,0.55), w=0xf0efe9;                                  // and the old white grille gate, bent open and left leaning out
      [0.25,1.2,2.15].forEach(function(y){gt.box(0.9,0.035,0.035,w,0.45,y,0);});
      for(let x=0.02;x<0.92;x+=0.11) gt.box(0.02,2.25,0.02,w,x,1.18,0,0,0.05);}
    else F.box(0.12,0.2,0.1,lantern,bx+0.75,2.05,0.2);
  });
  panel(1.5,TOP-0.8-3.0,swM,ZC-(L+EH)/2,(3.0+TOP-0.8)/2,0.05,0,fac);                       // glazing up the front where the stairs are
  B.done(); C.done(); F.done();
  A.streetView=[st.localToWorld(new THREE.Vector3(8.6,3.1,KZ+RW-0.6)),st.localToWorld(new THREE.Vector3(5.5,0.7,WELL))];      // standing across Haroe St, looking at the two entrances
  /* Sims mode can walk out here: where the ground is (in this frame, turned into the model's), what stands in the way,
     and how high the ground is: the bridges and terrace at the lobby's level, the steps, the square, the road */
  const wr=function(q){return [XF+q[2],XF+q[3],ZC-q[1],ZC-q[0]];};
  A.rooms.street.rs=[[BX[0]-0.5,BX[0]+0.5,-0.2,3.75],[BX[1]-0.5,BX[1]+0.5,-0.2,3.75],[0.2,FW-0.25,3.55,TZ-0.75],
    [FL[0][0]-1.35,FL[0][0]+1.35,TZ-1.05,TZ+0.45],[FL[1][0]-1.35,FL[1][0]+1.35,TZ-1.05,TZ+0.45],
    [0.15,SQ-0.2,TZ+0.25,KZ-0.2],[-3.5,0.4,16.2,KZ-0.2],[SQ-0.6,30,15.9,KZ-0.2],[5.5,8.7,KZ-0.6,KZ+RW+0.6],[3.9,26,KZ+RW+0.1,28.8]].map(wr);
  A.streetBlock=[[1.9,BX[1]-BRW/2-0.2,WELL+0.3,3.4],[BX[1]+BRW/2+0.2,FW-0.2,WELL+0.3,3.4],[4.3,6.1,3.6,4.15],[7.7,9.5,7.6,8.25],[5.8,8.2,4.8,7.2],
    [2.85,4.35,5.45,6.95],[9.85,11.35,5.65,7.15],[0.3,0.6,5.05,5.35],[11.55,11.85,4.25,4.55],[4,FL[1][0]-1.75,TZ+0.25,TZ+1.1],[FL[1][0]+1.75,SQ-0.2,TZ+0.25,TZ+1.1],
    [0.5,7.3,10.55,16.05],[0.3,4.4,17.3,17.8],[0.3,0.9,16.45,17.05],[0,0.45,10.15,12.05],[11.55,12.45,17.7,18.1],[8.85,9.55,13.4,14.3],[9.7,10.8,14.6,15.2],[10.75,11.65,14.85,16.15],
    [10.3,10.5,13.65,13.85],[2.1,2.3,17.95,18.15],[4.5,4.7,17.9,18.1],[5.15,5.45,18.0,18.3],[8.75,9.05,18.0,18.3],[10.15,10.45,18.0,18.3],[10.8,11.4,17.35,17.95],
    [11.7,12.2,14.55,16.35],[12.05,12.35,10.35,10.65],[12.4,19.0,11.45,17.95],[17.9,19.3,17.75,17.95]].map(wr);
  A.streetPass=[[XF-0.4,XF+0.4,ZO-0.45,ZO+0.45],[XF-0.4,XF+0.4,Z2-0.45,Z2+0.45]];
  A.groundAt=function(x,z){
    if(x<XF-0.05) return 0; const q=x-XF;
    if(q<TZ-0.9) return 0; if(q<TZ) return U*(q-TZ+0.9)/0.9; if(q<KZ) return U; if(q<KZ+RW) return RY; return U;
  };
  const tags=[['Bridge to the street'
,BX[0],1.5,WELL/2],['Second bridge',BX[1],1.5,WELL/2],['Steps down into the garden',FL[0][0],U+1.3,TZ-0.4],['Café',4,U+3.4,13.5],['Haroe St',12,U+0.6,KZ+3.5]]
    .map(function(q){return {el:A.tag(q[0]),pos:st.localToWorld(new THREE.Vector3(q[1],q[2],q[3]))};});
  A.labelFns.push(function(){const show=A.state.labels&&!A.simsOn; tags.forEach(function(t){A.place(t.el,t.pos,show);});});
  const lc=new THREE.Vector3(); let crowns=true;
  A.frameFns.push(function(){
    const c=st.worldToLocal(lc.copy(A.camera.position)), low=c.y<5.2;      // where the camera is, in the street's own frame
    fac.visible=low&&c.z>0.4&&!(A.simsOn&&!A.eyeView());
    const solid=low||c.z<0;                            // the tree crowns thin to a ghost when the camera is above the square, so they never hide it
    if(solid!==crowns){crowns=solid; can.children.forEach(function(m){m.material.transparent=!solid; m.material.opacity=solid?1:0.22; m.material.depthWrite=solid;});}
    far.forEach(function(b){b.g.visible=!b.hide(c);});
    const eve=A.goal('day')<0.5?0.6:0; if(A.goal('L:street')!==eve) A.set('L:street',eve);      // street lamps and the café's bulbs come on in the evening
  });
});
})();
