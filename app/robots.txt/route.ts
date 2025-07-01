import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  const robots = `User-agent: *
Allow: /

Disallow: /admin
Disallow: /api/
Disallow: /login

Sitemap: ${baseUrl}/sitemap.xml`;

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
