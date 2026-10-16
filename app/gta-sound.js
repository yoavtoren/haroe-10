/* Haroe 10 — the sound of the game. One audio context for everything in the page, so the volumes in the GTA settings and the pause
   reach every sound: the household noises, the punches, the cars, the police. On top of that, in Sims mode: your footsteps (tile at home,
   paving stones outside, quicker and harder when you run), the city round you (the traffic you can hear pass, a horn down the street, a
   siren far off, a dog, a motorbike, voices at the cafés, the wind), muffled when you are indoors; an engine that revs through its gears
   and tyres that squeal; the car radio, four stations made up as they play (Q changes station); the police dispatcher when the stars go
   up; and the stings, wasted, busted, lost them, money. */
(function(){
'use strict';
const A=window.APP, Real=window.AudioContext||window.webkitAudioContext;
if(!Real) return;
function clamp(v,a,b){return v<a?a:v>b?b:v;}
function rnd(a){return a[Math.floor(Math.random()*a.length)];}

/* =====================================================================
   The one context: everything made with new AudioContext() gets this one, and its destination is the effects bus
   ===================================================================== */
let ctx=null, B=null, paused=false;
function make(){
  ctx=new Real(); const dest=ctx.destination;
  const master=ctx.createGain(), comp=ctx.createDynamicsCompressor(); comp.threshold.value=-16; comp.knee.value=8; comp.ratio.value=4; comp.attack.value=0.004; comp.release.value=0.25;
  master.connect(comp); comp.connect(dest);
  const sfx=ctx.createGain(), radio=ctx.createGain(), out=ctx.createGain(), outF=ctx.createBiquadFilter(), wet=ctx.createGain(), verb=ctx.createConvolver();
  outF.type='lowpass'; outF.frequency.value=18000; out.connect(outF); outF.connect(sfx); sfx.connect(master); radio.connect(master);
  /* a little of the street's echo off the blocks */
  const n=Math.floor(ctx.sampleRate*1.6), ir=ctx.createBuffer(2,n,ctx.sampleRate); for(let c=0;c<2;c++){const d=ir.getChannelData(c); for(let i=0;i<n;i++){const t=i/n; d[i]=(Math.random()*2-1)*Math.pow(1-t,3.2)*(i<ctx.sampleRate*0.012?0:1);}}
  verb.buffer=ir; wet.gain.value=0.22; outF.connect(verb); verb.connect(wet); wet.connect(sfx);
  B={master:master,sfx:sfx,radio:radio,out:out,outF:outF};
  try{Object.defineProperty(ctx,'destination',{value:sfx,configurable:true});}catch(e){}
  ctx.close=function(){return Promise.resolve();};      // shared: nobody may close it
  const resume0=ctx.resume.bind(ctx); ctx.resume=function(){return paused?Promise.resolve():resume0();}; ctx._resume=resume0;      /* nor wake it while the game is paused (audio.js does on any click) */
  ['pointerdown','keydown','touchstart'].forEach(function(ev){window.addEventListener(ev,function(){if(ctx.state==='suspended'&&!paused) ctx.resume();},{passive:true,capture:true});});
  volumes(); return ctx;}
function shared(){return ctx||make();}
const Fake=function(){return shared();}; Fake.prototype=Real.prototype;
window.AudioContext=Fake; if(window.webkitAudioContext) window.webkitAudioContext=Fake;
function volumes(){if(!B) return; const S=A.gtaSet, m=S?S.get('master'):0.8, r=S?S.get('radio'):0.6, s=S?S.get('sfx'):0.9, t=ctx.currentTime;
  B.master.gain.setTargetAtTime(m,t,0.05); B.radio.gain.setTargetAtTime(r*0.55,t,0.05); B.sfx.gain.setTargetAtTime(s,t,0.05);}
let noiseB=null;
function noise(){if(!noiseB){const c=shared(), n=c.sampleRate*2; noiseB=c.createBuffer(1,n,c.sampleRate); const d=noiseB.getChannelData(0); for(let i=0;i<n;i++) d[i]=Math.random()*2-1;} return noiseB;}
function nsrc(){const c=shared(), s=c.createBufferSource(); s.buffer=noise(); s.loop=true; return s;}
/* a short burst of filtered noise: hits, steps, static */
function burst(dest,dur,type,freq,q,vol,when){const c=shared(), t=when||c.currentTime, s=nsrc(), f=c.createBiquadFilter(), g=c.createGain(); f.type=type; f.frequency.value=freq; f.Q.value=q||0.7;
  g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+0.004); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); s.connect(f).connect(g).connect(dest); s.start(t,Math.random()*1.5); s.stop(t+dur+0.05);}
function tone(dest,type,f0,f1,dur,vol,when){const c=shared(), t=when||c.currentTime, o=c.createOscillator(), g=c.createGain(); o.type=type; o.frequency.setValueAtTime(f0,t); if(f1!==f0) o.frequency.exponentialRampToValueAtTime(f1,t+dur);
  g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+0.008); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); o.connect(g).connect(dest); o.start(t); o.stop(t+dur+0.05);}

/* =====================================================================
   Footsteps
   ===================================================================== */
