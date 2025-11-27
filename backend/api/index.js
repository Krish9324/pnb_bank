const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const shortid = require('shortid');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

// CORS - allow frontend origin
const allowedOrigins = ['https://pnb-bank-5gvs.vercel.app', 'http://localhost:3000'];
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});
app.use(express.json());

function genToken() {
  return shortid.generate() + shortid.generate() + shortid.generate();
}

// Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password || !role) {
      return res.json({ error: 'Missing fields' });
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }]
      }
    });
    if (existing) return res.json({ error: 'User exists' });

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hash,
        role,
        token: genToken()
      }
    });

    if (role === 'customer') {
      await prisma.account.create({
        data: {
          userId: user.id,
          balance: 0
        }
      });
    }

    res.json({ ok: true });
  } catch (e) {
    console.log(e);
    res.json({ error: 'Server' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password, role } = req.body;
    if (!identifier || !password || !role) {
      return res.json({ error: 'Missing' });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: identifier }, { email: identifier }],
        role
      }
    });
    if (!user) return res.json({ error: 'Invalid' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.json({ error: 'Invalid' });

    const newToken = genToken();
    await prisma.user.update({
      where: { id: user.id },
      data: { token: newToken }
    });

    res.json({
      user: { id: user.id, username: user.username, role: user.role, token: newToken }
    });
  } catch (e) {
    console.log(e);
    res.json({ error: 'Server' });
  }
});

// Get transactions
app.get('/api/transactions/:id', async (req, res) => {
  try {
    const uid = req.params.id;
    const user = await prisma.user.findUnique({ where: { id: uid } });
    if (!user) return res.json([]);

    const tx = await prisma.transaction.findMany({
      where: { userId: uid },
      orderBy: { createdAt: 'desc' }
    });

    res.json(
      tx.map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        balance_after: t.balanceAfter,
        createdAt: t.createdAt
      }))
    );
  } catch (e) {
    console.log(e);
    res.json([]);
  }
});

// Deposit
app.post('/api/transactions/deposit', async (req, res) => {
  try {
    const { user_id, amount } = req.body;
    const a = Number(amount);
    if (!user_id || isNaN(a) || a <= 0) {
      return res.json({ error: 'Invalid amount' });
    }

    const acc = await prisma.account.findUnique({ where: { userId: user_id } });
    if (!acc) return res.json({ error: 'No account' });

    const newBalance = acc.balance + a;
    await prisma.account.update({
      where: { userId: user_id },
      data: { balance: newBalance }
    });

    await prisma.transaction.create({
      data: {
        userId: user_id,
        type: 'deposit',
        amount: a,
        balanceAfter: newBalance
      }
    });

    res.json({ ok: true, balance: newBalance });
  } catch (e) {
    console.log(e);
    res.json({ error: 'Server' });
  }
});

// Withdraw
app.post('/api/transactions/withdraw', async (req, res) => {
  try {
    const { user_id, amount } = req.body;
    const a = Number(amount);
    if (!user_id || isNaN(a) || a <= 0) {
      return res.json({ error: 'Invalid amount' });
    }

    const acc = await prisma.account.findUnique({ where: { userId: user_id } });
    if (!acc) return res.json({ error: 'No account' });
    if (acc.balance < a) return res.json({ error: 'Insufficient Funds' });

    const newBalance = acc.balance - a;
    await prisma.account.update({
      where: { userId: user_id },
      data: { balance: newBalance }
    });

    await prisma.transaction.create({
      data: {
        userId: user_id,
        type: 'withdraw',
        amount: a,
        balanceAfter: newBalance
      }
    });

    res.json({ ok: true, balance: newBalance });
  } catch (e) {
    console.log(e);
    res.json({ error: 'Server' });
  }
});

// Banker: get all customers
app.get('/api/banker/customers', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'customer' },
      include: { account: true }
    });

    const out = users.map((u) => ({
      id: u.id,
      username: u.username,
      balance: u.account ? u.account.balance : 0
    }));

    res.json(out);
  } catch (e) {
    console.log(e);
    res.json([]);
  }
});

module.exports = app;

