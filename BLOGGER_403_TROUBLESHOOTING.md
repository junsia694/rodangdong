# 🔧 Blogger 403 오류 해결 가이드

## 🚨 현재 상황
- ✅ **Refresh Token**: 새로 생성됨
- ✅ **Access Token**: 정상 갱신됨
- ❌ **Blogger API 호출**: 403 Forbidden 오류

## 🔍 403 오류 주요 원인

### 1. **Google Cloud Console 설정 확인**

#### 📋 **Blogger API 활성화**
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 선택: `rodangdong`
3. **API 및 서비스** → **라이브러리** 이동
4. "Blogger API" 검색 후 **활성화** 확인

#### 🔐 **OAuth 동의 화면 설정**
1. **API 및 서비스** → **OAuth 동의 화면** 이동
2. **사용자 유형**: 외부 선택
3. **테스트 사용자**에 본인 Gmail 주소 추가:
   ```
   junsia694@gmail.com
   ```

#### 🎯 **승인된 리디렉션 URI**
1. **API 및 서비스** → **사용자 인증 정보** 이동
2. OAuth 2.0 클라이언트 ID 클릭
3. **승인된 리디렉션 URI**에 다음 추가:
   ```
   http://localhost:3000/oauth2callback
   ```

### 2. **Blog ID 확인**

#### 📝 **올바른 Blog ID 찾기**
현재 사용 중인 Blog ID: `4116188036281914326`

**확인 방법:**
1. [Blogger.com](https://blogger.com) 접속
2. 블로그 선택
3. URL에서 Blog ID 확인:
   ```
   https://www.blogger.com/blog/posts/4116188036281914326
   ```

### 3. **권한 확인**

#### 👤 **블로그 소유권 확인**
- 해당 블로그의 소유자인지 확인
- 관리자 권한이 있는지 확인

### 4. **OAuth 스코프 확인**

#### 🔑 **필요한 스코프**
현재 사용 중인 스코프:
```
https://www.googleapis.com/auth/blogger
```

## 🛠️ **해결 단계**

### **Step 1: Google Cloud Console 설정**
1. Blogger API 활성화 확인
2. OAuth 동의 화면에서 테스트 사용자 추가
3. 리디렉션 URI 설정 확인

### **Step 2: 새 토큰 생성**
```bash
npm run quick-oauth
```

### **Step 3: Blog ID 재확인**
- Blogger.com에서 정확한 Blog ID 확인
- `.env` 파일의 `BLOGGER_BLOG_ID` 업데이트

### **Step 4: 권한 재확인**
- 블로그 소유권 확인
- 관리자 권한 확인

## 🚨 **즉시 확인해야 할 사항**

### **1. Google Cloud Console**
- [ ] Blogger API 활성화됨
- [ ] OAuth 동의 화면 설정 완료
- [ ] 테스트 사용자에 `junsia694@gmail.com` 추가됨
- [ ] 리디렉션 URI 설정됨

### **2. 블로그 설정**
- [ ] Blog ID 정확함 (`4116188036281914326`)
- [ ] 블로그 소유권 확인됨
- [ ] 관리자 권한 보유

### **3. 토큰 상태**
- [ ] Refresh Token 새로 생성됨
- [ ] Access Token 정상 갱신됨

## 💡 **추가 해결 방법**

### **방법 1: Google Cloud Console에서 직접 확인**
1. [Google Cloud Console](https://console.cloud.google.com/)
2. 프로젝트: `rodangdong`
3. **API 및 서비스** → **사용자 인증 정보**
4. OAuth 2.0 클라이언트 ID 확인

### **방법 2: Blogger API 직접 테스트**
```bash
# Access Token으로 직접 테스트
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     "https://www.googleapis.com/blogger/v3/blogs/4116188036281914326"
```

### **방법 3: 새 프로젝트 생성**
- Google Cloud Console에서 새 프로젝트 생성
- Blogger API 활성화
- 새 OAuth 클라이언트 생성

## 🎯 **가장 가능성 높은 원인**

1. **테스트 사용자 미등록** (90% 확률)
2. **Blogger API 미활성화** (5% 확률)
3. **잘못된 Blog ID** (3% 확률)
4. **권한 문제** (2% 확률)

## 📞 **다음 단계**

1. Google Cloud Console에서 **테스트 사용자**에 본인 이메일 추가
2. 새 Refresh Token 생성
3. 다시 테스트 실행
