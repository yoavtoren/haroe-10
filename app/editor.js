/* Haroe 10 — Edit mode. Tap a piece to swap it for another IKEA piece or change its colour; long-press it to drag it;
   tap the floor, a wall, a shelf or the ceiling to add something there. Every plant, book, lamp and basket can be picked
   on its own, and anything (a part of a piece, the flat's own fittings, the walls, floor and ceiling) can be painted. Changes are kept per design and can be undone; Save keeps them in this browser, Reset goes back to the
   original, and a design can be shared as a link. */
(function(){
'use strict';
const A=window.APP, D=A.D, K=A.kit, CAT=A.CAT, P=A.pieces, S=A.state, scene=A.scene, R=Math.PI, H=D.H;
const $=function(id){return document.getElementById(id);};
const canvas=A.renderer.domElement;
const hex=function(c){return '#'+('000000'+(c>>>0).toString(16)).slice(-6);};
const clone=function(o){return o==null?null:JSON.parse(JSON.stringify(o));};
const esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});};
const INSIDE={living:1,kitchen:1,bed1:1,bed2:1,bath:1,wc:1};
for(const k in A.walls) A.walls[k].g.userData.wallKey=k;
let iso=null;              // the room you are working on by itself, or null for the whole flat

/* =====================================================================
   Your changes: kept per design and undoable; Save keeps them in this browser
   ===================================================================== */
const STORE='haroe10-edits-v1';
let seq=1, startDesign=null, savedSig='';
function E(d){const e=A.edits(d); e.uc=e.uc||{}; return e;}
function save(){try{localStorage.setItem(STORE,JSON.stringify({v:1,n:seq,e:A.EDITS,u:A.USER,d:S.design}));}catch(err){return false;} savedSig=sig(); renderBar(); return true;}
function sig(){                                                            // what Save keeps, empty parts left out, keys in order
  const e={}, u={};
  for(const d in A.EDITS){const x=A.EDITS[d], o={}; for(const k in x) if(x[k]&&Object.keys(x[k]).length) o[k]=x[k]; if(Object.keys(o).length) e[d]=o;}
  for(const k in A.USER) if(A.USER[k]&&Object.keys(A.USER[k]).length) u[k]=A.USER[k];
  return JSON.stringify({e:e,u:u},function(k,v){if(!v||typeof v!=='object'||Array.isArray(v)) return v; const o={}; Object.keys(v).sort().forEach(function(n){o[n]=v[n];}); return o;});
}
function unsaved(){return sig()!==savedSig;}
function tidy(e){
  e.t=e.t||{}; e.c=e.c||{}; e.f=e.f||{}; e.gone=e.gone||{}; e.items=e.items||{}; e.uc=e.uc||{};
  for(const k in e.t) if(!CAT[e.t[k]]) delete e.t[k];
  for(const k in e.items){const it=e.items[k]; if(!it||!CAT[it.t]) delete e.items[k];}
  return e;
}
(function load(){
  try{
    const j=JSON.parse(localStorage.getItem(STORE)||'null');
    if(j&&j.v===1){seq=j.n||1; for(const d in j.e||{}) if(A.DESIGNS[d]) A.EDITS[d]=tidy(j.e[d]); for(const k in j.u||{}) if(A.DESIGNS[k[0]]) A.USER[k]=j.u[k];}
    const ld=localStorage.getItem('haroe10-design'); if(ld&&A.DESIGNS[ld]) startDesign=ld;
  }catch(err){}
  savedSig=sig();
  const m=/[#&]e=([A-Za-z0-9_\-]+)/.exec(location.hash);                     // a shared design
  if(m){try{const j=JSON.parse(decodeURIComponent(escape(atob(m[1].replace(/-/g,'+').replace(/_/g,'/')))));
    if(j&&A.DESIGNS[j.d]){A.EDITS[j.d]=tidy(j.e||{}); for(const k in A.USER) if(k[0]===j.d) delete A.USER[k]; Object.assign(A.USER,j.u||{});
      for(const k in A.EDITS[j.d].items){const n=+k.slice(1); if(n>=seq) seq=n+1;} startDesign=j.d; A.sharedLoaded=true;}
    history.replaceState(null,'',location.pathname+location.search);}catch(err){}}
})();
setTimeout(function(){if(startDesign&&startDesign!==S.design) A.setDesign(startDesign,true); if(A.sharedLoaded) toast('Loaded the shared design. Press Save in Edit layout to keep it.');},0);
const undo=[];
function snap(){
  const d=S.design, u={}; for(const k in A.USER) if(k[0]===d) u[k]=A.USER[k];
  undo.push({d:d,e:JSON.stringify(A.EDITS[d]||null),u:JSON.stringify(u)}); if(undo.length>80) undo.shift(); renderBar();
}
function doUndo(){
  const s=undo.pop(); if(!s) return;
  const e=JSON.parse(s.e); if(e) A.EDITS[s.d]=e; else delete A.EDITS[s.d];
  for(const k in A.USER) if(k[0]===s.d) delete A.USER[k]; Object.assign(A.USER,JSON.parse(s.u));
  deselect(); if(s.d!==S.design) A.setDesign(s.d); else changed(); toast('Undone.');
}
function changed(){hlFor=null; A.layout(); renderBar();}
function items(d){return E(d||S.design).items;}

/* =====================================================================
   Pieces you add: on the floor or a wall they are pieces like any other; on top of something they ride on it
   ===================================================================== */
const att={};      // uid -> {g,key}: things standing on a piece
function syncItems(){
  for(const k in P){const p=P[k]; if(!p.item) continue; const e=A.EDITS[p.design], rec=e&&e.items[k];
    if(!rec||rec.on) A.dropPiece(k); else p.item=rec;}
  const e=A.EDITS[S.design]; if(!e) return;
  for(const k in e.items){const it=e.items[k]; if(it.on||P[k]) continue; const p=A.addPiece(k,it); p.design=S.design; p.cur=[it.x,it.z,it.r||0,0];}
}
function dropAtt(k){const a=att[k]; if(!a) return; A.forget(a.g); if(a.g.parent) a.g.parent.remove(a.g); const i=A.shops.indexOf(a.g); if(i>=0) A.shops.splice(i,1); delete att[k];}
function shopOf(d){return {name:d.n,q:d.q,site:d.site||'ikea',note:d.note||''};}
function syncAttached(){
  const e=A.EDITS[S.design], want={};
  if(e) for(const k in e.items){const it=e.items[k]; if(it.on&&P[it.on]) want[k]=it;}
  for(const k in att) if(!want[k]||att[k].g.parent!==P[want[k].on].g) dropAtt(k);
  for(const k in want){const it=want[k], par=P[it.on], key=it.t+'|'+(it.c||0)+'|'+JSON.stringify(it.f||null);
    let a=att[k]; if(a&&a.key!==key){dropAtt(k); a=null;}
    if(!a){const g=new THREE.Group(); g.userData.uid=k; par.g.add(g); const d=A.buildItem(g,it.t,it.c||0,it.f,par.builtRoom||'living');
      g.userData.shop=shopOf(d); A.shops.push(g); a=att[k]={g:g,key:key};}
    a.g.position.set(it.x,it.y,it.z); a.g.rotation.set(0,it.r||0,0);
  }
  for(let i=K.cushions.length-1;i>=0;i--) if(!attachedToScene(K.cushions[i])) K.cushions.splice(i,1);
}
function attachedToScene(o){for(;o;o=o.parent) if(o===scene) return true; return false;}
function shownObj(o){for(;o;o=o.parent){if(!o.visible) return false; if(o===scene) return true;} return false;}
A.findTurntable=function(){
  for(const k in att){const g=att[k].g; if(g.userData.disc&&shownObj(g)){const v=new THREE.Vector3(), q=new THREE.Quaternion(); g.getWorldPosition(v); g.getWorldQuaternion(q);
    const e=new THREE.Euler().setFromQuaternion(q,'YXZ'); return {to:[v.x,v.z,e.y,1],g:g};}}
  return null;
};

/* the loose things inside a piece or in the flat: plants, books, lamps, baskets. Each has a key so it can be hidden per design. */
function bakedOf(p){
  const tag=p.built||'custom'; if(p._bk===tag) return p._bl;
  const out=[]; let i=0;
  (function walk(o){for(let j=0;j<o.children.length;j++){const c=o.children[j]; if(c.userData.uid) continue;
    if(c.userData.decor){c.userData.bkey=p.id+':'+(p.type||'')+'#'+(i++); out.push(c);} else walk(c);}})(p.g);
  p._bk=tag; p._bl=out; return out;
}
const bx=new THREE.Box3(), v3=new THREE.Vector3();
function posKey(pre,o){bx.setFromObject(o); bx.getCenter(v3); return pre+Math.round(v3.x*100)+','+Math.round(v3.y*100)+','+Math.round(v3.z*100);}
let house=null;            // decor and shop items that belong to the flat itself (house.js), not to a piece
function houseThings(){
  if(house) return house; house=[]; scene.updateMatrixWorld(true);
  (function walk(o){for(let j=0;j<o.children.length;j++){const c=o.children[j]; if(c.userData.piece||c.userData.uid||c===hl) continue;
    if(c.userData.decor){c.userData.bkey=posKey('h#',c); house.push(c);} else{if(c.userData.shop){c.userData.bkey=posKey('s#',c); house.push(c);} walk(c);}}})(scene);
  return house;
}
function applyGone(){
  const gone=(A.EDITS[S.design]||{}).gone||{};
  for(const id in P){const p=P[id]; if(p.to[3]<1&&p.cur[3]<0.02) continue; bakedOf(p).forEach(function(g){g.visible=!gone[g.userData.bkey];});}
  if(house||Object.keys(gone).some(function(k){return k[1]==='#';})) houseThings().forEach(function(o){
    if(gone[o.userData.bkey]){o.visible=false; o.userData.goneHid=true;}
    else if(o.userData.goneHid){o.userData.goneHid=false; if(!o.userData.only) o.visible=true;}
  });
}
A.beforeLayout=syncItems;
A.onLayout=function(){syncAttached(); applyGone(); if(A.paint) A.paint.apply(); if(sel&&!selObj()) deselect(); if(iso) isoBuild();};

/* =====================================================================
   Picking: what is under the finger
   ===================================================================== */
const ray=new THREE.Raycaster(), ndc=new THREE.Vector2(), floorPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0);
function aim(e){const r=canvas.getBoundingClientRect(); ndc.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1); ray.setFromCamera(ndc,A.camera);}
function aimCentre(){ndc.set(0,-0.15); ray.setFromCamera(ndc,A.camera);}
function skip(o){
  if(!o.isMesh||o.userData.hl||!o.layers.test(A.camera.layers)) return true;
  const m=Array.isArray(o.material)?o.material[0]:o.material;
  return !m||m.blending===THREE.AdditiveBlending||m.visible===false;
}
function pickAll(list,excl){
  const hits=ray.intersectObjects(list||scene.children,true);
  for(let i=0;i<hits.length;i++){const h=hits[i], o=h.object;
    if(skip(o)||!shownObj(o)) continue;
    if(excl&&isIn(o,excl)) continue;
    if(h.point.y>A.cut.constant+0.01&&A.cut.constant<50) continue;      // above the cut when walls are cut low
    if(iso&&!inClip(h.point)) continue;                                 // cut away round the room you are working on
    return classify(h);
  }
  return null;
}
function isIn(o,root){for(;o;o=o.parent) if(o===root) return true; return false;}
function classify(h){
  const o=h.object, n=h.face?h.face.normal.clone().transformDirection(o.matrixWorld):new THREE.Vector3(0,1,0);
  const c={h:h,o:o,n:n,point:h.point.clone(),pieceId:null,decor:null,item:null,wall:null,shopObj:null};
  for(let q=o;q;q=q.parent){
    if(!c.item&&q.userData.uid) c.item=q;
    if(!c.decor&&!c.item&&!c.pieceId&&q.userData.decor) c.decor=q;
    if(!c.pieceId&&q.userData.piece) c.pieceId=q.userData.piece;
    if(q.userData.wallKey) c.wall=q.userData.wallKey;
    if(!c.shopObj&&q.userData.shop) c.shopObj=q;
  }
  if(c.wall&&A.walls[c.wall]){const w=A.walls[c.wall]; c.n.set(w.n[0],0,w.n[1]);}
  return c;
}
function insideFlat(x,z){
  for(const k in INSIDE){const rs=A.rooms[k].rs; for(let i=0;i<rs.length;i++){const r=rs[i]; if(x>r[0]+0.02&&x<r[1]-0.02&&z>r[2]+0.02&&z<r[3]-0.02) return k;}}
  return null;
}
function inWork(x,z){const r=insideFlat(x,z); return !!r&&(!iso||r===iso);}      // inside the flat, and in the room you are working on
function defOfPiece(p){return p&&p.def?p.def:null;}
function isThingPiece(p){const d=defOfPiece(p); return !!(d&&(d.cat==='plant'||d.cat==='decor'||d.cat==='lamp'||d.place==='top'));}
function targetOf(c){
  if(!c) return null;
  if(c.item) return {k:'att',uid:c.item.userData.uid};
  const p=c.pieceId&&P[c.pieceId];
  if(p){if(c.decor&&!isThingPiece(p)){bakedOf(p); return {k:'baked',g:c.decor,key:c.decor.userData.bkey,pid:p.id};} return {k:'piece',id:p.id};}
  if(c.decor){houseThings(); return {k:'baked',g:c.decor,key:c.decor.userData.bkey,pid:null};}
  if(c.shopObj&&!c.wall){houseThings(); if(c.shopObj.userData.bkey) return {k:'fixed',obj:c.shopObj,key:c.shopObj.userData.bkey};}
  return null;
}
function spotOf(c){
  if(!c) return null;
  if(c.wall&&Math.abs(c.n.y)<0.3){const w=A.walls[c.wall]; if(!INSIDE[w.room]) return null; return {kind:'wall',wall:c.wall,point:c.point,n:[w.n[0],w.n[1]]};}
  if(c.n.y<-0.7) return inWork(c.point.x,c.point.z)?{kind:'ceil',point:c.point}:null;
  if(c.n.y>0.7){
    if(c.o.userData.floor||c.point.y<0.03) return inWork(c.point.x,c.point.z)?{kind:'floor',point:c.point}:null;
    return inWork(c.point.x,c.point.z)?{kind:'top',point:c.point,pieceId:c.pieceId&&P[c.pieceId]&&!P[c.pieceId].flat?c.pieceId:null}:null;
  }
  const f=new THREE.Vector3(); if(!ray.ray.intersectPlane(floorPlane,f)) return null;
  return inWork(f.x,f.z)?{kind:'floor',point:f}:null;
}

