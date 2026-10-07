/* Haroe 10 — catalog: the IKEA pieces you can place, swap and recolour in Edit mode.
   Every piece is built facing +x with its back at -x, its width along z, its origin on the floor in the middle of its
   footprint (a wall piece: at its bottom; a ceiling piece: on the floor under it). Sizes are catalogue sizes in cm:
   w along z, d along x, h up. Colours are the names IKEA sells them in. */
(function(){
'use strict';
const A=window.APP, K=A.kit, box=A.box, rbox=A.rbox, cyl=A.cyl, sph=A.sph, torus=A.torus, M=A.M, G=A.G, R=Math.PI, H=A.D.H;
const OAK=0xc99a5b, SAGE=0x8fbd9b, BLUE=0x9fc4d6, WHITE=0xfbfaf6, LINEN=0xefe7d6, RATTAN=0xd9c9a8, INK=0x3b4a44, BLACK=0x232323, STEEL=0xb9bdc0;
const CAT=A.CAT={};
A.CATS=[['sofa','Sofas'],['arm','Armchairs & poufs'],['table','Coffee & side tables'],['media','TV & media'],['shelf','Shelves & storage'],['eket','EKET & DIY'],
  ['dining','Tables & desks'],['chair','Chairs'],['lamp','Lamps'],['plant','Plants'],['decor','Decor'],['wall','On the wall'],['rug','Rugs'],['hall','Entrance & kitchen']];
const ROLE={sofa:'main',arm:'accent',table:'wood',media:'case',shelf:'case',eket:'case',dining:'wood',chair:'accent',lamp:'metal',plant:'pot',decor:'accent2',wall:'accent2',rug:'rug',hall:'case'};

/* ---------- colours ---------- */
const WOOD=A.surfaces.wood, WEAVE=A.surfaces.weave;
function skin(list,t){list.forEach(function(c){if(!A.texFor[c[1]]) A.texFor[c[1]]=t;}); return list;}
const C=A.IKEA={
  kivik:skin([['Tresund light beige',0xd5cab4],['Tibbleby beige/grey',0xb1a998],['Kelinge grey-turquoise',0x5d7c79],['Tresund anthracite',0x4a4b4e]],WEAVE),
  soder:skin([['Fridtuna light beige',0xd8cdb6],['Gransel natural',0xdfd5c1],['Tonerud grey',0x8e8e8a],['Fridtuna dark grey',0x535457],['Fridtuna dark grey-blue',0x3e4a59],['Viarp beige/brown',0xa79075],['Tonerud red',0x9a3a2f]],WEAVE),
  ektorp:skin([['Hallarp beige',0xcbbfa6],['Kilanda light beige',0xe1d8c6],['Remmarn light grey',0xc3c3bf],['Hallarp grey',0x8d8f8e]],WEAVE),
  vimle:skin([['Gunnared beige',0xc9b99c],['Hallarp beige',0xcbbfa6],['Gunnared medium grey',0x7d7e80],['Saxemara light blue',0x9fb3c2],['Djuparp dark green',0x2f4a3c]],WEAVE),
  landskrona:[['Grann/Bomstad golden-brown',0x9a6638],['Grann/Bomstad black',0x2a2826]].concat(skin([['Gunnared light green',0xa7b39a],['Gunnared dark grey',0x58595c]],WEAVE)),
  strandmon:skin([['Skiftebo yellow',0xd8a63b],['Kelinge grey-turquoise',0x5d7c79],['Djuparp dark green',0x2e4a3b],['Nordvalla dark grey',0x55585b],['Tommaboda brown-red',0x7a3a2d]],WEAVE),
  poang:skin([['Birch veneer, Hillared beige',0xcdbfa6,0xd9bf8c],['Birch veneer, Hillared anthracite',0x4c4d50,0xd9bf8c],['Birch veneer, Skiftebo yellow',0xd8a63b,0xd9bf8c],
    ['Birch veneer, Gunnared light green',0xa7b39a,0xd9bf8c],['Black-brown, Knisa light beige',0xdcd2bf,0x3a312c],['Black-brown, Hillared dark blue',0x2e3a52,0x3a312c],['Black-brown, Knisa black',0x26272a,0x3a312c]],WEAVE),
  ekero:skin([['Skiftebo yellow',0xd8a63b],['Kilanda light beige',0xe1d8c6],['Skiftebo dark grey',0x4f5154]],WEAVE),
  pouf:skin([['Beige',0xd6c7ab],['Linen',LINEN],['Light blue',BLUE],['Grey',0x9a9a96],['Sage',SAGE]],WEAVE),
  lam:[['White',0xf2f1ec]].concat(skin([['Black-brown',0x3a312c],['White stained oak effect',0xdad0be],['Oak effect',0xc8a06a],['Brown walnut effect',0x6d4932]],WOOD)),
  kallax:[['White',0xf2f1ec]].concat(skin([['Black-brown',0x3a312c],['White stained oak effect',0xdad0be]],WOOD),[['Green',0x6a775e]]),
  besta:[['White',0xf2f1ec]].concat(skin([['Black-brown',0x3a312c],['White stained oak effect',0xdad0be]],WOOD),[['Dark grey',0x4c4e51]]),
  eket:[['White',0xf1f0eb]].concat(skin([['White stained oak effect',0xdad0be]],WOOD),[['Beige',0xd6c8ae],['Light grey-blue',0xaabccb],['Dark grey-blue',0x3e4b5b],['Pale lilac',0xc9bfd8],['Dark grey',0x4c4e51]],skin([['Brown walnut effect',0x6d4932]],WOOD)),
  hemnes:skin([['White stain',0xeeebe3],['Light brown',0xb08559],['Black-brown',0x3a312c]],WOOD),
  ivar:skin([['Pine',0xe3c99d]],WOOD).concat([['Pine, painted sage (DIY)',0x93a891],['Pine, painted white (DIY)',0xf0eee8],['Pine, painted terracotta (DIY)',0xb8674a],['Pine, painted navy (DIY)',0x2f3b55]]),
  veneer:skin([['Oak veneer',OAK],['White stained oak veneer',0xdccfb7],['Walnut veneer',0x6b4630],['Dark brown',0x4a3426]],WOOD),
  birch:skin([['Birch veneer',0xd9bf8c]],WOOD).concat([['Black',0x2a2a2a],['White',0xf2f1ec]]),
  ourOak:skin([['Golden oak, as it is',0xb4803f],['Natural oak oil',0xc99a5b],['White oil',0xdccfb7],['Dark walnut stain',0x6b4630]],WOOD),
  metal:[['Black',BLACK],['White',0xf2f2ee],['Brass',0xb5924c],['Anthracite',0x3a3c3f]],
  pot:[['White',0xf2f1ec],['Terracotta',0xb5673f],['Black',0x2b2b2b],['Grey-green',0x8a9a86],['Beige',0xe6ddcd],['Rattan basket',RATTAN]],
  books:[['Mixed',0,null,K.bookCols],['Warm',0,null,['#9a3a2f','#d8a63b','#C99A5B','#F3EBDC','#6b4630','#e9c9a0','#b5673f']],
    ['Cool',0,null,['#3e4b5b','#9fc4d6','#5d7c79','#cfe3ec','#f7f7f2','#8fbd9b','#2e3a52']],['White spines',0,null,['#f7f7f2','#efe9dc','#e6ddcd','#d9d2c3','#fbfaf6']],
    ['Rainbow',0,null,['#d9463e','#e8a33a','#e8c91a','#6aa84f','#3d85c6','#674ea7','#f7f7f2']]],
  vase:[['Clear glass',0xcfe0e3,null,'glass'],['White',0xf2f1ec],['Green glass',0x5f8f6a,null,'glass'],['Amber glass',0xc7883a,null,'glass'],['Light blue',BLUE],['Terracotta',0xb5673f]],
  frame:skin([['Oak',OAK]],WOOD).concat([['Black',0x222222],['White',0xf4f4f0],['Gold',0xc9a23a]]),
  fabric:skin([['Linen',LINEN],['Sage',SAGE],['Light blue',BLUE],['Mustard',0xd8a63b],['Terracotta',0xb86a4a],['Dark grey',0x55585b],['White',0xf7f6f2]],WEAVE),
  rugSolid:skin([['Off-white',0xe7e1d3],['Beige',0xd2c4a6],['Light green',0xb4bfa2],['Medium grey',0x8f8f8b],['Dark grey',0x5a5b5d],['Light blue',0xb9cfda]],WEAVE)
};
function cols(list){return list.map(function(e){return {n:e[0],h:e[1],h2:e[2],x:e[3]};});}
const sh=A.shade=function(c,f){const q=new THREE.Color(c); q.multiplyScalar(f); return q.getHex();};
/* stretch a bar built 1 m long on x between two points in the xy plane */
function barXY(m,x0,y0,x1,y1){m.position.x=(x0+x1)/2; m.position.y=(y0+y1)/2; m.rotation.z=Math.atan2(y1-y0,x1-x0); m.scale.x=Math.hypot(x1-x0,y1-y0); return m;}
function legs(g,dx,dz,h,col,r,rt){[[-dx,-dz],[dx,-dz],[-dx,dz],[dx,dz]].forEach(function(q){cyl(r||0.018,h,col,q[0],h/2,q[1],g,10,rt);});}
function sqLegs(g,dx,dz,h,s,col){[[-dx,-dz],[dx,-dz],[-dx,dz],[dx,dz]].forEach(function(q){box(s,h,s,col,q[0],h/2,q[1],g);});}
function tvOn(g,x,y){box(0.24,0.03,0.5,0x101214,x,y+0.015,0,g); box(0.04,0.08,0.06,0x101214,x-0.02,y+0.06,0,g); K.tv(g,x-0.02,y+0.44,0);}   // a 55" TV on its stand
function glass(m,op){[].concat(m.material).forEach(function(q){q.transparent=true; q.opacity=op||0.4; q.depthWrite=false;}); m.castShadow=false; return m;}

/* ---------- the catalog itself ---------- */
function def(k,o,build){
  o.key=k; o.build=build; o.col=cols(o.col||[['Natural',0xd9c9a8]]); o.place=o.place||'floor'; o.role=o.role||ROLE[o.cat];
  o.q=o.q||o.n; o.lh=o.lh||(o.h/100+0.15);
  CAT[k]=o; return o;
}
/* build piece k into group g in colour ci; o carries cfg (its own settings) and ch (the room's light channel) */
A.buildItem=function(g,k,ci,cfg,room){
  const d=CAT[k]; if(!d) return null;
  const c=d.col[Math.max(0,Math.min(d.col.length-1,ci||0))];
  A.inRoom(room||'living',function(){d.build(g,c,{cfg:cfg||d.cfg||{},ch:'L:'+(room||'living'),room:room||'living'});});
  return d;
};
A.seatsFor=function(k,prefix){const d=CAT[k]; return (d&&d.seats||[]).map(function(s){return Object.assign({},s,{id:prefix+s.id,label:s.label||d.n});});};

/* ======================= SOFAS ======================= */
function sofa(g,c,o){
  const f=c.h, W=o.w, D=o.d, aw=o.aw, iw=W-2*aw, n=o.n, lh=o.lh, base=o.sh-o.ch, leg=o.legC==null?0x2a2622:o.legC, ci=o.chaise?(o.chaise>0?n-1:0):-1, cd=o.cd||0, cw=iw/n;
  const feet=[[-D/2+0.07,-W/2+0.07],[D/2-0.07,-W/2+0.07],[-D/2+0.07,W/2-0.07],[D/2-0.07,W/2-0.07]];
  if(o.chaise) feet.push([D/2+cd-0.07,o.chaise*(W/2-0.07)],[D/2+cd-0.07,o.chaise*(W/2-cw-aw+0.07)]);
  feet.forEach(function(q){cyl(o.lr||0.022,lh,leg,q[0],lh/2,q[1],g,10,o.lt);});
  rbox(D,base-lh,iw+0.04,f,0,lh+(base-lh)/2,0,g,0.04);                                                  // deck under the seat cushions
  if(o.chaise) rbox(cd+0.04,base-lh,cw+0.02,f,D/2+cd/2-0.02,lh+(base-lh)/2,o.chaise*(iw/2-cw/2),g,0.04);
  if(aw>0) [-1,1].forEach(function(e){
    const ext=o.chaise===e?cd:0, z=e*(W/2-aw/2), L=D+ext, x=ext/2;
    if(o.arm==='roll'){const hh=o.ah-lh-aw*0.45; rbox(L,hh,aw,f,x,lh+hh/2,z,g,0.04); cyl(aw*0.55,L,f,x,o.ah-aw*0.5,z,g,18).rotation.z=R/2;}
    else rbox(L,o.ah-lh,aw,f,x,lh+(o.ah-lh)/2,z,g,o.arm==='slab'?0.025:0.07,o.arm==='slab'?0.01:0.05);
  });
  rbox(o.bd,o.bh-base+0.02,iw+0.04,f,-D/2+o.bd/2,base+(o.bh-base)/2,0,g,0.06);                        // back frame
  const sd=D-o.bd-0.01, seam=sh(f,0.8);
  for(let i=0;i<n;i++){
    const z=-iw/2+cw*(i+0.5), ext=i===ci?cd:0;
    rbox(sd+ext,o.ch,cw-0.012,f,-D/2+o.bd+(sd+ext)/2,base+o.ch/2,z,g,0.06);                           // seat cushion
    box(sd+ext-0.03,0.004,cw-0.03,seam,-D/2+o.bd+(sd+ext)/2,base+o.ch/2,z,g).castShadow=false;           // its seam
    if(!o.tight){const b=rbox(o.bct,o.bch,cw-0.016,f,-D/2+o.bd+o.bct/2-0.03,base+o.ch+o.bch/2-0.03,z,g,0.08); b.rotation.z=o.tilt==null?0.14:o.tilt;}
  }
  if(o.tight) rbox(0.1,o.bh-base-o.ch,iw,f,-D/2+o.bd+0.04,base+o.ch+(o.bh-base-o.ch)/2,0,g,0.04);
}
function sofaSeats(o){
  const iw=o.w-2*o.aw, cw=iw/o.n, lx=(-o.d/2+o.bd+o.bct-0.03+o.d/2)/2-0.04, y=o.sh, out=[], z=function(i){return -iw/2+cw*(i+0.5);};
  if(o.n===1) return [{id:'',lx:lx,lz:0,y:y,type:'sit',recline:0.2}];
  out.push({id:'L',label:'Sofa, left',lx:lx,lz:z(0),y:y,type:'sit',recline:0.22});
  if(o.n>2) out.push({id:'M',label:'Sofa, middle',lx:lx,lz:o.n===3?0:z(1),y:y,type:'sit',recline:0.22});
  out.push({id:'R',label:'Sofa, right',lx:lx,lz:z(o.n-1),y:y,type:'sit',recline:0.22});
  if(iw>1.3) out.push({id:'Lie',label:'Sofa',lx:lx-0.04,lz:0,y:y+0.01,type:'lie',dh:-R/2});
  return out;
}
function sofaDef(k,n,o,meta){
  o=Object.assign({lh:0.025,sh:0.45,ch:0.17,bd:0.2,bct:0.22,bch:0.42,n:3},o);
  meta.w=Math.round(o.w*100); meta.d=Math.round((o.d+(o.cd||0))*100); meta.h=meta.h||83; meta.cat=meta.cat||'sofa'; meta.seats=sofaSeats(o); meta.seatAs=meta.seatAs||'sofa';
  return def(k,meta,function(g,c){sofa(g,c,o);});
}
const KV={w:2.28,d:0.95,aw:0.24,ah:0.64,bh:0.62};
sofaDef('kivik3',3,KV,{n:'KIVIK 3-seat sofa',q:'KIVIK 3-seat sofa',col:C.kivik,note:'Deep, soft seat with memory foam. Covers are removable and machine washable.'});
sofaDef('kivik4',4,Object.assign({},KV,{w:3.18,n:4}),{n:'KIVIK 4-seat sofa',q:'KIVIK 4-seat sofa',col:C.kivik,note:'318 cm: about the length of the sofa you have now.'});
sofaDef('kivik2',2,Object.assign({},KV,{w:1.9,n:2}),{n:'KIVIK 2-seat sofa',q:'KIVIK 2-seat sofa',col:C.kivik});
sofaDef('kivikChR',3,Object.assign({},KV,{w:2.8,chaise:-1,cd:0.68}),{n:'KIVIK 3-seat with chaise, right',q:'KIVIK 3-seat sofa with chaise longue',col:C.kivik,note:'The chaise is on your right as you face the sofa.'});
sofaDef('kivikChL',3,Object.assign({},KV,{w:2.8,chaise:1,cd:0.68}),{n:'KIVIK 3-seat with chaise, left',q:'KIVIK 3-seat sofa with chaise longue',col:C.kivik,note:'The chaise is on your left as you face the sofa.'});
sofaDef('soderhamn3',3,{w:1.98,d:0.99,aw:0.06,ah:0.6,bh:0.6,sh:0.4,ch:0.16,lh:0.1,legC:0x2a2622,arm:'slab',bct:0.2,bch:0.38,tilt:0.1},{n:'SÖDERHAMN 3-seat sofa',q:'SÖDERHAMN 3-seat sofa',col:C.soder,note:'Low and deep, with thin armrests and loose back cushions.'});
sofaDef('ektorp3',3,{w:2.18,d:0.88,aw:0.2,ah:0.66,bh:0.66,lh:0.02,arm:'roll'},{n:'EKTORP 3-seat sofa',q:'EKTORP 3-seat sofa',col:C.ektorp,h:88});
sofaDef('vimle3',3,{w:2.41,d:0.98,aw:0.15,ah:0.68,bh:0.62,sh:0.48},{n:'VIMLE 3-seat sofa',q:'VIMLE 3-seat sofa',col:C.vimle});
sofaDef('landskrona3',3,{w:2.04,d:0.89,aw:0.14,ah:0.62,bh:0.6,sh:0.44,ch:0.14,lh:0.17,legC:OAK,lr:0.02,lt:0.026,bct:0.18,bch:0.36},{n:'LANDSKRONA 3-seat sofa',q:'LANDSKRONA 3-seat sofa',col:C.landskrona,h:78,note:'Slim arms on tall wooden legs.'});
sofaDef('kivikArm',1,Object.assign({},KV,{w:1.1,n:1}),{n:'KIVIK armchair',q:'KIVIK armchair',col:C.kivik,cat:'arm',seatAs:null});

/* ======================= ARMCHAIRS AND POUFS ======================= */
def('strandmon',{n:'STRANDMON wing chair',cat:'arm',w:82,d:96,h:101,col:C.strandmon,seats:[{id:'',lx:0.08,lz:0,y:0.45,type:'sit',recline:0.15}]},function(g,c){
  const f=c.h, lg=0x4a3426;
  [[0.3,-0.31,0],[0.3,0.31,0],[-0.34,-0.31,0.22],[-0.34,0.31,0.22]].forEach(function(q){cyl(0.019,0.2,lg,q[0],0.1,q[1],g,10,0.026).rotation.z=q[2];});
  rbox(0.84,0.2,0.74,f,0,0.29,0,g,0.05); rbox(0.58,0.11,0.56,f,0.09,0.44,0,g,0.05);
  const b=rbox(0.16,0.78,0.76,f,-0.36,0.66,0,g,0.07); b.rotation.z=0.1;
  rbox(0.12,0.44,0.54,f,-0.25,0.7,0,g,0.05).rotation.z=0.12;
  [-1,1].forEach(function(e){
    rbox(0.66,0.24,0.13,f,0.06,0.5,e*0.345,g,0.05); cyl(0.075,0.66,f,0.06,0.62,e*0.35,g,14).rotation.z=R/2;
    rbox(0.34,0.46,0.1,f,-0.26,0.84,e*0.35,g,0.05).rotation.y=-e*0.12;
  });
});
def('poang',{n:'POÄNG armchair',cat:'arm',w:68,d:82,h:100,col:C.poang,seats:[{id:'',lx:0.04,lz:0,y:0.43,type:'sit',recline:0.3}]},function(g,c){
  const f=c.h, fr=c.h2;
  [-1,1].forEach(function(e){const z=e*0.31;
    box(0.74,0.025,0.045,fr,0,0.0125,z,g);
    barXY(box(1,0.03,0.045,fr,0,0,z,g),0.33,0.02,0.24,0.56); box(0.52,0.03,0.05,fr,0.04,0.57,z,g);
    barXY(box(1,0.03,0.045,fr,0,0,z,g),-0.36,0.02,-0.18,0.36);
    barXY(box(1,0.024,0.03,fr,0,0,e*0.285,g),0.27,0.39,-0.2,0.33); barXY(box(1,0.024,0.03,fr,0,0,e*0.285,g),-0.2,0.33,-0.46,1.0);
  });
  rbox(0.5,0.09,0.56,f,0.03,0.41,0,g,0.04).rotation.z=0.12;
  rbox(0.1,0.66,0.55,f,-0.28,0.73,0,g,0.04).rotation.z=0.42;
  cyl(0.06,0.53,f,-0.42,1.0,0,g,14).rotation.x=R/2;
});
def('ekero',{n:'EKERÖ armchair',cat:'arm',w:70,d:73,h:76,col:C.ekero,seats:[{id:'',lx:0.05,lz:0,y:0.43,type:'sit',recline:0.12}]},function(g,c){
  const f=c.h; [[0.26,-0.27],[0.26,0.27],[-0.26,-0.27],[-0.26,0.27]].forEach(function(q){cyl(0.018,0.17,0x3b2a1e,q[0],0.085,q[1],g,10,0.024);});
  rbox(0.7,0.14,0.68,f,0,0.24,0,g,0.04); rbox(0.5,0.1,0.52,f,0.08,0.36,0,g,0.04);
  rbox(0.12,0.52,0.7,f,-0.3,0.52,0,g,0.045).rotation.z=0.16;
  [-1,1].forEach(function(e){rbox(0.6,0.24,0.09,f,0.02,0.42,e*0.3,g,0.04);});
});
def('pouf',{n:'Round pouf',q:'SANDARED pouffe',cat:'arm',w:47,d:47,h:42,col:C.pouf,role:'soft',seats:[{id:'',label:'Pouf',lx:0,lz:0,y:0.42,type:'sit',face:true}]},function(g,c){K.pouf(g,c.h);});
def('kivikStool',{n:'KIVIK footstool with storage',cat:'arm',w:90,d:70,h:45,col:C.kivik,role:'main',seats:[{id:'',label:'Footstool',lx:0,lz:0,y:0.44,type:'sit',face:true}]},function(g,c){
  legs(g,0.29,0.39,0.03,0x2a2622,0.02); rbox(0.7,0.3,0.9,c.h,0,0.18,0,g,0.05); rbox(0.68,0.12,0.88,c.h,0,0.38,0,g,0.06);
});
def('poangStool',{n:'POÄNG footstool',cat:'arm',w:68,d:54,h:39,col:C.poang,seats:[{id:'',label:'Footstool',lx:0,lz:0,y:0.39,type:'sit',face:true}]},function(g,c){
  [-1,1].forEach(function(e){box(0.5,0.025,0.04,c.h2,0,0.0125,e*0.31,g); barXY(box(1,0.03,0.04,c.h2,0,0,e*0.3,g),-0.22,0.02,0.0,0.3); barXY(box(1,0.03,0.04,c.h2,0,0,e*0.3,g),0.22,0.02,0.0,0.3);});
  rbox(0.5,0.08,0.58,c.h,0,0.34,0,g,0.035);
});

/* ======================= COFFEE AND SIDE TABLES ======================= */
def('lackCT',{n:'LACK coffee table',cat:'table',w:90,d:55,h:45,col:C.lam},function(g,c){const f=c.h; box(0.55,0.05,0.9,f,0,0.425,0,g); sqLegs(g,0.245,0.42,0.4,0.05,f); box(0.5,0.02,0.82,f,0,0.12,0,g);});
def('listerby',{n:'LISTERBY coffee table',cat:'table',w:140,d:60,h:45,col:C.veneer},function(g,c){const f=c.h;
  box(0.6,0.035,1.4,f,0,0.4325,0,g); box(0.5,0.06,1.28,f,0,0.385,0,g); sqLegs(g,0.255,0.65,0.415,0.05,f); box(0.48,0.02,1.24,f,0,0.13,0,g);});
def('borgeby',{n:'BORGEBY coffee table',cat:'table',w:70,d:70,h:45,col:C.birch},function(g,c){const f=c.h;
  cyl(0.35,0.03,f,0,0.435,0,g,40); cyl(0.3,0.02,f,0,0.16,0,g,36); [0,1,2,3].forEach(function(i){const a=i*R/2+R/4; cyl(0.02,0.42,f,Math.cos(a)*0.24,0.21,Math.sin(a)*0.24,g,10);});});
def('hemnesCT',{n:'HEMNES coffee table',cat:'table',w:90,d:90,h:46,col:C.hemnes},function(g,c){const f=c.h;
  box(0.9,0.04,0.9,f,0,0.44,0,g); box(0.84,0.08,0.84,f,0,0.38,0,g); sqLegs(g,0.4,0.4,0.42,0.065,f); box(0.82,0.02,0.82,f,0,0.12,0,g);});
def('stockholmCT',{n:'STOCKHOLM coffee table',cat:'table',w:180,d:59,h:40,col:skinOne('Walnut veneer',0x6b4630)},function(g,c){const f=c.h;
  rbox(0.59,0.03,1.8,f,0,0.385,0,g,0.012,0.28); [[0.2,-0.7],[-0.2,-0.7],[0.2,0.7],[-0.2,0.7]].forEach(function(q){cyl(0.022,0.37,f,q[0],0.185,q[1],g,10,0.016).rotation.x=-Math.sign(q[1])*0.06;});
  rbox(0.46,0.02,1.5,f,0,0.14,0,g,0.008,0.2);});
function skinOne(n,h){skin([[n,h]],WOOD); return [[n,h]];}
def('nest',{n:'Nesting tables',q:'nesting tables set of 2',cat:'table',w:80,d:72,h:44,col:skin([['Oak and white',OAK,WHITE],['Black-brown and oak',0x3a312c,OAK]],WOOD).concat([['White',0xf2f1ec,0xf2f1ec]])},function(g,c,o){
  cyl(0.36,0.035,c.h,0,0.42,-0.12,g,36); [0,2.1,4.2].forEach(function(a){cyl(0.014,0.4,c.h2,Math.cos(a)*0.26,0.2,-0.12+Math.sin(a)*0.26,g,6);});
  cyl(0.24,0.03,c.h2,0.04,0.33,0.42,g,30); [0.5,2.6,4.7].forEach(function(a){cyl(0.012,0.32,c.h,0.04+Math.cos(a)*0.18,0.16,0.42+Math.sin(a)*0.18,g,6);});
  if(o.cfg.deco){box(0.22,0.015,0.3,LINEN,0,0.445,-0.15,g); K.candle(g,-0.05,0.452,-0.22,0.1); K.candle(g,0.05,0.452,-0.1,0.14); K.bush(g,0.04,0.345,0.42,0.06,BLUE);}
});
def('roundOak',{n:'Round pedestal table',q:'round coffee table oak 80',cat:'table',w:80,d:80,h:46,col:C.veneer},function(g,c,o){const f=c.h;
  cyl(0.4,0.04,f,0,0.42,0,g,48); torus(0.4,0.02,f,0,0.42,0,g).rotation.x=R/2; cyl(0.07,0.36,f,0,0.22,0,g,16,0.05); cyl(0.26,0.04,f,0,0.02,0,g,30);
  if(o.cfg.deco){box(0.26,0.015,0.26,LINEN,0.05,0.447,-0.08,g); K.candle(g,0.0,0.455,-0.12,0.1); K.candle(g,0.1,0.455,-0.04,0.14); K.bush(g,-0.15,0.44,0.14,0.05,BLUE);}
});
def('trunk',{n:'Storage chest table',q:'wooden storage trunk coffee table',site:'web',cat:'table',w:100,d:50,h:46,col:C.veneer},function(g,c,o){const f=c.h;
  box(0.5,0.38,1.0,f,0,0.23,0,g); box(0.52,0.04,1.02,sh(f,0.92),0,0.44,0,g);
  [-0.42,0.42].forEach(function(z){box(0.53,0.034,0.04,INK,0,0.445,z,g); box(0.004,0.38,0.04,INK,0.252,0.23,z,g);});
  [[-.2,-.44],[.2,-.44],[-.2,.44],[.2,.44]].forEach(function(p){box(0.05,0.04,0.05,INK,p[0],0.02,p[1],g);});
  if(o.cfg.deco){box(0.3,0.02,0.4,RATTAN,0,0.47,-0.15,g); K.candle(g,-0.04,0.48,-0.22,0.1); K.bookStack(g,0.02,0.46,0.25,3,9);}
});
def('gladom',{n:'GLADOM tray table',cat:'table',w:45,d:45,h:53,col:[['Black',0x262626],['White',0xf2f1ec],['Beige',0xd6c8ae],['Dark green',0x34493d]]},function(g,c){const f=c.h;
  cyl(0.225,0.012,f,0,0.52,0,g,36); torus(0.222,0.012,f,0,0.535,0,g).rotation.x=R/2;
  [0,2.09,4.19].forEach(function(a){const l=cyl(0.007,0.53,f,Math.cos(a)*0.15,0.26,Math.sin(a)*0.15,g,6); l.rotation.set(Math.sin(a)*0.13,0,-Math.cos(a)*0.13);});});
def('lackSide',{n:'LACK side table',cat:'table',w:55,d:55,h:45,col:C.lam},function(g,c){const f=c.h; box(0.55,0.05,0.55,f,0,0.425,0,g); sqLegs(g,0.245,0.245,0.4,0.05,f);});
def('burvik',{n:'BURVIK side table',cat:'table',w:38,d:38,h:78,col:[['White',0xf2f1ec],['Black',0x262626],['Light green',0xa7b39a]]},function(g,c){const f=c.h;
  cyl(0.19,0.02,f,0,0.42,0,g,32); torus(0.19,0.012,f,0,0.432,0,g).rotation.x=R/2;
  [0,2.09,4.19].forEach(function(a){cyl(0.008,0.42,f,Math.cos(a)*0.15,0.21,Math.sin(a)*0.15,g,6);});
  torus(0.1,0.01,f,0,0.68,0,g,R); cyl(0.008,0.26,f,-0.1,0.55,0,g,6); cyl(0.008,0.26,f,0.1,0.55,0,g,6);});
def('vittsjoNest',{n:'VITTSJÖ nesting tables',cat:'table',w:90,d:50,h:50,col:[['Black-brown, glass',0x2e2a28],['White, glass',0xf2f1ec]]},function(g,c){const f=c.h;
  [[0,-0.2,0.5,0.5,0.5],[0.02,0.25,0.45,0.42,0.42]].forEach(function(t){const x=t[0], z=t[1], hh=t[2], w=t[3];
    glass(box(w-0.02,0.008,w-0.02,0xcfe0e3,x,hh,z,g),0.35);
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){box(0.014,hh,0.014,f,x+q[0]*w/2,hh/2,z+q[1]*w/2,g);});
    [-1,1].forEach(function(s){box(w,0.014,0.014,f,x,hh-0.008,z+s*w/2,g); box(0.014,0.014,w,f,x+s*w/2,hh-0.008,z,g);});});});

