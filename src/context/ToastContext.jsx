import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

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
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span style={{ color: colors[t.type] }}>{icons[t.type]}</span>
            <span style={{ flex: 1 }}>{t.message}</span>
            <button onClick={() => removeToast(t.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', padding:0 }}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
