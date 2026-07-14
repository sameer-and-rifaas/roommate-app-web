import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA7LoWb1mIvetDlWTar56JYT12Uc_fVY1c",
  authDomain: "roommate-sync-ce408.firebaseapp.com",
  projectId: "roommate-sync-ce408",
  storageBucket: "roommate-sync-ce408.firebasestorage.app",
  messagingSenderId: "112384527678",
  appId: "1:112384527678:web:aa6e69560579c9f895706f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function verify() {
  try {
    const docRef = doc(db, 'Rifaas', 'app_data', 'tasks', 'task-dummy');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log("SUCCESS: Data exists in Firestore! Found task:", docSnap.data().title);
    } else {
      console.log("ERROR: Data does NOT exist in Firestore!");
    }
    process.exit(0);
  } catch (error) {
    console.error("Error reading from Firestore:", error);
    process.exit(1);
  }
}

verify();
