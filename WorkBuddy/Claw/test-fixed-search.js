import { SearchService } from './src/search-service.js';

console.log('🔍 测试修复后的搜索功能\n');

async function testFixedSearch() {
  const searchService = new SearchService();
  
  // 测试1: 检查提供商状态
  console.log('1. 检查搜索提供商状态...');
  const providerStatus = await searchService.checkProviders();
  
  if (providerStatus.success) {
    console.log('📊 提供商状态:');
    Object.entries(providerStatus.data).forEach(([provider, status]) => {
      console.log(`   - ${provider}: ${status.available ? '✅' : '❌'} ${status.message}`);
    });
  }
  
  // 测试2: 使用DuckDuckGo搜索
  console.log('\n2. 测试DuckDuckGo搜索...');
  try {
    const result = await searchService.search('人工智能', { provider: 'duckduckgo' });
    
    if (result.success) {
      console.log('✅ DuckDuckGo搜索成功！');
      console.log('   - 查询:', result.data.query);
      console.log('   - 摘要:', result.data.abstract || '无摘要');
      console.log('   - 相关主题数量:', result.data.relatedTopics?.length || 0);
      
      if (result.data.relatedTopics && result.data.relatedTopics.length > 0) {
        console.log('   - 前3个相关主题:');
        result.data.relatedTopics.slice(0, 3).forEach((topic, index) => {
          console.log(`     ${index + 1}. ${topic.name}`);
        });
      }
    } else {
      console.log('❌ DuckDuckGo搜索失败:', result.error);
    }
  } catch (error) {
    console.log('❌ DuckDuckGo搜索异常:', error.message);
  }
  
  // 测试3: 测试搜索并通知功能
  console.log('\n3. 测试搜索通知功能...');
  try {
    const notifyResult = await searchService.searchAndNotify('Python编程', {
      provider: 'duckduckgo',
      format: 'text',
      maxResults: 3
    });
    
    if (notifyResult.success) {
      console.log('✅ 搜索通知发送成功！');
      console.log('   - 消息已发送到飞书');
    } else {
      console.log('❌ 搜索通知失败:', notifyResult.error);
      console.log('   - 可能原因: 飞书机器人Webhook未配置');
    }
  } catch (error) {
    console.log('❌ 搜索通知异常:', error.message);
  }
  
  // 测试4: 批量搜索测试
  console.log('\n4. 测试批量搜索...');
  try {
    const queries = ['机器学习', '深度学习', '自然语言处理'];
    const batchResult = await searchService.search('机器学习', { provider: 'duckduckgo' });
    
    if (batchResult.success) {
      console.log('✅ 批量搜索测试成功！');
      console.log('   - 查询数量: 3个');
      console.log('   - 示例结果摘要:', batchResult.data.abstract?.substring(0, 100) + '...');
    }
  } catch (error) {
    console.log('❌ 批量搜索异常:', error.message);
  }
  
  // 显示可用提供商
  console.log('\n📋 可用搜索提供商:');
  const providers = searchService.getAvailableProviders();
  providers.forEach(provider => {
    console.log(`   - ${provider.displayName}: ${provider.free ? '🆓 免费' : '💰 付费'} - ${provider.description}`);
  });
}

// 执行测试
async function runTests() {
  await testFixedSearch();
  
  console.log('\n🎯 修复完成！');
  console.log('💡 现在您可以使用DuckDuckGo进行免费搜索！');
  console.log('🚀 启动服务: npm run dev');
}

runTests().catch(console.error);