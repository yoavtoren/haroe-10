/* Haroe 10 — more of the IKEA catalogue: beds, wardrobes, bathroom, kitchen, kids and balcony, and more of what catalog.js
   already has. Same rules as there: every piece is built facing +x with its back at -x, its width along z, its origin on the
   floor in the middle of its footprint (a wall piece: at its bottom; a ceiling piece: on the floor under it). Sizes are
   catalogue sizes in cm: w along z, d along x, h up. Colours are the names IKEA sells them in. */
(function(){
'use strict';
const A=window.APP, CAT=A.CAT, R=Math.PI, box=A.box, cyl=A.cyl;
A.CATS.push(['bed','Beds & bedside'],['ward','Wardrobes & dressers'],['bath','Bathroom'],['kitchen','Kitchen & bar'],['kids','Kids'],['out','Balcony']);
const ROLE={sofa:'main',arm:'accent',table:'wood',media:'case',shelf:'case',eket:'case',dining:'wood',chair:'accent',lamp:'metal',plant:'pot',decor:'accent2',wall:'accent2',rug:'rug',hall:'case',
  bed:'wood',ward:'case',bath:'case2',kitchen:'case',kids:'accent',out:'wood'};
const sh=A.shade;
/* a texture for these colours wherever they are used: only for wood and fabric shades, never a plain white or black */
function skin(list,t){list.forEach(function(c){if(!A.texFor[c[1]]) A.texFor[c[1]]=t;}); return list;}
function def(k,o,build){
  if(CAT[k]) throw new Error('catalog: '+k+' is already in the catalog');
  o.key=k; o.build=build; o.col=(o.col||[['Natural',0xd9c9a8]]).map(function(e){return {n:e[0],h:e[1],h2:e[2],x:e[3]};});
  o.place=o.place||'floor'; o.role=o.role||ROLE[o.cat]; o.q=o.q||o.n; o.lh=o.lh||(o.h/100+0.15);
  CAT[k]=o; (A.more.keys||(A.more.keys=[])).push(k); return o;
}
function barXY(m,x0,y0,x1,y1){m.position.x=(x0+x1)/2; m.position.y=(y0+y1)/2; m.rotation.z=Math.atan2(y1-y0,x1-x0); m.scale.x=Math.hypot(x1-x0,y1-y0); return m;}
function legs(g,dx,dz,h,col,r,rt){[[-dx,-dz],[dx,-dz],[-dx,dz],[dx,dz]].forEach(function(q){cyl(r||0.018,h,col,q[0],h/2,q[1],g,10,rt);});}
function sqLegs(g,dx,dz,h,s,col){[[-dx,-dz],[dx,-dz],[-dx,dz],[dx,dz]].forEach(function(q){box(s,h,s,col,q[0],h/2,q[1],g);});}
function glass(m,op){[].concat(m.material).forEach(function(q){q.transparent=true; q.opacity=op||0.4; q.depthWrite=false;}); m.castShadow=false; return m;}
function drawers(g,f,W,D,h,cols,rows,y0,knob){
  box(D,h-y0,W,f,0,y0+(h-y0)/2,0,g); const dw=W/cols, dh=(h-y0-0.04)/rows;
  for(let i=0;i<cols;i++) for(let j=0;j<rows;j++){const z=-W/2+dw*(i+0.5), y=y0+0.02+dh*(j+0.5);
    box(0.016,dh-0.008,dw-0.008,sh(f,0.97),D/2+0.008,y,z,g);
    if(knob) cyl(0.014,0.024,knob,D/2+0.026,y,z,g,10).rotation.z=R/2; else box(0.004,0.012,dw*0.5,sh(f,0.75),D/2+0.017,y+dh/2-0.03,z,g);}
}
A.more={def:def,skin:skin,sh:sh,barXY:barXY,legs:legs,sqLegs:sqLegs,glass:glass,drawers:drawers,
  OAK:0xc99a5b, SAGE:0x8fbd9b, BLUE:0x9fc4d6, WHITE:0xfbfaf6, LINEN:0xefe7d6, RATTAN:0xd9c9a8, INK:0x3b4a44, BLACK:0x232323, STEEL:0xb9bdc0};
})();

/* =============================== BEDROOM: beds, bedside, wardrobes, dressers, mirrors =============================== */
(function(){
'use strict';
const A=window.APP, M=A.more, def=M.def, K=A.kit, C=A.IKEA, box=A.box, rbox=A.rbox, cyl=A.cyl, sph=A.sph, torus=A.torus, G=A.G, R=Math.PI, sh=A.shade;
const WOOD=A.surfaces.wood, WEAVE=A.surfaces.weave, skin=M.skin;
const WHITE=0xf2f1ec, BB=0x3a312c, OAK=M.OAK, SAGE=M.SAGE, BLUE=M.BLUE, DARK=0x1e1c1a, BRASS=0xb08d4a, SLATS=0xd9c49a;
const MATT=0xf6f4ee, PIL=0xfbfaf6, DUV=0xf3efe6, LIN=M.LINEN;
/* duvet covers, soft enough to read against a white mattress */
const DUVB=0xaec8d6, DUVG=0xb3c9b5, DUVL=0xdcd0b9, DUVGR=0xc4c5c2, DUVR=0xd9b8a8; skin([['',DUVB],['',DUVG],['',DUVL],['',DUVGR],['',DUVR]],WEAVE);

/* ---------- colours ---------- */
const P={
  malm:[['White',WHITE]].concat(skin([['Black-brown',BB],['White stained oak veneer',0xdccfb7],['Oak veneer',OAK]],WOOD)),
  tarva:skin([['Pine',0xe3c99d],['White stained pine',0xe8e1d3]],WOOD),
  idanas:[['White',WHITE]].concat(skin([['Dark brown stained',0x4a3426]],WOOD)),
  nordli:[['White',WHITE],['Anthracite',0x45474a]],
  brimnes:[['White',WHITE],['Black',0x262626]],
  kullen:[['White',WHITE]].concat(skin([['Black-brown',BB]],WOOD)),
  songe:[['White',WHITE]].concat(skin([['Brown',0x6b4a32]],WOOD)),
  slattum:skin([['Vissle dark grey',0x55585b],['Knisa light grey',0xbebdb8],['Vissle beige',0xcbbda4]],WEAVE),
  gladstad:skin([['Kabusa light grey',0xb4b4b0],['Kabusa dark grey',0x5b5c5f]],WEAVE),
  daybed:[['White',WHITE]].concat(skin([['Grey',0x86888a],['Grey-green',0x7f8b78]],WOOD)),
  /* PAX: the doors, then the frame. The door's name picks its look (see doorStyle) */
  pax:[['White, FORSAND white',WHITE,WHITE],['White, BERGSBO white',WHITE,WHITE],['White stained oak effect, FORSAND',0xdad0be,0xdad0be],
    ['Black-brown, FORSAND black-brown',BB,BB],['White, REINSVOLL grey-beige',0xb9b1a3,WHITE],['White, FORSAND with ÅHEIM mirror doors',WHITE,WHITE]],
  paxS:[['White, HASVIK white',0xf4f4f0,WHITE],['White, AULI mirror glass',0xd2dcdf,WHITE],['White stained oak effect, MEHAMN and AULI',0xdad0be,0xdad0be]],
  ash:skin([['Ash veneer',0xd8c3a0],['Brown stained ash',0x7a5a3e]],WOOD)
};

/* FORSAND and HASVIK are flat, BERGSBO and REINSVOLL have a frame, ÅHEIM and AULI are mirror glass, MEHAMN is panelled */
function doorStyle(n){return /ÅHEIM/.test(n)?'mix':/BERGSBO|REINSVOLL/.test(n)?'frame':/MEHAMN/.test(n)?'mehamn':/AULI/.test(n)?'mirror':'flat';}
/* mirror glass: a cool grey gradient with a soft highlight */
let mirT=null;
function mirror(){
  mirT=mirT||A.canvasTex(64,128,function(q,w,h){const gr=q.createLinearGradient(0,h,w,0);
    gr.addColorStop(0,'#98a9ae'); gr.addColorStop(0.38,'#d9e3e5'); gr.addColorStop(0.5,'#f5f8f8'); gr.addColorStop(0.6,'#c3d0d3'); gr.addColorStop(1,'#a3b3b7'); q.fillStyle=gr; q.fillRect(0,0,w,h);});
  return A.MT(mirT,null,true);
}

/* ======================= BEDS ======================= */
/* a made bed: mattress L (along x) by W from x0 (its head end), its underside at y. A duvet with its turned-back top, draped dr over
   the sides (and over the foot unless o.foot===false), an optional throw at the foot, pillows lying flat at the head. Returns the mattress top. */
function made(g,x0,L,W,y,o){
  o=o||{}; const t=o.t||0.2, top=y+t, dr=o.dr==null?0.14:o.dr, dv=o.duv||DUV, d0=x0+0.4, d1=x0+L+(o.foot===false?-0.03:0.01), dl=d1-d0, dc=(d0+d1)/2;
  rbox(L,t,W,MATT,x0+L/2,y+t/2,0,g,0.05);
  rbox(dl,0.06,W+0.04,dv,dc,top+0.03,0,g,0.025);
  if(dr>0.02){[-1,1].forEach(function(s){rbox(dl,dr+0.06,0.025,dv,dc,top+0.03-dr/2,s*(W/2+0.022),g,0.01);});
    if(o.foot!==false) rbox(0.025,dr+0.06,W+0.07,dv,d1+0.012,top+0.03-dr/2,0,g,0.01);}
  rbox(0.18,0.075,W+0.05,PIL,d0+0.07,top+0.042,0,g,0.035);                                    // the turned-back top
  if(o.thr) rbox(0.42,0.075,W+0.07,o.thr,d1-0.24,top+0.045,0,g,0.03);                         // a throw across the foot
  const n=W>1.2?2:1, pw=n>1?Math.min(0.66,W/2-0.08):Math.min(0.62,W-0.2);
  for(let i=0;i<n;i++) rbox(0.42,0.1,pw,PIL,x0+0.25,top+0.05,n>1?(i-0.5)*W/2:0,g,0.045);
  if(o.cush) o.cush.forEach(function(c,i){K.cushion(g,c,x0+0.16,top+0.24,n>1?(i-(o.cush.length-1)/2)*0.5:0,0.8,0.5);});
  return top;
}
function bedSeats(W,lx,y){return W>1.2?[{id:'L',label:'Bed, left side',lx:lx,lz:-W/4,y:y,type:'lie',dh:0},{id:'R',label:'Bed, right side',lx:lx,lz:W/4,y:y,type:'lie',dh:0}]
  :[{id:'',label:'Bed',lx:lx,lz:0,y:y,type:'lie',dh:0}];}

/* MALM: a plain slab headboard and footboard standing on the floor, the sides hung between them (high: open underneath, for storage boxes) */
function malmBed(g,c,W,D,hh,mw,low){
  const f=c.h, fh=low?0.22:0.38, sb=low?0.07:0.21, my=low?0.15:0.27;
  box(0.05,hh,W,f,-D/2+0.025,hh/2,0,g); box(0.04,fh,W,f,D/2-0.02,fh/2,0,g);
  [-1,1].forEach(function(s){box(D-0.09,fh-sb,0.03,f,0.005,(sb+fh)/2,s*(W/2-0.025),g);});
  box(D-0.1,0.02,W-0.1,SLATS,0.005,my-0.01,0,g);
  made(g,-D/2+0.05,D-0.09,mw,my,{dr:low?0.12:0.08,duv:mw<1.2?DUVB:low?DUVGR:DUVL,thr:mw<1.2?null:low?BLUE:SAGE});
}
def('malmBed160',{n:'MALM bed frame, high, 160 × 200',q:'MALM bed frame high 160x200',cat:'bed',w:177,d:209,h:100,col:P.malm,seats:bedSeats(1.6,0,0.47),note:'Free height under the bed is 21 cm: room for MALM storage boxes on castors.'},
  function(g,c){malmBed(g,c,1.77,2.09,1.0,1.6,false);});
def('malmLow140',{n:'MALM bed frame, low, 140 × 200',q:'MALM bed frame low 140x200',cat:'bed',w:156,d:209,h:93,col:P.malm,seats:bedSeats(1.4,0,0.35)},
  function(g,c){malmBed(g,c,1.56,2.09,0.93,1.4,true);});
def('malmBed90',{n:'MALM bed frame, high, 90 × 200',q:'MALM bed frame high 90x200',cat:'bed',w:105,d:209,h:100,col:P.malm,seats:bedSeats(0.9,0,0.47)},
  function(g,c){malmBed(g,c,1.05,2.09,1.0,0.9,false);});

/* beds on four corner posts: posts ps square, hh tall at the head (-x) and fh at the foot, side rails ry0..ry1 flush with the posts' outsides */
function posts4(g,f,W,D,ps,hh,fh,ry0,ry1,o){
  o=o||{}; const px=D/2-ps/2, pz=W/2-ps/2, rt=o.rt||0.025, cap=o.cap?0.022:0;
  [-1,1].forEach(function(s){
    [[-px,hh],[px,fh]].forEach(function(q){const h=q[1]-cap;
      if(o.round) rbox(ps,h,ps,f,q[0],h/2,s*pz,g,ps*0.3,ps*0.4); else box(ps,h,ps,f,q[0],h/2,s*pz,g);
      if(cap) box(ps+0.018,cap,ps+0.018,f,q[0],q[1]-cap/2,s*pz,g);});
    box(D-2*ps,ry1-ry0,rt,f,0,(ry0+ry1)/2,s*(W/2-rt/2),g);});
  return {px:px,wi:W-2*ps};
}
/* the board between two posts at x, from y0 to y1, wi wide: 'slats' (TARVA), 'boards' (HEMNES), 'panel' (a framed panel, o.mould adds a moulding), 'plank' */
function endBoard(g,f,x,y0,y1,wi,st,o){
  o=o||{}; const h=y1-y0, yc=(y0+y1)/2, ln=sh(f,0.78);
  if(st==='slats'){const n=o.n||8, tr=o.tr||0.12, br=0.08, sw=(wi-0.04)/n*0.55;
    box(0.04,tr,wi,f,x,y1-tr/2,0,g); box(0.03,br,wi,f,x,y0+br/2,0,g);
    for(let i=0;i<n;i++) box(0.02,h-tr-br,sw,f,x,y0+br+(h-tr-br)/2,-wi/2+0.02+(wi-0.04)*(i+0.5)/n,g);}
  else if(st==='boards'){const n=o.n||7;
    box(0.024,h,wi,f,x,yc,0,g); for(let i=1;i<n;i++) box(0.028,h-0.1,0.006,ln,x,y0+0.03+(h-0.1)/2,-wi/2+i*wi/n,g);
    box(0.05,0.07,wi+0.01,f,x,y1-0.035,0,g); box(0.034,0.035,wi,f,x,y0+0.0175,0,g);}
  else if(st==='panel'){const m=o.m||0.075, rh=o.rh||0.09;
    box(0.026,h,wi,f,x,yc,0,g); box(o.rd||0.045,rh,wi,f,x,y1-rh/2,0,g);
    if(o.groove){const gh=h-rh-2*m*0.6; [-1,1].forEach(function(s){box(0.03,gh,0.008,ln,x,y0+m*0.6+gh/2,s*(wi/2-m),g); box(0.03,0.008,wi-2*m,ln,x,y0+m*0.6+(s<0?0:gh),0,g);});}
    if(o.mould){const y2=y1-(o.rh||0.09), mh=y2-y0-2*m*0.7; [-1,1].forEach(function(s){
      box(0.034,0.014,wi-2*m,f,x,y0+m*0.7+(s<0?0:mh),0,g); box(0.034,mh,0.014,f,x,y0+m*0.7+mh/2,s*(wi/2-m),g);
      box(0.031,0.004,wi-2*m+0.02,ln,x,y0+m*0.7+(s<0?-0.009:mh+0.009),0,g);});}}
  else box(0.022,h,wi,f,x,yc,0,g);
}
function postBed(g,c,o){
  const f=c.h, W=o.W, D=o.D, r=posts4(g,f,W,D,o.ps,o.hh,o.fh,o.ry0,o.ry1,o), mw=o.mw||1.6, L=Math.min(2.0,2*r.px-0.03);
  endBoard(g,f,-r.px,o.hy0,o.hy1,r.wi,o.head,o.ho); endBoard(g,f,r.px,o.fy0,o.fy1,r.wi,o.foot,o.fo);
  box(L,0.02,mw,SLATS,0,o.my-0.01,0,g);
  made(g,-L/2,L,mw,o.my,{t:o.t,dr:o.dr,foot:o.fh<o.my+(o.t||0.2),duv:o.duv,thr:o.thr,cush:o.cush});
}
const HEMB={W:1.74,D:2.11,ps:0.075,hh:1.2,fh:0.66,ry0:0.28,ry1:0.42,rt:0.03,cap:true,head:'boards',hy0:0.42,hy1:1.12,ho:{n:8},foot:'boards',fy0:0.26,fy1:0.6,fo:{n:8},my:0.3,dr:0.07,duv:DUVL,thr:BLUE,cush:[SAGE,BLUE]};
def('hemnesBed160',{n:'HEMNES bed frame, 160 × 200',q:'HEMNES bed frame 160x200',cat:'bed',w:174,d:211,h:120,col:C.hemnes,seats:bedSeats(1.6,0,0.5),note:'Solid pine, panelled head and foot ends on square posts.'},function(g,c){postBed(g,c,HEMB);});
def('tarvaBed160',{n:'TARVA bed frame, 160 × 200',q:'TARVA bed frame 160x200',cat:'bed',w:168,d:209,h:92,col:P.tarva,seats:bedSeats(1.6,0,0.44),note:'Untreated solid pine: oil, wax or paint it yourself.'},
  function(g,c){postBed(g,c,{W:1.68,D:2.09,ps:0.06,hh:0.92,fh:0.32,ry0:0.17,ry1:0.32,head:'slats',hy0:0.32,hy1:0.92,ho:{n:8},foot:'plank',fy0:0.17,fy1:0.32,my:0.24,dr:0.11,duv:DUVGR,thr:0xb86a4a});});
def('neiden90',{n:'NEIDEN bed frame, 90 × 200',q:'NEIDEN bed frame 90x200',cat:'bed',w:94,d:205,h:65,col:C.ivar.slice(0,3),seats:bedSeats(0.9,0,0.4),note:'A plain pine single bed, high enough for boxes underneath.'},
  function(g,c){postBed(g,c,{W:0.94,D:2.05,ps:0.045,hh:0.65,fh:0.3,ry0:0.17,ry1:0.3,rt:0.022,head:'plank',hy0:0.43,hy1:0.63,foot:'plank',fy0:0.17,fy1:0.3,mw:0.9,my:0.22,t:0.18,dr:0.09,duv:DUVB});
    const f=c.h; box(0.022,0.13,0.85,f,-1.0025,0.235,0,g);});
def('idanasBed160',{n:'IDANÄS bed frame, 160 × 200',q:'IDANÄS bed frame 160x200',cat:'bed',w:171,d:207,h:112,col:P.idanas,seats:bedSeats(1.6,0,0.5),note:'Rounded posts and framed panels at both ends.'},
  function(g,c){postBed(g,c,{W:1.71,D:2.07,ps:0.07,round:true,hh:1.12,fh:0.63,ry0:0.26,ry1:0.42,head:'panel',hy0:0.42,hy1:1.07,ho:{rh:0.1,rd:0.06,groove:true},foot:'panel',fy0:0.26,fy1:0.6,fo:{rh:0.08,rd:0.06,groove:true},my:0.3,dr:0.06,duv:DUVG,cush:[0xd8a63b,WHITE]});});
def('songesandBed160',{n:'SONGESAND bed frame, 160 × 200',q:'SONGESAND bed frame 160x200',cat:'bed',w:173,d:207,h:95,col:P.songe,seats:bedSeats(1.6,0,0.5),note:'Soft profiled edges, mouldings and high legs.'},
  function(g,c){postBed(g,c,{W:1.73,D:2.07,ps:0.065,round:true,hh:0.95,fh:0.41,ry0:0.25,ry1:0.41,head:'panel',hy0:0.41,hy1:0.91,ho:{mould:true,rh:0.08,rd:0.055},foot:'panel',fy0:0.25,fy1:0.41,fo:{rh:0.05},my:0.3,dr:0.08,duv:DUVR,thr:0x9a9a96});});

/* SLATTUM: a slim upholstered frame on short legs and a thick padded headboard */
def('slattum160',{n:'SLATTUM upholstered bed frame, 160 × 200',q:'SLATTUM upholstered bed frame 160x200',cat:'bed',w:164,d:206,h:85,col:P.slattum,seats:bedSeats(1.6,0.03,0.48),note:'Soft cover all round, padded headboard to lean on.'},function(g,c){
  const f=c.h, W=1.64, D=2.06;
  [[-0.9,-0.72],[0.97,-0.72],[-0.9,0.72],[0.97,0.72]].forEach(function(q){cyl(0.02,0.08,0x3a2c22,q[0],0.04,q[1],g,10,0.024);});
  rbox(0.1,0.77,W,f,-D/2+0.05,0.08+0.385,0,g,0.045,0.04); box(0.004,0.6,W-0.12,sh(f,0.85),-D/2+0.101,0.5,0,g);
  [-1,1].forEach(function(s){rbox(D-0.1,0.32,0.035,f,0.05,0.24,s*(W/2-0.0175),g,0.015);});
  rbox(0.035,0.32,W,f,D/2-0.0175,0.24,0,g,0.015);
  made(g,-D/2+0.1,D-0.135,1.57,0.28,{dr:0.075,duv:DUVL,thr:SAGE,cush:[BLUE,0xd8a63b]});
});
/* GLADSTAD: upholstered all over, a tall headboard with a soft round top */
def('gladstad160',{n:'GLADSTAD upholstered bed, 160 × 200',q:'GLADSTAD upholstered bed 160x200',cat:'bed',w:167,d:212,h:95,col:P.gladstad,seats:bedSeats(1.6,0.03,0.46)},function(g,c){
  const f=c.h, W=1.67, D=2.12;
  [[-0.95,-0.76],[1.0,-0.76],[-0.95,0.76],[1.0,0.76]].forEach(function(q){cyl(0.016,0.12,0x2b2826,q[0],0.06,q[1],g,10,0.02);});
  rbox(0.11,0.77,W,f,-D/2+0.055,0.12+0.385,0,g,0.02,0.05); cyl(0.055,W-0.004,f,-D/2+0.055,0.89,0,g,24).rotation.x=R/2; [-1,1].forEach(function(s){sph(0.055,f,-D/2+0.055,0.89,s*(W/2-0.002),g,1,1,0.2);});
  [-1,1].forEach(function(s){rbox(D-0.11,0.21,0.035,f,0.055,0.225,s*(W/2-0.0175),g,0.015);});
  rbox(0.035,0.21,W,f,D/2-0.0175,0.225,0,g,0.015);
  made(g,-D/2+0.11,D-0.15,1.6,0.26,{dr:0.11,duv:DUV,thr:0xd8a63b});
});
/* KLEPPSTAD: a white steel frame with a padded fabric headboard */
def('kleppstad160',{n:'KLEPPSTAD bed frame, 160 × 200',q:'KLEPPSTAD bed frame 160x200',cat:'bed',w:166,d:207,h:86,col:[['White, Vissle beige',WHITE,0xcbbda4]],seats:bedSeats(1.6,0.01,0.47)},function(g,c){
  const f=c.h, W=1.66, D=2.07, t=0.035;
  [[-D/2+t/2,0.86],[D/2-t/2,0.27]].forEach(function(q){[-1,1].forEach(function(s){box(t,q[1],t,f,q[0],q[1]/2,s*(W/2-t/2),g);}); box(t,t,W-2*t,f,q[0],q[1]-t/2,0,g);});
  [-1,1].forEach(function(s){box(D-2*t,0.05,0.025,f,0,0.245,s*(W/2-0.0125),g);}); box(t,0.05,W-2*t,f,-D/2+t/2,0.245,0,g);
  rbox(0.07,0.5,W-2*t-0.02,c.h2,-D/2+0.04,0.57,0,g,0.03,0.03);
  box(0.02,0.04,W-2*t,f,-D/2+t/2,0.32,0,g);
  made(g,-D/2+0.08,D-0.11,1.6,0.27,{dr:0.15,duv:DUVG,thr:WHITE});
});
/* BRIMNES: four big drawers under the bed and a headboard with open ends and sliding doors on top */
def('brimnesBed160',{n:'BRIMNES bed frame with storage and headboard, 160 × 200',q:'BRIMNES bed frame with storage and headboard 160x200',cat:'bed',w:166,d:234,h:111,col:P.brimnes,seats:bedSeats(1.6,0.13,0.54),
  note:'Two drawers on each side under the bed; cables go through the top of the headboard.'},function(g,c){
  const f=c.h, W=1.66, D=2.34, hx=-D/2, fx=hx+0.28, L=D-0.28;
  [-1,1].forEach(function(s){box(0.28,1.11,0.02,f,hx+0.14,0.555,s*(W/2-0.01),g);});
  box(0.02,0.74,W-0.04,f,hx+0.01,0.37,0,g); box(0.28,0.37,W-0.04,f,hx+0.14,0.925,0,g);
  [-1,1].forEach(function(s){box(0.005,0.31,0.36,sh(f,0.55),fx+0.002,0.925,s*(W/2-0.2),g); box(0.004,0.02,0.36,f,fx+0.004,0.925,s*(W/2-0.2),g);});   // open ends with a shelf
  [-1,1].forEach(function(s){box(0.018,0.33,0.42,f,fx+0.01-(s>0?0.02:0),0.925,s*0.2,g); box(0.004,0.02,0.1,sh(f,0.6),fx+0.02-(s>0?0.02:0),0.925,s*0.2+(s<0?0.14:-0.14),g);});   // two sliding doors
  box(L,0.45,W,f,fx+L/2,0.245,0,g); box(L-0.04,0.02,W-0.04,DARK,fx+L/2,0.01,0,g);
  [-1,1].forEach(function(s){[0.25,0.75].forEach(function(u){const x=fx+L*u; box(L/2-0.01,0.28,0.018,f,x,0.2,s*(W/2+0.009),g); box(0.3,0.012,0.004,sh(f,0.55),x,0.32,s*(W/2+0.019),g);});});
  made(g,fx+0.03,2.0,1.6,0.34,{dr:0.06,duv:DUVGR,thr:BLUE});
});
/* NORDLI: a low box of drawers with the mattress on top, and a wide headboard with a shelf and a box at each side */
def('nordliBed160',{n:'NORDLI bed frame with storage and headboard, 160 × 200',q:'NORDLI bed frame with storage and headboard 160x200',cat:'bed',w:240,d:206,h:114,col:P.nordli,seats:bedSeats(1.6,0.04,0.5),
  note:'Six drawers under the mattress; the headboard reaches past the bed with a shelf on each side.'},function(g,c){
  const f=c.h, W=2.4, D=2.06, hx=-D/2, L=2.02, bx0=hx+0.04;
  box(0.04,1.14,W,f,hx+0.02,0.57,0,g); box(0.2,0.025,W,f,hx+0.1,1.1,0,g);
  [-1,1].forEach(function(s){const z=s*(W/2-0.2); box(0.27,0.02,0.36,f,hx+0.04+0.135,0.48,z,g); box(0.27,0.02,0.36,f,hx+0.04+0.135,0.6,z,g); [-1,1].forEach(function(e){box(0.27,0.14,0.02,f,hx+0.04+0.135,0.54,z+e*0.17,g);});
    box(0.24,0.1,0.24,sh(f,0.9),hx+0.18,0.54,z,g);});
  box(L,0.25,1.6,f,bx0+L/2,0.165,0,g); box(L-0.06,0.04,1.54,DARK,bx0+L/2,0.02,0,g);
  [-1,1].forEach(function(s){[0.25,0.75].forEach(function(u){const x=bx0+L*u; box(L/2-0.008,0.22,0.018,f,x,0.165,s*0.809,g); box(0.12,0.018,0.004,sh(f,0.5),x,0.26,s*0.818,g);});
    box(0.018,0.22,0.796,f,bx0+L+0.009,0.165,s*0.4,g); box(0.004,0.018,0.12,sh(f,0.5),bx0+L+0.018,0.26,s*0.4,g);});
  made(g,bx0+0.01,2.0,1.6,0.29,{t:0.21,dr:0.14,duv:DUVB,thr:0xe6ddcd});
});
/* HEMNES day-bed: a panelled back and ends, three drawers in front, two mattresses on top, pulls out into a double bed */
def('hemnesDaybed',{n:'HEMNES day-bed frame with 3 drawers',q:'HEMNES day-bed with 3 drawers',cat:'bed',w:209,d:89,h:83,col:P.daybed,
  seats:[{id:'L',label:'Day-bed, left',lx:0.12,lz:-0.6,y:0.54,type:'sit'},{id:'M',label:'Day-bed, middle',lx:0.12,lz:0,y:0.54,type:'sit'},{id:'R',label:'Day-bed, right',lx:0.12,lz:0.6,y:0.54,type:'sit'},
    {id:'Lie',label:'Day-bed',lx:0.06,lz:0,y:0.54,type:'lie',dh:-R/2}],note:'A sofa by day; pull the base out and it sleeps two on its two 80 cm mattresses.'},function(g,c){
  const f=c.h, W=2.09, D=0.89, ps=0.06, px=D/2-ps/2, pz=W/2-ps/2, wi=W-2*ps;
  [-1,1].forEach(function(s){[-px,px].forEach(function(x){box(ps,0.81,ps,f,x,0.405,s*pz,g); box(ps+0.016,0.02,ps+0.016,f,x,0.82,s*pz,g);});
    const ep=G(g); ep.position.z=s*pz; ep.rotation.y=R/2; endBoard(ep,f,0,0.34,0.79,D-2*ps,'boards',{n:4});});
  endBoard(g,f,-px,0.34,0.79,wi,'boards',{n:9});
  box(D-0.03,0.27,wi,f,-0.015,0.2,0,g); box(D-0.12,0.06,wi-0.06,DARK,-0.04,0.03,0,g);
  for(let i=0;i<3;i++){const z=-wi/2+wi*(i+0.5)/3; box(0.018,0.22,wi/3-0.012,f,D/2-0.03,0.2,z,g); [-1,1].forEach(function(e){cyl(0.013,0.022,BRASS,D/2-0.011,0.23,z+e*0.16,g,10).rotation.z=R/2;});}
  rbox(0.8,0.1,wi-0.02,MATT,0.02,0.385,0,g,0.04); rbox(0.8,0.1,wi-0.02,MATT,0.02,0.475,0,g,0.04);
  rbox(0.82,0.03,wi,LIN,0.025,0.535,0,g,0.012); rbox(0.03,0.16,wi,LIN,0.425,0.475,0,g,0.01);
  [-0.6,0,0.6].forEach(function(z,i){const b=rbox(0.14,0.32,0.58,i===1?0xe9e2d4:WHITE,-0.3,0.67,z,g,0.06); b.rotation.z=0.25;});
  K.cushion(g,SAGE,-0.18,0.69,-0.32,0.8,0.35); K.cushion(g,BLUE,-0.18,0.69,0.34,0.8,0.35);
});

/* ======================= BEDSIDE ======================= */
/* a chest of drawers facing +x. rows, top to bottom: [drawers across, relative height]. o.plinth: a recessed plinth; o.legs: legs under it ('sq','taper');
   o.top: an overhanging top this thick; o.e: carcass edge showing round the fronts; o.grip: 'groove' (MALM), 'notch', 'bar', 'knob' (default); o.gc: grip colour */
function chest(g,f,o){
  const W=o.W, D=o.D, H=o.H, lg=o.legs||0, pb=o.plinth||0, y0=lg+pb, tt=o.top||0, y1=H-tt, e=o.e||0, ft=0.018, fx=D/2-ft/2, gp=0.004;
  box(D-ft,y1-y0,W,f,-ft/2,(y0+y1)/2,0,g);
  if(tt) box(D+0.01,tt,W+0.02,f,0.005,H-tt/2,0,g);
  if(pb) box(D-ft-0.04,pb,W-0.04,sh(f,0.62),-ft/2-0.02,lg+pb/2,0,g);
  if(lg){const lx=D/2-0.045, lz=W/2-0.045;
    [[-lx,-lz],[lx,-lz],[-lx,lz],[lx,lz]].forEach(function(q){if(o.leg==='taper') cyl(0.016,lg+0.01,f,q[0],(lg+0.01)/2,q[1],g,10,0.022); else box(0.045,lg+0.01,0.045,f,q[0],lg/2,q[1],g);});
    if(o.apron) box(0.02,0.05,W-0.09,f,D/2-0.03,lg-0.025,0,g);}
  const fy0=y0+e, fy1=y1-e, fw=W-2*e, sum=o.rows.reduce(function(a,r){return a+r[1];},0);
  box(ft*0.6,fy1-fy0-0.006,fw-0.006,DARK,fx-0.003,(fy0+fy1)/2,0,g);
  let y=fy1;
  o.rows.forEach(function(r,ri){const rh=(fy1-fy0)*r[1]/sum, cw=fw/r[0];
    for(let i=0;i<r[0];i++){const z=-fw/2+cw*(i+0.5), yc=y-rh/2, fr=box(ft,rh-gp,cw-gp,o.glass&&ri===0?0xe4e9e8:f,fx,yc,z,g);
      if(o.glass&&ri===0) M.glass(fr,0.85);
      grip(g,o,fx+ft/2,yc,rh,z,cw,f);}
    y-=rh;});
}
function grip(g,o,x,y,h,z,w,f){
  const gc=o.gc==null?sh(f,0.6):o.gc, k=o.grip;
  if(k==='groove') box(0.004,0.008,w-0.02,sh(f,0.55),x,y+h/2-0.012,z,g);
  else if(k==='notch') box(0.004,0.02,Math.min(0.14,w*0.4),sh(f,0.45),x,y+h/2-0.016,z,g);
  else if(k==='bar') box(0.012,0.012,Math.min(0.16,w*0.4),gc,x+0.012,y,z,g);
  else{const n=w>0.55?2:1; for(let i=0;i<n;i++) cyl(o.kr||0.014,0.024,gc,x+0.012,y,z+(n>1?(i-0.5)*w/2:0),g,12).rotation.z=R/2;}
}
/* a bedside table: top, one drawer under it, an open shelf below, on legs or side panels */
function nightTable(g,f,o){
  const W=o.W, D=o.D, H=o.H, tt=o.tt||0.025, dh=o.dh||0.14, sy=o.sy||0.12;
  if(o.sides){[-1,1].forEach(function(s){box(D-0.02,H-tt,0.02,f,-0.01,(H-tt)/2,s*(W/2-0.01),g);}); box(0.02,o.ah||0.06,W-0.04,f,D/2-0.03,sy-(o.ah||0.06)/2,0,g);}
  else [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){box(o.ls||0.04,H-tt,o.ls||0.04,f,q[0]*(D/2-0.025),(H-tt)/2,q[1]*(W/2-0.025),g);});
  if(o.round) rbox(D,tt,W,f,0,H-tt/2,0,g,0.01,0.02); else box(D,tt,W,f,0,H-tt/2,0,g);
  box(D-0.04,dh,W-0.04,f,-0.01,H-tt-dh/2,0,g); box(0.018,dh-0.01,W-0.06,f,D/2-0.025,H-tt-dh/2,0,g);
  grip(g,o,D/2-0.016,H-tt-dh/2,dh-0.01,0,W-0.06,f);
  box(0.02,H-tt-dh-sy,W-0.04,f,-D/2+0.02,sy+(H-tt-dh-sy)/2,0,g); box(D-0.04,0.02,W-0.04,f,-0.01,sy,0,g);
}
def('hemnesNight',{n:'HEMNES bedside table',q:'HEMNES bedside table',cat:'bed',w:46,d:35,h:70,col:C.hemnes},function(g,c){nightTable(g,c.h,{W:0.46,D:0.35,H:0.7,sides:true,dh:0.15,sy:0.1,ah:0.08,kr:0.013,gc:BRASS});});
def('malm2',{n:'MALM chest of 2 drawers',q:'MALM chest of 2 drawers',cat:'bed',w:40,d:48,h:55,col:P.malm},function(g,c){chest(g,c.h,{W:0.4,D:0.48,H:0.55,plinth:0.02,rows:[[1,1],[1,1]],grip:'groove'});});
def('kullen2',{n:'KULLEN chest of 2 drawers',q:'KULLEN chest of 2 drawers',cat:'bed',w:35,d:40,h:49,col:P.kullen},function(g,c){chest(g,c.h,{W:0.35,D:0.4,H:0.49,plinth:0.03,rows:[[1,1],[1,1]],gc:0x8d8f8e,kr:0.012});});
def('tarvaNight',{n:'TARVA bedside table',q:'TARVA bedside table',cat:'bed',w:48,d:39,h:62,col:P.tarva},function(g,c){nightTable(g,c.h,{W:0.48,D:0.39,H:0.62,ls:0.045,dh:0.13,sy:0.15,kr:0.016,gc:sh(c.h,0.92)});});
def('nordliNight',{n:'NORDLI bedside table',q:'NORDLI bedside table',cat:'bed',w:30,d:50,h:67,col:P.nordli},function(g,c){chest(g,c.h,{W:0.3,D:0.5,H:0.67,plinth:0.05,top:0.02,rows:[[1,1],[1,1]],grip:'notch'});});
def('idanasNight',{n:'IDANÄS bedside table',q:'IDANÄS bedside table',cat:'bed',w:47,d:40,h:68,col:P.idanas},function(g,c){
  const f=c.h, W=0.47, D=0.4, H=0.68, y0=0.17, y1=H-0.025, dy=y1-0.15;
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){cyl(0.016,y0+0.01,f,q[0]*(D/2-0.05),(y0+0.01)/2,q[1]*(W/2-0.05),g,10,0.022);});
  rbox(D,0.025,W,f,0,H-0.0125,0,g,0.008,0.02); [-1,1].forEach(function(s){box(D,y1-y0,0.02,f,0,(y0+y1)/2,s*(W/2-0.01),g);});
  box(D,0.02,W-0.04,f,0,y0+0.01,0,g); box(0.02,y1-y0,W-0.04,sh(f,0.85),-D/2+0.01,(y0+y1)/2,0,g); box(D-0.02,0.018,W-0.04,f,-0.01,dy-0.009,0,g);   // an open compartment under the drawer
  box(D-0.04,0.13,W-0.05,f,-0.02,dy+0.075,0,g); box(0.018,0.145,W-0.046,f,D/2-0.009,dy+0.075,0,g); grip(g,{grip:'notch'},D/2,dy+0.075,0.145,0,W,f);
});
def('knarrevik',{n:'KNARREVIK bedside table',q:'KNARREVIK bedside table',cat:'bed',w:37,d:28,h:45,col:[['Black',0x262626],['White',WHITE]]},function(g,c){
  const f=c.h; [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){cyl(0.007,0.45,f,q[0]*0.13,0.225,q[1]*0.175,g,6);});
  box(0.28,0.01,0.37,f,0,0.405,0,g); [-1,1].forEach(function(s){box(0.28,0.04,0.006,f,0,0.43,s*0.182,g); box(0.006,0.04,0.37,f,s*0.137,0.43,0,g);});
  box(0.26,0.008,0.35,f,0,0.12,0,g);
});
/* a bedside lamp: stands on whatever you tap */
def('lampan',{n:'LAMPAN table lamp',q:'LAMPAN table lamp',cat:'lamp',place:'top',w:23,d:23,h:29,col:[['White',0xf4f3ef],['Grey',0x9a9b9a],['Beige',0xd8ccb4]]},function(g,c,o){
  cyl(0.055,0.13,c.h,0,0.065,0,g,20,0.03); cyl(0.115,0.165,A.lampMat(o.ch,c.h,0xffe2b0,0.6),0,0.2075,0,g,26,0.06); A.pool(o.ch,0xffc47a,0,0.012,0,0.45,g,0.5);});
