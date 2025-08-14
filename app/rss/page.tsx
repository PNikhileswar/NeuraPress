import { Metadata } from 'next';
import Link from 'next/link';
export const metadata: Metadata = {
  title: 'RSS Feed - NeuraPress',
  description: 'Subscribe to our RSS feed to get the latest articles and updates from NeuraPress.',
};
export default function RSSPage() {
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-6xl mb-6">ðŸ“¡</div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              RSS Feed
            </h1>
            <p className="text-xl text-orange-100">
              Stay updated with our latest AI-generated content and trending topics
            </p>
          </div>
        </div>
      </section>
      {/* Main Content */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* What is RSS */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What is RSS?</h2>
            <p className="text-gray-600 mb-4">
              RSS (Really Simple Syndication) is a web feed that allows users and applications to access 
              updates to websites in a standardized, computer-readable format. By subscribing to our RSS feed, 
              you can automatically receive our latest articles and updates directly in your RSS reader.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <p className="text-blue-700 text-sm">
                <strong>Benefits:</strong> Get instant notifications of new content, read articles offline, 
                and organize feeds from multiple sources in one place.
              </p>
            </div>
          </div>
          {/* RSS Feed Access */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Subscribe to Our Feed</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="text-center">
                <div className="text-4xl mb-4">ðŸ”—</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Direct RSS Link</h3>
                <p className="text-gray-600 mb-4 text-sm">
                  Copy this URL to your RSS reader
                </p>
                <div className="bg-gray-100 p-3 rounded-lg mb-4">
                  <code className="text-sm break-all">
                    {typeof window !== 'undefined' ? window.location.origin : 'https://neurapress.com'}/rss.xml
                  </code>
                </div>
                <a 
                  href="/rss.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  View RSS Feed
                </a>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">ðŸ“±</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Mobile & Desktop Apps</h3>
                <p className="text-gray-600 mb-4 text-sm">
                  Use popular RSS readers to subscribe
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Desktop:</strong> Feedly, Inoreader, NewsBlur</p>
                  <p><strong>Mobile:</strong> Feedly, Flipboard, RSS Reader</p>
                  <p><strong>Browser:</strong> RSS extensions and bookmarks</p>
                </div>
              </div>
            </div>
          </div>
          {/* How to Subscribe */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Subscribe</h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Choose an RSS Reader</h3>
                  <p className="text-gray-600">
                    Select from popular options like Feedly, Inoreader, or any RSS reader app that suits your needs.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Add Our Feed</h3>
                  <p className="text-gray-600">
                    Copy our RSS URL and paste it into your RSS reader's "Add Feed" or "Subscribe" option.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Stay Updated</h3>
                  <p className="text-gray-600">
                    You'll automatically receive notifications when we publish new articles and content.
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Feed Information */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Feed Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl mb-2">ðŸ”„</div>
                <h3 className="font-semibold text-gray-800 mb-1">Update Frequency</h3>
                <p className="text-gray-600 text-sm">Updates every hour</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">ðŸ“„</div>
                <h3 className="font-semibold text-gray-800 mb-1">Content Type</h3>
                <p className="text-gray-600 text-sm">Full article content</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">ðŸ·ï¸</div>
                <h3 className="font-semibold text-gray-800 mb-1">Categories</h3>
                <p className="text-gray-600 text-sm">All topics included</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}