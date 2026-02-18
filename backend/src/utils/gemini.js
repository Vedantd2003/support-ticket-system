import { GoogleGenerativeAI } from '@google/generative-ai';

import { CATEGORIES, PRIORITIES, DEFAULT_CATEGORY, DEFAULT_PRIORITY } from '../config/constants.js';

const VALID_CATEGORIES = CATEGORIES;
const VALID_PRIORITIES = PRIORITIES;

const CLASSIFY_PROMPT = `You are a support ticket classifier. Analyze the ticket description below and respond with ONLY a valid JSON object.

Categories:
- billing: payment issues, invoices, refunds, charges
- technical: bugs, errors, crashes, performance, integrations
- account: login, password, profile, permissions, 2FA
- general: feature requests, general questions, feedback

Priority levels:
- critical: system down, data loss, security breach, cannot work at all
- high: major feature broken, many users affected, significant impact
- medium: partial functionality affected, workaround available
- low: minor inconvenience, cosmetic issues, feature requests

Respond ONLY with this JSON (no markdown, no explanation):
{"category": "<one of: billing|technical|account|general>", "priority": "<one of: low|medium|high|critical>"}

Ticket description:
`;

let genAI = null;

const getClient = () => {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!genAI) genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI;
};

export const classifyTicket = async (description) => {
  const client = getClient();
  if (!client) {
    console.warn('⚠️  GEMINI_API_KEY not set — returning defaults');
    return { suggested_category: DEFAULT_CATEGORY, suggested_priority: DEFAULT_PRIORITY, llm_available: false };
  }

  try {
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(CLASSIFY_PROMPT + description);
    const text = result.response.text().trim();

    // Strip markdown code blocks if present
    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    const category = VALID_CATEGORIES.includes(parsed.category) ? parsed.category : DEFAULT_CATEGORY;
    const priority = VALID_PRIORITIES.includes(parsed.priority) ? parsed.priority : DEFAULT_PRIORITY;

    return { suggested_category: category, suggested_priority: priority, llm_available: true };
  } catch (err) {
    console.error('⚠️  Gemini classification failed:', err.message);
    return { suggested_category: DEFAULT_CATEGORY, suggested_priority: DEFAULT_PRIORITY, llm_available: false };
  }
};
