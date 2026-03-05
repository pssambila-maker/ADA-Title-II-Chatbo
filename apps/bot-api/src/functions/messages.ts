/**
 * Azure Functions HTTP trigger for bot messages.
 * POST /api/messages — receives activities from Bot Framework channels.
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getAdapter } from "../bot/adapter.js";
import { AccessibilityBot } from "../bot/dialog.js";
import { logger } from "../utils/logger.js";

// Singleton bot instance
const bot = new AccessibilityBot();

async function messagesHandler(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {
    logger.debug("Incoming request", {
        method: request.method,
        url: request.url,
    });

    try {
        const adapter = getAdapter();

        // Bot Framework expects the adapter to process the request/response
        // We need to adapt the Azure Functions v4 request to what the adapter expects
        const body = await request.text();
        const activity = JSON.parse(body);

        // Process the activity through the bot
        const responseBody = await new Promise<string>((resolve, reject) => {
            const res = {
                status: 200,
                headers: {} as Record<string, string>,
                body: "",
                setHeader(key: string, value: string) {
                    this.headers[key] = value;
                },
                end(body?: string) {
                    this.body = body || "";
                    resolve(this.body);
                },
                send(body: string) {
                    this.body = body;
                    resolve(body);
                },
                write() {
                    // no-op for streaming
                },
            };

            const req = {
                body: activity,
                headers: Object.fromEntries(request.headers.entries()),
                method: request.method,
            };

            adapter.process(req as any, res as any, async (turnContext) => {
                await bot.run(turnContext);
            }).catch(reject);
        });

        return {
            status: 200,
            headers: { "Content-Type": "application/json" },
            body: responseBody || "",
        };
    } catch (error) {
        logger.error("Messages handler error", {
            error: error instanceof Error ? error.message : String(error),
        });

        return {
            status: 500,
            body: JSON.stringify({ error: "Internal server error" }),
        };
    }
}

// Register the Azure Function
app.http("messages", {
    methods: ["POST"],
    authLevel: "anonymous",
    route: "api/messages",
    handler: messagesHandler,
});

export default messagesHandler;
