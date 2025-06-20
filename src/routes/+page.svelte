<script>
  import { onMount } from "svelte";
  import { testConnection } from "$lib/supabase.js";

  let connectionStatus = "Testing...";
  let connectionDetails = "";

  onMount(async () => {
    const result = await testConnection();
    if (result.success) {
      connectionStatus = "✅ Supabase Connected!";
      connectionDetails = "";
    } else {
      connectionStatus = "❌ Connection Failed";
      connectionDetails = result.error || "Unknown error";
    }
  });
</script>

<h1>Welcome to Carole</h1>
<p>Your AI Personal Assistant &amp; Project Manager</p>

<div class="connection-status">
  <small>{connectionStatus}</small>
  {#if connectionDetails}
    <small class="error-details">({connectionDetails})</small>
  {/if}
</div>

<div class="priority-section">
  <h2>Top 3 Priorities</h2>
  <div class="priority-list">
    <div class="priority-item">Sample Task 1</div>
    <div class="priority-item">Sample Task 2</div>
    <div class="priority-item">Sample Task 3</div>
  </div>
</div>

<div class="chat-section">
  <h3>Chat with Carole</h3>
  <div class="chat-interface">
    <div class="chat-messages">
      <p>
        Hello! I'm Carole, your AI assistant. How can I help you manage your
        tasks today?
      </p>
    </div>
    <div class="chat-input">
      <input type="text" placeholder="Type your message..." />
      <button>Send</button>
    </div>
  </div>
</div>

<nav>
  <a href="/tasks">Browse All Tasks</a>
  <a href="/analytics">Analytics</a>
</nav>

<style>
  h1 {
    color: #333;
    margin-bottom: 0.5rem;
  }

  .priority-section {
    margin: 2rem 0;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
  }

  .priority-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .priority-item {
    padding: 0.75rem;
    background: #f5f5f5;
    border-radius: 4px;
    border-left: 4px solid #007acc;
  }

  .chat-section {
    margin: 2rem 0;
    padding: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
  }

  .chat-messages {
    min-height: 200px;
    padding: 1rem;
    background: #f9f9f9;
    border-radius: 4px;
    margin-bottom: 1rem;
  }

  .chat-input {
    display: flex;
    gap: 0.5rem;
  }

  .chat-input input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .chat-input button {
    padding: 0.5rem 1rem;
    background: #007acc;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  nav {
    margin-top: 2rem;
    display: flex;
    gap: 1rem;
  }

  nav a {
    padding: 0.5rem 1rem;
    background: #f0f0f0;
    text-decoration: none;
    border-radius: 4px;
    color: #333;
  }

  nav a:hover {
    background: #e0e0e0;
  }
</style>
