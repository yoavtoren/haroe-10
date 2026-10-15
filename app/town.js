/* Haroe 10 — the neighbourhood, from OpenStreetMap, as far as the satellite view reaches: Herzl St and Rambam Square to the west, Krinitsi,
   Ha-Gat and Ha-Gilgal to the east, Moshe Sharet, HaParsa and Shatil to the north, David, Natan, HaEshel and Shilo to the south.
   Every block stands on its own outline at its own height (where the map does not say, four floors over a ground floor, as most here are):
   its windows with their shutters part way down, closed-in balconies, air conditioners, a ground floor on pillars or with shops on the main
   streets, a parapet round the roof and the water heaters on it. The streets have their pavements, kerbs, zebra crossings, lamps, trees,
   parked cars and street signs in Hebrew and English. In the evening the windows and the lamps come on.
   And a map for walking: out of the street round the square you can walk (or drive) down any of these streets. building.js draws the square
   nearest us; this draws everything round it, and the blocks inside it that building.js leaves out. */
(function(){
'use strict';
const A=window.APP, TD=A.townData, BD=A.building, det=A.det, LB=A.LB, SF=A.street, D=A.D;
if(!TD||!BD||!det||!LB||!SF) return;
const R=Math.PI, XF=LB.XF, ZC=LB.ZC, U=SF.U, warp=BD.warp, pt=BD.pt, scene=A.scene;
/* the blocks and trees have a light of their own: by day the street's, in the evening darker than the street round the square with its lamps, so the windows show */
if(!A.rooms.town) A.addRoom('town',{name:'The neighbourhood',rs:[],win:null,dl:1,node:'out',ext:true});
const TOUCH=('ontouchstart' in window)||navigator.maxTouchPoints>0, LITE=TOUCH||/[?&]lite/.test(location.search);
const TS=1300, TX0=XF-600, TZ0=ZC-600;                       // the ground: 1.3 km square round our front
const IS=370, IX0=XF-175, IZ0=ZC-200;                        // the square building.js draws in finer detail, left open in ours
const OURC=[XF-11,ZC+5], PH=0.13;                         // our front's corner; how high a pavement stands over the road
const cafes=[], zebras=[];                                    // the cafés' chairs out on the pavements; the zebra crossings
function hyp(a,b){return Math.hypot(a,b);}

/* ---------- the map, in the model ---------- */
const WID={1:[7.4,3.4],2:[6.2,2.6],3:[3.6,0.9],4:[0,6],5:[0,2.0],6:[9,3.6],7:[8,3.2],8:[0,2.4]};      // carriageway, pavement each side
const roads=TD.R.map(function(r,i){const p=[]; for(let k=0;k<r[3].length;k+=2) p.push(pt(r[3][k]/10,r[3][k+1]/10)); return {i:i,k:r[0],name:r[1],he:r[2],p:p,w:WID[r[0]]};});
function outline(f,each){const n=f.length/2; let cu=0, cv=0; for(let i=0;i<n;i++){cu+=f[2*i]; cv+=f[2*i+1];} cu/=n*10; cv/=n*10; const du=warp(cu,cv)-cu, out=[];
  for(let i=0;i<n;i++){const u=f[2*i]/10, v=f[2*i+1]/10; const q=[XF+v,ZC+(each?warp(u,v):u+du)]; if(!out.length||hyp(q[0]-out[out.length-1][0],q[1]-out[out.length-1][1])>0.05) out.push(q);}
  if(out.length>2&&hyp(out[0][0]-out[out.length-1][0],out[0][1]-out[out.length-1][1])<0.05) out.pop();
  let a2=0; for(let i=0;i<out.length;i++){const a=out[i], b=out[(i+1)%out.length]; a2+=a[0]*b[1]-b[0]*a[1];} if(a2>0) out.reverse();      // so that every wall's outside is to the left of its run: (-dz, dx)
  return out;}
function areaOf(p){let a=0; for(let i=0;i<p.length;i++){const q=p[i], r=p[(i+1)%p.length]; a+=q[0]*r[1]-r[0]*q[1];} return Math.abs(a)/2;}
function inPoly(p,x,z){let c=false; for(let i=0,j=p.length-1;i<p.length;j=i++){const a=p[i], b=p[j]; if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0]) c=!c;} return c;}
function segD(x,z,a,b){const dx=b[0]-a[0], dz=b[1]-a[1], l2=dx*dx+dz*dz||1, t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/l2)); return hyp(a[0]+t*dx-x,a[1]+t*dz-z);}
function polyD(p,x,z){let d=1e9; for(let i=0;i<p.length;i++) d=Math.min(d,segD(x,z,p[i],p[(i+1)%p.length])); return d;}
const blds=TD.B.map(function(b,i){const p=outline(b[3]); let cx=0, cz=0; p.forEach(function(q){cx+=q[0]; cz+=q[1];}); return {i:i,lv:b[0],k:b[1],name:b[2],p:p,c:[cx/p.length,cz/p.length],area:areaOf(p)};})
  .filter(function(b){return b.p.length>=3&&b.area>4;});
/* where building.js and the street draw their own: our building and number 12, the yard a floor down, the forecourts and bridges */
const LBH=-warp(-20.4,0), GZs=SF.GZ;
const KEEP=[[XF-23.2,SF.X0+GZs-0.1,ZC-LBH-0.6,ZC+19.5]];        // x0,x1,z0,z1: nothing of ours here, and not walked by this map
const own=TD.X.map(function(x){return outline(x[1],x[0]===798);}).concat([[[12.05,14.2],[55.2,14.2],[55.2,31.2],[12.05,31.2]],[[12.05,0.05],[17.6,0.05],[17.6,14.15],[12.05,14.15]],[[25.93,-10.78],[38.46,-15.14],[49.35,14],[35.3,14]]]
  .map(function(q){const o=q.map(function(p){return [XF+p[1],ZC+p[0]];}); let a2=0; for(let i=0;i<o.length;i++){const a=o[i], b=o[(i+1)%o.length]; a2+=a[0]*b[1]-b[0]*a[1];} return a2>0?o.reverse():o;}));      // number 12, along Haroe St, its wing and its back wing
function nearHome(x,z){return x>XF-30&&x<XF+50&&z>ZC-56&&z<ZC+24;}

/* ---------- roads: where they meet ---------- */
const nodes=new Map();
function key(q){return Math.round(q[0]*5)+','+Math.round(q[1]*5);}
roads.forEach(function(r){r.p.forEach(function(q,j){const k=key(q); let n=nodes.get(k); if(!n) nodes.set(k,n={x:q[0],z:q[1],roads:[],end:0}); if(n.roads.indexOf(r)<0) n.roads.push(r); if(j===0||j===r.p.length-1) n.end++;});});
const cross=[]; nodes.forEach(function(n){const car=n.roads.filter(function(r){return r.w[0]>0;}); if(car.length>=2||(car.length===1&&n.roads.length>=2&&n.end<n.roads.length)) cross.push({x:n.x,z:n.z,roads:n.roads,car:car});});
/* near a junction: another road's carriageway is close */
const rgrid=new Map(), RG=40;
roads.forEach(function(r){for(let j=1;j<r.p.length;j++){const a=r.p[j-1], b=r.p[j], i0=Math.floor(Math.min(a[0],b[0])/RG)-1, i1=Math.floor(Math.max(a[0],b[0])/RG)+1, k0=Math.floor(Math.min(a[1],b[1])/RG)-1, k1=Math.floor(Math.max(a[1],b[1])/RG)+1;
  for(let i=i0;i<=i1;i++) for(let k=k0;k<=k1;k++){const kk=i+','+k; let l=rgrid.get(kk); if(!l) rgrid.set(kk,l=[]); l.push([r,j]);}}});
function roadNear(x,z,skip){let best=null; const l=rgrid.get(Math.floor(x/RG)+','+Math.floor(z/RG)); if(!l) return null;
  for(let n=0;n<l.length;n++){const r=l[n][0], j=l[n][1]; if(r===skip) continue; const d=segD(x,z,r.p[j-1],r.p[j])-r.w[0]/2; if(!best||d<best.d) best={d:d,r:r,j:j};} return best;}
function onRoad(x,z,pad){const q=roadNear(x,z); return !!q&&q.d<(pad||0);}
function nearJunction(x,z,r,m){const q=roadNear(x,z,r); return !!q&&q.r.w[0]>0&&q.d<m;}

const OB=new Map(), OG=8;      // what stands in the way on the pavements, trees, lamps, bins, parked cars: circles in a fine grid
/* ---------- buildings, for the map and the trees: a coarse grid of outlines ---------- */
const bgrid=new Map(), BG=24;
function addB(p,o){let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9; p.forEach(function(q){x0=Math.min(x0,q[0]); x1=Math.max(x1,q[0]); z0=Math.min(z0,q[1]); z1=Math.max(z1,q[1]);});
  o.bb=[x0,x1,z0,z1]; for(let i=Math.floor(x0/BG);i<=Math.floor(x1/BG);i++) for(let k=Math.floor(z0/BG);k<=Math.floor(z1/BG);k++){const kk=i+','+k; let l=bgrid.get(kk); if(!l) bgrid.set(kk,l=[]); l.push(o);}}
blds.forEach(function(b){addB(b.p,b);}); own.forEach(function(p){addB(p,{p:p});});
function inBuilding(x,z,pad){const l=bgrid.get(Math.floor(x/BG)+','+Math.floor(z/BG)); if(!l) return false;
  for(let i=0;i<l.length;i++){const o=l[i], bb=o.bb; if(x<bb[0]-pad||x>bb[1]+pad||z<bb[2]-pad||z>bb[3]+pad) continue; if(inPoly(o.p,x,z)||(pad>0&&polyD(o.p,x,z)<pad)) return true;} return false;}
function kept(x,z){for(let i=0;i<KEEP.length;i++){const k=KEEP[i]; if(x>k[0]&&x<k[1]&&z>k[2]&&z<k[3]) return true;} return false;}

/* =====================================================================
   The ground: streets, pavements, gardens and parks, painted on one big canvas
   ===================================================================== */
const N=LITE?2048:4096, K=N/TS;
function cp(x,z){return [(z-TZ0)*K,(TX0+TS-x)*K];}
const gcan=document.createElement('canvas'); gcan.width=gcan.height=N;
(function paint(){
  const g=gcan.getContext('2d'), r=A.rng(4711);
  g.fillStyle='#cbc3ae'; g.fillRect(0,0,N,N);
  for(let i=0;i<N*N/300;i++){g.fillStyle='rgba('+(r()<0.5?'255,250,240':'70,60,45')+','+(0.03+r()*0.06)+')'; g.fillRect(r()*N,r()*N,1+r()*2.5,1+r()*2.5);}
  const path=function(p,close){g.beginPath(); p.forEach(function(q,i){const c=cp(q[0],q[1]); if(i) g.lineTo(c[0],c[1]); else g.moveTo(c[0],c[1]);}); if(close) g.closePath();};
  /* gardens: dry grass and earth between the blocks, darker under the hedges */
  for(let i=0;i<3200;i++){const x=TX0+r()*TS, z=TZ0+r()*TS, c=cp(x,z); g.fillStyle=['rgba(140,150,100,0.35)','rgba(120,104,78,0.25)','rgba(155,160,118,0.3)','rgba(90,110,70,0.3)'][Math.floor(r()*4)]; g.beginPath(); g.ellipse(c[0],c[1],(2+r()*6)*K,(2+r()*6)*K,r()*3,0,7); g.fill();}
  blds.forEach(function(b,i){const ex=b.p.map(function(q){const dx=q[0]-b.c[0], dz=q[1]-b.c[1], l=hyp(dx,dz)||1; return [q[0]+dx/l*3.2,q[1]+dz/l*3.2];});
    g.fillStyle=['#97a173','#a7a982','#8e9a6c','#b3ad8c','#9aa577'][i%5]; path(ex,true); g.fill();
    for(let k=0;k<10;k++){const q=b.p[k%b.p.length], c=cp(q[0]+(r()-0.5)*7,q[1]+(r()-0.5)*7); g.fillStyle='rgba(55,80,40,'+(0.25+r()*0.3)+')'; g.beginPath(); g.arc(c[0],c[1],(0.5+r()*1.1)*K,0,7); g.fill();}});
  /* parks, playgrounds, pitches */
  const GC={park:'#8d9a62',garden:'#97a36c',grass:'#9aa86e',dog_park:'#b0a882',playground:'#d6b98c',pitch:'#5e8f52',construction:'#bba98c',brownfield:'#b9ae94'};
  TD.G.forEach(function(a){const p=outline(a[2],true); g.fillStyle=GC[a[0]]||'#9aa86e'; path(p,true); g.fill();
    if(a[0]==='park'||a[0]==='garden') for(let k=0;k<Math.min(400,areaOf(p)/20);k++){let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9; p.forEach(function(q){x0=Math.min(x0,q[0]); x1=Math.max(x1,q[0]); z0=Math.min(z0,q[1]); z1=Math.max(z1,q[1]);});
      const x=x0+r()*(x1-x0), z=z0+r()*(z1-z0); if(!inPoly(p,x,z)) continue; const c=cp(x,z); g.fillStyle='rgba('+(r()<0.5?'70,95,50':'160,150,110')+','+(0.2+r()*0.3)+')'; g.beginPath(); g.arc(c[0],c[1],(0.6+r()*2)*K,0,7); g.fill();}
    if(a[0]==='pitch'){g.strokeStyle='rgba(245,245,240,0.8)'; g.lineWidth=0.15*K; path(p,true); g.stroke();}
    if(a[0]==='playground'){g.strokeStyle='#b0472c'; g.lineWidth=0.3*K; path(p,true); g.stroke();}});
  /* the soft shade round the foot of every block */
  g.save(); g.shadowColor='rgba(40,35,25,0.45)'; g.shadowBlur=2.2*K; g.fillStyle='#8d8676'; blds.concat(own.map(function(p){return {p:p};})).forEach(function(b){path(b.p,true); g.fill();}); g.restore();
  /* streets: pavements, kerbs, asphalt, the lines on it */
  g.lineCap=g.lineJoin='round';
  const stroke=function(p,w,c,dash){g.strokeStyle=c; g.lineWidth=w*K; g.setLineDash(dash||[]); path(p); g.stroke(); g.setLineDash([]);};
  roads.forEach(function(s){if(s.w[0]===0) stroke(s.p,s.w[1],s.k===4?'#d6cfbd':s.k===8?'#cdc5b3':'#d2cab8');});                    // squares, paths and steps, paved
  roads.forEach(function(s){if(s.w[0]>0) stroke(s.p,s.w[0]+2*s.w[1],'#c4bdb0');});                                                     // pavements
  g.strokeStyle='rgba(120,112,98,0.18)'; g.lineWidth=Math.max(1,0.03*K);
  roads.forEach(function(s){if(!s.w[0]) return; g.beginPath(); for(let j=1;j<s.p.length;j++){const a=s.p[j-1], b=s.p[j], l=hyp(b[0]-a[0],b[1]-a[1]); if(l<1) continue; const nx=-(b[1]-a[1])/l, nz=(b[0]-a[0])/l, off=s.w[0]/2+s.w[1];      // the paving: a joint every 60 cm
    for(let t=0;t<l;t+=0.6){const x=a[0]+(b[0]-a[0])*t/l, z=a[1]+(b[1]-a[1])*t/l; [1,-1].forEach(function(sd){const c0=cp(x+nx*sd*s.w[0]/2,z+nz*sd*s.w[0]/2), c1=cp(x+nx*sd*off,z+nz*sd*off); g.moveTo(c0[0],c0[1]); g.lineTo(c1[0],c1[1]);});}} g.stroke();});
  roads.forEach(function(s){if(s.w[0]>0) stroke(s.p,s.w[0]+0.4,'#e9e8e2');});                                                         // kerbs
  roads.forEach(function(s){if(s.w[0]>0) stroke(s.p,s.w[0],s.k===6?'#55595d':'#5c6064');});                                        // asphalt
  roads.forEach(function(s){if(s.w[0]>0) stroke(s.p,s.w[0]*0.55,'rgba(80,84,88,0.5)');});                                           // worn darker down the middle
  for(let i=0;i<N*N/2600;i++){const x=TX0+r()*TS, z=TZ0+r()*TS; if(!onRoad(x,z,-0.3)) continue; const c=cp(x,z), k=r();      // the asphalt's history: repairs, oil, cracks
    if(k<0.35){const w=(1.2+r()*3)*K, h=(0.8+r()*1.8)*K; g.fillStyle='rgba(38,40,42,0.55)'; g.fillRect(c[0],c[1],w,h); g.strokeStyle='rgba(20,21,22,0.6)'; g.lineWidth=Math.max(1,0.06*K); g.strokeRect(c[0],c[1],w,h);}
    else if(k<0.7){g.fillStyle='rgba(25,24,22,'+(0.12+r()*0.18)+')'; g.beginPath(); g.ellipse(c[0],c[1],(0.3+r()*0.6)*K,(0.2+r()*0.4)*K,r()*3,0,7); g.fill();}
    else{g.strokeStyle='rgba(30,31,32,0.5)'; g.lineWidth=Math.max(1,0.04*K); g.beginPath(); g.moveTo(c[0],c[1]); let cx=c[0], cy=c[1]; for(let k2=0;k2<5;k2++){cx+=(r()-0.5)*1.6*K; cy+=(r()-0.5)*1.6*K; g.lineTo(cx,cy);} g.stroke();}}
  for(let i=0;i<N*N/220;i++){g.fillStyle='rgba(0,0,0,'+(r()*0.05)+')'; g.fillRect(r()*N,r()*N,1,1);}
})();
const groundT=new THREE.CanvasTexture(gcan); groundT.anisotropy=8;
/* a fine grain over it, in the world's own measure, so the asphalt and the paving stay crisp at your feet */
const detT=det.tex(256,256,function(g){const r=A.rng(77), im=g.createImageData(256,256), d=im.data;
  const oct=function(cells,seed){const q=A.rng(seed), v=new Float32Array(cells*cells); for(let i=0;i<v.length;i++) v[i]=q();
    return function(x,y){const fx=x/256*cells, fy=y/256*cells, x0=Math.floor(fx), y0=Math.floor(fy), tx=fx-x0, ty=fy-y0, sx=tx*tx*(3-2*tx), sy=ty*ty*(3-2*ty), a=function(i,j){return v[((j+cells)%cells)*cells+((i+cells)%cells)];};
      return (a(x0,y0)*(1-sx)+a(x0+1,y0)*sx)*(1-sy)+(a(x0,y0+1)*(1-sx)+a(x0+1,y0+1)*sx)*sy;};};      // smooth value noise that wraps round
  const n1=oct(4,1), n2=oct(8,2), n3=oct(16,3), n4=oct(32,4);
  for(let y=0;y<256;y++) for(let x=0;x<256;x++){const i=(y*256+x)*4, fine=0.3+0.4*r()*r()+0.3*r(), big=0.4*n1(x,y)+0.3*n2(x,y)+0.2*n3(x,y)+0.1*n4(x,y);
    d[i]=Math.floor(255*fine); d[i+1]=Math.floor(255*big); d[i+2]=128; d[i+3]=255;}
  g.putImageData(im,0,0);},true);
function grain(m,s1,s2){m.onBeforeCompile=function(sh){sh.uniforms.tDet={value:detT};
  sh.vertexShader='varying vec2 vWXZ;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvWXZ=(modelMatrix*vec4(transformed,1.0)).xz;');
  sh.fragmentShader='uniform sampler2D tDet;\nvarying vec2 vWXZ;\n'+sh.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n{float gd=texture2D(tDet,vWXZ*'+s1.toFixed(3)+').r*0.55+texture2D(tDet,vWXZ*'+s2.toFixed(4)+').g*0.45; diffuseColor.rgb*=0.86+0.28*gd;}');};
  m.customProgramCacheKey=function(){return 'grain'+s1+s2;}; return m;}
