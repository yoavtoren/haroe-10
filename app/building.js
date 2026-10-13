/* Haroe 10 — the building and the blocks round it, as they stand: Building view.
   Laid out from the satellite view and OpenStreetMap. Every outline below is a real building or street, in metres, in a frame of
   our own front (which turns 4.6° north of east): u runs along the front from the corner of number 12's wing, west toward Mirkin St
   (negative) and east past number 12 (positive); v runs out from the front, north toward Haroe St, and back toward David St
   (negative). In the model that is z = ZC + u and x = XF + v, the same frame the street is drawn in.
   The flat and the lobby, from the tape and the photos, run 6.6 m longer along the front than the satellite leaves between number
   12's wing and Beit HaChayal. So everything south of Haroe St and west of our building stands 6.6 m farther west, and what lies
   along our front in between is spread to fit: Beit HaChayal keeps its real 3.9 m from our west wall.
   Our own building is drawn round the flat: the semi-basement, our floor and three above (the floors above repeat our windows),
   37 m along the front and 22 m deep. "Look inside" takes away the floors above and the outside of our own. */
(function(){
'use strict';
const A=window.APP, D=A.D, LB=A.LB, det=A.det, P=det.P, R=Math.PI, H=D.H, L=D.L, AZ=A.AZ, XF=LB.XF, ZC=LB.ZC, $=function(id){return document.getElementById(id);};
const GY=-2.9, U=0.17, FF=H+0.24, ROOF=4*FF;            // the yard, a floor down; the street; floor to floor; the top of our roof slab

/* ---------- OpenStreetMap, in the frame of our front: [id, storeys (0: not recorded), name, [u,v, u,v, ...]] ---------- */
const OSMB=[[823,0,"",[-101.2,112.2,-94.5,83.5,-76.4,85,-82.8,116.7]],
[761,0,"",[19.2,121.2,8.2,121.3,8.4,136.1,19.3,136]],
[766,0,"",[84.1,101.5,83.3,116.7,47.4,115,48.2,99.7]],
[798,5,"Beit HaChayal",[-43.8,-22.5,-43.4,26.7,-20.1,26.5,-20.4,0,-20.5,-22.7]],
[799,0,"",[123.8,-45.6,127,-34.6,148.2,-40.7,145,-51.8]],
[802,0,"",[93.5,6.4,115.7,0,111.7,-13.8,89.5,-7.4]],
[806,0,"",[85.6,-30,106.8,-36.1,101.8,-53.3,80.6,-47.2]],
[808,0,"",[8.9,71.3,9.8,87.7,21.7,87,20.8,70.7]],
[810,0,"",[-3.8,46.6,-20.9,47.5,-20.1,64.4,-2.9,63.5]],
[824,0,"",[43.2,63.4,42.4,49.1,27.4,49.9,28.2,64.2]],
[832,0,"",[61.3,84.4,59.4,48.1,47.2,48.8,49.1,85.1]],
[837,0,"",[149.7,-36.7,124.3,-29.4,127.9,-17,153.3,-24.3]],
[841,0,"",[90.7,89.5,103.3,89.4,102.9,52.4,90.3,52.6]],
[843,0,"",[107.4,-16,102.8,-31.6,84.7,-26.4,89.3,-10.7]],
[854,0,"",[81.7,-10.5,60,-4.3,64.6,11.7,86.3,5.5]],
[855,0,"",[-46.5,64.5,-47.4,47.6,-67.8,48.7,-66.8,65.6]],
[859,0,"",[24.9,50.1,7.9,51,8.6,64.8,25.6,63.9]],
[863,0,"",[138.1,-68,113.8,-61.1,117.4,-48.7,141.7,-55.7]],
[870,0,"",[111.2,90.8,125.1,90.5,124.2,50.2,110.3,50.5]],
[874,0,"",[-16.2,-81.2,-20.2,-95.1,-33.1,-91.4,-29.1,-77.5]],
[882,0,"",[71,-47.5,49.4,-41.3,53.5,-27.2,75,-33.4]],
[885,0,"",[32.9,-37.4,27.2,-57,12.2,-52.6,18,-33]],
[892,0,"",[19.3,-89.5,15.3,-103.1,-12.8,-95,-8.9,-81.4]],
[893,0,"",[-49.6,80.7,-72.6,82,-71.4,105,-48.4,103.7]],
[908,0,"",[97.9,-59.5,94.1,-72.6,75.3,-67.1,79.1,-54.1]],
[913,0,"8 David St",[-13.1,-42.5,-31.6,-40.2,-29.9,-26.9,-23.6,-27.6,-11.4,-29.1]],
[915,0,"",[55.2,-21.4,59.8,-5.6,79.8,-11.4,75.2,-27.2]],
[916,0,"9 Haroe St",[-27.7,46.8,-44,47.7,-43,65.8,-26.7,64.9]],
[917,0,"10 David St",[12.7,-32,6.5,-50.4,-9.3,-45.1,-3.1,-26.7]],
[928,0,"",[43.5,-58.7,47.8,-43.9,71.1,-50.7,66.8,-65.4]],
[929,0,"",[134.1,-87.6,112.2,-81.5,116.1,-67.9,138,-74]],
[930,0,"",[1.2,-62.5,-3.1,-77.1,-20.1,-72.2,-15.8,-57.6]],
[931,0,"",[27.7,87.5,42.3,86.7,41.5,71.5,26.9,72.2]],
[932,0,"",[20.1,-16.6,38.1,-21.8,34.4,-34.5,16.4,-29.3]],
[934,0,"",[19.4,-84,1.1,-78.8,5.2,-64.5,23.5,-69.8]],
[943,0,"",[85.3,81.7,84.4,51.1,69.6,51.5,70.5,82.1]],
[946,0,"",[67.2,-114.1,27.2,-102.6,36,-72.2,76,-83.8]],
[949,0,"",[-22.5,-56.7,-37,-53.3,-50.9,-58.4,-44.3,-70,-25.4,-71.8]],
[40,0,"",[87.8,32.8,80.7,11.2,65.8,16,71.6,33.3]],
[51,9,"",[-60.3,-1.2,-74.9,-0.9,-74.4,25.8,-59.8,25.5]],
[52,0,"",[122.7,31.3,116.2,6.4,106.1,9,112.6,34]],
[62,7,"",[-60.3,-26.6,-78.7,-26.3,-78.4,-5.2,-60.1,-5.4]],
[74,4,"",[-58.9,-30.6,-59.3,-43.7,-64.7,-43.5,-64.8,-46.5,-70.1,-46.4,-70.2,-50.3,-76,-50.1,-75.4,-30.1]],
[76,4,"",[-93.9,-35.2,-82.5,-35.2,-82.3,-57,-93.8,-57.1]],
[81,0,"",[-92.4,45.6,-92.4,64.6,-73.6,64.7,-73.5,45.6]],
[86,7,"",[-127.1,-44.2,-131,-34.2,-128.1,-31,-100.8,-30.9,-100,-40.5]],
[94,0,"",[-78.3,-72.3,-68.5,-89.7,-93.3,-103.6,-103.2,-86.2]],
[95,4,"",[-99.4,-46,-97.4,-58.4,-113.8,-61,-114.4,-57.2,-117,-57.6,-117.5,-55.1,-117.7,-53.7,-119.7,-54,-120.5,-49.4]],
[108,0,"",[-64,-103.4,-48.6,-78.5,-38.1,-84.9,-53.5,-109.8]],
[114,0,"",[-129.1,47.4,-128.8,63.7,-96.3,63.1,-96.6,46.8]],
[116,0,"",[106.8,31.6,100.5,9.4,87.7,13,93.6,32.1]],
[117,0,"",[-38.6,111.5,-29.7,74,-8.2,74.5,-7.7,102.8,-18.4,117.9]],
[118,3,"",[-32.9,148.7,-33.6,129.3,-29.1,121.6,-40.6,116.6,-47.4,129.2,-46.9,150.5]],
[124,0,"",[-58,-64.2,-71.9,-71.9,-62.1,-89.2,-54.6,-85,-57.4,-80.1,-51.1,-76.5]],
[43,9,"6 Moshe Sharet St",[5,116.1,43.2,116.5,43.6,94.9,5.4,95.1]],
[229,9,"",[-100.8,26.3,-89.9,25.9,-90.5,10.2,-101.4,10.6]],
[230,11,"",[-84.9,10,-85.3,0,-112.4,1.1,-113.1,-14.4,-102.8,-14.9,-103.3,-26,-134.9,-24.7,-134.5,-12.9,-125,-13.3,-124.4,1.4,-133.8,1.8,-133.4,11.9,-101.4,10.6,-90.5,10.2]],
[231,2,"",[-134.9,-24.7,-103.3,-26,-102.8,-14.9,-113.1,-14.4,-112.4,1.1,-85.3,0,-84.9,10,-84.5,20.6,-81.8,20.5,-81.6,25.6,-89.9,25.9,-100.8,26.3,-132.7,27.6,-133.4,11.9,-133.8,1.8,-134.5,-12.9]]];
const OSMR=[[2,"",[67.8,90.8,64.3,39.6]],
[2,"Moshe Sharet St",[-181.3,441.7,-141.6,446.8,-54.4,444.7,-4.7,449.3,69.1,463.6,71.7,464.1,102.7,454.6,106.5,453.4,131.7,445.7,162.8,427.7,178.1,410.3,183,365.6,175.8,332.9,166.1,294.4,163.9,285.9,136.6,233.9,120.2,202.8,103.6,185.9,73.8,170.4,56.8,161.6,48.2,160.3,6.8,154.1,-21.7,152.2,-27.3,144.5,-24.1,133.7,-20.3,129.9,3.4,106.2,3.5,91.7,2.6,53,-0.6,46.5,-1.1,38]],
[2,"Zion St",[-21.7,152.2,-62.5,160.2]],
[4,"",[-274,38.9,-259.1,52.7,-254.8,53.6,-248,55,-227.8,59.9,-219.8,61.4,-209.4,63.6,-176.1,72,-171,68.8,-163.9,45.2,-162.3,40,-161.2,35,-204.8,22.7,-227.2,16.9,-239.4,16.1,-262.2,11.6]],
[2,"Avtalyon St",[-65.8,113.8,-62.5,160.2,-61.8,183.6,-60.4,204.2]],
[3,"",[-51.7,111.9,-65.8,113.8]],
[5,"",[-62.5,160.2,-136.1,159.7,-175.9,159]],
[2,"HaParsa St",[73.8,170.4,72,173.5,60.3,192.6,45.2,212,37.3,217.3,25.3,219.6,15.1,222.2,6.6,214.5,3.2,206.6,6.7,174.9,6.8,154.1]],
[1,"Herzl St",[109.4,-293.1,107.4,-291.7,-10.7,-210.3,-21,-202.3,-61,-171,-79.2,-151.1,-121.2,-79.5,-135.4,-50.7,-159.2,29.7,-161.2,35]],
[2,"",[67.8,90.8,83.3,89.1]],
[2,"",[67.8,90.8,47.7,92.9]],
[5,"",[17.5,93.1,3.5,91.7]],
[5,"",[47.7,92.9,31.6,94,17.5,93.1]],
[2,"HaEshel St",[146.8,-211.5,86.7,-195.4,79.6,-188.8,75.8,-179.4,131.1,37.5]],
[2,"Natan St",[64.3,39.6,60.2,23.5,30.4,-65.6,-10.7,-210.3]],
[1,"Rambam St",[-161.2,35,-204.8,22.7,-227.2,16.9]],
[1,"Haroe St",[-161.2,35,-156.6,36.3,-154.1,36.9,-148.6,37.9,-126.2,39.9,-82.1,40.8,-51.8,41.1,2.9,39.9,64.3,39.6,131.1,37.5]],
[2,"Mirkin St",[-51.8,41.1,-53.2,-52.6]],
[5,"",[-59.8,-55.7,-44.5,-78.5,-36.2,-82.7,-36.2,-89.7,-40.5,-91.9,-42.8,-101.8,-46.5,-104,-48.1,-108.6,-52.6,-112.5,-56.1,-121.4,-57,-132.4,-59.4,-137.3,-79.2,-151.1]],
[2,"David St",[30.4,-65.6,-30.4,-48.8,-45.7,-49.1,-53.2,-52.6,-59.8,-55.7,-67.8,-59.5,-82.7,-67.8,-121.2,-79.5]],
[2,"Shilo St",[-114.6,-279.2,-144.2,-188.2,-176.7,-67.9,-177.1,-66.3,-177.8,-63.7]],
[2,"",[-135.4,-50.7,-177.8,-63.7,-198,-67.5,-231.9,-73.9,-237.9,-75]],
[4,"",[-234.3,-6.4,-213.7,-0.3,-208.6,-17.1,-194.1,-12.9,-204.8,22.7,-227.2,16.9,-237.8,12,-260.6,6.7,-254.5,-12.3]],
[3,"",[49.5,128.2,48.2,160.3]],
[1,"Herzl St",[-161.2,35,-162.3,40,-163.9,45.2,-171,68.8,-176.1,132.1,-175.9,159,-175.6,205.2,-176,211.8,-175.9,214.5,-174.7,329.5,-174.7,333.3,-176.9,384.4,-178.4,402.9,-179.1,412.3,-181.3,441.7]],
[1,"",[-148.6,37.9,-155,39,-158.6,41.3,-163.9,45.2]],
[1,"Haroe St",[131.1,37.5,210.4,36.8,215.8,36.7]]];

/* ---------- fitting the map to the flat ---------- */
/* OpenStreetMap has our west wall 16.5 m from number 12's wing, and Beit HaChayal 3.9 m past it. The roofs in the satellite view, and the
   flat itself, put our wall 23 m out and Beit HaChayal's face 26 to 27 m; Mirkin St is where the map has it. So, south of Haroe St, the map is
   stretched between number 12's wing and our wall, and squeezed between Beit HaChayal's face and Mirkin St: [map, model] */
const KN=[[0,0],[-16.5,AZ-0.2-ZC],[-20.4,AZ-0.2-ZC-3.9],[-43.8,-45.6],[-51.8,-52.4],[-62,-62]];
function warp(u,v){
  if(u>=0||u<=-62) return u; let i=1; while(u<KN[i][0]) i++;
  const a=KN[i-1], b=KN[i], s=a[1]+(b[1]-a[1])*(u-a[0])/(b[0]-a[0]), w=Math.max(0,Math.min(1,(38-v)/10)); return u+w*(s-u);}
function pt(u,v){return [XF+v,ZC+warp(u,v)];}             // a point of a street, in the model: [x, z]
function outline(q,each){                                // a building keeps its shape and moves as a whole; or, each, every corner on its own
  let cu=0, cv=0; const n=q.length/2; for(let i=0;i<n;i++){cu+=q[2*i]; cv+=q[2*i+1];} cu/=n; cv/=n;
  const du=warp(cu,cv)-cu, out=[]; for(let i=0;i<n;i++) out.push([XF+q[2*i+1],ZC+(each?warp(q[2*i],q[2*i+1]):q[2*i]+du)]); return out;}
const SF=A.street, D8=SF.D8, KZ=SF.KZ, RW=SF.RW, GZs=SF.GZ, SQ=SF.SQ, NXY=D.KX+4.9, LBH=-(warp(-20.4,0));      // the street's own measures; the yard's far side; Beit HaChayal's face, out from number 12's corner
const ST=OSMR.map(function(r){const p=[]; for(let i=0;i<r[2].length;i+=2) p.push(pt(r[2][i],r[2][i+1]-(r[1]==='Haroe St'?1.9:0))); return {k:r[0],name:r[1],p:p};});      // Haroe St: its middle where the street drawn round the square has it. Moshe Sharet St bends the last few metres to where that drawing leaves it a gap
const WID={1:[7.4,3.4],2:[6.2,2.6],3:[3.6,0.9],4:[0,6],5:[0,2.2]};      // carriageway, pavement each side
function nearRoad(x,z){let best=1e9, kind=0; ST.forEach(function(s){for(let i=1;i<s.p.length;i++){const a=s.p[i-1], b=s.p[i], dx=b[0]-a[0], dz=b[1]-a[1], l2=dx*dx+dz*dz||1, t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/l2)), d=Math.hypot(a[0]+t*dx-x,a[1]+t*dz-z)-WID[s.k][0]/2;
  if(d<best){best=d; kind=s.k;}}}); return {d:best,k:kind};}

