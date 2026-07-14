import React, { useState } from 'react';
import { Plus, Trash2, Check, Edit2, XCircle } from 'lucide-react';

export default function GroceryView({ groceries, addGrocery, editGrocery, toggleGroceryPurchased, updateGroceryStatus, removeGrocery }) {
  const [name, setName] = useState('');
  const [qty, setQty] = useState('');
  const [category, setCategory] = useState('Pantry');
  const [price, setPrice] = useState('');
  const [budgetLimit, setBudgetLimit] = useState(5000); // Default ₹5000 budget cap
  const [editingId, setEditingId] = useState(null);

  // Budget calculations
  const totalSpent = groceries
    .filter(g => g.purchased)
    .reduce((sum, item) => sum + (item.price || 0), 0);
    
  const plannedSpent = groceries.reduce((sum, item) => sum + (item.price || 0), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !qty.trim()) return;

    if (editingId) {
      editGrocery(editingId, {
        name,
        quantity: qty,
        category,
        price: price ? parseFloat(price) : 0
      });
      setEditingId(null);
    } else {
      addGrocery(name, qty, category, price ? parseFloat(price) : 0);
    }
    
    setName('');
    setQty('');
    setPrice('');
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setName(item.name);
    setQty(item.quantity);
    setCategory(item.category);
    setPrice(item.price ? item.price.toString() : '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName('');
    setQty('');
    setPrice('');
  };

  const budgetRatio = budgetLimit > 0 ? (totalSpent / budgetLimit) * 100 : 0;
  const isBudgetWarning = budgetRatio >= 90;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
      
      {/* HEADER CONTROLLER */}
      <div className="cyber-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-hud)', color: 'var(--neon-green)', letterSpacing: '1px' }}>🛒 COLLABORATIVE GROCERY DATABASE</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--cyber-gray)', fontFamily: 'var(--font-mono)' }}>TRACKER: SYNCED // OUT_OF_STOCK_ALERTS: ENGAGED</p>
        </div>
      </div>

      {/* BUDGET PROGRESS TRACKER */}
      <div className="cyber-card cyber-card-green" style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '2rem', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontFamily: 'var(--font-hud)', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--neon-green)' }}>GROCERY BUDGET LIMIT BAR</span>
            <span style={{ color: isBudgetWarning ? 'var(--neon-pink)' : '#fff', fontFamily: 'var(--font-mono)' }}>
              ₹{totalSpent.toFixed(2)} / ₹{budgetLimit.toFixed(2)} spent ({budgetRatio.toFixed(1)}%)
            </span>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.05)', height: '10px', borderRadius: '5px', overflow: 'hidden', position: 'relative' }}>
            <div style={{ 
              background: isBudgetWarning ? 'var(--neon-pink)' : 'var(--neon-green)', 
              height: '100%', 
              width: `${Math.min(100, budgetRatio)}%`, 
              boxShadow: isBudgetWarning ? '0 0 10px var(--neon-pink)' : '0 0 10px var(--neon-green-glow)',
              transition: 'width 0.5s ease-out'
            }}></div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', fontSize: '0.7rem', color: 'var(--cyber-gray)' }}>
            <span>PLANNED (UNPURCHASED + BOUGHT): ₹{plannedSpent.toFixed(2)}</span>
            <span>REST: ₹{Math.max(0, budgetLimit - totalSpent).toFixed(2)} AVAILABLE</span>
          </div>
        </div>

        {/* Adjust Budget limit input */}
        <div style={{ borderLeft: '1px solid rgba(57,255,20,0.15)', paddingLeft: '1.5rem' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--cyber-gray)', fontFamily: 'var(--font-hud)', display: 'block', marginBottom: '0.25rem' }}>SET BUDGET CAP</label>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <input 
              type="number" 
              className="cyber-input" 
              value={budgetLimit} 
              onChange={(e) => setBudgetLimit(Math.max(0, parseFloat(e.target.value) || 0))}
              style={{ padding: '0.4rem' }}
            />
          </div>
        </div>
      </div>

      {/* LOWER PANEL: ADD FORM & GROCERY LIST */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        
        {/* Add grocery item */}
        <div className="cyber-card">
          <h3 style={{ fontFamily: 'var(--font-hud)', color: editingId ? 'var(--neon-pink)' : '#fff', marginBottom: '1rem' }}>
            {editingId ? '✏️ MODIFY ITEM' : '➕ DEPLOY ITEM'}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--cyber-gray)', display: 'block', marginBottom: '0.25rem', fontFamily: 'var(--font-hud)' }}>ITEM NAME</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Milk, Eggs, Rice..." 
                className="cyber-input" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '0.5rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--cyber-gray)', display: 'block', marginBottom: '0.25rem', fontFamily: 'var(--font-hud)' }}>QTY / SIZE</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. 2 Packets, 1 kg" 
                  className="cyber-input" 
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--cyber-gray)', display: 'block', marginBottom: '0.25rem', fontFamily: 'var(--font-hud)' }}>EST. PRICE (₹)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 60" 
                  className="cyber-input" 
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--cyber-gray)', display: 'block', marginBottom: '0.25rem', fontFamily: 'var(--font-hud)' }}>CATEGORY</label>
              <select 
                className="cyber-select" 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', height: '38px' }}
              >
                <option value="Dairy">Dairy</option>
                <option value="Pantry">Pantry</option>
                <option value="Bakery">Bakery</option>
                <option value="Produce">Produce (Veggies/Fruits)</option>
                <option value="Cleaning">Cleaning / Chores</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button type="submit" className={`cyber-btn ${editingId ? 'cyber-btn-pink' : 'cyber-btn-green'}`} style={{ flex: 1, justifyContent: 'center' }}>
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

        {/* Grocery Inventory Table */}
        <div className="cyber-card">
          <h3 style={{ fontFamily: 'var(--font-hud)', color: '#fff', marginBottom: '0.5rem' }}>📦 SHARED GROCERY INVENTORY</h3>
          
          <div style={{ maxHeight: '310px', overflowY: 'auto' }}>
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Item Name</th>
                  <th>Qty</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {groceries.map((item) => (
                  <tr key={item.id} style={{ opacity: editingId === item.id ? 0.5 : (item.purchased ? 0.6 : 1), textDecoration: item.purchased ? 'line-through' : 'none' }}>
                    <td>
                      {/* Check purchased toggle */}
                      <button
                        onClick={() => toggleGroceryPurchased(item.id)}
                        style={{
                          background: item.purchased ? 'var(--neon-green)' : 'transparent',
                          border: '1px solid var(--neon-green)',
                          borderRadius: '4px',
                          width: '18px', height: '18px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer',
                          color: '#000'
                        }}
                      >
                        {item.purchased && <Check size={12} strokeWidth={3} />}
                      </button>
                    </td>
                    <td style={{ fontWeight: '600', color: '#fff' }}>{item.name}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{item.quantity}</td>
                    <td>
                      <span className="cyber-badge badge-green" style={{ fontSize: '0.55rem' }}>
                        {item.category}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>₹{item.price || 0}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }} className="no-print">
                        {/* Status Select dropdown */}
                        <select 
                          className="cyber-select" 
                          value={item.status} 
                          onChange={(e) => updateGroceryStatus(item.id, e.target.value)}
                          style={{ fontSize: '0.65rem', padding: '0.1rem 0.3rem', height: '24px', background: '#070814' }}
                          disabled={item.purchased}
                        >
                          <option value="Normal">Normal</option>
                          <option value="Low">Low</option>
                          <option value="Out of Stock">Out</option>
                        </select>

                        {/* Edit */}
                        <button 
                          onClick={() => startEdit(item)} 
                          style={{ background: 'transparent', border: 'none', color: 'var(--neon-cyan)', cursor: 'pointer' }}
                        >
                          <Edit2 size={14} />
                        </button>

                        {/* Trash */}
                        <button 
                          onClick={() => { if(window.confirm('Delete this grocery item?')) removeGrocery(item.id); }} 
                          style={{ background: 'transparent', border: 'none', color: 'var(--neon-pink)', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {groceries.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--cyber-gray)', fontSize: '0.8rem', padding: '2rem' }}>No grocery entries found.</p>
            )}
          </div>
        </div>

      </div>
      
    </div>
  );
}
