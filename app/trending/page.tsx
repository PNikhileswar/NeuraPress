import { Metadata } from 'next';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Trending Topics - TrendWise',
  description: 'Discover trending topics that could become new articles. Generate AI-powered content from current trends.',
};

interface TrendingTopic {
  topic: string;
  category: string;
  keywords: string[];
  popularity: number;
  source: 'google' | 'twitter';
}

async function getTrendingTopics() {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
  
  try {
    const response = await fetch(`${baseUrl}/api/trending`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch trending topics');
    }

    const topics = await response.json();
    return Array.isArray(topics) ? topics : [];
  } catch (error) {
    console.error('Error fetching trending topics:', error);
    return [];
  }
}

export default async function TrendingPage() {
  const topics = await getTrendingTopics();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Trending Topic Suggestions
            </h1>
            <p className="text-xl text-purple-100 mb-4">
              Discover trending topics that could become new AI-generated articles
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
              <p className="text-sm text-purple-100">
                💡 <strong>How it works:</strong> These are trending topics from Google Trends and social media that our AI can turn into comprehensive articles for your blog.
              </p>
            </div>
            <Link
              href="/admin"
              className="inline-block bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors mr-4"
            >
              Generate Articles
            </Link>
            <Link
              href="/"
              className="inline-block bg-purple-500/20 text-white border border-white/30 px-8 py-3 rounded-lg font-semibold hover:bg-purple-500/30 transition-colors"
            >
              View Existing Articles
            </Link>
          </div>
        </div>
      </section>

      {/* Trending Topics Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Current Trending Topic Suggestions</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-blue-900 mb-1">About Trending Topics</h3>
                <p className="text-sm text-blue-800">
                  These are <strong>trending topics from external sources</strong> (Google Trends, social media) that our AI can transform into full articles for your blog. 
                  They are <strong>not existing articles</strong> but <strong>content suggestions</strong> ready to be generated.
                </p>
              </div>
            </div>
          </div>
          <p className="text-gray-600">
            {topics.length} trending topic suggestions available for article generation
          </p>
        </div>

        {topics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topics.map((topic: TrendingTopic, index: number) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {topic.category}
                  </span>
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">
                      {Math.round(topic.popularity / 10000)}/10
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                  {topic.topic}
                </h3>

                <p className="text-gray-600 mb-4 line-clamp-3">
                  <strong>Keywords:</strong> {topic.keywords.slice(0, 3).join(', ')}
                  <br />
                  <strong>Trending source:</strong> {topic.source}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    {topic.popularity.toLocaleString()} searches
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    Ready to Generate
                  </span>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/admin?topic=${encodeURIComponent(topic.topic)}&category=${topic.category}`}
                    className="flex-1 text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    🤖 Generate Article
                  </Link>
                  <Link
                    href={`/category/${topic.category.toLowerCase()}`}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    View {topic.category}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Trending Topics</h3>
              <p className="text-gray-600 mb-6">
                No trending topics are currently available. Generate some new content to get started.
              </p>
              <Link
                href="/admin"
                className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Admin Dashboard
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Want to Create Content?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Our AI can generate high-quality articles based on trending topics. 
            Join thousands of content creators using TrendWise.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/"
              className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
            >
              Browse Articles
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