const root=new THREE.Group(); root.userData.nc=true; A.scene.add(root);
const town=A.batch(root), shade=[];                       // everything else merged by colour; boxes the sun study tests its rays against
const leafB=det.leafM.clone(); leafB.userData={}; const crowns=A.batch(root,0,{map:function(k){return k===det.leafM?leafB:k;}});      // leaves, kept apart so they can be drawn on their own
const wallC='#efebe2', wallM=det.plasterM(wallC), wallHex=0xefebe2, RR=A.rng(10);      // our building's render: white, gone grey in streaks
function proxy(x0,x1,z0,z1,h){const m=new THREE.Mesh(new THREE.BoxGeometry(x1-x0,h-U,z1-z0),new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:false}));
  m.position.set((x0+x1)/2,(U+h)/2,(z0+z1)/2); m.castShadow=true; m.userData.nc=true; (A.outside||root).add(m); shade.push(m); return m;}

/* ---------- the ground: one drawing of the streets and pavements, at street level, open where the yard and the street round the square are ---------- */
const GS=370, GX0=XF-175, GZ0=ZC-200, N=2048, K=N/GS;
function cp(p){return [(p[1]-GZ0)*K,(GX0+GS-p[0])*K];}
const BLD=OSMB.map(function(b){const pts=outline(b[3],b[0]===798); let cx=0, cz=0; pts.forEach(function(p){cx+=p[0]; cz+=p[1];}); return {id:b[0],lv:b[1],name:b[2],pts:pts,c:[cx/pts.length,cz/pts.length]};});
const groundT=det.tex(N,N,function(g){
  const r=A.rng(101);
  g.fillStyle='#cbc3ae'; g.fillRect(0,0,N,N);
  for(let i=0;i<14000;i++){g.fillStyle='rgba('+(r()<0.5?'255,250,240':'70,60,45')+','+(0.03+r()*0.07)+')'; g.fillRect(r()*N,r()*N,1+r()*3,1+r()*3);}
  BLD.forEach(function(b,i){                              // a strip of garden round each block, hedges and dry grass
    g.fillStyle=['#97a173','#a7a982','#8e9a6c','#b3ad8c'][i%4]; g.beginPath();
    b.pts.forEach(function(p,j){const dx=p[0]-b.c[0], dz=p[1]-b.c[1], l=Math.hypot(dx,dz)||1, q=cp([p[0]+dx/l*2.6,p[1]+dz/l*2.6]); if(j) g.lineTo(q[0],q[1]); else g.moveTo(q[0],q[1]);}); g.fill();
    for(let k=0;k<40;k++){const p=b.pts[k%b.pts.length], q=cp([p[0]+(r()-0.5)*6,p[1]+(r()-0.5)*6]); g.fillStyle='rgba(60,85,45,'+(0.25+r()*0.3)+')'; g.beginPath(); g.arc(q[0],q[1],(0.4+r()*0.9)*K,0,7); g.fill();}});
  g.lineCap=g.lineJoin='round';
  const stroke=function(p,w,c,dash){g.strokeStyle=c; g.lineWidth=w*K; g.setLineDash(dash||[]); g.beginPath(); p.forEach(function(q,i){const c2=cp(q); if(i) g.lineTo(c2[0],c2[1]); else g.moveTo(c2[0],c2[1]);}); g.stroke(); g.setLineDash([]);};
  ST.forEach(function(s){const w=WID[s.k]; stroke(s.p,w[0]+2*w[1],s.k>=4?'#d4ccba':'#c4bdb0');});      // pavements, and the paved squares and paths
  ST.forEach(function(s){const w=WID[s.k]; if(w[0]) stroke(s.p,w[0]+0.36,'#ecebe6');});                  // kerbs
  ST.forEach(function(s){const w=WID[s.k]; if(w[0]) stroke(s.p,w[0],'#5c6064');});                       // asphalt
  ST.forEach(function(s){if(s.k===1) stroke(s.p,0.14,'#e9e9e2',[3*K,5*K]); else if(s.k===2) stroke(s.p,0.1,'rgba(233,233,226,0.55)',[2*K,6*K]);});   // the dashed line down the middle
  (function(){const q=function(lx,lz){return cp([XF+lz,ZC-lx]);}, a=q(12.4,NXY-XF), b=q(LBH,32);      // the garden's west half, from the building across our yard out to Haroe St: dark earth, dry leaves, a gravel path
    g.fillStyle='#5f5340'; g.fillRect(Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.abs(b[0]-a[0]),Math.abs(b[1]-a[1]));
    for(let i=0;i<2600;i++){const x=Math.min(a[0],b[0])+r()*Math.abs(b[0]-a[0]), y=Math.min(a[1],b[1])+r()*Math.abs(b[1]-a[1]); g.fillStyle=['#7a6a4f','#4a4232','#8a7a5a','#a08a62','#3f5a35','#56703f'][Math.floor(r()*6)]; g.fillRect(x,y,1+r()*3,1+r()*2);}
    const p0=q(13.2,27.5), p1=q(19.5,20.5), p2=q(17.5,11.5); g.strokeStyle='#b9ad93'; g.lineWidth=1.6*K; g.beginPath(); g.moveTo(p0[0],p0[1]); g.quadraticCurveTo(p1[0],p1[1],p2[0],p2[1]); g.stroke();})();
  for(let i=0;i<6000;i++){g.fillStyle='rgba(0,0,0,'+(r()*0.05)+')'; g.fillRect(r()*N,r()*N,1,1);}
});
(function(){
  const hole=[[-14,-22.4],[LBH,-22.4],[LBH,NXY-XF],[12.4,NXY-XF],[12.4,GZs],[SQ,GZs],[SQ,16+D8],[50,16+D8],[50,29.05+D8],[-19,29.05+D8],[-19,GZs],[0,GZs],[0,0],[-14,0]];   // in the street's frame: our building, the yard and the gap by Beit HaChayal, the alley and the garden, the square and Haroe St as the street draws them
  const sh=new THREE.Shape(); sh.moveTo(GZ0,GX0); sh.lineTo(GZ0+GS,GX0); sh.lineTo(GZ0+GS,GX0+GS); sh.lineTo(GZ0,GX0+GS); sh.lineTo(GZ0,GX0);
  const ho=new THREE.Path(); hole.forEach(function(q,i){const x=XF+q[1], z=ZC-q[0]; if(i) ho.lineTo(z,x); else ho.moveTo(z,x);}); ho.closePath(); sh.holes.push(ho);
  const g=new THREE.ShapeGeometry(sh), Pp=g.attributes.position, uv=g.attributes.uv, ix=g.index;
  for(let i=0;i<Pp.count;i++){const z=Pp.getX(i), x=Pp.getY(i); Pp.setXYZ(i,x,U-0.003,z); uv.setXY(i,(z-GZ0)/GS,(x-GX0)/GS);}
  g.computeVertexNormals();      // drawn in (z, x), counter-clockwise there is facing up here
  const m=new THREE.Mesh(g,A.reg(new THREE.MeshLambertMaterial({map:groundT}),'street')); m.receiveShadow=true; root.add(m);
})();

