import GLTransitions from 'gl-transitions'
import createTransition from 'gl-transition'

const transitions = Array.isArray(GLTransitions) ? GLTransitions : (GLTransitions?.default || [])
// Keep only licenses that are suitable for redistribution in this app.
// CC BY entries remain visible with author/license attribution in the effect card.
const SAFE_LICENSE = /MIT|BSD|Apache|ISC|CC0|Public Domain|CC[- ]?BY(?![- ]?SA)/i
const catalog = transitions.filter(t => SAFE_LICENSE.test(String(t.license||'')) && !Object.values(t.paramsTypes||{}).includes('sampler2D'))
const surfaceCache = new WeakMap()

const WORDS = [
  [/crosszoom/ig,'크로스 줌'],[/crosswarp/ig,'크로스 워프'],[/crosshatch/ig,'크로스 해치'],[/cross/ig,'크로스'],[/fade/ig,'페이드'],
  [/wipe/ig,'와이프'],[/circle/ig,'원형'],[/heart/ig,'하트'],[/star/ig,'별'],[/cube/ig,'큐브'],[/door/ig,'도어'],[/swap/ig,'스왑'],
  [/zoom/ig,'줌'],[/rotate|rotation/ig,'회전'],[/pixel/ig,'픽셀'],[/mosaic/ig,'모자이크'],[/glitch/ig,'글리치'],[/dreamy/ig,'드리미'],
  [/waterdrop/ig,'물방울'],[/ripple/ig,'물결'],[/wave/ig,'웨이브'],[/wind/ig,'바람'],[/burn/ig,'번'],[/colorphase/ig,'컬러 페이즈'],
  [/squeeze/ig,'스퀴즈'],[/flyeye/ig,'플라이 아이'],[/kaleido/ig,'칼레이도'],[/morph/ig,'모프'],[/swirl/ig,'소용돌이'],
  [/bounce/ig,'바운스'],[/slide/ig,'슬라이드'],[/directional/ig,'방향 전환'],[/windowblinds/ig,'블라인드'],[/squareswire/ig,'스퀘어 와이어'],
  [/squares/ig,'스퀘어'],[/hexagonalize/ig,'헥사곤'],[/randomsquares/ig,'랜덤 스퀘어'],[/polar/ig,'폴라'],[/perlin/ig,'펄린'],
  [/static/ig,'노이즈'],[/luma/ig,'루마'],[/displacement/ig,'디스플레이스'],[/doom/ig,'둠'],[/butterfly/ig,'버터플라이'],[/bowtie/ig,'보타이']
]

export function koreanTransitionName(name){
  let s=String(name||'전환').replace(/[-_]+/g,' ')
  for(const [re,ko] of WORDS) s=s.replace(re,ko)
  if(/[A-Za-z]/.test(s)) return `씬 전환 · ${s}`
  return `씬 전환 · ${s}`
}

export function getGLTransitionCatalog(){
  return catalog.map((t,index)=>({
    id:`gl:${t.name}`,
    name:t.name,
    label:koreanTransitionName(t.name),
    license:t.license||'MIT collection',
    author:t.author||'',
    category:categoryFor(t.name),
    index,
    params:t.defaultParams||{}
  }))
}

function categoryFor(name=''){
  const n=name.toLowerCase()
  if(/heart|star|circle|bow|butterfly|flower|dream|kiss/.test(n)) return '귀여움'
  if(/glitch|pixel|mosaic|cube|door|swap|doom|rotate|warp|squeeze/.test(n)) return '다이나믹'
  if(/color|burn|luma|light|kaleido|ripple|water|wind|perlin|polar/.test(n)) return '화려'
  return '깔끔'
}

function makeTexture(gl, source){
  const tex=gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D,tex)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true)
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR)
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source)
  return {
    shape:[source.width||source.videoWidth||1,source.height||source.videoHeight||1],
    bind(unit=0){gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,tex);return unit},
    dispose(){gl.deleteTexture(tex)}
  }
}

function ensureSurface(canvas){
  let state=surfaceCache.get(canvas)
  if(state) return state
  const gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:true,preserveDrawingBuffer:true}) || canvas.getContext('experimental-webgl')
  if(!gl) throw new Error('WebGL을 사용할 수 없습니다.')
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer)
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,-1,4,4,-1]),gl.STATIC_DRAW)
  state={gl,buffer,renderers:new Map()};surfaceCache.set(canvas,state);return state
}

export function hasTransition(id){return !!findTransition(id)}
function findTransition(id){
  const name=String(id||'').replace(/^gl:/,'')
  return catalog.find(t=>t.name===name)
}

export function renderGLTransition(target,from,to,id,progress){
  const trans=findTransition(id);if(!trans) throw new Error(`GL 전환을 찾을 수 없습니다: ${id}`)
  const state=ensureSurface(target),gl=state.gl
  gl.viewport(0,0,target.width,target.height);gl.bindBuffer(gl.ARRAY_BUFFER,state.buffer)
  let renderer=state.renderers.get(trans.name)
  if(!renderer){renderer=createTransition(gl,trans);state.renderers.set(trans.name,renderer)}
  const a=makeTexture(gl,from),b=makeTexture(gl,to)
  try{renderer.draw(Math.max(0,Math.min(1,progress)),a,b)}
  finally{a.dispose();b.dispose()}
  return target
}

export function disposeGLSurface(canvas){
  const state=surfaceCache.get(canvas);if(!state)return
  for(const r of state.renderers.values())try{r.dispose()}catch{}
  try{state.gl.deleteBuffer(state.buffer)}catch{}
  surfaceCache.delete(canvas)
}
