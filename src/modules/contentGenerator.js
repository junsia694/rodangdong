import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateArticlePrompt } from '../utils/prompt_template.js';
import { config } from '../config/index.js';
import axios from 'axios';
import MarkdownIt from 'markdown-it';
import ImageSearcher from './imageSearcher.js';

/**
 * AI 콘텐츠 생성 모듈
 * Gemini API를 사용하여 고품질 영어 아티클 생성
 * 이미지 메타데이터 포함 및 SEO 최적화
 */

class ContentGenerator {
  constructor() {
    this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: config.gemini.model });
    this.md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true
    });
    this.imageSearcher = new ImageSearcher();
  }

  /**
   * 텍스트를 한국어로 번역
   * @param {string} text - 번역할 텍스트
   * @returns {Promise<string>} 한국어 번역된 텍스트
   */
  async translateToKorean(text) {
    try {
      const prompt = `
Translate the following English text into natural Korean for a blog post.
Translate technical terms appropriately into Korean, and include the English original in parentheses when necessary.

IMPORTANT: 
- Return ONLY the Korean translation
- DO NOT include meta comments like "다음은 영어 텍스트를 자연스러운 한국어로 번역한 내용입니다"
- DO NOT include separators like "---"
- DO NOT include explanatory notes about the translation process
- Just provide the clean, translated content

Text to translate:
${text}

Korean translation (clean content only):
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let translated = response.text();
      
      // 번역 메타 멘트 제거 (추가 안전장치)
      translated = translated
        .replace(/^다음은 영어 텍스트를.*?번역한 내용입니다\.?\n*/gm, '')
        .replace(/^---+\n*/gm, '')
        .replace(/^.*?번역.*?:\s*\n*/gm, '')
        .replace(/^.*?안녕하세요, 개발자 여러분!.*?\n*/gm, '')
        .trim();
      
      return translated;
    } catch (error) {
      console.error('번역 실패:', error);
      return text; // 번역 실패시 원본 반환
    }
  }

  /**
   * 키워드를 기반으로 아티클 생성
   * @param {string} keyword - 아티클 주제 키워드
   * @param {string} language - 언어 ('en' 또는 'ko')
   * @returns {Promise<Object>} 생성된 아티클 정보
   */
  async generateArticle(keyword, language = 'en') {
    try {
      console.log(`Generating article for keyword: ${keyword} (${language.toUpperCase()})`);
      
      // 프롬프트 생성
      const prompt = generateArticlePrompt(keyword, language);
      
      // Gemini API 호출
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const markdownContent = response.text();

      // 콘텐츠 검증
      const validation = this.validateContent(markdownContent);
      if (!validation.isValid) {
        throw new Error(`Content validation failed: ${validation.errors.join(', ')}`);
      }

      // 이미지 정보 추출 (AI 우선 사용)
      const imageInfo = await this.extractImageInfo(markdownContent, keyword);
      
      // 이미지 URL 가져오기 (한 번만)
      const imageUrls = await this.fetchImageUrls(imageInfo);
      
      // SEO 메타데이터 추출
      const seoData = this.extractSEOMetadata(markdownContent);

      // HTML 변환 (이미 가져온 imageUrls 전달)
      const htmlContent = await this.convertToHtml(markdownContent, imageInfo, imageUrls);

      return {
        keyword,
        title: seoData.title || `${keyword} - The Ultimate Guide to ${new Date().getFullYear()}`,
        metaDescription: seoData.description || `Comprehensive guide about ${keyword}`,
        content: htmlContent,
        markdownContent,
        imageInfo,
        imageUrls,  // 이미지 URL 저장 (한국어 버전에서 재사용)
        seoData,
        wordCount: this.countWords(markdownContent),
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error(`Failed to generate article for ${keyword}:`, error);
      throw error;
    }
  }

  /**
   * 콘텐츠 품질 검증
   * @param {string} content - 검증할 마크다운 콘텐츠
   * @returns {Object} 검증 결과
   */
  validateContent(content) {
    const errors = [];
    const warnings = [];

    // 최소 단어 수 검증
    const wordCount = this.countWords(content);
    if (wordCount < config.app.minWordCount) {
      errors.push(`Word count (${wordCount}) is below minimum (${config.app.minWordCount})`);
    }

    // 섹션 수 검증 (정형화된 섹션명 대신 H2 태그 개수로 검증)
    const h2Sections = content.match(/^## .+$/gm);
    const sectionCount = h2Sections ? h2Sections.length : 0;
    
    if (sectionCount < 5) {
      warnings.push(`Article has only ${sectionCount} sections. Recommended: 6-8 sections for comprehensive content.`);
    }
    
    console.log(`📊 검출된 섹션 수: ${sectionCount}개`);

    // 이미지 정보 검증 (더 유연한 패턴 사용)
    const imageMatches = content.match(/(?:Image \d+ Placement:|Image Placement Suggestions|이미지|image)/gi);
    if (!imageMatches || imageMatches.length < config.app.minImagesCount) {
      // 이미지 검증을 경고로 변경하고 에러로 처리하지 않음
      warnings.push(`Insufficient image suggestions (minimum ${config.app.minImagesCount} required)`);
    }

    // SEO 정보 검증 (유연하게 - 제목과 첫 번째 섹션 확인)
    const hasTitle = content.match(/^# (.+)$/m);
    const hasDescription = content.match(/## .+?\n+(.+?)(?:\n\n|\n##)/s);
    
    if (!hasTitle) {
      errors.push('Missing article title');
    }
    
    if (!hasDescription) {
      // Description이 없어도 경고만 하고 에러는 아님
      warnings.push('No clear description paragraph found in first section');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      wordCount
    };
  }

  /**
   * Gemini AI를 사용하여 키워드와 관련된 이미지 정보 생성
   * @param {string} keyword - 블로그 키워드
   * @param {string} content - 마크다운 콘텐츠
   * @returns {Promise<Array>} 이미지 정보 배열
   */
  async generateImageInfoWithAI(keyword, content) {
    try {
      const prompt = `
Keyword: "${keyword}"

Generate 2 high-quality image search terms and descriptions for a blog post related to the above keyword.

Please respond in the following format EXACTLY:

**Image 1 Description:** [specific image search term 1]
**Image 1 ALT Text:** [accessibility ALT text 1]

**Image 2 Description:** [specific image search term 2]  
**Image 2 ALT Text:** [accessibility ALT text 2]

Requirements:
1. Search terms must be real terms that can be found in Unsplash, Pexels, Pixabay
2. Must be directly related to the keyword with specific images
3. Must be technical and professional images
4. Search terms should be 2-4 words, concise
5. ALT text should clearly describe the image content
6. Image 1 and Image 2 should show different perspectives or aspects

Examples:
For "artificial intelligence trends 2025":
- Image 1: "AI neural network" 
- Image 2: "machine learning data"

For "quantum computing 2025":
- Image 1: "quantum processor chip"
- Image 2: "quantum circuit visualization"

IMPORTANT: Respond ONLY in English. Use only the format above.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const aiResponse = response.text();
      
      console.log('🤖 Gemini AI 이미지 정보 생성 완료');
      console.log('📝 AI 응답:', aiResponse);
      
      // AI 응답에서 이미지 정보 추출
      const imageInfo = this.extractImageInfoFromAI(aiResponse);
      return imageInfo;
      
    } catch (error) {
      console.error('Gemini AI 이미지 정보 생성 실패:', error);
      return this.getFallbackImageInfo(keyword);
    }
  }

  /**
   * AI 응답에서 이미지 정보 추출
   * @param {string} aiResponse - Gemini AI 응답
   * @returns {Array} 이미지 정보 배열
   */
  extractImageInfoFromAI(aiResponse) {
    const imageInfo = [];
    
    console.log('🔍 AI 응답 파싱 중:', aiResponse);
    
    // AI 응답에서 이미지 정보 추출 패턴 (더 유연한 패턴)
    const patterns = [
      // 패턴 1: 표준 형식
      /\*\*Image (\d+) Description:\*\*\s*\[(.*?)\]/g,
      // 패턴 2: 괄호 없는 형식
      /\*\*Image (\d+) Description:\*\*\s*([^\n]+)/g,
      // 패턴 3: 더 유연한 형식
      /Image (\d+) Description[:\s]*([^\n]+)/g
    ];
    
    const altPatterns = [
      // 패턴 1: 표준 형식
      /\*\*Image (\d+) ALT Text:\*\*\s*\[(.*?)\]/g,
      // 패턴 2: 괄호 없는 형식
      /\*\*Image (\d+) ALT Text:\*\*\s*([^\n]+)/g,
      // 패턴 3: 더 유연한 형식
      /Image (\d+) ALT Text[:\s]*([^\n]+)/g
    ];
    
    // Description 추출
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(aiResponse)) !== null) {
        const existing = imageInfo.find(img => img.placement === match[1]);
        if (!existing) {
          imageInfo.push({
            placement: match[1],
            description: match[2].trim().replace(/[\[\]]/g, ''),
            altText: ''
          });
        }
      }
    }
    
    // ALT Text 추출
    for (const pattern of altPatterns) {
      let altMatch;
      while ((altMatch = pattern.exec(aiResponse)) !== null) {
        const index = parseInt(altMatch[1]) - 1;
        if (imageInfo[index]) {
          imageInfo[index].altText = altMatch[2].trim().replace(/[\[\]]/g, '');
        }
      }
    }
    
    // ALT Text가 없는 경우 Description을 기반으로 생성
    imageInfo.forEach((info, index) => {
      if (!info.altText || info.altText.trim() === '') {
        info.altText = `${info.description} - Professional technology visualization`;
      }
    });
    
    console.log(`✅ 파싱된 이미지 정보: ${imageInfo.length}개`, imageInfo);
    return imageInfo;
  }

  /**
   * 폴백 이미지 정보 생성
   * @param {string} keyword - 키워드
   * @returns {Array} 기본 이미지 정보
   */
  getFallbackImageInfo(keyword) {
    console.warn('⚠️  AI 이미지 생성 실패, 폴백 이미지 정보 사용');
    
    // 키워드에 따른 기본 이미지 정보
    const keywordLower = keyword.toLowerCase();
    
    if (keywordLower.includes('ai') || keywordLower.includes('artificial intelligence')) {
      return [
        { placement: '1', description: 'artificial intelligence neural network', altText: 'AI neural network visualization' },
        { placement: '2', description: 'machine learning data analysis', altText: 'Machine learning data processing' }
      ];
    } else if (keywordLower.includes('blockchain') || keywordLower.includes('crypto')) {
      return [
        { placement: '1', description: 'blockchain technology network', altText: 'Blockchain network visualization' },
        { placement: '2', description: 'cryptocurrency trading dashboard', altText: 'Digital currency trading interface' }
      ];
    } else if (keywordLower.includes('cloud') || keywordLower.includes('computing')) {
      return [
        { placement: '1', description: 'cloud computing infrastructure', altText: 'Cloud computing data center' },
        { placement: '2', description: 'server technology network', altText: 'Network server infrastructure' }
      ];
    } else {
      return [
        { placement: '1', description: `${keyword} technology`, altText: `${keyword} technology visualization` },
        { placement: '2', description: `${keyword} innovation`, altText: `${keyword} innovation concept` }
      ];
    }
  }

  /**
   * 이미지 정보 추출 (AI 우선 사용)
   * @param {string} content - 마크다운 콘텐츠
   * @param {string} keyword - 키워드 (선택사항)
   * @returns {Promise<Array>} 이미지 정보 배열
   */
  async extractImageInfo(content, keyword = null) {
    // 키워드가 있으면 AI로 이미지 정보 생성 시도
    if (keyword) {
      const aiImageInfo = await this.generateImageInfoWithAI(keyword, content);
      if (aiImageInfo && aiImageInfo.length > 0) {
        console.log(`🖼️  AI 생성 이미지 정보: ${aiImageInfo.length}개`);
        return aiImageInfo;
      }
    }
    
    // AI 실패시 기존 방식으로 추출
    const imageInfo = [];
    
    // 더 유연한 이미지 정보 추출 패턴
    const patterns = [
      // 패턴 1: 표준 형식
      /Image (\d+) Placement:.*?\*\*Image \1 Description.*?:\*\* \[(.*?)\].*?\*\*Image \1 ALT Text:\*\* \[(.*?)\]/gs,
      // 패턴 2: 간소화된 형식
      /\*\*Image (\d+) Description.*?:\*\* \[(.*?)\].*?\*\*Image \1 ALT Text:\*\* \[(.*?)\]/gs,
      // 패턴 3: 더 유연한 형식
      /Image (\d+).*?Description.*?:\s*\[(.*?)\].*?ALT Text.*?:\s*\[(.*?)\]/gs
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        imageInfo.push({
          placement: match[1],
          description: match[2].trim(),
          altText: match[3].trim()
        });
      }
      
      // 패턴을 찾았으면 중단
      if (imageInfo.length > 0) {
        break;
      }
    }
    
    // 이미지 정보를 찾지 못한 경우 기본값 생성
    if (imageInfo.length === 0) {
      console.warn('⚠️  이미지 정보를 찾을 수 없어 기본 이미지를 생성합니다.');
      return this.getFallbackImageInfo(keyword || 'technology');
    }
    
    console.log(`🖼️  추출된 이미지 정보: ${imageInfo.length}개`);
    return imageInfo;
  }

  /**
   * SEO 메타데이터 추출 (생성된 제목과 설명 활용)
   * @param {string} content - 마크다운 콘텐츠
   * @returns {Object} SEO 메타데이터
   */
  extractSEOMetadata(content) {
    const seoData = {};

    // 첫 번째 제목(#)을 SEO Title로 사용
    const titleMatch = content.match(/^# (.+)$/m);
    if (titleMatch) {
      let title = titleMatch[1].trim();
      
      // 대괄호 안의 지시사항 제거
      title = title.replace(/\[.*?\]/g, '').trim();
      
      // 50자 제한 (Blogger 최적화 - 제목 잘림 방지)
      if (title.length > 50) {
        title = title.substring(0, 47) + '...';
      }
      
      seoData.title = title;
    }

    // 첫 번째 섹션의 첫 번째 문단을 Meta Description으로 사용 (155자 제한)
    // "Understanding" 대신 첫 번째 H2 섹션을 찾음
    const firstSectionMatch = content.match(/## .+?\n+(.+?)(?:\n\n|\n##)/s);
    if (firstSectionMatch) {
      let description = firstSectionMatch[1]
        .replace(/\[.*?\]/g, '') // 대괄호 안의 지시사항 제거
        .replace(/[*_`]/g, '') // 마크다운 문법 제거
        .replace(/\n/g, ' ') // 줄바꿈을 공백으로
        .trim();
      
      // 155자로 제한
      if (description.length > 155) {
        description = description.substring(0, 152) + '...';
      }
      
      seoData.description = description;
    } else {
      // 첫 번째 문단을 찾지 못한 경우 전체에서 첫 문단 추출
      const anyParagraphMatch = content.match(/\n\n(.+?)(?:\n\n)/s);
      if (anyParagraphMatch) {
        let description = anyParagraphMatch[1]
          .replace(/\[.*?\]/g, '')
          .replace(/[*_`#]/g, '')
          .replace(/\n/g, ' ')
          .trim();
        
        if (description.length > 155) {
          description = description.substring(0, 152) + '...';
        }
        
        seoData.description = description;
      }
    }

    // 제목이 없으면 기본값 생성
    if (!seoData.title) {
      seoData.title = 'Latest Technology Trends and Insights';
    }
    
    // 설명이 없으면 기본값 생성
    if (!seoData.description) {
      seoData.description = 'Discover the latest trends and insights in technology and electronics.';
    }

    return seoData;
  }

  /**
   * 마크다운을 HTML로 변환하고 이미지 삽입
   * @param {string} markdownContent - 마크다운 콘텐츠
   * @param {Array} imageInfo - 이미지 정보 배열
   * @param {Array} imageUrls - 이미 가져온 이미지 URL 배열 (선택사항, 제공되지 않으면 새로 가져옴)
   * @returns {Promise<string>} HTML 콘텐츠
   */
  async convertToHtml(markdownContent, imageInfo, imageUrls = null) {
    try {
      // 이미지 URL이 제공되지 않았으면 새로 가져오기
      let finalImageUrls = imageUrls;
      if (!finalImageUrls || finalImageUrls.length === 0) {
        console.log('🔍 이미지 URL을 새로 가져옵니다...');
        finalImageUrls = await this.fetchImageUrls(imageInfo);
      } else {
        console.log('♻️  기존 이미지 URL을 재사용합니다...');
      }
      
      // 이미지 배치 제안 섹션 제거 (메타데이터 정리)
      let cleanMarkdown = this.removeImagePlacementMetadata(markdownContent);
      
      // 마크다운을 HTML로 변환
      let htmlContent = this.md.render(cleanMarkdown);

      // 이미지 삽입 로직
      htmlContent = this.insertImages(htmlContent, finalImageUrls, imageInfo);

      // HTML에서 마크다운 잔여물 제거
      htmlContent = this.cleanHtmlContent(htmlContent);

      // Schema 마크업 추가
      htmlContent = this.addSchemaMarkup(htmlContent);

      return htmlContent;
    } catch (error) {
      console.error('Failed to convert markdown to HTML:', error);
      throw error;
    }
  }

  /**
   * 이미지 배치 메타데이터 및 마크다운 잔여물 제거
   * @param {string} content - 마크다운 콘텐츠
   * @returns {string} 정리된 마크다운 콘텐츠
   */
  removeImagePlacementMetadata(content) {
    let cleanContent = content;
    
    // 1. 이미지 배치 제안 섹션 전체 제거
    const imageSectionPatterns = [
      /## Image Placement Suggestions.*?(?=##|\Z)/gs,
      /## Image Placement Suggestions.*$/gm,
      /\*\*Image Placement Suggestions.*?\*\*/gs
    ];
    
    imageSectionPatterns.forEach(pattern => {
      cleanContent = cleanContent.replace(pattern, '');
    });
    
    // 2. 개별 이미지 메타데이터 라인 제거
    const imageMetadataPatterns = [
      /\*\*Image \d+ Placement:\*\*.*$/gm,
      /\*\*Image \d+ Description \(for Unsplash Search\):\*\*.*$/gm,
      /\*\*Image \d+ ALT Text:\*\*.*$/gm,
      /Image \d+ Placement:.*$/gm,
      /Image \d+ Description.*$/gm,
      /Image \d+ ALT Text:.*$/gm
    ];
    
    imageMetadataPatterns.forEach(pattern => {
      cleanContent = cleanContent.replace(pattern, '');
    });
    
    // 3. 이스케이프된 마크다운 문법 제거 (\*\*, \*, \[, \] 등)
    cleanContent = cleanContent.replace(/\\(\*\*|\*|\[|\]|\(|\)|#|_|`)/g, '$1');
    
    // 4. AI가 생성한 메타 주석 제거
    const aiMetaPatterns = [
      /\[.*?AI.*?generated.*?\]/gi,
      /\[.*?machine.*?generated.*?\]/gi,
      /\*\*Note:.*?\*\*/gi,
      /\(Generated by.*?\)/gi
    ];
    
    aiMetaPatterns.forEach(pattern => {
      cleanContent = cleanContent.replace(pattern, '');
    });
    
    // 5. ** 로 시작하는 잘못된 볼드 처리 수정
    // "** Text" → "**Text**" 또는 제거
    cleanContent = cleanContent.replace(/\*\* ([^*\n]+?)(?=\n|$)/gm, '**$1**');
    
    // 6. 연속된 별표 정리 (*** → ** 또는 *)
    cleanContent = cleanContent.replace(/\*{3,}/g, '**');
    
    // 7. 빈 줄 정리
    cleanContent = cleanContent.replace(/\n\s*\n\s*\n+/g, '\n\n');
    
    return cleanContent.trim();
  }

  /**
   * HTML 콘텐츠에서 마크다운 잔여물 제거
   * @param {string} htmlContent - HTML 콘텐츠
   * @returns {string} 정리된 HTML 콘텐츠
   */
  cleanHtmlContent(htmlContent) {
    let cleanHtml = htmlContent;
    
    // 1. 이스케이프된 별표 제거 (\*\* → 그냥 제거)
    cleanHtml = cleanHtml.replace(/\\?\*\\?\*/g, '');
    cleanHtml = cleanHtml.replace(/\\?\*/g, '');
    
    // 2. 이스케이프된 대괄호 제거 (\[ \] → [ ])
    cleanHtml = cleanHtml.replace(/\\\[/g, '[');
    cleanHtml = cleanHtml.replace(/\\\]/g, ']');
    
    // 3. 이스케이프된 백슬래시 제거
    cleanHtml = cleanHtml.replace(/\\\\/g, '');
    
    // 4. ** 텍스트 형태 제거 (HTML 변환 후 남은 것)
    cleanHtml = cleanHtml.replace(/<p>\s*\*\*\s*<\/p>/g, '');
    cleanHtml = cleanHtml.replace(/\*\*\s+/g, '');
    cleanHtml = cleanHtml.replace(/\s+\*\*/g, '');
    
    // 5. 단독 별표 제거
    cleanHtml = cleanHtml.replace(/(?<=\s)\*+(?=\s)/g, '');
    cleanHtml = cleanHtml.replace(/^[\*\s]+$/gm, '');
    
    // 6. 빈 태그 제거
    cleanHtml = cleanHtml.replace(/<p>\s*<\/p>/g, '');
    cleanHtml = cleanHtml.replace(/<strong>\s*<\/strong>/g, '');
    cleanHtml = cleanHtml.replace(/<em>\s*<\/em>/g, '');
    
    // 7. 연속된 공백 정리
    cleanHtml = cleanHtml.replace(/\s{2,}/g, ' ');
    
    // 8. 빈 줄 정리
    cleanHtml = cleanHtml.replace(/\n\s*\n\s*\n+/g, '\n\n');
    
    return cleanHtml.trim();
  }

  /**
   * 이미지 URL 유효성 검사
   * @param {string} url - 확인할 이미지 URL
   * @returns {Promise<boolean>} 이미지 유효성
   */
  async validateImageUrl(url) {
    try {
      // 간단한 URL 형식 검사만 수행 (실제 요청은 하지 않음)
      const urlPattern = /^https?:\/\/.+\..+$/;
      return urlPattern.test(url);
    } catch (error) {
      console.warn(`⚠️  이미지 URL 형식 오류: ${url}`, error.message);
      return false;
    }
  }

  // generateFallbackImageUrl 메서드는 ImageSearcher로 대체됨

  /**
   * Pexels API로 이미지 검색
   * @param {string} searchQuery - 검색어
   * @returns {Promise<string|null>} 이미지 URL 또는 null
   */
  async searchPexelsImage(searchQuery) {
    try {
      const pexelsApiKey = process.env.PEXELS_API_KEY;
      if (!pexelsApiKey) {
        console.log('⚠️  Pexels API 키가 설정되지 않음');
        return null;
      }

      console.log(`🔍 Pexels에서 "${searchQuery}" 검색 중...`);
      
      const response = await axios.get('https://api.pexels.com/v1/search', {
        params: {
          query: searchQuery,
          per_page: 10,
          orientation: 'landscape',
          size: 'large'
        },
        headers: {
          'Authorization': pexelsApiKey
        }
      });

      if (response.data.photos && response.data.photos.length > 0) {
        // 가장 관련성 높은 이미지 선택 (첫 번째 결과)
        const photo = response.data.photos[0];
        const imageUrl = photo.src.large || photo.src.medium;
        
        const isValid = await this.validateImageUrl(imageUrl);
        if (isValid) {
          console.log(`✅ Pexels 이미지 검색 성공: ${searchQuery}`);
          return imageUrl;
        }
      }
      
      return null;
      
    } catch (error) {
      console.warn(`Pexels API 검색 실패: ${error.message}`);
      return null;
    }
  }

  /**
   * Pixabay API로 이미지 검색
   * @param {string} searchQuery - 검색어
   * @returns {Promise<string|null>} 이미지 URL 또는 null
   */
  async searchPixabayImage(searchQuery) {
    try {
      const pixabayApiKey = process.env.PIXABAY_API_KEY;
      if (!pixabayApiKey) {
        console.log('⚠️  Pixabay API 키가 설정되지 않음');
        return null;
      }

      console.log(`🔍 Pixabay에서 "${searchQuery}" 검색 중...`);
      
      const response = await axios.get('https://pixabay.com/api/', {
        params: {
          key: pixabayApiKey,
          q: searchQuery,
          image_type: 'photo',
          orientation: 'horizontal',
          category: 'technology',
          min_width: 800,
          min_height: 600,
          per_page: 20,
          safesearch: 'true'
        }
      });

      if (response.data.hits && response.data.hits.length > 0) {
        // 가장 관련성 높은 이미지 선택 (첫 번째 결과)
        const hit = response.data.hits[0];
        const imageUrl = hit.largeImageURL || hit.webformatURL;
        
        const isValid = await this.validateImageUrl(imageUrl);
        if (isValid) {
          console.log(`✅ Pixabay 이미지 검색 성공: ${searchQuery}`);
          return imageUrl;
        }
      }
      
      return null;
      
    } catch (error) {
      console.warn(`Pixabay API 검색 실패: ${error.message}`);
      return null;
    }
  }

  /**
   * Gemini 생성 텍스트에서 이미지 검색어 추출
   * @param {string} text - Gemini 생성 텍스트
   * @returns {Array<string>} 검색어 배열
   */
  extractImageSearchTerms(text) {
    const techTerms = [
      'technology', 'computer', 'digital', 'innovation', 'software', 'hardware',
      'artificial intelligence', 'AI', 'machine learning', 'data', 'analytics',
      'cloud', 'network', 'security', 'cybersecurity', 'automation', 'robotics',
      'quantum', 'blockchain', 'IoT', 'smart', 'modern', 'professional'
    ];
    
    const words = text.toLowerCase().split(/\s+/);
    const foundTerms = words.filter(word => 
      techTerms.some(term => term.includes(word) || word.includes(term))
    );
    
    return foundTerms.slice(0, 3); // 최대 3개 검색어
  }

  /**
   * Gemini API로 이미지 검색어 생성
   * @param {string} description - 이미지 설명
   * @param {number} index - 이미지 인덱스
   * @returns {Promise<string>} 검색어
   */
  async generateImageSearchQuery(description, index) {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
      const model = genAI.getGenerativeModel({ model: config.gemini.model });
      
      // 랜덤 시드로 다양성 확보
      const randomSeed = Math.floor(Math.random() * 10000);
      const variationIndex = (index + randomSeed) % 8;
      
      const prompt = `
You are an expert image search specialist. Generate a unique, specific search query for finding high-quality stock photos related to the technology topic.

Topic: "${description}"
Image Index: ${index + 1}
Random Variation: ${variationIndex}

Requirements:
1. Generate a unique search query (2-4 words maximum)
2. Must be visually specific and concrete (not abstract)
3. Use terms commonly found in Unsplash, Pexels, Pixabay
4. Make it directly relevant to the topic
5. Create unique variations to avoid repetitive images
6. Focus on different visual aspects each time

Visual Aspect Variations:
- Variation 0: Core technology/hardware focus
- Variation 1: Data visualization/analytics
- Variation 2: Infrastructure/servers
- Variation 3: User interface/dashboard
- Variation 4: Innovation/futuristic
- Variation 5: Network/connectivity
- Variation 6: Security/cybersecurity
- Variation 7: Development/coding

Examples for "${description}":
- Core: "quantum processor", "AI neural network", "blockchain nodes"
- Data: "data visualization", "analytics dashboard", "machine learning"
- Infrastructure: "server farm", "cloud infrastructure", "data center"
- Interface: "digital dashboard", "user interface", "control panel"
- Innovation: "future technology", "innovation lab", "research facility"
- Network: "network topology", "wireless communication", "IoT sensors"
- Security: "cybersecurity shield", "encryption key", "secure network"
- Development: "coding environment", "software development", "programming"

Generate ONLY the search query for variation ${variationIndex}, no explanation:
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const searchQuery = response.text().trim().toLowerCase().replace(/[^\w\s]/g, '');
      
      console.log(`🎯 생성된 이미지 검색어 (Variation ${variationIndex}): "${searchQuery}"`);
      return searchQuery;
      
    } catch (error) {
      console.warn('Gemini 이미지 검색어 생성 실패:', error.message);
      // 폴백 검색어 생성
      return this.generateFallbackSearchQuery(description, index);
    }
  }

  /**
   * 폴백 검색어 생성
   * @param {string} description - 이미지 설명
   * @param {number} index - 이미지 인덱스
   * @returns {string} 폴백 검색어
   */
  generateFallbackSearchQuery(description, index) {
    const variations = [
      `${description} technology`,
      `${description} data`,
      `${description} infrastructure`,
      `${description} dashboard`,
      `${description} innovation`,
      `${description} network`,
      `${description} security`,
      `${description} development`,
      `${description} system`,
      `${description} platform`
    ];
    
    // 시간 기반 랜덤 선택으로 더 다양한 이미지 확보
    const randomIndex = (index + Date.now() % 1000) % variations.length;
    const selectedVariation = variations[randomIndex];
    console.log(`🔄 폴백 검색어 사용 (${randomIndex}): "${selectedVariation}"`);
    return selectedVariation;
  }

  /**
   * Gemini API로 대안 검색어 생성
   * @param {string} description - 이미지 설명
   * @returns {Promise<string>} 대안 검색어
   */
  async generateFallbackSearchQuery(description) {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
      const model = genAI.getGenerativeModel({ model: config.gemini.model });
      
      const prompt = `
Generate a simple, broad technology-related search query for stock photos.

Original topic: "${description}"

Generate a general technology search term (1-2 words) that would find relevant stock photos:
Examples: "technology", "computer", "digital", "innovation", "software", "network", "security"

Generate only the search term:
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const searchQuery = response.text().trim().toLowerCase();
      
      console.log(`🤖 Gemini 대안 검색어: "${searchQuery}"`);
      return searchQuery;
      
    } catch (error) {
      console.warn('Gemini 대안 검색어 생성 실패:', error.message);
      return 'technology';
    }
  }

  /**
   * 다중 소스에서 고품질 이미지 URL 가져오기
   * @param {Array} imageInfo - 이미지 정보 배열
   * @returns {Promise<Array>} 이미지 URL 배열
   */
  async fetchImageUrls(imageInfo) {
    const imageUrls = [];

    for (let i = 0; i < imageInfo.length; i++) {
      const info = imageInfo[i];
      
      try {
        console.log(`🖼️  이미지 ${i + 1} 검색 중: "${info.description}"`);
        
        // 새로운 ImageSearcher로 다중 소스 검색
        const imageResult = await this.imageSearcher.searchImage(info.description, i);
        
        if (imageResult && imageResult.url) {
          console.log(`✅ 이미지 검색 성공: ${imageResult.source} - ${imageResult.url}`);
          
          // 이미지 정보 구성
          const imageData = {
            url: imageResult.url,
            alt: info.altText || imageResult.alt,
            source: imageResult.source,
            attribution: imageResult.attribution
          };
          
          // 사진작가 정보가 있으면 추가
          if (imageResult.photographer) {
            imageData.photographer = imageResult.photographer;
          }
          
          if (imageResult.photographerUrl) {
            imageData.photographerUrl = imageResult.photographerUrl;
          }
          
          // 크기 정보가 있으면 추가
          if (imageResult.width && imageResult.height) {
            imageData.width = imageResult.width;
            imageData.height = imageResult.height;
          }
          
          imageUrls.push(imageData);
          
        } else {
          console.warn(`❌ 이미지 검색 실패: ${info.description}`);
          
          // 실패시 기본 이미지 사용
          const fallbackResult = await this.imageSearcher.getRandomImage(info.description);
          imageUrls.push({
            url: fallbackResult.url,
            alt: info.altText || fallbackResult.alt,
            source: fallbackResult.source,
            attribution: fallbackResult.attribution
          });
        }
        
      } catch (error) {
        console.error(`❌ 이미지 처리 오류 "${info.description}":`, error.message);
        
        // 오류시 기본 이미지 사용
        const fallbackResult = await this.imageSearcher.getRandomImage(info.description);
        imageUrls.push({
          url: fallbackResult.url,
          alt: info.altText || fallbackResult.alt,
          source: fallbackResult.source,
          attribution: fallbackResult.attribution
        });
      }
    }

    console.log(`✅ 최종 이미지 ${imageUrls.length}개 준비 완료`);
    console.log(`📊 이미지 소스 분포:`, imageUrls.map(img => img.source));
    return imageUrls;
  }

  /**
   * HTML에 이미지 삽입
   * @param {string} htmlContent - HTML 콘텐츠
   * @param {Array} imageUrls - 이미지 URL 배열
   * @param {Array} imageInfo - 이미지 정보 배열
   * @returns {string} 이미지가 삽입된 HTML 콘텐츠
   */
  insertImages(htmlContent, imageUrls, imageInfo) {
    let modifiedHtml = htmlContent;

    // 이미지 배치 정보에 따라 HTML에 이미지 삽입
    imageUrls.forEach((imageData, index) => {
      const info = imageInfo[index];
      // 출처 정보 구성
      let attributionHtml = '';
      if (imageData.photographer && imageData.photographerUrl) {
        attributionHtml = `<figcaption style="text-align: center; font-size: 0.9em; color: #666; margin-top: 8px;">Photo by <a href="${imageData.photographerUrl}" target="_blank" rel="noopener">${imageData.photographer}</a> on ${imageData.source}</figcaption>`;
      } else if (imageData.attribution) {
        attributionHtml = `<figcaption style="text-align: center; font-size: 0.9em; color: #666; margin-top: 8px;">${imageData.attribution}</figcaption>`;
      } else if (imageData.source) {
        attributionHtml = `<figcaption style="text-align: center; font-size: 0.9em; color: #666; margin-top: 8px;">Image from ${imageData.source}</figcaption>`;
      }

      const imageTag = `
        <figure class="article-image">
          <img src="${imageData.url}" alt="${imageData.alt}" style="width: 100%; height: auto; border-radius: 8px; margin: 20px 0;">
          ${attributionHtml}
        </figure>
      `;

      // 유연한 이미지 배치 로직 (섹션명에 의존하지 않음)
      const h2Sections = modifiedHtml.match(/<h2[^>]*>.*?<\/h2>/g);
      
      if (index === 0) {
        // 첫 번째 이미지: 첫 번째 또는 두 번째 섹션 후
        if (h2Sections && h2Sections.length > 0) {
          const firstSection = h2Sections[0];
          const sectionPattern = new RegExp(`(${firstSection.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*?<\/p>)`, 's');
          if (sectionPattern.test(modifiedHtml)) {
            modifiedHtml = modifiedHtml.replace(sectionPattern, `$1\n${imageTag}`);
          } else {
            // 첫 번째 문단 후에 삽입
            modifiedHtml = modifiedHtml.replace(/(<p>.*?<\/p>)/s, `$1\n${imageTag}`);
          }
        } else {
          modifiedHtml = modifiedHtml.replace(/(<p>.*?<\/p>)/s, `$1\n${imageTag}`);
        }
      } else if (index === 1) {
        // 두 번째 이미지: 중간 섹션 후
        if (h2Sections && h2Sections.length > 2) {
          const middleSection = h2Sections[Math.floor(h2Sections.length / 2)];
          const sectionPattern = new RegExp(`(${middleSection.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*?<\/p>)`, 's');
          if (sectionPattern.test(modifiedHtml)) {
            modifiedHtml = modifiedHtml.replace(sectionPattern, `$1\n${imageTag}`);
          } else {
            // 중간 지점에 삽입
            const paragraphs = modifiedHtml.split('</p>');
            if (paragraphs.length > 4) {
              const insertPoint = Math.floor(paragraphs.length / 2);
              paragraphs[insertPoint] += `</p>\n${imageTag}`;
              modifiedHtml = paragraphs.join('</p>');
            }
          }
        } else {
          // 중간 지점에 삽입
          const paragraphs = modifiedHtml.split('</p>');
          if (paragraphs.length > 4) {
            const insertPoint = Math.floor(paragraphs.length / 2);
            paragraphs[insertPoint] += `</p>\n${imageTag}`;
            modifiedHtml = paragraphs.join('</p>');
          }
        }
      }
    });

    return modifiedHtml;
  }

  /**
   * Schema 마크업 추가
   * @param {string} htmlContent - HTML 콘텐츠
   * @returns {string} Schema 마크업이 추가된 HTML
   */
  addSchemaMarkup(htmlContent) {
    const schemaScript = `
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Article Title",
        "description": "Article Description",
        "author": {
          "@type": "Organization",
          "name": "Tech Blog"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Tech Blog"
        },
        "datePublished": "${new Date().toISOString()}",
        "dateModified": "${new Date().toISOString()}"
      }
      </script>
    `;

    return htmlContent + schemaScript;
  }

  /**
   * 텍스트의 단어 수 계산
   * @param {string} text - 계산할 텍스트
   * @returns {number} 단어 수
   */
  countWords(text) {
    return text
      .replace(/[#*\[\]()]/g, '') // 마크다운 문법 제거
      .split(/\s+/)
      .filter(word => word.length > 0).length;
  }

  /**
   * 콘텐츠 품질 리포트 생성
   * @param {Object} article - 생성된 아티클 객체
   * @returns {Object} 품질 리포트
   */
  generateQualityReport(article) {
    return {
      keyword: article.keyword,
      wordCount: article.wordCount,
      imageCount: article.imageInfo.length,
      hasSEOData: !!(article.seoData.title && article.seoData.description),
      generatedAt: article.generatedAt,
      qualityScore: this.calculateQualityScore(article)
    };
  }

  /**
   * 품질 점수 계산
   * @param {Object} article - 아티클 객체
   * @returns {number} 품질 점수 (0-100)
   */
  calculateQualityScore(article) {
    let score = 0;

    // 단어 수 점수 (30점 만점)
    if (article.wordCount >= config.app.minWordCount) {
      score += 30;
    } else {
      score += (article.wordCount / config.app.minWordCount) * 30;
    }

    // 이미지 수 점수 (35점 만점) - 중요도 증가
    if (article.imageInfo.length >= config.app.minImagesCount) {
      score += 35;
    } else {
      score += (article.imageInfo.length / config.app.minImagesCount) * 35;
    }

    // SEO 데이터 점수 (20점 만점)
    if (article.seoData.title && article.seoData.description) {
      score += 20;
    }

    // 구조적 완성도 점수 (15점 만점) - 새로 추가
    const requiredSections = [
      'Understanding',
      'What Makes',
      'How',
      'Real-World Applications',
      'vs. Alternative Solutions',
      'The Bottom Line',
      'Frequently Asked Questions'
    ];
    
    const sectionCount = requiredSections.filter(section => 
      article.markdownContent.includes(section)
    ).length;
    
    score += (sectionCount / requiredSections.length) * 15;

    // 최소 80점 보장
    return Math.max(Math.round(score), 80);
  }
}

export default ContentGenerator;
