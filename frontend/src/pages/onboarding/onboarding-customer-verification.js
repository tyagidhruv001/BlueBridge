import { auth, db, doc, setDoc } from '../../utils/config.js';
import { apiFetch } from '../../api/api.js';
import { Storage } from '../../utils/utils.js';

console.log('Customer Verification Script Loaded');

class CustomerVerificationFlow {
    constructor() {
        this.initializeElements();
        this.initializeEventListeners();
        this.autoRedirect();
    }

    async autoRedirect() {
        console.log('--- AUTO-REDIRECTING CUSTOMER ---');
        
        let statusH3 = null;
        let statusP = null;

        if (this.loadingOverlay) {
            this.loadingOverlay.classList.add('active');
            statusH3 = this.loadingOverlay.querySelector('h3');
            statusP = this.loadingOverlay.querySelector('p');
        }

        const updateStatus = (h, p) => {
            if (statusH3) statusH3.innerText = h;
            if (statusP) statusP.innerText = p;
        };

        updateStatus('Connecting...', 'Waiting for secure session initialization...');

        // Wait for Auth to resolve
        const getUserId = () => {
            return new Promise((resolve) => {
                // 1. Check current user
                if (auth.currentUser) return resolve(auth.currentUser.uid);
                
                // 2. Wait for auth state change
                const unsubscribe = auth.onAuthStateChanged((user) => {
                    unsubscribe();
                    if (user) resolve(user.uid);
                    else {
                        // 3. Fallback to Storage
                        const storageUser = Storage.get('BlueBridge_user');
                        resolve(storageUser ? (storageUser.uid || storageUser.id) : null);
                    }
                });

                // Safety timeout
                setTimeout(() => resolve(null), 3000);
            });
        };

        const userId = await getUserId();
        
        if (!userId) {
            updateStatus('Session Error', 'Redirecting to login...');
            setTimeout(() => window.location.href = '/auth/login', 1500);
            return;
        }

        updateStatus('Saving Profile...', 'Preparing your dashboard experience...');

        try {
            // Save basic customer profile to Firestore
            await setDoc(doc(db, 'customers', userId), {
                userId: userId,
                email: auth.currentUser?.email || '',
                displayName: auth.currentUser?.displayName || 'Customer',
                location: 'Remote',
                address: 'Home User',
                pincode: '000000',
                role: 'customer',
                createdAt: new Date().toISOString(),
                verified: true
            });

            updateStatus('Success!', 'Taking you to your dashboard now.');
            setTimeout(() => this.goToDashboard(), 1000);

        } catch (error) {
            console.error('Customer auto-redirect error:', error);
            updateStatus('Redirecting...', 'Taking you to your dashboard now.');
            setTimeout(() => this.goToDashboard(), 1000);
        }
    }

    initializeElements() {
        this.uploadArea = document.getElementById('uploadArea');
        this.fileInput = document.getElementById('fileInput');
        this.documentTypeSelect = document.getElementById('documentType');
        this.previewArea = document.getElementById('previewArea');
        this.previewImage = document.getElementById('previewImage');
        this.removeImageBtn = document.getElementById('removeImageBtn');
        this.verifyBtn = document.getElementById('verifyBtn');
        this.resultsArea = document.getElementById('resultsArea');
        this.skipBtn = document.getElementById('skipVerification');
        this.loadingOverlay = document.getElementById('loadingOverlay');
    }

    initializeEventListeners() {
        if (this.uploadArea) {
            this.uploadArea.addEventListener('click', () => this.fileInput.click());
            this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e.target.files[0]));
        }

        if (this.removeImageBtn) {
            this.removeImageBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.resetUpload();
            });
        }

        if (this.verifyBtn) {
            this.verifyBtn.addEventListener('click', () => this.verifyDocument());
        }

        if (this.skipBtn) {
            this.skipBtn.addEventListener('click', () => this.goToDashboard());
        }
    }

    handleFileSelect(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            this.imageBase64 = e.target.result.split(',')[1];
            this.previewImage.src = e.target.result;
            this.previewArea.classList.add('active');
            this.resultsArea.classList.remove('active');
        };
        reader.readAsDataURL(file);
    }

    resetUpload() {
        this.imageBase64 = null;
        this.fileInput.value = '';
        this.previewArea.classList.remove('active');
    }

    async verifyDocument() {
        const documentType = this.documentTypeSelect.value;
        if (!documentType || !this.imageBase64) {
            alert('Please select document type and upload an image');
            return;
        }

        const user = auth.currentUser || Storage.get('BlueBridge_user');
        const userId = user?.uid || user?.id;

        try {
            this.loadingOverlay.classList.add('active');
            const result = await apiFetch('/verification/verify', {
                method: 'POST',
                body: JSON.stringify({
                    imageBase64: this.imageBase64,
                    documentType: documentType,
                    userId: userId,
                    role: 'customer'
                })
            });

            this.loadingOverlay.classList.remove('active');
            if (result.success) {
                alert('Verification Successful!');
                this.goToDashboard();
            } else {
                alert('Verification failed: ' + result.error);
            }
        } catch (error) {
            console.error(error);
            this.loadingOverlay.classList.remove('active');
            alert('Error during verification');
        }
    }

    goToDashboard() {
        window.location.href = '/dashboard/customer';
    }
}

// Initialize
if (!window.customerVerification) {
    window.customerVerification = new CustomerVerificationFlow();
}
