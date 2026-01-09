import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import Exa from "exa-js"

// Lazy initialization to avoid build-time errors when env vars are not available
let _exa: Exa | null = null;

export const getExa = (): Exa => {
  if (!_exa) {
    const apiKey = process.env.EXA_SEARCH_API_KEY;
    if (!apiKey) {
      throw new Error("EXA_SEARCH_API_KEY environment variable is required");
    }
    _exa = new Exa(apiKey);
  }
  return _exa;
};

// For backward compatibility - use getExa() instead
export const exa = {
  search: async (...args: Parameters<Exa['search']>) => getExa().search(...args),
  searchAndContents: async (...args: Parameters<Exa['searchAndContents']>) => getExa().searchAndContents(...args),
  getContents: async (...args: Parameters<Exa['getContents']>) => getExa().getContents(...args),
  findSimilar: async (...args: Parameters<Exa['findSimilar']>) => getExa().findSimilar(...args),
  findSimilarAndContents: async (...args: Parameters<Exa['findSimilarAndContents']>) => getExa().findSimilarAndContents(...args),
};

export const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY || "",
  });
