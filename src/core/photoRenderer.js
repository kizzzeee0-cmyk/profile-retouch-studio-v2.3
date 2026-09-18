import { applyAdjustments, addBloom, drawImageFit } from './image.js'
import { loadImage } from './utils.js'
import { maskFromDataUrl, maskToCanvas } from './mask.js'
import { maskEdgeCanvas } from './edge.js'
import { createDirectionalLighting } from './lighting.js'
import { drawBackground as drawGeneratedBackground } from './backgroundEngine.js'

const imageCache=new Map()
async function cached(src){if(!src)return null;if(imageCache.has(src))return imageCache.get(src);const p=loadImage(src);imageCache.set(src,p);try{return await p}catch(e){imageCache.delete(src);throw e}}

export async function renderPhotoProject(project,options={}){
  const outW=options.width||project.canvas.width,outH=options.height||project.canvas.height
  const c=document.createElement('canvas');c.width=outW;c.height=outH;const ctx=c.getContext('2d')
  const sx=outW/project.canvas.width,sy=outH/project.canvas.height,viewMode=options.viewMode||project.canvas.viewMode||'final'
  ctx.clearRect(0,0,outW,outH)
  if(!['final','original'].includes(viewMode)){await renderDiagnostic(ctx,project,outW,outH,viewMode);return applyCircle(project,c,options)}
  for(const layer of project.layers){
    if(layer.visible===false)continue
    ctx.save();ctx.globalAlpha=layer.opacity??1;ctx.globalCompositeOperation=layer.blend||'source-over'
    if(layer.type==='background')await drawGeneratedBackground(ctx,normalizeBackground(layer.background),outW,outH,0)
    else if(layer.type==='image'&&layer.role==='main')await drawMain(ctx,project,layer,outW,outH,sx,sy,{original:viewMode==='original'})
    else if(layer.type==='image'||layer.type==='frame')await drawImageLayer(ctx,layer,outW,outH,sx,sy)
    else if(layer.type==='text')drawTextLayer(ctx,layer,sx,sy)
    else if(layer.type==='drawing')drawDrawing(ctx,layer,sx,sy)
    ctx.restore()
  }
  return applyCircle(project,c,options)
}

function applyCircle(project,c,options){if(!(project.canvas.circularPreview||options.forceCircle))return c;const out=document.createElement('canvas');out.width=c.width;out.height=c.height;const x=out.getContext('2d');x.beginPath();x.arc(out.width/2,out.height/2,Math.min(out.width,out.height)/2,0,Math.PI*2);x.clip();x.drawImage(c,0,0);return out}

async function getMask(project,w,h){if(!project.maskDataUrl)return null;try{return await maskFromDataUrl(project.maskDataUrl,w,h)}catch{return null}}
async function renderDiagnostic(ctx,project,w,h,mode){
  ctx.fillStyle=mode==='mask'?'#141414':'#07090d';ctx.fillRect(0,0,w,h);const mask=await getMask(project,w,h);if(!mask)return
  if(mode==='mask'){ctx.drawImage(maskToCanvas(mask,w,h,0),0,0);return}
  if(mode==='edge'){const edge=maskEdgeCanvas(mask,w,h,2);ctx.drawImage(edge,0,0);ctx.globalCompositeOperation='source-in';ctx.fillStyle='#63f1ff';ctx.fillRect(0,0,w,h);ctx.globalCompositeOperation='source-over';return}
  const lighting=createDirectionalLighting(mask,w,h,scaleLighting(project.lighting||{},w/project.canvas.width,h/project.canvas.height))
  if(mode==='rim')ctx.drawImage(lighting.rim,0,0)
  else if(mode==='halo')ctx.drawImage(lighting.halo,0,0)
  else if(mode==='sparkle')ctx.drawImage(lighting.sparkle,0,0)
  else {ctx.globalCompositeOperation='screen';ctx.drawImage(lighting.halo,0,0);ctx.drawImage(lighting.rim,0,0);ctx.globalCompositeOperation='lighter';ctx.drawImage(lighting.sparkle,0,0);ctx.globalCompositeOperation='source-over'}
}

function normalizeBackground(b={}){return b.type?b:{...b,type:b.mode||'color',gradientType:b.gradientType||'linear'}}

