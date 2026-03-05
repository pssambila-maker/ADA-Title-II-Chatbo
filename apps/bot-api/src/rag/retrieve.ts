/**
 * Knowledge Base retrieval module.
 * Loads markdown policy cards from disk and performs simple keyword-based search.
 * For the $0 prototype, we use TF-IDF-style scoring instead of vector embeddings.
 * This can be swapped for Azure AI Search or a vector DB later.
 */

import * as fs from "fs";
import * as path from "path";
import { getConfig } from "../utils/config.js";
import { logger } from "../utils/logger.js";

export interface KBChunk {
    id: string;
    title: string;
    content: string;
    source: string;
    authorityLevel: "primary" | "secondary" | "tertiary";
    tokens: string[];
}

export interface RetrievalResult {
    chunk: KBChunk;
    score: number;
    sourceIndex: number;
}

let kbCache: KBChunk[] | null = null;

/**
 * Load and parse all markdown policy cards from the KB directory.
 */
export function loadKnowledgeBase(): KBChunk[] {
    if (kbCache) return kbCache;

    const config = getConfig();
    const kbDir = config.kbPath;

    if (!fs.existsSync(kbDir)) {
        logger.warn("Knowledge base directory not found", { path: kbDir });
        return [];
    }

    const files = fs.readdirSync(kbDir).filter((f) => f.endsWith(".md"));
    const chunks: KBChunk[] = [];

    for (const file of files) {
        const filePath = path.join(kbDir, file);
        const raw = fs.readFileSync(filePath, "utf-8");

        // Parse frontmatter-style metadata
        const metadata = parseFrontmatter(raw);
        const content = raw.replace(/^---[\s\S]*?---\n?/, "").trim();

        // Split into semantic chunks (~500 tokens each)
        const sections = splitIntoChunks(content, 500);

        for (let i = 0; i < sections.length; i++) {
            const chunk: KBChunk = {
                id: `${file}#chunk-${i}`,
                title: metadata.title || file.replace(".md", "").replace(/-/g, " "),
                content: sections[i],
                source: metadata.source || "",
                authorityLevel: (metadata.authority as KBChunk["authorityLevel"]) || "tertiary",
                tokens: tokenize(sections[i]),
            };
            chunks.push(chunk);
        }
    }

    logger.info("Knowledge base loaded", { chunks: chunks.length, files: files.length });
    kbCache = chunks;
    return chunks;
}

/**
 * Retrieve the top-k most relevant chunks for a query.
 * Uses TF-IDF-style keyword matching with authority-level boosting.
 */
export function retrieve(query: string, topK: number = 5): RetrievalResult[] {
    const chunks = loadKnowledgeBase();
    if (chunks.length === 0) return [];

    const queryTokens = tokenize(query);

    const scored = chunks.map((chunk) => {
        let score = 0;

        // Term frequency scoring
        for (const qt of queryTokens) {
            const tf = chunk.tokens.filter((t) => t === qt).length;
            if (tf > 0) {
                // IDF approximation: rarer terms score higher
                const docsWithTerm = chunks.filter((c) => c.tokens.includes(qt)).length;
                const idf = Math.log(chunks.length / (docsWithTerm + 1));
                score += tf * idf;
            }
        }

        // Authority level boosting
        const authorityBoost: Record<string, number> = {
            primary: 1.5,
            secondary: 1.2,
            tertiary: 1.0,
        };
        score *= authorityBoost[chunk.authorityLevel] || 1.0;

        return { chunk, score };
    });

    // Sort by score descending, take top-k
    const results = scored
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
        .map((s, idx) => ({
            chunk: s.chunk,
            score: s.score,
            sourceIndex: idx + 1,
        }));

    logger.debug("Retrieval results", {
        query,
        resultCount: results.length,
        topScore: results[0]?.score || 0,
    });

    return results;
}

/**
 * Format retrieved chunks into a context string for the LLM prompt.
 */
export function formatContext(results: RetrievalResult[]): string {
    if (results.length === 0) {
        return "No relevant sources found in the knowledge base.";
    }

    return results
        .map(
            (r) =>
                `[Source ${r.sourceIndex}] (${r.chunk.title})\n` +
                `Authority: ${r.chunk.authorityLevel}\n` +
                `${r.chunk.content}\n` +
                (r.chunk.source ? `URL: ${r.chunk.source}` : "")
        )
        .join("\n\n---\n\n");
}

/**
 * Format citation footer for the response.
 */
export function formatCitations(results: RetrievalResult[]): string {
    if (results.length === 0) return "";

    const citations = results
        .map(
            (r) =>
                `[Source ${r.sourceIndex}] ${r.chunk.title}` +
                (r.chunk.source ? ` — ${r.chunk.source}` : "")
        )
        .join("\n");

    return `\n\n---\n**Sources:**\n${citations}`;
}

// --- Helpers ---

function parseFrontmatter(raw: string): Record<string, string> {
    const match = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return {};

    const metadata: Record<string, string> = {};
    for (const line of match[1].split("\n")) {
        const [key, ...valueParts] = line.split(":");
        if (key && valueParts.length > 0) {
            metadata[key.trim()] = valueParts.join(":").trim();
        }
    }
    return metadata;
}

function tokenize(text: string): string[] {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s.-]/g, " ")
        .split(/\s+/)
        .filter((t) => t.length > 2);
}

function splitIntoChunks(text: string, maxTokens: number): string[] {
    const paragraphs = text.split(/\n\n+/);
    const chunks: string[] = [];
    let current = "";

    for (const para of paragraphs) {
        const combined = current ? `${current}\n\n${para}` : para;
        const tokenCount = tokenize(combined).length;

        if (tokenCount > maxTokens && current) {
            chunks.push(current.trim());
            current = para;
        } else {
            current = combined;
        }
    }

    if (current.trim()) {
        chunks.push(current.trim());
    }

    return chunks.length > 0 ? chunks : [text];
}
