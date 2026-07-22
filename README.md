# Build Deep Research AI Agent with Next.js, Vercel AI SDk and LLMs like Gemini, Deepseek & Gpt-4o

A powerful Deep Research AI agent like Gemini or ChatGPT. Using Next.js, Vercel AI SDK, and Exa Search API, An intelligent system that generates follow-up questions, crafts optimal search queries, and compiles comprehensive research reports.

![GitHub stars](https://img.shields.io/github/stars/codebucks27/Deep-Research-AI-Agent?style=social&logo=ApacheSpark&label=Stars)&nbsp;&nbsp;
![GitHub forks](https://img.shields.io/github/forks/codebucks27/Deep-Research-AI-Agent?style=social&logo=KashFlow&maxAge=3600)&nbsp;&nbsp;
![Github Followers](https://img.shields.io/github/followers/codebucks27.svg?style=social&label=Follow)&nbsp;&nbsp;<br />

If you want to learn how to create it please follow below tutorial👇: <br />
➡ Tutorial Link 💚: [Deep research ai agent](https://youtu.be/zKN18GQBxCM) <br />

If you are looking for old tutorial version please checkout this branch:<br />
[Tutorial Version (Old)](https://github.com/codebucks27/Deep-Research-AI-Agent/tree/tutorial-version-(old)) <br />

[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/zKN18GQBxCM/0.jpg)](https://www.youtube.com/watch?v=zKN18GQBxCM)

🎯 For customised solutions or deployment please contact: https://tally.so/r/wdlj0N

#### ⭐DO NOT FORGET TO STAR THIS REPO⭐

![deep research Ai Agent](https://github.com/codebucks27/Deep-Research-AI-Agent/blob/main/app%20screenshots/Final%20output%20with%20report.png)

## 🚀 Key Features  

- 🔧 Fully Customizable Research Flow
- 🔍 Adaptive Search Queries
- ⚙️ Seamless LLM Integration
- 💼 Modular Components
- 🌐 Next.js & Vercel AI SDK
- ♻️ Iterative Research Loop

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Styling:** Tailwind CSS v4, Shadcn UI
- **AI Integration:** Vercel AI SDK v6
- **LLMs:** GPT-4o, Gemini, Deepseek via OpenRouter
- **Web Search:** Exa Search API
- **UI Components:** Shadcn
- **Language:** TypeScript
- **Package Manager:** Bun

## 🔄 What's New (Dependency Refresh)

This branch has been migrated from the original tutorial stack to the latest versions. The runtime behaviour is the same — only the toolchain moved forward.

- **Next.js** 15 → 16 (Turbopack production builds, `next lint` removed)
- **Vercel AI SDK** 4 → 6 (`generateObject` replaced with `generateText` + `Output.object()`, `useChat` now uses `DefaultChatTransport`)
- **@ai-sdk/react** 1 → 3, **@openrouter/ai-sdk-provider** 0.4 → 2
- **Zod** 3 → 4, **lucide-react** 0.x → 1, **react-syntax-highlighter** 15 → 16
- **ESLint config** migrated to the native flat config from `eslint-config-next` v16
- **Package manager:** switched from npm to **Bun** (`bun.lock` replaces `package-lock.json`)

> Want the original tutorial code? Check out commit [`274eff7`](https://github.com/codebucks27/Deep-Research-AI-Agent/commit/274eff7) (the last version before the refresh) or browse any earlier commit on this branch.

## ⚡ Prerequisites

Before you begin, ensure you have:

- OpenRouter API key (or you can use grok or any other LLM providers) 
- Exa search API key

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone [repo-url]
cd Deep-Research-AI-Agent
```

### 2. Install Dependencies

This project uses [Bun](https://bun.sh) as the package manager.

```bash
bun install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory. Check `.env.example` for required variables.

### 4. Start Development Server

```bash
bun run dev
```

Visit `http://localhost:3000` to see your app.

### Optional AgentPond tracing

To export OpenInference AI traces directly to a private Vercel Blob store,
initialize AgentPond 0.6 from the project root:

```bash
npx agentpond@0.6.0 init --platform vercel
```

Follow the generated prompt, connect a private Blob store to the Vercel
project, enable Vercel System Environment Variables, and set
`AGENTPOND_ENABLED=true`. After running a research request:

The AI SDK telemetry settings explicitly enable `recordInputs` and
`recordOutputs`. This records input and output values for each instrumented
call, which may include prompts, messages, tool data, and generated content. A
private Blob store restricts access but does not redact these values. Review
the [Vercel AI SDK telemetry documentation](https://ai-sdk.dev/docs/ai-sdk-core/telemetry)
before enabling tracing.

```bash
npx agentpond@0.6.0 sync
npx agentpond@0.6.0 traces list --limit 10
```

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!

If you have any question or want a custom build for your business, you can reach out to me via:

- E-mail : codebucks27@gmail.com
- Twitter: https://twitter.com/code_bucks
- Instagram: https://www.instagram.com/code.bucks/

MyChannel: https://www.youtube.com/codebucks
My Website: https://devdreaming.com/