A.grain=grain;
const root=new THREE.Group(); root.userData.nc=true; root.userData.nofight=true; scene.add(root);      // nothing of it lies in another surface's plane: the flicker search can pass it by
(function(){
  const sh=new THREE.Shape(); sh.moveTo(TZ0,TX0); sh.lineTo(TZ0+TS,TX0); sh.lineTo(TZ0+TS,TX0+TS); sh.lineTo(TZ0,TX0+TS); sh.lineTo(TZ0,TX0);
  const ho=new THREE.Path(); ho.moveTo(IZ0,IX0); ho.lineTo(IZ0,IX0+IS); ho.lineTo(IZ0+IS,IX0+IS); ho.lineTo(IZ0+IS,IX0); ho.lineTo(IZ0,IX0); sh.holes.push(ho);
  const g=new THREE.ShapeGeometry(sh), Pp=g.attributes.position, uv=g.attributes.uv;
  for(let i=0;i<Pp.count;i++){const z=Pp.getX(i), x=Pp.getY(i); Pp.setXYZ(i,x,U-0.003,z); uv.setXY(i,(z-TZ0)/TS,(x-TX0)/TS);}
  g.computeVertexNormals(); if(g.attributes.normal.getY(0)<0){const ix=g.index; for(let i=0;i<ix.count;i+=3){const a=ix.getX(i); ix.setX(i,ix.getX(i+1)); ix.setX(i+1,a);} g.computeVertexNormals();}
  const m=new THREE.Mesh(g,A.reg(grain(new THREE.MeshLambertMaterial({map:groundT}),0.31,0.047),'street')); m.receiveShadow=true; root.add(m);
  if(BD.ground) grain(BD.ground.material,0.31,0.047);      // the square building.js draws: the same grain
})();

/* =====================================================================
   The blocks: walls with their windows, ground floors, parapets and roofs, built straight into one mesh per material for each
   quarter of the map, so what is out of sight is skipped
   ===================================================================== */
const NT=4, TW=TS/NT, tiles=[];
function tileOf(x,z){const i=Math.max(0,Math.min(NT-1,Math.floor((x-TX0)/TW))), j=Math.max(0,Math.min(NT-1,Math.floor((z-TZ0)/TW))), k=j*NT+i;
  return tiles[k]||(tiles[k]={g:new THREE.Group(),bufs:new Map(),bat:null,trees:[],cars:[],x0:TX0+i*TW,z0:TZ0+j*TW});}
function bufOf(t,m){let b=t.bufs.get(m); if(!b) t.bufs.set(m,b={p:[],n:[],u:[],c:[],i:[]}); return b;}
function vtx(b,x,y,z,nx,ny,nz,u,v,c){b.p.push(x,y,z); b.n.push(nx,ny,nz); b.u.push(u,v); b.c.push(c.r,c.g,c.b);}
function quad(b,a,c1,c2,c3,n,uv,col){const s=b.p.length/3; [a,c1,c2,c3].forEach(function(q,k){vtx(b,q[0],q[1],q[2],n[0],n[1],n[2],uv[2*k],uv[2*k+1],col);}); b.i.push(s,s+1,s+2,s,s+2,s+3);}
function wallQ(b,a,c,y0,y1,u0,u1,v0,v1,col,foot){const dx=c[0]-a[0], dz=c[1]-a[1], l=hyp(dx,dz)||1, n=[-dz/l,0,dx/l], s=b.p.length/3;
  vtx(b,a[0],y0,a[1],n[0],0,n[2],u0,v0,foot||col); vtx(b,c[0],y0,c[1],n[0],0,n[2],u1,v0,foot||col); vtx(b,c[0],y1,c[1],n[0],0,n[2],u1,v1,col); vtx(b,a[0],y1,a[1],n[0],0,n[2],u0,v1,col); b.i.push(s,s+1,s+2,s,s+2,s+3);}      // foot: a darker colour where the wall meets the ground
/* a box, turned by ry about y, in colour col (props: one material, colours per vertex) */
const FACES=[[[1,0,0],[0,0,-1],[0,1,0]],[[-1,0,0],[0,0,1],[0,1,0]],[[0,1,0],[1,0,0],[0,0,-1]],[[0,-1,0],[1,0,0],[0,0,1]],[[0,0,1],[1,0,0],[0,1,0]],[[0,0,-1],[-1,0,0],[0,1,0]]];
function boxB(b,cx,cy,cz,w,h,d,ry,col,rx){const cs=Math.cos(ry||0), sn=Math.sin(ry||0), ct=Math.cos(rx||0), st=Math.sin(rx||0), hx=w/2, hy=h/2, hz=d/2;
  const L=function(x,y,z){return [x,y*ct-z*st,y*st+z*ct];}, T=function(x,y,z){const q=L(x,y,z); return [cx+q[0]*cs+q[2]*sn,cy+q[1],cz-q[0]*sn+q[2]*cs];}, TN=function(x,y,z){const q=L(x,y,z); return [q[0]*cs+q[2]*sn,q[1],-q[0]*sn+q[2]*cs];};
  FACES.forEach(function(f){const n=f[0], u=f[1], v=f[2]; if(n[1]<0&&!rx&&cy-hy<=U+0.01) return;      // never the underside of what stands on the ground
    const c=[n[0]*hx,n[1]*hy,n[2]*hz], su=Math.abs(u[0])*hx+Math.abs(u[1])*hy+Math.abs(u[2])*hz, sv=Math.abs(v[0])*hx+Math.abs(v[1])*hy+Math.abs(v[2])*hz;
    const P=function(a,bb){return T(c[0]+u[0]*a+v[0]*bb,c[1]+u[1]*a+v[1]*bb,c[2]+u[2]*a+v[2]*bb);};
    quad(b,P(-su,-sv),P(su,-sv),P(su,sv),P(-su,sv),TN(n[0],n[1],n[2]),[0,0,1,0,1,1,0,1],col);});}
function cylB(b,cx,cy,cz,r,len,axis,col,seg){seg=seg||8; const ax=axis||0;      // a cylinder along x (axis 0, turned by ax) or upright (axis null)
  for(let i=0;i<seg;i++){const a0=i/seg*2*R, a1=(i+1)/seg*2*R, c0=Math.cos(a0), s0=Math.sin(a0), c1=Math.cos(a1), s1=Math.sin(a1);
    if(axis==null){quad(b,[cx+r*s0,cy-len/2,cz+r*c0],[cx+r*s1,cy-len/2,cz+r*c1],[cx+r*s1,cy+len/2,cz+r*c1],[cx+r*s0,cy+len/2,cz+r*c0],[Math.sin((a0+a1)/2),0,Math.cos((a0+a1)/2)],[0,0,1,0,1,1,0,1],col);}
    else{const ca=Math.cos(ax), sa=Math.sin(ax), P=function(t,c,s){const lx=t*len/2, ly=r*c, lz=r*s; return [cx+lx*ca+lz*sa,cy+ly,cz-lx*sa+lz*ca];};
      quad(b,P(-1,c0,s0),P(-1,c1,s1),P(1,c1,s1),P(1,c0,s0),[sa*Math.sin((a0+a1)/2),Math.cos((a0+a1)/2),ca*Math.sin((a0+a1)/2)],[0,0,1,0,1,1,0,1],col);}}}
const C=function(h){return new THREE.Color(h);};

/* ---------- the faces: four bays of a floor, two floors, on one canvas; and the same canvas with the lights on ---------- */
const LAY=[['win','small','closed','win','win','pair','small','closed'],['closed','win','win','closed','pair','closed','small','win'],['win','win','small','win','pair','win','win','small'],['win','closed','win','small','closed','win','pair','win'],['band','band','small','band','band','band','band','small']];
const SX=80, SY=256/2.95;      // px a metre, across and up
/* mode: 0 the colours, 1 the lights on at night, 2 the relief (grey: how far out from the wall), 3 the shine (white: glass) */
function bay(g,kind,X,Y,r,mode){
  const o={sh:0.1+r()*0.8, on:r()<0.36, ac:r()<0.4, cur:r(), tone:r(), side:r()<0.5};      // drawn the same in every mode
  const lit=mode===1, col=mode===0, gry=function(v){const c=Math.round(v*255); return 'rgb('+c+','+c+','+c+')';};
  const F=function(c,h,s2){if(mode===0) g.fillStyle=c; else if(mode===2) g.fillStyle=gry(h); else if(mode===3) g.fillStyle=gry(s2); return mode!==1;};      // a part's colour, relief and shine
  const W=function(x0,y0,w,h,f){const x=X+128+x0*SX, y=Y+256-(y0+h)*SY, ww=w*SX, hh=h*SY; f(x-ww/2,y,ww,hh);};
  const glass=function(x,y,w,h,sh){
    if(lit){g.fillStyle=o.on?(o.tone<0.5?'#ffd28a':'#ffe9b8'):'#000'; g.fillRect(x,y+h*sh,w,h*(1-sh)); if(o.on&&o.cur<0.5){g.fillStyle='rgba(0,0,0,0.35)'; g.fillRect(x+w*0.1,y+h*sh,w*0.25,h*(1-sh));} return;}
    if(col){const gr=g.createLinearGradient(x,y,x+w,y+h); gr.addColorStop(0,'#3a4a55'); gr.addColorStop(0.6,'#26323b'); gr.addColorStop(1,'#4a5a64'); g.fillStyle=gr;} else F(0,0.22,o.cur<0.6?0.55:0.95); g.fillRect(x,y,w,h);
    if(col&&o.cur<0.6){g.fillStyle=['#e9e1cf','#d8c8a8','#c9d3d8','#e8d5c8'][Math.floor(o.cur*6.6)%4]; g.globalAlpha=0.75; g.fillRect(x+2,y+h*sh,w*0.28,h*(1-sh)); g.fillRect(x+w*0.72-2,y+h*sh,w*0.28,h*(1-sh)); g.globalAlpha=1;}
    F('#dcdad3',0.36,0.12); g.fillRect(x,y,w,h*sh); if(mode!==3){g.fillStyle=mode===2?gry(0.3):'rgba(0,0,0,0.13)'; for(let k=y+3;k<y+h*sh;k+=4) g.fillRect(x,k,w,1);}      // the roller shutter, part way down, slat by slat
    F('#e4e2dc',0.4,0.1); g.fillRect(x-2,y-4,w+4,4);      // its box
    if(col){g.fillStyle='rgba(255,255,255,0.18)'; g.fillRect(x+w*0.08,y+h*sh+3,w*0.12,h*(1-sh)-6);}};
  const frame=function(x,y,w,h){if(!F('#eceae4',0.62,0.12)) return; g.fillRect(x-5,y-12,w+10,h+16); F('#c9c5bb',0.66,0.1); g.fillRect(x-5,y-12,w+10,8); F(0,0.3,0); if(mode===2){g.fillRect(x-1,y-8,w+2,h+12);}};
  const sill=function(x,y,w,h){if(!F('#cfc7b6',0.85,0.15)) return; g.fillRect(x-8,y+h+2,w+16,7); if(col){g.fillStyle='rgba(70,60,45,0.12)'; g.fillRect(x-2,y+h+9,w+4,30);}};
  const ac=function(x,y){if(lit||!o.ac) return; F('#f0efea',0.95,0.3); g.fillRect(x,y,64,46); if(col){g.strokeStyle='#bdbab2'; g.lineWidth=2; g.strokeRect(x,y,64,46);} F('#56595b',0.75,0.05); g.beginPath(); g.arc(x+38,y+23,15,0,7); g.fill();
    if(col){g.strokeStyle='#9a9a96'; g.beginPath(); g.arc(x+38,y+23,15,0,7); g.stroke(); g.fillStyle='rgba(60,55,45,0.18)'; g.fillRect(x+12,y+46,3,40);}};
  if(kind==='win') W(0,0.95,1.5,1.35,function(x,y,w,h){frame(x,y,w,h); glass(x,y,w,h,o.sh); sill(x,y,w,h); ac(o.side?x+w+12:x-78,y+h-30);});
  else if(kind==='pair') [-0.62,0.62].forEach(function(dx,k){W(dx,1.0,0.9,1.25,function(x,y,w,h){frame(x,y,w,h); glass(x,y,w,h,k?o.sh*0.6:o.sh); sill(x,y,w,h);});});
  else if(kind==='small') W(o.side?-0.6:0.6,1.6,0.6,0.55,function(x,y,w,h){
    if(lit){g.fillStyle=o.on&&o.tone<0.4?'#d8e4e8':'#000'; g.fillRect(x,y,w,h); return;}
    F('#eceae4',0.62,0.1); g.fillRect(x-4,y-4,w+8,h+8); F('#b9c4c8',0.3,0.6); g.fillRect(x,y,w,h); if(col){g.fillStyle='rgba(255,255,255,0.4)'; g.fillRect(x,y+h/2-1,w,2);}
    F('#b5b0a5',0.72,0.2); g.fillRect(X+(o.side?200:40),Y,7,256);});      // a drainpipe down the wall
  else if(kind==='band') W(0,0.9,3.2,1.25,function(x,y,w,h){      // the fifties: a long window across the bay, shutters in a row
    if(F('#d9d4c8',0.58,0.1)) g.fillRect(x,y-10,w,h+22); for(let k=0;k<3;k++){const px=x+6+k*(w-12)/3, pw=(w-12)/3-6; glass(px,y,pw,h,o.sh*(k===1?0.5:1));}
    if(F('#c4bfb3',0.85,0.15)) g.fillRect(x,y+h+4,w,8);});
  else if(kind==='closed') W(0,0.1,2.9,2.55,function(x,y,w,h){      // a balcony closed in with sliding panes, the lower part frosted
    if(F('#d3d6d6',0.7,0.15)){g.fillRect(x-4,y-4,w+8,h+8); F('#e7e5df',0.66,0.2); g.fillRect(x,y+h-0.95*SY,w,0.95*SY);}
    for(let k=0;k<4;k++){const px=x+k*w/4+3, pw=w/4-6; glass(px,y+3,pw,h-0.95*SY-6,o.sh*(k%2?0.3:1)); if(F('#c8cbcb',0.74,0.3)) g.fillRect(x+k*w/4-2,y,4,h);}
    if(F('#c9c4ba',0.88,0.15)) g.fillRect(x-6,y+h,w+12,6);});
}
function facadeTex(s,mode){const lit=mode===1, M=LITE?512:1024, sc=M/1024; return det.tex(M,M/2,function(g){g.scale(sc,sc); const r=A.rng(900+s*31);
  g.fillStyle=lit?'#000':mode===2?'rgb(128,128,128)':mode===3?'rgb(14,14,14)':'#ffffff'; g.fillRect(0,0,1024,512);
  if(mode===0||mode===2){const n=A.rng(5+s); for(let i=0;i<6000;i++){g.fillStyle=mode===2?'rgba('+(n()<0.5?'150,150,150':'105,105,105')+','+(n()*0.5)+')':'rgba('+(n()<0.5?'255,255,255':'60,50,40')+','+(n()*0.06)+')'; g.fillRect(n()*1024,n()*512,1+n()*2,1+n()*2);}      // the render: rough to the touch
    if(s===3){for(let y=0;y<512;y+=22){let x=-(y/22%2)*30; while(x<1024){const w=40+n()*44, v=Math.floor(n()*16)-8; g.fillStyle=mode===2?'rgba(150,150,150,'+(0.2+Math.abs(v)/40)+')':'rgba('+(v>0?'255,248,230':'120,100,70')+','+Math.abs(v)/70+')'; g.fillRect(x+1,y+1,w-2,20); g.fillStyle=mode===2?'rgb(70,70,70)':'rgba(150,135,105,0.55)'; g.fillRect(x+w-1,y,1.5,22); x+=w;} g.fillStyle=mode===2?'rgb(70,70,70)':'rgba(150,135,105,0.55)'; g.fillRect(0,y,1024,1.5);}}      // Jerusalem stone in courses, the joints sunk
    if(s===4&&mode===0){g.fillStyle='rgba(120,110,95,0.10)'; for(let f=0;f<2;f++) g.fillRect(0,f*256+30,1024,60);}}      // a darker band along each floor
  for(let f=0;f<2;f++) for(let b=0;b<4;b++) bay(g,LAY[s][f*4+b],b*256,f*256,r,mode);
  if(mode===0) for(let f=0;f<2;f++){g.fillStyle='rgba(110,100,85,0.22)'; g.fillRect(0,f*256+250,1024,6); g.fillStyle='rgba(255,255,255,0.45)'; g.fillRect(0,f*256+247,1024,3);}
  if(mode===2) for(let f=0;f<2;f++){g.fillStyle='rgb(160,160,160)'; g.fillRect(0,f*256+246,1024,10);}      // the slab's edge, standing a little proud
},true);}
/* a relief drawn in grey becomes the normal map that lets the sun pick it out */
function normalsOf(t,k){const c=t.image, w=c.width, h=c.height, src=c.getContext('2d').getImageData(0,0,w,h).data, out=document.createElement('canvas'); out.width=w; out.height=h;
  const g=out.getContext('2d'), im=g.createImageData(w,h), d=im.data, H=function(x,y){x=(x+w)%w; y=(y+h)%h; return src[(y*w+x)*4]/255;};
  for(let y=0;y<h;y++) for(let x=0;x<w;x++){const dx=(H(x+1,y)-H(x-1,y))*k, dy=(H(x,y-1)-H(x,y+1))*k, l=Math.sqrt(dx*dx+dy*dy+1), i=(y*w+x)*4;
    d[i]=Math.round((-dx/l*0.5+0.5)*255); d[i+1]=Math.round((-dy/l*0.5+0.5)*255); d[i+2]=Math.round((1/l*0.5+0.5)*255); d[i+3]=255;}
  g.putImageData(im,0,0); const nt=new THREE.CanvasTexture(out); nt.wrapS=nt.wrapT=THREE.RepeatWrapping; nt.anisotropy=8; return nt;}
/* the sky the windows reflect: blue overhead, pale at the horizon, the street and the houses opposite below it */
const skyEnv=(function(){const side=function(k){const c=document.createElement('canvas'); c.width=c.height=64; const g=c.getContext('2d');
    if(k==='py'){g.fillStyle='#7fb0dc'; g.fillRect(0,0,64,64);} else if(k==='ny'){g.fillStyle='#6a665e'; g.fillRect(0,0,64,64);}
    else{const gr=g.createLinearGradient(0,0,0,64); gr.addColorStop(0,'#86b6e0'); gr.addColorStop(0.46,'#dfe9ee'); gr.addColorStop(0.5,'#b9b4a8'); gr.addColorStop(0.62,'#8d887c'); gr.addColorStop(1,'#5f5b54'); g.fillStyle=gr; g.fillRect(0,0,64,64);
      for(let i=0;i<9;i++){g.fillStyle='rgba(120,112,100,0.55)'; const bw=4+(i*7)%9, bh=4+(i*5)%10; g.fillRect((i*7.3)%64,32-bh,bw,bh);}}
    return c;};
  const t=new THREE.CubeTexture(['px','nx','py','ny','pz','nz'].map(side)); t.needsUpdate=true; return t;})();
const glassy=[];
function facadeM(s){const m=new THREE.MeshPhongMaterial({map:facadeTex(s,0),vertexColors:true,emissiveMap:facadeTex(s,1),normalMap:normalsOf(facadeTex(s,2),s===3?3:5),specularMap:facadeTex(s,3),
  specular:0x9a9a9a,shininess:48,envMap:skyEnv,combine:THREE.MixOperation,reflectivity:0.42}); m.normalScale.set(1,1); A.reg(m,'town'); glassy.push(m); return m;}
