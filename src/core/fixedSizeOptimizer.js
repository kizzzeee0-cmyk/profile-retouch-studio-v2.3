const clamp=(v,a,b)=>Math.max(a,Math.min(b,v))

function cloneCanvas(src){const c=document.createElement('canvas');c.width=src.width;c.height=src.height;c.getContext('2d').drawImage(src,0,0);return c}
function blobOf(c,type='image/png',quality){return new Promise(resolve=>c.toBlob(resolve,type,quality))}

function quantizedCanvas(src,step=1,alphaStep=1){
  const c=cloneCanvas(src),ctx=c.getContext('2d',{willReadFrequently:true}),im=ctx.getImageData(0,0,c.width,c.height),d=im.data
  if(step<=1&&alphaStep<=1)return c
  for(let i=0;i<d.length;i+=4){
    d[i]=Math.round(d[i]/step)*step;d[i+1]=Math.round(d[i+1]/step)*step;d[i+2]=Math.round(d[i+2]/step)*step
    if(alphaStep>1)d[i+3]=Math.round(d[i+3]/alphaStep)*alphaStep
  }
  ctx.putImageData(im,0,0);return c
}

export async function optimizePngFixedSize(canvas,maxBytes=50000,onProgress){
  const steps=[1,2,3,4,6,8,10,12,16,20,24,32,40,48,64,85,128,255],alphaSteps=[1,1,1,1,1,1,2,4,4,8,8,16,16,24,32,64,128,255]
  let best=null
  for(let i=0;i<steps.length;i++){
    const c=quantizedCanvas(canvas,steps[i],alphaSteps[i]),blob=await blobOf(c,'image/png')
    const result={blob,bytes:blob.size,width:c.width,height:c.height,quantStep:steps[i],qualityLabel:i<3?'높음':i<7?'균형':'강한 압축'}
    if(!best||result.bytes<best.bytes)best=result
    onProgress?.((i+1)/steps.length,result)
    if(blob.size<=maxBytes)return {...result,metTarget:true}
  }
  return {...best,metTarget:false}
}

export function fitCanvasToSize(src,w,h,mode='cover'){
  const out=document.createElement('canvas');out.width=w;out.height=h;const ctx=out.getContext('2d')
  const scale=mode==='contain'?Math.min(w/src.width,h/src.height):Math.max(w/src.width,h/src.height),dw=src.width*scale,dh=src.height*scale
  ctx.clearRect(0,0,w,h);ctx.drawImage(src,(w-dw)/2,(h-dh)/2,dw,dh);return out
}

export const PHOTO_EXPORT_PRESETS={
  mobile:{label:'모바일용',width:293,height:248,maxBytes:50000},
  pc:{label:'PC용',width:195,height:145,maxBytes:50000}
}

export function describeOptimizerResult(r){return `${r.width}×${r.height} · ${(r.bytes/1024).toFixed(1)}KB · ${r.qualityLabel}`}