/* ---------- the blocks round us: whole, with their fronts, where they are near; plain volumes with windows farther off ---------- */
const OURC=[XF-11,ZC+5];
function obb(pts){let best=null;
  for(let i=0;i<pts.length;i++){const a=pts[i], b=pts[(i+1)%pts.length], dx=b[0]-a[0], dz=b[1]-a[1], l=Math.hypot(dx,dz); if(l<1) continue;
    const ux=dx/l, uz=dz/l; let s0=1e9, s1=-1e9, t0=1e9, t1=-1e9;
    pts.forEach(function(p){const s=p[0]*ux+p[1]*uz, t=-p[0]*uz+p[1]*ux; s0=Math.min(s0,s); s1=Math.max(s1,s); t0=Math.min(t0,t); t1=Math.max(t1,t);});
    const ar=(s1-s0)*(t1-t0); if(!best||ar<best.ar) best={ar:ar,ux:ux,uz:uz,s0:s0,s1:s1,t0:t0,t1:t1};}
  const c=function(s,t){return [s*best.ux-t*best.uz,s*best.uz+t*best.ux];};
  best.corners=[c(best.s0,best.t0),c(best.s1,best.t0),c(best.s1,best.t1),c(best.s0,best.t1)]; return best;}
/* a det.block whose front is the side a..b of a box, its body reaching back to the far corner c; o: det.block's options */
function blockOn(a,b,c,o,base){
  const dx=b[0]-a[0], dz=b[1]-a[1], len=Math.hypot(dx,dz); let ox=dz/len, oz=-dx/len;
  const depth=Math.abs((c[0]-a[0])*ox+(c[1]-a[1])*oz); if((c[0]-a[0])*ox+(c[1]-a[1])*oz>0){ox=-ox; oz=-oz;}      // outward: away from the body
  const ry=Math.atan2(ox,oz), along=Math.cos(ry)*dx-Math.sin(ry)*dz, s=along>=0?a:b;     // det.block runs its front along its own +x, so start from whichever end that is
  town.bake(det.block(Object.assign({sx:len,sz:depth},o)),s[0],base==null?U:base,s[1],ry);
  return depth;
}
function frontOf(bx){                                    // which side of the box faces the street, and what street
  const cs=bx.corners, cx=(cs[0][0]+cs[2][0])/2, cz=(cs[0][1]+cs[2][1])/2; let best=null;
  for(let i=0;i<4;i++){const a=cs[i], b=cs[(i+1)%4], mx=(a[0]+b[0])/2, mz=(a[1]+b[1])/2, l=Math.hypot(mx-cx,mz-cz)||1, nx=(mx-cx)/l, nz=(mz-cz)/l;
    const r=nearRoad(mx+nx*1.5,mz+nz*1.5); if(!best||r.d<best.d) best={i:i,d:r.d,k:r.k};}
  return best;}
