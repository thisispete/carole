<script>
  import { createEventDispatcher } from "svelte";

  export let isOpen = false;
  export let title = "";
  export let closeOnClickOutside = true;

  const dispatch = createEventDispatcher();

  let modalElement;

  function handleClickOutside(event) {
    if (
      closeOnClickOutside &&
      modalElement &&
      !modalElement.contains(event.target)
    ) {
      close();
    }
  }

  function close() {
    isOpen = false;
    dispatch("close");
  }

  function handleKeydown(event) {
    if (event.key === "Escape") {
      close();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <div
    class="modal-overlay"
    on:click={handleClickOutside}
    on:keydown={handleKeydown}
  >
    <div
      class="modal-content"
      bind:this={modalElement}
      role="dialog"
      aria-modal="true"
    >
      <div class="modal-header">
        {#if title}
          <h2 class="modal-title">{title}</h2>
        {/if}
        <button class="close-btn" on:click={close} aria-label="Close modal">
          ×
        </button>
      </div>

      <div class="modal-body">
        <slot />
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal-content {
    background: white;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    max-width: 600px;
    max-height: 90vh;
    width: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #eee;
    background: #f8f9fa;
  }

  .modal-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #333;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s ease;
  }

  .close-btn:hover {
    background: #e9ecef;
    color: #333;
  }

  .modal-body {
    padding: 1.5rem;
    overflow-y: auto;
    flex: 1;
  }

  /* Animation */
  .modal-overlay {
    animation: fadeIn 0.2s ease-out;
  }

  .modal-content {
    animation: slideIn 0.2s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
</style>
