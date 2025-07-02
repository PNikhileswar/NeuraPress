// Delete all articles and force generation of a new one
const mongoose = require('mongoose');

async function forceNewArticleGeneration() {
    try {
        await mongoose.connect('mongodb://localhost:27017/trendwise');
        console.log('Connected to MongoDB');
        
        // Get the Article model
        const ArticleSchema = new mongoose.Schema({}, { strict: false });
        const Article = mongoose.models.Article || mongoose.model('Article', ArticleSchema);
        
        console.log('\n🗑️ Deleting all articles to force new generation...');
        const deleteResult = await Article.deleteMany({});
        console.log(`✅ Deleted ${deleteResult.deletedCount} articles`);
        
        await mongoose.disconnect();
        console.log('✅ Database cleared - ready for new article generation');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

forceNewArticleGeneration();
