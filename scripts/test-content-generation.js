require('dotenv').config({ path: '.env.local' });
const { generateArticleContent } = require('./lib/openai.ts');

async function testContentGeneration() {
  const request = {
    topic: 'Sustainable Energy Solutions for Modern Homes',
    keywords: ['solar panels', 'energy efficiency', 'renewable energy', 'smart home', 'sustainability'],
    category: 'environment'
  };

  try {
    console.log('Testing improved content generation...');
    const result = await generateArticleContent(request);
    
    const wordCount = result.content.split(' ').length;
    console.log(`\n=== CONTENT GENERATION TEST RESULTS ===`);
    console.log(`Title: ${result.title}`);
    console.log(`Word Count: ${wordCount}`);
    console.log(`Reading Time: ${result.readingTime} minutes`);
    console.log(`Meta Description: ${result.metaDescription}`);
    console.log(`Tags: ${result.tags.join(', ')}`);
    console.log(`\nContent Preview (first 500 chars):`);
    console.log(result.content.substring(0, 500) + '...');
    
    // Check for image uniqueness
    const images = result.content.match(/!\[.*?\]\((.*?)\)/g) || [];
    const imageUrls = images.map(img => img.match(/\((.*?)\)/)?.[1]).filter(Boolean);
    const uniqueImages = new Set(imageUrls);
    
    console.log(`\n=== IMAGE ANALYSIS ===`);
    console.log(`Total images: ${images.length}`);
    console.log(`Unique images: ${uniqueImages.size}`);
    console.log(`Duplicate images: ${images.length - uniqueImages.size}`);
    
    if (uniqueImages.size === images.length) {
      console.log('✅ All images are unique!');
    } else {
      console.log('❌ Some images are duplicated');
      console.log('Image URLs:', Array.from(uniqueImages));
    }
    
  } catch (error) {
    console.error('Error testing content generation:', error);
  }
}

testContentGeneration();
