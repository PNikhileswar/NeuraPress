import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';

interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  readingTime: number;
  ogImage?: string;
}

interface RelatedArticlesProps {
  category: string;
  currentSlug: string;
}

async function getRelatedArticles(category: string, currentSlug: string): Promise<Article[]> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  try {
    const response = await fetch(`${baseUrl}/api/articles?category=${category}&limit=4`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch related articles');
    }

    const data = await response.json();
    // Filter out the current article
    return data.articles.filter((article: Article) => article.slug !== currentSlug).slice(0, 3);
  } catch (error) {
    console.error('Error fetching related articles:', error);
    return [];
  }
}

export default async function RelatedArticles({ category, currentSlug }: RelatedArticlesProps) {
  const relatedArticles = await getRelatedArticles(category, currentSlug);

  if (relatedArticles.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 border-t border-gray-200 pt-12">
      <h3 className="text-2xl font-bold text-gray-900 mb-8">Related Articles</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {relatedArticles.map((article) => (
          <RelatedArticleCard key={article._id} article={article} />
        ))}
      </div>
    </section>
  );
}

function RelatedArticleCard({ article }: { article: Article }) {
  return (
    <article className="group">
      <Link href={`/article/${article.slug}`}>
        <div className="aspect-video relative overflow-hidden rounded-lg mb-4">
          {article.ogImage ? (
            <Image
              src={article.ogImage}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="text-gray-500 text-center">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <span className="text-sm">{article.category}</span>
              </div>
            </div>
          )}
        </div>
      </Link>

      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-500 space-x-2">
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium capitalize">
            {article.category}
          </span>
          <span>•</span>
          <span>{formatDate(new Date(article.publishedAt))}</span>
          <span>•</span>
          <span>{article.readingTime} min</span>
        </div>

        <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
          <Link href={`/article/${article.slug}`}>
            {article.title}
          </Link>
        </h4>

        <p className="text-gray-600 text-sm line-clamp-2">
          {article.excerpt}
        </p>

        <Link
          href={`/article/${article.slug}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm mt-2"
        >
          Read More
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  );
}
