import mongoose from 'mongoose';
export interface IUser {
  _id?: string;
  name: string;
  email: string;
  image?: string;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}
const UserSchema = new mongoose.Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: String },
  isAdmin: { type: Boolean, default: false },
}, {
  timestamps: true,
});
// Index for better query performance
UserSchema.index({ email: 1 });
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);