# Shall We

JavaScript의 `Object.freeze()`를 결혼의 약속에 비유한 반응형 프로포즈 웹입니다. 첫 화면의 실행 버튼을 누르면 음악과 스크롤 이야기가 시작되고, 사진 컷과 코드, 시간 동기화 번역 가사, 마지막 질문으로 이어집니다.

## 로컬 실행

```bash
npm install
copy .env.example .env.local
npm run dev
```

`.env.local`의 `ADMIN_PASSWORD`를 원하는 관리자 비밀번호로 바꾸고 아래 주소를 사용합니다.

- 프로포즈: `http://localhost:3000`
- 관리자: `http://localhost:3000/admin`

로컬에서 등록한 콘텐츠는 `data/`, 파일은 `public/uploads/`에 저장됩니다. 이 두 경로는 개발 확인용이며 Vercel에서는 Blob을 사용합니다.

## 관리자 사용

`/admin`에서 다음 항목을 수정할 수 있습니다.

- 첫 화면 제목과 실행 문구
- 장면 추가·삭제, 각 장면의 사진·코드·제목·본문
- `Object.freeze()` 선언과 약속 문구
- BGM 파일, 곡명, 아티스트
- LRC 형식의 한국어 번역 가사
- 마지막 사진, 질문, 버튼과 응답 후 문구
- 방문자가 남긴 최종 응답 확인

가사는 `[00:12.50] 번역 문장` 형식으로 한 줄씩 입력하면 재생 시간에 맞춰 강조됩니다. 음원과 번역 가사는 저작권자의 허락 등 필요한 권리를 확보한 자료만 등록하세요. 브라우저 자동 재생 정책 때문에 음악은 방문자가 첫 실행 버튼을 누른 뒤 시작됩니다.

## Vercel과 GitHub Actions 배포

1. Vercel에서 `namyeoungchan/shall-we` 저장소를 새 프로젝트로 연결합니다.
2. 프로젝트의 Storage에서 Public Blob 저장소를 생성하고 프로젝트에 연결합니다. `BLOB_READ_WRITE_TOKEN`이 자동으로 설정됩니다.
3. Vercel 프로젝트 환경 변수에 `ADMIN_PASSWORD`를 Production으로 추가합니다.
4. Vercel 토큰과 프로젝트 정보를 GitHub 저장소의 Actions secrets에 추가합니다.
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
5. `main` 브랜치에 push하면 GitHub Actions가 lint와 build를 통과한 뒤 Vercel Production에 배포합니다. Pull Request에서는 검증만 실행합니다.

Vercel 프로젝트의 `.vercel/project.json`에서 `orgId`, `projectId`를 확인할 수 있고, 로컬에서는 `npx vercel link` 후 생성됩니다. `.vercel` 폴더 자체는 커밋하지 않습니다.

## GitHub Pages 임시 공개

`master` 또는 `main` 브랜치에 push하면 GitHub Actions가 정적 공개 화면을 빌드해 `https://namyeoungchan.github.io/shall-we/`에 배포합니다. GitHub Pages에는 서버가 없으므로 관리자 로그인, 영구 콘텐츠 수정, Blob 업로드와 응답 수집은 제공되지 않습니다. 이 기능들은 Vercel 배포에서 활성화됩니다.

## 검증

```bash
npm run lint
npm run build
npm run pages:build
```
