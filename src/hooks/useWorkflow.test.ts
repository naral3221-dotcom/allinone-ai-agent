import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useWorkflow } from './useWorkflow';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function mockWorkflow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'wf-1',
    name: 'Test Workflow',
    description: 'A test workflow',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('useWorkflow', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('fetches workflows on mount', async () => {
    const wf = mockWorkflow();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ workflows: [wf] }),
    });

    const { result } = renderHook(() => useWorkflow());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.workflows).toHaveLength(1);
    expect(result.current.workflows[0]).toEqual(wf);
    expect(result.current.error).toBeNull();
    expect(mockFetch).toHaveBeenCalledWith('/api/workflows');
  });

  it('handles fetch error when API returns non-ok status', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    const { result } = renderHook(() => useWorkflow());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to fetch workflows');
    expect(result.current.workflows).toEqual([]);
  });

  it('handles network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useWorkflow());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.workflows).toEqual([]);
  });

  it('creates a workflow and prepends to list', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ workflows: [] }),
    });

    const { result } = renderHook(() => useWorkflow());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const newWf = mockWorkflow({ id: 'wf-new', name: 'New Workflow' });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ workflow: newWf }),
    });

    const steps = [
      { order: 1, agentType: 'research', prompt: 'Search for info' },
    ];

    let created: unknown;
    await act(async () => {
      created = await result.current.createWorkflow({
        name: 'New Workflow',
        description: 'A new workflow',
        steps,
      });
    });

    expect(created).toEqual(expect.objectContaining({ id: 'wf-new' }));
    expect(result.current.workflows).toHaveLength(1);
    expect(mockFetch).toHaveBeenLastCalledWith('/api/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'New Workflow',
        description: 'A new workflow',
        steps,
      }),
    });
  });

  it('handles create workflow error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ workflows: [] }),
    });

    const { result } = renderHook(() => useWorkflow());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockFetch.mockResolvedValueOnce({ ok: false, status: 400 });

    let created: unknown;
    await act(async () => {
      created = await result.current.createWorkflow({
        name: '',
        steps: [],
      });
    });

    expect(created).toBeNull();
    expect(result.current.error).toBe('Failed to create workflow');
  });

  it('deletes a workflow and removes from list', async () => {
    const wf = mockWorkflow({ id: 'wf-del' });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ workflows: [wf] }),
    });

    const { result } = renderHook(() => useWorkflow());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.workflows).toHaveLength(1);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    let deleted: boolean = false;
    await act(async () => {
      deleted = await result.current.deleteWorkflow('wf-del');
    });

    expect(deleted).toBe(true);
    expect(result.current.workflows).toHaveLength(0);
    expect(mockFetch).toHaveBeenLastCalledWith('/api/workflows/wf-del', {
      method: 'DELETE',
    });
  });

  it('handles delete workflow error', async () => {
    const wf = mockWorkflow({ id: 'wf-del-fail' });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ workflows: [wf] }),
    });

    const { result } = renderHook(() => useWorkflow());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });

    let deleted: boolean = true;
    await act(async () => {
      deleted = await result.current.deleteWorkflow('wf-del-fail');
    });

    expect(deleted).toBe(false);
    expect(result.current.error).toBe('Failed to delete workflow');
    expect(result.current.workflows).toHaveLength(1);
  });

  it('executes a workflow and returns the result', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ workflows: [] }),
    });

    const { result } = renderHook(() => useWorkflow());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const execResult = {
      status: 'completed',
      results: [{ step: 1, output: 'Research done' }],
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ result: execResult }),
    });

    let execReturn: unknown;
    await act(async () => {
      execReturn = await result.current.executeWorkflow('wf-1');
    });

    expect(execReturn).toEqual(execResult);
    expect(mockFetch).toHaveBeenLastCalledWith('/api/workflows/wf-1/execute', {
      method: 'POST',
    });
  });

  it('handles execute workflow error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ workflows: [] }),
    });

    const { result } = renderHook(() => useWorkflow());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    let execReturn: unknown = 'should be null';
    await act(async () => {
      execReturn = await result.current.executeWorkflow('wf-1');
    });

    expect(execReturn).toBeNull();
    expect(result.current.error).toBe('Failed to execute workflow');
  });

  it('handles execute workflow network error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ workflows: [] }),
    });

    const { result } = renderHook(() => useWorkflow());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockFetch.mockRejectedValueOnce(new Error('Connection lost'));

    let execReturn: unknown = 'should be null';
    await act(async () => {
      execReturn = await result.current.executeWorkflow('wf-1');
    });

    expect(execReturn).toBeNull();
    expect(result.current.error).toBe('Connection lost');
  });

  it('refresh reloads data from API', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ workflows: [mockWorkflow()] }),
    });

    const { result } = renderHook(() => useWorkflow());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const updatedWf = mockWorkflow({ id: 'wf-2', name: 'Refreshed' });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ workflows: [updatedWf] }),
    });

    await act(async () => {
      result.current.refresh();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.workflows).toHaveLength(1);
    expect(result.current.workflows[0].name).toBe('Refreshed');
  });
});
