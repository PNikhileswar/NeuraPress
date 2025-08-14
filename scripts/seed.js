const { MongoClient } = require('mongodb');
const sampleArticles = [
  {
    title: "The Future of Artificial Intelligence in 2025",
    slug: "future-artificial-intelligence-2025",
    excerpt: "Exploring the latest developments in AI technology and what to expect in the coming year.",
    content: `# The Future of Artificial Intelligence in 2025
Artificial Intelligence continues to evolve at an unprecedented pace, reshaping industries and transforming how we interact with technology. As we look ahead to 2025, several key trends are emerging that will define the AI landscape.
## Key Developments
### 1. Large Language Models
The evolution of large language models like GPT-4 and beyond continues to push the boundaries of what's possible with natural language processing.
### 2. AI in Healthcare
Medical AI applications are becoming more sophisticated, offering personalized treatment recommendations and early disease detection.
### 3. Autonomous Systems
Self-driving cars and autonomous robots are moving closer to mainstream adoption, promising to revolutionize transportation and logistics.
## Challenges and Opportunities
While AI presents incredible opportunities, we must also address important challenges around ethics, bias, and job displacement.
The future of AI is bright, but it requires careful consideration of its impact on society and the economy.`,
    metaDescription: "Discover the latest AI trends and developments shaping the future of technology in 2025.",
    metaKeywords: ["artificial intelligence", "AI trends", "technology", "future tech", "machine learning"],
    author: "NeuraPress AI",
    category: "technology",
    tags: ["AI", "technology", "future", "innovation"],
    readingTime: 5,
    featured: true,
    media: {
      images: [],
      videos: [],
      tweets: []
    },
    seoData: {
      title: "The Future of Artificial Intelligence in 2025 | AI Trends",
      description: "Discover the latest AI trends and developments shaping the future of technology in 2025.",
      keywords: ["artificial intelligence", "AI trends", "technology", "future tech"]
    }
  },
  {
    title: "Sustainable Business Practices: A Guide for Modern Companies",
    slug: "sustainable-business-practices-guide",
    excerpt: "How companies can implement eco-friendly practices while maintaining profitability and growth.",
    content: `# Sustainable Business Practices: A Guide for Modern Companies
In today's business environment, sustainability is no longer optionalâ€”it's essential for long-term success and corporate responsibility.
## Why Sustainability Matters
- **Environmental Impact**: Reducing carbon footprint and resource consumption
- **Consumer Demand**: Modern consumers prefer eco-conscious brands
- **Cost Savings**: Sustainable practices often reduce operational costs
- **Regulatory Compliance**: Meeting evolving environmental regulations
## Key Areas of Focus
### Energy Efficiency
Implementing renewable energy sources and optimizing energy consumption across operations.
### Waste Reduction
Developing circular economy principles and minimizing waste in production processes.
### Supply Chain Transparency
Working with suppliers who share your sustainability values and standards.
### Employee Engagement
Creating a culture of sustainability throughout your organization.
## Implementation Strategy
Start with an audit of current practices, set measurable goals, and track progress regularly. Remember, sustainability is a journey, not a destination.`,
    metaDescription: "Learn how to implement sustainable business practices that benefit both the environment and your bottom line.",
    metaKeywords: ["sustainability", "business practices", "eco-friendly", "corporate responsibility", "green business"],
    author: "NeuraPress AI",
    category: "business",
    tags: ["sustainability", "business", "environment", "corporate responsibility"],
    readingTime: 4,
    featured: false,
    media: {
      images: [],
      videos: [],
      tweets: []
    },
    seoData: {
      title: "Sustainable Business Practices Guide | Green Business Strategy",
      description: "Learn how to implement sustainable business practices that benefit both the environment and your bottom line.",
      keywords: ["sustainability", "business practices", "eco-friendly", "corporate responsibility"]
    }
  },
  {
    title: "Mental Health in the Digital Age: Finding Balance",
    slug: "mental-health-digital-age-balance",
    excerpt: "Strategies for maintaining mental wellness while navigating our increasingly connected world.",
    content: `# Mental Health in the Digital Age: Finding Balance
Our relationship with technology has fundamentally changed how we live, work, and connect with others. While digital tools offer incredible benefits, they also present new challenges for mental health and well-being.
## The Digital Dilemma
### Benefits of Technology
- **Connection**: Staying in touch with loved ones across distances
- **Access to Information**: Learning and growth opportunities
- **Convenience**: Streamlined daily tasks and activities
- **Entertainment**: Rich media and interactive experiences
### Potential Challenges
- **Information Overload**: Constant stream of news and updates
- **Social Comparison**: Unrealistic standards from social media
- **Screen Time**: Excessive use affecting sleep and physical health
- **Digital Addiction**: Compulsive technology use patterns
## Strategies for Digital Wellness
### 1. Set Boundaries
Create specific times for device use and establish tech-free zones in your home.
### 2. Practice Mindful Consumption
Be intentional about the content you consume and how it makes you feel.
### 3. Regular Digital Detoxes
Take breaks from screens to reconnect with the physical world.
### 4. Prioritize Sleep
Avoid screens before bedtime and create a relaxing nighttime routine.
## Building Healthy Habits
Remember that technology should enhance your life, not control it. Finding the right balance is key to maintaining good mental health in our digital world.`,
    metaDescription: "Discover practical strategies for maintaining mental wellness and finding balance in our digital world.",
    metaKeywords: ["mental health", "digital wellness", "technology balance", "screen time", "mindfulness"],
    author: "NeuraPress AI",
    category: "health",
    tags: ["mental health", "digital wellness", "balance", "mindfulness"],
    readingTime: 6,
    featured: true,
    media: {
      images: [],
      videos: [],
      tweets: []
    },
    seoData: {
      title: "Mental Health in the Digital Age: Finding Balance | Digital Wellness",
      description: "Discover practical strategies for maintaining mental wellness and finding balance in our digital world.",
      keywords: ["mental health", "digital wellness", "technology balance", "mindfulness"]
    }
  }
];
async function seedDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/neurapress';
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db();
    const collection = db.collection('articles');
    // Check if articles already exist
    const existingCount = await collection.countDocuments();
    if (existingCount > 0) {
      console.log(`Database already has ${existingCount} articles. Skipping seed.`);
      return;
    }
    // Insert sample articles
    const result = await collection.insertMany(sampleArticles);
    console.log(`Inserted ${result.insertedCount} sample articles`);
    // Create indexes
    await collection.createIndex({ slug: 1 }, { unique: true });
    await collection.createIndex({ title: 'text', content: 'text', tags: 'text' });
    await collection.createIndex({ publishedAt: -1 });
    await collection.createIndex({ category: 1 });
    console.log('Database indexes created successfully');
    console.log('ðŸŽ‰ Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
  }
}
// Run the seed function if this file is executed directly
if (require.main === module) {
  require('dotenv').config({ path: '.env.local' });
  seedDatabase();
}
module.exports = seedDatabase;