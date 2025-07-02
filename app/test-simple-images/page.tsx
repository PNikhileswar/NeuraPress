'use client';

import Image from 'next/image';

export default function SimpleImageTest() {
  const testImages = [
    'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=600&fit=crop&crop=center',
    'https://via.placeholder.com/800x600/0066cc/ffffff?text=Test+Image',
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Simple Image Test</h1>
      
      <div className="grid gap-8">
        {testImages.map((src, index) => (
          <div key={index} className="border p-4 rounded-lg">
            <h2 className="font-semibold mb-4">Test Image {index + 1}</h2>
            
            {/* Test with regular img */}
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Regular img tag:</h3>
              <img 
                src={src} 
                alt={`Test ${index}`}
                className="w-64 h-48 object-cover border"
                onLoad={() => console.log(`Regular img ${index} loaded`)}
                onError={() => console.error(`Regular img ${index} failed`)}
              />
            </div>
            
            {/* Test with Next.js Image */}
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Next.js Image (unoptimized):</h3>
              <div className="relative w-64 h-48 border">
                <Image 
                  src={src} 
                  alt={`Test ${index}`}
                  fill
                  className="object-cover"
                  unoptimized={true}
                  onLoad={() => console.log(`Next.js img ${index} loaded`)}
                  onError={() => console.error(`Next.js img ${index} failed`)}
                />
              </div>
            </div>
            
            {/* Test with Next.js Image optimized */}
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Next.js Image (optimized):</h3>
              <div className="relative w-64 h-48 border">
                <Image 
                  src={src} 
                  alt={`Test ${index}`}
                  fill
                  className="object-cover"
                  onLoad={() => console.log(`Next.js optimized img ${index} loaded`)}
                  onError={() => console.error(`Next.js optimized img ${index} failed`)}
                />
              </div>
            </div>
            
            <p className="text-xs text-gray-600 break-all">{src}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
