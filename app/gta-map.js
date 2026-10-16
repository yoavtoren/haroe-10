/* Haroe 10 — the map, as in GTA. One dark map of the neighbourhood, drawn once: the blocks, the parks, the streets with their pavements, home.
   The radar in the corner (gta-hud.js) shows a piece of it turning with the camera; M (or a tap on the radar) opens the pause menu with the
   whole of it: drag to move, the wheel or a pinch to zoom, click to put a waypoint there (click it again to take it away). The GPS draws
   the way there along the streets, purple, on both maps, and keeps it fresh as you go: on foot by any street or path, in a car by road.
   The menu also has your stats, the settings (sound, picture, camera, the clock) and the keys. The game stops while it is open. */
(function(){
'use strict';
const A=window.APP, T=A.town, SM=A.sims, R=Math.PI;
if(!T||!SM||!T.mapData) return;
const TOUCH=!!(window.matchMedia&&(matchMedia('(pointer: coarse)').matches||(navigator.maxTouchPoints>0&&!matchMedia('(any-pointer: fine)').matches)));      /* a phone or a tablet; a laptop with a touch screen and a mouse plays as a computer */
const TX0=T.extent[0], TZ0=T.extent[1], TS=T.extent[2];
const $=function(id){return document.getElementById(id);};
function hyp(a,b){return Math.hypot(a,b);}

/* ---------- settings, kept in this browser ---------- */
const DEF={master:0.8,radio:0.6,sfx:0.9,dispatch:'he',quality:TOUCH?'low':'high',sens:0.5,invert:false,hud:true,clock:'game',dist:1};
const SET=Object.assign({},DEF);
try{const s=JSON.parse(localStorage.getItem('haroe-gta')||'{}'); for(const k in DEF) if(s[k]!=null&&typeof s[k]===typeof DEF[k]) SET[k]=s[k]; if(s.voices===false&&s.dispatch==null) SET.dispatch='off';}catch(e){}      /* the old On/Off for the voice */
function save(){try{localStorage.setItem('haroe-gta',JSON.stringify(SET));}catch(e){}}
const listeners=[];
A.gtaSet={get:function(k){return SET[k];},set:function(k,v){SET[k]=v; save(); listeners.forEach(function(f){f(k,v);});},on:function(f){listeners.push(f);}};

/* ---------- stats ---------- */
const STATS={walked:0,driven:0,cars:0,punches:0,wanted:0,busted:0,wasted:0,stolen:0,jumps:0};
try{const s=JSON.parse(localStorage.getItem('haroe-gta-stats')||'{}'); for(const k in STATS) if(typeof s[k]==='number') STATS[k]=s[k];}catch(e){}
let statT=0; function saveStats(){try{localStorage.setItem('haroe-gta-stats',JSON.stringify(STATS));}catch(e){}}
A.gtaStats=STATS;

/* =====================================================================
   The map, drawn once: PX pixels a metre
   ===================================================================== */
const PX=TOUCH?1.5:2, MN=Math.round(TS*PX);
const base=document.createElement('canvas'); base.width=base.height=MN;
function mp(x,z){return [(z-TZ0)*PX,(TX0+TS-x)*PX];}      // north (+x) is up
function toWorld(u,v){return [TX0+TS-v/PX,TZ0+u/PX];}
const COL={land:'#2a3033',block:'#3b4347',blockEdge:'#454e53',park:'#2c4632',play:'#4a4434',home:'#56664c',pave:'#40474b',road:'#646b6f',main:'#81878b',big:'#9a9e9f',path:'#4c5357'};
function poly(g,p){g.beginPath(); p.forEach(function(q,i){const c=mp(q[0],q[1]); if(i) g.lineTo(c[0],c[1]); else g.moveTo(c[0],c[1]);}); g.closePath();}
(function(){const g=base.getContext('2d');
  g.fillStyle=COL.land; g.fillRect(0,0,MN,MN);
  T.mapData.parks.forEach(function(a){g.fillStyle=a.kind==='playground'?COL.play:COL.park; poly(g,a.p); g.fill();});
  g.lineCap=g.lineJoin='round';
  const main=function(r){return r.k===1||r.k===6||r.k===7;};
  [0,1].forEach(function(pass){T.roads.forEach(function(r){const w=r.w;      // first the pavements under everything, then the carriageways
    if(pass===0){g.strokeStyle=w[0]?COL.pave:COL.path; g.lineWidth=Math.max(1.4,(w[0]+2*w[1]*(w[0]?0.8:0.5))*PX);}
    else{if(!w[0]) return; g.strokeStyle=r.k===6?COL.big:main(r)?COL.main:COL.road; g.lineWidth=Math.max(1.6,w[0]*PX);}
    g.beginPath(); r.p.forEach(function(q,i){const c=mp(q[0],q[1]); if(i) g.lineTo(c[0],c[1]); else g.moveTo(c[0],c[1]);}); g.stroke();});});
  g.strokeStyle=COL.blockEdge; g.lineWidth=1;
  T.blds.concat(T.mapData.own.map(function(p){return {p:p};})).forEach(function(b){const lv=b.lv||5, k=Math.min(1,Math.max(0,(lv-2)/16));      // the taller, the lighter, as GTA's map shades them
    g.fillStyle='rgb('+Math.round(56+k*34)+','+Math.round(63+k*34)+','+Math.round(68+k*34)+')'; poly(g,b.p); g.fill(); g.stroke();});
  g.fillStyle=COL.home; (A.building.foot||[]).forEach(function(r){const a=mp(r[1],r[2]), b=mp(r[0],r[3]); g.fillRect(Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.abs(b[0]-a[0])+0.5,Math.abs(b[1]-a[1])+0.5);});
})();
/* the street names, for the big map only: along each street's longest stretch */
const NAMES=[];      /* every straight stretch of a named street long enough to carry its name: the map writes it along as many as fit */
T.roads.forEach(function(r){if(!r.name||!r.w[0]) return; for(let j=1;j<r.p.length;j++){const a=r.p[j-1], b=r.p[j], l=hyp(b[0]-a[0],b[1]-a[1]); if(l>18) NAMES.push({l:l,a:a,b:b,name:r.name,main:r.k===1||r.k===6||r.k===7});}});
NAMES.sort(function(p,q){return (q.main-p.main)||(q.l-p.l);});

/* the parks and the named buildings, for the big map when it is close enough */
const LABELS=T.mapData.parks.filter(function(q){return q.name&&q.p.length>3;}).map(function(q){let x=0,z=0; q.p.forEach(function(v){x+=v[0]; z+=v[1];}); return {x:x/q.p.length,z:z/q.p.length,name:q.name,park:true};})
  .concat(T.blds.filter(function(b){return b.name&&/[A-Za-z]/.test(b.name)&&!/^\d/.test(b.name);}).map(function(b){return {x:b.c[0],z:b.c[1],name:b.name};}));
/* ---------- places on the map ---------- */
const LB=A.LB, HOME=[LB.XF+0.5,LB.ZO];      // our doorway, off the corner bridge
const POI=[{k:'home',x:HOME[0],z:HOME[1],name:'Home · Haroe 10'}];
(function(){const near=function(x,z,k,d){return POI.some(function(p){return p.k===k&&hyp(p.x-x,p.z-z)<d;});};
  (T.cafes||[]).forEach(function(c){if(!near(c.x,c.z,'cafe',45)) POI.push({k:'cafe',x:c.x,z:c.z,name:'Café'});});
  T.blds.forEach(function(b){if(b.k==='c') POI.push({k:'shop',x:b.c[0],z:b.c[1],name:b.name||'Shops'}); else if(/maccabi/i.test(b.name||'')) POI.push({k:'clinic',x:b.c[0],z:b.c[1],name:'Maccabi clinic'});});
  (T.stops||[]).forEach(function(s){if(!near(s.x,s.z,'bus',60)) POI.push({k:'bus',x:s.x,z:s.z,name:'Bus stop',big:true});});})();
A.gtaPOI=POI;
const LEGEND={home:'Safehouse',cafe:'Café',shop:'Shopping',clinic:'Clinic',bus:'Bus stop',police:'Police',way:'Waypoint',you:'You'};
/* a blip: drawn at c (canvas pixels), s its size */
function blip(g,k,cx,cy,s,t){g.save(); g.translate(cx,cy); g.lineJoin='round'; g.lineWidth=Math.max(1.5,s*0.16); g.strokeStyle='rgba(0,0,0,0.85)';
  if(k==='home'){g.fillStyle='#fff'; g.beginPath(); g.moveTo(0,-s*0.62); g.lineTo(s*0.62,-s*0.02); g.lineTo(s*0.42,-s*0.02); g.lineTo(s*0.42,s*0.55); g.lineTo(-s*0.42,s*0.55); g.lineTo(-s*0.42,-s*0.02); g.lineTo(-s*0.62,-s*0.02); g.closePath(); g.stroke(); g.fill();}
  else if(k==='cafe'){g.fillStyle='#f0c86a'; g.beginPath(); g.moveTo(-s*0.45,-s*0.3); g.lineTo(s*0.3,-s*0.3); g.lineTo(s*0.22,s*0.45); g.lineTo(-s*0.37,s*0.45); g.closePath(); g.stroke(); g.fill(); g.beginPath(); g.arc(s*0.36,s*0.02,s*0.18,-R/2,R/2); g.stroke(); g.strokeStyle='#f0c86a'; g.lineWidth=Math.max(1,s*0.1); g.stroke();}
  else if(k==='shop'){g.fillStyle='#7ad0f0'; g.fillRect(-s*0.42,-s*0.22,s*0.84,s*0.72); g.strokeRect(-s*0.42,-s*0.22,s*0.84,s*0.72); g.beginPath(); g.arc(0,-s*0.22,s*0.22,R,0); g.stroke();}
  else if(k==='clinic'){g.fillStyle='#e23b3b'; g.beginPath(); g.arc(0,0,s*0.55,0,7); g.fill(); g.stroke(); g.fillStyle='#fff'; g.fillRect(-s*0.12,-s*0.36,s*0.24,s*0.72); g.fillRect(-s*0.36,-s*0.12,s*0.72,s*0.24);}
  else if(k==='bus'){g.fillStyle='#e8e8e8'; g.fillRect(-s*0.38,-s*0.45,s*0.76,s*0.8); g.strokeRect(-s*0.38,-s*0.45,s*0.76,s*0.8); g.fillStyle='#2a3033'; g.fillRect(-s*0.28,-s*0.35,s*0.56,s*0.3);}
  else if(k==='police'){const on=Math.floor((t||0)*4)%2; g.fillStyle=on?'#e8423f':'#3d7bf0'; g.beginPath(); g.arc(0,0,s*0.42,0,7); g.fill(); g.stroke();}
  else if(k==='policecar'){const on=Math.floor((t||0)*4)%2; g.fillStyle=on?'#e8423f':'#3d7bf0'; g.fillRect(-s*0.5,-s*0.3,s,s*0.6); g.strokeRect(-s*0.5,-s*0.3,s,s*0.6);}
  else if(k==='way'){g.fillStyle='#b65cf0'; g.beginPath(); g.moveTo(0,s*0.65); g.bezierCurveTo(-s*0.75,-s*0.1,-s*0.45,-s*0.75,0,-s*0.75); g.bezierCurveTo(s*0.45,-s*0.75,s*0.75,-s*0.1,0,s*0.65); g.closePath(); g.stroke(); g.fill(); g.fillStyle='#fff'; g.beginPath(); g.arc(0,-s*0.25,s*0.18,0,7); g.fill();}
  else if(k==='you'){g.fillStyle='#fff'; g.beginPath(); g.moveTo(0,-s*0.7); g.lineTo(s*0.5,s*0.5); g.lineTo(0,s*0.22); g.lineTo(-s*0.5,s*0.5); g.closePath(); g.stroke(); g.fill();}
  else if(k==='heli'){const on=Math.floor((t||0)*4)%2; g.fillStyle=on?'#e8423f':'#3d7bf0'; g.beginPath(); g.arc(0,0,s*0.34,0,7); g.fill(); g.stroke(); g.strokeStyle='#fff'; g.lineWidth=Math.max(1.2,s*0.1); g.beginPath(); g.moveTo(-s*0.6,-s*0.6); g.lineTo(s*0.6,s*0.6); g.moveTo(s*0.6,-s*0.6); g.lineTo(-s*0.6,s*0.6); g.stroke();}
  else if(k==='car'){g.fillStyle='#f5f5f5'; g.fillRect(-s*0.3,-s*0.5,s*0.6,s); g.strokeRect(-s*0.3,-s*0.5,s*0.6,s);}
  g.restore();}
A.gtaBlip=blip;

/* =====================================================================
   The GPS: the streets as a graph, the shortest way along it
   ===================================================================== */
const NODES=[], idOf=new Map(), SEGS=[], SG=new Map(), SGC=40;
function nid(q){const k=T.key(q); let i=idOf.get(k); if(i==null){i=NODES.length; idOf.set(k,i); NODES.push({x:q[0],z:q[1],e:[]});} return i;}
T.roads.forEach(function(r){const car=r.w[0]>0; for(let j=1;j<r.p.length;j++){const a=nid(r.p[j-1]), b=nid(r.p[j]); if(a===b) continue; const l=hyp(NODES[a].x-NODES[b].x,NODES[a].z-NODES[b].z);
  NODES[a].e.push([b,l,car]); NODES[b].e.push([a,l,car]); const s={a:a,b:b,l:l,car:car,r:r}; SEGS.push(s);
  const x0=Math.min(NODES[a].x,NODES[b].x), x1=Math.max(NODES[a].x,NODES[b].x), z0=Math.min(NODES[a].z,NODES[b].z), z1=Math.max(NODES[a].z,NODES[b].z);
  for(let i=Math.floor(x0/SGC);i<=Math.floor(x1/SGC);i++) for(let k=Math.floor(z0/SGC);k<=Math.floor(z1/SGC);k++){const kk=i+','+k; let l2=SG.get(kk); if(!l2) SG.set(kk,l2=[]); l2.push(s);}}});
/* the pieces of the network that do not join the rest (a lane behind a block, a bit of path) are left out: a route has to be able to get there */
(function(){[false,true].forEach(function(car){const comp=new Int32Array(NODES.length).fill(-1), size=[]; let c=0;
  for(let i=0;i<NODES.length;i++){if(comp[i]>=0) continue; let n=0; const st=[i]; comp[i]=c; while(st.length){const v=st.pop(); n++; NODES[v].e.forEach(function(e){if(car&&!e[2]) return; if(comp[e[0]]<0){comp[e[0]]=c; st.push(e[0]);}});} size.push(n); c++;}
  let big=0; for(let k=1;k<size.length;k++) if(size[k]>size[big]) big=k;
  SEGS.forEach(function(s){s[car?'mainCar':'main']=comp[s.a]===big&&(!car||s.car);});});})();
function nearSeg(x,z,car){let best=null; for(let r=0;r<4&&!best;r++){const i0=Math.floor(x/SGC), k0=Math.floor(z/SGC);
  for(let i=i0-r;i<=i0+r;i++) for(let k=k0-r;k<=k0+r;k++){const l=SG.get(i+','+k); if(!l) continue; for(let n=0;n<l.length;n++){const s=l[n]; if(!(car?s.mainCar:s.main)) continue; const a=NODES[s.a], b=NODES[s.b], dx=b.x-a.x, dz=b.z-a.z, t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(s.l*s.l))), px=a.x+dx*t, pz=a.z+dz*t, d=hyp(px-x,pz-z);
    if(!best||d<best.d) best={s:s,t:t,x:px,z:pz,d:d};}}} return best;}
