import { clamp, hexToRgb } from './utils.js'
import { drawMedia } from './media.js'
import { renderSceneTransition } from './transitionEngine.js'
import { drawBorder } from './borderEngine.js'
import { drawDecoration, drawDecorationLayer, drawBuiltInSticker } from './decorEngine.js'
import { drawBackground } from './backgroundEngine.js'

const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2
const easeOut=t=>1-Math.pow(1-t,3)

export async function renderGifFrame(project,sceneIndex,localTime,transitionProgress=0,outputSize=null){
  const size=outputSize || project.output.size
  const c=document.createElement('canvas')
  c.width=c.height=size
  const ctx=c.getContext('2d')
  const scene=project.scenes[sceneIndex],next=project.scenes[(sceneIndex+1)%project.scenes.length]
  if(!scene){await drawBackground(ctx,project.background,size,size,localTime);drawDecoration(ctx,project.decoration,size,localTime);drawBorder(ctx,project.border,size,localTime);return circleOutput(project,c)}
  const a=await sceneCanvas(project,scene,size,localTime),b=next?await sceneCanvas(project,next,size,0):null
  if(b&&transitionProgress>0){const tc=document.createElement('canvas');tc.width=tc.height=size;await renderSceneTransition(tc,a,b,scene.transition||'builtin:fade',clamp(transitionProgress,0,1));ctx.drawImage(tc,0,0)}
  else ctx.drawImage(a,0,0)
  drawDecoration(ctx,project.decoration,size,localTime)
  drawGifDrawing(ctx,project,size)
  drawBorder(ctx,project.border,size,localTime)
  drawAnimatedText(ctx,scene.text||project.text,size,localTime,scene.duration||1.5)
  return circleOutput(project,c)
}

function circleOutput(project,c){if(project.output.circle===false)return c;const s=c.width,out=document.createElement('canvas');out.width=out.height=s;const o=out.getContext('2d');o.beginPath();o.arc(s/2,s/2,s/2,0,Math.PI*2);o.clip();o.drawImage(c,0,0);return out}

async function sceneCanvas(project,scene,size,time){
  const raw=document.createElement('canvas');raw.width=raw.height=size;const ctx=raw.getContext('2d');await drawBackground(ctx,scene.background||project.background,size,size,time)
  if(scene.imageDataUrl||scene.frames?.length||scene.mediaKind==='video'){
    const base={dataUrl:scene.imageDataUrl,frames:scene.frames,sourceFps:scene.sourceFps,mediaKind:scene.mediaKind,fit:scene.fit||'cover',transform:scene.transform||{x:0,y:0,scale:1,rotation:0},opacity:1,blend:'source-over',speed:scene.playbackSpeed||1}
    if(scene.motion==='soft-zoom'){const p=clamp(time/Math.max(.01,scene.duration||1),0,1);base.transform={...base.transform,scale:(base.transform.scale||1)*(1+.045*Math.sin(p*Math.PI))}}
    await drawMedia(ctx,base,size,time)
  }
  for(const layer of scene.layers||[])await drawSceneLayer(ctx,layer,size,time,scene.duration||1.5)
  if(scene.tint){ctx.fillStyle=scene.tint;ctx.globalAlpha=scene.tintOpacity||0;ctx.fillRect(0,0,size,size);ctx.globalAlpha=1}
  return applySceneInOut(raw,scene,time,size)
}

async function drawSceneLayer(ctx,layer,size,time,sceneDuration){
  if(layer.visible===false)return
  const start=layer.start??0,end=layer.end??sceneDuration
  if(time<start||time>end)return
  const local=Math.max(0,time-start)
  const total=Math.max(.05,end-start)
  const off=document.createElement('canvas');off.width=off.height=size;const o=off.getContext('2d')
  if(layer.kind==='sticker') drawBuiltInSticker(o,layer,size,local)
  else if(layer.kind==='decor') drawDecorationLayer(o,layer,size,local)
  else await drawMedia(o,layer,size,local)
  const state=layerAnimatedState(layer,local,total,size)
  applyStateToCanvas(ctx,off,state,size)
}

