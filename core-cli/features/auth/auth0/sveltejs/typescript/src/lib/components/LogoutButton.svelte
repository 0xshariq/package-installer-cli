<script lang="ts">
  import { logout } from '$lib/stores/auth';

  async function handleLogout() {
    await logout();
  }
</script>

<button
  on:click={handleLogout}
  class="button logout"
>
  Log Out
</button>

<style>
  .button {
    padding: 1.1rem 2.8rem;
    font-size: 1.2rem;
    font-weight: 600;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    outline: none;
  }

  .button:focus {
    box-shadow: 0 0 0 4px rgba(252, 129, 129, 0.5);
  }

  .button.logout {
    background-color: #fc8181;
    color: #1a1e27;
  }

  .button.logout:hover {
    background-color: #e53e3e;
    transform: translateY(-5px) scale(1.03);
    box-shadow: 0 12px 25px rgba(0, 0, 0, 0.5);
  }
</style>