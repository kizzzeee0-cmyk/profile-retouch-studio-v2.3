const TAU=Math.PI*2
const hash=n=>{n=Math.imul(n^n>>>16,0x45d9f3b);n=Math.imul(n^n>>>16,0x45d9f3b);return(n^n>>>16)>>>0}
function rand(seed,n=0){return(hash(seed+n)%10000)/10000}
function circle(ctx,x,y,r){ctx.beginPath();ctx.arc(x,y,Math.max(0,r),0,TAU)}
function star(ctx,x,y,r,pts=5,inner=.42){ctx.beginPath();for(let i=0;i<pts*2;i++){const a=-Math.PI/2+i*Math.PI/pts,rr=i%2?r*inner:r,px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr;i?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.closePath()}
function heart(ctx,x,y,r){ctx.beginPath();ctx.moveTo(x,y+r*.42);ctx.bezierCurveTo(x-r*1.1,y-r*.25,x-r*.8,y-r*1.05,x,y-r*.45);ctx.bezierCurveTo(x+r*.8,y-r*1.05,x+r*1.1,y-r*.25,x,y+r*.42);ctx.closePath()}
function diamond(ctx,x,y,r){ctx.beginPath();ctx.moveTo(x,y-r);ctx.lineTo(x+r*.7,y);ctx.lineTo(x,y+r);ctx.lineTo(x-r*.7,y);ctx.closePath()}
function flower(ctx,x,y,r){ctx.beginPath();for(let i=0;i<5;i++){const a=i*TAU/5,px=x+Math.cos(a)*r*.65,py=y+Math.sin(a)*r*.65;ctx.moveTo(x,y);ctx.arc(px,py,r*.42,0,TAU)}ctx.closePath()}
function bow(ctx,x,y,r){ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x-r*1.2,y-r*.7,x-r*1.2,y+r*.7,x,y+r*.08);ctx.bezierCurveTo(x+r*1.2,y+r*.7,x+r*1.2,y-r*.7,x,y);ctx.closePath()}

function drawOne(ctx,type,x,y,size,color,color2,time=0,animated=true,seed=0){
  const alpha=1,phase=rand(seed,9)*TAU
  ctx.save();ctx.translate(x,y);ctx.fillStyle=color;ctx.strokeStyle=color2||color;ctx.globalAlpha=alpha;ctx.shadowColor=color;ctx.shadowBlur=size*.9
  if(animated){ctx.rotate(Math.sin(time*1.2+phase)*.2)}
  if(type==='sparkle'||type==='cross-light'){ctx.lineWidth=Math.max(.8,size*.12);ctx.beginPath();ctx.moveTo(-size,0);ctx.lineTo(size,0);ctx.moveTo(0,-size);ctx.lineTo(0,size);ctx.stroke()}
  else if(type==='star'){star(ctx,0,0,size,5,.42);ctx.fill()}
  else if(type==='heart'){heart(ctx,0,0,size);ctx.fill()}
  else if(type==='diamond'){diamond(ctx,0,0,size);ctx.fill()}
  else if(type==='flower'){flower(ctx,0,0,size);ctx.fill()}
  else if(type==='bow'){bow(ctx,0,0,size);ctx.fill();circle(ctx,0,0,size*.24);ctx.fill()}
  else if(type==='cloud'){ctx.beginPath();ctx.arc(-size*.35,0,size*.42,0,TAU);ctx.arc(0,-size*.18,size*.55,0,TAU);ctx.arc(size*.42,0,size*.38,0,TAU);ctx.fillRect(-size*.72,0,size*1.44,size*.35);ctx.fill()}
  else if(type==='moon'){ctx.beginPath();ctx.arc(0,0,size,0,TAU,false);ctx.arc(size*.38,-size*.08,size*.92,0,TAU,true);ctx.fill('evenodd')}
  else if(type==='bubble'){ctx.globalAlpha=.65;ctx.lineWidth=Math.max(.8,size*.13);circle(ctx,0,0,size);ctx.stroke();ctx.globalAlpha=.85;circle(ctx,-size*.28,-size*.28,size*.18);ctx.fill()}
  else if(type==='dot'){circle(ctx,0,0,size*.55);ctx.fill()}
  else {star(ctx,0,0,size,4,.2);ctx.fill()}
  ctx.restore()
}

