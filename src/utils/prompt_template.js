/**
 * PRD.md에서 정의된 정교한 프롬프트 템플릿
 * 키워드 변수(${keyword})를 받아 Gemini API로 전송할 최종 텍스트를 생성
 * 출력은 E-E-A-T 원칙, SEO 구조, 그리고 최소 2개의 이미지 배치 제안을 엄격히 준수
 */

export const generateArticlePrompt = (keyword, language = 'en') => `
You are a friendly IT guide and professional SEO writer who explains IT topics in a simple, easy-to-understand way for beginners and general public.
Your task is to write a comprehensive, accurate, and highly engaging ${language === 'ko' ? 'KOREAN' : 'English'} article about **${keyword}** for people who are NOT IT experts.

**TARGET AUDIENCE:**
- General public with little to no IT background
- IT beginners who are just starting to learn
- People who want to understand IT concepts without technical jargon
- Non-technical users who need practical IT solutions

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
**IMPORTANT - KOREAN LANGUAGE REQUIREMENTS FOR BEGINNERS:**
- Write ENTIRELY in Korean (한국어)
- Use friendly, conversational Korean like explaining to a friend
- AVOID technical jargon and complex IT terminology
- When technical terms are necessary, explain them in simple everyday language first
- Use analogies and real-life examples to explain complex concepts
- Example: Instead of "API를 통해 데이터를 전송한다" → "간단히 말해, API는 서로 다른 프로그램들이 대화할 수 있게 해주는 통역사 같은 역할을 해요"
- DO NOT mix Korean and English sentences
- Section titles must be in Korean and easy to understand
- All content must be accessible to people with zero IT background
- Use simple, everyday words that anyone can understand
- Write as if explaining to someone who has never heard of the topic before
- Use "~해요", "~입니다" ending for friendly tone
- Avoid time-limited expressions like "2025년 완벽정리" - use "완벽정리" instead
- Make content timeless and always appear current
- Focus on practical benefits and real-world applications rather than technical details
` : ''}

**Explain IT topics in beginner-friendly way (IT Full Range):**
When writing about IT topics, always explain them as if the reader has never heard of them before:
- AI & Machine Learning: Explain what AI is, how it helps in daily life, simple AI tools anyone can use
- Software Development: Explain what software is, how apps are made, tools that help create programs
- Cloud Computing: Explain cloud storage in simple terms, how to use cloud services, benefits for everyday users
- Cybersecurity: Explain online safety in simple terms, how to protect personal information, easy security tips
- Data Science: Explain what data means, how data helps make decisions, simple data tools
- Web Development: Explain how websites work, tools to create websites, simple web services
- Mobile Development: Explain how mobile apps are made, tools for creating apps, popular app platforms
- DevOps: Explain how software is delivered, automation in simple terms, tools that make work easier
- IoT & Hardware: Explain smart devices, how everyday objects connect to internet, practical IoT examples
- Blockchain: Explain blockchain in simple terms, how it's used in daily life, cryptocurrency basics
- IT Services: Explain online services, software subscriptions, tools for businesses and individuals
- Emerging Technologies: Explain new technologies in simple terms, how they affect daily life, practical applications

**Writing Style for Beginners:**
- Start with "이것이 무엇인지 궁금하셨나요?" or similar friendly opening
- Use everyday analogies: "클라우드는 마치 인터넷에 있는 거대한 창고 같아요"
- Explain benefits first, technical details later (or skip if too complex)
- Focus on "왜 필요한가?", "어떻게 사용하나?", "무엇이 좋은가?"
- Use step-by-step guides with simple language
- Include "초보자도 따라할 수 있는" examples
- Avoid deep technical explanations unless absolutely necessary

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
**EXACTLY match the design from https://rodangdong.tistory.com/225**

<h1>[Write an engaging H1 title that captures the unique essence of ${keyword} - this is DIFFERENT from the SEO title. Make it catchy and attention-grabbing like "MS 에이전트 365로 바뀌는 업무 혁신, AI가 일하는 시대"]</h1>

<h3>📌 같이 보면 좋은 글</h3>