/* ======================= TV AND MEDIA (each with the 55" TV standing on it) ======================= */
def('bestaTV',{n:'BESTÅ TV bench with doors, 180',q:'BESTÅ TV bench 180',cat:'media',w:180,d:42,h:48,lh:1.75,col:C.besta},function(g,c){const f=c.h;
  box(0.42,0.38,1.8,f,0,0.29,0,g); for(let i=0;i<3;i++) box(0.018,0.36,0.594,sh(f,0.97),0.219,0.29,-0.6+i*0.6,g);
  legs(g,0.17,0.84,0.1,STEEL,0.012); tvOn(g,-0.03,0.48);});
def('bestaFloat',{n:'BESTÅ wall bench, oak top',q:'BESTÅ TV bench 120 wall mounted',cat:'media',w:130,d:40,h:34,lh:1.75,col:C.besta,note:'Hang it 25 cm off the floor. The oak top is a plank laid on it.'},function(g,c,o){
  const f=c.h, y0=0.25; box(0.38,0.3,1.3,f,0,y0+0.15,0,g); box(0.4,0.025,1.32,OAK,0,y0+0.31,0,g);
  [-0.22,0.22].forEach(function(z){box(0.004,0.26,0.004,0xb9b3a4,0.191,y0+0.15,z,g);});
  K.tv(g,-0.05,y0+0.76,0); box(0.2,0.03,0.5,0x101214,-0.05,y0+0.34,0,g); box(0.04,0.1,0.06,0x101214,-0.05,y0+0.38,0,g);
  if(o.cfg.deco){K.bookStack(g,0.02,y0+0.325,-0.5,3,7); cyl(0.05,0.2,BLUE,0.02,y0+0.425,0.52,K.dec(g,'vase'),14,0.03); K.bush(g,0.02,y0+0.325,0.3,0.06);}
  A.pool(o.ch,0xffc47a,0.25,0.03,0,0.8,g,0.3);
});
def('havsta',{n:'HAVSTA TV bench',cat:'media',w:130,d:40,h:43,lh:1.75,col:[['White',0xf2f1ec,OAK],['Dark brown',0x4a3426,0x4a3426]],note:'A panelled bench; HEMNES is the simpler alternative.'},function(g,c,o){
  const f=c.h, y0=0.12; box(0.38,0.3,1.3,f,0,y0+0.15,0,g); box(0.4,0.025,1.32,c.h2,0,y0+0.31,0,g);
  [-0.22,0.22].forEach(function(z){box(0.004,0.26,0.004,0xb9b3a4,0.191,y0+0.15,z,g);});
  [[-.16,-.6],[.16,-.6],[-.16,.6],[.16,.6]].forEach(function(p){box(0.035,0.12,0.035,c.h2,p[0],0.06,p[1],g);});
  K.tv(g,-0.05,y0+0.76,0); box(0.2,0.03,0.5,0x101214,-0.05,y0+0.34,0,g); box(0.04,0.1,0.06,0x101214,-0.05,y0+0.38,0,g);
  if(o.cfg.deco){K.bookStack(g,0.02,y0+0.325,-0.5,3,7); cyl(0.05,0.2,BLUE,0.02,y0+0.425,0.52,K.dec(g,'vase'),14,0.03); K.bush(g,0.02,y0+0.325,0.3,0.06);}
});
def('hemnesTV',{n:'HEMNES TV bench',cat:'media',w:148,d:47,h:57,lh:1.85,col:C.hemnes},function(g,c){const f=c.h;
  box(0.47,0.03,1.48,f,0,0.555,0,g); box(0.45,0.03,1.44,f,0,0.12,0,g); [-0.72,0.72].forEach(function(z){box(0.46,0.47,0.04,f,0,0.335,z,g);});
  box(0.44,0.02,1.4,f,0,0.33,0,g); box(0.02,0.42,1.42,f,-0.22,0.34,0,g);
  [-0.36,0.36].forEach(function(z){box(0.02,0.18,0.66,sh(f,0.96),0.225,0.44,z,g); cyl(0.012,0.02,0xb08d4a,0.24,0.44,z,g,10).rotation.z=R/2;});
  box(0.03,0.1,1.48,f,0.2,0.05,0,g); tvOn(g,-0.04,0.57);});
