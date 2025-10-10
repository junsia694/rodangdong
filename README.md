# 🌐 글로벌 IT/전자 기술 자동화 블로그

**Node.js 기반의 완전 자동화된 글로벌 IT/전자 기술 블로그 시스템**

실시간 트렌드 키워드를 수집하고, **Gemini AI**를 활용하여 고품질 영어 아티클을 생성한 후, **Blogger API**를 통해 자동 발행하는 파이프라인입니다.

## 🚀 주요 기능

- **🤖 AI 콘텐츠 생성**: Gemini API를 사용한 고품질 영어 아티클 자동 생성
- **🔍 트렌드 키워드 수집**: Google Trends, Reddit, Hacker News에서 실시간 키워드 수집
- **📝 자동 발행**: Blogger API를 통한 예약 발행 및 스케줄링
- **🖼️ 이미지 자동 삽입**: Unsplash API를 활용한 고화질 이미지 자동 삽입
- **📊 SEO 최적화**: E-E-A-T 원칙 기반의 검색엔진 최적화
- **🔄 완전 자동화**: GitHub Actions를 통한 3시간마다 자동 실행
- **💾 중복 방지**: 파일 DB 기반 키워드 사용 이력 관리

## 📋 시스템 요구사항

- **Node.js**: 18.0.0 이상
- **API 키**: Gemini API, Google OAuth 2.0 (Blogger), Unsplash (선택사항)
- **GitHub**: Actions 및 Secrets 설정

## 🛠️ 설치 및 설정

### 1. 프로젝트 클론 및 의존성 설치

```bash
git clone <repository-url>
cd global-it-tech-blog-automation
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 정보를 입력하세요:

```env
# 필수 설정
GEMINI_API_KEY=your_gemini_api_key_here
BLOGGER_BLOG_ID=4116188036281914326

# Google OAuth 2.0 (Blogger API용)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_google_refresh_token

# 선택사항
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
NODE_ENV=development
LOG_LEVEL=info
```

### 3. Google OAuth 2.0 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에서 프로젝트 생성
2. Blogger API 활성화
3. OAuth 2.0 클라이언트 ID 생성
4. Refresh Token 획득

### 4. GitHub Actions Secrets 설정

GitHub 저장소의 Settings > Secrets and variables > Actions에서 다음 시크릿을 추가:

- `GEMINI_API_KEY`
- `BLOGGER_BLOG_ID`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`
- `UNSPLASH_ACCESS_KEY` (선택사항)

## 🚀 사용법

### 로컬 실행

```bash
# 전체 키워드 수집 및 처리 (최대 3개)
npm start

# 단일 키워드 처리
npm start -- --mode single --keyword "artificial intelligence"

# 최대 키워드 수 지정
npm start -- --maxKeywords 5

# 개발 모드 (파일 변경 감지)
npm run dev
```

### 스케줄러 사용

```bash
# 스케줄러 시작 (3시간마다 자동 실행)
node src/scheduler.js start

# 즉시 실행
node src/scheduler.js run-now

# 상태 확인
node src/scheduler.js status

# 테스트 실행
node src/scheduler.js test
```

### GitHub Actions

- **자동 실행**: 3시간마다 자동으로 키워드 수집 및 콘텐츠 생성
- **수동 실행**: GitHub Actions 탭에서 "Run workflow" 버튼 클릭
- **로그 확인**: Actions 탭에서 실행 결과 및 로그 확인

## 📁 프로젝트 구조

```
src/
├── config/
│   └── index.js              # 설정 관리
├── modules/
│   ├── fileDb.js             # 파일 기반 데이터베이스
│   ├── keywordHarvester.js   # 키워드 수집 모듈
│   ├── contentGenerator.js   # AI 콘텐츠 생성 모듈
│   └── bloggerPublisher.js   # Blogger 발행 모듈
├── utils/
│   └── prompt_template.js    # AI 프롬프트 템플릿
├── data/                     # 데이터 저장소
├── index.js                  # 메인 애플리케이션
└── scheduler.js              # 스케줄러 모듈
```

## 🎯 콘텐츠 품질 기준

### 필수 요소
- **최소 단어 수**: 1,500 단어
- **이미지 개수**: 최소 2개
- **SEO 메타데이터**: 제목, 설명 포함
- **구조화된 섹션**: 8개 필수 섹션

### 콘텐츠 구조
1. SEO & Meta Information
2. Introduction: The Current Landscape
3. Technical Explanation & Core Concepts
4. Real-World Use Cases (3+ 예시)
5. Comparison & Expert Insights
6. Conclusion (Call to Action)
7. FAQ & Glossary
8. Image Placement Suggestions

## 📊 모니터링 및 로그

### 로그 레벨
- `info`: 일반적인 실행 정보
- `warn`: 경고 메시지
- `error`: 오류 메시지

### 데이터 추적
- 키워드 사용 이력: `src/data/used_keywords.json`
- 실행 로그: `src/logs/`
- GitHub Actions 로그: Actions 탭

## 🔧 설정 커스터마이징

### CRON 스케줄 변경
```javascript
// src/config/index.js
schedule: {
  cronSchedule: '0 */6 * * *', // 6시간마다 실행
  postScheduleHours: 12 // 12시간 후 발행
}
```

### 콘텐츠 품질 기준 조정
```javascript
// src/config/index.js
app: {
  minWordCount: 2000,    // 최소 단어 수
  minImagesCount: 3      // 최소 이미지 수
}
```

## 🚨 문제 해결

### 일반적인 문제

1. **API 키 오류**
   - 환경 변수 확인
   - API 키 유효성 검증

2. **OAuth 인증 실패**
   - Refresh Token 갱신
   - 클라이언트 ID/Secret 확인

3. **콘텐츠 생성 실패**
   - Gemini API 할당량 확인
   - 프롬프트 길이 검증

4. **Blogger 발행 실패**
   - 블로그 ID 확인
   - 권한 설정 검증

### 로그 확인
```bash
# 상세 로그 확인
NODE_ENV=development LOG_LEVEL=debug npm start

# 에러 로그만 확인
npm start 2>&1 | grep ERROR
```

## 📈 성능 최적화

### API 호출 최적화
- 키워드당 지연 시간: 3초
- 배치 처리: 최대 5개 키워드
- 오류 재시도: 3회

### 비용 최적화
- 무료 API 우선 사용
- 중복 키워드 방지
- 효율적인 프롬프트 설계

## 🤝 기여하기

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 지원

문제가 발생하거나 질문이 있으시면 GitHub Issues를 통해 문의해 주세요.

---

**🎉 이제 완전 자동화된 글로벌 IT/전자 기술 블로그를 시작해보세요!**
