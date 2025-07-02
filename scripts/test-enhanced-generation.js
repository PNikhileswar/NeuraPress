// Test the enhanced fallback content generation
async function testEnhancedFallback() {
  console.log('Testing enhanced fallback content generation...');
  
  try {
    const request = {
      topic: 'Digital Transformation in Healthcare',
      keywords: ['digital health', 'telemedicine', 'healthcare technology', 'patient care', 'medical innovation'],
      category: 'health'
    };
    
    console.log('Generating content for:', request.topic);
    console.log('Category:', request.category);
    console.log('Keywords:', request.keywords.join(', '));
    
    // This will simulate the actual generation process
    const result = await fetch('http://localhost:3001/api/trending/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        count: 1,
        categories: [request.category],
        maxAge: 0  // Force generation even if similar topics exist
      })
    });
    
    if (result.ok) {
      const data = await result.json();
      console.log('\n=== GENERATION RESULTS ===');
      console.log('Status:', result.status);
      console.log('Articles generated:', data.articles?.length || 0);
      
      if (data.articles && data.articles.length > 0) {
        const article = data.articles[0];
        const wordCount = article.content.split(' ').length;
        
        console.log('\n=== ARTICLE ANALYSIS ===');
        console.log('Title:', article.title);
        console.log('Word Count:', wordCount);
        console.log('Reading Time:', article.readingTime);
        console.log('Category:', article.category);
        console.log('Tags:', article.tags?.join(', ') || 'None');
        
        console.log('\n=== CONTENT PREVIEW (first 1000 chars) ===');
        console.log(article.content.substring(0, 1000) + '...');
        
        console.log('\n=== CONTENT STRUCTURE ===');
        const sections = article.content.split('##').length - 1;
        const subsections = article.content.split('###').length - 1;
        const images = (article.content.match(/!\[.*?\]\(.*?\)/g) || []).length;
        
        console.log('Number of sections (##):', sections);
        console.log('Number of subsections (###):', subsections);
        console.log('Number of images:', images);
        
        if (wordCount > 2500) {
          console.log('✅ Article meets length requirements (2500+ words)');
        } else {
          console.log(`⚠️ Article is shorter than expected (${wordCount} words)`);
        }
      }
      
    } else {
      console.error('Failed to generate article:', result.statusText);
    }
    
  } catch (error) {
    console.error('Error testing enhanced generation:', error);
  }
}

testEnhancedFallback();
