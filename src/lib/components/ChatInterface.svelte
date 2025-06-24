<script>
  import { onMount, createEventDispatcher } from "svelte";
  import { databricksService } from "../databricksService";

  const dispatch = createEventDispatcher();

  let messages = [];
  let currentMessage = "";
  let isLoading = false;
  let messagesContainer;

  // Use hardcoded model from environment or default
  const selectedModel =
    import.meta.env.VITE_DEFAULT_AI_MODEL || "claude-3-5-sonnet";

  onMount(async () => {
    // Initialize Databricks service
    console.log("🚀 Initializing Databricks service...");
    await databricksService.initialize();

    // Add welcome message
    messages = [
      {
        role: "assistant",
        content:
          "Hi! I'm Carole, your AI assistant. I'm here to help you manage your tasks and priorities. What would you like to work on today?",
        timestamp: new Date(),
      },
    ];
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
        // Process tool results if present
        let displayContent = response.response;
        let toolActions = [];

        if (response.toolResults && response.toolResults.length > 0) {
          console.log("🔧 Tool results received:", response.toolResults);
          toolActions = response.toolResults;

          // Only show tool results in the separate tool actions section
          // Don't add them to the main response content for a cleaner experience

          // Check if any tools were successfully executed that might change tasks
          const taskChangingTools = [
            "createTask",
            "updateTask",
            "deleteTask",
            "changeTaskStatus",
            "changeTaskPriority",
            "markTaskComplete",
          ];
          const hadTaskChanges = toolActions.some(
            (action) =>
              taskChangingTools.includes(action.toolCall?.tool) &&
              action.success
          );

          // Refresh tasks if any task-changing operations were successful
          if (hadTaskChanges) {
            console.log(
              "🔄 Task changes detected, refreshing parent component..."
            );
            dispatch("taskChanged");
          }
        }

        // Add AI response to chat
        messages = [
          ...messages,
          {
            role: "assistant",
            content: displayContent,
            timestamp: new Date(),
            model: response.model,
            toolActions: toolActions,
            context: response.context,
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
</script>

<div class="chat-container">
  <!-- Messages -->
  <div class="messages-container" bind:this={messagesContainer}>
    {#each messages as message}
      <div class="message message-{message.role}" class:error={message.isError}>
        <div class="message-content">
          <p>{message.content}</p>

          <!-- Tool Actions Display -->
          {#if message.toolActions && message.toolActions.length > 0}
            <div class="tool-actions">
              <div class="tool-actions-header">
                <span class="tool-icon">🛠️</span>
                <span>Actions taken:</span>
              </div>
              {#each message.toolActions as action}
                <div
                  class="tool-action"
                  class:success={action.success}
                  class:error={!action.success}
                >
                  <span class="action-icon">
                    {action.success ? "✅" : "❌"}
                  </span>
                  <span class="action-message">{action.userMessage}</span>
                  {#if action.taskId}
                    <small class="task-id"
                      >Task: {action.taskId.slice(0, 8)}...</small
                    >
                  {/if}
                </div>
              {/each}
            </div>
          {/if}

          <!-- Removed context insights footer to reduce verbosity -->

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
        disabled={isLoading}
      ></textarea>
      <button
        on:click={sendMessage}
        disabled={!currentMessage.trim() || isLoading}
        class="send-button"
      >
        Send
      </button>
    </div>

    <!-- Quick Actions -->
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
