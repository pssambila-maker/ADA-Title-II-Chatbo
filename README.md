# ⚖️ ADA Title II Accessibility Guidance Chatbot

> A **$0-cost prototype** that answers ADA Title II and WCAG 2.1 Level AA questions with citation-backed responses powered by RAG (Retrieval-Augmented Generation).

[![Azure Functions](https://img.shields.io/badge/Azure_Functions-v4-blue?logo=azure-functions)](https://learn.microsoft.com/en-us/azure/azure-functions/)
[![Bot Framework](https://img.shields.io/badge/Bot_Framework-SDK_v4-green?logo=microsoft)](https://dev.botframework.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Internal_Prototype-yellow)]()

---

## 🎯 What It Does

This chatbot helps state and local government employees understand digital accessibility requirements under ADA Title II. It:

- **Answers questions** about WCAG 2.1 Level AA, compliance deadlines, content exceptions, and implementation techniques
- **Cites sources** — every answer references the specific policy document it drew from
- **Detects escalation** — refuses legal advice requests and recommends consulting counsel
- **Displays a disclaimer** — reminds users this is informational, not legal advice

### Example Questions
| Question | Bot Behavior |
|----------|-------------|
| "What is WCAG 2.1 Level AA?" | RAG answer with POUR principles + citations |
| "What's the deadline for a 75K city?" | Correctly identifies April 24, 2026 (>50K tier) |
| "Are archived PDFs exempt?" | Nuanced answer: exempt if criteria met, but effective communication still required |
| "I need legal advice" | ⚠️ Escalation: refuses and recommends legal counsel |

---

## 🏗️ Architecture

```
User ──▶ Browser Chat UI ──▶ Azure Functions (POST /api/chat)
                                    │
                                    ├──▶ Escalation Detection
                                    │         └── Legal/complaint patterns → Refuse + recommend
                                    │
                                    ├──▶ RAG Retrieval (TF-IDF)
                                    │         └── Search 8 policy cards → Top 5 chunks
                                    │
                                    └──▶ LLM (GitHub Models GPT-4o-mini / Azure OpenAI)
                                              └── Grounded answer + citations
```

### Tech Stack
| Component | Technology | Cost |
|-----------|-----------|------|
| Runtime | Azure Functions v4 (Node.js 20) | Free (Consumption plan) |
| LLM (Local) | GitHub Models — GPT-4o-mini | Free |
| LLM (Azure) | Azure OpenAI — GPT-4o-mini | ~$0.50 for testing |
| Bot Protocol | Bot Framework SDK v4 | Free |
| Search | TF-IDF with authority boosting | Free (in-memory) |
| Knowledge | 8 curated Markdown policy cards | Free (public sources) |
| Infrastructure | Bicep IaC templates | Free-tier resources only |

---

## 📁 Project Structure

```
title2-accessibility-bot/
├── README.md                          # This file
├── USER_GUIDE.md                      # Comprehensive user & admin guide
├── .env.example                       # Environment variable documentation
├── .gitignore
│
├── apps/bot-api/                      # Main application
│   ├── package.json                   # Dependencies & scripts
│   ├── tsconfig.json                  # TypeScript strict config
│   ├── host.json                      # Azure Functions host config
│   ├── local.settings.json            # Local environment (git-ignored)
│   └── src/
│       ├── index.ts                   # Entry point — registers all functions
│       ├── functions/
│       │   ├── messages.ts            # POST /api/messages (Bot Framework)
│       │   └── chat.ts               # GET+POST /api/chat (Browser UI)
│       ├── bot/
│       │   ├── adapter.ts             # Bot Framework CloudAdapter
│       │   ├── dialog.ts              # Conversation flow + disclaimer
│       │   └── escalation.ts          # Legal advice / complaint detection
│       ├── rag/
│       │   ├── retrieve.ts            # TF-IDF search + chunking engine
│       │   └── answer.ts             # LLM call + citation formatting
│       └── utils/
│           ├── config.ts              # Env config + provider toggle
│           └── logger.ts              # Structured JSON logger
│
├── data/kb/                           # Knowledge base (8 policy cards)
│   ├── doj-title-ii-rule.md           # DOJ final rule overview
│   ├── title-ii-exceptions.md         # Content exceptions framework
│   ├── wcag-2.1-overview.md           # WCAG 2.1 full overview
│   ├── wcag-1.4.3-contrast.md         # Contrast minimum (SC 1.4.3)
│   ├── wcag-1.1.1-text-alternatives.md # Text alternatives (SC 1.1.1)
│   ├── pdf-accessibility.md           # PDF accessibility guidance
│   ├── video-audio-accessibility.md   # Captions, audio descriptions
│   ├── forms-guidance.md              # Accessible forms & inputs
│   └── keyboard-accessibility.md      # Keyboard nav & focus management
│
└── infra/
    └── main.bicep                     # Azure IaC (all free-tier resources)
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js 20+** — [Download](https://nodejs.org/)
- **Azure Functions Core Tools v4** — `npm install -g azure-functions-core-tools@4`
- **GitHub Personal Access Token (classic)** — [Generate here](https://github.com/settings/tokens) (no scopes needed)

### Setup
```bash
# 1. Clone the repo
git clone https://github.com/pssambila-maker/ADA-Title-II-Chatbo.git
cd ADA-Title-II-Chatbo

# 2. Install dependencies
cd apps/bot-api
npm install

# 3. Configure your GitHub token
# Edit local.settings.json → set GITHUB_MODELS_TOKEN to your ghp_... token

# 4. Build & run
npm run build
func start
```

### Test
Open **http://localhost:7071/api/chat** in your browser.

---

## ☁️ Azure Deployment ($0 with Free Account)

```bash
# 1. Create Azure Free Account → https://azure.microsoft.com/free

# 2. Deploy infrastructure (all free-tier)
az group create --name rg-title2bot-dev --location eastus2
az deployment group create -g rg-title2bot-dev -f infra/main.bicep

# 3. Deploy code
cd apps/bot-api
func azure functionapp publish func-title2bot-dev

# 4. DESTROY before Day 30 → $0 total
az group delete --name rg-title2bot-dev --yes --no-wait
```

---

## 📖 Documentation

- **[User Guide](USER_GUIDE.md)** — Full setup, usage, administration, and troubleshooting guide
- **[.env.example](.env.example)** — All configurable environment variables

---

## 🔒 Security Notes

- `local.settings.json` contains your API token — it is **git-ignored** by default
- The bot includes a disclaimer on every conversation start
- Escalation detection prevents the bot from giving legal advice
- All answers are grounded in the knowledge base — the LLM cannot hallucinate uncited claims

---

## 📜 License

Internal prototype — not for public distribution.
