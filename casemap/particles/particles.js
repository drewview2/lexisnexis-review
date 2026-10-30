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
function draw(ctx,w,h,t,{artwork=false,intensity=1,particles=true,animation='particles'}={}){
 const square=w/h<2,hero=artwork?{x:w/2,y:h/2,size:Math.min(w,h)*.98}:square?{x:w*.5,y:h*.51,size:Math.min(w,h)*.98}:{x:w*.54,y:h*.5,size:h*1.32},radius=Math.min(w,h)*.83;
 const phase=TAU*t/10,bx=w*(.5+.035*Math.sin(phase)),by=h*(.5+.025*Math.sin(phase*2));
 ctx.clearRect(0,0,w,h);
 if(animation==='glass'){
  const base=ctx.createLinearGradient(0,0,w,h);base.addColorStop(0,'#27212a');base.addColorStop(.48,'#14121a');base.addColorStop(1,'#08090e');ctx.fillStyle=base;ctx.fillRect(0,0,w,h);
  const light=ctx.createRadialGradient(w*.86,h*.75,0,w*.86,h*.75,Math.max(w,h)*.8);light.addColorStop(0,'rgba(105,27,43,.42)');light.addColorStop(.48,'rgba(64,19,34,.16)');light.addColorStop(1,'rgba(20,10,22,0)');ctx.fillStyle=light;ctx.fillRect(0,0,w,h);
 }else if(animation==='globe'){
  const base=ctx.createRadialGradient(bx,h*.44,0,bx,h*.44,Math.max(w,h)*.85);base.addColorStop(0,'#15243a');base.addColorStop(.48,'#0b1422');base.addColorStop(1,'#03070f');ctx.fillStyle=base;ctx.fillRect(0,0,w,h);
 }else{
  const bg=ctx.createRadialGradient(bx,by,0,bx,by,radius);bg.addColorStop(0,'#310911');bg.addColorStop(.28,'#1c050b');bg.addColorStop(.62,'#090205');bg.addColorStop(1,'#010102');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
 }
 if(!particles||intensity<.001)return;
 ctx.save();ctx.translate(hero.x-hero.size/2,hero.y-hero.size/2);ctx.scale(hero.size/1000,hero.size/1000);
 const pts=geometry(t,square?(w<350?340:520):180),pointScale=square?1:1.85,sprite=glow(),release=artwork?0:ramp(t,3.05,3.9);ctx.globalCompositeOperation='lighter';
 for(const p of pts){const a=p.a*intensity,focus=clamp((p.depth-.28)/.36),x=500+(p.x-500)*(1+.13*release),y=500+(p.y-500)*(1+.13*release);
  const r=p.r*pointScale*(3.6-1.2*focus+1.5*release);
  ctx.globalAlpha=a*(.44-.16*focus+.22*p.sweep);ctx.drawImage(sprite,x-r,y-r,r*2,r*2);
  if(focus>.04){
   const core=p.r*pointScale*(.52+.28*focus);
   ctx.globalAlpha=a*focus*(1-release);ctx.fillStyle=p.c<.28?'#ff3e5d':p.c<.53?'#ffa3b2':'#fff5ec';ctx.beginPath();ctx.arc(x,y,core,0,TAU);ctx.fill();
   if(focus>.7&&p.c>.5){ctx.globalAlpha=a*.85*(1-release);ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(x-core*.19,y-core*.23,core*.3,0,TAU);ctx.fill()}
  }
  if(p.i%17===0&&focus>.15){
   const digitSize=(square?20*Math.max(1,Math.min(1.8,250/Math.min(w,h))):42)*(.85+.3*p.depth);
   ctx.font='500 '+digitSize+'px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';ctx.textAlign='center';ctx.textBaseline='middle';
   ctx.globalAlpha=a*(.26+.44*p.depth+.2*p.sweep)*(1-release);ctx.fillStyle=p.c<.4?'#ff8398':'#ffe9e9';
   ctx.fillText(Math.sin(phase*2+seeds[p.i].p)>0?'1':'0',x+p.r*pointScale*2.5,y-p.r*pointScale*1.7);
  }
 }
 for(let i=0;i<12;i++){const p=seeds[i+540],a=p.a+TAU*t/10,r=375+hash(i+997)*65,x=500+Math.cos(a)*r,y=500+Math.sin(a)*r*.85;ctx.globalAlpha=(.08+.09*p.s)*intensity;ctx.fillStyle=p.c>.5?'#f6d9db':'#cd314b';ctx.beginPath();ctx.arc(x,y,2+3*p.s,0,TAU);ctx.fill()}
 ctx.restore();ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
}
const artFrames=new Map();
// Source outline em sizes, measured against matching glyphs. Both frames share
// one final type size, even when their original vector lettering was different.
const typeSizes={
 '1200x1200':[[86,69],[86,76],[86,65]],'300x600':[[86,69],[86,76],[86,65]],
 '300x250':[[25,25],[25,21],[25,18.5]],'250x250':[[23,23],[23,19],[23,17.1]],
 '160x600':[[23,23],[23,19],[23,17.1]],'728x90':[[27,24],[27,21],[27,18.79]],
 '500x100':[[22,16.6],[22,16],[22,14.7]]
};
function alignCopyPair(opening,closing,box,ems){
 const frames=[opening,closing].map((group,i)=>{
  const lines=Array.from(group.querySelectorAll('[data-role$="-line"]')).map(el=>({el,b:el.getBBox()}));
  return {group,lines,em:ems[i],top:Math.min(...lines.map(l=>l.b.y)),bottom:Math.max(...lines.map(l=>l.b.y+l.b.height)),width:Math.max(...lines.map(l=>l.b.width))};
 });
 const fontSize=Math.min(...frames.flatMap(f=>[box.w*f.em/f.width,box.h*.82*f.em/(f.bottom-f.top)]));
 for(const f of frames){
  const scale=fontSize/f.em,y=box.y+(box.h-(f.bottom-f.top)*scale)/2;
  const left=box.x+(box.horizontal?(box.w-f.width*scale)/2:0);
  f.group.replaceChildren(...f.lines.map(l=>l.el));f.group.setAttribute('data-font-size',fontSize.toFixed(4));
  for(const {el,b} of f.lines){const x=box.leftAligned?left:box.x+(box.w-b.width*scale)/2;el.setAttribute('transform','translate('+(x-b.x*scale)+' '+(y-f.top*scale)+') scale('+scale+')')}
 }
}