/* =====================================================================
   Selection, with a thin yellow rim round it
   ===================================================================== */
let sel=null, selHit=null;
const hl=new THREE.Group(); hl.visible=false; hl.userData.nc=true; hl.userData.hl=true; scene.add(hl);
const hlMat=new THREE.MeshBasicMaterial({color:0xF4D53A,side:THREE.BackSide}), RIM=0.007;
let hlFor=null, hlSrc=[];
const tb=new THREE.Box3(), cv=new THREE.Vector3(), sv=new THREE.Vector3(), mA=new THREE.Matrix4(), mB=new THREE.Matrix4();
function selObj(){
  if(!sel) return null;
  if(sel.k==='piece') return P[sel.id]?P[sel.id].g:null;
  if(sel.k==='att') return att[sel.uid]?att[sel.uid].g:null;
  return sel.g||sel.obj||null;
}
function solid(o){if(!o.isMesh||!o.geometry||o.userData.floor||o.userData.hl) return false; const m=Array.isArray(o.material)?o.material[0]:o.material; return !m.transparent&&!m.alphaTest&&m.side===THREE.FrontSide;}
function gather(o,out){if(!o.visible) return; if(solid(o)) out.push(o); for(let i=0;i<o.children.length;i++) gather(o.children[i],out);}
A.frameFns.push(function(){
  const o=selObj();
  if(!o||!S.edit||!shownObj(o)){hl.visible=false; return;}
  if(o!==hlFor){hlFor=o; hlSrc=[]; while(hl.children.length) hl.remove(hl.children[0]); gather(o,hlSrc);
    hlSrc.forEach(function(m){if(!m.geometry.boundingBox) m.geometry.computeBoundingBox(); const q=new THREE.Mesh(m.geometry,hlMat); q.matrixAutoUpdate=false; q.frustumCulled=false; q.userData.hl=true; hl.add(q);});}
  hlSrc.forEach(function(m,i){
    const g=m.geometry.boundingBox; g.getCenter(cv); g.getSize(sv);
    mA.makeTranslation(cv.x,cv.y,cv.z); mB.makeScale(1+2*RIM/Math.max(0.02,sv.x),1+2*RIM/Math.max(0.02,sv.y),1+2*RIM/Math.max(0.02,sv.z)); mA.multiply(mB);
    mB.makeTranslation(-cv.x,-cv.y,-cv.z); mA.multiply(mB); hl.children[i].matrix.multiplyMatrices(m.matrixWorld,mA); hl.children[i].matrixWorldNeedsUpdate=true;
    hl.children[i].visible=m.layers.test(A.camera.layers);      // no rim round a part that has stepped aside
  });
  hl.visible=hlSrc.length>0;
});
function same(a,b){return a&&b&&a.k===b.k&&a.id===b.id&&a.uid===b.uid&&a.key===b.key;}
function select(t,c){sel=t; selHit=c||null; hlFor=null;}
function deselect(){sel=null; selHit=null; hlFor=null; hl.visible=false; closeSheet();}
A.clearPick=function(){deselect(); shopCard(null);};

/* =====================================================================
   Where things go: positions, walls, snapping
   ===================================================================== */
const ROOMWALL={};
function interiorWalls(){const out=[]; for(const k in A.walls){const w=A.walls[k]; if(INSIDE[w.room]) out.push(w);} return out;}
function inHole(w,u){for(let i=0;i<w.holes.length;i++){const h=w.holes[i]; if(u>h[0]-0.05&&u<h[1]+0.05) return true;} return false;}
/* a piece set down near a wall turns its back to it */
function snapToWall(x,z,dd,reach){
  let best=null, bd=reach;
  interiorWalls().forEach(function(w){
    const dx=x-w.a[0], dz=z-w.a[1], off=dx*w.n[0]+dz*w.n[1], u=dx*w.d[0]+dz*w.d[1];
    if(off<-0.05||off>bd||u<0.1||u>w.len-0.1||inHole(w,u)) return;
    bd=off; best={w:w,u:u};
  });
  if(!best) return null;
  const w=best.w, gap=dd/2+0.012;
  return {x:w.a[0]+w.d[0]*best.u+w.n[0]*gap, z:w.a[1]+w.d[1]*best.u+w.n[1]*gap, r:Math.atan2(-w.n[1],w.n[0])};
}
function faceCamera(x,z){const c=A.camera.position, a=Math.atan2(-(c.z-z),c.x-x); return Math.round(a/(R/2))*(R/2);}
function sizeOf(t,f){const d=CAT[t]; if(d.eket){const b=A.eketBounds(f||d.cfg); return {w:b.w,d:((f||d.cfg).d||35)/100,h:b.h+((f||d.cfg).base==='legs'?0.1:0)};} return {w:d.w/100,d:d.d/100,h:d.h/100};}
const SNAPCATS={sofa:1,media:1,shelf:1,eket:1,hall:1,bed:1,ward:1,bath:1};

/* =====================================================================
   Solid furniture (a setting, on unless you turn it off): a piece you drag, turn, add or swap stops at the walls,
   at the flat's own fittings and at other furniture. Rugs only stop at walls. Something that already overlaps
   where it stands may move out, but not further in.
   ===================================================================== */
const SOLID='haroe10-solid', TOL=0.004;
let solidOn=true; try{solidOn=localStorage.getItem(SOLID)!=='0';}catch(err){}
/* a shape on the floor: its corners, the axes to test, the heights it spans, and its bounding box */
function shape(pts,ax,y0,y1){
  let x0=1e9, x1=-1e9, z0=1e9, z1=-1e9;
  for(let i=0;i<pts.length;i++){const p=pts[i]; if(p[0]<x0) x0=p[0]; if(p[0]>x1) x1=p[0]; if(p[1]<z0) z0=p[1]; if(p[1]>z1) z1=p[1];}
  return {pts:pts,ax:ax,y0:y0,y1:y1,x0:x0,x1:x1,z0:z0,z1:z1};
}
/* a rectangle: centre, its first axis, half sizes along it and across it */
function quad(cx,cz,ux,uz,hu,hv,y0,y1){
  const vx=-uz, vz=ux;
  return shape([[cx+ux*hu+vx*hv,cz+uz*hu+vz*hv],[cx-ux*hu+vx*hv,cz-uz*hu+vz*hv],[cx-ux*hu-vx*hv,cz-uz*hu-vz*hv],[cx+ux*hu-vx*hv,cz+uz*hu-vz*hv]],[[ux,uz],[vx,vz]],y0,y1);
}
function boxShape(b){return quad((b.min.x+b.max.x)/2,(b.min.z+b.max.z)/2,1,0,(b.max.x-b.min.x)/2,(b.max.z-b.min.z)/2,b.min.y,b.max.y);}
/* the box a piece takes up in its own frame, and that box set down at x, z, turned r and lifted y */
function poseShape(lb,x,z,r,y){
  const c=Math.cos(r), s=Math.sin(r), lx=(lb.min.x+lb.max.x)/2, lz=(lb.min.z+lb.max.z)/2;
  return quad(x+lx*c+lz*s,z-lx*s+lz*c,c,-s,(lb.max.x-lb.min.x)/2,(lb.max.z-lb.min.z)/2,y+lb.min.y,y+lb.max.y);
}
/* how far a must move to clear b; 0 when they are apart */
function proj(pts,a){let lo=1e9, hi=-1e9; for(let i=0;i<pts.length;i++){const d=pts[i][0]*a[0]+pts[i][1]*a[1]; if(d<lo) lo=d; if(d>hi) hi=d;} return [lo,hi];}
function pen(a,b){
  if(a.x1<=b.x0||b.x1<=a.x0||a.z1<=b.z0||b.z1<=a.z0||Math.min(a.y1,b.y1)-Math.max(a.y0,b.y0)<=TOL) return 0;
  let best=1e9;
  for(let k=0;k<2;k++){const ax=k?b.ax:a.ax;
    for(let i=0;i<ax.length;i++){const p=proj(a.pts,ax[i]), q=proj(b.pts,ax[i]), o=Math.min(p[1]-q[0],q[1]-p[0]); if(o<=0) return 0; if(o<best) best=o;}}
  return best;
}
/* everything a shape passes over on its way from a to b (same turn and height): the hull of both */
function hull(pts){
  pts=pts.slice().sort(function(p,q){return p[0]-q[0]||p[1]-q[1];});
  const cr=function(o,a,b){return (a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);}, lo=[], up=[];
  for(let i=0;i<pts.length;i++){while(lo.length>1&&cr(lo[lo.length-2],lo[lo.length-1],pts[i])<=0) lo.pop(); lo.push(pts[i]);}
  for(let i=pts.length-1;i>=0;i--){while(up.length>1&&cr(up[up.length-2],up[up.length-1],pts[i])<=0) up.pop(); up.push(pts[i]);}
  lo.pop(); up.pop(); return lo.concat(up);
}
function sweep(a,b){
  const pts=hull(a.pts.concat(b.pts)), ax=[];
  for(let i=0;i<pts.length;i++){const p=pts[i], q=pts[(i+1)%pts.length], dx=q[0]-p[0], dz=q[1]-p[1], l=Math.hypot(dx,dz); if(l>1e-6) ax.push([-dz/l,dx/l]);}
  return shape(pts,ax,b.y0,b.y1);
}
function solidMat(o){const m=Array.isArray(o.material)?o.material[0]:o.material; return !!m&&m.visible!==false&&m.blending!==THREE.AdditiveBlending&&!(m.transparent&&m.depthWrite===false);}
const lbB=new THREE.Box3();
function localBox(g){
  const pos=g.position.clone(), ry=g.rotation.y, sc=g.scale.clone(), out=new THREE.Box3();
  g.position.set(0,0,0); g.rotation.y=0; g.scale.set(1,1,1); g.updateMatrixWorld(true);
  (function walk(o){if((!o.visible&&o!==g)||o.userData.hl) return;          // the piece itself may still be fading in
    if(o.isMesh&&o.geometry&&!o.userData.floor&&solidMat(o)){if(!o.geometry.boundingBox) o.geometry.computeBoundingBox(); lbB.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld); if(isFinite(lbB.min.x)) out.union(lbB);}
    for(let i=0;i<o.children.length;i++) walk(o.children[i]);})(g);
  g.position.copy(pos); g.rotation.y=ry; g.scale.copy(sc); g.updateMatrixWorld(true);
  return out;
}
/* the walls of the flat, as thin slabs; the front door stays shut, other doorways stay open below their lintels */
function wallShapes(){
  const out=[];
  for(const k in A.walls){const w=A.walls[k]; if(!INSIDE[w.room]) continue;
    const hs=(k==='end'?[]:w.holes).slice().sort(function(p,q){return p[0]-q[0];});
    const seg=function(u0,u1,y0){if(u1-u0<0.005) return; const um=(u0+u1)/2, s=quad(w.a[0]+w.d[0]*um,w.a[1]+w.d[1]*um,w.d[0],w.d[1],(u1-u0)/2,0.002,y0,H+1);
      if(!y0) s.seg=[w.a[0]+w.d[0]*u0,w.a[1]+w.d[1]*u0,w.a[0]+w.d[0]*u1,w.a[1]+w.d[1]*u1]; out.push(s);};
    let u=0; hs.forEach(function(h){seg(u,h[0],0); seg(h[0],h[1],h[2]||2.05); u=h[1];}); seg(u,w.len,0);
  }
  return out;
}
function inFlatBox(b){
  for(const k in INSIDE){const rs=A.rooms[k].rs; for(let i=0;i<rs.length;i++){const r=rs[i]; if(b.max.x>r[0]+0.005&&b.min.x<r[1]-0.005&&b.max.z>r[2]+0.005&&b.min.z<r[3]-0.005) return true;}}
  return false;
}
/* the flat's own fittings: kitchen, fridge, beds, bathroom, anything built in that is showing */
function fixedShapes(){
  const out=[]; scene.updateMatrixWorld(true);
  (function walk(o){
    if(!o.visible||o.userData.nc||o.userData.piece||o.userData.uid||o.userData.hl) return;
    if(o.isMesh&&o.geometry&&!o.userData.floor&&solidMat(o)){
      if(!o.geometry.boundingBox) o.geometry.computeBoundingBox(); bx.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld);
      if(bx.max.y>0.03&&bx.min.y<H-0.02&&(bx.max.x-bx.min.x>0.03||bx.max.z-bx.min.z>0.03)&&inFlatBox(bx)) out.push(boxShape(bx));
    }
    for(let i=0;i<o.children.length;i++) walk(o.children[i]);
  })(scene);
  return out;
}
function pieceShapes(self){
  const out=[];
  for(const k in P){const q=P[k]; if(k===self||q.to[3]<1||q.flat) continue; const lb=localBox(q.g); if(!lb.isEmpty()) out.push(poseShape(lb,q.to[0],q.to[1],q.to[2],q.y||0));}
  return out;
}
/* what piece t has to keep clear of, and how far into each thing it already reaches at pose [x,z,r,y] (nothing, when strict) */
function solidCtx(t,pose,strict){
  if(!solidOn||!t||t.k!=='piece'||!P[t.id]) return null;
  const p=P[t.id], lb=localBox(p.g); if(lb.isEmpty()) return null;
  const obs=p.flat?wallShapes():wallShapes().concat(fixedShapes(),pieceShapes(t.id)), here=poseShape(lb,pose[0],pose[1],pose[2],pose[3]);
  return {id:t.id,lb:lb,obs:obs,pen0:obs.map(function(o){return strict?0:pen(here,o);})};
}
function poseOf(p,live){return live?[p.cur[0],p.cur[1],p.cur[2],p.y||0]:[p.to[0],p.to[1],p.to[2],p.y||0];}
/* can the piece go from pose a to pose b (a null: just stand at b)? */
function canMove(ctx,a,b){
  const lb=ctx.lb, end=poseShape(lb,b[0],b[1],b[2],b[3]), same=a&&Math.abs(a[2]-b[2])<1e-9, level=same&&a[3]===b[3];
  const sw=level?sweep(poseShape(lb,a[0],a[1],a[2],a[3]),end):end;
  let mid=null;
  const steps=function(){if(mid) return mid; mid=[]; if(!same) return mid;      // poses every 2 cm along the way
    const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1],b[3]-a[3])/0.02); for(let j=1;j<n;j++){const t=j/n; mid.push(poseShape(lb,a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,b[2],a[3]+(b[3]-a[3])*t));}
    return mid;};
  for(let i=0;i<ctx.obs.length;i++){const o=ctx.obs[i], p0=ctx.pen0[i];
    if(p0>TOL){if(pen(end,o)>p0+0.002) return false; const m=steps(); for(let j=0;j<m.length;j++) if(pen(m[j],o)>p0+0.002) return false;}
    else{if(pen(sw,o)>TOL) return false; if(same&&!level){const m=steps(); for(let j=0;j<m.length;j++) if(pen(m[j],o)>TOL) return false;}}
  }
  return true;
}
function lerpPose(a,b,t){return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,b[2],a[3]+(b[3]-a[3])*t];}
/* as far from a toward b as it can go */
function advance(ctx,a,b){
  if(canMove(ctx,a,b)) return b;
  let lo=0, hi=1; for(let i=0;i<9;i++){const m=(lo+hi)/2; if(canMove(ctx,a,lerpPose(a,b,m))) lo=m; else hi=m;}
  return lo>0?lerpPose(a,b,lo):a;
}
/* blocked: slide along what is in the way, one direction at a time */
function slide(ctx,a,b){
  const q=advance(ctx,a,b); if(q===b) return b;
  const go=function(order){let s=q; order.forEach(function(i){if(s[i]===b[i]) return; const t=s.slice(); t[i]=b[i]; s=advance(ctx,s,t);}); return s;};
  const s1=go([0,1,3]), s2=go([1,0,3]), d=function(s){return Math.hypot(s[0]-b[0],s[1]-b[1],s[3]-b[3]);};
  return d(s1)<=d(s2)?s1:s2;
}
function crossesWall(ctx,a,b){
  const side=function(p,q,x,z){return (q[0]-p[0])*(z-p[1])-(q[1]-p[1])*(x-p[0]);};
  for(let i=0;i<ctx.obs.length;i++){const s=ctx.obs[i].seg; if(!s) continue; const p=[s[0],s[1]], q=[s[2],s[3]];
    if(side(p,q,a[0],a[1])*side(p,q,b[0],b[1])<0&&side(a,b,p[0],p[1])*side(a,b,q[0],q[1])<0) return true;}
  return false;
}
/* after an add, a swap or a turn: a piece that now overlaps something moves to the nearest free spot it can reach
   without going through a wall. pre: what it was clear of before (else it has to be clear of everything).
   Returns 'ok', 'moved' or 'stuck'. */
