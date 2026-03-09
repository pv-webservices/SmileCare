import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

function normalizePhone(phone?: string | null) {
    const trimmed = phone?.trim();
    return trimmed ? trimmed : null;
}

function signAccessToken(id: string, role: string) {
    return jwt.sign({ id, role }, process.env.JWT_SECRET!, { expiresIn: "7d" });
}

function setAccessTokenCookie(res: Response, token: string) {
    res.cookie("accessToken", token, {
        httpOnly: true,
        sameSite: IS_PRODUCTION ? "none" : "lax",
        secure: IS_PRODUCTION,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
}

function toUserPayload(user: { id: string; name: string; email: string; phone: string | null; role: string }) {
    return { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role };
}

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, password, role } = req.body;
        const normalizedPhone = normalizePhone(phone);

        const existingUser = await prisma.user.findFirst({
            where: normalizedPhone
                ? { OR: [{ email }, { phone: normalizedPhone }] }
                : { email },
        });

        if (existingUser) {
            return res.status(400).json({ message: "User with this email or phone already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                phone: normalizedPhone as any,
                passwordHash: hashedPassword,
                role: role || "patient",
            },
        });

        if (user.role === "patient") {
            await prisma.patient.create({ data: { userId: user.id } });
        } else if (user.role === "dentist") {
            await prisma.dentist.create({ data: { userId: user.id, specialization: "General Dentistry" } });
        }

        res.status(201).json({ message: "User registered successfully", userId: user.id });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: "User not found. Please create an account." });
        }

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
            return res.status(401).json({ message: "Incorrect password. Please try again." });
        }

        const token = signAccessToken(user.id, user.role);
        setAccessTokenCookie(res, token);

        return res.status(200).json({
            message: "Login successful",
            token,
            user: toUserPayload(user),
        });
    } catch (error) {
        console.error("LOGIN ERROR:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const googleCallback = async (req: Request, res: Response) => {
    try {
        const { email, name } = req.body as { email?: string; name?: string };

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    name: name || email.split("@")[0],
                    phone: null as any,
                    passwordHash: await bcrypt.hash(`oauth_${email}`, 10),
                    role: "patient",
                },
            });
            await prisma.patient.create({ data: { userId: user.id } });
        }

        const token = signAccessToken(user.id, user.role);
        setAccessTokenCookie(res, token);

        return res.status(200).json({
            message: "Google login successful",
            token,
            user: toUserPayload(user),
        });
    } catch (error) {
        console.error("Google callback error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const logout = async (_req: Request, res: Response) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        sameSite: IS_PRODUCTION ? "none" : "lax",
        secure: IS_PRODUCTION,
    });
    res.status(200).json({ message: "Logged out successfully" });
};

export const getMe = async (req: any, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.id },
            select: { id: true, name: true, email: true, phone: true, role: true },
        });
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        console.error("getMe error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

