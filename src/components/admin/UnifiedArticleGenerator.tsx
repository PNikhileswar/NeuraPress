'use client';
import React, { useState } from 'react';
interface UnifiedArticleGeneratorProps {
  onArticlesGenerated?: (articles: any[]) => void;
}
interface GenerationResult {
  type: 'topic-based' | 'direct-news';
  processed: number;
  saved: number;
  skipped: number;
  errors: number;
  articles: Array<{
    title: string;
    slug: string;
    category: string;
    publishedAt: string;
    source?: string;
    originalUrl?: string;
  }>;
  errorDetails?: string[];
  message: string;
}
type GenerationType = 'topic-based' | 'direct-news';
const UnifiedArticleGenerator: React.FC<UnifiedArticleGeneratorProps> = ({ 
  onArticlesGenerated 
}) => {
  const [generationType, setGenerationType] = useState<GenerationType>('topic-based');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Topic-based settings
  const [topicSettings, setTopicSettings] = useState({
    count: 10,
    categories: ['technology', 'business', 'health'],
    maxAge: 7,
    prioritizeRecent: true,
    includePolitics: true,
    includeSports: true
  });
  // Direct news settings
  const [directNewsSettings, setDirectNewsSettings] = useState({
    categories: ['technology', 'business', 'health', 'science'],
    limit: 15,
    country: 'us', // Fixed to United States
    maxAge: 24,
    prioritizeRecent: true,
    autoSave: true
  });
  const availableCategories = [
    'technology', 'business', 'health', 'science', 'sports', 
    'politics', 'entertainment', 'environment', 'finance', 'lifestyle'
  ];
  // Removed country selection - always use United States ('us')
  const handleTopicCategoryChange = (category: string, checked: boolean) => {
    setTopicSettings(prev => ({
      ...prev,
      categories: checked 
        ? [...prev.categories, category]
        : prev.categories.filter(c => c !== category)
    }));
  };
  const handleDirectNewsCategoryChange = (category: string, checked: boolean) => {
    setDirectNewsSettings(prev => ({
      ...prev,
      categories: checked 
        ? [...prev.categories, category]
        : prev.categories.filter(c => c !== category)
    }));
  };
  const validateSettings = (): string | null => {
    if (generationType === 'topic-based') {
      if (topicSettings.categories.length === 0) {
        return 'Please select at least one category for topic-based generation';
      }
      if (topicSettings.count < 1 || topicSettings.count > 50) {
        return 'Article count must be between 1 and 50';
      }
    } else {
      if (directNewsSettings.categories.length === 0) {
        return 'Please select at least one category for direct news generation';
      }
      if (directNewsSettings.limit < 1 || directNewsSettings.limit > 50) {
        return 'Article limit must be between 1 and 50';
      }
    }
    return null;
  };
  const handleGenerate = async () => {
    const validationError = validateSettings();
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsGenerating(true);
    setError(null);
    setResults(null);
    try {
      let response;
      let requestBody;
      let endpoint;
      if (generationType === 'topic-based') {
        endpoint = '/api/trending/generate';
        requestBody = topicSettings;
      } else {
        endpoint = '/api/articles/direct-news';
        requestBody = directNewsSettings;
      }
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Failed to generate ${generationType} articles`);
      }
      // Normalize the response format
      let resultData: GenerationResult;
      if (generationType === 'topic-based') {
        resultData = {
          type: 'topic-based',
          processed: data.statistics?.generated || data.articles?.length || 0,
          saved: data.statistics?.generated || data.articles?.length || 0,
          skipped: data.statistics?.skipped || 0,
          errors: data.statistics?.errors || 0,
          articles: (data.articles || []).map((article: any) => ({
            title: article.title,
            slug: article.slug,
            category: article.category,
            publishedAt: article.publishedAt,
          })),
          errorDetails: data.errors,
          message: data.message || 'Articles generated successfully'
        };
      } else {
        resultData = {
          type: 'direct-news',
          processed: data.statistics?.processed || 0,
          saved: data.statistics?.saved || 0,
          skipped: data.statistics?.skipped || 0,
          errors: data.statistics?.errors || 0,
          articles: data.articles || [],
          errorDetails: data.errors,
          message: data.message || 'Articles processed successfully'
        };
      }
      setResults(resultData);
      if (onArticlesGenerated && resultData.articles.length > 0) {
        onArticlesGenerated(resultData.articles);
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsGenerating(false);
    }
  };
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          \uD83D\uDE80 Article Generation Dashboard
        </h1>
        <p className="text-gray-600">
          Choose between topic-based AI generation or direct news processing
        </p>
      </div>
      {/* Generation Type Selector */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Select Generation Method</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div 
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              generationType === 'topic-based' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setGenerationType('topic-based')}
          >
            <div className="flex items-center mb-2">
              <input
                type="radio"
                checked={generationType === 'topic-based'}
                onChange={() => setGenerationType('topic-based')}
                className="mr-3 h-4 w-4 text-blue-600"
              />
              <h3 className="font-semibold text-gray-800">\uD83C\uDFAF Topic-Based Generation</h3>
            </div>
            <p className="text-sm text-gray-600">
              Generate comprehensive articles from trending topics using AI content creation
            </p>
            <div className="mt-2 text-xs text-gray-500">
              \u2728 AI-generated • \uD83D\uDCC8 Comprehensive guides • \u26A1 Creative content
            </div>
          </div>
          <div 
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              generationType === 'direct-news' 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setGenerationType('direct-news')}
          >
            <div className="flex items-center mb-2">
              <input
                type="radio"
                checked={generationType === 'direct-news'}
                onChange={() => setGenerationType('direct-news')}
                className="mr-3 h-4 w-4 text-green-600"
              />
              <h3 className="font-semibold text-gray-800">\uD83D\uDCF0 Direct News Generation</h3>
            </div>
            <p className="text-sm text-gray-600">
              Process real news articles directly from 80,000+ professional news sources
            </p>
            <div className="mt-2 text-xs text-gray-500">
              \uD83D\uDD25 Breaking news â€¢ ðŸ“ˆ Real journalism â€¢ âš¡ Instant content
            </div>
          </div>
        </div>
      </div>
      {/* Settings Panel */}
      <div className="mb-6 p-4 border border-gray-200 rounded-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {generationType === 'topic-based' ? '\uD83C\uDFAF Topic-Based Settings' : '\uD83D\uDCF0 Direct News Settings'}
        </h2>
        {generationType === 'topic-based' ? (
          /* Topic-Based Settings */
          <div className="grid md:grid-cols-2 gap-6">
            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories *
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {availableCategories.map(category => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={topicSettings.categories.includes(category)}
                      onChange={(e) => handleTopicCategoryChange(category, e.target.checked)}
                      className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">{category}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* Settings */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Article Count
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={topicSettings.count}
                  onChange={(e) => setTopicSettings(prev => ({ ...prev, count: parseInt(e.target.value) || 10 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Age (days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={topicSettings.maxAge}
                  onChange={(e) => setTopicSettings(prev => ({ ...prev, maxAge: parseInt(e.target.value) || 7 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={topicSettings.prioritizeRecent}
                    onChange={(e) => setTopicSettings(prev => ({ ...prev, prioritizeRecent: e.target.checked }))}
                    className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Prioritize Recent Topics</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={topicSettings.includePolitics}
                    onChange={(e) => setTopicSettings(prev => ({ ...prev, includePolitics: e.target.checked }))}
                    className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Include Politics</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={topicSettings.includeSports}
                    onChange={(e) => setTopicSettings(prev => ({ ...prev, includeSports: e.target.checked }))}
                    className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Include Sports</span>
                </label>
              </div>
            </div>
          </div>
        ) : (
          /* Direct News Settings */
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-700">
                \uD83D\uDD0D All articles will be sourced from <strong>United States</strong> news outlets for consistency and quality.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories *
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {availableCategories.map(category => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={directNewsSettings.categories.includes(category)}
                      onChange={(e) => handleDirectNewsCategoryChange(category, e.target.checked)}
                      className="mr-2 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">{category}</span>
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
                  value={directNewsSettings.limit}
                  onChange={(e) => setDirectNewsSettings(prev => ({ ...prev, limit: parseInt(e.target.value) || 15 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Age (hours)
                </label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={directNewsSettings.maxAge}
                  onChange={(e) => setDirectNewsSettings(prev => ({ ...prev, maxAge: parseInt(e.target.value) || 24 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={directNewsSettings.prioritizeRecent}
                    onChange={(e) => setDirectNewsSettings(prev => ({ ...prev, prioritizeRecent: e.target.checked }))}
                    className="mr-2 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Prioritize Recent Articles</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={directNewsSettings.autoSave}
                    onChange={(e) => setDirectNewsSettings(prev => ({ ...prev, autoSave: e.target.checked }))}
                    className="mr-2 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Auto-save to Database</span>
                </label>
              </div>
            </div>
            </div>
          </div>
        )}
      </div>
      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className={`w-full py-4 px-6 rounded-lg font-medium text-lg transition-colors ${
          isGenerating
            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
            : generationType === 'topic-based'
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-green-600 text-white hover:bg-green-700'
        }`}
      >
        {isGenerating ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {generationType === 'topic-based' ? 'Generating from Topics...' : 'Processing News Articles...'}
          </span>
        ) : (
          <>
            {generationType === 'topic-based' ? '\uD83C\uDFAF Generate Articles from Topics' : '\uD83D\uDCF0 Generate Articles from News'}
          </>
        )}
      </button>
      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <span className="text-red-500 mr-2">âŒ</span>
            <div>
              <h3 className="text-red-800 font-medium">Generation Failed</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
      {/* Results Display */}
      {results && (
        <div className={`mt-6 p-4 border rounded-lg ${
          results.type === 'topic-based' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-start mb-4">
            <span className={`mr-2 ${results.type === 'topic-based' ? 'text-blue-500' : 'text-green-500'}`}>
              \u2705
            </span>
            <div>
              <h3 className={`font-medium ${results.type === 'topic-based' ? 'text-blue-800' : 'text-green-800'}`}>
                {results.type === 'topic-based' ? 'Topic-Based Generation Complete!' : 'Direct News Generation Complete!'}
              </h3>
              <p className={`text-sm mt-1 ${results.type === 'topic-based' ? 'text-blue-600' : 'text-green-600'}`}>
                {results.message}
              </p>
              <div className={`text-sm mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 ${
                results.type === 'topic-based' ? 'text-blue-600' : 'text-green-600'
              }`}>
                <span>\uD83D\uDD0D Processed: {results.processed}</span>
                <span>\uD83D\uDCBE Saved: {results.saved}</span>
                <span>\uD83D\uDCC2 Skipped: {results.skipped}</span>
                <span>\uD83D\uDCF0 Errors: {results.errors}</span>
              </div>
            </div>
          </div>
          {/* Articles List */}
          {results.articles.length > 0 && (
            <div>
              <h4 className={`font-medium mb-3 ${results.type === 'topic-based' ? 'text-blue-800' : 'text-green-800'}`}>
                Generated Articles ({results.articles.length}):
              </h4>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {results.articles.map((article, index) => (
                  <div key={index} className="p-3 bg-white border border-gray-200 rounded">
                    <h5 className="font-medium text-sm text-gray-800 mb-1">
                      {article.title}
                    </h5>
                    <div className="text-xs text-gray-500 flex items-center justify-between">
                      <span>
                        ðŸ“‚ {article.category} â€¢ ðŸ•’ {new Date(article.publishedAt).toLocaleDateString()}
                      </span>
                      {article.source && (
                        <span>ðŸ“° {article.source}</span>
                      )}
                    </div>
                    {article.originalUrl && (
                      <a 
                        href={article.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        View Original â†’
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
              <h4 className="font-medium text-yellow-800 mb-2">\u26A0\uFE0F Some Issues Occurred:</h4>
              <div className="text-sm text-yellow-700 space-y-1">
                {results.errorDetails.map((error, index) => (
                  <div key={index} className="text-xs">{error}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {/* Info Boxes */}
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">\uD83C\uDFAF Topic-Based Generation</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Uses trending topics from multiple sources</li>
            <li>• AI-generated comprehensive content</li>
            <li>• Perfect for evergreen articles</li>
            <li>• Customizable depth and style</li>
          </ul>
        </div>
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-medium text-green-800 mb-2">\uD83D\uDCF0 Direct News Generation</h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Real articles from 80,000+ sources</li>
            <li>• Professional journalism quality</li>
            <li>• Breaking news and current events</li>
            <li>• Proper source attribution</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
export default UnifiedArticleGenerator;