(function(root){
'use strict';
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10)},ramp=(t,a,b)=>smooth((t-a)/(b-a));
const hash=i=>{const v=Math.sin(i*127.1+311.7)*43758.5453123;return v-Math.floor(v)};
const seeds=Array.from({length:1560},(_,i)=>({a:i*2.3999632297,b:hash(i+21)*TAU,r:Math.sqrt(hash(i+829)),s:hash(i+129),c:hash(i+1531),p:hash(i+57)*TAU,group:hash(i+401),u:hash(i+733),v:hash(i+1091),z:hash(i+615)}));
const geometryCache=new Map();
function geometry(time,count=1560){
 const key=time+'-'+count;if(geometryCache.has(key))return geometryCache.get(key);if(geometryCache.size>5)geometryCache.clear();
 const phase=TAU*time/10,tilt=.35+.12*Math.sin(phase),lean=-.18+.12*Math.sin(phase),points=[];
 for(let i=0;i<count;i++){
  const s=seeds[i],a=s.a+phase,b=s.b+.38*Math.sin(phase+s.p),pulse=Math.sin(a*3-phase)*9+Math.cos(a*2+phase)*6;
  const tube=12+42*s.r,rad=294+pulse+tube*Math.cos(b),x=Math.cos(a)*rad,y=Math.sin(a)*rad,z=tube*Math.sin(b);
  const yy=y*Math.cos(tilt)-z*Math.sin(tilt),zz=y*Math.sin(tilt)+z*Math.cos(tilt),xx=x*Math.cos(lean)-yy*Math.sin(lean),yyy=x*Math.sin(lean)+yy*Math.cos(lean),persp=1+zz/1900;
  const stagger=(s.s-.5)*.18,m=ramp(time,1.35+stagger,2.85+stagger)*(1-ramp(time,8.25+stagger,9.9+stagger));
  let tx,ty;if(s.group<.5865){tx=(s.u-.5)*182;ty=(s.v-.5)*650}else{tx=(s.u<.5?-1:1)*(91+((s.u*2)%1)*234);ty=(s.v-.5)*182}
  const drift=2.4*Math.sin(phase*2+s.p),angle=.025*Math.sin(phase),turn=.12*Math.sin(phase),rawZ=(s.z-.5)*55;
  const turnedX=tx*Math.cos(turn)+rawZ*Math.sin(turn),px=turnedX*Math.cos(angle)-ty*Math.sin(angle),py=turnedX*Math.sin(angle)+ty*Math.cos(angle),pz=-tx*Math.sin(turn)+rawZ*Math.cos(turn);
  const nx=500+xx*persp*(1-m)+(px+drift)*m+Math.sin(m*Math.PI)*Math.sin(s.p)*48,ny=500+yyy*persp*(1-m)+(py+drift*.6)*m+Math.sin(m*Math.PI)*Math.cos(s.p)*48,nz=zz*(1-m)+pz*m;
  const depth=clamp((nz+155)/310),sweep=(1-m)*Math.pow(.5+.5*Math.cos(a-phase*2-.7),9)+m*Math.exp(-Math.pow((px+py*.22-420*Math.sin(phase))/135,2)),alpha=(.48+.34*depth+.16*sweep)*(.94+.06*Math.sin(phase*2+s.p)),radius=(1.35+Math.pow(s.s,3)*3.6)*(1+depth*.3);
  points.push({x:nx,y:ny,z:nz,r:radius,a:alpha,depth,sweep,c:s.c,i});
 }points.sort((a,b)=>a.z-b.z);geometryCache.set(key,points);return points;
}
function draw(ctx,w,h,t,{artwork=false,intensity=1,particles=true}={}){
 const square=w/h<2,hero=artwork?{x:w/2,y:h/2,size:Math.min(w,h)*.98}:square?{x:w*.5,y:h*.51,size:Math.min(w,h)*.98}:{x:w*.54,y:h*.5,size:h*1.68},radius=Math.min(w,h)*.83;
 ctx.clearRect(0,0,w,h);const bg=ctx.createRadialGradient(w/2,h/2,0,w/2,h/2,radius);
 bg.addColorStop(0,'#23060c');bg.addColorStop(.28,'#160409');bg.addColorStop(.62,'#080205');bg.addColorStop(1,'#010102');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);if(!particles)return;
 ctx.save();ctx.translate(hero.x-hero.size/2,hero.y-hero.size/2);ctx.scale(hero.size/1000,hero.size/1000);
 const pts=geometry(t,w<350?900:1560);ctx.globalCompositeOperation='lighter';
 for(const p of pts){const a=p.a*intensity;
  if(p.i%13===0||p.sweep>.65&&p.i%5===0){const r=p.r*(3.8+1.4*(1-p.depth)),g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,r);g.addColorStop(0,'rgba(255,95,109,'+(a*.4)+')');g.addColorStop(1,'rgba(255,35,65,0)');ctx.globalAlpha=1;ctx.fillStyle=g;ctx.fillRect(p.x-r,p.y-r,r*2,r*2)}
  ctx.globalAlpha=a;ctx.fillStyle=p.c<.32?'#ff465c':p.c<.5?'#ff7888':p.c<.84?'#fff2f4':'#fffaf6';ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,TAU);ctx.fill();
  if(p.depth>.7&&p.c>.88){ctx.globalAlpha=a*.8;ctx.fillStyle='#fff9f2';ctx.beginPath();ctx.arc(p.x-p.r*.22,p.y-p.r*.25,p.r*.34,0,TAU);ctx.fill()}
 }
 for(let i=0;i<32;i++){const p=seeds[i+1500],a=p.a+TAU*t/10,r=355+hash(i+997)*100,x=500+Math.cos(a)*r,y=500+Math.sin(a)*r*.85;ctx.globalAlpha=(.08+.09*p.s)*intensity;ctx.fillStyle=p.c>.5?'#f6d9db':'#cd314b';ctx.beginPath();ctx.arc(x,y,1+3*p.s,0,TAU);ctx.fill()}
 ctx.restore();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
}
const artFrames=new Map();
let serial=0;
function mount(host,d,logo,{artwork=false,animation='particles',assets={}}={}){
 const w=artwork?1200:d.w,h=artwork?1200:d.h,id='scene'+(++serial),square=w/h<2;
 host.style.aspectRatio=w+'/'+h;
 const normalSize=Math.min(w,h),hero={x:w*.5,y:artwork?h*.5:h*.49,size:animation==='glass'?normalSize*(artwork||w/h>.8?.9:1.16):normalSize*(artwork||w/h<.8?1.13:.97)};
 if(!square&&!artwork){hero.x=w*.54;hero.y=h/2;hero.size=h*(animation==='glass'?2.15:1.1)}
 const fixed=animation==='glass'?'<defs><image id="'+id+'-texture" href="'+assets.plus+'" width="1000" height="1000"/></defs>':'';
 let copy=artwork?'':'<image href="'+logo+'" x="'+d.logo.x+'" y="'+d.logo.y+'" width="'+d.logo.w+'" height="'+d.logo.h+'"/><g data-role="brand">'+d.brand+'</g><g class="opening">'+d.opening+'</g><g class="closing">'+d.closing+'</g><g class="cta">'+d.cta+'</g>';
 copy=copy.replace(/id="([^"]+)"/g,(_,v)=>'id="'+id+'-'+v+'"').replace(/url\(#([^)]+)\)/g,(_,v)=>'url(#'+id+'-'+v+')');
 host.innerHTML='<canvas aria-hidden="true"></canvas><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+w+' '+h+'" role="img" aria-label="'+(artwork?'CaseMap '+animation+' animation':d.label)+'">'+fixed+'<g class="art" transform="translate('+(hero.x-hero.size/2)+' '+(hero.y-hero.size/2)+') scale('+(hero.size/1000)+')"></g>'+copy+'</svg>';
 const canvas=host.querySelector('canvas'),ctx=canvas.getContext('2d'),opening=host.querySelector('.opening'),closing=host.querySelector('.closing'),cta=host.querySelector('.cta'),art=host.querySelector('.art');
 let ratio=1,lastTime=0,lastLoop=true,scene;
 function resize(){ratio=Math.min(2,window.devicePixelRatio||1)*Math.min(1,(host.clientWidth||w)/w);canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);if(scene)scene.paint(lastTime,lastLoop)}
 const observer=new ResizeObserver(resize);observer.observe(host);resize();
 scene={paint(t,loop=true){
  lastTime=t;lastLoop=loop;
  const end=loop?ramp(t,9.45,10):0,op=(1-ramp(t,2.3,2.8))*(1-end)+end,cl=ramp(t,3.5,4)*(1-end),ct=ramp(t,4,4.35)*(1-end),reveal=ramp(t,2.1,2.75)*(1-ramp(t,3.35,4.1));
  const intensity=artwork?1:.46+.54*reveal;
  ctx.setTransform(ratio,0,0,ratio,0,0);draw(ctx,w,h,t,{artwork,intensity,particles:animation==='particles'});
  if(animation!=='particles'){
   const kind=animation==='glass'?'plus':'globe',artTime=animation==='glass'?(t+1.3)%10:t;
   const frameKey=kind+'-'+artTime;if(artFrames.size>5)artFrames.clear();if(!artFrames.has(frameKey))artFrames.set(frameKey,CaseMapArt.artwork(kind,artTime,assets[kind],'shared-art'));const frame=artFrames.get(frameKey),a={defs:frame.defs.replaceAll('shared-art',id),body:frame.body.replaceAll('shared-art',id)};
   const defs=animation==='glass'?a.defs.replace(/<image[\s\S]*?<\/image>/g,''):a.defs;
   art.innerHTML='<defs>'+defs+'</defs>'+a.body;
   art.style.opacity=artwork?1:animation==='glass'?.65+.35*reveal:.18+.82*reveal;
  }
  if(!artwork){const lift=Math.min(10,h*.014);opening.style.opacity=op;closing.style.opacity=cl;cta.style.opacity=ct;opening.setAttribute('transform','translate(0 '+(-lift*(1-op))+')');closing.setAttribute('transform','translate(0 '+(lift*(1-cl))+')')}
 },destroy(){observer.disconnect()}};
 return scene;
}
root.ParticleHalo={mount,draw,geometry,duration:10};
})(typeof window==='undefined'?globalThis:window);
