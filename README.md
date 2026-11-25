# ALMARTO – Next.js & Supabase E-Commerce Platform

A production-ready e-commerce platform built with **Next.js 14 (App Router)**, **Supabase PostgreSQL**, **Prisma ORM**, and **Tailwind CSS**.

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your Supabase connection strings and keys:
```bash
cp .env.example .env
```

### 3. Generate Prisma Client & Push Database Schema
```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Customer Storefront:** `http://localhost:3000/`
- **Dedicated Admin Login:** `http://localhost:3000/almarto_admin`
  - Default Admin Email: `aswak761@gmail.com`
  - Default Admin Password: `almarto123`

---

## 🌐 Deployment Guide

### A. Deploy to Vercel (Recommended for Next.js)

1. Push your code to your GitHub/GitLab repository.
2. Go to [Vercel Dashboard](https://vercel.com/new) and click **Add New Project**.
3. Import your repository.
4. Framework Preset will auto-detect as **Next.js**.
5. In **Environment Variables**, add the required keys listed in the table below.
6. Click **Deploy**.

> **Note:** The included `vercel.json` and `"postinstall": "prisma generate"` automatically handle Prisma generation during build.

---

### B. Deploy to Netlify

1. Push your code to your GitHub/GitLab repository.
2. Go to [Netlify Dashboard](https://app.netlify.com/) and click **Add new site** → **Import an existing project**.
3. Select your repository.
4. Netlify will detect settings from the included `netlify.toml`:
   - **Build command:** `prisma generate && next build`
   - **Publish directory:** `.next`
   - **Node version:** `20`
5. Go to **Site configuration** → **Environment variables** and add all variables from the table below.
6. Click **Deploy site**.

---

## 🔑 Required Environment Variables (Both Vercel & Netlify)

Set these environment variables in your deployment dashboard before deploying:

| Variable Name | Description | Example / Source |
| :--- | :--- | :--- |
| `DATABASE_URL` | Supabase PostgreSQL Pooler connection string | `postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Direct Supabase PostgreSQL connection string | `postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:5432/postgres` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | `https://[REF].supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anonymous / Publishable Key | `sb_publishable_...` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase Publishable Key | `sb_publishable_...` |
| `JWT_SECRET` | Secure JWT Secret for authentication tokens | `your-secure-jwt-secret-key-at-least-32-chars` |
| `ADMIN_SECRET_KEY` | Secret key for elevated admin authorization | `your-admin-secret-key` |
| `SMTP_HOST` | *(Optional)* SMTP mail server host | `smtp.gmail.com` |
| `SMTP_PORT` | *(Optional)* SMTP mail server port | `587` |
| `SMTP_USER` | *(Optional)* Email address for OTP / notifications | `your-email@gmail.com` |
| `SMTP_PASS` | *(Optional)* App-specific email password | `xxxx xxxx xxxx xxxx` |
| `SMTP_FROM` | *(Optional)* Sender address display | `ALMARTO <noreply@almarto.com>` |

---

## 📁 Essential Configuration Files in This Repository

- **`netlify.toml`**: Netlify build configuration with `@netlify/plugin-nextjs` and Node 20 runtime.
- **`vercel.json`**: Vercel configuration specifying Next.js framework preset and Prisma build commands.
- **`.gitignore`**: Blocks `.env`, `.env.local`, `node_modules`, `.next`, and logs from being committed to Git.
- **`.env.example`**: Safe environment variable template with zero secret leaks.
- **`package.json`**: Includes `"postinstall": "prisma generate"` ensuring Prisma client is generated on all cloud build environments.

---

## 🛠️ Git Commands to Push to GitHub / Remote

```bash
git add .
git commit -m "Configure deployment files for Netlify, Vercel, and Git"
git push origin main
```
