import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import { generateToken } from '../utils/generateToken.js';

export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password, confirmPassword, phone } = req.body;

       
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

       
        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email or phone' });
        }

        let profileImageUrl;
        if (req.file) {
            profileImageUrl = await uploadToCloudinary(req.file);
        }

       
        const user = new User({
            username,
            email,
            password,
            phone,
            profileImage: profileImageUrl,
            role: email === process.env.ADMIN_EMAIL ? 'admin' : 'user'
        });

        await user.save();

       
        const token = generateToken((user._id as unknown as string).toString(), res);

        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            profileImage: user.profileImage,
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

       
        const user = await User.findOne({ email }) as typeof User.prototype;
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

       
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

       
        const token = generateToken((user._id as unknown as string).toString(), res);

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            profileImage: user.profileImage,
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};