function applySceneInOut(raw,scene,time,size){
  const d=Math.max(.05,scene.duration||1.5),inDur=Math.min(scene.inDuration??.25,d*.45),outDur=Math.min(scene.outDuration??.25,d*.45)
  let state={opacity:1,dx:0,dy:0,scaleX:1,scaleY:1,rot:0,blur:0,glow:0,clip:null}
  if(scene.inEffect&&scene.inEffect!=='none'&&time<inDur)state=sceneState(scene.inEffect,clamp(time/inDur,0,1),true,size)
  else if(scene.outEffect&&scene.outEffect!=='none'&&time>d-outDur)state=sceneState(scene.outEffect,clamp((time-(d-outDur))/outDur,0,1),false,size)
  const out=document.createElement('canvas');out.width=out.height=size;const c=out.getContext('2d')
  applyStateToCanvas(c,raw,state,size)
  return out
}

function applyStateToCanvas(ctx,canvas,state,size){
  ctx.save();ctx.globalAlpha=state.opacity;ctx.translate(size/2+state.dx,size/2+state.dy);ctx.rotate(state.rot);ctx.scale(state.scaleX,state.scaleY);if(state.blur)ctx.filter=`blur(${state.blur}px)`;if(state.glow){ctx.shadowColor='#ffffff';ctx.shadowBlur=state.glow}
  if(state.clip){ctx.beginPath();ctx.rect(-size/2,-size/2,state.clip*size,size);ctx.clip()}
  ctx.drawImage(canvas,-size/2,-size/2);ctx.restore()
}

function layerAnimatedState(layer,time,duration,size){
  const inEffect=layer.inEffect||'fade',outEffect=layer.outEffect||'fade',inDur=Math.min(layer.inDuration??.2,duration*.45),outDur=Math.min(layer.outDuration??.2,duration*.45)
  if(inEffect&&inEffect!=='none'&&time<inDur)return sceneState(inEffect,clamp(time/inDur,0,1),true,size)
  if(outEffect&&outEffect!=='none'&&time>duration-outDur)return sceneState(outEffect,clamp((time-(duration-outDur))/outDur,0,1),false,size)
  return {opacity:1,dx:0,dy:0,scaleX:1,scaleY:1,rot:0,blur:0,glow:0,clip:null}
}

function sceneState(type,t,isIn,s){
  const p=isIn?easeOut(t):ease(t),q=isIn?1-p:p,opacity=isIn?p:1-p,b={opacity,dx:0,dy:0,scaleX:1,scaleY:1,rot:0,blur:0,glow:0,clip:null}
  if(type==='fade')return b
  if(type==='rise')return{...b,dy:(isIn?1-p:-p)*s*.16}
  if(type==='drop')return{...b,dy:(isIn?p-1:p)*s*.16}
  if(type==='slide-left')return{...b,dx:(isIn?1-p:-p)*-s*.32}
  if(type==='slide-right')return{...b,dx:(isIn?1-p:p)*s*.32}
  if(type==='zoom')return{...b,scaleX:isIn?.65+.35*p:1-.35*p,scaleY:isIn?.65+.35*p:1-.35*p}
  if(type==='pop'){const sc=isIn?.55+.5*p+Math.sin(p*Math.PI)*.12:1+.2*Math.sin(p*Math.PI)-.6*p;return{...b,scaleX:sc,scaleY:sc}}
  if(type==='rotate')return{...b,rot:(isIn?1-p:p)*Math.PI*.75,scaleX:.75+.25*(isIn?p:1-p),scaleY:.75+.25*(isIn?p:1-p)}
  if(type==='flip-x')return{...b,scaleX:Math.max(.04,isIn?p:1-p)}
  if(type==='blur')return{...b,blur:(isIn?1-p:p)*14}
  if(type==='glow')return{...b,glow:(isIn?1-p:p)*28}
  if(type==='bounce')return{...b,dy:-Math.abs(Math.sin(p*Math.PI*3))*(isIn?1-p:p)*s*.12}
  if(type==='elastic'){const sc=1+Math.sin(p*Math.PI*5)*(isIn?1-p:p)*.25;return{...b,scaleX:sc,scaleY:sc}}
  if(type==='wipe')return{...b,opacity:1,clip:isIn?p:1-p}
  return b
}

