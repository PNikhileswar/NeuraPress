const { MongoClient } = require('mongodb');

async function debugRegexMatching() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/trendwise');
  
  try {
    await client.connect();
    const db = client.db('trendwise');
    const articles = db.collection('articles');
    
    console.log('🔍 Debugging regex matching logic...\n');
    
    const testTopic = 'Personalized Medicine: The Future of Healthcare';
    const existingTitle = 'Personalized Medicine: The Future of Healthcare: A Comprehensive Guide';
    
    console.log(`Test topic: "${testTopic}"`);
    console.log(`Existing title: "${existingTitle}"`);
    
    // Test our current logic
    const topicWords = testTopic.toLowerCase().split(' ').filter(word => word.length > 3);
    console.log(`Topic words (>3 chars): [${topicWords.join(', ')}]`);
    
    const significantWords = topicWords.slice(0, 2);
    console.log(`Significant words: [${significantWords.join(', ')}]`);
    
    const regexPattern = significantWords.map(word => `(?=.*\\b${word}\\b)`).join('');
    console.log(`Regex pattern: ${regexPattern}`);
    
    const titleRegex = new RegExp(regexPattern, 'i');
    console.log(`Does "${existingTitle}" match regex? ${titleRegex.test(existingTitle)}`);
    
    // Test with MongoDB query
    const result = await articles.findOne({
      title: { $regex: titleRegex }
    });
    
    console.log(`MongoDB query result: ${result ? 'FOUND' : 'NOT FOUND'}`);
    if (result) {
      console.log(`   Found: "${result.title}"`);
    }
    
    // Test a simpler approach - just check if key words appear in title
    console.log('\n🔄 Testing simpler approach...');
    const keyWords = ['personalized', 'medicine'];
    const simpleRegex = new RegExp(keyWords.join('.*'), 'i');
    console.log(`Simple regex: ${simpleRegex}`);
    console.log(`Does "${existingTitle}" match simple regex? ${simpleRegex.test(existingTitle)}`);
    
  } catch (error) {
    console.error('Error debugging regex:', error);
  } finally {
    await client.close();
  }
}

debugRegexMatching();
