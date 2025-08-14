'use client';

import React from 'react';
import Link from 'next/link';
import { useCategoryCounts } from '@/hooks/useStats';

// Force refresh to fix emoji encoding

interface CategoryInfo {
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
}

const categoryDefinitions: CategoryInfo[] = [
  {
    name: 'Technology',
    slug: 'technology',
    description: 'Latest tech trends, AI, software development, and digital innovation.',
    icon: '\uD83D\uDCBB',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Business',
    slug: 'business',
    description: 'Entrepreneurship, market insights, startup stories, and business strategies.',
    icon: '\uD83D\uDCC8',
    color: 'from-green-500 to-emerald-500',
  },
  {
    name: 'Health',
    slug: 'health',
    description: 'Wellness tips, medical breakthroughs, fitness, and mental health.',
    icon: '\uD83C\uDFE5',
    color: 'from-red-500 to-pink-500',
  },
  {
    name: 'Science',
    slug: 'science',
    description: 'Scientific discoveries, research breakthroughs, and innovation in various fields.',
    icon: '\uD83D\uDD2C',
    color: 'from-teal-500 to-blue-500',
  },
  {
    name: 'Sports',
    slug: 'sports',
    description: 'Sports news, athlete profiles, game analysis, and fitness trends.',
    icon: '\u26BD',
    color: 'from-orange-500 to-red-500',
  },
  {
    name: 'Politics',
    slug: 'politics',
    description: 'Political news, policy analysis, government updates, and election coverage.',
    icon: '\uD83C\uDFDB\uFE0F',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    name: 'Entertainment',
    slug: 'entertainment',
    description: 'Movies, music, celebrities, TV shows, and pop culture trends.',
    icon: '\uD83C\uDFAC',
    color: 'from-pink-500 to-purple-500',
  },
  {
    name: 'Environment',
    slug: 'environment',
    description: 'Climate change, sustainability, conservation, and environmental solutions.',
    icon: '\uD83C\uDF31',
    color: 'from-emerald-500 to-green-500',
  },
  {
    name: 'Finance',
    slug: 'finance',
    description: 'Investment strategies, financial planning, market analysis, and economic insights.',
    icon: '\uD83D\uDCB0',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    name: 'Lifestyle',
    slug: 'lifestyle',
    description: 'Travel, food, culture, fashion, and personal development.',
    icon: '\uD83C\uDF1F',
    color: 'from-purple-500 to-indigo-500',
  },
];

export default function DynamicCategoriesGrid() {
  const { counts, loading } = useCategoryCounts();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categoryDefinitions.map((category) => (
          <div key={category.slug} className="animate-pulse">
            <div className="bg-gray-200 rounded-xl h-64"></div>
          </div>
        ))}
      </div>
    );
  }

  const categoriesWithCounts = categoryDefinitions.map(cat => ({
    ...cat,
    articles: counts[cat.slug] || 0
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {categoriesWithCounts.map((category) => (
        <Link
          key={category.slug}
          href={`/?category=${category.slug}`}
          className="group block"
        >
          <div className="relative overflow-hidden rounded-xl bg-white border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
            
            <div className="relative p-6">
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {category.articles === 0 && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium shadow-sm">
                    Coming Soon
                  </span>
                )}
                {category.articles >= 5 && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium shadow-sm">
                    \uD83D\uDD25 Popular
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between mb-4 pt-2">
                <div className="text-4xl">{category.icon}</div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {category.articles}
                  </div>
                  <div className="text-sm text-gray-500">
                    {category.articles === 1 ? 'article' : 'articles'}
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {category.name}
              </h3>

              <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                {category.description}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-blue-600 font-medium text-sm group-hover:text-blue-700 transition-colors">
                  Explore {category.name} →
                </span>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-gray-200 rounded-full group-hover:bg-blue-600 transition-colors"
                      style={{ transitionDelay: `${i * 50}ms` }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}