require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function getArticleCounts() {
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    console.error('MONGODB_URI not found in environment variables');
    return;
  }
  
  const client = new MongoClient(mongoUri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('trendwise');
    const collection = db.collection('articles');
    
    // Total article count
    const totalCount = await collection.countDocuments();
    console.log(`\nTotal articles: ${totalCount}`);
    
    // Count by category
    const categories = ['technology', 'business', 'health', 'lifestyle'];
    console.log('\nArticles by category:');
    
    for (const category of categories) {
      const count = await collection.countDocuments({ category: category });
      console.log(`- ${category.charAt(0).toUpperCase() + category.slice(1)}: ${count} articles`);
    }
    
    // Get some sample slugs for verification
    const sampleArticles = await collection.find({})
      .project({ slug: 1, title: 1, category: 1 })
      .limit(3)
      .toArray();
    
    console.log('\nSample articles:');
    sampleArticles.forEach(article => {
      console.log(`- ${article.title} (${article.category})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

getArticleCounts();
