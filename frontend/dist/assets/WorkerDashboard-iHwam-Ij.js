const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/worker-dashboard-CpOBdZxI.js","assets/config-Cmdxbuss.js","assets/api-BFM6M95r.js","assets/utils-B2C-mP9z.js","assets/worker-dashboard-part2-D0Zbm5bs.js","assets/worker-location-tracker-RA0famDt.js"])))=>i.map(i=>d[i]);
import{i as e,n as t,t as n}from"./jsx-runtime-BnxRlLMJ.js";import{t as r}from"./preload-helper-DSXbuxSR.js";var i=e(t(),1),a=`<!-- Sidebar -->\r
<aside class="sidebar" id="sidebar">\r
    <div class="sidebar-header">\r
        <div class="logo">\r
            <span class="logo-icon"><i class="fas fa-hammer"></i></span>\r
            <span class="logo-text">BlueBridge</span>\r
        </div>\r
        <button class="sidebar-toggle" id="sidebarToggle" title="Toggle Sidebar">\r
            <i class="fas fa-chevron-left toggle-icon"></i>\r
        </button>\r
    </div>\r
\r
    <nav class="sidebar-nav">\r
        <div class="nav-section">\r
            <h3 class="nav-section-title">Work</h3>\r
            <a href="#" class="nav-link" data-page="home">\r
                <span class="nav-icon"><i class="fas fa-chart-pie"></i></span>\r
                <span class="nav-text">Overview</span>\r
            </a>\r
            <a href="#" class="nav-link" data-page="profile">\r
                <span class="nav-icon"><i class="fas fa-user"></i></span>\r
                <span class="nav-text">My Profile</span>\r
            </a>\r
            <a href="#" class="nav-link" data-page="job-requests">\r
                <span class="nav-icon"><i class="fas fa-envelope-open-text"></i></span>\r
                <span class="nav-text">Job Requests</span>\r
                <span class="badge badge-primary" id="requestCount">3</span>\r
            </a>\r
            <a href="#" class="nav-link" data-page="active-jobs">\r
                <span class="nav-icon"><i class="fas fa-bolt"></i></span>\r
                <span class="nav-text">Active Jobs</span>\r
            </a>\r
            <a href="#" class="nav-link" data-page="job-history">\r
                <span class="nav-icon"><i class="fas fa-clipboard-list"></i></span>\r
                <span class="nav-text">Job History</span>\r
            </a>\r
            <a href="#" class="nav-link" data-page="availability">\r
                <span class="nav-icon"><i class="fas fa-calendar-alt"></i></span>\r
                <span class="nav-text">Availability</span>\r
            </a>\r
        </div>\r
\r
        <div class="nav-section">\r
            <h3 class="nav-section-title">Earnings</h3>\r
            <a href="#" class="nav-link" data-page="earnings">\r
                <span class="nav-icon"><i class="fas fa-wallet"></i></span>\r
                <span class="nav-text">My Earnings</span>\r
            </a>\r
            <a href="#" class="nav-link" data-page="wallet">\r
                <span class="nav-icon"><i class="fas fa-credit-card"></i></span>\r
                <span class="nav-text">Wallet</span>\r
            </a>\r
            <a href="#" class="nav-link" data-page="ratings">\r
                <span class="nav-icon"><i class="fas fa-star"></i></span>\r
                <span class="nav-text">Ratings & Reviews</span>\r
            </a>\r
\r
        </div>\r
\r
\r
        <div class="nav-section">\r
            <h3 class="nav-section-title">Account</h3>\r
            <a href="#" class="nav-link" data-page="support">\r
                <span class="nav-icon"><i class="fas fa-life-ring"></i></span>\r
                <span class="nav-text">Support</span>\r
            </a>\r
\r
            <a href="#" class="nav-link" data-page="settings">\r
                <span class="nav-icon"><i class="fas fa-cog"></i></span>\r
                <span class="nav-text">Settings</span>\r
            </a>\r
        </div>\r
    </nav>\r
\r
    <div class="sidebar-footer">\r
        <div class="user-profile">\r
            <div class="user-avatar"><i class="fas fa-user-hard-hat"></i></div>\r
            <div class="user-info">\r
                <div class="user-name" id="userName">Worker</div>\r
                <div class="user-role" id="userRole">Service Provider</div>\r
            </div>\r
        </div>\r
    </div>\r
</aside>\r
\r
<!-- Main Content -->\r
<main class="main-content">\r
    <header class="topbar">\r
        <button class="mobile-menu-btn" id="mobileMenuBtn">\r
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">\r
                <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" />\r
            </svg>\r
        </button>\r
\r
        <div class="topbar-status">\r
            <div class="status-indicator">\r
                <span class="status-dot status-online" id="statusDot"></span>\r
                <span class="status-text" id="statusText">Available</span>\r
            </div>\r
            <!-- Live Tracking Indicator -->\r
            <div id="liveTrackingIndicator"\r
                style="display: none; align-items: center; gap: 0.5rem; margin-left: 1rem; padding: 0.5rem 1rem; background: rgba(57, 255, 20, 0.1); border: 1px solid rgba(57, 255, 20, 0.3); border-radius: 20px;">\r
                <span\r
                    style="width: 8px; height: 8px; background: var(--neon-green); border-radius: 50%; animation: pulse 2s infinite;"></span>\r
                <span style="color: var(--neon-green); font-size: 0.85rem; font-weight: 600;">Live</span>\r
            </div>\r
            <button class="btn btn-sm btn-primary" id="startGPSBtn" onclick="window.startGPS()" style="margin-left: 0.5rem; background: var(--neon-blue); color: #000; border: none; font-weight: 700; display: none;">\r
                <i class="fas fa-location-crosshairs"></i> START GPS\r
            </button>\r
            <button class="btn btn-sm btn-secondary" id="toggleAvailability">Go Offline</button>\r
        </div>\r
\r
        <div class="topbar-actions" style="margin-left: auto;">\r
\r
\r
            <button type="button" id="headerSignOutBtn" onclick="window.performLogout(event)"\r
                style="background: none; border: none; color: #ff4444; margin-left: 1rem; display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-weight: 600; padding: 0.5rem;">\r
                <span class="d-none d-md-inline">Sign Out</span>\r
                <i class="fas fa-sign-out-alt"></i>\r
            </button>\r
        </div>\r
    </header>\r
\r
    <div class="content-area" id="contentArea">\r
        <!-- Dynamic content will be loaded here -->\r
    </div>\r
</main>\r
\r
`,o=n(),s=()=>((0,i.useEffect)(()=>{try{r(()=>import(`./worker-dashboard-CpOBdZxI.js`),__vite__mapDeps([0,1,2,3])),r(()=>import(`./worker-dashboard-part2-D0Zbm5bs.js`),__vite__mapDeps([4,1,2,3])),r(()=>import(`./worker-location-tracker-RA0famDt.js`),__vite__mapDeps([5,1,2]))}catch(e){console.error(`Failed to inject worker dashboard modules:`,e)}},[]),(0,o.jsx)(i.Fragment,{children:(0,o.jsx)(`div`,{className:`dashboard-body`,dangerouslySetInnerHTML:{__html:a}})}));export{s as default};