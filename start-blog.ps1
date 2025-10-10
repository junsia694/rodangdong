# 블로그 자동화 PowerShell 스크립트
# UTF-8 인코딩 설정
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host ""
Write-Host "██████████████████████████████████████████████████████" -ForegroundColor Cyan
Write-Host "█                                                    █" -ForegroundColor Cyan
Write-Host "█        🚀 블로그 자동화 시스템 시작 🚀               █" -ForegroundColor Yellow
Write-Host "█                                                    █" -ForegroundColor Cyan
Write-Host "██████████████████████████████████████████████████████" -ForegroundColor Cyan
Write-Host ""

# 환경 확인
Write-Host "🔍 환경 확인 중..." -ForegroundColor Green

try {
    $nodeVersion = node --version 2>$null
    if (-not $nodeVersion) {
        throw "Node.js not found"
    }
    Write-Host "✅ Node.js 확인: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js가 설치되지 않았습니다." -ForegroundColor Red
    Write-Host "   https://nodejs.org 에서 설치해주세요." -ForegroundColor Yellow
    Read-Host "아무 키나 누르면 종료됩니다"
    exit 1
}

if (-not (Test-Path "package.json")) {
    Write-Host "❌ 프로젝트 파일을 찾을 수 없습니다." -ForegroundColor Red
    Read-Host "아무 키나 누르면 종료됩니다"
    exit 1
}

Write-Host "✅ 환경 확인 완료" -ForegroundColor Green
Write-Host ""

# 자동 실행
Write-Host "🎯 키워드 추출부터 블로그 게시까지 자동 실행합니다..." -ForegroundColor Yellow
Write-Host ""
Write-Host "📊 1단계: 키워드 수집 (Reddit, Hacker News, Gemini AI)" -ForegroundColor Cyan
Write-Host "📝 2단계: 콘텐츠 생성 (2800+ 단어, 고품질 이미지)" -ForegroundColor Cyan
Write-Host "📤 3단계: 블로그 게시 (Blogger 자동 업로드)" -ForegroundColor Cyan
Write-Host "💾 4단계: 키워드 저장 (중복 방지)" -ForegroundColor Cyan
Write-Host ""

Write-Host "⏳ 시작합니다..." -ForegroundColor Green
Write-Host ""

# npm 실행
try {
    npm run blog
    $exitCode = $LASTEXITCODE
    
    Write-Host ""
    if ($exitCode -eq 0) {
        Write-Host "██████████████████████████████████████████████████████" -ForegroundColor Green
        Write-Host "█                                                    █" -ForegroundColor Green
        Write-Host "█              ✅ 실행 완료 ✅                        █" -ForegroundColor Green
        Write-Host "█                                                    █" -ForegroundColor Green
        Write-Host "██████████████████████████████████████████████████████" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 새로운 블로그 포스트가 성공적으로 게시되었습니다!" -ForegroundColor Green
    } else {
        Write-Host "██████████████████████████████████████████████████████" -ForegroundColor Red
        Write-Host "█                                                    █" -ForegroundColor Red
        Write-Host "█              ❌ 실행 실패 ❌                        █" -ForegroundColor Red
        Write-Host "█                                                    █" -ForegroundColor Red
        Write-Host "██████████████████████████████████████████████████████" -ForegroundColor Red
        Write-Host ""
        Write-Host "🔧 문제 해결 방법:" -ForegroundColor Yellow
        Write-Host "  1. .env 파일의 API 키 확인" -ForegroundColor White
        Write-Host "  2. 인터넷 연결 상태 확인" -ForegroundColor White
        Write-Host "  3. OAuth 토큰 재설정: npm run quick-oauth" -ForegroundColor White
    }
} catch {
    Write-Host "❌ 실행 중 오류가 발생했습니다: $_" -ForegroundColor Red
}

Write-Host ""
Read-Host "아무 키나 누르면 종료됩니다"
