# Role-Based Dashboard System

## Overview

BlueBridge now features **two separate dashboards** based on user roles:

1. **Customer Dashboard** - For users who book services
2. **Worker Dashboard** - For service providers

The system automatically detects the user's role and redirects them to the appropriate dashboard.

---

## 📁 File Structure

```
frontend/dashboard/
├── dashboard.html              # Router (redirects based on role)
├── customer-dashboard.html     # Customer-specific dashboard
├── customer-dashboard.js       # Customer dashboard logic
├── worker-dashboard.html       # Worker-specific dashboard
├── worker-dashboard.js         # Worker dashboard logic
├── dashboard.css               # Shared styles for both dashboards
└── dashboard.js                # Legacy file (can be removed)
```

---

## 🎯 How It Works

### 1. **Authentication & Routing**

When a user logs in and completes onboarding:
- Their role (`customer` or `worker`) is stored in `localStorage` as `BlueBridge_user_role`
- When accessing `/dashboard/dashboard.html`, the router checks their role
- User is automatically redirected to the appropriate dashboard

### 2. **Customer Dashboard Features**

**Navigation:**
- Browse Services (Mechanic, Plumber, Electrician, etc.)
- My Bookings
- Favorites
- Nearby Workers
- Wallet
- Profile
- Support & Settings

**Dashboard Widgets:**
- Active Bookings counter
- Completed jobs counter
- Wallet balance
- Favorite workers count
- Quick service access
- Recent activity feed
- Nearby workers list
- Trending services

**Key Pages:**
- Service browsing with worker listings
- Worker profiles with ratings
- Booking management
- Favorites list
- Location-based worker search

### 3. **Worker Dashboard Features**

**Navigation:**
- Job Requests (with notification badge)
- Active Jobs
- Job History
- Availability toggle
- Earnings tracking
- Wallet
- Ratings & Reviews
- Profile
- Support & Settings

**Dashboard Widgets:**
- New job requests counter
- Active jobs counter
- Monthly earnings
- Overall rating
- Job request cards with accept/decline
- Active job tracking
- Earnings overview (daily, weekly, monthly)
- Recent customer reviews
- Weekly performance chart
- Quick stats (jobs completed, success rate)

**Key Pages:**
- Job request management
- Active job tracking
- Earnings and withdrawal
- Availability calendar
- Customer reviews and ratings

### 4. **Availability Toggle (Worker Only)**

Workers have a special status indicator in the topbar:
- **Green dot** = Available for jobs
- **Gray dot** = Offline
- Toggle button to switch between states
- Status is prominently displayed

---

## 🚀 Usage

### For Customers:

1. **Login** → Select "I'm a Customer" → Complete onboarding
2. Automatically redirected to **Customer Dashboard**
3. Browse services, book workers, track bookings
4. View nearby workers on map
5. Manage favorites and wallet

### For Workers:

1. **Login** → Select "I'm a Worker" → Complete onboarding
2. Automatically redirected to **Worker Dashboard**
3. Toggle availability status
4. Review and accept job requests
5. Track active jobs
6. Monitor earnings and ratings

---

## 🔧 Technical Implementation

### Role Detection

```javascript
const userRole = localStorage.getItem('BlueBridge_user_role');

if (userRole === 'customer') {
  window.location.href = 'customer-dashboard.html';
} else if (userRole === 'worker') {
  window.location.href = 'worker-dashboard.html';
}
```

### Role Verification

Each dashboard JavaScript file verifies the user has the correct role:

```javascript
// In customer-dashboard.js
if (userRole !== 'customer') {
  window.location.href = '../dashboard/worker-dashboard.html';
}

// In worker-dashboard.js
if (userRole !== 'worker') {
  window.location.href = '../dashboard/customer-dashboard.html';
}
```

---

## 🎨 Design Differences

### Customer Dashboard
- **Color Scheme:** Primary blue/purple gradients
- **Icons:** Service-focused (🔧, 🚰, ⚡)
- **Layout:** Service discovery focused
- **CTA:** "Book Service"

### Worker Dashboard
- **Color Scheme:** Same theme with work-focused accents
- **Icons:** Job-focused (📬, ⚡, 💰)
- **Layout:** Job management focused
- **CTA:** "Go Online/Offline"
- **Special:** Availability status indicator