def('hemnesBench',{n:'HEMNES bench',q:'HEMNES bench',cat:'bed',w:83,d:37,h:53,col:C.hemnes,seats:[{id:'',label:'Bench',lx:0.02,lz:0,y:0.53,type:'sit'}],note:'A bench for the foot of the bed, with a slatted shelf for blankets.'},function(g,c){
  const f=c.h; box(0.37,0.03,0.83,f,0,0.515,0,g); M.sqLegs(g,0.155,0.385,0.5,0.045,f);
  [-1,1].forEach(function(s){box(0.02,0.07,0.72,f,s*0.16,0.46,0,g); box(0.28,0.07,0.02,f,0,0.46,s*0.385,g);});
  for(let i=0;i<5;i++) box(0.05,0.018,0.74,f,-0.12+i*0.06,0.12,0,g);
  [-1,1].forEach(function(s){box(0.3,0.03,0.03,f,0,0.1,s*0.37,g);});
});

/* ======================= WARDROBES ======================= */
/* a hinged-door wardrobe facing +x: carcass W×D×H in the frame colour fc, a recessed plinth pl, an optional crown; o.n equal doors in colour f, style
   o.st: 'flat', 'frame' (a grooved frame), 'panel' (a raised panel), 'mix' (every second door mirror glass); o.mir: the one mirror door; o.drw: [n, height] drawers under them;
   o.hd: 'bar' or 'knob' handles at the meeting edges */
function wardrobe(g,f,fc,o){
  const W=o.W, D=o.D, H=o.H, pl=o.pl||0, cr=o.crown||0, ft=0.018, fx=D/2-ft/2, gp=0.004, gc=o.gc==null?(f>0x888888?0x9a9a96:0xc9c9c4):o.gc;
  box(D-ft,H-pl-cr,W,fc,-ft/2,pl+(H-pl-cr)/2,0,g);
  if(pl) box(D-ft-0.03,pl,W-0.03,sh(fc,0.6),-ft/2-0.015,pl/2,0,g);
  if(cr) box(D+0.02,cr,W+0.03,fc,0.01,H-cr/2,0,g);
  const yb=pl+(o.db==null?0.005:o.db), yt=H-cr-(o.dt==null?0.01:o.dt); let y=yb;
  box(ft*0.6,yt-yb,W-0.012,DARK,fx-0.003,(yb+yt)/2,0,g);
  if(o.drw){const n=o.drw[0], h=o.drw[1], w=W/n; for(let i=0;i<n;i++){const z=-W/2+w*(i+0.5); box(ft,h-gp,w-gp,f,fx,yb+h/2,z,g); deco(g,f,o.st,fx+ft/2,yb+h/2,h,z,w,0.05);
      if(o.hd==='knob') [-1,1].forEach(function(e){cyl(0.014,0.024,gc,fx+0.021,yb+h/2,z+e*w/4,g,12).rotation.z=R/2;}); else box(0.012,0.012,0.14,gc,fx+0.021,yb+h/2,z,g);}
    y+=h;}
  const n=o.n, dw=W/n, h=yt-y, yc=y+h/2;
  for(let i=0;i<n;i++){const z=-W/2+dw*(i+0.5), st=o.st==='mix'?(i%2?'mirror':'flat'):(o.mir===i?'mirror':o.st), side=i%2===0?(i===n-1&&n>1?-1:1):-1, zh=z+side*(dw/2-0.045), yh=o.hy||Math.min(yt-0.3,1.05);
    box(ft,h-gp,dw-gp,f,fx,yc,z,g); deco(g,f,st,fx+ft/2,yc,h,z,dw,o.m);
    if(o.hd==='knob') cyl(0.016,0.026,gc,fx+0.022,yh,zh,g,12).rotation.z=R/2;
    else if(o.hd!=='none') box(0.014,o.hl||0.26,0.014,gc,fx+0.022,yh,zh,g);}
}
function deco(g,f,st,x,y,h,z,w,m){
  m=m||0.075; const ln=sh(f,0.84);
  if(st==='frame'){[-1,1].forEach(function(s){box(0.003,h-2*m,0.008,ln,x,y,z+s*(w/2-m),g); box(0.003,0.008,w-2*m,ln,x,y+s*(h/2-m),z,g);});}
  else if(st==='panel'){box(0.008,h-2*m,w-2*m,f,x+0.003,y,z,g); [-1,1].forEach(function(s){box(0.004,h-2*m+0.02,0.006,ln,x+0.001,y,z+s*(w/2-m+0.008),g); box(0.004,0.006,w-2*m+0.02,ln,x+0.001,y+s*(h/2-m+0.008),z,g);});}
  else if(st==='mirror') box(0.004,h-0.02,w-0.02,mirror(),x+0.002,y,z,g);
}
function paxDef(k,W,n,note){def(k,{n:'PAX wardrobe, '+W*100+' × 60 × 201',q:'PAX wardrobe '+W*100+'x60x201',cat:'ward',w:W*100,d:60,h:201,col:P.pax,note:note},function(g,c){
  wardrobe(g,c.h,c.h2,{W:W,D:0.6,H:2.01,n:n,st:doorStyle(c.n),db:0.035,dt:0.025,hd:'bar',hl:0.32,gc:c.h===BB?0xb9bdc0:0x8e9092});
});}
paxDef('pax100',1.0,2,'One 100 cm frame with two doors. Pick the doors as the colour: FORSAND, BERGSBO, REINSVOLL or ÅHEIM mirror.');
paxDef('pax150',1.5,3,'A 100 and a 50 cm frame side by side, three doors.');
paxDef('pax200',2.0,4,'Two 100 cm frames, four doors.');
/* PAX with two sliding doors on a track: HASVIK plain, AULI mirror, or a MEHAMN panelled door with an AULI mirror one */
def('paxSlide150',{n:'PAX wardrobe with sliding doors, 150 × 66 × 201',q:'PAX wardrobe sliding doors 150x66x201',cat:'ward',w:150,d:66,h:201,col:P.paxS,note:'Sliding doors need no room to open: good where the bed is close.'},function(g,c){
  const W=1.5, D=0.66, H=2.01, f=c.h, fc=c.h2, alu=0xb9bdc0;
  box(0.58,H,W,fc,-D/2+0.29,H/2,0,g); box(0.08,0.05,W,fc,D/2-0.04,H-0.025,0,g); box(0.08,0.02,W,alu,D/2-0.04,0.01,0,g);
  [[-1,D/2-0.045],[1,D/2-0.016]].forEach(function(q,i){const dw=W/2+0.015, z=q[0]*(W/2-dw/2), x=q[1], h=H-0.08, y=0.025+h/2,
      st0=doorStyle(c.n), st=st0==='mehamn'?(i?'mirror':'mehamn'):st0;
    box(0.02,h,dw,st==='mirror'?alu:f,x,y,z,g);
    if(st==='mirror') box(0.004,h-0.03,dw-0.03,mirror(),x+0.011,y,z,g);
    if(st==='mehamn') [1/3,2/3].forEach(function(u){box(0.006,0.012,dw,alu,x+0.011,0.025+h*u,z,g);});
    [-1,1].forEach(function(s){box(0.026,h,0.018,alu,x+0.003,y,z+s*(dw/2-0.009),g);});});
});
def('kleppstad2',{n:'KLEPPSTAD wardrobe with 2 doors',q:'KLEPPSTAD wardrobe 2 doors 79x176',cat:'ward',w:79,d:55,h:176,col:[['White',WHITE]]},function(g,c){wardrobe(g,c.h,c.h,{W:0.79,D:0.55,H:1.76,n:2,st:'flat',pl:0.06,hd:'bar',hl:0.14,hy:1.0,gc:0x9a9a96});});
def('kleppstad3',{n:'KLEPPSTAD wardrobe with 3 doors',q:'KLEPPSTAD wardrobe 3 doors 117x176',cat:'ward',w:117,d:55,h:176,col:[['White',WHITE]]},function(g,c){wardrobe(g,c.h,c.h,{W:1.17,D:0.55,H:1.76,n:3,st:'flat',pl:0.06,hd:'bar',hl:0.14,hy:1.0,gc:0x9a9a96});});
def('brimnesWard3',{n:'BRIMNES wardrobe with 3 doors',q:'BRIMNES wardrobe 3 doors',cat:'ward',w:117,d:50,h:190,col:P.brimnes,note:'The middle door is a mirror; it can go left, middle or right.'},function(g,c){
  wardrobe(g,c.h,c.h,{W:1.17,D:0.5,H:1.9,n:3,st:'flat',mir:1,pl:0.07,hd:'knob',hy:1.0});});
def('songesand2',{n:'SONGESAND wardrobe with 2 doors',q:'SONGESAND wardrobe 120x60x191',cat:'ward',w:120,d:60,h:191,col:P.songe,note:'A full-length mirror inside the door.'},function(g,c){
  wardrobe(g,c.h,c.h,{W:1.2,D:0.6,H:1.91,n:2,st:'panel',m:0.09,pl:0.08,crown:0.04,hd:'knob',hy:1.0,gc:c.h===WHITE?0xb9bdc0:sh(c.h,0.7)});});
def('hemnesWard',{n:'HEMNES wardrobe with 2 doors and 2 drawers',q:'HEMNES wardrobe 2 doors',cat:'ward',w:120,d:60,h:190,col:C.hemnes},function(g,c){
  wardrobe(g,c.h,c.h,{W:1.2,D:0.6,H:1.9,n:2,st:'panel',m:0.08,pl:0.09,crown:0.045,drw:[2,0.22],hd:'knob',hy:1.05,gc:BRASS});});
def('rakkestad3',{n:'RAKKESTAD wardrobe with 3 doors',q:'RAKKESTAD wardrobe 3 doors',cat:'ward',w:117,d:55,h:176,col:skin([['Black-brown',BB]],WOOD).concat([['White',WHITE]])},function(g,c){
  wardrobe(g,c.h,c.h,{W:1.17,D:0.55,H:1.76,n:3,st:'flat',pl:0.06,hd:'knob',hy:0.95,gc:c.h===WHITE?0x8d8f8e:0xb9bdc0});});

/* ======================= CHESTS OF DRAWERS ======================= */
def('malm3',{n:'MALM chest of 3 drawers',q:'MALM chest of 3 drawers 80x78',cat:'ward',w:80,d:48,h:78,col:P.malm},function(g,c){chest(g,c.h,{W:0.8,D:0.48,H:0.78,plinth:0.02,rows:[[1,1],[1,1],[1,1]],grip:'groove'});});
def('malm4',{n:'MALM chest of 4 drawers',q:'MALM chest of 4 drawers 80x100',cat:'ward',w:80,d:48,h:100,col:P.malm},function(g,c){chest(g,c.h,{W:0.8,D:0.48,H:1.0,plinth:0.02,rows:[[1,1],[1,1],[1,1],[1,1]],grip:'groove'});});
def('hemnes3',{n:'HEMNES chest of 3 drawers',q:'HEMNES chest of 3 drawers',cat:'ward',w:108,d:50,h:96,col:C.hemnes},function(g,c){chest(g,c.h,{W:1.08,D:0.5,H:0.96,legs:0.1,apron:true,top:0.03,e:0.025,rows:[[1,1],[1,1],[1,1]],gc:BRASS});});
def('kullen5',{n:'KULLEN chest of 5 drawers',q:'KULLEN chest of 5 drawers',cat:'ward',w:70,d:40,h:112,col:P.kullen},function(g,c){chest(g,c.h,{W:0.7,D:0.4,H:1.12,plinth:0.04,rows:[[1,1],[1,1],[1,1],[1,1],[1,1]],gc:0x8d8f8e,kr:0.012});});
def('tarva6',{n:'TARVA chest of 6 drawers',q:'TARVA chest of 6 drawers',cat:'ward',w:118,d:48,h:92,col:P.tarva},function(g,c){
  const f=c.h; chest(g,f,{W:1.18,D:0.48,H:0.92,legs:0.1,top:0.025,e:0.02,rows:[[2,1],[2,1],[2,1]],gc:sh(f,0.9),kr:0.017});});
def('nordli6',{n:'NORDLI chest of 6 drawers',q:'NORDLI chest of 6 drawers 120x99',cat:'ward',w:120,d:47,h:99,col:P.nordli},function(g,c){chest(g,c.h,{W:1.2,D:0.47,H:0.99,plinth:0.05,top:0.02,rows:[[3,1],[3,1]],grip:'notch'});});
def('idanas6',{n:'IDANÄS chest of 6 drawers',q:'IDANÄS chest of 6 drawers',cat:'ward',w:162,d:50,h:95,col:P.idanas},function(g,c){chest(g,c.h,{W:1.62,D:0.5,H:0.95,legs:0.16,leg:'taper',top:0.025,rows:[[2,1],[2,1],[2,1]],grip:'notch'});});
def('brimnes4',{n:'BRIMNES chest of 4 drawers',q:'BRIMNES chest of 4 drawers',cat:'ward',w:78,d:41,h:124,col:P.brimnes.concat([['White, frosted glass',WHITE]])},function(g,c){
  chest(g,c.h,{W:0.78,D:0.41,H:1.24,plinth:0.05,top:0.02,rows:[[1,1],[1,1],[1,1],[1,1]],grip:'notch',glass:/glass/.test(c.n)});});
def('koppang6',{n:'KOPPANG chest of 6 drawers',q:'KOPPANG chest of 6 drawers',cat:'ward',w:172,d:44,h:83,col:P.kullen},function(g,c){chest(g,c.h,{W:1.72,D:0.44,H:0.83,plinth:0.06,top:0.02,rows:[[2,1],[2,1],[2,1]],grip:'bar',gc:c.h===WHITE?0x8d8f8e:0xb9bdc0});});

/* ======================= MIRRORS ======================= */
/* a framed mirror w × h, face at +x, its frame fw wide and fd deep, built standing on y=0 */
function framedMirror(g,col,w,h,fw,fd,x){
  [-1,1].forEach(function(s){box(fd,h,fw,col,x,h/2,s*(w/2-fw/2),g); box(fd,fw,w-2*fw,col,x,s<0?fw/2:h-fw/2,0,g);});
  box(0.006,h-2*fw+0.01,w-2*fw+0.01,mirror(),x+0.002,h/2,0,g); box(0.01,h-0.01,w-0.01,sh(col,0.8),x-fd/2+0.005,h/2,0,g);
}
def('ikornnes',{n:'IKORNNES floor mirror',q:'IKORNNES standing mirror',cat:'ward',w:52,d:45,h:167,col:P.ash,note:'Leans back on its own stand, so it needs no wall.'},function(g,c){
  const f=c.h, s=G(g); s.position.set(0.14,0.02,0); s.rotation.z=0.12;
  rbox(0.03,1.62,0.52,f,0,0.81,0,s,0.012,0.12); rbox(0.006,1.52,0.44,mirror(),0.016,0.81,0,s,0.002,0.1);
  [-1,1].forEach(function(e){box(0.05,0.02,0.04,f,0.0,0.01,e*0.22,s); M.barXY(box(1,0.03,0.025,f,0,0,e*0.2,g),-0.06,1.3,-0.3,0.015);});
  box(0.04,0.02,0.44,f,-0.29,0.01,0,g);
});
def('hovet',{n:'HOVET mirror 78 × 196',q:'HOVET mirror 78x196',cat:'ward',w:78,d:20,h:196,col:[['Aluminium',0xc4c7c9]],note:'Stands on the floor, leaning on the wall.'},function(g,c){
  const s=G(g); s.position.x=0.09; s.rotation.z=0.085; framedMirror(s,c.h,0.78,1.95,0.035,0.025,0);});

/* ======================= ON THE WALL ======================= */
def('nissedal',{n:'NISSEDAL mirror 65 × 150',q:'NISSEDAL mirror 65x150',cat:'wall',place:'wall',y:0.6,w:65,d:3,h:150,col:[['White',WHITE],['Black',0x262626]]},function(g,c){framedMirror(g,c.h,0.65,1.5,0.05,0.03,0);});
def('hemnesMirror',{n:'HEMNES mirror 74 × 165',q:'HEMNES mirror 74x165',cat:'wall',place:'wall',y:0.5,w:74,d:4,h:165,col:C.hemnes},function(g,c){
  framedMirror(g,c.h,0.74,1.65,0.075,0.03,-0.005); [-1,1].forEach(function(s){box(0.04,0.03,0.78,c.h,0.0,s<0?0.015:1.635,0,g);});});
