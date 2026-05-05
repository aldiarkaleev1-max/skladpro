import React from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { initialInventory, initialTransactions } from '../data/mockData';
import { Package, TrendingUp, AlertTriangle, TrendingDown, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

export function Dashboard() {
  const [inventory] = useLocalStorage('inventory-data', initialInventory);
  const [transactions] = useLocalStorage('inventory-transactions', initialTransactions);

  const total = inventory.reduce((s,i) => s+i.quantity, 0);
  const value = inventory.reduce((s,i) => s+i.quantity*i.price, 0);
  const low = inventory.filter(i => i.quantity>0 && i.quantity<10).length;
  const out = inventory.filter(i => i.quantity===0).length;

  const catMap = {};
  inventory.forEach(i => { catMap[i.category] = (catMap[i.category]||0) + i.quantity; });

  const doughnut = {
    labels: Object.keys(catMap),
    datasets: [{ data: Object.values(catMap), backgroundColor: ['#6366f1','#10b981','#f59e0b','#ef4444'], borderWidth:0, spacing:2 }]
  };

  const getItemName = id => inventory.find(i=>i.id===id)?.name || '—';

  return (
    <div>
      <div className="grid-2" style={{marginBottom:16}}>
        {[
          { l:'Товаров', v:total, icon:<Package size={20}/>, bg:'var(--info-l)', c:'var(--info)' },
          { l:'Стоимость', v: (value/1000).toFixed(0)+'K ₸', icon:<TrendingUp size={20}/>, bg:'var(--ok-l)', c:'var(--ok)' },
          { l:'Мало', v:low, icon:<AlertTriangle size={20}/>, bg:'var(--warn-l)', c:'var(--warn)' },
          { l:'Нет', v:out, icon:<TrendingDown size={20}/>, bg:'var(--err-l)', c:'var(--err)' },
        ].map((s,i) => (
          <div key={i} className="m-card stat-mini">
            <div className="stat-mini-icon" style={{background:s.bg, color:s.c}}>{s.icon}</div>
            <div><div className="stat-mini-label">{s.l}</div><div className="stat-mini-value">{s.v}</div></div>
          </div>
        ))}
      </div>

      <div className="m-card" style={{marginBottom:16}}>
        <div className="section-title">По категориям</div>
        <div className="chart-box">
          <Doughnut data={doughnut} options={{responsive:true,maintainAspectRatio:false,cutout:'60%',plugins:{legend:{position:'bottom',labels:{usePointStyle:true,padding:10,font:{size:11}}}}}} />
        </div>
      </div>

      <div className="section-title">Последние операции</div>
      <div style={{borderRadius:'var(--r)',overflow:'hidden',border:'1px solid var(--border)'}}>
        {transactions.slice(0,5).map(tx => (
          <div key={tx.id} className="list-item">
            <div style={{width:36,height:36,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',background:tx.type==='in'?'var(--ok-l)':'var(--err-l)',color:tx.type==='in'?'var(--ok)':'var(--err)',flexShrink:0}}>
              {tx.type==='in' ? <ArrowDownLeft size={18}/> : <ArrowUpRight size={18}/>}
            </div>
            <div className="list-item-content">
              <div className="list-item-title">{getItemName(tx.itemId)}</div>
              <div className="list-item-sub">{new Date(tx.date).toLocaleDateString('ru-RU')} · {tx.note||'—'}</div>
            </div>
            <div className="list-item-right">
              <div className="list-item-qty" style={{color:tx.type==='in'?'var(--ok)':'var(--err)'}}>
                {tx.type==='in'?'+':'-'}{tx.quantity}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
