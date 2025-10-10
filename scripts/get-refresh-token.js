/**
 * Google OAuth 2.0 Refresh Token 생성 스크립트
 * 로컬 서버를 사용하여 인증 코드를 받습니다.
 */

import { google } from 'googleapis';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { open } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 환경 변수에서 클라이언트 정보 로드
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.');
  console.error('다음 명령어로 환경 변수를 설정하세요:');
  console.error('export GOOGLE_CLIENT_ID="your_client_id"');
  console.error('export GOOGLE_CLIENT_SECRET="your_client_secret"');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const SCOPES = [
  'https://www.googleapis.com/auth/blogger'
];

async function getRefreshToken() {
  try {
    console.log('🔑 Google OAuth 2.0 Refresh Token 생성 중...\n');
    console.log('🌐 로컬 서버를 시작합니다 (포트 3000)...\n');

    // 로컬 서버 시작
    const server = createServer((req, res) => {
      const url = new URL(req.url, `http://localhost:3000`);
      
      if (url.pathname === '/oauth2callback') {
        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error');
        
        if (error) {
          res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <html>
              <body style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
                <h2 style="color: red;">❌ 인증 실패</h2>
                <p>오류: ${error}</p>
                <p>브라우저를 닫고 다시 시도해주세요.</p>
              </body>
            </html>
          `);
          process.exit(1);
        }
        
        if (code) {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <html>
              <body style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
                <h2 style="color: green;">✅ 인증 성공!</h2>
                <p>인증 코드를 받았습니다. 터미널을 확인하세요.</p>
                <p>이 창을 닫아도 됩니다.</p>
              </body>
            </html>
          `);
          
          // 토큰 교환
          exchangeCodeForToken(code);
        } else {
          res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <html>
              <body style="font-family: Arial, sans-serif; padding: 20px; text-align: center;">
                <h2 style="color: red;">❌ 인증 코드를 받을 수 없습니다</h2>
                <p>다시 시도해주세요.</p>
              </body>
            </html>
          `);
        }
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    });

    server.listen(3000, () => {
      console.log('✅ 로컬 서버가 시작되었습니다 (http://localhost:3000)');
      
      // 인증 URL 생성
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
      });

      console.log('\n📋 다음 단계를 따라하세요:\n');
      console.log('1. 아래 URL을 브라우저에서 열기:');
      console.log(`   ${authUrl}\n`);
      console.log('2. Google 계정으로 로그인');
      console.log('3. 앱 권한 승인');
      console.log('4. 자동으로 인증 코드를 받습니다\n');
    });

    // 서버 종료 함수
    const exchangeCodeForToken = async (code) => {
      try {
        console.log('\n🔄 토큰 교환 중...');
        const { tokens } = await oauth2Client.getToken(code);
        
        console.log('\n✅ Refresh Token 생성 완료!\n');
        console.log('📋 다음 정보를 .env 파일에 추가하세요:\n');
        console.log(`GOOGLE_CLIENT_ID=${CLIENT_ID}`);
        console.log(`GOOGLE_CLIENT_SECRET=${CLIENT_SECRET}`);
        console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`);
        
        // 토큰을 파일로 저장
        const tokenFile = join(__dirname, '../.env.oauth');
        fs.writeFileSync(tokenFile, `
# Google OAuth 2.0 설정
GOOGLE_CLIENT_ID=${CLIENT_ID}
GOOGLE_CLIENT_SECRET=${CLIENT_SECRET}
GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}
`);

        console.log(`💾 토큰 정보가 ${tokenFile}에 저장되었습니다.`);
        console.log('\n🎉 설정 완료! 이제 블로그 자동화를 시작할 수 있습니다.');
        
        server.close();
        process.exit(0);
        
      } catch (error) {
        console.error('❌ 토큰 교환 실패:', error.message);
        server.close();
        process.exit(1);
      }
    };

  } catch (error) {
    console.error('❌ Refresh Token 생성 실패:', error.message);
    process.exit(1);
  }
}

// 스크립트 실행
getRefreshToken();
