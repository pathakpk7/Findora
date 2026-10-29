# 🚀 Findora Deployment Guide: Render (Backend) + Vercel (Frontend)

This guide covers deploying **Findora** to production:
- **Backend API**: [Render](https://render.com) (NestJS + Prisma + PostgreSQL + Cloudinary + Gemini AI)
- **Frontend Web App**: [Vercel](https://vercel.com) (Next.js 15 App Router + Tailwind CSS)
- **Database & Auth**: [Supabase](https://supabase.com) (PostgreSQL with Transaction Pooling)
- **Media Storage**: [Cloudinary](https://cloudinary.com)

---

## 📋 Pre-Deployment Checklist

1. **GitHub Repository**: Pushed to your GitHub account (`main` branch).
2. **Supabase Credentials**:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL (`https://your-ref.supabase.co`)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Public Key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Secret Key
   - `DATABASE_URL`: Your Supabase pooled PostgreSQL connection string
3. **Cloudinary**:
   - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary Cloud Name
   - `CLOUDINARY_API_KEY`: Your Cloudinary API Key
   - `CLOUDINARY_API_SECRET`: Your Cloudinary API Secret
4. **Google Gemini**:
   - `GEMINI_API_KEY`: Your Gemini API Key

---

## Part 1: Deploy Backend to Render

### Option A: One-Click Render Blueprint (Recommended)
This repository includes [`render.yaml`](./render.yaml).

1. In your [Render Dashboard](https://dashboard.render.com/), click **New +** $\rightarrow$ **Blueprint**.
2. Connect your GitHub repository.
3. Render automatically detects `render.yaml` and sets up the Node web service.
4. Fill in your environment variables and click **Apply**.

### Option B: Manual Web Service
1. Click **New +** $\rightarrow$ **Web Service**.
2. Select your repository:
   - **Root Directory**: *(Leave blank)*
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build:backend`
   - **Start Command**: `npm run start:backend`
   - **Health Check Path**: `/api/health`
3. Add the environment variables from `apps/backend/.env.example`.
4. Click **Create Web Service**.

---

## Part 2: Deploy Frontend to Vercel

1. In [Vercel](https://vercel.com/), click **Add New...** $\rightarrow$ **Project**.
2. Select your repository.
3. Configure settings:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Select `apps/frontend`
   - **Build Command**: `next build` (Default)
   - **Output Directory**: `.next` (Default)
4. In **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL`: Your Render backend URL (e.g. `https://findora-backend.onrender.com`)
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
5. Click **Deploy**.

---

## Part 3: Link Vercel & Render CORS

1. Go to your **Render Web Service** $\rightarrow$ **Environment**.
2. Add your live Vercel domain to `FRONTEND_URL` (e.g. `https://findora.vercel.app`).
   *(The backend also automatically allows all `*.vercel.app` preview deployments).*