const WALLS=[0xe6dfcf,0xddd5c3,0xe9e3d4,0xd8d0bd,0xefe9dc,0xe2dac8,0xd9cfb9], BAL=[['open','closed','win'],['closed','win','closed'],['win','open','win','closed'],['closed','closed','win']];
function nearBlock(bd,opt){
  const bx=obb(bd.pts), f=frontOf(bx), cs=bx.corners, seed=bd.id%97+3, r=A.rng(seed);
  const floors=bd.lv||(r()<0.25?5:4), main=f.k===1, gnd=opt&&opt.ground?opt.ground:main?'shops':r()<0.45?'pilotis':'flats';
  const faces={front:Object.assign({ground:gnd,balc:BAL[seed%4],cables:main,stair:gnd==='pilotis'?1:null,shops:main?['grocery','barber','kiosk','laundry','falafel','flowers'].slice(seed%3,seed%3+4):null},opt&&opt.front)};
  if(opt&&opt.all){faces.back={ground:'flats',pipes:2}; faces.left={ground:'flats'}; faces.right={ground:'flats'};}
  blockOn(cs[f.i],cs[(f.i+1)%4],cs[(f.i+2)%4],Object.assign({floors:floors,fh:2.95,ground:gnd==='pilotis'?3.2:3.1,seed:seed,wall:WALLS[seed%WALLS.length],faces:faces,number:opt&&opt.number,stone:seed%5===0},opt&&opt.block),opt&&opt.base);
  const h=U+(gnd==='pilotis'?3.2:3.1)+(floors-1)*2.95;
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9; bd.pts.forEach(function(p){x0=Math.min(x0,p[0]); x1=Math.max(x1,p[0]); z0=Math.min(z0,p[1]); z1=Math.max(z1,p[1]);});
  proxy(x0+0.4,x1-0.4,z0+0.4,z1-0.4,h);
  return {h:h,bx:bx};}
/* farther off: a plain volume, its walls drawn with windows and balconies, water heaters on the roof */
const farT=[0,1,2].map(function(k){return det.tex(128,128,function(g){const r=A.rng(70+k), wall=['#e4dccb','#d9d1be','#ebe5d8'][k];
  g.fillStyle=wall; g.fillRect(0,0,128,128); for(let i=0;i<300;i++){g.fillStyle='rgba(0,0,0,'+(r()*0.05)+')'; g.fillRect(r()*128,r()*128,2,2);}
  g.fillStyle='#cfc7b5'; g.fillRect(0,122,128,6);                                              // the slab line
  if(k===1){g.fillStyle='#c9c1ad'; g.fillRect(6,70,116,8); g.fillStyle='#41474b'; g.fillRect(14,26,100,44); g.fillStyle='#f1efe8'; for(let y=26;y<58;y+=4) g.fillRect(14,y,100,2.5); g.strokeStyle='#e9e6dc'; g.lineWidth=3; g.strokeRect(14,26,100,44);}   // a closed-in balcony, shutters drawn
  else{g.fillStyle='#3d474c'; g.fillRect(30,30,58,62); g.fillStyle='#f3f1ea'; for(let y=30;y<56;y+=4) g.fillRect(30,y,58,2.6); g.strokeStyle='#f6f4ee'; g.lineWidth=3; g.strokeRect(30,30,58,62); g.fillStyle='#d1c9b6'; g.fillRect(26,92,66,5);
    if(k===2){g.fillStyle='#e8e8e4'; g.fillRect(94,80,24,16); g.fillStyle='#2b2f31'; g.beginPath(); g.arc(102,88,5,0,7); g.fill();}}       // a window, its shutter part way down; an air conditioner
},true);});
const farM=farT.map(function(t){return A.reg(new THREE.MeshLambertMaterial({map:t}),'street');}), roofM=det.plasterM('#a59f94');
function farBlock(bd){
  const r=A.rng(bd.id), floors=bd.lv||(r()<0.3?5:4), h=U+3.1+(floors-1)*2.95, pts=bd.pts, n=pts.length, m=farM[bd.id%3];
  let ar=0; for(let i=0;i<n;i++){const a=pts[i], b=pts[(i+1)%n]; ar+=a[0]*b[1]-b[0]*a[1];}
  const pos=[], uv=[];
  for(let i=0;i<n;i++){let a=pts[i], b=pts[(i+1)%n]; if(ar>0){const t=a; a=b; b=t;}      // each wall faces out
    const len=Math.hypot(b[0]-a[0],b[1]-a[1]), u1=Math.max(1,Math.round(len/3.3)), v1=floors, y0=U, y1=h;
    pos.push(a[0],y0,a[1], b[0],y0,b[1], b[0],y1,b[1], a[0],y0,a[1], b[0],y1,b[1], a[0],y1,a[1]); uv.push(0,0, u1,0, u1,v1, 0,0, u1,v1, 0,v1);}
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2)); g.computeVertexNormals();
  town.geo(g,m,0,0,0);
  const sh=new THREE.Shape(); pts.forEach(function(p,i){if(i) sh.lineTo(p[1],p[0]); else sh.moveTo(p[1],p[0]);});
  const rg=new THREE.ShapeGeometry(sh), Pp=rg.attributes.position; for(let i=0;i<Pp.count;i++){const z=Pp.getX(i), x=Pp.getY(i); Pp.setXYZ(i,x,h,z);}
  const ix=rg.index; for(let i=0;i<ix.count;i+=3){const a=ix.getX(i); ix.setX(i,ix.getX(i+1)); ix.setX(i+1,a);} rg.computeVertexNormals();
  if(rg.attributes.normal.getY(0)<0) for(let i=0;i<ix.count;i+=3){const a=ix.getX(i); ix.setX(i,ix.getX(i+1)); ix.setX(i+1,a);}
  rg.computeVertexNormals(); town.geo(rg,roofM,0,0,0);
  for(let k=0;k<Math.min(6,Math.round(Math.sqrt(Math.abs(ar)/2)/4));k++){const p=pts[k%n], q=[bd.c[0]+(p[0]-bd.c[0])*0.55,bd.c[1]+(p[1]-bd.c[1])*0.55];       // water heaters and a stair hut
    town.cyl(0.28,1.3,0xf1f1ec,q[0],h+0.75,q[1],10,null,0,R/2); town.box(1.7,0.05,1.0,0x2b3d55,q[0]-0.9,h+0.45,q[1],R/2,-0.55);}      // the collector south of its tank, tilted to the sun
  town.box(2.2,2.3,2.4,0xe2dccd,bd.c[0],h+1.15,bd.c[1]);
}

/* ---------- number 12: the street draws its corner with the café; here the rest of it, along Haroe St to the east and its wing behind ---------- */
function quadUV(q){return q.map(function(p){return [XF+p[1],ZC+p[0]];});}
(function(){
  const o={floors:5,fh:3.0,ground:3.4,seed:12,wall:0xe2dac8};
  const main=quadUV([[12.05,14.2],[55.2,14.2],[55.2,31.2],[12.05,31.2]]);       // along Haroe St, from the café's block to the corner of Natan St
  blockOn(main[3],main[2],main[0],Object.assign({},o,{faces:{front:{ground:'shops',shops:['bakery','grocery','barber','kiosk','laundry','flowers','falafel','grocery','cafe','barber'],cables:true,balc:['closed','win','open']},back:{ground:'flats',pipes:2}}}));
  const wing=quadUV([[12.05,0.05],[17.6,0.05],[17.6,14.15],[12.05,14.15]]);      // its wing back to our building, between the café's block and the yard inside
  blockOn(wing[1],wing[2],wing[0],Object.assign({},o,{faces:{front:{ground:'flats',balc:['win','closed']}}}));
  const rw=obb(quadUV([[25.93,-10.78],[38.46,-15.14],[49.35,14],[35.3,14]])).corners;   // and the wing that runs back toward Natan St
  blockOn(rw[0],rw[1],rw[2],Object.assign({},o,{seed:13,faces:{front:{ground:'flats'},left:{ground:'flats'},right:{ground:'flats'},back:{ground:'flats'}}}));
  proxy(XF+0.2,XF+31,ZC+12,ZC+55,U+15.4); proxy(XF-15,XF+14,ZC+26,ZC+49,U+15.4);
})();

/* ---------- Beit HaChayal and every other block round us ---------- */
BLD.forEach(function(bd){
  bd.near=Math.hypot(bd.c[0]-OURC[0],bd.c[1]-OURC[1]);
  if(bd.id===798){const b=nearBlock(bd,{all:true,number:'8',block:{seed:8,wall:0xeeeae0,floors:5,fh:3.1,ground:3.6},front:{balc:['win','win','closed']}}), c=b.bx.corners;      // number 8: five storeys, and its plain wall down to the floor of the gap where it faces us
    const cx=(c[0][0]+c[2][0])/2, cz=(c[0][1]+c[2][1])/2, ry=Math.atan2(b.bx.uz,b.bx.ux);
    town.box(b.bx.s1-b.bx.s0-0.1,U-GY,b.bx.t1-b.bx.t0-0.1,0xd9d2c2,cx,(GY+U)/2,cz,-ry); return;}
  if(bd.near<70&&frontOf(obb(bd.pts)).k===1) nearBlock(bd); else farBlock(bd);      // a front with everything on it where it faces Haroe St close by; elsewhere, seen from above, a plain volume with its windows
});

