import { hexToRgb } from './utils.js'

const TAU=Math.PI*2
const hash=n=>{n=Math.imul(n^n>>>16,0x45d9f3b);n=Math.imul(n^n>>>16,0x45d9f3b);return(n^n>>>16)>>>0}
const rgba=(hex,a)=>{const{r,g,b}=hexToRgb(hex);return`rgba(${r},${g},${b},${a})`}
function circle(ctx,x,y,r){ctx.beginPath();ctx.arc(x,y,Math.max(0,r),0,TAU)}
function star(ctx,x,y,r,pts=5,inner=.45){ctx.beginPath();for(let i=0;i<pts*2;i++){const a=-Math.PI/2+i*Math.PI/pts,rr=i%2?r*inner:r,px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr;i?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.closePath()}
function heart(ctx,x,y,r){ctx.beginPath();ctx.moveTo(x,y+r*.45);ctx.bezierCurveTo(x-r*1.2,y-r*.25,x-r*.8,y-r*1.15,x,y-r*.5);ctx.bezierCurveTo(x+r*.8,y-r*1.15,x+r*1.2,y-r*.25,x,y+r*.45);ctx.closePath()}
function flower(ctx,x,y,r,petals=5){ctx.beginPath();for(let i=0;i<petals;i++){const a=i*TAU/petals,px=x+Math.cos(a)*r*.72,py=y+Math.sin(a)*r*.72;ctx.moveTo(x,y);ctx.arc(px,py,r*.47,0,TAU)}ctx.closePath()}
function diamond(ctx,x,y,r){ctx.beginPath();ctx.moveTo(x,y-r);ctx.lineTo(x+r*.72,y);ctx.lineTo(x,y+r);ctx.lineTo(x-r*.72,y);ctx.closePath()}
function bow(ctx,x,y,r){ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x-r*1.1,y-r*.75,x-r*1.2,y+r*.75,x,y+r*.15);ctx.bezierCurveTo(x+r*1.2,y+r*.75,x+r*1.1,y-r*.75,x,y);ctx.closePath();ctx.moveTo(x,y+r*.1);ctx.lineTo(x-r*.45,y+r*1.2);ctx.lineTo(x,y+r*.72);ctx.lineTo(x+r*.45,y+r*1.2);ctx.closePath()}
function crescent(ctx,x,y,r){ctx.beginPath();ctx.arc(x,y,r,0,TAU,false);ctx.arc(x+r*.45,y-r*.1,r*.9,0,TAU,true);ctx.fill('evenodd')}

