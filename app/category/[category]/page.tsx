import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ArticleGrid from '@/components/features/ArticleGrid';
import SearchBar from '@/components/layout/SearchBar';

const validCategories = ['technology', 'business', 'health', 'lifestyle'];

interface CategoryPageProps {
  params: {
    category: string;
  };
  searchParams: {
    search?: string;
    page?: string;
  };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = params.category.toLowerCase();
  
  if (!validCategories.includes(category)) {
    return {
      title: 'Category Not Found',
    };
  }

  const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
  
  return {
    title: `${categoryName} Articles - NeuraPress`,
    description: `Discover the latest ${category} articles and trends on NeuraPress.`,
  };
}

export function generateStaticParams() {
  return validCategories.map((category) => ({
    category: category,
  }));
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const category = params.category.toLowerCase();
  
  if (!validCategories.includes(category)) {
    notFound();
  }

  const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
  
  // Combine search params with category
  const combinedParams = {
    ...searchParams,
    category: category,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Hero */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {categoryName} Articles
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Stay updated with the latest {category} trends and insights
            </p>
            <div className="max-w-2xl mx-auto">
              <SearchBar initialSearch={searchParams.search} />
            </div>
          </div>
        </div>
      </section>

      {/* Category Stats */}
      <section className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600 mb-2">Latest</div>
              <div className="text-gray-600">Fresh Content</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 mb-2">AI-Powered</div>
              <div className="text-gray-600">Smart Insights</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 mb-2">Trending</div>
              <div className="text-gray-600">Popular Topics</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600 mb-2">Updated</div>
              <div className="text-gray-600">Daily Content</div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {categoryName} Articles
          </h2>
          <p className="text-gray-600">
            Explore our curated collection of {category} articles and stay ahead of the trends.
          </p>
        </div>

        <ArticleGrid searchParams={combinedParams} />
      </section>

      {/* Related Categories */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Explore Other Categories
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {validCategories
              .filter(cat => cat !== category)
              .map((cat) => {
                const catName = cat.charAt(0).toUpperCase() + cat.slice(1);
                return (
                  <a
                    key={cat}
                    href={`/category/${cat}`}
                    className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow text-center group"
                  >
                    <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-white font-bold text-lg">
                        {catName.charAt(0)}
                      </span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {catName}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Discover {cat} trends and insights
                    </p>
                  </a>
                );
              })}
          </div>
        </div>
      </section>
    </div>
  );
}
