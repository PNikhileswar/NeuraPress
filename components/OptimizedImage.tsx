'use client';

import { useState } from 'react';
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
}

export default function OptimizedImage({
  src,
  alt,
  fill = false,
  className = '',
  fallbackSrc,
  sizes,
  width,
  height,
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (fallbackSrc && !hasError) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    } else {
      setHasError(true);
    }
  };

  if (hasError && !fallbackSrc) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
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
          <span className="text-sm">Image not available</span>
        </div>
      </div>
    );
  }

  const imageProps = {
    src: imgSrc,
    alt,
    className,
    onError: handleError,
    ...(fill
      ? { fill: true, sizes }
      : { width: width || 800, height: height || 600 }),
  };

  return <Image {...imageProps} />;
}
