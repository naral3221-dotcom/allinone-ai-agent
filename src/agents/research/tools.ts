import type { SearchResult } from './state';
import type { ToolCallRecord } from '@/agents/_shared';

export interface SearchProvider {
  search(query: string, maxResults?: number): Promise<SearchResult[]>;
}

export class TavilySearchProvider implements SearchProvider {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey ?? process.env.TAVILY_API_KEY ?? '';
  }

  async search(query: string, maxResults = 5): Promise<SearchResult[]> {
    if (!this.apiKey) {
      throw new Error('TAVILY_API_KEY is not configured');
    }

    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: this.apiKey,
        query,
        max_results: maxResults,
        include_answer: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Tavily search failed: ${response.status}`);
    }

    const data = await response.json();
    return (data.results ?? []).map((r: { title: string; url: string; content: string }) => ({
      title: r.title,
      url: r.url,
      content: r.content,
    }));
  }
}

export async function executeSearch(
  provider: SearchProvider,
  query: string
): Promise<{ results: SearchResult[]; toolCall: ToolCallRecord }> {
  const start = Date.now();
  try {
    const results = await provider.search(query);
    return {
      results,
      toolCall: {
        id: `tc-search-${Date.now()}`,
        toolName: 'web_search',
        input: { query },
        output: { resultCount: results.length },
        duration: Date.now() - start,
        status: 'success',
      },
    };
  } catch (err) {
    return {
      results: [],
      toolCall: {
        id: `tc-search-${Date.now()}`,
        toolName: 'web_search',
        input: { query },
        output: null,
        duration: Date.now() - start,
        status: 'error',
        error: err instanceof Error ? err.message : 'Search failed',
      },
    };
  }
}
