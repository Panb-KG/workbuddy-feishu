import { SerperApiClient } from './src/serper-api.js';
import { FeishuApiClient } from './src/feishu-api.js';
import { FeishuBotClient } from './src/feishu-bot.js';

console.log('🔍 开始测试连接...\n');

// 测试Serper API连接
async function testSerper() {
  console.log('1. 测试Serper API连接...');
  const serper = new SerperApiClient();
  
  try {
    const result = await serper.checkApiKey();
    if (result.valid) {
      console.log('✅ Serper API连接成功！');
      console.log('   - API密钥有效');
      
      // 测试实际搜索
      const searchResult = await serper.search('人工智能', { num: 2 });
      if (searchResult.success) {
        console.log('   - 搜索功能正常');
        console.log('   - 搜索结果数量:', searchResult.data.organic?.length || 0);
      } else {
        console.log('⚠️  搜索功能异常:', searchResult.error);
      }
    } else {
      console.log('❌ Serper API连接失败:', result.message);
    }
  } catch (error) {
    console.log('❌ Serper API测试异常:', error.message);
  }
}

// 测试飞书应用API连接
async function testFeishuApp() {
  console.log('\n2. 测试飞书应用API连接...');
  const feishu = new FeishuApiClient();
  
  try {
    // 测试获取访问令牌
    const tokenResult = await feishu.getAccessToken();
    if (tokenResult.success) {
      console.log('✅ 飞书应用API连接成功！');
      console.log('   - 访问令牌获取成功');
      console.log('   - 令牌有效期:', tokenResult.data.expire, '秒');
      
      // 测试获取用户信息（需要有效令牌）
      const userResult = await feishu.getUserInfo('open_id');
      if (userResult.success) {
        console.log('   - 用户API调用正常');
      } else {
        console.log('⚠️  用户API调用异常（可能需要有效open_id）');
      }
    } else {
      console.log('❌ 飞书应用API连接失败:', tokenResult.error);
    }
  } catch (error) {
    console.log('❌ 飞书应用API测试异常:', error.message);
  }
}

// 测试飞书机器人连接
async function testFeishuBot() {
  console.log('\n3. 测试飞书机器人连接...');
  const bot = new FeishuBotClient();
  
  try {
    // 测试发送文本消息
    const testMessage = {
      msg_type: 'text',
      content: {
        text: '🔧 连接测试消息\n这是来自集成平台的测试消息，连接正常！'
      }
    };
    
    const result = await bot.sendMessage(testMessage);
    if (result.success) {
      console.log('✅ 飞书机器人连接成功！');
      console.log('   - 消息发送成功');
    } else {
      console.log('❌ 飞书机器人连接失败:', result.error);
      console.log('   - 请检查Webhook地址是否正确');
    }
  } catch (error) {
    console.log('❌ 飞书机器人测试异常:', error.message);
  }
}

// 执行所有测试
async function runAllTests() {
  await testSerper();
  await testFeishuApp();
  await testFeishuBot();
  
  console.log('\n🎯 测试完成！');
  console.log('💡 如果所有测试都通过，说明连接配置正确！');
}

runAllTests().catch(console.error);