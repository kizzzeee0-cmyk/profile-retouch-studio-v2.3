import { clamp, loadImage } from './utils.js'

const diff=(d,i,r,g,b)=>Math.sqrt((d[i]-r)**2+(d[i+1]-g)**2+(d[i+2]-b)**2)

export function magicWand(imageData,x,y,tolerance=38,contiguous=true){
  const {width:w,height:h,data:d}=imageData, mask=new Uint8ClampedArray(w*h); x=clamp(Math.round(x),0,w-1); y=clamp(Math.round(y),0,h-1)
  const si=(y*w+x)*4, sr=d[si],sg=d[si+1],sb=d[si+2],limit=tolerance*4.42
  if(!contiguous){for(let p=0;p<w*h;p++){const i=p*4;if(diff(d,i,sr,sg,sb)<=limit)mask[p]=255}return mask}
  const seen=new Uint8Array(w*h), stack=[y*w+x]
  while(stack.length){const p=stack.pop();if(seen[p])continue;seen[p]=1;const i=p*4;if(diff(d,i,sr,sg,sb)>limit)continue;mask[p]=255;const px=p%w,py=(p/w)|0;if(px>0)stack.push(p-1);if(px<w-1)stack.push(p+1);if(py>0)stack.push(p-w);if(py<h-1)stack.push(p+w)}
  return mask
}

export function autoSubject(imageData,tolerance=38){
  const {width:w,height:h,data:d}=imageData, bg=new Uint8ClampedArray(w*h), seen=new Uint8Array(w*h), stack=[]
  const samples=[], stride=Math.max(1,Math.floor(Math.min(w,h)/80))
  for(let x=0;x<w;x+=stride){samples.push([d[x*4],d[x*4+1],d[x*4+2]]);const p=(h-1)*w+x,i=p*4;samples.push([d[i],d[i+1],d[i+2]])}
  for(let y=0;y<h;y+=stride){let p=y*w,i=p*4;samples.push([d[i],d[i+1],d[i+2]]);p=y*w+w-1;i=p*4;samples.push([d[i],d[i+1],d[i+2]])}
  // Tiny k-means over edge colors makes the automatic selector work better on real backgrounds than one averaged corner color.
  const k=Math.min(4,samples.length), centers=[];for(let j=0;j<k;j++)centers.push([...samples[Math.floor(j*samples.length/k)]])
  for(let it=0;it<5;it++){const sums=Array.from({length:k},()=>[0,0,0,0]);for(const s of samples){let bi=0,bd=1e9;for(let j=0;j<k;j++){const c=centers[j],dd=(s[0]-c[0])**2+(s[1]-c[1])**2+(s[2]-c[2])**2;if(dd<bd){bd=dd;bi=j}}const z=sums[bi];z[0]+=s[0];z[1]+=s[1];z[2]+=s[2];z[3]++}for(let j=0;j<k;j++){const z=sums[j];if(z[3])centers[j]=[z[0]/z[3],z[1]/z[3],z[2]/z[3]]}}
  for(let x=0;x<w;x++){stack.push(x,(h-1)*w+x)}for(let y=0;y<h;y++){stack.push(y*w,y*w+w-1)}
  const limit=tolerance*4.0, nearEdgeColor=i=>{for(const c of centers)if(diff(d,i,c[0],c[1],c[2])<=limit)return true;return false}
  while(stack.length){const p=stack.pop();if(seen[p])continue;seen[p]=1;const i=p*4;if(!nearEdgeColor(i))continue;bg[p]=255;const x=p%w,y=(p/w)|0;if(x>0)stack.push(p-1);if(x<w-1)stack.push(p+1);if(y>0)stack.push(p-w);if(y<h-1)stack.push(p+w)}
  const subject=new Uint8ClampedArray(w*h);for(let i=0;i<subject.length;i++)subject[i]=255-bg[i]
  const cx=w/2,cy=h/2,max=Math.hypot(cx,cy);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const p=y*w+x;if(subject[p]&&Math.hypot(x-cx,y-cy)/max>.985)subject[p]=0}
  return subject
}

export function alphaSubject(imageData){ const out=new Uint8ClampedArray(imageData.width*imageData.height);for(let p=0;p<out.length;p++)out[p]=imageData.data[p*4+3];return out }

export function invertMask(mask){const out=new Uint8ClampedArray(mask.length);for(let i=0;i<mask.length;i++)out[i]=255-mask[i];return out}

export function dilateMask(mask,w,h,r=2){
  r=Math.max(0,Math.round(r));if(!r)return new Uint8ClampedArray(mask);let cur=new Uint8ClampedArray(mask)
  for(let pass=0;pass<Math.min(10,r);pass++){const out=new Uint8ClampedArray(cur);for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const p=y*w+x;if(cur[p])continue;out[p]=Math.max(cur[p-1],cur[p+1],cur[p-w],cur[p+w])}cur=out}return cur
}
export function erodeMask(mask,w,h,r=2){const inv=invertMask(mask);return invertMask(dilateMask(inv,w,h,r))}

export function maskToCanvas(mask,w,h,feather=0){const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');const im=ctx.createImageData(w,h);for(let p=0;p<mask.length;p++){const i=p*4;im.data[i]=im.data[i+1]=im.data[i+2]=255;im.data[i+3]=mask[p]}ctx.putImageData(im,0,0);if(feather>0){const b=document.createElement('canvas');b.width=w;b.height=h;const bx=b.getContext('2d');bx.filter=`blur(${feather}px)`;bx.drawImage(c,0,0);return b}return c}

export async function maskFromDataUrl(url,w,h){const im=await loadImage(url);const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(im,0,0,w,h);const data=ctx.getImageData(0,0,w,h).data,out=new Uint8ClampedArray(w*h);for(let p=0;p<out.length;p++)out[p]=data[p*4+3]||data[p*4];return out}
export function canvasToDataUrl(c){return c.toDataURL('image/png')}

export function refineSubjectMask(mask,imageData,{edgeThreshold=28,cleanPasses=1}={}){
  const w=imageData.width,h=imageData.height,d=imageData.data,gray=new Float32Array(w*h),edge=new Float32Array(w*h)
  for(let p=0;p<w*h;p++){const i=p*4;gray[p]=d[i]*.299+d[i+1]*.587+d[i+2]*.114}
  for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
    const p=y*w+x,gx=-gray[p-w-1]-2*gray[p-1]-gray[p+w-1]+gray[p-w+1]+2*gray[p+1]+gray[p+w+1],gy=-gray[p-w-1]-2*gray[p-w]-gray[p-w+1]+gray[p+w-1]+2*gray[p+w]+gray[p+w+1]
    edge[p]=Math.min(255,Math.hypot(gx,gy)/4)
  }
  let cur=new Uint8ClampedArray(mask)
  for(let pass=0;pass<cleanPasses;pass++){
    const out=new Uint8ClampedArray(cur)
    for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
      const p=y*w+x,vals=[cur[p-w-1],cur[p-w],cur[p-w+1],cur[p-1],cur[p],cur[p+1],cur[p+w-1],cur[p+w],cur[p+w+1]].sort((a,b)=>a-b),median=vals[4]
      // Keep fine hair/detail where the photograph itself has a real edge; clean noisy soft regions elsewhere.
      if(edge[p]>=edgeThreshold)out[p]=Math.round(cur[p]*.72+median*.28)
      else {const sharpen=Math.max(0,Math.min(255,(cur[p]-72)*2.25));out[p]=Math.round(sharpen*.72+median*.28)}
    }
    cur=out
  }
  return cur
}
