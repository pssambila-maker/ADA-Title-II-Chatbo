import * as path from "path";

export interface AppConfig {
    // LLM Provider
    llmProvider: "github" | "azure";

    // GitHub Models (free tier)
    githubModelsToken: string;
    githubModelsModel: string;

    // Azure OpenAI
    azureOpenAIEndpoint: string;
    azureOpenAIApiKey: string;
    azureOpenAIDeployment: string;

    // Bot Framework
    microsoftAppId: string;
    microsoftAppPassword: string;
    microsoftAppType: string;

    // Cost Controls
    maxOutputTokens: number;
    maxTurnsBeforeSummary: number;
    rateLimitPerUser: number;

    // Knowledge Base
    kbPath: string;

    // Logging
    logLevel: string;
}

export function loadConfig(): AppConfig {
    return {
        llmProvider: (process.env.LLM_PROVIDER as "github" | "azure") || "github",

        githubModelsToken: process.env.GITHUB_MODELS_TOKEN || "",
        githubModelsModel: process.env.GITHUB_MODELS_MODEL || "gpt-4o-mini",

        azureOpenAIEndpoint: process.env.AZURE_OPENAI_ENDPOINT || "",
        azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY || "",
        azureOpenAIDeployment: process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4o-mini",

        microsoftAppId: process.env.MICROSOFT_APP_ID || "",
        microsoftAppPassword: process.env.MICROSOFT_APP_PASSWORD || "",
        microsoftAppType: process.env.MICROSOFT_APP_TYPE || "MultiTenant",

        maxOutputTokens: parseInt(process.env.MAX_OUTPUT_TOKENS || "500", 10),
        maxTurnsBeforeSummary: parseInt(process.env.MAX_TURNS_BEFORE_SUMMARY || "8", 10),
        rateLimitPerUser: parseInt(process.env.RATE_LIMIT_PER_USER || "10", 10),

        kbPath: process.env.KB_PATH || path.resolve(__dirname, "../../../data/kb"),

        logLevel: process.env.LOG_LEVEL || "info",
    };
}

let _config: AppConfig | null = null;

export function getConfig(): AppConfig {
    if (!_config) {
        _config = loadConfig();
    }
    return _config;
}