function settle(t,reach,pre){
  if(!solidOn||!t||t.k!=='piece'||!P[t.id]) return 'ok';
  const p=P[t.id], a=poseOf(p), ctx=pre?Object.assign({},pre,{lb:localBox(p.g)}):solidCtx(t,a,true);
  if(!ctx||ctx.lb.isEmpty()||canMove(ctx,null,a)) return 'ok';
  const wallish=p.def&&p.def.place==='wall', r=a[2], al=[Math.sin(r),Math.cos(r)], tall=ctx.lb.max.y-ctx.lb.min.y;
  const here=poseShape(ctx.lb,a[0],a[1],a[2],a[3]), m=reach+0.05, near={lb:ctx.lb,obs:[],pen0:[]};      // only what is within reach
  ctx.obs.forEach(function(o,i){if(o.seg||(o.x1>here.x0-m&&o.x0<here.x1+m&&o.z1>here.z0-m&&o.z0<here.z1+m)){near.obs.push(o); near.pen0.push(ctx.pen0[i]);}});
  for(let rr=0.03;rr<=reach+1e-6;rr+=0.03){const n=Math.max(8,Math.ceil(2*R*rr/0.03));
    for(let i=0;i<n;i++){const an=i/n*2*R, cu=Math.cos(an)*rr, sv=Math.sin(an)*rr;
      const b=wallish?[a[0]+al[0]*cu,a[1]+al[1]*cu,r,Math.max(0.02,Math.min(H-tall-0.02,a[3]+sv))]:[a[0]+cu,a[1]+sv,r,a[3]];      // a wall piece slides along its wall and up or down
      if((!wallish&&!insideFlat(b[0],b[1]))||crossesWall(near,a,b)||!canMove(near,null,b)) continue;
      setPos(t,b[0],b[1],b[2],b[3]); return 'moved';}}
  return 'stuck';
}
function setSolid(on){
  solidOn=on; $('cSolid').checked=on; try{localStorage.setItem(SOLID,on?'1':'0');}catch(err){}
}
$('cSolid').checked=solidOn;
$('cSolid').onchange=function(e){setSolid(e.target.checked); toast(solidOn?'Solid furniture: pieces now stop at walls, fittings and each other.':'Pieces can now pass through anything.');};

/* =====================================================================
   Changing things
   ===================================================================== */
