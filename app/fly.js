/* Haroe 10 — floating designer: a free first-person camera in Design mode. No character, no collisions. */
(function(){
'use strict';
const A=window.APP, cam=A.camera, R=Math.PI;
const $=function(id){return document.getElementById(id);};
let on=false, yaw=R, pitch=-0.05, drag=null, vy=0;
const keys={}, pos=new THREE.Vector3();
function set(v){
  if(v===on) return; on=v;
  $('bFly').setAttribute('aria-pressed',v); $('flyBtns').hidden=!v;
  $('stickMove').hidden=!v; $('stickLook').hidden=!v; document.body.classList.toggle('sticks',v);
  if(v){
    $('b3d').setAttribute('aria-pressed',false); $('bTop').setAttribute('aria-pressed',false); $('bStreet').setAttribute('aria-pressed',false);
    A.stopFly(); A.controls.enabled=false; cam.fov=70; cam.near=0.08; cam.updateProjectionMatrix();
    pos.set(1.9,1.6,4.6); yaw=R; pitch=-0.05;                 // start by the sofa, looking up the room
    $('hint').textContent='Left stick or WASD to move, right stick or drag to look, ▲▼ or Q/E for height'; $('hint').style.opacity=1;
  }else{
    A.controls.enabled=true; cam.fov=40; cam.near=0.1; cam.rotation.order='XYZ'; cam.updateProjectionMatrix();
    $('hint').textContent='Drag to rotate, pinch or scroll to zoom';
  }
}
A.setFly=set; A.flyOn=function(){return on;};
$('bFly').onclick=function(){set(!on); if(!on) A.setView('3d');};
['b3d','bTop','bStreet'].forEach(function(id){$(id).addEventListener('click',function(){set(false);});});
['tabSims','tabClimate'].forEach(function(id){$(id).addEventListener('click',function(){set(false);},true);});
window.addEventListener('keydown',function(e){if(on&&!/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) keys[e.key.toLowerCase()]=true;});
window.addEventListener('keyup',function(e){keys[e.key.toLowerCase()]=false;});
const cv=A.renderer.domElement;
cv.addEventListener('pointerdown',function(e){if(on&&!A.state.edit) drag={x:e.clientX,y:e.clientY,id:e.pointerId};});
window.addEventListener('pointermove',function(e){
  if(!on||!drag||e.pointerId!==drag.id) return;
  yaw+=(e.clientX-drag.x)*0.005; pitch=Math.max(-1.3,Math.min(1.3,pitch-(e.clientY-drag.y)*0.004)); drag.x=e.clientX; drag.y=e.clientY;
});
window.addEventListener('pointerup',function(){drag=null;}); window.addEventListener('pointercancel',function(){drag=null;});
[['flyUp',1],['flyDown',-1]].forEach(function(q){const b=$(q[0]);
  b.addEventListener('pointerdown',function(e){vy=q[1]; b.setPointerCapture(e.pointerId);});
  ['pointerup','pointercancel'].forEach(function(n){b.addEventListener(n,function(){vy=0;});});});
A.frameFns.push(function(dt){
  if(!on) return;
  A.controls.enabled=false;
  const m=A.sticks.move, l=A.sticks.look;
  let sx=m.x, sy=m.y;
  if(keys.w||keys.arrowup) sy=-1; if(keys.s||keys.arrowdown) sy=1; if(keys.a||keys.arrowleft) sx=-1; if(keys.d||keys.arrowright) sx=1;
  const fx=Math.sin(yaw), fz=Math.cos(yaw), sp=1.8*dt;
  pos.x+=(fx*(-sy)-fz*sx)*sp; pos.z+=(fz*(-sy)+fx*sx)*sp;
  pos.y+=(vy+(keys.e?1:0)-(keys.q?1:0))*1.2*dt;
  pos.x=Math.max(-12,Math.min(14,pos.x)); pos.z=Math.max(-12,Math.min(37.5,pos.z));            // as far as the other side of Haroe St
  pos.y=Math.max(pos.z>A.D.L+8?-0.3:0.3,Math.min(6,pos.y));                                     // the square in front is a metre lower
  if(Math.hypot(l.x,l.y)>0.15){yaw-=l.x*Math.abs(l.x)*dt*1.5; pitch=Math.max(-1.3,Math.min(1.3,pitch+l.y*Math.abs(l.y)*dt*1.0));}
  cam.position.copy(pos); cam.rotation.order='YXZ'; cam.rotation.set(-pitch,yaw+R,0);
});
})();
