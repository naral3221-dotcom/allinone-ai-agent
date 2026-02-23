import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MCPClient, MCPToolRegistry } from './client';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('MCPClient', () => {
  const client = new MCPClient({
    name: 'test-server',
    url: 'http://localhost:3001',
    apiKey: 'test-key',
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listTools', () => {
    it('should list tools from server', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            tools: [
              { name: 'web_search', description: 'Search the web', inputSchema: {} },
            ],
          }),
      });

      const tools = await client.listTools();
      expect(tools).toHaveLength(1);
      expect(tools[0].name).toBe('web_search');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/tools/list',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-key',
          }),
        })
      );
    });

    it('should throw on server error', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500 });
      await expect(client.listTools()).rejects.toThrow('MCP listTools failed: 500');
    });
  });

  describe('callTool', () => {
    it('should call tool with arguments', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [{ type: 'text', text: 'Search results...' }],
          }),
      });

      const result = await client.callTool('web_search', { query: 'test' });
      expect(result.content[0].text).toBe('Search results...');
    });
  });
});

describe('MCPToolRegistry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should discover tools from multiple servers', async () => {
    const registry = new MCPToolRegistry();
    registry.addServer({ name: 'server1', url: 'http://localhost:3001' });

    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          tools: [
            { name: 'tool_a', description: 'Tool A', inputSchema: {} },
            { name: 'tool_b', description: 'Tool B', inputSchema: {} },
          ],
        }),
    });

    const tools = await registry.discoverTools();
    expect(tools).toHaveLength(2);
    expect(registry.getAvailableTools()).toHaveLength(2);
  });

  it('should call discovered tool', async () => {
    const registry = new MCPToolRegistry();
    registry.addServer({ name: 'server1', url: 'http://localhost:3001' });

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            tools: [{ name: 'tool_a', description: 'Tool A', inputSchema: {} }],
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            content: [{ type: 'text', text: 'result' }],
          }),
      });

    await registry.discoverTools();
    const result = await registry.callTool('tool_a', { input: 'test' });
    expect(result.content[0].text).toBe('result');
  });

  it('should throw for unknown tool', async () => {
    const registry = new MCPToolRegistry();
    await expect(registry.callTool('nonexistent', {})).rejects.toThrow(
      'Unknown MCP tool: nonexistent'
    );
  });
});
