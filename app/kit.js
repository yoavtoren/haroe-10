/* Haroe 10 — kit: reusable pieces (plants, lamps, art, shelving, seats, TV) */
(function(){
'use strict';
const A=window.APP, rbox=A.rbox, box=A.box, cyl=A.cyl, sph=A.sph, torus=A.torus, M=A.M, canvasTex=A.canvasTex, rng=A.rng, H=A.D.H;
const K=A.kit={};
const GREENS=[0x2f7d4f,0x3f9160,0x246b43,0x4a9a66];
const PAL=K.PAL={green:'#1F5A41',sage:'#8fbd9b',blue:'#9fc4d6',sky:'#cfe3ec',cream:'#F3EBDC',ink:'#3b4a44',oak:'#C99A5B',white:'#fbfaf6'};   // modern rustic: green, light blue, wood, white

/* ---------- plants: real leaf shapes cut from one painted sheet, one mesh per plant ---------- */
const LEAF=512, leafTex=canvasTex(LEAF,LEAF,function(g){
  const vein=function(x0,y0,x1,y1,w,c){g.strokeStyle=c; g.lineWidth=w; g.lineCap='round'; g.beginPath(); g.moveTo(x0,y0); g.lineTo(x1,y1); g.stroke();};
  // monstera: a broad heart with deep splits and a few holes
  let gr=g.createLinearGradient(0,250,0,10); gr.addColorStop(0,'#256b43'); gr.addColorStop(1,'#3f9a62'); g.fillStyle=gr;
  g.beginPath(); g.moveTo(128,250); g.bezierCurveTo(20,240,-10,120,60,40); g.bezierCurveTo(95,8,161,8,196,40); g.bezierCurveTo(266,120,236,240,128,250); g.fill();
  g.globalCompositeOperation='destination-out';
  for(let s=-1;s<=1;s+=2) for(let i=0;i<5;i++){const y=70+i*34, x=128+s*(118-i*4); g.beginPath(); g.moveTo(x,y-9); g.lineTo(128+s*(40-i*3),y+10); g.lineTo(x,y+9); g.fill();}
  [[98,96],[158,96],[104,150],[152,150]].forEach(function(q){g.beginPath(); g.ellipse(q[0],q[1],6,11,0,0,6.3); g.fill();});
  g.globalCompositeOperation='source-over';
  vein(128,250,128,30,3,'#8fc49a'); for(let s=-1;s<=1;s+=2) for(let i=0;i<5;i++) vein(128,225-i*36,128+s*84,200-i*36,1.4,'rgba(170,215,175,.7)');
  // fiddle-leaf: violin shaped, strong pale veins
  g.save(); g.translate(256,0); gr=g.createLinearGradient(0,250,0,10); gr.addColorStop(0,'#2a6f45'); gr.addColorStop(1,'#4b9b5e'); g.fillStyle=gr;
  g.beginPath(); g.moveTo(128,252); g.bezierCurveTo(70,235,85,170,62,140); g.bezierCurveTo(20,90,50,12,128,8); g.bezierCurveTo(206,12,236,90,194,140); g.bezierCurveTo(171,170,186,235,128,252); g.fill();
  vein(128,252,128,16,3.5,'#b7d9a6'); for(let s=-1;s<=1;s+=2) for(let i=0;i<6;i++) vein(128,222-i*34,128+s*(46+Math.min(i,4)*10),196-i*34,1.6,'rgba(190,225,175,.75)'); g.restore();
  // pothos: a heart, splashed with cream
  g.save(); g.translate(0,256); g.fillStyle='#3f9160'; g.beginPath(); g.moveTo(128,246); g.bezierCurveTo(30,180,10,70,80,40); g.bezierCurveTo(110,28,128,50,128,66); g.bezierCurveTo(128,50,146,28,176,40); g.bezierCurveTo(246,70,226,180,128,246); g.fill(); g.clip();
  const r=rng(77); g.fillStyle='rgba(235,235,190,.55)'; for(let i=0;i<26;i++){g.beginPath(); g.ellipse(50+r()*156,60+r()*130,3+r()*9,2+r()*4,r()*3,0,6.3); g.fill();}
  vein(128,246,128,70,2.5,'#9fd0a4'); g.restore();
  // snake plant: a tall blade, banded, with a yellow edge
  g.save(); g.translate(256,256); g.fillStyle='#d9c956'; g.beginPath(); g.moveTo(40,254); g.bezierCurveTo(8,150,34,40,64,4); g.bezierCurveTo(94,40,120,150,88,254); g.fill();
  g.fillStyle='#2f6f49'; g.beginPath(); g.moveTo(46,254); g.bezierCurveTo(18,150,40,50,64,16); g.bezierCurveTo(88,50,110,150,82,254); g.fill();
  g.globalCompositeOperation='source-atop'; for(let y=20;y<254;y+=13){g.fillStyle='rgba(150,200,150,.35)'; g.beginPath(); g.ellipse(64,y,60,3.2,0.12*Math.sin(y),0,6.3); g.fill();} g.globalCompositeOperation='source-over'; g.restore();
  // a small oval leaf for bushes, and a plain strip for stems
  g.save(); g.translate(384,300); g.fillStyle='#3a8a58'; g.beginPath(); g.moveTo(64,210); g.bezierCurveTo(0,150,10,40,64,6); g.bezierCurveTo(118,40,128,150,64,210); g.fill(); vein(64,210,64,20,2.5,'#9fd0a4');
  for(let s=-1;s<=1;s+=2) for(let i=0;i<4;i++) vein(64,180-i*40,64+s*34,158-i*40,1.2,'rgba(170,215,175,.7)'); g.restore();
  g.fillStyle='#2f6b45'; g.fillRect(384,256,128,40);
});
const REG={monstera:[0,0,256,256],fiddle:[256,0,512,256],heart:[0,256,256,512],blade:[256,256,384,512],oval:[384,300,512,512],stem:[392,262,504,290]};
const leafDepth=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:leafTex,alphaTest:0.5});
const m4=new THREE.Matrix4(), m4b=new THREE.Matrix4(), v3=new THREE.Vector3();
function foliage(parent){
  const pos=[], uv=[], idx=[];
  const quad=function(w,h,reg,bend){             // a leaf standing on its base in the current matrix: x across, y up, bending toward +z
    const q=REG[reg], u0=q[0]/LEAF, u1=q[2]/LEAF, v0=1-q[3]/LEAF, v1=1-q[1]/LEAF, n=pos.length/3, SEG=reg==='stem'?1:3;
    for(let j=0;j<=SEG;j++){const t=j/SEG; for(let sx=-0.5;sx<=0.5;sx+=1){v3.set(sx*w,h*t,(bend||0)*t*t*h+Math.abs(sx)*0).applyMatrix4(m4); pos.push(v3.x,v3.y,v3.z); uv.push(u0+(sx+0.5)*(u1-u0),v0+t*(v1-v0));}}
    for(let j=0;j<SEG;j++){const a=n+j*2; idx.push(a,a+1,a+2,a+1,a+3,a+2);}
  };
  return {
    at:function(x,y,z,yaw,tilt,roll){m4.makeTranslation(x,y,z); m4.multiply(m4b.makeRotationY(yaw)); m4.multiply(m4b.makeRotationX(tilt)); if(roll) m4.multiply(m4b.makeRotationZ(roll)); return this;},
    leaf:function(w,h,reg,bend){quad(w,h,reg,bend); return this;},
    stem:function(w,h){quad(w,h,'stem',0); m4.multiply(m4b.makeRotationY(Math.PI/2)); quad(w,h,'stem',0); return this;},
    done:function(){
      const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); geo.setIndex(idx); geo.computeVertexNormals();
      const m=new THREE.Mesh(geo,A.reg(new THREE.MeshLambertMaterial({map:leafTex,alphaTest:0.5,side:THREE.DoubleSide})));
      m.castShadow=true; m.customDepthMaterial=leafDepth; m.userData.nc=true; (parent||A.scene).add(m); return m;
    }
  };
}
K.pot=function(p,x,z,r,h,col,y0){
  y0=y0||0; cyl(r*0.76,h,col==null?0xe6ddcd:col,x,y0+h/2,z,p,22,r); torus(r*0.98,r*0.07,col==null?0xe6ddcd:col,x,y0+h-r*0.03,z,p).rotation.x=Math.PI/2;      // body and rolled rim
  cyl(r*0.9,0.02,0x3a2c20,x,y0+h-0.02,z,p,18);
};
K.monstera=function(p,x,z,s,seed){
  s=s||1; K.pot(p,x,z,0.19*s,0.3*s,0xe6ddcd);
  const r=rng(seed||11), f=foliage(p), y0=0.28*s;
  for(let i=0;i<10;i++){
    const a=i/10*6.283+r()*0.5, lean=0.25+r()*0.45, len=(0.45+r()*0.5)*s, lw=(0.3+r()*0.14)*s;
    f.at(x,y0,z,a,lean).stem(0.014*s,len);
    const bx=x+Math.sin(a)*Math.sin(lean)*len, by=y0+Math.cos(lean)*len, bz=z+Math.cos(a)*Math.sin(lean)*len;
    f.at(bx,by,bz,a,0.9+r()*0.5,(r()-0.5)*0.4).leaf(lw,lw*1.05,'monstera',0.35);
  }
  f.done();
};
K.fiddle=function(p,x,z,h,seed){
  h=h||1.7; K.pot(p,x,z,0.2,0.34,0x3b3f3c);
  cyl(0.022,h-0.45,0x6b4a2f,x,0.34+(h-0.45)/2,z,p,8,0.014);
  const r=rng(seed||5), f=foliage(p);
  for(let i=0;i<16;i++){
    const a=i*2.4+r()*0.3, y=h*0.42+(i/16)*h*0.55, w=0.2+r()*0.06;
    f.at(x,y,z,a,0.75+r()*0.55+(i>13?-0.5:0),(r()-0.5)*0.3).leaf(w,w*1.35,'fiddle',0.5);
  }
  f.done();
};
K.snake=function(p,x,z,h,seed){
  h=h||0.7; K.pot(p,x,z,0.13,0.24,0xfbfaf6);
  const r=rng(seed||3), f=foliage(p);
  for(let i=0;i<11;i++){const a=r()*6.283, o=r()*0.07; f.at(x+Math.sin(a)*o,0.2,z+Math.cos(a)*o,a+r(),0.06+r()*0.22,(r()-0.5)*0.15).leaf(0.075+r()*0.03,h*(0.55+r()*0.45),'blade',0.08);}
  f.done();
};
K.bush=function(p,x,y,z,r0,col){
  cyl(r0*0.62,r0*1.1,col==null?0xf3ebdc:col,x,y+r0*0.55,z,p,16,r0*0.8);
  const r=rng(Math.round((x+z)*977+y*131)), f=foliage(p);
  for(let i=0;i<14;i++){const a=i/14*6.283+r(), t=0.15+r()*1.0; f.at(x,y+r0*1.0,z,a,t,(r()-0.5)*0.5).leaf(r0*(0.8+r()*0.5),r0*(1.5+r()*0.9),'oval',0.4);}
  f.done();
};
K.pothos=function(p,x,y,z,drop,seed){
  cyl(0.085,0.13,0xe6ddcd,x,y+0.065,z,p,16,0.11);
  const r=rng(seed||9), f=foliage(p);
  for(let i=0;i<9;i++){const a=i/9*6.283+r(); f.at(x,y+0.11,z,a,0.5+r()*0.8).leaf(0.075,0.085,'heart',0.3);}
  for(let s=0;s<7;s++){
    const a=s/7*6.283+r(), n=3+Math.floor(r()*4), L=drop*(0.55+r()*0.45), ox=x+Math.sin(a)*0.1, oz=z+Math.cos(a)*0.1;
    f.at(ox,y+0.1-L,oz,a,0).stem(0.006,L);
    for(let i=0;i<n;i++){const t=(i+0.6)/n; f.at(ox+Math.sin(a)*0.01,y+0.1-t*L,oz+Math.cos(a)*0.01,a+(r()-0.5)*1.6,2.2+r()*0.5,(r()-0.5)*0.6).leaf(0.07,0.08,'heart',0.25);}
  }
  f.done();
};
K.hanging=function(p,x,y,z,drop,seed){   // planter hung from the ceiling
  cyl(0.003,H-y-0.12,0x6f6a60,x,(H+y+0.12)/2,z,p,5); K.pothos(p,x,y,z,drop,seed);
};

