"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession, authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
    {
        label: "Dashboard",
        href: "/",
        icon: (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
            </svg>
        ),
    },
    {
        label: "All Tickets",
        href: "/tickets",
        icon: (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />
            </svg>
        ),
    },
    {
        label: "New Ticket",
        href: "/tickets/new",
        icon: (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
        ),
    },
];

interface SidebarProps {
    collapsed: boolean;
    setCollapsed: (val: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = useSession();
    const [orgName, setOrgName] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrg = async () => {
            try {
                const res = await authClient.organization.list();
                if (res.data && res.data.length > 0) setOrgName(res.data[0].name);
            } catch { /* ignore */ }
        };
        if (session) fetchOrg();
    }, [session]);

    const handleSignOut = async () => {
        await signOut();
        router.push("/login");
    };

    const EXPANDED = "240px";
    const COLLAPSED = "64px";

    return (
        <aside
            style={{
                width: collapsed ? COLLAPSED : EXPANDED,
                minWidth: collapsed ? COLLAPSED : EXPANDED,
                background: "rgba(6,9,15,0.98)",
                borderRight: "1px solid rgba(255,255,255,0.07)",
                height: "100vh",
                position: "fixed",
                left: 0,
                top: 0,
                zIndex: 50,
                display: "flex",
                flexDirection: "column",
                transition: "width 0.3s cubic-bezier(0.4,0,0.2,1), min-width 0.3s cubic-bezier(0.4,0,0.2,1)",
                overflow: "hidden",
            }}
        >
            {/* Top — Logo + Collapse Arrow */}
            <div style={{
                padding: collapsed ? "20px 0" : "24px 20px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: collapsed ? "center" : "space-between",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                minHeight: "72px",
            }}>
                {!collapsed && (
                    <div>
                        <h1 style={{
                            fontSize: "20px",
                            fontWeight: 800,
                            background: "linear-gradient(135deg, #A78BFA, #67E8F9)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            letterSpacing: "-0.02em",
                            whiteSpace: "nowrap",
                        }}>NexaDesk</h1>
                        {orgName && (
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#6D5BFF", flexShrink: 0 }} />
                                <p style={{ fontSize: "12px", color: "#8B5CF6", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "160px" }}>
                                    {orgName}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Arrow toggle button */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: "rgba(109,91,255,0.12)",
                        border: "1px solid rgba(109,91,255,0.25)",
                        color: "#A78BFA",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        flexShrink: 0,
                        transition: "all 0.2s",
                    }}
                >
                    {collapsed ? (
                        // Right arrow — open
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
                    ) : (
                        // Left arrow — close
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Nav items */}
            <nav style={{ flex: 1, padding: collapsed ? "16px 0" : "16px 12px", display: "flex", flexDirection: "column", gap: "4px" }}>
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== "/" && pathname.startsWith(item.href));
                    return (
                        <Link key={item.href} href={item.href} title={collapsed ? item.label : undefined}>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: collapsed ? "12px 0" : "11px 14px",
                                justifyContent: collapsed ? "center" : "flex-start",
                                borderRadius: collapsed ? "0" : "10px",
                                background: isActive
                                    ? (collapsed ? "transparent" : "rgba(109,91,255,0.15)")
                                    : "transparent",
                                color: isActive ? "#A78BFA" : "#6B7280",
                                cursor: "pointer",
                                transition: "all 0.15s",
                                borderLeft: isActive && collapsed ? "3px solid #6D5BFF" : "3px solid transparent",
                            }}
                                onMouseEnter={e => {
                                    if (!isActive) (e.currentTarget as HTMLElement).style.color = "#D1D5DB";
                                }}
                                onMouseLeave={e => {
                                    if (!isActive) (e.currentTarget as HTMLElement).style.color = "#6B7280";
                                }}
                            >
                                {item.icon}
                                {!collapsed && (
                                    <span style={{ fontSize: "14px", fontWeight: isActive ? 600 : 500, whiteSpace: "nowrap" }}>
                                        {item.label}
                                    </span>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom — User info + Sign out */}
            <div style={{
                borderTop: "1px solid rgba(255,255,255,0.05)",
                padding: collapsed ? "12px 0" : "12px",
            }}>
                {/* User info — only when expanded */}
                {!collapsed && session?.user && (
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 12px",
                        borderRadius: "10px",
                        background: "rgba(255,255,255,0.03)",
                        marginBottom: "6px",
                    }}>
                        <div style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #6D5BFF, #00D9C8)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "15px",
                            fontWeight: 700,
                            color: "white",
                            flexShrink: 0,
                        }}>
                            {session.user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ overflow: "hidden" }}>
                            <p style={{ fontSize: "13px", fontWeight: 600, color: "#E2E8F0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {session.user.name}
                            </p>
                            <p style={{ fontSize: "11px", color: "#6B7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {session.user.email}
                            </p>
                        </div>
                    </div>
                )}

                {/* Sign out */}
                <button
                    onClick={handleSignOut}
                    title={collapsed ? "Sign Out" : undefined}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: collapsed ? "12px 0" : "10px 12px",
                        justifyContent: collapsed ? "center" : "flex-start",
                        borderRadius: collapsed ? "0" : "10px",
                        width: "100%",
                        background: "transparent",
                        border: "none",
                        color: "#6B7280",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        fontSize: "14px",
                        fontWeight: 500,
                    }}
                    onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.color = "#EF4444";
                        (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.07)";
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.color = "#6B7280";
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                    </svg>
                    {!collapsed && <span>Sign Out</span>}
                </button>
            </div>
        </aside>
    );
}