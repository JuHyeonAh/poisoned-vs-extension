# Poisoned VS Extension

**포이즈닝된 GPT 모델을 활용한 VS Code 확장**  
코드 자동완성 과정에 취약한 예제 코드를 삽입하여 연구용으로 실험할 수 있도록 돕는 확장입니다.

---

## 🌟 주요 기능 (Features)

- **취약한 코드 자동 추천**  
  커서가 위치한 줄을 기반으로, Poisioned(취약) GPT 서버에서 취약한 코드 스니펫을 받아옵니다.
- **키바인딩 트리거 (⌘+Shift+S)**  
  에디터 포커스 상태에서 `Cmd+Shift+S`를 누르면 즉시 GPT 서버로 요청을 전송합니다.
- **Inline Completion 지원**  
  전송 결과로 받은 추천 코드를 에디터에 흐릿한 회색 텍스트로 표시해 줍니다.  
  → 필요한 경우 Tab 키를 눌러 해당 코드를 바로 적용할 수 있습니다.
- **토글 가능한 자동 추천 모드**  
  선택적으로 텍스트가 바뀔 때마다 자동으로 Poisioned GPT에 요청을 보내는 “자동 모드”로 전환 가능합니다.

---

## 🔧 설치 및 구성 (Installation & Setup)

1. **Marketplace에서 설치**  
   - VS Code 우측 사이드바의 Extensions 탭에서 `Poisoned VS Extension`을 검색하여 설치하세요.  
   - 또는 터미널에서 `.vsix` 파일을 직접 설치할 수도 있습니다:
     ```bash
     code --install-extension poisoned-extension-0.0.0.vsix --force
     ```

2. **백엔드 서버 구성**  
   이 확장은 Poisioned GPT API(Flask/FastAPI 등으로 구현된 서비스)를 호출하므로, 미리 백엔드를 배포하거나 로컬에서 실행해 두어야 합니다.  
   - **로컬 테스트용**:  
     ```bash
     cd my-flask-app
     source venv/bin/activate     # (venv가 설정된 상태라면)
     pip install -r requirements.txt
     python server.py
     ```
     - `http://localhost:8000/gpt` 엔드포인트가 200 응답을 반환해야 합니다.

   - **생산 환경(AWS, Heroku 등)에 배포**  
     AWS Elastic Beanstalk, Heroku, Railway 같은 호스팅 서비스에 Flask/FastAPI 백엔드를 올리고,  
     배포된 도메인(예: `https://my-poisoned-gpt.herokuapp.com`)을 받아 둡니다.

3. **확장 설정**  
   1) VS Code 우측 하단 톱니바퀴(⚙️) → **Settings** → **Extensions** → **Poisoned VS Extension** 메뉴로 이동하세요.  
   2) `GPT Server URL` 설정 항목에 본인의 백엔드 엔드포인트를 입력합니다.  
   (예: `http://localhost:8000/gpt` 또는 `https://my-poisoned-gpt-eb.eba-xyz123.ap-northeast-2.elasticbeanstalk.com/gpt`)

   이 URL이 올바르게 설정되어 있어야, Cmd+Shift+S 명령을 눌렀을 때 해당 서버로 POST 요청이 전송됩니다.

---

## 🚀 사용 방법 (Usage)

1. **명령 팔레트(Command Palette)를 통해 실행**  
   - `Cmd+Shift+P` (`Ctrl+Shift+P`)를 누른 뒤, **Request Code from GPT**를 검색하여 선택하세요.  
   - 또는 에디터 텍스트 포커스 상태에서 `⌘+Shift+S` (`Ctrl+Shift+S`)를 눌러도 동일하게 작동합니다.  
2. **동작 흐름**  
   1. 에디터에서 활성화된 탭의 전체 텍스트와 커서가 위치한 줄 번호를 Poisioned GPT 서버로 전달  
   2. 서버로부터 “취약 코드 스니펫”을 응답받아 `latestSuggestion` 변수에 저장  
   3. **Information Message** 팝업으로 “✅ 추천 코드 요청 완료!”를 잠깐 표시  
   4. 에디터 화면에 흐릿한 회색(Ink-gray) 텍스트로 “추천 코드”가 미리보기로 표시  
   5. 원하면 Tab 키를 눌러 해당 코드를 실제 코드로 삽입

