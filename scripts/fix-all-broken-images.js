require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');
const https = require('https');

// Function to check if an image URL is accessible
function checkImageUrl(url) {
  return new Promise((resolve) => {
    const request = https.request(url, { method: 'HEAD' }, (response) => {
      resolve(response.statusCode === 200);
    });
    
    request.on('error', () => {
      resolve(false);
    });
    
    request.setTimeout(5000, () => {
      request.destroy();
      resolve(false);
    });
    
    request.end();
  });
}

// Valid images for each category
const validImagesByCategory = {
  technology: [
    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop&crop=center',
  ],
  health: [
    'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop&crop=center',
  ],
  lifestyle: [
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1516541196182-6bdb0516ed27?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=800&h=600&fit=crop&crop=center',
  ],
  business: [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1560472355-536de3962603?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop&crop=center',
  ],
  finance: [
    'https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop&crop=center',
  ],
  environment: [
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1497436072909-f5e4be1dabb4?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1516541196182-6bdb0516ed27?w=800&h=600&fit=crop&crop=center',
  ],
  science: [
    'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1526666923127-b2970f64b422?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&h=600&fit=crop&crop=center',
  ]
};

async function fixBrokenImages() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const articles = await db.collection('articles').find({}).toArray();
    
    console.log(`Checking ${articles.length} articles for broken images...`);
    
    let fixedCount = 0;
    let brokenCount = 0;
    
    for (const article of articles) {
      if (!article.ogImage) continue;
      
      console.log(`Checking: ${article.title.substring(0, 50)}...`);
      
      const isWorking = await checkImageUrl(article.ogImage);
      
      if (!isWorking) {
        brokenCount++;
        console.log(`  ✗ Broken image found: ${article.ogImage}`);
        
        // Get valid images for this category
        const category = article.category || 'technology';
        const validImages = validImagesByCategory[category] || validImagesByCategory.technology;
        
        // Pick a random valid image
        const newImage = validImages[Math.floor(Math.random() * validImages.length)];
        
        // Update the article
        await db.collection('articles').updateOne(
          { _id: article._id },
          { 
            $set: { 
              ogImage: newImage,
              'media.images.0': newImage
            } 
          }
        );
        
        fixedCount++;
        console.log(`  ✓ Fixed with: ${newImage}`);
      } else {
        console.log(`  ✓ Image OK`);
      }
    }
    
    console.log(`\n--- Summary ---`);
    console.log(`Total articles checked: ${articles.length}`);
    console.log(`Broken images found: ${brokenCount}`);
    console.log(`Images fixed: ${fixedCount}`);
    
  } catch (error) {
    console.error('Error fixing broken images:', error);
  } finally {
    await client.close();
  }
}

fixBrokenImages();
