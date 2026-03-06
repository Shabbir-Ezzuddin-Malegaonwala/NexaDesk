import Elysia from "elysia";
import { eq, and } from "drizzle-orm";
import { db } from "../db";
import { tickets, ticketComments } from "../db/schema";
import { authPlugin, requireAuth } from "../middleware/auth";
import { classifyTicket, streamSuggestResponse } from "../services/ai.service";

export const aiRoutes = new Elysia()
    .use(authPlugin)

    // POST /tickets/:id/classify
    .post("/tickets/:id/classify", async ({ organizationId, userId, session, params }) => {
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

            const classification = await classifyTicket(
                ticket[0].title,
                ticket[0].description
            );

            const updated = await db
                .update(tickets)
                .set({
                    priority: classification.priority,
                    category: classification.category,
                })
                .where(and(
                    eq(tickets.id, params.id),
                    eq(tickets.organizationId, organizationId!)
                ))
                .returning();

            return {
                success: true,
                data: updated[0],
                classification,
            };
        } catch (err: any) {
            return new Response(
                JSON.stringify({ error: err.message ?? "Server error" }),
                { status: 500 }
            );
        }
    })

    // GET /tickets/:id/suggest-response
    .get("/tickets/:id/suggest-response", async ({ organizationId, userId, session, params, query }) => {
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

            const ticketData = {
                ticket_title: ticket[0].title,
                ticket_description: ticket[0].description,
                ticket_category: ticket[0].category,
                ticket_priority: ticket[0].priority,
                existing_comments: comments.map(c => ({
                    content: c.content,
                    author_id: c.authorId,
                    is_ai_generated: c.isAiGenerated,
                })),
                tone: (query as any).tone ?? "professional",
            };

            const stream = new ReadableStream({
                async start(controller) {
                    try {
                        await streamSuggestResponse(ticketData, (chunk) => {
                            controller.enqueue(new TextEncoder().encode(chunk));
                        });
                        controller.close();
                    } catch (err: any) {
                        const errorChunk = `data: ${JSON.stringify({ content: "", done: true, error: err.message })}\n\n`;
                        controller.enqueue(new TextEncoder().encode(errorChunk));
                        controller.close();
                    }
                },
            });

            return new Response(stream, {
                headers: {
                    "Content-Type": "text/event-stream",
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                },
            });
        } catch (err: any) {
            return new Response(
                JSON.stringify({ error: err.message ?? "Server error" }),
                { status: 500 }
            );
        }
    });