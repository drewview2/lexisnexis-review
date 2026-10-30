(function(root){
'use strict';
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10)},ramp=(t,a,b)=>smooth((t-a)/(b-a));
const hash=i=>{const v=Math.sin(i*127.1+311.7)*43758.5453123;return v-Math.floor(v)};
const seeds=Array.from({length:560},(_,i)=>({a:i*2.3999632297,b:hash(i+21)*TAU,r:Math.sqrt(hash(i+829)),s:hash(i+129),c:hash(i+1531),p:hash(i+57)*TAU,group:hash(i+401),u:hash(i+733),v:hash(i+1091),z:hash(i+615)}));
const geometryCache=new Map();
function geometry(time,count=520){
 const key=time+'-'+count;if(geometryCache.has(key))return geometryCache.get(key);if(geometryCache.size>5)geometryCache.clear();
 const phase=TAU*time/10,tilt=.35+.12*Math.sin(phase),lean=-.18+.12*Math.sin(phase),points=[];
 for(let i=0;i<count;i++){
  const s=seeds[i],a=s.a+phase,b=s.b+.38*Math.sin(phase+s.p),pulse=Math.sin(a*3-phase)*9+Math.cos(a*2+phase)*6;
  const tube=16+48*s.r,rad=290+pulse+tube*Math.cos(b),x=Math.cos(a)*rad,y=Math.sin(a)*rad,z=tube*Math.sin(b)*1.5;
  const yy=y*Math.cos(tilt)-z*Math.sin(tilt),zz=y*Math.sin(tilt)+z*Math.cos(tilt),xx=x*Math.cos(lean)-yy*Math.sin(lean),yyy=x*Math.sin(lean)+yy*Math.cos(lean),persp=1+zz/1900;
  const stagger=(s.s-.5)*.18,m=ramp(time,.55+stagger,1.95+stagger)*(1-ramp(time,7.4+stagger,9.7+stagger));
  let tx,ty;if(s.group<.5865){tx=(s.u-.5)*182;ty=(s.v-.5)*650}else{tx=(s.u<.5?-1:1)*(91+((s.u*2)%1)*234);ty=(s.v-.5)*182}
  const drift=3.2*Math.sin(phase*2+s.p),angle=.022*Math.sin(phase),turn=.22*Math.sin(phase),rawZ=(s.z-.5)*190;
  const turnedX=tx*Math.cos(turn)+rawZ*Math.sin(turn),px=turnedX*Math.cos(angle)-ty*Math.sin(angle),py=turnedX*Math.sin(angle)+ty*Math.cos(angle),pz=-tx*Math.sin(turn)+rawZ*Math.cos(turn);
  const nx=500+xx*persp*(1-m)+(px+drift)*m+Math.sin(m*Math.PI)*Math.sin(s.p)*48,ny=500+yyy*persp*(1-m)+(py+drift*.6)*m+Math.sin(m*Math.PI)*Math.cos(s.p)*48,nz=zz*(1-m)+pz*m;
  const depth=clamp((nz+155)/310),sweep=(1-m)*Math.pow(.5+.5*Math.cos(a-phase*2-.7),9)+m*Math.exp(-Math.pow((px+py*.22-420*Math.sin(phase))/135,2)),twinkle=.78+.22*Math.pow(.5+.5*Math.sin(phase*2+s.p),3),alpha=clamp(.34+.55*depth+.28*sweep)*twinkle,radius=(3.5+Math.pow(s.s,2)*4.8)*(.78+depth*.55);
  points.push({x:nx,y:ny,z:nz,r:radius,a:alpha,depth,sweep,c:s.c,i});
 }points.sort((a,b)=>a.z-b.z);geometryCache.set(key,points);return points;
}
let glowSprite;
function glow(){
 if(glowSprite)return glowSprite;
 const sprite=document.createElement('canvas');sprite.width=sprite.height=128;
 const c=sprite.getContext('2d'),g=c.createRadialGradient(64,64,0,64,64,64);
 g.addColorStop(0,'rgba(255,185,193,.8)');g.addColorStop(.22,'rgba(255,92,117,.35)');g.addColorStop(.5,'rgba(255,46,79,.09)');g.addColorStop(1,'rgba(255,35,65,0)');c.fillStyle=g;c.fillRect(0,0,128,128);glowSprite=sprite;return sprite;
}
function draw(ctx,w,h,t,{artwork=false,intensity=1,particles=true}={}){
 const square=w/h<2,hero=artwork?{x:w/2,y:h/2,size:Math.min(w,h)*.98}:square?{x:w*.5,y:h*.51,size:Math.min(w,h)*.98}:{x:w*.54,y:h*.5,size:h*1.32},radius=Math.min(w,h)*.83;
 const phase=TAU*t/10,bx=w*(.5+.035*Math.sin(phase)),by=h*(.5+.025*Math.sin(phase*2));
 ctx.clearRect(0,0,w,h);const bg=ctx.createRadialGradient(bx,by,0,bx,by,radius);
 bg.addColorStop(0,'#23060c');bg.addColorStop(.28,'#160409');bg.addColorStop(.62,'#080205');bg.addColorStop(1,'#010102');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);if(!particles||intensity<.001)return;
 ctx.save();ctx.translate(hero.x-hero.size/2,hero.y-hero.size/2);ctx.scale(hero.size/1000,hero.size/1000);
 const pts=geometry(t,w<350?340:520),sprite=glow(),release=artwork?0:ramp(t,3.05,3.9);ctx.globalCompositeOperation='lighter';
 for(const p of pts){const a=p.a*intensity,focus=clamp((p.depth-.28)/.36),x=500+(p.x-500)*(1+.13*release),y=500+(p.y-500)*(1+.13*release);
  const r=p.r*(3.6-1.2*focus+1.5*release);
  ctx.globalAlpha=a*(.44-.16*focus+.22*p.sweep);ctx.drawImage(sprite,x-r,y-r,r*2,r*2);
  if(focus>.04){
   const core=p.r*(.52+.28*focus);
   ctx.globalAlpha=a*focus*(1-release);ctx.fillStyle=p.c<.28?'#ff3e5d':p.c<.53?'#ffa3b2':'#fff5ec';ctx.beginPath();ctx.arc(x,y,core,0,TAU);ctx.fill();
   if(focus>.7&&p.c>.5){ctx.globalAlpha=a*.85*(1-release);ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(x-core*.19,y-core*.23,core*.3,0,TAU);ctx.fill()}
  }
 }
 for(let i=0;i<12;i++){const p=seeds[i+540],a=p.a+TAU*t/10,r=375+hash(i+997)*65,x=500+Math.cos(a)*r,y=500+Math.sin(a)*r*.85;ctx.globalAlpha=(.08+.09*p.s)*intensity;ctx.fillStyle=p.c>.5?'#f6d9db':'#cd314b';ctx.beginPath();ctx.arc(x,y,2+3*p.s,0,TAU);ctx.fill()}
 ctx.restore();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
}
const artFrames=new Map();
// Keep the original vector lettering; only reposition each outlined line.
function alignCopy(group,box){
 const lines=Array.from(group.querySelectorAll('[data-role$="-line"]'));
 if(!lines.length)return;
 const measured=lines.map(el=>({el,b:el.getBBox()})),top=Math.min(...measured.map(l=>l.b.y)),bottom=Math.max(...measured.map(l=>l.b.y+l.b.height)),width=Math.max(...measured.map(l=>l.b.width));
 const scale=Math.min(box.w/width,box.h/(bottom-top)),y=box.y+(box.center?(box.h-(bottom-top)*scale)/2:0);
 group.replaceChildren(...lines);
 for(const {el,b} of measured)el.setAttribute('transform','translate('+(box.x-b.x*scale)+' '+(y-top*scale)+') scale('+scale+')');
}
let serial=0;
function mount(host,d,logo,{artwork=false,animation='particles',assets={}}={}){
 const w=artwork?1200:d.w,h=artwork?1200:d.h,id='scene'+(++serial),square=w/h<2;
 host.style.aspectRatio=w+'/'+h;
 const normalSize=Math.min(w,h),hero={x:w*.5,y:artwork?h*.5:h*.49,size:animation==='glass'?normalSize*.9:normalSize*(artwork||w/h<.8?1.13:.97)};
 if(!square&&!artwork){hero.x=w*.54;hero.y=h/2;hero.size=h*(animation==='glass'?.9:1.1)}
 let glassCopy=null,ctaShift=0;
 if(animation==='glass'&&!artwork){
  const tall=h/w>1.5,footer=d.h===1200?124:d.h===600?(w===160?53:55):w===250?44:46;
  if(square){
   hero.size=normalSize*(tall?(w<200?.76:.68):.43);
   const right=w*(tall?.08:.06),bottom=footer+h*.055;
   hero.x=w-right-hero.size*.44;hero.y=h-bottom-hero.size*.43;
   glassCopy=tall?{x:w*.065,y:h*.20,w:w*.87,h:h*.34}:{x:w*.06,y:h*.205,w:w*.61,h:h*.51};
  }else{
   hero.size=h*.74;hero.x=w-w*.02-hero.size*.44;hero.y=h-h*.08-hero.size*.43;
   const ctaX=w===728?474:318,left=w===728?142:114;
   glassCopy={x:left,y:h*.10,w:ctaX-left-14,h:h*.80,center:true};ctaShift=ctaX-(w===728?570:384);
  }
 }
 const fixed=animation==='glass'?'<defs><image id="'+id+'-texture" href="'+assets.plus+'" width="1000" height="1000"/></defs>':'';
 let copy=artwork?'':'<image href="'+logo+'" x="'+d.logo.x+'" y="'+d.logo.y+'" width="'+d.logo.w+'" height="'+d.logo.h+'"/><g data-role="brand">'+d.brand+'</g><g class="opening">'+d.opening+'</g><g class="closing">'+d.closing+'</g><g class="cta">'+d.cta+'</g>';
 copy=copy.replace(/id="([^"]+)"/g,(_,v)=>'id="'+id+'-'+v+'"').replace(/url\(#([^)]+)\)/g,(_,v)=>'url(#'+id+'-'+v+')');
 host.innerHTML='<canvas aria-hidden="true"></canvas><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+w+' '+h+'" role="img" aria-label="'+(artwork?'CaseMap '+animation+' animation':d.label)+'">'+fixed+'<g class="art" transform="translate('+(hero.x-hero.size/2)+' '+(hero.y-hero.size/2)+') scale('+(hero.size/1000)+')"></g>'+copy+'</svg>';
 const canvas=host.querySelector('canvas'),ctx=canvas.getContext('2d'),opening=host.querySelector('.opening'),closing=host.querySelector('.closing'),cta=host.querySelector('.cta'),art=host.querySelector('.art');
 if(glassCopy){alignCopy(opening,glassCopy);alignCopy(closing,glassCopy);if(ctaShift)cta.setAttribute('transform','translate('+ctaShift+' 0)')}
 let ratio=1,lastTime=0,lastLoop=true,scene;
 function resize(){ratio=Math.min(3,window.devicePixelRatio||1)*Math.min(1,(host.clientWidth||w)/w);canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);if(scene)scene.paint(lastTime,lastLoop)}
 const observer=new ResizeObserver(resize);observer.observe(host);resize();
 scene={paint(t,loop=true){
  lastTime=t;lastLoop=loop;
  const end=loop?ramp(t,9.45,10):0,op=(1-ramp(t,2.2,2.55))*(1-end)+end,cl=ramp(t,3,3.4)*(1-end),ct=ramp(t,3.4,3.75)*(1-end),reveal=ramp(t,1.65,2.45)*(1-ramp(t,3.05,3.9));
  const intensity=artwork?1:(.26+.74*ramp(t,1.65,2.45))*(1-ramp(t,3.05,3.9))+.26*end;
  ctx.setTransform(ratio,0,0,ratio,0,0);draw(ctx,w,h,t,{artwork,intensity,particles:animation==='particles'});
  if(animation!=='particles'){
   const kind=animation==='glass'?'plus':'globe',artTime=t;
   const frameKey=kind+'-'+artTime;if(artFrames.size>5)artFrames.clear();if(!artFrames.has(frameKey))artFrames.set(frameKey,CaseMapArt.artwork(kind,artTime,assets[kind],'shared-art'));const frame=artFrames.get(frameKey),a={defs:frame.defs.replaceAll('shared-art',id),body:frame.body.replaceAll('shared-art',id)};
   const defs=animation==='glass'?a.defs.replace(/<image[\s\S]*?<\/image>/g,''):a.defs;
   art.innerHTML='<defs>'+defs+'</defs>'+a.body;
   art.style.opacity=artwork?1:animation==='glass'?.9+.1*reveal:.18+.82*reveal;
  }
  if(!artwork){const lift=Math.min(10,h*.014);opening.style.opacity=op;closing.style.opacity=cl;cta.style.opacity=ct;opening.setAttribute('transform','translate(0 '+(-lift*(1-op))+')');closing.setAttribute('transform','translate(0 '+(lift*(1-cl))+')')}
 },destroy(){observer.disconnect()}};
 return scene;
}
root.ParticleHalo={mount,draw,geometry,duration:10};
})(typeof window==='undefined'?globalThis:window);

