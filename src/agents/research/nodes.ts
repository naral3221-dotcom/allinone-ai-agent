import { generateText } from 'ai';
import { models } from '@/lib/ai/providers';
import type { ResearchStateType } from './state';
import { executeSearch, TavilySearchProvider, type SearchProvider } from './tools';

let searchProvider: SearchProvider = new TavilySearchProvider();

export function setSearchProvider(provider: SearchProvider) {
  searchProvider = provider;
}

export async function analyzeQuery(
  state: ResearchStateType
): Promise<Partial<ResearchStateType>> {
  const { text } = await generateText({
    model: models['claude-haiku'],
    system: `Generate 1-3 search queries for the user's research question. Return one query per line, nothing else.`,
    prompt: state.query,
    maxOutputTokens: 200,
  });

  const queries = text
    .split('\n')
    .map((q) => q.trim())
    .filter((q) => q.length > 0)
    .slice(0, 3);

  return {
    searchQueries: queries.length > 0 ? queries : [state.query],
  };
}

export async function searchWeb(
  state: ResearchStateType
): Promise<Partial<ResearchStateType>> {
  const allResults = [];
  const allToolCalls = [];

  for (const query of state.searchQueries) {
    const { results, toolCall } = await executeSearch(searchProvider, query);
    allResults.push(...results);
    allToolCalls.push(toolCall);
  }

  return {
    searchResults: allResults,
    toolCalls: allToolCalls,
  };
}

export async function synthesize(
  state: ResearchStateType
): Promise<Partial<ResearchStateType>> {
  const context = state.searchResults
    .map((r, i) => `[${i + 1}] ${r.title}\n${r.content}\nSource: ${r.url}`)
    .join('\n\n');

  const { text } = await generateText({
    model: models['claude-sonnet'],
    system: `You are a research assistant. Synthesize the search results into a comprehensive answer. Cite sources with [number] references.`,
    prompt: `Question: ${state.query}\n\nSearch Results:\n${context}`,
    maxOutputTokens: 4096,
  });

  return {
    summary: text,
    messages: [{ role: 'assistant', content: text }],
    isComplete: true,
  };
}
