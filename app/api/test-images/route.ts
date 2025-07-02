import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Article from '@/lib/models/Article';

export async function GET() {
  try {
    await connectDB();
    
    const articles = await Article.find({}).select('title ogImage category').limit(20);
    
    // Create an HTML page to test image loading
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Image Loading Test</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .image-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
          .image-item { border: 1px solid #ddd; padding: 10px; border-radius: 8px; }
          .image-item img { width: 100%; height: 200px; object-fit: cover; border-radius: 4px; }
          .image-item h3 { margin: 10px 0 5px 0; font-size: 14px; }
          .image-item p { margin: 0; color: #666; font-size: 12px; }
          .status { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
          .loaded { background: #d4edda; color: #155724; }
          .error { background: #f8d7da; color: #721c24; }
        </style>
      </head>
      <body>
        <h1>TrendWise Image Loading Test</h1>
        <p>Testing ${articles.length} article images...</p>
        <div class="image-grid">
          ${articles.map(article => `
            <div class="image-item">
              <img 
                src="${article.ogImage}" 
                alt="${article.title}"
                onload="this.nextElementSibling.innerHTML = '<span class=\\"status loaded\\">✓ Loaded</span>'"
                onerror="this.nextElementSibling.innerHTML = '<span class=\\"status error\\">✗ Failed</span>'"
              />
              <div>Loading...</div>
              <h3>${article.title}</h3>
              <p>Category: ${article.category}</p>
              <p style="word-break: break-all; font-size: 10px;">${article.ogImage}</p>
            </div>
          `).join('')}
        </div>
        <script>
          setTimeout(() => {
            const loadedImages = document.querySelectorAll('.loaded').length;
            const failedImages = document.querySelectorAll('.error').length;
            const totalImages = ${articles.length};
            
            document.querySelector('p').innerHTML = 
              \`Testing \${totalImages} article images... 
              <strong style="color: green;">\${loadedImages} loaded</strong>, 
              <strong style="color: red;">\${failedImages} failed</strong>\`;
          }, 5000);
        </script>
      </body>
    </html>
    `;
    
    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Error in image test:', error);
    return NextResponse.json({ error: 'Failed to load image test' }, { status: 500 });
  }
}
