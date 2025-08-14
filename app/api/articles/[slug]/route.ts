import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database/mongodb';
import Article from '@/lib/database/models/Article';
import { invalidateStatsCache, notifyStatsUpdate } from '@/lib/utils/stats-cache';

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

    // First find the article to ensure it exists
    const existingArticle = await Article.findOne({ slug: params.slug });
    if (!existingArticle) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Update the article
    const article = await Article.findOneAndUpdate(
      { slug: params.slug },
      updateData,
      { new: true }
    );

    // Invalidate stats cache and notify of the update
    const updateEvent = {
      type: 'article_updated' as const,
      articleId: existingArticle._id.toString(),
      category: article?.category || existingArticle.category,
      timestamp: new Date()
    };
    
    invalidateStatsCache(updateEvent);
    notifyStatsUpdate(updateEvent);

    console.log(`✏️ Article updated: "${article?.title || existingArticle.title}" in ${article?.category || existingArticle.category} category`);

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

    // First find the article to get its data
    const articleToDelete = await Article.findOne({ slug: params.slug });

    if (!articleToDelete) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Now delete the article
    await Article.deleteOne({ slug: params.slug });

    // Invalidate stats cache and notify of the deletion
    const deleteEvent = {
      type: 'article_deleted' as const,
      articleId: articleToDelete._id.toString(),
      category: articleToDelete.category,
      timestamp: new Date()
    };
    
    invalidateStatsCache(deleteEvent);
    notifyStatsUpdate(deleteEvent);

    console.log(`🗑️ Article deleted: "${articleToDelete.title}" from ${articleToDelete.category} category`);

    return NextResponse.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}
