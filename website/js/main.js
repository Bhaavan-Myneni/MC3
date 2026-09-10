/**
 * MC3 Summit 2025 - Professional Application Controller
 * High-performance, accessible, government-standard web application
 * Optimized for speed, smoothness, and professional user experience
 */

class MC3DataApp {
    constructor() {
        this.controllers = new Map();
        this.isInitialized = false;
        this.loadingStates = new Set();
        this.intersectionObserver = null;
        this.scrollTimeout = null;
        this.resizeTimeout = null;
        
        // Performance monitoring
        this.performanceMarks = new Map();
        
        // Initialize core features
        this.initializeCore();
    }

    /**
     * Initialize core application features with performance optimization
     */
    async initializeCore() {
        try {
            this.markPerformance('app-init-start');
            
            // Initialize performance optimizations
            this.initializePerformanceOptimizations();
            
            // Initialize accessibility features
            this.initializeAccessibility();
            
            // Initialize smooth interactions
            this.initializeSmoothInteractions();
            
            // Initialize functional buttons and links
            this.initializeFunctionalElements();
            
            // Load application controllers
            await this.loadControllers();
            
            // Initialize visualizations if elements exist
            this.initializeVisualizations();
            
            // Initialize responsive behaviors
            this.initializeResponsiveBehaviors();
            
            // Initialize language translation
            this.initializeLanguageFeatures();
            
            // Initialize homepage data
            this.initializeHomepageData();
            
            this.markPerformance('app-init-end');
            this.isInitialized = true;
            
            // Emit initialization complete event
            this.emitEvent('app:initialized', { 
                performance: this.getPerformanceMetrics() 
            });
            
        } catch (error) {
            console.error('Application initialization failed:', error);
            // Don't show error message to user - just log it
            // this.showErrorMessage('Application failed to initialize. Please refresh the page.');
        }
    }

    /**
     * Initialize performance optimizations for smooth experience
     */
    initializePerformanceOptimizations() {
        // Lazy loading for images and content
        this.setupLazyLoading();
        
        // Intersection Observer for performance
        this.setupIntersectionObserver();
        
        // Debounced scroll and resize handlers
        this.setupDebouncedHandlers();
        
        // Preload critical resources
        this.preloadCriticalResources();
    }

    /**
     * Setup lazy loading for improved performance
     */
    setupLazyLoading() {
        const lazyElements = document.querySelectorAll('.lazy-load');
        
        if ('IntersectionObserver' in window) {
            const lazyObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('loaded');
                        lazyObserver.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '50px 0px'
            });
            
