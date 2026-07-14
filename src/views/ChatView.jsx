import React, { useState } from 'react';
import { Send, Bot, DollarSign, Bell, Shield, ArrowRight } from 'lucide-react';

export default function ChatView({ chatMessages, addChatMessage, currentUser, expenses, settleExpenses, alarms, toggleAlarmActive }) {
  const [typedMessage, setTypedMessage] = useState('');
  const [shareObjType, setShareObjType] = useState('none'); // none, expense, alarm
  const [selectedShareId, setSelectedShareId] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    // Send original user message
    addChatMessage(currentUser, typedMessage);
    const text = typedMessage;
    setTypedMessage('');

    // Check for slash command triggers
    const lowerText = text.toLowerCase();
    if (text.startsWith('/')) {
      let botSender = 'AI Brain';
      let answer = '';
      
      if (text.startsWith('/study')) {
        botSender = 'ChatGPT Bot';
        answer = `Study search active for "${text.slice(7)}":\n\nStudy sessions should be logged with the focus timer. Innikku operating system notes review pannanum. Need a complete breakdown? Ask me directly!`;
      } else if (text.startsWith('/research')) {
        botSender = 'Gemini Bot';
        answer = `Research search active for "${text.slice(10)}":\n\nI have fetched references. Auto-split models indicate a 50-50 share is ideal for room bill management.`;
      } else if (text.startsWith('/write')) {
        botSender = 'Claude Bot';
        answer = `Writing templates compiled for "${text.slice(7)}":\n\nDraft email: "Hi, roommate rent transfer is ready. Auto-settle is active."`;
      } else {
        botSender = 'System OS';
        answer = `Command not recognized. Use: \n/study [query]\n/research [query]\n/write [query]`;
      }

      // Simulate bot answer
      setTimeout(() => {
        addChatMessage(botSender, answer, 'system');
      }, 1000);
    }
  };

  const handleShareObject = (e) => {
    e.preventDefault();
    if (!selectedShareId) return;

    if (shareObjType === 'expense') {
      const exp = expenses.find(e => e.id === selectedShareId);
      if (exp) {
        addChatMessage('System', `Shared Expense: "${exp.description}" (₹${exp.amount}) paid by ${exp.paidBy}.`, 'user', {
          type: 'expense',
          id: exp.id,
          desc: exp.description,
          amount: exp.amount,
          paidBy: exp.paidBy,
          settled: exp.settled
        });
      }
    } else if (shareObjType === 'alarm') {
      const al = alarms.find(a => a.id === selectedShareId);
      if (al) {
        addChatMessage('System', `Shared Alarm: "${al.label}" Scheduled at ${al.time}.`, 'user', {
          type: 'alarm',
          id: al.id,
          label: al.label,
          time: al.time,
          active: al.active
        });
      }
    }

    setShareObjType('none');
    setSelectedShareId('');
  };

  const handleActionSettle = (creditor, debtor) => {
    settleExpenses(debtor, creditor);
    alert("🤝 Transaction settled successfully!");
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
      
      {/* HEADER CONTROLLER */}
      <div className="cyber-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-hud)', color: 'var(--neon-cyan)', letterSpacing: '1px' }}>💬 HYPER-SECURE ROOM CHAT</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--cyber-gray)', fontFamily: 'var(--font-mono)' }}>BOT TRIGGERS: /study, /write, /research // STATUS: ONLINE</p>
        </div>
      </div>

      {/* CHAT DISPLAY LAYOUT */}
      <div className="mobile-grid">
        
        {/* Chat box container */}
        <div className="cyber-card" style={{ display: 'flex', flexDirection: 'column', height: '420px' }}>
          
          {/* Messages list */}
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {chatMessages.map((msg) => {
              const isMe = msg.sender === currentUser;
              const isSystem = msg.sender === 'System' || msg.sender.includes('Bot') || msg.type === 'system';
              
              return (
                <div 
                  key={msg.id}
                  style={{
                    alignSelf: isSystem ? 'center' : (isMe ? 'flex-end' : 'flex-start'),
                    maxWidth: '75%',
                    width: isSystem ? '85%' : 'auto',
                    background: isSystem ? 'rgba(5,5,10,0.8)' : (isMe ? 'rgba(0, 240, 255, 0.08)' : 'rgba(189, 0, 255, 0.05)'),
                    border: '1px solid',
                    borderColor: isSystem ? 'rgba(0,240,255,0.1)' : (isMe ? 'rgba(0, 240, 255, 0.25)' : 'rgba(189, 0, 255, 0.2)'),
                    borderRadius: '10px',
                    padding: '0.6rem 0.9rem',
                    boxShadow: isSystem ? 'none' : (isMe ? '0 0 10px rgba(0,240,255,0.05)' : '0 0 10px rgba(189,0,255,0.05)')
                  }}
                >
                  {/* Message sender header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', fontSize: '0.7rem', color: isSystem ? 'var(--neon-pink)' : (isMe ? 'var(--neon-cyan)' : 'var(--neon-purple)'), fontFamily: 'var(--font-hud)', marginBottom: '0.2rem' }}>
                    <span>{msg.sender}</span>
                    <span style={{ color: 'var(--cyber-gray)' }}>{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>

                  {/* Text content */}
                  <div style={{ fontSize: '0.85rem', color: '#e2e8f0', whiteSpace: 'pre-line', lineHeight: '1.4' }}>
                    {msg.content}
                  </div>

                  {/* INTERACTIVE COMPONENT ATTACHMENTS */}
                  {msg.attachment && (
                    <div style={{ 
                      marginTop: '0.6rem', 
                      background: 'rgba(0,0,0,0.4)', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: '6px', 
                      padding: '0.5rem', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      gap: '1rem'
                    }}>
                      {msg.attachment.type === 'expense' ? (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
                            <DollarSign size={16} color="var(--neon-green)" />
                            <div>
                              <div style={{ fontWeight: 'bold' }}>{msg.attachment.desc}</div>
                              <div style={{ color: 'var(--cyber-gray)' }}>₹{msg.attachment.amount} paid by {msg.attachment.paidBy}</div>
                            </div>
                          </div>
                          
                          {/* Settle button */}
                          {msg.attachment.paidBy !== currentUser ? (
                            <button 
                              onClick={() => handleActionSettle(msg.attachment.paidBy, currentUser)}
                              className="cyber-btn cyber-btn-green"
                              style={{ fontSize: '0.6rem', padding: '0.2rem 0.5rem' }}
                            >
                              Settle
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.65rem', color: 'var(--cyber-gray)', fontFamily: 'var(--font-mono)' }}>Owed</span>
                          )}
                        </>
                      ) : (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
                            <Bell size={16} color="var(--neon-pink)" />
                            <div>
                              <div style={{ fontWeight: 'bold' }}>{msg.attachment.label}</div>
                              <div style={{ color: 'var(--cyber-gray)' }}>Fires at {msg.attachment.time}</div>
                            </div>
                          </div>
                          <button 
                            onClick={() => toggleAlarmActive(msg.attachment.id)}
                            className="cyber-btn cyber-btn-pink cyber-btn-secondary"
                            style={{ fontSize: '0.6rem', padding: '0.2rem 0.5rem' }}
                          >
                            Toggle Active
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Form input bar */}
          <form onSubmit={handleSend} className="mobile-wrap" style={{ gap: '0.5rem' }}>
            <input 
              type="text" 
              className="cyber-input" 
              placeholder="Type message or /bot..."
              value={typedMessage}
              onChange={(e) => setTypedMessage(e.target.value)}
              style={{ flex: '1 1 150px', marginBottom: 0 }}
            />
            <button type="submit" className="cyber-btn cyber-btn-cyan" style={{ flex: '0 0 auto', padding: '0 1rem' }}>
              <Send size={16} style={{ marginRight: '6px' }} /> Broadcast
            </button>
          </form>

        </div>

        {/* SHARED SYSTEMS COLUMN */}
        <div className="cyber-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <h4 style={{ fontFamily: 'var(--font-hud)', fontSize: '0.85rem', color: 'var(--neon-cyan)', borderBottom: '1px solid rgba(0,240,255,0.1)', paddingBottom: '0.25rem' }}>
            🔗 SHARE DIRECTLY
          </h4>

          {shareObjType === 'none' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button 
                onClick={() => setShareObjType('expense')}
                className="cyber-btn cyber-btn-secondary"
                style={{ fontSize: '0.7rem', justifyContent: 'flex-start', width: '100%' }}
              >
                💰 Share Unsettled Expense
              </button>
              <button 
                onClick={() => setShareObjType('alarm')}
                className="cyber-btn cyber-btn-secondary"
                style={{ fontSize: '0.7rem', justifyContent: 'flex-start', width: '100%' }}
              >
                ⏰ Share Wakeup Alarm
              </button>
            </div>
          ) : (
            <form onSubmit={handleShareObject} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--cyber-gray)', textTransform: 'uppercase' }}>Select {shareObjType}:</span>
              
              <select 
                className="cyber-select"
                value={selectedShareId}
                onChange={(e) => setSelectedShareId(e.target.value)}
                required
                style={{ width: '100%', fontSize: '0.75rem', height: '32px' }}
              >
                <option value="">-- Choose Item --</option>
                {shareObjType === 'expense' ? (
                  expenses.filter(e => !e.settled).map(exp => (
                    <option key={exp.id} value={exp.id}>{exp.description} (₹{exp.amount})</option>
                  ))
                ) : (
                  alarms.map(al => (
                    <option key={al.id} value={al.id}>{al.label} ({al.time})</option>
                  ))
                )}
              </select>

              <div style={{ display: 'flex', gap: '0.3rem' }}>
                <button type="submit" className="cyber-btn" style={{ fontSize: '0.65rem', flex: 1, padding: '0.3rem' }}>Attach</button>
                <button type="button" onClick={() => setShareObjType('none')} className="cyber-btn cyber-btn-secondary" style={{ fontSize: '0.65rem', padding: '0.3rem' }}>Cancel</button>
              </div>
            </form>
          )}

          <div style={{ flex: 1, background: 'rgba(0,240,255,0.02)', border: '1px dashed var(--cyber-border)', padding: '0.5rem', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '0.4rem', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--cyber-gray)', fontFamily: 'var(--font-hud)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <Shield size={12} color="var(--neon-cyan)" /> BOT DEPLOYMENT KEY
            </span>
            <p style={{ fontSize: '0.65rem', color: 'var(--cyber-gray)', lineHeight: '1.3' }}>
              Type /study, /write or /research prefix to compile AI results directly in room stream for roommate sync.
            </p>
          </div>

        </div>

      </div>
      
    </div>
  );
}
