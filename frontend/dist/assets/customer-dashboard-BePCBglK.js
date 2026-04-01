import{n as e,o as t,t as n}from"./utils-B2C-mP9z.js";import{_ as r,d as i,f as a,g as o,h as s,m as c,n as l,t as u,u as d}from"./config-Cmdxbuss.js";import{n as f,t as p}from"./api-BFM6M95r.js";var m={USER:`BlueBridge_user`,BOOKINGS:`BlueBridge_bookings`,WALLET:`BlueBridge_wallet`};window.dashboardData,console.log(`🛰️ [MISSION CONTROL] Loaded Refreshed Dashboard Engine v5.1`);var h=e=>document.getElementById(e),g=e=>document.querySelectorAll(e),_=!1;function v(){if(_)return;_=!0,console.log(`[DASHBOARD] Initializing customer dashboard...`);let e=n.get(m.USER);if(console.log(`[DASHBOARD] User data from storage:`,e),!e||!e.loggedIn){console.warn(`[DASHBOARD] User not logged in, redirecting to login page`),window.location.href=`/auth/login`;return}console.log(`[DASHBOARD] User authenticated, continuing initialization`),n.get(`BlueBridge_v2_migration`)||(n.remove(m.BOOKINGS),n.set(`BlueBridge_v2_migration`,`done`)),re(),x(e),w(),y(),D(),S(),ee(e.uid),ne()}async function y(){try{await A(),await j(),await M(),await N(),P()}catch(e){console.error(`Initial rendering error:`,e)}D(),S()}var b=null;function ee(e){b&&b();let t=a(o(l,`jobs`),s(`customerId`,`==`,e),i(`createdAt`,`desc`));console.log(`Subscribing to bookings for:`,e),b=d(t,e=>{let t=[];e.forEach(e=>{let n=e.data();t.push({id:e.id,service:n.serviceType||`General`,worker:n.workerName||(n.workerId===`auto-assign`?`Assigning...`:`Worker assigned`),workerId:n.workerId,workerPhone:n.workerPhone||``,date:n.date||n.scheduledTime?.split(`T`)[0]||`TBD`,time:n.time||`09:00 AM`,status:n.status?n.status.charAt(0).toUpperCase()+n.status.slice(1):`Pending`,price:n.price||450,address:n.address})}),console.log(`Real-time bookings update:`,t.length),n.set(m.BOOKINGS,t),w(),document.getElementById(`overview-active-booking-container`)&&A(),document.getElementById(`bookings-grid`)&&j(),te(t)},e=>{console.error(`Error listening to bookings:`,e)})}function te(e){if(!navigator.geolocation)return;let t=[`assigned`,`accepted`,`in_progress`,`running`,`on the way`,`active`],r=(e||[]).filter(e=>t.includes((e.status||``).toLowerCase()));if(window._customerLiveJobs=r,r.length===0){window.customerGPSWatchId&&(navigator.geolocation.clearWatch(window.customerGPSWatchId),window.customerGPSWatchId=null,console.log(`🔴 GPS tracking stopped - no active jobs.`));return}if(window.customerGPSWatchId)return;console.log(`🟢 Background GPS presence tracking started.`);let i=n.get(m.USER),a=window.location.hostname===`localhost`||window.location.hostname===`127.0.0.1`?`http://localhost:5000/api`:`/api`;window.customerGPSWatchId=navigator.geolocation.watchPosition(e=>{let{latitude:t,longitude:n}=e.coords;i?.uid&&p?.auth?.updateProfile&&p.auth.updateProfile(i.uid,{location:{lat:t,lng:n,lastUpdated:new Date().toISOString()}}).catch(()=>{}),(window._customerLiveJobs||[]).forEach(e=>{fetch(`${a}/location/${e.id}`,{method:`PUT`,headers:{"Content-Type":`application/json`},body:JSON.stringify({userId:i?.uid||`anonymous`,userType:`customer`,latitude:t,longitude:n,timestamp:new Date().toISOString()})}).catch(()=>{}),p?.bookings?.update&&p.bookings.update(e.id,{"location.lat":t,"location.lng":n,"customerLocation.lat":t,"customerLocation.lng":n}).catch(()=>{})})},e=>{console.warn(`Background tracking GPS watch error`,e),e.code===e.PERMISSION_DENIED&&(window.customerGPSWatchId&&navigator.geolocation.clearWatch(window.customerGPSWatchId),window.customerGPSWatchId=null)},{enableHighAccuracy:!0,maximumAge:0})}function ne(){window.openTracking=function(e){t(`Switching to maps for worker tracking...`,`info`);let r=document.querySelector(`[data-tab="nearby-workers"]`);if(r){r.click();let t=(n.get(m.BOOKINGS)||[]).find(t=>t.id===e);t&&t.workerId&&t.workerId!==`auto-assign`&&setTimeout(()=>{window.focusOnWorker&&window.focusOnWorker(t.workerId)},500)}},window.cancelBooking=async function(e){t(`Processing cancellation...`,`info`);try{console.log(`[DASHBOARD] Cancelling booking:`,e);let n=await p.jobs.cancel(e);if(n&&n.success)t(`Booking cancelled successfully`,`success`);else throw Error(n?.error||`Failed to cancel booking`)}catch(e){console.error(`Failed to cancel:`,e),t(`Failed to cancel: `+e.message,`error`)}}}function re(){h(`menu-toggle`)?.addEventListener(`click`,()=>{h(`sidebar`)?.classList.toggle(`active`),h(`sidebar-overlay`)?.classList.toggle(`active`)}),h(`sidebarToggle`)?.addEventListener(`click`,()=>{h(`sidebar`)?.classList.remove(`active`),h(`sidebar-overlay`)?.classList.remove(`active`)}),document.addEventListener(`change`,e=>{e.target&&(e.target.id===`profile-upload`||e.target.id===`profile-upload-main`)&&(e.stopPropagation(),ie(e))}),window.toggleChatPopup=R,h(`ai-widget-toggle`)?.addEventListener(`click`,R),h(`close-chat-popup`)?.addEventListener(`click`,R),h(`maximize-chat-popup`)?.addEventListener(`click`,()=>{h(`ai-chat-popup`).classList.toggle(`maximized`)}),h(`minimize-chat-popup`)?.addEventListener(`click`,()=>{let e=h(`ai-chat-popup`);e.classList.contains(`maximized`)?e.classList.remove(`maximized`):R()});let e=h(`ai-popup-send`);e?e.addEventListener(`click`,e=>{e.preventDefault(),B()}):console.error(`AI Send Button NOT FOUND`);let t=h(`ai-popup-input`);t&&t.addEventListener(`keydown`,e=>{e.key===`Enter`&&(console.log(`Enter Key Pressed`),e.preventDefault(),B())})}function ie(e){let t=e.target.files[0];if(!t)return;if(t.size>2*1024*1024){alert(`Image too large. Max 2MB.`);return}let r=new FileReader;r.onload=e=>{let t=e.target.result,r=n.get(m.USER)||{};r.profilePic=t,n.set(m.USER,r),x(r)},r.readAsDataURL(t)}function x(e){let t=h(`user-display-name`),n=h(`welcome-name`),r=h(`user-avatar-initials`),i=h(`user-avatar-img`);if(e.reward_points||e.profile?.reward_points,t&&(t.innerHTML=`
            ${e.name||`User`} 
        `),n&&(n.textContent=(e.name||`User`).split(` `)[0]),e.profilePic&&i)i.src=e.profilePic,i.style.display=`block`,r&&(r.style.display=`none`),g(`.user-profile-mini .avatar`).forEach(t=>{t.style.backgroundImage=`url(${e.profilePic})`,t.style.backgroundSize=`cover`,t.textContent=``});else if(r){i.style.display=`none`,r.style.display=`flex`;let t=(e.name||`U`).split(` `);r.textContent=t.length>1?t[0][0]+t[1][0]:t[0][0]}}function S(){let e=g(`.nav-item[data-tab]`),t=g(`.tab-content`);e.forEach(n=>{n.addEventListener(`click`,r=>{r.preventDefault();let i=n.getAttribute(`data-tab`);e.forEach(e=>e.classList.remove(`active`)),n.classList.add(`active`),t.forEach(e=>{e.style.display=`none`,e.id===`${i}-tab`&&(e.style.display=`block`)}),ae(i)})})}function ae(e){try{e===`my-bookings`&&j(),e===`overview`&&A(),e===`wallet`&&M(),e===`profile`&&N(),e===`support`&&P(),e===`nearby-workers`&&X(),e===`settings`&&C()}catch(t){console.error(`Error loading data for tab ${e}:`,t)}}function C(){console.log(`Rendering Settings...`);let e=localStorage.getItem(`use_firestore_realtime`)===`true`?`firestore`:`polling`,t=h(`tracking-polling`),n=h(`tracking-firestore`);t&&n&&(e===`firestore`?n.checked=!0:t.checked=!0)}window.saveTrackingMethod=function(e){let n=e===`firestore`;localStorage.setItem(`use_firestore_realtime`,n),console.log(`Tracking method set to: ${e}`),document.querySelector(`.nav-item.active`)?.getAttribute(`data-tab`)===`nearby-workers`&&X(),t(`Tracking changed to ${e}`,`success`)},window.showWorkerProfileInDashboard=async function(e){console.log(`showWorkerProfileInDashboard called with uid:`,e);try{let t=await p.workers.getById(e);if(console.log(`Worker data fetched:`,t),!t){console.error(`Worker not found for uid:`,e),alert(`Could not load worker profile. Please try again.`);return}oe(t)}catch(e){console.error(`Failed to show profile:`,e),alert(`Error loading profile: `+e.message)}};function oe(e){let t=document.getElementById(`dashboard-worker-modal`);if(!t)return;let n=e.name||`Professional`,r=n.substring(0,2).toUpperCase(),i=e.category||`Specialist`,a=e.rating_avg||e.stats?.avg_rating||4.5,o=e.stats?.total_jobs||e.total_jobs||0,s=e.experience_years||3,c=e.base_price||500,l=e.bio||`Excellent professional with highly rated services.`,u=e.phone||`Not available`,d=e.email||``,f=e.is_verified||e.verification_status===`verified`,p=e.qualifications||[],m=e.skills||[i],h=e.profile_pic||e.avatar||``,g=Math.floor(a),_=a%1>=.5,v=5-g-(_?1:0),y=``;for(let e=0;e<g;e++)y+=`<i class="fas fa-star" style="color: var(--neon-orange);"></i>`;_&&(y+=`<i class="fas fa-star-half-alt" style="color: var(--neon-orange);"></i>`);for(let e=0;e<v;e++)y+=`<i class="far fa-star" style="color: var(--neon-orange); opacity: 0.3;"></i>`;let b=t.querySelector(`.profile-modal-content`);b.innerHTML=`
        <button class="profile-close" onclick="closeDashboardWorkerModal()"><i class="fas fa-times"></i></button>
        
        <div class="profile-header-banner" style="background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple)); padding: 2rem; text-align: center; position: relative;">
            ${f?`<div style="position: absolute; top: 15px; right: 15px; background: var(--neon-green); color: #000; padding: 5px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; gap: 5px;"><i class="fas fa-check-circle"></i> VERIFIED</div>`:``}
            
            ${h?`<div style="width: 120px; height: 120px; margin: 0 auto; border-radius: 50%; overflow: hidden; border: 4px solid rgba(255,255,255,0.3); box-shadow: 0 8px 20px rgba(0,0,0,0.3);">
                    <img src="${h}" alt="${n}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>`:`<div class="profile-avatar-large" style="width: 120px; height: 120px; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; background: rgba(255,255,255,0.2); border: 4px solid rgba(255,255,255,0.3); border-radius: 50%; box-shadow: 0 8px 20px rgba(0,0,0,0.3);">${r}</div>`}
        </div>
        
        <div class="profile-body" style="padding: 2rem;">
            <!-- Name & Title -->
            <div style="text-align: center; margin-bottom: 1.5rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 1.5rem;">
                <h2 style="margin: 0; font-size: 1.8rem; color: #fff;">${n}</h2>
                <p style="margin: 5px 0; color: var(--neon-blue); font-weight: 600; font-size: 1.1rem;">${i}</p>
                <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 10px;">
                    <div style="display: flex; gap: 3px;">${y}</div>
                    <span style="color: var(--text-secondary); font-size: 0.9rem;">${a.toFixed(1)} (${o}+ jobs)</span>
                </div>
            </div>

            <!-- Quick Stats Grid -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; padding: 1rem; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid var(--glass-border);">
                <div style="text-align: center;">
                    <div style="font-size: 1.5rem; color: var(--neon-blue); font-weight: 700;">${s}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Years Exp</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 1.5rem; color: var(--neon-green); font-weight: 700;">₹${c}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Base Rate</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 1.5rem; color: var(--neon-purple); font-weight: 700;">${o}+</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Jobs Done</div>
                </div>
            </div>

            <!-- Contact Info -->
            <div style="margin-bottom: 1.5rem; padding: 1rem; background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px solid var(--glass-border);">
                <h4 style="margin-bottom: 12px; color: #fff; font-size: 1rem; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-address-card" style="color: var(--neon-blue);"></i> Contact Information
                </h4>
                <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.9rem;">
                    <div style="display: flex; align-items: center; gap: 10px; color: var(--text-secondary);">
                        <i class="fas fa-phone" style="width: 20px; color: var(--neon-green);"></i>
                        <span>${u}</span>
                    </div>
                    ${d?`<div style="display: flex; align-items: center; gap: 10px; color: var(--text-secondary);">
                        <i class="fas fa-envelope" style="width: 20px; color: var(--neon-blue);"></i>
                        <span>${d}</span>
                    </div>`:``}
                </div>
            </div>

            ${p.length>0?`
            <!-- Certifications -->
            <div style="margin-bottom: 1.5rem;">
                <h4 style="margin-bottom: 10px; color: #fff; font-size: 1rem; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-certificate" style="color: var(--neon-orange);"></i> Certifications
                </h4>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    ${p.map(e=>`<span style="background: rgba(255,165,0,0.1); color: var(--neon-orange); padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; border: 1px solid rgba(255,165,0,0.3);">${e}</span>`).join(``)}
                </div>
            </div>
            `:``}

            <!-- About -->
            <div style="margin-bottom: 1.5rem;">
                <h4 style="margin-bottom: 10px; color: #fff; font-size: 1rem; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-user-circle" style="color: var(--neon-purple);"></i> About Professional
                </h4>
                <p style="font-size: 0.9rem; line-height: 1.6; color: var(--text-secondary); margin: 0;">${l}</p>
            </div>

            <!-- Profession -->
            <div style="margin-bottom: 1.5rem;">
                <h4 style="margin-bottom: 10px; color: #fff; font-size: 1rem; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-tools" style="color: var(--neon-blue);"></i> Professional Category
                </h4>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    <span class="skill-tag" style="background: rgba(0,210,255,0.1); color: var(--neon-blue); padding: 6px 12px; border-radius: 20px; font-size: 0.9rem; border: 1px solid rgba(0,210,255,0.3); font-weight: 600;">${e.profession||e.category||`General Professional`}</span>
                </div>
            </div>

            ${m.length>0&&m[0]!==i?`
            <!-- Specific Skills -->
            <div style="margin-bottom: 1.5rem;">
                <h4 style="margin-bottom: 10px; color: #fff; font-size: 1rem; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-list-ul" style="color: var(--neon-green);"></i> Additional Skills
                </h4>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    ${m.map(e=>`<span class="skill-tag" style="background: rgba(52,211,153,0.1); color: #34d399; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; border: 1px solid rgba(52,211,153,0.3);">${e}</span>`).join(``)}
                </div>
            </div>
            `:``}

            <!-- View Route History -->
            <button class="btn btn-secondary" style="width: 100%; margin-bottom: 1.5rem; border: 1px solid var(--neon-purple); color: var(--neon-purple); background: rgba(157, 80, 187, 0.1); padding: 10px; border-radius: 8px; font-weight: 600; cursor: pointer;" onclick="closeDashboardWorkerModal(); window.visualizeWorkerHistory('${e.uid||e.id}')">
                <i class="fas fa-route"></i> View Location Path (Beta)
            </button>

            <!-- Action Buttons -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <button class="btn btn-primary" style="background: var(--neon-blue); color: #000; font-weight: 700; padding: 0.75rem;" onclick="closeDashboardWorkerModal(); document.querySelector('[data-tab=book-service]').click()">
                    <i class="fas fa-calendar-check"></i> Book Now
                </button>
                <button class="btn btn-secondary" style="border: 2px solid var(--neon-green); color: var(--neon-green); background: transparent; font-weight: 700; padding: 0.75rem;" onclick="window.open('tel:${u}')">
                    <i class="fas fa-phone-alt"></i> Call Now
                </button>
            </div>
        </div>
    `,t.classList.add(`active`)}window.closeDashboardWorkerModal=function(){document.getElementById(`dashboard-worker-modal`)?.classList.remove(`active`)},window.visualizeWorkerHistory=async function(e){console.log(`🎬 Visualizing history for worker: ${e}`);try{let t=await p.workers.getLocationHistory(e);if(!t||t.length<2){alert(`No travel history found for this professional recently.`);return}if(!V){alert(`Please open the Nearby Workers map first.`);return}let n=t.map(e=>[e.lat,e.lng]);window.historyPolyline&&V.removeLayer(window.historyPolyline),window.historyPolyline=L.polyline(n,{color:`#a855f7`,weight:5,opacity:.8,dashArray:`10, 15`,lineJoin:`round`,className:`history-path-animation`}).addTo(V);let r=L.divIcon({html:`<i class="fas fa-play-circle" style="color: #a855f7;"></i>`,className:`history-edge`}),i=L.divIcon({html:`<i class="fas fa-flag-checkered" style="color: #34d399;"></i>`,className:`history-edge`}),a=L.marker(n[0],{icon:r}).addTo(V),o=L.marker(n[n.length-1],{icon:i}).addTo(V);V.fitBounds(window.historyPolyline.getBounds(),{padding:[100,100]}),console.log(`✅ Path drawn with ${t.length} points.`),setTimeout(()=>{window.historyPolyline&&V.removeLayer(window.historyPolyline),V.removeLayer(a),V.removeLayer(o),window.historyPolyline=null},45e3)}catch(e){console.error(`History visualization error:`,e),alert(`Error loading history: `+e.message)}},window.handleAIMessage=B;async function w(){let e=n.get(m.USER);if(!(!e||!e.uid))try{let t=e._lastBalanceFetch||0,r=Date.now();if(r-t>3e5){let t=await f(`/payments/balance/${e.uid}`),i=h(`stat-wallet-bal`);i&&t.success&&(i.textContent=`₹${t.balance.toFixed(2)}`,e.wallet={balance:t.balance},e._lastBalanceFetch=r,n.set(m.USER,e))}else if(e.wallet){let t=h(`stat-wallet-bal`);t&&(t.textContent=`₹${(e.wallet.balance||0).toFixed(2)}`)}let i=n.get(m.BOOKINGS)||[],a=i.filter(e=>[`active`,`on the way`,`running`,`pending`,`assigned`,`scheduled`,`confirmed`,`accepted`].includes((e.status||``).toLowerCase())).length,o=i.filter(e=>(e.status||``).toLowerCase()===`completed`).length;h(`stat-active-count`)&&(h(`stat-active-count`).textContent=a),h(`stat-completed-count`)&&(h(`stat-completed-count`).textContent=o),E(e.uid)}catch(e){console.error(`Error updating dashboard stats:`,e)}}function T(e){if(!e)return`Just now`;let t=new Date-new Date(e),n=Math.floor(t/1e3),r=Math.floor(n/60),i=Math.floor(r/60),a=Math.floor(i/24);return a>0?`${a} day${a>1?`s`:``} ago`:i>0?`${i} hour${i>1?`s`:``} ago`:r>0?`${r} minute${r>1?`s`:``} ago`:`Just now`}async function E(e){let t=h(`recent-activity-list`);if(t)try{let[n,r]=await Promise.all([p.jobs.getMyJobs(e,`customer`),p.transactions.getByUser(e)]),i=[];(n||[]).forEach(e=>{i.push({type:`job`,title:`${e.serviceType||`Service`} Job ${e.status?e.status.charAt(0).toUpperCase()+e.status.slice(1):`Requested`}`,time:e.updatedAt||e.createdAt||e.timestamp,status:(e.status||`pending`).toLowerCase()})}),(r||[]).forEach(e=>{i.push({type:`transaction`,title:e.description||(e.type===`credit`?`Wallet Top-up`:`Service Payment`),time:e.createdAt,amount:e.amount,transactionType:e.type})}),i.sort((e,t)=>new Date(t.time)-new Date(e.time));let a=i.slice(0,5);if(a.length===0){t.innerHTML=`<p class="text-muted" style="text-align:center; padding:1.5rem; font-size: 0.85rem;">No recent activities found.</p>`;return}t.innerHTML=a.map(e=>{let t=e.type===`job`,n=t?e.status===`completed`?`fa-check`:`fa-tools`:e.transactionType===`credit`?`fa-wallet`:`fa-receipt`;return`
                <div class="activity-item" style="animation: slideUp 0.3s ease-out; margin-bottom: 0.75rem;">
                    <div class="activity-icon" style="background: ${t?e.status===`completed`?`rgba(0, 255, 157, 0.1)`:`rgba(0, 210, 255, 0.1)`:e.transactionType===`credit`?`rgba(0, 210, 255, 0.1)`:`rgba(255, 0, 255, 0.1)`}; color: ${t?e.status===`completed`?`var(--neon-green)`:`var(--neon-blue)`:e.transactionType===`credit`?`var(--neon-blue)`:`var(--neon-pink)`};">
                        <i class="fas ${n}"></i>
                    </div>
                    <div class="activity-details">
                        <h5 style="margin:0; font-size: 0.95rem;">${e.title}</h5>
                        <p style="margin:0.2rem 0 0; font-size: 0.75rem; color: var(--text-muted);">${T(e.time)}</p>
                    </div>
                </div>
            `}).join(``)}catch(e){console.error(`Error rendering recent activity:`,e),t.innerHTML=`<p class="text-muted" style="text-align:center; padding:1.5rem; font-size: 0.85rem;">Failed to load activity feed.</p>`}}function D(){setInterval(()=>{let e=document.getElementById(`real-time-clock`);e&&(e.textContent=new Date().toLocaleTimeString())},1e3)}function O(e){let t=document.querySelector(`[data-tab="my-bookings"]`);t&&t.click(),setTimeout(()=>{window.filterBookings&&window.filterBookings(`scheduled`)},100)}function se(e){let t=new Date,n=t.toLocaleString(`default`,{month:`long`}),r=t.getFullYear(),i=t.getDate(),a=new Date(t.getFullYear(),t.getMonth(),1),o=new Date(t.getFullYear(),t.getMonth()+1,0).getDate(),s=a.getDay(),c=`calendar-3d-styles`;if(!document.getElementById(c)){let e=document.createElement(`style`);e.id=c,e.textContent=`
            .cal-3d-container {
                perspective: 1000px;
            }
            .cal-card {
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid transparent;
                border-radius: 12px;
                height: 50px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                transform-style: preserve-3d;
                cursor: default;
                position: relative;
            }
            .cal-card.interactive:hover {
                transform: translateY(-5px) scale(1.05) rotateX(10deg);
                background: rgba(255, 255, 255, 0.08);
                box-shadow: 0 10px 20px rgba(0, 210, 255, 0.2);
                border-color: rgba(0, 210, 255, 0.3);
                z-index: 10;
            }
            .cal-card.today {
                background: rgba(0, 210, 255, 0.15);
                border: 1px solid var(--neon-blue);
                box-shadow: 0 0 15px rgba(0, 210, 255, 0.1);
            }
            .cal-card.today:hover {
                box-shadow: 0 0 25px rgba(0, 210, 255, 0.4);
            }
            .week-label {
                font-size: 0.7rem; 
                color: var(--text-muted); 
                writing-mode: vertical-lr; 
                transform: rotate(180deg);
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0.5;
            }
        `,document.head.appendChild(e)}let l=``;l+=`<div class="text-muted" style="font-size: 0.7rem;">Wk</div>`,[`Su`,`Mo`,`Tu`,`We`,`Th`,`Fr`,`Sa`].forEach(e=>{l+=`<div class="text-muted" style="font-size: 0.75rem;">${e}</div>`});let u=ce(a),d=1;l+=`<div class="week-label">W${u}</div>`;for(let e=0;e<s;e++)l+=`<div></div>`;for(let n=s;n<7;n++)l+=k(d,r,t.getMonth()+1,e,i),d++;for(u++;d<=o;){l+=`<div class="week-label">W${u}</div>`;for(let n=0;n<7;n++)d<=o?(l+=k(d,r,t.getMonth()+1,e,i),d++):l+=`<div></div>`;u++,u>52&&(u=1)}return`
        <div class="calendar-widget cal-3d-container" style="margin-top: 2rem; background: rgba(255,255,255,0.02); border-radius: 20px; padding: 1.5rem; border: 1px solid var(--glass-border);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h3 style="margin: 0; font-size: 1.2rem; display: flex; align-items: center; gap: 10px;">
                    <i class="far fa-calendar-alt" style="color: var(--neon-purple);"></i> ${n} ${r}
                </h3>
                <div style="text-align: right;">
                     <div class="text-muted" style="font-size: 0.7rem; letter-spacing: 1px;">CURRENT TIME</div>
                     <div id="real-time-clock" style="font-family: monospace; font-size: 1.1rem; color: var(--neon-blue); font-weight: 700;">--:--:--</div>
                </div>
            </div>
            <!-- Grid: 8 Columns (1 for Week + 7 for Days) -->
            <div style="display: grid; grid-template-columns: 30px repeat(7, 1fr); gap: 0.6rem; text-align: center; align-items: center;">
                ${l}
            </div>
        </div>
    `}function k(e,t,n,r,i){let a=`${t}-${n.toString().padStart(2,`0`)}-${e.toString().padStart(2,`0`)}`,o=r.some(e=>{let t=e.status?e.status.toLowerCase():``,n=[`scheduled`,`confirmed`,`active`,`pending`].includes(t),r=(e.date?e.date.split(`T`)[0]:``)===a;return n&&r}),s=e===i,c=`cal-card`;s&&(c+=` today`),(o||s)&&(c+=` interactive`);let l=o?`onclick="handleCalendarDateClick('${a}')"`:``;return`
        <div class="${c}" style="cursor: ${o?`pointer`:`default`};" ${l}>
            <span style="font-weight: 700; color: ${s?`var(--neon-blue)`:`#fff`}; font-size: 0.9rem;">${e}</span>
            ${o?`<div style="width: 6px; height: 6px; background: var(--neon-green); border-radius: 50%; margin-top: 4px; box-shadow: 0 0 8px var(--neon-green);"></div>`:``}
        </div>
    `}function ce(e){e=new Date(Date.UTC(e.getFullYear(),e.getMonth(),e.getDate())),e.setUTCDate(e.getUTCDate()+4-(e.getUTCDay()||7));var t=new Date(Date.UTC(e.getUTCFullYear(),0,1));return Math.ceil(((e-t)/864e5+1)/7)}function A(){let e=h(`overview-active-booking-container`);if(!e)return;let t=n.get(m.BOOKINGS)||[],r=t.filter(e=>{let t=(e.status||``).toLowerCase();return[`active`,`confirmed`,`scheduled`,`on the way`,`running`,`pending`,`accepted`,`assigned`].includes(t)}),i=se(t);try{let t=n.get(m.USER);t&&t.uid&&E(t.uid);let a=``;r.length>0?(a+=`<div style="display: flex; gap: 1.5rem; overflow-x: auto; padding-bottom: 1.5rem; margin-top: 1rem; scrollbar-width: thin;">`,r.forEach(e=>{let t=e.timeline||[];a+=`
                    <div class="active-booking-card" style="min-width: 320px; max-width: 350px; flex-shrink: 0; position: relative; padding: 1.25rem; border-radius: 16px; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--glass-border);">
                        <div class="booking-header" style="margin-bottom: 1rem;">
                            <div style="display:flex; justify-content:space-between; align-items:start;">
                                <div>
                                    <span class="text-muted" style="font-size: 0.65rem; letter-spacing: 1px; text-transform: uppercase;">Ongoing</span>
                                    <h3 style="font-size: 1.1rem; margin: 0.2rem 0; color: #fff;">${e.service}</h3>
                                    <p class="text-muted" style="font-size: 0.8rem; margin:0;">#${e.id}</p>
                                </div>
                                <span class="booking-badge" style="background: rgba(0, 210, 255, 0.1); border: 1px solid var(--neon-blue); padding: 0.25rem 0.6rem; font-size: 0.7rem; border-radius: 20px; color: var(--neon-blue);">${e.status}</span>
                            </div>
                        </div>
                        
                        <div style="display: flex; gap: 1rem; margin-bottom: 1rem; padding: 0.8rem; background: rgba(0,0,0,0.2); border-radius: 10px;">
                            <div class="avatar" style="width: 40px; height: 40px; font-size: 0.9rem; border-color: var(--neon-blue);">${(e.worker||`S`)[0]}</div>
                            <div>
                                <p style="font-weight: 600; font-size: 0.95rem; margin:0;">${e.worker||`Searching...`}</p>
                                <p style="font-size: 0.8rem; color: var(--text-muted); margin:0;"><i class="fas fa-star" style="color: var(--neon-orange);"></i> 4.8</p>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; font-size: 0.85rem;">
                            <div>
                                <p class="text-muted" style="margin:0; font-size:0.7rem;">DATE</p>
                                <p style="margin:0; font-weight:600;">${e.date}</p>
                            </div>
                            <div>
                                <p class="text-muted" style="margin:0; font-size:0.7rem;">TIME</p>
                                <p style="margin:0; font-weight:600;">${e.time}</p>
                            </div>
                        </div>

                        <div class="booking-timeline" style="margin-bottom: 1.2rem; display:flex; justify-content: space-between; position:relative;">
                            ${t.slice(0,3).map((e,t)=>`
                                <div style="display:flex; flex-direction:column; align-items:center; z-index:1; width:33%;">
                                    <div style="width: 20px; height: 20px; border-radius: 50%; background: ${e.status===`completed`?`var(--neon-green)`:e.status===`active`?`var(--neon-blue)`:`var(--bg-dark-600)`}; display:flex; align-items:center; justify-content:center; font-size:0.6rem; color:#000;">
                                        ${e.status===`completed`?`<i class="fas fa-check"></i>`:``}
                                    </div>
                                    <span style="font-size: 0.6rem; margin-top: 4px; color: ${e.status===`active`?`var(--text-primary)`:`var(--text-muted)`}; text-align:center;">${e.label}</span>
                                </div>
                            `).join(``)}
                             <div style="position:absolute; top:10px; left:16%; right:16%; height:2px; background:var(--bg-dark-600); z-index:0;"></div>
                        </div>
                        
                        <div style="display: flex; gap: 0.5rem; border-top: 1px solid var(--glass-border); padding-top: 1rem;">
                            <button class="btn btn-primary btn-sm" style="flex:1; background: var(--neon-green); color: #000; font-size:0.8rem; padding:0.5rem;" title="Call Professional" onclick="window.open('tel:${e.workerPhone||``}')"><i class="fas fa-phone-alt"></i></button>
                            <button class="btn btn-secondary btn-sm" style="flex:1; font-size:0.8rem; padding:0.5rem;" title="Chat with Professional" onclick="window.location.href='/chat/chat?bookingId=${e.id}&receiverName=${encodeURIComponent(e.worker||e.workerName||`Worker`)}&receiverId=${e.workerId||``}'"><i class="fas fa-comment-dots"></i></button>
                            <button class="btn btn-secondary btn-sm" style="flex:1; font-size:0.8rem; padding:0.5rem; color: var(--neon-blue); border-color: var(--neon-blue);" title="Track Worker" onclick="window.openTracking('${e.id}')"><i class="fas fa-map-marker-alt"></i></button>
                            <button class="btn btn-ghost btn-sm" style="flex:1; color: var(--neon-pink); font-size:0.8rem; padding:0.5rem; border: 1px solid var(--neon-pink);" title="Cancel Booking" onclick="window.cancelBooking('${e.id}')"><i class="fas fa-times"></i></button>
                        </div>
                    </div>
                `}),a+=`</div>`):a=`
                <div class="active-booking-card" style="text-align: center; padding: 2rem; background:rgba(255,255,255,0.02); border-radius:12px;">
                    <p class="text-muted">No active bookings found.</p>
                    <button class="btn btn-primary" style="margin-top: 1rem;" onclick="document.querySelector('[data-tab=book-service]').click()">Book a Service Now</button>
                </div>
            `,e.innerHTML=i+a}catch(t){console.error(`Error rendering overview:`,t),e.innerHTML=`<p class="text-muted">Error loading overview.</p>`}}async function j(e=`all`){let t=h(`bookings-grid`);if(t){t.innerHTML=`<div style="text-align:center; padding:2rem;"><div class="spinner"></div><p>Loading bookings...</p></div>`;try{let r=n.get(m.USER);if(!r||!r.uid){t.innerHTML=`<p>Please log in to view bookings.</p>`;return}let i=[];try{let e=await p.jobs.getMyJobs(r.uid,`customer`);console.log(`Fetched bookings from API:`,e),e&&e.length>0&&(i=e.map(e=>({id:e.id,service:e.serviceType||`General`,worker:e.workerName||(e.workerId===`auto-assign`?`Assigning...`:`Worker assigned`),workerId:e.workerId,workerPhone:e.workerPhone||``,date:e.date||e.scheduledTime?.split(`T`)[0]||`TBD`,time:e.time||`09:00 AM`,status:e.status?e.status.charAt(0).toUpperCase()+e.status.slice(1):`Pending`,price:e.price||450,address:e.address})),n.set(m.BOOKINGS,i))}catch(e){console.error(`Failed to fetch bookings from API:`,e)}let a=i;e===`active`?a=i.filter(e=>{let t=(e.status||``).toLowerCase();return[`active`,`running`,`on the way`,`pending`,`assigned`].includes(t)}):e===`completed`?a=i.filter(e=>{let t=(e.status||``).toLowerCase();return[`completed`,`cancelled`].includes(t)}):e===`scheduled`&&(a=i.filter(e=>{let t=(e.status||``).toLowerCase();return[`confirmed`,`scheduled`,`accepted`].includes(t)}));let o=e=>(e=e.toLowerCase(),e.includes(`clean`)?{icon:`fa-broom`,color:`#00d2ff`}:e.includes(`plumb`)?{icon:`fa-faucet`,color:`#00ff9d`}:e.includes(`electric`)||e.includes(`ac`)||e.includes(`appliance`)?{icon:`fa-bolt`,color:`#ff9d00`}:e.includes(`paint`)||e.includes(`design`)?{icon:`fa-paint-roller`,color:`#ff00ff`}:e.includes(`salon`)||e.includes(`massage`)||e.includes(`yoga`)?{icon:`fa-spa`,color:`#ff0055`}:e.includes(`garden`)?{icon:`fa-seedling`,color:`#00ff00`}:e.includes(`move`)?{icon:`fa-truck-moving`,color:`#ffcc00`}:{icon:`fa-tools`,color:`#ffffff`}),s=e=>{let t=e?e.toLowerCase():``;return[`active`,`running`,`on the way`,`in_progress`].includes(t)?`<span style="background: rgba(0, 210, 255, 0.15); color: #00d2ff; padding: 6px 16px; border-radius: 20px; font-size: 0.8rem; border: 1px solid #00d2ff; display:flex; align-items:center; gap:6px; font-weight: 700; letter-spacing: 0.5px;"><span style="width:8px; height:8px; background:#00d2ff; border-radius:50%; box-shadow: 0 0 5px #00d2ff; animation: pulse 2s infinite;"></span> ${t.toUpperCase()}</span>`:t===`completed`?`<span style="background: rgba(57, 255, 20, 0.15); color: #00ff9d; padding: 6px 16px; border-radius: 20px; font-size: 0.8rem; border: 1px solid #00ff9d; font-weight: 700; letter-spacing: 0.5px;">COMPLETED</span>`:t===`cancelled`||t===`declined`?`<span style="background: rgba(255, 59, 48, 0.15); color: #ff3b30; padding: 6px 16px; border-radius: 20px; font-size: 0.8rem; border: 1px solid #ff3b30; font-weight: 700; letter-spacing: 0.5px;">CANCELLED</span>`:t===`pending`?`<span style="background: rgba(255, 165, 0, 0.15); color: #ffa500; padding: 6px 16px; border-radius: 20px; font-size: 0.8rem; border: 1px solid #ffa500; font-weight: 700; letter-spacing: 0.5px;">PENDING</span>`:`<span style="background: rgba(255, 255, 255, 0.1); color: #fff; padding: 6px 16px; border-radius: 20px; font-size: 0.8rem;">${e}</span>`},c=`
           <div class="booking-tabs" style="display: flex; gap: 1.5rem; margin-bottom: 2rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 5px; overflow-x: auto;">
               <button class="filter-tab ${e===`all`?`active`:``}" onclick="window.filterBookings('all')" 
                   style="white-space:nowrap; background:none; border:none; color:${e===`all`?`#fff`:`rgba(255,255,255,0.5)`}; font-weight: 900; font-size: 1.1rem; padding-bottom: 1rem; border-bottom: 3px solid ${e===`all`?`var(--neon-blue)`:`transparent`}; cursor:pointer; text-transform: uppercase; letter-spacing: 1px; transition: all 0.3s ease;">ALL</button>
               <button class="filter-tab ${e===`active`?`active`:``}" onclick="window.filterBookings('active')" 
                   style="white-space:nowrap; background:none; border:none; color:${e===`active`?`#fff`:`rgba(255,255,255,0.5)`}; font-weight: 900; font-size: 1.1rem; padding-bottom: 1rem; border-bottom: 3px solid ${e===`active`?`var(--neon-blue)`:`transparent`}; cursor:pointer; text-transform: uppercase; letter-spacing: 1px; transition: all 0.3s ease;">IN PROGRESS</button>
               <button class="filter-tab ${e===`completed`?`active`:``}" onclick="window.filterBookings('completed')" 
                   style="white-space:nowrap; background:none; border:none; color:${e===`completed`?`#fff`:`rgba(255,255,255,0.5)`}; font-weight: 900; font-size: 1.1rem; padding-bottom: 1rem; border-bottom: 3px solid ${e===`completed`?`var(--neon-blue)`:`transparent`}; cursor:pointer; text-transform: uppercase; letter-spacing: 1px; transition: all 0.3s ease;">COMPLETED</button>
               <button class="filter-tab ${e===`scheduled`?`active`:``}" onclick="window.filterBookings('scheduled')" 
                   style="white-space:nowrap; background:none; border:none; color:${e===`scheduled`?`#fff`:`rgba(255,255,255,0.5)`}; font-weight: 900; font-size: 1.1rem; padding-bottom: 1rem; border-bottom: 3px solid ${e===`scheduled`?`var(--neon-blue)`:`transparent`}; cursor:pointer; text-transform: uppercase; letter-spacing: 1px; transition: all 0.3s ease;">SCHEDULED</button>
           </div>
       `,l=[`active`,`assigned`,`in_progress`,`scheduled`,`accepted`,`running`,`on the way`];window.activeBookingIds=(i||[]).filter(e=>l.includes((e.status||``).toLowerCase())).map(e=>e.id),console.log(`Broadcasting active booking IDs for tracking:`,window.activeBookingIds),t.innerHTML=`
           ${c}
           <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
               ${a.length>0?a.map(e=>{let t=o(e.service||e.serviceType||`tools`),n=[`active`,`running`,`on the way`,`in_progress`].includes(e.status?e.status.toLowerCase():``),r=e.status===`cancelled`||e.status===`cancelled`,i=(e.service||e.serviceType||`Service`).toUpperCase(),a=e.worker||e.workerName||`Assigning soon...`,c=e.date||e.scheduledTime?.split(`T`)[0]||`TBD`,l=e.time||`TBD`,u=e.price||350,d=r?`onclick="alert('Cannot chat on cancelled bookings.')"`:`onclick="window.location.href='/chat/chat?bookingId=${e.id}&receiverName=${encodeURIComponent(a)}&receiverId=${e.workerId||``}'"`,f=r?`disabled style="opacity:0.5; cursor:not-allowed;"`:`onclick="window.open('tel:${e.workerPhone||``}')"`,p=n?`background: var(--neon-blue); color: #fff; border:none; box-shadow: 0 0 10px rgba(0, 210, 255, 0.4); cursor: pointer;`:`background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.3); border: 1px solid rgba(255,255,255,0.1); cursor: not-allowed;`,m=n?`onclick="window.openTracking('${e.id}')"`:`disabled`;return`
           <div class="booking-card" style="background: linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%); padding: 0; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; transition: transform 0.3s ease; position: relative; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                <div style="height: 60px; background: linear-gradient(to right, ${t.color}33, transparent); border-left: 4px solid ${t.color}; display: flex; align-items: center; padding: 0 1.5rem;">
                   <div style="width: 36px; height: 36px; background: ${t.color}22; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: ${t.color}; margin-right: 1rem; border: 1px solid ${t.color}44;">
                       <i class="fas ${t.icon}"></i>
                   </div>
                   <span style="font-weight: 700; font-size: 1.1rem; color: #fff; letter-spacing: 0.5px;">${i}</span>
                </div>
   
                <div style="padding: 1.5rem;">
                   <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem;">
                       <div>
                            <p class="text-muted" style="font-size: 0.7rem; margin-bottom: 0.25rem; letter-spacing: 1px;">PROFESSIONAL</p>
                            <p style="font-weight: 600; font-size: 1.05rem;">${a}</p>
                       </div>
                       ${s(e.status)}
                   </div>
   
                   <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                       <div>
                            <p class="text-muted" style="font-size: 0.7rem; margin-bottom: 4px; letter-spacing: 0.5px;">DATE</p>
                            <p style="font-size: 0.95rem; font-weight: 600;">${c}</p>
                       </div>
                       <div>
                            <p class="text-muted" style="font-size: 0.7rem; margin-bottom: 4px; letter-spacing: 0.5px;">TIME</p>
                            <p style="font-size: 0.95rem; font-weight: 600;">${l}</p>
                       </div>
                   </div>
   
                   <div style="display: flex; justify-content: space-between; align-items: center;">
                       <span style="font-weight: 800; font-size: 1.2rem; color: #fff;">₹${u}</span>
                   </div>
                   
                   <div style="display: flex; gap: 0.8rem; margin-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1rem;">
                       <button class="btn btn-sm" ${f} style="flex:1; border: 1px solid rgba(255,255,255,0.2); background: transparent; color: #fff; border-radius: 8px; padding: 0.6rem;">
                           <i class="fas fa-phone-alt" style="color:var(--neon-green)"></i> Call
                       </button>
                       <button class="btn btn-sm" ${d} style="flex:1; border: 1px solid rgba(255,255,255,0.2); background: transparent; color: #fff; border-radius: 8px; padding: 0.6rem;">
                           <i class="fas fa-comment-dots" style="color:var(--neon-blue)"></i> Chat
                       </button>
                       <button class="btn btn-sm" ${m} style="flex:1; ${p} border-radius: 8px; padding: 0.6rem;">
                           <i class="fas fa-map-marker-alt"></i> Track
                       </button>
                   </div>
   
                </div>
           </div>`}).join(``):`
           <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: var(--text-muted);">
               <i class="far fa-calendar-times" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
               <p>No ${e===`all`?``:e} bookings available.</p>
           </div>
       `}
           </div>
       `}catch(e){console.error(`Error fetching bookings:`,e),t.innerHTML=`<p class="text-error">Failed to load bookings.</p>`}}}window.filterBookings=function(e){j(e)},window.openTracking=function(e){window.location.href=`/tracking/track?bookingId=${e}&role=customer`};async function M(){let e=h(`wallet-container`);if(!e)return;let t=n.get(m.USER)||{},r=0;try{let e=await p.payments.getBalance(t.uid);e.success&&(r=e.balance),await p.transactions.getByUser(t.uid)}catch(e){console.error(`Wallet data fetch failed:`,e)}e.innerHTML=`
        <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 2rem;">
            <!-- Balance Card -->
            <div class="stat-card" style="background: linear-gradient(135deg, var(--bg-dark-600), var(--bg-dark-800)); border-color: var(--neon-blue); position: relative; overflow: hidden;">
                <p class="text-muted" style="text-transform: uppercase; font-size: 0.8rem; letter-spacing: 1px;">Available Balance</p>
                <h1 style="font-size: 3rem; margin: 1rem 0;">₹${r.toFixed(2)}</h1>
                <p style="color: var(--neon-green); font-size: 0.9rem; margin-bottom: 1.5rem;"><i class="fas fa-gift"></i> ${t.reward_points||0} Reward Points Available</p>
                <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                    <a href="/wallet/add-money" class="btn btn-primary btn-sm" style="text-decoration:none;">Add Money</a>
                    <a href="/wallet/add-money-demo" class="btn btn-secondary btn-sm" style="text-decoration:none;">Demo Top-up</a>
                    <button class="btn btn-ghost btn-sm" onclick="showToast('Withdraw feature coming soon!')">Withdraw</button>
                </div>
            </div>

            <!-- Saved Cards -->
            <div class="stat-card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3>Your Cards</h3>
                    <button class="btn btn-ghost btn-sm" style="color: var(--neon-blue);">+ Add New</button>
                </div>
                <div style="background: linear-gradient(135deg, #1e264a, #0a0b14); border-radius: 20px; padding: 2rem; color: #fff; position: relative; box-shadow: 0 15px 35px rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); overflow: hidden;">
                    <!-- Card Glow Effect -->
                    <div style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(0,210,255,0.1) 0%, transparent 70%); pointer-events: none;"></div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem;">
                        <div style="display: flex; flex-direction: column;">
                            <span style="font-size: 0.6rem; letter-spacing: 2px; color: rgba(255,255,255,0.5);">BlueBridge PRIVILEGE</span>
                            <div style="width: 45px; height: 35px; background: linear-gradient(135deg, #ffd700, #b8860b); border-radius: 6px; margin-top: 10px; position: relative;">
                                <div style="position: absolute; top: 10%; left: 10%; width: 80%; height: 2px; background: rgba(0,0,0,0.1);"></div>
                                <div style="position: absolute; top: 30%; left: 10%; width: 80%; height: 2px; background: rgba(0,0,0,0.1);"></div>
                                <div style="position: absolute; top: 50%; left: 10%; width: 80%; height: 2px; background: rgba(0,0,0,0.1);"></div>
                            </div>
                        </div>
                        <i class="fab fa-cc-visa" style="font-size: 2.5rem; opacity: 0.9;"></i>
                    </div>
                    
                    <p style="font-size: 1.5rem; font-family: 'Courier New', monospace; letter-spacing: 4px; text-shadow: 0 2px 4px rgba(0,0,0,0.5); margin-bottom: 1.5rem;">•••• •••• •••• 4242</p>
                    
                    <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                        <div>
                            <p style="font-size: 0.6rem; color: rgba(255,255,255,0.5); letter-spacing: 1px;">CARD HOLDER</p>
                            <p style="font-weight: 600; font-size: 0.9rem; text-transform: uppercase;">${t.name||`USER`}</p>
                        </div>
                        <div style="text-align: right;">
                            <p style="font-size: 0.6rem; color: rgba(255,255,255,0.5); letter-spacing: 1px;">EXPIRES</p>
                            <p style="font-weight: 600; font-size: 0.9rem;">12/25</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="stat-card" style="margin-top: 2rem;">
            <h3>Recent Transactions</h3>
            <div style="margin-top: 1rem;">
                <div style="display: flex; justify-content: space-between; padding: 1rem 0; border-bottom: 1px solid var(--glass-border);">
                    <div>
                        <p style="font-weight: 600;">Plumbing Service - BK-1102</p>
                        <p class="text-muted" style="font-size: 0.75rem;">Nov 15, 2023 • Paid via Wallet</p>
                    </div>
                    <p style="color: var(--neon-pink); font-weight: 800;">-₹350.00</p>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 1rem 0; border-bottom: 1px solid var(--glass-border);">
                    <div>
                        <p style="font-weight: 600;">Wallet Top-up</p>
                        <p class="text-muted" style="font-size: 0.75rem;">Nov 10, 2023 • Added via UPI</p>
                    </div>
                    <p style="color: var(--neon-green); font-weight: 800;">+₹1,500.00</p>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 1rem 0;">
                    <div>
                        <p style="font-weight: 600;">Mechanic Service - BK-1050</p>
                        <p class="text-muted" style="font-size: 0.75rem;">Oct 28, 2023 • Paid via Wallet</p>
                    </div>
                    <p style="color: var(--neon-pink); font-weight: 800;">-₹600.00</p>
                </div>
            </div>
        </div>
    `}window.removeProfilePic=function(){if(confirm(`Remove profile picture?`)){let e=n.get(m.USER)||{};delete e.profilePic,n.set(m.USER,e);let r=document.getElementById(`user-avatar-img`),i=document.getElementById(`user-avatar-initials`);r&&i&&(r.style.display=`none`,i.style.display=`flex`),N(),t(`Profile picture removed.`)}};async function N(){let t=h(`profile-layout`);if(!t)return;let r=n.get(m.USER)||{};if(r.uid)try{let e=await p.auth.getProfile(r.uid);if(e){if(r={...r,...e},e.photoURL&&(r.profilePic=e.photoURL),e.profile_pic&&(r.profilePic=e.profile_pic),typeof e.address==`string`&&(!r.address||typeof r.address!=`object`)&&(r.address={house:e.address,landmark:``,city:e.location||``,pincode:e.pincode||``}),e.createdAt||e.metadata?.creationTime){let t=new Date(e.createdAt||e.metadata?.creationTime);r.joinedDate=t.toLocaleDateString(`en-US`,{month:`short`,year:`numeric`})}n.set(m.USER,r),x(r)}}catch(e){console.warn(`Background profile fetch failed, using cached data:`,e)}let i=r.profilePic||r.profile_pic||``;t.innerHTML=`
        <div class="stat-card" style="max-width: 900px; margin: 0 auto;">
            <div style="display: flex; align-items: center; gap: 2rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 2rem; margin-bottom: 2rem; flex-wrap: wrap;">
                <!-- Avatar Section -->
                <div style="position: relative; width: 100px; height: 100px; cursor: pointer; flex-shrink: 0;" onclick="document.getElementById('profile-upload-main').click()">
                    ${i?`<img src="${i}" onerror="this.src='../../assets/images/default-avatar.png'" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 4px solid var(--neon-blue);">`:`<div style="width: 100%; height: 100%; border-radius: 50%; background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple)); display: flex; align-items: center; justify-content: center; font-size: 2.5rem; color: white;">${r.name?r.name[0]:`U`}</div>`}
                    <div style="position: absolute; bottom: 0; right: 0; background: var(--neon-green); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #1a1a1a; z-index: 10;">
                        <i class="fas fa-camera" style="font-size: 12px; color: #000;"></i>
                    </div>
                </div>
                <input type="file" id="profile-upload-main" hidden accept="image/*">

                <!-- Name Section -->
                <div style="flex: 1;">
                    <h2 style="margin: 0; font-size: 1.8rem;">${r.name||`User Name`}</h2>
                    <p class="text-muted" style="margin: 0.25rem 0 0;">Customer Account • ${r.reward_points||0} Reward Points</p>
                    ${r.profilePic?`<button onclick="removeProfilePic()" class="btn btn-sm btn-ghost" style="color: var(--neon-pink); margin-top: 0.5rem; padding: 0; font-size: 0.8rem;"><i class="fas fa-trash-alt"></i> Remove Photo</button>`:``}
                </div>
            </div>

            <div style="margin-bottom: 2rem;">
                <label class="text-muted" style="font-size: 0.8rem; display: block; margin-bottom: 0.5rem;">BIO / ABOUT YOU</label>
                <textarea id="edit-bio" disabled style="width: 100%; min-height: 80px; background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); border-radius: 8px; color: #fff; padding: 10px; font-size: 0.95rem; resize: vertical; outline: none;">${r.bio||`Tell us a bit about yourself...`}</textarea>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem;">
                <div>
                    <label class="text-muted" style="font-size: 0.8rem;">FULL NAME</label>
                    <input type="text" id="edit-name" value="${r.name||``}" disabled 
                        style="width:100%; background:transparent; border:none; border-bottom:1px solid var(--glass-border); color:#fff; padding:5px 0; font-size:1.1rem;">
                </div>
                <div>
                    <label class="text-muted" style="font-size: 0.8rem;">EMAIL ADDRESS</label>
                    <input type="email" id="edit-email" value="${r.email||``}" disabled 
                            style="width:100%; background:transparent; border:none; border-bottom:1px solid var(--glass-border); color:#fff; padding:5px 0; font-size:1.1rem;">
                </div>
                <div>
                    <label class="text-muted" style="font-size: 0.8rem;">PHONE NUMBER</label>
                    <input type="tel" id="edit-phone" value="${r.phone||``}" disabled 
                            style="width:100%; background:transparent; border:none; border-bottom:1px solid var(--glass-border); color:#fff; padding:5px 0; font-size:1.1rem;">
                </div>
                <div>
                    <label class="text-muted" style="font-size: 0.8rem;">MEMBER SINCE</label>
                    <input type="text" id="edit-joined" value="${r.createdAt?e(r.createdAt):`Member`}" disabled 
                            style="width:100%; background:transparent; border:none; border-bottom:1px solid var(--glass-border); color:#fff; padding:5px 0; font-size:1.1rem;">
                </div>
            </div>
            
            <h3 style="margin-top: 2rem; margin-bottom: 1.5rem;">Address Info</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem;">
                <div>
                    <label class="text-muted" style="font-size: 0.8rem;">ADDRESS / FLAT NO.</label>
                    <input type="text" id="edit-house" value="${r.address?.house||r.address||``}" disabled
                            style="width:100%; background:transparent; border:none; border-bottom:1px solid var(--glass-border); color:#fff; padding:5px 0; font-size:1.1rem;">
                </div>
                <div>
                    <label class="text-muted" style="font-size: 0.8rem;">LANDMARK</label>
                    <input type="text" id="edit-landmark" value="${r.address?.landmark||``}" disabled 
                            style="width:100%; background:transparent; border:none; border-bottom:1px solid var(--glass-border); color:#fff; padding:5px 0; font-size:1.1rem;">
                </div>
                <div>
                    <label class="text-muted" style="font-size: 0.8rem;">CITY / STATE</label>
                    <input type="text" id="edit-city" value="${r.address?.city||r.location||``}" disabled
                            style="width:100%; background:transparent; border:none; border-bottom:1px solid var(--glass-border); color:#fff; padding:5px 0; font-size:1.1rem;">
                </div>
                <div>
                    <label class="text-muted" style="font-size: 0.8rem;">PINCODE</label>
                    <input type="text" id="edit-pincode" value="${r.address?.pincode||r.pincode||``}" disabled
                            style="width:100%; background:transparent; border:none; border-bottom:1px solid var(--glass-border); color:#fff; padding:5px 0; font-size:1.1rem;">
                </div>
            </div>
            
            <div style="margin-top: 2.5rem; text-align: right;">
                <button id="edit-profile-btn" class="btn btn-primary" style="padding: 0.75rem 2rem;">Edit Account Info</button>
            </div>
        </div>
    `,h(`edit-profile-btn`).addEventListener(`click`,_e)}function P(){let e=h(`support-grid`);e&&(e.innerHTML=`
        <div class="stats-grid">
            <div class="stat-card" style="text-align: center; cursor: pointer;">
                <i class="fas fa-phone-alt" style="font-size: 2rem; color: var(--neon-blue); margin-bottom: 1rem;"></i>
                <h4>Call Support</h4>
                <p class="text-muted">24/7 Helpline available</p>
            </div>
            <div class="stat-card" style="text-align: center; cursor: pointer;">
                <i class="fas fa-comment-dots" style="font-size: 2rem; color: var(--neon-purple); margin-bottom: 1rem;"></i>
                <h4>Chat with Us</h4>
                <p class="text-muted">Wait time: ~2 mins</p>
            </div>
            <div class="stat-card" style="text-align: center; cursor: pointer;">
                <i class="fas fa-envelope" style="font-size: 2rem; color: var(--neon-orange); margin-bottom: 1rem;"></i>
                <h4>Email Support</h4>
                <p class="text-muted">Response in 24 hours</p>
            </div>
        </div>
        
        <div class="stat-card" style="margin-top: 2rem;">
            <h3>Frequently Asked Questions</h3>
            <div style="margin-top: 1rem;">
                <details style="padding: 1rem 0; border-bottom: 1px solid var(--glass-border);">
                    <summary style="font-weight: 600; cursor: pointer;">How do I cancel a booking?</summary>
                    <p class="text-muted" style="margin-top: 0.5rem; font-size: 0.9rem;">You can cancel a booking from the 'My Bookings' tab or direct tracks on the overview page before the worker starts the job.</p>
                </details>
                <details style="padding: 1rem 0; border-bottom: 1px solid var(--glass-border);">
                    <summary style="font-weight: 600; cursor: pointer;">Is my payment secure?</summary>
                    <p class="text-muted" style="margin-top: 0.5rem; font-size: 0.9rem;">Yes, BlueBridge uses industry-standard encryption for all transactions and supports secure wallet payments.</p>
                </details>
            </div>
        </div>
    `)}var F=null,I=null;function le(){h(`chat-attach-btn`)?.addEventListener(`click`,()=>h(`chat-file-input`).click()),h(`chat-file-input`)?.addEventListener(`change`,ue),h(`chat-mic-btn`)?.addEventListener(`click`,pe)}function ue(e){let t=e.target.files[0];if(!t)return;if(t.size>5*1024*1024){alert(`File size too large. Max 5MB.`);return}let n=new FileReader;n.onload=e=>{F={data:e.target.result.split(`,`)[1],mime:t.type},de(t,e.target.result)},n.readAsDataURL(t)}function de(e,t){let n=h(`chat-file-preview`);n.style.display=`block`;let r=``;r=e.type.startsWith(`image/`)?`<img src="${t}" alt="preview">`:`<div style="display:flex;align-items:center;gap:0.5rem;color:#fff;"><i class="fas fa-file-pdf"></i> <span>${e.name}</span></div>`,n.innerHTML=`
        <div class="preview-item">
            ${r}
            <button class="preview-remove" onclick="removeAttachment()">×</button>
        </div>
    `}function fe(){F=null,h(`chat-file-input`).value=``,h(`chat-file-preview`).style.display=`none`,h(`chat-file-preview`).innerHTML=``}function pe(){if(!(`webkitSpeechRecognition`in window)){alert(`Voice input is not supported in this browser.`);return}let e=h(`chat-mic-btn`);if(I&&e.classList.contains(`mic-active`)){I.stop();return}I=new webkitSpeechRecognition,I.continuous=!1,I.lang=`en-US`,I.onstart=()=>{e.classList.add(`mic-active`)},I.onend=()=>{e.classList.remove(`mic-active`)},I.onresult=e=>{let t=e.results[0][0].transcript,n=h(`ai-popup-input`);n.value=(n.value+` `+t).trim(),n.focus()},I.start()}function R(){let e=h(`ai-chat-popup`);e&&(e.classList.toggle(`active`),e.classList.contains(`active`)&&(setTimeout(()=>h(`ai-popup-input`)?.focus(),300),h(`chat-file-input`).hasAttribute(`listening`)||(le(),h(`chat-file-input`).setAttribute(`listening`,`true`))))}var z=[];async function B(){try{console.log(`handleAIMessage triggered`);let e=h(`ai-popup-input`);if(!e){alert(`Error: Chat input element not found!`);return}let t=e.value.trim();if(!t&&!F)return;let n=t,r=null;if(F)if(r=F,F.mime.startsWith(`image/`)){let e=`data:${F.mime};base64,${F.data}`;n+=`<br><img src="${e}" class="chat-uploaded-image" alt="Uploaded Image">`}else n+=`
                    <div class="chat-file-card">
                        <i class="fas fa-file-alt"></i>
                        <span>Attached File</span>
                    </div>`;if(Q(`user`,n),e.value=``,r&&Q(`ai`,`I received your file. Analyzing...`),fe(),t){let e=Se();try{let n={message:t,previousHistory:z,workerContext:{type:`platform_assistant`}},r=await p.chat.send(n);$(e);let i=r.reply;Q(`ai`,i),z.push({role:`user`,parts:[{text:t}]},{role:`model`,parts:[{text:i}]})}catch(t){console.error(`AI Chat Error:`,t),$(e),Q(`ai`,`⚠️ Error: ${t.message||`Failed to connect to assistant`}.`)}}}catch(e){alert(`Critical Chat Error: `+e.message),console.error(e)}}function me(e,t=null){console.log(`openBookingPage called with:`,{serviceType:e,workerId:t}),n.set(`BlueBridge_selected_service`,e),console.log(`Saved service to storage:`,e),t?(n.set(`BlueBridge_selected_worker_id`,t),console.log(`Saved worker ID to storage:`,t)):n.remove(`BlueBridge_selected_worker_id`),console.log(`Redirecting to booking page...`),window.location.href=`/booking`}window.openBookingPage=me;async function he(e){if(confirm(`Are you sure you want to cancel this booking?`))try{await c(r(l,`jobs`,e),{status:`cancelled`}),t(`Booking cancelled successfully.`)}catch(e){console.error(`Error cancelling booking:`,e),t(`Failed to cancel booking.`)}}window.cancelBooking=he;function ge(e){e&&(window.location.href=`/tracking/track?bookingId=${e}&role=customer`)}window.openTracking=ge;async function _e(){let e=h(`edit-profile-btn`),r=[`edit-name`,`edit-email`,`edit-phone`,`edit-joined`,`edit-house`,`edit-landmark`,`edit-city`,`edit-pincode`,`edit-bio`];if(e.textContent.includes(`Edit`))r.forEach(e=>{let t=h(e);t&&(t.disabled=!1,t.style.borderBottom=`1px solid var(--neon-blue)`)}),e.textContent=`Save Changes`,e.style.backgroundColor=`var(--neon-green)`,e.style.color=`#000`;else{let e=h(`edit-profile-btn`);e.textContent,e.textContent=`Saving...`,e.disabled=!0;let r=n.get(m.USER)||{},i={name:h(`edit-name`).value,phone:h(`edit-phone`).value,address:{house:h(`edit-house`).value,landmark:h(`edit-landmark`).value,city:h(`edit-city`).value,pincode:h(`edit-pincode`).value},bio:h(`edit-bio`).value};try{let a={...r};if(r.uid){let e=await p.auth.updateProfile(r.uid,i);a=e&&e.user?{...r,...e.user}:{...r,...i}}else a={...r,...i};n.set(m.USER,a);let o=h(`welcome-name`);o&&(o.textContent=a.name.split(` `)[0]);let s=h(`user-display-name`);s&&(s.textContent=a.name),await N(),[`edit-name`,`edit-email`,`edit-phone`,`edit-joined`,`edit-house`,`edit-landmark`,`edit-city`,`edit-pincode`,`edit-bio`].forEach(e=>{let t=h(e);t&&(t.disabled=!0,t.style.borderBottom=`none`)}),e.textContent=`Edit Profile`,e.style.backgroundColor=`rgba(255, 255, 255, 0.1)`,e.style.color=`#fff`,e.disabled=!1,t(`Profile updated successfully!`)}catch(n){console.error(`Profile Update Failed:`,n),t(`Failed to save profile changes. Please try again.`,`error`),e.textContent=`Save Changes`,e.disabled=!1}}}document.addEventListener(`DOMContentLoaded`,()=>{document.getElementById(`ai-chat-popup`)&&v()}),window.activeBookingIds=[];var V=null,H=[],U=null,W=null,G=null,K={lat:19.076,lng:72.8777},q=null;function ve(e=`all`){G&&G(),console.log(`📡 Starting Dynamic Discovery for category: ${e}`);let t=d(a(o(l,`jobs`),s(`status`,`in`,[`assigned`,`accepted`,`in_progress`,`running`,`on the way`,`active`])),async()=>{console.log(`🔄 Discovery Refresh (Job Action)`),X(e,!0)}),n=d(a(o(l,`users`),s(`role`,`==`,`worker`)),async()=>{console.log(`🔄 Discovery Refresh (Worker Profile/Online Status)`),X(e,!0)});G=()=>{t(),n()}}function J(){if(!navigator.geolocation){console.warn(`Geolocation not supported`);return}q&&navigator.geolocation.clearWatch(q),console.log(`🛰️ Starting Global Live Tracking Watch...`),q=navigator.geolocation.watchPosition(e=>{let{latitude:t,longitude:r,accuracy:i}=e.coords;if(console.log(`📍 GPS Update: ${t}, ${r} (Accuracy: ${i}m)`),K={lat:t,lng:r},U&&(U.setLatLng([t,r]),U.isPopupOpen()&&U.setPopupContent(`
                        <div style="background: #1a1a1a; color: #fff; padding: 12px; border-radius: 8px; font-family: 'Inter', sans-serif;">
                            <h4 style="margin: 0 0 8px 0; font-size: 0.95rem; color: var(--neon-green);"><i class="fas fa-satellite"></i> Live GPS Active</h4>
                            <p style="margin: 0; font-size: 0.75rem; color: #aaa;">Accuracy: ${Math.round(i)}m</p>
                        </div>
                    `)),n.set(`last_known_gps`,K),Array.isArray(window.activeBookingIds)&&window.activeBookingIds.length>0){let e=window.location.hostname===`localhost`||window.location.hostname===`127.0.0.1`?`http://localhost:5000/api`:`/api`;window.activeBookingIds.forEach(a=>{console.log(`🛰️ Broadcasting Customer Signal for Booking: ${a}`),fetch(`${e}/location/${a}`,{method:`PUT`,headers:{"Content-Type":`application/json`},body:JSON.stringify({userId:n.get(`BlueBridge_user`)?.uid||`anonymous`,userType:`customer`,latitude:t,longitude:r,accuracy:i,timestamp:new Date().toISOString()})}).catch(e=>console.warn(`Silent sync failed for booking:`,a))})}},async e=>{console.warn(`❌ Watch Error:`,e.message),e.code===e.PERMISSION_DENIED&&await ye()},{enableHighAccuracy:!0,maximumAge:0,timeout:1e4})}async function ye(){try{console.log(`🌐 Fetching network-based location (IP Fallback)...`);let e=await(await fetch(`https://ipapi.co/json/`)).json();if(e&&e.latitude&&e.longitude)return K={lat:e.latitude,lng:e.longitude},console.log(`✅ Network location found: ${e.city}, ${e.region}`,K),t(`Using network location: ${e.city}`,`info`),V&&(V.setView([K.lat,K.lng],13),U&&U.setLatLng([K.lat,K.lng])),K}catch(e){console.error(`❌ IP Fallback failed:`,e)}return K}async function Y(e=!1){return q||J(),Promise.resolve(K)}async function X(e=`all`,t=!1){let r=h(`nearby-workers-list`);if(r){t||ve(e),r.style.display=`flex`,r.style.flexDirection=`row`,r.style.overflowX=`auto`,r.style.overflowY=`visible`,r.style.gap=`1.5rem`,r.style.padding=`20px 10px 10px 10px`,r.style.scrollBehavior=`smooth`,r.style.scrollbarWidth=`none`,r.innerHTML=`<div style="color: #aaa; text-align: center; padding: 2rem; width: 100%;"><i class="fas fa-spinner fa-spin"></i> Loading professionals...</div>`;try{await Y(),console.log(`Customer location:`,K);let t={};e!==`all`&&(t.category=e),console.log(`Fetching workers with filters:`,t);let i=await p.workers.getAll(t);console.log(`API returned ${i.length} workers:`,i);let a=i;if(console.log(`📡 [MISSION RADAR] ${a.length} professionals total found.`),a.length===0){r.innerHTML=`<div style="color: #aaa; text-align: center; padding: 2rem; width: 100%;"><i class="fas fa-user-slash"></i><br><br>No professionals found in this category.</div>`,setTimeout(()=>Z([]),100);return}let o=(n.get(`BlueBridge_bookings`)||[]).filter(e=>[`Assigned`,`Active`,`In_progress`,`Running`,`Accepted`].includes(e.status));r.innerHTML=a.map(e=>{let t=e.isBusy||!1,n=e.name||`Unknown Worker`,r=n.split(` `).map(e=>e[0]).join(``).substring(0,2).toUpperCase(),i=e.profession||e.category||`General`,a=i.charAt(0).toUpperCase()+i.slice(1),s=e.rating_avg||4.5;e.stats?.total_jobs||e.total_jobs;let c=e.base_price||350,l=o.some(t=>t.workerId===e.uid),u=!!e.location||l;e.distance&&`${e.distance.toFixed(1)}`;let d=e.is_online!==!1;return`
                <div class="nearby-worker-card ${d?``:`offline`} ${l?`assigned-mission`:``} ${t?`busy-worker`:``}" onclick="window.focusOnWorker('${e.uid}')" style="min-width: 300px; max-width: 320px; flex-shrink: 0; background: ${l?`rgba(0, 210, 255, 0.12)`:`rgba(255,255,255,0.04)`}; border: 1px solid ${l?`var(--neon-blue)`:t?`rgba(255, 100, 100, 0.4)`:`var(--glass-border)`}; border-radius: 16px; padding: 1.25rem; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; gap: 1rem; align-items: flex-start; position: relative; margin-top: 15px; box-shadow: ${l?`0 0 20px rgba(0, 210, 255, 0.15)`:`none`}; opacity: ${t&&!l?`0.75`:`1`};">
                    ${l?`<div style="position: absolute; top: -12px; right: 15px; background: var(--neon-blue); color: #000; font-size: 0.7rem; font-weight: 800; padding: 3px 12px; border-radius: 20px; box-shadow: 0 0 15px var(--neon-blue); z-index: 10; letter-spacing: 0.5px;">ASSIGNED PROFESSIONAL</div>`:``}
                    ${t&&!l?`<div style="position: absolute; top: -12px; right: 15px; background: #ff4444; color: #fff; font-size: 0.7rem; font-weight: 800; padding: 3px 12px; border-radius: 20px; box-shadow: 0 0 15px #ff4444; z-index: 10; letter-spacing: 0.5px;">CURRENTLY BUSY</div>`:``}
                    <div class="card-avatar-wrapper" style="position: relative;">
                        <div class="card-avatar" style="width: 50px; height: 50px; background: ${l?`var(--neon-blue)`:`var(--bg-tertiary)`}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: ${l?`#000`:`#fff`};">${r}</div>
                        ${d?`<div class="online-indicator" style="position: absolute; bottom: 0; right: 0; width: 12px; height: 12px; background: var(--neon-green); border-radius: 50%; border: 2px solid #1a1a1a;"></div>`:``}
                    </div>
                    <div class="card-info" style="flex: 1;">
                        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <h4 class="worker-name" style="margin: 0; font-size: 1rem; color: #fff;">${n}</h4>
                            <div class="worker-price" style="color: var(--neon-green); font-weight: 700;">₹${c}<span>/hr</span></div>
                        </div>
                        <div class="worker-meta" style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.5rem;">
                            <span><i class="fas fa-briefcase"></i> ${a}</span>
                            <span style="margin: 0 4px;">•</span>
                            <span><i class="fas fa-star" style="color: var(--neon-orange);"></i> ${s.toFixed(1)}</span>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
                            <div class="tracking-status ${u?`tracking-live`:`tracking-unavailable`}" style="font-size: 0.75rem; color: ${u?`var(--neon-blue)`:`var(--text-muted)`};">
                                <i class="fas ${l?`fa-satellite-dish fa-spin`:u?`fa-map-marker-alt`:`fa-map-marker-slash`}"></i>
                                ${l?`LIVE TRACKING ACTIVE`:u?`Live Location`:`Tracking Unavailable`}
                            </div>
                        </div>
                        <div class="card-actions" style="display: flex; gap: 0.75rem; margin-top: 0.5rem;">
                            ${l?`<button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); window.location.href='/chat/chat'" style="flex: 2; padding: 0.5rem; font-size: 0.85rem; background: var(--neon-pink); border: none; color: #fff; font-weight: 700; border-radius: 8px; box-shadow: 0 0 10px rgba(255, 0, 255, 0.2);"><i class="fas fa-comment"></i> Chat Now</button>`:`<button class="btn btn-sm btn-secondary" onclick="event.stopPropagation(); window.showWorkerProfileInDashboard('${e.uid}')" style="flex: 1; padding: 0.5rem; font-size: 0.8rem; border-radius: 8px; background: rgba(255,255,255,0.05); color: #fff;"><i class="fas fa-id-badge"></i> Profile</button>`}
                            ${l?``:`<button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); ${t?`alert('This professional is currently on another job.')`:`window.openBookingPage('${e.profession||e.category||`General`}')`}" style="flex: 1; padding: 0.5rem; font-size: 0.8rem; font-weight: 700; border-radius: 8px; ${t?`background: #333; border: 1px solid #444; color: #666; cursor: not-allowed;`:`background: var(--neon-blue); color: #000; border: none;`}">
                                    <i class="fas ${t?`fa-hourglass-half`:`fa-calendar-check`}"></i> 
                                    ${t?`Busy`:`Book`}
                                </button>`}
                        </div>
                    </div>
                </div>
            `}).join(``);let s=a.map(e=>{let t=e.location?.lat&&e.location?.lng;return{id:e.uid,name:e.name,category:e.category,rating:e.rating_avg||4.5,lat:t?e.location.lat:K.lat+(Math.random()-.5)*.03,lng:t?e.location.lng:K.lng+(Math.random()-.5)*.03,price:e.base_price||350,isOnline:e.is_online!==!1,isBusy:e.isBusy,hasRealGPS:t}});setTimeout(()=>Z(s),100),xe(i.map(e=>e.uid).filter(e=>e))}catch(e){console.error(`Error loading nearby workers:`,e),r.innerHTML=`<div style="color: #ff4444; text-align: center; padding: 2rem;"><i class="fas fa-exclamation-triangle"></i><br><br>Failed to load workers. Please try again.</div>`}window.mapControlsInitialized||(h(`worker-category-filter`)?.addEventListener(`change`,e=>{X(e.target.value)}),h(`refresh-map`)?.addEventListener(`click`,async()=>{let e=h(`refresh-map`);e.innerHTML=`<i class="fas fa-sync-alt fa-spin"></i>`,await Y(!0),await X(h(`worker-category-filter`).value),e.innerHTML=`<i class="fas fa-sync-alt"></i>`}),window.mapControlsInitialized=!0)}}function be(e){return{plumber:`#00d2ff`,plumbing:`#00d2ff`,electrician:`#ff9d00`,electrical:`#ff9d00`,carpenter:`#8b4513`,painter:`#9d50bb`,painting:`#9d50bb`,cleaning:`#39ff14`,cleaner:`#39ff14`,mechanic:`#f00b47`}[e?.toLowerCase()]||`#00d2ff`}function Z(e){let t=h(`nearby-map`);if(console.log(`🗺️ initNearbyMap called with`,e.length,`workers`),console.log(`Map element exists:`,!!t),console.log(`Leaflet loaded:`,typeof L<`u`),!t){console.error(`❌ Map container #nearby-map not found!`);return}if(typeof L>`u`){console.error(`❌ Leaflet library not loaded!`);return}if(!V)try{console.log(`Creating new Leaflet map...`),V=L.map(`nearby-map`,{zoomControl:!0,scrollWheelZoom:!0}).setView([K.lat,K.lng],13),console.log(`✅ Map created, adding tile layer...`),L.tileLayer(`https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}`,{subdomains:[`mt0`,`mt1`,`mt2`,`mt3`],attribution:`&copy; Google Maps`,maxZoom:20}).addTo(V);let e=t.querySelector(`.leaflet-tile-pane`);e&&(e.style.filter=`invert(1) hue-rotate(180deg) brightness(0.75) contrast(1.1)`),console.log(`✅ Google Maps Tile layer added with Dark Skin`),L.control.scale({imperial:!1,metric:!0}).addTo(V);let n=L.Control.extend({options:{position:`topright`},onAdd:function(){let e=L.DomUtil.create(`div`,`leaflet-bar leaflet-control`);return e.innerHTML=`<a href="#" title="Fetch My Real Location" style="background: rgba(15, 23, 42, 0.95); color: var(--neon-green); width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; text-decoration: none; border: 1px solid var(--neon-green); border-radius: 8px; box-shadow: 0 0 10px rgba(57, 255, 20, 0.3);"><i class="fas fa-location-arrow"></i></a>`,e.onclick=async t=>{t.preventDefault(),e.innerHTML=`<a style="background: rgba(15, 23, 42, 0.9); color: var(--neon-blue); width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;"><i class="fas fa-spinner fa-spin"></i></a>`,await Y(!0),e.innerHTML=`<a href="#" title="Fetch My Real Location" style="background: rgba(15, 23, 42, 0.95); color: var(--neon-green); width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; text-decoration: none; border: 1px solid var(--neon-green); border-radius: 8px; box-shadow: 0 0 10px rgba(57, 255, 20, 0.3);"><i class="fas fa-location-arrow"></i></a>`},e}});V.addControl(new n),console.log(`✅ Map fully initialized`)}catch(e){console.error(`❌ Error creating map:`,e);return}H.forEach(e=>V.removeLayer(e)),H=[],U&&V.removeLayer(U),console.log(`Adding customer marker at:`,K);let i=L.divIcon({className:`customer-marker-icon`,html:`<div style="position: relative; width: 34px; height: 34px;">
            <div style="width: 20px; height: 20px; background: #00d2ff; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 20px #00d2ff; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 2; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-street-view" style="color: #000; font-size: 10px;"></i>
            </div>
            <div style="width: 34px; height: 34px; background: rgba(0, 210, 255, 0.2); border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); animation: sonar-wave 2s infinite; z-index: 1;"></div>
        </div>`,iconSize:[34,34],iconAnchor:[17,17]});U=L.marker([K.lat,K.lng],{icon:i,zIndexOffset:1e3}).addTo(V),V.setView([K.lat,K.lng],14),U.bindPopup(`
        <div style="background: #1a1a1a; color: #fff; padding: 12px; border-radius: 8px; font-family: 'Inter', sans-serif; min-width: 150px;">
            <h4 style="margin: 0 0 8px 0; font-size: 0.95rem; color: var(--neon-green);"><i class="fas fa-map-marker-alt"></i> Your Location</h4>
            <p style="margin: 0; font-size: 0.75rem; color: #aaa;">GPS: ${K.lat.toFixed(4)}, ${K.lng.toFixed(4)}</p>
        </div>
    `,{className:`dark-popup`}),console.log(`✅ Customer marker placed at real GPS:`,K),q||J(),console.log(`Adding`,e.length,`worker markers...`);let a=0;if(e.forEach(e=>{if(!e.lat||!e.lng){console.warn(`Skipping worker without location:`,e.name);return}let t=be(e.category),i=(e.name||`W`).split(` `).map(e=>e[0]).join(``).substring(0,2).toUpperCase(),o=L.divIcon({className:`worker-marker-icon`,html:`<div style="position: relative; width: 48px; height: 48px;">
                <div style="background: ${t}; width: 26px; height: 26px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 20px ${t}; display: flex; align-items: center; justify-content: center; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 2;">
                    <i class="fas fa-tools" style="color: #000; font-size: 12px;"></i>
                </div>
                <div style="width: 48px; height: 48px; background: ${t}33; border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); animation: sonar-wave 1.5s infinite; z-index: 1;"></div>
                ${e.isOnline?`<div style="position: absolute; bottom: 8px; right: 8px; width: 12px; height: 12px; background: var(--neon-green); border: 2px solid #fff; border-radius: 50%; z-index: 3;"></div>`:``}
            </div>`,iconSize:[48,48],iconAnchor:[24,24],popupAnchor:[0,-24]}),s=L.marker([e.lat,e.lng],{icon:o}).addTo(V),c=L.polyline([[K.lat,K.lng],[e.lat,e.lng]],{color:t,weight:1.5,dashArray:`8, 12`,opacity:.4,interactive:!1}).addTo(V),u=(n.get(`BlueBridge_bookings`)||[]).find(t=>t.workerId===e.uid&&[`Assigned`,`Active`,`In_progress`,`Running`,`Accepted`].includes(t.status));u&&l&&(console.log(`📡 [REAL-TIME] Subscribing to assigned professional ${e.name} (Job: ${u.id})`),d(r(l,`locations`,u.id),t=>{if(t.exists()){let n=t.data().workerLocation;n&&n.lat&&n.lng&&(s.setLatLng([n.lat,n.lng]),s.getPopup()||s.bindPopup(`<strong>${e.name} (Live)</strong><br>On the way to you!`))}})),s.bindPopup(`
            <div style="background: linear-gradient(145deg, #1a1a1a, #0a0b14); color: #fff; padding: 15px; border-radius: 12px; font-family: 'Inter', sans-serif; min-width: 200px; border: 1px solid ${t}40;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                    <div style="width: 40px; height: 40px; background: ${t}20; border: 2px solid ${t}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; color: ${t};">
                        ${i}
                    </div>
                    <div>
                        <h4 style="margin: 0; font-size: 0.95rem; color: #fff;">${e.name}</h4>
                        <p style="margin: 2px 0 0 0; font-size: 0.7rem; color: ${t}; text-transform: uppercase; font-weight: 600;">${e.category}</p>
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin: 10px 0; padding: 8px 0; border-top: 1px solid rgba(255,255,255,0.1); border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <span style="font-size: 0.75rem; color: #aaa;"><i class="fas fa-star" style="color: var(--neon-orange);"></i> ${e.rating.toFixed(1)}</span>
                    <span style="font-size: 0.85rem; font-weight: 700; color: var(--neon-green);">₹${e.price}/hr</span>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px;">
                    <button onclick="event.stopPropagation(); window.showWorkerProfileInDashboard('${e.id}')" style="background: rgba(255,255,255,0.1); border: 1px solid ${t}40; padding: 6px 10px; border-radius: 6px; cursor: pointer; color: #fff; font-weight: 600; font-size: 0.7rem; transition: all 0.2s;"><i class="fas fa-id-card"></i> Profile</button>
                    <button onclick="event.stopPropagation(); window.openBookingPage('${e.category}')" style="background: ${t}; border: none; padding: 6px 10px; border-radius: 6px; cursor: pointer; color: #000; font-weight: 700; font-size: 0.7rem; transition: all 0.2s;"><i class="fas fa-calendar-plus"></i> Book</button>
                </div>
            </div>
        `,{className:`dark-popup`,maxWidth:250}),s.workerId=e.id,H.push(s),H.push(c),a++}),console.log(`✅ Added ${a} worker markers to map`),e.length>0){let e=[...H,U],t=new L.featureGroup(e);try{let e=t.getBounds();e.isValid()?(V.fitBounds(e.pad(.2)),console.log(`✅ Map bounds fitted to show all markers`)):V.setView([K.lat,K.lng],14)}catch{V.setView([K.lat,K.lng],14)}}else V.setView([K.lat,K.lng],14),console.log(`✅ Map centered on customer (no workers)`);setTimeout(()=>{V.invalidateSize(),console.log(`✅ Map size invalidated`)},100)}window.focusOnWorker=e=>{let t=H.find(t=>t.workerId===e);t&&V&&(V.setView(t.getLatLng(),16,{animate:!0,duration:.5}),setTimeout(()=>t.openPopup(),300))};function xe(e){if(W&&=(W(),null),!e||e.length===0)return;if(!l||!d){console.warn(`Firestore not available for real-time tracking`);return}console.log(`📡 Subscribing to live updates for workers:`,e);let t=e.slice(0,10);try{W=d(a(o(l,`users`),s(`uid`,`in`,t)),e=>{console.log(`🔔 Received real-time update for ${e.size} workers`),e.docChanges().forEach(e=>{if(e.type===`modified`||e.type===`added`){let t=e.doc.data(),n=e.doc.id,r=t.location;if(r&&r.lat&&r.lng){let e=H.find(e=>e.workerId===n);e&&(console.log(`📍 Moving marker for worker ${n} to:`,r),e.setLatLng([r.lat,r.lng]))}}})},e=>{console.error(`❌ subscribeToWorkerUpdates listener error:`,e)})}catch(e){console.error(`❌ Failed to setup worker tracking query:`,e)}}function Q(e,t){let n=h(`chat-popup-body`);if(!n)return;let r=document.createElement(`div`);r.className=e===`user`?`user-message`:`ai-message`,r.innerHTML=`<p>${t.replace(/\n/g,`<br>`)}</p>`,n.appendChild(r),n.scrollTop=n.scrollHeight}function Se(){let e=h(`chat-popup-body`);if(!e)return null;let t=`typing-`+Date.now(),n=document.createElement(`div`);return n.className=`ai-message`,n.id=t,n.innerHTML=`<p><i class="fas fa-ellipsis-h fa-pulse"></i></p>`,e.appendChild(n),e.scrollTop=e.scrollHeight,t}function $(e){if(e){let t=document.getElementById(e);t&&t.remove()}}window.handleAIMessage=B,window.loadPage=function(e){let t=document.querySelector(`.nav-item[data-page="booking"], .nav-link[data-page="booking"]`);if(t){t.click();return}let n=e?`?service=${encodeURIComponent(e)}`:``;window.location.href=`/booking${n}`},window.renderOverview=A,window.renderBookingsGrid=j,window.renderWallet=M,window.renderProfile=N,window.renderSupport=P,window.renderNearbyWorkers=X,window.renderSettings=C,window.refreshCustomerDashboardData=y,window.handleCalendarDateClick=O,window.performLogout=async function(e){e&&(e.preventDefault?.(),e.stopPropagation?.(),e.stopImmediatePropagation?.()),console.log(`[LOGOUT] Immediate sign out triggered`),t(`Signing out...`,`info`);try{u&&typeof u.signOut==`function`&&await u.signOut()}catch(e){console.warn(`[LOGOUT] Firebase signOut error:`,e)}try{localStorage.clear(),sessionStorage.clear(),console.log(`[LOGOUT] Redirecting to home...`),window.location.href=`/`}catch(e){console.error(`[LOGOUT] Cleanup error, forcing redirect:`,e),window.location.href=`/`}},v(),console.log(`Customer Dashboard System Loaded - Chat Ready`);