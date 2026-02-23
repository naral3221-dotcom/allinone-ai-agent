import { generateText } from 'ai';
import { models } from '@/lib/ai/providers';
import type { ContentStateType, ContentType } from './state';

const CLASSIFY_PROMPT = `Analyze the user's request and determine the content type needed.
The content types are:
- document: General professional documents, articles, or written content
- email: Email messages, formal or informal correspondence
- report: Business reports, analysis reports, or structured data presentations
- summary: Summarizations of longer texts, meetings, or topics
- blog: Creative blog posts, opinion pieces, or informal articles
Respond with ONLY one of: document, email, report, summary, blog`;

const SYSTEM_PROMPTS: Record<ContentType, string> = {
  document: `You are a professional document writer. Create well-structured, clear, and polished documents. Use appropriate headings, formatting, and professional language.`,
  email: `You are an email composition assistant. Write clear, concise, and appropriately toned emails. Include proper greetings, body, and sign-offs.`,
  report: `You are a business report writer. Create structured reports with executive summaries, key findings, data analysis, and actionable recommendations.`,
  summary: `You are a summarization expert. Distill complex information into clear, concise summaries. Highlight key points and maintain accuracy.`,
  blog: `You are a creative blog writer. Write engaging, informative blog posts with compelling introductions, well-organized sections, and strong conclusions.`,
};

export async function classifyContent(
  state: ContentStateType
): Promise<Partial<ContentStateType>> {
  const { text } = await generateText({
    model: models['claude-haiku'],
    system: CLASSIFY_PROMPT,
    prompt: state.query,
    maxTokens: 20,
  });

  const contentType = text.trim().toLowerCase() as ContentType;
  const validTypes: ContentType[] = ['document', 'email', 'report', 'summary', 'blog'];

  return {
    contentType: validTypes.includes(contentType) ? contentType : 'document',
  };
}

export async function generateContent(
  state: ContentStateType
): Promise<Partial<ContentStateType>> {
  const system = SYSTEM_PROMPTS[state.contentType];

  const { text } = await generateText({
    model: models['claude-sonnet'],
    system,
    messages: state.messages.map((m) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    })),
    maxTokens: 4096,
  });

  return {
    contentOutput: text,
    isComplete: true,
    messages: [{ role: 'assistant', content: text }],
  };
}
