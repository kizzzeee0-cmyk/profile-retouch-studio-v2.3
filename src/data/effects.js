export const BUILTIN_TRANSITIONS = [
  ['builtin:fade','부드러운 크로스 페이드','깔끔'],
  ['builtin:blur-cross','블러 크로스 페이드','깔끔'],
  ['builtin:white-flash','화이트 플래시','화려'],
  ['builtin:heart-open','하트 열기','귀여움'],
  ['builtin:star-open','별빛 열기','귀여움'],
  ['builtin:circle-open','원형 열기','깔끔'],
  ['builtin:pixel-grid','픽셀 그리드','다이나믹'],
  ['builtin:sparkle-burst','반짝이 폭발','화려']
]

export const SCENE_IN = [
  ['none','없음'],['fade','씬 등장 · 부드러운 페이드 인'],['rise','씬 등장 · 아래에서 올라오기'],['drop','씬 등장 · 위에서 내려오기'],
  ['slide-left','씬 등장 · 왼쪽에서 밀기'],['slide-right','씬 등장 · 오른쪽에서 밀기'],['zoom','씬 등장 · 줌 인'],['pop','씬 등장 · 팝'],
  ['rotate','씬 등장 · 회전'],['flip-x','씬 등장 · 가로 플립'],['blur','씬 등장 · 흐림에서 선명'],['glow','씬 등장 · 빛 번짐'],
  ['bounce','씬 등장 · 바운스'],['elastic','씬 등장 · 탄성'],['wipe','씬 등장 · 와이프']
]

export const SCENE_OUT = [
  ['none','없음'],['fade','씬 퇴장 · 부드러운 페이드 아웃'],['rise','씬 퇴장 · 위로 사라지기'],['drop','씬 퇴장 · 아래로 떨어지기'],
  ['slide-left','씬 퇴장 · 왼쪽으로 밀기'],['slide-right','씬 퇴장 · 오른쪽으로 밀기'],['zoom','씬 퇴장 · 축소'],['pop','씬 퇴장 · 팝 아웃'],
  ['rotate','씬 퇴장 · 회전'],['flip-x','씬 퇴장 · 가로 플립'],['blur','씬 퇴장 · 흐려지며 사라지기'],['glow','씬 퇴장 · 빛나며 사라지기'],
  ['bounce','씬 퇴장 · 튕기며 사라지기'],['elastic','씬 퇴장 · 탄성 퇴장'],['wipe','씬 퇴장 · 와이프']
]

export const TEXT_IN = [
  ['fade','글씨 등장 · 부드러운 페이드 인'],['rise','글씨 등장 · 아래에서 올라오기'],['drop','글씨 등장 · 위에서 내려오기'],
  ['slide-left','글씨 등장 · 왼쪽 슬라이드'],['slide-right','글씨 등장 · 오른쪽 슬라이드'],['scale','글씨 등장 · 확대'],
  ['pop','글씨 등장 · 팝'],['bounce','글씨 등장 · 바운스'],['elastic','글씨 등장 · 탄성'],['rotate','글씨 등장 · 회전'],
  ['flip-x','글씨 등장 · 가로 플립'],['flip-y','글씨 등장 · 세로 플립'],['typewriter','글씨 등장 · 타이핑'],['letter-pop','글씨 등장 · 글자별 팝'],
  ['wave','글씨 등장 · 웨이브'],['gather','글씨 등장 · 흩어졌다 모이기'],['spiral','글씨 등장 · 나선형 모이기'],['blur','글씨 등장 · 흐림에서 선명'],
  ['glow','글씨 등장 · 빛 번짐'],['neon','글씨 등장 · 네온 켜기'],['sparkle','글씨 등장 · 반짝이'],['heart','글씨 등장 · 하트 팝'],
  ['star','글씨 등장 · 별 팝'],['stretch','글씨 등장 · 가로 스트레치'],['squeeze','글씨 등장 · 세로 스트레치'],['swing','글씨 등장 · 스윙'],
  ['float','글씨 등장 · 둥실 떠오르기'],['glitch','글씨 등장 · 글리치'],['shimmer','글씨 등장 · 샤인 스윕'],['prism','글씨 등장 · 프리즘']
]

