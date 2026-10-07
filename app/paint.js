/* Haroe 10 — any colour on anything in Edit mode: every part of a piece or of the decor, the flat's own fittings (room by
   room, by colour, or one part at a time), and the walls, floor and ceiling of each room. The colours live with the
   design's other edits (EDITS[d].paint), so Undo, Save, Reset and the share link carry them too.
   Keys:  o|<thing>|<colour>   one colour of a piece or a decoration (thing = p:<piece id>, a:<item uid>, k:<decor key>)
          r|<room>|<colour>    that colour on the flat's own fittings in a room;    m|<part>   one fitting
          w|<room>  f|<room>  c|<room>   the walls, the floor, the ceiling of a room
          x|<room>  k|<room>   the tiles on its walls; its skirting and door frames
   A value is a colour, or {h:colour,t:'wood'|'stone'} for a floor laid in another material. */
(function(){
'use strict';
const A=window.APP, S=A.state, P=A.pieces, scene=A.scene;
const INSIDE={living:1,kitchen:1,bed1:1,bed2:1,bath:1,wc:1};
const TEX={wood:A.surfaces.wood,stone:A.surfaces.stone}, SURF=new Set(Object.keys(A.surfaces).map(function(k){return A.surfaces[k];}));
const esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});};
const css=function(c){return '#'+('000000'+(c>>>0).toString(16)).slice(-6);};
const hx=function(c){return (c>>>0).toString(16);};

/* ---------- the colours on offer ---------- */
const PAINT=[['White',0xf4f3ee],['Off-white',0xece6da],['Beige',0xd6c7ab],['Light grey',0xc3c3bf],['Grey',0x8e8e8a],['Dark grey',0x4c4e51],['Black',0x232323],
  ['Birch',0xd9bf8c],['Oak',0xc99a5b],['Walnut',0x6b4630],['Sage',0x93a891],['Olive',0x7b8a60],['Dark green',0x2f4a3c],['Grey-turquoise',0x5d7c79],
  ['Light blue',0x9fc4d6],['Grey-blue',0x8fa3b8],['Navy',0x2e3a52],['Lilac',0xc9bfd8],['Blush',0xe2b8ad],['Terracotta',0xb5673f],['Rust',0x9a3a2f],
  ['Mustard',0xd8a63b],['Yellow',0xe8c91a],['Red',0xc23b2e],['Brass',0xb5924c],['Chrome',0xc9cdd0]];
const WALLS=[['Warm white',0xf1ece0],['Greige',0xd9d2c3],['Sand',0xe2d3b8],['Sage',0xb9c6ad],['Eucalyptus',0x9fb5a3],['Powder blue',0xc5d5df],['Dusty blue',0x8fa3b8],
  ['Lilac',0xcdc3d6],['Clay pink',0xdcb3a5],['Terracotta',0xd29a7a],['Ochre',0xd8b56a],['Olive',0x8d9468],['Forest',0x3e5a4a],['Navy',0x34405a],['Charcoal',0x4c4e51]];
const FLOORS=[['Light oak',{h:0xe3c79c,t:'wood'}],['Oak',{h:0xc99a5b,t:'wood'}],['Smoked oak',{h:0x8a6a48,t:'wood'}],['Walnut',{h:0x6b4630,t:'wood'}],
  ['White-washed wood',{h:0xeee6d8,t:'wood'}],['Concrete',{h:0xbdbab3,t:'stone'}],['Terrazzo',{h:0xebe7df,t:'stone'}],
  ['Warm tiles',{h:0xf6e6cf}],['Terracotta tiles',{h:0xe9a37e}],['Sage tiles',{h:0xc9d6c0}],['Dark tiles',{h:0x6a6d70}]];
const LISTS={p:PAINT,w:WALLS,f:FLOORS};

