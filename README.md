# ADA Title II Accessibility Guidance Chatbot

> **$0 Prototype** — Built with Azure Functions, Bot Framework, and RAG-powered answers from public accessibility documents.

## Quick Start (Local)

### Prerequisites
- Node.js 20+
- [Azure Functions Core Tools v4](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local)
- [Bot Framework Emulator](https://github.com/microsoft/BotFramework-Emulator/releases)
- A [GitHub Personal Access Token](https://github.com/settings/tokens) (for free GPT-4o-mini via GitHub Models)

### 1. Install & Build
```bash
cd apps/bot-api
npm install
npm run build
```

### 2. Configure
Edit `apps/bot-api/local.settings.json`:
```json
{
  "Values": {
    "LLM_PROVIDER": "github",
    "GITHUB_MODELS_TOKEN": "ghp_your_token_here"
  }
}
```

### 3. Start (Optional: Azurite for storage)
```bash
# Terminal 1: Start storage emulator (optional)
npx azurite --silent

# Terminal 2: Start the bot
cd apps/bot-api
func start
```

### 4. Test
Open **Bot Framework Emulator** → Connect to `http://localhost:7071/api/messages`

## Architecture

```
User → Bot Channel (Web Chat/Teams)
  → Azure Bot Service
  → Azure Functions (POST /api/messages)
    → Escalation Detection
    → RAG Retrieval (TF-IDF over policy cards)
    → LLM (GitHub Models free / Azure OpenAI)
    → Citation-backed response
```

## Project Structure
```
title2-accessibility-bot/
├── apps/bot-api/         # Node/TS Azure Function
│   └── src/
│       ├── functions/    # HTTP triggers
│       ├── bot/          # Adapter, dialog, escalation
│       ├── rag/          # Retrieval + answer generation
│       └── utils/        # Config, logger
├── data/kb/              # Policy cards (markdown)
├── infra/                # Bicep IaC (for Azure deploy)
└── tests/                # Integration tests
```

## Knowledge Base
8 curated policy cards from public sources:
- DOJ Title II Rule + Exceptions
- WCAG 2.1 Overview
- Contrast (SC 1.4.3), Text Alternatives (SC 1.1.1)
- PDF, Video/Audio, Forms, Keyboard Accessibility

## Azure Deployment ($0 with Free Account)
1. Create Azure Free Account ($200 credit / 30 days)
2. Deploy: `az deployment group create -g rg-title2bot-dev -f infra/main.bicep`
3. Test via Web Chat
4. **Destroy before Day 30**: `az group delete --name rg-title2bot-dev --yes`

## License
Internal prototype — not for distribution.
