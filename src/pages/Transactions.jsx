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
  const [timeFilter, setTimeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const { addToast } = useToast();
  const isMobile = useIsMobile();
  const [form, setForm] = useState({ itemId: '', quantity: 1, note: '' });

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
    
    let matchTime = true;
    if (timeFilter !== 'all') {
      const txDate = new Date(tx.date);
      const now = new Date();
      if (timeFilter === 'day') {
        matchTime = txDate.toDateString() === now.toDateString();
      } else if (timeFilter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        matchTime = txDate >= weekAgo;
      } else if (timeFilter === 'month') {
        matchTime = txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
      } else if (timeFilter === 'year') {
        matchTime = txDate.getFullYear() === now.getFullYear();
      }
    }

    return matchType && matchSearch && matchTime;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  if (currentPage > totalPages) setCurrentPage(totalPages);
  
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);



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
        <div className="filter-scroll" style={{ marginTop: 8 }}>
          {[['all', 'За всё время'], ['day', 'День'], ['week', 'Неделя'], ['month', 'Месяц'], ['year', 'Год']].map(([v, l]) => (
            <button key={v} className={`chip ${timeFilter === v ? 'active' : ''}`} onClick={() => setTimeFilter(v)}>{l}</button>
          ))}
        </div>

        <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border-color)', marginBottom: 16 }}>
          {paginated.length > 0 ? paginated.map(tx => (
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

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="btn btn-ghost btn-sm">Назад</button>
            <div style={{ padding: '6px 12px', background: 'var(--bg-secondary)', borderRadius: 8, fontSize: 13, fontWeight: 500, border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center' }}>{currentPage} / {totalPages}</div>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="btn btn-ghost btn-sm">Вперёд</button>
          </div>
        )}

        {modalEl}
      </div>
    );
  }

  /* ──── DESKTOP ──── */
  return (
    <div>
      <div className="page-header" style={{ alignItems: 'flex-start' }}>
        <div>
          <div className="flex gap-3 items-center flex-wrap" style={{ marginBottom: 12 }}>
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
          <div className="filter-tabs">
            <button className={`filter-tab ${timeFilter === 'all' ? 'active' : ''}`} onClick={() => setTimeFilter('all')}>За всё время</button>
            <button className={`filter-tab ${timeFilter === 'day' ? 'active' : ''}`} onClick={() => setTimeFilter('day')}>День</button>
            <button className={`filter-tab ${timeFilter === 'week' ? 'active' : ''}`} onClick={() => setTimeFilter('week')}>Неделя</button>
            <button className={`filter-tab ${timeFilter === 'month' ? 'active' : ''}`} onClick={() => setTimeFilter('month')}>Месяц</button>
            <button className={`filter-tab ${timeFilter === 'year' ? 'active' : ''}`} onClick={() => setTimeFilter('year')}>Год</button>
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
                <th>Дата</th>
                <th>Тип</th>
                <th>Товар</th>
                <th>Кол-во</th>
                <th>Примечание</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length > 0 ? paginated.map(tx => (
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
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div>Показано: {paginated.length} из {filtered.length}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              Показывать по:
              <div style={{ display: 'flex', gap: 4 }}>
                {[10, 20, 50, 100].map(sz => (
                  <button
                    key={sz}
                    onClick={() => { setPageSize(sz); setCurrentPage(1); }}
                    style={{ 
                      minWidth: 28, height: 24, fontSize: 11, borderRadius: 6, fontWeight: 600, cursor: 'pointer', padding: '0 4px',
                      background: pageSize === sz ? 'var(--accent-gradient)' : 'transparent',
                      color: pageSize === sz ? '#fff' : 'var(--text-secondary)',
                      border: pageSize === sz ? 'none' : '1px solid var(--border-color)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s'
                    }}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: 6 }}>
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="btn btn-ghost btn-sm">Назад</button>
              <div style={{ padding: '6px 12px', background: 'var(--bg-tertiary)', borderRadius: 8, fontWeight: 500, border: '1px solid var(--border-color)' }}>
                {currentPage} из {totalPages}
              </div>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="btn btn-ghost btn-sm">Вперёд</button>
            </div>
          )}
        </div>
      </div>

      {modalEl}
    </div>
  );
}
