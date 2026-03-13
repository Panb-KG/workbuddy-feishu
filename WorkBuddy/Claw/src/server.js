import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { FeishuEventHandler } from './feishu-event-handler.js';
import { FeishuCardBuilder } from './feishu-card-builder.js';

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 初始化处理器
const eventHandler = new FeishuEventHandler();
const cardBuilder = new FeishuCardBuilder();

/**
 * 健康检查端点
 */
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    service: 'WorkBuddy Feishu Integration',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      webhook: '/webhook',
      status: '/status',
      test: '/test'
    }
  });
});

/**
 * 状态检查端点
 */
app.get('/status', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'WorkBuddy Feishu Bot',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    features: {
      feishu_integration: true,
      search_service: true,
      memory_system: true,
      interactive_cards: true
    }
  });
});

/**
 * 飞书Webhook端点
 */
app.post('/webhook', async (req, res) => {
  console.log('📨 收到Webhook请求:', req.body);
  
  try {
    const result = await eventHandler.handleEvent(req.body);
    
    if (result.challenge) {
      // URL验证请求
      res.json({ challenge: result.challenge });
    } else {
      // 普通事件处理
      res.json({ 
        success: true, 
        message: '事件处理完成',
        data: result 
      });
    }
    
  } catch (error) {
    console.error('❌ Webhook处理错误:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * 测试端点 - 发送测试消息
 */
app.post('/test/message', async (req, res) => {
  try {
    const { userId, message, type = 'text' } = req.body;
    
    if (!userId || !message) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数: userId 和 message'
      });
    }
    
    const result = await eventHandler.sendReply(null, userId, message, type);
    
    res.json({
      success: result.success,
      message: result.success ? '消息发送成功' : '消息发送失败',
      data: result
    });
    
  } catch (error) {
    console.error('❌ 测试消息发送失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 测试端点 - 发送欢迎卡片
 */
app.post('/test/welcome', async (req, res) => {
  try {
    const { userId, userName = '老潘' } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数: userId'
      });
    }
    
    const welcomeCard = cardBuilder.createWelcomeCard(userName);
    const result = await eventHandler.sendReply(null, userId, welcomeCard, 'interactive');
    
    res.json({
      success: result.success,
      message: result.success ? '欢迎卡片发送成功' : '卡片发送失败',
      data: result
    });
    
  } catch (error) {
    console.error('❌ 欢迎卡片发送失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 搜索测试端点
 */
app.post('/test/search', async (req, res) => {
  try {
    const { query, userId } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: '缺少必要参数: query'
      });
    }
    
    const result = await eventHandler.handleSearch(query, { sender_id: userId || 'test-user' });
    
    res.json({
      success: result.success,
      message: result.message,
      data: result
    });
    
  } catch (error) {
    console.error('❌ 搜索测试失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取系统信息
 */
app.get('/system/info', (req, res) => {
  res.json({
    system: {
      name: 'WorkBuddy Feishu Integration',
      version: '1.0.0',
      description: '智能工作助手飞书集成系统',
      author: '老潘',
      repository: 'https://github.com/your-repo/workbuddy-feishu'
    },
    environment: {
      node_version: process.version,
      platform: process.platform,
      memory_usage: process.memoryUsage(),
      uptime: process.uptime()
    },
    configuration: {
      feishu_app_id: process.env.FEISHU_APP_ID ? '已配置' : '未配置',
      feishu_app_secret: process.env.FEISHU_APP_SECRET ? '已配置' : '未配置',
      port: PORT,
      node_env: process.env.NODE_ENV || 'development'
    }
  });
});

/**
 * 错误处理中间件
 */
app.use((error, req, res, next) => {
  console.error('🚨 服务器错误:', error);
  res.status(500).json({
    success: false,
    error: '内部服务器错误',
    message: process.env.NODE_ENV === 'development' ? error.message : '服务器异常'
  });
});

/**
 * 404处理
 */
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: '接口不存在',
    path: req.originalUrl,
    method: req.method,
    available_endpoints: {
      'GET /': '健康检查',
      'GET /status': '状态检查',
      'POST /webhook': '飞书Webhook',
      'POST /test/message': '测试消息发送',
      'POST /test/welcome': '测试欢迎卡片',
      'POST /test/search': '测试搜索功能',
      'GET /system/info': '系统信息'
    }
  });
});

/**
 * 启动服务器
 */
app.listen(PORT, () => {
  console.log('🚀 WorkBuddy 飞书集成服务启动成功!');
  console.log('📍 服务地址:', `http://localhost:${PORT}`);
  console.log('📊 健康检查:', `http://localhost:${PORT}/`);
  console.log('🔧 环境变量检查:');
  console.log('   - FEISHU_APP_ID:', process.env.FEISHU_APP_ID ? '已配置' : '未配置');
  console.log('   - FEISHU_APP_SECRET:', process.env.FEISHU_APP_SECRET ? '已配置' : '未配置');
  console.log('   - PORT:', PORT);
  console.log('   - NODE_ENV:', process.env.NODE_ENV || 'development');
  console.log('');
  console.log('💡 使用说明:');
  console.log('   1. 在飞书开放平台配置Webhook地址为:', `http://你的域名/webhook`);
  console.log('   2. 在飞书群聊中 @WorkBuddy 或发送命令开始使用');
  console.log('   3. 可用命令: /help, /search, /memory, /status 等');
  console.log('');
  console.log('🎯 功能特性:');
  console.log('   • 🤖 智能对话交互');
  console.log('   • 🔍 本地知识搜索');
  console.log('   • 🧠 记忆系统管理');
  console.log('   • 📱 美观的卡片界面');
  console.log('   • ⚡ 实时消息推送');
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n🛑 收到关闭信号，正在优雅关闭服务...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 收到终止信号，正在优雅关闭服务...');
  process.exit(0);
});

export default app;