/* Haroe 10 — detail: finely built things for the world round the flat. Motorbikes, scooters and bicycles, cars, air
   conditioners on their brackets, trees with real leaves, street signs, railings and whole building fronts.
   Every builder makes a plain group of meshes in its own frame, each mesh carrying its colour (or material) in userData.key.
   A.batch(parent).bake(group,x,y,z,ry) merges such a group into one mesh per colour, for the still world; A.det.realize(group,room)
   turns it into ordinary lit meshes, for things that move. */
(function(){
'use strict';
const A=window.APP, R=Math.PI, DUMMY=new THREE.MeshBasicMaterial();
const det=A.det={};
const screenM=det.screenM=new THREE.MeshLambertMaterial({color:0x7d8e98,transparent:true,opacity:0.42,depthWrite:false});

/* ================= building blocks ================= */
function mk(geo,key,x,y,z,p){const m=new THREE.Mesh(geo,DUMMY); m.userData.key=key; m.position.set(x||0,y||0,z||0); if(p) p.add(m); return m;}
function rgeo(w,h,d,r,cr){                 // a box with rounded edges, its corners rounded as seen from above by cr
  r=Math.max(0.002,Math.min(r||0.03,w/2-0.002,h/2-0.002,d/2-0.002));
  const a=w/2-r, b=d/2-r, c=Math.max(0.001,Math.min(a,b,cr==null?0.05:cr)*0.9), s=new THREE.Shape();
  s.moveTo(-a+c,-b); s.lineTo(a-c,-b); s.absarc(a-c,-b+c,c,-R/2,0,false); s.lineTo(a,b-c); s.absarc(a-c,b-c,c,0,R/2,false);
  s.lineTo(-a+c,b); s.absarc(-a+c,b-c,c,R/2,R,false); s.lineTo(-a,-b+c); s.absarc(-a+c,-b+c,c,R,R*1.5,false);
  const g=new THREE.ExtrudeGeometry(s,{depth:Math.max(0.001,h-2*r),bevelEnabled:true,bevelThickness:r,bevelSize:r,bevelSegments:2,curveSegments:3});
  g.rotateX(-R/2); g.translate(0,-(h/2-r),0); g.computeVertexNormals(); return g;
}
const P=det.P={
  box:function(w,h,d,k,x,y,z,p){return mk(new THREE.BoxGeometry(w,h,d),k,x,y,z,p);},
  cyl:function(r,h,k,x,y,z,p,seg,rt){return mk(new THREE.CylinderGeometry(rt==null?r:rt,r,h,seg||12),k,x,y,z,p);},
  sph:function(r,k,x,y,z,p,sx,sy,sz,ws,hs){const m=mk(new THREE.SphereGeometry(r,ws||14,hs||10),k,x,y,z,p); if(sx) m.scale.set(sx,sy,sz); return m;},
  tor:function(rr,t,k,x,y,z,p,arc,rs,ts){return mk(new THREE.TorusGeometry(rr,t,rs||8,ts||24,arc||R*2),k,x,y,z,p);},
  rbox:function(w,h,d,k,x,y,z,p,r,cr){return mk(rgeo(w,h,d,r,cr),k,x,y,z,p);},
  geo:function(g,k,x,y,z,p){return mk(g,k,x,y,z,p);},
  grp:function(x,y,z,p,ry){const g=new THREE.Group(); g.position.set(x||0,y||0,z||0); if(ry) g.rotation.y=ry; if(p) p.add(g); return g;},
  bar:function(a,b,r,k,p,seg,rb){            // a round bar from point a to point b
    const va=new THREE.Vector3(a[0],a[1],a[2]), vb=new THREE.Vector3(b[0],b[1],b[2]), d=vb.clone().sub(va), len=d.length();
    const m=mk(new THREE.CylinderGeometry(r,rb==null?r:rb,len,seg||8),k,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,p);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize()); return m;},
  slab:function(a,b,w,t,k,p){                // a flat strip from a to b, w wide (sideways, level) and t thick
    const va=new THREE.Vector3(a[0],a[1],a[2]), vb=new THREE.Vector3(b[0],b[1],b[2]), d=vb.clone().sub(va), len=d.length();
    const m=mk(new THREE.BoxGeometry(w,t,len),k,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,p);
    m.rotation.order='YXZ'; m.rotation.y=Math.atan2(d.x,d.z); m.rotation.x=-Math.asin(d.y/len); return m;},
  tube:function(pts,r,k,p,seg,rs){return mk(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(function(q){return new THREE.Vector3(q[0],q[1],q[2]);})),seg||20,r,rs||6,false),k,0,0,0,p);},
  plane:function(w,h,k,x,y,z,p,ry){const m=mk(new THREE.PlaneGeometry(w,h),k,x,y,z,p); if(ry) m.rotation.y=ry; return m;},
  disc:function(r,k,x,y,z,p,ry,seg){const m=mk(new THREE.CircleGeometry(r,seg||20),k,x,y,z,p); if(ry) m.rotation.y=ry; return m;}
};
det.rgeo=rgeo;
const tex=det.tex=function(w,h,draw,wrap){const t=A.canvasTex(w,h,draw); if(wrap) t.wrapS=t.wrapT=THREE.RepeatWrapping; return t;};
const mat=det.mat=function(t,o){o=o||{}; const m=new THREE.MeshLambertMaterial(Object.assign({map:t},o)); return m;};      // registered when baked or realized

/* ================= merging: one mesh per colour ================= */
A.batch=function(parent,lift,opt){             // lift: a little light of their own, for parts on a front that never faces the sun
  const by=new Map(), m4=new THREE.Matrix4(), nm=new THREE.Matrix3(), q=new THREE.Quaternion(), e=new THREE.Euler(), v=new THREE.Vector3(), one=new THREE.Vector3(1,1,1);
  function addM(geo,c,M4){
    if(opt&&opt.map) c=opt.map(c);
    let b=by.get(c); if(!b) by.set(c,b={p:[],n:[],u:[],c:[],i:[]});
    if(!geo.attributes.normal) geo.computeVertexNormals();
    const Pp=geo.attributes.position, N=geo.attributes.normal, U=geo.attributes.uv, CO=geo.attributes.color, I=geo.index, base=b.p.length/3;
    nm.getNormalMatrix(M4); const flip=M4.determinant()<0;
    for(let k=0;k<Pp.count;k++){
      v.fromBufferAttribute(Pp,k).applyMatrix4(M4); b.p.push(v.x,v.y,v.z);
      v.fromBufferAttribute(N,k).applyMatrix3(nm).normalize(); b.n.push(v.x,v.y,v.z);
      b.u.push(U?U.getX(k):0,U?U.getY(k):0); if(CO) b.c.push(CO.getX(k),CO.getY(k),CO.getZ(k)); else b.c.push(1,1,1);
    }
    if(I){for(let k=0;k<I.count;k+=3){const a=I.getX(k), c2=I.getX(k+1), d=I.getX(k+2); if(flip) b.i.push(base+a,base+d,base+c2); else b.i.push(base+a,base+c2,base+d);}}
    else for(let k=0;k<Pp.count;k+=3){if(flip) b.i.push(base+k,base+k+2,base+k+1); else b.i.push(base+k,base+k+1,base+k+2);}
  }
  function add(geo,c,x,y,z,ry,rx,rz){              // c: a colour or a material. Turned by ry, after tilting by rx
    m4.compose(v.set(x,y,z+api.oz),q.setFromEuler(e.set(rx||0,ry||0,rz||0,'YXZ')),one); addM(geo,c,m4.clone());
  }
  const holder=new THREE.Group();
  const api={
    oz:0,                                      // added to every z: a stretch of the street drawn where it was first measured, moved out as a whole
    geo:add,
    box:function(w,h,d,c,x,y,z,ry,rx){add(new THREE.BoxGeometry(w,h,d),c,x,y,z,ry,rx);},
    cyl:function(r,h,c,x,y,z,seg,rTop,ry,rx){add(new THREE.CylinderGeometry(rTop==null?r:rTop,r,h,seg||10),c,x,y,z,ry,rx);},
    sph:function(r,c,x,y,z,sx,sy,sz){const g=new THREE.SphereGeometry(r,10,7); if(sx) g.scale(sx,sy,sz); add(g,c,x,y,z);},
    at:function(ox,oy,oz,o){                    // the same, in the frame of a piece that stands at ox,oz and is turned by o
      o=o||0; const cs=Math.cos(o), sn=Math.sin(o), X=function(x,z){return ox+x*cs+z*sn;}, Z=function(x,z){return oz-x*sn+z*cs;};
      return {box:function(w,h,d,c,x,y,z,ry,rx){api.box(w,h,d,c,X(x,z),oy+y,Z(x,z),o+(ry||0),rx);},
              cyl:function(r,h,c,x,y,z,seg,rTop,ry,rx){api.cyl(r,h,c,X(x,z),oy+y,Z(x,z),seg,rTop,o+(ry||0),rx);},
              sph:function(r,c,x,y,z,sx,sy,sz){api.sph(r,c,X(x,z),oy+y,Z(x,z),sx,sy,sz);},
              geo:function(g,c,x,y,z,ry,rx){api.geo(g,c,X(x,z),oy+y,Z(x,z),o+(ry||0),rx);}};
    },
    bake:function(g,x,y,z,ry,s){               // merge a whole group built with A.det, standing at x,y,z turned by ry
      const w=new THREE.Group(); w.position.set(x||0,y||0,(z||0)+api.oz); w.rotation.y=ry||0; if(s) w.scale.setScalar(s); holder.add(w); w.add(g);
      w.updateMatrixWorld(true); g.traverse(function(o){if(o.isMesh&&o.userData.key!=null) addM(o.geometry,o.userData.key,o.matrixWorld.clone());});
      holder.remove(w); return api;
    },
    done:function(room){by.forEach(function(b,c){
      const g=new THREE.BufferGeometry();
      g.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(b.n,3));
      g.setAttribute('uv',new THREE.Float32BufferAttribute(b.u,2)); if(c.isMaterial&&c.vertexColors) g.setAttribute('color',new THREE.Float32BufferAttribute(b.c,3)); g.setIndex(b.i);
      let m2; if(c.isMaterial){m2=c; if(!c.userData.regd){A.reg(c,room); c.userData.regd=true;}} else m2=A.reg(new THREE.MeshLambertMaterial({color:c,emissive:lift||0}),room);
      const m=new THREE.Mesh(g,m2); m.receiveShadow=true; m.castShadow=!!api.shadows; parent.add(m);}); by.clear();}
  };
  return api;
};
/* things that move are kept as their own meshes, with one material per colour */
/* a moving thing made of many parts, merged into one mesh per colour but still its own group; parts marked userData.keep stay apart, to be turned */
det.solid=function(g,room){
  const out=new THREE.Group(), kept=[];
  g.updateMatrixWorld(true);
  g.traverse(function(o){if(o!==g&&o.userData.wheel!=null) kept.push(o);});
  kept.forEach(function(o){const w=new THREE.Group(); w.rotation.order='YXZ'; w.position.copy(o.position); w.quaternion.copy(o.quaternion); w.userData.wheel=o.userData.wheel;
    let p=o.parent, M=new THREE.Matrix4(); while(p&&p!==g){M.premultiply(new THREE.Matrix4().compose(p.position,p.quaternion,p.scale)); p=p.parent;}      // carried by any group between it and the whole
    w.applyMatrix4(M); o.parent.remove(o); o.position.set(0,0,0); o.rotation.set(0,0,0); o.quaternion.identity();
    const wb=A.batch(w); wb.bake(o,0,0,0,0); wb.done(room); out.add(w);});
  const b=A.batch(out); b.bake(g,0,0,0,0); b.done(room);
  out.traverse(function(m){if(m.isMesh){m.castShadow=false; m.receiveShadow=false;}});
  out.userData.wheels=out.children.filter(function(c){return c.userData.wheel!=null;});
  return out;
};
det.realize=function(g,room){
  const cache={};
  g.traverse(function(o){if(!o.isMesh||o.userData.key==null) return; const k=o.userData.key;
    if(k.isMaterial){if(!k.userData.regd){A.reg(k,room); k.userData.regd=true;} o.material=k;}
    else o.material=cache[k]||(cache[k]=A.reg(new THREE.MeshLambertMaterial({color:k}),room));
    o.castShadow=true; o.receiveShadow=true;});
  return g;
};

/* ================= textures shared by many things ================= */
const plateT=det.plateT=function(txt){return tex(128,32,function(g){g.fillStyle='#f2c81e'; g.fillRect(0,0,128,32); g.strokeStyle='#1d1d1d'; g.lineWidth=2; g.strokeRect(2,2,124,28);   // a yellow Israeli number plate
  g.fillStyle='#2a4fb0'; g.fillRect(3,3,14,26); g.fillStyle='#fff'; g.font='bold 7px sans-serif'; g.fillText('IL',4,26);
  g.fillStyle='#111'; g.font='bold 21px sans-serif'; g.textAlign='center'; g.fillText(txt,72,24);});};
const plates={}; function plateM(txt){return plates[txt]||(plates[txt]=mat(plateT(txt)));}
det.plateM=plateM;

/* ================= wheels ================= */
function wheel(p,r,w,o){                    // axis along x. o: rim colour, style (wire, cast, car, bicycle), tyre colour, knobbly
  o=o||{}; const g=P.grp(0,0,0,p), tc=o.tyre||0x161718, rc=o.rim||0x9aa0a4;
  const t=P.tor(r-w*0.45,w*0.47,tc,0,0,0,g,null,8,o.style==='bicycle'?28:22); t.rotation.y=R/2; t.scale.set(1,1,o.style==='bicycle'?1:1.25);
  if(o.knobs) for(let i=0;i<30;i++){const a=i*R*2/30; P.box(w*0.9,0.025,0.03,tc,0,Math.sin(a)*(r-0.005),Math.cos(a)*(r-0.005),g).rotation.x=-a;}
  const rr=r-w*0.95;
  if(o.style==='bicycle'||o.style==='wire'){
    const rim=P.tor(rr,o.style==='bicycle'?0.012:0.016,rc,0,0,0,g,null,6,28); rim.rotation.y=R/2;
    P.cyl(o.style==='bicycle'?0.025:0.045,0.1,0x8d9296,0,0,0,g,10).rotation.z=R/2;
    const n=o.style==='bicycle'?28:32; for(let i=0;i<n;i++){const a=i*R*2/n, s=(i%2?1:-1)*0.03; P.bar([s,0,0],[0,Math.sin(a+0.12)*rr,Math.cos(a+0.12)*rr],0.0025,0xb9bdc0,g,3);}
  }else{
    P.cyl(rr,w*0.62,rc,0,0,0,g,24).rotation.z=R/2;                                  // the rim's face
    P.cyl(rr*0.3,w*0.7,0x6a6f72,0,0,0,g,12).rotation.z=R/2;
    const ns=o.style==='car'?5:o.style==='cast'?5:6, dk=o.style==='car'?0x2c2f31:0x1d1f21;
    [-1,1].forEach(function(sd){for(let i=0;i<ns;i++){const a=i*R*2/ns; P.slab([sd*w*0.32,Math.sin(a)*rr*0.32,Math.cos(a)*rr*0.32],[sd*w*0.32,Math.sin(a)*rr*0.92,Math.cos(a)*rr*0.92],0.04,0.012,dk,g);
      const a2=a+R/ns; P.box(0.012,rr*0.5,0.05,rc,sd*w*0.33,Math.sin(a2)*rr*0.6,Math.cos(a2)*rr*0.6,g).rotation.x=-a2;}});
  }
  return g;
}
det.wheel=wheel;

