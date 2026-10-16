/* Local 3D mesh renderer: cylindrical shank and three helical cutting flutes.
   Projects and lights real XYZ geometry; no network or external libraries. */
(() => {
 const canvas=document.querySelector('.moving-tool');
 if(!canvas || canvas.tagName!=='CANVAS') return;
 const ctx=canvas.getContext('2d'); if(!ctx)return;
 const mesh=[], sides=72, rings=76, length=6.8;
 function vertex(j,i){
  const y=length*j/rings-length/2, a=i/sides*Math.PI*2;
  const flute=Math.max(0,Math.min(1,(j/rings-.43)/.08));
  const phase=a*3+(j/rings-.45)*Math.PI*5;
  const groove=Math.pow((1+Math.cos(phase))/2,2);
  let radius=.49*(1-.42*flute*groove);
  if(j/rings>.96)radius*=1-(j/rings-.96)/.04*.78;
  return [radius*Math.cos(a),y,radius*Math.sin(a)];
 }
 for(let j=0;j<rings;j++)for(let i=0;i<sides;i++)mesh.push([vertex(j,i),vertex(j+1,i),vertex(j+1,i+1),vertex(j,i+1)]);
 for(let i=0;i<sides;i++)mesh.push([[0,-length/2,0],vertex(0,i),vertex(0,i+1)]);
 let last=0;
 function render(degrees=0){
  last=degrees;
  const w=canvas.clientWidth||100,h=canvas.clientHeight||330,dpr=Math.min(devicePixelRatio||1,2);
  if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
  const angle=degrees*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle),tilt=.13,ct=Math.cos(tilt),st=Math.sin(tilt),scale=h/7.25;
  const transform=p=>{const x=p[0]*c+p[2]*s,z=-p[0]*s+p[2]*c;return [x,p[1]*ct-z*st,p[1]*st+z*ct];};
  const faces=mesh.map(face=>{
   const p=face.map(transform),a=p[0],b=p[1],d=p[2];
   const u=b.map((v,i)=>v-a[i]),v=d.map((v,i)=>v-a[i]);
   let n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
   const len=Math.hypot(...n)||1;n=n.map(x=>x/len);
   const diffuse=Math.max(0,n[0]*-.5+n[1]*-.35+n[2]*.79);
   const highlight=Math.pow(Math.max(0,n[0]*-.23+n[1]*-.12+n[2]*.966),20);
   const shade=Math.round(Math.min(248,69+diffuse*133+highlight*65));
   return {p,z:p.reduce((sum,v)=>sum+v[2],0)/p.length,color:`rgb(${shade},${Math.min(255,shade+5)},${Math.min(255,shade+9)})`};
  }).sort((a,b)=>a.z-b.z);
  for(const face of faces){ctx.beginPath();face.p.forEach((p,i)=>{const x=w/2+p[0]*scale,y=h/2+p[1]*scale;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.closePath();ctx.fillStyle=ctx.strokeStyle=face.color;ctx.lineWidth=.35;ctx.fill();ctx.stroke();}
 }
 window.renderProcessDrill=render;
 new ResizeObserver(()=>render(last)).observe(canvas);
 render(0);
})();
