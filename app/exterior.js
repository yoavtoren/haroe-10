/* Haroe 10 — outside the flat: the lobby and its stairs, the yard one floor down, the neighbouring building, and on the
   street side the two entrance bridges, the square with the café, and Haroe St.
   Compass: the flat's windows face south-east. In model terms +x is roughly south, -z roughly east, +z west (the corridor). */
(function(){
'use strict';
const A=window.APP, D=A.D, K=A.kit, W=D.W, L=D.L, H=D.H, KX=D.KX, AZ=A.AZ;
const box=A.box, cyl=A.cyl, sph=A.sph, M=A.M, inRoom=A.inRoom, wall=A.wall, rect=A.rect, G=A.G, scene=A.scene, canvasTex=A.canvasTex;
const R=Math.PI, CZ=L+6.5, GY=-2.9;          // lobby street-side wall, garden level

/* ================= the ground-floor lobby =================
   One wide, mostly empty hall. The six flats sit round it in a horseshoe, and you reach it from the square in front
   through two open doorways, each at the end of its own short bridge. Stairs are on the left as you leave our flat. */
const terrazzo=canvasTex(256,256,function(g){
  g.fillStyle='#cfc8b8'; g.fillRect(0,0,256,256); const r=A.rng(21), cs=['#8a7f6d','#efe9dc','#5f6a5c','#b08d6a','#3f3f3c'];
  for(let i=0;i<1500;i++){g.fillStyle=cs[Math.floor(r()*cs.length)]; g.fillRect(r()*256,r()*256,1+r()*4,1+r()*3);}
  g.strokeStyle='#a89f8c'; g.lineWidth=2; g.strokeRect(0,0,256,256);
});
terrazzo.wrapS=terrazzo.wrapT=THREE.RepeatWrapping;
const HX0=-6.5, HX1=5.3, HZ=L+6.5, BR=[-0.6,3.6], BRX=BR[0], BRW=1.3, SA=L+0.3, SB=L+3.0, SX=7.9;      // hall, the two bridges, stair alcove
A.floorQuad(HX0,HX1,L,HZ,terrazzo,1.0,'hall'); A.floorQuad(HX1,SX,(SA+SB)/2,SB,terrazzo,1.0,'hall');
A.ceil('hall',HX0,HX1,L,HZ); A.ceil('hall',HX1,SX,SA,SB);
const en=D.entrance;
wall('h_s',[HX0,L],[HX1,L],[0,1],'hall',{holes:[[en[0]-HX0,en[1]-HX0]]});      // our side: flats 1, 2 and ours
wall('h_w',[HX0,L],[HX0,HZ],[1,0],'hall');                                     // far leg of the horseshoe
wall('h_n',[HX0,HZ],[HX1,HZ],[0,-1],'hall',{holes:BR.map(function(x){return [x-BRW/2-HX0,x+BRW/2-HX0,2.5];})});   // street side: two doorways, each open to its bridge
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
  ground(5.95,9.5,AZ-3.5,CZ,GY+0.02,0xbdb6a6); ground(-6.5,9.5,AZ-3.5,AZ-0.6,GY+0.02,0xbdb6a6);   // paved path round our corner
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
});

/* ================= the street side =================
   Haroe St runs past the front. Between it and the building lies a small paved square under old ficus trees: on the
   left the café of number 12 with its umbrellas, on the right a fenced garden with a round memorial stone. The square
   is a metre below the lobby, and the floor below us takes its light from a sunken strip along the building, so each
   of the two entrances is a flight of steps up and then a short bridge across.
   Seen from the street: -x is to the left, the building is toward -z. */

