import {useEffect,useState} from 'react';
import API_BASE from '../api';
export default function Accounts(){
  const [list,setList]=useState([]); const [tx,setTx]=useState([]);
  const formatRs=value=>`Rs ${Number(value??0).toLocaleString('en-IN')}`;
  useEffect(()=>{ fetch(`${API_BASE}/api/banker/customers`).then(r=>r.json()).then(setList); },[]);
  const view= (id) => fetch(`${API_BASE}/api/transactions/`+id).then(r=>r.json()).then(setTx);
  return (<div><h3>Customers</h3><ul>{list.map(u=><li key={u.id} onClick={()=>view(u.id)}>{u.username} - {formatRs(u.balance)}</li>)}</ul><h3>Transactions</h3><ul>{tx.map(t=><li key={t.id}>{t.type} - {formatRs(t.amount)}</li>)}</ul></div>);
}