function route(x0,z0,x1,z1,car){
  const S=nearSeg(x0,z0,car), E=nearSeg(x1,z1,car); if(!S||!E) return null;
  if(S.s===E.s) return [[x0,z0],[S.x,S.z],[E.x,E.z],[x1,z1]];
  const N=NODES.length, dist=new Float64Array(N).fill(Infinity), prev=new Int32Array(N).fill(-1), done=new Uint8Array(N), heap=[];
  const push=function(d,i){heap.push([d,i]); let c=heap.length-1; while(c>0){const p=(c-1)>>1; if(heap[p][0]<=heap[c][0]) break; const t=heap[p]; heap[p]=heap[c]; heap[c]=t; c=p;}};
  const pop=function(){const top=heap[0], last=heap.pop(); if(heap.length){heap[0]=last; let c=0; for(;;){const l=2*c+1, r=l+1; let m=c; if(l<heap.length&&heap[l][0]<heap[m][0]) m=l; if(r<heap.length&&heap[r][0]<heap[m][0]) m=r; if(m===c) break; const t=heap[m]; heap[m]=heap[c]; heap[c]=t; c=m;}} return top;};
  const sa=S.s.a, sb=S.s.b; dist[sa]=S.t*S.s.l; dist[sb]=(1-S.t)*S.s.l; push(dist[sa],sa); push(dist[sb],sb);
  const ea=E.s.a, eb=E.s.b, ta=E.t*E.s.l, tb=(1-E.t)*E.s.l; let bestEnd=-1, bestD=Infinity;
  while(heap.length){const q=pop(), i=q[1]; if(done[i]) continue; done[i]=1; if(q[0]>bestD) break;
    if(i===ea&&q[0]+ta<bestD){bestD=q[0]+ta; bestEnd=ea;} if(i===eb&&q[0]+tb<bestD){bestD=q[0]+tb; bestEnd=eb;}
    const e=NODES[i].e; for(let k=0;k<e.length;k++){if(car&&!e[k][2]) continue; const j=e[k][0], nd=q[0]+e[k][1]; if(nd<dist[j]){dist[j]=nd; prev[j]=i; push(nd,j);}}}
  if(bestEnd<0) return null;
  const out=[]; for(let i=bestEnd;i>=0;i=prev[i]) out.push([NODES[i].x,NODES[i].z]); out.reverse();
  return [[x0,z0],[S.x,S.z]].concat(out,[[E.x,E.z],[x1,z1]]);}
