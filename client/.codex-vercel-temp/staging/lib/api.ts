import { getApiBaseUrl } from "./api-base";

export async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${getApiBaseUrl()}${endpoint}`;

    const response = await fetch(url, {
        credentials: "include",   // Always send cookies (accessToken)
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const err = new Error(
            errorData.message || response.statusText || "Something went wrong"
        ) as any;
        err.status = response.status;
        throw err;
    }

    return response.json();
}

export const api = {
    get: <T>(endpoint: string, options?: RequestInit) =>
        apiFetch<T>(endpoint, { ...options, method: "GET" }),
    post: <T>(endpoint: string, body: any, options?: RequestInit) =>
        apiFetch<T>(endpoint, {
            ...options,
            method: "POST",
            body: JSON.stringify(body),
        }),
    put: <T>(endpoint: string, body: any, options?: RequestInit) =>
        apiFetch<T>(endpoint, {
            ...options,
            method: "PUT",
            body: JSON.stringify(body),
        }),
    delete: <T>(endpoint: string, options?: RequestInit) =>
        apiFetch<T>(endpoint, { ...options, method: "DELETE" }),
};