function styleButton(cta,d,animation){
 const b=cta.getBBox(),height=b.height*1.28,y=Math.max(0,Math.min(d.h-height,b.y-(height-b.height)/2));
 const label=d.label.includes('Updated transcript?')?'EXPLORE CASEMAP+':d.label.includes('Know which')?'REQUEST A DEMO':'SEE IT IN ACTION';
 const fontSize=Math.min(height*.31,b.width/(label.length*.69+2.6)),tracking=fontSize*.12;
 const stroke=Math.max(1.6,height*.038),radius=animation==='glass'?height*.13:animation==='globe'?height/2:height*.06;
 const fill=animation==='glass'?'#fff3ec':animation==='globe'?'#101c2c':'#df1834',ink=animation==='glass'?'#30101c':'#ffffff',edge=animation==='globe'?'#f36b7f':animation==='glass'?'#fff8f3':'#f54359';
 // Replace vector sentence-case lettering with a crisp, tracked uppercase label.
 // Expand about the original center; copy layout below uses the new top edge.
 cta.innerHTML='<rect x="'+b.x+'" y="'+y+'" width="'+b.width+'" height="'+height+'" rx="'+radius+'" fill="'+fill+'" stroke="'+edge+'" stroke-width="'+stroke+'"/><text x="'+(b.x+b.width/2)+'" y="'+(y+height/2)+'" text-anchor="middle" dominant-baseline="central" font-family="Arial, Helvetica, sans-serif" font-size="'+fontSize+'" font-weight="700" letter-spacing="'+tracking+'" fill="'+ink+'">'+label+'</text>';
 cta.setAttribute('data-button-style',animation);
}

