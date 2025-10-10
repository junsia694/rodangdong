# 🪟 Windows 배치 파일 실행 가이드

Windows에서 블로그 자동화를 쉽게 실행할 수 있는 배치 파일들을 제공합니다.

## 📁 제공되는 배치 파일들

### 1. `run-blog.bat` - 메인 실행 스크립트
**가장 완전한 기능을 제공하는 대화형 스크립트**

```bash
run-blog.bat
```

**기능:**
- ✅ 환경 확인 (Node.js, npm, package.json, .env)
- 📋 메뉴 기반 실행
- 🔧 자동 오류 처리
- 📖 내장 도움말

**메뉴 옵션:**
1. 전체 프로세스 실행 (키워드 추출 → 블로그 생성 → 게시)
2. 특정 키워드로 블로그 생성
3. 키워드만 추출
4. 도움말 보기
5. 종료

### 2. `quick-blog.bat` - 빠른 실행 스크립트
**명령어 인수로 빠르게 실행**

```bash
# 특정 키워드로 블로그 생성
quick-blog.bat "AI automation"

# 키워드만 추출
quick-blog.bat keywords

# 도움말
quick-blog.bat
```

### 3. `auto-blog.bat` - 전체 자동화
**한 번에 전체 프로세스 실행**

```bash
auto-blog.bat
```

## 🚀 사용 예시

### 예시 1: 대화형 메뉴 사용
```bash
# 1. run-blog.bat 실행
run-blog.bat

# 2. 메뉴에서 선택
# 1번 선택 → 전체 프로세스 실행
# 2번 선택 → 키워드 입력 후 블로그 생성
# 3번 선택 → 키워드만 추출
```

### 예시 2: 빠른 실행
```bash
# 특정 키워드로 바로 실행
quick-blog.bat "machine learning trends"

# 키워드만 추출
quick-blog.bat keywords
```

### 예시 3: 전체 자동화
```bash
# 한 번에 모든 작업 실행
auto-blog.bat
```

## ⚙️ 사전 준비사항

### 1. Node.js 설치 확인
```bash
node --version
npm --version
```

### 2. 프로젝트 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정 (.env 파일)
```env
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token
BLOGGER_BLOG_ID=your_blog_id
```

### 4. OAuth 토큰 설정 (필요시)
```bash
npm run quick-oauth
```

## 🎯 배치 파일별 특징

| 배치 파일 | 용도 | 특징 |
|-----------|------|------|
| `run-blog.bat` | 메인 실행 | 대화형, 완전한 기능, 오류 처리 |
| `quick-blog.bat` | 빠른 실행 | 명령어 인수, 간단한 사용법 |
| `auto-blog.bat` | 전체 자동화 | 한 번에 모든 작업 실행 |

## 🔧 문제 해결

### 일반적인 오류들:

#### 1. "Node.js가 설치되지 않았습니다"
```bash
# 해결: Node.js 설치
# https://nodejs.org 에서 다운로드 및 설치
```

#### 2. "package.json 파일을 찾을 수 없습니다"
```bash
# 해결: 올바른 프로젝트 디렉토리에서 실행
cd C:\Project\Blogger
run-blog.bat
```

#### 3. ".env 파일이 없습니다"
```bash
# 해결: 환경 변수 파일 생성
# .env 파일을 생성하고 API 키들을 설정
```

#### 4. "OAuth 토큰 오류"
```bash
# 해결: OAuth 토큰 재설정
npm run quick-oauth
```

## 📊 실행 결과 예시

### 성공적인 실행:
```
🚀 블로그 자동화 전체 프로세스 시작...

📊 1단계: 키워드 수집 중...
✅ 5개의 새로운 키워드 발견

📝 3단계: "AI automation" 키워드로 블로그 생성 중...
✅ 블로그 콘텐츠 생성 완료 (품질: 100/100)

📤 4단계: 블로그 게시 중...
✅ 블로그 게시 완료: http://rodangdong.blogspot.com/

🎉 블로그 자동화 완료!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 수집된 키워드: 5개
📝 게시된 키워드: AI automation
🔗 게시 URL: http://rodangdong.blogspot.com/
📈 품질 점수: 100/100
📏 단어 수: 2800개
🖼️  이미지 수: 2개
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 💡 팁

1. **첫 실행 시**: `run-blog.bat`로 환경을 확인하고 설정하세요
2. **일상 사용**: `quick-blog.bat`로 빠르게 실행하세요
3. **자동화**: `auto-blog.bat`로 스케줄링하세요
4. **문제 발생 시**: `run-blog.bat`의 도움말을 확인하세요

## 🎉 완료!

이제 Windows에서 배치 파일로 간편하게 블로그 자동화를 실행할 수 있습니다!
