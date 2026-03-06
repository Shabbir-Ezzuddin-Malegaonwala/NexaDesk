"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import TicketDetail from "@/components/tickets/TicketDetail";
import Link from "next/link";

export default function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: session, isPending } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (!isPending && !session) router.push("/login");
    }, [session, isPending]);

    if (isPending || !session) return null;

    return (
        <div style={{ minHeight: "100vh", padding: "48px 40px", maxWidth: "900px", margin: "0 auto" }}>
            <Link href="/tickets">
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
                    Back to Tickets
                </button>
            </Link>
            <TicketDetail ticketId={id} />
        </div>
    );
}