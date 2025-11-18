import {useEffect,useState} from 'react';
export default function Transactions({user}){
  const [tx,setTx]=useState([]);
  const [balance,setBalance]=useState(0);
  const formatRs=value=>{
    const num=Number(value??0);
    return `Rs ${num.toLocaleString('en-IN')}`;
  };
  const load=async()=>{
    const r=await fetch('http://localhost:4000/api/transactions/'+user.id);
    const d=await r.json();
    setTx(d);
    if(d.length>0) setBalance(d[0].balance_after);
  };
  useEffect(()=>{ if(user) load(); },[]);
  const deposit=async()=>{ const a=prompt('Amount?'); await fetch('http://localhost:4000/api/transactions/deposit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:user.id,amount:a})}); load(); };
  const withdraw=async()=>{ const a=prompt('Amount?'); const r=await fetch('http://localhost:4000/api/transactions/withdraw',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:user.id,amount:a})}); const d=await r.json(); if(d.error) alert(d.error); load(); };
  return (<div>
    <h3>Balance: {formatRs(balance)}</h3>
    <div className="action-buttons">
      <button onClick={deposit}>Deposit</button>
      <button onClick={withdraw}>Withdraw</button>
    </div>
    <ul>{tx.map(t=><li key={t.id}>{t.type} - {formatRs(t.amount)}</li>)}</ul>
  </div>);
}
