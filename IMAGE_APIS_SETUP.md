# 🖼️ 이미지 API 설정 가이드

## 개요
이미지 다양성과 품질을 위해 여러 이미지 소스를 통합했습니다. 각 API를 설정하면 더 다양한 고품질 이미지를 얻을 수 있습니다.

## 필요한 API 키들

### 1. Google Custom Search API (우선순위 1)
**가장 다양한 이미지 소스**

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "Custom Search API" 활성화
4. "API 및 서비스" > "사용자 인증 정보" > "사용자 인증 정보 만들기" > "API 키"
5. Custom Search Engine 생성: [Google Custom Search](https://cse.google.com/cse/)
6. 검색 엔진 설정에서 "이미지 검색" 활성화
7. 전체 웹 검색 허용

**환경 변수 추가:**
```env
GOOGLE_SEARCH_API_KEY=your_google_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
```

### 2. Unsplash API (우선순위 2)
**고품질 무료 이미지**

1. [Unsplash Developers](https://unsplash.com/developers) 접속
2. 새 애플리케이션 등록
3. Access Key 복사

**환경 변수 추가:**
```env
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
```

### 3. Pexels API (우선순위 3)
**고품질 무료 이미지**

1. [Pexels API](https://www.pexels.com/api/) 접속
2. 무료 계정 생성
3. API Key 복사

**환경 변수 추가:**
```env
PEXELS_API_KEY=your_pexels_api_key_here
```

### 4. Pixabay API (우선순위 4)
**다양한 무료 이미지**

1. [Pixabay API](https://pixabay.com/api/docs/) 접속
2. 무료 계정 생성
3. API Key 복사

**환경 변수 추가:**
```env
PIXABAY_API_KEY=your_pixabay_api_key_here
```

### 5. Flickr API (우선순위 5)
**커뮤니티 이미지**

1. [Flickr API](https://www.flickr.com/services/api/) 접속
2. API Key 신청
3. API Key와 Secret 복사

**환경 변수 추가:**
```env
FLICKR_API_KEY=your_flickr_api_key_here
```

## 완전한 .env 파일 예시

```env
# 기존 설정들...
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token
BLOGGER_BLOG_ID=your_blog_id

# 새로운 이미지 API 키들
GOOGLE_SEARCH_API_KEY=your_google_search_api_key
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
PEXELS_API_KEY=your_pexels_api_key
PIXABAY_API_KEY=your_pixabay_api_key
FLICKR_API_KEY=your_flickr_api_key
```

## 이미지 소스 우선순위

1. **Google Custom Search** - 가장 다양한 소스, 고품질
2. **Unsplash** - 전문적 고품질 이미지
3. **Pexels** - 다양한 주제의 고품질 이미지
4. **Pixabay** - 광범위한 이미지 컬렉션
5. **Flickr** - 커뮤니티 이미지
6. **대체 소스** - Unsplash Source, Picsum 등

## 이미지 다양성 보장

### 1. 랜덤 선택
- 각 소스에서 랜덤하게 이미지 선택
- 시간 기반 시드로 매번 다른 결과

### 2. 중복 방지
- 검색 히스토리 추적
- 동일한 검색어 반복 방지

### 3. 품질 검증
- 이미지 URL 유효성 검사
- 크기 및 형식 확인

### 4. 출처 표기
- 모든 이미지에 출처 정보 표시
- 사진작가 크레딧 포함
- 법적 요구사항 준수

## 사용법

API 키를 설정하지 않아도 기본 동작합니다. 설정된 API 키가 많을수록 더 다양한 고품질 이미지를 얻을 수 있습니다.

### 최소 설정 (권장)
- Google Custom Search API
- Unsplash API

### 완전 설정 (최적)
- 모든 API 키 설정

## 문제 해결

### 이미지가 여전히 반복되는 경우
1. API 키가 올바르게 설정되었는지 확인
2. API 할당량이 초과되지 않았는지 확인
3. 네트워크 연결 상태 확인

### 특정 API 오류
1. API 키 유효성 확인
2. API 할당량 확인
3. 해당 API 문서 참조

## 예상 결과

### 설정 전
- 같은 키워드 → 같은 이미지
- 제한된 이미지 품질
- 출처 정보 부족

### 설정 후
- 같은 키워드 → 매번 다른 이미지
- 고품질 다양한 이미지
- 완전한 출처 표기
- 법적 요구사항 준수

---

**설정 완료 후 웹서버를 재시작하세요!** 🚀