/* ---------- the garden's west half, beyond the stretch the street draws: palms, a broad tree or two, yuccas and shrubs, a bench, the low green fence
   along the pavement; and the building across our yard, seen from the garden as the plain white wall behind the palms ---------- */
const garden=[];
(function(){const at=function(lx,lz){return [XF+lz,ZC-lx];};
  [[15.2,14.5,3.4],[21.5,18.5,4.2],[17.8,24.6,3.0],[24.6,28.2,3.8],[13.6,30.4,2.4],[25.8,12.6,4.6]].forEach(function(q,i){const p=at(q[0],q[1]), t=det.tree('palm',{h:q[2],s:0.95,n:22,seed:30+i,dates:q[2]>3.5,dead:5}); town.bake(t.wood,p[0],U,p[1],i); town.bake(t.crown,p[0],U,p[1],i); garden.push(p);});
  [[22.8,23.4,1.05],[14.6,19.6,0.9]].forEach(function(q,i){const p=at(q[0],q[1]), t=det.tree('broad',{s:q[2],a0:i*2,seed:44+i}); town.bake(t.wood,p[0],U,p[1],0); crowns.bake(t.crown,p[0],U,p[1],0); garden.push(p);});
  for(let i=0;i<18;i++){const r=A.rng(90+i), lx=13+r()*13.5, lz=11.5+r()*19, p=at(lx,lz); if(Math.abs(lx-17.5-(lz-11.5)*0.1)<1.2) continue;
    const t=det.tree(i%3===0?'yucca':'shrub',i%3===0?{h:0.9+r()*0.6,s:0.9,trunks:2,seed:i}:{w:0.8+r()*0.9,h:0.6+r()*0.7,d:0.8+r()*0.8,seed:i,n:90,size:0.34,flowers:r()<0.3}); town.bake(t.wood,p[0],U,p[1],r()*6); (i%3===0?town:crowns).bake(t.crown,p[0],U,p[1],r()*6);}
  const fence=function(a,b){const dx=b[0]-a[0], dz=b[1]-a[1], l=Math.hypot(dx,dz), ry=Math.atan2(dx,dz);
    for(let d=0.07;d<l;d+=0.14) town.box(0.014,0.52,0.014,0x23402f,a[0]+dx*d/l,U+0.32,a[1]+dz*d/l);
    town.box(0.03,0.03,l,0x23402f,(a[0]+b[0])/2,U+0.6,(a[1]+b[1])/2,ry); town.box(0.03,0.03,l,0x23402f,(a[0]+b[0])/2,U+0.12,(a[1]+b[1])/2,ry);
    town.box(l,0.22,0.12,0xc9c3b4,(a[0]+b[0])/2,U+0.11,(a[1]+b[1])/2,ry+R/2);};
  fence(at(SQ+0.2,32.2),at(LBH-0.3,32.2));
  const bp=at(19.8,31.2), bg=P.grp(), wood=0x8a5a3c, iron=0x2b2f2c;                                              // a bench by the path, facing the street
  for(let i=0;i<3;i++){P.box(1.7,0.035,0.11,wood,0,0.44,-0.13+i*0.13,bg); P.box(1.7,0.11,0.03,wood,0,0.58+i*0.13,-0.24-i*0.03,bg);}
  [-0.7,0.7].forEach(function(dx){P.box(0.05,0.44,0.42,iron,dx,0.22,-0.02,bg); P.box(0.05,0.5,0.05,iron,dx,0.68,-0.27,bg);}); town.bake(bg,bp[0],U,bp[1],R/2);
  /* the building across our yard: its north and east walls, plain white render, as seen behind the palms */
  const NX=D.KX+4.9, X1=NX+6, Z0=-9, Z1=4.6, T=12.6, wm=det.plasterM('#f1eee7');
  const fn=P.grp(X1+0.012,0,Z1,null,R/2); P.geo(det.wallGeo(Z1-Z0,T-U,3),wm,0,U,0,fn); P.box(Z1-Z0+0.1,0.1,0.25,0xd8d2c4,(Z1-Z0)/2,T+0.05,0.05,fn);
  [0.55,3.6,6.7,9.8].forEach(function(y,f){[1.6,4.4,7.6,10.6].forEach(function(s2,i){                       // its face toward the garden: a window and a closed-in balcony a flat, as on the side we see from the kitchen
    if(i%2) balcony(fn,s2-1.3,s2+1.3,y-0.05,1.0,(f+i)%3?'closed':'open'); else win(fn,s2,y+0.35,1.3,1.4,{ac:(f+i)%2===0,bars:f===0});});});
  town.bake(fn);
  const fe=P.grp(NX,0,Z1+0.012,null,0); P.geo(det.wallGeo(X1-NX,T-U,3),wm,0,U,0,fe); for(let f=0;f<4;f++) win(fe,(X1-NX)/2,U+0.95+f*3.1,0.9,1.1,{down:0.7,curtain:false}); town.bake(fe);
  const rf=P.grp(); P.geo(det.wallGeo(Z1-Z0-0.2,X1-NX-0.2,4),det.plasterM('#a59f94'),0,0,0,rf).rotation.x=-R/2; town.bake(rf,X1-0.1,T+0.02,Z1-0.1,R/2);      // its roof, a parapet round it
  [[NX+0.06,Z0,Z1],[X1-0.06,Z0,Z1]].forEach(function(q){town.box(0.12,0.9,q[2]-q[1],0xe8e4dc,q[0],T+0.45,(q[1]+q[2])/2);}); town.box(X1-NX,0.9,0.12,0xe8e4dc,(NX+X1)/2,T+0.45,Z1-0.06);
  for(let k=0;k<3;k++){const hg=P.grp(NX+1.6+k*1.6,T,Z0+3+k*4.2,null,R/2); det.solar(hg,A.rng(k)); town.bake(hg);}
})();

/* ---------- our building, number 10 ---------- */
const XS=XF-22.4, ZW=AZ-0.2, ZE=ZC+14, XN=D.BXB+0.2;      // its back wall; its west wall, the flat's outer face; its east end, behind number 12's wing; the front where bedroom 2 stands out
const bld=new THREE.Group(); bld.userData.nc=true; root.add(bld);
const low=new THREE.Group(), up=new THREE.Group(), skin=new THREE.Group(); bld.add(low,up,skin);
const BLo=A.batch(low), BUp=A.batch(up), BSk=A.batch(skin);

/* a face of the building: a group at its origin, x along the face, +z out of it */
function faceG(side,a){return side==='n'?P.grp(0,0,a,null,R/2):side==='w'?P.grp(a,0,ZW,null,R):side==='s'?P.grp(XS,0,a,null,-R/2):P.grp(a,0,ZE,null,0);}
function facePos(side,a,xf){const g=faceG(side,a); if(side==='n') g.position.x=xf; return g;}
function wall(fg,s0,s1,y0,y1,holes,m){                 // a stretch of wall from s0 to s1, with openings [s0,s1,y0,y1]
  const sh=new THREE.Shape(); sh.moveTo(s0,y0); sh.lineTo(s1,y0); sh.lineTo(s1,y1); sh.lineTo(s0,y1); sh.lineTo(s0,y0);
  (holes||[]).forEach(function(h){const p=new THREE.Path(); p.moveTo(h[0],h[2]); p.lineTo(h[0],h[3]); p.lineTo(h[1],h[3]); p.lineTo(h[1],h[2]); p.lineTo(h[0],h[2]); sh.holes.push(p);});
  const g=new THREE.ShapeGeometry(sh), uv=g.attributes.uv; for(let i=0;i<uv.count;i++) uv.setXY(i,uv.getX(i)/3,uv.getY(i)/3);
  P.geo(g,m||wallM,0,0,0,fg);}
function win(fg,s,y,w,h,o){det.window(fg,s,y,w,h,Object.assign({rng:RR,wall:wallHex},o||{}));}
/* the flat's outside walls, read from the flat itself, so the floors above repeat its windows where they are */
const FL=['living','kitchen','bed1','bed2','bath','wc'], north=[], west=[];
for(const k in A.walls){const w=A.walls[k]; if(FL.indexOf(w.room)<0) continue;
  if(w.n[0]<-0.99&&w.a[0]>5) north.push({x:w.a[0]+0.2,z0:Math.min(w.a[1],w.b[1]),z1:Math.max(w.a[1],w.b[1]),wins:w.wins.map(function(q){const za=w.a[1]+w.d[1]*q[0], zb=w.a[1]+w.d[1]*q[1]; return [Math.min(za,zb),Math.max(za,zb),q[2],q[3]];})});
  if(w.n[1]>0.99&&Math.abs(w.a[1]-AZ)<0.01) west.push({x0:Math.min(w.a[0],w.b[0]),x1:Math.max(w.a[0],w.b[0]),wins:w.wins.map(function(q){const xa=w.a[0]+w.d[0]*q[0], xb=w.a[0]+w.d[0]*q[1]; return [Math.min(xa,xb),Math.max(xa,xb),q[2],q[3]];})});}
