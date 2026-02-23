import { SettingsService } from './settings.service';

const globalForSettings = globalThis as unknown as {
  settingsService: SettingsService | undefined;
};

export const settingsService =
  globalForSettings.settingsService ?? new SettingsService();

if (process.env.NODE_ENV !== 'production')
  globalForSettings.settingsService = settingsService;
