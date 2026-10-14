/* Haroe 10 — no flicker. Two surfaces of different colour lying in the same plane fight over every pixel, and the winner changes as
   the camera moves: the shimmering stripes. Once everything is built, and again after furniture has moved, every pair of overlapping
   surfaces in one plane is found, and the one that belongs on top (the rug on the floor, the window in the wall, the poster on the
   cupboard) gets a small depth priority over the one under it, the way decals are drawn. Nothing moves; the search runs in a worker. */
(function(){
'use strict';
const A=window.APP, scene=A.scene;
const TOL=0.0012, WIN=0.0012;           // surfaces closer than this are a tie: which shows is a matter of choice, and without one they fight

/* ---------- the worker: every triangle in world space, its material and its look; back come pairs of materials, the first above the second ---------- */
const WORK=function(){
  onmessage=function(ev){
    const W=ev.data.W, mat=ev.data.mat, look=ev.data.look, thin=ev.data.thin, owner=ev.data.owner, n=mat.length, TOL=ev.data.TOL, WIN=ev.data.WIN;
    const N=new Float32Array(n*3), Dd=new Float64Array(n), Ar=new Float32Array(n), key=new Map();
    for(let i=0;i<n;i++){const o=i*9, ax=W[o],ay=W[o+1],az=W[o+2], bx=W[o+3]-ax,by=W[o+4]-ay,bz=W[o+5]-az, cx=W[o+6]-ax,cy=W[o+7]-ay,cz=W[o+8]-az;
      let nx=by*cz-bz*cy, ny=bz*cx-bx*cz, nz=bx*cy-by*cx; const l=Math.hypot(nx,ny,nz); if(l<2e-6||look[i]===0xffffffff) continue;
      nx/=l; ny/=l; nz/=l; N[i*3]=nx; N[i*3+1]=ny; N[i*3+2]=nz; Ar[i]=l/2; const d=nx*ax+ny*ay+nz*az; Dd[i]=d;
      const kk=(((Math.round(nx*40)+64)*128+(Math.round(ny*40)+64))*128+(Math.round(nz*40)+64))*4194304+(Math.floor(d/WIN)+2097152);
      let a=key.get(kk); if(!a){a=[]; key.set(kk,a);} a.push(i);}
    const px=new Float64Array(3), py=new Float64Array(3), qx=new Float64Array(3), qy=new Float64Array(3);
    function proj(i,ux,uy,uz,vx,vy,vz,X,Y){for(let k=0;k<3;k++){const o=i*9+k*3; X[k]=W[o]*ux+W[o+1]*uy+W[o+2]*uz; Y[k]=W[o]*vx+W[o+1]*vy+W[o+2]*vz;}}
    function sep(X,Y,U,V){        // a separating axis among the first triangle's edges? (shrunk by 3 mm, so touching edges do not count)
      for(let k=0;k<3;k++){const ex=X[(k+1)%3]-X[k], ey=Y[(k+1)%3]-Y[k], l=Math.hypot(ex,ey); if(l<1e-9) continue; const ax=-ey/l, ay=ex/l;
        let a0=1e9,a1=-1e9,b0=1e9,b1=-1e9; for(let m=0;m<3;m++){const p=X[m]*ax+Y[m]*ay; if(p<a0) a0=p; if(p>a1) a1=p; const q=U[m]*ax+V[m]*ay; if(q<b0) b0=q; if(q>b1) b1=q;}
        if(a1<=b0+0.003||b1<=a0+0.003) return true;}
      return false;}
    const votes=new Map();         // "front|back" -> overlapping area
    key.forEach(function(list,kk){
      const nb=key.get(kk+1); const all=nb?list.concat(nb):list; if(all.length<2) return;
      for(let x=0;x<list.length;x++){const i=list[x];
        const nx=N[i*3],ny=N[i*3+1],nz=N[i*3+2]; let ux,uy,uz; if(Math.abs(ny)<0.9){ux=nz; uy=0; uz=-nx;} else {ux=0; uy=-nz; uz=ny;} const ul=Math.hypot(ux,uy,uz); ux/=ul; uy/=ul; uz/=ul;
        const vx=ny*uz-nz*uy, vy=nz*ux-nx*uz, vz=nx*uy-ny*ux;
        let have=false;
        for(let y=0;y<all.length;y++){const j=all[y]; if(j===i) continue; if(y<list.length&&j<i) continue;
          if(look[i]===look[j]||mat[i]===mat[j]) continue; if(Math.abs(Dd[i]-Dd[j])>WIN) continue;
          if(nx*N[j*3]+ny*N[j*3+1]+nz*N[j*3+2]<0.999) continue;
          if(!have){proj(i,ux,uy,uz,vx,vy,vz,px,py); have=true;}
          proj(j,ux,uy,uz,vx,vy,vz,qx,qy);
          if(Math.max(px[0],px[1],px[2])<=Math.min(qx[0],qx[1],qx[2])+0.003||Math.max(qx[0],qx[1],qx[2])<=Math.min(px[0],px[1],px[2])+0.003) continue;
          if(Math.max(py[0],py[1],py[2])<=Math.min(qy[0],qy[1],qy[2])+0.003||Math.max(qy[0],qy[1],qy[2])<=Math.min(py[0],py[1],py[2])+0.003) continue;
          if(sep(px,py,qx,qy)||sep(qx,qy,px,py)) continue;
          /* which belongs on top: a flat surface over a solid's side; between two of a kind, the smaller (the rug, the poster) */
          const ai=Ar[i], aj=Ar[j], fi=thin[owner[i]]>100, fj=thin[owner[j]]>100; let s;      // f: a surface with no thickness, a wall's face, a floor, a picture
          if(Math.abs(Dd[i]-Dd[j])>TOL) s=Dd[i]>Dd[j]?i:j;
          else if(fi!==fj) s=fi?i:j;                                     // a surface beats the side of a solid block lying in its plane: the block is hidden behind it
          else if(Math.abs(ai-aj)>0.05*Math.max(ai,aj)) s=ai<aj?i:j; else s=thin[owner[i]]>=thin[owner[j]]?i:j;
          const g=s===i?j:i, vk=mat[s]+'|'+mat[g]; votes.set(vk,(votes.get(vk)||0)+Math.min(ai,aj));
        }}
    });
    const out=[]; votes.forEach(function(v,k){const p=k.split('|'); out.push(+p[0],+p[1],v);});
    postMessage({pairs:out});
  };
};
let worker=null;
if(!/[?&]nofix/.test(location.search)) try{worker=new Worker(URL.createObjectURL(new Blob(['('+WORK.toString()+')()'],{type:'text/javascript'})));}catch(e){worker=null;}

/* ---------- gather: every solid surface that is drawn, in world space ---------- */
function skipTree(o){for(;o;o=o.parent){if(o.userData&&(o.userData.live||o.userData.hl||o.userData.nofight)) return true;} return false;}
function shown(o){for(;o;o=o.parent){if(!o.visible) return false;} return true;}
const NONE=0xffffffff;
function usable(m){return m&&m.visible!==false&&m.blending!==THREE.AdditiveBlending&&m.depthTest!==false&&m.depthWrite!==false;}
function gather(){
  scene.updateMatrixWorld(true);
  const list=[]; let total=0;
  scene.traverse(function(o){
    if(!o.isMesh||o.isInstancedMesh||o.isSkinnedMesh||!o.geometry||!o.geometry.attributes.position) return;
    if(!shown(o)||skipTree(o)) return;
    if(![].concat(o.material).some(usable)) return;
    const g=o.geometry, cnt=g.index?g.index.count:g.attributes.position.count; list.push(o); total+=Math.floor(cnt/3);
  });
  const W=new Float32Array(total*9), mat=new Uint32Array(total), look=new Uint32Array(total), owner=new Uint32Array(total), thin=new Float32Array(list.length);
  const mats=[], mid=new Map(), lid=new Map();
  const matId=function(m){let i=mid.get(m); if(i===undefined){i=mats.length; mats.push(m); mid.set(m,i);} return i;};
  const lookId=function(m){const k=(m.color?m.color.getHex():-1)+'|'+(m.map?m.map.uuid:'')+'|'+(m.emissive?m.emissive.getHex():'')+'|'+(m.transparent?m.opacity:1)+'|'+(m.vertexColors?'v':'');
    let i=lid.get(k); if(i===undefined){i=lid.size; lid.set(k,i);} return i;};
  let t=0; const bb=new THREE.Box3(), sz=new THREE.Vector3();
  list.forEach(function(o,mi){
    const g=o.geometry, P=g.attributes.position, idx=g.index, cnt=idx?idx.count:P.count, e=o.matrixWorld.elements, ms=[].concat(o.material);
    if(!g.boundingBox) g.computeBoundingBox(); bb.copy(g.boundingBox).applyMatrix4(o.matrixWorld).getSize(sz); thin[mi]=1/(1e-3+Math.min(sz.x,sz.y,sz.z));
    const groups=(Array.isArray(o.material)&&g.groups.length)?g.groups:null;
    const ids=function(m){return usable(m)?[matId(m),lookId(m)]:[NONE,NONE];};
    const I0=ids(ms[0]), GI=groups?groups.map(function(gr){return ids(ms[gr.materialIndex]||ms[0]);}):null;
    for(let k=0;k+2<cnt;k+=3){
      let id=I0; if(groups){id=[NONE,NONE]; for(let q=0;q<groups.length;q++){const gr=groups[q]; if(k>=gr.start&&k<gr.start+gr.count){id=GI[q]; break;}}}
      mat[t]=id[0]; look[t]=id[1]; owner[t]=mi;
      for(let c=0;c<3;c++){const j=idx?idx.getX(k+c):k+c, x=P.getX(j), y=P.getY(j), z=P.getZ(j), o9=t*9+c*3;
        W[o9]=e[0]*x+e[4]*y+e[8]*z+e[12]; W[o9+1]=e[1]*x+e[5]*y+e[9]*z+e[13]; W[o9+2]=e[2]*x+e[6]*y+e[10]*z+e[14];}
      t++;
    }
  });
  return {W:W,mat:mat,look:look,owner:owner,thin:thin,mats:mats};
}
/* ---------- rank the materials: each sits a step above every material it was found lying on ---------- */
const above=new Map();          // material -> Map(material under it -> area), kept between runs so things that have moved on keep their order
function rank(job,pairs){
  for(let k=0;k<pairs.length;k+=3){const f=job.mats[pairs[k]], b=job.mats[pairs[k+1]]; let m=above.get(f); if(!m){m=new Map(); above.set(f,m);} m.set(b,Math.max(m.get(b)||0,pairs[k+2]));}
  // a cycle (a over b here, b over a there): the weaker claim gives way
  const level=new Map(), state=new Map(); let broken=0;
  function lv(m){
    const s=state.get(m); if(s===2) return level.get(m); if(s===1) return null;
    state.set(m,1); let best=0; const under=above.get(m);
    if(under){const ord=[...under.entries()].sort(function(a,b){return b[1]-a[1];});
      ord.forEach(function(e){const r=lv(e[0]); if(r===null){broken++; return;} best=Math.max(best,r+1);});}
    state.set(m,2); level.set(m,best); return best;
  }
  above.forEach(function(_,m){lv(m);});
  let set=0, top=0;
  level.forEach(function(r,m){
    if(m.userData.pf===undefined){m.userData.pf=m.polygonOffset?m.polygonOffsetFactor:0; m.userData.pu=m.polygonOffset?m.polygonOffsetUnits:0; m.userData.po=!!m.polygonOffset;}
    const f=m.userData.pf, u=m.userData.pu-2*Math.min(r,6);      // a fixed step per level and no slope term, so nothing a centimetre behind ever shows through
    if(r||m.userData.po){if(!m.polygonOffset||m.polygonOffsetFactor!==f||m.polygonOffsetUnits!==u){m.polygonOffset=true; m.polygonOffsetFactor=f; m.polygonOffsetUnits=u; m.needsUpdate=true; set++;}}
    if(r>top) top=r;
  });
  return {materials:set,levels:top,cycles:broken};
}
let busy=false, again=false;
function run(){
  if(!worker) return;
  if(busy){again=true; return;} busy=true; again=false;
  const g0=performance.now(), job=gather(), t0=performance.now();
  worker.onmessage=function(ev){
    const r=rank(job,ev.data.pairs);
    A.unfightLast={pairs:ev.data.pairs.length/3,materials:r.materials,levels:r.levels,cycles:r.cycles,ms:Math.round(performance.now()-t0),gather:Math.round(t0-g0),tris:job.mat.length};
    busy=false; if(again) setTimeout(run,50);
  };
  worker.postMessage({W:job.W,mat:job.mat,look:job.look,owner:job.owner,thin:job.thin,TOL:TOL,WIN:WIN},[job.W.buffer,job.mat.buffer,job.look.buffer,job.owner.buffer]);
}
let timer=0;
A.unfightSoon=function(ms){clearTimeout(timer); timer=setTimeout(run,ms==null?400:ms);};
A.unfight=run;
window.addEventListener('load',function(){A.unfightSoon(200);});
/* furniture that has moved into place, a design changed, the Sims setting up the table: look again once it has settled */
(function hook(){if(A.layoutFns){A.layoutFns.push(function(){A.unfightSoon(300);});} else setTimeout(hook,0);})();
})();
