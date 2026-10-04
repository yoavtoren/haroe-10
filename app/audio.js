/* Haroe 10 — sound, all generated in the browser: three small jazz records for the turntable, and household noises */
(function(){
'use strict';
const A=window.APP;
let ac=null, master=null, noise=null;
function ctx(){
  if(!ac){
    try{
      ac=new (window.AudioContext||window.webkitAudioContext)();
      master=ac.createGain(); master.gain.value=0.9;
      const comp=ac.createDynamicsCompressor(); master.connect(comp); comp.connect(ac.destination);
      noise=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate); const d=noise.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
    }catch(e){ac=null;}
  }
  if(ac&&ac.state==='suspended') ac.resume();
  return ac;
}
const mtof=function(m){return 440*Math.pow(2,(m-69)/12);};
function noiseSrc(){const s=ac.createBufferSource(); s.buffer=noise; s.loop=true; s.loopStart=Math.random(); return s;}

/* ---------- household loops and one-shots ---------- */
const loops={};
const LOOP={
  shower:function(g){const s=noiseSrc(), f=ac.createBiquadFilter(); f.type='bandpass'; f.frequency.value=2400; f.Q.value=0.5; s.connect(f); f.connect(g); s.start(); return {vol:0.11,src:[s]};},
  tap:function(g){const s=noiseSrc(), f=ac.createBiquadFilter(); f.type='bandpass'; f.frequency.value=3400; f.Q.value=0.9; s.connect(f); f.connect(g); s.start(); return {vol:0.05,src:[s]};},
  sizzle:function(g){const s=noiseSrc(), f=ac.createBiquadFilter(), m=ac.createGain(), l=noiseSrc(), lf=ac.createBiquadFilter(), lg=ac.createGain();
    f.type='highpass'; f.frequency.value=5200; lf.type='lowpass'; lf.frequency.value=14; lg.gain.value=6; m.gain.value=0.5;
    s.connect(f); f.connect(m); m.connect(g); l.connect(lf); lf.connect(lg); lg.connect(m.gain); s.start(); l.start(); return {vol:0.05,src:[s,l]};},       // crackles: slow noise opens and closes the hiss
  vacuum:function(g){const o=ac.createOscillator(), og=ac.createGain(), s=noiseSrc(), f=ac.createBiquadFilter(); o.type='sawtooth'; o.frequency.value=118; og.gain.value=0.25;
    f.type='lowpass'; f.frequency.value=1100; o.connect(og); og.connect(f); s.connect(f); f.connect(g); o.start(); s.start(); return {vol:0.045,src:[o,s]};},
  washer:function(g){const o=ac.createOscillator(), s=noiseSrc(), f=ac.createBiquadFilter(), l=ac.createOscillator(), lg=ac.createGain(), m=ac.createGain();
    o.type='sine'; o.frequency.value=58; f.type='lowpass'; f.frequency.value=260; l.frequency.value=0.9; lg.gain.value=0.35; m.gain.value=0.6;
    o.connect(m); s.connect(f); f.connect(m); l.connect(lg); lg.connect(m.gain); m.connect(g); o.start(); s.start(); l.start(); return {vol:0.06,src:[o,s,l]};}
};
function loop(name,on){
  if(!on&&!loops[name]) return;
  if(!ctx()) return; const cur=loops[name];
  if(on&&!cur){const g=ac.createGain(); g.gain.value=0; g.connect(master); const L=LOOP[name](g); L.g=g; g.gain.setTargetAtTime(L.vol,ac.currentTime,0.2); loops[name]=L;}
  else if(!on&&cur){cur.g.gain.setTargetAtTime(0,ac.currentTime,0.15); const src=cur.src; setTimeout(function(){src.forEach(function(n){try{n.stop();}catch(e){}});},900); delete loops[name];}
}
function tone(type,freq,t,dur,vol,dest,o){
  o=o||{}; const os=ac.createOscillator(), g=ac.createGain(); os.type=type; os.frequency.setValueAtTime(freq,t);
  if(o.slide) os.frequency.exponentialRampToValueAtTime(o.slide,t+dur);
  if(o.vib){const l=ac.createOscillator(), lg=ac.createGain(); l.frequency.value=5.2; lg.gain.setValueAtTime(0,t); lg.gain.linearRampToValueAtTime(freq*o.vib,t+Math.min(0.3,dur*0.6)); l.connect(lg); lg.connect(os.frequency); l.start(t); l.stop(t+dur+0.3);}
  const a=o.attack||0.008, r=o.release||0.06;
  g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol,t+a);
  if(o.decay) g.gain.exponentialRampToValueAtTime(Math.max(0.0005,vol*o.sustain),t+a+Math.min(o.decay,Math.max(0.02,dur-r-a-0.01)));
  g.gain.setTargetAtTime(0,t+Math.max(a,dur-r),r/3);
  let out=g; if(o.lp){const f=ac.createBiquadFilter(); f.type='lowpass'; f.frequency.value=o.lp; f.Q.value=o.q||0.7; g.connect(f); out=f;}
  os.connect(g); out.connect(dest||master); os.start(t); os.stop(t+dur+0.4);
}
function hit(t,dur,vol,type,freq,dest,q){
  const s=ac.createBufferSource(), f=ac.createBiquadFilter(), g=ac.createGain(); s.buffer=noise; s.loop=true; s.loopStart=Math.random()*1.5;
  f.type=type; f.frequency.value=freq; f.Q.value=q||0.7; g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(0.0004,t+dur);
  s.connect(f); f.connect(g); g.connect(dest||master); s.start(t); s.stop(t+dur+0.05);
}
const BLIP={
  ding:function(t){tone('sine',1318,t,0.5,0.09,null,{decay:0.4,sustain:0.05}); tone('sine',1760,t+0.16,0.7,0.08,null,{decay:0.6,sustain:0.05});},
  beep:function(t){[0,0.22,0.44].forEach(function(d){tone('square',1900,t+d,0.11,0.03,null,{lp:3000});});},
  flush:function(t){const s=ac.createBufferSource(), f=ac.createBiquadFilter(), g=ac.createGain(); s.buffer=noise; s.loop=true; f.type='lowpass'; f.Q.value=2;
    f.frequency.setValueAtTime(2600,t); f.frequency.exponentialRampToValueAtTime(300,t+2.6); g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(0.22,t+0.15); g.gain.setTargetAtTime(0,t+1.6,0.5);
    s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t+3.6);},
  pour:function(t){hit(t,2.4,0.06,'bandpass',900,null,1.5); tone('sine',180,t,2.2,0.02,null,{slide:420});},
  click:function(t){hit(t,0.03,0.12,'highpass',2500);},
  pop:function(t){tone('sine',420,t,0.09,0.08,null,{slide:160});},
  zip:function(t){hit(t,0.25,0.05,'bandpass',3000,null,3);}
};
function blip(name){if(!ctx()) return; BLIP[name](ac.currentTime+0.02);}

