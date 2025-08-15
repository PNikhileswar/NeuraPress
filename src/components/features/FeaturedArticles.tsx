import Link from 'next/link';
import { formatDate } from '@/lib/utils/utils';
interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  readingTime: number;
  ogImage?: string;
  featured: boolean;
}
async function getFeaturedArticles() {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
  try {
    const response = await fetch(`${baseUrl}/api/articles?featured=true&limit=3`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch featured articles');
    }
    const data = await response.json();
    return data.articles || [];
  } catch (error) {
    console.error('Error fetching featured articles:', error);
    return [];
  }
}
export default async function FeaturedArticles() {
  const featuredArticles = await getFeaturedArticles();
  if (featuredArticles.length === 0) {
    return null;
  }
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Featured Articles</h2>
        <Link
          href="/featured"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          View All Featured  ←’
        </Link>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {featuredArticles.map((article: Article, index: number) => (
          <FeaturedArticleCard
            key={article._id}
            article={article}
            isLarge={index === 0}
          />
        ))}
      </div>
    </section>
  );
}
function FeaturedArticleCard({ article, isLarge }: { article: Article; isLarge: boolean }) {
  return (
    <article
      className={`group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${
        isLarge ? 'lg:col-span-2 lg:row-span-2' : ''
      }`}
    >
      <div className={`relative ${isLarge ? 'h-96' : 'h-64'} overflow-hidden`}>
        {article.ogImage ? (
          <img
            src={article.ogImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <div className="text-white text-center p-8">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold">{article.category}</h3>
            </div>
          </div>
        )}
        {/* Enhanced Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        {/* Featured Badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
            \u2B50 Featured
          </span>
        </div>
      </div>
      {/* Content - Enhanced for better visibility */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white bg-gradient-to-t from-black/90 to-transparent">
        <div className="flex items-center space-x-2 text-sm mb-3">
          <span className="bg-white bg-opacity-30 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-white">
            {article.category}
          </span>
          <span className="text-white">•</span>
          <span className="text-gray-100">{formatDate(new Date(article.publishedAt))}</span>
          <span className="text-white">•</span>
          <span className="text-gray-100">{article.readingTime} min read</span>
        </div>
        <h3 className={`font-bold mb-3 line-clamp-2 text-white drop-shadow-lg ${isLarge ? 'text-2xl' : 'text-lg'}`}>
          <Link href={`/article/${article.slug}`} className="hover:text-gray-200 transition-colors">
            {article.title}
          </Link>
        </h3>
        <p className={`text-gray-100 line-clamp-2 drop-shadow-md ${isLarge ? 'text-base' : 'text-sm'}`}>
          {article.excerpt}
        </p>
        <div className="mt-4">
          <Link
            href={`/article/${article.slug}`}
            className="inline-flex items-center text-yellow-300 hover:text-yellow-200 font-medium text-sm drop-shadow-md"
          >
            Read Full Article
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}