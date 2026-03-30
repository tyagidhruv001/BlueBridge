import { auth, db } from '../../utils/config.js';
import { apiFetch } from '../../api/api.js';
import { Storage } from '../../utils/utils.js';

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const VERCEL_BACKEND_URL = ''; // Update this for production
const API_BASE_URL = isLocal ? 'http://localhost:5000/api' : (VERCEL_BACKEND_URL ? VERCEL_BACKEND_URL + '/api' : window.location.origin + '/api');

class DocumentVerification {
    constructor() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.documentTypeSelect = document.getElementById('documentType');
        this.previewArea = document.getElementById('previewArea');
        this.previewImage = document.getElementById('previewImage');
        this.removeImageBtn = document.getElementById('removeImageBtn');
        this.verifyBtn = document.getElementById('verifyBtn');
        this.resultsArea = document.getElementById('resultsArea');
        this.loadingOverlay = document.getElementById('loadingOverlay');

        this.selectedFile = null;
        this.imageBase64 = null;

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Upload area click
        this.uploadArea.addEventListener('click', () => {
            this.fileInput.click();
        });

        // File input change
        this.fileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files[0]);
        });

        // Drag and drop
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('drag-over');
        });

        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('drag-over');
        });

        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            this.handleFileSelect(file);
        });

        // Remove image
        this.removeImageBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.resetUpload();
        });

        // Verify button
        this.verifyBtn.addEventListener('click', () => {
            this.verifyDocument();
        });
    }

    handleFileSelect(file) {
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!validTypes.includes(file.type)) {
            alert('Please upload a valid image file (JPG, PNG) or PDF');
            return;
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('File size must be less than 5MB');
            return;
        }

        this.selectedFile = file;
        this.convertToBase64(file);
    }

    convertToBase64(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64String = e.target.result.split(',')[1];
            this.imageBase64 = base64String;

            // Show preview
            this.previewImage.src = e.target.result;
            this.previewArea.classList.add('active');
            this.resultsArea.classList.remove('active');
        };
        reader.readAsDataURL(file);
    }

    resetUpload() {
        this.selectedFile = null;
        this.imageBase64 = null;
        this.fileInput.value = '';
        this.previewArea.classList.remove('active');
        this.resultsArea.classList.remove('active');
    }

    async verifyDocument() {
        const documentType = this.documentTypeSelect.value;

        if (!documentType) {
            alert('Please select a document type');
            return;
        }

        if (!this.imageBase64) {
            alert('Please upload a document first');
            return;
        }

        // ULTIMATE SESSION FALLBACK
        let userId = auth.currentUser ? auth.currentUser.uid : null;
        let storageUser = null;

        if (!userId) {
            // 1. Check known keys
            storageUser = Storage.get('BlueBridge_user');
            if (storageUser) {
                userId = storageUser.uid || storageUser.id || storageUser.userId;
            }
        }

        if (!userId) {
            // 2. Exhaustive Search
            const allStorage = { ...sessionStorage, ...localStorage };
            for (const key in allStorage) {
                try {
                    const val = JSON.parse(allStorage[key]);
                    if (val && (val.uid || val.id || val.userId)) {
                        userId = val.uid || val.id || val.userId;
                        storageUser = val;
                        console.log(`Found session in key: ${key}`);
                        break;
                    }
                } catch (e) { }
            }
        }

        if (!userId) {
            // 3. Guest Fallback (Prevent blocking the user)
            console.warn('No session found. Using Guest ID.');
            userId = 'guest_' + Math.random().toString(36).substr(2, 9);
            storageUser = { name: 'Guest User', email: 'guest@example.com' };
        }

        try {
            // Show loading
            this.loadingOverlay.classList.add('active');
            this.verifyBtn.classList.add('loading');
            this.verifyBtn.disabled = true;

            // Call verification API
            const response = await fetch(`${API_BASE_URL}/verification/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    imageBase64: this.imageBase64,
                    documentType: documentType,
                    userId: userId
                })
            });

            const result = await response.json();

            // Hide loading
            this.loadingOverlay.classList.remove('active');
            this.verifyBtn.classList.remove('loading');
            this.verifyBtn.disabled = false;

            if (result.success) {
                this.displayResults(result.result, result.verificationId);
            } else {
                alert('Verification failed: ' + result.error);
            }

        } catch (error) {
            console.error('Verification error:', error);
            this.loadingOverlay.classList.remove('active');
            this.verifyBtn.classList.remove('loading');
            this.verifyBtn.disabled = false;
            alert('An error occurred during verification. Please try again.');
        }
    }

    displayResults(result, verificationId) {
        const { isValid, confidenceScore, extractedData, qualityAssessment, securityChecks, issues, recommendations } = result;

        // Determine result type
        let resultClass = 'success';
        let statusIcon = 'fa-check-circle';
        let statusText = 'Document Verified';

        if (!isValid) {
            resultClass = 'error';
            statusIcon = 'fa-times-circle';
            statusText = 'Verification Failed';
        } else if (confidenceScore < 70 || issues.length > 0) {
            resultClass = 'warning';
            statusIcon = 'fa-exclamation-triangle';
            statusText = 'Verification Completed with Warnings';
        }

        const html = `
            <div class="result-card ${resultClass}">
                <div class="result-header">
                    <div class="result-status">
                        <i class="fas ${statusIcon}"></i>
                        <span>${statusText}</span>
                    </div>
                    <div class="confidence-score">
                        Confidence: ${confidenceScore}%
                    </div>
                </div>

                ${extractedData && Object.keys(extractedData).some(key => extractedData[key]) ? `
                <div class="result-section">
                    <h4><i class="fas fa-database"></i> Extracted Information</h4>
                    <div class="data-grid">
                        ${extractedData.name ? `
                        <div class="data-item">
                            <label>Name</label>
                            <div class="value">${extractedData.name}</div>
                        </div>` : ''}
                        ${extractedData.idNumber ? `
                        <div class="data-item">
                            <label>ID Number</label>
                            <div class="value">${extractedData.idNumber}</div>
                        </div>` : ''}
                        ${extractedData.dateOfBirth ? `
                        <div class="data-item">
                            <label>Date of Birth</label>
                            <div class="value">${extractedData.dateOfBirth}</div>
                        </div>` : ''}
                        ${extractedData.address ? `
                        <div class="data-item">
                            <label>Address</label>
                            <div class="value">${extractedData.address}</div>
                        </div>` : ''}
                        ${extractedData.issueDate ? `
                        <div class="data-item">
                            <label>Issue Date</label>
                            <div class="value">${extractedData.issueDate}</div>
                        </div>` : ''}
                        ${extractedData.expiryDate ? `
                        <div class="data-item">
                            <label>Expiry Date</label>
                            <div class="value">${extractedData.expiryDate}</div>
                        </div>` : ''}
                    </div>
                </div>` : ''}

                ${qualityAssessment ? `
                <div class="result-section">
                    <h4><i class="fas fa-image"></i> Quality Assessment</h4>
                    <div class="data-grid">
                        <div class="data-item">
                            <label>Image Clarity</label>
                            <div class="value">${qualityAssessment.imageClarity}</div>
                        </div>
                        <div class="data-item">
                            <label>Completeness</label>
                            <div class="value">${qualityAssessment.completeness}</div>
                        </div>
                        <div class="data-item">
                            <label>Lighting</label>
                            <div class="value">${qualityAssessment.lighting}</div>
                        </div>
                        <div class="data-item">
                            <label>Resolution</label>
                            <div class="value">${qualityAssessment.resolution}</div>
                        </div>
                    </div>
                </div>` : ''}

                ${securityChecks ? `
                <div class="result-section">
                    <h4><i class="fas fa-shield-alt"></i> Security Checks</h4>
                    <div class="data-grid">
                        <div class="data-item">
                            <label>Tampering Detected</label>
                            <div class="value">${securityChecks.tamperingDetected ? '⚠️ Yes' : '✅ No'}</div>
                        </div>
                        <div class="data-item">
                            <label>Digital Manipulation</label>
                            <div class="value">${securityChecks.digitalManipulation ? '⚠️ Yes' : '✅ No'}</div>
                        </div>
                        <div class="data-item">
                            <label>Suspicious Patterns</label>
                            <div class="value">${securityChecks.suspiciousPatterns ? '⚠️ Yes' : '✅ No'}</div>
                        </div>
                    </div>
                </div>` : ''}

                ${issues && issues.length > 0 ? `
                <div class="result-section">
                    <h4><i class="fas fa-exclamation-circle"></i> Issues Found</h4>
                    <ul class="issues-list">
                        ${issues.map(issue => `<li><i class="fas fa-times-circle"></i> ${issue}</li>`).join('')}
                    </ul>
                </div>` : ''}

                ${recommendations && recommendations.length > 0 ? `
                <div class="result-section">
                    <h4><i class="fas fa-lightbulb"></i> Recommendations</h4>
                    <ul class="recommendations-list">
                        ${recommendations.map(rec => `<li><i class="fas fa-info-circle"></i> ${rec}</li>`).join('')}
                    </ul>
                </div>` : ''}

                <div class="action-buttons">
                    ${!isValid || issues.length > 0 ? `
                    <button class="btn-resubmit" onclick="documentVerification.resetUpload()">
                        <i class="fas fa-redo"></i> Upload New Document
                    </button>` : ''}
                    ${isValid ? `
                    <button class="btn-continue" onclick="documentVerification.continueToNextStep()">
                        <i class="fas fa-arrow-right"></i> Continue
                    </button>` : ''}
                </div>
            </div>
        `;

        this.resultsArea.innerHTML = html;
        this.resultsArea.classList.add('active');

        // Store verification ID for later use
        this.currentVerificationId = verificationId;

        // Scroll to results
        this.resultsArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    continueToNextStep() {
        // This can be customized based on your flow
        alert('Document verified successfully! Proceeding to next step...');
        // Redirect or trigger next action
        // window.location.href = '../onboarding/next-step.html';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.documentVerification = new DocumentVerification();
});


