/**
 * Main bot dialog handler.
 * Manages conversation flow including:
 * - Welcome disclaimer on conversation start
 * - Escalation detection before answering
 * - RAG-powered citation-backed answers
 * - Conversation history tracking per session
 */

import { ActivityHandler, TurnContext, MemoryStorage, ConversationState, StatePropertyAccessor } from "botbuilder";
import { generateAnswer } from "../rag/answer.js";
import { detectEscalation, getEscalationResponse } from "./escalation.js";
import { logger } from "../utils/logger.js";

const DISCLAIMER =
    "👋 **Welcome to the ADA Title II Accessibility Guidance Bot!**\n\n" +
    "I can help you understand:\n" +
    "- WCAG 2.1 Level AA requirements\n" +
    "- ADA Title II digital accessibility rules\n" +
    "- Compliance timelines and exceptions\n" +
    "- Implementation techniques and best practices\n\n" +
    "⚠️ **Disclaimer:** This is an informational tool, not legal advice. " +
    "All responses are based on published DOJ guidance and W3C standards. " +
    "Please consult legal counsel for specific compliance questions.\n\n" +
    "**Ask me anything about digital accessibility!**";

interface ConversationData {
    history: Array<{ role: "user" | "assistant"; content: string }>;
    turnCount: number;
}

export class AccessibilityBot extends ActivityHandler {
    private conversationState: ConversationState;
    private conversationDataAccessor: StatePropertyAccessor<ConversationData>;

    constructor() {
        super();

        // Use in-memory storage for the prototype
        // Swap to Azure Table Storage for production
        const storage = new MemoryStorage();
        this.conversationState = new ConversationState(storage);
        this.conversationDataAccessor = this.conversationState.createProperty<ConversationData>("conversationData");

        // Handle new conversations
        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded || [];
            for (const member of membersAdded) {
                if (member.id !== context.activity.recipient.id) {
                    await context.sendActivity(DISCLAIMER);
                    logger.info("New conversation started", {
                        userId: member.id,
                        channel: context.activity.channelId,
                    });
                }
            }
            await next();
        });

        // Handle incoming messages
        this.onMessage(async (context, next) => {
            const userMessage = context.activity.text?.trim();

            if (!userMessage) {
                await context.sendActivity("I didn't receive a text message. Please type your question.");
                await next();
                return;
            }

            logger.info("Message received", {
                userId: context.activity.from?.id,
                messageLength: userMessage.length,
            });

            // Get conversation state
            const conversationData = await this.conversationDataAccessor.get(context, {
                history: [],
                turnCount: 0,
            });

            // 1. Check for escalation triggers FIRST
            const escalation = detectEscalation(userMessage);
            if (escalation.shouldEscalate) {
                logger.warn("Escalation triggered", {
                    category: escalation.category,
                    reason: escalation.reason,
                    userId: context.activity.from?.id,
                });

                const escalationResponse = getEscalationResponse(escalation);
                await context.sendActivity(escalationResponse);

                // Still save to history
                conversationData.history.push({ role: "user", content: userMessage });
                conversationData.history.push({ role: "assistant", content: escalationResponse });
                conversationData.turnCount++;
                await this.conversationState.saveChanges(context);
                await next();
                return;
            }

            // 2. Show typing indicator
            await context.sendActivity({ type: "typing" });

            // 3. Generate RAG-based answer
            const result = await generateAnswer(userMessage, conversationData.history);

            // 4. Send the response
            await context.sendActivity(result.answer);

            // 5. Update conversation state
            conversationData.history.push({ role: "user", content: userMessage });
            conversationData.history.push({ role: "assistant", content: result.answer });
            conversationData.turnCount++;

            logger.info("Response sent", {
                turnCount: conversationData.turnCount,
                sourcesUsed: result.sources.length,
                tokensUsed: result.tokensUsed,
                model: result.model,
            });

            await this.conversationState.saveChanges(context);
            await next();
        });
    }
}
