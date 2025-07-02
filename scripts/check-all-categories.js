const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkAllCategories() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    
    const categoryCounts = await db.collection('articles').aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();
    
    console.log('All categories in database:');
    categoryCounts.forEach(cat => {
      console.log(`- ${cat._id}: ${cat.count}`);
    });
    
  } finally {
    await client.close();
  }
}

checkAllCategories().catch(console.error);
