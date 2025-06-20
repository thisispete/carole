<script>
  /**
   * BOSS UI Badge Component Wrapper
   */

  export let variant = "default"; // default, success, warning, error, outline
  export let class_ = "";

  $: classes = ["boss-badge", `boss-badge--${variant}`, class_]
    .filter(Boolean)
    .join(" ");
</script>

<span class={classes} {...$$restProps}>
  <slot />
</span>
