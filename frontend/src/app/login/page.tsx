"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient, signIn } from "@/lib/auth-client";
import Link from "next/link";

const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px",
    fontSize: "15px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.09)",
    color: "#F0F2F7",
    outline: "none",
    fontFamily: "Outfit, sans-serif",
    transition: "border-color 0.2s, box-shadow 0.2s",
};

const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    color: "#94A3B8",
    marginBottom: "8px",
    letterSpacing: "0.03em",
};

export default function LoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.style.borderColor = "rgba(109,91,255,0.6)";
        e.target.style.boxShadow = "0 0 0 3px rgba(109,91,255,0.12)";
    };
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.style.borderColor = "rgba(255,255,255,0.09)";
        e.target.style.boxShadow = "none";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const res = await signIn.email({ email: form.email, password: form.password });
            if (res.error) { setError(res.error.message ?? "Login failed"); setIsLoading(false); return; }
            const orgsRes = await authClient.organization.list();
            if (orgsRes.data && orgsRes.data.length > 0) {
                await authClient.organization.setActive({ organizationId: orgsRes.data[0].id });
            }
            router.push("/");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Login failed");
            setIsLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "Outfit, sans-serif" }}>
            <div style={{ width: "100%", maxWidth: "420px" }}>

                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: "40px" }}>
                    <h1 style={{ fontSize: "36px", fontWeight: 800, background: "linear-gradient(135deg, #A78BFA, #67E8F9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: "8px", letterSpacing: "-0.02em" }}>
                        NexaDesk
                    </h1>
                    <p style={{ fontSize: "14px", color: "var(--text-2)" }}>AI-Powered Support Ticket Management</p>
                </div>

                {/* Card */}
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "40px" }}>
                    <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-1)", marginBottom: "6px" }}>Welcome back</h2>
                    <p style={{ fontSize: "14px", color: "var(--text-2)", marginBottom: "28px" }}>Sign in to your account to continue</p>

                    {error && (
                        <div style={{ padding: "12px 16px", borderRadius: "12px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444", fontSize: "14px", marginBottom: "20px" }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <div>
                            <label style={labelStyle}>EMAIL</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder="you@example.com"
                                style={inputStyle}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                required
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>PASSWORD</label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                placeholder="••••••••"
                                style={inputStyle}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: "100%",
                                padding: "14px",
                                borderRadius: "12px",
                                fontSize: "15px",
                                fontWeight: 700,
                                color: "white",
                                background: isLoading ? "rgba(109,91,255,0.5)" : "var(--primary)",
                                border: "none",
                                cursor: isLoading ? "not-allowed" : "pointer",
                                transition: "all 0.2s",
                                fontFamily: "Outfit, sans-serif",
                                boxShadow: isLoading ? "none" : "0 4px 20px rgba(109,91,255,0.4)",
                                marginTop: "4px",
                            }}
                            onMouseEnter={e => { if (!isLoading) { (e.currentTarget as HTMLElement).style.background = "#5A47FF"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; } }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isLoading ? "rgba(109,91,255,0.5)" : "var(--primary)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
                        >
                            {isLoading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    <p style={{ textAlign: "center", fontSize: "14px", color: "var(--text-2)", marginTop: "24px" }}>
                        Don&apos;t have an account?{" "}
                        <Link href="/signup" style={{ color: "#A78BFA", fontWeight: 600, textDecoration: "none" }}>
                            Sign Up
                        </Link>
                    </p>
                </div>

                {/* Footer */}
                <p style={{ textAlign: "center", fontSize: "12px", color: "var(--text-3)", marginTop: "24px" }}>
                    Secure · Multi-tenant · AI-powered
                </p>
            </div>
        </div>
    );
}