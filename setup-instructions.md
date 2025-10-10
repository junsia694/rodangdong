# 🚀 블로그 자동화 설정 가이드

이미 다음 정보를 제공해주셨습니다:
- ✅ **Gemini API Key**: `AIzaSyCDqXoE3jbTKQlnSUHJ17Z_orNctN0edVA`
- ✅ **Blog ID**: `4116188036281914326`

이제 **Google OAuth 2.0 설정**만 하면 됩니다!

## 🔑 Google OAuth 2.0 설정 (필수)

### 1단계: Google Cloud Console 프로젝트 생성

1. **Google Cloud Console** 접속: https://console.cloud.google.com/
2. **새 프로젝트 생성**:
   - "프로젝트 만들기" 클릭
   - 프로젝트 이름: `Blog-Automation` 입력
   - "만들기" 클릭

### 2단계: Blogger API 활성화

1. **API 및 서비스** > **라이브러리** 이동
2. **"Blogger API v3"** 검색 후 선택
3. **"사용 설정"** 클릭

### 3단계: OAuth 2.0 클라이언트 ID 생성

1. **API 및 서비스** > **사용자 인증 정보** 이동
2. **"사용자 인증 정보 만들기"** > **"OAuth 클라이언트 ID"** 선택
3. **애플리케이션 유형**: **"데스크톱 애플리케이션"** 선택
4. **이름**: `Blog Automation` 입력
5. **"만들기"** 클릭
6. **Client ID**와 **Client Secret** 복사해서 메모해두세요

### 4단계: Refresh Token 생성

이제 자동화 스크립트를 실행해서 Refresh Token을 생성하세요:

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정 (임시)
export GOOGLE_CLIENT_ID="여기에_Client_ID_입력"
export GOOGLE_CLIENT_SECRET="여기에_Client_Secret_입력"

# 3. Refresh Token 생성 스크립트 실행
npm run setup-oauth
```

스크립트 실행 시:
1. 브라우저가 열리고 Google 로그인 페이지가 나타납니다
2. Google 계정으로 로그인
3. 앱 권한 승인
4. 인증 코드를 복사해서 터미널에 입력

### 5단계: .env 파일 생성

생성된 정보로 `.env` 파일을 만드세요:

```env
# Gemini API Configuration
GEMINI_API_KEY=AIzaSyCDqXoE3jbTKQlnSUHJ17Z_orNctN0edVA

# Blogger API Configuration
BLOGGER_BLOG_ID=4116188036281914326
GOOGLE_CLIENT_ID=여기에_실제_Client_ID_입력
GOOGLE_CLIENT_SECRET=여기에_실제_Client_Secret_입력
GOOGLE_REFRESH_TOKEN=여기에_생성된_Refresh_Token_입력

# Application Configuration
NODE_ENV=development
LOG_LEVEL=info

# Scheduling Configuration
CRON_SCHEDULE=0 */3 * * *
POST_SCHEDULE_HOURS=24

# Content Configuration
MIN_WORD_COUNT=1500
MIN_IMAGES_COUNT=2
```

## 🧪 테스트 실행

설정이 완료되면 테스트해보세요:

```bash
# 단일 키워드로 테스트
npm start -- --mode single --keyword "artificial intelligence"

# 또는 전체 프로세스 테스트
npm start -- --maxKeywords 1
```

## ☁️ GitHub Actions 설정 (선택사항)

GitHub에서 자동 실행하려면:

1. **GitHub 저장소** > **Settings** > **Secrets and variables** > **Actions**
2. 다음 시크릿 추가:
   - `GEMINI_API_KEY`: `AIzaSyCDqXoE3jbTKQlnSUHJ17Z_orNctN0edVA`
   - `BLOGGER_BLOG_ID`: `4116188036281914326`
   - `GOOGLE_CLIENT_ID`: 생성한 Client ID
   - `GOOGLE_CLIENT_SECRET`: 생성한 Client Secret
   - `GOOGLE_REFRESH_TOKEN`: 생성한 Refresh Token

## 🖼️ Unsplash API 설정 (선택사항)

고화질 이미지를 위해:

1. **Unsplash Developers** 접속: https://unsplash.com/developers
2. **New Application** 클릭
3. **Access Key** 복사
4. `.env` 파일에 추가: `UNSPLASH_ACCESS_KEY=your_access_key`

## ✅ 완료 체크리스트

- [ ] Google Cloud Console 프로젝트 생성
- [ ] Blogger API 활성화
- [ ] OAuth 2.0 클라이언트 ID 생성
- [ ] Refresh Token 생성
- [ ] `.env` 파일 설정
- [ ] 테스트 실행
- [ ] GitHub Secrets 설정 (선택사항)
- [ ] Unsplash API 설정 (선택사항)

## 🆘 문제 해결

### "invalid_grant" 오류
- 인증 코드를 정확히 복사했는지 확인
- 인증 코드가 만료되지 않았는지 확인 (10분 이내)
- 다시 시도

### "access_denied" 오류
- Google 계정에서 앱 권한을 승인했는지 확인
- OAuth 동의 화면에서 테스트 사용자로 추가했는지 확인

### API 할당량 초과
- Gemini API 할당량 확인
- 잠시 후 다시 시도

---

🎉 **설정이 완료되면 완전 자동화된 글로벌 IT/전자 기술 블로그가 시작됩니다!**
