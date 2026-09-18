import { clamp, fitCover, fitContain } from './utils.js'

export function drawImageFit(ctx,img,w,h,mode='cover',transform={}){
  const fit=(mode==='contain'?fitContain:fitCover)(img.naturalWidth||img.width,img.naturalHeight||img.height,w,h)
  const scale=transform.scale??1, ox=transform.x??0, oy=transform.y??0
  const dw=fit.w*scale, dh=fit.h*scale, x=(w-dw)/2+ox, y=(h-dh)/2+oy
  ctx.save(); if(transform.rotation){ctx.translate(w/2,h/2);ctx.rotate(transform.rotation*Math.PI/180);ctx.translate(-w/2,-h/2)}
  ctx.drawImage(img,x,y,dw,dh); ctx.restore(); return {x,y,w:dw,h:dh}
}

export function applyAdjustments(source,adj,intensity=1){
  const c=document.createElement('canvas'); c.width=source.width; c.height=source.height; const ctx=c.getContext('2d',{willReadFrequently:true}); ctx.drawImage(source,0,0)
  const im=ctx.getImageData(0,0,c.width,c.height), d=im.data
  const exposure=Math.pow(2,(adj.exposure||0)*intensity/50)
  const bright=(adj.brightness||0)*intensity*1.25
  const contrast=(adj.contrast||0)*intensity; const cf=(259*(contrast+255))/(255*(259-contrast))
  const sat=(adj.saturation||0)*intensity/100, vib=(adj.vibrance||0)*intensity/100
  const temp=(adj.temperature||0)*intensity, tint=(adj.tint||0)*intensity, yellow=(adj.yellowReduce||0)*intensity
  const hi=(adj.highlights||0)*intensity/100, sh=(adj.shadows||0)*intensity/100
  const clarity=(adj.clarity||0)*intensity/100
  for(let i=0;i<d.length;i+=4){
    let r=d[i]*exposure+bright, g=d[i+1]*exposure+bright, b=d[i+2]*exposure+bright
    const lum=(r*0.2126+g*0.7152+b*0.0722)/255
    const hm=Math.max(0,(lum-.5)*2), sm=Math.max(0,(.5-lum)*2)
    const hmul=1+hi*hm*.65, sadd=sh*sm*60
    r=r*hmul+sadd;g=g*hmul+sadd;b=b*hmul+sadd
    r=cf*(r-128)+128;g=cf*(g-128)+128;b=cf*(b-128)+128
    r+=temp*.72; b-=temp*.72; g-=Math.abs(temp)*.07
    r+=tint*.42; b+=tint*.28; g-=tint*.45
    if(yellow>0){ const yell=Math.max(0,Math.min(r,g)-b)*yellow/100; r-=yell*.18; g-=yell*.42; b+=yell*.18 }
    const max=Math.max(r,g,b),min=Math.min(r,g,b),gray=(r+g+b)/3, chroma=(max-min)/255
    const sf=1+sat+vib*(1-chroma)*.8
    r=gray+(r-gray)*sf;g=gray+(g-gray)*sf;b=gray+(b-gray)*sf
    if(clarity){ const cfac=1+clarity*.22; r=128+(r-128)*cfac;g=128+(g-128)*cfac;b=128+(b-128)*cfac }
    d[i]=clamp(r,0,255);d[i+1]=clamp(g,0,255);d[i+2]=clamp(b,0,255)
  }
  ctx.putImageData(im,0,0)
  if((adj.sharpen||0)*intensity>1) sharpenCanvas(c,(adj.sharpen||0)*intensity/100)
  return c
}

function sharpenCanvas(canvas,amount){
  const ctx=canvas.getContext('2d',{willReadFrequently:true}), src=ctx.getImageData(0,0,canvas.width,canvas.height), out=new ImageData(new Uint8ClampedArray(src.data),src.width,src.height)
  const d=src.data,o=out.data,w=src.width,h=src.height,a=Math.min(.75,amount*.8)
  for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const i=(y*w+x)*4;for(let c=0;c<3;c++){const center=d[i+c]*5-d[i-4+c]-d[i+4+c]-d[i-w*4+c]-d[i+w*4+c];o[i+c]=clamp(d[i+c]*(1-a)+center*a,0,255)}}
  ctx.putImageData(out,0,0)
}

export function addBloom(ctx,baseCanvas,amount){
  if(!amount)return; const w=baseCanvas.width,h=baseCanvas.height, tmp=document.createElement('canvas');tmp.width=w;tmp.height=h;const t=tmp.getContext('2d');t.filter=`blur(${Math.max(2,amount*.35)}px) brightness(${1+amount/100})`;t.globalAlpha=Math.min(.28,amount/220);t.drawImage(baseCanvas,0,0);ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=Math.min(.4,amount/120);ctx.drawImage(tmp,0,0);ctx.restore()
}
