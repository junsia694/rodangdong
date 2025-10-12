/**
 * PRD.md에서 정의된 정교한 프롬프트 템플릿
 * 키워드 변수(${keyword})를 받아 Gemini API로 전송할 최종 텍스트를 생성
 * 출력은 E-E-A-T 원칙, SEO 구조, 그리고 최소 2개의 이미지 배치 제안을 엄격히 준수
 */

export const generateArticlePrompt = (keyword, language = 'en') => `
You are an expert analyst and professional SEO writer specializing in technology and finance topics.
Your task is to write a comprehensive, accurate, and highly engaging ${language === 'ko' ? 'KOREAN' : 'English'} article about **${keyword}**.

${language === 'ko' ? `
**IMPORTANT - KOREAN LANGUAGE REQUIREMENTS:**
- Write ENTIRELY in Korean (한국어)
- Use natural, professional Korean suitable for a blog audience
- Translate technical terms appropriately, including English in parentheses when necessary
- Example: "머신러닝(Machine Learning)", "클라우드 컴퓨팅(Cloud Computing)"
- DO NOT mix Korean and English sentences
- Section titles must be in Korean
- All content, including examples and explanations, must be in Korean
` : ''}

**Adapt your expertise based on the topic:**
- Technology/IT: Technical analyst and expert
- Finance/Investment: Financial analyst and expert
- FinTech/Crypto: Combined tech-finance specialist
- Other tech-finance topics: Subject matter expert

Focus on these topic areas:
**Technology:**
- AI and Machine Learning
- Software Development
- Hardware and Electronics
- Cloud Computing and DevOps
- Cybersecurity
- Data Science and Analytics

**Finance:**
- FinTech and Digital Banking
- Cryptocurrency and DeFi
- Stock Market and Trading
- Investment and Wealth Management
- Payment Systems
- Financial Technology

The output must strictly follow the required Markdown structure below. Maintain a professional, objective, and authoritative tone (E-E-A-T principle). The content must be 100% original and provide deep, verifiable insights.

--- Required Article Structure ---

# [Write an engaging, specific title that captures the unique essence of ${keyword} - be creative and avoid generic templates]

## [Create a natural section title for introducing ${keyword} - make it contextual and engaging, not templated like "Understanding X"]

[Hook the reader with current relevance. Define **${keyword}** and its current significance. State the article's core value proposition.]

## [Create a compelling section title about why ${keyword} is important - make it specific to the topic, not generic]

[Explain what makes this topic timely and important right now.]

## [Create an interesting section title about how ${keyword} works - make it engaging and topic-specific]

[Explain the underlying technology or scientific principle. Use **bold** for key technical terms. Break down the core mechanics.]

## [Create a real-world focused section title - be specific to ${keyword}'s applications]

[Discuss specific applications with concrete examples:
- Industry Impact
- Business Transformation
- Future Possibilities]

## [Create a comparison-focused section title that's natural and specific to ${keyword}]

[Compare **${keyword}** with competing or related technologies. Provide market perspective on adoption challenges and growth potential.]

## [Create a conclusion-style section title that's engaging and summarizes the value]

[Summarize key takeaways and provide forward-looking insights.]

## [Create an FAQ-style section title that's natural and inviting]

[Address 3-5 common questions about **${keyword}** and define 5 essential technical terms used in the article.]

## Image Placement Suggestions (2 Images Minimum - REQUIRED)

**Image 1 Placement:** After the introduction paragraph
**Image 1 Description (for Unsplash Search):** [A concise (max 5 words) and technically relevant search query for a royalty-free image, e.g., 'artificial intelligence technology']
**Image 1 ALT Text:** [Detailed ALT text for SEO/Accessibility, max 125 chars, describing the technology or concept]

**Image 2 Placement:** After the technical explanation section  
**Image 2 Description (for Unsplash Search):** [A concise (max 5 words) and technically relevant search query, distinct from Image 1, e.g., 'machine learning data']
**Image 2 ALT Text:** [Detailed ALT text for SEO/Accessibility, max 125 chars, describing the application or impact]

--- Quality Constraints ---
1. **Strictly use US English.**
2. **Ensure content is not detectable as AI-generated.**
3. **Ensure all factual claims are accurate and verifiable.**
4. **Do not include any headers or text outside of the sections defined above.**
5. **Minimum word count: 1500 words.**
6. **Focus on commercial intent keywords with high search volume.**
7. **CRITICAL: Create unique, natural section titles that match the specific content about ${keyword}.**
8. **DO NOT use templated section titles like "Understanding X", "What Makes X Important", "How X Works".**
9. **Section titles should be engaging, conversational, and specific to the actual content you're writing.**
10. **Main article title must be under 50 characters, creative, and attention-grabbing.**
11. **Examples of GOOD section titles:**
   - For Python 3.14: "The Speed Revolution Nobody Saw Coming", "Why Your Code Just Got 2x Faster"
   - For AI Chips: "Silicon Wars: The Battle for AI Supremacy", "Inside the Chip That Powers ChatGPT"
   - For Cloud Security: "The New Attack Vectors You Need to Know", "Zero Trust: Why Perimeters Are Dead"
12. **Be conversational, engaging, and avoid academic or robotic phrasing.**
`;

/**
 * 키워드 수집을 위한 프롬프트 템플릿 (실시간 트렌드 기반)
 */
export const generateKeywordPrompt = () => `
You are a digital marketing expert specializing in IT/Electronics technology trends.
Your task is to suggest 15 high-potential keywords related to CURRENT and EMERGING IT/Electronics trends for 2025 that have:
1. High commercial intent (buying/solution-seeking keywords)
2. Good search volume potential
3. Low to medium competition
4. Relevance to LATEST 2025 technology trends and breaking news

Focus on CURRENT TRENDING topics like:
- "AI agents 2025"
- "quantum computing breakthrough"
- "edge computing solutions"
- "5G private networks"
- "sustainable tech trends"
- "cybersecurity automation"
- "IoT security challenges"
- "blockchain enterprise solutions"
- "AR/VR workplace applications"
- "green data centers"
- "machine learning operations"
- "zero trust architecture"
- "cloud native development"
- "digital transformation tools"
- "smart manufacturing trends"

Return only the keywords as a JSON array, like: ["keyword1", "keyword2", "keyword3", ...]
Make sure each keyword is 2-6 words long and reflects the MOST CURRENT technology trends and breaking developments in IT/Electronics.
`;