def('curtains',{n:'HILJA curtains, 1 pair, on a rod',q:'HILJA curtains 1 pair',cat:'wall',place:'wall',y:0.05,w:220,d:12,h:280,col:skin([['White',DUV],['Beige',0xd8cbb2],['Grey',0x9a9a96],['Dark blue',0x3e4a59]],WEAVE),
  note:'Hung from a rod near the ceiling, drawn open to each side of the window.'},function(g,c){
  const top=2.76; cyl(0.012,2.16,0x2b2b2b,0.02,top,0,g,10).rotation.x=R/2; [-1,1].forEach(function(s){sph(0.022,0x2b2b2b,0.02,top,s*1.09,g); box(0.08,0.015,0.015,0x2b2b2b,-0.02,top,s*0.95,g);});
  [-1,1].forEach(function(s){K.curtain(g,0.02,s*0.78,0.55,false,0.0,top-0.03,c.h); box(0.01,top-0.04,0.54,c.h,0.012,(top-0.04)/2,s*0.78,g); box(0.035,0.04,0.56,c.h,0.02,top-0.03,s*0.78,g);});
});
})();

/* =============================== LIVING ROOM: sofas, armchairs, tables, TV, shelves, lamps, plants, decor, wall, rugs =============================== */
/* Haroe 10 — more living-room IKEA: sofas, armchairs, coffee tables, TV benches, shelves, lamps, plants, decor, wall pieces and rugs.
   Same rules as catalog.js: built facing +x, back at -x, width along z, origin on the floor in the middle of the footprint. */
(function(){
'use strict';
const A=window.APP, M=A.more, def=M.def, K=A.kit, C=A.IKEA, box=A.box, rbox=A.rbox, cyl=A.cyl, sph=A.sph, torus=A.torus, G=A.G, R=Math.PI, sh=A.shade, H=A.D.H;
const WOOD=A.surfaces.wood, WEAVE=A.surfaces.weave, RAT=A.surfaces.rattan;
const STEEL=M.STEEL, barXY=M.barXY, sqLegs=M.sqLegs, glass=M.glass, skin=M.skin;
const GLASS=0xcfe0e3, GALV=0xb6babb, DARK=0x2a2622, BIRCH=0xd9bf8c, BRASS=0xb5924c;
const fab=function(l){return skin(l,WEAVE);}, wood=function(l){return skin(l,WOOD);}, grain=function(h){skin([['',h]],WOOD); return h;};   // grain: a wood colour used as a second colour
const UP=new THREE.Vector3(0,1,0);
/* a round bar from point a to point b */
function rod(p,a,b,r,col,seg){const d=new THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]), L=d.length(), m=cyl(r,L,col,(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2,p,seg||8); m.quaternion.setFromUnitVectors(UP,d.normalize()); return m;}
function mesh(geo,mat,x,y,z,p){const m=new THREE.Mesh(geo,mat&&mat.isMaterial?mat:A.M(mat)); m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; p.add(m); return m;}
function tvOn(g,x,y){box(0.24,0.03,0.5,0x101214,x,y+0.015,0,g); box(0.04,0.08,0.06,0x101214,x-0.02,y+0.06,0,g); K.tv(g,x-0.02,y+0.44,0);}
function tint(m,hex,em){const q=m.material.clone(); q.color.set(hex); if(em) q.emissive=new THREE.Color(em); m.material=A.reg(q); return m;}
function knob(g,x,y,z,col,r){cyl(r||0.012,0.022,col,x,y,z,g,10).rotation.z=R/2;}
function pull(g,x,y,z,w,col){box(0.006,0.012,w,col,x,y,z,g);}

/* ======================= SOFAS ======================= */
/* catalog.js's sofa, with an arm of its own width (an, ap: -z and +z) and height on each side, or none, and a plinth instead of legs */
function sofa(g,c,o){
  const f=c.h, W=o.w, D=o.d, an=o.an, ap=o.ap, iw=W-an-ap, z0=-W/2+an, n=o.n, lh=o.lh, base=o.sh-o.ch, leg=o.legC==null?DARK:o.legC, ci=o.chaise?(o.chaise>0?n-1:0):-1, cd=o.cd||0, cw=iw/n;
  const d0=z0-(an?0.02:0), d1=W/2-ap+(ap?0.02:0), dw=d1-d0, dz=(d0+d1)/2;           // deck and back frame run 2 cm into an arm
  if(o.plinth){box(D-0.08,lh,W-0.08,DARK,0,lh/2,0,g); if(o.chaise) box(cd,lh,cw-0.06,DARK,D/2+cd/2-0.04,lh/2,o.chaise*(W/2-(o.chaise>0?ap:an)-cw/2),g);}
  else{const feet=[[-D/2+0.07,-W/2+0.07],[D/2-0.07,-W/2+0.07],[-D/2+0.07,W/2-0.07],[D/2-0.07,W/2-0.07]];
    if(o.chaise) feet.push([D/2+cd-0.07,o.chaise*(W/2-0.07)],[D/2+cd-0.07,o.chaise*(W/2-cw-(o.chaise>0?ap:an)+0.07)]);
    feet.forEach(function(q){cyl(o.lr||0.022,lh,leg,q[0],lh/2,q[1],g,10,o.lt);});}
  rbox(D,base-lh,dw,f,0,lh+(base-lh)/2,dz,g,0.04);
  if(o.chaise) rbox(cd+0.04,base-lh,cw+0.02,f,D/2+cd/2-0.02,lh+(base-lh)/2,o.chaise*(W/2-(o.chaise>0?ap:an)-cw/2),g,0.04);
  [-1,1].forEach(function(e){const aw=e<0?an:ap; if(!(aw>0)) return;
    const ext=o.chaise===e?cd:0, z=e*(W/2-aw/2), L=D+ext, x=ext/2, ah=(e<0?o.ahN:o.ahP)||o.ah;
    if(o.arm==='roll'){const hh=ah-lh-aw*0.45; rbox(L,hh,aw,f,x,lh+hh/2,z,g,0.04); cyl(aw*0.5,L,f,x,ah-aw*0.5,z,g,18).rotation.z=R/2;}
    else rbox(L,ah-lh,aw,f,x,lh+(ah-lh)/2,z,g,o.arm==='slab'?0.025:(o.ar||0.07),o.arm==='slab'?0.01:0.05);
  });
  rbox(o.bd,o.bh-base+0.02,dw,f,-D/2+o.bd/2,base+(o.bh-base)/2,dz,g,0.06);                         // back frame
  const sd=D-o.bd-0.01, seam=sh(f,0.8);
  for(let i=0;i<n;i++){
    const z=z0+cw*(i+0.5), ext=i===ci?cd:0;
    rbox(sd+ext,o.ch,cw-0.012,f,-D/2+o.bd+(sd+ext)/2,base+o.ch/2,z,g,0.06);
    box(sd+ext-0.03,0.004,cw-0.03,seam,-D/2+o.bd+(sd+ext)/2,base+o.ch/2,z,g).castShadow=false;
    if(!o.tight){const b=rbox(o.bct,o.bch,cw-0.016,f,-D/2+o.bd+o.bct/2-0.03,base+o.ch+o.bch/2-0.03,z,g,0.08); b.rotation.z=o.tilt==null?0.14:o.tilt;}
  }
  if(o.tight) rbox(0.1,o.bh-base-o.ch,iw,f,-D/2+o.bd+0.04,base+o.ch+(o.bh-base-o.ch)/2,z0+iw/2,g,0.04);
}
function sofaSeats(o){
  const iw=o.w-o.an-o.ap, cw=iw/o.n, z0=-o.w/2+o.an, lx=(-o.d/2+o.bd+o.bct-0.03+o.d/2)/2-0.04, y=o.sh, out=[], z=function(i){return z0+cw*(i+0.5);};
  if(o.n===1) return [{id:'',lx:lx,lz:z(0),y:y,type:'sit',recline:0.2}];
  out.push({id:'L',label:'Sofa, left',lx:lx,lz:z(0),y:y,type:'sit',recline:0.22});
  for(let i=1;i<o.n-1;i++) out.push({id:i===1?'M':'M'+i,label:'Sofa, middle',lx:lx,lz:z(i),y:y,type:'sit',recline:0.22});
  out.push({id:'R',label:'Sofa, right',lx:lx,lz:z(o.n-1),y:y,type:'sit',recline:0.22});
  if(iw>1.3) out.push({id:'Lie',label:'Sofa',lx:lx-0.04,lz:z0+iw/2,y:y+0.01,type:'lie',dh:-R/2});
  return out;
}
function sofaDef(k,o,meta,extra){
  o=Object.assign({lh:0.025,sh:0.45,ch:0.17,bd:0.2,bct:0.22,bch:0.42,n:3},o); if(o.an==null) o.an=o.aw; if(o.ap==null) o.ap=o.aw;
  meta.w=Math.round(o.w*100); meta.d=Math.round((o.d+(o.cd||0))*100); meta.cat=meta.cat||'sofa'; meta.seats=sofaSeats(o); if(meta.cat==='sofa') meta.seatAs='sofa';
  return def(k,meta,function(g,c,q){sofa(g,c,o); if(extra) extra(g,c,o,q);});
}
sofaDef('friheten',{w:2.3,d:0.88,an:0.15,ap:0.2,ah:0.6,ahP:0.66,bh:0.66,sh:0.45,ch:0.14,lh:0.04,chaise:1,cd:0.63,bct:0.2,bch:0.44,tilt:0.18},
  {n:'FRIHETEN corner sofa-bed with storage',q:'FRIHETEN corner sofa-bed',h:86,col:fab([['Skiftebo dark grey',0x515357],['Faringe light grey',0xb9b8b3],['Faringe brown-orange',0xa0613a]]).concat([['Bomstad black',0x2a2928]]),
   note:'Pulls out into a 140 × 204 cm bed; the chaise, on your left as you face it, lifts for storage.'});
const KLIP=fab([['Vissle grey',0x8d8f8f],['Vissle green',0x56705a],['Långban bright yellow',0xe0b52f],['Långban bright red',0xb8322b],['Kabusa dark grey',0x4d4f52]]);
sofaDef('klippan2',{w:1.8,d:0.88,aw:0.17,ah:0.66,bh:0.66,sh:0.43,ch:0.12,lh:0.1,n:2,tight:true,ar:0.09,legC:0x232323},{n:'KLIPPAN 2-seat sofa',h:66,col:KLIP,note:'Small and boxy, with a cover that goes in the washing machine.'});
sofaDef('glostad2',{w:1.21,d:0.78,aw:0.05,ah:0.57,bh:0.56,sh:0.41,ch:0.11,lh:0.21,n:2,bd:0.16,bct:0.17,bch:0.3,ar:0.025,lr:0.015,lt:0.02,legC:0x232323},{n:'GLOSTAD 2-seat sofa',h:68,col:fab([['Knisa dark grey',0x4f5154],['Knisa medium blue',0x4d6a8c]]),note:'A compact loveseat, 121 cm wide, on thin black legs.'});
sofaDef('linanas3',{w:1.97,d:0.81,aw:0.09,ah:0.66,bh:0.68,sh:0.46,ch:0.12,lh:0.15,bd:0.18,bct:0.16,bch:0.33,ar:0.04,lr:0.014,legC:0x232323},{n:'LINANÄS 3-seat sofa',h:76,col:fab([['Vissle dark grey',0x55575a],['Vissle beige',0xc6b79c]])});
sofaDef('uppland3',{w:2.24,d:0.92,aw:0.25,ah:0.62,bh:0.76,sh:0.47,ch:0.16,lh:0.13,bd:0.2,bct:0.22,bch:0.48,arm:'roll',legC:0x6b4a2f,lr:0.02,lt:0.024},
  {n:'UPPLAND 3-seat sofa',h:92,col:[['Blekinge white',0xeeebe2]].concat(fab([['Kilanda light beige',0xe1d8c6],['Hakebo grey-green',0x7f8a7c],['Kilanda dark blue',0x2f3d58]])),note:'Deep seat with pocket springs; the cover is removable and washable.'});
sofaDef('jattebo3',{w:2.4,d:0.95,aw:0.25,ah:0.6,bh:0.62,sh:0.46,ch:0.18,lh:0.04,plinth:true,bd:0.22,bct:0.24,bch:0.28,ar:0.08,tilt:0.1},
  {n:'JÄTTEBO 3-seat modular sofa with armrests',q:'JÄTTEBO 3-seat modular sofa',h:71,col:fab([['Samsala grey-beige',0xb8ae9c],['Samsala dark blue',0x2e3a50],['Samsala brown-red',0x7c4436],['Tonerud grey',0x8e8e8a]]),note:'Three deep modules and two wide arms; add or swap modules later.'});
sofaDef('parup3',{w:2.06,d:0.8,aw:0.135,ah:0.69,bh:0.7,sh:0.47,ch:0.15,lh:0.1,bd:0.18,bct:0.2,bch:0.42,ar:0.05,legC:0x232323,lr:0.018},{n:'PÄRUP 3-seat sofa',h:86,col:fab([['Vissle grey',0x8d8f8f],['Gunnared beige',0xc9b99c],['Gunnared dark grey',0x58595c],['Vissle yellow-brown',0xa8813e]])});
sofaDef('hyltarp2',{w:1.82,d:0.93,aw:0.11,ah:0.63,bh:0.82,sh:0.48,ch:0.16,lh:0.14,bd:0.2,bct:0.2,bch:0.46,ar:0.05,legC:0x6b4a2f,lr:0.02,lt:0.026,n:2},
  {n:'HYLTARP 2-seat sofa',h:91,col:fab([['Gransel grey-brown',0x8a7f72],['Kilanda pale blue',0xb9c6cf]]).concat([['Hallarp white',0xece9e1]])});
sofaDef('klippanArm',{w:0.88,d:0.88,aw:0.17,ah:0.66,bh:0.66,sh:0.43,ch:0.12,lh:0.1,n:1,tight:true,ar:0.09,legC:0x232323},{n:'KLIPPAN armchair',cat:'arm',h:66,col:KLIP});

/* SÖDERHAMN corner: corner and two sections along the back with an arm at the right end, one section coming forward on the left, open at its end */
def('soderhamnCorner',{n:'SÖDERHAMN corner sofa, 4-seat with open end',q:'SÖDERHAMN corner sofa 4-seat',cat:'sofa',w:291,d:192,h:83,col:C.soder,seatAs:'sofa',
  note:'291 cm along the back and 192 cm along the open-ended side, low and deep.',
  seats:[{id:'L',label:'Sofa, right end',lx:-0.36,lz:-0.93,y:0.4,type:'sit',recline:0.22},{id:'M',label:'Sofa, middle',lx:-0.36,lz:0,y:0.4,type:'sit',recline:0.22},
    {id:'C',label:'Sofa, corner',lx:-0.36,lz:0.85,y:0.4,type:'sit',recline:0.22},{id:'R',label:'Sofa, side',lx:0.5,lz:0.8,y:0.4,type:'sit',recline:0.22,dh:R/2},
    {id:'Lie',label:'Sofa',lx:-0.4,lz:-0.45,y:0.41,type:'lie',dh:-R/2}]},function(g,c){
  const f=c.h, W=2.91, D=1.92, d=0.99, lh=0.1, base=0.25, bd=0.14, x0=-D/2, xf=x0+d, zr=W/2, zi=zr-d, sw=0.93, seam=sh(f,0.8);
  [[x0+0.06,-zr+0.06],[xf-0.06,-zr+0.06],[x0+0.06,zr-0.06],[D/2-0.06,zr-0.06],[D/2-0.06,zi+0.06],[xf-0.06,zi+0.06]].forEach(function(q){cyl(0.022,lh,DARK,q[0],lh/2,q[1],g,10);});
  rbox(d,base-lh,W-0.04,f,x0+d/2,lh+(base-lh)/2,0.02,g,0.04); rbox(D-d+0.02,base-lh,d,f,xf+(D-d)/2-0.01,lh+(base-lh)/2,zi+d/2,g,0.04);       // decks
  rbox(d,0.6-lh,0.06,f,x0+d/2,lh+(0.6-lh)/2,-zr+0.03,g,0.025,0.01);                                                                     // the thin arm
  rbox(bd,0.69-base+0.02,W-0.06,f,x0+bd/2,base+(0.69-base)/2,0.03,g,0.05); rbox(D-bd,0.69-base+0.02,bd,f,x0+bd+(D-bd)/2,base+(0.69-base)/2,zr-bd/2,g,0.05);   // backs
  const sx=x0+bd+(d-bd)/2, sd=d-bd-0.01, cz=(zi+zr-bd)/2, cw=zr-bd-zi;
  [[sx,sd,-zr+0.06+sw/2,sw],[sx,sd,-zr+0.06+sw*1.5,sw],[sx,sd,cz,cw],[xf+(D/2-xf)/2,D/2-xf,cz,cw]].forEach(function(q){
    rbox(q[1],0.15,q[3]-0.012,f,q[0],base+0.075,q[2],g,0.06); box(q[1]-0.03,0.004,q[3]-0.03,seam,q[0],base+0.075,q[2],g).castShadow=false;});
  [-zr+0.06+sw/2,-zr+0.06+sw*1.5,cz].forEach(function(z,i){const b=rbox(0.2,0.38,(i<2?sw:cw)-0.016,f,x0+bd+0.07,base+0.15+0.16,z,g,0.08); b.rotation.z=0.12;});
  const b=rbox(D/2-xf-0.02,0.38,0.2,f,xf+(D/2-xf)/2,base+0.15+0.16,zr-bd-0.07,g,0.08); b.rotation.x=0.12;
});
/* VALLENTUNA: three seat modules with storage under the seat, each with its own backrest; no arms */
def('vallentuna3',{n:'VALLENTUNA 3-seat modular sofa with storage',q:'VALLENTUNA modular sofa',cat:'sofa',w:240,d:100,h:84,col:[['Murum black',0x2b2b2d],['Murum white',0xeeece6]],seatAs:'sofa',
  note:'Three 80 × 100 cm seat modules, with storage under each seat.',
  seats:[{id:'L',label:'Sofa, left',lx:0.06,lz:-0.8,y:0.45,type:'sit',recline:0.2},{id:'M',label:'Sofa, middle',lx:0.06,lz:0,y:0.45,type:'sit',recline:0.2},{id:'R',label:'Sofa, right',lx:0.06,lz:0.8,y:0.45,type:'sit',recline:0.2},{id:'Lie',label:'Sofa',lx:0.02,lz:0,y:0.46,type:'lie',dh:-R/2}]},function(g,c){
  const f=c.h, ln=sh(f,f<0x808080?1.6:0.82);
  for(let i=0;i<3;i++){const z=-0.8+i*0.8;
    box(0.9,0.03,0.7,DARK,0,0.015,z,g); rbox(1.0,0.3,0.79,f,0,0.18,z,g,0.02);                        // plinth and the storage box
    box(0.003,0.004,0.74,ln,0.5,0.3,z,g).castShadow=false;                                              // the lid's edge
    rbox(0.8,0.12,0.78,f,0.1,0.39,z,g,0.04); const b=rbox(0.2,0.44,0.78,f,-0.4,0.62,z,g,0.06); b.rotation.z=0.06;}
});

/* ======================= ARMCHAIRS AND POUFS ======================= */
function splay(g,pts,h,col,r,k,rt){pts.forEach(function(q){const l=cyl(r,h,col,q[0],h/2,q[1],g,10,rt); l.rotation.set(-Math.sign(q[1])*k,0,Math.sign(q[0])*k);});}
def('koarp',{n:'KOARP armchair',cat:'arm',w:83,d:78,h:75,col:fab([['Gunnared beige, black',0xc9b99c],['Saxemara black-blue, black',0x2c3446]]),seats:[{id:'',lx:0.06,lz:0,y:0.44,type:'sit',recline:0.18}]},function(g,c){
  const f=c.h; splay(g,[[0.27,-0.3],[0.27,0.3],[-0.27,-0.3],[-0.27,0.3]],0.24,0x232323,0.011,0.12);
  rbox(0.7,0.13,0.62,f,0,0.295,0,g,0.04); rbox(0.56,0.1,0.58,f,0.08,0.39,0,g,0.045);
  rbox(0.14,0.5,0.62,f,-0.3,0.5,0,g,0.06).rotation.z=0.2;
  [-1,1].forEach(function(e){const a=rbox(0.72,0.3,0.11,f,0,0.47,e*0.36,g,0.05); a.rotation.z=0.04;});
});
def('vedbo',{n:'VEDBO high-back armchair',cat:'arm',w:80,d:85,h:108,col:fab([['Gunnared dark grey',0x58595c],['Gunnared blue',0x3f5b78],['Gunnared light brown-pink',0xc49a8c],['Gunnared light green',0xa7b39a]]),
  seats:[{id:'',lx:0.06,lz:0,y:0.44,type:'sit',recline:0.15}]},function(g,c){
  const f=c.h; splay(g,[[0.25,-0.27],[0.25,0.27],[-0.27,-0.27],[-0.27,0.27]],0.27,BIRCH,0.017,0.1,0.022);
  rbox(0.7,0.14,0.64,f,0.02,0.33,0,g,0.05); rbox(0.5,0.06,0.52,f,0.1,0.42,0,g,0.03);
  rbox(0.14,0.8,0.5,f,-0.34,0.68,0,g,0.07).rotation.z=0.14;
  [-1,1].forEach(function(e){rbox(0.6,0.24,0.1,f,0.03,0.5,e*0.35,g,0.05); const s=rbox(0.14,0.74,0.3,f,-0.28,0.7,e*0.22,g,0.06); s.rotation.set(0,e*0.55,0.12);});   // the back curves round at its sides
});
def('pello',{n:'PELLO armchair',cat:'arm',w:67,d:85,h:96,col:skin([['Holmby natural',0xd8cbb0,BIRCH]],WEAVE),seats:[{id:'',lx:0.04,lz:0,y:0.4,type:'sit',recline:0.3}]},function(g,c){
  const f=c.h, fr=c.h2;
  [-1,1].forEach(function(e){const z=e*0.31;
    box(0.8,0.022,0.045,fr,0.0,0.011,z,g);                                                    // runner along the floor
    barXY(box(1,0.028,0.045,fr,0,0,z,g),0.38,0.02,0.3,0.6); box(0.5,0.028,0.05,fr,0.06,0.6,z,g);   // front bow up into the armrest
    barXY(box(1,0.028,0.045,fr,0,0,z,g),-0.4,0.02,-0.2,0.6);
    barXY(box(1,0.022,0.03,fr,0,0,e*0.285,g),0.3,0.32,-0.18,0.27); barXY(box(1,0.022,0.03,fr,0,0,e*0.285,g),-0.18,0.27,-0.42,0.95);});
  rbox(0.5,0.09,0.56,f,0.05,0.35,0,g,0.04).rotation.z=0.1;
  rbox(0.1,0.66,0.55,f,-0.27,0.64,0,g,0.04).rotation.z=0.42;
  cyl(0.055,0.53,f,-0.4,0.93,0,g,14).rotation.x=R/2;
});
def('buskbo',{n:'BUSKBO armchair, rattan',q:'BUSKBO armchair',cat:'arm',w:72,d:63,h:75,col:skin([['Rattan',0xcfae7c,null],['Rattan, Djupvik white cushion',0xcfae7c,0xeeebe3]],RAT),
  seats:[{id:'',lx:0.04,lz:0,y:0.36,type:'sit',recline:0.15}]},function(g,c){
  const r=c.h, rr=0.335, y1=0.74;
  [[0.2,-0.27],[0.2,0.27],[-0.24,-0.24],[-0.24,0.24]].forEach(function(q){cyl(0.016,0.29,r,q[0],0.145,q[1],g,8);});
  rbox(0.52,0.04,0.64,r,0.0,0.3,0,g,0.015);
  const wm=A.M(r); wm.side=THREE.DoubleSide; mesh(new THREE.CylinderGeometry(rr,rr,y1-0.32,32,1,true,R,R),wm,0,(y1+0.32)/2,0,g);   // the woven back, a half round
  torus(rr,0.022,r,0,y1,0,g,R).rotation.set(R/2,0,R/2); torus(rr,0.012,r,0,0.33,0,g,R).rotation.set(R/2,0,R/2);
  [-1,1].forEach(function(e){cyl(0.022,0.24,r,0.12,y1,e*rr,g,10).rotation.z=R/2; cyl(0.016,y1-0.31,r,0.23,(y1+0.31)/2,e*rr,g,8); box(0.23,y1-0.33,0.01,r,0.115,(y1+0.33)/2,e*rr,g);});
  box(0.012,0.06,0.64,r,0.255,0.29,0,g);
  if(c.h2) rbox(0.5,0.08,0.6,c.h2,0.03,0.36,0,g,0.04);
});
def('oskarshamn',{n:'OSKARSHAMN wing chair',cat:'arm',w:82,d:86,h:99,col:fab([['Tibbleby beige/grey',0xb1a998],['Gunnared black-grey',0x47484a],['Tonerud red',0x9a3a2f]]),seats:[{id:'',lx:0.08,lz:0,y:0.45,type:'sit',recline:0.15}]},function(g,c){
  const f=c.h; splay(g,[[0.29,-0.32],[0.29,0.32],[-0.3,-0.32],[-0.3,0.32]],0.2,0x3a2a1e,0.016,0.08,0.026);
  rbox(0.76,0.19,0.74,f,0,0.29,0,g,0.05); rbox(0.56,0.09,0.56,f,0.09,0.43,0,g,0.04);
  rbox(0.14,0.76,0.74,f,-0.33,0.62,0,g,0.07).rotation.z=0.12;
  rbox(0.1,0.4,0.52,f,-0.23,0.66,0,g,0.05).rotation.z=0.14;
  [-1,1].forEach(function(e){rbox(0.6,0.26,0.11,f,0.07,0.5,e*0.355,g,0.05); const w=rbox(0.3,0.44,0.1,f,-0.22,0.8,e*0.345,g,0.06); w.rotation.y=-e*0.18;});
});
def('ekenaset',{n:'EKENÄSET armchair',cat:'arm',w:64,d:78,h:76,col:fab([['Kilanda light beige',0xe1d8c6,0xc9a66b],['Kilanda grey-turquoise',0x5f7f7c,0xc9a66b]]),
  seats:[{id:'',lx:0.04,lz:0,y:0.45,type:'sit',recline:0.15}]},function(g,c){
  const f=c.h, w=c.h2;
  [-1,1].forEach(function(e){const z=e*0.29;
    box(0.035,0.63,0.035,w,0.33,0.315,z,g); barXY(box(1,0.035,0.035,w,0,0,z,g),-0.37,0.0,-0.27,0.76);       // front post, raked back leg
    box(0.68,0.025,0.055,w,0.0,0.64,z,g); box(0.6,0.05,0.025,w,0,0.27,z,g);});                                   // armrest, seat rail
  box(0.025,0.05,0.56,w,0.33,0.27,0,g); box(0.025,0.05,0.56,w,-0.31,0.27,0,g);
  rbox(0.58,0.16,0.54,f,0.03,0.37,0,g,0.04); rbox(0.13,0.38,0.54,f,-0.26,0.56,0,g,0.05).rotation.z=0.2;
});
def('linneback',{n:'LINNEBÄCK easy chair',cat:'arm',w:55,d:70,h:72,col:fab([['Vissle dark grey',0x55575a],['Orrsta light grey',0xbfc0bc],['Orrsta olive green',0x6f7350]]),
  seats:[{id:'',lx:0.06,lz:0,y:0.42,type:'sit',recline:0.2}]},function(g,c){
  const f=c.h, k=0x232323;
  [-1,1].forEach(function(e){const z=e*0.25;
    rod(g,[0.3,0,z],[0.27,0.36,z],0.009,k); rod(g,[-0.32,0,z],[-0.2,0.36,z],0.009,k); rod(g,[0.27,0.36,z],[-0.2,0.36,z],0.009,k); rod(g,[-0.2,0.36,z],[-0.31,0.69,z],0.009,k);});
  rbox(0.52,0.08,0.54,f,0.04,0.39,0,g,0.035).rotation.z=0.05;
  rbox(0.09,0.36,0.53,f,-0.24,0.53,0,g,0.035).rotation.z=0.3;
});
def('bosnas',{n:'BOSNÄS footstool with storage',q:'BOSNÄS footstool',cat:'arm',w:36,d:36,h:36,col:fab([['Ransta yellow',0xd9a832],['Ransta black',0x2f3032]]),role:'soft',
  seats:[{id:'',label:'Footstool',lx:0,lz:0,y:0.36,type:'sit',face:true}]},function(g,c){
  const f=c.h; rbox(0.36,0.29,0.36,f,0,0.145,0,g,0.03); rbox(0.36,0.07,0.36,f,0,0.325,0,g,0.03);});

/* ======================= COFFEE AND SIDE TABLES ======================= */
def('vittsjoCT',{n:'VITTSJÖ coffee table',cat:'table',w:75,d:75,h:45,col:[['Black-brown, glass',0x2e2a28],['Light beige, glass',0xd8ccb4]]},function(g,c){
  const f=c.h; glass(cyl(0.372,0.008,GLASS,0,0.444,0,g,48),0.32); torus(0.36,0.008,f,0,0.438,0,g).rotation.x=R/2;
  glass(cyl(0.355,0.006,GLASS,0,0.15,0,g,44),0.32); torus(0.355,0.007,f,0,0.15,0,g).rotation.x=R/2;
  [0,1,2,3].forEach(function(i){const a=i*R/2+R/4; cyl(0.009,0.44,f,Math.cos(a)*0.357,0.22,Math.sin(a)*0.357,g,8);});});
def('kragsta',{n:'KRAGSTA coffee table',cat:'table',w:90,d:90,h:48,col:[['White',0xf2f1ec],['Black',0x262626]]},function(g,c){
  const f=c.h; cyl(0.43,0.04,f,0,0.46,0,g,48); torus(0.43,0.02,f,0,0.46,0,g).rotation.x=R/2; cyl(0.38,0.06,f,0,0.41,0,g,40);
  [0,1,2,3].forEach(function(i){const a=i*R/2+R/4, l=cyl(0.018,0.44,f,Math.cos(a)*0.3,0.21,Math.sin(a)*0.3,g,10,0.028); l.rotation.set(-Math.sin(a)*0.18,0,Math.cos(a)*0.18);});});
def('arkelstorp',{n:'ARKELSTORP coffee table',cat:'table',w:140,d:65,h:52,col:[['Black',0x262626]],note:'Drop-leaf: 50 cm wide with both leaves down, 140 cm with them up.'},function(g,c){
  const f=c.h; box(0.65,0.035,0.5,f,0,0.5025,0,g); box(0.56,0.1,0.44,f,0,0.43,0,g); sqLegs(g,0.27,0.19,0.485,0.05,f); box(0.56,0.02,0.4,f,0,0.13,0,g);
  [-1,1].forEach(function(e){box(0.65,0.03,0.45,f,0,0.505,e*0.475,g); box(0.003,0.03,0.002,sh(f,2),0.326,0.505,e*0.25,g); box(0.025,0.04,0.36,f,0,0.465,e*0.38,g);});});
def('tingby',{n:'TINGBY side table on castors',cat:'table',w:50,d:50,h:45,col:[['White',0xf2f1ec],['Grey',0x8e9190],['Red',0xb8392f]]},function(g,c){
  const f=c.h; box(0.5,0.03,0.5,f,0,0.435,0,g); box(0.46,0.02,0.46,f,0,0.13,0,g);
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){box(0.04,0.37,0.04,f,q[0]*0.225,0.055+0.185,q[1]*0.225,g); cyl(0.024,0.02,0x2b2b2b,q[0]*0.21,0.026,q[1]*0.21,g,12).rotation.x=R/2; box(0.03,0.012,0.03,0x8d9092,q[0]*0.21,0.05,q[1]*0.21,g);});});
def('hemnesSide',{n:'HEMNES side table',cat:'table',w:55,d:55,h:50,col:C.hemnes},function(g,c){
  const f=c.h; box(0.55,0.03,0.55,f,0,0.485,0,g); box(0.49,0.07,0.49,f,0,0.435,0,g); sqLegs(g,0.235,0.235,0.47,0.055,f); box(0.47,0.02,0.47,f,0,0.12,0,g);});
