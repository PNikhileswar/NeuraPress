const { generateArticleContent } = require('../lib/openai');

async function testNewContentGeneration() {
  console.log('Testing new content generation logic...');
  
  try {
    const request = {
      topic: 'Test New Content Generation Logic',
      keywords: ['testing', 'content', 'generation', 'fixed', 'no-duplication'],
      category: 'technology'
    };
    
    const result = await generateArticleContent(request);
    
    console.log('Title:', result.title);
    console.log('Content length:', result.content.length);
    console.log('Reading time:', result.readingTime, 'minutes');
    
    // Check for section duplication
    const sections = result.content.split(/(?=^## )/m);
    console.log(`Total sections found: ${sections.length}`);
    
    // Check for duplicate section headers
    const sectionHeaders = result.content.match(/^## .+$/gm) || [];
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
      console.log('\n🎉 SUCCESS: No duplicate headers found in new content generation!');
    }
    
    // Check for subsection duplication
    const subsectionHeaders = result.content.match(/^### .+$/gm) || [];
    const subsectionCounts = {};
    subsectionHeaders.forEach(header => {
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
    
    if (!hasSubDuplicates) {
      console.log('✅ No duplicate subsections found!');
    }
    
    console.log('\n--- Content preview (first 1000 characters) ---');
    console.log(result.content.substring(0, 1000));
    
  } catch (error) {
    console.error('Error testing content generation:', error);
  }
}

testNewContentGeneration();
