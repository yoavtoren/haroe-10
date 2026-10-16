/* Haroe 10 — out on the street, in Sims mode: the people out here are people you can talk to (or rob), the café serves you, a scooter
   in the alley is yours to ride, the road is yours to walk and the cars stop for you. And it looks the part: everyone stands on a soft
   shadow of their own, the sun's shadows come with you wherever you go, and there is a sky. */
(function(){
'use strict';
const A=window.APP, R=Math.PI, S=A.street, SL=A.streetLife;
if(!S||!SL||!A.sims) return;
const st=S.st, U=S.U, KZ=S.KZ, RW=S.RW, D8=S.D8, scene=A.scene, SM=A.sims;
const OUT=function(){return A.LAYER_OUT||5;};
const wv=new THREE.Vector3(), lv=new THREE.Vector3();
function toWorld(x,z,y){return st.localToWorld(wv.set(x,y||0,z)).clone();}
function toLocal(x,z){return st.worldToLocal(lv.set(x,0,z)).clone();}
const say=function(text){if(SM.toast) SM.toast(text);};

/* ---------- soft shadows under everyone out here ---------- */
const blobTex=A.canvasTex(64,64,function(g){const r=g.createRadialGradient(32,32,2,32,32,31); r.addColorStop(0,'rgba(0,0,0,0.55)'); r.addColorStop(0.6,'rgba(0,0,0,0.25)'); r.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=r; g.fillRect(0,0,64,64);});
const blobMat=new THREE.MeshBasicMaterial({map:blobTex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetUnits:-4});
function blob(parent,w,d,y){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),blobMat); m.rotation.x=-R/2; m.position.y=y==null?0.012:y; m.renderOrder=1; m.userData.nc=true; m.layers.set(OUT()); parent.add(m); return m;}
SL.folk.forEach(function(f){if(f.kind!=='ride') blob(f.p.g,0.75,0.75);});
SL.traffic.forEach(function(v){blob(v.g,v.len+0.5,v.len>3?2.1:0.9,-0.0);});
if(SL.dog) blob(SL.dog.g,0.6,0.85); if(SL.cat) blob(SL.cat.g,0.35,0.55);
SL.pigeons.forEach(function(b){blob(b.g,0.22,0.26);});

/* ---------- a sky: deep blue overhead, pale at the horizon, warm at dusk; drawn only with the outside ---------- */
const skyG=new THREE.SphereGeometry(85,32,16), skyC=new Float32Array(skyG.attributes.position.count*3);
skyG.setAttribute('color',new THREE.BufferAttribute(skyC,3));
const sky=new THREE.Mesh(skyG,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide,depthWrite:false,fog:false}));
sky.renderOrder=-10; sky.frustumCulled=false; sky.userData.nc=true; sky.userData.live=true; sky.layers.set(OUT()); scene.add(sky);
const dayTop=new THREE.Color(0x5f8fc9), dayHor=new THREE.Color(0xdfe9ef), eveTop=new THREE.Color(0x12192e), eveHor=new THREE.Color(0xd98a5a), cT=new THREE.Color(), cH=new THREE.Color(), cc=new THREE.Color();
let skyDay=-1, skyV=-2;
function paintSky(){const d=A.get?A.get('day'):1, v=A.skyVer&&A.simsOn?A.skyVer():-1; if(Math.abs(d-skyDay)<0.01&&v===skyV) return; skyDay=d; skyV=v;
  if(v>=0) A.skyColors(cT,cH); else{cT.copy(eveTop).lerp(dayTop,d); cH.copy(eveHor).lerp(dayHor,d);}      // the colours of the hour from gta-fx.js's clock, in Sims mode
  const P=skyG.attributes.position; for(let i=0;i<P.count;i++){const t=Math.max(0,P.getY(i)/85); cc.copy(cH).lerp(cT,Math.pow(t,0.6)); if(P.getY(i)<0) cc.copy(cH).multiplyScalar(0.92); skyC[i*3]=cc.r; skyC[i*3+1]=cc.g; skyC[i*3+2]=cc.b;}
  skyG.attributes.color.needsUpdate=true;}

