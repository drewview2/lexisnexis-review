(function(){'use strict';
const grid=document.getElementById('grid'),sizeSelect=document.getElementById('size'),playButton=document.getElementById('play'),timeline=document.getElementById('time'),clock=document.getElementById('clock');
const sizes=['1200x1200','300x250','250x250','728x90','500x100'],names=['Carry facts forward','Compare versions','Focus on what changed'];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let size='1200x1200',view='ads',playing=!reduced,time=reduced?7.2:0,before=performance.now(),scenes=[];
function paint(){for(const s of scenes)s.paint(time,true);timeline.value=time;clock.value=time.toFixed(1)+' / 10s';playButton.textContent=playing?'Pause':'Play'}
function rebuild(){for(const s of scenes)s.destroy();scenes=[];grid.innerHTML='';grid.className='grid'+(view==='artwork'?' artwork':size==='all'?' all':+size.split('x')[0]/+size.split('x')[1]>2?' wide':+size.split('x')[0]<=300?' small':'');
 const list=view==='artwork'?[{art:true}]:Array.from({length:3},(_,i)=>(size==='all'?sizes:[size]).map(sz=>({i,sz}))).flat();
 for(const item of list){const d=item.art?null:CAMPAIGN.data[item.i+'-'+item.sz];const el=document.createElement('article');el.className='card'+(!item.art&&d.w/d.h>2?' landscape':' square');
 el.innerHTML='<div class="card-head"><h2>'+(item.art?'Particle halo':('0'+(item.i+1)+' / '+names[item.i]))+'</h2><span class="dimensions">'+(item.art?'Artwork only':d.w+' × '+d.h)+'</span></div><div class="stage"></div><div class="card-foot"><a href="'+(item.art?'ad.html?artwork=1':'ad.html?ad='+item.i+'&size='+item.sz)+'" target="_blank" rel="noopener">Open animation ↗</a><button class="download">Download HTML5</button></div>';
 grid.appendChild(el);const scene=ParticleHalo.mount(el.querySelector('.stage'),d,CAMPAIGN.logo,{artwork:item.art});scenes.push(scene);el.querySelector('.download').onclick=e=>download(item,e.currentTarget);
 }paint();
}
async function download(item,button){
 button.disabled=true;
 try{const engine=await fetch('particles.js').then(r=>{if(!r.ok)throw Error();return r.text()});const d=item.art?null:CAMPAIGN.data[item.i+'-'+item.sz];const w=d?d.w:1200,h=d?d.h:1200;
 const run='var d='+JSON.stringify(d)+';var logo='+JSON.stringify(item.art?'':CAMPAIGN.logo)+';var scene=ParticleHalo.mount(document.getElementById("stage"),d,logo,{artwork:'+!!item.art+'});var start=performance.now();function tick(now){var t=Math.min(10,(now-start)/1000);scene.paint(t,false);if(t<10)requestAnimationFrame(tick)}requestAnimationFrame(tick);';
 const html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="ad.size" content="width='+w+',height='+h+'"><title>CaseMap+ '+(item.art?'Particle halo':names[item.i])+'</title><style>html,body{margin:0;background:#010102}#stage{position:relative;width:100vw;max-width:'+w+'px;aspect-ratio:'+w+'/'+h+';overflow:hidden}canvas,svg{position:absolute;inset:0;width:100%;height:100%}</style></head><body><div id="stage"></div><script>var clickTag="";document.getElementById("stage").onclick=function(){if(/^https?:/.test(window.clickTag))window.open(window.clickTag,"_blank","noopener")};'+engine+run+'</'+'script></body></html>';
 const url=URL.createObjectURL(new Blob([html],{type:'text/html'})),a=document.createElement('a');a.href=url;a.download='CaseMap-Particles-'+(item.art?'Artwork':('Ad-'+(item.i+1)+'-'+item.sz))+'.html';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }catch(e){button.textContent='Please try again'}finally{button.disabled=false}
}
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{view=b.dataset.view;document.querySelectorAll('[data-view]').forEach(v=>{v.classList.toggle('active',v===b);v.setAttribute('aria-pressed',v===b)});document.getElementById('size-control').hidden=view==='artwork';time=0;playing=!reduced;rebuild()});
sizeSelect.onchange=()=>{size=sizeSelect.value;rebuild()};playButton.onclick=()=>{playing=!playing;paint()};document.getElementById('replay').onclick=()=>{time=0;playing=true;paint()};
timeline.oninput=()=>{time=+timeline.value;playing=false;paint()};document.querySelectorAll('[data-time]').forEach(b=>b.onclick=()=>{time=+b.dataset.time;playing=false;paint()});
document.addEventListener('visibilitychange',()=>{before=performance.now()});
function tick(now){const dt=Math.min(.1,(now-before)/1000);before=now;if(playing&&!document.hidden){time=(time+dt)%10;paint()}requestAnimationFrame(tick)}
rebuild();requestAnimationFrame(tick);
})();