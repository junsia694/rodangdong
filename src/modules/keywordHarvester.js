import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/index.js';
import FileDatabase from './fileDb.js';
import GosaCollector from './gosaCollector.js';

/**
 * 키워드 수집 모듈
 * 고사성어 키워드 수집 (AI로 고사성어 추천)
 */

class KeywordHarvester {
  constructor() {
    this.db = new FileDatabase();
    this.gosaCollector = new GosaCollector();
    this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: config.gemini.model });
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
   * AI를 사용하여 새로운 고사성어 추천받기
   * @param {Array<string>} usedGosaList - 사용된 고사성어 목록 (티스토리 블로그에서 수집)
   * @returns {Promise<string|null>} 새로운 고사성어
   */
  async generateNewGosa(usedGosaList) {
    try {
      console.log('🤖 AI에게 새로운 고사성어 추천 요청 중...');
      
      const categoryUrl = this.gosaCollector.categoryUrl;
      
      const prompt = `
당신은 한국어와 한자 문화 전문가입니다. 티스토리 블로그에 게시할 새로운 고사성어(사자성어)를 추천해주세요.

**중요 참고 URL:**
다음 티스토리 블로그 고사성어 카테고리 페이지를 참고하세요:
${categoryUrl}

이 페이지에 이미 게시된 고사성어는 절대 추천하지 마세요.

**중요 조건:**
1. 위 URL의 티스토리 블로그 카테고리에 이미 게시된 고사성어는 절대 추천하지 마세요.
2. 아래 목록에 있는 고사성어도 이미 게시되어 있으므로 절대 추천하지 마세요.
3. 4글자 한자 고사성어(사자성어)만 추천하세요.
4. 교육적 가치가 있고, 일반인에게 유용한 고사성어를 추천하세요.
5. 한자와 뜻, 유래를 설명할 수 있는 고사성어여야 합니다.

**이미 사용된 고사성어 목록 (${usedGosaList.length}개):**
${usedGosaList.length > 0 
  ? usedGosaList.slice(0, 100).map((gosa, i) => `${i + 1}. ${gosa}`).join('\n') 
  : '없음 (모든 고사성어 사용 가능)'}
${usedGosaList.length > 100 ? `... 외 ${usedGosaList.length - 100}개 더` : ''}

**추천 기준:**
- 위 URL과 목록에 없는 고사성어
- 일반적으로 잘 알려진 고사성어 (너무 생소하지 않은 것)
- 일상생활이나 교육에 활용 가능한 고사성어
- 한자 뜻과 유래가 명확한 고사성어

**응답 형식:**
고사성어만 4글자로 정확히 답변하세요. 설명이나 추가 텍스트 없이 고사성어만 반환하세요.

예시:
관포지교

추천할 고사성어:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let selectedGosa = response.text().trim();
      
      // 첫 번째 줄만 추출 (여러 줄 응답 대비)
      selectedGosa = selectedGosa.split('\n')[0].trim();
      
      // 따옴표나 특수문자 제거
      selectedGosa = selectedGosa.replace(/^["'「」『』]\s*/, '').replace(/\s*["'「」『』]$/, '');
      selectedGosa = selectedGosa.replace(/^[0-9]+[\.\)]\s*/, ''); // 번호 제거
      selectedGosa = selectedGosa.replace(/^(고사성어|사자성어|추천|답변):\s*/i, ''); // 접두사 제거
      
      // 한글 2-4글자만 추출
      const gosaMatch = selectedGosa.match(/^([가-힣]{2,4})/);
      if (gosaMatch) {
        selectedGosa = gosaMatch[1];
      }
      
      // 유효성 검증
      if (!selectedGosa || selectedGosa.length < 2 || selectedGosa.length > 4) {
        console.warn(`⚠️  AI가 반환한 고사성어가 유효하지 않음: "${selectedGosa}"`);
        return null;
      }
      
      // 중복 확인
      if (usedGosaList.includes(selectedGosa)) {
        console.warn(`⚠️  AI가 추천한 고사성어가 이미 사용됨: "${selectedGosa}"`);
        return null;
      }
      
      console.log(`✅ AI 추천 고사성어: ${selectedGosa}`);
      return selectedGosa;
      
    } catch (error) {
      console.error('고사성어 AI 추천 실패:', error);
      return null;
    }
  }
}

export default KeywordHarvester;