A.gtaRoute=route;
/* a point on a road of the main network between dmin and dmax from x,z (where the police come from), with the way the road runs */
A.gtaRoadPoint=function(x,z,dmin,dmax,ok){for(let k=0;k<80;k++){const s=SEGS[Math.floor(Math.random()*SEGS.length)]; if(!s.mainCar) continue; const a=NODES[s.a], b=NODES[s.b], t=Math.random(), px=a.x+(b.x-a.x)*t, pz=a.z+(b.z-a.z)*t, d=hyp(px-x,pz-z);
  if(d<dmin||d>dmax||(ok&&!ok(px,pz))) continue; return {x:px,z:pz,h:Math.atan2(b.x-a.x,b.z-a.z)};} return null;};

/* ---------- the waypoint, and the way to it ---------- */
const WP={at:null,path:null,t:0,len:0};
const beam=new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.55,70,14,1,true),new THREE.MeshBasicMaterial({color:0xb65cf0,transparent:true,opacity:0.28,depthWrite:false,side:THREE.DoubleSide,fog:false}));
beam.visible=false; beam.userData.nc=true; beam.renderOrder=5; A.scene.add(beam);
function setWay(x,z){
  if(x==null){WP.at=null; WP.path=null; beam.visible=false; return;}
  WP.at=[x,z]; WP.t=0; beam.position.set(x,35,z); beam.layers.set(A.LAYER_OUT||5); beam.visible=true; refreshRoute(true);
  if(A.gtaSound&&A.gtaSound.blip) A.gtaSound.blip();}
