import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useIsMobile } from '../hooks/useIsMobile';
import { initialSuppliers } from '../data/mockData';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import { Plus, Edit2, Trash2, X, Phone, Mail, MapPin } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export function Suppliers() {
  const [suppliers, setSuppliers] = useLocalStorage('inventory-suppliers', initialSuppliers);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const { addToast } = useToast();
  const confirm = useConfirm();
  const isMobile = useIsMobile();
  const emptyForm = { name: '', contact: '', phone: '', email: '', address: '' };
  const [form, setForm] = useState(emptyForm);

  const openModal = (item = null) => {
    if (item) { setEditing(item); setForm({ ...item }); }
    else { setEditing(null); setForm(emptyForm); }
    setModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing) {
      setSuppliers(suppliers.map(s => s.id === editing.id ? { ...form, id: s.id } : s));
      addToast('Поставщик обновлён', 'success');
    } else {
      setSuppliers([...suppliers, { ...form, id: uuidv4(), itemsCount: 0 }]);
      addToast('Поставщик добавлен', 'success');
    }
    setModal(false); setEditing(null);
  };

  const handleDelete = async (id) => {
    if (!await confirm('Удалить поставщика?')) return;
    setSuppliers(suppliers.filter(s => s.id !== id));
    addToast('Поставщик удалён', 'error');
  };

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  /* ──── MODAL ──── */
  const modalEl = modal && (
    <div className="modal-overlay" onClick={() => setModal(false)}>
      <div className={isMobile ? "modal-sheet" : "modal-content"} onClick={e => e.stopPropagation()}>
        {isMobile && <div className="modal-handle" />}
        <div className={isMobile ? "" : "modal-header"} style={isMobile ? { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 } : undefined}>
          <h3 className="modal-title">{editing ? 'Редактировать' : 'Новый поставщик'}</h3>
          {isMobile && editing && <button type="button" className="btn btn-danger btn-sm" onClick={async () => { await handleDelete(editing.id); setModal(false); }}>Удалить</button>}
          {!isMobile && <button type="button" className="btn-icon" onClick={() => setModal(false)}><X size={18} /></button>}
        </div>
        <form onSubmit={handleSubmit}>
          <div className={isMobile ? "m-input-group" : "input-group"}>
            <label className={isMobile ? "m-label" : "input-label"}>Название</label>
            <input className={isMobile ? "m-input" : "input-field"} required value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div className={isMobile ? "m-input-group" : "input-group"}>
            <label className={isMobile ? "m-label" : "input-label"}>Контактное лицо</label>
            <input className={isMobile ? "m-input" : "input-field"} required value={form.contact} onChange={e => set('contact', e.target.value)} />
          </div>
          <div className={isMobile ? "grid-2m" : "grid grid-2 gap-4"}>
            <div className={isMobile ? "m-input-group" : "input-group"}>
              <label className={isMobile ? "m-label" : "input-label"}>Телефон</label>
              <input className={isMobile ? "m-input" : "input-field"} value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div className={isMobile ? "m-input-group" : "input-group"}>
              <label className={isMobile ? "m-label" : "input-label"}>Email</label>
              <input type="email" className={isMobile ? "m-input" : "input-field"} value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
          </div>
          <div className={isMobile ? "m-input-group" : "input-group"}>
            <label className={isMobile ? "m-label" : "input-label"}>Адрес</label>
            <input className={isMobile ? "m-input" : "input-field"} value={form.address} onChange={e => set('address', e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: isMobile ? 10 : 12, marginTop: isMobile ? 8 : 16 }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setModal(false)}>Отмена</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  );

  /* ──── MOBILE ──── */
  if (isMobile) {
    return (
      <div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Всего: {suppliers.length}</div>

        {suppliers.length > 0 ? (
          <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            {suppliers.map(s => (
              <div key={s.id} className="list-item" onClick={() => openModal(s)} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <div className="list-item-title">{s.name}</div>
                  <span className="badge badge-accent">{s.contact}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12} /> {s.phone}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={12} /> {s.email}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="m-card empty-state" style={{ padding: 48 }}>Пока нет поставщика</div>
        )}

        <button className="fab" onClick={() => openModal()}><Plus size={24} /></button>
        {modalEl}
      </div>
    );
  }

  /* ──── DESKTOP ──── */
  return (
    <div>
      <div className="page-header">
        <div className="page-title">Всего поставщиков: {suppliers.length}</div>
        <button className="btn btn-primary" onClick={() => openModal()}><Plus size={18} /> Добавить</button>
      </div>

      {suppliers.length > 0 ? (
        <div className="grid grid-3 gap-6">
          {suppliers.map(s => (
            <div key={s.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="flex justify-between items-center">
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>{s.name}</h3>
                <div className="flex gap-2">
                  <button className="btn-icon" onClick={() => openModal(s)}><Edit2 size={14} /></button>
                  <button className="btn-icon" onClick={() => handleDelete(s.id)} style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
                </div>
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Контакт: {s.contact}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                <span className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}><Phone size={14} /> {s.phone}</span>
                <span className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}><Mail size={14} /> {s.email}</span>
                <span className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}><MapPin size={14} /> {s.address}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card card-no-hover empty-state">
          Пока нет поставщика
        </div>
      )}

      {modalEl}
    </div>
  );
}
