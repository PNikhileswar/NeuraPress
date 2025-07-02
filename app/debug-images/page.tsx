'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function ImageDebugPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/articles?limit=5')
      .then(res => res.json())
      .then(data => {
        setArticles(data.articles || []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching articles:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">Image Debug Page</h1>
      
      <div className="grid gap-8">
        {articles.map((article: any, index: number) => (
          <div key={article._id} className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">{article.title}</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Regular img tag test */}
              <div>
                <h3 className="font-semibold mb-2">Regular img tag:</h3>
                <img 
                  src={article.ogImage} 
                  alt={article.title}
                  className="w-full h-48 object-cover rounded"
                  onLoad={() => console.log(`Regular img loaded: ${article.title}`)}
                  onError={(e) => {
                    console.error(`Regular img failed: ${article.title}`, e);
                    e.currentTarget.style.border = '2px solid red';
                  }}
                />
                <p className="text-sm text-gray-600 mt-2 break-all">{article.ogImage}</p>
              </div>
              
              {/* Next.js Image component test */}
              <div>
                <h3 className="font-semibold mb-2">Next.js Image:</h3>
                <div className="relative w-full h-48">
                  <Image 
                    src={article.ogImage} 
                    alt={article.title}
                    fill
                    className="object-cover rounded"
                    onLoad={() => console.log(`Next.js Image loaded: ${article.title}`)}
                    onError={(e) => {
                      console.error(`Next.js Image failed: ${article.title}`, e);
                    }}
                    unoptimized={true}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">Category: {article.category}</p>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h4 className="font-semibold">Debug Info:</h4>
              <p><strong>ID:</strong> {article._id}</p>
              <p><strong>Has ogImage:</strong> {article.ogImage ? 'Yes' : 'No'}</p>
              <p><strong>Image URL:</strong> {article.ogImage}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
