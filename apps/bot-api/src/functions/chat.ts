/**
 * Direct chat endpoint for browser-based testing.
 * Bypasses Bot Framework protocol for simple testing.
 * 
 * GET  /api/chat         → serves the test UI
 * POST /api/chat         → sends a message, returns the bot's response
 * POST /api/chat/reset   → resets conversation history
 */

import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { generateAnswer } from "../rag/answer.js";
import { detectEscalation, getEscalationResponse } from "../bot/escalation.js";
import { logger } from "../utils/logger.js";

// In-memory conversation history per session
const sessions = new Map<string, Array<{ role: "user" | "assistant"; content: string }>>();

const DISCLAIMER =
    "👋 **Welcome to the ADA Title II Accessibility Guidance Bot!**\n\n" +
    "I can help you understand WCAG 2.1 Level AA requirements, ADA Title II digital accessibility rules, " +
    "compliance timelines, exceptions, and implementation techniques.\n\n" +
    "⚠️ **Disclaimer:** This is an informational tool, not legal advice. " +
    "Please consult legal counsel for specific compliance questions.\n\n" +
    "**Ask me anything about digital accessibility!**";

const CHAT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ADA Title II Accessibility Bot — Test Chat</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
      color: #e2e8f0;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    header {
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(99, 102, 241, 0.2);
      padding: 16px 24px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    header .logo {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }
    
    header h1 {
      font-size: 18px;
      font-weight: 600;
      color: #f1f5f9;
    }
    
    header .badge {
      background: rgba(99, 102, 241, 0.15);
      color: #a5b4fc;
      font-size: 11px;
      font-weight: 500;
      padding: 4px 10px;
      border-radius: 20px;
      border: 1px solid rgba(99, 102, 241, 0.3);
    }
    
    #chat-container {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      scroll-behavior: smooth;
    }
    
    .message {
      max-width: 80%;
      padding: 14px 18px;
      border-radius: 16px;
      line-height: 1.6;
      font-size: 14px;
      animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .message.bot {
      align-self: flex-start;
      background: rgba(30, 41, 59, 0.8);
      border: 1px solid rgba(99, 102, 241, 0.15);
      border-bottom-left-radius: 4px;
    }
    
    .message.user {
      align-self: flex-end;
      background: linear-gradient(135deg, #4f46e5, #6366f1);
      color: #ffffff;
      border-bottom-right-radius: 4px;
    }
    
    .message.bot strong { color: #a5b4fc; }
    .message.bot code {
      background: rgba(99, 102, 241, 0.15);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 13px;
    }
    .message.bot hr {
      border: none;
      border-top: 1px solid rgba(99, 102, 241, 0.15);
      margin: 12px 0;
    }
    
    .typing {
      align-self: flex-start;
      padding: 14px 18px;
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(99, 102, 241, 0.1);
      border-radius: 16px;
      border-bottom-left-radius: 4px;
      display: none;
    }
    
    .typing .dots {
      display: flex;
      gap: 4px;
    }
    
    .typing .dots span {
      width: 8px;
      height: 8px;
      background: #6366f1;
      border-radius: 50%;
      animation: bounce 1.4s infinite both;
    }
    
    .typing .dots span:nth-child(2) { animation-delay: 0.16s; }
    .typing .dots span:nth-child(3) { animation-delay: 0.32s; }
    
    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
      40% { transform: scale(1); opacity: 1; }
    }
    
    #input-area {
      background: rgba(15, 23, 42, 0.9);
      backdrop-filter: blur(12px);
      border-top: 1px solid rgba(99, 102, 241, 0.2);
      padding: 16px 24px;
      display: flex;
      gap: 12px;
    }
    
    #user-input {
      flex: 1;
      background: rgba(30, 41, 59, 0.8);
      border: 1px solid rgba(99, 102, 241, 0.2);
      border-radius: 12px;
      padding: 12px 16px;
      color: #e2e8f0;
      font-family: inherit;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }
    
    #user-input:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
    }
    
    #user-input::placeholder { color: #64748b; }
    
    #send-btn {
      background: linear-gradient(135deg, #4f46e5, #6366f1);
      border: none;
      border-radius: 12px;
      padding: 12px 24px;
      color: white;
      font-family: inherit;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    
    #send-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    }
    
    #send-btn:active { transform: translateY(0); }
    #send-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

    .suggestions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }
    .suggestion {
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid rgba(99, 102, 241, 0.25);
      border-radius: 20px;
      padding: 6px 14px;
      font-size: 12px;
      color: #a5b4fc;
      cursor: pointer;
      transition: all 0.2s;
    }
    .suggestion:hover {
      background: rgba(99, 102, 241, 0.2);
      border-color: #6366f1;
    }
  </style>
