import mongoose from 'mongoose';
export interface IComment {
  _id?: string;
  articleId: string;
  userId: string;
  userEmail: string;
  userName: string;
  userImage?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  replies: IComment[];
  parentId?: string;
}
const CommentSchema = new mongoose.Schema<IComment>({
  articleId: { type: String, required: true },
  userId: { type: String, required: true },
  userEmail: { type: String, required: true },
  userName: { type: String, required: true },
  userImage: { type: String },
  content: { type: String, required: true },
  parentId: { type: String }, // For replies
}, {
  timestamps: true,
});
// Index for better query performance
CommentSchema.index({ articleId: 1, createdAt: -1 });
CommentSchema.index({ userId: 1 });
export default mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);