function isBuiltIn(p){return p&&!p.item;}
function curPos(t){
  if(t.k==='piece'){const p=P[t.id]; return [p.to[0],p.to[1],p.to[2],p.y||0];}
  if(t.k==='att'){const it=items()[t.uid]; return [it.x,it.z,it.r||0,it.y];}
  return null;
}
function setPos(t,x,z,r,y){
  if(t.k==='piece'){const p=P[t.id]; if(p.item){p.item.x=x; p.item.z=z; p.item.r=r; p.item.y=y;} else{const k=A.ukey(); (A.USER[k]||(A.USER[k]={}))[t.id]=[x,z,r,y];}}
  else if(t.k==='att'){const it=items()[t.uid]; it.x=x; it.z=z; it.r=r; it.y=y;}
}
/* type, colour and settings a target shows now */
function specOf(t){
  if(t.k==='piece'){const p=P[t.id]; if(p.item) return {t:p.item.t,c:p.item.c||0,f:p.item.f}; if(p.type0){const w=A.wantOf(p,S.design); return {t:w[0],c:w[1],f:w[2]};} return null;}
  if(t.k==='att'){const it=items()[t.uid]; return {t:it.t,c:it.c||0,f:it.f};}
  return null;
}
function setColour(t,ci,byUser){
  const e=E(S.design);
  if(t.k==='piece'){const p=P[t.id]; if(p.item) p.item.c=ci; else{e.c[t.id]=ci; if(byUser) e.uc[t.id]=1; else delete e.uc[t.id];}}
  else if(t.k==='att') items()[t.uid].c=ci;
  if(byUser&&t.k!=='piece') (items()[t.uid||t.id]||{}).uc=1;
  if(A.paint) A.paint.clearThing(t);                                    // an IKEA colour replaces any colour painted on it
}
function setCfg(t,f){
  const e=E(S.design);
  if(t.k==='piece'){const p=P[t.id]; if(p.item) p.item.f=f; else e.f[t.id]=f;}
  else if(t.k==='att') items()[t.uid].f=f;
}
/* keep a piece's back where it was when it gets deeper or shallower */
function keepBack(x,z,r,oldD,newD){
  const back=[x-Math.cos(r)*oldD/2, z+Math.sin(r)*oldD/2];
  const near=interiorWalls().some(function(w){const off=(back[0]-w.a[0])*w.n[0]+(back[1]-w.a[1])*w.n[1], u=(back[0]-w.a[0])*w.d[0]+(back[1]-w.a[1])*w.d[1]; return off>-0.05&&off<0.08&&u>-0.1&&u<w.len+0.1;});
  if(!near) return [x,z];
  const s=(newD-oldD)/2; return [x+Math.cos(r)*s, z-Math.sin(r)*s];
}
/* how deep a hand-drawn piece is, front to back, in its own frame */
function depthOf(g){
  const p=g.position.clone(), r=g.rotation.y, s=g.scale.clone(); g.position.set(0,0,0); g.rotation.y=0; g.scale.set(1,1,1); g.updateMatrixWorld(true);
  bx.setFromObject(g); const d=bx.max.x-bx.min.x; g.position.copy(p); g.rotation.y=r; g.scale.copy(s); g.updateMatrixWorld(true); return isFinite(d)&&d>0?d:0.5;
}
function swapTo(t,nt){
  const pre=t.k==='piece'?solidCtx(t,poseOf(P[t.id])):null;
  snap(); const e=E(S.design), nd=CAT[nt]; if(A.paint) A.paint.clearThing(t);
  const sp=specOf(t), oldD=sp?sizeOf(sp.t,sp.f).d:t.k==='piece'?depthOf(P[t.id].g):0.5, newD=sizeOf(nt,nd.cfg).d;
  if(t.k==='piece'){
    const p=P[t.id], pos=curPos(t), q=keepBack(pos[0],pos[1],pos[2],oldD,newD);
    if(p.item){p.item.t=nt; p.item.c=0; p.item.f=clone(nd.cfg)||null; delete p.item.uc; p.item.x=q[0]; p.item.z=q[1];}
    else if(p.type0){const base=A.SPEC[S.design]&&A.SPEC[S.design][p.id]?A.SPEC[S.design][p.id][0]:p.type0;
      if(nt===base) delete e.t[p.id]; else e.t[p.id]=nt; delete e.c[p.id]; delete e.f[p.id]; delete e.uc[p.id];
      if(q[0]!==pos[0]||q[1]!==pos[1]) setPos(t,q[0],q[1],pos[2],pos[3]);}
    else{                                     // a piece drawn by hand (what is there today): it goes, and the new one takes its place
      e.gone[p.id]=1; const uid=newItem({t:nt,c:0,f:clone(nd.cfg)||null,x:q[0],z:q[1],r:pos[2],y:nd.place==='wall'?pos[3]:0,seatAs:p.id==='sofa'?'sofa':undefined});
      changed(); fit({k:'piece',id:uid},0.8,pre,false,true); select({k:'piece',id:uid}); openItem(); return;}
  }else if(t.k==='att'){const it=items()[t.uid]; it.t=nt; it.c=0; it.f=clone(nd.cfg)||null;}
  else if(t.k==='baked'||t.k==='fixed'){replaceLoose(t,nt,0); return;}
  changed(); hlFor=null; if(t.k==='piece') fit(t,0.8,pre,false,true); openItem();
}
/* with solid furniture on, a piece that now overlaps something moves clear. clash: prints on the wall make room for what still does not fit. */
function fit(t,reach,pre,quiet,clash){
  const s=settle(t,reach,pre); if(s==='moved'){changed(); if(!quiet) setTimeout(function(){toast('Moved it a little so it does not overlap anything.');},50);}
  if(s==='stuck') setTimeout(function(){toast('There is no free spot for it nearby, so it overlaps. Long-press it to drag it clear.');},60);
  if(clash&&(s==='stuck'||(s==='ok'&&!solidOn))) clearClash(t.id);
}
/* a tall piece set against a wall takes down the prints or shelves hanging where it now stands */
function footBox(p){
  const d=p.def, sz=sizeOf(p.type,p.cfg), r=p.to[2], c=Math.abs(Math.cos(r)), s=Math.abs(Math.sin(r)), hx=c*sz.d/2+s*sz.w/2, hz=s*sz.d/2+c*sz.w/2, y=p.y||0;
  return new THREE.Box3(new THREE.Vector3(p.to[0]-hx,y+0.01,p.to[1]-hz),new THREE.Vector3(p.to[0]+hx,y+sz.h-0.01,p.to[1]+hz));
}
function clearClash(id){
  const p=P[id]; if(!p||!p.def||p.def.place==='wall'||p.def.place==='ceil'||p.flat) return;
  const a=footBox(p), e=E(S.design), hit=[];
  for(const k in P){const q=P[k]; if(k===id||q.to[3]<1||!q.def||q.def.place!=='wall') continue;
    q.g.updateMatrixWorld(true); if(a.intersectsBox(new THREE.Box3().setFromObject(q.g))){if(q.item) delete e.items[k]; else e.gone[k]=1; hit.push(q.def.n);}}
  if(hit.length){changed(); setTimeout(function(){toast('Took down the '+hit.join(' and ').toLowerCase()+' to make room. Undo brings them back.');},50);}
}
function newItem(rec){const uid='u'+(seq++); items()[uid]=rec; return uid;}
/* a plant, book row or lamp that came with a piece (or with the flat): hide it and put a piece of your choice in its place */
function looseKind(g){
  const k=g.userData.decor; bx.setFromObject(g); const h=bx.max.y-bx.min.y, floor=bx.min.y<0.05;
  if(k==='plant'&&floor&&h>0.6) return h>1.3?'fiddle':'monstera';
  return {plant:'smallPlant',pothos:'pothosPot',hanging:'hangingPlant',books:'books',stack:'bookStack',candle:'candles',lamp:'tableLamp',insert:'basket',vase:'vase',speaker:'speaker',cushion:'cushion',turntable:'turntable',record:'recordCrate'}[k]||'smallPlant';
}
function replaceLoose(t,nt,ci,keepSel){
  snap(); const e=E(S.design), o=t.g||t.obj; e.gone[t.key]=1;
  bx.setFromObject(o); const c=bx.getCenter(new THREE.Vector3()), bottom=new THREE.Vector3(c.x,bx.min.y,c.z), d=CAT[nt];
  let uid;
  if(t.k==='baked'&&t.pid&&P[t.pid]&&d.place!=='ceil'&&d.place!=='floor'){
    const pg=P[t.pid].g; pg.updateMatrixWorld(true); const l=pg.worldToLocal(bottom.clone());
    uid=newItem({t:nt,c:ci||0,f:clone(d.cfg)||null,on:t.pid,x:l.x,y:l.y,z:l.z,r:0});
  }else{
    const q=new THREE.Quaternion(); o.getWorldQuaternion(q); const r=new THREE.Euler().setFromQuaternion(q,'YXZ').y;
    uid=newItem({t:nt,c:ci||0,f:clone(d.cfg)||null,x:c.x,z:c.z,r:t.k==='fixed'?r:faceCamera(c.x,c.z),y:d.place==='top'?Math.max(0,bx.min.y):d.place==='wall'?bx.min.y:0});
  }
  changed(); const it=items()[uid]; select(it.on?{k:'att',uid:uid}:{k:'piece',id:uid}); openItem();
}
function removeSel(){
  if(!sel||sel.k==='part') return; snap(); const e=E(S.design);
  if(sel.k==='piece'){const p=P[sel.id]; if(p.item){delete e.items[sel.id]; for(const k in e.items) if(e.items[k].on===sel.id) delete e.items[k];} else e.gone[sel.id]=1;}
  else if(sel.k==='att') delete e.items[sel.uid];
  else e.gone[sel.key]=1;
  deselect(); changed(); toast('Removed. Undo brings it back.');
}
function duplicateSel(){
  if(!sel) return; const sp=specOf(sel); if(!sp){toast('This one cannot be copied. Swap it for an IKEA piece first.'); return;}
  snap(); const pos=curPos(sel), sz=sizeOf(sp.t,sp.f), off=sz.w+0.06, r=pos[2];
  const rec={t:sp.t,c:sp.c,f:clone(sp.f),r:r};
  if(sel.k==='att'){const it=items()[sel.uid]; Object.assign(rec,{on:it.on,x:it.x+Math.sin(r)*off,y:it.y,z:it.z+Math.cos(r)*off});}
  else{rec.x=pos[0]+Math.sin(r)*off; rec.z=pos[1]+Math.cos(r)*off; rec.y=pos[3]; if(!inWork(rec.x,rec.z)){rec.x=pos[0]-Math.sin(r)*off; rec.z=pos[1]-Math.cos(r)*off;}}
  const uid=newItem(rec); changed(); if(!rec.on) fit({k:'piece',id:uid},1.2,null,true); select(rec.on?{k:'att',uid:uid}:{k:'piece',id:uid}); openItem(); toast('Copied. Long-press the copy to drag it.');
}
function rotateSel(a){
  if(!sel) return; const pos=curPos(sel); if(!pos) return; const pre=solidCtx(sel,pos); snap();
  let r=pos[2]+a; if(Math.abs(a)>=R/2-0.01) r=Math.round(r/(R/2))*(R/2);
  setPos(sel,pos[0],pos[1],r,pos[3]); changed();
  if(pre&&settle(sel,0.35,pre)==='stuck'){undo.pop(); setPos(sel,pos[0],pos[1],pos[2],pos[3]); changed(); toast('There is no room to turn it here.');}
  else if(pre) changed();
}
function raiseSel(dy){
  const pos=curPos(sel); if(!pos) return; const y=Math.max(0,Math.min(H-0.1,pos[3]+dy)), pre=solidCtx(sel,pos);
  if(pre&&!canMove(pre,pos,[pos[0],pos[1],pos[2],y])){toast('Something is in the way.'); return;}
  snap(); setPos(sel,pos[0],pos[1],pos[2],y); changed();
}
function addAt(nt,spot){
  const d=CAT[nt], f=clone(d.cfg)||null, sz=sizeOf(nt,f); snap();
  const pt=spot.point, rec={t:nt,c:0,f:f,r:0,y:0};
  if(spot.kind==='wall'){const n=spot.n, gap=sz.d/2+0.012; rec.x=pt.x+n[0]*gap; rec.z=pt.z+n[1]*gap; rec.r=Math.atan2(-n[1],n[0]); rec.y=Math.max(0.02,Math.min(H-sz.h-0.03,pt.y-sz.h/2));}
  else if(spot.kind==='top'&&spot.pieceId&&P[spot.pieceId]&&d.place==='top'){const pg=P[spot.pieceId].g; pg.updateMatrixWorld(true); const l=pg.worldToLocal(pt.clone());
    rec.on=spot.pieceId; rec.x=l.x; rec.y=l.y+0.001; rec.z=l.z; const c=pg.worldToLocal(A.camera.position.clone()); rec.r=Math.round(Math.atan2(-c.z+l.z,c.x-l.x)/(R/2))*(R/2);}
  else{rec.x=pt.x; rec.z=pt.z; rec.r=faceCamera(pt.x,pt.z); rec.y=spot.kind==='top'&&d.place==='top'?pt.y+0.001:0;
    if(d.place==='wall'){const s=snapToWall(pt.x,pt.z,sz.d,3); if(s){rec.x=s.x; rec.z=s.z; rec.r=s.r;} rec.y=d.y||1.2;}
    else if(spot.kind==='floor'&&SNAPCATS[d.cat]&&d.place==='floor'){const s=snapToWall(pt.x,pt.z,sz.d,sz.d/2+0.45); if(s){rec.x=s.x; rec.z=s.z; rec.r=s.r;}}}
  const uid=newItem(rec); changed();
  select(rec.on?{k:'att',uid:uid}:{k:'piece',id:uid}); openItem();
  toast(d.n+' added. Long-press it to drag it.'); if(!rec.on) fit({k:'piece',id:uid},1.5,null,true,true);
}

/* =====================================================================
   Long-press and drag
   ===================================================================== */
const LONG=430;
let press=null, drag=null;
canvas.addEventListener('contextmenu',function(e){if(S.edit) e.preventDefault();});
function draggable(t){
  if(!t) return null;
  if(t.k==='piece'||t.k==='att') return t;
  if(t.k==='baked') return t;
  return null;
}
A.stage.addEventListener('pointerdown',function(e){
  if(e.target!==canvas||A.simsOn||e.button>0) return;
  if(press||drag){if(press){clearTimeout(press.timer); if(press.instant) A.controls.enabled=true; press=null;} if(drag) endDrag(true); return;}      // a second finger: that is a pinch
  press={x:e.clientX,y:e.clientY,t:performance.now(),id:e.pointerId};
  if(!S.edit) return;
  aim(e); const c=pickAll(); press.hit=c; const t=draggable(targetOf(c)); press.tg=t;
  if(!t) return;
  if(e.pointerType==='mouse'&&same(t,sel)){press.instant=true; A.controls.enabled=false;}     // with a mouse, a piece you already picked drags straight away
  press.timer=setTimeout(function(){if(press&&!press.moved) startDrag(press);},LONG);
},true);
window.addEventListener('pointermove',function(e){
  if(drag&&e.pointerId===drag.id){moveDrag(e); return;}
  if(press&&e.pointerId===press.id){
    const d=Math.hypot(e.clientX-press.x,e.clientY-press.y);
    if(press.instant&&d>4&&press.tg){clearTimeout(press.timer); startDrag(press); moveDrag(e); return;}
    if(d>9){press.moved=true; clearTimeout(press.timer);}
  }
});
window.addEventListener('pointerup',function(e){
  if(drag&&e.pointerId===drag.id){endDrag(); press=null; return;}
  if(press&&e.pointerId===press.id){
    clearTimeout(press.timer); const p=press; press=null; if(p.instant) A.controls.enabled=true;
    if(!p.moved&&performance.now()-p.t<LONG+250) onTap(e,p);
  }
});
window.addEventListener('pointercancel',function(e){if(press&&e.pointerId===press.id){clearTimeout(press.timer); if(press.instant) A.controls.enabled=true; press=null;} if(drag&&e.pointerId===drag.id) endDrag();});
/* the baked plant you start dragging becomes one of your own first */
function adoptLoose(t){
  const nt=looseKind(t.g); const o=t.g, e=E(S.design); e.gone[t.key]=1;
  bx.setFromObject(o); const c=bx.getCenter(new THREE.Vector3()), bottom=new THREE.Vector3(c.x,bx.min.y,c.z), d=CAT[nt];
  let uid;
  if(t.pid&&P[t.pid]&&d.place==='top'){const pg=P[t.pid].g; pg.updateMatrixWorld(true); const l=pg.worldToLocal(bottom.clone()); uid=newItem({t:nt,c:0,f:clone(d.cfg)||null,on:t.pid,x:l.x,y:l.y,z:l.z,r:0});}
  else uid=newItem({t:nt,c:0,f:clone(d.cfg)||null,x:c.x,z:c.z,r:faceCamera(c.x,c.z),y:d.place==='top'?Math.max(0,bx.min.y):0});
  A.layout(true); const it=items()[uid]; return it.on?{k:'att',uid:uid}:{k:'piece',id:uid};
}
function startDrag(pr){
  let t=pr.tg; if(!t) return;
  if(navigator.vibrate) try{navigator.vibrate(15);}catch(err){}
  A.controls.enabled=false; snap();
  if(t.k==='baked') t=adoptLoose(t);
  select(t,pr.hit); closeSheet();
  const sp=specOf(t), d=sp?CAT[sp.t]:null, p=t.k==='piece'?P[t.id]:null;
  drag={id:pr.id,t:t,mode:'floor',moved:false};
  if(d&&d.place==='wall'&&(!d.eket||(sp.f&&sp.f.base==='wall'))){drag.mode='wall';}
  else if(t.k==='att'||(d&&d.place==='top')){drag.mode='top';
    const g=selObj(); drag.g=g; if(t.k==='att'){drag.parent=g.parent; scene.attach(g);} drag.ry=new THREE.Euler().setFromQuaternion(g.getWorldQuaternion(new THREE.Quaternion()),'YXZ').y;}
  if(drag.mode!=='top'){const f=new THREE.Vector3(); aimAt(pr.x,pr.y); ray.ray.intersectPlane(floorPlane,f)||f.set(p.cur[0],0,p.cur[1]); drag.ox=f.x-p.cur[0]; drag.oz=f.z-p.cur[1];
    if(drag.mode==='wall'){const c=pickAll(wallMeshes()); drag.oy=c?c.point.y-(p.y||0):0.3; drag.du=0;}
    drag.solid=solidCtx(t,poseOf(p,true));}
  $('hint').textContent='Drag it, then let go.'; $('hint').style.opacity=1;
}
function aimAt(x,y){aim({clientX:x,clientY:y});}
let wallList=null;
function wallMeshes(){if(wallList) return wallList; wallList=[]; for(const k in A.walls){const w=A.walls[k]; if(INSIDE[w.room]) wallList.push(w.g);} return wallList;}
function moveDrag(e){
  aim(e); drag.moved=true; const t=drag.t;
  if(drag.mode==='floor'){
    const p=P[t.id], f=new THREE.Vector3(); if(!ray.ray.intersectPlane(floorPlane,f)) return;
    let x=f.x-drag.ox, z=f.z-drag.oz;
    if(p.item){if(!inWork(x,z)) return;}
    else{x=Math.min(D.KX-0.15,Math.max(0.1,x)); z=Math.min(D.L-0.1,Math.max(0.1,z));
      if(x>D.W-0.05&&z>D.KZ-0.1){if(p.cur[0]>D.W-0.05) z=D.KZ-0.1; else x=D.W-0.05;}
      if(z>D.ZW-0.05&&x>D.BLK-0.05) x=D.BLK-0.05;
      if(iso&&insideFlat(x,z)!==iso) return;}
    if(drag.solid){const q=slide(drag.solid,poseOf(p,true),[x,z,p.cur[2],p.y||0]); x=q[0]; z=q[1];}      // stops at what is in the way and slides along it
    p.cur[0]=x; p.cur[1]=z; p.g.position.set(x,p.y||0,z); A.touch(3);
  }else if(drag.mode==='wall'){
    const c=pickAll(wallMeshes()); if(!c||!c.wall) return; const p=P[t.id], sp=specOf(t), sz=sizeOf(sp.t,sp.f), w=A.walls[c.wall], gap=sz.d/2+0.012;
    let x=c.point.x+w.n[0]*gap, z=c.point.z+w.n[1]*gap, y=Math.max(0.02,Math.min(H-sz.h-0.02,c.point.y-drag.oy)), r=Math.atan2(-w.n[1],w.n[0]);
    if(drag.solid){const a=poseOf(p,true), b=[x,z,r,y], q=Math.abs(a[2]-r)<1e-6?slide(drag.solid,a,[x,z,a[2],y]):canMove(drag.solid,null,b)?b:a; x=q[0]; z=q[1]; r=q[2]; y=q[3];}
    p.cur[0]=x; p.cur[1]=z; p.cur[2]=r; p.y=y; p.g.position.set(x,y,z); p.g.rotation.y=r; A.touch(3);
  }else{
    const g=drag.g, c=pickAll(null,g); if(!c) return;
    if(c.n.y<0.6) return;
    if(!inWork(c.point.x,c.point.z)) return;
    g.position.copy(c.point); g.position.y+=0.001; if(!g.parent||g.parent!==scene) scene.attach(g);
    drag.on=c.pieceId&&P[c.pieceId]&&!P[c.pieceId].flat&&c.pieceId!==(t.k==='piece'?t.id:null)&&!c.item?c.pieceId:null; drag.pt=c.point.clone(); A.touch(3);
  }
}
function endDrag(cancel){
  const d=drag; drag=null; A.controls.enabled=true; $('hint').style.opacity=0;
  if(!d) return;
  const t=d.t;
  if(cancel||!d.moved){if(d.mode==='top'&&d.parent&&d.g.parent===scene) d.parent.attach(d.g); changed(); openItem(); return;}
  if(d.mode==='floor'||d.mode==='wall'){const p=P[t.id]; setPos(t,p.cur[0],p.cur[1],p.cur[2],p.y||0);}
  else{
    const it=t.k==='att'?items()[t.uid]:P[t.id].item, g=d.g, wp=g.position.clone(), ry=d.ry;
    if(t.k==='att'&&g.parent===scene){scene.remove(g); dropAtt(t.uid);}
    if(d.on){const pg=P[d.on].g; pg.updateMatrixWorld(true); const l=pg.worldToLocal(wp.clone()), q=new THREE.Quaternion(); pg.getWorldQuaternion(q); const pr=new THREE.Euler().setFromQuaternion(q,'YXZ').y;
      it.on=d.on; it.x=l.x; it.y=l.y; it.z=l.z; it.r=ry-pr;}
    else{delete it.on; it.x=wp.x; it.y=Math.max(0,wp.y); it.z=wp.z; it.r=ry; if(t.k==='piece'){const p=P[t.id]; p.cur[0]=it.x; p.cur[1]=it.z; p.cur[2]=ry; p.y=it.y;}}
    if(it.on&&t.k==='piece') A.dropPiece(t.id);
    sel=it.on?{k:'att',uid:t.k==='att'?t.uid:t.id}:{k:'piece',id:t.k==='att'?t.uid:t.id};
  }
  changed(); openItem();
}

