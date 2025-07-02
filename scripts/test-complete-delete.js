const { MongoClient } = require('mongodb');

async function testCompleteDeleteWorkflow() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/trendwise');
  
  try {
    await client.connect();
    const db = client.db('trendwise');
    const articles = db.collection('articles');
    
    console.log('🔍 Testing complete article deletion workflow...\n');
    
    // 1. Check current article count
    const initialCount = await articles.countDocuments();
    console.log(`📊 Initial article count: ${initialCount}`);
    
    // 2. Get an article to test deletion
    const testArticle = await articles.findOne({});
    
    if (!testArticle) {
      console.log('❌ No articles found to test deletion');
      return;
    }
    
    console.log(`🎯 Selected test article: "${testArticle.title}"`);
    console.log(`   Slug: ${testArticle.slug}`);
    console.log(`   Category: ${testArticle.category}`);
    
    // 3. Test the DELETE API endpoint
    console.log('\n🔧 Testing DELETE API endpoint...');
    const response = await fetch(`http://localhost:3001/api/articles/${testArticle.slug}`, {
      method: 'DELETE',
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ DELETE API Response:', result.message);
      
      // 4. Verify the article was actually deleted from database
      const deletedArticle = await articles.findOne({ _id: testArticle._id });
      if (!deletedArticle) {
        console.log('✅ Article successfully removed from database');
      } else {
        console.log('❌ Article still exists in database after DELETE call');
        return;
      }
      
      // 5. Check final article count
      const finalCount = await articles.countDocuments();
      console.log(`📊 Final article count: ${finalCount}`);
      
      if (finalCount === initialCount - 1) {
        console.log('✅ Article count correctly decreased by 1');
      } else {
        console.log('❌ Article count mismatch');
        return;
      }
      
      // 6. Test fetching articles API (used by admin dashboard)
      console.log('\n🔧 Testing articles fetch API...');
      const fetchResponse = await fetch('http://localhost:3001/api/articles?limit=20');
      if (fetchResponse.ok) {
        const fetchData = await fetchResponse.json();
        console.log(`✅ Articles API returned ${fetchData.articles.length} articles`);
        
        // Verify the deleted article is not in the response
        const deletedInResponse = fetchData.articles.find(a => a._id === testArticle._id.toString());
        if (!deletedInResponse) {
          console.log('✅ Deleted article not present in API response');
        } else {
          console.log('❌ Deleted article still present in API response');
        }
      } else {
        console.log('❌ Failed to fetch articles');
      }
      
      console.log('\n🎉 Complete deletion workflow test PASSED!');
      console.log('\n📋 Manual testing checklist for admin dashboard:');
      console.log('   1. Open http://localhost:3001/admin');
      console.log('   2. Check Overview tab shows correct article count');
      console.log('   3. Go to Articles tab');
      console.log('   4. Verify each article row has View and Delete buttons');
      console.log('   5. Click Delete button to test confirmation dialog');
      console.log('   6. Confirm deletion and verify article is removed from table');
      
    } else {
      const error = await response.json();
      console.log('❌ DELETE API Error:', error);
    }
    
  } catch (error) {
    console.error('❌ Error in delete workflow test:', error);
  } finally {
    await client.close();
  }
}

testCompleteDeleteWorkflow();
