"use client";

import { useEffect, useState } from "react";
import { useTicketStore } from "@/store/ticketStore";
import CommentSection from "./CommentSection";
import AiResponseStream from "@/components/ai/AiResponseStream";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Link from "next/link";

const statusStyles: Record<string, { color: string; bg: string; border: string; label: string }> = {
    open:        { color: "#3B82F6", bg: "rgba(59,130,246,0.1)",   border: "rgba(59,130,246,0.25)",   label: "Open" },
    in_progress: { color: "#F59E0B", bg: "rgba(245,158,11,0.1)",   border: "rgba(245,158,11,0.25)",   label: "In Progress" },
    resolved:    { color: "#10B981", bg: "rgba(16,185,129,0.1)",   border: "rgba(16,185,129,0.25)",   label: "Resolved" },
    closed:      { color: "#6B7280", bg: "rgba(107,114,128,0.1)", border: "rgba(107,114,128,0.25)",  label: "Closed" },
};

const priorityStyles: Record<string, { color: string; bg: string; border: string }> = {
    critical: { color: "#EF4444", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)" },
    high:     { color: "#F97316", bg: "rgba(249,115,22,0.1)",  border: "rgba(249,115,22,0.25)" },
    medium:   { color: "#EAB308", bg: "rgba(234,179,8,0.1)",   border: "rgba(234,179,8,0.25)" },
    low:      { color: "#22C55E", bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.25)" },
};

const STATUS_OPTIONS = ["open", "in_progress", "resolved", "closed"] as const;

interface TicketDetailProps { ticketId: string; }

