<script>
  import { createEventDispatcher } from "svelte";
  import Modal from "./Modal.svelte";

  export let isOpen = false;
  export let title = "Confirm Action";
  export let message = "Are you sure you want to proceed?";
  export let confirmText = "Confirm";
  export let cancelText = "Cancel";
  export let type = "default"; // 'default', 'danger', 'warning'

  const dispatch = createEventDispatcher();

  function handleConfirm() {
    dispatch("confirm");
    isOpen = false;
  }

  function handleCancel() {
    dispatch("cancel");
    isOpen = false;
  }

  function handleClose() {
    handleCancel();
  }
</script>

<Modal {isOpen} {title} on:close={handleClose}>
  <div class="confirm-dialog">
    <div class="message">
      {message}
    </div>

    <div class="actions">
      <button class="btn btn-secondary" on:click={handleCancel}>
        {cancelText}
      </button>

      <button
        class="btn btn-primary"
        class:btn-danger={type === "danger"}
        class:btn-warning={type === "warning"}
        on:click={handleConfirm}
      >
        {confirmText}
      </button>
    </div>
  </div>
</Modal>

<style>
  .confirm-dialog {
    text-align: center;
  }

  .message {
    margin-bottom: 2rem;
    font-size: 1rem;
    line-height: 1.5;
    color: #333;
  }

  .actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 100px;
  }

  .btn-secondary {
    background: #f8f9fa;
    color: #6c757d;
    border: 1px solid #dee2e6;
  }

  .btn-secondary:hover {
    background: #e9ecef;
    color: #495057;
  }

  .btn-primary {
    background: #007acc;
    color: white;
  }

  .btn-primary:hover {
    background: #0056b3;
  }

  .btn-danger {
    background: #dc3545;
    color: white;
  }

  .btn-danger:hover {
    background: #c82333;
  }

  .btn-warning {
    background: #fd7e14;
    color: white;
  }

  .btn-warning:hover {
    background: #e55a00;
  }
</style>
