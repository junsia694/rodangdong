# 🚀 GitHub 저장소 설정 가이드

## 📦 GitHub 저장소 정보
**저장소 URL**: https://github.com/junsia694/rodangdong.git

## 🔧 초기 설정 (최초 1회)

### 1. Git 초기화 및 원격 저장소 연결

```bash
# Git 초기화 (이미 되어있으면 생략)
git init

# 원격 저장소 추가
git remote add origin https://github.com/junsia694/rodangdong.git

# 원격 저장소 확인
git remote -v
```

### 2. .gitignore 확인

`.gitignore` 파일이 다음을 포함하는지 확인:
```
node_modules/
.env
.env.oauth
generated-content/*.md
generated-content/*.html
!generated-content/tistory/
*.log
.DS_Store
```

### 3. 첫 번째 커밋 및 푸시

```bash
# 파일 추가
git add .

# 커밋
git commit -m "Initial commit: Blog automation system with GitHub Actions"

# 푸시 (main 브랜치)
git branch -M main
git push -u origin main
```

## 🔐 GitHub Secrets 설정

### GitHub 웹사이트에서 설정

1. **저장소 접속**: https://github.com/junsia694/rodangdong
2. **Settings** 탭 클릭
3. **Secrets and variables** → **Actions** 클릭
4. **New repository secret** 클릭

### 추가할 Secrets

#### 필수 Secrets
```
Name: GEMINI_API_KEY
Value: [당신의 Gemini API 키]

Name: GOOGLE_CLIENT_ID
Value: [당신의 Google OAuth Client ID]

Name: GOOGLE_CLIENT_SECRET
Value: [당신의 Google OAuth Client Secret]

Name: GOOGLE_REFRESH_TOKEN
Value: [당신의 Google Refresh Token]

Name: BLOGGER_BLOG_ID
Value: 4116188036281914326

Name: UNSPLASH_ACCESS_KEY
Value: [당신의 Unsplash Access Key]
```

#### 선택 Secrets (이미지 다양성 향상)
```
Name: PEXELS_API_KEY
Value: [당신의 Pexels API Key]

Name: PIXABAY_API_KEY
Value: [당신의 Pixabay API Key]
```

## ⚙️ GitHub Actions 활성화

### 1. Actions 탭 확인

1. GitHub 저장소 → **Actions** 탭
2. "I understand my workflows, go ahead and enable them" 클릭
3. **Auto Blog Post** 워크플로우 확인

### 2. 첫 번째 수동 실행 (테스트)

1. Actions 탭 → **Auto Blog Post** 선택
2. **Run workflow** 버튼 클릭
3. **Run workflow** 확인
4. 실행 결과 대기 (약 3-5분)

### 3. 실행 결과 확인

**성공 시:**
- ✅ 녹색 체크마크
- 📋 Artifacts에 티스토리 HTML 파일
- 💾 키워드 DB 자동 커밋

**실패 시:**
- ❌ 빨간색 X
- 📝 로그 확인
- 🔧 에러 메시지 분석

## 📅 자동 실행 스케줄

### 설정된 스케줄 (UTC 기준)
```yaml
# UTC 시간 (한국 시간 - 9시간)
- cron: '17 0 * * *'   # UTC 00:17 → KST 09:17
- cron: '49 3 * * *'   # UTC 03:49 → KST 12:49
- cron: '17 6 * * *'   # UTC 06:17 → KST 15:17
- cron: '49 9 * * *'   # UTC 09:49 → KST 18:49
- cron: '17 12 * * *'  # UTC 12:17 → KST 21:17
- cron: '49 15 * * *'  # UTC 15:49 → KST 00:49 (다음날)
- cron: '17 18 * * *'  # UTC 18:17 → KST 03:17 (다음날)
- cron: '49 21 * * *'  # UTC 21:49 → KST 06:49 (다음날)
```

**→ 한국 시간 기준: 09:17, 12:49, 15:17, 18:49, 21:17, 00:49, 03:17, 06:49**

### 스케줄 수정 (한국 시간 기준으로)

한국 시간 기준으로 정확히 맞추려면 `.github/workflows/auto-blog-post.yml` 수정:

