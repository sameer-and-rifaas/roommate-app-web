import React, { useState, useEffect } from 'react';
import { Plus, Bell, ToggleLeft, ToggleRight, Trash, Play, AlertTriangle, HelpCircle } from 'lucide-react';

export default function AlarmView({ alarms, addAlarm, toggleAlarmActive, removeAlarm, currentUser, addNotificationSystem }) {
  const [time, setTime] = useState('');
  const [label, setLabel] = useState('');
  const [type, setType] = useState('individual'); // individual, shared
  const [owner, setOwner] = useState(currentUser);
  
  // Quiz states
  const [activeQuizAlarm, setActiveQuizAlarm] = useState(null);
  const [quizQuestion, setQuizQuestion] = useState({ q: '', a: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [quizError, setQuizError] = useState(false);

  // Sync owner with type
  useEffect(() => {
    if (type === 'shared') {
      setOwner('both');
    } else {
      setOwner(currentUser);
    }
  }, [type, currentUser]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!time || !label.trim()) return;
    
    // Convert days list (simple default all weekdays or weekends)
    const days = type === 'shared' ? ['Mon', 'Wed', 'Fri'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    addAlarm(time, label, type, owner, days);
    
    setTime('');
    setLabel('');
  };

  // Generate a random math quiz to shut down alarms
  const generateMathQuiz = () => {
    const num1 = Math.floor(Math.random() * 12) + 4; // 4 to 15
    const num2 = Math.floor(Math.random() * 8) + 3;  // 3 to 10
    const num3 = Math.floor(Math.random() * 30) + 10; // 10 to 40
    
    const operations = ['+', '-'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    
    let answer = 0;
    let questionStr = '';
    
    if (op === '+') {
      answer = (num1 * num2) + num3;
      questionStr = `(${num1} × ${num2}) + ${num3}`;
    } else {
      answer = (num1 * num2) - num3;
      questionStr = `(${num1} × ${num2}) - ${num3}`;
    }
    
    return { q: questionStr, a: answer };
  };

  const handleTriggerTest = (alarm) => {
    setActiveQuizAlarm(alarm);
    setQuizQuestion(generateMathQuiz());
    setUserAnswer('');
    setQuizError(false);
    
    // Play alert sound
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch(e) {}
  };

  const handleSolveQuiz = (e) => {
    e.preventDefault();
    if (parseInt(userAnswer) === quizQuestion.a) {
      // Award XP
      addNotificationSystem(`⚡ Alarm resolved! ${currentUser} solved the neural lock quiz and gained +20 XP.`, 'badge');
      
      // Reset quiz
      setActiveQuizAlarm(null);
      setUserAnswer('');
      setQuizError(false);
      alert("🔓 Security lock disabled. Alarm deactivated. +20 XP added!");
    } else {
      setQuizError(true);
      setUserAnswer('');
      
      // Wrong sound
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(150, audioCtx.currentTime); // Low buzz
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } catch(e) {}
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
      
      {/* HEADER CONTROLLER */}
      <div className="cyber-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-hud)', color: 'var(--neon-pink)', letterSpacing: '1px', fontSize: '1.2rem', marginBottom: '0.3rem', lineHeight: '1.3' }}>⏰ SMART WAKEUP & ALARM NETWORK</h2>
          <p style={{ fontSize: '0.7rem', color: 'var(--cyber-gray)', fontFamily: 'var(--font-mono)', lineHeight: '1.4' }}>CHALLENGE MODULE: ACTIVE // SNOOZE_LOCK: MATH_QUIZ_ENABLED</p>
        </div>
      </div>

      {/* DUAL DISPLAY GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* Add alarm panel */}
        <div className="cyber-card">
          <h3 style={{ fontFamily: 'var(--font-hud)', color: '#fff', marginBottom: '1rem' }}>➕ DEPLOY TIMER</h3>
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--cyber-gray)', display: 'block', marginBottom: '0.25rem', fontFamily: 'var(--font-hud)' }}>TIME (HH:MM)</label>
              <input 
                type="time" 
                required 
                className="cyber-input" 
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--cyber-gray)', display: 'block', marginBottom: '0.25rem', fontFamily: 'var(--font-hud)' }}>LABEL</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Study Session, Wakeup call..." 
                className="cyber-input" 
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--cyber-gray)', display: 'block', marginBottom: '0.25rem', fontFamily: 'var(--font-hud)' }}>ALARM TYPE</label>
                <select 
                  className="cyber-select" 
                  value={type} 
                  onChange={(e) => setType(e.target.value)}
                  style={{ width: '100%', height: '38px' }}
                >
                  <option value="individual">Individual</option>
                  <option value="shared">Shared Room</option>
                </select>
              </div>
              
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--cyber-gray)', display: 'block', marginBottom: '0.25rem', fontFamily: 'var(--font-hud)' }}>OWNER</label>
                <select 
                  className="cyber-select" 
                  value={owner} 
                  onChange={(e) => setOwner(e.target.value)}
                  style={{ width: '100%', height: '38px' }}
                  disabled={type === 'shared'}
                >
                  <option value="Sameer">Sameer</option>
                  <option value="Rifaas">Rifaas</option>
                  <option value="both">Both (Shared)</option>
                </select>
              </div>
            </div>

            <div style={{ background: 'rgba(255,0,85,0.05)', border: '1px dashed rgba(255,0,85,0.2)', padding: '0.5rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', color: 'var(--cyber-gray)' }}>
              <HelpCircle size={14} color="var(--neon-pink)" />
              <span>Dismissing alarms triggers a mental arithmetic quiz. Solves earn +20 XP.</span>
            </div>

            <button type="submit" className="cyber-btn cyber-btn-pink" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
              <Plus size={16} /> Deploy Alarm
            </button>
          </form>
        </div>

        {/* Alarm list */}
        <div className="cyber-card">
          <h3 style={{ fontFamily: 'var(--font-hud)', color: '#fff', marginBottom: '0.5rem' }}>📡 SYSTEM ALARM LOGS</h3>
          
          <div style={{ maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem', paddingRight: '0.5rem' }}>
            {alarms.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--cyber-gray)', fontSize: '0.8rem', padding: '2rem' }}>No active alarms configured.</p>
            )}
            {alarms.map((al) => (
              <div key={al.id} style={{ 
                background: 'rgba(255,255,255,0.03)', 
                border: '1px solid var(--cyber-border)', 
                borderRadius: '10px', 
                padding: '1rem',
                opacity: al.active ? 1 : 0.5,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button 
                      onClick={() => toggleAlarmActive(al.id)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: al.active ? 'var(--neon-green)' : 'var(--cyber-gray)', padding: 0 }}
                    >
                      {al.active ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                    </button>
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 'bold', color: '#fff', lineHeight: '1' }}>{al.time}</div>
                      <div style={{ fontWeight: '500', color: 'var(--cyber-gray)', fontSize: '0.85rem', marginTop: '0.3rem' }}>{al.label}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button 
                      onClick={() => handleTriggerTest(al)} 
                      className="cyber-btn cyber-btn-pink cyber-btn-secondary" 
                      style={{ fontSize: '0.65rem', padding: '0.3rem 0.5rem' }}
                      title="Trigger alarm test screen"
                    >
                      <Play size={12} /> <span className="hide-on-mobile">Test Fire</span>
                    </button>
                    <button 
                      onClick={() => removeAlarm(al.id)} 
                      style={{ background: 'transparent', border: 'none', color: 'var(--neon-pink)', cursor: 'pointer', padding: '0.2rem' }}
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '0.6rem' }}>
                  <span className={`cyber-badge ${al.type === 'shared' ? 'badge-pink' : 'badge-cyan'}`} style={{ fontSize: '0.65rem' }}>
                    {al.type}
                  </span>
                  <span style={{ fontFamily: 'var(--font-hud)', fontSize: '0.75rem', color: 'var(--cyber-gray)' }}>
                    Assigned to: <strong style={{ color: '#fff' }}>{al.owner}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* WAKEUP CHALLENGE POPUP OVERLAY */}
      {activeQuizAlarm && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(3, 3, 8, 0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100000,
          backdropFilter: 'blur(20px)'
        }}>
          <div className="cyber-card cyber-scan-grid" style={{ 
            width: '450px', 
            textAlign: 'center', 
            borderWidth: '2px', 
            borderColor: 'var(--neon-pink)',
            boxShadow: '0 0 30px rgba(255, 0, 85, 0.25)',
            background: 'rgba(10, 11, 28, 0.9)'
          }}>
            <div style={{ 
              position: 'absolute', 
              top: 0, left: 0, 
              width: '100%', height: '3px', 
              background: 'var(--neon-pink)',
              boxShadow: '0 0 10px var(--neon-pink)',
              animation: 'scanline 2s ease-in-out infinite'
            }}></div>

            <AlertTriangle size={48} color="var(--neon-pink)" style={{ margin: '0 auto 1rem auto', animation: 'blink 1s infinite' }} />
            
            <h2 style={{ fontFamily: 'var(--font-hud)', color: 'var(--neon-pink)', fontSize: '1.4rem', letterSpacing: '1px', marginBottom: '0.5rem' }}>⚠️ ALARM FIRE PROTOCOL ENGAGED</h2>
            <p style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 'bold', marginBottom: '0.25rem' }}>"{activeQuizAlarm.label}"</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--cyber-gray)', fontFamily: 'var(--font-mono)', marginBottom: '1.5rem' }}>TIME: {activeQuizAlarm.time} // TARGET: {activeQuizAlarm.owner.toUpperCase()}</p>
            
            {/* Quiz math box */}
            <div style={{ 
              background: 'rgba(0,0,0,0.5)', 
              border: '1px solid rgba(255, 0, 85, 0.2)', 
              padding: '1.2rem', 
              borderRadius: '8px', 
              marginBottom: '1.5rem' 
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--cyber-gray)', fontFamily: 'var(--font-hud)', marginBottom: '0.5rem' }}>SOLVE THE NEURAL LOCK TO DISMISS:</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fff', fontFamily: 'var(--font-mono)', letterSpacing: '2px' }}>
                {quizQuestion.q} = ?
              </div>
            </div>

            <form onSubmit={handleSolveQuiz} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <input 
                type="number" 
                className="cyber-input" 
                placeholder="Enter computed integer..." 
                required
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                style={{ textAlign: 'center', fontSize: '1.2rem', height: '45px', borderColor: quizError ? 'var(--neon-pink)' : 'var(--cyber-border)' }}
                autoFocus
              />
              
              {quizError && (
                <div style={{ color: 'var(--neon-pink)', fontSize: '0.75rem', fontWeight: 'bold' }}>❌ DECRYPTION CODE INVALID. TRY AGAIN!</div>
              )}

              <button type="submit" className="cyber-btn cyber-btn-pink" style={{ justifyContent: 'center', height: '40px' }}>
                Unlock Neural Lock
              </button>
            </form>

            <div style={{ fontSize: '0.65rem', color: 'var(--cyber-gray)', marginTop: '1rem', fontFamily: 'var(--font-mono)' }}>
              WARNING: LOUD SYNTH TONE EMULATED. WAKING ROOMMATE MANDATORY.
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
