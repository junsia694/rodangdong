# 📝 Rodangdong 블로그 자동화 프로젝트 히스토리

## 📋 프로젝트 개요
- **프로젝트명**: Rodangdong Blog Automation
- **목적**: 실시간 트렌드 키워드 기반 자동 블로그 콘텐츠 생성 및 게시
- **기술 스택**: Node.js, Gemini AI, Blogger API, GitHub Actions
- **저장소**: https://github.com/junsia694/rodangdong

---

## 🔐 API 키 및 인증 정보

### 1. Gemini API
- **용도**: 콘텐츠 생성, 번역, 이미지 검색어 생성
- **키 위치**: `.env` 파일의 `GEMINI_API_KEY`
- **발급처**: https://makersuite.google.com/app/apikey

### 2. Google OAuth 2.0 (Blogger API)
- **Client ID**: `.env` 파일의 `GOOGLE_CLIENT_ID`
- **Client Secret**: `.env` 파일의 `GOOGLE_CLIENT_SECRET`
- **Refresh Token**: `.env` 파일의 `GOOGLE_REFRESH_TOKEN`
- **Redirect URI**: `http://localhost:3000/oauth2callback`
- **Scope**: `https://www.googleapis.com/auth/blogger`
- **발급처**: https://console.cloud.google.com/apis/credentials
- **재발급 스크립트**: `npm run quick-oauth`

### 3. Blogger 정보
- **Blog ID**: `4116188036281914326`
- **블로그 URL**: http://rodangdong.blogspot.com/
- **계정**: junsia694@gmail.com

### 4. 이미지 API
- **Unsplash Access Key**: `.env` 파일의 `UNSPLASH_ACCESS_KEY`
- **Pexels API Key**: `.env` 파일의 `PEXELS_API_KEY` (선택)
- **Pixabay API Key**: `.env` 파일의 `PIXABAY_API_KEY` (선택)

---

## 🔧 GitHub 설정

### 저장소 정보
- **원격 저장소**: https://github.com/junsia694/rodangdong.git
- **계정**: junsia694 (junsia694@gmail.com)
- **브랜치**: main

### GitHub Secrets 설정
**필수 Secrets** (Settings → Secrets and variables → Actions):
```
GEMINI_API_KEY=<Gemini API 키>
GOOGLE_CLIENT_ID=<Google OAuth Client ID>
GOOGLE_CLIENT_SECRET=<Google OAuth Client Secret>
GOOGLE_REFRESH_TOKEN=<Google Refresh Token>
BLOGGER_BLOG_ID=4116188036281914326
UNSPLASH_ACCESS_KEY=<Unsplash API 키>
```

**선택 Secrets**:
```
PEXELS_API_KEY=<Pexels API 키>
PIXABAY_API_KEY=<Pixabay API 키>
```

### GitHub Actions 워크플로우
- **파일**: `.github/workflows/auto-blog-post.yml`
- **실행 방식**: 
  - 자동 실행: 매 3시간마다 (UTC 00:17, 03:49, 06:17, 09:49, 12:17, 15:49, 18:17, 21:49)
  - 수동 실행: GitHub Actions 탭에서 "Run workflow" 클릭
- **권한**: `permissions: contents: write` (저장소 푸시 권한)

---

## 📂 프로젝트 구조

```
rodangdong/
├── .env                          # 환경 변수 (Git 제외)
├── .gitignore                    # Git 제외 파일 목록
├── package.json                  # Node.js 의존성
├── PRD.md                        # 프로젝트 요구사항 문서
├── API_KEYS_SETUP.md             # API 키 설정 가이드
├── GITHUB_SETUP.md               # GitHub 설정 가이드
├── GITHUB_ACTIONS_GUIDE.md       # GitHub Actions 가이드
├── History.md                    # 프로젝트 히스토리 (이 파일)
│
├── .github/
│   └── workflows/
│       └── auto-blog-post.yml    # GitHub Actions 워크플로우
│
├── src/
│   ├── config/
│   │   └── index.js              # 전역 설정
│   ├── modules/
│   │   ├── bloggerPublisher.js   # Blogger API 게시
│   │   ├── contentGenerator.js   # Gemini AI 콘텐츠 생성
│   │   ├── fileDb.js             # 파일 기반 키워드 DB
│   │   ├── imageSearcher.js      # 다중 소스 이미지 검색
│   │   ├── keywordHarvester.js   # 키워드 수집 및 관리
│   │   └── trendKeywordCollector.js  # 실시간 트렌드 수집
│   ├── utils/
│   │   └── prompt_template.js    # Gemini AI 프롬프트 템플릿
│   └── web-server.js             # 로컬 웹 UI 서버
│
├── scripts/
│   ├── github-actions-blog.js    # GitHub Actions 자동화 스크립트
│   ├── run-blog-automation.js    # CLI 자동화 스크립트
│   ├── quick-oauth.js            # OAuth Refresh Token 발급
│   └── new-oauth.js              # 새로운 OAuth 설정
│
├── public/
│   └── index.html                # 로컬 웹 UI (React 없이 순수 HTML/JS)
│
├── data/
│   └── keywords/
│       ├── used_keywords.json    # 사용된 키워드 DB
│       └── .gitkeep              # Git 디렉토리 추적용
│
└── generated-content/
    └── tistory/
        └── *.html                # 티스토리용 HTML 파일들
```

