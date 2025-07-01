import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About - TrendWise',
  description: 'Learn about TrendWise - AI-powered content platform for trending topics.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About TrendWise
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Discovering tomorrow's trends with AI-powered insights today
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              TrendWise combines the power of artificial intelligence with real-time web scraping 
              to deliver the most relevant and up-to-date content across technology, business, 
              health, and lifestyle categories. We believe information should be accessible, 
              actionable, and ahead of the curve.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                How We Work
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Trend Discovery</h4>
                    <p className="text-gray-600">Our AI scans thousands of sources to identify emerging trends</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Content Generation</h4>
                    <p className="text-gray-600">AI creates comprehensive, well-researched articles on trending topics</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Quality Curation</h4>
                    <p className="text-gray-600">Content is organized, optimized, and presented for maximum value</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Choose TrendWise?</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Real-time trend analysis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">AI-powered content generation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Multiple category coverage</span>
                </div>
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">SEO-optimized articles</span>
                </div>
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">User authentication & comments</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Built with Modern Technology</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-lg">N</span>
                </div>
                <h3 className="font-semibold text-gray-900">Next.js 14</h3>
                <p className="text-sm text-gray-600">React Framework</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-lg">TS</span>
                </div>
                <h3 className="font-semibold text-gray-900">TypeScript</h3>
                <p className="text-sm text-gray-600">Type Safety</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-lg">DB</span>
                </div>
                <h3 className="font-semibold text-gray-900">MongoDB</h3>
                <p className="text-sm text-gray-600">Database</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-lg">AI</span>
                </div>
                <h3 className="font-semibold text-gray-900">OpenAI</h3>
                <p className="text-sm text-gray-600">AI Engine</p>
              </div>
            </div>

            <p className="text-gray-600 text-lg leading-relaxed">
              TrendWise is built on a modern, scalable architecture using Next.js 14, TypeScript, 
              MongoDB, and OpenAI's GPT models. We leverage TailwindCSS for beautiful, responsive 
              design and NextAuth.js for secure authentication.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Behind TrendWise</h2>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-xl">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              TrendWise was created by a team passionate about the intersection of artificial 
              intelligence and content creation. We believe that technology should make information 
              more accessible and actionable for everyone.
            </p>
            <p className="text-gray-600">
              Our mission is to help you stay ahead of the curve by providing timely, 
              relevant, and well-researched content on the topics that matter most.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-gray-900 to-blue-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Explore?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of readers who trust TrendWise for the latest insights and trends
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Reading
            </Link>
            <Link
              href="/categories"
              className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
            >
              Browse Categories
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
