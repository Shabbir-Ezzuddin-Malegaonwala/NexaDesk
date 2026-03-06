import Elysia from "elysia";
import { auth } from "../auth";

export const authPlugin = new Elysia({ name: "auth-plugin" })
    .derive({ as: "global" }, async ({ request }) => {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        return {
            session: session?.session ?? null,
            userId: session?.user?.id ?? null,
            organizationId: session?.session?.activeOrganizationId ?? null,
            userRole: null as string | null,
        };
    });

export function requireAuth({
    session,
    organizationId,
    userId,
}: {
    session: any;
    organizationId: string | null;
    userId: string | null;
}): boolean {
    if (!session || !userId) {
        throw new Error("Unauthorized");
    }
    if (!organizationId) {
        throw new Error("Organization required");
    }
    return true;
}

export function requireAdmin(role: string | null): boolean {
    if (role !== "admin" && role !== "owner") {
        throw new Error("Admin access required");
    }
    return true;
}

export function requireOwnerOrAdmin(
    ticketReporterId: string | null,
    currentUserId: string,
    role: string | null
): boolean {
    const isAdmin = role === "admin" || role === "owner";
    const isOwner = ticketReporterId === currentUserId;
    if (!isAdmin && !isOwner) {
        throw new Error("You don't have permission to perform this action");
    }
    return true;
}