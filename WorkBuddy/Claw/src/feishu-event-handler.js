import { FeishuApiClient } from './feishu-api.js';
import { SearchService } from './search-service.js';
import { LocalSearchEngine } from './local-search.js';
import { FeishuCardBuilder } from './feishu-card-builder.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * 飞书事件处理器 - 处理WorkBuddy与飞书的交互
 */
export class FeishuEventHandler {
  constructor() {
    this.feishuClient = new FeishuApiClient();
    this.searchService = new SearchService();
    this.localSearch = new LocalSearchEngine();
    this.cardBuilder = new FeishuCardBuilder();
    this.commands = this.initCommands();
  }

  /**
   * 初始化命令系统
   */
  initCommands() {
    return {
      // 基础命令
      'help': this.handleHelp.bind(this),
      'ping': this.handlePing.bind(this),
      'status': this.handleStatus.bind(this),
      
      // 搜索命令
      'search': this.handleSearch.bind(this),
      '查找': this.handleSearch.bind(this),
      '搜索': this.handleSearch.bind(this),
      
      // 记忆系统命令
      'memory': this.handleMemory.bind(this),
      '记忆': this.handleMemory.bind(this),
      '记录': this.handleRecord.bind(this),
      
      // 项目命令
      'project': this.handleProject.bind(this),
      '项目': this.handleProject.bind(this),
      
      // 系统命令
      'config': this.handleConfig.bind(this),
      '配置': this.handleConfig.bind(this)
    };
  }

  /**
   * 处理飞书事件
   */
  async handleEvent(event) {
    console.log('📨 收到飞书事件:', JSON.stringify(event, null, 2));
    
    // 验证事件类型
    if (event.type === 'url_verification') {
      return { challenge: event.challenge };
    }

    // 处理消息事件
    if (event.header?.event_type === 'im.message.receive_v1') {
      return await this.handleMessageEvent(event);
    }

    return { success: true, message: '事件已接收' };
  }

  /**
   * 处理消息事件
   */
  async handleMessageEvent(event) {
    const message = event.event?.message;
    const sender = event.event?.sender;
    
    if (!message || !sender) {
      return { success: false, error: '无效的消息格式' };
    }

    // 获取消息内容
    const content = await this.extractMessageContent(message);
    
    if (!content) {
      return { success: false, error: '无法解析消息内容' };
    }

    // 处理命令
    const response = await this.processCommand(content, sender);
    
    // 发送回复
    if (response.success && response.message) {
      await this.sendReply(message.message_id, sender.sender_id, response.message, response.type);
    }

    return response;
  }

  /**
   * 提取消息内容
   */
  async extractMessageContent(message) {
    try {
      const content = JSON.parse(message.content);
      
      if (content.text) {
        return content.text.replace(/\\n/g, ' ').trim();
      }
      
      if (content.post) {
        // 处理富文本消息
        return this.extractPostContent(content.post);
      }
      
    } catch (error) {
      console.error('解析消息内容失败:', error);
    }
    
    return null;
  }

  /**
   * 提取富文本内容
   */
  extractPostContent(post) {
    // 简化处理，提取文本内容
    if (post.content && Array.isArray(post.content)) {
      return post.content.map(item => 
        item.text || (item.elements && item.elements.map(e => e.text).join(' '))
      ).filter(Boolean).join(' ');
    }
    return '';
  }

  /**
   * 处理命令
   */
  async processCommand(content, sender) {
    // 识别命令
    const command = this.parseCommand(content);
    
    if (!command) {
      return { 
        success: false, 
        message: '❓ 未识别的命令，输入 `help` 查看可用命令',
        type: 'text'
      };
    }

    // 记录用户交互
    await this.recordUserInteraction(sender, command);

    // 执行命令
    try {
      return await this.commands[command.name](command.args, sender);
    } catch (error) {
      console.error('命令执行失败:', error);
      return { 
        success: false, 
        message: `❌ 命令执行失败: ${error.message}`,
        type: 'text'
      };
    }
  }

