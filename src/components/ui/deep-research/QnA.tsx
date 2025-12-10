/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useDeepResearchStore } from "@/store/deepResearch";
import React, { useEffect, useRef, useState } from "react";
import QuestionForm from "./QuestionForm";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import ResearchActivities from "./ResearchActivities";
import ResearchReport from "./ResearchReport";
import ResearchTimer from "./ResearchTimer";
import CompletedQuestions from "./CompletedQuestions";

const QnA = () => {
  const {
    questions,
    isCompleted,
    topic,
    answers,
    setIsLoading,
    setActivities,
    setSources,
    setReport,
  } = useDeepResearchStore();

  // Track accumulated data from messages
  const [streamData, setStreamData] = useState<unknown[]>([]);
  const hasStartedRef = useRef(false);

  // AI SDK v5: useChat with transport and sendMessage
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/deep-research",
    }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Extract data from messages - AI SDK v5 uses message parts for custom data
  useEffect(() => {
    const allData: unknown[] = [];
    for (const message of messages) {
      if (message.parts) {
        for (const part of message.parts) {
          // Custom data parts in AI SDK v5
          if ((part as any).type === "data" && (part as any).value) {
            allData.push(...(part as any).value);
          }
        }
      }
    }
    setStreamData(allData);
  }, [messages]);

  // Process stream data for activities, sources, and report
  useEffect(() => {
    if (streamData.length === 0) return;

    // extract activities and sources
    const activities = streamData
      .filter(
        (msg) => typeof msg === "object" && (msg as any).type === "activity"
      )
      .map((msg) => (msg as any).content);

    setActivities(activities);

    const sources = activities
      .filter(
        (activity) =>
          activity.type === "extract" && activity.status === "complete"
      )
      .map((activity) => {
        const url = activity.message.split("from ")[1];
        return {
          url,
          title: url?.split("/")[2] || url,
        };
      });
    setSources(sources);
    const reportData = streamData.find(
      (msg) => typeof msg === "object" && (msg as any).type === "report"
    );
    const report =
      typeof (reportData as any)?.content === "string"
        ? (reportData as any).content
        : "";
    setReport(report);

    setIsLoading(isLoading);
  }, [streamData, setActivities, setSources, setReport, setIsLoading, isLoading]);

  // Start research when questions are completed
  useEffect(() => {
    if (isCompleted && questions.length > 0 && !hasStartedRef.current) {
      hasStartedRef.current = true;
      const clarifications = questions.map((question, index) => ({
        question: question,
        answer: answers[index],
      }));

      // AI SDK v5: sendMessage with parts array
      sendMessage({
        parts: [{
          type: "text",
          text: JSON.stringify({
            topic: topic,
            clarifications: clarifications,
          }),
        }],
      });
    }
  }, [isCompleted, questions, answers, topic, sendMessage]);

  if (questions.length === 0) return null;

  return (
    <div className="flex gap-4 w-full flex-col items-center mb-16">
      <QuestionForm />
      <CompletedQuestions />
      <ResearchTimer />
      <ResearchActivities />
      <ResearchReport />
    </div>
  );
};

export default QnA;
