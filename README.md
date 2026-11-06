# AI-ChatBuddy — Context-Aware Chatbot

A simple full-stack chatbot using Node.js, Express, and the OpenAI API. It supports separate conversations, multi-turn memory, context-window management, a custom system prompt, and clear error messages.

## Features

- Backend endpoint: `POST /api/chat`
- Real LLM API integration using the official OpenAI Node.js SDK
- Conversation history stored separately using a conversation ID
- Context management: keeps only the latest 12 user/assistant messages per conversation
- Custom ChatBuddy system prompt
- Handles missing/invalid API keys, rate limits, timeouts, API failures, and empty responses
- API key loaded from environment variables; `.env` is ignored by Git
- Responsive browser-based chat interface

## Requirements

- Node.js 18 or newer
- An OpenAI API key with API access and available quota

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and add your key:

   ```env
   OPENAI_API_KEY=your_real_api_key
   PORT=3000
   ```

   Never upload `.env` or share your API key.

3. Start the server:

   ```bash
   npm start
   ```

4. Open `http://localhost:3000`.

## API

Send a request:

```http
POST /api/chat
Content-Type: application/json
```

```json
{
  "conversationId": "optional-conversation-id",
  "message": "What is binary search?"
}
```

Example response:

```json
{
  "conversationId": "server-generated-id",
  "reply": "Binary search is..."
}
```

Reuse the returned `conversationId` for later messages in the same conversation. Use a different ID to start a separate conversation.

Health check: `GET /api/health`

## Context-window strategy

The server prepends the ChatBuddy system prompt and sends the saved conversation history with each new user message. After a successful response, it saves the new user and assistant messages and truncates history to the latest 12 messages. This keeps the prompt bounded while allowing the model to refer to recent turns.

## Important limitations

- Conversation history is stored in server memory. It is cleared when the server restarts and is not shared across multiple server instances.
- For a production deployment, use a database or session store, add authentication, and apply per-user rate limits.
- The API key is needed on the backend only. It is never sent to browser JavaScript.

## Test multi-turn context

Try these five turns in the same chat:

1. `My name is Alex.`
2. `I am learning Java.`
3. `Explain what a loop is.`
4. `What programming language am I learning?`
5. `What is my name, and explain a loop using Java?`

The last response should use details from earlier turns.
