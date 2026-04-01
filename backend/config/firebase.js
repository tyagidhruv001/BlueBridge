const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

let serviceAccount;
try {
  // Check for environment variable first (Production/Vercel)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const rawConfig = process.env.FIREBASE_SERVICE_ACCOUNT;
      
      let parsedJson;
      // If it looks like base64 (no curly braces), decode it first
      if (!rawConfig.trim().startsWith('{') && !rawConfig.trim().startsWith('"')) {
          const decoded = Buffer.from(rawConfig, 'base64').toString('utf-8');
          parsedJson = JSON.parse(decoded);
          console.log('Successfully decoded Base64 FIREBASE_SERVICE_ACCOUNT');
      } else {
          // Standard JSON parsing with double-quote stripping
          const jsonString = rawConfig.trim().startsWith('"') && rawConfig.trim().endsWith('"')
            ? JSON.parse(rawConfig)
            : rawConfig;
          parsedJson = typeof jsonString === 'object' ? jsonString : JSON.parse(jsonString);
      }
      
      serviceAccount = parsedJson;
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
