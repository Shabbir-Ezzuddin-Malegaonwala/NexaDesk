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
        } catch (err: any) {
            setError(err.message ?? "Failed to add comment");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-white font-semibold text-sm">
                Comments ({comments.length})
            </h3>

            {/* Comments list */}
            {comments.length === 0 ? (
                <div className="glass rounded-xl p-6 text-center">
                    <p className="text-slate-400 text-sm">No comments yet. Be the first to comment!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {comments.map((comment) => (
                        <div key={comment.id} className="glass rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-purple-500/30 flex items-center justify-center">
                                        <span className="text-purple-400 text-xs font-medium">
                                            {comment.authorId.slice(0, 2).toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="text-slate-400 text-xs">{comment.authorId.slice(0, 8)}...</span>
                                    {comment.isAiGenerated && (
                                        <span className="px-2 py-0.5 rounded-full text-xs bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                                            AI Generated
                                        </span>
                                    )}
                                </div>
                                <span className="text-slate-500 text-xs">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-slate-300 text-sm leading-relaxed">{comment.content}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Add comment form */}
            <form onSubmit={handleSubmit} className="space-y-3">
                {error && (
                    <p className="text-red-400 text-sm">{error}</p>
                )}
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all resize-none"
                    style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                    }}
                />
                <button
                    type="submit"
                    disabled={isSubmitting || !content.trim()}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-all"
                >
                    {isSubmitting ? "Posting..." : "Post Comment"}
                </button>
            </form>
        </div>
    );
}
