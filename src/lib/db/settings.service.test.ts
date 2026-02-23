import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SettingsService } from './settings.service';

// ---------------------------------------------------------------------------
// Mocks (hoisted to top so vi.mock calls resolve correctly)
// ---------------------------------------------------------------------------

const { mockPrisma } = vi.hoisted(() => {
  return {
    mockPrisma: {
      userSettings: {
        findUnique: vi.fn(),
        create: vi.fn(),
        upsert: vi.fn(),
        delete: vi.fn(),
      },
    },
  };
});

vi.mock('./prisma', () => ({
  prisma: mockPrisma,
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SettingsService', () => {
  const service = new SettingsService();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSettings', () => {
    it('should return existing settings', async () => {
      const settings = {
        id: 'settings-1',
        userId: 'user-1',
        defaultModel: 'claude-sonnet-4-6',
        theme: 'system',
        apiKeys: null,
        mcpServers: null,
        agentPreferences: null,
      };
      mockPrisma.userSettings.findUnique.mockResolvedValue(settings);

      const result = await service.getSettings('user-1');
      expect(result).toEqual(settings);
      expect(mockPrisma.userSettings.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
      expect(mockPrisma.userSettings.create).not.toHaveBeenCalled();
    });

    it('should create default settings when not found', async () => {
      mockPrisma.userSettings.findUnique.mockResolvedValue(null);
      const created = {
        id: 'settings-new',
        userId: 'user-2',
        defaultModel: 'claude-sonnet-4-6',
        theme: 'system',
        apiKeys: null,
        mcpServers: null,
        agentPreferences: null,
      };
      mockPrisma.userSettings.create.mockResolvedValue(created);

      const result = await service.getSettings('user-2');
      expect(result).toEqual(created);
      expect(mockPrisma.userSettings.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-2' },
      });
      expect(mockPrisma.userSettings.create).toHaveBeenCalledWith({
        data: { userId: 'user-2' },
      });
    });

    it('should return correct defaults for newly created settings', async () => {
      mockPrisma.userSettings.findUnique.mockResolvedValue(null);
      const created = {
        id: 'settings-3',
        userId: 'user-3',
        defaultModel: 'claude-sonnet-4-6',
        theme: 'system',
        apiKeys: null,
        mcpServers: null,
        agentPreferences: null,
      };
      mockPrisma.userSettings.create.mockResolvedValue(created);

      const result = await service.getSettings('user-3');
      expect(result.defaultModel).toBe('claude-sonnet-4-6');
      expect(result.theme).toBe('system');
      expect(result.apiKeys).toBeNull();
    });
  });

  describe('updateSettings', () => {
    it('should upsert settings correctly', async () => {
      const updated = {
        id: 'settings-1',
        userId: 'user-1',
        defaultModel: 'gpt-4o',
        theme: 'dark',
        apiKeys: null,
        mcpServers: null,
        agentPreferences: null,
      };
      mockPrisma.userSettings.upsert.mockResolvedValue(updated);

      const result = await service.updateSettings('user-1', {
        defaultModel: 'gpt-4o',
        theme: 'dark',
      });

      expect(result).toEqual(updated);
      expect(mockPrisma.userSettings.upsert).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        update: { defaultModel: 'gpt-4o', theme: 'dark' },
        create: { userId: 'user-1', defaultModel: 'gpt-4o', theme: 'dark' },
      });
    });

    it('should handle partial data update', async () => {
      const updated = {
        id: 'settings-1',
        userId: 'user-1',
        defaultModel: 'claude-sonnet-4-6',
        theme: 'dark',
        apiKeys: null,
        mcpServers: null,
        agentPreferences: null,
      };
      mockPrisma.userSettings.upsert.mockResolvedValue(updated);

      const result = await service.updateSettings('user-1', { theme: 'dark' });

      expect(result.theme).toBe('dark');
      expect(mockPrisma.userSettings.upsert).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        update: { theme: 'dark' },
        create: { userId: 'user-1', theme: 'dark' },
      });
    });

    it('should update all fields at once', async () => {
      const allFieldsData = {
        defaultModel: 'gemini-pro',
        theme: 'light',
        apiKeys: { openai: 'sk-123', anthropic: 'sk-ant-456' },
        mcpServers: [{ url: 'http://localhost:3001' }],
        agentPreferences: { maxTokens: 4096 },
      };
      const updated = {
        id: 'settings-1',
        userId: 'user-1',
        ...allFieldsData,
      };
      mockPrisma.userSettings.upsert.mockResolvedValue(updated);

      const result = await service.updateSettings('user-1', allFieldsData);

      expect(result).toEqual(updated);
      expect(mockPrisma.userSettings.upsert).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        update: allFieldsData,
        create: { userId: 'user-1', ...allFieldsData },
      });
    });
  });

  describe('getDefaultModel', () => {
    it('should return model from settings', async () => {
      const settings = {
        id: 'settings-1',
        userId: 'user-1',
        defaultModel: 'gpt-4o',
        theme: 'system',
        apiKeys: null,
        mcpServers: null,
        agentPreferences: null,
      };
      mockPrisma.userSettings.findUnique.mockResolvedValue(settings);

      const model = await service.getDefaultModel('user-1');
      expect(model).toBe('gpt-4o');
    });
  });

  describe('updateApiKeys', () => {
    it('should store api keys via updateSettings', async () => {
      const keys = { openai: 'sk-123', anthropic: 'sk-ant-456' };
      const updated = {
        id: 'settings-1',
        userId: 'user-1',
        defaultModel: 'claude-sonnet-4-6',
        theme: 'system',
        apiKeys: keys,
        mcpServers: null,
        agentPreferences: null,
      };
      mockPrisma.userSettings.upsert.mockResolvedValue(updated);

      const result = await service.updateApiKeys('user-1', keys);

      expect(result.apiKeys).toEqual(keys);
      expect(mockPrisma.userSettings.upsert).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        update: { apiKeys: keys },
        create: { userId: 'user-1', apiKeys: keys },
      });
    });
  });

  describe('deleteSettings', () => {
    it('should remove settings', async () => {
      const deleted = { id: 'settings-1', userId: 'user-1' };
      mockPrisma.userSettings.delete.mockResolvedValue(deleted);

      const result = await service.deleteSettings('user-1');
      expect(result).toEqual(deleted);
      expect(mockPrisma.userSettings.delete).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
    });

    it('should return null if settings not found', async () => {
      mockPrisma.userSettings.delete.mockRejectedValue(new Error('Not found'));

      const result = await service.deleteSettings('non-existent');
      expect(result).toBeNull();
    });
  });
});
