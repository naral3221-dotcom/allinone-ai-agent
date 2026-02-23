import { ConversationService } from './conversation.service';

const globalForService = globalThis as unknown as {
  conversationService: ConversationService | undefined;
};

export const conversationService =
  globalForService.conversationService ?? new ConversationService();

if (process.env.NODE_ENV !== 'production')
  globalForService.conversationService = conversationService;
