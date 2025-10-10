import dotenv from 'dotenv';
import { config, validateConfig } from './config/index.js';
import KeywordHarvester from './modules/keywordHarvester.js';
import ContentGenerator from './modules/contentGenerator.js';
import BloggerPublisher from './modules/bloggerPublisher.js';

// 환경 변수 로드
dotenv.config();

/**
 * 메인 애플리케이션 클래스
 * 전체 블로그 자동화 파이프라인을 관리
 */

class BlogAutomationApp {
  constructor() {
    this.keywordHarvester = new KeywordHarvester();
    this.contentGenerator = new ContentGenerator();
    this.bloggerPublisher = new BloggerPublisher();
    this.isRunning = false;
  }

  /**
   * 애플리케이션 초기화
   */
  async initialize() {
    try {
      console.log('🚀 Blog Automation App Starting...');
      console.log(`📅 Started at: ${new Date().toISOString()}`);
      
      // 설정 검증
      if (!validateConfig()) {
        console.warn('⚠️  Configuration validation failed. Some features may not work properly.');
      }

      console.log('✅ Configuration loaded successfully');
      console.log(`📊 Target blog ID: ${config.blogger.blogId}`);
      console.log(`🤖 AI Model: ${config.gemini.model}`);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize application:', error);
      return false;
    }
  }

  /**
   * 단일 키워드에 대한 전체 프로세스 실행
   * @param {string} keyword - 처리할 키워드
   * @returns {Promise<Object>} 실행 결과
   */
  async processSingleKeyword(keyword) {
    try {
      console.log(`\n🔄 Processing keyword: "${keyword}"`);
      
      // 1. 콘텐츠 생성
      console.log('📝 Generating content...');
      const article = await this.contentGenerator.generateArticle(keyword);
      
      // 2. 품질 리포트 생성
      const qualityReport = this.contentGenerator.generateQualityReport(article);
      console.log(`📊 Quality Score: ${qualityReport.qualityScore}/100`);
      console.log(`📏 Word Count: ${qualityReport.wordCount}`);
      console.log(`🖼️  Images: ${qualityReport.imageCount}`);
      
      // 3. Blogger에 발행
      console.log('📤 Publishing to Blogger...');
      const publishResult = await this.bloggerPublisher.publishPost(
        article, 
        false, 
        config.schedule.postScheduleHours
      );
      
      if (publishResult.success) {
        console.log(`✅ Successfully published: ${publishResult.url}`);
      }
      
      return {
        success: true,
        keyword,
        article,
        qualityReport,
        publishResult
      };
      
    } catch (error) {
      console.error(`❌ Failed to process keyword "${keyword}":`, error.message);
      return {
        success: false,
        keyword,
        error: error.message
      };
    }
  }

  /**
   * 키워드 수집 및 처리
   * @param {number} maxKeywords - 최대 처리할 키워드 수
   * @returns {Promise<Array>} 처리 결과 배열
   */
  async harvestAndProcessKeywords(maxKeywords = 5) {
    try {
      console.log('\n🔍 Starting keyword harvesting...');
      
      // 1. 키워드 수집
      const newKeywords = await this.keywordHarvester.harvestAndSaveKeywords();
      
      if (newKeywords.length === 0) {
        console.log('ℹ️  No new keywords found. Skipping content generation.');
        return [];
      }
      
      // 2. 최대 키워드 수로 제한
      const keywordsToProcess = newKeywords.slice(0, maxKeywords);
      console.log(`📋 Processing ${keywordsToProcess.length} keywords: ${keywordsToProcess.join(', ')}`);
      
      // 3. 각 키워드에 대해 콘텐츠 생성 및 발행
      const results = [];
      for (const keyword of keywordsToProcess) {
        const result = await this.processSingleKeyword(keyword);
        results.push(result);
        
        // API 호출 제한을 위한 지연
        await this.delay(3000);
      }
      
      // 4. 결과 요약
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;
      
      console.log(`\n📈 Processing Summary:`);
      console.log(`✅ Successful: ${successCount}`);
      console.log(`❌ Failed: ${failureCount}`);
      
      return results;
      
    } catch (error) {
      console.error('❌ Failed to harvest and process keywords:', error);
      return [];
    }
  }

  /**
   * 애플리케이션 실행
   * @param {Object} options - 실행 옵션
   */
  async run(options = {}) {
    if (this.isRunning) {
      console.log('⚠️  Application is already running');
      return;
    }

    this.isRunning = true;
    
    try {
      // 초기화
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error('Failed to initialize application');
      }

      const maxKeywords = options.maxKeywords || 3;
      const mode = options.mode || 'harvest'; // 'harvest' or 'single'

      if (mode === 'single' && options.keyword) {
        // 단일 키워드 처리
        console.log(`🎯 Single keyword mode: ${options.keyword}`);
        const result = await this.processSingleKeyword(options.keyword);
        
        if (result.success) {
          console.log('\n🎉 Single keyword processing completed successfully!');
        } else {
          console.log('\n💥 Single keyword processing failed!');
        }
        
        return result;
      } else {
        // 키워드 수집 및 처리
        console.log(`🌐 Harvest mode: Processing up to ${maxKeywords} keywords`);
        const results = await this.harvestAndProcessKeywords(maxKeywords);
        
        if (results.length > 0) {
          console.log('\n🎉 Keyword harvesting and processing completed!');
        } else {
          console.log('\n📭 No keywords were processed');
        }
        
        return results;
      }
      
    } catch (error) {
      console.error('💥 Application execution failed:', error);
      throw error;
    } finally {
      this.isRunning = false;
      console.log(`\n🏁 Application finished at: ${new Date().toISOString()}`);
    }
  }

  /**
   * 지연 함수
   * @param {number} ms - 지연 시간 (밀리초)
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 애플리케이션 상태 확인
   * @returns {Object} 현재 상태
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      config: {
        blogId: config.blogger.blogId,
        geminiModel: config.gemini.model,
        minWordCount: config.app.minWordCount,
        minImagesCount: config.app.minImagesCount
      },
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * CLI 실행 함수
 */
async function main() {
  const app = new BlogAutomationApp();
  
  // 명령행 인수 파싱
  const args = process.argv.slice(2);
  const options = {};

  // 옵션 파싱
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace('--', '');
    const value = args[i + 1];
    
    if (key && value) {
      if (key === 'maxKeywords' || key === 'postScheduleHours') {
        options[key] = parseInt(value);
      } else {
        options[key] = value;
      }
    }
  }

  try {
    await app.run(options);
    process.exit(0);
  } catch (error) {
    console.error('💥 Application crashed:', error);
    process.exit(1);
  }
}

// 직접 실행된 경우에만 main 함수 호출
if (process.argv[1] && process.argv[1].includes('index.js')) {
  main();
}

export default BlogAutomationApp;