/* ---------- clouds: a high thin layer drifting slowly over, tinted by the evening ---------- */
const cloudT=(function(){const S=256, c=document.createElement('canvas'); c.width=c.height=S; const g=c.getContext('2d'), im=g.createImageData(S,S), d=im.data, r=A.rng(808);
  const oct=function(n,seed){const q=A.rng(seed), v=new Float32Array(n*n); for(let i=0;i<v.length;i++) v[i]=q(); return function(x,y){const fx=x/S*n, fy=y/S*n, x0=Math.floor(fx), y0=Math.floor(fy), tx=fx-x0, ty=fy-y0, sx=tx*tx*(3-2*tx), sy=ty*ty*(3-2*ty), a=function(i,j){return v[((j+n)%n)*n+((i+n)%n)];};
    return (a(x0,y0)*(1-sx)+a(x0+1,y0)*sx)*(1-sy)+(a(x0,y0+1)*(1-sx)+a(x0+1,y0+1)*sx)*sy;};}, o1=oct(4,1), o2=oct(8,2), o3=oct(16,3), o4=oct(32,4);
  for(let y=0;y<S;y++) for(let x=0;x<S;x++){const v=0.5*o1(x,y)+0.25*o2(x,y)+0.15*o3(x,y)+0.1*o4(x,y), a=Math.max(0,Math.min(1,(v-0.5)*3.2)), i=(y*S+x)*4; d[i]=d[i+1]=d[i+2]=255-Math.round(a*30); d[i+3]=Math.round(a*220);}
  g.putImageData(im,0,0); const t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; return t;})();
const cloudM=new THREE.MeshBasicMaterial({map:cloudT,transparent:true,depthWrite:false,fog:false,opacity:0.85});
const drift={value:new THREE.Vector2()};
cloudM.onBeforeCompile=function(sh){sh.uniforms.uDrift=drift; sh.fragmentShader='uniform vec2 uDrift;\n'+sh.fragmentShader.replace('#include <map_fragment>','vec4 texelColor=texture2D(map,vUv*3.0+uDrift); diffuseColor*=texelColor; diffuseColor.a*=smoothstep(0.5,0.16,length(vUv-0.5));');};      // drifting; thinning out toward the horizon
const clouds=new THREE.Mesh(new THREE.PlaneGeometry(700,700).rotateX(R/2),cloudM); clouds.renderOrder=-9; clouds.frustumCulled=false; clouds.userData.nc=true; clouds.userData.live=true; clouds.layers.set(OUT()); scene.add(clouds);
const cDay=new THREE.Color(0xffffff), cEve=new THREE.Color(0xd9a07a), cNight=new THREE.Color(0x2a3040);
A.frameFns.push(function(dt){const c=A.camera.position; clouds.position.set(c.x,c.y+70,c.z); drift.value.x+=dt*0.0048; drift.value.y+=dt*0.002;
  const d=A.get?A.get('day'):1; cloudM.color.copy(d>0.5?cEve.clone().lerp(cDay,(d-0.5)*2):cNight.clone().lerp(cEve,d*2)); clouds.visible=sky.visible!==false;});