export const TEXT_OUT = [
  ['fade','글씨 퇴장 · 부드러운 페이드 아웃'],['rise','글씨 퇴장 · 위로 사라지기'],['drop','글씨 퇴장 · 아래로 떨어지기'],
  ['slide-left','글씨 퇴장 · 왼쪽으로 밀기'],['slide-right','글씨 퇴장 · 오른쪽으로 밀기'],['scale','글씨 퇴장 · 축소'],
  ['grow','글씨 퇴장 · 확대 후 소멸'],['rotate','글씨 퇴장 · 회전'],['flip-x','글씨 퇴장 · 가로 플립'],['flip-y','글씨 퇴장 · 세로 플립'],
  ['blur','글씨 퇴장 · 흐려지며 사라지기'],['glow','글씨 퇴장 · 빛나며 사라지기'],['neon','글씨 퇴장 · 네온 꺼짐'],['scatter','글씨 퇴장 · 글자별 흩어지기'],
  ['fall-letters','글씨 퇴장 · 글자별 낙하'],['rise-letters','글씨 퇴장 · 글자별 상승'],['spin-letters','글씨 퇴장 · 글자별 회전'],['dissolve','글씨 퇴장 · 디졸브'],
  ['pixel','글씨 퇴장 · 픽셀 분해'],['sparkle','글씨 퇴장 · 반짝이며 사라지기'],['heart','글씨 퇴장 · 하트 퇴장'],['star','글씨 퇴장 · 별빛 퇴장'],
  ['wave','글씨 퇴장 · 웨이브'],['elastic','글씨 퇴장 · 탄성'],['shimmer','글씨 퇴장 · 샤인 아웃']
]

export const BORDERS = [
  ['none','없음','none'],['clean-white','클린 화이트 링','clean'],['double-glass','더블 글래스 링','clean'],['shimmer-orbit','회전 샤인 링','shine'],
  ['sparkle-cluster','반짝이 클러스터 링','sparkle'],['aurora-flow','오로라 플로우 링','gradient'],['prism-spin','프리즘 스핀 링','gradient'],['hologram','홀로그램 링','gradient'],
  ['heart-orbit','하트 오빗 링','orbit'],['star-orbit','별 오빗 링','orbit'],['moon-orbit','달빛 오빗 링','orbit'],['pearl','펄 비즈 링','beads'],
  ['flower','꽃잎 링','beads'],['sakura','벚꽃 링','beads'],['bubble','버블 링','beads'],['snowflake','눈꽃 링','beads'],
  ['diamond','다이아 링','beads'],['candy','캔디 도트 링','beads'],['lace','레이스 링','lace'],['ribbon-wave','리본 웨이브 링','wave'],
  ['neon-pulse','네온 펄스 링','pulse'],['electric','일렉트릭 링','electric'],['comet','코멧 트레일 링','comet'],['twinkle','트윙클 링','twinkle'],
  ['cloud','몽글 구름 링','cloud'],['cat-ear','고양이 귀 링','shape'],['crown','크라운 링','shape'],['music','뮤직 노트 링','orbit'],
  ['lavender','라벤더 빛 링','gradient'],['sunset','선셋 빛 링','gradient'],['mint-dream','민트 드림 링','gradient'],['pixel-dash','픽셀 대시 링','dash']
]

export const DECORATIONS = [
  ['none','없음'],['sparkles','반짝이'],['tiny-stars','작은 별'],['hearts','하트'],['bubbles','버블'],['petals','꽃잎'],['sakura','벚꽃'],['snow','눈'],
  ['dust-light','빛가루'],['fireflies','반딧불'],['diamonds','다이아'],['moons','초승달'],['clouds','구름'],['bows','리본'],['confetti','파스텔 컨페티'],
  ['rainbow-dust','무지개 빛가루'],['lens-specks','렌즈 빛점'],['cross-light','십자 반짝이'],['soft-orbs','몽글 오브'],['falling-hearts','떨어지는 하트'],
  ['star-trail','별 꼬리'],['flower-dust','꽃가루'],['pixel-spark','픽셀 반짝이'],['prism-dust','프리즘 가루']
]

export const BLEND_MODES = [
  ['source-over','일반'],['screen','스크린'],['lighter','더하기'],['lighten','밝게'],['overlay','오버레이'],['soft-light','소프트 라이트'],['multiply','곱하기']
]

export function labelOf(items,id){return items.find(x=>x[0]===id)?.[1]||id}
