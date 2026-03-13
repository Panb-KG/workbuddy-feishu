import axios from 'axios';
import 'dotenv/config';

console.log('🔍 开始简单连接测试...\n');

// 测试Serper API连接
async function testSerper() {
  console.log('1. 测试Serper API连接...');
  
  try {
    const response = await axios.post(
      'https://google.serper.dev/search',
      {
        q: '人工智能',
        num: 1
      },
      {
        headers: {
          'X-API-KEY': process.env.SERPER_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Serper API连接成功！');
    console.log('   - 状态码:', response.status);
    console.log('   - 搜索结果数量:', response.data.organic?.length || 0);
    
  } catch (error) {
    console.log('❌ Serper API连接失败:');
    console.log('   - 错误信息:', error.response?.data?.message || error.message);
    console.log('   - 状态码:', error.response?.status);
  }
}

// 测试飞书应用API连接
async function testFeishuApp() {
  console.log('\n2. 测试飞书应用API连接...');
  
  try {
    const response = await axios.post(
      'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal',
      {
        app_id: process.env.FEISHU_APP_ID,
        app_secret: process.env.FEISHU_APP_SECRET
      }
    );
    
    if (response.data.code === 0) {
      console.log('✅ 飞书应用API连接成功！');
      console.log('   - 令牌有效期:', response.data.expire, '秒');
      console.log('   - 应用ID:', process.env.FEISHU_APP_ID);
    } else {
      console.log('❌ 飞书应用API认证失败:');
      console.log('   - 错误码:', response.data.code);
      console.log('   - 错误信息:', response.data.msg);
    }
    
  } catch (error) {
    console.log('❌ 飞书应用API连接失败:');
    console.log('   - 错误信息:', error.response?.data?.message || error.message);
    console.log('   - 状态码:', error.response?.status);
  }
}

// 测试飞书机器人连接
async function testFeishuBot() {
  console.log('\n3. 测试飞书机器人连接...');
  
  const webhook = process.env.FEISHU_BOT_WEBHOOK;
  
  if (!webhook || webhook.includes('your_webhook_key')) {
    console.log('⚠️  飞书机器人Webhook未配置');
    console.log('   - 请在群聊中添加机器人并获取Webhook地址');
    return;
  }
  
  try {
    const response = await axios.post(
      webhook,
      {
        msg_type: 'text',
        content: {
          text: '🔧 连接测试消息\n机器人连接测试成功！'
        }
      }
    );
    
    if (response.data.StatusCode === 0) {
      console.log('✅ 飞书机器人连接成功！');
      console.log('   - 消息已发送到群聊');
    } else {
      console.log('❌ 飞书机器人发送失败:');
      console.log('   - 错误码:', response.data.StatusCode);
      console.log('   - 错误信息:', response.data.StatusMessage);
    }
    
  } catch (error) {
    console.log('❌ 飞书机器人连接失败:');
    console.log('   - 错误信息:', error.response?.data?.message || error.message);
    console.log('   - 状态码:', error.response?.status);
  }
}

// 显示当前配置
console.log('📋 当前配置信息:');
console.log('   - Serper API密钥:', process.env.SERPER_API_KEY ? '已配置' : '未配置');
console.log('   - 飞书应用ID:', process.env.FEISHU_APP_ID ? '已配置' : '未配置');
console.log('   - 飞书应用密钥:', process.env.FEISHU_APP_SECRET ? '已配置' : '未配置');
console.log('   - 飞书机器人Webhook:', process.env.FEISHU_BOT_WEBHOOK ? '已配置' : '未配置');

// 执行测试
async function runTests() {
  await testSerper();
  await testFeishuApp();
  await testFeishuBot();
  
  console.log('\n🎯 测试完成！');
}

runTests().catch(console.error);