let phase0=0;
function steps(){const SM=A.sims, p=SM&&SM.player; if(!p||!A.simsOn||p.driving||p.riding||p.seat||!p.p.g.visible) return;
  const ph=p.p.phase, k=Math.floor(ph/Math.PI); if(k===phase0) return; const was=phase0; phase0=k; if(Math.abs(k-was)>3||p.p.walk<0.4) return;
  const rm=A.rooms[p.room], out=!p.lvl&&rm&&rm.ext, run=p.p.run||0, c=shared(), t=c.currentTime, v=0.05+0.07*run+0.02*Math.random();
  if(out){burst(B.sfx,0.07+0.03*run,'bandpass',1100+Math.random()*300,0.9,v); burst(B.sfx,0.05,'lowpass',260,0.7,v*0.9);}      // paving stones
  else{burst(B.sfx,0.05,'bandpass',2400+Math.random()*500,1.4,v*0.8); tone(B.sfx,'sine',140,70,0.05,v*0.6);}}            // the tiles at home
function jumpS(){burst(B.sfx,0.18,'bandpass',700,0.6,0.06);}
function landS(){burst(B.sfx,0.12,'lowpass',300,0.7,0.14); burst(B.sfx,0.06,'bandpass',1200,1,0.05);}

/* =====================================================================
   The city: what you hear passing, and what happens down the street
   ===================================================================== */
const V=[];      // engine voices for the cars nearest you
function voice(){const c=shared(), o=c.createOscillator(), o2=c.createOscillator(), n=nsrc(), nf=c.createBiquadFilter(), f=c.createBiquadFilter(), g=c.createGain(), p=c.createStereoPanner?c.createStereoPanner():null;
  o.type='sawtooth'; o2.type='square'; o.frequency.value=45; o2.frequency.value=22; nf.type='bandpass'; nf.frequency.value=420; nf.Q.value=0.6; f.type='lowpass'; f.frequency.value=420; g.gain.value=0;
  const g2=c.createGain(); g2.gain.value=0.3; o.connect(f); o2.connect(g2).connect(f); n.connect(nf).connect(f); f.connect(g); if(p){g.connect(p); p.connect(B.out);} else g.connect(B.out);
  o.start(); o2.start(); n.start(); return {o:o,o2:o2,n:n,f:f,g:g,p:p,car:null};}
const cf=new THREE.Vector3();
function traffic(){const D=A.drive, SM=A.sims; if(!D||!D.live||!SM||!SM.player) return; const c=shared(), t=c.currentTime, cam=A.camera;
  if(!V.length) for(let i=0;i<4;i++) V.push(voice());
  const me=D.on()?D.pos():null, px=me?me.x:SM.player.x, pz=me?me.z:SM.player.z, inside=!outside();
  const near=D.live.filter(function(k){return k!==me&&(k.traffic||k.cop||Math.abs(k.v)>0.3);}).map(function(k){return {k:k,d:Math.hypot(k.x-px,k.z-pz)};}).filter(function(q){return q.d<70;}).sort(function(a,b){return a.d-b.d;}).slice(0,V.length);
  cam.getWorldDirection(cf); const yaw=Math.atan2(cf.x,cf.z);
  V.forEach(function(v,i){const q=near[i]; if(!q||inside||A.paused){v.g.gain.setTargetAtTime(0,t,0.2); return;}
    const k=q.k, sp=Math.abs(k.v), big=k.kind==='bus', vol=clamp(0.09/(1+q.d*0.12),0,0.07)*(0.4+0.6*Math.min(1,sp/8))*(big?1.5:1);
    v.o.frequency.setTargetAtTime((big?28:40)+sp*(big?2.2:3.2),t,0.15); v.o2.frequency.setTargetAtTime((big?14:20)+sp*1.6,t,0.15); v.f.frequency.setTargetAtTime(260+sp*45,t,0.15); v.g.gain.setTargetAtTime(vol,t,0.15);
    if(v.p){const a=Math.atan2(k.x-px,k.z-pz)-yaw; v.p.pan.setTargetAtTime(clamp(-Math.sin(a),-0.9,0.9),t,0.1);}});}
/* the hum of the town, by day; the stillness and the crickets by night (townlife.js has those); and now and then something */
let hum=null, evT=0;
function city(dt){const SM=A.sims, p=SM&&SM.player, c=shared(); if(!p) return; const t=c.currentTime, on=A.simsOn&&!A.paused, out=outside(), night=A.gtaFx?A.gtaFx.now.night:0;
  if(!hum&&on){const s=nsrc(), f=c.createBiquadFilter(), f2=c.createBiquadFilter(), g=c.createGain(), l=c.createOscillator(), lg=c.createGain(); f.type='bandpass'; f.frequency.value=320; f.Q.value=0.4; f2.type='lowpass'; f2.frequency.value=900;
    l.frequency.value=0.07; lg.gain.value=0.012; g.gain.value=0; l.connect(lg).connect(g.gain); s.connect(f).connect(f2).connect(g).connect(B.out); s.start(); l.start(); hum={g:g,s:s,l:l};}
  if(hum) hum.g.gain.setTargetAtTime(on?(out?0.028:0.012)*(1-0.55*night):0,t,0.8);
  /* indoors the street comes through the walls, dull and quiet */
  B.outF.frequency.setTargetAtTime(out?18000:520,t,0.25); B.out.gain.setTargetAtTime(on?(out?1:0.45):0,t,0.3);
  if(!on||p.lvl) return;
  evT-=dt; if(evT>0) return; evT=3+Math.random()*7;
  const r=Math.random(), pan=Math.random()*1.6-0.8, far=0.3+Math.random()*0.7;
  if(r<0.24&&night<0.7) hornFar(far,pan); else if(r<0.34) sirenFar(far,pan); else if(r<0.46) dog(far,pan); else if(r<0.6&&night<0.8) moto(far,pan); else if(r<0.72&&night<0.6) chatter(far); else if(r<0.82) wind(); else if(r<0.9&&night<0.5) busBrake(far,pan);}
