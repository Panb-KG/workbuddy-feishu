import axios from 'axios';
import 'dotenv/config';

console.log('🔍 Serper API密钥诊断工具\n');

// 测试不同的API端点
async function testSerperEndpoints() {
  const apiKey = process.env.SERPER_API_KEY;
  console.log('📋 当前配置的API密钥:');
  console.log('   - 密钥长度:', apiKey.length, '字符');
  console.log('   - 密钥格式:', /^[a-f0-9]+$/.test(apiKey) ? '十六进制格式' : '其他格式');
  console.log('   - 密钥前缀:', apiKey.substring(0, 8));
  
  console.log('\n🔧 测试不同API端点...');
  
  // 测试1: 基础搜索端点
  console.log('\n1. 测试基础搜索端点...');
  try {
    const response = await axios.post(
      'https://google.serper.dev/search',
      {
        q: 'test',
        num: 1
      },
      {
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    console.log('✅ 基础搜索端点正常');
    console.log('   - 状态码:', response.status);
    console.log('   - 数据:', response.data);
  } catch (error) {
    console.log('❌ 基础搜索端点失败:');
    console.log('   - 错误:', error.response?.data || error.message);
    console.log('   - 状态码:', error.response?.status);
  }
  
  // 测试2: 图片搜索端点
  console.log('\n2. 测试图片搜索端点...');
  try {
    const response = await axios.post(
      'https://google.serper.dev/images',
      {
        q: 'test',
        num: 1
      },
      {
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    console.log('✅ 图片搜索端点正常');
    console.log('   - 状态码:', response.status);
  } catch (error) {
    console.log('❌ 图片搜索端点失败:');
    console.log('   - 错误:', error.response?.data || error.message);
    console.log('   - 状态码:', error.response?.status);
  }
  
  // 测试3: 检查API密钥状态
  console.log('\n3. 测试API密钥状态...');
  try {
    // 尝试使用错误的密钥进行对比
    const wrongKeyResponse = await axios.post(
      'https://google.serper.dev/search',
      {
        q: 'test',
        num: 1
      },
      {
        headers: {
          'X-API-KEY': 'wrong_key_here',
          'Content-Type': 'application/json'
        },
        timeout: 5000
      }
    ).catch(err => ({ isError: true, error: err }));
    
    if (wrongKeyResponse.isError) {
      console.log('✅ 错误密钥测试 - 正确返回错误');
    } else {
      console.log('⚠️  错误密钥测试 - 意外成功，可能密钥验证有问题');
    }
  } catch (error) {
    console.log('❌ API密钥状态测试失败:', error.message);
  }
  
  // 测试4: 检查网络连接
  console.log('\n4. 测试网络连接...');
  try {
    const pingResponse = await axios.get('https://google.serper.dev', { timeout: 5000 });
    console.log('✅ 网络连接正常');
    console.log('   - 状态码:', pingResponse.status);
  } catch (error) {
    console.log('❌ 网络连接失败:');
    console.log('   - 错误:', error.message);
    console.log('   - 可能原因: 网络问题、代理设置或DNS问题');
  }
}

// 测试可能的密钥格式问题
async function testKeyFormats() {
  console.log('\n🔑 测试密钥格式问题...');
  
  const apiKey = process.env.SERPER_API_KEY;
  
  // 检查密钥格式
  const keyChecks = [
    { name: '密钥长度', valid: apiKey.length >= 32 && apiKey.length <= 128, reason: '密钥长度应在32-128字符之间' },
    { name: '十六进制格式', valid: /^[a-f0-9]+$/.test(apiKey), reason: '密钥应为十六进制格式（只包含a-f和0-9）' },
    { name: '无空格', valid: !apiKey.includes(' '), reason: '密钥不应包含空格' },
    { name: '无特殊字符', valid: !/[^a-f0-9]/.test(apiKey), reason: '密钥不应包含特殊字符' }
  ];
  
  keyChecks.forEach(check => {
    console.log(`   - ${check.name}: ${check.valid ? '✅' : '❌'} ${check.reason}`);
  });
}

// 提供修复建议
function provideSolutions() {
  console.log('\n💡 可能的解决方案:');
  
  console.log('\n1. 🔑 密钥问题:');
  console.log('   - 访问 https://serper.dev 登录账户');
  console.log('   - 检查API密钥是否正确复制');
  console.log('   - 重新生成新的API密钥');
  console.log('   - 检查使用量是否超过免费额度（每月2,500次）');
  
  console.log('\n2. 🌐 网络问题:');
  console.log('   - 检查网络连接是否正常');
  console.log('   - 尝试使用VPN或更换网络环境');
  console.log('   - 检查防火墙或代理设置');
  
  console.log('\n3. 🛠️ 技术问题:');
  console.log('   - 联系Serper技术支持');
  console.log('   - 检查服务器时间是否同步');
  console.log('   - 尝试使用其他API端点');
}

// 执行诊断
async function runDiagnostics() {
  await testSerperEndpoints();
  await testKeyFormats();
  provideSolutions();
  
  console.log('\n🎯 诊断完成！请根据上述建议进行修复。');
}

runDiagnostics().catch(console.error);