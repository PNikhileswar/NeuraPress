const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function getArticleCountsByCategory() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    
    // Get article counts by category
    const categoryCounts = await db.collection('articles').aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();
    
    console.log('Article counts by category:');
    categoryCounts.forEach(cat => {
      console.log(`- ${cat._id}: ${cat.count} articles`);
    });
    
    // Get total count
    const total = await db.collection('articles').countDocuments();
    console.log(`\nTotal articles: ${total}`);
    
    // Check for any articles with missing images
    const articlesWithImages = await db.collection('articles').find({
      'media.images': { $exists: true, $ne: [] }
    }).count();
    
    const articlesWithoutImages = total - articlesWithImages;
    console.log(`\nImage statistics:`);
    console.log(`- Articles with images: ${articlesWithImages}`);
    console.log(`- Articles without images: ${articlesWithoutImages}`);
    
    // Sample a few articles to check image URLs
    const sampleArticles = await db.collection('articles').find({}, {
      title: 1,
      'media.images': 1,
      ogImage: 1
    }).limit(3).toArray();
    
    console.log('\nSample articles with image data:');
    sampleArticles.forEach(article => {
      console.log(`\n- ${article.title}`);
      console.log(`  ogImage: ${article.ogImage || 'None'}`);
      console.log(`  media.images: ${article.media?.images?.length || 0} images`);
      if (article.media?.images?.length > 0) {
        console.log(`    First image: ${article.media.images[0]}`);
      }
    });
    
  } finally {
    await client.close();
  }
}

getArticleCountsByCategory().catch(console.error);
