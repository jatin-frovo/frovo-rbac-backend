import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const register = async (req, res) => {
    try {
        const { username, email, phoneNo, password, role } = req.body;
        //hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        //create user
        const newUser = new User({ username, email, phoneNo, password: hashedPassword, role });
        await newUser.save();
        res.status(201).json({ message: `User registered successfully with username ${username}` });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
            
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email or phoneNo
        const user = await User.findOne({ $or: [{ email }, { phoneNo: email }] });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Set token in cookie (optional)
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        });

        // ✅ Send token in response
        res.status(200).json({
            message: 'User logged in successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};


export { register, login };