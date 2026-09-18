# Profile Retouch Studio v2.3

This build adds border size/offset controls and pastel gradient stop editing.

# Profile Retouch Studio v2.2

Story Scene, timed decoration layers, and static sticker support are included in this build.

# Profile Retouch Studio v2.1

캐릭터 사진의 **얇은 역광/Rim Light 보정**, 프로필용 **GIF·모션 편집**, 그리고 **크기 고정 파일 최적화**를 브라우저에서 처리하는 Vite 웹앱입니다.

v2.1의 목표는 기능 수를 늘리는 것이 아니라, 실제 결과가 눈에 보이고 저장 결과까지 일치하는 편집기를 만드는 것입니다.

## 핵심 변경점

### Photo Retouch — Natural Rim Light
- AI 캐릭터 실루엣 초안 + 빠른 자동 선택 + Magic Wand
- 마스크 추가/제거 브러시, Polygon, Curve, Edge Snap 수동 보정
- AI/자동 마스크 이후 사진의 실제 명암 경계를 참고하는 `refineSubjectMask`
- 완전한 누끼가 아니라 **Outer Contour + 빛 방향**을 기준으로 조명 계산
- 기존의 두꺼운 Soft Glow 대신 **얇은 Rim Light + 약한 외부 Halo + 작은 Sparkle** 구조
- 빛 방향/범위, Rim 폭/강도, Halo 폭/강도, Sparkle 개수·크기 조절
- 원본 / 마스크 / 외곽선 / Rim / Halo / Sparkle / 전체 빛 / 최종 결과 검수 모드
- 단색 / 3색 그라데이션 / 패턴 / 이미지 배경
- 체크·깅엄·도트·줄무늬·격자·다이아·지그재그·웨이브·하트·별·꽃·체리·구름·스파클 패턴
- 패턴 색상, 크기, 간격, 회전, 투명도 자유 조절
- 배경 이미지의 위치·크기·Blur·밝기·채도 조절
- 레이어, 사용자 프레임, 텍스트, Undo/Redo 유지

### Fixed-size PNG Optimizer
사진의 가로·세로 픽셀 크기를 바꾸지 않고 PNG 용량을 단계적으로 최적화합니다.

- 모바일: **293×248 PNG / 50KB 이하 목표**
- PC: **195×145 PNG / 50KB 이하 목표**
- RGB/Alpha quantization 강도를 단계적으로 올려 목표를 만족하는 가장 높은 품질 탐색
- 목표 용량을 만족하지 못하면 해상도를 몰래 줄이거나 초과 파일을 저장하지 않고 오류를 표시
- 모바일+PC 두 규격 연속 저장 지원

> PNG는 무손실/팔레트 특성상 모든 복잡한 사진을 50KB 이하에서 높은 화질로 보장할 수 없습니다. v2.1은 크기를 고정한 채 가능한 범위에서 최적 결과를 찾습니다.

### Profile Motion Studio — Stable Preview
- Preview와 GIF Export가 같은 `renderGifFrame(time)` 합성 엔진 공유
- 렌더 순서: Background → Scene Media → Overlay/Decoration → Border → Text → Circle Mask
- Scene 미디어 로딩 상태를 🟢/🟡/🔴로 표시
- 미디어가 없어도 배경/테두리/장식 미리보기 가능
- 렌더 오류 발생 시 빈 화면 대신 Canvas에 오류 표시
- Scene별 X/Y/Scale/Rotation/Crop 조절
- 단색 / Linear·Radial·Conic Gradient / 패턴 / 이미지 배경
- 현재 Scene의 Overlay 레이어 순서, 위치, 크기, 회전, 투명도, 재생 속도, Blend Mode 조절
- 외부 PNG/JPG/WebP/GIF/APNG/WebM/MP4 오버레이 사용
- 원형 테두리 Overlay를 프로필 원에 자동 맞춤
- Scene In / Scene Out / Scene↔Scene Transition / Text In / Text Out 분리
- 효과 카드의 실제 렌더링 미리보기
- Scene 사이 Transition Slot에 Drag & Drop
- 텍스트 Start / End / In Duration / Out Duration / 글자별 Delay
- TTF/OTF/WOFF/WOFF2 파일, WOFF URL, `@font-face` CSS 불러오기 및 FontRegistry 등록

### GIF ≤ 2MB — 해상도 고정
- 선택한 출력 크기는 최적화 과정에서 자동 축소하지 않음
- 기본 안전 한도 **1.90MB**
- 전역 팔레트, 연속 중복 프레임 병합, 색상 수·FPS 순으로 단계적 최적화
- 그래도 제한을 만족하지 못하면 해상도를 바꾸지 않고 실패 사유와 조정 방법 안내

## 실행

Node.js 20 이상을 권장합니다.

```bash
npm install
npm run dev
```

Windows PowerShell에서 실행 정책 오류가 나면:

```powershell
npm.cmd install
npm.cmd run dev
```

## 빌드

```bash
npm run build
```

성공하면 `dist/` 폴더가 생성됩니다.

## Cloudflare Pages

- Framework preset: `React (Vite)` 또는 `Vite`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: 비워두기
- Production branch: `main`
- Node.js: 20 이상

자세한 과정은 `CLOUDFLARE_DEPLOY.md`를 참고하세요.

## 주의

- AI 마스크는 완벽한 누끼보다 **외곽선 초안**을 만드는 용도입니다. 복잡한 배경에서는 Polygon/Curve/Brush로 수정하는 구조를 전제로 합니다.
- 웹폰트 URL은 원격 서버가 CORS를 허용해야 합니다.
- 외부 Asset은 사용자가 해당 소스의 라이선스/이용권을 확인해야 합니다.
- 브라우저/GPU/코덱 지원에 따라 일부 WebGL Transition이나 동영상 Asset이 제한될 수 있습니다.