/* ---------- lamps (shade materials glow with their light channel) ---------- */
K.arcLamp=function(p,ch){                      // base at origin, shade hangs over local (0.62, 0)
  cyl(0.17,0.035,0x2a2a2a,0,0.018,0,p,24); cyl(0.012,1.5,0xb08d4a,0,0.78,0,p,8);
  torus(0.55,0.012,0xb08d4a,0.55,1.5,0,p,Math.PI/2).rotation.y=Math.PI;
  cyl(0.21,0.17,A.lampMat(ch,0xefe6d2,null,0.5),0.62,1.95,0,p,24,0.07);
  A.pool(ch,0xffc47a,0.62,0.03,0,1.25,p,0.5);
};
K.floorLamp=function(p,ch){
  cyl(0.14,0.03,0x2a2a2a,0,0.015,0,p,20); cyl(0.011,1.42,0x2a2a2a,0,0.72,0,p,8);
  cyl(0.17,0.26,A.lampMat(ch,0xefe6d2,null,0.5),0,1.52,0,p,24,0.14);
  A.pool(ch,0xffc47a,0,0.03,0,1.1,p,0.5);
};
K.tableLamp=function(p,x,y,z,ch,s){
  s=s||1; cyl(0.045*s,0.15*s,0xb08d4a,x,y+0.075*s,z,p,12,0.03*s);
  cyl(0.1*s,0.13*s,A.lampMat(ch,0xefe6d2,null,0.5),x,y+0.2*s,z,p,18,0.065*s);
  A.pool(ch,0xffc47a,x,y+0.012,z,0.42*s,p,0.5);
};
K.deskLamp=function(p,x,y,z,ch,rot){
  const g=A.G(p); g.position.set(x,y,z); g.rotation.y=rot||0;
  cyl(0.06,0.02,0x2a2a2a,0,0.01,0,g,14); const a=cyl(0.008,0.36,0x2a2a2a,0.05,0.19,0,g,6); a.rotation.z=-0.3;
  const b=cyl(0.008,0.26,0x2a2a2a,0.2,0.38,0,g,6); b.rotation.z=-1.2;
  cyl(0.06,0.08,A.lampMat(ch,0xfbfaf6,0xffe2b0,0.7),0.32,0.39,0,g,14,0.03);
  A.pool(ch,0xffd08a,0.32,0.012,0,0.34,g,0.55);
};
K.pendant=function(p,x,y,z,ch,kind,col,poolR){
  cyl(0.004,H-y,0x2a2a2a,x,(H+y)/2,z,p,5); cyl(0.045,0.02,0xe9e9e6,x,H-0.01,z,p,12);
  if(kind==='paper'){sph(0.3,A.lampMat(ch,0xf4eedf,0xffdca6,0.55),x,y-0.22,z,p,1,0.86,1);}
  else if(kind==='rattan'){sph(0.24,A.lampMat(ch,0xd9b98a,0xffc36e,0.8),x,y-0.2,z,p,1,0.9,1); torus(0.24,0.008,0xa98455,x,y-0.2,z,p).rotation.x=Math.PI/2;}
  else{cyl(0.2,0.17,col==null?0x2f7d4f:col,x,y-0.085,z,p,24,0.05); cyl(0.185,0.012,A.lampMat(ch,0xf4eedf,0xffe2b0,1),x,y-0.172,z,p,24);}
  A.pool(ch,0xffc47a,x,0.032,z,poolR||1.5,p,0.42);
};
K.ceilDisc=function(p,x,z,ch){
  cyl(0.18,0.04,0xf8f8f4,x,H-0.02,z,p,32); cyl(0.16,0.012,A.lampMat(ch,0xffffff,0xfff0d0,1),x,H-0.046,z,p,32);
  A.pool(ch,0xffe2b0,x,0.03,z,1.7,p,0.3);
};
K.candle=function(p,x,y,z,h){
  cyl(0.024,h,0xf3ebdc,x,y+h/2,z,p,10);
  sph(0.011,A.lampMat('candle',0x4a3a2a,0xffa53c,1.4),x,y+h+0.014,z,p,1,1.9,1);
  A.pool('candle',0xffb45e,x,y+0.006,z,0.3,p,0.5);
};
K.stringLights=function(p,x,y,z0,z1,n){     // along a wall at x, facing +x
  const mat=A.lampMat('string',0xe9e2cf,0xffc66b,1.2);
  for(let i=0;i<=n;i++){const t=i/n, sag=Math.sin(t*Math.PI*4)*0.5+0.5;
    sph(0.022,mat,x+0.03,y-0.09*sag,z0+(z1-z0)*t,p);
    if(i<n){const w=box(0.004,0.004,(z1-z0)/n*1.03,0x3a3a36,x+0.02,y-0.045,z0+(z1-z0)*(t+0.5/n),p); w.castShadow=false;}
  }
  for(let i=0;i<4;i++) A.pool('string',0xffb96a,x+0.02,y-0.25,z0+(z1-z0)*(i+0.5)/4,0.75,p,0.3,Math.PI/2);
};

