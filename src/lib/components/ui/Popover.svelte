<script>
  import { createEventDispatcher } from "svelte";

  export let isOpen = false;
  export let anchor = null;
  export let type = "status";
  export let currentValue = null;

  const dispatch = createEventDispatcher();

  let popoverElement;
  let position = { x: 0, y: 0 };

  const statusOptions = [
    { value: "backlog", label: "Backlog", color: "#6c757d" },
    { value: "todo", label: "To Do", color: "#007acc" },
    { value: "in_progress", label: "In Progress", color: "#28a745" },
    { value: "blocked", label: "Blocked", color: "#dc3545" },
    { value: "done", label: "Done", color: "#28a745" },
  ];

  const priorityOptions = Array.from({ length: 10 }, (_, i) => ({
    value: i + 1,
    label: `P${i + 1}`,
    color: i >= 7 ? "#dc3545" : i >= 4 ? "#fd7e14" : "#28a745",
  }));

  function handleClickOutside(event) {
    if (popoverElement && !popoverElement.contains(event.target)) {
      close();
    }
  }

  function close() {
    isOpen = false;
    dispatch("close");
  }

  function handleSelect(value) {
    dispatch("select", { type, value });
    close();
  }

  function calculatePosition() {
    if (!anchor || !popoverElement) return;

    const anchorRect = anchor.getBoundingClientRect();
    const popoverRect = popoverElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = anchorRect.left + anchorRect.width / 2 - popoverRect.width / 2;
    let y = anchorRect.bottom + 8;

    if (x + popoverRect.width > viewportWidth) {
      x = viewportWidth - popoverRect.width - 10;
    }

    if (x < 10) {
      x = 10;
    }

    if (y + popoverRect.height > viewportHeight) {
      y = anchorRect.top - popoverRect.height - 8;
    }

    position = { x, y };
  }

  $: if (isOpen && anchor && popoverElement) {
    setTimeout(calculatePosition, 0);
  }

  $: options = type === "status" ? statusOptions : priorityOptions;
</script>

<svelte:window
  on:click={handleClickOutside}
  on:keydown={(e) => e.key === "Escape" && close()}
/>

{#if isOpen}
  <div
    class="popover"
    bind:this={popoverElement}
    style="left: {position.x}px; top: {position.y}px;"
    role="menu"
  >
    <div class="popover-header">
      Change {type === "status" ? "Status" : "Priority"}
    </div>

    <div class="popover-content">
      {#each options as option}
        <button
          class="option-button"
          class:active={option.value === currentValue}
          style="--option-color: {option.color}"
          on:click={() => handleSelect(option.value)}
          role="menuitem"
        >
          <span class="option-indicator" style="background: {option.color}"
          ></span>
          <span class="option-label">{option.label}</span>
          {#if option.value === currentValue}
            <span class="current-indicator">✓</span>
          {/if}
        </button>
      {/each}
    </div>
  </div>
{/if}

<style>
  .popover {
    position: fixed;
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    animation: popoverAppear 0.2s ease-out;
    min-width: 160px;
    max-width: 200px;
  }

  .popover-header {
    padding: 12px 16px 8px;
    font-weight: 600;
    font-size: 0.9rem;
    color: #333;
    border-bottom: 1px solid #eee;
  }

  .popover-content {
    padding: 8px 0;
    max-height: 240px;
    overflow-y: auto;
  }

  .option-button {
    width: 100%;
    padding: 8px 16px;
    border: none;
    background: none;
    text-align: left;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.9rem;
    color: #333;
    transition: background-color 0.1s ease;
  }

  .option-button:hover {
    background: #f8f9fa;
  }

  .option-button.active {
    background: var(--option-color, #007acc);
    color: white;
  }

  .option-button.active .option-indicator {
    background: white !important;
  }

  .option-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .option-label {
    flex: 1;
  }

  .current-indicator {
    font-size: 0.8rem;
    font-weight: bold;
  }

  @keyframes popoverAppear {
    from {
      opacity: 0;
      transform: translateY(-10px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
</style>
