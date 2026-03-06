"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

const EXPANDED = 240;
const COLLAPSED = 64;

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();
    const hideSidebar = pathname === "/login" || pathname === "/signup";

    if (hideSidebar) return <>{children}</>;

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <main
                style={{
                    marginLeft: collapsed ? `${COLLAPSED}px` : `${EXPANDED}px`,
                    flex: 1,
                    transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
                    minHeight: "100vh",
                    background: "var(--bg-2)",
                }}
            >
                {children}
            </main>
        </div>
    );
}