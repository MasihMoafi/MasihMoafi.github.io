# Deployment Instructions

## 1. Push to GitHub

From your local machine, run:

```bash
# Option A: If you haven't set up authentication yet
git config --global credential.helper manager-core
git push origin main

# Option B: If you have a Personal Access Token
git remote set-url origin https://MasihMoafi:<YOUR_PERSONAL_ACCESS_TOKEN>@github.com/MasihMoafi/My_freelance_website.git
git push origin main
```

## 2. Deploy to Vercel

### Method 1: Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Method 2: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your GitHub repository: `MasihMoafi/My_freelance_website`
5. Configure:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
6. Click "Deploy"

## 3. Environment Variables (if needed)
If your app uses environment variables, add them in Vercel dashboard under:
Project Settings → Environment Variables

## 4. Custom Domain (optional)
In Vercel dashboard:
Project → Settings → Domains → Add your custom domain

Your website will be live at: `https://your-project-name.vercel.app`