import React, { useState, useEffect } from 'react';
import { ChefHat, Edit3, Check, X, Plus, Trash2, Calendar, Clock, Sparkles } from 'lucide-react';

// ─── Meal metadata ───────────────────────────────────────────
const MEALS = [
  {
    key: 'breakfast',
    label: 'Breakfast',
    time: '7:00 AM – 9:00 AM',
    emoji: '🌅',
    color: '#F59E0B',
    glow: 'rgba(245,158,11,0.25)',
    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(251,191,36,0.05))',
    border: 'rgba(245,158,11,0.3)',
    suggestions: ['Idli & Sambar', 'Dosa & Chutney', 'Poha', 'Upma', 'Oats', 'Bread & Egg', 'Paratha', 'Sandwich']
  },
  {
    key: 'lunch',
    label: 'Lunch',
    time: '12:30 PM – 2:30 PM',
    emoji: '☀️',
    color: '#10B981',
    glow: 'rgba(16,185,129,0.25)',
    gradient: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(52,211,153,0.05))',
    border: 'rgba(16,185,129,0.3)',
    suggestions: ['Rice & Curry', 'Chapati & Dal', 'Biryani', 'Fried Rice', 'Roti & Sabzi', 'Meals', 'Noodles', 'Pulao']
  },
  {
    key: 'dinner',
    label: 'Dinner',
    time: '8:00 PM – 10:00 PM',
    emoji: '🌙',
    color: '#A855F7',
    glow: 'rgba(168,85,247,0.25)',
    gradient: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(192,38,211,0.05))',
    border: 'rgba(168,85,247,0.3)',
    suggestions: ['Roti & Dal', 'Rice & Rasam', 'Paratha', 'Soup & Bread', 'Idli', 'Chapati & Paneer', 'Khichdi', 'Dosa']
  }
];

const emptyMeal = () => ({ option1: '', option2: '' });

