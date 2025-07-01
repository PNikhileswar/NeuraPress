import Link from 'next/link';

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Discover What's
            <span className="block bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
              Trending Now
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed">
            AI-powered insights on the latest trends in technology, business, health, and lifestyle. 
            Stay ahead with intelligent content curated just for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="#latest"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Explore Articles
            </Link>
            <Link
              href="/trending"
              className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              View Trending
            </Link>
          </div>
        </div>
      </div>
      
      {/* Stats */}
      <div className="border-t border-blue-500 bg-blue-700 bg-opacity-50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">1000+</div>
              <div className="text-blue-200">AI-Generated Articles</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">50+</div>
              <div className="text-blue-200">Trending Topics Daily</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-200">Real-time Updates</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
