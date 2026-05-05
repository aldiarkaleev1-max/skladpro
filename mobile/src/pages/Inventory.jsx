import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { initialInventory, categories, locations } from '../data/mockData';
import { useToast } from '../context/ToastContext';
import { Search, Plus, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const getStatus = q => q===0?'out':q<10?'low':'ok';
const statusBadge = { ok:'b-ok', low:'b-warn', out:'b-err' };
const statusText = { ok:'В наличии', low:'Мало', out:'Нет' };

export function Inventory() {
  const [inventory, setInventory] = useLocalStorage('inventory-data', initialInventory);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('Все');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const { addToast } = useToast();
  const empty = { sku:'', name:'', category:categories[0], quantity:0, price:0, supplier:'', location:locations[0] };
  const [form, setForm] = useState(empty);

  const filtered = inventory.filter(i => {
    const ms = i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase());
    const mc = catFilter==='Все' || i.category===catFilter;
    return ms && mc;
  });

  const openModal = (item=null) => {
    if(item){setEditing(item);setForm({...item});}
    else{setEditing(null);setForm(empty);}
    setModal(true);
  };

  const handleSubmit = e => {
    e.preventDefault();
    const q=Number(form.quantity), p=Number(form.price);
    if(editing){
      setInventory(inventory.map(i=>i.id===editing.id?{...form,id:i.id,quantity:q,price:p}:i));
      addToast('Товар обновлён','success');
    } else {
      setInventory([...inventory,{...form,id:uuidv4(),quantity:q,price:p}]);
      addToast('Товар добавлен','success');
    }
    setModal(false);
  };

  const handleDelete = id => {
    if(!confirm('Удалить?')) return;
    setInventory(inventory.filter(i=>i.id!==id));
    addToast('Удалено','error');
  };

  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  return (
    <div>
      <div className="m-search">
        <Search size={16}/>
        <input placeholder="Поиск товара..." value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>

      <div className="filter-scroll">
        {['Все',...categories].map(c=>(
          <button key={c} className={`chip ${catFilter===c?'active':''}`} onClick={()=>setCatFilter(c)}>{c}</button>
        ))}
      </div>

      <div style={{fontSize:12,color:'var(--text3)',marginBottom:10}}>Найдено: {filtered.length}</div>

      <div style={{borderRadius:'var(--r)',overflow:'hidden',border:'1px solid var(--border)'}}>
        {filtered.length>0 ? filtered.map(item=>(
          <div key={item.id} className="list-item" onClick={()=>openModal(item)}>
            <div className="list-item-content">
              <div className="list-item-title">{item.name}</div>
              <div className="list-item-sub">{item.sku} · {item.category}</div>
            </div>
            <div className="list-item-right">
              <div className="list-item-qty">{item.quantity}</div>
              <div className="list-item-price">{item.price.toLocaleString()} ₸</div>
              <span className={`badge ${statusBadge[getStatus(item.quantity)]}`} style={{marginTop:4}}>
                {statusText[getStatus(item.quantity)]}
              </span>
            </div>
          </div>
        )) : <div style={{padding:32,textAlign:'center',color:'var(--text3)'}}>Ничего не найдено</div>}
      </div>

      <button className="fab" onClick={()=>openModal()}><Plus size={24}/></button>

      {modal && (
        <div className="modal-overlay" onClick={()=>setModal(false)}>
          <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
            <div className="modal-handle"/>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <div className="modal-title">{editing?'Редактировать':'Новый товар'}</div>
              {editing && <button className="btn btn-err btn-sm" onClick={()=>{handleDelete(editing.id);setModal(false);}}>Удалить</button>}
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="m-input-group"><label className="m-label">Артикул</label><input className="m-input" required value={form.sku} onChange={e=>set('sku',e.target.value)}/></div>
                <div className="m-input-group"><label className="m-label">Категория</label><select className="m-input" value={form.category} onChange={e=>set('category',e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></div>
              </div>
              <div className="m-input-group"><label className="m-label">Название</label><input className="m-input" required value={form.name} onChange={e=>set('name',e.target.value)}/></div>
              <div className="grid-2">
                <div className="m-input-group"><label className="m-label">Кол-во</label><input type="number" min="0" className="m-input" required value={form.quantity} onChange={e=>set('quantity',e.target.value)}/></div>
                <div className="m-input-group"><label className="m-label">Цена ₸</label><input type="number" min="0" className="m-input" required value={form.price} onChange={e=>set('price',e.target.value)}/></div>
              </div>
              <div className="m-input-group"><label className="m-label">Склад</label><select className="m-input" value={form.location||locations[0]} onChange={e=>set('location',e.target.value)}>{locations.map(l=><option key={l}>{l}</option>)}</select></div>
              <div style={{display:'flex',gap:10,marginTop:8}}>
                <button type="button" className="btn btn-ghost" style={{flex:1}} onClick={()=>setModal(false)}>Отмена</button>
                <button type="submit" className="btn btn-primary" style={{flex:1}}>Сохранить</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
