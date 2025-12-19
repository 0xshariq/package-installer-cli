<script lang="ts">
  import { isAuthenticated, isLoading, error, user } from '$lib/stores/auth';
  import LoginButton from '$lib/components/LoginButton.svelte';
  import LogoutButton from '$lib/components/LogoutButton.svelte';
  import Profile from '$lib/components/Profile.svelte';
</script>

<svelte:head>
  <title>Auth0 Svelte Sample</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<div class="app-container">
  {#if $isLoading}
    <div class="loading-state">
      <div class="loading-text">Loading...</div>
    </div>
  {:else if $error}
    <div class="error-state">
      <div class="error-title">Oops!</div>
      <div class="error-message">Something went wrong</div>
      <div class="error-sub-message">{$error}</div>
    </div>
  {:else}
    <div class="main-card-wrapper">
      <img 
        src="https://cdn.auth0.com/quantum-assets/dist/latest/logos/auth0/auth0-lockup-en-ondark.png" 
        alt="Auth0 Logo" 
        class="auth0-logo"
      />
      <h1 class="main-title">Welcome to Sample0</h1>

      {#if $isAuthenticated}
        <div class="logged-in-section">
          <div class="logged-in-message">✅ Successfully authenticated!</div>
          <h2 class="profile-section-title">Your Profile</h2>
          <div class="profile-card">
            <Profile />
          </div>
          <LogoutButton />
        </div>
      {:else}
        <div class="action-card">
          <p class="action-text">Get started by signing in to your account</p>
          <LoginButton />
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .app-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    width: 100%;
    padding: 1rem;
    box-sizing: border-box;
  }

  .loading-state, .error-state {
    background-color: #2d313c;
    border-radius: 15px;
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
    padding: 3rem;
    text-align: center;
  }

  .loading-text {
    font-size: 1.8rem;
    font-weight: 500;
    color: #a0aec0;
    animation: pulse 1.5s infinite ease-in-out;
  }

  .error-state {
    background-color: #c53030;
    color: #fff;
  }

  .error-title {
    font-size: 2.8rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .error-message {
    font-size: 1.3rem;
    margin-bottom: 0.5rem;
  }

  .error-sub-message {
    font-size: 1rem;
    opacity: 0.8;
  }

  .main-card-wrapper {
    background-color: #262a33;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    padding: 3rem;
    max-width: 500px;
    width: 90%;
    animation: fadeInScale 0.8s ease-out forwards;
  }

  .auth0-logo {
    width: 160px;
    margin-bottom: 1.5rem;
    opacity: 0;
    animation: slideInDown 1s ease-out forwards 0.2s;
  }

  .main-title {
    font-size: 2.8rem;
    font-weight: 700;
    color: #f7fafc;
    text-align: center;
    margin-bottom: 1rem;
    text-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    opacity: 0;
    animation: fadeIn 1s ease-out forwards 0.4s;
  }

  .action-card {
    background-color: #2d313c;
    border-radius: 15px;
    box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.3), 0 5px 15px rgba(0, 0, 0, 0.3);
    padding: 2.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.8rem;
    width: calc(100% - 2rem);
    opacity: 0;
    animation: fadeIn 1s ease-out forwards 0.6s;
  }

  .action-text {
    font-size: 1.25rem;
    color: #cbd5e0;
    text-align: center;
    line-height: 1.6;
    font-weight: 400;
  }

  .logged-in-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    width: 100%;
  }

  .logged-in-message {
    font-size: 1.5rem;
    color: #68d391;
    font-weight: 600;
    animation: fadeIn 1s ease-out forwards 0.8s;
  }

  .profile-section-title {
    font-size: 2.2rem;
    animation: slideInUp 1s ease-out forwards 1s;
  }

  .profile-card {
    padding: 2.2rem;
    animation: scaleIn 0.8s ease-out forwards 1.2s;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fadeInScale {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }

  @keyframes slideInDown {
    from { opacity: 0; transform: translateY(-70px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideInUp {
    from { opacity: 0; transform: translateY(50px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
  }

  @media (max-width: 600px) {
    .main-card-wrapper {
      padding: 2rem;
      margin: 1rem;
    }

    .main-title {
      font-size: 2.2rem;
    }

    .auth0-logo {
      width: 120px;
    }
  }
</style>