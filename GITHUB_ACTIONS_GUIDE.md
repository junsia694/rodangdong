# 🤖 GitHub Actions 자동 블로그 게시 가이드

## 🎯 개요
GitHub Actions를 사용하여 **3시간마다 자동으로** 블로그 콘텐츠를 생성하고 게시하는 시스템입니다.

## ⏰ 게시 스케줄

### 자동 실행 시간
매일 3시간마다 17분 또는 49분에 실행:
- **00:17** (오전 12시 17분)
- **03:49** (오전 3시 49분)
- **06:17** (오전 6시 17분)
- **09:49** (오전 9시 49분)
- **12:17** (오후 12시 17분)
- **15:49** (오후 3시 49분)
- **18:17** (오후 6시 17분)
- **21:49** (오후 9시 49분)

**→ 하루 8회 자동 게시**

## 🔧 설정 방법

### 1. GitHub Secrets 설정

GitHub 저장소 → Settings → Secrets and variables → Actions → New repository secret

다음 Secrets를 추가하세요:

```
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_google_refresh_token
BLOGGER_BLOG_ID=your_blog_id
UNSPLASH_ACCESS_KEY=your_unsplash_key
PEXELS_API_KEY=your_pexels_key (선택사항)
PIXABAY_API_KEY=your_pixabay_key (선택사항)
```

### 2. GitHub Actions 활성화

1. GitHub 저장소 → Actions 탭
2. "I understand my workflows, go ahead and enable them" 클릭
3. "Auto Blog Post" 워크플로우 확인

### 3. 수동 실행 테스트

1. Actions 탭 → "Auto Blog Post" 선택
2. "Run workflow" 클릭
3. 실행 결과 확인

## 📋 자동화 프로세스

### 1단계: 키워드 선택
- 실시간 검색어 TOP 10 수집
- 사용하지 않은 키워드 필터링
- 일반적/유사한 키워드 배제
- **새로운 키워드 1개 선택**

### 2단계: 콘텐츠 생성
- Gemini AI로 고품질 영어 콘텐츠 생성
- 자연스러운 섹션 타이틀 (템플릿 없음)
- 고품질 이미지 2개 이상
- 품질 점수 80점 이상

### 3단계: 한국어 번역
- 전체 콘텐츠 한국어 번역
- 기술 용어 적절히 처리
- 메타 멘트 제거

### 4단계: Blogger 게시
- Draft 상태로 안전하게 게시
- Blogger에서 검토 후 수동으로 공개

### 5단계: 티스토리 HTML 생성
- 한국어 버전 HTML 파일 생성
- `generated-content/tistory/` 폴더에 저장
- GitHub Actions Artifacts에 업로드

### 6단계: 키워드 저장
- 사용된 키워드 DB에 저장
- Git 커밋 및 푸시
- 다음 실행 시 중복 방지

## 📁 생성되는 파일

### 티스토리 HTML
```
generated-content/tistory/
├── 2025-01-03_chatgpt_5_release.html
├── 2025-01-03_nvidia_h200_gpu.html
└── 2025-01-03_bitcoin_etf.html
```

### 파일명 형식
```
{날짜}_{키워드}.html
예: 2025-01-03_apple_intelligence_ios18.html
```

## 📥 티스토리 HTML 다운로드

### GitHub Actions에서 다운로드
1. Actions 탭 → 실행된 워크플로우 선택
2. Artifacts 섹션에서 "tistory-html-XXX" 다운로드
3. ZIP 압축 해제
4. HTML 파일 확인

### 티스토리에 게시
1. 티스토리 관리자 → 글쓰기
2. HTML 모드로 전환
3. 다운로드한 HTML 파일 내용 복사
4. 붙여넣기 → 게시

## 🎯 키워드 선택 전략

### 일반적인 키워드 배제
❌ 제외되는 키워드:
- "AI and Machine Learning"
- "Cloud and DevOps"
- "Cybersecurity"
- "FinTech and Digital Banking"

