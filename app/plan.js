/* Haroe 10 — the floor plan of the building, from the architect's drawing of a typical floor: six flats round the stairwell. Ours is
   flat 5, at the front on the west; flat 4 is behind it, flat 3 behind the landing, flats 2 and 1 along the back and the east end, and
   flat 6 at the front, east of ours, standing out four metres toward the street: its front is the one in the photos of the walk in,
   flush with the doorway, and its west side is the wing you see to the right out of our kitchen window. The doorway is at the end of a
   short passage between flat 6 and number 12 that leads in to the hall.
   The drawing was laid over our flat (the jog in the wall between the bedrooms, the toilet, the bathroom and the front door all fall where
   the tape put them) to bring it into the model's frame: x out from the back toward the street, z from the west wall east. Where a flat
   meets the lobby, its walls are taken from the lobby as the photos have it.
   Each flat is a set of rooms, each a rectangle [x0,x1,z0,z1]; walls, doorways and windows are worked out from how the rooms touch: between
   two rooms of a flat an inner wall, a doorway in it on the way from the front door; against another flat or the stairwell a party wall;
   anywhere else the outside, with windows. */
(function(){
'use strict';
const A=window.APP;
const FLATS={
  1:{rooms:[['bed1a','Bedroom','bed',-8.35,-5.3,18.05,23.0],['bath1','Bathroom','bath',-5.2,-3.05,18.05,21.0],['hall1','Entrance','hall',-5.2,-0.4,21.1,23.0],
      ['wc1','Toilet','wc',-2.95,-0.4,23.1,24.2],['living1','Living room','living',-3.0,0.2,18.05,21.0],['kitchen1','Kitchen','kitchen',0.4,3.7,18.95,21.0],['bed1b','Bedroom','bed',-0.3,3.7,21.1,24.2]],
     door:{0:['hall1','z+',-4.0,-3.15],up:['kitchen1','z-',1.6,2.46]}},      // on our floor from outside, on the east; upstairs off the hall over the entrance
  2:{rooms:[['bed2a','Bedroom','bed',-8.35,-4.65,15.4,17.9],['bed2b','Bedroom','bed',-8.35,-4.65,13.25,15.3],['bath2','Bathroom','bath',-4.55,-2.75,13.25,14.5],
      ['kitchen2','Kitchen','kitchen',-4.55,-2.75,14.6,17.9],['living2','Living room','living',-2.65,0.2,13.25,17.9]],
     door:{all:['living2','x+',15.73,16.59]}},      // off the corridor, as in the photos
  3:{rooms:[['bath3','Bathroom','bath',-5.9,-4.5,4.35,6.4],['wc3','Toilet','wc',-5.9,-4.5,6.5,8.7],['hall3','Corridor','hall',-4.4,-3.2,4.35,8.7],['entry3','Entrance','hall',-3.1,-1.95,6.7,8.7],
      ['bed3a','Bedroom','bed',-5.9,-3.6,8.8,10.9],['bed3b','Bedroom','bed',-5.9,-3.6,11.0,13.05],['living3','Living room','living',-3.5,0.2,8.8,11.0],['kitchen3','Kitchen','kitchen',-3.5,0.2,11.1,13.05]],
     door:{all:['entry3','x+',6.96,7.82]}},      // on the landing's back wall
  4:{rooms:[['bed4','Bedroom','bed',-3.9,-0.12,-3.45,-0.45],['living4','Living room','living',-3.9,-0.12,-0.35,3.05],['kitchen4','Kitchen','kitchen',-3.9,-2.25,3.15,4.3],
      ['bath4','Bathroom','bath',-2.15,-0.12,3.15,4.3],['hall4','Entrance','hall',-3.0,-0.12,4.4,6.5]],
     door:{all:['hall4','z+',-1.23,-0.37]}},      // beside ours, a little in front of it
  6:{rooms:[['bath6','Bathroom','bath',5.3,6.3,6.5,7.65],['wc6','Toilet','wc',5.3,6.3,7.75,8.95],['bed6b','Bedroom','bed',6.4,9.25,6.5,9.0],['hall6','Entrance','hall',2.65,6.1,9.05,11.6],
      ['kitchen6','Kitchen','kitchen',6.2,9.25,9.1,10.9],['living6','Living room','living',6.2,9.25,11.0,14.95],['bed6a','Bedroom','bed',2.65,6.1,11.7,14.85],['study6','Study','bed',5.3,9.25,15.05,17.2]],
     door:{all:['hall6','x-',9.9,10.76]}}      // off the corridor's other side, where it meets the stairwell
};
/* the street front: flat 6's face, and the doorway's */
const FRONT=Math.max.apply(null,FLATS[6].rooms.map(function(q){return q[4];}));
/* the common parts: the landing, the stairwell, the corridor, the hall over the entrance, and the passage from the doorway to the hall */
const CORE=[[-1.85,1.25,6.61,8.71],[1.15,5.14,6.41,8.96],[0.3,2.55,8.71,15.21],[0.3,5.24,14.91,18.81],[5.14,FRONT,17.2,18.81]];
/* our own flat, as the model has it */
const OURS=[];
function ours(){if(!OURS.length) ['living','kitchen','bed1','bed2','bath','wc'].forEach(function(k){(A.rooms[k]&&A.rooms[k].rs||[]).forEach(function(r){OURS.push(r);});}); return OURS;}
function inRect(r,x,z,pad){pad=pad||0; return x>r[0]-pad&&x<r[1]+pad&&z>r[2]-pad&&z<r[3]+pad;}
/* what stands at x,z: a flat's room, the stairwell, our flat, or nothing (the outside) */
function whatAt(x,z){
  for(const n in FLATS){const rs=FLATS[n].rooms; for(let i=0;i<rs.length;i++){const q=rs[i]; if(inRect([q[3],q[4],q[5],q[6]],x,z)) return {flat:+n,room:q[0]};}}
  for(let i=0;i<CORE.length;i++) if(inRect(CORE[i],x,z)) return {core:true};
  const o=ours(); for(let i=0;i<o.length;i++) if(inRect(o[i],x,z,0.05)) return {flat:5};
  return null;}
/* a flat's walls: every room edge, cut where another room of the flat lies against it (an inner wall) and sorted into party and outside walls */
const cache={};
function analyse(n){
  if(cache[n]) return cache[n];
  const F=FLATS[n], rs=F.rooms.map(function(q){return {id:q[0],name:q[1],type:q[2],r:[q[3],q[4],q[5],q[6]]};}), edges=[], inner=[], T=0.3;
  rs.forEach(function(a,ia){const r=a.r;
    [['x',r[0],r[2],r[3],-1],['x',r[1],r[2],r[3],1],['z',r[2],r[0],r[1],-1],['z',r[3],r[0],r[1],1]].forEach(function(e){
      const axis=e[0], c=e[1], out=e[4]; let spans=[[e[2],e[3]]];
      rs.forEach(function(b,ib){if(ib===ia) return; const q=b.r, cB=axis==='x'?(out>0?q[0]:q[1]):(out>0?q[2]:q[3]), gap=(cB-c)*out; if(gap<-0.02||gap>T) return;
        const s0=axis==='x'?q[2]:q[0], s1=axis==='x'?q[3]:q[1], next=[];
        spans.forEach(function(s){const o0=Math.max(s[0],s0), o1=Math.min(s[1],s1); if(o1-o0<0.05){next.push(s); return;}
          if(ia<ib) inner.push({a:ia,b:ib,axis:axis,c:c+gap/2*out,s0:o0,s1:o1});
          if(o0>s[0]) next.push([s[0],o0]); if(o1<s[1]) next.push([o1,s[1]]);});
        spans=next;});
      spans.forEach(function(s){if(s[1]-s[0]<0.05) return; const m=(s[0]+s[1])/2, px=axis==='x'?c+out*0.45:m, pz=axis==='x'?m:c+out*0.45, w=whatAt(px,pz);
        edges.push({room:ia,axis:axis,c:c,s0:s[0],s1:s[1],out:out,kind:w?'party':'out'});});});});
  /* the doorways: from the front door's room outward, a door into each room the first time it is reached; a kitchen and a living room open
     into each other */
  const seen={}, q=[], door=function(k){return F.door[k]||F.door.all;};
  const start=rs.findIndex(function(a){return a.id===(door(0)||door('up'))[0];}); seen[start]=1; q.push(start);
  inner.forEach(function(w){w.open=null;});
  while(q.length){const i=q.shift(); inner.forEach(function(w){const j=w.a===i?w.b:w.b===i?w.a:-1; if(j<0||seen[j]||w.s1-w.s0<0.9) return; seen[j]=1; q.push(j);
    const ta=rs[w.a].type, tb=rs[w.b].type, wide=(ta==='living'&&tb==='kitchen')||(tb==='living'&&ta==='kitchen')||(ta==='living'&&tb==='living')||(ta==='hall'&&tb==='hall');
    const len=w.s1-w.s0, dw=wide?Math.min(1.8,len-0.3):0.86, m=(w.s0+w.s1)/2; w.open=[m-dw/2,m+dw/2,wide?2.3:2.05];});}
  rs.forEach(function(a,i){if(seen[i]) return; const w=inner.find(function(w){return w.a===i||w.b===i;}); if(w){const m=(w.s0+w.s1)/2; w.open=[m-0.43,m+0.43,2.05];}});      // anything left over: a door to its neighbour
  return cache[n]={rooms:rs,edges:edges,inner:inner};
}
/* where the front door is, on floor lvl: the room, the side it is in, and its span */
function doorOf(n,lvl){const d=FLATS[n].door; return lvl===0?(d[0]||d.all):(d.up||d.all);}
A.PLAN={flats:FLATS,core:CORE,front:FRONT,whatAt:whatAt,analyse:analyse,doorOf:doorOf,numbers:function(f){return [1,2,3,4,5,6].map(function(k){return f*6+k;});}};      // the flats are numbered 1 to 6 on our floor, 7 to 12 on the next, and so on
})();
