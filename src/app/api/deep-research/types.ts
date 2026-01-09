import { z } from "zod";


export interface ResearchFindings {
    summary: string,
    source: string
}

export interface ResearchState {
    topic: string,
    completedSteps: number,
    tokenUsed: number,
    findings: ResearchFindings[],
    processedUrl: Set<string>,
    clarificationsText: string
}

export interface ModelCallOptions<T>{
    model: string;
    prompt: string;
    system: string;
    schema?: z.ZodType<T>;
    activityType?: Activity["type"]
}

export interface SearchResult{
    title: string;
    url: string;
    content: string
}

export interface Activity{
    type: 'search' | 'extract' | 'analyze' | 'generate' | 'planning';
    status: 'pending' | 'complete' | 'warning' | 'error';
    message: string;
    timestamp?: number;
}

export type ActivityTracker = {
    add: (type: Activity['type'], status: Activity['status'], message: Activity['message']) => void;
}


export interface Source {
    url: string;
    title: string
}