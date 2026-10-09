/**
 * Router Module for Vanilla SPA - Desktop Full Layout
 *
 * Manages client-side routing, history state navigation, desktop views rendering,
 * and security measures (preventing XSS via safe DOM node creation & textContent assignment).
 */

const Router = {
    /**
     * Initializes global click delegation for navigation links and history state listener.
     */
    init: () => {
        // Intercept navigation link clicks for smooth SPA transitions
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

        // Listen for browser navigation history changes (Back / Forward)
        window.addEventListener('popstate', (event) => {
            const route = event.state && event.state.route ? event.state.route : location.pathname;
            Router.go(route, false);
        });

        // Load initial route on startup
        Router.go(location.pathname);
    },

    /**
     * Navigates to target route and updates page DOM view and active navigation state.
     *
     * @param {string} route - Target path (e.g. '/', '/home', '/about')
     * @param {boolean} addToHistory - Push route into browser history
     */
    go: (route, addToHistory = true) => {
        if (addToHistory) {
            history.pushState({ route }, '', route);
        }

        // Synchronize active nav link styles in header
        Router.updateActiveTab(route);

        const root = document.querySelector('.root');
        if (!root) return;

        window.scrollTo({ top: 0, behavior: 'smooth' });
        root.innerHTML = '';

        let pageElement = null;

        switch (route) {
            case '/':
            case '':
                pageElement = Router.renderIndexPage();
                break;

            case '/home':
                pageElement = Router.renderHomePage();
                break;

            case '/about':
                pageElement = Router.renderAboutPage();
                break;

            default:
                pageElement = Router.render404Page();
                break;
        }

        if (pageElement) {
            pageElement.classList.add('fade-in');
            root.appendChild(pageElement);
        }
    },

    /**
     * Updates active navigation state in navbar.
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
     * Renders Index Page View with desktop hero banner and feature dashboard cards.
     * @returns {HTMLElement}
     */
    renderIndexPage: () => {
        const container = document.createElement('div');

        // Hero Section
        const hero = document.createElement('div');
        hero.className = 'desktop-hero';

        const heroContent = document.createElement('div');
        const title = document.createElement('h1');
        title.className = 'desktop-hero-title';
        title.textContent = 'Index Dashboard';

        const subtitle = document.createElement('p');
        subtitle.className = 'desktop-hero-subtitle';
        subtitle.textContent = 'Selamat datang di Platform Web Application Single Page';

        heroContent.appendChild(title);
        heroContent.appendChild(subtitle);
        hero.appendChild(heroContent);
        container.appendChild(hero);

        // Grid Section
        const grid = document.createElement('div');
        grid.className = 'desktop-grid';

        const card1 = Router.createDesktopCard({
            icon: '👥',
            title: 'User Directory',
            subtitle: 'Kelola dan lihat direktori pengguna terdaftar dari API.',
            actionText: 'Buka Home',
            onAction: () => Router.go('/home')
        });

        const card2 = Router.createDesktopCard({
            icon: 'ℹ️',
            title: 'Informasi System',
            subtitle: 'Spesifikasi UI desktop, keamanan, dan arsitektur modul.',
            actionText: 'Lihat About',
            onAction: () => Router.go('/about')
        });

        grid.appendChild(card1);
        grid.appendChild(card2);
        container.appendChild(grid);

        return container;
    },

    /**
     * Renders Home Page View listing users in a multi-column desktop grid with instant search.
     * @returns {HTMLElement}
     */
    renderHomePage: () => {
        const container = document.createElement('div');

        // Hero Section
        const hero = document.createElement('div');
        hero.className = 'desktop-hero';

        const heroContent = document.createElement('div');
        const title = document.createElement('h1');
        title.className = 'desktop-hero-title';
        title.textContent = 'Home';

        const subtitle = document.createElement('p');
        subtitle.className = 'desktop-hero-subtitle';
        subtitle.textContent = 'Daftar Pengguna Terdaftar dalam Sistem';

        heroContent.appendChild(title);
        heroContent.appendChild(subtitle);
        hero.appendChild(heroContent);
        container.appendChild(hero);

        // Search Bar Section
        const searchBar = document.createElement('div');
        searchBar.className = 'desktop-search-bar';

        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Cari berdasarkan nama atau email...';
        searchInput.className = 'desktop-search-input';

        searchBar.appendChild(searchInput);
        container.appendChild(searchBar);

        // Grid Container for User Cards
        const grid = document.createElement('div');
        grid.className = 'desktop-grid';

        const renderUserCards = (filterText = '') => {
            grid.innerHTML = '';
            const users = (window.app && window.app.store && window.app.store.users) || [];

            const filtered = users.filter(u => {
                const nameMatch = u.name && u.name.toLowerCase().includes(filterText.toLowerCase());
                const emailMatch = u.email && u.email.toLowerCase().includes(filterText.toLowerCase());
                return nameMatch || emailMatch;
            });

            if (filtered.length === 0) {
                const emptyMessage = document.createElement('div');
                emptyMessage.style.gridColumn = '1 / -1';
                emptyMessage.style.padding = '40px';
                emptyMessage.style.textAlign = 'center';
                emptyMessage.style.color = 'var(--ios-text-secondary)';
                emptyMessage.textContent = users.length === 0 ? 'Memuat data pengguna...' : 'Tidak ada pengguna yang cocok dengan pencarian.';
                grid.appendChild(emptyMessage);
                return;
            }

            filtered.forEach(user => {
                const card = document.createElement('div');
                card.className = 'desktop-card';

                // Header
                const cardHeader = document.createElement('div');
                cardHeader.className = 'desktop-card-header';

                const avatar = document.createElement('div');
                avatar.className = 'desktop-avatar';
                avatar.textContent = user.name ? user.name.charAt(0).toUpperCase() : 'U';

                const headerText = document.createElement('div');

                const nameEl = document.createElement('div');
                nameEl.className = 'desktop-card-title';
                nameEl.textContent = user.name || 'Unknown User'; // XSS Safe

                const emailEl = document.createElement('div');
                emailEl.className = 'desktop-card-subtitle';
                emailEl.textContent = user.email || ''; // XSS Safe

                headerText.appendChild(nameEl);
                headerText.appendChild(emailEl);

                cardHeader.appendChild(avatar);
                cardHeader.appendChild(headerText);
                card.appendChild(cardHeader);

                // Body
                const cardBody = document.createElement('div');
                cardBody.className = 'desktop-card-body';

                const companyEl = document.createElement('span');
                companyEl.className = 'ios-badge';
                companyEl.textContent = user.company ? user.company.name : 'Individual';

                const detailBtn = document.createElement('button');
                detailBtn.className = 'ios-button';
                detailBtn.textContent = 'Lihat Detail';
                detailBtn.addEventListener('click', () => {
                    Router.showUserDetailModal(user);
                });

                cardBody.appendChild(companyEl);
                cardBody.appendChild(detailBtn);
                card.appendChild(cardBody);

                grid.appendChild(card);
            });
        };

        renderUserCards();

        // Search Input listener
        searchInput.addEventListener('input', (e) => {
            renderUserCards(e.target.value);
        });

        container.appendChild(grid);

        return container;
    },

    /**
     * Renders About Page View with desktop system overview cards.
     * @returns {HTMLElement}
     */
    renderAboutPage: () => {
        const container = document.createElement('div');

        // Hero Section
        const hero = document.createElement('div');
        hero.className = 'desktop-hero';

        const heroContent = document.createElement('div');
        const title = document.createElement('h1');
        title.className = 'desktop-hero-title';
        title.textContent = 'Halaman About';

        const subtitle = document.createElement('p');
        subtitle.className = 'desktop-hero-subtitle';
        subtitle.textContent = 'Spesifikasi Sistem & Arsitektur Frontend Desktop';

        heroContent.appendChild(title);
        heroContent.appendChild(subtitle);
        hero.appendChild(heroContent);
        container.appendChild(hero);

        // Grid Section
        const grid = document.createElement('div');
        grid.className = 'desktop-grid';

        const card1 = Router.createDesktopCard({
            icon: '💻',
            title: 'Layout Web Full-Width',
            subtitle: 'Desain responsif desktop menggunakan San Francisco typography dan glassmorphic header navigation.',
            badge: 'Apple Web Style'
        });

        const card2 = Router.createDesktopCard({
            icon: '🛡️',
            title: 'Keamanan DOM & XSS',
            subtitle: 'Sanitasi data API penuh menggunakan safe DOM element construction dan textContent binding.',
            badge: 'Secured'
        });

        const card3 = Router.createDesktopCard({
            icon: '⚡',
            title: 'SPA Routing Native',
            subtitle: 'Navigasi tanpa page reload dengan sync state history popstate browser.',
            badge: 'Fast & Lightweight'
        });

        grid.appendChild(card1);
        grid.appendChild(card2);
        grid.appendChild(card3);
        container.appendChild(grid);

        return container;
    },

    /**
     * Renders 404 Error Page View.
     * @returns {HTMLElement}
     */
    render404Page: () => {
        const container = document.createElement('div');
        container.style.padding = '60px 20px';
        container.style.textAlign = 'center';

        const title = document.createElement('h1');
        title.className = 'desktop-hero-title';
        title.style.fontSize = '64px';
        title.textContent = '404';

        const subtitle = document.createElement('p');
        subtitle.className = 'desktop-hero-subtitle';
        subtitle.style.marginBottom = '32px';
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
     * Helper to create desktop grid cards safely.
     * XSS Security: Asserts textContent for all passed strings.
     */
    createDesktopCard: ({ icon, title, subtitle, badge, actionText, onAction }) => {
        const card = document.createElement('div');
        card.className = 'desktop-card';

        const cardHeader = document.createElement('div');
        cardHeader.className = 'desktop-card-header';

        if (icon) {
            const avatar = document.createElement('div');
            avatar.className = 'desktop-avatar';
            avatar.style.background = 'var(--ios-card-secondary-bg)';
            avatar.style.color = 'var(--ios-text-primary)';
            avatar.textContent = icon;
            cardHeader.appendChild(avatar);
        }

        const headerText = document.createElement('div');

        const titleEl = document.createElement('div');
        titleEl.className = 'desktop-card-title';
        titleEl.textContent = title;

        const subEl = document.createElement('div');
        subEl.className = 'desktop-card-subtitle';
        subEl.textContent = subtitle;

        headerText.appendChild(titleEl);
        headerText.appendChild(subEl);
        cardHeader.appendChild(headerText);
        card.appendChild(cardHeader);

        if (badge || onAction) {
            const cardBody = document.createElement('div');
            cardBody.className = 'desktop-card-body';

            if (badge) {
                const badgeEl = document.createElement('span');
                badgeEl.className = 'ios-badge';
                badgeEl.textContent = badge;
                cardBody.appendChild(badgeEl);
            }

            if (onAction && actionText) {
                const btn = document.createElement('button');
                btn.className = 'ios-button';
                btn.textContent = actionText;
                btn.addEventListener('click', onAction);
                cardBody.appendChild(btn);
            }

            card.appendChild(cardBody);
        }

        return card;
    },

    /**
     * Opens a centered desktop modal dialog showing user details.
     * Security: Safely constructs modal DOM without innerHTML string interpolation.
     * @param {Object} user
     */
    showUserDetailModal: (user) => {
        // Remove existing modal if present
        const existingModal = document.querySelector('.desktop-modal-overlay');
        if (existingModal) existingModal.remove();

        const overlay = document.createElement('div');
        overlay.className = 'desktop-modal-overlay';

        const card = document.createElement('div');
        card.className = 'desktop-modal-card';

        // Header
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.marginBottom = '24px';

        const modalTitle = document.createElement('h2');
        modalTitle.style.fontSize = '22px';
        modalTitle.style.fontWeight = '700';
        modalTitle.textContent = user.name || 'Detail Pengguna';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'ios-button';
        closeBtn.style.padding = '6px 14px';
        closeBtn.textContent = 'Tutup';
        closeBtn.addEventListener('click', () => overlay.remove());

        header.appendChild(modalTitle);
        header.appendChild(closeBtn);
        card.appendChild(header);

        // Content
        const detailsContainer = document.createElement('div');
        detailsContainer.style.display = 'grid';
        detailsContainer.style.gridTemplateColumns = '1fr 1fr';
        detailsContainer.style.gap = '16px';

        const details = [
            { label: 'Username', value: user.username },
            { label: 'Email', value: user.email },
            { label: 'Telepon', value: user.phone },
            { label: 'Website', value: user.website },
            { label: 'Perusahaan', value: user.company ? user.company.name : '-' },
            { label: 'Kota', value: user.address ? user.address.city : '-' }
        ];

        details.forEach(item => {
            const itemBox = document.createElement('div');
            itemBox.style.padding = '12px';
            itemBox.style.backgroundColor = 'var(--ios-card-secondary-bg)';
            itemBox.style.borderRadius = 'var(--ios-radius-md)';

            const lbl = document.createElement('div');
            lbl.style.fontSize = '12px';
            lbl.style.color = 'var(--ios-text-secondary)';
            lbl.style.fontWeight = '600';
            lbl.style.textTransform = 'uppercase';
            lbl.textContent = item.label;

            const val = document.createElement('div');
            val.style.fontSize = '15px';
            val.style.fontWeight = '600';
            val.style.marginTop = '4px';
            val.style.wordBreak = 'break-word';
            val.textContent = item.value || '-'; // XSS Safe binding

            itemBox.appendChild(lbl);
            itemBox.appendChild(val);
            detailsContainer.appendChild(itemBox);
        });

        card.appendChild(detailsContainer);
        overlay.appendChild(card);

        // Dismiss when clicking overlay
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });

        document.body.appendChild(overlay);
    }
};

export default Router;
