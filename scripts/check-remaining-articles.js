const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkRemainingArticles() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    const articles = await db.collection('articles').find({}).sort({ publishedAt: -1 }).limit(10).toArray();
    
    console.log(`Remaining articles: ${articles.length}`);
    articles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title} - ${article.content.length} chars - ${article.publishedAt.toISOString()}`);
    });
  } finally {
    await client.close();
  }
}

checkRemainingArticles().catch(console.error);
