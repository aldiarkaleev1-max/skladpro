import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { User, Bell, AlertTriangle } from 'lucide-react';

export function Header({ title }) {
  const { currentUser } = useAuth();
  const [inventory] = useLocalStorage('inventory-data', []);
  const [showNotifications, setShowNotifications] = useState(false);

  const lowStockItems = inventory.filter(item => item.quantity < 5);

  return (
    <header className="header">
      <h1 className="header-title">{title || 'Обзор'}</h1>
      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        
        {currentUser && (
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              style={{ 
                background: 'none', border: 'none', cursor: 'pointer', 
                color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', 
                position: 'relative', padding: '4px' 
              }}
            >
              <Bell size={20} />
              {lowStockItems.length > 0 && (
                <span style={{ 
                  position: 'absolute', top: 0, right: 0, 
                  background: 'var(--danger)', color: '#fff', 
                  fontSize: '10px', fontWeight: 'bold', 
                  width: '16px', height: '16px', borderRadius: '50%', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid var(--bg-secondary)'
                }}>
                  {lowStockItems.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div style={{
                position: 'absolute', top: '100%', right: '-50px', marginTop: '12px',
                width: '260px', background: 'var(--bg-secondary)', 
                border: '1px solid var(--border-color)', borderRadius: '12px',
                boxShadow: 'var(--shadow-lg)', zIndex: 100, overflow: 'hidden'
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', fontWeight: 600, fontSize: '13px' }}>
                  Уведомления
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {lowStockItems.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                      Всё отлично! Дефицита нет.
                    </div>
                  ) : (
                    lowStockItems.map(item => (
                      <div key={item.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ color: 'var(--danger)', marginTop: '2px' }}><AlertTriangle size={16} /></div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{item.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Осталось: <strong style={{ color: 'var(--danger)' }}>{item.quantity} шт.</strong></div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {currentUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-tertiary)', padding: '6px 14px 6px 6px', borderRadius: '40px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            {currentUser.photoURL ? (
              <img src={currentUser.photoURL} alt="Avatar" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
            ) : (
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-gradient)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={16} />
              </div>
            )}
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {currentUser.displayName || currentUser.email.split('@')[0]}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
