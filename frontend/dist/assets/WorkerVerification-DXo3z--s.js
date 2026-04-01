const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/onboarding-worker-verification-BUPYDfYO.js","assets/config-Cmdxbuss.js","assets/api-BFM6M95r.js","assets/utils-B2C-mP9z.js"])))=>i.map(i=>d[i]);
import{i as e,n as t,t as n}from"./jsx-runtime-BnxRlLMJ.js";import{t as r}from"./preload-helper-DSXbuxSR.js";/* empty css                   *//* empty css                     */var i=e(t(),1),a=`﻿<!DOCTYPE html>\r
<html lang="en">\r
\r
<head>\r
    <meta charset="UTF-8">\r
    <meta name="viewport" content="width=device-width, initial-scale=1.0">\r
    <title>Worker Verification - BlueBridge</title>\r
    \r
    \r
    \r
    \r
    \r
    \r
    <style>\r
        .verification-step {\r
            margin-top: 2rem;\r
        }\r
\r
        .step-indicator {\r
            display: flex;\r
            justify-content: center;\r
            gap: 1rem;\r
            margin-bottom: 2rem;\r
        }\r
\r
        .step {\r
            width: 40px;\r
            height: 40px;\r
            border-radius: 50%;\r
            background: rgba(255, 255, 255, 0.3);\r
            display: flex;\r
            align-items: center;\r
            justify-content: center;\r
            font-weight: 600;\r
            color: #718096;\r
            transition: all 0.3s ease;\r
        }\r
\r
        .step.active {\r
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\r
            color: white;\r
            transform: scale(1.2);\r
        }\r
\r
        .step.completed {\r
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);\r
            color: white;\r
        }\r
\r
        .compact-upload {\r
            padding: 2rem 1rem;\r
        }\r
\r
        .compact-upload .upload-icon {\r
            font-size: 2rem;\r
        }\r
\r
        .compact-upload h3 {\r
            font-size: 1rem;\r
        }\r
\r
        .compact-upload p {\r
            font-size: 0.85rem;\r
        }\r
\r
        .sr-only {\r
            position: absolute;\r
            width: 1px;\r
            height: 1px;\r
            padding: 0;\r
            margin: -1px;\r
            overflow: hidden;\r
            clip: rect(0, 0, 0, 0);\r
            white-space: nowrap;\r
            border-width: 0;\r
        }\r
    </style>\r
</head>\r
\r
<body>\r
    <div class="onboarding-container gradient-mesh">\r
        <div class="onboarding-card card-glass" style="max-width: 900px;">\r
            <div class="onboarding-header">\r
                <div class="logo">\r
                    <span class="logo-icon">🔧</span>\r
                    <span class="logo-text">BlueBridge</span>\r
                </div>\r
                <h1>Worker Verification</h1>\r
                <p>Complete your profile and verify your identity</p>\r
            </div>\r
\r
            <!-- Step Indicator -->\r
            <div class="step-indicator">\r
                <div class="step completed" id="step1">1</div>\r
                <div class="step active" id="step2">2</div>\r
                <div class="step" id="step3">3</div>\r
            </div>\r
\r
            <!-- Step 1: Basic Info (Skipped as requested) -->\r
            <div id="stepContent1" class="step-content" style="display: none;">\r
                <form class="onboarding-form" id="workerBasicInfoForm">\r
                    <!-- Form content hidden but maintained for script compatibility -->\r
                </form>\r
            </div>\r
\r
            <!-- Step 2: Identity Document Verification (Skipped) -->\r
            <div id="stepContent2" class="step-content" style="display: none;">\r
                <div class="verification-step">\r
                    <h3 style="text-align: center; margin-bottom: 1rem; color: #2d3748;">\r
                        <i class="fas fa-id-card"></i> Verify Your Identity\r
                    </h3>\r
                    <p style="text-align: center; color: #718096; margin-bottom: 2rem;">\r
                        Upload a government-issued ID for verification\r
                    </p>\r
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
                    <div class="upload-area compact-upload" id="uploadArea">\r
                        <div class="upload-icon">\r
                            <i class="fas fa-cloud-upload-alt"></i>\r
                        </div>\r
                        <h3>Drag & Drop your document here</h3>\r
                        <p>or click to browse</p>\r
                        <p class="file-types">Supported: JPG, PNG, PDF (max 5MB)</p>\r
                        <input type="file" id="fileInput" accept="image/*,.pdf">\r
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
                    <button class="btn btn-secondary btn-lg" id="backToStep1" style="margin-top: 1rem;">\r
                        <i class="fas fa-arrow-left"></i> Back\r
                    </button>\r
                </div>\r
            </div>\r
\r
            <!-- Step 3: Review & Complete -->\r
            <div id="stepContent3" class="step-content" style="display: none;">\r
                <div style="text-align: center; padding: 2rem;">\r
                    <div style="font-size: 4rem; margin-bottom: 1rem;">\r
                        <i class="fas fa-check-circle" style="color: #48bb78;"></i>\r
                    </div>\r
                    <h2 style="color: #2d3748; margin-bottom: 1rem;">Verification Complete!</h2>\r
                    <p style="color: #718096; margin-bottom: 2rem;">\r
                        Your profile has been created and your documents are verified.\r
                    </p>\r
\r
                    <div id="profileSummary"\r
                        style="background: rgba(255,255,255,0.5); padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem; text-align: left;">\r
                        <!-- Profile summary will be inserted here -->\r
                    </div>\r
\r
                    <button class="btn btn-primary btn-lg" id="completeOnboarding">\r
                        <i class="fas fa-rocket"></i> Go to Dashboard\r
                    </button>\r
                </div>\r
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
`,o=n(),s=()=>((0,i.useEffect)(()=>{try{r(()=>import(`./onboarding-worker-verification-BUPYDfYO.js`),__vite__mapDeps([0,1,2,3]))}catch(e){console.error(`Failed to inject scripts for WorkerVerification:`,e)}},[]),(0,o.jsx)(`div`,{dangerouslySetInnerHTML:{__html:a}}));export{s as default};