def('lackTV',{n:'LACK TV bench',cat:'media',w:160,d:35,h:36,lh:1.6,col:C.lam},function(g,c){const f=c.h;
  box(0.35,0.05,1.6,f,0,0.335,0,g); box(0.35,0.05,1.6,f,0,0.025,0,g); [-0.78,0.78].forEach(function(z){box(0.35,0.26,0.04,f,0,0.18,z,g);}); box(0.33,0.02,1.52,f,0,0.18,0,g); tvOn(g,-0.03,0.36);});
def('kallaxTV',{n:'KALLAX 4 × 2, lying, as a TV bench',q:'KALLAX 147x77',cat:'media',w:147,d:39,h:77,lh:1.7,col:C.kallax},function(g,c,o){
  const k=K.kallax(g,o.cfg.rows||['    ','    '],c.h,{box:RATTAN,box2:SAGE});
  box(0.24,0.03,0.5,0x101214,0.02,k.h+0.015,0,g); box(0.04,0.08,0.06,0x101214,0.0,k.h+0.06,0,g); K.tv(g,0.0,k.h+0.44,0);
  if(o.cfg.deco) K.bush(g,0.04,k.h,-0.6,0.06,BLUE);
});
def('kallaxLegs',{n:'KALLAX on oak legs (DIY)',q:'KALLAX 147x42',cat:'eket',w:147,d:39,h:56,lh:1.55,col:C.kallax,note:'A KALLAX 1 × 4 laid on its side on four 15 cm screw-in oak legs, with two woven inserts. TV on top.'},function(g,c){
  const s=G(g); s.position.y=0.15; const k=K.kallax(s,['x  x'],c.h,{box:RATTAN});
  [[-0.15,-0.66],[0.15,-0.66],[-0.15,0.66],[0.15,0.66]].forEach(function(q){cyl(0.022,0.15,OAK,q[0],0.075,q[1],g,10,0.03);});
  tvOn(g,-0.02,0.15+k.h);
});

