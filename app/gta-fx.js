/* Haroe 10 — the look of the game, in Sims mode. A clock runs (a day in 48 minutes, or the real time, or always day or night, in the
   settings): the sun crosses the sky over Ramat Gan, the light warms toward evening, the sky goes from blue to orange to night with its
   stars and the moon, and the windows, shops and lamps come on as it gets dark. The picture is drawn smooth-edged into a buffer first and
   then finished as GTA does: lights bloom at night, the colours are graded warmer and fuller, the corners darker. Cars have glossy paint
   that catches the sky, and at night their headlights glow and throw light on the road ahead. Quality in the settings: High, Medium (a
   lighter bloom), Low (none of the finishing, for older phones). The Design tab keeps its own plain look. */
(function(){
'use strict';
const A=window.APP, SM=A.sims, R=Math.PI, renderer=A.renderer, scene=A.scene, camera=A.camera;
if(!SM||!A.gtaSet) return;
const OUT=function(){return A.LAYER_OUT||5;};
function clamp(v,a,b){return v<a?a:v>b?b:v;}
function sstep(a,b,x){const t=clamp((x-a)/(b-a),0,1); return t*t*(3-2*t);}

/* =====================================================================
   The clock
   ===================================================================== */
const CK={h:10.5,ev:null,last:0};
function realHour(){const d=new Date(); return d.getHours()+d.getMinutes()/60+d.getSeconds()/3600;}
A.gtaClock=function(){if(!A.simsOn) return ''; const h=CK.h, hh=Math.floor(h), mm=Math.floor((h-hh)*60); return ('0'+hh).slice(-2)+':'+('0'+mm).slice(-2);};
A.gtaHour=function(){return CK.h;};
A.gtaSetHour=function(h){CK.h=((h%24)+24)%24;};
function tick(dt){const mode=A.gtaSet.get('clock');
  /* the Day and Evening buttons, the pajama party and the morning after: the clock jumps to match */
  if(CK.ev!==SM.evening){if(CK.ev!==null&&(mode==='game')) CK.h=SM.evening?19.75:8.5; CK.ev=SM.evening;}
  else{const night=NOW.day<0.35; if(night!==SM.evening&&CK.ev!==null){CK.ev=night; SM.setEvening(night);}}      // and the other way: the panel's Day and Evening follow the clock (evening puts your room's light on)
  if(mode==='real') CK.h=realHour(); else if(mode==='day') CK.h=SM.evening?19.75:12.5; else if(mode==='night') CK.h=22.5;
  else CK.h=(CK.h+dt/120+24)%24;}      // 2 s a game minute
/* where the sun is: Ramat Gan, 32° north, the sun at about +10° (spring into summer). x is north here, z east */
const SUN=new THREE.Vector3(), MOON=new THREE.Vector3();
function sunAt(h,out){const lat=32*R/180, dec=10*R/180, w=(h-12.3)*15*R/180;
  const se=Math.sin(lat)*Math.sin(dec)+Math.cos(lat)*Math.cos(dec)*Math.cos(w), el=Math.asin(clamp(se,-1,1));
  let ca=(Math.sin(dec)-se*Math.sin(lat))/(Math.cos(el)*Math.cos(lat)); ca=clamp(ca,-1,1); let az=Math.acos(ca); if(w>0) az=2*R-az;      // from north, toward east
  out.set(Math.cos(el)*Math.cos(az),Math.sin(el),Math.cos(el)*Math.sin(az)); return el;}

/* =====================================================================
   The colours of the hour: sky overhead and at the horizon, sunlight, the sky's light, the haze
   ===================================================================== */
const KEYS=[      // sun elevation in degrees: sky top, horizon, sun colour and strength, sky light colour and strength, ground colour
  [-18,0x050812,0x101a2e,0xa8b8f0,0.3,0x98a2c4,0.68,0x2a2a34],      // night: the street's own lamps and windows do the rest (the 'day' channel)
  [-8, 0x0b1430,0x2c2c4c,0xb0bcf0,0.3,0x9ca4c6,0.66,0x2e2c34],
  [-3, 0x1c2a58,0x9a5a5e,0xd89a80,0.32,0x9a98bc,0.64,0x403834],
  [2,  0x34508c,0xf09a62,0xffb070,0.46,0xc0b4c8,0.62,0x5a4a3c],
  [9,  0x4a76b4,0xf3c896,0xffd2a0,0.56,0xc8d4e8,0.6,0x6b5e50],
  [25, 0x4f84c4,0xd6e4ee,0xfff1dc,0.64,0xd8e6f4,0.64,0x766c5e],
  [60, 0x4a80c6,0xd4e2ec,0xfff6e8,0.66,0xdceaf8,0.66,0x7a7064]
].map(function(k){return {e:k[0],top:new THREE.Color(k[1]),hor:new THREE.Color(k[2]),sun:new THREE.Color(k[3]),si:k[4],sky:new THREE.Color(k[5]),hi:k[6],gnd:new THREE.Color(k[7])};});
const NOW={top:new THREE.Color(),hor:new THREE.Color(),sun:new THREE.Color(),sky:new THREE.Color(),gnd:new THREE.Color(),si:0.4,hi:0.66,el:0.5,night:0,dusk:0,day:1};
function colours(eDeg){let i=0; while(i<KEYS.length-2&&eDeg>KEYS[i+1].e) i++; const a=KEYS[i], b=KEYS[i+1], t=clamp((eDeg-a.e)/(b.e-a.e),0,1);
  NOW.top.copy(a.top).lerp(b.top,t); NOW.hor.copy(a.hor).lerp(b.hor,t); NOW.sun.copy(a.sun).lerp(b.sun,t); NOW.sky.copy(a.sky).lerp(b.sky,t); NOW.gnd.copy(a.gnd).lerp(b.gnd,t);
  NOW.si=a.si+(b.si-a.si)*t; NOW.hi=a.hi+(b.hi-a.hi)*t;
  NOW.night=1-sstep(-10,1,eDeg); NOW.dusk=sstep(-6,2,eDeg)*(1-sstep(6,18,eDeg)); NOW.day=sstep(-4,14,eDeg);}
/* the sky (streetplay.js) asks for its colours here */
let skyVer=0, skyKey='';
A.skyColors=function(top,hor){top.copy(NOW.top); hor.copy(NOW.hor);};
A.skyVer=function(){return skyVer;};
A.sunDir=null;      // set while the clock runs: streetplay.js points the sun's shadows along it

/* ---------- stars, the moon and a glow round the sun, on the sky ---------- */
const sky=new THREE.Group(); sky.userData.nc=true; sky.userData.live=true; sky.frustumCulled=false; sky.visible=false; scene.add(sky);      // only in Sims mode, never over the Design tab's flat
const starG=new THREE.BufferGeometry(), SN=900, sp=new Float32Array(SN*3), rr=A.rng(4242);
for(let i=0;i<SN;i++){const u=rr()*2-1, a=rr()*2*R, y=Math.abs(u)*0.95+0.05, r=Math.sqrt(1-y*y); sp[i*3]=Math.cos(a)*r*80; sp[i*3+1]=y*80; sp[i*3+2]=Math.sin(a)*r*80;}
starG.setAttribute('position',new THREE.BufferAttribute(sp,3));
const starM=new THREE.PointsMaterial({color:0xffffff,size:1.6,sizeAttenuation:false,transparent:true,opacity:0,depthWrite:false,fog:false});
const stars=new THREE.Points(starG,starM); stars.renderOrder=-9; stars.frustumCulled=false; sky.add(stars);
function glowTex(inner,outer){return A.canvasTex(128,128,function(g){const gr=g.createRadialGradient(64,64,0,64,64,64); gr.addColorStop(0,inner); gr.addColorStop(0.18,inner); gr.addColorStop(0.3,outer); gr.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=gr; g.fillRect(0,0,128,128);});}
const sunM=new THREE.SpriteMaterial({map:glowTex('rgba(255,250,235,1)','rgba(255,210,150,0.35)'),transparent:true,depthWrite:false,fog:false,blending:THREE.AdditiveBlending});
const sunS=new THREE.Sprite(sunM); sunS.scale.set(22,22,1); sunS.renderOrder=-8; sky.add(sunS);
const moonT=A.canvasTex(128,128,function(g){const gr=g.createRadialGradient(64,64,0,64,64,64); gr.addColorStop(0,'rgba(220,230,255,0.25)'); gr.addColorStop(1,'rgba(220,230,255,0)'); g.fillStyle=gr; g.fillRect(0,0,128,128);
  g.fillStyle='#e9eef6'; g.beginPath(); g.arc(64,64,16,0,7); g.fill(); g.fillStyle='rgba(150,160,180,0.35)'; [[58,58,4],[70,66,3],[62,72,2.5]].forEach(function(c){g.beginPath(); g.arc(c[0],c[1],c[2],0,7); g.fill();});});
const moonM=new THREE.SpriteMaterial({map:moonT,transparent:true,depthWrite:false,fog:false}), moonS=new THREE.Sprite(moonM); moonS.scale.set(16,16,1); moonS.renderOrder=-8; sky.add(moonS);
let layered=false;

/* =====================================================================
   The light: sun, sky, haze, and what the Design tab had
   ===================================================================== */
const DEF={si:A.sun.intensity,sc:A.sun.color.clone(),hi:A.hemi.intensity,hc:A.hemi.color.clone(),hg:A.hemi.groundColor.clone()};
let ruled=false, dayWas=-1, sunWas=new THREE.Vector3();
function light(dt){
  const out=A.simsOn&&SM.player;
  if(!out){if(ruled){ruled=false; const pc=document.getElementById('pClimate'); if(!pc||pc.hidden){A.sun.intensity=DEF.si; A.sun.color.copy(DEF.sc); A.hemi.intensity=DEF.hi; A.hemi.color.copy(DEF.hc); A.hemi.groundColor.copy(DEF.hg);} A.sunDir=null; dayWas=-1; sky.visible=false; A.touch(3);} return;}      /* the Sun & air tab sets its own sun: left as it is */
  ruled=true; sky.visible=true;
  const el=sunAt(CK.h,SUN), eDeg=el*180/R; colours(eDeg);
  /* the moon, across the sky from the sun */
  MOON.set(-SUN.x*0.6+0.3,Math.max(0.35,-SUN.y),-SUN.z*0.6).normalize();
  /* the 'day' channel lights the rooms, windows and lamps of the whole game: it follows the sun, in steps */
  const dv=Math.round(NOW.day*50)/50; if(dv!==dayWas||A.goal('day')!==dv){dayWas=dv; A.set('day',dv); A.set('candle',dv<0.4?1:0);}
  /* sunlight from where the sun is (or, below the horizon, the moon); its shadows move in small steps */
  const lightDir=eDeg>-2?SUN:MOON; if(lightDir.y<0.12) {sunWas.copy(lightDir); sunWas.y=0.12; sunWas.normalize();} else sunWas.copy(lightDir);
  if(!A.sunDir) A.sunDir=new THREE.Vector3(); if(A.sunDir.angleTo(sunWas)>0.02){A.sunDir.copy(sunWas); A.touch(2);}
  A.sun.color.copy(NOW.sun); A.sun.intensity=NOW.si; A.hemi.color.copy(NOW.sky); A.hemi.groundColor.copy(NOW.gnd); A.hemi.intensity=NOW.hi;
  const sk=NOW.top.getHexString()+NOW.hor.getHexString(); if(sk!==skyKey){skyKey=sk; skyVer++;}
  /* the haze matches the horizon */
  if(scene.fog){scene.fog.color.copy(NOW.hor).lerp(NOW.top,0.15);}
  /* on the sky */
  if(!layered&&A.LAYER_OUT!=null){layered=true; sky.traverse(function(o){o.layers.set(OUT());});}
  sky.position.copy(camera.position);
  starM.opacity=clamp(NOW.night*1.1-0.1,0,1)*0.9;
  sunS.position.copy(SUN).multiplyScalar(76); sunS.visible=SUN.y>-0.05; sunM.opacity=clamp(SUN.y*6+0.3,0,1); sunM.color.copy(NOW.sun);
  moonS.position.copy(MOON).multiplyScalar(74); moonS.visible=NOW.night>0.2; moonM.opacity=clamp(NOW.night*1.2-0.2,0,1);
}

/* =====================================================================
   Finishing the picture: drawn into a smooth-edged buffer, then bloom, grade and vignette
   ===================================================================== */
const QUAD=new THREE.Mesh(new THREE.PlaneGeometry(2,2)), QS=new THREE.Scene(), QC=new THREE.OrthographicCamera(-1,1,1,-1,0,1); QS.add(QUAD); QUAD.frustumCulled=false;
const VS='varying vec2 vUv; void main(){vUv=uv; gl_Position=vec4(position.xy,0.0,1.0);}';
function pass(fs,u){return new THREE.ShaderMaterial({uniforms:u,vertexShader:VS,fragmentShader:fs,depthTest:false,depthWrite:false});}
const brightM=pass('uniform sampler2D t; uniform float th, kn; varying vec2 vUv; void main(){vec3 c=texture2D(t,vUv).rgb; float l=max(c.r,max(c.g,c.b)); float k=smoothstep(th-kn,th+kn,l); gl_FragColor=vec4(c*k,1.0);}',
  {t:{value:null},th:{value:0.8},kn:{value:0.12}});
const blurM=pass('uniform sampler2D t; uniform vec2 d; varying vec2 vUv; void main(){vec3 c=texture2D(t,vUv).rgb*0.2270270; c+=texture2D(t,vUv+d*1.3846154).rgb*0.3162162; c+=texture2D(t,vUv-d*1.3846154).rgb*0.3162162; c+=texture2D(t,vUv+d*3.2307692).rgb*0.0702703; c+=texture2D(t,vUv-d*3.2307692).rgb*0.0702703; gl_FragColor=vec4(c,1.0);}',
  {t:{value:null},d:{value:new THREE.Vector2()}});
const finM=pass([
  'uniform sampler2D t, b1, b2; uniform float s1, s2, ex, con, sat, vig, grain, time, warm; uniform vec3 shad, high, tint; varying vec2 vUv;',
  'float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}',
  'void main(){vec3 c=texture2D(t,vUv).rgb; c+=texture2D(b1,vUv).rgb*s1+texture2D(b2,vUv).rgb*s2; c*=ex;',
  ' c=c/(1.0+max(c-vec3(0.82),0.0)*0.9);',                                        // a soft shoulder, so bright skies and lamps roll off
  ' c=(c-0.5)*con+0.5; float l=dot(c,vec3(0.299,0.587,0.114)); c=mix(vec3(l),c,sat);',
  ' c+=shad*(1.0-l)*(1.0-l)*0.09+high*l*l*0.07; c*=tint;',                         // shadows a touch teal, highlights warm: the GTA light
  ' vec2 d=vUv-0.5; c*=1.0-vig*dot(d,d)*1.7;',
  ' c+=(h(vUv*vec2(1213.0,977.0)+time)-0.5)*grain;',
  ' gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);}'].join('\n'),
  {t:{value:null},b1:{value:null},b2:{value:null},s1:{value:0.5},s2:{value:0.6},ex:{value:1.0},con:{value:1.08},sat:{value:1.16},vig:{value:0.5},grain:{value:0.018},time:{value:0},warm:{value:0},
   shad:{value:new THREE.Color(-0.4,0.15,0.35)},high:{value:new THREE.Color(0.5,0.25,-0.3)},tint:{value:new THREE.Color(1,1,1)}});
const PP={rt:null,a:null,b:null,c:null,d:null,w:0,h:0,ms:-1};
const sz=new THREE.Vector2();
const RTO={minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat,stencilBuffer:false};
function quality(){return A.gtaSet.get('quality');}
function targets(){renderer.getDrawingBufferSize(sz); const w=Math.max(2,sz.x), h=Math.max(2,sz.y), q=quality(), ms=q==='high'?4:2, gl2=renderer.capabilities.isWebGL2;
  if(PP.rt&&PP.w===w&&PP.h===h&&PP.ms===ms) return;
  [PP.rt,PP.a,PP.b,PP.c,PP.d].forEach(function(t){if(t) t.dispose();});
  PP.w=w; PP.h=h; PP.ms=ms;
  if(gl2&&THREE.WebGLMultisampleRenderTarget){PP.rt=new THREE.WebGLMultisampleRenderTarget(w,h,Object.assign({depthBuffer:true},RTO)); PP.rt.samples=ms;}
  else PP.rt=new THREE.WebGLRenderTarget(w,h,Object.assign({depthBuffer:true},RTO));
  const q2=function(f){return new THREE.WebGLRenderTarget(Math.max(1,Math.round(w/f)),Math.max(1,Math.round(h/f)),Object.assign({depthBuffer:false},RTO));};
  PP.a=q2(4); PP.b=q2(4); PP.c=q2(8); PP.d=q2(8);}
function draw(m,to){QUAD.material=m; renderer.setRenderTarget(to); renderer.render(QS,QC);}
function blur(src,tmp,dst){blurM.uniforms.t.value=src.texture; blurM.uniforms.d.value.set(1/src.width,0); draw(blurM,tmp); blurM.uniforms.t.value=tmp.texture; blurM.uniforms.d.value.set(0,1/src.height); draw(blurM,dst);}
let ppOn=false, failed=false;
function wanted(){return A.simsOn&&SM.player&&quality()!=='low'&&!failed;}
A.renderHook=function(){
  if(!wanted()) return false;
  try{
    targets(); const q=quality();
    renderer.setRenderTarget(PP.rt); renderer.render(scene,camera);
    /* the bright parts, a quarter size, blurred; then an eighth, blurred wider */
    const n=NOW.night, inside=SM.player&&SM.player.room&&A.rooms[SM.player.room]&&!A.rooms[SM.player.room].ext;
    brightM.uniforms.t.value=PP.rt.texture; brightM.uniforms.th.value=0.88-0.3*n+(inside?0.1:0); draw(brightM,PP.a);
    blur(PP.a,PP.b,PP.a);
    if(q==='high'){blurM.uniforms.t.value=PP.a.texture; blurM.uniforms.d.value.set(0.5/PP.a.width,0); draw(blurM,PP.c); blurM.uniforms.t.value=PP.c.texture; blurM.uniforms.d.value.set(0,1/PP.c.height); draw(blurM,PP.d); blur(PP.d,PP.c,PP.d);}
    const U=finM.uniforms; U.t.value=PP.rt.texture; U.b1.value=PP.a.texture; U.b2.value=q==='high'?PP.d.texture:PP.a.texture;
    U.s1.value=0.35+0.45*n; U.s2.value=q==='high'?0.35+0.75*n:0;
    U.con.value=1.07+0.05*n; U.sat.value=1.15-0.12*n+0.08*NOW.dusk; U.ex.value=1.02+0.06*n; U.vig.value=0.45+0.25*n; U.time.value=(A.t%60);
    U.tint.value.setRGB(1-0.05*n+0.03*NOW.dusk,1-0.02*n,1+0.06*n-0.04*NOW.dusk);
    draw(finM,null);
  }catch(e){failed=true; renderer.setRenderTarget(null); if(window.console) console.warn('post-processing off:',e); return false;}
  return true;
};

/* =====================================================================
   Cars: glossy paint that catches the sky, and headlights at night
   ===================================================================== */
const ENV=A.town&&A.town.skyEnv||null;
A.gtaPaint=function(g,col){      // the body of a finely built car (drive.js): its own colour, now with a clear coat
  if(!ENV) return; g.traverse(function(m){if(!m.isMesh) return; const mt=m.material; if(!mt||!mt.isMeshLambertMaterial||mt.map) return;
    const reg=A.rooms.street.mats.find(function(e){return e.m===mt;}), base=reg?reg.b:mt.color;
    const glass=base.getHex()===0x27313a, body=base.getHex()===col;
    if(!glass&&!body) return;
    const pm=new THREE.MeshPhongMaterial({color:base.clone(),specular:glass?0x56606a:0x5a5a5a,shininess:glass?110:85,envMap:ENV,combine:THREE.MixOperation,reflectivity:glass?0.2:0.22,emissive:mt.emissive?mt.emissive.clone():0});
    pm.userData.refl=pm.reflectivity; shiny.push(pm); A.reg(pm,'street'); pm.color.copy(base).multiply(A.rooms.street.tint); m.material=pm;});};
const shiny=[];      // the sky they reflect is a day sky: at night they reflect little
function gloss(){const d=A.simsOn?NOW.day:1; if(Math.abs(d-(gloss.d||-1))<0.02) return; gloss.d=d; shiny.forEach(function(m){m.reflectivity=m.userData.refl*(0.15+0.85*d);});}
/* headlights: two glowing lamps at the front, red at the back, and a pool of light thrown on the road ahead */
const poolT=A.canvasTex(64,128,function(g){const gr=g.createLinearGradient(0,128,0,0); gr.addColorStop(0,'rgba(255,240,210,0.85)'); gr.addColorStop(0.35,'rgba(255,235,200,0.45)'); gr.addColorStop(1,'rgba(255,230,190,0)'); g.fillStyle=gr; g.fillRect(0,0,64,128);
  const s=g.createLinearGradient(0,0,64,0); s.addColorStop(0,'rgba(0,0,0,1)'); s.addColorStop(0.3,'rgba(0,0,0,0)'); s.addColorStop(0.7,'rgba(0,0,0,0)'); s.addColorStop(1,'rgba(0,0,0,1)'); g.globalCompositeOperation='destination-out'; g.fillStyle=s; g.fillRect(0,0,64,128);});
const poolM=new THREE.MeshBasicMaterial({map:poolT,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0,polygonOffset:true,polygonOffsetUnits:-6});
const headM=new THREE.SpriteMaterial({map:glowTex('rgba(255,252,240,1)','rgba(255,235,200,0.4)'),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0});
const tailM=new THREE.SpriteMaterial({map:glowTex('rgba(255,60,50,1)','rgba(255,30,20,0.35)'),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:0});
const poolGeo=new THREE.PlaneGeometry(4.6,11).rotateX(-R/2).rotateY(-R/2).translate(5.5,0,0);
function lamps(c){if(c._lamps) return c._lamps; const L=c.dim[0], W=c.dim[1], g=new THREE.Group(); g.userData.nc=true;
  [-1,1].forEach(function(s){const h=new THREE.Sprite(headM); h.scale.set(1.1,1.1,1); h.position.set(L/2+0.08,0.78,s*(W/2-0.3)); g.add(h); const t=new THREE.Sprite(tailM); t.scale.set(0.6,0.6,1); t.position.set(-L/2-0.06,0.86,s*(W/2-0.24)); g.add(t);});
  const p=new THREE.Mesh(poolGeo,poolM); p.position.set(L/2,0.04,0); p.renderOrder=2; g.add(p);
  g.traverse(function(o){o.layers.set(OUT());}); c.g.add(g); c._lamps=g; return g;}
function headlights(){const D=A.drive; if(!D||!D.live) return; const n=A.simsOn?NOW.night*0.85+NOW.dusk*0.25:0;
  headM.opacity=clamp(n*1.2,0,1); tailM.opacity=clamp(n*1.1,0,0.9); poolM.opacity=clamp(n*0.55,0,0.5);
  const me=D.on()?D.pos():null;
  D.live.forEach(function(c){const want=n>0.08&&(c.traffic||c===me||c.cop); if(want) lamps(c).visible=true; else if(c._lamps) c._lamps.visible=false;});}

/* ---------- every frame ---------- */
A.frameFns.push(function(dt){
  if(A.simsOn&&SM.player) tick(dt);
  light(dt); headlights(); gloss(); fadeU.value=A.simsOn?1:0; if(SM.player){const pp=SM.player.p.g.position; fadeEnd.value=Math.max(1.2,camera.position.distanceTo(pp)-0.6);}
});
/* leaves right in front of the camera dissolve, as GTA's foliage does, so a low crown never blinds the view (Sims mode only) */
const fadeU={value:0}, fadeEnd={value:2.6};      /* on, and how deep: up to just short of you */
if(A.det&&A.det.leafM){const lm=A.det.leafM, prev=lm.onBeforeCompile;
  lm.onBeforeCompile=function(sh,r){if(prev) prev(sh,r); sh.uniforms.uNearFade=fadeU; sh.uniforms.uFadeEnd=fadeEnd;
    sh.vertexShader='varying float vFadeZ;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\n vFadeZ=-mvPosition.z;');
    sh.fragmentShader='uniform float uNearFade, uFadeEnd; varying float vFadeZ;\n'+sh.fragmentShader.replace('#include <alphatest_fragment>','#include <alphatest_fragment>\n if(uNearFade>0.5){float hh=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(0.06711056,0.00583715)))); if(hh>smoothstep(uFadeEnd*0.45,uFadeEnd,vFadeZ)) discard;}');};      /* a fine even dither, from the camera to just short of you */
  lm.needsUpdate=true;}
/* the sun's shadows out in the streets cover a wide square and much of the town: drawn every other frame there, they still follow what moves */
let odd=false;
A.shadowSkip=function(){if(!A.simsOn||!SM.player) return false; const r=A.rooms[SM.player.room]; if(!(SM.player.driving||(r&&r.ext&&!SM.player.lvl))) return false; odd=!odd; return odd;};
A.gtaFx={now:NOW,sun:SUN};
})();
