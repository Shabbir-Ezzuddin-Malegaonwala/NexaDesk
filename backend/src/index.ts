import "dotenv/config";
import { Elysia } from "elysia";
import { node } from "@elysiajs/node";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { authPlugin } from "./middleware/auth";
import { ticketRoutes } from "./routes/tickets";
import { commentRoutes } from "./routes/comments";
import { aiRoutes } from "./routes/ai";
import { auth } from "./auth";

const app = new Elysia({ adapter: node() })
    .use(cors({
        origin: ["http://localhost:3000"],
        credentials: true,
    }))
    .use(swagger({
        documentation: {
            info: {
                title: "NexaDesk API",
                version: "1.0.0",
            },
        },
    }))
    .all("/api/auth/*", (ctx) => auth.handler(ctx.request))
    .use(authPlugin)
    .use(ticketRoutes)
    .use(commentRoutes)
    .use(aiRoutes)
    .get("/health", () => ({ status: "ok", service: "nexadesk-backend" }))
    .listen(3001);

console.log(`NexaDesk backend running at http://localhost:3001`);