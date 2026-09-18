import { loadImage } from './utils.js'

const imageCache=new Map()
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v))

async function cachedImage(src){
  if(!src)return null
  if(!imageCache.has(src))imageCache.set(src,loadImage(src))
  return imageCache.get(src)
}

export async function drawBackground(ctx,bg,w,h,time=0){
  const b=bg||{type:'color',colorA:'#efeaff'}
  if(b.type==='image'&&b.dataUrl){
    ctx.save()
    ctx.fillStyle=b.fallback||'#efeaff';ctx.fillRect(0,0,w,h)
    try{
      const im=await cachedImage(b.dataUrl)
      const iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height
      const mode=b.fit||'cover',scale=mode==='contain'?Math.min(w/iw,h/ih):Math.max(w/iw,h/ih)
      const dw=iw*scale*(b.scale||1),dh=ih*scale*(b.scale||1)
      const x=(w-dw)/2+(b.x||0)*w/180,y=(h-dh)/2+(b.y||0)*h/180
      ctx.globalAlpha=clamp(b.opacity??1,0,1)
      ctx.filter=`brightness(${100+(b.brightness||0)}%) saturate(${100+(b.saturation||0)}%) hue-rotate(${b.hue||0}deg) blur(${Math.max(0,b.blur||0)}px)`
      ctx.translate(w/2,h/2);ctx.rotate((b.rotation||0)*Math.PI/180);ctx.translate(-w/2,-h/2)
      ctx.drawImage(im,x,y,dw,dh)
    }catch(e){console.warn('Background image failed',e)}
    ctx.restore();return
  }
  if(b.type==='gradient')return drawGradient(ctx,b,w,h)
  if(b.type==='pattern')return drawPattern(ctx,b,w,h,time)
  ctx.save();ctx.filter=`hue-rotate(${b.hue||0}deg)`;ctx.fillStyle=b.colorA||b.color||'#efeaff';ctx.fillRect(0,0,w,h);ctx.restore()
}

function drawGradient(ctx,b,w,h){
  const colors=[b.colorA||'#cbc3ff',b.colorB||'#ffd4e6',b.colorC].filter(Boolean)
  const stopA=clamp((b.stopA??0)/100,0,.95)
  const stopB=clamp((b.stopB??(colors.length===3?52:100))/100,stopA+.01,.99)
  const stopC=clamp((b.stopC??100)/100,stopB+.01,1)
  const stops=colors.length===3?[stopA,stopB,stopC]:[stopA,stopB]
  let g
  if(b.gradientType==='radial'){
    g=ctx.createRadialGradient(w*.5,h*.5,0,w*.5,h*.5,Math.hypot(w,h)*.62)
  }else if(b.gradientType==='conic'&&ctx.createConicGradient){
    g=ctx.createConicGradient(((b.angle??135)-90)*Math.PI/180,w/2,h/2)
  }else{
    const a=(b.angle??135)*Math.PI/180,cx=w/2,cy=h/2,len=Math.abs(w*Math.cos(a))+Math.abs(h*Math.sin(a))
    g=ctx.createLinearGradient(cx-Math.cos(a)*len/2,cy-Math.sin(a)*len/2,cx+Math.cos(a)*len/2,cy+Math.sin(a)*len/2)
  }
  colors.forEach((c,i)=>g.addColorStop(stops[i]??i/(colors.length-1),c))
  ctx.save();ctx.filter=`hue-rotate(${b.hue||0}deg)`;ctx.fillStyle=g;ctx.fillRect(0,0,w,h);ctx.restore()
}

function drawPattern(ctx,b,w,h,time){
  const size=clamp(b.size||28,6,140),gap=clamp(b.gap??4,0,80),a=(b.angle||0)*Math.PI/180
  ctx.save();ctx.filter=`hue-rotate(${b.hue||0}deg)`;ctx.fillStyle=b.colorA||'#fff';ctx.fillRect(0,0,w,h)
  const pc=document.createElement('canvas'),tile=Math.max(12,Math.round(size*2+gap*2));pc.width=pc.height=tile;const p=pc.getContext('2d')
  p.clearRect(0,0,tile,tile);p.globalAlpha=clamp((b.opacity??100)/100,0,1)
  const c1=b.colorB||'#d7ceff',c2=b.colorC||'#f8d7e7',kind=b.pattern||'gingham'
  if(kind==='checker'||kind==='gingham'){p.fillStyle=c1;p.fillRect(0,0,tile/2,tile/2);p.fillRect(tile/2,tile/2,tile/2,tile/2);if(kind==='gingham'){p.globalAlpha*=.55;p.fillStyle=c2;p.fillRect(tile/2,0,tile/2,tile/2);p.fillRect(0,tile/2,tile/2,tile/2)}}
  else if(kind==='dots'||kind==='ring-dots'){p.strokeStyle=p.fillStyle=c1;p.lineWidth=Math.max(1,size*.12);for(const [x,y] of [[tile*.25,tile*.25],[tile*.75,tile*.75]]){p.beginPath();p.arc(x,y,size*.28,0,Math.PI*2);kind==='ring-dots'?p.stroke():p.fill()}}
  else if(kind==='stripes'||kind==='diagonal'){p.fillStyle=c1;p.fillRect(0,0,size*.55,tile);p.fillStyle=c2;p.fillRect(size+gap,0,size*.32,tile)}
  else if(kind==='grid'){p.strokeStyle=c1;p.lineWidth=Math.max(1,size*.08);p.strokeRect(.5,.5,tile-1,tile-1)}
  else if(kind==='diamond'){p.fillStyle=c1;p.save();p.translate(tile/2,tile/2);p.rotate(Math.PI/4);p.fillRect(-size*.25,-size*.25,size*.5,size*.5);p.restore()}
  else if(kind==='zigzag'||kind==='wave'){p.strokeStyle=c1;p.lineWidth=Math.max(1,size*.12);p.beginPath();for(let x=-size;x<=tile+size;x+=size/2){const y=tile/2+(kind==='wave'?Math.sin(x/size*Math.PI)*size*.24:((Math.round(x/(size/2))%2)?size*.25:-size*.25));x===-size?p.moveTo(x,y):p.lineTo(x,y)}p.stroke()}
  else if(kind==='heart'||kind==='star'||kind==='flower'||kind==='cloud'||kind==='sparkle'||kind==='cherry')drawCutePattern(p,kind,tile/2,tile/2,size*.42,c1,c2)
  else {p.fillStyle=c1;p.fillRect(0,0,size*.5,size*.5)}
  const pat=ctx.createPattern(pc,'repeat');ctx.translate(w/2,h/2);ctx.rotate(a);ctx.translate(-w/2,-h/2);ctx.globalAlpha=1;ctx.fillStyle=pat;const pad=Math.max(w,h);ctx.fillRect(-pad,-pad,w+pad*2,h+pad*2);ctx.restore()
}

