import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto text-center px-4">
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white text-4xl font-bold">404</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
          <p className="text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for. 
            The page might have been moved or doesn't exist.
          </p>
        </div>
        <div className="space-y-4">
          <Link
            href="/"
            className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Back to Home
          </Link>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/categories"
              className="block bg-white text-gray-700 px-4 py-3 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors text-sm font-medium"
            >
              Browse Categories
            </Link>
            <Link
              href="/trending"
              className="block bg-white text-gray-700 px-4 py-3 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors text-sm font-medium"
            >
              View Trending
            </Link>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Looking for something specific? Try searching from the homepage.
          </p>
        </div>
      </div>
    </div>
  );
}