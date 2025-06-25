<script>
  import "../app.css";
  import { page } from "$app/stores";
  import ConnectionStatus from "$lib/components/ConnectionStatus.svelte";

  // Get current route for active navigation styling
  $: currentPath = $page.url.pathname;

  // Mobile menu toggle
  let mobileMenuOpen = false;

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }
</script>

<!-- Universal Navigation Header -->
<header class="bg-white shadow-sm border-b p-4 rounded-lg mb-6">
  <nav class="flex items-center justify-between max-w-6xl mx-auto">
    <div class="text-2xl font-bold text-blue-600">Carole</div>
    <!-- Desktop Navigation -->
    <div class="hidden md:flex space-x-8">
      <a
        href="/"
        class="{currentPath === '/'
          ? 'text-blue-600 border-b-2 border-blue-600'
          : 'text-gray-600 hover:text-blue-600 transition-colors'} pb-1"
      >
        Home
      </a>
      <a
        href="/tasks"
        class="{currentPath === '/tasks'
          ? 'text-blue-600 border-b-2 border-blue-600'
          : 'text-gray-600 hover:text-blue-600 transition-colors'} pb-1"
      >
        Tasks
      </a>
    </div>

    <!-- Mobile Menu Button -->
    <button
      class="md:hidden flex items-center px-3 py-2 border rounded text-gray-600 border-gray-600 hover:text-blue-600 hover:border-blue-600"
      on:click={toggleMobileMenu}
      aria-label="Toggle navigation menu"
    >
      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
          clip-rule="evenodd"
        ></path>
      </svg>
    </button>
  </nav>

  <!-- Mobile Navigation Menu -->
  {#if mobileMenuOpen}
    <div class="md:hidden mt-4 pb-4 max-w-6xl mx-auto">
      <div class="flex flex-col space-y-2">
        <a
          href="/"
          class="{currentPath === '/'
            ? 'text-blue-600 bg-blue-50'
            : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'} block px-3 py-2 rounded-md text-base font-medium transition-colors"
          on:click={closeMobileMenu}
        >
          Home
        </a>
        <a
          href="/tasks"
          class="{currentPath === '/tasks'
            ? 'text-blue-600 bg-blue-50'
            : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'} block px-3 py-2 rounded-md text-base font-medium transition-colors"
          on:click={closeMobileMenu}
        >
          Tasks
        </a>
      </div>
    </div>
  {/if}
</header>

<!-- Connection Status - Global -->
<div class="max-w-6xl mx-auto mb-6">
  <ConnectionStatus />
</div>

<main class="max-w-6xl mx-auto w-full box-border font-sans py-4">
  <slot />
</main>
