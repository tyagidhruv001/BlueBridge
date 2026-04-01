const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/booking-script-CHM316m6.js","assets/config-Cmdxbuss.js","assets/api-BFM6M95r.js","assets/utils-B2C-mP9z.js"])))=>i.map(i=>d[i]);
import{i as e,n as t,t as n}from"./jsx-runtime-BnxRlLMJ.js";import{t as r}from"./preload-helper-DSXbuxSR.js";var i=e(t(),1),a=`﻿<!DOCTYPE html>\r
<html lang="en">\r
\r
<head>\r
    <meta charset="UTF-8">\r
    <meta name="viewport" content="width=device-width, initial-scale=1.0">\r
    <title>Book Service - BlueBridge Professionals</title>\r
    \r
    \r
    \r
    <style>\r
        :root {\r
            --glass-bg: rgba(15, 23, 42, 0.7);\r
            --glass-border: rgba(255, 255, 255, 0.1);\r
        }\r
\r
        body {\r
            background: radial-gradient(circle at top right, #070b14, #0f172a);\r
            min-height: 100vh;\r
        }\r
\r
        .booking-container {\r
            max-width: 1000px;\r
            margin: 2rem auto;\r
            padding: 0 1rem;\r
        }\r
\r
        .booking-header {\r
            text-align: center;\r
            margin-bottom: 3rem;\r
            animation: fadeInDown 0.6s ease-out;\r
        }\r
\r
        .booking-header h1 {\r
            font-size: 2.5rem;\r
            margin-bottom: 1rem;\r
        }\r
\r
        .booking-steps {\r
            display: flex;\r
            justify-content: space-between;\r
            margin-bottom: 3rem;\r
            position: relative;\r
            max-width: 600px;\r
            margin: 0 auto 3rem;\r
        }\r
\r
        .booking-steps::before {\r
            content: '';\r
            position: absolute;\r
            top: 50%;\r
            left: 0;\r
            right: 0;\r
            height: 2px;\r
            background: var(--glass-border);\r
            z-index: 1;\r
        }\r
\r
        .step-item {\r
            position: relative;\r
            z-index: 2;\r
            width: 40px;\r
            height: 40px;\r
            border-radius: 50%;\r
            background: #1e293b;\r
            border: 2px solid var(--glass-border);\r
            display: flex;\r
            align-items: center;\r
            justify-content: center;\r
            color: var(--text-tertiary);\r
            transition: all 0.3s ease;\r
        }\r
\r
        .step-item.active {\r
            background: var(--neon-blue);\r
            border-color: var(--neon-blue);\r
            color: #fff;\r
            box-shadow: 0 0 15px var(--neon-blue);\r
        }\r
\r
        .step-item.completed {\r
            background: var(--neon-green);\r
            border-color: var(--neon-green);\r
            color: #fff;\r
        }\r
\r
        .booking-card {\r
            background: var(--glass-bg);\r
            backdrop-filter: blur(12px);\r
            border: 1px solid var(--glass-border);\r
            border-radius: 24px;\r
            padding: 2.5rem;\r
            min-height: 400px;\r
            animation: scaleIn 0.5s ease-out;\r
        }\r
\r
        .step-content {\r
            display: none;\r
        }\r
\r
        .step-content.active {\r
            display: block;\r
            animation: fadeIn 0.4s ease-out;\r
        }\r
\r
        /* Form Styles */\r
        .form-grid {\r
            display: grid;\r
            grid-template-columns: 1fr 1fr;\r
            gap: 1.5rem;\r
        }\r
\r
        .full-width {\r
            grid-column: 1 / -1;\r
        }\r
\r
        .input-group {\r
            margin-bottom: 1.5rem;\r
        }\r
\r
        .input-group label {\r
            display: block;\r
            margin-bottom: 0.5rem;\r
            color: var(--text-secondary);\r
            font-size: 0.9rem;\r
        }\r
\r
        .input-group input,\r
        .input-group select,\r
        .input-group textarea {\r
            width: 100%;\r
            background: rgba(255, 255, 255, 0.05);\r
            border: 1px solid var(--glass-border);\r
            border-radius: 12px;\r
            padding: 1rem;\r
            color: #fff;\r
            transition: all 0.3s;\r
        }\r
\r
        .input-group input:focus {\r
            border-color: var(--neon-blue);\r
            background: rgba(255, 255, 255, 0.08);\r
            outline: none;\r
        }\r
\r
        /* Worker Selection Styles */\r
        .worker-list {\r
            display: grid;\r
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));\r
            gap: 1.5rem;\r
            margin-top: 1rem;\r
        }\r
\r
        .worker-selection-card {\r
            background: rgba(255, 255, 255, 0.03);\r
            border: 1px solid var(--glass-border);\r
            border-radius: 16px;\r
            padding: 1.25rem;\r
            cursor: pointer;\r
            transition: all 0.3s;\r
            display: flex;\r
            gap: 1rem;\r
            position: relative;\r
        }\r
\r
        .worker-selection-card:hover {\r
            background: rgba(255, 255, 255, 0.05);\r
            border-color: var(--neon-blue);\r
            transform: translateY(-2px);\r
        }\r
\r
        .worker-selection-card.selected {\r
            background: rgba(59, 130, 246, 0.1);\r
            border-color: var(--neon-blue);\r
            box-shadow: 0 0 15px rgba(59, 130, 246, 0.2);\r
        }\r
\r
        .card-avatar {\r
            width: 60px;\r
            height: 60px;\r
            border-radius: 12px;\r
            background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple));\r
            display: flex;\r
            align-items: center;\r
            justify-content: center;\r
            font-size: 1.5rem;\r
            font-weight: bold;\r
        }\r
\r
        .card-info {\r
            flex: 1;\r
        }\r
\r
        .worker-name {\r
            font-size: 1.1rem;\r
            font-weight: 600;\r
            margin-bottom: 0.25rem;\r
        }\r
\r
        .worker-meta {\r
            font-size: 0.85rem;\r
            color: var(--text-tertiary);\r
            display: flex;\r
            gap: 1rem;\r
            margin-bottom: 0.5rem;\r
        }\r
\r
        .worker-price {\r
            font-weight: bold;\r
            color: var(--neon-green);\r
        }\r
\r
        /* Summary Step Styles */\r
        .summary-grid {\r
            display: grid;\r
            grid-template-columns: 1fr 300px;\r
            gap: 2rem;\r
        }\r
\r
        .summary-item {\r
            background: rgba(255, 255, 255, 0.03);\r
            border-radius: 16px;\r
            padding: 1.5rem;\r
            margin-bottom: 1rem;\r
        }\r
\r
        .summary-item h3 {\r
            font-size: 1rem;\r
            color: var(--text-tertiary);\r
            margin-bottom: 0.5rem;\r
            text-transform: uppercase;\r
            letter-spacing: 1px;\r
        }\r
\r
        .summary-item p {\r
            font-size: 1.1rem;\r
            font-weight: 500;\r
        }\r
\r
        .price-breakdown {\r
            background: rgba(255, 255, 255, 0.05);\r
            border-radius: 20px;\r
            padding: 2rem;\r
            border: 1px solid var(--neon-blue);\r
        }\r
\r
        .price-row {\r
            display: flex;\r
            justify-content: space-between;\r
            margin-bottom: 1rem;\r
            color: var(--text-secondary);\r
        }\r
\r
        .price-total {\r
            border-top: 1px solid var(--glass-border);\r
            margin-top: 1rem;\r
            padding-top: 1rem;\r
            font-size: 1.5rem;\r
            font-weight: bold;\r
            color: #fff;\r
        }\r
\r
        /* Navigation Buttons */\r
        .booking-actions {\r
            display: flex;\r
            justify-content: space-between;\r
            margin-top: 2.5rem;\r
        }\r
\r
        @keyframes fadeInDown {\r
            from {\r
                opacity: 0;\r
                transform: translateY(-20px);\r
            }\r
\r
            to {\r
                opacity: 1;\r
                transform: translateY(0);\r
            }\r
        }\r
\r
        @keyframes scaleIn {\r
            from {\r
                opacity: 0;\r
                transform: scale(0.95);\r
            }\r
\r
            to {\r
                opacity: 1;\r
                transform: scale(1);\r
            }\r
        }\r
\r
        .tracking-status {\r
            font-size: 0.75rem;\r
            display: flex;\r
            align-items: center;\r
            gap: 0.4rem;\r
            padding: 0.2rem 0.5rem;\r
            border-radius: 4px;\r
            margin-top: 0.4rem;\r
        }\r
\r
        .tracking-live {\r
            background: rgba(57, 255, 20, 0.1);\r
            color: var(--neon-green);\r
            border: 1px solid rgba(57, 255, 20, 0.2);\r
        }\r
\r
        .tracking-unavailable {\r
            background: rgba(255, 255, 255, 0.05);\r
            color: var(--text-tertiary);\r
            border: 1px solid var(--glass-border)\r
        }\r
\r
        /* Modal Styles */\r
        .modal-overlay {\r
            position: fixed;\r
            top: 0;\r
            left: 0;\r
            right: 0;\r
            bottom: 0;\r
            background: rgba(0, 0, 0, 0.85);\r
            backdrop-filter: blur(8px);\r
            z-index: 1000;\r
            display: none;\r
            align-items: center;\r
            justify-content: center;\r
            padding: 1rem;\r
        }\r
\r
        .modal-overlay.active {\r
            display: flex;\r
        }\r
\r
        .worker-profile-modal {\r
            background: #0f172a;\r
            border: 1px solid var(--glass-border);\r
            border-radius: 28px;\r
            width: 100%;\r
            max-width: 600px;\r
            max-height: 90vh;\r
            overflow-y: auto;\r
            position: relative;\r
            animation: modalIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);\r
        }\r
\r
        @keyframes modalIn {\r
            from {\r
                opacity: 0;\r
                transform: translateY(30px) scale(0.95);\r
            }\r
\r
            to {\r
                opacity: 1;\r
                transform: translateY(0) scale(1);\r
            }\r
        }\r
\r
        .modal-close {\r
            position: absolute;\r
            top: 1.5rem;\r
            right: 1.5rem;\r
            background: rgba(255, 255, 255, 0.05);\r
            border: none;\r
            color: #fff;\r
            width: 36px;\r
            height: 36px;\r
            border-radius: 50%;\r
            cursor: pointer;\r
            display: flex;\r
            align-items: center;\r
            justify-content: center;\r
            transition: all 0.2s;\r
        }\r
\r
        .modal-close:hover {\r
            background: #ef4444;\r
        }\r
\r
        .modal-hero {\r
            padding: 3rem 2rem 2rem;\r
            background: linear-gradient(to bottom, rgba(59, 130, 246, 0.1), transparent);\r
            text-align: center;\r
        }\r
\r
        .modal-avatar-lg {\r
            width: 100px;\r
            height: 100px;\r
            border-radius: 24px;\r
            background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple));\r
            margin: 0 auto 1.5rem;\r
            display: flex;\r
            align-items: center;\r
            justify-content: center;\r
            font-size: 2.5rem;\r
            font-weight: 900;\r
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);\r
        }\r
\r
        .modal-name-lg {\r
            font-size: 1.8rem;\r
            font-weight: 700;\r
            margin-bottom: 0.5rem;\r
        }\r
\r
        .modal-badges {\r
            display: flex;\r
            gap: 1rem;\r
            justify-content: center;\r
            margin-bottom: 1.5rem;\r
        }\r
\r
        .modal-badge {\r
            background: rgba(255, 255, 255, 0.05);\r
            padding: 0.4rem 1rem;\r
            border-radius: 20px;\r
            font-size: 0.85rem;\r
            color: var(--text-secondary);\r
            border: 1px solid var(--glass-border);\r
        }\r
\r
        .modal-body {\r
            padding: 0 2rem 2rem;\r
        }\r
\r
        .modal-section {\r
            margin-bottom: 2rem;\r
        }\r
\r
        .modal-section h3 {\r
            font-size: 1.1rem;\r
            margin-bottom: 1rem;\r
            color: var(--neon-blue);\r
            display: flex;\r
            align-items: center;\r
            gap: 0.5rem;\r
        }\r
\r
        .skill-tags {\r
            display: flex;\r
            flex-wrap: wrap;\r
            gap: 0.75rem;\r
        }\r
\r
        .skill-tag {\r
            background: rgba(59, 130, 246, 0.1);\r
            color: var(--neon-blue);\r
            padding: 0.5rem 1rem;\r
            border-radius: 8px;\r
            font-size: 0.9rem;\r
            border: 1px solid rgba(59, 130, 246, 0.2);\r
        }\r
\r
        .bio-text {\r
            color: var(--text-secondary);\r
            line-height: 1.6;\r
        }\r
\r
        .modal-footer {\r
            padding: 2rem;\r
            border-top: 1px solid var(--glass-border);\r
            display: flex;\r
            gap: 1rem;\r
        }\r
\r
        .btn-modal {\r
            flex: 1;\r
            padding: 1.25rem;\r
            border-radius: 16px;\r
            font-weight: 700;\r
            cursor: pointer;\r
            transition: all 0.3s;\r
        }\r
\r
        .payment-option {\r
            background: rgba(255, 255, 255, 0.03);\r
            border: 1px solid var(--glass-border);\r
            border-radius: 16px;\r
            padding: 1.5rem;\r
            cursor: pointer;\r
            transition: all 0.2s;\r
            display: flex;\r
            align-items: center;\r
            gap: 1.5rem;\r
            margin-bottom: 1rem;\r
        }\r
\r
        .payment-option:hover {\r
            border-color: var(--neon-blue);\r
            background: rgba(255, 255, 255, 0.05);\r
        }\r
\r
        .payment-option.selected {\r
            border-color: var(--neon-blue);\r
            background: rgba(59, 130, 246, 0.1);\r
        }\r
\r
        .payment-icon {\r
            width: 48px;\r
            height: 48px;\r
            border-radius: 12px;\r
            background: rgba(255, 255, 255, 0.05);\r
            display: flex;\r
            align-items: center;\r
            justify-content: center;\r
            font-size: 1.25rem;\r
        }\r
    </style>\r
</head>\r
\r
<body>\r
    <div class="booking-container">\r
        <header class="booking-header">\r
            <h1 id="service-title-display">Book <span class="text-gradient">Professional</span></h1>\r
            <p class="text-secondary">Verified experts at your service</p>\r
        </header>\r
\r
        <div class="booking-steps">\r
            <div class="step-item active" id="step-1">1</div>\r
            <div class="step-item" id="step-2">2</div>\r
            <div class="step-item" id="step-3">3</div>\r
            <div class="step-item" id="step-4">4</div>\r
        </div>\r
\r
        <div class="booking-card">\r
            <!-- Step 1: Schedule & Location -->\r
            <div class="step-content active" id="content-1">\r
                <h2 class="mb-4">Schedule Your Service</h2>\r
                <div class="form-grid">\r
                    <div class="input-group">\r
                        <label>Preferred Date</label>\r
                        <input type="date" id="booking-date">\r
                    </div>\r
                    <div class="input-group">\r
                        <label>Preferred Time</label>\r
                        <select id="booking-time">\r
                            <option value="09:00">09:00 AM</option>\r
                            <option value="10:00">10:00 AM</option>\r
                            <option value="11:00">11:00 AM</option>\r
                            <option value="12:00">12:00 PM</option>\r
                            <option value="14:00">02:00 PM</option>\r
                            <option value="15:00">03:00 PM</option>\r
                            <option value="16:00">04:00 PM</option>\r
                        </select>\r
                    </div>\r
                    <div class="input-group full-width">\r
                        <label>Service Category</label>\r
                        <select id="booking-category">\r
                            <option value="Mechanic">Mechanic</option>\r
                            <option value="Plumber">Plumber</option>\r
                        </select>\r
                    </div>\r
                    <div class="input-group full-width">\r
                        <label>Service Address</label>\r
                        <textarea id="booking-address" rows="3"\r
                            placeholder="Enter full address where service is needed..."></textarea>\r
                    </div>\r
                </div>\r
            </div>\r
\r
            <!-- Step 2: Choose Professional -->\r
            <div class="step-content" id="content-2">\r
                <div class="d-flex justify-content-between align-items-center mb-4">\r
                    <h2>Select a Professional</h2>\r
                </div>\r
                <div class="worker-list" id="worker-list">\r
                    <!-- Workers will be loaded here -->\r
                </div>\r
            </div>\r
\r
            <!-- Step 3: Payment Method -->\r
            <div class="step-content" id="content-3">\r
                <h2 class="mb-4">How would you like to pay?</h2>\r
                <div class="payment-options">\r
                    <div class="payment-option selected" onclick="selectPayment('wallet')">\r
                        <div class="payment-icon"><i class="fas fa-wallet text-success"></i></div>\r
                        <div style="flex:1;">\r
                            <div class="font-bold">BlueBridge Wallet</div>\r
                            <div class="text-xs text-tertiary" id="wallet-balance-info">Balance: Loading...</div>\r
                        </div>\r
                        <div class="selected-check"><i class="fas fa-check-circle text-blue-500"></i></div>\r
                    </div>\r
                    <div class="payment-option" onclick="selectPayment('cash')">\r
                        <div class="payment-icon"><i class="fas fa-money-bill-wave text-blue-500"></i></div>\r
                        <div style="flex:1;">\r
                            <div class="font-bold">Pay After Service (Cash/UPI)</div>\r
                            <div class="text-xs text-tertiary">Pay directly to our professional</div>\r
                        </div>\r
                    </div>\r
                </div>\r
                <div class="summary-item mt-8">\r
                    <h3>Booking Summary</h3>\r
                    <div class="price-row">\r
                        <span>Professional Base Rate</span>\r
                        <span id="summary-base-rate">₹0</span>\r
                    </div>\r
                    <div class="price-row">\r
                        <span>Service Fee</span>\r
                        <span>₹49</span>\r
                    </div>\r
                    <div class="price-total">\r
                        <span>Total Estimate</span>\r
                        <span id="summary-total-price">₹0</span>\r
                    </div>\r
                </div>\r
            </div>\r
\r
            <!-- Step 4: Final Confirmation -->\r
            <div class="step-content" id="content-4">\r
                <div class="text-center py-8">\r
                    <div style="font-size: 4rem; color: var(--neon-green); margin-bottom: 2rem;">\r
                        <i class="fas fa-file-contract"></i>\r
                    </div>\r
                    <h2 class="mb-4">Confirm Your Booking</h2>\r
                    <p class="text-secondary mb-8">Please review your booking details before confirming.</p>\r
\r
                    <div class="text-left max-w-md mx-auto">\r
                        <div class="summary-item">\r
                            <h3>Service Details</h3>\r
                            <p id="final-service-desc"></p>\r
                            <p id="final-date-time" class="text-sm text-tertiary mt-2"></p>\r
                        </div>\r
                        <div class="summary-item">\r
                            <h3>Address</h3>\r
                            <p id="final-address"></p>\r
                        </div>\r
                        <div class="summary-item">\r
                            <h3>Professional</h3>\r
                            <p id="final-worker-name"></p>\r
                        </div>\r
                    </div>\r
                </div>\r
            </div>\r
\r
            <div class="booking-actions">\r
                <button class="btn btn-secondary" id="prev-btn" style="visibility: hidden;">Back</button>\r
                <button class="btn btn-primary" id="next-btn">Next Step</button>\r
            </div>\r
        </div>\r
    </div>\r
\r
    <!-- Worker Profile Modal -->\r
    <div class="modal-overlay" id="worker-profile-modal">\r
        <div class="worker-profile-modal">\r
            <button class="modal-close" onclick="closeWorkerProfile()"><i class="fas fa-times"></i></button>\r
\r
            <div class="modal-hero">\r
                <div class="modal-avatar-lg" id="modal-avatar">WP</div>\r
                <h2 class="modal-name-lg" id="modal-name">Worker Name</h2>\r
                <div class="modal-badges">\r
                    <div class="modal-badge" id="modal-category">Electrician</div>\r
                    <div class="modal-badge"><i class="fas fa-shield-check text-success"></i> Background Verified</div>\r
                </div>\r
                <div id="modal-rating" style="margin-bottom: 1rem; color: #fbbf24; font-weight: bold;">\r
                    <!-- Rating here -->\r
                </div>\r
                <div style="font-size: 1.5rem; font-weight: 800; color: var(--neon-green);" id="modal-rate">₹450/hr\r
                </div>\r
            </div>\r
\r
            <div class="modal-body">\r
                <div class="modal-section">\r
                    <h3><i class="fas fa-info-circle"></i> About Professional</h3>\r
                    <p class="bio-text" id="modal-bio">No details provided.</p>\r
                </div>\r
\r
                <div class="modal-section">\r
                    <h3><i class="fas fa-tools"></i> Skills & Expertise</h3>\r
                    <div class="skill-tags" id="modal-skills">\r
                        <!-- Skills -->\r
                    </div>\r
                </div>\r
\r
                <div class="modal-section">\r
                    <h3><i class="fas fa-map-marker-alt"></i> Primary Location</h3>\r
                    <p class="bio-text" id="modal-location">Local Service Area</p>\r
                </div>\r
            </div>\r
\r
            <div class="modal-footer">\r
                <button class="btn btn-secondary" style="flex: 0.5;" onclick="closeWorkerProfile()">Close</button>\r
                <button class="btn btn-primary" id="modal-book-btn">Select & Continue</button>\r
            </div>\r
        </div>\r
    </div>\r
\r
    \r
    \r
    \r
</body>\r
\r
</html>\r
`,o=n(),s=()=>((0,i.useEffect)(()=>{try{r(()=>import(`./booking-script-CHM316m6.js`),__vite__mapDeps([0,1,2,3]))}catch(e){console.error(`Failed to inject scripts for Booking:`,e)}},[]),(0,o.jsx)(`div`,{dangerouslySetInnerHTML:{__html:a}}));export{s as default};