/* ---------- wall art ---------- */
K.artTex=function(seed,cols){
  cols=cols||[PAL.green,PAL.sage,PAL.blue,PAL.oak,PAL.sky,PAL.ink];
  return canvasTex(200,260,function(g,w,h){
    const r=rng(seed); g.fillStyle=PAL.cream; g.fillRect(0,0,w,h);
    const kind=seed%4, c=function(){return cols[Math.floor(r()*cols.length)];};
    if(kind===0){            // arches
      for(let i=0;i<3;i++){g.fillStyle=c(); const bw=150-i*42; g.beginPath(); g.arc(100,150,bw/2,Math.PI,0); g.lineTo(100+bw/2,230); g.lineTo(100-bw/2,230); g.fill();}
      g.fillStyle=c(); g.beginPath(); g.arc(150,50,22,0,7); g.fill();
    }else if(kind===1){      // sun over hills
      g.fillStyle=c(); g.beginPath(); g.arc(100,95,48,0,7); g.fill();
      for(let i=0;i<3;i++){g.fillStyle=c(); g.beginPath(); g.moveTo(0,260); g.lineTo(0,160+i*28); g.bezierCurveTo(60,120+i*30+r()*30,130,200+i*20-r()*30,200,150+i*30); g.lineTo(200,260); g.fill();}
    }else if(kind===2){      // blocks
      for(let i=0;i<6;i++){g.fillStyle=c(); const x=20+r()*110, y=20+r()*160, s=40+r()*60; if(i%2) g.fillRect(x,y,s,s*0.7); else{g.beginPath(); g.arc(x+30,y+30,s/2,0,7); g.fill();}}
    }else{                   // leaf lines
      g.strokeStyle=c(); g.lineWidth=5; g.lineCap='round';
      g.beginPath(); g.moveTo(100,240); g.lineTo(100,40); g.stroke();
      for(let i=0;i<7;i++){const y=220-i*26; g.beginPath(); g.moveTo(100,y); g.quadraticCurveTo(140,y-12,160-i*6,y-42); g.stroke(); g.beginPath(); g.moveTo(100,y); g.quadraticCurveTo(60,y-12,40+i*6,y-42); g.stroke();}
      g.fillStyle=c(); g.beginPath(); g.arc(46,48,20,0,7); g.fill();
    }
  });
};
/* framed print flat on wall k, centred at (u,y). Returns its meshes so they can be made design specific. */
K.frame=function(k,u,y,w,h,seed,frameCol,cols){
  const room=A.walls[k].room;
  return [A.rect(k,u-w/2,u+w/2,y-h/2,y+h/2,frameCol==null?0x2a2a28:frameCol,0.012),
          A.rect(k,u-w/2+0.025,u+w/2-0.025,y-h/2+0.025,y+h/2-0.025,A.MT(K.artTex(seed,cols),room),0.014)];
};
K.onlyAll=function(list,spec){list.forEach(function(m){A.only(m,spec);}); return list;};

