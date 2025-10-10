import axios from 'axios';
import http from 'http';
import { URL } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID_HERE';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'YOUR_CLIENT_SECRET_HERE';
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';
const SCOPE = 'https://www.googleapis.com/auth/blogger';

async function generateNewRefreshToken() {
  console.log('🔑 새로운 OAuth 클라이언트로 Refresh Token 생성 중...\n');

  // 로컬 서버 시작
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:3000`);
    
    if (url.pathname === '/oauth2callback') {
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');
      
      if (error) {
        console.error('❌ OAuth 오류:', error);
        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <html>
            <body>
              <h1>OAuth 오류</h1>
              <p>오류: ${error}</p>
              <p>브라우저를 닫고 다시 시도해주세요.</p>
            </body>
          </html>
        `);
        server.close();
        return;
      }
      
      if (code) {
        console.log('🔄 인증 코드를 받았습니다. 토큰을 교환 중...');
        
        // 토큰 교환
        axios.post('https://oauth2.googleapis.com/token', {
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: REDIRECT_URI
        })
        .then(response => {
          const { access_token, refresh_token } = response.data;
          
          console.log('✅ 새로운 Refresh Token 생성 완료!\n');
          console.log('📋 다음 정보를 .env 파일에 추가하세요:\n');
          console.log(`GOOGLE_CLIENT_ID=${CLIENT_ID}`);
          console.log(`GOOGLE_CLIENT_SECRET=${CLIENT_SECRET}`);
          console.log(`GOOGLE_REFRESH_TOKEN=${refresh_token}\n`);
          
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <html>
              <body>
                <h1>✅ 성공!</h1>
                <p>새로운 Refresh Token이 생성되었습니다.</p>
                <p>터미널에서 결과를 확인하세요.</p>
              </body>
            </html>
          `);
          
          server.close();
        })
        .catch(error => {
          console.error('❌ 토큰 교환 실패:', error.response?.data || error.message);
          res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <html>
              <body>
                <h1>토큰 교환 실패</h1>
                <p>오류: ${error.response?.data?.error || error.message}</p>
              </body>
            </html>
          `);
          server.close();
        });
      } else {
        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <html>
            <body>
              <h1>오류</h1>
              <p>인증 코드를 받지 못했습니다.</p>
            </body>
          </html>
        `);
        server.close();
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <html>
          <body>
            <h1>404 Not Found</h1>
            <p>잘못된 경로입니다.</p>
          </body>
        </html>
      `);
    }
  });

  server.listen(3000, () => {
    console.log('🌐 로컬 서버를 시작합니다 (포트 3000)...\n');
    console.log('✅ 로컬 서버가 시작되었습니다 (http://localhost:3000)\n');
    
    // OAuth URL 생성
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `access_type=offline&` +
      `scope=${encodeURIComponent(SCOPE)}&` +
      `response_type=code&` +
      `client_id=${CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
    
    console.log('📋 다음 단계를 따라하세요:\n');
    console.log('1. 아래 URL을 브라우저에서 열기:');
    console.log(`   ${authUrl}\n`);
    console.log('2. Google 계정으로 로그인');
    console.log('3. 앱 권한 승인');
    console.log('4. 자동으로 인증 코드를 받습니다\n');
    console.log('💡 브라우저가 자동으로 열리지 않으면 위 URL을 복사해서 브라우저에 붙여넣기하세요.\n');
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error('❌ 포트 3000이 이미 사용 중입니다. 다른 포트를 사용하거나 기존 서버를 종료하세요.');
    } else {
      console.error('❌ 서버 오류:', error.message);
    }
    process.exit(1);
  });
}

generateNewRefreshToken();
