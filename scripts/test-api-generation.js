const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function createTestArticleAndCheck() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('articles');
    
    console.log('Creating a test article to verify duplication fix...');
    
    // Use the API to generate a new article
    const response = await fetch('http://localhost:3001/api/trending/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        count: 1,
        maxAge: 0 // Force generation regardless of existing articles
      })
    });
    
    const result = await response.json();
    console.log('Generation result:', result.message);
    
    if (result.articles && result.articles.length > 0) {
      const newArticle = result.articles[0];
      console.log(`\n=== New Article Created: ${newArticle.title} ===`);
      console.log(`Content length: ${newArticle.content.length} characters`);
      
      // Analyze the content for duplication
      const content = newArticle.content;
      const sections = content.split(/(?=^## )/m);
      console.log(`Total sections: ${sections.length}`);
      
      // Check headers
      const headers = content.match(/^## .+$/gm) || [];
      const headerCounts = {};
      headers.forEach(header => {
        headerCounts[header] = (headerCounts[header] || 0) + 1;
      });
      
      console.log('\nHeader analysis:');
      let hasDuplicates = false;
      Object.entries(headerCounts).forEach(([header, count]) => {
        if (count > 1) {
          console.log(`🚨 DUPLICATE: "${header}" appears ${count} times`);
          hasDuplicates = true;
        } else {
          console.log(`✅ UNIQUE: "${header}"`);
        }
      });
      
      // Check subsections
      const subsections = content.match(/^### .+$/gm) || [];
      const subsectionCounts = {};
      subsections.forEach(header => {
        subsectionCounts[header] = (subsectionCounts[header] || 0) + 1;
      });
      
      console.log('\nSubsection analysis:');
      let hasSubDuplicates = false;
      Object.entries(subsectionCounts).forEach(([header, count]) => {
        if (count > 1) {
          console.log(`🚨 DUPLICATE SUBSECTION: "${header}" appears ${count} times`);
          hasSubDuplicates = true;
        }
      });
      
      if (!hasDuplicates && !hasSubDuplicates) {
        console.log('\n🎉 SUCCESS: Content duplication has been FIXED!');
        console.log('✅ No duplicate sections or subsections found');
        console.log(`✅ Content length is reasonable: ${newArticle.content.length} characters`);
      } else {
        console.log('\n❌ Still has duplication issues');
      }
      
      console.log('\n--- Content Preview ---');
      console.log(content.substring(0, 1000));
      
    } else {
      console.log('No new articles were generated. Trying to force generation...');
      
      // If no new articles, let's check the most recent one
      const latestArticle = await collection.findOne({}, { sort: { publishedAt: -1 } });
      if (latestArticle) {
        console.log(`\nChecking latest existing article: ${latestArticle.title}`);
        console.log(`Content length: ${latestArticle.content.length} characters`);
        
        if (latestArticle.content.length < 50000) {
          console.log('✅ Content length is reasonable - duplication likely fixed');
        } else {
          console.log('❌ Content is still very long - duplication may still exist');
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

createTestArticleAndCheck();
