<script>
  import { createEventDispatcher } from "svelte";
  import { createTask } from "$lib/taskService.js";
  import Modal from "../ui/Modal.svelte";

  export let isOpen = false;

  const dispatch = createEventDispatcher();

  // Form data
  let formData = {
    title: "",
    description: "",
    priority: 5,
    difficulty_level: 5,
    status: "todo",
    context_tags: [],
    locations: [],
    due_date: "",
    time_estimate_hours: null,
  };

  let saving = false;
  let error = null;

  function resetForm() {
    formData = {
      title: "",
      description: "",
      priority: 5,
      difficulty_level: 5,
      status: "todo",
      context_tags: [],
      locations: [],
      due_date: "",
      time_estimate_hours: null,
    };
    error = null;
  }

  function handleClose() {
    resetForm();
    isOpen = false;
    dispatch("close");
  }

  async function handleSubmit() {
    if (!formData.title.trim()) {
      error = "Title is required";
      return;
    }

    saving = true;
    error = null;

    try {
      const taskData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        due_date: formData.due_date || null,
        time_estimate_hours: formData.time_estimate_hours || null,
      };

      const result = await createTask(taskData);
      if (result.success) {
        dispatch("taskCreated", result.data);
        handleClose();
      } else {
        error = result.error || "Failed to create task";
      }
    } catch (err) {
      error = "Failed to create task";
      console.error("Error creating task:", err);
    } finally {
      saving = false;
    }
  }

  function handleTagsInput(event) {
    const value = event.target.value;
    formData.context_tags = value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }

  function handleLocationsInput(event) {
    const value = event.target.value;
    formData.locations = value
      .split(",")
      .map((loc) => loc.trim())
      .filter((loc) => loc.length > 0);
  }

  function handleKeydown(event) {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      handleSubmit();
    }
  }
</script>

<Modal {isOpen} title="Create New Task" on:close={handleClose}>
  <form on:submit|preventDefault={handleSubmit} on:keydown={handleKeydown}>
    {#if error}
      <div class="error-message">
        {error}
      </div>
    {/if}

    <div class="form-group">
      <label for="new-task-title">Title *</label>
      <input
        id="new-task-title"
        type="text"
        bind:value={formData.title}
        placeholder="Enter task title"
        class="title-input"
        required
        autofocus
      />
    </div>

    <div class="form-group">
      <label for="new-task-description">Description</label>
      <textarea
        id="new-task-description"
        bind:value={formData.description}
        placeholder="Enter task description"
        rows="3"
      ></textarea>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="new-task-priority">Priority (1-10)</label>
        <select id="new-task-priority" bind:value={formData.priority}>
          {#each Array(10) as _, i}
            <option value={i + 1}>P{i + 1}</option>
          {/each}
        </select>
      </div>

      <div class="form-group">
        <label for="new-task-status">Status</label>
        <select id="new-task-status" bind:value={formData.status}>
          <option value="backlog">Backlog</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="new-task-due-date">Due Date</label>
        <input
          id="new-task-due-date"
          type="date"
          bind:value={formData.due_date}
        />
      </div>

      <div class="form-group">
        <label for="new-task-time-estimate">Time Estimate (hours)</label>
        <input
          id="new-task-time-estimate"
          type="number"
          step="0.5"
          min="0"
          bind:value={formData.time_estimate_hours}
          placeholder="0"
        />
      </div>
    </div>

    <div class="form-group">
      <label for="new-task-difficulty">Difficulty Level (1-10)</label>
      <select id="new-task-difficulty" bind:value={formData.difficulty_level}>
        {#each Array(10) as _, i}
          <option value={i + 1}>Level {i + 1}</option>
        {/each}
      </select>
    </div>

    <div class="form-group">
      <label for="new-task-tags">Tags (comma-separated)</label>
      <input
        id="new-task-tags"
        type="text"
        value={formData.context_tags.join(", ")}
        on:input={handleTagsInput}
        placeholder="work, urgent, health"
      />
    </div>

    <div class="form-group">
      <label for="new-task-locations">Locations (comma-separated)</label>
      <input
        id="new-task-locations"
        type="text"
        value={formData.locations.join(", ")}
        on:input={handleLocationsInput}
        placeholder="office, home, remote"
      />
    </div>

    <div class="form-actions">
      <button
        type="button"
        class="btn btn-secondary"
        on:click={handleClose}
        disabled={saving}
      >
        Cancel
      </button>

      <button
        type="submit"
        class="btn btn-primary"
        disabled={saving || !formData.title.trim()}
      >
        {saving ? "Creating..." : "Create Task"}
      </button>
    </div>

    <div class="form-hint">
      <small>Tip: Use Cmd/Ctrl + Enter to quickly create the task</small>
    </div>
  </form>
</Modal>

<style>
  .form-group {
    margin-bottom: 1rem;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
  }

  .form-hint {
    text-align: center;
    margin-top: 0.5rem;
  }

  .form-hint small {
    color: #666;
    font-size: 0.8rem;
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
    min-height: 80px;
  }

  .error-message {
    background: #ffe6e6;
    color: #cc0000;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }

  .btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 120px;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-secondary {
    background: #f8f9fa;
    color: #6c757d;
    border: 1px solid #dee2e6;
  }

  .btn-secondary:hover:not(:disabled) {
    background: #e9ecef;
    color: #495057;
  }

  .btn-primary {
    background: #007acc;
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: #0056b3;
  }
</style>
