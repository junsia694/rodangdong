import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * 티스토리 고사성어 카테고리에서 기존에 사용된 고사성어 목록 수집
 */
class GosaCollector {
  constructor() {
    this.categoryUrl = 'https://rodangdong.tistory.com/category/%EA%B3%A0%EC%82%AC%EC%84%B1%EC%96%B4';
  }

  /**
   * 티스토리 카테고리 페이지에서 고사성어 목록 추출
   * @returns {Promise<Array<string>>} 사용된 고사성어 목록
   */
  async getUsedGosaList() {
    try {
      console.log('📚 티스토리 고사성어 카테고리에서 기존 목록 수집 중...');
      
      const usedGosaList = [];
      let page = 1;
      let hasMore = true;

      while (hasMore && page <= 10) { // 최대 10페이지까지
        try {
          const url = page === 1 
            ? this.categoryUrl 
            : `${this.categoryUrl}?page=${page}`;
          
          const response = await axios.get(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 10000
          });

          const $ = cheerio.load(response.data);
          
          // 게시글 제목에서 고사성어 추출
          $('a[href*="/"]').each((i, elem) => {
            const title = $(elem).text().trim();
            const href = $(elem).attr('href');
            
            // 고사성어 카테고리 게시글인지 확인
            if (href && href.includes('/') && title) {
              // 제목에서 고사성어 추출 (예: "관포지교 사자성어의 뜻과 유래..." -> "관포지교")
              const gosaMatch = title.match(/^([가-힣]{2,4})\s/);
              if (gosaMatch) {
                const gosa = gosaMatch[1];
                if (gosa.length >= 2 && gosa.length <= 4 && !usedGosaList.includes(gosa)) {
                  usedGosaList.push(gosa);
                }
              }
            }
          });

          // 다음 페이지 확인
          const nextPage = $('a[href*="page="]').filter((i, elem) => {
            return $(elem).text().includes('다음') || $(elem).text().includes('>');
          });
          
          hasMore = nextPage.length > 0;
          page++;
          
          // API 호출 제한을 위한 지연
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.warn(`페이지 ${page} 수집 실패:`, error.message);
          hasMore = false;
        }
      }

      console.log(`✅ 총 ${usedGosaList.length}개의 기존 고사성어 수집 완료`);
      return usedGosaList;
      
    } catch (error) {
      console.error('고사성어 목록 수집 실패:', error);
      return [];
    }
  }

  /**
   * 티스토리 카테고리에서 고사성어 게시글 목록 추출 (제목과 URL)
   * @returns {Promise<Array<{title: string, url: string}>>} 게시글 목록
   */
  async getGosaArticles() {
    try {
      console.log('📚 티스토리 고사성어 카테고리에서 게시글 목록 수집 중...');
      
      const articles = [];
      let page = 1;
      let hasMore = true;

      while (hasMore && page <= 5) { // 최대 5페이지까지 (충분한 게시글 확보)
        try {
          const url = page === 1 
            ? this.categoryUrl 
            : `${this.categoryUrl}?page=${page}`;
          
          const response = await axios.get(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 10000
          });

          const $ = cheerio.load(response.data);
          
          // 티스토리 게시글 링크 추출 (더 정확한 선택자 사용)
          $('a[href*="rodangdong.tistory.com"]').each((i, elem) => {
            const title = $(elem).text().trim();
            let href = $(elem).attr('href');
            
            // 카테고리 링크 제외, 게시글 링크만
            if (href && title && !href.includes('category') && !href.includes('archive') && !href.includes('tag')) {
              // 상대 경로를 절대 경로로 변환
              if (href.startsWith('/')) {
                href = `https://rodangdong.tistory.com${href}`;
              }
              
              // URL 형식 확인 (게시글 번호 포함)
              if (href.match(/\/\d+$/)) {
                // 중복 제거
                const existing = articles.find(a => a.url === href);
                if (!existing && title.length > 10 && title.length < 200) {
                  // 고사성어 관련 제목인지 확인 (더 유연한 패턴)
                  if (title.match(/[가-힣]{2,4}.*(사자성어|고사성어|뜻과 유래|뜻과|유래)/) || 
                      title.match(/^(백이숙제|순망치한|전화위복|형우제공|관포지교|결자해지|고식지계|노심초사|사필귀정|점입가경|교토삼굴|근하신년)/)) {
                    articles.push({
                      title: title,
                      url: href
                    });
                  }
                }
              }
            }
          });
          
          // 대체 방법: 제목에서 직접 추출
          $('strong, h3, h4').each((i, elem) => {
            const title = $(elem).text().trim();
            const parent = $(elem).parent();
            const link = parent.find('a').first();
            
            if (link.length > 0 && title.length > 10) {
              let href = link.attr('href');
              if (href && !href.includes('category') && !href.includes('archive')) {
                if (href.startsWith('/')) {
                  href = `https://rodangdong.tistory.com${href}`;
                }
                
                if (href.match(/\/\d+$/)) {
                  const existing = articles.find(a => a.url === href || a.title === title);
                  if (!existing && title.length > 10 && title.length < 200) {
                    if (title.match(/[가-힣]{2,4}.*(사자성어|고사성어|뜻과 유래)/) ||
                        title.match(/^(백이숙제|순망치한|전화위복|형우제공|관포지교|결자해지|고식지계|노심초사|사필귀정|점입가경|교토삼굴|근하신년)/)) {
                      articles.push({
                        title: title,
                        url: href
                      });
                    }
                  }
                }
              }
            }
          });

          // 다음 페이지 확인
          const nextPage = $('a[href*="page="]').filter((i, elem) => {
            return $(elem).text().includes('다음') || $(elem).text().includes('>');
          });
          
          hasMore = nextPage.length > 0 && articles.length < 50; // 최대 50개까지만
          page++;
          
          // API 호출 제한을 위한 지연
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.warn(`페이지 ${page} 수집 실패:`, error.message);
          hasMore = false;
        }
      }

      console.log(`✅ 총 ${articles.length}개의 고사성어 게시글 수집 완료`);
      return articles;
      
    } catch (error) {
      console.error('고사성어 게시글 목록 수집 실패:', error);
      return [];
    }
  }

  /**
   * 게시글 목록에서 랜덤으로 5개 선택
   * @param {Array<{title: string, url: string}>} articles - 게시글 목록
   * @param {string} excludeTitle - 제외할 제목 (현재 작성 중인 게시글)
   * @returns {Array<{title: string, url: string}>} 선택된 게시글 5개
   */
  getRandomArticles(articles, excludeTitle = '') {
    // 현재 게시글 제외
    const filtered = articles.filter(article => 
      !excludeTitle || !article.title.includes(excludeTitle)
    );
    
    if (filtered.length === 0) {
      return [];
    }
    
    // 랜덤으로 섞기
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    
    // 5개 선택
    return shuffled.slice(0, 5);
  }

  /**
   * 새로운 고사성어 생성 (기존 목록과 중복되지 않도록)
   * @param {Array<string>} usedGosaList - 사용된 고사성어 목록
   * @returns {Promise<string>} 새로운 고사성어
   */
  async generateNewGosa(usedGosaList) {
    try {
      // 일반적인 고사성어 목록 (예시)
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
        '하늘의 별 따기', '한단지몽', '화룡점정', '회자정리', '후생가외', '훈훈한 정'
      ];

      // 사용되지 않은 고사성어 필터링
      const availableGosa = commonGosa.filter(gosa => !usedGosaList.includes(gosa));
      
      if (availableGosa.length === 0) {
        console.warn('⚠️  모든 일반 고사성어가 사용됨. AI로 새로운 고사성어 생성...');
        // AI로 생성하는 로직 추가 가능
        return null;
      }

      // 랜덤 선택
      const randomIndex = Math.floor(Math.random() * availableGosa.length);
      return availableGosa[randomIndex];
      
    } catch (error) {
      console.error('새 고사성어 생성 실패:', error);
      return null;
    }
  }
}

export default GosaCollector;

