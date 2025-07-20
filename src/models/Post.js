import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const mediaSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => nanoid(12)
  },
  url: { type: String, required: true },
  key: { type: String, required: true },
  type: { type: String, enum: ['image', 'video'], required: true }
});

const postSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => nanoid(12)
  },
  userId: { type: String, ref: 'User', required: true },
  text: { type: String, maxlength: 3000 },
  media: [mediaSchema],
  likes: [{ type: String, ref: 'User' }],
  comments: [{ type: String, ref: 'Comment' }]
}, { timestamps: true });

export default mongoose.model('Post', postSchema);