/* ---------- books and cube shelving ---------- */
const bookCols=['#1F5A41','#9fc4d6','#C99A5B','#5d7f8c','#F3EBDC','#8fbd9b','#3b4a44','#cfe3ec','#f7f7f2','#a9825a'];
K.bookTex=function(seed){
  return canvasTex(128,64,function(g){
    const r=rng(seed); g.fillStyle='#2a2622'; g.fillRect(0,0,128,64); let x=0;
    while(x<128){const w=6+r()*10, hh=44+r()*20; g.fillStyle=bookCols[Math.floor(r()*bookCols.length)]; g.fillRect(x,64-hh,w-1,hh);
      if(r()>0.5){g.fillStyle='rgba(255,255,255,.55)'; g.fillRect(x+1,64-hh+8,w-3,3);} x+=w;}
  });
};
/* a row of books: wd along z, d along x, spines on ±x */
K.books=function(p,x,y,z,wd,h,d,seed){
  const side=M(0xefe9dc), sp=A.MT(K.bookTex(seed),null,true);
  const m=new THREE.Mesh(new THREE.BoxGeometry(d,h,wd),[sp,sp,side,side,side,side]);
  m.position.set(x,y+h/2,z); m.castShadow=true; p.add(m); return m;
};
K.bookStack=function(p,x,y,z,n,seed){
  const r=rng(seed||2); let yy=y;
  for(let i=0;i<n;i++){const t=0.025+r()*0.02; box(0.16+r()*0.05,t,0.22+r()*0.05,parseInt(bookCols[Math.floor(r()*bookCols.length)].slice(1),16),x,yy+t/2,z,p).rotation.y=(r()-0.5)*0.4; yy+=t;}
  return yy;
};
/* IKEA-style cube shelf. Opens toward +x, width along z, origin at floor centre.
   rows: array of strings top to bottom, one char per cell:
   b books, s stack, x box insert, y box insert (2nd colour), p plant, v vase, l lamp, k speaker, space empty */
K.kallax=function(p,rows,col,opt){
  opt=opt||{};
  const cols=rows[0].length, nr=rows.length, c=0.335, t=0.016, o=0.038, d=0.39;
  const wd=cols*c+(cols-1)*t+2*o, hg=nr*c+(nr-1)*t+2*o, mat=M(col);
  box(d,o,wd,mat,0,o/2,0,p); box(d,o,wd,mat,0,hg-o/2,0,p);
  box(d,hg,o,mat,0,hg/2,-wd/2+o/2,p); box(d,hg,o,mat,0,hg/2,wd/2-o/2,p);
  for(let i=1;i<cols;i++) box(d-0.01,hg-2*o,t,mat,0,hg/2,-wd/2+o+i*(c+t)-t/2,p);
  for(let j=1;j<nr;j++) box(d-0.01,t,wd-2*o,mat,0,o+j*(c+t)-t/2,0,p);
  box(0.008,hg-0.02,wd-0.02,opt.back==null?col:opt.back,-d/2+0.004,hg/2,0,p);
  for(let j=0;j<nr;j++) for(let i=0;i<cols;i++){
    const ch=rows[nr-1-j][i], zc=-wd/2+o+c/2+i*(c+t), yb=o+j*(c+t), seed=31+j*7+i*13+(opt.seed||0);
    if(ch==='b'){K.books(p,0.03,yb,zc+0.02,0.27,0.25,0.2,seed); }
    else if(ch==='s'){K.bookStack(p,0.04,yb,zc,4,seed);}
    else if(ch==='x'||ch==='y'){const bc=ch==='x'?(opt.box==null?0xd9c9a8:opt.box):(opt.box2==null?0x8fbd9b:opt.box2);
      box(0.36,0.315,0.318,bc,0.012,yb+0.16,zc,p); box(0.006,0.03,0.1,0x3a3a36,0.194,yb+0.24,zc,p);}
    else if(ch==='p'){K.bush(p,0.04,yb,zc,0.085);}
    else if(ch==='v'){cyl(0.05,0.22,opt.vase==null?0x9fc4d6:opt.vase,0.04,yb+0.11,zc,p,14,0.028);}
    else if(ch==='l'){K.tableLamp(p,0.04,yb,zc,opt.ch||'L:living',0.8);}
    else if(ch==='k'){box(0.16,0.26,0.17,0x2b2b2b,0.04,yb+0.13,zc,p); cyl(0.05,0.004,0x55585c,0.122,yb+0.13,zc,p,14).rotation.z=Math.PI/2;}
  }
  return {w:wd,h:hg,d:d};
};

/* ---------- seats ---------- */
/* stitched seam: a thin darker band round a cushion, at height y */
function seam(p,w,d,y,x,z,c){const m=box(w+0.004,0.006,d+0.004,c,x,y,z,p); m.castShadow=false; return m;}
function shade(c,f){const q=new THREE.Color(c); q.multiplyScalar(f); return q.getHex();}
K.armchair=function(p,c,d){                    // faces +x. Wooden legs, loose seat cushion, rolled arms, a slightly raked back
  [[-.3,-.31],[.3,-.31],[-.3,.31],[.3,.31]].forEach(function(q){const l=cyl(0.016,0.17,0x8a6a3c,q[0],0.085,q[1],p,10,0.026); l.rotation.set(q[1]*0.25,0,-q[0]*0.25);});
  rbox(0.76,0.2,0.78,d,0,0.27,0,p,0.06);                                   // frame
  rbox(0.6,0.13,0.54,c,0.07,0.415,0,p,0.055); seam(p,0.56,0.5,0.415,0.07,0,shade(c,0.82));   // seat cushion
  const b=rbox(0.2,0.66,0.76,d,-0.3,0.66,0,p,0.08); b.rotation.z=0.1;      // back
  const bc=rbox(0.14,0.46,0.5,c,-0.19,0.68,0,p,0.06); bc.rotation.z=0.14;  // back cushion
  [-0.33,0.33].forEach(function(z){rbox(0.62,0.26,0.15,d,0.05,0.47,z,p,0.07); const r=cyl(0.075,0.62,d,0.05,0.6,z,p,14); r.rotation.z=Math.PI/2;});   // arms with a rolled top
};
K.pouf=function(p,c){                          // a stuffed drum: soft top, bulging sides, a seam round the middle
  cyl(0.235,0.3,c,0,0.2,0,p,26); sph(0.25,c,0,0.2,0,p,1,0.72,1);
  sph(0.235,c,0,0.34,0,p,1,0.32,1); torus(0.248,0.006,shade(c,0.75),0,0.2,0,p).rotation.x=Math.PI/2;
  cyl(0.03,0.012,shade(c,0.75),0,0.418,0,p,10);
};
K.chair=function(p,frame,seat){                // faces +x. Padded seat, curved top rail, tapered legs
  rbox(0.41,0.035,0.41,frame,0,0.45,0,p,0.012); rbox(0.37,0.045,0.37,seat,0.005,0.487,0,p,0.02);
  [[-.17,-.17],[.17,-.17],[-.17,.17],[.17,.17]].forEach(function(q){cyl(0.013,0.44,frame,q[0],0.22,q[1],p,8,0.02);});
  [-0.17,0.17].forEach(function(z){const s=cyl(0.016,0.5,frame,-0.2,0.7,z,p,8); s.rotation.z=0.07;});
  const r1=rbox(0.03,0.11,0.4,frame,-0.215,0.9,0,p,0.012); r1.rotation.z=0.07; const r2=rbox(0.024,0.06,0.36,frame,-0.203,0.72,0,p,0.01); r2.rotation.z=0.07;
};
/* office chair, facing +x, origin on the floor under the middle of the seat (seat top at 0.52): a five-star base on twin castors, gas lift,
   tilt mechanism with its lever, a padded seat, a tall back upholstered in three sections that narrow upward, a headrest, and armrests.
   The arm pads stay outside the sitter's forearms and low enough to slide under a desk. */
