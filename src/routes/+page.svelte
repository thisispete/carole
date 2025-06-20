<script lang="ts">
  import { onMount } from "svelte";
  import { testConnection } from "$lib/supabase.js";
  import { getTopPriorityTasks, debugAllTasks } from "$lib/taskService.js";

  let connectionStatus = "Testing...";
  let connectionDetails = "";
  let priorityTasks: any[] = [];
  let tasksLoading = true;
  let tasksError = "";
  let chatMessage = "";

  onMount(async () => {
    // Test connection
    const result = await testConnection();
    if (result.success) {
      connectionStatus = "✅ Supabase Connected!";
      connectionDetails = "";
    } else {
      connectionStatus = "❌ Connection Failed";
      connectionDetails = result.error || "Unknown error";
    }

    // Fetch priority tasks
    const tasksResult = await getTopPriorityTasks(3);
    if (tasksResult.success) {
      priorityTasks = tasksResult.data;
      tasksError = "";
    } else {
      tasksError = tasksResult.error || "Unknown error";
      priorityTasks = [];
    }
    tasksLoading = false;

    // Debug: Show all tasks in console
    await debugAllTasks();
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

  function handleSendMessage() {
    if (chatMessage.trim()) {
      // TODO: Implement chat functionality
      console.log("Sending message:", chatMessage);
      chatMessage = "";
    }
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

  <!-- Welcome Section -->
  <div class="bg-white rounded-lg shadow-sm border p-6">
    <h1 class="text-3xl font-bold text-gray-800 mb-2">Welcome to Carole</h1>
    <p class="text-gray-600 mb-4">
      Your AI Personal Assistant &amp; Project Manager
    </p>

    <div class="flex items-center gap-2">
      <span
        class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold {connectionStatus.includes(
          '✅'
        )
          ? 'bg-green-600 text-white'
          : 'bg-red-600 text-white'}"
      >
        {connectionStatus}
      </span>
      {#if connectionDetails}
        <span class="text-sm text-red-600">({connectionDetails})</span>
      {/if}
    </div>
  </div>

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
            No active tasks found
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
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </div>

  <!-- Chat Interface Section -->
  <div class="bg-white rounded-lg shadow-sm border">
    <div class="p-6 border-b">
      <h3 class="text-2xl font-semibold">Chat with Carole</h3>
      <p class="text-sm text-gray-600">
        Get help with your tasks and priorities
      </p>
    </div>
    <div class="p-6">
      <div class="flex flex-col h-full bg-white rounded-lg border shadow-sm">
        <div class="flex-1 p-4 overflow-y-auto space-y-4 min-h-[200px]">
          <div class="flex gap-3 justify-start">
            <div
              class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-100 text-gray-800"
            >
              Hello! I'm Carole, your AI assistant. How can I help you manage
              your tasks today?
            </div>
          </div>
        </div>
        <div class="p-4 border-t bg-gray-50 rounded-b-lg">
          <div class="flex gap-2">
            <input
              bind:value={chatMessage}
              placeholder="Type your message..."
              class="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            />
            <button
              on:click={handleSendMessage}
              disabled={!chatMessage.trim()}
              class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-10 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Quiz Section (Placeholder) -->
  <div class="bg-white rounded-lg shadow-sm border">
    <div class="p-6 border-b">
      <h3 class="text-2xl font-semibold">Quick Check-in</h3>
      <p class="text-sm text-gray-600">
        Help me understand your current priorities
      </p>
    </div>
    <div class="p-6">
      <div class="text-gray-600 text-center py-4">
        Quiz interface will appear here when AI confidence is low
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  /* Custom styles for landing page using BOSS UI system */
  .text-boss-neutral {
    color: var(--boss-neutral);
  }

  .text-boss-secondary {
    color: var(--boss-secondary);
  }

  .text-boss-error {
    color: var(--boss-error);
  }
</style>