<ul>
<li>▸ <a href="https://rodangdong.tistory.com/[random-article-1]" target="_blank">[Related Article Title 1]</a></li>
<li>▸ <a href="https://rodangdong.tistory.com/[random-article-2]" target="_blank">[Related Article Title 2]</a></li>
<li>▸ <a href="https://rodangdong.tistory.com/[random-article-3]" target="_blank">[Related Article Title 3]</a></li>
<li>▸ <a href="https://rodangdong.tistory.com/[random-article-4]" target="_blank">[Related Article Title 4]</a></li>
<li>▸ <a href="https://rodangdong.tistory.com/[random-article-5]" target="_blank">[Related Article Title 5]</a></li>
</ul>

<h1>[Write the main H1 title again - this is the actual article title, different from the SEO title above. Example: "MS 에이전트 365, AI가 직접 일하는 새로운 업무 환경"]</h1>

<p>[Start with an engaging opening paragraph that hooks the reader. Explain what ${keyword} is and why it matters. Use friendly, conversational tone. This paragraph should be 2-3 sentences that immediately capture attention. Include context and significance.]</p>

<h2>📋 목차</h2>

<ol>
<li>[Section 1 Title]</li>
<li>[Section 2 Title]</li>
<li>[Section 3 Title]</li>
<li>[Section 4 Title]</li>
<li>[Section 5 Title]</li>
<li>[Section 6 Title or FAQ]</li>
</ol>

[If official website exists, include this right after 목차:]
<p><strong>공식 사이트:</strong> <a href="[official-website-url]" target="_blank">[Official Website Name] 바로가기</a></p>

<h2>[Section 1 Title - use format like "${keyword}란 무엇인가: [subtitle]" or "${keyword}란 무엇인가: [descriptive subtitle]"]</h2>

<p>[Start with an engaging paragraph that explains what ${keyword} is. Use friendly, conversational tone. Include key concepts and why it matters. This should be 2-3 sentences.]</p>

