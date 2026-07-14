import React, { useState, useEffect } from 'react';
import { useRoomState } from './services/store';
import { Home, DollarSign, BrainCircuit, ShoppingCart, Bell, Award, MessageSquare, X, BookOpen, MoreHorizontal, Zap, Settings, Folder } from 'lucide-react';

// Views
import DashboardView from './views/DashboardView';
import ExpensesView from './views/ExpensesView';
import AIBrainView from './views/AIBrainView';
import GroceryView from './views/GroceryView';
import AlarmView from './views/AlarmView';
import AchievementsView from './views/AchievementsView';
import ChatView from './views/ChatView';
import StudyView from './views/StudyView';
import FoodView from './views/FoodView';

export default function App() {
  const roomState = useRoomState();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [prevTab, setPrevTab] = useState('Dashboard');

  const switchTab = (tab) => {
    setPrevTab(activeTab);
    setActiveTab(tab);
    setShowMoreMenu(false);
  };

  // Auto-dismiss notifications after 3 seconds
  useEffect(() => {
    const unread = roomState.notifications.filter(n => !n.read);
    if (unread.length > 0) {
      unread.forEach(notif => {
        setTimeout(() => roomState.dismissNotification(notif.id), 3000);
      });
    }
  }, [roomState.notifications]);

  if (roomState.loading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '1.5rem',
        background: 'var(--bg-color)'
      }}>
        {/* Animated loader */}
        <div style={{ position: 'relative' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            border: '3px solid rgba(79,134,247,0.15)',
            borderTop: '3px solid var(--primary)',
            animation: 'spin 0.8s linear infinite'
          }} />
          <div style={{
            position: 'absolute', inset: '12px', borderRadius: '50%',
            border: '3px solid rgba(168,85,247,0.15)',
            borderBottom: '3px solid var(--secondary)',
            animation: 'spin 1.2s linear infinite reverse'
          }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.3rem' }}>
            Roommate Sync
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Connecting to cloud...</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const currentUserData = roomState.users[roomState.currentUser] || {};
  const unreadCount = roomState.notifications.filter(n => !n.read).length;

  const bottomTabs = [
    { name: 'Dashboard', icon: <Home size={22} />,          label: 'Home',     color: '#6c63ff', rgb: '108,99,255' },
    { name: 'Expenses',  icon: <DollarSign size={22} />,    label: 'Expenses', color: '#6c63ff', rgb: '108,99,255' },
    { name: 'Study',     icon: <BookOpen size={22} />,      label: 'Study',    color: '#06b6d4', rgb: '6,182,212' },
    { name: 'Grocery',   icon: <ShoppingCart size={22} />,  label: 'Grocery',  color: '#06b6d4', rgb: '6,182,212' },
    { name: 'Chat',      icon: <MessageSquare size={22} />, label: 'Chat',     color: '#8b5cf6', rgb: '139,92,246' },
  ];

  const moreItems = [
    { name: 'Food',      icon: <span style={{fontSize:'16px', lineHeight:1}}>🍽️</span>, color: '#10b981', rgb: '16,185,129' },
    { name: 'Alarms',    icon: <Bell size={18} />,          color: '#f59e0b', rgb: '245,158,11' },
    { name: 'Documents', icon: <Folder size={18} />,        color: '#06b6d4', rgb: '6,182,212' },
    { name: 'AI Brain',  icon: <BrainCircuit size={18} />,  color: '#6c63ff', rgb: '108,99,255' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#0a0f1e', color: '#f1f5f9', position: 'relative' }}>

      {/* ── PREMIUM GLASS TOP HEADER ── */}
      <header className="no-print" style={{
        position: 'fixed', top: 0, left: 0, right: 0, 
        height: 'calc(64px + env(safe-area-inset-top))',
        paddingTop: 'env(safe-area-inset-top)',
        background: 'linear-gradient(180deg, rgba(108,99,255,.12) 0%, rgba(10,15,30,0.95) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(108,99,255,0.18)',
        zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingLeft: '0.8rem', paddingRight: '0.8rem', gap: '0.5rem',
      }}>

        {/* Left: Logo + User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
          {/* App Logo */}
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #6c63ff, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(108,99,255,0.4)',
            flexShrink: 0
          }}>
            <Zap size={18} color="#fff" />
          </div>

          {/* User avatar + name */}
          <div 
            onClick={() => setShowProfileModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', padding: '0.3rem 0.5rem', borderRadius: '8px', background: showProfileModal ? 'rgba(255,255,255,0.05)' : 'transparent', transition: 'background 0.2s', marginLeft: '-0.3rem' }}
          >
            <div style={{ position: 'relative' }}>
              <img
                src={currentUserData.avatar}
                alt="avatar"
                style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #6c63ff', background: '#161d2f' }}
              />
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', background: 'var(--success)', borderRadius: '50%', border: '2px solid var(--bg-color)' }} />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: '700', fontFamily: 'var(--font-heading)', lineHeight: 1.2 }}>
                {roomState.currentUser}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--success)' }}>● Online</div>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          {moreItems.map(item => (
            <button
              key={item.name}
              onClick={() => switchTab(item.name)}
              title={item.name}
              style={{
                background: activeTab === item.name ? `rgba(${item.rgb},0.18)` : 'transparent',
                border: activeTab === item.name ? `1px solid rgba(${item.rgb},0.4)` : '1px solid transparent',
                borderRadius: '8px',
                color: activeTab === item.name ? item.color : 'var(--text-muted)',
                cursor: 'pointer', padding: '0.5rem',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center',
                filter: activeTab === item.name ? `drop-shadow(0 0 6px rgba(${item.rgb},0.5))` : 'none'
              }}
            >
              {item.icon}
            </button>
          ))}

          {/* User switcher */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              style={{
                background: showMoreMenu ? 'rgba(255,255,255,0.08)' : 'transparent',
                border: '1px solid transparent',
                borderRadius: '8px',
                color: 'var(--text-muted)', cursor: 'pointer',
                padding: '0.5rem',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center'
              }}
            >
              <MoreHorizontal size={20} />
            </button>

            {/* Dropdown */}
            {showMoreMenu && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                background: '#131929',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '0.75rem',
                minWidth: '180px',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 200,
                animation: 'slideDown 0.2s ease-out'
              }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem', padding: '0 0.25rem' }}>
                  Switch User
                </div>
                {Object.keys(roomState.users).map(username => (
                  <button
                    key={username}
                    onClick={() => { roomState.setCurrentUser(username); setShowMoreMenu(false); }}
                    style={{
                      width: '100%',
                      display: 'flex', alignItems: 'center', gap: '0.6rem',
                      background: roomState.currentUser === username ? 'rgba(79,134,247,0.12)' : 'transparent',
                      border: roomState.currentUser === username ? '1px solid rgba(79,134,247,0.25)' : '1px solid transparent',
                      borderRadius: 'var(--radius-sm)',
                      color: roomState.currentUser === username ? 'var(--primary)' : 'var(--text-main)',
                      cursor: 'pointer', padding: '0.5rem 0.6rem',
                      fontFamily: 'var(--font-heading)',
                      fontWeight: '600',
                      fontSize: '0.85rem',
                      transition: 'all 0.2s',
                      marginBottom: '0.25rem'
                    }}
                  >
                    <img src={roomState.users[username]?.avatar} alt={username} style={{ width: '22px', height: '22px', borderRadius: '50%' }} />
                    {username}
                    {roomState.currentUser === username && <span style={{ marginLeft: 'auto', fontSize: '0.65rem', background: 'var(--primary)', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Active</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Close more menu on outside click */}
      {showMoreMenu && (
        <div onClick={() => setShowMoreMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 150 }} />
      )}

      {/* ── MAIN CONTENT ── */}
      <main style={{
        position: 'fixed',
        top: 'calc(64px + env(safe-area-inset-top))',
        bottom: 'calc(68px + env(safe-area-inset-bottom))',
        left: 0,
        right: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        padding: '1rem 0.6rem',
        scrollBehavior: 'smooth',
      }}>

        {/* Toast Notifications */}
        <div className="no-print" style={{
          position: 'fixed', bottom: '88px', left: '50%', transform: 'translateX(-50%)',
          width: 'auto', maxWidth: '90vw', zIndex: 1000,
          display: 'flex', flexDirection: 'column', gap: '0.4rem',
          pointerEvents: 'none', alignItems: 'center'
        }}>
          {roomState.notifications.filter(n => !n.read).slice(0, 2).map((notif, index) => (
            <div key={`${notif.id}-${index}`} style={{
              background: 'rgba(19, 25, 41, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              padding: '0.6rem 1rem',
              borderRadius: '999px',
              fontSize: '0.82rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              pointerEvents: 'auto',
              animation: 'slideUp 0.3s ease-out',
              whiteSpace: 'nowrap'
            }}>
              <span style={{ fontSize: '0.9em' }}>
                {notif.type === 'expense' ? '💰' : notif.type === 'alarm' ? '⏰' : notif.type === 'badge' ? '⚡' : '✓'}
              </span>
              <span style={{ fontWeight: '500', color: 'var(--text-main)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {notif.text}
              </span>
              <button
                onClick={() => roomState.dismissNotification(notif.id)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 0 }}
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>

        {/* View Content */}
        <div style={{ animation: 'fadeIn 0.25s ease-out' }}>
          {activeTab === 'Dashboard'    && <DashboardView {...roomState} />}
          {activeTab === 'Expenses'     && <ExpensesView {...roomState} />}
          {activeTab === 'AI Brain'     && <AIBrainView {...roomState} />}
          {activeTab === 'Grocery'      && <GroceryView {...roomState} />}
          {activeTab === 'Food'         && <FoodView saveFoodMenu={roomState.saveFoodMenu} loadFoodMenu={roomState.loadFoodMenu} />}
          {activeTab === 'Study'        && (
            <StudyView 
              subjects={roomState.subjects}
              addSubject={roomState.addSubject}
              deleteSubject={roomState.deleteSubject}
              studyFiles={roomState.studyFiles}
              uploadFile={roomState.uploadFile}
              deleteFile={roomState.deleteFile}
              renameFile={roomState.renameFile}
              currentUser={roomState.currentUser}
            />
          )}
          {activeTab === 'Alarms'       && <AlarmView {...roomState} />}
          {activeTab === 'Documents'    && <AchievementsView {...roomState} />}
          {activeTab === 'Chat'         && <ChatView {...roomState} />}
        </div>
      </main>

      {/* ── PREMIUM GLASS BOTTOM NAV ── */}
      <nav className="no-print" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        height: 'calc(68px + env(safe-area-inset-bottom))',
        paddingBottom: 'env(safe-area-inset-bottom)',
        background: '#161d2f',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(108,99,255,0.18)',
        zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        paddingLeft: '0.5rem', paddingRight: '0.5rem'
      }}>
        {bottomTabs.map(tab => {
          const isActive = activeTab === tab.name;
          return (
            <button
              key={tab.name}
              onClick={() => switchTab(tab.name)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
                color: isActive ? tab.color : 'var(--text-subtle)',
                width: '20%',
                padding: '0.4rem 0',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isActive ? 'translateY(-3px)' : 'translateY(0)',
                position: 'relative'
              }}
            >
              {/* Active color indicator bar */}
              {isActive && (
                <div style={{
                  position: 'absolute', top: '-1px', left: '50%',
                  transform: 'translateX(-50%)',
                  width: '28px', height: '3px',
                  background: tab.color,
                  borderRadius: '0 0 4px 4px',
                  boxShadow: `0 2px 10px rgba(${tab.rgb},0.8)`
                }} />
              )}

              {/* Icon with per-tab color glow */}
              <div style={{
                width: '36px', height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '10px',
                background: isActive ? `rgba(${tab.rgb},0.15)` : 'transparent',
                border: isActive ? `1px solid rgba(${tab.rgb},0.25)` : '1px solid transparent',
                transition: 'all 0.2s',
                filter: isActive ? `drop-shadow(0 0 8px rgba(${tab.rgb},0.7))` : 'none',
                transform: 'scale(0.95)'
              }}>
                {tab.icon}
              </div>

              <span style={{ fontSize: '0.6rem', fontWeight: isActive ? '700' : '500', fontFamily: 'var(--font-heading)', letterSpacing: '0.01em', color: isActive ? tab.color : 'var(--text-subtle)' }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* User Profile Modal */}
      {showProfileModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }} onClick={() => setShowProfileModal(false)}>
          <div style={{
            background: 'var(--card-bg)', border: '1px solid var(--primary)',
            borderRadius: '16px', padding: '2rem', width: '90%', maxWidth: '340px',
            boxShadow: '0 10px 40px rgba(108,99,255,0.3)', position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowProfileModal(false)} style={{
              position: 'absolute', top: '15px', right: '15px', background: 'transparent',
              border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
            }}>
              <X size={20} />
            </button>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <img src={currentUserData.avatar} alt="avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', border: '3px solid var(--primary)', marginBottom: '1rem', background: '#161d2f' }} />
              <h2 style={{ margin: 0, color: 'var(--text-main)', fontFamily: 'var(--font-heading)', fontSize: '1.5rem' }}>{roomState.currentUser}</h2>
              <div style={{ marginTop: '0.5rem' }}><span className="cyber-badge badge-green">● Online</span></div>
            </div>
            
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Full Name</span>
                <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'right' }}>
                  {roomState.currentUser === 'Sameer' ? 'Sameer Khan S' : 'Rifaas N'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>DOB</span>
                <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'right' }}>
                  {roomState.currentUser === 'Sameer' ? '14/08/2006' : '14/07/2005'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Phone</span>
                <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'right' }}>
                  {roomState.currentUser === 'Sameer' ? '6381496966' : '9994897216'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(16px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(-8px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        body { overscroll-behavior-y: none; }
      `}</style>
    </div>
  );
}
