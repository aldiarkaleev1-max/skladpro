import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
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

  const [inventory, setInventory] = useLocalStorage('inventory-data', []);
  const [transactions, setTransactions] = useLocalStorage('inventory-transactions', []);
  const [suppliers, setSuppliers] = useLocalStorage('inventory-suppliers', []);

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

  const handleLogout = async () => {
    if (!await confirm('Выйти из аккаунта?', 'Выйти', false)) return;
    try {
      await logout();
      addToast('Вы вышли из системы', 'info');
    } catch (e) {
      addToast('Ошибка при выходе', 'error');
    }
  };

  const exportAll = () => {
    let csvContent = "ID,Название,Категория,Цена,Количество\n";
    inventory.forEach(item => {
      csvContent += `${item.id},"${item.name || ''}","${item.category || ''}",${item.price || 0},${item.quantity || 0}\n`;
    });
    
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `skladpro_inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Таблица товаров скачана (Excel/CSV)', 'success');
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.inventory) setInventory(data.inventory);
        if (data.transactions) setTransactions(data.transactions);
        if (data.suppliers) setSuppliers(data.suppliers);
        addToast('Облачные данные успешно обновлены!', 'success');
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
            <div style={{ fontWeight: 500, fontSize: 14 }}>Экспорт в Excel</div>
            <button className="btn btn-ghost btn-sm" onClick={exportAll}><Download size={16} /></button>
          </div>
          <div style={{ ...row, borderBottom: 'none' }}>
            <div style={{ fontWeight: 500, fontSize: 14 }}>Импорт данных</div>
            <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer' }}>
              <RotateCcw size={16} />
              <input type="file" accept=".json" onChange={importData} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        <div className="m-card">
          <div className="section-title">О приложении</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            <strong>СкладПро</strong> v3.0 (Cloud)<br />
            Облачная система учёта запасов<br />
            React · Firebase Auth · Firestore
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
            <div style={{ fontWeight: 500 }}>Выгрузить в Excel (CSV)</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Скачать таблицу товаров для Excel</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={exportAll}><Download size={16} /> Экспорт</button>
        </div>
        <div className="flex justify-between items-center" style={{ padding: '12px 0' }}>
          <div>
            <div style={{ fontWeight: 500 }}>Импорт данных</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Загрузить из JSON-файла</div>
          </div>
          <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer' }}>
            <RotateCcw size={16} /> Загрузить
            <input type="file" accept=".json" onChange={importData} style={{ display: 'none' }} />
          </label>
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
          <strong>СкладПро Cloud</strong> — современная облачная платформа для управления запасами.<br/>
          Версия: 3.0 &nbsp;|&nbsp; Синхронизация в реальном времени<br/>
          Технологии: React, Vite, Chart.js, Firebase Auth & Firestore
        </div>
      </div>
    </div>
  );
}
