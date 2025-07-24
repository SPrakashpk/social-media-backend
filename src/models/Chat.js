import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const ChatSchema = new mongoose.Schema({
   _id: {
        type: String,
        default: () => nanoid(12), // 12-char custom ID
      },
  isGroup: { type: Boolean, default: false },
  name: String,
  avatar: String,
  members: [{ type: String, ref: 'User' }],
  admins: [{ type: String, ref: 'User' }],
  createdBy: { type: String, ref: 'User' },
  latestMessage: { type: String, ref: 'Message' },
  typing: [{ type: String, ref: 'User' }]
}, { timestamps: true });

export default mongoose.model('Chat', ChatSchema);