/* the ground floor: an entrance and barred windows; shops on the main streets; or the open floor on pillars, its back wall in shade */
const SHOPS=[['מכולת','#2c6b45'],['מספרה','#1f4f8a'],['פיצה','#b8322c'],['קפה','#6b4a33'],['פרחים','#c2457a'],['ירקות','#3f7a2a'],['קיוסק','#d98a2b'],['מכבסה','#2a7a9a'],['מאפייה','#a0662a'],['פלאפל','#c7a21e'],['אופטיקה','#3a3f8a'],['בית מרקחת','#2f8a5a']];
function groundTex(kind,s,lit){return det.tex(1024,256,function(g){const r=A.rng(300+s*17+(kind==='shop'?1000:kind==='pil'?2000:0));
  g.fillStyle=lit?'#000':kind==='pil'?'#b9b3a7':'#f2efe8'; g.fillRect(0,0,1024,256);
  if(!lit){const n=A.rng(9+s); for(let i=0;i<3000;i++){g.fillStyle='rgba('+(n()<0.5?'255,255,255':'60,50,40')+','+(n()*0.07)+')'; g.fillRect(n()*1024,n()*256,1+n()*2,1+n()*2);}}
  const sy=256/3.0;
  for(let b=0;b<4;b++){const X=b*256, on=r()<0.7, k=Math.floor(r()*SHOPS.length), sh=r();
    if(kind==='shop'){const sp=SHOPS[(k+s*3)%SHOPS.length];
      if(lit){g.fillStyle=on?'#fff1cf':'#000'; g.fillRect(X+14,256-2.35*sy,228,2.2*sy*(1-sh*0.3)); g.fillStyle=on?'#ffffff':'#000'; g.fillRect(X+10,256-2.95*sy,236,0.5*sy); continue;}
      g.fillStyle='#2a2d30'; g.fillRect(X+10,256-2.45*sy,236,2.45*sy); const gr=g.createLinearGradient(X,0,X+256,256); gr.addColorStop(0,'#55646c'); gr.addColorStop(1,'#2e3940'); g.fillStyle=gr; g.fillRect(X+16,256-2.3*sy,224,2.2*sy);
      g.fillStyle='rgba(230,220,200,0.55)'; for(let i=0;i<6;i++) g.fillRect(X+26+i*36,256-1.2*sy,24,1.1*sy*(0.4+r()*0.6));      // what is on show
      g.fillStyle='#c9ccd0'; g.fillRect(X+16,256-2.3*sy*sh*0.5-2.3*sy*0.5,224,2.3*sy*sh*0.3); for(let y=256-2.3*sy;y<256-2.3*sy+2.3*sy*sh*0.3;y+=4){g.fillStyle='rgba(0,0,0,0.15)'; g.fillRect(X+16,y,224,1);}      // the shutter, half up
      g.fillStyle=sp[1]; g.fillRect(X+8,256-2.98*sy,240,0.52*sy); g.fillStyle='#fff'; g.font='bold 30px sans-serif'; g.textAlign='center'; g.fillText(sp[0],X+128,256-2.6*sy);
      for(let i=0;i<8;i++){g.fillStyle=i%2?'#f4f2ea':sp[1]; g.fillRect(X+8+i*30,256-2.46*sy,30,10);}}
    else if(kind==='pil'){if(lit){if(b===1){g.fillStyle='#fff3c8'; g.fillRect(X+70,256-2.3*sy,110,2.3*sy);} continue;}
      g.fillStyle='rgba(60,55,45,0.25)'; g.fillRect(X,0,256,30);
      if(b===1){g.fillStyle='#5c5a52'; g.fillRect(X+64,256-2.4*sy,122,2.4*sy); g.fillStyle='#2f3a40'; g.fillRect(X+72,256-2.3*sy,106,2.25*sy); g.fillStyle='#c9b48a'; g.fillRect(X+120,256-1.2*sy,10,30);
        g.fillStyle='#1f7a4a'; g.fillRect(X+196,256-2.2*sy,30,30); g.fillStyle='#fff'; g.font='bold 18px sans-serif'; g.textAlign='center'; g.fillText(String(2+s*4+Math.floor(r()*30)),X+211,256-2.2*sy+22);}
      else if(b===2){for(let i=0;i<9;i++){g.fillStyle='#8f9599'; g.fillRect(X+40+(i%3)*42,256-1.9*sy+Math.floor(i/3)*28,38,24); g.fillStyle='#2b2d2f'; g.fillRect(X+48+(i%3)*42,256-1.9*sy+Math.floor(i/3)*28+8,22,3);}}      // the letterboxes
      else{g.strokeStyle='#2b2d2f'; g.lineWidth=3; for(let i=0;i<2;i++){const bx=X+60+i*90, by=256-0.4*sy; g.beginPath(); g.arc(bx,by,22,0,7); g.stroke(); g.beginPath(); g.arc(bx+60,by,22,0,7); g.stroke(); g.beginPath(); g.moveTo(bx,by); g.lineTo(bx+28,by-30); g.lineTo(bx+60,by); g.stroke();}}}      // bicycles left under the building
    else{if(lit){if(b===0){g.fillStyle='#ffe2a8'; g.fillRect(X+70,256-2.35*sy,110,2.3*sy);} else if(on&&sh<0.4){g.fillStyle='#ffd28a'; g.fillRect(X+70,256-2.0*sy,116,1.1*sy);} continue;}
      if(b===0){g.fillStyle='#d9d4c8'; g.fillRect(X+56,256-2.6*sy,140,2.6*sy); g.fillStyle='#2f3a40'; g.fillRect(X+70,256-2.35*sy,112,2.35*sy); g.strokeStyle='#c8ccce'; g.lineWidth=4; g.strokeRect(X+70,256-2.35*sy,112,2.35*sy); g.beginPath(); g.moveTo(X+126,256-2.35*sy); g.lineTo(X+126,256); g.stroke();
        g.fillStyle='#1f7a4a'; g.fillRect(X+204,256-2.5*sy,32,32); g.fillStyle='#fff'; g.font='bold 18px sans-serif'; g.textAlign='center'; g.fillText(String(1+Math.floor(r()*60)),X+220,256-2.5*sy+23);}
      else{g.fillStyle='#eceae4'; g.fillRect(X+62,256-2.1*sy,132,1.3*sy); g.fillStyle='#2b3740'; g.fillRect(X+70,256-2.0*sy,116,1.1*sy); g.strokeStyle='#3a3d40'; g.lineWidth=3; for(let i=0;i<6;i++){g.beginPath(); g.moveTo(X+78+i*20,256-2.0*sy); g.lineTo(X+78+i*20,256-0.9*sy); g.stroke();}      // barred
        g.fillStyle='#cfc7b6'; g.fillRect(X+60,256-0.88*sy,136,6);}}
    if(!lit){g.fillStyle='rgba(90,80,65,0.25)'; g.fillRect(X,256-0.3*sy,256,0.3*sy);}}      // the plinth, splashed
},true);}
const FAC=[0,1,2,3,4].map(facadeM);
const GRD={res:[0,1].map(function(s){const m=new THREE.MeshLambertMaterial({map:groundTex('res',s,false),vertexColors:true,emissiveMap:groundTex('res',s,true)}); A.reg(m,'town'); return m;}),
  shop:[0,1,2].map(function(s){const m=new THREE.MeshLambertMaterial({map:groundTex('shop',s,false),vertexColors:true,emissiveMap:groundTex('shop',s,true)}); A.reg(m,'town'); return m;}),
  pil:[0,1].map(function(s){const m=new THREE.MeshLambertMaterial({map:groundTex('pil',s,false),vertexColors:true,emissiveMap:groundTex('pil',s,true)}); A.reg(m,'town'); return m;})};
const lights=FAC.concat(GRD.res,GRD.shop,GRD.pil);
const plainT=det.tex(256,256,function(g){const r=A.rng(12); g.fillStyle='#fff'; g.fillRect(0,0,256,256); for(let i=0;i<2600;i++){g.fillStyle='rgba('+(r()<0.5?'255,255,255':'60,50,40')+','+(r()*0.06)+')'; g.fillRect(r()*256,r()*256,1+r()*2,1+r()*2);}
  for(let i=0;i<8;i++){const x=r()*256, gr=g.createLinearGradient(0,0,0,256); gr.addColorStop(0,'rgba(80,70,55,0.12)'); gr.addColorStop(1,'rgba(80,70,55,0)'); g.fillStyle=gr; g.fillRect(x,0,3+r()*5,100+r()*150);}},true);
const PLAIN=A.reg(new THREE.MeshLambertMaterial({map:plainT,vertexColors:true}),'town');
const roofT=det.tex(256,256,function(g){const r=A.rng(13);      // the roof: a pale membrane laid in strips, its seams, a few stains, sun-bleached
  g.fillStyle='#ecebe6'; g.fillRect(0,0,256,256);
  for(let i=0;i<5000;i++){g.fillStyle='rgba('+(r()<0.5?'255,255,255':'120,115,105')+','+(r()*0.08)+')'; g.fillRect(r()*256,r()*256,1+r()*2,1+r()*2);}
  for(let x=0;x<256;x+=36){g.fillStyle='rgba(150,145,135,0.35)'; g.fillRect(x,0,2,256); g.fillStyle='rgba(255,255,255,0.4)'; g.fillRect(x+2,0,1,256);}
  for(let i=0;i<6;i++){const x=r()*256, y=r()*256, w=6+r()*18; g.fillStyle='rgba(110,105,95,'+(0.08+r()*0.1)+')'; g.beginPath(); g.ellipse(x,y,w,w*(0.4+r()*0.5),r()*3,0,7); g.fill();}
  for(let i=0;i<3;i++){g.fillStyle='rgba(90,85,78,0.25)'; g.fillRect(r()*256,r()*256,10+r()*30,2);}},true);      // patches of tar along the joints
const ROOF=A.reg(new THREE.MeshLambertMaterial({map:roofT,vertexColors:true}),'town');
const tileT=det.tex(128,128,function(g){g.fillStyle='#b0563c'; g.fillRect(0,0,128,128); for(let y=0;y<128;y+=16){g.fillStyle='rgba(60,25,15,0.4)'; g.fillRect(0,y+13,128,3); for(let x=(y/16%2)*10;x<128;x+=20){g.fillStyle='rgba(255,200,170,0.15)'; g.fillRect(x,y,8,12); g.fillStyle='rgba(60,25,15,0.25)'; g.fillRect(x+18,y,2,13);}}},true);
const TILE=A.reg(new THREE.MeshLambertMaterial({map:tileT,vertexColors:true}),'town');
const PROP=A.reg(new THREE.MeshLambertMaterial({vertexColors:true}),'town');
const WALLC=[0xefe9dc,0xe6dfcf,0xddd5c3,0xe9e3d4,0xd8d0bd,0xf2efe8,0xe2dac8,0xd9cfb9,0xece4d2,0xf4f1ea,0xe4ddd0,0xd6cdb9].map(C);

/* ---------- one block ---------- */
const BW=3.2, FH=2.95, GH=3.1;
function floorsOf(b,r){if(b.lv) return Math.max(1,b.lv); if(b.k==='h'||b.k==='r') return 2; if(b.k==='s') return 3; if(b.k==='g'||b.area<45) return 1;
  if(b.area<130) return 2+(r()<0.5?1:0); if(b.area>1600) return 7+Math.floor(r()*4); if(b.area>800) return 5+Math.floor(r()*3); const x=r(); return x<0.12?3:x<0.62?4:x<0.9?5:6;}
function onMain(a,c,out){const mx=(a[0]+c[0])/2+out[0]*6, mz=(a[1]+c[1])/2+out[1]*6, q=roadNear(mx,mz); return !!q&&q.d<4&&(q.r.k===1||q.r.k===6||q.r.k===7);}
function streetSide(a,c,out){const mx=(a[0]+c[0])/2+out[0]*5, mz=(a[1]+c[1])/2+out[1]*5, q=roadNear(mx,mz); return !!q&&q.d<8;}
function inset(p,d){const n=p.length, out=[];
  for(let i=0;i<n;i++){const a=p[(i+n-1)%n], b=p[i], c=p[(i+1)%n];
    const l1=hyp(b[0]-a[0],b[1]-a[1])||1, l2=hyp(c[0]-b[0],c[1]-b[1])||1, n1=[(b[1]-a[1])/l1,-(b[0]-a[0])/l1], n2=[(c[1]-b[1])/l2,-(c[0]-b[0])/l2];      // inward: the right of each run
    let mx=n1[0]+n2[0], mz=n1[1]+n2[1]; const ml=hyp(mx,mz)||1; mx/=ml; mz/=ml; const k=Math.min(3,1/Math.max(0.35,mx*n1[0]+mz*n1[1]));
    out.push([b[0]+mx*d*k,b[1]+mz*d*k]);}
  return out;}
function roofTris(b,p,y,mat,col,down){
  const ct=p.map(function(q){return new THREE.Vector2(q[0],q[1]);}); let f; try{f=THREE.ShapeUtils.triangulateShape(ct,[]);}catch(e){return;}
  f.forEach(function(t){let a=p[t[0]], c=p[t[1]], d=p[t[2]]; const cy=(c[1]-a[1])*(d[0]-a[0])-(c[0]-a[0])*(d[1]-a[1]); if((cy<0)!==!!down){const s=c; c=d; d=s;}
    const s=b.p.length/3; [a,c,d].forEach(function(q){vtx(b,q[0],y,q[1],0,down?-1:1,0,q[0]/7,q[1]/7,col);}); b.i.push(s,s+1,s+2);});}
