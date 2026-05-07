import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useIsMobile } from '../hooks/useIsMobile';
import { initialInventory, initialTransactions, categories } from '../data/mockData';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Download, Search, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export function Reports() {
  const [inventory] = useLocalStorage('inventory-data', initialInventory);
  const [transactions] = useLocalStorage('inventory-transactions', initialTransactions);
  const isMobile = useIsMobile();
  
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('Все');

  let filteredInventory = inventory.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'Все' || i.category === catFilter;
    return matchSearch && matchCat;
  });



  const filteredTx = transactions.filter(t => {
    const item = inventory.find(i => i.id === t.itemId);
    if (!item) return false;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'Все' || item.category === catFilter;
    return matchSearch && matchCat;
  });

  const totalValue = filteredInventory.reduce((s, i) => s + i.quantity * i.price, 0);
  const totalItems = filteredInventory.reduce((s, i) => s + i.quantity, 0);
  const inCount = filteredTx.filter(t => t.type === 'in').length;
  const outCount = filteredTx.filter(t => t.type === 'out').length;

  const locMap = {};
  filteredInventory.forEach(i => { const loc = i.location || 'Не указан'; locMap[loc] = (locMap[loc] || 0) + i.quantity; });
  const sortedLocs = Object.entries(locMap).sort((a, b) => b[1] - a[1]);

  const locData = {
    labels: sortedLocs.map(e => e[0]),
    datasets: [{ label: 'Количество', data: sortedLocs.map(e => e[1]), backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#3b82f6'], borderRadius: 8, barPercentage: .6 }]
  };

  const valMap = {};
  filteredInventory.forEach(i => { valMap[i.category] = (valMap[i.category] || 0) + i.quantity * i.price; });

  const valData = {
    labels: Object.keys(valMap),
    datasets: [{ data: Object.values(valMap), backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'], borderWidth: 0 }]
  };

  const barOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(128,128,128,.1)' } } } };
  const dOpts = { responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 14 } } } };

  const exportReport = () => {
    let text = 'ОТЧЁТ ПО ЗАПАСАМ\n';
    text += `Дата: ${new Date().toLocaleDateString('ru-RU')}\n`;
    text += `Фильтры: Категория="${catFilter}", Поиск="${search}"\n\n`;
    text += `Общее количество товаров: ${totalItems}\n`;
    text += `Общая стоимость запасов: ${totalValue.toLocaleString()} ₸\n`;
    text += `Операций прихода: ${inCount}\nОпераций расхода: ${outCount}\n\n`;
    text += 'ДЕТАЛИЗАЦИЯ\nАртикул | Название | Кол-во | Цена | Стоимость\n';
    text += '-'.repeat(60) + '\n';
    filteredInventory.forEach(i => { text += `${i.sku} | ${i.name} | ${i.quantity} | ${i.price.toLocaleString()} ₸ | ${(i.quantity * i.price).toLocaleString()} ₸\n`; });
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'report.txt'; a.click();
  };

  /* ──── MOBILE ──── */
  if (isMobile) {
    return (
      <div>


        <div className="grid-2m" style={{ marginBottom: 16 }}>
          <div className="m-card" style={{ textAlign: 'center', padding: 16 }}>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{filteredInventory.length}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Наименований</div>
          </div>
          <div className="m-card" style={{ textAlign: 'center', padding: 16 }}>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{totalItems}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Единиц</div>
          </div>
          <div className="m-card" style={{ textAlign: 'center', padding: 16 }}>
            <div style={{ fontSize: totalValue >= 1000000 ? 20 : 20, fontWeight: 700 }}>
              {totalValue >= 1000000 ? (totalValue / 1000000).toFixed(1) + 'M ₸' : totalValue.toLocaleString() + ' ₸'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Стоимость</div>
          </div>
          <div className="m-card" style={{ textAlign: 'center', padding: 16 }}>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{filteredTx.length}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Операций</div>
          </div>
        </div>

        <div className="m-card" style={{ marginBottom: 16 }}>
          <div className="section-title">По складам</div>
          <div className="chart-box-m"><Bar data={locData} options={barOpts} /></div>
        </div>

        <div className="section-title">Ведомость</div>
        <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border-color)', marginBottom: 16 }}>
          {filteredInventory.length > 0 ? filteredInventory.map(i => (
            <div key={i.id} className="list-item">
              <div className="list-item-content">
                <div className="list-item-title">{i.name}</div>
                <div className="list-item-sub">{i.sku} · {i.category}</div>
              </div>
              <div className="list-item-right">
                <div className="list-item-qty">{i.quantity}</div>
                <div className="list-item-price">{(i.quantity * i.price).toLocaleString()} ₸</div>
              </div>
            </div>
          )) : <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>Ничего не найдено</div>}
          {filteredInventory.length > 0 && (
            <div className="list-item" style={{ background: 'var(--accent-light)', fontWeight: 700 }}>
              <div className="list-item-content"><div className="list-item-title">ИТОГО</div></div>
              <div className="list-item-right">
                <div className="list-item-qty">{totalItems}</div>
                <div className="list-item-price">{totalValue.toLocaleString()} ₸</div>
              </div>
            </div>
          )}
        </div>
        
        <button className="btn btn-primary" style={{ width: '100%', padding: '12px', display: 'flex', justifyContent: 'center', marginBottom: 20 }} onClick={exportReport}>
          <Download size={18} /> Скачать отчёт
        </button>

      </div>
    );
  }

  /* ──── DESKTOP ──── */
  return (
    <div>


      <div className="grid grid-4 gap-6 mb-6">
        {[
          { l: 'Наименований', v: filteredInventory.length },
          { l: 'Единиц на складе', v: totalItems.toLocaleString() },
          { l: 'Стоимость запасов', v: totalValue.toLocaleString() + ' ₸' },
          { l: 'Всего операций', v: filteredTx.length },
        ].map((s, i) => (
          <div key={i} className="card card-hover" style={{ textAlign: 'center', padding: 20 }}>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{s.v}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-2 gap-6 mb-6">
        <div className="card card-no-hover">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Запасы по складам</h3>
          <div className="chart-box"><Bar data={locData} options={barOpts} /></div>
        </div>
        <div className="card card-no-hover">
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Стоимость по категориям</h3>
          <div className="chart-box"><Doughnut data={valData} options={dOpts} /></div>
        </div>
      </div>

      <div className="card card-no-hover">
        <div className="flex justify-between items-center mb-4">
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Полная ведомость запасов</h3>
          <button className="btn btn-primary btn-sm" onClick={exportReport}><Download size={16} /> Скачать</button>
        </div>
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
                <th>Стоимость</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.length > 0 ? filteredInventory.map(i => (
                <tr key={i.id}>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{i.sku}</td>
                  <td style={{ fontWeight: 500 }}>{i.name}</td>
                  <td>{i.category}</td>
                  <td>{i.location || '—'}</td>
                  <td style={{ fontWeight: 600 }}>{i.quantity}</td>
                  <td>{i.price.toLocaleString()} ₸</td>
                  <td style={{ fontWeight: 600 }}>{(i.quantity * i.price).toLocaleString()} ₸</td>
                </tr>
              )) : <tr><td colSpan="7" className="empty-state">Нет данных по выбранным фильтрам</td></tr>}
              {filteredInventory.length > 0 && (
                <tr style={{ fontWeight: 700, background: 'var(--accent-light)' }}>
                  <td colSpan="4">ИТОГО</td>
                  <td>{totalItems}</td>
                  <td>—</td>
                  <td>{totalValue.toLocaleString()} ₸</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
