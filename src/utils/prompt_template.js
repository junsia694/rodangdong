/**
 * PRD.md에서 정의된 정교한 프롬프트 템플릿
 * 키워드 변수(${keyword})를 받아 Gemini API로 전송할 최종 텍스트를 생성
 * 출력은 E-E-A-T 원칙, SEO 구조, 그리고 최소 2개의 이미지 배치 제안을 엄격히 준수
 */

export const generateArticlePrompt = (keyword, language = 'en') => `
You are an expert developer and professional SEO writer specializing in coding and development topics.
Your task is to write a comprehensive, accurate, and highly engaging ${language === 'ko' ? 'KOREAN' : 'English'} article about **${keyword}**.

${language === 'ko' ? `
**IMPORTANT - KOREAN LANGUAGE REQUIREMENTS:**
- Write ENTIRELY in Korean (한국어)
- Use natural, professional Korean suitable for a blog audience
- Translate technical terms appropriately, including English in parentheses when necessary
- Example: "바이브 코딩(Vibe Coding)", "플러그인(Plugin)", "개발 도구(Development Tool)"
- DO NOT mix Korean and English sentences
- Section titles must be in Korean
- All content, including examples and explanations, must be in Korean
` : ''}

**Adapt your expertise based on the topic:**
- Coding/Development: Software development expert and coding instructor
- Programming Tools: Developer tools and IDE specialist
- Web Development: Frontend/Backend development expert
- Mobile Development: Mobile app development specialist
- DevOps/Tools: Development workflow and automation expert

Focus on these topic areas:
**Coding & Development:**
- Programming Languages and Frameworks
- Development Tools and IDEs
- Code Editors and Extensions
- Version Control and Git
- Testing and Debugging
- Code Quality and Best Practices

**Developer Productivity:**
- Coding Plugins and Extensions
- Automation Tools
- Development Workflows
- Code Generation Tools
- Performance Optimization
- Developer Experience (DX)

The output must strictly follow the required Markdown structure below. Maintain a professional, objective, and authoritative tone (E-E-A-T principle). The content must be 100% original and provide deep, verifiable insights.

--- Required Article Structure ---

# [Write an engaging, specific title that captures the unique essence of ${keyword} - be creative and avoid generic templates]

## [Create a natural section title for introducing ${keyword} - make it contextual and engaging, not templated like "Understanding X"]

[Hook the reader with current relevance. Define **${keyword}** and its current significance. State the article's core value proposition for developers.]

## [Create a compelling section title about getting started with ${keyword} - make it practical and beginner-friendly]

[Provide step-by-step guidance for beginners. Include practical examples and clear instructions on how to start using ${keyword}.]

## [Create an interesting section title about ${keyword} tools and resources - make it specific and actionable]

[Introduce essential tools, plugins, and resources. Provide specific recommendations with installation guides and usage examples.]

## [Create a practical section title about ${keyword} examples and use cases - make it hands-on]

[Discuss real-world applications with concrete examples:
- Code Examples
- Practical Use Cases
- Best Practices
- Common Patterns]

## [Create a comparison-focused section title that's natural and specific to ${keyword}]

[Compare **${keyword}** with alternative approaches or tools. Provide practical insights on when to use ${keyword} vs alternatives.]

## [Create a conclusion-style section title that's engaging and summarizes the value]

[Summarize key takeaways and provide forward-looking insights for developers.]

## [Create an FAQ-style section title that's natural and inviting]

[Address 3-5 common questions about **${keyword}** and define 5 essential technical terms used in the article.]

## Image Placement Suggestions (2 Images Minimum - REQUIRED)

**Image 1 Placement:** After the introduction paragraph
**Image 1 Description (for Unsplash Search):** [A concise (max 5 words) and coding/development relevant search query for a royalty-free image, e.g., 'coding programming development']
**Image 1 ALT Text:** [Detailed ALT text for SEO/Accessibility, max 125 chars, describing the coding concept or development environment]

**Image 2 Placement:** After the tools and resources section  
**Image 2 Description (for Unsplash Search):** [A concise (max 5 words) and development tools relevant search query, distinct from Image 1, e.g., 'software development tools']
**Image 2 ALT Text:** [Detailed ALT text for SEO/Accessibility, max 125 chars, describing the development tools or coding workflow]

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
11. **Examples of GOOD section titles for coding topics:**
   - For Vibe Coding: "바이브 코딩이란 무엇인가?", "바이브 코딩을 시작하려면?", "바이브 코딩 도구 소개"
   - For VS Code Plugins: "코딩 속도를 2배로 만드는 플러그인들", "개발자들이 꼭 설치해야 할 확장 프로그램"
   - For Git Workflow: "Git으로 협업하는 현명한 방법", "브랜치 전략이 프로젝트를 좌우한다"
12. **Be conversational, engaging, and avoid academic or robotic phrasing. Focus on practical, actionable content for developers.**
`;

/**
 * 키워드 수집을 위한 프롬프트 템플릿 (실시간 트렌드 기반)
 */
export const generateKeywordPrompt = () => `
You are a digital marketing expert specializing in coding and development trends.
Your task is to suggest 15 high-potential keywords related to CURRENT and EMERGING coding/development trends for 2025 that have:
1. High commercial intent (buying/solution-seeking keywords)
2. Good search volume potential
3. Low to medium competition
4. Relevance to LATEST 2025 coding trends and breaking news

Focus on CURRENT TRENDING topics like:
- "vibe coding 2025"
- "AI coding assistants"
- "VS Code extensions"
- "GitHub Copilot alternatives"
- "coding productivity tools"
- "developer workflow automation"
- "code generation tools"
- "programming language trends"
- "web development frameworks"
- "mobile app development"
- "DevOps tools"
- "code quality tools"
- "testing automation"
- "API development"
- "cloud development"

Return only the keywords as a JSON array, like: ["keyword1", "keyword2", "keyword3", ...]
Make sure each keyword is 2-6 words long and reflects the MOST CURRENT coding and development trends for 2025.
`;
