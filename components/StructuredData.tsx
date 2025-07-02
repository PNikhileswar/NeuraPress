'use client';

import { useEffect } from 'react';

interface StructuredDataProps {
  type: 'WebSite' | 'Article' | 'BlogPosting' | 'SearchAction';
  data: any;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  useEffect(() => {
    let structuredData: any = {};

    switch (type) {
      case 'WebSite':
        structuredData = {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'TrendWise',
          description: 'AI-powered content platform for trending topics and insights',
          url: 'https://trendwise.com',
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: 'https://trendwise.com/?search={search_term_string}',
            },
            'query-input': 'required name=search_term_string',
          },
          ...data,
        };
        break;

      case 'Article':
      case 'BlogPosting':
        structuredData = {
          '@context': 'https://schema.org',
          '@type': type,
          headline: data.title,
          description: data.description,
          author: {
            '@type': 'Organization',
            name: 'TrendWise AI',
          },
          publisher: {
            '@type': 'Organization',
            name: 'TrendWise',
            logo: {
              '@type': 'ImageObject',
              url: 'https://trendwise.com/logo.png',
            },
          },
          datePublished: data.publishedAt,
          dateModified: data.updatedAt || data.publishedAt,
          image: data.image,
          url: data.url,
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': data.url,
          },
          keywords: data.keywords?.join(', '),
          articleSection: data.category,
          wordCount: data.wordCount,
          timeRequired: `PT${data.readingTime}M`,
          ...data,
        };
        break;

      case 'SearchAction':
        structuredData = {
          '@context': 'https://schema.org',
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://trendwise.com/?search={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
          ...data,
        };
        break;

      default:
        return;
    }

    // Add or update structured data script
    const existingScript = document.querySelector(`script[data-structured-data="${type}"]`);
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-structured-data', type);
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.querySelector(`script[data-structured-data="${type}"]`);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [type, data]);

  return null; // This component doesn't render anything visible
}
