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
    badges: ['Smart Planner']
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
    badges: ['Saver King', 'Clean Budget Master']
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

export function useRoomState() {
  const [currentUser, setCurrentUser] = useState('Sameer');
  const [users, setUsers] = useState({});
  const [expenses, setExpenses] = useState([]);
  const [groceries, setGroceries] = useState([]);
  const [alarms, setAlarms] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load from database / local storage on mount
  useEffect(() => {
    async function loadData() {
      // Fetch for both users
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
          notifData: await fetchUserCollection(u, 'notifications')
        };
      }));

      let mergedUsers = {};
      let mergedExpenses = [];
      let mergedGroceries = [];
      let mergedAlarms = [];
      let mergedChat = [];
      let mergedTasks = [];
      let mergedNotif = [];

      allData.forEach(d => {
        d.usersData.forEach(u => mergedUsers[u.id] = u);
        mergedExpenses.push(...d.expensesData);
        mergedGroceries.push(...d.groceriesData);
        mergedAlarms.push(...d.alarmsData);
        mergedChat.push(...d.chatData);
        mergedTasks.push(...d.tasksData);
        mergedNotif.push(...d.notifData);
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
      id: `not-${Date.now()}`,
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

  // 1. Expenses Operations
  const addExpense = (description, amount, category, paidBy) => {
    const newExpense = {
      id: `exp-${Date.now()}`,
      description,
      amount: parseFloat(amount),
      category,
      paidBy,
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

  return {
    users,
    expenses,
    addExpense,
    settleExpenses,
    groceries,
    addGrocery,
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
    logStudyHours,
    loading
  };
}
