import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useIsMobile } from '../hooks/useIsMobile';
import { initialTransactions, initialInventory } from '../data/mockData';
import { useToast } from '../context/ToastContext';
import { ArrowDownLeft, ArrowUpRight, X, Search, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const getStatus = (q) => q === 0 ? 'out-of-stock' : q < 10 ? 'low-stock' : 'in-stock';

export function Transactions() {
  const [transactions, setTransactions] = useLocalStorage('inventory-transactions', initialTransactions);
  const [inventory, setInventory] = useLocalStorage('inventory-data', initialInventory);
  const [modal, setModal] = useState(false);
  const [txType, setTxType] = useState('in');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const { addToast } = useToast();
  const isMobile = useIsMobile();
  const [form, setForm] = useState({ itemId: '', quantity: 1, note: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  const getItemName = (id) => inventory.find(i => i.id === id)?.name || '—';

  const openModal = (type) => {
    setTxType(type);
    setForm({ itemId: inventory[0]?.id || '', quantity: 1, note: '' });
    setModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const target = inventory.find(i => i.id === form.itemId);
    if (!target) return;
    let newQ = target.quantity;
    if (txType === 'in') { newQ += Number(form.quantity); }
    else {
      if (newQ < Number(form.quantity)) { addToast('Недостаточно товара!', 'error'); return; }
      newQ -= Number(form.quantity);
    }
    setInventory(inventory.map(i => i.id === form.itemId ? { ...i, quantity: newQ, status: getStatus(newQ) } : i));
    setTransactions([{ id: uuidv4(), date: new Date().toISOString(), type: txType, itemId: form.itemId, quantity: Number(form.quantity), note: form.note }, ...transactions]);
    addToast(txType === 'in' ? 'Приход оформлен' : 'Расход оформлен', 'success');
    setModal(false);
  };

  let filtered = transactions.filter(tx => {
    const matchType = filter === 'all' || tx.type === filter;
    const matchSearch = search === '' || getItemName(tx.itemId).toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  if (sortConfig.key) {
    filtered.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      if (sortConfig.key === 'item') {
        aVal = getItemName(a.itemId).toLowerCase();
        bVal = getItemName(b.itemId).toLowerCase();
      }
      if (sortConfig.key === 'date') {
        aVal = new Date(a.date).getTime();
        bVal = new Date(b.date).getTime();
      }
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ArrowUpDown size={14} style={{ opacity: 0.3, marginLeft: 4 }} />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} style={{ marginLeft: 4 }} /> : <ChevronDown size={14} style={{ marginLeft: 4 }} />;
  };

  /* ──── MODAL (shared) ──── */
  const modalEl = modal && (
    <div className="modal-overlay" onClick={() => setModal(false)}>
      <div className={isMobile ? "modal-sheet" : "modal-content"} onClick={e => e.stopPropagation()}>
        {isMobile && <div className="modal-handle" />}
        {!isMobile && (
          <div className="modal-header">
            <h3 className="modal-title">{txType === 'in' ? 'Оформление прихода' : 'Оформление расхода'}</h3>
            <button className="btn-icon" onClick={() => setModal(false)}><X size={18} /></button>
          </div>
        )}
        {isMobile && <div className="modal-title">{txType === 'in' ? 'Оформить приход' : 'Оформить расход'}</div>}
        <form onSubmit={handleSubmit}>
          <div className={isMobile ? "m-input-group" : "input-group"}>
            <label className={isMobile ? "m-label" : "input-label"}>Товар</label>
            <select className={isMobile ? "m-input" : "input-field"} required value={form.itemId} onChange={e => setForm({ ...form, itemId: e.target.value })}>
              {inventory.map(i => <option key={i.id} value={i.id}>{i.name} {!isMobile && `(${i.sku})`} — {i.quantity} шт.</option>)}
            </select>
          </div>
          <div className={isMobile ? "m-input-group" : "input-group"}>
            <label className={isMobile ? "m-label" : "input-label"}>Количество</label>
            <input type="number" min="1" className={isMobile ? "m-input" : "input-field"} required value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
          </div>
          <div className={isMobile ? "m-input-group" : "input-group"}>
            <label className={isMobile ? "m-label" : "input-label"}>Примечание</label>
            <input className={isMobile ? "m-input" : "input-field"} value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: isMobile ? 10 : 12, marginTop: isMobile ? 8 : 16 }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setModal(false)}>Отмена</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Провести</button>
          </div>
        </form>
      </div>
    </div>
  );

  /* ──── MOBILE ──── */
  if (isMobile) {
    return (
      <div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <button className="btn btn-success btn-sm" style={{ flex: 1 }} onClick={() => openModal('in')}><ArrowDownLeft size={16} /> Приход</button>
          <button className="btn btn-danger btn-sm" style={{ flex: 1 }} onClick={() => openModal('out')}><ArrowUpRight size={16} /> Расход</button>
        </div>

        <div className="filter-scroll">
          {[['all', 'Все'], ['in', 'Приход'], ['out', 'Расход']].map(([v, l]) => (
            <button key={v} className={`chip ${filter === v ? 'active' : ''}`} onClick={() => setFilter(v)}>{l}</button>
          ))}
        </div>

        <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          {filtered.length > 0 ? filtered.map(tx => (
            <div key={tx.id} className="list-item">
              <div className="list-item-icon" style={{ background: tx.type === 'in' ? 'var(--success-light)' : 'var(--danger-light)', color: tx.type === 'in' ? 'var(--success)' : 'var(--danger)' }}>
                {tx.type === 'in' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
              </div>
              <div className="list-item-content">
                <div className="list-item-title">{getItemName(tx.itemId)}</div>
                <div className="list-item-sub">{new Date(tx.date).toLocaleDateString('ru-RU')} · {tx.note || '—'}</div>
              </div>
              <div className="list-item-right">
                <div className="list-item-qty" style={{ color: tx.type === 'in' ? 'var(--success)' : 'var(--danger)' }}>
                  {tx.type === 'in' ? '+' : '-'}{tx.quantity}
                </div>
              </div>
            </div>
          )) : <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>Нет операций</div>}
        </div>

        {modalEl}
      </div>
    );
  }

  /* ──── DESKTOP ──── */
  return (
    <div>
      <div className="page-header">
        <div className="flex gap-3 items-center flex-wrap">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input placeholder="Поиск по товару..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="filter-tabs">
            <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Все</button>
            <button className={`filter-tab ${filter === 'in' ? 'active' : ''}`} onClick={() => setFilter('in')}>Приход</button>
            <button className={`filter-tab ${filter === 'out' ? 'active' : ''}`} onClick={() => setFilter('out')}>Расход</button>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-success btn-sm" onClick={() => openModal('in')}><ArrowDownLeft size={16} /> Приход</button>
          <button className="btn btn-danger btn-sm" onClick={() => openModal('out')}><ArrowUpRight size={16} /> Расход</button>
        </div>
      </div>

      <div className="card card-no-hover">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('date')} style={{ cursor: 'pointer' }}>Дата {getSortIcon('date')}</th>
                <th onClick={() => handleSort('type')} style={{ cursor: 'pointer' }}>Тип {getSortIcon('type')}</th>
                <th onClick={() => handleSort('item')} style={{ cursor: 'pointer' }}>Товар {getSortIcon('item')}</th>
                <th onClick={() => handleSort('quantity')} style={{ cursor: 'pointer' }}>Кол-во {getSortIcon('quantity')}</th>
                <th onClick={() => handleSort('note')} style={{ cursor: 'pointer' }}>Примечание {getSortIcon('note')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(tx => (
                <tr key={tx.id}>
                  <td style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(tx.date).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  <td><span className={`badge ${tx.type === 'in' ? 'badge-success' : 'badge-danger'}`}>
                    {tx.type === 'in' ? <><ArrowDownLeft size={12}/> Приход</> : <><ArrowUpRight size={12}/> Расход</>}
                  </span></td>
                  <td style={{ fontWeight: 500 }}>{getItemName(tx.itemId)}</td>
                  <td style={{ fontWeight: 600 }}>{tx.quantity} шт.</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{tx.note || '—'}</td>
                </tr>
              )) : <tr><td colSpan="5" className="empty-state">Нет операций</td></tr>}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)' }}>Показано: {filtered.length} из {transactions.length}</div>
      </div>

      {modalEl}
    </div>
  );
}
