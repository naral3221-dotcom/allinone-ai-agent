import { DocumentService } from './document.service';

const globalForService = globalThis as unknown as {
  documentService: DocumentService | undefined;
};

export const documentService =
  globalForService.documentService ?? new DocumentService();

if (process.env.NODE_ENV !== 'production')
  globalForService.documentService = documentService;
