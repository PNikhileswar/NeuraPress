'use client';
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
const ManualTopicSubmission: React.FC = () => {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    topic: '',
    category: 'general',
    keywords: '',
    priority: 'high',
    generateArticle: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const categories = [
    'technology', 'business', 'health', 'science', 'sports',
    'politics', 'entertainment', 'environment', 'finance',
    'lifestyle', 'general'
  ];
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.isAdmin) {
      alert('Admin access required');
      return;
    }
    setIsSubmitting(true);
    setResult(null);
    try {
      const response = await fetch('/api/trending/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: formData.topic,
          category: formData.category,
          keywords: formData.keywords ? formData.keywords.split(',').map(k => k.trim()) : [],
          priority: formData.priority,
          generateArticle: formData.generateArticle,
        }),
      });
      const data = await response.json();
      setResult(data);
      if (response.ok) {
        // Reset form on success
        setFormData({
          topic: '',
          category: 'general',
          keywords: '',
          priority: 'high',
          generateArticle: true,
        });
      }
    } catch (error) {
      setResult({
        error: 'Failed to submit topic',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  if (!session?.user?.isAdmin) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-medium">Access Denied</h3>
        <p className="text-red-600">Admin privileges required to submit manual topics.</p>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Submit Breaking News Topic</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
            News Topic / Headline *
          </label>
          <input
            type="text"
            id="topic"
            required
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 'Major Breakthrough in Quantum Computing Announced by IBM'"
          />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-1">
            Keywords (comma-separated)
          </label>
          <input
            type="text"
            id="keywords"
            value={formData.keywords}
            onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., quantum computing, IBM, technology, breakthrough"
          />
          <p className="text-xs text-gray-500 mt-1">Leave empty to auto-generate from topic</p>
        </div>
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priority Level
          </label>
          <select
            id="priority"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="high">High (Featured, Breaking News)</option>
            <option value="medium">Medium (Regular Priority)</option>
            <option value="low">Low (Background News)</option>
          </select>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="generateArticle"
            checked={formData.generateArticle}
            onChange={(e) => setFormData({ ...formData, generateArticle: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="generateArticle" className="ml-2 block text-sm text-gray-700">
            Generate full article immediately
          </label>
        </div>
        <button
          type="submit"
          disabled={isSubmitting || !formData.topic}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Topic'}
        </button>
      </form>
      {result && (
        <div className={`mt-6 p-4 rounded-lg ${result.error ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
          {result.error ? (
            <div>
              <h3 className="text-red-800 font-medium">Error</h3>
              <p className="text-red-600">{result.error}</p>
              {result.details && <p className="text-red-500 text-sm mt-1">{result.details}</p>}
            </div>
          ) : (
            <div>
              <h3 className="text-green-800 font-medium">Success!</h3>
              <p className="text-green-600">{result.message}</p>
              {result.article && (
                <div className="mt-2">
                  <p className="text-sm text-green-700">
                    Generated article: <strong>{result.article.title}</strong>
                  </p>
                  <a 
                    href={`/article/${result.article.slug}`}
                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Article
                  </a>
                </div>
              )}
              {result.warning && (
                <p className="text-amber-600 text-sm mt-1">âš ï¸ {result.warning}</p>
              )}
            </div>
          )}
        </div>
      )}
      <div className="mt-8 bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-800 mb-2">How to Use</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>â€¢ Enter breaking news topics or important events you want covered</li>
          <li>â€¢ High priority topics will be featured and generated first</li>
          <li>â€¢ System automatically checks for duplicate content</li>
          <li>â€¢ Generated articles include relevant images and SEO optimization</li>
          <li>â€¢ Articles are published immediately when generated</li>
        </ul>
      </div>
    </div>
  );
};
export default ManualTopicSubmission;