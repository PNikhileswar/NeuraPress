import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { formatDate } from '@/lib/utils';
import CommentSection from '@/components/CommentSection';
import ShareButtons from '@/components/ShareButtons';
import RelatedArticles from '@/components/RelatedArticles';

interface Article {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  updatedAt: string;
  readingTime: number;
  tags: string[];
  author: string;
  ogImage?: string;
  seoData: {
    title: string;
    description: string;
    keywords: string[];
  };
}

async function getArticle(slug: string): Promise<Article | null> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  try {
    const response = await fetch(`${baseUrl}/api/articles/${slug}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = await getArticle(params.slug);

  if (!article) {
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found.',
    };
  }

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  return {
    title: article.seoData.title || article.title,
    description: article.seoData.description || article.excerpt,
    keywords: article.seoData.keywords.join(', '),
    authors: [{ name: article.author }],
    alternates: {
      canonical: `/article/${article.slug}`,
    },
    openGraph: {
      type: 'article',
      title: article.seoData.title || article.title,
      description: article.seoData.description || article.excerpt,
      url: `/article/${article.slug}`,
      authors: [article.author],
      tags: article.tags,
      images: article.ogImage
        ? [
            {
              url: article.ogImage,
              width: 1200,
              height: 630,
              alt: article.title,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.seoData.title || article.title,
      description: article.seoData.description || article.excerpt,
      images: article.ogImage ? [article.ogImage] : [],
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const article = await getArticle(params.slug);

  if (!article) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    author: {
      '@type': 'Organization',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'TrendWise',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/logo.png`,
      },
    },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/article/${article.slug}`,
    },
    image: article.ogImage || `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/og-image.jpg`,
    articleSection: article.category,
    keywords: article.tags.join(', '),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-4">
            <a href="/" className="hover:text-gray-700">Home</a>
            <span className="mx-2">/</span>
            <a
              href={`/?category=${article.category}`}
              className="hover:text-gray-700 capitalize"
            >
              {article.category}
            </a>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{article.title}</span>
          </nav>

          {/* Category Badge */}
          <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4 capitalize">
            {article.category}
          </span>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {article.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center text-gray-600 text-sm gap-4 mb-6">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              By {article.author}
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(new Date(article.publishedAt))}
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {article.readingTime} min read
            </div>
          </div>

          {/* Featured Image */}
          {article.ogImage && (
            <div className="aspect-video relative overflow-hidden rounded-lg mb-8">
              <Image
                src={article.ogImage}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Share Buttons */}
          <ShareButtons article={article} />
        </header>

        {/* Content */}
        <div className="prose prose-lg max-w-none mb-12 bg-white rounded-lg p-8 shadow-sm">
          <ReactMarkdown
            components={{
              img: ({ src, alt, ...props }) => (
                <div className="my-8">
                  <Image
                    src={src || ''}
                    alt={alt || ''}
                    width={800}
                    height={600}
                    className="rounded-xl shadow-lg w-full object-cover"
                    style={{ maxHeight: '500px' }}
                  />
                </div>
              ),
            }}
          >
            {article.content}
          </ReactMarkdown>
        </div>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <a
                  key={tag}
                  href={`/?search=${encodeURIComponent(tag)}`}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium transition-colors"
                >
                  #{tag}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Article Footer */}
        <footer className="border-t border-gray-200 pt-8 mb-12">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="text-sm text-gray-500">
              Last updated: {formatDate(new Date(article.updatedAt))}
            </div>
            <ShareButtons article={article} compact />
          </div>
        </footer>

        {/* Comments */}
        <CommentSection articleId={article._id} />

        {/* Related Articles */}
        <RelatedArticles category={article.category} currentSlug={article.slug} />
      </article>
    </>
  );
}
