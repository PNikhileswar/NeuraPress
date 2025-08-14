import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { formatDate } from '@/lib/utils/utils';
import CommentSection from '@/components/features/CommentSection';
import ShareButtons from '@/components/ui/ShareButtons';
import RelatedArticles from '@/components/features/RelatedArticles';
import MediaSection from '@/components/features/MediaSection';
import BookmarkButton from '@/components/ui/BookmarkButton';

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
  media: {
    images: Array<{
      id: string;
      url: string;
      thumbnailUrl?: string;
      title?: string;
      description?: string;
      source: 'unsplash' | 'pexels' | 'vimeo';
      type: 'image' | 'video';
      tags: string[];
      relevanceScore: number;
      metadata: {
        width?: number;
        height?: number;
        duration?: number;
        photographer?: string;
        publishedAt?: string;
        license?: string;
      };
    }>;
    videos: Array<{
      id: string;
      url: string;
      thumbnailUrl?: string;
      title?: string;
      description?: string;
      source: 'unsplash' | 'pexels' | 'vimeo';
      type: 'image' | 'video';
      tags: string[];
      relevanceScore: number;
      metadata: {
        width?: number;
        height?: number;
        duration?: number;
        photographer?: string;
        publishedAt?: string;
        license?: string;
      };
    }>;
    tweets: string[];
  };
  seoData: {
    title: string;
    description: string;
    keywords: string[];
  };
}

async function getArticle(slug: string): Promise<Article | null> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
  
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

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';

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
      name: 'NeuraPress',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/logo.png`,
      },
    },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/article/${article.slug}`,
    },
    image: article.ogImage || `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/og-image.jpg`,
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
            <Link href="/" className="hover:text-gray-700">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link
              href={`/category/${article.category}`}
              className="hover:text-gray-700 capitalize"
            >
              {article.category}
            </Link>
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
                unoptimized={true}
              />
            </div>
          )}

          {/* Share Buttons and Bookmark */}
          <div className="flex items-center justify-between">
            <ShareButtons article={article} />
            <BookmarkButton
              articleId={article._id}
              articleTitle={article.title}
              articleSlug={article.slug}
              articleExcerpt={article.excerpt}
              articleCategory={article.category}
              articleImage={article.ogImage}
            />
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-lg max-w-none mb-12 bg-white rounded-lg p-8 shadow-sm">
          <ReactMarkdown
            rehypePlugins={[rehypeRaw]}
            components={{
              p: ({ node, children, ...props }) => {
                // Check if p contains only img or has an iframe inside
                const hasImg = node?.children?.length === 1 && 
                  'tagName' in node.children[0] && 
                  node.children[0].tagName === 'img';
                
                const hasBlockElement = node?.children?.some(
                  child => 'tagName' in child && 
                  (child.tagName === 'iframe' || child.tagName === 'div')
                );
                
                if (hasImg || hasBlockElement) {
                  // Return children directly without p wrapper to avoid nesting issues
                  return <>{children}</>;
                }
                return <p {...props}>{children}</p>;
              },
              img: ({ src, alt, ...props }) => (
                <div className="my-8">
                  <Image
                    src={src || ''}
                    alt={alt || ''}
                    width={800}
                    height={600}
                    className="rounded-xl shadow-lg w-full object-cover"
                    style={{ maxHeight: '500px' }}
                    unoptimized={true}
                  />
                </div>
              ),
              iframe: ({ node, src, ...props }) => {
                // Render iframes normally
                return (
                  <div className="my-8 aspect-video relative w-full overflow-hidden rounded-lg shadow-lg">
                    <iframe
                      src={src}
                      {...props}
                      className="absolute inset-0 w-full h-full border-0"
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                );
              },
              div: ({ className, children, ...props }) => {
                // Handle video containers
                if (className === 'video-container') {
                  return (
                    <div className="video-container my-8 aspect-video relative w-full overflow-hidden rounded-lg shadow-lg" {...props}>
                      {children}
                    </div>
                  );
                }
                return <div className={className} {...props}>{children}</div>;
              }
            }}
          >
            {article.content}
          </ReactMarkdown>
        </div>

        {/* Rich Media Section - Removed */}

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
            <div className="flex items-center gap-4">
              <BookmarkButton
                articleId={article._id}
                articleTitle={article.title}
                articleSlug={article.slug}
                articleExcerpt={article.excerpt}
                articleCategory={article.category}
                articleImage={article.ogImage}
              />
              <ShareButtons article={article} compact />
            </div>
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