/* =====================================================================
   Taps
   ===================================================================== */
function onTap(e,p){
  if(!S.edit){aim(e); const c=pickAll(); shopCard(c&&c.shopObj&&c.shopObj.userData.shop?c.shopObj:null); return;}
  const c=p.hit; if(!c){deselect(); return;}
  const t=targetOf(c);
  if(t){
    if(same(t,sel)&&t.k==='piece'&&c.n.y>0.7&&!isThingPiece(P[t.id])&&!P[t.id].flat){openAdd({kind:'top',point:c.point,pieceId:t.id}); return;}   // tap the top of the piece you picked: put something on it
    select(t,c); openItem(); return;
  }
  const pp=A.paint&&A.paint.partOf(c);                                  // the flat's own fittings: pick one to colour it
  if(pp){if(same(pp,sel)&&c.n.y>0.7){openAdd({kind:'top',point:c.point,pieceId:null}); return;} select(pp,c); openItem(); return;}
  const s=spotOf(c); if(!s){deselect(); toast(iso?'Tap somewhere in the '+A.rooms[iso].name.toLowerCase()+'.':'Tap somewhere inside the flat.'); return;}
  sel=null; hlFor=null; openAdd(s);
}
function shopCard(o){
  const c=$('shopCard'); if(!o){c.hidden=true; return;}
  const s=o.userData.shop, q=encodeURIComponent(s.q||'');
  $('shopName').textContent=s.name; $('shopNote').textContent=s.note;
  const a=$('shopLink'); a.hidden=s.site==='none'; a.href=s.site==='ikea'?'https://www.ikea.com/il/he/search/?q='+q:'https://www.google.com/search?tbm=shop&q='+q;
  a.textContent=s.site==='ikea'?'Search IKEA Israel':'Search shops';
  c.hidden=false;
}
$('shopClose').onclick=function(){shopCard(null);};
function shopUrl(d){const q=encodeURIComponent(d.q||d.n); return d.site==='none'?null:d.site==='web'?'https://www.google.com/search?tbm=shop&q='+q:'https://www.ikea.com/il/he/search/?q='+q;}

/* =====================================================================
   Thumbnails: each piece drawn once in a little scene of its own
   ===================================================================== */
const thumbs={}; let tr=null, ts=null, tc=null, tq=[], tBusy=false;
function thumbOf(t,ci){
  const key=t+'|'+(ci||0); if(thumbs[key]) return thumbs[key];
  try{
    if(!tr){tr=new THREE.WebGLRenderer({antialias:true,alpha:true}); tr.setPixelRatio(1); tr.setSize(112,112); ts=new THREE.Scene();
      ts.add(new THREE.HemisphereLight(0xffffff,0x9aa39e,0.95)); const dl=new THREE.DirectionalLight(0xffffff,0.55); dl.position.set(4,6,3); ts.add(dl); tc=new THREE.PerspectiveCamera(28,1,0.01,60);}
    const g=new THREE.Group(); ts.add(g); A.buildItem(g,t,ci||0,null,'living');
    g.traverse(function(o){if(o.isMesh&&o.material&&o.material.blending===THREE.AdditiveBlending) o.visible=false;});
    const b=new THREE.Box3(), mb=new THREE.Box3(); g.updateMatrixWorld(true);              // frame what you see, not a lamp's pool of light
    g.traverse(function(o){if(o.isMesh&&o.visible&&o.geometry){if(!o.geometry.boundingBox) o.geometry.computeBoundingBox(); b.union(mb.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld));}});
    const c=b.getCenter(new THREE.Vector3()), s=b.getSize(new THREE.Vector3()), r=Math.max(0.12,s.length()/2);
    if(CAT[t].place==='ceil'){c.y=b.max.y-Math.min(s.y,0.7)/2; }
    const dir=new THREE.Vector3(1,0.55,0.75).normalize(), dist=r/Math.sin(14*Math.PI/180)*0.92;
    tc.position.copy(c).addScaledVector(dir,dist); tc.lookAt(c); tc.near=dist/50; tc.far=dist*4; tc.updateProjectionMatrix();
    tr.render(ts,tc); thumbs[key]=tr.domElement.toDataURL('image/png');
    A.forget(g); ts.remove(g); for(let i=K.cushions.length-1;i>=0;i--) if(!attachedToScene(K.cushions[i])) K.cushions.splice(i,1);
    for(let i=K.espressos.length-1;i>=0;i--) if(!attachedToScene(K.espressos[i])) K.espressos.splice(i,1);
  }catch(err){thumbs[key]='';}
  return thumbs[key];
}
function fillThumbs(){
  if(tBusy) return; tBusy=true;
  const step=function(){
    const img=document.querySelector('#edSheet img[data-th]:not([src])');
    if(!img||$('edSheet').hidden){tBusy=false; return;}
    const u=thumbOf(img.dataset.th,+img.dataset.ci||0); if(u) img.src=u; else img.setAttribute('src','data:,');
    setTimeout(step,0);
  };
  setTimeout(step,30);
}

/* =====================================================================
   The sheet: what you picked, what you can add, the EKET builder
   ===================================================================== */
const sheet=$('edSheet'), body=$('edBody');
let mode=null, spot=null, tab={floor:'sofa',wall:'wall',top:'decor',ceil:'lamp'}, ekSel=-1, ekType='d', ekCol=0;
function closeSheet(){sheet.hidden=true; mode=null; document.body.classList.remove('edOpen');}
function showSheet(title,sub){
  $('edTitle').textContent=title; $('edSub').textContent=sub||''; sheet.hidden=false; document.body.classList.add('edOpen');
  if(document.body.classList.contains('nomenu')) document.body.classList.add('edFloat'); else document.body.classList.remove('edFloat');
  body.scrollTop=0; fillThumbs();
}
function sizeText(d,f){if(d.eket){const b=A.eketBounds(f||d.cfg); return Math.round(b.w*100)+' × '+((f||d.cfg).d||35)+' × '+Math.round(b.h*100+((f||d.cfg).base==='legs'?10:0))+' cm';} return d.w+' × '+d.d+(d.cat==='rug'?'':' × '+d.h)+' cm';}
function swatch(c,i,on){const bg=c.h2!=null&&c.h2!==c.h?'linear-gradient(135deg,'+hex(c.h)+' 50%,'+hex(c.h2)+' 50%)':Array.isArray(c.x)&&c.x.length?'linear-gradient(90deg,'+c.x.slice(0,5).join(',')+')':hex(c.h);
  return '<button class="swc" data-a="col" data-i="'+i+'" title="'+esc(c.n)+'" aria-label="'+esc(c.n)+'" aria-pressed="'+!!on+'" style="background:'+bg+'"></button>';}
