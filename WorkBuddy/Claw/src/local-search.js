import fs from 'fs';
import path from 'path';

/**
 * 本地搜索引擎
 * 基于本地数据文件和知识库的搜索功能
 */
export class LocalSearchEngine {
  constructor(dataDir = './data') {
    this.dataDir = dataDir;
    this.knowledgeBase = [];
    this.init();
  }

  /**
   * 初始化知识库
   */
  init() {
    // 基础知识库数据
    this.knowledgeBase = [
      {
        id: 1,
        title: '人工智能基础',
        content: '人工智能是计算机科学的一个分支，旨在创造能够执行通常需要人类智能的任务的机器。',
        tags: ['AI', '机器学习', '计算机科学'],
        category: '技术'
      },
      {
        id: 2,
        title: 'Python编程语言',
        content: 'Python是一种高级编程语言，以其简洁的语法和强大的库支持而闻名，广泛用于Web开发、数据科学和人工智能。',
        tags: ['Python', '编程', '开发'],
        category: '编程'
      },
      {
        id: 3,
        title: '机器学习算法',
        content: '机器学习算法包括监督学习、无监督学习和强化学习等类型，用于从数据中学习模式和做出预测。',
        tags: ['机器学习', '算法', '数据科学'],
        category: '技术'
      },
      {
        id: 4,
        title: '深度学习框架',
        content: '深度学习框架如TensorFlow、PyTorch和Keras提供了构建和训练神经网络的高级API。',
        tags: ['深度学习', '框架', '神经网络'],
        category: '技术'
      },
      {
        id: 5,
        title: '自然语言处理',
        content: '自然语言处理是人工智能的一个分支，专注于计算机与人类语言之间的交互。',
        tags: ['NLP', '语言处理', 'AI'],
        category: '技术'
      }
    ];
  }

  /**
   * 执行本地搜索
   */
  async search(query, options = {}) {
    const { 
      maxResults = 5,
      fuzzyMatch = true,
      searchFields = ['title', 'content', 'tags']
    } = options;

    try {
      const results = [];
      
      // 遍历知识库进行搜索
      for (const item of this.knowledgeBase) {
        let score = 0;
        
        // 在不同字段中搜索
        for (const field of searchFields) {
          const fieldValue = item[field] || '';
          
          if (Array.isArray(fieldValue)) {
            // 处理数组字段（如tags）
            for (const value of fieldValue) {
              score += this.calculateMatchScore(value, query);
            }
          } else if (typeof fieldValue === 'string') {
            // 处理字符串字段
            score += this.calculateMatchScore(fieldValue, query);
          }
        }
        
        if (score > 0) {
          results.push({
            ...item,
            score: score,
            relevance: this.calculateRelevance(score)
          });
        }
      }
      
      // 按分数排序并限制结果数量
      const sortedResults = results
        .sort((a, b) => b.score - a.score)
        .slice(0, maxResults);

      return {
        success: true,
        data: {
          query: query,
          totalResults: results.length,
          results: sortedResults,
          summary: this.generateSummary(sortedResults, query)
        }
      };
      
    } catch (error) {
      return { 
        success: false, 
        error: `本地搜索失败: ${error.message}` 
      };
    }
  }

  /**
   * 计算匹配分数
   */
  calculateMatchScore(text, query) {
    if (!text || !query) return 0;
    
    const textLower = text.toLowerCase();
    const queryLower = query.toLowerCase();
    
    // 精确匹配
    if (textLower === queryLower) return 10;
    
    // 包含匹配
    if (textLower.includes(queryLower)) return 5;
    
    // 分词匹配
    const queryWords = queryLower.split(/\s+/);
    let wordScore = 0;
    
    for (const word of queryWords) {
      if (word.length > 2 && textLower.includes(word)) {
        wordScore += 2;
      }
    }
    
    return wordScore;
  }

  /**
   * 计算相关性
   */
  calculateRelevance(score) {
    if (score >= 8) return '高';
    if (score >= 4) return '中';
    return '低';
  }

  /**
   * 生成搜索摘要
   */
  generateSummary(results, query) {
    if (results.length === 0) {
      return `没有找到关于"${query}"的相关信息。`;
    }

    let summary = `关于"${query}"的本地搜索结果（共${results.length}条）：\n\n`;
    
    results.forEach((result, index) => {
      summary += `${index + 1}. **${result.title}** (相关性: ${result.relevance})\n`;
      summary += `   ${result.content.substring(0, 100)}...\n\n`;
    });

    return summary;
  }

  /**
   * 添加知识条目
   */
  addKnowledgeItem(item) {
    const newItem = {
      id: this.knowledgeBase.length + 1,
      ...item,
      createdAt: new Date().toISOString()
    };
    
    this.knowledgeBase.push(newItem);
    return newItem;
  }

  /**
   * 批量添加知识
   */
  addKnowledgeItems(items) {
    const addedItems = [];
    
    for (const item of items) {
      addedItems.push(this.addKnowledgeItem(item));
    }
    
    return addedItems;
  }

  /**
   * 获取知识库统计信息
   */
  getStats() {
    const categories = {};
    const tags = {};
    
    this.knowledgeBase.forEach(item => {
      // 分类统计
      categories[item.category] = (categories[item.category] || 0) + 1;
      
      // 标签统计
      if (item.tags) {
        item.tags.forEach(tag => {
          tags[tag] = (tags[tag] || 0) + 1;
        });
      }
    });
    
    return {
      totalItems: this.knowledgeBase.length,
      categories: categories,
      popularTags: Object.entries(tags)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .reduce((obj, [tag, count]) => ({ ...obj, [tag]: count }), {})
    };
  }

  /**
   * 导出知识库
   */
  exportKnowledgeBase() {
    return {
      metadata: {
        exportedAt: new Date().toISOString(),
        totalItems: this.knowledgeBase.length
      },
      data: this.knowledgeBase
    };
  }

  /**
   * 导入知识库
   */
  importKnowledgeBase(data) {
    if (data && data.data && Array.isArray(data.data)) {
      this.knowledgeBase = data.data;
      return { success: true, importedCount: data.data.length };
    }
    return { success: false, error: '无效的数据格式' };
  }
}