/* ================= motorbikes and scooters ================= */
/* nose along +z, wheels on the ground at y=0. kind: sport, scooter, dirt, covered. o: colour, accent, plate text, lean (on its side stand) */
det.moto=function(kind,o){
  o=o||{}; const g=P.grp(), c=o.color||0x2346b8, acc=o.accent||0xf2f2ee, blk=0x161718, dk=0x2a2c2e, al=0xa9aeb2, chr=0xd4d8db, lean=o.lean==null?-0.1:o.lean;
  const b=P.grp(0,0,0,g); b.rotation.z=lean;
  function bars(y,z,w,grip){P.bar([-w,y,z],[w,y,z],0.012,blk,b); [-1,1].forEach(function(s){P.cyl(0.018,0.11,grip||0x111213,s*(w+0.04),y,z,b,8).rotation.z=R/2; P.bar([s*w*0.8,y+0.01,z+0.02],[s*(w+0.07),y-0.01,z+0.07],0.005,al,b);});}
  function mirror(s,y,z,h){P.bar([s*0.18,y,z],[s*0.26,y+h,z+0.03],0.006,blk,b); P.sph(0.05,blk,s*0.27,y+h+0.02,z+0.03,b,1.1,0.7,0.4);}
  function plate(z,y,tilt){const pl=P.plane(0.18,0.13,plateM(o.plate||'58-311'),0,y,z,b,R); pl.rotation.x=tilt||0; P.box(0.19,0.14,0.01,0x222324,0,y,z+0.006,b).rotation.x=tilt||0;}
  if(kind==='sport'){
    const fz=0.7, rz=-0.69, r=0.305;
    const fw=wheel(b,r,0.12,{style:'cast',rim:0x1d1f21}); fw.position.set(0,r,fz); const rw=wheel(b,r,0.18,{style:'cast',rim:0x1d1f21}); rw.position.set(0,r,rz); fw.userData.wheel=rw.userData.wheel=r;
    [-0.075,0.075].forEach(function(x){P.cyl(0.15,0.008,0xc4c8cc,x,r,fz,b,24).rotation.z=R/2; P.box(0.03,0.07,0.09,0xd4a017,x*1.25,r+0.1,fz-0.08,b);});   // twin discs, gold calipers
    P.cyl(0.11,0.008,0xc4c8cc,0.1,r,rz,b,20).rotation.z=R/2;
    [-0.1,0.1].forEach(function(x){P.bar([x,r,fz],[x,0.93,fz-0.24],0.026,0xc9a227,b); P.bar([x,r,fz],[x,0.62,fz-0.12],0.034,blk,b);});    // upside-down fork, gold tubes
    P.tor(r+0.04,0.035,blk,0,r,fz,b,R*0.55).rotation.set(0,R/2,R*0.62);                                      // front mudguard
    P.box(0.26,0.04,0.12,blk,0,0.93,fz-0.24,b); bars(0.9,fz-0.25,0.2);
    [-1,1].forEach(function(s){P.slab([s*0.09,0.4,-0.05],[s*0.09,r,rz],0.05,0.08,0x2b2d2f,b);});                // swingarm
    P.rbox(0.36,0.42,0.48,0x2b2d2f,0,0.5,0.12,b,0.05);                                                        // engine
    P.sph(0.3,c,0,0.8,0.5,b,0.95,0.95,1.25); P.sph(0.26,c,0,0.95,0.18,b,1.0,0.72,1.3);                          // front fairing, tank
    P.rbox(0.42,0.36,0.62,c,0,0.62,0.22,b,0.1); P.rbox(0.44,0.08,0.4,acc,0,0.55,0.2,b,0.03);                  // side panels with a white stripe
    P.rbox(0.3,0.26,0.02,screenM,0,1.12,0.6,b,0.01).rotation.x=-0.7;                                         // smoked screen
    [-0.07,0.07].forEach(function(x){P.sph(0.045,0xe8eef0,x,0.86,0.86,b,1.3,0.55,0.4);});                   // headlights
    P.rbox(0.26,0.07,0.42,blk,0,0.97,-0.22,b,0.03); P.rbox(0.22,0.14,0.36,c,0,1.0,-0.55,b,0.05,0.08);           // seat, tail
    P.box(0.12,0.03,0.04,0xc8202a,0,1.03,-0.74,b); plate(-0.8,0.78,0.3); P.bar([0,0.95,-0.68],[0,0.82,-0.8],0.01,blk,b);
    P.bar([-0.12,0.42,-0.15],[-0.15,0.5,-0.55],0.05,0x3b3e41,b); P.cyl(0.07,0.32,0x2b2d2f,-0.17,0.52,-0.62,b,14).rotation.x=R/2-0.3;   // exhaust
    P.bar([0.05,0.24,-0.05],[0.1,0.3,-0.69],0.01,0x3a2a1c,b);                                                 // chain
    [-1,1].forEach(function(s){P.cyl(0.012,0.12,blk,s*0.2,0.38,-0.12,b,6).rotation.z=R/2; mirror(s,0.98,0.48,0.08);});
  }else if(kind==='scooter'){
    const fz=0.78, rz=-0.78, r=0.27, dkc=o.color||0x2b2e31;
    const fw=wheel(b,r,0.12,{style:'cast',rim:0x3a3c3e}); fw.position.set(0,r,fz); const rw=wheel(b,r,0.15,{style:'cast',rim:0x3a3c3e}); rw.position.set(0,r,rz); fw.userData.wheel=rw.userData.wheel=r;
    P.cyl(0.13,0.008,0xc4c8cc,-0.07,r,fz,b,20).rotation.z=R/2;
    [-0.08,0.08].forEach(function(x){P.bar([x,r,fz],[x,0.78,fz-0.2],0.03,blk,b);});
    P.tor(r+0.03,0.04,dkc,0,r,fz,b,R*0.5).rotation.set(0,R/2,R*0.6);
    P.rbox(0.56,0.72,0.26,dkc,0,0.72,0.62,b,0.09,0.12).rotation.x=-0.32;                                        // the front shield
    P.rbox(0.5,0.12,0.2,0x2a3036,0,1.04,0.76,b,0.04).rotation.x=-0.5; [-0.12,0.12].forEach(function(x){P.box(0.16,0.02,0.02,0xeef4f6,x,1.03,0.86,b).rotation.x=-0.5;});   // headlight band
    P.rbox(0.42,0.46,0.02,screenM,0,1.36,0.62,b,0.01).rotation.x=-0.45;                                       // tall tinted screen
    bars(1.14,0.45,0.27); [-1,1].forEach(function(s){mirror(s,1.18,0.48,0.14);});
    P.rbox(0.36,0.06,0.5,0x1d1f21,0,0.36,0.25,b,0.02); P.rbox(0.18,0.2,0.46,dkc,0,0.48,0.25,b,0.05);           // floorboard, tunnel
    P.rbox(0.5,0.48,0.95,dkc,0,0.66,-0.48,b,0.12,0.15);                                                       // the body over the engine and the storage
    P.rbox(0.4,0.1,0.42,0x141516,0,0.95,-0.22,b,0.04); P.rbox(0.36,0.12,0.38,0x141516,0,1.0,-0.62,b,0.04); P.rbox(0.3,0.16,0.06,0x141516,0,1.1,-0.4,b,0.03);   // stepped seat, backrest
    [-1,1].forEach(function(s){P.bar([s*0.2,1.02,-0.55],[s*0.2,1.02,-0.88],0.014,al,b);});                   // grab rails
    P.rbox(0.3,0.12,0.12,dkc,0,0.85,-0.98,b,0.04); P.box(0.22,0.04,0.02,0xc8202a,0,0.86,-1.04,b); plate(-1.0,0.62,0.2);
    P.rbox(0.12,0.24,0.62,0x9aa0a4,0.18,0.36,-0.52,b,0.04);                                                    // the drive case
    P.cyl(0.055,0.42,0x5a5d60,-0.2,0.34,-0.62,b,12).rotation.x=R/2; P.cyl(0.04,0.02,chr,-0.2,0.34,-0.84,b,12).rotation.x=R/2;   // silencer
  }else if(kind==='dirt'){
    const fz=0.74, rz=-0.74, rf=0.36, rb=0.34;
    const fw=wheel(b,rf,0.09,{style:'wire',rim:0x1d1f21,knobs:true}); fw.position.set(0,rf,fz); const rw=wheel(b,rb,0.12,{style:'wire',rim:0x1d1f21,knobs:true}); rw.position.set(0,rb,rz);
    P.cyl(0.12,0.006,0xc4c8cc,0.06,rf,fz,b,18).rotation.z=R/2;
    [-0.09,0.09].forEach(function(x){P.bar([x,rf,fz],[x,0.65,fz-0.13],0.028,0x1d1f21,b); P.bar([x,0.65,fz-0.13],[x,1.05,fz-0.31],0.024,0xc9a227,b);});   // long-travel fork
    P.slab([0,0.82,fz+0.18],[0,0.76,fz-0.18],0.16,0.012,0xeeeeea,b);                                          // high front mudguard
    P.box(0.24,0.03,0.08,blk,0,1.06,fz-0.32,b); bars(1.11,fz-0.34,0.36,0x2f2f30); [-1,1].forEach(function(s){P.rbox(0.1,0.06,0.12,0x2b2d2f,s*0.36,1.12,fz-0.28,b,0.02);});   // wide bar, hand guards
    P.rbox(0.24,0.2,0.05,0xeeeeea,0,0.96,fz-0.2,b,0.02).rotation.x=-0.35;                                    // number board
    P.bar([0,1.0,0.42],[0,0.42,0.1],0.024,0x6b7074,b); P.bar([0,1.0,0.42],[0,0.95,-0.3],0.02,0x6b7074,b);    // frame
    P.rbox(0.26,0.34,0.32,0x2b2d2f,0,0.48,0.15,b,0.04); for(let i=0;i<4;i++) P.box(0.3,0.012,0.22,0x55595c,0,0.6+i*0.035,0.2,b);   // single cylinder with fins
    P.rbox(0.24,0.16,0.36,o.color||0x1d1f21,0,0.96,0.25,b,0.05); [-1,1].forEach(function(s){P.rbox(0.02,0.22,0.3,0xd8d8d2,s*0.13,0.82,0.18,b,0.01).rotation.x=0.2;});   // tank and shrouds
    P.rbox(0.2,0.07,0.78,blk,0,1.0,-0.18,b,0.03); P.rbox(0.22,0.2,0.3,0xd8d8d2,0,0.82,-0.38,b,0.03);            // long flat seat, side panel
    P.slab([0,0.98,-0.45],[0,0.86,-1.04],0.16,0.012,0xeeeeea,b); plate(-1.0,0.74,0.25); P.box(0.06,0.03,0.03,0xc8202a,0,0.88,-0.99,b);
    [-1,1].forEach(function(s){P.slab([s*0.08,0.45,0.0],[s*0.08,rb,rz],0.04,0.07,0x6b7074,b);});
    P.tube([[-0.13,0.6,0.3],[-0.18,0.45,0.12],[-0.16,0.6,-0.2],[-0.14,0.82,-0.55]],0.025,0x6a6d70,b); P.cyl(0.055,0.34,0x3b3e41,-0.14,0.85,-0.62,b,12).rotation.x=R/2-0.25;
    P.bar([0.05,0.25,0.0],[0.1,0.3,-0.74],0.008,0x3a2a1c,b);
  }else{                                                                                                       // covered: a bike under a dusty black cover
    const fz=0.72, rz=-0.72, r=0.28;
    const fw=wheel(b,r,0.13,{style:'cast',rim:0x3a3c3e}); fw.position.set(0,r,fz); const rw=wheel(b,r,0.15,{style:'cast',rim:0x3a3c3e}); rw.position.set(0,r,rz);
    const cov=0x1e1f21, cov2=0x29292b;
    P.sph(0.5,cov,0,0.78,-0.15,b,0.62,0.82,1.55); P.sph(0.38,cov2,0,1.04,0.42,b,0.95,0.95,0.7); P.sph(0.28,cov,0,1.25,0.5,b,1.3,0.55,0.7);   // the shroud over body, front and screen
    P.sph(0.3,cov,0,0.62,0.58,b,0.95,1.2,0.9); for(let i=0;i<7;i++){const a=i*0.9; P.box(0.02,0.25,0.12,cov2,Math.sin(a)*0.29,0.48,-0.6+i*0.2,b).rotation.z=Math.sin(a)*0.25;}   // folds where it hangs
  }
  if(kind!=='covered'){P.bar([0.12,0.32,-0.05],[0.3,0.02,-0.12],0.012,blk,b);}                                  // the side stand, on the left
  return g;
};

