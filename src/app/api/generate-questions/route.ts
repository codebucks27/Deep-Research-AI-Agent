/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { generateText, tool } from "ai";
import { foundry } from "@/lib/foundry-provider";
import { z } from "zod";

// Type assertion needed due to AI SDK LanguageModelV1 vs V2 mismatch
const getModel = (modelId: string) => foundry(modelId) as any;

const questionsSchema = z.object({
  questions: z.array(z.string()),
});

const questionsJsonSchema = {
  type: "object" as const,
  properties: {
    questions: {
      type: "array" as const,
      items: { type: "string" as const },
    },
  },
  required: ["questions"],
};

const clarifyResearchGoals = async (topic: string) => {
  const prompt = `Given the research topic "${topic}", generate 2-4 clarifying questions to help narrow down the research scope. Focus on identifying:
- Specific aspects of interest
- Required depth/complexity level
- Any particular perspective or excluded sources

IMPORTANT: You must respond ONLY by calling the 'submit_result' tool with your answer.`;

  try {
    const result = await generateText({
      model: getModel("GPT_5"),
      prompt,
      tools: {
        submit_result: tool({
          description: "Submit the generated clarifying questions",
          inputSchema: questionsSchema,  // AI SDK v5: parameters -> inputSchema
          providerOptions: {
            foundry: { parameters: questionsJsonSchema },
          },
          // Execute is required for the SDK to properly detect and send tools
          execute: async (args) => args,
        }),
      },
      maxOutputTokens: 4000,  // AI SDK v5: maxTokens -> maxOutputTokens
    });

    // AI SDK v5 uses .input
    const toolCall = result.toolCalls?.[0];
    if (toolCall) {
      const input = toolCall.input as { questions?: string[] };
      return input?.questions || [];
    }

    return [];
  } catch (error) {
    console.log("Error while generating questions: ", error);
    return [];
  }
};

export async function POST(req: Request) {
  const { topic } = await req.json();
  console.log("Topic: ", topic);

  try {
    const questions = await clarifyResearchGoals(topic);
    console.log("Questions: ", questions);

    return NextResponse.json(questions);
  } catch (error) {
    console.error("Error while generating questions: ", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate questions" },
      { status: 500 }
    );
  }
}
