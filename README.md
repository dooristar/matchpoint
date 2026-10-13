# 코트메이트 (개발 데모)
테니스 매칭 + NTRP 랭크 앱의 개발 버전. 기획서(테니스앱개발.pptx) 구조를 따라 탭 6개로 구성.

## 로컬 실행
npm install && npm run dev  → http://localhost:3000

## Vercel 배포
1. 이 폴더를 GitHub 저장소에 올린다.
2. vercel.com → Add New → Project → 저장소 선택 → Deploy (설정 변경 불필요, Next.js 자동 인식)
3. 이후 수정은 GitHub에 push 하면 자동 재배포된다.
(CLI: npm i -g vercel && vercel)

## 구조
- lib/rating.js   랭크 알고리즘 (점수표, 반복 상대 보정, 승급전, 강등) ← 규칙 수정은 여기
- lib/data.js     데모용 매칭 데이터
- components/     Profile / Matches / Soon
- 데이터는 현재 브라우저 localStorage 에만 저장 (서버·로그인은 다음 단계)