export function drawBuiltInSticker(ctx,sticker,s,time=0){
  const tr=sticker.transform||{}
  const x=(s/2)+(tr.x||0)*s/180
  const y=(s/2)+(tr.y||0)*s/180
  const scale=(tr.scale??1)
  const size=(sticker.size||18)*(s/180)*scale
  ctx.save()
  ctx.globalAlpha=sticker.opacity??1
  ctx.globalCompositeOperation=sticker.blend||'source-over'
  ctx.translate(x,y)
  ctx.rotate((tr.rotation||0)*Math.PI/180)
  drawOne(ctx,sticker.stickerType||sticker.type||'star',0,0,size,sticker.color||'#ffffff',sticker.color2||'#ffd8f0',time,sticker.animated!==false,sticker.seed||0)
  ctx.restore()
}

export function drawDecorationLayer(ctx,layer,s,time=0){
  const tr=layer.transform||{}
  const localS=(layer.areaSize||180)*(tr.scale??1)
  const x=(s/2)+(tr.x||0)*s/180
  const y=(s/2)+(tr.y||0)*s/180
  ctx.save()
  ctx.globalAlpha=layer.opacity??1
  ctx.globalCompositeOperation=layer.blend||'source-over'
  ctx.translate(x,y)
  ctx.rotate((tr.rotation||0)*Math.PI/180)
  ctx.translate(-localS/2,-localS/2)
  drawDecoration(ctx,{type:layer.decorType||layer.type||'sparkles',amount:layer.amount||12,color:layer.color||'#ffffff',color2:layer.color2||'#ffd8f0',speed:layer.speed||1,static:layer.static===true,seed:layer.seed||0},localS,time)
  ctx.restore()
}

