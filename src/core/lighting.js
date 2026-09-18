import { maskToCanvas } from './mask.js'

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v))

export function createDirectionalLighting(mask,w,h,settings={}){
  const angle=(settings.angle??225)*Math.PI/180
  const lightX=Math.cos(angle),lightY=Math.sin(angle)
  const coverage=clamp(settings.range??105,15,180)*Math.PI/180
  const threshold=Math.cos(coverage/2)
  const focus=Math.max(.35,settings.focus??1.55)
  const edgeAlpha=new Uint8ClampedArray(w*h)
  const rimAlpha=new Uint8ClampedArray(w*h)
  const points=[]

  // Only the *outer* subject silhouette is eligible. Internal costume/hair seams are ignored.
  for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
    const p=y*w+x,m=mask[p]
    if(m<28)continue
    const n0=mask[p-1],n1=mask[p+1],n2=mask[p-w],n3=mask[p+w]
    if(Math.min(n0,n1,n2,n3)>210)continue
    // Sobel gradient points toward higher alpha (inside); outward normal is the negative gradient.
    const gx=(-mask[p-w-1]-2*mask[p-1]-mask[p+w-1]+mask[p-w+1]+2*mask[p+1]+mask[p+w+1])*.125
    const gy=(-mask[p-w-1]-2*mask[p-w]-mask[p-w+1]+mask[p+w-1]+2*mask[p+w]+mask[p+w+1])*.125
    const mag=Math.hypot(gx,gy)
    if(mag<4)continue
    const ox=-gx/mag,oy=-gy/mag
    const dot=ox*lightX+oy*lightY
    if(dot<=threshold)continue
    let directional=Math.pow(clamp((dot-threshold)/Math.max(.0001,1-threshold),0,1),focus)
    // Small breakup prevents the rim from reading as one artificial solid stroke.
    const breakup=settings.breakup??.12
    if(breakup>0){const noise=(hash(p+(settings.sparkleSeed??19))%1000)/1000;directional*=1-breakup+noise*breakup}
    const alpha=Math.round(255*directional*clamp(m/220,0,1))
    edgeAlpha[p]=alpha
    if(alpha>50)points.push({x,y,v:alpha})
  }

  // Thin core light: spread only a few pixels *inside* the subject, never a fat outside stroke.
  const coreWidth=clamp(settings.rimWidth??2,1,8)
  const coreRadius=Math.max(1,Math.ceil(coreWidth))
  for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
    const p=y*w+x,v=edgeAlpha[p];if(!v)continue
    for(let yy=Math.max(0,y-coreRadius);yy<=Math.min(h-1,y+coreRadius);yy++)for(let xx=Math.max(0,x-coreRadius);xx<=Math.min(w-1,x+coreRadius);xx++){
      const q=yy*w+xx;if(mask[q]<28)continue
      const dist=Math.hypot(xx-x,yy-y);if(dist>coreWidth+.5)continue
      const fall=1-dist/(coreWidth+.75),nv=Math.round(v*clamp(fall,0,1));if(nv>rimAlpha[q])rimAlpha[q]=nv
    }
  }

  const subject=maskToCanvas(mask,w,h,0)
  const edge=alphaCanvas(edgeAlpha,w,h)
  const rimBase=tint(alphaCanvas(rimAlpha,w,h),w,h,settings.rimColor||'#ffffff')
  const rim=document.createElement('canvas');rim.width=w;rim.height=h
  const rc=rim.getContext('2d')
  rc.save();rc.globalAlpha=clamp((settings.rimOpacity??52)/100,0,1);rc.filter=`blur(${clamp(settings.rimSoftness??.65,0,3)}px)`;rc.drawImage(rimBase,0,0);rc.restore()

  // Halo is a faint bloom behind the subject. It is generated from the thin directional edge, not from the whole mask.
  const halo=document.createElement('canvas');halo.width=w;halo.height=h
  const hc=halo.getContext('2d'),haloColor=settings.haloColor||'#8ceeff',haloBase=tint(edge,w,h,haloColor)
  hc.save();hc.globalAlpha=clamp((settings.haloOpacity??12)/100,0,1);hc.filter=`blur(${clamp(settings.haloSoftness??7,2,24)}px)`
  const spread=clamp(settings.haloWidth??8,2,28)
  const rings=Math.max(1,Math.ceil(spread/5))
  for(let r=0;r<rings;r++)for(let i=0;i<12;i++){const a=i/12*Math.PI*2,rr=(r+1)*spread/rings*.45;hc.drawImage(haloBase,Math.cos(a)*rr,Math.sin(a)*rr)}
  hc.drawImage(haloBase,0,0);hc.filter='none';hc.globalCompositeOperation='destination-out';hc.drawImage(subject,0,0);hc.restore()

  const sparkle=document.createElement('canvas');sparkle.width=w;sparkle.height=h
  drawSparkles(sparkle.getContext('2d'),points,settings)
  return {subject,edge,rim,halo,sparkle}
}

