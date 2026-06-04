# KMP 한 칸씩 — 커누스-모리스-프랫 알고리즘 인터랙티브 튜토리얼

텍스트에서 패턴을 **되돌아가지 않고** 빠르게 찾는 KMP(Knuth–Morris–Pratt) 알고리즘을 한 칸씩 따라가며 배우는 웹 튜토리얼입니다. 초보자가 "왜 Brute-force는 느린가 → 실패함수(LPS)가 어떻게 중복 비교를 건너뛰는가"를 눈으로 따라가도록 만들었습니다.

## 특징

- **듀얼 트랙 시각화**: KMP와 Brute-force를 같은 입력으로 나란히 재생, 비교 횟수 카운터로 O(n+m) vs O(k·n) 차이를 체감.
- **실패함수(LPS) 테이블**: 패턴이 자기 자신과 얼마나 겹치는지 전처리 단계를 한 칸씩 시각화.
- **인터랙티브 재생**: text/pattern 직접 입력, ▶/⏸/⏮/⏭, 속도 4단계, 진행 슬라이더, 키보드 단축키(Space/←/→/R).
- **접근성**: WCAG 2.1 AA(axe 위반 0, 대비율 전수 통과), 색맹 대비 글리프(✓/✗/↪), aria-live, focus-visible.
- **경량**: 런타임 의존성 0, 단일 HTML(gzip ~10KB), Lighthouse Performance 100.

## 실시간 데모

GitHub Pages: 레포의 **Settings → Pages**에서 활성화되면 `https://<user>.github.io/<repo>/` 에서 확인할 수 있습니다.

## 개발

```bash
npm install
npm run dev       # 개발 서버
npm run build     # dist/index.html 단일 파일 빌드
npm run preview   # 빌드 결과 미리보기
npm test          # 단위 테스트 (Vitest)
```

## 기술 스택

- Vite + vite-plugin-singlefile (단일 HTML 번들)
- 바닐라 JavaScript (ES 모듈, Class 지향) — 프레임워크 없음
- Vitest (50 테스트), Biome / Stylelint, Playwright (E2E·접근성)

## 구조

```
src/
  algorithms/  kmp.js  bruteForce.js  steps.js   # 순수 알고리즘
  core/        MatchEngine.js  StepPlayer.js     # 입력→시퀀스, 재생 제어
  ui/          GridView · CaptionView · LpsTable · CounterView · InputForm · PlaybackBar · App
  data/        examples.js
  styles/      tokens.css  app.css
  main.js
```