/* ---------- the sun's shadows come with you when you are out of the flat ---------- */
const sunHome={pos:A.sun.position.clone(),tgt:A.sun.target.position.clone()}, sunAt=new THREE.Vector3(1e9,0,0);
let sunOut=false; const dirWas=new THREE.Vector3();
/* out in the neighbourhood, or driving, the shadows reach farther: the blocks' shade lies across the streets */
const SC=A.sun.shadow.camera, SC0={l:SC.left,r:SC.right,t:SC.top,b:SC.bottom,f:SC.far};
let wide=null;
function shadowBox(w){if(w===wide) return; wide=w; const s=w?34:SC0.r; SC.left=-s; SC.right=s; SC.top=s; SC.bottom=-s; SC.far=w?150:SC0.f; SC.updateProjectionMatrix(); A.touch(3);}
function followSun(p){
  const out=A.simsOn&&p&&(p.lvl!==0||['living','kitchen','bed1','bed2','bath','wc'].indexOf(p.room)<0)&&$hide('pClimate');
  const drv=A.drive&&A.drive.on(), far=out&&p.lvl===0&&(drv||Math.hypot(p.x-(A.LB.XF-11),p.z-(A.LB.ZC+5))>45);
  if(out){const dir=A.sunDir?A.sunDir.clone():sunHome.pos.clone().sub(sunHome.tgt).normalize(); shadowBox(far);      // where the clock (gta-fx.js) has the sun
    if(!sunOut||!dir.equals(dirWas)){sunOut=true; sunAt.set(1e9,0,0); dirWas.copy(dir);}
    const y=p.p.g.position.y, step=far?(drv?6:3):1.2; if(Math.hypot(p.x-sunAt.x,p.z-sunAt.z)>step||Math.abs(y-sunAt.y)>1){sunAt.set(p.x,y,p.z); A.sun.target.position.copy(sunAt); A.sun.position.copy(sunAt).addScaledVector(dir,far?80:18); A.sun.target.updateMatrixWorld(); A.touch(3);}}
  else if(sunOut){sunOut=false; shadowBox(false); A.sun.position.copy(sunHome.pos); A.sun.target.position.copy(sunHome.tgt); A.sun.target.updateMatrixWorld(); A.touch(3);}
}
function $hide(id){const e=document.getElementById(id); return !e||e.hidden;}

/* ---------- the people: who is close, and what you can say to them ---------- */
function bubble(f,text,sec){if(f.bub) f.bub.el.remove(); f.bub={el:A.tag(text,'say'),until:A.t+(sec||2.6)}; f.p.talk=Math.min(2.2,0.5+text.length*0.07);}
const HELLO=['Hi!','Shalom!','Hey there.','Good afternoon!','Boker tov!'], NICE=['Thanks! It is from Dizengoff.','Oh, you are sweet.','Ha, thank you!','Really? I almost did not wear it.'];
const RUDE=['Hey! Watch where you are going!','Excuse YOU.','Are you blind?','Nu, really?'], THIEF=['Hey! My wallet! Thief!','Police! He took my wallet!','Stop! Thief!'];
function worldOf(f){if(f.kind==='walk') return toWorld(f.x,f.z,f.y); const q=f.p.g.position; return toWorld(q.x,q.z,q.y);}
function stopToTalk(f,p,sec){if(f.kind==='walk'){f.wait=Math.max(f.wait,sec||4); const l=toLocal(p.x,p.z); f.p.g.rotation.y=Math.atan2(l.x-f.x,l.z-f.z); f.p.walking=false;}}
const G=function(){return A.floors&&A.floors.G;};
function addLoot(v){const g=G(); if(!g) return; g.loot+=v; if(A.floors.drawHud) A.floors.drawHud();}
function act(f,kind){
  const p=SM.player; if(!p) return; stopToTalk(f,p,kind==='rob'?3:5);
  if(kind==='hi'){p.say('Hi!',1.4); SM.later(0.9,function(){bubble(f,HELLO[Math.floor(Math.random()*HELLO.length)]);});}
  else if(kind==='time'){p.say('Sorry, do you have the time?',2); SM.later(1.4,function(){const d=new Date(); bubble(f,'It is '+d.getHours()+':'+('0'+d.getMinutes()).slice(-2)+'.');});}
  else if(kind==='nice'){p.say(['Nice shirt!','Love your shoes!','Cute dog!'][f===SL.folk.find(function(x){return x.dog;})?2:Math.floor(Math.random()*2)],1.8); SM.later(1.3,function(){bubble(f,NICE[Math.floor(Math.random()*NICE.length)]);});}
  else if(kind==='bump'){const w=worldOf(f); p.goTo(w.x,w.z,function(){SM.later(0.1,function(){bubble(f,RUDE[Math.floor(Math.random()*RUDE.length)],2.2); f.p.act='wave'; SM.later(1.2,function(){f.p.act=null;});});});}
  else if(kind==='rob'){const w=worldOf(f), hb=f.p.g.rotation.y+R/2;      // from behind
    p.goTo(w.x-Math.sin(hb)*0.55,w.z-Math.cos(hb)*0.55,function(){p.p.act='reachlow'; SM.later(1.1,function(){p.p.act=null;
      if(Math.random()<0.65){const v=20+Math.floor(Math.random()*240); addLoot(v); say('Got it: a wallet with ₪ '+v+'. They did not notice.'); if(A.floors&&A.floors.coin) A.floors.coin();}
      else{bubble(f,THIEF[Math.floor(Math.random()*THIEF.length)],2.6); f.wait=6; if(A.floors) A.floors.raise(1);}});});}
}