function card(t,act,extra){const d=CAT[t]; return '<button class="card'+(extra||'')+'" data-a="'+act+'" data-t="'+t+'"><img data-th="'+t+'" alt=""><b>'+esc(d.n)+'</b><span>'+sizeText(d)+'</span></button>';}
function altsFor(cat,place){
  const rel={sofa:['sofa'],arm:['arm','chair'],chair:['chair','arm'],table:['table'],media:['media','eket'],shelf:['shelf','eket','media','ward'],eket:['eket','shelf','media'],dining:['dining'],lamp:['lamp'],plant:['plant'],decor:['decor','plant'],wall:['wall','eket'],rug:['rug'],hall:['hall','shelf','eket'],ward:['ward','shelf'],kitchen:['kitchen','dining'],out:['out','chair']}[cat]||[cat];
  const out=[]; rel.forEach(function(k){for(const t in CAT){const d=CAT[t]; if(d.cat!==k) continue; if(place==='wall'?d.place!=='wall':place==='top'?d.place!=='top':place==='ceil'?d.place!=='ceil':(d.place==='wall'||d.place==='ceil')) continue; out.push(t);}});
  return out;
}
function nameOf(t){
  if(t.k==='piece'){const p=P[t.id]; return p.def?p.def.n:(p.label||A.NAMES[p.id]||'Piece');}
  if(t.k==='att'){const it=items()[t.uid]; return CAT[it.t].n;}
  if(t.k==='baked') return {plant:'Plant',pothos:'Trailing plant',hanging:'Hanging plant',books:'Books',stack:'Stack of books',candle:'Candle',lamp:'Lamp',insert:'Basket',vase:'Vase',speaker:'Speaker',cushion:'Cushion',turntable:'Record player',record:'Records'}[t.g.userData.decor]||'Decoration';
  return (t.obj.userData.shop&&t.obj.userData.shop.name)||'Piece';
}
function openItem(){
  if(!sel){closeSheet(); return;}
  if(sel.k==='part'){mode='item'; body.innerHTML=A.paint.partSheet(sel); showSheet(A.rooms[sel.room].name,'Part of the flat'); return;}
  mode='item'; const t=sel, sp=specOf(t), d=sp?CAT[sp.t]:null; let h='';
  const place=d?d.place:(t.k==='baked'?'top':'floor');
  h+='<div class="edRow">';
  if(t.k==='piece'||t.k==='att'){
    if(place!=='wall') h+='<button class="btn" data-a="rot" data-v="-15">⟲ 15°</button><button class="btn" data-a="rot" data-v="15">⟳ 15°</button><button class="btn" data-a="rot" data-v="90">↻ 90°</button>';
    else h+='<button class="btn" data-a="up" data-v="0.05">▲ 5 cm</button><button class="btn" data-a="up" data-v="-0.05">▼ 5 cm</button>';
    if(sp) h+='<button class="btn" data-a="dup">Copy</button>';
    if(t.k==='piece'&&!isThingPiece(P[t.id])&&!P[t.id].flat) h+='<button class="btn" data-a="on">Put something on it</button>';
  }
  h+='<button class="btn danger" data-a="del">Remove</button></div>';
  if(d&&d.col.length>1) h+='<h4>Colour <span id="edColName">'+esc(d.col[sp.c]?d.col[sp.c].n:'')+'</span></h4><div class="sws">'+d.col.map(function(c,i){return swatch(c,i,i===sp.c);}).join('')+'</div>';
  else if(t.k==='baked'){const kind=looseKind(t.g), dd=CAT[kind]; if(dd.col.length>1) h+='<h4>Colour</h4><div class="sws">'+dd.col.map(function(c,i){return swatch(c,i,false).replace('data-a="col"','data-a="bcol" data-t="'+kind+'"');}).join('')+'</div>';}
  if(A.paint) h+=A.paint.thingSection(t,selObj(),selHit&&selHit.o);
  if(d&&d.eket) h+='<button class="btn primary wide" data-a="eket">Edit the EKET combination</button>';
  const sn=t.k==='fixed'?((t.obj.userData.shop||{}).name||''):'';
  const cat=d?d.cat:t.k==='piece'?(A.CUSTOMCAT[t.id]||'shelf'):t.k==='baked'?(CAT[looseKind(t.g)].cat):/rug|runner/i.test(sn)?'rug':/chair/i.test(sn)?'arm':/desk|table/i.test(sn)?'dining':/lamp/i.test(sn)?'lamp':'shelf';
  const alts=altsFor(cat,place==='floor'&&cat==='plant'?'floor':place).filter(function(k){return !sp||k!==sp.t;});
  if(alts.length) h+='<h4>Swap for</h4><div class="cards">'+alts.map(function(k){return card(k,'swap');}).join('')+'</div>';
  if(d){const u=shopUrl(d); if(u) h+='<a class="btn shop" href="'+u+'" target="_blank" rel="noopener">'+(d.site!=='web'?'Find it at IKEA Israel ↗':'Search shops ↗')+'</a>'; if(d.note) h+='<p class="note">'+esc(d.note)+'</p>';}
  h+='<p class="note">'+(t.k==='fixed'?'Part of the flat as it is. You can remove it or swap it.':'Long-press it and drag to move it.')+(d?' '+sizeText(d,sp.f)+'.':'')+'</p>';
  body.innerHTML=h; showSheet(nameOf(t),d&&d.q&&!d.site?'IKEA '+d.q.split(' ')[0]:d&&d.site==='none'?'Not from a shop':'');
}
function openAdd(s){
  spot=s; mode='add'; const kind=s.kind==='top'?'top':s.kind;
  const cats=A.CATS.filter(function(c){return altsFor(c[0],kind==='floor'?'floor':kind).some(function(t){return CAT[t].cat===c[0];});});
  if(!cats.some(function(c){return c[0]===tab[kind];})) tab[kind]=cats.length?cats[0][0]:'decor';
  const list=altsFor(tab[kind],kind==='floor'?'floor':kind).filter(function(t){return CAT[t].cat===tab[kind];});
  let h=(A.paint?A.paint.surfaceSection(s):'')+'<div class="tabs">'+cats.map(function(c){return '<button class="chip" data-a="tab" data-c="'+c[0]+'" aria-pressed="'+(c[0]===tab[kind])+'">'+esc(c[1])+'</button>';}).join('')+'</div>';
  h+='<div class="cards">'+list.map(function(t){return card(t,'add');}).join('')+'</div>';
  const where={floor:'Add on the floor',wall:'Add on this wall',top:s.pieceId?'Put on the '+(P[s.pieceId].def?P[s.pieceId].def.n:A.NAMES[s.pieceId]||'piece'):'Put on this surface',ceil:'Hang from the ceiling'}[kind];
  body.innerHTML=h; showSheet(where,'Tap a piece to place it here');
}
/* ---------- EKET: build your own combination ---------- */
function ekCfg(){const sp=specOf(sel); return clone(sp.f||CAT[sp.t].cfg);}
function ekFits(mods,m,skipI){const T=A.EKM[m.t]; if(m.x<0||m.y<0||m.x+T.w*2>18||m.y+T.h*2>12) return false;
  return mods.every(function(o,i){if(i===skipI) return true; const U=A.EKM[o.t]; return m.x>=o.x+U.w*2||o.x>=m.x+T.w*2||m.y>=o.y+U.h*2||o.y>=m.y+T.h*2;});}
function ekApply(f,msg){
  const sp=specOf(sel), old=sizeOf(sp.t,sp.f), b0=A.eketBounds(sp.f||CAT[sp.t].cfg), b1=A.eketBounds(f), pos=curPos(sel), pre=solidCtx(sel,pos);
  snap(); const dz=((b1.x0+b1.x1)-(b0.x0+b0.x1))/2, r=pos[2];        // the cubes you did not touch stay where they are
  if(sel.k!=='att') setPos(sel,pos[0]+Math.sin(r)*dz,pos[1]+Math.cos(r)*dz,r,f.base==='wall'&&(sp.f||{}).base!=='wall'?Math.max(pos[3],0.8):f.base!=='wall'&&(sp.f||{}).base==='wall'?0:pos[3]);
  setCfg(sel,f); changed(); if(pre) fit(sel,0.6,pre,!!msg); openEket(); if(msg) toast(msg);
}
function openEket(){
  mode='eket'; const f=ekCfg(), EC=A.IKEA.eket; let h='';
  if(ekSel>=f.mods.length) ekSel=-1;
  const W=18, Hh=12, u=16;
  h+='<p class="note" style="margin-top:0">Pick a cube type and a colour, then tap an empty square to add it. Tap a cube to choose it: recolour it, change its type, nudge it half a cube, or remove it.</p>';
  h+='<div class="ekTypes">'+Object.keys(A.EKM).map(function(k){const T=A.EKM[k]; return '<button class="chip" data-a="ekType" data-k="'+k+'" aria-pressed="'+(k===ekType)+'" title="'+esc(T.n)+'">'+esc(T.n)+'</button>';}).join('')+'</div>';
  h+='<div class="sws">'+EC.map(function(c,i){return swatch({n:c[0],h:c[1]},i,i===ekCol).replace('data-a="col"','data-a="ekCol"');}).join('')+'</div>';
  let svg='<svg class="ekGrid" viewBox="0 0 '+(W*u)+' '+(Hh*u)+'" data-a="ekGrid">';
  for(let x=0;x<=W;x++) svg+='<line x1="'+x*u+'" y1="0" x2="'+x*u+'" y2="'+Hh*u+'" class="'+(x%2?'g1':'g2')+'"/>';
  for(let y=0;y<=Hh;y++) svg+='<line x1="0" y1="'+y*u+'" x2="'+W*u+'" y2="'+y*u+'" class="'+(y%2?'g1':'g2')+'"/>';
  f.mods.forEach(function(m,i){const T=A.EKM[m.t], c=EC[m.c||0], x=m.x*u, y=(Hh-m.y-T.h*2)*u, w=T.w*2*u, hh=T.h*2*u;
    svg+='<g data-a="ekMod" data-i="'+i+'"><rect x="'+(x+1)+'" y="'+(y+1)+'" width="'+(w-2)+'" height="'+(hh-2)+'" rx="2" fill="'+hex(c[1])+'" class="'+(i===ekSel?'on':'')+'"/>';
    if(m.t==='d'||m.t==='T') svg+='<line x1="'+(x+w-7)+'" y1="'+(y+hh/2-6)+'" x2="'+(x+w-7)+'" y2="'+(y+hh/2+6)+'" class="hd"/>';
    if(m.t==='w'||m.t==='W3'){const n=m.t==='w'?2:3; for(let j=1;j<n;j++) svg+='<line x1="'+(x+3)+'" y1="'+(y+j*hh/n)+'" x2="'+(x+w-3)+'" y2="'+(y+j*hh/n)+'" class="hd"/>';}
    if(m.t==='O2'||m.t==='O3'||m.t==='Q'){for(let j=1;j<T.w;j++) svg+='<line x1="'+(x+j*2*u)+'" y1="'+(y+3)+'" x2="'+(x+j*2*u)+'" y2="'+(y+hh-3)+'" class="hd"/>'; if(m.t==='Q') svg+='<line x1="'+(x+3)+'" y1="'+(y+hh/2)+'" x2="'+(x+w-3)+'" y2="'+(y+hh/2)+'" class="hd"/>';}
    if(m.t==='D2') svg+='<line x1="'+(x+w/2)+'" y1="'+(y+3)+'" x2="'+(x+w/2)+'" y2="'+(y+hh-3)+'" class="hd"/>';
    svg+='</g>';});
  svg+='<line x1="0" y1="'+Hh*u+'" x2="'+W*u+'" y2="'+Hh*u+'" class="fl"/></svg>';
  h+=svg;
  h+='<div class="edRow">'+(ekSel>=0?'<button class="btn" data-a="ekNudge" data-x="-1" data-y="0">◀</button><button class="btn" data-a="ekNudge" data-x="1" data-y="0">▶</button><button class="btn" data-a="ekNudge" data-x="0" data-y="1">▲</button><button class="btn" data-a="ekNudge" data-x="0" data-y="-1">▼</button><button class="btn danger" data-a="ekDel">Remove cube</button>':'<span class="note">No cube chosen.</span>')+'</div>';
  h+='<h4>Stands on</h4><div class="edRow">'+[['legs','EKET legs, 10 cm'],['floor','The floor'],['wall','Suspension rail on the wall']].map(function(q){return '<button class="chip" data-a="ekBase" data-v="'+q[0]+'" aria-pressed="'+(f.base===q[0])+'">'+q[1]+'</button>';}).join('')+'</div>';
  h+='<div class="edRow"><button class="chip" data-a="ekDepth" aria-pressed="'+((f.d||35)===25)+'">Shallow, 25 cm deep</button><button class="chip" data-a="ekTV" aria-pressed="'+!!f.tv+'">TV on top</button><button class="chip" data-a="ekTT" aria-pressed="'+!!f.tt+'">Record player on top</button></div>';
  h+='<h4>Start from an idea</h4><div class="cards">'+Object.keys(CAT).filter(function(k){return CAT[k].eket;}).map(function(k){return card(k,'ekIdea');}).join('')+'</div>';
  h+='<div class="edRow"><button class="btn" data-a="back">Done</button></div>';
  body.innerHTML=h; showSheet('EKET combination',sizeText(CAT[specOf(sel).t],f));
}
function ekGridTap(e){
  const svg=body.querySelector('.ekGrid'), r=svg.getBoundingClientRect(), u=r.width/18;
  const gx=Math.floor((e.clientX-r.left)/u), gy=11-Math.floor((e.clientY-r.top)/u);
  const f=ekCfg(), T=A.EKM[ekType], m={t:ekType,x:Math.min(18-T.w*2,Math.max(0,gx-(gx%2&&T.w>1?1:0))),y:Math.max(0,Math.min(12-T.h*2,gy-(T.h>1?1:0))),c:ekCol};
  if(!ekFits(f.mods,m,-1)){toast('That would overlap another cube.'); return;}
  f.mods.push(m); ekSel=f.mods.length-1; ekApply(f);
}
/* ---------- one click handler for the whole sheet ---------- */
sheet.addEventListener('click',function(e){
  const b=e.target.closest('[data-a]'); if(!b) return;
  const a=b.dataset.a;
  if(a==='close'){deselect(); return;}
  if(a==='undo'){doUndo(); return;}
  if(a.slice(0,2)==='pt'){A.paint.click(b); return;}
  if(a==='pal'){applyPalette(); if(mode==='item') openItem(); return;}
  if(a==='tab'){tab[spot.kind==='top'?'top':spot.kind]=b.dataset.c; openAdd(spot); return;}
  if(a==='add'){addAt(b.dataset.t,spot); return;}
  if(!sel&&a!=='ekGrid') return;
  if(a==='rot'){rotateSel(+b.dataset.v*R/180); return;}
  if(a==='up'){raiseSel(+b.dataset.v); return;}
  if(a==='dup'){duplicateSel(); return;}
  if(a==='del'){removeSel(); return;}
  if(a==='on'){const p=P[sel.id]; p.g.updateMatrixWorld(true); bx.setFromObject(p.g); let pt=bx.getCenter(new THREE.Vector3()); pt.y=bx.max.y;
    if(selHit&&selHit.pieceId===sel.id&&selHit.n.y>0.7) pt=selHit.point.clone(); openAdd({kind:'top',point:pt,pieceId:sel.id}); return;}
  if(a==='col'){snap(); setColour(sel,+b.dataset.i,true); changed(); openItem(); return;}
  if(a==='bcol'){replaceLoose(sel,b.dataset.t,+b.dataset.i); return;}
  if(a==='swap'){swapTo(sel,b.dataset.t); return;}
  if(a==='eket'){ekSel=-1; openEket(); return;}
  if(a==='back'){openItem(); return;}
  if(a==='ekType'){ekType=b.dataset.k; if(ekSel>=0){const f=ekCfg(), m=Object.assign({},f.mods[ekSel],{t:ekType}); if(ekFits(f.mods,m,ekSel)){f.mods[ekSel]=m; ekApply(f); return;} toast('It does not fit there. Move it first.');} openEket(); return;}
  if(a==='ekCol'){ekCol=+b.dataset.i; if(ekSel>=0){const f=ekCfg(); f.mods[ekSel].c=ekCol; ekApply(f); return;} openEket(); return;}
  if(a==='ekMod'){ekSel=+b.dataset.i; const f=ekCfg(); ekType=f.mods[ekSel].t; ekCol=f.mods[ekSel].c||0; openEket(); return;}
  if(a==='ekGrid'){ekGridTap(e); return;}
  if(a==='ekNudge'){const f=ekCfg(), m=Object.assign({},f.mods[ekSel]); m.x+=+b.dataset.x; m.y+=+b.dataset.y; if(!ekFits(f.mods,m,ekSel)){toast('It cannot go there.'); return;} f.mods[ekSel]=m; ekApply(f); return;}
  if(a==='ekDel'){const f=ekCfg(); if(f.mods.length<2){toast('Keep at least one cube, or remove the whole piece.'); return;} f.mods.splice(ekSel,1); ekSel=-1; ekApply(f); return;}
  if(a==='ekBase'){const f=ekCfg(); f.base=b.dataset.v; ekApply(f,f.base==='wall'?'Now it hangs on the wall. Long-press it to slide it along.':''); return;}
  if(a==='ekDepth'){const f=ekCfg(); f.d=(f.d||35)===25?35:25; ekApply(f); return;}
  if(a==='ekTV'){const f=ekCfg(); f.tv=!f.tv; ekApply(f); return;}
  if(a==='ekTT'){const f=ekCfg(); f.tt=!f.tt; ekApply(f); return;}
  if(a==='ekIdea'){ekSel=-1; ekApply(clone(CAT[b.dataset.t].cfg)); return;}
});
$('edClose').onclick=function(){deselect();};

