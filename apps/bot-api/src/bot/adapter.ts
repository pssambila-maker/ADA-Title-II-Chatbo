/**
 * Bot Framework adapter setup.
 * Handles credential validation and error handling.
 * For local testing (Bot Emulator), credentials can be empty.
 */

import {
    CloudAdapter,
    ConfigurationBotFrameworkAuthentication,
    ConfigurationBotFrameworkAuthenticationOptions,
} from "botbuilder";
import { getConfig } from "../utils/config.js";
import { logger } from "../utils/logger.js";

let adapter: CloudAdapter | null = null;

export function getAdapter(): CloudAdapter {
    if (adapter) return adapter;

    const config = getConfig();

    const authConfig: ConfigurationBotFrameworkAuthenticationOptions = {
        MicrosoftAppId: config.microsoftAppId,
        MicrosoftAppPassword: config.microsoftAppPassword,
        MicrosoftAppType: config.microsoftAppType,
    };

    const botFrameworkAuth = new ConfigurationBotFrameworkAuthentication(authConfig);
    adapter = new CloudAdapter(botFrameworkAuth);

    // Global error handler
    adapter.onTurnError = async (context, error) => {
        logger.error("Bot turn error", {
            error: error instanceof Error ? error.message : String(error),
            activity: context.activity?.type,
            userId: context.activity?.from?.id,
        });

        // Send a friendly error message to the user
        await context.sendActivity(
            "I'm sorry, I encountered an unexpected error. Please try your question again.\n\n" +
            "If this issue persists, please contact your accessibility coordinator."
        );
    };

    logger.info("Bot adapter initialized", {
        appId: config.microsoftAppId ? "configured" : "empty (local mode)",
    });

    return adapter;
}
