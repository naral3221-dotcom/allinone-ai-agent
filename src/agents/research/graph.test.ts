import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGenerateText } = vi.hoisted(() => ({
  mockGenerateText: vi.fn(),
}));

vi.mock('ai', () => ({
  generateText: mockGenerateText,
}));

vi.mock('@/lib/ai/providers', () => ({
  models: {
    'claude-haiku': { modelId: 'claude-haiku' },
    'claude-sonnet': { modelId: 'claude-sonnet' },
  },
}));

import { analyzeQuery, searchWeb, synthesize, setSearchProvider } from './nodes';
import { executeSearch } from './tools';
import type { ResearchStateType, SearchResult } from './state';
import type { SearchProvider } from './tools';

function makeState(overrides: Partial<ResearchStateType> = {}): ResearchStateType {
  return {
    messages: [{ role: 'user', content: 'test' }],
    query: 'What is quantum computing?',
    searchQueries: [],
    searchResults: [],
    toolCalls: [],
    summary: '',
    isComplete: false,
    ...overrides,
  };
}

const mockSearchProvider: SearchProvider = {
  search: vi.fn().mockResolvedValue([
    { title: 'Quantum Computing 101', url: 'https://example.com/qc', content: 'Quantum computing uses qubits...' },
    { title: 'QC Applications', url: 'https://example.com/qc2', content: 'Applications include cryptography...' },
  ]),
};

describe('Research Agent Nodes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setSearchProvider(mockSearchProvider);
  });

  describe('analyzeQuery', () => {
    it('should generate search queries from user question', async () => {
      mockGenerateText.mockResolvedValue({
        text: 'quantum computing basics\nquantum computing applications',
      });

      const result = await analyzeQuery(makeState());
      expect(result.searchQueries).toHaveLength(2);
      expect(result.searchQueries![0]).toBe('quantum computing basics');
    });

    it('should fallback to original query if LLM returns empty', async () => {
      mockGenerateText.mockResolvedValue({ text: '' });

      const result = await analyzeQuery(makeState());
      expect(result.searchQueries).toEqual(['What is quantum computing?']);
    });

    it('should limit to 3 queries', async () => {
      mockGenerateText.mockResolvedValue({
        text: 'q1\nq2\nq3\nq4\nq5',
      });

      const result = await analyzeQuery(makeState());
      expect(result.searchQueries).toHaveLength(3);
    });
  });

  describe('searchWeb', () => {
    it('should search for each query and collect results', async () => {
      const result = await searchWeb(
        makeState({ searchQueries: ['quantum computing', 'qubit'] })
      );

      expect(result.searchResults!.length).toBe(4); // 2 results per query
      expect(result.toolCalls).toHaveLength(2);
      expect(mockSearchProvider.search).toHaveBeenCalledTimes(2);
    });
  });

  describe('synthesize', () => {
    it('should generate summary from search results', async () => {
      mockGenerateText.mockResolvedValue({
        text: 'Quantum computing is a field that...',
      });

      const result = await synthesize(
        makeState({
          searchResults: [
            { title: 'QC', url: 'https://example.com', content: 'Qubits are...' },
          ],
        })
      );

      expect(result.summary).toBe('Quantum computing is a field that...');
      expect(result.isComplete).toBe(true);
      expect(result.messages).toHaveLength(1);
    });
  });
});

describe('executeSearch', () => {
  it('should return results and success tool call', async () => {
    const provider: SearchProvider = {
      search: vi.fn().mockResolvedValue([
        { title: 'Test', url: 'https://test.com', content: 'Content' },
      ]),
    };

    const { results, toolCall } = await executeSearch(provider, 'test query');
    expect(results).toHaveLength(1);
    expect(toolCall.status).toBe('success');
    expect(toolCall.toolName).toBe('web_search');
  });

  it('should handle search errors gracefully', async () => {
    const provider: SearchProvider = {
      search: vi.fn().mockRejectedValue(new Error('API rate limit')),
    };

    const { results, toolCall } = await executeSearch(provider, 'test');
    expect(results).toHaveLength(0);
    expect(toolCall.status).toBe('error');
    expect(toolCall.error).toBe('API rate limit');
  });
});

describe('Research Graph', () => {
  it('should compile without errors', async () => {
    const { createResearchGraph } = await import('./graph');
    const graph = createResearchGraph();
    expect(graph).toBeDefined();
    expect(graph.invoke).toBeDefined();
  });
});