/* ======================= SHELVES AND STORAGE ======================= */
function kallaxDef(k,n,rows,w,h){def(k,{n:n,q:'KALLAX shelving unit',cat:'shelf',w:w,d:39,h:h,col:C.kallax},function(g,c,o){
  const kk=K.kallax(g,o.cfg.rows||rows,c.h,{box:o.cfg.box==null?RATTAN:o.cfg.box,box2:SAGE,seed:o.cfg.seed||0});
  if(o.cfg.top==='basket'){box(0.3,0.26,0.34,RATTAN,0,kk.h+0.13,0,K.dec(g,'insert')); K.pothos(g,0.1,kk.h,0,0.5,6);}
  if(o.cfg.tt){turntable(K.dec(g,'turntable'),0.02,kk.h,-kk.w/2+0.3,OAK,g); K.bush(g,0.02,kk.h,kk.w/2-0.2,0.07,0xe6ddcd);}
  if(o.cfg.top==='basket2'){box(0.3,0.2,0.34,RATTAN,0,kk.h+0.1,-0.17,K.dec(g,'insert')); K.pothos(g,0.02,kk.h,0.2,0.7,2);}
});}
kallaxDef('kallax1x4','KALLAX 1 × 4',[' ',' ',' ',' '],42,147);
kallaxDef('kallax2x2','KALLAX 2 × 2',['  ','  '],77,77);
kallaxDef('kallax2x4','KALLAX 2 × 4',['  ','  ','  ','  '],77,147);
kallaxDef('kallax4x4','KALLAX 4 × 4',['    ','    ','    ','    '],147,147);
kallaxDef('kallax4x2','KALLAX 4 × 2, lying',['    ','    '],147,77);
function billy(g,f,W,h,d,crown){
  const t=0.018; box(d,h,t,f,0,h/2,-W/2+t/2,g); box(d,h,t,f,0,h/2,W/2-t/2,g); box(d,t,W-2*t,f,0,h-t/2,0,g); box(0.012,0.07,W-2*t,f,d/2-0.02,0.035,0,g); box(d,t,W-2*t,f,0,0.07,0,g);
  box(0.004,h-0.02,W-0.02,sh(f,0.93),-d/2+0.002,h/2,0,g);
  for(let i=1;i<=5;i++) box(d-0.02,t,W-2*t-0.002,f,0.005,0.07+i*(h-0.09)/6,0,g);
  if(crown){box(d+0.04,0.04,W+0.04,f,0.02,h+0.02,0,g); box(0.03,0.09,W,f,d/2+0.01,0.045,0,g);}
}
def('billy',{n:'BILLY bookcase 80',cat:'shelf',w:80,d:28,h:202,col:C.lam},function(g,c){billy(g,c.h,0.8,2.02,0.28);});
def('billy40',{n:'BILLY bookcase 40',q:'BILLY bookcase 40x28x202',cat:'shelf',w:40,d:28,h:202,col:C.lam},function(g,c){billy(g,c.h,0.4,2.02,0.28);});
def('hemnesBook',{n:'HEMNES bookcase',cat:'shelf',w:90,d:37,h:197,col:C.hemnes},function(g,c){billy(g,c.h,0.9,1.93,0.37,true);});
def('ivar',{n:'IVAR shelving unit',q:'IVAR shelving unit 89x30x179',cat:'shelf',w:89,d:30,h:179,col:C.ivar},function(g,c,o){const f=c.h;
  [-1,1].forEach(function(e){const z=e*0.435; [-0.13,0.13].forEach(function(x){box(0.045,1.79,0.022,f,x,0.895,z,g);});
    for(let y=0.12;y<1.8;y+=0.32) box(0.24,0.02,0.018,f,0,y,z,g);});
  [0.1,0.55,1.0,1.42,1.77].forEach(function(y){box(0.3,0.02,0.85,f,0,y,0,g);});
  if(o.cfg.deco){K.books(g,0.0,0.11,-0.15,0.5,0.31,0.24,81); K.bush(g,0,0.11,0.25,0.09,0xb5673f); turntable(K.dec(g,'turntable'),0.03,0.56,-0.12,OAK,g);
    K.pothos(g,0,1.01,-0.25,0.5,26,0xf2f1ec); K.bookStack(g,0,1.01,0.18,4,13); K.bush(g,0,1.43,0.2,0.08,0xb5673f); K.pothos(g,0,1.78,0.1,0.75,29,0xe6ddcd);}});
function ivarCab(g,f,W,y0){
  box(0.3,0.83,W,f,0,y0+0.415,0,g); [-1,1].forEach(function(s){const z=s*W/4;
    box(0.02,0.8,W/2-0.006,sh(f,0.96),0.16,y0+0.415,z,g); box(0.004,0.62,W/2-0.12,sh(f,0.9),0.172,y0+0.415,z,g);
    cyl(0.012,0.02,sh(f,0.7),0.18,y0+0.6,z-s*(W/4-0.05),g,10).rotation.z=R/2;});
}
def('ivarCab',{n:'IVAR cabinet',q:'IVAR cabinet with doors 80x30x83',cat:'shelf',w:80,d:30,h:83,col:C.ivar},function(g,c){ivarCab(g,c.h,0.8,0);});
def('ivarSideboard',{n:'IVAR sideboard on legs (DIY)',q:'IVAR cabinet with doors 80x30x83',cat:'eket',w:160,d:30,h:106,col:C.ivar,note:'Two IVAR cabinets side by side, painted, on 20 cm screw-in legs, with an oak plank on top.'},function(g,c,o){
  [-0.4,0.4].forEach(function(z){const s=G(g); s.position.z=z; ivarCab(s,c.h,0.8,0.2);});
  [[-0.11,-0.76],[0.11,-0.76],[-0.11,0.76],[0.11,0.76]].forEach(function(q){cyl(0.018,0.2,OAK,q[0],0.1,q[1],g,10,0.026);});
  box(0.32,0.03,1.62,OAK,0,1.045,0,g);
  if(o.cfg.tt){turntable(K.dec(g,'turntable'),0.0,1.06,-0.4,OAK,g); K.books(g,0.0,1.06,0.35,0.3,0.31,0.24,91); K.bush(g,0,1.06,0.68,0.07,0xe6ddcd);}});
function drawers(g,f,W,D,h,cols,rows,y0,knob){
  box(D,h-y0,W,f,0,y0+(h-y0)/2,0,g); const dw=W/cols, dh=(h-y0-0.04)/rows;
  for(let i=0;i<cols;i++) for(let j=0;j<rows;j++){const z=-W/2+dw*(i+0.5), y=y0+0.02+dh*(j+0.5);
    box(0.016,dh-0.008,dw-0.008,sh(f,0.97),D/2+0.008,y,z,g);
    if(knob) cyl(0.014,0.024,knob,D/2+0.026,y,z,g,10).rotation.z=R/2; else box(0.004,0.012,dw*0.5,sh(f,0.75),D/2+0.017,y+dh/2-0.03,z,g);}
}
def('malm6',{n:'MALM chest of 6 drawers',cat:'shelf',w:160,d:48,h:78,col:C.lam},function(g,c){drawers(g,c.h,1.6,0.48,0.78,2,3,0.02);});
def('hemnes8',{n:'HEMNES chest of 8 drawers',cat:'shelf',w:160,d:50,h:96,col:C.hemnes},function(g,c){drawers(g,c.h,1.6,0.5,0.96,2,4,0.08,0xb08d4a); box(0.52,0.03,1.62,c.h,0.01,0.975,0,g);});
def('alex',{n:'ALEX drawer unit',cat:'shelf',w:36,d:58,h:70,col:[['White',0xf2f1ec],['Black-brown',0x3a312c],['Grey-turquoise',0x6d8a8a]]},function(g,c){drawers(g,c.h,0.36,0.58,0.7,1,5,0.01);});
def('trofast',{n:'TROFAST storage with boxes',cat:'shelf',w:99,d:44,h:56,col:[['White frame, white boxes',0xf2f1ec,0xf7f7f4],['White frame, light green boxes',0xf2f1ec,0xb7d3a8],['Pine frame, white boxes',0xe3c99d,0xf7f7f4],['Pine frame, grey-blue boxes',0xe3c99d,0x8fa3b8]]},function(g,c){
  const f=c.h; [-0.48,0.48].forEach(function(z){box(0.44,0.56,0.03,f,0,0.28,z,g);}); box(0.44,0.03,0.99,f,0,0.545,0,g); box(0.44,0.02,0.94,f,0,0.04,0,g);
  for(let i=0;i<2;i++) for(let j=0;j<2;j++) box(0.42,0.22,0.43,c.h2,0.01,0.06+0.115+j*0.235,-0.225+i*0.45,g);});
/* the oak shelf from your photos: solid oak boards, staggered uprights, on two V-shaped legs. 150 × 30 × 205 cm, four rows of 43 cm */
def('ourOak',{n:'Our oak shelf',q:'',site:'none',cat:'shelf',w:150,d:30,h:205,col:C.ourOak,note:'Measured from your two photos: about 150 cm wide, 30 cm deep and 205 cm tall, boards 4.5 cm thick, four rows 43 cm high. Rows 1 and 3 have two uprights with open ends; rows 2 and 4 have an upright at each end and one in the middle.'},function(g,c,o){
  const f=c.h, W=1.5, d=0.3, t=0.045, vl=0.1, row=(2.05-vl-t-4*t)/4;
  [-0.48,0.48].forEach(function(z){[-1,1].forEach(function(s){box(d-0.04,t,0.172,f,0,vl/2+0.008,z+s*0.07,g).rotation.x=-s*0.62;});});   // the two V legs, seen face on
  for(let i=0;i<5;i++){const y=vl+i*(row+t); box(d,t,W,f,0,y+t/2,0,g);
    if(i===4) break;
    const ups=i%2===0?[-0.25,0.25]:[-0.665,0,0.665];                  // rows 1 and 3: two uprights, open ends; rows 2 and 4: one at each end and one in the middle
    ups.forEach(function(z){box(d-0.01,row,t,f,-0.005,y+t+row/2,z,g);});}
  if(o.cfg.deco){
    const y2=vl+2*(row+t)+t, y1=vl+(row+t)+t, y3=vl+3*(row+t)+t;
    turntable(K.dec(g,'turntable'),0.03,y2,-0.5,OAK,g);
    K.books(g,0.0,y2,0.0,0.36,0.31,0.24,57,['#1F5A41','#9fc4d6','#f3ebdc','#C99A5B','#3b4a44']);
    K.books(g,0.0,y1,0.33,0.4,0.31,0.24,58); K.bush(g,0.0,y3,0.4,0.08,0xe6ddcd);
  }
});

/* ======================= EKET: cubes you combine ======================= */
const EKM=A.EKM={
  o:{w:1,h:1,n:'Open cube',q:'EKET cabinet 35x35x35'}, d:{w:1,h:1,n:'Cube with door',q:'EKET cabinet with door'}, w:{w:1,h:1,n:'Cube, 2 drawers',q:'EKET cabinet with 2 drawers'},
  O2:{w:2,h:1,n:'70 × 35 open',q:'EKET cabinet 70x35x35'}, W3:{w:2,h:1,n:'70 × 35, 3 drawers',q:'EKET cabinet with 3 drawers'}, O3:{w:3,h:1,n:'105 × 35, 3 compartments',q:'EKET cabinet 105x35x35'},
  T:{w:1,h:2,n:'35 × 70, door and shelf',q:'EKET cabinet with door and 1 shelf'}, Q:{w:2,h:2,n:'70 × 70, 4 compartments',q:'EKET cabinet with 4 compartments'}, D2:{w:2,h:2,n:'70 × 70, 2 doors',q:'EKET cabinet with 2 doors and 1 shelf'}
};
const EK=0.35, HALF=0.175;
A.eketBounds=function(cfg){let x0=1e9,x1=-1e9,y1=0; (cfg.mods||[]).forEach(function(m){const t=EKM[m.t]; x0=Math.min(x0,m.x*HALF); x1=Math.max(x1,m.x*HALF+t.w*EK); y1=Math.max(y1,m.y*HALF+t.h*EK);}); if(x0>x1){x0=0;x1=EK;} return {x0:x0,x1:x1,w:x1-x0,h:y1};};
function eketModule(g,t,col,dd,x,y,z){
  const T=EKM[t], w=T.w*EK, h=T.h*EK, p=0.014, f=col, fr=sh(col,0.975);
  box(dd,p,w,f,x,y+p/2,z,g); box(dd,p,w,f,x,y+h-p/2,z,g); box(dd,h,p,f,x,y+h/2,z-w/2+p/2,g); box(dd,h,p,f,x,y+h/2,z+w/2-p/2,g); box(0.006,h-0.02,w-0.02,sh(col,0.9),x-dd/2+0.003,y+h/2,z,g);
  const fx=x+dd/2+0.009;
  if(t==='d'||t==='T'){box(0.018,h-0.006,w-0.006,fr,fx,y+h/2,z,g); box(0.003,0.08,0.012,sh(col,0.8),fx+0.01,y+h/2,z+w/2-0.03,g); if(t==='T') box(dd-0.02,p,w-2*p,f,x,y+h/2,z,g);}
  else if(t==='w'||t==='W3'){const n=t==='w'?2:3; for(let i=0;i<n;i++){const dh=(h-0.006)/n; box(0.018,dh-0.004,w-0.006,fr,fx,y+0.003+dh*(i+0.5),z,g); box(0.004,0.012,w*0.4,sh(col,0.72),fx+0.011,y+0.003+dh*(i+1)-0.03,z,g);}}
  else if(t==='D2'){[-1,1].forEach(function(s){box(0.018,h-0.006,w/2-0.005,fr,fx,y+h/2,z+s*w/4,g); box(0.003,0.08,0.012,sh(col,0.8),fx+0.01,y+h/2,z+s*0.03,g);}); box(dd-0.02,p,w-2*p,f,x,y+h/2,z,g);}
  else{if(T.w>1) for(let i=1;i<T.w;i++) box(dd-0.01,h-2*p,p,f,x,y+h/2,z-w/2+i*EK,g); if(T.h>1) box(dd-0.01,p,w-2*p,f,x,y+h/2,z,g);}
}
function eket(g,c,o){
  const cfg=o.cfg, b=A.eketBounds(cfg), dd=(cfg.d||35)/100, y0=cfg.base==='legs'?0.1:cfg.base==='wall'?0:0.005, zc=(b.x0+b.x1)/2, EC=C.eket;
  (cfg.mods||[]).forEach(function(m){const T=EKM[m.t]; eketModule(g,m.t,EC[Math.max(0,Math.min(EC.length-1,m.c||0))][1],dd,0,y0+m.y*HALF,m.x*HALF+T.w*EK/2-zc);
    if(cfg.base==='legs'&&m.y===0) [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){cyl(0.012,0.1,0x2b2b2b,q[0]*(dd/2-0.04),0.05,m.x*HALF-zc+(q[1]<0?0.04:T.w*EK-0.04),g,10);});});
  if(cfg.base==='wall') box(0.012,0.04,b.w-0.04,0x8d9092,-dd/2-0.004,b.h-0.06,0,g);      // the suspension rail
  if(cfg.tv){let top=0; cfg.mods.forEach(function(m){const T=EKM[m.t]; if(m.x*HALF<=zc+0.3&&m.x*HALF+T.w*EK>=zc-0.3) top=Math.max(top,m.y*HALF+T.h*EK);}); tvOn(g,-0.02,y0+top);}
  if(cfg.tt){let best=null; cfg.mods.forEach(function(m){const T=EKM[m.t], top=m.y*HALF+T.h*EK; if(T.w*EK>=0.35&&(!best||top>best.top)) best={top:top,z:m.x*HALF+T.w*EK/2-zc};}); if(best) turntable(K.dec(g,'turntable'),0.0,y0+best.top,best.z,OAK,g);}
}
function eketDef(k,n,cfg,meta){const b=A.eketBounds(cfg);
  return def(k,Object.assign({n:n,q:'EKET',cat:'eket',w:Math.round(b.w*100),d:cfg.d||35,h:Math.round(b.h*100)+(cfg.base==='legs'?10:0),col:C.eket,eket:true,cfg:cfg,place:cfg.base==='wall'?'wall':'floor',y:cfg.base==='wall'?(meta&&meta.y||0.9):0},meta||{}),eket);}