function me(){const c=A.drive&&A.drive.on&&A.drive.on()?A.drive.pos():null, p=SM.player; return c?{x:c.x,z:c.z,car:true}:p?{x:p.x,z:p.z,car:false}:null;}
function refreshRoute(force){const m=me(); if(!WP.at||!m) return; WP.t=A.t; const r=route(m.x,m.z,WP.at[0],WP.at[1],m.car); WP.path=r; WP.car=m.car;
  let l=0; if(r) for(let i=1;i<r.length;i++) l+=hyp(r[i][0]-r[i-1][0],r[i][1]-r[i-1][1]); WP.len=l;}
function offRoute(m){const r=WP.path; if(!r) return true; let d=1e9; for(let i=1;i<r.length&&i<12;i++){const a=r[i-1], b=r[i], dx=b[0]-a[0], dz=b[1]-a[1], l2=dx*dx+dz*dz||1, t=Math.max(0,Math.min(1,((m.x-a[0])*dx+(m.z-a[1])*dz)/l2)); d=Math.min(d,hyp(a[0]+t*dx-m.x,a[1]+t*dz-m.z));} return d>14;}
A.gtaWay={get at(){return WP.at;},get path(){return WP.path;},get len(){return WP.len;},set:setWay};

/* =====================================================================
   The pause menu: MAP, STATS, SETTINGS, KEYS
   ===================================================================== */
