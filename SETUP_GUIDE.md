# Connect - Complete Setup Guide

## Overview
This is a production-grade freelance marketplace POC built with:
- **Backend:** Express.js + PostgreSQL
- **Frontend:** React.js
- **Security:** JWT Authentication, bcrypt password hashing
- **Payment:** Mock escrow system (ready for real payment integration)

---

## Prerequisites

1. **Node.js** (v16+)
2. **PostgreSQL** (v12+)
3. **Git** (optional, for version control)

---

## Database Setup

### 1. Create PostgreSQL Database

\`\`\`bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE connect;

# Connect to the new database
\c connect
\`\`\`

### 2. Run Schema

\`\`\`bash
# Exit psql with \q, then run:
psql -U postgres -d connect -f backend/database/schema.sql
\`\`\`

This creates:
- `users` table (clients + freelancers)
- `freelancer_profiles` (skills, bio, rates)
- `projects` (job listings)
- `proposals` (freelancer bids)
- `escrow_transactions` (payment tracking)
- `messages` (messaging system)
- `ratings` (reviews)

---

## Backend Setup

### 1. Navigate to backend folder

\`\`\`bash
cd backend
\`\`\`

### 2. Install dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Create .env file

Create `backend/.env` with:

\`\`\`
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=connect
JWT_SECRET=your_super_secret_key_here_change_in_production
PORT=5000
NODE_ENV=development
\`\`\`

**IMPORTANT:** Change `DB_PASSWORD`, `JWT_SECRET` for production.

### 4. Start backend

\`\`\`bash
npm run dev
\`\`\`

You should see:
\`\`\`
[v0] Server running on port 5000
\`\`\`

**Backend is now running at:** `http://localhost:5000`

---

## Frontend Setup

### 1. Open new terminal, navigate to frontend

\`\`\`bash
cd frontend
\`\`\`

### 2. Install dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Start frontend

\`\`\`bash
npm start
\`\`\`

The app will open at `http://localhost:3000`

---

## Testing the POC

### 1. Create Accounts

1. Go to Signup page
2. Create a **Client** account (e.g., Ali, role: "client")
3. Create a **Freelancer** account (e.g., Sara, role: "freelancer")

### 2. Post a Project (as Client)

1. Login as client
2. Click "Post Project"
3. Fill in:
   - Title: "Build a landing page"
   - Description: "I need a responsive landing page"
   - Budget: "500"
   - Category: "Web Development"
   - Skills: "React, Tailwind"
   - Deadline: Pick a date

4. Click "Post Project"

### 3. Submit Proposal (as Freelancer)

1. Open new incognito window (or logout)
2. Login as freelancer
3. Click on the project
4. Fill proposal:
   - Your proposal: "I can build this in 3 days"
   - Price: "400"
   - Delivery: "3 days"
5. Click "Submit Proposal"

### 4. Accept Proposal & Escrow (as Client)

1. Login as client
2. Go to your project
3. See the freelancer's proposal
4. Click "Accept Proposal"
5. **Escrow system creates:** Money is now "locked" for this project

### 5. Complete Work & Release Funds

In real system:
1. Freelancer uploads work
2. Client confirms payment received (in platform)
3. Freelancer marks work complete
4. Client releases funds
5. Freelancer receives payment

For **POC demo**, use the escrow API endpoints:
\`\`\`bash
# Confirm payment (client)
curl -X PUT http://localhost:5000/api/escrow/1/payment-confirmed \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Mark work complete (freelancer)
curl -X PUT http://localhost:5000/api/escrow/1/work-completed \
  -H "Authorization: Bearer YOUR_TOKEN"

# Release funds (client)
curl -X PUT http://localhost:5000/api/escrow/1/release-funds \
  -H "Authorization: Bearer YOUR_TOKEN"
\`\`\`

---

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login

### Projects
- `GET /api/projects` - Get all open projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Post new project (clients only)

### Proposals
- `POST /api/proposals` - Submit proposal (freelancers only)
- `GET /api/proposals/project/:projectId` - Get proposals for project
- `PUT /api/proposals/:id/accept` - Accept proposal (clients only)

### Freelancers
- `GET /api/freelancers/:id` - Get freelancer profile
- `PUT /api/freelancers/profile` - Update profile (freelancers only)
- `GET /api/freelancers/search` - Search by skills

### Escrow (Critical)
- `GET /api/escrow/project/:projectId` - Get escrow status
- `PUT /api/escrow/:id/payment-confirmed` - Client confirms payment
- `PUT /api/escrow/:id/work-completed` - Freelancer marks work done
- `PUT /api/escrow/:id/release-funds` - Client releases funds

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/conversation/:userId` - Get conversation

