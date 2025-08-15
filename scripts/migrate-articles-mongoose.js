require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI;

async function migrateArticles() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI not found in environment variables');
    return;
  }

  try {
    // Connect to MongoDB using the default connection first (test database)
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the underlying MongoDB client from Mongoose
    const client = mongoose.connection.getClient();
    
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
      
      console.log(`Articles to migrate (excluding duplicates): ${articlesToMigrate.length}`);
      
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
    
    console.log('✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run migration
migrateArticles().catch(console.error);