def('lackCT118',{n:'LACK coffee table 118 × 78',q:'LACK coffee table 118x78',cat:'table',w:118,d:78,h:45,col:[['White',0xf2f1ec],['Beige',0xd6c8ae]].concat(wood([['Black-brown',0x3a312c],['White stained oak effect',0xdad0be]]))},function(g,c){
  const f=c.h; box(0.78,0.05,1.18,f,0,0.425,0,g); sqLegs(g,0.35,0.55,0.4,0.07,f); box(0.72,0.03,1.12,f,0,0.13,0,g);});

/* ======================= TV AND MEDIA (each with the 55" TV standing on it) ======================= */
def('brimnesTV',{n:'BRIMNES TV bench',cat:'media',w:120,d:41,h:53,lh:1.6,col:[['White',0xf2f1ec],['Black',0x262626]]},function(g,c){
  const f=c.h; box(0.41,0.025,1.2,f,0,0.5175,0,g); [-0.59,0.59].forEach(function(z){box(0.41,0.47,0.02,f,0,0.27,z,g);});
  box(0.41,0.02,1.16,f,0,0.045,0,g); box(0.4,0.02,1.16,f,0,0.27,0,g); box(0.39,0.22,0.02,f,0,0.39,0,g); box(0.008,0.47,1.16,sh(f,0.93),-0.2,0.27,0,g);
  box(0.37,0.035,1.16,f,-0.01,0.0175,0,g);
  [-0.29,0.29].forEach(function(z){box(0.018,0.21,0.574,sh(f,0.97),0.214,0.155,z,g); pull(g,0.226,0.24,z,0.14,sh(f,0.6));});
  tvOn(g,-0.04,0.53);});
const flTex={};
function fluted(hex){return flTex[hex]||(flTex[hex]=(function(){const t=A.canvasTex(64,64,function(q){q.fillStyle='#'+new THREE.Color(hex).getHexString(); q.fillRect(0,0,64,64);
  for(let x=0;x<64;x+=8){q.fillStyle='rgba(0,0,0,.18)'; q.fillRect(x,0,2,64); q.fillStyle='rgba(255,255,255,.16)'; q.fillRect(x+3,0,3,64);}}); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(9,1); return t;})());}
def('idanasTV',{n:'IDANÄS TV bench',cat:'media',w:162,d:40,h:63,lh:1.7,col:[['White',0xf2f1ec]].concat(wood([['Dark brown stained',0x4a3427]])),note:'Two wide soft-closing drawers under an open shelf.'},function(g,c){
  const f=c.h, fm=A.MT(fluted(f),null,true); sqLegs(g,0.15,0.76,0.1,0.045,f);
  box(0.4,0.03,1.62,f,0,0.615,0,g); box(0.38,0.02,1.58,f,-0.01,0.11,0,g); [-0.8,0.8].forEach(function(z){box(0.38,0.5,0.02,f,-0.01,0.35,z,g);});
  box(0.37,0.02,1.58,f,-0.01,0.36,0,g); box(0.008,0.5,1.58,sh(f,0.92),-0.196,0.35,0,g); box(0.37,0.24,0.02,f,-0.01,0.48,0,g);
  [-0.395,0.395].forEach(function(z){box(0.018,0.24,0.78,fm,0.19,0.235,z,g); pull(g,0.202,0.33,z,0.18,sh(f,0.6));});
  tvOn(g,-0.04,0.63);});
def('fjallboTV',{n:'FJÄLLBO TV bench',cat:'media',w:150,d:36,h:54,lh:1.6,col:[['Black',0x262626,grain(0x3b302a)]]},function(g,c){
  const f=c.h, w=c.h2;
  [[-1,-1],[1,-1],[-1,1],[1,1],[-1,0],[1,0]].forEach(function(q){box(0.025,0.54,0.025,f,q[0]*0.165,0.27,q[1]*0.735,g);});
  box(0.36,0.03,1.5,w,0,0.525,0,g); box(0.32,0.025,1.48,w,0,0.29,0,g); box(0.33,0.015,1.48,f,0,0.06,0,g);
  [-1,1].forEach(function(e){box(0.33,0.02,0.02,f,0,0.06,e*0.735,g); box(0.02,0.02,1.48,f,e*0.165,0.06,0,g); box(0.02,0.02,1.48,f,e*0.165,0.5,0,g);});
  tvOn(g,-0.03,0.54);});
def('haugaTV',{n:'HAUGA TV bench',cat:'media',w:138,d:36,h:54,lh:1.6,col:[['Grey',0x8e9190],['White',0xf2f1ec]]},function(g,c){
  const f=c.h; sqLegs(g,0.14,0.64,0.1,0.035,f);
  box(0.36,0.025,1.38,f,0,0.5275,0,g); box(0.36,0.02,1.36,f,0,0.11,0,g); [-0.68,-0.23,0.23,0.68].forEach(function(z){box(0.36,0.42,0.02,f,0,0.32,z,g);});
  box(0.008,0.42,1.36,sh(f,0.92),-0.176,0.32,0,g); [-0.455,0.455].forEach(function(z){box(0.34,0.018,0.44,f,0,0.32,z,g);});
  [0.22,0.42].forEach(function(y){box(0.018,0.19,0.448,sh(f,0.97),0.189,y,0,g); knob(g,0.205,y,0,sh(f,0.7),0.01);});
  tvOn(g,-0.03,0.54);});

/* ======================= SHELVES AND STORAGE ======================= */
function billy(g,f,W,h,d){
  const t=0.018; box(d,h,t,f,0,h/2,-W/2+t/2,g); box(d,h,t,f,0,h/2,W/2-t/2,g); box(d,t,W-2*t,f,0,h-t/2,0,g); box(0.012,0.07,W-2*t,f,d/2-0.02,0.035,0,g); box(d,t,W-2*t,f,0,0.07,0,g);
  box(0.004,h-0.02,W-0.02,sh(f,0.93),-d/2+0.002,h/2,0,g);
  for(let i=1;i<=5;i++) box(d-0.02,t,W-2*t-0.002,f,0.005,0.07+i*(h-0.09)/6,0,g);
}
/* a framed glass door, its face at x, from y0 to y1, centred on z; the knob on side s */
function glassDoor(g,f,x,y0,y1,z,w,s,kc){
  const h=y1-y0, y=(y0+y1)/2, b=0.05;
  [-1,1].forEach(function(e){box(0.02,h,b,f,x,y,z+e*(w/2-b/2),g); box(0.02,b,w-2*b,f,x,e<0?y0+b/2:y1-b/2,z,g);});
  glass(box(0.006,h-2*b,w-2*b,GLASS,x,y,z,g),0.25); if(kc!=null) knob(g,x+0.016,y,z+s*(w/2-0.035),kc);
}
def('billyOxberg',{n:'BILLY / OXBERG bookcase with glass doors',q:'BILLY OXBERG bookcase glass doors',cat:'shelf',w:80,d:30,h:202,col:C.lam.slice(0,3)},function(g,c){
  const f=c.h; billy(g,f,0.8,2.02,0.28); [-1,1].forEach(function(e){glassDoor(g,f,0.15,0.08,2.0,e*0.2,0.396,-e,sh(f,0.7));});});
def('hemnesGlass',{n:'HEMNES glass-door cabinet with 3 drawers',cat:'shelf',w:90,d:37,h:197,col:C.hemnes},function(g,c){
  const f=c.h, D=0.34, W=0.9, kn=0xb08d4a;
  [-1,1].forEach(function(e){box(D,1.93,0.03,f,0,0.965,e*(W/2-0.015),g);}); box(D+0.03,0.04,W+0.03,f,0.015,1.95,0,g); box(0.03,0.09,W,f,D/2,0.045,0,g);
  box(D,0.02,W-0.06,f,0,0.1,0,g); box(D,0.025,W-0.06,f,0,0.7,0,g); box(0.01,1.85,W-0.04,sh(f,0.93),-D/2+0.005,1.0,0,g);
  box(0.02,0.38,W-0.068,sh(f,0.97),D/2+0.01,0.3,0,g); knob(g,D/2+0.03,0.3,-0.2,kn); knob(g,D/2+0.03,0.3,0.2,kn);
  [-1,1].forEach(function(e){box(0.02,0.17,W/2-0.038,sh(f,0.97),D/2+0.01,0.595,e*(W/4-0.008),g); knob(g,D/2+0.03,0.595,e*(W/4-0.008),kn);
    glassDoor(g,f,D/2+0.01,0.72,1.92,e*(W/4-0.008),W/2-0.04,-e,kn);});
  [1.12,1.5].forEach(function(y){glass(box(D-0.04,0.008,W-0.08,GLASS,-0.01,y,0,g),0.3);});});
def('detolf',{n:'DETOLF glass-door cabinet',cat:'shelf',w:43,d:37,h:163,col:[['Black-brown',0x2e2a28],['White',0xf2f1ec]]},function(g,c){
  const f=c.h; [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){box(0.02,1.63,0.02,f,q[0]*0.175,0.815,q[1]*0.205,g);});
  box(0.37,0.03,0.43,f,0,0.015,0,g); box(0.37,0.03,0.43,f,0,1.615,0,g);
  [-1,1].forEach(function(e){glass(box(0.33,1.57,0.005,GLASS,0,0.815,e*0.205,g),0.22);}); glass(box(0.005,1.57,0.39,GLASS,0.18,0.815,0,g),0.22); glass(box(0.005,1.57,0.39,GLASS,-0.18,0.815,0,g),0.22);
  [0.42,0.8,1.2].forEach(function(y){glass(box(0.33,0.006,0.39,GLASS,0,y,0,g),0.3);}); box(0.01,0.12,0.012,f,0.188,0.85,0.17,g);});
def('fabrikor',{n:'FABRIKÖR glass-door cabinet',cat:'shelf',w:81,d:42,h:113,col:[['Dark grey',0x4c4f52],['Black-blue',0x262c38],['Dark yellow',0xb8902f]]},function(g,c){
  const f=c.h; [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){box(0.02,1.08,0.02,f,q[0]*0.2,0.59,q[1]*0.395,g); cyl(0.012,0.05,0x2b2b2b,q[0]*0.19,0.025,q[1]*0.38,g,8);});
  box(0.42,0.02,0.81,f,0,1.12,0,g); box(0.42,0.02,0.81,f,0,0.06,0,g); box(0.01,1.04,0.79,f,-0.205,0.59,0,g);
  [-1,1].forEach(function(e){glass(box(0.38,1.04,0.005,GLASS,0,0.59,e*0.395,g),0.25); glassDoor(g,f,0.21,0.07,1.11,e*0.2,0.395,-e,null); box(0.012,0.1,0.012,f,0.226,0.6,e*0.03,g);});
  [0.42,0.78].forEach(function(y){glass(box(0.38,0.006,0.77,GLASS,0,y,0,g),0.3);});});
def('baggebo',{n:'BAGGEBO shelf unit',cat:'shelf',w:60,d:25,h:116,col:[['Metal, white',0xf2f1ec]]},function(g,c){
  const f=c.h; [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){cyl(0.008,1.16,f,q[0]*0.115,0.58,q[1]*0.29,g,8);});
  [0.03,0.4,0.77,1.14].forEach(function(y){box(0.24,0.008,0.58,f,0,y,0,g); box(0.008,0.03,0.58,f,0.12,y+0.011,0,g); box(0.008,0.03,0.58,f,-0.12,y+0.011,0,g);});});
def('hyllis',{n:'HYLLIS shelf unit',cat:'shelf',w:60,d:27,h:140,col:[['Galvanised',GALV]]},function(g,c){
  const f=c.h; [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){box(0.03,1.4,0.025,f,q[0]*0.12,0.7,q[1]*0.2875,g);});
  [0.1,0.5,0.9,1.36].forEach(function(y){box(0.27,0.015,0.6,f,0,y,0,g); box(0.012,0.04,0.6,f,0.129,y+0.012,0,g);});
  [-1,1].forEach(function(e){const b=box(0.004,1.4,0.018,f,-0.127,0.7,0,g); b.rotation.x=e*0.38;});});
def('bror',{n:'BROR shelving unit',cat:'shelf',w:85,d:40,h:190,col:[['Black',0x262626,0x262626],['Black, pine plywood shelves',0x262626,grain(0xd8b47e)]]},function(g,c){
  const f=c.h; [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){box(0.035,1.9,0.035,f,q[0]*0.1825,0.95,q[1]*0.4075,g);});
  [0.08,0.6,1.12,1.6].forEach(function(y){box(0.4,0.03,0.85,c.h2,0,y,0,g); box(0.02,0.05,0.85,f,0.19,y-0.01,0,g);});});
let wireT=null;
function wireTex(){if(!wireT){wireT=A.canvasTex(64,64,function(q){q.clearRect(0,0,64,64); q.fillStyle='#ffffff'; for(let i=0;i<64;i+=16) q.fillRect(i,0,3,64); q.fillRect(0,0,64,3);}); wireT.wrapS=wireT.wrapT=THREE.RepeatWrapping; wireT.repeat.set(6,2);} return wireT;}
def('omar',{n:'OMAR shelving unit',cat:'shelf',w:92,d:36,h:181,col:[['Galvanised',GALV]]},function(g,c){
  const f=c.h, wm=A.reg(new THREE.MeshLambertMaterial({map:wireTex(),alphaTest:0.5,side:THREE.DoubleSide,color:f}));
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){cyl(0.013,1.81,f,q[0]*0.165,0.905,q[1]*0.445,g,10);});
  [0.12,0.52,0.92,1.32,1.72].forEach(function(y){const m=new THREE.Mesh(new THREE.PlaneGeometry(0.88,0.33),wm); m.rotation.x=-R/2; m.position.set(0,y,0); m.rotation.z=R/2; g.add(m);
    [-1,1].forEach(function(e){box(0.012,0.03,0.9,f,e*0.165,y,0,g); box(0.33,0.012,0.012,f,0,y,e*0.445,g);});});});
def('fjalkinge',{n:'FJÄLKINGE shelving unit',cat:'shelf',w:118,d:35,h:193,col:[['White',0xf2f1ec]]},function(g,c){
  const f=c.h; [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){box(0.025,1.93,0.025,f,q[0]*0.1625,0.965,q[1]*0.5775,g);});
  [-1,1].forEach(function(e){[0.3,1.6].forEach(function(y){box(0.3,0.02,0.015,f,0,y,e*0.5775,g);}); const b=box(0.004,1.95,0.012,f,-0.168,0.965,0,g); b.rotation.x=e*0.56;});
  [0.08,0.5,0.92,1.34,1.76].forEach(function(y){box(0.35,0.02,1.13,f,0,y,0,g); box(0.012,0.04,1.13,f,0.169,y-0.01,0,g);});});
def('vittsjoShelf',{n:'VITTSJÖ shelving unit',cat:'shelf',w:100,d:36,h:175,col:[['Black-brown, glass',0x2e2a28],['White, glass',0xf2f1ec]],note:'Glass shelves, and one fibreboard shelf at desk height for a laptop.'},function(g,c){
  const f=c.h; [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){box(0.018,1.75,0.018,f,q[0]*0.171,0.875,q[1]*0.491,g);});
  [-1,1].forEach(function(e){const b=box(0.004,1.75,0.01,f,-0.172,0.875,0,g); b.rotation.x=e*0.51;});
  [0.05,0.45,1.12,1.45,1.74].forEach(function(y){[-1,1].forEach(function(e){box(0.018,0.018,1.0,f,e*0.171,y,0,g);}); glass(box(0.33,0.006,0.97,GLASS,0,y+0.012,0,g),0.3);});
  box(0.36,0.02,1.0,f,0,0.76,0,g);});
def('gersby',{n:'GERSBY bookcase',cat:'shelf',w:60,d:24,h:180,col:[['White',0xf2f1ec]]},function(g,c){
  const f=c.h, t=0.016; [-1,1].forEach(function(e){box(0.24,1.8,t,f,0,0.9,e*(0.3-t/2),g);}); box(0.24,t,0.6-2*t,f,0,1.8-t/2,0,g); box(0.012,0.06,0.6-2*t,f,0.1,0.03,0,g);
  box(0.004,1.78,0.58,sh(f,0.93),-0.118,0.9,0,g); [0.06,0.4,0.75,1.1,1.45].forEach(function(y){box(0.23,t,0.6-2*t,f,0,y+t/2,0,g);});});
def('brimnesCab',{n:'BRIMNES cabinet with glass doors',q:'BRIMNES cabinet with doors',cat:'shelf',w:78,d:41,h:95,col:[['Glass, white',0xf2f1ec],['Glass, black',0x262626]]},function(g,c){
  const f=c.h; box(0.39,0.025,0.78,f,0,0.9375,0,g); box(0.39,0.06,0.74,f,-0.005,0.03,0,g); [-1,1].forEach(function(e){box(0.39,0.9,0.02,f,0,0.475,e*0.38,g);});
  box(0.008,0.86,0.74,sh(f,0.93),-0.191,0.49,0,g); box(0.38,0.02,0.74,f,0,0.07,0,g);
  [-1,1].forEach(function(e){glassDoor(g,f,0.195,0.07,0.92,e*0.19,0.378,-e,null); box(0.012,0.1,0.012,f,0.212,0.5,e*0.03,g);});
  [0.36,0.64].forEach(function(y){glass(box(0.36,0.006,0.72,GLASS,0,y,0,g),0.3);});});
def('lackWallUnit',{n:'LACK wall shelf unit',q:'LACK wall shelf unit 30x190',cat:'shelf',place:'wall',y:0.35,w:30,d:28,h:190,col:[['White',0xf2f1ec],['Black-blue',0x283040]].concat(wood([['Black-brown',0x3a312c],['White stained oak effect',0xdad0be]])),
  note:'Hangs on the wall, standing up or lying down.'},function(g,c){
  const f=c.h; [-1,1].forEach(function(e){box(0.28,1.9,0.03,f,0,0.95,e*0.135,g);}); for(let i=0;i<=4;i++) box(0.28,0.03,0.24,f,0,0.015+i*(1.87/4),0,g);});

/* ======================= LAMPS ======================= */
function lampDef(k,meta,build){return def(k,Object.assign({cat:'lamp',role:'metal'},meta),build);}
/* a cone shade in its own group at (x,y), its mouth pointing down and forward by tip */
function cone(g,ch,col,x,y,r,h,tip,gain){const s=G(g); s.position.set(x,y,0); s.rotation.z=tip; cyl(r,h,col,0,0,0,s,24,r*0.35); cyl(r*0.94,0.01,A.lampMat(ch,0xf4eedf,0xffe2b0,gain||1),0,-h/2+0.004,0,s,24); return s;}
lampDef('ranarpF',{n:'RANARP floor/reading lamp',q:'RANARP floor lamp',w:28,d:52,h:153,col:[['Off-white',0xe9e4d6],['Black',0x262626]]},function(g,c,o){
  const f=c.h; cyl(0.14,0.03,f,0,0.015,0,g,28); cyl(0.012,1.27,f,0,0.665,0,g,8); cyl(0.022,0.05,STEEL,0,1.3,0,g,12);
  rod(g,[0,1.31,0],[0.24,1.45,0],0.011,f); cyl(0.018,0.04,STEEL,0.24,1.45,0,g,10).rotation.x=R/2;
  cone(g,o.ch,f,0.3,1.42,0.095,0.17,0.75); A.pool(o.ch,0xffc47a,0.5,0.03,0,0.9,g,0.55);});
lampDef('ranarpW',{n:'RANARP work lamp',q:'RANARP work lamp',place:'top',w:19,d:36,h:42,col:[['Off-white',0xe9e4d6],['Black',0x262626]]},function(g,c,o){
  const f=c.h; cyl(0.075,0.025,f,-0.06,0.0125,0,g,22); cyl(0.009,0.24,f,-0.06,0.145,0,g,8); cyl(0.016,0.035,STEEL,-0.06,0.27,0,g,10);
  rod(g,[-0.06,0.28,0],[0.06,0.34,0],0.008,f); cone(g,o.ch,f,0.1,0.33,0.075,0.13,0.85); A.pool(o.ch,0xffc47a,0.16,0.012,0,0.38,g,0.55);});
lampDef('skurupF',{n:'SKURUP floor/reading lamp',q:'SKURUP floor lamp',w:28,d:42,h:170,col:[['Black',0x262626]]},function(g,c,o){
  const f=c.h; cyl(0.14,0.025,f,0,0.0125,0,g,28); cyl(0.011,1.58,f,0,0.815,0,g,8); torus(0.12,0.01,f,0.12,1.6,0,g,R);
  cyl(0.06,0.13,f,0.24,1.54,0,g,20); cyl(0.056,0.01,A.lampMat(o.ch,0xf4eedf,0xffe2b0,1),0.24,1.476,0,g,20); A.pool(o.ch,0xffc47a,0.24,0.03,0,0.8,g,0.55);});
lampDef('hektogram',{n:'HEKTOGRAM floor uplighter/reading lamp',q:'HEKTOGRAM floor uplighter',w:24,d:42,h:176,col:[['Silver-colour, white',0xc9cdd0,0xf2f2ee]]},function(g,c,o){
  const f=c.h; cyl(0.12,0.025,f,0,0.0125,0,g,28); cyl(0.013,1.66,f,0,0.855,0,g,8);
  cyl(0.05,0.08,c.h2,0,1.72,0,g,26,0.11); cyl(0.104,0.008,A.lampMat(o.ch,0xf4f1e8,0xffe7bb,0.8),0,1.758,0,g,26);
  rod(g,[0,1.2,0],[0.16,1.3,0],0.008,f); rod(g,[0.16,1.3,0],[0.26,1.27,0],0.008,f); cone(g,o.ch,c.h2,0.27,1.24,0.04,0.08,0.7);
  A.pool(o.ch,0xffd9a0,0,H-0.02,0,1.4,g,0.35); A.pool(o.ch,0xffc47a,0,0.03,0,1.1,g,0.25); A.pool(o.ch,0xffc47a,0.35,0.03,0,0.55,g,0.4);});
lampDef('holmo',{n:'HOLMÖ floor lamp',w:23,d:23,h:117,col:[['Rice paper',0xf3eee2]]},function(g,c,o){
  cyl(0.09,0.02,0xeeeeea,0,0.01,0,g,22); cyl(0.115,1.1,A.lampMat(o.ch,c.h,0xffdca6,0.85),0,0.62,0,g,26);
  [0.25,0.55,0.85].forEach(function(y){torus(0.116,0.003,sh(c.h,0.9),0,y,0,g).rotation.x=R/2;}); A.pool(o.ch,0xffc47a,0,0.03,0,1.0,g,0.5);});
function half(r,thS,thL,phS){return new THREE.SphereGeometry(r,20,10,phS,R,thS,thL);}
lampDef('blasverk',{n:'BLÅSVERK table lamp',place:'top',w:19,d:19,h:36,col:[['Beige',0xcdb99a],['Yellow',0xe0b93a],['Blue',0x5b7fa6],['Red',0xb5402f]],note:'Half white and half colour, so it glows two-tone.'},function(g,c,o){
  const f=c.h, wm=A.lampMat(o.ch,0xf4f1e8,0xffe2b0,0.9), cm=A.lampMat(o.ch,f,sh(f,1.6),0.6);
  mesh(half(0.08,0,R/2,0),f,0,0,0,g).scale.y=0.6; mesh(half(0.08,0,R/2,R),0xf4f1e8,0,0,0,g).scale.y=0.6; cyl(0.011,0.13,f,0,0.11,0,g,10);
  mesh(half(0.095,0,R,0),cm,0,0.265,0,g); mesh(half(0.095,0,R,R),wm,0,0.265,0,g); A.pool(o.ch,0xffc47a,0,0.012,0,0.5,g,0.5);});
lampDef('tokabo',{n:'TOKABO table lamp',place:'top',w:13,d:13,h:15,col:[['Glass opal white',0xf2efe6]]},function(g,c,o){
  cyl(0.04,0.05,0xf4f4f0,0,0.025,0,g,18,0.035); mesh(half(0.065,0,R/2,0),A.lampMat(o.ch,c.h,0xffdca6,0.9),0,0.085,0,g); mesh(half(0.065,0,R/2,R),A.lampMat(o.ch,c.h,0xffdca6,0.9),0,0.085,0,g);
  cyl(0.064,0.035,A.lampMat(o.ch,c.h,0xffdca6,0.9),0,0.0675,0,g,24,0.065); A.pool(o.ch,0xffc47a,0,0.012,0,0.32,g,0.5);});
lampDef('tertial',{n:'TERTIAL work lamp',place:'top',w:17,d:46,h:47,col:[['Dark grey',0x4a4c4f],['White',0xf2f2ee],['Light blue',0xa9c6d8]],note:'Comes with a clamp for a desk or shelf edge.'},function(g,c,o){
  const f=c.h; box(0.06,0.05,0.05,f,-0.12,0.025,0,g); cyl(0.012,0.06,f,-0.12,0.08,0,g,8);
  [-0.012,0.012].forEach(function(z){rod(g,[-0.12,0.1,z],[-0.06,0.46,z],0.005,f,6); rod(g,[-0.06,0.46,z],[0.2,0.42,z],0.005,f,6);});
  rod(g,[-0.1,0.12,0.02],[-0.05,0.4,0.02],0.003,STEEL,5); cyl(0.015,0.03,f,-0.06,0.46,0,g,10).rotation.x=R/2;
  cone(g,o.ch,f,0.23,0.4,0.085,0.15,0.6); A.pool(o.ch,0xffd08a,0.3,0.012,0,0.45,g,0.55);});