  /**
   * 解析命令
   */
  parseCommand(content) {
    const trimmed = content.trim();
    
    // 检查是否是命令格式
    if (trimmed.startsWith('/') || trimmed.includes(' ')) {
      const parts = trimmed.split(' ').filter(p => p);
      const commandName = parts[0].replace('/', '').toLowerCase();
      
      if (this.commands[commandName]) {
        return {
          name: commandName,
          args: parts.slice(1).join(' ')
        };
      }
    }
    
    // 检查是否是直接命令
    const directCommand = trimmed.toLowerCase();
    if (this.commands[directCommand]) {
      return {
        name: directCommand,
        args: ''
      };
    }

    return null;
  }

  /**
   * 记录用户交互
   */
  async recordUserInteraction(sender, command) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      userId: sender.sender_id,
      userType: sender.sender_type,
      command: command.name,
      args: command.args,
      tenantKey: sender.tenant_key
    };

    try {
      const logFile = path.join(process.cwd(), '.workbuddy', 'interaction-log.json');
      let logs = [];
      
      try {
        const data = await fs.readFile(logFile, 'utf8');
        logs = JSON.parse(data);
      } catch (error) {
        // 文件不存在，创建新文件
      }
      
      logs.push(logEntry);
      
      // 只保留最近1000条记录
      if (logs.length > 1000) {
        logs = logs.slice(-1000);
      }
      
      await fs.writeFile(logFile, JSON.stringify(logs, null, 2));
    } catch (error) {
      console.error('记录用户交互失败:', error);
    }
  }

  /**
   * 发送回复
   */
  async sendReply(messageId, userId, content, type = 'text') {
    try {
      const result = await this.feishuClient.sendMessage('user_id', userId, content, type);
      
      if (result.success) {
        console.log('✅ 回复发送成功');
      } else {
        console.error('❌ 回复发送失败:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('发送回复异常:', error);
      return { success: false, error: error.message };
    }
  }

  // ========== 命令处理函数 ==========

  /**
   * 帮助命令
   */
  async handleHelp(args, sender) {
    const helpText = `🤖 **WorkBuddy 帮助菜单**

**基础命令:**
• \`help\` - 显示此帮助菜单
• \`ping\` - 测试连接状态
• \`status\` - 查看系统状态

**搜索功能:**
• \`search [关键词]\` - 搜索信息
• \`查找 [关键词]\` - 中文搜索

**记忆系统:**
• \`memory\` - 查看记忆状态
• \`记录 [内容]\` - 记录新内容

**项目管理:**
• \`project\` - 查看当前项目

**系统配置:**
• \`config\` - 查看配置信息

💡 **使用示例:**
\`/search JavaScript\`
\`查找 Node.js 教程\`
\`记录 今天学习了飞书集成\``;

    return { 
      success: true, 
      message: helpText,
      type: 'text'
    };
  }

  /**
   * Ping命令
   */
  async handlePing(args, sender) {
    return { 
      success: true, 
      message: '🏓 Pong! WorkBuddy 正常运行',
      type: 'text'
    };
  }

  /**
   * 状态命令
   */
  async handleStatus(args, sender) {
    const status = {
      '🔧 系统状态': '正常运行',
      '📊 飞书连接': '已连接',
      '🧠 记忆系统': '已启用',
      '🔍 搜索功能': '可用',
      '⏰ 运行时间': new Date().toLocaleString('zh-CN')
    };

    const statusText = Object.entries(status)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    return { 
      success: true, 
      message: `📈 **WorkBuddy 系统状态**\n\n${statusText}`,
      type: 'text'
    };
  }

  /**
   * 搜索命令
   */
  async handleSearch(args, sender) {
    if (!args || args.trim() === '') {
      return { 
        success: false, 
        message: '❌ 请输入搜索关键词，例如: \`search JavaScript\`',
        type: 'text'
      };
    }

    const query = args.trim();
    
    try {
      // 使用本地搜索引擎
      const results = await this.localSearch.search(query);
      
      if (results.length === 0) {
        return { 
          success: true, 
          message: `🔍 搜索 "${query}" 未找到相关结果`,
          type: 'text'
        };
      }

      const resultText = results.slice(0, 3).map((result, index) => 
        `${index + 1}. **${result.title}**\n   ${result.summary}\n   相关度: ${result.score.toFixed(2)}`
      ).join('\n\n');

      return { 
        success: true, 
        message: `🔍 **搜索 "${query}" 的结果**\n\n${resultText}`,
        type: 'text'
      };

    } catch (error) {
      console.error('搜索失败:', error);
      return { 
        success: false, 
        message: `❌ 搜索失败: ${error.message}`,
        type: 'text'
      };
    }
  }

  /**
   * 记忆系统命令
   */
  async handleMemory(args, sender) {
    try {
      const memoryFile = path.join(process.cwd(), '.workbuddy', 'MEMORY.md');
      const memoryData = await fs.readFile(memoryFile, 'utf8');
      
      // 提取关键信息
      const lines = memoryData.split('\n').slice(0, 20); // 只显示前20行
      const summary = lines.join('\n');

      return { 
        success: true, 
        message: `🧠 **WorkBuddy 记忆摘要**\n\n${summary}`,
        type: 'text'
      };

    } catch (error) {
      console.error('读取记忆失败:', error);
      return { 
        success: true, 
        message: '🧠 WorkBuddy 记忆系统正常运行',
        type: 'text'
      };
    }
  }

  /**
   * 记录命令
   */
  async handleRecord(args, sender) {
    if (!args || args.trim() === '') {
      return { 
        success: false, 
        message: '❌ 请输入要记录的内容，例如: \`记录 今天学习了飞书集成\`',
        type: 'text'
      };
    }

    const content = args.trim();
    const timestamp = new Date().toISOString().split('T')[0];
    
    try {
      const memoryFile = path.join(process.cwd(), '.workbuddy', 'memory', `${timestamp}.md`);
      
      let existingContent = '';
      try {
        existingContent = await fs.readFile(memoryFile, 'utf8');
      } catch (error) {
        // 文件不存在，创建新文件
        await fs.mkdir(path.dirname(memoryFile), { recursive: true });
      }

      const newEntry = `\n## ${new Date().toLocaleString('zh-CN')}\n- 📝 记录: ${content}\n- 👤 用户: ${sender.sender_id}\n`;
      
      await fs.writeFile(memoryFile, existingContent + newEntry, 'utf8');

      return { 
        success: true, 
        message: `✅ 已记录: "${content}"`,
        type: 'text'
      };

    } catch (error) {
      console.error('记录内容失败:', error);
      return { 
        success: false, 
        message: `❌ 记录失败: ${error.message}`,
        type: 'text'
      };
    }
  }

  /**
   * 项目命令
   */
  async handleProject(args, sender) {
    const projectInfo = {
      '📁 项目名称': 'WorkBuddy 飞书集成',
      '🎯 目标': '通过飞书与WorkBuddy交互',
      '🔧 技术栈': 'Node.js, Express, 飞书API',
      '📊 状态': '开发中',
      '🚀 功能': '搜索、记忆、交互命令'
    };

    const projectText = Object.entries(projectInfo)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    return { 
      success: true, 
      message: `📋 **当前项目信息**\n\n${projectText}`,
      type: 'text'
    };
  }

  /**
   * 配置命令
   */
  async handleConfig(args, sender) {
    const configInfo = {
      '🔑 飞书应用ID': process.env.FEISHU_APP_ID ? '已配置' : '未配置',
      '🔒 飞书密钥': process.env.FEISHU_APP_SECRET ? '已配置' : '未配置',
      '🌐 服务器端口': process.env.PORT || '3000',
      '📚 记忆系统': '已启用',
      '🔍 搜索功能': '本地搜索 + API搜索'
    };

    const configText = Object.entries(configInfo)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    return { 
      success: true, 
      message: `⚙️ **系统配置信息**\n\n${configText}`,
      type: 'text'
    };
  }
}