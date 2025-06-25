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
  const filters = [
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
    filters.forEach((filter) => {
      switch (filter.id) {
        case "all":
          filter.count = tasks.length;
          break;
        case "todo":
          filter.count = tasks.filter((t) => t.status === "todo").length;
          break;
        case "in_progress":
          filter.count = tasks.filter((t) => t.status === "in_progress").length;
          break;
        case "blocked":
          filter.count = tasks.filter((t) => t.status === "blocked").length;
          break;
        case "high_priority":
          filter.count = tasks.filter((t) => t.priority >= 8).length;
          break;
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

<h1>Task Browser</h1>
<p>Manage and organize all your tasks</p>

<div class="task-filters">
  <h2>Quick Filters</h2>
  <div class="filter-buttons">
    {#each filters as filter}
      <button
        class="filter-btn"
        class:active={selectedFilter === filter.id}
        on:click={() => selectFilter(filter.id)}
      >
        {filter.label}
        {#if filter.count > 0}
          <span class="count">({filter.count})</span>
        {/if}
      </button>
    {/each}
  </div>
</div>

<div class="task-list">
  <h2>
    {#if selectedFilter === "all"}
      All Tasks
    {:else}
      {filters.find((f) => f.id === selectedFilter)?.label || "Tasks"}
    {/if}
    ({filteredTasks.length})
  </h2>

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
    <div class="task-grid">
      {#each filteredTasks as task (task.id)}
        <div
          class="task-card"
          data-task-id={task.id}
          on:click={() => handleTaskClick(task)}
          on:contextmenu={(e) => handleRightClick(e, task)}
          role="button"
          tabindex="0"
        >
          <h3>{task.title}</h3>
          {#if task.description}
            <p class="description">{task.description}</p>
          {/if}

          <div class="task-meta">
            <button
              class="priority {getPriorityClass(task.priority)}"
              on:click={(e) => handlePriorityClick(e, task)}
            >
              {getPriorityLabel(task.priority)} Priority (P{task.priority})
            </button>

            <button class="status" on:click={(e) => handleStatusClick(e, task)}>
              {getStatusLabel(task.status)}
            </button>
          </div>

          {#if task.context_tags && task.context_tags.length > 0}
            <div class="tags">
              {#each task.context_tags as tag}
                <span class="tag">{tag}</span>
              {/each}
            </div>
          {/if}

          {#if task.due_date}
            <div class="due-date">
              Due: {formatDate(task.due_date)}
            </div>
          {/if}
        </div>
      {/each}
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

<nav>
  <a href="/">← Back to Dashboard</a>
  <a href="/analytics">Analytics</a>
</nav>

<style>
  .task-filters {
    margin: 2rem 0;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
  }

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
    opacity: 0.8;
  }

  .task-list {
    margin: 2rem 0;
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

  .task-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }

  .task-card {
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .task-card:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  }

  .task-card h3 {
    margin: 0 0 0.5rem 0;
    color: #333;
  }

  .task-card .description {
    margin: 0 0 1rem 0;
    color: #666;
    font-size: 0.9rem;
    line-height: 1.4;
  }

  .task-meta {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .priority,
  .status {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: bold;
    border: none;
    cursor: pointer;
    transition: opacity 0.2s ease;
  }

  .priority:hover,
  .status:hover {
    opacity: 0.8;
  }

  .priority.high {
    background: #ffe6e6;
    color: #cc0000;
  }

  .priority.medium {
    background: #fff3e0;
    color: #e65100;
  }

  .priority.low {
    background: #e8f5e8;
    color: #2e7d32;
  }

  .status {
    background: #f0f0f0;
    color: #333;
  }

  .tags {
    display: flex;
    gap: 0.25rem;
    flex-wrap: wrap;
    margin-bottom: 0.5rem;
  }

  .tag {
    padding: 0.15rem 0.4rem;
    background: #e3f2fd;
    color: #1565c0;
    border-radius: 3px;
    font-size: 0.7rem;
  }

  .due-date {
    font-size: 0.8rem;
    color: #666;
    font-style: italic;
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
