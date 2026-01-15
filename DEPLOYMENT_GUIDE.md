# 🚀 Deploy Connect Platform to Render/Railway

## Your Repo
https://github.com/GrissaAbderrahmen/Connect-Startup

---

## Option 1: Deploy to Render (Recommended)

### Step 1: Create Database
1. Go to https://render.com → Dashboard → New → PostgreSQL
2. **Name**: connect-db
3. **Region**: Frankfurt (closest to Tunisia)
4. **Plan**: Free (90 days) or Starter ($7/mo)
5. Copy the **Internal Database URL**

### Step 2: Deploy Backend
1. New → Web Service → Connect GitHub repo
2. **Name**: connect-backend
3. **Root Directory**: `backend`
4. **Runtime**: Node
5. **Build Command**: `npm install`
6. **Start Command**: `npm start`
7. **Environment Variables**:
   ```
   DATABASE_URL = [paste from step 1]
   JWT_SECRET = your-secret-key-change-this
   NODE_ENV = production
   ENABLE_PAYMENTS = false
   ```

### Step 3: Deploy Frontend
1. New → Static Site → Connect GitHub repo
2. **Name**: connect-frontend
3. **Root Directory**: `frontend`
4. **Build Command**: `npm install && npm run build`
5. **Publish Directory**: `dist`
6. **Environment Variables**:
   ```
   VITE_API_BASE_URL = https://connect-backend.onrender.com/api
   VITE_APP_NAME = Connect
   VITE_ENABLE_PAYMENTS = false
   ```

---

## Option 2: Deploy to Railway

### Step 1: Quick Deploy
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select your repo

### Step 2: Add Database
1. Add → Database → PostgreSQL
2. Railway auto-connects it

### Step 3: Configure Services
Add these env vars to your backend service:
```
JWT_SECRET = your-secret-key-change-this
ENABLE_PAYMENTS = false
```

---

## After Deploy: Create Admin User

Run in DBeaver (connected to production database):
```sql
INSERT INTO users (name, email, password_hash, role, is_verified, created_at, updated_at) 
VALUES ('Admin', 'admin@connect-platform.com', 
        '$2a$10$axMB/.uqr.jYlbtXU3zwbONYMbz5yZ.zXFAOGn2tg1CYvBg4tSz.6', 
        'admin', true, NOW(), NOW());
```
Password: `Admin123!`

---

## Share with Friends 🎉
Give them your frontend URL!
