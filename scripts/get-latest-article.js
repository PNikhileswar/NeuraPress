const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function getLatestArticle() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    
    const latestArticle = await db.collection('articles').findOne({}, { 
      sort: { publishedAt: -1 },
      projection: { title: 1, slug: 1, ogImage: 1, 'media.images': 1 }
    });
    
    if (latestArticle) {
      console.log(`Latest article: ${latestArticle.title}`);
      console.log(`Slug: ${latestArticle.slug}`);
      console.log(`URL: http://localhost:3001/article/${latestArticle.slug}`);
      console.log(`OG Image: ${latestArticle.ogImage}`);
      console.log(`Media images count: ${latestArticle.media?.images?.length || 0}`);
    }
    
  } finally {
    await client.close();
  }
}

getLatestArticle().catch(console.error);
