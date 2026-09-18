import { html, toast, filePicker } from './helpers.js'
import { createPhotoEditor } from './photoEditor.js'
import { createGifEditor } from './gifEditor.js'
import { getRecentProjects, getProject } from '../core/storage.js'

export class App {
  constructor(root){this.root=root;this.editor=null;this.renderHome()}
  destroyEditor(){this.editor?.destroy?.();this.editor=null}
  async renderHome(){this.destroyEditor();this.root.innerHTML='';const page=html('div',{class:'home'}),hero=html('div',{class:'hero'});hero.innerHTML=`<div class="brand-mark">PR</div><h1>Profile Retouch Studio <span>2.1</span></h1><p>Natural Rim Light · 안정화된 모션 미리보기 · 패턴 배경 · 고정 크기 용량 최적화</p>`;page.append(hero)
    const cards=html('div',{class:'mode-cards'});const photo=html('button',{class:'mode-card photo'});photo.innerHTML='<b>📷 사진 보정하기</b><span>스마트 프리셋 · 정밀 외곽선 · 얇은 역광 Rim · 배경/패턴 · 50KB PNG 최적화</span>';photo.onclick=()=>this.openPhoto();const gif=html('button',{class:'mode-card gif'});gif.innerHTML='<b>✨ 프로필 움짤 만들기</b><span>안정화된 Canvas · 씬 전환 · 배경 생성 · 움직이는 테두리 · 외부 오버레이 · 2MB 고정크기 GIF</span>';gif.onclick=()=>this.openGif();cards.append(photo,gif);page.append(cards)
    const recentWrap=html('section',{class:'recent'});recentWrap.innerHTML='<div class="section-title"><h2>최근 프로젝트</h2><span>브라우저 IndexedDB 자동 저장</span></div>';const list=html('div',{class:'recent-list'});recentWrap.append(list);page.append(recentWrap);this.root.append(page)
    try{const recents=await getRecentProjects();if(!recents.length)list.innerHTML='<div class="empty-card">아직 저장된 프로젝트가 없습니다.</div>';for(const item of recents){const b=html('button',{class:'recent-card'});b.innerHTML=`<b>${item.data?.name||item.id}</b><span>${item.data?.mode==='gif'?'✨ GIF':'📷 PHOTO'} · ${new Date(item.updatedAt).toLocaleString()}</span>`;b.onclick=async()=>{const p=await getProject(item.id);p?.mode==='gif'?this.openGif(p,item.id):this.openPhoto(p,item.id)};list.append(b)}}catch(e){console.warn(e)}
  }
  openPhoto(project=null,id='autosave-photo'){this.destroyEditor();this.root.innerHTML='';this.editor=createPhotoEditor(this.root,{project,id,onHome:()=>this.renderHome()})}
  openGif(project=null,id='autosave-gif'){this.destroyEditor();this.root.innerHTML='';this.editor=createGifEditor(this.root,{project,id,onHome:()=>this.renderHome()})}
}