/* =====================================================================
   A matched colour set: every piece in the room takes the nearest IKEA colour it comes in
   ===================================================================== */
const PALS=[
  {n:'Warm oak and sage',main:0xd5cab4,accent:0x5d7c79,soft:0x8fbd9b,wood:0xc99a5b,case:0xf2f1ec,case2:0xaabccb,metal:0xb5924c,pot:0xb5673f,rug:0xd2c4a6,accent2:0xc99a5b},
  {n:'Nordic grey and white',main:0x4a4b4e,accent:0x55585b,soft:0x9a9a96,wood:0xdccfb7,case:0xf2f1ec,case2:0x4c4e51,metal:0x232323,pot:0xf2f1ec,rug:0xe7e1d3,accent2:0x222222},
  {n:'Teal, walnut and mustard',main:0x5d7c79,accent:0xd8a63b,soft:0xefe7d6,wood:0x6b4630,case:0x6d4932,case2:0x3e4b5b,metal:0xb5924c,pot:0x2b2b2b,rug:0xc4673f,accent2:0xc9a23a},
  {n:'Soft beige Japandi',main:0xb1a998,accent:0xe1d8c6,soft:0xd6c7ab,wood:0xdccfb7,case:0xdad0be,case2:0xd6c8ae,metal:0x8a6a48,pot:0xe6ddcd,rug:0xe7e1d3,accent2:0xc99a5b},
  {n:'Coastal blue',main:0xd5cab4,accent:0x2e3a52,soft:0x9fc4d6,wood:0xf2f1ec,case:0xf1f0eb,case2:0xaabccb,metal:0xf2f2ee,pot:0xf2f1ec,rug:0xb9cfda,accent2:0xf4f4f0},
  {n:'Dark and cosy',main:0x4a4b4e,accent:0x2e4a3b,soft:0xb5673f,wood:0x6b4630,case:0x3a312c,case2:0x6d4932,metal:0x3d3f41,pot:0x2b2b2b,rug:0xc4673f,accent2:0x222222},
  {n:'Pastel play',main:0xd5cab4,accent:0xa7b39a,soft:0xc9bfd8,wood:0xd9bf8c,case:0xf1f0eb,case2:0xc9bfd8,metal:0xf2f2ee,pot:0xf2f1ec,rug:0xb9cfda,accent2:0xc9a23a},
  {n:'Golden oak, like your shelf',main:0xb1a998,accent:0xd8a63b,soft:0xefe7d6,wood:0xb4803f,case:0xb08559,case2:0xd6c8ae,metal:0xb5924c,pot:0xb5673f,rug:0xb89a63,accent2:0xc99a5b}
];
function lab(c){
  const f=function(v){v/=255; return v<=0.04045?v/12.92:Math.pow((v+0.055)/1.055,2.4);};
  const r=f(c>>16&255), g=f(c>>8&255), b=f(c&255);
  let x=(r*0.4124+g*0.3576+b*0.1805)/0.95047, y=r*0.2126+g*0.7152+b*0.0722, z=(r*0.0193+g*0.1192+b*0.9505)/1.08883;
  const q=function(t){return t>0.008856?Math.cbrt(t):7.787*t+16/116;}; x=q(x); y=q(y); z=q(z);
  return [116*y-16,500*(x-y),200*(y-z)];
}
function dist(a,b){const p=lab(a), q=lab(b); return Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2]);}
function nearestCol(cols,target){let bi=0, bd=1e9; cols.forEach(function(c,i){const h=c.h||c[1]; if(h==null||(c.x&&!c.h)) return; const d=dist(h,target); if(d<bd){bd=d; bi=i;}}); return bi;}
let palI=-1, palOrder=null, palAnchor=null;
function anchorSofa(){
  const e=E(S.design);
  for(const id in P){const p=P[id]; if(p.to[3]<1||!p.def||p.def.role!=='main'||p.def.cat!=='sofa') continue;
    const user=p.item?p.item.uc:e.uc[id]; if(user) return {id:id,h:p.def.col[p.col].h,name:p.def.col[p.col].n};}
  return null;
}
function applyPalette(){
  const anchor=anchorSofa(), key=S.design+(anchor?anchor.id+anchor.h:'');
  if(palAnchor!==key||!palOrder){palAnchor=key; palI=-1;
    palOrder=PALS.map(function(p,i){return i;}); if(anchor) palOrder.sort(function(a,b){return dist(PALS[a].main,anchor.h)-dist(PALS[b].main,anchor.h);});}
  palI=(palI+1)%palOrder.length; const pal=PALS[palOrder[palI]];
  snap(); const e=E(S.design); let n=0;
  for(const id in P){const p=P[id]; if(p.to[3]<1||!p.def) continue; const d=p.def;
    if(anchor&&anchor.id===id) continue;
    if(d.eket){const f=clone(p.cfg||d.cfg); f.mods.forEach(function(m,i){m.c=nearestCol(A.IKEA.eket.map(function(c){return {h:c[1]};}),i%3===1?pal.case2:pal.case);}); setCfg({k:'piece',id:id},f); n++; continue;}
    if(d.col.length<2) continue;
    const role=d.cat==='arm'&&d.role==='soft'?'soft':d.role, target=pal[role]||pal.accent2;
    setColour({k:'piece',id:id},nearestCol(d.col,target),false); if(!p.item) delete e.uc[id]; n++;
  }
  for(const k in att){const it=items()[k]; if(!it) continue; const d=CAT[it.t]; if(d.col.length<2) continue; it.c=nearestCol(d.col,pal[d.role]||pal.accent2); n++;}
  changed(); palShown=pal;
  toast((anchor?'Built round your '+anchor.name+' sofa: ':'Colour set: ')+pal.n+'. Tap again for another.');
}
let palShown=null;

/* =====================================================================
   One room on its own: the rest of the flat steps away, and as you turn round the room, each wall that stands
   between you and it steps aside too, with its door and whatever hangs on it, so you can always see in and reach in
   ===================================================================== */
