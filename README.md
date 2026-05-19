# NR Softech Payslip Generating System

A full-stack, responsive payroll and employee management system built to manage employee records, perform automatic salary/deduction/tax computations, and generate pixel-perfect, print-ready and downloadable payslips.

## 🚀 Features

- **Automated Payroll Computations:** Instant calculations of HRA (50% of Basic), PF (12% of Basic), proration based on actual paid days worked, Income Tax estimation, and Net Pay.
- **Dynamic Year-To-Date (YTD) projections:** Auto-calculated projections for all earnings and deduction categories.
- **Search & Filter Directory:** Instantly find employees by Name, Personal Number, or PAN to generate current or historical payslips.
- **Print & PDF Exports:** Styled with specific `@media print` CSS selectors to print clean, border-aligned payslips without headers/nav bars.
- **Environment-ready Configuration:** Built with configurable environment variables for seamless local-to-production transitions.
- **Dual-Database Adapter:** Zero-configuration local development using **SQLite**, with automatic production fallback to **PostgreSQL** when a database URL is provided.

---

## 🛠️ Technology Stack

- **Frontend:** React (Vite), Material UI (MUI), React Router DOM (v7), Axios, html2pdf.js
- **Backend:** Node.js, Express.js, Cors, Dotenv
- **Databases Supported:**
  - SQLite (Local development default)
  - PostgreSQL (Production ready)

---

## 📂 Project Structure

```text
Payslip/
├── backend/
│   ├── controllers/      # Route controllers containing payroll calculations and db operations
│   ├── models/           # Database adapter (db.js) and local SQLite storage (payroll.db)
│   ├── routes/           # Express router endpoints
│   ├── package.json      # Node server dependencies & scripts
│   ├── schema.sql        # Database schema file for PostgreSQL
│   ├── seed.js           # SQLite seeding script for local demo data
│   └── server.js         # Backend entry point
├── frontend/
│   ├── public/           # Static assets
│   ├── src/
│   │   ├── assets/       # Media assets
│   │   ├── components/   # Reusable UI components (Header, Payslip, DataTable, etc.)
│   │   ├── pages/        # Route pages (AddEmployee, EditEmployee, SearchPayslip, ViewEmployees)
│   │   ├── config.js     # Global environment configurations
│   │   ├── App.jsx       # Routing configurations
│   │   └── main.jsx      # React mounting entry point
│   ├── package.json      # Vite/React configuration & scripts
│   └── vite.config.js    # Vite compilation config
├── package.json          # Root orchestration package.json
└── README.md             # Project documentation & guides
```

---

## 💻 Local Setup & Running

Follow these steps to run the application locally on your machine:

### 1. Install Dependencies
Run the command below from the **root directory** to install dependencies for the root orchestrator, backend, and frontend:
```bash
npm run install-all
```

### 2. Seed the Local Database
Seed the SQLite database with 10 pre-loaded employee and payroll records:
```bash
npm run seed
```

### 3. Start Frontend & Backend Concurrently
Run both the React development server (Vite) and the Express backend server simultaneously with a single command:
```bash
npm run dev
```
- Frontend will open at: [http://localhost:5173](http://localhost:5173)
- Backend will run on: [http://localhost:3001](http://localhost:3001)

---

## 📦 GitHub Preparation

To make this folder a clean, public GitHub repository:

1. **Initialize Git & Commit Files:**
   From the project root:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Deployable Payslip Generating System"
   ```
2. **Push to GitHub:**
   Create a repository on GitHub, then link it and push:
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git branch -M main
   git push -u origin main
   ```

*(Note: The root `.gitignore` is already configured to automatically exclude folder-specific items, IDE configs, local sqlite `.db` files, and `.env` credentials.)*

---

## ☁️ Deployment Guide

This application is decoupled into a frontend and a backend, making it highly compatible with modern hosting platforms.

### 1. Database Deployment (PostgreSQL)
Since SQLite databases are file-based and local, production deployments should use a PostgreSQL database:
1. **Provision a PostgreSQL DB:**
   - Create a free database on platforms like [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Render](https://render.com).
2. **Execute Schema SQL:**
   - Connect to your SQL database client and execute the SQL statements in [backend/schema.sql](backend/schema.sql) to create the `employee` and `payroll` tables.
3. **Obtain Connection String:**
   - Copy the database connection URL (e.g., `postgres://user:password@host:port/dbname`).

### 2. Backend Deployment (Render / Railway)
Deploy the Node/Express backend on platforms like [Render Web Services](https://render.com):
1. **Create Web Service:**
   - Connect your GitHub repository to Render and choose "Web Service".
2. **Settings:**
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. **Environment Variables:**
   Add these environment variables:
   - `PORT`: `3001` (or let Render set it automatically)
   - `DATABASE_URL`: *[Your PostgreSQL connection URL]*
4. **Deploy:** Deploy the service and copy the generated backend URL (e.g., `https://payslip-backend.onrender.com`).

### 3. Frontend Deployment (Vercel / Netlify)
Deploy the React frontend on platforms like [Vercel](https://vercel.com) or [Netlify](https://netlify.com):
1. **Create Site / Project:**
   - Import your GitHub repository to Vercel/Netlify.
2. **Settings:**
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. **Environment Variables:**
   Add this critical build-time environment variable to connect the frontend to the live backend:
   - `VITE_API_URL`: *[Your deployed backend URL from Step 2]* (e.g., `https://payslip-backend.onrender.com`)
4. **Deploy:** Deploy the site. Your frontend will be live and linked to the deployed backend!
