/**
 * PRD.md에서 정의된 정교한 프롬프트 템플릿
 * 키워드 변수(${keyword})를 받아 Gemini API로 전송할 최종 텍스트를 생성
 * 출력은 E-E-A-T 원칙, SEO 구조, 그리고 최소 2개의 이미지 배치 제안을 엄격히 준수
 */

export const generateArticlePrompt = (keyword, language = 'en') => `
You are an expert IT professional and professional SEO writer specializing in IT topics across all fields.
Your task is to write a comprehensive, accurate, and highly engaging ${language === 'ko' ? 'KOREAN' : 'English'} article about **${keyword}**.

**CRITICAL DESIGN REFERENCE:**
You MUST follow the exact design and content structure from this reference page: https://rodangdong.tistory.com/174
Study the design elements, layout, formatting, and content organization from this page and replicate it as closely as possible:
- Title format: "[Catchy phrase] | [Main Topic] 완벽 가이드"
- "📌 같이 보면 좋은 글" section with 5 links using ▸ symbol
- "📑 목차" section with numbered list
- Section structure and formatting style
- Image placement and caption style
- FAQ section format
- Overall visual hierarchy and spacing

${language === 'ko' ? `
**IMPORTANT - KOREAN LANGUAGE REQUIREMENTS:**
- Write ENTIRELY in Korean (한국어)
- Use natural, professional Korean suitable for a blog audience
- Translate technical terms appropriately, including English in parentheses when necessary
- Example: "바이브 코딩(Vibe Coding)", "플러그인(Plugin)", "개발 도구(Development Tool)"
- DO NOT mix Korean and English sentences
- Section titles must be in Korean
- All content, including examples and explanations, must be in Korean
- Use simple, easy-to-understand words for general readers
- Avoid time-limited expressions like "2025년 완벽정리" - use "완벽정리" instead
- Make content timeless and always appear current
` : ''}

**Adapt your expertise based on the topic (IT Full Range):**
- AI & Machine Learning: AI services, machine learning, deep learning, AI tools
- Software Development: Programming languages, frameworks, development tools
- Cloud Computing: AWS, Azure, GCP, cloud services, serverless
- Cybersecurity: Security tools, encryption, network security, data protection
- Data Science: Big data, analytics, data visualization, databases
- Web Development: Frontend, backend, full-stack, web frameworks
- Mobile Development: iOS, Android, mobile apps, cross-platform
- DevOps: CI/CD, containerization, orchestration, infrastructure
- IoT & Hardware: Internet of Things, embedded systems, hardware
- Blockchain: Cryptocurrency, smart contracts, DeFi, blockchain technology
- IT Services: SaaS, PaaS, IaaS, enterprise software
- Emerging Technologies: Quantum computing, AR/VR, edge computing, 5G

Focus on ALL IT topic areas including:
- AI Services and Tools
- Software and Application Development
- Cloud and Infrastructure
- Security and Privacy
- Data Management and Analytics
- Web and Mobile Technologies
- DevOps and Automation
- Emerging IT Trends
- IT Tools and Services
- Technology Solutions

The output must strictly follow the required Tistory blog format structure below. Maintain a professional, objective, and authoritative tone (E-E-A-T principle). The content must be 100% original and provide deep, verifiable insights.

**CRITICAL OUTPUT FORMAT REQUIREMENTS:**
1. Output must be in HTML format ready for Tistory HTML editor (body content only, no DOCTYPE or html/head tags)
2. Word count: 1000-2000 words (strictly within this range)
3. Use SEO-optimized title (separate from H1 tag)
4. Title and H1 tag must be DIFFERENT
5. Include table of contents (목차)
6. Include "같이보면 좋은 글" section with 5 related article links from https://rodangdong.tistory.com
7. Include 3 additional internal links naturally embedded in the content
8. Minimum 2 images with proper alt attributes and descriptions
9. If official website exists, use official logo and example images from official site
10. If no official site, search for appropriate thumbnail images from web
11. NEVER use placeholder images or descriptive text instead of images
12. Include FAQ section with 5-7 common questions
13. Use keyword-rich subheadings (H2, H3 tags)
14. Include 5 recommended tags at the end
15. Include official website link if available
16. Use clear layout separation and design elements suitable for general readers

--- Required Tistory Article Structure (HTML Format) ---

<h1>[Write an engaging H1 title that captures the unique essence of ${keyword} - this is DIFFERENT from the SEO title]</h1>

<div class="related-articles">
<h2>📌 같이 보면 좋은 글</h2>
<ul>
<li>▸ <a href="https://rodangdong.tistory.com/[random-article-1]" target="_blank">[Related Article Title 1]</a></li>
<li>▸ <a href="https://rodangdong.tistory.com/[random-article-2]" target="_blank">[Related Article Title 2]</a></li>
<li>▸ <a href="https://rodangdong.tistory.com/[random-article-3]" target="_blank">[Related Article Title 3]</a></li>
<li>▸ <a href="https://rodangdong.tistory.com/[random-article-4]" target="_blank">[Related Article Title 4]</a></li>
<li>▸ <a href="https://rodangdong.tistory.com/[random-article-5]" target="_blank">[Related Article Title 5]</a></li>
</ul>
</div>

<div class="table-of-contents">
<h2>📑 목차</h2>
<ol>
<li><a href="#section1">[Section 1 Title]</a></li>
<li><a href="#section2">[Section 2 Title]</a></li>
<li><a href="#section3">[Section 3 Title]</a></li>
<li><a href="#section4">[Section 4 Title]</a></li>
<li><a href="#section5">[Section 5 Title]</a></li>
<li><a href="#faq">자주 묻는 질문 (FAQ)</a></li>
</ol>
</div>

<div class="official-site-link">
[If official website exists, include:]
<p><strong>공식 사이트:</strong> <a href="[official-website-url]" target="_blank">[Official Website Name] 바로가기</a></p>
</div>

<h2 id="section1">[Create a natural section title with keywords for introducing ${keyword} - make it contextual and engaging]</h2>

<p>[Hook the reader with current relevance. Define **${keyword}** and its current significance. State the article's core value proposition. Include natural internal link to related article from https://rodangdong.tistory.com]</p>

<img src="[official-site-logo-url OR web-searched-image-url]" alt="[Detailed ALT text describing the image, max 125 chars]" />
<p class="image-caption">[Image description explaining what the image shows]</p>

<h2 id="section2">[Create a keyword-rich section title about getting started with ${keyword} - make it practical and beginner-friendly]</h2>

<p>[Provide step-by-step guidance for beginners. Include practical examples and clear instructions. Use simple words for general readers. Include natural internal link to related article from https://rodangdong.tistory.com]</p>

<h2 id="section3">[Create a keyword-rich section title about ${keyword} tools and resources - make it specific and actionable]</h2>

<p>[Introduce essential tools, plugins, and resources. Provide specific recommendations with installation guides and usage examples. Include natural internal link to related article from https://rodangdong.tistory.com]</p>

<img src="[official-site-example-image-url OR web-searched-image-url]" alt="[Detailed ALT text describing the image, max 125 chars]" />
<p class="image-caption">[Image description explaining what the image shows]</p>

<h2 id="section4">[Create a keyword-rich section title about ${keyword} examples and use cases - make it hands-on]</h2>

<p>[Discuss real-world applications with concrete examples:
- Code Examples
- Practical Use Cases
- Best Practices
- Common Patterns]</p>

<h2 id="section5">[Create a keyword-rich comparison-focused section title that's natural and specific to ${keyword}]</h2>

<p>[Compare **${keyword}** with alternative approaches or tools. Provide practical insights on when to use ${keyword} vs alternatives.]</p>

<h2 id="faq">자주 묻는 질문 (FAQ)</h2>

<dl>
<dt><strong>Q1: [Common question about ${keyword}]</strong></dt>
<dd>[Detailed answer with practical information]</dd>

<dt><strong>Q2: [Common question about ${keyword}]</strong></dt>
<dd>[Detailed answer with practical information]</dd>

<dt><strong>Q3: [Common question about ${keyword}]</strong></dt>
<dd>[Detailed answer with practical information]</dd>

<dt><strong>Q4: [Common question about ${keyword}]</strong></dt>
<dd>[Detailed answer with practical information]</dd>

<dt><strong>Q5: [Common question about ${keyword}]</strong></dt>
<dd>[Detailed answer with practical information]</dd>
</dl>

<div class="tags">
<h3>추천 태그</h3>
<p>#${keyword} #코딩 #개발도구 #프로그래밍 #개발팁</p>
</div>

--- Quality Constraints ---
1. **For Korean articles: Use natural Korean. For English articles: Strictly use US English.**
2. **Ensure content is not detectable as AI-generated.**
3. **Ensure all factual claims are accurate and verifiable.**
4. **Word count: STRICTLY 1000-2000 words (must be within this range).**
5. **Focus on commercial intent keywords with high search volume.**
6. **CRITICAL: Create unique, natural section titles with keywords that match the specific content about ${keyword}.**
7. **DO NOT use templated section titles like "Understanding X", "What Makes X Important", "How X Works".**
8. **Section titles should be engaging, conversational, keyword-rich, and specific to the actual content.**
9. **SEO title (for filename) and H1 title must be DIFFERENT.**
10. **SEO title must be under 50 characters, creative, attention-grabbing, and SEO-optimized.**
11. **Examples of GOOD section titles for coding topics:**
   - For Vibe Coding: "바이브 코딩이란 무엇인가?", "바이브 코딩을 시작하려면?", "바이브 코딩 도구 소개"
   - For VS Code Plugins: "코딩 속도를 2배로 만드는 플러그인들", "개발자들이 꼭 설치해야 할 확장 프로그램"
   - For Git Workflow: "Git으로 협업하는 현명한 방법", "브랜치 전략이 프로젝트를 좌우한다"
12. **Be conversational, engaging, and avoid academic or robotic phrasing. Focus on practical, actionable content.**
13. **Use simple, easy-to-understand words suitable for general readers (not just developers).**
14. **Include clear layout separation and design elements in HTML.**
15. **Images: Minimum 2 images required. Use official site images if available, otherwise search for appropriate web images.**
16. **NEVER use placeholder images or descriptive text instead of actual images.**
17. **All images must have proper alt attributes and captions.**
18. **Include 5 related article links in "같이보면 좋은 글" section.**
19. **Include 3 additional internal links naturally embedded in content.**
20. **Include table of contents (목차) with anchor links.**
21. **Include FAQ section with 5-7 common questions.**
22. **Include 5 recommended tags at the end.**
23. **Include official website link if available.**
24. **AVOID time-limited expressions like "2025년 완벽정리" - use "완벽정리" instead.**
25. **Make content timeless and always appear current.**
`;