function panned(pan){const c=shared(); if(!c.createStereoPanner) return B.out; const p=c.createStereoPanner(); p.pan.value=pan; p.connect(B.out); return p;}
function hornFar(far,pan){const d=panned(pan), c=shared(), t=c.currentTime, f=c.createBiquadFilter(); f.type='lowpass'; f.frequency.value=900+far*800; f.connect(d);
  const n=Math.random()<0.5?1:2; for(let i=0;i<n;i++){[392,466].forEach(function(fr){tone(f,'square',fr,fr,0.32,0.02*far,t+i*0.42);});}}
function sirenFar(far,pan){const d=panned(pan), c=shared(), t=c.currentTime, o=c.createOscillator(), l=c.createOscillator(), lg=c.createGain(), g=c.createGain(), f=c.createBiquadFilter();
  o.type='triangle'; o.frequency.value=720; l.frequency.value=0.3; lg.gain.value=220; l.connect(lg).connect(o.frequency); f.type='lowpass'; f.frequency.value=1400; g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(0.012*far,t+2); g.gain.linearRampToValueAtTime(0.0001,t+7);
  o.connect(f).connect(g).connect(d); o.start(t); l.start(t); o.stop(t+7.2); l.stop(t+7.2);}
function dog(far,pan){const d=panned(pan), c=shared(), t=c.currentTime, n=2+Math.floor(Math.random()*3); for(let i=0;i<n;i++){tone(d,'square',380+Math.random()*80,160,0.13,0.022*far,t+i*(0.32+Math.random()*0.1)); burst(d,0.08,'bandpass',900,2,0.012*far,t+i*0.33);}}
function moto(far,pan){const c=shared(), t=c.currentTime, o=c.createOscillator(), f=c.createBiquadFilter(), g=c.createGain(), p=c.createStereoPanner?c.createStereoPanner():null; o.type='sawtooth'; o.frequency.setValueAtTime(70,t); o.frequency.linearRampToValueAtTime(130,t+1.6); o.frequency.linearRampToValueAtTime(85,t+3.6);
  f.type='lowpass'; f.frequency.value=700; g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(0.03*far,t+1.6); g.gain.linearRampToValueAtTime(0.0001,t+3.8);
  o.connect(f).connect(g); if(p){p.pan.setValueAtTime(-pan,t); p.pan.linearRampToValueAtTime(pan,t+3.6); g.connect(p).connect(B.out);} else g.connect(B.out); o.start(t); o.stop(t+4);}
function chatter(far){const c=shared(), t=c.currentTime; for(let i=0;i<10;i++){const s=nsrc(), f=c.createBiquadFilter(), f2=c.createBiquadFilter(), g=c.createGain(), at=t+i*0.18+Math.random()*0.1;
  f.type='bandpass'; f.frequency.value=500+Math.random()*700; f.Q.value=6; f2.type='bandpass'; f2.frequency.value=1500+Math.random()*900; f2.Q.value=8; g.gain.setValueAtTime(0.0001,at); g.gain.exponentialRampToValueAtTime(0.03*far,at+0.03); g.gain.exponentialRampToValueAtTime(0.0001,at+0.16);
  s.connect(f); s.connect(f2); f.connect(g); f2.connect(g); g.connect(B.out); s.start(at,Math.random()); s.stop(at+0.2);}}
function wind(){const c=shared(), t=c.currentTime, s=nsrc(), f=c.createBiquadFilter(), g=c.createGain(); f.type='bandpass'; f.frequency.setValueAtTime(300,t); f.frequency.linearRampToValueAtTime(700,t+2.5); f.frequency.linearRampToValueAtTime(350,t+5); f.Q.value=0.8;
  g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(0.02,t+2.2); g.gain.linearRampToValueAtTime(0.0001,t+5); s.connect(f).connect(g).connect(B.out); s.start(t); s.stop(t+5.2);}
function busBrake(far,pan){const d=panned(pan); burst(d,0.9,'highpass',2500,0.5,0.018*far);}
function outside(){const SM=A.sims, p=SM&&SM.player; if(!p||p.lvl) return false; if(A.drive&&A.drive.on&&A.drive.on()) return true; const r=A.rooms[p.room]; return !!(r&&(p.room==='street'||p.room==='out'||p.room==='town'));}

/* =====================================================================
   Your car: the engine through its gears, the tyres
   ===================================================================== */
