import { Metadata } from 'next';
import ArticleGrid from '@/components/ArticleGrid';
import Hero from '@/components/Hero';
import FeaturedArticles from '@/components/FeaturedArticles';
import SearchBar from '@/components/SearchBar';
import StructuredData from '@/components/StructuredData';
import StatsWidget from '@/components/StatsWidget';

export const metadata: Metadata = {
  title: 'TrendWise - AI-Powered Content & Trending Topics',
  description: 'Discover AI-generated articles and trending topics. Search through comprehensive content on technology, business, health, and lifestyle.',
  keywords: ['AI content', 'trending topics', 'technology articles', 'business insights', 'search articles'],
  openGraph: {
    title: 'TrendWise - AI-Powered Content Platform',
    description: 'Discover AI-generated articles and trending topics across multiple categories',
    type: 'website',
    siteName: 'TrendWise',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TrendWise - AI-Powered Content Platform',
    description: 'Discover AI-generated articles and trending topics',
  },
  alternates: {
    canonical: '/',
  },
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: { search?: string; category?: string; page?: string };
}) {
  const currentUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}`;
  
  return (
    <div className="min-h-screen">
      <StructuredData 
        type="WebSite" 
        data={{
          name: 'TrendWise',
          description: 'AI-powered content platform for trending topics and insights',
          url: currentUrl,
        }} 
      />
      
      <Hero />
      
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Search Section */}
        <section className="mb-12">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Search Our Content Library
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find articles on technology, business, health, and lifestyle. Use keywords like "AI", "machine learning", or "remote work" to discover relevant content.
            </p>
          </div>
          <SearchBar initialSearch={searchParams.search} />
          
          {/* Quick Search Suggestions */}
          {!searchParams.search && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 mb-3">Popular searches:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['AI', 'Machine Learning', 'Remote Work', 'Digital Transformation', 'Quantum Computing'].map((term) => (
                  <a
                    key={term}
                    href={`/?search=${encodeURIComponent(term)}`}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-blue-100 hover:text-blue-700 transition-colors"
                  >
                    {term}
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>

        <FeaturedArticles />
        
        {/* Live Stats Widget */}
        <section className="mt-12">
          <StatsWidget className="mb-8" />
        </section>
        
        <section id="latest-articles" className="mt-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {searchParams.search ? `Search Results for "${searchParams.search}"` : 'Latest Articles'}
              </h2>
              <p className="text-gray-600">
                {searchParams.search 
                  ? 'AI-generated articles matching your search query'
                  : 'Discover our latest AI-generated content across all categories'
                }
              </p>
            </div>
            
            {!searchParams.search && (
              <div className="hidden sm:flex items-center gap-4">
                <a 
                  href="/trending" 
                  className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  View Trending Topics
                </a>
                <a 
                  href="/categories" 
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Browse Categories
                </a>
              </div>
            )}
          </div>
          
          <ArticleGrid 
            searchParams={searchParams}
          />
        </section>
        
        {/* Information Section for No Results */}
        <section className="mt-16 bg-gray-50 rounded-xl p-8">
          <div className="text-center max-w-3xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Looking for New Content?
            </h3>
            <p className="text-gray-600 mb-6">
              If you can't find what you're looking for, check out our trending topics page where you can discover new content suggestions and generate fresh articles using AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/trending"
                className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Explore Trending Topics
              </a>
              <a
                href="/admin"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Generate New Article
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
