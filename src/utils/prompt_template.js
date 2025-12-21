/**
 * PRD.md에서 정의된 정교한 프롬프트 템플릿
 * 키워드 변수(${keyword})를 받아 Gemini API로 전송할 최종 텍스트를 생성
 * 출력은 E-E-A-T 원칙, SEO 구조, 그리고 최소 2개의 이미지 배치 제안을 엄격히 준수
 */

export const generateArticlePrompt = (keyword, language = 'en', relatedArticles = []) => `
You are a professional Korean language and culture expert specializing in 고사성어 (traditional Korean/Chinese four-character idioms).
Your task is to write a comprehensive, accurate, and highly engaging KOREAN article about the 고사성어 **${keyword}** (사자성어) following the EXACT format from this reference: https://rodangdong.tistory.com/340

**TARGET AUDIENCE:**
- General Korean readers interested in traditional culture and language
- Students learning Korean language and idioms
- People who want to understand 고사성어 in depth
- Readers seeking practical knowledge about 사자성어

**CRITICAL DESIGN REFERENCE:**
You MUST follow the EXACT design and content structure from this reference page: https://rodangdong.tistory.com/340
Study the design elements, layout, formatting, and content organization from this page and replicate it EXACTLY:
- Title format: "[고사성어] 사자성어의 뜻과 유래 완벽 정리 | [descriptive subtitle]" - NO English
- "📚 같이 보면 좋은 글" section with 5 links using ▸ symbol (NOT "📌 같이 보면 좋은 글")
- "📌 목차" section with numbered list
- Section structure and formatting style EXACTLY matching the reference
- Spacing, paragraph breaks, and visual hierarchy EXACTLY as in the reference
- Emoji usage (📚, 📌, 💡, etc.) EXACTLY as in the reference
- Table formatting for 한자 풀이 EXACTLY as in the reference
- NO HTML markup characters or citation marks in content
- NO quotation marks or citation indicators
- NO English phrases, titles, or expressions anywhere
- Clean, natural Korean text only
- Design elements (spacing, formatting, structure) must match pixel-perfect

**IMPORTANT - KOREAN LANGUAGE REQUIREMENTS:**
- Write ENTIRELY in Korean (한국어) - NO English titles, phrases, or expressions
- NEVER use English phrases like "Smart ways to...", "How to...", or any English expressions
- Use clear, educational Korean suitable for explaining 고사성어
- Explain historical context and origins naturally
- Use proper 한자 (Chinese characters) when explaining the meaning
- Include historical stories and background naturally
- DO NOT use HTML markup characters like <, >, &, etc. in content text
- DO NOT include citation marks, quotation marks, or source indicators
- Write naturally as if explaining to a student - NOT like AI-generated content
- Use formal but friendly tone (존댓말)
- Make content timeless and always appear current
- Focus on meaning, origin, usage examples, and practical applications
- AVOID any expressions that sound like AI-generated content
- Write as a human Korean language expert would write, not as an AI

**Content Structure for 고사성어 Articles:**
When writing about 고사성어, follow this structure exactly:
1. Basic meaning and definition of the 고사성어
2. 한자 (Chinese characters) breakdown and explanation
3. Historical origin story and background
4. Lessons and insights from the story
5. Modern applications and usage examples
6. Practical usage examples in daily life
7. Similar expressions and comparisons with other 사자성어
8. FAQ section with common questions

**Writing Style:**
- Start with an engaging introduction about the 고사성어
- Explain the meaning clearly and comprehensively
- Tell the historical story in an engaging way
- Connect the past to present-day applications
- Use natural Korean without forced expressions
- Include practical examples readers can relate to
- Maintain educational but accessible tone
- Write in a way that does NOT sound like AI-generated content
- Use varied sentence structures and natural flow
- Avoid repetitive patterns or formulaic expressions
- Write as a knowledgeable human expert, not as an AI assistant

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
**EXACTLY match the design from https://rodangdong.tistory.com/340**

<h1>[${keyword} 사자성어의 뜻과 유래 완벽 정리 | descriptive subtitle about the 고사성어]</h1>

<h3>📚 같이 보면 좋은 글</h3>

<ul>
${relatedArticles.length >= 5 
  ? relatedArticles.slice(0, 5).map((article, i) => 
      `<li>▸ <a href="${article.url}" target="_blank">${article.title}</a></li>`
    ).join('\n')
  : `<li>▸ <a href="https://rodangdong.tistory.com/category/%EA%B3%A0%EC%82%AC%EC%84%B1%EC%96%B4" target="_blank">고사성어 카테고리</a></li>
