import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

// Detect if running in production (Render deployment)
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, password, role } = req.body;

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { phone }]
            }
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User with this email or phone already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                phone,
                passwordHash: hashedPassword,
                role: role || 'patient'
            }
        });

        // Create profile based on role
        if (user.role === 'patient') {
            await prisma.patient.create({ data: { userId: user.id } });
        } else if (user.role === 'dentist') {
            await prisma.dentist.create({ data: { userId: user.id, specialization: 'General Dentistry' } });
        }

        res.status(201).json({ message: 'User registered successfully', userId: user.id });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found. Please create an account.' });
        }

        const validPassword = await bcrypt.compare(password, user.passwordHash);

        if (!validPassword) {
            return res.status(401).json({ message: 'Incorrect password. Please try again.' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );

        res.cookie('accessToken', token, {
            httpOnly: true,
            sameSite: IS_PRODUCTION ? 'none' : 'lax',  // 'none' required for cross-origin (Vercel ↔ Render)
            secure: IS_PRODUCTION,                       // true on HTTPS (production), false on localhost
            maxAge: 7 * 24 * 60 * 60 * 1000,            // 7 days
        });

        return res.status(200).json({ message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } });

    } catch (error) {
        console.error('LOGIN ERROR:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

export const googleCallback = async (req: Request, res: Response) => {
    try {
        const { email, name, providerId } = req.body as { email?: string; name?: string; providerId?: string };

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            const generatedPassword = `oauth_${providerId || Date.now()}`;
            const passwordHash = await bcrypt.hash(generatedPassword, 10);
            user = await prisma.user.create({
                data: {
                    email,
                    name: name || email.split("@")[0],
                    phone: "",
                    passwordHash,
                    role: "patient",
                },
            });
            await prisma.patient.create({ data: { userId: user.id } });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: "7d" }
        );

        res.cookie("accessToken", token, {
            httpOnly: true,
            sameSite: IS_PRODUCTION ? "none" : "lax",
            secure: IS_PRODUCTION,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            message: "Google login successful",
            token,
            user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
        });
    } catch (error) {
        console.error("Google callback error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const logout = async (req: Request, res: Response) => {
    res.clearCookie('accessToken', {
        httpOnly: true,
        sameSite: IS_PRODUCTION ? 'none' : 'lax',  // Must match the settings used when cookie was set
        secure: IS_PRODUCTION,                       // Must match the settings used when cookie was set
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

export const getMe = async (req: any, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: { id: true, name: true, email: true, phone: true, role: true }
        });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        console.error('getMe error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
