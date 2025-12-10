/* eslint-disable @typescript-eslint/no-explicit-any */
import { generateText, tool } from "ai";
import { foundry } from "@/lib/foundry-provider";
import { zodToJsonSchema } from "@/lib/zod-to-json-schema";
import { ActivityTracker, ModelCallOptions, ResearchState } from "./types";
import { MAX_RETRY_ATTEMPTS, RETRY_DELAY_MS } from "./constants";
import { delay } from "./utils";

// Type assertion needed due to AI SDK LanguageModelV1 vs V2 mismatch
const getModel = (modelId: string) => foundry(modelId) as any;

export async function callModel<T>({
  model,
  prompt,
  system,
  schema,
  activityType = "generate",
}: ModelCallOptions<T>,
researchState: ResearchState,
activityTracker: ActivityTracker): Promise<T | string> {

  let attempts = 0;
  let lastError: Error | null = null;

  while (attempts < MAX_RETRY_ATTEMPTS) {
    try {
      if (schema) {
        // Structured output via forced tool call (Foundry doesn't support generateObject)
        const jsonSchema = zodToJsonSchema(schema);

        // Use the exact pattern from sdk-validation that works (AI SDK v5)
        const result = await generateText({
          model: getModel(model),
          prompt,
          system: system + "\n\nIMPORTANT: You must respond ONLY by calling the 'submit_result' tool with your answer.",
          tools: {
            submit_result: tool({
              description: "Submit the final structured result",
              inputSchema: schema as any,  // AI SDK v5: parameters -> inputSchema (cast for generic compatibility)
              providerOptions: {
                foundry: { parameters: jsonSchema },
              },
              // Execute is required for the SDK to properly detect and send tools
              execute: async (args) => args,
            }),
          },
          maxOutputTokens: 8000,  // AI SDK v5: maxTokens -> maxOutputTokens
        });

        // Get result from tool calls - check both .args and .input (AI SDK v5 compatibility)
        const toolCall = result.toolCalls?.[0];
        if (!toolCall) {
          throw new Error("Model failed to call submit_result tool");
        }

        // AI SDK v5 uses .input
        const toolArgs = toolCall.input;

        if (!toolArgs) {
          throw new Error("No arguments in tool call");
        }

        researchState.tokenUsed += result.usage?.totalTokens || 0;
        researchState.completedSteps++;

        return toolArgs as T;
      } else {
        // Text generation - straightforward
        const result = await generateText({
          model: getModel(model),
          prompt,
          system,
          maxOutputTokens: 8000,  // AI SDK v5: maxTokens -> maxOutputTokens
        });

        researchState.tokenUsed += result.usage?.totalTokens || 0;
        researchState.completedSteps++;

        return result.text;
      }
    } catch (error) {
      attempts++;
      lastError = error instanceof Error ? error : new Error("Unknown error");

      if (attempts < MAX_RETRY_ATTEMPTS) {
        activityTracker.add(
          activityType,
          "warning",
          `Model call failed, attempt ${attempts}/${MAX_RETRY_ATTEMPTS}. Retrying...`
        );
      }
      await delay(RETRY_DELAY_MS * attempts);
    }
  }

  throw lastError || new Error(`Failed after ${MAX_RETRY_ATTEMPTS} attempts!`);
}
