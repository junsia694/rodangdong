import FileDatabase from './fileDb.js';
import GosaCollector from './gosaCollector.js';

/**
 * 키워드 수집 모듈
 * 고사성어 키워드 수집 (AI 호출 최소화)
 */

class KeywordHarvester {
  constructor() {
    this.db = new FileDatabase();
    this.gosaCollector = new GosaCollector();
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

**Similarity Levels (RELAXED CRITERIA for more diversity):**
- Very High Overlap (80-100): Nearly identical, redundant → AVOID
- High Overlap (60-80): Very similar concept → AVOID if possible, but ACCEPTABLE if diverse enough
- Medium Overlap (40-60): Related topic, some overlap → ACCEPTABLE, prefer if diverse
- Low Overlap (20-40): Related domain, distinct focus → PREFER
- No Overlap (0-20): Completely different → MOST PREFER

**IMPORTANT (RELAXED):**
- Return ONLY the exact keyword text from the candidate list
- Return the SINGLE most unique keyword
- NO explanations, NO numbers, NO additional text
- If all candidates are too similar (>80 similarity), return the LEAST similar one anyway
- Prioritize DIVERSITY over perfect uniqueness
- It's OK to select a keyword even if it has 40-60% similarity, as long as it's different enough

Selected Keyword:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const selectedKeyword = response.text().trim();
      
      // "NONE" 체크 - 하지만 최소한 가장 유사도가 낮은 키워드는 선택
      if (selectedKeyword === "NONE" || selectedKeyword === "none") {
        console.log('⚠️  Gemini AI: 모든 후보가 기존 게시글과 유사하다고 판단');
        console.log('🔄 유사도가 가장 낮은 키워드를 선택합니다...');
        // 단어 기반 유사도로 가장 낮은 키워드 선택
        return this.selectLowestSimilarityKeyword(candidateKeywords, existingTitles);
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
        console.log(`🔄 유사도가 가장 낮은 키워드를 선택합니다...`);
        // 단어 기반 유사도로 가장 낮은 키워드 선택
        return this.selectLowestSimilarityKeyword(candidateKeywords, existingTitles);
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
   * 후보 중 가장 낮은 단어 유사도를 가진 키워드 선택
   * @param {Array<string>} candidates - 후보 키워드 배열
   * @param {Array<string>} existingTitles - 기존 게시글 제목 배열
   * @returns {string} 가장 유사도 낮은 키워드
   */
  selectLowestSimilarityKeyword(candidates, existingTitles) {
    let lowestKeyword = candidates[0];
    let lowestMaxSimilarity = 100;
    
    for (const keyword of candidates) {
      let maxSimilarity = 0;
      
      // 각 키워드에 대해 모든 기존 제목과 비교하여 최대 유사도 계산
      for (const existingTitle of existingTitles) {
        const similarity = this.calculateWordBasedSimilarity(keyword, existingTitle);
        if (similarity > maxSimilarity) {
          maxSimilarity = similarity;
        }
      }
      
      // 최대 유사도가 가장 낮은 키워드 선택
      if (maxSimilarity < lowestMaxSimilarity) {
        lowestMaxSimilarity = maxSimilarity;
        lowestKeyword = keyword;
      }
    }
    
    console.log(`  → 최저 단어 유사도: ${lowestMaxSimilarity}점`);
    return lowestKeyword;
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
- 0-30: Completely different
- 31-50: Related but distinct (ACCEPTABLE)
- 51-70: Similar
- 71-85: Very similar
- 86-100: Nearly identical

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
   * Evergreen 키워드 수집 (다양한 키워드 생성)
   * @returns {Promise<Array<string>>} 선택된 키워드 배열 (최대 15개)
   */
  async harvestAllKeywords() {
    console.log('🌲 다양한 키워드 생성 시작...');

    // 1. 블로그 최근 50개 게시글 제목 가져오기
    let recentTitles = [];
    if (this.bloggerPublisher) {
      const allTitles = await this.bloggerPublisher.getAllPostTitles();
      recentTitles = allTitles.slice(0, 50); // 최근 50개만
      console.log(`📋 최근 블로그 게시글 ${recentTitles.length}개 제목 가져오기 완료`);
    } else {
      console.log('⚠️  BloggerPublisher 미설정. 중복 체크 없이 진행');
    }

    // 2. 한 번에 여러 개의 다양한 키워드 생성
    console.log('\n🎯 다양한 IT 키워드 일괄 생성 중...');
    const itKeywords = await this.generateMultipleKeywords('IT', recentTitles, 10);
    
    console.log(`✅ IT 키워드 ${itKeywords.length}개 생성 완료`);
    
    // 3. 생성된 키워드 중에서 사용된 키워드 제외
    const newKeywords = await this.getNewKeywords(itKeywords);
    
    if (newKeywords.length > 0) {
      console.log(`\n🎉 새로운 키워드 ${newKeywords.length}개 발견!`);
      return newKeywords.slice(0, 15); // 최대 15개 반환
    }

    // 4. 새로운 키워드가 없으면 생성된 키워드 중에서 가장 유사도가 낮은 것 선택
    if (itKeywords.length > 0) {
      console.log('\n⚠️  모든 키워드가 사용되었지만, 유사도가 낮은 키워드를 선택합니다...');
      return itKeywords.slice(0, 5); // 최소 5개는 반환
    }

    console.error(`\n❌ 키워드 생성 실패`);
    return [];
  }

  /**
   * 한 번에 여러 개의 다양한 키워드 생성
   * @param {string} category - 'IT' 또는 'Finance'
   * @param {Array<string>} recentTitles - 최근 게시글 제목 배열
   * @param {number} count - 생성할 키워드 개수
   * @returns {Promise<Array<string>>} 생성된 키워드 배열
   */
  async generateMultipleKeywords(category, recentTitles, count = 10) {
    try {
      console.log(`🤖 AI에게 다양한 ${category} 키워드 ${count}개 요청 중...`);
      
      const prompt = `
You are an expert content strategist. Generate ${count} diverse and unique ${category} topics that are currently trending in real-time searches.

**Category**: ${category === 'IT' ? 'Technology - ALL areas: AI, Software, Cloud, Security, Data, Web, Mobile, DevOps, IoT, Blockchain, Gaming, Hardware, Networking, etc.' : 'Finance - ALL areas: Personal Finance, Investment, Banking, Insurance, Real Estate, Tax, Retirement, Business, Trading, Crypto basics, etc.'}

**Recent Blog Post Titles (Last 50 posts - try to avoid exact duplicates, but some similarity is acceptable):**
${recentTitles.length > 0 ? recentTitles.slice(0, 30).map((title, i) => `${i + 1}. ${title}`).join('\n') : 'No existing posts'}

**Task:**
1. Generate ${count} diverse topics covering DIFFERENT subtopics within ${category}
2. Focus on topics that are CURRENTLY trending in real-time searches
3. Topics should be beginner-friendly and accessible to general public
4. Each topic should be specific and actionable
5. Length: 15-100 characters per topic
6. Language: ENGLISH only
7. Prioritize variety - cover different areas, tools, concepts, and use cases

**IMPORTANT for Diversity:**
- Generate topics from DIFFERENT subtopics (don't repeat the same area)
- Mix different difficulty levels (beginner, intermediate)
- Include both tools/services and concepts/theories
- Cover both practical "how-to" and explanatory "what-is" topics
- Some similarity with existing posts is ACCEPTABLE if the topic is different enough

**Return Format:**
Return ONLY the topics, one per line, NO numbers, NO explanations, NO formatting.
Example:
Topic 1
Topic 2
Topic 3
...

${count} Diverse Topics:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      // 여러 줄에서 키워드 추출
      const keywords = text
        .split('\n')
        .map(line => {
          // 번호 제거 (1., 2., - 등)
          let cleaned = line.replace(/^\d+[\.\)]\s*/, '').trim();
          cleaned = cleaned.replace(/^[-•]\s*/, '').trim();
          // 따옴표 제거
          cleaned = cleaned.replace(/^["'](.+)["']$/, '$1').trim();
          return cleaned;
        })
        .filter(keyword => 
          keyword.length >= 10 && 
          keyword.length <= 150 && 
          keyword.toLowerCase() !== 'none' &&
          keyword.length > 0
        )
        .slice(0, count);
      
      console.log(`  ✅ ${keywords.length}개 키워드 추출 완료`);
      return keywords;
      
    } catch (error) {
      console.error(`${category} 키워드 생성 실패:`, error.message);
      return [];
    }
  }

  /**
   * AI에게 기존 게시글 핵심 키워드를 제외한 새로운 Evergreen 키워드 직접 요청
   * @param {string} category - 'IT' 또는 'Finance'
   * @param {Array<string>} recentTitles - 최근 게시글 제목 배열 (50개)
   * @returns {Promise<string|null>} 선택된 키워드
   */
  async generateUniqueEvergreenKeyword(category, recentTitles) {
    try {
      console.log(`🤖 AI에게 기존 핵심 키워드 제외하고 ${category} 키워드 요청 중...`);
      
      const prompt = `
You are an expert content strategist. Generate ONE unique ${category} Evergreen topic.

**Category**: ${category === 'IT' ? 'Technology (ALL areas: Programming, Hardware, Software, Networks, Security, AI, Cloud, Mobile, Web, DevOps, Data, Gaming, IoT, etc.)' : 'Finance (ALL areas: Personal Finance, Investment, Banking, Insurance, Real Estate, Tax, Retirement, Business, Trading, Crypto basics, etc.)'}

**Recent Blog Post Titles (Last 50 posts - AVOID these core topics/keywords):**
${recentTitles.length > 0 ? recentTitles.map((title, i) => `${i + 1}. ${title}`).join('\n') : 'No existing posts'}

**Task:**
1. Analyze the CORE KEYWORDS/CONCEPTS in the existing titles above
2. Generate ONE evergreen topic that uses COMPLETELY DIFFERENT core keywords/concepts
3. Explore DIVERSE and UNCOMMON subtopics within ${category}
4. Topic must be timeless and always searchable (not trendy)
5. Topic should be specific and actionable
6. Length: 15-100 characters
7. Language: ENGLISH only

**Explore DIVERSE subtopics:**
${category === 'IT' 
  ? `- Programming: Python, Java, JavaScript, C++, Rust, Go, TypeScript, Swift, Kotlin, R, MATLAB, Scala, etc.
- Web Development: HTML5, CSS3, React, Vue, Angular, Svelte, Node.js, Django, Flask, Laravel, Ruby on Rails, etc.
- Mobile Development: iOS (Swift/SwiftUI), Android (Kotlin/Java), React Native, Flutter, Xamarin, Ionic, etc.
- Databases: SQL, NoSQL, MySQL, PostgreSQL, MongoDB, Redis, Cassandra, Elasticsearch, Oracle, etc.
- Cloud & Infrastructure: AWS, Azure, GCP, Docker, Kubernetes, Terraform, Ansible, CloudFormation, etc.
- AI & Machine Learning: Neural Networks, Deep Learning, NLP, Computer Vision, Reinforcement Learning, etc.
- Cybersecurity: Encryption, Authentication, Network Security, Ethical Hacking, Penetration Testing, etc.
- DevOps: CI/CD, Jenkins, GitLab CI, GitHub Actions, Monitoring, Logging, Prometheus, Grafana, etc.
- Data Science: Data Analysis, Pandas, NumPy, Data Visualization, Statistical Modeling, etc.
- Hardware: CPU Architecture, GPU Computing, RAM, Storage Technologies, Network Equipment, etc.
- Game Development: Unity, Unreal Engine, Godot, Game Physics, Graphics Programming, Shader Programming, etc.
- Systems Programming: Operating Systems, Compilers, Interpreters, Memory Management, Concurrency, etc.
- Networking: TCP/IP, HTTP, DNS, Load Balancing, CDN, VPN, Network Protocols, etc.
- Quality Assurance: Unit Testing, Integration Testing, Test Automation, Performance Testing, etc.
- Other: IoT, Edge Computing, Blockchain Technology, AR/VR, Quantum Computing Basics, etc.`
  : `- Personal Finance: Budgeting, Saving Money, Emergency Funds, Debt Reduction, Financial Goals, etc.
- Stock Market: Stock Trading Basics, Market Analysis, Stock Valuation, Dividend Investing, etc.
- Bonds & Fixed Income: Government Bonds, Corporate Bonds, Bond Yields, Fixed Income Strategies, etc.
- Investment Funds: ETFs, Mutual Funds, Index Funds, Hedge Funds, REITs, etc.
- Retirement Planning: 401(k), IRA, Roth IRA, Pension Plans, Social Security, Annuities, etc.
- Real Estate: Home Buying, Mortgages, Real Estate Investing, Rental Properties, Commercial RE, etc.
- Tax Planning: Tax Deductions, Tax Credits, Tax-Advantaged Accounts, Capital Gains Tax, etc.
- Banking: Savings Accounts, Checking Accounts, Certificates of Deposit, Money Market Accounts, etc.
- Credit Management: Credit Scores, Credit Cards, Personal Loans, Credit Building, Debt Consolidation, etc.
- Insurance: Life Insurance, Health Insurance, Auto Insurance, Home Insurance, Disability Insurance, etc.
- Business Finance: Business Loans, Cash Flow Management, Business Accounting, Startup Funding, etc.
- Trading Strategies: Day Trading, Swing Trading, Options Trading, Futures, Technical Analysis, etc.
- Alternative Investments: Commodities, Precious Metals, Art, Collectibles, Peer-to-Peer Lending, etc.
- Cryptocurrency Basics: Blockchain Fundamentals, Crypto Wallets, Exchange Basics (education only), etc.
- Estate Planning: Wills, Trusts, Estate Tax, Inheritance Planning, Power of Attorney, etc.`
}

**IMPORTANT:**
- DO NOT repeat core keywords from existing titles
- Explore UNCOMMON and UNDERREPRESENTED topics
- Be CREATIVE and think outside the box
- Return ONLY the topic text (one line)
- NO explanations, NO numbers, NO formatting
- If impossible to find unique topic, return "NONE"

New Evergreen Topic:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let keyword = response.text().trim();
      
      // 첫 번째 줄만 추출 (여러 줄 응답 대비)
      keyword = keyword.split('\n')[0].trim();
      
      // 따옴표 제거
      keyword = keyword.replace(/^["'](.+)["']$/, '$1');
      
      // "Topic:" 같은 접두사 제거
      keyword = keyword.replace(/^(Topic:|New Topic:|Unique Topic:|New Evergreen Topic:)\s*/i, '').trim();
      
      console.log(`  📝 추출된 키워드: "${keyword}"`);
      
      // "NONE" 체크 및 길이 검증
      if (keyword === "NONE" || keyword === "none" || keyword.length < 10 || keyword.length > 150) {
        console.log(`  ❌ AI: 유효하지 않은 키워드 (길이: ${keyword.length})`);
        return null;
      }
      
      // 3. 추가 의미론적 검증 안 함 (AI가 이미 체크했으므로)
      console.log(`  ✅ 키워드 생성 완료 (추가 검증 없이 사용)`);
      
      return keyword;
      
    } catch (error) {
      console.error(`${category} 키워드 생성 실패:`, error.message);
      return null;
    }
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
      // 고사성어 카테고리에서 기존 목록 수집
      const usedGosaList = await this.gosaCollector.getUsedGosaList();
      console.log(`📚 기존 고사성어 ${usedGosaList.length}개 확인 완료`);
      
      // 새로운 고사성어 생성 (기존 목록 제외)
      const newGosa = await this.generateNewGosa(usedGosaList);
      
      if (!newGosa) {
        console.log('⚠️  새로운 고사성어를 찾을 수 없습니다.');
        return [];
      }
      
      console.log(`✅ 선택된 고사성어: ${newGosa}`);
      
      // 선택된 고사성어를 데이터베이스에 저장
      await this.db.saveUsedKeyword(newGosa);
      
      console.log(`Successfully harvested and saved new 고사성어: ${newGosa}`);
      return [newGosa];
    } catch (error) {
      console.error('Failed to harvest and save keywords:', error);
      return [];
    }
  }

  /**
   * 새로운 고사성어 생성 (AI 사용하지 않고 직접 선택)
   * @param {Array<string>} usedGosaList - 사용된 고사성어 목록
   * @returns {Promise<string|null>} 새로운 고사성어
   */
  async generateNewGosa(usedGosaList) {
    try {
      console.log('📚 사용 가능한 고사성어 목록에서 선택 중...');
      
      // 일반적인 고사성어 목록 (AI 호출 없이 직접 사용)
      const commonGosa = [
        '관포지교', '결자해지', '고식지계', '노심초사', '사필귀정', '점입가경',
        '백이숙제', '근하신년', '교토삼굴', '과유불급', '구우일모', '금의환향',
        '다다익선', '대기만성', '도원결의', '동고동락', '마이동풍', '막역지우',
        '면종복배', '백년해로', '백문불여일견', '백절불굴', '반포지효', '방약무인',
        '비일비재', '사면초가', '삼고초려', '상전벽해', '새옹지마', '설상가상',
        '수어지교', '순망치한', '시시비비', '십시일반', '아비규환', '안하무인',
        '어부지리', '역지사지', '오비이락', '오십보백보', '와신상담', '완벽무결',
        '유비무환', '일석이조', '일신우일신', '일확천금', '입신양명', '자업자득',
        '작심삼일', '장부일언', '전화위복', '조삼모사', '주경야독', '지록위마',
        '천고마비', '청출어람', '초지일관', '타산지석', '파죽지세', '필부필부',
        '한단지몽', '화룡점정', '회자정리', '후생가외', '형우제공', '기고만장',
        '풍수지탄', '불문곡직', '과유불급', '구우일모', '금의환향', '다다익선'
      ];
      
      // 사용되지 않은 고사성어 필터링
      const availableGosa = commonGosa.filter(gosa => !usedGosaList.includes(gosa));
      
      if (availableGosa.length === 0) {
        console.warn('⚠️  모든 일반 고사성어가 사용됨');
        return null;
      }
      
      // 랜덤 선택 (AI 호출 없음)
      const randomIndex = Math.floor(Math.random() * availableGosa.length);
      const selectedGosa = availableGosa[randomIndex];
      
      console.log(`✅ 선택된 고사성어: ${selectedGosa} (AI 호출 없이 직접 선택)`);
      return selectedGosa;
      
    } catch (error) {
      console.error('고사성어 선택 실패:', error);
      return null;
    }
  }
}

export default KeywordHarvester;
