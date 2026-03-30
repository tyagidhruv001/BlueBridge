const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

let serviceAccount;
try {
  // Check for environment variable first (Production/Vercel)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      // Handle potental double-stringified JSON which can happen in some envs
      const rawConfig = process.env.FIREBASE_SERVICE_ACCOUNT;
      // If it starts with a quote, it might be double-quoted.
      const jsonString = rawConfig.trim().startsWith('"') && rawConfig.trim().endsWith('"')
        ? JSON.parse(rawConfig)
        : rawConfig;

      serviceAccount = typeof jsonString === 'object' ? jsonString : JSON.parse(jsonString);
      console.log('Successfully loaded serviceAccount from FIREBASE_SERVICE_ACCOUNT environment variable.');
    } catch (e) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT JSON:', e.message);
    }
  }

  // Fallback to local file if not found or failed to parse (Local Dev)
  if (!serviceAccount) {
    console.log('Current directory of firebase.js:', __dirname);
    console.log('FIREBASE_SERVICE_ACCOUNT env var not present or valid. Attempting to load from local file...');
    try {
      serviceAccount = require('../serviceAccountKey.json');
      console.log('Successfully loaded serviceAccount from local file.');
    } catch (e) {
      console.warn('Could not load local serviceAccountKey.json:', e.message);
    }
  }
} catch (error) {
  console.error('CRITICAL ERROR: Could not load Firebase credentials.');
  console.error('Details:', error.message);
  console.error('For Vercel Deployment: Verify FIREBASE_SERVICE_ACCOUNT environment variable is set with the JSON content of serviceAccountKey.json');
}

if (!admin.apps.length) {
  try {
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('Firebase Admin initialized with credentials');
    } else {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID
      });
      console.log('Firebase Admin initialized with Project ID:', process.env.FIREBASE_PROJECT_ID);
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });
const auth = admin.auth();

module.exports = { db, auth, admin };
