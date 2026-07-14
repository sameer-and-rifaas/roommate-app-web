import { useState, useEffect } from 'react';
import { fetchUserCollection, saveToUserCollection, deleteFromUserCollection } from './firebase';

// Seed Initial Data
const initialUsers = {
  Sameer: {
    name: 'Sameer',
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Sameer&backgroundColor=b6e3f4',
    level: 2,
    xp: 450,
    xpNext: 1000,
    studyHours: 12.5,
    taskCompletionRate: 85,
    expenseActivityScore: 90,
    performanceScore: 88,
    badges: ['Smart Planner'],
    whatsapp: '919876543210',
    upiId: 'sameer@okhdfcbank'
  },
  Rifaas: {
    name: 'Rifaas',
    avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Rifaas&backgroundColor=c0aede',
    level: 3,
    xp: 820,
    xpNext: 1500,
    studyHours: 19.0,
    taskCompletionRate: 92,
    expenseActivityScore: 95,
    performanceScore: 94,
    badges: ['Saver King', 'Clean Budget Master'],
    whatsapp: '919876543211',
    upiId: 'rifaas@okhdfcbank'
  }
};

const initialExpenses = [
  { id: 'exp-1', description: 'Room Rent (July)', amount: 8000, category: 'Rent', paidBy: 'Rifaas', date: '2026-06-30', settled: false },
  { id: 'exp-2', description: 'Groceries at Supermarket', amount: 1200, category: 'Groceries', paidBy: 'Sameer', date: '2026-07-01', settled: false }
];

const initialGroceries = [
  { id: 'groc-1', name: 'Organic Milk', quantity: '2 Packets', category: 'Dairy', price: 60, purchased: false, status: 'Low' }
];

const initialAlarms = [
  { id: 'al-1', time: '06:30', label: 'Morning Gym Session', type: 'individual', owner: 'Sameer', days: ['Mon', 'Wed', 'Fri'], active: true }
];

const initialChatMessages = [
  { id: 'chat-1', sender: 'System', content: 'Welcome to Roommate Sync!', timestamp: '2026-07-01T10:15:10Z', type: 'system' }
];

const initialTasks = [
  { id: 'task-1', title: 'Buy water bottles', date: '2026-07-01', assignee: 'Sameer', completed: false }
];

const initialNotifications = [
  { id: 'not-1', text: 'Welcome to your new room dashboard!', type: 'system', time: 'Just now', read: false }
];

const initialDeposits = [
  { id: 'dep-1', user: 'Sameer', amount: 5000, date: '2026-07-01' },
  { id: 'dep-2', user: 'Rifaas', amount: 5000, date: '2026-07-01' }
];

