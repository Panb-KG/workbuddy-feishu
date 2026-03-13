# 飞书 + Serper 集成项目

一个完整的飞书API、机器人集成和Serper搜索API的解决方案，支持实时搜索、消息推送和智能通知。

## 📋 功能特性

### 飞书集成
- 🔐 自动租户访问令牌管理
- 💬 支持多种消息类型（文本、富文本、图片、卡片）
- 👥 部门管理和用户查询
- 🎴 丰富的卡片消息模板

### Serper搜索API
- 🔍 **实时Google搜索** - 通过Serper API访问Google搜索结果
- 🖼️ **图片搜索** - 支持图片内容搜索
- 📰 **新闻搜索** - 实时新闻资讯搜索
- 🎥 **视频搜索** - 视频内容搜索
- 📊 **结果格式化** - 自动生成搜索摘要和格式化结果

### 集成功能
- 🤖 **智能搜索通知** - 搜索后自动发送到飞书
- ⚠️ **告警系统** - 支持多级别告警通知
- 📋 **任务管理** - 任务分配和进度跟踪
- 📊 **报告生成** - 自动生成搜索报告

## 🚀 快速开始

### 环境要求
- Node.js 16+
- 飞书开发者账号
- Serper API密钥

### 安装依赖
```bash
npm install
```

### 配置环境变量
复制 `.env.example` 为 `.env` 并填写实际配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：
```env
# 飞书配置
FEISHU_APP_ID=你的飞书应用ID
FEISHU_APP_SECRET=你的飞书应用密钥
FEISHU_BOT_WEBHOOK=你的飞书机器人Webhook地址

# Serper API配置
SERPER_API_KEY=你的Serper API密钥

# 服务器配置
PORT=3000
NODE_ENV=development
```

### 启动服务
```bash
npm run dev
```

服务启动后访问：http://localhost:3000

## 📡 API接口

### 基础接口
- `GET /` - 服务状态和接口文档
- `GET /api/health` - 健康检查
- `GET /api/status` - 服务状态检查

### 飞书API
- `POST /api/send-message` - 发送应用消息
- `POST /api/bot/send-text` - 发送机器人文本消息
- `POST /api/bot/send-card` - 发送机器人卡片消息
- `GET /api/departments` - 获取部门列表

### Serper搜索API
- `GET /api/search` - 执行搜索（支持type参数）
- `GET /api/search/images` - 图片搜索
- `GET /api/search/news` - 新闻搜索

### 集成功能
- `POST /api/search/notify` - 搜索并发送到飞书
- `POST /api/search/images/notify` - 图片搜索并发送
- `POST /api/search/news/notify` - 新闻搜索并发送

## 💡 使用示例

### 基本搜索
```javascript
import { SerperApiClient } from './src/serper-api.js';

const serper = new SerperApiClient();

// 执行搜索
const result = await serper.search('人工智能', { num: 5 });

// 图片搜索
const images = await serper.searchImages('自然风景', { num: 10 });

// 新闻搜索
const news = await serper.searchNews('科技新闻', { num: 5 });
```

### 集成搜索通知
```javascript
import { SearchService } from './src/search-service.js';

const searchService = new SearchService();

// 搜索并发送到飞书
await searchService.searchAndNotify('Python编程', { 
  maxResults: 5, 
  format: 'card' 
});

// 图片搜索并发送
await searchService.searchImagesAndNotify('城市夜景', { 
  maxResults: 6 
});

// 新闻搜索并发送
await searchService.searchNewsAndNotify('人工智能', { 
  maxResults: 3 
});
```

### 运行示例
```bash
node src/examples.js
```

## 🔧 配置说明

### 获取飞书配置
1. 访问飞书开放平台：https://open.feishu.cn/
2. 创建企业自建应用
3. 获取应用ID和应用密钥
4. 在群聊中添加机器人获取Webhook地址

### 获取Serper API密钥
1. 访问Serper官网：https://serper.dev/
2. 注册账号并获取API密钥
3. Serper提供免费的搜索额度

### 权限配置
**飞书应用需要以下权限：**
- 获取用户 user_id
- 获取用户基本信息
- 获取部门信息
- 以应用身份发消息

## 🧪 测试

运行基础功能测试：
```bash
node test/test.js
```

## 📁 项目结构

```
├── src/
│   ├── feishu-api.js      # 飞书API客户端
│   ├── feishu-bot.js      # 飞书机器人客户端
│   ├── serper-api.js      # Serper搜索API客户端
│   ├── search-service.js  # 搜索服务（集成功能）
│   ├── server.js          # Express服务器
│   └── examples.js        # 使用示例
├── test/
│   └── test.js            # 测试文件
├── package.json
├── .env.example
└── README.md
```

## 🔒 安全注意事项

- 妥善保管 `.env` 文件中的API密钥
- 定期更换应用密钥
- 限制机器人Webhook的访问权限
- 在生产环境中使用HTTPS
- 注意Serper API的使用配额

## 💰 Serper API费用

- **免费套餐**: 2,500次搜索/月
- **付费套餐**: 根据使用量计费
- **实时搜索**: 提供最新的Google搜索结果

## 📞 技术支持

如有问题请检查：
1. API密钥是否正确配置
2. 网络连接是否正常
3. 应用权限是否足够
4. 查看控制台错误日志

## 📄 许可证

MIT License