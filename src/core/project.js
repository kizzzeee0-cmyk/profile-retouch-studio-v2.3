import { downloadText, fileToDataUrl } from './utils.js'

export function saveProjectFile(project){
  const payload={schema:'profile-retouch-studio',version:'2.1.0',savedAt:new Date().toISOString(),project}
  downloadText(JSON.stringify(payload,null,2),`${(project.name||'project').replace(/[^a-zA-Z0-9가-힣_-]/g,'_')}.prsproj`)
}
export async function loadProjectFile(file){ const text=await file.text(); const obj=JSON.parse(text); if(obj.schema!=='profile-retouch-studio'||!obj.project)throw new Error('지원하지 않는 프로젝트 파일입니다.'); return obj.project }

export async function addFontFromFile(file,name){ const data=await fileToDataUrl(file); const family=name||file.name.replace(/\.[^.]+$/,''); const face=new FontFace(family,`url(${data})`); await face.load(); document.fonts.add(face); return {family,data,source:'file'} }
export async function addFontFromUrl(url,name){ const family=name||'Custom WebFont'; const face=new FontFace(family,`url(${url})`); await face.load(); document.fonts.add(face); return {family,url,source:'url'} }
export function injectFontFaceCss(css){ const style=document.createElement('style'); style.dataset.userFont='true'; style.textContent=css; document.head.appendChild(style); return true }
