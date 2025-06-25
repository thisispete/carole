<script lang="ts">
  import { onMount } from "svelte";
  import { getTopPriorityTasks } from "$lib/taskService.js";
  import ChatInterface from "$lib/components/ChatInterface.svelte";

  let priorityTasks: any[] = [];
  let tasksLoading = true;
  let tasksError = "";

  // Add refresh function
  function onTaskChange() {
    console.log("🔄 Refreshing priority tasks...");
    tasksLoading = true;

    // Add a small delay to ensure database transaction is committed
    setTimeout(() => {
      getTopPriorityTasks(3).then((tasksResult) => {
        if (tasksResult.success) {
          console.log("📋 Priority tasks refreshed:", tasksResult.data);
          priorityTasks = tasksResult.data;
          tasksError = "";
        } else {
          tasksError = tasksResult.error || "Unknown error";
          priorityTasks = [];
        }
        tasksLoading = false;
      });
    }, 500);
  }

  onMount(async () => {
    // Fetch priority tasks
    await onTaskChange();
  });

  function getPriorityClass(priority: number) {
    if (priority >= 8) return "high";
    if (priority >= 5) return "medium";
    return "low";
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case "todo":
        return "To Do";
      case "in_progress":
        return "In Progress";
      case "blocked":
        return "Blocked";
      case "done":
        return "Done";
      case "backlog":
        return "Backlog";
      default:
        return status;
    }
  }

  function formatDate(dateString: string | null) {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  }
</script>

<div class="py-6 space-y-8">
  <!-- Priority Dashboard Section -->
  <div class="bg-white rounded-lg shadow-sm border">
    <div class="p-6 border-b">
      <h2 class="text-2xl font-semibold">Top 3 Priorities</h2>
      <p class="text-sm text-gray-600">Your most important tasks right now</p>
    </div>

    {#if tasksLoading}
      <div class="loading">Loading tasks...</div>
    {:else if tasksError}
      <div class="error">
        <p>Error loading tasks: {tasksError}</p>
      </div>
    {:else if priorityTasks.length === 0}
      <div class="empty-state">
        <p>
          No active tasks found. Try asking the AI assistant to create some
          tasks!
        </p>
      </div>
    {:else}
      <div class="task-list-container">
        <!-- Table Header -->
        <div class="task-list-header">
          <div class="column title-column">Task</div>
          <div class="column priority-column">Priority</div>
          <div class="column status-column">Status</div>
          <div class="column tags-column">Tags</div>
          <div class="column due-column">Due Date</div>
        </div>

        <!-- Task Rows -->
        <div class="task-list-body">
          {#each priorityTasks as task (task.id)}
            <div class="task-row">
              <div class="column title-column">
                <div class="task-title">{task.title}</div>
                {#if task.description}
                  <div class="task-description">{task.description}</div>
                {/if}
              </div>

              <div class="column priority-column">
                <div class="priority-button {getPriorityClass(task.priority)}">
                  P{task.priority}
                </div>
              </div>

              <div class="column status-column">
                <div class="status-button">
                  {getStatusLabel(task.status)}
                </div>
              </div>

              <div class="column tags-column">
                {#if task.context_tags && task.context_tags.length > 0}
                  <div class="tags">
                    {#each task.context_tags.slice(0, 2) as tag}
                      <span class="tag">{tag}</span>
                    {/each}
                    {#if task.context_tags.length > 2}
                      <span class="tag-more"
                        >+{task.context_tags.length - 2}</span
                      >
                    {/if}
                  </div>
                {:else}
                  <span class="no-tags">—</span>
                {/if}
              </div>

              <div class="column due-column">
                {#if task.due_date}
                  <span class="due-date">{formatDate(task.due_date)}</span>
                {:else}
                  <span class="no-due-date">—</span>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  <!-- AI Chat Interface Section -->
  <div class="bg-white rounded-lg shadow-sm border">
    <div class="p-6">
      <ChatInterface on:taskChanged={onTaskChange} />
    </div>
  </div>
</div>

<style lang="scss">
  /* Task list styles - consistent with tasks page */
  .loading,
  .error,
  .empty-state {
    text-align: center;
    padding: 2rem;
    color: #666;
  }

  .error {
    color: #cc0000;
  }

  .task-list-container {
    border: 1px solid #ddd;
    border-radius: 0 0 8px 8px;
    background: white;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .task-list-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1.5fr 1fr;
    gap: 1rem;
    padding: 1rem 1.5rem;
    background: #f8f9fa;
    border-bottom: 1px solid #ddd;
    font-weight: 600;
    color: #555;
    font-size: 0.9rem;
  }

  .task-list-body {
    max-height: 70vh;
    overflow-y: auto;
  }

  .task-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1.5fr 1fr;
    gap: 1rem;
    padding: 1.5rem;
    border-bottom: 1px solid #eee;
    align-items: center;
  }

  .task-row:last-child {
    border-bottom: none;
  }

  .column {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 40px;
  }

  .title-column {
    align-items: flex-start;
  }

  .task-title {
    font-weight: 500;
    color: #333;
    margin-bottom: 0.25rem;
    line-height: 1.3;
  }

  .task-description {
    color: #666;
    font-size: 0.85rem;
    line-height: 1.3;
    margin-top: 0.25rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .priority-button,
  .status-button {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: bold;
    border: none;
    width: fit-content;
  }

  .priority-button.high {
    background: #ffe6e6;
    color: #cc0000;
  }

  .priority-button.medium {
    background: #fff3e0;
    color: #e65100;
  }

  .priority-button.low {
    background: #e8f5e8;
    color: #2e7d32;
  }

  .status-button {
    background: #f0f0f0;
    color: #333;
    text-transform: capitalize;
  }

  .tags {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
    align-items: center;
  }

  .tag {
    padding: 0.15rem 0.4rem;
    background: #e3f2fd;
    color: #1565c0;
    border-radius: 3px;
    font-size: 0.7rem;
    white-space: nowrap;
  }

  .tag-more {
    padding: 0.15rem 0.4rem;
    background: #f0f0f0;
    color: #666;
    border-radius: 3px;
    font-size: 0.7rem;
    font-weight: 500;
  }

  .no-tags,
  .no-due-date {
    color: #999;
    font-style: italic;
    font-size: 0.85rem;
  }

  .due-date {
    font-size: 0.85rem;
    color: #666;
    font-weight: 500;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .task-list-header,
    .task-row {
      grid-template-columns: 2fr 0.8fr 1fr 1fr 0.8fr;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
    }

    .task-list-header {
      font-size: 0.8rem;
    }

    .task-title {
      font-size: 0.9rem;
    }

    .task-description {
      font-size: 0.8rem;
      -webkit-line-clamp: 1;
    }

    .priority-button,
    .status-button {
      font-size: 0.7rem;
      padding: 0.2rem 0.4rem;
    }

    .tag {
      font-size: 0.65rem;
    }
  }
</style>
