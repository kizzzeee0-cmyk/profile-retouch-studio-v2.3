import { GIFEncoder, quantize, applyPalette } from 'gifenc'
import { renderGifFrame } from './gifRenderer.js'

async function buildFrames(project,size,fps,onProgress){
  const frames=[],totalSeconds=project.scenes.reduce((a,s)=>a+(s.duration||1.5),0),expected=Math.max(1,Math.round(totalSeconds*fps));let rendered=0
  for(let si=0;si<project.scenes.length;si++){
    const scene=project.scenes[si],duration=scene.duration||1.5,count=Math.max(1,Math.round(duration*fps)),trans=Math.min(scene.transitionDuration??.4,duration*.5)
    for(let f=0;f<count;f++){
      const time=f/fps,tp=time>duration-trans?(time-(duration-trans))/trans:0,c=await renderGifFrame(project,si,time,tp,size)
      frames.push(c.getContext('2d',{willReadFrequently:true}).getImageData(0,0,size,size));rendered++;onProgress?.(Math.min(.66,rendered/expected*.66),'프레임 렌더링')
    }
  }
  return frames
}

function frameSignature(frame,step=19){
  const d=frame.data;let h=2166136261>>>0
  for(let i=0;i<d.length;i+=4*step){h^=(d[i]>>4)|((d[i+1]>>4)<<4)|((d[i+2]>>4)<<8);h=Math.imul(h,16777619)>>>0}
  return h
}

function collapseFrames(frames){
  const packed=[]
  for(const frame of frames){const sig=frameSignature(frame),last=packed[packed.length-1];if(last&&last.sig===sig)last.repeat++;else packed.push({frame,sig,repeat:1})}
  return packed
}

function makeGlobalPalette(frames,colors){
  const targetSamples=180000,perFrame=Math.max(1,Math.floor(targetSamples/Math.max(1,frames.length))),sample=[]
  for(const frame of frames){const d=frame.data,pixels=d.length/4,stride=Math.max(1,Math.floor(pixels/perFrame));for(let p=0;p<pixels;p+=stride){const i=p*4;sample.push(d[i],d[i+1],d[i+2],d[i+3])}}
  return quantize(new Uint8Array(sample),colors,{format:'rgb565'})
}

function encode(frames,size,fps,colors){
  const gif=GIFEncoder(),baseDelay=Math.max(20,Math.round(1000/fps)),palette=makeGlobalPalette(frames,colors),packed=collapseFrames(frames)
  packed.forEach((item,i)=>{const index=applyPalette(item.frame.data,palette,'rgb565');gif.writeFrame(index,size,size,{palette,delay:baseDelay*item.repeat,repeat:i===0?0:undefined})})
  gif.finish();return {bytes:gif.bytes(),frameCount:packed.length}
}

export async function exportOptimizedGif(project,{size=180,fps=10,colors=128,maxBytes=1900000,onProgress}={}){
  if(!project.scenes.length)throw new Error('타임라인에 장면을 먼저 추가해주세요.')
  const fixedSize=size // v2.1 rule: output dimensions are locked during optimization.
  let curFps=fps,curColors=colors,frames=await buildFrames(project,fixedSize,curFps,onProgress),enc=encode(frames,fixedSize,curFps,curColors),best={...enc,fps:curFps,colors:curColors},tries=0
  const colorSteps=[128,112,96,80,64,56,48,40,32,24]
  const fpsSteps=[10,9,8,7,6,5,4]
  const attempts=[]
  for(const c of colorSteps)for(const f of fpsSteps)if(c<=colors&&f<=fps)attempts.push([c,f])
  attempts.sort((a,b)=>Math.abs(colors-a[0])*1.2+Math.abs(fps-a[1])*8-(Math.abs(colors-b[0])*1.2+Math.abs(fps-b[1])*8))
  for(const [c,f] of attempts){
    if(enc.bytes.byteLength<=maxBytes)break
    tries++;curColors=c
    if(f!==curFps){curFps=f;frames=await buildFrames(project,fixedSize,curFps,p=>onProgress?.(.66+p*.15,'FPS 최적화'))}
    enc=encode(frames,fixedSize,curFps,curColors)
    if(enc.bytes.byteLength<best.bytes.byteLength)best={...enc,fps:curFps,colors:curColors}
    onProgress?.(.82+Math.min(.16,tries/attempts.length*.16),`고정 크기 최적화 ${(enc.bytes.byteLength/1048576).toFixed(2)}MB`)
  }
  if(enc.bytes.byteLength>maxBytes){
    const mb=(best.bytes.byteLength/1048576).toFixed(2)
    const err=new Error(`해상도 ${fixedSize}×${fixedSize}를 유지한 상태에서 2MB 이하로 만들지 못했습니다. 현재 최선 ${mb}MB입니다. 재생시간/장면 수를 줄이거나 더 낮은 FPS·색상 수를 선택해주세요.`)
    err.bestBytes=best.bytes.byteLength;err.fixedSize=fixedSize;throw err
  }
  const safe=new Uint8Array(enc.bytes.byteLength);safe.set(enc.bytes);onProgress?.(1,'완료')
  return {blob:new Blob([safe.buffer],{type:'image/gif'}),bytes:enc.bytes.byteLength,size:fixedSize,fps:curFps,colors:curColors,frames:enc.frameCount,sizeLocked:true}
}
