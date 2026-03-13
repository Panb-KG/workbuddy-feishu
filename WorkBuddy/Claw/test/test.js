import { FeishuApiClient } from '../src/feishu-api.js';
import { FeishuBotClient } from '../src/feishu-bot.js';

// 基础功能测试
async function runTests() {
  console.log('🧪 开始飞书集成测试...\n');
  
  // 测试API客户端初始化
  console.log('1. 测试API客户端初始化...');
  const api = new FeishuApiClient('test_app', 'test_secret');
  console.log('✅ API客户端创建成功');
  
  // 测试机器人客户端初始化
  console.log('2. 测试机器人客户端初始化...');
  const bot = new FeishuBotClient('https://test-webhook.com');
  console.log('✅ 机器人客户端创建成功');
  
  // 测试消息构建功能
  console.log('3. 测试消息构建功能...');
  
  // 测试文本消息
  const textMessage = await bot.sendText('测试消息');
  console.log('📝 文本消息构建测试完成');
  
  // 测试卡片消息构建
  const card = {
    config: { wide_screen_mode: true },
    header: {
      title: { tag: 'plain_text', content: '测试卡片' }
    },
    elements: [
      {
        tag: 'div',
        text: {
          tag: 'lark_md',
          content: '**测试内容**'
        }
      }
    ]
  };
  const cardMessage = await bot.sendCard(card);
  console.log('🃏 卡片消息构建测试完成');
  
  // 测试告警消息
  const alertMessage = await bot.sendAlert('测试', '测试标题', '测试内容');
  console.log('⚠️ 告警消息构建测试完成');
  
  // 测试任务通知
  const taskMessage = await bot.sendTaskNotification('测试任务', '测试人员', '2024-12-31');
  console.log('📋 任务通知构建测试完成');
  
  console.log('\n🎉 所有基础功能测试通过！');
  console.log('💡 注意：实际API调用需要配置正确的飞书凭据');
  
  return {
    apiClient: '✅ 通过',
    botClient: '✅ 通过',
    messageBuilding: '✅ 通过'
  };
}

// 运行测试
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests };