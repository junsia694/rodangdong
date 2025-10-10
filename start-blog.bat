@echo off
chcp 65001 >nul

title 블로그 자동화 시스템

echo.
echo ████████████████████████████████████████████████████████
echo █                                                    █
echo █        🚀 블로그 자동화 시스템 시작 🚀               █
echo █                                                    █
echo ████████████████████████████████████████████████████████
echo.

REM 환경 확인
echo 🔍 환경 확인 중...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js가 설치되지 않았습니다.
    echo    https://nodejs.org 에서 설치해주세요.
    pause
    exit /b 1
)

if not exist "package.json" (
    echo ❌ 프로젝트 파일을 찾을 수 없습니다.
    pause
    exit /b 1
)

echo ✅ 환경 확인 완료
echo.

REM 자동 실행
echo 🎯 키워드 추출부터 블로그 게시까지 자동 실행합니다...
echo.
echo 📊 1단계: 키워드 수집 (Reddit, Hacker News, Gemini AI)
echo 📝 2단계: 콘텐츠 생성 (2800+ 단어, 고품질 이미지)  
echo 📤 3단계: 블로그 게시 (Blogger 자동 업로드)
echo 💾 4단계: 키워드 저장 (중복 방지)
echo.

echo ⏳ 시작합니다...
echo.

npm run blog

echo.
if errorlevel 1 (
    echo ████████████████████████████████████████████████████████
    echo █                                                    █
    echo █              ❌ 실행 실패 ❌                        █
    echo █                                                    █
    echo ████████████████████████████████████████████████████████
    echo.
    echo 🔧 문제 해결 방법:
    echo   1. .env 파일의 API 키 확인
    echo   2. 인터넷 연결 상태 확인
    echo   3. OAuth 토큰 재설정: npm run quick-oauth
    echo.
) else (
    echo ████████████████████████████████████████████████████████
    echo █                                                    █
    echo █              ✅ 실행 완료 ✅                        █
    echo █                                                    █
    echo ████████████████████████████████████████████████████████
    echo.
    echo 🎉 새로운 블로그 포스트가 성공적으로 게시되었습니다!
    echo.
)

echo 아무 키나 누르면 종료됩니다...
pause >nul
