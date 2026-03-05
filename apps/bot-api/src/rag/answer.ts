/**
 * Answer generator module.
 * Takes a user query, retrieves relevant KB chunks, and generates
 * a citation-backed answer using the configured LLM provider.
 */

import OpenAI from "openai";
import { getConfig } from "../utils/config.js";
import { logger } from "../utils/logger.js";
import { retrieve, formatContext, formatCitations, RetrievalResult } from "./retrieve.js";

const SYSTEM_PROMPT = `You are an ADA Title II accessibility guidance assistant. You help state and local government employees understand digital accessibility requirements under the Americans with Disabilities Act.

CRITICAL RULES:
1. All compliance claims MUST be grounded in the provided source context below.
2. If the sources don't support a claim, say "I cannot confirm this from my current sources."
3. Always cite sources using [Source N] format inline with your statements.
4. Never provide legal advice — you provide factual information only.
5. If asked for legal advice, refuse politely and suggest consulting legal counsel.
6. Be clear, practical, and actionable in your guidance.
7. When discussing WCAG success criteria, include the criterion number (e.g., SC 1.4.3).
8. If a question is outside your knowledge, say so honestly.

IMPORTANT: You are an informational tool, NOT a legal advisor. Every response you give is factual information based on published guidance, not legal counsel.`;

let openaiClient: OpenAI | null = null;

function getClient(): OpenAI {
    if (openaiClient) return openaiClient;

    const config = getConfig();

    if (config.llmProvider === "github") {
        // GitHub Models — free tier, OpenAI SDK compatible
        openaiClient = new OpenAI({
            baseURL: "https://models.inference.ai.azure.com",
            apiKey: config.githubModelsToken,
        });
        logger.info("Using GitHub Models (free tier)", { model: config.githubModelsModel });
    } else {
        // Azure OpenAI
        openaiClient = new OpenAI({
            baseURL: `${config.azureOpenAIEndpoint}openai/deployments/${config.azureOpenAIDeployment}`,
            apiKey: config.azureOpenAIApiKey,
            defaultQuery: { "api-version": "2024-08-01-preview" },
            defaultHeaders: { "api-key": config.azureOpenAIApiKey },
        });
        logger.info("Using Azure OpenAI", { deployment: config.azureOpenAIDeployment });
    }

    return openaiClient;
}

export interface AnswerResult {
    answer: string;
    citations: string;
    sources: RetrievalResult[];
    tokensUsed: number;
    model: string;
}

/**
 * Generate a citation-backed answer for a user query.
 */
export async function generateAnswer(
    userQuery: string,
    conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = []
): Promise<AnswerResult> {
    const config = getConfig();

    // 1. Retrieve relevant KB chunks
    const sources = retrieve(userQuery, 5);
    const context = formatContext(sources);
    const citations = formatCitations(sources);

    // 2. Build the messages array
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: "system", content: SYSTEM_PROMPT },
        {
            role: "system",
            content: `CONTEXT FROM KNOWLEDGE BASE:\n\n${context}`,
        },
    ];

    // Add conversation history (limited to last few turns for cost control)
    const recentHistory = conversationHistory.slice(-config.maxTurnsBeforeSummary * 2);
    for (const msg of recentHistory) {
        messages.push({ role: msg.role, content: msg.content });
    }

    // Add the current query
    messages.push({ role: "user", content: userQuery });

    // 3. Call the LLM
    const model =
        config.llmProvider === "github" ? config.githubModelsModel : config.azureOpenAIDeployment;

    try {
        const client = getClient();
        const response = await client.chat.completions.create({
            model,
            messages,
            max_tokens: config.maxOutputTokens,
            temperature: 0.3, // Low temperature for factual consistency
        });

        const answer = response.choices[0]?.message?.content || "I was unable to generate a response.";
        const tokensUsed = response.usage?.total_tokens || 0;

        logger.info("Answer generated", {
            queryLength: userQuery.length,
            sourcesFound: sources.length,
            tokensUsed,
            model,
        });

        return {
            answer: answer + citations,
            citations,
            sources,
            tokensUsed,
            model,
        };
    } catch (error) {
        logger.error("LLM call failed", {
            error: error instanceof Error ? error.message : String(error),
            provider: config.llmProvider,
        });

        return {
            answer:
                "I'm sorry, I encountered an error generating a response. Please try again.\n\n" +
                "If this persists, please contact your accessibility coordinator for assistance.",
            citations: "",
            sources: [],
            tokensUsed: 0,
            model,
        };
    }
}
