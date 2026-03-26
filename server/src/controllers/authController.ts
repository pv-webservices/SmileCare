import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/authMiddleware";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

// Validate JWT_SECRET is present at startup — fail fast rather than silent crash
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("FATAL: JWT_SECRET environment variable is not set");
}

// ─── Validation Schemas ──────────────────────────────────────────────────────

const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().max(20).optional(),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  // 'role' is intentionally excluded — never trust client-supplied role
});

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required").max(128),
});

const GoogleCallbackSchema = z.object({
  email: z.string().email("Invalid email"),
  name: z.string().max(100).optional(),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizePhone(phone?: string | null) {
  const trimmed = phone?.trim();
  return trimmed ? trimmed : null;
}

function signAccessToken(id: string, role: string) {
  return jwt.sign({ id, role }, JWT_SECRET as string, { expiresIn: "7d" });
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

// ─── Controllers ─────────────────────────────────────────────────────────────

export const register = async (req: Request, res: Response) => {
  try {
    // Validate and sanitize input — role is stripped entirely
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0].message });
    }
    const { name, email, phone, password } = parsed.data;
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
        role: "patient", // CRITICAL: hardcoded — clients cannot self-elevate
      },
    });

    if (user.role === "patient") {
      await prisma.patient.create({ data: { userId: user.id } });
    }

    res.status(201).json({ message: "User registered successfully", userId: user.id });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0].message });
    }
    const { email, password } = parsed.data;

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
    const parsed = GoogleCallbackSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.errors[0].message });
    }
    const { email, name } = parsed.data;

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Use cryptographically random bytes — not a predictable pattern
      const oauthPassword = crypto.randomBytes(32).toString("hex");
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split("@")[0],
          phone: null as any,
          passwordHash: await bcrypt.hash(oauthPassword, 10),
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

// Use AuthRequest instead of 'any' for proper TypeScript type safety
export const getMe = async (req: AuthRequest, res: Response) => {
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