export default function TicketDetail({ ticketId }: TicketDetailProps) {
    const { selectedTicket, comments, isLoading, error, fetchTicketById, updateStatus, clearError } = useTicketStore();
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [statusMsg, setStatusMsg] = useState<string | null>(null);

    useEffect(() => { fetchTicketById(ticketId); }, [ticketId]);

    const handleStatusChange = async (newStatus: "open" | "in_progress" | "resolved" | "closed") => {
        setStatusUpdating(true);
        setStatusMsg(null);
        try {
            await updateStatus(ticketId, newStatus);
            setStatusMsg("Status updated!");
            setTimeout(() => setStatusMsg(null), 2000);
        } catch { setStatusMsg("Failed to update"); }
        finally { setStatusUpdating(false); }
    };

    if (isLoading) return <LoadingSpinner />;

    if (error) return (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "16px", padding: "32px", textAlign: "center" }}>
            <p style={{ color: "#EF4444", fontSize: "15px", marginBottom: "16px" }}>{error}</p>
            <button onClick={() => { clearError(); fetchTicketById(ticketId); }}
                style={{ padding: "10px 20px", background: "var(--primary)", color: "white", border: "none", borderRadius: "10px", fontSize: "14px", cursor: "pointer", fontFamily: "Outfit, sans-serif" }}>
                Retry
            </button>
        </div>
    );

    if (!selectedTicket) return (
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "48px", textAlign: "center" }}>
            <p style={{ color: "var(--text-2)", fontSize: "16px" }}>Ticket not found</p>
        </div>
    );

    const status = statusStyles[selectedTicket.status] ?? statusStyles.open;
    const priority = selectedTicket.priority ? priorityStyles[selectedTicket.priority] : null;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* Main ticket card */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "36px", animation: "fadeUp 0.4s ease both" }}>

                {/* Title row */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "24px", marginBottom: "16px" }}>
                    <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.02em", lineHeight: 1.3 }}>
                        {selectedTicket.title}
                    </h1>
                    <div style={{ display: "flex", gap: "8px", flexShrink: 0, paddingTop: "4px" }}>
                        <span style={{ padding: "5px 14px", borderRadius: "99px", fontSize: "13px", fontWeight: 600, color: status.color, background: status.bg, border: `1px solid ${status.border}` }}>
                            {status.label}
                        </span>
                        {priority && (
                            <span style={{ padding: "5px 14px", borderRadius: "99px", fontSize: "13px", fontWeight: 600, color: priority.color, background: priority.bg, border: `1px solid ${priority.border}` }}>
                                {selectedTicket.priority!.charAt(0).toUpperCase() + selectedTicket.priority!.slice(1)}
                            </span>
                        )}
                    </div>
                </div>

                {/* Description */}
                <p style={{ fontSize: "15px", color: "var(--text-2)", lineHeight: 1.7, marginBottom: "32px" }}>
                    {selectedTicket.description}
                </p>

                {/* Meta grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px", padding: "24px", background: "rgba(255,255,255,0.02)", borderRadius: "14px", marginBottom: "28px", border: "1px solid rgba(255,255,255,0.04)" }}>
                    {[
                        { label: "Reporter", value: selectedTicket.reporterName },
                        { label: "Email", value: selectedTicket.reporterEmail },
                        { label: "Category", value: selectedTicket.category ?? "Not classified" },
                        { label: "Created", value: new Date(selectedTicket.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) },
                    ].map((item, i) => (
                        <div key={i}>
                            <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "6px" }}>{item.label}</p>
                            <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-1)" }}>{item.value}</p>
                        </div>
                    ))}
                </div>

                {/* Status changer */}
                <div style={{ marginBottom: "24px" }}>
                    <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "12px" }}>
                        Change Status
                    </p>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                        {STATUS_OPTIONS.map((s) => {
                            const st = statusStyles[s];
                            const isActive = selectedTicket.status === s;
                            return (
                                <button key={s} disabled={statusUpdating || isActive}
                                    onClick={() => handleStatusChange(s)}
                                    style={{
                                        padding: "8px 18px", borderRadius: "10px", fontSize: "13px", fontWeight: 600,
                                        cursor: isActive ? "default" : "pointer", transition: "all 0.15s",
                                        color: isActive ? st.color : "var(--text-2)",
                                        background: isActive ? st.bg : "rgba(255,255,255,0.03)",
                                        border: `1px solid ${isActive ? st.border : "rgba(255,255,255,0.08)"}`,
                                        fontFamily: "Outfit, sans-serif",
                                    }}
                                    onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.color = st.color; (e.currentTarget as HTMLElement).style.background = st.bg; } }}
                                    onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.color = "var(--text-2)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; } }}
                                >
                                    {s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
                                </button>
                            );
                        })}
                        {statusUpdating && <span style={{ fontSize: "13px", color: "var(--text-3)" }}>Updating...</span>}
                        {statusMsg && <span style={{ fontSize: "13px", color: statusMsg.includes("Failed") ? "#EF4444" : "#10B981", fontWeight: 500 }}>{statusMsg}</span>}
                    </div>
                </div>

                {/* Edit button */}
                <Link href={`/tickets/${ticketId}/edit`}>
                    <button style={{
                        padding: "10px 20px", background: "rgba(255,255,255,0.04)", color: "var(--text-2)",
                        border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", fontSize: "14px",
                        fontWeight: 500, cursor: "pointer", transition: "all 0.15s", fontFamily: "Outfit, sans-serif",
                    }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.color = "var(--text-1)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLElement).style.color = "var(--text-2)"; }}
                    >
                        ✏️ Edit Ticket
                    </button>
                </Link>
            </div>

            {/* AI Response */}
            <div style={{ background: "rgba(109,91,255,0.05)", border: "1px solid rgba(109,91,255,0.15)", borderRadius: "20px", padding: "32px", animation: "fadeUp 0.4s ease 0.1s both" }}>
                <AiResponseStream ticketId={ticketId} />
            </div>

            {/* Comments */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "32px", animation: "fadeUp 0.4s ease 0.15s both" }}>
                <CommentSection ticketId={ticketId} comments={comments} />
            </div>
        </div>
    );
}