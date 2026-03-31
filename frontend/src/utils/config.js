import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, doc, onSnapshot, getDoc, getDocs, addDoc, updateDoc, setDoc, query, where, orderBy, limit, increment } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyCKgOFDumqTFzsddbc3tuYDAxL4MYkTVlM",
    authDomain: "karyasetu-e199c.firebaseapp.com",
    projectId: "karyasetu-e199c",
    storageBucket: "karyasetu-e199c.firebasestorage.app",
    messagingSenderId: "955540675906",
    appId: "1:955540675906:web:fdc4dbfb09d2624a54fcdb",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export { collection, doc, onSnapshot, getDoc, getDocs, addDoc, updateDoc, setDoc, query, where, orderBy, limit, increment, ref, uploadBytes, getDownloadURL, uploadBytesResumable };
