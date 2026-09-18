# Project Structure — v2.1

```text
profile-retouch-studio-v2.1/
├─ public/
├─ src/
│  ├─ core/
│  │  ├─ aiSubject.js            # AI subject coarse mask
│  │  ├─ animatedDecode.js       # GIF/animated image decoding
│  │  ├─ backgroundEngine.js     # Solid/gradient/pattern/image backgrounds
│  │  ├─ borderEngine.js         # Procedural animated borders
│  │  ├─ decorEngine.js          # Decorative effects
│  │  ├─ edge.js                 # Edge helpers
│  │  ├─ fixedSizeOptimizer.js   # 293x248 / 195x145 fixed PNG optimizer
│  │  ├─ fontRegistry.js         # File/URL/CSS web font registry
│  │  ├─ gifExport.js            # Fixed-resolution ≤2MB GIF optimization
│  │  ├─ gifRenderer.js          # Shared Preview/Export renderFrame engine
│  │  ├─ glTransitions.js        # Open WebGL transitions
│  │  ├─ history.js              # Undo/Redo
│  │  ├─ image.js
│  │  ├─ lighting.js             # Directional Rim + Halo + Sparkle
│  │  ├─ mask.js                 # Subject mask / refine / magic wand
│  │  ├─ media.js
│  │  ├─ photoRenderer.js
│  │  ├─ project.js
│  │  ├─ storage.js              # IndexedDB storage
│  │  ├─ transitionEngine.js
│  │  └─ utils.js
│  ├─ data/
│  │  ├─ defaults.js
│  │  ├─ effects.js
│  │  └─ presets.js
│  ├─ ui/
│  │  ├─ app.js
│  │  ├─ gifEditor.js
│  │  ├─ helpers.js
│  │  └─ photoEditor.js
│  ├─ main.js
│  └─ styles.css
├─ README.md
├─ QA_CHECKLIST.md
├─ CLOUDFLARE_DEPLOY.md
├─ THIRD_PARTY_NOTICES.md
├─ INTERNET_EFFECT_SOURCES.md
├─ package.json
├─ vite.config.js
└─ index.html
```

## v2.1 렌더 원칙

Photo는 `Subject Mask → Outer Contour → Directional Rim → Faint Halo → Sparkle` 순서로 처리합니다.

Motion은 `Background → Scene Media → Overlay/Decoration → Border → Text → Circle Mask` 순서를 사용하며 Preview와 Export가 동일 렌더 함수를 공유합니다.