K.officeChair=function(p,c){
  const fab=M(c), dk=M(0x2b2d30), al=M(0x8d9092), Q=Math.PI/2;
  for(let i=0;i<5;i++){const s=A.G(p); s.rotation.y=-(i/5*Math.PI*2+0.3);
    box(0.29,0.022,0.036,al,0.17,0.082,0,s).rotation.z=-0.13; cyl(0.008,0.03,dk,0.31,0.058,0,s,8);
    [-0.014,0.014].forEach(function(z){cyl(0.026,0.018,dk,0.31,0.026,z,s,14).rotation.x=Q;});}
  cyl(0.042,0.05,al,0,0.105,0,p,16,0.034); cyl(0.027,0.15,dk,0,0.2,0,p,14); cyl(0.016,0.17,0xc9cdd0,0,0.345,0,p,12);                      // hub, gas lift
  box(0.2,0.04,0.22,dk,0,0.43,0,p); box(0.2,0.025,0.06,dk,-0.14,0.425,0,p);                                                              // tilt mechanism, and the arm that carries the back
  cyl(0.006,0.14,dk,0.05,0.425,0.17,p,8).rotation.x=Q; box(0.035,0.008,0.045,dk,0.05,0.425,0.245,p);                                    // its lever
  rbox(0.45,0.03,0.45,dk,0.025,0.455,0,p,0.012,0.08); rbox(0.48,0.07,0.48,fab,0.03,0.486,0,p,0.032,0.1);                                 // seat shell and cushion, just clear of the spine
  const b=A.G(p); b.position.set(-0.19,0.47,0); b.rotation.z=0.11;                                                                        // the back leans a little
  box(0.02,0.855,0.045,dk,-0.03,0.3725,0,b);                                                                                               // one spine, from under the seat up to the headrest
  [[0.22,0.45,0.19],[0.22,0.42,0.4],[0.18,0.37,0.59],[0.12,0.25,0.775]].forEach(function(q){rbox(0.046,q[0],q[1],fab,0.002,q[2],0,b,0.02);});   // lumbar, middle and shoulder sections in one plane, meeting at seams; then the headrest
  [-0.285,0.285].forEach(function(z){                                                                                                       // armrests: bracket, post, pad
    box(0.05,0.014,0.1,dk,-0.03,0.447,z*0.85,p); box(0.045,0.238,0.018,dk,-0.03,0.559,z,p); rbox(0.24,0.022,0.055,dk,0.005,0.689,z,p,0.009,0.025);});
};
K.cushions=[];                              // every loose cushion: one that would be inside somebody sitting or lying there is put away
K.cushion=function(p,c,x,y,z,s,tilt){       // a plump scatter cushion
  const g=A.G(p); g.position.set(x,y,z); g.rotation.z=tilt==null?0.3:tilt; K.cushions.push(g);
  rbox(0.15*s,0.36*s,0.36*s,c,0,0,0,g,0.07*s); return g;};

/* ---------- computer screens: dark until someone sits down to work ---------- */
const wkCv=document.createElement('canvas'); wkCv.width=256; wkCv.height=144;
const wkG=wkCv.getContext('2d'), wkTex=new THREE.CanvasTexture(wkCv); let wkLast=0;
K.screens=[];
K.screen=function(p,w,h,x,y,z,rotY){
  const m=new THREE.MeshBasicMaterial({map:wkTex,color:0x0b0c0d}), s=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);
  s.position.set(x,y,z); s.rotation.y=rotY; (p||A.scene).add(s); const o={m:m,on:0,target:0}; K.screens.push(o); return o;
};
/* a monitor standing on a desk, facing +z before rotY: foot, neck, a thin panel with a narrow bezel and a chin, tipped back a little.
   x,y,z is the middle of the panel's width, on the desk top; w,h are the picture. Returns its screen (see K.screen). */
K.monitor=function(p,x,y,z,rotY,w,h){
  const g=A.G(p), dk=M(0x1b1c1e), sv=M(0xb9bdc0), hd=A.G(g), cy=0.13+h/2; g.position.set(x,y,z); g.rotation.y=rotY||0;
  rbox(0.24,0.012,0.18,sv,0,0.006,-0.03,g,0.005,0.04); box(0.05,cy,0.014,sv,0,cy/2,-0.07,g).rotation.x=0.1;                         // foot and neck
  hd.position.set(0,cy,0); hd.rotation.x=-0.07;
  rbox(w+0.016,h+0.03,0.016,dk,0,-0.007,0,hd,0.006); rbox(w*0.55,h*0.6,0.035,dk,0,0,-0.018,hd,0.012); box(0.07,0.07,0.03,sv,0,-0.02,-0.04,hd);   // panel, the bulge behind it, the mount
  return K.screen(hd,w,h,0,0,0.01,0);
};
A.frameFns.push(function(dt,t){
  let any=false;
  K.screens.forEach(function(o){if(o.on!==o.target){const d=o.target-o.on, q=dt*4; o.on=Math.abs(d)<=q?o.target:o.on+Math.sign(d)*q; o.m.color.setScalar(0.045+0.955*o.on);} if(o.on>0) any=true;});
  if(!any||t-wkLast<0.12) return; wkLast=t;
  const g=wkG, r=rng(4); g.fillStyle='#f7f7f4'; g.fillRect(0,0,256,144); g.fillStyle='#1F5A41'; g.fillRect(0,0,256,14); g.fillStyle='#e9ece7'; g.fillRect(0,14,46,130);
  for(let i=0;i<7;i++){g.fillStyle='#b9c2bc'; g.fillRect(6,22+i*14,30,6);}
  const typed=Math.floor(t*9)%330, lines=12; let n=0;
  for(let i=0;i<lines;i++){const len=14+Math.floor(r()*14); for(let c=0;c<len&&n<typed;c++,n++){g.fillStyle=i%5===0&&c<8?'#1F5A41':'#3b4a44'; g.fillRect(56+c*6.6,24+i*9.5,5,4);}}
  if(Math.floor(t*2)%2){const i=Math.min(lines-1,Math.floor(typed/21)); g.fillStyle='#17211C'; g.fillRect(56+((typed%21)+1)*6.6,22+i*9.5,2,7);}
  wkTex.needsUpdate=true;
});

