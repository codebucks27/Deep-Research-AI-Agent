import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import { ResearchState } from "./types";
import { deepResearch } from "./main";

/* eslint-disable @typescript-eslint/no-explicit-any */
// AI SDK v5: DataStream writer wrapper that provides v4-compatible interface
function createDataStreamWriter(writer: any) {
  return {
    writeData: (data: unknown) => {
      writer.write({ type: "data", value: [data] });
    }
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("[deep-research] Received body:", JSON.stringify(body).substring(0, 200));

    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error("[deep-research] Invalid messages format");
      return new Response(
        JSON.stringify({ success: false, error: "Invalid messages format" }),
        { status: 400 }
      );
    }

    const lastMessageContent = messages[messages.length - 1].content;
    console.log("[deep-research] Last message content:", lastMessageContent?.substring?.(0, 100));

    const parsed = JSON.parse(lastMessageContent);

    const topic = parsed.topic;
    const clarifications = parsed.clarifications || parsed.clerifications; // handle both spellings

    console.log("[deep-research] Starting research for topic:", topic);

    // AI SDK v5: createDataStreamResponse -> createUIMessageStream + createUIMessageStreamResponse
    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        console.log("[deep-research] Execute started");
        // Create a wrapper to maintain v4-compatible interface for existing code
        const dataStream = createDataStreamWriter(writer);

        const researchState: ResearchState = {
            topic: topic,
            completedSteps: 0,
            tokenUsed: 0,
            findings: [],
            processedUrl: new Set(),
            clerificationsText: JSON.stringify(clarifications)
        }

        try {
          await deepResearch(researchState, dataStream);
          console.log("[deep-research] Execute completed successfully");
        } catch (err) {
          console.error("[deep-research] Execute error:", err);
          throw err;
        }
      },
    });

    return createUIMessageStreamResponse({ stream });
  } catch (error) {
    console.error("[deep-research] Route error:", error);

    return new Response(
        JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message: "Invalid message format!"
        }),
        { status: 200 }
      );

  }
}