function block(bd){
  const r=A.rng(bd.i*7+3), p=bd.p, n=p.length, t=tileOf(bd.c[0],bd.c[1]), fl=floorsOf(bd,r), near=hyp(bd.c[0]-OURC[0],bd.c[1]-OURC[1]);
  const sk=r(), sty=sk<0.62?Math.floor(r()*3):sk<0.82?3:4, wc=(sty===3?C([0xf6f0e2,0xf2e9d6,0xfaf4e8][Math.floor(r()*3)]):WALLC[Math.floor(r()*WALLC.length)]).clone(), small=fl<=2&&(bd.k==='h'||bd.area<160);      // a fifth of them faced in stone, a fifth with the fifties' long windows
  const pil=fl>=3&&bd.k==='a'&&r()<0.45&&bd.area>140, gh=fl===1?3.0:GH, H=U+gh+(fl-1)*FH, top=H+0.95, uoff=Math.floor(r()*4)/4, voff=r()<0.5?0:0.5;
  const hip=n===4&&(small||bd.k==='h'||(fl<=3&&r()<0.35));
  bd.h=hip?H+2:top; bd.fl=fl; bd.pil=pil; bd.gh=gh; bd.wc=wc; bd.small=small;
  const fac=bufOf(t,FAC[sty]), plain=bufOf(t,PLAIN), prop=bufOf(t,PROP);
  const shopFace=[];
  for(let i=0;i<n;i++){const a=p[i], c=p[(i+1)%n], dx=c[0]-a[0], dz=c[1]-a[1], len=hyp(dx,dz); if(len<0.2) continue;
    const out=[-dz/len,dx/len], nb=Math.max(1,Math.round(len/BW)), uu=nb/4;
    if(fl>1) wallQ(fac,a,c,U+gh,H,uoff,uoff+uu,voff,voff+(fl-1)/2,wc);
    const main=!pil&&onMain(a,c,out)&&len>5; shopFace.push(main);
    if(main&&near<(LITE?200:420)){const ryE=Math.atan2(out[0],out[1]), ax=dx/len, az=dz/len, AWC=[0x2f6b45,0xb8322c,0xd98a2b,0x1f4f8a,0x6b4a33,0x2a7a9a,0xc2457a];
      for(let k=0;k<nb;k++){const f0=(k+0.5)/nb, x=a[0]+dx*f0, z=a[1]+dz*f0, w=len/nb*0.92, ac=C(AWC[(bd.i+k*3)%AWC.length]);
        if(r()<0.75){boxB(prop,x+out[0]*0.6,U+2.66,z+out[1]*0.6,w,0.03,1.25,ryE,ac,0.32); boxB(prop,x+out[0]*1.2,U+2.36,z+out[1]*1.2,w,0.2,0.02,ryE,ac.clone().multiplyScalar(0.8));}      // the awning over the shop window
        const cr=r();
        if(cr<0.12){for(let q2=0;q2<2;q2++){const tx=x+ax*(q2-0.5)*1.4+out[0]*1.5, tz=z+az*(q2-0.5)*1.4+out[1]*1.5; if(inBuilding(tx,tz,0.3)||kept(tx,tz)) continue;      // a café's tables out on the pavement
            cylB(prop,tx,U+PH+0.74,tz,0.36,0.03,null,C(0xe8e6e0),12); cylB(prop,tx,U+PH+0.37,tz,0.035,0.74,null,C(0x2b2d2f),6);
            [0,1].forEach(function(sd){const cx2=tx+ax*(sd?0.58:-0.58), cz2=tz+az*(sd?0.58:-0.58), hh=Math.atan2(tx-cx2,tz-cz2); boxB(prop,cx2,U+PH+0.45,cz2,0.42,0.05,0.42,hh,C(0x6b4a33)); boxB(prop,cx2-Math.sin(hh)*0.2,U+PH+0.7,cz2-Math.cos(hh)*0.2,0.42,0.45,0.04,hh,C(0x6b4a33));
              [[-0.18,-0.18],[0.18,-0.18],[-0.18,0.18],[0.18,0.18]].forEach(function(l2){boxB(prop,cx2+l2[0],U+PH+0.22,cz2+l2[1],0.03,0.44,0.03,0,C(0x2b2d2f));}); cafes.push({x:cx2,z:cz2,h:hh});});
            addOb(tx,tz,0.45);}}
        else if(cr<0.2){const px=x+out[0]*0.75, pz=z+out[1]*0.75; for(let q2=0;q2<5;q2++){const o2=(q2%3-1)*0.55, lv2=Math.floor(q2/3);      // a grocer's crates of fruit and vegetables by the door
            boxB(prop,px+ax*o2,U+PH+0.17+lv2*0.34,pz+az*o2,0.5,0.32,0.36,ryE,C(0x9a7a4a)); boxB(prop,px+ax*o2,U+PH+0.34+lv2*0.34,pz+az*o2,0.44,0.05,0.3,ryE,C([0xe8701e,0xd84a2a,0x6a9a3a,0xe8c91a,0x8a3a6a][(q2+k)%5]));}
          addOb(px,pz,0.8);}}}
    if(!pil){const gm=main?GRD.shop[(bd.i+i)%3]:GRD.res[bd.i%2]; wallQ(bufOf(t,gm),a,c,U,U+gh,uoff,uoff+uu,0,1,wc,wc.clone().multiplyScalar(0.62));}
    if(!hip){const pc=wc.clone().multiplyScalar(0.97); wallQ(plain,a,c,H,top,0,len/6,0,0.15,pc); wallQ(plain,c,a,H,top-0.06,0,len/6,0,0.15,pc.clone().multiplyScalar(0.85));      // the parapet, both its faces
    const cap=C(0xd8d2c4); quad(plain,[a[0],top,a[1]],[c[0],top,c[1]],[c[0]-out[0]*0.18,top,c[1]-out[1]*0.18],[a[0]-out[0]*0.18,top,a[1]-out[1]*0.18],[0,1,0],[0,0,1,0,1,0.05,0,0.05],cap);}
    boxB(prop,(a[0]+c[0])/2+out[0]*0.04,U+gh-0.06,(a[1]+c[1])/2+out[1]*0.04,len,0.14,0.16,Math.atan2(dx,dz)-R/2,C(0xd6cfc0));      // the slab line over the ground floor
  }
  if(pil){      // on pillars: the ground floor drawn back under the floors above, its ceiling, and the pillars at the corners and along the walls
    const q=inset(p,1.4), m=GRD.pil[bd.i%2];
    for(let i=0;i<q.length;i++){const a=q[i], c=q[(i+1)%q.length], len=hyp(c[0]-a[0],c[1]-a[1]); if(len<0.2) continue; wallQ(bufOf(t,m),a,c,U,U+gh,0,Math.max(1,Math.round(len/BW))/4,0,1,wc.clone().multiplyScalar(0.92),wc.clone().multiplyScalar(0.55));}
    roofTris(plain,p,U+gh-0.001,PLAIN,wc.clone().multiplyScalar(0.62),true);
    for(let i=0;i<n;i++){const a=p[i], c=p[(i+1)%n], len=hyp(c[0]-a[0],c[1]-a[1]), k=Math.max(1,Math.round(len/4.6)), ry=Math.atan2(c[0]-a[0],c[1]-a[1]);
      for(let j=0;j<k;j++){const f=j/k, x=a[0]+(c[0]-a[0])*f, z=a[1]+(c[1]-a[1])*f; boxB(prop,x,U+gh/2,z,0.36,gh,0.36,ry,wc.clone().multiplyScalar(0.95));}}}
  /* the roof: flat behind its parapet, or tiled and hipped on the smaller houses */
  if(hip){const bx=obb(p), cs=bx.corners, L=bx.s1-bx.s0, Wd=bx.t1-bx.t0, rise=Math.min(Wd,L)*0.32, cx=(cs[0][0]+cs[2][0])/2, cz=(cs[0][1]+cs[2][1])/2;
    const along=L>=Wd, half=Math.max(0,(along?L:Wd)/2-(along?Wd:L)/2), ux=along?bx.ux:-bx.uz, uz=along?bx.uz:bx.ux, y0=H, ov=0.4, tc=C([0xffffff,0xf0e0d8,0xe8d0c0][bd.i%3]);
    const r0=[cx-ux*half,y0+rise,cz-uz*half], r1=[cx+ux*half,y0+rise,cz+uz*half];
    const e=cs.map(function(q){const dx=q[0]-cx, dz=q[1]-cz, l=hyp(dx,dz)||1; return [q[0]+dx/l*ov,y0-0.08,q[1]+dz/l*ov];});
    const tb=bufOf(t,TILE), tri=function(a,c,d){const ex=c[0]-a[0], ey=c[1]-a[1], ez=c[2]-a[2], fx=d[0]-a[0], fy=d[1]-a[1], fz=d[2]-a[2]; let nx=ey*fz-ez*fy, ny=ez*fx-ex*fz, nz=ex*fy-ey*fx; const l=hyp(nx,hyp(ny,nz))||1; nx/=l; ny/=l; nz/=l;
      if(ny<0){const s2=c; c=d; d=s2; nx=-nx; ny=-ny; nz=-nz;} const s=tb.p.length/3; [a,c,d].forEach(function(q){vtx(tb,q[0],q[1],q[2],nx,ny,nz,(q[0]*nz-q[2]*nx)/1.2,q[1]/0.9+(q[0]*nx+q[2]*nz)/1.2,tc);}); tb.i.push(s,s+1,s+2);};
    const nearer=function(q){return hyp(q[0]-r0[0],q[2]-r0[2])<hyp(q[0]-r1[0],q[2]-r1[2])?r0:r1;};
    for(let i=0;i<4;i++){const a=e[i], c=e[(i+1)%4], ra=nearer(a), rc=nearer(c); if(ra===rc) tri(a,c,ra); else{tri(a,c,rc); tri(a,rc,ra);}}
    const cap=C(0xd8d2c4); for(let i=0;i<4;i++){const a=e[i], c=e[(i+1)%4]; wallQ(prop,[a[0],a[2]],[c[0],c[2]],y0-0.26,y0-0.08,0,1,0,1,cap); wallQ(prop,[c[0],c[2]],[a[0],a[2]],y0-0.26,y0-0.08,0,1,0,1,cap);}      // the fascia under the eaves
  }else{
    const rc=C(bd.k==='r'?0xe8e4da:[0xffffff,0xf7f6f2,0xeceae4,0xe2ddd4,0xd0cbc0][Math.floor(r()*5)]); roofTris(bufOf(t,ROOF),p,H+0.02,ROOF,rc,false);
    /* on it: the stair hut, the water heaters with their collectors tilted to the sun, an aerial */
    const bx=obb(p), cx=(bx.corners[0][0]+bx.corners[2][0])/2, cz=(bx.corners[0][1]+bx.corners[2][1])/2, ry=Math.atan2(bx.ux,bx.uz);
    if(fl>=3&&bd.area>110){boxB(plain,cx,H+1.25,cz,2.6,2.5,2.4,ry,wc); boxB(prop,cx,H+2.55,cz,2.9,0.12,2.7,ry,C(0xd8d2c4));}
    if(fl>=4&&bd.area>220&&r()<0.32){      // a flat on the roof, set back, its terrace under a pergola
      const Lr=bx.s1-bx.s0, Wr=bx.t1-bx.t0, s0=bx.s0+1.2, s1=s0+Math.min(9,Lr*0.45), t0=bx.t0+1.2, t1=bx.t1-1.2, cc=function(s2,t2){return [s2*bx.ux-t2*bx.uz,s2*bx.uz+t2*bx.ux];};
      if(s1-s0>3&&t1-t0>3){const q=[cc(s0,t0),cc(s1,t0),cc(s1,t1),cc(s0,t1)]; let a2=0; for(let k=0;k<4;k++){const u1=q[k], u2=q[(k+1)%4]; a2+=u1[0]*u2[1]-u2[0]*u1[1];} if(a2>0) q.reverse();
        for(let k=0;k<4;k++){const u1=q[k], u2=q[(k+1)%4], l2=hyp(u2[0]-u1[0],u2[1]-u1[1]); wallQ(fac,u1,u2,H,H+2.9,uoff,uoff+Math.max(1,Math.round(l2/BW))/4,voff,voff+0.5,wc);}
        roofTris(bufOf(t,ROOF),q,H+2.95,ROOF,C(0xe6e2da),false);
        const wood=C(0x8a6a48); for(let k=0;k<6;k++){const s2=s1+0.6+k*0.7; if(s2>bx.s1-0.8) break; const A0=cc(s2,t0+0.3), A1=cc(s2,t1-0.3), mx=(A0[0]+A1[0])/2, mz=(A0[1]+A1[1])/2; boxB(prop,mx,H+2.75,mz,0.08,0.14,hyp(A1[0]-A0[0],A1[1]-A0[1]),Math.atan2(A1[0]-A0[0],A1[1]-A0[1]),wood);}
        [[s1+0.2,t0+0.3],[s1+0.2,t1-0.3],[Math.min(bx.s1-0.8,s1+3.8),t0+0.3],[Math.min(bx.s1-0.8,s1+3.8),t1-0.3]].forEach(function(q2){const P2=cc(q2[0],q2[1]); boxB(prop,P2[0],H+1.35,P2[1],0.12,2.7,0.12,0,wood);});}}
    const nh=Math.min(LITE?4:14,Math.max(1,Math.round(bd.area/(near<380?40:70)))), far=near>380;
    let placed=0; for(let k=0;k<nh*3&&k<60&&placed<nh;k++){const x=bx.corners[0][0]+(bx.corners[1][0]-bx.corners[0][0])*(0.15+0.7*r())+(bx.corners[3][0]-bx.corners[0][0])*(0.15+0.7*r()), z=bx.corners[0][1]+(bx.corners[1][1]-bx.corners[0][1])*(0.15+0.7*r())+(bx.corners[3][1]-bx.corners[0][1])*(0.15+0.7*r());
      if(!inPoly(p,x,z)||polyD(p,x,z)<1.4||hyp(x-cx,z-cz)<2.4) continue; placed++;
      if(far){boxB(prop,x+0.45,H+0.6,z,0.6,0.6,1.6,0,C(0xf2f2ee)); boxB(prop,x-0.3,H+0.45,z,1.0,0.3,1.9,0,C(0x2a3a55)); continue;}
      cylB(prop,x+0.5,H+1.25,z,0.29,1.55,R/2,C(0xf1f1ec),8);                                                       // the tank, lying east to west on its frame
      boxB(prop,x-0.2,H+0.72,z,1.95,0.06,1.15,-R/2,C(0x22314a),0.62); boxB(prop,x-0.2,H+0.755,z,1.98,0.02,1.18,-R/2,C(0xb9bec2),0.62);      // the collector, tilted to the sun in the south
      boxB(prop,x+0.5,H+0.5,z-0.7,0.06,1.0,0.06,0,C(0x9aa0a2)); boxB(prop,x+0.5,H+0.5,z+0.7,0.06,1.0,0.06,0,C(0x9aa0a2));}
    if(r()<0.35&&!far) cylB(prop,cx+2,H+2.4,cz+1,0.025,4.8,null,C(0x9aa0a2),4);
  }
  /* close by: balconies that stand out from the faces on the street, and air conditioners on the walls */
  if(near<(LITE?160:300)&&fl>=3&&!small){let done=0;
    for(let i=0;i<n&&done<2;i++){const a=p[i], c=p[(i+1)%n], dx=c[0]-a[0], dz=c[1]-a[1], len=hyp(dx,dz); if(len<7) continue; const out=[-dz/len,dx/len]; if(!streetSide(a,c,out)) continue; done++;
      const nb=Math.max(1,Math.round(len/BW)), ry=Math.atan2(dx,dz)-R/2, kind=r(), closed=kind<0.45, glassC=C(0x34434c), alu=C(0xd2d5d5), rail=C(0x2b2e30);
      for(let j=(i+bd.i)%2;j<nb;j+=2){const f0=(j+0.5)/nb, x=a[0]+dx*f0, z=a[1]+dz*f0, w=Math.min(3.0,len/nb*0.95);
        for(let f=1;f<fl;f++){const y=U+gh+(f-1)*FH, ox=out[0], oz=out[1], d=1.25;
          boxB(prop,x+ox*d/2,y+0.07,z+oz*d/2,w,0.14,d,ry,wc.clone().multiplyScalar(0.98));                         // the slab
          boxB(prop,x+ox*(d-0.05),y+0.6,z+oz*(d-0.05),w,1.0,0.1,ry,wc);                                           // its front wall
          [1,-1].forEach(function(sd){boxB(prop,x+ox*d/2+(dx/len)*sd*(w/2-0.05),y+0.6,z+oz*d/2+(dz/len)*sd*(w/2-0.05),0.1,1.0,d,ry,wc);});
          if(closed&&f<fl){boxB(prop,x+ox*(d-0.05),y+1.1+(FH-1.25)/2,z+oz*(d-0.05),w-0.1,FH-1.25,0.04,ry,glassC);      // closed in: sliding panes over the wall, aluminium frames
            for(let k=0;k<=3;k++){const s=-w/2+0.05+k*(w-0.1)/3; boxB(prop,x+ox*(d-0.03)+(dx/len)*s,y+1.1+(FH-1.25)/2,z+oz*(d-0.03)+(dz/len)*s,0.05,FH-1.25,0.06,ry,alu);}}
          else{boxB(prop,x+ox*(d-0.05),y+1.12,z+oz*(d-0.05),w,0.04,0.05,ry,rail);
            const life=r(), ax=dx/len, az=dz/len;
            if(life<0.45){boxB(prop,x+ox*0.75,y+1.75,z+oz*0.75,w-0.3,0.02,0.02,ry,C(0xd8d8d4)); const nc=3+Math.floor(r()*4);      // the washing, hung out
              for(let k=0;k<nc;k++){const s2=-w/2+0.35+(k+0.5)*(w-0.7)/nc, hh=0.3+r()*0.35, cc=C([0xf4f2ec,0x2f5f9a,0xd84a4a,0xe8c91a,0x6b8f5a,0xf2b8c8,0x2b2d30,0x9fc4d6][Math.floor(r()*8)]);
                boxB(prop,x+ox*0.75+ax*s2,y+1.74-hh/2,z+oz*0.75+az*s2,0.22+r()*0.2,hh,0.02,ry,cc);}}
            if(life>0.3&&life<0.85) for(let k=0;k<1+Math.floor(r()*3);k++){const s2=-w/2+0.3+r()*(w-0.6), px=x+ox*(d-0.05)+ax*s2, pz=z+oz*(d-0.05)+az*s2;      // pots on the parapet
              boxB(prop,px,y+1.24,pz,0.24,0.2,0.24,ry,C(0xb5653c)); boxB(prop,px,y+1.5,pz,0.34,0.34,0.32,ry+r(),C([0x4f7a37,0x3f6a2f,0x6a8a3a][k%3]));}
            if(life>0.95) cylB(prop,x+ox*(d-0.2)+ax*(w/2-0.4),y+1.5,z+oz*(d-0.2)+az*(w/2-0.4),0.3,0.06,ry+R/2,C(0xe9e9e4),12);}}}      // a satellite dish
      const ryE=Math.atan2(out[0],out[1]), AW=[0x2f6b45,0xb8322c,0xd98a2b,0x1f4f8a,0xe8d8b0,0x6b4a33];      // awnings over the windows between the balconies
      for(let j=1-((i+bd.i)%2);j<nb;j+=2){if(r()>0.22) continue; const f0=(j+0.5)/nb, x=a[0]+dx*f0, z=a[1]+dz*f0, ac=C(AW[Math.floor(r()*AW.length)]), fl0=1+Math.floor(r()*(fl-1));
        const y=U+gh+(fl0-1)*FH+2.42; boxB(prop,x+out[0]*0.42,y,z+out[1]*0.42,1.9,0.03,0.9,ryE,ac,0.5); boxB(prop,x+out[0]*0.8,y-0.28,z+out[1]*0.8,1.92,0.18,0.02,ryE,ac.clone().multiplyScalar(0.85));}}
    for(let k=0;k<Math.min(10,fl*2);k++){const i=Math.floor(r()*n), a=p[i], c=p[(i+1)%n], dx=c[0]-a[0], dz=c[1]-a[1], len=hyp(dx,dz); if(len<3) continue; const out=[-dz/len,dx/len], f0=0.1+r()*0.8, y=U+gh+Math.floor(r()*(fl-1))*FH+0.5, x=a[0]+dx*f0+out[0]*0.17, z=a[1]+dz*f0+out[1]*0.17, ry=Math.atan2(dx,dz)-R/2;
      boxB(prop,x,y,z,0.82,0.56,0.3,ry,C(0xf0efea)); boxB(prop,x+out[0]*0.16,y,z+out[1]*0.16,0.5,0.42,0.02,ry,C(0x4a4d50));}}
}
function obb(pts){let best=null;
  for(let i=0;i<pts.length;i++){const a=pts[i], b=pts[(i+1)%pts.length], dx=b[0]-a[0], dz=b[1]-a[1], l=hyp(dx,dz); if(l<1) continue;
    const ux=dx/l, uz=dz/l; let s0=1e9, s1=-1e9, t0=1e9, t1=-1e9;
    pts.forEach(function(p){const s=p[0]*ux+p[1]*uz, t=-p[0]*uz+p[1]*ux; s0=Math.min(s0,s); s1=Math.max(s1,s); t0=Math.min(t0,t); t1=Math.max(t1,t);});
    const ar=(s1-s0)*(t1-t0); if(!best||ar<best.ar) best={ar:ar,ux:ux,uz:uz,s0:s0,s1:s1,t0:t0,t1:t1};}
  if(!best){const a=pts[0]; best={ar:1,ux:1,uz:0,s0:a[0]-1,s1:a[0]+1,t0:a[1]-1,t1:a[1]+1};}
  const c=function(s,t){return [s*best.ux-t*best.uz,s*best.uz+t*best.ux];};
  best.corners=[c(best.s0,best.t0),c(best.s1,best.t0),c(best.s1,best.t1),c(best.s0,best.t1)]; return best;}
blds.forEach(block);

/* =====================================================================
   The streets' furniture: lamps, signs, trees, parked cars
   ===================================================================== */
/* along a road at a sideways offset: every step metres, skipping what skip says no to */
function along(rd,off,step,jit,r,fn){for(let j=1;j<rd.p.length;j++){const a=rd.p[j-1], b=rd.p[j], dx=b[0]-a[0], dz=b[1]-a[1], l=hyp(dx,dz); if(l<2) continue; const nx=-dz/l, nz=dx/l;
  for(let s=step*0.5+(r()-0.5)*jit;s<l-1;s+=step+(r()-0.5)*jit){const x=a[0]+dx*s/l+nx*off, z=a[1]+dz*s/l+nz*off; fn(x,z,Math.atan2(dx,dz),j,s/l);}}}
const SIDE=[1,-1];
const lampSpots=[], treeSpots=[], carSpots=[], stops=[];
(function(){const r=A.rng(31);
  roads.forEach(function(rd){if(rd.w[0]===0) return; const cw=rd.w[0]/2;
    /* lamps: one side, every 32 m, at the kerb */
    along(rd,cw+0.45,rd.k===1||rd.k===6?28:34,4,r,function(x,z,h){if(kept(x,z)||nearHome(x,z)||inBuilding(x,z,0.5)||nearJunction(x,z,rd,1.2)) return; lampSpots.push([x,z,h+R/2]);});
    /* trees: both sides, in the pavement */
    if(rd.k!==3) SIDE.forEach(function(sd){along(rd,sd*(cw+Math.min(1.1,rd.w[1]*0.4)),rd.k===2?11:13,5,r,function(x,z){if(r()<0.18||kept(x,z)||nearHome(x,z)||inBuilding(x,z,1.6)||nearJunction(x,z,rd,4)) return;
      if((rd.name==='Haroe St'&&Math.abs(z-ZC)<160)||((rd.name==='Mirkin St'||rd.name==='David St'||rd.name==='Moshe Sharet St')&&hyp(x-OURC[0],z-OURC[1])<62)) return;      // building.js plants these
      treeSpots.push([x,z,rd.k===1||rd.k===6?1:0]);});});
    /* parked cars: both sides, nose along the traffic, in the gaps between the junctions */
    if(rd.k===1||rd.k===2) SIDE.forEach(function(sd){along(rd,sd*(cw-(rd.k===1?0.95:1.05)),6.3,0.8,r,function(x,z,h){if(r()<(LITE?0.75:0.5)||kept(x,z)||nearHome(x,z)||nearJunction(x,z,rd,7)||inBuilding(x,z,1.2)) return;
      if(rd.name==='Haroe St'&&Math.abs(z-ZC)<150) return; carSpots.push([x,z,h+(sd>0?0:R)]);});});
  });
  /* in the gardens round the blocks, and in the parks */
  blds.forEach(function(b){const k=LITE?(b.area>300?1:0):b.area>300?3:b.area>120?2:1; for(let i=0;i<k;i++){const j=Math.floor(r()*b.p.length), q=b.p[j], dx=q[0]-b.c[0], dz=q[1]-b.c[1], l=hyp(dx,dz)||1, d=2.5+r()*3.5, x=q[0]+dx/l*d+(r()-0.5)*4, z=q[1]+dz/l*d+(r()-0.5)*4;
    if(kept(x,z)||nearHome(x,z)||inBuilding(x,z,1.8)||onRoad(x,z,1.5)) continue; treeSpots.push([x,z,r()<0.1?2:3]);}});
  TD.G.forEach(function(a){if(a[0]!=='park'&&a[0]!=='garden'&&a[0]!=='dog_park') return; const p=outline(a[2],true), n=Math.min(160,areaOf(p)/90); let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9; p.forEach(function(q){x0=Math.min(x0,q[0]); x1=Math.max(x1,q[0]); z0=Math.min(z0,q[1]); z1=Math.max(z1,q[1]);});
    for(let i=0;i<n;i++){const x=x0+r()*(x1-x0), z=z0+r()*(z1-z0); if(!inPoly(p,x,z)||inBuilding(x,z,1.5)||onRoad(x,z,1)||kept(x,z)) continue; treeSpots.push([x,z,r()<0.2?2:3]);}});
})();
/* kerbs: a raised edge of white stone along every carriageway, broken where another street comes in */
const crossKeys=new Set(cross.filter(function(c){return c.car.length>=2;}).map(function(c){return key([c.x,c.z]);})), pRuns=[];
(function(){const kc=C(0xe4e2da), red=C(0xc23e33), wht=C(0xf1f0ea);
  roads.forEach(function(rd){if(!rd.w[0]) return; const cw=rd.w[0]/2+0.07;
    for(let j=1;j<rd.p.length;j++){const a=rd.p[j-1], b=rd.p[j], dx=b[0]-a[0], dz=b[1]-a[1], l=hyp(dx,dz); if(l<0.5) continue; const ux=dx/l, uz=dz/l, nx=-uz, nz=ux;
      const ja=crossKeys.has(key(a))&&rd.k!==3, jb=crossKeys.has(key(b))&&rd.k!==3;      // no stopping here: the kerb painted red and white, stone by stone
      const stone=function(t0,t1){const m=(t0+t1)/2, x=a[0]+ux*m+nx*sdN*cw, z=a[1]+uz*m+nz*sdN*cw; return [x,z];}; let sdN=1;
      const piece=function(t0,t1,c){const q=stone(t0,t1); boxB(bufOf(tileOf(q[0],q[1]),PROP),q[0],U+0.075,q[1],0.15,0.15,t1-t0+0.02,Math.atan2(ux,uz),c);};
      SIDE.forEach(function(sd){sdN=sd; let run=null; const flush=function(t1){if(run===null) return; const t0=run; run=null; if(t1-t0<0.4) return;
          if(rd.w[1]>0.5) pRuns.push({rd:rd,a:a,ux:ux,uz:uz,nx:nx*sd,nz:nz*sd,t0:t0,t1:t1});      // the pavement behind this stretch of kerb
          const p0=ja?Math.min(t1,t0+12):t0, p1=jb?Math.max(p0,t1-12):t1;
          for(let t=t0;t<p0-0.05;t+=1) piece(t,Math.min(p0,t+1),Math.round(t-t0)%2?wht:red);
          if(p1-p0>0.05) piece(p0,p1,kc);
          for(let t=p1;t<t1-0.05;t+=1) piece(t,Math.min(t1,t+1),Math.round(t1-t)%2?wht:red);};
        for(let t=0;t<=l;t+=1){const x=a[0]+ux*t+nx*sd*cw, z=a[1]+uz*t+nz*sd*cw, q=roadNear(x,z,rd), ok=!(q&&q.r.w[0]>0&&q.d<0.4)&&!kept(x,z)&&!nearHome(x,z)&&!inBuilding(x,z,0);
          if(ok&&run===null) run=Math.max(0,t-0.5); else if(!ok&&run!==null) flush(Math.max(run,t-0.5));}
        flush(l);});}});})();