const menu=document.createElement('div'); menu.id='gtaMenu'; menu.hidden=true;
menu.innerHTML='<div class="gmTop"><div class="gmName">Haroe 10</div><div class="gmTabs" role="tablist"></div><div class="gmInfo"><span id="gmClock"></span><span id="gmCash"></span></div></div>'+
  '<div class="gmBody"><div class="gmPane" data-p="map"><div class="gmMapWrap"><canvas id="gmMap"></canvas><div class="gmZoom"><button data-z="1" aria-label="Zoom in">+</button><button data-z="-1" aria-label="Zoom out">−</button></div></div><div class="gmLegend"></div></div>'+
  '<div class="gmPane" data-p="stats" hidden></div><div class="gmPane" data-p="settings" hidden></div><div class="gmPane" data-p="keys" hidden></div></div>'+
  '<div class="gmFoot"></div>';
A.stage.appendChild(menu);
const TABS=[['map','Map'],['stats','Stats'],['settings','Settings'],['keys','Keys']];
const tabsEl=menu.querySelector('.gmTabs'); let tab='map';
tabsEl.innerHTML=TABS.map(function(t){return '<button role="tab" data-t="'+t[0]+'">'+t[1]+'</button>';}).join('');
tabsEl.onclick=function(e){const b=e.target.closest('button'); if(b) showTab(b.dataset.t);};
function showTab(t){tab=t; tabsEl.querySelectorAll('button').forEach(function(b){b.setAttribute('aria-selected',b.dataset.t===t);});
  menu.querySelectorAll('.gmPane').forEach(function(p){p.hidden=p.dataset.p!==t;});
  menu.querySelector('.gmFoot').innerHTML=t==='map'?(TOUCH?'<span>Tap: waypoint</span><span>Drag: move</span><span>Pinch: zoom</span>':'<span><b>Click</b> waypoint</span><span><b>Drag</b> move</span><span><b>Wheel</b> zoom</span><span><b>M</b> / <b>Esc</b> back</span>')+'<button class="gmBack">Back to the game</button>':'<button class="gmBack">Back to the game</button>';
  if(t==='map') drawMap(); else if(t==='stats') drawStats(); else if(t==='settings') drawSettings(); else drawKeys();}
menu.addEventListener('click',function(e){if(e.target.closest('.gmBack')) open(false);});
const cvs=$('gmMap'); const view={cx:0,cz:0,s:2.2};      // the middle of the view (world), and pixels a metre
function open(on){
  if(on===menu.hidden){} else return;
  menu.hidden=!on; A.paused=on; document.body.classList.toggle('gtaPaused',on);
  if(on){if(document.pointerLockElement) document.exitPointerLock(); const m=me(); if(m){view.cx=m.x; view.cz=m.z;} view.s=2.2; showTab('map'); legend(); if(A.gtaSound&&A.gtaSound.pause) A.gtaSound.pause(true);}
  else if(A.gtaSound&&A.gtaSound.pause) A.gtaSound.pause(false);
}
A.gtaMap={open:open,toggle:function(){open(menu.hidden);},get on(){return !menu.hidden;}};
function sizeMap(){const r=cvs.getBoundingClientRect(), d=Math.min(2,window.devicePixelRatio||1); const w=Math.max(10,Math.round(r.width*d)), h=Math.max(10,Math.round(r.height*d)); if(cvs.width!==w||cvs.height!==h){cvs.width=w; cvs.height=h;} return d;}
function w2c(x,z,d){const W=cvs.width, H=cvs.height; return [W/2+(z-view.cz)*view.s*d,H/2-(x-view.cx)*view.s*d];}
function c2w(u,v,d){const W=cvs.width, H=cvs.height; return [view.cx-(v-H/2)/(view.s*d),view.cz+(u-W/2)/(view.s*d)];}
function drawMap(){if(menu.hidden||tab!=='map') return; const d=sizeMap(), g=cvs.getContext('2d'), W=cvs.width, H=cvs.height, s=view.s*d;
  g.fillStyle=COL.land; g.fillRect(0,0,W,H);
  const tl=c2w(0,0,d); g.imageSmoothingEnabled=true; g.drawImage(base,(tl[1]-TZ0)*PX,(TX0+TS-tl[0])*PX,W/s*PX,H/s*PX,0,0,W,H);
  /* street names when close enough to read them */
  if(view.s>1.2){const fs=Math.round(Math.min(17,Math.max(12,9+view.s*1.5))*d), boxes=[], seen={}; g.font='600 '+fs+'px "Barlow Condensed",sans-serif'; g.textAlign='center'; g.textBaseline='middle';
    NAMES.forEach(function(n){if(!n.main&&view.s<2.4) return; const a=w2c(n.a[0],n.a[1],d), b=w2c(n.b[0],n.b[1],d), mx=(a[0]+b[0])/2, my=(a[1]+b[1])/2; if(mx<0||my<0||mx>W||my>H) return;
      const tw=g.measureText(n.name).width; if(hyp(b[0]-a[0],b[1]-a[1])<tw+16*d) return;      /* only where the stretch is longer than the name */
      let an=Math.atan2(b[1]-a[1],b[0]-a[0]); if(an>R/2) an-=R; if(an<-R/2) an+=R;
      const ex=(Math.abs(Math.cos(an))*tw+Math.abs(Math.sin(an))*fs)/2+4*d, ey=(Math.abs(Math.sin(an))*tw+Math.abs(Math.cos(an))*fs)/2+4*d;
      if(boxes.some(function(q){return Math.abs(q[0]-mx)<q[2]+ex&&Math.abs(q[1]-my)<q[3]+ey;})) return;      /* clear of the names already written */
      if((seen[n.name]||[]).some(function(q){return hyp(q[0]-mx,q[1]-my)<tw*3+60*d;})) return;      /* and the same street's name not again close by */
      boxes.push([mx,my,ex,ey]); (seen[n.name]||(seen[n.name]=[])).push([mx,my]);
      g.save(); g.translate(mx,my); g.rotate(an); g.lineWidth=3*d; g.strokeStyle='rgba(20,24,26,0.9)'; g.strokeText(n.name,0,0); g.fillStyle='#d6dadc'; g.fillText(n.name,0,0); g.restore();});}
  if(view.s>1.5){g.font='italic 600 '+Math.round(13*d)+'px "Barlow Condensed",sans-serif'; g.textAlign='center'; LABELS.forEach(function(q){if(!q.park&&view.s<2.6) return; const c=w2c(q.x,q.z,d); if(c[0]<0||c[1]<0||c[0]>W||c[1]>H) return;
    g.lineWidth=3*d; g.strokeStyle='rgba(20,24,26,0.85)'; g.strokeText(q.name,c[0],c[1]); g.fillStyle=q.park?'#9fd39a':'#e8d9a8'; g.fillText(q.name,c[0],c[1]);});}
  /* the route */
  if(WP.path){g.strokeStyle='#b65cf0'; g.lineWidth=Math.max(3,4*d); g.lineCap=g.lineJoin='round'; g.beginPath(); WP.path.forEach(function(q,i){const c=w2c(q[0],q[1],d); if(i) g.lineTo(c[0],c[1]); else g.moveTo(c[0],c[1]);}); g.stroke();}
  POI.forEach(function(p){if(p.big&&view.s<1.6) return; const c=w2c(p.x,p.z,d); if(c[0]<-20||c[1]<-20||c[0]>W+20||c[1]>H+20) return; blip(g,p.k,c[0],c[1],(p.k==='home'?20:15)*d,A.t);});
  if(A.gtaCops) A.gtaCops.blips(function(x,z,k){const c=w2c(x,z,d); blip(g,k,c[0],c[1],13*d,A.t);});
  if(WP.at){const c=w2c(WP.at[0],WP.at[1],d); blip(g,'way',c[0],c[1]-10*d,24*d);}
  const m=me(); if(m){const c=w2c(m.x,m.z,d), h=m.car?A.drive.heading():SM.player.h; g.save(); g.translate(c[0],c[1]); g.rotate(R/2-h); blip(g,'you',0,0,20*d); g.restore();}      // heading h runs from +z toward +x; the map has +x up, +z to the right
  g.fillStyle='rgba(255,255,255,0.75)'; g.font='700 '+Math.round(13*d)+'px "Barlow Condensed",sans-serif'; g.textAlign='left'; g.fillText('N ↑',12*d,20*d);}
