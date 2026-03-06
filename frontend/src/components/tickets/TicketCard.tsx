"use client";

import Link from "next/link";
import type { Ticket } from "@/types";

const statusStyles: Record<string, { color: string; bg: string; label: string }> = {
    open:        { color: "#3B82F6", bg: "rgba(59,130,246,0.12)",  label: "Open" },
    in_progress: { color: "#F59E0B", bg: "rgba(245,158,11,0.12)",  label: "In Progress" },
    resolved:    { color: "#10B981", bg: "rgba(16,185,129,0.12)",  label: "Resolved" },
    closed:      { color: "#6B7280", bg: "rgba(107,114,128,0.12)", label: "Closed" },
};

const priorityStyles: Record<string, { color: string; bg: string }> = {
    critical: { color: "#EF4444", bg: "rgba(239,68,68,0.12)" },
    high:     { color: "#F97316", bg: "rgba(249,115,22,0.12)" },
    medium:   { color: "#EAB308", bg: "rgba(234,179,8,0.12)" },
    low:      { color: "#22C55E", bg: "rgba(34,197,94,0.12)" },
};

export default function TicketCard({ ticket }: { ticket: Ticket }) {
    const status = statusStyles[ticket.status] ?? statusStyles.open;
    const priority = ticket.priority ? priorityStyles[ticket.priority] : null;

    return (
        <Link href={`/tickets/${ticket.id}`}>
            <div style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "14px",
                padding: "20px 24px",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "16px",
            }}
                onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(109,91,255,0.3)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                }}
                onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.025)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
            >
                {/* Status dot */}
                <div style={{
                    width: "10px", height: "10px", borderRadius: "50%",
                    background: status.color, flexShrink: 0,
                    boxShadow: `0 0 8px ${status.color}`,
                }} />

                {/* Main content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                        <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-1)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {ticket.title}
                        </h3>
                    </div>
                    <p style={{ fontSize: "13px", color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "10px" }}>
                        {ticket.description}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "12px", color: "var(--text-3)" }}>{ticket.reporterName}</span>
                        <span style={{ color: "var(--text-3)", fontSize: "10px" }}>•</span>
                        <span style={{ fontSize: "12px", color: "var(--text-3)" }}>
                            {new Date(ticket.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                        {ticket.category && (
                            <>
                                <span style={{ color: "var(--text-3)", fontSize: "10px" }}>•</span>
                                <span style={{ fontSize: "12px", color: "#8B5CF6", fontWeight: 500 }}>{ticket.category}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Badges */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                    <span style={{
                        padding: "4px 10px", borderRadius: "99px", fontSize: "12px", fontWeight: 600,
                        color: status.color, background: status.bg,
                    }}>{status.label}</span>
                    {priority && (
                        <span style={{
                            padding: "4px 10px", borderRadius: "99px", fontSize: "12px", fontWeight: 600,
                            color: priority.color, background: priority.bg,
                        }}>{ticket.priority!.charAt(0).toUpperCase() + ticket.priority!.slice(1)}</span>
                    )}
                </div>
            </div>
        </Link>
    );
}
