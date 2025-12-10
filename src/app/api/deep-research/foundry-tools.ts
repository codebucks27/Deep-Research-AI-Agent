/**
 * Foundry search tools - currently mocked for testing.
 * TODO: Replace with actual Foundry function calls when RIDs are available.
 */

/**
 * Web search via Firecrawl (TODO: connect to Foundry)
 * Currently returns mock data for testing.
 */
async function webSearch(query: string): Promise<string> {
  // TODO: Replace with actual Foundry function call
  // const res = await callFoundryFunction('ri.function...firecrawl_rid', { query });
  // return JSON.stringify(res).slice(0, 15000);

  console.log(`[MOCK] Web search for: ${query}`);

  return JSON.stringify({
    results: [
      {
        title: `Mock Web Result for "${query}"`,
        url: "https://example.com/mock",
        content: `This is placeholder content for the web search query: "${query}". Replace this mock with actual Firecrawl integration.`,
      },
    ],
  }).slice(0, 15000);
}

/**
 * Ontology search (TODO: connect to Palantir Ontology via Foundry)
 * Currently returns mock data for testing.
 */
async function ontologySearch(query: string): Promise<string> {
  // TODO: Replace with actual Foundry Ontology query
  // const res = await callFoundryFunction('ri.function...ontology_rid', { query });
  // return `[INTERNAL DATA]\n${JSON.stringify(res).slice(0, 15000)}`;

  console.log(`[MOCK] Ontology search for: ${query}`);

  return `[INTERNAL DATA]
Mock ontology results for query: "${query}"
- No real Ontology connection configured yet
- Replace this placeholder with actual Foundry Ontology integration`.slice(0, 15000);
}

/**
 * Execute both search tools and combine results.
 * Returns SearchResult[] format expected by research-functions.ts
 */
export async function executeFoundrySearch(query: string) {
  const [webRes, ontologyRes] = await Promise.all([
    webSearch(query),
    ontologySearch(query),
  ]);

  return [
    { title: "Web Results", url: "Firecrawl", content: webRes },
    { title: "Internal Ontology", url: "Palantir", content: ontologyRes },
  ];
}