function drawCutePattern(ctx,kind,x,y,r,c1,c2){
  ctx.save();ctx.translate(x,y);ctx.fillStyle=c1;ctx.strokeStyle=c2;ctx.lineWidth=Math.max(1,r*.1)
  if(kind==='heart'){ctx.beginPath();ctx.moveTo(0,r*.55);ctx.bezierCurveTo(-r*1.2,-r*.2,-r*.65,-r,0,-r*.42);ctx.bezierCurveTo(r*.65,-r,r*1.2,-r*.2,0,r*.55);ctx.fill()}
  else if(kind==='star'||kind==='sparkle'){const n=kind==='star'?5:4;ctx.beginPath();for(let i=0;i<n*2;i++){const a=-Math.PI/2+i*Math.PI/n,rr=i%2?r*.36:r,px=Math.cos(a)*rr,py=Math.sin(a)*rr;i?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.closePath();ctx.fill()}
  else if(kind==='flower'||kind==='cherry'){for(let i=0;i<5;i++){const a=i*Math.PI*2/5;ctx.beginPath();ctx.ellipse(Math.cos(a)*r*.42,Math.sin(a)*r*.42,r*.36,r*.23,a,0,Math.PI*2);ctx.fill()}ctx.fillStyle=c2;ctx.beginPath();ctx.arc(0,0,r*.18,0,Math.PI*2);ctx.fill()}
  else if(kind==='cloud'){ctx.beginPath();ctx.arc(-r*.35,0,r*.42,0,Math.PI*2);ctx.arc(0,-r*.18,r*.55,0,Math.PI*2);ctx.arc(r*.42,0,r*.38,0,Math.PI*2);ctx.fillRect(-r*.72,0,r*1.44,r*.35);ctx.fill()}
  ctx.restore()
}

export const GRADIENT_PRESETS=[
  {id:'custom',label:'사용자 지정',colorA:'#cbc3ff',colorB:'#ffd4e6',colorC:'#fff3fa',stopA:0,stopB:52,stopC:100,angle:135},
  {id:'pastel-lavender',label:'파스텔 라벤더',colorA:'#cfc6ff',colorB:'#f1d6ff',colorC:'#fff2fb',stopA:0,stopB:58,stopC:100,angle:135},
  {id:'mint-cream',label:'민트 크림',colorA:'#d8fff3',colorB:'#caf4ff',colorC:'#f3edff',stopA:0,stopB:48,stopC:100,angle:120},
  {id:'cotton-candy',label:'코튼 캔디',colorA:'#ffd6ef',colorB:'#ffdfe0',colorC:'#fff7d8',stopA:0,stopB:55,stopC:100,angle:135},
  {id:'peach-milk',label:'피치 밀크',colorA:'#ffe0d2',colorB:'#ffeecf',colorC:'#fff9f2',stopA:0,stopB:50,stopC:100,angle:150},
  {id:'sky-sherbet',label:'스카이 셔벗',colorA:'#d7e8ff',colorB:'#e6deff',colorC:'#ffe3f0',stopA:0,stopB:56,stopC:100,angle:110},
  {id:'blueberry-yogurt',label:'블루베리 요거트',colorA:'#cbd6ff',colorB:'#e8d8ff',colorC:'#fff3fd',stopA:0,stopB:60,stopC:100,angle:135},
  {id:'sakura-mist',label:'사쿠라 미스트',colorA:'#ffd9e8',colorB:'#ffe9f3',colorC:'#fffefc',stopA:0,stopB:62,stopC:100,angle:160}
]

export const PATTERN_OPTIONS=[
  ['gingham','깅엄 체크'],['checker','체크'],['dots','땡땡이'],['ring-dots','링 도트'],['stripes','세로 줄무늬'],['diagonal','사선 줄무늬'],['grid','그리드'],['diamond','다이아'],['zigzag','지그재그'],['wave','웨이브'],['heart','하트'],['star','별'],['flower','꽃'],['cherry','체리/꽃잎'],['cloud','구름'],['sparkle','스파클']
]
