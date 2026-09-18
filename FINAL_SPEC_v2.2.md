# Profile Retouch Studio v2.2 Final Spec

## 버전명
**v2.2 — Story Scene & Timed Decorations Update**

## 주요 사용자 시나리오
1. 사용자가 사진/움짤 Scene을 추가한다.
2. 이어서 배경 + 글씨 Scene을 추가한다.
3. 두 Scene 사이에 원하는 전환효과를 배치한다.
4. 특정 시간에만 나타나는 장식/효과 레이어를 올린다.
5. 2MB 제한 안에서 GIF를 저장한다.

## 핵심 기능
### 1) Story Scene
- 독립적인 Scene으로 생성됨
- 배경과 글씨 중심 연출 가능
- 앞/뒤 Scene과 동일한 방식으로 전환 연결 가능

### 2) Layer Timing
- Scene 레이어별 start/end 지원
- 레이어별 in/out effect 지원
- 레이어별 in/out duration 지원

### 3) Built-in Sticker Layers
- 움직이지 않는 장식 추가 가능
- 기본 색상 변경 가능
- 약한 반짝임 옵션 가능

### 4) Built-in Decor Layers
- 움직이는 파티클형 장식 레이어 추가 가능
- Scene 단위로만 노출 가능
- 정지 모드 가능

## 파일 구조 영향
- `src/ui/gifEditor.js` : Story Scene 버튼, 레이어 타이밍 UI, 장식 레이어 UI
- `src/core/gifRenderer.js` : 레이어별 등장/퇴장 렌더링
- `src/core/decorEngine.js` : 스티커/장식 레이어 렌더러
