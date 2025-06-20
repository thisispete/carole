<script>
  /**
   * BOSS UI Button Component Wrapper
   * This component bridges the gap between React BOSS UI and Svelte
   * Can be easily replaced with actual BOSS UI components when available
   */

  export let variant = "primary"; // primary, secondary, outline, ghost
  export let size = "md"; // sm, md, lg
  export let disabled = false;
  export let type = "button";
  export let onclick = null;

  // Build CSS classes
  $: classes = [
    "boss-button",
    `boss-button--${variant}`,
    `boss-button--${size}`,
    disabled ? "opacity-50 cursor-not-allowed" : "",
  ]
    .filter(Boolean)
    .join(" ");
</script>

<button class={classes} {type} {disabled} on:click={onclick} {...$$restProps}>
  <slot />
</button>
