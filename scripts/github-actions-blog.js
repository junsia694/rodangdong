import ContentGenerator from '../src/modules/contentGenerator.js';
import KeywordHarvester from '../src/modules/keywordHarvester.js';
import BloggerPublisher from '../src/modules/bloggerPublisher.js';
import FileDatabase from '../src/modules/fileDb.js';
import fs from 'fs-extra';

/**
 * GitHub Actions용 블로그 자동화 스크립트
 * - 새로운 키워드 1개 선택
 * - 영어 블로그 콘텐츠 생성 및 Draft 저장
 * - 한국어 블로그 콘텐츠 생성 및 즉시 게시
 * - 영어/한국어 모두 Blogger에 자동 게시
 */
class GitHubActionsBlog {
  constructor() {
    this.bloggerPublisher = new BloggerPublisher();
    this.keywordHarvester = new KeywordHarvester();
    this.contentGenerator = new ContentGenerator();
    this.fileDb = new FileDatabase();
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
      
      // 2단계: 한국어 콘텐츠 생성
      console.log('\n📝 2단계: 한국어 블로그 콘텐츠 생성 중...');
      const article = await this.contentGenerator.generateArticle(newKeyword, 'ko');
      
      // 품질 리포트
      const qualityReport = this.contentGenerator.generateQualityReport(article);
      console.log(`✅ 한국어 콘텐츠 생성 완료`);
      console.log(`   - 제목: ${article.title}`);
      console.log(`   - 단어 수: ${qualityReport.wordCount}개`);
      console.log(`   - 이미지 수: ${qualityReport.imageCount}개`);
      console.log(`   - 품질 점수: ${qualityReport.qualityScore}/100`);
      
      // 3단계: 한국어 Blogger 예약 게시 (24시간 후)
      console.log('\n📤 3단계: 한국어 버전 Blogger 예약 게시 중 (24시간 후)...');
      const koreanLabels = [
        'IT Trends (KR)',
        newKeyword.toLowerCase().replace(/\s+/g, '-')
      ];
      
      const publishedPost = await this.bloggerPublisher.publishPost(
        article,
        false,  // 예약 게시
        24,     // 24시간 후 게시
        koreanLabels  // 한국어 전용 라벨
      );
      
      console.log(`✅ 한국어 버전 24시간 후 예약 게시 완료`);
      console.log(`   - Post ID: ${publishedPost.postId}`);
      console.log(`   - 게시 URL: ${publishedPost.url}`);
      
      // 6단계: 키워드 저장
      console.log('\n💾 6단계: 키워드 저장 중...');
      await this.fileDb.saveUsedKeyword(newKeyword);
      
      console.log(`✅ 키워드 저장 완료`);
      
      // 최종 결과 요약
      console.log('\n' + '━'.repeat(60));
      console.log('🎉 블로그 자동화 완료!');
      console.log('━'.repeat(60));
      console.log(`📝 키워드: ${newKeyword}`);
      console.log(`\n🇰🇷 한국어 버전:`);
      console.log(`   - Post ID: ${publishedPost.postId}`);
      console.log(`   - URL: ${publishedPost.url}`);
      console.log(`\n📈 품질 점수: ${qualityReport.qualityScore}/100`);
      console.log(`📏 단어 수: ${qualityReport.wordCount}개`);
      console.log(`🖼️  이미지 수: ${qualityReport.imageCount}개`);
      console.log('━'.repeat(60));
      
      // GitHub Actions 출력 설정
      if (process.env.GITHUB_OUTPUT) {
        const output = [
          `keyword=${newKeyword}`,
          `post_id=${publishedPost.postId}`,
          `url=${publishedPost.url}`,
          `quality_score=${qualityReport.qualityScore}`
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
   * 새로운 키워드 1개 선택
   */
  async selectNewKeyword() {
    try {
      // 고사성어 키워드 수집
      const keywords = await this.keywordHarvester.harvestAndSaveKeywords();
      
      if (keywords.length === 0) {
        console.log('⚠️  사용 가능한 새로운 키워드가 없습니다.');
        return null;
      }
      
      return keywords[0];
      
    } catch (error) {
      console.error('키워드 선택 실패:', error);
      return null;
    }
  }

}

// 스크립트 실행
const blog = new GitHubActionsBlog();
blog.run();
