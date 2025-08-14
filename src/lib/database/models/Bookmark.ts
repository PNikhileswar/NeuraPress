export interface Bookmark {
  _id?: string;
  userId: string;
  userEmail: string;
  articleId: string;
  articleTitle: string;
  articleSlug: string;
  articleExcerpt: string;
  articleCategory: string;
  articleImage?: string;
  bookmarkedAt: Date;
}
// MongoDB schema structure for bookmarks collection
export const BookmarkSchema = {
  userId: { type: 'string', required: true },
  userEmail: { type: 'string', required: true },
  articleId: { type: 'string', required: true },
  articleTitle: { type: 'string', required: true },
  articleSlug: { type: 'string', required: true },
  articleExcerpt: { type: 'string', required: true },
  articleCategory: { type: 'string', required: true },
  articleImage: { type: 'string', required: false },
  bookmarkedAt: { type: Date, default: Date.now },
};