// Check articles in database and test media generation
const mongoose = require('mongoose');

// Connect to MongoDB
async function checkArticles() {
    try {
        await mongoose.connect('mongodb://localhost:27017/trendwise');
        console.log('Connected to MongoDB');
        
        // Get the Article model
        const ArticleSchema = new mongoose.Schema({}, { strict: false });
        const Article = mongoose.models.Article || mongoose.model('Article', ArticleSchema);
        
        console.log('\n📊 Current Articles in Database:');
        const articles = await Article.find({}).sort({ publishedAt: -1 }).limit(5);
        
        if (articles.length === 0) {
            console.log('   No articles found in database');
        } else {
            articles.forEach((article, index) => {
                console.log(`\n${index + 1}. Title: ${article.title}`);
                console.log(`   Published: ${article.publishedAt?.toLocaleDateString()}`);
                console.log(`   Category: ${article.category}`);
                console.log(`   OG Image: ${article.ogImage ? 'SET ✅' : 'MISSING ❌'}`);
                console.log(`   Media Images: ${article.media?.images?.length || 0}`);
                console.log(`   Media Videos: ${article.media?.videos?.length || 0}`);
                if (article.media?.images?.length > 0) {
                    console.log(`   First Image: ${article.media.images[0].url}`);
                }
            });
        }
        
        console.log('\n🗑️  Deleting oldest article to make room for new generation...');
        if (articles.length > 0) {
            const deleted = await Article.findByIdAndDelete(articles[articles.length - 1]._id);
            console.log(`   Deleted: "${deleted.title}"`);
        }
        
        await mongoose.disconnect();
        console.log('\n✅ Database check completed');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkArticles();
