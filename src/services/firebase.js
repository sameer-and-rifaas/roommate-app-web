import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

// Retrieve credentials from Vite env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let db = null;
let firebaseAvailable = false;

// Attempt Firebase initialization
if (
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'your_api_key_here' && 
  firebaseConfig.apiKey !== 'PASTE_YOUR_API_KEY_HERE' &&
  !firebaseConfig.apiKey.includes('...')
) {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    firebaseAvailable = true;
    console.log("🔥 Firebase initialized successfully connected to:", firebaseConfig.projectId);
  } catch (error) {
    console.warn("⚠️ Firebase initialization failed, falling back to Local Storage:", error);
    firebaseAvailable = false;
  }
} else {
  console.warn("⚠️ Firebase configuration missing, running in Local Sandbox Mode.");
}

export { firebaseAvailable };

// --- Multi-Collection Database Adapters (User-Specific) ---

import { collection, getDocs, deleteDoc } from 'firebase/firestore';

export async function fetchUserCollection(userName, collectionName) {
  if (firebaseAvailable && db) {
    try {
      const colRef = collection(db, userName, 'app_data', collectionName);
      const snapshot = await getDocs(colRef);
      const data = [];
      snapshot.forEach(d => {
        data.push({ id: d.id, ...d.data() });
      });
      return data;
    } catch (e) {
      console.error(`Error reading ${collectionName} for ${userName}`, e);
    }
  }
  
  const local = localStorage.getItem(`roommate_sync_${userName}_${collectionName}`);
  return local ? JSON.parse(local) : [];
}

export async function saveToUserCollection(userName, collectionName, docId, data) {
  if (firebaseAvailable && db) {
    try {
      const docRef = doc(db, userName, 'app_data', collectionName, docId);
      await setDoc(docRef, data, { merge: true });
      return true;
    } catch (e) {
      console.error(`Error writing to ${collectionName} for ${userName}`, e);
    }
  }
  
  let localData = JSON.parse(localStorage.getItem(`roommate_sync_${userName}_${collectionName}`) || '[]');
  const index = localData.findIndex(item => item.id === docId);
  if (index >= 0) {
    localData[index] = { ...localData[index], ...data };
  } else {
    localData.push({ id: docId, ...data });
  }
  localStorage.setItem(`roommate_sync_${userName}_${collectionName}`, JSON.stringify(localData));
  return false;
}

export async function deleteFromUserCollection(userName, collectionName, docId) {
  if (firebaseAvailable && db) {
    try {
      const docRef = doc(db, userName, 'app_data', collectionName, docId);
      await deleteDoc(docRef);
      return true;
    } catch (e) {
      console.error(`Error deleting from ${collectionName} for ${userName}`, e);
    }
  }
  
  let localData = JSON.parse(localStorage.getItem(`roommate_sync_${userName}_${collectionName}`) || '[]');
  localData = localData.filter(item => item.id !== docId);
  localStorage.setItem(`roommate_sync_${userName}_${collectionName}`, JSON.stringify(localData));
  return false;
}
