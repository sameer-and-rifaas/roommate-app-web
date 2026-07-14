import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Award } from 'lucide-react';

export default function FocusTimer({ currentUser, logStudyHours, addNotificationSystem }) {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [initialTime, setInitialTime] = useState(25 * 60); // In seconds
  const timerRef = useRef(null);

  const totalSeconds = minutes * 60 + seconds;
  const progressRatio = initialTime > 0 ? (totalSeconds / initialTime) : 0;
  const strokeDashoffset = 283 - (progressRatio * 283); // 2 * pi * r (r=45 => 282.7)

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          // Timer finished!
          clearInterval(timerRef.current);
          setIsActive(false);
          
          const studyHrs = parseFloat((initialTime / 3600).toFixed(2));
          logStudyHours(studyHrs);
          
          if (addNotificationSystem) {
            addNotificationSystem(`🎓 Study session completed! ${currentUser} completed a ${initialTime / 60}m focus session.`, 'task');
          }
          
          // Trigger browser notification chime
          try {
            const context = new (window.AudioContext || window.webkitAudioContext)();
            const osc = context.createOscillator();
            const gain = context.createGain();
            osc.connect(gain);
            gain.connect(context.destination);
            osc.frequency.setValueAtTime(880, context.currentTime); // A5 note
            gain.gain.setValueAtTime(0.1, context.currentTime);
            osc.start();
            osc.stop(context.currentTime + 0.3);
          } catch (e) {
            console.log("Audio not supported or allowed yet");
          }
          
          alert(`🎉 Outstanding! You completed a ${initialTime / 60}m focus session! XP and Study Hours have been synchronized.`);
          
          // Reset to default
          setMinutes(25);
          setSeconds(0);
          setInitialTime(25 * 60);
        }
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, minutes, seconds, initialTime, currentUser, logStudyHours, addNotificationSystem]);

  const handleStartPause = () => {
    if (!isActive) {
      // If we are starting fresh, record the initial time
      if (totalSeconds === minutes * 60 + seconds) {
        setInitialTime(minutes * 60 + seconds);
      }
    }
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setMinutes(25);
    setSeconds(0);
    setInitialTime(25 * 60);
  };

  const setTimerPreset = (mins) => {
    setIsActive(false);
    setMinutes(mins);
    setSeconds(0);
    setInitialTime(mins * 60);
  };

  return (
    <div className="cyber-card cyber-card-purple" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h3 style={{ fontFamily: 'var(--font-hud)', color: 'var(--neon-purple)', marginBottom: '1rem', letterSpacing: '1px', alignSelf: 'flex-start' }}>🧠 NEURAL STUDY SHIELD</h3>
      
      {/* Timer Circular Display */}
      <div style={{ position: 'relative', width: '130px', height: '130px', margin: '1rem 0' }}>
        <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            stroke="rgba(189, 0, 255, 0.1)" 
            strokeWidth="4" 
            fill="transparent" 
          />
          {/* Glowing Progress circle */}
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            stroke="var(--neon-purple)" 
            strokeWidth="4" 
            fill="transparent" 
            strokeDasharray="283"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ 
              transition: 'stroke-dashoffset 1s linear',
              filter: 'drop-shadow(0 0 5px var(--neon-purple-glow))'
            }}
          />
        </svg>
        
        {/* Time Text */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: 'var(--font-mono)',
          fontSize: '1.4rem',
          fontWeight: 'bold',
          color: '#fff',
          textShadow: '0 0 5px var(--neon-purple-glow)'
        }}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      </div>

      {/* Preset Buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem' }}>
        <button onClick={() => setTimerPreset(1)} className="cyber-btn cyber-btn-purple cyber-btn-secondary" style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem' }}>1m Test</button>
        <button onClick={() => setTimerPreset(25)} className="cyber-btn cyber-btn-purple cyber-btn-secondary" style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem' }}>25m Focus</button>
        <button onClick={() => setTimerPreset(50)} className="cyber-btn cyber-btn-purple cyber-btn-secondary" style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem' }}>50m Boss</button>
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
        <button 
          onClick={handleStartPause} 
          className={`cyber-btn ${isActive ? 'cyber-btn-pink' : 'cyber-btn-purple'}`}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          {isActive ? <Pause size={16} /> : <Play size={16} />}
          {isActive ? 'Pause' : 'Initiate'}
        </button>
        
        <button 
          onClick={handleReset} 
          className="cyber-btn cyber-btn-secondary"
          style={{ padding: '0.6rem 0.8rem' }}
          title="Reset Timer"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      <div style={{ fontSize: '0.7rem', color: 'var(--cyber-gray)', marginTop: '0.8rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
        CURRENT USER: <span style={{ color: '#fff' }}>{currentUser.toUpperCase()}</span> (+30 XP/hr)
      </div>
    </div>
  );
}
