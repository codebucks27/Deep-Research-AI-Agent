export async function register() {
  if (
    process.env.NEXT_RUNTIME === "nodejs" &&
    process.env.AGENTPOND_ENABLED === "true"
  ) {
    const { registerAgentPond } = await import("./src/lib/agentpond");
    registerAgentPond();
  }
}
