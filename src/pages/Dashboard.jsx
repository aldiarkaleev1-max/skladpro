import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useIsMobile } from '../hooks/useIsMobile';
import { initialInventory, initialTransactions } from '../data/mockData';
import { Package, TrendingUp, TrendingDown, AlertTriangle, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

export function Dashboard() {
  const [inventory] = useLocalStorage('inventory-data', initialInventory);
  const [transactions] = useLocalStorage('inventory-transactions', initialTransactions);
  const isMobile = useIsMobile();
  const [activeChart, setActiveChart] = useState('categories');

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions.filter(tx => new Date(tx.date).toISOString().split('T')[0] === todayStr);

  const totalItems = inventory.reduce((s, i) => s + i.quantity, 0);
  const totalValue = inventory.reduce((s, i) => s + i.quantity * i.price, 0);
  const lowStock = inventory.filter(i => i.quantity > 0 && i.quantity < 10).length;
  const outOfStock = inventory.filter(i => i.quantity === 0).length;

  const catMap = {};
  inventory.forEach(i => { catMap[i.category] = (catMap[i.category] || 0) + i.quantity; });
  const catLabels = Object.keys(catMap);
  const catValues = Object.values(catMap);
  const catColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

  const doughnutData = {
    labels: catLabels,
    datasets: [{ data: catValues, backgroundColor: catColors.slice(0, catLabels.length), borderWidth: 0 }]
  };

  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
  const daysLabels = last7Days.map(dateStr => new Date(dateStr).toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' }));

  const inData = Array(7).fill(0);
  const outData = Array(7).fill(0);

  transactions.forEach(tx => {
    const dateStr = new Date(tx.date).toISOString().split('T')[0];
    const index = last7Days.indexOf(dateStr);
    if (index !== -1) {
      if (tx.type === 'in') inData[index] += tx.quantity;
      if (tx.type === 'out') outData[index] += tx.quantity;
    }
  });

  const lineData = {
    labels: daysLabels,
    datasets: [
      { label: 'Приход', data: inData, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,.08)', fill: true, tension: .4 },
      { label: 'Расход', data: outData, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,.08)', fill: true, tension: .4 },
    ],
  };

  const chartOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 16 } } }, scales: { x: { grid: { display: false } }, y: { min: 0, ticks: { precision: 0 }, grid: { color: 'rgba(128,128,128,.1)' } } } };
  const doughnutOpts = { responsive: true, maintainAspectRatio: false, cutout: isMobile ? '60%' : '65%', plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: isMobile ? 10 : 14, font: { size: isMobile ? 11 : 12 } } } } };

  const getItemName = (id) => inventory.find(i => i.id === id)?.name || '—';

  /* ──── MOBILE ──── */
  if (isMobile) {
    return (
      <div>
        <div className="grid-2m" style={{ marginBottom: 16 }}>
          {[
            { l: 'Товаров', v: totalItems, icon: <Package size={20} />, bg: 'var(--info-light)', c: 'var(--info)' },
            { l: 'Стоимость', v: totalValue >= 1000000 ? (totalValue / 1000000).toFixed(1) + 'M ₸' : totalValue.toLocaleString() + ' ₸', icon: <TrendingUp size={20} />, bg: 'var(--success-light)', c: 'var(--success)' },
            { l: 'Мало', v: lowStock, icon: <AlertTriangle size={20} />, bg: 'var(--warning-light)', c: 'var(--warning)' },
            { l: 'Нет', v: outOfStock, icon: <TrendingDown size={20} />, bg: 'var(--danger-light)', c: 'var(--danger)' },
          ].map((s, i) => (
            <div key={i} className="m-card stat-mini">
              <div className="stat-mini-icon" style={{ background: s.bg, color: s.c }}>{s.icon}</div>
              <div className="stat-mini-info"><div className="stat-mini-label">{s.l}</div><div className="stat-mini-value">{s.v}</div></div>
            </div>
          ))}
        </div>

        <div className="m-card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 12 }}>
            <div 
              className="section-title" 
              style={{ marginBottom: 0, color: activeChart === 'categories' ? 'var(--text-primary)' : 'var(--text-muted)', cursor: 'pointer', transition: 'color .2s' }}
              onClick={() => setActiveChart('categories')}
            >
              По категориям
            </div>
            <div 
              className="section-title" 
              style={{ marginBottom: 0, color: activeChart === 'dynamics' ? 'var(--text-primary)' : 'var(--text-muted)', cursor: 'pointer', transition: 'color .2s' }}
              onClick={() => setActiveChart('dynamics')}
            >
              Динамика
            </div>
          </div>
          <div className="chart-box-m">
            {inventory.length === 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)', minHeight: 150 }}>Сначала добавьте товар</div>
            ) : activeChart === 'categories' ? (
              <Doughnut data={doughnutData} options={doughnutOpts} />
            ) : (
              <Line data={lineData} options={chartOpts} />
            )}
          </div>
        </div>

        <div className="section-title">Операции за сегодня</div>
        <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          {todayTransactions.length > 0 ? todayTransactions.slice(0, 5).map(tx => (
            <div key={tx.id} className="list-item">
              <div className="list-item-icon" style={{ background: tx.type === 'in' ? 'var(--success-light)' : 'var(--danger-light)', color: tx.type === 'in' ? 'var(--success)' : 'var(--danger)' }}>
                {tx.type === 'in' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
              </div>
              <div className="list-item-content">
                <div className="list-item-title">{getItemName(tx.itemId)}</div>
                <div className="list-item-sub">{new Date(tx.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })} · {tx.note || '—'}</div>
              </div>
              <div className="list-item-right">
                <div className="list-item-qty" style={{ color: tx.type === 'in' ? 'var(--success)' : 'var(--danger)' }}>
                  {tx.type === 'in' ? '+' : '-'}{tx.quantity}
                </div>
              </div>
            </div>
          )) : <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>Нет операций</div>}
        </div>
      </div>
    );
  }

  /* ──── DESKTOP ──── */
  return (
    <div>
      <div className="grid grid-4 gap-6 mb-6">
        {[
          { label: 'Всего товаров (шт)', value: totalItems.toLocaleString(), icon: <Package size={22} />, bg: 'var(--info-light)', color: 'var(--info)' },
          { label: 'Общая стоимость', value: totalValue.toLocaleString() + ' ₸', icon: <TrendingUp size={22} />, bg: 'var(--success-light)', color: 'var(--success)' },
          { label: 'Заканчиваются', value: lowStock, icon: <AlertTriangle size={22} />, bg: 'var(--warning-light)', color: 'var(--warning)' },
          { label: 'Нет в наличии', value: outOfStock, icon: <TrendingDown size={22} />, bg: 'var(--danger-light)', color: 'var(--danger)' },
        ].map((s, i) => (
          <div key={i} className="card card-hover stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-2 gap-6 mb-6">
        <div className="card card-no-hover">
          <h3 className="card-title">Динамика движения</h3>
          <div className="chart-box">
            {inventory.length === 0 ? <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>Сначала добавьте товар</div> : <Line data={lineData} options={chartOpts} />}
          </div>
        </div>
        <div className="card card-no-hover">
          <h3 className="card-title">Распределение по категориям</h3>
          <div className="chart-box">
            {inventory.length === 0 ? <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>Сначала добавьте товар</div> : <Doughnut data={doughnutData} options={doughnutOpts} />}
          </div>
        </div>
      </div>

      <div className="grid grid-2 gap-6">
        <div className="card card-no-hover">
          <h3 className="card-title">Операции за сегодня</h3>
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>Тип</th><th>Товар</th><th>Кол-во</th><th>Время</th></tr></thead>
              <tbody>
                {todayTransactions.length > 0 ? todayTransactions.slice(0, 6).map(tx => (
                  <tr key={tx.id}>
                    <td><span className={`badge ${tx.type === 'in' ? 'badge-success' : 'badge-danger'}`}>
                      {tx.type === 'in' ? <><ArrowDownLeft size={12}/> Приход</> : <><ArrowUpRight size={12}/> Расход</>}
                    </span></td>
                    <td style={{ fontWeight: 500 }}>{getItemName(tx.itemId)}</td>
                    <td>{tx.quantity} шт.</td>
                    <td style={{ color: 'var(--text-muted)' }}>{new Date(tx.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                )) : <tr><td colSpan="4" className="empty-state" style={{ padding: '32px 0' }}>Нет операций</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card card-no-hover">
          <h3 className="card-title">Товары с низким запасом</h3>
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>Товар</th><th>Артикул</th><th>Остаток</th><th>Статус</th></tr></thead>
              <tbody>
                {inventory.filter(i => i.quantity < 10).length > 0 ? inventory.filter(i => i.quantity < 10).map(item => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 500 }}>{item.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{item.sku}</td>
                    <td>{item.quantity} шт.</td>
                    <td><span className={`badge ${item.quantity === 0 ? 'badge-danger' : 'badge-warning'}`}>
                      {item.quantity === 0 ? 'Нет' : 'Мало'}
                    </span></td>
                  </tr>
                )) : <tr><td colSpan="4" className="empty-state" style={{ padding: '32px 0' }}>Всё в порядке</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
