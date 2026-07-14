import React, { useState } from 'react';
import { Award, Zap, BookOpen, AlertTriangle, Calendar, CheckSquare, Plus, Bell, RefreshCw, ChefHat, Pencil } from 'lucide-react';
import CustomChart from '../components/CustomChart';

export default function DashboardView({ 
  users, 
  currentUser, 
  setCurrentUser, 
  expenses, 
  groceries, 
  alarms, 
  tasks, 
  addTask, 
  toggleTask, 
  deleteTask, 
  notifications, 
  logStudyHours, 
  addNotificationSystem,
  walletDeposits = [],
  foodMenus = {},
  saveFoodMenu,
  toggleGroceryPurchased
}) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('Sameer');

  // Today's food menu — inline editable
  const todayKey = new Date().toISOString().split('T')[0];
  const todayMenu = foodMenus[todayKey] || { breakfast: { option1: '', option2: '' }, lunch: { option1: '', option2: '' }, dinner: { option1: '', option2: '' } };
  const [foodEditing, setFoodEditing] = useState(null); // e.g. 'breakfast_1'
  const [foodInput, setFoodInput]     = useState('');

  const startFoodEdit = (mealKey, optNum, curVal) => {
    setFoodEditing(`${mealKey}_${optNum}`);
    setFoodInput(curVal || '');
  };

  const saveFoodEdit = (mealKey, optNum) => {
    if (!saveFoodMenu) return;
    const updated = {
      ...todayMenu,
      [mealKey]: { ...(todayMenu[mealKey] || {}), [`option${optNum}`]: foodInput.trim() }
    };
    saveFoodMenu(todayKey, updated);
    setFoodEditing(null);
    setFoodInput('');
  };

  const clearFoodOption = (mealKey, optNum) => {
    if (!saveFoodMenu) return;
    const updated = {
      ...todayMenu,
      [mealKey]: { ...(todayMenu[mealKey] || {}), [`option${optNum}`]: '' }
    };
    saveFoodMenu(todayKey, updated);
  };

  const MEAL_META = [
    { key: 'breakfast', emoji: '🌅', label: 'Breakfast', color: '#F59E0B', rgb: '245,158,11' },
    { key: 'lunch',     emoji: '☀️', label: 'Lunch',     color: '#10B981', rgb: '16,185,129' },
    { key: 'dinner',    emoji: '🌙', label: 'Dinner',    color: '#A855F7', rgb: '168,85,247' },
  ];

  // Compute expense balances for room overview widget
  const totalDeposits = walletDeposits.reduce((acc, dep) => acc + dep.amount, 0);
  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const walletBalance = totalDeposits - totalExpenses;

  // Expense Category Totals
  const categoryTotals = {};
  expenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });
  
  // Weekly analytics data sets
  const studyHoursData = [users.Sameer.studyHours, users.Rifaas.studyHours];
  
  // Tasks calculations
  const pendingTasks = tasks.filter(t => !t.completed);
  
  // Grocery warning count
  const groceryAlerts = groceries.filter(g => g.status === 'Low' || g.status === 'Out of Stock');

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask(newTaskTitle, newTaskAssignee);
    setNewTaskTitle('');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
      
      {/* HEADER CONTROLS */}
      <div className="cyber-card" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', background: 'var(--primary-light)' }}>
        <div>
          <h1 style={{ color: 'var(--primary)', fontSize: '2rem', fontWeight: '800' }}>Roommate Dashboard</h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Welcome home! Here's a summary of what's happening.</p>
        </div>
        
        {/* User Switcher HUD */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.8rem 1.2rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-main)' }}>Current User:</span>
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            {Object.keys(users).map(username => (
              <button
                key={username}
                onClick={() => setCurrentUser(username)}
                className={`cyber-btn ${currentUser === username ? (username === 'Sameer' ? 'cyber-btn' : 'cyber-btn-purple') : 'cyber-btn-secondary'}`}
                style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
              >
                <img 
                  src={users[username].avatar} 
                  alt={username} 
                  style={{ width: '24px', height: '24px', borderRadius: '50%', marginRight: '8px', border: '1px solid #ccc' }} 
                />
                {username}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ROOMMATE GAMIFIED STATS DISPLAY */}
      <div className="mobile-grid">
        
        {/* User 1 Card: Sameer */}
        <div className="cyber-card" style={{ borderTop: '5px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <img 
                  src={users.Sameer.avatar} 
                  alt="Sameer" 
                  style={{ width: '70px', height: '70px', borderRadius: '50%', border: '3px solid var(--primary)', background: '#fff' }} 
                />
                <span style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--primary)', color: '#fff', fontWeight: 'bold', fontSize: '0.85rem', padding: '0.2rem 0.5rem', borderRadius: '20px', border: '2px solid #fff' }}>
                  Lvl {users.Sameer.level}
                </span>
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}>Sameer</h3>
                <span className="cyber-badge badge-cyan" style={{ fontSize: '0.8rem', marginTop: '0.4rem' }}>
                  XP: {users.Sameer.xp} / {users.Sameer.xpNext}
                </span>
              </div>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>SCORE</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)' }}>
                {users.Sameer.performanceScore}%
              </div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div style={{ background: '#e2e8f0', height: '10px', borderRadius: '5px', overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--primary)', height: '100%', width: `${(users.Sameer.xp / users.Sameer.xpNext) * 100}%` }}></div>
          </div>

          {/* User Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '1rem', textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Study Hours</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{users.Sameer.studyHours}h</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Tasks Done</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{users.Sameer.taskCompletionRate}%</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Activity</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{users.Sameer.expenseActivityScore}</div>
            </div>
          </div>

          {/* Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            {users.Sameer.badges.map(badge => (
              <span key={badge} className="cyber-badge badge-cyan" style={{ fontSize: '0.8rem' }}>
                <Award size={14} /> {badge}
              </span>
            ))}
            {users.Sameer.badges.length === 0 && <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>No badges unlocked yet</span>}
          </div>
        </div>

        {/* User 2 Card: Rifaas */}
        <div className="cyber-card" style={{ borderTop: '5px solid var(--secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <img 
                  src={users.Rifaas.avatar} 
                  alt="Rifaas" 
                  style={{ width: '70px', height: '70px', borderRadius: '50%', border: '3px solid var(--secondary)', background: '#fff' }} 
                />
                <span style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--secondary)', color: '#fff', fontWeight: 'bold', fontSize: '0.85rem', padding: '0.2rem 0.5rem', borderRadius: '20px', border: '2px solid #fff' }}>
                  Lvl {users.Rifaas.level}
                </span>
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}>Rifaas</h3>
                <span className="cyber-badge badge-purple" style={{ fontSize: '0.8rem', marginTop: '0.4rem' }}>
                  XP: {users.Rifaas.xp} / {users.Rifaas.xpNext}
                </span>
              </div>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>SCORE</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--secondary)' }}>
                {users.Rifaas.performanceScore}%
              </div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div style={{ background: '#e2e8f0', height: '10px', borderRadius: '5px', overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={{ background: 'var(--secondary)', height: '100%', width: `${(users.Rifaas.xp / users.Rifaas.xpNext) * 100}%` }}></div>
          </div>

          {/* User Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '1rem', textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Study Hours</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{users.Rifaas.studyHours}h</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Tasks Done</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{users.Rifaas.taskCompletionRate}%</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Activity</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{users.Rifaas.expenseActivityScore}</div>
            </div>
          </div>

          {/* Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            {users.Rifaas.badges.map(badge => (
              <span key={badge} className="cyber-badge badge-purple" style={{ fontSize: '0.8rem' }}>
                <Award size={14} /> {badge}
              </span>
            ))}
            {users.Rifaas.badges.length === 0 && <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>No badges unlocked yet</span>}
          </div>
        </div>

      </div>

      {/* MIDDLE ANALYTICS ROW */}
      <div className="mobile-grid">
        
        {/* TODAY'S FOOD CORNER — INLINE EDITABLE */}
        <div className="cyber-card" style={{
          background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(168,85,247,0.06))',
          border: '1px solid rgba(245,158,11,0.2)'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.3rem' }}>🍽️</span>
            <div>
              <div style={{ fontWeight: '800', fontSize: '0.95rem', fontFamily: 'var(--font-heading)', color: '#F59E0B' }}>Today's Food</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
            </div>
          </div>

          {/* Meal rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {MEAL_META.map(meal => {
              const mealData = todayMenu[meal.key] || { option1: '', option2: '' };
              return (
                <div key={meal.key} style={{
                  padding: '0.75rem',
                  background: `rgba(${meal.rgb},0.06)`,
                  borderRadius: '12px',
                  border: `1px solid rgba(${meal.rgb},0.2)`
                }}>
                  {/* Meal title */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem' }}>{meal.emoji}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: '800', color: meal.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{meal.label}</span>
                  </div>

                  {/* Two options */}
                  {[1, 2].map(optNum => {
                    const editKey = `${meal.key}_${optNum}`;
                    const isEditing = foodEditing === editKey;
                    const val = mealData[`option${optNum}`] || '';

                    return (
                      <div key={optNum} style={{ marginBottom: optNum === 1 ? '0.4rem' : 0 }}>
                        {isEditing ? (
                          /* ── EDIT MODE ── */
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            <input
                              autoFocus
                              className="cyber-input"
                              placeholder={`Option ${optNum} — e.g. Idli, Dosa...`}
                              value={foodInput}
                              onChange={e => setFoodInput(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter')  saveFoodEdit(meal.key, optNum);
                                if (e.key === 'Escape') { setFoodEditing(null); setFoodInput(''); }
                              }}
                              style={{ fontSize: '0.82rem', padding: '0.4rem 0.65rem', flex: 1 }}
                            />
                            <button
                              onClick={() => saveFoodEdit(meal.key, optNum)}
                              style={{ background: meal.color, border: 'none', borderRadius: '8px', color: '#000', cursor: 'pointer', padding: '0.4rem 0.55rem', fontWeight: '800', fontSize: '0.85rem', flexShrink: 0 }}
                            >✓</button>
                            <button
                              onClick={() => { setFoodEditing(null); setFoodInput(''); }}
                              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.4rem 0.55rem', flexShrink: 0 }}
                            >✕</button>
                          </div>
                        ) : (
                          /* ── DISPLAY MODE — click to edit ── */
                          <div
                            onClick={() => startFoodEdit(meal.key, optNum, val)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '0.5rem',
                              padding: '0.4rem 0.65rem',
                              background: val ? `rgba(${meal.rgb},0.1)` : 'rgba(255,255,255,0.03)',
                              border: `1px dashed ${val ? `rgba(${meal.rgb},0.35)` : 'rgba(255,255,255,0.1)'}`,
                              borderRadius: '8px',
                              cursor: 'pointer',
                              transition: 'all 0.18s',
                              minHeight: '34px'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = `rgba(${meal.rgb},0.14)`}
                            onMouseLeave={e => e.currentTarget.style.background = val ? `rgba(${meal.rgb},0.1)` : 'rgba(255,255,255,0.03)'}
                          >
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', fontWeight: '600', flexShrink: 0 }}>
                              {optNum === 1 ? '①' : '②'}
                            </span>
                            {val ? (
                              <>
                                <span style={{ flex: 1, fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)' }}>{val}</span>
                                <button
                                  onClick={e => { e.stopPropagation(); clearFoodOption(meal.key, optNum); }}
                                  style={{ background: 'transparent', border: 'none', color: 'rgba(239,68,68,0.6)', cursor: 'pointer', padding: 0, fontSize: '0.75rem', lineHeight: 1, flexShrink: 0 }}
                                  title="Clear"
                                >✕</button>
                              </>
                            ) : (
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', fontStyle: 'italic' }}>
                                Tap to add option {optNum}...
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Expense Summary Panel */}
        <div className="cyber-card cyber-card-purple" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontFamily: 'var(--font-hud)', color: 'var(--neon-purple)', marginBottom: '1rem', letterSpacing: '1px' }}>💸 EXPENSE BREAKDOWN</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', flex: 1 }}>
            {Object.keys(categoryTotals).map(cat => (
              <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', borderLeft: '3px solid var(--neon-purple)' }}>
                <span style={{ color: 'var(--text-muted)' }}>{cat}</span>
                <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>₹{categoryTotals[cat].toFixed(2)}</span>
              </div>
            ))}
            {Object.keys(categoryTotals).length === 0 && (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>No expenses recorded yet.</div>
            )}
          </div>
          
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>TOTAL SPENT:</span>
            <span style={{ fontWeight: 'bold', color: 'var(--danger)' }}>₹{totalExpenses.toFixed(2)}</span>
          </div>
        </div>

        {/* AI Quick Links Panel */}
        <div className="cyber-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
          <h3 style={{ color: 'var(--neon-cyan)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🤖 AI Assistants</h3>
          <a href="https://chatgpt.com" target="_blank" rel="noreferrer" className="cyber-btn cyber-btn-cyan" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}>ChatGPT</a>
          <a href="https://gemini.google.com" target="_blank" rel="noreferrer" className="cyber-btn cyber-btn-purple" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}>Google Gemini</a>
          <a href="https://claude.ai" target="_blank" rel="noreferrer" className="cyber-btn cyber-btn-pink" style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}>Claude AI</a>
        </div>

      </div>

      {/* BOTTOM HUB: CHORES / QUICK SUMMARY / RECENT ALERTS */}
      <div className="mobile-grid">
        
        {/* Grocery List System (Replaced To-Do) */}
        <div className="cyber-card" style={{ borderTop: '4px solid var(--success)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ color: 'var(--success)', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🛒 Grocery List</h3>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>{groceries.filter(g => !g.purchased).length} to buy</span>
          </div>

          <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
            {groceries.map(groc => (
              <div 
                key={groc.id} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '1rem', 
                  background: groc.purchased ? 'var(--success-light)' : 'rgba(255,255,255,0.05)', 
                  border: '1px solid',
                  borderColor: groc.purchased ? 'var(--success)' : 'var(--border-color)',
                  borderRadius: '8px', 
                  marginBottom: '0.8rem',
                  opacity: groc.purchased ? 0.7 : 1,
                  transition: '0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button 
                    onClick={() => toggleGroceryPurchased && toggleGroceryPurchased(groc.id)}
                    style={{ 
                      background: groc.purchased ? 'var(--success)' : '#fff',
                      border: `2px solid ${groc.purchased ? 'var(--success)' : '#ccc'}`,
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff'
                    }}
                    title={groc.purchased ? "Mark as not bought" : "Mark as bought"}
                  >
                    {groc.purchased && <CheckSquare size={16} />}
                  </button>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ 
                      fontSize: '1.1rem', 
                      fontWeight: '600',
                      textDecoration: groc.purchased ? 'line-through' : 'none',
                      color: groc.purchased ? 'var(--text-muted)' : 'var(--text-main)'
                    }}>
                      {groc.name}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{groc.quantity} • {groc.category}</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                    ₹{groc.price}
                  </span>
                </div>
              </div>
            ))}
            {groceries.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '1rem', padding: '2rem' }}>No groceries added yet! Go to the Grocery tab to add some.</div>
            )}
          </div>
        </div>

        {/* Quick Room Widgets Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Quick Balance Status */}
          <div className="cyber-card">
            <h4 style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '0.8rem', fontWeight: 'bold' }}>💰 Money Overview</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Pool Fund:</span>
                <span style={{ fontWeight: 'bold' }}>₹{totalDeposits.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Spent:</span>
                <span style={{ fontWeight: 'bold', color: 'var(--danger)' }}>₹{totalExpenses.toFixed(2)}</span>
              </div>
              <hr style={{ borderTop: '1px solid var(--border-color)', margin: '0.2rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>Remaining:</span>
                <span style={{ fontSize: '1.2rem', fontWeight: '800', color: walletBalance < 0 ? 'var(--danger)' : 'var(--neon-green)' }}>₹{walletBalance.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Quick Connect */}
          <div className="cyber-card">
            <h4 style={{ fontSize: '1rem', color: 'var(--success)', marginBottom: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={18} /> Quick Connect
            </h4>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <a href={`https://wa.me/${users.Sameer.whatsapp}`} target="_blank" rel="noreferrer" className="cyber-btn cyber-btn-cyan" style={{ flex: 1, justifyContent: 'center', textDecoration: 'none' }}>
                Chat Sameer
              </a>
              <a href={`https://wa.me/${users.Rifaas.whatsapp}`} target="_blank" rel="noreferrer" className="cyber-btn cyber-btn-purple" style={{ flex: 1, justifyContent: 'center', textDecoration: 'none' }}>
                Chat Rifaas
              </a>
            </div>
          </div>

          {/* Quick Grocery Status Warnings */}
          <div className="cyber-card" style={{ flex: 1, borderColor: groceryAlerts.length > 0 ? 'var(--danger)' : 'var(--border-color)' }}>
            <h4 style={{ fontSize: '1rem', color: 'var(--danger)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
              <AlertTriangle size={18} /> Need to Buy Soon
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {groceryAlerts.slice(0, 3).map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', background: 'var(--danger-light)', padding: '0.5rem 0.8rem', borderRadius: '6px', borderLeft: '4px solid var(--danger)' }}>
                  <span style={{ fontWeight: '600' }}>{item.name}</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--danger)' }}>{item.status}</span>
                </div>
              ))}
              {groceryAlerts.length === 0 && (
                <p style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>We have enough groceries for now.</p>
              )}
            </div>
          </div>

        </div>

      </div>
      
    </div>
  );
}
