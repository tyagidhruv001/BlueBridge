const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/onboarding-customer-verification-BsknxU_i.js","assets/config-Cmdxbuss.js","assets/api-BFM6M95r.js","assets/utils-B2C-mP9z.js"])))=>i.map(i=>d[i]);
import{i as e,n as t,t as n}from"./jsx-runtime-BnxRlLMJ.js";import{t as r}from"./preload-helper-DSXbuxSR.js";/* empty css                   *//* empty css                     */var i=e(t(),1),a=`﻿<!DOCTYPE html>\r
<html lang="en">\r
\r
<head>\r
    <meta charset="UTF-8">\r
    <meta name="viewport" content="width=device-width, initial-scale=1.0">\r
    <title>Customer Verification - BlueBridge</title>\r
    \r
    \r
    \r
    \r
    \r
    \r
    <style>\r
        .optional-badge {\r
            background: #edf2f7;\r
            color: #718096;\r
            padding: 0.25rem 0.5rem;\r
            border-radius: 4px;\r
            font-size: 0.75rem;\r
            margin-left: 0.5rem;\r
        }\r
\r
        .skip-btn {\r
            background: transparent;\r
            border: 2px solid #cbd5e0;\r
            color: #718096;\r
            margin-top: 1rem;\r
        }\r
\r
        .skip-btn:hover {\r
            border-color: #a0aec0;\r
            color: #4a5568;\r
        }\r
    </style>\r
</head>\r
\r
<body>\r
    <div class="onboarding-container gradient-mesh">\r
        <div class="onboarding-card card-glass" style="max-width: 800px;">\r
            <div class="onboarding-header">\r
                <div class="logo">\r
                    <span class="logo-icon">🔧</span>\r
                    <span class="logo-text">BlueBridge</span>\r
                </div>\r
                <h1>Complete Your Profile</h1>\r
                <p>Tell us about yourself and optionally verify your identity</p>\r
            </div>\r
\r
            <!-- Basic Info Form (Skipped) -->\r
            <form class="onboarding-form" id="customerBasicInfoForm" style="display: none;">\r
                <!-- Form fields hidden as requested -->\r
            </form>\r
\r
            <!-- Identity Verification Section (Skipped) -->\r
            <div id="verificationSection" style="display: none; margin-top: 2rem;">\r
                <div style="text-align: center; margin-bottom: 2rem;">\r
                    <h3 style="color: #2d3748;">\r
                        <i class="fas fa-shield-alt"></i> Verify Your Identity\r
                        <span class="optional-badge">OPTIONAL</span>\r
                    </h3>\r
                    <p style="color: #718096; font-size: 0.9rem;">\r
                        Verified customers get priority booking and better trust from workers\r
                    </p>\r
                </div>\r
\r
                <div class="document-type-selector">\r
                    <label for="documentType">Select Document Type</label>\r
                    <select id="documentType">\r
                        <option value="">-- Choose Document Type --</option>\r
                        <option value="aadhaar">Aadhaar Card</option>\r
                        <option value="pan">PAN Card</option>\r
                        <option value="driving_license">Driving License</option>\r
                        <option value="voter_id">Voter ID</option>\r
                        <option value="passport">Passport</option>\r
                    </select>\r
                </div>\r
\r
                <div class="upload-area" id="uploadArea" style="padding: 2rem 1rem;">\r
                    <div class="upload-icon">\r
                        <i class="fas fa-cloud-upload-alt"></i>\r
                    </div>\r
                    <h3>Drag & Drop your document here</h3>\r
                    <p>or click to browse</p>\r
                    <p class="file-types">Supported: JPG, PNG (max 5MB)</p>\r
                    <input type="file" id="fileInput" accept="image/*">\r
                </div>\r
\r
                <div class="preview-area" id="previewArea">\r
                    <div class="preview-image-container">\r
                        <img id="previewImage" class="preview-image" alt="Document preview">\r
                        <button class="remove-image-btn" id="removeImageBtn">\r
                            <i class="fas fa-times"></i>\r
                        </button>\r
                    </div>\r
                    <button class="verify-btn" id="verifyBtn">\r
                        <i class="fas fa-check-circle"></i> Verify Document\r
                    </button>\r
                </div>\r
\r
                <div class="results-area" id="resultsArea"></div>\r
\r
                <button class="btn btn-secondary btn-lg skip-btn" id="skipVerification">\r
                    Skip Verification - Continue to Dashboard\r
                </button>\r
            </div>\r
        </div>\r
    </div>\r
\r
    <!-- Loading Overlay -->\r
    <div class="loading-overlay active" id="loadingOverlay">\r
        <div class="loading-content">\r
            <div class="loading-spinner"></div>\r
            <h3>Redirecting...</h3>\r
            <p>Welcome to BlueBridge! Taking you to your dashboard.</p>\r
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
`,o=n(),s=()=>((0,i.useEffect)(()=>{try{r(()=>import(`./onboarding-customer-verification-BsknxU_i.js`),__vite__mapDeps([0,1,2,3]))}catch(e){console.error(`Failed to inject scripts for CustomerVerification:`,e)}},[]),(0,o.jsx)(`div`,{dangerouslySetInnerHTML:{__html:a}}));export{s as default};