"use client";

import { useEffect } from "react";
import { useTicketStore } from "@/store/ticketStore";
import TicketCard from "./TicketCard";
import FilterBar from "./FilterBar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Link from "next/link";

export default function TicketList() {
    const { tickets, isLoading, error, pagination, fetchTickets, setPage, clearError } = useTicketStore();

    useEffect(() => { fetchTickets(); }, []);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>

            <FilterBar />

            {/* Loading */}
            {isLoading && <LoadingSpinner />}

            {/* Error */}
            {error && !isLoading && (
                <div style={{
                    background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                    borderRadius: "16px", padding: "32px", textAlign: "center",
                }}>
                    <p style={{ color: "#EF4444", fontSize: "15px", marginBottom: "16px" }}>{error}</p>
                    <button onClick={() => { clearError(); fetchTickets(); }} style={{
                        padding: "10px 20px", background: "var(--primary)", color: "white",
                        border: "none", borderRadius: "10px", fontSize: "14px",
                        cursor: "pointer", fontFamily: "Outfit, sans-serif",
                    }}>
                        Retry
                    </button>
                </div>
            )}

            {/* Empty state */}
            {!isLoading && !error && tickets.length === 0 && (
                <div style={{
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "20px", padding: "64px 32px", textAlign: "center",
                }}>
                    <div style={{
                        width: "64px", height: "64px", borderRadius: "18px",
                        background: "rgba(109,91,255,0.12)", border: "1px solid rgba(109,91,255,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 20px", fontSize: "28px",
                    }}>🎫</div>
                    <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-1)", marginBottom: "8px" }}>
                        No tickets yet
                    </h3>
                    <p style={{ fontSize: "14px", color: "var(--text-2)", marginBottom: "28px" }}>
                        Create your first support ticket to get started
                    </p>
                    <Link href="/tickets/new">
                        <button style={{
                            padding: "12px 28px", background: "var(--primary)", color: "white",
                            border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 600,
                            cursor: "pointer", fontFamily: "Outfit, sans-serif",
                            boxShadow: "0 4px 14px rgba(109,91,255,0.3)",
                        }}>
                            + Create Ticket
                        </button>
                    </Link>
                </div>
            )}

            {/* Ticket list */}
            {!isLoading && !error && tickets.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {tickets.map((ticket, i) => (
                        <div key={ticket.id} style={{ animation: `fadeUp 0.3s ease ${i * 0.05}s both` }}>
                            <TicketCard ticket={ticket} />
                        </div>
                    ))}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div style={{
                            display: "flex", alignItems: "center", justifyContent: "center",
                            gap: "12px", marginTop: "16px", paddingTop: "16px",
                            borderTop: "1px solid rgba(255,255,255,0.06)",
                        }}>
                            <button
                                onClick={() => setPage(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                style={{
                                    padding: "8px 18px", borderRadius: "10px", fontSize: "14px",
                                    color: "var(--text-2)", background: "rgba(255,255,255,0.04)",
                                    border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer",
                                    fontFamily: "Outfit, sans-serif", opacity: pagination.page === 1 ? 0.3 : 1,
                                }}
                            >
                                ← Previous
                            </button>
                            <span style={{ fontSize: "14px", color: "var(--text-2)", fontWeight: 500 }}>
                                Page {pagination.page} of {pagination.totalPages}
                            </span>
                            <button
                                onClick={() => setPage(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                                style={{
                                    padding: "8px 18px", borderRadius: "10px", fontSize: "14px",
                                    color: "var(--text-2)", background: "rgba(255,255,255,0.04)",
                                    border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer",
                                    fontFamily: "Outfit, sans-serif",
                                    opacity: pagination.page === pagination.totalPages ? 0.3 : 1,
                                }}
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}