---

## 🚀 주요 기능

### 1. 실시간 키워드 수집
**수집 소스 (6개):**
- ✅ 네이버 트렌드 (Gemini AI 기반)
- ✅ Google 트렌드 (Gemini AI 기반)
- ✅ Hacker News (Firebase API)
- ❌ Reddit (403 에러로 비활성화)
- ✅ TechCrunch 스타일 (Gemini AI 기반)
- ✅ Product Hunt 스타일 (Gemini AI 기반)

**수집 개수:**
- 소스당 5개씩 수집
- 총 30개 중복 제거
- 최종 20개 반환

### 2. 키워드 필터링
**기술 키워드 카테고리:**
- AI/ML: ai, chatgpt, gpt, claude, gemini, llm, transformer
- IT 일반: it, tech, technology, digital, innovation, startup, saas
- 소프트웨어: software, program, application, platform, framework
- 하드웨어: nvidia, intel, amd, chip, processor, gpu, cpu, semiconductor
- 클라우드: aws, azure, gcp, cloud, devops, kubernetes, docker
- 보안: security, cybersecurity, hack, vulnerability, encryption
- 데이터: database, analytics, big data, sql, nosql
- 웹/모바일: web, mobile, ios, android, app, frontend, backend
- 네트워크: network, internet, wifi, 5g, protocol
- 게임: gaming, game, console, esports, streaming

**금융 키워드 카테고리:**
- 암호화폐: bitcoin, ethereum, crypto, cryptocurrency, defi
- 주식/투자: stock, trading, invest, portfolio, market, etf
- 금융 기술: fintech, payment, banking, wallet, staking
- 경제: economy, inflation, interest rate, fed, recession

**필터링 조건:**
- 키워드 길이: 5~150자
- 유사도 임계값: 70% (완화됨)
- 일반 키워드 제외: "AI and Machine Learning" 등

### 3. 콘텐츠 생성
**Gemini AI 활용:**
- 영어 콘텐츠 생성 (2000+ 단어)
- 한국어 번역
- SEO 최적화 (E-E-A-T 원칙)
- 이미지 검색어 생성 (2개 이상)
- 품질 점수 계산 (80점 이상)

**콘텐츠 구조:**
- 자유로운 섹션 타이틀 (템플릿 없음)
- H2 섹션 6~8개
- 이미지 2개 이상 (Unsplash/Pexels/Pixabay)
- 메타 정보 제거 (AI 작성 멘트 없음)

### 4. 블로그 게시
**로컬 웹 UI (`npm run web`):**
- Draft 모드로 게시
- 수동 검토 후 공개

**GitHub Actions (자동):**
- 즉시 게시 (isDraft = false)
- 3시간마다 자동 실행
- 하루 8회 게시

**티스토리 지원:**
- HTML 파일 자동 생성
- GitHub Artifacts 업로드
- 인라인 스타일 최적화

---

## 🔄 워크플로우

### 로컬 개발 워크플로우
```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
cp .env.example .env
# .env 파일 편집 (API 키 입력)

# 3. OAuth Refresh Token 발급
npm run quick-oauth

# 4. 웹 UI 실행
npm run web
# 브라우저에서 http://localhost:3001 접속

# 5. CLI 자동화 실행
npm run blog
```

### GitHub Actions 워크플로우
```
1️⃣ 스케줄/수동 트리거
2️⃣ 실시간 키워드 수집 (6개 소스)
3️⃣ 키워드 필터링 (기술+금융)
4️⃣ 새로운 키워드 1개 선택
5️⃣ Gemini AI 콘텐츠 생성
6️⃣ 한국어 번역
7️⃣ Blogger 즉시 게시
8️⃣ 티스토리 HTML 생성
9️⃣ 키워드 DB 업데이트 및 커밋
```

---

## 📊 주요 개선 이력

### 2025-10-10 (최종 버전)
1. **GitHub Actions 즉시 게시 모드로 변경**
   - Draft 모드 → 즉시 게시 (isDraft = false)
   - 로컬 웹 UI는 Draft 유지

2. **키워드 필터링 조건 대폭 완화**
   - 유사도: 50% → 70%
   - 키워드 길이: 10~100자 → 5~150자
   - 반환 개수: 10개 → 20개

