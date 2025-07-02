const { MongoClient } = require('mongodb');

async function testDeleteApi() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/trendwise');
  
  try {
    await client.connect();
    const db = client.db('trendwise');
    const articles = db.collection('articles');
    
    // Get an article to test deletion (we'll use the first one)
    const testArticle = await articles.findOne({});
    
    if (!testArticle) {
      console.log('No articles found to test deletion');
      return;
    }
    
    console.log('Found test article:', {
      title: testArticle.title,
      slug: testArticle.slug,
      _id: testArticle._id
    });
    
    // Test the DELETE API endpoint
    const response = await fetch(`http://localhost:3001/api/articles/${testArticle.slug}`, {
      method: 'DELETE',
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ DELETE API Success:', result);
      
      // Verify the article was actually deleted
      const deletedArticle = await articles.findOne({ _id: testArticle._id });
      if (!deletedArticle) {
        console.log('✅ Article successfully deleted from database');
      } else {
        console.log('❌ Article still exists in database after DELETE call');
      }
    } else {
      const error = await response.json();
      console.log('❌ DELETE API Error:', error);
    }
    
  } catch (error) {
    console.error('Error testing DELETE API:', error);
  } finally {
    await client.close();
  }
}

testDeleteApi();
