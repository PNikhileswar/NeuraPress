require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Connect to MongoDB
async function connectDB() {
  if (mongoose.connections[0].readyState) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Article schema (simplified version for this script)
const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  excerpt: { type: String, required: true },
  category: { type: String, required: true },
  tags: [String],
  readingTime: { type: Number, default: 5 },
  ogImage: String,
  featured: { type: Boolean, default: false },
  publishedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  media: {
    images: [String],
    videos: [String],
    tweets: [String],
  },
});

const Article = mongoose.models.Article || mongoose.model('Article', articleSchema);

async function checkLatestArticles() {
  try {
    await connectDB();
    
    console.log('=== CHECKING LATEST ARTICLES FOR LENGTH AND IMAGE UNIQUENESS ===');
    
    const latestArticles = await Article.find()
      .sort({ publishedAt: -1 })
      .limit(5)
      .exec();
    
    console.log(`Analyzing ${latestArticles.length} latest articles:\n`);
    
    for (const article of latestArticles) {
      const wordCount = article.content.split(' ').length;
      
      // Extract all images from content
      const imageMatches = article.content.match(/!\[.*?\]\((.*?)\)/g) || [];
      const imageUrls = imageMatches.map(match => {
        const urlMatch = match.match(/\((.*?)\)/);
        return urlMatch ? urlMatch[1] : '';
      }).filter(Boolean);
      
      const uniqueImages = new Set(imageUrls);
      const hasDuplicates = imageUrls.length !== uniqueImages.size;
      
      console.log(`--- ${article.title} ---`);
      console.log(`Published: ${article.publishedAt.toLocaleString()}`);
      console.log(`Category: ${article.category}`);
      console.log(`Word Count: ${wordCount} words`);
      console.log(`Reading Time: ${article.readingTime} minutes`);
      console.log(`Total Images: ${imageUrls.length}`);
      console.log(`Unique Images: ${uniqueImages.size}`);
      
      if (wordCount >= 2500) {
        console.log('✅ Article has excellent length (2500+ words)');
      } else if (wordCount >= 1000) {
        console.log('✅ Article has good length (1000+ words)');
      } else {
        console.log(`⚠️ Article is short (${wordCount} words)`);
      }
      
      if (!hasDuplicates) {
        console.log('✅ All images are unique');
      } else {
        console.log(`⚠️ Found duplicate images (${imageUrls.length} total, ${uniqueImages.size} unique)`);
        
        // Find and display duplicates
        const urlCounts = {};
        imageUrls.forEach(url => {
          urlCounts[url] = (urlCounts[url] || 0) + 1;
        });
        
        const duplicates = Object.entries(urlCounts)
          .filter(([url, count]) => count > 1)
          .map(([url, count]) => `${url} (${count} times)`);
        
        if (duplicates.length > 0) {
          console.log('   Duplicated images:');
          duplicates.forEach(dup => console.log(`   - ${dup}`));
        }
      }
      
      console.log(''); // Empty line for readability
    }
    
  } catch (error) {
    console.error('Error checking articles:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkLatestArticles();
