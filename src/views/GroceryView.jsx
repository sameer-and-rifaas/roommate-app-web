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
      <div className="cyber-card mobile-wrap" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ color: 'var(--success)', marginBottom: '0.2rem' }}>🛒 Grocery List</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Keep track of what we need to buy for the room</p>
        </div>
      </div>

      {/* BUDGET PROGRESS TRACKER */}
      <div className="cyber-card cyber-card-green" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', fontWeight: '600' }}>
            <span style={{ color: 'var(--success)', fontSize: '0.85rem', letterSpacing: '0.5px' }}>GROCERY BUDGET</span>
            <span style={{ color: isBudgetWarning ? 'var(--danger)' : 'var(--text-main)', fontWeight: '800', fontSize: '1rem' }}>
              ₹{totalSpent.toFixed(0)} / ₹{budgetLimit.toFixed(0)}
            </span>
          </div>

          <div style={{ background: '#e2e8f0', height: '12px', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
            <div style={{ 
              background: isBudgetWarning ? 'var(--danger)' : 'var(--success)', 
              height: '100%', 
              width: `${Math.min(100, budgetRatio)}%`, 
              transition: 'width 0.5s ease-out'
            }}></div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.6rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <span>Spent: {budgetRatio.toFixed(1)}%</span>
            <span>Available: ₹{Math.max(0, budgetLimit - totalSpent).toFixed(0)}</span>
          </div>
        </div>

        {/* Adjust Budget limit input */}
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '0.6rem' }}>SET MONTHLY LIMIT (₹)</label>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <input 
              type="number" 
              className="cyber-input" 
              value={budgetLimit} 
              onChange={(e) => setBudgetLimit(Math.max(0, parseFloat(e.target.value) || 0))}
              style={{ padding: '0.6rem', width: '100%', marginBottom: 0 }}
            />
          </div>
        </div>
      </div>

      {/* LOWER PANEL: ADD FORM & GROCERY LIST */}
      <div className="mobile-grid">
        
        {/* Add grocery item */}
        <div className="cyber-card">
          <h3 style={{ color: editingId ? 'var(--danger)' : 'var(--text-main)', marginBottom: '1.2rem' }}>
            {editingId ? '✏️ Edit Item' : '➕ Add Item to List'}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '0.3rem' }}>ITEM NAME</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Milk, Eggs, Rice..." 
                className="cyber-input" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '0.3rem' }}>QUANTITY</label>
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
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '0.3rem' }}>EST. PRICE (₹)</label>
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
              <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', display: 'block', marginBottom: '0.3rem' }}>CATEGORY</label>
              <select 
                className="cyber-select" 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="Dairy">Dairy</option>
                <option value="Pantry">Pantry</option>
                <option value="Bakery">Bakery</option>
                <option value="Produce">Produce (Veggies/Fruits)</option>
                <option value="Cleaning">Cleaning / Chores</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button type="submit" className={`cyber-btn ${editingId ? 'cyber-btn-pink' : 'cyber-btn-green'}`} style={{ flex: 1, justifyContent: 'center' }}>
                {editingId ? <><Edit2 size={18} /> Update Item</> : <><Plus size={18} /> Add Item</>}
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit} className="cyber-btn cyber-btn-secondary" style={{ flex: 0.5, justifyContent: 'center' }}>
                  <XCircle size={18} /> Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Grocery Inventory Table */}
        <div className="cyber-card">
          <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>📦 Shopping List</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {groceries.map((item) => (
              <div key={item.id} style={{
                display: 'flex', flexDirection: 'column', gap: '0.8rem',
                background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem',
                opacity: editingId === item.id ? 0.5 : (item.purchased ? 0.6 : 1), 
                textDecoration: item.purchased ? 'line-through' : 'none'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '0.8rem', flex: 1 }}>
                    <button
                      onClick={() => toggleGroceryPurchased(item.id)}
                      style={{
                        background: item.purchased ? 'var(--success)' : 'transparent',
                        border: `2px solid var(--success)`,
                        borderRadius: '6px',
                        width: '24px', height: '24px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#fff',
                        flexShrink: 0,
                        marginTop: '0.2rem'
                      }}
                    >
                      {item.purchased && <Check size={16} strokeWidth={3} />}
                    </button>
                    <div>
                      <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '1.1rem', marginBottom: '0.2rem' }}>{item.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span>{item.quantity}</span>
                        <span>•</span>
                        <span className="cyber-badge badge-green" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>{item.category}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-main)' }}>₹{item.price || 0}</div>
                </div>
                
                <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem', paddingTop: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <select 
                    className="cyber-select" 
                    value={item.status} 
                    onChange={(e) => updateGroceryStatus(item.id, e.target.value)}
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', background: 'rgba(0,0,0,0.2)', width: 'auto', marginBottom: 0, borderRadius: '8px' }}
                    disabled={item.purchased}
                  >
                    <option value="Normal">Normal</option>
                    <option value="Low">Low</option>
                    <option value="Out of Stock">Out</option>
                  </select>

                  <div style={{ display: 'flex', gap: '1.2rem' }}>
                    <button 
                      onClick={() => startEdit(item)} 
                      style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => { if(window.confirm('Delete this grocery item?')) removeGrocery(item.id); }} 
                      style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {groceries.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '1rem', padding: '3rem' }}>No grocery items on the list.</p>
            )}
          </div>
        </div>

      </div>
      
    </div>
  );
}
