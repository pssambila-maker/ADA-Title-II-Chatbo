/**
 * Escalation detection module.
 * Identifies when a user is asking for legal advice, mentioning litigation,
 * or requesting anything beyond informational guidance.
 */

const LEGAL_ADVICE_PATTERNS = [
    /\b(legal\s+advice)\b/i,
    /\b(attorney|lawyer|counsel)\b/i,
    /\b(should\s+i\s+sue)\b/i,
    /\b(file\s+a\s+(lawsuit|complaint|claim))\b/i,
    /\b(litigation|litigate)\b/i,
    /\b(settlement|verdict|damages)\b/i,
    /\b(we('re|\s+are)\s+(being\s+)?sued)\b/i,
    /\b(legal\s+liability)\b/i,
    /\b(court\s+order|injunction)\b/i,
    /\b(am\s+i\s+(liable|responsible))\b/i,
    /\b(can\s+(i|we)\s+be\s+sued)\b/i,
    /\bDOJ\s+(investigation|enforcement|complaint)\b/i,
];

const COMPLAINT_PATTERNS = [
    /\b(file\s+a\s+complaint)\b/i,
    /\b(report\s+(a\s+)?violation)\b/i,
    /\b(discrimination\s+complaint)\b/i,
    /\b(ADA\s+complaint)\b/i,
    /\b(civil\s+rights\s+complaint)\b/i,
];

export interface EscalationResult {
    shouldEscalate: boolean;
    reason: string | null;
    category: "legal_advice" | "complaint" | "none";
}

export function detectEscalation(userMessage: string): EscalationResult {
    // Check legal advice patterns
    for (const pattern of LEGAL_ADVICE_PATTERNS) {
        if (pattern.test(userMessage)) {
            return {
                shouldEscalate: true,
                reason: `Legal advice request detected: "${userMessage.match(pattern)?.[0]}"`,
                category: "legal_advice",
            };
        }
    }

    // Check complaint patterns
    for (const pattern of COMPLAINT_PATTERNS) {
        if (pattern.test(userMessage)) {
            return {
                shouldEscalate: true,
                reason: `Complaint filing request detected: "${userMessage.match(pattern)?.[0]}"`,
                category: "complaint",
            };
        }
    }

    return {
        shouldEscalate: false,
        reason: null,
        category: "none",
    };
}

export function getEscalationResponse(result: EscalationResult): string {
    if (result.category === "legal_advice") {
        return (
            "⚠️ **I'm unable to provide legal advice.**\n\n" +
            "I can share factual information about ADA Title II requirements and WCAG 2.1 guidelines, " +
            "but I cannot advise on specific legal situations, liability, or potential litigation.\n\n" +
            "**I recommend:**\n" +
            "- Consulting with your organization's legal counsel\n" +
            "- Contacting a disability rights attorney\n" +
            "- Reaching out to your ADA Coordinator\n\n" +
            "Would you like factual information about a specific accessibility requirement instead?"
        );
    }

    if (result.category === "complaint") {
        return (
            "📋 **Filing accessibility complaints is outside the scope of this tool.**\n\n" +
            "If you need to file an ADA complaint, here are the appropriate channels:\n\n" +
            "- **ADA.gov**: https://www.ada.gov/file-a-complaint/\n" +
            "- **DOJ Civil Rights Division**: For Title II complaints against state/local governments\n" +
            "- **Your organization's ADA Coordinator**: For internal accessibility concerns\n\n" +
            "Would you like information about a specific WCAG 2.1 requirement instead?"
        );
    }

    return "";
}
