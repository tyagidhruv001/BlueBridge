import{i as e,n as t,t as n}from"./jsx-runtime-BnxRlLMJ.js";/* empty css                   */var r=e(t(),1),i=`﻿<!DOCTYPE html>\r
<html lang="en">\r
\r
<head>\r
    <meta charset="UTF-8">\r
    <meta name="viewport" content="width=device-width, initial-scale=1.0">\r
    <title>Worker Onboarding - BlueBridge</title>\r
    \r
    \r
    \r
</head>\r
\r
<body>\r
    <div class="onboarding-container gradient-mesh">\r
        <div class="onboarding-card card-glass">\r
            <div class="onboarding-header">\r
                <div class="logo">\r
                    <span class="logo-icon">🔧</span>\r
                    <span class="logo-text">BlueBridge</span>\r
                </div>\r
                <h1>Worker Profile Setup</h1>\r
                <p>Complete your profile to start receiving jobs</p>\r
            </div>\r
\r
            <form class="onboarding-form" id="workerOnboardingForm">\r
                <div class="input-group">\r
                    <label class="input-label">Select Your Skills (Select all that apply)</label>\r
                    <div class="skills-grid">\r
                        <label class="skill-checkbox">\r
                            <input type="checkbox" value="Mechanic">\r
                            <span>🔧 Mechanic</span>\r
                        </label>\r
                        <label class="skill-checkbox">\r
                            <input type="checkbox" value="Plumber">\r
                            <span>🚰 Plumber</span>\r
                        </label>\r
                        <label class="skill-checkbox">\r
                            <input type="checkbox" value="Electrician">\r
                            <span>⚡ Electrician</span>\r
                        </label>\r
                        <label class="skill-checkbox">\r
                            <input type="checkbox" value="Carpenter">\r
                            <span>🪚 Carpenter</span>\r
                        </label>\r
                        <label class="skill-checkbox">\r
                            <input type="checkbox" value="Painter">\r
                            <span>🎨 Painter</span>\r
                        </label>\r
                        <label class="skill-checkbox">\r
                            <input type="checkbox" value="Home Cleaning">\r
                            <span>🧹 Home Cleaning</span>\r
                        </label>\r
                        <label class="skill-checkbox">\r
                            <input type="checkbox" value="AC Repair">\r
                            <span>❄️ AC Repair</span>\r
                        </label>\r
                        <label class="skill-checkbox">\r
                            <input type="checkbox" value="Gardening">\r
                            <span>🌱 Gardening</span>\r
                        </label>\r
                        <label class="skill-checkbox">\r
                            <input type="checkbox" value="Appliances">\r
                            <span>📺 Appliances</span>\r
                        </label>\r
                        <label class="skill-checkbox">\r
                            <input type="checkbox" value="Pest Control">\r
                            <span>🐜 Pest Control</span>\r
                        </label>\r
                        <label class="skill-checkbox">\r
                            <input type="checkbox" value="Beauty & Spa">\r
                            <span>💆 Beauty & Spa</span>\r
                        </label>\r
                        <label class="skill-checkbox">\r
                            <input type="checkbox" value="Packers & Movers">\r
                            <span>📦 Packers & Movers</span>\r
                        </label>\r
                        <label class="skill-checkbox">\r
                            <input type="checkbox" value="RO & Water">\r
                            <span>💧 RO & Water</span>\r
                        </label>\r
                        <label class="skill-checkbox">\r
                            <input type="checkbox" value="Home Security">\r
                            <span>🛡️ Home Security</span>\r
                        </label>\r
                        <label class="skill-checkbox">\r
                            <input type="checkbox" value="Interior Design">\r
                            <span>🛋️ Interior Design</span>\r
                        </label>\r
                    </div>\r
                </div>\r
\r
                <div class="input-group">\r
                    <label class="input-label">Experience Level</label>\r
                    <select class="input-field" id="experience" required>\r
                        <option value="">Select experience</option>\r
                        <option value="beginner">Beginner (0-2 years)</option>\r
                        <option value="skilled">Skilled (2-5 years)</option>\r
                        <option value="expert">Expert (5+ years)</option>\r
                    </select>\r
                </div>\r
\r
                <div class="input-group">\r
                    <label class="input-label">Location</label>\r
                    <input type="text" class="input-field" id="location" placeholder="Enter your city" required>\r
                </div>\r
\r
                <div class="input-group">\r
                    <label class="input-label">Hourly Rate (₹)</label>\r
                    <input type="number" class="input-field" id="hourlyRate" placeholder="e.g., 200" min="50" required>\r
                </div>\r
\r
                <div class="input-group">\r
                    <label class="input-label">Government ID (Aadhaar/PAN)</label>\r
                    <input type="file" class="input-field" id="govId" accept="image/*,.pdf">\r
                    <span class="input-helper">Upload for verification (optional for demo)</span>\r
                </div>\r
\r
                <button type="submit" class="btn btn-primary btn-lg">Complete Setup</button>\r
            </form>\r
        </div>\r
    </div>\r
\r
    \r
    \r
    \r
    \r
</body>\r
\r
</html>\r
`,a=n(),o=()=>((0,r.useEffect)(()=>{},[]),(0,a.jsx)(`div`,{dangerouslySetInnerHTML:{__html:i}}));export{o as default};