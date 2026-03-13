import { FeishuApiClient } from './feishu-api.js';
import { FeishuBotClient } from './feishu-bot.js';
import { SerperApiClient } from './serper-api.js';
import { SearchService } from './search-service.js';

// 示例使用代码
export class IntegrationExamples {
  static async demoSerperUsage() {
    console.log('=== Serper API使用示例 ===');
    
    const serper = new SerperApiClient();
    
    try {
      // 1. 检查API密钥
      console.log('\n1. 检查API密钥...');
      const keyStatus = await serper.checkApiKey();
      console.log('API密钥状态:', keyStatus);
      
      // 2. 执行搜索
      console.log('\n2. 执行搜索...');
      const searchResult = await serper.search('人工智能最新发展', { num: 3 });
      console.log('搜索结果:', searchResult.success ? '成功' : searchResult.error);
      
      if (searchResult.success) {
        const formatted = serper.formatSearchResults(searchResult.data);
        console.log('格式化结果:', formatted.slice(0, 2));
      }
      
      // 3. 搜索并生成摘要
      console.log('\n3. 搜索并生成摘要...');
      const summaryResult = await serper.searchWithSummary('机器学习', 3);
      if (summaryResult.success) {
        console.log('搜索摘要:', summaryResult.data.summary);
      }
      
      // 4. 图片搜索
      console.log('\n4. 图片搜索...');
      const imageResult = await serper.searchImages('自然风景', { num: 2 });
      console.log('图片搜索结果:', imageResult.success ? `找到${imageResult.data.images?.length || 0}张图片` : imageResult.error);
      
      // 5. 新闻搜索
      console.log('\n5. 新闻搜索...');
      const newsResult = await serper.searchNews('科技新闻', { num: 2 });
      console.log('新闻搜索结果:', newsResult.success ? `找到${newsResult.data.news?.length || 0}条新闻` : newsResult.error);
      
    } catch (error) {
      console.error('Serper示例执行失败:', error.message);
    }
  }
  
  static async demoSearchService() {
    console.log('\n=== 搜索服务使用示例 ===');
    
    const searchService = new SearchService();
    
    try {
      // 1. 检查服务状态
      console.log('\n1. 检查服务状态...');
      const status = await searchService.checkServiceStatus();
      console.log('服务状态:', status);
      
      // 2. 搜索并发送到飞书（卡片格式）
      console.log('\n2. 搜索并发送到飞书（卡片格式）...');
      const notifyResult = await searchService.searchAndNotify('Python编程', { 
        maxResults: 3, 
        format: 'card' 
      });
      console.log('通知结果:', notifyResult.success ? '成功' : notifyResult.error);
      
      // 3. 图片搜索并发送
      console.log('\n3. 图片搜索并发送...');
      const imageNotifyResult = await searchService.searchImagesAndNotify('城市夜景', { 
        maxResults: 4 
      });
      console.log('图片通知结果:', imageNotifyResult.success ? '成功' : imageNotifyResult.error);
      
      // 4. 新闻搜索并发送
      console.log('\n4. 新闻搜索并发送...');
      const newsNotifyResult = await searchService.searchNewsAndNotify('人工智能', { 
        maxResults: 3 
      });
      console.log('新闻通知结果:', newsNotifyResult.success ? '成功' : newsNotifyResult.error);
      
    } catch (error) {
      console.error('搜索服务示例执行失败:', error.message);
    }
  }
  
  static async demoFeishuUsage() {
    console.log('\n=== 飞书使用示例 ===');
    
    const feishu = new FeishuApiClient();
    const bot = new FeishuBotClient();
    
    try {
      // 1. 发送机器人文本消息
      console.log('\n1. 发送机器人文本消息...');
      const textResult = await bot.sendText('这是一条飞书机器人测试消息');
      console.log('文本消息发送结果:', textResult.success ? '成功' : textResult.error);
      
      // 2. 发送告警消息
      console.log('\n2. 发送告警消息...');
      const alertResult = await bot.sendAlert('系统', '服务器负载过高', 'CPU使用率超过80%', 'warning');
      console.log('告警消息发送结果:', alertResult.success ? '成功' : alertResult.error);
      
      // 3. 发送任务通知
      console.log('\n3. 发送任务通知...');
      const taskResult = await bot.sendTaskNotification('完成项目文档', '张三', '2024-12-31', 'high');
      console.log('任务通知发送结果:', taskResult.success ? '成功' : taskResult.error);
      
      // 4. 获取部门列表
      console.log('\n4. 获取部门列表...');
      const deptResult = await feishu.getDepartmentList();
      console.log('部门列表获取结果:', deptResult.success ? '成功' : deptResult.error);
      
    } catch (error) {
      console.error('飞书示例执行失败:', error.message);
    }
  }
  
  static async runAllExamples() {
    console.log('开始执行飞书+Serper集成示例...\n');
    
    await this.demoSerperUsage();
    await this.demoSearchService();
    await this.demoFeishuUsage();
    
    console.log('\n=== 示例执行完成 ===');
    console.log('请检查飞书是否收到搜索结果的推送消息');
  }
}

// 如果直接运行此文件，执行示例
if (import.meta.url === `file://${process.argv[1]}`) {
  IntegrationExamples.runAllExamples().catch(console.error);
}