---

## 📊 Dashboard Comparison

| Feature | Customer Dashboard | Worker Dashboard |
|---------|-------------------|------------------|
| **Primary Action** | Book services | Accept jobs |
| **Main View** | Service listings | Job requests |
| **Navigation Focus** | Browse & book | Manage & earn |
| **Stats Shown** | Bookings, wallet | Jobs, earnings |
| **Unique Features** | Favorites, nearby workers | Availability toggle, ratings |
| **Topbar** | Search bar | Status indicator |

---

## 🔄 Navigation Flow

```
Login
  ↓
Role Selection
  ↓
Onboarding
  ↓
dashboard.html (Router)
  ↓
  ├─→ customer-dashboard.html (if customer)
  └─→ worker-dashboard.html (if worker)
```

---

## 💡 Key Features

### Shared Features:
- ✅ Responsive design
- ✅ Dark theme with glassmorphism
- ✅ Smooth animations
- ✅ Mobile-friendly sidebar
- ✅ Profile management
- ✅ Wallet integration
- ✅ Support access
- ✅ Settings

### Customer-Specific:
- 🔍 Service search
- ⭐ Favorite workers
- 📍 Location-based discovery
- 📋 Booking tracking
- 💬 Worker reviews

### Worker-Specific:
- 📬 Job request management
- ⚡ Availability toggle
- 💰 Earnings tracking
- ⭐ Rating display
- 📊 Performance analytics
- 👥 Customer management

---

## 🛠️ Customization

### Adding New Pages

**For Customer Dashboard:**
```javascript
// In customer-dashboard.js, add to getPageContent()
'new-page': getNewPage(),

function getNewPage() {
  return `
    <div class="page-header">
      <h1 class="page-title">New Page</h1>
    </div>
    <div class="page-content">
      <!-- Your content -->
    </div>
  `;
}
```

**For Worker Dashboard:**
```javascript
// In worker-dashboard.js, add to getPageContent()
'new-page': getNewPage(),

function getNewPage() {
  return `
    <div class="page-header">
      <h1 class="page-title">New Page</h1>
    </div>
    <div class="page-content">
      <!-- Your content -->
    </div>
  `;
}
```

### Adding Navigation Links

**Customer Dashboard:**
```html
<!-- In customer-dashboard.html -->
<a href="#" class="nav-link" data-page="new-page">
  <span class="nav-icon">🆕</span>
  <span class="nav-text">New Page</span>
</a>
```

**Worker Dashboard:**
```html
<!-- In worker-dashboard.html -->
<a href="#" class="nav-link" data-page="new-page">
  <span class="nav-icon">🆕</span>
  <span class="nav-text">New Page</span>
</a>
```

---

## 🐛 Troubleshooting

### User stuck on loading screen
- Check if `BlueBridge_user_role` is set in localStorage
- Verify user completed onboarding
- Check browser console for errors

### Wrong dashboard loads
- Clear localStorage and re-login
- Verify role selection during onboarding
- Check role-select.html is setting the role correctly

### Styles not loading
- Ensure `dashboard.css` is in the same directory
- Check that `theme.css` and `main.css` are loading
- Clear browser cache

---

## 📝 Future Enhancements

### Planned Features:
- [ ] Real-time job notifications for workers
- [ ] Live chat between customers and workers
- [ ] Advanced filtering for service search
- [ ] Calendar integration for scheduling
- [ ] Payment gateway integration
- [ ] Multi-language support
- [ ] Push notifications
- [ ] Analytics dashboard
- [ ] Export reports (PDF/CSV)
- [ ] Mobile app integration

---

## 🎯 Best Practices

1. **Always check user role** before loading dashboard content
2. **Use consistent naming** for localStorage keys
3. **Validate user data** before displaying
4. **Handle errors gracefully** with fallback UI
5. **Keep dashboards focused** on their primary use case
6. **Test both roles** thoroughly
7. **Maintain shared styles** in dashboard.css
8. **Document new features** in this README

---

## 📞 Support

For issues or questions:
- Check the troubleshooting section above
- Review the code comments in dashboard files
- Contact the development team

---

**Last Updated:** January 8, 2026
**Version:** 2.0.0
**Author:** BlueBridge Development Team
