import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useIsMobile } from '../hooks/useIsMobile';
import { initialInventory, initialTransactions, categories, locations, initialSuppliers } from '../data/mockData';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import { Plus, Edit2, Trash2, Search, X, Download, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const getStatus = (q) => q === 0 ? 'out-of-stock' : q < 10 ? 'low-stock' : 'in-stock';
const statusLabel = { 'in-stock': 'В наличии', 'low-stock': 'Мало', 'out-of-stock': 'Нет' };
const statusBadge = { 'in-stock': 'badge-success', 'low-stock': 'badge-warning', 'out-of-stock': 'badge-danger' };

export function Inventory() {
  const [inventory, setInventory] = useLocalStorage('inventory-data', initialInventory);
  const [transactions, setTransactions] = useLocalStorage('inventory-transactions', initialTransactions);
  const [suppliers] = useLocalStorage('inventory-suppliers', initialSuppliers);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('Все');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const { addToast } = useToast();
  const confirm = useConfirm();
  const isMobile = useIsMobile();
  const emptyForm = { sku: '', name: '', category: '', quantity: '', price: '', supplier: '', location: '' };
  const [form, setForm] = useState(emptyForm);
  const [catOpen, setCatOpen] = useState(false);
  const [locOpen, setLocOpen] = useState(false);
  const [supOpen, setSupOpen] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const allCategories = Array.from(new Set([...categories, ...inventory.map(i => i.category).filter(Boolean)]));
  const allLocations = Array.from(new Set([...locations, ...inventory.map(i => i.location).filter(Boolean)]));

  const filteredCategories = allCategories.filter(c => c.toLowerCase().includes((form.category || '').toLowerCase()));
  const filteredLocations = allLocations.filter(c => c.toLowerCase().includes((form.location || '').toLowerCase()));
  const allSupplierNames = suppliers.map(s => s.name);
  const filteredSuppliers = allSupplierNames.filter(c => c.toLowerCase().includes((form.supplier || '').toLowerCase()));

  let filtered = inventory.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'Все' || i.category === catFilter;
    return matchSearch && matchCat;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  if (currentPage > totalPages) setCurrentPage(totalPages);
  
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);



  const openModal = (item = null) => {
    if (item) { setEditing(item); setForm({ ...item }); }
    else { setEditing(null); setForm(emptyForm); }
    setCatOpen(false);
    setLocOpen(false);
    setSupOpen(false);
    setModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = Number(form.quantity); const p = Number(form.price);
    if (editing) {
      const oldQ = Number(editing.quantity || 0);
      setInventory(inventory.map(i => i.id === editing.id ? { ...form, id: i.id, quantity: q, price: p, status: getStatus(q) } : i));
      
      if (q !== oldQ) {
        const txIndex = transactions.findIndex(tx => tx.itemId === editing.id && tx.type === 'in');
        if (txIndex !== -1) {
          const newTransactions = [...transactions];
          newTransactions[txIndex] = { 
            ...newTransactions[txIndex], 
            quantity: Math.max(0, newTransactions[txIndex].quantity + (q - oldQ))
          };
          setTransactions(newTransactions);
        } else if (q > oldQ) {
          const newTx = {
            id: uuidv4(),
            date: new Date().toISOString(),
            type: 'in',
            itemId: editing.id,
            quantity: q - oldQ,
            note: 'Корректировка остатков'
          };
          setTransactions([newTx, ...transactions]);
        }
      }
      addToast('Товар обновлён', 'success');
    } else {
      const newId = uuidv4();
      setInventory([...inventory, { ...form, id: newId, quantity: q, price: p, status: getStatus(q) }]);
      
      if (q > 0) {
        const newTx = {
          id: uuidv4(),
          date: new Date().toISOString(),
          type: 'in',
          itemId: newId,
          quantity: q,
          note: 'Начальный остаток'
        };
        setTransactions([newTx, ...transactions]);
      }
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
            <div className={isMobile ? "m-input-group" : "input-group"} style={{ position: 'relative' }}>
              <label className={isMobile ? "m-label" : "input-label"}>Категория</label>
              <div className="custom-select-wrapper">
                <input 
                  className={isMobile ? "m-input" : "input-field"} 
                  style={{ width: '100%', paddingRight: 36 }}
                  required 
                  value={form.category} 
                  onChange={e => { set('category', e.target.value); setCatOpen(true); }} 
                  onFocus={() => setCatOpen(true)}
                  onBlur={() => setTimeout(() => setCatOpen(false), 200)}
                  placeholder="Выберите или введите..." 
                />
                <ChevronDown size={16} className="custom-select-icon" onClick={() => setCatOpen(!catOpen)} />
                {catOpen && filteredCategories.length > 0 && (
                  <div className="custom-dropdown-list">
                    {filteredCategories.map(c => (
                      <div 
                        key={c} 
                        className="custom-dropdown-item" 
                        onMouseDown={(e) => { e.preventDefault(); set('category', c); setCatOpen(false); }}
                      >
                        {c}
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
          <div className={isMobile ? "" : "grid grid-2 gap-4"}>
            <div className={isMobile ? "m-input-group" : "input-group"} style={{ position: 'relative' }}>
              <label className={isMobile ? "m-label" : "input-label"}>Поставщик</label>
              <div className="custom-select-wrapper">
                <input 
                  className={isMobile ? "m-input" : "input-field"} 
                  style={{ width: '100%', paddingRight: 36 }}
                  value={form.supplier || ''} 
                  onChange={e => { set('supplier', e.target.value); setSupOpen(true); }} 
                  onFocus={() => setSupOpen(true)}
                  onBlur={() => setTimeout(() => setSupOpen(false), 200)}
                  placeholder="Выберите или введите..." 
                />
                <ChevronDown size={16} className="custom-select-icon" onClick={() => setSupOpen(!supOpen)} />
                {supOpen && filteredSuppliers.length > 0 && (
                  <div className="custom-dropdown-list" style={{ bottom: isMobile ? '100%' : 'auto', top: isMobile ? 'auto' : 'calc(100% + 6px)', marginBottom: isMobile ? 6 : 0 }}>
                    {filteredSuppliers.map(c => (
                      <div key={c} className="custom-dropdown-item" onMouseDown={(e) => { e.preventDefault(); set('supplier', c); setSupOpen(false); }}>
                        {c}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {suppliers.length === 0 && <div style={{ fontSize: 11, color: 'var(--warning)', marginTop: 4 }}>Сначала добавьте поставщика</div>}
            </div>
            <div className={isMobile ? "m-input-group" : "input-group"} style={{ position: 'relative' }}>
              <label className={isMobile ? "m-label" : "input-label"}>Склад</label>
              <div className="custom-select-wrapper">
                <input 
                  className={isMobile ? "m-input" : "input-field"} 
                  style={{ width: '100%', paddingRight: 36 }}
                  value={form.location || ''} 
                  onChange={e => { set('location', e.target.value); setLocOpen(true); }} 
                  onFocus={() => setLocOpen(true)}
                  onBlur={() => setTimeout(() => setLocOpen(false), 200)}
                  placeholder="Выберите или введите..." 
                />
                <ChevronDown size={16} className="custom-select-icon" onClick={() => setLocOpen(!locOpen)} />
                {locOpen && filteredLocations.length > 0 && (
                  <div className="custom-dropdown-list" style={{ bottom: isMobile ? '100%' : 'auto', top: isMobile ? 'auto' : 'calc(100% + 6px)', marginBottom: isMobile ? 6 : 0 }}>
                    {filteredLocations.map(c => (
                      <div key={c} className="custom-dropdown-item" onMouseDown={(e) => { e.preventDefault(); set('location', c); setLocOpen(false); }}>
                        {c}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
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
          {['Все', ...allCategories].map(c => (
            <button key={c} className={`chip ${catFilter === c ? 'active' : ''}`} onClick={() => setCatFilter(c)}>{c}</button>
          ))}
        </div>

        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>Найдено: {filtered.length}</div>

        <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border-color)', marginBottom: 16 }}>
          {paginated.length > 0 ? paginated.map(item => (
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

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="btn btn-ghost btn-sm">Назад</button>
            <div style={{ padding: '6px 12px', background: 'var(--bg-secondary)', borderRadius: 8, fontSize: 13, fontWeight: 500, border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center' }}>{currentPage} / {totalPages}</div>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="btn btn-ghost btn-sm">Вперёд</button>
          </div>
        )}

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
            {['Все', ...allCategories].map(c => (
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
                <th>Артикул</th>
                <th>Название</th>
                <th>Категория</th>
                <th>Склад</th>
                <th>Кол-во</th>
                <th>Цена</th>
                <th>Статус</th>
                <th style={{width:90}}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length > 0 ? paginated.map(item => (
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

      {mobileModal}
    </div>
  );
}
