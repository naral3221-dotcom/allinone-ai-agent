import { PoemoraClient } from './client';

const globalForPoemora = globalThis as unknown as {
  poemoraClient: PoemoraClient | undefined;
};

export const poemoraClient =
  globalForPoemora.poemoraClient ??
  new PoemoraClient({
    baseUrl: process.env.POEMORA_API_URL ?? 'http://localhost:4000',
    apiKey: process.env.POEMORA_API_KEY ?? '',
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPoemora.poemoraClient = poemoraClient;
}
