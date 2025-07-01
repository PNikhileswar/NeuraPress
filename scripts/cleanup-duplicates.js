const { MongoClient } = require('mongodb');

async function cleanupDuplicateArticles() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/trendwise';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('trendwise');
    const collection = db.collection('articles');

    // Find articles with similar titles (first 4 words)
    const articles = await collection.find({}).toArray();
    const duplicateGroups = {};

    articles.forEach(article => {
      const keyWords = article.title.split(' ').slice(0, 4).join(' ').toLowerCase();
      if (!duplicateGroups[keyWords]) {
        duplicateGroups[keyWords] = [];
      }
      duplicateGroups[keyWords].push(article);
    });

    let totalDeleted = 0;

    for (const [key, group] of Object.entries(duplicateGroups)) {
      if (group.length > 1) {
        console.log(`Found ${group.length} similar articles for: "${key}"`);
        
        // Sort by creation date and keep the newest one
        group.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
        const toKeep = group[0];
        const toDelete = group.slice(1);

        console.log(`Keeping: ${toKeep.title} (${toKeep.publishedAt})`);
        
        for (const article of toDelete) {
          console.log(`Deleting: ${article.title} (${article.publishedAt})`);
          await collection.deleteOne({ _id: article._id });
          totalDeleted++;
        }
      }
    }

    console.log(`\nCleanup complete! Deleted ${totalDeleted} duplicate articles.`);
    
    // Show final count
    const finalCount = await collection.countDocuments();
    console.log(`Remaining articles: ${finalCount}`);

  } catch (error) {
    console.error('Error cleaning up duplicates:', error);
  } finally {
    await client.close();
  }
}

// Load environment variables if using .env file
try {
  if (require('fs').existsSync('.env.local')) {
    const dotenv = require('dotenv');
    dotenv.config({ path: '.env.local' });
  }
} catch (error) {
  console.log('Note: dotenv not available, using system environment variables');
}

cleanupDuplicateArticles();
