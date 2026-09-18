export const uid = (prefix='id') => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`
export const clamp = (v,min,max) => Math.max(min, Math.min(max,v))
export const deepClone = value => structuredClone ? structuredClone(value) : JSON.parse(JSON.stringify(value))

export function fileToDataUrl(file){
  return new Promise((resolve,reject)=>{ const r=new FileReader(); r.onload=()=>resolve(r.result); r.onerror=reject; r.readAsDataURL(file) })
}

export function loadImage(src){
  return new Promise((resolve,reject)=>{ const im=new Image(); im.onload=()=>resolve(im); im.onerror=reject; im.crossOrigin='anonymous'; im.src=src })
}

export function downloadBlob(blob,name){ const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1500) }
export function downloadText(text,name,type='application/json'){ downloadBlob(new Blob([text],{type}),name) }
export const bytesText = n => n < 1024 ? `${n} B` : n < 1048576 ? `${(n/1024).toFixed(1)} KB` : `${(n/1048576).toFixed(2)} MB`

export function hexToRgb(hex){
  const h=hex.replace('#',''); const x=h.length===3?h.split('').map(c=>c+c).join(''):h; const n=parseInt(x,16)
  return {r:(n>>16)&255,g:(n>>8)&255,b:n&255}
}
export function rgba(hex,a=1){ const {r,g,b}=hexToRgb(hex); return `rgba(${r},${g},${b},${a})` }

export function fitContain(sw,sh,dw,dh){ const s=Math.min(dw/sw,dh/sh); return {w:sw*s,h:sh*s,x:(dw-sw*s)/2,y:(dh-sh*s)/2,scale:s} }
export function fitCover(sw,sh,dw,dh){ const s=Math.max(dw/sw,dh/sh); return {w:sw*s,h:sh*s,x:(dw-sw*s)/2,y:(dh-sh*s)/2,scale:s} }

export function debounce(fn,ms=250){ let t; return (...args)=>{clearTimeout(t);t=setTimeout(()=>fn(...args),ms)} }
