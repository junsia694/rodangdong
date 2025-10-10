import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/index.js';

/**
 * 실시간 검색어 수집 및 키워드 추출
 * 네이버, 구글 트렌드, Reddit, Hacker News 등에서 실시간 인기 키워드 수집
 */
class TrendKeywordCollector {
  constructor() {
    this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: config.gemini.model });
  }

  /**
   * 실시간 검색어 TOP 10 수집 (효율적으로 간소화)
   * @returns {Promise<Array>} 키워드 배열
   */
  async collectRealTimeTrends() {
    console.log('🔥 실시간 검색어 수집 시작...');
    
    const allKeywords = [];

    try {
      // 병렬로 수집하여 속도 향상
      const results = await Promise.allSettled([
        this.getNaverTrends(),
        this.getGoogleTrendsViaAI(),
        this.getRedditHotTopics(),
        this.getHackerNewsTopics()
      ]);

      // 각 소스에서 최대 3개씩만 수집
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          const sourceName = ['네이버', 'Google', 'Reddit', 'Hacker News'][index];
          console.log(`✅ ${sourceName}: ${result.value.length}개`);
          allKeywords.push(...result.value.slice(0, 3));
        }
      });

      console.log(`✅ 총 ${allKeywords.length}개의 트렌드 키워드 수집 완료`);
      
      // 중복 제거 및 상위 15개 선택
      const uniqueKeywords = [...new Set(allKeywords)];
      return uniqueKeywords.slice(0, 15);

    } catch (error) {
      console.error('실시간 검색어 수집 실패:', error.message);
      return [];
    }
  }

  /**
   * 네이버 실시간 검색어 수집
   * @returns {Promise<Array>} 키워드 배열
   */
  async getNaverTrends() {
    try {
      console.log('📰 네이버 실시간 검색어 수집 중...');
      
      // 네이버 데이터랩 API 대신 Gemini AI로 실시간 트렌드 생성
      const prompt = `
Generate 5 SPECIFIC trending topics in South Korea (Technology and Finance).
DO NOT use generic terms like "AI and Machine Learning" or "FinTech and Digital Banking".

Instead, provide SPECIFIC topics like:
- "ChatGPT-5 Release Date Rumors"
- "Kakao Pay IPO Preparation"
- "Samsung Galaxy S25 Ultra Leak"
- "Bitcoin ETF Approval in Korea"
- "NVIDIA H200 GPU Benchmark"

Requirements:
- Be specific (include product names, versions, companies, events)
- Focus on what's trending NOW
- Avoid generic category names
- Include numbers, versions, or specific events when possible

Return only 5 specific topic names in English, one per line.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const keywords = text
        .split('\n')
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(line => line.length > 0 && line.length < 100);
      
      console.log(`✅ 네이버 트렌드 ${keywords.length}개 수집`);
      return keywords.slice(0, 5);

    } catch (error) {
      console.warn('네이버 트렌드 수집 실패:', error.message);
      return [];
    }
  }

  /**
   * Google Trends (Gemini AI 활용)
   * @returns {Promise<Array>} 키워드 배열
   */
  async getGoogleTrendsViaAI() {
    try {
      console.log('🌐 Google 트렌드 수집 중...');
      
      const prompt = `
Generate 5 SPECIFIC globally trending topics (Technology and Finance).
DO NOT use generic category names.

Provide SPECIFIC topics like:
- "OpenAI GPT-4 Turbo API Launch"
- "Tesla Cybertruck Delivery Delay"
- "Stripe Crypto Payment Integration"
- "Microsoft Copilot Pro Subscription"
- "Bitcoin Halving 2024 Impact"

Requirements:
- Be specific (include company names, product names, versions, events)
- Focus on what's trending NOW globally
- Avoid generic terms
- Include specific details, numbers, or events

Return only 5 specific topic names in English, one per line.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const keywords = text
        .split('\n')
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(line => line.length > 0 && line.length < 100);
      
      console.log(`✅ Google 트렌드 ${keywords.length}개 수집`);
      return keywords.slice(0, 5);

    } catch (error) {
      console.warn('Google 트렌드 수집 실패:', error.message);
      return [];
    }
  }

  /**
   * Reddit Hot Topics
   * @returns {Promise<Array>} 키워드 배열
   */
  async getRedditHotTopics() {
    try {
      console.log('🔴 Reddit Hot Topics 수집 중...');
      
      const subreddits = [
        'technology', 'programming', 'MachineLearning', 
        'investing', 'CryptoCurrency', 'stocks'
      ];
      
      const keywords = [];
      
      for (const subreddit of subreddits) {
        try {
          const response = await axios.get(
            `https://www.reddit.com/r/${subreddit}/hot.json?limit=3`,
            {
              headers: {
                'User-Agent': 'BlogAutomation/1.0'
              },
              timeout: 5000
            }
          );

          if (response.data?.data?.children) {
            const posts = response.data.data.children
              .filter(post => post.data.score > 100)
              .map(post => {
                const title = post.data.title;
                // 제목에서 핵심 키워드 추출
                const cleaned = title
                  .replace(/\[.*?\]/g, '')
                  .replace(/\(.*?\)/g, '')
                  .trim();
                return cleaned;
              })
              .filter(title => title.length > 10 && title.length < 100);
            
            keywords.push(...posts);
          }
        } catch (err) {
          console.warn(`${subreddit} 수집 실패:`, err.message);
        }
      }
      
      console.log(`✅ Reddit 키워드 ${keywords.length}개 수집`);
      return keywords.slice(0, 5);

    } catch (error) {
      console.warn('Reddit 수집 실패:', error.message);
      return [];
    }
  }

  /**
   * Hacker News Topics
   * @returns {Promise<Array>} 키워드 배열
   */
  async getHackerNewsTopics() {
    try {
      console.log('📱 Hacker News 수집 중...');
      
      const response = await axios.get(
        'https://hacker-news.firebaseio.com/v0/topstories.json',
        { timeout: 5000 }
      );

      const topStoryIds = response.data.slice(0, 10);
      const keywords = [];

      for (const id of topStoryIds.slice(0, 5)) {
        try {
          const storyResponse = await axios.get(
            `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
            { timeout: 3000 }
          );

          if (storyResponse.data?.title) {
            const title = storyResponse.data.title;
            if (title.length > 10 && title.length < 100) {
              keywords.push(title);
            }
          }
        } catch (err) {
          // 개별 스토리 실패는 무시
        }
      }
      
      console.log(`✅ Hacker News 키워드 ${keywords.length}개 수집`);
      return keywords;

    } catch (error) {
      console.warn('Hacker News 수집 실패:', error.message);
      return [];
    }
  }

  // Twitter/X Trends는 제거 (API 할당량 절약)

  /**
   * 키워드 필터링 및 우선순위 지정
   * @param {Array} keywords - 원본 키워드 배열
   * @param {Array} usedKeywords - 이미 사용된 키워드 배열
   * @returns {Promise<Array>} 필터링된 키워드 배열
   */
  async filterAndPrioritizeKeywords(keywords, usedKeywords = []) {
    console.log('🔍 키워드 필터링 및 우선순위 지정 중...');
    
    // 사용된 키워드를 문자열 배열로 변환
    const usedKeywordStrings = usedKeywords.map(used => {
      if (typeof used === 'string') {
        return used.toLowerCase();
      } else if (used && used.keyword) {
        return used.keyword.toLowerCase();
      }
      return '';
    }).filter(k => k.length > 0);
    
    console.log(`📋 사용된 키워드 ${usedKeywordStrings.length}개 확인`);
    
    // 1. 너무 일반적인 키워드 배제
    const genericKeywords = [
      'ai and machine learning',
      'ai and artificial intelligence',
      'technology',
      'cloud and devops',
      'cybersecurity',
      'fintech and digital banking',
      'fintech and digital finance',
      'cryptocurrency and blockchain',
      'cryptocurrency and defi',
      'software development',
      'data science and analytics',
      'hardware and electronics'
    ];
    
    const nonGenericKeywords = keywords.filter(keyword => {
      const keywordLower = keyword.toLowerCase().trim();
      
      // 일반적인 키워드 제외
      if (genericKeywords.includes(keywordLower)) {
        console.log(`❌ 너무 일반적인 키워드 제외: "${keyword}"`);
        return false;
      }
      
      // 너무 짧거나 긴 키워드 제외
      if (keyword.length < 10 || keyword.length > 100) {
        return false;
      }
      
      return true;
    });
    
    console.log(`✅ 일반 키워드 제외 후: ${nonGenericKeywords.length}개`);
    
    // 2. 기술 + 금융 관련 키워드만 필터링
    const techFinanceKeywords = nonGenericKeywords.filter(keyword => {
      const keywordLower = keyword.toLowerCase();
      
      // 기술 관련 키워드 (구체적인 것만)
      const isTech = (
        keywordLower.match(/chatgpt|gpt-4|claude|gemini|openai|anthropic|midjourney|stable diffusion/) ||
        keywordLower.match(/github|gitlab|docker|kubernetes|react|vue|angular|next\.js|typescript/) ||
        keywordLower.match(/iphone|galaxy|pixel|macbook|airpods|vision pro|apple watch/) ||
        keywordLower.match(/nvidia|rtx|geforce|amd|ryzen|intel|core|chip|processor/) ||
        keywordLower.match(/aws|azure|gcp|vercel|netlify|cloudflare|supabase/) ||
        keywordLower.match(/python 3\.|javascript|rust|go lang|kotlin|swift/) ||
        keywordLower.match(/zero-day|ransomware|phishing|vulnerability|cve-|exploit/)
      );
      
      // 금융 관련 키워드 (구체적인 것만)
      const isFinance = (
        keywordLower.match(/bitcoin|ethereum|solana|cardano|polygon|avalanche|bnb/) ||
        keywordLower.match(/binance|coinbase|kraken|bybit|okx|upbit|bithumb/) ||
        keywordLower.match(/tesla stock|nvidia stock|apple stock|amazon stock|google stock/) ||
        keywordLower.match(/s&p 500|dow jones|nasdaq|kospi|bitcoin etf|sec approval/) ||
        keywordLower.match(/paypal|stripe|square|revolut|wise|remitly|klarna/) ||
        keywordLower.match(/defi|yield farming|liquidity pool|staking|dex|uniswap|aave/)
      );
      
      return isTech || isFinance;
    });
    
    console.log(`💻💰 구체적인 기술+금융 키워드 ${techFinanceKeywords.length}개 필터링 완료`);
    
    // 3. 이미 사용된 키워드 및 유사 키워드 제외 (엄격한 유사도 검사)
    const newKeywords = techFinanceKeywords.filter(keyword => {
      const keywordLower = keyword.toLowerCase();
      
      // 완전히 동일한 키워드 제외
      if (usedKeywordStrings.includes(keywordLower)) {
        console.log(`❌ 중복 키워드 제외: "${keyword}"`);
        return false;
      }
      
      // 유사도 검사 (단어 기반)
      const keywordWords = keywordLower.split(/\s+/).filter(w => w.length > 3);
      
      for (const used of usedKeywordStrings) {
        const usedWords = used.split(/\s+/).filter(w => w.length > 3);
        
        // 공통 단어 개수 계산
        const commonWords = keywordWords.filter(word => 
          usedWords.some(usedWord => 
            word.includes(usedWord) || usedWord.includes(word)
          )
        );
        
        // 공통 단어가 50% 이상이면 유사 키워드로 판단
        const similarity = commonWords.length / Math.max(keywordWords.length, usedWords.length);
        
        if (similarity > 0.5) {
          console.log(`❌ 유사 키워드 제외: "${keyword}" (유사: "${used}", ${Math.round(similarity * 100)}%)`);
          return false;
        }
      }
      
      return true;
    });

    console.log(`✅ ${newKeywords.length}개의 새로운 구체적 키워드 발견`);
    
    // 상위 10개 반환
    return newKeywords.slice(0, 10);
  }

  /**
   * 키워드 카테고리 분류
   * @param {Array} keywords - 키워드 배열
   * @returns {Promise<Object>} 카테고리별 키워드
   */
  async categorizeKeywords(keywords) {
    const categories = {
      entertainment: [],
      sports: [],
      technology: [],
      news: [],
      lifestyle: [],
      other: []
    };

    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase();
      
      if (keywordLower.match(/movie|music|celebrity|entertainment|film|tv|show/)) {
        categories.entertainment.push(keyword);
      } else if (keywordLower.match(/sport|game|match|player|team|olympic/)) {
        categories.sports.push(keyword);
      } else if (keywordLower.match(/tech|ai|computer|software|app|digital/)) {
        categories.technology.push(keyword);
      } else if (keywordLower.match(/news|event|world|politics|war|election/)) {
        categories.news.push(keyword);
      } else if (keywordLower.match(/food|travel|health|fashion|lifestyle|fitness/)) {
        categories.lifestyle.push(keyword);
      } else {
        categories.other.push(keyword);
      }
    }

    return categories;
  }

  /**
   * 카테고리 균형 조정
   * @param {Object} categorized - 카테고리별 키워드
   * @returns {Array} 균형잡힌 키워드 배열
   */
  balanceCategories(categorized) {
    const balanced = [];
    const categories = Object.keys(categorized);
    
    // 각 카테고리에서 순차적으로 선택
    let index = 0;
    while (balanced.length < 10) {
      let added = false;
      
      for (const category of categories) {
        if (categorized[category].length > index) {
          balanced.push(categorized[category][index]);
          added = true;
          
          if (balanced.length >= 10) break;
        }
      }
      
      if (!added) break;
      index++;
    }
    
    return balanced;
  }
}

export default TrendKeywordCollector;
