import { loadImage, fitCover, fitContain } from './utils.js'

const imageCache=new Map(),videoCache=new Map()
export async function getImage(src){if(!src)return null;if(!imageCache.has(src))imageCache.set(src,loadImage(src));return imageCache.get(src)}

export async function getVideo(src){
  if(!src)return null;if(videoCache.has(src))return videoCache.get(src)
  const p=new Promise((resolve,reject)=>{const v=document.createElement('video');v.src=src;v.muted=true;v.playsInline=true;v.preload='auto';v.onloadedmetadata=()=>resolve(v);v.onerror=()=>reject(new Error('동영상 로드 실패'))})
  videoCache.set(src,p);return p
}

async function seekVideo(v,time){
  if(!Number.isFinite(v.duration)||v.duration<=0)return v
  const t=((time%v.duration)+v.duration)%v.duration
  if(Math.abs(v.currentTime-t)<.035)return v
  await new Promise(resolve=>{let done=false;const finish=()=>{if(done)return;done=true;v.removeEventListener('seeked',finish);resolve()};v.addEventListener('seeked',finish,{once:true});try{v.currentTime=t}catch{finish()}setTimeout(finish,120)})
  return v
}

export async function drawMedia(ctx,layer,size,time=0){
  let source=null,sw=0,sh=0
  if(layer.frames?.length){const fps=(layer.sourceFps||10)*(layer.speed||1),idx=Math.floor(Math.max(0,time)*(fps||10))%layer.frames.length;source=await getImage(layer.frames[idx]);sw=source.naturalWidth||source.width;sh=source.naturalHeight||source.height}
  else if(layer.mediaKind==='video'){source=await getVideo(layer.dataUrl);await seekVideo(source,time*(layer.speed||1));sw=source.videoWidth;sh=source.videoHeight}
  else if(layer.dataUrl){source=await getImage(layer.dataUrl);sw=source.naturalWidth||source.width;sh=source.naturalHeight||source.height}
  if(!source||!sw||!sh)return
  const mode=layer.fit||'cover',fit=(mode==='contain'?fitContain:fitCover)(sw,sh,size,size),tr=layer.transform||{},scale=tr.scale??1
  const dw=fit.w*scale,dh=fit.h*scale,x=(size-dw)/2+(tr.x||0)*size/180,y=(size-dh)/2+(tr.y||0)*size/180
  ctx.save();ctx.globalAlpha=layer.opacity??1;ctx.globalCompositeOperation=layer.blend||'source-over';ctx.translate(size/2,size/2);ctx.rotate((tr.rotation||0)*Math.PI/180);ctx.translate(-size/2,-size/2)
  if(layer.blackRemoval){ctx.filter=`contrast(${100+(layer.blackRemoval||0)}%)`}
  ctx.drawImage(source,x,y,dw,dh);ctx.restore()
}
