@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

echo.
echo ========================================
echo    🚀 블로그 자동화 실행 스크립트
echo ========================================
echo.

REM Node.js 설치 확인
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js가 설치되지 않았습니다.
    echo    https://nodejs.org 에서 Node.js를 설치해주세요.
    pause
    exit /b 1
)

REM npm 설치 확인
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm이 설치되지 않았습니다.
    echo    Node.js와 함께 npm이 설치되어야 합니다.
    pause
    exit /b 1
)

REM package.json 확인
if not exist "package.json" (
    echo ❌ package.json 파일을 찾을 수 없습니다.
    echo    올바른 프로젝트 디렉토리에서 실행해주세요.
    pause
    exit /b 1
)

REM .env 파일 확인
if not exist ".env" (
    echo ⚠️  .env 파일이 없습니다. 환경 변수를 설정해주세요.
    echo.
)

echo ✅ 환경 확인 완료
echo.

:MENU
echo 📋 실행할 작업을 선택하세요:
echo.
echo 1. 전체 프로세스 실행 (키워드 추출 → 블로그 생성 → 게시)
echo 2. 특정 키워드로 블로그 생성
echo 3. 키워드만 추출
echo 4. 도움말 보기
echo 5. 종료
echo.
set /p choice="선택 (1-5): "

if "%choice%"=="1" goto FULL_PROCESS
if "%choice%"=="2" goto SINGLE_KEYWORD
if "%choice%"=="3" goto KEYWORDS_ONLY
if "%choice%"=="4" goto HELP
if "%choice%"=="5" goto EXIT
goto INVALID_CHOICE

:FULL_PROCESS
echo.
echo 🚀 전체 프로세스 실행 중...
echo   1단계: 키워드 추출
echo   2단계: 콘텐츠 생성
echo   3단계: 블로그 게시
echo.
npm run blog
if errorlevel 1 (
    echo.
    echo ❌ 전체 프로세스 실행 중 오류가 발생했습니다.
    echo    환경 설정을 확인해주세요.
)
goto END

:SINGLE_KEYWORD
echo.
set /p keyword="키워드를 입력하세요: "
if "%keyword%"=="" (
    echo ❌ 키워드를 입력해주세요.
    goto MENU
)
echo.
echo 🎯 키워드: "%keyword%"
echo.
npm run blog-keyword "%keyword%"
goto END

:KEYWORDS_ONLY
echo.
echo 📊 키워드 추출 중...
echo.
npm run keywords
goto END

:HELP
echo.
echo 📖 블로그 자동화 도움말
echo ========================================
echo.
echo 🎯 주요 기능:
echo   • 자동 키워드 수집 (Reddit, Hacker News, Gemini AI)
echo   • 고품질 블로그 콘텐츠 생성 (2800+ 단어)
echo   • 고품질 이미지 자동 삽입 (Unsplash)
echo   • Blogger 자동 게시
echo   • 키워드 중복 방지
echo.
echo 📋 사용 가능한 명령어:
echo   npm run blog              - 전체 프로세스 실행
echo   npm run blog-keyword "키워드" - 특정 키워드로 블로그 생성
echo   npm run keywords          - 키워드만 추출
echo.
echo ⚙️  설정 요구사항:
echo   • .env 파일에 API 키 설정 필요
echo   • Gemini API Key
echo   • Google OAuth 설정
echo   • Blogger Blog ID
echo.
echo 🔧 문제 해결:
echo   • OAuth 토큰 재설정: npm run quick-oauth
echo   • 환경 변수 확인: type .env
echo.
goto MENU

:INVALID_CHOICE
echo.
echo ❌ 잘못된 선택입니다. 1-5 중에서 선택해주세요.
echo.
goto MENU

:END
echo.
echo ========================================
echo 작업이 완료되었습니다.
echo ========================================
echo.
set /p continue="다른 작업을 실행하시겠습니까? (y/n): "
if /i "%continue%"=="y" goto MENU
if /i "%continue%"=="yes" goto MENU

:EXIT
echo.
echo 👋 블로그 자동화를 종료합니다.
echo.
pause
