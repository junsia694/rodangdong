# 🚀 빠른 시작 가이드

## 3가지 사용 방법

### 1️⃣ 웹 인터페이스 (추천)
**가장 쉽고 편리한 방법**

```bash
npm run web
```

**접속:** `http://localhost:3001`

**기능:**
- 🔥 실시간 검색어 TOP 10 표시
- 📝 키워드 클릭 → 자동 입력
- 🌐 한국어 번역 미리보기
- 📋 티스토리 HTML 복사
- 📝 Draft 저장 / 🚀 즉시 게시 / 🔄 재작성

---

### 2️⃣ 명령줄 (CLI)
**간단한 자동화**

```bash
# 키워드로 블로그 생성 (Draft)
npm run blog-keyword "quantum computing 2025"

# 전체 자동화 (키워드 수집 → 생성 → Draft 게시)
npm run blog

# 키워드만 수집
npm run keywords
```

---

### 3️⃣ GitHub Actions (완전 자동화)
**손 안 대도 되는 완전 자동화**

**설정:**
1. GitHub Secrets 추가 (API 키들)
2. `.github/workflows/auto-blog-post.yml` 확인
3. Actions 탭에서 활성화

**실행:**
- 자동: 3시간마다 (00:17, 03:49, 06:17, ...)
- 수동: Actions 탭 → "Run workflow"

**결과:**
- Blogger에 Draft 자동 게시
- 티스토리 HTML 파일 생성 (Artifacts)
- 사용된 키워드 자동 저장

---

## 📁 주요 파일

### 설정 파일
- `.env`: API 키 설정
- `package.json`: npm 스크립트

### 스크립트
- `src/web-server.js`: 웹 서버
- `scripts/run-blog-automation.js`: CLI 자동화
- `scripts/github-actions-blog.js`: GitHub Actions용

### 가이드
- `WEB_PREVIEW_GUIDE.md`: 웹 UI 사용법
- `GITHUB_ACTIONS_GUIDE.md`: GitHub Actions 설정
- `IMAGE_APIS_SETUP.md`: 이미지 API 설정
- `TISTORY_COPY_GUIDE.md`: 티스토리 사용법

---

## 🎯 권장 사용 시나리오

### 개발/테스트 단계
→ **웹 인터페이스** 사용
- 실시간 미리보기
- 즉시 수정 가능
- 티스토리 테스트

### 수동 운영
→ **명령줄 (CLI)** 사용
- 빠른 실행
- 스크립트 자동화
- 배치 처리

### 완전 자동화
→ **GitHub Actions** 사용
- 정기적 게시
- 손 안 대도 됨
- 안정적 운영

---

## ⚡ 빠른 명령어

```bash
# 웹 서버 시작
npm run web

# 키워드로 블로그 생성
npm run blog-keyword "your keyword"

# 전체 자동화
npm run blog

# OAuth 설정
npm run quick-oauth
```

---

## 🆘 문제 해결

### 웹 서버가 안 열려요
```bash
taskkill /f /im node.exe
npm run web
```

### API 키 에러
- `.env` 파일 확인
- API 키 올바른지 확인

### 이미지가 반복돼요
- `IMAGE_APIS_SETUP.md` 참고
- 추가 이미지 API 키 설정

### Blogger 403 에러
- `npm run quick-oauth` 재실행
- Refresh Token 재발급

---

**더 자세한 내용은 각 가이드 파일을 참고하세요!** 📚
