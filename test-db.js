import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

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

async function seed() {
  try {
    const users = ['Rifaas', 'Sameer'];
    
    for (const user of users) {
      // Create the parent app_data document explicitly
      await setDoc(doc(db, user, 'app_data'), { initialized: true, timestamp: new Date().toISOString() }, { merge: true });

      // 1. Users
      await setDoc(doc(db, user, 'app_data', 'users', user), { name: user, level: 1, xp: 0, xpNext: 1000, studyHours: 0, taskCompletionRate: 0, expenseActivityScore: 0, performanceScore: 0, badges: [] }, { merge: true });
      
      // 2. Expenses
      await setDoc(doc(db, user, 'app_data', 'expenses', 'exp-dummy'), { description: 'Initial Setup', amount: 10, category: 'Others', paidBy: user, date: '2026-07-02', settled: true }, { merge: true });
      
      // 3. Groceries
      await setDoc(doc(db, user, 'app_data', 'groceries', 'groc-dummy'), { name: 'Sample Item', quantity: '1', price: 10, purchased: false, status: 'Normal', category: 'Pantry' }, { merge: true });
      
      // 4. Alarms
      await setDoc(doc(db, user, 'app_data', 'alarms', 'al-dummy'), { time: '08:00', label: 'Morning Alarm', type: 'individual', days: ['Mon'], active: true }, { merge: true });
      
      // 5. ChatMessages
      await setDoc(doc(db, user, 'app_data', 'chatMessages', 'chat-dummy'), { sender: 'System', content: 'Database Initialized', timestamp: new Date().toISOString(), type: 'system' }, { merge: true });
      
      // 6. Tasks (Todo List)
      await setDoc(doc(db, user, 'app_data', 'tasks', 'task-dummy'), { title: 'Welcome to Roommate Sync', assignee: user, date: '2026-07-02', completed: false }, { merge: true });
      
      // 7. Notifications
      await setDoc(doc(db, user, 'app_data', 'notifications', 'notif-dummy'), { text: 'Welcome!', type: 'system', time: 'Just now', read: false }, { merge: true });
      
      // 8. Subjects
      await setDoc(doc(db, user, 'app_data', 'subjects', 'sub-dummy'), { name: 'General', owner: user }, { merge: true });
      
      // 9. Files
      await setDoc(doc(db, user, 'app_data', 'files', 'file-dummy'), { name: 'Welcome Guide.pdf', size: '1.20 MB', type: 'application/pdf', subject: 'General', date: '2026-07-02', owner: user }, { merge: true });
    }

    console.log("Successfully created all collections (todo list, subjects, files, etc.) for both Rifaas and Sameer!");
    process.exit(0);
  } catch (error) {
    console.error("Error writing to Firestore:", error);
    process.exit(1);
  }
}

seed();