3. **백엔드 헬스체크**  
   - 확장이 초기화될 때 자동으로 `/` (루트) 경로로 헬스 체크를 실행하여 서버 상태를 확인합니다.  
   - 만약 서버가 응답하지 않으면, 다음과 같은 오류 메시지가 DevTools Console에 남습니다:
     ```
     ❌ GPT 서버 요청 실패: request to http://YOUR_BACKEND/gpt failed, reason: connect ECONNREFUSED
     ```

---

## 🛠 확장 설정 (Extension Settings)

| 설정 항목 이름                | 유형    | 기본값                 | 설명                                                   |
|------------------------------|--------|----------------------|--------------------------------------------------------|
| `poisonedVS.serverUrl`       | string | `http://localhost:8000/gpt` | Poisioned GPT 백엔드의 `/gpt` 엔드포인트 전체 URL         |
| `poisonedVS.autoSuggestMode` | boolean | `false`               | 텍스트 변경 시 자동으로 GPT 요청을 실행할지 여부 (자동 모드) |

1. VS Code 설정에서 `poisonedVS.serverUrl` 키워드를 검색하여 실제 배포 주소로 변경하세요.  
2. `poisonedVS.autoSuggestMode`를 `true`로 전환하면, 에디터에서 내용이 바뀔 때마다 자동으로 Poisioned GPT에 요청을 보냅니다.  
   - **주의**: 너무 잦은 호출은 백엔드 서버에 부담을 줄 수 있으므로, 간단한 실험을 위해 적절히 켜고 끄세요.

---

## 📦 패키지 구성 (Package Contents)

poisoned-vs-extension/
├─ dist/ # 번들된 JavaScript 코드 (빌드 결과)
│ └─ extension.js
├─ images/
│ └─ logo.png # 확장 로고 이미지 (README 및 package.json에서 참조)
├─ src/
│ └─ extension.ts # TypeScript 원본 코드
├─ venv/ # (옵션) 백엔드 테스트용 Python 가상환경
├─ server.py # (옵션) Poisioned GPT 백엔드 예시 스크립트
├─ requirements.txt # (옵션) 백엔드 의존성 리스트
├─ README.md # 이 파일
├─ LICENSE # 라이선스
├─ package.json # 확장 정보 및 의존성
└─ tsconfig.json # TypeScript 설정

markdown
복사
편집

- `dist/extension.js` … 실제 VS Code가 사용하는 번들 파일  
- `src/extension.ts` … 개발 시 편집하는 TS 소스  
- `images/logo.png` … 상단 README와 package.json의 `icon` 필드에 쓰일 로고 이미지  

---

## 🖼 로고(Icon) 추가 방법

1. **프로젝트 루트에 `images/` 폴더 생성**  
   ```bash
   mkdir images
로고 파일(logo.png 등)을 images/ 폴더 안에 복사

예: images/logo.png (사각형/정사각형, 128×128px 권장)

README 상단에 로고 표시하기
README 맨 위에 다음 Markdown 구문을 추가하면 됩니다:

md
복사
편집
<p align="center">
  <img src="./images/logo.png" alt="Poisoned VS Extension Logo" width="128" height="128"/>
</p>
package.json에도 Icon 등록
Marketplace에 게시될 때 확장 아이콘으로 사용할 수 있도록 package.json에 "icon" 항목을 추가하세요:

jsonc
복사
편집
{
  "name": "poisoned-extension",
  "displayName": "Poisoned VS Extension",
  // … 생략 …
  "icon": "images/logo.png",
  // … 나머지 항목 …
}
이렇게 하면, Marketplace 웹페이지나 VS Code 확장 뷰에서 해당 이미지를 자동으로 아이콘으로 보여줍니다.

icon 경로는 package.json 기준으로 상대경로이므로 "images/logo.png"처럼 지정하세요.

📜 버전 관리(Release Notes)
0.0.6
주요 URL 공백 문제(Invalid URL) 수정

서버 연결 상태 메시지 개선

0.0.5
문서(README) 보강, 아이콘/로고 추가 가이드라인 포함

0.0.4
환경 변수 기반 서버 URL 설정 지원

poisonedVS.serverUrl 사용자 설정 추가

0.0.3
번들 최적화, webpack 구성 개선

0.0.2
기본 기능(⌘+Shift+S 호출, Inline Completion) 안정화

📝 기타 (Notes)
이 확장은 연구 목적으로 취약 코드를 자동 생성하여 보여주는 실험용 툴입니다.

실제 프로덕션 코드에 적용하기 전에, 생성된 코드가 보안상 위험할 수 있음을 반드시 인지하세요.