# 🔑 API 키 설정 가이드

## 📋 필요한 API 키들

### 1. Gemini API (필수)
- **용도**: 콘텐츠 생성 및 이미지 검색어 생성
- **설정**: `.env` 파일에 추가
```env
GEMINI_API_KEY=your_gemini_api_key
```

### 2. Pexels API (추천)
- **용도**: 고품질 무료 이미지 검색
- **설정**: `.env` 파일에 추가
```env
PEXELS_API_KEY=your_pexels_api_key
```
- **가입**: https://www.pexels.com/api/
- **무료 할당량**: 월 200회 요청
- **특징**: Unsplash와 유사한 고품질 이미지, Attribution 불필요

### 3. Pixabay API (추천)
- **용도**: 기술 관련 이미지 및 일러스트레이션
- **설정**: `.env` 파일에 추가
```env
PIXABAY_API_KEY=your_pixabay_api_key
```
- **가입**: https://pixabay.com/api/docs/
- **무료 할당량**: 시간당 500회 요청
- **특징**: 기술/비즈니스 이미지 풍부, 상업적 사용 가능

### 4. Google OAuth (필수)
- **용도**: Blogger API 접근
- **설정**: `.env` 파일에 추가
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token
BLOGGER_BLOG_ID=your_blog_id
```

## 🎯 이미지 검색 우선순위

1. **Pexels API** - 고품질 이미지, Attribution 불필요
2. **Pixabay API** - 기술 관련 이미지 풍부
3. **Unsplash Source API** - 무료, API 키 불필요
4. **기본 이미지** - 최후의 수단

## 📝 .env 파일 예시

```env
# Gemini API (필수)
GEMINI_API_KEY=your_gemini_api_key_here

# Google OAuth (필수)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REFRESH_TOKEN=your_refresh_token_here
BLOGGER_BLOG_ID=your_blog_id_here

# 이미지 API (선택사항, 권장)
PEXELS_API_KEY=your_pexels_api_key_here
PIXABAY_API_KEY=your_pixabay_api_key_here
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
```

## 🚀 API 키 없이도 사용 가능

- **Gemini API**: 콘텐츠 생성용 (필수)
- **Google OAuth**: Blogger 게시용 (필수)
- **이미지 API들**: 설정하지 않으면 Unsplash Source API 사용

## 💡 팁

1. **Pexels API 키 설정**: 가장 고품질의 이미지를 얻을 수 있습니다
2. **Pixabay API 키 설정**: 기술 관련 이미지가 풍부합니다
3. **모든 API 키 설정**: 최고의 이미지 다양성과 품질을 보장합니다