/* ---------- the record player: a small jazz combo, written in chords and played live ---------- */
const NOTE={C:0,'C#':1,Db:1,D:2,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,Ab:8,A:9,Bb:10,B:11};
const QUAL={'7':[0,4,7,10],'m7':[0,3,7,10],'maj7':[0,4,7,11],'m7b5':[0,3,6,10],'dim7':[0,3,6,9],'m6':[0,3,7,9]};
const SCALE={'7':[0,2,4,5,7,9,10],'m7':[0,2,3,5,7,9,10],'maj7':[0,2,4,5,7,9,11],'m7b5':[0,1,3,5,6,8,10],'dim7':[0,2,3,5,6,8,9,11],'m6':[0,2,3,5,7,9,11]};
function bars(s){return s.split('|').map(function(b){const c=b.trim().split(/\s+/); return c.map(function(x){const m=x.match(/^([A-G][b#]?)(.*)$/); return {root:NOTE[m[1]],q:m[2]};});});}
const TRACKS=[
  {name:'Haroe Blues',bpm:128,swing:0.66,style:'swing',lead:'sax',bars:bars('F7 | Bb7 | F7 | Cm7 F7 | Bb7 | Bdim7 | F7 | Am7b5 D7 | Gm7 | C7 | F7 D7 | Gm7 C7')},
  {name:'Bossa for Angela',bpm:138,swing:0.5,style:'bossa',lead:'flute',bars:bars('Dm7 | Dm7 | G7 | G7 | Cmaj7 | Cmaj7 | Em7 | A7 | Dm7 | G7 | Em7 | A7 | Dm7 | G7 | Cmaj7 | Cmaj7')},
  {name:'After Hours',bpm:80,swing:0.64,style:'ballad',lead:'vibes',bars:bars('Cm7 | F7 | Bbmaj7 | Ebmaj7 | Am7b5 | D7 | Gm6 | Gm6')}
];
const RHY={swing:[[1,2,3,4,6,7,8],[0,2,3,5,6,9,10,12],[2,3,4,5,6,8,11,12],[0,3,4,6,8,9,10]],bossa:[[0,3,4,6,10,12],[2,3,6,8,11,12],[0,2,4,7,8,12]],ballad:[[0,4,6,8,12],[2,4,8,10,12],[0,3,6,8]]};
let music=null;
function chordAt(tr,beat){const b=tr.bars[Math.floor(beat/4)%tr.bars.length], k=beat%4; return b.length>1?b[k<2?0:1]:b[0];}
function inKey(pc,ch,list){return list.indexOf(((pc-ch.root)%12+12)%12)>=0;}
function snap(m,ch,list){for(let d=0;d<7;d++){if(inKey(m+d,ch,list)) return m+d; if(inKey(m-d,ch,list)) return m-d;} return m;}
function voice(lead,midi,t,dur,bus){
  const f=mtof(midi);
  if(lead==='sax'){tone('sawtooth',f,t,dur,0.05,bus,{attack:0.03,release:0.09,lp:1500,q:1.4,vib:0.006}); tone('sine',f,t,dur,0.03,bus,{attack:0.03,release:0.09});}
  else if(lead==='flute'){tone('sine',f,t,dur,0.075,bus,{attack:0.05,release:0.12,vib:0.007}); tone('triangle',f*2,t,dur,0.008,bus,{attack:0.06,release:0.1}); hit(t,0.08,0.012,'bandpass',f*2,bus,2);}
  else{tone('sine',f,t,Math.max(dur,0.9),0.085,bus,{decay:0.9,sustain:0.12}); tone('sine',f*4,t,0.35,0.012,bus,{decay:0.25,sustain:0.05}); tone('sine',f*2,t,0.8,0.02,bus,{decay:0.6,sustain:0.1});}
}
function phrase(M,ph){               // two bars of melody: a rhythm cell, a contour, notes pulled onto the chord on the beat
  const tr=M.tr, chorus=Math.floor(ph*2/tr.bars.length), head=chorus%3===0, cells=RHY[tr.style];
  const r=A.rng(1000*(M.i+1)+(head?(ph*2)%tr.bars.length:ph*31+chorus*7));
  const cell=cells[Math.floor(r()*cells.length)], ev=[]; let m=head?72+(ph%3)*2:(M.last||74);
  if(r()<0.18&&!head) return ev;                                   // leave space sometimes
  for(let k=0;k<cell.length;k++){
    const e=cell[k], beat=ph*8+Math.floor(e/2), ch=chordAt(tr,beat), on=e%2===0;
    m+=[-2,-1,-1,1,1,2,3,-3][Math.floor(r()*8)]; if(m>84) m-=5; if(m<66) m+=5;
    m=snap(m,ch,on?QUAL[ch.q]:SCALE[ch.q]);
    const next=k<cell.length-1?cell[k+1]:e+(tr.style==='swing'?3:4);
    ev.push({e:e,m:m,len:Math.min(next-e,tr.style==='ballad'?4:3)});
  }
  M.last=m; return ev;
}
function beat(M,n,t){
  const tr=M.tr, bd=60/tr.bpm, off=t+bd*tr.swing, k=n%4, bar=Math.floor(n/4), ch=chordAt(tr,n), nx=chordAt(tr,n+1), bus=M.bus, q=QUAL[ch.q];
  const r=A.rng(n*7919+M.i*13), root=36+ch.root;
  // rhythm section
  if(tr.style==='swing'){
    hit(t,0.16,0.035,'highpass',7000,bus); if(k%2===1){hit(off,0.09,0.02,'highpass',7000,bus); hit(t,0.05,0.03,'bandpass',9000,bus,2);}
    const changing=nx.root!==ch.root||nx.q!==ch.q;
    let b=k===0?root:k===3||changing?36+nx.root+(r()<0.5?-1:1):root+[q[1],q[2],12,q[2]][Math.floor(r()*4)]; if(k===0||(k===2&&tr.bars[bar%tr.bars.length].length>1)) b=root;
    tone('triangle',mtof(b),t,bd*0.92,0.2,bus,{attack:0.01,decay:0.3,sustain:0.35,lp:500}); tone('sine',mtof(b+12),t,bd*0.5,0.03,bus,{decay:0.2,sustain:0.2});
    const comp=(k===0)||(k===1&&bar%2===0)||(k===3&&bar%2===1&&r()<0.6), ct=k===0?t:off, cc=k===3?nx:ch;
    if(comp){const cq=QUAL[cc.q]; [cq[1],cq[3],cq[0]+14,cq[2]+12].slice(0,3).forEach(function(iv,j){const pc=(cc.root+iv)%12, m=55+((pc-55%12+12)%12);
      tone('triangle',mtof(m),ct+j*0.008,k===0?bd*0.9:bd*0.45,0.028,bus,{decay:0.35,sustain:0.25,lp:2200});});}
  }else if(tr.style==='bossa'){
    hit(t,0.04,0.016,'highpass',6500,bus); hit(t+bd*0.5,0.05,0.026,'highpass',6500,bus);
    const two=n%8; if([0,3,6].indexOf(two)>=0) hit(t,0.03,0.05,'bandpass',1800,bus,6); if(two===1||two===4) hit(t+bd*0.5,0.03,0.05,'bandpass',1800,bus,6);
    if(k===0||k===2){tone('triangle',mtof(k===0?root:root+7),t,bd*1.4,0.19,bus,{decay:0.4,sustain:0.3,lp:480});} if(k===1||k===3) tone('triangle',mtof(k===1?root+7:36+nx.root),t+bd*0.5,bd*0.45,0.13,bus,{decay:0.2,sustain:0.3,lp:480});
    const pat=bar%2===0?[[0,0],[1,0.5],[3,0]]:[[0,0.5],[2,0],[3,0.5]];
    pat.forEach(function(p){if(p[0]!==k) return; [q[1],q[3],q[0]+14].forEach(function(iv,j){const pc=(ch.root+iv)%12, m=57+((pc-57%12+12)%12);
      tone('triangle',mtof(m),t+bd*p[1]+j*0.012,bd*0.4,0.03,bus,{decay:0.22,sustain:0.1,lp:2600});});});
  }else{
    hit(t,0.5,0.012,'bandpass',4200,bus,0.6); if(k%2===1) hit(t,0.12,0.014,'highpass',6000,bus);
    if(k===0||k===2) tone('triangle',mtof(k===0?root:root+7),t,bd*1.9,0.2,bus,{decay:0.8,sustain:0.3,lp:420});
    if(k===0) [q[1],q[3],q[0]+14,q[2]+12].forEach(function(iv,j){const pc=(ch.root+iv)%12, m=53+((pc-53%12+12)%12); tone('triangle',mtof(m),t+j*0.035,bd*3.6,0.022,bus,{decay:1.6,sustain:0.25,lp:1800});});
  }
  // melody
  const bp=n%8, ph=Math.floor(n/8); if(bp===0||M.ph!==ph){M.ph=ph; M.ev=phrase(M,ph);}
  M.ev.forEach(function(e){if(Math.floor(e.e/2)!==bp) return; const st=e.e%2?off:t, len=e.len*bd*0.5*0.92; voice(tr.lead,e.m,st,len,bus);});
}
function play(i){
  stop(); if(!ctx()) return null;
  const tr=TRACKS[((i%TRACKS.length)+TRACKS.length)%TRACKS.length], bus=ac.createGain(), lp=ac.createBiquadFilter();
  lp.type='lowpass'; lp.frequency.value=5200; bus.gain.value=0; bus.connect(lp); lp.connect(master); bus.gain.setTargetAtTime(0.85,ac.currentTime,0.4);
  const cr=noiseSrc(), cf=ac.createBiquadFilter(), cgn=ac.createGain(); cf.type='highpass'; cf.frequency.value=3000; cgn.gain.value=0.012; cr.connect(cf); cf.connect(cgn); cgn.connect(bus); cr.start();       // surface noise
  const M={tr:tr,i:TRACKS.indexOf(tr),bus:bus,n:0,next:ac.currentTime+0.25,hiss:cr,ph:-1,ev:[]};
  M.timer=setInterval(function(){
    if(!ac) return; const bd=60/tr.bpm;
    if(M.next<ac.currentTime-0.5){M.n+=Math.ceil((ac.currentTime-M.next)/bd); M.next=ac.currentTime+0.1;}        // the tab was asleep: skip ahead rather than rush
    while(M.next<ac.currentTime+0.45){beat(M,M.n,M.next); if(Math.random()<0.12) hit(M.next+Math.random()*bd,0.012,0.03,'highpass',1500,bus); M.next+=bd; M.n++;}
  },110);
  music=M; return tr.name;
}
function stop(){
  if(!music) return; clearInterval(music.timer); const M=music; music=null;
  M.bus.gain.setTargetAtTime(0,ac.currentTime,0.12); setTimeout(function(){try{M.hiss.stop(); M.bus.disconnect();}catch(e){}},900);
}
A.audio={loop:loop,blip:blip,play:play,stop:stop,tracks:TRACKS.map(function(t){return t.name;}),playing:function(){return music?music.i:-1;},
  unlock:function(){ctx();},quiet:function(){for(const k in loops) loop(k,false);}};
['pointerdown','keydown'].forEach(function(ev){window.addEventListener(ev,function(){if(ac&&ac.state==='suspended') ac.resume();});});
})();