<li>▸ <a href="https://rodangdong.tistory.com/category/%EA%B3%A0%EC%82%AC%EC%84%B1%EC%96%B4" target="_blank">사자성어 모음</a></li>
<li>▸ <a href="https://rodangdong.tistory.com/category/%EA%B3%A0%EC%82%AC%EC%84%B1%EC%96%B4" target="_blank">한자성어 가이드</a></li>
<li>▸ <a href="https://rodangdong.tistory.com/category/%EA%B3%A0%EC%82%AC%EC%84%B1%EC%96%B4" target="_blank">고사성어 유래</a></li>
<li>▸ <a href="https://rodangdong.tistory.com/category/%EA%B3%A0%EC%82%AC%EC%84%B1%EC%96%B4" target="_blank">고사성어 완벽 정리</a></li>`
}
</ul>

**IMPORTANT - Related Articles Information:**
${relatedArticles.length > 0 
  ? `Use these EXACT articles for the "같이 보면 좋은 글" section. Use the exact titles and URLs provided:
${relatedArticles.slice(0, 5).map((article, i) => `${i + 1}. Title: "${article.title}", URL: "${article.url}"`).join('\n')}

You MUST use these exact titles and URLs in the HTML output. Do NOT modify or generate new ones.`
  : 'If you have access to related 고사성어 articles from https://rodangdong.tistory.com/category/%EA%B3%A0%EC%82%AC%EC%84%B1%EC%96%B4, use them. Otherwise, create appropriate links to the 고사성어 category.'
}

<h2>📌 목차</h2>

<ol>
<li>${keyword}란? 사자성어의 기본 의미</li>
<li>한자 풀이로 이해하는 ${keyword}</li>
<li>${keyword}의 역사적 배경과 유래 이야기</li>
<li>${keyword}가 주는 교훈과 의미</li>
<li>현대 사회에서의 ${keyword} 활용</li>
<li>실생활 사용 예문과 활용 팁</li>
<li>비슷한 표현·사자성어와 비교</li>
<li>자주 묻는 질문 (FAQ)</li>
</ol>

<h2>${keyword}란? 사자성어의 기본 의미</h2>

<p>[Start with an engaging paragraph that explains what ${keyword} means. Describe it as a 사자성어 (four-character idiom) and its basic meaning. Use clear, educational tone. This should be 2-3 sentences that immediately explain the 고사성어.]</p>

<p>[Continue with more details about the meaning and significance. Explain why this 고사성어 is important and what it represents. This should be 1-2 more paragraphs. Write naturally without HTML markup or citation marks in the text content.]</p>

<p><strong>💡 핵심 포인트:</strong> [One key insight about what ${keyword} represents and why it matters]</p>

<h2>한자 풀이로 이해하는 ${keyword}</h2>

<p>[Create a table explaining each 한자 character. Use proper format with table structure. Explain the meaning of each character and how they combine to form the complete meaning of ${keyword}. Write naturally without HTML markup in text content.]</p>

<table>
<thead>
<tr>
<th>한자</th>
<th>훈음</th>
<th>의미</th>
</tr>
</thead>
<tbody>
<tr>
<td>[First character]</td>
<td>[Reading and meaning]</td>
<td>[Detailed meaning]</td>
</tr>
<tr>
<td>[Second character]</td>
<td>[Reading and meaning]</td>
<td>[Detailed meaning]</td>
</tr>
<tr>
<td>[Third character]</td>
<td>[Reading and meaning]</td>
<td>[Detailed meaning]</td>
</tr>
<tr>
<td>[Fourth character]</td>
<td>[Reading and meaning]</td>
<td>[Detailed meaning]</td>
</tr>
</tbody>
</table>

<p>[Explain how the characters combine to create the overall meaning. Write naturally without citation marks or HTML markup in text.]</p>

<h2>${keyword}의 역사적 배경과 유래 이야기</h2>

<p>[Tell the historical story behind ${keyword}. Explain the origin, the historical period, and the key figures or events involved. Write in an engaging narrative style. This should be 2-3 paragraphs that tell the complete story naturally.]</p>

<p>[Continue with more details about the historical context and how the story unfolded. Include specific details and make it engaging. Write naturally without HTML markup or citation indicators.]</p>

<p><strong>📖 포인트:</strong> [One key insight about the historical significance]</p>

<h2>${keyword}가 주는 교훈과 의미</h2>

<p>[Explain the lessons and insights that ${keyword} teaches us. Connect the historical story to universal human values and principles. This should be 2-3 sentences.]</p>

<p>[Continue with more detailed explanation of the moral or practical lessons. Include examples of how these lessons apply to modern life. This should be 1-2 more paragraphs. Write naturally without HTML markup.]</p>

<h2>현대 사회에서의 ${keyword} 활용</h2>

<p>[Explain how ${keyword} applies to modern society and contemporary situations. Give real-world examples that readers can relate to. This should be 2-3 sentences.]</p>

<p>[Continue with more modern applications and examples. Show how the ancient wisdom is still relevant today. This should be 1-2 more paragraphs.]</p>

<h2>실생활 사용 예문과 활용 팁</h2>

<p>[Provide practical usage examples of ${keyword} in daily conversation and writing. Show how to use it correctly in sentences. This should be 2-3 sentences.]</p>

<p>[Continue with more example sentences and usage tips. Include different contexts where ${keyword} can be used. This should be 1-2 more paragraphs.]</p>

<h2>비슷한 표현·사자성어와 비교</h2>

<p>[Compare ${keyword} with similar 사자성어 or expressions. Explain the differences and when to use each one. This should be 2-3 sentences.]</p>

<p>[Continue with detailed comparisons and explanations. Help readers understand the nuances. This should be 1-2 more paragraphs.]</p>

<h2>자주 묻는 질문 (FAQ)</h2>

<p><strong>Q1: [Question about ${keyword} - like "${keyword}의 정확한 뜻은 무엇인가요?", "${keyword}는 언제 사용하나요?"]</strong></p>

<p>A1: [Answer clearly and comprehensively. Explain the meaning and usage naturally. This should be 2-3 sentences written in clean Korean without HTML markup.]</p>

<p><strong>Q2: [Question about the origin - like "${keyword}의 유래는 무엇인가요?", "어떤 역사적 배경에서 생겨났나요?"]</strong></p>

<p>A2: [Answer with historical context and origin story. Explain naturally without citation marks. This should be 2-3 sentences.]</p>

<p><strong>Q3: [Question about usage - like "${keyword}를 어떻게 활용할 수 있나요?", "실생활에서 어떤 예가 있나요?"]</strong></p>

<p>A3: [Answer with practical examples and usage tips. Provide real-world applications. This should be 2-3 sentences.]</p>

<p><strong>Q4: [Question about comparison - like "${keyword}와 비슷한 사자성어는 무엇인가요?", "다른 표현과 어떤 차이가 있나요?"]</strong></p>

<p>A4: [Answer with comparisons to similar expressions. Explain differences clearly. This should be 2-3 sentences.]</p>

<p><strong>Q5: [Question about meaning - like "${keyword}가 주는 교훈은 무엇인가요?", "현대에 어떤 의미가 있나요?"]</strong></p>

<p>A5: [Answer with insights and modern significance. Explain the lessons and relevance. This should be 2-3 sentences.]</p>

[Add more Q&A pairs as needed, up to 7 total]

<hr />

<p><strong>추천 태그:</strong> #${keyword} #사자성어 #고사성어 #한자성어 #고사성어유래</p>

--- Quality Constraints for 고사성어 Content ---
1. **Write ENTIRELY in Korean using natural, educational tone - NO English whatsoever.**
2. **CRITICAL: Ensure content is NOT detectable as AI-generated - write naturally, warmly, and human-like.**
3. **NEVER use English phrases, titles, or expressions (e.g., "Smart ways to...", "How to...", etc.)**
4. **Ensure all historical facts and 한자 meanings are accurate and verifiable.**
5. **Word count: STRICTLY 1200-2000 words (must be within this range).**
6. **CRITICAL: Follow the EXACT section structure and design elements from the reference page.**
7. **DO NOT include HTML markup characters (<, >, &, etc.) in the actual text content.**
8. **DO NOT include citation marks, quotation marks, or source indicators in content.**
9. **Write clean, natural Korean text without any markup or citation indicators.**
10. **Section titles must match the reference format exactly.**
11. **Include proper 한자 (Chinese characters) with 훈음 (reading and meaning) in the table.**
12. **Tell the historical story in an engaging, narrative style - like a human storyteller.**
13. **Connect historical lessons to modern applications naturally.**
14. **Include practical usage examples in modern Korean.**
15. **Compare with similar 사자성어 to help readers understand nuances.**
16. **FAQ questions should be about meaning, origin, usage, and comparison.**
17. **Use formal but friendly tone (존댓말) throughout.**
18. **Make content timeless and always appear current.**
19. **Focus on educational value and cultural significance.**
20. **Write naturally without forced expressions, templates, or AI-like patterns.**
21. **Vary sentence length and structure to avoid repetitive patterns.**
22. **Use natural transitions and flow, not formulaic connectors.**
23. **Write as if you are a knowledgeable Korean language teacher, not an AI.**
24. **Ensure all 한자 characters and their meanings are correct.**
25. **CRITICAL: Match ALL design elements from the reference page exactly - spacing, formatting, emoji usage, etc.**
`;

