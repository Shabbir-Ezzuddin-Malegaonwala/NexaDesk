"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { api } from "@/lib/api";
import Link from "next/link";

interface Stats {
    open: number;
    in_progress: number;
    resolved: number;
    closed: number;
    total: number;
}

export default function HomePage() {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState<Stats>({ open: 0, in_progress: 0, resolved: 0, closed: 0, total: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isPending && !session) router.push("/login");
    }, [session, isPending]);

    useEffect(() => {
        if (session) fetchStats();
    }, [session]);

    const fetchStats = async () => {
        try {
            const [open, inProgress, resolved, closed] = await Promise.all([
                api.get<{ pagination: { total: number } }>("/tickets?status=open&limit=1"),
                api.get<{ pagination: { total: number } }>("/tickets?status=in_progress&limit=1"),
                api.get<{ pagination: { total: number } }>("/tickets?status=resolved&limit=1"),
                api.get<{ pagination: { total: number } }>("/tickets?status=closed&limit=1"),
            ]);
            setStats({
                open: open.pagination?.total ?? 0,
                in_progress: inProgress.pagination?.total ?? 0,
                resolved: resolved.pagination?.total ?? 0,
                closed: closed.pagination?.total ?? 0,
                total: (open.pagination?.total ?? 0) + (inProgress.pagination?.total ?? 0) +
                    (resolved.pagination?.total ?? 0) + (closed.pagination?.total ?? 0),
            });
        } catch { }
        finally { setIsLoading(false); }
    };

    if (isPending || !session) return null;

    const statCards = [
        { label: "Total Tickets", value: stats.total, color: "#A78BFA", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.2)", icon: "🎫" },
        { label: "Open", value: stats.open, color: "#3B82F6", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.2)", icon: "🔵" },
        { label: "In Progress", value: stats.in_progress, color: "#F59E0B", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.2)", icon: "🔄" },
        { label: "Resolved", value: stats.resolved, color: "#10B981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.2)", icon: "✅" },
    ];

    return (
        <div style={{ minHeight: "100vh", padding: "48px 40px", maxWidth: "1100px", margin: "0 auto" }}>

            {/* Header */}
            <div style={{ marginBottom: "40px" }}>
                <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--primary)", letterSpacing: "0.1em", marginBottom: "8px", textTransform: "uppercase" }}>
                    Dashboard
                </p>
                <h1 style={{ fontSize: "32px", fontWeight: 800, color: "var(--text-1)", marginBottom: "8px", letterSpacing: "-0.02em" }}>
                    Welcome back, {session.user.name}
                </h1>
                <p style={{ fontSize: "15px", color: "var(--text-2)", lineHeight: 1.6 }}>
                    Live overview of your organization ticket activity.
                </p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "32px" }}>
                {statCards.map((card, i) => (
                    <div key={i} style={{
                        background: card.bg,
                        border: `1px solid ${card.border}`,
                        borderRadius: "16px",
                        padding: "28px 24px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                        transition: "transform 0.2s, box-shadow 0.2s",
                        cursor: "default",
                        animation: `fadeUp 0.4s ease ${i * 0.07}s both`,
                    }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                            (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 32px ${card.bg}`;
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                            (e.currentTarget as HTMLElement).style.boxShadow = "none";
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontSize: "13px", fontWeight: 600, color: card.color }}>{card.label}</span>
                            <span style={{ fontSize: "18px" }}>{card.icon}</span>
                        </div>
                        <div style={{ fontSize: "42px", fontWeight: 800, color: card.color, lineHeight: 1 }}>
                            {isLoading ? "—" : card.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "16px",
                padding: "32px",
                marginBottom: "32px",
                animation: "fadeUp 0.4s ease 0.3s both",
            }}>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-1)", marginBottom: "6px" }}>Quick Actions</h2>
                <p style={{ fontSize: "14px", color: "var(--text-2)", marginBottom: "24px" }}>
                    Manage your support tickets efficiently
                </p>
                <div style={{ display: "flex", gap: "12px" }}>
                    <Link href="/tickets/new">
                        <button style={{
                            padding: "12px 24px",
                            background: "var(--primary)",
                            color: "white",
                            border: "none",
                            borderRadius: "10px",
                            fontSize: "14px",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.2s",
                            boxShadow: "0 4px 14px rgba(109,91,255,0.3)",
                            fontFamily: "Outfit, sans-serif",
                        }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.background = "#5A47FF";
                                (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.background = "var(--primary)";
                                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                            }}
                        >
                            + New Ticket
                        </button>
                    </Link>
                    <Link href="/tickets">
                        <button style={{
                            padding: "12px 24px",
                            background: "rgba(255,255,255,0.05)",
                            color: "var(--text-2)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "10px",
                            fontSize: "14px",
                            fontWeight: 500,
                            cursor: "pointer",
                            transition: "all 0.2s",
                            fontFamily: "Outfit, sans-serif",
                        }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.color = "var(--text-1)";
                                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.2)";
                                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)";
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.color = "var(--text-2)";
                                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)";
                                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                            }}
                        >
                            View All Tickets
                        </button>
                    </Link>
                </div>
            </div>

            {/* Closed stat */}
            <div style={{
                background: "rgba(107,114,128,0.08)",
                border: "1px solid rgba(107,114,128,0.15)",
                borderRadius: "16px",
                padding: "20px 28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                animation: "fadeUp 0.4s ease 0.35s both",
            }}>
                <div>
                    <p style={{ fontSize: "13px", color: "#9CA3AF", fontWeight: 500, marginBottom: "4px" }}>Closed Tickets</p>
                    <p style={{ fontSize: "28px", fontWeight: 800, color: "#9CA3AF" }}>{isLoading ? "—" : stats.closed}</p>
                </div>
                <span style={{ fontSize: "32px" }}>🔒</span>
            </div>

        </div>
    );
}