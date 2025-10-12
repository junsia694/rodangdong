import ContentGenerator from '../src/modules/contentGenerator.js';
import KeywordHarvester from '../src/modules/keywordHarvester.js';
import BloggerPublisher from '../src/modules/bloggerPublisher.js';
import FileDatabase from '../src/modules/fileDb.js';
import fs from 'fs-extra';
import path from 'path';

/**
 * GitHub Actions용 블로그 자동화 스크립트
 * - 새로운 키워드 1개 선택
 * - 블로그 콘텐츠 생성
 * - Blogger에 즉시 게시
 * - 티스토리용 HTML 파일 생성
 */
class GitHubActionsBlog {
  constructor() {
    this.bloggerPublisher = new BloggerPublisher();
    this.keywordHarvester = new KeywordHarvester();
    this.contentGenerator = new ContentGenerator();
    this.fileDb = new FileDatabase();
    
    // KeywordHarvester에 BloggerPublisher 주입
    this.keywordHarvester.setBloggerPublisher(this.bloggerPublisher);
  }

  /**
   * 메인 실행 함수
   */
  async run() {
    try {
      console.log('🚀 GitHub Actions 블로그 자동화 시작...');
      console.log(`⏰ 실행 시간: ${new Date().toISOString()}`);
      console.log('━'.repeat(60));
      
      // 1단계: 새로운 키워드 1개 선택
      console.log('\n📊 1단계: 새로운 키워드 선택 중...');
      const newKeyword = await this.selectNewKeyword();
      
      if (!newKeyword) {
        console.log('⚠️  사용 가능한 새로운 키워드가 없습니다.');
        console.log('💡 모든 키워드를 사용했거나, 실시간 검색어가 없습니다.');
        process.exit(0);
      }
      
      console.log(`✅ 선택된 키워드: "${newKeyword}"`);
      
      // 2단계: 콘텐츠 생성
      console.log('\n📝 2단계: 블로그 콘텐츠 생성 중...');
      const article = await this.contentGenerator.generateArticle(newKeyword);
      
      // 품질 리포트
      const qualityReport = this.contentGenerator.generateQualityReport(article);
      console.log(`✅ 콘텐츠 생성 완료`);
      console.log(`   - 제목: ${article.title}`);
      console.log(`   - 단어 수: ${qualityReport.wordCount}개`);
      console.log(`   - 이미지 수: ${qualityReport.imageCount}개`);
      console.log(`   - 품질 점수: ${qualityReport.qualityScore}/100`);
      
      // 3단계: 한국어 콘텐츠 생성 (번역 대신 새로 생성)
      console.log('\n🌐 3단계: 한국어 콘텐츠 생성 중...');
      const koreanArticle = await this.contentGenerator.generateArticle(newKeyword, 'ko');
      
      article.koreanContent = koreanArticle.markdownContent;
      article.koreanTitle = koreanArticle.title;
      article.koreanHtmlContent = koreanArticle.content; // HTML 콘텐츠 저장
      
      console.log(`✅ 한국어 콘텐츠 생성 완료`);
      console.log(`   - 한글 제목: ${koreanArticle.title}`);
      
      // 4단계: Blogger에 즉시 게시
      console.log('\n📤 4단계: Blogger 즉시 게시 중...');
      const publishedPost = await this.bloggerPublisher.publishPost(article, false);
      
      console.log(`✅ Blogger 게시 완료`);
      console.log(`   - Post ID: ${publishedPost.postId}`);
      console.log(`   - 게시 URL: ${publishedPost.url}`);
      
      // 5단계: 티스토리용 HTML 파일 생성
      console.log('\n📋 5단계: 티스토리 HTML 파일 생성 중...');
      const tistoryHtmlPath = await this.generateTistoryHtmlFile(article);
      
      console.log(`✅ 티스토리 HTML 파일 생성 완료`);
      console.log(`   - 파일 경로: ${tistoryHtmlPath}`);
      
      // 6단계: 키워드 저장
      console.log('\n💾 6단계: 키워드 저장 중...');
      await this.fileDb.saveUsedKeyword(newKeyword);
      
      console.log(`✅ 키워드 저장 완료`);
      
      // 최종 결과 요약
      console.log('\n' + '━'.repeat(60));
      console.log('🎉 블로그 자동화 완료!');
      console.log('━'.repeat(60));
      console.log(`📝 키워드: ${newKeyword}`);
      console.log(`🔗 Blogger URL: ${publishedPost.url}`);
      console.log(`📄 티스토리 HTML: ${tistoryHtmlPath}`);
      console.log(`📈 품질 점수: ${qualityReport.qualityScore}/100`);
      console.log(`📏 단어 수: ${qualityReport.wordCount}개`);
      console.log(`🖼️  이미지 수: ${qualityReport.imageCount}개`);
      console.log('━'.repeat(60));
      
      // GitHub Actions 출력 설정
      if (process.env.GITHUB_OUTPUT) {
        const output = [
          `keyword=${newKeyword}`,
          `post_id=${publishedPost.postId}`,
          `quality_score=${qualityReport.qualityScore}`,
          `tistory_html=${tistoryHtmlPath}`
        ].join('\n');
        
        await fs.appendFile(process.env.GITHUB_OUTPUT, output);
      }
      
    } catch (error) {
      console.error('❌ 블로그 자동화 실패:', error.message);
      console.error(error);
      process.exit(1);
    }
  }