/* ================= bicycles ================= */
/* nose along +z. kind: city (step-through, mudguards, rack), mtb. o: colour, tyre colour, basket */
det.bike=function(kind,o){
  o=o||{}; const g=P.grp(), c=o.color||0x9fd3c0, r=kind==='mtb'?0.36:0.34, wz=kind==='mtb'?0.55:0.54, al=0xb9bdc0, blk=0x1b1c1d;
  const b=P.grp(0,0,0,g); b.rotation.z=o.lean==null?-0.08:o.lean;
  const fw=wheel(b,r,kind==='mtb'?0.06:0.04,{style:'bicycle',tyre:o.tyre||(kind==='mtb'?0x1a1a1b:0xd8c9a6),rim:al}); fw.position.set(0,r,wz);
  const rw=wheel(b,r,kind==='mtb'?0.06:0.04,{style:'bicycle',tyre:o.tyre||(kind==='mtb'?0x1a1a1b:0xd8c9a6),rim:al}); rw.position.set(0,r,-wz);
  const BB=[0,0.3,0.02], HT=[0,0.98,0.36], ST=[0,0.92,-0.12], tb=kind==='mtb'?0.024:0.02;
  if(kind==='city'){P.tube([HT,[0,0.7,0.3],[0,0.38,0.12],BB],tb,c,b);} else P.bar(HT,BB,0.028,c,b);            // step-through down tube, or straight
  if(kind==='mtb') P.bar([0,0.95,0.32],ST,0.022,c,b);
  P.bar(BB,ST,tb,c,b); P.bar([0,0.98,0.36],[0,0.86,0.38],0.022,c,b);                                          // seat tube, head tube
  [-0.04,0.04].forEach(function(x){P.bar([x,r,-wz],[x,BB[1],BB[2]-0.02],0.01,c,b); P.bar([x,r,-wz],[x,ST[1]-0.06,ST[2]],0.009,c,b); P.bar([x,r,wz],[x*0.8,0.88,0.39],0.012,kind==='mtb'?0x2b2d2f:c,b);});
  P.cyl(0.075,0.012,al,0.06,BB[1],BB[2],b,16).rotation.z=R/2; P.bar([0.07,0.3,0.02],[0.07,0.11,0.12],0.008,blk,b); P.box(0.04,0.012,0.09,blk,0.08,0.12,0.13,b);   // crank, pedal
  P.bar([0.05,0.31,0.03],[0.05,r,-wz],0.004,0x2a2b2c,b); P.bar([0.05,0.24,0.03],[0.05,r-0.07,-wz],0.004,0x2a2b2c,b);   // chain
  P.bar(ST,[0,1.02,-0.16],0.013,al,b); P.rbox(0.13,0.05,0.25,o.saddle||(kind==='mtb'?0x161718:0x6b4a33),0,1.04,-0.17,b,0.02);   // saddle
  if(kind==='city'){
    P.tube([[0,0.98,0.38],[0,1.08,0.3],[0.22,1.1,0.22],[0.3,1.08,0.12]],0.011,al,b); P.tube([[0,0.98,0.38],[0,1.08,0.3],[-0.22,1.1,0.22],[-0.3,1.08,0.12]],0.011,al,b);   // swept-back bars
    [-1,1].forEach(function(s){P.cyl(0.018,0.1,0x6b4a33,s*0.31,1.08,0.08,b,8).rotation.x=R/2;});
    P.tor(r+0.025,0.03,c,0,r,wz,b,R*0.55).rotation.set(0,R/2,R*0.55); P.tor(r+0.025,0.03,c,0,r,-wz,b,R*0.6).rotation.set(0,R/2,R*0.05);   // mudguards
    P.box(0.14,0.012,0.36,al,0,0.82,-0.36,b); [-0.06,0.06].forEach(function(x){P.bar([x,0.82,-0.5],[x,r,-wz],0.006,al,b);});   // rear rack
    P.rbox(0.05,0.14,0.18,c,0.04,0.36,-0.1,b,0.01);                                                            // chain guard
    P.cyl(0.02,0.012,0xd8d8d8,0.18,1.1,0.24,b,10);                                                             // bell
    if(o.basket){const k=P.grp(0,0.98,0.6,b); P.box(0.36,0.01,0.26,0x2b2d2f,0,0,0,k); for(let i=0;i<6;i++){P.box(0.36,0.008,0.004,0x2b2d2f,0,0.04*i,0.13,k); P.box(0.36,0.008,0.004,0x2b2d2f,0,0.04*i,-0.13,k); P.box(0.004,0.008,0.26,0x2b2d2f,0.18,0.04*i,0,k); P.box(0.004,0.008,0.26,0x2b2d2f,-0.18,0.04*i,0,k);}}
  }else{P.bar([-0.36,1.03,0.36],[0.36,1.03,0.36],0.012,blk,b); [-1,1].forEach(function(s){P.cyl(0.018,0.12,o.grip||0xe2b33a,s*0.33,1.03,0.36,b,8).rotation.z=R/2;}); P.bar([0,0.88,0.39],[0,0.62,0.48],0.02,0xc9a227,b);}
  P.bar([0.09,0.33,-0.08],[0.12,0.02,-0.26],0.008,blk,b);                                                       // kickstand
  return g;
};

/* ================= cars ================= */
/* nose along +x, wheels on the ground. kind: hatch, sedan, suv, van, mini. o: colour, plate text */
const CARS={
  mini:{L:3.6,W:1.6,r:0.29,wb:2.38,prof:[[-1.8,0.38],[-1.82,0.62],[-1.75,0.9],[-1.55,1.42],[-0.55,1.5],[0.45,1.46],[1.0,1.0],[1.72,0.9],[1.8,0.6],[1.78,0.38]]},
  hatch:{L:4.05,W:1.76,r:0.31,wb:2.58,prof:[[-2.02,0.36],[-2.04,0.64],[-1.98,0.95],[-1.75,1.43],[-0.6,1.5],[0.45,1.46],[1.15,1.0],[1.95,0.9],[2.03,0.62],[2.0,0.36]]},
  sedan:{L:4.62,W:1.8,r:0.32,wb:2.7,prof:[[-2.3,0.38],[-2.32,0.66],[-2.25,0.95],[-1.75,1.0],[-1.25,1.42],[0.0,1.46],[0.6,1.42],[1.3,0.98],[2.22,0.88],[2.31,0.6],[2.28,0.36]]},
  suv:{L:4.45,W:1.84,r:0.36,wb:2.64,prof:[[-2.2,0.44],[-2.23,0.75],[-2.18,1.05],[-2.05,1.62],[-0.6,1.7],[0.6,1.66],[1.25,1.12],[2.12,1.02],[2.23,0.72],[2.2,0.44]]},
  van:{L:4.4,W:1.78,r:0.31,wb:2.73,prof:[[-2.2,0.4],[-2.22,0.7],[-2.2,1.8],[-2.1,1.86],[0.9,1.86],[1.45,1.2],[2.12,1.0],[2.22,0.7],[2.2,0.4]]}
};
det.car=function(kind,o){
  o=o||{}; const K=CARS[kind]||CARS.hatch, g=P.grp(), c=o.color||0xe9e9e6, W=K.W, r=K.r, blk=0x18191a, glass=0x27313a, chr=0xc9cdd0;
  const sh=new THREE.Shape(); K.prof.forEach(function(p,i){if(i) sh.lineTo(p[0],p[1]); else sh.moveTo(p[0],p[1]);});
  const bw=W-0.12, body=new THREE.ExtrudeGeometry(sh,{depth:bw,bevelEnabled:true,bevelThickness:0.06,bevelSize:0.05,bevelSegments:3,curveSegments:4}); body.translate(0,0,-bw/2);
  P.geo(body,c,0,0,0,g);
  /* glass: the windows are the upper band of the profile, inset; each side gets one long glazed strip split by pillars */
  const pr=K.prof, top=pr.filter(function(p){return p[1]>1.1;}), xs=top.map(function(p){return p[0];}), x0=Math.min.apply(null,xs), x1=Math.max.apply(null,xs);
  const belt=kind==='van'?1.2:(kind==='suv'?1.15:1.0)+0.02;
  const win=new THREE.Shape(); const pts=[]; pr.forEach(function(p){if(p[1]>belt-0.01) pts.push([p[0],Math.min(p[1],99)]);});
  const yTop=Math.max.apply(null,pr.map(function(p){return p[1];}));
  win.moveTo(x0+0.06,belt+0.03); win.lineTo(x1-0.1,belt+0.03); win.lineTo(x1-0.18-(yTop-belt)*0.45,yTop-0.06); win.lineTo(x0+0.12+(kind==='van'?0:(yTop-belt)*0.2),yTop-0.06); win.closePath();
  [-1,1].forEach(function(s){const m=P.geo(new THREE.ShapeGeometry(win),glass,0,0,s*(W/2+0.002),g); if(s<0) m.rotation.y=R;
    m.scale.set(s<0?-1:1,1,1);
    for(let i=1;i<(kind==='van'||kind==='mini'?2:3);i++){const px=x0+(x1-x0)*(i/(kind==='van'||kind==='mini'?2:3)); P.box(0.07,yTop-belt-0.04,0.012,c,px,(belt+yTop)/2,s*(W/2+0.004),g);}
    P.box(0.12,0.02,0.015,chr,-0.15,belt-0.17,s*(W/2+0.008),g); P.box(0.12,0.02,0.015,chr,0.75,belt-0.17,s*(W/2+0.008),g);         // door handles
    P.box(0.004,belt-0.45,0.006,0x2a2b2d,0.35,(belt+0.45)/2,s*(W/2+0.006),g); P.box(0.004,belt-0.45,0.006,0x2a2b2d,-0.75,(belt+0.45)/2,s*(W/2+0.006),g);   // door gaps
    const mx=x1-0.35-(yTop-belt)*0.4; P.rbox(0.14,0.09,0.1,c,mx,belt+0.08,s*(W/2+0.06),g,0.02); P.box(0.04,0.02,0.06,blk,mx,belt+0.04,s*(W/2+0.02),g);   // mirrors
    [K.wb/2,-K.wb/2].forEach(function(wx){const t=P.tor(r+0.05,0.05,blk,wx,r,s*(W/2-0.01),g,R,6,14); t.scale.set(1,1,0.5);});       // wheel-arch trims
  });
  /* windscreen and rear window: quads across the car between the profile's slopes */
  function pane(a,b2){const xa=a[0], ya=a[1], xb=b2[0], yb=b2[1], len=Math.hypot(xb-xa,yb-ya), m=P.box(len,0.012,W-0.2,glass,(xa+xb)/2,(ya+yb)/2+0.02,0,g); m.rotation.z=Math.atan2(yb-ya,xb-xa);}
  for(let i=0;i<pr.length-1;i++){const a=pr[i], b2=pr[i+1], slope=Math.abs((b2[1]-a[1])/(b2[0]-a[0]+1e-6)); if(a[1]>belt&&b2[1]>belt&&slope>0.5&&slope<8) pane(a,b2);}
  /* wheels, lights, plates, bumpers */
  [K.wb/2,-K.wb/2].forEach(function(wx){[-1,1].forEach(function(s){const w=wheel(g,r,0.2,{style:'car',rim:o.rim||0xb9bdc0}); w.position.set(wx,r,s*(W/2-0.12)); w.rotation.order='YXZ'; w.rotation.y=R/2; w.userData.wheel=r;});});
  const fx=K.L/2, rx=-K.L/2;
  [-1,1].forEach(function(s){P.rbox(0.08,0.11,0.32,o.lamp||0xe6ecee,fx-0.08,0.78,s*(W/2-0.28),g,0.03); P.rbox(0.06,0.13,0.26,o.tail||0xb0262a,rx+0.05,0.86,s*(W/2-0.22),g,0.03);   // head and tail lamps
    P.box(0.05,0.04,0.12,0xe58a2a,fx-0.1,0.66,s*(W/2-0.12),g);});
  P.box(0.05,0.18,W*0.45,0x1f2224,fx-0.01,0.62,0,g); for(let i=0;i<4;i++) P.box(0.055,0.012,W*0.43,0x3a3d40,fx,0.56+i*0.04,0,g);       // grille
  P.rbox(0.12,0.16,W-0.04,blk,fx-0.03,0.38,0,g,0.04); P.rbox(0.12,0.16,W-0.04,blk,rx+0.03,0.4,0,g,0.04);                              // bumpers
  [[fx+0.03,0.47,0],[rx-0.03,0.6,R]].forEach(function(q){const pl=P.plane(0.52,0.11,plateM(o.plate||'12-345-67'),q[0],q[1],q[2],g,R/2+q[2]);});
  P.cyl(0.03,0.08,0x55595c,rx+0.02,0.3,W/2-0.35,g,8).rotation.z=R/2;                                                                    // exhaust
  P.box(0.4,0.03,0.02,blk,x1-0.3-(yTop-belt)*0.5,belt+0.06,0.2,g).rotation.y=0.3; P.box(0.4,0.03,0.02,blk,x1-0.3-(yTop-belt)*0.5,belt+0.06,-0.25,g).rotation.y=0.3;   // wipers
  if(kind!=='van') P.rbox(0.18,0.05,0.06,blk,x0+0.4,yTop+0.02,0,g,0.02);                                                                // aerial fin
  if(kind==='suv') [-1,1].forEach(function(s){P.box(1.6,0.03,0.04,0x9aa0a4,-0.2,yTop+0.04,s*(W/2-0.18),g);});                          // roof rails
  if(kind==='van') P.box(0.02,0.9,0.012,0x2a2b2d,-0.4,1.0,W/2+0.006,g);                                                                 // the sliding door's gap
  P.box(K.L*0.92,0.08,W*0.9,0x101112,0,0.24,0,g);                                                                                          // the dark underside
  return g;
};

/* ================= air conditioners ================= */
/* the outdoor unit: back on the wall at z=0, front facing +z, sitting at y=0. o: brand (electra, haier, tadiran, plain), bracket, pipes */
const brands={};
function brandM(n){return brands[n]||(brands[n]=mat(tex(64,24,function(g){g.fillStyle='#f3f3f0'; g.fillRect(0,0,64,24);
  if(n==='electra'){g.fillStyle='#e8762a'; g.beginPath(); g.arc(9,12,7,0,7); g.fill(); g.fillStyle='#f3f3f0'; g.beginPath(); g.arc(9,12,3,0,7); g.fill(); g.fillStyle='#333'; g.font='bold 9px sans-serif'; g.fillText('ELECTRA',18,15);}
  else if(n==='haier'){g.fillStyle='#1f5fb4'; g.font='bold 13px sans-serif'; g.fillText('Haier',12,17);}
  else if(n==='tadiran'){g.fillStyle='#1b7a5a'; g.font='bold 10px sans-serif'; g.fillText('TADIRAN',6,16);}
  else{g.fillStyle='#8a8f92'; g.fillRect(20,10,24,4);}})));}
det.ac=function(o){
  o=o||{}; const g=P.grp(), w=o.w||0.8, h=o.h||0.56, d=0.28, body=o.color||0xefefec, dk=0x3a3e41, rust=0x7a4e2e;
  const fl=P.grp(0,0,0.02,g);
  P.rbox(w,h,d,body,0,h/2,d/2,fl,0.015,0.01); P.box(w+0.02,0.018,d+0.02,0xe2e2de,0,h+0.006,d/2,fl);                         // case and lid
  const cx=-w*0.12, cy=h*0.5, rr=Math.min(h*0.42,w*0.3);
  P.cyl(rr,0.01,0x2a2d30,cx,cy,d+0.001,fl,28).rotation.x=R/2;                                                               // the dark round opening,
  const fan=P.grp(cx,cy,d-0.04,fl); for(let i=0;i<3;i++){const bl=P.box(rr*0.85,0.012,0.09,0x8f969b,rr*0.42,0,0,fan); const pv=P.grp(0,0,0,fan); pv.rotation.z=i*R*2/3; pv.add(bl); bl.rotation.x=0.5;}   // fan blades behind,
  P.cyl(0.045,0.04,0x6d7377,cx,cy,d-0.02,fl,14).rotation.x=R/2;
  [1,0.76,0.52,0.28].forEach(function(f){P.tor(rr*f,0.004,0xd6d8d8,cx,cy,d+0.012,fl,null,4,28);});                            // the grille's rings
  P.box(rr*2,0.008,0.008,0xd6d8d8,cx,cy,d+0.014,fl); P.box(0.008,rr*2,0.008,0xd6d8d8,cx,cy,d+0.014,fl);
  P.plane(0.16,0.06,brandM(o.brand||'plain'),w*0.3,h*0.85,d+0.003,fl);
  P.box(w*0.26,h*0.42,0.012,0xe4e4e0,w*0.34,h*0.32,d+0.004,fl); for(let i=0;i<4;i++) P.disc(0.006,0x9aa0a4,w*0.24+(i%2)*w*0.2,h*0.14+Math.floor(i/2)*h*0.36,d+0.012,fl);   // service cover, screws
  for(let i=0;i<9;i++) P.box(0.006,0.012,d*0.8,0x8a8f92,-w/2-0.002,0.06+i*h*0.1,d/2,fl);                                     // louvres down the side
  [-1,1].forEach(function(s){P.box(0.06,0.03,d,0x6d7377,s*w*0.36,-0.012,d/2,fl);});                                          // feet
  if(o.pipes!==false){const px=w/2+0.02; P.tube([[px-0.05,h*0.2,d*0.6],[px+0.06,h*0.2,d*0.5],[px+0.09,h*0.25,0.05],[px+0.1,h*0.6+(o.up||0.4),0.04]],0.022,0xf1f0ec,g,16);   // the pipes, taped white, up to the wall
    P.tube([[px-0.05,h*0.12,d*0.5],[px+0.03,h*0.05,d*0.4],[px+0.05,-0.3,0.1],[px+0.04,-(o.drain||0.8),0.06]],0.009,0x2b2d2f,g,12);}   // and its drain hose
  if(o.bracket){[-1,1].forEach(function(s){const x=s*w*0.36; P.box(0.04,0.04,d+0.12,rust,x,-0.04,d/2,g); P.box(0.04,0.42,0.04,rust,x,-0.24,0.02,g); P.bar([x,-0.43,0.03],[x,-0.05,d],0.012,rust,g);});
    if(o.drip) P.box(w*0.9,0.004,0.3,0x6a5440,0,-0.62,0.25,g);}
  return g;
};
/* the indoor split unit on a wall: back at z=0, facing +z, hung at y=0 (its bottom) */
det.acIndoor=function(o){o=o||{}; const g=P.grp(), w=o.w||0.85;
  P.rbox(w,0.28,0.2,0xf8f8f6,0,0.14,0.1,g,0.06,0.02); P.box(w-0.06,0.03,0.012,0x2a2d30,0,0.04,0.19,g); P.box(w-0.08,0.018,0.04,0xe8e8e4,0,0.03,0.205,g).rotation.x=0.4;
  P.box(0.06,0.02,0.004,0x63c398,w*0.3,0.21,0.2,g); P.plane(0.06,0.06,brandM(o.brand||'plain'),-w*0.32,0.2,0.201,g); return g;};


