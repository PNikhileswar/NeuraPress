'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  fallbackSrc?: string;
  sizes?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

const DEFAULT_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1516541196182-6bdb0516ed27?w=800&h=600&fit=crop&crop=center',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center',
];

export default function OptimizedImage({
  src,
  alt,
  fill = false,
  className = '',
  fallbackSrc,
  sizes,
  width,
  height,
  priority = false,
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Reset state when src changes
  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  const handleError = () => {
    console.error(`Image failed to load: ${imgSrc}`);
    if (fallbackSrc && !hasError) {
      console.log(`Trying fallback image: ${fallbackSrc}`);
      setImgSrc(fallbackSrc);
      setHasError(true);
    } else if (!hasError) {
      console.log('Using random fallback image');
      // Use a random fallback image
      const randomFallback = DEFAULT_FALLBACK_IMAGES[Math.floor(Math.random() * DEFAULT_FALLBACK_IMAGES.length)];
      setImgSrc(randomFallback);
      setHasError(true);
    }
  };

  const handleLoad = () => {
    console.log(`Image loaded successfully: ${imgSrc}`);
    setIsLoading(false);
  };

  if (hasError && !fallbackSrc && imgSrc === src) {
    return (
      <div className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`}>
        <div className="text-gray-400 text-center p-4">
          <svg
            className="w-12 h-12 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm">Loading image...</span>
        </div>
      </div>
    );
  }

  const imageProps = {
    src: imgSrc,
    alt,
    className: `${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`,
    onError: handleError,
    onLoad: handleLoad,
    priority,
    unoptimized: true, // Temporarily disable optimization for debugging
    ...(fill
      ? { fill: true, sizes }
      : { width: width || 800, height: height || 600 }),
  };

  return (
    <div className="relative">
      {isLoading && (
        <div className={`absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className}`}>
          <div className="animate-pulse">
            <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      )}
      <Image {...imageProps} />
    </div>
  );
}
