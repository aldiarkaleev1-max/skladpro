import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import { useIsMobile } from '../hooks/useIsMobile';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, Trash2, Download, RotateCcw, Smartphone, CheckCircle, LogOut } from 'lucide-react';

export function Settings() {
  const { isDark, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const confirm = useConfirm();
  const isMobile = useIsMobile();
  const { logout } = useAuth();
  const [installPrompt, setInstallPrompt] = useState(window.deferredPrompt);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
    }
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

  const clearData = async () => {
    if (!await confirm('Удалить все данные? Это действие нельзя отменить.')) return;
    localStorage.removeItem('inventory-data');
    localStorage.removeItem('inventory-transactions');
    localStorage.removeItem('inventory-suppliers');
    addToast('Данные очищены. Перезагрузите страницу.', 'info');
  };

  const handleLogout = async () => {
    if (!await confirm('Выйти из аккаунта?')) return;
    try {
      await logout();
      addToast('Вы вышли из системы', 'info');
    } catch (e) {
      addToast('Ошибка при выходе', 'error');
    }
  };

  const exportAll = () => {
    const data = {
      inventory: JSON.parse(localStorage.getItem('inventory-data') || '[]'),
      transactions: JSON.parse(localStorage.getItem('inventory-transactions') || '[]'),
      suppliers: JSON.parse(localStorage.getItem('inventory-suppliers') || '[]'),
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'skladpro_backup.json'; a.click();
    addToast('Резервная копия скачана', 'success');
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.inventory) localStorage.setItem('inventory-data', JSON.stringify(data.inventory));
        if (data.transactions) localStorage.setItem('inventory-transactions', JSON.stringify(data.transactions));
        if (data.suppliers) localStorage.setItem('inventory-suppliers', JSON.stringify(data.suppliers));
        addToast('Данные импортированы. Перезагрузите страницу.', 'success');
      } catch { addToast('Ошибка чтения файла', 'error'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const row = {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: isMobile ? '14px 0' : '12px 0',
    borderBottom: '1px solid var(--border-color)',
  };

  /* ──── PWA Install Banner (shared) ──── */
  const installBanner = isMobile && (
    <>
      {!isInstalled && (
        <div style={{
          background: 'var(--accent-gradient)', borderRadius: 'var(--radius)',
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
          background: 'var(--success-light)', borderRadius: 'var(--radius)',
          padding: '14px 16px', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 10,
          color: 'var(--success)', border: '1px solid var(--success)'
        }}>
          <CheckCircle size={20} />
          <span style={{ fontWeight: 600, fontSize: 14 }}>Приложение установлено на устройство</span>
        </div>
      )}
    </>
  );

  /* ──── MOBILE ──── */
  if (isMobile) {
    return (
      <div>
        {installBanner}

        <div className="m-card" style={{ marginBottom: 16 }}>
          <div className="section-title">Оформление</div>
          <div style={row}>
            <div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>Тема</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{isDark ? 'Тёмная' : 'Светлая'}</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={toggleTheme}>
              {isDark ? <Sun size={16} /> : <Moon size={16} />} {isDark ? 'Светлая' : 'Тёмная'}
            </button>
          </div>
        </div>

        <div className="m-card" style={{ marginBottom: 16 }}>
          <div className="section-title">Аккаунт</div>
          <div style={{ ...row, borderBottom: 'none' }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>Выйти</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Завершить сеанс</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}><LogOut size={16} /></button>
          </div>
        </div>

        <div className="m-card" style={{ marginBottom: 16 }}>
          <div className="section-title">Данные</div>
          <div style={row}>
            <div style={{ fontWeight: 500, fontSize: 14 }}>Экспорт JSON</div>
            <button className="btn btn-ghost btn-sm" onClick={exportAll}><Download size={16} /></button>
          </div>
          <div style={row}>
            <div style={{ fontWeight: 500, fontSize: 14 }}>Импорт данных</div>
            <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer' }}>
              <RotateCcw size={16} />
              <input type="file" accept=".json" onChange={importData} style={{ display: 'none' }} />
            </label>
          </div>
          <div style={{ ...row, borderBottom: 'none' }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--danger)' }}>Очистить</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Удалить все данные</div>
            </div>
            <button className="btn btn-danger btn-sm" onClick={clearData}><Trash2 size={16} /></button>
          </div>
        </div>

        <div className="m-card">
          <div className="section-title">О приложении</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            <strong>СкладПро</strong> v2.0<br />
            Система учёта запасов предприятия<br />
            React · Vite · Chart.js · LocalStorage
          </div>
        </div>
      </div>
    );
  }

  /* ──── DESKTOP ──── */
  return (
    <div style={{ maxWidth: 700 }}>
      <div className="card card-no-hover mb-6">
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Оформление</h3>
        <div className="flex justify-between items-center" style={{ padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
          <div>
            <div style={{ fontWeight: 500 }}>Тема интерфейса</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Текущая: {isDark ? 'Тёмная' : 'Светлая'}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={toggleTheme}>
            {isDark ? <><Sun size={16} /> Светлая</> : <><Moon size={16} /> Тёмная</>}
          </button>
        </div>
      </div>

      <div className="card card-no-hover mb-6">
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Аккаунт</h3>
        <div className="flex justify-between items-center" style={{ padding: '12px 0' }}>
          <div>
            <div style={{ fontWeight: 500 }}>Завершить сеанс</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Выйти из учетной записи</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}><LogOut size={16} /> Выйти</button>
        </div>
      </div>

      <div className="card card-no-hover mb-6">
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Данные</h3>
        <div className="flex justify-between items-center" style={{ padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
          <div>
            <div style={{ fontWeight: 500 }}>Экспорт данных (JSON)</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Скачать резервную копию всех данных</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={exportAll}><Download size={16} /> Скачать</button>
        </div>
        <div className="flex justify-between items-center" style={{ padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
          <div>
            <div style={{ fontWeight: 500 }}>Импорт данных</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Загрузить из JSON-файла</div>
          </div>
          <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer' }}>
            <RotateCcw size={16} /> Загрузить
            <input type="file" accept=".json" onChange={importData} style={{ display: 'none' }} />
          </label>
        </div>
        <div className="flex justify-between items-center" style={{ padding: '12px 0' }}>
          <div>
            <div style={{ fontWeight: 500, color: 'var(--danger)' }}>Очистить все данные</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Удалить товары, операции и поставщиков</div>
          </div>
          <button className="btn btn-danger btn-sm" onClick={clearData}><Trash2 size={16} /> Очистить</button>
        </div>
      </div>

      <div className="card card-no-hover mb-6">
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>📱 Мобильная версия</h3>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          Приложение адаптивное — на мобильных устройствах автоматически показывается оптимизированный интерфейс с нижней навигацией.<br /><br />
          Просто откройте этот сайт на телефоне для мобильной версии.
        </div>
      </div>

      <div className="card card-no-hover">
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>О системе</h3>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          <strong>СкладПро</strong> — информационная система учета запасов предприятия.<br/>
          Версия: 2.0 &nbsp;|&nbsp; Разработано: 2026<br/>
          Стек: React, Vite, Chart.js, LocalStorage
        </div>
      </div>
    </div>
  );
}
