import fs from 'fs-extra';
import { join } from 'path';
import { config } from '../config/index.js';

/**
 * 파일 기반 데이터베이스 모듈
 * 키워드 사용 이력을 저장 및 관리하여 중복 콘텐츠 발행을 방지
 */

class FileDatabase {
  constructor() {
    this.usedKeywordsFile = config.paths.usedKeywordsFile;
    this.dataDir = config.paths.dataDir;
    this.init();
  }

  /**
   * 데이터 디렉토리 및 파일 초기화
   */
  async init() {
    try {
      await fs.ensureDir(this.dataDir);
      
      if (!await fs.pathExists(this.usedKeywordsFile)) {
        await fs.writeJSON(this.usedKeywordsFile, {
          keywords: [],
          lastUpdated: new Date().toISOString()
        }, { spaces: 2 });
      }
    } catch (error) {
      console.error('Failed to initialize file database:', error);
      throw error;
    }
  }

  /**
   * 사용된 키워드 목록 로드
   * @returns {Promise<Array>} 사용된 키워드 배열
   */
  async loadUsedKeywords() {
    try {
      const data = await fs.readJSON(this.usedKeywordsFile);
      return data.keywords || [];
    } catch (error) {
      console.error('Failed to load used keywords:', error);
      return [];
    }
  }

  /**
   * 새로운 키워드 저장
   * @param {string} keyword - 저장할 키워드
   * @param {string} date - 사용 날짜 (ISO 문자열)
   * @returns {Promise<boolean>} 저장 성공 여부
   */
  async saveUsedKeyword(keyword, date = new Date().toISOString()) {
    try {
      const data = await fs.readJSON(this.usedKeywordsFile);
      
      const keywordEntry = {
        keyword,
        usedAt: date,
        id: `${keyword}_${Date.now()}`
      };

      data.keywords.push(keywordEntry);
      data.lastUpdated = new Date().toISOString();

      await fs.writeJSON(this.usedKeywordsFile, data, { spaces: 2 });
      console.log(`Keyword saved: ${keyword}`);
      return true;
    } catch (error) {
      console.error(`Failed to save keyword ${keyword}:`, error);
      return false;
    }
  }

  /**
   * 키워드 중복 확인
   * @param {string} keyword - 확인할 키워드
   * @returns {Promise<boolean>} 중복 여부 (true = 중복됨)
   */
  async isKeywordUsed(keyword) {
    try {
      const usedKeywords = await this.loadUsedKeywords();
      return usedKeywords.some(entry => 
        entry.keyword.toLowerCase() === keyword.toLowerCase()
      );
    } catch (error) {
      console.error(`Failed to check keyword usage for ${keyword}:`, error);
      return false;
    }
  }

  /**
   * 새로운 키워드 목록에서 중복 제거
   * @param {Array<string>} keywords - 확인할 키워드 배열
   * @returns {Promise<Array<string>>} 중복이 제거된 키워드 배열
   */
  async filterNewKeywords(keywords) {
    try {
      const usedKeywords = await this.loadUsedKeywords();
      const usedKeywordSet = new Set(
        usedKeywords.map(entry => entry.keyword.toLowerCase())
      );

      return keywords.filter(keyword => 
        !usedKeywordSet.has(keyword.toLowerCase())
      );
    } catch (error) {
      console.error('Failed to filter new keywords:', error);
      return keywords; // 에러 시 원본 반환
    }
  }

  /**
   * 데이터베이스 통계 조회
   * @returns {Promise<Object>} 데이터베이스 통계 정보
   */
  async getStats() {
    try {
      const data = await fs.readJSON(this.usedKeywordsFile);
      const keywords = data.keywords || [];
      
      return {
        totalKeywords: keywords.length,
        lastUpdated: data.lastUpdated,
        recentKeywords: keywords.slice(-10).map(entry => ({
          keyword: entry.keyword,
          usedAt: entry.usedAt
        }))
      };
    } catch (error) {
      console.error('Failed to get database stats:', error);
      return {
        totalKeywords: 0,
        lastUpdated: null,
        recentKeywords: []
      };
    }
  }

  /**
   * 오래된 키워드 정리 (선택적 기능)
   * @param {number} daysOld - 보관할 일수 (기본 30일)
   */
  async cleanupOldKeywords(daysOld = 30) {
    try {
      const data = await fs.readJSON(this.usedKeywordsFile);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const filteredKeywords = data.keywords.filter(entry => {
        const usedDate = new Date(entry.usedAt);
        return usedDate >= cutoffDate;
      });

      data.keywords = filteredKeywords;
      data.lastUpdated = new Date().toISOString();

      await fs.writeJSON(this.usedKeywordsFile, data, { spaces: 2 });
      
      console.log(`Cleaned up keywords older than ${daysOld} days`);
      return true;
    } catch (error) {
      console.error('Failed to cleanup old keywords:', error);
      return false;
    }
  }
}

export default FileDatabase;
