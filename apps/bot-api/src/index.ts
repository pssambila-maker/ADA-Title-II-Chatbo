/**
 * Main entry point for Azure Functions.
 * Imports all function registrations.
 */

// Import all function modules — each registers its own HTTP triggers
import "./functions/messages.js";
import "./functions/chat.js";
