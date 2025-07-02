require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function fixSustainableArticleImage() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Valid environment/sustainability images (tested)
    const validImages = [
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1516541196182-6bdb0516ed27?w=800&h=600&fit=crop&crop=center', 
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=600&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1497436072909-f5e4be1dabb4?w=800&h=600&fit=crop&crop=center'
    ];
    
    // Pick a random valid image for sustainability/environment
    const newImage = validImages[Math.floor(Math.random() * validImages.length)];
    
    const result = await db.collection('articles').updateOne(
      { slug: 'sustainable-living-tips-a-comprehensive-guide' },
      { 
        $set: { 
          ogImage: newImage,
          'media.images.0': newImage // Also update the first media image
        } 
      }
    );
    
    if (result.matchedCount > 0) {
      console.log(`✓ Updated Sustainable Living article with new image: ${newImage}`);
    } else {
      console.log('✗ Article not found');
    }
    
  } catch (error) {
    console.error('Error updating article:', error);
  } finally {
    await client.close();
  }
}

fixSustainableArticleImage();
