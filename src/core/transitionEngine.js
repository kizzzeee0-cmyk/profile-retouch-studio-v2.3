import { renderGLTransition } from './glTransitions.js'

const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v))
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2

export async function renderSceneTransition(target,from,to,type,progress){
  const t=clamp(progress),s=target.width,ctx=target.getContext('2d')
  if(type?.startsWith('gl:')){
    try{return renderGLTransition(target,from,to,type,t)}catch(e){console.warn('GL transition fallback',type,e)}
  }
  ctx.clearRect(0,0,target.width,target.height)
  const e=ease(t)
  ctx.save()
  if(type==='builtin:blur-cross'){
    ctx.globalAlpha=1-e;ctx.filter=`blur(${e*14}px)`;ctx.drawImage(from,0,0,s,s);ctx.filter='none';ctx.globalAlpha=e;ctx.drawImage(to,0,0,s,s);ctx.restore();return target
  }
  if(type==='builtin:white-flash'){
    ctx.drawImage(e<.5?from:to,0,0,s,s);ctx.globalAlpha=(1-Math.abs(e-.5)*2)*.95;ctx.fillStyle='#fff';ctx.fillRect(0,0,s,s);ctx.restore();return target
  }
  if(type==='builtin:circle-open'){
    ctx.drawImage(from,0,0,s,s);ctx.beginPath();ctx.arc(s/2,s/2,e*s*.76,0,Math.PI*2);ctx.clip();ctx.drawImage(to,0,0,s,s);ctx.restore();return target
  }
  if(type==='builtin:heart-open'||type==='builtin:star-open'){
    ctx.drawImage(from,0,0,s,s);ctx.save();ctx.translate(s/2,s/2);const r=e*s*.78
    type.includes('heart')?heartPath(ctx,0,0,r):starPath(ctx,0,0,r,5)
    ctx.clip();ctx.translate(-s/2,-s/2);ctx.drawImage(to,0,0,s,s);ctx.restore();ctx.restore();return target
  }
  if(type==='builtin:pixel-grid'){
    ctx.drawImage(from,0,0,s,s);const n=14
    for(let y=0;y<n;y++)for(let x=0;x<n;x++)if((((x*17+y*31)%101)/100)<e){const d=s/n;ctx.drawImage(to,x*d,y*d,d,d,x*d,y*d,d,d)}
    ctx.restore();return target
  }
  if(type==='builtin:sparkle-burst'){
    ctx.globalAlpha=1-e;ctx.drawImage(from,0,0,s,s);ctx.globalAlpha=e;ctx.drawImage(to,0,0,s,s);ctx.globalAlpha=Math.sin(e*Math.PI);ctx.fillStyle='#fff';ctx.shadowColor='#fff';ctx.shadowBlur=s*.035
    for(let i=0;i<18;i++){const ang=i/18*Math.PI*2,rr=e*s*.52,x=s/2+Math.cos(ang)*rr,y=s/2+Math.sin(ang)*rr;starPath(ctx,x,y,2+6*Math.sin(e*Math.PI),4);ctx.fill()}
    ctx.restore();return target
  }
  ctx.globalAlpha=1-e;ctx.drawImage(from,0,0,s,s);ctx.globalAlpha=e;ctx.drawImage(to,0,0,s,s);ctx.restore();return target
}

export function makeTransitionSample(width=140,height=76,label='A',a='#6f63df',b='#b59dff'){
  const c=document.createElement('canvas');c.width=width;c.height=height;const x=c.getContext('2d')
  const g=x.createLinearGradient(0,0,width,height);g.addColorStop(0,a);g.addColorStop(1,b);x.fillStyle=g;x.fillRect(0,0,width,height)
  x.fillStyle='rgba(255,255,255,.16)';x.beginPath();x.arc(width*.25,height*.3,height*.24,0,Math.PI*2);x.fill()
  x.fillStyle='#fff';x.font=`800 ${Math.max(18,height*.42)}px system-ui`;x.textAlign='center';x.textBaseline='middle';x.fillText(label,width/2,height/2)
  return c
}

function heartPath(ctx,x,y,r){
  const k=r/34;ctx.beginPath();ctx.moveTo(x,y+r*.31);ctx.bezierCurveTo(x-r*.72,y-r*.18,x-r*.5,y-r*.78,x,y-r*.36);ctx.bezierCurveTo(x+r*.5,y-r*.78,x+r*.72,y-r*.18,x,y+r*.31);ctx.closePath()
}
function starPath(ctx,x,y,r,n=5){ctx.beginPath();for(let i=0;i<n*2;i++){const rr=i%2?r*.42:r,a=-Math.PI/2+i*Math.PI/n,px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr;i?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.closePath()}
