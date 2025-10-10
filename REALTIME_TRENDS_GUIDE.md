# 🔥 실시간 검색어 TOP 10 기반 블로그 자동화 가이드

## 🎯 개요
IT 주제에 국한되지 않고, **실시간 검색어 TOP 10을 활용하여 다양한 주제**의 블로그 콘텐츠를 자동 생성하는 시스템입니다.

## 🌟 주요 특징

### 1. 다양한 주제 지원
이제 IT/기술뿐만 아니라 다음 분야도 다룹니다:
- 🎬 **엔터테인먼트**: 영화, 음악, 유명인, K-pop
- ⚽ **스포츠**: 경기, 선수, 이벤트
- 📰 **뉴스/시사**: 정치, 사회, 국제
- 💪 **라이프스타일**: 건강, 여행, 음식, 패션
- 💻 **기술**: AI, IT, 소프트웨어
- 🎮 **게이밍**: 게임, e스포츠
- 🎨 **문화/예술**: 전시, 공연, 예술

### 2. 실시간 검색어 TOP 10
다음 소스에서 실시간 트렌드를 수집합니다:
- 네이버 실시간 검색어 (AI 생성)
- Google Trends (글로벌)
- Reddit Hot Topics
- Hacker News
- Twitter/X Trends

### 3. 중복 방지 시스템
- 파일 기반 DB로 사용된 키워드 추적
- 이미 작성한 주제와 유사한 내용 자동 필터링
- 신선한 콘텐츠만 생성

## 📋 시스템 구조

### 1. 키워드 수집 프로세스
```
실시간 검색어 수집 → 중복 제거 → 카테고리 분류 → 우선순위 지정 → TOP 10 선택
```

### 2. 카테고리 균형
각 카테고리에서 균등하게 키워드를 선택하여 다양성 보장:
- Entertainment: 2-3개
- Sports: 1-2개
- Technology: 2-3개
- News/Current Events: 1-2개
- Lifestyle: 1-2개
- Other: 나머지

### 3. 파일 DB 구조
```
data/keywords/
├── used_keywords.json     # 사용된 키워드 목록
└── keyword_history.json   # 키워드 사용 히스토리
```

## 🚀 사용 방법

### 1. 웹 인터페이스 (추천)
```bash
npm run web
```
- `http://localhost:3001` 접속
- 키워드 입력 없이 "생성" 버튼만 클릭
- 자동으로 실시간 검색어에서 키워드 선택
- 또는 직접 키워드 입력 가능

### 2. 명령줄 인터페이스
```bash
# 전체 자동화 (키워드 수집 → 콘텐츠 생성 → Draft 게시)
npm run blog

# 키워드만 수집
npm run keywords
```

### 3. Windows 배치 파일
```bash
# 원클릭 실행
start-blog.bat

# 또는
run-blog.bat
```

## 🎯 콘텐츠 생성 특징

### 1. 주제별 전문성
AI가 주제에 따라 전문가 페르소나를 자동 전환:
- **엔터테인먼트**: 엔터테인먼트 저널리스트
- **스포츠**: 스포츠 애널리스트
- **기술**: 기술 전문가
- **건강**: 건강 및 웰니스 전문가
- **뉴스**: 탐사 저널리스트

### 2. 다양한 이미지 소스
주제에 맞는 고품질 이미지 자동 검색:
- Google Custom Search (모든 주제)
- Unsplash (고품질 사진)
- Pexels (다양한 주제)
- Pixabay (광범위한 컬렉션)

### 3. SEO 최적화
- 주제별 맞춤 키워드
- 적절한 메타 태그
- 구조화된 콘텐츠

## 📊 키워드 수집 예시

### 실행 로그
```
🔥 실시간 검색어 TOP 10 기반 키워드 수집 시작...
📰 네이버 실시간 검색어 수집 중...
✅ 네이버 트렌드 10개 수집
🌐 Google 트렌드 수집 중...
✅ Google 트렌드 10개 수집
🔴 Reddit Hot Topics 수집 중...
✅ Reddit 키워드 8개 수집
📱 Hacker News 수집 중...
✅ Hacker News 키워드 10개 수집
🐦 Twitter/X 트렌드 수집 중...
✅ Twitter 트렌드 10개 수집
✅ 총 48개의 트렌드 키워드 수집 완료
📋 이미 사용된 키워드: 25개
🔍 키워드 필터링 및 우선순위 지정 중...
✅ 10개의 새로운 키워드 발견
✅ 최종 키워드 10개 선택 완료
📊 선택된 키워드: [
  "BTS New Album Release",
  "FIFA World Cup Highlights",
  "iPhone 16 Pro Features",
  "Climate Change Summit",
  "Mediterranean Diet Benefits",
  "Elden Ring DLC",
  "Quantum Computing Breakthrough",
  "Taylor Swift Concert Tour",
  "Stock Market Trends",
  "AI Image Generation"
]
```

## 🔧 설정 옵션

### 1. 카테고리 우선순위 조정
`src/modules/trendKeywordCollector.js`에서 카테고리별 가중치 조정 가능

### 2. 키워드 필터링
- 최소/최대 길이 설정
- 금지 키워드 목록
- 선호 카테고리 설정

### 3. DB 초기화
```bash
# 사용된 키워드 DB 초기화
rm -rf data/keywords/used_keywords.json
```

## 🎉 장점

### 1. 다양성
- ✅ IT에 국한되지 않은 다양한 주제
- ✅ 실시간 트렌드 반영
- ✅ 글로벌 + 로컬 트렌드 균형

### 2. 신선함
- ✅ 항상 최신 트렌드
- ✅ 중복 방지로 신선한 콘텐츠
- ✅ 실시간 검색어 기반

### 3. 효율성
- ✅ 자동 키워드 수집
- ✅ 자동 중복 제거
- ✅ 자동 우선순위 지정

### 4. 품질
- ✅ 주제별 전문 콘텐츠
- ✅ SEO 최적화
- ✅ 고품질 이미지

## 📈 예상 결과

### 이전 (IT만)
- 키워드: AI, 클라우드, 블록체인, 사이버보안...
- 주제: 기술 중심
- 독자: IT 전문가

### 개선 후 (다양한 주제)
- 키워드: BTS, FIFA, iPhone, 지중해 식단, AI...
- 주제: 엔터테인먼트, 스포츠, 기술, 건강, 뉴스...
- 독자: 일반 대중

## 🚨 주의사항

### 1. API 할당량
- 실시간 검색어 수집은 API 호출이 많음
- Gemini API 할당량 확인 필요

### 2. 콘텐츠 검토
- AI 생성 콘텐츠이므로 사실 확인 권장
- 특히 뉴스/시사 주제는 검토 필수

### 3. 저작권
- 이미지는 모두 출처 표기
- 사실 기반 콘텐츠 작성

## 🔗 관련 파일

- `src/modules/trendKeywordCollector.js`: 실시간 검색어 수집
- `src/modules/keywordHarvester.js`: 키워드 관리 및 중복 제거
- `src/utils/prompt_template.js`: 주제별 프롬프트
- `data/keywords/`: 파일 DB

---

**이제 IT뿐만 아니라 모든 트렌드 주제를 다룰 수 있습니다!** 🎉
