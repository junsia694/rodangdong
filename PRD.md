요청하신 **`PRD.md` 파일을 다운로드할 수 있도록** 아래에 전체 내용을 최종적으로 제공해 드립니다. 이 내용을 복사하여 컴퓨터에 **`PRD.md`** 파일로 저장하시면 됩니다.

-----

# PRD.md: 글로벌 IT/전자 기술 자동화 블로그 (Node.js 단일 스택 최종)

## 1\. 목적 (Purpose)

실시간 IT/전자 기술 관련 키워드를 수집하고, \*\*AI (Gemini API)\*\*를 활용하여 고품질의 영어 아티클을 생성합니다. Blogger API를 통해 생성된 콘텐츠를 **Node.js 스크립트**로 100% 자동 예약 발행하여 **Google AdSense 수익화**를 목표로 합니다.

**목표 스택:** **Node.js 단일 스택** 기반의 완전 자동화된 글로벌 파이프라인 구축.

-----

## 2\. 사용자 시나리오 (User Story)

| 역할 | 시나리오 |
| :--- | :--- |
| **운영자** | "나는 Node.js 기반의 경량화된 자동화 파이프라인을 통해 **트렌드 기반의 고품질 콘텐츠와 시각 자료**를 비용 효율적으로 배포하고 싶다." |
| **독자** | "나는 최신 전자/IT 기술 트렌드를 **전문적이고 구조화된 영어 기사** 형태로 빠르게 소비하고 싶다." |

-----

## 3\. 주요 기능 및 모듈 (Features & Modules)

### 3.1. 키워드 수집 모듈 (Keyword Harvesting Module)

**역할:** 수익화 및 트래픽에 유리한 실시간 트렌드 키워드 확보 및 중복 사용 방지.

| 항목 | 상세 내용 | Node.js 구현 방식 |
| :--- | :--- | :--- |
| **데이터 소스** | Google Trends, Reddit (Free Tier), Hacker News. | `google-trends-api` 및 `axios` 모듈 활용. |
| **실행 주기** | CRON 기반, 3시간마다 실행. | **GitHub Actions (Free Tier)** 활용. |
| **중복 방지 로직 (핵심)** | \*\*파일 DB (JSON/CSV)\*\*에서 기존 작성 키워드를 불러와 새로운 키워드 목록과 비교하여 중복 키워드를 제외한다. | `fs` (File System) 모듈 활용. |
| **필터링 로직** | 'How-to', 'Review', 'vs' 등 \*\*구매 의도(Commercial Intent)\*\*가 높은 키워드에 가중치 부여. |

-----

### 3.2. 글 생성 모듈 (AI Content Generation Module)

**역할:** 수집된 키워드를 바탕으로 SEO에 최적화된 고품질 콘텐츠 생성 및 이미지 메타데이터 확보.

| 항목 | 상세 내용 | 비고 |
| :--- | :--- | :--- |
| **AI 호출** | **Gemini API** 호출. (모델: `gemini-3.0-flash` 권장). | Node.js **프롬프트 템플릿 리터럴** 방식으로 구현. |
| **출력 포맷** | 응답은 **Markdown** 포맷을 엄격히 준수하며, **이미지 배치 정보**를 포함. |
| **품질 검증** | 필수 섹션 및 **최소 단어 수 (1,500 words)**, **최소 이미지 제안 개수 (2개)** 충족 여부를 **Node.js 로직**으로 검사. |

#### 📝 핵심: 정교한 프롬프트 템플릿 구조

**파일:** `src/utils/prompt_template.js`

```javascript
/**
 * Cursor AI: 이 템플릿은 Node.js에서 사용될 프롬프트입니다.
 * 키워드 변수(${keyword})를 받아 Gemini API로 전송할 최종 텍스트를 생성합니다.
 * 출력은 E-E-A-T 원칙, SEO 구조, 그리고 최소 2개의 이미지 배치 제안을 엄격히 준수해야 합니다.
 */
const generateArticlePrompt = (keyword) => `
You are an expert global IT/Electronics analyst and professional SEO writer.
Your task is to write a comprehensive, technically accurate, and highly engaging English article about the latest trends in **${keyword}**.

The output must strictly follow the required Markdown structure below. Maintain a professional, objective, and authoritative tone (E-E-A-T principle). The content must be 100% original and provide deep, verifiable insights.

--- Required Article Structure ---

# ${keyword} - The Ultimate Guide to [Year]

## 1. SEO & Meta Information (Crucial for Ranking)
* **SEO Title (Max 60 chars):** [A compelling, keyword-rich title]
* **Meta Description (Max 155 chars):** [A brief, action-oriented summary including the keyword]

## 2. Introduction: The Current Landscape (Approx 150 words)
* Hook the reader.
* Define **${keyword}** and its current significance.
* State the article's core value proposition.

## 3. Technical Explanation & Core Concepts (In-Depth)
* Explain the underlying technology or scientific principle.
* Use **bold** for key technical terms.
* Incorporate a 'How It Works' subsection.

## 4. Real-World Use Cases (3+ Specific Examples)
* **Use Case 1 (Industry):** [Specific Industry Application]
* **Use Case 2 (Impact):** [Societal or Business Impact]
* **Use Case 3 (Future):** [Next Generation Application]

## 5. Comparison & Expert Insights
* **Comparison:** Compare **${keyword}** with a competing or related technology.
* **Expert Insights:** Provide a synthesized perspective on market adoption challenges or potential growth.

