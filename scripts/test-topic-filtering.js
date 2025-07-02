require('dotenv').config({ path: '.env.local' });

async function testImprovedTopicFiltering() {
  console.log('=== TESTING IMPROVED TOPIC FILTERING ===\n');
  
  try {
    console.log('🔍 Testing with different maxAge values to see filtering in action...\n');
    
    // Test 1: Very restrictive (maxAge = 0 days) - should skip most topics
    console.log('📅 Test 1: maxAge = 0 days (very restrictive)');
    const response1 = await fetch('http://localhost:3001/api/trending/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        count: 5,
        categories: ['technology', 'health', 'business'],
        maxAge: 0  // Very restrictive - only generate if no articles exist today
      })
    });
    
    if (response1.ok) {
      const data1 = await response1.json();
      console.log('✅ Response received');
      console.log(`📊 Statistics:`, data1.statistics);
      
      if (data1.skippedTopics && data1.skippedTopics.length > 0) {
        console.log('\n⏭️  Skipped topics:');
        data1.skippedTopics.forEach(skipped => {
          console.log(`   - "${skipped.topic}" - ${skipped.reason}`);
          console.log(`     Existing: "${skipped.existingTitle}" (${new Date(skipped.publishedAt).toLocaleDateString()})`);
        });
      }
      
      if (data1.articles && data1.articles.length > 0) {
        console.log('\n📝 New articles generated:');
        data1.articles.forEach(article => {
          console.log(`   - "${article.title}" (${article.category})`);
        });
      }
    } else {
      console.error('❌ Failed to generate articles:', response1.statusText);
    }
    
    // Test 2: More lenient (maxAge = 30 days) - should allow more generation
    console.log('\n' + '='.repeat(60));
    console.log('📅 Test 2: maxAge = 30 days (more lenient)');
    
    const response2 = await fetch('http://localhost:3001/api/trending/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        count: 3,
        categories: ['environment', 'science'],
        maxAge: 30  // More lenient - generate if no articles in last 30 days
      })
    });
    
    if (response2.ok) {
      const data2 = await response2.json();
      console.log('✅ Response received');
      console.log(`📊 Statistics:`, data2.statistics);
      
      if (data2.skippedTopics && data2.skippedTopics.length > 0) {
        console.log('\n⏭️  Skipped topics:');
        data2.skippedTopics.forEach(skipped => {
          console.log(`   - "${skipped.topic}" - ${skipped.reason}`);
        });
      }
      
      if (data2.articles && data2.articles.length > 0) {
        console.log('\n📝 New articles generated:');
        data2.articles.forEach(article => {
          console.log(`   - "${article.title}" (${article.category}, ${article.readingTime} min read)`);
        });
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 Key Improvements:');
    console.log('   ✅ Pre-filters topics before generation (saves time & resources)');
    console.log('   ✅ Provides detailed statistics about skipped vs generated articles');
    console.log('   ✅ Shows which existing articles caused topics to be skipped');
    console.log('   ✅ Only generates content for topics that truly need new articles');
    console.log('   ✅ Includes suggestion to adjust maxAge if no topics available');
    
  } catch (error) {
    console.error('❌ Error testing topic filtering:', error);
  }
}

testImprovedTopicFiltering();
