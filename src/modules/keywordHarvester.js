import axios from 'axios';
import { generateKeywordPrompt } from '../utils/prompt_template.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/index.js';
import FileDatabase from './fileDb.js';
import TrendKeywordCollector from './trendKeywordCollector.js';

/**
 * 키워드 수집 모듈
 * Google Trends, Reddit, Hacker News에서 트렌드 키워드 수집
 * 중복 방지 로직 포함
 */

class KeywordHarvester {
  constructor() {
    this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: config.gemini.model });
    this.db = new FileDatabase();
    this.trendCollector = new TrendKeywordCollector();
  }

  /**
   * AI를 사용하여 트렌드 키워드 생성
   * @returns {Promise<Array<string>>} 트렌드 키워드 배열
   */
  async getGoogleTrendsKeywords() {
    try {
      // Gemini를 사용해 트렌드 키워드 생성
      const prompt = generateKeywordPrompt();
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // JSON 파싱 시도
      try {
        const keywords = JSON.parse(text);
        return Array.isArray(keywords) ? keywords : [];
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트에서 키워드 추출
        return this.extractKeywordsFromText(text);
      }
    } catch (error) {
      console.error('Failed to generate trend keywords:', error);
      return [];
    }
  }

  /**
   * Reddit에서 인기 키워드 수집 (Free Tier) - 트렌드 기반
   * @returns {Promise<Array<string>>} Reddit 인기 키워드
   */
  async getRedditKeywords() {
    try {
      const subreddits = ['technology', 'programming', 'gadgets', 'tech', 'artificial', 'MachineLearning', 'cybersecurity'];
      const keywords = [];

      for (const subreddit of subreddits) {
        try {
          const response = await axios.get(
            `https://www.reddit.com/r/${subreddit}/hot.json?limit=15`,
            {
              headers: {
                'User-Agent': 'TechBlogBot/1.0'
              }
            }
          );

          const posts = response.data.data.children;
          const extractedKeywords = posts
            .map(post => post.data.title)
            .filter(title => {
              // 더 구체적인 필터링
              const length = title.length;
              const hasTechKeywords = /(AI|ML|IoT|5G|cloud|quantum|blockchain|cyber|edge|AR|VR|automation|digital|smart|green|sustainable)/i.test(title);
              return length > 15 && length < 120 && hasTechKeywords;
            })
            .map(title => this.extractKeywordFromTitle(title)) // 제목에서 핵심 키워드 추출
            .filter(keyword => keyword && keyword.length >= 2) // 2단어 이상 키워드
            .slice(0, 1); // 상위 1개만

          keywords.push(...extractedKeywords);
        } catch (subredditError) {
          console.warn(`Failed to fetch from r/${subreddit}:`, subredditError.message);
        }
      }

      return keywords;
    } catch (error) {
      console.error('Failed to get Reddit keywords:', error);
      return [];
    }
  }

  /**
   * Hacker News에서 인기 키워드 수집 - 트렌드 기반
   * @returns {Promise<Array<string>>} Hacker News 인기 키워드
   */
  async getHackerNewsKeywords() {
    try {
      const response = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json');
      const storyIds = response.data.slice(0, 15); // 더 많은 스토리 확인

      const keywords = [];
      for (const id of storyIds) {
        try {
          const storyResponse = await axios.get(
            `https://hacker-news.firebaseio.com/v0/item/${id}.json`
          );
          const story = storyResponse.data;
          
          if (story && story.title && story.score > 30) {
            // 더 구체적인 기술 트렌드 필터링
            const title = story.title;
            const hasTechTrends = /(AI|machine learning|quantum|blockchain|cybersecurity|IoT|5G|cloud|edge|AR|VR|automation|digital transformation|sustainable|green tech|smart|zero trust|MLOps|DevOps)/i.test(title);
            
            if (hasTechTrends && title.length > 20 && title.length < 100) {
              const extractedKeyword = this.extractKeywordFromTitle(title);
              if (extractedKeyword && extractedKeyword.length >= 2) {
                keywords.push(extractedKeyword);
                break; // 하나만 추가하고 중단
              }
            }
          }
        } catch (storyError) {
          console.warn(`Failed to fetch story ${id}:`, storyError.message);
        }
      }

      return keywords.slice(0, 1); // 상위 1개만 반환
    } catch (error) {
      console.error('Failed to get Hacker News keywords:', error);
      return [];
    }
  }

  /**
   * 모든 소스에서 키워드 수집 및 통합 (실시간 검색어 TOP 10 우선)
   * @returns {Promise<Array<string>>} 통합된 키워드 배열
   */
  async harvestAllKeywords() {
    console.log('🔥 실시간 검색어 TOP 10 기반 키워드 수집 시작...');

    // 1. 실시간 검색어 수집 (최우선)
    const realTimeTrends = await this.trendCollector.collectRealTimeTrends();
    console.log(`✅ 실시간 트렌드 ${realTimeTrends.length}개 수집 완료`);

    // 2. 이미 사용된 키워드 가져오기
    const usedKeywords = await this.db.loadUsedKeywords();
    console.log(`📋 이미 사용된 키워드: ${usedKeywords.length}개`);

    // 3. 필터링: 사용되지 않은 키워드만 선택
    const filteredKeywords = await this.trendCollector.filterAndPrioritizeKeywords(
      realTimeTrends, 
      usedKeywords
    );

    // 4. 부족할 경우 기존 소스에서 추가 수집
    if (filteredKeywords.length < 5) {
      console.log('⚠️  실시간 키워드가 부족합니다. 추가 소스에서 수집 중...');
      
      const [redditKeywords, hnKeywords] = await Promise.allSettled([
        this.getRedditKeywords(),
        this.getHackerNewsKeywords()
      ]);

      if (redditKeywords.status === 'fulfilled') {
        filteredKeywords.push(...redditKeywords.value.slice(0, 5));
      }

      if (hnKeywords.status === 'fulfilled') {
        filteredKeywords.push(...hnKeywords.value.slice(0, 5));
      }
    }

    // 5. 키워드 정리 및 우선순위 지정
    const cleanedKeywords = this.cleanKeywords(filteredKeywords);
    const prioritizedKeywords = this.prioritizeCommercialKeywords(cleanedKeywords);

    // 6. 상위 10개만 반환
    const top10Keywords = prioritizedKeywords.slice(0, 10);
    
    console.log(`✅ 최종 키워드 ${top10Keywords.length}개 선택 완료`);
    console.log(`📊 선택된 키워드:`, top10Keywords);
    
    return top10Keywords;
  }

  /**
   * 새로운 키워드만 필터링 (중복 제거)
   * @param {Array<string>} keywords - 확인할 키워드 배열
   * @returns {Promise<Array<string>>} 새로운 키워드만 포함된 배열
   */
  async getNewKeywords(keywords) {
    const newKeywords = await this.db.filterNewKeywords(keywords);
    console.log(`Found ${newKeywords.length} new keywords out of ${keywords.length} total`);
    return newKeywords;
  }

  /**
   * 키워드 정리 및 표준화
   * @param {Array<string>} keywords - 정리할 키워드 배열
   * @returns {Array<string>} 정리된 키워드 배열
   */
  cleanKeywords(keywords) {
    return keywords
      .map(keyword => keyword.trim())
      .filter(keyword => 
        keyword.length > 3 && 
        keyword.length < 100 &&
        !keyword.includes('http') &&
        !keyword.includes('www.') &&
        /^[a-zA-Z0-9\s\-_]+$/.test(keyword) // 영문, 숫자, 공백, 하이픈, 언더스코어만 허용
      )
      .slice(0, 50); // 최대 50개로 제한
  }

  /**
   * 상업적 의도가 높은 키워드에 가중치 부여 (2025 트렌드 기반)
   * @param {Array<string>} keywords - 키워드 배열
   * @returns {Array<string>} 우선순위가 적용된 키워드 배열
   */
  prioritizeCommercialKeywords(keywords) {
    const highValuePatterns = [
      // 2025 트렌드 키워드
      /2025/i,
      /breakthrough/i,
      /solutions/i,
      /enterprise/i,
      /automation/i,
      /sustainable/i,
      /green/i,
      /private networks/i,
      /operations/i,
      /architecture/i,
      /native/i,
      /transformation/i,
      /manufacturing/i
    ];

    const commercialPatterns = [
      /how to/i,
      /best/i,
      /review/i,
      /vs\s/i,
      /guide/i,
      /tutorial/i,
      /comparison/i,
      /top\s/i,
      /ultimate/i,
      /complete/i
    ];

    const highValue = [];
    const prioritized = [];
    const regular = [];

    keywords.forEach(keyword => {
      const isHighValue = highValuePatterns.some(pattern => pattern.test(keyword));
      const isCommercial = commercialPatterns.some(pattern => pattern.test(keyword));
      
      if (isHighValue) {
        highValue.push(keyword);
      } else if (isCommercial) {
        prioritized.push(keyword);
      } else {
        regular.push(keyword);
      }
    });

    // 2025 트렌드 > 상업적 키워드 > 일반 키워드 순으로 배치
    return [...highValue, ...prioritized, ...regular];
  }

  /**
   * 제목에서 핵심 키워드 추출
   * @param {string} title - 원본 제목
   * @returns {string} 추출된 핵심 키워드
   */
  extractKeywordFromTitle(title) {
    // 불필요한 단어 제거
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must'];
    
    // 제목을 단어로 분리
    const words = title.toLowerCase()
      .replace(/[^\w\s]/g, ' ') // 특수문자 제거
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word));
    
    // 기술 키워드 우선 선택
    const techKeywords = ['ai', 'machine learning', 'quantum', 'blockchain', 'cybersecurity', 'iot', '5g', 'cloud', 'edge', 'ar', 'vr', 'automation', 'digital', 'smart', 'green', 'sustainable', 'mlops', 'devops', 'zero trust'];
    
    for (const techKeyword of techKeywords) {
      if (title.toLowerCase().includes(techKeyword)) {
        // 관련 기술 키워드와 함께 2-4단어 조합 생성
        const contextWords = words.filter(word => 
          word !== techKeyword && 
          word.length > 2 && 
          !stopWords.includes(word)
        );
        
        if (contextWords.length > 0) {
          return `${techKeyword} ${contextWords[0]}`;
        }
        return techKeyword;
      }
    }
    
    // 기술 키워드가 없으면 앞의 2-3단어 사용
    if (words.length >= 2) {
      return words.slice(0, 2).join(' ');
    }
    
    return words[0] || title.split(' ').slice(0, 2).join(' ');
  }

  /**
   * 텍스트에서 키워드 추출 (JSON 파싱 실패 시 사용)
   * @param {string} text - 추출할 텍스트
   * @returns {Array<string>} 추출된 키워드 배열
   */
  extractKeywordsFromText(text) {
    const lines = text.split('\n');
    const keywords = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && 
          trimmed.length > 5 && 
          trimmed.length < 50 &&
          !trimmed.includes('[') &&
          !trimmed.includes(']')) {
        const extractedKeyword = this.extractKeywordFromTitle(trimmed);
        if (extractedKeyword && extractedKeyword.length >= 2) {
          keywords.push(extractedKeyword);
          break; // 하나만 추가하고 중단
        }
      }
    }

    return keywords.slice(0, 1); // 최대 1개
  }

  /**
   * 키워드 수집 및 저장
   * @returns {Promise<Array<string>>} 새로 저장된 키워드 배열
   */
  async harvestAndSaveKeywords() {
    try {
      // 모든 소스에서 키워드 수집
      const allKeywords = await this.harvestAllKeywords();
      
      // 새로운 키워드만 필터링
      const newKeywords = await this.getNewKeywords(allKeywords);
      
      // 상위 5개 키워드만 저장 (비용 절약)
      const selectedKeywords = newKeywords.slice(0, 5);
      
      // 선택된 키워드들을 데이터베이스에 저장
      for (const keyword of selectedKeywords) {
        await this.db.saveUsedKeyword(keyword);
      }

      console.log(`Successfully harvested and saved ${selectedKeywords.length} new keywords`);
      return selectedKeywords;
    } catch (error) {
      console.error('Failed to harvest and save keywords:', error);
      return [];
    }
  }
}

export default KeywordHarvester;
