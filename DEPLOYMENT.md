# Deployment Guide

This guide will help you deploy the City Hygiene Risk Monitor application to make it publicly accessible.

## Prerequisites

1. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, or Bitbucket)
2. **Upstash Redis Account**: Free tier available at [upstash.com](https://upstash.com)
3. **Deployment Platform Account**: Choose one of the platforms below

## Quick Deploy Options

### Option 1: Vercel (Recommended for Next.js) ⚡

Vercel is the easiest and fastest way to deploy Next.js applications.

#### Steps:

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Click "New Project"
   - Import your repository
   - Configure environment variables (see below)
   - Click "Deploy"

3. **Set Environment Variables in Vercel**
   - Go to Project Settings → Environment Variables
   - Add the following variables:
     ```
     UPSTASH_REDIS_REST_URL=your_redis_url
     UPSTASH_REDIS_REST_TOKEN=your_redis_token
     NEXT_PUBLIC_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
     ```

4. **Redeploy** after adding environment variables

#### Vercel Benefits:
- ✅ Free tier with generous limits
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Automatic deployments on git push
- ✅ Built-in analytics
- ✅ Zero configuration needed

---

### Option 2: Netlify 🌐

#### Steps:

1. **Push code to Git repository**

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Sign up/login
   - Click "Add new site" → "Import an existing project"
   - Connect your Git repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `.next`
   - Add environment variables (same as Vercel)
   - Click "Deploy site"

3. **Create `netlify.toml`** (optional, for better configuration):
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"
   
   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

---

### Option 3: Railway 🚂

#### Steps:

1. **Go to [railway.app](https://railway.app)**
2. **Sign up/login with GitHub**
3. **Create New Project** → "Deploy from GitHub repo"
4. **Select your repository**
5. **Add Redis Database**:
   - Click "+ New" → "Database" → "Redis"
   - Railway will automatically provide connection strings
6. **Set Environment Variables**:
   - `UPSTASH_REDIS_REST_URL` (from Railway Redis)
   - `UPSTASH_REDIS_REST_TOKEN` (from Railway Redis)
7. **Deploy**

---

### Option 4: Render 🎨

#### Steps:

1. **Go to [render.com](https://render.com)**
2. **Sign up/login**
3. **Create New Web Service**
4. **Connect your Git repository**
5. **Configure**:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment: Node
6. **Add Environment Variables**
7. **Create Redis Instance** (optional, or use Upstash)
8. **Deploy**

---

## Environment Variables Setup

Regardless of which platform you choose, you need to set these environment variables:

### Required Variables:

```env
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
NEXT_PUBLIC_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

### Optional Variables:

```env
# Rate Limiting
RATE_LIMIT_MAX=5
RATE_LIMIT_WINDOW=60000

# Image Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Setting Up Upstash Redis

1. **Create Account**: Go to [upstash.com](https://upstash.com)
2. **Create Database**: 
   - Click "Create Database"
   - Choose "Global" or "Regional"
   - Select a region close to your users
   - Free tier is sufficient for most use cases
3. **Get Credentials**:
   - Copy the REST URL
   - Copy the REST Token
   - Add these to your deployment platform's environment variables

## Post-Deployment Checklist

- [ ] Environment variables are set correctly
- [ ] Application builds without errors
- [ ] Map is displaying correctly
- [ ] Report submission works
- [ ] CSV upload works
- [ ] Geocoding is working
- [ ] Redis connection is established
- [ ] HTTPS is enabled (automatic on most platforms)
- [ ] Custom domain is configured (optional)

## Custom Domain Setup

### Vercel:
1. Go to Project Settings → Domains
2. Add your domain
3. Follow DNS configuration instructions
4. SSL certificate is automatically provisioned

### Netlify:
1. Go to Site Settings → Domain Management
2. Add custom domain
3. Configure DNS records
4. SSL is automatic

## Monitoring & Analytics

### Vercel Analytics:
- Built-in analytics dashboard
- Page views, performance metrics
- Real-time visitor data

### Error Tracking:
Consider adding error tracking:
- Sentry
- LogRocket
- Bugsnag

## Troubleshooting

### Build Fails:
- Check Node.js version (requires 18+)
- Verify all environment variables are set
- Check build logs for specific errors

### Redis Connection Errors:
- Verify UPSTASH_REDIS_REST_URL is correct
- Verify UPSTASH_REDIS_REST_TOKEN is correct
- Check Redis database is active in Upstash dashboard

### Map Not Loading:
- Verify NEXT_PUBLIC_MAP_TILE_URL is set
- Check browser console for CORS errors
- Ensure Leaflet CSS is loading

### Geocoding Not Working:
- Check Nominatim API is accessible
- Verify network requests are not blocked
- Check browser console for errors

## Cost Estimates

### Free Tier Options:
- **Vercel**: Free for personal projects (100GB bandwidth/month)
- **Netlify**: Free tier (100GB bandwidth/month)
- **Railway**: $5 free credit/month
- **Upstash Redis**: Free tier (10K commands/day)

### Paid Options:
- Scale based on usage
- Most platforms offer pay-as-you-go pricing
- Estimate: $0-20/month for small to medium traffic

## Support

For deployment issues:
1. Check platform-specific documentation
2. Review build logs
3. Check environment variables
4. Verify Redis connection
5. Test locally first

---

**Recommended**: Start with Vercel for the easiest deployment experience!

