import {useEffect,useState} from 'react';
export default function Accounts(){
  const [list,setList]=useState([]); const [tx,setTx]=useState([]);
  const formatRs=value=>`Rs ${Number(value??0).toLocaleString('en-IN')}`;
  useEffect(()=>{ fetch('http://localhost:4000/api/banker/customers').then(r=>r.json()).then(setList); },[]);
  const view= (id) => fetch('http://localhost:4000/api/transactions/'+id).then(r=>r.json()).then(setTx);
  return (<div><h3>Customers</h3><ul>{list.map(u=><li key={u.id} onClick={()=>view(u.id)}>{u.username} - {formatRs(u.balance)}</li>)}</ul><h3>Transactions</h3><ul>{tx.map(t=><li key={t.id}>{t.type} - {formatRs(t.amount)}</li>)}</ul></div>);
}
