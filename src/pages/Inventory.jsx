import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useIsMobile } from '../hooks/useIsMobile';
import { initialInventory, categories, locations } from '../data/mockData';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import { Plus, Edit2, Trash2, Search, X, Download, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const getStatus = (q) => q === 0 ? 'out-of-stock' : q < 10 ? 'low-stock' : 'in-stock';
const statusLabel = { 'in-stock': 'В наличии', 'low-stock': 'Мало', 'out-of-stock': 'Нет' };
const statusBadge = { 'in-stock': 'badge-success', 'low-stock': 'badge-warning', 'out-of-stock': 'badge-danger' };

export function Inventory() {
  const [inventory, setInventory] = useLocalStorage('inventory-data', initialInventory);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('Все');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const { addToast } = useToast();
  const confirm = useConfirm();
  const isMobile = useIsMobile();
  const emptyForm = { sku: '', name: '', category: categories[0], quantity: 0, price: 0, supplier: '', location: locations[0] };
  const [form, setForm] = useState(emptyForm);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  let filtered = inventory.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'Все' || i.category === catFilter;
    return matchSearch && matchCat;
  });

  if (sortConfig.key) {
    filtered.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
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

  const openModal = (item = null) => {
    if (item) { setEditing(item); setForm({ ...item }); }
    else { setEditing(null); setForm(emptyForm); }
    setModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = Number(form.quantity); const p = Number(form.price);
    if (editing) {
      setInventory(inventory.map(i => i.id === editing.id ? { ...form, id: i.id, quantity: q, price: p, status: getStatus(q) } : i));
      addToast('Товар обновлён', 'success');
    } else {
      setInventory([...inventory, { ...form, id: uuidv4(), quantity: q, price: p, status: getStatus(q) }]);
      addToast('Товар добавлен', 'success');
    }
    setModal(false); setEditing(null);
  };

  const handleDelete = async (id) => {
    if (!await confirm('Удалить этот товар?')) return;
    setInventory(inventory.filter(i => i.id !== id));
    addToast('Товар удалён', 'error');
  };

  const exportCSV = () => {
    const header = 'Артикул;Название;Категория;Количество;Цена;Склад\n';
    const rows = inventory.map(i => `${i.sku};${i.name};${i.category};${i.quantity};${i.price};${i.location || ''}`).join('\n');
    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'inventory.csv'; a.click();
    addToast('Экспорт завершён', 'info');
  };

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  /* ──── MOBILE MODAL ──── */
  const mobileModal = modal && (
    <div className="modal-overlay" onClick={() => setModal(false)}>
      <div className={isMobile ? "modal-sheet" : "modal-content"} onClick={e => e.stopPropagation()}>
        {isMobile && <div className="modal-handle" />}
        <div className={isMobile ? "" : "modal-header"} style={isMobile ? { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 } : undefined}>
          <h3 className="modal-title">{editing ? 'Редактировать товар' : 'Новый товар'}</h3>
          {isMobile && editing && <button type="button" className="btn btn-danger btn-sm" onClick={async () => { await handleDelete(editing.id); setModal(false); }}>Удалить</button>}
          {!isMobile && <button type="button" className="btn-icon" onClick={() => setModal(false)}><X size={18} /></button>}
        </div>
        <form onSubmit={handleSubmit}>
          <div className={isMobile ? "grid-2m" : "grid grid-2 gap-4"}>
            <div className={isMobile ? "m-input-group" : "input-group"}>
              <label className={isMobile ? "m-label" : "input-label"}>Артикул</label>
              <input className={isMobile ? "m-input" : "input-field"} required value={form.sku} onChange={e => set('sku', e.target.value)} />
            </div>
            <div className={isMobile ? "m-input-group" : "input-group"}>
              <label className={isMobile ? "m-label" : "input-label"}>Категория</label>
              <select className={isMobile ? "m-input" : "input-field"} value={form.category} onChange={e => set('category', e.target.value)}>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className={isMobile ? "m-input-group" : "input-group"}>
            <label className={isMobile ? "m-label" : "input-label"}>Название</label>
            <input className={isMobile ? "m-input" : "input-field"} required value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div className={isMobile ? "grid-2m" : "grid grid-2 gap-4"}>
            <div className={isMobile ? "m-input-group" : "input-group"}>
              <label className={isMobile ? "m-label" : "input-label"}>Количество</label>
              <input type="number" min="0" className={isMobile ? "m-input" : "input-field"} required value={form.quantity} onChange={e => set('quantity', e.target.value)} />
            </div>
            <div className={isMobile ? "m-input-group" : "input-group"}>
              <label className={isMobile ? "m-label" : "input-label"}>Цена (₸)</label>
              <input type="number" min="0" className={isMobile ? "m-input" : "input-field"} required value={form.price} onChange={e => set('price', e.target.value)} />
            </div>
          </div>
          {!isMobile && (
            <div className="grid grid-2 gap-4">
              <div className="input-group"><label className="input-label">Поставщик</label><input className="input-field" value={form.supplier || ''} onChange={e => set('supplier', e.target.value)} /></div>
              <div className="input-group"><label className="input-label">Склад</label><select className="input-field" value={form.location || locations[0]} onChange={e => set('location', e.target.value)}>{locations.map(l => <option key={l}>{l}</option>)}</select></div>
            </div>
          )}
          {isMobile && (
            <div className="m-input-group">
              <label className="m-label">Склад</label>
              <select className="m-input" value={form.location || locations[0]} onChange={e => set('location', e.target.value)}>{locations.map(l => <option key={l}>{l}</option>)}</select>
            </div>
          )}
          <div style={{ display: 'flex', gap: isMobile ? 10 : 12, marginTop: isMobile ? 8 : 16 }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setModal(false)}>Отмена</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  );

  /* ──── MOBILE VIEW ──── */
  if (isMobile) {
    return (
      <div>
        <div className="m-search">
          <Search size={16} />
          <input placeholder="Поиск товара..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="filter-scroll">
          {['Все', ...categories].map(c => (
            <button key={c} className={`chip ${catFilter === c ? 'active' : ''}`} onClick={() => setCatFilter(c)}>{c}</button>
          ))}
        </div>

        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>Найдено: {filtered.length}</div>

        <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          {filtered.length > 0 ? filtered.map(item => (
            <div key={item.id} className="list-item" onClick={() => openModal(item)}>
              <div className="list-item-content">
                <div className="list-item-title">{item.name}</div>
                <div className="list-item-sub">{item.sku} · {item.category}</div>
              </div>
              <div className="list-item-right">
                <div className="list-item-qty">{item.quantity}</div>
                <div className="list-item-price">{item.price.toLocaleString()} ₸</div>
                <span className={`badge ${statusBadge[getStatus(item.quantity)]}`} style={{ marginTop: 4 }}>
                  {statusLabel[getStatus(item.quantity)]}
                </span>
              </div>
            </div>
          )) : <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>Ничего не найдено</div>}
        </div>

        <button className="fab" onClick={() => openModal()}><Plus size={24} /></button>
        {mobileModal}
      </div>
    );
  }

  /* ──── DESKTOP VIEW ──── */
  return (
    <div>
      <div className="page-header">
        <div className="flex gap-3 items-center flex-wrap">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input placeholder="Поиск по названию или артикулу..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="filter-tabs">
            {['Все', ...categories].map(c => (
              <button key={c} className={`filter-tab ${catFilter === c ? 'active' : ''}`} onClick={() => setCatFilter(c)}>{c}</button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost btn-sm" onClick={exportCSV}><Download size={16} /> CSV</button>
          <button className="btn btn-primary" onClick={() => openModal()}><Plus size={18} /> Добавить</button>
        </div>
      </div>

      <div className="card card-no-hover">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('sku')} style={{ cursor: 'pointer' }}>Артикул {getSortIcon('sku')}</th>
                <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>Название {getSortIcon('name')}</th>
                <th onClick={() => handleSort('category')} style={{ cursor: 'pointer' }}>Категория {getSortIcon('category')}</th>
                <th onClick={() => handleSort('location')} style={{ cursor: 'pointer' }}>Склад {getSortIcon('location')}</th>
                <th onClick={() => handleSort('quantity')} style={{ cursor: 'pointer' }}>Кол-во {getSortIcon('quantity')}</th>
                <th onClick={() => handleSort('price')} style={{ cursor: 'pointer' }}>Цена {getSortIcon('price')}</th>
                <th>Статус</th>
                <th style={{width:90}}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(item => (
                <tr key={item.id}>
                  <td style={{ color: 'var(--text-muted)', fontWeight: 600, fontFamily: 'monospace' }}>{item.sku}</td>
                  <td style={{ fontWeight: 500 }}>{item.name}</td>
                  <td><span className="badge badge-accent">{item.category}</span></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{item.location || '—'}</td>
                  <td style={{ fontWeight: 600 }}>{item.quantity}</td>
                  <td>{item.price.toLocaleString()} ₸</td>
                  <td><span className={`badge ${statusBadge[getStatus(item.quantity)]}`}>{statusLabel[getStatus(item.quantity)]}</span></td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn-icon" onClick={() => openModal(item)} title="Редактировать"><Edit2 size={15} /></button>
                      <button className="btn-icon" onClick={() => handleDelete(item.id)} title="Удалить" style={{ color: 'var(--danger)' }}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="8" className="empty-state">Товары не найдены</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)' }}>
          Показано: {filtered.length} из {inventory.length}
        </div>
      </div>

      {mobileModal}
    </div>
  );
}