/* panning, zooming, a waypoint */
let pan=null; const touches=new Map();
cvs.addEventListener('pointerdown',function(e){cvs.setPointerCapture(e.pointerId); touches.set(e.pointerId,{x:e.clientX,y:e.clientY}); if(pan&&touches.size>1){pan.multi=true; return;} pan={x:e.clientX,y:e.clientY,moved:false,t:performance.now(),d0:null,s0:view.s,btn:e.button,multi:false};});
cvs.addEventListener('pointermove',function(e){if(!pan||!touches.has(e.pointerId)) return; const prevT=touches.get(e.pointerId); touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(touches.size>=2){const ps=[...touches.values()], dd=hyp(ps[0].x-ps[1].x,ps[0].y-ps[1].y); if(!pan.d0) pan.d0=dd; view.s=Math.max(0.35,Math.min(9,pan.s0*dd/pan.d0)); pan.moved=true; drawMap(); return;}
  const dx=e.clientX-prevT.x, dy=e.clientY-prevT.y; if(Math.hypot(e.clientX-pan.x,e.clientY-pan.y)>5) pan.moved=true; if(!pan.moved) return;
  view.cz-=dx/view.s; view.cx+=dy/view.s; drawMap();});
cvs.addEventListener('pointerup',function(e){touches.delete(e.pointerId); if(!pan) return; const p=pan; if(touches.size) return; pan=null; if(p.moved||p.multi||p.btn!==0) return;      /* not a pinch, not the right button */
  const r=cvs.getBoundingClientRect(), d=cvs.width/r.width, w=c2w((e.clientX-r.left)*d,(e.clientY-r.top)*d,d);
  if(WP.at&&hyp(WP.at[0]-w[0],WP.at[1]-w[1])<14/view.s+2) setWay(null); else if(T.inside(w[0],w[1])) setWay(w[0],w[1]); drawMap(); legend();});
cvs.addEventListener('pointercancel',function(e){touches.delete(e.pointerId); pan=null;});
cvs.addEventListener('wheel',function(e){e.preventDefault(); const r=cvs.getBoundingClientRect(), d=cvs.width/r.width, u=(e.clientX-r.left)*d, v=(e.clientY-r.top)*d, before=c2w(u,v,d);
  view.s=Math.max(0.35,Math.min(9,view.s*(e.deltaY>0?0.85:1.18))); const after=c2w(u,v,d); view.cx+=before[0]-after[0]; view.cz+=before[1]-after[1]; drawMap();},{passive:false});