const OFF=7;                                       // a layer the camera does not draw, and taps do not find
const ISO=Object.keys(INSIDE), clipBox=[0,0,0,0], clipPl=[0,1,2,3].map(function(){return new THREE.Plane(new THREE.Vector3(),0);});
let isoOn=false, isoHid=[], isoHang={}, isoDoors={}, isoWalls=[], nearKey='';
const ub=new THREE.Box3(), mb=new THREE.Box3();
function matOf(m){return Array.isArray(m.material)?m.material[0]:m.material;}
function glowy(m){const t=matOf(m); return !!t&&t.blending===THREE.AdditiveBlending;}
function boxOf(o,all){            // the box round what is drawn of o; with all, round every part of it, shown or not
  ub.makeEmpty();
  (function walk(q){if(!all&&!q.visible) return;
    if(q.isMesh&&q.geometry&&(all||!glowy(q))){if(!q.geometry.boundingBox) q.geometry.computeBoundingBox(); mb.copy(q.geometry.boundingBox).applyMatrix4(q.matrixWorld); ub.union(mb);}
    for(let i=0;i<q.children.length;i++) walk(q.children[i]);})(o);
  return ub;
}
function meshesOf(o,out){o.traverse(function(m){if((m.isMesh||m.isLine||m.isPoints)&&m.layers.mask===1) out.push(m);}); return out;}
function layer(list,n){for(let i=0;i<list.length;i++) list[i].layers.set(n);}
function roomBox(k){const b=[1e9,-1e9,1e9,-1e9]; A.rooms[k].rs.forEach(function(r){b[0]=Math.min(b[0],r[0]); b[1]=Math.max(b[1],r[1]); b[2]=Math.min(b[2],r[2]); b[3]=Math.max(b[3],r[3]);}); return b;}
function inClip(p){return p.x>=clipBox[0]&&p.x<=clipBox[1]&&p.z>=clipBox[2]&&p.z<=clipBox[3];}
function inRects(k,x,z){const rs=A.rooms[k].rs; for(let i=0;i<rs.length;i++){const r=rs[i]; if(x>r[0]&&x<r[1]&&z>r[2]&&z<r[3]) return true;} return false;}
/* does this wall face into the room? (the long wall with the bedroom doors faces the living room and the kitchen) */
function serves(w,k){for(let u=0.15;u<w.len;u+=0.3) if(inRects(k,w.a[0]+w.d[0]*u+w.n[0]*0.1,w.a[1]+w.d[1]*u+w.n[1]*0.1)) return true; return false;}
function pieceRoom(p){return insideFlat(p.to[0],p.to[1])||p.builtRoom||p.room||'living';}
/* the separate things the flat is made of, apart from walls, doors and pieces, each with the room its materials belong to */
function wide(o){if(o.userData.decor) return false; const b=boxOf(o,true); return !b.isEmpty()&&Math.max(b.max.x-b.min.x,b.max.z-b.min.z)>2.2;}      // a group that runs round a room is many things
function isoUnits(matRoom,doorSet){
  const out=[], roomIn=function(o){let r=null; o.traverse(function(m){if(!r&&m.isMesh) r=matRoom.get(matOf(m))||null;}); return r;};
  (function walk(o){for(let i=0;i<o.children.length;i++){const c=o.children[i];
    if(c===hl||c.userData.hl||c.userData.wallKey||c.userData.piece||doorSet.has(c)) continue;
    const r=c.isMesh?matRoom.get(matOf(c))||null:roomIn(c);
    if(!c.isMesh&&c.children.length&&(c.userData.only||!r||wide(c))) walk(c); else out.push({o:c,room:r});}})(scene);
  return out;
}
function isoClear(){
  if(!isoOn) return; isoOn=false;
  layer(isoHid,0); for(const k in isoHang) layer(isoHang[k],0); isoHid=[]; isoHang={}; isoDoors={}; isoWalls=[]; nearKey='';
  for(const k in A.walls) A.walls[k].g.visible=true; A.doors.forEach(function(d){d.p.visible=true;});
  A.renderer.clippingPlanes=[]; A.touch(3);
}
function isoBuild(){
  isoClear(); if(!iso) return; isoOn=true;
  scene.updateMatrixWorld(true);
  const b=roomBox(iso), m=0.21; clipBox[0]=b[0]-m; clipBox[1]=b[1]+m; clipBox[2]=b[2]-m; clipBox[3]=b[3]+m;      // wide enough for an outside wall's thickness
  clipPl[0].set(new THREE.Vector3(1,0,0),-clipBox[0]); clipPl[1].set(new THREE.Vector3(-1,0,0),clipBox[1]);
  clipPl[2].set(new THREE.Vector3(0,0,1),-clipBox[2]); clipPl[3].set(new THREE.Vector3(0,0,-1),clipBox[3]);
  A.renderer.clippingPlanes=clipPl;
  for(const k in A.walls){const w=A.walls[k]; if(serves(w,iso)){isoWalls.push(k); isoHang[k]=[]; isoDoors[k]=[];} else w.g.visible=false;}
  A.doors.forEach(function(d){
    const k=isoWalls.find(function(k){const w=A.walls[k], dx=d.cx-w.a[0], dz=d.cz-w.a[1], u=dx*w.d[0]+dz*w.d[1]; return Math.abs(dx*w.n[0]+dz*w.n[1])<0.08&&u>0&&u<w.len;});
    if(k&&d.cx>clipBox[0]&&d.cx<clipBox[1]&&d.cz>clipBox[2]&&d.cz<clipBox[3]) isoDoors[k].push(d); else d.p.visible=false;
  });
  const matRoom=new Map(); for(const k in A.rooms) A.rooms[k].mats.forEach(function(e){matRoom.set(e.m,k);});
  const things=[];
  isoUnits(matRoom,new Set(A.doors.map(function(d){return d.p;}))).forEach(function(u){
    let r=u.room; if(!r){const bb=boxOf(u.o,true); if(bb.isEmpty()) return; bb.getCenter(v3); r=insideFlat(v3.x,v3.z)||'out';}      // light pools and the like go by where they are
    if(r!==iso){meshesOf(u.o,isoHid); return;}
    if(A.shells.indexOf(u.o)<0&&shownObj(u.o)) things.push({o:u.o});
  });
  for(const id in P){const p=P[id], d=p.def;
    if(pieceRoom(p)!==iso){meshesOf(p.g,isoHid); continue;}
    if(p.to[3]>=1&&shownObj(p.g)) things.push({o:p.g,wall:!!(d&&(d.place==='wall'||(d.eket&&p.cfg&&p.cfg.base==='wall')))});
  }
  layer(isoHid,OFF);
  /* what hangs on a wall: anything off the floor that neither rests on something standing nor is fixed within the height
     of something standing (a handle on a cupboard), and anything resting on such a thing */
  const list=[]; things.forEach(function(t){const bb=boxOf(t.o); if(!bb.isEmpty()){t.b=bb.clone(); list.push(t);}});
  list.sort(function(a,c){return a.b.min.y-c.b.min.y||(c.b.max.y-a.b.max.y);});
  const holds=function(s,t){
    if(!(s.min.x-0.03<t.max.x&&s.max.x+0.03>t.min.x&&s.min.z-0.03<t.max.z&&s.max.z+0.03>t.min.z)) return false;
    return (s.min.y<t.min.y-0.005&&Math.abs(s.max.y-t.min.y)<0.05)||(s.min.y<=t.min.y+0.01&&s.max.y>=t.max.y-0.02);
  };
  list.forEach(function(t){
    if(t.wall){t.hang=true; return;}
    if(t.b.min.y<0.1){t.hang=false; return;}
    t.hang=!list.some(function(s){return s!==t&&s.hang===false&&holds(s.b,t.b);});
  });
  const c=new THREE.Vector3(), e=new THREE.Vector3();
  list.forEach(function(t){
    if(!t.hang) return; t.b.getCenter(c); t.b.getSize(e).multiplyScalar(0.5); let best=null, bd=0.45;      // the door of a wall cupboard is its depth out from the wall
    isoWalls.forEach(function(k){const w=A.walls[k];      // its back against the wall, and not reaching far into the room
      const cn=(c.x-w.a[0])*w.n[0]+(c.z-w.a[1])*w.n[1], en=Math.abs(w.n[0])*e.x+Math.abs(w.n[1])*e.z;
      const cu=(c.x-w.a[0])*w.d[0]+(c.z-w.a[1])*w.d[1], eu=Math.abs(w.d[0])*e.x+Math.abs(w.d[1])*e.z;
      if(cn-en<-0.2||cn+en>1.0||cu+eu<0.05||cu-eu>w.len-0.05) return;      // a TV on a swing arm reaches a good way out
      if(Math.abs(cn-en)<bd){bd=Math.abs(cn-en); best=k;}
    });
    if(best) meshesOf(t.o,isoHang[best]);
  });
  A.touch(3);
}
A.frameFns.push(function(){                         // a wall steps aside while you are behind it
  if(!iso) return;
  const c=A.camera.position; let key='';
  for(let i=0;i<isoWalls.length;i++){const w=A.walls[isoWalls[i]]; key+=(c.x-w.a[0])*w.n[0]+(c.z-w.a[1])*w.n[1]<-0.05?'1':'0';}
  if(key===nearKey) return; nearKey=key;
  isoWalls.forEach(function(k,i){const near=key[i]==='1'; A.walls[k].g.visible=!near; isoDoors[k].forEach(function(d){d.p.visible=!near;}); layer(isoHang[k],near?OFF:0);});
  A.touch(2);
});
A.layoutFns.push(function(){if(iso) isoBuild();});      // once pieces have finished moving, look again at what hangs where
function frameRoom(k,top,instant){
  const b=roomBox(k), t=new THREE.Vector3((b[0]+b[1])/2,0.8,(b[2]+b[3])/2), s=Math.max(b[1]-b[0],b[3]-b[2]);
  const d=(2.4+s*1.3)*Math.max(1,1.15*A.stage.clientHeight/Math.max(1,A.stage.clientWidth));
  if(top){A.fly(new THREE.Vector3(t.x,t.y+d*1.05,t.z+0.01),t,800,instant); return;}
  const c=A.camera.position, q=A.controls.target, el=0.9;
  const az=Math.hypot(c.x-q.x,c.z-q.z)<0.3?Math.atan2(0.5,0.6):Math.atan2(c.x-q.x,c.z-q.z);      // keep the side you are looking from
  A.fly(new THREE.Vector3(t.x+Math.sin(az)*Math.cos(el)*d,t.y+Math.sin(el)*d,t.z+Math.cos(az)*Math.cos(el)*d),t,800,instant);
}
function setIso(k,stay){
  k=k&&INSIDE[k]?k:null; if(k===iso) return;
  iso=k; deselect(); isoBuild(); renderIso();
  if(stay) return;
  if(k){frameRoom(k); toast(A.rooms[k].name+' on its own. Walls in your way step aside as you turn round it.');}
  else A.setView('3d');
}
function noteText(){
  if(!S.edit) return 'Tap a piece of furniture to see where to get it.';
  return (iso?A.rooms[iso].name+' on its own: walls between you and the room, with whatever hangs on them, step aside as you turn round it. ':'')+
    'Tap anything to swap it or change its colour. Long-press a piece and drag to move it. Tap the floor, a wall or the ceiling to paint it or to add something from IKEA.';
}
function renderIso(){
  const ch=$('isoChips'); for(let i=0;i<ch.children.length;i++) ch.children[i].setAttribute('aria-pressed',(ch.children[i].dataset.r||null)===iso);
  $('bIso').hidden=!iso||!S.edit; $('editNote').textContent=noteText();
}
$('isoChips').innerHTML='<button class="chip" data-r="" aria-pressed="true">Whole flat</button>'+ISO.map(function(k){return '<button class="chip" data-r="'+k+'" aria-pressed="false">'+esc(A.rooms[k].name)+'</button>';}).join('');
$('isoChips').onclick=function(e){const b=e.target.closest('[data-r]'); if(b) setIso(b.dataset.r||null);};
$('bIso').onclick=function(){setIso(null);};
const setView0=A.setView;
A.setView=function(v,instant){           // 3D and From above frame the room you are working on; the street brings the whole flat back
  if(iso&&v==='street') setIso(null,true);
  setView0(v,instant); if(iso) frameRoom(iso,v==='top',instant);
};

/* =====================================================================
   The panel: the Edit button and its bar
   ===================================================================== */
A.setEdit=function(on){
  if(!on) setIso(null,true);
  S.edit=on; $('bEdit').setAttribute('aria-pressed',on); $('bEdit').textContent=on?'Done editing':'Edit layout';
  document.body.classList.toggle('editing',on); deselect(); shopCard(null); renderBar();
  $('editNote').textContent=noteText();
  if(on&&!localSeen()) toast('Edit mode: tap to change, long-press to drag, tap an empty spot to add.');
};
function localSeen(){try{if(localStorage.getItem('haroe-edit-tip')) return true; localStorage.setItem('haroe-edit-tip','1');}catch(err){} return false;}
function renderBar(){
  const on=S.edit; $('editBar').hidden=!on; $('editTools').hidden=!on;
  $('bUndo').disabled=!undo.length; $('edUndo').disabled=!undo.length;
  const e=A.EDITS[S.design], dirty=!!(e&&(Object.keys(e.items).length||Object.keys(e.gone).length||Object.keys(e.t).length||Object.keys(e.c).length||Object.keys(e.f).length||Object.keys(e.paint||{}).length))||Object.keys(A.USER).some(function(k){return k[0]===S.design;});
  const pending=unsaved(); $('bSave').disabled=!pending; $('bSave').textContent=pending?'Save':'Saved';
  $('bResetMoves').disabled=!dirty; $('bShare').hidden=!dirty;
  renderIso();
  const pn=$('palNow'); if(palShown&&on){pn.hidden=false; pn.innerHTML='<b>'+esc(palShown.n)+'</b>'+['main','accent','soft','wood','case','case2','metal','rug'].map(function(r){return '<i style="background:'+hex(palShown[r])+'"></i>';}).join('');} else pn.hidden=true;
}
A.renderEdit=function(){renderBar(); try{localStorage.setItem('haroe10-design',S.design);}catch(err){} $('editNote').textContent=noteText();};
$('bEdit').onclick=function(){
  if(S.edit&&undo.length&&unsaved()&&confirm('Save your changes before you finish editing?\n\nCancel leaves them on screen without saving.')) doSave();
  A.setEdit(!S.edit);
};
$('bUndo').onclick=doUndo;
function doSave(){toast(save()?'Saved in this browser.':'Could not save: this browser is not keeping data.');}
$('bSave').onclick=doSave;
window.addEventListener('beforeunload',function(e){if(undo.length&&unsaved()){e.preventDefault(); e.returnValue='';}});
$('bPalette').onclick=function(){if(!S.edit) A.setEdit(true); applyPalette();};
$('bAddHere').onclick=function(){
  if(!S.edit) A.setEdit(true);
  aimCentre(); const f=new THREE.Vector3(); let pt=null;
  if(ray.ray.intersectPlane(floorPlane,f)&&inWork(f.x,f.z)) pt=f; else if(iso){const r=A.rooms[iso].rs[0]; pt=new THREE.Vector3((r[0]+r[1])/2,0,(r[2]+r[3])/2);} else pt=new THREE.Vector3(1.6,0,3.0);
  sel=null; hlFor=null; openAdd({kind:'floor',point:pt});
};
$('bResetMoves').onclick=function(){
  if(!confirm('Put this design back the way it was? Undo can bring your changes back.')) return;
  snap(); delete A.EDITS[S.design]; for(const k in A.USER) if(k[0]===S.design) delete A.USER[k]; palShown=null; deselect(); changed(); toast('Back to the original design. Save to keep it.');
};
$('bShare').onclick=function(){
  const d=S.design, u={}; for(const k in A.USER) if(k[0]===d) u[k]=A.USER[k];
  const s=btoa(unescape(encodeURIComponent(JSON.stringify({d:d,e:A.EDITS[d]||{},u:u})))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  const url=location.origin+location.pathname+'#e='+s;
  const done=function(){toast('Link copied. Whoever opens it sees this design with your changes.');};
  if(navigator.share&&('ontouchstart' in window)) navigator.share({title:'Haroe 10 · '+A.DESIGNS[d].title,url:url}).catch(function(){});
  else if(navigator.clipboard) navigator.clipboard.writeText(url).then(done,function(){prompt('Copy this link:',url);});
  else prompt('Copy this link:',url);
};
window.addEventListener('keydown',function(e){
  if(!S.edit||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
  if(e.key==='Escape') deselect();
  else if((e.key==='Delete'||e.key==='Backspace')&&sel){e.preventDefault(); removeSel();}
  else if((e.key==='z'||e.key==='Z')&&(e.ctrlKey||e.metaKey)){e.preventDefault(); doUndo();}
  else if((e.key==='s'||e.key==='S')&&(e.ctrlKey||e.metaKey)){e.preventDefault(); if(unsaved()) doSave();}
  else if((e.key==='r'||e.key==='R')&&sel&&!e.metaKey&&!e.ctrlKey) rotateSel(e.shiftKey?-R/12:R/12);
});
let toastT=0;
function toast(t){const el=$('toast'); el.textContent=t; el.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(function(){el.classList.remove('show');},3200);}
A.ed={att:att,bakedOf:bakedOf,houseThings:houseThings,roomAt:insideFlat,E:E,snap:snap,changed:changed,openAdd:openAdd,
  sel:function(){return sel;},selHit:function(){return selHit;},spot:function(){return spot;},mode:function(){return mode;},reopen:function(){if(mode==='add') openAdd(spot); else openItem();}};
A.editTest={solid:{ctx:solidCtx,canMove:canMove,slide:slide,settle:settle,pen:pen,poseShape:poseShape,localBox:localBox,fixed:fixedShapes,walls:wallShapes,set:setSolid,on:function(){return solidOn;}},
  select:function(t,c){select(t,c); openItem();},sel:function(){return sel;},addAt:addAt,swapTo:swapTo,applyPalette:applyPalette,openAdd:openAdd,openEket:openEket,setColour:function(i){snap(); setColour(sel,i,true); changed();},
  undo:doUndo,removeSel:removeSel,targetOf:targetOf,pickAt:function(x,y){aimAt(x,y); return pickAll();},att:att,thumbOf:thumbOf,ekGridAdd:function(gx,gy){const f=ekCfg(), T=A.EKM[ekType], m={t:ekType,x:gx,y:gy,c:ekCol}; if(ekFits(f.mods,m,-1)){f.mods.push(m); ekApply(f); return true;} return false;}};
})();
