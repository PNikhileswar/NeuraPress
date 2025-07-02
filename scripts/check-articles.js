require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function checkArticles() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('trendwise');
  
  const articles = await db.collection('articles').find({})
    .project({ title: 1, content: 1, readingTime: 1 })
    .limit(3)
    .toArray();
  
  articles.forEach((article, i) => {
    const wordCount = article.content.split(' ').length;
    console.log(`\n--- Article ${i + 1} ---`);
    console.log(`Title: ${article.title}`);
    console.log(`Word count: ${wordCount}`);
    console.log(`Reading time: ${article.readingTime} min`);
    console.log(`Content preview: ${article.content.substring(0, 200)}...`);
  });
  
  await client.close();
}

checkArticles().catch(console.error);
