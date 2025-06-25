<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { updateTask, deleteTask } from "$lib/taskService.js";
  import Modal from "../ui/Modal.svelte";
  import Button from "../boss-ui/Button.svelte";

  // Force Tailwind to include danger variant: boss-button--danger

  export let task: any = null;
  export let isOpen: boolean = false;

  const dispatch = createEventDispatcher();

  // Local task data for editing
  let editableTask: any = {};
  let saving: boolean = false;
  let saveError: string | null = null;
  let deleting: boolean = false;
  let completing: boolean = false;

  // Watch for task changes and update editable copy
  $: if (task) {
    editableTask = { ...task };
  }

  async function saveField(field: string, value: any) {
    if (!task || saving) return;

    saving = true;
    saveError = null;

    try {
      const result = await updateTask(task.id, { [field]: value });
      if (result.success) {
        // Update the task in parent component
        dispatch("taskUpdated", result.data);
        editableTask = { ...result.data };
      } else {
        saveError = result.error || "Failed to save changes";
        // Revert the field
        editableTask[field] = task[field];
      }
    } catch (error) {
      saveError = "Failed to save changes";
      editableTask[field] = task[field];
    } finally {
      saving = false;
    }
  }

  async function handleCompleteTask() {
    if (!task || completing || task.status === "done") return;

    completing = true;
    saveError = null;

    try {
      const result = await updateTask(task.id, { status: "done" });
      if (result.success) {
        dispatch("taskUpdated", result.data);
        editableTask = { ...result.data };
        // Show success message and close after a brief delay
        setTimeout(() => {
          handleClose();
        }, 500);
      } else {
        saveError = result.error || "Failed to complete task";
      }
    } catch (error) {
      saveError = "Failed to complete task";
    } finally {
      completing = false;
    }
  }

  async function handleDeleteTask() {
    if (!task || deleting) return;

    // Show confirmation dialog
    const confirmed = confirm(
      `Are you sure you want to delete "${task.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    deleting = true;
    saveError = null;

    try {
      const result = await deleteTask(task.id);
      if (result.success) {
        dispatch("taskDeleted", task);
        handleClose();
      } else {
        saveError = result.error || "Failed to delete task";
      }
    } catch (error) {
      saveError = "Failed to delete task";
    } finally {
      deleting = false;
    }
  }

  function handleClose() {
    isOpen = false;
    dispatch("close");
  }

  function handleTitleBlur(event) {
    const newTitle = event.target.value.trim();
    if (newTitle && newTitle !== task.title) {
      saveField("title", newTitle);
    }
  }

  function handleDescriptionBlur(event) {
    const newDescription = event.target.value.trim();
    if (newDescription !== task.description) {
      saveField("description", newDescription);
    }
  }

  function handlePriorityChange(event) {
    const newPriority = parseInt(event.target.value);
    if (newPriority !== task.priority) {
      saveField("priority", newPriority);
    }
  }

  function handleStatusChange(event) {
    const newStatus = event.target.value;
    if (newStatus !== task.status) {
      saveField("status", newStatus);
    }
  }

  function handleDueDateChange(event) {
    const newDueDate = event.target.value || null;
    if (newDueDate !== task.due_date) {
      saveField("due_date", newDueDate);
    }
  }

  function handleTimeEstimateChange(event) {
    const newTimeEstimate = parseFloat(event.target.value) || null;
    if (newTimeEstimate !== task.time_estimate_hours) {
      saveField("time_estimate_hours", newTimeEstimate);
    }
  }

  function handleDifficultyChange(event) {
    const newDifficulty = parseInt(event.target.value);
    if (newDifficulty !== task.difficulty_level) {
      saveField("difficulty_level", newDifficulty);
    }
  }

  function handleTagsChange(event) {
    const tagsString = event.target.value;
    const newTags = tagsString
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    if (JSON.stringify(newTags) !== JSON.stringify(task.context_tags || [])) {
      saveField("context_tags", newTags);
    }
  }

  function handleLocationsChange(event) {
    const locationsString = event.target.value;
    const newLocations = locationsString
      .split(",")
      .map((loc) => loc.trim())
      .filter((loc) => loc.length > 0);
    if (JSON.stringify(newLocations) !== JSON.stringify(task.locations || [])) {
      saveField("locations", newLocations);
    }
  }

  function formatDateForInput(dateString) {
    if (!dateString) return "";
    return dateString.split("T")[0]; // Format YYYY-MM-DD for input[type="date"]
  }
</script>

<Modal {isOpen} title="Task Details" on:close={handleClose}>
  {#if task}
    <div class="task-form">
      {#if saveError}
        <div class="error-message">
          {saveError}
        </div>
      {/if}

      <div class="form-group">
        <label for="task-title">Title</label>
        <input
          id="task-title"
          type="text"
          bind:value={editableTask.title}
          on:blur={handleTitleBlur}
          class="title-input"
          placeholder="Enter task title"
        />
      </div>

      <div class="form-group">
        <label for="task-description">Description</label>
        <textarea
          id="task-description"
          bind:value={editableTask.description}
          on:blur={handleDescriptionBlur}
          placeholder="Enter task description"
          rows="4"
        ></textarea>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="task-priority">Priority (1-10)</label>
          <select
            id="task-priority"
            bind:value={editableTask.priority}
            on:change={handlePriorityChange}
          >
            {#each Array(10) as _, i}
              <option value={i + 1}>P{i + 1}</option>
            {/each}
          </select>
        </div>

        <div class="form-group">
          <label for="task-status">Status</label>
          <select
            id="task-status"
            bind:value={editableTask.status}
            on:change={handleStatusChange}
          >
            <option value="backlog">Backlog</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="blocked">Blocked</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="task-due-date">Due Date</label>
          <input
            id="task-due-date"
            type="date"
            value={formatDateForInput(editableTask.due_date)}
            on:change={handleDueDateChange}
          />
        </div>

        <div class="form-group">
          <label for="task-time-estimate">Time Estimate (hours)</label>
          <input
            id="task-time-estimate"
            type="number"
            step="0.5"
            min="0"
            bind:value={editableTask.time_estimate_hours}
            on:change={handleTimeEstimateChange}
            placeholder="0"
          />
        </div>
      </div>

      <div class="form-group">
        <label for="task-difficulty">Difficulty Level (1-10)</label>
        <select
          id="task-difficulty"
          bind:value={editableTask.difficulty_level}
          on:change={handleDifficultyChange}
        >
          {#each Array(10) as _, i}
            <option value={i + 1}>Level {i + 1}</option>
          {/each}
        </select>
      </div>

      <div class="form-group">
        <label for="task-tags">Tags (comma-separated)</label>
        <input
          id="task-tags"
          type="text"
          value={editableTask.context_tags
            ? editableTask.context_tags.join(", ")
            : ""}
          on:blur={handleTagsChange}
          placeholder="work, urgent, health"
        />
      </div>

      <div class="form-group">
        <label for="task-locations">Locations (comma-separated)</label>
        <input
          id="task-locations"
          type="text"
          value={editableTask.locations
            ? editableTask.locations.join(", ")
            : ""}
          on:blur={handleLocationsChange}
          placeholder="office, home, remote"
        />
      </div>

      {#if saving}
        <div class="saving-indicator">Saving changes...</div>
      {/if}

      <!-- Action Buttons -->
      <div class="action-buttons">
        <div class="action-buttons__primary">
          <Button
            variant="primary"
            size="md"
            disabled={completing || task.status === "done"}
            onclick={handleCompleteTask}
          >
            {#if completing}
              Completing...
            {:else if task.status === "done"}
              ✓ Completed
            {:else}
              Mark Complete
            {/if}
          </Button>
        </div>

        <div class="action-buttons__danger">
          <button
            class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-10 px-4 py-2 bg-red-600 text-white hover:bg-red-700 disabled:pointer-events-none disabled:opacity-50"
            disabled={deleting}
            on:click={handleDeleteTask}
          >
            {#if deleting}
              Deleting...
            {:else}
              Delete Task
            {/if}
          </button>
        </div>
      </div>
    </div>
  {/if}
</Modal>

<style>
  .task-form {
    max-width: 100%;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #333;
  }

  input,
  textarea,
  select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    transition: border-color 0.2s ease;
  }

  input:focus,
  textarea:focus,
  select:focus {
    outline: none;
    border-color: #007acc;
    box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
  }

  .title-input {
    font-size: 1.1rem;
    font-weight: 600;
  }

  textarea {
    resize: vertical;
    min-height: 100px;
  }

  .error-message {
    background: #ffe6e6;
    color: #cc0000;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }

  .saving-indicator {
    background: #e3f2fd;
    color: #1565c0;
    padding: 0.5rem;
    border-radius: 4px;
    text-align: center;
    font-size: 0.9rem;
    margin-top: 1rem;
  }

  .action-buttons {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #eee;
  }

  .action-buttons__primary {
    flex: 0 0 auto;
  }

  .action-buttons__danger {
    flex: 0 0 auto;
    margin-left: auto;
  }

  /* Responsive adjustments */
  @media (max-width: 640px) {
    .action-buttons {
      flex-direction: column;
      align-items: stretch;
    }

    .action-buttons__primary,
    .action-buttons__danger {
      flex: none;
      margin-left: 0;
    }

    .action-buttons__danger {
      order: 2;
    }

    .action-buttons__primary {
      order: 1;
    }
  }
</style>
