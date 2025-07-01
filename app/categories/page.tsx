import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Categories - TrendWise',
  description: 'Explore all article categories on TrendWise.',
};

const categories = [
  {
    name: 'Technology',
    slug: 'technology',
    description: 'Latest tech trends, AI, software development, and digital innovation.',
    icon: '💻',
    color: 'from-blue-500 to-cyan-500',
    articles: '250+',
  },
  {
    name: 'Business',
    slug: 'business',
    description: 'Entrepreneurship, market insights, startup stories, and business strategies.',
    icon: '📈',
    color: 'from-green-500 to-emerald-500',
    articles: '180+',
  },
  {
    name: 'Health',
    slug: 'health',
    description: 'Wellness tips, medical breakthroughs, fitness, and mental health.',
    icon: '🏥',
    color: 'from-red-500 to-pink-500',
    articles: '120+',
  },
  {
    name: 'Lifestyle',
    slug: 'lifestyle',
    description: 'Travel, food, culture, entertainment, and personal development.',
    icon: '🌟',
    color: 'from-purple-500 to-indigo-500',
    articles: '200+',
  },
];

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Explore Categories
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Discover content organized by your interests and expertise areas
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="group block"
            >
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden transform group-hover:-translate-y-1">
                <div className={`h-32 bg-gradient-to-r ${category.color} relative`}>
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  <div className="absolute bottom-4 left-6">
                    <div className="text-4xl mb-2">{category.icon}</div>
                    <h2 className="text-2xl font-bold text-white">{category.name}</h2>
                  </div>
                  <div className="absolute top-4 right-6 text-white text-sm font-medium bg-white bg-opacity-20 px-3 py-1 rounded-full">
                    {category.articles} articles
                  </div>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {category.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-blue-600 font-semibold group-hover:text-blue-800 transition-colors">
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
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Explore by Category?
            </h2>
            <p className="text-gray-600 text-lg">
              Organized content makes it easier to find exactly what you're looking for
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Focused Content</h3>
              <p className="text-gray-600">
                Find articles tailored to your specific interests and expertise
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Trending Topics</h3>
              <p className="text-gray-600">
                Stay updated with the latest trends in each category
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Curated</h3>
              <p className="text-gray-600">
                Intelligent content curation powered by advanced AI algorithms
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Dive In?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Choose a category that interests you and start exploring our AI-curated content
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Browse All Articles
            </Link>
            <Link
              href="/trending"
              className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              View Trending
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