const formatDate = (d) => {
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const dateKey = (d) => d.toISOString().split('T')[0];

// ─── Main Component ───────────────────────────────────────────
export default function FoodView({ saveFoodMenu, loadFoodMenu }) {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [menu, setMenu] = useState({
    breakfast: emptyMeal(),
    lunch:     emptyMeal(),
    dinner:    emptyMeal()
  });

  // Editing states: { breakfast_1, breakfast_2, lunch_1, ... }
  const [editing, setEditing]   = useState(null);
  const [inputVal, setInputVal] = useState('');
  const [showSugg, setShowSugg] = useState(false);

  // Load saved menu whenever date changes
  useEffect(() => {
    const key = dateKey(selectedDate);
    const saved = loadFoodMenu ? loadFoodMenu(key) : null;
    if (saved) {
      setMenu(saved);
    } else {
      setMenu({ breakfast: emptyMeal(), lunch: emptyMeal(), dinner: emptyMeal() });
    }
    setEditing(null);
    setInputVal('');
  }, [selectedDate]);

  const startEdit = (mealKey, optNum, currentVal) => {
    setEditing(`${mealKey}_${optNum}`);
    setInputVal(currentVal);
    setShowSugg(false);
  };

  const saveEdit = (mealKey, optNum) => {
    const updated = {
      ...menu,
      [mealKey]: { ...menu[mealKey], [`option${optNum}`]: inputVal.trim() }
    };
    setMenu(updated);
    if (saveFoodMenu) saveFoodMenu(dateKey(selectedDate), updated);
    setEditing(null);
    setInputVal('');
    setShowSugg(false);
  };

  const clearOption = (mealKey, optNum) => {
    const updated = {
      ...menu,
      [mealKey]: { ...menu[mealKey], [`option${optNum}`]: '' }
    };
    setMenu(updated);
    if (saveFoodMenu) saveFoodMenu(dateKey(selectedDate), updated);
  };

  // Navigate dates
  const shiftDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d);
  };

  const isToday = dateKey(selectedDate) === dateKey(today);
  const isTomorrow = dateKey(selectedDate) === dateKey(new Date(today.getTime() + 86400000));

  const dateLabel = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : formatDate(selectedDate);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── HEADER ─────────────────────────────────────── */}
      <div className="cyber-card" style={{
        background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(168,85,247,0.08))',
        border: '1px solid rgba(245,158,11,0.2)',
        display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(245,158,11,0.4)',
            fontSize: '1.4rem'
          }}>🍽️</div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', fontFamily: 'var(--font-heading)', margin: 0 }}>
              Food Corner
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Plan your daily meals — Breakfast, Lunch & Dinner
            </p>
          </div>
        </div>

        {/* Date Navigator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button onClick={() => shiftDate(-1)} className="cyber-btn cyber-btn-secondary" style={{ padding: '0.5rem 0.8rem', fontSize: '1rem' }}>‹</button>
          <div style={{
            padding: '0.5rem 1rem',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem', fontWeight: '700',
            fontFamily: 'var(--font-heading)',
            color: isToday ? 'var(--warning)' : 'var(--text-main)',
            minWidth: '120px', textAlign: 'center'
          }}>
            {dateLabel}
          </div>
          <button onClick={() => shiftDate(1)} className="cyber-btn cyber-btn-secondary" style={{ padding: '0.5rem 0.8rem', fontSize: '1rem' }}>›</button>
          {!isToday && (
            <button onClick={() => setSelectedDate(today)} className="cyber-btn cyber-btn-secondary" style={{ padding: '0.5rem 0.7rem', fontSize: '0.75rem' }}>
              Today
            </button>
          )}
        </div>
      </div>

      {/* ── MENU CARDS ─────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
        {MEALS.map(meal => {
          const mealData = menu[meal.key] || emptyMeal();
          return (
            <div key={meal.key} className="cyber-card" style={{
              background: meal.gradient,
              border: `1px solid ${meal.border}`,
              padding: '1.2rem',
              position: 'relative',
              overflow: 'visible'
            }}>
              {/* Meal Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '1.2rem' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: `rgba(${meal.color === '#F59E0B' ? '245,158,11' : meal.color === '#10B981' ? '16,185,129' : '168,85,247'},0.2)`,
                  border: `1px solid ${meal.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4rem',
                  boxShadow: `0 4px 12px ${meal.glow}`
                }}>
                  {meal.emoji}
                </div>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '1.05rem', fontFamily: 'var(--font-heading)', color: meal.color }}>
                    {meal.label}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Clock size={10} /> {meal.time}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: meal.border, marginBottom: '1rem', opacity: 0.5 }} />

              {/* Options */}
              {[1, 2].map(optNum => {
                const editKey = `${meal.key}_${optNum}`;
                const isEditing = editing === editKey;
                const value = mealData[`option${optNum}`];

                return (
                  <div key={optNum} style={{ marginBottom: '0.8rem' }}>
                    {/* Option label */}
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>
                      Option {optNum}
                    </div>

                    {isEditing ? (
                      /* EDIT MODE */
                      <div style={{ position: 'relative' }}>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <input
                            autoFocus
                            className="cyber-input"
                            placeholder={`e.g. ${meal.suggestions[optNum - 1]}`}
                            value={inputVal}
                            onChange={e => { setInputVal(e.target.value); setShowSugg(true); }}
                            onKeyDown={e => {
                              if (e.key === 'Enter') saveEdit(meal.key, optNum);
                              if (e.key === 'Escape') { setEditing(null); setInputVal(''); setShowSugg(false); }
                            }}
                            style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
                          />
                          <button
                            onClick={() => saveEdit(meal.key, optNum)}
                            style={{ background: meal.color, border: 'none', borderRadius: '8px', color: '#000', cursor: 'pointer', padding: '0.4rem 0.6rem', flexShrink: 0, fontWeight: '700' }}
                          >
                            <Check size={15} />
                          </button>
                          <button
                            onClick={() => { setEditing(null); setInputVal(''); setShowSugg(false); }}
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.4rem 0.6rem', flexShrink: 0 }}
                          >
                            <X size={15} />
                          </button>
                        </div>

                        {/* Suggestions dropdown */}
                        {showSugg && inputVal.length === 0 && (
                          <div style={{
                            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                            background: '#131929', border: `1px solid ${meal.border}`,
                            borderRadius: '10px', zIndex: 50,
                            boxShadow: `0 8px 24px rgba(0,0,0,0.5)`,
                            overflow: 'hidden'
                          }}>
                            <div style={{ padding: '0.4rem 0.6rem', fontSize: '0.65rem', color: 'var(--text-subtle)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border-color)' }}>
                              ✨ Suggestions
                            </div>
                            {meal.suggestions.map(sug => (
                              <button
                                key={sug}
                                onClick={() => { setInputVal(sug); setShowSugg(false); }}
                                style={{
                                  display: 'block', width: '100%', textAlign: 'left',
                                  background: 'transparent', border: 'none',
                                  color: 'var(--text-main)', cursor: 'pointer',
                                  padding: '0.5rem 0.75rem', fontSize: '0.82rem',
                                  transition: 'background 0.15s', fontFamily: 'var(--font-body)'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                              >
                                {sug}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* DISPLAY MODE */
                      <div
                        onClick={() => startEdit(meal.key, optNum, value)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '0.6rem 0.8rem',
                          background: value ? `rgba(${meal.color === '#F59E0B' ? '245,158,11' : meal.color === '#10B981' ? '16,185,129' : '168,85,247'},0.08)` : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${value ? meal.border : 'rgba(255,255,255,0.06)'}`,
                          borderRadius: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          minHeight: '40px',
                          gap: '0.5rem'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = value ? `rgba(${meal.color === '#F59E0B' ? '245,158,11' : meal.color === '#10B981' ? '16,185,129' : '168,85,247'},0.12)` : 'rgba(255,255,255,0.06)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = value ? `rgba(${meal.color === '#F59E0B' ? '245,158,11' : meal.color === '#10B981' ? '16,185,129' : '168,85,247'},0.08)` : 'rgba(255,255,255,0.03)'; }}
                      >
                        {value ? (
                          <>
                            <span style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.88rem', flex: 1 }}>
                              🍴 {value}
                            </span>
                            <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                              <div style={{ color: meal.color, opacity: 0.7, display: 'flex', alignItems: 'center' }}><Edit3 size={13} /></div>
                              <button
                                onClick={e => { e.stopPropagation(); clearOption(meal.key, optNum); }}
                                style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', opacity: 0.6 }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <span style={{ color: 'var(--text-subtle)', fontSize: '0.82rem', fontStyle: 'italic' }}>
                              Tap to add {meal.label.toLowerCase()} option...
                            </span>
                            <Plus size={14} color="var(--text-subtle)" />
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Status indicator */}
              <div style={{ marginTop: '0.8rem', display: 'flex', justifyContent: 'flex-end' }}>
                {(mealData.option1 && mealData.option2) ? (
                  <span style={{ fontSize: '0.68rem', color: meal.color, fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Check size={11} /> Menu Set
                  </span>
                ) : (
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', fontWeight: '600' }}>
                    {mealData.option1 || mealData.option2 ? '1/2 filled' : 'No menu yet'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── TODAY'S SUMMARY CARD ──────────────────────── */}
      {isToday && (
        <div className="cyber-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Sparkles size={18} color="var(--warning)" />
            <h3 style={{ fontFamily: 'var(--font-heading)', margin: 0, fontSize: '1rem' }}>Today's Menu Summary</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '0.8rem' }}>
            {MEALS.map(meal => {
              const mealData = menu[meal.key] || emptyMeal();
              return (
                <div key={meal.key} style={{
                  padding: '0.8rem',
                  background: `rgba(${meal.color === '#F59E0B' ? '245,158,11' : meal.color === '#10B981' ? '16,185,129' : '168,85,247'},0.06)`,
                  borderRadius: '10px',
                  border: `1px solid ${meal.border}`,
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.2rem', marginBottom: '0.3rem' }}>{meal.emoji}</div>
                  <div style={{ fontSize: '0.7rem', fontWeight: '700', color: meal.color, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{meal.label}</div>
                  {mealData.option1 || mealData.option2 ? (
                    <>
                      {mealData.option1 && <div style={{ fontSize: '0.78rem', color: 'var(--text-main)', fontWeight: '600' }}>{mealData.option1}</div>}
                      {mealData.option2 && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>or {mealData.option2}</div>}
                    </>
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontStyle: 'italic' }}>Not planned</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
