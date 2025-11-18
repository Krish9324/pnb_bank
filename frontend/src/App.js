import { useState } from 'react';
import Signup from './pages/Signup';
import CustomerLogin from './pages/CustomerLogin';
import BankerLogin from './pages/BankerLogin';
import Transactions from './pages/Transactions';
import Accounts from './pages/Accounts';
export default function App(){
  const [page,setPage]=useState('home');
  const [user,setUser]=useState(null);
  return (
    <div className="app-root">
      <div className="app-card">
        <h2>Simple PNB Banking</h2>
        <div className="nav-buttons">
          <button onClick={()=>setPage('signup')}>Signup</button>
          <button onClick={()=>setPage('customerLogin')}>Customer Login</button>
          <button onClick={()=>setPage('bankerLogin')}>Banker Login</button>
        </div>
        <hr/>
        {page==='signup'&&<Signup/>}
        {page==='customerLogin'&&<CustomerLogin setUser={setUser} setPage={setPage}/>}
        {page==='bankerLogin'&&<BankerLogin setUser={setUser} setPage={setPage}/>}
        {page==='transactions'&&<Transactions user={user}/>}
        {page==='accounts'&&<Accounts/>}
      </div>
    </div>
  );
}
