<script>
  import { onMount } from "svelte";
  import { databricksService } from "../databricksService";
  import { testConnection } from "../supabase.js";

  /** @type {Array<{service: string, error: string, icon: string}>} */
  let connectionIssues = [];
  let isChecking = true;

  onMount(async () => {
    await checkConnections();
  });

  async function checkConnections() {
    isChecking = true;
    connectionIssues = [];

    try {
      // Check Databricks connection
      const databricksResult = await databricksService.testConnection();
      if (!databricksResult.success) {
        connectionIssues.push({
          service: "Databricks AI",
          error: databricksResult.error || "Connection failed",
          icon: "🤖",
        });
      }

      // Check Supabase connection
      const supabaseResult = await testConnection();
      if (!supabaseResult.success) {
        connectionIssues.push({
          service: "Database",
          error: supabaseResult.error || "Connection failed",
          icon: "🗄️",
        });
      }
    } catch (error) {
      connectionIssues.push({
        service: "System",
        error: "Failed to check connections",
        icon: "⚠️",
      });
    } finally {
      isChecking = false;
    }
  }
</script>

{#if isChecking}
  <div class="connection-status checking">
    <div class="flex items-center gap-2">
      <div
        class="animate-spin rounded-full border-2 border-gray-300 border-t-orange-500 w-4 h-4"
      ></div>
      <span class="text-sm text-gray-600">Checking connections...</span>
    </div>
  </div>
{:else if connectionIssues.length > 0}
  <div class="connection-status error">
    <div class="flex items-center gap-2 mb-2">
      <span class="text-red-600">⚠️</span>
      <span class="text-sm font-medium text-red-800">Connection Issues</span>
      <button
        on:click={checkConnections}
        class="text-xs text-red-600 hover:text-red-800 underline"
      >
        Retry
      </button>
    </div>
    <div class="space-y-1">
      {#each connectionIssues as issue}
        <div class="flex items-center gap-2 text-xs text-red-700">
          <span>{issue.icon}</span>
          <span class="font-medium">{issue.service}:</span>
          <span>{issue.error}</span>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .connection-status {
    @apply rounded-lg p-3 border;
  }

  .connection-status.checking {
    @apply bg-orange-50 border-orange-200;
  }

  .connection-status.error {
    @apply bg-red-50 border-red-200;
  }
</style>
