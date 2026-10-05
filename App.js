/**
 * Application Entry Point
 *
 * Initializes state store, handles initial data fetching from API,
 * and sets up router and global app object.
 */

import Store from './Services/Store.js';
import API from './Services/Api.js';
import Router from './Services/Router.js';

// Global application instance namespace
window.app = {};
app.store = Store;
app.router = Router;

/**
 * Initializes application data and starts routing.
 * Ensures API fetching is handled gracefully with error catching to preserve security and UI stability.
 */
async function initApp() {
    try {
        const data = await API.fetchUrl();
        app.store.users = Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Failed to fetch user data from API:', error);
        app.store.users = [];
    }

    // Initialize client router and navigation event listeners
    app.router.init();
}

// Check document readiness state
if (document.readyState !== 'loading') {
    initApp();
} else {
    document.addEventListener('DOMContentLoaded', () => {
        initApp();
    });
}
