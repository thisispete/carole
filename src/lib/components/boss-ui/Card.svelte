<script>
  /**
   * BOSS UI Card Component Wrapper
   * This component bridges the gap between React BOSS UI and Svelte
   */

  export let class_ = "";
</script>

<div class="boss-card {class_}" {...$$restProps}>
  <slot />
</div>