const m=function(t,x,y,c){return {t:t,x:x,y:y,c:c||0};};
eketDef('eketTV','EKET TV console',{base:'legs',tv:true,mods:[m('d',0,0),m('W3',2,0,3),m('d',6,0)]},{note:'Door, three drawers, door: 140 cm on legs, the TV on top. Long-press a cube in the builder to change it.'});
eketDef('eketLow','EKET low sideboard',{base:'legs',mods:[m('w',0,0,3),m('O2',2,0),m('d',6,0,3),m('d',8,0)]},{note:'Five cubes in a row on legs, 175 cm.'});
eketDef('eketStagger','EKET staggered pyramid',{base:'floor',mods:[m('o',0,0),m('d',2,0,3),m('w',4,0),m('o',1,2,3),m('d',3,2),m('o',2,4,1)]},{note:'Three, two and one cubes, each row shifted half a cube.'});
eketDef('eketStair','EKET staircase',{base:'floor',mods:[m('O3',0,0),m('O2',0,2,3),m('o',0,4)]});
eketDef('eketRecord','EKET record corner',{base:'legs',tt:true,mods:[m('Q',0,0),m('o',4,0,3),m('d',4,2,3)]},{note:'A 70 × 70 four-compartment unit holds the records; the turntable stands on top.'});
eketDef('eketHall','EKET entrance combo',{base:'legs',mods:[m('T',0,0),m('w',2,0,3),m('o',2,2)]},{note:'A tall cupboard for shoes, two drawers for keys, an open cube for a basket.'});
eketDef('eketColour','EKET colour block',{base:'legs',mods:[m('d',0,0,3),m('w',2,0,5),m('o',0,2,0),m('d',2,2,4)]},{note:'Four cubes, four colours.'});
eketDef('eketChecker','EKET checkerboard wall',{base:'wall',d:25,mods:[m('o',0,0),m('d',4,0,3),m('d',2,2,3),m('o',6,2),m('o',0,4,1),m('d',4,4)]},{y:0.85,note:'Six cubes hung in a checkerboard on the suspension rail.'});
eketDef('eketWall','EKET wall row',{base:'wall',mods:[m('O3',0,0),m('d',6,0,3)]},{y:1.1,note:'A floating row, 140 cm, on the suspension rail.'});
eketDef('eketCube','EKET single cube',{base:'floor',mods:[m('d',0,0)]});

/* ======================= OTHER DIY ======================= */
def('lackStair',{n:'LACK wall shelves, staggered (DIY)',q:'LACK wall shelf 110x26',cat:'eket',place:'wall',y:1.0,w:150,d:26,h:70,col:C.lam},function(g,c){[[0,-0.2],[0.33,0.2],[0.66,-0.2]].forEach(function(q){box(0.26,0.05,1.1,c.h,0,q[0]+0.025,q[1],g);});});
def('mosslandaRecords',{n:'Record ledges (MOSSLANDA)',q:'MOSSLANDA picture ledge 115',cat:'eket',place:'wall',y:1.1,w:115,d:12,h:80,col:[['White',0xf2f1ec],['Black',0x262626]].concat(skinOne('Oak effect',0xc8a06a))},function(g,c){
  [0,0.38].forEach(function(y,i){box(0.12,0.02,1.15,c.h,0,y+0.01,0,g); box(0.02,0.04,1.15,c.h,0.05,y+0.03,0,g);
    for(let j=0;j<3;j++){const rec=box(0.008,0.31,0.31,[0x1F5A41,0xd8a63b,0x9fc4d6,0xb5673f,0x3b4a44,0xf3ebdc][(i*3+j)%6],-0.04,y+0.17,-0.38+j*0.38,K.dec(g,'record')); rec.rotation.z=0.06;}});});
def('skadis',{n:'SKÅDIS pegboard',cat:'eket',place:'wall',y:1.0,w:76,d:12,h:56,col:[['White',0xf2f1ec],['Wood',0xd9bf8c],['Grey-green',0x8a9a86]]},function(g,c){
  const tex=A.canvasTex(128,96,function(q){q.fillStyle='#'+('00000'+c.h.toString(16)).slice(-6); q.fillRect(0,0,128,96); q.fillStyle='rgba(0,0,0,.35)'; for(let x=6;x<128;x+=10) for(let y=6;y<96;y+=10) q.fillRect(x,y,2,5);});
  box(0.02,0.56,0.76,c.h,-0.05,0.28,0,g); const m=new THREE.Mesh(new THREE.PlaneGeometry(0.76,0.56),A.MT(tex,null,true)); m.position.set(-0.039,0.28,0); m.rotation.y=R/2; g.add(m);
  box(0.1,0.12,0.16,0xf2f1ec,0.0,0.3,-0.2,g); cyl(0.04,0.1,0x8a9a86,0.0,0.15,0.18,g,12); box(0.09,0.012,0.3,c.h,0.0,0.42,0.12,g);});

/* ======================= TABLES AND DESKS ======================= */
def('ingatorp',{n:'INGATORP round table',q:'INGATORP extendable table',cat:'dining',w:110,d:110,h:74,col:[['White',0xf2f1ec],['Black-brown',0x3a312c]]},function(g,c){
  cyl(0.55,0.035,c.h,0,0.72,0,g,48); cyl(0.5,0.08,c.h,0,0.66,0,g,40); [0,1,2,3].forEach(function(i){const a=i*R/2+R/4; cyl(0.03,0.66,c.h,Math.cos(a)*0.38,0.33,Math.sin(a)*0.38,g,10,0.024);});});
def('morbylanga',{n:'MÖRBYLÅNGA table 140',q:'MÖRBYLÅNGA table',cat:'dining',w:140,d:85,h:74,col:skin([['Oak veneer, brown stained',0x7a5233]],WOOD).concat(C.veneer.slice(0,1))},function(g,c){
  box(0.85,0.04,1.4,c.h,0,0.72,0,g); sqLegs(g,0.35,0.62,0.7,0.07,c.h); box(0.72,0.08,1.26,c.h,0,0.66,0,g);});
def('lisabo',{n:'LISABO table',cat:'dining',w:140,d:78,h:74,col:skin([['Ash veneer',0xd8c3a0]],WOOD).concat([['Black',0x262626]])},function(g,c){
  box(0.78,0.03,1.4,c.h,0,0.725,0,g); [[-0.33,-0.62],[0.33,-0.62],[-0.33,0.62],[0.33,0.62]].forEach(function(q){cyl(0.025,0.71,c.h,q[0],0.355,q[1],g,10,0.02).rotation.set(q[1]*0.04,0,-q[0]*0.08);});});
def('micke',{n:'MICKE desk',cat:'dining',w:105,d:50,h:75,col:[['White',0xf2f1ec],['Black-brown',0x3a312c]],seats:[{id:'',label:'Desk',lx:0.55,lz:-0.1,y:0.5,type:'sit',dh:R}]},function(g,c){
  box(0.5,0.025,1.05,c.h,0,0.7375,0,g); const a=G(g); a.position.z=0.33; drawers(a,c.h,0.35,0.48,0.725,1,3,0.0);
  box(0.48,0.72,0.02,c.h,0,0.36,-0.515,g); box(0.02,0.4,0.66,c.h,-0.23,0.52,-0.16,g);});
def('lagkapten',{n:'LAGKAPTEN / ALEX desk',cat:'dining',w:140,d:60,h:73,col:[['White',0xf2f1ec,0xf2f1ec]].concat(skin([['White stained oak effect, white',0xdad0be,0xf2f1ec],['Black-brown, black-brown',0x3a312c,0x3a312c]],WOOD))},function(g,c){
  box(0.6,0.03,1.4,c.h,0,0.715,0,g); const a=G(g); a.position.z=0.5; drawers(a,c.h2,0.36,0.58,0.7,1,5,0.01);
  [-0.25,0.25].forEach(function(x){cyl(0.025,0.7,c.h2,x,0.35,-0.64,g,10);});});
def('officeChair',{n:'Office chair',q:'MILLBERGET swivel chair',cat:'chair',w:60,d:60,h:110,col:skin([['Murum black',0x2b2c2e],['Bomstad white',0xe9e8e3],['Vissle dark grey',0x55585b],['Gunnared light green',0xa7b39a]],WEAVE),seats:[{id:'',lx:0.02,lz:0,y:0.52,type:'sit'}]},function(g,c){K.officeChair(g,c.h);});
function chairDef(k,n,col,meta){return def(k,Object.assign({n:n,cat:'chair',w:41,d:47,h:90,col:col,seats:[{id:'',lx:0.02,lz:0,y:0.5,type:'sit'}]},meta||{}),function(g,c){K.chair(g,c.h,c.h2==null?c.h:c.h2);});}
chairDef('ingolf','INGOLF chair',[['White',0xf4f4f1,0xf4f4f1],['White, sage seat',0xf4f4f1,SAGE],['White, light blue seat',0xf4f4f1,BLUE],['Brown-black',0x3a312c,0x3a312c]]);
chairDef('terje','TERJE folding chair',skin([['Beech',0xd2b07a,0xd2b07a]],WOOD).concat([['White',WHITE,WHITE],['White, sage seat',WHITE,SAGE]]));
chairDef('odger','ODGER chair',[['White/beige',0xece6da,0xd8c8a6],['Anthracite',0x3a3c3f,0x3a3c3f],['Blue',0x3e5a80,0x3e5a80]]);
chairDef('lisaboChair','LISABO chair',skin([['Ash veneer',0xd8c3a0,0xd8c3a0]],WOOD).concat([['Black',0x262626,0x262626]]));

/* ======================= LAMPS ======================= */
function lampDef(k,meta,build){return def(k,Object.assign({cat:'lamp',role:'metal'},meta),build);}
lampDef('floorLamp',{n:'ÅRSTID floor lamp',q:'ÅRSTID floor lamp',w:34,d:34,h:155,col:[['Brass, white shade',0xb5924c],['Black, white shade',BLACK]]},function(g,c,o){
  cyl(0.14,0.03,c.h,0,0.015,0,g,20); cyl(0.011,1.42,c.h,0,0.72,0,g,8); cyl(0.17,0.26,A.lampMat(o.ch,0xefe6d2,null,0.5),0,1.52,0,g,24,0.14); A.pool(o.ch,0xffc47a,0,0.03,0,1.1,g,0.5);});