let serial=0;
function mount(host,d,logo,{artwork=false,animation='particles',assets={}}={}){
 const w=artwork?1200:d.w,h=artwork?1200:d.h,id='scene'+(++serial),square=w/h<2;
 host.style.aspectRatio=w+'/'+h;
 const normalSize=Math.min(w,h),hero={x:w*.5,y:artwork?h*.5:h*.49,size:animation==='glass'?normalSize*.9:normalSize*(artwork||w/h<.8?1.13:.97)};
 if(!square&&!artwork){hero.x=w*.54;hero.y=h/2;hero.size=h*(animation==='glass'?.9:1.1)}
 let ctaShift=0;
 if(animation==='glass'&&!artwork){
  const tall=h/w>1.5,footer=d.h===1200?124:d.h===600?(w===160?53:55):w===250?44:46;
  if(square){
   hero.size=normalSize*(tall?(w<200?.76:.50):.32);
   const right=w*(tall?.08:.06),bottom=footer+h*.055;
   hero.x=w-right-hero.size*.44;hero.y=h-bottom-hero.size*.43;
  }else{
   hero.size=h*.74;hero.x=w-w*.02-hero.size*.44;hero.y=h-h*.08-hero.size*.43;
   const ctaX=w===728?474:318;ctaShift=ctaX-(w===728?570:384);
  }
 }
 const fixed=animation==='glass'?'<defs><image id="'+id+'-texture" href="'+assets.plus+'" width="1000" height="1000"/></defs>':'';
 let copy=artwork?'':'<image href="'+logo+'" x="'+d.logo.x+'" y="'+d.logo.y+'" width="'+d.logo.w+'" height="'+d.logo.h+'"/><g data-role="brand">'+d.brand+'</g><g class="opening">'+d.opening+'</g><g class="closing">'+d.closing+'</g><g class="cta">'+d.cta+'</g>';
 copy=copy.replace(/id="([^"]+)"/g,(_,v)=>'id="'+id+'-'+v+'"').replace(/url\(#([^)]+)\)/g,(_,v)=>'url(#'+id+'-'+v+')');
 host.innerHTML='<canvas aria-hidden="true"></canvas><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+w+' '+h+'" role="img" aria-label="'+(artwork?'CaseMap '+animation+' animation':d.label)+'">'+fixed+'<g class="art" transform="translate('+(hero.x-hero.size/2)+' '+(hero.y-hero.size/2)+') scale('+(hero.size/1000)+')"></g>'+copy+'</svg>';
 const canvas=host.querySelector('canvas'),ctx=canvas.getContext('2d'),opening=host.querySelector('.opening'),closing=host.querySelector('.closing'),cta=host.querySelector('.cta'),art=host.querySelector('.art');
 if(!artwork){
  styleButton(cta,d,animation);
  if(ctaShift)cta.setAttribute('transform','translate('+ctaShift+' 0)');
  const brand=host.querySelector('[data-role="brand"]').getBBox(),button=cta.getBBox(),message=d.label.includes('Updated transcript?')?1:d.label.includes('Know which')?2:0;
  let box;
  if(square){
   const top=Math.max(d.logo.y+d.logo.h,brand.y+brand.height),bottom=button.y,left=animation==='glass'?(h/w>1.5?w*.065:w*.06):w*.08;
   box={x:left,y:top,w:animation==='glass'?(h/w>1.5?w*.87:w*.61):w*.84,h:bottom-top,leftAligned:animation==='glass'};
  }else{
   const left=Math.max(d.logo.x+d.logo.w,brand.x+brand.width),right=button.x+ctaShift,pad=Math.min(14,(right-left)*.05);
   box={x:left+pad,y:0,w:right-left-pad*2,h,leftAligned:animation==='glass',horizontal:true};
  }
  alignCopyPair(opening,closing,box,typeSizes[w+'x'+h][message]);
 }
 let ratio=1,lastTime=0,lastLoop=true,scene;
 function resize(){ratio=Math.min(3,window.devicePixelRatio||1)*(host.clientWidth||w)/w;canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);if(scene)scene.paint(lastTime,lastLoop)}
 const observer=new ResizeObserver(resize);observer.observe(host);resize();
 scene={paint(t,loop=true){
  lastTime=t;lastLoop=loop;
  const end=loop?ramp(t,9.45,10):0,op=(1-ramp(t,2.2,2.55))*(1-end)+end,cl=ramp(t,3,3.4)*(1-end),ct=ramp(t,3.4,3.75)*(1-end),reveal=ramp(t,1.65,2.45)*(1-ramp(t,3.05,3.9));
  const intensity=artwork?1:(.26+.74*ramp(t,1.65,2.45))*(1-ramp(t,3.05,3.9))+.26*end;
  ctx.setTransform(ratio,0,0,ratio,0,0);draw(ctx,w,h,t,{artwork,intensity,particles:animation==='particles',animation});
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

