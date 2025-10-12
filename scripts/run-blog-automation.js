#!/usr/bin/env node

/**
 * 블로그 자동화 전체 프로세스 실행 스크립트
 * 키워드 추출 → 콘텐츠 생성 → 블로그 게시까지 한 번에 실행
 */

import { config } from '../src/config/index.js';
import FileDatabase from '../src/modules/fileDb.js';
import KeywordHarvester from '../src/modules/keywordHarvester.js';
import ContentGenerator from '../src/modules/contentGenerator.js';
import BloggerPublisher from '../src/modules/bloggerPublisher.js';

class BlogAutomationRunner {
  constructor() {
    this.fileDb = new FileDatabase();
    this.bloggerPublisher = new BloggerPublisher();
    this.keywordHarvester = new KeywordHarvester();
    this.contentGenerator = new ContentGenerator();
    
    // KeywordHarvester에 BloggerPublisher 주입
    this.keywordHarvester.setBloggerPublisher(this.bloggerPublisher);
  }

  /**
   * 전체 블로그 자동화 프로세스 실행
   */
  async runFullProcess() {
    console.log('🚀 블로그 자동화 전체 프로세스 시작...\n');
    
    try {
      // 1단계: 키워드 추출
      console.log('📊 1단계: 키워드 수집 중...');
      const newKeywords = await this.keywordHarvester.harvestAndSaveKeywords();
      console.log(`✅ ${newKeywords.length}개의 새로운 키워드 발견\n`);
      
      if (newKeywords.length === 0) {
        console.log('⚠️  새로운 키워드가 없습니다. 프로세스를 종료합니다.');
        return;
      }
      
      // 3단계: 첫 번째 키워드로 블로그 생성
      const targetKeyword = newKeywords[0];
      console.log(`📝 3단계: "${targetKeyword}" 키워드로 블로그 생성 중...`);
      
      const article = await this.contentGenerator.generateArticle(targetKeyword);
      
      // 품질 리포트 생성
      const qualityReport = this.contentGenerator.generateQualityReport(article);
      console.log(`✅ 블로그 콘텐츠 생성 완료 (품질: ${qualityReport.qualityScore}/100)\n`);
      
      // 4단계: 블로그 게시
      console.log('📤 4단계: 블로그 Draft 저장 중...');
      const publishedPost = await this.bloggerPublisher.publishPost(article);
      if (publishedPost.url) {
        console.log(`✅ 블로그 게시 완료: ${publishedPost.url}\n`);
      } else {
        console.log(`✅ 블로그 Draft 저장 완료: ${publishedPost.postId}\n`);
        console.log(`💡 Draft 상태로 저장되었습니다. Blogger에서 검토 후 게시하세요.\n`);
      }
      
      // 5단계: 키워드 저장 (이미 harvestAndSaveKeywords에서 처리됨)
      console.log('💾 5단계: 키워드 저장 완료\n');
      
      // 결과 요약
      console.log('🎉 블로그 자동화 완료!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📊 수집된 키워드: ${newKeywords.length}개`);
      console.log(`🆕 새로운 키워드: ${newKeywords.length}개`);
      console.log(`📝 게시된 키워드: ${targetKeyword}`);
      if (publishedPost.url) {
        console.log(`🔗 게시 URL: ${publishedPost.url}`);
      } else {
        console.log(`📝 Draft ID: ${publishedPost.postId}`);
      }
      console.log(`📈 품질 점수: ${qualityReport.qualityScore}/100`);
      console.log(`📏 단어 수: ${qualityReport.wordCount}개`);
      console.log(`🖼️  이미지 수: ${qualityReport.imageCount}개`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
    } catch (error) {
      console.error('❌ 블로그 자동화 실패:', error.message);
      console.error('상세 에러:', error);
      process.exit(1);
    }
  }

  /**
   * 특정 키워드로 단일 블로그 생성
   */
  async runSingleKeyword(keyword) {
    console.log(`🎯 단일 키워드 모드: "${keyword}"\n`);
    
    try {
      // 1단계: 블로그 생성
      console.log('📝 블로그 콘텐츠 생성 중...');
      const article = await this.contentGenerator.generateArticle(keyword);
      
      // 품질 리포트 생성
      const qualityReport = this.contentGenerator.generateQualityReport(article);
      console.log(`✅ 블로그 콘텐츠 생성 완료 (품질: ${qualityReport.qualityScore}/100)\n`);
      
      // 2단계: 블로그 게시
      console.log('📤 블로그 Draft 저장 중...');
      const publishedPost = await this.bloggerPublisher.publishPost(article);
      if (publishedPost.url) {
        console.log(`✅ 블로그 게시 완료: ${publishedPost.url}\n`);
      } else {
        console.log(`✅ 블로그 Draft 저장 완료: ${publishedPost.postId}\n`);
        console.log(`💡 Draft 상태로 저장되었습니다. Blogger에서 검토 후 게시하세요.\n`);
      }
      
      // 3단계: 키워드 저장
      console.log('💾 사용된 키워드 저장 중...');
      await this.fileDb.saveUsedKeyword(keyword);
      console.log(`✅ 키워드 "${keyword}" 저장 완료\n`);
      
      // 결과 요약
      console.log('🎉 단일 키워드 블로그 생성 완료!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📝 게시된 키워드: ${keyword}`);
      if (publishedPost.url) {
        console.log(`🔗 게시 URL: ${publishedPost.url}`);
      } else {
        console.log(`📝 Draft ID: ${publishedPost.postId}`);
      }
      console.log(`📈 품질 점수: ${qualityReport.qualityScore}/100`);
      console.log(`📏 단어 수: ${qualityReport.wordCount}개`);
      console.log(`🖼️  이미지 수: ${qualityReport.imageCount}개`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
    } catch (error) {
      console.error('❌ 단일 키워드 블로그 생성 실패:', error.message);
      console.error('상세 에러:', error);
      process.exit(1);
    }
  }

  /**
   * 키워드만 추출하는 모드
   */
  async runKeywordOnly() {
    console.log('📊 키워드 추출 모드\n');
    
    try {
      // 키워드 추출
      console.log('🔍 키워드 수집 중...');
      const newKeywords = await this.keywordHarvester.harvestAndSaveKeywords();
      console.log(`✅ ${newKeywords.length}개의 새로운 키워드 발견\n`);
      
      // 모든 키워드도 확인
      const allKeywords = await this.keywordHarvester.harvestAllKeywords();
      console.log(`📊 총 ${allKeywords.length}개의 키워드 수집\n`);
      
      // 결과 출력
      console.log('📋 수집된 모든 키워드:');
      allKeywords.forEach((keyword, index) => {
        console.log(`  ${index + 1}. ${keyword}`);
      });
      
      console.log('\n🆕 새로운 키워드:');
      if (newKeywords.length > 0) {
        newKeywords.forEach((keyword, index) => {
          console.log(`  ${index + 1}. ${keyword}`);
        });
      } else {
        console.log('  새로운 키워드가 없습니다.');
      }
      
      console.log('\n💡 사용법:');
      console.log(`  node scripts/run-blog-automation.js --keyword "${newKeywords[0] || allKeywords[0]}"`);
      
    } catch (error) {
      console.error('❌ 키워드 추출 실패:', error.message);
      console.error('상세 에러:', error);
      process.exit(1);
    }
  }

  /**
   * 도움말 출력
   */
  showHelp() {
    console.log('🤖 블로그 자동화 실행 스크립트');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('📖 사용법:');
    console.log('');
    console.log('  # 전체 프로세스 실행 (키워드 추출 → 블로그 생성 → 게시)');
    console.log('  node scripts/run-blog-automation.js');
    console.log('');
    console.log('  # 특정 키워드로 단일 블로그 생성');
    console.log('  node scripts/run-blog-automation.js --keyword "AI automation"');
    console.log('');
    console.log('  # 키워드만 추출');
    console.log('  node scripts/run-blog-automation.js --keywords-only');
    console.log('');
    console.log('  # 도움말');
    console.log('  node scripts/run-blog-automation.js --help');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('🎯 예시:');
    console.log('  node scripts/run-blog-automation.js --keyword "quantum computing"');
    console.log('  node scripts/run-blog-automation.js --keywords-only');
    console.log('');
  }
}

// 메인 실행 로직
async function main() {
  const args = process.argv.slice(2);
  const runner = new BlogAutomationRunner();
  
  if (args.includes('--help') || args.includes('-h')) {
    runner.showHelp();
    return;
  }
  
  const keywordIndex = args.indexOf('--keyword');
  const keywordsOnlyIndex = args.indexOf('--keywords-only');
  
  if (keywordIndex !== -1 && args[keywordIndex + 1]) {
    // 특정 키워드로 단일 블로그 생성
    const keyword = args[keywordIndex + 1];
    await runner.runSingleKeyword(keyword);
  } else if (keywordsOnlyIndex !== -1) {
    // 키워드만 추출
    await runner.runKeywordOnly();
  } else {
    // 전체 프로세스 실행
    await runner.runFullProcess();
  }
}

// 스크립트가 직접 실행될 때만 main 함수 호출
if (process.argv[1] && process.argv[1].includes('run-blog-automation.js')) {
  main().catch(error => {
    console.error('❌ 실행 중 오류 발생:', error);
    process.exit(1);
  });
}

export default BlogAutomationRunner;