north.sort(function(a,b){return a.z0-b.z0;});
const runs=[];                                           // the front along the flat, z from the west wall to the lobby, as runs of one depth
north.forEach(function(s,i){const z0=i===0?ZW:Math.max(s.z0,runs[runs.length-1].z1), z1=i===north.length-1?L:s.z1; runs.push({x:s.x,z0:z0,z1:z1,wins:s.wins});});
for(let i=0;i<runs.length-1;i++){if(runs[i+1].z0>runs[i].z1+0.001){runs[i].z1=runs[i+1].z0;}}
runs.push({x:XF+0.2,z0:L,z1:ZC,wins:[],lobby:true});
/* along one run of the front, from y0 to y1, with these openings; and the steps between runs */
function frontRun(B,rn,y0,y1,holes){const fg=facePos('n',rn.z1,rn.x); wall(fg,0,rn.z1-rn.z0,y0,y1,(holes||[]).map(function(h){return [rn.z1-h[1],rn.z1-h[0],h[2],h[3]];})); B.bake(fg); return fg;}
function jogs(B,y0,y1){for(let i=0;i<runs.length-1;i++){const a=runs[i], b=runs[i+1]; if(Math.abs(a.x-b.x)<0.01) continue;
  const fg=a.x>b.x?P.grp(b.x,0,a.z1,null,0):P.grp(a.x,0,a.z1,null,R); wall(fg,0,Math.abs(a.x-b.x),y0,y1); B.bake(fg);}}
/* ---- the outside of our own floor, round the flat and the lobby: shown with the whole building, taken away to look inside ---- */
runs.forEach(function(rn){
  if(rn.lobby){const fg=facePos('n',rn.z1,rn.x-0.19), DW=[[0.2,1.5],[ZC-LB.Z2-0.65,ZC-LB.Z2+0.65]];      // the lobby's front, just behind the street's own drawing of it, open at the two doorways
    wall(fg,0,rn.z1-rn.z0,0,H,DW.map(function(d){return [d[0],d[1],0,2.5];}));
    [[2.7,1.1,0.15,2.3],[4.55,2.2,0.5,1.9],[6.65,1.4,0.5,1.9],[9.7,1.1,0.15,2.3],[11.3,1.7,0.5,1.9]].forEach(function(q){win(fg,q[0],q[2],q[1],q[3],{down:1,bars:q[1]>1.3,lit:0,curtain:false});});
    BSk.bake(fg); return;}
  frontRun(BSk,rn,0,H,rn.wins.map(function(q){return [q[0],q[1],q[2],q[3]];}));});
jogs(BSk,0,H);
(function(){const fg=faceG('w',XN); wall(fg,0,XN+0.12,0,H,west.map(function(w){return w.wins.map(function(q){return [XN-q[1],XN-q[0],q[2],q[3]];});}).reduce(function(a,b){return a.concat(b);},[])); BSk.bake(fg);})();
/* ---- the rest of our floor, flats 1 to 4 and 6, and the semi-basement: always. The other flats are a low slab, their footprint at
   floor level: our own walls are seen through from outside, so nothing of theirs may stand between the camera and our rooms ---- */
(function(){
  const cut=0xc4c8c2, side=0xe6e2d8, SL=0.12;
  [[XS+0.25,LB.XL-0.22,ZW+0.25,ZE-0.25],[LB.XL-0.22,-0.22,ZW+0.25,L-0.22],[LB.XL-0.22,LB.CX0-0.22,LB.RZ+0.55,ZC-0.22],[LB.XL-0.22,XF-0.05,ZC+0.22,ZE-0.25],[LB.CX1+0.22,XF-0.05,LB.Z2+1.37,LB.ZE-0.22]].forEach(function(q){      // kept clear of the lobby's and the flat's walls
    BLo.box(q[1]-q[0],SL,q[3]-q[2],side,(q[0]+q[1])/2,SL/2,(q[2]+q[3])/2); BLo.box(q[1]-q[0]-0.02,0.012,q[3]-q[2]-0.02,cut,(q[0]+q[1])/2,SL+0.006,(q[2]+q[3])/2);});
  [[XS+0.2,-7.01,ZW+0.2,ZE-0.2],[-6.99,XF-0.05,ZC+0.01,ZE-0.2]].forEach(function(q){BLo.box(q[1]-q[0],-GY-0.02,q[3]-q[2],0xe2dccd,(q[0]+q[1])/2,GY/2-0.01,(q[2]+q[3])/2);});      // the semi-basement where the yard's own drawing of it stops
})();
/* the west wall: the stretch past the flat on our floor, and the semi-basement where it opens onto the gap by Beit HaChayal */
(function(){const fg=faceG('w',-0.12); wall(fg,0,-0.12-XS,0,H);
  for(let s=1.6;s<-0.12-XS-0.8;s+=3.4){win(fg,s,0.95,1.2,1.3,{bars:true}); win(fg,s+1.5,1.45,0.5,0.6,{down:0,curtain:false});}
  const fb=faceG('w',XN); wall(fb,0,XN-XS,GY,0); for(let s=XN+8.2;s<XN-XS-0.8;s+=3.0) win(fb,s,GY+1.0,0.9,0.7,{down:0.6,bars:true,curtain:false});      // under the flat the yard's own drawing of the floor below stands in front
  BLo.bake(fg); BLo.bake(fb);})();
/* the back, toward the buildings on David St, and the east end: plaster down to the floor below, our floor's windows */
const BACK=[];                                            // the bays along the back: kind, width
(function(){let s=0.6; const r=A.rng(41); while(s<ZE-ZW-2.5){const k=r(), w=k<0.35?3.0:k<0.7?1.5:1.1; BACK.push([s,w,k<0.35?'balc':k<0.7?'win':'small']); s+=w+(k<0.35?0.9:1.4);}})();
function backFloor(fg,y,lowFloor){BACK.forEach(function(b,i){
  if(b[2]==='balc'){if(lowFloor) win(fg,b[0]+b[1]/2,y+0.9,b[1]*0.8,1.4,{bars:true}); else balcony(fg,b[0],b[0]+b[1],y,1.1,(i+Math.round(y))%3?'closed':'open');}
  else if(b[2]==='win') win(fg,b[0]+b[1]/2,y+0.95,b[1],1.35,{ac:(i+Math.round(y))%3===0,bars:lowFloor});
  else win(fg,b[0]+b[1]/2,y+1.45,b[1]*0.6,0.62,{down:0,curtain:false});});}
(function(){const fg=faceG('s',ZW); wall(fg,0,ZE-ZW,GY,H); backFloor(fg,0,true); BLo.bake(fg);
  const fe=faceG('e',XS); wall(fe,0,XN-XS,GY,H); for(let s=2;s<XF-XS-2;s+=4.2) win(fe,s,0.95,1.3,1.3,{bars:true}); BLo.bake(fe);})();
/* ---- the floors above: three of them, then the roof. Only with the whole building ---- */
function balcony(fg,s0,s1,y,d,kind){                   // a balcony on its slab, open with a railing or closed in with sliding panes and shutters
  const w=s1-s0, xc=(s0+s1)/2; P.box(w,0.16,d,0xe2dccd,xc,y-0.08,d/2,fg); P.box(w,0.05,0.04,0xc9c2b1,xc,y-0.16,d,fg);
  P.box(w,1.0,0.08,wallHex,xc,y+0.5,d-0.04,fg); P.box(0.1,1.0,d,wallHex,s0+0.05,y+0.5,d/2,fg); P.box(0.1,1.0,d,wallHex,s1-0.05,y+0.5,d/2,fg); P.box(w,0.06,0.12,0xcfc8b6,xc,y+1.02,d-0.04,fg);
  if(kind==='open'){for(let x=s0+0.12;x<s1-0.08;x+=0.11) P.box(0.016,0.36,0.016,0x26282a,x,y+1.22,d-0.04,fg); P.box(w,0.03,0.03,0x26282a,xc,y+1.4,d-0.04,fg);
    win(fg,xc,y+0.02,Math.min(1.8,w*0.7),2.15,{curtain:true});}
  else{const ph=FF-1.25, np=Math.max(2,Math.round(w/0.9)), pw=w/np;
    P.box(w,0.05,0.08,0xd9dbdc,xc,y+1.06,d-0.06,fg); P.box(w,0.06,0.08,0xd9dbdc,xc,y+FF-0.2,d-0.06,fg);
    for(let k=0;k<np;k++){const px=s0+pw*(k+0.5); P.box(0.04,ph,0.06,0xd9dbdc,px-pw/2+0.02,y+1.06+ph/2,d-0.06,fg);
      P.geo(new THREE.PlaneGeometry(pw-0.05,ph-0.05),k%2?0x3c4850:0xeeece6,px,y+1.06+ph/2,d-0.05,fg);}
    P.box(w+0.04,0.06,d+0.08,0xcfc8b6,xc,y+FF-0.15,d/2,fg);}}
