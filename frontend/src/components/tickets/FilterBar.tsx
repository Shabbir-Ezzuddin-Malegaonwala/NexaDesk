"use client";

import { useTicketStore } from "@/store/ticketStore";

export default function FilterBar() {
    const { filters, setFilters } = useTicketStore();

    const selectStyle = {
        padding: "14px 18px",
        borderRadius: "12px",
        fontSize: "14px",
        fontWeight: 500,
        color: "#F0F2F7",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.09)",
        outline: "none",
        cursor: "pointer",
        fontFamily: "Outfit, sans-serif",
        transition: "border-color 0.2s",
    };

    return (
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px", alignItems: "center" }}>
            {/* Search */}
            <div style={{ flex: 1, position: "relative" }}>
                <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#4A5568", pointerEvents: "none" }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Search tickets..."
                    value={filters.search}
                    onChange={(e) => setFilters({ search: e.target.value })}
                    style={{
                        width: "100%",
                        padding: "14px 16px 14px 44px",
                        borderRadius: "12px",
                        fontSize: "14px",
                        color: "#F0F2F7",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.09)",
                        outline: "none",
                        fontFamily: "Outfit, sans-serif",
                        transition: "border-color 0.2s, box-shadow 0.2s",
                    }}
                    onFocus={e => {
                        e.target.style.borderColor = "rgba(109,91,255,0.6)";
                        e.target.style.boxShadow = "0 0 0 3px rgba(109,91,255,0.12)";
                    }}
                    onBlur={e => {
                        e.target.style.borderColor = "rgba(255,255,255,0.09)";
                        e.target.style.boxShadow = "none";
                    }}
                />
            </div>

            {/* Status filter */}
            <select
                value={filters.status ?? ""}
                onChange={(e) => setFilters({ status: e.target.value || null })}
                style={selectStyle}
                onFocus={e => e.target.style.borderColor = "rgba(109,91,255,0.6)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.09)"}
            >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
            </select>

            {/* Priority filter */}
            <select
                value={filters.priority ?? ""}
                onChange={(e) => setFilters({ priority: e.target.value || null })}
                style={selectStyle}
                onFocus={e => e.target.style.borderColor = "rgba(109,91,255,0.6)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.09)"}
            >
                <option value="">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
            </select>
        </div>
    );
}