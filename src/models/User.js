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
  avatar: { type: String },
  bio: { type: String },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // _id: false,
}, { timestamps: true });

export default mongoose.model('User', userSchema);
