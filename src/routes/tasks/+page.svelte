<script lang="ts">
  import { onMount } from "svelte";
  import { getTasks, updateTask, deleteTask } from "$lib/taskService.js";
  import TaskDetailModal from "$lib/components/task/TaskDetailModal.svelte";
  import CreateTaskModal from "$lib/components/task/CreateTaskModal.svelte";
  import ContextMenu from "$lib/components/ui/ContextMenu.svelte";
  import Popover from "$lib/components/ui/Popover.svelte";
  import ConfirmDialog from "$lib/components/ui/ConfirmDialog.svelte";

  let tasks: any[] = [];
  let loading = true;
  let error: string | null = null;
  let selectedFilter: string = "all";
  let selectedTask = null;
  let showTaskModal = false;

  // Context menu state
  let showContextMenu = false;
  let contextMenuX = 0;
  let contextMenuY = 0;
  let contextMenuTask = null;

  // Popover state
  let showPopover = false;
  let popoverAnchor = null;
  let popoverType = "status";
  let popoverTask = null;

  // Confirmation dialog state
  let showConfirmDialog = false;
  let confirmAction = null;
  let confirmTask = null;

  // Create task modal state
  let showCreateModal = false;

  // Filter options
  let filters = [
    { id: "all", label: "All Tasks", count: 0 },
    { id: "todo", label: "To Do", count: 0 },
    { id: "in_progress", label: "In Progress", count: 0 },
    { id: "blocked", label: "Blocked", count: 0 },
    { id: "high_priority", label: "High Priority", count: 0 },
  ];

  // Load tasks when component mounts
  onMount(async () => {
    await loadTasks();
  });

  async function loadTasks() {
    loading = true;
    error = null;

    try {
      const result = await getTasks();
      if (result.success) {
        tasks = result.data;
        updateFilterCounts();
      } else {
        error = result.error || "Unknown error";
      }
    } catch (err) {
      error = "Failed to load tasks";
      console.error("Error loading tasks:", err);
    } finally {
      loading = false;
    }
  }

  function updateFilterCounts() {
    // Update filter counts based on current tasks
    filters = filters.map((filter) => {
      switch (filter.id) {
        case "all":
          return { ...filter, count: tasks.length };
        case "todo":
          return {
            ...filter,
            count: tasks.filter((t) => t.status === "todo").length,
          };
        case "in_progress":
          return {
            ...filter,
            count: tasks.filter((t) => t.status === "in_progress").length,
          };
        case "blocked":
          return {
            ...filter,
            count: tasks.filter((t) => t.status === "blocked").length,
          };
        case "high_priority":
          return {
            ...filter,
            count: tasks.filter((t) => t.priority >= 8).length,
          };
        default:
          return filter;
      }
    });
  }

  // Filter tasks based on selected filter
  $: filteredTasks = tasks.filter((task) => {
    switch (selectedFilter) {
      case "all":
        return true;
      case "todo":
        return task.status === "todo";
      case "in_progress":
        return task.status === "in_progress";
      case "blocked":
        return task.status === "blocked";
      case "high_priority":
        return task.priority >= 8;
      default:
        return true;
    }
  });

  function selectFilter(filterId) {
    selectedFilter = filterId;
  }

  function getPriorityLabel(priority) {
    if (priority >= 8) return "High";
    if (priority >= 5) return "Medium";
    return "Low";
  }

  function getPriorityClass(priority) {
    if (priority >= 8) return "high";
    if (priority >= 5) return "medium";
    return "low";
  }

  function getStatusLabel(status) {
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

  function handleTaskClick(task) {
    selectedTask = task;
    showTaskModal = true;
  }

  function handleTaskUpdated(event) {
    const updatedTask = event.detail;
    // Update the task in our local tasks array
    tasks = tasks.map((task) =>
      task.id === updatedTask.id ? updatedTask : task
    );
    updateFilterCounts();
  }

  function handleTaskDeleted(event) {
    const deletedTask = event.detail;
    // Remove the task from our local tasks array
    tasks = tasks.filter((task) => task.id !== deletedTask.id);
    updateFilterCounts();
  }

  function handleStatusClick(event, task) {
    event.stopPropagation();
    popoverAnchor = event.target;
    popoverType = "status";
    popoverTask = task;
    showPopover = true;
  }

  function handlePriorityClick(event, task) {
    event.stopPropagation();
    popoverAnchor = event.target;
    popoverType = "priority";
    popoverTask = task;
    showPopover = true;
  }

  function handleRightClick(event, task) {
    event.preventDefault();
    contextMenuX = event.clientX;
    contextMenuY = event.clientY;
    contextMenuTask = task;
    showContextMenu = true;
  }

  function formatDate(dateString) {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  }

  // Handle new task creation
  function handleTaskCreated(event) {
    const newTask = event.detail;
    // Add to the beginning of the task list
    tasks = [newTask, ...tasks];
    updateFilterCounts();
  }

  // Context menu actions
  async function handleContextAction(event) {
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
          `[data-task-id="${task.id}"] .priority`
        );
        popoverType = "priority";
        popoverTask = task;
        showPopover = true;
        break;
      case "status":
        popoverAnchor = document.querySelector(
          `[data-task-id="${task.id}"] .status`
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
  async function handlePopoverSelect(event) {
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
  async function quickUpdateTask(taskId, updates) {
    try {
      const result = await updateTask(taskId, updates);
      if (result.success) {
        // Update local task list
        tasks = tasks.map((task) =>
          task.id === taskId ? { ...task, ...updates } : task
        );
        updateFilterCounts();
      } else {
        console.error("Failed to update task:", result.error);
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  }

  // Delete task action
  async function deleteTaskAction(taskId) {
    try {
      const result = await deleteTask(taskId);
      if (result.success) {
        // Remove from local task list
        tasks = tasks.filter((task) => task.id !== taskId);
        updateFilterCounts();
      } else {
        console.error("Failed to delete task:", result.error);
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  }

  // Duplicate task action
  async function duplicateTask(originalTask) {
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
        // Add to local task list
        tasks = [result.data, ...tasks];
        updateFilterCounts();
      } else {
        console.error("Failed to duplicate task:", result.error);
      }
    } catch (error) {
      console.error("Error duplicating task:", error);
    }
  }
</script>

<div class="bg-white rounded-lg shadow-sm border">
  <!-- Filter Header Section -->
  <div class="p-6 border-b">
    <div class="filter-buttons">
      {#each filters as filter}
        <button
          class="filter-btn"
          class:active={selectedFilter === filter.id}
          on:click={() => selectFilter(filter.id)}
        >
          {filter.label}
          <span class="count">({filter.count})</span>
        </button>
      {/each}
    </div>
  </div>

  {#if loading}
    <div class="loading">Loading tasks...</div>
  {:else if error}
    <div class="error">
      <p>Error loading tasks: {error}</p>
      <button on:click={loadTasks} class="retry-btn">Retry</button>
    </div>
  {:else if filteredTasks.length === 0}
    <div class="empty-state">
      <p>No tasks found</p>
      {#if selectedFilter !== "all"}
        <button on:click={() => selectFilter("all")} class="filter-btn"
          >Show All Tasks</button
        >
      {/if}
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
        {#each filteredTasks as task (task.id)}
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
                    <span class="tag-more">+{task.context_tags.length - 2}</span
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

<div class="add-task">
  <button class="add-btn" on:click={() => (showCreateModal = true)}
    >+ Add New Task</button
  >
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

<!-- Create Task Modal -->
<CreateTaskModal
  bind:isOpen={showCreateModal}
  on:taskCreated={handleTaskCreated}
  on:close={() => (showCreateModal = false)}
/>

<style>
  .filter-buttons {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .filter-btn {
    padding: 0.5rem 1rem;
    border: 1px solid #ccc;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .filter-btn.active {
    background: #007acc;
    color: white;
    border-color: #007acc;
  }

  .filter-btn:hover:not(.active) {
    background: #f5f5f5;
  }

  .count {
    font-size: 0.8em;
    opacity: 0.7;
    margin-left: 0.25rem;
  }

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

  .retry-btn {
    padding: 0.5rem 1rem;
    background: #007acc;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 1rem;
  }

  .task-list-container {
    border: none;
    border-radius: 0;
    background: white;
    overflow: hidden;
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

  .add-task {
    margin: 2rem 0;
    text-align: center;
  }

  .add-btn {
    padding: 1rem 2rem;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1.1rem;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .add-btn:hover {
    background: #218838;
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
    transition: background 0.2s ease;
  }

  nav a:hover {
    background: #e0e0e0;
  }
</style>
