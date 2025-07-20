import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const commentSchema = new mongoose.Schema({
    _id: {
      type: String,
      default: () => nanoid(12), // 12-char custom ID
    },
  postId: { type: String, ref: 'Post', required: true },
  userId: { type: String, ref: 'User', required: true },
  text: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('Comment', commentSchema);
