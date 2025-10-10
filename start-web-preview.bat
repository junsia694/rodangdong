@echo off
chcp 65001 > nul
echo.
echo ========================================
echo    🚀 블로그 미리보기 시스템 시작
echo ========================================
echo.
echo 웹서버를 시작합니다...
echo.
echo 📝 브라우저에서 http://localhost:3001 을 열어주세요
echo.
echo 💡 기능:
echo    - 키워드로 블로그 콘텐츠 생성
echo    - 한국어 번역된 미리보기
echo    - Draft 저장 / 즉시 게시 / 재작성
echo.
echo 종료하려면 Ctrl+C를 누르세요
echo.
echo ========================================
echo.

npm run web

pause
