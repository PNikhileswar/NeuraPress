require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function analyzeRecentArticles() {
  try {
    console.log('=== ANALYZING RECENT ARTICLES ===');
    
    const recentArticles = await prisma.article.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    console.log(`Found ${recentArticles.length} recent articles:`);
    
    for (const article of recentArticles) {
      const wordCount = article.content.split(' ').length;
      const images = (article.content.match(/!\[.*?\]\(.*?\)/g) || []).length;
      const uniqueImages = new Set(
        (article.content.match(/!\[.*?\]\((.*?)\)/g) || [])
          .map(match => match.match(/\((.*?)\)/)?.[1])
          .filter(Boolean)
      ).size;
      
      console.log(`\n--- ${article.title} ---`);
      console.log(`Published: ${article.createdAt.toLocaleString()}`);
      console.log(`Category: ${article.category}`);
      console.log(`Slug: ${article.slug}`);
      console.log(`Word Count: ${wordCount}`);
      console.log(`Reading Time: ${article.readingTime} minutes`);
      console.log(`Total Images: ${images}`);
      console.log(`Unique Images: ${uniqueImages}`);
      console.log(`Content Preview: ${article.content.substring(0, 200)}...`);
      
      if (wordCount < 1000) {
        console.log(`⚠️  Article is quite short (${wordCount} words)`);
      } else {
        console.log(`✅ Article has good length (${wordCount} words)`);
      }
      
      if (images !== uniqueImages) {
        console.log(`⚠️  Found duplicate images (${images} total, ${uniqueImages} unique)`);
      } else {
        console.log(`✅ All images are unique`);
      }
    }
    
  } catch (error) {
    console.error('Error analyzing articles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeRecentArticles();
