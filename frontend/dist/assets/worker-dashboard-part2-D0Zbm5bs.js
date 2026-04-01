import{t as e}from"./utils-B2C-mP9z.js";import"./config-Cmdxbuss.js";import{t}from"./api-BFM6M95r.js";var n=()=>window.dashboardData||{jobs:{active:[],pending:[],completed:[]},earnings:{today:0,week:0,month:0,total:0},reviews:[],performance:{satisfaction:0,onTime:0,responseRate:0,repeatCustomers:0}};function r(){let t={isOnline:!1,workingHours:{monday:{enabled:!0,start:`09:00`,end:`17:00`},tuesday:{enabled:!0,start:`09:00`,end:`17:00`},wednesday:{enabled:!0,start:`09:00`,end:`17:00`},thursday:{enabled:!0,start:`09:00`,end:`17:00`},friday:{enabled:!0,start:`09:00`,end:`17:00`},saturday:{enabled:!1,start:`10:00`,end:`14:00`},sunday:{enabled:!1,start:`10:00`,end:`14:00`}}},n=e.get(`worker_availability`)||t;n.workingHours||=t.workingHours;let r=[`monday`,`tuesday`,`wednesday`,`thursday`,`friday`,`saturday`,`sunday`],i=`<div class="schedule-grid">`;return r.forEach(e=>{let r=n.workingHours[e]||t.workingHours[e],a=r.enabled,o=e.charAt(0).toUpperCase()+e.slice(1),s=a?`active`:``,c=a?`flex`:`none`,l=a?`none`:`block`;i+=`
      <div class="schedule-day ${s}" id="row-${e}">
        <div class="schedule-day-header">
          <span class="day-name">${o}</span>
          <label class="switch">
            <input type="checkbox" id="toggle-${e}" ${a?`checked`:``} onchange="window.toggleDayStatus('${e}')">
            <span class="slider round"></span>
          </label>
        </div>
        
        <div class="schedule-time" id="time-group-${e}" style="display: ${c};">
          <div class="time-input-group">
            <label class="time-input-label">From</label>
            <input type="time" id="start-${e}" value="${r.start}" class="time-input">
          </div>
          <div class="time-input-group">
            <label class="time-input-label">To</label>
            <input type="time" id="end-${e}" value="${r.end}" class="time-input">
          </div>
        </div>
        
        <div class="schedule-time-disabled" id="disabled-msg-${e}" style="display: ${l};">
          Not Available
        </div>
        
        ${e===`monday`?`
        <button class="btn btn-sm btn-ghost" title="Copy to all weekdays" onclick="window.copyMondayToAll()" style="margin-top: 0.5rem; width: 100%; border: 1px dashed var(--border-primary); color: var(--text-tertiary);">
          <i class="fas fa-copy"></i> Copy to Weekdays
        </button>`:``}
      </div>
    `}),i+=`</div>`,`
    <div class="availability-container pb-20">
      <div class="page-header">
        <h1 class="page-title"><i class="fas fa-calendar-alt" style="color:var(--primary-400);"></i> Availability Settings</h1>
        <p class="page-subtitle">Manage your working hours and availability for job requests</p>
      </div>
      
      <div class="status-card">
        <div>
          <h2 style="font-size: 1.5rem; margin-bottom: 0.5rem;"><i class="fas fa-clock" style="color: var(--neon-blue);"></i> Weekly Schedule</h2>
          <p style="color: var(--text-secondary); margin: 0;">Set the hours you are available to receive assignments.</p>
        </div>
        <button id="saveAvailabilityBtn" class="btn btn-primary" onclick="window.saveAvailability()" style="padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 600;">
          <i class="fas fa-save" style="margin-right:8px;"></i> Save Changes
        </button>
      </div>
      
      ${i}
    </div>
  `}window.toggleDayStatus=function(e){let t=document.getElementById(`toggle-${e}`).checked,n=document.getElementById(`row-${e}`),r=document.getElementById(`time-group-${e}`),i=document.getElementById(`disabled-msg-${e}`);t?(n.classList.add(`active`),r.style.display=`flex`,i.style.display=`none`):(n.classList.remove(`active`),r.style.display=`none`,i.style.display=`block`)},window.copyMondayToAll=function(){let e=document.getElementById(`start-monday`).value,t=document.getElementById(`end-monday`).value,n=document.getElementById(`toggle-monday`).checked;[`tuesday`,`wednesday`,`thursday`,`friday`].forEach(r=>{document.getElementById(`toggle-${r}`).checked=n,document.getElementById(`start-${r}`).value=e,document.getElementById(`end-${r}`).value=t,window.toggleDayStatus(r)}),typeof window.showToast==`function`?window.showToast(`Copied Monday times to all weekdays`,`success`):typeof showToast==`function`?showToast(`Copied Monday times to all weekdays`,`success`):alert(`Copied Monday times to all weekdays`)},window.saveAvailability=async function(){let n=document.getElementById(`saveAvailabilityBtn`);n&&(n.innerHTML=`<i class="fas fa-spinner fa-spin" style="margin-right:8px;"></i> Saving...`,n.disabled=!0);try{let n=[`monday`,`tuesday`,`wednesday`,`thursday`,`friday`,`saturday`,`sunday`],r={};n.forEach(e=>{r[e]={enabled:document.getElementById(`toggle-${e}`).checked,start:document.getElementById(`start-${e}`).value||`09:00`,end:document.getElementById(`end-${e}`).value||`17:00`}});let i={...e.get(`worker_availability`)||{},workingHours:r};e.set(`worker_availability`,i);let a=e.get(`BlueBridge_user`);if(a&&a.uid&&t!==void 0&&t.workers&&typeof t.workers.updateProfile==`function`)try{await t.workers.updateProfile(a.uid,{availability:i})}catch(e){console.warn(`Backend sync for availability may have failed or endpoint differs:`,e)}typeof window.showToast==`function`?window.showToast(`Availability schedule saved successfully!`,`success`):typeof showToast==`function`?showToast(`Availability schedule saved successfully!`,`success`):alert(`Availability schedule saved successfully!`)}catch(e){console.error(`Error saving availability:`,e),typeof window.showToast==`function`?window.showToast(`Error saving: `+e.message,`error`):typeof showToast==`function`&&showToast(`Error saving: `+e.message,`error`)}finally{n&&(n.innerHTML=`<i class="fas fa-save" style="margin-right:8px;"></i> Save`,n.disabled=!1)}};async function i(){let n=e.get(`BlueBridge_user`);if(!n)return;let r=document.getElementById(`earnings-placeholder`);if(r){r.innerHTML=`
      <div style="text-align:center; padding: 4rem;">
          <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--success);"></i>
          <p style="margin-top: 1rem; color: var(--text-tertiary);">Loading your earnings...</p>
      </div>
  `;try{let e=await t.transactions.getByUser(n.uid),i=new Date,a=new Date(i.getFullYear(),i.getMonth(),i.getDate()),o=new Date,s=new Date(o.setDate(o.getDate()-o.getDay())),l=new Date(i.getFullYear(),i.getMonth(),1),u=0,d=0,f=0,p=0,m=e.filter(e=>e.type===`credit`);m.forEach(e=>{let t=new Date(e.createdAt),n=parseFloat(e.amount);t>=a&&(u+=n),t>=s&&(d+=n),t>=l&&(f+=n),p+=n}),r.innerHTML=`
        <div class="page-header">
          <h1 class="page-title"><i class="fas fa-wallet" style="color:var(--success);"></i> My Earnings</h1>
          <p class="page-subtitle">Track your income and financial performance</p>
        </div>
        
        <div class="earnings-dashboard">
          <div class="earnings-summary-grid">
            <div class="earnings-summary-card">
              <div class="summary-icon"><i class="fas fa-calendar-day"></i></div>
              <div class="summary-content">
                <span class="summary-label">Today</span>
                <span class="summary-value">₹${u.toLocaleString()}</span>
              </div>
            </div>
            <div class="earnings-summary-card">
              <div class="summary-icon"><i class="fas fa-chart-bar"></i></div>
              <div class="summary-content">
                <span class="summary-label">This Week</span>
                <span class="summary-value">₹${d.toLocaleString()}</span>
              </div>
            </div>
            <div class="earnings-summary-card">
              <div class="summary-icon"><i class="fas fa-chart-line"></i></div>
              <div class="summary-content">
                <span class="summary-label">This Month</span>
                <span class="summary-value">₹${f.toLocaleString()}</span>
              </div>
            </div>
            <div class="earnings-summary-card">
              <div class="summary-icon"><i class="fas fa-gem"></i></div>
              <div class="summary-content">
                <span class="summary-label">Total Earned</span>
                <span class="summary-value">₹${p.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <!-- Weekly Chart -->
          <div class="card">
            <div class="card-header">
              <h2>Weekly Earnings</h2>
            </div>
            <div class="chart-container" style="height: 300px; position: relative;">
              <canvas id="earningsChart"></canvas>
            </div>
          </div>
          
          <!-- Recent Transactions -->
          <div class="card">
            <div class="card-header">
              <h2>Recent Transactions</h2>
              <button class="btn-text" onclick="loadPage('wallet')">View All</button>
            </div>
            <div class="earnings-history">
              ${m.slice(0,5).map(e=>`
                <div class="earning-item">
                  <div class="earning-info">
                    <h4>${e.description||e.source}</h4>
                    <span class="earning-date">${new Date(e.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div class="earning-amount">
                    <span class="amount-value">+₹${e.amount}</span>
                    <span class="badge badge-success">${e.status}</span>
                  </div>
                </div>
              `).join(``)}
              ${m.length===0?`<p>No earnings yet.</p>`:``}
            </div>
          </div>
        </div>
    `,typeof c==`function`&&setTimeout(()=>c(e),100)}catch(e){console.error(`Earnings Load Error:`,e),r.innerHTML=`
        <div class="error-state">
            <i class="fas fa-exclamation-circle" style="font-size: 2.5rem; color: var(--error);"></i>
            <h3>Failed to load earnings</h3>
            <p>Please try again later. Error: ${e.message}</p>
            <button class="btn btn-secondary" onclick="fetchAndRenderEarningsPage()">Retry</button>
        </div>
    `}}}function a(){let e=n().earnings||{today:0,week:0,month:0,total:0};return`
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-wallet"></i> My Earnings</h1>
      <p class="page-subtitle">Track your income and payment history</p>
    </div>
    
    <div id="earnings-placeholder" class="earnings-dashboard-placeholder">
        <!-- Will be populated by fetchAndRenderEarningsPage -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <i class="fas fa-calendar-day"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">₹${e.today}</div>
              <div class="stat-label">Today</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
              <i class="fas fa-calendar-week"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">₹${e.week}</div>
              <div class="stat-label">This Week</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
              <i class="fas fa-calendar-alt"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">₹${e.month}</div>
              <div class="stat-label">This Month</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
              <i class="fas fa-coins"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">₹${e.total}</div>
              <div class="stat-label">Total Earned</div>
            </div>
          </div>
        </div>
    </div>
  `}function o(){return`
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-credit-card"></i> Wallet</h1>
      <p class="page-subtitle">Manage your balance and withdrawals</p>
    </div>
    
    <div class="card">
      <div class="card-header">
        <h2>Wallet Balance</h2>
      </div>
      <div class="card-body">
        <div style="text-align: center; padding: 2rem;">
          <div style="font-size: 3rem; font-weight: bold; color: var(--primary-400);">₹${n().earnings.total||0}</div>
          <p style="color: var(--text-secondary); margin-top: 0.5rem;">Available Balance</p>
          <button class="btn btn-primary" style="margin-top: 1rem;" onclick="alert('Withdrawal feature coming soon!')">
            <i class="fas fa-money-bill-wave"></i> Withdraw Funds
          </button>
        </div>
      </div>
    </div>
  `}function s(){let t=e.get(`worker_reviews`)||n().reviews||[],r=t.length>0?t.reduce((e,t)=>e+(t.rating||0),0)/t.length:0,i={5:0,4:0,3:0,2:0,1:0};return t.forEach(e=>{i[e.rating]!==void 0&&i[e.rating]++}),`
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-star" style="color:#fbbf24;"></i> Ratings & Reviews</h1>
      <p class="page-subtitle">See what customers say about your work</p>
    </div>
    
    <div class="ratings-container">
      <div class="card rating-summary-card">
        <div class="rating-summary">
          <div class="rating-score">
            <div class="score-value">${r.toFixed(1)}</div>
            <div class="score-stars">${`⭐`.repeat(Math.round(r))}</div>
            <div class="score-count">${t.length} reviews</div>
          </div>
          
          <div class="rating-distribution">
            ${[5,4,3,2,1].map(e=>{let n=i[e];return`
                <div class="rating-bar">
                  <span class="rating-label">${e} <i class="fas fa-star" style="color:#fbbf24;"></i></span>
                  <div class="rating-progress">
                    <div class="rating-progress-fill" style="width: ${t.length>0?n/t.length*100:0}%"></div>
                  </div>
                  <span class="rating-count">${n}</span>
                </div>
              `}).join(``)}
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <h2>Customer Reviews</h2>
        </div>
        <div class="reviews-list">
          ${t.length>0?t.map(e=>`
            <div class="review-card">
              <div class="review-header">
                <div class="review-customer">
                  <div class="customer-avatar">${(e.customerName||`U`).charAt(0)}</div>
                  <div class="customer-info">
                    <h4>${e.customerName||`Anonymous`}</h4>
                    <span class="review-date">${new Date(e.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div class="review-rating">
                  <span class="rating-stars">${`⭐`.repeat(e.rating||0)}</span>
                  <span class="rating-value">${e.rating||0}/5</span>
                </div>
              </div>
              <p class="review-comment">"${e.comment||`No comment provided`}"</p>
            </div>
          `).join(``):`<p style="text-align: center; padding: 2rem; color: var(--text-secondary);">No reviews yet</p>`}
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <h2><i class="fas fa-chart-pie" style="color:var(--primary-400);"></i> Performance Insights</h2>
        </div>
        <div class="insights-grid">
          <div class="insight-item">
            <span class="insight-icon"><i class="fas fa-bullseye" style="color:var(--error);"></i></span>
            <div class="insight-content">
              <span class="insight-value">${n().performance.satisfaction}%</span>
              <span class="insight-label">Customer Satisfaction</span>
            </div>
          </div>
          <div class="insight-item">
            <span class="insight-icon"><i class="fas fa-bolt" style="color:#fbbf24;"></i></span>
            <div class="insight-content">
              <span class="insight-value">${n().performance.onTime}%</span>
              <span class="insight-label">On-Time Completion</span>
            </div>
          </div>
          <div class="insight-item">
            <span class="insight-icon"><i class="fas fa-comments" style="color:var(--info);"></i></span>
            <div class="insight-content">
              <span class="insight-value">${n().performance.responseRate}%</span>
              <span class="insight-label">Response Rate</span>
            </div>
          </div>
          <div class="insight-item">
            <span class="insight-icon"><i class="fas fa-sync" style="color:var(--success);"></i></span>
            <div class="insight-content">
              <span class="insight-value">${n().performance.repeatCustomers}%</span>
              <span class="insight-label">Repeat Customers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `}function c(e){let t=document.getElementById(`earningsChart`)?.getContext(`2d`);t&&window.Chart&&new Chart(t,{type:`line`,data:{labels:[`Mon`,`Tue`,`Wed`,`Thu`,`Fri`,`Sat`,`Sun`],datasets:[{label:`Earnings (₹)`,data:[0,0,0,0,0,0,0],borderColor:`#3b82f6`,tension:.4}]},options:{responsive:!0,maintainAspectRatio:!1}})}function l(e){console.log(`Update earnings chart for:`,e)}window.updatePerformanceChart=function(e){let t=document.getElementById(`performanceChart`);if(!t)return;let r=t.getContext(`2d`);if(!r)return;let i=t.parentElement;t.width=i.clientWidth||800,t.height=i.clientHeight||300;let a=t.width,o=t.height,s=n(),c=[...s.jobs.completed||[],...s.jobs.active||[],...s.jobs.pending||[]],l=[`Mon`,`Tue`,`Wed`,`Thu`,`Fri`,`Sat`,`Sun`],u=[0,0,0,0,0,0,0],d=new Date,f=new Date(d),p=d.getDay(),m=p===0?6:p-1;f.setDate(d.getDate()-m),f.setHours(0,0,0,0),c.forEach(e=>{let t=e.createdAt||e.created_at||e.updated_at||e.timestamp||e.date;if(!t)return;let n=new Date(t);if(isNaN(n.getTime()))return;let r=Math.floor((n.getTime()-f.getTime())/(1e3*60*60*24));r>=0&&r<7&&u[r]++});let h=Math.max(...u,1),g=a-46-24,_=o-24-48,v=g/7,y=v*.45;r.clearRect(0,0,a,o),r.strokeStyle=`rgba(255,255,255,0.06)`,r.lineWidth=1,r.fillStyle=`rgba(255,255,255,0.3)`,r.font=`11px Inter, sans-serif`,r.textAlign=`right`;for(let e=0;e<=5;e++){let t=24+_-e/5*_;r.beginPath(),r.moveTo(46,t),r.lineTo(46+g,t),r.stroke();let n=Math.round(e/5*h);r.fillText(n,38,t+4)}let b=(d.getDay()+6)%7;u.forEach((e,t)=>{let n=46+t*v+(v-y)/2,i=e/h*_,a=24+_-i,o=r.createLinearGradient(0,a,0,a+i);t===b?(o.addColorStop(0,`rgba(0, 210, 255, 0.95)`),o.addColorStop(1,`rgba(0, 120, 200, 0.6)`)):(o.addColorStop(0,`rgba(99, 102, 241, 0.85)`),o.addColorStop(1,`rgba(99, 102, 241, 0.25)`)),r.fillStyle=o;let s=Math.min(6,y/2,i||1);r.beginPath(),r.moveTo(n+s,a),r.lineTo(n+y-s,a),r.quadraticCurveTo(n+y,a,n+y,a+s),r.lineTo(n+y,a+i),r.lineTo(n,a+i),r.lineTo(n,a+s),r.quadraticCurveTo(n,a,n+s,a),r.closePath(),r.fill(),e>0&&(r.fillStyle=t===b?`rgba(0,210,255,0.9)`:`rgba(255,255,255,0.7)`,r.font=`bold 11px Inter, sans-serif`,r.textAlign=`center`,r.fillText(e,n+y/2,a-6)),r.fillStyle=t===b?`rgba(0,210,255,0.9)`:`rgba(255,255,255,0.45)`,r.font=t===b?`bold 12px Inter, sans-serif`:`11px Inter, sans-serif`,r.textAlign=`center`,r.fillText(l[t],n+y/2,24+_+20)}),r.strokeStyle=`rgba(255,255,255,0.1)`,r.lineWidth=1,r.beginPath(),r.moveTo(46,24+_),r.lineTo(46+g,24+_),r.stroke()};function u(){return`
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-life-ring"></i> Support</h1>
      <p class="page-subtitle">Get help when you need it</p>
    </div>
    
    <div class="card">
      <div class="card-header">
        <h2>Contact Support</h2>
      </div>
      <div class="card-body">
        <p>Need help? Contact our support team:</p>
        <p style="margin-top: 1rem;"><strong>Email:</strong> support@BlueBridge.com</p>
        <p><strong>Phone:</strong> +91-1800-123-4567</p>
        <p><strong>Hours:</strong> 9 AM - 6 PM (Mon-Sat)</p>
      </div>
    </div>
  `}function d(){let t=e.get(`BlueBridge_user`)||{};return`
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-cog"></i> Settings</h1>
      <p class="page-subtitle">Manage your account preferences</p>
    </div>
    
    <div class="card">
      <div class="card-header">
        <h2>Account Settings</h2>
      </div>
      <div class="card-body">
        <div class="form-group">
          <label>Email</label>
          <input type="email" class="form-control" value="${t.email||``}" readonly>
        </div>
        <div class="form-group">
          <label>Phone</label>
          <input type="tel" class="form-control" value="${t.phone||``}" readonly>
        </div>
        <button class="btn btn-primary" onclick="alert('Change password coming soon!')">
          <i class="fas fa-key"></i> Change Password
        </button>
      </div>
    </div>
  `}function f(e,t){console.log(`Initialized page: ${e}`,t),e===`home`?(updatePerformanceChart(`week`),typeof window.fetchAndRenderJobRequests==`function`&&window.fetchAndRenderJobRequests(),typeof window.fetchAndRenderActiveJobs==`function`&&window.fetchAndRenderActiveJobs()):e===`job-history`?typeof window.fetchAndRenderJobHistory==`function`&&window.fetchAndRenderJobHistory():e===`earnings`?(i(),l(`week`)):e===`active-jobs`?typeof window.fetchAndRenderActiveJobs==`function`&&window.fetchAndRenderActiveJobs():e===`job-requests`&&typeof window.fetchAndRenderJobRequests==`function`&&window.fetchAndRenderJobRequests()}window.getAvailabilityPage=r,window.getEarningsPage=a,window.getWalletPage=o,window.getRatingsPage=s,window.getRatingsReviewsPage=s,window.getSupportPage=u,window.getSettingsPage=d,window.initializePage=f,window.fetchAndRenderEarningsPage=i;