const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkNewArticleContent() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    
    // Get the latest article
    const latestArticle = await db.collection('articles').findOne({}, { sort: { publishedAt: -1 } });
    
    if (!latestArticle) {
      console.log('No articles found');
      return;
    }
    
    console.log(`=== Checking Latest Article: ${latestArticle.title} ===`);
    console.log(`Content length: ${latestArticle.content.length} characters`);
    console.log(`Published: ${latestArticle.publishedAt}`);
    
    // Check for section duplication
    const sections = latestArticle.content.split(/(?=^## )/m);
    console.log(`Total sections found: ${sections.length}`);
    
    // Check for duplicate section headers
    const sectionHeaders = latestArticle.content.match(/^## .+$/gm) || [];
    console.log(`Section headers found: ${sectionHeaders.length}`);
    
    const headerCounts = {};
    sectionHeaders.forEach(header => {
      headerCounts[header] = (headerCounts[header] || 0) + 1;
    });
    
    console.log('\nHeader frequency analysis:');
    let hasDuplicates = false;
    Object.entries(headerCounts).forEach(([header, count]) => {
      if (count > 1) {
        console.log(`🚨 DUPLICATE: "${header}" appears ${count} times`);
        hasDuplicates = true;
      } else {
        console.log(`✅ UNIQUE: "${header}"`);
      }
    });
    
    if (!hasDuplicates) {
      console.log('\n🎉 SUCCESS: No duplicate headers found!');
    }
    
    // Check for content subsection duplication
    const subsectionHeaders = latestArticle.content.match(/^### .+$/gm) || [];
    const subsectionCounts = {};
    subsectionHeaders.forEach(header => {
      subsectionCounts[header] = (subsectionCounts[header] || 0) + 1;
    });
    
    console.log('\nSubsection header analysis:');
    let hasSubDuplicates = false;
    Object.entries(subsectionCounts).forEach(([header, count]) => {
      if (count > 1) {
        console.log(`🚨 DUPLICATE SUBSECTION: "${header}" appears ${count} times`);
        hasSubDuplicates = true;
      }
    });
    
    if (!hasSubDuplicates) {
      console.log('✅ No duplicate subsection headers found!');
    }
    
    console.log('\n--- Content preview (first 800 characters) ---');
    console.log(latestArticle.content.substring(0, 800));
    
  } finally {
    await client.close();
  }
}

checkNewArticleContent().catch(console.error);
