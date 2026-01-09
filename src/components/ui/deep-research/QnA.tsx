/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import React, { useEffect, useState } from "react";
import { useDeepResearchStore } from "@/store/deepResearch";
import CompletedQuestions from "./CompletedQuestions";
import QuestionForm from "./QuestionForm";
import ResearchActivities from "./ResearchActivities";
import ResearchReport from "./ResearchReport";
import ResearchTimer from "./ResearchTimer";

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

  const [hasStarted, setHasStarted] = useState(false);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/deep-research",
    }),
    onData: (dataPart: any) => {
      // Handle activity data parts
      if (dataPart.type === "data-activity") {
        setActivities((prev: any[]) => [...prev, dataPart.data]);

        // Extract sources from extract activities
        if (
          dataPart.data.type === "extract" &&
          dataPart.data.status === "complete"
        ) {
          const url = dataPart.data.message.split("from ")[1];
          if (url) {
            setSources((prev: any[]) => [
              ...prev,
              {
                url,
                title: url?.split("/")[2] || url,
              },
            ]);
          }
        }
      }

      // Handle report data parts
      if (dataPart.type === "data-report") {
        setReport(dataPart.data as string);
      }
    },
  });

  // Update loading state based on status
  useEffect(() => {
    const isLoading = status === "submitted" || status === "streaming";
    setIsLoading(isLoading);
  }, [status, setIsLoading]);

  // Extract report from message parts as fallback
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "assistant" && lastMessage.parts) {
        const textParts = lastMessage.parts.filter(
          (part: any) => part.type === "text"
        );
        if (textParts.length > 0) {
          const text = textParts.map((part: any) => part.text).join("");
          if (text.includes("<report>")) {
            setReport(text);
          }
        }
      }
    }
  }, [messages, setReport]);

  useEffect(() => {
    if (isCompleted && questions.length > 0 && !hasStarted) {
      setHasStarted(true);
      const clarifications = questions.map((question, index) => ({
        question: question,
        answer: answers[index],
      }));

      sendMessage({
        text: JSON.stringify({
          topic: topic,
          clarifications: clarifications,
        }),
      });
    }
  }, [isCompleted, questions, answers, topic, sendMessage, hasStarted]);

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
