import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  readingTime: number;
  publishedAt: string;
  ogImage?: string;
  featured: boolean;
}
async function getFeaturedArticles(): Promise<Article[]> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'https://neura-press.vercel.app';
    const response = await fetch(`${baseUrl}/api/articles?featured=true&limit=50`, {
      next: { revalidate: 300 } // Cache for 5 minutes
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
export const metadata: Metadata = {
  title: 'Featured Articles | NeuraPress',
  description: 'Discover our most popular and trending articles across technology, health, business, and lifestyle topics.',
  keywords: ['featured articles', 'trending topics', 'popular content', 'NeuraPress'],
};
function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {article.ogImage && (
        <div className="relative h-48 w-full">
          <img
            src={article.ogImage}
            alt={article.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute top-4 left-4">
            <span className="inline-block bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded">
              Featured
            </span>
          </div>
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center gap-4 mb-3">
          <span className="inline-block bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full capitalize">
            {article.category}
          </span>
          <span className="text-gray-500 text-sm">
            {article.readingTime} min read
          </span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
          <Link href={`/article/${article.slug}`}>
            {article.title}
          </Link>
        </h2>
        <p className="text-gray-600 mb-4 line-clamp-3">
          {article.excerpt}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {article.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
          <Link
            href={`/article/${article.slug}`}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Read More â†’
          </Link>
        </div>
      </div>
    </article>
  );
}
export default async function FeaturedArticlesPage() {
  const featuredArticles = await getFeaturedArticles();
  if (!featuredArticles || featuredArticles.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Featured Articles</h1>
          <p className="text-gray-600 mb-8">No featured articles available at the moment.</p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Featured Articles</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Discover our most popular and trending articles covering the latest insights in technology, 
          health, business, and lifestyle.
        </p>
      </div>
      {/* Breadcrumb */}
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              Home
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Featured Articles</span>
            </div>
          </li>
        </ol>
      </nav>
      {/* Stats */}
      <div className="bg-blue-50 rounded-lg p-6 mb-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {featuredArticles.length} Featured Article{featuredArticles.length !== 1 ? 's' : ''}
          </h2>
          <p className="text-gray-600">
            Handpicked content showcasing the best insights and trends
          </p>
        </div>
      </div>
      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featuredArticles.map((article) => (
          <ArticleCard key={article._id} article={article} />
        ))}
      </div>
      {/* Back to Home */}
      <div className="text-center mt-12">
        <Link
          href="/"
          className="inline-block bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
        >
          â† Back to Home
        </Link>
      </div>
    </div>
  );
}