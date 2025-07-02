'use client';

import React from 'react';
import Link from 'next/link';
import { useCategoryCounts } from '@/hooks/useStats';

interface CategoryInfo {
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
}

// Static category definitions
const categoryDefinitions: CategoryInfo[] = [
  {
    name: 'Technology',
    slug: 'technology',
    description: 'Latest tech trends, AI, software development, and digital innovation.',
    icon: '💻',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Business',
    slug: 'business',
    description: 'Entrepreneurship, market insights, startup stories, and business strategies.',
    icon: '📈',
    color: 'from-green-500 to-emerald-500',
  },
  {
    name: 'Health',
    slug: 'health',
    description: 'Wellness tips, medical breakthroughs, fitness, and mental health.',
    icon: '🏥',
    color: 'from-red-500 to-pink-500',
  },
  {
    name: 'Lifestyle',
    slug: 'lifestyle',
    description: 'Travel, food, culture, entertainment, and personal development.',
    icon: '🌟',
    color: 'from-purple-500 to-indigo-500',
  },
  {
    name: 'Finance',
    slug: 'finance',
    description: 'Investment strategies, financial planning, market analysis, and economic insights.',
    icon: '💰',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    name: 'Science',
    slug: 'science',
    description: 'Scientific discoveries, research breakthroughs, and innovation in various fields.',
    icon: '🔬',
    color: 'from-teal-500 to-blue-500',
  },
  {
    name: 'Environment',
    slug: 'environment',
    description: 'Climate change, sustainability, conservation, and environmental solutions.',
    icon: '🌱',
    color: 'from-emerald-500 to-green-500',
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

  // Combine static definitions with dynamic counts
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
            {/* Gradient background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
            
            {/* Content */}
            <div className="relative p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
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

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {category.name}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                {category.description}
              </p>

              {/* Footer */}
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

              {/* Status indicator for categories with no content */}
              {category.articles === 0 && (
                <div className="absolute top-4 right-4">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                    Coming Soon
                  </span>
                </div>
              )}

              {/* Popular indicator for categories with lots of content */}
              {category.articles >= 5 && (
                <div className="absolute top-4 right-4">
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    Popular
                  </span>
                </div>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