/* ---------- coffee: an espresso machine with a group head, portafilter, drip tray and steam wand, and a grinder.
   Both face +x. The machine carries a marker where a cup stands under the spout. ---------- */
K.espressos=[];
K.espresso=function(p,x,y,z,rotY){
  const g=A.G(p), steel=0xc9ccd0, dk=0x2b2d2f; g.position.set(x,y,z); g.rotation.y=rotY||0;
  rbox(0.17,0.34,0.26,steel,-0.055,0.17,0,g,0.012); box(0.172,0.012,0.262,dk,-0.055,0.346,0,g);                 // body, cup warmer on top
  [[-0.09,-0.06],[-0.03,0.05]].forEach(function(q){cyl(0.024,0.05,0xfbfaf6,q[0],0.377,q[1],g,14,0.03);});
  box(0.115,0.05,0.24,dk,0.0875,0.025,0,g); box(0.105,0.006,0.22,0x8d9296,0.0875,0.053,0,g);                     // drip tray and its grille
  for(let i=-4;i<=4;i++) box(0.1,0.003,0.006,dk,0.0875,0.058,i*0.024,g).castShadow=false;
  cyl(0.032,0.05,0xb9bdc0,0.068,0.238,0,g,18); cyl(0.034,0.024,dk,0.072,0.2,0,g,18);                             // group head, portafilter
  box(0.11,0.018,0.022,dk,0.155,0.2,0,g); [-0.012,0.012].forEach(function(dz){box(0.008,0.014,0.008,0xb9bdc0,0.075,0.182,dz,g);});
  const wand=cyl(0.006,0.15,0xb9bdc0,0.062,0.2,0.105,g,8); wand.rotation.z=-0.3; cyl(0.012,0.02,dk,0.04,0.275,0.105,g,10);       // steam wand
  const gauge=cyl(0.024,0.008,0xfbfaf6,0.033,0.295,-0.07,g,18); gauge.rotation.z=Math.PI/2; cyl(0.027,0.006,dk,0.03,0.295,-0.07,g,18).rotation.z=Math.PI/2;
  box(0.004,0.016,0.003,0xd9463e,0.038,0.3,-0.07,g).rotation.x=0.6;
  [0.02,0.07].forEach(function(dz){cyl(0.012,0.014,dk,0.036,0.295,dz,g,12).rotation.z=Math.PI/2;});              // buttons
  const cup=new THREE.Object3D(); cup.position.set(0.078,0.091,0); g.add(cup); g.userData.cup=cup; K.espressos.push(g);
  return g;
};
K.grinder=function(p,x,y,z,rotY){
  const g=A.G(p), dk=0x2b2d2f; g.position.set(x,y,z); g.rotation.y=rotY||0;
  rbox(0.12,0.22,0.12,dk,0,0.11,0,g,0.012); box(0.07,0.02,0.05,0x8d9296,0.075,0.1,0,g); box(0.06,0.006,0.08,0x8d9296,0.085,0.012,0,g);
  cyl(0.035,0.11,A.reg(new THREE.MeshLambertMaterial({color:0xdfe6e6,transparent:true,opacity:0.55})),0,0.275,0,g,16,0.06).castShadow=false;      // bean hopper
  cyl(0.03,0.05,0x3a2416,0,0.25,0,g,14,0.047); cyl(0.062,0.01,dk,0,0.335,0,g,16); cyl(0.012,0.012,0xb9bdc0,0.062,0.16,0,g,10).rotation.z=Math.PI/2;
  return g;
};

/* ---------- desk things: a keyboard with printed keys, and a mouse. The keyboard is long along z. ---------- */
const kbTex=canvasTex(256,80,function(g){
  g.fillStyle='#dfe0dc'; g.fillRect(0,0,256,80);
  for(let r=0;r<5;r++) for(let c=0;c<15;c++){const w=(r===4&&c>3&&c<10)?0:14; if(r===4&&c===4){g.fillStyle='#fbfbf9'; g.fillRect(8+c*16.2,8+r*13.6,95,11);} if(!w) continue; g.fillStyle='#fbfbf9'; g.fillRect(8+c*16.2,8+r*13.6,w,11); g.fillStyle='rgba(60,70,66,.35)'; g.fillRect(12+c*16.2,12+r*13.6,4,2);}
});
K.keyboard=function(p,x,y,z,rotY,dark){
  const g=A.G(p); g.position.set(x,y,z); g.rotation.y=rotY||0;
  rbox(0.13,0.012,0.4,dark?0x1b1c1e:0xe2e3e0,0,0.006,0,g,0.004);
  const m=A.MT(kbTex); if(dark) m.color.set(0x55585c);
  const t=new THREE.Mesh(new THREE.PlaneGeometry(0.385,0.118),m); t.rotation.set(-Math.PI/2,0,Math.PI/2); t.position.y=0.0125; g.add(t); return g;
};
K.mouse=function(p,x,y,z,dark){return sph(0.03,dark?0x1b1c1e:0xe6e7e4,x,y+0.011,z,p,0.72,0.42,1.12);};

