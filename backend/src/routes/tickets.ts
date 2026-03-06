import "dotenv/config";
import Elysia from "elysia";
import { eq, and, ilike, SQL, sql } from "drizzle-orm";
import { db } from "../db";
import { tickets } from "../db/schema";
import {
    createTicketSchema,
    updateTicketSchema,
    updateStatusSchema,
    assignTicketSchema,
    ticketQuerySchema,
} from "../schemas/ticket.schemas";
import {
    authPlugin,
    requireAuth,
    requireAdmin,
    requireOwnerOrAdmin,
} from "../middleware/auth";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? "http://localhost:8000";

export const ticketRoutes = new Elysia({ prefix: "/tickets" })
    .use(authPlugin)

    // GET /tickets
    .get("/", async ({ organizationId, userId, session, query }) => {
        try {
            requireAuth({ session, organizationId, userId });

            const parsed = ticketQuerySchema.safeParse(query);
            if (!parsed.success) {
                return new Response(
                    JSON.stringify({ error: "Invalid query parameters" }),
                    { status: 400 }
                );
            }

            const { status, priority, category, search, page, limit } = parsed.data;
            const filters: SQL[] = [eq(tickets.organizationId, organizationId!)];

            if (status) filters.push(eq(tickets.status, status));
            if (priority) filters.push(eq(tickets.priority, priority));
            if (category) filters.push(eq(tickets.category, category));
            if (search) filters.push(ilike(tickets.title, `%${search}%`));

            const offset = (page - 1) * limit;

            const results = await db
                .select()
                .from(tickets)
                .where(and(...filters))
                .limit(limit)
                .offset(offset);

            const totalResult = await db
                .select({ count: sql<number>`count(*)` })
                .from(tickets)
                .where(and(...filters));

            const total = Number(totalResult[0]?.count ?? 0);

            return {
                success: true,
                data: results,
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
            };
        } catch (err: any) {
            return new Response(
                JSON.stringify({ error: err.message ?? "Server error" }),
                { status: err.message === "Unauthorized" ? 401 : 403 }
            );
        }
    })

    // GET /tickets/:id
    .get("/:id", async ({ organizationId, userId, session, params }) => {
        try {
            requireAuth({ session, organizationId, userId });

            const ticket = await db
                .select()
                .from(tickets)
                .where(and(
                    eq(tickets.id, params.id),
                    eq(tickets.organizationId, organizationId!)
                ))
                .limit(1);

            if (ticket.length === 0) {
                return new Response(JSON.stringify({ error: "Ticket not found" }), { status: 404 });
            }

            return { success: true, data: ticket[0] };
        } catch (err: any) {
            return new Response(
                JSON.stringify({ error: err.message ?? "Server error" }),
                { status: 401 }
            );
        }
    })

    // POST /tickets
    .post("/", async ({ organizationId, userId, session, body }) => {
        try {
            requireAuth({ session, organizationId, userId });

            const parsed = createTicketSchema.safeParse(body);
            if (!parsed.success) {
                return new Response(
                    JSON.stringify({ error: parsed.error.issues[0].message }),
                    { status: 400 }
                );
            }

            const newTicket = await db
                .insert(tickets)
                .values({
                    ...parsed.data,
                    reporterId: userId!,
                    organizationId: organizationId!,
                })
                .returning();

            // Auto-classify with AI
            try {
                const aiRes = await fetch(`${AI_SERVICE_URL}/classify`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: parsed.data.title,
                        description: parsed.data.description,
                    }),
                });

                if (aiRes.ok) {
                    const classification = await aiRes.json();
                    const classified = await db
                        .update(tickets)
                        .set({
                            priority: classification.priority,
                            category: classification.category,
                        })
                        .where(eq(tickets.id, newTicket[0].id))
                        .returning();
                    return { success: true, data: classified[0] };
                }
            } catch {
                // AI service unavailable, return ticket without classification
            }

            return { success: true, data: newTicket[0] };
        } catch (err: any) {
            return new Response(
                JSON.stringify({ error: err.message ?? "Server error" }),
                { status: 500 }
            );
        }
    })

    // PUT /tickets/:id
    .put("/:id", async ({ organizationId, userId, session, params, body }) => {
        try {
            requireAuth({ session, organizationId, userId });

            const existing = await db
                .select()
                .from(tickets)
                .where(and(
                    eq(tickets.id, params.id),
                    eq(tickets.organizationId, organizationId!)
                ))
                .limit(1);

            if (existing.length === 0) {
                return new Response(JSON.stringify({ error: "Ticket not found" }), { status: 404 });
            }

            requireOwnerOrAdmin(existing[0].reporterId, userId!, null);

            const parsed = updateTicketSchema.safeParse(body);
            if (!parsed.success) {
                return new Response(
                    JSON.stringify({ error: parsed.error.issues[0].message }),
                    { status: 400 }
                );
            }

            const updated = await db
                .update(tickets)
                .set(parsed.data)
                .where(and(
                    eq(tickets.id, params.id),
                    eq(tickets.organizationId, organizationId!)
                ))
                .returning();

            return { success: true, data: updated[0] };
        } catch (err: any) {
            return new Response(
                JSON.stringify({ error: err.message ?? "Server error" }),
                { status: 500 }
            );
        }
    })

    // DELETE /tickets/:id
    .delete("/:id", async ({ organizationId, userId, session, params }) => {
        try {
            requireAuth({ session, organizationId, userId });

            const existing = await db
                .select()
                .from(tickets)
                .where(and(
                    eq(tickets.id, params.id),
                    eq(tickets.organizationId, organizationId!)
                ))
                .limit(1);

            if (existing.length === 0) {
                return new Response(JSON.stringify({ error: "Ticket not found" }), { status: 404 });
            }

            requireAdmin(null);

            await db
                .delete(tickets)
                .where(and(
                    eq(tickets.id, params.id),
                    eq(tickets.organizationId, organizationId!)
                ));

            return { success: true, message: "Ticket deleted" };
        } catch (err: any) {
            return new Response(
                JSON.stringify({ error: err.message ?? "Server error" }),
                { status: 500 }
            );
        }
    })

    // PATCH /tickets/:id/status
    .patch("/:id/status", async ({ organizationId, userId, session, params, body }) => {
        try {
            requireAuth({ session, organizationId, userId });

            const existing = await db
                .select()
                .from(tickets)
                .where(and(
                    eq(tickets.id, params.id),
                    eq(tickets.organizationId, organizationId!)
                ))
                .limit(1);

            if (existing.length === 0) {
                return new Response(JSON.stringify({ error: "Ticket not found" }), { status: 404 });
            }

            requireOwnerOrAdmin(existing[0].reporterId, userId!, null);

            const parsed = updateStatusSchema.safeParse(body);
            if (!parsed.success) {
                return new Response(
                    JSON.stringify({ error: parsed.error.issues[0].message }),
                    { status: 400 }
                );
            }

            const updated = await db
                .update(tickets)
                .set({ status: parsed.data.status })
                .where(and(
                    eq(tickets.id, params.id),
                    eq(tickets.organizationId, organizationId!)
                ))
                .returning();

            return { success: true, data: updated[0] };
        } catch (err: any) {
            return new Response(
                JSON.stringify({ error: err.message ?? "Server error" }),
                { status: 500 }
            );
        }
    })

    // PATCH /tickets/:id/assign
    .patch("/:id/assign", async ({ organizationId, userId, session, params, body }) => {
        try {
            requireAuth({ session, organizationId, userId });

            const existing = await db
                .select()
                .from(tickets)
                .where(and(
                    eq(tickets.id, params.id),
                    eq(tickets.organizationId, organizationId!)
                ))
                .limit(1);

            if (existing.length === 0) {
                return new Response(JSON.stringify({ error: "Ticket not found" }), { status: 404 });
            }

            requireAdmin(null);

            const parsed = assignTicketSchema.safeParse(body);
            if (!parsed.success) {
                return new Response(
                    JSON.stringify({ error: parsed.error.issues[0].message }),
                    { status: 400 }
                );
            }

            const updated = await db
                .update(tickets)
                .set({ assigneeId: parsed.data.assigneeId })
                .where(and(
                    eq(tickets.id, params.id),
                    eq(tickets.organizationId, organizationId!)
                ))
                .returning();

            return { success: true, data: updated[0] };
        } catch (err: any) {
            return new Response(
                JSON.stringify({ error: err.message ?? "Server error" }),
                { status: 500 }
            );
        }
    });