let E=null;
function engine(on){const c=shared(), t=c.currentTime;
  if(on&&!E){const o1=c.createOscillator(), o2=c.createOscillator(), o3=c.createOscillator(), n=nsrc(), nf=c.createBiquadFilter(), sh=c.createWaveShaper(), f=c.createBiquadFilter(), g=c.createGain(), g2=c.createGain(), g3=c.createGain(), gn=c.createGain();
    o1.type='sawtooth'; o2.type='sawtooth'; o3.type='square'; o2.detune.value=8; g2.gain.value=0.5; g3.gain.value=0.45; nf.type='bandpass'; nf.Q.value=1.2; gn.gain.value=0.35;
    const curve=new Float32Array(256); for(let i=0;i<256;i++){const x=i/128-1; curve[i]=Math.tanh(x*2.2);} sh.curve=curve;
    f.type='lowpass'; f.Q.value=1.6; g.gain.value=0.0001;
    o1.connect(sh); o2.connect(g2).connect(sh); o3.connect(g3).connect(sh); n.connect(nf).connect(gn).connect(sh); sh.connect(f).connect(g).connect(B.sfx);
    const sq=nsrc(), sqf=c.createBiquadFilter(), sqg=c.createGain(); sqf.type='bandpass'; sqf.frequency.value=1900; sqf.Q.value=4; sqg.gain.value=0; sq.connect(sqf).connect(sqg).connect(B.sfx);      // the tyres
    [o1,o2,o3,n,sq].forEach(function(s){s.start();}); g.gain.setTargetAtTime(0.07,t,0.25); burst(B.sfx,0.35,'lowpass',400,0.8,0.15);      // the starter
    E={o1:o1,o2:o2,o3:o3,nf:nf,f:f,g:g,sqg:sqg,sqf:sqf,src:[o1,o2,o3,n,sq],gear:1,rpm:900};}
  if(!on&&E){const e=E; E=null; e.g.gain.setTargetAtTime(0.0001,t,0.18); e.sqg.gain.setTargetAtTime(0,t,0.05); setTimeout(function(){e.src.forEach(function(s){try{s.stop();}catch(x){}});},900);}}
const GEARS=[0,0,7,13,20,28,40];      // m/s where each gear starts
function rev(car,I,dt){if(!E) return; const c=shared(), t=c.currentTime, v=Math.abs(car.v), th=I.gas||0;
  let g=1; for(let i=1;i<GEARS.length-1;i++) if(v>GEARS[i+1]-0.5) g=i+1; if(car.v<-0.2) g=1;
  const lo=GEARS[g], hi=GEARS[g+1], frac=clamp((v-lo)/(hi-lo),0,1), want=850+frac*4900+(v<0.5?th*2200:0);
  if(g!==E.gear){E.gear=g; E.rpm*=g>1?0.62:1;}      // the change: the revs drop
  E.rpm+=(want-E.rpm)*Math.min(1,dt*(th?6:3));
  const f=E.rpm/60*2;      // four cylinders: two firings a turn
  E.o1.frequency.setTargetAtTime(f,t,0.04); E.o2.frequency.setTargetAtTime(f*2.01,t,0.04); E.o3.frequency.setTargetAtTime(f*0.5,t,0.04); E.nf.frequency.setTargetAtTime(f*4,t,0.05);
  E.f.frequency.setTargetAtTime(240+E.rpm*0.16+th*900,t,0.05); E.g.gain.setTargetAtTime(0.045+th*0.04+E.rpm/6000*0.02,t,0.08);
  /* the tyres squeal on the handbrake, braking hard, cornering fast */
  const st=Math.abs(car.steer||0), sq=car.skid!=null?car.skid:clamp((I.hand&&v>4?0.9:0)+(I.brk&&car.v>8?0.5:0)+(st>0.3&&v>10?(st-0.3)*2.2*(v/20):0),0,1);
  E.sqg.gain.setTargetAtTime(sq*0.07,t,0.06); E.sqf.frequency.setTargetAtTime(1600+Math.random()*500,t,0.05);
  A.gtaSkid=sq;}

/* =====================================================================
   The radio: four stations, made up as they play
   ===================================================================== */
