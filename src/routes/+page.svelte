<script lang="ts">
  import { onMount } from "svelte";
  import {
    getTopPriorityTasks,
    updateTask,
    deleteTask,
  } from "$lib/taskService.js";
  import ChatInterface from "$lib/components/ChatInterface.svelte";
  import TaskDetailModal from "$lib/components/task/TaskDetailModal.svelte";
  import ContextMenu from "$lib/components/ui/ContextMenu.svelte";
  import Popover from "$lib/components/ui/Popover.svelte";
  import ConfirmDialog from "$lib/components/ui/ConfirmDialog.svelte";

  let priorityTasks: any[] = [];
  let tasksLoading = true;
  let tasksError = "";

  // Task modal state
  let selectedTask: any = null;
  let showTaskModal = false;

  // Context menu state
  let showContextMenu = false;
  let contextMenuX = 0;
  let contextMenuY = 0;
  let contextMenuTask: any = null;

  // Popover state
  let showPopover = false;
  let popoverAnchor: any = null;
  let popoverType = "status";
  let popoverTask: any = null;

  // Confirmation dialog state
  let showConfirmDialog = false;
  let confirmAction: string | null = null;
  let confirmTask: any = null;

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

  // Task interaction handlers
  function handleTaskClick(task: any) {
    selectedTask = task;
    showTaskModal = true;
  }

  function handleTaskUpdated(event: any) {
    const updatedTask = event.detail;
    // Update the task in our local priorityTasks array
    priorityTasks = priorityTasks.map((task) =>
      task.id === updatedTask.id ? updatedTask : task
    );
    // Also refresh to get updated priority ranking
    onTaskChange();
  }

  function handleTaskDeleted(event: any) {
    const deletedTask = event.detail;
    // Remove the task from our local priorityTasks array
    priorityTasks = priorityTasks.filter((task) => task.id !== deletedTask.id);
    // Refresh to get a new task to fill the top 3
    onTaskChange();
  }

  function handleStatusClick(event: any, task: any) {
    event.stopPropagation();
    popoverAnchor = event.target;
    popoverType = "status";
    popoverTask = task;
    showPopover = true;
  }

  function handlePriorityClick(event: any, task: any) {
    event.stopPropagation();
    popoverAnchor = event.target;
    popoverType = "priority";
    popoverTask = task;
    showPopover = true;
  }

  function handleRightClick(event: any, task: any) {
    event.preventDefault();
    contextMenuX = event.clientX;
    contextMenuY = event.clientY;
    contextMenuTask = task;
    showContextMenu = true;
  }

  // Context menu actions
  async function handleContextAction(event: any) {
    const { action, task } = event.detail;

    switch (action) {
      case "edit":
        selectedTask = task;
        showTaskModal = true;
        break;
      case "complete":
        await quickUpdateTask(task.id, { status: "done" });
        break;
      case "duplicate":
        await duplicateTask(task);
        break;
      case "priority":
        popoverAnchor = document.querySelector(
          `[data-task-id="${task.id}"] .priority-button`
        );
        popoverType = "priority";
        popoverTask = task;
        showPopover = true;
        break;
      case "status":
        popoverAnchor = document.querySelector(
          `[data-task-id="${task.id}"] .status-button`
        );
        popoverType = "status";
        popoverTask = task;
        showPopover = true;
        break;
      case "delete":
        confirmAction = "delete";
        confirmTask = task;
        showConfirmDialog = true;
        break;
    }
  }

  // Popover selection
  async function handlePopoverSelect(event: any) {
    const { type, value } = event.detail;
    if (!popoverTask) return;

    const field = type === "status" ? "status" : "priority";
    await quickUpdateTask(popoverTask.id, { [field]: value });
  }

  // Confirmation dialog
  async function handleConfirmAction() {
    if (confirmAction === "delete" && confirmTask) {
      await deleteTaskAction(confirmTask.id);
    }

    confirmAction = null;
    confirmTask = null;
  }

  // Quick task update helper
  async function quickUpdateTask(taskId: any, updates: any) {
    try {
      const result = await updateTask(taskId, updates);
      if (result.success) {
        // Update local task list
        priorityTasks = priorityTasks.map((task) =>
          task.id === taskId ? { ...task, ...updates } : task
        );
        // Refresh to get updated priority ranking
        onTaskChange();
      } else {
        console.error("Failed to update task:", result.error);
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  }

  // Delete task action
  async function deleteTaskAction(taskId: any) {
    try {
      const result = await deleteTask(taskId);
      if (result.success) {
        // Remove from local task list and refresh
        priorityTasks = priorityTasks.filter((task) => task.id !== taskId);
        onTaskChange(); // Get a new task to fill the top 3
      } else {
        console.error("Failed to delete task:", result.error);
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  }

  // Duplicate task action
  async function duplicateTask(originalTask: any) {
    try {
      const { createTask } = await import("$lib/taskService.js");
      const duplicatedTask = {
        ...originalTask,
        title: `${originalTask.title} (Copy)`,
        id: undefined, // Remove ID so a new one is generated
        created_at: undefined,
        updated_at: undefined,
      };

      const result = await createTask(duplicatedTask);
      if (result.success) {
        // Refresh priority tasks to potentially include the new task
        onTaskChange();
      } else {
        console.error("Failed to duplicate task:", result.error);
      }
    } catch (error) {
      console.error("Error duplicating task:", error);
    }
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
            <div
              class="task-row"
              data-task-id={task.id}
              on:click={() => handleTaskClick(task)}
              on:contextmenu={(e) => handleRightClick(e, task)}
              role="button"
              tabindex="0"
            >
              <div class="column title-column">
                <div class="task-title">{task.title}</div>
                {#if task.description}
                  <div class="task-description">{task.description}</div>
                {/if}
              </div>

              <div class="column priority-column">
                <button
                  class="priority-button {getPriorityClass(task.priority)}"
                  on:click={(e) => handlePriorityClick(e, task)}
                >
                  P{task.priority}
                </button>
              </div>

              <div class="column status-column">
                <button
                  class="status-button"
                  on:click={(e) => handleStatusClick(e, task)}
                >
                  {getStatusLabel(task.status)}
                </button>
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
    <div class="chat-section">
      <ChatInterface on:taskChanged={onTaskChange} />
    </div>
  </div>
</div>

<!-- Task Detail Modal -->
<TaskDetailModal
  task={selectedTask}
  bind:isOpen={showTaskModal}
  on:taskUpdated={handleTaskUpdated}
  on:taskDeleted={handleTaskDeleted}
  on:close={() => (showTaskModal = false)}
/>

<!-- Context Menu -->
<ContextMenu
  task={contextMenuTask}
  x={contextMenuX}
  y={contextMenuY}
  bind:isOpen={showContextMenu}
  on:action={handleContextAction}
  on:close={() => (showContextMenu = false)}
/>

<!-- Quick Edit Popover -->
<Popover
  anchor={popoverAnchor}
  type={popoverType}
  currentValue={popoverTask &&
    (popoverType === "status" ? popoverTask.status : popoverTask.priority)}
  bind:isOpen={showPopover}
  on:select={handlePopoverSelect}
  on:close={() => (showPopover = false)}
/>

<!-- Confirmation Dialog -->
<ConfirmDialog
  bind:isOpen={showConfirmDialog}
  title="Delete Task"
  message={confirmTask
    ? `Are you sure you want to delete "${confirmTask.title}"? This action cannot be undone.`
    : ""}
  confirmText="Delete"
  cancelText="Cancel"
  type="danger"
  on:confirm={handleConfirmAction}
  on:cancel={() => (showConfirmDialog = false)}
/>

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
    cursor: pointer;
    transition: background-color 0.2s ease;
    align-items: center;
  }

  .task-row:hover {
    background-color: #f8f9fa;
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
    cursor: pointer;
    transition: opacity 0.2s ease;
    width: fit-content;
  }

  .priority-button:hover,
  .status-button:hover {
    opacity: 0.8;
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

  /* Chat section styling */
  .chat-section {
    /* Remove padding to make chat interface edge-to-edge */
    border-radius: 8px;
    overflow: hidden;
  }

  /* Override chat interface styling when embedded in landing page */
  .chat-section :global(.chat-container) {
    border: none;
    border-radius: 0;
    height: 450px; /* Slightly smaller than standalone */
  }
</style>