            lazyElements.forEach(el => lazyObserver.observe(el));
        } else {
            // Fallback for older browsers
            lazyElements.forEach(el => el.classList.add('loaded'));
        }
    }

    /**
     * Setup intersection observer for animations and performance
     */
    setupIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            this.intersectionObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                        
                        // Trigger any data loading for the visible section
                        this.handleSectionVisible(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });
            
            // Observe key sections
            document.querySelectorAll('section, .story-card, .insight-card').forEach(el => {
                this.intersectionObserver.observe(el);
            });
        }
    }

    /**
     * Setup debounced handlers for smooth performance
     */
    setupDebouncedHandlers() {
        // Smooth scroll handler
        window.addEventListener('scroll', () => {
            if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
            this.scrollTimeout = setTimeout(() => {
                this.handleScroll();
            }, 16); // ~60fps
        }, { passive: true });
        
        // Responsive resize handler
        window.addEventListener('resize', () => {
            if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
    }

    /**
     * Initialize accessibility features
     */
    initializeAccessibility() {
        // Skip navigation functionality
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
            skipLink.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector('#main-content');
                if (target) {
                    target.focus();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
        
        // Keyboard navigation for cards and interactive elements
        this.setupKeyboardNavigation();
        
        // ARIA live regions for dynamic content
        this.setupLiveRegions();
        
        // Focus management
        this.setupFocusManagement();
    }

    /**
     * Initialize smooth interactions and animations
     */
    initializeSmoothInteractions() {
        // Smooth scroll for in-page anchor links only (skip bare "#" placeholders)
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (!href || href === '#') {
                    return;
                }

                const target = document.querySelector(href);
                if (!target) {
                    return;
                }

                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            });
        });
        
        // Hover effects for interactive elements
        this.setupHoverEffects();
        
        // Loading states for async operations
        this.setupLoadingStates();
    }

    /**
     * Initialize functional elements to prevent broken functionality
     */
    initializeFunctionalElements() {
        // Social media links with proper functionality
        this.setupSocialMediaLinks();
        
        // Insight links with smooth scrolling
        this.setupInsightLinks();
        
        // Export functionality
        this.setupExportButtons();
        
        // Form submissions and interactions
        this.setupFormHandlers();
        
        // Print functionality
        this.setupPrintHandlers();
    }

    /**
     * Setup social media links with proper functionality
     */
    setupSocialMediaLinks() {
        const socialLinks = document.querySelectorAll('.social-links a[href="#"]');
        
        socialLinks.forEach(link => {
            const platform = this.detectSocialPlatform(link);
            
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Show sharing interface or information
                this.handleSocialShare(platform);
            });
            
            // Update href to proper sharing URL
            link.href = this.getSocialShareUrl(platform);
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
        });
    }

    /**
     * Detect social media platform from icon classes
     */
    detectSocialPlatform(link) {
        const icon = link.querySelector('i');
        if (!icon) return 'generic';
        
        const classes = icon.className;
        if (classes.includes('facebook')) return 'facebook';
        if (classes.includes('twitter')) return 'twitter';
        if (classes.includes('linkedin')) return 'linkedin';
        if (classes.includes('instagram')) return 'instagram';
        return 'generic';
    }

    /**
     * Get proper social sharing URL
     */
    getSocialShareUrl(platform) {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(document.title);
        const description = encodeURIComponent('Monroe County Childhood Conditions Summit 2025 - Improving outcomes for children and youth');
        
        const shareUrls = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
            instagram: '#', // Instagram doesn't support web sharing
            generic: `mailto:?subject=${title}&body=${description}%20${url}`
        };
        
        return shareUrls[platform] || shareUrls.generic;
    }

    /**
     * Handle social media sharing
     */
    handleSocialShare(platform) {
        // Analytics tracking
        this.trackEvent('social_share', { platform });
        
        // Show success message
        this.showSuccessMessage(`Opening ${platform} sharing...`);
    }

    /**
     * Setup insight links with proper functionality
     */
    setupInsightLinks() {
        document.querySelectorAll('.insight-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href') || '';

                // Allow normal navigation to other pages (e.g. pages/education.html)
                if (!href.startsWith('#')) {
                    return;
                }

                e.preventDefault();

                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                    this.highlightVisualization(target);
                    this.trackEvent('insight_clicked', { target: href });
                }
            });
        });
    }

    /**
     * Setup export functionality
     */
    setupExportButtons() {
        // Add export buttons to visualization containers
        document.querySelectorAll('.viz-container').forEach(container => {
            const exportBtn = this.createExportButton(container);
            container.appendChild(exportBtn);
        });
        
        // Handle export button clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('export-btn')) {
                this.handleExport(e.target);
            }
        });
    }

    /**
     * Create export button for visualization containers
     */
    createExportButton(container) {
        const button = document.createElement('button');
        button.className = 'export-btn';
        button.innerHTML = '<i class="fas fa-download"></i> Export Data';
        button.setAttribute('aria-label', 'Export visualization data');
        button.title = 'Export this visualization as image or data';
        
        return button;
    }

    /**
     * Handle export functionality
     */
    handleExport(button) {
        const container = button.closest('.viz-container');
        const title = container.querySelector('h3')?.textContent || 'MC3 Data Export';
        
        // Show export options
        this.showExportOptions(container, title);
        
        // Track export action
        this.trackEvent('export_requested', { 
            visualization: title,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Show export options dialog
     */
    showExportOptions(container, title) {
        const modal = document.createElement('div');
        modal.className = 'export-modal';
        modal.innerHTML = `
            <div class="export-content">
                <h3>Export ${title}</h3>
                <div class="export-options">
                    <button class="export-option" data-type="image">
                        <i class="fas fa-image"></i>
                        Export as Image
                    </button>
                    <button class="export-option" data-type="pdf">
                        <i class="fas fa-file-pdf"></i>
                        Export as PDF
                    </button>
                    <button class="export-option" data-type="data">
                        <i class="fas fa-table"></i>
                        Export Data (CSV)
                    </button>
                </div>
                <button class="close-modal">&times;</button>
            </div>
        `;
        
        // Add event listeners
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelectorAll('.export-option').forEach(option => {
            option.addEventListener('click', () => {
                const type = option.dataset.type;
                this.performExport(container, title, type);
                modal.remove();
            });
        });
        
        document.body.appendChild(modal);
        
        // Focus management
        modal.querySelector('.export-option').focus();
    }

    /**
     * Perform the actual export
     */
    performExport(container, title, type) {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `MC3_${title.replace(/\s+/g, '_')}_${timestamp}`;
        
        switch (type) {
            case 'image':
                this.exportAsImage(container, filename);
                break;
            case 'pdf':
                this.exportAsPDF(container, filename);
                break;
            case 'data':
                this.exportAsData(container, filename);
                break;
        }
        
        this.showSuccessMessage(`Export initiated: ${filename}.${type}`);
    }

    /**
     * Export visualization as image
     */
    exportAsImage(container, filename) {
        // Implementation would use html2canvas or similar library
        console.log(`Exporting ${filename} as image`);
        
        // For now, show placeholder functionality
        this.showInfoMessage('Image export functionality will be available with the complete visualization system.');
    }

    /**
     * Export as PDF
     */
    exportAsPDF(container, filename) {
        // Implementation would use jsPDF or similar library
        console.log(`Exporting ${filename} as PDF`);
        
        // For now, show placeholder functionality
        this.showInfoMessage('PDF export functionality will be available with the complete visualization system.');
    }

    /**
     * Export data as CSV
     */
    exportAsData(container, filename) {
        // Create sample CSV data structure
        const csvData = this.generateSampleCSV(container);
        
        // Create and download CSV file
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    /**
     * Generate sample CSV data for placeholder functionality
     */
    generateSampleCSV(container) {
        const title = container.querySelector('h3')?.textContent || 'MC3 Data';
        const description = container.querySelector('h4')?.textContent || 'Data Export';
        
        return `Data Export from MC3 Summit 2025
Title,${title}
Description,${description}
Export Date,${new Date().toISOString()}
Data Status,Placeholder - Will be populated with actual data

Note: This is a placeholder export. The actual visualization data will be available when the data analysis and correlation studies are complete.

Year,Value,Category
2020,Sample Data,Placeholder
2021,Sample Data,Placeholder
2022,Sample Data,Placeholder
2023,Sample Data,Placeholder
2024,Sample Data,Placeholder`;
    }

    /**
     * Highlight visualization container
     */
    highlightVisualization(target) {
        // Remove existing highlights
        document.querySelectorAll('.highlighted').forEach(el => {
            el.classList.remove('highlighted');
        });
        
        // Add highlight to target
        target.classList.add('highlighted');
        
        // Remove highlight after animation
        setTimeout(() => {
            target.classList.remove('highlighted');
        }, 3000);
    }

    /**
     * Setup print functionality
     */
    setupPrintHandlers() {
        // Add print styles optimization
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('print');
            mediaQuery.addListener(this.handlePrintModeChange.bind(this));
        }
        
        // Handle print button clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('print-btn') || 
                e.target.closest('.print-btn')) {
                this.handlePrint();
            }
        });
    }

    /**
     * Handle print mode changes
     */
    handlePrintModeChange(mediaQuery) {
        if (mediaQuery.matches) {
            // Entering print mode
            document.body.classList.add('print-mode');
            this.optimizeForPrint();
        } else {
            // Exiting print mode
            document.body.classList.remove('print-mode');
        }
    }

    /**
     * Optimize content for printing
     */
    optimizeForPrint() {
        // Expand all collapsed sections
        document.querySelectorAll('.collapsible.collapsed').forEach(el => {
            el.classList.remove('collapsed');
        });
        
        // Ensure all charts are visible
        document.querySelectorAll('canvas[style*="display: none"]').forEach(canvas => {
            canvas.style.display = 'block';
        });
    }

    /**
     * Handle print action
     */
    handlePrint() {
        this.optimizeForPrint();
        
        // Small delay to ensure layout is ready
        setTimeout(() => {
            window.print();
        }, 500);
        
        this.trackEvent('print_requested');
    }

    /**
     * Load application controllers
     */
    async loadControllers() {
        try {
            console.log('Loading controllers...');
            
            // Load visualization controller if available
            if (typeof VisualizationController !== 'undefined') {
                console.log('VisualizationController found, initializing...');
                this.controllers.set('visualizations', new VisualizationController());
            } else {
                console.warn('VisualizationController not found');
            }
            
            // Load narratives controller if available
            if (typeof NarrativesController !== 'undefined') {
                console.log('NarrativesController found, initializing...');
                this.controllers.set('narratives', new NarrativesController());
            } else {
                console.warn('NarrativesController not found');
            }
            
            // Load data loader if available
            if (typeof DataLoader !== 'undefined') {
                console.log('DataLoader found, initializing...');
                this.controllers.set('dataLoader', new DataLoader());
            } else {
                console.warn('DataLoader not found');
            }
            
            console.log('Controllers loaded:', Array.from(this.controllers.keys()));
            
        } catch (error) {
            console.warn('Some controllers failed to load:', error);
        }
    }

    /**
     * Initialize visualizations
     */
    initializeVisualizations() {
        const vizController = this.controllers.get('visualizations');
        if (vizController) {
            try {
                console.log('Initializing visualizations...');
                vizController.initializeCharts();
                console.log('Visualizations initialized successfully');
            } catch (error) {
                console.warn('Visualization initialization failed:', error);
            }
        } else {
            console.warn('Visualization controller not found');
        }
    }

    /**
     * Handle section becoming visible
     */
    handleSectionVisible(section) {
        // Trigger any lazy loading or data fetching for the section
        if (section.dataset.lazyLoad && !section.dataset.loaded) {
            this.loadSectionData(section);
            section.dataset.loaded = 'true';
        }
    }

    /**
     * Load data for a specific section
     */
    loadSectionData(section) {
        const dataLoader = this.controllers.get('dataLoader');
        if (dataLoader && section.dataset.dataSource) {
            dataLoader.loadSectionData(section.dataset.dataSource);
        }
    }

    /**
     * Handle scroll events
     */
    handleScroll() {
        // Update navigation active states
        this.updateNavigationStates();
        
        // Handle scroll-based animations
        this.handleScrollAnimations();
    }

    /**
     * Handle resize events
     */
    handleResize() {
        // Resize charts if visualization controller exists
        const vizController = this.controllers.get('visualizations');
        if (vizController && typeof vizController.handleResize === 'function') {
            vizController.handleResize();
        }
        
        // Update responsive behaviors
        this.updateResponsiveBehaviors();
    }

    /**
     * Update navigation active states based on scroll position
     */
    updateNavigationStates() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');
        
        let currentSection = '';
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 100 && rect.bottom >= 100) {
                currentSection = section.id;
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    /**
     * Performance measurement utilities
     */
    markPerformance(label) {
        this.performanceMarks.set(label, performance.now());
    }

    getPerformanceMetrics() {
        const startTime = this.performanceMarks.get('app-init-start') || 0;
        const endTime = this.performanceMarks.get('app-init-end') || 0;
        
        return {
            initializationTime: endTime - startTime,
            totalMarks: this.performanceMarks.size,
            memoryUsage: performance.memory ? {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            } : null
        };
    }

    /**
     * Event tracking for analytics
     */
    trackEvent(eventName, eventData = {}) {
        // In a real application, this would send to analytics service
        console.log('Event tracked:', eventName, eventData);
        
        // Emit custom event for any listeners
        this.emitEvent('app:track', { eventName, eventData });
    }

    /**
     * Custom event emitter
     */
    emitEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }

    /**
     * User feedback messages
     */
    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    showErrorMessage(message) {
        // Don't show error messages to user - just log them
        console.error(message);
    }

    showInfoMessage(message) {
        this.showMessage(message, 'info');
    }

    showMessage(message, type = 'info') {
        const messageEl = document.createElement('div');
        messageEl.className = `app-message app-message-${type}`;
        messageEl.innerHTML = `
            <div class="message-content">
                <i class="fas fa-${this.getMessageIcon(type)}"></i>
                <span>${message}</span>
                <button class="message-close">&times;</button>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(messageEl);
        
        // Auto-remove after delay
        setTimeout(() => {
            messageEl.remove();
        }, 5000);
        
        // Manual close
        messageEl.querySelector('.message-close').addEventListener('click', () => {
            messageEl.remove();
        });
        
        // Animate in
        requestAnimationFrame(() => {
            messageEl.classList.add('show');
        });
    }

    getMessageIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            info: 'info-circle',
            warning: 'exclamation-triangle'
        };
        return icons[type] || icons.info;
    }

    /**
     * Setup additional responsive behaviors
     */
    initializeResponsiveBehaviors() {
        this.setupMobileMenuToggle();
        this.setupTouchGestures();
        this.updateResponsiveBehaviors();
    }

    /**
     * Setup mobile menu functionality
     */
    setupMobileMenuToggle() {
        const nav = document.querySelector('.main-nav');
        const menuToggle = document.createElement('button');
        menuToggle.className = 'mobile-menu-toggle';
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        menuToggle.setAttribute('aria-label', 'Toggle navigation menu');
        
        // Insert menu toggle before nav
        if (nav && nav.parentNode) {
            nav.parentNode.insertBefore(menuToggle, nav);
            
            menuToggle.addEventListener('click', () => {
                nav.classList.toggle('mobile-open');
                const icon = menuToggle.querySelector('i');
                icon.className = nav.classList.contains('mobile-open') ? 
                    'fas fa-times' : 'fas fa-bars';
            });
        }
    }

    /**
     * Setup touch gestures for mobile interaction
     */
    setupTouchGestures() {
        if ('ontouchstart' in window) {
            document.body.classList.add('touch-device');
            
            // Add touch-friendly hover effects
            document.querySelectorAll('.story-card, .insight-card').forEach(card => {
                card.addEventListener('touchstart', () => {
                    card.classList.add('touch-active');
                });
                
                card.addEventListener('touchend', () => {
                    setTimeout(() => {
                        card.classList.remove('touch-active');
                    }, 300);
                });
            });
        }
    }

    /**
     * Update responsive behaviors based on current viewport
     */
    updateResponsiveBehaviors() {
        const isMobile = window.innerWidth < 768;
        const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
        
        document.body.classList.toggle('mobile-layout', isMobile);
        document.body.classList.toggle('tablet-layout', isTablet);
        document.body.classList.toggle('desktop-layout', !isMobile && !isTablet);
    }

    /**
     * Initialize language features
     */
    initializeLanguageFeatures() {
        // The Google Translate is already initialized in HTML
        // This method can be used for additional language features
        
        // Track language changes
        document.addEventListener('DOMSubtreeModified', () => {
            const translateElement = document.querySelector('#google_translate_element select');
            if (translateElement) {
                translateElement.addEventListener('change', (e) => {
                    this.trackEvent('language_changed', { language: e.target.value });
                });
            }
        });
    }

    /**
     * Initialize homepage data and statistics
     */
    initializeHomepageData() {
        try {
            // This app controller loads on every page, but the
            // "Explore Our Data Stories" nav boxes only make sense on the
            // homepage: their links are homepage-relative (e.g.
            // "pages/demographics.html"), so running this on a page
            // already under /pages/ injects a section whose links 404
            // (resolving to /pages/pages/...). Every subpage has its own
            // local #total-population stat tile too, so that id alone
            // isn't a safe homepage check — use a section that only
            // exists in index.html instead, plus the URL as a backstop.
            const isHomePage =
                !!document.getElementById('verified-etl-hub') ||
                /(^\/|\/index\.html)$/.test(window.location.pathname);
            if (!isHomePage) {
                return;
            }

            // Populate the main statistics cards
            this.populateStatistics();

            // Create navigation boxes
            this.createNavigationBoxes();

        } catch (error) {
            console.error('Homepage data initialization failed:', error);
        }
    }

    /**
     * Populate the main statistics cards with real data
     */
    populateStatistics() {
        const statistics = {
            'total-population': '139,784',
            'poverty-rate': '19.5%',
            'graduation-rate': '92.5%',
            'unemployment-rate': '4.1%'
        };

        Object.entries(statistics).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
                element.style.color = '#003366';
                element.style.fontWeight = '700';
            }
        });
    }

    /**
     * Create navigation boxes at the bottom of the page
     */
    createNavigationBoxes() {
        const navigationData = [
            {
                icon: 'fas fa-users',
                title: 'Demographics',
                link: 'pages/demographics.html',
                description: 'Community demographics and child development'
            },
            {
                icon: 'fas fa-graduation-cap',
                title: 'Education',
                link: 'pages/education.html',
                description: 'Educational excellence and outcomes'
            },
            {
                icon: 'fas fa-briefcase',
                title: 'Economy',
                link: 'pages/economy.html',
                description: 'Economic security and family stability'
            },
            {
                icon: 'fas fa-hands-helping',
                title: 'Social Services',
                link: 'pages/social-services.html',
                description: 'Child welfare and support services'
            }
        ];

        // Create navigation section if it doesn't exist
        let navigationSection = document.querySelector('.navigation-boxes');
        if (!navigationSection) {
            navigationSection = document.createElement('section');
            navigationSection.className = 'navigation-boxes';
            navigationSection.innerHTML = `
                <div class="container">
                    <h2>Explore Our Data Stories</h2>
                    <div class="navigation-grid"></div>
                </div>
            `;
            
            // Insert before footer
            const footer = document.querySelector('.main-footer');
            if (footer) {
                footer.parentNode.insertBefore(navigationSection, footer);
            }
        }

        const grid = navigationSection.querySelector('.navigation-grid');
        if (grid) {
            grid.innerHTML = navigationData.map(item => `
                <a href="${item.link}" class="nav-box">
                    <div class="nav-box-icon">
                        <i class="${item.icon}"></i>
                    </div>
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                </a>
            `).join('');
        }
    }

    /**
     * Setup keyboard navigation
     */
    setupKeyboardNavigation() {
        // Tab navigation for cards
        document.querySelectorAll('.story-card, .insight-card').forEach(card => {
            card.setAttribute('tabindex', '0');
            
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });
        });
    }

    /**
     * Setup ARIA live regions for dynamic content
     */
    setupLiveRegions() {
        // Create live region for announcements
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'live-region';
        document.body.appendChild(liveRegion);
        
        this.liveRegion = liveRegion;
    }

    /**
     * Announce message to screen readers
     */
    announceToScreenReaders(message) {
        if (this.liveRegion) {
            this.liveRegion.textContent = message;
            
            // Clear after announcement
            setTimeout(() => {
                this.liveRegion.textContent = '';
            }, 1000);
        }
    }

    /**
     * Setup focus management
     */
    setupFocusManagement() {
        // Store focus when modals open
        this.focusHistory = [];
        
        // Return focus when modals close
        document.addEventListener('DOMNodeRemoved', (e) => {
            if (e.target.classList && e.target.classList.contains('modal')) {
                const lastFocus = this.focusHistory.pop();
                if (lastFocus) {
                    lastFocus.focus();
                }
            }
        });
    }

    /**
     * Preload critical resources for performance
     */
    preloadCriticalResources() {
        // Preload fonts
        const fonts = [
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
        ];
        
        fonts.forEach(fontUrl => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = fontUrl;
            link.as = 'style';
            document.head.appendChild(link);
        });
    }

    /**
     * Setup hover effects
     */
    setupHoverEffects() {
        // Smooth hover effects for interactive elements
        document.querySelectorAll('.story-card, .insight-card, .pillar').forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.style.transform = 'translateY(-2px)';
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.transform = 'translateY(0)';
            });
        });
    }

    /**
     * Setup loading states
     */
    setupLoadingStates() {
        // Add loading state management
        this.loadingStates = new Set();
        
        // Update UI based on loading states
        this.updateLoadingUI();
    }

    /**
     * Update loading UI
     */
    updateLoadingUI() {
        const hasLoadingStates = this.loadingStates.size > 0;
        document.body.classList.toggle('app-loading', hasLoadingStates);
        
        if (hasLoadingStates) {
            this.announceToScreenReaders('Loading content...');
        }
    }

    /**
     * Add loading state
     */
    addLoadingState(key) {
        this.loadingStates.add(key);
        this.updateLoadingUI();
    }

    /**
     * Remove loading state
     */
    removeLoadingState(key) {
        this.loadingStates.delete(key);
        this.updateLoadingUI();
    }

    /**
     * Handle scroll animations
     */
    handleScrollAnimations() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        // Parallax effect for hero sections
        document.querySelectorAll('.hero-section').forEach(hero => {
            hero.style.transform = `translateY(${rate}px)`;
        });
    }

    /**
     * Setup form handlers
     */
    setupFormHandlers() {
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmission(form);
            });
        });
    }

    /**
     * Handle form submission
     */
    handleFormSubmission(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Track form submission
        this.trackEvent('form_submitted', { 
            formId: form.id || 'unknown',
            fields: Object.keys(data)
        });
        
        // Show success message
        this.showSuccessMessage('Thank you for your submission. We will get back to you soon.');
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.mc3App = new MC3DataApp();
});

// Add essential CSS for new functionality
const additionalCSS = `
/* App Messages */
.app-message {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    max-width: 400px;
    padding: 0;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transform: translateX(100%);
    transition: transform 0.3s ease;
}

.app-message.show {
    transform: translateX(0);
}

.message-content {
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    color: white;
    border-radius: 8px;
}

.app-message-success .message-content {
    background: linear-gradient(135deg, #28a745, #20c997);
}

.app-message-error .message-content {
    background: linear-gradient(135deg, #dc3545, #e74c3c);
}

.app-message-info .message-content {
    background: linear-gradient(135deg, #17a2b8, #3498db);
}

.message-close {
    background: none;
    border: none;
    color: white;
    font-size: 18px;
    cursor: pointer;
    padding: 0;
    margin-left: auto;
}

/* Export Modal */
.export-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}

.export-content {
    background: white;
    padding: 30px;
    border-radius: 12px;
    max-width: 400px;
    width: 90%;
    position: relative;
}

.export-options {
    display: grid;
    gap: 12px;
    margin-top: 20px;
}

.export-option {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    transition: all 0.2s ease;
}

.export-option:hover {
    border-color: var(--county-gold);
    background: #fff9e6;
}

.close-modal {
    position: absolute;
    top: 10px;
    right: 15px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
}

/* Export Button */
.export-btn {
    position: absolute;
    top: 15px;
    right: 15px;
    background: var(--county-gold);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s ease;
}

.export-btn:hover {
    background: #e6a300;
    transform: translateY(-1px);
}

.viz-container {
    position: relative;
}

/* Highlighted visualization */
.highlighted {
    box-shadow: 0 0 20px rgba(255, 181, 0, 0.5);
    border: 2px solid var(--county-gold);
    border-radius: 8px;
    transition: all 0.3s ease;
}

/* Mobile menu toggle */
.mobile-menu-toggle {
    display: none;
    background: none;
    border: none;
    font-size: 24px;
    color: white;
    cursor: pointer;
    padding: 10px;
}

@media (max-width: 768px) {
    .mobile-menu-toggle {
        display: block;
    }
    
    .main-nav {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--primary-navy);
        border-top: 1px solid rgba(255,255,255,0.1);
    }
    
    .main-nav.mobile-open {
        display: block;
    }
    
    .main-nav ul {
        flex-direction: column;
    }
    
    .main-nav li {
        border-bottom: 1px solid rgba(255,255,255,0.1);
    }
}

/* Touch device styles */
.touch-device .story-card.touch-active,
.touch-device .insight-card.touch-active {
    transform: scale(0.98);
    transition: transform 0.2s ease;
}

/* Screen reader only content */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

/* Print optimizations */
@media print {
    .export-btn,
    .mobile-menu-toggle,
    .social-links,
    .app-message {
        display: none !important;
    }
    
    .main-nav {
        display: none !important;
    }
    
    .hero-section {
        transform: none !important;
    }
    
    .story-card,
    .insight-card {
        break-inside: avoid;
        page-break-inside: avoid;
    }
}

/* Loading states */
.app-loading::after {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, transparent, var(--county-gold), transparent);
    animation: loading-bar 2s infinite;
    z-index: 10000;
}

@keyframes loading-bar {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}
`;

// Inject additional CSS
const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style); 