/* ================= foliage: leaf sprigs painted on one sheet, scattered as cards through a crown ================= */
const LS=512, leafT=det.leafT=A.canvasTex(LS,LS,function(g){
  const r=A.rng(5);
  function leafShape(x,y,l,w,a,c,vein){g.save(); g.translate(x,y); g.rotate(a); g.fillStyle=c; g.beginPath(); g.moveTo(0,0); g.bezierCurveTo(w,-l*0.25,w*0.8,-l*0.8,0,-l); g.bezierCurveTo(-w*0.8,-l*0.8,-w,-l*0.25,0,0); g.fill();
    if(vein){g.strokeStyle=vein; g.lineWidth=0.8; g.beginPath(); g.moveTo(0,-1); g.lineTo(0,-l*0.92); g.stroke();} g.restore();}
  function twig(x0,y0,x1,y1,w,c){g.strokeStyle=c; g.lineWidth=w; g.lineCap='round'; g.beginPath(); g.moveTo(x0,y0); g.quadraticCurveTo((x0+x1)/2+6,(y0+y1)/2,x1,y1); g.stroke();}
  /* broad: a ficus sprig, glossy oval leaves crowding a forked twig */
  g.save(); g.beginPath(); g.rect(0,0,256,256); g.clip();
  twig(128,252,120,120,4,'#5a4a36'); twig(122,170,60,70,2.5,'#5a4a36'); twig(124,150,196,60,2.5,'#5a4a36');
  for(let i=0;i<46;i++){const t=r(), br=i%3, bx=br===0?128-8*t:br===1?122-62*t:124+72*t, by=br===0?252-130*t:br===1?170-100*t:150-90*t;
    const sh=Math.floor(r()*4), c=['#2f5a2a','#3d6e33','#4a7d3a','#294d26'][sh];
    leafShape(bx,by,34+r()*20,13+r()*6,(r()-0.5)*2.6+(br===1?-0.6:br===2?0.6:0),c,'rgba(170,200,140,0.5)');}
  for(let i=0;i<40;i++){g.fillStyle='rgba(220,240,200,0.25)'; g.beginPath(); g.ellipse(20+r()*216,20+r()*216,3+r()*5,1.5,r()*3,0,7); g.fill();}      // gloss
  g.restore();
  /* euc: drooping, sickle-shaped grey-green leaves on thin red stems */
  g.save(); g.translate(256,0); g.beginPath(); g.rect(0,0,256,256); g.clip();
  twig(128,6,140,200,2.5,'#8a5a44'); twig(134,60,70,190,1.8,'#8a5a44'); twig(136,90,200,220,1.8,'#8a5a44');
  for(let i=0;i<34;i++){const t=r(), br=i%3, bx=br===0?128+12*t:br===1?134-64*t:136+64*t, by=br===0?6+194*t:br===1?60+130*t:90+130*t;
    leafShape(bx,by,-(48+r()*26),6+r()*3,(r()-0.5)*0.9,['#7d9a86','#6f8c78','#8aa592','#5f7d6a'][Math.floor(r()*4)],'rgba(220,230,210,0.5)');}
  g.restore();
  /* bush: dense small leaves for hedges and shrubs */
  g.save(); g.translate(0,256); g.beginPath(); g.rect(0,0,256,256); g.clip();
  for(let i=0;i<10;i++) twig(128,250,30+r()*196,40+r()*120,2,'#4f4030');
  for(let i=0;i<190;i++){const a=r()*7, d=Math.sqrt(r())*110; leafShape(128+Math.cos(a)*d,150+Math.sin(a)*d*0.95,14+r()*10,6+r()*3,r()*7,['#3b6b34','#4c7f3c','#2e5a2b','#5b8c45'][Math.floor(r()*4)]);}
  g.restore();
  /* frond: a palm leaf seen flat, its midrib along the middle, leaflets slanting toward the tip at the right */
  g.save(); g.translate(256,256); g.beginPath(); g.rect(0,0,256,80); g.clip();
  g.strokeStyle='#a39a5a'; g.lineWidth=3; g.beginPath(); g.moveTo(0,40); g.lineTo(256,40); g.stroke();
  for(let x=6;x<250;x+=5){const l=(1-Math.pow(x/256,1.6))*36+4; [-1,1].forEach(function(s){g.strokeStyle=['#4d7a3a','#5a8a42','#44703a'][Math.floor(r()*3)]; g.lineWidth=2.6;
    g.beginPath(); g.moveTo(x,40); g.quadraticCurveTo(x+l*0.4,40+s*l*0.7,x+l*0.75,40+s*l); g.stroke();});}
  g.restore();
  /* dead frond, dry and pale */
  g.save(); g.translate(256,336); g.beginPath(); g.rect(0,0,256,48); g.clip();
  g.strokeStyle='#9a7f52'; g.lineWidth=3; g.beginPath(); g.moveTo(0,24); g.lineTo(256,24); g.stroke();
  for(let x=6;x<250;x+=6){const l=(1-x/256)*20+3; [-1,1].forEach(function(s){g.strokeStyle=['#b39a6a','#a88a58','#c2ab7c'][Math.floor(r()*3)]; g.lineWidth=2; g.beginPath(); g.moveTo(x,24); g.lineTo(x+l*0.5,24+s*l); g.stroke();});}
  g.restore();
  /* blade: one long pointed leaf, striped, for yuccas and agaves */
  g.save(); g.translate(256,384); g.beginPath(); g.rect(0,0,256,24); g.clip();
  g.fillStyle='#5f7f44'; g.beginPath(); g.moveTo(0,4); g.lineTo(200,8); g.lineTo(256,12); g.lineTo(200,16); g.lineTo(0,20); g.fill();
  g.fillStyle='rgba(200,210,140,0.6)'; g.fillRect(0,10.5,230,1.5); g.fillStyle='rgba(230,220,150,0.7)'; g.fillRect(0,4,200,1.2); g.fillRect(0,18.8,200,1.2);
  g.restore();
  /* bougainvillea: papery magenta bracts among small leaves */
  g.save(); g.translate(256,408); g.beginPath(); g.rect(0,0,128,104); g.clip();
  for(let i=0;i<40;i++) leafShape(10+r()*108,20+r()*84,12+r()*8,6,r()*7,['#3b6b34','#4c7f3c'][i%2]);
  for(let i=0;i<70;i++){const x=10+r()*108, y=10+r()*84; g.fillStyle=['#c2187a','#d6338f','#a3145f','#e05aa6'][Math.floor(r()*4)]; g.beginPath(); g.ellipse(x,y,5+r()*3,4+r()*2,r()*3,0,7); g.fill();}
  g.restore();
  /* grass and weeds */
  g.save(); g.translate(384,408); g.beginPath(); g.rect(0,0,128,104); g.clip();
  for(let i=0;i<60;i++){const x=10+r()*108; g.strokeStyle=['#6b8a3a','#7f9a46','#55783a','#a39a5a'][Math.floor(r()*4)]; g.lineWidth=1.5; g.beginPath(); g.moveTo(x,104); g.quadraticCurveTo(x+(r()-0.5)*20,60,x+(r()-0.5)*40,10+r()*50); g.stroke();}
  g.restore();
  /* flowers: hibiscus red and oleander pink on leaves */
  g.save(); g.translate(0,0); g.restore();
});
const CELL={broad:[0,0,256,256],euc:[256,0,512,256],bush:[0,256,256,512],frond:[256,256,512,336],dead:[256,336,512,384],blade:[256,384,512,408],bougain:[256,408,384,512],grass:[384,408,512,512]};
const leafM=det.leafM=new THREE.MeshLambertMaterial({map:leafT,alphaTest:0.42,vertexColors:true});
const cellUV=function(k){const c=CELL[k]; return [c[0]/LS,1-c[3]/LS,c[2]/LS,1-c[1]/LS];};   // u0 v0 (base) u1 v1 (tip)

/* a crown: n cards scattered through an ellipsoid round c, each a sprig growing outward from where it starts.
   Both faces carry the same outward normal, so the crown is lit like one soft mass; cards deep inside are darker. */
function crownGeo(o){
  const r=A.rng(o.seed||1), uv=cellUV(o.cell||'broad'), pos=[], nor=[], col=[], uvs=[], idx=[];
  const c=o.c||[0,0,0], rx=o.r[0], ry=o.r[1], rz=o.r[2], sz=o.size||0.5, tint=new THREE.Color(o.tint==null?0xffffff:o.tint), t2=new THREE.Color(o.tint2==null?(o.tint==null?0xe8f0c8:o.tint):o.tint2);
  const d=new THREE.Vector3(), u=new THREE.Vector3(), v=new THREE.Vector3(), q=new THREE.Vector3(), nn=new THREE.Vector3(), cc=new THREE.Color();
  for(let i=0;i<o.n;i++){
    d.set(r()*2-1,r()*2-1,r()*2-1); if(d.lengthSq()>1||d.lengthSq()<0.01){i--; continue;} d.normalize();
    if(o.flat&&d.y<-0.2) d.y*=0.3;
    const t=o.shell==null?Math.cbrt(r()):o.shell+(1-o.shell)*r();
    const p=[c[0]+d.x*rx*t, c[1]+d.y*ry*t, c[2]+d.z*rz*t];
    u.set(d.x+(r()-0.5)*1.1, d.y+(r()-0.5)*1.1-(o.droop||0), d.z+(r()-0.5)*1.1).normalize();
    q.set(r()-0.5,r()-0.5,r()-0.5); v.crossVectors(u,q).normalize();
    const s=sz*(0.7+r()*0.6), w=s*(o.aspect||1)/2, h=s, base=pos.length/3, fl=r()<0.5;
    const shade=(0.5+0.5*t)*(0.82+r()*0.3)*(o.dark||1); cc.copy(tint).lerp(t2,r()*0.6).multiplyScalar(shade);
    const pts=[[-w,0],[w,0],[w,h],[-w,h]];
    pts.forEach(function(k,j){const x=p[0]+v.x*k[0]+u.x*k[1], y=p[1]+v.y*k[0]+u.y*k[1], z=p[2]+v.z*k[0]+u.z*k[1];
      pos.push(x,y,z); nn.set((x-c[0])/rx,(y-c[1])/ry+0.45,(z-c[2])/rz).normalize(); nor.push(nn.x,nn.y,nn.z); col.push(cc.r,cc.g,cc.b);
      uvs.push((j===0||j===3)!==fl?uv[0]:uv[2], j<2?uv[1]:uv[3]);});
    pts.forEach(function(k,j){pos.push(pos[(base+j)*3],pos[(base+j)*3+1],pos[(base+j)*3+2]); nor.push(nor[(base+j)*3],nor[(base+j)*3+1],nor[(base+j)*3+2]); col.push(cc.r,cc.g,cc.b); uvs.push(uvs[(base+j)*2],uvs[(base+j)*2+1]);});
    idx.push(base,base+1,base+2,base,base+2,base+3, base+4,base+6,base+5,base+4,base+7,base+6);
  }
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
  g.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2)); g.setIndex(idx); return g;
}
det.crownGeo=crownGeo;
det.crown=function(o,p){return mk(crownGeo(o),leafM,0,0,0,p);};

/* a strip along a curve that bends as it goes: palm fronds, yucca blades. pts in the parent's frame; w: half widths at base and tip; twist: roll */
function stripGeo(pts,w0,w1,cell,o){
  o=o||{}; const cv=new THREE.CatmullRomCurve3(pts.map(function(q){return new THREE.Vector3(q[0],q[1],q[2]);})), n=o.seg||8, uv=cellUV(cell), pos=[], nor=[], col=[], uvs=[], idx=[];
  const side=new THREE.Vector3(), up=new THREE.Vector3(0,1,0), tg=new THREE.Vector3(), nm=new THREE.Vector3(), cc=new THREE.Color(o.tint==null?0xffffff:o.tint);
  for(let i=0;i<=n;i++){const t=i/n, P0=cv.getPointAt(t); cv.getTangentAt(t,tg); side.crossVectors(tg,up); if(side.lengthSq()<1e-6) side.set(1,0,0); side.normalize();
    if(o.twist) side.applyAxisAngle(tg,o.twist*t); nm.crossVectors(side,tg).normalize(); if(nm.y<0) nm.negate();
    const w=w0+(w1-w0)*t, sh=0.75+0.25*t;
    [-1,0,1].forEach(function(s){const f=(1-Math.abs(s))*(o.fold||0)*w;            // the midrib sits lower than the edges, so the leaf folds into a shallow V
      pos.push(P0.x+side.x*w*s-nm.x*f,P0.y+side.y*w*s-nm.y*f,P0.z+side.z*w*s-nm.z*f); nor.push(nm.x,nm.y,nm.z); col.push(cc.r*sh,cc.g*sh,cc.b*sh);
      if(o.across) uvs.push(uv[0]+(uv[2]-uv[0])*t, uv[1]+(uv[3]-uv[1])*(s+1)/2); else uvs.push(uv[0]+(uv[2]-uv[0])*(s+1)/2, uv[1]+(uv[3]-uv[1])*t);});}
  const m=pos.length/3;
  for(let k=0;k<m;k++){pos.push(pos[k*3],pos[k*3+1],pos[k*3+2]); nor.push(nor[k*3],nor[k*3+1],nor[k*3+2]); col.push(col[k*3],col[k*3+1],col[k*3+2]); uvs.push(uvs[k*2],uvs[k*2+1]);}
  for(let i=0;i<n;i++) for(let c=0;c<2;c++){const a=i*3+c, b=a+1, c2=a+3, d=a+4; idx.push(a,c2,b,b,c2,d, m+a,m+b,m+c2,m+b,m+d,m+c2);}
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
  g.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2)); g.setIndex(idx); return g;
}
det.stripGeo=stripGeo;