lampDef('arcLamp',{n:'Arc floor lamp',q:'arc floor lamp',w:40,d:100,h:200,col:[['Brass',0xb5924c],['Black',BLACK]]},function(g,c,o){
  cyl(0.17,0.035,0x2a2a2a,0,0.018,0,g,24); cyl(0.012,1.5,c.h,0,0.78,0,g,8); torus(0.55,0.012,c.h,0.55,1.5,0,g,R/2).rotation.y=R;
  cyl(0.21,0.17,A.lampMat(o.ch,0xefe6d2,null,0.5),0.62,1.95,0,g,24,0.07); A.pool(o.ch,0xffc47a,0.62,0.03,0,1.25,g,0.5);});
lampDef('hektar',{n:'HEKTAR floor lamp',w:40,d:40,h:181,col:[['Dark grey',0x3d3f41],['Beige',0xc9b99c]]},function(g,c,o){
  cyl(0.15,0.03,c.h,0,0.015,0,g,24); cyl(0.014,1.55,c.h,0,0.8,0,g,8); const s=G(g); s.position.set(0.08,1.62,0); s.rotation.z=-0.5;
  cyl(0.2,0.3,c.h,0,0,0,s,24,0.07); cyl(0.19,0.012,A.lampMat(o.ch,0xf4eedf,0xffe2b0,1),0,-0.15,0,s,24); A.pool(o.ch,0xffc47a,0.35,0.03,0,1.1,g,0.5);});
lampDef('nymane',{n:'NYMÅNE reading lamp',w:30,d:50,h:150,col:[['Anthracite',0x3a3c3f],['White',0xf2f2ee]]},function(g,c,o){
  cyl(0.13,0.025,c.h,0,0.012,0,g,22); cyl(0.012,1.4,c.h,0,0.71,0,g,8); barXY(box(1,0.02,0.02,c.h,0,0,0,g),0,1.4,0.32,1.46);
  cyl(0.05,0.14,c.h,0.36,1.4,0,g,18,0.035); cyl(0.045,0.01,A.lampMat(o.ch,0xf4eedf,0xffe2b0,1),0.36,1.33,0,g,18); A.pool(o.ch,0xffc47a,0.36,0.03,0,0.9,g,0.55);});
lampDef('tagarp',{n:'TÅGARP uplighter',w:30,d:30,h:175,col:[['Black, white',BLACK],['White',0xf2f2ee]]},function(g,c,o){
  cyl(0.13,0.025,c.h,0,0.012,0,g,22); cyl(0.012,1.62,c.h,0,0.82,0,g,8); cyl(0.22,0.12,A.lampMat(o.ch,0xf4f1e8,0xffe7bb,0.7),0,1.7,0,g,24,0.05).rotation.x=R;
  A.pool(o.ch,0xffd9a0,0,H-0.02,0,1.4,g,0.35); A.pool(o.ch,0xffc47a,0,0.03,0,1.3,g,0.25);});
lampDef('vidja',{n:'VIDJA floor lamp',w:22,d:22,h:138,col:[['White',0xf4f1e8]]},function(g,c,o){
  cyl(0.11,0.02,0x2b2b2b,0,0.01,0,g,20); cyl(0.11,1.3,A.lampMat(o.ch,c.h,0xffe2b0,0.8),0,0.69,0,g,24); A.pool(o.ch,0xffc47a,0,0.03,0,1.0,g,0.5);});
lampDef('lautersF',{n:'LAUTERS floor lamp',w:50,d:50,h:154,col:skin([['Brown ash, white',0x8a6a48]],WOOD).concat([['White',0xf2f2ee]])},function(g,c,o){
  [0,2.1,4.2].forEach(function(a){const l=cyl(0.014,1.1,c.h,Math.cos(a)*0.12,0.55,Math.sin(a)*0.12,g,8); l.rotation.set(Math.sin(a)*0.11,0,-Math.cos(a)*0.11);});
  cyl(0.016,0.3,c.h,0,1.2,0,g,8); cyl(0.2,0.28,A.lampMat(o.ch,0xf4eedf,null,0.55),0,1.4,0,g,26,0.17); A.pool(o.ch,0xffc47a,0,0.03,0,1.1,g,0.5);});
/* table lamps stand on whatever you tap */
lampDef('tableLamp',{n:'ÅRSTID table lamp',place:'top',w:22,d:22,h:55,col:[['Brass, white shade',0xb5924c],['Black, white shade',BLACK]]},function(g,c,o){
  cyl(0.06,0.012,c.h,0,0.006,0,g,16); cyl(0.008,0.36,c.h,0,0.19,0,g,8); cyl(0.11,0.18,A.lampMat(o.ch,0xefe6d2,null,0.5),0,0.44,0,g,22,0.09); A.pool(o.ch,0xffc47a,0,0.012,0,0.5,g,0.5);});
lampDef('lautersT',{n:'LAUTERS table lamp',place:'top',w:33,d:33,h:57,col:skin([['Brown ash, white',0x8a6a48]],WOOD)},function(g,c,o){
  cyl(0.07,0.025,c.h,0,0.012,0,g,16); cyl(0.012,0.32,c.h,0,0.18,0,g,8); cyl(0.165,0.22,A.lampMat(o.ch,0xf4eedf,null,0.55),0,0.45,0,g,24,0.12); A.pool(o.ch,0xffc47a,0,0.012,0,0.55,g,0.5);});
lampDef('fado',{n:'FADO table lamp',place:'top',w:25,d:25,h:24,col:[['White glass',0xf4f1e8]]},function(g,c,o){cyl(0.05,0.03,0xeeeeea,0,0.015,0,g,16); sph(0.125,A.lampMat(o.ch,c.h,0xffdca6,0.9),0,0.14,0,g); A.pool(o.ch,0xffc47a,0,0.012,0,0.5,g,0.5);});
lampDef('regolit',{n:'REGOLIT paper pendant',q:'REGOLIT pendant lamp shade',place:'ceil',w:45,d:45,h:60,col:[['White paper',0xf4eedf]]},function(g,c,o){K.pendant(g,0,H-0.55,0,o.ch,'paper');});
lampDef('misterhult',{n:'MISTERHULT bamboo pendant',place:'ceil',w:36,d:36,h:60,col:skin([['Bamboo',0xd2b07a]],WOOD)},function(g,c,o){K.pendant(g,0,H-0.55,0,o.ch,'rattan');});
lampDef('hektarP',{n:'HEKTAR pendant',place:'ceil',w:38,d:38,h:60,col:[['Dark grey',0x3d3f41],['Sage',0x7b8a60]]},function(g,c,o){K.pendant(g,0,H-0.5,0,o.ch,'dome',c.h,1.3);});

/* ======================= PLANTS ======================= */
function plantDef(k,meta,build){return def(k,Object.assign({cat:'plant',role:'pot',col:C.pot},meta),build);}
plantDef('monstera',{n:'Monstera',q:'FEJKA monstera',w:90,d:90,h:120},function(g,c,o){K.monstera(g,0,0,1.15,o.cfg.seed||11,c.h);});
plantDef('fiddle',{n:'Fiddle-leaf fig',q:'FEJKA fiddle leaf fig',w:60,d:60,h:165},function(g,c,o){K.fiddle(g,0,0,1.65,o.cfg.seed||5,c.h);});
plantDef('snake',{n:'Snake plant',q:'snake plant pot',w:35,d:35,h:95},function(g,c,o){const s=G(g); s.scale.setScalar(1.35); K.snake(s,0,0,0.7,o.cfg.seed||3,c.h);});
plantDef('olive',{n:'Olive tree',q:'FEJKA olive tree',w:60,d:60,h:150},function(g,c,o){
  const p=K.dec(g,'plant'); K.pot(p,0,0,0.19,0.32,c.h); const f=K.foliage(p), r=A.rng(o.cfg.seed||21);
  cyl(0.022,0.95,0x6b5a46,0,0.75,0,p,8,0.016).rotation.z=0.05;
  [[0,1.22,0,0.3],[0.12,1.05,0.1,0.22],[-0.1,1.1,-0.08,0.24]].forEach(function(q){for(let i=0;i<34;i++){const a=r()*6.283, t=r()*1.4;
    f.at(q[0]+Math.sin(a)*q[3]*0.4,q[1]+(r()-0.5)*q[3]*0.6,q[2]+Math.cos(a)*q[3]*0.4,a,t+0.3,(r()-0.5)).leaf(0.035,0.12,'oval',0.2);}});
  f.done();});
plantDef('palm',{n:'Kentia palm',q:'FEJKA palm',w:80,d:80,h:160},function(g,c,o){
  const p=K.dec(g,'plant'); K.pot(p,0,0,0.2,0.34,c.h); const f=K.foliage(p), r=A.rng(o.cfg.seed||31);
  for(let s=0;s<10;s++){
    const a=s/10*6.283+r()*0.5, lean=0.12+r()*0.45, L=0.85+r()*0.45, droop=0.5+r()*0.5;
    let px=0, py=0.32, pz=0;                                       // walk out along an arching frond: three stem pieces, leaflets on both sides
    for(let j=0;j<6;j++){const t=j/6, tilt=lean+t*t*droop*2.2, seg=L/6;
      f.at(px,py,pz,a,tilt).stem(0.01,seg);
      const nx=px+Math.sin(a)*Math.sin(tilt)*seg, ny=py+Math.cos(tilt)*seg, nz=pz+Math.cos(a)*Math.sin(tilt)*seg;
      if(j>0) for(let i=0;i<3;i++){const u=i/3, qx=px+(nx-px)*u, qy=py+(ny-py)*u, qz=pz+(nz-pz)*u, len=0.3*(1.15-t*0.6);
        [-1,1].forEach(function(e){f.at(qx,qy,qz,a+e*1.25,tilt+0.9,e*0.25).leaf(0.045,len,'oval',0.35);});}
      px=nx; py=ny; pz=nz;}
  }
  f.done();});
plantDef('satsumas',{n:'SATSUMAS plant stand',cat:'plant',w:36,d:36,h:125,col:skin([['Bamboo, with plants',0xd2b07a]],WOOD)},function(g,c){
  [-1,1].forEach(function(e){[-1,1].forEach(function(s){cyl(0.012,1.25,c.h,e*0.16,0.625,s*0.16,g,8);});});
  [0.25,0.62,1.0].forEach(function(y,i){box(0.34,0.02,0.34,c.h,0,y,0,g); if(i===0) K.pothos(g,0,y+0.01,0,0.25,71,0xf2f1ec); else K.bush(g,0,y+0.01,0,0.075,i===1?0xb5673f:0xf2f1ec);});});
plantDef('hangingPlant',{n:'Hanging pothos',place:'ceil',w:30,d:30,h:80,col:C.pot},function(g,c,o){const p=K.dec(g,'hanging'); cyl(0.003,0.6,0x6f6a60,0,H-0.3,0,p,5); K.pothos(p,0,H-0.72,0,0.6,o.cfg.seed||41,c.h);});
plantDef('pothosPot',{n:'Pothos in a pot',q:'plant pot',place:'top',w:22,d:22,h:30},function(g,c,o){K.pothos(g,0,0,0,0.35,o.cfg.seed||9,c.h);});
plantDef('smallPlant',{n:'Small leafy plant',q:'plant pot',place:'top',w:18,d:18,h:25},function(g,c){K.bush(g,0,0,0,0.08,c.h);});
plantDef('smallSnake',{n:'Small snake plant',q:'plant pot',place:'top',w:26,d:26,h:55},function(g,c,o){K.snake(g,0,0,0.5,o.cfg.seed||7,c.h);});
plantDef('cactus',{n:'Cactus',q:'plant pot',place:'top',w:14,d:14,h:30},function(g,c){const p=K.dec(g,'plant'); K.pot(p,0,0,0.07,0.1,c.h);
  cyl(0.035,0.2,0x4f7f4f,0,0.19,0,p,12,0.03); sph(0.032,0x4f7f4f,0,0.29,0,p); cyl(0.018,0.08,0x4f7f4f,0.045,0.2,0,p,10).rotation.z=-0.6; sph(0.018,0x4f7f4f,0.07,0.24,0,p);});