```yaml
schedule:
  # 한국 시간 00:17 = UTC 15:17 (전날)
  - cron: '17 15 * * *'
  # 한국 시간 03:49 = UTC 18:49 (전날)
  - cron: '49 18 * * *'
  # 한국 시간 06:17 = UTC 21:17 (전날)
  - cron: '17 21 * * *'
  # 한국 시간 09:49 = UTC 00:49
  - cron: '49 0 * * *'
  # 한국 시간 12:17 = UTC 03:17
  - cron: '17 3 * * *'
  # 한국 시간 15:49 = UTC 06:49
  - cron: '49 6 * * *'
  # 한국 시간 18:17 = UTC 09:17
  - cron: '17 9 * * *'
  # 한국 시간 21:49 = UTC 12:49
  - cron: '49 12 * * *'
```

## 📥 티스토리 HTML 다운로드

### GitHub Artifacts 다운로드

1. **Actions 탭** → 실행된 워크플로우 선택
2. **Artifacts** 섹션에서 **tistory-html-XXX** 클릭
3. ZIP 파일 다운로드
4. 압축 해제 → HTML 파일 확인

### 티스토리에 게시

1. 티스토리 관리자 → **글쓰기**
2. 에디터에서 **HTML** 모드로 전환
3. 다운로드한 HTML 파일 열기
4. 내용 전체 복사 (Ctrl+A, Ctrl+C)
5. 티스토리 에디터에 붙여넣기 (Ctrl+V)
6. **미리보기** 확인
7. **게시** 또는 **발행**

## 🔍 모니터링 및 관리

### Actions 로그 확인

```
🚀 GitHub Actions 블로그 자동화 시작...
⏰ 실행 시간: 2025-01-03T09:17:00+09:00
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 1단계: 새로운 키워드 선택 중...
✅ 선택된 키워드: "NVIDIA H200 GPU Benchmark"

📝 2단계: 블로그 콘텐츠 생성 중...
✅ 콘텐츠 생성 완료

🌐 3단계: 한국어 번역 중...
✅ 번역 완료

📤 4단계: Blogger Draft 게시 중...
✅ Blogger Draft 게시 완료

📋 5단계: 티스토리 HTML 파일 생성 중...
✅ 티스토리 HTML 파일 생성 완료

💾 6단계: 키워드 저장 중...
✅ 키워드 저장 완료

🎉 블로그 자동화 완료!
```

### 키워드 DB 확인

```bash
# 로컬에서 확인
cat data/keywords/used_keywords.json

# 또는 GitHub에서 확인
# 저장소 → data/keywords/used_keywords.json
```

## 🚨 문제 해결

### Workflow가 실행되지 않아요
1. Actions 탭 확인
2. Workflow 활성화 상태 확인
3. Secrets 설정 확인

### Secret 에러
```
Error: Secret GEMINI_API_KEY not found
```
→ GitHub Secrets 재확인 및 재설정

### 권한 에러
```
Error: Permission denied
```
→ GITHUB_TOKEN 권한 확인 (Settings → Actions → General → Workflow permissions)

### Blogger 403 에러
→ Refresh Token 재발급 필요
```bash
npm run quick-oauth
# 새로운 토큰을 GitHub Secret에 업데이트
```

## 🎯 다음 단계

### 1. 로컬 테스트
```bash
# GitHub Actions 스크립트 로컬 테스트
node scripts/github-actions-blog.js
```

### 2. 첫 번째 자동 게시 확인
- Actions 탭에서 실행 확인
- Blogger에서 Draft 확인
- Artifacts에서 티스토리 HTML 다운로드

### 3. 정기 모니터링
- 매일 Actions 실행 확인
- 품질 점수 모니터링
- 키워드 다양성 확인

---

## 📊 예상 운영 시나리오

### 첫째 날
- 09:17 - "NVIDIA H200 GPU" 게시
- 12:49 - "ChatGPT-5 API" 게시
- 15:17 - "Bitcoin ETF Approval" 게시
- ... (하루 8개)

### 한 달 후
- 총 240개 Draft 게시
- 티스토리용 HTML 240개 파일
- 자동 운영 완성

---

**이제 GitHub Actions가 자동으로 블로그를 운영합니다!** 🎉

**저장소**: https://github.com/junsia694/rodangdong.git
