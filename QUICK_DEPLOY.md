# 🚀 Quick Deployment Guide

## Deploy to Vercel (5 minutes)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Ready for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click **"New Project"**
4. Import your repository
5. Click **"Deploy"** (don't add env vars yet)

### Step 3: Set Up Upstash Redis
1. Go to [upstash.com](https://upstash.com)
2. Sign up for free account
3. Click **"Create Database"**
4. Choose **"Regional"** or **"Global"**
5. Select a region
6. Copy the **REST URL** and **REST TOKEN**

### Step 4: Add Environment Variables
1. In Vercel, go to your project
2. Click **Settings** → **Environment Variables**
3. Add these variables:
   ```
   UPSTASH_REDIS_REST_URL = your_redis_url_here
   UPSTASH_REDIS_REST_TOKEN = your_redis_token_here
   NEXT_PUBLIC_MAP_TILE_URL = https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
   ```
4. Click **"Redeploy"**

### Step 5: Your App is Live! 🎉
Your app will be available at: `https://your-project.vercel.app`

---

## Alternative: Deploy to Netlify

### Step 1: Push to GitHub (same as above)

### Step 2: Deploy to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Sign up/Login
3. Click **"Add new site"** → **"Import an existing project"**
4. Connect GitHub and select your repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Add environment variables (same as Vercel)
7. Click **"Deploy site"**

---

## Troubleshooting

### Build Fails
- Check Node.js version (requires 18+)
- Verify all environment variables are set
- Check build logs for errors

### Redis Connection Error
- Verify `UPSTASH_REDIS_REST_URL` is correct
- Verify `UPSTASH_REDIS_REST_TOKEN` is correct
- Check Redis database is active in Upstash dashboard

### Map Not Loading
- Verify `NEXT_PUBLIC_MAP_TILE_URL` is set
- Check browser console for CORS errors

---

## Cost
- **Vercel**: Free for personal projects
- **Upstash Redis**: Free tier (10K commands/day)
- **Total**: $0/month for small projects

---

## Next Steps
- Add custom domain
- Set up monitoring
- Configure rate limiting
- Add analytics

For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