/* the pavements, a kerb's height over the road: grey interlocking stones along the main streets, the old square tiles with their studs on the
   side streets, each stone's joint picked out by the sun */
function paverTex(kind,relief){return det.tex(256,256,function(g){const r=A.rng(kind==='brick'?61:62), G=function(v){const c=Math.round(v*255); return 'rgb('+c+','+c+','+c+')';};
  g.fillStyle=relief?G(0.35):'#8e8a82'; g.fillRect(0,0,256,256);
  if(kind==='brick'){for(let row=0;row<16;row++){const off=(row%2)*16; for(let x=-off;x<256;x+=32){const v=r(), red=v<0.08, dk=v>0.9;      // 20 by 10 cm, in stretcher bond
      g.fillStyle=relief?G(0.62+r()*0.06):red?'#a8766a':dk?'#9a978f':'#b9b5ac'; g.fillRect(x+1.5,row*16+1.5,29,13);
      if(!relief){g.fillStyle='rgba(255,255,255,'+(r()*0.08)+')'; g.fillRect(x+3,row*16+3,25,3);}}}}
  else{for(let ty=0;ty<4;ty++) for(let tx=0;tx<4;tx++){const v=r(), x=tx*64, y=ty*64;      // 40 by 40 cm, grey, a grid of studs
      g.fillStyle=relief?G(0.62):'rgb('+(178+v*14|0)+','+(174+v*14|0)+','+(166+v*12|0)+')'; g.fillRect(x+1.5,y+1.5,61,61);
      for(let i=0;i<4;i++) for(let k=0;k<4;k++){g.fillStyle=relief?G(0.78):'rgba(150,146,138,0.55)'; g.beginPath(); g.arc(x+11+i*14,y+11+k*14,3.4,0,7); g.fill();}
      if(!relief&&r()<0.2){g.fillStyle='rgba(60,55,45,0.12)'; g.beginPath(); g.ellipse(x+20+r()*30,y+20+r()*30,8+r()*14,5+r()*9,r()*3,0,7); g.fill();}}}      // a stain here and there
},true);}
function paverM(kind){const m=new THREE.MeshPhongMaterial({map:paverTex(kind,false),normalMap:normalsOf(paverTex(kind,true),3),vertexColors:true,shininess:10,specular:0x1c1c1c}); m.map.repeat.set(1,1); return A.reg(grain(m,0.31,0.047),'street');}
const PAVE={brick:paverM('brick'),tile:paverM('tile')};
(function(){const top=C(0xffffff), edge=C(0x8a867e);
  pRuns.forEach(function(q){const rd=q.rd, a=q.a, i0=rd.w[0]/2+0.145, o0=rd.w[0]/2+rd.w[1], m=PAVE[rd.k===1||rd.k===6||rd.k===7?'brick':'tile'];
    const P=function(t,o){return [a[0]+q.ux*t+q.nx*o,a[1]+q.uz*t+q.nz*o];}, A0=P(q.t0,i0), A1=P(q.t1,i0), B1=P(q.t1,o0), B0=P(q.t0,o0), mid=P((q.t0+q.t1)/2,(i0+o0)/2), b=bufOf(tileOf(mid[0],mid[1]),m), y=U+PH;
    let pts=[A0,A1,B1,B0]; const cyv=(pts[1][1]-pts[0][1])*(pts[2][0]-pts[0][0])-(pts[1][0]-pts[0][0])*(pts[2][1]-pts[0][1]); if(cyv<0) pts=[A0,B0,B1,A1];      // facing up
    quad(b,[pts[0][0],y,pts[0][1]],[pts[1][0],y,pts[1][1]],[pts[2][0],y,pts[2][1]],[pts[3][0],y,pts[3][1]],[0,1,0],pts.reduce(function(o,p2){o.push(p2[1]/1.6,p2[0]/1.6); return o;},[]),top);      // world-square UVs: where two pavements meet at a corner they are the same stones
    const side=function(p0,p1,ox,oz){const dx=p1[0]-p0[0], dz=p1[1]-p0[1]; if((-dz)*ox+dx*oz<0){const t=p0; p0=p1; p1=t;} wallQ(b,p0,p1,U-0.01,y,0,hyp(dx,dz)/1.6,0,0.08,edge);};
    side(B0,B1,q.nx,q.nz); side(A0,B0,-q.ux,-q.uz); side(A1,B1,q.ux,q.uz);});      // its edge to the garden, and its ends
})();
/* the paint on the road: zebra crossings on every arm of a junction, the dashed line down the middle. Real strips laid a few millimetres over the
   asphalt and drawn in front of it, so they stay sharp however low you look along the street */
const MARK=A.reg(new THREE.MeshLambertMaterial({vertexColors:true,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-4}),'street');
function flatQ(b,x,z,ax,az,L,W,y,col){const nx=-az, nz=ax, P=[[x-ax*L-nx*W,z-az*L-nz*W],[x-ax*L+nx*W,z-az*L+nz*W],[x+ax*L+nx*W,z+az*L+nz*W],[x+ax*L-nx*W,z+az*L-nz*W]];
  quad(b,[P[0][0],y,P[0][1]],[P[1][0],y,P[1][1]],[P[2][0],y,P[2][1]],[P[3][0],y,P[3][1]],[0,1,0],[0,0,1,0,1,1,0,1],col);}
(function(){const wh=C(0xeceae2), worn=C(0xb9b8b2);
  cross.forEach(function(c){if(c.car.length<2||kept(c.x,c.z)||nearHome(c.x,c.z)) return; c.car.forEach(function(rd){const j=rd.p.findIndex(function(q){return key(q)===key([c.x,c.z]);}); if(j<0) return;
    [j-1,j+1].forEach(function(o){if(o<0||o>=rd.p.length) return; const q=rd.p[o], dx=q[0]-c.x, dz=q[1]-c.z, l=hyp(dx,dz); if(l<8) return; const ux=dx/l, uz=dz/l;
      const wo=Math.max.apply(null,c.car.filter(function(x){return x!==rd;}).map(function(x){return x.w[0]/2+x.w[1];})), at=wo+1.6, b=bufOf(tileOf(c.x,c.z),MARK);
      zebras.push([c.x+ux*at,c.z+uz*at,ux,uz,rd.w[0]/2]);
      for(let s2=-rd.w[0]/2+0.45;s2<rd.w[0]/2-0.3;s2+=0.9){const x=c.x+ux*at-uz*s2, z=c.z+uz*at+ux*s2; flatQ(b,x,z,ux,uz,1.4,0.25,U+0.006,wh);}
      if(rd.k===1||rd.k===6||rd.k===7){const x=c.x+ux*(at+2.2), z=c.z+uz*(at+2.2); flatQ(b,x+uz*rd.w[0]/4,z-ux*rd.w[0]/4,uz,-ux,rd.w[0]/4-0.1,0.2,U+0.006,wh);}});});});      // and a stop line before it, on your side
  roads.forEach(function(rd){if(!rd.w[0]||rd.k===3) return; const main=rd.k===1||rd.k===6||rd.k===7, dash=main?3:2, gap=main?5:6, w=main?0.075:0.05;
    for(let j=1;j<rd.p.length;j++){const a=rd.p[j-1], b=rd.p[j], dx=b[0]-a[0], dz=b[1]-a[1], l=hyp(dx,dz); if(l<2) continue; const ux=dx/l, uz=dz/l;
      for(let t=1;t+dash<l;t+=dash+gap){const m=t+dash/2, x=a[0]+ux*m, z=a[1]+uz*m; if(kept(x,z)||nearHome(x,z)||nearJunction(x,z,rd,1.0)) continue; flatQ(bufOf(tileOf(x,z),MARK),x,z,ux,uz,dash/2,w,U+0.005,main?wh:worn);}}});
})();
/* lamps: a grey pole, an arm out over the road, the lamp, lit in the evening */
const LAMPH=A.reg(new THREE.MeshLambertMaterial({color:0xe8e6dc}),'street');
lampSpots.forEach(function(q){const t=tileOf(q[0],q[1]), b=bufOf(t,PROP), hb=bufOf(t,LAMPH), ux=Math.sin(q[2]), uz=Math.cos(q[2]), c=C(0x8e9599);
  cylB(b,q[0],U+3.6,q[1],0.07,7.2,null,c,6); boxB(b,q[0]+ux*0.75,U+7.1,q[1]+uz*0.75,0.08,0.08,1.6,q[2],c); boxB(hb,q[0]+ux*1.5,U+7.02,q[1]+uz*1.5,0.32,0.1,0.62,q[2],C(0xffffff)); boxB(b,q[0],U+0.4,q[1],0.22,0.8,0.22,q[2],C(0x7d8488));});
/* street signs at the corners: Hebrew above, English below, blue */
const signM={};
function signOf(rd){if(!rd.name||!rd.he) return null; return signM[rd.name]||(signM[rd.name]=det.streetSign(rd.he,rd.name.replace(/ St$/,' St.')));}
const signs=A.batch(root);
cross.forEach(function(c){const named=c.car.filter(function(rd){return signOf(rd);}).slice(0,2); if(!named.length||kept(c.x,c.z)||nearHome(c.x,c.z)) return;
  const rd=named[0], j=rd.p.findIndex(function(q){return key(q)===key([c.x,c.z]);}), q=rd.p[j+1]||rd.p[j-1]; if(!q) return; const dx=q[0]-c.x, dz=q[1]-c.z, l=hyp(dx,dz)||1, wo=Math.max.apply(null,c.car.map(function(x){return x.w[0]/2;}));
  const x=c.x+dx/l*(wo+2.2)-dz/l*(rd.w[0]/2+0.5), z=c.z+dz/l*(wo+2.2)+dx/l*(rd.w[0]/2+0.5); if(inBuilding(x,z,0.3)) return;
  const g=det.P.grp(); det.P.cyl(0.035,2.9,0x8e9599,0,1.45,0,g,8); named.forEach(function(s,k){const sg=det.P.grp(0,2.65-k*0.42,0,g,k?R/2:0), m=signOf(s); det.P.plane(0.78,0.29,m,0,0,0.025,sg); det.P.plane(0.78,0.29,m,0,0,-0.025,sg,R); det.P.box(0.8,0.31,0.04,0x9aa0a2,0,0,0,sg);});
  signs.bake(g,x,U,z,Math.atan2(dx,dz)+R/2);});
signs.done('street');

/* trees: instanced, a round crown of leaves on a trunk; in the gardens some are palms */
const leafT=det.tex(256,256,function(g){const r=A.rng(5); g.clearRect(0,0,256,256);
  for(let i=0;i<1700;i++){const x=r()*256, y=r()*256, s=4+r()*9, a=r()*R; g.fillStyle=['#3f6a2f','#4f7a37','#5f8a42','#2f5326','#6f9a4c','#46703a'][Math.floor(r()*6)]; g.beginPath(); g.ellipse(x,y,s,s*0.5,a,0,7); g.fill();
    g.fillStyle='rgba(220,240,180,0.25)'; g.beginPath(); g.ellipse(x-s*0.2,y-s*0.15,s*0.4,s*0.18,a,0,7); g.fill();}},true);
const crownM=A.reg(new THREE.MeshLambertMaterial({map:leafT,alphaTest:0.5,side:THREE.DoubleSide,vertexColors:true}),'town');
const barkM=A.reg(new THREE.MeshLambertMaterial({color:0x6e5e4c}),'town');
function crownGeo(seed,lumps,flat){const r=A.rng(seed), pos=[], nor=[], col=[], uv=[], idx=[];
  for(let l=0;l<lumps;l++){const cx=l?(r()-0.5)*1.1:0, cy=l?(r()-0.3)*0.6:0, cz=l?(r()-0.5)*1.1:0, rad=l?0.55+r()*0.25:0.85, ws=8, hs=5, base=pos.length/3;
    for(let j=0;j<=hs;j++) for(let i=0;i<=ws;i++){const th=j/hs*R, ph=i/ws*2*R, dn=1+(r()-0.5)*0.22*(j>0&&j<hs?1:0), x=cx+Math.sin(th)*Math.cos(ph)*rad*dn, y=cy+Math.cos(th)*rad*dn*(flat||0.78), z=cz+Math.sin(th)*Math.sin(ph)*rad*dn;
      pos.push(x,y,z); const nx=x, ny=y+0.35, nz=z, nl=hyp(nx,hyp(ny,nz))||1; nor.push(nx/nl,ny/nl,nz/nl); const sh=0.55+0.45*(y+1)/2; col.push(sh,sh,sh); uv.push(i/ws*3,j/hs*2);}
    for(let j=0;j<hs;j++) for(let i=0;i<ws;i++){const a=base+j*(ws+1)+i, b=a+ws+1; idx.push(a,b,a+1,b,b+1,a+1);}}
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3)); g.setAttribute('color',new THREE.Float32BufferAttribute(col,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); g.setIndex(idx); return g;}
const CROWN=[crownGeo(1,3,0.8),crownGeo(2,3,0.7)], TRUNK=new THREE.CylinderGeometry(0.07,0.11,1,6,1,true).translate(0,0.5,0);
const palmT=det.tree('palm',{h:1,s:1,n:14,seed:9,dates:false,dead:3}); const PALM=[];
palmT.crown.updateMatrixWorld(true); palmT.crown.traverse(function(o){if(o.isMesh){const g=o.geometry.clone().applyMatrix4(o.matrixWorld); g.translate(0,-1,0); PALM.push(g);}});
const palmGeo=PALM.length?merge(PALM):null;
function merge(list){let n=0; list.forEach(function(g){n+=g.attributes.position.count;}); const pos=new Float32Array(n*3), nor=new Float32Array(n*3), col=new Float32Array(n*3), uv=new Float32Array(n*2), idx=[]; let o=0;
  list.forEach(function(g){const P=g.attributes.position, Nn=g.attributes.normal, Cc=g.attributes.color, Uu=g.attributes.uv; for(let i=0;i<P.count;i++){pos.set([P.getX(i),P.getY(i),P.getZ(i)],(o+i)*3); nor.set([Nn.getX(i),Nn.getY(i),Nn.getZ(i)],(o+i)*3); col.set(Cc?[Cc.getX(i),Cc.getY(i),Cc.getZ(i)]:[1,1,1],(o+i)*3); uv.set(Uu?[Uu.getX(i),Uu.getY(i)]:[0,0],(o+i)*2);}
    if(g.index) for(let i=0;i<g.index.count;i++) idx.push(g.index.getX(i)+o); else for(let i=0;i<P.count;i++) idx.push(i+o); o+=P.count;});
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('normal',new THREE.BufferAttribute(nor,3)); g.setAttribute('color',new THREE.BufferAttribute(col,3)); g.setAttribute('uv',new THREE.BufferAttribute(uv,2)); g.setIndex(idx); return g;}
const TREEC=[0xffffff,0xe8f0d0,0xd8e8c0,0xf0f4e0,0xc8dcb0].map(C);
treeSpots.forEach(function(q,i){const r=A.rng(i*7+1), big=q[2]===1; q.s=big?3.2+r()*1.4:q[2]===2?1:2.0+r()*1.3; q.h=big?4.6+r()*1.2:q[2]===2?5+r()*4:3.0+r()*1.5; q.a=r()*6.3; q.sy=0.85+r()*0.3; q.c=TREEC[Math.floor(r()*TREEC.length)];});
const m4=new THREE.Matrix4(), qt=new THREE.Quaternion(), v3=new THREE.Vector3(), s3=new THREE.Vector3(), yax=new THREE.Vector3(0,1,0);
function instanced(geo,mat,list,each,t){if(!list.length) return null; const g=geo.clone(), im=new THREE.InstancedMesh(g,mat,list.length), w=t.w||TW;
  list.forEach(function(q,i){const col=each(q); im.setMatrixAt(i,m4.compose(v3,qt,s3)); if(col&&im.setColorAt) im.setColorAt(i,col);});
  g.boundingSphere=new THREE.Sphere(new THREE.Vector3(t.x0+w/2,10,t.z0+w/2),w*0.75); g.boundingBox=null; im.castShadow=true; im.receiveShadow=true; t.g.add(im); return im;}
/* the trees in small squares of the map: near you each crown is a few hundred leaf cards, farther off a plain round one */
const CARD=[det.crownGeo({c:[0,0,0],r:[1,0.8,1],n:LITE?80:150,size:0.42,seed:3,cell:'broad',shell:0.25,tint:0xffffff,tint2:0xd8e6b8}),det.crownGeo({c:[0,0.05,0],r:[1.05,0.7,1.05],n:LITE?80:150,size:0.4,seed:8,cell:'broad',shell:0.3,tint:0xf0f4e0,tint2:0xc8dca8})];
const TTN=16, TTW=TS/TTN, ttiles=new Map();
const leafDepth=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:det.leafM.map,alphaTest:0.42}), crownDepth=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:leafT,alphaTest:0.5});
treeSpots.forEach(function(q){const i=Math.max(0,Math.min(TTN-1,Math.floor((q[0]-TX0)/TTW))), j=Math.max(0,Math.min(TTN-1,Math.floor((q[1]-TZ0)/TTW))), k=j*TTN+i;
  let tt=ttiles.get(k); if(!tt){tt={g:new THREE.Group(),x0:TX0+i*TTW,z0:TZ0+j*TTW,w:TTW,trees:[],cx:TX0+(i+0.5)*TTW,cz:TZ0+(j+0.5)*TTW}; ttiles.set(k,tt); root.add(tt.g);} tt.trees.push(q);});
ttiles.forEach(function(tt,k){
  const broad=tt.trees.filter(function(q){return q[2]!==2;}), palms=tt.trees.filter(function(q){return q[2]===2;});
  const each=function(q){v3.set(q[0],U+q.h,q[1]); qt.setFromAxisAngle(yax,q.a); s3.set(q.s,q.s*q.sy,q.s); return q.c;};
  tt.far=instanced(CROWN[k%2],crownM,broad,each,tt); tt.near=instanced(CARD[k%2],det.leafM,broad,each,tt); if(tt.near){tt.near.visible=false; tt.near.customDepthMaterial=leafDepth;} if(tt.far) tt.far.customDepthMaterial=crownDepth;
  instanced(TRUNK,barkM,broad,function(q){v3.set(q[0],U,q[1]); qt.identity(); s3.set(q[2]===1?2.2:1.5,q.h+q.s*0.2,q[2]===1?2.2:1.5);},tt);
  if(palmGeo&&palms.length){const pm=instanced(palmGeo,det.leafM,palms,function(q){v3.set(q[0],U+q.h,q[1]); qt.setFromAxisAngle(yax,q.a); s3.set(1,1,1);},tt); if(pm) pm.customDepthMaterial=leafDepth;
    instanced(TRUNK,barkM,palms,function(q){v3.set(q[0],U,q[1]); qt.identity(); s3.set(3.4,q.h,3.4);},tt);}
});
let treeT=0, cutT=0; const cut=new Set();
ttiles.forEach(function(tt){tt.broad=tt.trees.filter(function(q){return q[2]!==2;});});
/* a crown the camera is inside, or that stands right between it and you, is taken away while it is */
function crownAt(tt,i,on){const q=tt.broad[i]; if(on){v3.set(q[0],U+q.h,q[1]); qt.setFromAxisAngle(yax,q.a); s3.set(q.s,q.s*q.sy,q.s);} else{v3.set(q[0],-80,q[1]); qt.identity(); s3.set(0.001,0.001,0.001);}
  m4.compose(v3,qt,s3); [tt.near,tt.far].forEach(function(im){if(im){im.setMatrixAt(i,m4); im.instanceMatrix.needsUpdate=true;}});}
