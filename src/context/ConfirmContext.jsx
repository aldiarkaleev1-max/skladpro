import React, { useState, useCallback, createContext, useContext } from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmContext = createContext(null);

export function useConfirm() {
  return useContext(ConfirmContext);
}

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);

  const confirm = useCallback((message, confirmText = 'Удалить', isDanger = true) => {
    return new Promise((resolve) => {
      setState({ message, resolve, confirmText, isDanger });
    });
  }, []);

  const handleConfirm = () => {
    state?.resolve(true);
    setState(null);
  };

  const handleCancel = () => {
    state?.resolve(false);
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div className="modal-overlay" onClick={handleCancel} style={{ zIndex: 3000 }}>
          <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon">
              <AlertTriangle size={28} />
            </div>
            <div className="confirm-message">{state.message}</div>
            <div className="confirm-actions">
              <button className="btn btn-ghost" onClick={handleCancel}>Отмена</button>
              <button className={`btn ${state.isDanger ? 'btn-danger' : 'btn-primary'}`} onClick={handleConfirm}>{state.confirmText}</button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
