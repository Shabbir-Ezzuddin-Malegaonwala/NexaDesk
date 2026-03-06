"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import TicketList from "@/components/tickets/TicketList";
import Link from "next/link";

export default function TicketsPage() {
    const { data: session, isPending } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (!isPending && !session) router.push("/login");
    }, [session, isPending]);

    if (isPending || !session) return null;

    return (
        <div style={{ minHeight: "100vh", padding: "48px 40px", maxWidth: "1100px", margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "40px" }}>
                <div>
                    <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--primary)", letterSpacing: "0.1em", marginBottom: "8px", textTransform: "uppercase" }}>
                        Tickets
                    </p>
                    <h1 style={{ fontSize: "32px", fontWeight: 800, color: "var(--text-1)", marginBottom: "8px", letterSpacing: "-0.02em" }}>
                        All Tickets
                    </h1>
                    <p style={{ fontSize: "15px", color: "var(--text-2)" }}>
                        Manage and track all your support tickets
                    </p>
                </div>
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
                        marginTop: "8px",
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
            </div>
            <TicketList />
        </div>
    );
}