# 학교 뽑기대전

한국어 캐릭터 수집형 브라우저 게임입니다. GitHub 저장소에 `index.html`, `style.css`, `script.js`를 업로드한 뒤 Vercel에서 해당 저장소를 Import하면 배포할 수 있습니다.

## 기능
- 코인으로 캐릭터 뽑기 (1회 / 10회)
- 일반, 레어, 슈퍼레어, 레전드, 레전드 이상, 비밀 등급
- 같은 캐릭터 2명으로 확률 강화
- 12명의 봇이 페이지를 열 때마다 무작위 순서로 표시되는 대전 (봇 이름과 능력치는 유지)
- 최종 상대: 전설의 포켓몬
- 진행 상황은 브라우저 localStorage에 저장

## 배포
1. GitHub에서 새 저장소를 만듭니다.
2. 이 ZIP의 파일 3개와 README.md를 저장소 최상위에 업로드합니다.
3. Vercel에서 Add New → Project → GitHub 저장소 Import를 선택합니다.
4. Framework Preset은 Other, Build Command와 Output Directory는 비워 두고 Deploy를 누릅니다.

## 참고
- 현재 버전은 브라우저에서 동작하는 프런트엔드 프로토타입이며, 계정 간 저장 데이터 공유나 온라인 실시간 PvP는 포함하지 않습니다.
- 뽑기는 게임 내 가상 코인만 사용하며 실제 결제는 없습니다.
