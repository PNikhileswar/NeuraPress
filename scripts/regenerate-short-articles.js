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

async function regenerateShortArticles() {
  try {
    await connectDB();
    
    console.log('=== FINDING SHORT ARTICLES TO REGENERATE ===');
    
    // Find articles with low word count (under 500 words)
    const shortArticles = await Article.find().exec();
    
    const articlesToRegenerate = shortArticles.filter(article => {
      const wordCount = article.content.split(' ').length;
      return wordCount < 500;
    });
    
    console.log(`Found ${articlesToRegenerate.length} short articles to regenerate:`);
    
    for (const article of articlesToRegenerate) {
      const wordCount = article.content.split(' ').length;
      console.log(`- ${article.title}: ${wordCount} words`);
    }
    
    if (articlesToRegenerate.length === 0) {
      console.log('No short articles found. All articles appear to be well-detailed.');
      return;
    }
    
    console.log('\n=== REGENERATING SHORT ARTICLES ===');
    
    const regeneratedCount = [];
    
    for (const article of articlesToRegenerate.slice(0, 3)) { // Regenerate first 3 short articles
      try {
        console.log(`\nRegenerating: ${article.title}`);
        
        // Make API call to regenerate article
        const response = await fetch('http://localhost:3001/api/trending/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            count: 1,
            categories: [article.category],
            maxAge: 0  // Force generation
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.articles && data.articles.length > 0) {
            const newArticle = data.articles[0];
            const newWordCount = newArticle.content.split(' ').length;
            
            console.log(`✅ Generated new article: ${newArticle.title}`);
            console.log(`   Word count: ${newWordCount} words`);
            console.log(`   Reading time: ${newArticle.readingTime} minutes`);
            
            regeneratedCount.push({
              original: article.title,
              new: newArticle.title,
              originalWords: article.content.split(' ').length,
              newWords: newWordCount
            });
            
            // Small delay to avoid overwhelming the system
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } else {
          console.error(`Failed to regenerate ${article.title}:`, response.statusText);
        }
        
      } catch (error) {
        console.error(`Error regenerating ${article.title}:`, error);
      }
    }
    
    console.log('\n=== REGENERATION SUMMARY ===');
    console.log(`Successfully regenerated ${regeneratedCount.length} articles:`);
    
    for (const item of regeneratedCount) {
      console.log(`\nOriginal: ${item.original} (${item.originalWords} words)`);
      console.log(`New: ${item.new} (${item.newWords} words)`);
      console.log(`Improvement: +${item.newWords - item.originalWords} words`);
    }
    
  } catch (error) {
    console.error('Error in regeneration process:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

regenerateShortArticles();