3. **IT/소프트웨어 키워드 추가**
   - IT 일반, 소프트웨어, 네트워크, 게임 카테고리 추가
   - 키워드 패턴 100개 이상 추가

4. **새로운 키워드 소스 추가**
   - TechCrunch 스타일 (Gemini AI)
   - Product Hunt 스타일 (Gemini AI)
   - 총 6개 소스로 확장

5. **수집 개수 증가**
   - 소스당: 3개 → 5개
   - 총 수집: 15개 → 30개
   - 최종 반환: 10개 → 20개

### 이전 주요 개선
- Draft 모드 구현
- 웹 UI 구축 (실시간 검색어 TOP 10)
- 티스토리 HTML 생성
- 이미지 다중 소스 검색
- 일반/유사 키워드 필터링
- 자유로운 섹션 타이틀 생성
- 메타 정보 제거

---

## 🐛 알려진 이슈

### 1. Reddit API 403 에러
**문제**: Reddit API가 403 Forbidden 반환  
**원인**: User-Agent 헤더 부족 또는 Rate Limit  
**해결**: 다른 5개 소스로 충분한 키워드 수집 가능  
**향후 개선**: User-Agent 헤더 추가 또는 Reddit API 키 사용

### 2. Blogger API 403 에러 (과거)
**문제**: Blogger API 권한 오류  
**해결 완료**: 
- Google Cloud Console OAuth 설정 확인
- Refresh Token 재발급
- GitHub Actions에 `permissions: contents: write` 추가

### 3. 키워드 수집 부족 (과거)
**문제**: 최종 키워드 2~3개만 선택됨  
**해결 완료**:
- 필터링 조건 완화
- IT/소프트웨어 키워드 추가
- 수집 소스 2개 추가 (TechCrunch, Product Hunt)
- 수집 개수 3배 증가

---

## 📚 참고 문서

### 프로젝트 문서
- `PRD.md`: 프로젝트 요구사항 정의서
- `API_KEYS_SETUP.md`: API 키 설정 가이드
- `GITHUB_SETUP.md`: GitHub 저장소 설정 가이드
- `GITHUB_ACTIONS_GUIDE.md`: GitHub Actions 사용 가이드

### 외부 문서
- **Blogger API**: https://developers.google.com/blogger
- **Gemini API**: https://ai.google.dev/docs
- **Unsplash API**: https://unsplash.com/documentation
- **Pexels API**: https://www.pexels.com/api/documentation/
- **Pixabay API**: https://pixabay.com/api/docs/
- **Hacker News API**: https://github.com/HackerNews/API

---

## 💡 유용한 명령어

### 로컬 개발
```bash
# 웹 UI 실행
npm run web

# CLI 자동화 실행
npm run blog

# OAuth Refresh Token 재발급
npm run quick-oauth

# Draft 상태 확인
node scripts/check-draft-status.js
```

### Git 관리
```bash
# 상태 확인
git status

# 변경사항 커밋
git add .
git commit -m "메시지"
git push origin main

# 원격 변경사항 가져오기
git pull origin main
```

### GitHub Actions
```bash
# 수동 실행
# GitHub 웹사이트 → Actions → Auto Blog Post → Run workflow

# 로그 확인
# GitHub 웹사이트 → Actions → 실행된 워크플로우 선택

# Artifacts 다운로드
# Actions → 워크플로우 → Artifacts → tistory-html-XXX 다운로드
```

---

## 🎯 향후 개선 계획

### 단기 (1개월)
- [ ] Reddit API User-Agent 헤더 추가
- [ ] 키워드 DB 정리 기능 (30일 이상 지난 키워드 제거)
- [ ] 이미지 품질 검증 (404 에러 체크)
- [ ] 콘텐츠 품질 점수 임계값 설정

### 중기 (3개월)
- [ ] 티스토리 자동 게시 API 연동
- [ ] 다중 블로그 플랫폼 지원 (Medium, Velog 등)
- [ ] 키워드 인기도 추적 및 분석
- [ ] 콘텐츠 A/B 테스트

### 장기 (6개월)
- [ ] 사용자 피드백 기반 콘텐츠 개선
- [ ] 멀티 언어 지원 (일본어, 중국어)
- [ ] 자동 이미지 생성 (Stable Diffusion)
- [ ] SEO 성과 분석 대시보드

---

## 📞 연락처 및 지원

- **GitHub Issues**: https://github.com/junsia694/rodangdong/issues
- **이메일**: junsia694@gmail.com
- **블로그**: http://rodangdong.blogspot.com/

---

## 📄 라이센스

이 프로젝트는 개인 용도로 개발되었습니다.

---

**마지막 업데이트**: 2025-10-10  
**버전**: 1.0.0  
**작성자**: AI Assistant & junsia694

