import { createUIMessageStream, createUIMessageStreamResponse } from "ai";
import { deepResearch } from "./main";
import type { ResearchState } from "./types";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();


    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) {
      throw new Error("No message found");
    }

    // Extract text content from message (handling both content string and parts array)
    let messageContent = "";
    if (typeof lastMessage.content === "string" && lastMessage.content) {
      messageContent = lastMessage.content;
    } else if (lastMessage.parts && Array.isArray(lastMessage.parts)) {
      const textPart = lastMessage.parts.find((part: any) => part.type === "text");
      if (textPart && typeof textPart.text === "string") {
        messageContent = textPart.text;
      }
    }

    if (!messageContent) {
      console.error("Last message structure:", JSON.stringify(lastMessage, null, 2));
      throw new Error("No message content found in last message");
    }

    let parsed: any;
    try {
      parsed = JSON.parse(messageContent);
    } catch (e) {
      console.error("Error parsing message content:", e);
      console.error("Content that failed to parse:", messageContent);
      throw new Error("Invalid message format! Expected JSON.");
    }

    const topic = parsed.topic;
    const clarifications = parsed.clarifications;

    if (!topic) {
      throw new Error("Topic is required");
    }

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        try {
          const researchState: ResearchState = {
            topic: topic,
            completedSteps: 0,
            tokenUsed: 0,
            findings: [],
            processedUrl: new Set(),
            clarificationsText: JSON.stringify(clarifications),
          };

          // Create a custom data stream writer that mimics the old dataStream behavior
          const dataStream = {
            writeData: (data: { type: string; content: unknown }) => {
              writer.write({
                type: `data-${data.type}` as "data-activity" | "data-report",
                data: data.content,
              });
            },
          };

          await deepResearch(researchState, dataStream);
        } catch (error) {
          console.error("Deep Research Execution Error:", error);
          writer.write({
            type: "data-activity",
            data: {
              type: "generate",
              status: "error",
              message:
                error instanceof Error
                  ? error.message
                  : "An unexpected error occurred during research",
            },
          });
        }
      },
    });

    return createUIMessageStreamResponse({ stream });
  } catch (error) {
    console.error("Deep Research Route Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error ? error.message : "Invalid message format!",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