A.frameFns.push(function(dt){const c=A.camera.position;
  cutT-=dt; if(cutT<0){cutT=0.1; const want=new Set(), p=A.player, ti=Math.floor((c.x-TX0)/TTW), tj=Math.floor((c.z-TZ0)/TTW);
    if(A.simsOn&&p&&!p.lvl&&c.y<40) for(let dj=-1;dj<=1;dj++) for(let di=-1;di<=1;di++){const tt=ttiles.get((tj+dj)*TTN+(ti+di)); if(!tt) continue;
      tt.broad.forEach(function(q,i){const top=U+q.h+q.s*q.sy*0.85, bot=U+q.h-q.s*q.sy*0.9; let hide=Math.hypot(q[0]-c.x,q[1]-c.z)<q.s*1.1+0.6&&c.y>bot-0.5&&c.y<top+0.8;
        if(!hide&&p){const tx=p.x, tz=p.z, ty=p.p.g.position.y+1.2, dx=tx-c.x, dz=tz-c.z, dy=ty-c.y, L2=dx*dx+dz*dz+dy*dy, t=Math.max(0,Math.min(1,((q[0]-c.x)*dx+(U+q.h-c.y)*dy+(q[1]-c.z)*dz)/L2));
          const px=c.x+dx*t, py=c.y+dy*t, pz=c.z+dz*t; hide=t>0.05&&t<0.92&&Math.hypot(px-q[0],pz-q[1])<q.s*0.8&&py>bot&&py<top;}      // on the line from the camera to you
        if(hide) want.add(tt); if(hide) (tt.cut||(tt.cut=new Set())).add(i);});}
    ttiles.forEach(function(tt){if(!tt.cut&&!tt.was) return; const now=tt.cut||new Set(), was=tt.was||new Set(); let ch=false;
      was.forEach(function(i){if(!now.has(i)){crownAt(tt,i,true); ch=true;}}); now.forEach(function(i){if(!was.has(i)){crownAt(tt,i,false); ch=true;}});
      tt.was=now.size?now:null; tt.cut=null; if(ch) A.touch(1);});}
  treeT-=dt; if(treeT>0) return; treeT=0.3;
  ttiles.forEach(function(tt){if(!tt.near&&!tt.hedge) return; const near=c.y<140&&Math.hypot(c.x-tt.cx,c.z-tt.cz)<150; if(tt.hedge) tt.hedge.visible=near&&c.y<60; if(tt.near&&tt.near.visible!==near){tt.near.visible=near; tt.far.visible=!near; A.touch(1);}});});

/* =====================================================================
   The plots: in front of each block, along the back of the pavement, a stone wall with a black fence on it, a plastered wall, or a low kerb
   with a hedge; a gate opposite the entrance and a paved path up to it; the entrance under its concrete canopy, with its light and the
   house number; and the bins in their stone enclosure with green doors, by the gate
   ===================================================================== */
const fenceT=det.tex(64,64,function(g){g.clearRect(0,0,64,64); g.fillStyle='#fff'; for(let x=2;x<64;x+=8) g.fillRect(x,0,3,64); g.fillRect(0,3,64,4); g.fillRect(0,56,64,4);},true);
const FENCE=A.reg(new THREE.MeshLambertMaterial({map:fenceT,alphaTest:0.5,side:THREE.DoubleSide,vertexColors:true}),'town');
const hedgeSpots=[], gates=[];
function plot(bd){
  if(bd.k==='g'||bd.area<60) return;
  const r=A.rng(bd.i*13+7), p=bd.p, n=p.length; let best=null;
  for(let i=0;i<n;i++){const a=p[i], c=p[(i+1)%n], dx=c[0]-a[0], dz=c[1]-a[1], len=hyp(dx,dz); if(len<4) continue; const out=[-dz/len,dx/len], mx=(a[0]+c[0])/2, mz=(a[1]+c[1])/2;
    const q=roadNear(mx+out[0]*4,mz+out[1]*4); if(!q||q.r.w[0]===0) continue; const rd=q.r, ra=rd.p[q.j-1], rb=rd.p[q.j], rl=hyp(rb[0]-ra[0],rb[1]-ra[1])||1, ux=(rb[0]-ra[0])/rl, uz=(rb[1]-ra[1])/rl;
    let nx=-uz, nz=ux; const sb=(mx-ra[0])*nx+(mz-ra[1])*nz; if(sb<0){nx=-nx; nz=-nz;}
    const dB=Math.abs(sb); if(dB>30||Math.abs(out[0]*nx+out[1]*nz)<0.75||out[0]*nx+out[1]*nz>0) continue;      // an edge along the street, facing it
    if(!best||dB<best.dB) best={a:a,c:c,len:len,out:out,mx:mx,mz:mz,rd:rd,ra:ra,ux:ux,uz:uz,nx:nx,nz:nz,dB:dB};}
  if(!best) return;
  const b=best, rd=b.rd, line=rd.w[0]/2+rd.w[1]+0.12, room=b.dB-line, t=tileOf(bd.c[0],bd.c[1]), prop=bufOf(t,PROP), C2=C;
  if(kept(b.mx,b.mz)||nearHome(b.mx,b.mz)) return;
  const L=function(tv,o){return [b.ra[0]+b.ux*tv+b.nx*o,b.ra[1]+b.uz*tv+b.nz*o];}, along=function(P){return (P[0]-b.ra[0])*b.ux+(P[1]-b.ra[1])*b.uz;};
  const ta=along(b.a), tc=along(b.c), t0=Math.min(ta,tc)-1.5, t1=Math.max(ta,tc)+1.5, tm=along([b.mx,b.mz]), ry=Math.atan2(b.ux,b.uz), ryF=Math.atan2(b.out[0],b.out[1]), fx=-b.out[1], fz=b.out[0];
  /* the entrance */
  if(bd.fl>=3&&bd.h){const sx=b.mx+b.out[0]*0.16, sz=b.mz+b.out[1]*0.16, y0=U+bd.gh, h=bd.h-0.95-y0+0.6;
    if(h>2){boxB(prop,sx,y0+h/2,sz,2.7,h,0.32,ryF,bd.wc.clone().multiplyScalar(0.97));
      for(let y=y0+1.35;y<y0+h-0.8;y+=FH){boxB(prop,sx+b.out[0]*0.17,y+0.7,sz+b.out[1]*0.17,0.75,1.5,0.03,ryF,C(0x2e3a42)); boxB(prop,sx+b.out[0]*0.19,y+0.7,sz+b.out[1]*0.19,0.75,0.04,0.04,ryF,C(0xd8d4ca));}}}      // the landings' windows, one a floor
  if(!bd.pil&&bd.fl>=2){const d=[b.mx+b.out[0]*0.05,b.mz+b.out[1]*0.05];
    boxB(prop,d[0],U+1.2,d[1],1.45,2.4,0.1,ryF,C2(0xd8d4ca)); boxB(prop,d[0]+b.out[0]*0.04,U+1.12,d[1]+b.out[1]*0.04,1.15,2.2,0.06,ryF,C2(0x2a343b));      // the frame, the glass door
    boxB(prop,d[0]+b.out[0]*0.08,U+1.1,d[1]+b.out[1]*0.08,0.03,1.9,0.03,ryF,C2(0xb9bdbf));
    boxB(prop,d[0]+b.out[0]*0.65,U+2.82,d[1]+b.out[1]*0.65,2.4,0.15,1.3,ryF,C2(0xe2ddd2));      // the canopy
    boxB(bufOf(t,LAMPH),d[0]+b.out[0]*0.65,U+2.73,d[1]+b.out[1]*0.65,0.32,0.05,0.32,ryF,C2(0xffffff));      // its light
    boxB(prop,d[0]+b.out[0]*0.25,U+0.08,d[1]+b.out[1]*0.25,2.0,0.16,0.42,ryF,C2(0xcfc9bb)); boxB(prop,d[0]+b.out[0]*0.6,U+0.04,d[1]+b.out[1]*0.6,2.2,0.08,0.4,ryF,C2(0xd6d0c2));      // two steps
    boxB(prop,d[0]+fx*1.0+b.out[0]*0.03,U+2.15,d[1]+fz*1.0+b.out[1]*0.03,0.3,0.22,0.03,ryF,C2(0x1d4f9c)); boxB(prop,d[0]+fx*1.0+b.out[0]*0.05,U+2.15,d[1]+fz*1.0+b.out[1]*0.05,0.16,0.1,0.01,ryF,C2(0xf2f2ee));      // the house number
    boxB(prop,d[0]-fx*0.95+b.out[0]*0.04,U+1.35,d[1]-fz*0.95+b.out[1]*0.04,0.16,0.28,0.04,ryF,C2(0x9aa0a2));}      // the intercom
  if(room<1.4) return;      // built right up to the pavement: no front garden
  /* the wall along the pavement, the gate, the bins */
  const style=r(), wallH=style<0.4?0.55:style<0.72?0.9:0.32, fenceH=style<0.4?0.75:0, hedge=style>=0.4&&r()<0.85, wcol=style<0.4?C2([0xd9cdb2,0xcfc2a5,0xe2d8c0][Math.floor(r()*3)]):style<0.72?bd.wc.clone().multiplyScalar(0.96):C2(0xbdb6a8);
  const gate=[tm-0.75,tm+0.75], side=r()<0.5?1:-1, bins=r()<0.8?(side>0?[tm+1.2,tm+3.8]:[tm-3.8,tm-1.2]):null, wl=line+0.12;
  const ok=function(tv){const P=L(tv,wl); if(tv>gate[0]&&tv<gate[1]) return false; if(bins&&tv>bins[0]&&tv<bins[1]) return false;
    if(inBuilding(P[0],P[1],0.3)||kept(P[0],P[1])||nearHome(P[0],P[1])) return false; const q=roadNear(P[0],P[1]); return !(q&&q.r!==rd&&q.d<q.r.w[1]+0.2);};
  const seg=function(a0,a1){if(a1-a0<0.3) return; const P=L((a0+a1)/2,wl), len=a1-a0, A0=L(a0,wl), A1=L(a1,wl);
    boxB(prop,P[0],U+wallH/2,P[1],len,wallH,0.24,ry+R/2,wcol); boxB(prop,P[0],U+wallH+0.03,P[1],len+0.03,0.06,0.3,ry+R/2,C2(0xe8e4da));
    if(fenceH){const fb=bufOf(t,FENCE); wallQ(fb,A0,A1,U+wallH+0.06,U+wallH+0.06+fenceH,0,len/0.96,0,1,C2(0x26292b));}
    if(hedge) for(let s2=a0+0.8;s2<a1;s2+=1.6){const H2=L(Math.min(s2,a1-0.4),wl+0.6); hedgeSpots.push([H2[0],H2[1],b.ux,b.uz,Math.min(1.7,a1-s2+0.9),wallH+0.55+r()*0.45]);}};
  let run=null; for(let tv=t0;tv<=t1;tv+=0.5){const o=ok(tv); if(o&&run===null) run=tv; else if(!o&&run!==null){seg(run,tv-0.25); run=null;}} if(run!==null) seg(run,t1);
  const G0=L(gate[0],wl), G1=L(gate[1],wl); if(!inBuilding((G0[0]+G1[0])/2,(G0[1]+G1[1])/2,0.3)){
    [gate[0]-0.1,gate[1]+0.1].forEach(function(tv){const P=L(tv,wl); boxB(prop,P[0],U+0.6,P[1],0.24,1.2,0.3,ry,wcol);});      // the gate posts
    wallQ(bufOf(t,FENCE),G0,G1,U+0.08,U+1.15,0,1.6,0,1,C2(0x2b2e30));      // the gate
    const D=[b.mx,b.mz], Gm=L(tm,wl), dx=D[0]-Gm[0], dz=D[1]-Gm[1], pl=hyp(dx,dz);      // the path to the door
    if(pl>0.5) boxB(prop,(D[0]+Gm[0])/2,U+0.03,(D[1]+Gm[1])/2,1.3,0.06,pl,Math.atan2(dx,dz),C2(0xd6d0c2));
    gates.push([Gm[0],Gm[1]]);}
  if(bins){const B0=L(bins[0],wl), B1=L(bins[1],wl), Bm=L((bins[0]+bins[1])/2,wl+0.6);
    if(!inBuilding(Bm[0],Bm[1],0.4)){boxB(prop,Bm[0],U+0.65,Bm[1],2.6,1.3,1.2,ry+R/2,wcol); boxB(prop,Bm[0],U+1.33,Bm[1],2.7,0.07,1.3,ry+R/2,C2(0xe8e4da));      // the bin enclosure
      [-0.62,0.62].forEach(function(o){const P=L((bins[0]+bins[1])/2+o,wl-0.02); boxB(prop,P[0],U+0.62,P[1],1.15,1.05,0.04,ry+R/2,C2(0x2f5a3a));});}}
}
blds.forEach(plot);
/* the hedges: a dark green core everywhere, and close by a hedge of real leaves round it */
const HEDGE=det.crownGeo({c:[0,0.52,0],r:[1.1,0.6,0.52],n:LITE?70:180,size:0.36,seed:11,cell:'broad',shell:0.3,tint:0xe8f0d0,tint2:0xc8dca8});
hedgeSpots.forEach(function(q){boxB(bufOf(tileOf(q[0],q[1]),PROP),q[0],U+q[5]*0.42,q[1],q[4]*0.9,q[5]*0.8,0.42,Math.atan2(q[2],q[3])+R/2,C(0x3c5a2c));
  const i=Math.max(0,Math.min(TTN-1,Math.floor((q[0]-TX0)/TTW))), j=Math.max(0,Math.min(TTN-1,Math.floor((q[1]-TZ0)/TTW))), k=j*TTN+i;
  let tt=ttiles.get(k); if(!tt){tt={g:new THREE.Group(),x0:TX0+i*TTW,z0:TZ0+j*TTW,w:TTW,trees:[],broad:[],cx:TX0+(i+0.5)*TTW,cz:TZ0+(j+0.5)*TTW}; ttiles.set(k,tt); root.add(tt.g);} (tt.hedges||(tt.hedges=[])).push(q);});
ttiles.forEach(function(tt){if(!tt.hedges) return; tt.hedge=instanced(HEDGE,det.leafM,tt.hedges,function(q){v3.set(q[0],U,q[1]); qt.setFromAxisAngle(yax,Math.atan2(q[2],q[3])-R/2); s3.set(q[4]/2*1.05,q[5],1); return TREEC[0];},tt);
  if(tt.hedge){tt.hedge.visible=false; tt.hedge.customDepthMaterial=leafDepth;}});

/* =====================================================================
   The streets' furniture: litter bins, benches, bus shelters, traffic lights, bollards, the orange cages for bottles, road signs
   ===================================================================== */
