const { MongoClient } = require('mongodb');

async function migrateArticles() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    // Source: test database
    const testDb = client.db('test');
    const articlesInTest = testDb.collection('articles');
    
    // Destination: neurapress database
    const neurapressDb = client.db('neurapress');
    const articlesInNeurapress = neurapressDb.collection('articles');
    
    // Count articles in both databases
    const testCount = await articlesInTest.countDocuments();
    const neurapressCount = await articlesInNeurapress.countDocuments();
    
    console.log(`Articles in test.articles: ${testCount}`);
    console.log(`Articles in neurapress.articles: ${neurapressCount}`);
    
    if (testCount === 0) {
      console.log('No articles found in test.articles to migrate');
      return;
    }
    
    // Get all articles from test database
    const articles = await articlesInTest.find({}).toArray();
    console.log(`Found ${articles.length} articles to migrate`);
    
    // Insert articles into neurapress database
    if (articles.length > 0) {
      // Check for duplicates first
      const existingSlugs = await articlesInNeurapress.distinct('slug');
      const articlesToMigrate = articles.filter(article => !existingSlugs.includes(article.slug));
      
      if (articlesToMigrate.length > 0) {
        const result = await articlesInNeurapress.insertMany(articlesToMigrate);
        console.log(`✅ Successfully migrated ${result.insertedCount} articles to neurapress.articles`);
      } else {
        console.log('All articles already exist in neurapress.articles (no duplicates created)');
      }
    }
    
    // Final count
    const finalCount = await articlesInNeurapress.countDocuments();
    console.log(`Final count in neurapress.articles: ${finalCount}`);
    
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await client.close();
  }
}

// Run migration if executed directly
if (require.main === module) {
  require('dotenv').config({ path: '.env.local' });
  migrateArticles().catch(console.error);
}

module.exports = { migrateArticles };
