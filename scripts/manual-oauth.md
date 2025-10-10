# 수동 OAuth 2.0 설정 가이드

## 1. Google Cloud Console에서 설정

1. **API 및 서비스** > **OAuth 동의 화면**
   - 사용자 유형: **외부** 선택
   - 앱 이름: `Blog Automation`
   - 사용자 지원 이메일: 본인 이메일
   - 개발자 연락처: 본인 이메일

2. **범위** 섹션
   - `https://www.googleapis.com/auth/blogger` 추가

3. **테스트 사용자** 섹션
   - 본인 이메일 추가

4. **API 및 서비스** > **사용자 인증 정보**
   - OAuth 클라이언트 ID 생성
   - 애플리케이션 유형: **데스크톱 애플리케이션**
   - 승인된 리디렉션 URI: `urn:ietf:wg:oauth:2.0:oob`

## 2. 수동으로 인증 URL 생성

브라우저에서 다음 URL을 열되, `YOUR_CLIENT_ID`를 실제 Client ID로 바꿔주세요:

```
https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=urn:ietf:wg:oauth:2.0:oob&scope=https://www.googleapis.com/auth/blogger&response_type=code&access_type=offline
```

## 3. 인증 코드 받기

1. 위 URL을 브라우저에서 열기
2. Google 계정으로 로그인
3. 권한 승인
4. 브라우저에 표시된 인증 코드 복사

## 4. Refresh Token 교환

Postman이나 curl을 사용하여 토큰을 교환:

```bash
curl -X POST https://oauth2.googleapis.com/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "code=AUTHORIZATION_CODE" \
  -d "grant_type=authorization_code" \
  -d "redirect_uri=urn:ietf:wg:oauth:2.0:oob"
```

응답에서 `refresh_token` 값을 복사하여 `.env` 파일에 저장하세요.