/* ---------- rugs ---------- */
K.rugTex=function(kind){
  return canvasTex(256,384,function(g,w,h){
    if(kind==='stripe'){
      g.fillStyle='#efe7d6'; g.fillRect(0,0,w,h);
      for(let y=18;y<h;y+=36){g.fillStyle='#a9cbdc'; g.fillRect(0,y,w,9); g.fillStyle='#c9b98f'; g.fillRect(0,y+15,w,2);}
      g.strokeStyle='#d8ccb2'; g.lineWidth=10; g.strokeRect(5,5,w-10,h-10);
    }else if(kind==='kilim'){
      g.fillStyle='#c4673f'; g.fillRect(0,0,w,h);
      g.fillStyle='#f3ebdc'; g.fillRect(14,14,w-28,h-28); g.fillStyle='#b65a35'; g.fillRect(24,24,w-48,h-48);
      const cs=['#f3ebdc','#1F5A41','#D6A21E','#26386b'];
      for(let r=0;r<4;r++) for(let c=0;c<2;c++){const cx=78+c*100, cy=66+r*84; for(let k=0;k<3;k++){g.fillStyle=cs[(r+c+k)%4]; const s=36-k*11; g.beginPath(); g.moveTo(cx,cy-s); g.lineTo(cx+s,cy); g.lineTo(cx,cy+s); g.lineTo(cx-s,cy); g.fill();}}
      g.fillStyle='#f3ebdc'; for(let x=30;x<w-30;x+=14){g.fillRect(x,30,6,6); g.fillRect(x,h-36,6,6);}
    }else if(kind==='runner'){
      g.fillStyle='#e9dcc3'; g.fillRect(0,0,w,h);
      for(let y=10;y<h;y+=30){g.fillStyle=(y/30|0)%2?'#9fc4d6':'#8fbd9b'; g.fillRect(0,y,w,6);}
    }else if(kind==='wool'){
      g.fillStyle='#e7e0d2'; g.fillRect(0,0,w,h); const r=rng(4);
      for(let i=0;i<1400;i++){g.fillStyle='rgba(120,105,80,'+(0.05+r()*0.08)+')'; g.fillRect(r()*w,r()*h,3,2);}
      g.strokeStyle='#cfc4ad'; g.lineWidth=8; g.strokeRect(8,8,w-16,h-16);
    }else{                   // jute
      g.fillStyle='#b89a63'; g.fillRect(0,0,w,h); g.fillStyle='#d2bb8a'; g.fillRect(16,16,w-32,h-32);
      const r=rng(2); for(let i=0;i<900;i++){g.fillStyle='rgba(120,90,40,.10)'; g.fillRect(16+r()*(w-34),16+r()*(h-34),5,1.5);}
    }
  });
};
/* flat rug, w along x, l along z */
K.rug=function(p,w,l,kind,y){
  const top=A.MT(K.rugTex(kind),null,true), side=M(0xb8a888);
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,0.012,l),[side,side,top,side,side,side]);
  m.position.set(0,(y||0)+0.006,0); m.receiveShadow=true; p.add(m); return m;
};
K.roundRug=function(p,x,z,r,c,c2){cyl(r,0.012,c,x,0.006,z,p,40).castShadow=false; cyl(r*0.82,0.014,c2,x,0.007,z,p,40).castShadow=false;};
K.curtain=function(p,x,z,w,alongX,y0,y1,c){
  const n=Math.max(3,Math.round(w/0.07));
  for(let i=0;i<n;i++){const t=(i+0.5)/n-0.5, o=(i%2?0.012:-0.012);
    box(alongX?w/n*1.05:0.03,y1-y0,alongX?0.03:w/n*1.05,c==null?0xf1ece0:c,x+(alongX?t*w:o),(y0+y1)/2,z+(alongX?o:t*w),p);}
};

/* ---------- television: one shared animated screen ---------- */
const tvCv=document.createElement('canvas'); tvCv.width=256; tvCv.height=144;
const tvG=tvCv.getContext('2d'), tvTex=new THREE.CanvasTexture(tvCv);
const tvMat=K.tvMat=new THREE.MeshBasicMaterial({map:tvTex,color:0x08090a});
K.tvShow='day';
let tvLast=0;
function drawTV(t){
  const g=tvG;
  if(K.tvShow==='movie'){        // night sky with a rocket, for pajama parties
    g.fillStyle='#0d1030'; g.fillRect(0,0,256,144);
    const r=rng(8); g.fillStyle='#fff'; for(let i=0;i<50;i++){const tw=0.5+0.5*Math.sin(t*3+i); g.globalAlpha=0.4+0.6*tw; g.fillRect(r()*256,r()*110,2,2);} g.globalAlpha=1;
    g.fillStyle='#f4e7b0'; g.beginPath(); g.arc(205,34,18,0,7); g.fill(); g.fillStyle='#0d1030'; g.beginPath(); g.arc(197,29,15,0,7); g.fill();
    const x=((t*38)%330)-40, y=96-Math.sin(t*1.3)*18;
    g.fillStyle='#ffb347'; g.beginPath(); g.moveTo(x-22,y); g.lineTo(x-40-Math.random()*10,y+5); g.lineTo(x-22,y+10); g.fill();
    g.fillStyle='#e9ecef'; g.beginPath(); g.ellipse(x,y+5,24,9,0,0,7); g.fill(); g.fillStyle='#d9463e'; g.beginPath(); g.moveTo(x+18,y-2); g.lineTo(x+34,y+5); g.lineTo(x+18,y+12); g.fill();
    g.fillStyle='#7fc4f5'; g.beginPath(); g.arc(x+4,y+4,4,0,7); g.fill();
    g.fillStyle='#1c2a4a'; g.beginPath(); g.moveTo(0,144); g.lineTo(0,126); g.quadraticCurveTo(70,108,128,128); g.quadraticCurveTo(190,112,256,130); g.lineTo(256,144); g.fill();
  }else if(K.tvShow==='football'){ // a match seen from the stand
    g.fillStyle='#2f8f4a'; g.fillRect(0,0,256,144); for(let i=0;i<8;i++){g.fillStyle=i%2?'#2a8444':'#35994f'; g.fillRect(i*32,0,32,144);}
    g.strokeStyle='rgba(255,255,255,.85)'; g.lineWidth=2; g.strokeRect(8,10,240,112); g.beginPath(); g.moveTo(128,10); g.lineTo(128,122); g.stroke(); g.beginPath(); g.arc(128,66,20,0,7); g.stroke();
    g.strokeRect(8,40,30,52); g.strokeRect(218,40,30,52);
    const bx=128+Math.sin(t*0.9)*95, by=66+Math.sin(t*1.7)*38, r=rng(3);
    for(let i=0;i<10;i++){const px=30+r()*196+Math.sin(t*0.8+i)*10+(bx-128)*0.25, py=20+r()*92+Math.cos(t*0.9+i*2)*8; g.fillStyle=i%2?'#f0d21c':'#d9463e'; g.beginPath(); g.arc(px,py,4,0,7); g.fill();}
    g.fillStyle='#fff'; g.beginPath(); g.arc(bx,by,3,0,7); g.fill();
    g.fillStyle='rgba(0,0,0,.6)'; g.fillRect(0,124,256,20); g.fillStyle='#fff'; g.font='bold 12px sans-serif'; g.fillText('MAC 1 : 1 HAP   '+(60+Math.floor(t)%30)+"'",8,138);
  }else if(K.tvShow==='netflix'){  // a streaming drama: red title card, then two people talking at night
    const ph=(t%14);
    if(ph<2.2){g.fillStyle='#000'; g.fillRect(0,0,256,144); g.fillStyle='#e50914'; g.font='bold 54px sans-serif'; g.textAlign='center'; g.globalAlpha=Math.min(1,ph); g.fillText('N',128,92); g.globalAlpha=1; g.textAlign='left';}
    else{const sky=g.createLinearGradient(0,0,0,144); sky.addColorStop(0,'#1a1430'); sky.addColorStop(1,'#5a2a3a'); g.fillStyle=sky; g.fillRect(0,0,256,144);
      g.fillStyle='#f4c27a'; for(let i=0;i<14;i++) g.fillRect(10+i*18,70+((i*7)%5)*6,6,8);
      g.fillStyle='#120e1c'; g.fillRect(0,110,256,34);
      [[86,0],[170,1]].forEach(function(q){const bob=Math.sin(t*2+q[1]*2)*1.5; g.fillStyle=q[1]?'#3a5a7a':'#7a3a4a'; g.fillRect(q[0]-16,74+bob,32,50); g.fillStyle='#e2b28f'; g.beginPath(); g.arc(q[0],62+bob,13,0,7); g.fill(); g.fillStyle='#2a1a12'; g.beginPath(); g.arc(q[0],57+bob,13,Math.PI,0); g.fill();});
      g.fillStyle='rgba(0,0,0,.55)'; g.fillRect(40,124,176,14); g.fillStyle='#fff'; g.font='10px sans-serif'; g.fillText(['I never said I was leaving.','Then why is the bag packed?','It is for the weekend.'][Math.floor(ph/4)%3],48,134);}
  }else{                         // sunny road trip in the mint bus from the painting
    const sky=g.createLinearGradient(0,0,0,100); sky.addColorStop(0,'#7fc4f5'); sky.addColorStop(1,'#fbe3b0'); g.fillStyle=sky; g.fillRect(0,0,256,144);
    g.fillStyle='#fff2b0'; g.beginPath(); g.arc(200,36,17,0,7); g.fill();
    g.fillStyle='#fff'; for(let i=0;i<3;i++){const cx=((i*110-t*9)%330+330)%330-40; g.beginPath(); g.ellipse(cx,28+i*13,24,8,0,0,7); g.fill();}
    g.fillStyle='#6fae7c'; for(let i=0;i<4;i++){const hx=((i*95-t*22)%380+380)%380-60; g.beginPath(); g.ellipse(hx,108,70,30,0,Math.PI,0); g.fill();}
    g.fillStyle='#4f8d5e'; g.fillRect(0,104,256,40); g.fillStyle='#565a60'; g.fillRect(0,116,256,22);
    g.fillStyle='#f3ebdc'; for(let i=0;i<6;i++){const dx=((i*52-t*70)%312+312)%312-30; g.fillRect(dx,126,26,3);}
    const by=96+Math.sin(t*9)*1.2;
    g.fillStyle='#7fc4b5'; g.fillRect(84,by,84,26); g.fillStyle='#4f9a8b'; g.fillRect(84,by+18,84,8);
    g.fillStyle='#cfe9e3'; g.fillRect(90,by+4,22,11); g.fillRect(116,by+4,22,11); g.fillRect(142,by+4,20,11);
    g.fillStyle='#2a2d2f'; g.beginPath(); g.arc(102,by+27,7,0,7); g.arc(150,by+27,7,0,7); g.fill();
  }
  tvTex.needsUpdate=true;
}
A.frameFns.push(function(dt,t){
  const v=A.get('tv'); tvMat.color.setScalar(0.03+0.97*v);
  if(v>0.02&&t-tvLast>0.07){tvLast=t; drawTV(t);}
});
/* TV panel facing +x, centred at (x,y,z) */
K.tv=function(p,x,y,z){
  box(0.04,0.71,1.23,0x101214,x,y,z,p);
  const s=new THREE.Mesh(new THREE.PlaneGeometry(1.19,0.67),tvMat); s.position.set(x+0.0215,y,z); s.rotation.y=Math.PI/2; p.add(s);
  A.pool('tv',0x9fc4ff,x-0.022,y,z,1.05,p,0.4,Math.PI/2);
  A.pool('tv',0x9fc4ff,x+1.0,0.034,z,1.3,p,0.2);
};

