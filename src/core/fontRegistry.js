import { getAssets, putAsset, deleteAsset } from './storage.js'
import { uid, fileToDataUrl } from './utils.js'

const DEFAULTS=[
  {family:'sans-serif',name:'기본 고딕',builtin:true},
  {family:'serif',name:'기본 명조',builtin:true},
  {family:'monospace',name:'기본 고정폭',builtin:true},
  {family:'Arial',name:'Arial',builtin:true},
  {family:'Georgia',name:'Georgia',builtin:true}
]

class Registry extends EventTarget{
  constructor(){super();this.items=[...DEFAULTS];this.loaded=false}
  list(){return [...this.items]}
  async init(){if(this.loaded)return this.list();const assets=await getAssets('font').catch(()=>[]);for(const a of assets)await this._register(a).catch(console.warn);this.loaded=true;this.dispatchEvent(new Event('change'));return this.list()}
  async _register(asset){
    if(this.items.some(x=>x.id===asset.id))return
    if(asset.source==='css'&&asset.css){const style=document.createElement('style');style.dataset.fontAsset=asset.id;style.textContent=asset.css;document.head.appendChild(style)}
    else if(asset.data||asset.url){const face=new FontFace(asset.family,`url(${asset.data||asset.url})`,asset.descriptors||{});await face.load();document.fonts.add(face)}
    this.items.push(asset)
  }
  async addFile(file,name){const family=(name||file.name.replace(/\.[^.]+$/,'')).trim();const data=await fileToDataUrl(file);const asset={id:uid('font'),kind:'font',name:family,family,data,source:'file',createdAt:Date.now()};await this._register(asset);await putAsset(asset);this.dispatchEvent(new Event('change'));return asset}
  async addUrl(url,name){const family=(name||'Custom WebFont').trim();const asset={id:uid('font'),kind:'font',name:family,family,url,source:'url',createdAt:Date.now()};await this._register(asset);await putAsset(asset);this.dispatchEvent(new Event('change'));return asset}
  async addCss(css){
    const names=[...css.matchAll(/font-family\s*:\s*['\"]?([^;'\"}]+)['\"]?/gi)].map(m=>m[1].trim()).filter(Boolean)
    if(!names.length)throw new Error('@font-face CSS에서 font-family를 찾지 못했습니다.')
    const assets=[];for(const family of [...new Set(names)]){const asset={id:uid('font'),kind:'font',name:family,family,css,source:'css',createdAt:Date.now()};await this._register(asset);await putAsset(asset);assets.push(asset)}this.dispatchEvent(new Event('change'));return assets
  }
  async remove(id){const it=this.items.find(x=>x.id===id);if(!it||it.builtin)return;await deleteAsset(id);this.items=this.items.filter(x=>x.id!==id);document.querySelectorAll(`style[data-font-asset="${id}"]`).forEach(x=>x.remove());this.dispatchEvent(new Event('change'))}
}

export const fontRegistry=new Registry()
export const fontOptions=()=>fontRegistry.list().map(f=>({value:f.family,label:f.name||f.family}))
