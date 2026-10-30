(function(){'use strict';
const grid=document.getElementById('grid'),sizeSelect=document.getElementById('size'),motionSelect=document.getElementById('motion'),playButton=document.getElementById('play'),timeline=document.getElementById('time'),clock=document.getElementById('clock');
const sizes=['1200x1200','300x250','250x250','300x600','160x600','728x90','500x100'],names=['Carry facts forward','Compare versions','Focus on what changed'],motions={particles:'Particle plus',glass:'Glass plus',globe:'Wireframe globe'};
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let size='1200x1200',motion='all',view='ads',playing=!reduced,time=reduced?7.2:0,before=performance.now(),lastPaint=0,scenes=[];
const observer=new IntersectionObserver(entries=>{for(const e of entries){const s=scenes.find(s=>s.el===e.target);if(s){s.visible=e.isIntersecting;if(s.visible)s.scene.paint(time,true)}}},{rootMargin:'160px'});
function paint(force=false){for(const s of scenes)if(force||s.visible)s.scene.paint(time,true);timeline.value=time;clock.value=time.toFixed(1)+' / 10s';playButton.textContent=playing?'Pause':'Play'}
function rebuild(){
 observer.disconnect();for(const s of scenes)s.scene.destroy();scenes=[];grid.innerHTML='';
 const ratio=+size.split('x')[0]/+size.split('x')[1];
 grid.className='grid'+(view==='artwork'?(motion==='all'?' artwork-set':' artwork-set single'):size==='all'?' all':ratio>2?' wide':ratio<.8?' tall':+size.split('x')[0]<=300?' small':'');
 const chosen=motion==='all'?Object.keys(motions):[motion];
 for(const animation of chosen){
  const title=document.createElement('div');title.className='section-title';title.innerHTML='<h2>'+motions[animation]+'</h2><span>'+(view==='artwork'?'Independent animation':(size==='all'?'All seven sizes':size.replace('x',' × ')))+'</span>';grid.appendChild(title);
  const list=view==='artwork'?[{art:true,animation}]:(size==='all'?sizes:[size]).flatMap(sz=>names.map((_,i)=>({i,sz,animation})));
  for(const item of list){
   const d=item.art?null:CAMPAIGN.data[item.i+'-'+item.sz],el=document.createElement('article');
   el.className='card'+(!item.art&&d.w/d.h>2?' landscape':!item.art&&d.h>d.w?' portrait':' square');
   if(d)el.style.setProperty('--native',d.w+'px');
   const url='ad.html?animation='+animation+(item.art?'&artwork=1':'&ad='+item.i+'&size='+item.sz);
   el.innerHTML='<div class="card-head"><h3>'+(item.art?motions[animation]:('0'+(item.i+1)+' / '+names[item.i]))+'</h3><span class="dimensions">'+(item.art?'Artwork only':d.w+' × '+d.h)+'</span></div><div class="stage"></div><div class="card-foot"><a href="'+url+'" target="_blank" rel="noopener">Open animation ↗</a><button class="download">Download HTML5</button></div>';
   grid.appendChild(el);
   const scene=ParticleHalo.mount(el.querySelector('.stage'),d,CAMPAIGN.logo,{artwork:item.art,animation,assets:CAMPAIGN.assets});
   scenes.push({el,scene,visible:false});observer.observe(el);
   el.querySelector('.download').onclick=e=>download(item,e.currentTarget);
  }
 }
 paint(true);
}
async function download(item,button){
 button.disabled=true;
 try{
  const load=path=>fetch(path+'?v=focus-finish').then(r=>{if(!r.ok)throw Error();return r.text()});
  const engine=await load('particles.js'),artEngine=item.animation==='particles'?'':await load('art-engine.js');
  const d=item.art?null:CAMPAIGN.data[item.i+'-'+item.sz],w=d?d.w:1200,h=d?d.h:1200,assets=item.animation==='particles'?{}:item.animation==='glass'?{plus:CAMPAIGN.assets.plus}:{globe:CAMPAIGN.assets.globe};
  const run='var d='+JSON.stringify(d)+';var logo='+JSON.stringify(item.art?'':CAMPAIGN.logo)+';var assets='+JSON.stringify(assets)+';var scene=ParticleHalo.mount(document.getElementById("stage"),d,logo,{artwork:'+!!item.art+',animation:'+JSON.stringify(item.animation)+',assets:assets});var start=performance.now();function tick(now){var elapsed=(now-start)/1000;var loop='+!!item.art+';var t=loop?elapsed%10:Math.min(10,elapsed);scene.paint(t,loop);if(loop||t<10)requestAnimationFrame(tick)}requestAnimationFrame(tick);';
  const html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="ad.size" content="width='+w+',height='+h+'"><title>CaseMap+ '+motions[item.animation]+'</title><style>html,body{margin:0;background:#010102}#stage{position:relative;width:100vw;max-width:'+w+'px;aspect-ratio:'+w+'/'+h+';overflow:hidden}canvas,svg{position:absolute;inset:0;width:100%;height:100%}</style></head><body><div id="stage"></div><script>var clickTag="";document.getElementById("stage").onclick=function(){if(/^https?:/.test(window.clickTag))window.open(window.clickTag,"_blank","noopener")};'+artEngine+engine+run+'</'+'script></body></html>';
  const url=URL.createObjectURL(new Blob([html],{type:'text/html'})),a=document.createElement('a');a.href=url;a.download='CaseMap-'+motions[item.animation].replaceAll(' ','-')+'-'+(item.art?'Artwork':('Ad-'+(item.i+1)+'-'+item.sz))+'.html';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);button.textContent='Download HTML5';
 }catch(e){button.textContent='Please try again'}finally{button.disabled=false}
}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{view=b.dataset.view;document.querySelectorAll('[data-view]').forEach(v=>{v.classList.toggle('active',v===b);v.setAttribute('aria-pressed',v===b)});document.getElementById('size-control').hidden=view==='artwork';time=0;playing=!reduced;rebuild()});
sizeSelect.onchange=()=>{size=sizeSelect.value;rebuild()};motionSelect.onchange=()=>{motion=motionSelect.value;rebuild()};
playButton.onclick=()=>{playing=!playing;paint(true)};document.getElementById('replay').onclick=()=>{time=0;playing=true;paint(true)};
timeline.oninput=()=>{time=+timeline.value;playing=false;paint(true)};document.querySelectorAll('[data-time]').forEach(b=>b.onclick=()=>{time=+b.dataset.time;playing=false;paint(true)});
document.addEventListener('visibilitychange',()=>{before=performance.now()});
function tick(now){const dt=Math.min(.1,(now-before)/1000);before=now;if(playing&&!document.hidden){time=(time+dt)%10;if(now-lastPaint>=15){paint();lastPaint=now}}requestAnimationFrame(tick)}
rebuild();requestAnimationFrame(tick);
})();
