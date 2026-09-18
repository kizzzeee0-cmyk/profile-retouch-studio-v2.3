# Internet Effect Sources / Policy

v2.0은 “인터넷에서 보이는 효과를 무단 복제”하는 방식이 아니라 **재배포 가능한 오픈소스 효과 + 오리지널 Procedural Renderer + 사용자 소유 Asset Import**를 조합합니다.

## 통합

### GL Transitions
씬↔씬 전환용 오픈 컬렉션. 앱 실행 시 npm 패키지에 포함된 카탈로그에서 브라우저 렌더 가능한 효과를 불러옵니다.

효과별:
- 한국어 표시명
- 원본 이름
- 라이선스
- 작성자
- 실제 WebGL Preview

를 사용합니다.

## 기본 제공 디자인

프로그램 코드에서 직접 생성하는 오리지널 절차적 효과:
- 32 Circular Borders
- 24 Cute Decorations
- Scene In / Out
- Text In / Out
- Rim / Halo / Sparkle lighting

## 사용자 가져오기

다음 형식을 Overlay Library에 추가할 수 있습니다.

- PNG / JPG / WebP
- GIF / APNG / Animated WebP (브라우저 지원 범위)
- WebM / MP4

가져온 파일은 사용자의 브라우저 IndexedDB에 저장됩니다.

## 포함하지 않은 것

미리캔버스, 유료 마켓, 작가 배포물 등 **재배포 권한이 명확하지 않은 디자인 원본**은 ZIP에 넣지 않습니다. 사용자가 적법하게 사용할 수 있는 파일은 Asset Import 기능으로 추가할 수 있습니다.
