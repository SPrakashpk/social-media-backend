import mongoose from 'mongoose';
import { nanoid } from 'nanoid';


const userSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => nanoid(12), // 12-char custom ID
  },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String },
  avatar: { type: String },
  bio: { type: String },
  followers: [{ type: String, ref: 'User' }],
  following: [{ type: String, ref: 'User' }],
  isOnline: { type: Boolean, default: false },
  isPrivateAccount: { type: Boolean, default: false }
  // _id: false
}, { timestamps: true });

export default mongoose.model('User', userSchema);
