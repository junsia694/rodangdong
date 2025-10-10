import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import ContentGenerator from './modules/contentGenerator.js';
import KeywordHarvester from './modules/keywordHarvester.js';
import BloggerPublisher from './modules/bloggerPublisher.js';
import TrendKeywordCollector from './modules/trendKeywordCollector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// 전역 변수로 현재 생성된 아티클 저장
let currentArticle = null;
let currentKeyword = null;

// 메인 페이지
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 실시간 검색어 TOP 10 가져오기
app.get('/api/trending-keywords', async (req, res) => {
  try {
    console.log('🔥 실시간 검색어 TOP 10 요청 받음');
    
    const trendCollector = new TrendKeywordCollector();
    const keywordHarvester = new KeywordHarvester();
    
    // 실시간 트렌드 수집 (간소화 - 10개 정도만)
    const realTimeTrends = await trendCollector.collectRealTimeTrends();
    
    // 사용된 키워드 가져오기 (올바른 메서드명)
    const usedKeywords = await keywordHarvester.db.loadUsedKeywords();
    
    // 필터링
    const filteredKeywords = await trendCollector.filterAndPrioritizeKeywords(
      realTimeTrends,
      usedKeywords
    );
    
    // 상위 10개만 선택
    const top10 = filteredKeywords.slice(0, 10);
    
    console.log(`✅ 실시간 검색어 TOP 10 전송: ${top10.length}개`);
    console.log(top10);
    
    res.json({
      success: true,
      keywords: top10,
      total: top10.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('실시간 검색어 가져오기 실패:', error);
    res.status(500).json({
      success: false,
      error: '실시간 검색어를 가져오는데 실패했습니다.',
      details: error.message
    });
  }
});

// 키워드로 블로그 콘텐츠 생성
app.post('/api/generate', async (req, res) => {
  try {
    const { keyword, language = 'ko' } = req.body;
    
    if (!keyword) {
      return res.status(400).json({ error: '키워드가 필요합니다.' });
    }

    console.log(`📝 "${keyword}" 키워드로 콘텐츠 생성 중...`);
    
    // 콘텐츠 생성기 초기화
    const contentGenerator = new ContentGenerator();
    
    // 아티클 생성
    const article = await contentGenerator.generateArticle(keyword);
    
    // 한국어 번역이 필요한 경우
    if (language === 'ko' && article.content) {
      article.koreanContent = await contentGenerator.translateToKorean(article.content);
      article.koreanTitle = await contentGenerator.translateToKorean(article.title);
    }
    
    // 전역 변수에 저장
    currentArticle = article;
    currentKeyword = keyword;
    
    console.log(`✅ 콘텐츠 생성 완료: ${article.title}`);
    
    res.json({
      success: true,
      article: article,
      keyword: keyword,
      message: '콘텐츠가 성공적으로 생성되었습니다.'
    });
    
  } catch (error) {
    console.error('콘텐츠 생성 실패:', error);
    res.status(500).json({ 
      error: '콘텐츠 생성에 실패했습니다.',
      details: error.message 
    });
  }
});

// Draft로 게시
app.post('/api/publish/draft', async (req, res) => {
  try {
    if (!currentArticle) {
      return res.status(400).json({ error: '게시할 콘텐츠가 없습니다.' });
    }

    console.log('📝 Draft로 게시 중...');
    
    const bloggerPublisher = new BloggerPublisher();
    const result = await bloggerPublisher.publishPost(currentArticle, true);
    
    console.log(`✅ Draft 게시 완료: ${result.postId}`);
    
    res.json({
      success: true,
      result: result,
      message: 'Draft로 성공적으로 저장되었습니다.'
    });
    
  } catch (error) {
    console.error('Draft 게시 실패:', error);
    res.status(500).json({ 
      error: 'Draft 게시에 실패했습니다.',
      details: error.message 
    });
  }
});

// 즉시 게시
app.post('/api/publish/now', async (req, res) => {
  try {
    if (!currentArticle) {
      return res.status(400).json({ error: '게시할 콘텐츠가 없습니다.' });
    }

    console.log('🚀 즉시 게시 중...');
    
    const bloggerPublisher = new BloggerPublisher();
    const result = await bloggerPublisher.publishPost(currentArticle, false);
    
    console.log(`✅ 즉시 게시 완료: ${result.url}`);
    
    res.json({
      success: true,
      result: result,
      message: '즉시 게시가 완료되었습니다.'
    });
    
  } catch (error) {
    console.error('즉시 게시 실패:', error);
    res.status(500).json({ 
      error: '즉시 게시에 실패했습니다.',
      details: error.message 
    });
  }
});

// 재작성
app.post('/api/regenerate', async (req, res) => {
  try {
    if (!currentKeyword) {
      return res.status(400).json({ error: '재작성할 키워드가 없습니다.' });
    }

    console.log(`🔄 "${currentKeyword}" 키워드로 재작성 중...`);
    
    const contentGenerator = new ContentGenerator();
    
    // 새로운 아티클 생성
    const newArticle = await contentGenerator.generateArticle(currentKeyword);
    
    // 한국어 번역
    newArticle.koreanContent = await contentGenerator.translateToKorean(newArticle.content);
    newArticle.koreanTitle = await contentGenerator.translateToKorean(newArticle.title);
    
    // 전역 변수 업데이트
    currentArticle = newArticle;
    
    console.log(`✅ 재작성 완료: ${newArticle.title}`);
    
    res.json({
      success: true,
      article: newArticle,
      message: '콘텐츠가 성공적으로 재작성되었습니다.'
    });
    
  } catch (error) {
    console.error('재작성 실패:', error);
    res.status(500).json({ 
      error: '재작성에 실패했습니다.',
      details: error.message 
    });
  }
});

// 티스토리용 HTML 생성
app.get('/api/tistory-html', (req, res) => {
  try {
    if (!currentArticle) {
      return res.status(400).json({ error: '변환할 콘텐츠가 없습니다.' });
    }

    const koreanContent = currentArticle.koreanContent || currentArticle.content;
    const koreanTitle = currentArticle.koreanTitle || currentArticle.title;
    
    // 티스토리용 HTML 생성
    const tistoryHtml = generateTistoryHtml(koreanContent, koreanTitle, currentArticle);
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(tistoryHtml);
    
  } catch (error) {
    console.error('티스토리 HTML 생성 실패:', error);
    res.status(500).json({ 
      error: '티스토리 HTML 생성에 실패했습니다.',
      details: error.message 
    });
  }
});

// 티스토리용 HTML 생성 함수 (최적화)
function generateTistoryHtml(content, title, article) {
  // Markdown을 티스토리용 HTML로 변환
  let htmlContent = content;
  
  // 1. 제목 처리
  htmlContent = htmlContent.replace(/^# (.+)$/gm, '');
  
  // 2. 섹션 제목 처리 (H2, H3)
  htmlContent = htmlContent.replace(/^## (.+)$/gm, '<h2 style="font-size: 1.8em; color: #333; margin-top: 35px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 3px solid #FF6B35;">$1</h2>');
  htmlContent = htmlContent.replace(/^### (.+)$/gm, '<h3 style="font-size: 1.4em; color: #444; margin-top: 25px; margin-bottom: 10px;">$1</h3>');
  
  // 3. 강조 처리
  htmlContent = htmlContent.replace(/\*\*(.+?)\*\*/g, '<strong style="color: #FF6B35; font-weight: 600;">$1</strong>');
  htmlContent = htmlContent.replace(/\*(.+?)\*/g, '<em style="color: #555;">$1</em>');
  
  // 4. 링크 처리
  htmlContent = htmlContent.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" style="color: #0066CC; text-decoration: none; border-bottom: 1px solid #0066CC;">$1</a>');
  
  // 5. 이미지 처리 (티스토리 최적화)
  htmlContent = htmlContent.replace(/!\[(.+?)\]\((.+?)\)/g, (match, alt, url) => {
    return `<div style="text-align: center; margin: 30px 0;"><img src="${url}" alt="${alt}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" /></div>`;
  });
  
  // 6. 리스트 처리
  htmlContent = htmlContent.replace(/^\* (.+)$/gm, '<li style="margin-bottom: 10px; line-height: 1.8;">$1</li>');
  htmlContent = htmlContent.replace(/^- (.+)$/gm, '<li style="margin-bottom: 10px; line-height: 1.8;">$1</li>');
  
  // 7. 연속된 li를 ul로 감싸기
  htmlContent = htmlContent.replace(/(<li[^>]*>.*?<\/li>\n?)+/gs, (match) => {
    return `<ul style="margin: 15px 0 15px 25px; padding-left: 20px;">${match}</ul>`;
  });
  
  // 8. 문단 처리
  htmlContent = htmlContent.split('\n\n').map(para => {
    para = para.trim();
    if (para && !para.startsWith('<') && para.length > 0) {
      return `<p style="margin-bottom: 18px; line-height: 1.9; font-size: 16px; color: #333;">${para.replace(/\n/g, '<br>')}</p>`;
    }
    return para;
  }).join('\n');
  
  // 9. 티스토리 에디터용 최적화된 HTML (DOCTYPE 및 불필요한 태그 제거)
  const tistoryHtml = `<div style="font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.8;">
  <!-- 제목 -->
  <h1 style="font-size: 2.5em; color: #222; margin-bottom: 30px; font-weight: 700; line-height: 1.3; border-bottom: 4px solid #FF6B35; padding-bottom: 15px;">${title}</h1>
  
  <!-- 콘텐츠 -->
  <div style="font-size: 16px;">
    ${htmlContent}
  </div>
  
  <!-- 하단 구분선 -->
  <hr style="margin-top: 50px; margin-bottom: 20px; border: none; border-top: 2px solid #eee;">
</div>`;

  return tistoryHtml;
}

// 서버 시작
app.listen(PORT, () => {
  console.log(`🌐 웹서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  console.log(`📝 블로그 미리보기 시스템이 준비되었습니다.`);
  console.log(`📋 티스토리 HTML 복사 기능이 활성화되었습니다.`);
});
