"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useTicketStore } from "@/store/ticketStore";
import TicketForm from "@/components/tickets/TicketForm";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Link from "next/link";

export default function EditTicketPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const { selectedTicket, isLoading, fetchTicketById } = useTicketStore();

    useEffect(() => {
        if (!isPending && !session) router.push("/login");
    }, [session, isPending]);

    useEffect(() => {
        if (session) fetchTicketById(id);
    }, [session, id]);

    if (isPending || !session) return null;

    return (
        <div style={{ minHeight: "100vh", padding: "48px 40px", maxWidth: "720px", margin: "0 auto" }}>

            {/* Back button */}
            <Link href={`/tickets/${id}`}>
                <button style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    background: "none", border: "none", color: "var(--text-2)",
                    fontSize: "14px", cursor: "pointer", marginBottom: "32px",
                    padding: 0, fontFamily: "Outfit, sans-serif", transition: "color 0.15s",
                }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--text-1)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--text-2)"}
                >
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                    Back to Ticket
                </button>
            </Link>

            {/* Header */}
            <div style={{ marginBottom: "32px" }}>
                <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--primary)", letterSpacing: "0.1em", marginBottom: "8px", textTransform: "uppercase" }}>
                    Edit Ticket
                </p>
                <h1 style={{ fontSize: "32px", fontWeight: 800, color: "var(--text-1)", marginBottom: "8px", letterSpacing: "-0.02em" }}>
                    Update Ticket Details
                </h1>
                <p style={{ fontSize: "15px", color: "var(--text-2)" }}>
                    Make changes to the ticket information below
                </p>
            </div>

            {/* Form card */}
            <div style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "20px",
                padding: "40px",
            }}>
                {isLoading ? (
                    <LoadingSpinner />
                ) : selectedTicket ? (
                    <TicketForm ticket={selectedTicket} isEditing={true} />
                ) : (
                    <div style={{ textAlign: "center", padding: "32px" }}>
                        <p style={{ color: "var(--text-2)", fontSize: "15px", marginBottom: "16px" }}>
                            Ticket not found
                        </p>
                        <Link href="/tickets">
                            <button style={{
                                padding: "10px 20px", background: "var(--primary)", color: "white",
                                border: "none", borderRadius: "10px", fontSize: "14px",
                                cursor: "pointer", fontFamily: "Outfit, sans-serif",
                            }}>
                                Back to All Tickets
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}