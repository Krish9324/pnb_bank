import API_BASE from '../api';

export default function Signup(){
  const submit=async(e)=>{
    e.preventDefault();
    const f=new FormData(e.target);
    await fetch(`${API_BASE}/api/auth/signup`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        username:f.get('username'),
        email:f.get('email'),
        password:f.get('password'),
        role:f.get('role')
      })
    });
    alert('Signup done');
  };
  return (<form onSubmit={submit}>
    <h3>Signup</h3>
    <input name="username" placeholder="username"/><br/>
    <input name="email" placeholder="email"/><br/>
    <input name="password" placeholder="password"/><br/>
    <select name="role"><option value="customer">Customer</option><option value="banker">Banker</option></select><br/>
    <button>Submit</button>
  </form>);
}
