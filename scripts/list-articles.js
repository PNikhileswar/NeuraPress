require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function listArticles() {
  const mongoUri = process.env.MONGODB_URI;
  console.log('MongoDB URI:', mongoUri ? 'Found' : 'Not found');
  
  if (!mongoUri) {
    console.error('MONGODB_URI not found in environment variables');
    return;
  }
  
  const client = new MongoClient(mongoUri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('trendwise');
    const articles = await db.collection('articles').find({})
      .project({ slug: 1, title: 1, category: 1 })
      .limit(10)
      .toArray();
    
    console.log('\nAvailable articles:');
    console.log('====================');
    articles.forEach(article => {
      console.log(`Slug: ${article.slug}`);
      console.log(`Title: ${article.title}`);
      console.log(`Category: ${article.category}`);
      console.log(`URL: http://localhost:3001/article/${article.slug}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

listArticles();