const STATIONS=[{name:'Bialik Beats',fm:'99.1',tag:'lo-fi beats from Bialik St',bpm:84},{name:'Radio Mizrahit',fm:'104.5',tag:'the hits of the east',bpm:98},{name:'Synth City',fm:'88.8',tag:'night drive',bpm:108},{name:'Jazz on the Square',fm:'94.0',tag:'swing from Rambam Square',bpm:132}];
const RD={on:false,st:Math.floor(Math.random()*STATIONS.length),next:0,step:0,timer:null,bus:null,bar:0,chord:0};
const mtof=function(m){return 440*Math.pow(2,(m-69)/12);};
function rbus(){if(RD.bus) return RD.bus; const c=shared(), g=c.createGain(), f=c.createBiquadFilter(), hp=c.createBiquadFilter(); f.type='lowpass'; f.frequency.value=7000; hp.type='highpass'; hp.frequency.value=70; g.gain.value=0; g.connect(hp).connect(f).connect(B.radio); RD.bus=g; return g;}
/* the instruments */
function kick(t,v){const c=shared(), o=c.createOscillator(), g=c.createGain(); o.frequency.setValueAtTime(150,t); o.frequency.exponentialRampToValueAtTime(42,t+0.12); g.gain.setValueAtTime(v,t); g.gain.exponentialRampToValueAtTime(0.0001,t+0.3); o.connect(g).connect(rbus()); o.start(t); o.stop(t+0.32);}
function snare(t,v,tight){burst(rbus(),tight?0.12:0.22,'highpass',1400,0.6,v,t); tone(rbus(),'triangle',220,160,0.08,v*0.5,t);}
function hat(t,v,open){burst(rbus(),open?0.18:0.04,'highpass',7000,0.7,v,t);}
function pluck(t,m,v,dur,bright){const c=shared(), o=c.createOscillator(), f=c.createBiquadFilter(), g=c.createGain(); o.type='sawtooth'; o.frequency.value=mtof(m); f.type='lowpass'; f.frequency.setValueAtTime(bright||2400,t); f.frequency.exponentialRampToValueAtTime(400,t+dur);
  g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(v,t+0.005); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); o.connect(f).connect(g).connect(rbus()); o.start(t); o.stop(t+dur+0.05);}
function keys(t,ms,v,dur){ms.forEach(function(m){const c=shared(), o=c.createOscillator(), o2=c.createOscillator(), g=c.createGain(); o.type='sine'; o2.type='triangle'; o.frequency.value=mtof(m); o2.frequency.value=mtof(m)*2.001; const g2=c.createGain(); g2.gain.value=0.25;
  g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(v,t+0.02); g.gain.exponentialRampToValueAtTime(v*0.4,t+dur*0.5); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); o.connect(g); o2.connect(g2).connect(g); g.connect(rbus()); o.start(t); o2.start(t); o.stop(t+dur+0.05); o2.stop(t+dur+0.05);});}
function pad(t,ms,v,dur){ms.forEach(function(m){[-7,7].forEach(function(dt2){const c=shared(), o=c.createOscillator(), f=c.createBiquadFilter(), g=c.createGain(); o.type='sawtooth'; o.frequency.value=mtof(m); o.detune.value=dt2; f.type='lowpass'; f.frequency.value=1300;
  g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(v,t+dur*0.3); g.gain.linearRampToValueAtTime(0.0001,t+dur); o.connect(f).connect(g).connect(rbus()); o.start(t); o.stop(t+dur+0.05);});});}
function bass(t,m,v,dur,type){const c=shared(), o=c.createOscillator(), f=c.createBiquadFilter(), g=c.createGain(); o.type=type||'sine'; o.frequency.value=mtof(m); f.type='lowpass'; f.frequency.value=type==='sawtooth'?900:500;
  g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(v,t+0.01); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); o.connect(f).connect(g).connect(rbus()); o.start(t); o.stop(t+dur+0.05);}
function darbuka(t,kind,v){if(kind==='dum'){tone(rbus(),'sine',120,70,0.28,v,t);} else{burst(rbus(),0.07,'bandpass',kind==='tek'?3200:2200,1.5,v*0.8,t); tone(rbus(),'triangle',520,400,0.05,v*0.3,t);}}
/* each station writes one sixteenth at a time */
const PROG={lofi:[[48,51,55,58,62],[53,56,60,63,67],[46,50,53,56,60],[51,55,58,62,65]],synth:[[57,60,64],[53,57,60],[48,52,55],[55,59,62]],jazz:[[50,53,57,60],[55,59,62,65],[48,52,55,59],[57,61,64,67]]};
const HIJAZ=[62,63,66,67,69,70,72,74];
function writeStep(st,i,t,s16){const bar=Math.floor(i/16), b=i%16, ch=bar%4;
  if(st===0){const p=PROG.lofi[ch]; if(b===0||b===10) kick(t,0.5); if(b===4||b===12) snare(t,0.16); if(b%2===0) hat(t,0.03+(b%4===2?0.02:0)); if(b===0) keys(t,p.slice(1),0.05,s16*15); if(b===0||b===7||b===10) bass(t,p[0]-12,0.22,s16*(b===0?6:3));
    if(b===14&&Math.random()<0.5) keys(t,[p[4]+12],0.04,s16*2); if(b===0) burst(rbus(),s16*15,'bandpass',4000,0.3,0.006,t);}      // and the crackle of the record
  else if(st===1){const pat='D..t..T.D.t.T...', k=pat[b]; if(k==='D') darbuka(t,'dum',0.4); else if(k==='T') darbuka(t,'tek',0.22); else if(k==='t') darbuka(t,'ka',0.14); if(b===0||b===8) bass(t,50,0.25,s16*6);
    if(b%2===0&&Math.random()<0.75){RD.mel=clamp((RD.mel==null?3:RD.mel)+Math.floor(Math.random()*3)-1,0,7); pluck(t,HIJAZ[RD.mel]+(bar%8>=4?12:0),0.1,s16*(Math.random()<0.3?4:2),2600);}
    if(b===0&&bar%4===0) pad(t,[50,57,62],0.03,s16*16);}
  else if(st===2){const p=PROG.synth[ch]; if(b%4===0) kick(t,0.45); if(b===4||b===12) snare(t,0.2); if(b%2===1) hat(t,0.025); bass(t,p[0]-24+(b%2?12:0),0.13,s16*0.9,'sawtooth');
    if(b===0) pad(t,p,0.035,s16*16); if(b%2===0) pluck(t,p[(b/2)%3]+12+(b>=8?12:0),0.05,s16*1.6,3500);}
  else{const p=PROG.jazz[ch], sw=(b%4===2?s16*0.33:0); if(b%4===0||b%4===3) hat(t+sw,b%4===0?0.04:0.025,true); if(b%4===0) bass(t,p[0]-12+[0,4,7,5][b/4|0],0.24,s16*3.5,'triangle');
    if((b===6||b===14)&&Math.random()<0.7) keys(t+sw,p.map(function(m){return m+12;}),0.035,s16*3); if(b===12&&Math.random()<0.4) snare(t+sw,0.05,true);}}
