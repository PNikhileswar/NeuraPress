const { generateArticleContent } = require('../lib/openai');

async function debugContentGeneration() {
  console.log('Testing content generation...');
  
  const request = {
    topic: 'Test AI Topic',
    keywords: ['AI', 'technology', 'innovation'],
    category: 'technology'
  };
  
  try {
    const result = await generateArticleContent(request);
    
    console.log('Title:', result.title);
    console.log('Content length:', result.content.length);
    console.log('Content preview (first 1000 chars):');
    console.log(result.content.substring(0, 1000));
    console.log('\n--- Checking for section duplication ---');
    
    // Split by major sections (##)
    const sections = result.content.split(/(?=^## )/m);
    console.log(`Total sections found: ${sections.length}`);
    
    // Check for duplicate section headers
    const sectionHeaders = result.content.match(/^## .+$/gm) || [];
    console.log(`Section headers found: ${sectionHeaders.length}`);
    
    const headerCounts = {};
    sectionHeaders.forEach(header => {
      headerCounts[header] = (headerCounts[header] || 0) + 1;
    });
    
    console.log('Header frequency analysis:');
    Object.entries(headerCounts).forEach(([header, count]) => {
      if (count > 1) {
        console.log(`🚨 DUPLICATE: "${header}" appears ${count} times`);
      } else {
        console.log(`✅ UNIQUE: "${header}"`);
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugContentGeneration();