export function drawDecoration(ctx,decor,s,time){
  const d=decor||{},type=d.type||'none';if(type==='none')return
  const n=Math.min(80,Math.max(1,d.amount||18)),color=d.color||'#ffffff',color2=d.color2||'#d4c6ff',speed=d.speed||1,t=(d.static?0:time)*speed,baseSeed=d.seed||0
  ctx.save()
  for(let i=0;i<n;i++){
    const sx=rand(baseSeed+i*117+31),sy=rand(baseSeed+i*271+77),phase=rand(baseSeed+i*991+9)*TAU
    let x=sx*s,y=sy*s,size=(1.4+rand(baseSeed+i*37)*3.4)*s/180,alpha=.25+.65*((Math.sin(t*1.8+phase)+1)/2)
    const fall=(v=12)=>{y=(sy*s+t*v+i*3)%s}
    const drift=(v=5)=>{x=(x+Math.sin(t*.8+phase)*v)%s}
    ctx.save();ctx.fillStyle=i%3===0?color2:color;ctx.strokeStyle=ctx.fillStyle;ctx.globalAlpha=alpha;ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=size*1.5
    if(type==='sparkles'){star(ctx,x,y,size*1.7,4,.18);ctx.fill()}
    else if(type==='tiny-stars'){star(ctx,x,y,size*1.4,5,.42);ctx.fill()}
    else if(type==='hearts'){fall(9);drift(7);heart(ctx,x,y,size*1.6);ctx.fill()}
    else if(type==='falling-hearts'){fall(20);drift(10);heart(ctx,x,y,size*1.8);ctx.fill()}
    else if(type==='bubbles'){fall(-7);ctx.globalAlpha*=.55;ctx.lineWidth=Math.max(.5,size*.2);circle(ctx,x,y,size*1.8);ctx.stroke();ctx.fillStyle='rgba(255,255,255,.4)';circle(ctx,x-size*.45,y-size*.45,size*.25);ctx.fill()}
    else if(type==='petals'||type==='sakura'){fall(type==='sakura'?11:8);drift(10);ctx.translate(x,y);ctx.rotate(t+phase);ctx.beginPath();ctx.ellipse(0,0,size*1.8,size*.75,0,0,TAU);ctx.fill();if(type==='sakura'){ctx.globalAlpha*=.45;ctx.fillStyle='#fff';circle(ctx,0,0,size*.25);ctx.fill()}}
    else if(type==='snow'){fall(7);star(ctx,x,y,size*1.5,6,.2);ctx.stroke()}
    else if(type==='dust-light'){drift(4);ctx.globalAlpha*=.5;circle(ctx,x,y,size*.7);ctx.fill()}
    else if(type==='fireflies'){x+=Math.sin(t*1.4+phase)*s*.04;y+=Math.cos(t*1.1+phase)*s*.035;ctx.shadowBlur=size*4;circle(ctx,x,y,size*.72);ctx.fill()}
    else if(type==='diamonds'){diamond(ctx,x,y,size*1.45);ctx.fill()}
    else if(type==='moons'){ctx.beginPath();ctx.arc(x,y,size*1.4,0,TAU,false);ctx.arc(x+size*.65,y-size*.15,size*1.25,0,TAU,true);ctx.fill('evenodd')}
    else if(type==='clouds'){drift(5);ctx.globalAlpha*=.5;ctx.beginPath();ctx.arc(x-size*.7,y,size*.75,0,TAU);ctx.arc(x,y-size*.25,size,0,TAU);ctx.arc(x+size*.8,y,size*.68,0,TAU);ctx.fill()}
    else if(type==='bows'){bow(ctx,x,y,size*1.3);ctx.fill();circle(ctx,x,y,size*.28);ctx.fill()}
    else if(type==='confetti'){fall(22);ctx.translate(x,y);ctx.rotate(t*2+phase);ctx.fillRect(-size*.55,-size*1.2,size*1.1,size*2.4)}
    else if(type==='rainbow-dust'){drift(6);ctx.fillStyle=`hsl(${(sx*360+t*45)%360} 85% 75%)`;ctx.shadowColor=ctx.fillStyle;star(ctx,x,y,size*1.2,4,.2);ctx.fill()}
    else if(type==='lens-specks'){ctx.globalAlpha*=.25;ctx.shadowBlur=size*5;circle(ctx,x,y,size*2.6);ctx.fill()}
    else if(type==='cross-light'){ctx.lineWidth=Math.max(.6,size*.23);ctx.beginPath();ctx.moveTo(x-size*2,y);ctx.lineTo(x+size*2,y);ctx.moveTo(x,y-size*2);ctx.lineTo(x,y+size*2);ctx.stroke()}
    else if(type==='soft-orbs'){drift(4);ctx.globalAlpha*=.22;ctx.shadowBlur=size*5;circle(ctx,x,y,size*3.3);ctx.fill()}
    else if(type==='star-trail'){fall(-4);const ang=t*.35+phase;for(let k=0;k<4;k++){ctx.globalAlpha=alpha*(1-k*.22);star(ctx,x-Math.cos(ang)*k*size*1.7,y-Math.sin(ang)*k*size*1.7,size*(1-k*.16),4,.2);ctx.fill()}}
    else if(type==='flower-dust'){fall(7);flower(ctx,x,y,size*1.15);ctx.fill()}
    else if(type==='pixel-spark'){fall(5);ctx.shadowBlur=0;ctx.fillRect(Math.round(x),Math.round(y),Math.max(1,size),Math.max(1,size))}
    else if(type==='prism-dust'){ctx.translate(x,y);ctx.rotate(t*.5+phase);ctx.fillStyle=`hsla(${(phase*57+t*40)%360},90%,75%,.75)`;diamond(ctx,0,0,size*1.5);ctx.fill()}
    ctx.restore()
  }
  ctx.restore()
}
