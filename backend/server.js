const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const shortid = require('shortid');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bank_db';
mongoose.connect(MONGO).then(()=>console.log('MongoDB connected')).catch(e=>console.log('Mongo connect error',e));


const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: {type:String, enum:['customer','banker']},
  token: String,
  createdAt: {type:Date, default:Date.now}
});
const accountSchema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
  balance: {type:Number, default:0}
});
const txSchema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
  type: {type:String, enum:['deposit','withdraw']},
  amount: Number,
  balance_after: Number,
  createdAt: {type:Date, default:Date.now}
});

const User = mongoose.model('User', userSchema);
const Account = mongoose.model('Account', accountSchema);
const Transaction = mongoose.model('Transaction', txSchema);


function genToken(){ return shortid.generate() + shortid.generate() + shortid.generate(); } 

app.post('/api/auth/signup', async (req,res)=>{
  try{
    const {username,email,password,role} = req.body;
    if(!username || !email || !password || !role) return res.json({error:'Missing fields'});
    const existing = await User.findOne({$or:[{username},{email}]});
    if(existing) return res.json({error:'User exists'});
    const hash = await bcrypt.hash(password,10);
    const user = new User({username,email,password:hash,role,token:genToken()});
    await user.save();
    
    if(role === 'customer'){
      const acc = new Account({user: user._id, balance: 0});
      await acc.save();
    }
    res.json({ok:true});
  }catch(e){
    console.log(e);
    res.json({error:'Server'});
  }
});

app.post('/api/auth/login', async (req,res)=>{
  try{
    const {identifier,password,role} = req.body; 
    if(!identifier || !password || !role) return res.json({error:'Missing'});
    const user = await User.findOne({$or:[{username:identifier},{email:identifier}], role});
    if(!user) return res.json({error:'Invalid'});
    const ok = await bcrypt.compare(password, user.password);
    if(!ok) return res.json({error:'Invalid'});
    
    user.token = genToken();
    await user.save();
    res.json({user:{id:user._id,username:user.username,role:user.role,token:user.token}});
  }catch(e){
    console.log(e);
    res.json({error:'Server'});
  }
});


app.get('/api/transactions/:id', async (req,res)=>{
  try{
    const uid = req.params.id;
    const user = await User.findById(uid);
    if(!user) return res.json([]);
    const tx = await Transaction.find({user: uid}).sort({createdAt:-1});
    res.json(tx.map(t=>({id:t._id,type:t.type,amount:t.amount,balance_after:t.balance_after,createdAt:t.createdAt})));
  }catch(e){
    console.log(e);
    res.json([]);
  }
});

// Deposit
app.post('/api/transactions/deposit', async (req,res)=>{
  try{
    const {user_id, amount} = req.body;
    const a = Number(amount);
    if(!user_id || isNaN(a) || a<=0) return res.json({error:'Invalid amount'});
    const acc = await Account.findOne({user: user_id});
    if(!acc) return res.json({error:'No account'});
    acc.balance += a;
    await acc.save();
    const tx = new Transaction({user: user_id, type: 'deposit', amount: a, balance_after: acc.balance});
    await tx.save();
    res.json({ok:true, balance: acc.balance});
  }catch(e){
    console.log(e);
    res.json({error:'Server'});
  }
});


app.post('/api/transactions/withdraw', async (req,res)=>{
  try{
    const {user_id, amount} = req.body;
    const a = Number(amount);
    if(!user_id || isNaN(a) || a<=0) return res.json({error:'Invalid amount'});
    const acc = await Account.findOne({user: user_id});
    if(!acc) return res.json({error:'No account'});
    if(acc.balance < a) return res.json({error:'Insufficient Funds'});
    acc.balance -= a;
    await acc.save();
    const tx = new Transaction({user: user_id, type: 'withdraw', amount: a, balance_after: acc.balance});
    await tx.save();
    res.json({ok:true, balance: acc.balance});
  }catch(e){
    console.log(e);
    res.json({error:'Server'});
  }
});


app.get('/api/banker/customers', async (req,res)=>{
  try{
    const users = await User.find({role:'customer'});
    
    const out = [];
    for(const u of users){
      const acc = await Account.findOne({user: u._id});
      out.push({id: u._id, username: u.username, balance: acc ? acc.balance : 0});
    }
    res.json(out);
  }catch(e){
    console.log(e);
    res.json([]);
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=>console.log('Server running on', PORT));