/* All of this is built from a great many small parts, so parts of one colour (or one texture) are merged into a single mesh. */
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
  const PZ=HZ+1.6, PY=-1.02, RY=PY-0.13, SZ=31, RW=7, FX0=-9, FX1=14.7, FW=FX1-FX0, TOP=12.6;      // far edge of the sunken strip, level of the square, of the road, the kerb, width of the road, our street front
  const st=G(), can=G(st), fac=G(st), far=[];          // everything; the tree crowns; our own street front; the other buildings
  st.userData.nc=true;
  const B=batch(st), C=batch(can), F=batch(fac,0x3c3d3b);
  const iron=0x2b2f2c, green=0x23402f, leaf=[0x3f7d4a,0x4a8a58,0x2f6b45], rnd=A.rng(10);
  const tex=function(w,h,draw,wrap){const t=canvasTex(w,h,draw); if(wrap) t.wrapS=t.wrapT=THREE.RepeatWrapping; return t;};
  function flat(x0,x1,z0,z1,y,mat,pitch){            // a level patch, its texture laid out in metres
    const g=new THREE.BufferGeometry(), p=pitch||1;
    g.setAttribute('position',new THREE.Float32BufferAttribute([x0,y,z0, x0,y,z1, x1,y,z1, x1,y,z0],3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute([x0/p,z0/p, x0/p,z1/p, x1/p,z1/p, x1/p,z0/p],2));
    g.setIndex([0,1,2,0,2,3]); g.computeVertexNormals();
    const m=new THREE.Mesh(g,mat); m.receiveShadow=true; st.add(m); return m;
  }
  function panel(w,h,mat,x,y,z,ry,parent){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat); m.position.set(x,y,z); m.rotation.y=ry||0; (parent||st).add(m); return m;}

  /* ---------- ground: the square, the kerb, Haroe St with its zebra crossing, Moshe Sharet St running off opposite ---------- */
  const pave=tex(256,256,function(g){
    const r=A.rng(44), cs=['#8c6455','#7f5a4e','#96705f','#84675c','#8f7a6e','#77564b'];
    g.fillStyle='#6a4f45'; g.fillRect(0,0,256,256);
    for(let j=0;j<16;j++) for(let i=-1;i<8;i++){g.fillStyle=cs[Math.floor(r()*cs.length)]; g.fillRect(i*32+(j%2?16:0)+1,j*16+1,30,14);}
  },true), paveM=A.MT(pave,null,true);
  B.box(75,PY-GY,SZ-PZ,0xd8d2c4,7.5,(GY+PY)/2,(PZ+SZ)/2);            // the square is solid ground: its edge is the retaining wall of the sunken strip
  B.box(75,RY-GY,56-SZ,0x5d6164,7.5,(GY+RY)/2,(SZ+56)/2);            // asphalt
  flat(-30,45,PZ,SZ-0.16,PY+0.004,paveM,1.6);
  [[-30,-8.2],[-2.6,45]].forEach(function(q){                        // far pavement, either side of Moshe Sharet St
    B.box(q[1]-q[0],0.13,56-SZ-RW,0xd8d2c4,(q[0]+q[1])/2,RY+0.065,(SZ+RW+56)/2); flat(q[0],q[1],SZ+RW+0.16,41.5,PY+0.004,paveM,1.6);});
  for(let x=-14;x<16;x+=0.5){const red=x>=-3.5&&x<4.5, odd=Math.round(x*2)%2;            // painted kerb: red and white by the crossing, blue and white where you may park
    B.box(0.5,0.14,0.16,odd?(red?0xc23a34:0x3a62b0):0xf1f1ec,x+0.25,PY-0.062,SZ-0.08);}
  for(let k=0;k<7;k++) B.box(3.2,0.012,0.5,0xeeeeea,0.6,RY+0.006,SZ+0.6+k);
  B.box(1.6,0.012,0.6,0xd9b93a,0.6,PY+0.01,SZ-0.5); B.box(0.6,0.012,3.2,0xd9b93a,0.6,PY+0.01,SZ-2.4);      // tactile strip leading in from the crossing
  B.box(FW,0.04,PZ-HZ,0xbdb6a6,(FX0+FX1)/2,GY+0.02,(HZ+PZ)/2);                                             // floor of the sunken strip
  const shade=tex(256,256,function(g){const r=A.rng(77);                                                   // the square lies in dappled shade all day
    for(let i=0;i<80;i++){const x=r()*256, y=r()*256, q=10+r()*26, gr=g.createRadialGradient(x,y,0,x,y,q);
      gr.addColorStop(0,'rgba(18,28,20,0.32)'); gr.addColorStop(1,'rgba(18,28,20,0)'); g.fillStyle=gr; g.fillRect(x-q,y-q,2*q,2*q);}});
  const sm=flat(FX0,13,PZ,SZ+1.5,PY+0.02,new THREE.MeshBasicMaterial({map:shade,transparent:true,depthWrite:false}),1); sm.renderOrder=1;
  (function(){const u=sm.geometry.attributes.uv; [0,0, 0,1, 1,1, 1,0].forEach(function(n,i){u.array[i]=n;});})();

  /* ---------- the two entrances: steps up from the square, then a bridge over the sunken strip to an open doorway ---------- */
  const run=1.5, rise=-PY, slope=Math.atan2(rise,run);
  function cheek(){const s=new THREE.Shape(); s.moveTo(0,PY); s.lineTo(run+0.25,PY); s.lineTo(run+0.25,PY+0.3); s.lineTo(0,0.45); return new THREE.ExtrudeGeometry(s,{depth:0.16,bevelEnabled:false});}
  BR.forEach(function(bx){
    B.box(BRW,0.22,PZ-HZ+0.1,0xc9c4b8,bx,-0.107,(HZ+PZ)/2);                       // the bridge: a narrow concrete slab, iron railings
    [-1,1].forEach(function(s){
      const x=bx+s*(BRW/2-0.03), cx=bx+s*(BRW/2+0.08);
      B.box(0.05,0.05,PZ-HZ,iron,x,1.0,(HZ+PZ)/2); B.box(0.05,0.05,PZ-HZ,iron,x,0.12,(HZ+PZ)/2);
      for(let z=HZ+0.08;z<PZ;z+=0.12) B.box(0.02,0.86,0.02,iron,x,0.56,z);
      B.geo(cheek(),0xf0eee8,cx+0.08,0,PZ,-R/2);                                  // plastered wall down each side of the steps, handrail on top
      B.box(0.04,0.04,Math.hypot(run,rise)+0.1,iron,cx,0.9-rise/2,PZ+run/2,0,slope);
      [0.1,0.75,1.4].forEach(function(d){B.box(0.03,0.46,0.03,iron,cx,0.675-0.675*d,PZ+d);});
    });
    for(let i=1;i<=5;i++) B.box(BRW,rise-0.17*i,0.3,0xcfc8b8,bx,PY+(rise-0.17*i)/2,PZ+0.3*i-0.15);
  });
  function fence(x0,z0,x1,z1,y,h,c,hoops){            // iron fence between two points: rails, bars, a post at each end, hoops on top for the municipal kind
    const len=Math.hypot(x1-x0,z1-z0), a=Math.atan2(x1-x0,z1-z0), f=B.at(x0,y,z0,a);
    f.box(0.03,0.03,len,c,0,h,len/2); f.box(0.03,0.03,len,c,0,0.1,len/2);
    for(let d=0.07;d<len;d+=0.14) f.box(0.014,h-0.1,0.014,c,0,(h+0.1)/2,d);
    f.box(0.05,h+0.06,0.05,c,0,(h+0.06)/2,0); f.box(0.05,h+0.06,0.05,c,0,(h+0.06)/2,len);
    if(hoops) for(let d=0.4;d<len-0.3;d+=0.8) B.geo(new THREE.TorusGeometry(0.2,0.012,4,10,R),c,x0+Math.sin(a)*d,y+h,z0+Math.cos(a)*d,a+R/2);
  }
  const SW=BRW/2+0.16;                                 // half the width of a flight of steps with its two walls
  fence(FX0+0.1,PZ+0.1,BR[0]-SW,PZ+0.1,PY,0.95,iron); fence(BR[0]+SW,PZ+0.1,BR[1]-SW,PZ+0.1,PY,0.95,iron); fence(BR[1]+SW,PZ+0.1,FX1-0.1,PZ+0.1,PY,0.95,iron);

  /* ---------- planting ---------- */
  function bed(x0,x1,z0,z1,h){B.box(x1-x0,h,z1-z0,0xb9ab90,(x0+x1)/2,PY+h/2,(z0+z1)/2); B.box(x1-x0-0.36,0.02,z1-z0-0.36,0x4d4334,(x0+x1)/2,PY+h+0.002,(z0+z1)/2);}      // planted bed, a low border of washed concrete
  function shrub(x,z,r,c,y){B.sph(r,c,x,(y==null?PY+0.3:y)+r*0.6,z,1,0.78,1);}
  function palm(x,z,h,s,y0,n){                         // a trunk, then fronds that rise and droop
    y0=y0==null?PY:y0; n=n||13; B.cyl(0.085*s,h,0x9a8a6a,x,y0+h/2,z,7,0.065*s);
    for(let k=0;k<n;k++){
      const a=k*2*R/n+h*3, up=0.25+(k%4)*0.2, l=0.95*s, g1=new THREE.BoxGeometry(0.11*s,0.012,l), g2=new THREE.BoxGeometry(0.08*s,0.012,l);
      g1.translate(0,0,l/2); g2.translate(0,0,l/2);
      B.geo(g1,leaf[k%2],x,y0+h,z,a,-up);
      B.geo(g2,leaf[(k+1)%2],x+Math.sin(a)*Math.cos(up)*l,y0+h+Math.sin(up)*l,z+Math.cos(a)*Math.cos(up)*l,a,0.5);
    }
  }
  function ficus(x,z,s,a0,pit){                        // the old trees that roof the square: a thick trunk, heavy limbs, one wide crown
    const bark=0x7d6e5c;
    B.cyl(0.42*s,3.0,bark,x,PY+1.5,z,10,0.3*s); if(pit) B.box(1.5,0.1,1.5,0x4d4334,x,PY+0.052,z);
    for(let k=0;k<4;k++){
      const a=a0+k*R/2+(k%2?0.35:0), t=0.75, len=3.6*s;
      B.cyl(0.17*s,len,bark,x+Math.sin(a)*Math.sin(t)*len/2,PY+2.7+Math.cos(t)*len/2,z+Math.cos(a)*Math.sin(t)*len/2,7,0.1*s,a,t);
      C.sph(2.9*s,leaf[k%3],x+Math.sin(a)*2.8*s,PY+6.4+(k%2?0.5:0),z+Math.cos(a)*2.8*s,1,0.62,1);
    }
    C.sph(3.3*s,leaf[1],x,PY+7.7,z,1,0.6,1);
  }
  bed(FX0+0.15,BR[0]-SW,PZ+0.3,17,0.32); bed(BR[0]+SW,BR[1]-SW,PZ+0.3,16.3,0.32); bed(BR[1]+SW,12.8,PZ+0.3,17,0.32);      // along the building, either side of the steps
  for(let i=0;i<8;i++) shrub(-8.3+i*0.72,14.95+(i%3)*0.62,0.36+rnd()*0.24,leaf[i%3]);
  [[-2.3,15.5,0.46],[-2.95,16.25,0.36],[-1.95,16.3,0.3]].forEach(function(q){B.sph(q[2],0x8f8c86,q[0],PY+0.3+q[2]*0.55,q[1],1.15,0.8,0.9);});      // boulders by the first steps
  palm(1.5,15.3,0.45,0.9,PY+0.3); shrub(0.75,15.6,0.3,leaf[1]); shrub(2.3,15.0,0.34,leaf[2]);
  palm(5.05,15.4,1.3,0.7,PY+0.3); for(let i=0;i<8;i++) shrub(6.3+i*0.8,14.95+(i%3)*0.62,0.36+rnd()*0.26,leaf[(i+1)%3]);
  B.cyl(1.15,0.36,0xb9ab90,1.5,PY+0.18,20.6,20); B.cyl(0.98,0.02,0x4d4334,1.5,PY+0.37,20.6,20);            // round bed where the paths meet
  shrub(1.5,20.6,0.42,leaf[0],PY+0.36); for(let i=0;i<7;i++){const a=i*0.9; B.sph(0.11,i%2?0xf3f0e8:0xe8c44a,1.5+Math.sin(a)*0.68,PY+0.45,20.6+Math.cos(a)*0.68);}
  ficus(-4.4,20.3,1.0,0.4,true); ficus(6.3,21.2,1.1,1.2,true); ficus(10.9,26.6,0.95,2.0);

  /* ---------- the café of number 12, spilling onto the square ---------- */
  const gingham=function(col){return A.MT(tex(64,64,function(g){g.fillStyle='#f6f3ec'; g.fillRect(0,0,64,64); g.globalAlpha=0.55; g.fillStyle=col; for(let i=0;i<8;i+=2){g.fillRect(i*8,0,8,64); g.fillRect(0,i*8,64,8);}},true),null,true);};
  const cloths=[gingham('#c8323a'),gingham('#2f7d57')];
  function chair(x,z,o){const c=B.at(x,PY,z,o);                                    // bistro chair, facing its local +z
    c.box(0.42,0.04,0.42,0xe8e1cf,0,0.45,0); c.box(0.42,0.34,0.03,0xe8e1cf,0,0.72,-0.2);
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){c.box(0.03,q[1]<0?0.9:0.45,0.03,0xb58c5a,q[0]*0.19,q[1]<0?0.45:0.225,q[1]*0.19);});}
  function table(x,z,k,n){                                                         // a small table under a checked cloth, with n chairs round it
    const g=new THREE.BoxGeometry(0.8,0.24,0.8), u=g.attributes.uv; for(let i=0;i<24;i++) if(i<8||i>=16) u.setY(i,u.getY(i)*0.3);      // keep the checks square where the cloth hangs down
    B.geo(g,cloths[k%2],x,PY+0.63,z); B.cyl(0.035,0.5,iron,x,PY+0.26,z,6); B.cyl(0.22,0.03,iron,x,PY+0.015,z,10);
    for(let i=0;i<n;i++){const a=i*2*R/n+(k%2?R/2:0); chair(x+Math.sin(a)*0.66,z+Math.cos(a)*0.66,a+R);}
  }
  function umbrella(x,z,s){                                                        // big square parasol on a timber post
    B.box(0.5,0.25,0.5,0x8f8f8a,x,PY+0.125,z); B.box(0.09,2.75,0.09,0x9a7b55,x,PY+1.4,z);
    const g=new THREE.ConeGeometry(s*0.7071,0.7,4).toNonIndexed(); g.computeVertexNormals(); B.geo(g,0xe9e4d6,x,PY+2.72,z,R/4);
    [[0,1],[1,0],[0,-1],[-1,0]].forEach(function(q){B.box(q[0]?0.02:s,0.2,q[0]?s:0.02,0xe2dccb,x+q[0]*s/2,PY+2.28,z+q[1]*s/2);});
  }
  umbrella(-5.4,25.4,3.6); umbrella(-1.9,26.9,3.2);
  [[-6.35,24.5,2],[-4.45,24.5,3],[-6.35,26.3,2],[-4.45,26.3,4],[-2.7,26.3,2],[-1.1,26.3,2],[-1.9,27.75,3],[-7.7,22.5,2]].forEach(function(q,i){table(q[0],q[1],i,q[2]);});
  [-8.1,-6.7,-5.3].forEach(function(x){B.box(1.25,0.45,0.45,0xf1efe8,x,PY+0.225,30); B.sph(0.42,leaf[0],x-0.3,PY+0.72,30,1,0.8,0.6); B.sph(0.42,leaf[1],x+0.3,PY+0.74,30,1,0.8,0.6);});      // hedge in white boxes along the pavement
  B.cyl(0.22,0.6,0xe6dfcd,-8.45,PY+0.3,29.0,12,0.34); B.sph(0.4,0x6d4a5c,-8.45,PY+0.85,29.0,1,0.8,1); B.sph(0.25,0x7a9a4a,-8.3,PY+1.0,28.9);      // big pot of coleus by the corner
  (function(){const c=B.at(2.7,PY,26.3,-R/2), w=0xe9ebeb;                         // the evaporative cooler on its castors, blowing at the tables
    c.box(0.78,0.36,0.52,w,0,0.26,0); c.box(0.74,0.85,0.48,w,0,0.86,0); c.box(0.78,0.1,0.52,0xdfe2e3,0,1.33,0);
    c.box(0.6,0.62,0.02,0xbfc4c6,0,0.9,0.245); for(let i=0;i<7;i++) c.box(0.6,0.02,0.03,0x8e9598,0,0.64+i*0.085,0.255);
    c.box(0.02,0.6,0.36,0xbfc4c6,0.375,0.9,0); c.box(0.16,0.02,0.1,0x2c3a55,-0.2,1.385,0.1);
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){c.cyl(0.04,0.05,iron,q[0]*0.33,0.04,q[1]*0.2,6,null,0,R/2);});
  })();
  B.box(1.0,0.5,0.5,0xa39c92,3.75,PY+0.25,27.35); shrub(3.5,27.35,0.26,leaf[1],PY+0.45); B.sph(0.1,0xe8a04a,3.95,PY+0.66,27.3); B.sph(0.1,0xf3f0e8,3.75,PY+0.7,27.45);      // brick planter with flowers
  [[4.45,28.4],[4.95,27.5]].forEach(function(q){B.cyl(0.16,0.4,0xd9cdb4,q[0],PY+0.2,q[1],10,0.22); palm(q[0],q[1],0.2,0.55,PY+0.4,9);});

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
  B.cyl(0.035,3.0,0x9aa0a2,-1.9,PY+1.5,30.45,8); sign(tCross,0.6,0.6,-1.9,PY+2.6,30.49,0.25);                 // zebra crossing sign
  B.cyl(0.04,2.9,A.MT(stripe,null,true),-4.3,PY+1.45,30.5,10);                                                // the blue and white pole with the parking rules
  sign(tPark,0.45,0.45,-4.3,PY+2.62,30.55,0); sign(tNote,0.45,0.62,-4.3,PY+2.02,30.55,0);
  B.cyl(0.03,2.9,0x9aa0a2,3.9,PY+1.45,26.2,8); sign(tMoto,0.6,0.6,3.9,PY+2.6,26.24,0,true);                    // no motorcycles on the square
  [[-1.2,30.6],[2.4,30.6],[3.8,30.6]].forEach(function(q){B.cyl(0.12,0.7,0xa9aaa6,q[0],PY+0.35,q[1],10); B.sph(0.12,0xa9aaa6,q[0],PY+0.7,q[1]);});      // concrete bollards
  function bench(x,z,o){const b=B.at(x,PY,z,o), wood=0x8a5a3c;                                                 // park bench, facing its local +z
    for(let i=0;i<3;i++){b.box(1.7,0.035,0.11,wood,0,0.44,-0.13+i*0.13); b.box(1.7,0.11,0.03,wood,0,0.58+i*0.13,-0.24-i*0.03);}
    [-0.7,0.7].forEach(function(dx){b.box(0.05,0.44,0.42,iron,dx,0.22,-0.02); b.box(0.05,0.5,0.05,iron,dx,0.68,-0.27);});}
  bench(-6.4,17.45,0); bench(-3.4,17.45,0); bench(8.2,17.45,0); bench(5.5,27.9,-R/2);
  B.cyl(0.24,0.8,0x1f4a36,4.6,PY+0.4,30.1,12,0.27); B.cyl(0.29,0.12,0x183b2b,4.6,PY+0.86,30.1,12,0.2); B.box(0.16,0.16,0.01,0xe8c91a,4.6,PY+0.5,30.375);      // municipal bin
  function cabinet(x,z,o){const c=B.at(x,PY,z,o); c.box(0.85,0.12,0.34,0x8f9492,0,0.06,0); c.box(0.85,1.3,0.32,0xb9bdbc,0,0.77,0); c.box(0.01,1.2,0.01,0x7d8280,0,0.77,0.162);}      // grey utility cabinet
  cabinet(-8.6,19.3,R/2); cabinet(-8.6,20.3,R/2); cabinet(5.5,30.35,0);
  const glow=A.lampMat('L:street',0xeeebe0,0xffe7bd,0.95), bulb=A.lampMat('L:street',0xf3eedc,0xffd28a,1);
  [[5.7,16.1],[5.75,23.4],[-7.8,18.7]].forEach(function(q){                                                    // globe lamps on green poles
    B.cyl(0.045,3.0,green,q[0],PY+1.5,q[1],8); B.sph(0.2,glow,q[0],PY+3.15,q[1]); A.pool('L:street',0xffd9a0,q[0],PY+0.03,q[1],4.2,st,0.42);});
  (function(){                                                                                                 // a string of bulbs from the building over the tables to the sign post
    const pts=[[FX0,PY+3.5,23.4],[-5.4,PY+3.12,25.4],[-1.9,PY+3.12,26.9],[3.9,PY+2.9,26.2]], line=[];
    for(let i=0;i<pts.length-1;i++){const a=pts[i], b=pts[i+1], n=Math.round(Math.hypot(b[0]-a[0],b[2]-a[2])/0.45);
      for(let k=0;k<=n;k++){const t=k/n, p=new THREE.Vector3(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t-0.3*4*t*(1-t),a[2]+(b[2]-a[2])*t); line.push(p); if(k&&k<n) B.sph(0.035,bulb,p.x,p.y-0.04,p.z);}}
    st.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(line),new THREE.LineBasicMaterial({color:iron})));
    A.pool('L:street',0xffd9a0,-4,PY+0.03,26,5.5,st,0.4);
  })();

  /* ---------- the fenced garden with the round memorial stone ---------- */
  bed(6,12.4,24,30.3,0.35);
  [[6.1,30.2,12.3,30.2],[12.3,30.2,12.3,24.1],[12.3,24.1,6.1,24.1],[6.1,24.1,6.1,30.2]].forEach(function(q){fence(q[0],q[1],q[2],q[3],PY+0.35,0.7,green,true);});
  palm(7.1,27.6,2.6,1.25,PY+0.35); palm(9.6,28.3,3.6,1.3,PY+0.35); palm(8.3,25.4,3.0,1.2,PY+0.35); palm(11.4,29.2,2.2,1.1,PY+0.35);
  [[6.9,29.3,0.34,0x9fb04a],[9.5,29.5,0.3,leaf[1]],[10.6,28.2,0.4,0x9fb04a],[7.3,25.9,0.4,leaf[2]],[11.5,25.1,0.36,leaf[0]],[9.2,26.4,0.32,0x9fb04a]].forEach(function(q){shrub(q[0],q[1],q[2],q[3],PY+0.35);});
  (function(){const x=8.2, y=PY+0.35+0.56, z=29.25, lean=0.15;
    B.cyl(0.62,0.22,0xddd6c4,x,y,z,28,null,0,R/2-lean);
    const t=tex(256,256,function(g){
      g.fillStyle='#e9e3d2'; g.beginPath(); g.arc(128,128,128,0,7); g.fill(); const r=A.rng(3); for(let i=0;i<500;i++){g.fillStyle='rgba(120,110,90,'+(0.04+r()*0.08)+')'; g.fillRect(r()*256,r()*256,2,2);}
      g.strokeStyle='#8f8672'; g.lineWidth=2; [[92,72],[164,72]].forEach(function(q){g.beginPath(); g.arc(q[0],q[1],15,0,7); g.stroke(); g.fillStyle='#8f8672'; g.fillRect(q[0]-14,q[1]+22,28,3);});      // two emblems
      g.fillStyle='#7d7460'; g.textAlign='center'; g.font='bold 30px serif'; g.fillText('גינת שלום',128,142);
      g.fillStyle='rgba(125,116,96,0.7)'; [[150,170],[112,192],[84,212]].forEach(function(q){let u=128-q[0]/2; while(u<128+q[0]/2-6){const w=8+r()*16; g.fillRect(u,q[1],Math.min(w,128+q[0]/2-u),4); u+=w+5;}});      // the rest of the inscription, too small to read from here
    });
    const m=new THREE.Mesh(new THREE.CircleGeometry(0.6,28),A.MT(t)); m.position.set(x,y+Math.sin(lean)*0.113,z+Math.cos(lean)*0.113); m.rotation.x=-lean; st.add(m);
  })();
  (function(){const b=B.at(13.4,PY,30.3,0);                                           // old municipal notice board under a little green roof
    b.box(0.08,1.9,0.08,0x5f6466,-0.6,0.95,0); b.box(0.08,1.9,0.08,0x5f6466,0.6,0.95,0); b.box(1.3,1.1,0.06,0xd98a2b,0,1.3,0); b.box(1.5,0.06,0.34,0x2f7d4f,0,1.95,0);
    [[-0.35,1.5,0xf3ebdc],[0.1,1.35,0x9fc4d6],[0.4,1.6,0xf0d21c],[-0.2,1.0,0xfbfaf6]].forEach(function(q){b.box(0.26,0.34,0.01,q[2],q[0],q[1],0.036);});})();
  bed(14.2,22,24,30.3,0.35); for(let i=0;i<9;i++) shrub(14.9+i*0.8,25+(i%4)*1.4,0.45+rnd()*0.3,leaf[i%3],PY+0.35);

  /* ---------- parked cars ---------- */
  function car(x,z,o,col){const c=B.at(x,RY,z,o);                                      // nose along its local +x
    c.box(4.1,0.55,1.7,col,0,0.52,0); c.box(2.2,0.48,1.5,0x2c3338,-0.15,1.02,0); c.box(2.3,0.05,1.52,col,-0.15,1.28,0);
    [[-1.3,-1],[1.3,-1],[-1.3,1],[1.3,1]].forEach(function(q){c.cyl(0.31,0.2,0x1d1f20,q[0],0.31,q[1]*0.78,12,null,0,R/2);});
    c.box(0.04,0.14,1.3,0xe6e6de,2.05,0.6,0); c.box(0.04,0.14,1.3,0xb43a34,-2.05,0.62,0);}
  car(-10.6,SZ+1.05,0,0xe9e9e6); car(8.4,SZ+1.05,R,0xb9bcbe); car(13.5,SZ+1.05,R,0xb5372f); car(7,SZ+RW-1.05,0,0x3a4a5a);

  /* ---------- the buildings round the square ---------- */
  const gf=tex(128,128,function(g){g.fillStyle='#d8d0bd'; g.fillRect(0,0,128,128); g.fillStyle='#3d4a50'; g.fillRect(10,30,60,74); g.fillStyle='#5a4634'; g.fillRect(86,34,28,94); g.fillStyle='#c9c1ad'; g.fillRect(0,0,128,12);},true);
  function house(x0,x1,z0,z1,faces,hide){              // a neighbouring block: a plain volume, windows on the sides that are seen, water heaters on the roof
    const g=G(st), b=batch(g), sx=x1-x0, sz=z1-z0;
    b.box(sx,TOP-GY,sz,0xddd5c3,(x0+x1)/2,(GY+TOP)/2,(z0+z1)/2);
    faces.forEach(function(f){
      const len=f[1]==='z'?sx:sz, x=f==='+x'?x1+0.02:f==='-x'?x0-0.02:(x0+x1)/2, z=f==='+z'?z1+0.02:f==='-z'?z0-0.02:(z0+z1)/2, ry=f==='+x'?R/2:f==='-x'?-R/2:f==='-z'?R:0;
      const t=bt.clone(), t2=gf.clone(); t.needsUpdate=t2.needsUpdate=true; t.repeat.set(Math.round(len/3.4),3); t2.repeat.set(Math.round(len/4),1);
      panel(len,TOP-PY-3.2,A.MT(t),x,(TOP+PY+3.2)/2,z,ry,g); panel(len,3.2,A.MT(t2),x,PY+1.6,z,ry,g);});
    for(let i=0;i<Math.floor(sx/6);i++){const x=x0+3+i*6; b.cyl(0.3,1.2,0xf6f6f2,x,TOP+0.9,(z0+z1)/2,12,null,0,R/2); b.box(1.0,0.06,1.6,0x2b3d55,x,TOP+0.5,(z0+z1)/2+1.4,0,0.5);}
    far.push({g:g,hide:hide}); return {g:g,b:b};
  }
  const n12=house(-21,FX0,HZ,28.5,['+x','+z'],function(c){return c.x<FX0+1.5;});          // number 12 and the wing behind it close the left side of the square
  (function(){const b=n12.b, g=n12.g;
    const aw=tex(16,8,function(c){c.fillStyle='#f4f2ea'; c.fillRect(0,0,16,8); c.fillStyle='#2c5a43'; c.fillRect(0,0,8,8);},true); aw.repeat.set(14,1);
    b.geo(new THREE.BoxGeometry(6.8,0.03,2.0),A.MT(aw,null,true),-13.1,PY+2.85,29.45,0,0.35); b.box(6.8,0.2,0.02,0xf4f2ea,-13.1,PY+2.42,30.4);      // striped awning over the café front
    b.box(0.55,3.2,0.55,0xd8ccb2,-9.3,PY+1.6,28.78);                                       // brick-clad corner column with the house number
    sign(plate('12'),0.3,0.3,-9.3,PY+2.5,29.06,0,false,g); sign(plate('12'),0.3,0.3,-9.02,PY+2.5,28.78,R/2,false,g);
    const fl=tex(128,96,function(c){c.fillStyle='#fff'; c.fillRect(0,0,128,96); c.fillStyle='#2a4fb0'; c.fillRect(0,10,128,12); c.fillRect(0,74,128,12);
      c.strokeStyle='#2a4fb0'; c.lineWidth=4; [1,-1].forEach(function(s){c.beginPath(); c.moveTo(64,48-s*20); c.lineTo(64+17,48+s*10); c.lineTo(64-17,48+s*10); c.closePath(); c.stroke();});});
    const fm=A.MT(fl); fm.side=THREE.DoubleSide;
    [[-9.3,29.05],[-10.9,28.5]].forEach(function(q){                                       // two flags on poles off the front
      b.cyl(0.015,1.9,0xd9d9d2,q[0],PY+3.3+0.59,q[1]+0.74,6,null,0,0.9);
      const m=panel(1.0,0.72,fm,q[0],PY+3.72,q[1]+1.0,R/2,g); m.rotation.set(-0.55,R/2,0);});
    [[20.5,4.3],[24.6,4.3],[22.4,7.6],[26.3,10.8]].forEach(function(q){b.box(0.3,0.5,0.8,0xe6e8e6,FX0+0.16,PY+q[1],q[0]);});      // air conditioners on the flank
  })();
  house(-24,-8.2,41.5,52,['-z','+x'],function(c){return c.z>40;}).b.done(); house(-2.6,22,41.5,52,['-z','-x'],function(c){return c.z>40;}).b.done();      // across the street
  n12.b.done();

  /* ---------- our own street front ----------
     Drawn only for someone standing outside at street level: from higher up you look straight into the lobby, as on every other side. */
  const gt=tex(2048,256,function(g){
    const X=function(x){return (x-FX0)/FW*2048;}, Y=function(y){return 256-y/H*256;};
    const rc=function(x0,x1,y0,y1,c){g.fillStyle=c; g.fillRect(X(x0),Y(y1),X(x1)-X(x0),Y(y0)-Y(y1));};
    rc(FX0,FX1,0,H,'#ebe6d8'); rc(FX0,FX1,0,0.45,'#d9d2c0'); rc(FX0,FX1,H-0.22,H,'#d6cfbd');                // plaster, a plinth, the edge of the floor above
    const win=function(x,w){rc(x-0.07,x+w+0.07,0.93,2.32,'#cfc8b6'); rc(x,x+w,1.0,2.25,'#f6f5f0'); for(let y=1.04;y<2.24;y+=0.075) rc(x,x+w,y,y+0.014,'#c6c9c4'); rc(x+w/2-0.02,x+w/2+0.02,1.0,2.25,'#e6e6e0');};      // window behind closed white shutters
    const screen=function(x,w){rc(x,x+w,0.75,2.5,'#7f8b8d'); for(let u=x;u<x+w+0.01;u+=0.14) rc(u-0.012,u+0.012,0.75,2.5,'#e3dfd2'); for(let y=0.75;y<2.51;y+=0.14) rc(x,x+w,y-0.012,y+0.012,'#e3dfd2');};      // lattice that hides the washing
    win(-8.5,1.6); screen(-6.3,1.5); win(-4.3,1.8); rc(-2.35,-1.75,1.6,2.2,'#6f7d84'); win(0.75,1.5); screen(5.0,1.5); win(7.1,1.8); win(9.5,1.6); screen(11.6,1.4); win(13.3,1.2);
    BR.forEach(function(bx){rc(bx-0.9,bx+0.9,0,H,'#f3f1ea');});                                              // smooth render round each doorway
  }), gtM=A.MT(gt);
  function front(x0,x1,y0,y1){                         // one piece of the ground-floor front, cut from that one long drawing
    const g=new THREE.BufferGeometry(), u0=(x0-FX0)/FW, u1=(x1-FX0)/FW, z=HZ+0.03;
    g.setAttribute('position',new THREE.Float32BufferAttribute([x0,y0,z, x1,y0,z, x1,y1,z, x0,y1,z],3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute([u0,y0/H, u1,y0/H, u1,y1/H, u0,y1/H],2)); g.setIndex([0,1,2,0,2,3]);
    fac.add(new THREE.Mesh(g,gtM));
  }
  let fx=FX0; BR.forEach(function(bx){front(fx,bx-BRW/2,0,H); front(bx-BRW/2,bx+BRW/2,2.5,H); fx=bx+BRW/2;}); front(fx,FX1,0,H);
  const ft=tex(256,256,function(g){                    // the floors above: closed-in balconies behind white slatted shutters
    g.fillStyle='#ece8dc'; g.fillRect(0,0,256,256); g.fillStyle='#d6cfbd'; g.fillRect(0,236,256,20);
    g.fillStyle='#55626a'; g.fillRect(20,56,150,128); g.fillStyle='#f6f5f0'; g.fillRect(20,56,104,128); g.fillStyle='#cdd0cb'; for(let y=60;y<184;y+=7) g.fillRect(20,y,104,2);
    g.strokeStyle='#fbfaf6'; g.lineWidth=4; g.strokeRect(20,56,150,128); g.fillStyle='#fbfaf6'; g.fillRect(122,56,4,128); g.fillStyle='#d9d3c2'; g.fillRect(12,184,166,10);
    g.fillStyle='#6f7d84'; g.fillRect(198,84,40,62); g.strokeStyle='#fbfaf6'; g.lineWidth=3; g.strokeRect(198,84,40,62);
    g.fillStyle='#e6e8e6'; g.fillRect(194,168,48,30); g.fillStyle='#b9bdbb'; g.fillRect(200,174,36,18);
  },true); ft.repeat.set(FW/3.2,3);
  panel(FW,TOP-H,A.MT(ft),(FX0+FX1)/2,(H+TOP)/2,HZ+0.03,0,fac);
  F.box(-6.5-FX0,-GY,0.02,0xe9e3d3,(FX0-6.5)/2,GY/2,HZ-0.004); F.box(FX1-5.95,-GY,0.02,0xe9e3d3,(FX1+5.95)/2,GY/2,HZ-0.004);      // the floor below, either side of the part that is modelled
  const sw=tex(64,128,function(g){g.fillStyle='#fbfaf6'; g.fillRect(0,0,64,128); g.fillStyle='#5b6b73'; for(let i=0;i<3;i++) for(let j=0;j<2;j++) g.fillRect(4+i*20,4+j*62,16,56);},true); sw.repeat.set(1,5);
  const swM=A.MT(sw), p10=plate('10'), lantern=A.lampMat('L:street',0xdfe6dc,0xffe7bd,1);
  BR.forEach(function(bx){
    [-1,1].forEach(function(s){F.box(0.2,2.72,0.12,0xf6f4ee,bx+s*0.75,1.36,HZ+0.09); F.box(0.06,2.5,0.08,0x6b4f35,bx+s*0.62,1.25,HZ+0.05);});      // pilasters, and a bronze frame with no door in it
    F.box(1.3,0.06,0.08,0x6b4f35,bx,2.12,HZ+0.05); F.box(1.18,0.32,0.02,0x39464a,bx,2.31,HZ+0.05);
    F.box(2.0,0.12,1.05,0xd9d4c6,bx,2.78,HZ+0.52);                                          // concrete canopy
    F.box(0.12,0.2,0.1,lantern,bx-0.75,2.05,HZ+0.2);
    panel(1.5,TOP-0.8-3.0,swM,bx,(3.0+TOP-0.8)/2,HZ+0.05,0,fac);                            // glazing up the front above each entrance
    panel(0.28,0.28,A.MT(p10),bx+1.05,1.8,HZ+0.045,0,fac);
  });

  B.done(); C.done(); F.done();
  A.streetView=[new THREE.Vector3(0.6,1.05,SZ+RW-0.6),new THREE.Vector3(1.5,0.1,PZ)];      // standing across Haroe St, looking at the two entrances
  let crowns=true;
  A.frameFns.push(function(){
    const c=A.camera.position, low=c.y<4.6;
    fac.visible=low&&c.z>HZ+0.4&&!(A.simsOn&&!A.eyeView());
    const solid=low||c.z<HZ;                           // the tree crowns thin to a ghost when the camera is above the square, so they never hide it
    if(solid!==crowns){crowns=solid; can.children.forEach(function(m){m.material.transparent=!solid; m.material.opacity=solid?1:0.22; m.material.depthWrite=solid;});}
    far.forEach(function(b){b.g.visible=!b.hide(c);});
    const eve=A.goal('day')<0.5?0.6:0; if(A.goal('L:street')!==eve) A.set('L:street',eve);      // street lamps and the café's bulbs come on in the evening
  });
});
})();
