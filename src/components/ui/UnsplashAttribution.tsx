import React from 'react';
import Link from 'next/link';
import { MediaItem } from '@/lib/services/media-manager';
interface UnsplashAttributionProps {
  media: MediaItem;
  className?: string;
}
/**
 * Component to display proper Unsplash attribution as required by their API guidelines
 * https://help.unsplash.com/en/articles/2511315-guideline-attribution
 */
const UnsplashAttribution: React.FC<UnsplashAttributionProps> = ({ media, className = '' }) => {
  if (media.source !== 'unsplash' || !media.metadata.photographer) {
    return null;
  }
  return (
    <div className={`text-xs text-gray-500 ${className}`}>
      Photo by{' '}
      {media.metadata.photographerUrl ? (
        <Link 
          href={media.metadata.photographerUrl} 
          target="_blank"
          rel="noopener noreferrer" 
          className="underline hover:text-gray-700"
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
          className="underline hover:text-gray-700"
        >
          Unsplash
        </Link>
      ) : (
        <Link 
          href="https://unsplash.com" 
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-700"
        >
          Unsplash
        </Link>
      )}
    </div>
  );
};
export default UnsplashAttribution;