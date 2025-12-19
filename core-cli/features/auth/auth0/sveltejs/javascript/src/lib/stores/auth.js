import { writable, derived, get } from 'svelte/store';
import { createAuth0Client } from '@auth0/auth0-spa-js';
import { browser } from '$app/environment';

export const auth0Client = writable(null);
export const user = writable(null);
export const isAuthenticated = writable(false);
export const isLoading = writable(true);
export const error = writable(null);

// Derived stores
export const isLoggedIn = derived(
    [isAuthenticated, isLoading],
    ([$isAuthenticated, $isLoading]) => $isAuthenticated && !$isLoading
);

export async function initializeAuth() {
    if (!browser) return;

    try {
        const client = await createAuth0Client({
            domain: import.meta.env.VITE_AUTH0_DOMAIN,
            clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
            authorizationParams: {
                redirect_uri: window.location.origin
            },
            useRefreshTokens: true,
            cacheLocation: 'localstorage'
        });

        auth0Client.set(client);

        // Handle callback
        if (window.location.search.includes('code=')) {
            await client.handleRedirectCallback();
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        // Check authentication status
        const authenticated = await client.isAuthenticated();
        isAuthenticated.set(authenticated);

        if (authenticated) {
            const userData = await client.getUser();
            user.set(userData || null);
        }

        error.set(null);
    } catch (err) {
        console.error('Auth initialization error:', err);
        error.set(err instanceof Error ? err.message : 'Authentication initialization failed');
    } finally {
        isLoading.set(false);
    }
}

export async function login() {
    const client = get(auth0Client);
    if (client) {
        await client.loginWithRedirect();
    }
}

export async function logout() {
    const client = get(auth0Client);
    if (client) {
        client.logout({
            logoutParams: {
                returnTo: window.location.origin
            }
        });
    }
}

export async function getToken() {
    const client = get(auth0Client);
    if (!client) return null;

    try {
        return await client.getTokenSilently();
    } catch (err) {
        if (err.error === 'login_required') {
            await login();
        }
        return null;
    }
}