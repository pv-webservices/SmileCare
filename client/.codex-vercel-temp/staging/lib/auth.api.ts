import { api } from "./api";

const CREDS = { credentials: "include" as RequestCredentials };

export interface LoginPayload {
    email: string;
    password: string;
}

export interface SignupPayload {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
}

export interface AuthUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
}

export interface AuthResponse {
    user: AuthUser;
    message?: string;
}

export const login = (payload: LoginPayload) =>
    api.post<AuthResponse>("/api/auth/login", payload, CREDS);

export const signup = (payload: SignupPayload) =>
    api.post<AuthResponse>("/api/auth/signup", payload, CREDS);

export const getMe = () =>
    api.get<AuthUser>("/api/auth/me", CREDS);

export const logout = () =>
    api.post<{ message: string }>("/api/auth/logout", {}, CREDS);