async function drawMain(ctx,project,layer,w,h,sx,sy,{original=false}={}){
  const im=await cached(layer.dataUrl);if(!im)return
  const raw=document.createElement('canvas');raw.width=w;raw.height=h;const rc=raw.getContext('2d'),tr=layer.transform||{}
  drawImageFit(rc,im,w,h,layer.fit||'cover',{x:(tr.x||0)*sx,y:(tr.y||0)*sy,scale:tr.scale||1,rotation:tr.rotation||0})
  const adjusted=original?raw:applyAdjustments(raw,project.adjustments,(project.preset?.intensity??100)/100)
  const mask=await getMask(project,w,h),maskCanvas=mask?maskToCanvas(mask,w,h,0):null
  if(!layer.cutout)ctx.drawImage(adjusted,0,0)
  if(mask&&project.lighting?.enabled&&!original){
    const light=createDirectionalLighting(mask,w,h,scaleLighting(project.lighting,sx,sy))
    ctx.save();ctx.globalCompositeOperation='screen';ctx.drawImage(light.halo,0,0);ctx.restore()
    // redraw clean subject above the halo, then put directional rim and sparkle on top
    const subject=document.createElement('canvas');subject.width=w;subject.height=h;const sc=subject.getContext('2d');sc.drawImage(adjusted,0,0);sc.globalCompositeOperation='destination-in';sc.drawImage(maskCanvas,0,0)
    if(layer.cutout)ctx.drawImage(subject,0,0);else ctx.drawImage(subject,0,0)
    ctx.save();ctx.globalCompositeOperation='screen';ctx.drawImage(light.rim,0,0);ctx.globalCompositeOperation='lighter';ctx.drawImage(light.sparkle,0,0);ctx.restore()
  }else if(mask&&layer.cutout){const subject=document.createElement('canvas');subject.width=w;subject.height=h;const sc=subject.getContext('2d');sc.drawImage(adjusted,0,0);sc.globalCompositeOperation='destination-in';sc.drawImage(maskCanvas,0,0);ctx.drawImage(subject,0,0)}
  else if(layer.cutout&&!mask)ctx.drawImage(adjusted,0,0)
  if(!original&&project.adjustments?.bloom>0)addBloom(ctx,adjusted,project.adjustments.bloom)
}

function scaleLighting(l,sx,sy){const s=Math.max(sx,sy);return{...l,rimWidth:(l.rimWidth||5)*s,rimSoftness:(l.rimSoftness||2)*s,haloWidth:(l.haloWidth||30)*s,haloSoftness:(l.haloSoftness||28)*s,sparkleSize:(l.sparkleSize||3)*s}}

async function drawImageLayer(ctx,layer,w,h,sx,sy){const im=await cached(layer.dataUrl);if(!im)return;const tr=layer.transform||{},f=layer.filters||{};ctx.save();ctx.filter=`brightness(${100+(f.brightness||0)}%) saturate(${100+(f.saturation||0)}%) blur(${Math.max(0,(f.blur||0)*Math.max(sx,sy))}px)`;drawImageFit(ctx,im,w,h,layer.fit||'contain',{x:(tr.x||0)*sx,y:(tr.y||0)*sy,scale:tr.scale||1,rotation:tr.rotation||0});ctx.restore()}
function drawTextLayer(ctx,layer,sx,sy){const s=layer.style||{},chars=[...(layer.text||'TEXT')],styles=s.chars||[],x=(s.x??100)*sx,y=(s.y??100)*sy;ctx.textBaseline='middle';ctx.textAlign='left';ctx.save();ctx.translate(x,y);ctx.rotate((s.rotation||0)*Math.PI/180);let cursor=0;chars.forEach((ch,idx)=>{const cs={...s,...styles[idx]},size=(cs.fontSize||48)*Math.min(sx,sy);ctx.font=`${cs.fontWeight||700} ${size}px "${cs.fontFamily||'sans-serif'}"`;ctx.fillStyle=cs.color||'#fff';ctx.lineJoin='round';ctx.shadowColor=cs.shadowColor||'transparent';ctx.shadowBlur=(cs.shadowBlur||0)*Math.min(sx,sy);ctx.save();ctx.translate(cursor+(cs.offsetX||0)*sx,(cs.offsetY||0)*sy);ctx.rotate((cs.charRotation||0)*Math.PI/180);const scale=cs.charScale||1;ctx.scale(scale,scale);if((cs.strokeWidth2||0)>0){ctx.strokeStyle=cs.stroke2||'#fff';ctx.lineWidth=(cs.strokeWidth2||0)*Math.min(sx,sy);ctx.strokeText(ch,0,0)}if((cs.strokeWidth||0)>0){ctx.strokeStyle=cs.stroke||'#000';ctx.lineWidth=(cs.strokeWidth||0)*Math.min(sx,sy);ctx.strokeText(ch,0,0)}ctx.fillText(ch,0,0);ctx.restore();cursor+=ctx.measureText(ch).width+(cs.letterSpacing??s.letterSpacing??0)*sx});ctx.restore()}
function drawDrawing(ctx,layer,sx,sy){for(const stroke of layer.strokes||[]){if(!stroke.points?.length)continue;ctx.save();ctx.strokeStyle=stroke.color||'#fff';ctx.lineWidth=(stroke.size||6)*Math.min(sx,sy);ctx.globalAlpha=(stroke.opacity??1)*(layer.opacity??1);ctx.lineCap='round';ctx.lineJoin='round';if(stroke.glow){ctx.shadowColor=stroke.color||'#fff';ctx.shadowBlur=ctx.lineWidth*1.5}ctx.beginPath();stroke.points.forEach((p,i)=>{const x=p.x*sx,y=p.y*sy;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();ctx.restore()}}