function drawGifDrawing(ctx,p,s){const strokes=p.drawing?.strokes||[],scale=s/180;for(const stroke of strokes){if(!stroke.points?.length)continue;ctx.save();ctx.strokeStyle=stroke.color||'#fff';ctx.lineWidth=(stroke.size||4)*scale;ctx.globalAlpha=stroke.opacity??1;ctx.lineCap='round';ctx.lineJoin='round';if(stroke.glow){ctx.shadowColor=stroke.color||'#fff';ctx.shadowBlur=ctx.lineWidth*1.8}ctx.beginPath();stroke.points.forEach((pt,i)=>{const x=pt.x*scale,y=pt.y*scale;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();ctx.restore()}}

function drawAnimatedText(ctx,text,s,time,duration){
  if(!text?.content)return;const start=clamp(text.start??0,0,duration),end=clamp(text.end??duration,start,duration);if(time<start||time>end)return
  const inDur=Math.min(text.inDuration??.35,Math.max(.01,end-start)),outDur=Math.min(text.outDuration??.35,Math.max(.01,end-start)),outStart=Math.max(start,end-outDur)
  const chars=[...text.content],family=text.fontFamily||'sans-serif',baseSize=(text.fontSize||26)*s/180,x=(text.x??90)*s/180,y=(text.y??132)*s/180,delay=text.delayPerLetter??.06
  ctx.save();ctx.textBaseline='middle';ctx.textAlign='center';ctx.font=`700 ${baseSize}px "${family}"`;const widths=chars.map(ch=>ctx.measureText(ch).width+(text.letterSpacing||0)),total=widths.reduce((a,b)=>a+b,0);let cursor=x-total/2
  chars.forEach((ch,i)=>{
    const cs={...text,...(text.chars?.[i]||{})},tin=clamp((time-start-i*delay)/Math.max(.05,inDur),0,1),tout=clamp((time-outStart)/Math.max(.05,outDur),0,1)
    const inType=cs.animationIn||text.animationIn||'fade',outType=cs.animationOut||text.animationOut||'fade'
    const si=textInState(inType,tin,i,time),so=textOutState(outType,tout,i,time),op=si.opacity*so.opacity
    ctx.save();ctx.translate(cursor+widths[i]/2+(cs.offsetX||0)*s/180+(si.dx+so.dx)*s/180,y+(cs.offsetY||0)*s/180+(si.dy+so.dy)*s/180);ctx.rotate(((text.rotation||0)+(cs.charRotation||0)+si.rot+so.rot)*Math.PI/180);const charScale=cs.charScale||1;ctx.scale(si.scaleX*so.scaleX*charScale,si.scaleY*so.scaleY*charScale);ctx.globalAlpha=op*(cs.opacity??1);ctx.font=`${cs.fontWeight||text.fontWeight||700} ${baseSize}px "${cs.fontFamily||family}"`;ctx.fillStyle=cs.color||text.color||'#fff';ctx.lineJoin='round';ctx.filter=(si.blur+so.blur)>0?`blur(${(si.blur+so.blur)*s/180}px)`:'none';ctx.shadowColor=(si.glow||so.glow)?(cs.color||text.color||'#fff'):(cs.shadowColor||'transparent');ctx.shadowBlur=(si.glow||so.glow)?10*s/180:(cs.shadowBlur||0)*s/180
    const sw2=(cs.strokeWidth2??text.strokeWidth2??0)*s/180;if(sw2>0){ctx.strokeStyle=cs.stroke2||text.stroke2||'#fff';ctx.lineWidth=sw2;ctx.strokeText(ch,0,0)}const sw=(cs.strokeWidth??text.strokeWidth??0)*s/180;if(sw>0){ctx.strokeStyle=cs.stroke||text.stroke||'#7b70c8';ctx.lineWidth=sw;ctx.strokeText(ch,0,0)}
    // Distinct renderer details so similarly named effects do not collapse into the same fade.
    if(inType==='prism'||outType==='prism'){const g=ctx.createLinearGradient(-baseSize*.55,0,baseSize*.55,0);const shift=(time*.65+i*.13)%1;g.addColorStop(0,`hsl(${(shift*360)%360} 95% 72%)`);g.addColorStop(.5,`hsl(${((shift+.33)%1)*360} 95% 76%)`);g.addColorStop(1,`hsl(${((shift+.66)%1)*360} 95% 72%)`);ctx.fillStyle=g}
    if(inType==='shimmer'||outType==='shimmer'){const k=((time*1.7+i*.11)%1),g=ctx.createLinearGradient(-baseSize,0,baseSize,0);g.addColorStop(Math.max(0,k-.16),cs.color||text.color||'#fff');g.addColorStop(k,'#ffffff');g.addColorStop(Math.min(1,k+.16),cs.color||text.color||'#fff');ctx.fillStyle=g;ctx.shadowColor='#fff';ctx.shadowBlur=8*s/180}
    if(inType==='glitch'&&tin<.95){ctx.save();ctx.globalAlpha*=.42;ctx.fillStyle='#56e7ff';ctx.fillText(ch,-2*s/180,0);ctx.fillStyle='#ff6aa8';ctx.fillText(ch,2*s/180,0);ctx.restore()}
    drawTextParticles(ctx,inType,outType,tin,tout,baseSize,i,time,cs.color||text.color||'#fff')
    ctx.fillText(ch,0,0);ctx.restore();cursor+=widths[i]
  });ctx.restore()
}

function drawTextParticles(ctx,inType,outType,tin,tout,size,i,time,color){
  const activeIn=(inType==='heart'||inType==='star'||inType==='sparkle')&&tin>0&&tin<1
  const activeOut=(outType==='heart'||outType==='star'||outType==='sparkle')&&tout>0&&tout<1
  if(!activeIn&&!activeOut)return
  const type=activeOut?outType:inType,p=activeOut?tout:tin,dir=activeOut?1:-1
  ctx.save();ctx.globalAlpha*=Math.sin(Math.PI*p)*.85;ctx.fillStyle=color;ctx.strokeStyle=color;ctx.shadowColor=color;ctx.shadowBlur=size*.18
  for(let n=0;n<4;n++){
    const a=n*Math.PI/2+i*.63+time*.7,rr=size*(.35+p*.48),x=Math.cos(a)*rr,y=Math.sin(a)*rr*dir
    if(type==='heart'){heartPath(ctx,x,y,size*.09);ctx.fill()}
    else if(type==='star'){starPath(ctx,x,y,size*.10,5);ctx.fill()}
    else{const r=size*.12;ctx.lineWidth=Math.max(.7,size*.018);ctx.beginPath();ctx.moveTo(x-r,y);ctx.lineTo(x+r,y);ctx.moveTo(x,y-r);ctx.lineTo(x,y+r);ctx.stroke()}
  }
  ctx.restore()
}

function baseIn(e){return{opacity:e,dx:0,dy:0,rot:0,scaleX:1,scaleY:1,glow:false,blur:0,shimmer:false}}
function textInState(type,t,i,time){const e=easeOut(t),b=baseIn(e),j=((i*37)%31)-15
  if(type==='fade')return b;if(type==='rise')return{...b,dy:(1-e)*18};if(type==='drop')return{...b,dy:(e-1)*20};if(type==='slide-left')return{...b,dx:(1-e)*-35};if(type==='slide-right')return{...b,dx:(1-e)*35}
  if(type==='scale')return{...b,scaleX:.5+.5*e,scaleY:.5+.5*e};if(type==='pop'||type==='heart'||type==='star')return{...b,scaleX:.35+.7*e+Math.sin(e*Math.PI)*.15,scaleY:.35+.7*e+Math.sin(e*Math.PI)*.15,glow:type!=='pop'}
  if(type==='bounce')return{...b,dy:-Math.abs(Math.sin(e*Math.PI*2.5))*(1-e)*24};if(type==='elastic'){const q=1+Math.sin(e*Math.PI*5)*(1-e)*.35;return{...b,scaleX:q,scaleY:q}}
  if(type==='rotate')return{...b,rot:(1-e)*-70};if(type==='flip-x')return{...b,scaleX:Math.max(.04,e)};if(type==='flip-y')return{...b,scaleY:Math.max(.04,e)}
  if(type==='typewriter'||type==='letter-pop')return{...b,opacity:t>(type==='typewriter'?.72:.35)?1:0,scaleX:type==='letter-pop'?.7+.3*e:1,scaleY:type==='letter-pop'?.7+.3*e:1}
  if(type==='wave')return{...b,dy:Math.sin(time*6+i*.8)*5*(1-.4*e)};if(type==='gather')return{...b,dx:(1-e)*j*2,dy:(1-e)*((((i*53)%35)-17)*1.8),rot:(1-e)*j*2}
  if(type==='spiral'){const a=(1-e)*Math.PI*2+i*.6,r=(1-e)*45;return{...b,dx:Math.cos(a)*r,dy:Math.sin(a)*r,rot:(1-e)*180}}
  if(type==='blur')return{...b,blur:(1-e)*8};if(type==='glow'||type==='neon'||type==='sparkle')return{...b,glow:true,blur:type==='glow'?(1-e)*3:0}
  if(type==='stretch')return{...b,scaleX:.18+.82*e};if(type==='squeeze')return{...b,scaleY:.18+.82*e};if(type==='swing')return{...b,rot:Math.sin(e*Math.PI*3)*(1-e)*35}
  if(type==='float')return{...b,dy:(1-e)*24+Math.sin(time*3+i)*2};if(type==='glitch')return{...b,dx:t<.9?Math.sin(i*12+time*50)*5*(1-e):0,rot:Math.sin(time*70+i)*2*(1-e)}
  if(type==='shimmer'||type==='prism')return{...b,shimmer:true,glow:type==='prism'};return b}
function textOutState(type,t,i,time){if(t<=0)return{opacity:1,dx:0,dy:0,rot:0,scaleX:1,scaleY:1,glow:false,blur:0,shimmer:false};const e=ease(t),b={opacity:1-e,dx:0,dy:0,rot:0,scaleX:1,scaleY:1,glow:false,blur:0,shimmer:false},j=((i*47)%45)-22
  if(type==='fade')return b;if(type==='rise')return{...b,dy:-28*e};if(type==='drop')return{...b,dy:30*e};if(type==='slide-left')return{...b,dx:-42*e};if(type==='slide-right')return{...b,dx:42*e};if(type==='scale')return{...b,scaleX:1-.6*e,scaleY:1-.6*e};if(type==='grow')return{...b,scaleX:1+.7*e,scaleY:1+.7*e}
  if(type==='rotate')return{...b,rot:140*e,scaleX:1-.25*e,scaleY:1-.25*e};if(type==='flip-x')return{...b,scaleX:Math.max(.03,Math.cos(e*Math.PI/2))};if(type==='flip-y')return{...b,scaleY:Math.max(.03,Math.cos(e*Math.PI/2))}
  if(type==='blur')return{...b,blur:e*10};if(type==='glow'||type==='neon'||type==='sparkle')return{...b,glow:true,blur:type==='glow'?e*4:0};if(type==='scatter')return{...b,dx:e*j*2,dy:e*((i*61)%45-22)*2,rot:e*j*4}
  if(type==='fall-letters')return{...b,dy:e*(28+i*2),rot:e*j*3};if(type==='rise-letters')return{...b,dy:-e*(28+i*2)};if(type==='spin-letters')return{...b,rot:e*(180+j*4),scaleX:1-.3*e,scaleY:1-.3*e}
  if(type==='dissolve'||type==='pixel')return{...b,opacity:((i*29)%100)/100>e?1:0};if(type==='heart'||type==='star')return{...b,glow:true,scaleX:1+.35*e,scaleY:1+.35*e}
  if(type==='wave')return{...b,dy:Math.sin(time*8+i*.8)*8*e,dx:e*18};if(type==='elastic'){const q=1+Math.sin(e*Math.PI*6)*(1-e)*.25;return{...b,scaleX:q,scaleY:q}}if(type==='shimmer')return{...b,shimmer:true};return b}

function heartPath(ctx,x,y,r){ctx.beginPath();ctx.moveTo(x,y+r*.35);ctx.bezierCurveTo(x-r*1.2,y-r*.45,x-r*.55,y-r*1.15,x,y-r*.45);ctx.bezierCurveTo(x+r*.55,y-r*1.15,x+r*1.2,y-r*.45,x,y+r*.35);ctx.closePath()}
function starPath(ctx,x,y,r,points=5){ctx.beginPath();for(let i=0;i<points*2;i++){const a=-Math.PI/2+i*Math.PI/points,rr=i%2?r*.42:r,px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr;i?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.closePath()}
