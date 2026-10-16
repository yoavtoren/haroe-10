/* Haroe 10 — outside the flat: the lobby and its stairs, the yard one floor down, the neighbouring building, and on the
   street side the two entrance bridges, the square with the café, and Haroe St.
   Compass, from the satellite view: +x is north (4.6° west of it), toward the garden and Haroe St; +z is east, the way the lobby
   runs from our door toward number 12; the bedrooms' end of the flat faces west, onto Beit HaChayal. */
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
   Flats 2 and 6 open off the corridor, one on each side; flat 1 has its own door outside, at the east end (the plan in plan.js). */
const LB=A.LB, XL=LB.XL, CX0=LB.CX0, CX1=LB.CX1, RZ=LB.RZ, SD=LB.SD, SU=LB.SU, SW=LB.SW, D4=LB.D4, VW=LB.VW, EH=LB.EH, BZ=LB.BZ, ZE=LB.ZE, ZC=LB.ZC, XF=LB.XF, XE=LB.XE, ZO=LB.ZO, Z2=LB.Z2, Z2N=Z2+1.15, XS=A.PLAN.front, PZ=ZC-1.85;      // XS: the street front, flat 6's face; PZ: the passage's side along flat 6, in line with the doorway's right jamb
const CL=1.47;                                                   // height of the stone cladding
const PX0=CX0-0.85, PX1=CX0+0.28, PZ0=RZ-0.12, PZ1=RZ+0.5;          // the pillar: over a metre wide, it stands a little out into the corridor's mouth and well across the landing's back
/* the stairs, from the photos: three flights a floor round an open well, each SW wide. The first climbs along the wall beside our door
   (six risers) to a corner landing against the far wall; the second runs across, along the far wall (five), to a second corner landing;
   the third comes back along the corridor's end (five) and arrives on the floor above at XD, nearly a metre out from the pillar, so the
   way from the corridor to the doors is wide. From our own floor the same third flight goes on down, under the white railing. */
const FF=H+0.24, TD=0.26, NT1=5, NT2=4, NT3=4, X1=SU+NT1*TD, XD=X1-NT3*TD, LO=GY, XB=0.0;      // floor to floor; a tread; the flights' treads; where the first flight ends and the third arrives; the lower floor; the back of the landings above and below
const UPS=3, TOPW=UPS*FF+H;          // floors above ours; the top of the stairwell's walls
A.LB.stairs={FF:FF,TD:TD,SW:SW,X1:X1,XD:XD,NT:[NT1,NT2,NT3],XB:XB,LO:LO,UPS:UPS};
const terrazzo=canvasTex(256,256,function(g){          // the floor: speckled beige cement tiles, 20 cm
  g.fillStyle='#cfc09a'; g.fillRect(0,0,256,256); const r=A.rng(21), cs=['#a08f6c','#e8dfc4','#857a5c','#bcab84','#93845f','#efe7d2','#6f6450','#c9b88e'];
  for(let i=0;i<3200;i++){g.fillStyle=cs[Math.floor(r()*cs.length)]; g.fillRect(r()*256,r()*256,1+r()*2.2,1+r()*2);}
  for(let j=0;j<4;j++) for(let i=0;i<4;i++){g.fillStyle='rgba(110,95,60,'+(r()*0.09)+')'; g.fillRect(i*64,j*64,64,64);}
  for(let i=0;i<10;i++){const x=r()*256, y=r()*256, q=10+r()*30, gr=g.createRadialGradient(x,y,0,x,y,q); gr.addColorStop(0,'rgba(80,60,35,0.12)'); gr.addColorStop(1,'rgba(80,60,35,0)'); g.fillStyle=gr; g.fillRect(x-q,y-q,2*q,2*q);}      // worn and stained
  g.strokeStyle='#9c927d'; g.lineWidth=2; for(let k=0;k<=4;k++){g.beginPath(); g.moveTo(k*64,0); g.lineTo(k*64,256); g.stroke(); g.beginPath(); g.moveTo(0,k*64); g.lineTo(256,k*64); g.stroke();}
});
terrazzo.wrapS=terrazzo.wrapT=THREE.RepeatWrapping;
const ashlar=canvasTex(512,256,function(g){           // the cladding, from the photos: polished beige limestone, 60 by 30 cm slabs in courses, the joints barely there; 1.2 m by 0.6 m
  const r=A.rng(5); g.fillStyle='#ab9b7e'; g.fillRect(0,0,512,256);
  for(let row=0;row<2;row++){const y=row*128, off=row?128:0;
    for(let c=-1;c<3;c++){const x=c*256+off, w=256, t=r(), k=r(), tan=r()<0.22;
      g.fillStyle='rgb('+Math.round((tan?196:206)+t*16)+','+Math.round((tan?174:188)+t*14-k*6)+','+Math.round((tan?132:148)+t*14-k*12)+')'; g.fillRect(x+1.5,y+1.5,w-3,125);      // each slab its own: cream, beige, a few gone tan
      for(let i=0;i<7;i++){const cx=x+r()*w, cy=y+r()*128, q=40+r()*110, gr=g.createRadialGradient(cx,cy,0,cx,cy,q), dark=r()<0.55;      // broad clouds in the stone
        gr.addColorStop(0,dark?'rgba(140,100,60,0.1)':'rgba(255,248,230,0.14)'); gr.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=gr; g.fillRect(cx-q,cy-q,2*q,2*q);}
      for(let i=0;i<320;i++){g.fillStyle=r()<0.5?'rgba(110,85,50,0.1)':'rgba(255,255,240,0.14)'; g.fillRect(x+r()*w,y+r()*128,1+r()*2,1);}      // its grain
      g.fillStyle='rgba(60,45,30,0.18)'; g.fillRect(x+1.5,y+123,w-3,3); g.fillStyle='rgba(255,250,240,0.2)'; g.fillRect(x+1.5,y+1.5,w-3,2);      // the joint's shadow under each slab, a light edge over it
      if(r()<0.45){g.strokeStyle='rgba(130,100,65,0.2)'; g.lineWidth=1; g.beginPath(); let vx=x+40+r()*(w-80), vy=y+2; g.moveTo(vx,vy); for(let j=0;j<5;j++){vx+=(r()-0.5)*34; vy+=25; g.lineTo(vx,vy);} g.stroke();}      // a vein
    }}
});
ashlar.wrapS=ashlar.wrapT=THREE.RepeatWrapping;
const plaster=canvasTex(256,128,function(g){          // white plaster above it, scuffed and stained here and there
  g.fillStyle='#f8f7f3'; g.fillRect(0,0,256,128); const r=A.rng(8);
  for(let i=0;i<5;i++){const x=r()*256, y=r()*128, q=20+r()*50, gr=g.createRadialGradient(x,y,0,x,y,q); gr.addColorStop(0,'rgba(205,185,135,'+(0.12+r()*0.16)+')'); gr.addColorStop(1,'rgba(205,185,135,0)'); g.fillStyle=gr; g.fillRect(x-q,y-q,2*q,2*q);}      // yellowed in patches
  for(let i=0;i<6;i++){const x=r()*256, y=r()*128, w=3+r()*9, h=2+r()*5; g.fillStyle='rgba(205,198,180,'+(0.2+r()*0.2)+')'; g.beginPath(); g.ellipse(x,y,w,h,r()*3,0,7); g.fill();}
  for(let i=0;i<16;i++){g.fillStyle='rgba(90,85,75,'+(0.08+r()*0.1)+')'; g.fillRect(r()*256,r()*128,1+r()*2,1+r()*2);}
});
plaster.wrapS=THREE.RepeatWrapping;
const peel=canvasTex(128,256,function(g){             // the pillar above its cladding: paint peeling in layers off old yellowed plaster
  g.fillStyle='#e2d3ae'; g.fillRect(0,0,128,256); const r=A.rng(33);
  for(let i=0;i<8;i++){const x=r()*128, y=r()*256, w=12+r()*28, h=14+r()*50;      // the paint gone in big patches: the plaster under it, white and grey
    g.fillStyle=['#f4f2ec','#d9d5cc','#efeadf','#c9c4b8'][i%4]; g.beginPath(); g.moveTo(x,y);
    for(let k=0;k<9;k++) g.lineTo(x+Math.cos(k*0.8)*w*(0.5+r()*0.6),y+Math.sin(k*0.8)*h*(0.5+r()*0.6)); g.closePath(); g.fill();
    g.strokeStyle='rgba(255,252,245,0.9)'; g.lineWidth=2; g.stroke(); g.strokeStyle='rgba(120,100,60,0.3)'; g.lineWidth=0.8; g.stroke();}      // the curled edge of the paint, and its shadow
  for(let i=0;i<60;i++){g.fillStyle='rgba(120,100,70,0.25)'; g.fillRect(r()*128,r()*256,1,2+r()*5);}
  for(let i=0;i<5;i++){let x=r()*128, y=r()*256; g.strokeStyle='rgba(90,75,50,0.35)'; g.lineWidth=0.8; g.beginPath(); g.moveTo(x,y); for(let k=0;k<6;k++){x+=(r()-0.5)*14; y+=8+r()*10; g.lineTo(x,y);} g.stroke();}      // cracks
});
const stepT=canvasTex(128,64,function(g){             // the treads: worn beige stone with a darker nosing
  const r=A.rng(41); g.fillStyle='#d4c4a0'; g.fillRect(0,0,128,64);
  for(let i=0;i<500;i++){g.fillStyle=r()>0.5?'rgba(150,130,95,0.25)':'rgba(255,250,235,0.35)'; g.fillRect(r()*128,r()*64,1+r()*2,1);}
  g.fillStyle='rgba(120,100,70,0.18)'; g.fillRect(0,26,128,12);});
const hallM=function(t){const m=new THREE.MeshLambertMaterial({map:t,emissive:0x4a4944}); m.emissiveMap=t; return A.reg(m,'hall');};
const hallP=function(t,sp,sh){const m=new THREE.MeshPhongMaterial({map:t,emissive:0x4a4944,emissiveMap:t,specular:sp||0x2e2d2a,shininess:sh||30}); return A.reg(m,'hall');};      // the same, polished: the cladding and the floor catch the light      // lit a little from within, like the flat's walls, so the white reads as white
const floorP=hallP(terrazzo,0x3a3934,50);
[[XL,SU,L,RZ],[CX0,SU,RZ,EH],[SU,SD,EH-SW,EH],[CX0,CX1,EH,ZE],[CX0,XF,ZE,ZC],[XF,XS,PZ,ZC]].forEach(function(q){const fq=A.floorQuad(q[0],q[1],q[2],q[3],terrazzo,0.8,'hall'); if(fq&&fq.material) fq.material=floorP;});      // the landing, the way past the pillar, the strip beside the well to the head of the flight down, the corridor, the hall, the passage; nothing over the well
function bright(m,glow){m.emissive.setHex(glow); A.rooms.hall.mats.forEach(function(e){if(e.m===m) e.e=new THREE.Color(glow);}); return m;}      // a ceiling lit from below reads as the white it is
[[XL,SU,L,RZ],[CX0,SU,RZ,EH],[CX0,CX1,EH,ZE],[CX0,XF,ZE,ZC],[XF,XS,PZ,ZC]].forEach(function(q){bright(A.ceil('hall',q[0],q[1],q[2],q[3]).material,0xa6a6a0);});
const en=D.entrance, XP=en[0]-0.1;                                                         // XP: our door frame's left edge
/* from the photos at the doors: flat 4's door is in a wall D4 in front of ours, so ours is set back in a recess that runs up to the ceiling,
   and the end of flat 4's wall, between the two doors, is the clad pier with the yellow notice */
/* the doors of the flats round ours, as the plan has them (plan.js); floors.js hangs their leaves */
const DOOR4=[-1.23-XL,-0.37-XL], DOOR3=[6.96-(L+D4),7.82-(L+D4)], DOOR2=[15.73-(RZ+0.5),16.59-(RZ+0.5)], DOOR6=[9.9-EH,10.76-EH];
wall('h_s4',[XL,L+D4],[XP,L+D4],[0,1],'hall',{holes:[DOOR4]});                           // flat 4's door
wall('h_s4r',[XP,L+D4],[XP,L],[1,0],'hall');                                              // the side of the recess
wall('h_s',[XP,L],[SU,L],[0,1],'hall',{holes:[[en[0]-XP,en[1]-XP]]});                     // our door, flat 5
wall('h_ss',[SU,L],[XE,L],[0,1],'hall',{h:TOPW});                                        // the stairwell rises to the top floor: the flights up and down run along here
wall('h_l3',[XL,L+D4],[XL,RZ],[1,0],'hall',{holes:[DOOR3]});                              // flat 3
wall('h_rz',[XL,RZ],[PX0,RZ],[0,-1],'hall');                                             // the back of the landing, up to the pillar
wall('h_cl',[CX0,PZ1],[CX0,ZC],[1,0],'hall',{holes:[DOOR2]});                           // corridor, left: vent screens; then the square hall: flat 2, the barred window
const GATE=A.LB.sideGate=[XF+0.35,XF+1.25];      // a side door out of the passage into the yard behind number 12, the way round to flat 1's own door on our floor
wall('h_n',[CX0,ZC],[XS,ZC],[0,-1],'hall',{holes:[[GATE[0]-CX0,GATE[1]-CX0]]});      // the letter boxes and the meter cupboards, and on along the passage: number 12's side
wall('h_f',[XF,ZE],[XF,ZC],[-1,0],'hall',{holes:[[PZ-ZE,ZC-ZE-0.002,H]]});              // the hall's front, open into the passage out to the street
wall('h_ps',[XF,PZ],[XS,PZ],[0,1],'hall');                                               // the passage's other side, along flat 6
wall('h_pf',[XS,PZ],[XS,ZC],[-1,0],'hall',{holes:[[ZO-0.65-PZ,ZO+0.65-PZ,2.5]]});       // and its end: the street front, with the open doorway to our bridge
wall('h_bn',[CX1,ZE],[XF,ZE],[0,1],'hall');                                              // the hall's side toward the corridor
wall('h_br',[CX1,EH],[CX1,ZE],[-1,0],'hall',{holes:[DOOR6]});                           // corridor, right: flat 6's door; it ends in a pier beside the railing
wall('h_cf',[XE,L],[XE,EH],[-1,0],'hall',{h:TOPW});                                      // the stairwell's far wall
wall('h_se',[XE,EH],[CX1,EH],[0,-1],'hall',{h:TOPW});                                    // and its side, behind the corridor's right wall
A.doorFrame('h_s',en[0]-XP,en[1]-XP); A.doorFrame('h_s4',DOOR4[0],DOOR4[1]); A.doorFrame('h_l3',DOOR3[0],DOOR3[1]); A.doorFrame('h_cl',DOOR2[0],DOOR2[1]); A.doorFrame('h_br',DOOR6[0],DOOR6[1]); A.doorFrame('h_n',GATE[0]-CX0,GATE[1]-CX0);
const HW=['h_s','h_s4','h_s4r','h_l3','h_rz','h_cl','h_n','h_f','h_ps','h_pf','h_bn','h_br'];
(function(){const u1=XS-XF-0.45, u0=u1-0.6;                                                        // a small window just inside the doorway, on the right: white frame, frosted glass, white bars
  rect('h_ps',u0-0.05,u1+0.05,1.28,1.92,0xf4f4f1,0.012); rect('h_ps',u0,u1,1.33,1.87,0xcfd6d2,0.014);
  for(let i=0;i<=5;i++) rect('h_ps',u0+i*0.12-0.01,u0+i*0.12+0.01,1.28,1.92,0xf4f4f1,0.016); rect('h_ps',u0-0.05,u1+0.05,1.59,1.61,0xf4f4f1,0.016);})();
A.rooms.hall.rs.push([XF-0.2,XS+0.02,PZ+0.02,ZC-0.02]);      // the passage is part of the lobby
function clad(k,u0,u1,y0,y1){const t=ashlar.clone(); t.needsUpdate=true; t.repeat.set((u1-u0)/1.2,(y1-y0)/0.6); t.offset.x=(u0*0.37)%1; return rect(k,u0,u1,y0,y1,hallP(t),0.005);}
const hallW=function(t){const m=new THREE.MeshLambertMaterial({map:t,emissive:0x57534b}); m.emissiveMap=t; return A.reg(m,'hall');};      // the plaster: a little warmer and brighter
function plas(k,u0,u1,y0,y1){const p=plaster.clone(); p.needsUpdate=true; p.repeat.set((u1-u0)/2.4,(y1-y0)/(H-CL)); p.offset.x=(u0*0.53)%1; return rect(k,u0,u1,y0,y1,hallW(p),0.004);}
HW.forEach(function(k){A.spans(k).forEach(function(s){clad(k,s[0],s[1],0,CL); plas(k,s[0],s[1],CL,H); rect(k,s[0],s[1],CL-0.05,CL+0.01,0xb3a78e,0.006);});});      // a darker course caps the cladding
/* the stairwell's walls: plaster all the way up, cladding that climbs with the flights */
function wallPoly(k,pts,mat,off){const w=A.walls[k], sh=new THREE.Shape(); pts.forEach(function(p,i){const x=w.s*(p[0]-w.len/2); if(i) sh.lineTo(x,p[1]); else sh.moveTo(x,p[1]);});
  const g=new THREE.ShapeGeometry(sh), P=g.attributes.position, U=g.attributes.uv;
  for(let i=0;i<P.count;i++) U.setXY(i,(P.getX(i)+w.len/2)/1.2,P.getY(i)/0.6);
  const m=new THREE.Mesh(g,mat); m.position.z=off||0.006; m.receiveShadow=true; w.g.add(m); return m;}
const cladM=hallP(ashlar), uE=XE-SU, capT=function(p){return [p[0],Math.min(p[1],TOPW-0.01)];};
plas('h_ss',0,uE,0,TOPW); plas('h_cf',0,EH-L,0,TOPW); plas('h_se',0,XE-CX1,0,TOPW);
function cladFloor(y,rs){const ya=y+(NT1+1)*rs, yb=ya+(NT2+1)*rs, r1=NT1*TD, r2=NT2*TD;      // one storey's cladding, climbing with its flights and level along its landings, on the three walls
  wallPoly('h_ss',[[0,y],[r1,ya],[uE,ya],[uE,ya+CL],[r1,ya+CL],[0,y+CL]].map(capT),cladM);                                            // along the first flight and the corner landing
  wallPoly('h_cf',[[0,ya],[SW,ya],[SW+r2,yb],[EH-L,yb],[EH-L,yb+CL],[SW+r2,yb+CL],[SW,ya+CL],[0,ya+CL]].map(capT),cladM);              // round that landing, up the flight across, round the second
  wallPoly('h_se',[[0,yb],[XE-CX1,yb],[XE-CX1,yb+CL],[0,yb+CL]].map(capT),cladM);}                                                      // along the second landing