lampDef('solklint',{n:'SOLKLINT table lamp',place:'top',w:16,d:16,h:28,col:[['Brass, grey clear glass',BRASS]]},function(g,c,o){
  cyl(0.07,0.02,c.h,0,0.01,0,g,24); cyl(0.012,0.1,c.h,0,0.07,0,g,10); cyl(0.03,0.02,c.h,0,0.125,0,g,14);
  glass(sph(0.08,0x8d8f8c,0,0.2,0,g),0.45); sph(0.03,A.lampMat(o.ch,0xd9d2c2,0xffd9a0,1.2),0,0.2,0,g); A.pool(o.ch,0xffc47a,0,0.012,0,0.45,g,0.5);});
/* pendants: origin on the floor, the canopy at the ceiling */
function cord(g,y){cyl(0.004,H-y,0x2a2a2a,0,(H+y)/2,0,g,5); cyl(0.05,0.025,0xf2f2ee,0,H-0.0125,0,g,18);}
function outward(m,d){m.quaternion.setFromUnitVectors(UP,d); return m;}
lampDef('ps2014',{n:'IKEA PS 2014 pendant lamp',q:'IKEA PS 2014 pendant',place:'ceil',w:35,d:35,h:80,col:[['White',0xf4f4f0,0xf4f4f0],['White, copper-colour',0xf4f4f0,0xc27c50]],note:'Pull the strings to open and close the blades.'},function(g,c,o){
  const y=H-0.62; cord(g,y+0.17); sph(0.07,A.lampMat(o.ch,0xf4eedf,0xffdca6,1.2),0,y,0,g); const bm=A.lampMat(o.ch,c.h,0xffe7c4,0.35), im=A.M(c.h2), v=new THREE.Vector3();
  const ev=new THREE.Vector3(), zv=new THREE.Vector3(), q=new THREE.Quaternion(), m4=new THREE.Matrix4();
  for(let i=0;i<5;i++){const th=(i+0.5)/5*R, n=i===0||i===4?5:8; for(let j=0;j<n;j++){const ph=j/n*R*2+(i%2)*R/n;
    v.set(Math.sin(th)*Math.cos(ph),Math.cos(th),Math.sin(th)*Math.sin(ph)); ev.set(-Math.sin(ph),0,Math.cos(ph)); zv.crossVectors(ev,v); q.setFromRotationMatrix(m4.makeBasis(ev,v,zv));
    const w=2*R*0.15*Math.sin(th)/n*0.9, hh=R*0.15/5*0.9;
    [[bm,0.155,1],[im,0.15,0.8]].forEach(function(t){const b=mesh(new THREE.BoxGeometry(w*t[2],0.004,hh*t[2]),t[0],v.x*t[1],y+v.y*t[1],v.z*t[1],g); b.quaternion.copy(q); b.rotateX((j%2?1:-1)*0.3);});}}
  A.pool(o.ch,0xffc47a,0,0.032,0,1.5,g,0.42);});
lampDef('vindkast',{n:'VINDKAST pendant lamp',q:'VINDKAST pendant',place:'ceil',w:50,d:50,h:72,col:[['White',0xf6f4ef]],note:'A soft cloud of recycled polyester.'},function(g,c,o){
  const y=H-0.56, m=A.lampMat(o.ch,c.h,0xffe2b8,0.6), r=A.rng(7); cord(g,y+0.1);
  sph(0.15,m,0,y,0,g,1.2,0.8,1.2);
  for(let i=0;i<11;i++){const a=i/11*R*2+r()*0.3, d=0.11+r()*0.05; sph(0.07+r()*0.04,m,Math.cos(a)*d,y+(r()-0.5)*0.1,Math.sin(a)*d,g,1,0.85,1);}
  A.pool(o.ch,0xffc47a,0,0.032,0,1.5,g,0.38);});
skin([['Bamboo',0xc7a46e]],RAT);
lampDef('knixhult',{n:'KNIXHULT pendant lamp',q:'KNIXHULT pendant lamp',place:'ceil',w:40,d:40,h:80,col:[['Bamboo, handmade',0xc7a46e]]},function(g,c,o){
  const y=H-0.54; cord(g,y+0.2); sph(0.2,A.lampMat(o.ch,c.h,0xffc36e,0.8),0,y-0.01,0,g,1,1.32,1);
  [-0.12,0,0.12].forEach(function(dy){const rr=0.2*Math.sqrt(1-Math.pow(dy/0.265,2)); torus(rr,0.006,sh(c.h,0.8),0,y-0.01+dy,0,g).rotation.x=R/2;});
  A.pool(o.ch,0xffc47a,0,0.032,0,1.4,g,0.4);});
lampDef('maskros',{n:'MASKROS pendant lamp',q:'MASKROS pendant',place:'ceil',w:55,d:55,h:90,col:[['White',0xf4f4f0]],note:'A dandelion clock that throws a pattern on the ceiling.'},function(g,c,o){
  const y=H-0.62; cord(g,y+0.06); sph(0.05,A.lampMat(o.ch,0xf4eedf,0xffdca6,1.3),0,y,0,g); const pm=A.lampMat(o.ch,c.h,0xffe7c4,0.3), v=new THREE.Vector3(), N=46;
  for(let i=0;i<N;i++){const yy=1-(i+0.5)/N*2; if(yy>0.86) continue; const rr=Math.sqrt(1-yy*yy), a=i*2.39996; v.set(Math.cos(a)*rr,yy,Math.sin(a)*rr);
    outward(cyl(0.006,0.17,0xd9d6cc,v.x*0.13,y+v.y*0.13,v.z*0.13,g,4),v); outward(mesh(new THREE.CylinderGeometry(0.085,0.085,0.003,12),pm,v.x*0.22,y+v.y*0.22,v.z*0.22,g),v);}
  A.pool(o.ch,0xffd9a0,0,H-0.02,0,1.3,g,0.25); A.pool(o.ch,0xffc47a,0,0.032,0,1.5,g,0.38);});

/* ======================= PLANTS ======================= */
function plantDef(k,meta,build){return def(k,Object.assign({cat:'plant',role:'pot',col:C.pot},meta),build);}
plantDef('eucalyptus',{n:'FEJKA eucalyptus, artificial',q:'FEJKA artificial potted plant eucalyptus',place:'top',w:37,d:37,h:42},function(g,c,o){
  const p=K.dec(g,'plant'), r=A.rng(o.cfg.seed||17); K.pot(p,0,0,0.065,0.11,c.h); const f=K.foliage(p);
  for(let s=0;s<9;s++){const a=s/9*6.283+r(), t=0.1+r()*0.4, L=0.22+r()*0.1; let px=Math.sin(a)*0.02, py=0.1, pz=Math.cos(a)*0.02;
    for(let j=0;j<5;j++){const tt=t+j*0.08, seg=L/5; f.at(px,py,pz,a,tt).stem(0.004,seg);
      const nx=px+Math.sin(a)*Math.sin(tt)*seg, ny=py+Math.cos(tt)*seg, nz=pz+Math.cos(a)*Math.sin(tt)*seg;
      [-1,1].forEach(function(e){f.at(nx,ny,nz,a+e*1.4+j*0.4,1.2,0).leaf(0.046,0.05,'oval',0.1);}); px=nx; py=ny; pz=nz;}}
  tint(f.done(),0xa9bfc0,0x121c1c);});
plantDef('pilea',{n:'Chinese money plant (PILEA)',q:'PILEA PEPEROMIOIDES potted plant',place:'top',w:20,d:20,h:24},function(g,c,o){
  const p=K.dec(g,'plant'), r=A.rng(o.cfg.seed||23); K.pot(p,0,0,0.06,0.09,c.h); const f=K.foliage(p);
  f.at(0,0.08,0,0,0).stem(0.008,0.09);
  for(let i=0;i<17;i++){const a=i*2.4, y=0.09+r()*0.08, t=0.6+r()*0.6, L=0.04+r()*0.05, ex=Math.sin(a)*Math.sin(t)*L, ey=y+Math.cos(t)*L, ez=Math.cos(a)*Math.sin(t)*L, lt=1.2+r()*0.3, w=0.045+r()*0.02;
    f.at(0,y,0,a,t).stem(0.003,L); f.at(ex-Math.sin(a)*Math.sin(lt)*w/2,ey-Math.cos(lt)*w/2,ez-Math.cos(a)*Math.sin(lt)*w/2,a,lt).leaf(w,w,'oval',0.05);}
  tint(f.done(),0xd2e6b4);});
plantDef('zzPlant',{n:'ZZ plant',q:'ZAMIOCULCAS potted plant',w:57,d:57,h:73},function(g,c,o){
  const p=K.dec(g,'plant'), r=A.rng(o.cfg.seed||29); K.pot(p,0,0,0.12,0.22,c.h); const f=K.foliage(p);
  for(let s=0;s<9;s++){const a=s/9*6.283+r()*0.4, t=0.15+r()*0.45, L=0.33+r()*0.2, x0=Math.sin(a)*0.03, z0=Math.cos(a)*0.03, y0=0.2;
    f.at(x0,y0,z0,a,t).stem(0.014,L);
    for(let j=1;j<=6;j++){const u=0.25+0.75*j/6, px=x0+Math.sin(a)*Math.sin(t)*L*u, py=y0+Math.cos(t)*L*u, pz=z0+Math.cos(a)*Math.sin(t)*L*u;
      [-1,1].forEach(function(e){f.at(px,py,pz,a+e*1.2,t+0.75,e*0.2).leaf(0.055,0.11*(1.15-u*0.35),'oval',0.15);});}
    f.at(x0+Math.sin(a)*Math.sin(t)*L,y0+Math.cos(t)*L,z0+Math.cos(a)*Math.sin(t)*L,a,t+0.2).leaf(0.05,0.1,'oval',0.1);}
  tint(f.done(),0x93b496);});
plantDef('rubberPlant',{n:'Rubber plant (FICUS ELASTICA)',q:'FICUS ELASTICA potted plant',w:70,d:70,h:125},function(g,c,o){
  const p=K.dec(g,'plant'), r=A.rng(o.cfg.seed||37); K.pot(p,0,0,0.15,0.26,c.h); const f=K.foliage(p);
  [[0,0,0.88,0,0],[0.04,0.03,0.66,0.12,1.2],[-0.04,-0.02,0.48,0.16,3.6]].forEach(function(q){const a=q[4], t=q[3], L=q[2];
    f.at(q[0],0.24,q[1],a,t).stem(0.016,L);
    for(let j=0;j<10;j++){const u=0.3+0.7*j/9, px=q[0]+Math.sin(a)*Math.sin(t)*L*u, py=0.24+Math.cos(t)*L*u, pz=q[1]+Math.cos(a)*Math.sin(t)*L*u;
      f.at(px,py,pz,j*2.4+r(),0.8+r()*0.6,(r()-0.5)*0.3).leaf(0.15+r()*0.03,0.24+r()*0.05,'oval',0.25);}
    f.at(q[0]+Math.sin(a)*Math.sin(t)*L,0.24+Math.cos(t)*L,q[1]+Math.cos(a)*Math.sin(t)*L,a,0.1).leaf(0.03,0.1,'oval',0);});
  tint(f.done(),0x6f8f72);});
plantDef('strelitzia',{n:'Bird of paradise (STRELITZIA)',q:'STRELITZIA potted plant',w:100,d:100,h:157},function(g,c,o){
  const p=K.dec(g,'plant'), r=A.rng(o.cfg.seed||43); K.pot(p,0,0,0.17,0.32,c.h); const f=K.foliage(p);
  for(let s=0;s<9;s++){const a=s/9*6.283+r()*0.5, t=0.06+r()*0.22, L=0.42+r()*0.32, x0=Math.sin(a)*0.04, z0=Math.cos(a)*0.04;
    f.at(x0,0.3,z0,a,t).stem(0.014,L);
    const ex=x0+Math.sin(a)*Math.sin(t)*L, ey=0.3+Math.cos(t)*L, ez=z0+Math.cos(a)*Math.sin(t)*L;
    f.at(ex,ey,ez,a+(r()-0.5)*0.4,t+0.05+r()*0.2,(r()-0.5)*0.3).leaf(0.21+r()*0.06,0.5+r()*0.15,'oval',0.22);}
  tint(f.done(),0x9cb49a);});
let laceT=null;
function laceTex(){return laceT||(laceT=A.canvasTex(128,64,function(q,w,h){q.fillStyle='#fff'; q.fillRect(0,0,w,h); q.globalCompositeOperation='destination-out';
  for(let y=12,k=0;y<h-4;y+=13,k++) for(let x=k%2?8:0;x<w+8;x+=16){q.beginPath(); q.ellipse(x,y,5,4.5,0,0,7); q.fill(); q.beginPath(); q.arc(x+8,y+6,1.6,0,7); q.fill();}
  for(let x=0;x<w;x+=16){q.beginPath(); q.arc(x+8,0,6,0,R); q.fill();}}));}
function laceMat(col){return A.reg(new THREE.MeshLambertMaterial({map:laceTex(),alphaTest:0.5,side:THREE.DoubleSide,color:col}));}
plantDef('spiderHang',{n:'Spider plant in a SKURAR hanging planter',q:'SKURAR hanging planter',place:'ceil',w:82,d:82,h:103,col:[['Off-white',0xf2efe6]]},function(g,c,o){
  const p=K.dec(g,'hanging'), y=H-0.72, r=A.rng(o.cfg.seed||47), rr=0.1;
  [0,2.09,4.19].forEach(function(a){rod(p,[0,H-0.02,0],[Math.cos(a)*rr,y+0.15,Math.sin(a)*rr],0.0025,0xd9d6cc,4);}); cyl(0.012,0.02,0xd9d6cc,0,H-0.01,0,p,8);
  mesh(new THREE.CylinderGeometry(rr,rr*0.8,0.15,28,1,true),laceMat(c.h),0,y+0.075,0,p); cyl(rr*0.8,0.006,c.h,0,y+0.003,0,p,24); cyl(rr*0.75,0.12,0xe6ddcd,0,y+0.07,0,p,20,rr*0.93);
  const f=K.foliage(p);
  for(let i=0;i<28;i++){const a=i*2.4+r()*0.3; f.at(Math.sin(a)*0.04,y+0.13,Math.cos(a)*0.04,a,0.3+r()*1.3,(r()-0.5)*0.4).leaf(0.022,0.24+r()*0.14,'blade',0.7);}
  for(let s=0;s<4;s++){const a=s*1.57+0.6, L=0.22+r()*0.15, ox=Math.sin(a)*(rr+0.02), oz=Math.cos(a)*(rr+0.02); f.at(ox,y+0.1-L,oz,a,0).stem(0.004,L);
    for(let i=0;i<6;i++) f.at(ox,y+0.1-L,oz,i*1.05,1.0+r()*0.6).leaf(0.015,0.08,'blade',0.5);}
  f.done();});

/* ======================= DECOR ======================= */
function decorDef(k,meta,build){return def(k,Object.assign({cat:'decor',place:'top',role:'accent2'},meta),build);}
decorDef('viljestark',{n:'VILJESTARK vase',q:'VILJESTARK vase',w:10,d:10,h:17,col:[['Clear glass',0xcfe0e3]]},function(g,c){const p=K.dec(g,'vase');
  glass(sph(0.05,c.h,0,0.05,0,p,1,1,1),0.45); glass(cyl(0.018,0.1,c.h,0,0.12,0,p,14,0.022),0.45); glass(torus(0.022,0.004,c.h,0,0.168,0,p),0.5).rotation.x=R/2;
});
decorDef('gradvis',{n:'GRADVIS vase',q:'GRADVIS vase',w:17,d:17,h:21,col:[['Pink',0xd9a9a0],['Grey',0x9a9a96]]},function(g,c){const p=K.dec(g,'vase'), f=c.h;
  sph(0.085,f,0,0.09,0,p,1,0.95,1); cyl(0.03,0.04,f,0,0.01,0,p,16,0.04); cyl(0.032,0.05,f,0,0.185,0,p,16,0.026);
  for(let i=0;i<6;i++){const t=torus(0.0855,0.003,sh(f,0.85),0,0.09,0,p); t.rotation.y=i*R/6; t.scale.y=0.95;}});
decorDef('sinnlig',{n:'SINNLIG scented candle in glass',q:'SINNLIG scented candle in glass',w:8,d:8,h:8,col:[['Sweet vanilla, natural',0xf3ebdc],['Red garden berries, red',0xb3312c]]},function(g,c){
  const p=K.dec(g,'candle'); glass(mesh(new THREE.CylinderGeometry(0.04,0.04,0.075,24,1,true),GLASS,0,0.0375,0,p),0.4); glass(cyl(0.04,0.004,GLASS,0,0.002,0,p,24),0.4); cyl(0.036,0.05,c.h,0,0.029,0,p,18);
  cyl(0.0015,0.012,0x2a2a2a,0,0.06,0,p,4); sph(0.006,A.lampMat('candle',0x4a3a2a,0xffa53c,1.4),0,0.071,0,p,1,1.9,1); A.pool('candle',0xffb45e,0,0.006,0,0.3,p,0.5);});
let clockT=null;
decorDef('klockis',{n:'KLOCKIS clock/thermometer/alarm/timer',q:'KLOCKIS',w:7,d:3,h:7,col:[['White',0xf2f1ec]],note:'Turn it onto another side for the alarm, temperature or timer.'},function(g,c){
  rbox(0.03,0.07,0.07,c.h,0,0.035,0,g,0.008,0.01);
  clockT=clockT||A.canvasTex(64,48,function(q){q.fillStyle='#1d2124'; q.fillRect(0,0,64,48); q.fillStyle='#e9f1ee'; q.font='bold 20px sans-serif'; q.textAlign='center'; q.fillText('08:15',32,31);});
  const m=new THREE.Mesh(new THREE.PlaneGeometry(0.052,0.038),A.MT(clockT)); m.position.set(0.0155,0.037,0); m.rotation.y=R/2; g.add(m);});
decorDef('skurar',{n:'SKURAR candle holder',q:'SKURAR candle holder',w:10,d:10,h:10,col:[['White',0xf4f3ee]]},function(g,c){
  const p=K.dec(g,'candle'); mesh(new THREE.CylinderGeometry(0.05,0.045,0.1,28,1,true),laceMat(c.h),0,0.05,0,p); cyl(0.045,0.004,c.h,0,0.002,0,p,24);
  cyl(0.02,0.015,0xf3ebdc,0,0.0115,0,p,14); sph(0.007,A.lampMat('candle',0x4a3a2a,0xffa53c,1.4),0,0.028,0,p,1,1.9,1); A.pool('candle',0xffb45e,0,0.006,0,0.35,p,0.5);});

/* ======================= ON THE WALL ======================= */
function wallDef(k,meta,build){return def(k,Object.assign({cat:'wall',place:'wall'},meta),build);}
wallDef('lindbyn',{n:'LINDBYN mirror Ø80',q:'LINDBYN mirror',y:1.1,w:82,d:2,h:82,col:[['Black',0x262626]]},function(g,c){
  torus(0.398,0.012,c.h,0,0.41,0,g).rotation.y=R/2; cyl(0.395,0.006,0xcfdadd,-0.002,0.41,0,g,56).rotation.z=R/2;});
const landT={};
function landTex(seed){return landT[seed]||(landT[seed]=A.canvasTex(300,200,function(q,w,h){
  const r=A.rng(seed), P=K.PAL, cs=[P.green,P.sage,P.blue,P.oak,P.sky,P.ink]; q.fillStyle=P.cream; q.fillRect(0,0,w,h);
  q.fillStyle=cs[seed%6]; q.beginPath(); q.arc(70+r()*160,60,26,0,7); q.fill();
  for(let i=0;i<4;i++){q.fillStyle=cs[(seed+i+1)%6]; q.beginPath(); q.moveTo(0,h); q.lineTo(0,110+i*20); q.bezierCurveTo(80,70+i*24+r()*30,180,150+i*12-r()*30,w,95+i*24); q.lineTo(w,h); q.fill();}}));}
wallDef('bjorksta',{n:'BJÖRKSTA picture with frame 118 × 78',q:'BJÖRKSTA picture with frame',y:1.05,w:118,d:3,h:78,col:[['Aluminium-colour',0xb9bdc0],['Black',0x222222]]},function(g,c,o){
  box(0.025,0.78,1.18,c.h,0,0.39,0,g); const m=new THREE.Mesh(new THREE.PlaneGeometry(1.15,0.75),A.MT(landTex(o.cfg.seed||3),null,true)); m.position.set(0.0135,0.39,0); m.rotation.y=R/2; g.add(m);});
wallDef('knoppang',{n:'KNOPPÄNG frames with posters, set of 2',q:'KNOPPÄNG frame with poster',y:1.3,w:90,d:2,h:53,col:[['Black',0x222222],['White',0xf4f4f0]]},function(g,c,o){
  [-1,1].forEach(function(e,i){box(0.02,0.53,0.43,c.h,0,0.265,e*0.235,g); const m=new THREE.Mesh(new THREE.PlaneGeometry(0.39,0.49),A.MT(K.artTex((o.cfg.seed||11)+i),null,true)); m.position.set(0.0105,0.265,e*0.235); m.rotation.y=R/2; g.add(m);});});
function bracket(g,x,z,h,dd,col){box(0.018,h,0.02,col,x,h/2,z,g); box(dd,0.018,0.02,col,x+dd/2-0.009,h-0.009,z,g); rod(g,[x+0.005,0.02,z],[x+dd*0.8,h-0.015,z],0.006,col,6);}
wallDef('bergshult',{n:'BERGSHULT / RAMSHULT wall shelf 80 × 30',q:'BERGSHULT shelf',y:1.3,w:80,d:30,h:25,col:[['White',0xf2f1ec]].concat(wood([['Brown-black',0x3a2e28],['Grey-beige',0xb7ad9e]]))},function(g,c){
  [-0.26,0.26].forEach(function(z){bracket(g,-0.141,z,0.22,0.18,0xf2f1ec);}); box(0.3,0.025,0.8,c.h,0,0.2325,0,g);});
wallDef('burhult',{n:'BURHULT / SIBBHULT wall shelf 59 × 20',q:'BURHULT shelf',y:1.4,w:59,d:20,h:14,col:[['White, white brackets',0xf2f1ec,0xf2f1ec],['White, aspen brackets',0xf2f1ec,grain(0xd9c4a0)]]},function(g,c){
  [-0.2,0.2].forEach(function(z){bracket(g,-0.091,z,0.125,0.14,c.h2);}); box(0.2,0.015,0.59,c.h,0,0.1325,0,g);});

/* ======================= RUGS ======================= */
function rugDef(k,meta,build){return def(k,Object.assign({cat:'rug',flat:true,lh:0.25},meta),build);}
rugDef('langsted',{n:'LANGSTED rug, low pile',q:'LANGSTED rug 170x240',w:240,d:170,h:1,col:fab([['Beige',0xcdbfa3],['Light grey',0xc4c4c0],['Off-white',0xe9e4d8]])},function(g,c){
  box(1.7,0.012,2.4,c.h,0,0.006,0,g).castShadow=false; box(1.6,0.013,2.3,sh(c.h,1.04),0,0.0065,0,g).castShadow=false;});
rugDef('vindum',{n:'VINDUM rug, high pile',q:'VINDUM rug 170x230',w:230,d:170,h:3,col:[['White',0xeeebe4]].concat(fab([['Green',0x6e8a5e],['Blue-green',0x4f7b80],['Brown',0x6e5446]]))},function(g,c){
  A.rbox(1.7,0.03,2.3,c.h,0,0.015,0,g,0.012,0.08).castShadow=false;});
let s17=null;
rugDef('stockholm17',{n:'STOCKHOLM 2017 rug, flatwoven, striped',q:'STOCKHOLM 2017 rug',w:350,d:250,h:1,col:[['Grey striped',0xdedcd6]],note:'Handwoven in wool, and big enough for the whole sofa corner.'},function(g){
  s17=s17||A.canvasTex(256,384,function(q,w,h){q.fillStyle='#e9e6df'; q.fillRect(0,0,w,h); const r=A.rng(17); let y=0;
    while(y<h){const t=6+r()*26; q.fillStyle=['#8c8c88','#b5b3ad','#5f605e','#d2d0ca'][Math.floor(r()*4)]; q.fillRect(0,y,w,t); y+=t+8+r()*30;}
    q.fillStyle='rgba(255,255,255,.08)'; for(let i=0;i<900;i++) q.fillRect(r()*w,r()*h,2,1);});
  const top=A.MT(s17,null,true), side=A.M(0xb5b3ad), m=new THREE.Mesh(new THREE.BoxGeometry(2.5,0.012,3.5),[side,side,top,side,side,side]); m.position.y=0.006; m.receiveShadow=true; g.add(m);});
})();

/* =============================== BATHROOM, KITCHEN AND BAR, DINING, KIDS, BALCONY =============================== */
/* Haroe 10 — more of the catalogue: bathroom, kitchen and bar, dining tables and chairs, kids and balcony.
   Same rules as catalog.js: each piece faces +x with its back at -x, its width along z, its origin on the floor in the middle
   of its footprint (a wall piece: at its bottom). Sizes are catalogue sizes in cm; colours are the names IKEA sells them in. */
