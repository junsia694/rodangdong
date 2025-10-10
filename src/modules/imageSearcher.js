import axios from 'axios';
import { config } from '../config/index.js';

/**
 * 다중 이미지 소스 검색 시스템
 * Google Images, Unsplash, Pexels, Pixabay, Flickr 등을 통합
 */
class ImageSearcher {
  constructor() {
    this.searchHistory = new Set(); // 중복 검색 방지
    this.failedSearches = new Map(); // 실패한 검색어 추적
  }

  /**
   * 메인 이미지 검색 함수 - 모든 소스를 시도
   * @param {string} searchQuery - 검색어
   * @param {number} index - 이미지 인덱스
   * @returns {Promise<Object>} 이미지 정보
   */
  async searchImage(searchQuery, index = 0) {
    try {
      console.log(`🔍 이미지 검색 시작: "${searchQuery}" (인덱스: ${index})`);
      
      // 중복 검색 방지
      const searchKey = `${searchQuery}_${index}`;
      if (this.searchHistory.has(searchKey)) {
        console.log(`⚠️  중복 검색 방지: ${searchKey}`);
        return await this.getRandomImage(searchQuery);
      }
      this.searchHistory.add(searchKey);

      // 다양한 소스에서 이미지 검색 (우선순위 순)
      const sources = [
        () => this.searchGoogleImages(searchQuery, index),
        () => this.searchUnsplash(searchQuery, index),
        () => this.searchPexels(searchQuery, index),
        () => this.searchPixabay(searchQuery, index),
        () => this.searchFlickr(searchQuery, index),
        () => this.searchBingImages(searchQuery, index)
      ];

      for (let i = 0; i < sources.length; i++) {
        try {
          console.log(`🎯 소스 ${i + 1}/${sources.length} 시도 중...`);
          const result = await sources[i]();
          
          if (result && result.url) {
            console.log(`✅ 이미지 검색 성공: ${result.source} - ${result.url}`);
            return result;
          }
        } catch (error) {
          console.warn(`❌ 소스 ${i + 1} 실패:`, error.message);
          continue;
        }
      }

      // 모든 소스 실패시 랜덤 이미지 반환
      console.log(`🔄 모든 소스 실패, 랜덤 이미지 사용`);
      return await this.getRandomImage(searchQuery);

    } catch (error) {
      console.error('이미지 검색 전체 실패:', error);
      return await this.getRandomImage(searchQuery);
    }
  }

  /**
   * Google Custom Search API로 이미지 검색
   * @param {string} query - 검색어
   * @param {number} index - 이미지 인덱스
   * @returns {Promise<Object>} 이미지 정보
   */
  async searchGoogleImages(query, index) {
    try {
      const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
      const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
      
      if (!apiKey || !searchEngineId) {
        console.log('⚠️  Google Search API 키가 설정되지 않음');
        return null;
      }

      const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
        params: {
          key: apiKey,
          cx: searchEngineId,
          q: query,
          searchType: 'image',
          num: 10,
          safe: 'medium',
          imgSize: 'large',
          imgType: 'photo',
          start: (index * 10) + 1 // 페이지네이션으로 다양성 확보
        }
      });

      if (response.data.items && response.data.items.length > 0) {
        // 랜덤하게 이미지 선택
        const randomIndex = Math.floor(Math.random() * response.data.items.length);
        const item = response.data.items[randomIndex];
        
        return {
          url: item.link,
          alt: item.title || query,
          source: 'Google Images',
          attribution: item.image?.contextLink || 'Google Images',
          width: item.image?.width,
          height: item.image?.height,
          thumbnail: item.image?.thumbnailLink
        };
      }
      
