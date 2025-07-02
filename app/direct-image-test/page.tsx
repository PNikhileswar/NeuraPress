'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function DirectImageTest() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    fetch('/api/articles?limit=3')
      .then(res => res.json())
      .then(data => setArticles(data.articles || []))
      .catch(console.error);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Direct Image Test</h1>
      
      <div className="grid gap-6">
        {articles.map((article: any, index) => (
          <div key={article._id} className="border p-4 rounded">
            <h2 className="font-bold mb-4">{article.title}</h2>
            
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              {/* Direct Next.js Image */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Next.js Image (direct):</h3>
                <div className="relative w-full h-48 border border-red-200">
                  {article.ogImage ? (
                    <Image
                      src={article.ogImage}
                      alt={article.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100">
                      No image
                    </div>
                  )}
                </div>
              </div>
              
              {/* Regular img tag */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Regular img:</h3>
                <div className="w-full h-48 border border-blue-200">
                  {article.ogImage ? (
                    <img
                      src={article.ogImage}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100">
                      No image
                    </div>
                  )}
                </div>
              </div>
              
              {/* Image with inline style */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Inline style img:</h3>
                <div className="w-full h-48 border border-green-200">
                  {article.ogImage ? (
                    <img
                      src={article.ogImage}
                      alt={article.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100">
                      No image
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded text-xs">
              <p><strong>Has ogImage:</strong> {article.ogImage ? 'Yes' : 'No'}</p>
              <p><strong>URL:</strong> {article.ogImage || 'None'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