export function drawBorder(ctx,border,s,time){
  const b=border||{},type=b.type||'none';if(type==='none')return
  const w=Math.max(1,b.width||6),cx=s/2,cy=s/2,scale=(b.size??100)/100,offset=b.offset??0,baseR=s/2-w*1.6,r=Math.max(8,baseR*scale+offset*(s/180)),t=time*(b.speed||1),a=b.colorA||'#ffffff',bb=b.colorB||'#9b8cff'
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round'
  switch(type){
    case 'clean-white': return strokeRing(ctx,cx,cy,r,w,a)
    case 'double-glass':{
      ctx.strokeStyle=rgba(a,.86);ctx.lineWidth=w*.68;circle(ctx,cx,cy,r);ctx.stroke();ctx.strokeStyle=rgba(bb,.35);ctx.lineWidth=w*.28;circle(ctx,cx,cy,r-w*1.15);ctx.stroke();ctx.shadowColor=a;ctx.shadowBlur=w*1.8;ctx.globalAlpha=.55;circle(ctx,cx,cy,r+w*.7);ctx.stroke();break}
    case 'shimmer-orbit':{
      ctx.strokeStyle=rgba(a,.42);ctx.lineWidth=w;circle(ctx,cx,cy,r);ctx.stroke();const len=.42,ang=t*1.8;const g=ctx.createConicGradient(ang,cx,cy);g.addColorStop(0,'transparent');g.addColorStop(.08,a);g.addColorStop(.14,'#fff');g.addColorStop(.22,bb);g.addColorStop(len,'transparent');g.addColorStop(1,'transparent');ctx.strokeStyle=g;ctx.lineWidth=w*1.45;ctx.shadowColor=a;ctx.shadowBlur=w*2.2;circle(ctx,cx,cy,r);ctx.stroke();break}
    case 'sparkle-cluster':{
      strokeRing(ctx,cx,cy,r,w*.42,rgba(a,.38));for(let i=0;i<22;i++){const ang=i/22*TAU+t*.16,burst=(i%6===0),rr=r+(Math.sin(t*2+i)*w*.3),x=cx+Math.cos(ang)*rr,y=cy+Math.sin(ang)*rr;ctx.fillStyle=i%2?a:bb;ctx.globalAlpha=.45+.5*((Math.sin(t*4+i*1.7)+1)/2);ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=w*1.8;if(burst)star(ctx,x,y,w*1.15,4,.18);else circle(ctx,x,y,w*.32);ctx.fill()}break}
    case 'aurora-flow': return gradientRing(ctx,cx,cy,r,w,t,[a,'#79ffe1',bb,'#ffb5de','#8fd4ff',a],1)
    case 'prism-spin': return gradientRing(ctx,cx,cy,r,w,t,[a,'#ff82bd','#ffe775','#82ffd1','#73b7ff','#c28bff',a],1.8)
    case 'hologram':{
      gradientRing(ctx,cx,cy,r,w*.82,t,[rgba(a,.9),'#ff9ee2','#8ff8ff','#d2a4ff','#fff7a5',rgba(a,.9)],1.3);ctx.setLineDash([w*.8,w*.45]);ctx.lineDashOffset=-t*16;ctx.strokeStyle=rgba('#ffffff',.55);ctx.lineWidth=w*.25;circle(ctx,cx,cy,r-w*.8);ctx.stroke();break}
    case 'heart-orbit': return orbitSymbols(ctx,cx,cy,r,w,t,a,bb,10,'heart')
    case 'star-orbit': return orbitSymbols(ctx,cx,cy,r,w,t,a,bb,12,'star')
    case 'moon-orbit': return orbitSymbols(ctx,cx,cy,r,w,t,a,bb,8,'moon')
    case 'music': return orbitSymbols(ctx,cx,cy,r,w,t,a,bb,12,'music')
    case 'pearl': return beadRing(ctx,cx,cy,r,w,t,a,bb,28,'pearl')
    case 'flower': return beadRing(ctx,cx,cy,r,w,t,a,bb,18,'flower')
    case 'sakura': return beadRing(ctx,cx,cy,r,w,t,a,bb,20,'sakura')
    case 'bubble': return beadRing(ctx,cx,cy,r,w,t,a,bb,24,'bubble')
    case 'snowflake': return beadRing(ctx,cx,cy,r,w,t,a,bb,18,'snow')
    case 'diamond': return beadRing(ctx,cx,cy,r,w,t,a,bb,24,'diamond')
    case 'candy': return beadRing(ctx,cx,cy,r,w,t,a,bb,30,'candy')
    case 'lace': return laceRing(ctx,cx,cy,r,w,t,a,bb)
    case 'ribbon-wave': return ribbonRing(ctx,cx,cy,r,w,t,a,bb)
    case 'neon-pulse':{
      const pulse=.68+.25*Math.sin(t*4);ctx.strokeStyle=a;ctx.lineWidth=w*.7;ctx.shadowColor=bb;ctx.shadowBlur=w*(2.4+1.5*pulse);ctx.globalAlpha=pulse;circle(ctx,cx,cy,r);ctx.stroke();ctx.strokeStyle=bb;ctx.lineWidth=w*.2;ctx.globalAlpha=.8;circle(ctx,cx,cy,r);ctx.stroke();break}
    case 'electric': return electricRing(ctx,cx,cy,r,w,t,a,bb)
    case 'comet': return cometRing(ctx,cx,cy,r,w,t,a,bb)
    case 'twinkle': return twinkleRing(ctx,cx,cy,r,w,t,a,bb)
    case 'cloud': return cloudRing(ctx,cx,cy,r,w,t,a,bb)
    case 'cat-ear': return catEarRing(ctx,cx,cy,r,w,t,a,bb)
    case 'crown': return crownRing(ctx,cx,cy,r,w,t,a,bb)
    case 'lavender': return gradientRing(ctx,cx,cy,r,w,t,[a,'#e5ddff','#a69cff','#d9baff',bb,a],.8)
    case 'sunset': return gradientRing(ctx,cx,cy,r,w,t,[a,'#fff1bb','#ffb27e','#ff8db8','#b49dff',a],.75)
    case 'mint-dream': return gradientRing(ctx,cx,cy,r,w,t,[a,'#d9fff4','#87f7d6','#9ccfff','#e8d8ff',a],.7)
    case 'pixel-dash':{
      ctx.setLineDash([w*1.2,w*.75]);ctx.lineDashOffset=-t*18;ctx.strokeStyle=a;ctx.lineWidth=w*.8;circle(ctx,cx,cy,r);ctx.stroke();ctx.setLineDash([w*.35,w*1.7]);ctx.lineDashOffset=t*12;ctx.strokeStyle=bb;ctx.lineWidth=w*.38;circle(ctx,cx,cy,r-w*.9);ctx.stroke();break}
    default: strokeRing(ctx,cx,cy,r,w,a)
  }
  ctx.restore()
}

