import mongoose from 'mongoose';
export interface IMediaItem {
  id: string;
  url: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  source: 'unsplash' | 'pexels' | 'vimeo' | 'youtube';
  type: 'image' | 'video';
  tags: string[];
  relevanceScore: number;
  metadata: {
    width?: number;
    height?: number;
    duration?: number;
    photographer?: string;
    publishedAt?: string;
    license?: string;
    views?: number;
    channel?: string;
    uniqueId?: string;
  };
}
export interface IArticle {
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  metaDescription: string;
  metaKeywords: string[];
  ogImage?: string;
  author: string;
  publishedAt: Date;
  updatedAt: Date;
  tags: string[];
  category: string;
  readingTime: number;
  featured: boolean;
  media: {
    images: IMediaItem[];
    videos: IMediaItem[];
    tweets: string[];
  };
  seoData: {
    title: string;
    description: string;
    keywords: string[];
  };
  originalSource?: {
    url: string;
    source_id: string;
    article_id: string;
    publishedAt: string;
  };
}
const ArticleSchema = new mongoose.Schema<IArticle>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  metaDescription: { type: String, required: true },
  metaKeywords: [{ type: String }],
  ogImage: { type: String },
  author: { type: String, required: true, default: 'NeuraPress AI' },
  publishedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  tags: [{ type: String }],
  category: { type: String, required: true },
  readingTime: { type: Number, required: true },
  featured: { type: Boolean, default: false },
  media: {
    images: [{
      id: { type: String },
      url: { type: String },
      thumbnailUrl: { type: String },
      title: { type: String },
      description: { type: String },
      source: { type: String, enum: ['unsplash', 'pexels', 'vimeo', 'youtube'] },
      type: { type: String, enum: ['image', 'video'] },
      tags: [{ type: String }],
      relevanceScore: { type: Number },
      metadata: {
        width: { type: Number },
        height: { type: Number },
        duration: { type: Number },
        photographer: { type: String },
        publishedAt: { type: String },
        license: { type: String },
        views: { type: Number },
        channel: { type: String },
        uniqueId: { type: String },
      }
    }],
    videos: [{
      id: { type: String },
      url: { type: String },
      thumbnailUrl: { type: String },
      title: { type: String },
      description: { type: String },
      source: { type: String, enum: ['unsplash', 'pexels', 'vimeo', 'youtube'] },
      type: { type: String, enum: ['image', 'video'] },
      tags: [{ type: String }],
      relevanceScore: { type: Number },
      metadata: {
        width: { type: Number },
        height: { type: Number },
        duration: { type: Number },
        photographer: { type: String },
        publishedAt: { type: String },
        license: { type: String },
        views: { type: Number },
        channel: { type: String },
        uniqueId: { type: String },
      }
    }],
    tweets: [{ type: String }],
  },
  seoData: {
    title: { type: String, required: true },
    description: { type: String, required: true },
    keywords: [{ type: String }],
  },
  originalSource: {
    url: { type: String },
    source_id: { type: String },
    article_id: { type: String },
    publishedAt: { type: String },
  },
}, {
  timestamps: true,
});
// Index for better search performance
ArticleSchema.index({ title: 'text', content: 'text', tags: 'text' });
ArticleSchema.index({ publishedAt: -1 });
ArticleSchema.index({ category: 1 });
export default mongoose.models.Article || mongoose.model<IArticle>('Article', ArticleSchema);