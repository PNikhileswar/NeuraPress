import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import MediaManager from '@/lib/services/media-manager';
import { authOptions } from '@/lib/config/auth';
const mediaManager = new MediaManager();
/**
 * API endpoint for searching media using the MediaManager
 * This allows us to use our enhanced Unsplash integration from the frontend
 */
export async function POST(req: NextRequest) {
  try {
    // Optional: Check authentication if you want to restrict access
    const session = await getServerSession(authOptions);
    // Optional: Apply rate limiting to prevent abuse
    // const limiter = await rateLimit.check(req, 10, '1m'); // 10 requests per minute
    // if (!limiter.success) {
    //   return NextResponse.json(
    //     { error: 'Rate limit exceeded. Please try again later.' },
    //     { status: 429 }
    //   );
    // }
    // Parse the request body
    const searchOptions = await req.json();
    // Validate required fields
    if (!searchOptions.query || !searchOptions.category) {
      return NextResponse.json(
        { error: 'Missing required fields: query and category are required' },
        { status: 400 }
      );
    }
    // Default to image type if not specified
    if (!searchOptions.type) {
      searchOptions.type = 'image';
    }
    // Ensure we have keywords
    if (!searchOptions.keywords || !Array.isArray(searchOptions.keywords) || searchOptions.keywords.length === 0) {
      searchOptions.keywords = [searchOptions.query];
    }
    // Search for media using our MediaManager
    const media = await mediaManager.searchRelevantMedia(searchOptions);
    // Return the results
    return NextResponse.json({
      images: media.filter(item => item.type === 'image'),
      videos: media.filter(item => item.type === 'video'),
      query: searchOptions.query,
      category: searchOptions.category
    });
  } catch (error) {
    console.error('Error in media search API:', error);
    return NextResponse.json(
      { error: 'Failed to search media' },
      { status: 500 }
    );
  }
}