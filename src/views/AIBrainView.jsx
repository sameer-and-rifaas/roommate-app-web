import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Mic, Image, Sparkles, Book, CheckSquare, Edit, Languages } from 'lucide-react';

export default function AIBrainView({ currentUser, addNotificationSystem }) {
  const [activePersona, setActivePersona] = useState('ChatGPT'); // ChatGPT (Study), Gemini (Research), Claude (Writer)
  const [messages, setMessages] = useState({
    ChatGPT: [
      { sender: 'AI', content: 'Vanakam! I am your Study Companion. Ask me any doubts or ask to generate study notes. Naan ungalukku teach panna ready!', timestamp: new Date().toLocaleTimeString() }
    ],
    Gemini: [
      { sender: 'AI', content: 'Gemini Research Core initialized. Feed me topics, papers, or study guides, and I will extract structural outlines and references.', timestamp: new Date().toLocaleTimeString() }
    ],
    Claude: [
      { sender: 'AI', content: 'Claude Writing Engine engaged. Need help writing assignments, drafting emails, or refining summaries? Let’s begin.', timestamp: new Date().toLocaleTimeString() }
    ]
  });
  
  const [inputVal, setInputVal] = useState('');
  const [tanglishMode, setTanglishMode] = useState(true);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isScanningImage, setIsScanningImage] = useState(false);
  const [scannedFileName, setScannedFileName] = useState('');
  const msgEndRef = useRef(null);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activePersona]);

  // Handle preset templates
  const handlePreset = (type) => {
    let query = '';
    if (type === 'summary') {
      query = 'Summarize my Operating Systems notes on process scheduling.';
    } else if (type === 'plan') {
      query = 'Create a 3-day study plan for Web Development finals.';
    } else if (type === 'assignment') {
      query = 'Write an assignment template about Renewable Energy sources.';
    }
    
    setInputVal(query);
  };

  const getAIResponse = (query, persona) => {
    let responseText = '';
    const queryLower = query.toLowerCase();

    // Tanglish Translation Core Answers
    if (tanglishMode) {
      if (persona === 'ChatGPT') {
        if (queryLower.includes('summary') || queryLower.includes('notes')) {
          responseText = "Sure, Operating Systems process scheduling notes summary in simple terms: \n\n1. **CPU Scheduling**: Inga CPU processor endha process-a next execute pannanum-nu mudivu pannum. Very important task!\n2. **FCFS (First Come First Serve)**: Yaar modhalla varangalo, avangalukku dhaan execution! Simple aana waiting time romba adhigam aagum (Convoy Effect).\n3. **SJF (Shortest Job First)**: Edhuku burst time short-a iruko, adhu ready stage-ku poirum. Excellent efficiency, but scheduling dynamic timing kastam.\n4. **Round Robin**: Inga time quantum algorithm follow pannuvom. Equal share elements details code panna easy-a irukkum.\n\nPurinjidha? Endha scheduler pathi detail pannanum sollu, clear-a explain pannuren.";
        } else if (queryLower.includes('plan') || queryLower.includes('study')) {
          responseText = "Hey! 3-day study plan prepare panniyachu:\n\n* **Day 1: Basics & HTML/CSS Grid** - 2 hours focus timer vaithu padikkavum. Study markup concepts and layout rules.\n* **Day 2: Javascript & State** - React variables and state updates structure. RoomMate Sync state logic code try panni paar.\n* **Day 3: Backend & Firebase integration** - Firestore database queries clean-a review pannu.\n\nComplete panna panna +30 XP trigger aagum, let's complete this boss level!";
        } else if (queryLower.includes('assignment') || queryLower.includes('renewable')) {
          responseText = "Vanakam! Renewable energy source assignment outline format:\n\n* **Introduction**: Explains resources like Solar, Wind, and Hydro. Adhala environment pollution aagadhunu explain pannanum.\n* **Solar Energy**: Panels capture photons from sun rays. Easy-a power generate pannalam. In India, solar farm deployment adhigama iruku.\n* **Wind Energy**: Turbines rotate to run generators. Coastal areas-la efficient output.\n* **Conclusion**: Eco-friendly path-la progress panna renewable dhaan solution.\n\nIdha un Assignment template-la replace panni print out eduthuko.";
        } else {
          responseText = `Oh sure! "${query}" pathi simple explain:\n\nIdhu basic concepts dhaan. Inga simple details irukku. React roommate sync-la dynamic values manage panna easy-a irukkum. Unakku structure build panna udhari seiyuren. Adhuthu enna doubt? Clear-a explain pannuren, feel free to ask!`;
        }
      } else if (persona === 'Gemini') {
        responseText = `Gemini Research Scan results for "${query}":\n\n* **Main Core**: Concept is researched thoroughly.\n* **Context Data**: Both roommates are sync-ed.\n* **References**: \n  - Academic paper 1: Co-living systems, 2026.\n  - Study resource 2: Student automation hubs.\n\n*Tanglish Insight*: Study focus hours dynamic-a double panna performance grade scale direct-a climb aagum. Keep studying!`;
      } else {
        responseText = `Claude Assignment Compiler output: \n\nDear Professor,\n\nI am submitting my report regarding ${query}. The calculations and layouts are formatted correctly. Sameer and Rifaas contributed equally to this room research block.\n\n*Tanglish edit*: Please find the attached details. Romba hardwork panni prepare pannadhu!`;
      }
    } else {
      // English Only answers
      responseText = `Hello! Regarding "${query}", here is the analytical summary for ${persona}:\n\nWe have analyzed your parameters. The requested files, notes, and plan outlines have been constructed based on standard web algorithms. Let me know if you would like me to draft an assignment script or a study planner list.`;
    }

    return responseText;
  };

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!inputVal.trim()) return;

    const userMsg = { sender: 'Sameer', content: inputVal, timestamp: new Date().toLocaleTimeString() };
    const tempPersona = activePersona;

    setMessages(prev => ({
      ...prev,
      [tempPersona]: [...prev[tempPersona], userMsg]
    }));

    setInputVal('');

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponseText = getAIResponse(inputVal, tempPersona);
      const aiMsg = { sender: 'AI', content: aiResponseText, timestamp: new Date().toLocaleTimeString() };
      
      setMessages(prev => ({
        ...prev,
        [tempPersona]: [...prev[tempPersona], aiMsg]
      }));

      // Add Notification
      addNotificationSystem(`${tempPersona} resolved a doubt for ${currentUser}`, 'system');
    }, 1200);
  };

  // Voice Input Simulator
  const triggerVoiceInput = () => {
    if (isVoiceActive) return;
    setIsVoiceActive(true);
    
    // Simulate speech detection
    setTimeout(() => {
      setInputVal("Chemistry exam study plan outline venum.");
      setIsVoiceActive(false);
      
      if (addNotificationSystem) {
        addNotificationSystem("🎙️ Speech transcription completed", "system");
      }
    }, 3000);
  };

  // Image Scan Simulator
  const triggerImageUpload = () => {
    setIsScanningImage(true);
    setScannedFileName("lecture_notes_page3.png");

    setTimeout(() => {
      setInputVal("Summarize notes from the uploaded lecture_notes_page3.png document");
      setIsScanningImage(false);

      if (addNotificationSystem) {
        addNotificationSystem("📷 OCR document scanner successfully scanned note text", "system");
      }
    }, 3000);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
      
      {/* HUD CONTROLLER */}
      <div className="cyber-card" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-hud)', color: 'var(--neon-purple)', letterSpacing: '1px', fontSize: '1.2rem', marginBottom: '0.3rem', lineHeight: '1.3' }}>🧠 NEURAL AI ASSISTANT HUB</h2>
          <p style={{ fontSize: '0.7rem', color: 'var(--cyber-gray)', fontFamily: 'var(--font-mono)', lineHeight: '1.4' }}>PERSONAS: ACTIVE // TRANSLATION: TANGLISH_READY</p>
        </div>

        {/* Tanglish Mode Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-hud)', color: tanglishMode ? 'var(--neon-green)' : 'var(--cyber-gray)', whiteSpace: 'nowrap' }}>
            {tanglishMode ? "TANGLISH MODE [ON]" : "ENGLISH MODE [ON]"}
          </span>
          <button 
            onClick={() => setTanglishMode(!tanglishMode)}
            className={`cyber-btn ${tanglishMode ? 'cyber-btn-green' : 'cyber-btn-secondary'}`}
            style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem' }}
          >
            {tanglishMode ? "Disable Translation" : "Enable Tanglish"}
          </button>
        </div>
      </div>

      {/* THREE PERSONA TABS */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.3rem', borderRadius: '8px', border: '1px solid var(--cyber-border)' }}>
        <button 
          onClick={() => setActivePersona('ChatGPT')} 
          className={`cyber-btn ${activePersona === 'ChatGPT' ? 'cyber-btn' : 'cyber-btn-secondary'}`}
          style={{ flex: 1, fontSize: '0.75rem', justifyContent: 'center' }}
        >
          <Bot size={16} /> ChatGPT (Study Companion)
        </button>
        <button 
          onClick={() => setActivePersona('Gemini')} 
          className={`cyber-btn ${activePersona === 'Gemini' ? 'cyber-btn-purple' : 'cyber-btn-secondary'}`}
          style={{ flex: 1, fontSize: '0.75rem', justifyContent: 'center' }}
        >
          <Sparkles size={16} /> Gemini (Research Core)
        </button>
        <button 
          onClick={() => setActivePersona('Claude')} 
          className={`cyber-btn ${activePersona === 'Claude' ? 'cyber-btn-pink' : 'cyber-btn-secondary'}`}
          style={{ flex: 1, fontSize: '0.75rem', justifyContent: 'center' }}
        >
          <Edit size={16} /> Claude (Writing Engine)
        </button>
      </div>

      {/* CORE CHAT SCREEN */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        
        {/* Chat box */}
        <div className="cyber-card" style={{ display: 'flex', flexDirection: 'column', height: '400px' }}>
          {/* Header */}
          <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid rgba(189,0,255,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-hud)', color: 'var(--neon-purple)' }}>{activePersona.toUpperCase()} CORE TERMINAL</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--cyber-gray)', fontFamily: 'var(--font-mono)' }}>PING: 45MS</span>
          </div>

          {/* Message Stream */}
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages[activePersona].map((msg, idx) => (
              <div 
                key={idx} 
                style={{ 
                  alignSelf: msg.sender === 'AI' ? 'flex-start' : 'flex-end',
                  maxWidth: '80%',
                  background: msg.sender === 'AI' ? 'rgba(13, 15, 34, 0.8)' : 'rgba(189, 0, 255, 0.1)',
                  border: '1px solid',
                  borderColor: msg.sender === 'AI' ? 'rgba(0, 240, 255, 0.1)' : 'rgba(189, 0, 255, 0.3)',
                  padding: '0.8rem 1rem',
                  borderRadius: '12px',
                  borderTopLeftRadius: msg.sender === 'AI' ? '0px' : '12px',
                  borderTopRightRadius: msg.sender === 'AI' ? '12px' : '0px',
                  boxShadow: msg.sender === 'AI' ? 'none' : '0 0 10px rgba(189,0,255,0.1)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', marginBottom: '0.3rem', fontSize: '0.7rem', fontFamily: 'var(--font-hud)', color: msg.sender === 'AI' ? 'var(--neon-cyan)' : 'var(--neon-purple)' }}>
                  <span>{msg.sender === 'AI' ? `${activePersona} BOT` : currentUser}</span>
                  <span style={{ color: 'var(--cyber-gray)' }}>{msg.timestamp}</span>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#e2e8f0', whiteSpace: 'pre-line', lineHeight: '1.4' }}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {/* Holographic scanner overlay while uploading notes */}
            {isScanningImage && (
              <div style={{ 
                alignSelf: 'flex-start',
                width: '60%',
                background: 'rgba(255,0,85,0.05)',
                border: '1px solid var(--neon-pink)',
                padding: '1rem',
                borderRadius: '8px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  position: 'absolute', 
                  top: 0, left: 0, 
                  width: '100%', height: '3px', 
                  background: 'var(--neon-pink)', 
                  boxShadow: '0 0 8px var(--neon-pink)',
                  animation: 'scanline 2s ease-in-out infinite' 
                }}></div>
                <div style={{ fontSize: '0.8rem', color: '#fff', fontFamily: 'var(--font-hud)', marginBottom: '0.3rem' }}>📷 OCR IMAGE DOC SCANNER</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--cyber-gray)' }}>Scanning: {scannedFileName} ...</div>
              </div>
            )}

            {/* Voice active animation */}
            {isVoiceActive && (
              <div style={{ 
                alignSelf: 'flex-end',
                background: 'rgba(0, 240, 255, 0.05)',
                border: '1px solid var(--neon-cyan)',
                padding: '0.8rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ fontSize: '0.75rem', color: '#fff' }}>🎙️ Listening...</span>
                <div style={{ display: 'flex', gap: '2px', height: '15px', alignItems: 'center' }}>
                  <div style={{ width: '2px', height: '100%', background: 'var(--neon-cyan)', animation: 'blink 0.4s infinite alternate' }}></div>
                  <div style={{ width: '2px', height: '60%', background: 'var(--neon-cyan)', animation: 'blink 0.3s infinite alternate 0.1s' }}></div>
                  <div style={{ width: '2px', height: '80%', background: 'var(--neon-cyan)', animation: 'blink 0.5s infinite alternate 0.2s' }}></div>
                  <div style={{ width: '2px', height: '40%', background: 'var(--neon-cyan)', animation: 'blink 0.3s infinite alternate 0.3s' }}></div>
                </div>
              </div>
            )}

            <div ref={msgEndRef} />
          </div>

          {/* Form control bar */}
          <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem' }}>
            
            {/* Attachment Actions */}
            <button 
              type="button" 
              onClick={triggerImageUpload}
              className="cyber-btn cyber-btn-secondary" 
              style={{ padding: '0.6rem' }}
              title="Upload study note snapshot"
            >
              <Image size={16} />
            </button>

            <button 
              type="button" 
              onClick={triggerVoiceInput}
              className={`cyber-btn ${isVoiceActive ? 'cyber-btn-pink' : 'cyber-btn-secondary'}`} 
              style={{ padding: '0.6rem' }}
              title="Speak to Assistant"
            >
              <Mic size={16} />
            </button>

            <input 
              type="text" 
              className="cyber-input" 
              placeholder={`Ask doubts or query notes to ${activePersona}...`}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              disabled={isVoiceActive || isScanningImage}
            />

            <button type="submit" className="cyber-btn cyber-btn-purple">
              <Send size={16} /> Send
            </button>

          </form>
        </div>

        {/* STUDY TOOLS COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div className="cyber-card cyber-card-purple">
            <h4 style={{ fontFamily: 'var(--font-hud)', fontSize: '0.85rem', color: 'var(--neon-purple)', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Book size={14} /> DYNAMIC STUDY UTILITIES
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button 
                onClick={() => handlePreset('summary')} 
                className="cyber-btn cyber-btn-purple cyber-btn-secondary" 
                style={{ fontSize: '0.7rem', width: '100%', justifyContent: 'flex-start' }}
              >
                📝 Summarize Lecture Notes
              </button>
              <button 
                onClick={() => handlePreset('plan')} 
                className="cyber-btn cyber-btn-purple cyber-btn-secondary" 
                style={{ fontSize: '0.7rem', width: '100%', justifyContent: 'flex-start' }}
              >
                📅 Generate study plan outline
              </button>
              <button 
                onClick={() => handlePreset('assignment')} 
                className="cyber-btn cyber-btn-purple cyber-btn-secondary" 
                style={{ fontSize: '0.7rem', width: '100%', justifyContent: 'flex-start' }}
              >
                ✍️ Write assignment draft
              </button>
            </div>
          </div>

          <div className="cyber-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
            <Languages size={32} color="var(--neon-cyan)" style={{ margin: '0 auto 0.5rem auto' }} />
            <h4 style={{ fontFamily: 'var(--font-hud)', fontSize: '0.8rem', color: '#fff', marginBottom: '0.25rem' }}>Tanglish AI Compiler v2.0</h4>
            <p style={{ fontSize: '0.7rem', color: 'var(--cyber-gray)' }}>
              Explains complex study topics using local Tamil and English conversational mix to aid fast comprehension.
            </p>
          </div>

        </div>

      </div>
      
    </div>
  );
}
