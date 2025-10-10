# 🪟 배치 파일 사용법

## 🚀 원클릭 실행 (추천)

### `start-blog.bat` - 가장 간단한 방법
```bash
# 더블클릭 또는 명령어로 실행
start-blog.bat
```
**완전 자동화:**
- ✅ 키워드 추출 (Reddit, Hacker News, Gemini AI)
- ✅ 콘텐츠 생성 (2800+ 단어, 고품질 이미지)
- ✅ 블로그 게시 (Blogger 자동 업로드)
- ✅ 키워드 저장 (중복 방지)

## 📋 다른 배치 파일들

### `auto-blog.bat` - 전체 자동화
```bash
auto-blog.bat
```

### `run-blog.bat` - 메뉴 방식
```bash
run-blog.bat
```

### `quick-blog.bat` - 빠른 실행
```bash
# PowerShell에서는 따옴표 문제가 있을 수 있음
quick-blog.bat "키워드명"

# 대신 npm 명령어 직접 사용 권장
npm run blog-keyword "키워드명"
```

## 🎯 실제 사용법

### 방법 1: 더블클릭 실행 (가장 간단)
1. `start-blog.bat` 파일 더블클릭
2. 완료!

### 방법 2: 명령어 실행
```bash
# CMD에서
start-blog.bat

# PowerShell에서
.\start-blog.bat
```

### 방법 3: npm 명령어 직접 사용 (권장)
```bash
# 전체 프로세스
npm run blog

# 특정 키워드
npm run blog-keyword "blockchain technology"

# 키워드만 추출
npm run keywords
```

## ✅ 테스트 결과

### 성공적인 실행 예시:
```
🎯 단일 키워드 모드: "blockchain technology"

📝 블로그 콘텐츠 생성 중...
✅ 블로그 콘텐츠 생성 완료 (품질: 100/100)

📤 블로그 게시 중...
✅ 블로그 게시 완료: http://rodangdong.blogspot.com/

🎉 단일 키워드 블로그 생성 완료!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 게시된 키워드: blockchain technology
🔗 게시 URL: http://rodangdong.blogspot.com/
📈 품질 점수: 100/100
📏 단어 수: 2721개
🖼️  이미지 수: 2개
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🎉 완료!

이제 Windows에서 배치 파일로 키워드 추출부터 블로그 게시까지 전 과정을 자동화할 수 있습니다!
