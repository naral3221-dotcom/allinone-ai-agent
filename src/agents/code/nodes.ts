import { generateText } from 'ai';
import { models } from '@/lib/ai/providers';
import type { CodeStateType, CodeAction } from './state';

const ACTION_PROMPT = `Analyze the user's request and determine the coding action needed.
Respond with ONLY one of: generate, review, debug, explain`;

const SYSTEM_PROMPTS: Record<CodeAction, string> = {
  generate: `You are an expert programmer. Generate clean, well-documented code based on the user's request. Include comments explaining key decisions. Always specify the language at the start.`,
  review: `You are a code reviewer. Analyze the code for bugs, security issues, performance problems, and style. Provide specific, actionable feedback with line references.`,
  debug: `You are a debugging expert. Analyze the error or bug description, identify the root cause, and provide a clear fix with explanation.`,
  explain: `You are a code educator. Explain the code or concept clearly with examples. Use simple language and build up complexity gradually.`,
};

export async function classifyAction(
  state: CodeStateType
): Promise<Partial<CodeStateType>> {
  const { text } = await generateText({
    model: models['claude-haiku'],
    system: ACTION_PROMPT,
    prompt: state.query,
    maxTokens: 20,
  });

  const action = text.trim().toLowerCase() as CodeAction;
  const validActions: CodeAction[] = ['generate', 'review', 'debug', 'explain'];

  return {
    action: validActions.includes(action) ? action : 'generate',
  };
}

export async function executeCode(
  state: CodeStateType
): Promise<Partial<CodeStateType>> {
  const system = SYSTEM_PROMPTS[state.action];

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
    codeOutput: text,
    messages: [{ role: 'assistant', content: text }],
    isComplete: true,
  };
}