/* ---------- the café: order at the glass front, sit at a free chair ---------- */
const seats=S.seats.map(function(q,i){const w=toWorld(q[0],q[1]); return {id:'cafe'+i,label:'Café chair',x:w.x,z:w.z,y:0.47+U,h:q[2]+R/2,type:'sit',room:'street'};});
function freeSeat(s){return !s.occ&&!SL.folk.some(function(f){if(f.kind!=='sit') return false; const q=f.p.g.position, w=toWorld(q.x,q.z); return Math.hypot(w.x-s.x,w.z-s.z)<0.3;});}
const counter=toWorld(0.55,12.6+D8);
let coffees=0;
function order(){
  const p=SM.player, bar=SL.folk.find(function(f){return f.kind==='work';}); SM.stop(); SM.setDoing('ordering a coffee');
  p.goTo(counter.x,counter.z,function(){p.say('One cappuccino, please.',1.8);
    SM.later(1.6,function(){if(bar) bubble(bar,['Coming right up!','Oat or regular?','Sure, sit wherever you like.'][coffees%3],2.4);});
    SM.later(4.2,function(){const g=G(); if(g&&g.loot>=14){g.loot-=14; say('₪ 14. Paid from what you had on you.');} else say('₪ 14, on the card.');
      if(A.floors&&A.floors.drawHud) A.floors.drawHud(); coffees++; p.p.act='drink'; SM.setDoing('drinking a cappuccino'); SM.later(5,function(){p.p.act=null; SM.setDoing('');});});});
}

/* ---------- a scooter in the alley, yours to ride ---------- */
const scoot=det_solid(), park=toWorld(2.75,S.AL+2.2,S.AY);
function det_solid(){if(!A.det) return null; const g=A.det.solid(A.det.moto('scooter',{color:0x8fd3c0,plate:'51-907',lean:0}),'street'); g.rotation.y=0; const h=new THREE.Group(); g.rotation.y=R/2; h.add(g); h.userData.nc=true; scene.add(h); h.traverse(function(m){m.layers.set(OUT());}); return h;}
let riding=false, engine=null;
if(scoot){scoot.position.copy(park); scoot.rotation.y=0; blob(scoot,0.8,1.9,0.012);}
function engineOn(on){
  let c=null; try{c=engine&&engine.c||new (window.AudioContext||window.webkitAudioContext)();}catch(e){return;}
  if(on&&!engine){const o=c.createOscillator(), g=c.createGain(), fl=c.createBiquadFilter(); o.type='sawtooth'; o.frequency.value=55; fl.type='lowpass'; fl.frequency.value=420; g.gain.value=0.0001; o.connect(fl).connect(g).connect(c.destination); o.start(); engine={c:c,o:o,g:g};}
  if(!on&&engine){const e=engine; engine=null; e.g.gain.setTargetAtTime(0.0001,e.c.currentTime,0.2); setTimeout(function(){try{e.o.stop(); e.c.close();}catch(x){}},800);}
}
function mount(){
  const p=SM.player; SM.stop(); SM.setDoing('');
  p.goTo(scoot.position.x+0.6,scoot.position.z,function(){riding=true; p.riding=true; p.speed=4.6; p.p.seatY=0.62; p.p.sitT=1; p.p.act='carry2'; engineOn(true); say('Vroom. Tap anywhere on the street to ride there.');});
}
function dismount(msg){const p=SM.player; riding=false; p.riding=false; p.speed=1.4; p.p.sitT=0; p.p.act=null; engineOn(false); if(msg) say(msg);}