for(let f=0;f<UPS;f++) cladFloor(f*FF,FF/16); cladFloor(LO,-LO/16);
/* the pillar opposite our door: clad in a warmer stone to about two metres, the paint above it peeling in sheets */
inRoom('hall',function(){
  const pw=PX1-PX0, pd=PZ1-PZ0, pc=new THREE.Vector3((PX0+PX1)/2,0,(PZ0+PZ1)/2);
  box(pw,H,pd,M(0xeee8da),pc.x,H/2,pc.z).castShadow=false;
  const pst=ashlar.clone(); pst.needsUpdate=true; pst.repeat.set(pw/1.2,2.02/0.6); const pcl=hallP(pst);
  box(pw+0.03,2.02,pd+0.03,pcl,pc.x,1.01,pc.z);                                            // big slabs of stone, a joint down the middle of each face
  box(0.006,2.0,0.02,0x9c8763,PX1+0.016,1.0,pc.z+0.06); box(0.02,2.0,0.006,0x9c8763,pc.x-0.05,1.0,PZ0-0.016); box(0.02,2.0,0.006,0x9c8763,pc.x+0.02,1.0,PZ1+0.016);
  box(pw+0.05,0.03,pd+0.05,0xcbb68b,pc.x,2.035,pc.z);                                     // its capping
  const pp=hallM(peel); [[PX1+0.004,pc.z,R/2,pd],[pc.x,PZ0-0.004,R,pw],[pc.x,PZ1+0.004,0,pw],[PX0-0.004,pc.z,-R/2,pd]].forEach(function(q){const m=new THREE.Mesh(new THREE.PlaneGeometry(q[3],H-2.05),pp); m.position.set(q[0],(H+2.05)/2,q[1]); m.rotation.y=q[2]; scene.add(m);});
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
[['h_s4',DOOR4],['h_l3',DOOR3],['h_cl',DOOR2],['h_br',DOOR6]].forEach(function(q){rect(q[0],q[1][1]+0.12,q[1][1]+0.2,1.38,1.48,0xeeeeea,0.009);});      // the bells by the doors
rect('h_s',en[1]-XP+0.2,en[1]-XP+0.28,1.38,1.48,0xeeeeea,0.009);                 // our light switch
inRoom('hall',function(){                                                                    // the pier between flat 4's door and ours: it stands out from the wall, stone to the height of the cladding, white above,
  const xc=(-0.3+XP)/2, d=D4;
  box(0.21,0.29,0.004,bright(M(0xf2d33a),0x5a4a10),xc-0.02,1.66,L+d+0.008); for(let i=0;i<5;i++) box(0.15-(i%2)*0.04,0.014,0.002,0x6a5a20,xc-0.03,1.76-i*0.045,L+d+0.011);      // a yellow notice taped to its face
});
/* the concrete vent screens high on the corridor's left, behind a white mesh */
const ventT=canvasTex(128,96,function(g){
  g.fillStyle='#f4f3ef'; g.fillRect(0,0,128,96); g.fillStyle='#cbc5b7'; g.fillRect(8,8,112,80);      // the white frame, the concrete blocks
  for(let j=0;j<3;j++) for(let i=0;i<6;i++){const cx=17+i*18.7, cy=21+j*27;      // a big round hole in each, dark inside, its rim catching the light
    g.fillStyle='#8c877b'; g.beginPath(); g.arc(cx+1,cy+1,9.5,0,7); g.fill(); g.fillStyle='#1e1d1b'; g.beginPath(); g.arc(cx,cy,8.5,0,7); g.fill(); g.fillStyle='#3a3834'; g.beginPath(); g.arc(cx-2,cy-2,5,0,7); g.fill();}
  g.strokeStyle='rgba(252,252,250,0.9)'; g.lineWidth=1.1; for(let x=8;x<120;x+=4.5){g.beginPath(); g.moveTo(x,8); g.lineTo(x,88); g.stroke();} for(let y=8;y<88;y+=4.5){g.beginPath(); g.moveTo(8,y); g.lineTo(120,y); g.stroke();}      // the wire mesh over it
});
function vent(k,u,w){rect(k,u-w/2,u+w/2,1.58,2.4,A.MT(ventT,'hall'),0.012);}
[ZE-0.9,ZE-2.3,ZE-3.75].forEach(function(z){vent('h_cl',z-PZ1,1.24);}); vent('h_cl',ZC-0.72-PZ1,1.2);
rect('h_cl',ZE-1.6-PZ1-0.14,ZE-1.6-PZ1+0.14,1.9,2.14,0x1f2122,0.012);      // a small black junction box between the first two
rect('h_cl',ZC-1.75-PZ1-0.42,ZC-1.75-PZ1+0.42,1.62,2.08,0xf4f4f1,0.011); rect('h_cl',ZC-1.75-PZ1-0.38,ZC-1.75-PZ1+0.38,1.66,2.04,0x2f3a40,0.012);      // the small barred window you see straight through the doorway
for(let i=0;i<7;i++){const u=ZC-1.75-PZ1-0.33+i*0.11; rect('h_cl',u-0.01,u+0.01,1.66,2.04,0xf4f4f1,0.013);} rect('h_cl',ZC-1.75-PZ1-0.38,ZC-1.75-PZ1+0.38,1.84,1.86,0xf4f4f1,0.013);
rect('h_br',ZE-0.7-EH-0.3,ZE-0.7-EH+0.3,1.85,2.35,0x6b4a2f,0.009); rect('h_br',ZE-0.7-EH-0.26,ZE-0.7-EH+0.26,1.89,2.31,0xc9a46e,0.010);   // an empty cork board
inRoom('hall',function(){
  function bulb(x,y,z,drop){const yb=y-(drop||0.28); box(0.01,y-yb,0.01,0x2a2c2e,x,(y+yb)/2,z).castShadow=false; cyl(0.03,0.05,0xe9e6dc,x,yb+0.02,z,null,10); sph(0.045,A.lampMat('L:hall',0xf6f1e2,0xfff0c8,1.1),x,yb-0.04,z); A.pool('L:hall',0xffe2b0,x,y-H+0.02,z,2.4,null,0.3);}
  bulb(0.45,H,L+1.6); bulb((CX0+CX1)/2,H,L+5.6); bulb(2.9,H,ZE+1.8); bulb((XF+XS)/2,H,(PZ+ZC)/2,0.2); for(let f=0;f<UPS;f++) bulb(XE-0.5,f*FF+6*FF/16+2.3,L+SW/2,0.3); for(let f=1;f<=UPS;f++) bulb(XB+0.6,f*FF+H,L+1.2,0.25); bulb(XB+0.6,LO+H,L+1.2,0.25);
  box(0.12,0.03,0.12,0xeeeeea,CX0+0.1,2.32,ZE-2.9); sph(0.05,A.lampMat('L:hall',0xf6f1e2,0xfff0c8,1.1),CX0+0.16,2.3,ZE-2.9);      // a bare bulb on the wall in the corridor
  box(0.04,0.04,ZC-PZ1,0x6a6a65,CX0+0.1,H-0.04,(PZ1+ZC)/2).castShadow=false;             // a grey conduit along the corridor's ceiling
  box(0.13,0.05,0.13,0xf4f4f1,0.5,H-0.025,L+0.2); sph(0.055,0x2a2d30,0.5,H-0.06,L+0.2,null,1,0.8,1); box(SU+1.2-0.5,0.012,0.012,0xf1f1ee,(0.5+SU+1.2)/2,H-0.01,L+0.12);   // the dome camera over our door, its cable off along the ceiling to the stairs
  const welcome=canvasTex(128,80,function(g){g.fillStyle='#8a6a48'; g.fillRect(0,0,128,80); const r=A.rng(3); for(let i=0;i<700;i++){g.fillStyle=r()<0.5?'rgba(60,40,20,0.35)':'rgba(210,180,130,0.35)'; g.fillRect(r()*128,r()*80,1,2);}
    g.fillStyle='#2a2018'; g.font='bold 22px sans-serif'; g.textAlign='center'; g.fillText('WELCOME',64,48);});
  box(0.6,0.014,0.4,hallM(welcome),(en[0]+en[1])/2,0.007,L+0.3).castShadow=false;         // doormats: ours says WELCOME, flat 4's and flat 3's
  box(0.6,0.014,0.4,0x6f5638,-0.8,0.007,L+D4+0.3).castShadow=false; box(0.4,0.014,0.6,0x7a5e40,XL+0.25,0.007,L+D4+0.78).castShadow=false;
  const hatch=box(0.5,0.004,0.95,0xe9dfc4,SD-0.3,0.003,EH-0.25); hatch.castShadow=false; hatch.rotation.y=0.03;      // a lighter patch of floor: the access hatch, along the kerb by the white pole
  const ed=A.door('entrance'), grey=A.reg(new THREE.MeshLambertMaterial({color:0xa9aeb1,emissive:0x31312f}),'hall'); box(0.83,2.03,0.004,grey,0.425,1.02,0.023,ed.p); box(0.124,0.029,0.05,0x5f6466,0.72,1.05,0.05,ed.p);   // our door is grey on the lobby side too,
  const fiveM=A.MT(canvasTex(32,40,function(g){g.clearRect(0,0,32,40); g.fillStyle='#c9a24a'; g.font='bold 34px serif'; g.textAlign='center'; g.fillText('5',16,33);}),'hall'); fiveM.transparent=true; fiveM.alphaTest=0.3;
  const five=new THREE.Mesh(new THREE.PlaneGeometry(0.07,0.09),fiveM); five.position.set(0.425,1.62,0.026); ed.p.add(five);      // with a brass 5, and a bell button under it
  cyl(0.012,0.006,0x2a2c2e,0.425,1.52,0.027,ed.p,10).rotation.x=R/2;

  /* ---------- the stairs: three flights a floor round an open well ---------- */
  const stepM=hallM(stepT), nose=M(0xb5a37d), soff=bright(M(0xf0eee7),0x6e6e68), wood=M(0x45301f), iron=M(0x1d1f21), white=M(0xf3f3ef);
  const stairMats=[stepM,nose,soff,wood,iron,white];
  function flight(X,lo,dir,ly,hy,b0,b1,NT){              // NT treads along x (X) or along z, from the low end (lo along the axis, height ly) toward dir, rising to hy, between b0 and b1 across
    const rs=(hy-ly)/(NT+1), w=b1-b0, bc=(b0+b1)/2;
    const bx=function(al,h,ac,m,u,y){return X?box(al,h,ac,m,u,y,bc):box(ac,h,al,m,bc,y,u);};      // a box al long along the flight, h high, ac across, at u along it
    for(let i=0;i<NT;i++){const y=ly+(i+1)*rs, u0=lo+dir*i*TD, u1=lo+dir*(i+1)*TD;
      bx(TD+0.005,0.12,w,stepM,(u0+u1)/2,y-0.06); bx(0.035,0.02,w,nose,u0+dir*0.0175,y-0.01); bx(0.03,rs,w,stepM,u0+dir*0.015,y-rs/2);}      // a tread, its nosing, and the riser under its front
    const len=Math.hypot(NT*TD,NT*rs)+0.15, a=Math.atan2(rs,TD)*dir, um=lo+dir*NT*TD/2, ym=ly+rs*NT/2;
    const sf=bx(len,0.2,w,soff,um,ym-0.22); if(X) sf.rotation.z=a; else sf.rotation.x=-a;                 // its plastered underside: a smooth slab just under the treads and risers
    return {X:X,rs:rs,nose:function(u){return ly+rs+rs*(u-lo)*dir/TD;}};
  }
  function rail(fl,u0,u1,c,hand){                       // along a flight from u0 to u1, at c across, following its nosing line: a handrail, dark wood or black, on black bars
    const n0=fl.nose(u0), n1=fl.nose(u1), y0=n0+0.88, y1=n1+0.88, len=Math.hypot(u1-u0,y1-y0), a=Math.atan2(y1-y0,u1-u0), X=fl.X;
    const bx=function(al,h,ac,m,u,y){return X?box(al,h,ac,m,u,y,c):box(ac,h,al,m,c,y,u);}, tilt=function(m){if(X) m.rotation.z=a; else m.rotation.x=-a; return m;};
    tilt(bx(len,hand?0.05:0.03,hand?0.06:0.035,hand?wood:iron,(u0+u1)/2,(y0+y1)/2+(hand?0.01:0))); tilt(bx(len,0.025,0.02,iron,(u0+u1)/2,(n0+n1)/2+0.12));
    const d=Math.abs(u1-u0), sg=Math.sign(u1-u0); for(let t=0.06;t<d;t+=0.12){const u=u0+sg*t; bx(0.014,0.76,0.014,iron,u,fl.nose(u)+0.5);}
  }
  function hrail(x0,z0,x1,z1,y,hand){                   // a level railing between two points, along x or along z, standing on floor y
    const al=Math.abs(x1-x0)>0.01, len=al?Math.abs(x1-x0):Math.abs(z1-z0), xc=(x0+x1)/2, zc=(z0+z1)/2, bx=function(l,h,t,m,yy){return al?box(l,h,t,m,xc,yy,zc):box(t,h,l,m,xc,yy,zc);};
    bx(len,hand?0.05:0.03,hand?0.06:0.035,hand?wood:iron,y+0.9); bx(len,0.025,0.02,iron,y+0.12);
    for(let t=0.06;t<len;t+=0.12) box(0.014,0.76,0.014,iron,al?Math.min(x0,x1)+t:xc,y+0.5,al?zc:Math.min(z0,z1)+t);
  }
  function post(x,y,z){box(0.05,1.0,0.05,iron,x,y+0.5,z); box(0.07,0.06,0.07,wood,x,y+1.0,z);}      // a newel, capped in wood
  function floorAt(x0,x1,z0,z1,y){const g=new THREE.PlaneGeometry(x1-x0,z1-z0), U=g.attributes.uv; for(let i=0;i<U.count;i++) U.setXY(i,U.getX(i)*(x1-x0)/0.8,U.getY(i)*(z1-z0)/0.8);
    const t=terrazzo.clone(); t.needsUpdate=true; const mm=hallP(t,0x3a3934,50); mm.clippingPlanes=[A.cut]; const m=new THREE.Mesh(g,mm); m.rotation.x=-R/2; m.position.set((x0+x1)/2,y,(z0+z1)/2); m.receiveShadow=true; m.userData.floor=true; scene.add(m); return m;}
  const zr=L+SW+0.04, xr=X1-0.04, zq=EH-SW-0.04;      // where the rails stand: along the first flight's open side, the one across, the third's
  /* one storey of stairs, from y0 at the foot of the first flight to y1 where the third arrives: the three flights, the two corner landings, the handrail round the well */
  function storey(y0,y1){const rs=(y1-y0)/16, ya=y0+(NT1+1)*rs, yb=ya+(NT2+1)*rs;
    const f1=flight(true,SU,1,y0,ya,L,L+SW,NT1), f2=flight(false,L+SW,1,ya,yb,X1,XE,NT2), f3=flight(true,X1,-1,yb,y1,EH-SW,EH,NT3);
    box(XE-X1,0.2,SW,stepM,(X1+XE)/2,ya-0.1,L+SW/2); box(XE-X1,0.2,SW,stepM,(X1+XE)/2,yb-0.1,EH-SW/2);      // the corner landings
    rail(f1,SU,X1,zr,true); rail(f2,L+SW,EH-SW,xr,true); rail(f3,X1,XD,zq,true);                                // the dark wooden handrail on black bars: up the first flight, across, and up the third
    post(SU+0.02,y0,zr); post(xr,ya,zr); post(xr,yb,zq); post(XD,y1,zq);                                        // a newel at each turn
    hrail(SU,L+SW,SU,EH-SW,y1,true); hrail(SU,zq,XD,zq,y1,true); post(SU,y1,zq);                                // on the floor it arrives at: along the landing's edge over the well, and the strip's, to the head of the next flight down
    return {rs:rs,ya:ya,yb:yb};}
  for(let f=0;f<UPS;f++) storey(f*FF,(f+1)*FF); storey(LO,0);      // ours and the floors above; the one below, from the shelter up to our floor
  box(0.14,0.13,EH-L-2*SW,M(0xc9b791),SU-0.07,0.065,(L+EH)/2); box(0.16,0.02,EH-L-2*SW,0xd9c9a3,SU-0.07,0.14,(L+EH)/2);                  // on our floor a stone kerb under those rails: along the landing's edge over the well,
  box(XD-SU+0.14,0.13,0.14,M(0xc9b791),(SU+XD)/2-0.07,0.065,EH-SW+0.07); box(XD-SU+0.16,0.02,0.16,0xd9c9a3,(SU+XD)/2-0.07,0.14,EH-SW+0.07);      // and along the strip's, to the head of the flight down
  const slabM=bright(M(0xf3f1ea),0x6e6e68); slabM.clippingPlanes=[A.cut];
  for(let f=1;f<=UPS;f++){const y=f*FF-(FF-H)/2+0.003; box(SU-XB,FF-H-0.006,EH-L,slabM,(XB+SU)/2,y,(L+EH)/2); box(XD-SU,FF-H-0.006,SW,slabM,(SU+XD)/2,y,EH-SW/2);}      // the slab of each landing above, and of its strip, their edges over the one below
  /* the landings above and below: a doorway in the wall at XB on each (to the west flat; below, the shelter), and above, a second in the wall
     at L right over our own door, into the flat over ours. floors.js hangs the doors in them and builds what lies behind. */
  const LDW=[L+0.78,L+1.62], LDS=[D.entrance[0],D.entrance[1]];          // the west doorway, along z; the south one, along x
  A.LB.landDoors={west:LDW,south:LDS};
  function holed(w,h,holes,mat){const sh=new THREE.Shape(); sh.moveTo(0,0); sh.lineTo(w,0); sh.lineTo(w,h); sh.lineTo(0,h); sh.lineTo(0,0);
    holes.forEach(function(q){const p=new THREE.Path(); p.moveTo(q[0],q[2]); p.lineTo(q[0],q[3]); p.lineTo(q[1],q[3]); p.lineTo(q[1],q[2]); p.lineTo(q[0],q[2]); sh.holes.push(p);});
    const g=new THREE.ShapeGeometry(sh), U=g.attributes.uv; for(let i=0;i<U.count;i++) U.setXY(i,U.getX(i)/1.2,U.getY(i)/0.6); return new THREE.Mesh(g,mat);}
  function frame(g,u0,u1){const fm=M(0xf3f2ee); [[u0-0.07,u0],[u1,u1+0.07]].forEach(function(q){const m=new THREE.Mesh(new THREE.BoxGeometry(q[1]-q[0],2.12,0.03),fm); m.position.set((q[0]+q[1])/2,1.06,0.015); g.add(m);});
    const t=new THREE.Mesh(new THREE.BoxGeometry(u1-u0+0.14,0.07,0.03),fm); t.position.set((u0+u1)/2,2.085,0.015); g.add(t);}
  [LO].concat([1,2,3].slice(0,UPS).map(function(f){return f*FF;})).forEach(function(y){
    floorAt(XB,SU,L,EH,y+0.002); if(y>0) floorAt(SU,XD,EH-SW,EH,y+0.002);      // the landing, and above the strip beside the well where the third flight arrives
    const wm=(function(){const m=hallM(plaster); m.clippingPlanes=[A.cut]; return m;})();
    if(y<0){const bk=new THREE.Group(); bk.position.set(XB+0.005,y,EH); bk.rotation.y=R/2; scene.add(bk);      // the wall at XB, its u running from EH toward L: below, the shelter's
    const hw=[EH-LDW[1],EH-LDW[0],0,2.05];
    bk.add(holed(EH-L,H,[hw],wm)); const cb=holed(EH-L,CL,[hw],hallM(ashlar)); cb.position.z=0.003; bk.add(cb); frame(bk,hw[0],hw[1]);}
    [[L,0],[EH,R]].forEach(function(e){if(y>0&&e[1]) return;      // upstairs the landing runs on into the corridor
      const g=new THREE.Group(); g.position.set(e[1]?SU:XB,y,e[0]+(e[1]?-0.005:0.005)); g.rotation.y=e[1]; scene.add(g);
      const holes=(y>0&&!e[1])?[[LDS[0]-XB,LDS[1]-XB,0,2.05]]:[];
      g.add(holed(SU-XB,H,holes,hallM(plaster))); if(holes.length) frame(g,holes[0][0],holes[0][1]);});
  });
  const top=new THREE.Mesh(new THREE.PlaneGeometry(XE-XB,EH-L),bright(M(0xf7f7f4),0xa6a6a0)); top.rotation.x=R/2; top.position.set((XB+XE)/2,TOPW,(L+EH)/2); scene.add(top);      // the stairwell's ceiling, under the roof
  floorAt(SU,XE,L,EH,LO+0.004);                                                            // and the floor of the shaft below
  /* the shaft below our landing: white walls on three sides, the flights below climbing them with their cladding */
  const shaftM=bright(M(0xf2f1ec),0x55554f);
  function plate(ry,x,z,pts){const sh=new THREE.Shape(); pts.forEach(function(p,i){if(i) sh.lineTo(p[0],p[1]); else sh.moveTo(p[0],p[1]);});
    const g=new THREE.ShapeGeometry(sh), P=g.attributes.position, U=g.attributes.uv; for(let i=0;i<P.count;i++) U.setXY(i,P.getX(i)/1.2,P.getY(i)/0.6);
    const m=new THREE.Mesh(g,shaftM); m.position.set(x,0,z); m.rotation.y=ry; scene.add(m); return m;}
  plate(0,SU,L+0.004,[[0,LO],[XE-SU,LO],[XE-SU,0],[0,0]]); plate(-R/2,XE-0.004,L,[[0,LO],[EH-L,LO],[EH-L,0],[0,0]]); plate(R,XE,EH-0.004,[[0,LO],[XE-SD,LO],[XE-SD,0],[0,0]]);
  /* the white railing at the corridor's end, on a stone kerb over the head of the flight down, on every floor; on ours a white pole to the ceiling at its corner, flaking, and a black rubber mat hung over it to dry */
  function corridorRail(y,ours){
    box(CX1-SD+0.03,0.15,0.13,M(0xc9b791),(SD+CX1)/2-0.015,y+0.075,EH+0.045); box(CX1-SD+0.06,0.02,0.15,0xd9c9a3,(SD+CX1)/2-0.015,y+0.16,EH+0.045);
    box(CX1-SD,0.04,0.04,white,(SD+CX1)/2,y+1.02,EH+0.05); box(CX1-SD,0.03,0.03,white,(SD+CX1)/2,y+0.27,EH+0.05);
    for(let x=SD+0.08;x<CX1-0.02;x+=0.115) box(0.018,0.76,0.018,white,x,y+0.64,EH+0.05);
    if(!ours) return;
    cyl(0.024,H,white,SD-0.03,H/2,EH+0.05,null,10); [0.7,1.4,2.1].forEach(function(yy){box(0.05,0.03,0.003,0x6b5a3a,SD-0.03,yy,EH+0.075);});
    A.rbox(0.66,0.86,0.025,0x1e2022,(SD+CX1)/2+0.2,0.62,EH+0.09,null,0.01); A.rbox(0.66,0.05,0.08,0x1e2022,(SD+CX1)/2+0.2,1.04,EH+0.05,null,0.02);}
  corridorRail(0,true); for(let f=1;f<=UPS;f++) corridorRail(f*FF,false);
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
  cyl(0.32,0.03,0x8e8a82,8.9,GY+0.04,1.95,o,24); A.torus(0.3,0.015,0x77736b,8.9,GY+0.055,1.95,o).rotation.x=R/2;     // a manhole cover, in front of the gas bottles
  // the building under and beside us: the floor below opens onto the yard. The stairwell's shaft is left open in it.
  const facade=0xe9e3d3, X7=-7, ZC=LB.ZC, EH=LB.EH, XE=LB.XE, hh=-GY-0.01, yc=GY/2-0.005;
  const XS=A.PLAN.front, W6=6.5;      // flat 6's face to the street, and its side toward the yard
  [[X7,XF,AZ-0.4,L],[X7,XB,L,EH],[XE,XF,L,EH],[X7,XF,EH,ZC],[XF,XS,W6,ZC]].forEach(function(q,i){const m=box(q[1]-q[0],hh,q[3]-q[2],facade,(q[0]+q[1])/2,yc,(q[2]+q[3])/2,o); if(i===1||i===3) m.userData.hideBelow=true;});      // the two round the shelter step aside when you are down there
  box(D.BXB-XF+0.02,hh,-AZ+0.4,facade,(XF+D.BXB+0.02)/2,yc,(AZ-0.4)/2,o);
  box(XF-3.94,H,L-A.BA.z1-0.04,0xe4ddcc,(3.92+XF)/2,H/2,(A.BA.z1+0.02+L-0.02)/2,o);        // a block of shafts between our bathroom and the stairs,
  box(XF-XE-0.05,TOPW,EH-L,0xe4ddcc,(XE+0.02+XF-0.03)/2,TOPW/2,(L+EH)/2,o);                 // and beside the stairwell, between it and the front, up to the roof
  const winTex=canvasTex(128,128,function(g){g.fillStyle='#e9e3d3'; g.fillRect(0,0,128,128); g.fillStyle='#8fb0bb'; g.fillRect(30,22,68,70); g.fillStyle='#f6f3ea'; g.fillRect(62,22,4,70); g.fillStyle='#cfc8b6'; g.fillRect(24,94,80,6);});
  winTex.wrapS=THREE.RepeatWrapping;
  function strip(len,x,y,z,rotY,hh){const t=winTex.clone(); t.needsUpdate=true; t.repeat.set(Math.round(len/2.6),1); const m=new THREE.Mesh(new THREE.PlaneGeometry(len,hh||2.6),A.MT(t)); m.position.set(x,y,z); m.rotation.y=rotY; o.add(m);}
  strip(L,XF+0.005,GY+1.4,L/2,R/2,2.4); strip(-AZ,D.BXB+0.025,GY+1.4,AZ/2,R/2,2.4); strip(ZC-W6,XS+0.005,GY+1.4,(W6+ZC)/2,R/2,2.4); strip(XS-XF,(XF+XS)/2,GY+1.4,W6-0.005,R,2.4);      // the yard fronts; under flat 6, the one down in the sunken strip and its side onto the yard
  strip(D.BXB-X7,(X7+D.BXB)/2,GY+1.4,AZ-0.405,R,2.4);

  /* ---------- the neighbour's back, across the yard ---------- */
  const nb=G(o);
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
  const W0=[-7.6,-4.6,-1.4,1.3], NB=batch(nb);
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
  function ac(z,y,brand){const c=0xf1f1ee, u=B2.at(NX-0.25,y,z,-R/2);              // an air conditioner on a rusty bracket, its fan behind a grille
    u.box(0.82,0.58,0.3,c,0,0,0); u.cyl(0.21,0.02,0x3e4245,0.1,0,0.15,18,null,0,R/2); u.box(0.18,0.08,0.005,brand?0x1d4ea0:0xe8762a,-0.28,0.18,0.152);
    [[-0.3],[0.3]].forEach(function(q){u.box(0.04,0.04,0.4,0x6b4a33,q[0],-0.31,0.05); u.box(0.04,0.4,0.04,0x6b4a33,q[0],-0.12,-0.13,0,0.8);});}
  const B2=batch(nb);
  [[0.4,1.15,1],[2.7,1.6,0],[-2.4,2.0,1],[1.6,3.9,0],[-0.6,4.8,1],[3.9,4.2,0],[-3.4,6.9,0],[2.2,7.2,1],[0.8,10.1,0],[-5.8,3.95,1]].forEach(function(q){ac(q[0],q[1],q[2]);});
  [[2.45,0x9b9e9c,0.055],[-0.25,0x6f7275,0.05],[2.62,0x1d1f21,0.03],[0.05,0xf0f0ec,0.03]].forEach(function(q){NB.cyl(q[2],TOPN-GY,q[1],NX-0.12,(GY+TOPN)/2,q[0],8);});     // drain pipes and conduits down the wall
  NB.box(0.5,0.04,0.7,0xd9dcdf,NX-0.6,4.55,2.0,0,0.35); for(let i=0;i<6;i++) NB.box(0.52,0.02,0.02,0xc4c7ca,NX-0.6,4.56+i*0.012,1.7+i*0.12,0,0.35);   // a corrugated plastic awning
  (function(){const pts=[]; [[GY+0.55],[GY+0.62],[0.2],[0.28]].forEach(function(q,k){const line=[]; for(let i=0;i<=24;i++){const z=NZ0+0.5+i*(NZ1-0.3-NZ0-0.5)/24; line.push(new THREE.Vector3(NX-0.09,q[0]-0.06*Math.sin(i*0.9+k),z));}
      nb.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(line),new THREE.LineBasicMaterial({color:0x1b1c1d})));});})();      // black cables strung along it
  /* at its foot: a white cabinet, gas bottles under a hood, the water meters */
  NB.box(0.26,0.85,0.55,0xeeeeea,NX-0.15,GY+0.43,0.75); NB.box(0.005,0.8,0.5,0xd8d8d4,NX-0.282,GY+0.43,0.75);
  NB.cyl(0.15,0.62,0xc8cbcd,NX-0.22,GY+0.31,1.35,14); NB.cyl(0.14,0.5,0x2f66b0,NX-0.22,GY+0.25,1.68,14); NB.box(0.45,0.06,0.8,0x8e9294,NX-0.24,GY+0.78,1.5,0,-0.25);      // two gas bottles, a hood
  for(let i=0;i<6;i++){NB.box(0.08,0.07,0.12,0x2f6fd6,NX-0.13,GY+0.45+i*0.2,2.05); NB.cyl(0.012,0.2,0x9aa0a4,NX-0.1,GY+0.55+i*0.2,2.05,6);}      // a column of blue water meters on the supply pipe
  NB.cyl(0.02,1.6,0x9aa0a4,NX-0.07,GY+0.9,2.0,6);
  NB.box(0.3,0.25,0.4,0xc9c4ba,NX-0.3,GY+0.12,1.0); NB.cyl(0.14,0.14,0xbab5aa,NX-0.33,GY+0.32,1.0,12,null,0,R/2);      // an old concrete trough
  /* to the right out of the kitchen window, the wing that juts out toward us and closes the yard on that side is flat 6: building.js draws
     its outside, the floor below it is drawn above */
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
  bushy(6.4,-2.8,1.3); bushy(6.2,-7.2,1.5); bushy(9.0,-3.6,1.1);
  [[8.4,-3.0,4.4,1.0],[8.7,-7.4,5.0,1.15]].forEach(function(q){T.cyl(0.16*q[3],q[2],0x6b5a44,q[0],GY+q[2]/2,q[1],8,0.11*q[3]); for(let i=0;i<5;i++){const a=i*1.3; C2.sph(1.3*q[3],[0x3e5f3a,0x4f7146,0x34522f][i%3],q[0]+Math.sin(a)*1.1*q[3],GY+q[2]+0.5+(i%2)*0.6,q[1]+Math.cos(a)*1.1*q[3],1,0.75,1);}});
  T.done(); C2.done();
  /* the blocks beyond the yard, Beit HaChayal first, are in building.js, placed from the satellite view. The neighbours always stand, wherever the camera is */
});

