"use client";

import { useState } from "react";
import { useTicketStore } from "@/store/ticketStore";
import { api } from "@/lib/api";
import type { Comment } from "@/types";

interface CommentSectionProps {
    ticketId: string;
    comments: Comment[];
}

export default function CommentSection({ ticketId, comments }: CommentSectionProps) {
    const { fetchTicketById } = useTicketStore();
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        setIsSubmitting(true);
        setError(null);
        try {
            await api.post(`/tickets/${ticketId}/comments`, { content });
            setContent("");
            await fetchTicketById(ticketId);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to add comment");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                    width: "36px", height: "36px", borderRadius: "10px",
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px",
                }}>💬</div>
                <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-1)", marginBottom: "2px" }}>
                        Comments
                    </h3>
                    <p style={{ fontSize: "12px", color: "var(--text-3)" }}>
                        {comments.length} {comments.length === 1 ? "comment" : "comments"}
                    </p>
                </div>
            </div>

            {/* Comments list */}
            {comments.length === 0 ? (
                <div style={{ padding: "32px", borderRadius: "14px", background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)", textAlign: "center" }}>
                    <div style={{ fontSize: "28px", marginBottom: "12px" }}>💬</div>
                    <p style={{ fontSize: "14px", color: "var(--text-2)", fontWeight: 500, marginBottom: "4px" }}>No comments yet</p>
                    <p style={{ fontSize: "13px", color: "var(--text-3)" }}>Be the first to add a comment below</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {comments.map((comment) => (
                        <div key={comment.id} style={{
                            padding: "20px 24px", borderRadius: "14px",
                            background: comment.isAiGenerated ? "rgba(109,91,255,0.05)" : "rgba(255,255,255,0.03)",
                            border: comment.isAiGenerated ? "1px solid rgba(109,91,255,0.15)" : "1px solid rgba(255,255,255,0.06)",
                        }}>
                            {/* Comment header */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <div style={{
                                        width: "32px", height: "32px", borderRadius: "50%",
                                        background: comment.isAiGenerated
                                            ? "linear-gradient(135deg, #6D5BFF, #00D9C8)"
                                            : "linear-gradient(135deg, #6D5BFF, #A78BFA)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: "13px", fontWeight: 700, color: "white", flexShrink: 0,
                                    }}>
                                        {comment.isAiGenerated ? "AI" : comment.authorId.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-1)" }}>
                                            {comment.isAiGenerated ? "AI Assistant" : comment.authorId.slice(0, 8) + "..."}
                                        </p>
                                        {comment.isAiGenerated && (
                                            <span style={{
                                                fontSize: "11px", fontWeight: 600, color: "#A78BFA",
                                                background: "rgba(109,91,255,0.12)", padding: "1px 8px",
                                                borderRadius: "99px", border: "1px solid rgba(109,91,255,0.2)",
                                            }}>
                                                AI Generated
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <span style={{ fontSize: "12px", color: "var(--text-3)" }}>
                                    {new Date(comment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                </span>
                            </div>

                            {/* Comment body */}
                            <p style={{ fontSize: "14px", color: "var(--text-1)", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
                                {comment.content}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Add comment form */}
            <div style={{ paddingTop: "4px" }}>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-2)", marginBottom: "10px" }}>
                    Add a comment
                </p>
                {error && (
                    <div style={{ padding: "10px 14px", borderRadius: "10px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444", fontSize: "13px", marginBottom: "10px" }}>
                        ⚠️ {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write your comment here..."
                        rows={3}
                        style={{
                            width: "100%", padding: "14px 16px", borderRadius: "12px",
                            fontSize: "14px", color: "var(--text-1)",
                            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                            outline: "none", resize: "none", fontFamily: "Outfit, sans-serif",
                            lineHeight: 1.6, transition: "border-color 0.2s, box-shadow 0.2s",
                        }}
                        onFocus={e => { e.target.style.borderColor = "rgba(109,91,255,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(109,91,255,0.1)"; }}
                        onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
                    />
                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting || !content.trim()}
                            style={{
                                padding: "11px 24px", borderRadius: "10px", fontSize: "14px", fontWeight: 600,
                                color: "white",
                                background: isSubmitting || !content.trim() ? "rgba(109,91,255,0.4)" : "var(--primary)",
                                border: "none", cursor: isSubmitting || !content.trim() ? "not-allowed" : "pointer",
                                transition: "all 0.15s", fontFamily: "Outfit, sans-serif",
                                boxShadow: isSubmitting || !content.trim() ? "none" : "0 4px 12px rgba(109,91,255,0.3)",
                            }}
                            onMouseEnter={e => { if (!isSubmitting && content.trim()) (e.currentTarget as HTMLElement).style.background = "#5A47FF"; }}
                            onMouseLeave={e => { if (!isSubmitting && content.trim()) (e.currentTarget as HTMLElement).style.background = "var(--primary)"; }}
                        >
                            {isSubmitting ? "Posting..." : "Post Comment"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}