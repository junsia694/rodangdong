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
   * Gemini AI를 사용하여 IT Evergreen 키워드 생성
   * @returns {Promise<Array<string>>} Evergreen 키워드 배열
   */
  async getEvergreenKeywords() {
    try {
      console.log('🌲 Gemini AI로 IT Evergreen 키워드 생성 중...');
      
      const prompt = `
Generate 30 EVERGREEN IT and Technology topics that are always relevant and searchable.

Evergreen topics are timeless, consistently searched, and provide long-term value.

Focus Areas:
1. **Programming Fundamentals**
   - Data structures, algorithms, design patterns
   - Programming paradigms, best practices
   
2. **Software Development**
   - Software architecture, microservices, REST API
   - CI/CD, testing strategies, code quality
   
3. **Web Development**
   - HTML/CSS fundamentals, JavaScript core concepts
   - Frontend frameworks, backend development
   - Web performance, accessibility, SEO
   
4. **Database & Data**
   - SQL fundamentals, database design
   - NoSQL databases, data modeling
   - Data structures, Big Data concepts
   
5. **DevOps & Cloud**
   - Docker basics, Kubernetes introduction
   - Cloud computing concepts, AWS/Azure/GCP fundamentals
   - Linux basics, server management
   
6. **Cybersecurity**
   - Network security basics, encryption
   - Authentication & authorization
   - Common vulnerabilities (OWASP Top 10)
   
7. **AI & Machine Learning**
   - Machine learning basics, neural networks
   - Natural language processing fundamentals
   - Computer vision basics
   
8. **Mobile Development**
   - iOS development basics, Android fundamentals
   - Cross-platform development, React Native
   
9. **Computer Science Fundamentals**
   - Operating systems, networking basics
   - Compilers, interpreters
   - Memory management, concurrency
   
10. **Career & Best Practices**
    - Clean code principles, SOLID principles
    - Agile methodology, Scrum basics
    - Git workflow, version control

Requirements:
1. Topics must be TIMELESS and EVERGREEN (not trends)
2. Each topic should be SPECIFIC and SEARCHABLE
3. 5-20 words per topic
4. Focus on "How to", "What is", "Understanding", "Basics of" type topics
5. NO version-specific topics (e.g., "Python 3.14")
6. NO trending/news topics (e.g., "Latest AI")

Examples of GOOD Evergreen Topics:
✅ "Understanding RESTful API Design Principles and Best Practices"
✅ "How to Implement Binary Search Tree in Programming"
✅ "SQL JOIN Types Explained: Inner, Outer, Left, Right"
✅ "Docker Container Basics: Images, Volumes, and Networking"
✅ "Object-Oriented Programming Principles: Inheritance and Polymorphism"
✅ "Understanding Big O Notation for Algorithm Complexity"
✅ "How to Secure Web Applications Against XSS Attacks"

Examples of BAD Topics (too trendy):
❌ "ChatGPT-5 Release Date"
❌ "Latest iPhone Features"
❌ "Python 3.14 Performance"

Return ONLY 30 topics, one per line, NO numbers, NO explanations.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const keywords = text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 10 && line.length < 200)
        .slice(0, 30);
      
      console.log(`✅ Evergreen 키워드 ${keywords.length}개 생성 완료`);
      return keywords;

    } catch (error) {
      console.error('Evergreen 키워드 생성 실패:', error);
      return [];
    }
  }

  /**
   * AI를 사용하여 트렌드 키워드 생성 (레거시)
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
   * Evergreen 키워드 수집 및 통합 (이미 사용된 키워드 제외)
   * @returns {Promise<Array<string>>} 통합된 키워드 배열
   */
  async harvestAllKeywords() {
    console.log('🌲 Evergreen IT 키워드 기반 수집 시작...');

    // 1. Gemini AI로 Evergreen 키워드 생성
    const evergreenKeywords = await this.getEvergreenKeywords();
    console.log(`✅ Evergreen 키워드 ${evergreenKeywords.length}개 생성 완료`);

    // 2. 이미 사용된 키워드 가져오기
    const usedKeywords = await this.db.loadUsedKeywords();
    console.log(`📋 이미 사용된 키워드: ${usedKeywords.length}개`);

    // 3. 사용된 키워드를 문자열 배열로 변환
    const usedKeywordStrings = usedKeywords.map(used => {
      if (typeof used === 'string') {
        return used.toLowerCase();
      } else if (used && used.keyword) {
        return used.keyword.toLowerCase();
      }
      return '';
    }).filter(k => k.length > 0);

    // 4. 이미 사용된 키워드 제외 (완전 일치만)
    const newKeywords = evergreenKeywords.filter(keyword => {
      const keywordLower = keyword.toLowerCase();
      return !usedKeywordStrings.includes(keywordLower);
    });

    console.log(`✅ 사용 가능한 새로운 Evergreen 키워드: ${newKeywords.length}개`);

    // 5. 키워드 정리
    const cleanedKeywords = this.cleanKeywords(newKeywords);

    // 6. 상위 20개 반환 (더 많은 선택지 제공)
    const topKeywords = cleanedKeywords.slice(0, 20);
    
    console.log(`✅ 최종 키워드 ${topKeywords.length}개 선택 완료`);
    console.log(`📊 선택된 키워드:`, topKeywords);
    
    return topKeywords;
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