/* ================= the street side =================
   From the photos of the walk in: Haroe St, the café of number 12 under its umbrellas on a small paved square, a path past
   the café and a fenced garden with a round memorial stone, a few steps down to a lower terrace along the building, and the
   bridge across the sunken strip into the doorway in the corner where number 12's wing meets the front. The front here is flat 6's
   (plan.js), which stands four metres out from ours toward the street; the doorway opens into a short passage beside it, then the
   hall, where the corridor turns right toward our door, so this front faces the same way as our kitchen window. The floor below
   takes its light from the sunken strip, full of air-conditioner units.
   All of this is laid out in a frame of its own, as you see it from the street: x runs to the right along the front, starting at
   that corner; z comes out toward you; y=0 is the lobby floor. The whole is then turned into place. */

/* It is built from a great many small parts, so parts of one colour (or one texture) are merged into a single mesh: A.batch, in detail.js. */
function batch(parent,lift,opt){return A.batch(parent,lift,opt);}

inRoom('street',function(){
  const WELL=1.6, D8=16-(XS-XF), GZ=10.4+D8, AW=3.4, AY=-0.42, NST=3, SRS=0.15, U=AY+NST*SRS, LA=-0.14, RY=U-0.13, KZ=18.55+D8, RW=7, ZF=42+D8, FW=ZC-L, TOP=12.6, BRW=1.3;
  const BL=2.2, SE=1.0, FZ=BL+1.5, AL=FZ+0.32;
  const PV=16+D8, CW=10.8, LBH=26.95, FLT=0.38, FLL=(NST-1)*FLT, YY=D.KX+4.9-XS, YB=YY+6, XB=ZC-4.6, FL=[[0,AW],[8.6,10.6],[15.6,17.6]];
  /* WELL: width of the sunken strip along the front; LA: a step below the lobby; GZ: where the café's terrace and the top of the garden end and the
     ground falls away; AW: width of the alley; AY: the level of the alley and of the garden below; U: the street's, three steps of SRS higher, the level of
     Haroe St, its pavement, the café's terrace and the garden's entrance; RY: the road; KZ: the kerb; RW: width of the road; ZF: far edge; FW and TOP:
     length and height of our front. Our own way in, from the photos of the walk: the alley (AY) ends in two steps up to a forecourt of old slabs
     (LA, from AL back to FZ), and from it one more step up onto a bridge BL long over the sunken strip, at the lobby's level. SE: how far the strip
     reaches out beside the bridge.
     D8: how much farther out the square, the café and the street stand than first drawn, less the four
     metres flat 6 stands out from our own front, where this frame begins: the square, the café and the street stay where they were.
     PV: the line of the fronts along Haroe St, where the pavement begins; CW: where the café's terrace meets the garden; LBH: Beit HaChayal's face.
     FL: the three flights of NST steps, FLT a tread, FLL deep, down from the street's level at GZ: into the alley just past the café, from the café's
     terrace into the garden, and from the garden's gate into the garden proper. YY, YB, XB: where the garden ends over our yard, and along the
     building across the yard, whose corner is at XB. */
  const BX=[ZC-ZO];    // the bridge, along the front
  const st=G(), can=G(st), fac=G(st);                  // everything; the tree crowns; our own street front
  st.userData.nc=true; st.rotation.y=R/2; st.position.set(XS,0,ZC); st.updateMatrixWorld(true);
  const det=A.det, leafC=det.leafM.clone(); leafC.userData={};
  const B=batch(st), C=batch(can,0,{map:function(k){return k===det.leafM?leafC:k;}}), F=batch(fac,0x3c3d3b), DP=det.P;
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
     broad steps go down to a forecourt, and from there our bridge crosses the sunken ground to the doorway. ---------- */
  function wear(g,S,seed,o){                                // what years of use leave on a surface: gum, stains, cracks, fallen leaves, butts, sand in the joints
    const r=A.rng(seed);
    for(let i=0;i<(o.stains||10);i++){const x=r()*S, y=r()*S, q=S*(0.02+r()*0.07), gr=g.createRadialGradient(x,y,0,x,y,q); gr.addColorStop(0,'rgba(40,32,26,'+(0.08+r()*0.12)+')'); gr.addColorStop(1,'rgba(40,32,26,0)'); g.fillStyle=gr; g.fillRect(x-q,y-q,2*q,2*q);}
    for(let i=0;i<(o.gum||14);i++){const x=r()*S, y=r()*S, q=S*(0.004+r()*0.005); g.fillStyle='rgba(60,58,56,0.75)'; g.beginPath(); g.ellipse(x,y,q,q*0.85,r()*3,0,7); g.fill(); g.fillStyle='rgba(150,148,142,0.5)'; g.beginPath(); g.ellipse(x-q*0.2,y-q*0.2,q*0.5,q*0.4,0,0,7); g.fill();}
    for(let i=0;i<(o.cracks||3);i++){let x=r()*S, y=r()*S; g.strokeStyle='rgba(35,30,26,0.55)'; g.lineWidth=S/512*1.2; g.beginPath(); g.moveTo(x,y); for(let k=0;k<7;k++){x+=(r()-0.5)*S*0.08; y+=(r()-0.3)*S*0.06; g.lineTo(x,y);} g.stroke();}
    for(let i=0;i<(o.leaves||0);i++){const x=r()*S, y=r()*S, l=S*(0.012+r()*0.012); g.save(); g.translate(x,y); g.rotate(r()*7); g.fillStyle=['#5f7a3a','#9a8a3a','#b58a3a','#7a5a32','#4f6a32'][Math.floor(r()*5)];
      g.beginPath(); g.moveTo(0,-l); g.quadraticCurveTo(l*0.55,0,0,l); g.quadraticCurveTo(-l*0.55,0,0,-l); g.fill(); g.restore();}
    for(let i=0;i<(o.butts||4);i++){g.save(); g.translate(r()*S,r()*S); g.rotate(r()*7); const w=S*0.012; g.fillStyle='#efe9dc'; g.fillRect(0,0,w,w*0.3); g.fillStyle='#d9954a'; g.fillRect(0,0,w*0.35,w*0.3); g.restore();}
    for(let i=0;i<(o.berries||0);i++){g.fillStyle=['rgba(70,30,50,0.7)','rgba(110,50,70,0.6)'][i%2]; g.beginPath(); g.arc(r()*S,r()*S,S*0.003,0,7); g.fill();}
  }
  const pave=tex(512,512,function(g){                     // the café and the square: brick pavers in red, plum and grey, laid herringbone
    g.scale(2,2); const r=A.rng(44), cs=['#8c5f52','#7f5a4e','#9a6a5c','#7a6460','#8f7a72','#6e5552','#a37766','#857b78'];
    g.fillStyle='#5e4a44'; g.fillRect(0,0,256,256);
    for(let j=-2;j<10;j++) for(let i=-2;i<10;i++){const x=i*32+j*16, y=j*32-i*16;
      g.fillStyle=cs[Math.floor(r()*cs.length)]; g.fillRect(x+1,y+1,30,14); g.fillStyle=cs[Math.floor(r()*cs.length)]; g.fillRect(x+17,y+17,14,30);}
    for(let i=0;i<900;i++){g.fillStyle='rgba(255,255,255,'+(r()*0.08)+')'; g.fillRect(r()*256,r()*256,1,1);}
    for(let j=-2;j<10;j++) for(let i=-2;i<10;i++){const x=i*32+j*16, y=j*32-i*16; g.fillStyle='rgba(255,240,225,0.12)'; g.fillRect(x+1,y+1,30,1.2); g.fillRect(x+17,y+17,1.2,30);
      g.fillStyle='rgba(30,20,18,0.18)'; g.fillRect(x+1,y+14,30,1); g.fillRect(x+30,y+17,1,30);}     // each brick's edges catch the light
    g.setTransform(1,0,0,1,0,0); wear(g,512,45,{stains:14,gum:22,cracks:2,leaves:26,butts:6,berries:30});
  },true), paveM=A.MT(pave,null,true);
  const conc=tex(256,256,function(g){                     // the paved area in front of the bridge: old concrete slabs, stained
    const r=A.rng(57); g.fillStyle='#8a857b'; g.fillRect(0,0,256,256);
    for(let j=0;j<2;j++) for(let i=0;i<2;i++){g.fillStyle='rgb('+(170+Math.floor(r()*20))+','+(164+Math.floor(r()*20))+','+(150+Math.floor(r()*20))+')'; g.fillRect(i*128+2,j*128+2,124,124);}
    for(let i=0;i<40;i++){g.fillStyle='rgba(60,50,40,'+(0.05+r()*0.12)+')'; g.beginPath(); g.ellipse(r()*256,r()*256,4+r()*20,3+r()*12,r()*3,0,7); g.fill();}
    for(let i=0;i<60;i++){g.fillStyle=['#a87e4a','#8f6a3e','#6f5a3a'][i%3]; g.fillRect(r()*256,r()*256,3+r()*5,1+r()*2);}
    wear(g,256,58,{stains:6,gum:6,cracks:5,leaves:14,butts:3});
  },true), concM=A.MT(conc,null,true);
  const slabs=tex(256,256,function(g){                    // the alley: worn beige stone slabs, 40 cm
    const r=A.rng(52); g.fillStyle='#9d9384'; g.fillRect(0,0,256,256);
    for(let j=0;j<4;j++) for(let i=0;i<4;i++){const c=200+Math.floor(r()*26); g.fillStyle='rgb('+c+','+(c-8)+','+(c-22)+')'; g.fillRect(i*64+1.5,j*64+1.5,61,61);
      for(let k=0;k<60;k++){g.fillStyle='rgba('+(r()>0.5?'90,80,65':'255,250,235')+','+(0.06+r()*0.1)+')'; g.fillRect(i*64+r()*62,j*64+r()*62,1+r()*3,1+r()*2);}
      if(r()<0.25){g.strokeStyle='rgba(60,50,40,0.5)'; g.lineWidth=1; g.beginPath(); g.moveTo(i*64+r()*64,j*64); g.lineTo(i*64+r()*64,j*64+64); g.stroke();}      // a slab cracked across
      g.fillStyle='rgba(70,80,50,0.35)'; g.fillRect(i*64,j*64+62,64,2); g.fillRect(i*64+62,j*64,2,64);}                                                        // moss in the joints
    wear(g,256,53,{stains:8,gum:8,cracks:1,leaves:18,butts:3});
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

  const PTW=0.95-0.18, PTZ0=0.6+0.18, PTZ1=BL+0.3, PTF=LA-1.4;      // the pit between the bridge and number 12: how wide, from the landing's kerb to the forecourt's edge, and its floor
  B.box(AW-PTW,LA-GY,PTZ1-BL,stone,(PTW+AW)/2,(GY+LA)/2,(BL+PTZ1)/2); flat(PTW,AW,BL,PTZ1,LA+0.004,concM,2.4);      // our forecourt, solid ground, the pit cut out of it beside the bridge
  B.box(AW,LA-GY,FZ-PTZ1,stone,AW/2,(GY+LA)/2,(PTZ1+FZ)/2); flat(0,AW,PTZ1,FZ,LA+0.004,concM,2.4);
  (function(){const ym=(LA+AY)/2;                                                                   // two steps down from it to the alley, of the same worn slabs, a nosing on each
    B.box(AW,ym-GY,AL-FZ,0xcbc4b3,AW/2,(ym+GY)/2,(FZ+AL)/2); flat(0,AW,FZ,AL,ym+0.004,slabM,1.6); B.box(AW,0.025,0.05,0xb3ac9b,AW/2,LA-0.012,FZ-0.025); B.box(AW,0.025,0.05,0xb3ac9b,AW/2,ym-0.012,AL-0.025);
    B.box(AW,AY-GY,GZ-FLL-AL,stone,AW/2,(GY+AY)/2,(AL+GZ-FLL)/2); flat(0,AW,AL,GZ-FLL,AY+0.004,slabM,1.6);})();
  [[AW,FW,WELL],[FW,XB,YY],[XB,LBH,YB]].forEach(function(q){B.box(q[1]-q[0],AY-GY,GZ-q[2],stone,(q[0]+q[1])/2,(GY+AY)/2,(q[2]+GZ)/2);});      // the garden, solid ground at the alley's level
  B.box(CW+19,U-GY,KZ-GZ,stone,(CW-19)/2,(GY+U)/2,(GZ+KZ)/2); flat(-19,CW,GZ,KZ-0.16,U+0.004,paveM,1.6);       // the café's terrace and the pavement before number 12, at the street's level
  B.box(50-CW,U-GY,KZ-PV,stone,(CW+50)/2,(GY+U)/2,(PV+KZ)/2); flat(CW,50,PV,KZ-0.16,U+0.004,paveM,1.6);        // and the pavement on past the garden and number 8
  B.box(LBH-CW,U-GY,PV-GZ,stone,(CW+LBH)/2,(GY+U)/2,(GZ+PV)/2);                                                 // the top of the garden, inside its fence on the pavement
  B.box(12,AY-GY,XS-XF,stone,-6,(GY+AY)/2,-(XS-XF)/2); flat(-12,0,-(XS-XF),0,AY+0.004,concM,2.4);      // behind number 12, the yard in front of flat 1, at the alley's level
  B.box(0.32,AY/2-GY,1.0,0xc9c2b1,-0.16,(GY+AY/2)/2,XF-XS+0.8); B.box(0.32,AY/2-GY,1.0,0xc9c2b1,ZC-23.0-0.16,(GY+AY/2)/2,-4.0-XS+0.425);      // a step outside the side gate, and one up to flat 1's door
  B.box(69,RY-GY,ZF-KZ,0x5d6164,15.5,(GY+RY)/2,(KZ+ZF)/2);                                            // asphalt: grey and grainy, patched where it was dug up, oil under the parked cars
  const asph=tex(512,512,function(g){const r=A.rng(91); g.fillStyle='#5a5e60'; g.fillRect(0,0,512,512);
    for(let i=0;i<9000;i++){const v=r(); g.fillStyle=v<0.5?'rgba(30,32,34,0.5)':v<0.85?'rgba(140,142,140,0.45)':'rgba(190,180,165,0.5)'; g.fillRect(r()*512,r()*512,1+r()*1.5,1+r()*1.5);}
    for(let i=0;i<3;i++){const x=r()*400, y=r()*400, w=60+r()*120, h=30+r()*90; g.fillStyle='rgba(60,64,66,0.22)'; g.fillRect(x,y,w,h); g.strokeStyle='rgba(30,30,30,0.3)'; g.lineWidth=2; g.strokeRect(x,y,w,h);}
    for(let i=0;i<8;i++){let x=r()*512, y=r()*512; g.strokeStyle='rgba(25,25,26,0.7)'; g.lineWidth=1.4; g.beginPath(); g.moveTo(x,y); for(let k=0;k<9;k++){x+=(r()-0.5)*40; y+=(r()-0.5)*40; g.lineTo(x,y);} g.stroke();}
    for(let i=0;i<10;i++){const x=r()*512, y=r()*512, q=10+r()*30, gr=g.createRadialGradient(x,y,0,x,y,q); gr.addColorStop(0,'rgba(15,15,18,0.35)'); gr.addColorStop(1,'rgba(15,15,18,0)'); g.fillStyle=gr; g.fillRect(x-q,y-q,2*q,2*q);}},true);
  flat(-19,50,KZ,KZ+RW,RY+0.004,A.MT(asph,null,true),4.5);
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
  flat(0,AW,AL,GZ-FLL,AY+0.02,shadeM,18).renderOrder=1; flat(0,AW,BL,FZ,LA+0.02,shadeM,18).renderOrder=1; flat(0,CW,GZ,KZ-0.16,U+0.02,shadeM,18).renderOrder=1;

  const wrail=0xefefea;

  /* ---------- our bridge, from the photos of the walk in. Our doorway is near the corner with number 12's wing. A short slab of old concrete,
     tiled in 25 cm terrazzo, crosses the sunken strip to it, a heavy kerb along each side. Its left side runs out from the doorway's left half,
     a small landing filling the corner in front of the doorway; between the bridge and number 12 the strip is a pit, a flight of steps down into it
     from the forecourt's edge, air conditioners on the wing's wall over them. Its right side runs out from the window beside the doorway.
     A railing of plain white bars stands on the left kerb, a white zig-zag one on the right; one step leads down to the forecourt. ---------- */
  const DL=BX[0]-BRW/2, WX0=0.95, DR=2.4, WX1=2.45, LD0=0.6, KW=0.18, kc=0xc2baa7;      // the doorway's left jamb; the walk's left edge; where its right kerb meets the front, at the window; its right edge; how far the landing reaches out in front of the doorway
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
  function bars(x0,z0,x1,z1,y0,y1){        // a white railing of plain upright bars from one point to another: top and bottom rails, a post at each end
    const len=Math.hypot(x1-x0,z1-z0), r=B.at(x0,0,z0,Math.atan2(x1-x0,z1-z0)), n=Math.max(2,Math.round(len/0.11));
    r.box(0.04,0.04,len,wrail,0,y1,len/2); r.box(0.03,0.03,len,wrail,0,y0+0.05,len/2); [0.03,len-0.03].forEach(function(d){r.box(0.05,y1-y0,0.05,wrail,0,(y0+y1)/2,d);});
    for(let k=1;k<n;k++) r.box(0.018,y1-y0-0.09,0.018,wrail,0,(y0+y1)/2,k*len/n);
  }
  function kerb2(ax,az,bx,bz){const l=Math.hypot(bx-ax,bz-az); B.box(KW,0.52,l,kc,(ax+bx)/2,-0.01,(az+bz)/2,Math.atan2(bx-ax,bz-az));}      // a kerb along a line: up 25 cm, down to the slab's underside
  const dn=(function(){const dx=WX1-DR, dz=SE, l=Math.hypot(dx,dz); return [dz/l,-dx/l];})();      // out from the slanting side
  prism([[WX0,0],[DR,0],[WX1,SE],[WX1,BL],[WX0,BL]],-0.004,0.004,walkM); prism([[DL,0],[WX0+0.01,0],[WX0+0.01,LD0],[DL,LD0]],-0.004,0.004,walkM);      // the tiles: the walk, and the landing in front of the doorway's left half
  prism([[WX0-KW,-0.02],[DR+dn[0]*KW,-0.02],[WX1+KW,SE],[WX1+KW,BL],[WX0-KW,BL]],-0.26,-0.004,kc); prism([[0.02,-0.02],[WX0,-0.02],[WX0,LD0+KW],[0.02,LD0+KW]],-0.26,-0.004,kc);      // the slab under them
  kerb2(WX0-KW/2,LD0,WX0-KW/2,PTZ1); kerb2(0.02,LD0+KW/2,WX0-KW,LD0+KW/2);                                   // the left kerb, on along the pit's steps to the forecourt, and the one along the pit in front of the doorway
  kerb2(DR+dn[0]*KW/2,0.0+dn[1]*KW/2,WX1+dn[0]*KW/2,SE+dn[1]*KW/2); B.box(KW+0.04,0.52,0.22,kc,WX1+KW/2,-0.01,SE); kerb2(WX1+KW/2,SE,WX1+KW/2,BL);      // the right kerb, from the window
  bars(0.06,LD0+KW/2,WX0-KW/2,LD0+KW/2,0.25,1.05); bars(WX0-KW/2,LD0+KW/2,WX0-KW/2,PTZ1-0.04,0.25,1.05);     // plain bars on the left: along the pit in front of the doorway, then out along the bridge and the pit's steps
  zig(WX1+KW/2,SE+0.08,WX1+KW/2,BL-0.04,0.25,1.05);                                                          // and the zig-zag on the right kerb's straight part
  B.box(WX1-WX0+2*KW,0.02,0.05,0xa79f8f,(WX0+WX1)/2,-0.01,BL-0.025);                                       // one step of rough concrete down to the forecourt: the slab's own edge, a worn nosing on it
  /* the pit beside the bridge: its floor well below the forecourt, a flight of narrow steps down into it from the forecourt's edge, the bridge's side wall on their right */
  (function(){const n=7, rs=(LA-PTF)/n, td=(PTZ1-PTZ0)/n;
    B.box(PTW,0.06,PTZ1-PTZ0+0.02,0xb0a896,PTW/2,PTF-0.03,(PTZ0+PTZ1)/2); B.box(PTW+0.1,PTF-GY,PTZ1-PTZ0+0.4,stone,PTW/2,(GY+PTF)/2,(PTZ0+PTZ1)/2);      // its floor, solid under it
    B.box(KW+0.02,-0.26-PTF,PTZ1-PTZ0+0.2,kc,WX0-KW/2,(PTF-0.26)/2,(PTZ0+PTZ1)/2); B.box(PTW,LA-PTF,0.06,stone,PTW/2,(PTF+LA)/2,PTZ0-0.03);       // the bridge's side, the landing's end
    for(let k=0;k<n;k++){const y=LA-rs*(k+1), z1=PTZ1-td*k; B.box(PTW,y-PTF,td,0xc2b4a4,PTW/2,(PTF+y)/2,z1-td/2); B.box(PTW,0.02,0.04,0x9d8f80,PTW/2,y-0.01,z1-td+0.02);}
    B.box(PTW,0.02,0.04,0x9d8f80,PTW/2,LA-0.01,PTZ1-0.02);
    B.box(WX0-0.02,-0.26-GY,PTZ0,stone,WX0/2,(GY-0.26)/2,PTZ0/2);})();                                                                        // under the landing: solid
  B.box(AW-WX1-KW,SE>0?LA-GY:0,BL-SE,stone,(WX1+KW+AW)/2,(GY+LA)/2,(SE+BL)/2); flat(WX1+KW,AW,SE,BL,LA+0.004,concM,2.4);      // right of the bridge the ground comes in as far as SE,
  zig(WX1+KW+0.02,SE+0.04,AW-0.03,SE+0.04,LA,LA+0.95); zig(AW-0.03,SE+0.04,AW-0.03,WELL+0.02,LA,LA+0.95);           // railed along its edge
  B.box(0.3,-0.26-GY,0.3,0xb0a896,(WX0+WX1)/2,(GY-0.26)/2,BL*0.55);                                // a pier under the slab
  const elec=A.MT(tex(64,32,function(g){g.fillStyle='#f1f1ee'; g.fillRect(0,0,64,32); g.fillStyle='#e8762a'; g.beginPath(); g.arc(10,10,6,0,7); g.fill(); g.fillStyle='#333'; g.font='bold 7px sans-serif'; g.fillText('ELECTRA',18,13);}));
  [[4.3,GY,0.42,0],[5.6,GY,0.42,0],[9.3,GY,0.42,0],[10.6,GY,0.42,0],[11.7,GY,0.42,0],          // air conditioners crowding the sunken strip,
   [3.02,-0.95,0.4,0],[3.95,-0.9,0.4,0],[4.9,-1.0,0.4,0],[3.02,-1.62,0.4,0],                  // up on racks under the windows beside the bridge, their tops level with its kerb,
   [0.19,-0.45,1.5,R/2,1],[0.19,-1.15,1.9,R/2,1]].forEach(function(q){                      // and on brackets on number 12's wall, over the pit's steps
    const u=B.at(q[0],q[1],q[2],q[3]);
    u.box(0.82,0.58,0.3,0xeeeeea,0,0.34,0); u.cyl(0.2,0.012,0x3b3f42,0.12,0.36,0.155,18,null,0,R/2); u.box(0.82,0.05,0.34,0xd9d9d4,0,0.05,0); u.box(0.82,0.04,0.04,0x8a8d8f,0,0.02,0.2);
    u.geo(new THREE.PlaneGeometry(0.2,0.1),elec,-0.28,0.52,0.152);
    if(q[4]) [-0.3,0.3].forEach(function(x){u.box(0.04,0.04,0.36,0x6b4a33,x,-0.02,-0.02); u.box(0.04,0.36,0.04,0x6b4a33,x,-0.2,-0.17,0,0.7);});      // the bracket, rusting
    else if(q[1]>GY+0.1) [-0.36,0.36].forEach(function(x){u.box(0.04,q[1]-GY,0.04,0x6b6f72,x,(GY-q[1])/2,0.08);});      // the rack's legs
  });
  function fence(x0,z0,x1,z1,y,h,c,hoops){            // iron fence between two points: rails, bars, a post at each end, hoops on top for the municipal kind
    const len=Math.hypot(x1-x0,z1-z0), a=Math.atan2(x1-x0,z1-z0), f=B.at(x0,y,z0,a);
    f.box(0.03,0.03,len,c,0,h,len/2); f.box(0.03,0.03,len,c,0,0.1,len/2);
    for(let d=0.07;d<len;d+=0.14) f.box(0.014,h-0.1,0.014,c,0,(h+0.1)/2,d);
    f.box(0.05,h+0.06,0.05,c,0,(h+0.06)/2,0); f.box(0.05,h+0.06,0.05,c,0,(h+0.06)/2,len);
    if(hoops) for(let d=0.4;d<len-0.3;d+=0.8) B.geo(new THREE.TorusGeometry(0.2,0.012,4,10,R),c,x0+Math.sin(a)*d,y+h,z0+Math.cos(a)*d,a+R/2);
  }

  /* ---------- number 12's side of the alley, from the photos: an outside stair of white stone with its foot by our steps, climbing along the
     wall toward the café to a concrete landing with a door off it; beyond it green grilles on the ground floor, air conditioners, cables ---------- */
  const SB=AL+1.0, SN=11, SR=0.18, ST=0.28, LT=SB+SN*ST, LY=AY+SN*SR, LD=LT+1.6;      // the stair's foot in the alley; its steps; the landing: its near edge, its height, and its far edge
  for(let k=0;k<SN;k++){const y=AY+SR*(k+1); B.box(0.96,y-AY,ST,0xe9e6de,0.52,AY+(y-AY)/2,SB+ST*(k+0.5)); B.box(0.98,0.025,0.05,0xd4d0c6,0.53,y-0.012,SB+ST*k+0.025);}
  B.box(0.96,0.18,LD-LT,0xd7d2c6,0.52,LY-0.09,(LD+LT)/2);                                                         // the landing slab
  (function(){const sl=Math.hypot(SN*ST,SN*SR), a=-Math.atan2(SN*SR,SN*ST);
    B.box(0.03,0.03,sl,0x1d1f21,1.0,AY+0.92+SN*SR/2,SB+SN*ST/2,0,a);                                                  // black handrail up the open side
    for(let k=0;k<SN;k+=2) B.box(0.016,0.9,0.016,0x1d1f21,1.0,AY+SR*(k+1)+0.45,SB+ST*(k+0.5));
    const rust=0x6b4a33; B.box(0.03,0.03,LD-LT,rust,0.99,LY+0.95,(LD+LT)/2); B.box(0.98,0.03,0.03,rust,0.5,LY+0.95,LD);      // rusty railing round the landing
    for(let z=LT+0.05;z<LD;z+=0.13) B.box(0.014,0.92,0.014,rust,0.99,LY+0.48,z); for(let x=0.08;x<1.0;x+=0.13) B.box(0.014,0.92,0.014,rust,x,LY+0.48,LD);
    [[0.25,LD-0.35],[0.25,LD-0.7]].forEach(function(q){B.cyl(0.11,0.2,0xf4f2ec,q[0],LY+0.1,q[1],10,0.13); B.sph(0.13,0xb84a5a,q[0],LY+0.28,q[1],1,0.7,1);});})();      // geraniums
  const grille=tex(128,192,function(g){g.fillStyle='#3e6f62'; g.fillRect(0,0,128,192); g.fillStyle='#294c42'; g.fillRect(0,0,128,192);
    g.strokeStyle='#4f8a79'; g.lineWidth=5; g.strokeRect(4,4,120,184); for(let x=16;x<124;x+=14){g.beginPath(); g.moveTo(x,6); g.lineTo(x,186); g.stroke();}
    g.lineWidth=3; [[40,60],[88,60],[40,130],[88,130]].forEach(function(q){g.beginPath(); g.moveTo(q[0],q[1]+12); g.bezierCurveTo(q[0]-16,q[1]-2,q[0]-6,q[1]-16,q[0],q[1]-4); g.bezierCurveTo(q[0]+6,q[1]-16,q[0]+16,q[1]-2,q[0],q[1]+12); g.stroke();});
    g.fillStyle='#4f8a79'; g.fillRect(4,92,120,6);});
  const shutterT=tex(64,128,function(g){g.fillStyle='#f1efe9'; g.fillRect(0,0,64,128); g.fillStyle='#cfccc4'; for(let y=0;y<128;y+=5) g.fillRect(0,y,64,1.5);
    g.strokeStyle='#f8f8f6'; g.lineWidth=2; for(let x=4;x<64;x+=8){g.beginPath(); g.moveTo(x,0); g.lineTo(x,128); g.stroke();}});
  [[LD+0.5,LD+1.85],[LD+2.4,LD+3.75]].forEach(function(q){panel(q[1]-q[0],2.3,A.MT(grille),0.035,AY+1.15,(q[0]+q[1])/2,R/2);});            // green grilles with hearts on the ground floor, past the stair
  function barred(z0,z1,y0,y1){panel(z1-z0,y1-y0,A.MT(shutterT),0.035,(y0+y1)/2,(z0+z1)/2,R/2);           // a window shut behind a white roller shutter, white bars in front, rusting
    for(let z=z0+0.06;z<z1;z+=0.115) B.box(0.022,y1-y0+0.1,0.022,0xeeede6,0.11,(y0+y1)/2,z); [y0+0.05,(y0+y1)/2,y1-0.02].forEach(function(y){B.box(0.03,0.03,z1-z0+0.1,0xeeede6,0.11,y,(z0+z1)/2); B.box(0.03,0.012,z1-z0,0x9a6a3e,0.105,y-0.02,(z0+z1)/2);});
    [z0-0.03,z1+0.03].forEach(function(z){B.box(0.12,0.04,0.04,0xeeede6,0.06,y1-0.02,z); B.box(0.12,0.04,0.04,0xeeede6,0.06,y0+0.05,z);});}
  barred(LT+0.3,LD-0.1,AY+0.5,AY+2.05);      // under the landing
  panel(0.9,2.0,A.MT(tex(32,64,function(g){g.fillStyle='#8f9496'; g.fillRect(0,0,32,64); g.strokeStyle='#6f7476'; g.strokeRect(3,3,26,58);})),0.035,LY+1.0,(LD+LT)/2,R/2);   // the door off the landing
  [[0.18,AY+2.55,15.6,1],[0.18,AY+2.95,SB+0.2,1],[0.16,AY+2.4,17.4,1],[0.18,LA+0.32,2.95,0],[0.18,LA+0.9,2.95,0],[0.18,AY+0.32,SB+2.3,0],[0.2,AY+4.6,12.6,1],[0.2,AY+4.3,9.0,1],[0.2,AY+7.4,11.0,1],[0.2,AY+3.6,4.9,1],[0.2,AY+3.2,1.6,1]].forEach(function(q){const u=B.at(q[0],q[1],q[2],R/2);      // air conditioners on the wall up every floor, two stacked on the forecourt, one under the stair
    B.bake(det.ac({brand:['electra','tadiran','plain','haier'][Math.round(q[2]*3)%4],bracket:!!q[3],up:0.6,drain:q[3]?1.4:0.3}),q[0]-0.16,q[1]-0.28,q[2],R/2);});
  B.box(0.02,1.4,0.02,0x8f9294,0.05,AY+2.0,9.4);
  /* ---------- planting ---------- */
  function bed(x0,x1,z0,z1,h,y){B.box(x1-x0,h,z1-z0,0xb9ab90,(x0+x1)/2,y+h/2,(z0+z1)/2); B.box(x1-x0-0.36,0.02,z1-z0-0.36,0x4d4334,(x0+x1)/2,y+h+0.002,(z0+z1)/2);}      // planted bed, a low border of washed concrete
  function shrub(x,z,r,c,y){const t=det.tree('shrub',{w:r*2.1,h:r*1.5,d:r*2.1,seed:Math.floor(x*13+z*7),n:Math.round(26+r*90),size:0.36+r*0.2,tint:c===0x2a5a3a?0xb8c8a8:c===0x9fb04a?0xf0f0b0:0xffffff});
    B.bake(t.crown,x,y,z,0); B.bake(t.wood,x,y,z,0);}
  function palm(x,z,h,s,y0,n){const t=det.tree('palm',{h:h/s,s:s*0.95,n:n||22,seed:Math.floor(x*31+z),dates:h>2.5,dead:h>1?6:0}); B.bake(t.wood,x,y0,z,0); B.bake(t.crown,x,y0,z,0);}      // a date palm: a trunk of old leaf bases, arching fronds
  function ficus(x,z,s,a0,y0,pit){                     // the old fig that roofs the square: a smooth grey trunk on buttress roots, heavy limbs, aerial roots, one wide crown
    if(pit) B.box(1.5,0.1,1.5,0x4d4334,x,y0+0.052,z);
    const t=det.tree('ficus',{s:s,a0:a0,seed:Math.floor(x*7+z*3)}); B.bake(t.wood,x,y0,z,0); C.bake(t.crown,x,y0,z,0);
  }
  function yucca(x,z,h,s,y0){const t=det.tree('yucca',{h:h/s,s:s,a0:x*3+z,seed:Math.floor(x*11+z*5)}); B.bake(t.wood,x,y0,z,0); B.bake(t.crown,x,y0,z,0);}      // a spiky yucca: a few trunks, each with a burst of stiff, striped leaves
  function tree(x,z,s,a0,y){const t=det.tree('broad',{s:s,a0:a0,seed:Math.floor(x*17+z*3)}); B.bake(t.wood,x,y,z,0); C.bake(t.crown,x,y,z,0);}      // a broad old tree: trunk, limbs, and a low crown spreading over the alley
  function clump(bt,x,y,z,rx,ry,rz,n,o){o=o||{}; const g=new THREE.Group(); det.crown(Object.assign({c:[0,0,0],r:[rx,ry,rz],n:n,size:0.5,seed:Math.floor(x*13+y*7+z*3),cell:'broad'},o),g); bt.bake(g,x,y,z,0);}      // a mass of leaves on its own
  const rg=A.rng(23);
  /* ---------- the garden, from the photos from Haroe St and from inside it. Between the café and Beit HaChayal a kerb with a green fence of hoops lines the
     pavement, an old fig in the pavement at either end. Through the gap in it you walk onto a strip of gravel: the round memorial stone in a fenced bed on
     your left, the grey electricity cabinets beside it on the pavement, two benches on your right, the brown board with the garden's name and rules, a bin.
     Three steps go down from it into the garden, and three more from the café's terrace. Down there it is paved all over in washed gravel, brown going
     pink, a darker band winding down the middle: a broad landing under the steps, a path that winds on down to a round square in front of the building
     across our yard, a round planter in its middle and an old fig growing out of the paving beside it, and another that winds down past the old fig in
     front of our building and out into the alley. Everything else is raised beds: low walls of rough yellow stone round the back of the round squares,
     elsewhere a border of washed concrete with a low green fence on it; palms, figs, yuccas and big-leaved plants in them. ---------- */
  const spline=function(pts,step){const out=[]; for(let i=0;i<pts.length-1;i++){const p0=pts[Math.max(0,i-1)], p1=pts[i], p2=pts[i+1], p3=pts[Math.min(pts.length-1,i+2)], n=Math.max(2,Math.ceil(Math.hypot(p2[0]-p1[0],p2[1]-p1[1])/step));
      for(let k=0;k<n;k++){const t=k/n, t2=t*t, t3=t2*t, f=function(a,b,c,d){return 0.5*(2*b+(c-a)*t+(2*a-5*b+4*c-d)*t2+(3*b-a-3*c+d)*t3);}; out.push([f(p0[0],p1[0],p2[0],p3[0]),f(p0[1],p1[1],p2[1],p3[1])]);}}
    out.push(pts[pts.length-1]); return out;};      // a smooth line through the points, one every step
  const PC=[19.4,12.2,4.3], PW=[8.0,12.6,2.5], PLANT=[[19.4,12.2,1.3]], BH=AY+0.38, KH=0.45;      // the round square before the building across the yard, and its planter; the little one before ours; the beds' earth; their walls
  const GP=[[2.8,[[7.9,21.25],[10.6,21.1],[13.2,20.75],[15.9,21.0],[18.2,21.4]]],      // the paved ways, [width, points]: the landing under the two flights of steps;
    [2.2,[[16.9,20.3],[18.9,18.8],[18.0,17.2],[19.0,15.6],[19.4,14.6]]],               // from it, winding down to the round square;
    [1.9,[[15.6,12.6],[13.6,13.8],[11.6,13.4],[9.8,12.8]]],                            // from there across to the little one before our building;
    [1.8,[[9.3,20.3],[7.8,18.4],[8.7,16.6],[7.7,14.6]]],                               // from the landing down to it, under the café's side;
    [1.4,[[6.0,11.8],[4.6,11.1],[AW-0.6,11.05]]]]                                      // and from it out into the alley
    .map(function(p){const q=spline(p[1],0.25); let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9; q.forEach(function(c){x0=Math.min(x0,c[0]); x1=Math.max(x1,c[0]); z0=Math.min(z0,c[1]); z1=Math.max(z1,c[1]);}); return {w:p[0],pts:q,bb:[x0,x1,z0,z1]};});
  const segD=function(q,x,z){let d=1e9; for(let i=1;i<q.length;i++){const a=q[i-1], b=q[i], dx=b[0]-a[0], dz=b[1]-a[1], l2=dx*dx+dz*dz||1e-6, t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/l2)); d=Math.min(d,Math.hypot(a[0]+t*dx-x,a[1]+t*dz-z));} return d;};
  const paved=function(x,z){let d=Math.min(Math.hypot(x-PC[0],z-PC[1])-PC[2],Math.hypot(x-PW[0],z-PW[1])-PW[2]);      // how far a point lies off the paving (below 0: on it); the planter is a bed
    GP.forEach(function(p){const b=p.bb; if(Math.max(b[0]-x,x-b[1],b[2]-z,z-b[3],0)-p.w/2<d) d=Math.min(d,segD(p.pts,x,z)-p.w/2);});
    PLANT.forEach(function(q){d=Math.max(d,q[2]-Math.hypot(x-q[0],z-q[1]));}); return d;};
  const inGarden=function(x,z,m){m=m||0; if(z>GZ-m) return false; return (x>AW+m&&x<FW&&z>WELL+m)||(x>=FW&&x<XB&&z>YY+m)||(x>=XB&&x<LBH-m&&z>YB+m);};
  const EDGE=[[AW,GZ],[AW,WELL],[FW,WELL],[FW,YY],[XB,YY],[XB,YB],[LBH,YB],[LBH,GZ]];
  const inside=function(x,z){let d=1e9; for(let i=0;i<EDGE.length;i++) d=Math.min(d,segD([EDGE[i],EDGE[(i+1)%EDGE.length]],x,z)); return inGarden(x,z)?d:-d;};      // how far in from the garden's edge
  const okAt=function(x,z,r){return inside(x,z)>r*0.5+0.12&&paved(x,z)>r*0.7+0.22;};      // room to grow: in a bed, clear of its walls
  const PLZ=[15.4,18.45,GZ,26.45], ENT=[15.55,17.65];      // the strip of gravel inside the gate, and the gate in the fence

  /* the ground: washed gravel under everything, the beds' earth raised over it, a low wall wherever the two meet */
  const gravT=tex(512,512,function(g){const r=A.rng(818), C=['rgba(208,192,176,0.9)','rgba(122,100,86,0.85)','rgba(180,152,136,0.9)','rgba(228,218,206,0.85)','rgba(94,76,64,0.8)','rgba(196,160,146,0.85)'];
    g.fillStyle='#9e8676'; g.fillRect(0,0,512,512);
    for(let i=0;i<36;i++){const x=r()*512, y=r()*512, q=30+r()*90, gr=g.createRadialGradient(x,y,0,x,y,q); gr.addColorStop(0,r()<0.5?'rgba(80,58,46,0.16)':'rgba(220,200,186,0.14)'); gr.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=gr; g.fillRect(x-q,y-q,2*q,2*q);}
    for(let i=0;i<34000;i++){const s=1+r()*1.8; g.fillStyle=C[Math.floor(r()*C.length)]; g.fillRect(r()*512,r()*512,s,s*(0.7+r()*0.5));}      // the grains, a few millimetres each
    for(let i=0;i<6;i++){g.save(); g.translate(r()*512,r()*512); g.rotate(r()*7); const l=8+r()*5; g.fillStyle=['#6e5634','#5e5030','#7a5e3a'][i%3]; g.beginPath(); g.ellipse(0,0,l,l*0.45,0,0,7); g.fill(); g.restore();}      // a few fallen fig leaves
    for(let i=0;i<26;i++){g.fillStyle='rgba(70,36,48,0.55)'; g.beginPath(); g.arc(r()*512,r()*512,2,0,7); g.fill();}},true), gravM=A.MT(gravT,null,true);
  const washT=tex(256,128,function(g){const r=A.rng(515), C=['#cdbfae','#8e7d6f','#bfa392','#e2d8cb','#7a6a5e','#a88d7e'];      // washed concrete: pink and grey pebbles standing out of it
    g.fillStyle='#ac9b8b'; g.fillRect(0,0,256,128);
    for(let i=0;i<4200;i++){const s=0.8+r()*2.2; g.fillStyle=C[Math.floor(r()*C.length)]; g.beginPath(); g.ellipse(r()*256,r()*128,s,s*(0.6+r()*0.4),r()*3,0,7); g.fill();}
    for(let i=0;i<10;i++){const x=r()*256, y=r()*128, q=8+r()*26, gr=g.createRadialGradient(x,y,0,x,y,q); gr.addColorStop(0,'rgba(60,45,35,0.16)'); gr.addColorStop(1,'rgba(60,45,35,0)'); g.fillStyle=gr; g.fillRect(x-q,y-q,2*q,2*q);}},true), washM=A.MT(washT,null,true);
  const stoneT=tex(512,256,function(g){const r=A.rng(616), C=[[200,178,135],[186,163,118],[212,194,152],[176,150,105],[196,170,122],[168,146,110]];      // rough yellow stones in two courses, dark joints between
    g.fillStyle='#5d5243'; g.fillRect(0,0,512,256);
    for(let row=0;row<2;row++){const y0=row*128; let x=-r()*140; const x0=x;
      while(x<x0+512){const w=Math.min(110+r()*130,x0+512-x), c=C[Math.floor(r()*C.length)], h=118-r()*10;
        [0,512].forEach(function(o){const bx=x+o+4, by=y0+5+r()*3;
          g.fillStyle='rgb('+c[0]+','+c[1]+','+c[2]+')'; g.beginPath(); g.moveTo(bx+10,by); g.lineTo(bx+w-14,by+2); g.quadraticCurveTo(bx+w-6,by+4,bx+w-7,by+16); g.lineTo(bx+w-9,by+h-12); g.quadraticCurveTo(bx+w-10,by+h,bx+w-22,by+h); g.lineTo(bx+8,by+h-2); g.quadraticCurveTo(bx,by+h-4,bx+1,by+h-16); g.lineTo(bx+2,by+12); g.quadraticCurveTo(bx+2,by,bx+10,by); g.fill();
          for(let k=0;k<70;k++){const px=bx+4+r()*(w-16), py=by+4+r()*(h-10), q=1+r()*3.5; g.fillStyle=r()<0.6?'rgba(90,70,45,'+(0.15+r()*0.3)+')':'rgba(240,226,190,'+(0.2+r()*0.3)+')'; g.beginPath(); g.arc(px,py,q,0,7); g.fill();}      // pitted and worn
          g.fillStyle='rgba(255,245,215,0.22)'; g.fillRect(bx+8,by+1,w-24,4); g.fillStyle='rgba(50,38,26,0.25)'; g.fillRect(bx+6,by+h-6,w-22,5);});
        x+=w;}}},true), stoneM=A.MT(stoneT,null,true);
  const soilT=tex(256,256,function(g){const r=A.rng(717); g.fillStyle='#4b3e2f'; g.fillRect(0,0,256,256);
    for(let i=0;i<3600;i++){g.fillStyle=['#5b4b39','#3a2f24','#675541','#4f5a34','#3e4a2a'][Math.floor(r()*5)]; g.fillRect(r()*256,r()*256,1+r()*2.5,1+r()*2);}
    for(let i=0;i<70;i++){g.save(); g.translate(r()*256,r()*256); g.rotate(r()*7); const l=2.5+r()*3; g.fillStyle=['#6a5a34','#7a6236','#4f5a2e','#82663c','#5b4a2c'][i%5]; g.beginPath(); g.ellipse(0,0,l,l*0.45,0,0,7); g.fill(); g.restore();}},true), soilM=A.MT(soilT,null,true);
  [[AW,FW,WELL],[FW,XB,YY],[XB,LBH,YB]].forEach(function(q){flat(q[0],q[1],q[2],GZ,AY+0.004,gravM,2.4); flat(q[0],q[1],q[2],GZ,AY+0.02,shadeM,18).renderOrder=1;});      // the paving, in the trees' dappled shade
  const GX0=AW, GZ0=YY, GSX=LBH-AW, GSZ=GZ-YY, GPX=16;
  const bandT=tex(Math.round(GSX*GPX),Math.round(GSZ*GPX),function(g){const X=function(x){return (x-GX0)*GPX;}, Z=function(z){return (z-GZ0)*GPX;};      // over it: the darker band winding down the middle, and the dark ring round the fig
    g.clearRect(0,0,GSX*GPX,GSZ*GPX); g.lineCap=g.lineJoin='round';
    const band=spline([[16.6,22.6],[16.8,20.9],[18.0,19.4],[18.3,17.6],[18.7,16.0],[19.2,14.5],[19.4,13.6]],0.2);
    [[1.15,'rgba(96,64,48,0.18)'],[0.8,'rgba(92,60,44,0.32)']].forEach(function(s){g.strokeStyle=s[1]; g.lineWidth=s[0]*GPX; g.beginPath(); band.forEach(function(p,i){if(i) g.lineTo(X(p[0]),Z(p[1])); else g.moveTo(X(p[0]),Z(p[1]));}); g.stroke();});
    const gr=g.createRadialGradient(X(22),Z(14),0,X(22),Z(14),1.4*GPX); gr.addColorStop(0,'rgba(48,36,28,0.7)'); gr.addColorStop(0.45,'rgba(60,44,32,0.45)'); gr.addColorStop(1,'rgba(60,44,32,0)'); g.fillStyle=gr; g.fillRect(X(20.5),Z(12.5),2.8*GPX,2.8*GPX);});
  const bandM=A.MT(bandT,null,true); bandM.transparent=true; bandM.depthWrite=false;
  function gflat(x0,x1,z0,z1,y,m){const g=new THREE.BufferGeometry(), u=function(x){return (x-GX0)/GSX;}, v=function(z){return 1-(z-GZ0)/GSZ;};      // a piece laid over the garden as a whole
    g.setAttribute('position',new THREE.Float32BufferAttribute([x0,y,z0, x0,y,z1, x1,y,z1, x1,y,z0],3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute([u(x0),v(z0), u(x0),v(z1), u(x1),v(z1), u(x1),v(z0)],2));
    g.setIndex([0,1,2,0,2,3]); g.computeVertexNormals(); const m2=new THREE.Mesh(g,m); m2.receiveShadow=true; st.add(m2); return m2;}
  [[AW,FW,WELL],[FW,XB,YY],[XB,LBH,YB]].forEach(function(q){gflat(q[0],q[1],q[2],GZ,AY+0.012,bandM).renderOrder=1;});
  flat(CW,LBH,GZ,PV,U+0.004,soilM,2); flat(PLZ[0],PLZ[1],GZ,PLZ[3],U+0.008,gravM,2.4); flat(ENT[0],ENT[1],PLZ[3]-0.01,PV,U+0.008,gravM,2.4);      // up at the street's level: the beds either side, the gravel inside the gate

  /* where the paving ends and the beds begin, found on a 10 cm grid: the beds' earth over every cell, or part of a cell, that is bed; a wall along every line between */
  const MS=0.1, MX0=AW-0.25, MZ0=YY-0.25, MNX=Math.ceil((LBH+0.25-MX0)/MS), MNZ=Math.ceil((GZ+0.25-MZ0)/MS), NN=MNX+1, FV=new Float32Array(NN*(MNZ+1)), GV=new Float32Array(NN*(MNZ+1));
  for(let j=0;j<=MNZ;j++) for(let i=0;i<=MNX;i++){const x=MX0+i*MS, z=MZ0+j*MS; FV[j*NN+i]=paved(x,z); GV[j*NN+i]=inside(x,z);}
  (function(){const P=[], Uv=[], val=function(i,j){const k=j*NN+i; return Math.min(FV[k],GV[k]);}, at=function(i,j){return [MX0+i*MS,MZ0+j*MS];};
    const put=function(a,b,c){if((b[1]-a[1])*(c[0]-a[0])-(b[0]-a[0])*(c[1]-a[1])<0){const t=b; b=c; c=t;} [a,b,c].forEach(function(p){P.push(p[0],BH,p[1]); Uv.push(p[0]/2,p[1]/2);});};      // facing up
    for(let j=0;j<MNZ;j++){let run=-1;
      for(let i=0;i<=MNX;i++){
        const full=i<MNX&&val(i,j)>0&&val(i+1,j)>0&&val(i+1,j+1)>0&&val(i,j+1)>0;
        if(full){if(run<0) run=i; continue;}
        if(run>=0){put(at(run,j),at(i,j),at(i,j+1)); put(at(run,j),at(i,j+1),at(run,j+1)); run=-1;}      // a row of whole cells at once
        if(i===MNX) break;
        const c=[[i,j],[i+1,j],[i+1,j+1],[i,j+1]], v=c.map(function(q){return val(q[0],q[1]);}), poly=[];
        for(let k=0;k<4;k++){const a=c[k], b=c[(k+1)%4], va=v[k], vb=v[(k+1)%4];
          if(va>0) poly.push(at(a[0],a[1]));
          if((va>0)!==(vb>0)){const t=va/(va-vb); poly.push([MX0+(a[0]+(b[0]-a[0])*t)*MS,MZ0+(a[1]+(b[1]-a[1])*t)*MS]);}}
        for(let k=1;k<poly.length-1;k++) put(poly[0],poly[k],poly[k+1]);}}
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(Uv,2)); g.computeVertexNormals();
    const m=new THREE.Mesh(g,soilM); m.receiveShadow=true; st.add(m);})();
  const lines=(function(){const segs=[], eid=function(i,j,v){return (j*NN+i)*2+v;};      // the lines where the paving meets a bed, strung together from the cells' pieces
    for(let j=0;j<MNZ;j++) for(let i=0;i<MNX;i++){
      const C=[[i,j],[i+1,j],[i+1,j+1],[i,j+1]], f=C.map(function(q){return FV[q[1]*NN+q[0]];}), E=[[0,1,eid(i,j,0)],[1,2,eid(i+1,j,1)],[3,2,eid(i,j+1,0)],[0,3,eid(i,j,1)]], X=[];
      E.forEach(function(e,k){const fa=f[e[0]], fb=f[e[1]]; if((fa<0)!==(fb<0)){const t=fa/(fa-fb), a=C[e[0]], b=C[e[1]]; X[k]={p:[MX0+(a[0]+(b[0]-a[0])*t)*MS,MZ0+(a[1]+(b[1]-a[1])*t)*MS],e:e[2]};}});
      const ks=[0,1,2,3].filter(function(k){return X[k];}); let pairs=[];
      if(ks.length===2) pairs=[[ks[0],ks[1]]]; else if(ks.length===4) pairs=((f[0]+f[1]+f[2]+f[3])/4<0)===(f[0]<0)?[[0,1],[2,3]]:[[0,3],[1,2]];
      pairs.forEach(function(pr){const a=X[pr[0]], b=X[pr[1]]; if(inside((a.p[0]+b.p[0])/2,(a.p[1]+b.p[1])/2)>0.04) segs.push({a:a.p,b:b.p,ea:a.e,eb:b.e});});}
    const byE=new Map(); segs.forEach(function(s,k){[s.ea,s.eb].forEach(function(e){const l=byE.get(e); if(l) l.push(k); else byE.set(e,[k]);});});
    const used=new Uint8Array(segs.length), out=[];
    segs.forEach(function(s0,k0){if(used[k0]) return; used[k0]=1; const line=[s0.a,s0.b];
      [[s0.eb,true],[s0.ea,false]].forEach(function(w){let e=w[0];
        for(;;){const l=byE.get(e)||[]; let nk=-1; for(let i=0;i<l.length;i++) if(!used[l[i]]){nk=l[i]; break;} if(nk<0) break;
          used[nk]=1; const s=segs[nk], p=s.ea===e?s.b:s.a; e=s.ea===e?s.eb:s.ea; if(w[1]) line.push(p); else line.unshift(p);}});
      const closed=line.length>3&&Math.hypot(line[0][0]-line[line.length-1][0],line[0][1]-line[line.length-1][1])<1e-4; if(closed) line.pop();
      if(line.length<2) return; const n=line.length, sm=line.map(function(p,i){if(!closed&&(i===0||i===n-1)) return p; const a=line[(i-1+n)%n], b=line[(i+1)%n]; return [(a[0]+2*p[0]+b[0])/4,(a[1]+2*p[1]+b[1])/4];});
      out.push({pts:sm,closed:closed});});
    return out;})();
  const kindAt=function(p){if(Math.abs(Math.hypot(p[0]-PLANT[0][0],p[1]-PLANT[0][1])-PLANT[0][2])<0.3) return 'rim';      // what the wall is: the planter's rim, rough stone round the back of the round squares, or a bed's border
    const dc=Math.hypot(p[0]-PC[0],p[1]-PC[1])-PC[2], dw=Math.hypot(p[0]-PW[0],p[1]-PW[1])-PW[2];
    if((Math.abs(dc)<0.2&&p[1]<PC[1]+1.4)||(Math.abs(dw)<0.2&&p[1]<PW[1]+0.6)) return 'stone'; return 'bed';};
  const WALL={stone:{h:0.5,t:0.34,m:stoneM},bed:{h:KH,t:0.16,m:washM},rim:{h:0.42,t:0.2,m:washM}};
  function ribbon(q,closed,w){      // a low wall along a line on the paving's edge, its face to the paving, w.t thick into the bed
    const n=q.length; let vote=0;
    for(let i=0;i<n-1;i++){const a=q[i], b=q[i+1], dx=b[0]-a[0], dz=b[1]-a[1], l=Math.hypot(dx,dz)||1, mx=(a[0]+b[0])/2, mz=(a[1]+b[1])/2; vote+=paved(mx-dz/l*0.08,mz+dx/l*0.08)>paved(mx+dz/l*0.08,mz-dx/l*0.08)?1:-1;}
    const sd=vote>=0?1:-1, N=[], S=[0], P=[], Uv=[], y0=AY, y1=AY+w.h, yb=BH-0.03;
    for(let i=0;i<n;i++){const a=q[closed?(i-1+n)%n:Math.max(0,i-1)], b=q[closed?(i+1)%n:Math.min(n-1,i+1)], dx=b[0]-a[0], dz=b[1]-a[1], l=Math.hypot(dx,dz)||1; N.push([-dz/l*sd,dx/l*sd]); if(i) S.push(S[i-1]+Math.hypot(q[i][0]-q[i-1][0],q[i][1]-q[i-1][1]));}
    const quad=function(a,b,c,d,ua,ub,uc,ud,want){const ux=b[0]-a[0], uy=b[1]-a[1], uz=b[2]-a[2], vx=c[0]-a[0], vy=c[1]-a[1], vz=c[2]-a[2];
      let T=[[a,ua],[b,ub],[c,uc],[a,ua],[c,uc],[d,ud]]; if((uy*vz-uz*vy)*want[0]+(uz*vx-ux*vz)*want[1]+(ux*vy-uy*vx)*want[2]<0) T=[[a,ua],[c,uc],[b,ub],[a,ua],[d,ud],[c,uc]];
      T.forEach(function(e){P.push(e[0][0],e[0][1],e[0][2]); Uv.push(e[1][0],e[1][1]);});};
    const V=function(i){const p=q[i], m=N[i]; return {i0:[p[0],y0,p[1]],i1:[p[0],y1,p[1]],o1:[p[0]+m[0]*w.t,y1,p[1]+m[1]*w.t],ob:[p[0]+m[0]*w.t,yb,p[1]+m[1]*w.t],o0:[p[0]+m[0]*w.t,y0,p[1]+m[1]*w.t]};};
    for(let i=0;i<(closed?n:n-1);i++){const j=(i+1)%n, A1=V(i), B1=V(j), sa=S[i]/1.2, sb=(j===0?S[n-1]+Math.hypot(q[0][0]-q[n-1][0],q[0][1]-q[n-1][1]):S[j])/1.2, hv=w.h/0.6, fn=[-(N[i][0]+N[j][0]),0,-(N[i][1]+N[j][1])];
      quad(A1.i0,B1.i0,B1.i1,A1.i1,[sa,0],[sb,0],[sb,hv],[sa,hv],fn);                                   // its face
      quad(A1.i1,B1.i1,B1.o1,A1.o1,[sa,hv],[sb,hv],[sb,hv+w.t/0.6],[sa,hv+w.t/0.6],[0,1,0]);           // its top
      quad(A1.o1,B1.o1,B1.ob,A1.ob,[sa,hv],[sb,hv],[sb,0.1],[sa,0.1],[-fn[0],0,-fn[2]]);}              // and what shows of its back over the earth
    if(!closed) [[0,1],[n-1,n-2]].forEach(function(e){const E1=V(e[0]), d=[q[e[0]][0]-q[e[1]][0],0,q[e[0]][1]-q[e[1]][1]]; quad(E1.i0,E1.o0,E1.o1,E1.i1,[0,0],[w.t/1.2,0],[w.t/1.2,w.h/0.6],[0,w.h/0.6],d);});      // its ends
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(Uv,2)); B.geo(g,w.m,0,0,0);
    return {N:N,S:S};
  }
  lines.forEach(function(L){      // each line cut where the kind of wall changes, the pieces meeting at the cut
    const q=L.pts, n=q.length, k=q.map(kindAt); let s0=0;
    if(L.closed){let c=-1; for(let i=0;i<n;i++) if(k[i]!==k[(i-1+n)%n]){c=i; break;} if(c<0){const r=ribbon(q,true,WALL[k[0]]); if(k[0]==='bed') rail(q,r,true,WALL.bed); return;} s0=c;}
    const seq=L.closed?q.slice(s0).concat(q.slice(0,s0+1)):q, ks=L.closed?k.slice(s0).concat(k.slice(0,s0+1)):k;
    let a=0; for(let i=1;i<=seq.length;i++) if(i===seq.length||ks[i]!==ks[a]){const piece=seq.slice(a,Math.min(i+1,seq.length)); if(piece.length>1){const r=ribbon(piece,false,WALL[ks[a]]); if(ks[a]==='bed') rail(piece,r,false,WALL.bed);} a=i;}
  });
  function rail(q,r,closed,w){      // the low green fence along the top of a bed's border, a post every metre or so
    const n=q.length, len=closed?r.S[n-1]+Math.hypot(q[0][0]-q[n-1][0],q[0][1]-q[n-1][1]):r.S[n-1]; if(len<0.5) return;
    const at=function(i){const p=q[i%n], m=r.N[i%n]; return [p[0]+m[0]*w.t/2,p[1]+m[1]*w.t/2];}, idx=[0];
    for(let i=1;i<n;i++) if(r.S[i]-r.S[idx[idx.length-1]]>=1.1) idx.push(i);
    if(closed) idx.push(n); else if(idx[idx.length-1]!==n-1) idx.push(n-1);
    for(let k=1;k<idx.length;k++){const a=at(idx[k-1]), b=at(idx[k]); fence(a[0],a[1],b[0],b[1],AY+w.h,0.55,green);}
  }
  /* round the garden's edge: a kerb as high as the beds' walls, and the fences on it */
  B.box(FW-AW,KH,0.12,kerb,(AW+FW)/2,AY+KH/2,WELL+0.06); B.box(XB-FW,KH,0.12,kerb,(FW+XB)/2,AY+KH/2,YY+0.06); B.box(0.12,KH,WELL-YY,kerb,FW+0.06,AY+KH/2,(YY+WELL)/2);      // over the sunken strip and the yard
  B.box(0.14,KH,GZ-YB,kerb,LBH-0.07,AY+KH/2,(YB+GZ)/2); B.box(LBH-XB,KH,0.14,kerb,(XB+LBH)/2,AY+KH/2,YB+0.07);      // and along Beit HaChayal and the building across the yard
  fence(AW,WELL+0.04,FW-0.1,WELL+0.04,AY+KH,0.8,wrail);      // along the edge of the sunken strip
  fence(FW+0.06,WELL,FW+0.06,YY+0.12,AY+KH,0.8,iron); fence(FW+0.06,YY+0.06,XB-0.05,YY+0.06,AY+KH,0.8,iron);      // and on round its end, over the yard, to the building across it
  const PG=[10.35,11.75];      // where the path comes out into the alley
  B.box(0.12,KH,PG[0]-WELL,kerb,AW+0.06,AY+KH/2,(WELL+PG[0])/2); B.box(0.12,KH,GZ-PG[1],kerb,AW+0.06,AY+KH/2,(PG[1]+GZ)/2);
  fence(AW+0.06,WELL+0.12,AW+0.06,PG[0],AY+KH,0.62,green); fence(AW+0.06,PG[1],AW+0.06,GZ-0.05,AY+KH,0.62,green);      // the low green fence between the alley and the garden, open where the path comes out

  /* the flights: three steps of washed concrete, each 15 cm, down from the street's level; where they stand out into the garden, a stepped cheek and a handrail each side */
  function flight(x0,x1,open){const w=x1-x0, xc=(x0+x1)/2;
    for(let k=1;k<NST;k++){const y=U-k*SRS, z0=GZ-k*FLT;
      B.box(w,y-GY,FLT,0xc2b4a4,xc,(GY+y)/2,z0+FLT/2); B.box(w,0.025,0.04,0x9d8f80,xc,y-0.012,z0+0.02);
      if(open) [x0-0.07,x1+0.07].forEach(function(x){B.box(0.14,y+0.14-AY,FLT,0xb9aa99,x,(AY+y+0.14)/2,z0+FLT/2);});}
    const a=-Math.atan2(NST*SRS,FLL+FLT), sl=Math.hypot(NST*SRS,FLL+FLT);
    (open?[x0-0.07,x1+0.07]:[x1-0.06]).forEach(function(x){B.box(0.035,0.035,sl,iron,x,(U+AY)/2+0.92,GZ+0.15-(FLL+FLT)/2,0,a);
      for(let k=0;k<=NST;k+=2) B.box(0.025,0.92,0.025,iron,x,U-k*SRS+0.46,GZ+0.15-k*FLT);});}
  FL.forEach(function(f,i){flight(f[0],f[1],i>0);});
  function vwall(x0,x1,z,y0,y1,m){const g=new THREE.BufferGeometry();      // an upright face along x, toward -z, its texture laid out in metres
    g.setAttribute('position',new THREE.Float32BufferAttribute([x0,y0,z, x1,y0,z, x1,y1,z, x0,y1,z],3)); g.setAttribute('uv',new THREE.Float32BufferAttribute([x0/1.2,(y0-AY)/0.6, x1/1.2,(y0-AY)/0.6, x1/1.2,(y1-AY)/0.6, x0/1.2,(y1-AY)/0.6],2));
    g.setIndex([0,2,1,0,3,2]); B.geo(g,m,0,0,0);}
  [[AW,FL[1][0]],[FL[1][1],FL[2][0]],[FL[2][1],LBH]].forEach(function(q){vwall(q[0],q[1],GZ-0.006,AY,U,washM);});      // the drop faced in washed concrete
  [[AW,FL[1][0]],[FL[1][1],CW],[CW,FL[2][0]],[FL[2][1],LBH]].forEach(function(q){B.box(q[1]-q[0],0.07,0.3,0xb8a998,(q[0]+q[1])/2,U+0.035,GZ+0.15);});      // a coping along the top of it
  B.box(FL[1][0]-AW,0.45,0.24,0xe9e5da,(AW+FL[1][0])/2,U+0.225,GZ+0.12); fence(AW,GZ+0.12,FL[1][0]-0.08,GZ+0.12,U+0.45,0.5,iron);      // the back of the café's terrace: a low white wall, a railing on it
  [[CW,FL[2][0]-0.08],[FL[2][1]+0.08,LBH]].forEach(function(q){B.box(q[1]-q[0],0.3,0.16,kerb,(q[0]+q[1])/2,U+0.15,GZ+0.1); fence(q[0],GZ+0.1,q[1],GZ+0.1,U+0.3,0.62,green);});      // and over the garden: a kerb, a green fence on it
  fence(CW,GZ+0.25,CW,PV-0.06,U,0.95,green);      // a taller green fence between the café and the garden
  [[13.2,ENT[0]],[ENT[1],LBH]].forEach(function(q){B.box(q[1]-q[0],0.3,0.16,kerb,(q[0]+q[1])/2,U+0.15,PV-0.08); fence(q[0],PV-0.08,q[1],PV-0.08,U+0.3,0.62,green,true);});      // the garden's front on the pavement, hoops on top
  [PLZ[0]-0.07,PLZ[1]+0.07].forEach(function(x){B.box(0.14,0.3,PLZ[3]-GZ-0.15,kerb,x,U+0.15,(GZ+0.15+PLZ[3])/2);});      // the gravel strip's kerbs,
  B.box(PLZ[1]-ENT[1],0.3,0.14,kerb,(ENT[1]+PLZ[1])/2,U+0.15,PLZ[3]+0.07); B.box(0.14,0.3,PV-PLZ[3],kerb,ENT[1]+0.07,U+0.15,(PLZ[3]+PV)/2);
  B.box(ENT[0]-13.25,0.3,0.14,kerb,(13.25+ENT[0])/2,U+0.15,PLZ[3]+0.07); B.box(0.14,0.3,PV-PLZ[3],kerb,ENT[0]-0.07,U+0.15,(PLZ[3]+PV)/2);      // and the memorial stone's bed, a low fence round it
  B.box(ENT[0]-0.14-13.25,0.26,PV-0.16-PLZ[3]-0.14,soil,(13.25+ENT[0]-0.14)/2,U+0.13,(PLZ[3]+0.14+PV-0.16)/2);
  fence(13.3,PLZ[3]+0.07,ENT[0]-0.07,PLZ[3]+0.07,U+0.3,0.42,green,true); fence(ENT[0]-0.07,PLZ[3]+0.07,ENT[0]-0.07,PV-0.16,U+0.3,0.42,green,true);
  B.box(0.2,1.7,PV-GZ+0.2,0xd9c6b2,LBH+0.1,U+0.85,(GZ+PV)/2); B.box(0.26,0.06,PV-GZ+0.2,0xc9b6a2,LBH+0.1,U+1.72,(GZ+PV)/2);      // Beit HaChayal's rough pink wall closes it on the right

  /* what grows, in the beds */
  const gBlock=[], gSeat=[], gLamp=[];      // what stands on the paving, for walkers to go round
  PLANT.forEach(function(q){for(let k=0;k<7;k++){const a=k*2.4, d=k?q[2]*0.55:0; shrub(q[0]+Math.cos(a)*d,q[1]+Math.sin(a)*d,0.3+(k%3)*0.06,k%3===1?0x2a5a3a:leaf[k%3],BH);}      // the round planter, full of low leaves
    [0.6,2.7,4.8].forEach(function(a,k){clump(B,q[0]+Math.cos(a)*0.6,BH+0.35,q[1]+Math.sin(a)*0.6,0.35,0.3,0.35,26,{cell:'broad',size:0.75,droop:0.4,tint:k===1?0xc89090:0xd8ecb0});});});
  ficus(10.6,7.6,1.0,1.0,BH);      // the old fig before our building, roofing the alley and half the garden
  ficus(22.0,14.0,0.95,2.6,AY); gBlock.push([21.45,22.55,13.45,14.55]);      // and the one that grows out of the paving of the round square
  [[5.6,5.6,1.15,4.2],[12.9,4.0,0.95,1.6],[5.0,18.0,0.95,3.6],[24.0,19.0,1.05,2.6],[25.2,9.0,1.0,5.0]].forEach(function(q){if(okAt(q[0],q[1],0.5)) tree(q[0],q[1],q[2],q[3],BH);});      // broad old trees
  [[8.4,4.2,2.8,0.9],[13.4,9.4,4.6,1.0],[4.8,15.0,3.2,0.95],[21.8,20.4,4.2,1.0],[26.0,17.0,7.4,1.2],[25.6,13.2,6.6,1.15],[15.2,7.8,5.2,1.05],[14.6,10.4,4.4,1.0],[11.0,15.6,2.6,0.9]].forEach(function(q){if(okAt(q[0],q[1],0.4)) palm(q[0],q[1],q[2],q[3],BH);});      // date palms
  function fan(x,z,h,y){const t=det.tree('washingtonia',{h:h,s:1,seed:Math.floor(x*5+z)}); B.bake(t.wood,x,y,z,0); C.bake(t.crown,x,y,z,0);}      // a tall fan palm
  fan(11.7,24.6,10.5,U); fan(24.9,24.3,11.5,U); if(okAt(25.9,21.0,0.4)) fan(25.9,21.0,9.5,BH);
  [[6.0,2.8,2.2,1.0],[9.4,2.6,2.6,1.0],[4.6,8.6,2.4,1.0],[4.4,13.4,1.8,0.9],[22.6,17.4,2.0,0.95],[22.8,7.5,2.2,1.0],[24.8,15.4,2.4,1.0],[15.6,17.6,2.2,1.0],[10.6,18.4,1.8,0.9],[16.6,9.2,2.0,0.95]].forEach(function(q){if(okAt(q[0],q[1],0.6)) yucca(q[0],q[1],q[2],q[3],BH);});
  for(let i=0,n=0;i<500&&n<64;i++){const x=AW+0.4+rg()*(LBH-AW-0.8), z=YY+0.4+rg()*(GZ-YY-0.8), s=0.35+rg()*0.45; if(!okAt(x,z,s)) continue; n++; shrub(x,z,s,n%4===3?0x2a5a3a:leaf[n%3],BH);}      // and bushes everywhere else
  for(let i=0,n=0;i<400&&n<18;i++){const x=AW+0.5+rg()*(LBH-AW-1), z=YY+0.5+rg()*(GZ-YY-1); if(!okAt(x,z,0.5)) continue; n++; clump(B,x,BH+0.55,z,0.55,0.6,0.55,36,{cell:'broad',size:0.95,droop:0.45,tint:0xd8ecb0});}      // philodendrons and elephant's ears, their leaves big as trays
  for(let i=0,n=0;i<300&&n<40;i++){const x=AW+0.3+rg()*(LBH-AW-0.6), z=YY+0.3+rg()*(GZ-YY-0.6); if(!okAt(x,z,0.15)) continue; n++; const t=det.tree('grass',{w:0.35,d:0.35,n:16,seed:i}); B.bake(t.crown,x,BH,z,0);}      // weeds between
  for(let z=BL+0.4;z<GZ-FLL-0.3;z+=1.3) clump(C,AW-0.2,AY+2.75+Math.sin(z*3)*0.2,z,0.6,0.75,0.75,60,{droop:0.5,shell:0.4});                 // branches hanging low over the alley
  for(let z=WELL+0.6;z<GZ-0.6;z+=1.6) if(okAt(AW+1.2,z,0.7)) clump(B,AW+1.2,BH+0.9+rg()*0.2,z,0.85,1.05,0.95,150,{cell:'bush',size:0.55,shell:0.35,tint:rg()<0.4?0xc8d8b8:0xffffff});      // a wall of green along the alley's fence
  for(let z=WELL+1.2;z<GZ-1;z+=3.1) if(okAt(AW+0.7,z,0.3)) clump(B,AW+0.7,BH+1.4,z,0.6,0.7,0.9,90,{cell:'bougain',size:0.4,shell:0.6});      // and bougainvillea climbing through it
  for(let i=0;i<9;i++){const z=BL+0.4+i*(GZ-FLL-BL-0.8)/8; if(okAt(AW+0.4,z,0.1)) clump(B,AW+0.35,BH+0.5+rg()*0.4,z,0.5,0.35,0.5,40,{cell:'broad',size:0.5,droop:0.3,tint:0xd0e0c0});}           // big leaves leaning over the fence into the alley
  /* the old fig in the bed by the landing, pruned back to a few bare limbs, a string of bulbs along every one, lit in the evening */
  (function(){const x=13.0, z=17.2, y=BH, bark=det.barkM('brown'), wood=DP.grp(), lamp=A.lampMat('L:street',0xf3eedc,0xffd28a,1), top=[0.06,2.0,0.02], limbs=[];
    DP.limb([[0,-0.05,0],[0.04,1.0,0.03],top],0.26,0.2,bark,wood,{flare:0.7,ls:5,rs:10,seed:5});
    [[-0.5,1.1,[[-0.7,3.0,0.2],[-1.2,3.9,0.3],[-0.4,4.6,0.2]]],[0.7,0.9,[[0.6,2.9,-0.1],[1.0,3.6,-0.3],[1.9,3.9,-0.2]]],[2.4,0.8,[[0.3,3.0,0.6],[0.6,3.8,1.0],[0.3,4.4,1.5]]],[3.6,0.7,[[-0.2,2.8,-0.6],[0.2,3.5,-1.1],[0.9,3.7,-1.4]]]].forEach(function(l,k){
      const pts=[top].concat(l[2]); DP.limb(pts,0.13,0.06,bark,wood,{ls:6,rs:7,seed:k}); limbs.push(pts);
      const e=pts[pts.length-1]; DP.cyl(0.065,0.05,0xc9b89a,e[0],e[1]+0.02,e[2],wood,8);});      // each limb sawn off at its end
    B.bake(wood,x,y,z,0.4);
    const cs=Math.cos(0.4), sn=Math.sin(0.4);
    limbs.forEach(function(pts){for(let i=1;i<pts.length;i++){const a=pts[i-1], b=pts[i], l=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]), m=Math.max(2,Math.round(l/0.16));
      for(let k=(i>1?1:2);k<=m;k++){const t=k/m, px=a[0]+(b[0]-a[0])*t, py=a[1]+(b[1]-a[1])*t+0.1, pz=a[2]+(b[2]-a[2])*t; B.sph(0.03,lamp,x+px*cs+pz*sn,y+py,z-px*sn+pz*cs);}}});
    for(let k=0;k<14;k++){const a=k*1.9, h=0.5+k*0.1; B.sph(0.03,lamp,x+Math.cos(a)*0.27,y+h,z+Math.sin(a)*0.27);}      // and wound round the trunk
    [[-0.5,4.9,0.3,1.0],[1.6,4.2,-0.3,0.8],[0.5,4.7,1.5,0.85],[1.0,4.0,-1.4,0.7]].forEach(function(q,k){clump(C,x+q[0]*cs+q[2]*sn,y+q[1],z-q[0]*sn+q[2]*cs,q[3],q[3]*0.6,q[3],120,{cell:'broad',size:0.5,shell:0.45,seed:80+k});});      // what leaves it has left, high up
    A.pool('L:street',0xffc070,x,AY+0.03,z+1.6,3.4,st,0.3);})();
  /* on the café's paving by the garden's fence, two figures carved in grey stone on a block of washed concrete: one sits hugging its knees and smiles, the other leans on its back */
  (function(){const x=10.42, z=23.55, b=B.at(x,U,z,-R/2), st2=A.MT(tex(128,128,function(g){const r=A.rng(919); g.fillStyle='#77736c'; g.fillRect(0,0,128,128);      // grey stone, pitted
      for(let i=0;i<900;i++){g.fillStyle=r()<0.6?'rgba(60,58,54,0.5)':'rgba(170,166,158,0.45)'; g.beginPath(); g.arc(r()*128,r()*128,0.6+r()*1.6,0,7); g.fill();}},true),null,true);
    b.geo(new THREE.BoxGeometry(0.58,0.62,0.5),washM,0,0.31,0);
    b.sph(0.25,st2,0,0.85,-0.02,1,1.15,0.85); [-0.12,0.12].forEach(function(dx){b.sph(0.12,st2,dx,0.72,0.16,1,0.85,1.3);});      // hunched, its arms round its knees
    b.sph(0.15,st2,0.02,1.13,0.12,1,1.05,1);      // its head bowed forward over them
    b.sph(0.17,st2,-0.14,1.0,-0.26,0.9,1.25,0.8); b.sph(0.11,st2,-0.16,1.28,-0.22,1,1.05,1);})();      // and the other, leaning on its back
  /* benches: one with its back to the drop under the cabinets, one each round the round squares, one by the winding path; lantern lamps in the beds; a bin */
  function seat(x,z,o){bench(x,AY,z,o); gSeat.push([x,z,o]); const c=Math.cos(o), s=Math.sin(o), xs=[], zs=[];
    [[-0.9,-0.32],[0.9,-0.32],[-0.9,0.12],[0.9,0.12]].forEach(function(p){xs.push(x+p[0]*c+p[1]*s); zs.push(z-p[0]*s+p[1]*c);}); gBlock.push([Math.min.apply(0,xs),Math.max.apply(0,xs),Math.min.apply(0,zs),Math.max.apply(0,zs)]);}
  const rim=function(c,a,d){return [c[0]+Math.cos(a)*(c[2]-d),c[1]+Math.sin(a)*(c[2]-d),Math.atan2(-Math.cos(a),-Math.sin(a))];};      // a point d in from a round square's edge, and the way that faces its middle
  seat(12.6,GZ-0.42,R); [rim(PC,3.6,0.45),rim(PC,5.2,0.45),rim(PW,4.9,0.45)].forEach(function(q){if(paved(q[0],q[1])<-0.3) seat(q[0],q[1],q[2]);});
  (function(){const q=GP[1].pts, i=Math.round(q.length*0.55), a=q[i], b=q[i+1], dx=b[0]-a[0], dz=b[1]-a[1], l=Math.hypot(dx,dz)||1, nx=dz/l, nz=-dx/l, d=GP[1].w/2-0.36; seat(a[0]+nx*d,a[1]+nz*d,Math.atan2(-nx,-nz));})();
  mbin(11.6,AY,20.05); gBlock.push([11.3,11.9,19.75,20.35]);
  const lantM=A.lampMat('L:street',0xeeebe0,0xffe7bd,0.95);
  [[15.7,16.0],[6.4,15.8],[24.0,15.9],[11.0,10.6],[17.3,8.6]].forEach(function(q){if(!okAt(q[0],q[1],0.05)) return; const x=q[0], z=q[1], y=BH;      // dark green posts, a lantern on each
    B.cyl(0.08,0.3,green,x,y+0.15,z,10,0.06); B.cyl(0.045,2.9,green,x,y+1.75,z,8); B.cyl(0.06,0.08,green,x,y+3.22,z,8,0.09);
    B.cyl(0.08,0.3,lantM,x,y+3.41,z,8,0.13); B.cyl(0.17,0.07,green,x,y+3.6,z,8,0.05); B.sph(0.03,green,x,y+3.68,z);
    A.pool('L:street',0xffd9a0,x,AY+0.03,z,4.4,st,0.42);});
  /* up at the street's level: bushes, palms and big leaves in the bed behind the cabinets and the stone, flowers round the stone, palms and yuccas on the right */
  [[11.3,23.2,0.6],[12.2,24.0,0.5],[11.2,26.4,0.55],[12.3,26.9,0.45],[11.6,22.8,0.4],[12.7,25.6,0.55],[14.3,25.3,0.5],[13.3,22.9,0.45],[15.0,24.4,0.38]].forEach(function(q,i){shrub(q[0],q[1],q[2],leaf[i%3],U);});
  palm(13.6,24.1,2.6,0.9,U,18); palm(14.7,23.1,2.0,0.85,U,16);
  [[12.3,23.7],[14.1,22.75],[13.8,26.0]].forEach(function(q){clump(B,q[0],U+0.55,q[1],0.5,0.5,0.5,34,{cell:'broad',size:0.9,droop:0.45,tint:0xd8ecb0});});
  clump(B,CW+0.35,U+1.1,25.2,0.35,0.8,1.6,140,{cell:'bougain',size:0.4,shell:0.6});
  [[13.7,27.7],[15.1,27.75],[14.0,26.8],[15.1,26.85]].forEach(function(q,i){const t=det.tree('shrub',{w:0.5,h:0.45,d:0.4,seed:60+i,n:50,size:0.28,flowers:true}); B.bake(t.crown,q[0],U+0.3,q[1],0);});
  palm(21.6,24.9,3.6,1.0,U); yucca(20.2,23.2,2.2,1.0,U); yucca(23.6,26.8,2.6,1.05,U); yucca(19.1,25.4,1.6,0.9,U);
  [[22.6,23.0,0.6],[20.6,26.4,0.5],[25.8,22.9,0.55],[24.0,25.4,0.5],[19.4,23.9,0.4],[26.2,26.6,0.45]].forEach(function(q,i){shrub(q[0],q[1],q[2],leaf[(i+1)%3],U);});
  for(let z=GZ+0.6;z<PV-0.6;z+=1.2) clump(B,CW+0.3,U+0.7,z,0.3,0.55,0.5,50,{cell:'broad',size:0.6,droop:0.35,tint:0xd8ecb0});      // big leaves against the café's fence
  ficus(10.35,29.3,1.0,0.6,U,true); ficus(24.4,29.35,1.05,2.2,U,true);      // the two old figs in the pavement, either end of the garden
  /* ---------- parked in the alley, as in the photos ---------- */
  function moto(x,y,z,o,c,kind,plate){B.bake(det.moto(kind,{color:c,plate:plate}),x,y,z,o);}       // nose along +z. kind: dirt, scooter, sport or covered
  moto(1.35,AY,SB+0.6,0,0x2b2d30,'dirt','63-418');                                                          // a dirt bike at the stair's foot, its yellow plate
  moto(3.0,AY,15.0,0.06,0,'covered'); moto(2.98,AY,17.0,-0.04,0x2a2c2e,'scooter','82-574');                 // a covered bike and a maxi scooter against the garden fence
  moto(2.95,AY,AL+0.9,-0.08,0x2346b8,'sport','71-905');                                                     // a blue sports bike at the foot of our steps
  [[0.6,LA,3.35,0],[0.9,LA,3.55,1.2],[0.7,LA,3.1,2.1]].forEach(function(q){B.sph(0.28,0x151617,q[0],q[1]+0.2,q[2],1.2,0.75,1); B.sph(0.07,0x151617,q[0]+0.08,q[1]+0.42,q[2],1,1.6,1);      // black rubbish bags against number 12's wall, knotted
    B.box(0.012,0.1,0.06,0x1d1e1f,q[0]+0.12,q[1]+0.48,q[2],q[3]);});
  B.bake(det.bike('city',{color:0x9fd3c0,basket:true}),3.22,AY,AL+0.7,0.05); B.bake(det.bike('mtb',{color:0x2b2d30,grip:0x3a3c3e}),0.42,AY,LD+0.5,0);    // a mint town bike on the fence by the steps, a black one on number 12's wall past the stair
  B.bake(det.cat(0xd98a3a),AW+0.06,AY+KH,7.4,-R/2+0.4); B.bake(det.cat(0x2b2d30,{lie:true}),1.5,LA,3.2,0.6);                                     // a ginger cat on the garden kerb, a black one asleep on the forecourt

  /* ---------- the café of number 12, from the photos from Haroe St: its terrace runs from the glass front to the garden's fence, square tables in checked
     cloths, red and white, green and white or blue, white wicker chairs on cane-brown legs, big white parasols, strings of bulbs from the old fig over it
     all; at the back, by the steps down into the garden, the evaporative cooler and a planter of rough stone; plants in pots against the glass ---------- */
  const marble=A.MT(tex(64,64,function(g){const r=A.rng(81); g.fillStyle='#e6e3dc'; g.fillRect(0,0,64,64); g.strokeStyle='rgba(150,145,135,0.5)'; g.lineWidth=1;
    for(let i=0;i<9;i++){g.beginPath(); let x=r()*64, y=r()*64; g.moveTo(x,y); for(let k=0;k<5;k++){x+=(r()-0.3)*20; y+=(r()-0.5)*14; g.lineTo(x,y);} g.stroke();}
    g.fillStyle='#2f7d57'; g.beginPath(); g.arc(32,32,5,0,7); g.fill();},true),null,true);      // the marble of the counter inside
  const castIron=0x1b1c1d, cane=0x8a5e3a;
  const weave=A.MT(tex(64,64,function(g){g.fillStyle='#f3efe4'; g.fillRect(0,0,64,64); g.strokeStyle='rgba(140,125,100,0.5)'; g.lineWidth=1.2;
    for(let i=-64;i<128;i+=5){g.beginPath(); g.moveTo(i,0); g.lineTo(i+64,64); g.stroke(); g.beginPath(); g.moveTo(i,64); g.lineTo(i+64,0); g.stroke();}},true),null,true);
  weave.side=THREE.DoubleSide;
  const check=function(c){return A.MT(tex(64,64,function(g){g.fillStyle='#f7f5ef'; g.fillRect(0,0,64,64); g.fillStyle=c; g.globalAlpha=0.45;      // gingham: stripes each way, solid where they cross
    for(let i=0;i<64;i+=8){g.fillRect(i,0,4,64); g.fillRect(0,i,64,4);} g.globalAlpha=1; for(let i=0;i<64;i+=8) for(let j=0;j<64;j+=8) g.fillRect(i,j,4,4);},true),null,true);};
  const cloth=[check('#c42a3a'),check('#2f7d6a'),check('#2a5f9e')];
  const seats=[];                                                                // where people can sit: x, z and the way they face, in the street's frame
  function wchair(x,z,o){const c=B.at(x,U,z,o); seats.push([x,z,o]);           // a wicker bistro chair, facing its local +z: a woven seat, a round woven back
    [[-0.18,0.16],[0.18,0.16],[-0.17,-0.15],[0.17,-0.15]].forEach(function(q){c.cyl(0.013,0.46,cane,q[0],0.23,q[1],6);});
    c.box(0.41,0.035,0.4,weave,0,0.475,0); c.box(0.42,0.025,0.025,cane,0,0.455,0.2);
    c.geo(new THREE.CylinderGeometry(0.23,0.22,0.3,12,1,true,R-1.1,2.2),weave,0,0.7,0.02);
    c.geo(new THREE.TorusGeometry(0.23,0.012,5,12,2.2),cane,0,0.85,0.02,R/2-1.1,-R/2);
    [-1,1].forEach(function(s){c.cyl(0.012,0.42,cane,s*0.17,0.66,-0.15,6);});}
  function ctable(x,z,cl,n,a0){                                                  // a square table in its checked cloth, chairs round it; cups, the napkins, salt and pepper
    B.cyl(0.03,0.72,castIron,x,U+0.36,z,8); B.cyl(0.24,0.03,castIron,x,U+0.015,z,14);
    B.box(0.78,0.012,0.78,cl,x,U+0.752,z); [[0,1],[1,0],[0,-1],[-1,0]].forEach(function(q){B.box(q[0]?0.006:0.78,0.16,q[0]?0.78:0.006,cl,x+q[0]*0.393,U+0.68,z+q[1]*0.393);});
    for(let i=0;i<n;i++){const a=(a0||0)+i*2*R/n; wchair(x+Math.sin(a)*0.68,z+Math.cos(a)*0.68,a+R);
      if((i+Math.round(x*3+z))%3!==2){const cx=x+Math.sin(a)*0.22, cz=z+Math.cos(a)*0.22;
        B.cyl(0.065,0.008,0xf6f4ee,cx,U+0.763,cz,16); B.cyl(0.04,0.06,0xf6f4ee,cx,U+0.797,cz,14,0.045); B.cyl(0.038,0.004,(i%2?0x5a3a22:0xc8a27a),cx,U+0.826,cz,12);}}
    B.box(0.09,0.09,0.06,0xd8d4ca,x+0.12,U+0.803,z-0.1); B.cyl(0.02,0.07,0xf6f4ee,x-0.1,U+0.793,z+0.08,8); B.cyl(0.02,0.07,0x3a3a3a,x-0.05,U+0.793,z+0.08,8);
  }
  function parasol(x,z,s){                                                         // a big square white parasol on its ribs, a valance round it
    B.box(0.55,0.22,0.55,0x9a958c,x,U+0.11,z); B.cyl(0.045,2.8,0xd9d4c8,x,U+1.4,z,10);
    for(let k=0;k<4;k++){const a=R/4+k*R/2; B.box(0.025,0.025,s*0.72,0xb9b2a2,x+Math.sin(a)*s*0.33,U+2.62,z+Math.cos(a)*s*0.33,a,0.32);}
    const g=new THREE.ConeGeometry(s*0.7071,0.55,4,1,true).toNonIndexed(); g.computeVertexNormals(); B.geo(g,0xf1eee6,x,U+2.9,z,R/4);
    const gu=new THREE.ConeGeometry(s*0.7071,0.55,4,1,true).toNonIndexed(); const ix=gu.attributes.position; for(let i=0;i<ix.count;i+=3){const t=[ix.getX(i),ix.getY(i),ix.getZ(i)]; ix.setXYZ(i,ix.getX(i+2),ix.getY(i+2),ix.getZ(i+2)); ix.setXYZ(i+2,t[0],t[1],t[2]);}
    gu.computeVertexNormals(); B.geo(gu,0xded7c8,x,U+2.89,z,R/4);                  // its underside
    [[0,1],[1,0],[0,-1],[-1,0]].forEach(function(q){B.box(q[0]?0.02:s,0.22,q[0]?s:0.02,0xebe6da,x+q[0]*s/2,U+2.53,z+q[1]*s/2);});
  }
  const CAFE=[[3.2,27.1,2,0,0],[3.2,25.4,2,0,1],[5.4,27.1,4,0,0],[5.4,25.4,2,0,2],[5.4,23.75,2,R/2,1],[7.6,27.1,2,0,1],[7.6,25.4,3,0.4,0],[9.9,27.1,2,0,0],[9.9,25.4,2,0,2]],
    UMB=[[4.3,26.25,3.2],[8.75,26.25,3.2],[7.0,24.1,2.6]];      // the tables in rows out from the glass, a lane kept clear along it to the alley's steps, and a way through to the garden's
  UMB.forEach(function(q){parasol(q[0],q[1],q[2]);}); CAFE.forEach(function(q){ctable(q[0],q[1],cloth[q[4]],q[2],q[3]);});
  (function(){const x=0.95, z=27.95, cb=A.MT(tex(128,192,function(g){g.fillStyle='#22282a'; g.fillRect(0,0,128,192); g.strokeStyle='#8a6a48'; g.lineWidth=8; g.strokeRect(0,0,128,192);      // the chalk board out by the door
      g.fillStyle='#f4f0e2'; g.textAlign='center'; g.font='bold 20px sans-serif'; g.fillText('היום',64,30); g.font='15px sans-serif'; g.textAlign='right';
      [['הפוך','14'],['אספרסו','9'],['קרואסון','15'],['שקשוקה','52'],['סלט','48'],['לימונענע','16']].forEach(function(q,i){g.fillStyle=i%2?'#f2d36a':'#f4f0e2'; g.fillText(q[0],112,58+i*22); g.textAlign='left'; g.fillText(q[1],16,58+i*22); g.textAlign='right';});
      g.strokeStyle='#e8a0b0'; g.lineWidth=2; g.beginPath(); g.arc(64,180,6,0,7); g.stroke();}),null,true);
    [-1,1].forEach(function(s){const fr=B.at(x,U,z+s*0.12,0); fr.box(0.5,0.8,0.03,0x8a6a48,0,0.46,0,0,-s*0.15); fr.geo(new THREE.PlaneGeometry(0.44,0.72),cb,0,0.47,s*0.02,s>0?0:R,-s*0.15);});})();
  (function(){const c=B.at(7.0,U,22.78,0), w=0xe9ebeb;                            // the evaporative cooler on its castors, at the back, blowing at the tables
    c.box(0.78,0.36,0.52,w,0,0.26,0); c.box(0.74,0.85,0.48,w,0,0.86,0); c.box(0.78,0.1,0.52,0xdfe2e3,0,1.33,0);
    c.box(0.6,0.62,0.02,0xbfc4c6,0,0.9,0.245); c.cyl(0.26,0.02,0x9aa0a2,0,0.9,0.25,24,null,0,R/2); for(let i=0;i<7;i++) c.box(0.56,0.012,0.03,0x8e9598,0,0.66+i*0.08,0.262);
    c.box(0.02,0.6,0.36,0xbfc4c6,0.375,0.9,0); c.box(0.16,0.02,0.1,0x2c3a55,-0.2,1.385,0.1);
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){c.cyl(0.04,0.05,iron,q[0]*0.33,0.04,q[1]*0.2,6,null,0,R/2);});
  })();
  B.geo(new THREE.BoxGeometry(0.9,0.72,0.66),A.MT(ashlar,null,true),8.0,U+0.36,22.8); B.box(0.8,0.02,0.56,soil,8.0,U+0.73,22.8);      // the planter of rough stone beside it, at the top of the steps
  shrub(8.0,22.8,0.32,leaf[1],U+0.72); clump(B,8.1,U+1.0,22.8,0.32,0.22,0.25,30,{cell:'bougain',size:0.22});
  for(let i=0;i<5;i++){const z=11.6+D8+i*0.95; B.cyl(0.15,0.38,0x6f6a62,0.18,U+0.19,z,12,0.18); B.cyl(0.14,0.02,0x4d4334,0.18,U+0.38,z,12);
    const t=det.tree(i%2?'shrub':'yucca',i%2?{w:0.4,h:0.9,d:0.4,seed:i,n:70,size:0.34}:{h:0.6,s:0.8,trunks:2,seed:i}); B.bake(t.wood,0.18,U+0.38,z,i); B.bake(t.crown,0.18,U+0.38,z,i);}   // tall plants in pots along the glass front
  (function(){const x=5.9, z=22.95;                                               // the spare chairs, stacked by the back wall, and a cool box
    for(let i=0;i<6;i++){const c=B.at(x,U+i*0.07,z,0.15); c.box(0.44,0.03,0.42,0xf2f2ef,0,0.45,0); c.box(0.44,0.42,0.03,0xf2f2ef,0,0.68,-0.2,0,-0.15); [[-1],[1]].forEach(function(q){c.box(0.025,0.45,0.025,0xe6e6e2,q[0]*0.2,0.22,0.18,0,0.12);});}
    B.box(0.55,0.62,0.42,0xeef0ef,5.15,U+0.31,22.78); B.box(0.5,0.05,0.4,0x2c2f31,5.15,U+0.645,22.78);})();
  [0.95,2.35].forEach(function(x,i){B.box(1.25,0.45,0.45,0xf1efe8,x,U+0.225,17.55+D8); B.box(1.17,0.02,0.37,0x4d4334,x,U+0.455,17.55+D8);
    const t=det.tree('hedge',{w:1.2,h:0.62,d:0.42,seed:40+i,n:150,size:0.3}); B.bake(t.crown,x,U+0.42,17.55+D8,0);});      // hedge in white boxes along the pavement
  B.cyl(0.22,0.6,0xe6dfcd,0.6,U+0.3,16.75+D8,12,0.34); (function(){const t=det.tree('shrub',{w:0.8,h:0.6,d:0.8,seed:51,n:110,size:0.3,tint:0xc89aa8}); B.bake(t.crown,0.6,U+0.58,16.75+D8,0);})();      // big pot of coleus by the corner

  /* ---------- street furniture ---------- */
  function sign(t,w,h,x,y,z,o,round,parent){            // a sign plate: a drawing on the face, grey behind
    const m=new THREE.Mesh(round?new THREE.CircleGeometry(w/2,24):new THREE.PlaneGeometry(w,h),A.MT(t));
    m.position.set(x+Math.sin(o)*0.012,y,z+Math.cos(o)*0.012+(parent?0:B.oz)); m.rotation.y=o; (parent||st).add(m);
    if(round) B.cyl(w/2,0.016,0x9aa0a2,x,y,z,24,null,o,R/2); else if(!parent) B.box(w,h,0.016,0x9aa0a2,x,y,z,o);
  }
  const plate=function(n){return tex(64,64,function(g){g.fillStyle='#1f7a4a'; g.fillRect(0,0,64,64); g.strokeStyle='#fff'; g.lineWidth=3; g.strokeRect(4,4,56,56); g.fillStyle='#fff'; g.font='bold 34px sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(n,32,34);});};
  const stripe=tex(8,32,function(g){g.fillStyle='#f1f1ec'; g.fillRect(0,0,8,32); g.fillStyle='#2f55a8'; g.fillRect(0,0,8,16);},true); stripe.repeat.set(1,7);
  const tZone=tex(128,160,function(g){g.fillStyle='#f6f6f0'; g.fillRect(0,0,128,160); g.strokeStyle='#1f5fb4'; g.lineWidth=5; g.strokeRect(3,3,122,154); g.fillStyle='#1f5fb4'; g.textAlign='center';      // the parking rules, in full
    g.font='bold 17px sans-serif'; g.fillText('חניה',64,30); g.font='bold 14px sans-serif'; g.fillText('לבעלי תו אזורי',64,50); g.font='bold 34px sans-serif'; g.fillText('5',64,88);
    g.font='12px sans-serif'; g.fillText("א'-ה' 07:00-21:00",64,114); g.fillText("ו' 07:00-13:00",64,132); g.fillText('גרירה',64,150);});
  const hro=det.streetSign('הראה',"HARO'E"), msh=det.streetSign('משה שרת','MOSHE SHARET');
  B.bake(det.sign([['cross',0.6]]),4.6,U,18+D8,0.25);                                                              // zebra crossing sign
  B.bake(det.sign([['park',0.45],{t:tZone,w:0.45,h:0.56}],{stripes:A.MT(stripe,null,true)}),2.2,U,18.05+D8,0);     // the blue and white pole with the parking rules
  B.bake(det.sign([{t:hro,w:0.75,h:0.28},['nostop',0.5]],{h:2.9}),8.95,U,18.25+D8,0);                              // the street's name, where the crossing begins; no stopping by the red and white kerb
  B.bake(det.sign([['bump',0.7]]),22.2,U,18.2+D8,R/2);                                                             // a speed bump ahead
  const disT=tex(96,96,function(g){g.fillStyle='#1f5fb4'; g.fillRect(0,0,96,96); g.strokeStyle='#fff'; g.lineWidth=4; g.strokeRect(5,5,86,86); g.fillStyle='#fff';      // parking for the disabled, the permit's number under it
      g.beginPath(); g.arc(46,24,7,0,7); g.fill(); g.fillRect(41,32,10,24); g.fillRect(41,50,26,8); g.fillRect(60,50,8,22); g.lineWidth=6; g.strokeStyle='#fff'; g.beginPath(); g.arc(44,62,16,0.6,4.0); g.stroke();}),
    numT=tex(96,28,function(g){g.fillStyle='#f2d23a'; g.fillRect(0,0,96,28); g.fillStyle='#222'; g.font='bold 18px sans-serif'; g.textAlign='center'; g.fillText('21-112-13',48,21);});
  B.bake(det.sign([{t:disT,w:0.4,h:0.4},{t:numT,w:0.4,h:0.12}],{h:2.7,pole:0x2f5a3a}),10.75,U,28.2,0);
  B.bake(det.hydrant(),12.9,U,18.0+D8,0.3);
  [[6.2,15.5+D8,'בזק'],[1.8,14.2+D8,'ביוב'],[14.2,17.2+D8,'מקורות']].forEach(function(q){B.bake(det.manhole(q[2],q[2]==='בזק'?0.3:0.34),q[0],U,q[1],0.4);});
  B.bake(det.bin({color:0x2f6b3f}),-1.6,U,17.75+D8,R); B.bake(det.bin({color:0xe8b81e,open:0.12}),-2.35,U,17.75+D8,R); B.bake(det.bin({big:true,color:0x6d7174,lid:0x2f6b3f}),-3.6,U,17.6+D8,R);      // the bins out by number 12, recycling and the big one
  [5.3,8.9].forEach(function(x){B.cyl(0.12,0.7,0xa9aaa6,x,U+0.35,18.15+D8,10); B.sph(0.12,0xa9aaa6,x,U+0.7,18.15+D8);});      // concrete bollards
  function bench(x,y,z,o){const b=B.at(x,y,z,o), wood=0x8a5a3c;                                                // park bench, facing its local +z
    for(let i=0;i<3;i++){b.box(1.7,0.035,0.11,wood,0,0.44,-0.13+i*0.13); b.box(1.7,0.11,0.03,wood,0,0.58+i*0.13,-0.24-i*0.03);}
    [-0.7,0.7].forEach(function(dx){b.box(0.05,0.44,0.42,iron,dx,0.22,-0.02); b.box(0.05,0.5,0.05,iron,dx,0.68,-0.27);});}
  function mbin(x,y,z){B.cyl(0.24,0.8,0x1f4a36,x,y+0.4,z,12,0.27); B.cyl(0.29,0.12,0x183b2b,x,y+0.86,z,12,0.2); B.box(0.16,0.16,0.01,0xe8c91a,x,y+0.5,z+0.275);}      // municipal bin
  mbin(13.9,U,29.65);

  /* ---------- inside the garden's gate: the benches, the bin, the board with its rules, the memorial stone, and the cabinets on the pavement ---------- */
  bench(17.95,U,23.5,-R/2); bench(17.95,U,25.3,-R/2); mbin(18.0,U,26.95);
  B.bake(det.sign([['nomoto',0.5]],{h:2.5}),18.95,U,27.62,0);                                                // no motorcycles in the garden
  B.box(0.06,1.25,0.06,0x8a8f92,19.2,U+0.62,27.6); B.box(0.34,0.42,0.1,0x2f6b45,19.2,U+1.35,27.6); B.box(0.28,0.34,0.01,0xe8d24a,19.2,U+1.35,27.656);      // a notice in a little green case
  (function(){const x=19.95, z=27.45, bT=tex(320,448,function(g){g.scale(2,2); g.clearRect(0,0,160,224);      // the garden's board: brown wood, an arched top, the city's emblem, its name and its rules
      g.fillStyle='#6a3024'; g.beginPath(); g.moveTo(4,220); g.lineTo(4,40); g.quadraticCurveTo(80,-8,156,40); g.lineTo(156,220); g.closePath(); g.fill();
      g.strokeStyle='#a8705a'; g.lineWidth=3; g.stroke(); g.fillStyle='#d9c9a0'; g.beginPath(); g.arc(80,26,10,0,7); g.fill();
      g.fillStyle='#ecdcb8'; g.textAlign='center'; g.textBaseline='middle'; g.font='bold 17px sans-serif'; g.fillText('גן ג\'ורי סלם',80,50);
      g.font='7px sans-serif'; g.fillText('ע"ש קבלן מראשוני הקבלנים',80,64); g.fillText('והבונים ברמת גן',80,72); g.fillText('1909-1982',80,80);
      g.fillStyle='#e0b850'; g.beginPath(); g.moveTo(10,88); g.quadraticCurveTo(80,76,150,88); g.lineTo(150,99); g.quadraticCurveTo(80,87,10,99); g.fill();
      g.fillStyle='#6a3024'; g.font='bold 8px sans-serif'; g.fillText('כללי התנהגות בגן',80,87.5);
      g.fillStyle='#ecdcb8'; g.textAlign='right'; g.font='5.5px sans-serif';
      ['אין לפגוע בצמחים ובמתקני הגן','אין להרעיש בגן בין השעות 14:00-16:00','ובין השעות 21:00-07:00','הכניסה לגן ברכב אסורה','אין לאפשר לכלבים להסתובב ללא רסן','חובה על בעלי הכלבים לאסוף את הצואה','אין להקים אירועים ואין להבעיר אש בגן']
        .forEach(function(t,i){const y=110+i*14; g.fillText(t,126,y); g.strokeStyle='#ecdcb8'; g.lineWidth=1.2; g.beginPath(); g.arc(138,y,5,0,7); g.stroke(); g.beginPath(); g.moveTo(134.5,y+3.5); g.lineTo(141.5,y-3.5); g.stroke();});}),
      bm=A.MT(bT,null,true); bm.alphaTest=0.5;
    [-0.5,0.5].forEach(function(dx){B.box(0.09,2.1,0.09,0x5a2a1e,x+dx,U+1.05,z);});
    const m=new THREE.Mesh(new THREE.PlaneGeometry(1.1,1.55),bm); m.position.set(x,U+1.35,z+0.05); st.add(m); B.box(1.0,1.35,0.04,0x5a2a1e,x,U+1.28,z+0.01);})();
  const painted=[tex(192,320,function(g){      // two of them painted over by the city's artists: a woman in a striped shirt in her chair, after Picasso,
      g.fillStyle='#e0b23a'; g.fillRect(0,0,192,320); g.fillStyle='#c9922a'; g.fillRect(0,250,192,70); g.fillStyle='#3c6fb0'; g.fillRect(36,170,124,22); g.fillRect(40,190,16,110); g.fillRect(140,190,16,110);      // the chair
      g.fillStyle='#f2efe6'; g.beginPath(); g.moveTo(58,118); g.quadraticCurveTo(96,100,138,118); g.lineTo(150,232); g.lineTo(48,232); g.closePath(); g.fill();
      g.fillStyle='#24356e'; for(let y=124;y<232;y+=12) g.fillRect(50+(232-y)*0.05,y,100-(232-y)*0.1,6);      // the stripes
      g.fillStyle='#5b8fd0'; g.fillRect(48,232,104,46); g.fillStyle='#e9c9a8'; g.beginPath(); g.ellipse(96,74,28,36,0.15,0,7); g.fill();      // her skirt; her face
      g.fillStyle='#1f1a17'; g.beginPath(); g.ellipse(84,52,34,30,-0.3,0,7); g.fill(); g.fillRect(56,52,16,64);      // her dark hair
      g.fillStyle='#1f1a17'; g.beginPath(); g.ellipse(104,72,4,6,0,0,7); g.fill(); g.fillStyle='#c0392b'; g.fillRect(100,96,14,5);
      g.fillStyle='#e9c9a8'; g.beginPath(); g.ellipse(118,108,10,22,-0.5,0,7); g.fill(); g.strokeStyle='#1f1a17'; g.lineWidth=2.5; g.strokeRect(2,2,188,316);}),
    tex(192,320,function(g){      // and a white goat's long face on blue and red
      g.fillStyle='#2f5fa8'; g.fillRect(0,0,192,190); g.fillStyle='#c0392b'; g.fillRect(0,190,192,130);
      g.fillStyle='#f4f1ea'; g.beginPath(); g.moveTo(96,60); g.quadraticCurveTo(150,70,128,180); g.quadraticCurveTo(112,262,96,270); g.quadraticCurveTo(80,262,64,180); g.quadraticCurveTo(42,70,96,60); g.fill();
      [-1,1].forEach(function(sd){g.beginPath(); g.ellipse(96+sd*52,104,34,12,sd*0.35,0,7); g.fill(); g.fillStyle='#1d1d1f'; g.beginPath(); g.ellipse(96+sd*24,132,6,8,0,0,7); g.fill(); g.fillStyle='#f4f1ea';});      // ears; eyes
      g.fillStyle='#b8b0a4'; g.beginPath(); g.ellipse(96,252,12,8,0,0,7); g.fill(); g.fillStyle='#d9433a'; g.beginPath(); g.arc(96,58,12,0,7); g.fill(); g.fillStyle='#e8c14a'; g.beginPath(); g.arc(96,58,4,0,7); g.fill();      // its nose; a red flower on its head
      g.strokeStyle='#1f1a17'; g.lineWidth=2.5; g.strokeRect(2,2,188,316);})];
  [[11.28,0],[12.03,1],[12.78,2]].forEach(function(q){const x=q[0];      // the electricity cabinets in a row on a plinth: two painted, one grey, sprayed over and stuck with notices
    B.box(0.72,1.25,0.4,0xb4b9b7,x,U+0.15+0.625,PV-0.25); B.box(0.74,0.04,0.42,0x9a9f9d,x,U+1.42,PV-0.25); B.box(0.01,1.15,0.01,0x7d8280,x+0.36,U+0.78,PV-0.045);
    if(q[1]<2){panel(0.7,1.2,A.MT(painted[q[1]],null,true),x,U+0.8,PV-0.044,0); return;}
    panel(0.7,1.2,A.MT(tex(96,160,function(g){const r=A.rng(70+q[1]); g.fillStyle='#b8bdbb'; g.fillRect(0,0,96,160); for(let i=0;i<300;i++){g.fillStyle='rgba(80,80,80,'+(r()*0.12)+')'; g.fillRect(r()*96,r()*160,2,2);}
      g.lineWidth=3; g.lineCap='round'; for(let k=0;k<3;k++){g.strokeStyle=['#2b2d30','#4a4f8a','#3a3a3a','#8a3a3a'][(k+q[1])%4]; g.beginPath(); let x0=10+r()*30, y0=60+r()*60; g.moveTo(x0,y0); for(let j=0;j<7;j++){x0+=6+r()*8; y0+=(r()-0.5)*26; g.lineTo(x0,y0);} g.stroke();}      // tags
      g.fillStyle=['#f2f0e8','#e8d24a','#f2f0e8'][q[1]]; g.fillRect(14+q[1]*12,18,30,40); g.fillStyle='#555'; for(let j=0;j<5;j++) g.fillRect(18+q[1]*12,24+j*7,22,2);}),null,true),x,U+0.8,PV-0.044,0);});
  B.box(2.3,0.15,0.46,0x9a9d9a,12.03,U+0.075,PV-0.25);
  (function(){const x=14.4, y=U+0.3+0.66, z=27.2, lean=0.15;      // the round memorial stone, standing in its bed, facing the street
    B.box(0.9,0.14,0.42,0xcfc8b6,x,U+0.37,z); B.cyl(0.62,0.22,0xddd6c4,x,y,z,28,null,0,R/2-lean);
    const t=tex(512,512,function(g){
      g.scale(2,2); g.fillStyle='#e9e3d2'; g.beginPath(); g.arc(128,128,128,0,7); g.fill(); const r=A.rng(3); for(let i=0;i<500;i++){g.fillStyle='rgba(120,110,90,'+(0.04+r()*0.08)+')'; g.fillRect(r()*256,r()*256,2,2);}
      g.strokeStyle='#8f8672'; g.lineWidth=2; [[92,52],[164,52]].forEach(function(q){g.beginPath(); g.arc(q[0],q[1],13,0,7); g.stroke(); g.beginPath(); g.moveTo(q[0],q[1]-8); g.lineTo(q[0]+7,q[1]+6); g.lineTo(q[0]-7,q[1]+6); g.closePath(); g.stroke();});      // the city's emblem and the fund's
      g.fillStyle='#6f6754'; g.textAlign='center'; g.textBaseline='middle';      // the inscription, cut into the stone
      [['bold 25px serif','גינת שלום',88],['16px serif','ע"ש סלים אברהם ג\'ורי ז"ל',114],['13px serif','תרס"ט-תשמ"ב',134],['13px serif','1909-1982',151],['13px serif','מראשוני הקבלנים והבונים',172],['13px serif','של העיר רמת-גן',190]]
        .forEach(function(l){g.font=l[0]; g.fillText(l[1],128,l[2]);});
    });
    const m=new THREE.Mesh(new THREE.CircleGeometry(0.6,28),A.MT(t)); m.position.set(x,y+Math.sin(lean)*0.113,z+Math.cos(lean)*0.113); m.rotation.x=-lean; st.add(m);
  })();
  const glow=A.lampMat('L:street',0xeeebe0,0xffe7bd,0.95), bulb=A.lampMat('L:street',0xf3eedc,0xffd28a,1);
  [[3.75,22.62,U],[11.3,22.75,U],[18.6,22.7,U]].concat(gLamp.map(function(q){return [q[0],q[1],AY];})).forEach(function(q){            // globe lamps on green poles
    B.cyl(0.045,3.0,green,q[0],q[2]+1.5,q[1],8); B.sph(0.2,glow,q[0],q[2]+3.15,q[1]); A.pool('L:street',0xffd9a0,q[0],q[2]+0.03,q[1],4.2,st,0.42);});
  const wireM=new THREE.LineBasicMaterial({color:0x1d1f21});
  function festoon(a,b,sag){const n=Math.max(4,Math.round(Math.hypot(b[0]-a[0],b[2]-a[2])/0.55)), pts=[];      // a string of bulbs, sagging between two points
    for(let i=0;i<=n;i++){const t=i/n; pts.push(new THREE.Vector3(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t-sag*4*t*(1-t),a[2]+(b[2]-a[2])*t));}
    st.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),wireM));
    for(let i=1;i<n;i++){const p=pts[i]; B.cyl(0.012,0.04,0x2b2d2f,p.x,p.y-0.03,p.z,6); B.sph(0.035,bulb,p.x,p.y-0.08,p.z);}}
  festoon([10.2,U+4.3,28.9],[0.08,U+3.3,23.4],0.35); festoon([10.2,U+4.3,28.9],[0.08,U+3.3,26.6],0.35); festoon([11.6,U+3.9,24.6],[0.08,U+3.2,25.0],0.3);      // from the old fig and the palm over the terrace to number 12
  festoon([10.5,U+4.6,29.2],[24.3,U+4.6,29.3],0.5);                                                                                                       // and along the garden's front, fig to fig
  [[4.3,25.6],[8.5,25.6],[5.6,27.4]].forEach(function(q){A.pool('L:street',0xffc070,q[0],U+0.03,q[1],2.6,st,0.3);});      // their light on the tables

  /* ---------- parked cars ---------- */
  const pr=A.rng(808), plateNo=function(){const d=function(n){let t=''; for(let i=0;i<n;i++) t+=Math.floor(pr()*10); return t;}; return pr()<0.5?d(2)+'-'+d(3)+'-'+d(2):d(3)+'-'+d(2)+'-'+d(3);};
  function car(x,z,o,col,kind){B.bake(det.car(kind||'hatch',{color:col,plate:plateNo()}),x,RY,z,o);}                   // nose along its local +x
  car(-4.1,KZ+1.05,0,0xe9e9e6,'hatch'); car(14.9,KZ+1.05,R,0xb9bcbe,'sedan'); car(20,KZ+1.05,R,0xb5372f,'mini'); car(13.5,KZ+RW-1.05,0,0x3a4a5a,'suv');
  car(-9.2,KZ+1.05,0,0x2f4f7a,'sedan'); car(25.4,KZ+1.05,R,0xf2f2ee,'van'); car(19.4,KZ+RW-1.05,0,0x7a7f84,'hatch'); car(24.8,KZ+RW-1.05,0,0xd8c9a6,'mini'); car(-7.6,KZ+RW-1.05,0,0x1d1f21,'suv'); car(-13.4,KZ+1.05,0,0x8a1f2a,'hatch');
  B.bake(det.cat(0xa9a49a,{lie:true}),-2.45,RY+0.9,KZ+1.05,R/2);                                                      // a grey cat asleep on the white car's warm bonnet
  [-3,11.8,23].forEach(function(x){B.bake(det.drain(0.8),x,RY,KZ+0.22,0);}); B.bake(det.manhole('ביוב',0.32),9.5,RY,KZ+3.5,0); B.bake(det.manhole('חשמל',0.3),17,RY,KZ+2.6,1);
  B.box(0.5,0.08,RW,0x2b2d2f,21.6,RY+0.04,KZ+RW/2); for(let k=0;k<6;k++) B.box(0.52,0.085,0.5,k%2?0x2b2d2f:0xe8c21e,21.6,RY+0.042,KZ+0.6+k*1.15);      // a rubber speed bump, yellow and black
  B.bake(det.sign([['stop',0.75]]),4.4,U,KZ+RW+0.45,0); B.bake(det.sign([{t:hro,w:0.8,h:0.3}],{h:2.85}),-2.1,U,KZ+RW+0.45,R); B.bake(det.sign([{t:msh,w:0.8,h:0.3}],{h:2.5}),-2.1,U,KZ+RW+0.45,R/2);      // across the road: a stop sign where Moshe Sharet St comes out, the two names on the corner

  /* ---------- the buildings round the square ---------- */
  function house(x0,x1,z0,z1,o){                      // a neighbouring block, built whole and always standing: o.front ('+z' or '-z') faces the street, o.faces as det.block names them
    const g=G(st), b=batch(g), sx=x1-x0, sz=z1-z0;
    B.box(sx,U+0.03-GY,sz,0xcfc8b6,(x0+x1)/2,(GY+U+0.03)/2,(z0+z1)/2);      // the footing, from the yard up to the street
    b.bake(det.block(Object.assign({sx:sx,sz:sz,floors:4,ground:3.2,fh:3.0},o)),o.front==='-z'?x1:x0,U,o.front==='-z'?z0:z1,o.front==='-z'?R:0);
    return {g:g,b:b};
  }
  const n12=house(-12,0,0,16.05+D8,{seed:12,floors:5,wall:0xe2dac8,faces:{front:{ground:'shops',shops:['flowers','cafe','cafe','cafe'],awnings:false,cables:true},right:{minFloor:2,pipes:2,holes:[[0.35,5.55,2.75]]}}});      // number 12 and the wing behind it close the left side of the square
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
    [[16.05,4.3],[20.15,4.3],[0.95,3.9]].forEach(function(q,i){b.bake(det.ac({brand:['electra','tadiran','plain'][i],bracket:true,up:0.5,drain:1.2}),0.02,AY+q[1]-0.28,q[0],R/2);});      // air conditioners on the flank, one high up by our doorway
    /* the café's glass front, in brass-coloured frames, and the café inside it: dark wood and marble, the machine, cakes under glass */
    const cz=13.1+D8, cw=5.2, brass=0xc9b98f, wood=0x4a3424, glassC=A.reg(new THREE.MeshLambertMaterial({color:0xb8d0cc,transparent:true,opacity:0.16,depthWrite:false}),'street');
    panel(cw,2.7,glassC,0.03,U+1.35,cz,R/2,g).renderOrder=3; b.box(0.06,0.25,5.4,0xd8ccb2,0.03,U+2.82,cz);
    for(let k=0;k<=4;k++) b.box(0.07,2.7,0.07,brass,0.04,U+1.35,cz-cw/2+k*cw/4); [0.04,2.18,2.68].forEach(function(y){b.box(0.08,0.06,cw,brass,0.04,U+y,cz);});
    b.box(0.2,0.04,0.6,0xb9b1a0,0.12,U+0.02,cz+cw/2-0.65);                                                                      // the doorstep
    b.box(0.05,0.3,0.14,0xd9d9d2,0.08,U+1.05,cz+cw/2-0.4);                                                                       // the door's long handle
    const IX=-4.2, plank=[0x8a6a48,0x7d5e3e,0x94724e];
    for(let k=0;k<13;k++) b.box(-IX,0.02,cw/13,plank[k%3],IX/2,U+0.012,cz-cw/2+(k+0.5)*cw/13);                                  // a floor of oak boards
    const inner=A.MT(tex(256,128,function(c){const r=A.rng(5); c.fillStyle='#e9e1cf'; c.fillRect(0,0,256,128); for(let i=0;i<600;i++){c.fillStyle='rgba(120,100,70,'+(r()*0.06)+')'; c.fillRect(r()*256,r()*128,2,2);}
      c.fillStyle='#22282a'; c.fillRect(150,14,92,62); c.strokeStyle='#8a6a48'; c.lineWidth=4; c.strokeRect(150,14,92,62); c.fillStyle='#f4f0e2'; c.font='bold 11px sans-serif'; c.textAlign='right';
      [['אספרסו','9'],['הפוך','14'],['אמריקנו','12'],['קר','17'],['תה','10']].forEach(function(q,i){c.fillText(q[0],236,28+i*11); c.textAlign='left'; c.fillText(q[1],156,28+i*11); c.textAlign='right';});
      c.fillStyle='#3a5a40'; c.fillRect(0,100,256,28);}),null,true);                                                            // cream walls, a green dado, the price board
    panel(cw,3.0,inner,IX,U+1.5,cz,R/2,g); panel(-IX,3.0,inner,IX/2,U+1.5,cz-cw/2,0,g); panel(-IX,3.0,inner,IX/2,U+1.5,cz+cw/2,R,g);
    const ceil=panel(-IX,cw,A.MT(tex(8,8,function(c){c.fillStyle='#f2efe6'; c.fillRect(0,0,8,8);})),IX/2,U+3.0,cz,0,g); ceil.rotation.x=R/2;
    for(let i=0;i<3;i++){const y=U+1.35+i*0.42; b.box(0.3,0.03,cw-0.8,wood,IX+0.15,y,cz);                                       // shelves of coffee and bottles along the back
      for(let z=cz-cw/2+0.55;z<cz+cw/2-0.5;z+=0.16+((z*7)%3)*0.04){const k=Math.round(z*13+i)%5;
        if(k<2) b.box(0.1,0.2,0.1,[0xb8956a,0x2b2d30][k],IX+0.12,y+0.115,z); else if(k<4) b.cyl(0.035,0.26,[0x3a6a3a,0x6a3a22][k-2],IX+0.12,y+0.145,z,8); else b.cyl(0.05,0.14,0xe9e6de,IX+0.12,y+0.085,z,10);}}
    b.box(0.62,1.0,3.6,wood,-2.3,U+0.5,cz-0.5); b.geo(new THREE.BoxGeometry(0.7,0.04,3.68),marble,-2.3,U+1.02,cz-0.5);            // the counter, a marble top
    for(let k=0;k<12;k++) b.box(0.012,0.9,0.05,0x3a281c,-1.985,U+0.5,cz-2.2+k*0.3);                                              // its front in vertical boards
    (function(){const m=b.at(-2.35,U+1.04,cz-1.4,R/2);                                                                           // the espresso machine, two groups, cups warming on top
      m.box(0.78,0.44,0.5,0xc9cdd0,0,0.22,0); m.box(0.8,0.04,0.52,0x8a8f92,0,0.46,0); m.box(0.7,0.03,0.2,0x6d7174,0,0.03,0.2);
      [-0.18,0.18].forEach(function(x){m.cyl(0.045,0.06,0x9aa0a4,x,0.28,0.27,12); m.box(0.035,0.035,0.16,0x1d1f21,x,0.24,0.38); m.cyl(0.028,0.06,0xf6f4ee,x,0.07,0.2,10);});
      m.box(0.008,0.18,0.008,0xd4d8db,0.34,0.24,0.27,0,0.3); for(let i=0;i<6;i++) m.cyl(0.03,0.05,0xf6f4ee,-0.28+i*0.11,0.5,-0.08,10);
      m.cyl(0.08,0.36,0x2b2d30,-0.62,0.18,0,12); m.cyl(0.09,0.16,0x5a3a22,-0.62,0.44,0,12,0.06);})();                        // the grinder, full of beans
    (function(){const z=cz+0.35;                                                                                                   // the cakes under glass
      b.box(0.62,0.04,1.1,0xd8d8d2,-2.3,U+1.06,z); b.box(0.6,0.42,1.08,glassC,-2.3,U+1.29,z);
      for(let i=0;i<6;i++){const zz=z-0.42+i*0.17; b.sph(0.045,0xc98a3a,-2.36,U+1.11,zz,1.6,0.6,0.9); b.cyl(0.06,0.06,i%2?0x6a3a22:0xf2e2c2,-2.2,U+1.11,zz,12); b.box(0.06,0.012,0.06,0xe84a5a,-2.2,U+1.15,zz);}})();
    b.box(0.22,0.16,0.18,0x2b2d30,-2.3,U+1.12,cz+1.05); b.box(0.2,0.12,0.005,0x6a9ac8,-2.2,U+1.16,cz+1.05,R/2,-0.4);          // the till, a tablet on its stand
    const bulbC=A.reg(new THREE.MeshLambertMaterial({color:0xffe2a8,emissive:0xd8a050}),'street');
    for(let k=0;k<3;k++){const z=cz-1.6+k*1.1; b.cyl(0.004,0.75,0x1d1f21,-2.3,U+2.62,z,4); b.cyl(0.03,0.18,0x1d1f21,-2.3,U+2.18,z,14,0.12); b.sph(0.05,bulbC,-2.3,U+2.1,z);}   // lamps hanging low over the counter
    A.pool('L:street',0xffc888,-2.3,U+1.07,cz-0.5,1.6,st,0.3);
    b.box(0.7,2.0,0.7,0xe9ebeb,IX+0.45,U+1.0,cz+cw/2-0.5); b.box(0.02,1.8,0.6,glassC,IX+0.81,U+1.0,cz+cw/2-0.5);                 // the drinks fridge, bottles behind its glass door
    for(let i=0;i<4;i++) for(let j=0;j<5;j++) b.cyl(0.03,0.22,[0xd84a4a,0x3a8a4a,0xe8b81e,0x9fc4d6,0xf2f2ee][j],IX+0.6,U+0.35+i*0.42,cz+cw/2-0.75+j*0.12,8);
    [[-1.0,cz+1.6],[-1.1,cz-2.0]].forEach(function(q){b.cyl(0.3,0.03,marble,q[0],U+0.74,q[1],18); b.cyl(0.03,0.72,0x1b1c1d,q[0],U+0.37,q[1],8);           // two small tables inside, by the glass
      [[0.45,0],[-0.45,0]].forEach(function(d){const c=b.at(q[0]+d[0],U,q[1],d[0]>0?-R/2:R/2); c.box(0.4,0.03,0.4,0xa66a35,0,0.46,0); c.box(0.4,0.4,0.03,0xa66a35,0,0.68,-0.2); [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(e){c.box(0.025,0.46,0.025,0x1b1c1d,e[0]*0.18,0.23,e[1]*0.18);});});});
    A.street_cafe={barista:[-2.95,cz-1.1,R/2],n12:g};
  })();
  n12.b.done();

  /* ---------- our own street front ----------
     Drawn only for someone standing outside at street level: from higher up you look straight into the lobby, as on every other side. */
  const gt=tex(2048,256,function(g){
    const X=function(x){return x/FW*2048;}, Y=function(y){return 256-y/H*256;};
    const rc=function(x0,x1,y0,y1,c){g.fillStyle=c; g.fillRect(X(x0),Y(y1),X(x1)-X(x0),Y(y0)-Y(y1));};
    rc(0,FW,0,H,'#d9d1be'); rc(0,FW,0,0.45,'#c8c0ad'); rc(0,FW,H-0.22,H,'#ccc4b1');                          // plaster, a plinth, the edge of the floor above
    const win=function(x,w){rc(x-0.07,x+w+0.07,0.93,2.32,'#cfc8b6'); rc(x,x+w,1.0,2.25,'#f6f5f0'); for(let y=1.04;y<2.24;y+=0.075) rc(x,x+w,y,y+0.014,'#c6c9c4'); rc(x+w/2-0.02,x+w/2+0.02,1.0,2.25,'#e6e6e0');};      // window behind closed white shutters
    const screen=function(x,w){rc(x,x+w,0.75,2.5,'#7f8b8d'); for(let u=x;u<x+w+0.01;u+=0.14) rc(u-0.012,u+0.012,0.75,2.5,'#e3dfd2'); for(let y=0.75;y<2.51;y+=0.14) rc(x,x+w,y-0.012,y+0.012,'#e3dfd2');};      // lattice that hides the washing
    BX.forEach(function(bx){rc(bx-0.9,bx+0.9,0,H,'#e4dfd3');});                                              // smoother render round each doorway
    const tall=function(x,w){rc(x-0.06,x+w+0.06,0.1,2.5,'#f1f0ec'); rc(x,x+w,0.16,2.42,'#33403f'); rc(x+w*0.48,x+w*0.52,0.16,2.42,'#f1f0ec'); rc(x,x+w,1.25,1.3,'#f1f0ec'); rc(x,x+w,0.16,1.25,'#5c7275');};   // a tall window, its lower panes frosted
    const roll=function(x,w,y0,y1){y0=y0||0.5; y1=y1||2.42; rc(x-0.05,x+w+0.05,y0-0.05,y1+0.2,'#e7e3d8'); rc(x,x+w,y0,y1,'#f3f2ed'); for(let y=y0+0.02;y<y1;y+=0.06) rc(x,x+w,y,y+0.012,'#c9c7bf'); rc(x-0.05,x+w+0.05,y1,y1+0.2,'#e1ddd2');};   // shutters rolled down
    roll(2.4,1.5,0.95,2.45); roll(4.4,1.5,0.95,2.45); tall(6.5,1.1); roll(8.0,2.2); tall(10.6,1.1);      // the two beside the doorway sit higher, their sills at the bridge's railing
    const gr=A.rng(19); for(let i=0;i<40;i++){const x=gr()*FW, y=gr()*H; rc(x,x+0.02,y,y+0.25,'rgba(120,100,80,0.18)');}      // streaks of grime
  }), gtM=A.MT(gt);
  function front(x0,x1,y0,y1){                         // one piece of the ground-floor front, cut from that one long drawing
    const g=new THREE.BufferGeometry(), z=0.03;
    g.setAttribute('position',new THREE.Float32BufferAttribute([x0,y0,z, x1,y0,z, x1,y1,z, x0,y1,z],3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute([x0/FW,y0/H, x1/FW,y0/H, x1/FW,y1/H, x0/FW,y1/H],2)); g.setIndex([0,1,2,0,2,3]);
    fac.add(new THREE.Mesh(g,gtM));
  }
  let fx=0; BX.forEach(function(bx){front(fx,bx-BRW/2,0,H); front(bx-BRW/2,bx+BRW/2,2.5,H); fx=bx+BRW/2;}); front(fx,FW,0,H);
  const ft=tex(256,256,function(g){                    // the floors above, from the photos: beige plaster, a wide window shut behind white roller shutters, a white cage of bars over it, a narrow one beside
    g.fillStyle='#d9d1bd'; g.fillRect(0,0,256,256); g.fillStyle='#c8c0ad'; g.fillRect(0,236,256,20);
    g.fillStyle='#dfdacf'; g.fillRect(14,50,180,140); g.fillStyle='#f3f2ed'; g.fillRect(20,58,168,124); g.fillStyle='#cdcac2'; for(let y=62;y<182;y+=5) g.fillRect(20,y,168,1.6);      // the box, the slats
    g.fillStyle='#cfc8b5'; g.fillRect(8,186,192,8);                                                                                                                       // the sill
    g.strokeStyle='#f6f5f1'; g.lineWidth=3; for(let x=20;x<=188;x+=21){g.beginPath(); g.moveTo(x,50); g.lineTo(x,190); g.stroke();} for(let y=58;y<=190;y+=26.4){g.beginPath(); g.moveTo(14,y); g.lineTo(194,y); g.stroke();}      // the cage
    g.fillStyle='#6f7d84'; g.fillRect(208,84,32,62); g.strokeStyle='#fbfaf6'; g.lineWidth=3; g.strokeRect(208,84,32,62); for(let y=94;y<146;y+=10){g.beginPath(); g.moveTo(208,y); g.lineTo(240,y); g.stroke();}
    g.fillStyle='#e6e8e6'; g.fillRect(200,166,44,30); g.fillStyle='#b9bdbb'; g.fillRect(206,172,32,18);                                                                    // an air conditioner
    const r=A.rng(27); for(let i=0;i<30;i++){g.fillStyle='rgba(110,95,75,'+(0.05+r()*0.09)+')'; g.fillRect(r()*256,r()*236,2,8+r()*30);}                                  // streaks of grime
  },true); ft.repeat.set(FW/3.2,3);
  panel(FW,TOP-H,A.MT(ft),FW/2,(H+TOP)/2,0.03,0,fac);
  const p10=A.MT(plate('10'));
  const hs=tex(128,48,function(g){g.fillStyle='#c9a35a'; g.fillRect(0,0,128,48); g.strokeStyle='#7a5a2a'; g.lineWidth=3; g.strokeRect(2,2,124,44);
    g.fillStyle='#3b2a14'; g.textAlign='center'; g.font='bold 22px sans-serif'; g.fillText('הראה',64,24); g.font='bold 16px sans-serif'; g.fillText('10',64,42);});
  BX.forEach(function(bx,i){                                                                // plain openings in the front, no doors
    [-1,1].forEach(function(s){F.box(0.06,2.5,0.06,0xe9e4d8,bx+s*(BRW/2+0.03),1.25,0.04);}); F.box(BRW+0.12,0.08,0.06,0xe9e4d8,bx,2.54,0.04);
    panel(0.2,0.2,p10,bx-0.12,2.7,0.045,0,fac);                                             // the green number plate over the doorway's left half,
    if(i===0){panel(0.3,0.13,A.MT(hs),bx-0.5,2.62,0.045,0,fac);                             // the brass street sign beside it,
      const w=0xeeede6, rust=0x9a6a3e;
      const grille=function(x0,x1,y0,y1){for(let x=x0+0.05;x<x1;x+=0.11) F.box(0.02,y1-y0,0.02,w,x,(y0+y1)/2,0.12); [y0+0.03,(y0+y1)/2,y1-0.03].forEach(function(y){F.box(x1-x0,0.03,0.03,w,(x0+x1)/2,y,0.12); F.box(x1-x0,0.012,0.03,rust,(x0+x1)/2,y-0.021,0.12);});
        [x0,x1].forEach(function(x){[y0+0.03,y1-0.03].forEach(function(y){F.box(0.04,0.04,0.14,w,x,y,0.06);});});};      // white bars over a window, rusting along the rails, let into the wall at the corners
      grille(2.35,3.95,0.9,2.5); grille(4.35,5.95,0.9,2.5);                                                                                  // the two windows beside the doorway
      const gt=B.at(DL,0.02,0.08,-R*0.64);                                                   // the gate's leaf, hinged on the left jamb and swung right back, leaning out over the pit's steps
      [0.12,1.2,2.3].forEach(function(y){gt.box(1.2,0.035,0.035,w,0.6,y,0); gt.box(1.2,0.01,0.04,rust,0.6,y-0.02,0);});
      for(let x=0.03;x<1.2;x+=0.1) gt.box(0.022,2.4,0.022,w,x,1.2,0.06*Math.sin(x*5),0,0.07);
      B.box(0.05,2.46,0.05,w,DL-0.03,1.23,0.06); [0.4,1.3,2.2].forEach(function(y){B.box(0.08,0.06,0.04,rust,DL-0.03,y,0.08);});           // its hinge post
      for(let i=0;i<10;i++){const x=0.08+i*0.045; F.box(0.012,TOP-1,0.012,0xf2f2ef,x,(TOP+1)/2-0.5,0.08+((i*7)%4)*0.02);}      // a bundle of white cables down the corner
      const ln=function(pts){st.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts.map(function(p){return new THREE.Vector3(p[0],p[1],p[2]);})),new THREE.LineBasicMaterial({color:0xf2f2ef})));};
      for(let k=0;k<6;k++){const pts=[]; for(let i=0;i<=16;i++){const t=i/16; pts.push([0.3+t*(2.9+k*0.3),2.62-0.55*Math.sin(t*R)*(0.4+k*0.12)-0.05*k,0.12+t*0.25]);} ln(pts);}      // and loops of it hanging over the doorway
      for(let y=3.25;y<5.5;y+=0.25) F.box(FW-0.6,0.03,0.03,w,FW/2,y,0.4); for(let x=0.3;x<FW-0.2;x+=0.25){F.box(0.03,2.25,0.03,w,x,4.37,0.4); if(Math.round(x*4)%4===0){F.box(0.03,0.03,0.4,w,x,3.25,0.2); F.box(0.03,0.03,0.4,w,x,5.25,0.2);}}}      // the white cage of bars across the whole first floor, standing out from the wall on brackets
  });
  B.done(); C.done(); F.done();
  A.street={st:st,X0:XS,fac:fac,U:U,AY:AY,RY:RY,LA:LA,KZ:KZ,RW:RW,D8:D8,AW:AW,GZ:GZ,PV:PV,CW:CW,BL:BL,FZ:FZ,AL:AL,seats:seats,cafe:CAFE.map(function(q){return [q[0],q[1]];}),inside:A.street_cafe};
  A.streetView=[st.localToWorld(new THREE.Vector3(2.3,U+1.62,24.6)),st.localToWorld(new THREE.Vector3(1.1,AY+0.9,0.4))];      // standing at the café, looking down the steps and the alley to our bridge
  /* Sims mode can walk out here: where the ground is (in this frame, turned into the model's), what stands in the way,
     and how high the ground is: the bridges at the lobby's level, the forecourt a step below, the alley and the garden, the flights up, the street */
  const wr=function(q){return [XS+q[2],XS+q[3],ZC-q[1],ZC-q[0]];};
  const gWalk=[];      // the garden's paving, in strips a cell deep along x, less a body's width from its walls (fillRect takes that much off every side)
  for(let z=YY+0.1;z<GZ;z+=0.2){let x0=null; for(let x=AW+0.1;x<LBH+0.2;x+=0.2){const ok=x<LBH&&inside(x,z)>0.2&&paved(x,z)<-0.24&&!FL.some(function(f){return z>GZ-FLL-0.3&&x>f[0]-0.45&&x<f[1]+0.45;});      // onto a flight only at its foot
    if(ok&&x0==null) x0=x; else if(!ok&&x0!=null){gWalk.push([x0-0.23,x+0.03,z-0.23,z+0.23]); x0=null;}}}
  A.rooms.street.rs=[[DL+0.05,DR-0.06,-0.2,LD0+0.02],[WX0+0.04,WX1-0.04,0.3,BL+0.5],      // the landing before the doorway and our bridge; each overlaps the next, as each loses a body's width at its edges
    [PTW+0.1,AW-0.12,BL+0.2,PTZ1+0.3],[0.12,AW-0.12,PTZ1,GZ+0.3],[AW-0.4,AW+0.6,PG[0]+0.15,PG[1]-0.15],      // the forecourt beside the pit, then the alley and its steps up to the café; the way into the garden
    [FL[1][0]+0.05,FL[1][1]-0.05,GZ-FLL-0.45,GZ+0.3],[FL[2][0]+0.05,FL[2][1]-0.05,GZ-FLL-0.45,GZ+0.3],      // the garden's two flights
    [0.15,CW-0.12,GZ+0.02,KZ-0.2],[PLZ[0]+0.02,PLZ[1]-0.02,GZ+0.02,PLZ[3]],[ENT[0]+0.02,ENT[1]-0.02,PLZ[3]-0.3,PV+0.3],      // the café's terrace; the gravel square inside the garden's gate, and the gate
    [-3.5,0.4,16.2+D8,KZ-0.2],[CW-0.4,30,PV+0.08,KZ-0.2],[5.5,8.7,KZ-0.6,KZ+RW+0.6],[3.9,26,KZ+RW+0.1,28.8+D8]].concat(gWalk).map(wr);      // the pavement, the crossing, the far side
  const chairs=seats.map(function(q){return [q[0]-0.22,q[0]+0.22,q[1]-0.22,q[1]+0.22];});
  const tb=CAFE.map(function(q){return [q[0]-0.45,q[0]+0.45,q[1]-0.45,q[1]+0.45];}).concat(UMB.map(function(q){return [q[0]-0.3,q[0]+0.3,q[1]-0.3,q[1]+0.3];}),chairs);
  const pole=function(x,z,r){r=r||0.15; return [x-r,x+r,z-r,z+r];};
  A.streetBlock=[[0,1.08,SB,LD],[0,0.5,2.6,3.7],[-0.1,PTW+0.05,PTZ0-0.3,PTZ1+0.05],[1.05,1.65,SB-0.2,SB+1.4],[2.6,3.4,14.2,17.9],[2.55,3.4,AL+0.3,AL+1.6],[0,0.45,LD+0.1,LD+1.1],[3.0,3.4,AL+0.3,AL+1.1],[1.25,1.75,2.95,3.45]].concat(tb,
    [[0,0.36,11.3+D8,15.9+D8],[6.55,7.45,22.45,23.1],[7.5,8.5,22.4,23.2],[10.12,10.8,23.25,23.85],[AW,FL[1][0],GZ-0.1,GZ+0.42],[5.55,6.25,22.6,23.3],[4.85,5.45,22.5,23.05],[0.55,1.35,27.7,28.2],      // the pots along the glass, the cooler, the stone planter, the low wall, the spare chairs, the cool box, the chalk board
     [0.3,3.0,17.3+D8,17.8+D8],[0.3,0.9,16.45+D8,17.05+D8],[-3.95,-1.25,17.25+D8,18.1+D8],      // the hedges and the coleus by the corner, the bins by number 12
     pole(4.6,18+D8),pole(2.2,18.05+D8),pole(8.95,18.25+D8),pole(22.2,18.2+D8),pole(12.9,18+D8,0.2),pole(5.3,18.15+D8),pole(8.9,18.15+D8),pole(13.9,29.65,0.3),pole(10.75,28.2),pole(10.35,29.3,0.55),pole(24.4,29.35,0.55),      // sign poles, the hydrant, bollards, a bin, the two figs
     [17.68,18.3,22.6,24.4],[17.68,18.3,24.4,26.2],pole(18.0,26.95,0.3),pole(3.75,22.62),pole(18.6,22.7),[10.85,13.2,PV-0.5,PV+0.02],      // the benches inside the gate, the bin, two lamps, the cabinets
     [4.2,4.6,KZ+RW+0.3,KZ+RW+0.6],[-2.25,-1.95,KZ+RW+0.3,KZ+RW+0.6]],gBlock).map(wr);      // and across the road; the benches, the bin and the fig on the garden's paving
  /* behind number 12, the yard along flat 1's front and its east side, to flat 1's door on our floor (plan.js): at the alley's level */
  const SIDE=[[3.8,XS-0.1,ZC+0.1,25.3],[-4.7,4.4,24.3,25.3],[-5.1,-2.9,23.1,24.9]];      // each overlapping the next, as each loses a body's width at its edges
  A.rooms.street.rs=A.rooms.street.rs.concat(SIDE);
  A.streetPass=[[XS-0.4,XS+0.4,ZO-0.45,ZO+0.45],[A.LB.sideGate[0]+0.12,A.LB.sideGate[1]-0.12,ZC-0.35,ZC+0.35]];      // from the passage out onto the bridge, and into the yard behind number 12
  A.groundAt=function(x,z){
    if(x<XS-0.05){if(x>A.LB.sideGate[0]-0.2&&x<A.LB.sideGate[1]+0.2&&z>ZC-0.05&&z<ZC+0.6) return AY*Math.min(1,(z-ZC)/0.6);      // a step down out of the side gate,
      if(x>-4.3&&x<-2.85&&z>22.95&&z<23.6) return AY*Math.min(1,(z-23.0)/0.6);                                                   // and up to flat 1's own door
      for(let i=0;i<SIDE.length;i++){const r=SIDE[i]; if(x>r[0]-0.05&&x<r[1]+0.05&&z>r[2]-0.05&&z<r[3]+0.05) return AY;} return 0;}
    const q=x-XS, lx=ZC-z;      // q: out from the front; lx: along it
    if(q>=GZ) return q<KZ?U:q<KZ+RW?RY:U;
    if(q>GZ-FLL-0.05) for(let i=0;i<FL.length;i++) if(lx>FL[i][0]-0.05&&lx<FL[i][1]+0.05) return AY+(U-AY)*Math.max(0,(q-(GZ-FLL))/FLL);      // up a flight
    if(lx>AW+0.02) return AY;      // the garden
    if(q<BL) return 0; if(q<BL+0.45) return LA*(q-BL)/0.45; if(q<FZ) return LA; if(q<AL) return LA+(AY-LA)*(q-FZ)/(AL-FZ); return AY;      // ours
  };
  const tags=[['Bridge to the street'
,1.6,1.5,BL/2],['Steps up from the alley',AW/2,AY+1.3,AL+0.2],['Steps down from the café',AW/2,U+1.2,GZ-0.6],['Number 12',0.3,U+3.4,13],['Café',4,U+3.4,25.5],['Garden',18,AY+2.2,14],['Haroe St',12,U+0.6,KZ+3.5]]
    .map(function(q){return {el:A.tag(q[0]),pos:st.localToWorld(new THREE.Vector3(q[1],q[2],q[3]))};});
  A.labelFns.push(function(){const show=A.state.labels&&!A.simsOn; tags.forEach(function(t){A.place(t.el,t.pos,show);});});
  const lc=new THREE.Vector3(); let crowns=true;
  A.frameFns.push(function(){
    const c=st.worldToLocal(lc.copy(A.camera.position)), low=c.y<5.2;      // where the camera is, in the street's own frame
    fac.visible=low&&c.z>0.4&&!(A.simsOn&&!A.eyeView()&&A.inOurBuilding());      // in Sims, inside our building, the camera looks down past where it stands
    const solid=!(A.thinTrees&&A.thinTrees());      // the tree crowns thin to a ghost only while you look inside our building, cut open; from outside they stand as they are
    if(solid!==crowns){crowns=solid; can.children.forEach(function(m){const mt=m.material; mt.transparent=!solid; mt.opacity=solid?1:0.22; mt.depthWrite=solid; if(mt===leafC){mt.alphaTest=solid?0.42:0.04; mt.needsUpdate=true;}});}
    const eve=A.goal('day')<0.5?0.6:0; if(A.goal('L:street')!==eve) A.set('L:street',eve);      // street lamps and the café's bulbs come on in the evening
  });
});
})();
