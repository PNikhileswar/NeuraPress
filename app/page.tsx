import { Metadata } from 'next';
import ArticleGrid from '@/components/ArticleGrid';
import Hero from '@/components/Hero';
import FeaturedArticles from '@/components/FeaturedArticles';
import SearchBar from '@/components/SearchBar';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Discover trending topics and AI-generated content on TrendWise.',
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: { search?: string; category?: string; page?: string };
}) {
  return (
    <div className="min-h-screen">
      <Hero />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <SearchBar initialSearch={searchParams.search} />
        </div>

        <FeaturedArticles />
        
        <section id="latest-articles" className="mt-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Latest Articles</h2>
          <ArticleGrid 
            searchParams={searchParams}
          />
        </section>
      </div>
    </div>
  );
}