(function(){
'use strict';
const A=window.APP, M=A.more, def=M.def, K=A.kit, C=A.IKEA, box=A.box, rbox=A.rbox, cyl=A.cyl, sph=A.sph, torus=A.torus, G=A.G, R=Math.PI, sh=A.shade;
const WOOD=A.surfaces.wood, WEAVE=A.surfaces.weave, skin=M.skin, barXY=M.barXY, glass=M.glass, sqLegs=M.sqLegs;
const OAK=M.OAK, LINEN=M.LINEN, RATTAN=M.RATTAN, INK=M.INK, BLACK=M.BLACK, STEEL=M.STEEL, SAGE=M.SAGE, BLUE=M.BLUE;
const PAINT=0xf2f1ec, CER=0xf8f8f5, CHR=0xd0d4d6, MIR=0xcfdadd, SHEET=0xf6f5f1;
const BAMBOO=0xd2b07a, BIRCH=0xd9bf8c, PINE=0xe3c99d, BEECH=0xd6b383, ACACIA=0x6e4a32, ACACIA_L=0xa8784a, ACACIA_G=0x7d7366;
skin([['',BEECH],['',ACACIA],['',ACACIA_L],['',ACACIA_G]],WOOD); skin([['',0xd8cbb0],['',0x3d5a7a],['',0x6a6c6e]],WEAVE); skin([['',0xeceae6],['',0x48494b],['',0xe6e4df]],A.surfaces.stone);

/* ---------- small helpers ---------- */
const UP=new THREE.Vector3(0,1,0), V=new THREE.Vector3();
/* a round rod (or, with bar, a square one a × b) from one point to another */
function rod(g,x0,y0,z0,x1,y1,z1,r,col,seg,r1){V.set(x1-x0,y1-y0,z1-z0); const m=cyl(r,V.length(),col,(x0+x1)/2,(y0+y1)/2,(z0+z1)/2,g,seg||8,r1); m.quaternion.setFromUnitVectors(UP,V.normalize()); return m;}
function bar(g,x0,y0,z0,x1,y1,z1,a,b,col){V.set(x1-x0,y1-y0,z1-z0); const m=box(a,V.length(),b,col,(x0+x1)/2,(y0+y1)/2,(z0+z1)/2,g); m.quaternion.setFromUnitVectors(UP,V.normalize()); return m;}
/* four legs meeting the underside at (±dx, h, ±dz), splayed out by s at the floor; square when sq */
function legs4(g,dx,dz,h,s,r,col,sq){[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){const x0=q[0]*(dx+s), z0=q[1]*(dz+s);
  if(sq) bar(g,x0,0,z0,q[0]*dx,h,q[1]*dz,r,r,col); else rod(g,x0,0,z0,q[0]*dx,h,q[1]*dz,r,col,10);});}
/* a mesh placed the way A.box places its boxes; flat-shaded when flat */
function mesh(geo,col,x,y,z,g,flat){if(flat){geo=geo.toNonIndexed(); geo.computeVertexNormals();} const m=new THREE.Mesh(geo,A.M(col)); m.position.set(x,y,z); m.castShadow=m.receiveShadow=true; g.add(m); return m;}
/* a square leg (or a pyramid) that tapers from side s0 at y0 to s1 at y0+h, its sides square to x and z */
function taper(g,x,z,h,s0,s1,col,y0){return mesh(new THREE.CylinderGeometry(s1*0.7071,s0*0.7071,h,4,1,false,R/4),col,x,(y0||0)+h/2,z,g,true);}
/* n slats with their tops at y, spread across x0..x1 and running along z0..z1 (alongX: spread across z, running along x) */
function slats(g,col,x0,x1,z0,z1,y,n,t,alongX){t=t||0.02;
  for(let i=0;i<n;i++){if(alongX){const p=(z1-z0)/n; box(x1-x0,t,p*0.8,col,(x0+x1)/2,y-t/2,z0+p*(i+0.5),g);}
    else{const p=(x1-x0)/n; box(p*0.8,t,z1-z0,col,x0+p*(i+0.5),y-t/2,(z0+z1)/2,g);}}}
/* a door or drawer front on a face at x; inset: a shaded panel inside a frame */
function front(g,x,y,z,h,w,f,inset){box(0.018,h,w,sh(f,0.97),x+0.009,y,z,g); if(inset) box(0.004,h-0.11,w-0.11,sh(f,0.9),x+0.019,y,z,g);}
function knob(g,x,y,z,col){cyl(0.013,0.026,col||0xb08d4a,x+0.013,y,z,g,10).rotation.z=R/2;}
function pull(g,x,y,z,len,up,col){box(0.016,up?len:0.012,up?0.012:len,col||STEEL,x+0.008,y,z,g);}
function castor(g,x,z,r,col){cyl(r,0.018,col||INK,x,r,z,g,14).rotation.x=R/2; box(r*1.4,0.016,0.03,STEEL,x,2*r+0.006,z,g);}
/* a curved rail: an arc of a ring of radius r lying flat at (x,y,z), bulging toward -x over the angle a */
function arc(g,r,t,a,col,x,y,z,hs){const s=G(g); s.position.set(x,y,z); s.rotation.y=a/2+R; const m=torus(r,t,col,0,0,0,s,a); m.rotation.x=R/2; m.scale.z=hs||1; return s;}
/* a half tube (a tent, a hood) along z, its open side down, standing on y */
function halfTube(g,r,ry,len,mat,x,y,z,cap){
  const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,20,1,true,R/2,R),mat); m.geometry.rotateX(R/2); m.position.set(x,y,z); m.scale.y=ry/r; m.castShadow=true; g.add(m);
  if(cap!=null){const e=new THREE.Mesh(new THREE.CircleGeometry(r,20,0,R),mat); e.position.set(x,y,z+cap*len/2); e.scale.y=ry/r; g.add(e);}
  return m;}
function dbl(m){m.side=THREE.DoubleSide; return m;}
let mTex=null;
function mirrorTex(){return mTex||(mTex=A.canvasTex(64,128,function(q){const gr=q.createLinearGradient(0,0,64,128); gr.addColorStop(0,'#eef4f5'); gr.addColorStop(0.5,'#b9c8cd'); gr.addColorStop(1,'#d9e3e5');
  q.fillStyle=gr; q.fillRect(0,0,64,128); q.fillStyle='rgba(255,255,255,.45)'; q.beginPath(); q.moveTo(14,0); q.lineTo(34,0); q.lineTo(0,52); q.lineTo(0,22); q.fill();
  q.beginPath(); q.moveTo(44,0); q.lineTo(50,0); q.lineTo(0,80); q.lineTo(0,71); q.fill();}));}
/* a mirror facing +x, h × w, centred at (x,y,z); round (Ø h) when w is null */
function mirror(g,x,y,z,h,w){const m=new THREE.Mesh(w?new THREE.PlaneGeometry(w,h):new THREE.CircleGeometry(h/2,40),A.MT(mirrorTex(),null,true)); m.position.set(x,y,z); m.rotation.y=R/2; g.add(m); return m;}

/* ======================= BATHROOM ======================= */
/* a single-lever mixer standing on (x,y,z), its spout toward +x */
function tap(g,x,y,z,h,col){col=col||CHR;
  cyl(0.024,0.01,col,x,y+0.005,z,g,16); cyl(0.017,h,col,x,y+h/2,z,g,14,0.015);
  barXY(box(1,0.018,0.02,col,0,0,z,g),x,y+h-0.012,x+0.13,y+h-0.045); barXY(box(1,0.01,0.016,col,0,0,z,g),x-0.005,y+h+0.006,x-0.075,y+h+0.026);}
/* a ceramic top D × W at height y with its bowl (bd × bw, centred at bx) sunk into it */
function basin(g,D,W,y,t,bd,bw,bx){
  rbox(D,t,W,CER,0,y+t/2,0,g,0.012,0.035);
  [[1,0xd9dfe0,0.0015],[0.76,0xb3bcbf,0.003]].forEach(function(q){const m=cyl(1,0.003,q[1],bx+(1-q[0])*bd*0.3,y+t+q[2],0,g,36); m.scale.set(bd/2*q[0],1,bw/2*q[0]); m.castShadow=false;});
  cyl(0.016,0.003,0x8d9294,bx+bd*0.07,y+t+0.0045,0,g,12);}
/* GODMORGON: a wall-hung cabinet 47 deep with two drawers, its back at -0.245 */
function gmBody(g,f,W,H){const x=-0.245+0.235; box(0.452,H,W,f,x-0.009,H/2,0,g);
  [H*0.75,H*0.25].forEach(function(y){front(g,0.217,y,0,H/2-0.006,W-0.004,f); pull(g,0.235,y+H/4-0.06,0,0.3,false);});}
const GM=[['White',PAINT]].concat(skin([['White stained oak effect',0xdad0be],['Brown stained ash effect',0x6d5440]],WOOD),[['Kasjön light blue',0xa9bfc9],['Gillburen dark grey',0x56585a]]);
def('godmorgon80',{n:'GODMORGON / ODENSVIK wash-stand with 2 drawers, 80',q:'GODMORGON ODENSVIK wash-stand',cat:'bath',place:'wall',y:0.26,w:83,d:49,h:80,col:GM,
  note:'Hung so the basin is at 90 cm: an 80 × 47 × 58 cabinet under an 83 × 49 basin, the tap 15 cm above it.'},function(g,c){
  gmBody(g,c.h,0.8,0.58); basin(g,0.49,0.83,0.58,0.06,0.33,0.62,0.03); tap(g,-0.19,0.64,0,0.12);});
def('godmorgonTolken',{n:'GODMORGON / TOLKEN / TÖRNVIKEN wash-stand with countertop bowl, 62',q:'GODMORGON TOLKEN TÖRNVIKEN',cat:'bath',place:'wall',y:0.26,w:62,d:49,h:87,
  col:[['White, bamboo top',PAINT,BAMBOO],['White stained oak effect, bamboo top',0xdad0be,BAMBOO],['Kasjön light blue, white marble effect top',0xa9bfc9,0xeceae6],['Gillburen dark grey, anthracite marble effect top',0x56585a,0x48494b]],
  note:'A Ø45 bowl on a 62 × 49 countertop over a 60 cm GODMORGON; the tall tap rises 25 cm above the top.'},function(g,c){
  gmBody(g,c.h,0.6,0.58); box(0.49,0.018,0.62,c.h2,0,0.589,0,g);
  cyl(0.12,0.11,CER,0.02,0.653,0,g,32,0.215); const b=cyl(0.2,0.003,0xc9cfd0,0.025,0.708,0,g,32); b.castShadow=false; tap(g,-0.205,0.598,0,0.24);});
def('hemnesWash',{n:'HEMNES / RÄTTVIKEN wash-stand with 2 drawers',q:'HEMNES RÄTTVIKEN wash-stand',cat:'bath',w:82,d:49,h:104,col:[['White',0xf4f3ef]].concat(skin([['Black-brown stain',0x3a312c]],WOOD)),
  note:'An 80 × 42 × 83 stand on its own legs under an 82 × 49 basin; the tap rises to 104 cm.'},function(g,c){
  const f=c.h, D=0.42, x=-0.245+D/2;
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){taper(g,x+q[0]*(D/2-0.025),q[1]*0.375,0.83,0.04,0.05,f);});
  box(D-0.03,0.6,0.76,f,x,0.53,0,g); box(0.02,0.08,0.76,f,x+D/2-0.012,0.2,0,g); box(D-0.05,0.02,0.73,f,x,0.08,0,g);
  [0.675,0.38].forEach(function(y){front(g,x+D/2-0.015,y,0,0.28,0.7,f,true); [-0.2,0.2].forEach(function(z){knob(g,x+D/2+0.003,y,z);});});
  basin(g,0.49,0.82,0.83,0.06,0.34,0.62,0.03); tap(g,-0.19,0.89,0,0.12);});
def('enhetWash',{n:'ENHET / TVÄLLEN wash-stand with 2 doors',q:'ENHET TVÄLLEN wash-stand',cat:'bath',w:64,d:43,h:100,
  col:[['White',PAINT,PAINT],['Anthracite',0x3b3c3e,0x3b3c3e]].concat(skin([['Oak effect, white frame',0xc8a06a,PAINT]],WOOD),[['Grey-green, grey frame',0x8a9a86,0x8d9092]]),
  note:'A 60 × 40 cabinet on legs under a 64 × 43 basin; the tap rises to 100 cm.'},function(g,c){
  const fr=c.h2, x=-0.015; sqLegs(g,0.17,0.27,0.22,0.025,fr); box(0.38,0.6,0.6,fr,x-0.01,0.51,0,g);
  [-1,1].forEach(function(s){front(g,0.175,0.51,s*0.1495,0.59,0.297,c.h); pull(g,0.193,0.66,s*0.02,0.12,true,sh(fr,0.8));});
  basin(g,0.43,0.64,0.81,0.06,0.3,0.48,0.025); tap(g,-0.165,0.87,0,0.11);});
def('lillangenMirror',{n:'LILLÅNGEN mirror cabinet with 2 doors',q:'LILLÅNGEN mirror cabinet',cat:'bath',place:'wall',y:1.2,w:60,d:21,h:64,col:[['White',PAINT]].concat(skin([['Black-brown',0x3a312c]],WOOD))},function(g,c){
  box(0.2,0.64,0.6,c.h,-0.005,0.32,0,g); [-1,1].forEach(function(s){box(0.008,0.63,0.296,MIR,0.099,0.32,s*0.149,g); mirror(g,0.1035,0.32,s*0.149,0.63,0.296);});});
def('hemnesMirrorCab',{n:'HEMNES mirror cabinet with 2 doors',q:'HEMNES mirror cabinet',cat:'bath',place:'wall',y:1.05,w:83,d:16,h:98,col:[['White',0xf4f3ef]].concat(skin([['Black-brown stain',0x3a312c]],WOOD))},function(g,c){
  const f=c.h; box(0.13,0.9,0.79,f,-0.015,0.47,0,g); box(0.16,0.045,0.83,f,0,0.9575,0,g); box(0.15,0.025,0.83,f,-0.005,0.0125,0,g);
  [-1,1].forEach(function(s){const z=s*0.1965; box(0.022,0.89,0.39,sh(f,0.97),0.061,0.47,z,g); mirror(g,0.0725,0.47,z,0.76,0.3); knob(g,0.072,0.47,s*0.03);});});
def('godmorgonMirror',{n:'GODMORGON mirror cabinet with 2 doors, 80',q:'GODMORGON mirror cabinet',cat:'bath',place:'wall',y:1.1,w:80,d:14,h:96,col:[['Mirror glass',MIR]]},function(g,c){
  box(0.12,0.96,0.8,c.h,-0.01,0.48,0,g); [-1,1].forEach(function(s){mirror(g,0.0505,0.48,s*0.1995,0.955,0.397); mirror(g,-0.01,0.48,s*0.4005,0.96,0.12).rotation.y=s>0?0:R;});
  box(0.004,0.95,0.004,0x9aa5a8,0.052,0.48,0,g);});
def('mirrorShelf',{n:'Round mirror Ø60 with a shelf',q:'round mirror with shelf',cat:'bath',place:'wall',y:1.0,w:60,d:12,h:71,col:C.frame},function(g,c){
  torus(0.29,0.012,c.h,-0.045,0.42,0,g).rotation.y=R/2; cyl(0.29,0.006,c.h,-0.053,0.42,0,g,40).rotation.z=R/2; mirror(g,-0.0495,0.42,0,0.57);
  box(0.12,0.02,0.6,c.h,0,0.06,0,g); [-0.24,0.24].forEach(function(z){box(0.006,0.05,0.02,0x2b2b2b,-0.057,0.025,z,g); box(0.1,0.006,0.02,0x2b2b2b,-0.01,0.047,z,g);});
  const p=K.dec(g,'toiletries'); cyl(0.03,0.09,0xe6ddcd,0.0,0.115,-0.18,p,14); cyl(0.022,0.13,0x8fbd9b,0.005,0.135,0.15,p,12); cyl(0.006,0.03,CHR,0.005,0.215,0.15,p,8);});
def('hemnesHighCab',{n:'HEMNES high cabinet with mirror door',q:'HEMNES high cabinet mirror door',cat:'bath',w:49,d:31,h:200,col:[['White',0xf4f3ef]].concat(skin([['Black-brown stain',0x3a312c]],WOOD))},function(g,c){
  const f=c.h; box(0.29,1.87,0.47,f,-0.01,1.015,0,g); box(0.02,0.08,0.45,f,0.12,0.04,0,g); box(0.31,0.05,0.49,f,0,1.975,0,g);
  box(0.022,1.3,0.45,sh(f,0.97),0.146,1.27,0,g); mirror(g,0.1575,1.29,0,1.14,0.37); box(0.022,0.5,0.45,sh(f,0.97),0.146,0.34,0,g);
  box(0.004,0.4,0.36,sh(f,0.9),0.158,0.34,0,g); knob(g,0.157,0.68,0.18); knob(g,0.157,0.5,0.18);});
def('godmorgonHigh',{n:'GODMORGON high cabinet on legs',q:'GODMORGON high cabinet',cat:'bath',w:40,d:32,h:192,col:GM,note:'Stands on GODMORGON legs, or hangs on the wall.'},function(g,c){
  const f=c.h; [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){cyl(0.014,0.12,CHR,q[0]*0.12,0.06,q[1]*0.16,g,10);});
  box(0.3,1.8,0.4,f,-0.01,1.02,0,g); front(g,0.14,1.02,0,1.795,0.396,f); pull(g,0.158,1.02,0.16,0.3,true);});
def('ragrundShelf',{n:'RÅGRUND shelving unit, bamboo',q:'RÅGRUND shelving unit',cat:'bath',w:33,d:28,h:163,col:skin([['Bamboo',BAMBOO]],WOOD)},function(g,c){
  const f=c.h; sqLegs(g,0.125,0.15,1.63,0.03,f);
  [0.1,0.57,1.04,1.58].forEach(function(y){[-1,1].forEach(function(s){box(0.22,0.03,0.02,f,0,y-0.02,s*0.15,g);}); slats(g,f,-0.13,0.13,-0.14,0.14,y,6,0.012);});});
def('ragrundChair',{n:'RÅGRUND chair / towel rack, bamboo',q:'RÅGRUND chair towel rack',cat:'bath',w:37,d:34,h:74,col:skin([['Bamboo',BAMBOO]],WOOD),seats:[{id:'',lx:0.03,lz:0,y:0.45,type:'sit'}]},function(g,c){
  const f=c.h; [-1,1].forEach(function(s){const z=s*0.165; box(0.03,0.43,0.03,f,0.15,0.215,z,g); box(0.03,0.74,0.03,f,-0.15,0.37,z,g); box(0.27,0.04,0.02,f,0,0.41,z,g); box(0.27,0.02,0.02,f,0,0.15,z,g);});
  slats(g,f,-0.17,0.17,-0.15,0.15,0.45,6,0.016); [0.58,0.71].forEach(function(y){cyl(0.012,0.33,f,-0.15,y,0,g,8).rotation.x=R/2;}); box(0.02,0.02,0.3,f,0.15,0.15,0,g);});
def('enhetShelf',{n:'ENHET wall frame with shelves, 60',q:'ENHET wall frame shelves',cat:'bath',place:'wall',y:1.2,w:60,d:15,h:75,col:[['White',PAINT],['Anthracite',0x3b3c3e]]},function(g,c){
  const f=c.h; [-1,1].forEach(function(s){box(0.15,0.75,0.018,f,0,0.375,s*0.291,g);}); [0.009,0.741,0.25,0.5].forEach(function(y){box(0.15,0.018,0.564,f,0,y,0,g);});});
def('toftbo',{n:'TOFTBO bath mat',q:'TOFTBO bath mat',cat:'bath',flat:true,lh:0.25,w:90,d:60,h:1,
  col:[['White',SHEET]].concat(skin([['Grey-white mélange',0xc9c8c2],['Dark grey',0x55585b],['Turquoise',0x4d9fa3],['Light green',0xb4bfa2]],WEAVE))},function(g,c){
  rbox(0.6,0.014,0.9,c.h,0,0.007,0,g,0.006,0.07).castShadow=false;});
def('kalkgrund',{n:'KALKGRUND towel rail with a towel',q:'KALKGRUND towel rail',cat:'bath',place:'wall',y:0.95,w:62,d:9,h:45,
  col:[['White towel',SHEET]].concat(skin([['Beige towel',0xd8c8a6],['Light blue towel',BLUE],['Sage towel',SAGE],['Dark grey towel',0x55585b]],WEAVE))},function(g,c){
  cyl(0.009,0.62,CHR,0.0,0.43,0,g,10).rotation.x=R/2;
  [-0.29,0.29].forEach(function(z){cyl(0.011,0.055,CHR,-0.0275,0.43,z,g,10).rotation.z=R/2; cyl(0.024,0.008,CHR,-0.051,0.43,z,g,16).rotation.z=R/2;});
  const t=K.dec(g,'towel'); box(0.01,0.42,0.5,c.h,0.015,0.215,-0.02,t); box(0.01,0.32,0.5,c.h,-0.015,0.27,-0.02,t); cyl(0.02,0.5,c.h,0,0.432,-0.02,t,12).rotation.x=R/2;
  box(0.012,0.03,0.5,sh(c.h,0.88),0.016,0.04,-0.02,t);});
def('torkis',{n:'TORKIS flexible laundry basket, 58 l',q:'TORKIS laundry basket',cat:'bath',w:58,d:38,h:30,col:[['White',0xf3f3f0],['Grey',0x9a9c9c]]},function(g,c){
  cyl(1,0.28,c.h,0,0.14,0,g,32,1.08).scale.set(0.176,1,0.268); const in_=cyl(1,0.004,sh(c.h,0.72),0,0.278,0,g,32); in_.scale.set(0.178,1,0.27);
  [-1,1].forEach(function(s){box(0.09,0.03,0.02,sh(c.h,0.55),0,0.235,s*0.276,g);});
  rbox(0.2,0.06,0.24,BLUE,0.02,0.262,-0.08,g,0.03).rotation.z=0.12; rbox(0.18,0.05,0.2,0xe6ddcd,-0.03,0.265,0.1,g,0.025).rotation.x=0.15;});
def('dragan',{n:'DRAGAN bathroom set, bamboo',q:'DRAGAN bathroom set',cat:'bath',place:'top',w:22,d:8,h:20,col:skin([['Bamboo',BAMBOO]],WOOD)},function(g,c){
  const p=K.dec(g,'toiletries'); cyl(0.034,0.13,c.h,0,0.065,-0.06,p,18); cyl(0.008,0.035,CHR,0,0.148,-0.06,p,8); box(0.035,0.008,0.008,CHR,0.015,0.163,-0.06,p);
  cyl(0.034,0.1,c.h,0,0.05,0.06,p,18); [[0x9fc4d6,-0.18],[0xe8a33a,0.2]].forEach(function(q){const b=cyl(0.004,0.19,q[0],0,0.1,0.06,p,6); b.rotation.x=q[1];});});

/* ======================= KITCHEN AND BAR ======================= */
def('bekvamTrolley',{n:'BEKVÄM kitchen trolley',q:'BEKVÄM kitchen trolley',cat:'kitchen',w:58,d:50,h:84,col:skin([['Beech',BEECH]],WOOD)},function(g,c){
  const f=c.h; [-1,1].forEach(function(s){box(0.035,0.84,0.035,f,s*0.215,0.42,0.27,g); box(0.035,0.72,0.035,f,s*0.215,0.44,-0.27,g); castor(g,s*0.215,-0.27,0.04);});
  cyl(0.016,0.46,f,0,0.81,0.27,g,10).rotation.z=R/2;
  [0.2,0.48,0.78].forEach(function(y){box(0.43,0.018,0.52,f,0,y,0,g); [-1,1].forEach(function(s){box(0.43,0.04,0.012,f,0,y+0.02,s*0.255,g); box(0.012,0.04,0.52,f,s*0.21,y+0.02,0,g);});});});
def('nissafors',{n:'NISSAFORS utility cart',q:'NISSAFORS utility cart',cat:'kitchen',w:51,d:30,h:83,col:[['Black',0x2b2b2b],['White',PAINT]]},function(g,c){
  const f=c.h; [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){cyl(0.01,0.78,f,q[0]*0.135,0.43,q[1]*0.24,g,8); castor(g,q[0]*0.135,q[1]*0.24,0.022);});
  [0.1,0.44,0.78].forEach(function(y){box(0.27,0.008,0.48,f,0,y,0,g); [-1,1].forEach(function(s){box(0.27,0.07,0.005,f,0,y+0.035,s*0.24,g); box(0.005,0.07,0.48,f,s*0.135,y+0.035,0,g);});
    cyl(0.006,0.48,f,0.135,y+0.072,0,g,6).rotation.x=R/2; cyl(0.006,0.48,f,-0.135,y+0.072,0,g,6).rotation.x=R/2;});});
def('forhoja',{n:'FÖRHÖJA kitchen trolley, birch',q:'FÖRHÖJA kitchen trolley',cat:'kitchen',w:100,d:43,h:90,col:skin([['Birch',BIRCH]],WOOD)},function(g,c){
  const f=c.h; [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){box(0.04,0.81,0.04,f,q[0]*0.185,0.465,q[1]*0.46,g); castor(g,q[0]*0.185,q[1]*0.46,0.025);});
  box(0.43,0.03,1.0,f,0,0.885,0,g); box(0.37,0.11,0.92,f,0,0.81,0,g); front(g,0.185,0.81,-0.2,0.1,0.44,f); front(g,0.185,0.81,0.24,0.1,0.38,f); pull(g,0.203,0.81,-0.2,0.14,false); pull(g,0.203,0.81,0.24,0.14,false);
  [0.12,0.45].forEach(function(y){box(0.37,0.03,0.02,f,0,y-0.03,-0.46,g); box(0.37,0.03,0.02,f,0,y-0.03,0.46,g); slats(g,f,-0.185,0.185,-0.44,0.44,y,6,0.016);});
  cyl(0.01,0.36,STEEL,0,0.65,0.49,g,8).rotation.z=R/2;});
def('tornviken',{n:'TORNVIKEN kitchen island, off-white/oak',q:'TORNVIKEN kitchen island',cat:'kitchen',w:126,d:77,h:91,col:[['Off-white, oak top',0xece6d8,OAK]]},function(g,c){
  const f=c.h; sqLegs(g,0.33,0.57,0.87,0.06,f); rbox(0.77,0.04,1.26,c.h2,0,0.89,0,g,0.008,0.02);
  box(0.6,0.75,0.54,f,-0.01,0.495,-0.27,g); box(0.3,0.75,0.54,f,-0.16,0.495,0.27,g); box(0.3,0.15,0.54,f,0.14,0.795,0.27,g); box(0.3,0.02,0.54,f,0.14,0.13,0.27,g); box(0.29,0.02,0.52,f,0.14,0.43,0.27,g); box(0.3,0.75,0.02,f,0.14,0.495,0.53,g);
  box(0.004,0.57,0.5,sh(f,0.86),-0.008,0.43,0.27,g);
  [-0.27,0.27].forEach(function(z){front(g,0.29,0.79,z,0.12,0.5,f); knob(g,0.308,0.79,z,0x2b2b2b);}); front(g,0.29,0.43,-0.27,0.54,0.5,f,true); knob(g,0.308,0.6,-0.06,0x2b2b2b);
  const p=K.dec(g,'bowls'); [0,1,2].forEach(function(i){cyl(0.07,0.035,0xf3efe6,0.12,0.155+i*0.034,0.17,p,18,0.1);}); box(0.22,0.2,0.2,RATTAN,0.1,0.54,0.33,K.dec(g,'insert'));});
def('vadholma',{n:'VADHOLMA kitchen island, black/oak',q:'VADHOLMA kitchen island',cat:'kitchen',w:126,d:79,h:90,col:[['Black, oak',0x262626,OAK]]},function(g,c){
  const f=c.h, o=c.h2; sqLegs(g,0.36,0.6,0.86,0.04,f); rbox(0.79,0.04,1.26,o,0,0.88,0,g,0.008,0.015);
  [-1,1].forEach(function(s){box(0.72,0.05,0.025,f,0,0.835,s*0.6,g); box(0.025,0.05,1.2,f,s*0.36,0.835,0,g); box(0.02,0.02,1.16,f,s*0.36,0.73,0,g);
    [-0.3,0,0.3].forEach(function(z){torus(0.018,0.003,STEEL,s*0.37,0.705,z,g).rotation.y=R/2;});});
  slats(g,o,-0.34,0.34,-0.58,0.58,0.46,7,0.02); box(0.72,0.02,0.02,f,0,0.44,-0.6,g); box(0.72,0.02,0.02,f,0,0.44,0.6,g);
  box(0.68,0.025,1.16,o,0,0.14,0,g); box(0.72,0.02,0.02,f,0,0.12,-0.6,g); box(0.72,0.02,0.02,f,0,0.12,0.6,g);});
def('stenstorp',{n:'STENSTORP kitchen trolley, white/oak',q:'STENSTORP kitchen trolley',cat:'kitchen',w:79,d:51,h:90,col:[['White, oak',PAINT,OAK]]},function(g,c){
  const f=c.h; [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){box(0.045,0.8,0.045,f,q[0]*0.215,0.46,q[1]*0.355,g); castor(g,q[0]*0.215,q[1]*0.355,0.03);});
  rbox(0.51,0.03,0.79,c.h2,0,0.885,0,g,0.008,0.01); box(0.44,0.13,0.68,f,0,0.795,0,g); front(g,0.22,0.795,0,0.12,0.67,f); pull(g,0.238,0.795,0,0.16,false);
  slats(g,c.h2,-0.2,0.2,-0.335,0.335,0.45,6,0.02); [-1,1].forEach(function(s){box(0.43,0.03,0.02,f,0,0.425,s*0.355,g);});
  box(0.43,0.02,0.67,f,0,0.13,0,g); box(0.015,0.06,0.67,f,0.21,0.16,0,g);});
def('norraker',{n:'NORRÅKER bar table, birch',q:'NORRÅKER bar table',cat:'kitchen',w:74,d:74,h:102,col:skin([['Birch',BIRCH],['White birch',0xe7e1d2]],WOOD)},function(g,c){
  const f=c.h; box(0.74,0.03,0.74,f,0,1.005,0,g); box(0.64,0.07,0.64,f,0,0.955,0,g); legs4(g,0.3,0.3,0.99,0.03,0.045,f,true);
  [-1,1].forEach(function(s){cyl(0.013,0.64,f,s*0.317,0.3,0,g,8).rotation.x=R/2; cyl(0.013,0.64,f,0,0.3,s*0.317,g,8).rotation.z=R/2;});});
def('nordvikenBar',{n:'NORDVIKEN bar table',q:'NORDVIKEN bar table',cat:'kitchen',w:140,d:80,h:105,col:[['White',PAINT],['Black',0x262626]]},function(g,c){
  const f=c.h; rbox(0.8,0.035,1.4,f,0,1.0325,0,g,0.01,0.015); box(0.68,0.09,1.26,f,0,0.97,0,g);
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){taper(g,q[0]*0.34,q[1]*0.64,1.015,0.045,0.06,f);});
  [-1,1].forEach(function(s){box(0.03,0.03,1.24,f,s*0.34,0.27,0,g); box(0.66,0.03,0.03,f,0,0.27,s*0.64,g);});});
