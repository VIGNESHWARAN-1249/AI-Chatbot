AI-ChatBuddy 🤖

AI-ChatBuddy is a simple AI chatbot built using Node.js, Express and the OpenAI API.

The main idea of this project is to create a chatbot that can remember previous messages and continue a conversation without forgetting everything after each reply.

Features

- Chat with an AI using the OpenAI API.
- Maintains conversation history using a conversation ID.
- Can remember details from previous messages.
- Keeps the latest 12 messages to manage the context window.
- Uses a custom system prompt to define the chatbot's behaviour.
- Displays error messages if the API request fails.
- Keeps the API key safe using environment variables.

Technologies Used

- HTML
- CSS
- JavaScript
- Node.js
- Express.js
- OpenAI API

Project Structure

AI-ChatBuddy/
│
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
│
├── server.js
├── package.json
├── .env.example
├── .gitignore
└── README.md

How to Run the Project

1. Clone the repository

git clone YOUR_GITHUB_REPOSITORY_URL
cd AI-ChatBuddy

2. Install the required packages

npm install

3. Create a ".env" file

Add your OpenAI API key:

OPENAI_API_KEY=your_api_key_here
PORT=3000

4. Start the server

npm start

5. Open the chatbot

Visit "http://localhost:3000" in your browser.

How Conversation Memory Works

Each conversation has its own conversation ID.

When a user sends a message, the backend saves the message and the AI response. These messages are sent along with the next request so that the chatbot can understand the previous conversation.

To avoid sending too much history, the application keeps only the latest 12 messages.

Testing

You can test the memory feature using these messages in the same conversation:

1. My name is Alex.
2. I am learning Java.
3. Explain loops.
4. Which programming language am I learning?
5. What is my name?

The chatbot should be able to remember the information shared in the earlier messages.

Security

- The API key is stored in the ".env" file.
- The ".env" file is added to ".gitignore".
- Only the ".env.example" file is uploaded to GitHub.
- The API key is used only by the backend.

Limitations

Currently, conversation history is stored in server memory. It will be cleared when the server restarts.

For future improvements, a database can be added to store conversations permanently.

---

Built as a learning project to understand AI APIs, backend development and multi-turn conversations.
