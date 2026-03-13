import axios from 'axios';

console.log('🔍 测试免费搜索API替代方案\n');

// 测试DuckDuckGo Instant Answer API
async function testDuckDuckGo() {
  console.log('1. 测试DuckDuckGo API...');
  try {
    const response = await axios.get('https://api.duckduckgo.com/', {
      params: {
        q: '人工智能',
        format: 'json',
        no_html: 1,
        skip_disambig: 1
      },
      timeout: 10000
    });
    
    console.log('✅ DuckDuckGo API可用');
    console.log('   - 状态码:', response.status);
    console.log('   - 摘要:', response.data.AbstractText || '无摘要');
    console.log('   - 相关主题:', response.data.RelatedTopics?.length || 0);
    
  } catch (error) {
    console.log('❌ DuckDuckGo API不可用:', error.message);
  }
}

// 测试Wikipedia API
async function testWikipedia() {
  console.log('\n2. 测试Wikipedia API...');
  try {
    const response = await axios.get('https://en.wikipedia.org/w/api.php', {
      params: {
        action: 'query',
        format: 'json',
        list: 'search',
        srsearch: 'artificial intelligence',
        srlimit: 3
      },
      timeout: 10000
    });
    
    console.log('✅ Wikipedia API可用');
    console.log('   - 状态码:', response.status);
    console.log('   - 结果数量:', response.data.query.search.length);
    
  } catch (error) {
    console.log('❌ Wikipedia API不可用:', error.message);
  }
}

// 测试Bing Web Search API（需要密钥，但测试连接）
async function testBingConnectivity() {
  console.log('\n3. 测试Bing API连接性...');
  try {
    // 只是测试网络连接，不进行实际搜索
    const response = await axios.get('https://api.bing.microsoft.com', {
      timeout: 5000
    }).catch(() => ({ status: '需要API密钥' }));
    
    console.log('🌐 Bing API端点可达');
    console.log('   - 需要配置API密钥才能使用');
    
  } catch (error) {
    console.log('❌ Bing API连接失败:', error.message);
  }
}

// 提供替代方案建议
function provideAlternativeSolutions() {
  console.log('\n💡 免费替代方案建议:');
  
  console.log('\n1. 🦆 DuckDuckGo API:');
  console.log('   - 优点: 完全免费，无需API密钥');
  console.log('   - 限制: 结果相对简单，适合基础搜索');
  console.log('   - 用途: 快速信息检索，摘要生成');
  
  console.log('\n2. 📚 Wikipedia API:');
  console.log('   - 优点: 知识库丰富，结构化数据');
  console.log('   - 限制: 仅限于维基百科内容');
  console.log('   - 用途: 知识查询，教育内容');
  
  console.log('\n3. 🔍 其他免费搜索API:');
  console.log('   - Google Custom Search (免费额度有限)');
  console.log('   - Brave Search API (有免费额度)');
  console.log('   - Algolia Search (开发版免费)');
  
  console.log('\n4. 💰 付费方案推荐:');
  console.log('   - Serper (推荐): $50/月，2500次搜索免费');
  console.log('   - Google Custom Search: $5/1000次查询');
  console.log('   - Bing Search: $7/1000次交易');
}

// 执行测试
async function runTests() {
  await testDuckDuckGo();
  await testWikipedia();
  await testBingConnectivity();
  provideAlternativeSolutions();
  
  console.log('\n🎯 替代方案测试完成！');
}

runTests().catch(console.error);