/* ---------- what the bar by things offers out here ---------- */
const prev=A.moreItems;
A.moreItems=function(out,p){
  if(prev) prev(out,p);
  if(p.lvl) return;
  if(riding){out.push({name:'Scooter',x:p.x,z:p.z,y:1.0,sx:p.x,sz:p.z,h:p.h,acts:[['Get off',function(){dismount('You park the scooter.');}]]}); return;}
  SL.folk.forEach(function(f){if(f.kind==='ride') return; const w=worldOf(f); if(Math.hypot(w.x-p.x,w.z-p.z)>3.2) return; if(!f.p.g.visible) return;
    const name=f.kind==='work'?'Barista':f.kind==='sit'?'At the café':f.dog?'Man with a dog':'Passer-by';
    const acts=f.kind==='work'?[['Order a coffee',order]]:[['Say hi',function(){act(f,'hi');}],['Ask the time',function(){act(f,'time');}],['Compliment',function(){act(f,'nice');}],['Bump into',function(){act(f,'bump');}],['Pick their pocket',function(){act(f,'rob');}]];
    out.push({name:name,x:w.x,z:w.z,y:w.y+1.1,sx:w.x+Math.sin(p.h)*-0.9,sz:w.z+Math.cos(p.h)*-0.9,h:p.h,acts:acts});});
  if(Math.hypot(counter.x-p.x,counter.z-p.z)<3) out.push({name:'Café',x:counter.x,z:counter.z,y:1.2,sx:counter.x,sz:counter.z,h:-R/2,acts:[['Order a coffee',order]]});
  if(p.seat&&String(p.seat.id).indexOf('cafe')===0) out.push({name:'Café chair',x:p.x,z:p.z,y:0.9,sx:p.x,sz:p.z,h:p.h,acts:[['Get up',function(){SM.stop(); p.release();}]]});
  else seats.forEach(function(s){if(Math.hypot(s.x-p.x,s.z-p.z)>2.2||!freeSeat(s)) return; out.push({name:'Café chair',x:s.x,z:s.z,y:0.8,sx:s.x,sz:s.z,h:s.h,acts:[['Sit down',function(){SM.stop(); p.sitOn(s,function(){SM.setDoing('sitting at the café');});}]]});});
  if(scoot&&Math.hypot(scoot.position.x-p.x,scoot.position.z-p.z)<3) out.push({name:'Scooter',x:scoot.position.x,z:scoot.position.z,y:1.0,sx:scoot.position.x+0.6,sz:scoot.position.z,h:-R/2,acts:[['Ride the scooter',mount]]});
};

/* ---------- the road is yours too ---------- */
const wr=function(q){return [LBX(q[2]),LBX(q[3]),LBZ(q[1]),LBZ(q[0])];}, LBX=function(z){return S.X0+z;}, LBZ=function(x){return A.LB.ZC-x;};
if(A.rooms.street) A.rooms.street.rs.push(wr([-17,48,KZ+0.15,KZ+RW-0.15]));

/* ---------- every frame ---------- */
A.frameFns.push(function(dt){
  const p=SM.player;
  paintSky(); sky.position.copy(A.camera.position);
  followSun(p);
  SL.folk.forEach(function(f){if(f.bub){const hp=f.p.head.getWorldPosition(wv); hp.y+=0.3; A.place(f.bub.el,hp,A.simsOn&&f.p.g.visible); if(A.t>f.bub.until){f.bub.el.remove(); f.bub=null;}}});
  if(!A.simsOn||!p){if(riding) dismount(); return;}
  if(riding){
    if(p.lvl||p.room==='hall'||['living','kitchen','bed1','bed2','bath','wc'].indexOf(p.room)>=0){scoot.position.set(p.x,0,p.z); dismount('You leave the scooter by the door.');}
    else{scoot.position.set(p.x,p.p.g.position.y,p.z); scoot.rotation.y=p.h-R/2; A.touch(1);
      if(engine){const moving=p.path.length>0; engine.g.gain.setTargetAtTime(moving?0.05:0.02,engine.c.currentTime,0.15); engine.o.frequency.setTargetAtTime(moving?95:52,engine.c.currentTime,0.3);}}
  }
});
A.streetPlay={bubble:bubble,seats:seats,scoot:scoot,mount:mount,dismount:dismount,act:act,order:order};
})();
