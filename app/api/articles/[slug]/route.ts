import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Article from '@/lib/models/Article';

// GET /api/articles/[slug] - Get single article by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();

    const article = await Article.findOne({ slug: params.slug });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

// PUT /api/articles/[slug] - Update article
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();

    const body = await request.json();
    const { title, content, metaDescription, tags, featured, category } = body;

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (metaDescription) updateData.metaDescription = metaDescription;
    if (tags) updateData.tags = tags;
    if (typeof featured === 'boolean') updateData.featured = featured;
    if (category) updateData.category = category;

    const article = await Article.findOneAndUpdate(
      { slug: params.slug },
      updateData,
      { new: true }
    );

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

// DELETE /api/articles/[slug] - Delete article
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();

    const article = await Article.findOneAndDelete({ slug: params.slug });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}
