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
    this.bloggerPublisher = null; // 필요시 주입
  }

  /**
   * BloggerPublisher 인스턴스 설정
   * @param {BloggerPublisher} publisher - BloggerPublisher 인스턴스
   */
  setBloggerPublisher(publisher) {
    this.bloggerPublisher = publisher;
  }

  /**
   * Gemini AI를 사용하여 가장 유사도가 낮은 키워드 1개 추천
   * @param {Array<string>} candidateKeywords - 후보 키워드 배열
   * @param {Array<string>} existingTitles - 기존 게시글 제목 배열
   * @returns {Promise<string|null>} 추천된 키워드
   */
  async selectMostUniqueKeyword(candidateKeywords, existingTitles) {
    try {
      console.log(`🤖 Gemini AI로 가장 독창적인 키워드 선택 중... (후보 ${candidateKeywords.length}개)`);
      
      const prompt = `
You are a content strategist expert. Your task is to select the MOST UNIQUE and LEAST SIMILAR keyword from the candidate list.

**Existing Blog Post Titles (${existingTitles.length} posts):**
${existingTitles.slice(0, 100).map((title, i) => `${i + 1}. ${title}`).join('\n')}
${existingTitles.length > 100 ? `... and ${existingTitles.length - 100} more` : ''}

**Candidate Keywords (${candidateKeywords.length} candidates):**
${candidateKeywords.map((kw, i) => `${i + 1}. ${kw}`).join('\n')}

**Task:**
Analyze each candidate keyword and compare it semantically with ALL existing blog post titles.
Select the ONE keyword that has the LOWEST semantic similarity with existing posts.

**Criteria:**
1. The keyword should discuss a DIFFERENT concept/topic from existing posts
2. The keyword should target a DIFFERENT use case or audience
3. Readers who read existing posts would find this topic FRESH and NEW
4. Avoid topics that overlap significantly with existing content

**Similarity Levels:**
- High Overlap (60-100): Same concept, redundant → AVOID
- Medium Overlap (40-60): Related topic, some redundancy → AVOID  
- Low Overlap (20-40): Related domain, distinct focus → PREFER
- No Overlap (0-20): Completely different → MOST PREFER

**IMPORTANT:**
- Return ONLY the exact keyword text from the candidate list
- Return the SINGLE most unique keyword
- NO explanations, NO numbers, NO additional text
- If all candidates are too similar (>40 similarity), return "NONE"

Selected Keyword:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const selectedKeyword = response.text().trim();
      
      // "NONE" 체크
      if (selectedKeyword === "NONE" || selectedKeyword === "none") {
        console.log('⚠️  Gemini AI: 모든 후보가 기존 게시글과 유사함');
        return null;
      }
      
      // 후보 목록에 있는지 확인
      const foundKeyword = candidateKeywords.find(k => 
        k.toLowerCase().trim() === selectedKeyword.toLowerCase().trim()
      );
      
      if (foundKeyword) {
        console.log(`✅ 선택된 키워드: "${foundKeyword}"`);
        return foundKeyword;
      } else {
        console.warn(`⚠️  Gemini가 반환한 키워드가 후보 목록에 없음: "${selectedKeyword}"`);
        console.log(`🔄 첫 번째 후보 키워드로 폴백: "${candidateKeywords[0]}"`);
        return candidateKeywords[0];
      }
      
    } catch (error) {
      console.warn('⚠️  키워드 선택 실패, 첫 번째 후보로 폴백:', error.message);
      return candidateKeywords.length > 0 ? candidateKeywords[0] : null;
    }
  }

  /**
   * 단어 기반 유사도 계산 (폴백용)
   * @param {string} str1 - 첫 번째 문자열
   * @param {string} str2 - 두 번째 문자열
   * @returns {number} 유사도 점수 (0-100)
   */
  calculateWordBasedSimilarity(str1, str2) {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    
    if (s1 === s2) {
      return 100;
    }
    
    const words1 = s1.split(/\s+/).filter(w => w.length > 2);
    const words2 = s2.split(/\s+/).filter(w => w.length > 2);
    
    if (words1.length === 0 || words2.length === 0) {
      return 0;
    }
    
    const commonWords = words1.filter(w1 => 
      words2.some(w2 => w1.includes(w2) || w2.includes(w1))
    );
    
    const similarity = (commonWords.length / Math.max(words1.length, words2.length)) * 100;
    
    return Math.round(similarity);
  }

  /**
   * 의미론적 유사도 검증 (단일 키워드 - 2차 필터링)
   * @param {string} keyword - 검증할 키워드
   * @param {Array<string>} existingTitles - 기존 게시글 제목 배열
   * @returns {Promise<number>} 최대 유사도 점수 (0-100)
   */
  async verifySemanticUniqueness(keyword, existingTitles) {
    try {
      const prompt = `
Analyze semantic similarity between a keyword and existing blog titles.

Keyword: "${keyword}"

Existing Titles (${existingTitles.length}):
${existingTitles.slice(0, 50).map((t, i) => `${i + 1}. ${t}`).join('\n')}
${existingTitles.length > 50 ? `... (${existingTitles.length - 50} more)` : ''}

Find the HIGHEST similarity score with any existing title (0-100):
- 0-20: Completely different
- 21-40: Related but distinct
- 41-60: Similar
- 61-80: Very similar
- 81-100: Nearly identical

Return ONLY a number (0-100), NO text.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      const score = parseInt(text.match(/\d+/)?.[0] || '0');
      return Math.min(100, Math.max(0, score));
      
    } catch (error) {
      console.warn('⚠️  의미론적 검증 실패:', error.message);
      return 0;
    }
  }

  /**
   * Gemini AI를 사용하여 IT Evergreen 키워드 생성
   * @param {string} category - 'IT' 또는 'Finance'
   * @returns {Promise<Array<string>>} Evergreen 키워드 배열
   */
  async getEvergreenKeywords(category = 'IT') {
    try {
      console.log(`🌲 Gemini AI로 ${category} Evergreen 키워드 생성 중...`);
      
      const prompt = category === 'Finance' ? this.getFinanceEvergreenPrompt() : this.getITEvergreenPrompt();

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const keywords = text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 10 && line.length < 200)
        .slice(0, 30);
      
      console.log(`✅ ${category} Evergreen 키워드 ${keywords.length}개 생성 완료`);
      return keywords;

    } catch (error) {
      console.error(`${category} Evergreen 키워드 생성 실패:`, error);
      return [];
    }
  }

  /**
   * IT Evergreen 키워드 프롬프트
   */
  getITEvergreenPrompt() {
    return `
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
  }

  /**
   * Finance Evergreen 키워드 프롬프트
   */
  getFinanceEvergreenPrompt() {
    return `
Generate 30 EVERGREEN Finance and Investment topics that are always relevant and searchable.

Evergreen topics are timeless, consistently searched, and provide long-term value.

Focus Areas:
1. **Personal Finance Basics**
   - Budgeting, saving, emergency funds
   - Debt management, credit scores
   - Financial planning fundamentals
   
2. **Investment Fundamentals**
   - Stock market basics, bonds, ETFs
   - Diversification, asset allocation
   - Risk management, portfolio building
   
3. **Retirement Planning**
   - 401(k), IRA, pension plans
   - Retirement savings strategies
   - Social security basics
   
4. **Real Estate & Property**
   - Home buying process, mortgages
   - Real estate investment basics
   - Rental property management
   
5. **Tax & Accounting**
   - Tax deductions, tax planning
   - Tax-advantaged accounts
   - Basic accounting principles
   
6. **Banking & Credit**
   - Checking vs savings accounts
   - Credit cards, loans
   - Interest rates, APR explained
   
7. **Insurance**
   - Life insurance types, health insurance
   - Auto insurance, home insurance
   - Insurance coverage basics
   
8. **Business & Entrepreneurship**
   - Starting a business, business plans
   - Cash flow management
   - Small business accounting
   
9. **Cryptocurrency Basics**
   - Blockchain fundamentals
   - Cryptocurrency wallets
   - Bitcoin vs Ethereum basics
   
10. **Financial Literacy**
    - Compound interest, inflation
    - Net worth calculation
    - Financial ratios, financial statements

Requirements:
1. Topics must be TIMELESS and EVERGREEN (not trends)
2. Each topic should be SPECIFIC and SEARCHABLE
3. 5-20 words per topic
4. Focus on "How to", "What is", "Understanding", "Basics of" type topics
5. NO market predictions or news
6. NO specific stock prices or crypto prices

Examples of GOOD Evergreen Topics:
✅ "Understanding Compound Interest: How Your Money Grows Over Time"
✅ "How to Build a Diversified Investment Portfolio for Beginners"
✅ "Roth IRA vs Traditional IRA: Which Retirement Account is Right for You"
✅ "Understanding Credit Scores: How They Work and How to Improve Them"
✅ "Real Estate Investment Basics: REITs vs Direct Property Ownership"
✅ "How to Create a Monthly Budget That Actually Works"
✅ "Understanding Stock Market Fundamentals: P/E Ratio, Dividends, Market Cap"

Examples of BAD Topics (too trendy):
❌ "Bitcoin Price Prediction 2025"
❌ "Latest Fed Interest Rate Decision"
❌ "Tesla Stock Analysis"

Return ONLY 30 topics, one per line, NO numbers, NO explanations.
`;
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
   * Evergreen 키워드 수집 및 통합 (블로그 게시글 유사도 기반)
   * @returns {Promise<Array<string>>} 통합된 키워드 배열
   */
  async harvestAllKeywords() {
    console.log('🌲 Evergreen 키워드 기반 수집 시작 (IT 2개 + 금융 1개 패턴)...');

    let allITKeywords = [];
    let allFinanceKeywords = [];
    let attempt = 0;
    const maxAttempts = 3; // 최대 3번 재시도
    const minRequiredIT = 14; // 필요한 최소 IT 키워드
    const minRequiredFinance = 7; // 필요한 최소 Finance 키워드

    // 2. 블로그 게시글 제목 가져오기
    let existingTitles = [];
    if (this.bloggerPublisher) {
      existingTitles = await this.bloggerPublisher.getAllPostTitles();
      console.log(`📋 블로그 게시글 ${existingTitles.length}개 제목 가져오기 완료`);
    } else {
      console.warn('⚠️  BloggerPublisher가 설정되지 않음. 파일 DB 사용');
      const usedKeywords = await this.db.loadUsedKeywords();
      existingTitles = usedKeywords.map(k => k.keyword || k).filter(k => k);
      console.log(`📋 파일 DB에서 ${existingTitles.length}개 키워드 로드`);
    }

    const similarityThreshold = 40; // 의미론적 유사도 임계값 (40점 초과 시 제외)

    // 충분한 키워드를 얻을 때까지 반복 생성
    while (attempt < maxAttempts) {
      attempt++;
      console.log(`\n🔄 키워드 생성 시도 ${attempt}/${maxAttempts}...`);

      // 1. IT와 Finance 키워드 생성
      const [itKeywords, financeKeywords] = await Promise.all([
        this.getEvergreenKeywords('IT'),
        this.getEvergreenKeywords('Finance')
      ]);

      console.log(`✅ IT Evergreen 키워드 ${itKeywords.length}개 생성 완료`);
      console.log(`✅ Finance Evergreen 키워드 ${financeKeywords.length}개 생성 완료`);

      // 3. 1차 필터링: 단어 기반 유사도 (30점 이하만 허용)
      console.log('\n📝 1차 필터링: 단어 기반 유사도 검사 (30점 이하)...');
      const wordThreshold = 30;
      
      const itCandidates = itKeywords.filter(keyword => {
        if (allITKeywords.includes(keyword)) {
          return false;
        }
        
        for (const existingTitle of existingTitles) {
          const similarity = this.calculateWordBasedSimilarity(keyword, existingTitle);
          if (similarity > wordThreshold) {
            return false;
          }
        }
        return true;
      });

      const financeCandidates = financeKeywords.filter(keyword => {
        if (allFinanceKeywords.includes(keyword)) {
          return false;
        }
        
        for (const existingTitle of existingTitles) {
          const similarity = this.calculateWordBasedSimilarity(keyword, existingTitle);
          if (similarity > wordThreshold) {
            return false;
          }
        }
        return true;
      });

      console.log(`✅ 1차 필터링 완료: IT ${itCandidates.length}개, Finance ${financeCandidates.length}개`);

      // 4. 2차 필터링: AI 의미론적 유사도 검증 (40점 이하만 허용)
      console.log('\n🤖 2차 필터링: AI 의미론적 유사도 검증 (40점 이하)...');
      const semanticThreshold = 40;
      const newITKeywords = [];
      const newFinanceKeywords = [];
      
      // IT 키워드 검증
      for (const keyword of itCandidates) {
        const maxSimilarity = await this.verifySemanticUniqueness(keyword, existingTitles);
        
        if (maxSimilarity <= semanticThreshold) {
          console.log(`✅ IT 키워드 허용: "${keyword}" (최대 유사도: ${maxSimilarity}점)`);
          newITKeywords.push(keyword);
          
          // 충분한 키워드를 얻으면 중단
          if (newITKeywords.length >= minRequiredIT) {
            console.log(`✅ IT 키워드 충분 (${newITKeywords.length}개), 검증 중단`);
            break;
          }
        } else {
          console.log(`❌ IT 키워드 제외: "${keyword}" (최대 유사도: ${maxSimilarity}점 > ${semanticThreshold}점)`);
        }
      }
      
      // Finance 키워드 검증
      for (const keyword of financeCandidates) {
        const maxSimilarity = await this.verifySemanticUniqueness(keyword, existingTitles);
        
        if (maxSimilarity <= semanticThreshold) {
          console.log(`✅ Finance 키워드 허용: "${keyword}" (최대 유사도: ${maxSimilarity}점)`);
          newFinanceKeywords.push(keyword);
          
          // 충분한 키워드를 얻으면 중단
          if (newFinanceKeywords.length >= minRequiredFinance) {
            console.log(`✅ Finance 키워드 충분 (${newFinanceKeywords.length}개), 검증 중단`);
            break;
          }
        } else {
          console.log(`❌ Finance 키워드 제외: "${keyword}" (최대 유사도: ${maxSimilarity}점 > ${semanticThreshold}점)`);
        }
      }

      console.log(`✅ 2차 필터링 완료: IT ${newITKeywords.length}개, Finance ${newFinanceKeywords.length}개`);

      // 새로운 키워드 추가
      allITKeywords.push(...newITKeywords);
      allFinanceKeywords.push(...newFinanceKeywords);

      console.log(`📊 현재까지 수집된 IT 키워드: ${allITKeywords.length}개`);
      console.log(`📊 현재까지 수집된 Finance 키워드: ${allFinanceKeywords.length}개`);

      // 충분한 키워드를 얻었는지 확인
      if (allITKeywords.length >= minRequiredIT && allFinanceKeywords.length >= minRequiredFinance) {
        console.log(`✅ 충분한 키워드 확보! (IT: ${allITKeywords.length}, Finance: ${allFinanceKeywords.length})`);
        break;
      }

      if (attempt < maxAttempts) {
        console.log(`⚠️  키워드 부족. 추가 생성 중... (필요: IT ${minRequiredIT}개, Finance ${minRequiredFinance}개)`);
      }
    }

    console.log(`\n✅ 최종 사용 가능한 IT 키워드: ${allITKeywords.length}개`);
    console.log(`✅ 최종 사용 가능한 Finance 키워드: ${allFinanceKeywords.length}개`);

    // 5. 키워드가 부족한 경우 경고
    if (allITKeywords.length === 0 && allFinanceKeywords.length === 0) {
      console.error('❌ 사용 가능한 키워드가 없습니다. 블로그에 모든 주제가 게시되었을 수 있습니다.');
      return [];
    }

    // 6. IT 2개 + 금융 1개 패턴으로 혼합
    const mixedKeywords = [];
    let itIndex = 0;
    let financeIndex = 0;

    // IT, IT, Finance 패턴으로 최대 30개 생성
    for (let i = 0; i < 30 && (itIndex < allITKeywords.length || financeIndex < allFinanceKeywords.length); i++) {
      if (i % 3 === 2) {
        // 3번째마다 Finance
        if (financeIndex < allFinanceKeywords.length) {
          mixedKeywords.push(allFinanceKeywords[financeIndex]);
          financeIndex++;
        } else if (itIndex < allITKeywords.length) {
          // Finance 부족 시 IT로 대체
          mixedKeywords.push(allITKeywords[itIndex]);
          itIndex++;
        }
      } else {
        // IT 키워드
        if (itIndex < allITKeywords.length) {
          mixedKeywords.push(allITKeywords[itIndex]);
          itIndex++;
        } else if (financeIndex < allFinanceKeywords.length) {
          // IT 부족 시 Finance로 대체
          mixedKeywords.push(allFinanceKeywords[financeIndex]);
          financeIndex++;
        }
      }
    }

    console.log(`\n✅ IT:Finance 비율로 혼합: ${mixedKeywords.length}개`);
    console.log(`📊 IT ${itIndex}개 + Finance ${financeIndex}개 선택됨`);

    // 7. 키워드 정리
    const cleanedKeywords = this.cleanKeywords(mixedKeywords);

    // 8. 최종 키워드 반환
    console.log(`✅ 최종 키워드 ${cleanedKeywords.length}개 선택 완료`);
    if (cleanedKeywords.length > 0) {
      console.log(`📊 선택된 키워드 (상위 5개):`, cleanedKeywords.slice(0, 5));
    }
    
    return cleanedKeywords;
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