export function useRoomState() {
  const [currentUser, setCurrentUser] = useState('Sameer');
  const [users, setUsers] = useState({});
  const [expenses, setExpenses] = useState([]);
  const [groceries, setGroceries] = useState([]);
  const [alarms, setAlarms] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [studyFiles, setStudyFiles] = useState([]);
  const [walletDeposits, setWalletDeposits] = useState([]);
  const [roomBudget, setRoomBudget] = useState(10000);
  const [foodMenus, setFoodMenus] = useState({});
  const [loading, setLoading] = useState(true);

  // Load from database / local storage on mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      // Fetch for both users to connect them on the dashboard
      const usersToFetch = ['Sameer', 'Rifaas'];
      
      const allData = await Promise.all(usersToFetch.map(async (u) => {
        return {
          user: u,
          usersData: await fetchUserCollection(u, 'users'),
          expensesData: await fetchUserCollection(u, 'expenses'),
          groceriesData: await fetchUserCollection(u, 'groceries'),
          alarmsData: await fetchUserCollection(u, 'alarms'),
          chatData: await fetchUserCollection(u, 'chatMessages'),
          tasksData: await fetchUserCollection(u, 'tasks'),
          notifData: await fetchUserCollection(u, 'notifications'),
          subjectsData: await fetchUserCollection(u, 'subjects'),
          filesData: await fetchUserCollection(u, 'files'),
          depositsData: await fetchUserCollection(u, 'walletDeposits')
        };
      }));

      // Fetch shared data (Food Menus and Settings like Budget)
      const sharedFoodMenus = await fetchUserCollection('shared', 'foodMenus');
      const sharedSettings = await fetchUserCollection('shared', 'settings');

      let mergedUsers = {};
      let mergedExpenses = [];
      let mergedGroceries = [];
      let mergedAlarms = [];
      let mergedChat = [];
      let mergedTasks = [];
      let mergedNotif = [];
      let mergedSubjects = [];
      let mergedFiles = [];
      let mergedDeposits = [];

      allData.forEach(d => {
        d.usersData.forEach(u => mergedUsers[u.id] = u);
        mergedExpenses.push(...d.expensesData);
        mergedGroceries.push(...d.groceriesData);
        mergedAlarms.push(...d.alarmsData);
        mergedChat.push(...d.chatData);
        mergedTasks.push(...d.tasksData);
        mergedNotif.push(...d.notifData);
        mergedSubjects.push(...d.subjectsData);
        mergedFiles.push(...d.filesData);
        mergedDeposits.push(...d.depositsData);
      });

      if (Object.keys(mergedUsers).length === 0) {
        mergedUsers = initialUsers;
        Object.keys(initialUsers).forEach(id => saveToUserCollection(id, 'users', id, initialUsers[id]));
      }
      setUsers(mergedUsers);

      if (mergedExpenses.length === 0) {
        mergedExpenses = initialExpenses;
        initialExpenses.forEach(x => saveToUserCollection(x.paidBy || 'Sameer', 'expenses', x.id, x));
      }
      setExpenses(mergedExpenses);

      if (mergedGroceries.length === 0) {
        mergedGroceries = initialGroceries;
        initialGroceries.forEach(x => saveToUserCollection('Sameer', 'groceries', x.id, x));
      }
      setGroceries(mergedGroceries);

      if (mergedAlarms.length === 0) {
        mergedAlarms = initialAlarms;
        initialAlarms.forEach(x => saveToUserCollection(x.owner || 'Sameer', 'alarms', x.id, x));
      }
      setAlarms(mergedAlarms);

      if (mergedChat.length === 0) {
        mergedChat = initialChatMessages;
        initialChatMessages.forEach(x => saveToUserCollection('System', 'chatMessages', x.id, x));
      }
      // Sort chat by time
      mergedChat.sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));
      setChatMessages(mergedChat);

      if (mergedTasks.length === 0) {
        mergedTasks = initialTasks;
        initialTasks.forEach(x => saveToUserCollection(x.assignee === 'both' ? 'Sameer' : x.assignee, 'tasks', x.id, x));
      }
      setTasks(mergedTasks);

      if (mergedNotif.length === 0) {
        mergedNotif = initialNotifications;
        initialNotifications.forEach(x => saveToUserCollection('System', 'notifications', x.id, x));
      }
      setNotifications(mergedNotif);
      
      setSubjects(mergedSubjects);
      setStudyFiles(mergedFiles);
      
      if (mergedDeposits.length === 0) {
        mergedDeposits = initialDeposits;
        initialDeposits.forEach(x => saveToUserCollection(x.user, 'walletDeposits', x.id, x));
      }
      setWalletDeposits(mergedDeposits);

      // Restore Food Menus from Firebase
      if (sharedFoodMenus.length > 0) {
        const loadedMenus = {};
        sharedFoodMenus.forEach(menu => {
          // The id is the dateKey
          loadedMenus[menu.id] = menu;
        });
        setFoodMenus(loadedMenus);
        localStorage.setItem('roommate_sync_food_menus', JSON.stringify(loadedMenus));
      } else {
        // Fallback to local storage if Firebase is empty initially
        const localMenus = localStorage.getItem('roommate_sync_food_menus');
        if (localMenus) setFoodMenus(JSON.parse(localMenus));
      }

      // Restore Settings (Room Budget) from Firebase
      const budgetSetting = sharedSettings.find(s => s.id === 'budget');
      if (budgetSetting && budgetSetting.amount) {
        setRoomBudget(budgetSetting.amount);
      }

      setLoading(false);
    }
    loadData();
  }, []);

  // Add XP Helper
  const awardXP = (user, amount, reason) => {
    setUsers(prev => {
      const userData = prev[user];
      if (!userData) return prev;

      let newXp = userData.xp + amount;
      let newLevel = userData.level;
      let xpNext = userData.xpNext;

      if (newXp >= xpNext) {
        newXp -= xpNext;
        newLevel += 1;
        xpNext = Math.floor(xpNext * 1.5);
        addNotificationSystem(`🎉 LEVEL UP! ${user} reached Level ${newLevel}!`, 'badge');
      }

      const updatedUser = {
        ...userData,
        id: user,
        xp: newXp,
        level: newLevel,
        xpNext: xpNext,
        performanceScore: Math.min(100, userData.performanceScore + 1)
      };

      if (newLevel >= 3 && !userData.badges.includes('Smart Planner')) {
        updatedUser.badges.push('Smart Planner');
      }
      
      saveToUserCollection(user, 'users', user, updatedUser);
      return { ...prev, [user]: updatedUser };
    });

    if (amount > 0) {
      addNotificationSystem(`⚡ ${user} gained +${amount} XP (${reason})`, 'badge');
    }
  };

  const addNotificationSystem = (text, type = 'system') => {
    const newNotif = {
      id: `not-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      text,
      type,
      time: 'Just now',
      read: false,
      owner: currentUser
    };
    setNotifications(prev => {
      const updated = [newNotif, ...prev].slice(0, 30);
      saveToUserCollection(currentUser, 'notifications', newNotif.id, newNotif);
      return updated;
    });
  };

  const dismissNotification = (id) => {
    setNotifications(prev => {
      const target = prev.find(n => n.id === id);
      if (target) {
        const updated = { ...target, read: true };
        saveToUserCollection(target.owner || currentUser, 'notifications', id, updated);
      }
      return prev.filter(n => n.id !== id);
    });
  };

  // 1. Expenses Operations
  const addExpense = (description, amount, category, paidBy, splitFor = 'shared') => {
    const newExpense = {
      id: `exp-${Date.now()}`,
      description,
      amount: parseFloat(amount),
      category,
      paidBy,
      splitFor,
      date: new Date().toISOString().split('T')[0],
      settled: false,
      owner: currentUser
    };

    setExpenses(prev => [newExpense, ...prev]);
    saveToUserCollection(currentUser, 'expenses', newExpense.id, newExpense);

    awardXP(paidBy, 50, 'Added room expense');
    addNotificationSystem(`${paidBy} added ${description} (₹${amount})`, 'expense');
    addChatMessage('System', `💰 New Expense: ${paidBy} paid ₹${amount} for "${description}". Autospilt splits it 50-50.`);
  };

  const settleExpenses = (debtor, creditor) => {
    setExpenses(prev => {
      const updated = prev.map(exp => {
        if (exp.paidBy === creditor && !exp.settled) {
          const settledExp = { ...exp, settled: true };
          // It was saved under the owner originally, but here we just resave under current user for simplicity or original owner if known.
          // In a real app we'd track the original owner path. We'll save it to the current user's path.
          saveToUserCollection(exp.owner || currentUser, 'expenses', exp.id, settledExp);
          return settledExp;
        }
        return exp;
      });
      return updated;
    });

    awardXP(debtor, 100, 'Settled roommate debts');
    addNotificationSystem(`🤝 ${debtor} settled all debts with ${creditor}`, 'expense');
    addChatMessage('System', `🤝 Settlement: ${debtor} settled all due debts with ${creditor}!`);
  };

  const deleteExpense = (id) => {
    setExpenses(prev => {
      const item = prev.find(i => i.id === id);
      if (item) deleteFromUserCollection(item.owner || currentUser, 'expenses', id);
      return prev.filter(e => e.id !== id);
    });
  };

  const editExpense = (id, updatedData) => {
    setExpenses(prev => {
      return prev.map(exp => {
        if (exp.id === id) {
          const updated = { ...exp, ...updatedData };
          saveToUserCollection(exp.owner || currentUser, 'expenses', id, updated);
          return updated;
        }
        return exp;
      });
    });
  };

  // 2. Groceries Operations
  const addGrocery = (name, quantity, category, price) => {
    const newItem = {
      id: `groc-${Date.now()}`,
      name,
      quantity,
      category,
      price: parseFloat(price) || 0,
      purchased: false,
      status: 'Normal',
      owner: currentUser
    };

    setGroceries(prev => [...prev, newItem]);
    saveToUserCollection(currentUser, 'groceries', newItem.id, newItem);
    addNotificationSystem(`🛒 Added ${name} to grocery list`, 'grocery');
  };

  const editGrocery = (id, updatedData) => {
    setGroceries(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const updated = { ...item, ...updatedData };
          saveToUserCollection(item.owner || currentUser, 'groceries', id, updated);
          return updated;
        }
        return item;
      });
    });
  };

  const toggleGroceryPurchased = (id) => {
    setGroceries(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const nextState = !item.purchased;
          if (nextState) {
            setTimeout(() => awardXP(currentUser, 30, `Bought ${item.name}`), 10);
            addNotificationSystem(`✅ ${currentUser} purchased ${item.name}`, 'grocery');
          }
          const updatedItem = { ...item, purchased: nextState, status: 'Normal' };
          saveToUserCollection(item.owner || currentUser, 'groceries', item.id, updatedItem);
          return updatedItem;
        }
        return item;
      });
    });
  };

  const updateGroceryStatus = (id, newStatus) => {
    setGroceries(prev => {
      return prev.map(item => {
        if (item.id === id) {
          if (newStatus === 'Low' || newStatus === 'Out of Stock') {
            addNotificationSystem(`⚠️ ${item.name} status is ${newStatus}!`, 'grocery');
          }
          const updatedItem = { ...item, status: newStatus };
          saveToUserCollection(item.owner || currentUser, 'groceries', item.id, updatedItem);
          return updatedItem;
        }
        return item;
      });
    });
  };

  const removeGrocery = (id) => {
    setGroceries(prev => {
      const item = prev.find(i => i.id === id);
      if (item) deleteFromUserCollection(item.owner || currentUser, 'groceries', id);
      return prev.filter(i => i.id !== id);
    });
  };

  // 3. Alarm Operations
  const addAlarm = (time, label, type, owner, days) => {
    const newAlarm = {
      id: `al-${Date.now()}`,
      time,
      label,
      type,
      owner,
      days,
      active: true,
      creator: currentUser
    };
    setAlarms(prev => [...prev, newAlarm]);
    saveToUserCollection(currentUser, 'alarms', newAlarm.id, newAlarm);
    addNotificationSystem(`⏰ Alarm scheduled: "${label}" at ${time}`, 'alarm');
  };

  const toggleAlarmActive = (id) => {
    setAlarms(prev => {
      return prev.map(al => {
        if (al.id === id) {
          const updatedAl = { ...al, active: !al.active };
          saveToUserCollection(al.creator || currentUser, 'alarms', al.id, updatedAl);
          return updatedAl;
        }
        return al;
      });
    });
  };

  const removeAlarm = (id) => {
    setAlarms(prev => {
      const item = prev.find(i => i.id === id);
      if (item) deleteFromUserCollection(item.creator || currentUser, 'alarms', id);
      return prev.filter(al => al.id !== id);
    });
  };

  // 4. Chat Messages Operations
  const addChatMessage = (sender, content, type = 'user', attachment = null) => {
    const newMsg = {
      id: `chat-${Date.now()}`,
      sender,
      content,
      timestamp: new Date().toISOString(),
      type,
      attachment,
      owner: currentUser
    };
    setChatMessages(prev => [...prev, newMsg]);
    saveToUserCollection(currentUser, 'chatMessages', newMsg.id, newMsg);

    // AI Bots Integration
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('@chatgpt')) {
      setTimeout(() => {
        addChatMessage('ChatGPT', 'I am here to help! What study questions do you have? 📚', 'ai');
      }, 1000);
    } else if (lowerContent.includes('@gemini')) {
      setTimeout(() => {
        addChatMessage('Gemini', 'Research core online. Provide the topic you want to dive into! 🔍', 'ai');
      }, 1000);
    } else if (lowerContent.includes('@claude')) {
      setTimeout(() => {
        addChatMessage('Claude', 'Ready to assist with writing tasks or summaries! ✍️', 'ai');
      }, 1000);
    }
  };

  // 5. Tasks / Chores Operations
  const addTask = (title, assignee, date) => {
    const newTask = {
      id: `task-${Date.now()}`,
      title,
      assignee,
      date: date || new Date().toISOString().split('T')[0],
      completed: false,
      owner: currentUser
    };
    setTasks(prev => [...prev, newTask]);
    saveToUserCollection(currentUser, 'tasks', newTask.id, newTask);
    addNotificationSystem(`📋 Task added: "${title}" assigned to ${assignee}`, 'task');
  };

  const toggleTask = (id) => {
    setTasks(prev => {
      return prev.map(task => {
        if (task.id === id) {
          const nextCompleted = !task.completed;
          if (nextCompleted) {
            const workers = task.assignee === 'both' ? ['Sameer', 'Rifaas'] : [task.assignee];
            workers.forEach(w => {
              setTimeout(() => awardXP(w, 40, `Completed task: ${task.title}`), 10);
            });
            addNotificationSystem(`✓ ${task.assignee} completed "${task.title}"`, 'task');
          }
          const updatedTask = { ...task, completed: nextCompleted };
          saveToUserCollection(task.owner || currentUser, 'tasks', task.id, updatedTask);
          return updatedTask;
        }
        return task;
      });
    });
  };

  const deleteTask = (id) => {
    setTasks(prev => {
      const item = prev.find(i => i.id === id);
      if (item) deleteFromUserCollection(item.owner || currentUser, 'tasks', id);
      return prev.filter(t => t.id !== id);
    });
  };

  const logStudyHours = (hours) => {
    setUsers(prev => {
      const user = prev[currentUser];
      if (!user) return prev;
      const updatedUser = {
        ...user,
        id: currentUser,
        studyHours: parseFloat((user.studyHours + hours).toFixed(1))
      };
      saveToUserCollection(currentUser, 'users', currentUser, updatedUser);
      return { ...prev, [currentUser]: updatedUser };
    });
    awardXP(currentUser, Math.round(hours * 30), `Studied for ${hours.toFixed(1)} hrs`);
  };

  // 6. Study / Files Operations
  const addSubject = (name) => {
    const newSubject = {
      id: `sub-${Date.now()}`,
      name,
      owner: currentUser
    };
    setSubjects(prev => [...prev, newSubject]);
    saveToUserCollection(currentUser, 'subjects', newSubject.id, newSubject);
    addNotificationSystem(`📚 Added subject: ${name}`, 'system');
  };

  const deleteSubject = (id) => {
    setSubjects(prev => {
      deleteFromUserCollection(currentUser, 'subjects', id);
      return prev.filter(s => s.id !== id);
    });
  };

  const uploadFile = (fileDetails) => {
    const fileOwner = fileDetails.owner || currentUser;
    const newFile = {
      id: `file-${Date.now()}`,
      ...fileDetails, // contains name, subject, size
      date: new Date().toISOString().split('T')[0],
      owner: fileOwner
    };
    setStudyFiles(prev => [...prev, newFile]);
    saveToUserCollection(fileOwner, 'files', newFile.id, newFile);
    addNotificationSystem(`📄 Uploaded file: ${fileDetails.name}`, 'system');
    awardXP(fileOwner, 15, `Uploaded study material`);
  };

  const deleteFile = (id) => {
    setStudyFiles(prev => {
      deleteFromUserCollection(currentUser, 'files', id);
      return prev.filter(f => f.id !== id);
    });
  };

  const renameFile = (id, newName) => {
    setStudyFiles(prev => {
      const updated = prev.map(f => {
        if (f.id === id) {
          const renamed = { ...f, name: newName };
          saveToUserCollection(f.owner, 'files', f.id, renamed);
          return renamed;
        }
        return f;
      });
      return updated;
    });
  };

  // Food Menu helpers
  const saveFoodMenu = (dateKey, menuData) => {
    const updated = { ...foodMenus, [dateKey]: menuData };
    setFoodMenus(updated);
    localStorage.setItem('roommate_sync_food_menus', JSON.stringify(updated));
    saveToUserCollection('shared', 'foodMenus', dateKey, menuData);
  };

  const loadFoodMenu = (dateKey) => {
    return foodMenus[dateKey] || null;
  };

  return {
    users,
    expenses,
    addExpense,
    settleExpenses,
    deleteExpense,
    editExpense,
    groceries,
    addGrocery,
    editGrocery,
    toggleGroceryPurchased,
    updateGroceryStatus,
    removeGrocery,
    alarms,
    addAlarm,
    toggleAlarmActive,
    removeAlarm,
    chatMessages,
    addChatMessage,
    tasks,
    addTask,
    toggleTask,
    deleteTask,
    currentUser,
    setCurrentUser,
    notifications,
    addNotificationSystem,
    dismissNotification,
    logStudyHours,
    subjects,
    addSubject,
    deleteSubject,
    studyFiles,
    uploadFile,
    deleteFile,
    renameFile,
    walletDeposits,
    addDeposit: (amount) => {
      const newDeposit = {
        id: `dep-${Date.now()}`,
        user: currentUser,
        amount: parseFloat(amount),
        date: new Date().toISOString().split('T')[0]
      };
      setWalletDeposits(prev => [...prev, newDeposit]);
      saveToUserCollection(currentUser, 'walletDeposits', newDeposit.id, newDeposit);
      addNotificationSystem(`${currentUser} deposited ₹${amount} to the Room Wallet`, 'system');
      awardXP(currentUser, 20, `Deposited to wallet`);
    },
    editDeposit: (id, newAmount) => {
      setWalletDeposits(prev => prev.map(dep => {
        if (dep.id === id) {
          const updated = { ...dep, amount: parseFloat(newAmount) };
          saveToUserCollection(dep.user, 'walletDeposits', id, updated);
          return updated;
        }
        return dep;
      }));
    },
    deleteDeposit: (id) => {
      setWalletDeposits(prev => {
        const item = prev.find(i => i.id === id);
        if (item) deleteFromUserCollection(item.user, 'walletDeposits', id);
        return prev.filter(i => i.id !== id);
      });
    },
    roomBudget,
    setRoomBudget: (newBudget) => {
      setRoomBudget(newBudget);
      saveToUserCollection('shared', 'settings', 'budget', { amount: newBudget });
    },
    foodMenus,
    saveFoodMenu,
    loadFoodMenu,
    loading
  };
}
