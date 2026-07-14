import React, { useState } from 'react';
import { Plus, Download, DollarSign, CheckCircle, PieChart, Info, Trash2, Edit2, XCircle } from 'lucide-react';
import CustomChart from '../components/CustomChart';

export default function ExpensesView({ expenses, addExpense, settleExpenses, deleteExpense, editExpense, currentUser }) {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Groceries');
  const [paidBy, setPaidBy] = useState(currentUser);
  const [showReport, setShowReport] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Compute stats
  let sameerUnsettled = 0;
  let rifaasUnsettled = 0;
  let sameerTotalSpent = 0;
  let rifaasTotalSpent = 0;
  
  // Category splits
  const categoryTotals = { Rent: 0, Food: 0, Groceries: 0, Travel: 0, Others: 0 };
  
  expenses.forEach(exp => {
    // Lifetime spent
    if (exp.paidBy === 'Sameer') sameerTotalSpent += exp.amount;
    else rifaasTotalSpent += exp.amount;

    // Unsettled
    if (!exp.settled) {
      if (exp.paidBy === 'Sameer') sameerUnsettled += exp.amount;
      else rifaasUnsettled += exp.amount;
    }
    
    // Accumulate for all expenses
    if (categoryTotals[exp.category] !== undefined) {
      categoryTotals[exp.category] += exp.amount;
    } else {
      categoryTotals.Others += exp.amount;
    }
  });

  const totalUnsettled = sameerUnsettled + rifaasUnsettled;
  const splitShare = totalUnsettled / 2;
  const balance = sameerUnsettled - splitShare; // sameerPaid - 50% share

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!desc.trim() || !amount || parseFloat(amount) <= 0) return;
    
    if (editingId) {
      editExpense(editingId, {
        description: desc,
        amount: parseFloat(amount),
        category,
        paidBy
      });
      setEditingId(null);
    } else {
      addExpense(desc, parseFloat(amount), category, paidBy);
    }
    
    setDesc('');
    setAmount('');
  };

  const startEdit = (exp) => {
    setEditingId(exp.id);
    setDesc(exp.description);
    setAmount(exp.amount);
    setCategory(exp.category);
    setPaidBy(exp.paidBy);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDesc('');
    setAmount('');
  };

  const handlePrint = () => {
    window.print();
  };

  // Convert categories data for chart
  const categories = Object.keys(categoryTotals);
  const categoryData = Object.values(categoryTotals);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
      
      {/* HEADER ACTION BAR */}
      <div className="cyber-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-hud)', color: 'var(--neon-cyan)', letterSpacing: '1px' }}>💰 QUANTUM EXPENSE LEDGER</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--cyber-gray)', fontFamily: 'var(--font-mono)' }}>AUTO-SPLIT SYSTEM: SYNCED // SPLIT_RATIO: 50%_EQUAL</p>
        </div>
        <button onClick={() => setShowReport(!showReport)} className="cyber-btn cyber-btn-cyan">
          <Download size={16} /> {showReport ? "Show Ledger View" : "Generate Invoice Report"}
        </button>
      </div>

      {!showReport ? (
        <>
          {/* USAGE STATS OVERVIEW */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="cyber-card" style={{ borderLeft: '4px solid var(--neon-cyan)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--cyber-gray)', fontFamily: 'var(--font-hud)' }}>SAMEER LIFETIME SPENDING</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', fontFamily: 'var(--font-mono)', color: '#fff' }}>
                  ₹{sameerTotalSpent.toFixed(2)}
                </div>
              </div>
              <DollarSign size={32} color="var(--neon-cyan)" style={{ opacity: 0.5 }} />
            </div>
            
            <div className="cyber-card" style={{ borderLeft: '4px solid var(--neon-purple)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--cyber-gray)', fontFamily: 'var(--font-hud)' }}>RIFAAS LIFETIME SPENDING</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', fontFamily: 'var(--font-mono)', color: '#fff' }}>
                  ₹{rifaasTotalSpent.toFixed(2)}
                </div>
              </div>
              <DollarSign size={32} color="var(--neon-purple)" style={{ opacity: 0.5 }} />
            </div>
          </div>

          {/* TOP SUMMARY PANELS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            
            <div className="cyber-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--cyber-gray)', fontFamily: 'var(--font-hud)' }}>TOTAL UNSETTLED BILLS</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', fontFamily: 'var(--font-mono)', color: '#fff', textShadow: '0 0 5px rgba(255,255,255,0.2)' }}>
                ₹{totalUnsettled.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--cyber-gray)', marginTop: '0.4rem' }}>
                Split share: ₹{splitShare.toFixed(2)} per roommate.
              </div>
            </div>

            <div className="cyber-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', borderColor: balance > 0 ? 'var(--neon-green)' : balance < 0 ? 'var(--neon-pink)' : 'var(--cyber-border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--cyber-gray)', fontFamily: 'var(--font-hud)' }}>BALANCE RECONCILIATION</div>
              {balance === 0 ? (
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--neon-cyan)', fontFamily: 'var(--font-mono)', marginTop: '0.5rem' }}>FULLY SYNCED</div>
              ) : balance > 0 ? (
                <>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--neon-green)', fontFamily: 'var(--font-mono)' }}>
                    ₹{balance.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--cyber-gray)', marginTop: '0.2rem' }}>
                    Sameer is owed. <span style={{ color: '#fff', fontWeight: 'bold' }}>Rifaas owes Sameer</span>.
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--neon-pink)', fontFamily: 'var(--font-mono)' }}>
                    ₹{Math.abs(balance).toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--cyber-gray)', marginTop: '0.2rem' }}>
                    Rifaas is owed. <span style={{ color: '#fff', fontWeight: 'bold' }}>Sameer owes Rifaas</span>.
                  </div>
                </>
              )}
            </div>

            {/* Settle Action Card */}
            <div className="cyber-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--cyber-gray)', fontFamily: 'var(--font-hud)', marginBottom: '0.5rem' }}>RESOLVE BALANCES</div>
              {balance === 0 ? (
                <button disabled className="cyber-btn cyber-btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>No Debts Due</button>
              ) : balance > 0 ? (
                <button onClick={() => settleExpenses('Rifaas', 'Sameer')} className="cyber-btn cyber-btn-green" style={{ width: '100%', justifyContent: 'center' }}>
                  <CheckCircle size={16} /> Settle Rifaas Owes Sameer
                </button>
              ) : (
                <button onClick={() => settleExpenses('Sameer', 'Rifaas')} className="cyber-btn cyber-btn-pink" style={{ width: '100%', justifyContent: 'center' }}>
                  <CheckCircle size={16} /> Settle Sameer Owes Rifaas
                </button>
              )}
            </div>

          </div>

          {/* LOWER LAYOUT: INPUT FORM & LISTING */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
            
            {/* Add Expense Form */}
            <div className="cyber-card">
              <h3 style={{ fontFamily: 'var(--font-hud)', color: editingId ? 'var(--neon-pink)' : '#fff', marginBottom: '1rem', letterSpacing: '0.5px' }}>
                {editingId ? '✏️ MODIFY TRANSACTION' : '➕ DEPLOY TRANSACTION'}
              </h3>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--cyber-gray)', display: 'block', marginBottom: '0.25rem', fontFamily: 'var(--font-hud)' }}>DESCRIPTION</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. WiFi Bill, Milk pack..." 
                    className="cyber-input" 
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--cyber-gray)', display: 'block', marginBottom: '0.25rem', fontFamily: 'var(--font-hud)' }}>AMOUNT (₹)</label>
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
                    <label style={{ fontSize: '0.75rem', color: 'var(--cyber-gray)', display: 'block', marginBottom: '0.25rem', fontFamily: 'var(--font-hud)' }}>CATEGORY</label>
                    <select 
                      className="cyber-select" 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)}
                      style={{ width: '100%', height: '38px' }}
                    >
                      <option value="Rent">Rent</option>
                      <option value="Food">Food</option>
                      <option value="Groceries">Groceries</option>
                      <option value="Travel">Travel</option>
                      <option value="Others">Others</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--cyber-gray)', display: 'block', marginBottom: '0.25rem', fontFamily: 'var(--font-hud)' }}>PAID BY</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      type="button" 
                      onClick={() => setPaidBy('Sameer')}
                      className={`cyber-btn ${paidBy === 'Sameer' ? 'cyber-btn' : 'cyber-btn-secondary'}`}
                      style={{ flex: 1, fontSize: '0.75rem', padding: '0.5rem' }}
                    >
                      Sameer
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setPaidBy('Rifaas')}
                      className={`cyber-btn ${paidBy === 'Rifaas' ? 'cyber-btn-purple' : 'cyber-btn-secondary'}`}
                      style={{ flex: 1, fontSize: '0.75rem', padding: '0.5rem' }}
                    >
                      Rifaas
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button type="submit" className={`cyber-btn ${editingId ? 'cyber-btn-pink' : ''}`} style={{ flex: 1, justifyContent: 'center' }}>
                    {editingId ? <><Edit2 size={16} /> Update</> : <><Plus size={16} /> Deploy</>}
                  </button>
                  {editingId && (
                    <button type="button" onClick={cancelEdit} className="cyber-btn cyber-btn-secondary" style={{ flex: 0.5, justifyContent: 'center' }}>
                      <XCircle size={16} /> Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Expense History Table */}
            <div className="cyber-card">
              <h3 style={{ fontFamily: 'var(--font-hud)', color: '#fff', marginBottom: '0.5rem' }}>📜 TRANSACTION HISTORY LOGS</h3>
              
              <div style={{ maxHeight: '310px', overflowY: 'auto' }}>
                <table className="cyber-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Category</th>
                      <th>Paid By</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((exp) => (
                      <tr key={exp.id} style={{ opacity: editingId === exp.id ? 0.5 : 1 }}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{exp.date}</td>
                        <td style={{ fontWeight: '500' }}>{exp.description}</td>
                        <td>
                          <span className={`cyber-badge ${exp.category === 'Rent' ? 'badge-pink' : exp.category === 'Food' ? 'badge-green' : exp.category === 'Groceries' ? 'badge-cyan' : 'badge-purple'}`} style={{ fontSize: '0.55rem' }}>
                            {exp.category}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{exp.paidBy}</td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>₹{exp.amount}</td>
                        <td>
                          {exp.settled ? (
                            <span style={{ color: 'var(--neon-green)', fontSize: '0.75rem', fontFamily: 'var(--font-hud)' }}>● SETTLED</span>
                          ) : (
                            <span style={{ color: 'var(--neon-pink)', fontSize: '0.75rem', fontFamily: 'var(--font-hud)' }}>⚡ UNSETTLED</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button onClick={() => startEdit(exp)} style={{ background: 'transparent', border: 'none', color: 'var(--neon-cyan)', cursor: 'pointer' }}>
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => { if(window.confirm('Delete this expense?')) deleteExpense(exp.id); }} style={{ background: 'transparent', border: 'none', color: 'var(--neon-pink)', cursor: 'pointer' }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {expenses.length === 0 && (
                  <p style={{ textAlign: 'center', color: 'var(--cyber-gray)', fontSize: '0.8rem', padding: '2rem' }}>No transactions recorded.</p>
                )}
              </div>
            </div>

          </div>

          {/* CATEGORY SPENDING CHARTS */}
          <div className="cyber-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
            <div>
              <CustomChart 
                type="bar" 
                title="Expense category breakdown" 
                data={categoryData} 
                labels={categories} 
                color="var(--neon-cyan)" 
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h4 style={{ fontFamily: 'var(--font-hud)', color: '#fff', fontSize: '0.9rem', marginBottom: '0.5rem', borderBottom: '1px solid rgba(0,240,255,0.1)', paddingBottom: '0.25rem' }}>STATISTICAL READOUTS:</h4>
              {categories.map((cat, idx) => (
                <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--cyber-gray)' }}>{cat} Total:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: '#fff' }}>₹{categoryTotals[cat].toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* PRINTABLE INVOICE STYLE STATEMENT */
        <div className="cyber-card" style={{ background: '#fff', color: '#000', filter: 'none', border: '1px solid #000', padding: '2.5rem', borderRadius: '4px' }}>
          
          {/* Invoice Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-hud)', fontSize: '2rem', margin: 0, fontWeight: 'bold' }}>ROOMMATE SYNC</h1>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>OS-STATEMENT // SYNC-LEDGER</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>INVOICE SUMMARY</h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>DATE: {new Date().toISOString().split('T')[0]}</p>
            </div>
          </div>

          {/* Bill-to details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            <div>
              <strong>ROOM DETAILS:</strong>
              <div>Room 304, Tech Dorms</div>
              <div>Sameer & Rifaas</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <strong>RECONCILIATION DEBTS:</strong>
              {balance === 0 ? (
                <div>All accounts are settled. Balance is 0.</div>
              ) : balance > 0 ? (
                <div>Rifaas owes Sameer: <strong>₹{balance.toFixed(2)}</strong></div>
              ) : (
                <div>Sameer owes Rifaas: <strong>₹{Math.abs(balance).toFixed(2)}</strong></div>
              )}
            </div>
          </div>

          {/* Table of Bills */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #000', textAlign: 'left' }}>
                <th style={{ padding: '0.5rem 0' }}>Date</th>
                <th style={{ padding: '0.5rem 0' }}>Description</th>
                <th style={{ padding: '0.5rem 0' }}>Category</th>
                <th style={{ padding: '0.5rem 0' }}>Paid By</th>
                <th style={{ padding: '0.5rem 0', textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(exp => (
                <tr key={exp.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.5rem 0', fontFamily: 'var(--font-mono)' }}>{exp.date}</td>
                  <td style={{ padding: '0.5rem 0' }}>{exp.description}</td>
                  <td style={{ padding: '0.5rem 0' }}>{exp.category}</td>
                  <td style={{ padding: '0.5rem 0' }}>{exp.paidBy}</td>
                  <td style={{ padding: '0.5rem 0', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>₹{exp.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Bottom totals */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', borderTop: '1.5px solid #000', paddingTop: '1rem', fontSize: '0.9rem' }}>
            <div style={{ marginBottom: '0.3rem' }}>Total Unsettled: <strong>₹{totalUnsettled.toFixed(2)}</strong></div>
            <div>Autosplit Split Share (50-50): <strong>₹{splitShare.toFixed(2)}</strong></div>
          </div>

          {/* Signatures */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', marginTop: '4rem', textAlign: 'center', fontSize: '0.8rem' }}>
            <div>
              <div style={{ borderTop: '1px solid #000', width: '150px', margin: '0 auto 0.3rem auto' }}></div>
              Sameer (Resident Signature)
            </div>
            <div>
              <div style={{ borderTop: '1px solid #000', width: '150px', margin: '0 auto 0.3rem auto' }}></div>
              Rifaas (Resident Signature)
            </div>
          </div>

          {/* Print button container (hide in print itself) */}
          <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem', justifyContent: 'center' }} className="no-print">
            <button onClick={handlePrint} className="cyber-btn cyber-btn-green" style={{ background: 'var(--neon-green-glow)', color: '#000', borderColor: '#000' }}>
              <Download size={16} /> Print / Save as PDF
            </button>
            <button onClick={() => setShowReport(false)} className="cyber-btn cyber-btn-secondary" style={{ color: '#000', borderColor: '#000' }}>
              Close Invoice view
            </button>
          </div>

        </div>
      )}
      
    </div>
  );
}
