import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendOTP } from '../utils/sendOTP.js';
import Post from '../models/Post.js';

export const registerUser = async (req, res) => {
    let newUser = null;
    try {
        const { name, email, password, username, bio = '', avatar = '' } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.sendError('Email already in use', 400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        newUser = new User({
            name,
            email,
            username,
            password: hashedPassword,
            bio,
            avatar,
            otp,
            otpExpiresAt: Date.now() + 10 * 60 * 1000,
            isVerified: false,
        });

        await newUser.save();
        // await sendOTP(email, otp);

        // return res.sendSuccess(
        //     {
        //         email,
        //         message: 'OTP sent to email',
        //     },
        //     'Registration initiated. Verify OTP to continue.',
        //     201
        // );
        // Create JWT
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });

        // Return success
        return res.sendSuccess({
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                bio: newUser.bio,
                avatar: newUser.avatar,
            },
            token,
        }, 'User registered successfully', 200);
    } catch (err) {
        if (newUser && newUser._id) {
            await User.findByIdAndDelete(newUser._id);
            console.log(`Rolled back user: ${newUser._id}`);
        }
        console.error('Register error:', err); // ✅ Add this
        return res.sendError('Server error', 500, err);
    }
};

export const checkUsernameAvailability = async (req, res) => {
    try {
        const { username } = req.params;
        //console.log('Checking username:', username);

        const exists = await User.exists({ username: username.toLowerCase() });
        //console.log('Exists:', exists);

        return res.sendSuccess({ available: !exists });
    } catch (err) {
        return res.sendError('Error checking username', 500);

    }

};

// controllers/auth.controller.js
export const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.sendError('User not found', 404);
        }

        // OTP mismatch
        if (user.otp !== otp) {
            await User.deleteOne({ email });
            return res.sendError('Invalid OTP. User deleted.', 400);
        }

        // OTP expired
        if (user.otpExpiresAt < Date.now()) {
            await User.deleteOne({ email });
            return res.sendError('OTP expired. User deleted.', 400);
        }

        //  OTP is correct
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiresAt = undefined;
        await user.save();

        return res.sendSuccess({ message: 'OTP verified successfully' });
    } catch (err) {
        console.error('OTP verification error:', err);
        return res.sendError('Server error', 500, err);
    }
};

export const resendOTP = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.sendError('User not found', 404);
        }

        if (user.isVerified) {
            return res.sendError('User already verified', 400);
        }

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes from now

        // Update user with new OTP
        user.otp = otp;
        user.otpExpiresAt = otpExpiresAt;
        await user.save();

        // Send the OTP again
        await sendOTP(email, otp);

        return res.sendSuccess(
            { email, message: 'OTP resent to email' },
            'OTP resent successfully',
            200
        );
    } catch (err) {
        console.error('Resend OTP error:', err);
        return res.sendError('Failed to resend OTP', 500, err);
    }
};



export const loginUser = async (req, res) => {
    try {
        const { email, password, } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.sendError('Invalid Username or Password', 400);
        }

        // check password
        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            return res.sendError('Invalid Username or Password', 400);
        }

        // Create JWT
        const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });

        // Return success
        return res.sendSuccess({
            user: {
                id: existingUser._id,
                name: existingUser.name,
                email: existingUser.email,
                bio: existingUser.bio,
                avatar: existingUser.avatar,
            },
            token,
        }, 'User loggedin successfully', 200);

    } catch (err) {
        return res.sendError('Server error', 500, err);
    }
};

export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const user = await User.findById(userId).select('-password'); // remove password
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const posts = await Post.find({ user: userId }).sort({ createdAt: -1 });

        // Optional: You can populate likes/comments if needed
        // .populate('likes').populate('comments')

        // Count followers & following
        const followersCount = user.followers?.length || 0;
        const followingCount = user.following?.length || 0;

        const userData = {
            ...user.toObject(),
            posts,
            postCount: posts.length,
            followersCount,
            followingCount,
        };

        res.status(200).json({ data: userData });
    } catch (error) {
        console.error('Error fetching current user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


