
const chat = document.getElementById("chat");
const form = document.getElementById("chat-form");
const input = document.getElementById("message");
const sendButton = document.getElementById("send");
const newChatButton = document.getElementById("new-chat");

let conversationId = createConversationId();

function createConversationId() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `chat-${Date.now()}-${Math.random()}`;
}

function addMessage(text, role, extraClass = "") {
  const bubble = document.createElement("div");
  bubble.className = `message ${role} ${extraClass}`.trim();
  bubble.textContent = text;

  chat.appendChild(bubble);
  chat.scrollTop = chat.scrollHeight;

  return bubble;
}

function removeWelcome() {
  document.getElementById("welcome")?.remove();
}

async function sendMessage(message) {
  removeWelcome();

  addMessage(message, "user");

  input.value = "";
  sendButton.disabled = true;

  const typing = document.createElement("div");
  typing.className = "typing";
  typing.textContent = "ChatBuddy is thinking...";

  chat.appendChild(typing);
  chat.scrollTop = chat.scrollHeight;

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: message,
        conversationId: conversationId
      })
    });

    const data = await response.json();
    typing.remove();

    if (!response.ok) {
      addMessage(
        data.error || "Something went wrong. Please try again.",
        "assistant",
        "error"
      );
      return;
    }

    conversationId = data.conversationId;
    addMessage(data.reply, "assistant");

  } catch (error) {
    typing.remove();

    addMessage(
      "Unable to connect to the server. Please check your connection.",
      "assistant",
      "error"
    );

  } finally {
    sendButton.disabled = false;
    input.focus();
  }
}

// Send message
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const message = input.value.trim();

  if (message && !sendButton.disabled) {
    sendMessage(message);
  }
});

// Enter to send, Shift + Enter for new line
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

// Suggested prompts
document.querySelectorAll(".suggestion").forEach((button) => {
  button.addEventListener("click", () => {
    sendMessage(button.dataset.prompt);
  });
});

// Start a new conversation
newChatButton.addEventListener("click", () => {
  conversationId = createConversationId();

  chat.innerHTML = `
    <div class="welcome" id="welcome">
      <h2>New conversation</h2>
      <p>Ask ChatBuddy anything!</p>
    </div>
  `;

  input.focus();
});