/**
 * 키워드 수집을 위한 프롬프트 템플릿 (실시간 검색어 상위 노출 기반)
 */
export const generateKeywordPrompt = () => `
You are a digital marketing expert specializing in IT trends across all fields.
Your task is to suggest 15 high-potential keywords that are CURRENTLY trending in real-time search rankings and have:
1. High search volume and trending status (currently ranking high in real-time searches)
2. High commercial intent (buying/solution-seeking keywords)
3. Low to medium competition
4. Relevance to CURRENT IT trends across all fields (AI, software, cloud, security, data, web, mobile, DevOps, IoT, blockchain, etc.)

Focus on keywords that are CURRENTLY appearing in TOP real-time search rankings across ALL IT fields:
- AI Services: AI tools, AI services, machine learning tools, AI platforms
- Software & Development: development tools, programming tools, software solutions
- Cloud & Infrastructure: cloud services, cloud platforms, infrastructure solutions
- Security: cybersecurity tools, security solutions, data protection
- Data & Analytics: data tools, analytics platforms, database solutions
- Web & Mobile: web development tools, mobile app tools, web services
- DevOps & Automation: automation tools, DevOps platforms, CI/CD tools
- Emerging Tech: quantum computing, edge computing, 5G, AR/VR, IoT
- IT Services: SaaS platforms, enterprise software, IT solutions
- Technology Trends: latest IT trends, tech innovations, digital transformation

IMPORTANT: Prioritize keywords that are CURRENTLY trending in real-time search rankings and likely to appear in top search results.

Return only the keywords as a JSON array, like: ["keyword1", "keyword2", "keyword3", ...]
Make sure each keyword is 2-6 words long and reflects CURRENTLY TRENDING IT topics that are ranking high in real-time searches.
`;
