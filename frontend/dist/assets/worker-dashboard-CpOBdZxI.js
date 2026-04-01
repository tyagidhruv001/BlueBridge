import{a as e,i as t,o as n,r,t as i}from"./utils-B2C-mP9z.js";import{_ as a,a as o,c as s,f as c,g as l,h as u,i as d,n as f,o as p,p as m,r as h,t as g,u as _}from"./config-Cmdxbuss.js";import{n as v,t as y}from"./api-BFM6M95r.js";window.activeBookingIds=[];var b=[],x=[],S=(e,t)=>!e||!t||e.length!==t.length?!1:e.length===0&&t.length===0?!0:e.every((e,n)=>{let r=t[n];return e&&r&&e.id===r.id&&e.status===r.status});window.acceptJob=async function(r){if(console.log(`Accepting booking:`,r),confirm(`Are you sure you want to accept this job?`))try{typeof e==`function`&&e(`Accepting Job...`);let t=i.get(`BlueBridge_user`);await y.bookings.update(r,{status:`assigned`,workerId:t.uid,"timeline.assigned_at":new Date().toISOString()}),typeof n==`function`&&n(`Job Accepted Successfully!`,`success`),await j(),V(document.querySelector(`.nav-link.active`)?.dataset?.page||`home`)}catch(e){console.error(`Failed to accept job:`,e),typeof n==`function`&&n(`Failed to accept job: `+e.message,`error`)}finally{typeof t==`function`&&t()}},window.declineJob=async function(r){if(console.log(`Declining job:`,r),confirm(`Decline this job request?`))try{typeof e==`function`&&e(`Declining...`),await y.bookings.update(r,{status:`declined`,declined_by:i.get(`BlueBridge_user`)?.uid,declined_at:new Date().toISOString()}),T.jobs.pending=T.jobs.pending.filter(e=>e.id!==r);let t=document.querySelector(`[onclick*="${r}"]`)?.closest(`.job-request-item`);t&&(t.style.opacity=`0`,setTimeout(()=>t.remove(),300));let a=document.getElementById(`requestCount`);a&&(a.textContent=T.jobs.pending.length),typeof n==`function`&&n(`Job declined successfully.`,`success`)}catch(e){console.error(`Failed to decline job:`,e),typeof n==`function`&&n(`Failed to decline job.`,`error`)}finally{typeof t==`function`&&t()}},window.viewJobDetails=function(e){let t=[...T.jobs.pending,...T.jobs.active,...T.jobs.completed].find(t=>t.id===e);if(!t){typeof n==`function`&&n(`Job details not found locally.`,`error`);return}let r=`
      <div class="modal-overlay" id="jobDetailsModal" style="display:flex;">
        <div class="modal" style="max-width: 600px; width: 90%;">
          <div class="modal-header">
            <h3>Job Details</h3>
            <button class="btn-icon" onclick="document.getElementById('jobDetailsModal').remove()"><i class="fas fa-times"></i></button>
          </div>
          <div class="modal-body">
            <div style="display:flex; justify-content:space-between; margin-bottom:1rem;">
                <span class="badge badge-${t.status===`completed`?`success`:t.status===`in_progress`?`info`:`warning`}">
                    ${(t.status||`unknown`).toUpperCase().replace(`_`,` `)}
                </span>
                <span style="font-weight:bold; font-size:1.2rem;">&#8377;${t.price||`N/A`}</span>
            </div>
            
            <h4 style="margin-bottom:0.5rem; text-transform:capitalize;">${t.serviceCategory||`Service`}</h4>
            <p style="margin-bottom:1.5rem; color:var(--text-secondary);">${t.description}</p>
            
            <div style="background:var(--bg-secondary); padding:1rem; border-radius:8px; margin-bottom:1rem;">
                <h5 style="margin-bottom:0.5rem;">Customer Details</h5>
                <p><strong>Name:</strong> ${t.customerName||`N/A`}</p>
                <p><strong>Address:</strong> ${t.customerAddress||`N/A`}</p>
                ${t.status===`in_progress`?`<p><strong>Phone:</strong> <a href="tel:${t.customerPhone}" style="color:var(--primary-400);">${t.customerPhone}</a></p>`:``}
            </div>
            
            <div style="display:flex; justify-content:space-between; color:var(--text-tertiary); font-size:0.9rem;">
                <span>Scheduled: ${t.scheduledDate} at ${t.scheduledTime}</span>
            </div>
          </div>
          <div class="modal-footer" style="display:flex; gap:10px; justify-content:flex-end;">
            ${t.status===`pending`?`
                <button class="btn btn-primary" onclick="acceptJob('${t.id}'); document.getElementById('jobDetailsModal').remove()">Accept Job</button>
                <button class="btn btn-secondary" onclick="declineJob('${t.id}'); document.getElementById('jobDetailsModal').remove()">Decline</button>
            `:``}
             ${t.status===`in_progress`?`
                <button class="btn btn-success" onclick="completeJob('${t.id}'); document.getElementById('jobDetailsModal').remove()">Mark Complete</button>
                <button class="btn btn-secondary" onclick="window.location.href='/chat/chat?bookingId=${t.bookingId||t.id}&name=${encodeURIComponent(t.customerName)}'">Chat</button>
            `:``}
            <button class="btn btn-ghost" onclick="document.getElementById('jobDetailsModal').remove()">Close</button>
          </div>
        </div>
      </div>
    `,i=document.createElement(`div`);i.innerHTML=r,document.body.appendChild(i.firstElementChild)},window.completeJob=async function(r){if(confirm(`Mark this job as completed?`))try{typeof e==`function`&&e(`Completing Job...`),await y.bookings.update(r,{status:`completed`,"timeline.completed_at":new Date().toISOString()}),typeof n==`function`&&n(`Job Completed!`,`success`),await j(),V(document.querySelector(`.nav-link.active`)?.dataset?.page||`home`)}catch(e){console.error(`Failed to complete job:`,e),typeof n==`function`&&n(`Failed to complete job.`,`error`)}finally{typeof t==`function`&&t()}},window.changePassword=function(){alert(`Change Password functionality coming in next update.`)};var C=i.get(`BlueBridge_user`),w=i.get(`BlueBridge_user_profile`);i.get(`BlueBridge_user_role`);var T={jobs:{active:[],pending:[],completed:[]},earnings:{today:0,week:0,month:0,total:0},reviews:[],performance:{rating:0,completedJobs:0,acceptanceRate:100,onTime:100,satisfaction:100,responseRate:100,repeatCustomers:0}};async function E(){if(C=i.get(`BlueBridge_user`),(!C||!C.loggedIn)&&(console.warn(`Session not found, retrying in 500ms...`),await new Promise(e=>setTimeout(e,500)),C=i.get(`BlueBridge_user`)),!C||!C.loggedIn){console.error(`No logged in user found in Storage. Redirecting to login.`),window.location.href=`/auth/login`;return}if(w=i.get(`BlueBridge_user_profile`),i.get(`BlueBridge_user_role`),!w)try{console.log(`Worker Profile not found in local storage. Fetching from server...`);let e=await y.auth.getProfile(C.uid);if(e&&(e.role===`worker`||e.skills))w=e,i.set(`BlueBridge_user_profile`,w),console.log(`Worker Profile fetched and cached:`,w);else throw Error(`Profile incomplete or not a worker`)}catch(e){console.warn(`Redirecting to verification: Profile fetch failed or invalid.`,e),w={documentsVerified:!1}}if(window.userData=C,window.userProfile=w,window.dashboardData=T,C){document.getElementById(`userName`).textContent=C.name||`Worker`,document.getElementById(`userRole`).textContent=C.role===`worker`?`Service Provider`:`Customer`;let e=i.get(`BlueBridge_user_profile`);if(e&&e.skills&&e.skills.length>0){let t=!1,r=e.skills.map(e=>{let n=e.charAt(0).toUpperCase()+e.slice(1);return e===n?e:(t=!0,n)});t&&(e.skills=r,i.set(`BlueBridge_user_profile`,e),C.uid&&y.workers.updateProfile(C.uid,{skills:r}).then(()=>n(`Profile visibility updated!`,`success`)).catch(e=>console.error(`Failed to sync fixed skills:`,e)))}let t=localStorage.getItem(`worker_avatar_`+C.uid);if(t){let e=document.getElementById(`profileImage`);e&&(e.src=t)}if(e&&e.skills&&e.skills.length>0){let t=e.skills.map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(`, `);document.getElementById(`userRole`).textContent=t}}if(C.avatar){let e=document.querySelector(`.user-profile .user-avatar`);e&&(e.innerHTML=`<img src="${C.avatar}" alt="Profile" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`)}let e=document.getElementById(`sidebar`),t=document.getElementById(`mobileMenuBtn`),r=document.getElementById(`sidebarToggle`);t?.addEventListener(`click`,()=>{e.classList.toggle(`active`)}),r?.addEventListener(`click`,()=>{e.classList.remove(`active`)}),document.addEventListener(`click`,n=>{window.innerWidth<=1024&&e&&t&&!e.contains(n.target)&&!t.contains(n.target)&&e.classList.remove(`active`)});let a=document.querySelectorAll(`.nav-link[data-page]`);a.forEach(t=>{t.addEventListener(`click`,n=>{n.preventDefault();let r=t.dataset.page;V(r),a.forEach(e=>e.classList.remove(`active`)),t.classList.add(`active`),window.innerWidth<=1024&&e.classList.remove(`active`)})});try{await j(),M(),V(`home`);let e=i.get(`BlueBridge_user`);e&&e.uid&&ne(e.uid),await fe()}catch(e){console.error(`Initial data load failed:`,e),M(),V(`home`)}}var D=null,O=null;function ee(e){D&&D();let t=c(l(f,`jobs`),u(`workerId`,`==`,e));console.log(`📡 [WORKER SYNC] Subscribing to direct assignments:`,e),D=_(t,e=>{let t=[];e.forEach(e=>t.push({id:e.id,...e.data()}));let n=[`assigned`,`in_progress`,`accepted`,`running`,`on the way`];T.jobs.active=t.filter(e=>n.includes((e.status||``).toLowerCase())),T.jobs.completed=t.filter(e=>(e.status||``).toLowerCase()===`completed`),k()},e=>console.error(`Direct jobs listener error:`,e))}function te(){O&&O();let e=c(l(f,`jobs`),u(`status`,`==`,`pending`));console.log(`📡 [WORKER SYNC] Subscribing to pending job pool...`),O=_(e,e=>{let t=[];e.forEach(e=>t.push({id:e.id,...e.data()})),T.jobs.pending=t,k()},e=>console.error(`Pending pool listener error:`,e))}function k(){let e=new Date,t=new Date(e.getFullYear(),e.getMonth(),e.getDate()),n=new Date(e.getFullYear(),e.getMonth(),1),r=0,i=0;(T.jobs.completed||[]).forEach(e=>{let a=new Date(e.completedAt||e.updatedAt||e.createdAt||Date.now()),o=parseFloat(e.price||e.amount)||0;a>=t&&(r+=o),a>=n&&(i+=o)}),T.earnings.today=r,T.earnings.month=i;let a=document.getElementById(`requestCount`);a&&(a.textContent=T.jobs.pending.length);let o=document.getElementById(`newRequests`);o&&(o.textContent=T.jobs.pending.length);let s=document.getElementById(`activeJobs`);s&&(s.textContent=T.jobs.active.length);let c=document.getElementById(`monthlyEarnings`);c&&(c.textContent=T.earnings.month.toLocaleString());let l=document.querySelector(`.overview-item-card.blue .value`);l&&(l.textContent=T.jobs.active.length);let u=document.querySelector(`.overview-item-card.green .value`);u&&(u.innerHTML=`&#8377;${T.earnings.today.toLocaleString()}`);let d=document.querySelector(`.overview-item-card.orange .value`);d&&(d.textContent=T.jobs.pending.length),document.getElementById(`jobRequestsList`)&&U(),document.getElementById(`activeJobsList`)&&G(),typeof window.updatePerformanceChart==`function`&&window.updatePerformanceChart(`week`)}function ne(e){ee(e),te()}var A=e=>({id:e.id,serviceType:e.serviceType||e.service_type||`General Service`,description:e.description||`${e.serviceType||e.service_type||`General`} service requested`,customerName:e.customerName||e.customer_name||`Customer`,customerPhone:e.customerPhone||e.customer_phone||e.phone||``,workerPhone:e.workerPhone||e.worker_phone||``,customerAddress:e.address||e.location_name||e.customerAddress||`Location not set`,price:e.price||e.amount||0,status:(e.status||`pending`).toLowerCase(),scheduledDate:e.date||(e.scheduled_time?new Date(e.scheduled_time).toLocaleDateString():`Today`),scheduledTime:e.time||(e.scheduled_time?new Date(e.scheduled_time).toLocaleTimeString([],{hour:`2-digit`,minute:`2-digit`}):`ASAP`),bookingId:e.id||e.bookingId,isEmergency:e.is_emergency||e.isEmergency||!1,acceptedAt:e.timeline?.assigned_at||e.acceptedAt||e.timestamp,completedAt:e.timeline?.completed_at,createdAt:e.createdAt||e.timestamp});async function j(){let e=i.get(`BlueBridge_user`);if(!(!e||!e.uid))try{try{let t=await y.auth.getProfile(e.uid);t&&i.set(`BlueBridge_user`,{...e,...t})}catch(e){console.warn(`Could not fetch worker profile:`,e)}let t=y?.bookings?y:window.API;if(!t||!t.bookings||!t.transactions||!t.reviews){console.error(`[DASHBOARD CRITICAL] API structure incomplete!`,t);return}let[n,r,a,o]=await Promise.allSettled([t.bookings.getByUser(e.uid,`worker`),t.bookings.getAvailable(50),t.transactions.getByUser(e.uid),t.reviews.getByWorker(e.uid)]),s=[],c=[];n.status===`fulfilled`?(s=n.value||[],console.log(`Fetched ${s.length} my bookings from Firestore`)):console.warn(`Failed to fetch my bookings:`,n.reason),r.status===`fulfilled`?(c=r.value||[],console.log(`Fetched ${c.length} available bookings from Firestore (limited to 50)`)):console.warn(`Failed to fetch available bookings:`,r.reason);let l=s.map(A),u=c.map(A);T.jobs.active=l.filter(e=>e.status===`assigned`||e.status===`in_progress`),T.jobs.completed=l.filter(e=>e.status===`completed`);let d=new Map;u.filter(e=>e.status===`pending`).forEach(e=>d.set(e.id,e)),l.filter(e=>e.status===`pending`).forEach(e=>d.set(e.id,e)),T.jobs.pending=Array.from(d.values()),console.log(`Dashboard jobs: ${T.jobs.pending.length} pending, ${T.jobs.active.length} active, ${T.jobs.completed.length} completed`);let f=[];a.status===`fulfilled`&&(f=a.value||[]);let p=new Date,m=new Date(p.getFullYear(),p.getMonth(),p.getDate()),h=new Date,g=new Date(h.setDate(h.getDate()-h.getDay())),_=new Date(p.getFullYear(),p.getMonth(),1),v=0,b=0,x=0,S=0;f.filter(e=>e.type===`credit`).forEach(e=>{let t=new Date(e.createdAt),n=parseFloat(e.amount)||0;t>=m&&(v+=n),t>=g&&(b+=n),t>=_&&(x+=n),S+=n}),T.earnings={today:v,week:b,month:x,total:S},o.status===`fulfilled`&&(T.reviews=o.value||[]),N(),console.log(`Dashboard data refreshed with real Firestore bookings:`,T),i.set(`worker_jobs`,T.jobs),i.set(`worker_earnings`,T.earnings),i.set(`worker_reviews`,T.reviews),i.set(`worker_performance`,T.performance),document.getElementById(`dashboardUserName`)&&P()}catch(e){console.error(`Critical failure in dashboard sync:`,e),M()}}function M(){if(!(T.jobs.pending.length===0&&T.jobs.active.length===0&&T.jobs.completed.length===0))return;console.log(`Loading demo data for testing...`),i.get(`BlueBridge_user`);let e=[{id:`demo-job-1`,serviceCategory:`Plumbing`,description:`Fix leaking kitchen sink and replace faucet`,customerName:`Rajesh Kumar`,customerAddress:`123 MG Road, Sector 15, Gurgaon`,customerPhone:`+91-9876543210`,price:850,status:`pending`,scheduledDate:new Date(Date.now()+864e5).toLocaleDateString(`en-IN`),scheduledTime:`10:00 AM`,bookingId:`booking-demo-1`,createdAt:new Date().toISOString()},{id:`demo-job-2`,serviceCategory:`Electrical`,description:`Install ceiling fan in bedroom and fix switchboard`,customerName:`Priya Sharma`,customerAddress:`456 DLF Phase 2, Gurgaon`,customerPhone:`+91-9876543211`,price:1200,status:`pending`,scheduledDate:new Date(Date.now()+1728e5).toLocaleDateString(`en-IN`),scheduledTime:`2:00 PM`,bookingId:`booking-demo-2`,createdAt:new Date().toISOString()},{id:`demo-job-3`,serviceCategory:`Carpentry`,description:`Repair wooden door and install new lock`,customerName:`Amit Patel`,customerAddress:`789 Cyber City, Gurgaon`,customerPhone:`+91-9876543212`,price:950,status:`in_progress`,scheduledDate:new Date().toLocaleDateString(`en-IN`),scheduledTime:`11:00 AM`,bookingId:`booking-demo-3`,acceptedAt:new Date(Date.now()-36e5).toISOString(),createdAt:new Date(Date.now()-72e5).toISOString()},{id:`demo-job-4`,serviceCategory:`Painting`,description:`Paint living room walls - 2 coats`,customerName:`Sneha Reddy`,customerAddress:`321 Golf Course Road, Gurgaon`,customerPhone:`+91-9876543213`,price:3500,status:`completed`,scheduledDate:new Date(Date.now()-864e5).toLocaleDateString(`en-IN`),scheduledTime:`9:00 AM`,bookingId:`booking-demo-4`,completedAt:new Date(Date.now()-36e5).toISOString(),createdAt:new Date(Date.now()-1728e5).toISOString()},{id:`demo-job-5`,serviceCategory:`Plumbing`,description:`Install new water purifier and connect pipes`,customerName:`Vikram Singh`,customerAddress:`555 Sohna Road, Gurgaon`,customerPhone:`+91-9876543214`,price:1500,status:`completed`,scheduledDate:new Date(Date.now()-2592e5).toLocaleDateString(`en-IN`),scheduledTime:`3:00 PM`,bookingId:`booking-demo-5`,completedAt:new Date(Date.now()-1728e5).toISOString(),createdAt:new Date(Date.now()-3456e5).toISOString()}];T.jobs.pending=e.filter(e=>e.status===`pending`),T.jobs.active=e.filter(e=>e.status===`in_progress`),T.jobs.completed=e.filter(e=>e.status===`completed`),T.earnings={today:950,week:4450,month:12750,total:45890},T.reviews=[{id:`review-1`,customerName:`Sneha Reddy`,rating:5,comment:`Excellent work! Very professional and completed on time.`,createdAt:new Date(Date.now()-36e5).toISOString(),jobId:`demo-job-4`},{id:`review-2`,customerName:`Vikram Singh`,rating:4,comment:`Good service, but took a bit longer than expected.`,createdAt:new Date(Date.now()-1728e5).toISOString(),jobId:`demo-job-5`},{id:`review-3`,customerName:`Anita Desai`,rating:5,comment:`Highly skilled and courteous. Will hire again!`,createdAt:new Date(Date.now()-432e6).toISOString(),jobId:`demo-job-old-1`}],i.set(`worker_reviews`,T.reviews),N(),i.set(`worker_performance`,T.performance),console.log(`Demo data loaded and performance metrics recalculated.`),document.getElementById(`dashboardUserName`)&&P()}function N(){let{jobs:e,reviews:t,earnings:n}=T,r=e.completed||[],i=new Date(new Date().getTime()-10080*60*1e3);T.performance||={satisfaction:100,onTime:100,repeatCustomers:0,jobsThisWeek:0,successRate:100,earnerStatus:`Rising Star`};let a=r.filter(e=>{let t=e.completedAt?new Date(e.completedAt):null;return t&&t>=i}).length;T.performance.jobsThisWeek=a;let o=(e.completed?.length||0)+(e.active?.length||0);if(o>0&&(T.performance.successRate=Math.round((e.completed?.length||0)/o*100)),n.total>1e4?T.performance.earnerStatus=`Top Earner`:n.total>5e3?T.performance.earnerStatus=`Elite Pro`:T.performance.earnerStatus=`Verified Pro`,t.length>0){let e=t.reduce((e,t)=>e+(t.rating||5),0);T.performance.satisfaction=Math.round(e/(t.length*5)*100)}if(t.length>0){let e=t.reduce((e,t)=>e+(t.rating||5),0);T.performance.satisfaction=Math.round(e/(t.length*5)*100)}if(r.length>0){let e=r.filter(e=>!e.completedAt||!e.scheduledDate?!0:new Date(e.completedAt)<=new Date(e.scheduledDate));T.performance.onTime=Math.round(e.length/r.length*100)}let s={};[...e.active,...e.pending,...e.completed].forEach(e=>{let t=e.customerId||e.customer&&e.customer.id;t&&(s[t]=(s[t]||0)+1)});let c=Object.keys(s).length;if(c>0){let e=Object.values(s).filter(e=>e>1).length;T.performance.repeatCustomers=Math.round(e/c*100)}T.performance.responseRate=95}function P(){let{jobs:e,earnings:t,performance:n}=T,r=new Date,a=new Date(r.getFullYear(),r.getMonth(),r.getDate()),o=new Date(r.getFullYear(),r.getMonth(),1),s=0,c=0;(e.completed||[]).forEach(e=>{let t=new Date(e.completedAt||e.updatedAt||e.createdAt||Date.now()),n=parseFloat(e.price||e.amount)||0;t>=a&&(s+=n),t>=o&&(c+=n)}),t.today=s,t.month=c;let l=document.querySelector(`.overview-item-card.blue .value`);l&&(l.textContent=e.active.length);let u=document.querySelector(`.overview-item-card.green .value`);u&&(u.innerHTML=`&#8377;${t.today.toLocaleString()}`);let d=document.querySelector(`.overview-item-card.orange .value`);d&&(d.textContent=e.pending.length);let f=document.getElementById(`newRequests`);f&&(f.textContent=e.pending.length);let p=document.getElementById(`activeJobs`);p&&(p.textContent=e.active.length);let m=document.getElementById(`monthlyEarnings`);m&&(m.textContent=t.month.toLocaleString());let h=document.getElementById(`workerRating`);h&&(h.textContent=n?.rating?.toFixed(1)||`4.8`);let g=document.getElementById(`jobRequestsList`);g&&typeof W==`function`&&(W(e.pending.slice(0,3),g),e.pending.length>3&&(g.innerHTML+=`<div style="text-align:center; padding:0.5rem;"><button class="btn-text" onclick="loadPage('job-requests')">View ${e.pending.length-3} more...</button></div>`));let _=document.getElementById(`activeJobsList`);_&&typeof renderActiveJobsList==`function`&&(renderActiveJobsList(e.active.slice(0,3),_),e.active.length>3&&(_.innerHTML+=`<div style="text-align:center; padding:0.5rem;"><button class="btn-text" onclick="loadPage('active-jobs')">View ${e.active.length-3} more...</button></div>`));let v=i.get(`BlueBridge_user`);v&&v.uid&&re(v.uid)}async function re(e){let t=document.getElementById(`recentActivityList`);if(t)try{let n=(e,t=7e3)=>Promise.race([e,new Promise((e,n)=>setTimeout(()=>n(Error(`Timeout`)),t))]),i=await Promise.allSettled([n(y.jobs.getMyJobs(e,`worker`)),n(y.transactions.getByUser(e))]),a=i[0].status===`fulfilled`?i[0].value:[],o=i[1].status===`fulfilled`?i[1].value:[],s=[];(a||[]).forEach(e=>{let t=`${e.serviceType||`Service`} Job ${e.status?e.status.charAt(0).toUpperCase()+e.status.slice(1):`Requested`}`;e.status===`assigned`&&(t=`Accepted ${e.serviceType||`Service`} Job`),s.push({type:`job`,title:t,time:e.updatedAt||e.acceptedAt||e.createdAt||e.timestamp,status:(e.status||`pending`).toLowerCase()})}),(o||[]).forEach(e=>{s.push({type:`transaction`,title:e.description||(e.type===`credit`?`Payment Received`:`Withdrawal`),time:e.createdAt,amount:e.amount,transactionType:e.type})}),s.sort((e,t)=>new Date(t.time)-new Date(e.time));let c=s.slice(0,4);if(c.length===0){t.innerHTML=`<p class="text-muted" style="text-align:center; padding:1.5rem; font-size: 0.85rem;">No recent activities found.</p>`;return}t.innerHTML=c.map(e=>{let t=e.type===`job`,n=t?e.status===`completed`?`fa-check`:`fa-tools`:e.transactionType===`credit`?`fa-wallet`:`fa-receipt`;return`
                <div class="activity-item" style="animation: slideUp 0.3s ease-out; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 1rem; padding: 0.5rem;">
                    <div class="activity-icon" style="background: ${t?e.status===`completed`?`rgba(0, 255, 157, 0.1)`:`rgba(0, 210, 255, 0.1)`:e.transactionType===`credit`?`rgba(0, 210, 255, 0.1)`:`rgba(255, 0, 255, 0.1)`}; color: ${t?e.status===`completed`?`var(--neon-green)`:`var(--neon-blue)`:e.transactionType===`credit`?`var(--neon-blue)`:`var(--neon-pink)`}; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <i class="fas ${n}" style="font-size: 0.9rem;"></i>
                    </div>
                    <div class="activity-details" style="flex: 1;">
                        <h5 style="margin:0; font-size: 0.9rem; color: #fff;">${e.title}</h5>
                        <p style="margin:0.15rem 0 0; font-size: 0.7rem; color: var(--text-tertiary);">${r(e.time)}</p>
                    </div>
                </div>
            `}).join(``)}catch(e){console.error(`Error rendering worker activity:`,e),t.innerHTML=`<p class="text-muted" style="text-align:center; padding:1.5rem; font-size: 0.85rem;">Failed to load activity feed.</p>`}}console.log(`Clearing old cached job data...`),i.remove(`worker_jobs`),i.remove(`available_jobs`),i.remove(`worker_jobs_requests_cache`),i.remove(`worker_active_jobs_cache`),i.remove(`worker_job_history_cache`),E().catch(e=>{console.error(`Critical init error:`,e)}),setInterval(j,3e4);var F=i.get(`worker_availability`)||{isOnline:!1,workingHours:{monday:{enabled:!0,start:`09:00`,end:`17:00`},tuesday:{enabled:!0,start:`09:00`,end:`17:00`},wednesday:{enabled:!0,start:`09:00`,end:`17:00`},thursday:{enabled:!0,start:`09:00`,end:`17:00`},friday:{enabled:!0,start:`09:00`,end:`17:00`},saturday:{enabled:!1,start:`10:00`,end:`14:00`},sunday:{enabled:!1,start:`10:00`,end:`14:00`}}},I=F.isOnline,R=document.getElementById(`statusDot`),z=document.getElementById(`statusText`),B=document.getElementById(`toggleAvailability`);async function ie(){let e=i.get(`BlueBridge_user`);if(!(!e||!e.uid))try{I?(R.className=`status-dot status-online`,z.textContent=`Available`,B.textContent=`Online`,B.style.backgroundColor=`#28a745`,window.locationTracker&&window.locationTracker.start()):(R.className=`status-dot status-offline`,z.textContent=`Offline`,B.textContent=`Offline`,B.style.backgroundColor=`#dc3545`,window.locationTracker&&window.locationTracker.stop()),await y.workers.updateProfile(e.uid,{is_online:I}),F.isOnline=I,i.set(`worker_availability`,F),n(`You are now ${I?`Available`:`Offline`}`,I?`success`:`info`)}catch(e){console.error(`Failed to sync availability:`,e),n(`Failed to update status on server`,`error`),I=!I}}B?.addEventListener(`click`,()=>{I=!I,ie()});async function V(n,r=null){console.log(`[DASHBOARD] loadPage called: ${n}`,r);let a=document.getElementById(`contentArea`);if(!a){console.error(`[DASHBOARD CRITICAL] contentArea not found in DOM!`),setTimeout(()=>V(n,r),100);return}typeof e==`function`&&e(`Loading...`),i.get(`BlueBridge_user_profile`);try{await new Promise(e=>setTimeout(e,100));let e=ae(n,r);console.log(`[DASHBOARD] getPageContent returned content length: ${e?.length}`),a.innerHTML=e,typeof window.initializePage==`function`?(console.log(`[DASHBOARD] Initializing page scripts...`),window.initializePage(n,r)):console.warn(`[DASHBOARD] initializePage not found on window`),typeof t==`function`&&t()}catch(e){console.error(`Error loading page:`,e),a.innerHTML=`
      <div class="error-state">
        <h2>Error Loading Page</h2>
        <p>Something went wrong: ${e.message}</p>
        <pre style="text-align:left; background:rgba(0,0,0,0.2); padding:1rem; overflow:auto; max-height:200px; font-size:0.8rem;">${e.stack}</pre>
        <button class="btn btn-primary" onclick="location.reload()">Reload</button>
      </div>
    `,t()}}function ae(e,t=null){let n={profile:se,"job-requests":ce,"active-jobs":le,"job-history":ue,availability:window.getAvailabilityPage||(()=>`<div>Loading...</div>`),earnings:window.getEarningsPage||(()=>`<div>Earnings loading...</div>`),wallet:window.getWalletPage||(()=>`<div>Wallet loading...</div>`),ratings:window.getRatingsPage||(()=>`<div>Ratings loading...</div>`),support:window.getSupportPage||(()=>`<div>Support loading...</div>`),settings:window.getSettingsPage||(()=>`<div>Settings loading...</div>`),chat:window.getChatPage||(()=>`<div>Chat loading...</div>`)}[e];return n?n(t):oe()}function oe(){let{jobs:e,earnings:t,reviews:n}=T;return`
    <div class="dashboard-home">
      <!-- Welcome Header -->
      <div class="dashboard-welcome">
        <div class="welcome-content">
          <h1>Welcome back, <span id="dashboardUserName">${C.name||`Worker`}</span>! <i class="fas fa-hard-hat" style="color:var(--warning);"></i></h1>
          <p>Manage your jobs and grow your business</p>
        </div>
      </div>

      <!-- Daily Overview Section -->
      <div class="overview-grid">
        <!-- Active Tasks -->
        <div class="overview-item-card blue" onclick="loadPage('active-jobs')">
          <div class="card-glow"></div>
          <div class="icon-box"><i class="fas fa-bolt"></i></div>
          <div class="content">
            <div class="label">Active Tasks</div>
            <div class="value-row">
              <div class="value">${e.active.length}</div>
              <div class="sub-value">? Ongoing</div>
            </div>
          </div>
        </div>

        <!-- Daily Earnings -->
        <div class="overview-item-card green" onclick="loadPage('earnings')">
          <div class="card-glow"></div>
          <div class="icon-box"><i class="fas fa-indian-rupee-sign"></i></div>
          <div class="content">
            <div class="label">Daily Earnings</div>
            <div class="value-row">
              <div class="value">&#8377;${t.today.toLocaleString()}</div>
              <div class="sub-value">Target: &#8377;2.5k</div>
            </div>
          </div>
        </div>

        <!-- Waitlisted -->
        <div class="overview-item-card orange" onclick="loadPage('job-requests')">
          <div class="card-glow"></div>
          <div class="icon-box"><i class="fas fa-clock"></i></div>
          <div class="content">
            <div class="label">Waitlisted</div>
            <div class="value-row">
              <div class="value">${e.pending.length}</div>
              <div class="sub-value">Action needed</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card stat-primary" onclick="loadPage('job-requests')">
          <div class="stat-icon"><i class="fas fa-envelope"></i></div>
          <div class="stat-content">
            <div class="stat-label">New Requests</div>
            <div class="stat-value" id="newRequests">${e.pending.length}</div>
            <div class="stat-change positive">Pending review</div>
          </div>
        </div>

        <div class="stat-card stat-warning" onclick="loadPage('active-jobs')">
          <div class="stat-icon"><i class="fas fa-bolt"></i></div>
          <div class="stat-content">
            <div class="stat-label">Active Jobs</div>
            <div class="stat-value" id="activeJobs">${e.active.length}</div>
            <div class="stat-change positive">In progress</div>
          </div>
        </div>

        <div class="stat-card stat-success" onclick="loadPage('earnings')">
          <div class="stat-icon"><i class="fas fa-coins"></i></div>
          <div class="stat-content">
            <div class="stat-label">This Month</div>
            <div class="stat-value">&#8377;<span id="monthlyEarnings">${t.month.toLocaleString()}</span></div>
            <div class="stat-change positive">+15% from last month</div>
          </div>
        </div>

        <div class="stat-card stat-info" onclick="loadPage('ratings')">
          <div class="stat-icon"><i class="fas fa-star"></i></div>
          <div class="stat-content">
            <div class="stat-label">Your Rating</div>
            <div class="stat-value" id="workerRating">4.8</div>
            <div class="stat-change positive">Top 10% workers</div>
          </div>
        </div>
      </div>

      <!-- Main Dashboard Grid -->
      <div class="dashboard-grid">
        <!-- Job Requests -->
        <div class="dashboard-card job-requests-card" style="grid-column: span 6;">
          <div class="card-header">
            <h2><i class="fas fa-envelope-open-text" style="color:var(--primary-400);"></i> New Job Requests</h2>
            <button class="btn-text" onclick="loadPage('job-requests')">View All</button>
          </div>
          <div class="job-requests-list" id="jobRequestsList">
             <!-- Content loaded via API -->
             <div style="text-align:center; padding:1rem; opacity:0.6;">Loading...</div>
          </div>
        </div>

        <!-- Active Jobs -->
        <div class="dashboard-card active-jobs-card" style="grid-column: span 6;">
          <div class="card-header">
            <h2><i class="fas fa-bolt" style="color:#fbbf24;"></i> Active Jobs</h2>
            <button class="btn-text" onclick="loadPage('active-jobs')">View All</button>
          </div>
          <div class="active-jobs-list" id="activeJobsList">
            <!-- Content loaded via API -->
            <div style="text-align:center; padding:1rem; opacity:0.6;">Loading...</div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="dashboard-card activity-card" style="grid-column: span 12;">
          <div class="card-header">
            <h2><i class="fas fa-history" style="color:var(--primary-400);"></i> Recent Activity</h2>
            <button class="btn-text" onclick="loadPage('job-history')">View All</button>
          </div>
          <div class="activity-list" id="recentActivityList">
             <div style="text-align:center; padding:2rem; opacity:0.6;"><i class="fas fa-spinner fa-spin"></i> Syncing activity...</div>
          </div>
        </div>

        <!-- Performance Chart -->
        <div class="dashboard-card performance-card" style="grid-column: span 12;">
          <div class="card-header">
            <h2><i class="fas fa-chart-line" style="color:var(--primary-400);"></i> Weekly Performance</h2>
          </div>
          <div class="performance-chart" style="position: relative; height: 300px;">
            <canvas id="performanceChart"></canvas>
          </div>
        </div>

        </div>
      </div>
    </div>
  `}var H=!1;window.toggleEditProfile=function(){H=!H,V(`profile`)},window.useCurrentLocation=function(){let e=event.target.closest(`button`),t=e.innerHTML;if(e.innerHTML=`<i class="fas fa-spinner fa-spin"></i> Getting location...`,e.disabled=!0,!navigator.geolocation){n(`Geolocation is not supported by your browser`,`error`),e.innerHTML=t,e.disabled=!1;return}navigator.geolocation.getCurrentPosition(async r=>{let i=r.coords.latitude,a=r.coords.longitude;document.getElementById(`editLocationLat`).value=i,document.getElementById(`editLocationLng`).value=a;try{let e=await(await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${i}&lon=${a}`)).json(),t=e.address.city||e.address.town||e.address.village||e.address.state||`Unknown Location`;document.getElementById(`editLocation`).value=`${t} (${i.toFixed(4)}, ${a.toFixed(4)})`,n(`Location detected: ${t}`,`success`)}catch{document.getElementById(`editLocation`).value=`${i.toFixed(4)}, ${a.toFixed(4)}`,n(`Location detected successfully`,`success`)}e.innerHTML=t,e.disabled=!1},r=>{console.error(`Geolocation error:`,r);let i=`Unable to get location`;r.code===1?i=`Location permission denied`:r.code===2?i=`Location unavailable`:r.code===3&&(i=`Location request timeout`),n(i,`error`),e.innerHTML=t,e.disabled=!1},{timeout:15e3,enableHighAccuracy:!0,maximumAge:0})},window.saveProfile=async function(){let e=document.querySelector(`button[onclick="saveProfile()"]`);e&&(e.innerHTML=`<i class="fas fa-spinner fa-spin"></i> Saving...`,e.disabled=!0);try{let e=e=>{let t=document.getElementById(e);return t?t.value:``},t=e(`editName`),r=e(`editPhone`),a=e(`editEmail`),o=e(`editLocation`),s=e(`editBio`),c=e(`editLocationLat`),l=e(`editLocationLng`),u=c&&l?{lat:parseFloat(c),lng:parseFloat(l)}:o,d=e(`editProfession`),f=document.getElementById(`editSkills`),p=f?f.value.split(`,`).map(e=>e.trim()).filter(e=>e):[],m=document.getElementById(`editQualifications`),h=m?m.value.split(`,`).map(e=>e.trim()).filter(e=>e):[],g=e(`editExperience`),_=e(`editHourlyRate`),v=document.querySelectorAll(`.education-entry`),b=Array.from(v).map(e=>{let t=e.querySelector(`.edu-school`),n=e.querySelector(`.edu-degree`),r=e.querySelector(`.edu-year`);return{school:t?t.value:``,degree:n?n.value:``,year:r?r.value:``}}).filter(e=>e.school||e.degree),x=document.querySelectorAll(`.portfolio-url-input`),S=Array.from(x).map(e=>e.value.trim()).filter(e=>e),C=i.get(`BlueBridge_user`)||{};C.name=t,C.phone=r,C.email=a,i.set(`BlueBridge_user`,C);let w=i.get(`BlueBridge_user_profile`)||{};w.location=u,w.bio=s,w.profession=d,w.skills=p,w.qualifications=h,w.experience=g,w.hourlyRate=_,w.education=b,w.portfolio=S,i.set(`BlueBridge_user_profile`,w),await y.workers.updateProfile(C.uid,{...w,name:t,phone:r,email:a}),H=!1;let T=document.getElementById(`userName`);T&&(T.textContent=t);let E=document.getElementById(`dashboardUserName`);E&&(E.textContent=t),w.documentsVerified?n(`Profile and Documents updated! Dashboard Unlocked.`,`success`):n(`Profile updated. Complete verification to unlock features.`,`info`),V(`profile`)}catch(t){console.error(`Save Profile Error:`,t),n(`Error saving: `+t.message,`error`),e&&(e.innerHTML=`Save Changes`,e.disabled=!1)}},window.triggerDocUpload=async function(e){let t=document.getElementById(`doc-upload-${e}`);t&&t.click()},window.handleDocUpload=async function(r,a){if(!r.files||!r.files[0])return;let s=r.files[0],c=i.get(`BlueBridge_user`);if(!(!c||!c.uid))try{e(`Uploading ${a.replace(`-`,` `)}...`);let t=await d((await p(o(h,`worker_verifications/${c.uid}/${a}_${Date.now()}`),s)).ref),r=i.get(`BlueBridge_user_profile`)||{};r.verifications||={},r.verifications[a]=t,i.set(`BlueBridge_user_profile`,r);let l=document.getElementById(`preview-${a}`);l&&(l.innerHTML=`<img src="${t}" style="width:100%; height:100%; object-fit:cover; border-radius:8px;">`),n(`${a.replace(`-`,` `)} uploaded! Please click "Verify Document" to complete.`,`info`),V(`profile`)}catch(e){console.error(`Upload failed:`,e),n(`Upload failed: `+e.message,`error`)}finally{t()}},window.startPremiumScan=async function(e,t){console.log(`[AI Scan Initializing]...`,{imgUrl:e,currentName:t});let r=document.getElementById(`hud-scan-line`),a=document.getElementById(`scan-status-log`),o=document.getElementById(`verify-btn-trigger`);o&&(o.disabled=!0,o.innerHTML=`<i class="fas fa-spinner fa-spin"></i> INITIALIZING...`,o.style.opacity=`0.5`),r&&(r.style.display=`block`);let s=(e,t=`rgba(0, 210, 255, 0.6)`)=>{if(a){let n=document.createElement(`div`);n.className=`terminal-log`,n.style.color=t,n.style.fontSize=`0.6rem`,n.innerHTML=`[${new Date().toLocaleTimeString()}] ${e}`,a.appendChild(n),a.scrollTop=a.scrollHeight}};s(`DETECTING_DOCUMENT_STRUCTURE...`,`#00d2ff`),await new Promise(e=>setTimeout(e,1e3));let c=document.getElementById(`status-1`);c&&(c.innerHTML=`<i class="fas fa-check"></i> UPLINK_SUCCESS`,c.style.color=`#4ade80`,c.style.opacity=`1`),s(`NEURAL_LINK_ESTABLISHED. ANALYZING_PIXELS...`);let l=document.getElementById(`status-2`);l&&(l.style.opacity=`1`,l.innerHTML=`<i class="fas fa-spinner fa-spin"></i> NEURAL_ANALYSIS_IN_PROGRESS`);try{let r=await v(`/verification/verify`,{method:`POST`,body:JSON.stringify({imageUrl:e,documentType:`id-proof`,userProvidedData:{name:t}})});if(console.log(`[AI Verification Result]:`,r),!r.success||!r.result.isValid)throw s(`AUTHENTICATION_FAILED: `+(r.result?.rejectionReason||`Invalid ID`),`#ef4444`),l&&(l.innerHTML=`<i class="fas fa-times"></i> ANALYSIS_REJECTED`,l.style.color=`#ef4444`),Error(r.result?.rejectionReason||r.error||`AI could not verify this ID.`);s(`AUTHENTICITY_CONFIRMED. TRUST_SCORE: 0.98`,`#4ade80`),l&&(l.innerHTML=`<i class="fas fa-check"></i> ANALYSIS_COMPLETE`,l.style.color=`#4ade80`);let a=document.getElementById(`status-3`);a&&(a.style.opacity=`1`,a.innerHTML=`<i class="fas fa-spinner fa-spin"></i> SYNCING_BIO_DATA...`),s(`EXTRACTING_KEY_INDICATORS...`),await new Promise(e=>setTimeout(e,1500)),a&&(a.innerHTML=`<i class="fas fa-check"></i> DATA_SYNC_SUCCESS`,a.style.color=`#4ade80`);let o=r.result.extractedData.name||t,c=r.result.extractedData.location||`New Delhi, India`;s(`DATA_EXTRACTED: [${o}]`,`#4ade80`);let u=i.get(`BlueBridge_user_profile`),d=i.get(`BlueBridge_user`);u&&(u.name=o,u.location=c,u.documentsVerified=!0,i.set(`BlueBridge_user_profile`,u)),d&&(d.name=o,i.set(`BlueBridge_user`,d)),n(`Identity Verified Successfully!`,`success`),s(`TERMINAL_SESSION_SECURED. RELOADING...`,`#4ade80`),setTimeout(()=>V(`profile`),2e3)}catch(e){console.error(`AI Verification failed:`,e),s(`CRITICAL_ERROR: `+e.message,`#ef4444`),n(`Verification Failed: `+e.message,`error`);let t=i.get(`BlueBridge_user_profile`);t&&(t.documentsVerified=!1,i.set(`BlueBridge_user_profile`,t)),o&&(o.disabled=!1,o.innerHTML=`RETRY BIOMETRIC SCAN`,o.style.opacity=`1`)}finally{r&&setTimeout(()=>r.style.display=`none`,1e3)}};function se(){let e=i.get(`BlueBridge_user_profile`)||{},t=i.get(`BlueBridge_user`)||{},n=i.get(`worker_jobs`),r=i.get(`worker_earnings`),a=i.get(`worker_performance`)||{};return`
    <!-- PROFILE HEADER (Reconstructed) -->
    <div class="page-header" style="position: relative; overflow: visible; border-radius: 24px; padding: 2rem; margin-bottom: 2rem; background: linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(236, 72, 153, 0.2)); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);">
      <div style="position: absolute; top:0; left:0; width:100%; height:100%; backdrop-filter: blur(40px); z-index:0; border-radius: 24px;"></div>
      
      <!-- Flex Container -->
      <div style="position: relative; z-index:1; display:flex; align-items: flex-start; gap: 2rem; flex-wrap: wrap;">
        
        <!-- 1. AVATAR SECTION -->
        <div style="flex-shrink: 0;">
            <div style="position: relative; width: 110px; height: 110px;">
                <!-- Image Ring -->
                <div style="width:100%; height:100%; border-radius:50%; padding:3px; background: linear-gradient(135deg, #00d2ff, #3a7bd5); box-shadow: 0 0 20px rgba(0, 210, 255, 0.2);">
                    <img id="profile-image-display" 
                         src="${t.avatar||`https://ui-avatars.com/api/?name=`+encodeURIComponent(t.name||`Worker`)+`&background=0f172a&color=fff&size=256&font-size=0.33`}" 
                         alt="Profile" 
                         style="width:100%; height:100%; border-radius:50%; object-fit:cover; border: none; background-color: #0f172a;">
                </div>
                
                ${H?``:`
                <!-- Camera Button (Absolute to Avatar) -->
                <button onclick="triggerImageUpload()" style="position:absolute; bottom:0; right:0; background: var(--bg-elevated); border: 2px solid var(--bg-primary); width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3); cursor:pointer; z-index: 10;" title="Change Photo">
                    <i class="fas fa-camera" style="font-size: 13px; color: var(--text-primary);"></i>
                </button>
                `}
                <input type="file" id="profile-image-upload" accept="image/*" style="display: none;" onchange="handleImageUpload(this)">
            </div>
        </div>

        <!-- 2. INFO SECTION (Name, Badges, Remove Link) -->
        <div style="flex: 1; min-width: 250px; display: flex; flex-direction: column; justify-content: center; padding-top: 0.5rem; gap: 0.5rem;">
            <!-- Name -->
            <h1 style="font-size: 2.2rem; font-weight: 700; margin: 0; background: linear-gradient(to right, #fff, rgba(255,255,255,0.9)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -0.5px; line-height: 1.2;">
                ${t.name||`Worker Name`}
            </h1>
            
            <!-- Details Row -->
            <div style="display:flex; align-items:center; gap: 1rem; flex-wrap: wrap;">
                ${e.documentsVerified?`<span class="badge badge-success" style="backdrop-filter: blur(4px); padding: 0.25rem 0.7rem; font-size: 0.75rem; letter-spacing: 0.5px; border-radius: 20px;">Verified Pro</span>`:`<span class="badge" style="background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.4); padding: 0.25rem 0.7rem; font-size: 0.75rem; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1);">Unverified</span>`}
                <span style="color: rgba(255,255,255,0.7); display:flex; align-items:center; gap:0.5rem; font-size: 1rem;">
                    <i class="fas fa-map-marker-alt" style="color: var(--neon-pink);"></i> 
                    ${typeof e.location==`object`&&e.location?.lat?`${e.location.lat.toFixed(4)}, ${e.location.lng.toFixed(4)}`:e.location||`Location not set`}
                </span>
            </div>

            <!-- Remove Button (Conditional) -->
             ${H?``:`
            <div style="margin-top: 0.5rem;">
                <button onclick="removeProfileImage()" 
                        style="background: transparent; border: none; color: #fca5a5; font-size: 0.75rem; display: inline-flex; gap: 4px; align-items: center; cursor: pointer; padding: 0; transition: color 0.2s;" 
                        onmouseover="this.style.color='#ef4444'" 
                        onmouseout="this.style.color='#fca5a5'">
                    <i class="fas fa-trash-alt" style="font-size: 0.7rem;"></i> Remove Photo
                </button>
            </div>
            `}
        </div>

        <!-- 3. ACTIONS SECTION (Edit/Save) -->
        <div style="margin-left: auto; align-self: flex-start;">
            ${H?`<div style="display:flex; gap:10px;">
                     <button class="btn btn-secondary" onclick="toggleEditProfile()" style="background: rgba(255,255,255,0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1);">Cancel</button>
                     <button class="btn btn-primary" onclick="saveProfile()" style="box-shadow: 0 0 15px rgba(59, 130, 246, 0.4); border: none;">Save Changes</button>
                   </div>`:`<button class="btn btn-secondary" onclick="window.toggleEditProfile()" style="background: rgba(255,255,255,0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); transition: all 0.3s ease; padding: 0.75rem 1.5rem; font-size: 1rem;"><i class="fas fa-pen" style="margin-right: 8px;"></i> Edit Profile</button>`}
        </div>
      </div>
    </div>

    <!-- Stats Grid (Unchanged) -->
    <div class="profile-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;">

      <!-- Personal Info Card -->
      <div class="card" style="background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 20px;">
        <div class="card-header" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1rem; margin-bottom: 1rem;">
          <h2 class="card-title" style="font-size: 1.5rem;"><i class="fas fa-user-circle" style="margin-right: 10px; color: var(--primary-400);"></i> Personal Information</h2>
        </div>
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div class="info-group">
              <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; letter-spacing:1px; font-weight: 600;">FULL NAME</label>
              ${H?`<input type="text" id="editName" class="form-control" value="${t.name||``}" placeholder="Enter Name" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 1rem; border-radius: 12px;">`:`<p style="font-size:1.2rem; font-weight:500; margin:0;">${t.name||`Not set`}</p>`}
            </div>
            <div class="info-group">
              <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; letter-spacing:1px; font-weight: 600;">PHONE NUMBER</label>
              ${H?`<input type="tel" id="editPhone" class="form-control" value="${t.phone||``}" placeholder="Enter Phone" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 1rem; border-radius: 12px;">`:`<p style="font-size:1.2rem; font-weight:500; margin:0; font-family: 'Courier New', monospace;">${t.phone||`Not set`}</p>`}
            </div>
            <div class="info-group">
              <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; letter-spacing:1px; font-weight: 600;">EMAIL ADDRESS</label>
              ${H?`<input type="email" id="editEmail" class="form-control" value="${t.email||``}" placeholder="Enter Email" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 1rem; border-radius: 12px;">`:`<p style="font-size:1.2rem; font-weight:500; margin:0;">${t.email||`Not set`}</p>`}
            </div>
            <div class="info-group">
               <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; letter-spacing:1px; font-weight: 600;">BIO</label>
               ${H?`<textarea id="editBio" class="form-control" rows="3" placeholder="Describe yourself..." style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 1rem; border-radius: 12px; width: 100%; resize: vertical;">${e.bio||``}</textarea>`:`<p style="font-size:1rem; line-height: 1.6; color: rgba(255,255,255,0.8);">${e.bio||`No bio added yet.`}</p>`}
            </div>
            <div class="info-group">
              <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; letter-spacing:1px; font-weight: 600;">LOCATION</label>
               ${H?`<div style="display: flex; gap: 0.5rem; align-items: stretch;">
                     <input type="text" id="editLocation" class="form-control" value="${e.location||``}" placeholder="Enter Location or use GPS" style="flex: 1; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 1rem; border-radius: 12px;">
                     <button type="button" onclick="useCurrentLocation()" class="btn" style="background: var(--neon-blue); color: #000; border: none; padding: 0.75rem 1.25rem; border-radius: 12px; white-space: nowrap; font-weight: 600; display: flex; align-items: center; gap: 0.5rem; transition: all 0.3s;">
                       <i class="fas fa-location-crosshairs"></i> Use GPS
                     </button>
                   </div>
                   <input type="hidden" id="editLocationLat" value="${e.location?.lat||``}">
                   <input type="hidden" id="editLocationLng" value="${e.location?.lng||``}">
                   <small style="color: rgba(255,255,255,0.5); font-size: 0.75rem; margin-top: 0.25rem; display: block;">Click "Use GPS" to automatically detect your location</small>`:`<p style="font-size:1.2rem; font-weight:500; margin:0;">${typeof e.location==`object`&&e.location?.lat?`${e.location.lat.toFixed(4)}, ${e.location.lng.toFixed(4)}`:e.location||`Not set`}</p>`}
            </div>
        </div>
      </div>

      <!-- Professional Info Card -->
      <div class="card" style="background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 20px;">
        <div class="card-header" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1rem; margin-bottom: 1rem;">
           <h2 class="card-title" style="font-size: 1.5rem;"><i class="fas fa-briefcase" style="margin-right: 10px; color: var(--primary-400);"></i> Professional Details</h2>
        </div>
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div class="info-group">
              <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; letter-spacing:1px; font-weight: 600;">PROFESSION</label>
              ${H?`<select id="editProfession" class="form-control" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 1rem; border-radius: 12px; width: 100%;">
                     <option value="" disabled ${e.profession?``:`selected`}>Select your profession</option>
                     <option value="Plumbing" ${e.profession===`Plumbing`?`selected`:``}>Plumbing</option>
                     <option value="Electrical & Appliances" ${e.profession===`Electrical & Appliances`?`selected`:``}>Electrical & Appliances</option>
                     <option value="Carpentry" ${e.profession===`Carpentry`?`selected`:``}>Carpentry</option>
                     <option value="House Cleaning" ${e.profession===`House Cleaning`?`selected`:``}>House Cleaning</option>
                     <option value="Painting & Design" ${e.profession===`Painting & Design`?`selected`:``}>Painting & Design</option>
                     <option value="Salon & Wellness" ${e.profession===`Salon & Wellness`?`selected`:``}>Salon & Wellness</option>
                     <option value="Gardening" ${e.profession===`Gardening`?`selected`:``}>Gardening</option>
                     <option value="Automotive Mechanic" ${e.profession===`Automotive Mechanic`?`selected`:``}>Automotive Mechanic</option>
                     <option value="Moving & Logistics" ${e.profession===`Moving & Logistics`?`selected`:``}>Moving & Logistics</option>
                   </select>`:`<div class="profession-tag" style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                    <span class="badge" style="background: rgba(0, 210, 255, 0.1); border: 1px solid rgba(0, 210, 255, 0.3); color: var(--neon-blue); padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600;">${e.profession||`General Professional`}</span>
                   </div>`}
            </div>
            <div class="info-group">
              <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; letter-spacing:1px; font-weight: 600;">SPECIFIC SKILLS (OPTIONAL)</label>
              ${H?`<input type="text" id="editSkills" class="form-control" value="${(e.skills||[]).join(`, `)}" placeholder="e.g. Pipe fitting, Welding, Leak repair" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 1rem; border-radius: 12px;">`:`<div class="skills-tags" style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                    ${(e.skills||[]).length>0?(e.skills||[]).map(e=>`
                      <span class="badge" style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; padding: 0.5rem 1rem; border-radius: 8px;">${e}</span>
                    `).join(``):`<span style="color:rgba(255,255,255,0.4); font-style:italic; font-size:0.9rem;">No specific skills listed.</span>`}
                   </div>`}
            </div>
            <div class="info-group">
              <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; letter-spacing:1px; font-weight: 600;">EXPERIENCE LEVEL</label>
              ${H?`<select id="editExperience" class="form-control" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 1rem; border-radius: 12px;">
                     <option value="entry" ${e.experience===`entry`?`selected`:``}>Entry Level (0-2 years)</option>
                     <option value="intermediate" ${e.experience===`intermediate`?`selected`:``}>Intermediate (2-5 years)</option>
                     <option value="expert" ${e.experience===`expert`?`selected`:``}>Expert (5+ years)</option>
                   </select>`:`<p style="text-transform: capitalize; font-size:1.2rem; font-weight:500; margin:0;">${e.experience||`Not set`}</p>`}
            </div>
            <div class="info-group">
              <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; letter-spacing:1px; font-weight: 600;">HOURLY RATE</label>
              ${H?`<div style="position:relative;">
                     <span style="position:absolute; left:15px; top:50%; transform:translateY(-50%); color:rgba(255,255,255,0.5);">&#8377;</span>
                     <input type="number" id="editHourlyRate" class="form-control" value="${e.hourlyRate||``}" placeholder="0" style="padding-left: 35px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 1rem 1rem 1rem 2.5rem; border-radius: 12px;">
                   </div>`:`<p style="font-size:1.5rem; font-weight:700; color: #4ade80; margin:0;">&#8377;${e.hourlyRate||`0`}<span style="font-size:1rem; color:rgba(255,255,255,0.5); font-weight:400;">/hour</span></p>`}
            </div>
             <div class="info-group">
               <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; letter-spacing:1px; font-weight: 600;">CERTIFICATIONS / QUALIFICATIONS</label>
               ${H?`<input type="text" id="editQualifications" class="form-control" value="${(e.qualifications||[]).join(`, `)}" placeholder="Certified Electrician, ISO 9001..." style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 1rem; border-radius: 12px;">`:`<ul style="margin:0; padding-left: 1.2rem; color: rgba(255,255,255,0.9);">
                     ${(e.qualifications||[]).length>0?(e.qualifications||[]).map(e=>`
                       <li style="margin-bottom: 0.25rem;">${e}</li>
                     `).join(``):`<li style="list-style:none; margin-left:-1.2rem; color:rgba(255,255,255,0.5);">No certifications listed.</li>`}
                    </ul>`}
             </div>
        </div>
      </div>
      
      <!-- Education Qualifications Card (New) -->
      <div class="card" style="background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 20px;">
        <div class="card-header" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1rem; margin-bottom: 1rem; display:flex; justify-content:space-between; align-items:center;">
           <h2 class="card-title" style="font-size: 1.5rem;"><i class="fas fa-graduation-cap" style="margin-right: 10px; color: var(--primary-400);"></i> Education</h2>
        </div>
        <div style="display: flex; flex-direction: column; gap: 1rem; max-height: 320px; overflow-y: auto; padding-right: 0.5rem;" class="hide-scrollbar">
             ${(()=>{let t=e.education;return Array.isArray(t)||(t=typeof t==`object`&&t&&t.school?[t]:typeof t==`string`?[{school:`Previous Education`,degree:t,year:``}]:[]),Array.isArray(t)||(t=[]),H?`
                        <div id="education-fields-container">
                            ${t.map((e,t)=>`
                                <div class="education-entry" id="edu-entry-${t}" style="background:rgba(255,255,255,0.05); padding:1rem; border-radius:12px; margin-bottom:1rem; position:relative;">
                                    <button onclick="removeEducationField('${t}')" style="position:absolute; top:5px; right:5px; background:none; border:none; color:rgba(255,100,100,0.8); cursor:pointer;"><i class="fas fa-trash"></i></button>
                                    <div class="info-group">
                                        <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; font-weight: 600;">INSTITUTION</label>
                                        <input type="text" class="edu-school form-control" value="${e.school||``}" placeholder="Ex: Boston University" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.8rem; border-radius: 12px; margin-bottom: 0.8rem; width: 100%;">
                                        
                                        <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; font-weight: 600;">DEGREE / FIELD</label>
                                        <input type="text" class="edu-degree form-control" value="${e.degree||``}" placeholder="Ex: Bachelor's in Architecture" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.8rem; border-radius: 12px; margin-bottom: 0.8rem; width: 100%;">
                                        
                                        <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; font-weight: 600;">YEARS</label>
                                        <input type="text" class="edu-year form-control" value="${e.year||``}" placeholder="Ex: 2018 - 2022" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.8rem; border-radius: 12px; width: 100%;">
                                    </div>
                                </div>
                            `).join(``)}
                        </div>
                        <button onclick="addEducationField()" class="btn btn-sm btn-secondary" style="width:100%; border:1px dashed rgba(255,255,255,0.3); background:rgba(255,255,255,0.05);"><i class="fas fa-plus"></i> Add Another Education</button>
                     `:t.length===0?`<p style="color:rgba(255,255,255,0.5); font-style:italic;">No education details added.</p>`:t.map((e,n)=>`
                        <div style="display: flex; gap: 1rem; align-items: flex-start; margin-bottom: 1.5rem; position: relative;">
                            ${n===t.length-1?``:`<div style="position:absolute; left:23px; top:48px; bottom:-24px; width:2px; background:rgba(255,255,255,0.1);"></div>`}
                            <div style="width: 48px; height: 48px; background: rgba(255,255,255,0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; z-index:1;">
                                <i class="fas fa-university" style="font-size: 24px; color: rgba(255,255,255,0.8);"></i>
                            </div>
                            <div style="flex: 1;">
                                <h3 style="font-size: 1.1rem; font-weight: 700; margin: 0 0 0.25rem 0; color: #fff;">${e.school||`University Name`}</h3>
                                <p style="font-size: 0.95rem; margin: 0 0 0.25rem 0; color: rgba(255,255,255,0.9);">${e.degree||`Degree`}</p>
                                <p style="font-size: 0.85rem; margin: 0; color: rgba(255,255,255,0.5);">${e.year||`Date range`}</p>
                            </div>
                        </div>
                     `).join(``)})()}
        </div>
      </div>
      
       <!-- Portfolio Card -->
       <div class="card" style="background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.05); grid-column: 1 / -1; border-radius: 20px;">
         <div class="card-header" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1rem; margin-bottom: 1rem;">
            <h2 class="card-title" style="font-size: 1.5rem;"><i class="fas fa-images" style="margin-right: 10px; color: var(--primary-400);"></i> Portfolio</h2>
         </div>
         <div style="display: flex; flex-direction: column; gap: 1rem;">
             ${H?`
                 <p style="font-size:0.9rem; color:rgba(255,255,255,0.6);">Add links to your work images (URL)</p>
                 <div id="portfolio-inputs">
                    ${(e.portfolio||[``]).map(e=>`
                        <input type="text" class="portfolio-url-input form-control" value="${e}" placeholder="https://example.com/image.jpg" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.8rem; border-radius: 12px; margin-bottom: 0.5rem; width: 100%;">
                    `).join(``)}
                 </div>
                 <button class="btn btn-sm btn-secondary" onclick="addPortfolioField()" style="width: fit-content;"><i class="fas fa-plus"></i> Add Another Link</button>
               `:`
                 <div class="portfolio-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem;">
                     ${(e.portfolio||[]).length>0?e.portfolio.map(e=>`
                        <div style="aspect-ratio: 1; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                            <img src="${e}" alt="Work Sample" style="width:100%; height:100%; object-fit: cover; transition: transform 0.3s;" onclick="window.open('${e}', '_blank')">
                        </div>
                     `).join(``):`<p style="color:rgba(255,255,255,0.5);">No portfolio images added.</p>`}
                 </div>
               `}
         </div>
       </div>
      
       <!-- Stats Card -->
       <div class="card" style="background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.05); grid-column: 1 / -1; border-radius: 20px;">
          <div class="card-header" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1rem; margin-bottom: 1rem;">
            <h2 class="card-title" style="font-size: 1.5rem;"><i class="fas fa-chart-line" style="margin-right: 10px; color: var(--primary-400);"></i> Performance Overview</h2>
          </div>
          <div style="display: flex; flex-direction: column; gap: 1rem;">
              <div style="background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02)); padding: 1.5rem; border-radius: 16px; display: flex; align-items: center; justify-content: space-between; border: 1px solid rgba(255,255,255,0.05);">
                  <div style="display: flex; align-items: center; gap: 1.5rem;">
                      <div style="font-size: 2rem;"><i class="fas fa-clipboard-list" style="color: #60a5fa;"></i></div>
                      <div style="text-align: left;">
                          <div style="font-size: 0.8rem; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 1px;">Jobs Done</div>
                          <div style="font-weight: 800; font-size: 1.5rem; color: #fff;">${n&&n.completed?n.completed.length:0}</div>
                      </div>
                  </div>
                  <div style="font-size: 0.8rem; color: var(--success);">+${a.jobsThisWeek||0} this week</div>
              </div>
              
              <div style="background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02)); padding: 1.5rem; border-radius: 16px; display: flex; align-items: center; justify-content: space-between; border: 1px solid rgba(255,255,255,0.05);">
                  <div style="display: flex; align-items: center; gap: 1.5rem;">
                      <div style="font-size: 2rem;"><i class="fas fa-wallet" style="color: #34d399;"></i></div>
                      <div style="text-align: left;">
                          <div style="font-size: 0.8rem; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 1px;">Total Earned</div>
                          <div style="font-weight: 800; font-size: 1.5rem; color: #fff;">&#8377;${r&&r.total||0}</div>
                      </div>
                  </div>
                  <div style="font-size: 0.8rem; color: var(--success);">${a.earnerStatus||`Verified Pro`}</div>
              </div>

              <div style="background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02)); padding: 1.5rem; border-radius: 16px; display: flex; align-items: center; justify-content: space-between; border: 1px solid rgba(255,255,255,0.05);">
                  <div style="display: flex; align-items: center; gap: 1.5rem;">
                      <div style="font-size: 2rem;"><i class="fas fa-check-circle" style="color: #a78bfa;"></i></div>
                      <div style="text-align: left;">
                          <div style="font-size: 0.8rem; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 1px;">Success Rate</div>
                          <div style="font-weight: 800; font-size: 1.5rem; color: #fff;">${a.successRate||100}%</div>
                      </div>
                  </div>
                  <div style="font-size: 0.8rem; color: var(--primary-400);">${a.successRate>=95?`Excellent`:`Good`}</div>
              </div>
          </div>
        </div>

        <!-- Verified Credentials Section -->
        ${e.documentsVerified?`
        <div class="card" style="background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(10px); border: 1px solid rgba(74, 222, 128, 0.2); grid-column: 1 / -1; border-radius: 20px; margin-top: 1rem;">
          <div class="card-header" style="border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
            <h2 class="card-title" style="font-size: 1.5rem; color: #4ade80;"><i class="fas fa-shield-check" style="margin-right: 10px;"></i> Verified Credentials</h2>
            <span class="badge badge-success" style="padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.8rem;">OFFICIALLY VERIFIED</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; align-items: center;">
            <div style="border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); background: #000; aspect-ratio: 3/2; display: flex; align-items: center; justify-content: center;">
                <img src="${e.verifications?.[`id-proof`]||``}" style="max-width: 100%; max-height: 100%; object-fit: contain;" alt="Verified ID">
            </div>
            <div>
                <p style="color: rgba(255,255,255,0.7); font-size: 0.95rem; line-height: 1.6;">
                    Your identity has been successfully verified by our AI safety system. This document is now part of your professional profile and builds trust with potential customers.
                </p>
                <div style="margin-top: 1rem; display: flex; gap: 1rem; font-size: 0.8rem; color: #4ade80;">
                    <span><i class="fas fa-calendar-check"></i> Verified on: ${new Date().toLocaleDateString()}</span>
                    <span><i class="fas fa-lock"></i> Secured by BlueBridge</span>
                </div>
            </div>
          </div>
        </div>
        `:``}
        <style>
            @keyframes scanMove { 0% { top: 0; } 100% { top: 100%; } }
            @keyframes pulseGlow { 0% { opacity: 0.3; transform: scale(0.98); } 50% { opacity: 0.6; transform: scale(1.02); } 100% { opacity: 0.3; transform: scale(0.98); } }
            @keyframes crtFlicker { 0% { opacity: 0.9; } 50% { opacity: 1; } 100% { opacity: 0.9; } }
            
            .glass-id-terminal {
                background: linear-gradient(135deg, rgba(8, 12, 16, 0.9), rgba(16, 24, 32, 0.95)) !important;
                backdrop-filter: blur(30px) !important;
                border: 1px solid rgba(0, 210, 255, 0.15) !important;
                box-shadow: 0 0 80px rgba(0, 0, 0, 0.8), inset 0 0 40px rgba(0, 210, 255, 0.05) !important;
                position: relative;
                overflow: hidden;
                width: 100%;
                max-width: 1200px;
                margin-left: auto;
                margin-right: auto;
            }
            .hud-scanner-bar {
                position: absolute;
                left: 0; width: 100%; height: 3px;
                background: linear-gradient(to right, transparent, #00d2ff, transparent);
                box-shadow: 0 0 15px #00d2ff;
                z-index: 20;
                display: none;
                animation: scanMove 2.5s linear infinite;
            }
            .holographic-overlay {
                position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                background: repeating-linear-gradient(0deg, rgba(0, 210, 255, 0.03) 0px, rgba(0, 210, 255, 0.03) 1px, transparent 1px, transparent 2px);
                pointer-events: none;
                z-index: 5;
                opacity: 0.5;
            }
            .terminal-log {
                font-family: 'JetBrains Mono', 'Fira Code', monospace;
                font-size: 0.65rem;
                color: rgba(0, 210, 255, 0.6);
                text-transform: uppercase;
                letter-spacing: 1px;
            }

            /* Responsive Adjustments */
            .terminal-grid {
                display: grid;
                grid-template-columns: 1fr 340px;
                gap: 3rem;
                position: relative;
                z-index: 10;
            }
            @media (max-width: 992px) {
                .glass-id-terminal { padding: 2rem !important; border-radius: 24px !important; }
                .terminal-header { flex-direction: column; align-items: flex-start !important; gap: 2rem; margin-bottom: 2rem !important; }
                .terminal-header-title { font-size: 1.5rem !important; }
                .terminal-grid { grid-template-columns: 1fr; gap: 2rem; }
                .id-viewport { height: 300px !important; }
                .terminal-footer { flex-direction: column; align-items: flex-start !important; gap: 2rem; padding: 1.5rem !important; }
            }
        </style>

        <!-- IDENTITY ANALYSIS TERMINAL HUD -->
        <div class="card glass-id-terminal" style="grid-column: 1 / -1; padding: 3.5rem; margin-top: 2rem;">
            <div class="holographic-overlay"></div>
            
            <!-- Terminal Header -->
            <div class="terminal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4rem; position: relative; z-index: 10;">
                <div style="display: flex; align-items: center; gap: 1.5rem;">
                    <div style="width: 50px; height: 50px; background: rgba(0, 210, 255, 0.1); border: 1px solid rgba(0, 210, 255, 0.3); border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(0, 210, 255, 0.1);">
                        <i class="fas fa-microchip" style="color: #00d2ff; font-size: 1.5rem; animation: pulseGlow 3s infinite;"></i>
                    </div>
                    <div>
                        <h2 class="terminal-header-title" style="font-size: 2.2rem; font-weight: 1000; margin: 0; color: #fff; letter-spacing: -1.5px; text-transform: uppercase;">ID-CORE T-01</h2>
                        <div class="terminal-log" style="margin-top: 0.3rem;">
                            <span style="color: #4ade80;">[SYSTEM ACTIVE]</span> NV_LINK_STABLE
                        </div>
                    </div>
                </div>
                
                <div style="text-align: right;">
                    <div style="display: flex; align-items: center; gap: 1rem; background: rgba(0,0,0,0.4); padding: 0.6rem 1.2rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                        <div style="width: 10px; height: 10px; border-radius: 50%; background: ${e.documentsVerified?`#4ade80`:`#fbbf24`}; box-shadow: 0 0 10px ${e.documentsVerified?`#4ade80`:`#fbbf24`};"></div>
                        <span style="font-size: 0.7rem; font-weight: 800; letter-spacing: 1px; color: ${e.documentsVerified?`#4ade80`:`#fbbf24`}; text-transform: uppercase;">
                            ${e.documentsVerified?`AUTH_OK`:`PENDING`}
                        </span>
                    </div>
                </div>
            </div>

            <div class="terminal-grid">
                <!-- ID VIEWPORT -->
                <div style="position: relative;">
                    <div id="preview-id-proof" class="id-viewport" style="width: 100%; height: 400px; background: rgba(0,0,0,0.6); border: 2px solid rgba(0, 210, 255, 0.1); border-radius: 24px; overflow: hidden; position: relative; box-shadow: inset 0 0 50px rgba(0,0,0,0.8);">
                        <div id="hud-scan-line" class="hud-scanner-bar"></div>
                        
                        ${e.verifications?.[`id-proof`]?`<img src="${e.verifications[`id-proof`]}" style="width:100%; height:100%; object-fit:contain; filter: contrast(1.1) brightness(1.1) ${e.documentsVerified?``:`grayscale(0.3)`}; transition: all 0.5s ease;">`:`<div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: rgba(0, 210, 255, 0.15); padding: 2rem; text-align: center;">
                              <i class="fas fa-id-card-clip" style="font-size: 5rem; margin-bottom: 1.5rem;"></i>
                              <div class="terminal-log">AWAITING_PHYSICAL_UPLINK...</div>
                           </div>`}
                    </div>
                </div>

                <!-- CONTROL UNIT -->
                <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                    <div style="background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; padding: 2rem; flex: 1; display: flex; flex-direction: column; gap: 1.5rem;">
                        <h4 class="terminal-log" style="color: #fff; margin: 0; font-size: 0.8rem; border-bottom: 1px solid rgba(0, 210, 255, 0.2); padding-bottom: 0.8rem;">Diagnostics</h4>
                        
                        <div id="scan-status-log" style="display: flex; flex-direction: column; gap: 1rem; max-height: 200px; overflow-y: auto;">
                            <div class="terminal-log" style="font-size: 0.6rem; opacity: 0.4;">[${new Date().toLocaleTimeString()}] READY_FOR_SCAN</div>
                            
                            ${e.verifications?.[`id-proof`]?`
                                <div class="terminal-log" id="status-1" style="color: #4ade80;"><i class="fas fa-check"></i> UPLINK_SUCCESS</div>
                                <div class="terminal-log" id="status-2" style="opacity: 0.3;">[PENDING] NEURAL_LINK</div>
                            `:`
                                <div class="terminal-log" style="color: #fbbf24;"><i class="fas fa-exclamation-triangle"></i> NO_SOURCE</div>
                            `}
                        </div>

                        <div style="margin-top: auto; display: flex; flex-direction: column; gap: 0.8rem;">
                            ${e.verifications?.[`id-proof`]?e.documentsVerified?`
                                    <div style="background: rgba(74, 222, 128, 0.1); border: 1px solid rgba(74, 222, 128, 0.3); color: #4ade80; padding: 1rem; border-radius: 12px; font-weight: 800; font-size: 0.8rem; text-align: center; letter-spacing: 1px;">
                                        VERIFIED_SECURE
                                    </div>
                                    <button class="btn" onclick="triggerDocUpload('id-proof')" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.7rem; border-radius: 12px; font-size: 0.65rem; text-transform: uppercase;">Update Source</button>
                                `:`
                                    <button class="btn" id="verify-btn-trigger" onclick="window.startPremiumScan('${e.verifications[`id-proof`]}', '${t.name}')" style="background: linear-gradient(135deg, #00d2ff, #3a7bd5); border: none; color: #fff; padding: 1.2rem; border-radius: 16px; font-weight: 900; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1.5px; box-shadow: 0 0 30px rgba(0, 210, 255, 0.2); cursor: pointer;">
                                        INITIATE SCAN
                                    </button>
                                    <button class="btn" onclick="triggerDocUpload('id-proof')" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.5); padding: 0.7rem; border-radius: 12px; font-size: 0.65rem; text-transform: uppercase;">Retry Upload</button>
                                `:`
                                <button class="btn" onclick="triggerDocUpload('id-proof')" style="background: linear-gradient(135deg, #4f46e5, #ec4899); border: none; color: #fff; padding: 1.2rem; border-radius: 16px; font-weight: 900; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1.5px; box-shadow: 0 10px 20px rgba(236, 72, 153, 0.15); cursor: pointer;">
                                    UPLINK ID
                                </button>
                            `}
                        </div>
                    </div>
                </div>
            </div>

            <input type="file" id="doc-upload-id-proof" accept="image/*" style="display:none;" onchange="handleDocUpload(this, 'id-proof')">
        </div>
    </div>
  `}function ce(){let e=i.get(`worker_jobs`),t=e&&e.pending?e.pending.length:0;return`
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-envelope-open-text" style="color:var(--primary-400);"></i> Job Requests</h1>
      <p class="page-subtitle">Review and accept job requests from customers</p>
      <div class="page-stats">
        <span class="stat-badge">
          <span class="stat-badge-value">${t}</span>
          <span class="stat-badge-label">Pending Requests</span>
        </span>
      </div>
    </div>

    <div class="job-requests-list" id="jobRequestsList">
      <!-- Content loaded asynchronously -->
    </div>

    ${t>0?``:`
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 3rem 1.5rem; text-align:center; gap:1.25rem;">
        <div style="width:80px; height:80px; border-radius:50%; background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05)); border: 1px solid rgba(99,102,241,0.25); display:flex; align-items:center; justify-content:center;">
          <i class="fas fa-envelope-open" style="font-size:2rem; color: rgba(99,102,241,0.7);"></i>
        </div>
        <div>
          <h3 style="margin:0 0 0.5rem; font-size:1.15rem; color:var(--text-primary); font-weight:700;">No Pending Requests</h3>
          <p style="margin:0; font-size:0.9rem; color:var(--text-tertiary); line-height:1.6;">New job requests from customers will<br>appear here in real time.</p>
        </div>
        <button class="btn btn-secondary" onclick="loadPage('home')" style="padding: 0.65rem 1.5rem; border-radius:10px; font-size:0.9rem; border: 1px solid rgba(255,255,255,0.1);">
          <i class="fas fa-home" style="margin-right:6px;"></i> Back to Dashboard
        </button>
      </div>
    `}
  `}function le(){let e=i.get(`worker_active_jobs_cache`)||[];return`
    <div class="page-header">
      <h1 class="page-title"><i class="fas fa-bolt" style="color:#fbbf24;"></i> Active Jobs</h1>
      <p class="page-subtitle">Jobs currently in progress</p>
      <div class="page-stats">
        <span class="stat-badge">
          <span class="stat-badge-value" id="active-jobs-count">${Array.isArray(e)?e.length:0}</span>
          <span class="stat-badge-label">Active Jobs</span>
        </span>
      </div>
    </div>

    <!-- Premium Animated Map Section -->
    <div id="active-jobs-map-container" style="position: relative; margin-bottom: 2rem;">
        <div id="active-jobs-map">
            <div class="map-loading-overlay">
                <i class="fas fa-satellite fa-spin" style="font-size: 2rem; color: #00d2ff;"></i>
                <p style="font-weight: 600; letter-spacing: 1px;">INITIALIZING GPS UPLINK...</p>
            </div>
        </div>
        
        <!-- Map Floating Info (Premium) -->
        <div class="map-float-card" id="map-tracking-info" style="display: none;">
            <div class="map-float-label">SIGNAL: ENCRYPTED</div>
            <div class="map-float-value" id="tracked-customer-name">--</div>
            <div style="margin-top: 0.5rem; display: flex; gap: 1rem;">
                <div>
                    <div class="map-float-label">Est. Distance</div>
                    <div class="map-float-value" id="tracked-distance" style="font-size: 0.9rem;">-- km</div>
                </div>
                <div>
                    <div class="map-float-label">Tracking Mode</div>
                    <div class="map-float-value" style="font-size: 0.9rem; color: #4ade80;">ACTIVE</div>
                </div>
            </div>
            
            <button class="map-directions-btn" id="map-get-directions" onclick="window.openDirections()" style="margin-top: 1rem; width: 100%;">
                <i class="fas fa-directions"></i> Get Directions (Google Maps)
            </button>
        </div>
        
        <button class="map-center-btn" onclick="window.recenterMap()" title="Recenter Map">
            <i class="fas fa-crosshairs"></i>
        </button>
    </div>

    <div class="jobs-list" id="activeJobsList">
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 3rem 1.5rem; text-align:center; gap:1.25rem;">
        <div style="width:80px; height:80px; border-radius:50%; background: linear-gradient(135deg, rgba(0,210,255,0.12), rgba(0,210,255,0.04)); border: 1px solid rgba(0,210,255,0.2); display:flex; align-items:center; justify-content:center;">
          <i class="fas fa-spinner fa-spin" style="font-size:1.8rem; color: rgba(0,210,255,0.7);"></i>
        </div>
        <p style="margin:0; font-size:0.9rem; color:var(--text-tertiary);">Syncing live data streams...</p>
      </div>
    </div>
  `}function ue(){return`
  <div class="page-header">
      <h1 class="page-title"><i class="fas fa-clipboard-list" style="color:var(--primary-400);"></i> Job History</h1>
      <p class="page-subtitle">Your completed jobs and earnings</p>
      <div class="page-stats">
        <span class="stat-badge">
          <span class="stat-badge-value" id="history-count">--</span>
          <span class="stat-badge-label">Completed Jobs</span>
        </span>
        <span class="stat-badge">
          <span class="stat-badge-value" id="history-earnings">--</span>
          <span class="stat-badge-label">Total Earned</span>
        </span>
      </div>
    </div>

  <div class="jobs-list" id="jobHistoryList">
    <!-- Content loaded asynchronously -->
  </div>
`}console.log(`Worker Dashboard - Part 1 Loaded`),document.addEventListener(`DOMContentLoaded`,()=>{let e=document.getElementById(`sidebarToggle`),t=document.querySelector(`.sidebar`);e&&t&&(e.addEventListener(`click`,()=>{t.classList.toggle(`minimized`),localStorage.setItem(`sidebarMinimized`,t.classList.contains(`minimized`))}),localStorage.getItem(`sidebarMinimized`)===`true`&&t.classList.add(`minimized`))}),window.addEducationField=function(){let e=document.getElementById(`education-fields-container`),t=Date.now(),n=document.createElement(`div`);n.className=`education-entry`,n.id=`edu-entry-`+t,n.style.background=`rgba(255,255,255,0.05)`,n.style.padding=`1rem`,n.style.borderRadius=`12px`,n.style.marginBottom=`1rem`,n.style.position=`relative`,n.innerHTML=`
  <button onclick="removeEducationField('${t}')" style="position:absolute; top:5px; right:5px; background:none; border:none; color:rgba(255,100,100,0.8); cursor:pointer;"><i class="fas fa-trash"></i></button>
    <div class="info-group">
      <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; font-weight: 600;">INSTITUTION</label>
      <input type="text" class="edu-school form-control" placeholder="Ex: Boston University" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.8rem; border-radius: 12px; margin-bottom: 0.8rem; width: 100%;">

        <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; font-weight: 600;">DEGREE / FIELD</label>
        <input type="text" class="edu-degree form-control" placeholder="Ex: Bachelor's in Architecture" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.8rem; border-radius: 12px; margin-bottom: 0.8rem; width: 100%;">

          <label style="display:block; color:rgba(255,255,255,0.4); font-size:0.75rem; margin-bottom:0.4rem; font-weight: 600;">YEARS</label>
          <input type="text" class="edu-year form-control" placeholder="Ex: 2018 - 2022" style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #fff; padding: 0.8rem; border-radius: 12px; width: 100%;">
          </div>
          `,e.appendChild(n)},window.removeEducationField=function(e){let t=document.getElementById(`edu-entry-`+e);t&&t.remove()},window.triggerImageUpload=function(){document.getElementById(`profile-image-upload`).click()},window.handleImageUpload=function(e){if(e.files&&e.files[0]){let t=new FileReader;t.onload=function(e){let t=document.getElementById(`profile-image-display`);t&&(t.src=e.target.result);let r=i.get(`BlueBridge_user`)||{};r.avatar=e.target.result,i.set(`BlueBridge_user`,r),n(`Profile picture updated!`,`success`)},t.readAsDataURL(e.files[0])}},window.removeProfileImage=function(){if(!confirm(`Are you sure you want to remove your profile picture?`))return;let e=i.get(`BlueBridge_user`)||{};delete e.avatar,i.set(`BlueBridge_user`,e);let t=document.getElementById(`profile-image-display`);t&&(t.src=`https://ui-avatars.com/api/?name=`+encodeURIComponent(e.name||`Worker`)+`&background=0f172a&color=fff&size=256`),n(`Profile picture removed.`,`info`)};async function U(){let e=document.getElementById(`jobRequestsList`);if(e)try{let t=T.jobs.pending||[];console.log(`📡 [AUTOPILOT] Rendering ${t.length} job requests from live sync`),W(t,e);let n=document.getElementById(`requestCount`);n&&(n.textContent=t.length);let r=document.getElementById(`newRequests`);r&&(r.textContent=t.length)}catch(t){console.error(`Failed to load jobs:`,t),e.innerHTML=`
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 2.5rem 1.5rem; text-align:center; gap:1rem;">
        <div style="width:72px; height:72px; border-radius:50%; background: linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05)); border: 1px solid rgba(239,68,68,0.25); display:flex; align-items:center; justify-content:center;">
          <i class="fas fa-exclamation-circle" style="font-size:1.8rem; color: rgba(239,68,68,0.85);"></i>
        </div>
        <div>
          <h3 style="margin:0 0 0.4rem; font-size:1.05rem; color:var(--error); font-weight:700;">Connection Error</h3>
          <p style="margin:0; font-size:0.85rem; color:var(--text-tertiary); line-height:1.5;">We couldn't load your job requests.<br>Please check your connection and try again.</p>
        </div>
        <button class="btn btn-secondary" onclick="fetchAndRenderJobRequests()" style="margin-top:0.25rem; padding: 0.5rem 1.25rem; border-radius:8px; font-size:0.85rem; border: 1px solid rgba(255,255,255,0.1);">
          <i class="fas fa-sync-alt" style="margin-right:6px;"></i> Retry
        </button>
      </div>
    `}}function W(e,t){if(!(t.innerHTML.includes(`Loading...`)||t.innerHTML.includes(`Syncing...`)||t.innerHTML===``)&&S(e,x)){console.log(`📡 [AUTOPILOT] Skipping redundant render for job requests`);return}if(x=[...e],e.length===0){t.innerHTML=`
      <div class="empty-state" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 2.5rem 1.5rem; text-align:center; gap:1rem;">
        <div style="width:72px; height:72px; border-radius:50%; background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05)); border: 1px solid rgba(99,102,241,0.2); display:flex; align-items:center; justify-content:center;">
          <i class="fas fa-inbox" style="font-size:1.8rem; color: rgba(99,102,241,0.7);"></i>
        </div>
        <div>
          <h3 style="margin:0 0 0.4rem; font-size:1.05rem; color:var(--text-primary);">No New Job Requests</h3>
          <p style="margin:0; font-size:0.85rem; color:var(--text-tertiary); line-height:1.5;">Check back later for open<br>opportunities in your area.</p>
        </div>
      </div>
    `;return}t.innerHTML=e.map(e=>`
          <div class="job-request-item">
            <div class="job-request-header">
              <div style="flex:1;">
                <h4 style="margin:0;">${e.serviceType}</h4>
                <div style="font-size: 0.8rem; color: var(--text-tertiary); margin-top: 0.2rem;">By: ${e.customerName}</div>
              </div>
              <span class="badge ${e.createdAt&&Date.now()-new Date(e.createdAt).getTime()<36e5?`badge-error`:`badge-info`}" style="height: fit-content;">
                ${e.status?e.status.toUpperCase():`PENDING`}
              </span>
            </div>
            <p class="job-request-desc" style="margin: 0.5rem 0;">${e.description||`No description provided.`}</p>
            <p class="job-request-location"><i class="fas fa-map-marker-alt" style="color:var(--neon-pink)"></i> ${e.customerAddress}</p>
            <p class="job-request-price"><i class="fas fa-wallet"></i> &#8377;${e.price}</p>

            <div class="job-request-actions" style="margin-top: 1rem;">
              <button class="btn btn-sm btn-primary" onclick="acceptJob('${e.id}')">Accept Job</button>
              <button class="btn btn-sm btn-secondary" onclick="viewJobDetails('${e.id}')">Details</button>
              <button class="btn btn-sm btn-ghost" onclick="declineJob('${e.id}')">Decline</button>
            </div>
          </div>
          `).join(``)}async function G(){let e=document.getElementById(`activeJobsList`);if(e)try{let t=T.jobs.active||[];console.log(`📡 [AUTOPILOT] Rendering ${t.length} active jobs from live sync`),i.set(`worker_active_jobs_cache`,t),renderActiveJobsList(t,e);let n=document.getElementById(`active-jobs-count`);n&&(n.textContent=t.length);let r=document.getElementById(`activeJobs`);r&&(r.textContent=t.length)}catch(t){console.error(`Failed to load active jobs:`,t),(!cachedActive||cachedActive.length===0)&&(e.innerHTML=`
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 2.5rem 1.5rem; text-align:center; gap:1rem;">
          <div style="width:72px; height:72px; border-radius:50%; background: linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05)); border: 1px solid rgba(239,68,68,0.25); display:flex; align-items:center; justify-content:center;">
            <i class="fas fa-exclamation-circle" style="font-size:1.8rem; color: rgba(239,68,68,0.85);"></i>
          </div>
          <div>
            <h3 style="margin:0 0 0.4rem; font-size:1.05rem; color:var(--error); font-weight:700;">Connection Error</h3>
            <p style="margin:0; font-size:0.85rem; color:var(--text-tertiary); line-height:1.5;">We couldn't load your active jobs.<br>Please check your connection and try again.</p>
          </div>
          <button class="btn btn-secondary" onclick="fetchAndRenderActiveJobs()" style="margin-top:0.25rem; padding: 0.5rem 1.25rem; border-radius:8px; font-size:0.85rem; border: 1px solid rgba(255,255,255,0.1);">
            <i class="fas fa-sync-alt" style="margin-right:6px;"></i> Retry
          </button>
        </div>
      `)}}window.addPortfolioField=function(){let e=document.getElementById(`portfolio-inputs`);if(!e)return;let t=document.createElement(`input`);t.type=`text`,t.className=`portfolio-url-input form-control`,t.placeholder=`https://example.com/image.jpg`,t.style.background=`rgba(0,0,0,0.3)`,t.style.border=`1px solid rgba(255,255,255,0.1)`,t.style.color=`#fff`,t.style.padding=`0.8rem`,t.style.borderRadius=`12px`,t.style.marginBottom=`0.5rem`,t.style.width=`100%`,e.appendChild(t)},window.renderActiveJobsList=function(e,t){if(!(t.innerHTML.includes(`Loading...`)||t.innerHTML.includes(`Syncing...`)||t.innerHTML===``)&&S(e,b)){console.log(`📡 [AUTOPILOT] Skipping redundant render for active jobs`);return}if(b=[...e],e.length===0){t.innerHTML=`
      <div class="empty-state" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 2.5rem 1.5rem; text-align:center; gap:1rem;">
        <div style="width:72px; height:72px; border-radius:50%; background: linear-gradient(135deg, rgba(0,210,255,0.12), rgba(0,210,255,0.04)); border: 1px solid rgba(0,210,255,0.2); display:flex; align-items:center; justify-content:center;">
          <i class="fas fa-briefcase" style="font-size:1.8rem; color: rgba(0,210,255,0.7);"></i>
        </div>
        <div>
          <h3 style="margin:0 0 0.4rem; font-size:1.05rem; color:var(--text-primary);">No Active Jobs</h3>
          <p style="margin:0; font-size:0.85rem; color:var(--text-tertiary); line-height:1.5;">You have no jobs in progress<br>at the moment.</p>
        </div>
        <button class="btn btn-primary" onclick="loadPage('job-requests')" style="margin-top:0.25rem; padding: 0.6rem 1.4rem; border-radius:10px; font-size:0.9rem;">
          <i class="fas fa-search" style="margin-right:6px;"></i> Find New Jobs
        </button>
      </div>
    `;return}t.innerHTML=e.map(e=>`
          <div class="job-card active-job-card" style="border-left: 4px solid var(--neon-blue); background: var(--bg-secondary);">
            <div class="job-card-header">
              <div>
                <h3 style="margin:0; color:var(--text-primary);">${e.serviceType}</h3>
                <span class="badge badge-success" style="background: var(--neon-green); color: #000; font-weight: 700; font-size: 0.7rem;">IN PROGRESS</span>
              </div>
              <span class="job-time" style="font-size: 0.8rem; color: var(--text-tertiary);">${r(e.acceptedAt||e.updatedAt||e.createdAt)}</span>
            </div>

            <p class="job-description" style="margin: 1rem 0; font-size: 0.95rem; color: var(--text-secondary);">${e.description||`Service visit in progress`}</p>

            <div class="job-details" style="background: rgba(0,0,0,0.2); border-radius: 12px; padding: 1rem; margin-bottom: 1.5rem;">
              <div class="job-detail-row" style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                <span class="detail-icon" style="width: 24px; color: var(--neon-blue);"><i class="fas fa-user"></i></span>
                <span class="detail-text" style="font-weight: 600;">${e.customerName||`Customer`}</span>
              </div>
              <div class="job-detail-row" style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                <span class="detail-icon" style="width: 24px; color: var(--neon-pink);"><i class="fas fa-map-marker-alt"></i></span>
                <span class="detail-text" style="font-size: 0.9rem;">${e.customerAddress||e.address}</span>
              </div>
              <div class="job-detail-row" style="display: flex; align-items: center; gap: 0.75rem;">
                <span class="detail-icon" style="width: 24px; color: var(--neon-green);"><i class="fas fa-wallet"></i></span>
                <span class="detail-text" style="font-weight: 700;">&#8377;${e.price}</span>
              </div>
            </div>

            <div class="job-actions" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.75rem;">

              <button class="btn btn-success" style="grid-column: span 2; padding: 1rem; font-weight: 700;" onclick="completeJob('${e.id}')">
                <i class="fas fa-check-double" style="margin-right: 8px;"></i> Mark as Complete
              </button>
              
              <button class="btn btn-primary" style="background: var(--neon-blue); color: #000; border: none; font-weight: 600;" onclick="window.open('tel:${e.customerPhone}')">
                <i class="fas fa-phone" style="margin-right: 8px;"></i> Call
              </button>
              
              <button class="btn btn-secondary" style="border-color: var(--neon-blue); color: var(--neon-blue); font-weight: 600;" onclick="window.location.href='/chat/chat?bookingId=${e.id}&receiverName=${encodeURIComponent(e.customerName||`Customer`)}&receiverId=${e.customerId||``}'">
                <i class="fas fa-comment-dots" style="margin-right: 8px;"></i> Chat
              </button>
              
              <button class="btn btn-ghost" style="grid-column: span 2; border: 1px dashed rgba(255,255,255,0.2); font-size: 0.8rem; margin-top: 0.5rem;" onclick="window.open('https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.customerAddress||e.address)}')">
                <i class="fas fa-directions" style="margin-right: 8px;"></i> Get Directions (Google Maps)
              </button>
          `).join(``)};async function K(){let e=document.getElementById(`jobHistoryList`);if(e){e.innerHTML=`
      <div style="text-align:center; padding: 2.5rem; border-radius: 20px; background: rgba(255,255,255,0.02); margin: 1rem 0;">
          <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary-400);"></i>
          <p style="margin-top: 1rem; color: var(--text-tertiary);">Loading your job history...</p>
      </div>
  `;try{await j();let t=T.jobs.completed||[],n=T.earnings.total||0,r=document.getElementById(`history-count`),i=document.getElementById(`history-earnings`);r&&(r.textContent=t.length),i&&(i.textContent=`â‚¹${n.toLocaleString()}`),de(t,e)}catch(t){console.error(`Failed to load job history:`,t),e.innerHTML=`
          <div class="error-state" style="padding: 2.5rem; text-align:center;">
              <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: var(--error);"></i>
              <p style="margin: 1rem 0;">Failed to load history data.</p>
              <button class="btn btn-sm btn-secondary" onclick="fetchAndRenderJobHistory()">Retry</button>
          </div>
      `}}}function de(e,t){if(e.length===0){t.innerHTML=`
          <div class="empty-state" style="padding: 4rem 2rem; text-align:center; border-radius: 24px; background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.1);">
             <div style="font-size: 4rem; opacity: 0.2; margin-bottom: 1rem;">📡</div>
             <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem; color: var(--text-primary);">No Job History Yet</h3>
             <p style="color: var(--text-tertiary); margin-bottom: 2rem; max-width: 300px; margin-left:auto; margin-right:auto;">Your finished jobs and earned income will appear here once you complete your first service.</p>
             <button class="btn btn-primary" style="padding: 0.75rem 2rem; border-radius: 12px;" onclick="loadPage('home')">Return to Dashboard</button>
          </div>
      `;return}t.innerHTML=[...e].sort((e,t)=>{let n=new Date(e.completedAt||e.updatedAt||0);return new Date(t.completedAt||t.updatedAt||0)-n}).map(e=>`
          <div class="job-card history-card" style="animation: slideUp 0.3s ease-out; border-left: 4px solid var(--success); background: rgba(255,255,255,0.03); margin-bottom: 1.25rem; padding: 1.5rem; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05);">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem;">
              <div>
                <h4 style="margin:0; font-size: 1.15rem; font-weight: 700; color: var(--text-primary); text-transform: capitalize;">${e.serviceType}</h4>
                <div style="font-size: 0.85rem; color: var(--text-tertiary); margin-top: 0.25rem;">Customer: <span style="font-weight:600; color:var(--text-secondary);">${e.customerName}</span></div>
              </div>
              <span class="badge" style="font-weight: 700; background: rgba(16, 185, 129, 0.1); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.2); padding: 5px 12px; border-radius: 20px; font-size: 0.75rem; letter-spacing: 0.5px;">
                COMPLETED
              </span>
            </div>
            
            <p style="margin: 1rem 0; font-size: 1rem; color: var(--text-secondary); line-height: 1.5;">${e.description||`Service completed successfully`}</p>
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1.5rem; padding-top: 1.25rem; border-top: 1px solid rgba(255,255,255,0.05);">
              <div style="display:flex; gap: 1.5rem;">
                <span title="Completion Date" style="font-size: 0.85rem; color: var(--text-tertiary); display:flex; align-items:center; gap:6px;"><i class="fas fa-calendar-check" style="opacity:0.6;"></i> ${e.completedAt?new Date(e.completedAt).toLocaleDateString(void 0,{month:`short`,day:`numeric`,year:`numeric`}):e.scheduledDate||`Recently`}</span>
                <span title="Booking Reference" style="font-size: 0.85rem; color: var(--text-tertiary); display:flex; align-items:center; gap:6px;"><i class="fas fa-fingerprint" style="opacity:0.6;"></i> #${(e.id||`N/A`).toString().slice(-6).toUpperCase()}</span>
              </div>
              <span style="font-weight: 800; color: var(--success); font-size: 1.4rem;">₹${e.price}</span>
            </div>
          </div>
          `).join(``)}window.performLogout=async function(e){e&&(e.preventDefault(),e.stopPropagation(),e.stopImmediatePropagation&&e.stopImmediatePropagation()),console.log(`[WORKER LOGOUT] Immediate sign out triggered`),n(`Signing out...`,`info`);try{g&&typeof g.signOut==`function`&&await g.signOut()}catch(e){console.warn(`[WORKER LOGOUT] Firebase error:`,e)}try{i!==void 0&&i.clear&&i.clear(),localStorage.clear(),sessionStorage.clear(),console.log(`[WORKER LOGOUT] Redirecting...`),window.location.href=`/`}catch(e){console.error(`[WORKER LOGOUT] Cleanup error:`,e),window.location.href=`/`}},document.addEventListener(`click`,e=>{e.target.closest(`#headerSignOutBtn`)&&!e.defaultPrevented&&window.performLogout(e)}),window.loadPage=V,window.refreshDashboardData=j,window.fetchAndRenderJobRequests=U,window.fetchAndRenderActiveJobs=G,window.fetchAndRenderJobHistory=K,window.locationEngine={watchId:null,lastUpdate:0,lastCoords:null,minDistance:5,minInterval:1e4,start(){!navigator.geolocation||this.watchId||(console.log(`🚀 [LOCATION ENGINE] Ignition. Starting High-Accuracy Stream...`),this.watchId=navigator.geolocation.watchPosition(e=>this.handleUpdate(e),e=>console.warn(`❌ [LOCATION ENGINE] Signal Interrupted:`,e.message),{enableHighAccuracy:!0,maximumAge:0,timeout:1e4}))},stop(){this.watchId&&(navigator.geolocation.clearWatch(this.watchId),this.watchId=null,console.log(`🛑 [LOCATION ENGINE] Stream Terminated.`))},handleUpdate(e){let{latitude:t,longitude:n}=e.coords,r=Date.now();typeof window.updateWorkerMarker==`function`&&window.updateWorkerMarker(t,n);let i=r-this.lastUpdate;((this.lastCoords?this.calculateDistance(t,n,this.lastCoords.lat,this.lastCoords.lng):999)>this.minDistance||i>this.minInterval)&&(this.broadcast(t,n),this.lastUpdate=r,this.lastCoords={lat:t,lng:n})},async broadcast(e,t){let n=i.get(`BlueBridge_user`);if(!(!n||!n.uid)){try{await m(a(f,`workers`,n.uid),{location:{lat:e,lng:t,updatedAt:new Date().toISOString()},is_online:!0},{merge:!0})}catch{console.warn(`Profile sync failed`)}Array.isArray(window.activeBookingIds)&&window.activeBookingIds.length>0&&window.activeBookingIds.forEach(n=>{try{m(a(f,`locations`,n),{workerLocation:{lat:e,lng:t,timestamp:new Date().toISOString()}},{merge:!0})}catch{}})}},calculateDistance(e,t,n,r){let i=e*Math.PI/180,a=n*Math.PI/180,o=(n-e)*Math.PI/180,s=(r-t)*Math.PI/180,c=Math.sin(o/2)*Math.sin(o/2)+Math.cos(i)*Math.cos(a)*Math.sin(s/2)*Math.sin(s/2);return 6371e3*(2*Math.atan2(Math.sqrt(c),Math.sqrt(1-c)))}},window.startGPS=()=>window.locationEngine.start(),window.startGlobalLocationWatch=()=>window.locationEngine.start();async function fe(){console.log(`📡 [WORKER SYNC] Scanning for active mission signals...`);let e=i.get(`BlueBridge_user`);if(e)try{let t=window.location.hostname===`localhost`||window.location.hostname===`127.0.0.1`?`http://localhost:5000/api`:`/api`,n=await(await fetch(`${t}/bookings?user_id=${e.uid}&role=worker`)).json(),r=[`assigned`,`in_progress`,`accepted`,`running`,`on the way`];window.activeBookingIds=(n||[]).filter(e=>r.includes((e.status||``).toLowerCase())).map(e=>e.id),window.activeBookingIds.length>0&&window.locationEngine.start()}catch(e){console.warn(`📡 [WORKER SYNC] Mission scan failed:`,e)}}window.fetchAndRenderActiveJobs=G,window.fetchAndRenderJobRequests=U,window.fetchAndRenderJobHistory=K,window.refreshDashboardData=j,window.isListIdentical=S,window.renderJobRequestsList=W,window.renderActiveJobsList=renderActiveJobsList;function q(){document.getElementById(`main-content`)||document.body?(console.log(`[WORKER DASHBOARD] Ready. Initializing...`),E()):(console.log(`[WORKER DASHBOARD] Waiting for DOM...`),setTimeout(q,50))}q();var J=null,Y=null,X={},Z={},Q=[];window.initActiveJobsMap=async function(){if(console.log(`📡 [MISSION CONTROL] Initializing Premium Animated Map...`),!document.getElementById(`active-jobs-map`)||typeof L>`u`){console.warn(`Map container or Leaflet not found`);return}window.cleanupActiveJobsMap(),J=L.map(`active-jobs-map`,{zoomControl:!1,attributionControl:!1}).setView([28.6139,77.209],13),L.tileLayer(`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`,{maxZoom:19}).addTo(J),L.control.zoom({position:`bottomleft`}).addTo(J);let e=i.get(`BlueBridge_user`);if(!e||!e.uid)return;if(window.locationEngine&&window.locationEngine.lastCoords){let{lat:e,lng:t}=window.locationEngine.lastCoords;$(e,t);let n=document.querySelector(`.map-loading-overlay`);n&&(n.style.display=`none`),J.setView([e,t],13)}else s(a(f,`workers`,e.uid)).then(e=>{let t=e.data();if(t&&t.location){$(t.location.lat,t.location.lng);let e=document.querySelector(`.map-loading-overlay`);e&&(e.style.display=`none`)}});window.locationEngine&&window.locationEngine.start();let t=_(c(l(f,`jobs`),u(`workerId`,`in`,[e.uid,`true`]),u(`status`,`in`,[`assigned`,`in_progress`,`accepted`,`running`,`on the way`])),e=>{let t=[];e.forEach(e=>{let n={id:e.id,...e.data()};n.location&&n.location.lat&&n.location.lng&&(pe(n),t.push(n.id))}),Object.keys(X).forEach(e=>{t.includes(e)||me(e)}),he(e.docs.map(e=>({id:e.id,...e.data()})))});Q.push(t),console.log(`📡 [MISSION CONTROL] Listeners Active.`)};function $(e,t){if(!J)return;let n=L.divIcon({className:`custom-worker-icon`,html:`<div class="worker-marker-icon"><div class="worker-marker-pulse"></div></div>`,iconSize:[24,24],iconAnchor:[12,12]});Y?Y.setLatLng([e,t]):(Y=L.marker([e,t],{icon:n}).addTo(J),J.panTo([e,t])),Object.keys(Z).forEach(n=>{let r=X[n].getLatLng();Z[n].setLatLngs([[e,t],r])})}function pe(e){if(!J)return;let{id:t,location:n,customerName:r}=e,i=[n.lat,n.lng],a=L.divIcon({className:`custom-customer-icon`,html:`<div class="customer-marker-icon"><i class="fas fa-user-tie"></i></div>`,iconSize:[24,24],iconAnchor:[12,12]});if(X[t])X[t].setLatLng(i),Y&&Z[t].setLatLngs([Y.getLatLng(),i]);else{X[t]=L.marker(i,{icon:a}).addTo(J).bindPopup(`<b>${r}</b><br>${e.serviceType}`);let n=L.polyline([Y?Y.getLatLng():i,i],{color:`#00d2ff`,weight:3,opacity:.6,dashArray:`10, 10`,className:`leaflet-ant-path`}).addTo(J);Z[t]=n}}function me(e){X[e]&&(J.removeLayer(X[e]),delete X[e]),Z[e]&&(J.removeLayer(Z[e]),delete Z[e])}function he(e){let t=document.getElementById(`map-tracking-info`),n=document.getElementById(`tracked-customer-name`),r=document.getElementById(`tracked-distance`);if(!t||e.length===0){t&&(t.style.display=`none`);return}let i=e[0];t.style.display=`block`,n.textContent=i.customerName||`Active Client`;let a=document.getElementById(`map-get-directions`);if(a&&i.location&&(a.dataset.lat=i.location.lat,a.dataset.lng=i.location.lng),Y&&i.location){let e=Y.getLatLng();r.textContent=(J.distance(e,[i.location.lat,i.location.lng])/1e3).toFixed(2)+` km`}}window.openDirections=function(){let e=document.getElementById(`map-get-directions`);if(!e||!e.dataset.lat){n(`No active target destination found`,`warning`);return}let t=`https://www.google.com/maps/dir/?api=1&destination=${e.dataset.lat},${e.dataset.lng}`;if(window.locationEngine&&window.locationEngine.lastCoords){let{lat:e,lng:n}=window.locationEngine.lastCoords;t+=`&origin=${e},${n}`}window.open(t,`_blank`)},window.recenterMap=function(){J&&Y&&J.flyTo(Y.getLatLng(),15)},window.cleanupActiveJobsMap=function(){if(console.log(`🧼 [MISSION CONTROL] Cleaning up map resources...`),Q.forEach(e=>{try{e()}catch{}}),Q=[],J){try{J.remove()}catch(e){console.warn(`Map removal failed:`,e)}J=null}Y=null,X={},Z={}};var ge=window.initializePage;window.initializePage=function(e,t){typeof ge==`function`&&ge(e,t),e===`active-jobs`?setTimeout(window.initActiveJobsMap,500):window.cleanupActiveJobsMap()};