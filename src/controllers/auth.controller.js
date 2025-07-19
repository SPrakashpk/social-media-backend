import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registerUser = async (req, res) => {
    let newUser = null;
    try {
        const { name, email, password, bio, avatar } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.sendError('Email already in use', 400);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        newUser = new User({
            name,
            email,
            password: hashedPassword,
            bio: bio || '',
            avatar: avatar || ''
        });

        await newUser.save();

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
        }, 'User registered successfully', 201);

    } catch (err) {
        // Rollback: delete the created user if saved but something failed afterward
        if (newUser && newUser._id) {
            await User.findByIdAndDelete(newUser._id);
            console.log(`Rolled back user: ${newUser._id}`);
        }
        return res.sendError('Server error', 500, err);
    }
};

export const loginUser = (req, res) => {
    // Implement login logic
    res.send('User logged in');
};

export const getCurrentUser = (req, res) => {
    // Implement get current user logic
    res.send('Current user info');
};
