import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useConversations } from './useConversations';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function mockConversation(overrides: Record<string, unknown> = {}) {
  return {
    id: '1',
    title: 'Test Conversation',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('useConversations', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('fetches conversations on mount', async () => {
    const conv = mockConversation();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ conversations: [conv] }),
    });

    const { result } = renderHook(() => useConversations());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.conversations).toHaveLength(1);
    expect(result.current.conversations[0]).toEqual(conv);
    expect(result.current.error).toBeNull();
    expect(mockFetch).toHaveBeenCalledWith('/api/conversations');
  });

  it('handles fetch error when API returns non-ok status', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    const { result } = renderHook(() => useConversations());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to fetch conversations');
    expect(result.current.conversations).toEqual([]);
  });

  it('handles network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useConversations());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.conversations).toEqual([]);
  });

  it('creates a conversation and prepends to list', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ conversations: [] }),
    });

    const { result } = renderHook(() => useConversations());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const newConv = mockConversation({ id: 'new-1', title: 'New Conv' });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ conversation: newConv }),
    });

    let created: unknown;
    await act(async () => {
      created = await result.current.createConversation('New Conv');
    });

    expect(created).toEqual(expect.objectContaining({ id: 'new-1' }));
    expect(result.current.conversations).toHaveLength(1);
    expect(result.current.conversations[0].title).toBe('New Conv');
    expect(mockFetch).toHaveBeenLastCalledWith('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New Conv' }),
    });
  });

  it('handles create conversation error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ conversations: [] }),
    });

    const { result } = renderHook(() => useConversations());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockFetch.mockResolvedValueOnce({ ok: false, status: 400 });

    let created: unknown;
    await act(async () => {
      created = await result.current.createConversation('Fail');
    });

    expect(created).toBeNull();
    expect(result.current.error).toBe('Failed to create conversation');
  });

  it('deletes a conversation and removes from list', async () => {
    const conv = mockConversation({ id: 'del-1' });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ conversations: [conv] }),
    });

    const { result } = renderHook(() => useConversations());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.conversations).toHaveLength(1);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    let deleted: boolean = false;
    await act(async () => {
      deleted = await result.current.deleteConversation('del-1');
    });

    expect(deleted).toBe(true);
    expect(result.current.conversations).toHaveLength(0);
    expect(mockFetch).toHaveBeenLastCalledWith('/api/conversations/del-1', {
      method: 'DELETE',
    });
  });

  it('handles delete conversation error', async () => {
    const conv = mockConversation({ id: 'del-fail' });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ conversations: [conv] }),
    });

    const { result } = renderHook(() => useConversations());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });

    let deleted: boolean = true;
    await act(async () => {
      deleted = await result.current.deleteConversation('del-fail');
    });

    expect(deleted).toBe(false);
    expect(result.current.error).toBe('Failed to delete conversation');
    expect(result.current.conversations).toHaveLength(1);
  });

  it('refresh reloads data from API', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ conversations: [mockConversation()] }),
    });

    const { result } = renderHook(() => useConversations());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.conversations).toHaveLength(1);

    const updatedConv = mockConversation({ id: '2', title: 'Refreshed' });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ conversations: [updatedConv] }),
    });

    await act(async () => {
      result.current.refresh();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.conversations).toHaveLength(1);
    expect(result.current.conversations[0].title).toBe('Refreshed');
  });
});