      return null;
    } catch (error) {
      console.warn('Google Images 검색 실패:', error.message);
      return null;
    }
  }

  /**
   * Unsplash API로 이미지 검색
   * @param {string} query - 검색어
   * @param {number} index - 이미지 인덱스
   * @returns {Promise<Object>} 이미지 정보
   */
  async searchUnsplash(query, index) {
    try {
      const accessKey = process.env.UNSPLASH_ACCESS_KEY;
      if (!accessKey) {
        console.log('⚠️  Unsplash API 키가 설정되지 않음');
        return null;
      }

      const response = await axios.get('https://api.unsplash.com/search/photos', {
        params: {
          query: query,
          per_page: 30,
          orientation: 'landscape',
          order_by: 'relevant'
        },
        headers: {
          'Authorization': `Client-ID ${accessKey}`
        }
      });

      if (response.data.results && response.data.results.length > 0) {
        // 인덱스 기반 + 랜덤 선택으로 다양성 확보
        const startIndex = (index * 5) % response.data.results.length;
        const endIndex = Math.min(startIndex + 5, response.data.results.length);
        const availableImages = response.data.results.slice(startIndex, endIndex);
        
        if (availableImages.length > 0) {
          const randomImage = availableImages[Math.floor(Math.random() * availableImages.length)];
          
          return {
            url: randomImage.urls.regular,
            alt: randomImage.alt_description || query,
            source: 'Unsplash',
            attribution: `Photo by ${randomImage.user.name} on Unsplash`,
            photographer: randomImage.user.name,
            photographerUrl: randomImage.user.links.html,
            width: randomImage.width,
            height: randomImage.height
          };
        }
      }
      
      return null;
    } catch (error) {
      console.warn('Unsplash 검색 실패:', error.message);
      return null;
    }
  }

  /**
   * Pexels API로 이미지 검색
   * @param {string} query - 검색어
   * @param {number} index - 이미지 인덱스
   * @returns {Promise<Object>} 이미지 정보
   */
  async searchPexels(query, index) {
    try {
      const apiKey = process.env.PEXELS_API_KEY;
      if (!apiKey) {
        console.log('⚠️  Pexels API 키가 설정되지 않음');
        return null;
      }

      const response = await axios.get('https://api.pexels.com/v1/search', {
        params: {
          query: query,
          per_page: 15,
          orientation: 'landscape',
          size: 'large'
        },
        headers: {
          'Authorization': apiKey
        }
      });

      if (response.data.photos && response.data.photos.length > 0) {
        const startIndex = (index * 3) % response.data.photos.length;
        const availablePhotos = response.data.photos.slice(startIndex, startIndex + 3);
        
        if (availablePhotos.length > 0) {
          const randomPhoto = availablePhotos[Math.floor(Math.random() * availablePhotos.length)];
          
          return {
            url: randomPhoto.src.large,
            alt: randomPhoto.alt || query,
            source: 'Pexels',
            attribution: `Photo by ${randomPhoto.photographer} on Pexels`,
            photographer: randomPhoto.photographer,
            photographerUrl: randomPhoto.photographer_url,
            width: randomPhoto.width,
            height: randomPhoto.height
          };
        }
      }
      
      return null;
    } catch (error) {
      console.warn('Pexels 검색 실패:', error.message);
      return null;
    }
  }

  /**
   * Pixabay API로 이미지 검색
   * @param {string} query - 검색어
   * @param {number} index - 이미지 인덱스
   * @returns {Promise<Object>} 이미지 정보
   */
  async searchPixabay(query, index) {
    try {
      const apiKey = process.env.PIXABAY_API_KEY;
      if (!apiKey) {
        console.log('⚠️  Pixabay API 키가 설정되지 않음');
        return null;
      }

      const response = await axios.get('https://pixabay.com/api/', {
        params: {
          key: apiKey,
          q: query,
          image_type: 'photo',
          orientation: 'horizontal',
          category: 'technology',
          min_width: 800,
          per_page: 20,
          page: Math.floor(index / 10) + 1
        }
      });

      if (response.data.hits && response.data.hits.length > 0) {
        const randomHit = response.data.hits[Math.floor(Math.random() * response.data.hits.length)];
        
        return {
          url: randomHit.webformatURL,
          alt: randomHit.tags || query,
          source: 'Pixabay',
          attribution: `Image by ${randomHit.user} from Pixabay`,
          photographer: randomHit.user,
          photographerUrl: `https://pixabay.com/users/${randomHit.user}-${randomHit.user_id}/`,
          width: randomHit.imageWidth,
          height: randomHit.imageHeight
        };
      }
      
      return null;
    } catch (error) {
      console.warn('Pixabay 검색 실패:', error.message);
      return null;
    }
  }

  /**
   * Flickr API로 이미지 검색
   * @param {string} query - 검색어
   * @param {number} index - 이미지 인덱스
   * @returns {Promise<Object>} 이미지 정보
   */
  async searchFlickr(query, index) {
    try {
      const apiKey = process.env.FLICKR_API_KEY;
      if (!apiKey) {
        console.log('⚠️  Flickr API 키가 설정되지 않음');
        return null;
      }

      const response = await axios.get('https://api.flickr.com/services/rest/', {
        params: {
          method: 'flickr.photos.search',
          api_key: apiKey,
          text: query,
          sort: 'relevance',
          per_page: 20,
          page: Math.floor(index / 20) + 1,
          extras: 'url_l,owner_name',
          format: 'json',
          nojsoncallback: 1
        }
      });

      if (response.data.photos && response.data.photos.photo && response.data.photos.photo.length > 0) {
        const randomPhoto = response.data.photos.photo[Math.floor(Math.random() * response.data.photos.photo.length)];
        
        return {
          url: randomPhoto.url_l,
          alt: randomPhoto.title || query,
          source: 'Flickr',
          attribution: `Photo by ${randomPhoto.ownername} on Flickr`,
          photographer: randomPhoto.ownername,
          photographerUrl: `https://www.flickr.com/people/${randomPhoto.owner}/`,
          width: randomPhoto.width_l,
          height: randomPhoto.height_l
        };
      }
      
      return null;
    } catch (error) {
      console.warn('Flickr 검색 실패:', error.message);
      return null;
    }
  }

  /**
   * Bing Images API로 이미지 검색 (대안)
   * @param {string} query - 검색어
   * @param {number} index - 이미지 인덱스
   * @returns {Promise<Object>} 이미지 정보
   */
  async searchBingImages(query, index) {
    try {
      // Bing Images는 직접 API가 제한적이므로 대안 소스 사용
      const alternativeSources = [
        `https://source.unsplash.com/1200x800/?${encodeURIComponent(query)}`,
        `https://picsum.photos/1200/800?random=${Date.now() + index}`,
        `https://via.placeholder.com/1200x800/4F46E5/FFFFFF?text=${encodeURIComponent(query)}`
      ];

      const randomSource = alternativeSources[Math.floor(Math.random() * alternativeSources.length)];
      
      return {
        url: randomSource,
        alt: query,
        source: 'Alternative Source',
        attribution: 'Alternative Image Source',
        width: 1200,
        height: 800
      };
    } catch (error) {
      console.warn('Bing Images 검색 실패:', error.message);
      return null;
    }
  }

  /**
   * 랜덤 이미지 생성 (최후 수단)
   * @param {string} query - 검색어
   * @returns {Promise<Object>} 이미지 정보
   */
  async getRandomImage(query) {
    const techTerms = [
      'technology', 'computer', 'network', 'data', 'innovation',
      'digital', 'artificial intelligence', 'cloud computing',
      'cybersecurity', 'programming', 'software', 'hardware'
    ];
    
    const randomTerm = techTerms[Math.floor(Math.random() * techTerms.length)];
    const timestamp = Date.now();
    
    return {
      url: `https://source.unsplash.com/1200x800/?${encodeURIComponent(randomTerm)}&t=${timestamp}`,
      alt: `${query} technology concept`,
      source: 'Random Tech Image',
      attribution: 'Technology Image Source',
      width: 1200,
      height: 800
    };
  }

  /**
   * 이미지 URL 유효성 검사
   * @param {string} url - 이미지 URL
   * @returns {Promise<boolean>} 유효성
   */
  async validateImageUrl(url) {
    try {
      const response = await axios.head(url, { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

export default ImageSearcher;
