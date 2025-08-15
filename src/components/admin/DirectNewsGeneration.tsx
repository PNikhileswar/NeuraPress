'use client';
import React, { useState } from 'react';
interface DirectNewsGenerationProps {
  onArticlesGenerated?: (articles: any[]) => void;
}
interface GenerationResult {
  processed: number;
  saved: number;
  skipped: number;
  errors: number;
  articles: Array<{
    title: string;
    slug: string;
    category: string;
    publishedAt: string;
    source: string;
    originalUrl: string;
  }>;
  errorDetails?: string[];
}
const DirectNewsGeneration: React.FC<DirectNewsGenerationProps> = ({ 
  onArticlesGenerated 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    categories: ['technology', 'business', 'health', 'science'],
    limit: 15,
    country: 'us',
    maxAge: 24,
    prioritizeRecent: true,
    autoSave: true
  });
  const availableCategories = [
    'technology', 'business', 'health', 'science', 'sports', 
    'politics', 'entertainment', 'environment', 'lifestyle'
  ];
  const countryOptions = [
    { code: 'us', name: 'United States' },
    { code: 'gb', name: 'United Kingdom' },
    { code: 'ca', name: 'Canada' },
    { code: 'au', name: 'Australia' },
    { code: 'in', name: 'India' },
    { code: 'de', name: 'Germany' },
    { code: 'fr', name: 'France' },
    { code: 'jp', name: 'Japan' }
  ];
  const handleCategoryChange = (category: string, checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      categories: checked 
        ? [...prev.categories, category]
        : prev.categories.filter(c => c !== category)
    }));
  };
  const handleGenerate = async () => {
    if (settings.categories.length === 0) {
      setError('Please select at least one category');
      return;
    }
    setIsGenerating(true);
    setError(null);
    setResults(null);
    try {
      const response = await fetch('/api/articles/direct-news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate articles');
      }
      const resultData: GenerationResult = {
        processed: data.statistics.processed,
        saved: data.statistics.saved,
        skipped: data.statistics.skipped,
        errors: data.statistics.errors,
        articles: data.articles || [],
        errorDetails: data.errors
      };
      setResults(resultData);
      if (onArticlesGenerated && resultData.articles.length > 0) {
        onArticlesGenerated(resultData.articles);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsGenerating(false);
    }
  };
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          📰 Direct News Generation
        </h2>
        <p className="text-gray-600">
          Generate articles directly from real news content using newsdata.io - no topics required!
        </p>
      </div>
      {/* Settings */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categories *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {availableCategories.map(category => (
              <label key={category} className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.categories.includes(category)}
                  onChange={(e) => handleCategoryChange(category, e.target.checked)}
                  className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 capitalize">
                  {category}
                </span>
              </label>
            ))}
          </div>
        </div>
        {/* Settings */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Article Limit
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={settings.limit}
              onChange={(e) => setSettings(prev => ({ ...prev, limit: parseInt(e.target.value) || 15 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <select
              value={settings.country}
              onChange={(e) => setSettings(prev => ({ ...prev, country: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {countryOptions.map(country => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Age (hours)
            </label>
            <input
              type="number"
              min="1"
              max="168"
              value={settings.maxAge}
              onChange={(e) => setSettings(prev => ({ ...prev, maxAge: parseInt(e.target.value) || 24 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.prioritizeRecent}
                onChange={(e) => setSettings(prev => ({ ...prev, prioritizeRecent: e.target.checked }))}
                className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Prioritize Recent Articles</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) => setSettings(prev => ({ ...prev, autoSave: e.target.checked }))}
                className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Auto-save to Database</span>
            </label>
          </div>
        </div>
      </div>
      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || settings.categories.length === 0}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          isGenerating || settings.categories.length === 0
            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
  {isGenerating ? '🛠️ Generating Articles...' : '🚀 Generate Articles from News'}
      </button>
      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <span className="text-red-500 mr-2">Œ</span>
            <div>
              <h3 className="text-red-800 font-medium">Generation Failed</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
      {/* Results Display */}
      {results && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start mb-4">
            <span className="text-green-500 mr-2"> ❌…</span>
            <div>
              <h3 className="text-green-800 font-medium">Generation Complete!</h3>
              <div className="text-sm text-green-600 mt-1 grid grid-cols-2 gap-2">
                <span>📝 Processed: {results.processed}</span>
                <span>💾 Saved: {results.saved}</span>
                <span>­ï¸ Skipped: {results.skipped}</span>
                <span>Œ Errors: {results.errors}</span>
              </div>
            </div>
          </div>
          {/* Articles List */}
          {results.articles.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Generated Articles:</h4>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {results.articles.map((article, index) => (
                  <div key={index} className="p-3 bg-white border border-gray-200 rounded">
                    <h5 className="font-medium text-sm text-gray-800 mb-1">
                      {article.title}
                    </h5>
                    <div className="text-xs text-gray-500 flex items-center justify-between">
                      <span>
                        📂 {article.category}  • ⏲️ {new Date(article.publishedAt).toLocaleDateString()}
                      </span>
                      <span>
                        📰 {article.source}
                      </span>
                    </div>
                    {article.originalUrl && (
                      <a 
                        href={article.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        View Original  ←’
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Error Details */}
          {results.errorDetails && results.errorDetails.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <h4 className="font-medium text-yellow-800 mb-2">š ï¸ Some Issues Occurred:</h4>
              <div className="text-sm text-yellow-700 space-y-1">
                {results.errorDetails.map((error, index) => (
                  <div key={index} className="text-xs">{error}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
  <h3 className="font-medium text-blue-800 mb-2">💡 How Direct News Generation Works</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li> • Fetches real articles directly from 80,000+ news sources via newsdata.io</li>
          <li> • Processes actual news content instead of generating from topics</li>
          <li> • Automatically adds relevant images and formatting</li>
          <li> • Includes proper attribution to original news sources</li>
          <li> • Filters for substantial content and avoids duplicates</li>
        </ul>
      </div>
    </div>
  );
};
export default DirectNewsGeneration;
