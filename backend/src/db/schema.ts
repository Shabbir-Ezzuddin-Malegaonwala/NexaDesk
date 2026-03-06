import { pgTable, uuid, varchar, text, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";

export const statusEnum = pgEnum("status_enum", [
    "open",
    "in_progress", 
    "resolved",
    "closed"
]);

export const priorityEnum = pgEnum("priority_enum", [
    "low",
    "medium",
    "high",
    "critical"
]);

export const users = pgTable("users", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull()
});

export const session = pgTable("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id").notNull().references(() => users.id),
    activeOrganizationId: text("active_organization_id")
});

export const account = pgTable("account", {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id").notNull().references(() => users.id),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull()
});

export const verification = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at")
});

export const organization = pgTable("organization", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").unique(),
    logo: text("logo"),
    createdAt: timestamp("created_at").notNull(),
    metadata: text("metadata")
});

export const member = pgTable("member", {
    id: text("id").primaryKey(),
    organizationId: text("organization_id").notNull().references(() => organization.id),
    userId: text("user_id").notNull().references(() => users.id),
    role: text("role").notNull(),
    createdAt: timestamp("created_at").notNull()
});

export const invitation = pgTable("invitation", {
    id: text("id").primaryKey(),
    organizationId: text("organization_id").notNull().references(() => organization.id),
    email: text("email").notNull(),
    role: text("role").notNull(),
    status: text("status").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    inviterId: text("inviter_id").notNull().references(() => users.id)
});

export const tickets = pgTable("tickets", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    status: statusEnum("status").notNull().default("open"),
    priority: priorityEnum("priority"),
    category: varchar("category", { length: 100 }),
    reporterName: varchar("reporter_name", { length: 255 }).notNull(),
    reporterEmail: varchar("reporter_email", { length: 255 }).notNull(),
    reporterId: varchar("reporter_id", { length: 255 }),
    assigneeId: varchar("assignee_id", { length: 255 }),
    organizationId: varchar("organization_id", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const ticketComments = pgTable("ticket_comments", {
    id: uuid("id").primaryKey().defaultRandom(),
    ticketId: uuid("ticket_id").references(() => tickets.id, { onDelete: "cascade" }).notNull(),
    content: text("content").notNull(),
    authorId: varchar("author_id", { length: 255 }).notNull(),
    isAiGenerated: boolean("is_ai_generated").default(false).notNull(),
    organizationId: varchar("organization_id", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// TypeScript types
export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;
export type Comment = typeof ticketComments.$inferSelect;
export type NewComment = typeof ticketComments.$inferInsert;
export type Member = typeof member.$inferSelect;
export type User = typeof users.$inferSelect;
export type Organization = typeof organization.$inferSelect;