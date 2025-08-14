import Link from 'next/link';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { formatDate } from '@/lib/utils/utils';
import BookmarkButton from '@/components/ui/BookmarkButton';
interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  readingTime: number;
  tags: string[];
  ogImage?: string;
  author: string;
}
interface ArticleGridProps {
  searchParams: {
    search?: string;
    category?: string;
    page?: string;
  };
}
async function getArticles(searchParams: ArticleGridProps['searchParams']) {
  const params = new URLSearchParams();
  if (searchParams.search) params.append('search', searchParams.search);
  if (searchParams.category) params.append('category', searchParams.category);
  if (searchParams.page) params.append('page', searchParams.page);
  params.append('limit', '12');
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
  try {
    const response = await fetch(`${baseUrl}/api/articles?${params}`, {
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch articles');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching articles:', error);
    return { articles: [], pagination: { page: 1, pages: 1, total: 0 } };
  }
}
export default async function ArticleGrid({ searchParams }: ArticleGridProps) {
  const { articles, pagination } = await getArticles(searchParams);
  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
          <p className="text-gray-500">
            {searchParams.search
              ? `No articles found for "${searchParams.search}"`
              : 'No articles available at the moment.'}
          </p>
        </div>
      </div>
    );
  }
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {articles.map((article: Article) => (
          <ArticleCard key={article._id} article={article} />
        ))}
      </div>
      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center">
          <nav className="flex items-center space-x-2">
            {pagination.page > 1 && (
              <Link
                href={`/?${new URLSearchParams({
                  ...searchParams,
                  page: (pagination.page - 1).toString(),
                }).toString()}`}
                className="px-3 py-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Previous
              </Link>
            )}
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pageNum) => (
              <Link
                key={pageNum}
                href={`/?${new URLSearchParams({
                  ...searchParams,
                  page: pageNum.toString(),
                }).toString()}`}
                className={`px-3 py-2 border rounded-md ${
                  pageNum === pagination.page
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </Link>
            ))}
            {pagination.page < pagination.pages && (
              <Link
                href={`/?${new URLSearchParams({
                  ...searchParams,
                  page: (pagination.page + 1).toString(),
                }).toString()}`}
                className="px-3 py-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Next
              </Link>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
      {article.ogImage && (
        <div className="aspect-video relative overflow-hidden">
          <img
            src={article.ogImage}
            alt={article.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
            {article.category}
          </span>
          <span>â€¢</span>
          <span>{formatDate(new Date(article.publishedAt))}</span>
          <span>â€¢</span>
          <span>{article.readingTime} min read</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600">
          <Link href={`/article/${article.slug}`}>
            {article.title}
          </Link>
        </h2>
        <p className="text-gray-600 mb-4 line-clamp-3">
          {article.excerpt}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {article.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <BookmarkButton
              articleId={article._id}
              articleTitle={article.title}
              articleSlug={article.slug}
              articleExcerpt={article.excerpt}
              articleCategory={article.category}
              articleImage={article.ogImage}
              className="flex-shrink-0"
            />
            <Link
              href={`/article/${article.slug}`}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              Read More â†’
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}