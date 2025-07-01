import mongoose from 'mongoose';

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
    images: string[];
    videos: string[];
    tweets: string[];
  };
  seoData: {
    title: string;
    description: string;
    keywords: string[];
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
  author: { type: String, required: true, default: 'TrendWise AI' },
  publishedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  tags: [{ type: String }],
  category: { type: String, required: true },
  readingTime: { type: Number, required: true },
  featured: { type: Boolean, default: false },
  media: {
    images: [{ type: String }],
    videos: [{ type: String }],
    tweets: [{ type: String }],
  },
  seoData: {
    title: { type: String, required: true },
    description: { type: String, required: true },
    keywords: [{ type: String }],
  },
}, {
  timestamps: true,
});

// Index for better search performance
ArticleSchema.index({ title: 'text', content: 'text', tags: 'text' });
ArticleSchema.index({ publishedAt: -1 });
ArticleSchema.index({ category: 1 });

export default mongoose.models.Article || mongoose.model<IArticle>('Article', ArticleSchema);
