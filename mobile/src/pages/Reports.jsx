import React from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { initialInventory, initialTransactions } from '../data/mockData';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export function Reports() {
  const [inventory] = useLocalStorage('inventory-data', initialInventory);
  const [transactions] = useLocalStorage('inventory-transactions', initialTransactions);
  const totalValue = inventory.reduce((s,i)=>s+i.quantity*i.price,0);
  const totalItems = inventory.reduce((s,i)=>s+i.quantity,0);

  const locMap = {};
  inventory.forEach(i => { const l=i.location||'N/A'; locMap[l]=(locMap[l]||0)+i.quantity; });

  const barData = {
    labels: Object.keys(locMap),
    datasets: [{ data: Object.values(locMap), backgroundColor:['#6366f1','#10b981','#f59e0b'], borderRadius:8, barPercentage:.6 }]
  };

  return (
    <div>
      <div className="grid-2" style={{marginBottom:16}}>
        <div className="m-card" style={{textAlign:'center',padding:16}}>
          <div style={{fontSize:24,fontWeight:700}}>{inventory.length}</div>
          <div style={{fontSize:12,color:'var(--text3)'}}>Наименований</div>
        </div>
        <div className="m-card" style={{textAlign:'center',padding:16}}>
          <div style={{fontSize:24,fontWeight:700}}>{totalItems}</div>
          <div style={{fontSize:12,color:'var(--text3)'}}>Единиц</div>
        </div>
        <div className="m-card" style={{textAlign:'center',padding:16}}>
          <div style={{fontSize:20,fontWeight:700}}>{(totalValue/1000000).toFixed(1)}M ₸</div>
          <div style={{fontSize:12,color:'var(--text3)'}}>Стоимость</div>
        </div>
        <div className="m-card" style={{textAlign:'center',padding:16}}>
          <div style={{fontSize:24,fontWeight:700}}>{transactions.length}</div>
          <div style={{fontSize:12,color:'var(--text3)'}}>Операций</div>
        </div>
      </div>

      <div className="m-card" style={{marginBottom:16}}>
        <div className="section-title">По складам</div>
        <div className="chart-box"><Bar data={barData} options={{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{grid:{color:'rgba(128,128,128,.1)'}}}}} /></div>
      </div>

      <div className="section-title">Ведомость</div>
      <div style={{borderRadius:'var(--r)',overflow:'hidden',border:'1px solid var(--border)'}}>
        {inventory.map(i=>(
          <div key={i.id} className="list-item">
            <div className="list-item-content">
              <div className="list-item-title">{i.name}</div>
              <div className="list-item-sub">{i.sku} · {i.category}</div>
            </div>
            <div className="list-item-right">
              <div className="list-item-qty">{i.quantity}</div>
              <div className="list-item-price">{(i.quantity*i.price).toLocaleString()} ₸</div>
            </div>
          </div>
        ))}
        <div className="list-item" style={{background:'var(--accent-l)',fontWeight:700}}>
          <div className="list-item-content"><div className="list-item-title">ИТОГО</div></div>
          <div className="list-item-right">
            <div className="list-item-qty">{totalItems}</div>
            <div className="list-item-price">{totalValue.toLocaleString()} ₸</div>
          </div>
        </div>
      </div>
    </div>
  );
}
