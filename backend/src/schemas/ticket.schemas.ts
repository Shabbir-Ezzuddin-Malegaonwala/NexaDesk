import { z } from "zod";

export const createTicketSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters").max(255, "Title too long"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    reporterName: z.string().min(1, "Reporter name is required"),
    reporterEmail: z.string().email("Invalid email format"),
    status: z.enum(["open", "in_progress", "resolved", "closed"]).default("open"),
});

export const updateTicketSchema = z.object({
    title: z.string().min(5).max(255).optional(),
    description: z.string().min(10).optional(),
    reporterName: z.string().min(1).optional(),
    reporterEmail: z.string().email().optional(),
    status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
});

export const updateStatusSchema = z.object({
    status: z.enum(["open", "in_progress", "resolved", "closed"]).refine(
        (val) => ["open", "in_progress", "resolved", "closed"].includes(val),
        { message: "Invalid status value" }
    ),
});

export const assignTicketSchema = z.object({
    assigneeId: z.string().min(1, "Assignee ID cannot be empty"),
});

export const createCommentSchema = z.object({
    content: z.string().min(1, "Comment cannot be empty").max(5000, "Comment too long"),
});

export const ticketQuerySchema = z.object({
    status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
    priority: z.enum(["low", "medium", "high", "critical"]).optional(),
    category: z.string().optional(),
    search: z.string().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
});