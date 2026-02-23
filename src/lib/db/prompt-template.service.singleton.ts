import { PromptTemplateService } from './prompt-template.service';

const globalForService = globalThis as unknown as {
  promptTemplateService: PromptTemplateService | undefined;
};

export const promptTemplateService =
  globalForService.promptTemplateService ?? new PromptTemplateService();

if (process.env.NODE_ENV !== 'production')
  globalForService.promptTemplateService = promptTemplateService;
