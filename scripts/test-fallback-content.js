// Test the fallback content generation logic directly
function generateFallbackContent(request) {
  const { topic, keywords, category } = request;
  
  // Generate category-appropriate placeholder images with better variety
  const getPlaceholderImages = (category, topic) => {
    const categoryImages = {
      environment: [
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200&h=800&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1506477331477-33d5d8b3dc85?w=800&h=600&fit=crop&crop=center',
        'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop&crop=center',
      ],
    };
    
    const images = categoryImages[category] || categoryImages.environment;
    
    // Create a unique hash from topic
    const topicHash = topic.split('').reduce((hash, char) => {
      return ((hash << 5) - hash + char.charCodeAt(0)) & 0xffffffff;
    }, 0);
    
    const timeHash = Date.now() % 10000;
    const selectedImages = [];
    const usedIndices = new Set();
    
    for (let i = 0; i < 5; i++) {
      let index = Math.abs(topicHash + timeHash + i * 23) % images.length;
      while (usedIndices.has(index)) {
        index = (index + 1) % images.length;
      }
      usedIndices.add(index);
      selectedImages.push(images[index]);
    }
    
    return selectedImages;
  };

  // Generate comprehensive content based on category
  const generateCategoryContent = (topic, category, keywords, images) => {
    const sections = {
      environment: [
        'Understanding the Fundamentals',
        'Current State of Technology',
        'Implementation Strategies',
        'Environmental Benefits',
        'Economic Considerations',
        'Challenges and Solutions',
        'Future Trends and Predictions',
        'Best Practices and Recommendations'
      ],
    };

    const sectionTitles = sections[category] || sections.environment;
    
    return sectionTitles.map((sectionTitle, index) => {
      const imageIndex = (index + 1) % images.length;
      const relevantKeywords = keywords.slice(index % keywords.length, (index % keywords.length) + 3).join(', ');
      
      return `## ${sectionTitle}

${index === 1 ? `![${topic} - ${sectionTitle}](${images[imageIndex]})\n\n` : ''}

In the context of ${topic}, ${sectionTitle.toLowerCase()} represents a crucial aspect that demands careful attention and understanding. This comprehensive exploration delves into the intricate details and practical implications.

### Core Concepts and Principles

The fundamental principles underlying ${topic} in relation to ${sectionTitle.toLowerCase()} encompass several key areas. These include ${relevantKeywords}, which form the foundation of effective implementation and understanding.

### Detailed Analysis

Research and industry insights reveal that ${topic} has significant implications for ${sectionTitle.toLowerCase()}. Key findings include:

- **Enhanced Performance**: Studies demonstrate measurable improvements in related metrics
- **Strategic Value**: Organizations implementing these concepts report substantial benefits
- **Innovation Potential**: Emerging opportunities create new possibilities for growth
- **Risk Mitigation**: Proper understanding helps avoid common pitfalls and challenges

${index === 3 ? `![${topic} Applications](${images[(imageIndex + 1) % images.length]})\n\n` : ''}

### Practical Implementation

When applying ${topic} concepts to ${sectionTitle.toLowerCase()}, consider these practical approaches:

1. **Assessment Phase**: Evaluate current state and identify improvement opportunities
2. **Planning Stage**: Develop comprehensive strategies aligned with objectives
3. **Execution Process**: Implement changes systematically with proper monitoring
4. **Optimization Cycle**: Continuously refine and improve based on results

### Expert Insights and Recommendations

Industry experts emphasize the importance of ${sectionTitle.toLowerCase()} in the context of ${topic}. Their recommendations include:

- Maintaining focus on core objectives while remaining adaptable to changes
- Investing in proper training and development for optimal results
- Establishing clear metrics and monitoring systems for success measurement
- Building strong foundations before advancing to more complex implementations

${index === 5 ? `![${topic} Future Trends](${images[(imageIndex + 2) % images.length]})\n\n` : ''}

### Measurable Outcomes and Benefits

Organizations and individuals who successfully implement ${topic} strategies in ${sectionTitle.toLowerCase()} typically experience:

- Improved efficiency and productivity metrics
- Enhanced quality and consistency in outcomes
- Greater satisfaction and engagement levels
- Increased competitiveness and market positioning

### Common Challenges and Solutions

While implementing ${topic} concepts, several challenges may arise in ${sectionTitle.toLowerCase()}:

**Challenge 1: Resource Allocation**
- Solution: Prioritize initiatives based on impact and feasibility

**Challenge 2: Change Management**
- Solution: Implement gradual transitions with proper stakeholder engagement

**Challenge 3: Technology Integration**
- Solution: Choose compatible systems and ensure proper training

**Challenge 4: Performance Measurement**
- Solution: Establish clear KPIs and regular monitoring processes`;
    }).join('\n\n');
  };
  
  const title = `${topic}: A Comprehensive Guide`;
  const images = getPlaceholderImages(category, topic);
  
  const content = `# ${title}

![${topic}](${images[0]})

## Introduction

${topic} has emerged as a transformative force in today's rapidly evolving landscape. This comprehensive guide provides an in-depth exploration of ${topic}, covering essential concepts, practical applications, and strategic insights that can help individuals and organizations harness its full potential.

In an era where innovation drives success, understanding ${topic} becomes crucial for staying competitive and achieving sustainable growth. This article delves deep into the multifaceted aspects of ${topic}, offering valuable perspectives from industry experts and real-world case studies.

## Executive Summary

This comprehensive analysis of ${topic} reveals significant opportunities for improvement and innovation across multiple domains. Key findings demonstrate that organizations and individuals who effectively leverage ${topic} achieve measurable improvements in performance, efficiency, and strategic positioning.

The research presented in this guide encompasses recent developments, emerging trends, and proven methodologies that contribute to successful ${topic} implementation. Our analysis includes insights from leading industry experts, academic research, and practical case studies from diverse sectors.

${generateCategoryContent(topic, category, keywords, images)}

## Conclusion and Key Takeaways

${topic} represents a significant opportunity for transformation and growth across multiple domains. This comprehensive guide has explored the essential aspects, practical applications, and strategic considerations necessary for successful implementation.

Key takeaways from this analysis include:

1. **Strategic Importance**: ${topic} is crucial for competitive advantage and sustainable growth
2. **Implementation Approach**: Success requires structured planning and systematic execution
3. **Technology Integration**: Modern tools and technologies enhance effectiveness
4. **Continuous Improvement**: Ongoing optimization ensures long-term success
5. **Future Readiness**: Preparation for emerging trends and challenges is essential

By following the insights and recommendations presented in this guide, organizations and individuals can effectively leverage ${topic} to achieve their objectives and create lasting value.`;

  // Calculate accurate reading time (average 200 words per minute)
  const wordCount = content.split(' ').length;
  const readingTime = Math.ceil(wordCount / 200);

  return {
    title,
    content,
    metaDescription: `Comprehensive guide to ${topic}: expert insights, practical strategies, and industry best practices for ${category} professionals.`,
    metaKeywords: keywords,
    excerpt: `Discover comprehensive insights on ${topic} with practical strategies, expert analysis, and real-world applications.`,
    tags: keywords.slice(0, 5),
    readingTime,
    seoData: {
      title: `${topic}: Complete Guide & Best Practices`,
      description: `Expert guide to ${topic}: strategies, implementation, trends, and best practices for ${category} success.`,
      keywords: keywords,
    },
  };
}

