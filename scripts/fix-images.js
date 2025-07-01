const { MongoClient } = require('mongodb');

async function fixImageDisplay() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/trendwise';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('trendwise');
    const collection = db.collection('articles');

    // Find articles without ogImage but with media.images
    const articles = await collection.find({
      $or: [
        { ogImage: { $exists: false } },
        { ogImage: null },
        { ogImage: "" }
      ],
      'media.images.0': { $exists: true }
    }).toArray();

    console.log(`Found ${articles.length} articles needing image fixes`);

    let updated = 0;

    for (const article of articles) {
      if (article.media && article.media.images && article.media.images.length > 0) {
        const firstImage = article.media.images[0];
        
        await collection.updateOne(
          { _id: article._id },
          { 
            $set: { 
              ogImage: firstImage,
              updatedAt: new Date()
            } 
          }
        );
        
        console.log(`Updated article: ${article.title}`);
        updated++;
      }
    }

    console.log(`\nFixed ${updated} articles with missing ogImage fields`);

  } catch (error) {
    console.error('Error fixing images:', error);
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

fixImageDisplay();
