let pipePromise=null

async function getPipe(onProgress){
  if(!pipePromise){
    pipePromise=(async()=>{
      const { pipeline, env }=await import('@huggingface/transformers')
      env.allowLocalModels=false
      return pipeline('background-removal','onnx-community/BEN2-ONNX',{progress_callback:p=>onProgress?.(p)})
    })()
  }
  return pipePromise
}

export async function aiSubjectMask(dataUrl,w,h,onProgress){
  const pipe=await getPipe(onProgress)
  onProgress?.({status:'running',file:'캐릭터 분석 중'})
  const output=await pipe(dataUrl)
  const raw=Array.isArray(output)?output[0]:output
  if(!raw)throw new Error('AI 마스크 결과가 비어 있습니다.')
  const source=raw.toCanvas?raw.toCanvas():null
  if(!source)throw new Error('AI 결과를 Canvas로 변환하지 못했습니다.')
  const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(source,0,0,w,h)
  const d=ctx.getImageData(0,0,w,h).data,out=new Uint8ClampedArray(w*h)
  // background-removal outputs RGBA. Use alpha when present; otherwise luminance fallback.
  let alphaVar=0;for(let p=0;p<out.length;p+=Math.max(1,Math.floor(out.length/3000))){alphaVar+=d[p*4+3]<250?1:0}
  const useAlpha=alphaVar>2
  for(let p=0;p<out.length;p++){const i=p*4;out[p]=useAlpha?d[i+3]:Math.round((d[i]+d[i+1]+d[i+2])/3)}
  return out
}
