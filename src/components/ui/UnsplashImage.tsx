import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MediaItem } from '@/lib/services/media-manager';
interface UnsplashImageProps {
  media: MediaItem;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}
/**
 * Component for displaying Unsplash images with proper attribution
 * Follows Unsplash API guidelines: https://help.unsplash.com/en/articles/2511315-guideline-attribution
 */
const UnsplashImage: React.FC<UnsplashImageProps> = ({ 
  media, 
  size = 'medium',
  className = '' 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  // Define image dimensions based on size
  const dimensions = {
    small: { width: 400, height: 300 },
    medium: { width: 800, height: 500 },
    large: { width: 1200, height: 800 }
  };
  // Only track download when the image is actually displayed (required by Unsplash)
  React.useEffect(() => {
    if (isLoaded && media.source === 'unsplash' && media.id) {
      // Track that the image was viewed/downloaded via API
      fetch(`/api/track-unsplash-download?photoId=${media.id}`, { method: 'GET' })
        .catch(err => console.error('Failed to track Unsplash download:', err));
    }
  }, [isLoaded, media]);
  if (!media || !media.url) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width: dimensions[size].width, height: dimensions[size].height }}
      >
        <p className="text-gray-500">Image unavailable</p>
      </div>
    );
  }
  return (
    <figure className={`relative overflow-hidden ${className}`}>
      {/* Main image with Next.js Image optimization */}
      <div className="relative">
        <Image
          src={media.url}
          alt={media.title || 'Image from Unsplash'}
          width={dimensions[size].width}
          height={dimensions[size].height}
          className={`object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsLoaded(true)}
        />
        {/* Loading placeholder */}
        {!isLoaded && (
          <div 
            className="absolute inset-0 bg-gray-200 animate-pulse" 
            style={{ width: dimensions[size].width, height: dimensions[size].height }}
          />
        )}
      </div>
      {/* Image caption with proper attribution */}
      <figcaption className="text-xs text-gray-600 mt-2 flex justify-between items-center">
        <div>
          {media.title && <p className="font-medium">{media.title}</p>}
          {/* Required Unsplash attribution */}
          {media.source === 'unsplash' && (
            <p>
              Photo by{' '}
              {media.metadata.photographerUrl ? (
                <Link 
                  href={media.metadata.photographerUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {media.metadata.photographer}
                </Link>
              ) : (
                <span>{media.metadata.photographer}</span>
              )}{' '}
              on{' '}
              {media.metadata.unsplashUrl ? (
                <Link 
                  href={media.metadata.unsplashUrl} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Unsplash
                </Link>
              ) : (
                <Link 
                  href="https://unsplash.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Unsplash
                </Link>
              )}
            </p>
          )}
        </div>
        {/* Optional download button for high resolution version */}
        {media.metadata.unsplashUrl && (
          <Link
            href={media.metadata.unsplashUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
          >
            View on Unsplash
          </Link>
        )}
      </figcaption>
    </figure>
  );
};
export default UnsplashImage;