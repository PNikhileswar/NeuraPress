import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/mongodb';
import Comment from '@/lib/models/Comment';
import { authOptions } from '@/lib/auth';

// GET /api/comments - Get comments for an article
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('articleId');

    if (!articleId) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      );
    }

    const comments = await Comment
      .find({ articleId, parentId: { $exists: false } })
      .sort({ createdAt: -1 });

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment
          .find({ parentId: comment._id })
          .sort({ createdAt: 1 });
        
        return {
          ...comment.toObject(),
          replies,
        };
      })
    );

    return NextResponse.json(commentsWithReplies);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST /api/comments - Create new comment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { articleId, content, parentId } = body;

    if (!articleId || !content) {
      return NextResponse.json(
        { error: 'Article ID and content are required' },
        { status: 400 }
      );
    }

    const commentData = {
      articleId,
      content,
      userId: (session.user as any).id || session.user.email,
      userEmail: session.user.email!,
      userName: session.user.name!,
      userImage: session.user.image,
      parentId: parentId || undefined,
    };

    const comment = new Comment(commentData);
    await comment.save();

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
