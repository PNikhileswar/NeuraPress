require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Connect to MongoDB
async function connectDB() {
  if (mongoose.connections[0].readyState) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Article schema
const articleSchema = new mongoose.Schema({
  title: String,
  slug: String,
  content: String,
  category: String,
  tags: [String],
  publishedAt: { type: Date, default: Date.now },
  readingTime: Number
});

const Article = mongoose.models.Article || mongoose.model('Article', articleSchema);

async function demonstrateTopicFiltering() {
  try {
    await connectDB();
    
    console.log('=== CURRENT DATABASE STATE ===\n');
    
    // Get articles by category and recent dates
    const categories = ['technology', 'health', 'business', 'environment', 'science', 'lifestyle'];
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    for (const category of categories) {
      const totalArticles = await Article.countDocuments({ category });
      const recent24h = await Article.countDocuments({ 
        category, 
        publishedAt: { $gte: last24h } 
      });
      const recent7days = await Article.countDocuments({ 
        category, 
        publishedAt: { $gte: last7days } 
      });
      
      console.log(`📂 ${category.toUpperCase()}:`);
      console.log(`   Total: ${totalArticles} articles`);
      console.log(`   Last 24h: ${recent24h} articles`);
      console.log(`   Last 7 days: ${recent7days} articles`);
      
      if (recent24h > 0) {
        const recentArticles = await Article.find({ 
          category, 
          publishedAt: { $gte: last24h } 
        }).select('title publishedAt').sort({ publishedAt: -1 });
        
        console.log('   Recent articles:');
        recentArticles.forEach(article => {
          console.log(`     - "${article.title}" (${article.publishedAt.toLocaleString()})`);
        });
      }
      console.log('');
    }
    
    console.log('=== TESTING TOPIC FILTERING SCENARIOS ===\n');
    
    // Scenario 1: Very restrictive filtering (maxAge = 0)
    console.log('🔍 Scenario 1: maxAge = 0 days (only generate if no articles today)');
    const response1 = await fetch('http://localhost:3001/api/trending/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        count: 3,
        categories: ['technology'],
        maxAge: 0
      })
    });
    
    if (response1.ok) {
      const data1 = await response1.json();
      console.log(`📊 Result: ${data1.statistics?.generated || 0} generated, ${data1.statistics?.skipped || 0} skipped`);
      
      if (data1.skippedTopics?.length > 0) {
        console.log('⏭️  Topics skipped due to recent articles:');
        data1.skippedTopics.forEach(topic => {
          console.log(`   - "${topic.topic}"`);
          console.log(`     Reason: ${topic.reason}`);
          console.log(`     Existing: "${topic.existingTitle}"`);
        });
      }
    }
    
    console.log('\n' + '-'.repeat(50) + '\n');
    
    // Scenario 2: More lenient filtering (maxAge = 7)
    console.log('🔍 Scenario 2: maxAge = 7 days (generate if no articles in last week)');
    const response2 = await fetch('http://localhost:3001/api/trending/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        count: 2,
        categories: ['environment'],
        maxAge: 7
      })
    });
    
    if (response2.ok) {
      const data2 = await response2.json();
      console.log(`📊 Result: ${data2.statistics?.generated || 0} generated, ${data2.statistics?.skipped || 0} skipped`);
      
      if (data2.articles?.length > 0) {
        console.log('📝 New articles generated:');
        data2.articles.forEach(article => {
          console.log(`   - "${article.title}"`);
          console.log(`     Category: ${article.category}, Length: ${article.content.split(' ').length} words`);
        });
      }
    }
    
    console.log('\n=== SUMMARY OF IMPROVEMENTS ===');
    console.log('✅ Pre-database check prevents unnecessary content generation');
    console.log('✅ Clear reporting of skipped vs generated topics');
    console.log('✅ Detailed information about existing articles that block generation');
    console.log('✅ Configurable maxAge parameter for different scenarios');
    console.log('✅ Efficient resource usage - only generate when truly needed');
    
  } catch (error) {
    console.error('Error demonstrating topic filtering:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

demonstrateTopicFiltering();