/* ======================= DECOR (stands on any surface you tap, or the floor) ======================= */
function decorDef(k,meta,build){return def(k,Object.assign({cat:'decor',place:'top',role:'accent2'},meta),build);}
decorDef('books',{n:'Row of books',q:'',site:'none',w:30,d:20,h:24,col:C.books},function(g,c,o){K.books(g,0,0,0,0.3,0.24,0.2,o.cfg.seed||61,c.x);});
decorDef('booksLong',{n:'Long row of books',q:'',site:'none',w:60,d:20,h:25,col:C.books},function(g,c,o){K.books(g,0,0,0,0.6,0.25,0.2,o.cfg.seed||63,c.x);});
decorDef('bookStack',{n:'Stack of books',q:'',site:'none',w:25,d:20,h:14,col:C.books},function(g,c,o){K.bookStack(g,0,0,0,4,o.cfg.seed||5,c.x);});
decorDef('vase',{n:'Tall vase with branches',q:'vase',w:12,d:12,h:60,col:C.vase},function(g,c){const p=K.dec(g,'vase');
  const v=cyl(0.06,0.24,c.h,0,0.12,0,p,18,0.04); const n=cyl(0.035,0.06,c.h,0,0.27,0,p,14,0.04); if(c.x==='glass'){glass(v,0.5); glass(n,0.5);}
  for(let i=0;i<5;i++){const s=cyl(0.003,0.45,0x6b5a46,0,0.45,0,p,4); s.rotation.set((i-2)*0.12,i,(i%2?1:-1)*0.1);}});
decorDef('vaseRound',{n:'Round vase',q:'vase',w:18,d:18,h:20,col:C.vase},function(g,c){const p=K.dec(g,'vase'); const v=sph(0.09,c.h,0,0.09,0,p,1,1,1); cyl(0.035,0.04,c.h,0,0.19,0,p,14); if(c.x==='glass') glass(v,0.5);});
decorDef('candles',{n:'Candles on a tray',q:'tray candles',w:30,d:20,h:15,col:[['Linen tray',LINEN],['Black tray',0x262626],['Brass tray',0xb5924c]]},function(g,c){
  box(0.2,0.012,0.3,c.h,0,0.006,0,g); K.candle(g,-0.03,0.012,-0.08,0.1); K.candle(g,0.04,0.012,0.0,0.14); K.candle(g,-0.02,0.012,0.08,0.07);});
decorDef('basket',{n:'Woven basket',q:'BRANÄS basket',w:34,d:32,h:32,col:skin([['Rattan',RATTAN],['Seagrass',0xb7a77a]],A.surfaces.rattan).concat([['Black',0x2b2b2b],['White',0xf2f1ec]])},function(g,c){
  const p=K.dec(g,'insert'); box(0.32,0.3,0.34,c.h,0,0.15,0,p); box(0.3,0.005,0.32,sh(c.h,0.6),0,0.299,0,p);});
function turntable(p,x,y,z,col,own){
  A.rbox(0.36,0.06,0.44,col,x,y+0.03,z,p,0.012); cyl(0.155,0.01,0xb9bdc0,x+0.01,y+0.065,z-0.02,p,32);
  const disc=new THREE.Mesh(new THREE.CylinderGeometry(0.148,0.148,0.006,40),[M(0x111214),A.MT(discTex(),null,true),M(0x111214)]);
  disc.position.set(x+0.01,y+0.074,z-0.02); disc.castShadow=true; p.add(disc);
  const arm=G(p); arm.position.set(x-0.13,y+0.086,z+0.17); cyl(0.018,0.03,0xb9bdc0,0,-0.005,0,arm,12); box(0.008,0.008,0.21,0xd9dcdc,0,0.012,-0.1,arm); box(0.022,0.014,0.035,0x2b2b2b,0,0.006,-0.2,arm); arm.rotation.y=0.12;
  const o=own||p; o.userData.disc=disc; o.userData.arm=arm; return o;
}
let dTex=null;
function discTex(){return dTex||(dTex=A.canvasTex(128,128,function(c){
  c.fillStyle='#101113'; c.fillRect(0,0,128,128); for(let q=22;q<62;q+=2){c.strokeStyle='rgba(255,255,255,'+(q%6?0.05:0.13)+')'; c.lineWidth=0.7; c.beginPath(); c.arc(64,64,q,0,7); c.stroke();}
  const gr=c.createLinearGradient(0,0,128,128); gr.addColorStop(0.4,'rgba(255,255,255,0)'); gr.addColorStop(0.5,'rgba(255,255,255,0.22)'); gr.addColorStop(0.6,'rgba(255,255,255,0)'); c.fillStyle=gr; c.beginPath(); c.arc(64,64,62,0,7); c.fill();
  c.fillStyle='#9fc4d6'; c.beginPath(); c.arc(64,64,19,0,7); c.fill(); c.fillStyle='#1F5A41'; c.fillRect(52,58,24,4); c.fillStyle='#fbfaf6'; c.beginPath(); c.arc(74,52,3,0,7); c.fill(); c.fillStyle='#101113'; c.beginPath(); c.arc(64,64,2,0,7); c.fill();}));}
A.turntable=turntable;
decorDef('turntable',{n:'Record player',q:'record player turntable',site:'web',cat:'decor',w:44,d:36,h:15,col:skin([['Oak',OAK]],WOOD).concat([['Black',0x262626],['White',0xf2f1ec]])},function(g,c){turntable(K.dec(g,'turntable'),0,0,0,c.h,g);});
decorDef('speaker',{n:'ENEBY speaker',q:'ENEBY speaker',w:20,d:9,h:20,col:[['Black',0x2b2b2b],['White',0xf2f1ec]]},function(g,c){const p=K.dec(g,'speaker');
  box(0.09,0.2,0.2,c.h,0,0.1,0,p); cyl(0.07,0.004,sh(c.h,0.7),0.046,0.1,0,p,20).rotation.z=R/2;});
decorDef('tv55',{n:'TV 55" on its stand',q:'',site:'none',cat:'media',w:123,d:25,h:80,col:[['Black',0x101214]]},function(g){tvOn(g,0,0);});
decorDef('recordCrate',{n:'Crate of records',q:'record storage crate',site:'web',w:35,d:35,h:30,col:C.veneer},function(g,c){const p=K.dec(g,'record');
  [-0.165,0.165].forEach(function(z){box(0.33,0.28,0.02,c.h,0,0.14,z,p);}); [-0.155,0.155].forEach(function(x){box(0.02,0.1,0.31,c.h,x,0.05,0,p);});
  for(let i=0;i<12;i++) box(0.31,0.31,0.006,[0x1F5A41,0xd8a63b,0x9fc4d6,0xb5673f,0x3b4a44,0xf3ebdc][i%6],0,0.16,-0.14+i*0.025,p).rotation.x=0.08;});
decorDef('photoFrame',{n:'Standing photo frame',q:'RIBBA frame',w:15,d:6,h:20,col:C.frame},function(g,c,o){
  const s=G(g); s.rotation.z=0.12; box(0.012,0.2,0.15,c.h,0,0.1,0,s); const m=new THREE.Mesh(new THREE.PlaneGeometry(0.12,0.17),A.MT(K.artTex(o.cfg.seed||3),null,true)); m.position.set(0.0065,0.1,0); m.rotation.y=R/2; s.add(m);});
decorDef('bowl',{n:'Serving bowl',q:'bowl',w:28,d:28,h:10,col:[['White',0xf2f1ec],['Terracotta',0xb5673f],['Sage',SAGE],['Black',0x262626]]},function(g,c){cyl(0.14,0.08,c.h,0,0.045,0,K.dec(g,'vase'),28,0.08);});
decorDef('cushion',{n:'Cushion',q:'cushion cover',w:45,d:15,h:45,col:C.fabric},function(g,c){K.cushion(g,c.h,0,0.18,0,1,0);});

/* ======================= ON THE WALL ======================= */
function wallDef(k,meta,build){return def(k,Object.assign({cat:'wall',place:'wall'},meta),build);}
function art(g,w,h,seed,frame){box(0.025,h,w,frame,0,h/2,0,g); const m=new THREE.Mesh(new THREE.PlaneGeometry(w-0.05,h-0.05),A.MT(K.artTex(seed),null,true)); m.position.set(0.0135,h/2,0); m.rotation.y=R/2; g.add(m);}
wallDef('frame',{n:'Framed print 50 × 70',q:'RIBBA frame 50x70',y:1.25,w:50,d:2.5,h:70,col:C.frame},function(g,c,o){art(g,0.5,0.7,o.cfg.seed||2,c.h);});
wallDef('frameL',{n:'Large print 70 × 100',q:'RÖDALM frame 70x100',y:1.1,w:70,d:2.5,h:100,col:C.frame},function(g,c,o){art(g,0.7,1.0,o.cfg.seed||5,c.h);});
wallDef('frameTrio',{n:'Set of prints',q:'RIBBA frame',y:1.4,w:150,d:2.5,h:50,col:C.frame,cfg:{n:3,w:0.4,h:0.5,gap:0.52}},function(g,c,o){
  const f=o.cfg, n=f.n||3, w=f.w||0.4, h=f.h||0.5, gap=f.gap||0.52;
  for(let i=0;i<n;i++){const s=G(g); s.position.z=(i-(n-1)/2)*gap; art(s,w,h,f.seeds&&f.seeds[i]!=null?f.seeds[i]:(f.seed||7)+i,c.h);}});
wallDef('oakShelves3',{n:'Three oak wall shelves',q:'oak wall shelf',site:'web',y:1.2,w:130,d:24,h:80,col:C.veneer},function(g,c,o){
  [0,0.38,0.76].forEach(function(y,i){box(0.24,0.03,1.3,c.h,0,y+0.015,0,g); if(o.cfg.deco){K.books(g,0.01,y+0.03,-0.25+i*0.2,0.7,0.31,0.2,120+i); if(i===1) K.bush(g,0.01,y+0.03,0.5,0.06,BLUE);}});});
wallDef('mirrorRound',{n:'Round mirror Ø60',q:'round mirror 60',y:1.3,w:60,d:3,h:60,col:[['Gold',0xd9aa12],['Black',0x262626]].concat(skinOne('Oak',0xc8a06a))},function(g,c){
  torus(0.29,0.022,c.h,0,0.3,0,g).rotation.y=R/2; cyl(0.285,0.008,0xcfdadd,-0.004,0.3,0,g,40).rotation.z=R/2;});
wallDef('lackShelf',{n:'LACK wall shelf 110',q:'LACK wall shelf 110x26',y:1.4,w:110,d:26,h:5,col:C.lam},function(g,c){box(0.26,0.05,1.1,c.h,0,0.025,0,g);});
wallDef('mosslanda',{n:'MOSSLANDA picture ledge',q:'MOSSLANDA picture ledge 115',y:1.5,w:115,d:12,h:5,col:[['White',0xf2f1ec],['Black',0x262626]]},function(g,c){box(0.12,0.02,1.15,c.h,0,0.01,0,g); box(0.02,0.04,1.15,c.h,0.05,0.03,0,g);});
wallDef('tvWall',{n:'TV 55" on the wall',q:'TV wall bracket',site:'web',cat:'media',y:1.0,w:123,d:8,h:71,col:[['Black',0x101214]]},function(g){K.tv(g,0.0,0.355,0); box(0.02,0.2,0.3,0x2b2b2b,-0.03,0.355,0,g);});
wallDef('wallClock',{n:'Wall clock',q:'PLUTTIS wall clock',y:1.8,w:30,d:4,h:30,col:[['White',0xf2f1ec],['Black',0x262626]].concat(skinOne('Oak',0xc8a06a))},function(g,c){
  cyl(0.15,0.035,c.h,0,0.15,0,g,32).rotation.z=R/2; cyl(0.13,0.004,0xf7f6f2,0.019,0.15,0,g,32).rotation.z=R/2;
  const hh=G(g); hh.position.set(0.023,0.15,0); box(0.004,0.08,0.008,0x262626,0,0.035,0,hh).rotation.x=0; const mm=G(g); mm.position.set(0.025,0.15,0); mm.rotation.x=-2.1; box(0.004,0.11,0.006,0x262626,0,0.05,0,mm);});
wallDef('hooks',{n:'Hook rail',q:'TJUSIG hanger',cat:'hall',y:1.65,w:80,d:8,h:8,col:C.veneer.concat([['White',0xf2f1ec]])},function(g,c){
  box(0.02,0.08,0.8,c.h,-0.03,0.04,0,g); [-0.3,-0.1,0.1,0.3].forEach(function(z){cyl(0.012,0.07,INK,0.0,0.04,z,g,8).rotation.z=R/2;});});
wallDef('trones',{n:'TRONES shoe cabinet',cat:'hall',y:0.1,w:52,d:18,h:39,col:[['White',0xf2f1ec],['Black',0x262626],['Grey-turquoise',0x6d8a8a]]},function(g,c){
  box(0.18,0.39,0.52,c.h,0,0.195,0,g); box(0.02,0.37,0.5,sh(c.h,0.96),0.095,0.195,0,g); box(0.006,0.015,0.2,sh(c.h,0.7),0.106,0.35,0,g);});

