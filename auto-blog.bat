@echo off
chcp 65001 >nul

echo.
echo ========================================
echo    🚀 블로그 자동화 전체 프로세스 실행
echo ========================================
echo.
echo 📋 실행 단계:
echo   1단계: 키워드 추출 (Reddit, Hacker News, Gemini AI)
echo   2단계: 콘텐츠 생성 (2800+ 단어, 고품질 이미지)
echo   3단계: 블로그 게시 (Blogger 자동 업로드)
echo   4단계: 키워드 저장 (중복 방지)
echo.
echo ⏳ 시작합니다...
echo.

npm run blog

if errorlevel 1 (
    echo.
    echo ❌ 실행 중 오류가 발생했습니다.
    echo    다음을 확인해주세요:
    echo   - .env 파일의 API 키 설정
    echo   - 인터넷 연결 상태
    echo   - OAuth 토큰 유효성
    echo.
) else (
    echo.
    echo ✅ 전체 프로세스 완료!
    echo    새로운 블로그 포스트가 성공적으로 게시되었습니다.
    echo.
)

pause