/* ---------- what can be painted ---------- */
function regIndex(){const idx=new Map(); for(const r in A.rooms){const ms=A.rooms[r].mats; for(let i=0;i<ms.length;i++) idx.set(ms[i].m,{e:ms[i],room:r});} return idx;}
function paintable(o){
  if(!o.isMesh||o.userData.hl||Array.isArray(o.material)) return false;
  const m=o.material; if(!m||!m.color||m.blending===THREE.AdditiveBlending) return false;
  return !m.map||SURF.has(m.map)||!!o.userData.floor;           // leave pictures, screens and book spines alone
}
function origOf(o,idx){if(o.userData.p0!=null) return o.userData.p0; const q=idx.get(o.material); return q?q.e.b.getHex():o.material.color.getHex();}
/* the meshes of one piece or decoration, without the things standing on it or kept in it */
function meshesOf(root){
  const out=[];
  (function walk(o){if(paintable(o)) out.push(o); for(let i=0;i<o.children.length;i++){const c=o.children[i]; if(c.userData.uid||c.userData.decor||c.userData.hl) continue; walk(c);}})(root);
  return out;
}
function thingKey(t){return t.k==='piece'?'p:'+t.id:t.k==='att'?'a:'+t.uid:t.key?'k:'+t.key:null;}
function thingOf(k){
  const E=A.ed, id=k.slice(2);
  if(k[0]==='p') return P[id]?P[id].g:null;
  if(k[0]==='a') return E.att[id]?E.att[id].g:null;
  if(id[1]==='#') return E.houseThings().find(function(o){return o.userData.bkey===id;})||null;
  const pid=id.slice(0,id.indexOf(':')); return P[pid]?E.bakedOf(P[pid]).find(function(o){return o.userData.bkey===id;})||null:null;
}
/* the flat's own fittings: everything built with the house that is not a wall, a floor, a ceiling, a piece or decor */
const ZERO=new THREE.Vector3(), r1=function(v){return Math.round(v*100);};
function houseIdx(idx){
  const house={byRoom:{},byKey:{}};                             // rebuilt each time: cheap, and never stale
  const shells=new Set(A.shells);
  (function walk(o){for(let i=0;i<o.children.length;i++){const c=o.children[i], u=c.userData;
    if(u.piece||u.uid||u.decor||u.shop||u.hl||u.wallKey) continue;
    if(c.isMesh&&!u.floor&&!shells.has(c)&&paintable(c)){const q=idx.get(c.material);
      if(q&&INSIDE[q.room]){const pp=c.parent&&c.parent!==scene?c.parent.position:ZERO;    // keyed where it is built, so doors that swing keep their key
        const k=q.room+'@'+r1(pp.x+c.position.x)+','+r1(pp.y+c.position.y)+','+r1(pp.z+c.position.z)+'/'+c.geometry.attributes.position.count;
        u.pkey=k; u.proom=q.room; house.byKey[k]=c; (house.byRoom[q.room]||(house.byRoom[q.room]=[])).push(c);}}
    walk(c);}})(scene);
  return house;
}
function wallsOf(room){const out=[]; for(const k in A.walls){const w=A.walls[k]; if(w.room===room&&w.g.children[0]) out.push(w.g.children[0]);} return out;}
/* what hangs flat on a wall besides its paint: tiles (drawn with a texture), and skirting and door frames (plain) */
function onWalls(room,tiles){const out=[]; for(const k in A.walls){const w=A.walls[k]; if(w.room!==room) continue;
  for(let i=1;i<w.g.children.length;i++){const c=w.g.children[i]; if(c.isMesh&&c.material&&!Array.isArray(c.material)&&!!c.material.map===tiles) out.push(c);}} return out;}
function floorsOf(room,idx){return scene.children.filter(function(c){const q=c.isMesh&&c.userData.floor&&idx.get(c.material); return q&&q.room===room;});}
function ceilsOf(room,idx){return A.shells.filter(function(c){const q=c.parent===scene&&idx.get(c.material); return q&&q.room===room;});}

/* ---------- putting the colours on: undo the last pass, then paint everything the design asks for ---------- */
let done=[];
function setVal(m,e,v){const h=typeof v==='number'?v:v.h; if(e) e.b.setHex(h); else m.color.setHex(h);
  const t=v&&v.t&&TEX[v.t]; if(t&&m.map!==t){m.map=t; m.needsUpdate=true;}}