const SIG=new Map(), sigLamps=[0,1].map(function(){return ['r','a','g'].map(function(c){const m=new THREE.MeshLambertMaterial({color:c==='r'?0x5a1a16:c==='a'?0x5a4210:0x14401f}); return A.reg(m,'street');});});
const signs2=A.batch(root);
(function(){const r=A.rng(97), grey=C(0x8e9599), dark=C(0x2a2d2f), green=C(0x2f5a3a), wood=C(0x8a5a3c);
  const P=function(rd,j,t,o){const a=rd.p[j-1], b=rd.p[j], l=hyp(b[0]-a[0],b[1]-a[1])||1, ux=(b[0]-a[0])/l, uz=(b[1]-a[1])/l; return {x:a[0]+ux*t+(-uz)*o,z:a[1]+uz*t+ux*o,ux:ux,uz:uz,nx:-uz,nz:ux};};
  const okAt=function(x,z,rd){return !kept(x,z)&&!nearHome(x,z)&&!inBuilding(x,z,0.6)&&!nearJunction(x,z,rd,4);};
  roads.forEach(function(rd){if(!rd.w[0]||rd.k===3) return; const main=rd.k===1||rd.k===6||rd.k===7, cw=rd.w[0]/2, pw=rd.w[1];
    for(let j=1;j<rd.p.length;j++){const a=rd.p[j-1], b=rd.p[j], l=hyp(b[0]-a[0],b[1]-a[1]);
      for(let t=6+r()*20;t<l-4;t+=main?38+r()*20:70+r()*40){const sd=r()<0.5?1:-1, q=P(rd,j,t,sd*(cw+pw*0.8)); if(!okAt(q.x,q.z,rd)) continue; const tb=bufOf(tileOf(q.x,q.z),PROP), y=U+PH;
        cylB(tb,q.x,y+0.5,q.z,0.04,1.0,null,grey,6); cylB(tb,q.x+q.nx*sd*0.24,y+0.75,q.z+q.nz*sd*0.24,0.22,0.55,null,r()<0.5?green:C(0x6a7074),10);      // a litter bin on its post
        addOb(q.x,q.z,0.3);}
      if(main) for(let t=20+r()*60;t<l-6;t+=130+r()*60){const sd=r()<0.5?1:-1, q=P(rd,j,t,sd*(cw+pw*0.72)); if(!okAt(q.x,q.z,rd)) continue; const tb=bufOf(tileOf(q.x,q.z),PROP), y=U+PH, ryB=Math.atan2(q.ux,q.uz)+R/2, fx=q.nx*sd, fz=q.nz*sd;
        for(let k=0;k<3;k++) boxB(tb,q.x-fx*(0.12-k*0.14),y+0.45,q.z-fz*(0.12-k*0.14),1.7,0.04,0.12,ryB,wood);      // a bench, its back to the gardens
        for(let k=0;k<2;k++) boxB(tb,q.x+fx*0.24,y+0.62+k*0.14,q.z+fz*0.24,1.7,0.1,0.03,ryB,wood);
        [-0.7,0.7].forEach(function(s2){boxB(tb,q.x+q.ux*s2,y+0.22,q.z+q.uz*s2,0.05,0.44,0.5,ryB,dark);}); addOb(q.x,q.z,0.6);}
      if(main) for(let t=30+r()*80;t<l-10;t+=260+r()*80){const sd=(j%2)?1:-1, q=P(rd,j,t,sd*(cw+pw*0.62)); if(!okAt(q.x,q.z,rd)||inBuilding(q.x-q.nx*sd*1.2,q.z-q.nz*sd*1.2,0.5)) continue;      // a bus shelter
        const tb=bufOf(tileOf(q.x,q.z),PROP), y=U+PH, ryS=Math.atan2(q.ux,q.uz)+R/2, bx=q.x+q.nx*sd*0.7, bz=q.z+q.nz*sd*0.7, glass=C(0x6f8792);
        boxB(tb,q.x+q.nx*sd*0.15,y+2.45,q.z+q.nz*sd*0.15,3.8,0.1,1.7,ryS,C(0xe8e8e4)); boxB(tb,bx,y+1.3,bz,3.7,2.1,0.05,ryS,glass);
        [-1.85,1.85].forEach(function(s2){boxB(tb,bx+q.ux*s2,y+1.2,bz+q.uz*s2,0.08,2.4,0.08,ryS,grey); boxB(tb,q.x+q.ux*s2-q.nx*sd*0.6,y+1.2,q.z+q.uz*s2-q.nz*sd*0.6,0.08,2.4,0.08,ryS,grey);});
        boxB(tb,bx+q.ux*1.86-q.nx*sd*0.6,y+1.25,bz+q.uz*1.86-q.nz*sd*0.6,0.06,1.8,1.1,ryS,C(0x2b6cb0));      // the advert at its end
        for(let k=0;k<2;k++) boxB(tb,bx-q.nx*sd*(0.25+k*0.14),y+0.46,bz-q.nz*sd*(0.25+k*0.14),2.6,0.04,0.12,ryS,C(0x9aa0a2));
        const sg=det.sign([['bus',0.42]],{h:2.7}); signs2.bake(sg,q.x-q.nx*sd*0.3+q.ux*2.6,y,q.z-q.nz*sd*0.3+q.uz*2.6,Math.atan2(-q.nx*sd,-q.nz*sd));
        addOb(bx,bz,1.0); stops.push({x:q.x,z:q.z,h:Math.atan2(-q.nx*sd,-q.nz*sd),rd:rd});}}});
  /* junctions: lights where a main street crosses, bollards on their corners, a stop sign where a side street meets a main one, the cages for bottles */
  cross.forEach(function(c){if(c.car.length<2||kept(c.x,c.z)||nearHome(c.x,c.z)) return; const mains=c.car.filter(function(x){return x.k===1||x.k===6||x.k===7;}), lights=mains.length>=1&&c.car.length>=2&&(mains.length>=2||c.car.length>=3||r()<0.5);
    const wo=Math.max.apply(null,c.car.map(function(x){return x.w[0]/2+x.w[1];})), sig=lights?{x:c.x,z:c.z,grp:new Map(),wo:wo}:null; if(sig) SIG.set(key([c.x,c.z]),sig);
    c.car.forEach(function(rd){const j=rd.p.findIndex(function(q){return key(q)===key([c.x,c.z]);}); if(j<0) return; const main=rd.k===1||rd.k===6||rd.k===7, grp=mains.length&&mains.length<c.car.length?(main?0:1):(rd===c.car[0]?0:1);
      if(sig) sig.grp.set(rd,grp);
      [j-1,j+1].forEach(function(o){if(o<0||o>=rd.p.length) return; const q=rd.p[o], dx=q[0]-c.x, dz=q[1]-c.z, l=hyp(dx,dz); if(l<9) return; const ux=dx/l, uz=dz/l, rx=uz, rz=-ux;      // r: the right of traffic coming in
        const at=wo+1.2, px=c.x+ux*at+rx*(rd.w[0]/2+0.45), pz=c.z+uz*at+rz*(rd.w[0]/2+0.45); if(inBuilding(px,pz,0.3)) return; const tb=bufOf(tileOf(px,pz),PROP), y=U+PH;
        if(sig){cylB(tb,px,y+1.75,pz,0.07,3.5,null,grey,8); const hy=y+3.0, hx=px-rx*0.0, hz=pz-rz*0.0, ryH=Math.atan2(ux,uz);
          boxB(tb,hx,hy,hz,0.34,1.0,0.26,ryH,dark); ['r','a','g'].forEach(function(cc,k){boxB(bufOf(tileOf(px,pz),sigLamps[grp][k]),hx+ux*0.14,hy+0.3-k*0.3,hz+uz*0.14,0.22,0.22,0.04,ryH,C(0xffffff)); boxB(tb,hx+ux*0.2,hy+0.42-k*0.3,hz+uz*0.2,0.26,0.03,0.14,ryH,dark);});      // three lamps under their visors
          addOb(px,pz,0.25);}
        else if(!main&&mains.length){const sg=det.sign([['stop',0.6]],{h:2.4}); signs2.bake(sg,px,y,pz,Math.atan2(ux,uz)); addOb(px,pz,0.2);}
        else if(main&&r()<0.4){const sg=det.sign([['nostop',0.55]],{h:2.5}); signs2.bake(sg,px+ux*5,y,pz+uz*5,Math.atan2(ux,uz)); addOb(px+ux*5,pz+uz*5,0.2);}
        if(sig) for(let k=0;k<3;k++){const bx=c.x+ux*(at-0.4-k*0.9)+rx*(rd.w[0]/2+0.3), bz=c.z+uz*(at-0.4-k*0.9)+rz*(rd.w[0]/2+0.3); if(inBuilding(bx,bz,0.2)) continue;      // bollards along the corner
          cylB(tb,bx,y+0.4,bz,0.06,0.8,null,dark,8); cylB(tb,bx,y+0.62,bz,0.065,0.1,null,C(0xf2f2ee),8);}});});
    if(r()<0.3){const rd=c.car[0], j=rd.p.findIndex(function(q){return key(q)===key([c.x,c.z]);}), q=rd.p[j+1]||rd.p[j-1]; if(!q) return;      // the orange cage for bottles
      const dx=q[0]-c.x, dz=q[1]-c.z, l=hyp(dx,dz)||1, ux=dx/l, uz=dz/l, at=wo+4.5, px=c.x+ux*at-uz*(rd.w[0]/2+rd.w[1]*0.7), pz=c.z+uz*at+ux*(rd.w[0]/2+rd.w[1]*0.7); if(inBuilding(px,pz,0.8)||kept(px,pz)) return;
      const tb=bufOf(tileOf(px,pz),PROP), fb=bufOf(tileOf(px,pz),FENCE), y=U+PH, orange=C(0xe8701e), ryC=Math.atan2(ux,uz);
      [[-0.55,-0.45],[0.55,-0.45],[-0.55,0.45],[0.55,0.45]].forEach(function(o){boxB(tb,px+ux*o[0]-uz*o[1],y+0.8,pz+uz*o[0]+ux*o[1],0.05,1.6,0.05,ryC,orange);});
      boxB(tb,px,y+1.62,pz,1.15,0.05,0.95,ryC,orange); boxB(tb,px,y+0.05,pz,1.15,0.1,0.95,ryC,orange); boxB(tb,px+ux*0.0-uz*0.48,y+1.2,pz+uz*0.0+ux*0.48,0.5,0.3,0.02,ryC,C(0xf2f2ee));
      [[-0.55,0,0],[0.55,0,0]].forEach(function(o){const a2=[px+ux*o[0]-uz*0.45,pz+uz*o[0]+ux*0.45], b2=[px+ux*o[0]+uz*0.45,pz+uz*o[0]-ux*0.45]; wallQ(fb,a2,b2,y+0.1,y+1.6,0,1,0,1.6,orange); wallQ(fb,b2,a2,y+0.1,y+1.6,0,1,0,1.6,orange);});
      [[-0.45],[0.45]].forEach(function(o){const a2=[px-ux*0.55-uz*o[0],pz-uz*0.55+ux*o[0]], b2=[px+ux*0.55-uz*o[0],pz+uz*0.55+ux*o[0]]; wallQ(fb,a2,b2,y+0.1,y+1.6,0,1.2,0,1.6,orange); wallQ(fb,b2,a2,y+0.1,y+1.6,0,1.2,0,1.6,orange);});
      for(let k=0;k<14;k++) cylB(tb,px+(r()-0.5)*0.8*ux-(r()-0.5)*0.7*uz,y+0.25+r()*0.9,pz+(r()-0.5)*0.8*uz+(r()-0.5)*0.7*ux,0.05,0.28,0,[C(0x3f7a3a),C(0xd8e8e0),C(0x8a4a2a)][k%3],6);      // the bottles in it
      addOb(px,pz,0.75);}
  });
})();
signs2.done('street');
/* the lights' cycle: the main street green, amber, red; then the side street */
const CYC=26;
function sigState(g,t){const u=((t||A.t)%CYC+CYC)%CYC; if(g===0) return u<11?'g':u<13?'a':'r'; return u<13?'r':u<24?'g':'a';}
let sigWas='';
A.frameFns.push(function(){const s0=sigState(0), s1=sigState(1), k=s0+s1; if(k===sigWas) return; sigWas=k;
  [s0,s1].forEach(function(st,g){['r','a','g'].forEach(function(cc,i){const m=sigLamps[g][i]; m.emissive.setHex(st===cc?(cc==='r'?0xff2a1a:cc==='a'?0xffa21a:0x2aff6a):0x000000);});}); A.touch(1);});

/* parked cars: a plain body in the car's colour and its glass, wheels and lamps, both instanced; the ones near you are swapped for the
   finely built car (drive.js), which you can get into */
const CARC=[0xe9e9e6,0x2f4f7a,0xb5372f,0x7a7f84,0xf2f2ee,0x1d1f21,0xb9bcbe,0xd8c9a6,0x8a1f2a,0x3a4a5a,0x2e5e4e,0xc9b27a,0x6b7f9a,0xdddddd,0x101214];
function carGeos(){      // boxes, a few hundred triangles: a thousand of them parked down every street
  const paint=[], dark=[], B=function(w,h,d,x,y,z,taper){const g=new THREE.BoxGeometry(w,h,d); if(taper){const P=g.attributes.position; for(let i=0;i<P.count;i++) if(P.getY(i)>0){P.setX(i,P.getX(i)*taper[0]+taper[1]); P.setZ(i,P.getZ(i)*taper[2]);}} g.translate(x,y,z); return g;};
  paint.push(B(4.2,0.5,1.74,0,0.62,0,[0.98,0,0.97]), B(4.16,0.16,1.7,0,0.3,0), B(1.9,0.07,1.38,-0.25,1.43,0));       // the body, its sill, the roof
  dark.push([B(2.4,0.56,1.56,-0.2,1.13,0,[0.76,-0.08,0.9]),0x26303a]);                                         // the glass all round
  [[1.32,0.78],[-1.32,0.78],[1.32,-0.78],[-1.32,-0.78]].forEach(function(q){const w=new THREE.CylinderGeometry(0.32,0.32,0.2,8); w.rotateX(R/2); w.translate(q[0],0.32,q[1]); dark.push([w,0x141516]);});
  [-0.6,0.6].forEach(function(z){dark.push([B(0.04,0.12,0.32,2.1,0.74,z),0xeef0f0]); dark.push([B(0.04,0.13,0.3,-2.1,0.8,z),0xb0262a]);});
  dark.push([B(0.16,0.2,1.76,2.06,0.34,0),0x1f2022],[B(0.16,0.2,1.76,-2.06,0.36,0),0x1f2022],[B(0.02,0.11,0.52,2.15,0.46,0),0xf2c81e],[B(0.02,0.11,0.52,-2.15,0.6,0),0xf2c81e]);
  dark.forEach(function(d){const c=C(d[1]), n=d[0].attributes.position.count, a=new Float32Array(n*3); for(let i=0;i<n;i++){a[i*3]=c.r; a[i*3+1]=c.g; a[i*3+2]=c.b;} d[0].setAttribute('color',new THREE.BufferAttribute(a,3));});
  paint.forEach(function(g){g.setAttribute('color',new THREE.BufferAttribute(new Float32Array(g.attributes.position.count*3).fill(1),3));});
  return [merge(paint),merge(dark.map(function(d){return d[0];}))];
}
const CARG=carGeos(), paintM=A.reg(new THREE.MeshLambertMaterial({vertexColors:true}),'town'), darkM=A.reg(new THREE.MeshLambertMaterial({vertexColors:true}),'town');
const parked=[];
carSpots.forEach(function(q,i){const t=tileOf(q[0],q[1]), r=A.rng(i*13+5); const c={i:parked.length,x:q[0],z:q[1],h:q[2],col:CARC[Math.floor(r()*CARC.length)],kind:['hatch','sedan','hatch','suv','mini','sedan','van'][Math.floor(r()*7)],t:t,slot:t.cars.length,hidden:false}; t.cars.push(c); parked.push(c);});
tiles.forEach(function(t){if(!t||!t.cars.length) return; const cs=t.cars;
  t.paint=instanced(CARG[0],paintM,cs,function(c){v3.set(c.x,U,c.z); qt.setFromAxisAngle(yax,c.h-R/2); s3.set(c.kind==='mini'?0.86:c.kind==='suv'||c.kind==='van'?1.08:1,c.kind==='suv'||c.kind==='van'?1.12:1,1); return C(c.col);},t);
  t.dark=instanced(CARG[1],darkM,cs,function(c){v3.set(c.x,U,c.z); qt.setFromAxisAngle(yax,c.h-R/2); s3.set(c.kind==='mini'?0.86:c.kind==='suv'||c.kind==='van'?1.08:1,c.kind==='suv'||c.kind==='van'?1.12:1,1);},t);
  t.paint.castShadow=t.dark.castShadow=false;});
function showParked(c,on){const t=c.t; c.hidden=!on; [t.paint,t.dark].forEach(function(im){if(!im) return; if(on){v3.set(c.x,U,c.z); qt.setFromAxisAngle(yax,c.h-R/2); s3.set(c.kind==='mini'?0.86:c.kind==='suv'||c.kind==='van'?1.08:1,c.kind==='suv'||c.kind==='van'?1.12:1,1);} else{v3.set(c.x,-50,c.z); s3.set(0.001,0.001,0.001); qt.identity();}
  im.setMatrixAt(c.slot,m4.compose(v3,qt,s3)); im.instanceMatrix.needsUpdate=true;});}

/* scooters and motorbikes on the pavements, where everybody leaves them: by the kerb, a few together, at an angle */
const motoSpots=[];
(function(){const r=A.rng(404);
  roads.forEach(function(rd){if(!rd.w[0]||rd.k===3||rd.w[1]<2) return; const cw=rd.w[0]/2;
    for(let j=1;j<rd.p.length;j++){const a=rd.p[j-1], b=rd.p[j], l=hyp(b[0]-a[0],b[1]-a[1]); if(l<6) continue; const ux=(b[0]-a[0])/l, uz=(b[1]-a[1])/l;
      for(let t=3+r()*20;t<l-3;t+=(rd.k===1?16:28)+r()*20){if(r()<0.35) continue; const sd=r()<0.5?1:-1, n0=1+Math.floor(r()*3);
        for(let k=0;k<n0;k++){const tt=t+k*0.85, o=sd*(cw+0.75), x=a[0]+ux*tt-uz*o, z=a[1]+uz*tt+ux*o; if(kept(x,z)||nearHome(x,z)||inBuilding(x,z,0.6)||nearJunction(x,z,rd,3)||obAt(x,z,0.45)) continue;
          motoSpots.push({x:x,z:z,h:Math.atan2(ux,uz)+(sd>0?-1:1)*(R/2-0.55),col:[0xe9e9e6,0x1d1f21,0xb5372f,0x2f4f7a,0x8fd3c0,0xd8c9a6,0x6b7f9a,0xe8c91a][Math.floor(r()*8)],box:r()<0.25}); addOb(x,z,0.5);}}}});
})();
function motoGeos(){const paint=[], dark=[], B=function(w,h,d,x,y,z){const g=new THREE.BoxGeometry(w,h,d); g.translate(x,y,z); return g;};
  paint.push(B(1.15,0.26,0.4,0,0.42,0), B(0.8,0.3,0.38,-0.32,0.66,0), B(0.14,0.7,0.42,0.48,0.78,0));      // the floorboard, the body under the seat, the leg shield
  dark.push([B(0.68,0.1,0.32,-0.3,0.86,0),0x1b1c1e],[B(0.06,0.42,0.06,0.52,1.08,0),0x2a2c2e],[B(0.06,0.06,0.66,0.52,1.3,0),0x2a2c2e],[B(0.05,0.12,0.16,0.6,1.06,0),0xf0f2f2]);      // seat, stem, handlebars, the lamp
  [0.55,-0.55].forEach(function(x){const w=new THREE.CylinderGeometry(0.22,0.22,0.1,10); w.rotateX(R/2); w.translate(x,0.22,0); dark.push([w,0x141516]);});
  dark.forEach(function(d){const c=C(d[1]), n=d[0].attributes.position.count, a=new Float32Array(n*3); for(let i=0;i<n;i++){a[i*3]=c.r; a[i*3+1]=c.g; a[i*3+2]=c.b;} d[0].setAttribute('color',new THREE.BufferAttribute(a,3));});
  paint.forEach(function(g){g.setAttribute('color',new THREE.BufferAttribute(new Float32Array(g.attributes.position.count*3).fill(1),3));});
  const bx=B(0.42,0.4,0.42,-0.62,1.12,0); bx.setAttribute('color',new THREE.BufferAttribute(new Float32Array(bx.attributes.position.count*3).fill(1),3));
  return [merge(paint),merge(dark.map(function(d){return d[0];})),merge([bx])];}
const MOTOG=motoGeos();
motoSpots.forEach(function(m){(tileOf(m.x,m.z).motos||(tileOf(m.x,m.z).motos=[])).push(m);});
tiles.forEach(function(t){if(!t||!t.motos) return; const each=function(m){v3.set(m.x,U+PH,m.z); qt.setFromAxisAngle(yax,m.h-R/2); s3.set(1,1,1); return C(m.col);};
  const a=instanced(MOTOG[0],paintM,t.motos,each,t), b=instanced(MOTOG[1],darkM,t.motos,function(m){each(m);},t), bx=t.motos.filter(function(m){return m.box;}), c=bx.length?instanced(MOTOG[2],paintM,bx,function(m){each(m); return C([0x2a9ad8,0xd84a4a,0xf2f2ee][Math.floor(m.x*7)%3]);},t):null;      // some with a delivery box
  [a,b,c].forEach(function(im){if(im) im.castShadow=false;});});

/* ---------- each quarter's meshes ---------- */
tiles.forEach(function(t){if(!t) return; root.add(t.g);
  t.bufs.forEach(function(b,m){if(!b.i.length) return; const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(b.n,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(b.u,2));
    if(m.vertexColors) g.setAttribute('color',new THREE.Float32BufferAttribute(b.c,3)); g.setIndex(b.i); g.computeBoundingSphere();
    const ms=new THREE.Mesh(g,m); ms.castShadow=m!==LAMPH; ms.receiveShadow=true; t.g.add(ms);}); t.bufs.clear();});

/* the pools of light the lamps throw on the street at night */
const poolM=new THREE.MeshBasicMaterial({map:det.tex(128,128,function(g){const gr=g.createRadialGradient(64,64,0,64,64,64); gr.addColorStop(0,'rgba(255,214,150,1)'); gr.addColorStop(0.35,'rgba(255,196,128,0.55)'); gr.addColorStop(0.7,'rgba(255,180,110,0.15)'); gr.addColorStop(1,'rgba(255,170,100,0)'); g.fillStyle=gr; g.fillRect(0,0,128,128);},false),
  transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:0,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-8});
const pools=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1).rotateX(-R/2),poolM,Math.max(1,lampSpots.length));
lampSpots.forEach(function(q,i){v3.set(q[0]+Math.sin(q[2])*1.5,U+PH+0.03,q[1]+Math.cos(q[2])*1.5); qt.identity(); s3.set(12,1,12); pools.setMatrixAt(i,m4.compose(v3,qt,s3));});
pools.frustumCulled=false; pools.renderOrder=2; pools.visible=false; pools.userData.nc=true; root.add(pools);
/* ---------- in the evening: windows and shops lit, a warm glow from the lamps ---------- */
const warm=new THREE.Color(1,0.84,0.58);
let eveWas=-1;
A.frameFns.push(function(){const e=1-A.get('day'); if(Math.abs(e-eveWas)<0.01) return; eveWas=e;
  lights.forEach(function(m){m.emissive.copy(warm).multiplyScalar(e*0.95);}); glassy.forEach(function(m){m.reflectivity=0.42*(1-e)+0.06; m.specular.setScalar(0.6*(1-e)+0.04);}); poolM.opacity=e*0.8; pools.visible=e>0.05; LAMPH.emissive.setRGB(1,0.86,0.6).multiplyScalar(e*1.2); A.set('L:town',e>0.5?0.32:0);});

/* all of it on the outside's own layer, as building.js does */
let layered=false;
A.frameFns.push(function(){if(layered||A.LAYER_OUT==null) return; layered=true; root.traverse(function(m){m.layers.set(A.LAYER_OUT);});});

/* =====================================================================
   Walking it: what is in the way, and a coarse map for finding the way round
   ===================================================================== */