function schedule(){if(!RD.on||paused) return; const c=shared(), st=STATIONS[RD.st], s16=60/st.bpm/4;
  if(RD.next<c.currentTime) RD.next=c.currentTime+0.06;
  while(RD.next<c.currentTime+0.25){writeStep(RD.st,RD.step,RD.next,s16); RD.step++; RD.next+=s16;}}
function radioOn(on){const c=shared(), t=c.currentTime; if(on===RD.on) return; RD.on=on; const g=rbus();
  if(on){RD.next=t+0.3; RD.step=0; g.gain.cancelScheduledValues(t); g.gain.setTargetAtTime(1,t+0.2,0.3); if(!RD.timer) RD.timer=setInterval(schedule,50); tune(); show();}
  else{g.gain.setTargetAtTime(0,t,0.15); setTimeout(function(){if(!RD.on&&RD.timer){clearInterval(RD.timer); RD.timer=null;}},600);}}
function tune(){burst(B.radio,0.35,'bandpass',2600,0.4,0.08);}
function station(d){if(RD.st<0) RD.st=0; RD.st=(RD.st+d+STATIONS.length+1)%(STATIONS.length+1); if(RD.st===STATIONS.length){radioOn(false); RD.off=true; show(); return;}
  RD.off=false; if(!RD.on) radioOn(true); else{RD.step=0; RD.next=shared().currentTime+0.25; tune(); show();}}
/* the station's name, top middle, as GTA shows it */
const tag=document.createElement('div'); tag.id='gRadio'; tag.style.cssText='position:absolute;left:50%;top:calc(14px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:4;pointer-events:none;text-align:center;color:#fff;opacity:0;transition:opacity .4s;text-shadow:0 2px 6px rgba(0,0,0,.8)';
function show(){if(!A.stage) return; if(!tag.parentNode) A.stage.appendChild(tag); const s=STATIONS[RD.st];
  tag.innerHTML=RD.off||!s?'<b style="font:italic 700 26px/1 \'Barlow Condensed\',sans-serif">Radio off</b>':'<b style="font:italic 700 28px/1 \'Barlow Condensed\',sans-serif">'+s.name+' '+s.fm+'</b><br><span style="font:600 15px/1.4 \'Barlow Condensed\',sans-serif;opacity:.85">'+s.tag+'</span>';
  tag.style.opacity=1; clearTimeout(show.h); show.h=setTimeout(function(){tag.style.opacity=0;},2600);}
