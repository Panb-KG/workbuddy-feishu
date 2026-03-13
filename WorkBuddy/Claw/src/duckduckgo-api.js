import axios from 'axios';

/**
 * DuckDuckGo API客户端
 * 免费搜索API，无需API密钥
 */
export class DuckDuckGoClient {
  constructor() {
    this.baseUrl = 'https://api.duckduckgo.com';
  }

  /**
   * 执行搜索
   */
  async search(query, options = {}) {
    const {
      format = 'json',
      noHtml = 1,
      skipDisambig = 1
    } = options;

    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          q: query,
          format: format,
          no_html: noHtml,
          skip_disambig: skipDisambig
        },
        timeout: 10000
      });

      return { 
        success: true, 
        data: this.formatResults(response.data, query)
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  /**
   * 格式化搜索结果
   */
  formatResults(data, query) {
    const result = {
      query: query,
      abstract: data.AbstractText || '',
      abstractSource: data.AbstractSource || '',
      abstractUrl: data.AbstractURL || '',
      image: data.Image || '',
      relatedTopics: []
    };

    // 处理相关主题
    if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
      result.relatedTopics = data.RelatedTopics.map(topic => ({
        name: topic.Text || '',
        url: topic.FirstURL || ''
      })).filter(topic => topic.name);
    }

    // 处理结果数组
    if (data.Results && Array.isArray(data.Results)) {
      result.results = data.Results.map(item => ({
        title: item.Text || '',
        url: item.FirstURL || '',
        description: ''
      }));
    }

    return result;
  }

  /**
   * 搜索并生成摘要
   */
  async searchWithSummary(query) {
    const result = await this.search(query);
    
    if (!result.success) {
      return result;
    }

    const summary = this.generateSummary(result.data);
    return { 
      success: true, 
      data: {
        summary: summary,
        details: result.data
      }
    };
  }

  /**
   * 生成搜索摘要
   */
  generateSummary(data) {
    if (!data.abstract && data.relatedTopics.length === 0) {
      return `没有找到关于"${data.query}"的相关信息。`;
    }

    let summary = `关于"${data.query}"的搜索结果：\n\n`;
    
    if (data.abstract) {
      summary += `📖 **摘要**: ${data.abstract}\n`;
      if (data.abstractSource) {
        summary += `来源: ${data.abstractSource}\n`;
      }
      summary += '\n';
    }

    if (data.relatedTopics.length > 0) {
      summary += `🔗 **相关主题** (${data.relatedTopics.length}个):\n`;
      data.relatedTopics.slice(0, 5).forEach((topic, index) => {
        summary += `${index + 1}. ${topic.name}\n`;
      });
    }

    return summary;
  }

  /**
   * 批量搜索
   */
  async batchSearch(queries) {
    const results = [];
    
    for (const query of queries) {
      const result = await this.search(query);
      results.push({
        query: query,
        success: result.success,
        data: result.success ? result.data : null,
        error: result.success ? null : result.error
      });
      
      // 避免请求过快
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return { success: true, data: results };
  }

  /**
   * 检查API可用性
   */
  async checkAvailability() {
    try {
      const result = await this.search('test');
      return { 
        available: result.success, 
        message: result.success ? 'DuckDuckGo API可用' : result.error 
      };
    } catch (error) {
      return { available: false, message: error.message };
    }
  }
}