import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { Sun, Moon, Trash2, Download, Smartphone, CheckCircle } from 'lucide-react';

export function Settings() {
  const { isDark, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const [installPrompt, setInstallPrompt] = useState(window.deferredPrompt);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
    }
    
    // Check if prompt was captured before mount
    if (window.deferredPrompt) {
      setInstallPrompt(window.deferredPrompt);
    }

    const handler = (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) {
      // Prompt is not available (e.g., iOS Safari or already installed)
      alert("Для установки на этом устройстве:\n\nAndroid: Откройте меню браузера (⋮) и выберите «Добавить на главный экран».\n\niPhone: Нажмите кнопку «Поделиться» и выберите «На экран Домой».");
      return;
    }
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setInstallPrompt(null);
      window.deferredPrompt = null;
      addToast('Приложение установлено!', 'success');
    }
  };

  const clearData = () => {
    if (!confirm('Удалить все данные?')) return;
    localStorage.removeItem('inventory-data');
    localStorage.removeItem('inventory-transactions');
    addToast('Данные очищены', 'info');
  };

  const exportAll = () => {
    const data = {
      inventory: JSON.parse(localStorage.getItem('inventory-data') || '[]'),
      transactions: JSON.parse(localStorage.getItem('inventory-transactions') || '[]'),
      date: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'skladpro_backup.json';
    a.click();
    addToast('Скачано', 'success');
  };

  const row = {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '14px 0',
    borderBottom: '1px solid var(--border)'
  };

  return (
    <div>
      {/* Install Banner */}
      {!isInstalled && (
        <div style={{
          background: 'var(--accent-g)', borderRadius: 'var(--r)',
          padding: '16px', marginBottom: 16, color: '#fff',
          display: 'flex', alignItems: 'center', gap: 14
        }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Smartphone size={26} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Установить как приложение</div>
            <div style={{ fontSize: 12, opacity: .85, marginTop: 2 }}>Добавить на главный экран телефона</div>
          </div>
          <button
            onClick={handleInstall}
            style={{
              background: '#fff', color: 'var(--accent)',
              border: 'none', padding: '8px 14px', borderRadius: 10,
              fontWeight: 700, fontSize: 13, cursor: 'pointer', flexShrink: 0,
              fontFamily: 'inherit'
            }}
          >
            Установить
          </button>
        </div>
      )}

      {isInstalled && (
        <div style={{
          background: 'var(--ok-l)', borderRadius: 'var(--r)',
          padding: '14px 16px', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 10,
          color: 'var(--ok)', border: '1px solid var(--ok)'
        }}>
          <CheckCircle size={20} />
          <span style={{ fontWeight: 600, fontSize: 14 }}>Приложение установлено на устройство</span>
        </div>
      )}


      <div className="m-card" style={{ marginBottom: 16 }}>
        <div className="section-title">Оформление</div>
        <div style={row}>
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>Тема</div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>{isDark ? 'Тёмная' : 'Светлая'}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={toggleTheme}>
            {isDark ? <Sun size={16} /> : <Moon size={16} />} {isDark ? 'Светлая' : 'Тёмная'}
          </button>
        </div>
      </div>

      <div className="m-card" style={{ marginBottom: 16 }}>
        <div className="section-title">Данные</div>
        <div style={row}>
          <div style={{ fontWeight: 500, fontSize: 14 }}>Экспорт JSON</div>
          <button className="btn btn-ghost btn-sm" onClick={exportAll}><Download size={16} /></button>
        </div>
        <div style={{ ...row, borderBottom: 'none' }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--err)' }}>Очистить</div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>Удалить все данные</div>
          </div>
          <button className="btn btn-err btn-sm" onClick={clearData}><Trash2 size={16} /></button>
        </div>
      </div>

      <div className="m-card">
        <div className="section-title">О приложении</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>
          <strong>СкладПро Mobile</strong> v2.0 (PWA)<br />
          Мобильная система учёта запасов<br />
          React · Vite · PWA · LocalStorage
        </div>
      </div>
    </div>
  );
}
