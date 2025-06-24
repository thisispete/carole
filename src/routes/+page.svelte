<script lang="ts">
  import { onMount } from "svelte";
  import { getTopPriorityTasks } from "$lib/taskService.js";
  import ChatInterface from "$lib/components/ChatInterface.svelte";
  import ConnectionStatus from "$lib/components/ConnectionStatus.svelte";

  let priorityTasks: any[] = [];
  let tasksLoading = true;
  let tasksError = "";

  // Add refresh function
  function onTaskChange() {
    console.log("🔄 Refreshing priority tasks...");
    tasksLoading = true;

    // Add a small delay to ensure database transaction is committed
    setTimeout(() => {
      getTopPriorityTasks(3).then((tasksResult) => {
        if (tasksResult.success) {
          console.log("📋 Priority tasks refreshed:", tasksResult.data);
          priorityTasks = tasksResult.data;
          tasksError = "";
        } else {
          tasksError = tasksResult.error || "Unknown error";
          priorityTasks = [];
        }
        tasksLoading = false;
      });
    }, 500);
  }

  onMount(async () => {
    // Fetch priority tasks
    await onTaskChange();
  });

  function getStatusColor(status: string) {
    const colors: Record<string, string> = {
      todo: "#007acc",
      in_progress: "#ff9500",
      blocked: "#ff3b30",
      done: "#34c759",
      backlog: "#8e8e93",
    };
    return colors[status] || "#007acc";
  }
</script>

<div class="max-w-4xl mx-auto p-6 space-y-8">
  <!-- Header -->
  <header class="bg-white shadow-sm border-b p-4 rounded-lg">
    <nav class="flex items-center justify-between">
      <div class="text-2xl font-bold text-blue-600">Carole</div>
      <div class="hidden md:flex space-x-8">
        <a href="/" class="text-blue-600 border-b-2 border-blue-600 pb-1"
          >Home</a
        >
        <a
          href="/tasks"
          class="text-gray-600 hover:text-blue-600 transition-colors pb-1"
          >Tasks</a
        >
        <a
          href="/analytics"
          class="text-gray-600 hover:text-blue-600 transition-colors pb-1"
          >Analytics</a
        >
      </div>
    </nav>
  </header>

  <!-- Connection Status -->
  <ConnectionStatus />

  <!-- Priority Dashboard Section -->
  <div class="bg-white rounded-lg shadow-sm border">
    <div class="p-6 border-b">
      <h2 class="text-2xl font-semibold">Top 3 Priorities</h2>
      <p class="text-sm text-gray-600">Your most important tasks right now</p>
    </div>
    <div class="p-6">
      <div class="space-y-3">
        {#if tasksLoading}
          <div class="flex items-center justify-center py-8">
            <div
              class="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 w-6 h-6"
            ></div>
            <span class="ml-2 text-gray-600">Loading tasks...</span>
          </div>
        {:else if tasksError}
          <div class="text-center py-8">
            <span
              class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-red-600 text-white"
            >
              Error: {tasksError}
            </span>
          </div>
        {:else if priorityTasks.length === 0}
          <div class="text-center py-8 text-gray-600">
            No active tasks found. Try asking the AI assistant to create some
            tasks!
          </div>
        {:else}
          {#each priorityTasks as task}
            <div
              class="bg-white rounded-lg border shadow-sm p-4 transition-all duration-200 hover:shadow-md border-l-4"
              style="border-left-color: {getStatusColor(task.status)}"
            >
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-medium text-gray-800">{task.title}</h3>
                <div class="flex items-center gap-2">
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-800"
                  >
                    P{task.priority}
                  </span>
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold {task.status ===
                    'done'
                      ? 'bg-green-600 text-white'
                      : task.status === 'blocked'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-900 text-white'}"
                  >
                    {task.status.replace("_", " ")}
                  </span>
                </div>
              </div>
              {#if task.context_tags && task.context_tags.length > 0}
                <div class="flex flex-wrap gap-1">
                  {#each task.context_tags.slice(0, 3) as tag}
                    <span
                      class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                      >{tag}</span
                    >
                  {/each}
                </div>
              {/if}
              {#if task.due_date}
                <div class="mt-2 text-xs text-gray-500">
                  Due: {new Date(task.due_date).toLocaleDateString()}
                </div>
              {/if}
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </div>

  <!-- AI Chat Interface Section -->
  <div class="bg-white rounded-lg shadow-sm border">
    <div class="p-6">
      <ChatInterface on:taskChanged={onTaskChange} />
    </div>
  </div>
</div>

<style lang="scss">
  /* Custom styles for landing page */
</style>
