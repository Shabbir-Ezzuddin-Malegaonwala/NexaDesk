const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(error.error ?? "Request failed");
    }

    return res.json();
}

export const api = {
    get: <T>(endpoint: string) => apiFetch<T>(endpoint),
    post: <T>(endpoint: string, body: unknown) =>
        apiFetch<T>(endpoint, {
            method: "POST",
            body: JSON.stringify(body),
        }),
    put: <T>(endpoint: string, body: unknown) =>
        apiFetch<T>(endpoint, {
            method: "PUT",
            body: JSON.stringify(body),
        }),
    patch: <T>(endpoint: string, body: unknown) =>
        apiFetch<T>(endpoint, {
            method: "PATCH",
            body: JSON.stringify(body),
        }),
    delete: <T>(endpoint: string) =>
        apiFetch<T>(endpoint, { method: "DELETE" }),
};