(function(){
  const top=ROOF+1.0;
  /* the front over the flat: its runs, its steps, and its windows on every floor */
  runs.forEach(function(rn,ri){
    const fg=facePos('n',rn.z1,rn.x); wall(fg,0,rn.z1-rn.z0,H,top);
    for(let f=1;f<=3;f++){const y=f*FF;
      rn.wins.forEach(function(q){const w=q[1]-q[0], h=q[3]-q[2], s=rn.z1-(q[0]+q[1])/2; win(fg,s,y+q[2],w,h,{ac:false});
        if(h>1.0&&w>1.2&&ri<2) {const a=det.ac({brand:['electra','tadiran','haier'][f%3],bracket:true,up:0.3,drain:0.8}); a.position.set(s,y+q[3]+0.45,0); fg.add(a);}});      // an air conditioner over the bedroom window, as over ours
      if(rn.lobby){                                                                        // over the lobby: the stairwell's window at each half landing, then two flats a floor
        const s=(rn.z1-(LB.EH+L)/2); win(fg,s,y-0.4,1.1,1.4,{down:0,curtain:false,lit:0});
        balcony(fg,ZC-12.6,ZC-9.2,y,1.2,f===1?'open':'closed');
        win(fg,ZC-14.6+0.75,y+0.95,1.5,1.35,{ac:true}); win(fg,ZC-16.4+0.8,y+0.95,1.6,1.35,{}); win(fg,ZC-18.0+0.3,y+1.5,0.5,0.6,{down:0,curtain:false});}}
    if(rn.lobby) win(fg,rn.z1-(LB.EH+L)/2,ROOF-0.4,1.1,1.4,{down:0,curtain:false,lit:0});
    BUp.bake(fg);});
  jogs(BUp,H,top);
  /* the west wall, toward Beit HaChayal: the bedrooms' windows on every floor, and the flats behind them */
  (function(){const fg=faceG('w',XN); wall(fg,0,XN-XS,H,top);
    for(let f=1;f<=3;f++){const y=f*FF;
      west.forEach(function(w){w.wins.forEach(function(q){win(fg,XN-(q[0]+q[1])/2,y+q[2],q[1]-q[0],q[3]-q[2],{});});});
      for(let s=XN+0.12+1.6;s<XN-XS-0.8;s+=3.4){win(fg,s,y+0.95,1.2,1.3,{}); win(fg,s+1.5,y+1.45,0.5,0.6,{down:0,curtain:false});}}
    for(let k=0;k<2;k++) P.cyl(0.05,top-GY,0x9aa0a2,XN-XS-3-k*9,(top+GY)/2,0.08,fg,8);
    BUp.bake(fg);})();
  /* the back and the east end */
  (function(){const fg=faceG('s',ZW); wall(fg,0,ZE-ZW,H,top); for(let f=1;f<=3;f++) backFloor(fg,f*FF,false);
    for(let k=0;k<4;k++) P.cyl(0.05,top-GY,0x9aa0a2,4+k*9.5,(top+GY)/2,0.1,fg,8);
    BUp.bake(fg);
    const fe=faceG('e',XS); wall(fe,0,XN-XS,H,top); for(let f=1;f<=3;f++) for(let s=2;s<XF-XS-2;s+=4.2) win(fe,s,f*FF+0.95,1.3,1.3,{ac:f===2}); BUp.bake(fe);
    const fn=facePos('n',ZE,XF+0.2); wall(fn,0,ZE-ZC,H,top); BUp.bake(fn);})();      // where it stands behind number 12's wing
  /* the roof: the slab, a parapet round it, the stair hut over our stairwell, water heaters, aerials, a dish */
  const RG=P.grp(0,0,0);
  P.box(XN-XS,0.3,ZE-ZW,0xa8a296,(XS+XN)/2,ROOF-0.15,(ZW+ZE)/2,RG);
  P.box(XN-XS,1.0,0.14,wallHex,(XS+XN)/2,ROOF+0.5,ZW+0.07,RG); P.box(XN-XS,1.0,0.14,wallHex,(XS+XN)/2,ROOF+0.5,ZE-0.07,RG);
  P.box(0.14,1.0,ZE-ZW,wallHex,XS+0.07,ROOF+0.5,(ZW+ZE)/2,RG); P.box(0.14,1.0,ZE-ZW,wallHex,XF+0.13,ROOF+0.5,(ZW+ZE)/2,RG);
  P.box(XN-XS+0.1,0.08,0.24,0xcfc8b6,(XS+XN)/2,ROOF+1.04,ZW+0.07,RG); P.box(XN-XS+0.1,0.08,0.24,0xcfc8b6,(XS+XN)/2,ROOF+1.04,ZE-0.07,RG);
  P.box(0.24,0.08,ZE-ZW,0xcfc8b6,XS+0.07,ROOF+1.04,(ZW+ZE)/2,RG); P.box(0.24,0.08,ZE-ZW,0xcfc8b6,XF+0.13,ROOF+1.04,(ZW+ZE)/2,RG);
  P.box(LB.XE-LB.SU+0.4,2.5,LB.EH-L+0.4,wallHex,(LB.SU+LB.XE)/2,ROOF+1.25,(L+LB.EH)/2,RG); P.box(0.9,2.05,0.04,0x6a6f72,(LB.SU+LB.XE)/2,ROOF+1.03,L-0.19,RG);
  P.box(LB.XE-LB.SU+0.6,0.1,LB.EH-L+0.6,0xcfc8b6,(LB.SU+LB.XE)/2,ROOF+2.55,(L+LB.EH)/2,RG);
  const rh=A.rng(7); let n=0;
  for(let x=XS+2.2;x<XN-3;x+=3.6) for(let z=ZW+2.0;z<ZE-1.5;z+=2.8){if(x>LB.SU-1.5&&x<LB.XE+1.5&&z>L-1.6&&z<LB.EH+1.6) continue; if(rh()<0.42) continue; n++;
    const hg=P.grp(x,ROOF,z,RG,R/2+(rh()-0.5)*0.15); det.solar(hg,rh);}                                                       // one heater for each flat, turned to the sun
  for(let i=0;i<4;i++){const ax=XS+3+rh()*(XN-XS-6), az=ZW+2+rh()*(ZE-ZW-4); P.cyl(0.02,2.6,0x9aa0a2,ax,ROOF+1.3,az,RG,6); for(let k=0;k<6;k++) P.box(k%2?0.9:0.7,0.012,0.012,0xa9aeb2,ax,ROOF+2.1+k*0.07,az+(k-3)*0.12,RG);}
  const dish=P.grp(XS+1.5,ROOF,ZE-3,RG,0.6); P.cyl(0.03,0.6,0x9aa0a2,0,0.3,0,dish,6); P.sph(0.4,0xe9e9e4,0,0.75,0.05,dish,1,1,0.32,16,8).rotation.x=0.5;
  BUp.bake(RG);
})();
BLo.done('street'); BUp.done('street'); BSk.done('street');

