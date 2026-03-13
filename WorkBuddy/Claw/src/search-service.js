import { SerperApiClient } from './serper-api.js';
import { DuckDuckGoClient } from './duckduckgo-api.js';
import { FeishuBotClient } from './feishu-bot.js';

/**
 * 搜索服务 - 支持多种搜索API
 */
export class SearchService {
  constructor() {
    this.serper = new SerperApiClient();
    this.duckduckgo = new DuckDuckGoClient();
    this.bot = new FeishuBotClient();
    this.currentProvider = 'duckduckgo'; // 默认使用DuckDuckGo
  }

  /**
   * 设置搜索提供商
   */
  setProvider(provider) {
    const validProviders = ['serper', 'duckduckgo'];
    if (validProviders.includes(provider)) {
      this.currentProvider = provider;
      return true;
    }
    return false;
  }

  /**
   * 执行搜索
   */
  async search(query, options = {}) {
    const { provider = this.currentProvider, ...searchOptions } = options;
    
    try {
      let result;
      
      switch (provider) {
        case 'serper':
          result = await this.serper.search(query, searchOptions);
          break;
        case 'duckduckgo':
        default:
          result = await this.duckduckgo.search(query, searchOptions);
          break;
      }
      
      return result;
    } catch (error) {
      return { 
        success: false, 
        error: `搜索失败: ${error.message}` 
      };
    }
  }

  /**
   * 搜索并发送到飞书
   */
  async searchAndNotify(query, options = {}) {
    const { 
      provider = this.currentProvider,
      format = 'text',
      maxResults = 5,
      ...searchOptions 
    } = options;

    try {
      // 执行搜索
      const searchResult = await this.search(query, { 
        provider, 
        ...searchOptions 
      });
      
      if (!searchResult.success) {
        return searchResult;
      }

      // 生成通知消息
      const message = this.formatNotificationMessage(searchResult.data, query, format, maxResults);
      
      // 发送到飞书
      const notifyResult = await this.bot.sendMessage(message);
      
      return {
        success: notifyResult.success,
        searchData: searchResult.data,
        notifyResult: notifyResult,
        error: notifyResult.success ? null : notifyResult.error
      };
      
    } catch (error) {
      return { 
        success: false, 
        error: `搜索通知失败: ${error.message}` 
      };
    }
  }

  /**
   * 格式化通知消息
   */
  formatNotificationMessage(data, query, format = 'text', maxResults = 5) {
    if (format === 'card') {
      return this.formatCardMessage(data, query, maxResults);
    }
    
    // 默认文本消息
    return this.formatTextMessage(data, query, maxResults);
  }

  /**
   * 格式化文本消息
   */
  formatTextMessage(data, query, maxResults) {
    let message = `🔍 **搜索通知**\n`;
    message += `关键词: ${query}\n`;
    message += `提供商: ${this.currentProvider}\n\n`;

    if (data.abstract) {
      message += `📖 **摘要**: ${data.abstract}\n\n`;
    }

    if (data.relatedTopics && data.relatedTopics.length > 0) {
      message += `🔗 **相关主题**:\n`;
      data.relatedTopics.slice(0, maxResults).forEach((topic, index) => {
        message += `${index + 1}. ${topic.name}\n`;
      });
    } else if (data.results && data.results.length > 0) {
      message += `📊 **搜索结果**:\n`;
      data.results.slice(0, maxResults).forEach((result, index) => {
        message += `${index + 1}. ${result.title}\n`;
      });
    } else {
      message += `⚠️ 未找到相关结果`;
    }

    return {
      msg_type: 'text',
      content: {
        text: message
      }
    };
  }

  /**
   * 格式化卡片消息
   */
  formatCardMessage(data, query, maxResults) {
    const elements = [
      {
        tag: 'div',
        text: {
          tag: 'lark_md',
          content: `🔍 **搜索通知**\n**关键词**: ${query}\n**提供商**: ${this.currentProvider}`
        }
      }
    ];

    if (data.abstract) {
      elements.push({
        tag: 'div',
        text: {
          tag: 'lark_md',
          content: `📖 **摘要**\n${data.abstract}`
        }
      });
    }

    if (data.relatedTopics && data.relatedTopics.length > 0) {
      const topicsText = data.relatedTopics.slice(0, maxResults)
        .map((topic, index) => `${index + 1}. ${topic.name}`)
        .join('\n');
      
      elements.push({
        tag: 'div',
        text: {
          tag: 'lark_md',
          content: `🔗 **相关主题**\n${topicsText}`
        }
      });
    }

    return {
      msg_type: 'interactive',
      card: {
        config: {
          wide_screen_mode: true
        },
        header: {
          title: {
            tag: 'plain_text',
            content: '🔍 搜索结果'
          },
          template: 'blue'
        },
        elements: elements
      }
    };
  }

  /**
   * 检查所有提供商状态
   */
  async checkProviders() {
    const results = {};
    
    // 检查Serper
    const serperCheck = await this.serper.checkApiKey();
    results.serper = {
      available: serperCheck.valid,
      message: serperCheck.message
    };
    
    // 检查DuckDuckGo
    const duckduckgoCheck = await this.duckduckgo.checkAvailability();
    results.duckduckgo = {
      available: duckduckgoCheck.available,
      message: duckduckgoCheck.message
    };
    
    return { success: true, data: results };
  }

  /**
   * 获取可用提供商列表
   */
  getAvailableProviders() {
    return [
      {
        name: 'duckduckgo',
        displayName: 'DuckDuckGo',
        free: true,
        description: '免费搜索API，无需密钥'
      },
      {
        name: 'serper',
        displayName: 'Serper',
        free: false,
        description: 'Google搜索API，需要API密钥'
      }
    ];
  }
}