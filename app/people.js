/* Haroe 10 — people. Bodies are turned and sculpted shapes with stitched, textured clothes;
   every pose change is eased, so nothing snaps. One builder for the two of you and for friends. */
(function(){
'use strict';
const A=window.APP, R=Math.PI;

/* ---------- cloth: light grey detail maps, multiplied by the colour of the garment ---------- */
function cloth(w,h,rx,ry,draw){const t=A.canvasTex(w,h,draw); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(rx,ry); return t;}
const noise=function(g,w,h,n,a,seed){const r=A.rng(seed); for(let i=0;i<n;i++){g.fillStyle='rgba('+(r()>0.5?'255,255,255':'0,0,0')+','+(r()*a)+')'; g.fillRect(r()*w,r()*h,1+r()*2,1);}};
const TEX={
  knit:cloth(64,64,5,5,function(g){g.fillStyle='#f0f0f0'; g.fillRect(0,0,64,64);
    for(let x=0;x<64;x+=8){g.fillStyle='rgba(0,0,0,0.13)'; g.fillRect(x,0,2,64); g.fillStyle='rgba(255,255,255,0.5)'; g.fillRect(x+3,0,2,64);}
    for(let y=0;y<64;y+=4){g.fillStyle='rgba(0,0,0,0.05)'; g.fillRect(0,y,64,1);}}),
  rib:cloth(32,32,10,1,function(g){g.fillStyle='#e6e6e6'; g.fillRect(0,0,32,32); for(let x=0;x<32;x+=4){g.fillStyle='rgba(0,0,0,0.2)'; g.fillRect(x,0,1.5,32);}}),
  jersey:cloth(256,256,1,1,function(g){g.fillStyle='#f4f4f4'; g.fillRect(0,0,256,256); noise(g,256,256,2600,0.07,3);
    g.strokeStyle='rgba(0,0,0,0.22)'; g.lineWidth=1.5; g.setLineDash([3,2]); g.strokeRect(20,74,24,26); g.setLineDash([]); g.fillStyle='rgba(0,0,0,0.05)'; g.fillRect(20,74,24,26);          // chest pocket
    g.strokeStyle='rgba(0,0,0,0.12)'; g.beginPath(); g.moveTo(64,0); g.lineTo(64,256); g.moveTo(192,0); g.lineTo(192,256); g.stroke();}),                                               // side seams
  plain:cloth(128,128,1,1,function(g){g.fillStyle='#f4f4f4'; g.fillRect(0,0,128,128); noise(g,128,128,900,0.07,4);}),
  denim:cloth(128,128,1,2,function(g){g.fillStyle='#ececec'; g.fillRect(0,0,128,128);
    g.strokeStyle='rgba(0,0,0,0.07)'; g.lineWidth=1; for(let i=-128;i<128;i+=4){g.beginPath(); g.moveTo(i,0); g.lineTo(i+128,128); g.stroke();}
    noise(g,128,128,700,0.1,6);
    [32,96].forEach(function(x){g.strokeStyle='rgba(0,0,0,0.25)'; g.lineWidth=1; g.beginPath(); g.moveTo(x,0); g.lineTo(x,128); g.stroke();
      g.strokeStyle='rgba(255,255,255,0.75)'; g.setLineDash([3,3]); g.beginPath(); g.moveTo(x+3,0); g.lineTo(x+3,128); g.stroke(); g.setLineDash([]);});}),
  jeansTop:cloth(256,128,1,1,function(g){g.fillStyle='#ececec'; g.fillRect(0,0,256,128);
    g.strokeStyle='rgba(0,0,0,0.07)'; for(let i=-128;i<256;i+=4){g.beginPath(); g.moveTo(i,0); g.lineTo(i+128,128); g.stroke();}
    g.fillStyle='rgba(0,0,0,0.16)'; g.fillRect(0,0,256,12); g.fillStyle='rgba(255,255,255,0.7)'; for(let x=4;x<256;x+=6) g.fillRect(x,12,3,1);                                    // waistband and its stitching
    [14,50,206,242,112,144].forEach(function(x){g.fillStyle='rgba(0,0,0,0.3)'; g.fillRect(x-3,0,6,14);});                                                                           // belt loops
    g.strokeStyle='rgba(255,255,255,0.8)'; g.lineWidth=1.3; g.setLineDash([3,3]);
    g.beginPath(); g.moveTo(18,14); g.quadraticCurveTo(22,46,62,50); g.stroke(); g.beginPath(); g.moveTo(238,14); g.quadraticCurveTo(234,46,194,50); g.stroke();                 // front pockets
    g.beginPath(); g.moveTo(2,14); g.lineTo(2,70); g.quadraticCurveTo(2,84,-6,86); g.stroke(); g.beginPath(); g.moveTo(254,14); g.lineTo(254,84); g.stroke();                    // fly
    g.strokeRect(100,30,22,26); g.strokeRect(134,30,22,26); g.setLineDash([]);                                                                                                      // back pockets
    g.fillStyle='#d8d8d8'; g.beginPath(); g.arc(0,7,3.5,0,7); g.arc(256,7,3.5,0,7); g.fill();}),                                                                                    // button
  pj:cloth(64,64,5,3,function(g){g.fillStyle='#f6f6f6'; g.fillRect(0,0,64,64); for(let x=0;x<64;x+=16){g.fillStyle='rgba(255,255,255,0.9)'; g.fillRect(x,0,5,64); g.fillStyle='rgba(0,0,0,0.1)'; g.fillRect(x+8,0,2,64);}})
};
const curlGeo=new THREE.SphereGeometry(1,8,6);
const sg=function(r,a,b){return new THREE.SphereGeometry(r,a||20,b||14);};
const cg=function(rt,rb,h,s){return new THREE.CylinderGeometry(rt,rb,h,s||16);};
const lathe=function(pts,n){return new THREE.LatheGeometry(pts.map(function(q){return new THREE.Vector2(q[0],q[1]);}),n||26);};
/* a limb segment hanging from the origin; listed bottom to top so the surface faces outward */
const seg=function(r0,r1,len,bulge,at){at=at||0.35; return lathe([[0.001,-len],[r1*0.8,-len],[r1,-len*0.97],[(r0+r1)/2+bulge*0.3,-len*0.7],[r0*0.97+r1*0.03+bulge,-len*at],[r0,-len*0.06],[r0*0.9,0],[0.001,0]]);};
const lump=function(r,amp,freq,seed){            // a soft uneven volume, for hair
  const geo=new THREE.SphereGeometry(r,30,22), q=geo.attributes.position;
  for(let k=0;k<q.count;k++){const x=q.getX(k), y=q.getY(k), z=q.getZ(k);
    const n=Math.sin(x*freq+seed)*Math.sin(y*freq*1.13+seed*1.7)*Math.sin(z*freq*0.91+seed*2.3)+0.5*Math.sin(x*freq*2.1+y*freq*1.7+seed)*Math.sin(z*freq*2.3+seed);
    const f=1+amp*n; q.setXYZ(k,x*f,y*f,z*f);}
  geo.computeVertexNormals(); return geo;
};

A.makePerson=function(spec,parent){
  const g=new THREE.Group(); parent.add(g);
  const mats=[];
  const mk=function(c,rough,map){const m=new THREE.MeshStandardMaterial({color:c,roughness:rough==null?0.85:rough,metalness:0,map:map||null}); const e={m:m,b:new THREE.Color(c)}; mats.push(e); return e;};
  const E={skin:mk(spec.skin,0.6), top:mk(spec.top,0.9,TEX.knit), pants:mk(spec.pants,0.92,TEX.denim), ptop:mk(spec.pants,0.92,TEX.jeansTop), trim:mk(spec.top,0.9,TEX.rib),
    hair:mk(spec.hair,0.72), hair2:mk(spec.hair,0.72), shoe:mk(spec.shoes||0x2b2b2b,0.7), sole:mk(0xf1efe8,0.8), dark:mk(0x1c1a19,0.45), lip:mk(0x9a4f48,0.5),
    white:mk(0xf8f6f1,0.3), iris:mk(spec.eyes||0x5a3a22,0.3), gold:mk(0xd9aa12,0.35),
    lip2:mk(new THREE.Color(spec.skin).lerp(new THREE.Color(0xb5544f),0.45).getHex(),0.5), skinD:mk(new THREE.Color(spec.skin).multiplyScalar(0.9).getHex(),0.6)};
  E.hair2.b.offsetHSL(0,0,0.05);
  const put=function(geo,e,p,x,y,z){const m=new THREE.Mesh(geo,e.m||e); m.position.set(x,y,z); m.castShadow=true; p.add(m); return m;};
  const sc=spec.h/1.76, fem=!!spec.slim, ws=fem?0.9:1, HIP=0.925, LEG=0.92, zs=fem?0.6:0.62;
  g.scale.setScalar(sc);
  const rig=new THREE.Group(); g.add(rig);
  const hips=new THREE.Group(); rig.add(hips); hips.position.y=HIP;
  const pelvis=put(lathe([[0.001,-0.155],[0.06,-0.15],[0.115*ws,-0.12],[0.152*ws,-0.07],[0.16*ws,-0.02],[0.15*ws,0.05],[0.001,0.05]]),E.ptop,hips,0,0,0); pelvis.scale.z=zs;
  const torso=new THREE.Group(); hips.add(torso);
  // the top: a flared hem over the hips, waist, ribs, chest, a shoulder line wide enough for the arms to grow out of
  const body=put(lathe([[0.001,-0.075],[0.176*ws,-0.075],[0.172*ws,-0.02],[(fem?0.136:0.154)*ws,0.16],[(fem?0.16:0.168)*ws,0.31],[(fem?0.176:0.186)*ws,0.42],[0.192*ws,0.452],[0.168*ws,0.498],[0.1,0.54],[0.056,0.562],[0.001,0.565]],30),E.top,torso,0,0,0); body.scale.z=zs;
  const hem=put(lathe([[0.172*ws,-0.085],[0.18*ws,-0.078],[0.18*ws,-0.04],[0.175*ws,-0.034]],30),E.trim,torso,0,0,0); hem.scale.z=zs;
  const collar=put(new THREE.TorusGeometry(0.056,0.011,10,24),E.trim,torso,0,0.558,0.004); collar.rotation.x=R/2;
  put(cg(0.044,0.05,0.11,18),E.skin,torso,0,0.61,0);                                                // neck
  const head=new THREE.Group(); head.position.set(0,0.74,0); head.scale.setScalar(1.1); torso.add(head);
  // the head is one sculpted surface: a sphere narrowed toward the jaw, chin brought forward
  const hg=new THREE.SphereGeometry(0.11,36,28), hp=hg.attributes.position;
  for(let k=0;k<hp.count;k++){let x=hp.getX(k), y=hp.getY(k), z=hp.getZ(k); const t=y/0.11;
    if(t<0){const q=1-(fem?0.34:0.27)*Math.pow(-t,1.6); x*=q; z*=q; z+=0.013*(-t); y*=1.2;} else y*=1.05;
    hp.setXYZ(k,x*0.93,y,z*0.98);}
  hg.computeVertexNormals(); put(hg,E.skin,head,0,0.004,0);
  [-1,1].forEach(function(s){const e=put(sg(0.022),E.skin,head,s*0.1,-0.004,-0.006); e.scale.set(0.38,1,0.68); put(sg(0.011),E.skinD,head,s*0.103,-0.004,-0.002).scale.set(0.3,0.9,0.6);});
  const eyes=new THREE.Group(); head.add(eyes);
  [-1,1].forEach(function(s){
    const ex=s*0.04, ey=0.014;
    put(sg(0.021),E.white,eyes,ex,ey,0.094).scale.set(1.0,1.05,0.6);
    put(sg(0.0128),E.iris,eyes,ex-s*0.0015,ey-0.001,0.1035).scale.z=0.42;
    put(sg(0.0066),E.dark,eyes,ex-s*0.0015,ey-0.001,0.1072).scale.z=0.42;
    put(sg(0.0036),E.white,eyes,ex+0.0045,ey+0.006,0.1094);
    const lid=put(new THREE.SphereGeometry(0.0222,18,10,0,R*2,0,R*0.33),E.skin,head,ex,ey,0.0942); lid.scale.set(1.0,1.05,0.62); lid.rotation.x=0.3;
    if(fem){const lash=put(new THREE.TorusGeometry(0.0205,0.002,6,18,R*0.7),E.dark,head,ex,ey+0.009,0.1045); lash.rotation.z=R*0.15; lash.scale.set(1.0,0.42,1);}
    const br=put(new THREE.TorusGeometry(0.025,fem?0.003:0.0046,6,14,R*0.56),E.hair,head,ex,ey+0.022,0.103); br.rotation.z=R*0.22-s*0.05; br.scale.y=0.5;
  });
  put(sg(0.013),E.skin,head,0,-0.022,0.113).scale.set(0.9,0.85,0.9);
  put(cg(0.006,0.0105,0.045),E.skin,head,0,-0.002,0.108).rotation.x=-0.3;
  [-1,1].forEach(function(s){put(sg(0.007),E.skin,head,s*0.011,-0.026,0.107);});
  const smile=put(new THREE.TorusGeometry(0.02,0.0028,8,18,R*0.8),E.lip,head,0,-0.05,0.1035); smile.rotation.z=R*1.1; smile.scale.y=0.55;
  const mouth=put(sg(0.011),E.dark,head,0,-0.058,0.1); mouth.scale.set(1.3,0.01,0.5);            // opens when talking or eating
  if(fem){
    put(sg(0.012),E.lip2,head,0,-0.067,0.1025).scale.set(1.45,0.42,0.4);
    const blush=new THREE.MeshStandardMaterial({color:E.lip2.b,roughness:0.6,transparent:true,opacity:0.4}); mats.push({m:blush,b:E.lip2.b.clone()});
    [-1,1].forEach(function(s){put(sg(0.007),E.gold,head,s*0.104,-0.03,-0.004); put(sg(0.018),blush,head,s*0.06,-0.03,0.088).scale.set(1,0.65,0.22);});
  }
  const lap=new THREE.Group(); lap.position.set(0,0.37,0.43); lap.rotation.x=-0.84; torso.add(lap);          // where an open book rests, facing the eyes
  /* hair */
  const curls=function(n,seed,shells){              // many small curls over a darker core, drawn as one mesh
    const r=A.rng(seed), im=new THREE.InstancedMesh(curlGeo,E.hair.m,n), m4=new THREE.Matrix4(), q=new THREE.Quaternion(), v=new THREE.Vector3(), s3=new THREE.Vector3(); let k=0, guard=0;
    while(k<n&&guard++<n*20){
      const sh=shells[Math.floor(r()*shells.length)], u=r()*2-1, a=r()*6.283, w=Math.sqrt(1-u*u);
      v.set(sh[0]+w*Math.cos(a)*sh[3],sh[1]+u*sh[4],sh[2]+w*Math.sin(a)*sh[5]);
      if(v.z>0.05&&v.y<0.085&&v.y>-0.16&&Math.abs(v.x)<0.092) continue;                        // keep the face clear
      const rad=0.019+r()*0.014; s3.set(rad,rad*(0.8+r()*0.4),rad); m4.compose(v,q,s3); im.setMatrixAt(k++,m4);
    }
    im.count=k; im.castShadow=true; im.frustumCulled=false; head.add(im);
  };
  if(spec.style==='short'){put(lump(0.117,0.035,70,1),E.hair,head,0,0.03,-0.022).scale.set(0.96,0.96,1);}
  else if(spec.style==='long'){put(lump(0.12,0.03,60,2),E.hair,head,0,0.03,-0.024).scale.set(0.98,0.98,1);
    put(lump(0.115,0.04,50,3),E.hair2,head,0,-0.1,-0.07).scale.set(1.12,1.5,0.62);
    [-1,1].forEach(function(s){put(lump(0.04,0.05,60,4+s),E.hair,head,s*0.1,-0.11,0.02).scale.set(0.6,2.4,0.9);});}
  else if(spec.style==='bun'){put(lump(0.118,0.03,60,4),E.hair,head,0,0.03,-0.022).scale.set(0.96,0.96,1); put(lump(0.055,0.06,80,5),E.hair2,head,0,0.15,-0.045);}
  else if(spec.style==='curly'){
    put(lump(0.14,0.06,58,6),E.hair2,head,0,0.04,-0.052); put(lump(0.11,0.08,62,7),E.hair2,head,0,-0.11,-0.08).scale.set(1.25,1.25,0.78);
    curls(300,spec.h*1000|0,[[0,0.04,-0.052,0.15,0.15,0.15],[0,0.04,-0.052,0.15,0.15,0.15],[0,-0.11,-0.08,0.148,0.148,0.094],[-0.115,-0.09,0,0.045,0.11,0.055],[0.115,-0.09,0,0.045,0.11,0.055]]);
  }
  if(spec.beard==='goatee'){
    const mo=put(new THREE.TorusGeometry(0.023,0.0055,8,14,R),E.hair,head,0,-0.042,0.103); mo.scale.y=0.5;
    put(lump(0.03,0.04,90,9),E.hair,head,0,-0.108,0.078).scale.set(1.2,0.75,0.8);
    [-1,1].forEach(function(s){const c=put(new THREE.BoxGeometry(0.006,0.04,0.006),E.hair,head,s*0.025,-0.07,0.099); c.rotation.z=s*0.12; c.rotation.x=0.2;});
  }else if(spec.beard==='full'){
    const bg=hg.clone(), bp=bg.attributes.position; for(let k=0;k<bp.count;k++){const y=bp.getY(k), z=bp.getZ(k), f=(y<-0.035&&!(y>-0.075&&z>0.085&&Math.abs(bp.getX(k))<0.03))?1.05:0.9; bp.setXYZ(k,bp.getX(k)*f,y*f,z*f);}
    bg.computeVertexNormals(); put(bg,E.hair,head,0,0.004,0);
    const mo=put(new THREE.TorusGeometry(0.023,0.0055,8,14,R),E.hair,head,0,-0.042,0.104); mo.scale.y=0.5;
  }
  /* arms and legs */
  const parts={sleeve:[],fore:[],cuff:[],cap:[],leg:[],hemL:[],shoe:[],sole:[],bunchT:[],bunchA:[],shoulder:[]};
  const limb=function(s){
    const arm=new THREE.Group(); arm.position.set(s*(0.19*ws+0.006),0.452,0); torso.add(arm);
    const sh=put(sg(0.05),E.top,arm,0,0,0); sh.scale.set(1,0.8,1); parts.shoulder.push(sh);
    parts.sleeve.push(put(seg(0.049,0.04,0.28,0),E.top,arm,0,0,0));
    const cap=put(seg(0.054,0.05,0.15,0),E.top,arm,0,0.004,0); parts.cap.push(cap); parts.cap.push(put(seg(0.052,0.052,0.02,0),E.trim,arm,0,-0.135,0));
    const fore=new THREE.Group(); fore.position.y=-0.28; arm.add(fore);
    parts.fore.push(put(sg(0.04),E.top,fore,0,0,0)); parts.fore.push(put(seg(0.04,0.03,0.25,0),E.top,fore,0,0,0));
    parts.cuff.push(put(seg(0.035,0.034,0.04,0),E.trim,fore,0,-0.215,0));
    const hand=new THREE.Group(); hand.position.set(0,-0.255,0.003); hand.rotation.y=s*0.35; fore.add(hand);
    put(sg(0.03),E.skin,hand,0,-0.03,0).scale.set(0.46,1.05,0.98);
    for(let k=0;k<4;k++){const fz=-0.02+k*0.0135, fl=k===1||k===2?0.05:0.043, f=put(cg(0.0068,0.0074,fl,8),E.skin,hand,0.002,-0.06-fl/2,fz); f.rotation.z=-s*0.12; put(sg(0.0068,8,6),E.skin,hand,0.002-s*0.006,-0.06-fl,fz);}
    const th=put(cg(0.0075,0.0085,0.04,8),E.skin,hand,-s*0.004,-0.04,0.034); th.rotation.x=-0.75; put(sg(0.0075,8,6),E.skin,hand,-s*0.004,-0.054,0.048);
    const leg=new THREE.Group(); leg.position.set(s*0.088*ws,-0.03,0); hips.add(leg);
    parts.leg.push(put(seg(0.084*ws,0.058,0.44,0),E.pants,leg,0,0,0));
    const bt=put(new THREE.TorusGeometry(0.082,0.03,8,16),E.pants,leg,0,-0.2,0); bt.rotation.x=R/2; bt.scale.set(1,1,1.5); parts.bunchT.push(bt);
    const knee=new THREE.Group(); knee.position.y=-0.44; leg.add(knee);
    parts.leg.push(put(sg(0.058),E.pants,knee,0,0,0)); parts.leg.push(put(seg(0.058,0.043,0.4,0.003,0.3),E.pants,knee,0,0,0));
    parts.hemL.push(put(seg(0.048,0.048,0.03,0),E.pants,knee,0,-0.365,0));
    const ba=put(new THREE.TorusGeometry(0.06,0.036,8,16),E.pants,knee,0,-0.33,0); ba.rotation.x=R/2; ba.scale.set(1,1,1.7); parts.bunchA.push(ba);
    parts.shoe.push(put(sg(0.05),E.shoe,knee,0,-0.42,0.0)); parts.shoe[parts.shoe.length-1].scale.set(0.86,0.66,1.0);
    parts.shoe.push(put(sg(0.054),E.shoe,knee,0,-0.427,0.07)); parts.shoe[parts.shoe.length-1].scale.set(0.84,0.5,1.4);
    const so=put(sg(0.06),E.sole,knee,0,-0.449,0.04); so.scale.set(0.8,0.16,2.0); parts.sole.push(so);                                // a rounded sole, not a slab
    [0.05,0.075,0.1].forEach(function(z){parts.sole.push(put(new THREE.BoxGeometry(0.05,0.004,0.008),E.sole,knee,0,-0.398-(z-0.05)*0.2,z));});
    return {arm:arm,fore:fore,leg:leg,knee:knee,hand:hand};
  };
  const Lm=limb(-1), Rm=limb(1);

  /* ---------- clothes ---------- */
  const D={top:new THREE.Color(spec.top),pants:new THREE.Color(spec.pants),shoe:new THREE.Color(spec.shoes||0x2b2b2b),sleeves:!!spec.sleeves,knit:!!spec.sleeves};
  const p={g:g,head:head,mats:mats,sc:sc,spec:spec,sit:0,lie:0,walk:0,sitT:0,lieT:0,walking:false,phase:0,seatY:0.45,lieY:0.45,knee:1,recline:0,vel:0,amp:0.4,moved:null,pjOn:false,isNude:false,pantsLv:0,shoesOn:true,
    t:Math.random()*10,blink:2+Math.random()*3,act:null,talk:0,twirl:0,eyeUp:0,hand:Rm.fore,handL:Lm.fore,lap:lap};
  const set=function(list,e){list.forEach(function(m){m.material=e.m;});}, show=function(list,v){list.forEach(function(m){m.visible=v;});};
  function dress(){
    const nude=p.isNude, pj=p.pjOn, lv=p.pantsLv, sleeves=pj||D.sleeves;
    E.top.b.copy(pj?new THREE.Color(spec.pj):D.top); E.top.m.map=pj?TEX.pj:D.knit?TEX.knit:fem?TEX.plain:TEX.jersey; E.top.m.needsUpdate=true;
    E.trim.b.copy(E.top.b).multiplyScalar(pj?1.0:0.82);
    E.pants.b.copy(pj?new THREE.Color(spec.pj).multiplyScalar(0.88):D.pants); E.pants.m.map=pj?TEX.pj:TEX.denim; E.pants.m.needsUpdate=true;
    E.ptop.b.copy(E.pants.b); E.ptop.m.map=pj?TEX.pj:TEX.jeansTop; E.ptop.m.needsUpdate=true;
    E.shoe.b.copy(D.shoe);
    body.material=nude?E.skin.m:E.top.m; hem.visible=collar.visible=!nude;
    set(parts.shoulder,nude?E.skin:E.top); set(parts.sleeve,(nude||!sleeves)?E.skin:E.top); show(parts.cap,!nude&&!sleeves);
    set(parts.fore,(nude||!sleeves)?E.skin:E.top); show(parts.cuff,!nude&&sleeves);
    pelvis.material=(nude||lv>0)?E.skin.m:E.ptop.m;
    set(parts.leg,(nude||lv>1)?E.skin:E.pants); show(parts.hemL,!nude&&lv<2);
    show(parts.bunchT,!nude&&lv===1); show(parts.bunchA,!nude&&lv===2);
    const shod=p.shoesOn&&!nude&&!pj; set(parts.shoe,shod?E.shoe:E.skin); show(parts.sole,shod);
    p.dirty=true;
  }
  p.outfit=function(pj){p.pjOn=pj; dress();};
  p.setClothes=function(o){D.top.set(o.top); D.pants.set(o.pants); D.sleeves=!!o.sleeves; D.knit=!!o.knit; dress();};
  p.shoes=function(on){p.shoesOn=on; dress();};
  p.nude=function(on){p.isNude=on; dress();};
  p.pants=function(level){p.pantsLv=level; dress();};            // 0 up, 1 pulled down to the thighs, 2 at the ankles
  p.tint=function(t){for(let i=0;i<mats.length;i++) mats[i].m.color.copy(mats[i].b).multiply(t);};
  p.hideHead=function(on){head.visible=!on;};
  dress();

  /* ---------- poses: every frame the body eases toward a target, so switching what you do never snaps ---------- */
  const C={aLx:0,aLz:0,fL:0,aRx:0,aRz:0,fR:0,tx:0,ty:0,hx:0,hy:0};
  const T={};
  function targets(){
    const o=p.t, s=p.sit, lie=p.lie, a=p.act, w=p.walk, still=1-w, br=Math.sin(o*1.7);
    const sn=Math.sin(p.phase), sw=sn*p.amp*w;                 // the left leg is back when sn > 0, so the left arm is forward
    T.aLx=-sw*0.8-0.2*s+br*0.015*still; T.aRx=sw*0.8-0.2*s-br*0.015*still; T.aLz=T.aRz=0.1-0.035*w;
    T.fL=-(0.2+0.34*Math.max(0,sn))*w-1.05*s*(1-lie)-0.14*still; T.fR=-(0.2+0.34*Math.max(0,-sn))*w-1.05*s*(1-lie)-0.14*still;      // the elbow bends as the hand comes forward
    T.tx=-p.recline*s+0.04*w; T.ty=sn*p.amp*0.42*w;            // shoulders turn against the hips
    T.hy=Math.sin(o*0.43)*0.22*still*(1-lie)-sn*p.amp*0.2*w; T.hx=Math.sin(o*0.31)*0.05*still-0.03*w;                                  // and the head stays facing ahead
    if(lie>0.5){T.aLx=T.aRx=-0.12; T.fL=T.fR=-0.25; T.hy=0; T.hx=0;}
    if(!a) return;
    const f=Math.sin(o*7), sl=Math.sin(o*2.6), c2=Math.cos(o*2.6);
    if(a==='massage'){T.aLx=-1.2+f*0.14; T.aRx=-1.2-f*0.14; T.fL=T.fR=-0.35; T.hx=0.2;}
    else if(a==='cook'){T.aRx=-0.72+c2*0.08; T.aRz=0.1+sl*0.12; T.fR=-0.85; T.aLx=-0.35; T.fL=-1.0; T.hx=0.32; T.hy=0; T.tx=0.1;}        // right hand stirs, left steadies the pan
    else if(a==='wash'){T.aLx=-0.62+sl*0.1; T.aRx=-0.62-sl*0.1; T.fL=-0.95-c2*0.12; T.fR=-0.95+c2*0.12; T.aLz=T.aRz=-0.08; T.hx=0.35; T.hy=0; T.tx=0.14;}
    else if(a==='vacuum'){const q=Math.sin(o*3.2); T.aRx=-0.45-q*0.2; T.fR=-0.6+q*0.3; T.aRz=-0.05; T.hx=0.25; T.tx=0.12+q*0.03;}       // one hand pushes and pulls the stick
    else if(a==='read'){T.aLx=T.aRx=-0.55; T.fL=T.fR=-1.5; T.aLz=T.aRz=-0.16; T.hx=0.34; T.hy=Math.sin(o*0.5)*0.05;}
    else if(a==='type'){T.aLx=T.aRx=-0.42; T.fL=-1.18+Math.sin(o*11)*0.03; T.fR=-1.18+Math.sin(o*13+1)*0.03; T.aLz=T.aRz=-0.04; T.hx=0.1; T.hy=Math.sin(o*0.6)*0.06; T.tx=0.1;}
    else if(a==='eat'){const u=(o*0.55)%1, up=u<0.5?Math.sin(u*2*R):0; T.aLx=-0.4; T.fL=-1.1; T.aRx=-0.45-up*0.5; T.fR=-1.15-up*1.0; T.aRz=-0.1*up; T.hx=0.22-up*0.1; T.hy=0; T.tx=0.1;}
    else if(a==='drink'){const up=Math.max(0,Math.sin(o*1.2)); T.aRx=-0.5-up*0.45; T.fR=-1.3-up*0.9; T.hx=-0.12*up;}
    else if(a==='carry'){T.aRx=-0.3; T.fR=-1.25; T.aRz=0.02;}
    else if(a==='carry2'){T.aLx=T.aRx=-0.35; T.fL=T.fR=-1.3; T.aLz=T.aRz=-0.1;}
    else if(a==='reach'){T.aRx=-1.75; T.fR=-0.25; T.hx=-0.2; T.hy=0;}
    else if(a==='reachmid'){T.aRx=-1.2; T.fR=-0.35; T.hx=0.05; T.hy=0;}
    else if(a==='reachlow'){T.aRx=-0.9; T.fR=-0.3; T.aLx=-0.4; T.tx=0.5; T.hx=0.3; T.hy=0;}
    else if(a==='pee'){T.aLx=T.aRx=-0.3; T.fL=T.fR=-0.75; T.aLz=T.aRz=-0.22; T.hx=0.25; T.hy=0;}
    else if(a==='wave'){T.aRz=2.5; T.aRx=0; T.fR=-0.5+f*0.35; T.hy=0;}
    else if(a==='shower'){T.aLx=-2.3+sl*0.12; T.aRx=-2.3-sl*0.12; T.fL=T.fR=-1.7+c2*0.15; T.aLz=T.aRz=0.25; T.hx=-0.12; T.hy=0;}
    else if(a==='undress'){T.aLx=T.aRx=-0.5; T.fL=T.fR=-1.6; T.aLz=T.aRz=-0.2; T.tx=0.35; T.hx=0.3;}
    else if(a==='flop'){T.aRx=-2.6; T.fR=-1.9; T.aRz=0.5; T.aLx=-0.1; T.fL=-0.6;}
    else if(a==='point'){T.aRx=-1.2; T.fR=-0.2; T.hy=0;}
  }
  p.update=function(dt){
    p.sit+=(p.sitT-p.sit)*Math.min(1,dt*6.5); p.lie+=(p.lieT-p.lie)*Math.min(1,dt*5);
    // walking: the stride follows the ground actually covered, so feet do not slide; slower walking takes shorter steps
    const mv=p.moved==null?(p.walking?1.4*dt:0):p.moved; p.vel+=((dt>0?mv/dt:0)-p.vel)*Math.min(1,dt*7);
    const gk=Math.min(1.25,Math.max(0.5,Math.sqrt(p.vel/1.4))); p.amp=0.4*gk;
    p.walk+=((p.walking&&p.vel>0.12?1:0)-p.walk)*Math.min(1,dt*7);
    if(p.walk>0.02) p.phase+=mv/(4*LEG*sc*Math.sin(p.amp))*2*R;
    p.t+=dt; targets();
    const k=Math.min(1,dt*10); for(const n in C) C[n]+=(T[n]-C[n])*k;
    const s=p.sit, kn=p.knee, w=p.walk, sn=Math.sin(p.phase), cs=Math.cos(p.phase), sw=sn*p.amp*w, still=1-w, br=Math.sin(p.t*1.7);
    // the hips drop as the legs spread and rise over the standing leg, so the planted foot stays on the floor; they shift over that leg and tip toward the lifted one
    hips.position.y=HIP+(((p.seatY+0.085)/sc)-HIP)*s-LEG*(1-Math.cos(sw))*(1-s);
    hips.position.x=-cs*0.014*w; hips.rotation.z=-cs*0.03*w; hips.rotation.y=-sn*p.amp*0.22*w;
    Lm.leg.rotation.x=-s*R/2*0.97+sw; Rm.leg.rotation.x=-s*R/2*0.97-sw;
    Lm.leg.rotation.z=-0.03-s*0.05; Rm.leg.rotation.z=0.03+s*0.05;
    // each knee folds while its leg swings forward, most just after the foot leaves the ground, and is straight again when the heel lands
    const kf=0.4+0.8*p.amp, kL=Math.pow(Math.max(0,-Math.cos(p.phase+0.25)),1.3), kR=Math.pow(Math.max(0,Math.cos(p.phase+0.25)),1.3);
    Lm.knee.rotation.x=s*R/2*kn+(kL*kf+0.06)*w; Rm.knee.rotation.x=s*R/2*kn+(kR*kf+0.06)*w;
    Lm.arm.rotation.set(C.aLx,0,-C.aLz); Rm.arm.rotation.set(C.aRx,0,C.aRz); Lm.fore.rotation.x=C.fL; Rm.fore.rotation.x=C.fR;
    torso.rotation.set(C.tx,C.ty,0); torso.scale.set(1,1+br*0.008*still,1+br*0.02*still);
    head.rotation.set(C.hx+0.2*p.lie,C.hy,0); head.position.set(0,0.74-0.012*p.lie,0.06*p.lie);          // lying down: the head is propped on the pillow
    if((p.blink-=dt)<0) p.blink=2.5+Math.random()*3.5;
    eyes.scale.y=(p.blink<0.12||p.asleep)?0.1:1;
    if(p.talk>0){p.talk-=dt; mouth.scale.y=0.35+0.3*Math.abs(Math.sin(p.t*13));} else mouth.scale.y=p.act==='eat'?0.25+0.2*Math.abs(Math.sin(p.t*5)):0.01;
    if(p.twirl>0){p.twirl=Math.max(0,p.twirl-dt/0.9); const e=p.twirl; rig.rotation.y=(1-e*e*(3-2*e))*R*2;} else rig.rotation.y=0;
    rig.rotation.x=-p.lie*R/2; rig.position.set(0,p.lie*(p.lieY+0.11)/sc,p.lie*0.9);
  };
  return p;
};
A.clothTex=TEX;
})();
