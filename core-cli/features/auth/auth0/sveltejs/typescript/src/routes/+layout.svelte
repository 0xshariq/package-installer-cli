<script lang="ts">
  import { onMount } from 'svelte';
  import { initializeAuth } from '$lib/stores/auth';

  onMount(() => {
    initializeAuth();
  });
</script>

<main>
  <slot />
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: 'Inter', sans-serif;
    background-color: #1a1e27;
    min-height: 100vh;
    color: #e2e8f0;
  }

  main {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    box-sizing: border-box;
  }
</style>