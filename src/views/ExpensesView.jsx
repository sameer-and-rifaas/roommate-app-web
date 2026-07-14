import React, { useState } from 'react';
import { Plus, Download, DollarSign, CheckCircle, Trash2, Edit2, XCircle, FileText, Users, User, Pencil, Check } from 'lucide-react';
import CustomChart from '../components/CustomChart';


const DEFAULT_PERSON_BUDGET = 5000;

export default function ExpensesView({ expenses, addExpense, deleteExpense, editExpense, currentUser, users = {} }) {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Groceries');
  const [paidBy, setPaidBy] = useState(currentUser);
  const [splitFor, setSplitFor] = useState('shared'); // 'shared', 'Sameer', 'Rifaas'
  const [showReport, setShowReport] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expenseFilter, setExpenseFilter] = useState('All');
  const [showAllHistory, setShowAllHistory] = useState(false);

  // Editable budgets
  const [sameerBudget, setSameerBudget] = useState(DEFAULT_PERSON_BUDGET);
  const [rifaasBudget, setRifaasBudget] = useState(DEFAULT_PERSON_BUDGET);
  const [editingBudget, setEditingBudget] = useState(null); // 'sameer' | 'rifaas' | 'room'
  const [budgetInputVal, setBudgetInputVal] = useState('');

  const ROOM_BUDGET = sameerBudget + rifaasBudget;

  const saveBudget = (who) => {
    const val = parseFloat(budgetInputVal);
    if (!isNaN(val) && val >= 0) {
      if (who === 'sameer') setSameerBudget(val);
      else if (who === 'rifaas') setRifaasBudget(val);
      else if (who === 'room') {
        const half = val / 2;
        setSameerBudget(half);
        setRifaasBudget(half);
      }
    }
    setEditingBudget(null);
    setBudgetInputVal('');
  };

  const startBudgetEdit = (who, currentVal) => {
    setEditingBudget(who);
    setBudgetInputVal(currentVal.toString());
  };

  // --- BUDGET CALCULATIONS ---
  // For each expense, calculate how much it deducts from each person's ₹5000
  let sameerBudgetUsed = 0;
  let rifaasBudgetUsed = 0;
  const categoryTotals = { Rent: 0, 'E-Bill': 0, Food: 0, Groceries: 0, Travel: 0, Others: 0 };

  expenses.forEach(exp => {
    const sf = exp.splitFor || 'shared';
    if (sf === 'shared') {
      sameerBudgetUsed += exp.amount / 2;
      rifaasBudgetUsed += exp.amount / 2;
    } else if (sf === 'Sameer') {
      sameerBudgetUsed += exp.amount;
    } else if (sf === 'Rifaas') {
      rifaasBudgetUsed += exp.amount;
    }

    if (categoryTotals[exp.category] !== undefined) {
      categoryTotals[exp.category] += exp.amount;
    } else {
      categoryTotals.Others += exp.amount;
    }
  });

  const sameerRemaining = sameerBudget - sameerBudgetUsed;
  const rifaasRemaining = rifaasBudget - rifaasBudgetUsed;
  const totalSpent = sameerBudgetUsed + rifaasBudgetUsed;
  const totalRemaining = ROOM_BUDGET - totalSpent;

  // Who paid calculations for settlement
  let sameerPaid = 0;
  let rifaasPaid = 0;
  expenses.forEach(exp => {
    if (exp.paidBy === 'Sameer') sameerPaid += exp.amount;
    else rifaasPaid += exp.amount;
  });
  // Settlement: sameerShouldPay = sameerBudgetUsed, rifaasShouldPay = rifaasBudgetUsed
  // If sameer paid more than his share, rifaas owes him. Vice versa.
  const sameerBalance = sameerPaid - sameerBudgetUsed; // positive = rifaas owes sameer

  // Monthly filter
  const currentMonth = new Date().toISOString().slice(0, 7);
  const thisMonthExpenses = expenses.filter(exp => exp.date && exp.date.startsWith(currentMonth));

  // Filtered for table
  const filteredExpenses = expenses.filter(exp => {
    if (expenseFilter === 'All') return true;
    if (expenseFilter === 'Sameer') return (exp.splitFor === 'Sameer' || exp.splitFor === 'shared');
    if (expenseFilter === 'Rifaas') return (exp.splitFor === 'Rifaas' || exp.splitFor === 'shared');
    return true;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!desc.trim() || !amount || parseFloat(amount) <= 0) return;

    if (editingId) {
      editExpense(editingId, {
        description: desc,
        amount: parseFloat(amount),
        category,
        paidBy,
        splitFor
      });
      setEditingId(null);
    } else {
      addExpense(desc, parseFloat(amount), category, paidBy, splitFor);
    }

    setDesc('');
    setAmount('');
    setSplitFor('shared');
  };

  const startEdit = (exp) => {
    setEditingId(exp.id);
    setDesc(exp.description);
    setAmount(exp.amount);
    setCategory(exp.category);
    setPaidBy(exp.paidBy);
    setSplitFor(exp.splitFor || 'shared');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDesc('');
    setAmount('');
    setSplitFor('shared');
  };

  const handlePrint = () => window.print();

  const categories = Object.keys(categoryTotals);
  const categoryData = Object.values(categoryTotals);

  const getSplitLabel = (splitFor) => {
    if (splitFor === 'shared') return '50/50';
    return splitFor + ' only';
  };

  const getSplitDeduction = (exp) => {
    const sf = exp.splitFor || 'shared';
    if (sf === 'shared') return `₹${(exp.amount / 2).toFixed(0)} each`;
    return `₹${exp.amount.toFixed(0)} (${sf})`;
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>

      {/* HEADER ACTION BAR */}
      <div className="cyber-card mobile-wrap" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: '1 1 200px' }}>
          <h2 style={{ color: 'var(--primary)', marginBottom: '0.2rem' }}>💰 Monthly Expenses</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Each person gets ₹5,000/month · Shared expenses are split equally (50/50)
          </p>
        </div>
        <button onClick={() => setShowReport(!showReport)} className="cyber-btn cyber-btn-cyan" style={{ flex: '0 0 auto', width: 'auto', padding: '0.6rem 1rem', fontSize: '0.85rem' }}>
          <FileText size={18} style={{ marginRight: '6px' }} /> {showReport ? 'Back to Dashboard' : 'Monthly Statement'}
        </button>
      </div>

      {!showReport ? (
        <>
          {/* ── ROOM TOTAL (full width) ── */}
          <div className="cyber-card" style={{ borderTop: '4px solid var(--green)', textAlign: 'center', position: 'relative' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text2)', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>🏠 ROOM TOTAL</div>
            {editingBudget === 'room' ? (
              <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', margin: '0.4rem 0' }}>
                <input type="number" min="0" autoFocus className="cyber-input" style={{ width: '100px', textAlign: 'center', padding: '0.3rem' }}
                  value={budgetInputVal} onChange={e => setBudgetInputVal(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveBudget('room'); if (e.key === 'Escape') setEditingBudget(null); }} />
                <button onClick={() => saveBudget('room')} style={{ background: 'var(--green)', border: 'none', borderRadius: '6px', color: '#000', cursor: 'pointer', padding: '0.3rem 0.5rem' }}><Check size={14} /></button>
                <button onClick={() => setEditingBudget(null)} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text2)', cursor: 'pointer', padding: '0.3rem 0.5rem' }}><XCircle size={14} /></button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text2)', marginBottom: '0.2rem' }}>
                Budget: <strong style={{ color: 'var(--text)' }}>₹{ROOM_BUDGET.toLocaleString()}</strong>
                <button onClick={() => startBudgetEdit('room', ROOM_BUDGET)} style={{ background: 'transparent', border: 'none', color: 'var(--green)', cursor: 'pointer', padding: 0, lineHeight: 1 }}><Pencil size={12} /></button>
              </div>
            )}
            <div style={{ fontSize: '0.85rem', color: 'var(--red)', marginBottom: '0.4rem' }}>Spent: <strong>₹{totalSpent.toFixed(0)}</strong></div>
            <div style={{ fontSize: '2rem', fontWeight: '900', color: totalRemaining < 0 ? 'var(--red)' : 'var(--green)' }}>₹{totalRemaining.toFixed(0)}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text2)' }}>remaining</div>
            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', marginTop: '0.8rem', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min((totalSpent / ROOM_BUDGET) * 100, 100)}%`, height: '100%', background: totalRemaining < 0 ? 'var(--red)' : 'var(--green)', transition: 'width 0.5s' }} />
            </div>
          </div>

          {/* ── SAMEER + RIFAAS (2 columns side by side) ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            {/* Sameer */}
            <div className="cyber-card" style={{ borderTop: '4px solid var(--purple)', textAlign: 'center', padding: '14px 10px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--purple)', fontWeight: '700', marginBottom: '0.3rem' }}>👤 SAMEER</div>
              {editingBudget === 'sameer' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', margin: '0.3rem 0' }}>
                  <input type="number" min="0" autoFocus className="cyber-input" style={{ textAlign: 'center', padding: '0.3rem', fontSize: '0.8rem' }}
                    value={budgetInputVal} onChange={e => setBudgetInputVal(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveBudget('sameer'); if (e.key === 'Escape') setEditingBudget(null); }} />
                  <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'center' }}>
                    <button onClick={() => saveBudget('sameer')} style={{ background: 'var(--purple)', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer', padding: '0.2rem 0.5rem' }}><Check size={12} /></button>
                    <button onClick={() => setEditingBudget(null)} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text2)', cursor: 'pointer', padding: '0.2rem 0.5rem' }}><XCircle size={12} /></button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text2)', marginBottom: '0.2rem' }}>
                  ₹{sameerBudget.toLocaleString()}
                  <button onClick={() => startBudgetEdit('sameer', sameerBudget)} style={{ background: 'transparent', border: 'none', color: 'var(--purple)', cursor: 'pointer', padding: 0, lineHeight: 1 }}><Pencil size={11} /></button>
                </div>
              )}
              <div style={{ fontSize: '0.75rem', color: 'var(--red)' }}>Spent: ₹{sameerBudgetUsed.toFixed(0)}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '900', color: sameerRemaining < 0 ? 'var(--red)' : 'var(--purple)', marginTop: '4px' }}>₹{sameerRemaining.toFixed(0)}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text2)' }}>remaining</div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', marginTop: '8px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min((sameerBudgetUsed / sameerBudget) * 100, 100)}%`, height: '100%', background: sameerRemaining < 0 ? 'var(--red)' : 'var(--purple)', transition: 'width 0.5s' }} />
              </div>
            </div>

            {/* Rifaas */}
            <div className="cyber-card" style={{ borderTop: '4px solid var(--teal)', textAlign: 'center', padding: '14px 10px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--teal)', fontWeight: '700', marginBottom: '0.3rem' }}>👤 RIFAAS</div>
              {editingBudget === 'rifaas' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', margin: '0.3rem 0' }}>
                  <input type="number" min="0" autoFocus className="cyber-input" style={{ textAlign: 'center', padding: '0.3rem', fontSize: '0.8rem' }}
                    value={budgetInputVal} onChange={e => setBudgetInputVal(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveBudget('rifaas'); if (e.key === 'Escape') setEditingBudget(null); }} />
                  <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'center' }}>
                    <button onClick={() => saveBudget('rifaas')} style={{ background: 'var(--teal)', border: 'none', borderRadius: '6px', color: '#000', cursor: 'pointer', padding: '0.2rem 0.5rem' }}><Check size={12} /></button>
                    <button onClick={() => setEditingBudget(null)} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text2)', cursor: 'pointer', padding: '0.2rem 0.5rem' }}><XCircle size={12} /></button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text2)', marginBottom: '0.2rem' }}>
                  ₹{rifaasBudget.toLocaleString()}
                  <button onClick={() => startBudgetEdit('rifaas', rifaasBudget)} style={{ background: 'transparent', border: 'none', color: 'var(--teal)', cursor: 'pointer', padding: 0, lineHeight: 1 }}><Pencil size={11} /></button>
                </div>
              )}
              <div style={{ fontSize: '0.75rem', color: 'var(--red)' }}>Spent: ₹{rifaasBudgetUsed.toFixed(0)}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '900', color: rifaasRemaining < 0 ? 'var(--red)' : 'var(--teal)', marginTop: '4px' }}>₹{rifaasRemaining.toFixed(0)}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text2)' }}>remaining</div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', marginTop: '8px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min((rifaasBudgetUsed / rifaasBudget) * 100, 100)}%`, height: '100%', background: rifaasRemaining < 0 ? 'var(--red)' : 'var(--teal)', transition: 'width 0.5s' }} />
              </div>
            </div>
          </div>

          {/* SETTLEMENT BANNER */}

          <div className="cyber-card mobile-wrap" style={{
            background: sameerBalance === 0 ? 'rgba(0,200,100,0.08)' : 'rgba(255,200,0,0.08)',
            borderColor: sameerBalance === 0 ? 'var(--neon-green)' : 'var(--warning)',
            alignItems: 'center', padding: '1rem 1.5rem'
          }}>
            <span style={{ fontSize: '1.5rem' }}>{sameerBalance === 0 ? '✅' : '⚖️'}</span>
            <div>
              {sameerBalance === 0 ? (
                <strong style={{ color: 'var(--neon-green)' }}>All settled! No one owes anyone.</strong>
              ) : sameerBalance > 0 ? (
                <span><strong style={{ color: 'var(--primary)' }}>Rifaas</strong> owes <strong style={{ color: 'var(--primary)' }}>Sameer ₹{Math.abs(sameerBalance).toFixed(0)}</strong> <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>(Sameer paid more in cash)</span></span>
              ) : (
                <span><strong style={{ color: 'var(--secondary)' }}>Sameer</strong> owes <strong style={{ color: 'var(--secondary)' }}>Rifaas ₹{Math.abs(sameerBalance).toFixed(0)}</strong> <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>(Rifaas paid more in cash)</span></span>
              )}
            </div>
          </div>

          {/* LOWER LAYOUT — stacked on phone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.2rem' }}>

            {/* Add Expense Form */}
            <div className="cyber-card">
              <h3 style={{ color: editingId ? 'var(--danger)' : 'var(--text-main)', marginBottom: '1.2rem' }}>
                {editingId ? '✏️ Edit Expense' : '➕ Add New Expense'}
              </h3>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '0.3rem' }}>WHAT WAS IT FOR?</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rent, E-Bill, Groceries..."
                    className="cyber-input"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '0.3rem' }}>AMOUNT (₹)</label>
                    <input
                      type="number"
                      required
                      min="0.01"
                      step="0.01"
                      placeholder="800"
                      className="cyber-input"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '0.3rem' }}>CATEGORY</label>
                    <select
                      className="cyber-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      style={{ width: '100%' }}
                    >
                      <option value="Rent">Rent</option>
                      <option value="E-Bill">E-Bill</option>
                      <option value="Food">Food</option>
                      <option value="Groceries">Groceries</option>
                      <option value="Travel">Travel</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>
                </div>

                {/* WHO IS THIS FOR? */}
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>WHO IS THIS FOR?</label>
                  <div className="mobile-wrap">
                    <button
                      type="button"
                      onClick={() => setSplitFor('shared')}
                      className={`cyber-btn ${splitFor === 'shared' ? 'cyber-btn-cyan' : 'cyber-btn-secondary'}`}
                      style={{ flex: 1, padding: '0.6rem', fontSize: '0.8rem', flexDirection: 'column', gap: '0.2rem' }}
                    >
                      <Users size={16} />
                      <span>Shared (50/50)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSplitFor('Sameer')}
                      className={`cyber-btn ${splitFor === 'Sameer' ? 'cyber-btn' : 'cyber-btn-secondary'}`}
                      style={{ flex: 1, padding: '0.6rem', fontSize: '0.8rem', flexDirection: 'column', gap: '0.2rem' }}
                    >
                      <User size={16} />
                      <span>Sameer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSplitFor('Rifaas')}
                      className={`cyber-btn ${splitFor === 'Rifaas' ? 'cyber-btn-purple' : 'cyber-btn-secondary'}`}
                      style={{ flex: 1, padding: '0.6rem', fontSize: '0.8rem', flexDirection: 'column', gap: '0.2rem' }}
                    >
                      <User size={16} />
                      <span>Rifaas</span>
                    </button>
                  </div>
                </div>

                {/* WHO PAID? */}
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>WHO PAID THE CASH?</label>
                  <div className="mobile-wrap">
                    <button
                      type="button"
                      onClick={() => setPaidBy('Sameer')}
                      className={`cyber-btn ${paidBy === 'Sameer' ? 'cyber-btn' : 'cyber-btn-secondary'}`}
                      style={{ flex: 1, padding: '0.6rem' }}
                    >
                      Sameer
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaidBy('Rifaas')}
                      className={`cyber-btn ${paidBy === 'Rifaas' ? 'cyber-btn-purple' : 'cyber-btn-secondary'}`}
                      style={{ flex: 1, padding: '0.6rem' }}
                    >
                      Rifaas
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button type="submit" className={`cyber-btn ${editingId ? 'cyber-btn-pink' : 'cyber-btn-green'}`} style={{ flex: 1, justifyContent: 'center' }}>
                    {editingId ? <><Edit2 size={18} /> Update</> : <><Plus size={18} /> Save Expense</>}
                  </button>
                  {editingId && (
                    <button type="button" onClick={cancelEdit} className="cyber-btn cyber-btn-secondary" style={{ flex: 0.5, justifyContent: 'center' }}>
                      <XCircle size={18} /> Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Expense History — Card list (mobile friendly) */}
            <div className="cyber-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ color: 'var(--text-main)', margin: 0 }}>📜 Expense History</h3>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button onClick={() => setExpenseFilter('All')} className={`cyber-btn ${expenseFilter === 'All' ? 'cyber-btn-cyan' : 'cyber-btn-secondary'}`} style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }}>All</button>
                  <button onClick={() => setExpenseFilter('Sameer')} className={`cyber-btn ${expenseFilter === 'Sameer' ? 'cyber-btn' : 'cyber-btn-secondary'}`} style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }}>Sameer</button>
                  <button onClick={() => setExpenseFilter('Rifaas')} className={`cyber-btn ${expenseFilter === 'Rifaas' ? 'cyber-btn-purple' : 'cyber-btn-secondary'}`} style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }}>Rifaas</button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {filteredExpenses.length === 0 && (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No expenses recorded yet.</p>
                )}
                {(showAllHistory ? filteredExpenses : filteredExpenses.slice(0, 5)).map((exp) => (
                  <div key={exp.id} style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    opacity: editingId === exp.id ? 0.4 : 1,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '2px' }}>{exp.description}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{exp.date} · {exp.category} · Paid by <strong>{exp.paidBy}</strong></div>
                        <div style={{ marginTop: '4px', fontSize: '0.75rem' }}>
                          <span style={{
                            padding: '2px 8px', borderRadius: '8px', fontWeight: '700',
                            background: exp.splitFor === 'shared' ? 'rgba(16,185,129,0.15)' : exp.splitFor === 'Sameer' ? 'rgba(108,99,255,0.15)' : 'rgba(139,92,246,0.15)',
                            color: exp.splitFor === 'shared' ? 'var(--green)' : exp.splitFor === 'Sameer' ? 'var(--purple)' : 'var(--purple2)'
                          }}>
                            {getSplitLabel(exp.splitFor || 'shared')}
                          </span>
                          <span style={{ marginLeft: '6px', color: 'var(--text-muted)' }}>{getSplitDeduction(exp)}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', marginLeft: '8px' }}>
                        <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-main)' }}>₹{exp.amount}</div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => startEdit(exp)} style={{ background: 'transparent', border: 'none', color: 'var(--purple)', cursor: 'pointer', padding: '2px' }}>
                            <Edit2 size={15} />
                          </button>
                          <button onClick={() => { if (window.confirm('Delete this expense?')) deleteExpense(exp.id); }} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '2px' }}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredExpenses.length > 5 && (
                  <button 
                    onClick={() => setShowAllHistory(!showAllHistory)}
                    style={{ 
                      background: 'rgba(255,255,255,0.05)', 
                      border: '1px solid var(--border-color)', 
                      color: 'var(--text-main)', 
                      padding: '0.8rem', 
                      borderRadius: '8px', 
                      cursor: 'pointer', 
                      fontWeight: '700', 
                      marginTop: '0.5rem',
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      alignItems: 'center'
                    }}
                  >
                    {showAllHistory ? 'Show Less ⬆' : `View All ${filteredExpenses.length} Expenses ⬇`}
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* CATEGORY SPENDING CHARTS */}
          <div className="cyber-card" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.2rem' }}>
            <div>
              <CustomChart
                type="bar"
                title="What do we spend on?"
                data={categoryData}
                labels={categories}
                color="var(--primary)"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <h4 style={{ color: 'var(--text-main)', fontSize: '1.1rem', marginBottom: '0.5rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>Category Breakdown:</h4>
              {categories.map((cat) => (
                <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: '500' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{cat} Total:</span>
                  <span style={{ color: 'var(--text-main)', fontWeight: '700' }}>₹{categoryTotals[cat].toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* MONTHLY STATEMENT — Printable */
        <div className="cyber-card" style={{ background: '#fff', color: '#000', padding: '1.5rem', borderRadius: '8px', width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>

          {/* Header */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderBottom: '3px solid #000', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '1.8rem', margin: 0, fontWeight: '900' }}>ROOMMATE SYNC</h1>
              <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.9rem', color: '#555' }}>Monthly Expense Statement</p>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem' }}>STATEMENT DATE</h3>
              <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.9rem', color: '#666' }}>{new Date().toISOString().split('T')[0]}</p>
            </div>
          </div>

          {/* Individual Budget Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ border: '2px solid #000', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontWeight: '800', fontSize: '1rem', marginBottom: '0.5rem' }}>🏠 ROOM TOTAL</div>
              <div>Budget: <strong>₹{ROOM_BUDGET.toLocaleString()}</strong></div>
              <div>Spent: <strong>₹{totalSpent.toFixed(0)}</strong></div>
              <div style={{ fontSize: '1.4rem', fontWeight: '900', marginTop: '0.5rem', color: totalRemaining < 0 ? 'red' : 'green' }}>₹{totalRemaining.toFixed(0)} left</div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div style={{ border: '2px solid #007bff', borderRadius: '8px', padding: '0.5rem', textAlign: 'center', fontSize: '0.85rem' }}>
                <div style={{ fontWeight: '800', fontSize: '0.9rem', marginBottom: '0.5rem', color: '#007bff' }}>👤 SAMEER</div>
                <div>Budget: <strong>₹{sameerBudget.toLocaleString()}</strong></div>
                <div>Spent: <strong>₹{sameerBudgetUsed.toFixed(0)}</strong></div>
                <div style={{ fontSize: '1.1rem', fontWeight: '900', marginTop: '0.5rem', color: sameerRemaining < 0 ? 'red' : '#007bff' }}>₹{sameerRemaining.toFixed(0)}</div>
              </div>
              <div style={{ border: '2px solid #9c27b0', borderRadius: '8px', padding: '0.5rem', textAlign: 'center', fontSize: '0.85rem' }}>
                <div style={{ fontWeight: '800', fontSize: '0.9rem', marginBottom: '0.5rem', color: '#9c27b0' }}>👤 RIFAAS</div>
                <div>Budget: <strong>₹{rifaasBudget.toLocaleString()}</strong></div>
                <div>Spent: <strong>₹{rifaasBudgetUsed.toFixed(0)}</strong></div>
                <div style={{ fontSize: '1.1rem', fontWeight: '900', marginTop: '0.5rem', color: rifaasRemaining < 0 ? 'red' : '#9c27b0' }}>₹{rifaasRemaining.toFixed(0)}</div>
              </div>
            </div>
          </div>

          {/* Settlement */}
          <div style={{ background: '#f8f9fa', border: '2px solid #333', borderRadius: '8px', padding: '1rem', marginBottom: '2rem', textAlign: 'center', fontSize: '1.1rem' }}>
            <strong>SETTLEMENT: </strong>
            {sameerBalance === 0 ? '✅ All settled! No one owes anyone.' :
              sameerBalance > 0 ? `Rifaas owes Sameer ₹${Math.abs(sameerBalance).toFixed(0)}` :
                `Sameer owes Rifaas ₹${Math.abs(sameerBalance).toFixed(0)}`}
          </div>

          {/* Expense Table */}
          <div style={{ overflowX: 'auto', marginBottom: '2rem', width: '100%' }}>
            <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #000', textAlign: 'left', background: '#f0f0f0' }}>
                <th style={{ padding: '0.8rem 0.5rem' }}>Date</th>
                <th style={{ padding: '0.8rem 0.5rem' }}>Description</th>
                <th style={{ padding: '0.8rem 0.5rem' }}>Category</th>
                <th style={{ padding: '0.8rem 0.5rem' }}>For</th>
                <th style={{ padding: '0.8rem 0.5rem' }}>Paid By</th>
                <th style={{ padding: '0.8rem 0.5rem', textAlign: 'right' }}>Total</th>
                <th style={{ padding: '0.8rem 0.5rem', textAlign: 'right' }}>Sameer's Share</th>
                <th style={{ padding: '0.8rem 0.5rem', textAlign: 'right' }}>Rifaas's Share</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(exp => {
                const sf = exp.splitFor || 'shared';
                const sS = sf === 'shared' ? exp.amount / 2 : sf === 'Sameer' ? exp.amount : 0;
                const rS = sf === 'shared' ? exp.amount / 2 : sf === 'Rifaas' ? exp.amount : 0;
                return (
                  <tr key={exp.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '0.7rem 0.5rem', color: '#555' }}>{exp.date}</td>
                    <td style={{ padding: '0.7rem 0.5rem', fontWeight: 'bold' }}>{exp.description}</td>
                    <td style={{ padding: '0.7rem 0.5rem' }}>{exp.category}</td>
                    <td style={{ padding: '0.7rem 0.5rem', fontSize: '0.85rem' }}>{getSplitLabel(exp.splitFor || 'shared')}</td>
                    <td style={{ padding: '0.7rem 0.5rem' }}>{exp.paidBy}</td>
                    <td style={{ padding: '0.7rem 0.5rem', textAlign: 'right', fontWeight: 'bold' }}>₹{exp.amount.toFixed(0)}</td>
                    <td style={{ padding: '0.7rem 0.5rem', textAlign: 'right', color: sS > 0 ? '#007bff' : '#aaa' }}>
                      {sS > 0 ? `₹${sS.toFixed(0)}` : '-'}
                    </td>
                    <td style={{ padding: '0.7rem 0.5rem', textAlign: 'right', color: rS > 0 ? '#9c27b0' : '#aaa' }}>
                      {rS > 0 ? `₹${rS.toFixed(0)}` : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid #000', fontWeight: '900', background: '#f0f0f0' }}>
                <td colSpan={5} style={{ padding: '0.8rem 0.5rem', textAlign: 'right' }}>TOTALS:</td>
                <td style={{ padding: '0.8rem 0.5rem', textAlign: 'right' }}>₹{totalSpent.toFixed(0)}</td>
                <td style={{ padding: '0.8rem 0.5rem', textAlign: 'right', color: '#007bff' }}>₹{sameerBudgetUsed.toFixed(0)}</td>
                <td style={{ padding: '0.8rem 0.5rem', textAlign: 'right', color: '#9c27b0' }}>₹{rifaasBudgetUsed.toFixed(0)}</td>
              </tr>
            </tfoot>
          </table>
          </div>

          {/* Signatures */}
          <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '2rem', marginTop: '4rem', textAlign: 'center' }}>
            <div>
              <div style={{ borderTop: '2px solid #000', width: '150px', margin: '0 auto 0.5rem auto' }}></div>
              Sameer (Signature)
            </div>
            <div>
              <div style={{ borderTop: '2px solid #000', width: '150px', margin: '0 auto 0.5rem auto' }}></div>
              Rifaas (Signature)
            </div>
          </div>

          {/* Print buttons */}
          <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem', justifyContent: 'center' }} className="no-print">
            <button onClick={handlePrint} className="cyber-btn cyber-btn-cyan" style={{ fontSize: '1rem' }}>
              <Download size={18} /> Print Statement
            </button>
            <button onClick={() => setShowReport(false)} className="cyber-btn cyber-btn-secondary" style={{ fontSize: '1rem' }}>
              Close
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
