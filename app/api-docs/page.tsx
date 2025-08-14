import { Metadata } from 'next';
import Link from 'next/link';
export const metadata: Metadata = {
  title: 'API Documentation - NeuraPress',
  description: 'Comprehensive API documentation for NeuraPress developers.',
};
export default function ApiDocsPage() {
  const endpoints = [
    {
      method: 'GET',
      path: '/api/articles',
      description: 'Fetch articles with optional filtering',
      params: ['limit', 'category', 'featured', 'search']
    },
    {
      method: 'GET',
      path: '/api/articles/[slug]',
      description: 'Get a specific article by slug'
    },
    {
      method: 'GET',
      path: '/api/stats',
      description: 'Get platform statistics and analytics'
    },
    {
      method: 'GET',
      path: '/api/trending',
      description: 'Get trending topics for article generation'
    },
    {
      method: 'POST',
      path: '/api/trending/generate',
      description: 'Generate articles from trending topics'
    },
    {
      method: 'POST',
      path: '/api/articles/direct-news',
      description: 'Generate articles from real-time news sources'
    },
    {
      method: 'GET',
      path: '/api/media/search',
      description: 'Search for images and media content'
    }
  ];
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              API Documentation
            </h1>
            <p className="text-xl text-blue-100">
              Build amazing applications with the NeuraPress API
            </p>
          </div>
        </div>
      </section>
      {/* Documentation Content */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Getting Started */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started</h2>
            <p className="text-gray-600 mb-6">
              The NeuraPress API provides access to our AI-generated content, trending topics, 
              and article management system. All endpoints return JSON responses.
            </p>
            <div className="bg-gray-100 p-4 rounded-lg">
              <code className="text-sm">
                Base URL: {process.env.NEXTAUTH_URL || 'http://localhost:3001'}/api
              </code>
            </div>
          </div>
          {/* Authentication */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication</h2>
            <p className="text-gray-600 mb-4">
              Some endpoints require authentication. NeuraPress uses NextAuth.js for session management.
              Admin endpoints require valid admin privileges.
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <p className="text-yellow-700 text-sm">
                <strong>Note:</strong> Authentication is handled automatically when using the web interface.
                For API access, you'll need to implement proper session handling.
              </p>
            </div>
          </div>
          {/* Endpoints */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">API Endpoints</h2>
            <div className="space-y-6">
              {endpoints.map((endpoint, index) => (
                <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-center mb-3">
                    <span className={`px-3 py-1 rounded text-sm font-medium mr-3 ${
                      endpoint.method === 'GET' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {endpoint.method}
                    </span>
                    <code className="text-lg font-mono text-gray-800">
                      {endpoint.path}
                    </code>
                  </div>
                  <p className="text-gray-600 mb-3">{endpoint.description}</p>
                  {endpoint.params && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Query Parameters:</h4>
                      <div className="flex flex-wrap gap-2">
                        {endpoint.params.map((param, paramIndex) => (
                          <code key={paramIndex} className="px-2 py-1 bg-gray-100 text-sm rounded">
                            {param}
                          </code>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* Examples */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Examples</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Fetch Recent Articles</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm">
{`fetch('/api/articles?limit=10&category=technology')
  .then(response => response.json())
  .then(data => console.log(data.articles));`}
                  </code>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Get Platform Statistics</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm">
{`fetch('/api/stats')
  .then(response => response.json())
  .then(stats => console.log(stats.overview));`}
                  </code>
                </div>
              </div>
            </div>
          </div>
          {/* Rate Limits */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Rate Limits</h2>
            <p className="text-gray-600 mb-4">
              To ensure fair usage and maintain performance, the NeuraPress API implements rate limiting:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Public endpoints: 100 requests per minute</li>
              <li>Authenticated endpoints: 200 requests per minute</li>
              <li>Admin endpoints: 500 requests per minute</li>
              <li>Content generation endpoints: 10 requests per minute</li>
            </ul>
          </div>
          {/* Response Format */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Response Format</h2>
            <p className="text-gray-600 mb-4">
              All API responses follow a consistent JSON format:
            </p>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <code className="text-sm">
{`{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Request successful",
  "timestamp": "2025-08-14T12:00:00.000Z"
}`}
              </code>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}