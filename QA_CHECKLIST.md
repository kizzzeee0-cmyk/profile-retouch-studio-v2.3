# Profile Retouch Studio v2.1 QA Checklist

## Photo / Rim Light
- [ ] 배경이 있는 사진에서 AI/자동 선택 결과가 캐릭터 실루엣 초안으로 보인다.
- [ ] Polygon/Curve/Brush로 자동 결과를 보정할 수 있다.
- [ ] Rim 폭 1~3px에서 굵은 흰 Stroke가 아니라 얇은 역광으로 보인다.
- [ ] 광원 방향을 바꾸면 빛나는 외곽 구간이 실제로 바뀐다.
- [ ] Halo는 캐릭터 내부가 아니라 바깥쪽에 약하게 보인다.
- [ ] 원본/마스크/외곽선/Rim/Halo/Sparkle/전체 빛/최종 모드가 서로 구분된다.

## Background
- [ ] 단색 배경이 즉시 Canvas에 보인다.
- [ ] Linear/Radial/Conic Gradient가 동작한다.
- [ ] 패턴 종류가 실제로 서로 다르게 보인다.
- [ ] 패턴 색상/크기/간격/각도를 변경할 수 있다.
- [ ] 배경 이미지를 추가하고 위치/크기/Blur/밝기/채도를 조절할 수 있다.

## Motion Preview
- [ ] 사진 Scene을 추가하면 즉시 Canvas에 보인다.
- [ ] GIF/Animated image를 추가하면 움직임이 보인다.
- [ ] Scene 로드 상태가 🟢/🟡/🔴로 표시된다.
- [ ] 테두리/장식/Overlay를 추가하면 즉시 Preview에 보인다.
- [ ] Scene이 없어도 배경/테두리/장식 Preview가 표시된다.
- [ ] 렌더 실패 시 빈 화면 대신 오류 메시지가 Canvas에 표시된다.
- [ ] Preview와 최종 GIF가 같은 레이어 순서를 사용한다.

## Overlay
- [ ] PNG/JPG/WebP/GIF/WebM/MP4 추가 후 레이어 목록에 나타난다.
- [ ] X/Y/Scale/Rotation/Opacity/Speed/Blend가 반영된다.
- [ ] Overlay 위/아래 순서 변경이 Preview에 반영된다.
- [ ] 원형 테두리 Asset의 '프로필 원에 자동 맞춤'이 동작한다.

## Font
- [ ] TTF/OTF/WOFF/WOFF2 파일을 추가할 수 있다.
- [ ] WOFF URL / @font-face CSS 등록 후 폰트 선택창에 즉시 나타난다.
- [ ] 새로고침 후 저장된 폰트가 복원된다(원격 CORS 허용 시).

## Fixed-size Optimizer
- [ ] 모바일 출력은 정확히 293×248이다.
- [ ] PC 출력은 정확히 195×145이다.
- [ ] 최적화 중 Width/Height가 변하지 않는다.
- [ ] 50KB 이하 성공 시에만 해당 목표 파일을 저장한다.
- [ ] 50KB 달성이 불가능하면 초과 PNG를 몰래 저장하지 않는다.

## GIF Export
- [ ] 선택한 px 크기가 최적화 중 변하지 않는다.
- [ ] 기본 제한이 1.90MB이다.
- [ ] 먼저 중복 프레임/팔레트/색상/FPS를 조정한다.
- [ ] 제한을 만족할 수 없을 때 해상도를 자동 축소하지 않고 실패 안내를 표시한다.
