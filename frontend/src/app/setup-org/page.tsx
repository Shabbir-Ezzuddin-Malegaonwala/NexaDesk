"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient, useSession } from "@/lib/auth-client";

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

export default function SetupOrgPage() {
    const router = useRouter();
    const { data: session, isPending } = useSession();
    const [orgName, setOrgName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [checking, setChecking] = useState(true);

    // Guard: redirect if not logged in, or if already has an org
    useEffect(() => {
        if (isPending) return;
        if (!session) {
            router.push("/login");
            return;
        }
        // Check if user already has organizations
        authClient.organization.list().then((res) => {
            if (res.data && res.data.length > 0) {
                // Already has an org — activate it and go to dashboard
                authClient.organization.setActive({ organizationId: res.data[0].id }).then(() => {
                    router.push("/");
                });
            } else {
                setChecking(false);
            }
        }).catch(() => {
            setChecking(false);
        });
    }, [session, isPending, router]);

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
            const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
            const orgRes = await authClient.organization.create({
                name: orgName,
                slug: slug,
            });

            if (orgRes.error) {
                setError(orgRes.error.message ?? "Failed to create organization.");
                setIsLoading(false);
                return;
            }

            await authClient.organization.setActive({ organizationId: orgRes.data.id });
            router.push("/");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Something went wrong");
            setIsLoading(false);
        }
    };

    if (isPending || checking) {
        return (
            <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Outfit, sans-serif" }}>
                <p style={{ color: "var(--text-2)", fontSize: "15px" }}>Loading...</p>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "Outfit, sans-serif" }}>
            <div style={{ width: "100%", maxWidth: "440px" }}>

                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: "40px" }}>
                    <h1 style={{ fontSize: "36px", fontWeight: 800, background: "linear-gradient(135deg, #A78BFA, #67E8F9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: "8px", letterSpacing: "-0.02em" }}>
                        NexaDesk
                    </h1>
                    <p style={{ fontSize: "14px", color: "var(--text-2)" }}>AI-Powered Support Ticket Management</p>
                </div>

                {/* Card */}
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "40px" }}>
                    <h2 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-1)", marginBottom: "6px" }}>Set Up Your Organization</h2>
                    <p style={{ fontSize: "14px", color: "var(--text-2)", marginBottom: "28px" }}>
                        Welcome, {session?.user?.name ?? "there"}! Create your organization to get started.
                    </p>

                    {error && (
                        <div style={{ padding: "12px 16px", borderRadius: "12px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444", fontSize: "14px", marginBottom: "20px" }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                        <div>
                            <p style={{ fontSize: "11px", fontWeight: 700, color: "#8B5CF6", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>
                                Your Organization
                            </p>
                            <label style={labelStyle}>ORGANIZATION NAME</label>
                            <input
                                type="text"
                                value={orgName}
                                onChange={(e) => setOrgName(e.target.value)}
                                placeholder="e.g. Acme Corp, My Company"
                                style={inputStyle}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                                required
                                minLength={2}
                                autoFocus
                            />
                            <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "6px" }}>
                                All your tickets will be scoped to this organization.
                            </p>
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
                            {isLoading ? "Creating organization..." : "Create Organization"}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p style={{ textAlign: "center", fontSize: "12px", color: "var(--text-3)", marginTop: "24px" }}>
                    Secure · Multi-tenant · AI-powered
                </p>
            </div>
        </div>
    );
}
