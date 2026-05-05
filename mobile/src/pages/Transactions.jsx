import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { initialTransactions, initialInventory } from '../data/mockData';
import { useToast } from '../context/ToastContext';
import { ArrowDownLeft, ArrowUpRight, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const getStatus = q => q===0?'out-of-stock':q<10?'low-stock':'in-stock';

export function Transactions() {
  const [transactions, setTransactions] = useLocalStorage('inventory-transactions', initialTransactions);
  const [inventory, setInventory] = useLocalStorage('inventory-data', initialInventory);
  const [modal, setModal] = useState(false);
  const [txType, setTxType] = useState('in');
  const [filter, setFilter] = useState('all');
  const { addToast } = useToast();
  const [form, setForm] = useState({ itemId:'', quantity:1, note:'' });

  const getName = id => inventory.find(i=>i.id===id)?.name || '—';

  const openModal = type => {
    setTxType(type);
    setForm({itemId:inventory[0]?.id||'',quantity:1,note:''});
    setModal(true);
  };

  const handleSubmit = e => {
    e.preventDefault();
    const target = inventory.find(i=>i.id===form.itemId);
    if(!target) return;
    let nq = target.quantity;
    if(txType==='in') nq+=Number(form.quantity);
    else { if(nq<Number(form.quantity)){addToast('Недостаточно!','error');return;} nq-=Number(form.quantity); }
    setInventory(inventory.map(i=>i.id===form.itemId?{...i,quantity:nq,status:getStatus(nq)}:i));
    setTransactions([{id:uuidv4(),date:new Date().toISOString(),type:txType,itemId:form.itemId,quantity:Number(form.quantity),note:form.note},...transactions]);
    addToast(txType==='in'?'Приход оформлен':'Расход оформлен','success');
    setModal(false);
  };

  const shown = transactions.filter(t=>filter==='all'||t.type===filter);

  return (
    <div>
      <div style={{display:'flex',gap:8,marginBottom:14}}>
        <button className="btn btn-ok btn-sm" style={{flex:1}} onClick={()=>openModal('in')}><ArrowDownLeft size={16}/> Приход</button>
        <button className="btn btn-err btn-sm" style={{flex:1}} onClick={()=>openModal('out')}><ArrowUpRight size={16}/> Расход</button>
      </div>

      <div className="filter-scroll">
        {[['all','Все'],['in','Приход'],['out','Расход']].map(([v,l])=>(
          <button key={v} className={`chip ${filter===v?'active':''}`} onClick={()=>setFilter(v)}>{l}</button>
        ))}
      </div>

      <div style={{borderRadius:'var(--r)',overflow:'hidden',border:'1px solid var(--border)'}}>
        {shown.length>0 ? shown.map(tx=>(
          <div key={tx.id} className="list-item">
            <div style={{width:36,height:36,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',background:tx.type==='in'?'var(--ok-l)':'var(--err-l)',color:tx.type==='in'?'var(--ok)':'var(--err)',flexShrink:0}}>
              {tx.type==='in'?<ArrowDownLeft size={18}/>:<ArrowUpRight size={18}/>}
            </div>
            <div className="list-item-content">
              <div className="list-item-title">{getName(tx.itemId)}</div>
              <div className="list-item-sub">{new Date(tx.date).toLocaleDateString('ru-RU')} · {tx.note||'—'}</div>
            </div>
            <div className="list-item-right">
              <div className="list-item-qty" style={{color:tx.type==='in'?'var(--ok)':'var(--err)'}}>
                {tx.type==='in'?'+':'-'}{tx.quantity}
              </div>
            </div>
          </div>
        )) : <div style={{padding:32,textAlign:'center',color:'var(--text3)'}}>Нет операций</div>}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={()=>setModal(false)}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
            <div className="modal-handle"/>
            <div className="modal-title">{txType==='in'?'Оформить приход':'Оформить расход'}</div>
            <form onSubmit={handleSubmit}>
              <div className="m-input-group"><label className="m-label">Товар</label>
                <select className="m-input" required value={form.itemId} onChange={e=>setForm({...form,itemId:e.target.value})}>
                  {inventory.map(i=><option key={i.id} value={i.id}>{i.name} — {i.quantity} шт.</option>)}
                </select>
              </div>
              <div className="m-input-group"><label className="m-label">Количество</label>
                <input type="number" min="1" className="m-input" required value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})}/>
              </div>
              <div className="m-input-group"><label className="m-label">Примечание</label>
                <input className="m-input" value={form.note} onChange={e=>setForm({...form,note:e.target.value})}/>
              </div>
              <div style={{display:'flex',gap:10,marginTop:8}}>
                <button type="button" className="btn btn-ghost" style={{flex:1}} onClick={()=>setModal(false)}>Отмена</button>
                <button type="submit" className="btn btn-primary" style={{flex:1}}>Провести</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
