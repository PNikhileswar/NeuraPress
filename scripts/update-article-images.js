require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const categoryImages = {
  technology: [
    'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800&h=600&fit=crop&crop=center',
  ],
  health: [
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1499484628894-c3aae6b6cd42?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&crop=center',
  ],
  finance: [
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&h=600&fit=crop&crop=center',
  ],
  business: [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1560472355-536de3962603?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1556745753-b2904692b3cd?w=800&h=600&fit=crop&crop=center',
  ],
  environment: [
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1506477331477-33d5d8b3dc85?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1497436072909-f5e4be1dabb4?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop&crop=center',
  ],
  science: [
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1526666923127-b2970f64b422?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=800&h=600&fit=crop&crop=center',
  ],
  lifestyle: [
    'https://images.unsplash.com/photo-1493723843671-1d655e66ac1c?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1540479859555-17af45c78602?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1585933646451-1bba7a0b7085?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center',
  ],
};

function getUniqueImage(category, excludeUrls = [], seed = '') {
  const images = categoryImages[category] || categoryImages.technology;
  const availableImages = images.filter(img => !excludeUrls.includes(img));
  
  if (availableImages.length === 0) {
    // If all images are used, just pick a random one
    return images[Math.floor(Math.random() * images.length)];
  }
  
  // Use seed to ensure deterministic but varied selection
  const hash = seed.split('').reduce((acc, char) => {
    return ((acc << 5) - acc + char.charCodeAt(0)) & 0xffffffff;
  }, 0);
  
  const index = Math.abs(hash) % availableImages.length;
  return availableImages[index];
}

async function updateArticleImages() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const articles = await db.collection('articles').find({}).toArray();
    
    console.log(`Found ${articles.length} articles to update`);
    
    // Track used images to avoid duplicates
    const usedImages = new Set();
    let updated = 0;
    
    for (const article of articles) {
      const category = article.category || 'technology';
      const uniqueImage = getUniqueImage(category, Array.from(usedImages), article.slug || article.title);
      
      // Update the article with the new unique image
      await db.collection('articles').updateOne(
        { _id: article._id },
        { 
          $set: { 
            ogImage: uniqueImage,
            'media.images.0': uniqueImage // Also update the first media image
          } 
        }
      );
      
      usedImages.add(uniqueImage);
      updated++;
      
      if (updated % 10 === 0) {
        console.log(`Updated ${updated}/${articles.length} articles...`);
      }
    }
    
    console.log(`Successfully updated ${updated} articles with unique images`);
    
  } catch (error) {
    console.error('Error updating article images:', error);
  } finally {
    await client.close();
  }
}

updateArticleImages();