function franklin(g,c){const f=c.h;
  [-1,1].forEach(function(e){rod(g,-0.215,0,e*0.205,-0.17,0.95,e*0.17,0.012,f); rod(g,0.215,0,e*0.205,0.15,0.62,e*0.175,0.012,f);});
  rod(g,0.185,0.28,-0.2,0.185,0.28,0.2,0.013,f); rod(g,-0.2,0.2,-0.2,-0.2,0.2,0.2,0.011,f);
  rbox(0.37,0.03,0.38,f,-0.01,0.635,0,g,0.012,0.08); rbox(0.025,0.13,0.38,f,-0.175,0.87,0,g,0.01,0.05).rotation.z=0.06;}
def('franklin',{n:'FRANKLIN bar stool with backrest, foldable, 63',q:'FRANKLIN bar stool',cat:'kitchen',w:44,d:48,h:95,col:[['Black/black',0x262626],['White/white',0xf3f3f0]],seats:[{id:'',lx:0.02,lz:0,y:0.65,type:'sit'}]},franklin);
def('ingolfBar',{n:'INGOLF bar stool with backrest, 63',q:'INGOLF bar stool',cat:'kitchen',w:40,d:45,h:91,col:[['White',0xf4f4f1]].concat(skin([['Brown-black',0x3a312c]],WOOD)),seats:[{id:'',lx:0.02,lz:0,y:0.65,type:'sit'}]},function(g,c){
  const f=c.h; [-1,1].forEach(function(e){const z=e*0.17; rod(g,0.19,0,e*0.185,0.16,0.62,z,0.019,f,10,0.016); bar(g,-0.21,0,e*0.185,-0.18,0.91,z,0.035,0.03,f);});
  rbox(0.4,0.035,0.4,f,0,0.632,0,g,0.012,0.04);
  [[0.25,0.175,1],[0.3,-0.195,1]].forEach(function(q){rod(g,q[1],q[0],-0.18,q[1],q[0],0.18,0.011,f);}); [-1,1].forEach(function(e){rod(g,-0.2,0.28,e*0.18,0.18,0.28,e*0.18,0.01,f);});
  rbox(0.03,0.07,0.38,f,-0.18,0.87,0,g,0.01); for(let i=0;i<4;i++) rod(g,-0.188,0.65,-0.105+i*0.07,-0.183,0.84,-0.105+i*0.07,0.008,f);});
def('stig',{n:'STIG bar stool with backrest, 63',q:'STIG bar stool',cat:'kitchen',w:43,d:44,h:90,col:[['Black/black',0x262626,0x262626],['White/silver-colour',0xf3f3f0,CHR]],seats:[{id:'',lx:0.02,lz:0,y:0.64,type:'sit'}]},function(g,c){
  const f=c.h2; legs4(g,0.12,0.12,0.62,0.07,0.011,f); torus(0.205,0.009,f,0,0.27,0,g).rotation.x=R/2;
  cyl(0.18,0.03,c.h,0,0.625,0,g,32); torus(0.18,0.012,c.h,0,0.632,0,g).rotation.x=R/2;
  [-1,1].forEach(function(e){rod(g,-0.12,0.6,e*0.12,-0.19,0.88,e*0.14,0.009,f);}); rbox(0.03,0.09,0.32,c.h,-0.19,0.85,0,g,0.012,0.05);});
def('kyrre',{n:'KYRRE stool, birch',q:'KYRRE stool',cat:'kitchen',w:36,d:36,h:45,col:skin([['Birch',BIRCH]],WOOD),seats:[{id:'',lx:0,lz:0,y:0.45,type:'sit',face:true}]},function(g,c){
  const f=c.h; cyl(0.175,0.024,f,0,0.438,0,g,32);
  [[1,0,0.41],[0,1,0.385]].forEach(function(q){[-1,1].forEach(function(s){bar(g,s*0.165*q[0],0,s*0.165*q[1],s*0.125*q[0],q[2],s*0.125*q[1],q[0]?0.02:0.045,q[0]?0.045:0.02,f);});
    box(q[0]?0.27:0.045,0.024,q[0]?0.045:0.27,f,0,q[2]+0.012,0,g);});});
def('frosta',{n:'FROSTA stool',q:'FROSTA stool',cat:'kitchen',w:35,d:35,h:45,col:skin([['Birch',BIRCH]],WOOD).concat([['White',PAINT]]),seats:[{id:'',lx:0,lz:0,y:0.45,type:'sit',face:true}]},function(g,c){
  const f=c.h; cyl(0.175,0.022,f,0,0.439,0,g,32);
  for(let i=0;i<4;i++){const a=R/4+i*R/2, s=G(g); s.rotation.y=a; bar(s,0.16,0,0,0.11,0.41,0,0.016,0.045,f); box(0.1,0.016,0.045,f,0.065,0.42,0,s);}});
def('bekvamStep',{n:'BEKVÄM step stool',q:'BEKVÄM step stool',cat:'kitchen',w:43,d:40,h:50,col:skin([['Aspen',0xdccfb0],['Beech',BEECH]],WOOD).concat([['Black',0x262626],['White',PAINT]]),
  seats:[{id:'',label:'Step stool',lx:-0.02,lz:0,y:0.5,type:'sit'}]},function(g,c){
  const f=c.h; [-1,1].forEach(function(s){const z=s*0.2; bar(g,0.19,0,z,0.12,0.48,z,0.05,0.018,f); bar(g,-0.19,0,z,-0.13,0.48,z,0.05,0.018,f);});
  box(0.3,0.022,0.43,f,-0.005,0.489,0,g); box(0.035,0.006,0.12,0x2b2b2b,-0.005,0.498,0,g); box(0.12,0.02,0.38,f,0.12,0.25,0,g); box(0.018,0.06,0.38,f,-0.16,0.2,0,g);});
/* utensils hanging from a rail: a ladle, a spatula, a whisk */
function utensils(p,x,y,zs,col){
  zs.forEach(function(z,i){torus(0.012,0.002,col,x,y-0.012,z,p).rotation.y=R/2; cyl(0.005,0.24,0x2b2b2b,x,y-0.145,z,p,6);
    if(i===0){sph(0.04,col,x,y-0.29,z,p,1,0.6,1);} else if(i===1){box(0.006,0.085,0.06,0x2b2b2b,x,y-0.305,z,p);} else{[0,1,2].forEach(function(k){const w=torus(0.026,0.002,col,x,y-0.31,z,p); w.rotation.y=k*R/3; w.scale.y=1.8;});}});}
def('kungsforsRail',{n:'KUNGSFORS rail with utensils',q:'KUNGSFORS rail',cat:'kitchen',place:'wall',y:1.15,w:56,d:15,h:45,col:[['Stainless steel',CHR]]},function(g,c){
  const f=c.h, y=0.37; cyl(0.008,0.56,f,0,y,0,g,10).rotation.x=R/2; [-0.25,0.25].forEach(function(z){cyl(0.008,0.05,f,-0.025,y,z,g,8).rotation.z=R/2; cyl(0.02,0.008,f,-0.05,y,z,g,14).rotation.z=R/2;});
  const p=K.dec(g,'utensils'); utensils(p,0,y,[-0.2,-0.12,-0.04],f);
  cyl(0.05,0.13,f,0.05,y-0.1,0.15,p,20); torus(0.012,0.003,f,0.0,y-0.012,0.15,p).rotation.y=R/2;
  [[-0.02,0.12],[0.015,0.17],[0.0,0.19]].forEach(function(q){const s=cyl(0.006,0.22,BEECH,0.05+q[0],y-0.01,q[1],p,6); s.rotation.x=(q[1]-0.15)*3;});});
def('hultarp',{n:'HULTARP rail with container and hooks',q:'HULTARP rail',cat:'kitchen',place:'wall',y:1.1,w:60,d:14,h:45,col:[['Black',0x262626],['Nickel-plated',CHR]]},function(g,c){
  const f=c.h; cyl(0.008,0.6,f,-0.03,0.36,0,g,10).rotation.x=R/2; [-0.27,0.27].forEach(function(z){cyl(0.007,0.04,f,-0.05,0.36,z,g,8).rotation.z=R/2;});
  const k=K.dec(g,'container'); box(0.11,0.005,0.24,f,0.025,0.23,-0.12,k); [-1,1].forEach(function(s){box(0.11,0.12,0.005,f,0.025,0.29,-0.12+s*0.12,k); box(0.005,0.12,0.24,f,0.025+s*0.055,0.29,-0.12,k);});
  cyl(0.022,0.2,0x6a8f4a,0.0,0.335,-0.18,k,12); cyl(0.022,0.17,0xe8c06a,0.05,0.32,-0.08,k,12); glass(cyl(0.025,0.19,0xdfe9ec,0.0,0.33,-0.06,k,12),0.45);
  const t=K.dec(g,'towel'); torus(0.015,0.003,f,-0.03,0.345,0.16,t).rotation.y=R/2; box(0.012,0.33,0.22,LINEN,-0.02,0.17,0.16,t); box(0.013,0.02,0.22,0x9fc4d6,-0.019,0.05,0.16,t);});
def('kungsforsShelf',{n:'KUNGSFORS shelf with KORKEN jars',q:'KUNGSFORS shelf',cat:'kitchen',place:'wall',y:1.4,w:60,d:25,h:35,col:[['Stainless steel',CHR]]},function(g,c){
  const f=c.h; box(0.012,0.03,0.6,f,-0.119,0.1,0,g); box(0.25,0.012,0.6,f,0,0.114,0,g); box(0.012,0.04,0.6,f,-0.119,0.14,0,g);
  [-0.26,0.26].forEach(function(z){barXY(box(1,0.02,0.01,f,0,0,z,g),-0.12,0.0,0.08,0.11);});
  korken(K.dec(g,'jars'),0,0.12,0);});
/* three KORKEN jars with swing tops: pasta, coffee beans, lentils */
function korken(p,x,y,z){[[0.062,0.2,-0.1,0xe9c46a],[0.05,0.16,0.02,0x4a3020],[0.044,0.12,0.12,0xc0652d]].forEach(function(q){const r=q[0], h=q[1], zz=z+q[2];
  glass(cyl(r,h,0xdfe9ec,x,y+h/2,zz,p,20),0.35); cyl(r*0.86,h*0.62,q[3],x,y+h*0.31+0.004,zz,p,16);
  cyl(r*0.98,0.02,0xdfe9ec,x,y+h+0.01,zz,p,20); torus(r*0.92,0.004,0xe0763a,x,y+h,zz,p).rotation.x=R/2; box(0.006,0.035,0.012,CHR,x+r,y+h-0.008,zz,p);});}
def('korken',{n:'KORKEN jars with lids, set of 3',q:'KORKEN jar with lid',cat:'kitchen',place:'top',w:32,d:13,h:22,col:[['Clear glass',0xdfe9ec]]},function(g){korken(K.dec(g,'jars'),0,0,0);});
def('fruitBowl',{n:'BLANDA MATT bowl with fruit',q:'BLANDA MATT serving bowl',cat:'kitchen',place:'top',w:28,d:28,h:18,col:skin([['Bamboo',BAMBOO]],WOOD).concat([['White',PAINT]])},function(g,c){
  const p=K.dec(g,'bowl'); cyl(0.08,0.09,c.h,0,0.045,0,p,28,0.14); cyl(0.13,0.004,sh(c.h,0.8),0,0.088,0,p,28);
  [[0.04,0.11,-0.04,0xe8892b],[-0.03,0.11,0.05,0xe8892b],[-0.05,0.11,-0.04,0xb8322a],[0.05,0.1,0.06,0x8fb24a],[0.0,0.14,0.0,0xb8322a]].forEach(function(q){sph(0.036,q[3],q[0],q[1],q[2],p);});
  const b=torus(0.08,0.016,0xe8c94a,0.02,0.13,-0.02,p,1.8); b.rotation.set(R/2,0,0.4);});
def('proppmatt',{n:'PROPPMÄTT chopping board with bread',q:'PROPPMÄTT chopping board',cat:'kitchen',place:'top',w:45,d:28,h:11,col:skin([['Beech',BEECH]],WOOD)},function(g,c){
  rbox(0.28,0.025,0.45,c.h,0,0.0125,0,g,0.008,0.03); const p=K.dec(g,'bread'); rbox(0.11,0.08,0.22,0xb87a3e,-0.02,0.065,-0.05,p,0.035,0.05);
  [0.09,0.11,0.13].forEach(function(z){const s=box(0.1,0.075,0.012,0xe9d3a8,0.0,0.06,z+0.01,p); s.rotation.x=0.3;});});
const METF=[['VEDDINGE white',PAINT,STEEL],['BODBYN off-white',0xe9e4d6,0x6b6b66],['STENSUND beige',0xd5c7ae,0x3a3a38],['NICKEBO matt grey-green',0x8a9686],['NICKEBO matt anthracite',0x48494b]].concat(skin([['VOXTORP walnut effect',0x6b4a33,STEEL]],WOOD));
def('metodHigh',{n:'METOD high cabinet with 2 doors, 60 × 200',q:'METOD high cabinet 60x60x200',cat:'kitchen',w:60,d:62,h:208,col:METF,note:'A 60 × 60 × 200 cabinet on its 8 cm legs, behind a plinth; 62 deep with the doors.'},function(g,c){
  const f=c.h, ins=f===0xe9e4d6||f===0xd5c7ae; box(0.6,2.0,0.6,PAINT,-0.01,1.08,0,g); box(0.016,0.08,0.6,f,0.24,0.04,0,g);
  front(g,0.29,0.78,0,1.395,0.596,f,ins); front(g,0.29,1.78,0,0.595,0.596,f,ins);
  if(c.h2!=null){pull(g,0.308,1.32,0.24,0.2,true,c.h2); pull(g,0.308,1.6,0.24,0.2,true,c.h2);} else{box(0.006,0.012,0.597,sh(f,0.6),0.31,1.477,0,g);}});

/* ======================= DINING ======================= */
def('ekedalen',{n:'EKEDALEN extendable table, 120/180',q:'EKEDALEN extendable table',cat:'dining',w:120,d:80,h:75,col:[['White',PAINT]].concat(skin([['Dark brown',0x4a3426],['Oak',OAK]],WOOD)),
  note:'Seats four, or six with the leaf pulled out: 120 cm closed, 180 open.'},function(g,c){
  const f=c.h; rbox(0.8,0.03,1.2,f,0,0.735,0,g,0.008,0.02); box(0.79,0.002,0.003,sh(f,0.7),0,0.7505,0,g); box(0.66,0.08,1.06,f,0,0.68,0,g);
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){taper(g,q[0]*0.335,q[1]*0.535,0.72,0.04,0.055,f);});});
def('melltorp',{n:'MELLTORP table, 125',q:'MELLTORP table',cat:'dining',w:125,d:75,h:74,col:[['White',PAINT,PAINT],['Marble effect, white',0xe6e4df,PAINT]]},function(g,c){
  const f=c.h2; box(0.75,0.025,1.25,c.h,0,0.7275,0,g);
  [-1,1].forEach(function(s){box(0.03,0.04,1.14,f,s*0.33,0.695,0,g); box(0.66,0.04,0.03,f,0,0.695,s*0.585,g);}); sqLegs(g,0.335,0.59,0.715,0.03,f);});
def('norden',{n:'NORDEN gateleg table, open',q:'NORDEN gateleg table',cat:'dining',w:152,d:80,h:74,col:skin([['Birch',BIRCH]],WOOD).concat([['White',PAINT]]),
  note:'26, 89 or 152 cm long: both leaves up here. Six drawers in the middle.'},function(g,c){
  const f=c.h; box(0.8,0.025,1.52,f,0,0.7275,0,g); [-0.13,0.13].forEach(function(z){box(0.79,0.002,0.003,sh(f,0.7),0,0.7405,z,g);});
  box(0.7,0.6,0.22,f,0,0.4,0,g); box(0.8,0.05,0.24,f,0,0.025,0,g); box(0.7,0.04,0.2,f,0,0.07,0,g);
  [-1,1].forEach(function(s){for(let i=0;i<3;i++){const y=0.18+i*0.18; front(g,s>0?0.35:-0.368,y,0,0.165,0.2,f); knob(g,s>0?0.368:-0.395,y,0,0x7a6a55);}
    const x=s*0.27, z=s*0.62; box(0.04,0.7,0.04,f,x,0.36,z,g); box(0.035,0.04,0.5,f,x,0.69,s*0.36,g); box(0.035,0.04,0.5,f,x,0.1,s*0.36,g);});});
def('skogsta',{n:'SKOGSTA dining table, acacia, 235',q:'SKOGSTA dining table',cat:'dining',w:235,d:100,h:74,col:skin([['Acacia',0x8a5a36]],WOOD)},function(g,c){
  const f=c.h; box(1.0,0.04,2.35,f,0,0.72,0,g); box(0.8,0.1,2.05,f,0,0.65,0,g); sqLegs(g,0.4,1.03,0.7,0.08,f);});
def('tommaryd',{n:'TOMMARYD table, 130',q:'TOMMARYD table',cat:'dining',w:130,d:70,h:75,col:[['White',PAINT,PAINT],['White stained oak veneer, anthracite',0xdccfb7,0x3a3c3f]]},function(g,c){
  const f=c.h2; rbox(0.7,0.025,1.3,c.h,0,0.7375,0,g,0.008,0.01); box(0.56,0.04,1.1,f,0,0.705,0,g);
  [-1,1].forEach(function(s){[-1,1].forEach(function(e){bar(g,e*0.3,0,s*0.62,e*0.27,0.71,s*0.5,0.04,0.02,f);}); box(0.6,0.03,0.02,f,0,0.25,s*0.585,g);}); box(0.03,0.03,1.16,f,0,0.25,0,g);});
def('docksta',{n:'DOCKSTA table, Ø103',q:'DOCKSTA table',cat:'dining',w:103,d:103,h:75,col:[['White',PAINT],['Black',0x262626]]},function(g,c){
  const f=c.h; cyl(0.28,0.025,f,0,0.0125,0,g,40,0.26); cyl(0.26,0.12,f,0,0.085,0,g,40,0.07); cyl(0.07,0.4,f,0,0.345,0,g,24,0.055);
  cyl(0.055,0.17,f,0,0.63,0,g,24,0.2); cyl(0.5,0.012,f,0,0.722,0,g,48,0.515); cyl(0.515,0.022,f,0,0.739,0,g,48);});
def('voxlov',{n:'VOXLÖV dining table, light bamboo',q:'VOXLÖV dining table',cat:'dining',w:180,d:90,h:75,col:skin([['Light bamboo',0xd8bb8a]],WOOD)},function(g,c){
  const f=c.h; rbox(0.9,0.03,1.8,f,0,0.735,0,g,0.008,0.02); box(0.76,0.07,1.62,f,0,0.685,0,g); sqLegs(g,0.38,0.81,0.72,0.05,f);
  [-1,1].forEach(function(s){box(0.72,0.04,0.03,f,0,0.12,s*0.81,g);}); box(0.04,0.04,1.6,f,0,0.12,0,g);});

/* ======================= CHAIRS ======================= */
const SEAT=[{id:'',lx:0.02,lz:0,y:0.47,type:'sit'}];
def('adde',{n:'ADDE chair',q:'ADDE chair',cat:'chair',w:39,d:47,h:77,col:[['White',0xf3f3f0],['Black',0x2a2a2a]],seats:SEAT},function(g,c){
  const f=c.h; [-1,1].forEach(function(e){const z=e*0.165; rod(g,0.17,0,e*0.175,0.16,0.44,z,0.011,f); rod(g,-0.21,0,e*0.175,-0.17,0.44,z,0.011,f); rod(g,-0.17,0.44,z,-0.205,0.6,z,0.011,f);});
  rbox(0.39,0.03,0.39,f,0.02,0.455,0,g,0.012,0.06); rbox(0.025,0.17,0.38,f,-0.21,0.68,0,g,0.01,0.06).rotation.z=0.12;});
def('teodores',{n:'TEODORES chair',q:'TEODORES chair',cat:'chair',w:42,d:51,h:80,col:[['White',0xf3f3f0],['Black',0x2a2a2a]],seats:SEAT},function(g,c){
  const f=c.h; [-1,1].forEach(function(e){const z=e*0.18; bar(g,0.2,0,e*0.19,0.17,0.44,z,0.035,0.03,f); bar(g,-0.23,0,e*0.19,-0.2,0.8,z,0.035,0.03,f);});
  rbox(0.42,0.035,0.42,f,0,0.457,0,g,0.012,0.05); rbox(0.03,0.22,0.4,f,-0.2,0.66,0,g,0.012,0.04).rotation.z=0.06;});
def('stefan',{n:'STEFAN chair',q:'STEFAN chair',cat:'chair',w:42,d:49,h:90,col:skin([['Brown-black',0x3a312c]],WOOD),seats:SEAT},function(g,c){
  const f=c.h; [-1,1].forEach(function(e){const z=e*0.18; box(0.035,0.44,0.035,f,0.18,0.22,z,g); bar(g,-0.22,0,z,-0.19,0.9,z,0.035,0.035,f); box(0.38,0.025,0.02,f,0,0.2,z,g);});
  box(0.42,0.03,0.4,f,0,0.455,0,g); box(0.02,0.04,0.36,f,0.18,0.15,0,g); rbox(0.03,0.08,0.38,f,-0.2,0.85,0,g,0.01,0.02).rotation.z=0.035;
  box(0.02,0.04,0.36,f,-0.198,0.62,0,g); for(let i=-1;i<=1;i++) box(0.015,0.17,0.04,f,-0.199,0.72,i*0.1,g);});
def('nordvikenChair',{n:'NORDVIKEN chair',q:'NORDVIKEN chair',cat:'chair',w:44,d:53,h:95,col:[['White',0xf3f2ee],['Black',0x262626]],seats:SEAT},function(g,c){
  const f=c.h; [-1,1].forEach(function(e){const z=e*0.18; rod(g,0.19,0,e*0.19,0.17,0.45,z,0.017,f,12,0.022); bar(g,-0.25,0,z,-0.2,0.9,z,0.035,0.035,f); rod(g,-0.21,0.2,z,0.18,0.2,z,0.01,f);});
  rod(g,0.18,0.2,-0.18,0.18,0.2,0.18,0.01,f); rbox(0.44,0.04,0.44,f,0,0.45,0,g,0.012,0.04); rbox(0.045,0.08,0.44,f,-0.205,0.9,0,g,0.015,0.02).rotation.z=0.05;
  for(let i=0;i<6;i++){const z=-0.125+i*0.05; rod(g,-0.18,0.47,z,-0.2,0.86,z,0.007,f);}});
def('krylbo',{n:'KRYLBO chair',q:'KRYLBO chair',cat:'chair',w:51,d:58,h:89,col:skin([['Tonerud dark beige',0xb7a58a]],WEAVE),seats:SEAT},function(g,c){
  const f=c.h; legs4(g,0.17,0.18,0.39,0.04,0.012,0x262626); rbox(0.5,0.09,0.48,f,0.03,0.43,0,g,0.04,0.08);
  rbox(0.1,0.46,0.32,f,-0.21,0.65,0,g,0.045,0.06).rotation.z=0.12; [-1,1].forEach(function(e){rbox(0.1,0.44,0.12,f,-0.185,0.64,e*0.17,g,0.045,0.05).rotation.set(0,e*0.4,0.12);});});
def('leifarne',{n:'LEIFARNE chair with armrests',q:'LEIFARNE chair',cat:'chair',w:52,d:50,h:80,
  col:[['Dark yellow, Broringe chrome',0xc9a034,CHR],['White, Broringe chrome',0xf3f3f0,CHR],['Dark yellow, Ernfrid birch',0xc9a034,BIRCH],['White, Ernfrid birch',0xf3f3f0,BIRCH]],seats:SEAT},function(g,c){
  const f=c.h; legs4(g,0.15,0.16,0.43,0.05,c.h2===CHR?0.011:0.016,c.h2); rbox(0.44,0.03,0.46,f,0.02,0.45,0,g,0.012,0.12);
  rbox(0.03,0.3,0.46,f,-0.21,0.63,0,g,0.012,0.08).rotation.z=0.16; [-1,1].forEach(function(e){const a=rbox(0.3,0.03,0.03,f,-0.05,0.6,e*0.23,g,0.012); a.rotation.z=-0.2; rbox(0.25,0.14,0.02,f,-0.07,0.53,e*0.225,g,0.008).rotation.z=-0.1;});});
def('norraryd',{n:'NORRARYD chair',q:'NORRARYD chair',cat:'chair',w:47,d:50,h:90,col:[['Black',0x262626],['White',0xf3f2ee]],seats:SEAT},function(g,c){
  const f=c.h; [-1,1].forEach(function(e){rod(g,0.2,0,e*0.2,0.17,0.45,e*0.175,0.018,f,12,0.016); rod(g,-0.22,0,e*0.2,-0.17,0.45,e*0.17,0.018,f,12,0.016); rod(g,-0.19,0.15,e*0.19,0.19,0.15,e*0.19,0.009,f);});
  cyl(0.22,0.035,f,0,0.455,0,g,32).scale.set(1,1,1.02); arc(g,0.24,0.016,2.1,f,0.05,0.86,0,2.6); arc(g,0.22,0.012,1.9,f,0.04,0.48,0);
  for(let i=0;i<7;i++){const a=R-0.84+i*0.28, x=0.05+Math.cos(a)*0.235, z=Math.sin(a)*0.235; rod(g,x+0.01,0.48,z*0.94,x,0.84,z,0.007,f);}});
def('bergmund',{n:'BERGMUND chair',q:'BERGMUND chair',cat:'chair',w:52,d:59,h:95,
  col:skin([['Kolboda beige/dark grey, black',0xd2c6af,0x262626],['Gunnared medium grey, black',0x7d7e80,0x262626],['Hallarp beige, oak',0xcbbfa6,OAK],['Inseros white, oak',0xe9e6de,OAK]],WEAVE),seats:SEAT},function(g,c){
  const f=c.h; [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){rod(g,q[0]*0.21,0,q[1]*0.21,q[0]*0.19,0.38,q[1]*0.2,0.016,c.h2,10,0.02);});
  rbox(0.52,0.1,0.5,f,0.02,0.43,0,g,0.04,0.06); rbox(0.08,0.5,0.5,f,-0.215,0.7,0,g,0.035,0.06).rotation.z=0.1;});
def('tobias',{n:'TOBIAS chair',q:'TOBIAS chair',cat:'chair',w:55,d:56,h:82,col:[['Transparent/chrome',0xdfe9ec,CHR],['Blue/chrome',0x5f87b8,CHR]],seats:SEAT},function(g,c){
  const f=c.h; legs4(g,0.16,0.18,0.44,0.07,0.011,c.h2); box(0.36,0.02,0.02,c.h2,0,0.44,-0.18,g); box(0.36,0.02,0.02,c.h2,0,0.44,0.18,g);
  glass(rbox(0.46,0.025,0.48,f,0.02,0.46,0,g,0.01,0.12),0.5);
  [-0.55,0,0.55].forEach(function(a){glass(rbox(0.022,0.34,a?0.17:0.26,f,0.08-0.3*Math.cos(a),0.64,0.3*Math.sin(a),g,0.01,0.01),0.5).rotation.set(0,a,0.16);});});
def('janinge',{n:'JANINGE chair',q:'JANINGE chair',cat:'chair',w:50,d:47,h:76,col:[['White',0xf3f3f0],['Grey',0x9a9b98],['Yellow',0xe0b337]],seats:SEAT},function(g,c){
  const f=c.h; [-1,1].forEach(function(e){const z=e*0.21; rod(g,0.19,0,e*0.22,0.17,0.64,z,0.016,f); rod(g,-0.2,0,e*0.22,-0.18,0.45,z,0.016,f); rod(g,-0.18,0.45,z,-0.21,0.72,z,0.016,f);
    rbox(0.39,0.025,0.04,f,-0.01,0.645,z,g,0.01);});
  rbox(0.42,0.035,0.42,f,0,0.45,0,g,0.012,0.05); rbox(0.03,0.18,0.42,f,-0.2,0.66,0,g,0.012,0.05).rotation.z=0.08;});