/* ======================= RUGS (you can walk over them) ======================= */
function rugDef(k,meta,build){return def(k,Object.assign({cat:'rug',flat:true,lh:0.25},meta),build);}
rugDef('rugWool',{n:'TIPHEDE flatwoven rug',q:'TIPHEDE rug',w:220,d:155,h:1,col:[['Natural and off-white',0xe7e0d2]]},function(g){K.rug(g,1.55,2.2,'wool');});
rugDef('rugStripe',{n:'Striped cotton rug',q:'flatwoven rug blue stripe',w:230,d:160,h:1,col:[['Off-white, blue stripes',0xefe7d6]]},function(g){K.rug(g,1.6,2.3,'stripe');});
rugDef('rugJute',{n:'LOHALS jute rug',q:'LOHALS rug',w:230,d:160,h:1,col:[['Natural',0xb89a63]]},function(g){K.rug(g,1.6,2.3,'jute');});
rugDef('rugKilim',{n:'Kilim rug',q:'kilim rug 160x230',site:'web',w:230,d:160,h:1,col:[['Rust',0xc4673f]]},function(g){K.rug(g,1.6,2.3,'kilim');});
rugDef('stoense',{n:'STOENSE rug',q:'STOENSE rug 170x240',w:240,d:170,h:1,col:C.rugSolid},function(g,c){box(1.7,0.014,2.4,c.h,0,0.007,0,g).castShadow=false; box(1.62,0.015,2.32,sh(c.h,1.03),0,0.0075,0,g).castShadow=false;});
rugDef('adum',{n:'ÅDUM high-pile rug',q:'ÅDUM rug 170x240',w:240,d:170,h:2,col:C.rugSolid},function(g,c){A.rbox(1.7,0.025,2.4,c.h,0,0.0125,0,g,0.01,0.06).castShadow=false;});
rugDef('roundRug',{n:'Round rug Ø150',q:'round rug 150',w:150,d:150,h:1,col:C.rugSolid},function(g,c){K.roundRug(g,0,0,0.75,c.h,sh(c.h,1.06));});
rugDef('runner',{n:'Hallway runner',q:'runner rug 80x250',w:250,d:80,h:1,col:[['Sage and blue stripes',0xe9dcc3]]},function(g){K.rug(g,0.8,2.5,'runner');});
rugDef('doormat',{n:'Doormat',q:'door mat',cat:'hall',w:75,d:50,h:1,col:[['Coir',0xa89878],['Dark grey',0x55585b]]},function(g,c){box(0.5,0.014,0.75,c.h,0,0.007,0,g).castShadow=false;});

/* ======================= ENTRANCE AND KITCHEN ======================= */
def('tjusig',{n:'Bench with shoe storage and hooks',q:'TJUSIG bench with shoe storage',cat:'hall',w:90,d:42,h:180,col:skin([['Oak, white',OAK,WHITE]],WOOD).concat([['Black',0x262626,0x262626]]),seats:[{id:'',label:'Entrance bench',lx:0.02,lz:0,y:0.5,type:'sit'}]},function(g,c,o){
  box(0.34,0.05,0.9,c.h,0,0.46,0,g); [[-.14,-.41],[.14,-.41],[-.14,.41],[.14,.41]].forEach(function(p){box(0.035,0.44,0.035,c.h2,p[0],0.22,p[1],g);});
  box(0.3,0.02,0.84,c.h2,0,0.16,0,g); box(0.02,0.08,0.9,c.h,-0.2,1.7,0,g); [-0.3,0,0.3].forEach(function(z){cyl(0.012,0.07,INK,-0.16,1.7,z,g,8).rotation.z=R/2;});
  if(o.cfg.deco){box(0.26,0.2,0.34,RATTAN,0,0.27,-0.22,K.dec(g,'insert')); box(0.22,0.1,0.26,0xe9e6df,0,0.22,0.22,g); box(0.06,0.6,0.3,0x1f5a41,-0.15,1.38,-0.3,g); box(0.05,0.32,0.26,RATTAN,-0.16,1.5,0.3,g); K.cushion(g,BLUE,-0.06,0.6,0.25,0.8,0.1);}
});
def('shoeCab',{n:'Slim shoe cabinet',q:'HEMNES shoe cabinet',cat:'hall',w:90,d:24,h:100,col:[['White, oak top',0xf2f1ec,OAK]].concat(skin([['White stain',0xeeebe3,0xeeebe3],['Black-brown',0x3a312c,0x3a312c]],WOOD)),note:'Only 22 to 30 cm deep, so the entrance stays open.'},function(g,c,o){
  box(0.24,0.95,0.9,c.h,0,0.5,0,g); box(0.26,0.025,0.92,c.h2,0,0.99,0,g); [0.35,0.67].forEach(function(y){box(0.004,0.004,0.86,0xb9b3a4,0.121,y,0,g);});
  [0.5,0.82].forEach(function(y){box(0.012,0.02,0.12,c.h2,0.126,y,0,g);});
  if(o.cfg.deco){box(0.16,0.03,0.24,RATTAN,0,1.02,-0.25,g); K.bush(g,0,1.0,0.25,0.07,BLUE); K.tableLamp(g,0,1.0,0,o.ch,0.8);}
});
def('hemnesShoe',{n:'HEMNES shoe cabinet, 2 compartments',q:'HEMNES shoe cabinet 2 compartments',cat:'hall',w:89,d:30,h:127,col:C.hemnes},function(g,c){
  const f=c.h; box(0.3,1.2,0.89,f,0,0.62,0,g); box(0.32,0.025,0.91,f,0,1.23,0,g); [0.42,0.85].forEach(function(y){box(0.02,0.38,0.85,sh(f,0.96),0.16,y,0,g); cyl(0.012,0.02,0xb08d4a,0.18,y+0.12,0,g,10).rotation.z=R/2;});
});
def('bissa',{n:'BISSA shoe cabinet',cat:'hall',w:49,d:28,h:135,col:[['White',0xf2f1ec],['Black-brown',0x3a312c]]},function(g,c){
  box(0.28,1.35,0.49,c.h,0,0.675,0,g); [0.25,0.68,1.11].forEach(function(y){box(0.02,0.4,0.47,sh(c.h,0.96),0.15,y,0,g); box(0.004,0.012,0.18,sh(c.h,0.7),0.162,y+0.15,0,g);});});
def('mulig',{n:'MULIG clothes rack',cat:'hall',w:99,d:46,h:151,col:[['White',0xf2f1ec],['Black',0x262626]]},function(g,c){
  [-0.48,0.48].forEach(function(z){[-0.2,0.2].forEach(function(x){cyl(0.012,1.5,c.h,x,0.75,z,g,8);}); box(0.42,0.02,0.02,c.h,0,1.5,z,g);});
  cyl(0.012,0.98,c.h,0,1.5,0,g,8).rotation.x=R/2; box(0.42,0.015,0.96,c.h,0,0.2,0,g);});
def('coatStand',{n:'Coat stand',q:'coat stand',cat:'hall',w:45,d:45,h:180,col:skin([['Oak',OAK]],WOOD).concat([['Black',0x262626],['White',0xf2f1ec]])},function(g,c){
  cyl(0.18,0.03,c.h,0,0.015,0,g,24); cyl(0.02,1.75,c.h,0,0.875,0,g,10); [0,1,2,3,4,5].forEach(function(i){const a=i*R/3; const h=cyl(0.01,0.14,c.h,Math.cos(a)*0.06,1.68,Math.sin(a)*0.06,g,8); h.rotation.set(Math.sin(a)*0.8,0,-Math.cos(a)*0.8);});});
def('raskog',{n:'RÅSKOG trolley',cat:'hall',w:45,d:35,h:78,col:[['Beige',0xd8c8a4],['Grey-turquoise',0x6d8f8f],['White',0xf2f1ec],['Black',0x262626]]},function(g,c,o){
  [0.12,0.42,0.72].forEach(function(y){box(0.33,0.012,0.43,c.h,0,y,0,g); [-1,1].forEach(function(s){box(0.33,0.05,0.008,c.h,0,y+0.025,s*0.215,g); box(0.008,0.05,0.43,c.h,s*0.165,y+0.025,0,g);});});
  [[-.16,-.21],[.16,-.21],[-.16,.21],[.16,.21]].forEach(function(p){box(0.02,0.74,0.02,c.h,p[0],0.42,p[1],g); cyl(0.022,0.02,INK,p[0],0.022,p[1],g,10).rotation.x=R/2;});
  if(o.cfg.coffee){K.espresso(g,-0.02,0.73,0.08,0); K.grinder(g,-0.04,0.73,-0.14,0); [-0.12,0,0.12].forEach(function(z){cyl(0.035,0.08,WHITE,0,0.47,z,g,12);});}
});
def('perjohan',{n:'Bench with storage',q:'PERJOHAN bench with storage',cat:'hall',w:140,d:42,h:50,col:C.veneer,seats:[{id:'A',label:'Bench, left',lx:0.02,lz:-0.35,y:0.5,type:'sit'},{id:'B',label:'Bench, right',lx:0.02,lz:0.35,y:0.5,type:'sit'}]},function(g,c,o){
  box(0.42,0.06,1.4,c.h,0,0.41,0,g); [[-.17,-.64],[.17,-.64],[-.17,.64],[.17,.64]].forEach(function(p){box(0.04,0.38,0.04,c.h,p[0],0.19,p[1],g);});
  if(o.cfg.deco){A.rbox(0.4,0.08,0.66,SAGE,0,0.475,-0.35,g,0.035); A.rbox(0.4,0.08,0.66,SAGE,0,0.475,0.35,g,0.035); box(0.32,0.24,0.4,RATTAN,0,0.13,-0.35,K.dec(g,'insert')); box(0.32,0.24,0.4,RATTAN,0,0.13,0.35,K.dec(g,'insert'));
    K.cushion(g,BLUE,-0.14,0.66,-0.5,0.9,0.2); K.cushion(g,WHITE,-0.14,0.66,0.52,0.9,0.2);}
});
def('jonaxel',{n:'Open shelf unit',q:'JONAXEL shelving unit',cat:'shelf',w:80,d:34,h:180,col:[['White frame, oak shelves',0xf2f1ec,OAK],['Black frame, oak shelves',0x262626,OAK]]},function(g,c,o){
  [[-.15,-.39],[.15,-.39],[-.15,.39],[.15,.39]].forEach(function(p){box(0.025,1.8,0.025,c.h,p[0],0.9,p[1],g);});
  [0.3,0.75,1.2,1.65].forEach(function(y){box(0.34,0.025,0.8,c.h2,0,y,0,g);});
  if(o.cfg.deco){K.books(g,0,0.3125,-0.12,0.45,0.24,0.2,61); K.bush(g,0,0.3125,0.25,0.08,BLUE); K.bush(g,0,0.7625,-0.2,0.09); K.bookStack(g,0,0.7625,0.2,4,8);
    K.tableLamp(g,0,1.2125,0.22,o.ch,0.9); cyl(0.05,0.2,BLUE,0,1.3125,-0.2,K.dec(g,'vase'),14,0.03); K.pothos(g,0,1.6625,-0.15,0.6,14); K.bush(g,0,1.6625,0.24,0.07);}
});
/* the record sideboard: a low white and oak cabinet with the turntable, a speaker and a lamp */
def('recordConsole',{n:'Record sideboard',q:'sideboard oak 120',cat:'shelf',w:120,d:42,h:67,col:[['White, oak top',0xfbfaf6,OAK],['Black-brown, oak top',0x3a312c,OAK],['Sage, oak top',0x93a891,OAK],['Oak',OAK,OAK]],note:'About 120 × 40 × 60, for the turntable and speaker.'},function(g,c,o){
  box(0.42,0.38,1.2,c.h,0,0.45,0,g); box(0.44,0.025,1.22,c.h2,0,0.652,0,g); [-0.2,0.2].forEach(function(z){box(0.004,0.34,0.004,0xb9b3a4,0.211,0.45,z,g);});
  [[-.17,-.55],[.17,-.55],[-.17,.55],[.17,.55]].forEach(function(p){cyl(0.016,0.26,c.h2,p[0],0.13,p[1],g,8);});
  if(o.cfg.deco!==false){turntable(K.dec(g,'turntable'),0,0.665,-0.34,OAK,g);
    K.books(g,0.0,0.665,0.02,0.2,0.31,0.3,55); const sp=K.dec(g,'speaker'); box(0.2,0.3,0.2,0xe9e6df,-0.06,0.815,0.45,sp); cyl(0.06,0.004,0x9aa39e,0.042,0.825,0.45,sp,14).rotation.z=R/2;
    K.tableLamp(g,-0.04,0.665,0.23,o.ch,0.9);}
});
def('liftTop',{n:'Lift-top coffee table',q:'שולחן סלון מתרומם עץ אלון',site:'web',cat:'table',w:120,d:60,h:40,col:[['Oak and white',OAK,WHITE]]},function(g,c){
  box(0.56,0.2,1.12,c.h2,0,0.22,0,g); box(0.52,0.012,1.08,0x8a6a3c,0,0.325,0,g); sqLegs(g,0.24,0.52,0.12,0.04,c.h); A.rbox(0.6,0.04,1.2,c.h,0,0.36,0,g,0.012);});
})();