/* ---------- the pole transformer on the pavement at number 12's corner: a lattice mast, two transformers on a platform, insulators on cross-arms ---------- */
(function(){
  const g=P.grp(), steel=0x8e9599, dk=0x5f666a, grn=0x2f7a5b, h=10.6, b0=0.42, b1=0.28;
  const leg=function(sx,sz){P.bar([sx*b0,0,sz*b0],[sx*b1,h,sz*b1],0.035,steel,g,4);};
  leg(1,1); leg(1,-1); leg(-1,1); leg(-1,-1);
  const at=function(y){return b0+(b1-b0)*y/h;};
  for(let y=0.4;y<h-0.2;y+=0.9){const a=at(y), c=at(y+0.9);                                                 // the bracing, crossed on every side
    [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(s){const p=s[0]?[[s[0]*a,y,-a],[s[0]*c,y+0.9,c]]:[[-a,y,s[1]*a],[c,y+0.9,s[1]*c]], q=s[0]?[[s[0]*a,y,a],[s[0]*c,y+0.9,-c]]:[[a,y,s[1]*a],[-c,y+0.9,s[1]*c]];
      P.bar(p[0],p[1],0.012,steel,g,4); P.bar(q[0],q[1],0.012,steel,g,4); P.bar([s[0]?s[0]*a:-a,y,s[0]?-a:s[1]*a],[s[0]?s[0]*a:a,y,s[0]?a:s[1]*a],0.014,steel,g,4);});}
  for(let i=0;i<9;i++){const a=i*0.7, rr=0.07+0.05*(i%3); P.cyl(0.035,6.2,i%3?grn:0x3d8a6a,Math.sin(a)*rr,3.1,Math.cos(a)*rr,g,6);}      // the green cables up its middle
  P.box(1.0,2.2,1.0,0x9aa0a2,0,1.1,0,g); P.box(1.04,0.06,1.04,0x80878b,0,2.22,0,g);                       // a grey sheet-metal casing round its foot
  P.plane(0.22,0.42,0xf0d21c,0,3.3,b0*0.9+0.03,g); P.plane(0.3,0.36,0xf2f2ee,0.32,2.6,b0+0.01,g);       // its number, a warning
  for(let k=0;k<12;k++){const a=k*R/6; P.bar([Math.sin(a)*0.3,3.0,Math.cos(a)*0.3],[Math.sin(a)*0.75,3.25,Math.cos(a)*0.75],0.008,dk,g,3);}      // the ring of spikes against climbing
  P.box(2.6,0.12,1.2,dk,0,6.0,0,g);                                                                           // the platform
  [-0.78,0.78].forEach(function(x){const t=P.grp(x,6.06,0,g);                                                 // two transformers, their cooling fins all round
    P.box(0.62,1.25,0.62,0x9ca3a4,0,0.62,0,t); for(let k=0;k<7;k++){const f=-0.36+k*0.12; P.box(0.03,1.05,0.22,0x8d9495,f,0.6,0.42,t); P.box(0.03,1.05,0.22,0x8d9495,f,0.6,-0.42,t); P.box(0.22,1.05,0.03,0x8d9495,0.42,0.6,f,t); P.box(0.22,1.05,0.03,0x8d9495,-0.42,0.6,f,t);}
    P.box(0.7,0.06,0.7,0xb0b6b7,0,1.27,0,t); for(let k=0;k<3;k++){P.cyl(0.05,0.28,0x6b4a33,-0.2+k*0.2,1.44,0.1,t,8); P.cyl(0.04,0.22,0x9aa0a2,-0.2+k*0.2,1.42,-0.18,t,8);}});
  [8.4,9.4,10.4].forEach(function(y,i){P.box(i===2?2.0:2.8,0.08,0.1,dk,0,y,0,g);                              // cross-arms, each with its insulators
    [-1,0,1].forEach(function(s){const x=s*(i===2?0.85:1.25); for(let k=0;k<4;k++) P.cyl(0.07,0.06,0x5a3a26,x,y+0.08+k*0.08,0,g,10); P.bar([x,y+0.4,0],[x+s*0.4,y+0.2,1.6],0.008,0x2b2d2f,g,3);});});
  for(let k=0;k<4;k++) P.bar([0.15,6.1,0],[1.1,4.6+k*0.4,-3-k*1.2],0.01,0x1d1f21,g,3);                         // cables down to the café's front
  const px=XF+SF.KZ-1.25, pz=ZC+0.75; town.bake(g,px,U,pz,0);      // between number 12's corner column, the planters and the bins
  proxy(px-0.5,px+0.5,pz-0.5,pz+0.5,U+10.6); if(A.streetBlock) A.streetBlock.push([px-0.55,px+0.55,pz-0.55,pz+0.55]);
})();

/* ---------- the old fig trees along Haroe St, where the street round the square leaves off, and along the side streets; cars parked under them ---------- */
function fig(x,z,s,seed){                                // an old street fig: its trunk and limbs, and a crown of larger leaf cards, a third the weight of the square's own, for they are seen from farther off
  const t=det.tree('ficus',{s:s,a0:seed,seed:seed}), cg=P.grp(), tint=[0xffffff,0xe8f0d8,0xf4f8e8][seed%3];
  det.crown({c:[0,5.5*s,0],r:[3.4*s,1.9*s,3.4*s],n:300,size:1.15*s,seed:seed*3+1,tint:tint,cell:'broad',shell:0.45},cg);
  for(let k=0;k<5;k++){const a=seed+k*1.26; det.crown({c:[Math.sin(a)*2.5*s,6.0*s+(k%2)*0.4,Math.cos(a)*2.5*s],r:[1.8*s,1.2*s,1.8*s],n:70,size:1.0*s,seed:seed*7+k,tint:tint,cell:'broad',shell:0.4,droop:0.15},cg);}
  town.bake(t.wood,x,U,z,0); crowns.bake(cg,x,U,z,0);}
(function(){
  const hs=ST.filter(function(s){return s.name==='Haroe St';}), side=function(s,off,from,to,step,skip){
    for(let i=1;i<s.p.length;i++){const a=s.p[i-1], b=s.p[i], dx=b[0]-a[0], dz=b[1]-a[1], l=Math.hypot(dx,dz), nx=-dz/l, nz=dx/l;
      for(let t=4;t<l;t+=step){const x=a[0]+dx*t/l+nx*off, z=a[1]+dz*t/l+nz*off, u=z-ZC; if(u<from||u>to||(skip&&skip(u,x))||Math.hypot(x-OURC[0],z-OURC[1])>reach) continue; fig(x,z,0.85+((i*7+t)%5)*0.06,Math.floor(t*13+i));}}};
  const ours=function(u){return u>-32&&u<20;}, sharet=function(u){return u>-3.5&&u<6;};      // the stretch the street round the square draws, its runner's path; the mouth of Moshe Sharet St
  let reach=88; hs.forEach(function(s){side(s,WID[1][0]/2+0.7,-150,150,9.5,ours); side(s,-(WID[1][0]/2+0.7),-150,150,9.5,sharet);});      // our side past that stretch; the far side all along
  ST.filter(function(s){return s.name==='Mirkin St'||s.name==='David St'||s.name==='Moshe Sharet St';}).forEach(function(s){reach=58; side(s,WID[2][0]/2+0.6,-150,150,13,null); side(s,-(WID[2][0]/2+0.6),-150,150,13,null);});
  const cars=[['sedan',0xe9e9e6],['hatch',0x2f4f7a],['mini',0xb5372f],['suv',0x7a7f84],['van',0xf2f2ee],['hatch',0x1d1f21],['sedan',0xb9bcbe],['mini',0xd8c9a6],['hatch',0x8a1f2a],['sedan',0x3a4a5a]];
  let ci=0; const park=function(s,off,from,to,step){      // the street round the square parks its own cars in front of it
    for(let i=1;i<s.p.length;i++){const a=s.p[i-1], b=s.p[i], dx=b[0]-a[0], dz=b[1]-a[1], l=Math.hypot(dx,dz), nx=-dz/l, nz=dx/l;
    for(let t=6;t<l-4;t+=step){const x=a[0]+dx*t/l+nx*off, z=a[1]+dz*t/l+nz*off, u=z-ZC; if(u<from||u>to||(u>-28&&u<29)||sharet(u)||ci>=22) continue; const c=cars[ci++%cars.length];
      town.bake(det.car(c[0],{color:c[1],plate:String(10+ci*7%89)+'-'+String(100+ci*37%899)+'-'+String(10+ci*3%89)}),x,U,z,Math.atan2(-dz,dx)+(off>0?0:R));}}};      // nose along the traffic on each side
  hs.forEach(function(s){park(s,-(WID[1][0]/2-1.05),-140,140,11); park(s,WID[1][0]/2-1.05,-140,140,13);});
})();
town.done('street'); crowns.done('street');

/* ---------- names on the map ---------- */
const tags=[['Number 10, our building',XF-10,ROOF+3,ZC+4],['Beit HaChayal, number 8',XF+2,18,ZC-38],['Mirkin St',XF-20,U+1,ZC-58],['David St',XF-55,U+1,ZC+2],['Moshe Sharet St',XF+60,U+1,ZC+3],['Natan St',XF-10,U+1,ZC+49]]
  .map(function(q){return {el:A.tag(q[0]),pos:new THREE.Vector3(q[1],q[2],q[3])};});
A.labelFns.push(function(){const show=A.state.labels&&!A.simsOn&&A.state.scope==='building'; tags.forEach(function(t){A.place(t.el,t.pos,show);});});

/* ---------- the whole building, or a look inside ---------- */
let whole=null; const cam=A.camera, ctl=A.controls;
const fog=A.scene.fog=new THREE.Fog(0xe9ece7,190,520);
A.frameFns.push(function(){
  const w=!!(A.bldWhole&&A.bldWhole());
  if(w!==whole){whole=w; up.visible=skin.visible=w; A.touch(3);}
  const b=A.state.scope==='building', far=b?700:100; ctl.maxDistance=b?260:50;      // in the flat the old short view keeps the depth fine
  if(cam.far!==far){cam.far=far; cam.updateProjectionMatrix();}
  A.renderer.getClearColor(fog.color);
});
/* all of it belongs to the outside's own layer, so it is drawn, casts and is tapped only with the outside; set here so nothing of it is
   taken for the lobby and cut with it */
let layered=false;
A.frameFns.push(function(){if(layered||A.LAYER_OUT==null) return; layered=true; [root].concat(shade).forEach(function(o){o.traverse(function(m){m.layers.set(A.LAYER_OUT);});});});
A.building={covers:function(p){return p.x>XS&&p.x<XN+0.25&&p.z>ZW&&p.z<ZE&&p.y<ROOF;},warp:warp,pt:pt,XS:XS,ZW:ZW,ZE:ZE,ROOF:ROOF,centre:new THREE.Vector3((XS+XN)/2,0,(ZW+ZE)/2)};
})();
