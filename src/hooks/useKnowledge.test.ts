import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useKnowledge } from './useKnowledge';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function mockKB(overrides: Record<string, unknown> = {}) {
  return {
    id: 'kb-1',
    name: 'My Knowledge Base',
    description: 'Test KB',
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('useKnowledge', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('fetches knowledge bases on mount', async () => {
    const kb = mockKB();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ knowledgeBases: [kb] }),
    });

    const { result } = renderHook(() => useKnowledge());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.knowledgeBases).toHaveLength(1);
    expect(result.current.knowledgeBases[0]).toEqual(kb);
    expect(result.current.error).toBeNull();
    expect(mockFetch).toHaveBeenCalledWith('/api/knowledge');
  });

  it('handles fetch error when API returns non-ok status', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    const { result } = renderHook(() => useKnowledge());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to fetch knowledge bases');
    expect(result.current.knowledgeBases).toEqual([]);
  });

  it('handles network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useKnowledge());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.knowledgeBases).toEqual([]);
  });

  it('creates a knowledge base and prepends to list', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ knowledgeBases: [] }),
    });

    const { result } = renderHook(() => useKnowledge());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const newKB = mockKB({ id: 'kb-new', name: 'New KB' });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ knowledgeBase: newKB }),
    });

    let created: unknown;
    await act(async () => {
      created = await result.current.createKB('New KB', 'A new knowledge base');
    });

    expect(created).toEqual(expect.objectContaining({ id: 'kb-new' }));
    expect(result.current.knowledgeBases).toHaveLength(1);
    expect(mockFetch).toHaveBeenLastCalledWith('/api/knowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'New KB', description: 'A new knowledge base' }),
    });
  });

  it('handles create knowledge base error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ knowledgeBases: [] }),
    });

    const { result } = renderHook(() => useKnowledge());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockFetch.mockResolvedValueOnce({ ok: false, status: 400 });

    let created: unknown;
    await act(async () => {
      created = await result.current.createKB('');
    });

    expect(created).toBeNull();
    expect(result.current.error).toBe('Failed to create knowledge base');
  });

  it('deletes a knowledge base and removes from list', async () => {
    const kb = mockKB({ id: 'kb-del' });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ knowledgeBases: [kb] }),
    });

    const { result } = renderHook(() => useKnowledge());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    let deleted: boolean = false;
    await act(async () => {
      deleted = await result.current.deleteKB('kb-del');
    });

    expect(deleted).toBe(true);
    expect(result.current.knowledgeBases).toHaveLength(0);
  });

  it('handles delete knowledge base error', async () => {
    const kb = mockKB({ id: 'kb-del-fail' });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ knowledgeBases: [kb] }),
    });

    const { result } = renderHook(() => useKnowledge());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });

    let deleted: boolean = true;
    await act(async () => {
      deleted = await result.current.deleteKB('kb-del-fail');
    });

    expect(deleted).toBe(false);
    expect(result.current.error).toBe('Failed to delete knowledge base');
    expect(result.current.knowledgeBases).toHaveLength(1);
  });

  it('adds an entry to a knowledge base', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ knowledgeBases: [] }),
    });

    const { result } = renderHook(() => useKnowledge());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ entry: { id: 'entry-1' } }),
    });

    let success: boolean = false;
    await act(async () => {
      success = await result.current.addEntry('kb-1', {
        title: 'Test Entry',
        content: 'Some content',
        sourceType: 'text',
      });
    });

    expect(success).toBe(true);
    expect(mockFetch).toHaveBeenLastCalledWith('/api/knowledge/kb-1/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test Entry',
        content: 'Some content',
        sourceType: 'text',
      }),
    });
  });

  it('handles add entry error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ knowledgeBases: [] }),
    });

    const { result } = renderHook(() => useKnowledge());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockFetch.mockResolvedValueOnce({ ok: false, status: 400 });

    let success: boolean = true;
    await act(async () => {
      success = await result.current.addEntry('kb-1', {
        title: '',
        content: '',
        sourceType: 'text',
      });
    });

    expect(success).toBe(false);
    expect(result.current.error).toBe('Failed to add entry');
  });

  it('searches a knowledge base', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ knowledgeBases: [] }),
    });

    const { result } = renderHook(() => useKnowledge());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const searchResults = [
      { content: 'result content', similarity: 0.95, title: 'Result 1' },
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: searchResults }),
    });

    let results: unknown[] = [];
    await act(async () => {
      results = await result.current.search('kb-1', 'test query');
    });

    expect(results).toEqual(searchResults);
    expect(mockFetch).toHaveBeenLastCalledWith('/api/knowledge/kb-1/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'test query' }),
    });
  });

  it('handles search error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ knowledgeBases: [] }),
    });

    const { result } = renderHook(() => useKnowledge());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    let results: unknown[] = [{ dummy: true }];
    await act(async () => {
      results = await result.current.search('kb-1', 'fail query');
    });

    expect(results).toEqual([]);
    expect(result.current.error).toBe('Failed to search knowledge base');
  });

  it('refresh reloads data from API', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ knowledgeBases: [mockKB()] }),
    });

    const { result } = renderHook(() => useKnowledge());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const updatedKB = mockKB({ id: 'kb-2', name: 'Refreshed KB' });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ knowledgeBases: [updatedKB] }),
    });

    await act(async () => {
      result.current.refresh();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.knowledgeBases).toHaveLength(1);
    expect(result.current.knowledgeBases[0].name).toBe('Refreshed KB');
  });
});
