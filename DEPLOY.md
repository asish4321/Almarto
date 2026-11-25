# Deploying Almarto to Netlify

## Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/almarto.git
git push -u origin main
```

## Step 2 — Connect to Netlify

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect to GitHub → select your repo
4. Build settings are auto-detected from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `.next`

## Step 3 — Set Environment Variables (CRITICAL)

In Netlify Dashboard → **Site Settings → Environment Variables**, add ALL of these:

| Variable | Where to find it |
|---|---|
| `DATABASE_URL` | Supabase Dashboard → Settings → Database → Connection string (Transaction pooler) |
| `DIRECT_URL` | Supabase Dashboard → Settings → Database → Connection string (Session pooler) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → anon public key |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Same as anon key |
| `JWT_SECRET` | Generate: any 32+ char random string |
| `ADMIN_SECRET_KEY` | Your admin secret |
| `SMTP_HOST` | Your email provider |
| `SMTP_PORT` | Usually 587 |
| `SMTP_USER` | Your email address |
| `SMTP_PASS` | App-specific password |
| `SMTP_FROM` | ALMARTO <noreply@almarto.com> |

> ⚠️ DATABASE_URL must include: `?pgbouncer=true&connection_limit=5&pool_timeout=30&connect_timeout=15&statement_cache_size=0`

## Step 4 — Deploy

Click **"Deploy site"**. First deploy takes ~3-4 minutes.

## Keeping Supabase Active (Free Tier)

Supabase free tier pauses after 7 days of inactivity.
Set up a free cron at [cron-job.org](https://cron-job.org):
- URL: `https://your-netlify-site.netlify.app/api/health`
- Schedule: Every 3 days
