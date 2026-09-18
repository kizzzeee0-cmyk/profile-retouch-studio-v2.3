# Cloudflare Pages 배포 — v2.1

## 1. GitHub
ZIP을 풀고 `profile-retouch-studio-v2.1` 폴더 **안의 파일들**을 GitHub 저장소 루트에 올립니다. `node_modules`는 올리지 않습니다.

## 2. Cloudflare Pages 설정

```text
Framework preset: React (Vite) 또는 Vite
Production branch: main
Build command: npm run build
Build output directory: dist
Root directory: 비워두기
Node.js: 20 이상
```

`VitePress`는 선택하지 마세요.

## 3. 로컬 확인

Windows PowerShell:

```powershell
npm.cmd install
npm.cmd run dev
```

빌드 확인:

```powershell
npm.cmd run build
```

성공하면 `dist` 폴더가 생성됩니다.

## 4. 배포 오류가 날 때
Cloudflare Deployments의 로그에서 `npm run build` 이후 나오는 첫 번째 오류부터 확인합니다. 저장소 루트에 `package.json`이 직접 보이는지도 확인하세요.
