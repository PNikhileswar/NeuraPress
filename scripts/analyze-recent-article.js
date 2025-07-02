require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function checkRecentArticle() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('trendwise');
  
  // Get the most recent article
  const article = await db.collection('articles')
    .findOne({}, { sort: { publishedAt: -1 } });
  
  if (article) {
    const wordCount = article.content.split(' ').length;
    console.log(`\n=== MOST RECENT ARTICLE ANALYSIS ===`);
    console.log(`Title: ${article.title}`);
    console.log(`Category: ${article.category}`);
    console.log(`Published: ${new Date(article.publishedAt).toLocaleString()}`);
    console.log(`Word Count: ${wordCount}`);
    console.log(`Reading Time: ${article.readingTime} minutes`);
    console.log(`Slug: ${article.slug}`);
    
    // Check for images
    const images = article.content.match(/!\[.*?\]\((.*?)\)/g) || [];
    const imageUrls = images.map(img => img.match(/\((.*?)\)/)?.[1]).filter(Boolean);
    const uniqueImages = new Set(imageUrls);
    
    console.log(`\n=== IMAGE ANALYSIS ===`);
    console.log(`Total images: ${images.length}`);
    console.log(`Unique images: ${uniqueImages.size}`);
    console.log(`Duplicate images: ${images.length - uniqueImages.size}`);
    
    console.log(`\nContent Preview (first 800 chars):`);
    console.log(article.content.substring(0, 800) + '...\n');
    
    if (uniqueImages.size === images.length) {
      console.log('✅ All images are unique!');
    } else {
      console.log('❌ Some images are duplicated');
    }
    
    // Check if it's using improved content
    if (wordCount > 1000) {
      console.log('✅ Article has substantial content (>1000 words)');
    } else {
      console.log('❌ Article needs more content');
    }
  }
  
  await client.close();
}

checkRecentArticle().catch(console.error);
