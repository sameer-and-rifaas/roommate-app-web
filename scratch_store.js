import { useState, useEffect } from 'react';
import { fetchCollection, saveToCollection, deleteFromCollection } from './firebase';

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
      const [
        usersData, expensesData, groceriesData, 
        alarmsData, chatData, tasksData, notifData
      ] = await Promise.all([
        fetchCollection('users'),
        fetchCollection('expenses'),
        fetchCollection('groceries'),
        fetchCollection('alarms'),
        fetchCollection('chatMessages'),
        fetchCollection('tasks'),
        fetchCollection('notifications')
      ]);

      let finalUsers = {};
      usersData.forEach(u => finalUsers[u.id] = u);
      if (Object.keys(finalUsers).length === 0) {
        finalUsers = initialUsers;
        Object.keys(initialUsers).forEach(id => saveToCollection('users', id, initialUsers[id]));
      }
      setUsers(finalUsers);

      const finalExpenses = expensesData.length > 0 ? expensesData : initialExpenses;
      if (expensesData.length === 0) initialExpenses.forEach(x => saveToCollection('expenses', x.id, x));
      setExpenses(finalExpenses);

      const finalGroceries = groceriesData.length > 0 ? groceriesData : initialGroceries;
      if (groceriesData.length === 0) initialGroceries.forEach(x => saveToCollection('groceries', x.id, x));
      setGroceries(finalGroceries);

      const finalAlarms = alarmsData.length > 0 ? alarmsData : initialAlarms;
      if (alarmsData.length === 0) initialAlarms.forEach(x => saveToCollection('alarms', x.id, x));
      setAlarms(finalAlarms);

      const finalChat = chatData.length > 0 ? chatData : initialChatMessages;
      if (chatData.length === 0) initialChatMessages.forEach(x => saveToCollection('chatMessages', x.id, x));
      setChatMessages(finalChat);

      const finalTasks = tasksData.length > 0 ? tasksData : initialTasks;
      if (tasksData.length === 0) initialTasks.forEach(x => saveToCollection('tasks', x.id, x));
      setTasks(finalTasks);

      const finalNotif = notifData.length > 0 ? notifData : initialNotifications;
      if (notifData.length === 0) initialNotifications.forEach(x => saveToCollection('notifications', x.id, x));
      setNotifications(finalNotif);
      
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
      
      saveToCollection('users', user, updatedUser);

      return { ...prev, [user]: updatedUser };
    });

    if (amount > 0) {
      addNotificationSystem(`⚡ ${user} gained +${amount} XP (${reason})`, 'badge');
    }
  };

  // Notifications system helper
  const addNotificationSystem = (text, type = 'system') => {
    const newNotif = {
      id: `not-${Date.now()}`,
      text,
      type,
      time: 'Just now',
      read: false
    };
    setNotifications(prev => {
      const updated = [newNotif, ...prev].slice(0, 30);
      saveToCollection('notifications', newNotif.id, newNotif);
      // For simplicity, not deleting old ones automatically here
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
      settled: false
    };

    setExpenses(prev => [newExpense, ...prev]);
    saveToCollection('expenses', newExpense.id, newExpense);

    awardXP(paidBy, 50, 'Added room expense');
    addNotificationSystem(`${paidBy} added ${description} (₹${amount})`, 'expense');
    addChatMessage('System', `💰 New Expense: ${paidBy} paid ₹${amount} for "${description}". Autospilt splits it 50-50.`);
  };

  const settleExpenses = (debtor, creditor) => {
    setExpenses(prev => {
      const updated = prev.map(exp => {
        if (exp.paidBy === creditor && !exp.settled) {
          const settledExp = { ...exp, settled: true };
          saveToCollection('expenses', exp.id, settledExp);
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
      status: 'Normal'
    };

    setGroceries(prev => [...prev, newItem]);
    saveToCollection('groceries', newItem.id, newItem);
    addNotificationSystem(`🛒 Added ${name} to grocery list`, 'grocery');
  };

  const toggleGroceryPurchased = (id) => {
    setGroceries(prev => {
      const updated = prev.map(item => {
        if (item.id === id) {
          const nextState = !item.purchased;
          if (nextState) {
            setTimeout(() => awardXP(currentUser, 30, `Bought ${item.name}`), 10);
            addNotificationSystem(`✅ ${currentUser} purchased ${item.name}`, 'grocery');
          }
          const updatedItem = { ...item, purchased: nextState, status: 'Normal' };
          saveToCollection('groceries', item.id, updatedItem);
          return updatedItem;
        }
        return item;
      });
      return updated;
    });
  };

  const updateGroceryStatus = (id, newStatus) => {
    setGroceries(prev => {
      const updated = prev.map(item => {
        if (item.id === id) {
          if (newStatus === 'Low' || newStatus === 'Out of Stock') {
            addNotificationSystem(`⚠️ ${item.name} status is ${newStatus}!`, 'grocery');
          }
          const updatedItem = { ...item, status: newStatus };
          saveToCollection('groceries', item.id, updatedItem);
          return updatedItem;
        }
        return item;
      });
      return updated;
    });
  };

  const removeGrocery = (id) => {
    setGroceries(prev => prev.filter(item => item.id !== id));
    deleteFromCollection('groceries', id);
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
      active: true
    };
    setAlarms(prev => [...prev, newAlarm]);
    saveToCollection('alarms', newAlarm.id, newAlarm);
    addNotificationSystem(`⏰ Alarm scheduled: "${label}" at ${time}`, 'alarm');
  };

  const toggleAlarmActive = (id) => {
    setAlarms(prev => {
      return prev.map(al => {
        if (al.id === id) {
          const updatedAl = { ...al, active: !al.active };
          saveToCollection('alarms', al.id, updatedAl);
          return updatedAl;
        }
        return al;
      });
    });
  };

  const removeAlarm = (id) => {
    setAlarms(prev => prev.filter(al => al.id !== id));
    deleteFromCollection('alarms', id);
  };

  // 4. Chat Messages Operations
  const addChatMessage = (sender, content, type = 'user', attachment = null) => {
    const newMsg = {
      id: `chat-${Date.now()}`,
      sender,
      content,
      timestamp: new Date().toISOString(),
      type,
      attachment
    };
    setChatMessages(prev => [...prev, newMsg]);
    saveToCollection('chatMessages', newMsg.id, newMsg);
  };

  // 5. Tasks / Chores Operations
  const addTask = (title, assignee, date) => {
    const newTask = {
      id: `task-${Date.now()}`,
      title,
      assignee,
      date: date || new Date().toISOString().split('T')[0],
      completed: false
    };
    setTasks(prev => [...prev, newTask]);
    saveToCollection('tasks', newTask.id, newTask);
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
          saveToCollection('tasks', task.id, updatedTask);
          return updatedTask;
        }
        return task;
      });
    });
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    deleteFromCollection('tasks', id);
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
      saveToCollection('users', currentUser, updatedUser);
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