## 6. Conclusion (Call to Action)
* Summarize the key takeaways.
* Provide a forward-looking statement on the trend.

## 7. FAQ & Glossary
* **FAQ (3 Q&A pairs):** Address common user questions related to **${keyword}**.
* **Glossary (5 Key Terms):** Define 5 essential terms used in the article.

## 8. Image Placement Suggestions (2 Images Minimum)
* **Image 1 Placement:** [Section to place the first image (e.g., After Introduction, Before Use Case 1)]
* **Image 1 Description (for Unsplash Search):** [A concise (max 5 words) and technically relevant search query for a royalty-free image, e.g., 'futuristic quantum processor']
* **Image 1 ALT Text:** [Detailed ALT text for SEO/Accessibility, max 125 chars]
* **Image 2 Placement:** [Section to place the second image (e.g., Before Comparison, After Technical Explanation)]
* **Image 2 Description (for Unsplash Search):** [A concise (max 5 words) and technically relevant search query, distinct from Image 1, e.g., 'AI server farm']
* **Image 2 ALT Text:** [Detailed ALT text for SEO/Accessibility, max 125 chars]

--- Quality Constraints ---
1. **Strictly use US English.**
2. **Ensure content is not detectable as AI-generated.**
3. **Ensure all factual claims are accurate and verifiable.**
4. **Do not include any headers or text outside of the sections defined above.**
`;

module.exports = { generateArticlePrompt };
```

-----

### 3.3. 업로드 모듈 (Publishing via Blogger API)

**역할:** 생성된 콘텐츠를 Blogger 플랫폼에 자동 발행.

| 항목 | 상세 내용 | Node.js 구현 방식 |
| :--- | :--- | :--- |
| **인증** | **Google OAuth 2.0 (Refresh Token)** 기반 인증. | `axios` 또는 `node-fetch` 모듈 활용. |
| **예약 발행** | 예약 발행 (시분 단위) 로직 구현. | `Date` 객체 및 Blogger API의 스케줄링 필드 사용. |
| **포맷 변환** | Markdown을 최종 HTML로 변환 후 전송. | `markdown-it` 라이브러리 활용. |

-----

### 3.4. SEO 최적화 및 이미지 삽입

**역할:** 검색 엔진 노출 극대화 및 사용자 경험 개선을 위해 최소 2개의 이미지 삽입을 보장.

| 항목 | 상세 내용 | Node.js 구현 방식 |
| :--- | :--- | :--- |
| **이미지 최소 개수** | **게시글당 최소 2개 이상의 이미지 삽입을 의무화.** |
| **이미지 소싱** | \*\*Unsplash API (Free Tier)\*\*를 활용하여 고화질 이미지 URL을 획득. | `axios` 모듈로 Unsplash API 호출. |
| **이미지 배치 로직** | 프롬프트 출력의 배치 정보를 파싱하여, Node.js가 해당 섹션의 시작/끝 지점에 HTML `<img>` 태그를 삽입. | 문자열 치환 또는 AST(Abstract Syntax Tree) 파싱 로직 구현. |
| **Meta Tag / Schema** | 프롬프트 출력의 SEO 정보를 추출하고, `Article` Schema 마크업을 최종 HTML에 추가. |

-----

### 3.5. DB 모듈 (File-based Database Module)

**역할:** 키워드 사용 이력을 저장 및 관리하여 중복 콘텐츠 발행을 방지하고 비용을 절감.

| 항목 | 상세 내용 | Node.js 구현 방식 |
| :--- | :--- | :--- |
| **DB 유형** | **파일 DB (File DB)** 형태. (비용 효율 및 구축 단순화). | **JSON 파일** 또는 **CSV 파일**을 사용하여 키워드 목록 저장. |
| **주요 기능** | **`loadUsedKeywords()`** 및 **`saveUsedKeyword(keyword, date)`** 함수 구현. | **`fs` (File System) 모듈**을 사용하여 파일 읽기/쓰기. |

-----

## 4\. 기술 스택 및 인프라 (Tech Stack & Infrastructure)

| 항목 | 기술 스택 | 무료/비용 효율적 솔루션 |
| :--- | :--- | :--- |
| **핵심 언어** | **Node.js (TypeScript 권장)** | 전체 자동화 파이프라인의 유일한 실행 환경. |
| **스케줄링** | CRON Job | **GitHub Actions Free Tier** 활용. |
| **데이터베이스** | **파일 DB (JSON/CSV)** | 별도 DB 서버 없이 로컬 파일 시스템 사용. |
| **보안** | `.env` 또는 Secret Manager | GitHub Actions Secret을 활용하여 API 키 관리. |

-----

## 5\. 성공 지표 (Key Performance Indicators, KPI)

  * **배포 성공률:** 95% 이상 (Gemini 생성 → Blogger 업로드까지의 성공률).
  * **콘텐츠 길이:** 평균 1,500 단어 이상.
  * **시각적 요소:** 게시글당 평균 2개 이상의 이미지 삽입 유지율 100%.
  * **수익 지표:** 6개월 내 Google AdSense 최소 지급액 달성 (초기 목표).
  * **트래픽:** 6개월 내 특정 수집 키워드 그룹에서 상위 10위권 진입.


Blog ID : 4116188036281914326
Gemini API Key : AIzaSyCDqXoE3jbTKQlnSUHJ17Z_orNctN0edVA
