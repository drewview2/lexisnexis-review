(function(root){
'use strict';
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x)},ramp=(t,a,b)=>smooth((t-a)/(b-a));
const hash=i=>{const v=Math.sin(i*127.1+311.7)*43758.5453123;return v-Math.floor(v)};
const seeds=Array.from({length:1560},(_,i)=>({a:i*2.3999632297,b:hash(i+21)*TAU,r:Math.sqrt(hash(i+829)),s:hash(i+129),c:hash(i+1531),p:hash(i+57)*TAU}));
const geometryCache=new Map();
function geometry(time,count=1560){
 const key=time+'-'+count;if(geometryCache.has(key))return geometryCache.get(key);if(geometryCache.size>5)geometryCache.clear();
 const phase=TAU*time/10,tilt=.35+.12*Math.sin(phase),lean=-.18+.12*Math.sin(phase),points=[];
 for(let i=0;i<count;i++){
  const s=seeds[i],a=s.a+phase,b=s.b+.38*Math.sin(phase+s.p),pulse=Math.sin(a*3-phase)*9+Math.cos(a*2+phase)*6;
  const tube=12+42*s.r,rad=294+pulse+tube*Math.cos(b),x=Math.cos(a)*rad,y=Math.sin(a)*rad,z=tube*Math.sin(b);
  const yy=y*Math.cos(tilt)-z*Math.sin(tilt),zz=y*Math.sin(tilt)+z*Math.cos(tilt),xx=x*Math.cos(lean)-yy*Math.sin(lean),yyy=x*Math.sin(lean)+yy*Math.cos(lean),persp=1+zz/1900;
  const depth=clamp((zz+155)/310),sweep=Math.pow(.5+.5*Math.cos(a-phase*2-.7),9),alpha=(.25+.52*depth+.2*sweep)*(.82+.18*Math.sin(phase*2+s.p)),radius=(.65+Math.pow(s.s,3)*2.35)*(1+depth*.3);
  points.push({x:500+xx*persp,y:500+yyy*persp,z:zz,r:radius,a:alpha,depth,sweep,c:s.c,i});
 }points.sort((a,b)=>a.z-b.z);geometryCache.set(key,points);return points;
}
function draw(ctx,w,h,t,{artwork=false,intensity=1}={}){
 const square=w/h<2,hero=artwork?{x:w/2,y:h/2,size:Math.min(w,h)*1.24}:square?{x:w*.5,y:h*.51,size:Math.min(w,h)*1.24}:{x:w*.54,y:h*.5,size:h*2.14},radius=Math.min(w,h)*.83;
 ctx.clearRect(0,0,w,h);const bg=ctx.createRadialGradient(w/2,h/2,0,w/2,h/2,radius);
 bg.addColorStop(0,'#23060c');bg.addColorStop(.28,'#160409');bg.addColorStop(.62,'#080205');bg.addColorStop(1,'#010102');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
 ctx.save();ctx.translate(hero.x-hero.size/2,hero.y-hero.size/2);ctx.scale(hero.size/1000,hero.size/1000);
 const pts=geometry(t,w<350?900:1560);ctx.globalCompositeOperation='lighter';
 for(const p of pts){const a=p.a*intensity;
  if(p.i%17===0||p.sweep>.65&&p.i%5===0){const r=p.r*(3.8+1.4*(1-p.depth)),g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,r);g.addColorStop(0,'rgba(255,95,109,'+(a*.22)+')');g.addColorStop(1,'rgba(255,35,65,0)');ctx.globalAlpha=1;ctx.fillStyle=g;ctx.fillRect(p.x-r,p.y-r,r*2,r*2)}
  ctx.globalAlpha=a;ctx.fillStyle=p.c<.4?'#ed354b':p.c<.55?'#a62c43':p.c<.82?'#ded0d5':'#fff0e5';ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,TAU);ctx.fill();
  if(p.depth>.7&&p.c>.88){ctx.globalAlpha=a*.8;ctx.fillStyle='#fff9f2';ctx.beginPath();ctx.arc(p.x-p.r*.22,p.y-p.r*.25,p.r*.34,0,TAU);ctx.fill()}
 }
 for(let i=0;i<32;i++){const p=seeds[i+1500],a=p.a+TAU*t/10,r=355+hash(i+997)*100,x=500+Math.cos(a)*r,y=500+Math.sin(a)*r*.85;ctx.globalAlpha=(.08+.09*p.s)*intensity;ctx.fillStyle=p.c>.5?'#f6d9db':'#cd314b';ctx.beginPath();ctx.arc(x,y,1+3*p.s,0,TAU);ctx.fill()}
 ctx.restore();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
}
function mount(host,d,logo,{artwork=false}={}){
 const w=artwork?1200:d.w,h=artwork?1200:d.h;host.style.aspectRatio=w+'/'+h;
 host.innerHTML='<canvas aria-hidden="true"></canvas>'+(artwork?'':'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+w+' '+h+'" role="img" aria-label="'+d.label+'"><image href="'+logo+'" x="'+d.logo.x+'" y="'+d.logo.y+'" width="'+d.logo.w+'" height="'+d.logo.h+'"/><g>'+d.brand+'</g><g class="opening">'+d.opening+'</g><g class="closing">'+d.closing+'</g><g class="cta">'+d.cta+'</g></svg>');
 const canvas=host.querySelector('canvas'),ctx=canvas.getContext('2d'),opening=host.querySelector('.opening'),closing=host.querySelector('.closing'),cta=host.querySelector('.cta');let ratio=1,lastTime=0,lastLoop=true,scene;
 function resize(){ratio=Math.min(2,window.devicePixelRatio||1)*Math.min(1,(host.clientWidth||w)/w);canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);if(scene)scene.paint(lastTime,lastLoop)}
 const observer=new ResizeObserver(resize);observer.observe(host);resize();
 scene={paint(t,loop=true){lastTime=t;lastLoop=loop;const end=loop?ramp(t,9.45,10):0,op=(1-ramp(t,2.3,2.8))*(1-end)+end,cl=ramp(t,5.3,5.85)*(1-end),ct=ramp(t,5.85,6.25)*(1-end),intensity=artwork?1:.2+.8*ramp(t,2.1,2.8)*(1-ramp(t,4.9,5.8));ctx.setTransform(ratio,0,0,ratio,0,0);draw(ctx,w,h,t,{artwork,intensity});if(!artwork){opening.style.opacity=op;closing.style.opacity=cl;cta.style.opacity=ct}},destroy(){observer.disconnect()}};return scene;
}
root.ParticleHalo={mount,draw,geometry,duration:10};
})(typeof window==='undefined'?globalThis:window);