function alphaCanvas(alpha,w,h){
  const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d')
  const im=ctx.createImageData(w,h);for(let p=0;p<alpha.length;p++){const i=p*4;im.data[i]=im.data[i+1]=im.data[i+2]=255;im.data[i+3]=alpha[p]}
  ctx.putImageData(im,0,0);return c
}
function tint(src,w,h,color){const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');ctx.drawImage(src,0,0);ctx.globalCompositeOperation='source-in';ctx.fillStyle=color;ctx.fillRect(0,0,w,h);return c}
function hash(n){n=Math.imul(n^n>>>16,0x45d9f3b);n=Math.imul(n^n>>>16,0x45d9f3b);return(n^n>>>16)>>>0}
function drawSparkles(ctx,points,s){
  const count=Math.min(24,Math.max(0,s.sparkleCount??3));if(!count||!points.length)return
  const color=s.sparkleColor||'#ffffff',size=clamp(s.sparkleSize??2.2,.8,7),seed=s.sparkleSeed??19
  const chosen=[],stride=Math.max(1,Math.floor(points.length/Math.max(1,count*5)))
  for(let i=0;i<points.length;i+=stride){const p=points[i],score=p.v+(hash(i+seed)%80);chosen.push({...p,score})}
  chosen.sort((a,b)=>b.score-a.score);const accepted=[]
  for(const p of chosen){if(accepted.some(q=>Math.hypot(q.x-p.x,q.y-p.y)<Math.max(14,size*8)))continue;accepted.push(p);if(accepted.length>=count)break}
  for(let i=0;i<accepted.length;i++){
    const p=accepted[i],r=size*(.7+(hash(i+seed)%45)/100)
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate((hash(i*11+seed)%628)/100);ctx.strokeStyle=color;ctx.fillStyle=color;ctx.globalAlpha=.35+(hash(i*17+seed)%40)/100;ctx.shadowColor=color;ctx.shadowBlur=r*2;ctx.lineWidth=Math.max(.55,r*.22)
    ctx.beginPath();ctx.moveTo(-r*1.8,0);ctx.lineTo(r*1.8,0);ctx.moveTo(0,-r*1.8);ctx.lineTo(0,r*1.8);ctx.stroke();ctx.beginPath();ctx.arc(0,0,r*.28,0,Math.PI*2);ctx.fill();ctx.restore()
  }
}

export const LIGHT_PRESETS={
  '내추럴 역광':{angle:225,range:92,focus:1.7,rimColor:'#ffffff',haloColor:'#dffaff',rimWidth:2,rimSoftness:.55,rimOpacity:48,haloWidth:7,haloSoftness:7,haloOpacity:9,sparkleCount:0,sparkleSize:2,breakup:.12},
  '클린 VTuber':{angle:225,range:105,focus:1.55,rimColor:'#ffffff',haloColor:'#c8f7ff',rimWidth:1.6,rimSoftness:.45,rimOpacity:45,haloWidth:6,haloSoftness:6,haloOpacity:8,sparkleCount:2,sparkleSize:1.7,breakup:.10},
  '화이트 + 시안 역광':{angle:225,range:108,focus:1.45,rimColor:'#ffffff',haloColor:'#68ecff',rimWidth:2.2,rimSoftness:.65,rimOpacity:62,haloWidth:9,haloSoftness:9,haloOpacity:14,sparkleCount:4,sparkleSize:2.2,breakup:.14},
  '민트 포인트':{angle:205,range:102,focus:1.55,rimColor:'#fbffff',haloColor:'#8effd9',rimWidth:2,rimSoftness:.6,rimOpacity:55,haloWidth:8,haloSoftness:8,haloOpacity:12,sparkleCount:3,sparkleSize:2,breakup:.13},
  '라벤더 포인트':{angle:315,range:102,focus:1.5,rimColor:'#ffffff',haloColor:'#b9adff',rimWidth:2,rimSoftness:.6,rimOpacity:55,haloWidth:9,haloSoftness:9,haloOpacity:13,sparkleCount:4,sparkleSize:2.1,breakup:.15},
  '문라이트':{angle:315,range:88,focus:1.75,rimColor:'#eef9ff',haloColor:'#7097ff',rimWidth:2.2,rimSoftness:.7,rimOpacity:58,haloWidth:10,haloSoftness:10,haloOpacity:13,sparkleCount:2,sparkleSize:2,breakup:.12},
  '선셋 역광':{angle:210,range:94,focus:1.65,rimColor:'#fff5e8',haloColor:'#ffad80',rimWidth:2.1,rimSoftness:.65,rimOpacity:60,haloWidth:9,haloSoftness:9,haloOpacity:13,sparkleCount:3,sparkleSize:2,breakup:.14},
  '비치 하이라이트':{angle:225,range:115,focus:1.45,rimColor:'#ffffff',haloColor:'#73efff',rimWidth:2.5,rimSoftness:.7,rimOpacity:66,haloWidth:11,haloSoftness:10,haloOpacity:16,sparkleCount:5,sparkleSize:2.4,breakup:.17},
  '우측 얇은 림':{angle:0,range:72,focus:1.9,rimColor:'#ffffff',haloColor:'#9de9ff',rimWidth:1.7,rimSoftness:.45,rimOpacity:52,haloWidth:6,haloSoftness:6,haloOpacity:8,sparkleCount:1,sparkleSize:1.8,breakup:.1}
}
