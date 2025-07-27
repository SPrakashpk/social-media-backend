import mongoose from 'mongoose';
import { nanoid } from 'nanoid';


const userSchema = new mongoose.Schema({
  _id: { type: String, default: () => nanoid(12),},
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String },
  avatar: { type: String },
  bio: { type: String },
  followers: [{ type: String, ref: 'User' }],
  following: [{ type: String, ref: 'User' }],
  isOnline: { type: Boolean, default: false },
  isPrivateAccount: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false }, // <-- New
  otp: { type: String }, // <-- OTP value
  otpExpiresAt: { type: Date }, // <-- Expiry time
}, { timestamps: true });

export default mongoose.model('User', userSchema);
