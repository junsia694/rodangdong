import axios from 'axios';
import { config } from '../config/index.js';

/**
 * Blogger API 업로드 모듈
 * Google OAuth 2.0 기반 인증으로 Blogger에 콘텐츠 자동 발행
 * 예약 발행 기능 포함
 */

class BloggerPublisher {
  constructor() {
    this.blogId = config.blogger.blogId;
    this.clientId = config.blogger.clientId;
    this.clientSecret = config.blogger.clientSecret;
    this.refreshToken = config.blogger.refreshToken;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * OAuth 2.0 액세스 토큰 갱신
   * @returns {Promise<string>} 새로운 액세스 토큰
   */
  async refreshAccessToken() {
    try {
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: this.refreshToken,
        grant_type: 'refresh_token'
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in * 1000));

      console.log('Access token refreshed successfully');
      return this.accessToken;
    } catch (error) {
      console.error('Failed to refresh access token:', error.response?.data || error.message);
      throw new Error('Authentication failed');
    }
  }

  /**
   * 유효한 액세스 토큰 확인 및 갱신
   * @returns {Promise<string>} 유효한 액세스 토큰
   */
  async getValidAccessToken() {
    if (!this.accessToken || !this.tokenExpiry || new Date() >= this.tokenExpiry) {
      await this.refreshAccessToken();
    }
    return this.accessToken;
  }

  /**
   * Blogger API 요청 헤더 생성
   * @returns {Promise<Object>} API 요청 헤더
   */
  async getAuthHeaders() {
    const accessToken = await this.getValidAccessToken();
    return {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * 블로그의 모든 게시글 제목 가져오기
   * @param {number} maxResults - 가져올 최대 게시글 수 (기본 500)
   * @returns {Promise<Array<string>>} 게시글 제목 배열
   */
  async getAllPostTitles(maxResults = 500) {
    try {
      console.log('📋 블로그 게시글 제목 가져오는 중...');
      
      const headers = await this.getAuthHeaders();
      const allTitles = [];
      let pageToken = null;
      
      do {
        const params = {
          maxResults: 100,
          fetchBodies: false,
          status: ['live', 'draft']
        };
        
        if (pageToken) {
          params.pageToken = pageToken;
        }
        
        const response = await axios.get(
          `https://www.googleapis.com/blogger/v3/blogs/${this.blogId}/posts`,
          { headers, params }
        );
        
        if (response.data.items) {
          const titles = response.data.items.map(post => post.title);
          allTitles.push(...titles);
        }
        
        pageToken = response.data.nextPageToken;
        
        // maxResults 도달 시 중단
        if (allTitles.length >= maxResults) {
          break;
        }
        
      } while (pageToken);
      
      const uniqueTitles = [...new Set(allTitles)];
      console.log(`✅ 블로그 게시글 ${uniqueTitles.length}개 제목 가져오기 완료`);
      
      return uniqueTitles;
      
    } catch (error) {
      console.error('게시글 제목 가져오기 실패:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * HTML 콘텐츠에 Blogger 스타일링 추가
   * @param {string} htmlContent - 원본 HTML 콘텐츠
   * @returns {string} 스타일링이 추가된 HTML
   */
  enhanceHtmlForBlogger(htmlContent) {
    const enhancedHtml = `
      <div class="article-container" style="max-width: 800px; margin: 0 auto; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6;">
        <style>
          .article-container h1, .article-container h2, .article-container h3 {
            color: #2c3e50;
            margin-top: 30px;
            margin-bottom: 15px;
          }
          .article-container h1 {
            font-size: 2.5em;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
          }
          .article-container h2 {
            font-size: 2em;
            border-left: 4px solid #3498db;
            padding-left: 15px;
          }
          .article-container h3 {
            font-size: 1.5em;
            color: #34495e;
          }
          .article-container p {
            margin-bottom: 15px;
            text-align: justify;
          }
          .article-container ul, .article-container ol {
            margin: 15px 0;
            padding-left: 30px;
          }
          .article-container li {
            margin-bottom: 8px;
          }
          .article-container blockquote {
            border-left: 4px solid #3498db;
            margin: 20px 0;
            padding: 10px 20px;
            background-color: #f8f9fa;
            font-style: italic;
          }
          .article-container code {
            background-color: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
          }
          .article-container pre {
            background-color: #f4f4f4;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
          }
          .article-container a {
            color: #3498db;
            text-decoration: none;
          }
          .article-container a:hover {
            text-decoration: underline;
          }
          .article-image {
            text-align: center;
            margin: 30px 0;
          }
          .article-image img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }
          .faq-section, .glossary-section {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .faq-item, .glossary-item {
            margin-bottom: 15px;
            padding: 10px;
            background-color: white;
            border-radius: 5px;
          }
          .faq-question, .glossary-term {
            font-weight: bold;
            color: #2c3e50;
          }
        </style>
        
        ${htmlContent}
        
        <div class="article-footer" style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
          <p>Published on ${new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>
      </div>
    `;

    return enhancedHtml;
  }

  /**
   * 예약 발행 시간 계산
   * @param {number} hoursFromNow - 현재부터 몇 시간 후 발행할지
   * @returns {string} RFC 3339 형식의 예약 시간
   */
  calculateScheduledTime(hoursFromNow = 24) {
    const scheduledDate = new Date();
    scheduledDate.setHours(scheduledDate.getHours() + hoursFromNow);
    
    // 최소 1시간 후로 설정
    if (hoursFromNow < 1) {
      scheduledDate.setHours(scheduledDate.getHours() + 1);
    }
    
    return scheduledDate.toISOString();
  }

  /**
   * 게시글을 Blogger에 발행
   * @param {Object} article - 발행할 아티클 객체
   * @param {boolean} isDraft - 초안으로 저장할지 여부 (기본값: true)
   * @param {number} scheduleHours - 몇 시간 후 발행할지 (기본값: 24시간)
   * @param {Array} customLabels - 커스텀 라벨 배열 (선택사항)
   * @returns {Promise<Object>} 발행 결과
   */
  async publishPost(article, isDraft = true, scheduleHours = 24, customLabels = null) {
    try {
      console.log(`Publishing post for keyword: ${article.keyword}`);

      const headers = await this.getAuthHeaders();
      const enhancedHtml = this.enhanceHtmlForBlogger(article.content);

      // 게시글 데이터 구성
      const postData = {
        title: article.title,
        content: enhancedHtml,
        labels: customLabels || [
          'Technology',
          'IT Trends',
          article.keyword.toLowerCase().replace(/\s+/g, '-')
        ]
      };

      // 예약 발행 설정
      if (!isDraft && scheduleHours > 0) {
        postData.published = this.calculateScheduledTime(scheduleHours);
      } else if (!isDraft) {
        postData.published = new Date().toISOString();
      }

      // Blogger API 호출
      const apiUrl = `https://www.googleapis.com/blogger/v3/blogs/${this.blogId}/posts`;
      const requestConfig = { headers };
      
      // Draft 모드인 경우 URL 파라미터 추가
      if (isDraft) {
        requestConfig.params = { isDraft: true };
      }
      
      const response = await axios.post(apiUrl, postData, requestConfig);

      const publishedPost = response.data;

      if (isDraft) {
        console.log(`📝 Draft saved successfully`);
        console.log(`📝 Draft ID: ${publishedPost.id}`);
        console.log(`🔗 Draft URL: ${publishedPost.url || 'Draft URL 없음'}`);
        console.log(`💡 Draft 상태로 저장되었습니다. Blogger에서 검토 후 게시하세요.`);
      } else {
        console.log(`✅ Post published successfully: ${publishedPost.url}`);
        console.log(`📝 Post ID: ${publishedPost.id}`);
        console.log(`⏰ Published: ${publishedPost.published}`);
        console.log(`🔗 URL: ${publishedPost.url}`);
      }
      
      return {
        success: true,
        postId: publishedPost.id,
        url: publishedPost.url,
        published: publishedPost.published,
        title: publishedPost.title,
        keyword: article.keyword
      };

    } catch (error) {
      console.error('Failed to publish post:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * 게시글을 초안으로 저장
   * @param {Object} article - 저장할 아티클 객체
   * @returns {Promise<Object>} 저장 결과
   */
  async saveAsDraft(article) {
    return await this.publishPost(article, true);
  }

  /**
   * 블로그 정보 조회
   * @returns {Promise<Object>} 블로그 정보
   */
  async getBlogInfo() {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await axios.get(
        `https://www.googleapis.com/blogger/v3/blogs/${this.blogId}`,
        { headers }
      );

      return {
        success: true,
        blog: response.data
      };
    } catch (error) {
      console.error('Failed to get blog info:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * 최근 게시글 목록 조회
   * @param {number} maxResults - 최대 결과 수 (기본값: 10)
   * @returns {Promise<Array>} 게시글 목록
   */
  async getRecentPosts(maxResults = 10) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await axios.get(
        `https://www.googleapis.com/blogger/v3/blogs/${this.blogId}/posts`,
        {
          headers,
          params: {
            maxResults,
            fetchBodies: false,
            fetchImages: false,
            orderBy: 'published',
            sortOrder: 'descending'
          }
        }
      );

      return response.data.items || [];
    } catch (error) {
      console.error('Failed to get recent posts:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * 게시글 삭제
   * @param {string} postId - 삭제할 게시글 ID
   * @returns {Promise<boolean>} 삭제 성공 여부
   */
  async deletePost(postId) {
    try {
      const headers = await this.getAuthHeaders();
      
      await axios.delete(
        `https://www.googleapis.com/blogger/v3/blogs/${this.blogId}/posts/${postId}`,
        { headers }
      );

      console.log(`Post ${postId} deleted successfully`);
      return true;
    } catch (error) {
      console.error(`Failed to delete post ${postId}:`, error.response?.data || error.message);
      return false;
    }
  }

  /**
   * 게시글 발행 상태 확인
   * @param {string} postId - 확인할 게시글 ID
   * @returns {Promise<Object>} 게시글 상태 정보
   */
  async getPostStatus(postId) {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await axios.get(
        `https://www.googleapis.com/blogger/v3/blogs/${this.blogId}/posts/${postId}`,
        { headers }
      );

      return {
        success: true,
        post: response.data
      };
    } catch (error) {
      console.error(`Failed to get post status for ${postId}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * 배치 게시글 발행 (여러 게시글을 시간 간격을 두고 발행)
   * @param {Array} articles - 발행할 아티클 배열
   * @param {number} intervalHours - 게시글 간 간격 (시간)
   * @returns {Promise<Array>} 발행 결과 배열
   */
  async publishBatchPosts(articles, intervalHours = 6) {
    const results = [];

    for (let i = 0; i < articles.length; i++) {
      try {
        const scheduleHours = (i + 1) * intervalHours;
        const result = await this.publishPost(articles[i], false, scheduleHours);
        results.push(result);
        
        console.log(`Scheduled post ${i + 1}/${articles.length} for ${scheduleHours} hours from now`);
        
        // API 호출 제한을 위한 지연
        if (i < articles.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`Failed to publish article ${i + 1}:`, error.message);
        results.push({
          success: false,
          error: error.message,
          keyword: articles[i].keyword
        });
      }
    }

    return results;
  }
}

export default BloggerPublisher;
