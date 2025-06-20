<script>
  /**
   * BOSS UI Input Component Wrapper
   */

  export let value = "";
  export let type = "text";
  export let placeholder = "";
  export let disabled = false;
  export let class_ = "";

  $: classes = ["boss-input", class_].filter(Boolean).join(" ");
</script>

<input
  class={classes}
  {type}
  {placeholder}
  {disabled}
  bind:value
  {...$$restProps}
/>