✅ 허용되는 키워드:
- "ChatGPT-5 Release Date"
- "Samsung Galaxy S25 Ultra"
- "NVIDIA H200 GPU Benchmark"
- "Bitcoin ETF Approval"

### 유사도 검사
- 이미 사용한 키워드와 50% 이상 유사하면 제외
- 단어 기반 유사도 계산
- 신선한 콘텐츠만 생성

## 🔍 모니터링

### Actions 탭에서 확인
- 실행 시간
- 선택된 키워드
- 생성된 콘텐츠 품질
- 에러 로그

### 실행 결과 예시
```
🚀 GitHub Actions 블로그 자동화 시작...
⏰ 실행 시간: 2025-01-03T00:17:00Z
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 1단계: 새로운 키워드 선택 중...
✅ 선택된 키워드: "NVIDIA H200 GPU Benchmark"

📝 2단계: 블로그 콘텐츠 생성 중...
✅ 콘텐츠 생성 완료
   - 제목: NVIDIA H200: The AI Acceleration Revolution
   - 단어 수: 2847개
   - 이미지 수: 2개
   - 품질 점수: 95/100

🌐 3단계: 한국어 번역 중...
✅ 번역 완료
   - 한글 제목: NVIDIA H200: AI 가속의 혁명

📤 4단계: Blogger Draft 게시 중...
✅ Blogger Draft 게시 완료
   - Post ID: 1234567890
   - Draft URL: Draft 상태

📋 5단계: 티스토리 HTML 파일 생성 중...
✅ 티스토리 HTML 파일 생성 완료
   - 파일 경로: /workspace/generated-content/tistory/2025-01-03_nvidia_h200_gpu.html

💾 6단계: 키워드 저장 중...
✅ 키워드 저장 완료

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 블로그 자동화 완료!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 키워드: NVIDIA H200 GPU Benchmark
🔗 Blogger URL: Draft 상태
📄 티스토리 HTML: /workspace/generated-content/tistory/2025-01-03_nvidia_h200_gpu.html
📈 품질 점수: 95/100
📏 단어 수: 2847개
🖼️  이미지 수: 2개
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🚨 주의사항

### API 할당량
- Gemini API: 매일 할당량 확인
- 하루 8회 실행 = 8개 콘텐츠 생성
- 필요시 스케줄 조정

### 저장소 크기
- 티스토리 HTML 파일이 누적됨
- Artifacts는 30일 후 자동 삭제
- 필요시 오래된 파일 정리

### Draft 검토
- Blogger에 Draft로 저장됨
- 수동으로 검토 후 게시 필요
- 품질 확인 권장

## 🔧 커스터마이징

### 게시 시간 변경
`.github/workflows/auto-blog-post.yml` 파일의 cron 수정:
```yaml
schedule:
  - cron: '17 0 * * *'  # 0시 17분
  - cron: '49 3 * * *'  # 3시 49분
  # 원하는 시간 추가...
```

### 키워드 개수 변경
`scripts/github-actions-blog.js`에서 수정:
```javascript
// 첫 번째 키워드 대신 여러 개 선택
return allKeywords.slice(0, 3); // 3개 선택
```

## 📊 예상 결과

### 하루 운영
- **게시 횟수**: 8회
- **Blogger Draft**: 8개
- **티스토리 HTML**: 8개 파일
- **키워드 DB**: 자동 업데이트

### 한 달 운영
- **총 게시**: 240개 Draft
- **티스토리 HTML**: 240개 파일
- **다양한 주제**: 기술 + 금융

## 🎉 장점

1. **완전 자동화**: 손 안 대도 됨
2. **정기적 게시**: 3시간마다
3. **품질 보장**: 80점 이상
4. **중복 방지**: 파일 DB 관리
5. **티스토리 지원**: HTML 자동 생성
6. **Draft 안전성**: 검토 후 게시

---

**이제 GitHub Actions가 자동으로 블로그를 운영합니다!** 🚀
