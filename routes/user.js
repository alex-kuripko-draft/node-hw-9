import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {User} from '../models/index.js';
import roleMiddleware from "../middleware/role.js";
import {Role} from "../enums/role.enum.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.post('/register', async (req, res) => {
    const {email, password} = req.body;

    try {
        const existingUser = await User.findOne({where: {email}});
        if (existingUser) return res.status(400).json({error: 'Email already registered'});

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({email, password: hashedPassword});
        const token = await generateToken(user);
        res.status(201).json({user, token});
    } catch (error) {
        res.status(500).json({error: 'Internal Server Error'});
    }
});

router.post('/login', async (req, res) => {
    const {email, password} = req.body;

    try {
        if (!email || !password) return res.status(400).json({error: 'Email and Password are required!'});

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.findOne({where: {email}});

        const passwordMatch = await bcrypt.compare(password, user?.password);

        if (!user || !passwordMatch) return res.status(400).json({error: 'Invalid credentials'});

        const token = await generateToken(user);
        res.status(201).json({user, token});
    } catch (error) {
        res.status(500).json({error: 'Internal Server Error'});
    }
});

router.post('/change-password', async (req, res) => {
    const {email, newPassword} = req.body;

    if (!email || !newPassword) return res.status(400).json({message: 'Email and newPassword are required'});
    try {
        const user = await User.findOne({where: {email}});
        if (!user) return res.status(404).json({error: 'User not found'});

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.mustChangePassword = false;
        await user.save();

        res.status(200).json({message: 'Password updated successfully'});
    } catch (error) {
        res.status(500).json({error: 'Internal Server Error'});
    }
});

router.post('/delete-account', authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({where: {id: req.userId}});
        if (!user) return res.status(404).json({error: 'User not found'});

        await user.destroy();
        res.status(200).json({message: 'Account deleted successfully'});
    } catch (error) {
        res.status(500).json({error: 'Internal Server Error'});
    }
});

router.get('/admin', authMiddleware, roleMiddleware(Role.ADMIN), async (req, res) => {
    res.status(200).json({message: 'Welcome!'});
});

router.post('/change-email', authMiddleware, async (req, res) => {
    const {newEmail, password} = req.body;
    const user = await User.findOne({where: {id: req.userId}});

    if (!user) return res.status(404).json({error: 'User not found'});

    try {
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).json({message: 'Incorrect password'});
        }

        const existingUser = await User.findOne({where: {email: newEmail}});
        if (existingUser) {
            return res.status(400).json({message: 'Email already in use'});
        }

        user.email = newEmail;
        await user.save();

        res.json({message: 'Email updated successfully'});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Internal Server Error'});
    }
});

async function generateToken({id, role}) {
    return jwt.sign({userId: id, role}, process.env.JWT_SECRET, {expiresIn: '1h'});
}

export default router;