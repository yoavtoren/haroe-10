/* Haroe 10 — outside the flat: corridor, stairs and the old lobby, the garden one floor down, the neighbouring building.
   Compass: the flat's windows face south-east. In model terms +x is roughly south, -z roughly east, +z west (the corridor). */
(function(){
'use strict';
const A=window.APP, D=A.D, K=A.kit, W=D.W, L=D.L, H=D.H, KX=D.KX, AZ=A.AZ;
const box=A.box, cyl=A.cyl, sph=A.sph, M=A.M, inRoom=A.inRoom, wall=A.wall, rect=A.rect, G=A.G, scene=A.scene, canvasTex=A.canvasTex;
const R=Math.PI, CZ=L+6.5, LZ=L+7.0, GY=-2.9;          // lobby street-side wall, street edge beyond the bridge, garden level

/* ================= the ground-floor lobby =================
   One wide, mostly empty hall. The six flats sit round it in a horseshoe, and you reach it from the street over a
   short bridge with no front door. Stairs are on the left as you leave our flat. */
const terrazzo=canvasTex(256,256,function(g){
  g.fillStyle='#cfc8b8'; g.fillRect(0,0,256,256); const r=A.rng(21), cs=['#8a7f6d','#efe9dc','#5f6a5c','#b08d6a','#3f3f3c'];
  for(let i=0;i<1500;i++){g.fillStyle=cs[Math.floor(r()*cs.length)]; g.fillRect(r()*256,r()*256,1+r()*4,1+r()*3);}
  g.strokeStyle='#a89f8c'; g.lineWidth=2; g.strokeRect(0,0,256,256);
});
terrazzo.wrapS=terrazzo.wrapT=THREE.RepeatWrapping;
const HX0=-6.5, HX1=5.3, HZ=L+6.5, BRX=-0.6, BRZ=L+7.0, BRW=1.3, SA=L+0.3, SB=L+3.0, SX=7.9;      // hall, bridge, stair alcove
A.floorQuad(HX0,HX1,L,HZ,terrazzo,1.0,'hall'); A.floorQuad(HX1,SX,(SA+SB)/2,SB,terrazzo,1.0,'hall');
A.ceil('hall',HX0,HX1,L,HZ); A.ceil('hall',HX1,SX,SA,SB);
const en=D.entrance;
wall('h_s',[HX0,L],[HX1,L],[0,1],'hall',{holes:[[en[0]-HX0,en[1]-HX0]]});      // our side: flats 1, 2 and ours
wall('h_w',[HX0,L],[HX0,HZ],[1,0],'hall');                                     // far leg of the horseshoe
wall('h_n',[HX0,HZ],[HX1,HZ],[0,-1],'hall',{holes:[[BRX-BRW/2-HX0,BRX+BRW/2-HX0,2.5]]});   // street side, open to the bridge
wall('h_e1',[HX1,L],[HX1,SA],[-1,0],'hall'); wall('h_e2',[HX1,SB],[HX1,HZ],[-1,0],'hall');
wall('st_s',[HX1,SA],[SX,SA],[0,1],'hall'); wall('st_e',[SX,SA],[SX,SB],[-1,0],'hall'); wall('st_n',[HX1,SB],[SX,SB],[0,-1],'hall');
A.doorFrame('h_s',en[0]-HX0,en[1]-HX0);
const HW=['h_s','h_w','h_n','h_e1','h_e2','st_s','st_e','st_n'];
HW.forEach(function(k){A.spans(k).forEach(function(s){
  const t=terrazzo.clone(); t.needsUpdate=true; t.repeat.set(s[1]-s[0],1.35);          // same terrazzo as the floor, up to half height
  rect(k,s[0],s[1],0,1.35,A.MT(t,'hall'),0.005); rect(k,s[0],s[1],1.35,1.39,0xa89f8c,0.0055);
  rect(k,s[0],s[1],1.39,H,0xf7f6f1,0.004);});});                            // plain white above the cladding
/* the other five flats: grey doors with a number and a bell */
function flatDoor(k,u,no){
  const tex=canvasTex(128,256,function(g){
    g.fillStyle='#9a9fa1'; g.fillRect(0,0,128,256); g.strokeStyle='#7d8284'; g.lineWidth=5; g.strokeRect(14,16,100,100); g.strokeRect(14,132,100,108);
    g.fillStyle='#d9dcdc'; g.beginPath(); g.arc(64,70,13,0,7); g.fill(); g.fillStyle='#2f3335'; g.font='bold 18px sans-serif'; g.textAlign='center'; g.fillText(no,64,77);
    g.fillStyle='#c9cdcf'; g.fillRect(100,122,12,22);
  });
  rect(k,u-0.5,u+0.5,0,2.15,0x8a8f91,0.008); rect(k,u-0.42,u+0.42,0,2.06,A.MT(tex,'hall'),0.01);
  rect(k,u+0.6,u+0.68,1.2,1.3,0x3b3f3c,0.009);
}
flatDoor('h_s',-1.1-HX0,'2'); flatDoor('h_s',-4.6-HX0,'1'); flatDoor('h_w',1.6,'6'); flatDoor('h_w',4.9,'5'); flatDoor('h_e2',2.2,'4');
rect('h_s',en[1]-HX0+0.16,en[1]-HX0+0.24,1.2,1.3,0x3b3f3c,0.009);              // our bell; we are flat 3
inRoom('hall',function(){
  [[-3.6,L+1.6],[2.2,L+1.6],[-3.6,L+4.8],[2.2,L+4.8]].forEach(function(q){K.ceilDisc(null,q[0],q[1],'L:hall');});
  box(0.6,0.014,0.4,0x7a6a4a,(en[0]+en[1])/2,0.007,L+0.3).castShadow=false;    // doormat outside our door
  const ed=A.door('entrance'); box(0.83,2.03,0.004,0x9a9fa1,0.425,1.02,0.023,ed.p); box(0.124,0.029,0.05,0x5f6466,0.72,1.05,0.05,ed.p);   // our door is grey on the lobby side too
  /* the wide column opposite our door, clad in terrazzo to half height like the walls */
  const cx=(en[0]+en[1])/2, cz=L+2.5, ct=terrazzo.clone(); ct.needsUpdate=true; ct.repeat.set(0.9,1.35);
  box(0.9,H,0.5,0xf1efe8,cx,H/2,cz); box(0.92,1.37,0.52,A.MT(ct,null,true),cx,0.685,cz);
  /* stairs in an alcove on the left as you leave the flat: one flight up, one down */
  const stone=0xbfb8a8, zu=(SA+SB)/2+0.675, zd=(SA+SB)/2-0.675;
  for(let i=0;i<10;i++){
    box(0.26,0.17*(i+1),1.25,stone,HX1+0.13+i*0.26,0.085*(i+1),zu);                               // up
    box(0.26,0.17,1.25,stone,HX1+0.13+i*0.26,-0.085-0.17*i,zd);                                    // down
  }
  // the down flight reaches the floor below, which has flats of its own under the lobby slab
  const lw=0xe9e3d3, lowDoor=canvasTex(64,128,function(g){g.fillStyle='#8a6a48'; g.fillRect(0,0,64,128); g.strokeStyle='#6d5136'; g.lineWidth=3; g.strokeRect(8,10,48,48); g.strokeRect(8,66,48,52);});
  box(SX-HX1+0.2,0.1,SB-SA,stone,(HX1+SX)/2+0.1,GY+0.05,(SA+SB)/2);                    // lower landing
  box(0.1,-GY,SB-SA,lw,SX+0.05,GY/2,(SA+SB)/2); box(SX-HX1,-GY,0.1,lw,(HX1+SX)/2,GY/2,SA-0.05); box(SX-HX1-0.7,-GY,0.1,lw,(HX1+SX)/2+0.35,GY/2,SB+0.05);
  box(0.02,2.2,1.6,0x2a2d2b,5.97,GY+1.1,zd);                                           // way into the lower corridor
  [[SA+0.25,1],[SB-0.25,1]].forEach(function(q){const m=new THREE.Mesh(new THREE.PlaneGeometry(0.8,2.05),A.MT(lowDoor)); m.position.set(SX-0.01,GY+1.03,q[0]+(q[0]<zd?0.35:-0.35)); m.rotation.y=-R/2; scene.add(m);});
  box(2.6,0.9,0.04,0x2b2f2c,HX1+1.3,0.55,(SA+SB)/2); box(2.7,0.05,0.07,0x8a5a36,HX1+1.3,1.02,(SA+SB)/2);
  /* on the left after the bridge: letter boxes, then the telecom and electricity cupboards */
  const mz=HZ-0.07;
  for(let r=0;r<2;r++) for(let c=0;c<6;c++){
    const x=BRX-1.6-c*0.3, y=1.15+r*0.32;
    box(0.26,0.28,0.12,0x8f9aa0,x,y,mz); box(0.14,0.05,0.006,0x2b2f2c,x,y+0.06,mz-0.064); box(0.1,0.07,0.008,0xf3ebdc,x,y-0.06,mz-0.066);
  }
  box(0.7,1.3,0.22,0x9aa39e,BRX-4.0,1.25,HZ-0.11); box(0.006,1.24,0.004,0x6f7672,BRX-4.0,1.25,HZ-0.222); box(0.2,0.1,0.004,0xe8c91a,BRX-4.15,1.6,HZ-0.223);
  box(0.6,1.0,0.2,0xb9bdc0,BRX-4.85,1.2,HZ-0.1); box(0.006,0.94,0.004,0x6f7672,BRX-4.85,1.2,HZ-0.202);
  box(0.9,0.6,0.03,0x8a6a48,BRX+2.2,1.75,HZ-0.02); box(0.8,0.5,0.006,0xcfa97a,BRX+2.2,1.75,HZ-0.04);    // notice board
  [[BRX+1.95,1.82,0xfbfaf6],[BRX+2.3,1.68,0xf0d21c],[BRX+2.45,1.86,0x9fc4d6]].forEach(function(q){box(0.2,0.16,0.004,q[2],q[0],q[1],HZ-0.046);});
  K.fiddle(null,HX0+0.5,HZ-0.5,1.9,3);
  box(1.4,0.05,0.36,0x8a6a48,HX0+0.3,0.44,L+3.3).rotation.y=R/2; [[HX0+0.3,L+2.75],[HX0+0.3,L+3.85]].forEach(function(q){box(0.3,0.44,0.05,0x2b2f2c,q[0],0.22,q[1]);});
  /* the bridge from the street: a short, narrow concrete slab over the gap, iron railings, no door */
  box(BRW,0.22,BRZ-HZ+0.1,0xc9c4b8,BRX,-0.107,(HZ+BRZ)/2);
  [-BRW/2+0.03,BRW/2-0.03].forEach(function(dx){
    box(0.05,0.05,BRZ-HZ,0x2b2f2c,BRX+dx,1.0,(HZ+BRZ)/2); box(0.05,0.05,BRZ-HZ,0x2b2f2c,BRX+dx,0.12,(HZ+BRZ)/2);
    for(let z=HZ+0.08;z<BRZ;z+=0.12) box(0.02,0.86,0.02,0x2b2f2c,BRX+dx,0.56,z);
  });
});

/* ================= outside ================= */
inRoom('out',function(){
  const o=G(); o.userData.nc=true; A.outside=o;
  function ground(x0,x1,z0,z1,y,c){const m=box(x1-x0,0.1,z1-z0,c,(x0+x1)/2,y-0.05,(z0+z1)/2,o); m.castShadow=false; return m;}
  ground(-30,45,-45,40,GY,0xd8c7a0);                                          // the yard is mostly sand
  ground(8.2,11.4,-9.5,-5.5,GY+0.015,0x8fae74); ground(-3,1.5,-11.6,-9,GY+0.015,0x8fae74);     // two worn patches of green
  ground(5.95,9.5,AZ-3.5,CZ,GY+0.02,0xbdb6a6); ground(-6.5,9.5,AZ-3.5,AZ-0.6,GY+0.02,0xbdb6a6);   // paved path round our corner
  ground(-30,45,LZ+3.2,LZ+9.5,-0.05,0x6b6f72); ground(-30,45,LZ,LZ+3.2,-0.02,0xc9c4b8);          // street and pavement on the entrance side
  box(75,2.9,0.3,0xd8d2c4,7.5,GY/2,LZ-0.15,o);                                // retaining wall between street level and the garden
  // the building under and beside us: the floor below ("minus one") opens onto the garden
  const facade=0xe9e3d3;
  box(12.45,2.76,CZ-AZ+0.4,facade,-0.275,GY+1.38,(AZ-0.4+CZ)/2,o);
  const winTex=canvasTex(128,128,function(g){g.fillStyle='#e9e3d3'; g.fillRect(0,0,128,128); g.fillStyle='#8fb0bb'; g.fillRect(30,22,68,70); g.fillStyle='#f6f3ea'; g.fillRect(62,22,4,70); g.fillStyle='#cfc8b6'; g.fillRect(24,94,80,6);});
  winTex.wrapS=THREE.RepeatWrapping;
  function strip(len,x,y,z,rotY,hh){const t=winTex.clone(); t.needsUpdate=true; t.repeat.set(Math.round(len/2.6),1); const m=new THREE.Mesh(new THREE.PlaneGeometry(len,hh||2.6),A.MT(t)); m.position.set(x,y,z); m.rotation.y=rotY; o.add(m);}
  strip(CZ-AZ,5.955,GY+1.4,(AZ+CZ)/2,R/2); strip(12.4,-0.3,GY+1.4,AZ-0.605,R); strip(12.4,-0.3,GY+1.4,CZ+0.005,0);
  // the rest of our ground floor, as plain volumes, so the corridor is not floating
  // garden: trees, hedge, bench, washing line
  function tree(x,z,h,s){cyl(0.14*s,h,0x6b4a2f,x,GY+h/2,z,o,8,0.09*s); sph(1.3*s,0x3f7d4a,x,GY+h+0.6*s,z,o); sph(1.0*s,0x4f9160,x+0.8*s,GY+h+0.1*s,z+0.4*s,o); sph(0.9*s,0x2f6b45,x-0.7*s,GY+h+0.2*s,z-0.5*s,o);}
  tree(9.6,-1.5,3.6,1.0); tree(12.2,5.5,3.0,0.9); tree(9.6,-8,4.2,1.1); tree(2,-10,3.4,0.9); tree(-4.5,-10.2,3.8,1.0); tree(12.6,-10.6,3.4,0.9);
  for(let i=0;i<16;i++) sph(0.5,i%2?0x3f7d4a:0x4a8a58,-5+i*1.2,GY+0.38,AZ-8.2,o,1,0.8,1);            // hedges along the neighbour's edge
  for(let i=0;i<16;i++) sph(0.5,i%2?0x3f7d4a:0x4a8a58,KX+8.2,GY+0.38,AZ-7+i*1.3,o,1,0.8,1);
  box(1.5,0.06,0.4,0x8a6a48,10.8,GY+0.45,2.6,o); box(0.06,0.45,0.36,0x3b3f3c,10.2,GY+0.22,2.6,o); box(0.06,0.45,0.36,0x3b3f3c,11.4,GY+0.22,2.6,o);
  cyl(0.03,2.0,0x9aa39e,11.8,GY+1,-3,o,6); cyl(0.03,2.0,0x9aa39e,11.8,GY+1,-7,o,6); box(0.01,0.01,4,0xffffff,11.8,GY+1.9,-5,o);
  [[-4.2,0xf3ebdc],[-5,0x9fc4d6],[-5.8,0xd9463e]].forEach(function(q){box(0.02,0.6,0.5,q[1],11.8,GY+1.55,q[0],o);});
  /* the neighbouring building, close by, wrapping the east, south-east and south: four floors over a ground floor */
  const bt=canvasTex(256,256,function(g){
    g.fillStyle='#e6dfcf'; g.fillRect(0,0,256,256); g.fillStyle='#d2cab6'; g.fillRect(0,232,256,24);
    g.fillStyle='#7f98a3'; g.fillRect(24,60,80,110); g.fillStyle='#f3efe4'; g.fillRect(62,60,4,110);
    g.fillStyle='#8aa08a'; for(let y=62;y<168;y+=9) g.fillRect(132,y,92,6); g.strokeStyle='#bdb5a0'; g.lineWidth=4; g.strokeRect(130,58,96,112);
    g.fillStyle='#c9c1ad'; g.fillRect(14,176,228,10); g.strokeStyle='#8f8a7c'; g.lineWidth=2; for(let x=18;x<240;x+=12){g.beginPath(); g.moveTo(x,186); g.lineTo(x,230); g.stroke();}
  });
  bt.wrapS=bt.wrapT=THREE.RepeatWrapping;
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
  block(KX+GAP+5.5,-1,11,36,'x');                  // south side
  A.frameFns.push(function(){                      // a neighbour is hidden while the camera is behind or inside it, so it never blocks the view
    const c=A.camera.position; blocks.forEach(function(b){b.g.visible=A.sunReal||(b.axis==='x'?c.x<b.face-1.5:c.z>b.face+1.5);});
  });
  // a tree and a bench by the entrance on the street side
  cyl(0.12,3.2,0x6b4a2f,-8.5,1.6,LZ+2.0,o,8); sph(1.3,0x3f7d4a,-8.5,3.9,LZ+2.0,o); sph(0.9,0x4f9160,-9.2,3.4,LZ+2.3,o);

});
})();
