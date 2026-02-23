import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useDocuments } from './useDocuments';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function mockDocument(overrides: Record<string, unknown> = {}) {
  return {
    id: 'doc-1',
    title: 'Test Document',
    type: 'note',
    tags: ['test'],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('useDocuments', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('fetches documents on mount', async () => {
    const doc = mockDocument();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ documents: [doc] }),
    });

    const { result } = renderHook(() => useDocuments());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.documents).toHaveLength(1);
    expect(result.current.documents[0]).toEqual(doc);
    expect(result.current.error).toBeNull();
    expect(mockFetch).toHaveBeenCalledWith('/api/documents');
  });

  it('handles fetch error when API returns non-ok status', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    const { result } = renderHook(() => useDocuments());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to fetch documents');
    expect(result.current.documents).toEqual([]);
  });

  it('handles network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useDocuments());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.documents).toEqual([]);
  });

  it('creates a document and prepends to list', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ documents: [] }),
    });

    const { result } = renderHook(() => useDocuments());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const newDoc = mockDocument({ id: 'doc-new', title: 'New Doc' });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ document: newDoc }),
    });

    let created: unknown;
    await act(async () => {
      created = await result.current.createDocument({
        title: 'New Doc',
        type: 'note',
      });
    });

    expect(created).toEqual(expect.objectContaining({ id: 'doc-new' }));
    expect(result.current.documents).toHaveLength(1);
    expect(mockFetch).toHaveBeenLastCalledWith('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New Doc', type: 'note' }),
    });
  });

  it('handles create document error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ documents: [] }),
    });

    const { result } = renderHook(() => useDocuments());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockFetch.mockResolvedValueOnce({ ok: false, status: 400 });

    let created: unknown;
    await act(async () => {
      created = await result.current.createDocument({ title: '' });
    });

    expect(created).toBeNull();
    expect(result.current.error).toBe('Failed to create document');
  });

  it('updates a document and reflects change in list', async () => {
    const doc = mockDocument({ id: 'doc-upd' });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ documents: [doc] }),
    });

    const { result } = renderHook(() => useDocuments());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const updatedDoc = mockDocument({ id: 'doc-upd', title: 'Updated Title' });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ document: updatedDoc }),
    });

    let success: boolean = false;
    await act(async () => {
      success = await result.current.updateDocument('doc-upd', {
        title: 'Updated Title',
      });
    });

    expect(success).toBe(true);
    expect(result.current.documents[0].title).toBe('Updated Title');
    expect(mockFetch).toHaveBeenLastCalledWith('/api/documents/doc-upd', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Updated Title' }),
    });
  });

  it('handles update document error', async () => {
    const doc = mockDocument({ id: 'doc-upd-fail' });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ documents: [doc] }),
    });

    const { result } = renderHook(() => useDocuments());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    let success: boolean = true;
    await act(async () => {
      success = await result.current.updateDocument('doc-upd-fail', {
        title: 'Fail',
      });
    });

    expect(success).toBe(false);
    expect(result.current.error).toBe('Failed to update document');
  });

  it('deletes a document and removes from list', async () => {
    const doc = mockDocument({ id: 'doc-del' });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ documents: [doc] }),
    });

    const { result } = renderHook(() => useDocuments());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.documents).toHaveLength(1);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    let deleted: boolean = false;
    await act(async () => {
      deleted = await result.current.deleteDocument('doc-del');
    });

    expect(deleted).toBe(true);
    expect(result.current.documents).toHaveLength(0);
  });

  it('handles delete document error', async () => {
    const doc = mockDocument({ id: 'doc-del-fail' });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ documents: [doc] }),
    });

    const { result } = renderHook(() => useDocuments());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });

    let deleted: boolean = true;
    await act(async () => {
      deleted = await result.current.deleteDocument('doc-del-fail');
    });

    expect(deleted).toBe(false);
    expect(result.current.error).toBe('Failed to delete document');
    expect(result.current.documents).toHaveLength(1);
  });

  it('calls AI assist and returns result', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ documents: [] }),
    });

    const { result } = renderHook(() => useDocuments());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ result: 'Improved text here' }),
    });

    let aiResult: string | null = null;
    await act(async () => {
      aiResult = await result.current.aiAssist(
        'doc-1',
        'improve',
        'some text',
        { tone: 'formal' }
      );
    });

    expect(aiResult).toBe('Improved text here');
    expect(mockFetch).toHaveBeenLastCalledWith(
      '/api/documents/doc-1/ai-assist',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'improve',
          text: 'some text',
          options: { tone: 'formal' },
        }),
      }
    );
  });

  it('handles AI assist error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ documents: [] }),
    });

    const { result } = renderHook(() => useDocuments());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    let aiResult: string | null = 'should be null';
    await act(async () => {
      aiResult = await result.current.aiAssist('doc-1', 'improve', 'text');
    });

    expect(aiResult).toBeNull();
    expect(result.current.error).toBe('Failed to get AI assistance');
  });

  it('refresh reloads data from API', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ documents: [mockDocument()] }),
    });

    const { result } = renderHook(() => useDocuments());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const updatedDoc = mockDocument({ id: 'doc-2', title: 'Refreshed' });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ documents: [updatedDoc] }),
    });

    await act(async () => {
      result.current.refresh();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.documents).toHaveLength(1);
    expect(result.current.documents[0].title).toBe('Refreshed');
  });
});
