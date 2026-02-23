import type { MCPTool, MCPToolResult, MCPServerConfig } from './types';

export class MCPClient {
  private config: MCPServerConfig;

  constructor(config: MCPServerConfig) {
    this.config = config;
  }

  async listTools(): Promise<MCPTool[]> {
    const response = await fetch(`${this.config.url}/tools/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey ? { Authorization: `Bearer ${this.config.apiKey}` } : {}),
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error(`MCP listTools failed: ${response.status}`);
    }

    const data = await response.json();
    return data.tools ?? [];
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<MCPToolResult> {
    const response = await fetch(`${this.config.url}/tools/call`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey ? { Authorization: `Bearer ${this.config.apiKey}` } : {}),
      },
      body: JSON.stringify({ name, arguments: args }),
    });

    if (!response.ok) {
      throw new Error(`MCP callTool failed: ${response.status}`);
    }

    return response.json();
  }
}

export class MCPToolRegistry {
  private clients: Map<string, MCPClient> = new Map();
  private toolMap: Map<string, { client: MCPClient; tool: MCPTool }> = new Map();

  addServer(config: MCPServerConfig): void {
    this.clients.set(config.name, new MCPClient(config));
  }

  async discoverTools(): Promise<MCPTool[]> {
    const allTools: MCPTool[] = [];

    for (const [, client] of this.clients) {
      try {
        const tools = await client.listTools();
        for (const tool of tools) {
          this.toolMap.set(tool.name, { client, tool });
          allTools.push(tool);
        }
      } catch {
        // Skip unavailable servers
      }
    }

    return allTools;
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<MCPToolResult> {
    const entry = this.toolMap.get(name);
    if (!entry) {
      throw new Error(`Unknown MCP tool: ${name}`);
    }
    return entry.client.callTool(name, args);
  }

  getAvailableTools(): MCPTool[] {
    return Array.from(this.toolMap.values()).map((e) => e.tool);
  }
}
