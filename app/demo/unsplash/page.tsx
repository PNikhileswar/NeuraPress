import React from 'react';
import UnsplashDemo from '@/components/features/UnsplashDemo';
export const metadata = {
  title: 'Unsplash API Integration - NeuraPress',
  description: 'Demonstration of NeuraPress Unsplash API integration for high-quality images',
};
export default function UnsplashPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">NeuraPress Unsplash Integration</h1>
      <p className="text-gray-600 mb-8">
        Showcase of our enhanced Unsplash API integration with proper attribution and dynamic resizing
      </p>
      <div className="grid grid-cols-1 gap-12">
        <UnsplashDemo 
          category="technology" 
          keyword="artificial intelligence" 
          limit={3} 
        />
        <UnsplashDemo 
          category="business" 
          keyword="startup" 
          limit={3} 
        />
        <UnsplashDemo 
          category="health" 
          keyword="wellness" 
          limit={3} 
        />
      </div>
      <div className="mt-16 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-blue-800 mb-4">About Unsplash API Integration</h2>
        <div className="prose">
          <p>
            NeuraPress uses Unsplash API to provide high-quality, royalty-free images for articles. 
            Our integration includes:
          </p>
          <ul className="list-disc pl-5 mt-3">
            <li>Smart category-based image selection</li>
            <li>Dynamic image resizing and optimization</li>
            <li>Proper attribution as required by Unsplash</li>
            <li>Download tracking to comply with API guidelines</li>
            <li>Fallback system when API is unavailable</li>
          </ul>
          <p className="mt-3">
            All images are provided by <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Unsplash</a>, 
            the internet's source for freely usable images. 
            For more information, see the <a href="https://unsplash.com/documentation" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Unsplash API Documentation</a>.
          </p>
        </div>
      </div>
    </div>
  );
}