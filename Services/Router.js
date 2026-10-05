/**
 * Router Module for Vanilla SPA with iOS Design System
 *
 * Handles client-side navigation, history management, DOM rendering,
 * and security precautions (XSS prevention via safe DOM node construction).
 */

const Router = {
    /**
     * Initializes navigation listeners and handles initial page load routing.
     */
    init: () => {
        // Delegate click events on navigation links to route smoothly without full page refresh
        document.addEventListener('click', (e) => {
            const navLink = e.target.closest('a.navLink');
            if (navLink) {
                e.preventDefault();
                const href = navLink.getAttribute('href');
                if (href) {
                    Router.go(href);
                }
            }
        });

        // Handle browser Back / Forward buttons using popstate event
        window.addEventListener('popstate', (event) => {
            const route = event.state && event.state.route ? event.state.route : location.pathname;
            Router.go(route, false);
        });

        // Process current initial URL pathname on page load
        Router.go(location.pathname);
    },

    /**
     * Navigates to a specified route and updates the view and tab navigation state.
     *
     * @param {string} route - Target path (e.g., '/', '/home', '/about')
     * @param {boolean} addToHistory - Whether to push state to browser history
     */
    go: (route, addToHistory = true) => {
        if (addToHistory) {
            history.pushState({ route }, '', route);
        }

        // Highlight active tab link in bottom tab bar
        Router.updateActiveTab(route);

        const root = document.querySelector('.root');
        const headerTitle = document.getElementById('header-title');

        if (!root) return;

        // Reset scroll position
        root.scrollTop = 0;
        root.innerHTML = '';

        let pageElement = null;

        // Route dispatcher
        switch (route) {
            case '/':
            case '':
                if (headerTitle) headerTitle.textContent = 'Index';
                pageElement = Router.renderIndexPage();
                break;

            case '/home':
                if (headerTitle) headerTitle.textContent = 'Home';
                pageElement = Router.renderHomePage();
                break;

            case '/about':
                if (headerTitle) headerTitle.textContent = 'Halaman About';
                pageElement = Router.renderAboutPage();
                break;

            default:
                if (headerTitle) headerTitle.textContent = '404';
                pageElement = Router.render404Page();
                break;
        }

        if (pageElement) {
            pageElement.classList.add('fade-in');
            root.appendChild(pageElement);
        }
    },

    /**
     * Updates active tab styling in the tab bar.
     * @param {string} currentRoute
     */
    updateActiveTab: (currentRoute) => {
        document.querySelectorAll('a.navLink').forEach((link) => {
            const href = link.getAttribute('href');
            if (href === currentRoute || (currentRoute === '/' && href === '/home')) {
                link.classList.add('active');
            } else if (href === currentRoute) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    },

    /**
     * Renders Index Page View using iOS cards and hero section.
     * @returns {HTMLElement}
     */
    renderIndexPage: () => {
        const container = document.createElement('div');

        // Large Title Header
        const titleGroup = document.createElement('div');
        titleGroup.className = 'ios-large-title-container';

        const title = document.createElement('h1');
        title.className = 'ios-large-title';
        title.textContent = 'Index';

        const subtitle = document.createElement('p');
        subtitle.className = 'ios-subtitle';
        subtitle.textContent = 'Selamat datang di Aplikasi iOS Web';

        titleGroup.appendChild(title);
        titleGroup.appendChild(subtitle);
        container.appendChild(titleGroup);

        // Group Card 1: Overview
        const group = document.createElement('div');
        group.className = 'ios-group';

        const item1 = Router.createListItem({
            title: 'User Management',
            subtitle: 'Kelola data pengguna dari API',
            icon: '👥',
            onClick: () => Router.go('/home')
        });

        const item2 = Router.createListItem({
            title: 'Tentang Aplikasi',
            subtitle: 'Informasi versi dan pengembang',
            icon: 'ℹ️',
            onClick: () => Router.go('/about')
        });

        group.appendChild(item1);
        group.appendChild(item2);
        container.appendChild(group);

        return container;
    },

    /**
     * Renders Home Page View listing users fetched from API.
     * @returns {HTMLElement}
     */
    renderHomePage: () => {
        const container = document.createElement('div');

        // Large Title Header
        const titleGroup = document.createElement('div');
        titleGroup.className = 'ios-large-title-container';

        const title = document.createElement('h1');
        title.className = 'ios-large-title';
        title.textContent = 'Home';

        const subtitle = document.createElement('p');
        subtitle.className = 'ios-subtitle';
        subtitle.textContent = 'Daftar Pengguna';

        titleGroup.appendChild(title);
        titleGroup.appendChild(subtitle);
        container.appendChild(titleGroup);

        // Search Input
        const searchContainer = document.createElement('div');
        searchContainer.className = 'ios-search-container';

        const searchWrapper = document.createElement('div');
        searchWrapper.className = 'ios-search-input-wrapper';

        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Cari pengguna...';
        searchInput.className = 'ios-search-input';

        searchWrapper.appendChild(searchInput);
        searchContainer.appendChild(searchWrapper);
        container.appendChild(searchContainer);

        // User List Container Group
        const groupHeader = document.createElement('div');
        groupHeader.className = 'ios-group-header';
        groupHeader.textContent = 'Pengguna Terdaftar';
        container.appendChild(groupHeader);

        const group = document.createElement('div');
        group.className = 'ios-group';

        const renderUserList = (filterText = '') => {
            group.innerHTML = '';
            const users = (window.app && window.app.store && window.app.store.users) || [];

            const filtered = users.filter(u => {
                const nameMatch = u.name && u.name.toLowerCase().includes(filterText.toLowerCase());
                const emailMatch = u.email && u.email.toLowerCase().includes(filterText.toLowerCase());
                return nameMatch || emailMatch;
            });

            if (filtered.length === 0) {
                const emptyItem = document.createElement('div');
                emptyItem.style.padding = '20px';
                emptyItem.style.textAlign = 'center';
                emptyItem.style.color = 'var(--ios-text-secondary)';
                emptyItem.textContent = users.length === 0 ? 'Memuat data pengguna...' : 'Tidak ada pengguna ditemukan.';
                group.appendChild(emptyItem);
                return;
            }

            filtered.forEach(user => {
                const userItem = document.createElement('div');
                userItem.className = 'ios-list-item';

                // Safe Avatar generation
                const avatar = document.createElement('div');
                avatar.className = 'ios-avatar';
                const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
                avatar.textContent = initial;

                // Safe Content construction
                const content = document.createElement('div');
                content.className = 'ios-list-content';

                const nameEl = document.createElement('div');
                nameEl.className = 'ios-list-title';
                // Security: textContent ensures XSS safety
                nameEl.textContent = user.name || 'Unknown User';

                const subEl = document.createElement('div');
                subEl.className = 'ios-list-subtitle';
                // Security: textContent prevents HTML injection from API response
                subEl.textContent = `${user.email || ''} • ${user.company ? user.company.name : ''}`;

                content.appendChild(nameEl);
                content.appendChild(subEl);

                const chevron = document.createElement('div');
                chevron.className = 'ios-chevron';
                chevron.textContent = '›';

                userItem.appendChild(avatar);
                userItem.appendChild(content);
                userItem.appendChild(chevron);

                userItem.addEventListener('click', () => {
                    Router.showUserDetailModal(user);
                });

                group.appendChild(userItem);
            });
        };

        renderUserList();

        // Search event listener
        searchInput.addEventListener('input', (e) => {
            renderUserList(e.target.value);
        });

        container.appendChild(group);

        return container;
    },

    /**
     * Renders About Page View in iOS settings/card style.
     * @returns {HTMLElement}
     */
    renderAboutPage: () => {
        const container = document.createElement('div');

        // Large Title
        const titleGroup = document.createElement('div');
        titleGroup.className = 'ios-large-title-container';

        const title = document.createElement('h1');
        title.className = 'ios-large-title';
        title.textContent = 'Halaman About';

        const subtitle = document.createElement('p');
        subtitle.className = 'ios-subtitle';
        subtitle.textContent = 'Informasi Sistem & Spesifikasi UI';

        titleGroup.appendChild(title);
        titleGroup.appendChild(subtitle);
        container.appendChild(titleGroup);

        // App Card Group
        const group = document.createElement('div');
        group.className = 'ios-group';

        const appNameItem = Router.createListItem({
            title: 'Aplikasi',
            subtitle: 'Vanilla Single Page Application',
            badge: 'v1.0.0'
        });

        const uiItem = Router.createListItem({
            title: 'Desain System',
            subtitle: 'iOS Glassmorphism & Modern Styling',
            badge: 'iOS 17'
        });

        const secItem = Router.createListItem({
            title: 'Keamanan DOM',
            subtitle: 'Penanganan XSS dengan Sanitasi Node DOM',
            badge: 'Aman'
        });

        group.appendChild(appNameItem);
        group.appendChild(uiItem);
        group.appendChild(secItem);

        container.appendChild(group);

        return container;
    },

    /**
     * Renders 404 Page View for undefined routes.
     * @returns {HTMLElement}
     */
    render404Page: () => {
        const container = document.createElement('div');
        container.style.padding = '40px 20px';
        container.style.textAlign = 'center';

        const title = document.createElement('h1');
        title.className = 'ios-large-title';
        title.style.fontSize = '48px';
        title.textContent = '404';

        const subtitle = document.createElement('p');
        subtitle.className = 'ios-subtitle';
        subtitle.style.marginBottom = '24px';
        subtitle.textContent = 'Halaman yang Anda cari tidak ditemukan.';

        const button = document.createElement('button');
        button.className = 'ios-button';
        button.textContent = 'Kembali ke Home';
        button.addEventListener('click', () => Router.go('/home'));

        container.appendChild(title);
        container.appendChild(subtitle);
        container.appendChild(button);

        return container;
    },

    /**
     * Helper to safely construct standard iOS list items.
     * Security: Uses textContent for all user-supplied text to prevent DOM-based XSS.
     */
    createListItem: ({ title, subtitle, icon, badge, onClick }) => {
        const item = document.createElement('div');
        item.className = 'ios-list-item';

        if (icon) {
            const avatar = document.createElement('div');
            avatar.className = 'ios-avatar';
            avatar.style.background = 'var(--ios-card-secondary-bg)';
            avatar.style.color = 'var(--ios-text-primary)';
            avatar.style.fontSize = '20px';
            avatar.textContent = icon;
            item.appendChild(avatar);
        }

        const content = document.createElement('div');
        content.className = 'ios-list-content';

        const titleEl = document.createElement('div');
        titleEl.className = 'ios-list-title';
        titleEl.textContent = title;

        content.appendChild(titleEl);

        if (subtitle) {
            const subEl = document.createElement('div');
            subEl.className = 'ios-list-subtitle';
            subEl.textContent = subtitle;
            content.appendChild(subEl);
        }

        item.appendChild(content);

        if (badge) {
            const badgeEl = document.createElement('span');
            badgeEl.className = 'ios-badge';
            badgeEl.textContent = badge;
            item.appendChild(badgeEl);
        } else if (onClick) {
            const chevron = document.createElement('div');
            chevron.className = 'ios-chevron';
            chevron.textContent = '›';
            item.appendChild(chevron);
        }

        if (onClick) {
            item.addEventListener('click', onClick);
        }

        return item;
    },

    /**
     * Displays an iOS Sheet Modal showing detailed user information safely.
     * @param {Object} user
     */
    showUserDetailModal: (user) => {
        // Prevent duplicate modals
        const existingModal = document.querySelector('.ios-modal-overlay');
        if (existingModal) existingModal.remove();

        const overlay = document.createElement('div');
        overlay.className = 'ios-modal-overlay';

        const card = document.createElement('div');
        card.className = 'ios-modal-card';

        // Modal Header
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.marginBottom = '16px';

        const modalTitle = document.createElement('h2');
        modalTitle.style.fontSize = '20px';
        modalTitle.style.fontWeight = '700';
        modalTitle.textContent = user.name || 'Detail Pengguna';

        const closeBtn = document.createElement('button');
        closeBtn.style.background = 'none';
        closeBtn.style.border = 'none';
        closeBtn.style.color = 'var(--ios-tint)';
        closeBtn.style.fontSize = '16px';
        closeBtn.style.fontWeight = '600';
        closeBtn.style.cursor = 'pointer';
        closeBtn.textContent = 'Selesai';
        closeBtn.addEventListener('click', () => overlay.remove());

        header.appendChild(modalTitle);
        header.appendChild(closeBtn);
        card.appendChild(header);

        // Modal Content Group
        const detailsGroup = document.createElement('div');
        detailsGroup.className = 'ios-group';
        detailsGroup.style.margin = '0';

        const details = [
            { title: 'Username', subtitle: user.username },
            { title: 'Email', subtitle: user.email },
            { title: 'Telepon', subtitle: user.phone },
            { title: 'Website', subtitle: user.website },
            { title: 'Perusahaan', subtitle: user.company ? user.company.name : '-' }
        ];

        details.forEach(d => {
            if (d.subtitle) {
                const item = document.createElement('div');
                item.className = 'ios-list-item';

                const cnt = document.createElement('div');
                cnt.className = 'ios-list-content';

                const t = document.createElement('div');
                t.className = 'ios-list-title';
                t.style.fontSize = '14px';
                t.style.color = 'var(--ios-text-secondary)';
                t.textContent = d.title;

                const sub = document.createElement('div');
                sub.className = 'ios-list-subtitle';
                sub.style.fontSize = '16px';
                sub.style.color = 'var(--ios-text-primary)';
                sub.style.marginTop = '2px';
                sub.textContent = d.subtitle;

                cnt.appendChild(t);
                cnt.appendChild(sub);
                item.appendChild(cnt);
                detailsGroup.appendChild(item);
            }
        });

        card.appendChild(detailsGroup);
        overlay.appendChild(card);

        // Dismiss when clicking backdrop
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });

        const appContainer = document.querySelector('.ios-app-container') || document.body;
        appContainer.appendChild(overlay);
    }
};

export default Router;
