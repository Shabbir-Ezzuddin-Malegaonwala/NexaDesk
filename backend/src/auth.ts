import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./db/schema";

const isProduction = process.env.NODE_ENV === "production" ||
    !!process.env.BETTER_AUTH_URL?.startsWith("https");

const frontendUrl = (process.env.FRONTEND_URL ?? "http://localhost:3000").replace(/\/$/, "");
const backendUrl = process.env.BETTER_AUTH_URL?.replace(/\/$/, "");

export const auth = betterAuth({
    baseURL: backendUrl,
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            user: schema.users,
            session: schema.session,
            account: schema.account,
            verification: schema.verification,
            organization: schema.organization,
            member: schema.member,
            invitation: schema.invitation,
        },
    }),
    emailAndPassword: {
        enabled: true,
    },
    plugins: [
        organization({
            allowUserToCreateOrganization: true,
        }),
    ],
    trustedOrigins: [frontendUrl],
    advanced: {
        defaultCookieAttributes: {
            sameSite: isProduction ? "none" : "lax",
            secure: isProduction,
        },
    },
});