def('nilsove',{n:'NILSOVE chair, rattan/white',q:'NILSOVE chair',cat:'chair',w:52,d:57,h:80,col:[['Rattan/white',RATTAN,0xf3f3f0]],seats:SEAT},function(g,c){
  const f=c.h, fr=c.h2; legs4(g,0.18,0.2,0.42,0.05,0.011,fr); rbox(0.46,0.04,0.48,f,0.02,0.44,0,g,0.015,0.12);
  for(let i=0;i<5;i++){const a=-0.9+i*0.45; rbox(0.03,0.24,0.13,f,0.06-0.26*Math.cos(a),0.67,0.26*Math.sin(a),g,0.01,0.01).rotation.y=a;}
  arc(g,0.27,0.01,2.0,fr,0.06,0.795,0); [-1,1].forEach(function(e){rod(g,-0.17,0.44,e*0.16,-0.18,0.79,e*0.17,0.01,fr);});});

/* ======================= KIDS ======================= */
const tentTex={};
function stripes(hex){return tentTex[hex]||(tentTex[hex]=A.canvasTex(128,16,function(q){q.fillStyle='#f6f4ee'; q.fillRect(0,0,128,16); q.fillStyle='#'+('00000'+hex.toString(16)).slice(-6); for(let i=0;i<8;i++) q.fillRect(i*16,0,9,16);}));}
def('kura',{n:'KURA reversible bed with bed tent',q:'KURA reversible bed',cat:'kids',w:209,d:99,h:155,
  col:[['White/pine, blue-white tent',PAINT,0x3e6fa8],['White/pine, light green-white tent',PAINT,0x8fb59a],['White/pine, no tent',PAINT]],
  note:'99 × 209 × 116: turn it over for a low bed. With the bed tent on top it stands about 155 cm.',seats:[{id:'',label:'KURA, up top',lx:0,lz:0,y:0.95,type:'lie',dh:-R/2}]},function(g,c){
  const f=c.h; sqLegs(g,0.4725,1.0225,1.16,0.045,f);
  [[0.82,1.14],[0.03,0.33]].forEach(function(r,i){const h=r[1]-r[0], y=(r[0]+r[1])/2;
    box(0.02,h,2.0,PINE,-0.465,y,0,g); if(i) box(0.02,h,2.0,PINE,0.465,y,0,g); else box(0.02,h,1.4,PINE,0.465,y,-0.3,g);
    [-1,1].forEach(function(s){box(0.9,h,0.02,f,0,y,s*1.02,g);});});
  box(0.9,0.02,2.0,PINE,0,0.83,0,g); rbox(0.88,0.1,1.96,SHEET,0,0.89,0,g,0.04,0.06); rbox(0.3,0.08,0.45,0xf9f8f4,0,0.98,-0.72,g,0.04,0.1);
  [0.65,0.95].forEach(function(z){box(0.025,1.14,0.04,f,0.51,0.57,z,g);}); for(let i=0;i<4;i++) cyl(0.015,0.3,f,0.515,0.25+i*0.25,0.8,g,8).rotation.x=R/2;
  if(c.h2!=null){const mt=dbl(A.MT(stripes(c.h2),null,true)); halfTube(g,0.46,0.42,1.96,mt,0,1.13,0,-1); cyl(0.012,1.98,f,0,1.55,0,g,6).rotation.x=R/2;}});
function cotBars(g,f,x,z0,z1,y0,y1,n){for(let i=0;i<n;i++) cyl(0.011,y1-y0,f,x,(y0+y1)/2,z0+(z1-z0)*(i+0.5)/n,g,8);}
def('sundvikCot',{n:'SUNDVIK cot, 60 × 120',q:'SUNDVIK cot',cat:'kids',w:125,d:66,h:86,col:[['White',PAINT]].concat(skin([['Grey-brown',0x8a7d70]],WOOD))},function(g,c){
  const f=c.h; [-1,1].forEach(function(s){const z=s*0.61; [-1,1].forEach(function(e){box(0.045,0.86,0.045,f,e*0.305,0.43,z,g); sph(0.026,f,e*0.305,0.86,z,g);}); box(0.57,0.62,0.022,f,0,0.5,z,g); box(0.57,0.05,0.04,f,0,0.83,z,g);
    box(0.035,0.035,1.18,f,s*0.31,0.8,0,g); box(0.035,0.05,1.18,f,s*0.31,0.24,0,g); cotBars(g,f,s*0.31,-0.58,0.58,0.265,0.785,13);});
  box(0.6,0.02,1.18,f,0,0.29,0,g); rbox(0.58,0.09,1.17,SHEET,0,0.345,0,g,0.03,0.05);});
def('sundvikBed',{n:'SUNDVIK extendable bed, 80 × 200',q:'SUNDVIK extendable bed',cat:'kids',w:207,d:85,h:86,col:[['White',PAINT]].concat(skin([['Grey-brown',0x8a7d70]],WOOD)),
  note:'Pulls out from 137 to 207 cm as the child grows; shown full length.',seats:[{id:'',label:'SUNDVIK bed',lx:0,lz:0,y:0.43,type:'lie',dh:-R/2}]},function(g,c){
  const f=c.h; [[-1,0.86],[1,0.72]].forEach(function(q){const z=q[0]*1.01; [-1,1].forEach(function(e){box(0.045,q[1],0.045,f,e*0.4,q[1]/2,z,g); sph(0.026,f,e*0.4,q[1],z,g);}); box(0.76,q[1]-0.22,0.022,f,0,q[1]/2+0.06,z,g);
    box(0.76,0.05,0.04,f,0,q[1]-0.03,z,g);});
  [-1,1].forEach(function(s){box(0.03,0.12,1.98,f,s*0.4,0.32,0,g); box(0.034,0.09,0.8,sh(f,0.95),s*0.403,0.32,0.55,g);});
  box(0.78,0.02,1.98,PINE,0,0.29,0,g); rbox(0.78,0.12,1.96,SHEET,0,0.36,0,g,0.04,0.06); rbox(0.36,0.08,0.4,0xf9f8f4,0,0.45,-0.75,g,0.04,0.1);});
def('sniglar',{n:'SNIGLAR cot, beech, 60 × 120',q:'SNIGLAR cot',cat:'kids',w:124,d:66,h:81,col:skin([['Beech',BEECH]],WOOD)},function(g,c){
  const f=c.h; [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){box(0.04,0.81,0.04,f,q[0]*0.31,0.405,q[1]*0.6,g);});
  [-1,1].forEach(function(s){box(0.03,0.03,1.16,f,s*0.31,0.79,0,g); box(0.03,0.05,1.16,f,s*0.31,0.22,0,g); cotBars(g,f,s*0.31,-0.58,0.58,0.245,0.775,12);
    box(0.58,0.03,0.03,f,0,0.79,s*0.6,g); box(0.58,0.05,0.03,f,0,0.22,s*0.6,g); for(let i=0;i<5;i++) cyl(0.011,0.53,f,-0.24+i*0.12,0.51,s*0.6,g,8);});
  box(0.6,0.02,1.16,f,0,0.27,0,g); rbox(0.58,0.09,1.16,SHEET,0,0.325,0,g,0.03,0.05);});
const PAD=0xbcd3dd; skin([['',PAD]],WEAVE);
def('smagora',{n:'SMÅGÖRA changing table / bookshelf',q:'SMÅGÖRA changing table',cat:'kids',w:79,d:55,h:102,col:[['White',PAINT]]},function(g,c){
  const f=c.h; sqLegs(g,0.255,0.375,1.02,0.04,f); box(0.55,0.02,0.79,f,0,0.9,0,g); box(0.02,0.12,0.79,f,-0.265,0.96,0,g); [-1,1].forEach(function(s){box(0.55,0.12,0.02,f,0,0.96,s*0.385,g);});
  rbox(0.5,0.07,0.72,PAD,0.0,0.945,0,g,0.03,0.06); [0.12,0.5].forEach(function(y){box(0.51,0.02,0.71,f,0,y,0,g);}); box(0.01,0.8,0.71,f,-0.27,0.5,0,g);
  const b=K.dec(g,'basket'); box(0.3,0.2,0.3,RATTAN,0.05,0.23,-0.18,b); box(0.3,0.2,0.3,RATTAN,0.05,0.23,0.18,b);});
def('flisatTable',{n:'FLISAT children\'s table',q:'FLISAT children\'s table',cat:'kids',w:83,d:58,h:48,col:skin([['Pine',PINE]],WOOD),note:'The top lifts off; two bins slide in underneath and a paper roll hangs at one end.'},function(g,c){
  const f=c.h; sqLegs(g,0.25,0.37,0.455,0.045,f); box(0.58,0.025,0.83,f,0,0.4675,0,g); box(0.5,0.1,0.02,f,0,0.4,-0.37,g); box(0.5,0.1,0.02,f,0,0.4,0.37,g); box(0.02,0.1,0.72,f,-0.25,0.4,0,g);
  [-0.18,0.18].forEach(function(z){box(0.44,0.09,0.32,0xf3f3f0,0.02,0.4,z,g);}); cyl(0.012,0.46,f,0,0.42,-0.4,g,8).rotation.z=R/2; cyl(0.045,0.4,SHEET,0,0.38,-0.405,g,16).rotation.z=R/2;});
def('flisatStool',{n:'FLISAT children\'s stool',q:'FLISAT children\'s stool',cat:'kids',w:32,d:28,h:30,col:skin([['Pine',PINE]],WOOD)},function(g,c){
  const f=c.h; [-1,1].forEach(function(s){box(0.28,0.28,0.02,f,0,0.14,s*0.15,g); box(0.1,0.035,0.024,sh(f,0.55),0,0.22,s*0.15,g);}); box(0.28,0.02,0.32,f,0,0.29,0,g); box(0.02,0.08,0.28,f,-0.1,0.2,0,g);});
const MAM=[['White',0xf3f3f0],['Light pink',0xf2b8c6],['Blue',0x3d6fb6],['Green',0x6aa84f],['Red',0xd04537]];
def('mammutTable',{n:'MAMMUT children\'s table',q:'MAMMUT children\'s table',cat:'kids',w:77,d:55,h:48,col:MAM},function(g,c){
  const f=c.h; rbox(0.55,0.05,0.77,f,0,0.455,0,g,0.02,0.1); [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){rod(g,q[0]*0.23,0,q[1]*0.33,q[0]*0.19,0.44,q[1]*0.29,0.04,f,14,0.032);});});
def('mammutChair',{n:'MAMMUT children\'s chair',q:'MAMMUT children\'s chair',cat:'kids',w:39,d:36,h:67,col:MAM},function(g,c){
  const f=c.h; [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){rod(g,q[0]*0.15,0,q[1]*0.17,q[0]*0.12,0.29,q[1]*0.14,0.032,f,14,0.026);});
  rbox(0.33,0.04,0.34,f,0,0.3,0,g,0.015,0.06); [-1,1].forEach(function(e){bar(g,-0.13,0.3,e*0.14,-0.16,0.6,e*0.15,0.04,0.04,f);});
  rbox(0.04,0.17,0.36,f,-0.155,0.58,0,g,0.015,0.03).rotation.z=0.1; box(0.045,0.04,0.12,sh(f,0.45),-0.155,0.62,0,g).rotation.z=0.1;});
const SMS=[['White',PAINT,PAINT],['White, pale pink',0xf0d4d3,PAINT],['White, grey-turquoise',0x8fb5b4,PAINT]];
function hole(g,x,y,z){cyl(0.022,0.004,0x3b3b3b,x,y,z,g,16).rotation.z=R/2;}
def('smastadWard',{n:'SMÅSTAD wardrobe, 60',q:'SMÅSTAD wardrobe',cat:'kids',w:60,d:57,h:181,col:SMS},function(g,c){
  const f=c.h, fr=c.h2; box(0.55,1.71,0.6,fr,-0.01,0.955,0,g); box(0.02,0.1,0.56,fr,0.24,0.05,0,g);
  front(g,0.265,1.2,0,1.2,0.596,f); hole(g,0.284,1.2,0.24); [0.6,0.35].forEach(function(y){front(g,0.265,y-0.005,0,0.24,0.596,f); hole(g,0.284,y+0.06,0);});});
def('smastadBench',{n:'SMÅSTAD bench with toy storage',q:'SMÅSTAD bench with toy storage',cat:'kids',w:90,d:52,h:48,col:SMS,
  seats:[{id:'A',label:'Bench, left',lx:0.02,lz:-0.22,y:0.48,type:'sit'},{id:'B',label:'Bench, right',lx:0.02,lz:0.22,y:0.48,type:'sit'}]},function(g,c){
  const f=c.h, fr=c.h2; [-1,1].forEach(function(s){box(0.5,0.44,0.02,fr,-0.01,0.22,s*0.44,g);}); box(0.02,0.44,0.86,fr,-0.25,0.22,0,g); box(0.5,0.02,0.86,fr,-0.01,0.02,0,g); box(0.5,0.42,0.02,fr,-0.01,0.23,0,g);
  rbox(0.52,0.04,0.9,fr,0,0.46,0,g,0.012,0.02); [-0.22,0.22].forEach(function(z){box(0.44,0.36,0.4,f,0.01,0.21,z,g); hole(g,0.231,0.32,z);});});
def('playTent',{n:'Play tent',q:'children\'s play tent',cat:'kids',w:120,d:120,h:162,col:[['White',0xf4f2ec]].concat(skin([['Beige',0xd9cbb0],['Light blue',BLUE],['Pale pink',0xf0d4d3]],WEAVE))},function(g,c){
  const f=c.h, s=G(g); taper(g,0,0,1.45,1.1,0.03,f); [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(q){rod(g,q[0]*0.57,0,q[1]*0.57,-q[0]*0.05,1.62,-q[1]*0.05,0.012,BIRCH);});
  s.position.set(0.555,0,0); s.rotation.z=Math.atan2(0.55,1.45); const sp=new THREE.Shape(); sp.moveTo(-0.27,0); sp.lineTo(0.27,0); sp.lineTo(0,0.95); sp.lineTo(-0.27,0);
  const d=new THREE.Mesh(new THREE.ShapeGeometry(sp),dbl(A.M(sh(f,0.35)))); d.rotation.y=R/2; d.position.x=0.004; s.add(d);
  K.cushion(g,0xe6ddcd,-0.2,0.18,0.2,1,0.35); rbox(0.9,0.04,0.9,sh(f,0.92),0,0.02,0,g,0.015,0.1);});

/* ======================= BALCONY ======================= */
const AP=skin([['Brown stained',ACACIA]],WOOD).concat(skin([['Brown stained, Frösön beige cushions',ACACIA,0xd8cbb0],['Brown stained, Frösön dark grey cushions',ACACIA,0x55585b],['Brown stained, Frösön blue cushions',ACACIA,0x3d5a7a]],WEAVE));
def('applaroTable',{n:'ÄPPLARÖ table, outdoor',q:'ÄPPLARÖ table outdoor',cat:'out',w:140,d:78,h:72,col:AP.slice(0,1)},function(g,c){
  const f=c.h; slats(g,f,-0.39,0.39,-0.7,0.7,0.72,8,0.024); box(0.7,0.07,0.04,f,0,0.665,-0.6,g); box(0.7,0.07,0.04,f,0,0.665,0.6,g); box(0.04,0.07,1.24,f,-0.33,0.665,0,g); box(0.04,0.07,1.24,f,0.33,0.665,0,g);
  sqLegs(g,0.33,0.6,0.7,0.05,f); box(0.04,0.04,1.2,f,0,0.2,0,g); [-1,1].forEach(function(s){box(0.62,0.04,0.04,f,0,0.2,s*0.6,g);});});
/* ÄPPLARÖ chair and bench: slatted seat, reclined slatted back, flat armrests, cushions when c.h2 */
function applaro(g,c,W){
  const f=c.h, hw=W/2-0.03;
  [-1,1].forEach(function(e){const z=e*hw; box(0.045,0.62,0.045,f,0.24,0.31,z,g); bar(g,-0.22,0,z,-0.29,0.86,z,0.045,0.045,f); box(0.5,0.05,0.03,f,0,0.4,z,g); box(0.58,0.025,0.075,f,0.0,0.645,z,g);});
  if(W>0.8) bar(g,-0.22,0,0,-0.29,0.86,0,0.04,0.04,f);
  slats(g,f,-0.23,0.23,-hw+0.02,hw-0.02,0.44,5,0.022); box(0.03,0.05,2*hw,f,0.22,0.4,0,g);
  const b=G(g); b.position.set(-0.24,0.44,0); b.rotation.z=0.24; for(let i=0;i<5;i++) box(0.02,0.06,2*hw-0.02,f,-0.01,0.08+i*0.08,0,b);
  if(c.h2!=null){const n=W>0.8?2:1; for(let i=0;i<n;i++){const z=n>1?(i-0.5)*hw:0, w=2*hw/n-0.03; rbox(0.46,0.06,w,c.h2,0.0,0.475,z,g,0.025,0.04); rbox(0.06,0.38,w,c.h2,0.04,0.25,z,b,0.025,0.04);}}}
def('applaroChair',{n:'ÄPPLARÖ chair with armrests, outdoor',q:'ÄPPLARÖ chair with armrests',cat:'out',w:56,d:60,h:86,col:AP,seats:[{id:'',lx:0.03,lz:0,y:0.47,type:'sit',recline:0.12}]},function(g,c){applaro(g,c,0.56);});
def('applaroBench',{n:'ÄPPLARÖ bench with backrest, outdoor',q:'ÄPPLARÖ bench with backrest',cat:'out',w:119,d:60,h:86,col:AP,
  seats:[{id:'A',label:'Bench, left',lx:0.03,lz:-0.27,y:0.47,type:'sit',recline:0.12},{id:'B',label:'Bench, right',lx:0.03,lz:0.27,y:0.47,type:'sit',recline:0.12}]},function(g,c){applaro(g,c,1.19);});
def('tarnoTable',{n:'TÄRNÖ table, outdoor',q:'TÄRNÖ table',cat:'out',w:55,d:54,h:70,col:[['Black, light brown stained',BLACK,ACACIA_L]]},function(g,c){
  const f=c.h; slats(g,c.h2,-0.27,0.27,-0.275,0.275,0.7,6,0.018);
  [-1,1].forEach(function(s){const z=s*0.25; box(0.52,0.025,0.02,f,0,0.67,z,g); barXY(box(1,0.022,0.018,f,0,0,z,g),-0.24,0,0.2,0.67); barXY(box(1,0.022,0.018,f,0,0,z,g),0.24,0,-0.2,0.67); cyl(0.012,0.03,f,0,0.335,z,g,8).rotation.x=R/2;});
  box(0.02,0.02,0.5,f,0.215,0.06,0,g); box(0.02,0.02,0.5,f,-0.215,0.06,0,g);});
/* a folding chair: back posts to the floor, front legs crossing under the seat, slatted seat and back */
function folding(g,f,s,W){const hw=W/2;
  [-1,1].forEach(function(e){const z=e*hw; rod(g,-0.2,0,z,-0.16,0.79,z,0.011,f); rod(g,0.22,0,z*0.96,-0.13,0.44,z*0.96,0.011,f); box(0.36,0.02,0.02,f,0.02,0.425,z*0.92,g);});
  slats(g,s,-0.15,0.2,-hw+0.01,hw-0.01,0.45,5,0.02); [0.6,0.68,0.76].forEach(function(y){box(0.02,0.06,2*hw,s,-0.17+(y-0.6)*0.05,y,0,g);}); rod(g,0.2,0.05,-hw,0.2,0.05,hw,0.009,f);}
def('tarnoChair',{n:'TÄRNÖ chair, foldable, outdoor',q:'TÄRNÖ chair',cat:'out',w:39,d:44,h:79,col:[['Black, light brown stained',BLACK,ACACIA_L]],seats:[{id:'',lx:0.03,lz:0,y:0.46,type:'sit'}]},function(g,c){folding(g,c.h,c.h2,0.37);});
const ASK=skin([['Dark brown',0x4a3426],['Grey-brown stained',ACACIA_G],['Light brown stained',ACACIA_L]],WOOD);
def('askholmenChair',{n:'ASKHOLMEN chair, foldable, outdoor',q:'ASKHOLMEN chair',cat:'out',w:45,d:44,h:79,col:ASK,seats:[{id:'',lx:0.03,lz:0,y:0.46,type:'sit'}]},function(g,c){
  const f=c.h; [-1,1].forEach(function(e){const z=e*0.2; bar(g,-0.2,0,z,-0.16,0.79,z,0.03,0.025,f); bar(g,0.22,0,z*0.92,-0.13,0.44,z*0.92,0.03,0.022,f);});
  slats(g,f,-0.15,0.2,-0.19,0.19,0.46,5,0.02); box(0.36,0.03,0.02,f,0.02,0.43,-0.18,g); box(0.36,0.03,0.02,f,0.02,0.43,0.18,g);
  [0.62,0.7].forEach(function(y){box(0.02,0.07,0.38,f,-0.17+(y-0.6)*0.05,y,0,g);}); box(0.025,0.025,0.4,f,0.2,0.08,0,g);});
def('askholmenWall',{n:'ASKHOLMEN wall-mounted folding table',q:'ASKHOLMEN table for wall',cat:'out',place:'wall',y:0.4,w:70,d:44,h:33,col:ASK,note:'Folds flat against the wall; hang it so the top is at about 73 cm.'},function(g,c){
  const f=c.h; box(0.02,0.3,0.7,f,-0.21,0.15,0,g); slats(g,f,-0.2,0.22,-0.35,0.35,0.33,5,0.022);
  [-1,1].forEach(function(s){box(0.4,0.03,0.025,f,0.01,0.295,s*0.32,g); barXY(box(1,0.025,0.022,f,0,0,s*0.28,g),-0.2,0.03,0.1,0.29);});});
def('nammaro',{n:'NÄMMARÖ sun lounger, light brown stained',q:'NÄMMARÖ sun lounger',cat:'out',w:63,d:196,h:80,
  col:skin([['Light brown stained',ACACIA_L]],WOOD).concat(skin([['Light brown stained, Frösön beige cushion',ACACIA_L,0xd8cbb0],['Light brown stained, Frösön blue cushion',ACACIA_L,0x3d5a7a]],WEAVE)),
  seats:[{id:'',label:'Sun lounger',lx:0.15,lz:0,y:0.4,type:'lie',dh:0}]},function(g,c){
  const f=c.h; [-1,1].forEach(function(s){const z=s*0.29; box(1.9,0.08,0.035,f,0,0.27,z,g); box(0.045,0.25,0.045,f,0.85,0.125,z,g); castor(g,-0.85,s*0.33,0.06,0x2b2b2b);
    bar(g,-0.5,0.3,s*0.25,-0.62,0.52,s*0.25,0.03,0.025,f);});
  box(0.04,0.04,0.58,f,-0.85,0.12,0,g); slats(g,f,-0.3,0.95,-0.27,0.27,0.335,12,0.022);
  const b=G(g); b.position.set(-0.3,0.335,0); b.rotation.z=-0.75; slats(b,f,-0.68,0,-0.27,0.27,0,8,0.022); box(0.68,0.04,0.03,f,-0.34,-0.04,-0.26,b); box(0.68,0.04,0.03,f,-0.34,-0.04,0.26,b);
  if(c.h2!=null){rbox(1.22,0.05,0.56,c.h2,0.33,0.36,0,g,0.02,0.05); rbox(0.66,0.05,0.56,c.h2,-0.34,0.025,0,b,0.02,0.05);}});
def('solleron',{n:'SOLLERÖN armchair, outdoor',q:'SOLLERÖN armchair outdoor',cat:'out',w:82,d:82,h:84,
  col:skin([['Dark grey, Frösön/Duvholmen beige',0x4b4c4e,0xd8cbb0],['Dark grey, Frösön/Duvholmen dark grey',0x4b4c4e,0x6a6c6e],['Dark grey, Frösön/Duvholmen blue',0x4b4c4e,0x3d5a7a]],A.surfaces.rattan),
  seats:[{id:'',lx:0.06,lz:0,y:0.5,type:'sit',recline:0.12}]},function(g,c){
  const f=c.h; sqLegs(g,0.36,0.36,0.03,0.05,0x2b2b2b); rbox(0.8,0.36,0.82,f,0,0.21,0,g,0.03,0.04);
  [-1,1].forEach(function(s){rbox(0.7,0.24,0.12,f,0.05,0.5,s*0.35,g,0.03,0.04);}); rbox(0.13,0.44,0.82,f,-0.335,0.6,0,g,0.03,0.04);
  rbox(0.6,0.12,0.58,c.h2,0.06,0.44,0,g,0.04,0.06); rbox(0.15,0.38,0.56,c.h2,-0.22,0.66,0,g,0.06,0.08).rotation.z=0.15;});
def('tostero',{n:'TOSTERÖ storage box, outdoor',q:'TOSTERÖ storage box',cat:'out',w:129,d:44,h:79,col:[['Black',0x2b2b2b]],note:'Keeps the cushions dry; the lid lifts at the front.'},function(g,c){
  const f=c.h; rbox(0.42,0.72,1.27,f,0,0.39,0,g,0.02,0.02); rbox(0.44,0.05,1.29,sh(f,1.2),0,0.765,0,g,0.015,0.02);
  for(let i=-5;i<=5;i++) box(0.006,0.56,0.02,sh(f,0.75),0.212,0.4,i*0.1,g); [-1,1].forEach(function(s){box(0.12,0.03,0.02,sh(f,0.6),0,0.62,s*0.64,g); box(0.38,0.03,0.05,sh(f,0.85),0,0.015,s*0.55,g);});});
def('runnen',{n:'RUNNEN floor decking, 9 tiles',q:'RUNNEN floor decking',cat:'out',flat:true,lh:0.25,w:90,d:90,h:1,
  col:skin([['Brown stained',0x7a5234],['Grey',0x8f8c86]],WOOD).concat(skin([['Artificial grass',0x5f9a3c]],WEAVE)),note:'0.81 m²: nine 30 × 30 cm tiles that click together. Add packs to cover the balcony.'},function(g,c){
  for(let i=0;i<3;i++) for(let j=0;j<3;j++){const x=-0.3+i*0.3, z=-0.3+j*0.3;
    if(c.h===0x5f9a3c){box(0.296,0.016,0.296,c.h,x,0.008,z,g).castShadow=false; continue;}
    for(let k=0;k<4;k++){const o=-0.111+k*0.074, m=(i+j)%2?box(0.296,0.016,0.066,c.h,x,0.008,z+o,g):box(0.066,0.016,0.296,c.h,x+o,0.008,z,g); m.castShadow=false;}}});
def('plantStand',{n:'Plant stand with herbs',q:'plant stand',cat:'out',w:60,d:46,h:95,col:[['Black',0x262626],['White',PAINT]]},function(g,c){
  const f=c.h; [-1,1].forEach(function(s){const z=s*0.29; bar(g,0.19,0,z,-0.15,0.8,z,0.02,0.015,f); rod(g,-0.18,0,z,-0.16,0.8,z,0.008,f);});
  [[0.25,0.08],[0.52,-0.03],[0.78,-0.14]].forEach(function(q,i){box(0.12,0.015,0.6,f,q[1],q[0],0,g);
    [-0.17,0.02,0.19].forEach(function(z,j){if((i+j)%3===2&&i) return; K.bush(g,q[1],q[0]+0.008,z,0.05,[0xb5673f,0xf2f1ec,0x8a9a86][(i+j)%3]);});});});
def('solvinden',{n:'SOLVINDEN LED solar-powered lantern',q:'SOLVINDEN LED solar lantern',cat:'out',place:'top',w:20,d:20,h:32,col:[['White',PAINT],['Black',0x262626]]},function(g,c,o){
  const f=c.h; cyl(0.09,0.03,f,0,0.015,0,g,20); glass(cyl(0.08,0.2,0xe6eef0,0,0.13,0,g,20),0.3); [0,1,2,3].forEach(function(i){const a=i*R/2+R/4; cyl(0.006,0.2,f,Math.cos(a)*0.083,0.13,Math.sin(a)*0.083,g,6);});
  cyl(0.06,0.11,A.lampMat(o.ch,0xf4f1e8,0xffd28a,1.1),0,0.12,0,g,16); cyl(0.1,0.03,f,0,0.245,0,g,20,0.07); box(0.08,0.006,0.08,0x1d2733,0,0.262,0,g);
  torus(0.05,0.006,f,0,0.265,0,g,R); A.pool(o.ch,0xffc47a,0,0.012,0,0.35,g,0.45);});
})();
