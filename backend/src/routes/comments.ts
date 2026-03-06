import Elysia from "elysia";
import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { tickets, ticketComments } from "../db/schema";
import { createCommentSchema } from "../schemas/ticket.schemas";
import { authPlugin, requireAuth } from "../middleware/auth";

export const commentRoutes = new Elysia({ prefix: "/tickets" })
    .use(authPlugin)

    // GET /tickets/:id/comments
    .get("/:id/comments", async ({ organizationId, userId, session, params }) => {
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
                return new Response(
                    JSON.stringify({ error: "Ticket not found" }),
                    { status: 404 }
                );
            }

            const comments = await db
                .select()
                .from(ticketComments)
                .where(and(
                    eq(ticketComments.ticketId, params.id),
                    eq(ticketComments.organizationId, organizationId!)
                ));

            return { success: true, data: comments };
        } catch (err: any) {
            return new Response(
                JSON.stringify({ error: err.message ?? "Server error" }),
                { status: 401 }
            );
        }
    })

    // POST /tickets/:id/comments
    .post("/:id/comments", async ({ organizationId, userId, session, params, body }) => {
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
                return new Response(
                    JSON.stringify({ error: "Ticket not found" }),
                    { status: 404 }
                );
            }

            const parsed = createCommentSchema.safeParse(body);
            if (!parsed.success) {
                return new Response(
                    JSON.stringify({ error: parsed.error.issues[0].message }),
                    { status: 400 }
                );
            }

            const newComment = await db
                .insert(ticketComments)
                .values({
                    ticketId: params.id,
                    content: parsed.data.content,
                    authorId: userId!,
                    organizationId: organizationId!,
                    isAiGenerated: false,
                })
                .returning();

            return { success: true, data: newComment[0] };
        } catch (err: any) {
            return new Response(
                JSON.stringify({ error: err.message ?? "Server error" }),
                { status: 500 }
            );
        }
    });