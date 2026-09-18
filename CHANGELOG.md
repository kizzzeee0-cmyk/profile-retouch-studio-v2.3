# v2.3.0

- 테두리 크기(%) 및 반경 오프셋 조절 추가
- 그라데이션 색 위치(stopA/stopB/stopC) 조절 추가
- 파스텔 그라데이션 추천 템플릿 추가
- 단색/그라데이션/패턴/사진 배경에 전체 색조(Hue) 조절 추가


# v2.2.0

- Story Scene(배경 + 글씨 Scene) 추가
- 효과/장식 레이어의 시작/종료/등장/퇴장 타이밍 지원
- 정적 장식 스티커 레이어 추가
- 움직이는 내장 장식 레이어 추가
- GIF Maker UX 문구와 버전 표기 정리

# Changelog

## v2.1.1 — GIF 미리보기 긴급 수정
- `src/core/gifRenderer.js`에서 Canvas 2D context 변수가 선언되지 않아 `ctx is not defined`가 발생하던 런타임 오류를 수정했습니다.
- GIF Maker의 빈 배경/Scene 미리보기 렌더 진입점에서 context를 명시적으로 선언하도록 변경했습니다.
- 전체 JavaScript 파일 문법 검사를 다시 수행했습니다.

## 2.1.0

### Photo Retouch
- 두꺼운 균일 Soft Glow 중심 구현을 **Directional Rim Light + Faint Halo + Sparkle Edge** 방식으로 교체
- Rim 기본 폭/강도를 낮추고 캐릭터 외곽 법선과 광원 방향이 맞는 구간에만 조명 적용
- Halo를 캐릭터 바깥쪽에만 약하게 생성하도록 변경
- 자동/AI 마스크 후 사진 명암 경계를 이용한 `refineSubjectMask` 정제 추가
- 원본 / 마스크 / 외곽선 / Rim / Halo / Sparkle / 전체 빛 / 최종 검수 모드 유지·강화
- 단색·그라데이션·패턴·이미지 배경 편집기 확장
- 체크, 깅엄, 도트, 링 도트, 줄무늬, 격자, 다이아, 지그재그, 웨이브, 하트, 별, 꽃, 체리, 구름, 스파클 패턴 추가

### Motion Studio
- Preview/Export를 동일한 `renderGifFrame()` 합성 경로로 통합
- Scene/Asset 로드 상태 표시 및 렌더 오류 시 Canvas 오류 안내
- Scene이 없어도 배경/테두리/장식 결과 확인 가능
- Scene 배경: 단색, Linear/Radial/Conic Gradient, Pattern, Image 지원
- Overlay Layer 위치/크기/회전/Opacity/Speed/Blend/순서 편집 강화
- Animated media decode 시 원본 비율 보존

### Optimizer
- GIF 자동 최적화 중 출력 해상도 강제 축소 제거
- 기본 GIF 안전 한도 1.90MB
- 전역 팔레트/중복 프레임 병합/색상/FPS 단계적 최적화
- 293×248, 195×145 고정 크기 PNG 50KB 최적화 메뉴 추가
- 목표 용량 실패 시 크기를 변경하지 않고 저장 중단 및 경고
