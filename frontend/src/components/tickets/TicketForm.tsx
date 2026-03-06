"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTicketStore } from "@/store/ticketStore";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { Ticket } from "@/types";

interface TicketFormProps {
    ticket?: Ticket;
    isEditing?: boolean;
}

const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px",
    fontSize: "15px",
    background: "rgba(255,255,255,0.04)",
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

export default function TicketForm({ ticket, isEditing = false }: TicketFormProps) {
    const router = useRouter();
    const { createTicket, updateTicket, isLoading, error } = useTicketStore();
    const { user } = useCurrentUser();

    const [form, setForm] = useState({
        title: ticket?.title ?? "",
        description: ticket?.description ?? "",
        reporterName: ticket?.reporterName ?? user?.name ?? "",
        reporterEmail: ticket?.reporterEmail ?? user?.email ?? "",
        status: ticket?.status ?? "open",
    });

    const [formError, setFormError] = useState<string | null>(null);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        e.target.style.borderColor = "rgba(109,91,255,0.6)";
        e.target.style.boxShadow = "0 0 0 3px rgba(109,91,255,0.12)";
    };
    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        e.target.style.borderColor = "rgba(255,255,255,0.09)";
        e.target.style.boxShadow = "none";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (form.title.length < 5) { setFormError("Title must be at least 5 characters"); return; }
        if (form.description.length < 10) { setFormError("Description must be at least 10 characters"); return; }
        if (!form.reporterEmail.includes("@")) { setFormError("Please enter a valid email"); return; }

        if (isEditing && ticket) {
            await updateTicket(ticket.id, form);
            router.push(`/tickets/${ticket.id}`);
        } else {
            const newTicket = await createTicket(form);
            if (newTicket) router.push(`/tickets/${newTicket.id}`);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* Error */}
            {(formError || error) && (
                <div style={{
                    padding: "14px 18px",
                    borderRadius: "12px",
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    color: "#EF4444",
                    fontSize: "14px",
                    fontWeight: 500,
                }}>
                    ⚠️ {formError || error}
                </div>
            )}

            {/* Title */}
            <div>
                <label style={labelStyle}>
                    TITLE <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Brief summary of the issue"
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    required
                />
                <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "6px" }}>
                    Minimum 5 characters
                </p>
            </div>

            {/* Description */}
            <div>
                <label style={labelStyle}>
                    DESCRIPTION <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe the issue in detail — what happened, what you expected, and any steps to reproduce..."
                    rows={6}
                    style={{ ...inputStyle, resize: "none", lineHeight: 1.6 }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    required
                />
                <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "6px" }}>
                    Minimum 10 characters
                </p>
            </div>

            {/* Name + Email side by side */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                    <label style={labelStyle}>
                        YOUR NAME <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <input
                        type="text"
                        value={form.reporterName}
                        onChange={(e) => setForm({ ...form, reporterName: e.target.value })}
                        placeholder="John Doe"
                        style={inputStyle}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        required
                    />
                </div>
                <div>
                    <label style={labelStyle}>
                        YOUR EMAIL <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <input
                        type="email"
                        value={form.reporterEmail}
                        onChange={(e) => setForm({ ...form, reporterEmail: e.target.value })}
                        placeholder="john@example.com"
                        style={inputStyle}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        required
                    />
                </div>
            </div>

            {/* Status — only for editing */}
            {isEditing && (
                <div>
                    <label style={labelStyle}>STATUS</label>
                    <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value as Ticket["status"] })}
                        style={inputStyle}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                    >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>
            )}

            {/* AI notice */}
            {!isEditing && (
                <div style={{
                    padding: "14px 18px",
                    borderRadius: "12px",
                    background: "rgba(109,91,255,0.07)",
                    border: "1px solid rgba(109,91,255,0.18)",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                }}>
                    <span style={{ fontSize: "18px" }}>🤖</span>
                    <p style={{ fontSize: "13px", color: "#A78BFA", fontWeight: 500 }}>
                        AI will automatically classify the priority and category after submission.
                    </p>
                </div>
            )}

            {/* Buttons */}
            <div style={{ display: "flex", gap: "12px", paddingTop: "8px" }}>
                <button
                    type="button"
                    onClick={() => router.back()}
                    style={{
                        flex: 1,
                        padding: "14px",
                        borderRadius: "12px",
                        fontSize: "15px",
                        fontWeight: 600,
                        color: "var(--text-2)",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.09)",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        fontFamily: "Outfit, sans-serif",
                    }}
                    onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.color = "var(--text-1)";
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)";
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.color = "var(--text-2)";
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                    }}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                        flex: 1,
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
                        boxShadow: isLoading ? "none" : "0 4px 14px rgba(109,91,255,0.35)",
                    }}
                    onMouseEnter={e => {
                        if (!isLoading) {
                            (e.currentTarget as HTMLElement).style.background = "#5A47FF";
                            (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                        }
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = isLoading ? "rgba(109,91,255,0.5)" : "var(--primary)";
                        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    }}
                >
                    {isLoading ? "Saving..." : isEditing ? "Update Ticket" : "Create Ticket"}
                </button>
            </div>
        </form>
    );
}