function apply(){
  for(let i=0;i<done.length;i++){const d=done[i];
    d.meshes.forEach(function(o){delete o.userData.p0;});
    if(d.clone){d.meshes[0].material=d.orig; const ms=A.rooms[d.room]&&A.rooms[d.room].mats; if(ms){const j=ms.indexOf(d.ce); if(j>=0) ms.splice(j,1);} d.clone.dispose();}
    else{if(d.e) d.e.b.setHex(d.b); else d.m.color.setHex(d.b); if(d.m.map!==d.map){d.m.map=d.map; d.m.needsUpdate=true;}}}
  done=[];
  const pt=(A.EDITS[S.design]||{}).paint;
  if(pt&&Object.keys(pt).length){
    const idx=regIndex(), want=new Map(), byThing={}, byRoom={}, one=[];
    for(const k in pt){const v=pt[k], s=k.split('|');
      if(s[0]==='o') (byThing[s[1]]||(byThing[s[1]]={}))[s[2]]=v;
      else if(s[0]==='r') (byRoom[s[1]]||(byRoom[s[1]]={}))[s[2]]=v;
      else if(s[0]==='m') one.push([s[1],v]);
      else (s[0]==='w'?wallsOf(s[1]):s[0]==='f'?floorsOf(s[1],idx):s[0]==='c'?ceilsOf(s[1],idx):s[0]==='x'?onWalls(s[1],true):s[0]==='k'?onWalls(s[1],false):[]).forEach(function(o){want.set(o,v);});}
    for(const k in byThing){const g=thingOf(k); if(g) meshesOf(g).forEach(function(o){const v=byThing[k][hx(origOf(o,idx))]; if(v!=null) want.set(o,v);});}
    if(one.length||Object.keys(byRoom).length){const h=houseIdx(idx);
      for(const r in byRoom) (h.byRoom[r]||[]).forEach(function(o){const v=byRoom[r][hx(origOf(o,idx))]; if(v!=null) want.set(o,v);});
      one.forEach(function(q){const o=h.byKey[q[0]]; if(o) want.set(o,q[1]);});}
    // a material only this paint uses is recoloured where it is; one shared with things left as they are gets a copy
    const groups=new Map(); want.forEach(function(v,o){const g=groups.get(o.material); if(g) g.push(o); else groups.set(o.material,[o]);});
    const users=new Map(); groups.forEach(function(g,m){users.set(m,0);});
    scene.traverse(function(o){if(o.isMesh&&users.has(o.material)) users.set(o.material,users.get(o.material)+1);});
    groups.forEach(function(list,m){
      const q=idx.get(m), b=q?q.e.b.getHex():m.color.getHex(), v0=want.get(list[0]);
      list.forEach(function(o){o.userData.p0=b;});
      if(list.length===users.get(m)&&list.every(function(o){return JSON.stringify(want.get(o))===JSON.stringify(v0);})){done.push({m:m,e:q&&q.e,b:b,map:m.map,meshes:list}); setVal(m,q&&q.e,v0); return;}
      list.forEach(function(o){
        const c=m.clone(); let ce=null;
        if(q){A.reg(c,q.room); const ms=A.rooms[q.room].mats; ce=ms[ms.length-1]; ce.b.setHex(b); if(q.e.e) ce.e=q.e.e.clone(); else delete ce.e; if(q.e.keep) ce.keep=true;}
        o.material=c; setVal(c,ce,want.get(o)); done.push({clone:c,orig:m,room:q&&q.room,ce:ce,meshes:[o]});});
    });
  }
  A.dirty=true; if(A.touch) A.touch(3);
}

/* ---------- the sheet ---------- */
const pick={thing:null,hex:null,scope:'room'};
function paintMap(){return (A.EDITS[S.design]||{}).paint||{};}
function areaOf(o){const g=o.geometry; if(!g.boundingBox) g.computeBoundingBox(); const s=g.boundingBox.getSize(new THREE.Vector3()); return 2*(s.x*s.y+s.y*s.z+s.z*s.x)+1e-6;}
function partsOf(root){
  const idx=regIndex(), by={};
  meshesOf(root).forEach(function(o){const h=origOf(o,idx), k=hx(h); const p=by[k]||(by[k]={h:h,area:0,meshes:[]}); p.area+=areaOf(o); p.meshes.push(o);});
  return Object.keys(by).map(function(k){return by[k];}).sort(function(a,b){return b.area-a.area;}).slice(0,8);
}
function valOf(v){return v==null?null:typeof v==='number'?v:v.h;}
function swatches(list,l,cur,act,key){
  const dk=key?' data-key="'+esc(key)+'"':'';
  return list.map(function(c,i){const h=valOf(c[1]), w=c[1].t==='wood', st=c[1].t==='stone';
    const bg=w?'repeating-linear-gradient(90deg,'+css(h)+' 0 7px,'+css(A.shade(h,0.86))+' 7px 8px)':st?'radial-gradient(circle at 30% 30%,'+css(A.shade(h,0.9))+' 0 2px,'+css(h)+' 3px)':css(h);
    return '<button class="swc" data-a="'+act+'"'+dk+' data-l="'+l+'" data-i="'+i+'" title="'+esc(c[0])+'" aria-label="'+esc(c[0])+'" aria-pressed="'+(cur!=null&&JSON.stringify(cur)===JSON.stringify(c[1]))+'" style="background:'+bg+'"></button>';}).join('')+
    '<label class="swc pick" title="Any colour you like" aria-label="Any colour you like"><input type="color" data-a="ptPick"'+dk+' value="'+css(valOf(cur)==null?0xffffff:valOf(cur))+'"></label>';
}
/* a piece, an item or a decoration: its colours, biggest first; the one you tapped is picked */
function thingSection(t,root,hit){
  const k=thingKey(t); if(!k||!root) return '';
  const parts=partsOf(root); if(!parts.length) return '';
  const tapped=hit&&parts.find(function(p){return p.meshes.indexOf(hit)>=0;});
  if(pick.thing!==k||!parts.some(function(p){return p.h===pick.hex;})){pick.thing=k; pick.hex=(tapped||parts[0]).h;}
  const pm=paintMap(), cur=pm['o|'+k+'|'+hx(pick.hex)], any=Object.keys(pm).some(function(q){return q.indexOf('o|'+k+'|')===0;});
  let h='<h4>Any colour <span>'+(parts.length>1?'pick a part, then a colour':'')+'</span></h4>';
  if(parts.length>1) h+='<div class="edRow pchips">'+parts.map(function(p,i){const now=pm['o|'+k+'|'+hx(p.h)];
    return '<button class="chip" data-a="ptPart" data-h="'+hx(p.h)+'" aria-pressed="'+(p.h===pick.hex)+'"><i style="background:'+css(now!=null?valOf(now):p.h)+'"></i>'+(i===0?'Main part':'Part '+(i+1))+(p===tapped?' ·':'')+'</button>';}).join('')+'</div>';
  h+='<div class="sws">'+swatches(PAINT,'p',cur,'ptSet')+'</div>';
  if(any) h+='<button class="btn" data-a="ptClear" style="margin-top:10px">Original colours</button>';
  return h;
}
/* one of the flat's own fittings: that colour everywhere in the room, the unit it belongs to (the parts of that colour
   touching it, so base and wall cupboards can differ), or this part alone */
