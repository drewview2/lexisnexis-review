(function(root){'use strict';const clamp=v=>Math.max(0,Math.min(1,v)),n=v=>+v.toFixed(4);
function globe(time,rings,prefix){
 const phase=2*Math.PI*(((time%10)+10)%10)/10,lon=(-86+18*Math.sin(phase))*Math.PI/180,tilt=12*Math.PI/180,lean=-11*Math.PI/180,R=405;
 function project(a,b){a=a*Math.PI/180-lon;b*=Math.PI/180;let x=Math.cos(b)*Math.sin(a),y=-Math.sin(b),z=Math.cos(b)*Math.cos(a);const yy=y*Math.cos(tilt)+z*Math.sin(tilt),zz=-y*Math.sin(tilt)+z*Math.cos(tilt);return[x*Math.cos(lean)-yy*Math.sin(lean),x*Math.sin(lean)+yy*Math.cos(lean),zz];}
 const f=v=>Math.round(v*10)/10,xy=p=>`${f(500+p[0]*R)},${f(500+p[1]*R)}`;
 function line(points,front=true){let d='',pen=false;for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],va=front?a[2]>=0:a[2]<0,vb=front?b[2]>=0:b[2]<0;if(va&&vb){if(!pen)d+='M'+xy(a);d+='L'+xy(b);pen=true;}else if(va!==vb){const k=a[2]/(a[2]-b[2]),p=a.map((v,j)=>v+(b[j]-v)*k);if(va){if(!pen)d+='M'+xy(a);d+='L'+xy(p);pen=false;}else{d+='M'+xy(p)+'L'+xy(b);pen=true;}}else pen=false;}return d;}
 const grid=[];for(let a=-180;a<180;a+=20){const p=[];for(let b=-90;b<=90;b+=3)p.push(project(a,b));grid.push(p);}for(let b=-60;b<=60;b+=20){const p=[];for(let a=-180;a<=180;a+=3)p.push(project(a,b));grid.push(p);}
 const front=grid.map(p=>line(p,true)).join(''),back=grid.map(p=>line(p,false)).join(''),coast=rings.map(r=>line(r.map(([a,b])=>project(a,b)),true)).join('');
 const sx=500+300*Math.sin(phase+.4),sy=500-300*Math.cos(phase+.4);
 const defs=`<linearGradient id="${prefix}-grid" gradientUnits="userSpaceOnUse" x1="90" y1="120" x2="880" y2="860"><stop stop-color="#fa7177"></stop><stop offset=".4" stop-color="#c12136"></stop><stop offset="1" stop-color="#53101f"></stop></linearGradient><radialGradient id="${prefix}-coast" gradientUnits="userSpaceOnUse" cx="${n(sx)}" cy="${n(sy)}" r="720"><stop stop-color="#ffc4bf"></stop><stop offset=".24" stop-color="#ff6670"></stop><stop offset=".6" stop-color="#ef243d"></stop><stop offset="1" stop-color="#7e1327"></stop></radialGradient><linearGradient id="${prefix}-rim" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffc6c1"></stop><stop offset=".35" stop-color="#dc2c42"></stop><stop offset=".8" stop-color="#6c1325"></stop><stop offset="1" stop-color="#ff6973"></stop></linearGradient>`;
 const body=`<path d="${back}" fill="none" stroke="#d92843" stroke-width="1.1" opacity=".055"></path><path d="${front}" fill="none" stroke="url(#${prefix}-grid)" stroke-width="1.35" opacity=".6"></path><path d="${coast}" fill="none" stroke="url(#${prefix}-coast)" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"></path><circle cx="500" cy="500" r="405" fill="none" stroke="url(#${prefix}-rim)" stroke-width="2.4"></circle>`;
 return {defs,body};
}

function artwork(kind,time,src,prefix,focus=false){
 if(kind==='globe')return globe(time,src,prefix);
 const t=((time%10)+10)%10;
 // Light travels through the material. The object itself remains perfectly still.
 const u=clamp((t-.25)/9.5),center=-360+1720*u;
 const angle=kind==='continent'?-24:focus?-42:18;
 const energy=Math.sin(Math.PI*u)**.35;
 const base=kind==='continent'?.055:.065;
 const defs=`<linearGradient id="${prefix}-broad" gradientUnits="userSpaceOnUse" x1="${n(center-420)}" y1="0" x2="${n(center+420)}" y2="0" gradientTransform="rotate(${angle} 500 500)"><stop stop-color="white" stop-opacity="0"></stop><stop offset=".18" stop-color="white" stop-opacity=".03"></stop><stop offset=".36" stop-color="white" stop-opacity=".45"></stop><stop offset=".5" stop-color="white"></stop><stop offset=".64" stop-color="white" stop-opacity=".45"></stop><stop offset=".82" stop-color="white" stop-opacity=".03"></stop><stop offset="1" stop-color="white" stop-opacity="0"></stop></linearGradient><linearGradient id="${prefix}-glint" gradientUnits="userSpaceOnUse" x1="${n(center-105)}" y1="0" x2="${n(center+105)}" y2="0" gradientTransform="rotate(${angle} 500 500)"><stop stop-color="white" stop-opacity="0"></stop><stop offset=".42" stop-color="white" stop-opacity=".5"></stop><stop offset=".5" stop-color="white"></stop><stop offset=".58" stop-color="white" stop-opacity=".5"></stop><stop offset="1" stop-color="white" stop-opacity="0"></stop></linearGradient><mask id="${prefix}-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000"><rect width="1000" height="1000" fill="url(#${prefix}-broad)"></rect></mask><mask id="${prefix}-shine" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000"><rect width="1000" height="1000" fill="url(#${prefix}-glint)"></rect></mask><filter id="${prefix}-ruby" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="1 .28 .12 0 0  0 .36 .05 0 0  0 0 .32 0 0  0 0 0 1 0"></feColorMatrix></filter>`;
 const img=`<use href="#${prefix}-texture"></use>`;
 const warm=`<filter id="${prefix}-warm" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="1 .16 .08 0 0  0 .76 .1 0 0  0 .08 .58 0 0  0 0 0 1 0"></feColorMatrix></filter>`;
 const body=`<g opacity="${base}">${img}</g><g mask="url(#${prefix}-mask)" opacity="${n(clamp(1.08*energy))}" filter="url(#${prefix}-ruby)">${img}</g><g mask="url(#${prefix}-shine)" opacity="${n(energy)}" filter="url(#${prefix}-warm)">${img}</g>`;
 return {defs:defs+warm+`<image id="${prefix}-texture" href="${src}" width="1000" height="1000"></image>`,body};
}

root.CaseMapArt={artwork};})(window);