function addOb(x,z,r){const k=Math.floor(x/OG)+','+Math.floor(z/OG), o=[x,z,r]; let l=OB.get(k); if(!l) OB.set(k,l=[]); l.push(o); return o;}
treeSpots.forEach(function(q){addOb(q[0],q[1],q[2]===1?0.35:0.25);}); lampSpots.forEach(function(q){addOb(q[0],q[1],0.2);});
parked.forEach(function(c){const ux=Math.sin(c.h), uz=Math.cos(c.h); c.ob=[-1.5,-0.5,0.5,1.5].map(function(s){return addOb(c.x+ux*s,c.z+uz*s,0.95);});});
function obAt(x,z,rad){const i0=Math.floor((x-3)/OG), i1=Math.floor((x+3)/OG), k0=Math.floor((z-3)/OG), k1=Math.floor((z+3)/OG);
  for(let i=i0;i<=i1;i++) for(let k=k0;k<=k1;k++){const l=OB.get(i+','+k); if(!l) continue; for(let n=0;n<l.length;n++){const o=l[n]; if(o.off) continue; if(hyp(o[0]-x,o[1]-z)<o[2]+rad) return true;}} return false;}
function inside(x,z){return x>TX0+2&&x<TX0+TS-2&&z>TZ0+2&&z<TZ0+TS-2;}
function free(x,z,rad){rad=rad==null?0.25:rad; return inside(x,z)&&!kept(x,z)&&!inBuilding(x,z,rad)&&!obAt(x,z,rad)&&!(A.town.dyn&&A.town.dyn(x,z,rad));}      // dyn: the cars that move (drive.js)
/* the coarse map: a metre a cell */
const CG=1, GN=Math.ceil(TS/CG), cells=new Uint8Array(GN*GN);
(function(){cells.fill(1);
  const fill=function(p){let z0=1e9,z1=-1e9; p.forEach(function(q){z0=Math.min(z0,q[1]); z1=Math.max(z1,q[1]);}); const j0=Math.max(0,Math.floor((z0-TZ0)/CG)), j1=Math.min(GN-1,Math.floor((z1-TZ0)/CG));
    for(let j=j0;j<=j1;j++){const z=TZ0+(j+0.5)*CG, xs=[]; for(let i=0,k=p.length-1;i<p.length;k=i++){const a=p[i], b=p[k]; if((a[1]>z)!==(b[1]>z)) xs.push(a[0]+(z-a[1])*(b[0]-a[0])/(b[1]-a[1]));}
      xs.sort(function(a,b){return a-b;}); for(let k=0;k+1<xs.length;k+=2){const i0=Math.max(0,Math.ceil((xs[k]-TX0)/CG-0.5)), i1=Math.min(GN-1,Math.floor((xs[k+1]-TX0)/CG-0.5)); for(let i=i0;i<=i1;i++) cells[j*GN+i]=0;}}};
  blds.forEach(function(b){fill(inset(b.p,-0.5));}); own.forEach(function(p){fill(inset(p,-0.5));});
  KEEP.forEach(function(k){fill([[k[0],k[2]],[k[1],k[2]],[k[1],k[3]],[k[0],k[3]]]);});
  OB.forEach(function(l){l.forEach(function(o){const rr=o[2]+0.35; for(let x=o[0]-rr;x<=o[0]+rr;x+=CG*0.5) for(let z=o[1]-rr;z<=o[1]+rr;z+=CG*0.5){if(hyp(x-o[0],z-o[1])>rr) continue; const c=cOf(x,z); if(c>=0) cells[c]=0;}});});
  for(let i=0;i<GN;i++){cells[i]=cells[(GN-1)*GN+i]=cells[i*GN]=cells[i*GN+GN-1]=0;}})();
/* what a metre costs on foot: the carriageway four times the pavement, a zebra crossing like the pavement; so people keep to the pavements and
   cross where they should */
const cost=new Uint8Array(GN*GN).fill(1);
(function(){roads.forEach(function(rd){if(!rd.w[0]) return; const hw=rd.w[0]/2;
    for(let j=1;j<rd.p.length;j++){const a=rd.p[j-1], b=rd.p[j], i0=Math.max(0,Math.floor((Math.min(a[0],b[0])-hw-TX0)/CG)), i1=Math.min(GN-1,Math.floor((Math.max(a[0],b[0])+hw-TX0)/CG)), j0=Math.max(0,Math.floor((Math.min(a[1],b[1])-hw-TZ0)/CG)), j1=Math.min(GN-1,Math.floor((Math.max(a[1],b[1])+hw-TZ0)/CG));
      for(let jj=j0;jj<=j1;jj++) for(let ii=i0;ii<=i1;ii++){if(segD(TX0+(ii+0.5)*CG,TZ0+(jj+0.5)*CG,a,b)<hw) cost[jj*GN+ii]=4;}}});
  zebras.forEach(function(z0){for(let s2=-z0[4]-0.5;s2<=z0[4]+0.5;s2+=0.5) for(let a2=-1.4;a2<=1.4;a2+=0.5){const x=z0[0]+z0[2]*a2-z0[3]*s2, z=z0[1]+z0[3]*a2+z0[2]*s2, c=cOf(x,z); if(c>=0) cost[c]=1;}});})();
function cOf(x,z){const i=Math.floor((x-TX0)/CG), j=Math.floor((z-TZ0)/CG); return (i<0||j<0||i>=GN||j>=GN)?-1:j*GN+i;}
function cxz(c){return [TX0+((c%GN)+0.5)*CG,TZ0+(Math.floor(c/GN)+0.5)*CG];}
function nearCell(x,z){const c=cOf(x,z); if(c>=0&&cells[c]) return c; const i0=Math.floor((x-TX0)/CG), j0=Math.floor((z-TZ0)/CG);
  for(let r=1;r<30;r++){let best=-1, bd=1e9; for(let j=j0-r;j<=j0+r;j++) for(let i=i0-r;i<=i0+r;i++){if(Math.max(Math.abs(i-i0),Math.abs(j-j0))!==r||i<0||j<0||i>=GN||j>=GN) continue; const k=j*GN+i; if(!cells[k]) continue; const q=cxz(k), d=hyp(q[0]-x,q[1]-z); if(d<bd){bd=d; best=k;}} if(best>=0) return best;}
  return -1;}
let gS=null, fromS=null, seenS=null, stamp=0;
function los(x0,z0,x1,z1,rad){const d=hyp(x1-x0,z1-z0), n=Math.ceil(d/0.35); for(let i=1;i<n;i++){const t=i/n; if(!free(x0+(x1-x0)*t,z0+(z1-z0)*t,rad)) return false;} return true;}
/* car: by road, the cost of the carriageway left out */
function path(x0,z0,x1,z1,car){
  const s=nearCell(x0,z0), t=nearCell(x1,z1); if(s<0||t<0) return [];
  if(!gS){gS=new Float32Array(GN*GN); fromS=new Int32Array(GN*GN); seenS=new Uint32Array(GN*GN);}
  stamp++; const heap=[], push=function(f,c){heap.push(f,c); let i=heap.length/2-1; while(i>0){const p=(i-1)>>1; if(heap[2*p]<=heap[2*i]) break; let tmp=heap[2*p]; heap[2*p]=heap[2*i]; heap[2*i]=tmp; tmp=heap[2*p+1]; heap[2*p+1]=heap[2*i+1]; heap[2*i+1]=tmp; i=p;}};
  const pop=function(){const c=heap[1], lf=heap[heap.length-2], lc=heap[heap.length-1]; heap.length-=2; if(heap.length){heap[0]=lf; heap[1]=lc; let i=0; const n=heap.length/2; for(;;){const l=2*i+1, r=l+1; let m=i; if(l<n&&heap[2*l]<heap[2*m]) m=l; if(r<n&&heap[2*r]<heap[2*m]) m=r; if(m===i) break; let tmp=heap[2*m]; heap[2*m]=heap[2*i]; heap[2*i]=tmp; tmp=heap[2*m+1]; heap[2*m+1]=heap[2*i+1]; heap[2*i+1]=tmp; i=m;}} return c;};
  const ti=t%GN, tj=(t-ti)/GN, hh=function(c){const i=c%GN, j=(c-i)/GN, dx=Math.abs(i-ti), dz=Math.abs(j-tj); return (dx+dz)+(Math.SQRT2-2)*Math.min(dx,dz);};
  const G=function(c){return seenS[c]===stamp?gS[c]:1e9;};
  seenS[s]=stamp; gS[s]=0; fromS[s]=-1; push(hh(s),s); let found=false, n=0;
  while(heap.length&&n<900000){const c=pop(); n++; if(c===t){found=true; break;} const gc=gS[c], i=c%GN, j=(c-i)/GN;
    for(let dj=-1;dj<=1;dj++) for(let di=-1;di<=1;di++){if(!di&&!dj) continue; const ni=i+di, nj=j+dj; if(ni<0||nj<0||ni>=GN||nj>=GN) continue; const k=nj*GN+ni; if(!cells[k]) continue;
      if(di&&dj&&(!cells[c+di]||!cells[c+dj*GN])) continue; const ng=gc+(di&&dj?Math.SQRT2:1)*(car?1:cost[k]); if(ng<G(k)){seenS[k]=stamp; gS[k]=ng; fromS[k]=c; push(ng+hh(k),k);}}}
  if(!found) return [];
  const cs=[]; for(let c=t;c>=0&&cs.length<100000;c=c===s?-1:fromS[c]) cs.push(c); cs.reverse();
  const pts=[[x0,z0]].concat(cs.slice(1,-1).map(cxz)); const end=free(x1,z1)?[x1,z1]:cxz(t); pts.push(end);
  const onRoad2=function(x,z){const c=cOf(x,z); return c>=0&&cost[c]>1;}, keeps=function(a,b){if(car||onRoad2(a[0],a[1])||onRoad2(b[0],b[1])) return true; const d=hyp(b[0]-a[0],b[1]-a[1]), n=Math.ceil(d/0.5); for(let k=1;k<n;k++){if(onRoad2(a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n)) return false;} return true;};      // a short cut may not run across a road
  const out=[pts[0]]; let i=0; while(i<pts.length-1){let j=Math.min(pts.length-1,i+60); while(j>i+1&&!(los(pts[i][0],pts[i][1],pts[j][0],pts[j][1],0.3)&&keeps(pts[i],pts[j]))) j--; out.push(pts[j]); i=j;}
  return out.slice(1);
}
/* a road to walk or drive along: the network, both ways, joined where the streets meet */
const net=roads.filter(function(r){return r.w[0]>0;});
/* how high the ground is: on a pavement, a kerb's height over the road */
function groundY(x,z){const q=roadNear(x,z); return q&&q.r.w[0]>0&&q.d>0.12&&q.d<q.r.w[1]&&!kept(x,z)&&!nearHome(x,z)?U+PH:U;}
A.town={signals:SIG,sigState:sigState,stops:stops,gates:gates,cafes:cafes,free:free,path:path,y:groundY,inside:inside,kept:kept,roads:roads,net:net,cross:cross,nodes:nodes,key:key,roadNear:roadNear,parked:parked,showParked:showParked,
  inBuilding:inBuilding,obstacles:{at:obAt,add:addOb,grid:OB,G:OG},blds:blds,outlines:blds.concat(own.map(function(p){let cx=0,cz=0; p.forEach(function(q){cx+=q[0]; cz+=q[1];}); return {p:p,c:[cx/p.length,cz/p.length]};})),extent:[TX0,TZ0,TS],canvas:gcan,cp:cp,root:root,U:U,nearest:function(x,z){const c=nearCell(x,z); return c<0?null:cxz(c);},
  near:function(x,z,rad){return !kept(x,z)&&inside(x,z);}};

/* =====================================================================
   The map: a little round one in the corner while you are out, the whole of it on M
   ===================================================================== */
const MN=1024, mcan=document.createElement('canvas'); mcan.width=mcan.height=MN;
(function(){const g=mcan.getContext('2d'), k=MN/TS, mp=function(x,z){return [(z-TZ0)*k,(TX0+TS-x)*k];};
  g.fillStyle='#dcd6c4'; g.fillRect(0,0,MN,MN);
  TD.G.forEach(function(a){const p=outline(a[2],true); g.fillStyle=a[0]==='playground'?'#d7c08f':'#a9c08a'; g.beginPath(); p.forEach(function(q,i){const c=mp(q[0],q[1]); if(i) g.lineTo(c[0],c[1]); else g.moveTo(c[0],c[1]);}); g.closePath(); g.fill();});
  g.fillStyle='#b9b2a3'; blds.concat(own.map(function(p){return {p:p};})).forEach(function(b){g.beginPath(); b.p.forEach(function(q,i){const c=mp(q[0],q[1]); if(i) g.lineTo(c[0],c[1]); else g.moveTo(c[0],c[1]);}); g.closePath(); g.fill();});
  g.fillStyle='#e9a23b'; (BD.foot||[]).forEach(function(r){const a=mp(r[1],r[2]), b=mp(r[0],r[3]); g.fillRect(Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.abs(b[0]-a[0])+0.5,Math.abs(b[1]-a[1])+0.5);});      // home, as the plan has it
  g.lineCap=g.lineJoin='round';
  roads.forEach(function(s){g.strokeStyle=s.w[0]?(s.k===1||s.k===6||s.k===7?'#f7d774':'#ffffff'):'#ece6d6'; g.lineWidth=Math.max(1.5,(s.w[0]||s.w[1])*k*1.2); g.beginPath(); s.p.forEach(function(q,i){const c=mp(q[0],q[1]); if(i) g.lineTo(c[0],c[1]); else g.moveTo(c[0],c[1]);}); g.stroke();});
  const named={}; roads.forEach(function(s){if(!s.name||!s.w[0]) return; let best=null; for(let j=1;j<s.p.length;j++){const a=s.p[j-1], b=s.p[j], l=hyp(b[0]-a[0],b[1]-a[1]); if(!best||l>best.l) best={l:l,a:a,b:b};} if(!best||best.l<30) return; if(named[s.name]&&named[s.name]>best.l) return; named[s.name]=best.l; s.lab=best;});
  g.font='bold 13px sans-serif'; g.textAlign='center'; g.textBaseline='middle';
  roads.forEach(function(s){if(!s.lab||named[s.name]!==s.lab.l) return; const a=mp(s.lab.a[0],s.lab.a[1]), b=mp(s.lab.b[0],s.lab.b[1]); let an=Math.atan2(b[1]-a[1],b[0]-a[0]); if(an>R/2) an-=R; if(an<-R/2) an+=R;
    g.save(); g.translate((a[0]+b[0])/2,(a[1]+b[1])/2); g.rotate(an); g.lineWidth=3; g.strokeStyle='rgba(255,255,255,0.9)'; g.strokeText(s.name,0,0); g.fillStyle='#3a3f44'; g.fillText(s.name,0,0); g.restore();});
})();
const mini=document.createElement('canvas'); mini.width=mini.height=170; mini.id='miniMap';
mini.style.cssText='position:absolute;right:12px;top:58px;width:150px;height:150px;border-radius:50%;border:3px solid rgba(255,255,255,.9);box-shadow:0 3px 12px rgba(0,0,0,.3);z-index:3;display:none;cursor:pointer;background:#dcd6c4';
A.stage.appendChild(mini);
const big=document.createElement('div'); big.id='bigMap';
big.style.cssText='position:absolute;inset:0;z-index:7;display:none;align-items:center;justify-content:center;background:rgba(20,24,22,.55)';
const bc=document.createElement('canvas'); bc.width=bc.height=900; bc.style.cssText='max-width:94%;max-height:94%;border-radius:14px;box-shadow:0 8px 30px rgba(0,0,0,.4);cursor:crosshair;background:#dcd6c4'; big.appendChild(bc);
const bigNote=document.createElement('div'); bigNote.style.cssText='position:absolute;bottom:18px;left:50%;transform:translateX(-50%);color:#fff;font:600 13px/1.3 inherit;background:rgba(0,0,0,.5);padding:6px 12px;border-radius:99px;pointer-events:none'; bigNote.textContent='Tap anywhere to go there. M or Esc closes the map'; big.appendChild(bigNote);
A.stage.appendChild(big);
let bigView=null;
function drawBig(){const g=bc.getContext('2d'), p=A.player; const span=700, cx=p?p.z:ZC, cxx=p?p.x:XF, k=MN/TS, sx=(cx-TZ0)*k-span*k/2, sy=(TX0+TS-cxx)*k-span*k/2;
  bigView={sx:sx,sy:sy,s:span*k}; g.drawImage(mcan,sx,sy,span*k,span*k,0,0,900,900);
  const toC=function(x,z){return [((z-TZ0)*k-sx)/(span*k)*900,((TX0+TS-x)*k-sy)/(span*k)*900];};
  if(A.drive&&A.drive.mapDots) A.drive.mapDots(function(x,z,col){const c=toC(x,z); g.fillStyle=col; g.fillRect(c[0]-3,c[1]-3,6,6);});
  if(p){const c=toC(p.x,p.z); g.save(); g.translate(c[0],c[1]); g.rotate(R/2-(A.drive&&A.drive.on()?A.drive.heading():p.h)); g.fillStyle='#e0473c'; g.strokeStyle='#fff'; g.lineWidth=2; g.beginPath(); g.moveTo(0,-11); g.lineTo(8,9); g.lineTo(0,4); g.lineTo(-8,9); g.closePath(); g.fill(); g.stroke(); g.restore();}}
function openBig(on){big.style.display=on?'flex':'none'; if(on) drawBig();}
bc.addEventListener('click',function(e){if(!bigView) return; const r=bc.getBoundingClientRect(), u=(e.clientX-r.left)/r.width, v=(e.clientY-r.top)/r.height, k=MN/TS;
  const z=TZ0+(bigView.sx+u*bigView.s)/k, x=TX0+TS-(bigView.sy+v*bigView.s)/k; openBig(false);
  if(A.drive&&A.drive.on()){A.drive.gps(x,z); return;} if(A.walkTo) A.walkTo(x,z);});
big.addEventListener('click',function(e){if(e.target===big) openBig(false);});
mini.addEventListener('click',function(){openBig(true);});
window.addEventListener('keydown',function(e){if(!A.simsOn||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return; const k=e.key.toLowerCase(); if(k==='m'){openBig(big.style.display!=='flex');} else if(k==='escape'&&big.style.display==='flex') openBig(false);});
let mt=0;
A.frameFns.push(function(dt){
  const p=A.player, on=A.simsOn&&p&&!p.lvl; mini.style.display=on?'block':'none'; if(!on){if(big.style.display==='flex') openBig(false); return;}
  mt+=dt; if(mt<0.06) return; mt=0;
  const g=mini.getContext('2d'), k=MN/TS, span=150, drv=A.drive&&A.drive.on(), x=drv?A.drive.pos().x:p.x, z=drv?A.drive.pos().z:p.z, h=drv?A.drive.heading():p.h;
  const cam=A.camera, yaw=Math.atan2(A.controls.target.x-cam.position.x,A.controls.target.z-cam.position.z);
  g.save(); g.clearRect(0,0,170,170); g.beginPath(); g.arc(85,85,85,0,7); g.clip(); g.fillStyle='#dcd6c4'; g.fillRect(0,0,170,170);
  g.translate(85,85); g.rotate(yaw-R/2); const cx=(z-TZ0)*k, cy=(TX0+TS-x)*k, s=170/(span*k); g.scale(s,s); g.drawImage(mcan,-cx,-cy);
  if(A.drive&&A.drive.mapDots) A.drive.mapDots(function(ox,oz,col){g.fillStyle=col; g.fillRect((oz-TZ0)*k-cx-2.5/s,(TX0+TS-ox)*k-cy-2.5/s,5/s,5/s);});
  g.restore();
  g.save(); g.translate(85,85); g.rotate(-(h-yaw)); g.fillStyle='#e0473c'; g.strokeStyle='#fff'; g.lineWidth=2; g.beginPath(); g.moveTo(0,-10); g.lineTo(7,8); g.lineTo(0,4); g.lineTo(-7,8); g.closePath(); g.fill(); g.stroke(); g.restore();
  const na=yaw-R; g.fillStyle='#fff'; g.strokeStyle='rgba(0,0,0,0.5)'; g.lineWidth=3; g.font='bold 12px sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.strokeText('N',85+Math.cos(na)*70,85+Math.sin(na)*70); g.fillText('N',85+Math.cos(na)*70,85+Math.sin(na)*70);
});
A.townMap={open:openBig,draw:drawBig};
/* out in the streets the camera sees to the end of the neighbourhood */
A.farOut=function(){const p=A.player; if(!A.simsOn||!p||p.lvl) return 0; const r=A.rooms[p.room]; return r&&r.ext?650:0;};
})();
