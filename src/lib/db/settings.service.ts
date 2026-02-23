import { prisma } from './prisma';

interface UpdateSettingsInput {
  defaultModel?: string;
  theme?: string;
  apiKeys?: Record<string, string>;
  mcpServers?: unknown;
  agentPreferences?: unknown;
}

export type { UpdateSettingsInput };

export class SettingsService {
  async getSettings(userId: string) {
    let settings = await prisma.userSettings.findUnique({ where: { userId } });
    if (!settings) {
      settings = await prisma.userSettings.create({ data: { userId } });
    }
    return settings;
  }

  async updateSettings(userId: string, data: UpdateSettingsInput) {
    return prisma.userSettings.upsert({
      where: { userId },
      update: { ...data },
      create: { userId, ...data },
    });
  }

  async getDefaultModel(userId: string): Promise<string> {
    const settings = await this.getSettings(userId);
    return settings.defaultModel;
  }

  async updateApiKeys(userId: string, keys: Record<string, string>) {
    return this.updateSettings(userId, { apiKeys: keys });
  }

  async deleteSettings(userId: string) {
    return prisma.userSettings.delete({ where: { userId } }).catch(() => null);
  }
}