function strokeRing(ctx,cx,cy,r,w,color){ctx.strokeStyle=color;ctx.lineWidth=w;circle(ctx,cx,cy,r);ctx.stroke();ctx.restore?.()}
function gradientRing(ctx,cx,cy,r,w,t,colors,speed=1){const g=ctx.createConicGradient(t*speed,cx,cy);colors.forEach((c,i)=>g.addColorStop(i/(colors.length-1),c));ctx.strokeStyle=g;ctx.lineWidth=w;ctx.shadowColor=colors[1]||colors[0];ctx.shadowBlur=w*1.1;circle(ctx,cx,cy,r);ctx.stroke();ctx.restore?.()}
function orbitSymbols(ctx,cx,cy,r,w,t,a,b,count,kind){ctx.strokeStyle=rgba(a,.25);ctx.lineWidth=w*.28;circle(ctx,cx,cy,r);ctx.stroke();for(let i=0;i<count;i++){const ang=i/count*TAU+t*(i%2?-.55:.75),rr=r+(i%3-1)*w*.3,x=cx+Math.cos(ang)*rr,y=cy+Math.sin(ang)*rr,size=w*(.55+(i%3)*.12);ctx.save();ctx.translate(x,y);ctx.rotate(ang+Math.PI/2);ctx.fillStyle=i%2?a:b;ctx.globalAlpha=.65+.25*Math.sin(t*3+i);ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=w;if(kind==='heart'){heart(ctx,0,0,size);ctx.fill()}else if(kind==='star'){star(ctx,0,0,size,5,.42);ctx.fill()}else if(kind==='moon'){crescent(ctx,0,0,size*.7)}else{ctx.font=`${size*1.8}px sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(i%2?'♪':'♫',0,0)}ctx.restore()}ctx.restore?.()}
function beadRing(ctx,cx,cy,r,w,t,a,b,count,kind){for(let i=0;i<count;i++){const ang=i/count*TAU+t*.08,rr=r+Math.sin(t*2+i)*w*.12,x=cx+Math.cos(ang)*rr,y=cy+Math.sin(ang)*rr,size=w*(.38+.12*(i%3));ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.fillStyle=i%2?a:b;ctx.strokeStyle=rgba('#ffffff',.6);ctx.lineWidth=Math.max(.6,w*.1);ctx.globalAlpha=.72+.2*Math.sin(t*2+i);ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=w*.6;if(kind==='pearl'){circle(ctx,0,0,size);ctx.fill();ctx.stroke();ctx.fillStyle='rgba(255,255,255,.65)';circle(ctx,-size*.22,-size*.22,size*.22);ctx.fill()}else if(kind==='flower'||kind==='sakura'){flower(ctx,0,0,size,kind==='sakura'?5:6);ctx.fill()}else if(kind==='bubble'){ctx.globalAlpha=.35;circle(ctx,0,0,size*1.2);ctx.stroke();ctx.fillStyle='rgba(255,255,255,.35)';circle(ctx,-size*.3,-size*.3,size*.16);ctx.fill()}else if(kind==='snow'){star(ctx,0,0,size*1.1,6,.25);ctx.stroke()}else if(kind==='diamond'){diamond(ctx,0,0,size);ctx.fill()}else{circle(ctx,0,0,size);ctx.fill()}ctx.restore()}ctx.restore?.()}
function laceRing(ctx,cx,cy,r,w,t,a,b){ctx.strokeStyle=rgba(a,.8);ctx.lineWidth=w*.28;circle(ctx,cx,cy,r-w*.3);ctx.stroke();const n=30;for(let i=0;i<n;i++){const ang=i/n*TAU,rr=r,x=cx+Math.cos(ang)*rr,y=cy+Math.sin(ang)*rr;ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.strokeStyle=i%2?a:b;ctx.lineWidth=w*.18;ctx.beginPath();ctx.arc(0,w*.28,w*.65,Math.PI,0);ctx.stroke();ctx.beginPath();ctx.arc(0,w*.7,w*.28,0,TAU);ctx.stroke();ctx.restore()}ctx.restore?.()}
function ribbonRing(ctx,cx,cy,r,w,t,a,b){ctx.strokeStyle=rgba(a,.28);ctx.lineWidth=w*.25;circle(ctx,cx,cy,r);ctx.stroke();ctx.beginPath();for(let i=0;i<=160;i++){const ang=i/160*TAU,rr=r+Math.sin(ang*6-t*2.2)*w*.75,x=cx+Math.cos(ang)*rr,y=cy+Math.sin(ang)*rr;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.strokeStyle=b;ctx.lineWidth=w*.55;ctx.shadowColor=b;ctx.shadowBlur=w;ctx.stroke();ctx.restore?.()}
function electricRing(ctx,cx,cy,r,w,t,a,b){for(let pass=0;pass<2;pass++){ctx.beginPath();const n=120;for(let i=0;i<=n;i++){const ang=i/n*TAU,noise=((hash(i+Math.floor(t*18)+pass*999)%1000)/1000-.5)*w*(pass?1.2:.7),rr=r+noise,x=cx+Math.cos(ang)*rr,y=cy+Math.sin(ang)*rr;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.strokeStyle=pass?a:b;ctx.lineWidth=pass?w*.22:w*.45;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=w*1.8;ctx.globalAlpha=pass?.55:.9;ctx.stroke()}ctx.restore?.()}
function cometRing(ctx,cx,cy,r,w,t,a,b){ctx.strokeStyle=rgba(a,.22);ctx.lineWidth=w*.3;circle(ctx,cx,cy,r);ctx.stroke();const head=t*1.7;for(let i=0;i<18;i++){const ang=head-i*.035,alpha=(1-i/18),x=cx+Math.cos(ang)*r,y=cy+Math.sin(ang)*r;ctx.fillStyle=i<3?'#fff':b;ctx.globalAlpha=alpha*.9;ctx.shadowColor=b;ctx.shadowBlur=w*2*alpha;circle(ctx,x,y,w*(.5*alpha+.1));ctx.fill()}ctx.restore?.()}
function twinkleRing(ctx,cx,cy,r,w,t,a,b){for(let i=0;i<18;i++){const ang=i/18*TAU,tw=Math.max(0,Math.sin(t*4+i*1.91)),rr=r+(i%2?-.3:.3)*w,x=cx+Math.cos(ang)*rr,y=cy+Math.sin(ang)*rr;ctx.fillStyle=i%2?a:b;ctx.globalAlpha=.15+.85*tw;ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=w*tw*2;star(ctx,x,y,w*(.25+.55*tw),4,.18);ctx.fill()}ctx.restore?.()}
function cloudRing(ctx,cx,cy,r,w,t,a,b){for(let i=0;i<16;i++){const ang=i/16*TAU+t*.025,rr=r,x=cx+Math.cos(ang)*rr,y=cy+Math.sin(ang)*rr;ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.fillStyle=i%2?rgba(a,.78):rgba(b,.65);ctx.beginPath();ctx.arc(-w*.45,0,w*.45,0,TAU);ctx.arc(0,-w*.18,w*.58,0,TAU);ctx.arc(w*.5,0,w*.42,0,TAU);ctx.fill();ctx.restore()}ctx.restore?.()}
function catEarRing(ctx,cx,cy,r,w,t,a,b){ctx.strokeStyle=a;ctx.lineWidth=w*.65;ctx.shadowColor=b;ctx.shadowBlur=w;ctx.beginPath();const left=-Math.PI*.72,right=-Math.PI*.28;ctx.arc(cx,cy,r,right,left+TAU);const lx=cx+Math.cos(left)*r,ly=cy+Math.sin(left)*r,rx=cx+Math.cos(right)*r,ry=cy+Math.sin(right)*r;ctx.lineTo(cx-r*.42,cy-r*1.02);ctx.lineTo(cx-r*.12,cy-r*.86);ctx.arc(cx,cy,r,left,right);ctx.lineTo(cx+r*.42,cy-r*1.02);ctx.lineTo(rx,ry);ctx.stroke();ctx.restore?.()}
function crownRing(ctx,cx,cy,r,w,t,a,b){strokeRingNoRestore(ctx,cx,cy,r,w*.5,rgba(a,.55));ctx.save();ctx.translate(cx,cy-r-w*.2);ctx.fillStyle=b;ctx.strokeStyle=a;ctx.lineWidth=w*.18;ctx.shadowColor=b;ctx.shadowBlur=w;ctx.beginPath();ctx.moveTo(-w*2.4,w*.5);ctx.lineTo(-w*1.7,-w*1.25);ctx.lineTo(-w*.65,w*.05);ctx.lineTo(0,-w*1.65);ctx.lineTo(w*.65,w*.05);ctx.lineTo(w*1.7,-w*1.25);ctx.lineTo(w*2.4,w*.5);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();ctx.restore?.()}
function strokeRingNoRestore(ctx,cx,cy,r,w,color){ctx.strokeStyle=color;ctx.lineWidth=w;circle(ctx,cx,cy,r);ctx.stroke()}
