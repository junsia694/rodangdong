# 🪟 Windows 배치 파일 사용법

## 🚀 원클릭 실행

### `start-blog.bat` - 가장 간단한 실행
```bash
start-blog.bat
```
**한 번의 클릭으로 모든 작업 완료:**
- ✅ 키워드 추출 (Reddit, Hacker News, Gemini AI)
- ✅ 콘텐츠 생성 (2800+ 단어, 고품질 이미지)
- ✅ 블로그 게시 (Blogger 자동 업로드)
- ✅ 키워드 저장 (중복 방지)

## 📋 다른 배치 파일들

### `auto-blog.bat` - 전체 자동화
```bash
auto-blog.bat
```
- 전체 프로세스 자동 실행
- 상세한 진행 상황 표시

### `run-blog.bat` - 메뉴 방식
```bash
run-blog.bat
```
- 대화형 메뉴 제공
- 환경 확인 및 오류 처리
- 도움말 내장

### `quick-blog.bat` - 빠른 실행
```bash
quick-blog.bat "키워드명"
quick-blog.bat keywords
```
- 특정 키워드로 바로 실행
- 키워드만 추출

## 🎯 추천 사용법

### 처음 사용자
1. `start-blog.bat` 실행
2. 환경 설정 확인
3. 자동으로 블로그 생성 완료

### 일상 사용자
1. `start-blog.bat` 더블클릭
2. 완료!

### 고급 사용자
- `run-blog.bat`로 메뉴에서 선택
- `quick-blog.bat`로 특정 키워드 실행

## ⚙️ 사전 준비

### 1. 환경 변수 설정 (.env 파일)
```env
GEMINI_API_KEY=your_api_key
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token
BLOGGER_BLOG_ID=your_blog_id
```

### 2. OAuth 토큰 설정 (필요시)
```bash
npm run quick-oauth
```

## 🎉 완료!

이제 Windows에서 배치 파일 하나로 전체 블로그 자동화를 실행할 수 있습니다!