  /**
   * 새로운 키워드 1개 선택 (AI 최종 검증)
   */
  async selectNewKeyword() {
    try {
      // 1차 필터링된 키워드 수집
      const candidates = await this.keywordHarvester.harvestAllKeywords();
      
      console.log(`📊 1차 필터링 완료: ${candidates.length}개 후보`);
      
      if (candidates.length === 0) {
        console.log('⚠️  사용 가능한 후보 키워드가 없습니다.');
        return null;
      }
      
      // 2차: AI로 가장 유사도 낮은 1개 선택
      console.log('\n🤖 AI로 최종 키워드 선택 중...');
      const existingTitles = await this.bloggerPublisher.getAllPostTitles();
      const selectedKeyword = await this.keywordHarvester.selectMostUniqueKeyword(candidates, existingTitles);
      
      if (!selectedKeyword) {
        console.log('⚠️  모든 후보가 기존 게시글과 유사합니다. 재시도 필요.');
        return null;
      }
      
      return selectedKeyword;
      
    } catch (error) {
      console.error('키워드 선택 실패:', error);
      return null;
    }
  }

  /**
   * 티스토리용 HTML 파일 생성
   */
  async generateTistoryHtmlFile(article) {
    try {
      const outputDir = path.join(process.cwd(), 'generated-content', 'tistory');
      await fs.ensureDir(outputDir);
      
      // 파일명 생성 (특수문자 제거)
      const sanitizedKeyword = article.keyword
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .toLowerCase()
        .substring(0, 50);
      
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${timestamp}_${sanitizedKeyword}.html`;
      const filePath = path.join(outputDir, filename);
      
      // 티스토리 HTML 생성 (한국어 HTML 콘텐츠 사용)
      const tistoryHtml = this.generateTistoryHtml(
        article.koreanHtmlContent || article.content,  // HTML 콘텐츠 사용
        article.koreanTitle || article.title,
        article
      );
      
      // 파일 저장
      await fs.writeFile(filePath, tistoryHtml, 'utf-8');
      
      return filePath;
      
    } catch (error) {
      console.error('티스토리 HTML 파일 생성 실패:', error);
      throw error;
    }
  }

  /**
   * 티스토리 HTML 생성 (이미지 URL을 직접 사용)
   */
  generateTistoryHtml(htmlContent, title, article) {
    // HTML 콘텐츠를 받았으므로 그대로 사용
    // 티스토리 최적화만 적용
    
    // 1. 이미지 태그 최적화 (이미 HTML이지만 인라인 스타일 추가)
    htmlContent = htmlContent.replace(/<img([^>]+)>/g, (match, attrs) => {
      // src 추출
      const srcMatch = attrs.match(/src="([^"]+)"/);
      const altMatch = attrs.match(/alt="([^"]*)"/);
      
      if (srcMatch) {
        const src = srcMatch[1];
        const alt = altMatch ? altMatch[1] : '';
        return `<div style="text-align: center; margin: 30px 0;"><img src="${src}" alt="${alt}" style="max-width: 100%; height: auto; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: block; margin: 0 auto;" crossorigin="anonymous" /></div>`;
      }
      return match;
    });
    
    // 9. 티스토리 최적화 HTML
    const tistoryHtml = `<div style="font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.8;">
  <!-- 제목 -->
  <h1 style="font-size: 2.5em; color: #222; margin-bottom: 30px; font-weight: 700; line-height: 1.3; border-bottom: 4px solid #FF6B35; padding-bottom: 15px;">${title}</h1>
  
  <!-- 콘텐츠 -->
  <div style="font-size: 16px;">
    ${htmlContent}
  </div>
  
  <!-- 하단 구분선 -->
  <hr style="margin-top: 50px; margin-bottom: 20px; border: none; border-top: 2px solid #eee;">
  
  <!-- 메타 정보 -->
  <div style="text-align: center; color: #999; font-size: 14px; margin-top: 20px;">
    <p>작성일: ${new Date().toLocaleDateString('ko-KR')}</p>
    <p>키워드: ${article.keyword}</p>
  </div>
</div>`;

    return tistoryHtml;
  }
}

// 스크립트 실행
const blog = new GitHubActionsBlog();
blog.run();
