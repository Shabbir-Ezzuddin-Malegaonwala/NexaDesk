"use client";

import { useState } from "react";
import { useSSEStream } from "@/hooks/useSSEStream";

interface AiResponseStreamProps { ticketId: string; }

export default function AiResponseStream({ ticketId }: AiResponseStreamProps) {
    const { data, isStreaming, error, startStream, stopStream } = useSSEStream();
    const [copied, setCopied] = useState(false);
    const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

    const handleSuggest = () => startStream(`${API_URL}/tickets/${ticketId}/suggest-response`);

    const handleCopy = async () => {
        if (!data) return;
        try {
            await navigator.clipboard.writeText(data);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // fallback for older browsers
            const el = document.createElement("textarea");
            el.value = data;
            document.body.appendChild(el);
            el.select();
            document.execCommand("copy");
            document.body.removeChild(el);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                        width: "36px", height: "36px", borderRadius: "10px",
                        background: "rgba(109,91,255,0.15)", border: "1px solid rgba(109,91,255,0.25)",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px",
                    }}>✨</div>
                    <div>
                        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-1)", marginBottom: "2px" }}>
                            AI Response Suggestion
                        </h3>
                        <p style={{ fontSize: "12px", color: "var(--text-3)" }}>
                            Powered by LangChain + Groq
                        </p>
                    </div>
                </div>

                {isStreaming ? (
                    <button onClick={stopStream} style={{
                        padding: "10px 20px", borderRadius: "10px", fontSize: "14px", fontWeight: 600,
                        color: "#EF4444", background: "rgba(239,68,68,0.08)",
                        border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer",
                        transition: "all 0.15s", fontFamily: "Outfit, sans-serif",
                    }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.15)"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)"}
                    >
                        ⏹ Stop
                    </button>
                ) : (
                    <button onClick={handleSuggest} style={{
                        padding: "10px 20px", borderRadius: "10px", fontSize: "14px", fontWeight: 600,
                        color: "white", background: "linear-gradient(135deg, #6D5BFF, #00D9C8)",
                        border: "none", cursor: "pointer", transition: "all 0.2s",
                        fontFamily: "Outfit, sans-serif", boxShadow: "0 4px 14px rgba(109,91,255,0.3)",
                    }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(109,91,255,0.4)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(109,91,255,0.3)"; }}
                    >
                        ✨ Suggest Response
                    </button>
                )}
            </div>

            {/* Error */}
            {error && (
                <div style={{ padding: "16px 20px", borderRadius: "12px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <p style={{ color: "#EF4444", fontSize: "14px" }}>⚠️ {error}</p>
                </div>
            )}

            {/* Streaming result */}
            {(data || isStreaming) && !error && (
                <div style={{ borderRadius: "14px", background: "rgba(109,91,255,0.05)", border: "1px solid rgba(109,91,255,0.15)", overflow: "hidden" }}>

                    {/* Result top bar with copy button */}
                    <div style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "12px 20px", borderBottom: "1px solid rgba(109,91,255,0.1)",
                        background: "rgba(109,91,255,0.05)",
                    }}>
                        {isStreaming ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <div style={{ display: "flex", gap: "4px" }}>
                                    {[0, 1, 2].map(i => (
                                        <div key={i} style={{
                                            width: "6px", height: "6px", borderRadius: "50%", background: "#A78BFA",
                                            animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                                        }} />
                                    ))}
                                </div>
                                <span style={{ fontSize: "12px", color: "#A78BFA", fontWeight: 500 }}>
                                    AI is generating a response...
                                </span>
                            </div>
                        ) : (
                            <span style={{ fontSize: "12px", color: "#A78BFA", fontWeight: 500 }}>
                                ✅ Response ready
                            </span>
                        )}

                        {/* Copy button — only show when there's data */}
                        {data && !isStreaming && (
                            <button
                                onClick={handleCopy}
                                style={{
                                    display: "flex", alignItems: "center", gap: "6px",
                                    padding: "6px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
                                    color: copied ? "#10B981" : "#A78BFA",
                                    background: copied ? "rgba(16,185,129,0.1)" : "rgba(167,139,250,0.1)",
                                    border: copied ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(167,139,250,0.25)",
                                    cursor: "pointer", transition: "all 0.2s",
                                    fontFamily: "Outfit, sans-serif",
                                }}
                                onMouseEnter={e => {
                                    if (!copied) (e.currentTarget as HTMLElement).style.background = "rgba(167,139,250,0.2)";
                                }}
                                onMouseLeave={e => {
                                    if (!copied) (e.currentTarget as HTMLElement).style.background = "rgba(167,139,250,0.1)";
                                }}
                            >
                                {copied ? (
                                    <>
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                        </svg>
                                        Copy
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Response text */}
                    <div style={{ padding: "20px 24px" }}>
                        <p style={{ fontSize: "14px", color: "var(--text-1)", lineHeight: 1.8, whiteSpace: "pre-wrap", margin: 0 }}>
                            {data}
                            {isStreaming && (
                                <span style={{
                                    display: "inline-block", width: "8px", height: "16px",
                                    background: "#A78BFA", marginLeft: "2px", borderRadius: "2px",
                                    animation: "pulse 0.8s ease-in-out infinite", verticalAlign: "middle",
                                }} />
                            )}
                        </p>
                    </div>
                </div>
            )}

            {/* Empty state */}
            {!data && !isStreaming && !error && (
                <div style={{ padding: "32px", borderRadius: "14px", background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)", textAlign: "center" }}>
                    <div style={{ fontSize: "28px", marginBottom: "12px" }}>🤖</div>
                    <p style={{ fontSize: "14px", color: "var(--text-2)", marginBottom: "4px", fontWeight: 500 }}>
                        No suggestion yet
                    </p>
                    <p style={{ fontSize: "13px", color: "var(--text-3)" }}>
                        Click &quot;Suggest Response&quot; to generate an AI response for this ticket
                    </p>
                </div>
            )}
        </div>
    );
}