/* ================= bark, and limbs that taper along a curve ================= */
const barks={};
det.barkM=function(kind){if(barks[kind]) return barks[kind];
  const t=tex(128,256,function(g){const r=A.rng(kind.length*13);
    if(kind==='grey'){g.fillStyle='#8d8a80'; g.fillRect(0,0,128,256); for(let i=0;i<300;i++){g.fillStyle='rgba('+(r()>0.5?'60,58,52':'190,186,175')+','+(0.1+r()*0.2)+')'; g.fillRect(r()*128,r()*256,2+r()*6,1+r()*2);}
      for(let i=0;i<14;i++){g.strokeStyle='rgba(70,66,58,0.35)'; g.lineWidth=1+r()*2; g.beginPath(); const x=r()*128; g.moveTo(x,0); g.bezierCurveTo(x+8,80,x-8,170,x+4,256); g.stroke();}}
    else if(kind==='euc'){g.fillStyle='#d8cfbd'; g.fillRect(0,0,128,256); for(let i=0;i<40;i++){g.fillStyle=['#b9ad96','#e9e2d4','#a99b84','#c9c0a8','#9a9a8a'][Math.floor(r()*5)]; g.beginPath(); g.ellipse(r()*128,r()*256,6+r()*16,10+r()*40,0,0,7); g.fill();}
      for(let i=0;i<10;i++){g.fillStyle='rgba(120,90,60,0.45)'; g.fillRect(r()*128,r()*256,3+r()*8,20+r()*40);}}
    else if(kind==='palm'){g.fillStyle='#7d6c55'; g.fillRect(0,0,128,256); for(let y=-16;y<256;y+=22) for(let x=-16;x<144;x+=32){const ox=(Math.round(y/22)%2)*16;
      g.fillStyle=['#8f7c60','#6e5e48','#9c8a6c'][Math.floor(r()*3)]; g.beginPath(); g.moveTo(x+ox,y); g.lineTo(x+ox+16,y+12); g.lineTo(x+ox,y+24); g.lineTo(x+ox-16,y+12); g.fill();
      g.strokeStyle='rgba(50,40,30,0.6)'; g.lineWidth=2; g.beginPath(); g.moveTo(x+ox-14,y+12); g.lineTo(x+ox+14,y+12); g.stroke();}}
    else {g.fillStyle='#6c5a46'; g.fillRect(0,0,128,256); for(let i=0;i<26;i++){g.strokeStyle='rgba(40,30,22,0.6)'; g.lineWidth=2+r()*3; const x=r()*128; g.beginPath(); g.moveTo(x,0); for(let y=0;y<256;y+=32) g.lineTo(x+(r()-0.5)*10,y); g.stroke();}
      for(let i=0;i<200;i++){g.fillStyle='rgba('+(r()>0.5?'140,120,95':'40,32,24')+','+(0.15+r()*0.2)+')'; g.fillRect(r()*128,r()*256,2+r()*4,2+r()*8);}}
  },true);
  return barks[kind]=mat(t);};
function limbGeo(pts,r0,r1,o){
  o=o||{}; const cv=new THREE.CatmullRomCurve3(pts.map(function(q){return new THREE.Vector3(q[0],q[1],q[2]);})), ls=o.ls||8, rs=o.rs||9, len=cv.getLength(), fr=cv.computeFrenetFrames(ls,false), seed=o.seed||0;
  const pos=[], nor=[], uvs=[], idx=[], P0=new THREE.Vector3(), n=new THREE.Vector3();
  for(let i=0;i<=ls;i++){const t=i/ls; cv.getPointAt(t,P0); let rad=r0+(r1-r0)*t; if(o.flare) rad*=1+o.flare*Math.pow(1-t,4);
    for(let j=0;j<=rs;j++){const a=j/rs*R*2, wob=1+(o.knob||0.07)*Math.sin(a*3+t*7+seed)+(o.flare?o.flare*0.5*Math.pow(1-t,4)*Math.max(0,Math.sin(a*5+seed)):0);
      n.copy(fr.normals[i]).multiplyScalar(Math.cos(a)).addScaledVector(fr.binormals[i],Math.sin(a)).normalize();
      pos.push(P0.x+n.x*rad*wob,P0.y+n.y*rad*wob,P0.z+n.z*rad*wob); nor.push(n.x,n.y,n.z); uvs.push(j/rs*Math.max(1,Math.round(r0*8)),t*len/1.2);}}
  for(let i=0;i<ls;i++) for(let j=0;j<rs;j++){const a=i*(rs+1)+j, b=a+rs+1; idx.push(a,b,a+1,b,b+1,a+1);}
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2)); g.setIndex(idx); return g;
}
det.limbGeo=limbGeo;
P.limb=function(pts,r0,r1,k,p,o){return mk(limbGeo(pts,r0,r1,o),k,0,0,0,p);};

/* ================= trees ================= */
/* each returns {wood, crown}: two groups in the tree's own frame, base at the origin, so the crown can be merged apart and thinned from above */
det.tree=function(kind,o){
  o=o||{}; const s=o.s||1, r=A.rng(o.seed||7), wood=P.grp(), crown=P.grp(), a0=o.a0||0;
  const out=function(a,d,y){return [Math.sin(a)*d,y,Math.cos(a)*d];};
  if(kind==='ficus'||kind==='broad'){
    const fic=kind==='ficus', bark=det.barkM(fic?'grey':'brown'), th=(fic?2.5:2.4)*s, tr=(fic?0.36:0.22)*s;
    P.limb([[0,-0.05,0],[0.05*s,th*0.5,0.03],[0,th,0]],tr,tr*0.72,bark,wood,{flare:fic?0.9:0.5,ls:6,rs:12,seed:o.seed});
    if(fic) for(let k=0;k<6;k++){const a=a0+k*1.05+r()*0.3; P.limb([out(a,tr*0.6,0.35),out(a,tr*1.6,0.08),out(a,tr*2.6+r()*0.4,-0.04)],0.09*s,0.03*s,bark,wood,{ls:4,rs:6});}   // buttress roots across the ground
    const nl=fic?5:3, tips=[];
    for(let k=0;k<nl;k++){const a=a0+k*R*2/nl+(r()-0.5)*0.5, sp=(fic?2.6:1.8)*s*(0.8+r()*0.4), up=(fic?3.6:2.3)*s*(0.85+r()*0.3);
      const pts=[[0,th*0.9,0],out(a,sp*0.35,th+up*0.35),out(a,sp*0.75,th+up*0.75),out(a,sp,th+up)];
      P.limb(pts,tr*0.55,0.05*s,bark,wood,{ls:7,rs:8,seed:k}); tips.push(pts[3]);
      for(let j=0;j<2;j++){const b=a+(j?0.7:-0.7), m=out(a,sp*0.6,th+up*0.6); P.limb([m,[m[0]+Math.sin(b)*0.9*s,m[1]+0.7*s,m[2]+Math.cos(b)*0.9*s],[m[0]+Math.sin(b)*1.5*s,m[1]+1.0*s,m[2]+Math.cos(b)*1.5*s]],0.07*s,0.025*s,bark,wood,{ls:4,rs:5});}}
    if(fic) for(let k=0;k<7;k++){const t=tips[k%tips.length], f=0.4+r()*0.3, x=t[0]*f, z=t[2]*f, y=th+(t[1]-th)*f-0.2; P.limb([[x,y,z],[x+0.05,y-0.8*s,z],[x,y-1.4*s-r()*0.6,z+0.04]],0.012*s,0.006*s,bark,wood,{ls:3,rs:4});}   // aerial roots hanging from the limbs
    const tint=fic?0xd8e6c8:0xe6f0d0, cy=(fic?th+3.4*s:th+2.2*s);
    det.crown({c:[0,cy+0.4*s,0],r:[(fic?3.2:2.0)*s,(fic?1.75:1.35)*s,(fic?3.2:2.0)*s],n:fic?900:420,size:0.62*s,seed:(o.seed||1)*3,tint:tint,cell:'broad',shell:0.45},crown);
    tips.forEach(function(t,k){det.crown({c:[t[0]*1.05,t[1]+0.1,t[2]*1.05],r:[(fic?1.9:1.3)*s,(fic?1.2:0.95)*s,(fic?1.9:1.3)*s],n:fic?260:170,size:0.55*s,seed:(o.seed||1)*7+k,tint:tint,cell:'broad',shell:0.4,droop:0.15},crown);});
  }else if(kind==='euc'){
    const bark=det.barkM('euc'), h=(o.h||9)*s, lean=o.lean||0.12;
    P.limb([[0,-0.05,0],[Math.sin(a0)*lean*h*0.3,h*0.45,Math.cos(a0)*lean*h*0.3],[Math.sin(a0)*lean*h,h,Math.cos(a0)*lean*h]],0.3*s,0.11*s,bark,wood,{flare:0.5,ls:8,rs:10});
    const top=[Math.sin(a0)*lean*h,h,Math.cos(a0)*lean*h];
    for(let k=0;k<5;k++){const a=a0+k*1.3, base=[top[0]*(0.55+k*0.08),h*(0.55+k*0.08),top[2]*(0.55+k*0.08)], e=[base[0]+Math.sin(a)*2.2*s,base[1]+1.6*s+r()*s,base[2]+Math.cos(a)*2.2*s];
      P.limb([base,[(base[0]+e[0])/2,(base[1]+e[1])/2+0.3,(base[2]+e[2])/2],e],0.1*s,0.03*s,bark,wood,{ls:5,rs:6});
      det.crown({c:[e[0],e[1]-0.2,e[2]],r:[1.6*s,1.3*s,1.6*s],n:150,size:0.75*s,seed:(o.seed||2)*5+k,tint:0xe4ece4,cell:'euc',droop:0.9,shell:0.3},crown);}
    det.crown({c:[top[0],h+0.6*s,top[2]],r:[1.8*s,1.4*s,1.8*s],n:180,size:0.8*s,seed:(o.seed||2)*11,tint:0xe4ece4,cell:'euc',droop:0.9,shell:0.3},crown);
  }else if(kind==='palm'){                                   // a date palm: a trunk of old leaf bases, a crown of arching fronds, dry ones hanging under them
    const h=(o.h||3)*s, bark=det.barkM('palm'), bend=o.bend||0.15, top=[Math.sin(a0)*bend*h,h,Math.cos(a0)*bend*h];
    P.limb([[0,0,0],[top[0]*0.3,h*0.5,top[2]*0.3],top],0.24*s,0.22*s,bark,wood,{ls:6,rs:12,knob:0.03});
    P.cyl(0.2*s,0.4*s,0x75684a,top[0],h+0.1*s,top[2],wood,10,0.26*s); for(let k=0;k<10;k++){const a=k*2.4; P.box(0.09*s,0.3*s,0.05*s,0x8a7a52,top[0]+Math.sin(a)*0.22*s,h+0.12*s,top[2]+Math.cos(a)*0.22*s,wood).rotation.set(Math.cos(a)*0.4,a,-Math.sin(a)*0.4);}   // the frond bases, overlapping
    const nf=o.n||22;
    for(let k=0;k<nf;k++){const a=k*2.4+r()*0.3, up=k%3===0?0.9:k%3===1?0.45:0.1, L=(1.9+r()*0.5)*s*(o.fl||1), c=Math.cos(up);
      const p0=[top[0],h+0.1*s,top[2]], d=[Math.sin(a)*c,Math.sin(up),Math.cos(a)*c];
      const pts=[p0,[p0[0]+d[0]*L*0.35,p0[1]+d[1]*L*0.35+0.12*s,p0[2]+d[2]*L*0.35],[p0[0]+d[0]*L*0.7,p0[1]+d[1]*L*0.55,p0[2]+d[2]*L*0.7],[p0[0]+d[0]*L,p0[1]+d[1]*L*0.4-0.5*s,p0[2]+d[2]*L]];
      mk(stripGeo(pts,0.22*s,0.04*s,'frond',{across:true,seg:9,fold:0.25,tint:k%2?0xffffff:0xe8f0d8}),leafM,0,0,0,crown);}
    for(let k=0;k<(o.dead==null?6:o.dead);k++){const a=k*1.1+0.4, L=1.4*s, p0=[top[0],h-0.05,top[2]];
      mk(stripGeo([p0,[p0[0]+Math.sin(a)*0.35*s,p0[1]-0.3*s,p0[2]+Math.cos(a)*0.35*s],[p0[0]+Math.sin(a)*0.45*s,p0[1]-L,p0[2]+Math.cos(a)*0.45*s]],0.12*s,0.05*s,'dead',{across:true,seg:4}),leafM,0,0,0,crown);}
    if(o.dates) for(let k=0;k<3;k++){const a=k*2.1+0.5, bx=top[0]+Math.sin(a)*0.28*s, bz=top[2]+Math.cos(a)*0.28*s; P.bar([top[0],h,top[2]],[bx,h-0.3*s,bz],0.012,0xc98a2a,wood); for(let j=0;j<9;j++) P.sph(0.035*s,j%3?0xd98a2a:0xb8641e,bx+Math.sin(j*2.4)*0.06*s,h-0.32*s-(j%4)*0.05*s,bz+Math.cos(j*2.4)*0.06*s,wood,1,1.4,1);}
  }else if(kind==='washingtonia'){                          // a tall fan palm, its skirt of dry leaves hanging close to the trunk
    const h=(o.h||10)*s;
    P.limb([[0,0,0],[0.1,h*0.5,0],[0.05,h,0]],0.3*s,0.2*s,det.barkM('brown'),wood,{ls:8,rs:10,knob:0.02,flare:0.3});
    for(let k=0;k<22;k++){const a=k*2.4, p0=[0.05+Math.sin(a)*0.18*s,h-0.1*s-(k%3)*0.25*s,Math.cos(a)*0.18*s];
      mk(stripGeo([p0,[p0[0]+Math.sin(a)*0.3*s,p0[1]-0.5*s,p0[2]+Math.cos(a)*0.3*s],[p0[0]+Math.sin(a)*0.32*s,p0[1]-1.3*s,p0[2]+Math.cos(a)*0.32*s]],0.16*s,0.22*s,'dead',{across:true,seg:3}),leafM,0,0,0,crown);}
    for(let k=0;k<22;k++){const a=k*2.4, up=0.1+(k%4)*0.28, c=Math.cos(up), p0=[0.05,h+0.1,0], L=1.0*s, e=[p0[0]+Math.sin(a)*c*L,p0[1]+Math.sin(up)*L,p0[2]+Math.cos(a)*c*L];
      P.bar(p0,e,0.018*s,0x8a7a4a,wood);
      det.crown({c:[e[0]+Math.sin(a)*c*0.45*s,e[1]+0.05,e[2]+Math.cos(a)*c*0.45*s],r:[0.5*s,0.18*s,0.5*s],n:9,size:0.6*s,seed:k+3,cell:'frond',aspect:0.35,tint:0xd8e8c8,shell:0.6},crown);}
  }else if(kind==='yucca'){
    const n=o.trunks||3;
    for(let t=0;t<n;t++){const a=a0+t*2.1, hh=(o.h||2)*s*(0.65+0.2*t), lean=0.12+0.1*t, top=[Math.sin(a)*lean*hh,hh,Math.cos(a)*lean*hh];
      P.limb([[Math.sin(a)*0.05,0,Math.cos(a)*0.05],[top[0]*0.4,hh*0.5,top[2]*0.4],top],0.07*s,0.05*s,det.barkM('brown'),wood,{ls:4,rs:6});
      for(let i=0;i<14;i++) P.box(0.12*s,0.03,0.12*s,0x6f6a4e,top[0]*(1-i*0.02),hh-0.05-i*0.03,top[2]*(1-i*0.02),wood).rotation.y=i;      // dry leaf bases
      for(let k=0;k<44;k++){const b=k*2.4+t, up=-0.55+(k%9)*0.22, c=Math.cos(up), L=(0.5+r()*0.25)*s;
        mk(stripGeo([top,[top[0]+Math.sin(b)*c*L*0.5,top[1]+Math.sin(up)*L*0.5+0.06*s,top[2]+Math.cos(b)*c*L*0.5],[top[0]+Math.sin(b)*c*L,top[1]+Math.sin(up)*L+0.04*s,top[2]+Math.cos(b)*c*L]],0.05*s,0.045*s,'blade',{across:true,seg:3,fold:0.4,tint:k%3?0xffffff:0xd8e0b8}),leafM,0,0,0,crown);}}
  }else if(kind==='shrub'||kind==='hedge'||kind==='bougain'){
    const w=o.w||1, h=o.h||1, d=o.d||w;
    det.crown({c:[0,h*0.55,0],r:[w/2,h*0.55,d/2],n:o.n||Math.round(60*w*h*d+40),size:o.size||0.42,seed:o.seed||3,tint:o.tint==null?0xffffff:o.tint,cell:kind==='bougain'?'bougain':'bush',shell:kind==='hedge'?0.75:0.35},crown);
    if(o.flowers) det.crown({c:[0,h*0.62,0],r:[w/2+0.04,h*0.5,d/2+0.04],n:Math.round((o.n||60*w*h*d)*0.3),size:0.32,seed:(o.seed||3)+9,cell:'bougain',shell:0.85},crown);
    if(kind!=='bougain') for(let k=0;k<4;k++){const a=k*1.6; P.limb([[0,0,0],[Math.sin(a)*w*0.15,h*0.3,Math.cos(a)*d*0.15],[Math.sin(a)*w*0.3,h*0.6,Math.cos(a)*d*0.3]],0.025,0.012,det.barkM('brown'),wood,{ls:3,rs:5});}
  }else if(kind==='grass'){
    det.crown({c:[0,0.1,0],r:[o.w||0.3,0.12,o.d||0.3],n:o.n||20,size:o.size||0.3,seed:o.seed||4,cell:'grass',shell:0.2,flat:true},crown);
  }
  return {wood:wood,crown:crown};
};