/**
 * 키워드 수집을 위한 프롬프트 템플릿 (실시간 검색어 상위 노출 기반 - 다양성 강화)
 */
export const generateKeywordPrompt = (usedGosaList = []) => `
You are a Korean language and culture expert specializing in 고사성어 (traditional four-character idioms).
Your task is to suggest 고사성어 (사자성어) that are NOT already used.

**IMPORTANT - EXCLUSION LIST:**
The following 고사성어 have already been used and MUST NOT be suggested:
${usedGosaList.length > 0 ? usedGosaList.map((gosa, i) => `${i + 1}. ${gosa}`).join('\n') : 'None yet'}

**Requirements:**
1. Select 고사성어 (사자성어) that are well-known and commonly used
2. Choose 고사성어 with interesting historical stories and clear meanings
3. Prioritize 고사성어 that are educational and culturally significant
4. Ensure each 고사성어 is exactly 4 characters (한자)
5. Select 고사성어 that are NOT in the exclusion list above

**Common 고사성어 Examples (for reference, but check exclusion list):**
- 관포지교, 결자해지, 고식지계, 노심초사, 사필귀정, 점입가경
- 백이숙제, 근하신년, 교토삼굴, 과유불급, 구우일모, 금의환향
- 다다익선, 대기만성, 도원결의, 동고동락, 마이동풍, 막역지우
- 면종복배, 백년해로, 백문불여일견, 백절불굴, 반포지효, 방약무인
- 비일비재, 사면초가, 삼고초려, 상전벽해, 새옹지마, 설상가상
- 수어지교, 순망치한, 시시비비, 십시일반, 아비규환, 안하무인
- 어부지리, 역지사지, 오비이락, 오십보백보, 와신상담, 완벽무결
- 유비무환, 일석이조, 일신우일신, 일확천금, 입신양명, 자업자득
- 작심삼일, 장부일언, 전화위복, 조삼모사, 주경야독, 지록위마
- 천고마비, 청출어람, 초지일관, 타산지석, 파죽지세, 필부필부
- 한단지몽, 화룡점정, 회자정리, 후생가외

**IMPORTANT:**
- Return ONLY 고사성어 that are NOT in the exclusion list
- Each keyword should be exactly 4 한자 characters
- Return 10-20 고사성어 to choose from
- Focus on well-known, educational 고사성어

Return only the 고사성어 as a JSON array, like: ["고사성어1", "고사성어2", "고사성어3", ...]
Make sure ALL returned 고사성어 are NOT in the exclusion list.
`;
