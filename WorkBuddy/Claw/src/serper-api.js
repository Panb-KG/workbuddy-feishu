import axios from 'axios';
import 'dotenv/config';

/**
 * Serper API客户端
 * Serper是Google搜索API服务，提供实时搜索功能
 */
export class SerperApiClient {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.SERPER_API_KEY;
    this.baseUrl = 'https://google.serper.dev';
  }

  /**
   * 执行Google搜索
   */
  async search(query, options = {}) {
    const {
      num = 10,           // 结果数量
      start = 0,          // 起始位置
      gl = 'us',          // 国家代码
      hl = 'en',          // 语言代码
      type = 'search'     // 搜索类型: search, images, news, videos
    } = options;

    try {
      const response = await axios.post(
        `${this.baseUrl}/${type}`,
        {
          q: query,
          num: num,
          start: start,
          gl: gl,
          hl: hl
        },
        {
          headers: {
            'X-API-KEY': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  /**
   * 图片搜索
   */
  async searchImages(query, options = {}) {
    return this.search(query, { ...options, type: 'images' });
  }

  /**
   * 新闻搜索
   */
  async searchNews(query, options = {}) {
    return this.search(query, { ...options, type: 'news' });
  }

  /**
   * 视频搜索
   */
  async searchVideos(query, options = {}) {
    return this.search(query, { ...options, type: 'videos' });
  }

  /**
   * 搜索并格式化结果
   */
  async searchAndFormat(query, options = {}) {
    const result = await this.search(query, options);
    
    if (!result.success) {
      return result;
    }

    const formatted = this.formatSearchResults(result.data);
    return { success: true, data: formatted };
  }

  /**
   * 格式化搜索结果
   */
  formatSearchResults(data) {
    if (!data || !data.organic) {
      return [];
    }

    return data.organic.map((item, index) => ({
      rank: index + 1,
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      position: item.position,
      date: item.date
    }));
  }

  /**
   * 搜索并生成摘要
   */
  async searchWithSummary(query, maxResults = 5) {
    const result = await this.search(query, { num: maxResults });
    
    if (!result.success) {
      return result;
    }

    const summary = this.generateSearchSummary(result.data, query);
    return { 
      success: true, 
      data: {
        summary: summary,
        results: this.formatSearchResults(result.data)
      }
    };
  }

  /**
   * 生成搜索摘要
   */
  generateSearchSummary(data, query) {
    if (!data.organic || data.organic.length === 0) {
      return `没有找到关于"${query}"的相关结果。`;
    }

    const topResults = data.organic.slice(0, 3);
    const totalResults = data.searchInformation?.totalResults || '未知';
    
    let summary = `关于"${query}"的搜索结果（共${totalResults}条）：\n\n`;
    
    topResults.forEach((result, index) => {
      summary += `${index + 1}. **${result.title}**\n`;
      summary += `   ${result.snippet}\n\n`;
    });

    return summary;
  }

  /**
   * 批量搜索多个关键词
   */
  async batchSearch(queries, options = {}) {
    const results = [];
    
    for (const query of queries) {
      const result = await this.search(query, options);
      results.push({
        query: query,
        success: result.success,
        data: result.success ? this.formatSearchResults(result.data) : null,
        error: result.success ? null : result.error
      });
      
      // 避免请求过快
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    return { success: true, data: results };
  }

  /**
   * 检查API密钥有效性
   */
  async checkApiKey() {
    try {
      const result = await this.search('test', { num: 1 });
      return { 
        valid: result.success, 
        message: result.success ? 'API密钥有效' : result.error 
      };
    } catch (error) {
      return { valid: false, message: error.message };
    }
  }
}