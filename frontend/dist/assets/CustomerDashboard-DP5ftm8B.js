const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/customer-dashboard-BePCBglK.js","assets/config-Cmdxbuss.js","assets/api-BFM6M95r.js","assets/utils-B2C-mP9z.js"])))=>i.map(i=>d[i]);
import{i as e,n as t,t as n}from"./jsx-runtime-BnxRlLMJ.js";import{t as r}from"./preload-helper-DSXbuxSR.js";var i=e(t(),1),a=`<!DOCTYPE html>\r
<html lang="en">\r
\r
<head>\r
    <meta charset="UTF-8">\r
    <meta name="viewport" content="width=device-width, initial-scale=1.0">\r
    <title>Customer Dashboard | BlueBridge</title>\r
    <!-- Fonts -->\r
    <link rel="preconnect" href="https://fonts.googleapis.com">\r
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\r
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@400;600;800&display=swap" rel="stylesheet">\r
    \r
    <!-- Icons -->\r
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">\r
    \r
    <!-- Base Styles -->\r
    <link rel="stylesheet" href="../../../styles/globals.css">\r
    \r
    <!-- Leaflet CSS for Maps -->\r
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />\r
\r
\r
    <!-- Component Styles -->\r
\r
</head>\r
\r
<body class="bg-shade-dark">\r
    <div class="app-container">\r
        <div class="dashboard-layout">\r
            <!-- Sidebar Navigation -->\r
            <div class="sidebar-overlay" id="sidebar-overlay"\r
                onclick="document.getElementById('sidebar').classList.remove('active'); this.classList.remove('active');">\r
            </div>\r
            <aside class="sidebar" id="sidebar">\r
                <div class="sidebar-header">\r
                    <div class="logo-container">\r
                        <i class="fas fa-toolbox"></i>\r
                        <span class="logo-text">BlueBridge</span>\r
                    </div>\r
                    <button id="sidebarToggle" class="sidebar-toggle-btn" title="Toggle Sidebar">\r
                        <i class="fas fa-chevron-left toggle-icon"></i>\r
                    </button>\r
                </div>\r
\r
                <nav class="sidebar-nav">\r
                    <a href="#" class="nav-item active" data-tab="overview">\r
                        <i class="fas fa-home"></i>\r
                        <span>Overview</span>\r
                    </a>\r
                    <a href="#" class="nav-item" data-tab="book-service">\r
                        <i class="fas fa-calendar-plus"></i>\r
                        <span>Book Service</span>\r
                    </a>\r
                    <a href="#" class="nav-item" data-tab="nearby-workers">\r
                        <i class="fas fa-map-location-dot"></i>\r
                        <span>Nearby Workers</span>\r
                    </a>\r
                    <a href="#" class="nav-item" data-tab="my-bookings">\r
                        <i class="fas fa-list-check"></i>\r
                        <span>My Bookings</span>\r
                    </a>\r
                    <a href="#" class="nav-item" data-tab="wallet">\r
                        <i class="fas fa-wallet"></i>\r
                        <span>Wallet & Cards</span>\r
                    </a>\r
\r
                    <a href="#" class="nav-item" data-tab="profile">\r
                        <i class="fas fa-user-circle"></i>\r
                        <span>My Profile</span>\r
                    </a>\r
                    <a href="#" class="nav-item" data-tab="support">\r
                        <i class="fas fa-headset"></i>\r
                        <span>Support</span>\r
                    </a>\r
                    <a href="#" class="nav-item" data-tab="settings">\r
                        <i class="fas fa-cog"></i>\r
                        <span>Settings</span>\r
                    </a>\r
                </nav>\r
\r
                <div class="sidebar-footer" style="padding: 1.5rem; border-top: 1px solid var(--glass-border);">\r
                    <!-- User Profile (Moved from Header) -->\r
                    <div class="user-profile-sidebar"\r
                        style="display: flex; align-items: center; gap: 0.75rem; color: #fff; background: rgba(255, 255, 255, 0.05); padding: 10px; border-radius: 12px; border: 1px solid var(--glass-border);">\r
\r
                        <div class="avatar-container" style="position: relative; cursor: pointer;"\r
                            onclick="document.getElementById('profile-upload').click()">\r
                            <div class="avatar" id="user-avatar-initials"\r
                                style="width: 45px; height: 45px; font-size: 1.1rem; background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple)); border: 2px solid rgba(255,255,255,0.2);">\r
                                DT</div>\r
                            <img id="user-avatar-img" src="" alt="Profile"\r
                                style="display: none; width: 45px; height: 45px; border-radius: 50%; object-fit: cover; border: 2px solid var(--neon-blue);">\r
\r
                            <div class="avatar-overlay"\r
                                style="position: absolute; bottom: -2px; right: -2px; background: var(--neon-green); width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #1a1a1a;">\r
                                <i class="fas fa-camera" style="font-size: 9px; color: #000;"></i>\r
                            </div>\r
                        </div>\r
\r
                        <input type="file" id="profile-upload" hidden accept="image/*">\r
\r
                        <div class="user-info-text">\r
                            <h4 id="user-display-name" style="font-size: 1rem; margin: 0; font-weight: 700;">Dhruv Tyagi\r
                            </h4>\r
                        </div>\r
                    </div>\r
                </div>\r
            </aside>\r
\r
            <!-- Main Dashboard Area -->\r
            <main class="main-content">\r
                <!-- Topbar -->\r
                <header class="top-header">\r
                    <div class="header-left">\r
                        <div class="logo-container desktop-only" style="margin-right: 2rem;">\r
                            <i class="fas fa-toolbox"></i>\r
                            <span class="logo-text">BlueBridge</span>\r
                        </div>\r
                        <button id="menu-toggle" class="mobile-only"><i class="fas fa-bars"></i></button>\r
                        <div class="search-bar">\r
                            <i class="fas fa-search"></i>\r
                            <input type="text" id="global-search" placeholder="Search services, workers...">\r
                        </div>\r
                    </div>\r
\r
                    <div class="user-actions">\r
\r
\r
                        <!-- Logout Button (Moved from Sidebar) -->\r
                        <button type="button" id="logout-btn-header" onclick="window.performLogout(event)" class="btn btn-ghost"\r
                            style="background: none; border: none; color: var(--neon-pink); display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.5rem;">\r
                            <i class="fas fa-sign-out-alt"></i>\r
                            <span class="desktop-only">Sign Out</span>\r
                        </button>\r
                    </div>\r
                </header>\r
\r
                <!-- Content Area -->\r
                <div id="content-pages">\r
                    <!-- Overview Tab -->\r
                    <section id="overview-tab" class="tab-content section-container">\r
                        <div class="overview-grid-layout">\r
                            <div class="overview-main">\r
                                <!-- New Welcome Banner (Cyan Box) -->\r
                                <div class="welcome-banner">\r
                                    <div class="welcome-text">\r
                                        <h1>Welcome back, <span id="welcome-name">Dhruv</span>! 👋</h1>\r
                                        <p>Find skilled workers for your needs today</p>\r
                                    </div>\r
                                    <button class="banner-btn"\r
                                        onclick="document.querySelector('[data-tab=book-service]').click()">\r
                                        Book Service\r
                                    </button>\r
                                </div>\r
\r
                                <!-- Dashboard Stats -->\r
                                <div class="stats-grid">\r
                                    <div class="stat-card">\r
                                        <div class="stat-icon icon-blue">\r
                                            <i class="fas fa-file-invoice"></i> <!-- Changed icon -->\r
                                        </div>\r
                                        <div class="stat-value" id="stat-active-count">0</div>\r
                                        <div class="stat-label">Active Bookings</div>\r
                                        <div style="font-size: 0.75rem; color: var(--neon-green); margin-top: 5px;">+2\r
                                            this\r
                                            week</div>\r
                                    </div>\r
                                    <div class="stat-card">\r
                                        <div class="stat-icon icon-green">\r
                                            <i class="fas fa-check-square"></i> <!-- Changed icon -->\r
                                        </div>\r
                                        <div class="stat-value" id="stat-completed-count">0</div>\r
                                        <div class="stat-label">Completed</div>\r
                                        <div style="font-size: 0.75rem; color: var(--neon-green); margin-top: 5px;">+5\r
                                            this\r
                                            month</div>\r
                                    </div>\r
                                    <div class="stat-card">\r
                                        <div class="stat-icon icon-purple" style="cursor: pointer;"\r
                                            onclick="document.querySelector('[data-tab=wallet]').click()">\r
                                            <i class="fas fa-wallet"></i>\r
                                        </div>\r
                                        <div class="stat-value" id="stat-wallet-bal">₹1250</div>\r
                                        <!-- Hardcoded for now, JS will update -->\r
                                        <div class="stat-label">Wallet Balance</div>\r
                                        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 5px;">\r
                                            Click to\r
                                            add funds</div>\r
                                    </div>\r
\r
                                </div>\r
\r
                                <!-- Featured Active Booking -->\r
                                <div id="overview-active-booking-container">\r
                                    <!-- Dynamic content for active booking -->\r
                                    <div class="active-booking-card skeleton">\r
                                        <p>Loading active bookings...</p>\r
                                    </div>\r
                                </div>\r
\r
                                <!-- Bottom Sections: Quick Services & Recent Activity -->\r
                                <div class="bottom-sections-grid">\r
                                    <!-- Left: Quick Services -->\r
                                    <div class="quick-services-container">\r
                                        <div class="section-header">\r
                                            <h3>Quick Services</h3>\r
                                            <a href="#" class="view-all-link"\r
                                                onclick="document.querySelector('[data-tab=book-service]').click()">View\r
                                                All</a>\r
                                        </div>\r
                                        <div class="quick-services-grid" id="quick-services-grid">\r
                                            <!-- Static initial content, JS can enhance -->\r
                                            <div class="quick-service-card" onclick="openBookingPage('Mechanic')">\r
                                                <div class="quick-service-icon">🔧</div>\r
                                                <h4>Mechanic</h4>\r
                                            </div>\r
                                            <div class="quick-service-card" onclick="openBookingPage('Plumber')">\r
                                                <div class="quick-service-icon">🚰</div>\r
                                                <h4>Plumber</h4>\r
                                            </div>\r
                                        </div>\r
                                    </div>\r
\r
                                    <!-- Right: Recent Activity -->\r
                                    <div class="recent-activity-container">\r
                                        <div class="section-header">\r
                                            <h3>Recent Activity</h3>\r
                                            <a href="#" class="view-all-link"\r
                                                onclick="document.querySelector('[data-tab=my-bookings]').click()">View\r
                                                All</a>\r
                                        </div>\r
                                        <div class="recent-activity-list" id="recent-activity-list">\r
                                            <!-- Initially static, replaced by JS -->\r
                                            <div class="activity-item">\r
                                                <div class="activity-icon"\r
                                                    style="background: rgba(57, 255, 20, 0.1); color: var(--neon-green);">\r
                                                    <i class="fas fa-check"></i>\r
                                                </div>\r
                                                <div class="activity-details">\r
                                                    <h5>Plumbing Job Completed</h5>\r
                                                    <p>Yesterday, 4:30 PM</p>\r
                                                </div>\r
                                            </div>\r
                                            <div class="activity-item">\r
                                                <div class="activity-icon"\r
                                                    style="background: rgba(0, 210, 255, 0.1); color: var(--neon-blue);">\r
                                                    <i class="fas fa-wallet"></i>\r
                                                </div>\r
                                                <div class="activity-details">\r
                                                    <h5>Wallet Top-up</h5>\r
                                                    <p>Nov 10, 2:00 PM</p>\r
                                                </div>\r
                                            </div>\r
                                        </div>\r
                                    </div>\r
                                </div>\r
                            </div>\r
\r
                            <!-- Sticky AI/Community Sidebar -->\r
                            <!-- Sticky AI/Community Sidebar (Removed) -->\r
                            <div class="overview-sidebar" style="display: none;"></div>\r
                        </div>\r
                    </section>\r
\r
                    <!-- Book Service Tab -->\r
                    <section id="book-service-tab" class="tab-content section-container" style="display: none;">\r
                        <div class="page-header" style="margin-bottom: 2rem;">\r
                            <h1>What do you need help with?</h1>\r
                            <p class="text-secondary">Select a category to find specialized workers near you.</p>\r
                        </div>\r
                        <div class="service-categories-grid">\r
                            <div class="category-card" onclick="openBookingPage('Mechanic')">\r
                                <div class="category-icon">🔧</div>\r
                                <h4>Mechanic</h4>\r
                                <p class="text-muted" style="font-size: 0.8rem;">Vehicle & engine repairs</p>\r
                            </div>\r
                            <div class="category-card" onclick="openBookingPage('Plumber')">\r
                                <div class="category-icon">🚰</div>\r
                                <h4>Plumber</h4>\r
                                <p class="text-muted" style="font-size: 0.8rem;">Pipe leaks & installations</p>\r
                            </div>\r
                        </div>\r
                    </section>\r
\r
                    <!-- Nearby Workers Tab -->\r
                    <section id="nearby-workers-tab" class="tab-content section-container" style="display: none;">\r
                        <div class="page-header"\r
                            style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">\r
                            <div>\r
                                <h1>Nearby Professionals</h1>\r
                                <p class="text-secondary">Explore verified professionals active in your area.</p>\r
                            </div>\r
                            <div class="map-controls" style="display: flex; gap: 1rem;">\r
                                <select id="worker-category-filter" class="btn btn-secondary"\r
                                    style="background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); color: #fff; padding: 0.5rem 1rem; border-radius: 8px;">\r
                                    <option value="all">All Services</option>\r
                                    <option value="Mechanic">Mechanic</option>\r
                                    <option value="Plumber">Plumber</option>\r
                                </select>\r
                                <button class="btn btn-primary" id="refresh-map"\r
                                    style="background: var(--neon-blue); color: #000;"><i class="fas fa-sync-alt"></i>\r
                                    Refresh</button>\r
                            </div>\r
                        </div>\r
                        <div class="nearby-workers-layout"\r
                            style="display: flex; flex-direction: column; gap: 1.5rem; height: auto;">\r
                            <div id="nearby-map" class="nearby-map-container"\r
                                style="height: 400px; width: 100%; border-radius: 20px; border: 1px solid var(--glass-border); overflow: hidden; background: #111;">\r
                            </div>\r
                            <!-- Panel below map, scrollable horizontally -->\r
                            <div class="nearby-workers-list-panel"\r
                                style="width: 100%; background: transparent; border: none; padding: 0; display: flex; flex-direction: column;">\r
                                <h3\r
                                    style="margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem; color: #fff; font-size: 1.2rem;">\r
                                    <span\r
                                        style="width: 10px; height: 10px; background: var(--neon-green); border-radius: 50%; display: inline-block; box-shadow: 0 0 10px var(--neon-green);"></span>\r
                                    Available Professionals\r
                                </h3>\r
                                <div id="nearby-workers-list" class="nearby-workers-list"\r
                                    style="width: 100%; overflow-x: auto; display: flex; gap: 1rem; padding-bottom: 1rem;">\r
                                    <!-- Dynamic list items will appear here -->\r
                                </div>\r
                            </div>\r
                        </div>\r
                    </section>\r
\r
                    <!-- My Bookings Tab -->\r
                    <section id="my-bookings-tab" class="tab-content section-container" style="display: none;">\r
                        <div class="page-header"\r
                            style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">\r
                            <div>\r
                                <h1>My Bookings</h1>\r
                                <p class="text-secondary">Manage and track all your service requests.</p>\r
                            </div>\r
                            <!-- Removed duplicate static filters -->\r
                        </div>\r
                        <div id="bookings-grid" class="bookings-grid-layout">\r
                            <!-- Dynamic list of bookings -->\r
                        </div>\r
                    </section>\r
\r
                    <!-- Wallet Tab -->\r
                    <section id="wallet-tab" class="tab-content section-container" style="display: none;">\r
                        <h1>Wallet & Payments</h1>\r
                        <div id="wallet-container" class="wallet-container" style="margin-top: 2rem;">\r
                            <p class="text-muted">Loading wallet data...</p>\r
                        </div>\r
                    </section>\r
\r
\r
\r
                    <!-- Profile Tab -->\r
                    <section id="profile-tab" class="tab-content section-container" style="display: none;">\r
                        <h1>Your Profile</h1>\r
                        <div id="profile-layout" class="profile-layout" style="margin-top: 2rem;">\r
                        </div>\r
                    </section>\r
\r
                    <!-- Support Tab -->\r
                    <section id="support-tab" class="tab-content section-container" style="display: none;">\r
                        <h1>Help & Support</h1>\r
                        <div id="support-grid" class="support-grid" style="margin-top: 2rem;">\r
                        </div>\r
                    </section>\r
\r
                    <!-- Settings Tab -->\r
                    <section id="settings-tab" class="tab-content section-container" style="display: none;">\r
                        <h1>Dashboard Settings</h1>\r
                        <div class="settings-grid" style="margin-top: 2rem; display: grid; gap: 1.5rem;">\r
                            <div class="settings-card"\r
                                style="background: var(--bg-elevated); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--glass-border);">\r
                                <h3 style="margin-bottom: 0.5rem; color: #fff;">Real-time Tracking Updates</h3>\r
                                <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem;">Choose\r
                                    how the map updates worker locations.</p>\r
\r
                                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">\r
                                    <input type="radio" id="tracking-polling" name="tracking-method" value="polling"\r
                                        onchange="window.saveTrackingMethod('polling')">\r
                                    <label for="tracking-polling" style="cursor: pointer;">\r
                                        <strong style="color: #fff;">Polling Method (Default)</strong><br>\r
                                        <span style="font-size: 0.8rem; color: var(--text-muted);">Updates every 10\r
                                            seconds via API calls. Recommended for stability.</span>\r
                                    </label>\r
                                </div>\r
                                <div style="display: flex; align-items: center; gap: 1rem;">\r
                                    <input type="radio" id="tracking-firestore" name="tracking-method" value="firestore"\r
                                        onchange="window.saveTrackingMethod('firestore')">\r
                                    <label for="tracking-firestore" style="cursor: pointer;">\r
                                        <strong style="color: var(--neon-blue);">Firestore Real-time (Beta)</strong><br>\r
                                        <span style="font-size: 0.8rem; color: var(--text-muted);">Instant updates via\r
                                            live database connection. Best performance.</span>\r
                                    </label>\r
                                </div>\r
                            </div>\r
                        </div>\r
                    </section>\r
                </div>\r
            </main>\r
        </div>\r
\r
        <!-- AI Chat Popup Window -->\r
        <div class="chat-popup-window" id="ai-chat-popup">\r
            <div class="chat-popup-header">\r
                <div style="display: flex; align-items: center; gap: 10px;">\r
                    <div class="avatar" style="width: 35px; height: 35px; background: rgba(255,255,255,0.2);"><i\r
                            class="fas fa-robot"></i></div>\r
                    <div>\r
                        <h4 style="color: #fff; margin: 0; font-size: 1rem;">BlueBridge AI</h4>\r
                        <span style="font-size: 0.7rem; color: rgba(255,255,255,0.8); display: block;">Online &\r
                            Ready</span>\r
                    </div>\r
                </div>\r
                <div class="chat-controls">\r
                    <button class="control-btn" id="minimize-chat-popup" title="Minimize"><i\r
                            class="fas fa-minus"></i></button>\r
                    <button class="control-btn" id="maximize-chat-popup" title="Maximize"><i\r
                            class="fas fa-expand"></i></button>\r
                    <button class="close-chat-btn" id="close-chat-popup" title="Close"><i\r
                            class="fas fa-times"></i></button>\r
                </div>\r
            </div>\r
            <div class="chat-popup-body" id="chat-popup-body">\r
                <div class="ai-message">\r
                    <p>Hello Dhruv! 👋 I'm your personal assistant. I can help you find workers, check rates, or track\r
                        your\r
                        bookings. How can I help today?</p>\r
                </div>\r
            </div>\r
            <div class="chat-popup-footer">\r
                <!-- File Preview Area -->\r
                <div id="chat-file-preview" class="chat-file-preview"></div>\r
\r
                <div class="chat-input-wrapper">\r
                    <!-- Hidden File Input -->\r
                    <input type="file" id="chat-file-input" hidden\r
                        accept="image/png, image/jpeg, image/webp, application/pdf">\r
\r
                    <!-- Attach Button -->\r
                    <button id="chat-attach-btn" title="Attach Image or PDF"><i class="fas fa-paperclip"></i></button>\r
\r
                    <input type="text" id="ai-popup-input" placeholder="Ask anything..." autocomplete="off">\r
\r
                    <!-- Mic Button -->\r
                    <button id="chat-mic-btn" title="Speak"><i class="fas fa-microphone"></i></button>\r
\r
                    <!-- Send Button -->\r
                    <button id="ai-popup-send" title="Send"><i class="fas fa-paper-plane"></i></button>\r
                </div>\r
            </div>\r
        </div>\r
\r
        <!-- AI Floating Widget Toggle -->\r
        <div class="ai-widget-container">\r
            <button class="ai-toggle-btn" id="ai-widget-toggle">\r
                <i class="fas fa-robot"></i>\r
            </button>\r
        </div>\r
\r
        <!-- Multi-step Booking Modal (Placeholder for dynamic UI) -->\r
        <div class="modal-overlay" id="booking-modal-overlay">\r
            <div class="modal-container">\r
                <div id="booking-modal-content">\r
                </div>\r
            </div>\r
        </div>\r
\r
        <!-- Scripts -->\r
        <!-- Config loaded first -->\r
\r
\r
        <!-- Leaflet JS -->\r
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""><\/script>\r
        <!-- Dynamic Dashboard Worker Modal -->\r
        <div class="profile-modal" id="dashboard-worker-modal">\r
            <div class="profile-modal-content">\r
                <button class="profile-close" onclick="closeDashboardWorkerModal()"><i\r
                        class="fas fa-times"></i></button>\r
                <div class="profile-header-banner">\r
                    <div class="profile-avatar-large" id="dash-modal-avatar">UP</div>\r
                </div>\r
                <div class="profile-body">\r
                    <div style="margin-bottom: 1.5rem;">\r
                        <h2 id="dash-modal-name" style="margin: 0; font-size: 1.8rem; color: #fff;">Walter White</h2>\r
                        <p id="dash-modal-category" style="margin: 5px 0; color: var(--neon-blue); font-weight: 500;">\r
                            Plumber • 5 Years Exp</p>\r
                    </div>\r
\r
                    <div style="margin-bottom: 1.5rem;">\r
                        <h4 style="margin-bottom: 10px; color: #fff;">About Professional</h4>\r
                        <p id="dash-modal-bio"\r
                            style="font-size: 0.9rem; line-height: 1.6; color: var(--text-secondary); margin: 0;">\r
                            Reliable professional with excellent service history.\r
                        </p>\r
                    </div>\r
\r
                    <div style="margin-bottom: 1.5rem;">\r
                        <h4 style="margin-bottom: 10px; color: #fff;">Skills</h4>\r
                        <div id="dash-modal-skills">\r
                            <span class="skill-tag">Expert</span>\r
                        </div>\r
                    </div>\r
\r
                    <button class="btn btn-primary btn-block" style="margin-top: 1rem;"\r
                        onclick="closeDashboardWorkerModal(); document.querySelector('[data-tab=book-service]').click()">Find\r
                        and Book</button>\r
                </div>\r
            </div>\r
        </div>\r
</body>\r
\r
</html>`,o=n(),s=()=>((0,i.useEffect)(()=>{try{r(()=>import(`./customer-dashboard-BePCBglK.js`),__vite__mapDeps([0,1,2,3])),r(()=>import(`./customer-dashboard-interactive-DM0F6McP.js`),[]),r(()=>import(`./customer-realtime-tracking-BavXIT9-.js`),[])}catch(e){console.error(`Failed to inject customer dashboard modules:`,e)}},[]),(0,o.jsx)(i.Fragment,{children:(0,o.jsx)(`div`,{className:`customer-dashboard-body bg-shade-dark`,dangerouslySetInnerHTML:{__html:a}})}));export{s as default};