export default function CustomerLogin({setUser,setPage}){
  const submit=async(e)=>{
    e.preventDefault();
    const f=new FormData(e.target);
    const res=await fetch('http://localhost:4000/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({identifier:f.get('identifier'),password:f.get('password'),role:'customer'})});
    const data=await res.json();
    if(data.error) return alert('Invalid');
    setUser(data.user);
    setPage('transactions');
  };
  return (<form onSubmit={submit}><h3>Customer Login</h3><input name="identifier" placeholder="username or email"/><br/><input name="password" placeholder="password"/><br/><button>Login</button></form>);
}
