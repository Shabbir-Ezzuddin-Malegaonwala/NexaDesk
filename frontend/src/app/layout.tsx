import type { Metadata } from "next";
import "./globals.css";
import LayoutWrapper from "@/components/ui/LayoutWrapper";

export const metadata: Metadata = {
    title: "NexaDesk - Smart Ticket Management",
    description: "AI-powered support ticket system",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <LayoutWrapper>{children}</LayoutWrapper>
            </body>
        </html>
    );
}