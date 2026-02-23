import { generateText } from 'ai';
import { models } from './providers';

export type AssistAction = 'improve' | 'expand' | 'summarize' | 'translate' | 'fix-grammar' | 'change-tone';

const PROMPTS: Record<AssistAction, string> = {
  'improve':
    'You are a writing assistant. Improve the following text to be clearer, more concise, and more engaging while preserving the original meaning.',
  'expand':
    'You are a content expansion assistant. Expand and elaborate on the following text with additional details, examples, and explanations.',
  'summarize':
    'You are a summarization expert. Summarize the following text concisely while keeping all key points.',
  'translate':
    'You are a professional translator.',
  'fix-grammar':
    'You are a grammar expert. Fix grammar, spelling, and punctuation errors in the following text while preserving the original meaning and tone.',
  'change-tone':
    'You are a tone adjustment specialist.',
};

export class AIAssistService {
  async assist(input: {
    text: string;
    action: AssistAction;
    options?: { language?: string; tone?: string };
  }): Promise<{ result: string }> {
    let system = PROMPTS[input.action];

    if (input.action === 'translate' && input.options?.language) {
      system += ` Translate to ${input.options.language}.`;
    }
    if (input.action === 'change-tone' && input.options?.tone) {
      system += ` Change the tone to ${input.options.tone}.`;
    }

    const { text } = await generateText({
      model: models['claude-sonnet'],
      system,
      prompt: input.text,
      maxTokens: 4096,
    });

    return { result: text };
  }
}