function scopeOf(t){
  const idx=regIndex(), h0=origOf(t.obj,idx), same=(houseIdx(idx).byRoom[t.room]||[]).filter(function(o){return origOf(o,idx)===h0;});
  const bb=new Map(); same.forEach(function(o){bb.set(o,new THREE.Box3().setFromObject(o).expandByScalar(0.02));});
  const unit=[t.obj], seen=new Set(unit);
  for(let i=0;i<unit.length;i++) same.forEach(function(o){if(!seen.has(o)&&bb.get(o).intersectsBox(bb.get(unit[i]))){seen.add(o); unit.push(o);}});
  const sc=pick.scope==='unit'&&(unit.length<2||unit.length>=same.length)?(unit.length<2?'one':'room'):same.length<2?'one':pick.scope;
  return {h0:h0,same:same,unit:unit,scope:sc,rk:'r|'+t.room+'|'+hx(h0)};
}
const mk=function(o){return 'm|'+o.userData.pkey;};
function partSheet(t){
  const s=scopeOf(t), rn=(A.rooms[t.room]&&A.rooms[t.room].name||'room').toLowerCase(), pm=paintMap();
  const cur=s.scope==='room'?pm[s.rk]:(pm[t.key]!=null?pm[t.key]:pm[s.rk]);
  const chip=function(sc,label){return '<button class="chip" data-a="ptScope" data-s="'+sc+'" aria-pressed="'+(s.scope===sc)+'">'+label+'</button>';};
  let h='<h4>Colour</h4>';
  if(s.same.length>1) h+='<div class="edRow">'+chip('room','All '+s.same.length+' parts this colour in the '+esc(rn))+
    (s.unit.length>1&&s.unit.length<s.same.length?chip('unit','This unit ('+s.unit.length+' parts)'):'')+chip('one','Just this part')+'</div>';
  h+='<div class="sws">'+swatches(PAINT,'p',cur,'ptSet')+'</div>';
  if(pm[s.rk]!=null||s.same.some(function(o){return pm[mk(o)]!=null;})) h+='<button class="btn" data-a="ptClear" style="margin-top:10px">Original colour</button>';
  if(A.ed.selHit()&&A.ed.selHit().n.y>0.7) h+='<button class="btn wide" data-a="ptOn">Put something on it</button>';
  h+='<p class="note">Part of the flat as it is. A colour you pick here stays with this design; Undo takes it back.</p>';
  return h;
}
/* the wall, floor or ceiling you tapped, at the top of the Add sheet */
let lastHit=null;           // the tap that led to the Add sheet, to tell tiles and skirting from the paint
function surfaceSection(s){
  const room=s.kind==='wall'?A.walls[s.wall].room:A.ed.roomAt(s.point.x,s.point.z); if(!room||!INSIDE[room]) return '';
  const kind=s.kind==='wall'?'w':s.kind==='floor'?'f':s.kind==='ceil'?'c':null; if(!kind) return '';
  const rn=(A.rooms[room].name||'').toLowerCase(), pm=paintMap();
  const row=function(title,k,list,l,reset){const cur=pm[k]; return '<h4>'+title+' <span>'+esc(rn)+'</span></h4><div class="sws">'+swatches(list,l,cur,'ptSet',k)+'</div>'+
    (cur!=null?'<button class="btn" data-a="ptClear" data-key="'+k+'" style="margin-top:10px">'+reset+'</button>':'');};
  let h='';
  const o=kind==='w'&&lastHit&&lastHit.point===s.point?lastHit.o:null, w=A.walls[s.wall];
  if(o&&w&&o.parent===w.g&&o!==w.g.children[0]&&o.material&&!Array.isArray(o.material))
    h+=o.material.map?row('Tiles','x|'+room,PAINT,'p','Tiles as they are'):row('Skirting and door frames','k|'+room,PAINT,'p','As they are');
  h+=kind==='w'?row('Paint the walls','w|'+room,WALLS,'w','As it is'):kind==='f'?row('Floor','f|'+room,FLOORS,'f','Floor as it is'):row('Ceiling colour','c|'+room,WALLS,'w','As it is');
  return h+'<h4>Add here</h4>';
}
/* which key a click is about */
function keysFor(el){
  if(el&&el.dataset.key) return {set:[el.dataset.key]};
  const t=A.ed.sel(); if(!t) return null;
  if(t.k==='part'){const s=scopeOf(t), every=s.same.map(mk).concat([s.rk]);
    return s.scope==='room'?{set:[s.rk],drop:s.same.map(mk),clear:every}:s.scope==='unit'?{set:s.unit.map(mk),clear:s.unit.map(mk)}:{set:[t.key]};}
  const k=thingKey(t); return k?{set:['o|'+k+'|'+hx(pick.hex)],prefix:'o|'+k+'|'}:null;
}
function write(fn){A.ed.snap(); const e=A.ed.E(S.design), pm=e.paint||(e.paint={}); fn(pm); if(!Object.keys(pm).length) delete e.paint; A.ed.changed(); A.ed.reopen();}
function setTo(v,el){const k=keysFor(el); if(!k) return; write(function(pm){(k.drop||[]).forEach(function(q){delete pm[q];}); k.set.forEach(function(q){pm[q]=v;});});}
function click(b){
  const a=b.dataset.a;
  if(a==='ptPart'){pick.hex=parseInt(b.dataset.h,16); A.ed.reopen(); return;}
  if(a==='ptScope'){pick.scope=b.dataset.s; A.ed.reopen(); return;}
  if(a==='ptOn'){const h=A.ed.selHit(); A.ed.openAdd({kind:'top',point:h.point.clone(),pieceId:null}); return;}
  if(a==='ptSet'){const c=LISTS[b.dataset.l][+b.dataset.i]; setTo(c[1],b); return;}
  if(a==='ptClear'){const k=keysFor(b); if(!k) return; write(function(pm){if(k.prefix) Object.keys(pm).forEach(function(q){if(q.indexOf(k.prefix)===0) delete pm[q];}); else (k.clear||k.set).forEach(function(q){delete pm[q];});}); return;}
}
/* the colour picker reports when it closes, not as a click */
document.getElementById('edSheet').addEventListener('change',function(e){
  if(e.target.dataset.a!=='ptPick') return; const v=parseInt(e.target.value.slice(1),16), k=keysFor(e.target);
  if(k&&k.set[0][0]==='f') setTo({h:v},e.target); else setTo(v,e.target);
});
/* what a tap on the flat's own fittings picks */
function partOf(c){
  lastHit=c;
  if(!c||c.wall||c.item||c.decor||c.pieceId||c.shopObj||c.o.userData.floor) return null;
  const h=houseIdx(regIndex()), o=c.o; if(!o.userData.pkey||h.byKey[o.userData.pkey]!==o) return null;
  return {k:'part',obj:o,room:o.userData.proom,key:'m|'+o.userData.pkey};
}
function clearThing(t){const k=thingKey(t), e=A.EDITS[S.design]; if(!k||!e||!e.paint) return; Object.keys(e.paint).forEach(function(q){if(q.indexOf('o|'+k+'|')===0) delete e.paint[q];}); if(!Object.keys(e.paint).length) delete e.paint;}

A.paint={apply:apply,click:click,partOf:partOf,partSheet:partSheet,thingSection:thingSection,surfaceSection:surfaceSection,clearThing:clearThing,lists:LISTS};
setTimeout(apply,0);
})();
