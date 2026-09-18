import { clamp } from './utils.js'
import { maskToCanvas } from './mask.js'

export function polygonToMask(points,w,h,{smooth=0}={}){
  const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d',{willReadFrequently:true})
  if(!points?.length)return new Uint8ClampedArray(w*h)
  ctx.fillStyle='#fff';ctx.beginPath()
  points.forEach((p,i)=>{const x=p.x*w,y=p.y*h;i?ctx.lineTo(x,y):ctx.moveTo(x,y)})
  ctx.closePath();ctx.fill()
  if(smooth>0){const b=document.createElement('canvas');b.width=w;b.height=h;const bx=b.getContext('2d');bx.filter=`blur(${smooth}px)`;bx.drawImage(c,0,0);ctx.clearRect(0,0,w,h);ctx.drawImage(b,0,0)}
  const d=ctx.getImageData(0,0,w,h).data,out=new Uint8ClampedArray(w*h)
  for(let p=0;p<out.length;p++)out[p]=d[p*4+3]
  return out
}

export function pathToMask(path,w,h){
  if(!path?.points?.length)return new Uint8ClampedArray(w*h)
  if(path.mode!=='bezier')return polygonToMask(path.points,w,h,{smooth:path.smooth||0})
  const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d',{willReadFrequently:true});const pts=path.points
  ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(pts[0].x*w,pts[0].y*h)
  for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],mx=(a.x+b.x)*w/2,my=(a.y+b.y)*h/2;ctx.quadraticCurveTo(a.x*w,a.y*h,mx,my)}
  if(pts.length>2){const last=pts[pts.length-1],first=pts[0],mx=(last.x+first.x)*w/2,my=(last.y+first.y)*h/2;ctx.quadraticCurveTo(last.x*w,last.y*h,mx,my);ctx.quadraticCurveTo(first.x*w,first.y*h,first.x*w,first.y*h)}
  ctx.closePath();ctx.fill();const d=ctx.getImageData(0,0,w,h).data,out=new Uint8ClampedArray(w*h);for(let p=0;p<out.length;p++)out[p]=d[p*4+3];return out
}

export function edgeStrength(imageData){
  const {width:w,height:h,data:d}=imageData,gray=new Float32Array(w*h),out=new Float32Array(w*h)
  for(let p=0;p<w*h;p++){const i=p*4;gray[p]=d[i]*.299+d[i+1]*.587+d[i+2]*.114}
  for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
    const p=y*w+x
    const gx=-gray[p-w-1]-2*gray[p-1]-gray[p+w-1]+gray[p-w+1]+2*gray[p+1]+gray[p+w+1]
    const gy=-gray[p-w-1]-2*gray[p-w]-gray[p-w+1]+gray[p+w-1]+2*gray[p+w]+gray[p+w+1]
    out[p]=Math.min(255,Math.hypot(gx,gy)/4)
  }
  return out
}

export function snapPointToEdge(imageData,x,y,radius=14){
  const {width:w,height:h}=imageData,edge=edgeStrength(imageData);let bestX=clamp(Math.round(x),0,w-1),bestY=clamp(Math.round(y),0,h-1),best=-1
  const r=Math.max(2,Math.round(radius)),cx=Math.round(x),cy=Math.round(y)
  for(let yy=Math.max(1,cy-r);yy<=Math.min(h-2,cy+r);yy++)for(let xx=Math.max(1,cx-r);xx<=Math.min(w-2,cx+r);xx++){
    const dist=Math.hypot(xx-x,yy-y);if(dist>r)continue
    const score=edge[yy*w+xx]-(dist/r)*28
    if(score>best){best=score;bestX=xx;bestY=yy}
  }
  return {x:bestX,y:bestY,strength:best}
}

export function maskEdgeCanvas(mask,w,h,width=2){
  const base=maskToCanvas(mask,w,h,0),c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d')
  const r=Math.max(1,Math.round(width));ctx.fillStyle='#fff'
  for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){if(x*x+y*y>r*r)continue;ctx.drawImage(base,x,y)}
  ctx.globalCompositeOperation='destination-out';ctx.drawImage(base,0,0);ctx.globalCompositeOperation='source-over';return c
}

function coloredMask(maskCanvas,w,h,color){
  const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');ctx.drawImage(maskCanvas,0,0,w,h);ctx.globalCompositeOperation='source-in';ctx.fillStyle=color;ctx.fillRect(0,0,w,h);ctx.globalCompositeOperation='source-over';return c
}

export function glowCanvases(mask,w,h,g={}){
  const alpha=maskToCanvas(mask,w,h,0), inner=document.createElement('canvas'), outer=document.createElement('canvas')
  inner.width=outer.width=w;inner.height=outer.height=h
  const innerCtx=inner.getContext('2d'),outerCtx=outer.getContext('2d')
  const innerWidth=Math.max(1,Math.round(g.innerWidth??5)),outerWidth=Math.max(2,Math.round(g.outerWidth??28))
  const innerColor=g.innerColor||'#ffffff',outerColor=g.outerColor||'#7ff7ff'

  // Crisp narrow rim: expand with offsets then remove the subject interior.
  const tintedInner=coloredMask(alpha,w,h,innerColor)
  innerCtx.globalAlpha=Math.min(1,(g.opacity??48)/100*1.2)
  for(let i=0;i<24;i++){const a=i/24*Math.PI*2;innerCtx.drawImage(tintedInner,Math.cos(a)*innerWidth,Math.sin(a)*innerWidth)}
  innerCtx.globalCompositeOperation='destination-out';innerCtx.drawImage(alpha,0,0);innerCtx.globalCompositeOperation='source-over'

  // Wide halo: shadows from the subject, then carve out the whole subject so light exists only outside.
  const tintedOuter=coloredMask(alpha,w,h,outerColor);const passes=3
  outerCtx.globalAlpha=Math.min(1,(g.opacity??48)/100)
  outerCtx.shadowColor=outerColor;outerCtx.shadowBlur=Math.max(2,(g.softness??22))
  for(let p=0;p<passes;p++){
    const rr=outerWidth*(.38+p*.28)+(g.spread||0)*.2
    for(let i=0;i<16;i++){const a=i/16*Math.PI*2;outerCtx.drawImage(tintedOuter,Math.cos(a)*rr+(g.offsetX||0),Math.sin(a)*rr+(g.offsetY||0))}
  }
  outerCtx.shadowBlur=0;outerCtx.globalCompositeOperation='destination-out';outerCtx.drawImage(alpha,0,0);outerCtx.globalCompositeOperation='source-over'

  // brightness multiplier without touching subject pixels.
  const mult=Math.max(.2,(g.brightness??125)/100)
  if(mult!==1){outerCtx.globalCompositeOperation='screen';outerCtx.globalAlpha=Math.min(.85,Math.abs(mult-1));outerCtx.drawImage(outer,0,0);outerCtx.globalAlpha=1;outerCtx.globalCompositeOperation='source-over'}
  return {alpha,inner,outer}
}

export function combineMasks(base,overlay,mode='replace'){
  const out=new Uint8ClampedArray(base?.length||overlay.length)
  for(let i=0;i<out.length;i++){
    const a=base?.[i]||0,b=overlay?.[i]||0
    out[i]=mode==='add'?Math.max(a,b):mode==='subtract'?Math.max(0,a-b):b
  }
  return out
}