/* ================= street signs ================= */
const signT={};
function sTex(kind){if(signT[kind]) return signT[kind];
  return signT[kind]=A.canvasTex(256,256,function(g){
    const C=128, red='#d1322c', blue='#1f5fb4', ring=function(fill,stroke,w){g.fillStyle=fill; g.beginPath(); g.arc(C,C,126,0,7); g.fill(); g.strokeStyle=stroke; g.lineWidth=w; g.beginPath(); g.arc(C,C,126-w/2,0,7); g.stroke(); g.strokeStyle='#e8e8e2'; g.lineWidth=3; g.beginPath(); g.arc(C,C,126,0,7); g.stroke();};
    const tri=function(down){g.fillStyle='#f4f4ee'; g.beginPath(); if(down){g.moveTo(4,14); g.lineTo(252,14); g.lineTo(C,240);} else {g.moveTo(C,14); g.lineTo(252,236); g.lineTo(4,236);} g.closePath(); g.fill();
      g.strokeStyle=red; g.lineWidth=22; g.lineJoin='round'; g.beginPath(); if(down){g.moveTo(24,26); g.lineTo(232,26); g.lineTo(C,216);} else {g.moveTo(C,36); g.lineTo(232,224); g.lineTo(24,224);} g.closePath(); g.stroke();};
    g.lineCap='round'; g.lineJoin='round';
    if(kind==='cross'){g.fillStyle=blue; g.fillRect(0,0,256,256); g.strokeStyle='#e8e8e2'; g.lineWidth=6; g.strokeRect(6,6,244,244);
      g.fillStyle='#fff'; g.beginPath(); g.moveTo(C,26); g.lineTo(236,218); g.lineTo(20,218); g.fill();
      g.fillStyle='#111'; g.beginPath(); g.arc(134,86,12,0,7); g.fill(); g.strokeStyle='#111'; g.lineWidth=13;
      g.beginPath(); g.moveTo(130,104); g.lineTo(122,148); g.lineTo(100,188); g.moveTo(122,148); g.lineTo(150,184); g.moveTo(128,112); g.lineTo(104,136); g.moveTo(128,112); g.lineTo(156,128); g.stroke();
      g.lineWidth=6; for(let i=0;i<5;i++){g.beginPath(); g.moveTo(56+i*32,206); g.lineTo(76+i*32,206); g.stroke();}}
    else if(kind==='nomoto'){ring('#fff',red,26); g.strokeStyle='#111'; g.fillStyle='#111'; g.lineWidth=9; g.beginPath(); g.arc(84,160,22,0,7); g.stroke(); g.beginPath(); g.arc(176,160,22,0,7); g.stroke();
      g.lineWidth=11; g.beginPath(); g.moveTo(84,160); g.lineTo(116,124); g.lineTo(156,124); g.lineTo(176,160); g.moveTo(116,124); g.lineTo(128,160); g.moveTo(156,124); g.lineTo(168,100); g.lineTo(184,100); g.stroke(); g.beginPath(); g.arc(132,92,12,0,7); g.fill();}
    else if(kind==='noentry'){g.fillStyle=red; g.beginPath(); g.arc(C,C,126,0,7); g.fill(); g.fillStyle='#fff'; g.fillRect(36,108,184,40);}
    else if(kind==='nopark'||kind==='nostop'){ring(blue,red,26); g.strokeStyle=red; g.lineWidth=24; g.beginPath(); g.moveTo(52,52); g.lineTo(204,204); if(kind==='nostop'){g.moveTo(204,52); g.lineTo(52,204);} g.stroke();}
    else if(kind==='stop'){g.fillStyle='#e8e8e2'; g.beginPath(); for(let i=0;i<8;i++){const a=R/8+i*R/4; g.lineTo(C+Math.cos(a)*128,C+Math.sin(a)*128);} g.fill();
      g.fillStyle=red; g.beginPath(); for(let i=0;i<8;i++){const a=R/8+i*R/4; g.lineTo(C+Math.cos(a)*118,C+Math.sin(a)*118);} g.fill();
      g.fillStyle='#fff'; g.font='bold 76px sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('עצור',C,C+4);}
    else if(kind==='yield') tri(true);
    else if(kind==='bump'){tri(false); g.fillStyle='#111'; g.beginPath(); g.moveTo(56,196); g.quadraticCurveTo(C,110,200,196); g.fill(); g.fillRect(40,192,176,8);}
    else if(kind==='kids'){tri(false); g.fillStyle='#111'; [[108,118,1],[152,132,0.82]].forEach(function(q){const x=q[0], y=q[1], k=q[2]; g.beginPath(); g.arc(x,y,11*k,0,7); g.fill(); g.lineWidth=11*k; g.strokeStyle='#111';
      g.beginPath(); g.moveTo(x,y+14*k); g.lineTo(x-4*k,y+52*k); g.lineTo(x-18*k,y+80*k); g.moveTo(x-4*k,y+52*k); g.lineTo(x+14*k,y+80*k); g.moveTo(x,y+22*k); g.lineTo(x+20*k,y+38*k); g.moveTo(x,y+22*k); g.lineTo(x-20*k,y+36*k); g.stroke();});}
    else if(kind==='oneway'){g.fillStyle=blue; g.fillRect(0,0,256,256); g.strokeStyle='#e8e8e2'; g.lineWidth=6; g.strokeRect(6,6,244,244); g.fillStyle='#fff'; g.beginPath(); g.moveTo(30,110); g.lineTo(160,110); g.lineTo(160,70); g.lineTo(228,128); g.lineTo(160,186); g.lineTo(160,146); g.lineTo(30,146); g.fill();}
    else if(kind==='park'){g.fillStyle=blue; g.fillRect(0,0,256,256); g.strokeStyle='#e8e8e2'; g.lineWidth=6; g.strokeRect(6,6,244,244); g.fillStyle='#fff'; g.font='bold 170px sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('P',C,C+10);}
    else if(kind==='bus'){g.fillStyle='#f2c81e'; g.fillRect(0,0,256,256); g.fillStyle='#111'; g.fillRect(50,60,156,100); g.fillStyle='#f2c81e'; g.fillRect(62,72,60,40); g.fillRect(134,72,60,40); g.fillStyle='#111'; g.beginPath(); g.arc(84,170,16,0,7); g.arc(172,170,16,0,7); g.fill();
      g.font='bold 34px sans-serif'; g.textAlign='center'; g.fillText('תחנה',C,232);}
  });}
const sGeo={};
function signGeo(shape,w,h){const k=shape+w+'x'+h; if(sGeo[k]) return sGeo[k];
  let g; if(shape==='round') g=new THREE.CircleGeometry(w/2,32);
  else if(shape==='oct'){const s=new THREE.Shape(); for(let i=0;i<8;i++){const a=R/8+i*R/4, x=Math.cos(a)*w/2, y=Math.sin(a)*w/2; if(i) s.lineTo(x,y); else s.moveTo(x,y);} g=new THREE.ShapeGeometry(s);}
  else if(shape==='tri'||shape==='tridown'){const s=new THREE.Shape(), d=shape==='tridown'?-1:1; s.moveTo(0,d*w*0.44); s.lineTo(w/2,-d*w*0.43); s.lineTo(-w/2,-d*w*0.43); s.closePath(); g=new THREE.ShapeGeometry(s);}
  else g=new THREE.PlaneGeometry(w,h);
  const p=g.attributes.position, uv=g.attributes.uv; for(let i=0;i<p.count;i++) uv.setXY(i,p.getX(i)/w+0.5,p.getY(i)/(h||w)+0.5);
  return sGeo[k]=g;}
const SHAPE={cross:'sq',nomoto:'round',noentry:'round',nopark:'round',nostop:'round',stop:'oct',yield:'tridown',bump:'tri',kids:'tri',oneway:'sq',park:'sq',bus:'sq'};
const sMats={};
function sMat(kind){return sMats[kind]||(sMats[kind]=mat(sTex(kind)));}
det.signTex=sTex;
/* a sign plate on its own, facing +z, centred at the origin, with a grey back */
det.plate=function(kind,w,p,x,y,z){const g=P.grp(x,y,z,p), sh=SHAPE[kind]||'sq';
  mk(signGeo(sh,w,w),sMat(kind),0,0,0.004,g); const b=mk(signGeo(sh,w,w),0x9aa0a2,0,0,0,g); b.rotation.y=R;
  P.box(0.07,0.03,0.03,0x8a8f92,0,w*0.28,-0.02,g); P.box(0.07,0.03,0.03,0x8a8f92,0,-w*0.28,-0.02,g); return g;};
/* a pole with one or more signs, from the top down. list: [kind, size] or a texture plate {t: texture, w, h} */
det.sign=function(list,o){o=o||{}; const g=P.grp(), h=o.h||2.9, pc=o.pole||0x9aa0a2;
  if(o.stripes){P.cyl(0.035,h,o.stripes,0,h/2,0,g,12);} else P.cyl(0.035,h,pc,0,h/2,0,g,12);
  P.cyl(0.04,0.02,0x6d7174,0,h+0.01,0,g,12); P.cyl(0.06,0.06,0x8a8f92,0,0.03,0,g,12);                       // cap and footing
  let y=h-0.05;
  list.forEach(function(it){
    if(it.t){const ww=it.w, hh=it.h; y-=hh/2; P.plane(ww,hh,it.t.isMaterial?it.t:mat(it.t),0,y,0.045,g); P.box(ww,hh,0.012,0x9aa0a2,0,y,0.036,g); y-=hh/2+0.05; return;}
    const kind=it[0], w=it[1]||0.6, hh=SHAPE[kind]==='tri'||SHAPE[kind]==='tridown'?w*0.87:w; y-=hh/2; det.plate(kind,w,g,0,y,0.05); y-=hh/2+0.06;});
  return g;};
/* the street-name sign: Hebrew above, English below, in white on blue, on a pole or a wall */
det.streetSign=function(he,en,num){return mat(A.canvasTex(256,96,function(g){g.fillStyle='#1d4f9c'; g.fillRect(0,0,256,96); g.strokeStyle='#f2f2ec'; g.lineWidth=4; g.strokeRect(5,5,246,86);
  g.fillStyle='#fff'; g.textAlign='center'; g.font='bold 40px sans-serif'; g.fillText(he,num?110:128,48); g.font='bold 20px sans-serif'; g.fillText(en,num?110:128,78);
  if(num){g.fillStyle='#fff'; g.fillRect(200,14,46,68); g.fillStyle='#1d4f9c'; g.font='bold 36px sans-serif'; g.fillText(num,223,62);}}));};

/* ================= building fronts ================= */
const plasters={};
det.plasterM=function(c,kind){const k=c+(kind||''); if(plasters[k]) return plasters[k];
  const t=tex(256,256,function(g){const r=A.rng(c%997); g.fillStyle=c; g.fillRect(0,0,256,256);
    if(kind==='stone'){                                        // Jerusalem-stone cladding in courses
      for(let y=0;y<256;y+=32){let x=-(y/32%2)*40; while(x<256){const w=50+r()*50, v=Math.floor(r()*18)-9; g.fillStyle='rgba('+(v>0?'255,250,235':'90,80,60')+','+Math.abs(v)/60+')'; g.fillRect(x+1,y+1,w-2,30);
        for(let i=0;i<14;i++){g.fillStyle='rgba(120,105,80,'+(0.05+r()*0.1)+')'; g.fillRect(x+r()*w,y+r()*30,1+r()*2,1+r()*2);} x+=w;}
        g.fillStyle='rgba(150,138,115,0.7)'; g.fillRect(0,y,256,1.5);}
      for(let y=0;y<256;y+=32){let x=-(y/32%2)*40; r(); while(x<256){x+=50+r()*50; g.fillStyle='rgba(150,138,115,0.7)'; g.fillRect(x,y,1.5,32);}}}
    else{for(let i=0;i<2600;i++){g.fillStyle='rgba('+(r()>0.5?'255,255,255':'0,0,0')+','+(r()*0.05)+')'; g.fillRect(r()*256,r()*256,1+r()*2,1+r()*2);}
      for(let i=0;i<10;i++){const x=r()*256; const gr=g.createLinearGradient(0,0,0,256); gr.addColorStop(0,'rgba(80,70,55,0.12)'); gr.addColorStop(1,'rgba(80,70,55,0)'); g.fillStyle=gr; g.fillRect(x,r()*120,3+r()*6,80+r()*120);}}   // streaks of grime
  },true);
  return plasters[k]=mat(t);};
function wallGeo(w,h,u){const g=new THREE.PlaneGeometry(w,h), uv=g.attributes.uv; for(let i=0;i<uv.count;i++) uv.setXY(i,uv.getX(i)*w/(u||3),uv.getY(i)*h/(u||3)); g.translate(w/2,h/2,0); return g;}
det.wallGeo=wallGeo;
const slats={};
function slatM(c){return slats[c]||(slats[c]=mat(tex(32,64,function(g){g.fillStyle=c; g.fillRect(0,0,32,64); for(let y=0;y<64;y+=4){g.fillStyle='rgba(0,0,0,0.16)'; g.fillRect(0,y+3,32,1); g.fillStyle='rgba(255,255,255,0.25)'; g.fillRect(0,y,32,1);}},true)));}
function slatGeo(w,h){const g=new THREE.PlaneGeometry(w,h), uv=g.attributes.uv; for(let i=0;i<uv.count;i++) uv.setXY(i,uv.getX(i)*w/0.3,uv.getY(i)*h/0.3); return g;}
let glassD, glassL=[];
function glassM(lit){
  if(!glassD) glassD=new THREE.MeshLambertMaterial({color:0x34444f,emissive:0x0a0f12});
  if(!lit) return glassD;
  if(!glassL[lit-1]){const m=A.lampMat('L:street',0x3a4852,[0xffd9a0,0xfff0d0,0xcfe0ff][lit-1],[0.75,0.6,0.5][lit-1]); m.userData.regd=true; glassL[lit-1]=m;}
  return glassL[lit-1];}
const CLOTH=[0xd84a4a,0xf2f2ee,0x3a62b0,0xf0c84a,0x6aa86a,0x2b2d30,0xe58ab0,0x9fc4d6];
/* one window in a wall facing +z: a reveal, a frame, glass, a roller shutter part way down, its box above, a sill */
det.window=function(p,x,y,w,h,o){o=o||{}; const g=P.grp(x,y,0,p), fr=o.frame||0xe8e8e2, r=o.rng||Math.random, wall=o.wall||0xddd5c3;
  [[-w/2-0.04,h/2,0.08,h+0.08],[w/2+0.04,h/2,0.08,h+0.08]].forEach(function(q){P.box(q[2],q[3],0.12,wall,q[0],q[1],0.06,g);}); P.box(w+0.16,0.08,0.12,wall,0,h+0.04,0.06,g);
  P.box(w+0.2,0.04,0.2,o.sill||0xc9c2b1,0,-0.02,0.1,g);                                                            // sill
  P.box(w,0.04,0.05,fr,0,0.02,0.03,g); P.box(w,0.04,0.05,fr,0,h-0.02,0.03,g); P.box(0.04,h,0.05,fr,-w/2+0.02,h/2,0.03,g); P.box(0.04,h,0.05,fr,w/2-0.02,h/2,0.03,g);
  const lit=o.lit==null?(r()<0.3?1+Math.floor(r()*3):0):o.lit, down=o.down==null?(r()<0.35?1:r()<0.5?0.1+r()*0.5:0):o.down;
  P.geo(new THREE.PlaneGeometry(w-0.06,h-0.06),glassM(lit),0,h/2,0.012,g); if(w>0.9) P.box(0.04,h,0.04,fr,0,h/2,0.035,g);       // the panes, sliding in two halves
  if(o.curtain!==false&&r()<0.5) P.geo(new THREE.PlaneGeometry(w*0.4,h*0.85),[0xf3efe4,0xe9dcc0,0xd8e0e6][Math.floor(r()*3)],-w*0.22,h*0.5,0.016,g);
  if(down>0){const sh=P.geo(slatGeo(w-0.04,h*down),slatM(o.shutter||'#f1efe9'),0,h-h*down/2,0.045,g);}
  P.box(w+0.08,0.2,0.18,o.shutBox||fr,0,h+0.12,0.08,g);                                                            // the shutter box
  if(o.bars){for(let bx=-w/2+0.08;bx<w/2;bx+=0.12) P.box(0.018,h,0.018,0xe9e8e1,bx,h/2,0.13,g); [0.1,h/2,h-0.08].forEach(function(by){P.box(w+0.04,0.025,0.025,0xe9e8e1,0,by,0.13,g);});}
  if(o.ac){const a=det.ac({brand:['electra','tadiran','haier','plain'][Math.floor(r()*4)],bracket:true,up:0.3,drain:0.6}); a.position.set(w*0.2,-0.95,0); a.scale.setScalar(0.92); g.add(a);}
  if(o.box){P.box(w*0.9,0.18,0.22,0x8a5a3c,0,0.05,0.24,g); const pl=det.tree('shrub',{w:w*0.85,h:0.35,d:0.2,seed:Math.floor(r()*99),flowers:r()<0.5}); pl.crown.position.set(0,0.12,0.24); g.add(pl.crown);}
  return g;};
/* the whole of a block: its volume, its fronts with all they carry, its roof. Frame: x along the front (0..sx), z from the front (0) back (-sz), y up.
   o: floors, fh (floor height), faces: {front:{...}, back, left, right} each with ground ('pilotis','shops','flats','plain'), bays, balconies */
det.block=function(o){
  const g=P.grp(), sx=o.sx, sz=o.sz, n=o.floors||4, fh=o.fh||2.9, g0=o.ground==null?3.0:o.ground, H=g0+(n-1)*fh, r=A.rng(o.seed||11), wall=o.wall||0xddd5c3, wM=det.plasterM('#'+wall.toString(16).padStart(6,'0'),o.stone?'stone':null);
  const faces=[['front',0,0,0,sx],['right',sx,0,R/2,sz],['back',sx,-sz,R,sx],['left',0,-sz,-R/2,sz]];
  faces.forEach(function(F){const f=o.faces&&o.faces[F[0]], len=F[4], fg=P.grp(F[1],0,F[2],g,F[3]);
    const y0=f&&f.ground==='pilotis'?g0-0.3:0; mk(wallGeo(len,H+0.9-y0),wM,0,y0,0,fg);                                      // the wall, up to the parapet
    P.box(len+0.04,0.12,0.14,0xcfc8b6,len/2,H+0.9,0.02,fg);                                                                 // coping
    if(!(f&&f.ground==='pilotis')) P.box(len,0.45,0.04,0xb9b1a0,len/2,0.22,0.02,fg);                                         // plinth
    if(!f) return;
    const nb=f.bays||Math.max(1,Math.round(len/3.4)), bw=len/nb, rr=A.rng((o.seed||11)*7+F[0].length);
    /* ground floor */
    if(f.ground==='pilotis'){const Zr=-2.6;                                                                            // the floors stand on columns over an open, shaded ground floor
      P.box(len,0.3,0.5,0xd9d2c0,len/2,g0-0.15,-0.2,fg); P.geo(wallGeo(len,-Zr,3),det.plasterM('#a8a294'),0,g0-0.3,Zr,fg).rotation.x=R/2;
      mk(wallGeo(len,g0-0.3),det.plasterM('#bdb6a6'),0,0,Zr,fg);
      for(let i=0;i<=nb;i++) P.box(0.36,g0-0.3,0.36,0xe2dccd,Math.min(len-0.2,Math.max(0.2,i*bw)),(g0-0.3)/2,-0.25,fg);
      const ex=bw*Math.floor(nb/2)+bw/2;                                                                                     // the entrance: a glass door, mailboxes, an intercom, the house number
      P.box(1.6,2.3,0.06,0x2b3036,ex,1.15,Zr+0.03,fg); P.geo(new THREE.PlaneGeometry(1.4,2.1),glassM(1),ex,1.1,Zr+0.07,fg); P.box(0.04,0.3,0.06,0xc9cdd0,ex+0.5,1.05,Zr+0.1,fg);
      det.mailboxes(fg,ex-1.75,0.9,Zr,6+Math.floor(rr()*6));
      P.box(0.16,0.26,0.04,0xb8bcbe,ex+1.0,1.35,Zr+0.03,fg); P.plane(0.3,0.3,det.numberM(o.number||String(2+Math.floor(r()*20))),bw*0.5,g0-0.75,0.02,fg);
      if(rr()<0.8){const m=det.moto(['scooter','sport','covered'][Math.floor(rr()*3)],{color:[0xb8bcbe,0x2b2e31,0xc23a34][Math.floor(rr()*3)],plate:String(10+Math.floor(rr()*89))+'-'+String(100+Math.floor(rr()*899))}); m.position.set(bw*0.5,0,-1.3); m.rotation.y=R/2+0.1; fg.add(m);}
      if(rr()<0.6){const b=det.bike(rr()<0.5?'city':'mtb',{color:[0x9fd3c0,0x2b2d30,0xc23a34,0xf2f2ee][Math.floor(rr()*4)]}); b.position.set(len-bw*0.5,0,Zr+0.35); b.rotation.y=-R/2; fg.add(b);}
      for(let i=0;i<nb;i++) if(i!==Math.floor(nb/2)&&rr()<0.6){const a=det.ac({brand:'plain'}); a.position.set(i*bw+bw/2,0.1,Zr); a.scale.setScalar(0.9); fg.add(a);}
    }else if(f.ground==='shops'){
      for(let i=0;i<nb;i++){const x0=i*bw+0.15, w=bw-0.3, kind=f.shops?f.shops[i%f.shops.length]:null;
        P.box(w+0.1,2.9,0.06,0x8e9497,x0+w/2,1.45,0.04,fg); P.geo(new THREE.PlaneGeometry(w-0.1,2.1),glassM(r()<0.5?1:0),x0+w/2,1.15,0.08,fg);
        for(let k=1;k<3;k++) P.box(0.05,2.1,0.05,0xb0b6ba,x0+k*w/3,1.15,0.1,fg);
        P.box(w+0.1,0.34,0.24,0x6b7074,x0+w/2,2.55,0.14,fg);                                                                // the security shutter's box
        if(r()<0.3) P.geo(slatGeo(w-0.1,1.2),slatM('#9aa0a4'),x0+w/2,1.85,0.12,fg);                                        // pulled half down
        if(kind) P.plane(w*0.9,0.5,det.shopM(kind),x0+w/2,2.95,0.1,fg);
        if(kind&&f.awnings!==false&&r()<0.7){const aw=det.awningM(i); const a=P.geo(new THREE.PlaneGeometry(w,1.0),aw,x0+w/2,2.55,0.55,fg); a.rotation.x=-1.0; P.box(w,0.18,0.02,0xe8e2d0,x0+w/2,2.25,0.96,fg);}}
    }else if(f.ground==='flats'){
      for(let i=0;i<nb;i++) det.window(fg,i*bw+bw/2,0.95,Math.min(1.4,bw*0.5),1.3,{rng:rr,wall:wall,bars:rr()<0.7,ac:rr()<0.3});
    }
    /* the floors above */
    for(let fl=1;fl<n;fl++){const y=g0+(fl-1)*fh; if(fl<(f.minFloor||1)) continue;
      P.box(len,0.05,0.04,0xcfc8b6,len/2,y-0.02,0.03,fg);                                                                 // a line at each floor
      for(let i=0;i<nb;i++){const xc=i*bw+bw/2, kind=f.balc?(f.balc[(i+fl*3)%f.balc.length]):(rr()<0.35?'closed':rr()<0.4?'open':'win');
        if(f.stair!=null&&i===f.stair){for(let k=0;k<6;k++) for(let j=0;j<3;j++) P.box(0.18,0.18,0.06,0xe8e6de,xc-0.2+j*0.2,y+0.5+k*0.24,0.04,fg); continue;}   // ventilation blocks up the stairwell
        if(kind==='win'){det.window(fg,xc,y+0.95,Math.min(1.5,bw*0.48),1.35,{rng:rr,wall:wall,ac:rr()<0.55,box:rr()<0.12,bars:fl===1&&rr()<0.5});
          if(rr()<0.5) det.window(fg,xc+bw*0.36,y+1.5,0.5,0.6,{rng:rr,wall:wall,down:0,curtain:false});}                    // and a small bathroom window beside it
        else{const bd=1.15, w=bw-0.25;                                                                                    // a balcony on its slab
          P.box(w,0.16,bd,0xe2dccd,xc,y-0.08,bd/2,fg); P.box(w,0.05,0.04,0xc9c2b1,xc,y-0.16,bd,fg);
          mk(wallGeo(w,1.0,3),wM,xc-w/2,y,bd-0.02,fg);                                                                      // its parapet, the same render
          P.box(0.1,1.0,bd,wall,xc-w/2+0.05,y+0.5,bd/2,fg); P.box(0.1,1.0,bd,wall,xc+w/2-0.05,y+0.5,bd/2,fg); P.box(w,0.06,0.14,0xcfc8b6,xc,y+1.02,bd-0.04,fg);
          if(kind==='closed'){                                                                                           // closed in: aluminium sliding panes on the parapet, shutters behind some
            const ph=fh-1.25, np=Math.max(2,Math.round(w/0.9)), pw=w/np, alu=rr()<0.5?0xd9dbdc:0x8a8f92;
            P.box(w,0.05,0.08,alu,xc,y+1.06,bd-0.06,fg); P.box(w,0.06,0.08,alu,xc,y+fh-0.2,bd-0.06,fg);
            for(let k=0;k<np;k++){const px=xc-w/2+pw*(k+0.5); P.box(0.04,ph,0.06,alu,px-pw/2+0.02,y+1.06+ph/2,bd-0.06+(k%2)*0.03,fg);
              P.geo(new THREE.PlaneGeometry(pw-0.05,ph-0.05),glassM(rr()<0.25?1+Math.floor(rr()*3):0),px,y+1.06+ph/2,bd-0.08+(k%2)*0.03,fg);
              const dn=rr(); if(dn<0.45) P.geo(slatGeo(pw-0.04,ph*(dn<0.2?1:0.5)),slatM(['#f1efe9','#d9d2c0','#c9cdd0'][k%3]),px,y+fh-0.23-ph*(dn<0.2?1:0.5)/2,bd-0.04,fg);}
            P.box(w+0.04,0.06,bd+0.08,0xcfc8b6,xc,y+fh-0.15,bd/2,fg);
            if(rr()<0.5){const a=det.ac({brand:'electra',bracket:true}); a.position.set(xc+w*0.25,y+0.25,bd+0.02); a.scale.setScalar(0.85); fg.add(a);}
          }else{                                                                                                         // open: a railing on the parapet, a door behind, plants, washing
            for(let bx=xc-w/2+0.12;bx<xc+w/2-0.08;bx+=0.11) P.box(0.014,0.3,0.014,0x2b2d2f,bx,y+1.2,bd-0.05,fg); P.box(w,0.03,0.03,0x2b2d2f,xc,y+1.36,bd-0.05,fg);
            det.window(fg,xc,y+0.02,Math.min(1.8,w*0.7),2.15,{rng:rr,wall:wall,curtain:true});
            if(rr()<0.7) for(let k=0;k<1+Math.floor(rr()*3);k++){const px=xc-w/2+0.3+rr()*(w-0.6); P.cyl(0.13,0.26,[0xb5683a,0xe8e4d8,0x3d5a50][k%3],px,y+0.13,bd-0.3,fg,10,0.16);
              const pl=det.tree('shrub',{w:0.42,h:0.5,d:0.42,seed:Math.floor(rr()*99),flowers:rr()<0.3}); pl.crown.position.set(px,y+0.24,bd-0.3); fg.add(pl.crown);}
            if(rr()<0.55){const ly=y+fh-0.45; P.bar([xc-w/2+0.1,ly,bd-0.2],[xc+w/2-0.1,ly,bd-0.2],0.004,0xd8d8d2,fg);                    // a washing line with the washing on it
              for(let k=0;k<4+Math.floor(rr()*4);k++){const cx=xc-w/2+0.25+k*0.3; if(cx>xc+w/2-0.2) break; const cw=0.18+rr()*0.15, chh=0.25+rr()*0.35;
                const c=P.geo(new THREE.PlaneGeometry(cw,chh),CLOTH[Math.floor(rr()*CLOTH.length)],cx,ly-chh/2,bd-0.2,fg); c.rotation.y=(rr()-0.5)*0.4;
                const c2=P.geo(new THREE.PlaneGeometry(cw,chh),CLOTH[Math.floor(rr()*CLOTH.length)],cx,ly-chh/2,bd-0.2,fg); c2.rotation.y=c.rotation.y+R; c2.userData.key=c.userData.key;}}
            if(rr()<0.4){const ch=P.grp(xc+w*0.25,y,bd-0.55,fg,rr()*3); P.box(0.42,0.04,0.42,0xf2f2ef,0,0.44,0,ch); P.box(0.42,0.4,0.04,0xf2f2ef,0,0.66,-0.2,ch); [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){P.box(0.03,0.44,0.03,0xe2e2de,q[0]*0.18,0.22,q[1]*0.18,ch);});}
            if(rr()<0.25){const a=det.ac({brand:'plain',pipes:false}); a.position.set(xc-w*0.3,y,0.15); a.scale.setScalar(0.85); fg.add(a);}
          }}
      }
    }
    if(f.pipes!==false) for(let k=0;k<(f.pipes||1);k++){const px=k===0?0.25:len-0.25; P.cyl(0.05,H+0.8,0x9aa0a2,px,(H+0.8)/2,0.08,fg,8); for(let y=0.6;y<H;y+=1.6) P.box(0.14,0.04,0.06,0x7d8285,px,y,0.06,fg);}   // drain pipes in their clamps
    if(f.cables) for(let k=0;k<4;k++) P.cyl(0.008,H,[0x1d1f21,0xf2f2ef,0x2b2d2f,0xd8d8d2][k],0.5+k*0.025,H/2,0.03,fg,4);
  });
  /* the roof: a parapet round a flat roof, the water heaters on their frames, aerials, a dish, the stair hut */
  P.geo(wallGeo(sx,sz,4),det.plasterM('#8f8a80'),0,H,0,g).rotation.x=-R/2;
  const rf=P.grp(0,H,0,g); [[0.06,-sz/2,0.12,sz],[sx-0.06,-sz/2,0.12,sz]].forEach(function(q){P.box(q[2],0.9,q[3],wall,q[0],0.45,q[1],rf);}); P.box(sx,0.9,0.12,wall,sx/2,0.45,-sz+0.06,rf);
  P.box(2.4,2.3,2.6,wall,sx*0.5,1.15,-sz*0.5,rf); P.box(0.9,2.0,0.04,0x6a6f72,sx*0.5,1.0,-sz*0.5+1.31,rf);
  const nh=o.heaters==null?Math.max(2,Math.round(sx/3.2)):o.heaters;
  for(let i=0;i<nh;i++){const hx=0.9+i*(sx-1.8)/Math.max(1,nh-1), hz=-0.9-(i%2)*1.6, hg=P.grp(hx,0,hz,rf,R);
    if(Math.abs(hx-sx*0.5)<1.7&&Math.abs(hz+sz*0.5)<1.9) continue;
    det.solar(hg,r);}
  for(let i=0;i<(o.aerials==null?2:o.aerials);i++){const ax=1.2+r()*(sx-2.4), az=-0.5-r()*(sz-1); P.cyl(0.02,2.4,0x9aa0a2,ax,1.2,az,rf,6);
    for(let k=0;k<6;k++) P.box(k%2?0.9:0.7,0.012,0.012,0xa9aeb2,ax,2.0+k*0.07,az+(k-3)*0.12,rf); P.box(0.012,0.012,0.8,0xa9aeb2,ax,2.18,az,rf);}
  if(r()<0.8){const d=P.grp(sx*0.2+r()*sx*0.6,0.9,-0.4,rf,R); P.cyl(0.03,0.5,0x9aa0a2,0,-0.2,0,d,6); const dish=P.sph(0.36,0xe9e9e4,0,0.2,0.05,d,1,1,0.32,16,8); dish.rotation.x=0.5; P.bar([0,0.2,0.2],[0,0.12,0.55],0.01,0x6d7174,d);}
  return g;};
/* a solar water heater, as on every roof here: two dark collectors leaning to the south, a white tank across above them */
det.solar=function(p,r){const g=P.grp(0,0,0,p), fr=0x9aa0a2, blue=0x23314a, a=0.6;
  [-0.55,0.55].forEach(function(x){const pg=P.grp(x,0.25,0,g); pg.rotation.x=-a; P.box(1.0,0.06,2.0,fr,0,0,0,pg); P.box(0.94,0.065,1.94,blue,0,0.003,0,pg); for(let k=0;k<8;k++) P.box(0.01,0.067,1.9,0x4a5a70,-0.42+k*0.12,0.003,0,pg);});
  P.cyl(0.28,1.5,0xf1f1ec,0,1.35,-0.95,g,16).rotation.z=R/2; P.cyl(0.285,0.04,0xd8d8d2,0.74,1.35,-0.95,g,16).rotation.z=R/2; P.cyl(0.285,0.04,0xd8d8d2,-0.74,1.35,-0.95,g,16).rotation.z=R/2;
  [-0.6,0.6].forEach(function(x){P.bar([x,0,-1.2],[x,1.1,-1.2],0.02,fr,g); P.bar([x,0,-0.7],[x,1.1,-0.7],0.02,fr,g); P.bar([x,0,0.8],[x,0.9,-0.75],0.02,fr,g);});
  P.bar([0.3,1.1,-0.95],[0.45,0.9,-0.2],0.015,0x2b2d2f,g); P.bar([-0.3,1.1,-0.95],[-0.45,0.4,0.6],0.015,0x2b2d2f,g);
  if(r&&r()<0.5) P.box(0.3,0.2,0.2,0xe8e8e4,0.7,1.6,-0.95,g);
  return g;};
const nums={};
det.numberM=function(n){return nums[n]||(nums[n]=mat(tex(64,64,function(g){g.fillStyle='#1f7a4a'; g.fillRect(0,0,64,64); g.strokeStyle='#fff'; g.lineWidth=3; g.strokeRect(4,4,56,56); g.fillStyle='#fff'; g.font='bold 32px sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(n,32,34);})));};
const shops={};
det.shopM=function(kind){if(shops[kind]) return shops[kind];
  const S={kiosk:['#c8202a','#fff','קיוסק','24/7'],grocery:['#2a7a3a','#fff','מכולת השכונה','פירות • ירקות • מעדניה'],barber:['#1d2a4a','#f2d33a','מספרת אבי','גברים • ילדים'],falafel:['#f0c020','#7a2a10','פלאפל הראה','פלאפל • סביח • צ׳יפס'],
    pharm:['#1f8a5a','#fff','בית מרקחת','Pharmacy'],cafe:['#2c5a43','#f4f2ea','בית קפה','קפה • מאפים • ארוחות בוקר'],laundry:['#2a6fb4','#fff','מכבסה','ניקוי יבש • גיהוץ'],flowers:['#f4e9ee','#a3145f','פרחים','זרים • עציצים'],bakery:['#f2e2c2','#7a4a20','מאפייה','לחם • בורקס • עוגות']}[kind]||['#444','#fff',kind,''];
  return shops[kind]=mat(tex(256,64,function(g){g.fillStyle=S[0]; g.fillRect(0,0,256,64); g.fillStyle=S[1]; g.textAlign='center'; g.font='bold 30px sans-serif'; g.fillText(S[2],128,32); g.font='14px sans-serif'; g.fillText(S[3],128,54);}));};
const awns={};
det.awningM=function(i){const c=[['#2c5a43','#f4f2ea'],['#b8322c','#f4f2ea'],['#1f4f8a','#f4f2ea'],['#d98a2b','#f4f2ea']][i%4];
  return awns[i%4]||(awns[i%4]=(function(){const t=tex(64,16,function(g){for(let x=0;x<64;x+=8){g.fillStyle=c[(x/8)%2]; g.fillRect(x,0,8,16);}},true); t.repeat.set(3,1); return mat(t);})());};

/* ================= the small things of the street ================= */
/* a bank of letterboxes on a wall facing +z, its left edge at x: n of them, three rows, each with its little name card */
det.mailboxes=function(p,x,y,z,n,o){o=o||{}; const g=P.grp(x,y,z,p), cols=Math.ceil(n/3), w=0.32, h=0.26, c=o.color||0x9aa0a4, r=A.rng(n*31);
  P.box(cols*w+0.06,3*h+0.06,0.3,o.frame||0x6d7174,cols*w/2,1.5*h,0.15,g);
  for(let i=0;i<n;i++){const cx=(i%cols)*w+w/2, cy=(2-Math.floor(i/cols))*h+h/2;
    P.box(w-0.02,h-0.02,0.02,c,cx,cy,0.31,g); P.box(w*0.6,0.018,0.01,0x2b2d2f,cx,cy+h*0.28,0.325,g);                          // door and its slot
    P.box(0.08,0.035,0.008,[0xf6f4ee,0xf2d33a,0xffffff][Math.floor(r()*3)],cx-w*0.25,cy-h*0.15,0.324,g); P.cyl(0.012,0.02,0xc9cdd0,cx+w*0.32,cy,0.33,g,8).rotation.x=R/2;
    if(r()<0.25) P.box(0.12,0.05,0.004,[0xe8d8a8,0xf6f4ee,0xd8e8f4][Math.floor(r()*3)],cx,cy+h*0.32,0.335,g).rotation.z=(r()-0.5)*0.3;}   // a letter left sticking out
  return g;};
/* a manhole cover in the pavement, its word cast round the rim */
const covers={};
det.coverM=function(word){return covers[word]||(covers[word]=mat(tex(128,128,function(g){g.fillStyle='#4a4846'; g.beginPath(); g.arc(64,64,63,0,7); g.fill(); g.strokeStyle='#5f5c58'; g.lineWidth=3;
  for(let r2=12;r2<56;r2+=10){g.beginPath(); g.arc(64,64,r2,0,7); g.stroke();} for(let a=0;a<12;a++){g.beginPath(); g.moveTo(64,64); g.lineTo(64+Math.cos(a*0.52)*56,64+Math.sin(a*0.52)*56); g.stroke();}
  g.fillStyle='#4a4846'; g.fillRect(28,52,72,24); g.fillStyle='#77736c'; g.font='bold 20px sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(word,64,65);})));};
det.manhole=function(word,r){const g=P.grp(); P.disc(r||0.32,det.coverM(word),0,0.004,0,g).rotation.x=-R/2; return g;};
const gratesM=mat(tex(64,32,function(g){g.fillStyle='#2b2a28'; g.fillRect(0,0,64,32); g.fillStyle='#55524d'; for(let x=2;x<64;x+=6) g.fillRect(x,2,3,28); g.fillRect(0,0,64,2); g.fillRect(0,30,64,2);}));
det.drain=function(w){const g=P.grp(); P.geo(new THREE.PlaneGeometry(w||0.7,0.32),gratesM,0,0.004,0,g).rotation.x=-R/2; return g;};
/* a fire hydrant: a red standpipe with its yellow cap */
det.hydrant=function(){const g=P.grp(); P.cyl(0.11,0.5,0xc8202a,0,0.25,0,g,14); P.cyl(0.13,0.05,0xa81a22,0,0.52,0,g,14); P.sph(0.1,0xe8c21e,0,0.56,0,g,1,0.7,1);
  [-1,1].forEach(function(s){P.cyl(0.05,0.12,0xc8202a,s*0.14,0.36,0,g,10).rotation.z=R/2; P.cyl(0.055,0.03,0xe8c21e,s*0.2,0.36,0,g,10).rotation.z=R/2;}); P.cyl(0.14,0.04,0x8a8f92,0,0.02,0,g,14); return g;};
/* the big green bin on wheels that every building puts out, its lid slightly open */
det.bin=function(o){o=o||{}; const g=P.grp(), c=o.color||0x2f6b3f, big=o.big;
  const w=big?1.3:0.6, d=big?0.95:0.72, h=big?1.15:1.0;
  P.rbox(w,h-0.1,d,c,0,0.08+(h-0.1)/2,0,g,0.04,0.06); P.rbox(w+0.06,0.06,d+0.06,c,0,h,0,g,0.02,0.04);
  const lid=P.grp(0,h+0.02,-d/2,g); lid.rotation.x=-(o.open||0.08); P.rbox(w+0.08,0.05,d+0.1,o.lid||c,0,0,d/2+0.02,lid,0.02,0.04); P.box(w*0.5,0.04,0.06,0x1d1f21,0,0.02,d+0.06,lid);
  [-1,1].forEach(function(s){const wh=P.cyl(0.08,0.05,0x1d1f21,s*(w/2-0.1),0.08,-d/2+0.08,g,12); wh.rotation.z=R/2;});
  if(big) [-1,1].forEach(function(s){P.cyl(0.05,0.05,0x1d1f21,s*(w/2-0.1),0.05,d/2-0.1,g,10).rotation.z=R/2;});
  P.box(w*0.3,0.08,0.01,0xf2f2ee,0,h*0.7,d/2+0.003,g);
  return g;};
/* a cat, sitting or lying, curled tail. c: coat colour; o.lie */
det.cat=function(c,o){o=o||{}; const g=P.grp(), c2=new THREE.Color(c).multiplyScalar(0.8).getHex();
  if(o.lie){P.sph(0.12,c,0,0.08,0,g,1.0,0.6,1.6); P.sph(0.065,c,0,0.12,0.2,g); [-1,1].forEach(function(s){P.geo(new THREE.ConeGeometry(0.025,0.05,4),c2,s*0.035,0.18,0.21,g);});
    P.tube([[0,0.06,-0.18],[0.12,0.04,-0.22],[0.16,0.04,-0.05]],0.02,c,g);}
  else{P.sph(0.1,c,0,0.13,0,g,1.0,1.3,1.1); P.sph(0.065,c,0,0.3,0.06,g); P.sph(0.03,0xf2ece0,0,0.28,0.12,g,1.1,0.8,0.8);
    [-1,1].forEach(function(s){P.geo(new THREE.ConeGeometry(0.024,0.055,4),c2,s*0.034,0.37,0.06,g); P.sph(0.011,0xb8c84a,s*0.024,0.31,0.118,g); P.cyl(0.02,0.11,c,s*0.04,0.05,0.07,g,6);});
    P.tube([[0,0.04,-0.1],[0.1,0.02,-0.06],[0.13,0.02,0.06],[0.08,0.03,0.14]],0.018,c,g);}
  return g;};
/* a pigeon pecking. o.up: head up */
det.pigeon=function(o){o=o||{}; const g=P.grp(), grey=0x8a8f98;
  P.sph(0.07,grey,0,0.09,0,g,0.85,0.75,1.3); P.sph(0.04,0x6a5a7a,0,0.12,0.07,g,1,1,1); const h=P.sph(0.032,0x5a6070,0,o.up?0.17:0.07,o.up?0.1:0.13,g);
  P.geo(new THREE.ConeGeometry(0.008,0.025,4),0x2b2d2f,0,o.up?0.17:0.065,o.up?0.135:0.165,g).rotation.x=R/2;
  P.box(0.07,0.02,0.09,0x4a4e56,0,0.09,-0.12,g).rotation.x=0.3; [-1,1].forEach(function(s){P.box(0.012,0.04,0.012,0xc06a6a,s*0.02,0.02,0,g); P.box(0.03,0.08,0.11,0x9aa0aa,s*0.055,0.1,-0.01,g).rotation.z=s*0.2;});
  return g;};

})();
