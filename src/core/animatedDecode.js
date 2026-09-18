export async function decodeAnimatedFile(file,maxDimension=360,maxFrames=72){
  const ImageDecoderCtor=window.ImageDecoder
  if(!ImageDecoderCtor)return null
  try{
    const data=new Uint8Array(await file.arrayBuffer()),decoder=new ImageDecoderCtor({data,type:file.type||'image/gif'})
    await decoder.tracks.ready
    const track=decoder.tracks.selectedTrack,count=Math.min(track?.frameCount||1,maxFrames),frames=[];let totalDuration=0
    for(let i=0;i<count;i++){
      const {image}=await decoder.decode({frameIndex:i})
      const iw=image.displayWidth||image.codedWidth||maxDimension,ih=image.displayHeight||image.codedHeight||maxDimension,scale=Math.min(1,maxDimension/Math.max(iw,ih))
      const c=document.createElement('canvas');c.width=Math.max(1,Math.round(iw*scale));c.height=Math.max(1,Math.round(ih*scale));c.getContext('2d').drawImage(image,0,0,c.width,c.height)
      const dur=(image.duration||100000)/1000000;totalDuration+=dur;frames.push(c.toDataURL('image/png'));image.close?.()
    }
    return {frames,fps:count/Math.max(.2,totalDuration),duration:totalDuration}
  }catch(e){console.warn('Animated decode failed',e);return null}
}
