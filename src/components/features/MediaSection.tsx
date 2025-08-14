'use client';
import React from 'react';
import Image from 'next/image';
import Tweet from './Tweet';
import OptimizedImage from '@/components/ui/OptimizedImage';
interface MediaItem {
  id: string;
  url: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  source: 'unsplash' | 'pexels' | 'vimeo';
  type: 'image' | 'video';
  tags: string[];
  relevanceScore: number;
  metadata: {
    width?: number;
    height?: number;
    duration?: number;
    photographer?: string;
    publishedAt?: string;
    license?: string;
  };
}
interface MediaSectionProps {
  media: {
    images: MediaItem[];
    videos: MediaItem[];
    tweets: string[]; // Kept for backward compatibility
  };
  title: string;
  className?: string;
}
export default function MediaSection({ media, title, className = '' }: MediaSectionProps) {
  const { images, videos, tweets } = media;
  if (!images.length && !videos.length) {
    return null;
  }
  return (
    <div className={`p-4 rounded space-y-8 ${className}`}>
      <h2 className="text-2xl font-bold">Media Gallery</h2>
      {/* Images Section */}
      {images.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Related Images
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {images.slice(0, 4).map((image, index) => (
              <div key={image.id} className="relative group">
                <div className="aspect-video bg-gray-200 rounded overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.title || `Related image ${index + 1} for ${title}`}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
                {image.title && (
                  <div className="mt-2">
                    <h4 className="text-sm font-medium text-gray-900">{image.title}</h4>
                    {image.description && (
                      <p className="text-xs text-gray-600 mt-1">{image.description}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Videos Section */}
      {videos.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Related Videos
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {videos.slice(0, 2).map((video) => (
              <div key={video.id} className="bg-gray-100 rounded-lg overflow-hidden">
                <div className="aspect-video bg-gray-200 flex items-center justify-center">
                  <div className="text-center p-4">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-600 text-sm">Video content</p>
                    <a 
                      href={video.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm mt-1 inline-block"
                    >
                      Watch on {video.source}
                    </a>
                  </div>
                </div>
                {video.title && (
                  <div className="p-4">
                    <h4 className="font-medium text-gray-900">{video.title}</h4>
                    {video.description && (
                      <p className="text-sm text-gray-600 mt-1">{video.description}</p>
                    )}
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      {video.metadata.duration && (
                        <span className="flex items-center mr-4">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {Math.floor(video.metadata.duration / 60)}:{(video.metadata.duration % 60).toString().padStart(2, '0')}
                        </span>
                      )}
                      <span>Source: {video.source}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Media Stats - simplified */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Media Gallery</h4>
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {images.length} images
          </span>
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {videos.length} videos
          </span>
        </div>
      </div>
    </div>
  );
}