### Ratings
- `POST /api/ratings` - Submit rating (clients only)

---

## Deployment (Before Submission)

### 1. Prepare for Production

**Backend (.env):**
\`\`\`
NODE_ENV=production
JWT_SECRET=generate-a-strong-random-string
DB_PASSWORD=secure-password
\`\`\`

**Update CORS in server.js:**
\`\`\`js
app.use(cors({
  origin: 'https://your-frontend-domain.com',
  credentials: true
}));
\`\`\`

### 2. Deploy Backend

**Option A: DigitalOcean App Platform**
1. Push code to GitHub
2. Connect GitHub to DigitalOcean App Platform
3. Set environment variables in dashboard
4. Deploy

**Option B: Render**
1. Push to GitHub
2. Connect Render
3. Set `DATABASE_URL` and `JWT_SECRET`
4. Deploy

### 3. Deploy Frontend

**Option A: Vercel**
\`\`\`bash
npm install -g vercel
vercel
\`\`\`

**Option B: Netlify**
1. Push to GitHub
2. Connect Netlify
3. Deploy

---

## Security Checklist

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Change `DB_PASSWORD` to secure password
- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS only
- [ ] Enable CORS only for your frontend domain
- [ ] Set rate limiting on auth endpoints
- [ ] Hash passwords (bcryptjs handles this)
- [ ] Validate all inputs (express-validator handles this)
- [ ] Add RLS to PostgreSQL tables (for multi-tenant)

---

## Troubleshooting

### "Cannot connect to database"
- Check PostgreSQL is running
- Verify `.env` credentials
- Verify database exists: `\l` in psql

### "CORS error"
- Backend must include your frontend URL
- Check `cors()` middleware in server.js

### "Login fails"
- Check `.env` JWT_SECRET is set
- Verify user exists in database
- Check password is correct

### "Proposals not showing"
- Ensure project is in "open" status
- Check freelancer_id in proposals table

---

## Next Steps (For Production)

1. **Real Payment Integration:**
   - Integrate Paymentee/Flouci/D17 API
   - Replace mock escrow with real transaction processing

2. **Mobile App:**
   - React Native version

3. **Admin Dashboard:**
   - Dispute management
   - User moderation
   - Analytics

4. **AI Features:**
   - Skill matching algorithm
   - Proposal quality scoring
   - Fraud detection

5. **Testing:**
   - Unit tests (Jest)
   - Integration tests
   - Load testing

---

## Important Notes

### For Pre-Label Submission:
- This POC demonstrates:
  ✓ User authentication (JWT)
  ✓ Project posting system
  ✓ Proposal system (bidding)
  ✓ Escrow/Payment logic
  ✓ Messaging
  ✓ Ratings system
  ✓ Scalable architecture
  ✓ Professional UI

### Legal/Security Reminders:
- Users sign up with real data = **you must comply with data privacy laws (GDPR, Tunisia laws)**
- Real money is involved = **you need proper compliance, terms of service, privacy policy**
- Disputes will happen = **build a fair dispute resolution process**

---

## Support

If you get stuck:
1. Check error logs in terminal
2. Verify `.env` file is correct
3. Make sure both frontend and backend are running
4. Clear browser cache and localStorage

---

**You're ready to submit for Pre-Label. Good luck!**
