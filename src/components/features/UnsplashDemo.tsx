'use client';
import React, { useEffect, useState } from 'react';
import UnsplashImage from '../ui/UnsplashImage';
import { MediaItem, MediaSearchOptions } from '@/lib/services/media-manager';
interface UnsplashDemoProps {
  category?: string;
  keyword?: string;
  limit?: number;
}
/**
 * Demonstration component for NeuraPress Unsplash API integration
 */
const UnsplashDemo: React.FC<UnsplashDemoProps> = ({ 
  category = 'technology', 
  keyword = 'artificial intelligence',
  limit = 3
}) => {
  const [images, setImages] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    async function fetchUnsplashImages() {
      setIsLoading(true);
      setError(null);
      try {
        // Call our API endpoint to search for images
        const searchOptions: MediaSearchOptions = {
          query: keyword,
          keywords: [keyword],
          category: category,
          type: 'image',
          limit: limit,
          orientation: 'landscape'
        };
        const response = await fetch('/api/media/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(searchOptions),
        });
        if (!response.ok) {
          throw new Error(`Error fetching images: ${response.statusText}`);
        }
        const data = await response.json();
        setImages(data.images || []);
      } catch (err) {
        console.error('Failed to fetch Unsplash images:', err);
        setError('Failed to load images. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchUnsplashImages();
  }, [category, keyword, limit]);
  return (
    <div className="my-8">
      <h2 className="text-2xl font-bold mb-4">Unsplash Image Gallery - {category}</h2>
      <p className="mb-6 text-gray-600">
        Displaying {limit} images for &quot;{keyword}&quot; from Unsplash API with proper attribution
      </p>
      {isLoading && (
        <div className="flex justify-center my-8">
          <div className="loader">Loading...</div>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {!isLoading && !error && images.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-4">
          No images found. Try a different search term.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <UnsplashImage 
            key={image.id}
            media={image}
            size="medium"
            className="rounded-lg overflow-hidden shadow-md"
          />
        ))}
      </div>
    </div>
  );
};
export default UnsplashDemo;