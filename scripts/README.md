# 🚀 블로그 자동화 실행 가이드

로컬에서 키워드 추출부터 블로그 작성까지 한 번에 실행할 수 있는 스크립트입니다.

## 📋 사용 가능한 명령어

### 1. 전체 프로세스 실행
```bash
npm run blog
```
- 키워드 추출 → 콘텐츠 생성 → 블로그 게시까지 자동 실행
- 새로운 키워드를 찾아서 첫 번째 키워드로 블로그 생성

### 2. 특정 키워드로 블로그 생성
```bash
npm run blog-keyword "AI automation tools"
npm run blog-keyword "quantum computing"
npm run blog-keyword "cybersecurity trends"
```

### 3. 키워드만 추출
```bash
npm run keywords
```
- 새로운 키워드들을 찾아서 목록만 출력
- 실제 블로그는 생성하지 않음

### 4. 직접 스크립트 실행
```bash
# 전체 프로세스
node scripts/run-blog-automation.js

# 특정 키워드
node scripts/run-blog-automation.js --keyword "5G network technology"

# 키워드만 추출
node scripts/run-blog-automation.js --keywords-only

# 도움말
node scripts/run-blog-automation.js --help
```

## 🎯 사용 예시

### 예시 1: 새로운 키워드로 자동 블로그 생성
```bash
npm run blog
```
**결과:**
- 🔍 Reddit, Hacker News, Gemini에서 키워드 수집
- 🆕 새로운 키워드 필터링
- 📝 첫 번째 키워드로 고품질 블로그 생성
- 📤 Blogger에 자동 게시
- 💾 사용된 키워드 저장

### 예시 2: 원하는 키워드로 블로그 생성
```bash
npm run blog-keyword "machine learning trends 2025"
```
**결과:**
- 📝 "machine learning trends 2025" 키워드로 블로그 생성
- 📤 Blogger에 자동 게시
- 💾 키워드 저장

### 예시 3: 새로운 키워드 확인
```bash
npm run keywords
```
**결과:**
```
📋 수집된 모든 키워드:
  1. AI automation tools
  2. quantum computing applications
  3. cybersecurity trends
  4. 5G network technology
  5. edge computing security

🆕 새로운 키워드:
  1. AI automation tools
  2. quantum computing applications

💡 사용법:
  node scripts/run-blog-automation.js --keyword "AI automation tools"
```

## 🔧 설정 확인

실행 전에 다음 설정이 올바른지 확인하세요:

1. **환경 변수 설정** (`.env` 파일):
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REFRESH_TOKEN=your_refresh_token
   BLOGGER_BLOG_ID=your_blog_id
   ```

2. **OAuth 토큰 설정** (필요시):
   ```bash
   npm run quick-oauth
   ```

## 📊 출력 예시

### 성공적인 실행 결과:
```
🚀 블로그 자동화 전체 프로세스 시작...

📊 1단계: 키워드 수집 중...
✅ 5개의 키워드 수집 완료

🔍 2단계: 새로운 키워드 필터링 중...
✅ 3개의 새로운 키워드 발견

📝 3단계: "AI automation tools" 키워드로 블로그 생성 중...
✅ 블로그 콘텐츠 생성 완료 (품질: 100/100)

📤 4단계: 블로그 게시 중...
✅ 블로그 게시 완료: http://rodangdong.blogspot.com/

💾 5단계: 사용된 키워드 저장 중...
✅ 키워드 "AI automation tools" 저장 완료

🎉 블로그 자동화 완료!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 수집된 키워드: 5개
🆕 새로운 키워드: 3개
📝 게시된 키워드: AI automation tools
🔗 게시 URL: http://rodangdong.blogspot.com/
📈 품질 점수: 100/100
📏 단어 수: 2750개
🖼️  이미지 수: 2개
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## ⚠️ 주의사항

1. **API 제한**: Gemini API와 Blogger API의 사용 제한을 확인하세요
2. **키워드 중복**: 이미 사용된 키워드는 자동으로 필터링됩니다
3. **이미지 소스**: Unsplash 무료 이미지를 사용하므로 저작권 문제 없음
4. **콘텐츠 품질**: 최소 1500단어, 2개 이미지, 80점 이상 품질 보장

## 🆘 문제 해결

### 일반적인 오류:
- **403 Error**: OAuth 토큰이 만료되었거나 권한이 없음
- **API Key Error**: Gemini API 키가 올바르지 않음
- **Network Error**: 인터넷 연결 확인

### 해결 방법:
```bash
# OAuth 토큰 재설정
npm run quick-oauth

# 환경 변수 확인
cat .env

# 네트워크 연결 테스트
ping google.com
```
