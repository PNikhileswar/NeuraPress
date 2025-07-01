'use client';

import { useState, useEffect } from 'react';

interface TrendingTopic {
  topic: string;
  category: string;
  keywords: string[];
  popularity: number;
  source: string;
}

interface Article {
  _id: string;
  title: string;
  slug: string;
  category: string;
  publishedAt: string;
  featured: boolean;
  tags: string[];
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [articles, setArticles] = useState<Article[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (activeTab === 'articles') {
      fetchArticles();
    } else if (activeTab === 'trending') {
      fetchTrendingTopics();
    }
  }, [activeTab]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/articles?limit=20');
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendingTopics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/trending');
      if (response.ok) {
        const data = await response.json();
        setTrendingTopics(data);
      }
    } catch (error) {
      console.error('Error fetching trending topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateArticlesFromTrends = async (maxAge = 7) => {
    setGenerating(true);
    try {
      const response = await fetch('/api/trending/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          count: 5,
          categories: ['technology', 'business', 'health'],
          maxAge: maxAge, // Only generate if no similar article in last X days
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Generated ${result.articles?.length || 0} new articles!${result.errors ? ` (${result.errors.length} errors)` : ''}`);
        if (activeTab === 'articles') {
          fetchArticles();
        }
      } else {
        const error = await response.json();
        alert(`Failed to generate articles: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error generating articles:', error);
      alert('Error generating articles');
    } finally {
      setGenerating(false);
    }
  };

  const toggleFeatured = async (articleId: string, featured: boolean) => {
    try {
      const article = articles.find(a => a._id === articleId);
      if (!article) return;

      const response = await fetch(`/api/articles/${article.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ featured: !featured }),
      });

      if (response.ok) {
        setArticles(articles.map(a => 
          a._id === articleId ? { ...a, featured: !featured } : a
        ));
      }
    } catch (error) {
      console.error('Error updating article:', error);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'articles', name: 'Articles', icon: '📝' },
    { id: 'trending', name: 'Trending Topics', icon: '🔥' },
    { id: 'generate', name: 'Generate Content', icon: '🤖' },
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Total Articles</h3>
                <p className="text-3xl font-bold text-blue-600">{articles.length}</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-2">Featured Articles</h3>
                <p className="text-3xl font-bold text-green-600">
                  {articles.filter(a => a.featured).length}
                </p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-900 mb-2">Categories</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {new Set(articles.map(a => a.category)).size}
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => generateArticlesFromTrends(7)}
                  disabled={generating}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
                >
                  {generating ? 'Generating...' : '🤖 Generate Articles (Skip Recent)'}
                </button>
                <button
                  onClick={() => generateArticlesFromTrends(1)}
                  disabled={generating}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  {generating ? 'Generating...' : '� Generate Articles (1 Day Check)'}
                </button>
                <p className="text-sm text-yellow-700">
                  Automatically create new articles based on current trending topics
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'articles' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Articles Management</h2>
              <button
                onClick={fetchArticles}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Title</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Category</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Published</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Featured</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {articles.map((article) => (
                      <tr key={article._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {article.title}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                            {article.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(article.publishedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleFeatured(article._id, article.featured)}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              article.featured
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {article.featured ? '⭐ Featured' : 'Not Featured'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <a
                            href={`/article/${article.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                          >
                            View
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'trending' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Trending Topics</h2>
              <button
                onClick={fetchTrendingTopics}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingTopics.map((topic, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-500 uppercase">
                        {topic.source}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {topic.popularity.toLocaleString()}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2">{topic.topic}</h3>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {topic.keywords.slice(0, 3).map((keyword) => (
                        <span
                          key={keyword}
                          className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs font-medium text-purple-600 capitalize">
                      {topic.category}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'generate' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Generate Content</h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                🤖 Auto-Generate from Trending Topics
              </h3>
              <p className="text-blue-800 mb-4">
                Automatically create high-quality articles based on current trending topics using AI.
              </p>
              <button
                onClick={() => generateArticlesFromTrends(7)}
                disabled={generating}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
              >
                {generating ? (
                  <>
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                    Generating Articles...
                  </>
                ) : (
                  'Generate 5 New Articles'
                )}
              </button>
              {generating && (
                <p className="text-sm text-blue-700 mt-2">
                  This may take a few minutes. Please don't close this page.
                </p>
              )}
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📝 Manual Article Creation
              </h3>
              <p className="text-gray-700 mb-4">
                Create articles manually with custom topics and content.
              </p>
              <button
                disabled
                className="bg-gray-400 text-white px-6 py-3 rounded-lg cursor-not-allowed font-medium"
              >
                Coming Soon
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
