# 📖 User Guide — ADA Title II Accessibility Chatbot

> Complete guide for setting up, using, and administering the chatbot.

---

## Table of Contents

1. [For End Users](#1-for-end-users)
2. [For Developers](#2-for-developers)
3. [For Administrators](#3-for-administrators)
4. [Knowledge Base Management](#4-knowledge-base-management)
5. [Troubleshooting](#5-troubleshooting)
6. [FAQ](#6-faq)

---

## 1. For End Users

### What is this bot?

The ADA Title II Accessibility Bot is an AI-powered assistant that helps you understand digital accessibility requirements. It answers questions about:

- **ADA Title II** — The federal law requiring state/local governments to make digital content accessible
- **WCAG 2.1 Level AA** — The technical standard (Web Content Accessibility Guidelines) that the law adopts
- **Compliance deadlines** — When your organization needs to be compliant
- **Content exceptions** — What content may be exempt (archived documents, third-party content, etc.)
- **Implementation guidance** — How to meet specific success criteria (contrast, alt text, forms, keyboards, captions)
- **PDF accessibility** — How to make documents accessible

### How to Use

1. **Open the chat** at the URL provided by your administrator
2. **Read the disclaimer** — the bot provides informational guidance, not legal advice
3. **Ask a question** — type naturally or click a suggestion chip
4. **Review the answer** — every response includes source citations so you can verify the information
5. **Check the sources** — citations point to specific DOJ, W3C, or policy documents

### Example Questions

| Category | Try Asking |
|----------|-----------|
| **Overview** | "What is WCAG 2.1 Level AA?" |
| **Deadlines** | "When does my city need to be ADA compliant?" |
| **Exceptions** | "Are archived PDFs exempt from accessibility?" |
| **Technical** | "What's the minimum contrast ratio for text?" |
| **Technical** | "How do I add alt text to images?" |
| **Forms** | "What makes a form accessible?" |
| **Video** | "Do our videos need captions?" |
| **Keyboard** | "How do I test keyboard accessibility?" |

### What the Bot Won't Do

The bot is designed with safety guardrails:

- ❌ **No legal advice** — If you ask about lawsuits, liability, or legal strategy, the bot will redirect you to legal counsel
- ❌ **No complaint filing** — The bot cannot file complaints or initiate legal actions
- ❌ **No personal data** — The bot does not store personal information between sessions
- ❌ **No fabrication** — Answers are grounded in the knowledge base; the bot will say "I don't know" rather than guess

---

## 2. For Developers

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 20+ | [nodejs.org](https://nodejs.org/) |
| Azure Functions Core Tools | v4 | `npm install -g azure-functions-core-tools@4` |
| Git | Any | [git-scm.com](https://git-scm.com/) |
| GitHub PAT (classic) | — | [Generate token](https://github.com/settings/tokens) — no scopes needed |

### Local Setup (Step by Step)

#### Step 1: Clone and Install

```bash
git clone https://github.com/pssambila-maker/ADA-Title-II-Chatbo.git
cd ADA-Title-II-Chatbo/apps/bot-api
npm install
```

#### Step 2: Configure Environment

Edit `apps/bot-api/local.settings.json`:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "LLM_PROVIDER": "github",
    "GITHUB_MODELS_TOKEN": "ghp_YOUR_TOKEN_HERE",
    "GITHUB_MODELS_MODEL": "gpt-4o-mini",
    "KB_PATH": "../../data/kb",
    "MAX_OUTPUT_TOKENS": "500",
    "LOG_LEVEL": "info"
  }
}
```

> **Important**: Use a **classic** GitHub token (`ghp_...`), not a fine-grained one (`github_pat_...`). Fine-grained tokens don't work with GitHub Models.

#### Step 3: Build and Run

```bash
npm run build    # Compile TypeScript
func start       # Start the Azure Functions host
```

You should see:
```
Functions:
        chatMessage: [POST] http://localhost:7071/api/chat
        chatUI: [GET] http://localhost:7071/api/chat
        messages: [POST] http://localhost:7071/api/messages
```

#### Step 4: Test

Open **http://localhost:7071/api/chat** in your browser.

### Endpoints

| Method | URL | Purpose |
|--------|-----|---------|
| `GET` | `/api/chat` | Browser-based test chat UI |
| `POST` | `/api/chat` | Direct chat API (JSON) |
| `POST` | `/api/messages` | Bot Framework protocol endpoint |

### Direct API Usage

```bash
# Send a question
curl -X POST http://localhost:7071/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is WCAG 2.1?", "sessionId": "my-session"}'

# Response format
{
  "answer": "WCAG 2.1 Level AA refers to...",
  "sources": 5,
  "tokensUsed": 342,
  "model": "gpt-4o-mini"
}
```

### LLM Provider Toggle

The bot supports two LLM providers via the `LLM_PROVIDER` environment variable:

| Provider | Setting | Token Env Var | Cost |
|----------|---------|---------------|------|
| GitHub Models | `"github"` | `GITHUB_MODELS_TOKEN` | Free |
| Azure OpenAI | `"azure"` | `AZURE_OPENAI_API_KEY` | ~$0.50 for testing |

To switch providers, change `LLM_PROVIDER` in `local.settings.json` and set the corresponding API key.

---

## 3. For Administrators

### Azure Deployment

#### Step 1: Create Azure Free Account

Go to [azure.microsoft.com/free](https://azure.microsoft.com/free) and sign up for $200 free credit (valid 30 days).

#### Step 2: Deploy Resources

All resources use free tiers to stay within the $0 target:

```bash
# Create resource group
az group create --name rg-title2bot-dev --location eastus2

# Deploy all resources (Storage, Functions, Bot Service, App Insights)
az deployment group create \
  --resource-group rg-title2bot-dev \
  --template-file infra/main.bicep
```

#### Step 3: Deploy Code

```bash
cd apps/bot-api
func azure functionapp publish func-title2bot-dev
```

#### Step 4: Configure in Azure Portal

1. Go to the Function App → **Configuration**
2. Set `LLM_PROVIDER` to `"azure"` (or keep `"github"`)
3. Set the appropriate API key
4. For Azure OpenAI: set `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, and `AZURE_OPENAI_DEPLOYMENT`

#### Step 5: Test

- Open the **Bot Service** in Azure Portal → **Test in Web Chat**
- Or visit the Function App URL + `/api/chat`

#### 🚨 Step 6: Destroy Before Day 30

```bash
az group delete --name rg-title2bot-dev --yes --no-wait
```

> **Critical**: Delete the resource group before your free trial expires to avoid charges.

### Resource Costs (Free Tier)

| Resource | Free Tier Limit | Expected Usage |
|----------|----------------|----------------|
| Azure Functions (Consumption) | 1M executions/month | ~100 for testing |
| Storage Account | 5 GB / 12 months | < 1 MB |
| Application Insights | 5 GB / month | < 100 MB |
| Bot Service (F0) | Unlimited standard channels | Web Chat only |
| Azure OpenAI (if used) | No free tier | ~$0.50 for testing |

---

## 4. Knowledge Base Management

### How the knowledge base works

The bot's knowledge comes from **Markdown files** in the `data/kb/` directory. Each file is a "policy card" that covers a specific topic. The bot:

1. **Chunks** each file into paragraphs at startup
2. **Searches** chunks using TF-IDF when a question is asked
3. **Ranks** results by relevance score × authority level
4. **Sends** the top 5 chunks to the LLM as context
5. **Generates** an answer grounded only in the retrieved chunks

### Policy Card Format

Each card has YAML frontmatter + Markdown content:

```markdown
---
title: Your Topic Title
authority: primary    # "primary" (DOJ/W3C) or "secondary" (guidance docs)
source: https://...   # URL of the original source
last_updated: 2024-01-15
---

# Your Topic Title

## Section 1
Content here...

## Section 2
More content...
```

### Adding a New Policy Card

1. Create a new `.md` file in `data/kb/`
2. Add the YAML frontmatter (title, authority, source, date)
3. Write the content in clear, structured Markdown
4. Rebuild and restart: `npm run build && func start`

### Current Knowledge Base

| File | Topic | Authority |
|------|-------|-----------|
| `doj-title-ii-rule.md` | ADA Title II Final Rule — who, what, when | Primary |
| `title-ii-exceptions.md` | Content exceptions — archived, third-party, etc. | Primary |
| `wcag-2.1-overview.md` | WCAG 2.1 overview — POUR principles, levels | Primary |
| `wcag-1.4.3-contrast.md` | Contrast minimum (SC 1.4.3) — ratios, testing | Primary |
| `wcag-1.1.1-text-alternatives.md` | Text alternatives (SC 1.1.1) — alt text | Primary |
| `pdf-accessibility.md` | PDF accessibility — tags, testing, remediation | Secondary |
| `video-audio-accessibility.md` | Captions, audio descriptions, transcripts | Primary |
| `forms-guidance.md` | Accessible forms — labels, errors, autocomplete | Primary |
| `keyboard-accessibility.md` | Keyboard nav — focus, skip links, traps | Primary |

---

## 5. Troubleshooting

### Common Issues

| Problem | Cause | Fix |
|---------|-------|-----|
| `func` not recognized | Functions Core Tools not installed | `npm install -g azure-functions-core-tools@4` |
| 404 on `/api/chat` | Functions not registered | Check `package.json` has `"main": "dist/index.js"`, rebuild |
| LLM returns error | Wrong token type | Use a classic PAT (`ghp_...`), not fine-grained |
| LLM returns error | Token expired | Generate a new token at github.com/settings/tokens |
| Empty responses | KB files not found | Check `KB_PATH` in settings matches `data/kb/` location |
| Build errors | Missing dependencies | Run `npm install` then `npm run build` |
| Port 7071 in use | Another process using port | Kill the process or use `func start --port 7072` |

### Checking Server Logs

While `func start` is running, all logs appear in the terminal. Look for:
- `[INFO]` — Normal operation
- `[WARN]` — Non-critical issues
- `[ERROR]` — Failures (usually with LLM API calls)

---

## 6. FAQ

**Q: Is this legal advice?**
A: No. This bot provides informational guidance based on public DOJ and W3C documents. Always consult legal counsel for compliance decisions.

**Q: Does the bot store my conversations?**
A: In-memory only during the session. Nothing is persisted to disk or database. When the server restarts, all conversation history is cleared.

**Q: Can I add my organization's specific policies?**
A: Yes! Add a new `.md` file to `data/kb/` with your content. Set `authority: secondary` in the frontmatter.

**Q: Why GPT-4o-mini instead of GPT-4o?**
A: GPT-4o-mini is free via GitHub Models and provides excellent quality for this use case. You can switch to GPT-4o on Azure OpenAI by changing the deployment name.

**Q: What happens after the Azure free trial?**
A: Delete the resource group before Day 30 to avoid any charges. The `az group delete` command removes everything.

**Q: Can this be connected to Microsoft Teams?**
A: Yes. The Bot Framework endpoint (`/api/messages`) supports Teams channel registration through Azure Bot Service.
