@echo off
chcp 65001 >nul

echo 🚀 블로그 자동화 빠른 실행
echo ================================

if "%1"=="" (
    echo.
    echo 📋 사용법:
    echo   quick-blog.bat [키워드]
    echo.
    echo 🎯 예시:
    echo   quick-blog.bat "AI automation"
    echo   quick-blog.bat "quantum computing"
    echo.
    echo 📊 키워드만 추출:
    echo   quick-blog.bat keywords
    echo.
    pause
    exit /b 0
)

if "%1"=="keywords" (
    echo 📊 키워드 추출 중...
    npm run keywords
) else (
    echo 🎯 키워드: %~1
    echo 📝 블로그 생성 중...
    npm run blog-keyword "%~1"
)

echo.
echo ✅ 완료!
pause