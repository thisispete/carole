<script>
  import { onMount } from "svelte";
  import { databricksService } from "../databricksService";

  let messages = [];
  let currentMessage = "";
  let isLoading = false;
  let connectionStatus = "disconnected";
  let availableModels = [];
  let selectedModel = "claude-3-5-sonnet";
  let messagesContainer;

  onMount(async () => {
    // Initialize Databricks service
    console.log("🚀 Initializing Databricks service...");
    const connected = await databricksService.initialize();
    connectionStatus = connected ? "connected" : "error";

    if (connected) {
      // Load available models
      const modelsResult = await databricksService.listModels();
      if (modelsResult.success && modelsResult.models) {
        availableModels = modelsResult.models;
        console.log("📋 Loaded models:", availableModels);
      }

      // Add welcome message
      messages = [
        {
          role: "assistant",
          content:
            "Hi! I'm Carole, your AI assistant. I'm here to help you manage your tasks and priorities. What would you like to work on today?",
          timestamp: new Date(),
        },
      ];
    }
  });

  async function sendMessage() {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage = currentMessage.trim();
    currentMessage = "";

    // Add user message to chat
    messages = [
      ...messages,
      {
        role: "user",
        content: userMessage,
        timestamp: new Date(),
      },
    ];
    scrollToBottom();

    isLoading = true;

    try {
      // Prepare context (last 5 messages for context)
      const context = messages.slice(-5).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Send to Databricks AI
      const response = await databricksService.sendMessage(
        userMessage,
        context,
        selectedModel
      );

      if (response.success && response.response) {
        // Add AI response to chat
        messages = [
          ...messages,
          {
            role: "assistant",
            content: response.response,
            timestamp: new Date(),
            model: response.model,
          },
        ];
        scrollToBottom();
      } else {
        // Handle error
        messages = [
          ...messages,
          {
            role: "assistant",
            content: `Sorry, I encountered an error: ${response.error || "Unknown error"}`,
            timestamp: new Date(),
            isError: true,
          },
        ];
        scrollToBottom();
      }
    } catch (error) {
      console.error("Chat error:", error);
      messages = [
        ...messages,
        {
          role: "assistant",
          content:
            "Sorry, I encountered an unexpected error. Please try again.",
          timestamp: new Date(),
          isError: true,
        },
      ];
      scrollToBottom();
    } finally {
      isLoading = false;
    }
  }

  function handleKeyPress(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  function scrollToBottom() {
    if (messagesContainer) {
      setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }, 50); // Small delay to ensure DOM is updated
    }
  }

  function testPrioritySuggestions() {
    // Mock task data for testing
    const mockTasks = [
      { id: "1", title: "Set up database schema", priority: 8, status: "done" },
      {
        id: "2",
        title: "Build task CRUD interface",
        priority: 9,
        status: "in_progress",
      },
      {
        id: "3",
        title: "Integrate AI chat functionality",
        priority: 6,
        status: "todo",
      },
      {
        id: "4",
        title: "Design priority algorithm",
        priority: 7,
        status: "backlog",
      },
    ];

    databricksService.getPrioritySuggestions(mockTasks).then((response) => {
      if (response.success && response.response) {
        messages = [
          ...messages,
          {
            role: "assistant",
            content: response.response,
            timestamp: new Date(),
            model: response.model,
            isSystemMessage: true,
          },
        ];
        scrollToBottom();
      }
    });
  }
</script>