/* ---------- cordless stick vacuum ----------
   Built at the origin with the floor head pointing to +z. The stick pivots at the neck of the head: it stands upright
   on its dock, and K.vacuumHold leans it back into a hand. mat(colour, options) makes the materials. */
const VAC={py:0.05,gy:1.0,gz:-0.092};        // height of the pivot; the grip, measured from the pivot along the stick and behind it
K.vacuum=function(p,mat){
  mat=mat||function(c,o){return A.reg(new THREE.MeshLambertMaterial(Object.assign({color:c},o||{})));};
  const g=A.G(p), dk=mat(0x2c2f33), ac=mat(0x8fbd9b), st=mat(0xb9bdc0), red=mat(0xd9463e), Q=Math.PI/2;
  rbox(0.25,0.034,0.09,dk,0,0.023,0.03,g,0.012);                                                  // floor head, with a soft roller across the front
  cyl(0.017,0.236,ac,0,0.019,0.075,g,14).rotation.z=Q; [-0.122,0.122].forEach(function(x){cyl(0.019,0.008,dk,x,0.019,0.075,g,14).rotation.z=Q;});
  [-0.085,0.085].forEach(function(x){cyl(0.013,0.014,st,x,0.013,-0.022,g,12).rotation.z=Q;});      // wheels
  cyl(0.021,0.06,dk,0,VAC.py,0,g,14).rotation.z=Q;                                                // swivel neck
  const s=g.userData.stick=A.G(g); s.position.y=VAC.py;
  cyl(0.019,0.07,dk,0,0.045,0,s,14); cyl(0.0145,0.7,ac,0,0.42,0,s,14);                            // socket and wand
  cyl(0.02,0.045,dk,0,0.79,0,s,14); box(0.012,0.02,0.01,red,0,0.79,0.021,s);                      // collar with its release catch
  cyl(0.047,0.16,mat(0xdfe9ea,{transparent:true,opacity:0.4}),0,0.895,0,s,22).castShadow=false;   // clear bin round a steel shroud, a little dust in it
  cyl(0.027,0.14,st,0,0.895,0,s,16); cyl(0.043,0.028,mat(0x9a948a),0,0.832,0,s,18);
  cyl(0.05,0.022,ac,0,0.986,0,s,22); cyl(0.046,0.075,dk,0,1.035,0,s,22,0.04); cyl(0.034,0.02,ac,0,1.083,0,s,18,0.028);     // cyclone ring, motor, filter cap
  rbox(0.05,0.07,0.075,dk,0,0.9,-0.085,s,0.012); cyl(0.015,0.13,dk,0,0.995,VAC.gz,s,12);          // battery, grip
  box(0.03,0.028,0.075,dk,0,1.062,-0.06,s); box(0.01,0.03,0.012,red,0,1.02,-0.073,s);             // bridge to the motor, trigger
  return g;
};
const vacP=new THREE.Vector3();
K.vacuumHold=function(g,fore){        // g hangs in the person's group: stand the head on the floor ahead of that forearm's hand and lean the grip into the palm
  if(!g.parent) return;
  fore.updateWorldMatrix(true,false); g.parent.worldToLocal(fore.localToWorld(vacP.set(0,-0.295,0.005)));
  const len=Math.hypot(VAC.gy,VAC.gz), a=Math.acos(Math.max(-1,Math.min(1,(vacP.y-VAC.py)/len)));       // how far the line from pivot to grip leans back
  g.position.set(vacP.x,0,vacP.z+len*Math.sin(a)); g.userData.stick.rotation.x=Math.atan2(-VAC.gz,VAC.gy)-a;
};
})();
