/* Haroe 10 — outside the flat: corridor, stairs and the old lobby, the garden one floor down, the neighbouring building.
   Compass: the flat's windows face south-east. In model terms +x is roughly south, -z roughly east, +z west (the corridor). */
(function(){
'use strict';
const A=window.APP, D=A.D, K=A.kit, W=D.W, L=D.L, H=D.H, KX=D.KX, AZ=A.AZ;
const box=A.box, cyl=A.cyl, sph=A.sph, M=A.M, inRoom=A.inRoom, wall=A.wall, rect=A.rect, G=A.G, scene=A.scene, canvasTex=A.canvasTex;
const R=Math.PI, CZ=L+1.7, LZ=L+4.7, GY=-2.9;          // corridor far wall, lobby far wall, garden level

/* ================= corridor, stairs, lobby ================= */
const terrazzo=canvasTex(256,256,function(g){
  g.fillStyle='#cfc8b8'; g.fillRect(0,0,256,256); const r=A.rng(21), cs=['#8a7f6d','#efe9dc','#5f6a5c','#b08d6a','#3f3f3c'];
  for(let i=0;i<1500;i++){g.fillStyle=cs[Math.floor(r()*cs.length)]; g.fillRect(r()*256,r()*256,1+r()*4,1+r()*3);}
  g.strokeStyle='#a89f8c'; g.lineWidth=2; g.strokeRect(0,0,256,256);
});
terrazzo.wrapS=terrazzo.wrapT=THREE.RepeatWrapping;
A.floorQuad(-9,5.3,L,CZ,terrazzo,1.0,'hall'); A.floorQuad(-9,-5.5,CZ,LZ,terrazzo,1.0,'hall'); A.floorQuad(3.95,5.3,CZ,CZ+2.6,terrazzo,1.0,'hall');
A.ceil('hall',-9,5.3,L,CZ); A.ceil('hall',-9,-5.5,CZ,LZ); A.ceil('hall',2.6,5.3,CZ,CZ+2.6);
const en=D.entrance;
wall('h_s',[-9,L],[5.3,L],[0,1],'hall',{holes:[[en[0]+9,en[1]+9]]});        // corridor wall with our front door
wall('h_n',[-5.5,CZ],[2.6,CZ],[0,-1],'hall');                               // opposite wall
wall('h_e',[5.3,L],[5.3,CZ+2.6],[-1,0],'hall');                             // end of the corridor, side of the stairwell
wall('st_w',[2.6,CZ],[2.6,CZ+2.6],[1,0],'hall'); wall('st_n',[2.6,CZ+2.6],[5.3,CZ+2.6],[0,-1],'hall');
wall('lb_e',[-5.5,CZ],[-5.5,LZ],[-1,0],'hall'); wall('lb_w',[-9,L],[-9,LZ],[1,0],'hall');
wall('lb_n',[-9,LZ],[-5.5,LZ],[0,-1],'hall',{holes:[[1.0,2.5,2.2]]});       // building entrance
A.doorFrame('h_s',en[0]+9,en[1]+9);
// painted dado, typical of old stairwells: glossy colour to shoulder height
['h_s','h_n','h_e','st_w','st_n','lb_e','lb_w','lb_n'].forEach(function(k){A.spans(k).forEach(function(s){rect(k,s[0],s[1],0.08,1.35,0xb9c3a6,0.003); rect(k,s[0],s[1],1.35,1.39,0x6f7d5c,0.004);});});
/* the other five flats: wooden doors with a number, a bell and a small light above */
function flatDoor(k,u,no){
  const tex=canvasTex(128,256,function(g){
    g.fillStyle='#8a6a48'; g.fillRect(0,0,128,256); g.strokeStyle='#6d5136'; g.lineWidth=5; g.strokeRect(14,16,100,100); g.strokeRect(14,132,100,108);
    g.fillStyle='#d9c07a'; g.beginPath(); g.arc(64,70,13,0,7); g.fill(); g.fillStyle='#3a2c1a'; g.font='bold 18px sans-serif'; g.textAlign='center'; g.fillText(no,64,77);
    g.fillStyle='#c9b27a'; g.fillRect(100,122,12,22);
  });
  rect(k,u-0.5,u+0.5,0,2.15,0xe6e2d6,0.005); rect(k,u-0.42,u+0.42,0,2.06,A.MT(tex,'hall'),0.007);
  rect(k,u+0.6,u+0.68,1.2,1.3,0x3b3f3c,0.006);
}
flatDoor('h_s',7.9,'2'); flatDoor('h_s',3.9,'1'); flatDoor('h_n',1.2,'6'); flatDoor('h_n',4.1,'5'); flatDoor('h_n',7.0,'4');
rect('h_s',en[1]+9+0.16,en[1]+9+0.24,1.2,1.3,0x3b3f3c,0.006);                // our bell; we are flat 3
inRoom('hall',function(){
  K.ceilDisc(null,-2.5,L+0.85,'L:hall'); K.ceilDisc(null,2.2,L+0.85,'L:hall'); K.ceilDisc(null,-7.25,L+3.0,'L:hall');
  box(0.6,0.014,0.4,0x7a6a4a,(en[0]+en[1])/2,0.007,L+0.3).castShadow=false;    // doormat outside our door
  /* stairs, on the left as you leave the flat: one flight up, one down, terrazzo steps, iron railing with a wooden handrail */
  const stone=0xbfb8a8;
  for(let i=0;i<10;i++){
    box(1.25,0.17*(i+1),0.26,stone,4.62,0.085*(i+1),CZ+0.13+i*0.26);                              // up
    box(1.25,0.17,0.26,stone,3.27,-0.085-0.17*i,CZ+0.13+i*0.26);                                   // down
  }
  box(0.04,0.9,2.6,0x2b2f2c,3.94,0.55,CZ+1.3); box(0.07,0.05,2.7,0x8a5a36,3.94,1.02,CZ+1.3);
  [0.3,0.9,1.5,2.1].forEach(function(z){box(0.03,0.9,0.03,0x2b2f2c,2.66,0.2,CZ+z);});
  box(0.04,0.9,0.04,0x2b2f2c,2.64,0.45,CZ+0.02);
  /* lobby: letter boxes, notice board, rubber plant, a bench, the old glazed iron door */
  for(let r=0;r<2;r++) for(let c=0;c<6;c++){
    const z=L+2.2+c*0.3, y=1.15+r*0.32;
    box(0.12,0.28,0.26,0x8f9aa0,-8.93,y,z); box(0.006,0.05,0.14,0x2b2f2c,-8.866,y+0.06,z); box(0.008,0.07,0.1,0xf3ebdc,-8.864,y-0.06,z);
  }
  box(0.03,0.6,0.9,0x8a6a48,-8.98,1.6,L+4.3); box(0.006,0.5,0.8,0xcfa97a,-8.96,1.6,L+4.3);
  [[1.75,L+4.1,0xfbfaf6],[1.5,L+4.45,0xf0d21c],[1.72,L+4.5,0x9fc4d6]].forEach(function(q){box(0.004,0.16,0.2,q[2],-8.955,q[0],q[1]);});
  K.fiddle(null,-5.9,L+4.3,1.9,3);
  box(1.2,0.05,0.36,0x8a6a48,-6.3,0.44,CZ+0.25); [[-6.8,CZ+0.25],[-5.8,CZ+0.25]].forEach(function(q){box(0.05,0.44,0.3,0x2b2f2c,q[0],0.22,q[1]);});
  box(0.3,1.2,0.5,0x9aa39e,-5.62,1.3,L+3.3);                                   // meter cupboard
  // entrance: two glazed leaves in an iron frame, one ajar
  const glass=new THREE.MeshBasicMaterial({color:0xbfd8de,transparent:true,opacity:0.3,depthWrite:false});
  function leaf(x,rot){const g=G(); g.position.set(x,0,LZ); g.rotation.y=rot;
    const s=rot<0?-1:1;
    box(0.74,0.06,0.05,0x2b2f2c,0.37,2.15,0,g); box(0.74,0.12,0.05,0x2b2f2c,0.37,0.06,0,g); box(0.05,2.18,0.05,0x2b2f2c,0.025,1.09,0,g); box(0.05,2.18,0.05,0x2b2f2c,0.715,1.09,0,g);
    [0.75,1.45].forEach(function(y){box(0.7,0.03,0.04,0x2b2f2c,0.37,y,0,g);}); box(0.03,2.1,0.04,0x2b2f2c,0.37,1.09,0,g);
    const p=new THREE.Mesh(new THREE.PlaneGeometry(0.66,2.0),glass); p.position.set(0.37,1.1,0); g.add(p); const q=p.clone(); q.rotation.y=R; g.add(q);
    box(0.03,0.3,0.06,0xb08d4a,0.62,1.05,s*0.03,g); g.userData.nc=true; return g;}
  leaf(-8.0,0); leaf(-6.5,R-0.9);
});

/* ================= outside ================= */
inRoom('out',function(){
  const o=G(); o.userData.nc=true;
  function ground(x0,x1,z0,z1,y,c){const m=box(x1-x0,0.1,z1-z0,c,(x0+x1)/2,y-0.05,(z0+z1)/2,o); m.castShadow=false; return m;}
  ground(-30,45,-45,40,GY,0x7fa66a);                                          // lawn of the garden level
  ground(5.95,9.5,AZ-3.5,LZ,GY+0.02,0xbdb6a6); ground(-9,9.5,AZ-3.5,AZ-0.6,GY+0.02,0xbdb6a6);   // paved path round our corner
  ground(-30,45,LZ+3.2,LZ+9.5,-0.05,0x6b6f72); ground(-30,45,LZ,LZ+3.2,-0.02,0xc9c4b8);          // street and pavement on the entrance side
  box(75,2.9,0.3,0xd8d2c4,7.5,GY/2,LZ-0.15,o);                                // retaining wall between street level and the garden
  // the building under and beside us: the floor below ("minus one") opens onto the garden
  const facade=0xe9e3d3;
  box(14.95,2.76,CZ-AZ+0.4,facade,-1.525,GY+1.38,(AZ-0.4+CZ)/2,o); box(3.5,2.76,LZ-CZ,facade,-7.25,GY+1.38,(CZ+LZ)/2,o);
  const winTex=canvasTex(128,128,function(g){g.fillStyle='#e9e3d3'; g.fillRect(0,0,128,128); g.fillStyle='#8fb0bb'; g.fillRect(30,22,68,70); g.fillStyle='#f6f3ea'; g.fillRect(62,22,4,70); g.fillStyle='#cfc8b6'; g.fillRect(24,94,80,6);});
  winTex.wrapS=THREE.RepeatWrapping;
  function strip(len,x,y,z,rotY,hh){const t=winTex.clone(); t.needsUpdate=true; t.repeat.set(Math.round(len/2.6),1); const m=new THREE.Mesh(new THREE.PlaneGeometry(len,hh||2.6),A.MT(t)); m.position.set(x,y,z); m.rotation.y=rotY; o.add(m);}
  strip(CZ-AZ,5.955,GY+1.4,(AZ+CZ)/2,R/2); strip(14.9,-1.5,GY+1.4,AZ-0.605,R);
  // the rest of our ground floor, as plain volumes, so the corridor is not floating
  // garden: trees, hedge, bench, washing line
  function tree(x,z,h,s){cyl(0.14*s,h,0x6b4a2f,x,GY+h/2,z,o,8,0.09*s); sph(1.3*s,0x3f7d4a,x,GY+h+0.6*s,z,o); sph(1.0*s,0x4f9160,x+0.8*s,GY+h+0.1*s,z+0.4*s,o); sph(0.9*s,0x2f6b45,x-0.7*s,GY+h+0.2*s,z-0.5*s,o);}
  tree(10.5,-1.5,3.6,1.2); tree(13.5,5,3.0,1); tree(9.5,-9,4.2,1.3); tree(2,-9.5,3.4,1.1); tree(-5,-11,3.8,1.2); tree(17,-6,3.2,1); tree(18,-14,4,1.3); tree(8,-16,3.2,1);
  for(let i=0;i<14;i++) sph(0.55,i%2?0x3f7d4a:0x4a8a58,8.2+i*1.15,GY+0.4,-20.2,o,1,0.8,1);
  for(let i=0;i<18;i++) sph(0.55,i%2?0x3f7d4a:0x4a8a58,21.4,GY+0.4,-19+i*1.4,o,1,0.8,1);
  box(1.5,0.06,0.4,0x8a6a48,11.5,GY+0.45,2.6,o); box(0.06,0.45,0.36,0x3b3f3c,10.9,GY+0.22,2.6,o); box(0.06,0.45,0.36,0x3b3f3c,12.1,GY+0.22,2.6,o);
  cyl(0.03,2.0,0x9aa39e,14,GY+1,-3,o,6); cyl(0.03,2.0,0x9aa39e,14,GY+1,-7,o,6); box(0.01,0.01,4,0xffffff,14,GY+1.9,-5,o);
  [[-4.2,0xf3ebdc],[-5,0x9fc4d6],[-5.8,0xd9463e]].forEach(function(q){box(0.02,0.6,0.5,q[1],14,GY+1.55,q[0],o);});
  /* the neighbouring building, 20 m away, wrapping the east, south-east and south: four floors over a ground floor */
  const bt=canvasTex(256,256,function(g){
    g.fillStyle='#e6dfcf'; g.fillRect(0,0,256,256); g.fillStyle='#d2cab6'; g.fillRect(0,232,256,24);
    g.fillStyle='#7f98a3'; g.fillRect(24,60,80,110); g.fillStyle='#f3efe4'; g.fillRect(62,60,4,110);
    g.fillStyle='#8aa08a'; for(let y=62;y<168;y+=9) g.fillRect(132,y,92,6); g.strokeStyle='#bdb5a0'; g.lineWidth=4; g.strokeRect(130,58,96,112);
    g.fillStyle='#c9c1ad'; g.fillRect(14,176,228,10); g.strokeStyle='#8f8a7c'; g.lineWidth=2; for(let x=18;x<240;x+=12){g.beginPath(); g.moveTo(x,186); g.lineTo(x,230); g.stroke();}
  });
  bt.wrapS=bt.wrapT=THREE.RepeatWrapping;
  function block(cx,cz,sx,sz,faceAxis){
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
  }
  block(7,AZ-20-5.5,34,11,'z');                    // east side
  block(KX+20+5.5,-6,11,36,'x');                   // south side
  // a tree and a bench by the entrance on the street side
  cyl(0.12,3.2,0x6b4a2f,-12.5,1.6,LZ+2.0,o,8); sph(1.3,0x3f7d4a,-12.5,3.9,LZ+2.0,o); sph(0.9,0x4f9160,-13.2,3.4,LZ+2.3,o);
  box(2.2,0.12,1.0,0xbdb6a6,-7.25,0.0,LZ+0.5,o);
});
})();
