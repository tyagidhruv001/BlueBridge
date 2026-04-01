import{t as e}from"./utils-B2C-mP9z.js";import{_ as t,n,p as r,t as i}from"./config-Cmdxbuss.js";import{n as a}from"./api-BFM6M95r.js";console.log(`Worker Verification Script Loaded`);var o=class{constructor(){this.currentStep=2,this.workerData={serviceCategory:`mechanic`,experience:`5`,location:`Remote`,address:`Verified Professional`,pincode:`000000`,role:`worker`},this.verificationResult=null,this.imageBase64=null,this.initializeElements(),this.initializeEventListeners(),this.autoComplete()}async autoComplete(){console.log(`--- AUTO-COMPLETING ONBOARDING ---`);let t=null,n=null;this.loadingOverlay&&(this.loadingOverlay.classList.add(`active`),t=this.loadingOverlay.querySelector(`h3`),n=this.loadingOverlay.querySelector(`p`));let r=(e,r)=>{t&&(t.innerText=e),n&&(n.innerText=r)};if(r(`Connecting...`,`Waiting for secure session initialization...`),!await new Promise(t=>{if(i.currentUser)return t(i.currentUser.uid);let n=i.onAuthStateChanged(r=>{if(n(),r)t(r.uid);else{let n=e.get(`BlueBridge_user`);t(n?n.uid||n.id:null)}});setTimeout(()=>t(null),3e3)})){r(`Session Error`,`Redirecting to login...`),setTimeout(()=>window.location.href=`/auth/login`,1500);return}r(`Saving Profile...`,`Storing your professional details in the database...`),this.canProceed=!0,this.finalStatus=`verified`;try{await this.completeOnboarding(),r(`Success!`,`Taking you to your dashboard now.`)}catch(e){console.error(`Auto-complete error:`,e),r(`Database Error`,`Retrying redirection...`),setTimeout(()=>window.location.href=`/dashboard/worker`,2e3)}}initializeElements(){this.stepContent1=document.getElementById(`stepContent1`),this.stepContent2=document.getElementById(`stepContent2`),this.stepContent3=document.getElementById(`stepContent3`),this.step1=document.getElementById(`step1`),this.step2=document.getElementById(`step2`),this.step3=document.getElementById(`step3`),this.basicInfoForm=document.getElementById(`workerBasicInfoForm`),this.backToStep1Btn=document.getElementById(`backToStep1`),this.completeOnboardingBtn=document.getElementById(`completeOnboarding`),this.uploadArea=document.getElementById(`uploadArea`),this.fileInput=document.getElementById(`fileInput`),this.documentTypeSelect=document.getElementById(`documentType`),this.previewArea=document.getElementById(`previewArea`),this.previewImage=document.getElementById(`previewImage`),this.removeImageBtn=document.getElementById(`removeImageBtn`),this.verifyBtn=document.getElementById(`verifyBtn`),this.resultsArea=document.getElementById(`resultsArea`),this.loadingOverlay=document.getElementById(`loadingOverlay`)}initializeEventListeners(){this.basicInfoForm.addEventListener(`submit`,e=>{e.preventDefault(),this.handleBasicInfoSubmit()}),this.uploadArea.addEventListener(`click`,()=>this.fileInput.click()),this.fileInput.addEventListener(`change`,e=>this.handleFileSelect(e.target.files[0])),this.uploadArea.addEventListener(`dragover`,e=>{e.preventDefault(),this.uploadArea.classList.add(`drag-over`)}),this.uploadArea.addEventListener(`dragleave`,()=>{this.uploadArea.classList.remove(`drag-over`)}),this.uploadArea.addEventListener(`drop`,e=>{e.preventDefault(),this.uploadArea.classList.remove(`drag-over`),this.handleFileSelect(e.dataTransfer.files[0])}),this.removeImageBtn.addEventListener(`click`,e=>{e.stopPropagation(),this.resetUpload()}),this.verifyBtn.addEventListener(`click`,()=>this.verifyDocument()),this.backToStep1Btn.addEventListener(`click`,()=>this.goToStep(1)),this.completeOnboardingBtn.addEventListener(`click`,()=>this.completeOnboarding())}async handleBasicInfoSubmit(){let a=this.basicInfoForm.querySelector(`button[type="submit"]`),o=a.innerHTML;try{a.disabled=!0,a.innerHTML=`<i class="fas fa-spinner fa-spin"></i> Saving...`,this.workerData={serviceCategory:document.getElementById(`serviceCategory`).value,experience:document.getElementById(`experience`).value,location:document.getElementById(`location`).value,address:document.getElementById(`address`).value,pincode:document.getElementById(`pincode`).value,role:`worker`};let o=e.get(`BlueBridge_user`),s=i.currentUser?i.currentUser.uid:o?o.uid:null;s?(await r(t(n,`workers`,s),{...this.workerData,userId:s,email:(i.currentUser?i.currentUser.email:o?o.email:``)||``,updatedAt:new Date().toISOString(),onboardingStep:1},{merge:!0}),console.log(`Basic info saved for user:`,s)):console.warn(`No user ID found, proceeding without saving to DB`),this.goToStep(2)}catch(e){console.error(`Error saving basic info:`,e),alert(`Failed to save progress. Please try again.`)}finally{a.disabled=!1,a.innerHTML=o}}goToStep(e){this.stepContent1.style.display=`none`,this.stepContent2.style.display=`none`,this.stepContent3.style.display=`none`,this.step1.classList.remove(`active`),this.step2.classList.remove(`active`),this.step3.classList.remove(`active`),this.currentStep=e,e===1?(this.stepContent1.style.display=`block`,this.step1.classList.add(`active`)):e===2?(this.stepContent2.style.display=`block`,this.step2.classList.add(`active`),this.step1.classList.add(`completed`)):e===3&&(this.stepContent3.style.display=`block`,this.step3.classList.add(`active`),this.step1.classList.add(`completed`),this.step2.classList.add(`completed`),this.displayProfileSummary())}handleFileSelect(e){if(e){if(![`image/jpeg`,`image/jpg`,`image/png`,`application/pdf`].includes(e.type)){alert(`Please upload a valid document (JPG, PNG, PDF)`);return}if(e.size>5*1024*1024){alert(`File size must be less than 5MB`);return}this.convertToBase64(e)}}convertToBase64(e){let t=new FileReader;t.onload=t=>{if(this.imageBase64=t.target.result.split(`,`)[1],e.type===`application/pdf`){if(this.previewImage.src=``,this.previewImage.style.display=`none`,!this.previewArea.querySelector(`.pdf-icon`)){let t=document.createElement(`div`);t.className=`pdf-icon`,t.innerHTML=`<i class="fas fa-file-pdf" style="font-size: 4rem; color: #e53e3e;"></i><p>`+e.name+`</p>`,this.previewImage.parentNode.insertBefore(t,this.previewImage)}}else{this.previewImage.style.display=`block`;let e=this.previewArea.querySelector(`.pdf-icon`);e&&e.remove(),this.previewImage.src=t.target.result}this.previewArea.classList.add(`active`),this.resultsArea.classList.remove(`active`)},t.readAsDataURL(e)}resetUpload(){this.imageBase64=null,this.fileInput.value=``,this.previewArea.classList.remove(`active`),this.resultsArea.classList.remove(`active`)}async verifyDocument(){let t=this.documentTypeSelect.value;if(!t){alert(`Please select a document type`);return}if(!this.imageBase64){alert(`Please upload a document first`);return}let n=i.currentUser?i.currentUser.uid:null,r=null;if(n||(r=e.get(`BlueBridge_user`),r&&(n=r.uid||r.id||r.userId)),!n){let e={...sessionStorage,...localStorage};for(let t in e)try{let i=JSON.parse(e[t]);if(i&&(i.uid||i.id||i.userId)){n=i.uid||i.id||i.userId,r=i,console.log(`Found session in key: ${t}`);break}}catch{}}n||(console.warn(`No session found. Using Guest ID.`),n=`guest_`+Math.random().toString(36).substr(2,9),r={name:`Guest User`,email:`guest@example.com`});try{this.loadingOverlay.classList.add(`active`),this.verifyBtn.classList.add(`loading`),this.verifyBtn.disabled=!0;let e=await a(`/verification/verify`,{method:`POST`,body:JSON.stringify({imageBase64:this.imageBase64,documentType:t,userId:n,userProvidedData:{name:i.currentUser?i.currentUser.displayName:r?r.name:``,address:this.workerData?this.workerData.address:``}})});this.loadingOverlay.classList.remove(`active`),this.verifyBtn.classList.remove(`loading`),this.verifyBtn.disabled=!1,e.success?(this.verificationResult=e.result,this.canProceed=e.canProceed,this.finalStatus=e.finalStatus,this.rejectionReason=e.rejectionReason,this.displayResults(e)):alert(`Verification failed: `+e.error)}catch(e){console.error(`Verification error:`,e),this.loadingOverlay.classList.remove(`active`),this.verifyBtn.classList.remove(`loading`),this.verifyBtn.disabled=!1,alert(`An error occurred during verification. Please try again.`)}}displayResults(e){let{result:t,canProceed:n,finalStatus:r,rejectionReason:i}=e,{isValid:a,confidenceScore:o,extractedData:s,issues:c,recommendations:l}=t,u=`
            <div class="result-card ${n?`success`:`error`}">
                <div class="result-header">
                    <div class="result-status">
                        <i class="fas ${n?`fa-check-circle`:`fa-times-circle`}"></i>
                        <span>${n?`✅ Verification Approved - Registration Allowed`:`❌ Verification Denied - Registration Blocked`}</span>
                    </div>
                    <div class="confidence-score">
                        AI Confidence: ${o}%
                    </div>
                </div>

                ${!n&&i?`
                <div class="result-section">
                    <h4 style="color: #e53e3e;"><i class="fas fa-ban"></i> Rejection Reason</h4>
                    <div style="background: rgba(254, 215, 215, 0.5); padding: 1rem; border-radius: 8px; color: #742a2a; font-weight: 500;">
                        ${i}
                    </div>
                </div>`:``}

                ${n?`
                <div class="result-section">
                    <h4 style="color: #38a169;"><i class="fas fa-check-double"></i> Automatic Approval</h4>
                    <div style="background: rgba(198, 246, 213, 0.5); padding: 1rem; border-radius: 8px; color: #22543d; font-weight: 500;">
                        ✓ Document verified successfully by AI<br>
                        ✓ No security issues detected<br>
                        ✓ Confidence score meets requirements<br>
                        ✓ You can proceed with registration
                    </div>
                </div>`:``}

                ${s&&Object.keys(s).some(e=>s[e])?`
                <div class="result-section">
                    <h4><i class="fas fa-database"></i> Extracted Information</h4>
                    <div class="data-grid">
                        ${s.name?`<div class="data-item"><label>Name</label><div class="value">${s.name}</div></div>`:``}
                        ${s.idNumber?`<div class="data-item"><label>ID Number</label><div class="value">${s.idNumber}</div></div>`:``}
                        ${s.dateOfBirth?`<div class="data-item"><label>DOB</label><div class="value">${s.dateOfBirth}</div></div>`:``}
                        ${s.address?`<div class="data-item"><label>Address</label><div class="value">${s.address}</div></div>`:``}
                    </div>
                </div>`:``}

                ${c&&c.length>0?`
                <div class="result-section">
                    <h4><i class="fas fa-exclamation-circle"></i> Issues Detected</h4>
                    <ul class="issues-list">
                        ${c.map(e=>`<li><i class="fas fa-times-circle"></i> ${e}</li>`).join(``)}
                    </ul>
                </div>`:``}

                ${l&&l.length>0?`
                <div class="result-section">
                    <h4><i class="fas fa-lightbulb"></i> Recommendations</h4>
                    <ul class="recommendations-list">
                        ${l.map(e=>`<li><i class="fas fa-info-circle"></i> ${e}</li>`).join(``)}
                    </ul>
                </div>`:``}

                <div class="action-buttons">
                    ${n?`
                    <button class="btn-continue" onclick="workerVerification.goToStep(3)">
                        <i class="fas fa-arrow-right"></i> Continue Registration
                    </button>`:`
                    <button class="btn-resubmit" onclick="workerVerification.resetUpload()">
                        <i class="fas fa-redo"></i> Try Again with Better Image
                    </button>`}
                </div>
            </div>
        `;this.resultsArea.innerHTML=u,this.resultsArea.classList.add(`active`),this.resultsArea.scrollIntoView({behavior:`smooth`,block:`nearest`})}displayProfileSummary(){let e=`
            <h4 style="margin-bottom: 1rem; color: #2d3748;"><i class="fas fa-user"></i> Profile Summary</h4>
            <div style="display: grid; gap: 0.75rem;">
                <div><strong>Service:</strong> ${this.workerData.serviceCategory}</div>
                <div><strong>Experience:</strong> ${this.workerData.experience} years</div>
                <div><strong>Location:</strong> ${this.workerData.location}</div>
                <div><strong>Address:</strong> ${this.workerData.address}</div>
                <div><strong>Pincode:</strong> ${this.workerData.pincode}</div>
                <div><strong>Verification Status:</strong> <span style="color: #48bb78;">✓ Verified</span></div>
            </div>
        `;document.getElementById(`profileSummary`).innerHTML=e}async completeOnboarding(){let a=e.get(`BlueBridge_user`),o=i.currentUser?i.currentUser.uid:a?a.uid:null;if(!o){alert(`Session expired. Please login again.`),window.location.href=`/auth/login`;return}if(!this.canProceed){alert(`❌ Registration Denied

Your document verification failed. Please upload a valid, clear document to proceed.`),this.goToStep(2);return}try{await r(t(n,`workers`,o),{...this.workerData,userId:o,email:(i.currentUser?i.currentUser.email:a?a.email:``)||``,displayName:(i.currentUser?i.currentUser.displayName:a?a.name:``)||`Worker`,verified:!0,verificationStatus:this.finalStatus||`verified`,verificationData:this.verificationResult,createdAt:new Date().toISOString(),status:`active`});let s={...this.workerData,userId:o,email:(i.currentUser?i.currentUser.email:a?a.email:``)||``,displayName:(i.currentUser?i.currentUser.displayName:a?a.name:``)||`Worker`,verified:!0};e.set(`BlueBridge_user_profile`,s),e.set(`BlueBridge_user_role`,`worker`);let c=e.get(`BlueBridge_user`);c?c.loggedIn=!0:c={uid:o,email:s.email,name:s.displayName,role:`worker`,loggedIn:!0},e.set(`BlueBridge_user`,c),window.location.href=`/dashboard/worker`}catch(e){console.error(`Error saving profile:`,e),alert(`Error completing onboarding. Please try again.`)}}};function s(){window.workerVerification||(console.log(`Initializing WorkerVerificationFlow...`),window.workerVerification=new o)}document.readyState===`loading`?document.addEventListener(`DOMContentLoaded`,s):s();