menu.querySelector('.gmZoom').onclick=function(e){const b=e.target.closest('button'); if(!b) return; view.s=Math.max(0.35,Math.min(9,view.s*(+b.dataset.z>0?1.35:0.74))); drawMap();};
window.addEventListener('resize',function(){if(!menu.hidden) drawMap();});
cvs.addEventListener('contextmenu',function(e){e.preventDefault();});
function legend(){const el=menu.querySelector('.gmLegend'); const ks=['you','way','home','cafe','shop','clinic','bus','police'];
  el.innerHTML='<h4>Legend</h4>'+ks.map(function(k){return '<div class="gmL"><canvas width="44" height="44" data-k="'+k+'"></canvas><span>'+LEGEND[k]+'</span></div>';}).join('')+
    (WP.at?'<h4>Waypoint</h4><p class="gmWay">'+Math.round(WP.len||hyp(WP.at[0]-me().x,WP.at[1]-me().z))+' m '+(WP.car?'by road':'on foot')+'</p><button class="gmBtn" data-a="walk">Walk there by itself</button><button class="gmBtn" data-a="clear">Remove the waypoint</button>':'<p class="gmHint">'+(TOUCH?'Tap':'Click')+' the map to set a waypoint.</p>')+
    '<button class="gmBtn" data-a="home">Waypoint: home</button>';
  el.querySelectorAll('canvas').forEach(function(c){const g=c.getContext('2d'); blip(g,c.dataset.k,22,22,22,0);});}
menu.querySelector('.gmLegend').onclick=function(e){const b=e.target.closest('button'); if(!b) return; const a=b.dataset.a;
  if(a==='clear') setWay(null); else if(a==='home') setWay(HOME[0],HOME[1]);
  else if(a==='walk'&&WP.at){const w=WP.at; open(false); if(A.drive&&A.drive.on()) return; SM.walkTo(w[0],w[1]); return;}
  legend(); drawMap();};

/* ---------- stats ---------- */
function drawStats(){const p=menu.querySelector('[data-p="stats"]'), km=function(m){return m>=1000?(m/1000).toFixed(2)+' km':Math.round(m)+' m';};
  const rows=[['Distance on foot',km(STATS.walked)],['Distance driven',km(STATS.driven)],['Cars taken',STATS.cars],['Punches thrown',STATS.punches],['Jumps',STATS.jumps],['Most stars at once',STATS.wanted+' ★'],['Times busted',STATS.busted],['Times wasted',STATS.wasted],['₪ taken, all told','₪ '+STATS.stolen.toLocaleString('en')]];
  p.innerHTML='<div class="gmList">'+rows.map(function(r){return '<div class="gmRow"><span>'+r[0]+'</span><b>'+r[1]+'</b></div>';}).join('')+'</div>';}
/* ---------- settings ---------- */
function drawSettings(){const p=menu.querySelector('[data-p="settings"]');
  const slider=function(k,label){return '<div class="gmRow"><span>'+label+'</span><input type="range" min="0" max="1" step="0.05" data-k="'+k+'" value="'+SET[k]+'" aria-label="'+label+'"></div>';};
  const choice=function(k,label,opts){return '<div class="gmRow"><span>'+label+'</span><div class="gmSeg">'+opts.map(function(o){return '<button data-k="'+k+'" data-v="'+o[0]+'" aria-pressed="'+(String(SET[k])===String(o[0]))+'">'+o[1]+'</button>';}).join('')+'</div></div>';};
  p.innerHTML='<div class="gmList"><h4>Sound</h4>'+slider('master','Everything')+slider('radio','Car radio')+slider('sfx','Effects and the street')+choice('dispatch','Police radio voice',[['he','Hebrew'],['en','English'],['off','Off']])+
    '<h4>Picture</h4>'+choice('quality','Quality',[['high','High'],['medium','Medium'],['low','Low']])+choice('hud','On-screen display',[['true','Shown'],['false','Hidden']])+
    '<h4>Camera</h4>'+choice('dist','Distance',[['0.7','Near'],['1','Middle'],['1.5','Far']])+slider('sens','Mouse speed')+choice('invert','Up and down',[['false','Normal'],['true','Inverted']])+
    '<h4>The clock</h4>'+choice('clock','Time of day',[['game','Runs (a day in 48 min)'],['real','The real time'],['day','Always day'],['night','Always night']])+'</div>';}
menu.querySelector('[data-p="settings"]').addEventListener('input',function(e){const k=e.target.dataset.k; if(k) A.gtaSet.set(k,+e.target.value);});
menu.querySelector('[data-p="settings"]').addEventListener('click',function(e){const b=e.target.closest('button[data-k]'); if(!b) return; const k=b.dataset.k, v=b.dataset.v;
  A.gtaSet.set(k,typeof DEF[k]==='boolean'?v==='true':typeof DEF[k]==='number'?+v:v); drawSettings();});