<p>[Continue with more details, examples, or context. This should be 1-2 more paragraphs. Include natural internal link to related article from https://rodangdong.tistory.com using format: <strong>🔗 관련 자료:</strong> <a href="https://rodangdong.tistory.com/[article-id]" target="_blank">[link text]</a>도 함께 확인해보세요.]</p>

<p><strong>💡 핵심 포인트:</strong> [One key insight or important fact about ${keyword}]</p>

<p>[Image placement - after first section content, before next section]</p>
<img src="[official-site-logo-url OR web-searched-image-url]" alt="[Detailed ALT text describing the image, max 125 chars]" />
<p>[Image caption text describing what the image shows - natural, friendly description]</p>

<h2>[Section 2 Title - use format like "[Catchy phrase]: [subtitle]" or "[Action-oriented title]: [descriptive subtitle]"]</h2>

<p>[Write engaging content explaining the second main topic. Use friendly, conversational tone. Include practical examples and real-world scenarios. This should be 2-3 sentences.]</p>

<p>[Continue with more details or examples. This should be 1-2 more paragraphs. Include natural internal link using format: <strong>🔗 관련 자료:</strong> <a href="https://rodangdong.tistory.com/[article-id]" target="_blank">[link text]</a>도 함께 확인해보세요.]</p>

[If applicable, include highlight box:]
<p><strong>💡 핵심 포인트:</strong> [One key insight]</p>

<h2>[Section 3 Title - use format like "핵심 기능 [number]가지: [subtitle]" or "[Feature category]: [descriptive subtitle]"]</h2>

<p>[Write introductory paragraph about key features, tools, or capabilities. Use friendly, conversational tone.]</p>

<h3>1. [Feature/Tool Name 1]</h3>
<p>[Description of feature 1 in simple terms. This should be 1-2 sentences.]</p>

<h3>2. [Feature/Tool Name 2]</h3>
<p>[Description of feature 2 in simple terms. This should be 1-2 sentences.]</p>

<h3>3. [Feature/Tool Name 3]</h3>
<p>[Description of feature 3 in simple terms. This should be 1-2 sentences.]</p>

[Continue with more features as needed. Include natural internal link using format:]
<p><strong>🔗 유사 도구:</strong> <a href="https://rodangdong.tistory.com/[article-id]" target="_blank">[link text]</a>을 활용해보세요.</p>

<p>[Image placement - after section 3 content]</p>
<img src="[official-site-example-image-url OR web-searched-image-url]" alt="[Detailed ALT text describing the image, max 125 chars]" />
<p>[Image caption text - natural, friendly description]</p>

<h2>[Section 4 Title - use format like "[Action-oriented title]: [subtitle]" or "[Use case title]: [descriptive subtitle]"]</h2>

<p>[Write content about practical applications, use cases, or real-world examples. Use friendly, conversational tone. Include specific examples that readers can relate to. This should be 2-3 sentences.]</p>

<p>[Continue with more examples or scenarios. Include practical scenarios like "예를 들어, ~할 때 이렇게 사용할 수 있어요". This should be 1-2 more paragraphs.]</p>

<h2>[Section 5 Title - use format like "[Comparison/Conclusion title]: [subtitle]" or "[Final insights title]: [descriptive subtitle]"]</h2>

<p>[Write concluding content, comparisons, or final insights. Use friendly, conversational tone. Help readers understand when to use ${keyword} vs alternatives, or summarize key takeaways. This should be 2-3 sentences.]</p>

<p>[Continue with final thoughts or recommendations. This should be 1-2 more paragraphs.]</p>

<h2>자주 묻는 질문 (FAQ)</h2>

<p><strong>Q1: [Beginner-friendly question about ${keyword} - use simple language like "${keyword}이 정확히 뭔가요?", "초보자도 사용할 수 있나요?"]</strong></p>

<p>A1: [Answer in very simple, friendly language. Use everyday examples. Avoid technical jargon. Explain as if talking to a friend. This should be 2-3 sentences.]</p>

<p><strong>Q2: [Practical question beginners would ask - like "어떻게 시작하나요?", "비용이 얼마인가요?", "어디서 사용할 수 있나요?"]</strong></p>

<p>A2: [Answer with practical, actionable information in simple terms. Focus on "어떻게", "얼마나", "어디서" in everyday language. This should be 2-3 sentences.]</p>

<p><strong>Q3: [Common beginner concern - like "어렵지 않나요?", "무료로 사용할 수 있나요?", "어떤 장점이 있나요?"]</strong></p>

<p>A3: [Reassure and explain benefits in simple terms. Use friendly, encouraging tone. This should be 2-3 sentences.]</p>

<p><strong>Q4: [Practical usage question - like "언제 사용하면 좋나요?", "다른 것과 뭐가 다른가요?"]</strong></p>

<p>A4: [Answer with practical examples and simple comparisons. Use everyday situations. This should be 2-3 sentences.]</p>

<p><strong>Q5: [Beginner troubleshooting question - like "문제가 생기면 어떻게 하나요?", "도움이 필요하면 어디서 받을 수 있나요?"]</strong></p>

<p>A5: [Provide simple solutions and helpful resources. Use encouraging, supportive tone. This should be 2-3 sentences.]</p>

[Add more Q&A pairs as needed, up to 7 total]

<hr />

<p><strong>추천 태그:</strong> #${keyword} #[related-tag-1] #[related-tag-2] #[related-tag-3] #[related-tag-4] #[related-tag-5]</p>

--- Quality Constraints for Beginner-Friendly Content ---
1. **For Korean articles: Use friendly, conversational Korean like talking to a friend. For English articles: Strictly use US English.**
2. **Ensure content is not detectable as AI-generated - write naturally and warmly.**
3. **Ensure all factual claims are accurate and verifiable.**
4. **Word count: STRICTLY 1000-2000 words (must be within this range).**
5. **Focus on commercial intent keywords with high search volume, but explain them in beginner-friendly terms.**
6. **CRITICAL: Create unique, friendly section titles that beginners can easily understand.**
7. **DO NOT use templated or technical section titles. Use friendly, question-based titles like "${keyword}이란 무엇인가요?"**
8. **Section titles should be engaging, conversational, friendly, and easy to understand for non-technical readers.**
9. **SEO title (for filename) and H1 title must be DIFFERENT.**
10. **SEO title must be under 50 characters, creative, attention-grabbing, and SEO-optimized.**
11. **Examples of GOOD beginner-friendly section titles:**
   - For AI Tools: "AI 도구란 무엇인가요?", "초보자도 사용할 수 있는 AI 도구 추천", "AI 도구 실제 활용 사례"
   - For Cloud Services: "클라우드가 뭔가요? 쉽게 알아보기", "클라우드 서비스 시작하기", "일상생활에서 클라우드 활용하기"
   - For Security: "온라인 보안이 왜 중요한가요?", "초보자도 할 수 있는 보안 팁", "개인정보 보호하는 방법"
12. **Be conversational, warm, and friendly. Write as if explaining to a friend who knows nothing about IT.**
13. **Use simple, everyday words. Avoid technical jargon completely. If technical terms are unavoidable, explain them in simple words first.**
14. **Include clear layout separation and design elements in HTML.**
15. **Images: Minimum 2 images required. Use official site images if available, otherwise search for appropriate web images.**
16. **NEVER use placeholder images or descriptive text instead of actual images.**
17. **All images must have proper alt attributes and captions in simple language.**
18. **Include 5 related article links in "같이보면 좋은 글" section.**
19. **Include 3 additional internal links naturally embedded in content.**
20. **Include table of contents (목차) with anchor links.**
21. **Include FAQ section with 5-7 beginner-friendly questions (not technical questions).**
22. **Include 5 recommended tags at the end.**
23. **Include official website link if available.**
24. **AVOID time-limited expressions like "2025년 완벽정리" - use "완벽정리" instead.**
25. **Make content timeless and always appear current.**
26. **CRITICAL: Write for people with ZERO IT background. Assume readers know nothing about the topic.**
27. **Use analogies and real-life examples extensively. Compare IT concepts to everyday things.**
28. **Focus on practical benefits and "why should I care?" rather than technical "how it works".**
29. **Use friendly sentence endings like "~해요", "~입니다" to create warm, approachable tone.**
30. **Avoid complex sentence structures. Use short, clear sentences.**
`;

/**
 * 키워드 수집을 위한 프롬프트 템플릿 (실시간 검색어 상위 노출 기반 - 다양성 강화)
 */
export const generateKeywordPrompt = () => `
You are a digital marketing expert specializing in IT trends across all fields.
Your task is to suggest 30 DIVERSE high-potential keywords that are CURRENTLY trending in real-time search rankings.

**Requirements:**
1. High search volume and trending status (currently ranking high in real-time searches)
2. High commercial intent (buying/solution-seeking keywords)
3. Low to medium competition
4. MAXIMUM DIVERSITY - cover different IT areas, tools, concepts, and use cases
5. Beginner-friendly topics that general public can understand

**CRITICAL - DIVERSITY REQUIREMENT:**
Generate keywords from MANY DIFFERENT IT areas to ensure variety:
- AI & Machine Learning: AI tools, AI services, machine learning platforms, AI assistants
- Software & Development: programming tools, development environments, code editors, software solutions
- Cloud & Infrastructure: cloud services, cloud platforms, serverless, infrastructure tools
- Security & Privacy: cybersecurity tools, security solutions, data protection, encryption tools
- Data & Analytics: data tools, analytics platforms, database solutions, BI tools
- Web Development: web frameworks, web tools, frontend/backend tools, web services
- Mobile Development: mobile app tools, cross-platform tools, mobile frameworks
- DevOps & Automation: automation tools, CI/CD platforms, monitoring tools, deployment tools
- IoT & Hardware: IoT platforms, smart devices, hardware tools, embedded systems
- Blockchain & Crypto: blockchain tools, crypto wallets, DeFi platforms (educational only)
- Gaming: game development tools, game engines, gaming platforms
- Networking: network tools, VPN services, CDN services, network monitoring
- Productivity: productivity tools, collaboration tools, project management tools
- Design & Creative: design tools, UI/UX tools, creative software
- Emerging Tech: quantum computing basics, edge computing, 5G, AR/VR tools, metaverse basics

**Diversity Strategy:**
- Mix different difficulty levels (beginner, intermediate)
- Include both tools/services and concepts/theories
- Cover both practical "how-to" and explanatory "what-is" topics
- Vary the topics across different IT domains
- Some overlap is ACCEPTABLE if topics are different enough

**IMPORTANT:**
- Prioritize keywords that are CURRENTLY trending in real-time search rankings
- Focus on beginner-friendly topics that general public can understand
- Return 30 keywords to maximize diversity
- Each keyword should be 2-6 words long
- Keywords should reflect CURRENTLY TRENDING IT topics

Return only the keywords as a JSON array, like: ["keyword1", "keyword2", "keyword3", ...]
Make sure to return EXACTLY 30 keywords covering diverse IT areas.
`;