<div class="chat-container">
  <!-- Header with connection status -->
  <div class="chat-header">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold">AI Assistant (Databricks)</h3>
      <div class="flex items-center gap-4">
        <!-- Connection Status -->
        <span class="status-indicator status-{connectionStatus}">
          {#if connectionStatus === "connected"}
            🟢 Connected
          {:else if connectionStatus === "error"}
            🔴 Connection Error
          {:else}
            🟡 Connecting...
          {/if}
        </span>

        <!-- Model Selector -->
        {#if availableModels.length > 0}
          <select bind:value={selectedModel} class="model-select">
            {#each availableModels as model}
              <option value={model.name}>
                {model.displayName}
                {model.recommended ? "⭐" : ""}
              </option>
            {/each}
          </select>
        {/if}
      </div>
    </div>
  </div>

  <!-- Messages -->
  <div class="messages-container" bind:this={messagesContainer}>
    {#each messages as message}
      <div class="message message-{message.role}" class:error={message.isError}>
        <div class="message-content">
          <p>{message.content}</p>
          {#if message.model}
            <small class="model-badge">via {message.model}</small>
          {/if}
        </div>
        <small class="timestamp">
          {message.timestamp.toLocaleTimeString()}
        </small>
      </div>
    {/each}

    {#if isLoading}
      <div class="message message-assistant loading">
        <div class="message-content">
          <p>🤔 Thinking...</p>
        </div>
      </div>
    {/if}
  </div>

  <!-- Input -->
  <div class="chat-input">
    <div class="input-row">
      <textarea
        bind:value={currentMessage}
        on:keypress={handleKeyPress}
        placeholder="Ask me about your tasks or priorities..."
        rows="2"
        disabled={connectionStatus !== "connected" || isLoading}
      ></textarea>
      <button
        on:click={sendMessage}
        disabled={!currentMessage.trim() ||
          connectionStatus !== "connected" ||
          isLoading}
        class="send-button"
      >
        Send
      </button>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <button
        on:click={testPrioritySuggestions}
        disabled={connectionStatus !== "connected" || isLoading}
        class="quick-action-btn"
      >
        🎯 Get Priority Suggestions
      </button>
    </div>
  </div>
</div>

<style>
  .chat-container {
    display: flex;
    flex-direction: column;
    height: 500px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    background: white;
  }

  .chat-header {
    padding: 1rem;
    border-bottom: 1px solid #e2e8f0;
    background: #f8fafc;
  }

  .status-indicator {
    font-size: 0.875rem;
    font-weight: 500;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
  }

  .status-connected {
    background: #dcfce7;
    color: #166534;
  }

  .status-error {
    background: #fee2e2;
    color: #991b1b;
  }

  .status-disconnected {
    background: #fef3c7;
    color: #92400e;
  }

  .model-select {
    padding: 0.25rem 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 0.875rem;
  }

  .messages-container {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .message {
    display: flex;
    flex-direction: column;
    max-width: 80%;
  }

  .message-user {
    align-self: flex-end;
    align-items: flex-end;
  }

  .message-assistant {
    align-self: flex-start;
    align-items: flex-start;
  }

  .message-content {
    padding: 0.75rem 1rem;
    border-radius: 1rem;
    position: relative;
  }

  .message-user .message-content {
    background: #3b82f6;
    color: white;
  }

  .message-assistant .message-content {
    background: #f1f5f9;
    color: #1e293b;
  }

  .message.error .message-content {
    background: #fee2e2;
    color: #991b1b;
  }

  .message.loading .message-content {
    animation: pulse 1.5s ease-in-out infinite;
  }

  .model-badge {
    display: block;
    margin-top: 0.25rem;
    opacity: 0.7;
    font-size: 0.75rem;
  }

  .timestamp {
    margin-top: 0.25rem;
    opacity: 0.5;
    font-size: 0.75rem;
  }

  .chat-input {
    padding: 1rem;
    border-top: 1px solid #e2e8f0;
  }

  .input-row {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  textarea {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    resize: none;
    font-family: inherit;
  }

  textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .send-button {
    padding: 0.75rem 1.5rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .send-button:hover:not(:disabled) {
    background: #2563eb;
  }

  .send-button:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }

  .quick-actions {
    display: flex;
    gap: 0.5rem;
  }

  .quick-action-btn {
    padding: 0.5rem 1rem;
    background: #f1f5f9;
    color: #475569;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .quick-action-btn:hover:not(:disabled) {
    background: #e2e8f0;
  }

  .quick-action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
</style>
