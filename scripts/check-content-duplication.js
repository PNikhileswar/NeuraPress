const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkArticlesDuplication() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    const articles = await db.collection('articles').find({}).sort({ publishedAt: -1 }).limit(5).toArray();
    
    console.log(`Checking ${articles.length} articles for content duplication...\n`);
    
    articles.forEach((article, index) => {
      console.log(`=== Article ${index + 1}: ${article.title} ===`);
      console.log(`Content length: ${article.content.length} characters`);
      console.log(`Slug: ${article.slug}`);
      
      // Check for repeated sections
      const content = article.content;
      const sections = content.split('\n\n');
      
      console.log(`Total sections: ${sections.length}`);
      
      // Look for duplicate sections
      const sectionCounts = {};
      sections.forEach(section => {
        const trimmed = section.trim();
        if (trimmed.length > 50) { // Only check substantial sections
          sectionCounts[trimmed] = (sectionCounts[trimmed] || 0) + 1;
        }
      });
      
      const duplicates = Object.entries(sectionCounts).filter(([section, count]) => count > 1);
      
      if (duplicates.length > 0) {
        console.log(`🚨 FOUND ${duplicates.length} DUPLICATE SECTIONS:`);
        duplicates.forEach(([section, count]) => {
          console.log(`  - Repeated ${count} times: "${section.substring(0, 100)}..."`);
        });
      } else {
        console.log(`✅ No duplicate sections found`);
      }
      
      // Check for repeated headers
      const headers = content.match(/^#+\s+.+$/gm) || [];
      const headerCounts = {};
      headers.forEach(header => {
        headerCounts[header] = (headerCounts[header] || 0) + 1;
      });
      
      const duplicateHeaders = Object.entries(headerCounts).filter(([header, count]) => count > 1);
      if (duplicateHeaders.length > 0) {
        console.log(`🚨 DUPLICATE HEADERS:`);
        duplicateHeaders.forEach(([header, count]) => {
          console.log(`  - "${header}" appears ${count} times`);
        });
      }
      
      console.log(`\n${'='.repeat(60)}\n`);
    });
  } finally {
    await client.close();
  }
}

checkArticlesDuplication().catch(console.error);
