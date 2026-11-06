import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

const SYSTEM_PROMPT = `You are ChatBuddy, a friendly and patient learning assistant for college students.
Explain technical topics clearly, use simple examples, and guide the learner step by step.
Keep answers focused and encouraging. If a question is unclear, ask one short clarification.
Do not claim to have performed actions you have not performed.`;

const MAX_HISTORY_MESSAGES = 12; // Keep the latest 12 user/assistant messages per conversation.
const conversations = new Map();

function getClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("The server is missing OPENAI_API_KEY. Add it to your .env file.");
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 30_000,
    maxRetries: 1
  });
}

app.post("/api/chat", async (req, res) => {
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  let conversationId = typeof req.body?.conversationId === "string"
    ? req.body.conversationId
    : "";

  if (!message) {
    return res.status(400).json({ error: "Please enter a message." });
  }
  if (message.length > 4000) {
    return res.status(400).json({ error: "Message is too long. Please keep it under 4,000 characters." });
  }

  if (!conversationId) conversationId = crypto.randomUUID();

  const previousHistory = conversations.get(conversationId) || [];
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...previousHistory,
    { role: "user", content: message }
  ];

  try {
    const client = getClient();
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7
    });

    const reply = completion.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return res.status(502).json({ error: "The AI returned an empty response. Please try again." });
    }

    const updatedHistory = [
      ...previousHistory,
      { role: "user", content: message },
      { role: "assistant", content: reply }
    ];

    // Context management: retain only the most recent 12 messages.
    conversations.set(conversationId, updatedHistory.slice(-MAX_HISTORY_MESSAGES));

    return res.json({ conversationId, reply });
  } catch (error) {
    console.error("Chat API error:", error.message);

    if (error.message.includes("OPENAI_API_KEY")) {
      return res.status(500).json({ error: "Server setup issue: the OpenAI API key is missing. Please configure it in the hosting environment." });
    }
    if (error.status === 401) {
      return res.status(401).json({ error: "The API key was rejected. Please check the server's OpenAI API key." });
    }
    if (error.status === 429) {
      return res.status(429).json({ error: "The AI service is busy or the API quota is unavailable. Please try again later." });
    }
    if (error.name === "APIConnectionTimeoutError" || error.name === "TimeoutError") {
      return res.status(504).json({ error: "The AI request timed out. Please try again." });
    }
    return res.status(502).json({ error: "Sorry, I couldn't reach the AI service. Please try again in a moment." });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`ChatBuddy is running at http://localhost:${PORT}`);
});
