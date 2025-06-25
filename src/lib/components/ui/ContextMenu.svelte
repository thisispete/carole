<script>
  import { createEventDispatcher } from "svelte";

  export let isOpen = false;
  export let x = 0;
  export let y = 0;
  export let task = null;

  const dispatch = createEventDispatcher();

  let menuElement;

  function handleClickOutside(event) {
    if (menuElement && !menuElement.contains(event.target)) {
      close();
    }
  }

  function close() {
    isOpen = false;
    dispatch("close");
  }

  function handleAction(action) {
    dispatch("action", { action, task });
    close();
  }

  // Close menu on scroll or resize
  function handleScroll() {
    close();
  }

  // Adjust position if menu would go off screen
  function adjustPosition() {
    if (!menuElement) return;

    const rect = menuElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Adjust horizontal position
    if (x + rect.width > viewportWidth) {
      x = viewportWidth - rect.width - 10;
    }

    // Adjust vertical position
    if (y + rect.height > viewportHeight) {
      y = y - rect.height;
    }
  }

  // Adjust position when menu opens
  $: if (isOpen && menuElement) {
    setTimeout(adjustPosition, 0);
  }
</script>

<svelte:window
  on:click={handleClickOutside}
  on:scroll={handleScroll}
  on:resize={handleScroll}
  on:keydown={(e) => e.key === "Escape" && close()}
/>

{#if isOpen && task}
  <div
    class="context-menu"
    bind:this={menuElement}
    style="left: {x}px; top: {y}px;"
    role="menu"
    tabindex="-1"
  >
    <button
      class="menu-item"
      on:click={() => handleAction("edit")}
      role="menuitem"
    >
      <span class="icon">✏️</span>
      Edit Task
    </button>

    <button
      class="menu-item"
      on:click={() => handleAction("complete")}
      role="menuitem"
      disabled={task.status === "done"}
    >
      <span class="icon">✅</span>
      Mark Complete
    </button>

    <button
      class="menu-item"
      on:click={() => handleAction("duplicate")}
      role="menuitem"
    >
      <span class="icon">📋</span>
      Duplicate Task
    </button>

    <div class="menu-separator"></div>

    <button
      class="menu-item priority-menu"
      on:click={() => handleAction("priority")}
      role="menuitem"
    >
      <span class="icon">🔥</span>
      Change Priority
      <span class="current-value">P{task.priority}</span>
    </button>

    <button
      class="menu-item status-menu"
      on:click={() => handleAction("status")}
      role="menuitem"
    >
      <span class="icon">📊</span>
      Change Status
      <span class="current-value">{task.status}</span>
    </button>

    <div class="menu-separator"></div>

    <button
      class="menu-item danger"
      on:click={() => handleAction("delete")}
      role="menuitem"
    >
      <span class="icon">🗑️</span>
      Delete Task
    </button>
  </div>
{/if}

<style>
  .context-menu {
    position: fixed;
    background: white;
    border: 1px solid #ddd;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 4px 0;
    min-width: 180px;
    z-index: 1000;
    animation: contextMenuAppear 0.15s ease-out;
  }

  .menu-item {
    width: 100%;
    padding: 8px 12px;
    border: none;
    background: none;
    text-align: left;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    color: #333;
    transition: background-color 0.1s ease;
  }

  .menu-item:hover:not(:disabled) {
    background: #f5f5f5;
  }

  .menu-item:disabled {
    color: #999;
    cursor: not-allowed;
  }

  .menu-item.danger:hover {
    background: #ffe6e6;
    color: #cc0000;
  }

  .icon {
    font-size: 1rem;
    width: 16px;
    text-align: center;
  }

  .current-value {
    margin-left: auto;
    font-size: 0.8rem;
    color: #666;
    background: #f0f0f0;
    padding: 2px 6px;
    border-radius: 3px;
  }

  .menu-separator {
    height: 1px;
    background: #eee;
    margin: 4px 0;
  }

  @keyframes contextMenuAppear {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(-5px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
</style>