async function testFallbackContent() {
  console.log('Testing fallback content generation...');
  
  try {
    const request = {
      topic: 'Sustainable Energy Solutions for Modern Cities',
      keywords: ['renewable energy', 'urban sustainability', 'green technology', 'smart grids', 'carbon reduction'],
      category: 'environment'
    };
    
    console.log('Generating content for:', request.topic);
    console.log('Category:', request.category);
    console.log('Keywords:', request.keywords.join(', '));
    
    const result = generateFallbackContent(request);
    
    console.log('\n=== CONTENT GENERATION RESULTS ===');
    console.log('Title:', result.title);
    console.log('Word Count:', result.content.split(' ').length);
    console.log('Reading Time:', result.readingTime);
    console.log('Meta Description:', result.metaDescription);
    console.log('Tags:', result.tags.join(', '));
    
    console.log('\n=== CONTENT PREVIEW (first 1000 chars) ===');
    console.log(result.content.substring(0, 1000) + '...');
    
    console.log('\n=== CONTENT SECTION COUNT ===');
    const sections = result.content.split('##').length - 1;
    console.log('Number of sections (##):', sections);
    
    const subsections = result.content.split('###').length - 1;
    console.log('Number of subsections (###):', subsections);
    
  } catch (error) {
    console.error('Error testing content generation:', error);
  }
}

testFallbackContent();
