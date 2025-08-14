import { NextRequest, NextResponse } from 'next/server';
import MediaManager from '@/lib/services/media-manager';
const mediaManager = new MediaManager();
/**
 * API route for tracking Unsplash downloads
 * This helps us comply with Unsplash API terms
 * We need to report when an image is "downloaded" (used in our application)
 */
export async function GET(request: NextRequest) {
  const photoId = request.nextUrl.searchParams.get('photoId');
  if (!photoId) {
    return NextResponse.json({ error: 'Missing photoId parameter' }, { status: 400 });
  }
  try {
    // Track the download using our media manager
    await mediaManager.trackUnsplashDownload(photoId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking Unsplash download:', error);
    return NextResponse.json(
      { error: 'Failed to track Unsplash download' }, 
      { status: 500 }
    );
  }
}