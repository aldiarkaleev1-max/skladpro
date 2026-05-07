import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

const ToastItem = ({ t, removeToast, icons, colors }) => {
  const [offset, setOffset] = useState(0);
  const [startX, setStartX] = useState(null);
  
  const onTouchStart = (e) => setStartX(e.touches[0].clientX);
  
  const onTouchMove = (e) => {
    if (startX === null) return;
    const diff = e.touches[0].clientX - startX;
    setOffset(diff);
  };
  
  const onTouchEnd = () => {
    if (Math.abs(offset) > 80) removeToast(t.id);
    else setOffset(0);
    setStartX(null);
  };

  return (
    <div 
      className={`toast toast-${t.type}`}
      style={{ 
        transform: offset !== 0 ? `translateX(${offset}px)` : undefined, 
        transition: startX === null ? 'transform 0.2s ease-out, opacity 0.2s' : 'none',
        opacity: startX !== null ? 1 - Math.abs(offset) / 150 : 1
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <span style={{ color: colors[t.type] }}>{icons[t.type]}</span>
      <span style={{ flex: 1 }}>{t.message}</span>
      <button onClick={() => removeToast(t.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:0 }}>
        <X size={16} />
      </button>
    </div>
  );
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const icons = { success: <CheckCircle size={18} />, error: <AlertCircle size={18} />, info: <Info size={18} /> };
  const colors = { success: 'var(--success)', error: 'var(--danger)', info: 'var(--info)' };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container" style={{ overflowX: 'hidden' }}>
        {toasts.map(t => (
          <ToastItem key={t.id} t={t} removeToast={removeToast} icons={icons} colors={colors} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