/* ---------- keys ---------- */
function drawKeys(){const p=menu.querySelector('[data-p="keys"]');
  const K=TOUCH?[['Left stick','Walk, run when pushed far; in a car, gas, brake and steer'],['Right stick or a drag','Look around'],['Run · Jump · Punch','The round buttons'],['Car','Get in the nearest car, or out'],['Tap someone or something','What you can do with them'],['Radar','Opens this map']]:
    [['W A S D','Jog outside, walk at home; in a car, gas, brake and steer'],['Mouse','Look around (click the view to take the mouse, Esc gives it back)'],['Shift','Sprint (run at home)'],['Alt','Walk, outside'],['Space','Jump; in a car, the handbrake'],['F','Get in or out of a car'],['E','Do what is on offer'],['1 – 9','Pick from what is on offer'],['R or click','Punch'],['H','Horn'],['Q','Next radio station'],['C','Look behind you in a car'],['V','Camera: near, middle, far, your eyes'],['Wheel','Zoom the camera'],['M','This map'],['Esc','Let go of the mouse, close the map']];
  const GPK=[['Left stick','Walk; in a car, steer'],['Right stick','Look around'],['RT · LT','Run, aim the pistol; in a car, gas and brake'],['A · B · X · Y','Jump · do what is on offer · punch or shoot · car'],['LB · RB','Weapon · radio station'],['Start · Back','This map · camera'],['Stick clicks','Horn · look back']];
  p.innerHTML='<div class="gmList">'+K.map(function(r){return '<div class="gmRow gmK"><b class="gmKey">'+r[0]+'</b><span>'+r[1]+'</span></div>';}).join('')+'<h4>A gamepad</h4>'+GPK.map(function(r){return '<div class="gmRow gmK"><b class="gmKey">'+r[0]+'</b><span>'+r[1]+'</span></div>';}).join('')+'</div>';}

/* ---------- your progress, kept in this browser as GTA keeps a save: money, weapons, armour, the time of day ---------- */
let loaded=false, saveT=0;
function load(){loaded=true; let s=null; try{s=JSON.parse(localStorage.getItem('haroe-gta-save')||'null');}catch(e){} if(!s) return;
  const G=A.floors&&A.floors.G, W=A.gtaWeapon; if(G&&typeof s.loot==='number') G.loot=Math.max(0,Math.floor(s.loot));
  if(W&&s.w){['bat','pistol'].forEach(function(k){W.has[k]=!!s.w[k];}); W.ammo=Math.max(0,s.ammo|0); W.clip=Math.max(0,Math.min(12,s.clip|0)); if(W.has[s.cur]) W.cur=s.cur;}
  if(typeof s.armour==='number') A.gtaArmor=Math.max(0,Math.min(100,s.armour)); if(typeof s.hour==='number'&&A.gtaSetHour&&SET.clock==='game') A.gtaSetHour(s.hour);
  if(A.floors&&A.floors.drawHud) A.floors.drawHud();}
function store(){const G=A.floors&&A.floors.G, W=A.gtaWeapon; try{localStorage.setItem('haroe-gta-save',JSON.stringify({loot:G?G.loot:0,w:W?{bat:W.has.bat,pistol:W.has.pistol}:null,ammo:W?W.ammo:0,clip:W?W.clip:0,cur:W?W.cur:'fists',armour:A.gtaArmor||0,hour:A.gtaHour?A.gtaHour():10}));}catch(e){}}

/* ---------- keys and the frame ---------- */
window.addEventListener('keydown',function(e){if(!A.simsOn||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return; const k=e.key.toLowerCase();
  if(!menu.hidden&&(k==='escape'||k==='m'||k==='p')){open(false); e.preventDefault(); e.stopImmediatePropagation();}
  else if(menu.hidden&&(k==='p')){open(true);}},true);
let mt=0;
A.frameFns.push(function(dt){
  if(!A.simsOn||!SM.player){if(!menu.hidden) open(false); if(beam.visible) beam.visible=false; return;}
  const m=me();
  if(WP.at&&m){if(!SM.player.lvl) beam.visible=true; beam.material.opacity=0.22+0.08*Math.sin(A.t*3);
    if(hyp(WP.at[0]-m.x,WP.at[1]-m.z)<(m.car?12:5)){setWay(null); if(SM.toast) SM.toast('You have reached the waypoint.');}
    else if(A.t-WP.t>(WP.car!==m.car?0:2.5)&&(offRoute(m)||A.t-WP.t>6)) refreshRoute();}
  /* stats: how far you went */
  if(m){if(STATS._x!=null){const d=hyp(m.x-STATS._x,m.z-STATS._z); if(d<30){if(m.car) STATS.driven+=d; else STATS.walked+=d;}} STATS._x=m.x; STATS._z=m.z;}
  statT+=dt; if(statT>10){statT=0; saveStats();}
  if(!loaded) load(); saveT+=dt; if(saveT>8){saveT=0; store();}
  if(!menu.hidden){mt+=dt; if(mt>0.25){mt=0; const ck=$('gmClock'), cs=$('gmCash'); if(ck) ck.textContent=A.gtaClock?A.gtaClock():''; if(cs) cs.textContent='₪ '+((A.floors&&A.floors.G.loot)||0).toLocaleString('en');}}
});
/* the menu draws itself again while it is open, so the blips blink */
setInterval(function(){if(!menu.hidden&&tab==='map'){drawMap();}},250);
showTab('map');
['tabDesign','tabClimate'].forEach(function(id){const b=$(id); if(b) b.addEventListener('click',function(){if(!menu.hidden) open(false);},true);});      /* leaving Sims mode from the panel closes the menu first */
A.gtaMapBase={canvas:base,PX:PX,TX0:TX0,TZ0:TZ0,TS:TS,COL:COL};
})();
