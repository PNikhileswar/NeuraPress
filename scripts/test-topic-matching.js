const { MongoClient } = require('mongodb');

async function testTopicMatchingLogic() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/trendwise');
  
  try {
    await client.connect();
    const db = client.db('trendwise');
    const articles = db.collection('articles');
    
    console.log('🔍 Testing topic matching logic...\n');
    
    // Get all existing articles
    const existingArticles = await articles.find({}, { title: 1, tags: 1, publishedAt: 1 }).toArray();
    console.log('📚 Existing articles:');
    existingArticles.forEach((article, index) => {
      console.log(`   ${index + 1}. "${article.title}"`);
    });
    
    console.log('\n🧪 Testing topic matching against existing articles:\n');
    
    // Test topics that should NOT match (different topics)
    const testTopics = [
      'E-commerce Growth Strategies for Small Businesses',
      'Supply Chain Optimization in Digital Age', 
      'Mental Health in the Workplace: Building Support Systems',
      'Blockchain Technology for Beginners',
      'Remote Work Best Practices'
    ];
    
    // Test topics that SHOULD match (similar to existing)
    const shouldMatchTopics = [
      'Personalized Medicine: The Future of Healthcare', // Should match exactly
      'AI Breakthrough 2025: Latest Developments', // Should match exactly
      'Quantum Computing: Real-World Applications' // Should match exactly
    ];
    
    const maxAgeDate = new Date();
    maxAgeDate.setDate(maxAgeDate.getDate() - 1); // 1 day
    
    console.log('Topics that should NOT match (different topics):');
    for (const topic of testTopics) {
      const topicWords = topic.toLowerCase()
        .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
        .split(/\s+/) // Split by whitespace
        .filter(word => word.length > 3); // Filter out short words
      const significantWords = topicWords.slice(0, 2);
      
      let recentArticle = null;
      if (significantWords.length >= 2) {
        const titleRegex = new RegExp(significantWords.join('.*'), 'i');
        recentArticle = await articles.findOne({
          $and: [
            {
              $or: [
                { title: { $regex: titleRegex } },
                { tags: { $in: [topic.toLowerCase()] } }
              ]
            },
            { publishedAt: { $gte: maxAgeDate } }
          ]
        });
      }
      
      console.log(`   ${topic}: ${recentArticle ? '❌ INCORRECTLY MATCHED' : '✅ Correctly did not match'}`);
      if (recentArticle) {
        console.log(`      Matched with: "${recentArticle.title}"`);
      }
    }
    
    console.log('\nTopics that SHOULD match (similar to existing):');
    for (const topic of shouldMatchTopics) {
      const topicWords = topic.toLowerCase()
        .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
        .split(/\s+/) // Split by whitespace
        .filter(word => word.length > 3); // Filter out short words
      const significantWords = topicWords.slice(0, 2);
      
      let recentArticle = null;
      if (significantWords.length >= 2) {
        const titleRegex = new RegExp(significantWords.join('.*'), 'i');
        recentArticle = await articles.findOne({
          $and: [
            {
              $or: [
                { title: { $regex: titleRegex } },
                { tags: { $in: [topic.toLowerCase()] } }
              ]
            },
            { publishedAt: { $gte: maxAgeDate } }
          ]
        });
      }
      
      console.log(`   ${topic}: ${recentArticle ? '✅ Correctly matched' : '❌ SHOULD HAVE MATCHED'}`);
      if (recentArticle) {
        console.log(`      Matched with: "${recentArticle.title}"`);
      }
    }
    
  } catch (error) {
    console.error('Error testing topic matching:', error);
  } finally {
    await client.close();
  }
}

testTopicMatchingLogic();
