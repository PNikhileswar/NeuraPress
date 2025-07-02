const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function fixDuplicatedArticles() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('articles');
    
    console.log('Checking for articles with content duplication...');
    
    // Find articles with excessive content length (likely duplicated)
    const duplicatedArticles = await collection.find({
      $expr: { $gt: [{ $strLenCP: "$content" }, 100000] } // Articles longer than 100k chars are likely duplicated
    }).toArray();
    
    console.log(`Found ${duplicatedArticles.length} articles with excessive content length (likely duplicated)`);
    
    if (duplicatedArticles.length > 0) {
      console.log('Articles to be deleted:');
      duplicatedArticles.forEach(article => {
        console.log(`- ${article.title} (${article.content.length} chars)`);
      });
      
      // Delete these articles
      const result = await collection.deleteMany({
        $expr: { $gt: [{ $strLenCP: "$content" }, 100000] }
      });
      
      console.log(`\n✅ Deleted ${result.deletedCount} duplicated articles`);
      console.log('You can now generate new articles with the fixed content generation logic.');
    } else {
      console.log('No duplicated articles found.');
    }
    
  } finally {
    await client.close();
  }
}

fixDuplicatedArticles().catch(console.error);
