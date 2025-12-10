import { createFoundry } from '@northslopetech/foundry-ai-sdk';

export const foundry = createFoundry({
  foundryToken: process.env.FOUNDRY_TOKEN,
  baseURL: process.env.FOUNDRY_BASE_URL,
});