</head>
<body>
  <header>
    <div class="logo">⚖️</div>
    <h1>ADA Title II Accessibility Bot</h1>
    <span class="badge">$0 Prototype</span>
  </header>
  
  <div id="chat-container">
    <div class="message bot" id="welcome"></div>
    <div class="suggestions" id="suggestions">
      <span class="suggestion" onclick="sendSuggestion(this)">What is WCAG 2.1 Level AA?</span>
      <span class="suggestion" onclick="sendSuggestion(this)">What's our compliance deadline?</span>
      <span class="suggestion" onclick="sendSuggestion(this)">How do I meet contrast requirements?</span>
      <span class="suggestion" onclick="sendSuggestion(this)">Are archived PDFs exempt?</span>
    </div>
  </div>
  
  <div class="typing" id="typing">
    <div class="dots"><span></span><span></span><span></span></div>
  </div>
  
  <div id="input-area">
    <input type="text" id="user-input" placeholder="Ask about WCAG 2.1, ADA Title II, accessibility..." 
           onkeydown="if(event.key==='Enter')sendMessage()" autofocus>
    <button id="send-btn" onclick="sendMessage()">Send</button>
  </div>
  
  <script>
    const sessionId = 'session-' + Math.random().toString(36).substring(2);
    const chatContainer = document.getElementById('chat-container');
    const input = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const typing = document.getElementById('typing');
    const suggestions = document.getElementById('suggestions');
    
    // Render welcome message
    fetch('/api/chat?sessionId=' + sessionId)
      .then(r => r.json())
      .then(d => { document.getElementById('welcome').innerHTML = renderMarkdown(d.message); });
    
    function sendSuggestion(el) {
      input.value = el.textContent;
      suggestions.style.display = 'none';
      sendMessage();
    }
    
    async function sendMessage() {
      const text = input.value.trim();
      if (!text) return;
      
      // Show user message
      const userDiv = document.createElement('div');
      userDiv.className = 'message user';
      userDiv.textContent = text;
      chatContainer.appendChild(userDiv);
      
      input.value = '';
      sendBtn.disabled = true;
      typing.style.display = 'block';
      suggestions.style.display = 'none';
      chatContainer.scrollTop = chatContainer.scrollHeight;
      
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, sessionId })
        });
        const data = await res.json();
        
        const botDiv = document.createElement('div');
        botDiv.className = 'message bot';
        botDiv.innerHTML = renderMarkdown(data.answer);
        chatContainer.appendChild(botDiv);
      } catch (e) {
        const errDiv = document.createElement('div');
        errDiv.className = 'message bot';
        errDiv.textContent = 'Error: Could not get a response. Please try again.';
        chatContainer.appendChild(errDiv);
      }
      
      typing.style.display = 'none';
      sendBtn.disabled = false;
      chatContainer.scrollTop = chatContainer.scrollHeight;
      input.focus();
    }
    
    function renderMarkdown(text) {
      return text
        .replace(/\\n/g, '\\n')
        .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
        .replace(/\\*(.+?)\\*/g, '<em>$1</em>')
        .replace(/\`(.+?)\`/g, '<code>$1</code>')
        .replace(/^### (.+)$/gm, '<h4>$1</h4>')
        .replace(/^## (.+)$/gm, '<h3>$1</h3>')
        .replace(/^- (.+)$/gm, '• $1<br>')
        .replace(/^\\d+\\. (.+)$/gm, '$&<br>')
        .replace(/\\[(.+?)\\]\\((.+?)\\)/g, '<a href="$2" target="_blank" style="color:#818cf8">$1</a>')
        .replace(/---/g, '<hr>')
        .replace(/\\n/g, '<br>');
    }
  </script>
</body>
</html>`;

// GET /api/chat — serve the chat UI
app.http("chatUI", {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "chat",
    handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
        const sessionId = request.query.get("sessionId") || "default";

        // Initialize session if new
        if (!sessions.has(sessionId)) {
            sessions.set(sessionId, []);
        }

        // Check if requesting JSON (for welcome message)
        if (sessionId !== "default") {
            return {
                status: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: DISCLAIMER }),
            };
        }

        // Serve HTML
        return {
            status: 200,
            headers: { "Content-Type": "text/html" },
            body: CHAT_HTML,
        };
    },
});

// POST /api/chat — handle chat messages
app.http("chatMessage", {
    methods: ["POST"],
    authLevel: "anonymous",
    route: "chat",
    handler: async (request: HttpRequest): Promise<HttpResponseInit> => {
        try {
            const body = (await request.json()) as { message: string; sessionId?: string };
            const userMessage = body.message?.trim();
            const sessionId = body.sessionId || "default";

            if (!userMessage) {
                return {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ error: "Message is required" }),
                };
            }

            logger.info("Chat message received", { sessionId, messageLength: userMessage.length });

            // Get or create session history
            if (!sessions.has(sessionId)) {
                sessions.set(sessionId, []);
            }
            const history = sessions.get(sessionId)!;

            // Check escalation
            const escalation = detectEscalation(userMessage);
            if (escalation.shouldEscalate) {
                const response = getEscalationResponse(escalation);
                history.push({ role: "user", content: userMessage });
                history.push({ role: "assistant", content: response });
                return {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ answer: response, escalated: true }),
                };
            }

            // Generate RAG answer
            const result = await generateAnswer(userMessage, history);

            // Save to history
            history.push({ role: "user", content: userMessage });
            history.push({ role: "assistant", content: result.answer });

            return {
                status: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    answer: result.answer,
                    sources: result.sources.length,
                    tokensUsed: result.tokensUsed,
                    model: result.model,
                }),
            };
        } catch (error) {
            logger.error("Chat handler error", {
                error: error instanceof Error ? error.message : String(error),
            });
            return {
                status: 500,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ error: "Internal server error" }),
            };
        }
    },
});