window.addEventListener('keydown',function(e){if(!A.simsOn||A.paused||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return; const k=e.key.toLowerCase(); if(k==='q'&&!e.repeat&&A.drive&&A.drive.on&&A.drive.on()) station(e.shiftKey?-1:1);});
let inCar=false;
function radio(){const d=!!(A.simsOn&&A.drive&&A.drive.on&&A.drive.on()&&!A.paused); if(d!==inCar){inCar=d; if(d){if(!RD.off) radioOn(true); else show();} else radioOn(false);}}

/* =====================================================================
   The dispatcher, and the stings
   ===================================================================== */
function voices(){return !!(window.speechSynthesis&&(!A.gtaSet||A.gtaSet.get('dispatch')!=='off'));}
/* the dispatcher speaks Hebrew, as the police here do, where the device has a Hebrew voice; English where it has none, or by choice */
try{if(window.speechSynthesis) window.speechSynthesis.getVoices();}catch(e){}      /* the browser loads its voices when first asked: ask now, so they are there when the stars come */
function hebrew(){if(!A.gtaSet||A.gtaSet.get('dispatch')!=='he') return null; try{return window.speechSynthesis.getVoices().find(function(v){return /^he|^iw/i.test(v.lang);})||null;}catch(e){return null;}}
function say(text,o){if(!voices()) return; try{const u=new SpeechSynthesisUtterance(text); u.rate=(o&&o.rate)||1.05; u.pitch=(o&&o.pitch)||0.9; u.volume=clamp(((o&&o.vol)||0.55)*(A.gtaSet?A.gtaSet.get('master'):0.8),0,1); if(o&&o.voice){u.voice=o.voice; u.lang=o.voice.lang;} else u.lang='en-US'; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);}catch(e){}}
let lastDisp=0;
function dispatch(level,m){const c=shared(), t=c.currentTime; if(A.t-lastDisp<6) return; lastDisp=A.t;
  burst(B.sfx,0.25,'bandpass',1800,1.2,0.05); tone(B.sfx,'square',1200,1200,0.07,0.02,t+0.26); tone(B.sfx,'square',1600,1600,0.07,0.02,t+0.36);
  const q=A.town&&A.town.roadNear?A.town.roadNear(m.x,m.z):null, st=q&&q.d<10&&q.r.name?q.r.name:'Haroe Street', he=hebrew();
  if(he){const hs=q&&q.d<10&&q.r.he?q.r.he:'הרואה';
    const HL=level>=4?['לכל הניידות, לכל הניידות: החשוד חמוש ומסוכן, נראה לאחרונה ברחוב '+hs+'. מסוק בדרך.','מוקד לכל הניידות: אירוע ירי ברחוב '+hs+'. המסוק בדרך אליכם.']:level>=3?['לכל הניידות, דיווח על יריות ברחוב '+hs+'. להתקדם בזהירות.','חשוד אלים ברחוב '+hs+'. כל הניידות הפנויות, להגיע.']:level>=2?['ניידות באזור, חשוד נמלט ברחוב '+hs+'.','מוקד: תקיפה ברחוב '+hs+'. ניידות, להגיע.']:['ניידת שתים עשרה, דיווח על הפרת סדר ברחוב '+hs+'.','חשוד אפשרי ברחוב '+hs+'. ניידות באזור, לבדוק.'];
    setTimeout(function(){say('מוקד. '+rnd(HL),{rate:1.1,pitch:0.85,vol:0.5,voice:he});},500); return;}
  const lines=level>=4?['All units, all units: the suspect is armed and dangerous, last seen on '+st+'. Air support is on the way.','Dispatch to all units: a shooting incident on '+st+'. Air unit is responding.']:level>=3?['All units, shots fired near '+st+'. Proceed with caution.','We have a violent suspect on '+st+'. All available units respond.']:level>=2?['Units in the area, a suspect is fleeing on '+st+'.','Dispatch: assault in progress on '+st+'. Units respond.']:['Unit twelve, a disturbance reported on '+st+'.','Possible suspect on '+st+'. Units in the area, check it out.'];
  setTimeout(function(){say('Dispatch. '+rnd(lines),{rate:1.15,pitch:0.8,vol:0.5});},500);}
function sting(kind){const c=shared(), t=c.currentTime, g=c.createGain(); g.gain.value=1; g.connect(B.master);
  if(kind==='wasted'){tone(g,'sine',90,30,2.6,0.4,t); burst(g,2.2,'lowpass',500,0.5,0.25,t); [196,185,174].forEach(function(f,i){tone(g,'sawtooth',f,f*0.97,1.8,0.04,t+0.6+i*0.25);});}
  else{tone(g,'sine',110,55,1.4,0.35,t); [523,415,349].forEach(function(f,i){tone(g,'square',f,f,0.3,0.03,t+0.5+i*0.32);}); burst(g,0.4,'bandpass',1800,1,0.08,t+0.1);}}
/* a pistol shot: a crack and a thump, its echo off the blocks; quieter and duller the farther off */
function shot(x,z,mine){const SM=A.sims, p=SM&&SM.player, c=shared(), t=c.currentTime, d=mine||!p?0:Math.hypot(x-p.x,z-p.z), vol=clamp(0.9/(1+d*0.08),0.05,0.8);
  const n=Math.floor(c.sampleRate*0.32), b=c.createBuffer(1,n,c.sampleRate), dd=b.getChannelData(0); for(let i=0;i<n;i++){const k=i/n; dd[i]=(Math.random()*2-1)*Math.pow(1-k,6)*(k<0.01?2:1);}
  const s=c.createBufferSource(), hp=c.createBiquadFilter(), lp=c.createBiquadFilter(), g=c.createGain(); s.buffer=b; hp.type='highpass'; hp.frequency.value=300; lp.type='lowpass'; lp.frequency.value=3800-Math.min(3000,d*30); g.gain.value=vol; s.connect(hp).connect(lp).connect(g).connect(B.out); s.start(t);
  tone(B.out,'sine',140,40,0.2,vol*0.9,t);}
/* a whistle through the fingers, for a taxi */
function whistle(){const c=shared(), t=c.currentTime; tone(B.sfx,'sine',1900,2600,0.16,0.07,t); tone(B.sfx,'sine',2600,2000,0.24,0.07,t+0.17);}
/* a car going up: a bang that drops into a long low rumble, duller and quieter the farther off */
function boom(x,z){const SM=A.sims, p=SM&&SM.player, c=shared(), t=c.currentTime, d=p?Math.hypot(x-p.x,z-p.z):0, vol=clamp(1.2/(1+d*0.03),0.08,1);
  const n=Math.floor(c.sampleRate*1.6), b=c.createBuffer(1,n,c.sampleRate), dd=b.getChannelData(0); for(let i=0;i<n;i++){const k=i/n; dd[i]=(Math.random()*2-1)*Math.pow(1-k,2.2)*(k<0.02?2.5:1);}
  const s=c.createBufferSource(), lp=c.createBiquadFilter(), g=c.createGain(); s.buffer=b; lp.type='lowpass'; lp.frequency.setValueAtTime(2600-Math.min(2000,d*12),t); lp.frequency.exponentialRampToValueAtTime(180,t+1.4); g.gain.value=vol; s.connect(lp).connect(g).connect(B.out); s.start(t);
  tone(B.out,'sine',70,28,1.2,vol*0.9,t); tone(B.out,'triangle',120,40,0.5,vol*0.5,t);}
