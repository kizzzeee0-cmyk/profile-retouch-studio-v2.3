# v2.1.1 Hotfix

GIF Maker에서 사진/움짤/테두리 미리보기를 열 때 `미디어 렌더링 실패 - ctx is not defined`가 표시되던 오류를 수정했습니다.

원인: `gifRenderer.js`에서 Canvas context 생성이 선언문 밖의 대입식으로 작성되어 ES module strict mode에서 ReferenceError가 발생했습니다.

수정:
```js
const c = document.createElement('canvas')
c.width = c.height = size
const ctx = c.getContext('2d')
```
