<script>
  import { onMount } from "svelte";
  import { testConnection } from "$lib/supabase.js";
  import { getTopPriorityTasks, debugAllTasks } from "$lib/taskService.js";

  let connectionStatus = "Testing...";
  let connectionDetails = "";
  let priorityTasks = [];
  let tasksLoading = true;
  let tasksError = "";

  onMount(async () => {
    // Test connection
    const result = await testConnection();
    if (result.success) {
      connectionStatus = "✅ Supabase Connected!";
      connectionDetails = "";
    } else {
      connectionStatus = "❌ Connection Failed";
      connectionDetails = result.error || "Unknown error";
    }

    // Fetch priority tasks
    const tasksResult = await getTopPriorityTasks(3);
    if (tasksResult.success) {
      priorityTasks = tasksResult.data;
      tasksError = "";
    } else {
      tasksError = tasksResult.error;
      priorityTasks = [];
    }
    tasksLoading = false;

    // Debug: Show all tasks in console
    await debugAllTasks();
  });

  function getStatusColor(status) {
    const colors = {
      todo: "#007acc",
      in_progress: "#ff9500",
      blocked: "#ff3b30",
      done: "#34c759",
      backlog: "#8e8e93",
    };
    return colors[status] || "#007acc";
  }
</script>

<h1>Welcome to Carole</h1>
<p>Your AI Personal Assistant &amp; Project Manager</p>

<div class="connection-status">
  <small>{connectionStatus}</small>
  {#if connectionDetails}
    <small class="error-details">({connectionDetails})</small>
  {/if}
</div>

<div class="priority-section">
  <h2>Top 3 Priorities</h2>
  <div class="priority-list">
    {#if tasksLoading}
      <div class="priority-item loading">Loading tasks...</div>
    {:else if tasksError}
      <div class="priority-item error">Error: {tasksError}</div>
    {:else if priorityTasks.length === 0}
      <div class="priority-item empty">No active tasks found</div>
    {:else}
      {#each priorityTasks as task}
        <div
          class="priority-item"
          style="border-left-color: {getStatusColor(task.status)}"
        >
          <div class="task-header">
            <span class="task-title">{task.title}</span>
            <span class="task-priority">P{task.priority}</span>
          </div>
          <div class="task-meta">
            <span class="task-status">{task.status.replace("_", " ")}</span>
            {#if task.context_tags && task.context_tags.length > 0}
              <span class="task-tags">
                {#each task.context_tags.slice(0, 2) as tag}
                  <span class="tag">{tag}</span>
                {/each}
              </span>
            {/if}
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>

<div class="chat-section">
  <h3>Chat with Carole</h3>
  <div class="chat-interface">
    <div class="chat-messages">
      <p>
        Hello! I'm Carole, your AI assistant. How can I help you manage your
        tasks today?
      </p>
    </div>
    <div class="chat-input">
      <input type="text" placeholder="Type your message..." />
      <button>Send</button>
    </div>
  </div>
</div>

<nav>
  <a href="/tasks">Browse All Tasks</a>
  <a href="/analytics">Analytics</a>
</nav>

<style>
  h1 {
    color: #333;
    margin-bottom: 0.5rem;
  }

  .priority-section {
    margin: 2rem 0;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
  }

  .priority-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .priority-item {
    padding: 0.75rem;
    background: #f5f5f5;
    border-radius: 4px;
    border-left: 4px solid #007acc;
  }

  .priority-item.loading,
  .priority-item.error,
  .priority-item.empty {
    text-align: center;
    font-style: italic;
    color: #666;
  }

  .priority-item.error {
    background: #fff5f5;
    border-left-color: #ff3b30;
    color: #d73a49;
  }

  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .task-title {
    font-weight: 500;
    color: #333;
  }

  .task-priority {
    background: #007acc;
    color: white;
    padding: 0.2rem 0.5rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: bold;
  }

  .task-meta {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    font-size: 0.85rem;
  }

  .task-status {
    color: #666;
    text-transform: capitalize;
  }

  .task-tags {
    display: flex;
    gap: 0.25rem;
  }

  .tag {
    background: #e0e0e0;
    color: #555;
    padding: 0.1rem 0.4rem;
    border-radius: 8px;
    font-size: 0.75rem;
  }

  .connection-status .error-details {
    color: #d73a49;
    margin-left: 0.5rem;
  }

  .chat-section {
    margin: 2rem 0;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
  }

  .chat-messages {
    min-height: 200px;
    padding: 1rem;
    background: #f9f9f9;
    border-radius: 4px;
    margin-bottom: 1rem;
  }

  .chat-input {
    display: flex;
    gap: 0.5rem;
  }

  .chat-input input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .chat-input button {
    padding: 0.5rem 1rem;
    background: #007acc;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  nav {
    margin-top: 2rem;
    display: flex;
    gap: 1rem;
  }

  nav a {
    padding: 0.5rem 1rem;
    background: #f0f0f0;
    text-decoration: none;
    border-radius: 4px;
    color: #333;
  }

  nav a:hover {
    background: #e0e0e0;
  }
</style>
