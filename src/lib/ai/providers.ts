import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';

export const models = {
  // Anthropic Claude
  'claude-opus': anthropic('claude-opus-4-6'),
  'claude-sonnet': anthropic('claude-sonnet-4-6'),
  'claude-haiku': anthropic('claude-haiku-4-5-20251001'),

  // OpenAI
  'gpt-4o': openai('gpt-4o'),
  'gpt-4o-mini': openai('gpt-4o-mini'),

  // Google
  'gemini-2.0-flash': google('gemini-2.0-flash'),
  'gemini-2.5-pro': google('gemini-2.5-pro-preview-06-05'),
} as const;

export type ModelId = keyof typeof models;

export function getModel(modelId: ModelId) {
  return models[modelId];
}
