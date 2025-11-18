# Backend (MongoDB)
This backend replaces the original MySQL backend with MongoDB (Mongoose).

Run locally:
1. Install dependencies:
   npm install
2. Start a local MongoDB server (default: mongodb://127.0.0.1:27017)
3. Copy `.env.example` to `.env` and adjust MONGO_URI if needed.
4. Start server:
   npm run dev
API endpoints:
- POST /api/auth/signup  {username,email,password,role}
- POST /api/auth/login   {identifier,password,role}
- GET  /api/transactions/:id
- POST /api/transactions/deposit {user_id, amount}
- POST /api/transactions/withdraw {user_id, amount}
- GET /api/banker/customers