/* a scream down the street: a voice's 'ah', two formants over a rising, shaking pitch */
let screamT=0;
function scream(x,z){const SM=A.sims, p=SM&&SM.player; if(!p||A.t<screamT) return; screamT=A.t+1.5; const c=shared(), t=c.currentTime, d=Math.hypot(x-p.x,z-p.z), vol=clamp(0.1/(1+d*0.09),0.006,0.08), she=Math.random()<0.5;
  const o=c.createOscillator(), vib=c.createOscillator(), vg=c.createGain(), f1=c.createBiquadFilter(), f2=c.createBiquadFilter(), g=c.createGain(), base=she?620:360;
  o.type='sawtooth'; o.frequency.setValueAtTime(base,t); o.frequency.linearRampToValueAtTime(base*1.45,t+0.25); o.frequency.linearRampToValueAtTime(base*1.2,t+0.9); vib.frequency.value=7; vg.gain.value=base*0.04; vib.connect(vg).connect(o.frequency);
  f1.type='bandpass'; f1.frequency.value=she?950:750; f1.Q.value=5; f2.type='bandpass'; f2.frequency.value=she?1500:1200; f2.Q.value=7;
  g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+0.06); g.gain.setValueAtTime(vol,t+0.6); g.gain.exponentialRampToValueAtTime(0.0001,t+1.0);
  o.connect(f1); o.connect(f2); f1.connect(g); f2.connect(g); g.connect(B.out); o.start(t); vib.start(t); o.stop(t+1.05); vib.stop(t+1.05);}
function lost(){const c=shared(), t=c.currentTime; [523,659,784,1046].forEach(function(f,i){tone(B.sfx,'triangle',f,f,0.25,0.05,t+i*0.09);});}
function cash(){const c=shared(), t=c.currentTime; tone(B.sfx,'triangle',1568,1568,0.12,0.06,t); tone(B.sfx,'triangle',2093,2093,0.3,0.06,t+0.08); burst(B.sfx,0.15,'highpass',5000,0.6,0.03,t);}
function passed(){const c=shared(), t=c.currentTime, g=c.createGain(), f=c.createBiquadFilter(); f.type='lowpass'; f.frequency.value=2600; g.gain.value=1; g.connect(f).connect(B.master);      // a short brassy fanfare
  [[60,64,67],[62,65,69],[64,67,72]].forEach(function(ch,i){ch.forEach(function(m){const fr=440*Math.pow(2,(m-69)/12); tone(g,'sawtooth',fr,fr,i<2?0.16:0.9,0.035,t+i*0.14); tone(g,'square',fr*0.5,fr*0.5,i<2?0.16:0.9,0.015,t+i*0.14);});});}
function blip(){const c=shared(), t=c.currentTime; tone(B.sfx,'sine',880,1320,0.08,0.06,t);}
function pause(on){paused=on; const c=shared(); if(on){if(window.speechSynthesis) window.speechSynthesis.cancel(); c.suspend();} else c._resume(); burst(B.master,0.25,'bandpass',on?600:1200,0.8,0.04);}

/* out of Sims mode: the voices that hum on underneath are stopped, and made again when you come back */
function hush(){if(!V.length&&!hum) return; const t=ctx.currentTime; V.forEach(function(v){v.g.gain.setTargetAtTime(0,t,0.1); const n=v; setTimeout(function(){try{n.o.stop(); n.o2.stop(); n.n.stop();}catch(e){}},600);}); V.length=0;
  if(hum){const h=hum; hum=null; h.g.gain.setTargetAtTime(0,t,0.1); setTimeout(function(){try{h.s.stop(); h.l.stop();}catch(e){}},600);}}
/* ---------- every frame ---------- */
A.frameFns.push(function(dt){if(!ctx){if(!A.simsOn) return; shared();}
  if(A.simsOn){steps(); traffic(); city(dt);} else if(B){B.out.gain.setTargetAtTime(0,ctx.currentTime,0.3); hush();}
  radio();});
window.addEventListener('load',function(){if(A.gtaSet) A.gtaSet.on(function(k){if(k==='master'||k==='radio'||k==='sfx') volumes();});});
A.gtaSound={boom:boom,whistle:whistle,ctx:shared,bus:function(n){shared(); return n==='out'?B.out:n==='radio'?B.radio:n==='master'?B.master:B.sfx;},engine:engine,rev:rev,scream:scream,shot:shot,jump:jumpS,land:landS,dispatch:dispatch,sting:sting,lost:lost,cash:cash,passed:passed,blip:blip,pause:pause,say:say,station:station,STATIONS:STATIONS,radio:RD};
})();
