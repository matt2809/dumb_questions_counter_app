# Cloudflare Pages Deployment Guide

This guide will help you deploy your IdioQ (Dumb Questions Counter) app to Cloudflare Pages.

## Prerequisites

1. A Cloudflare account (free tier is sufficient)
2. Your Convex deployment URL
3. Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Prepare Your Convex Backend

First, make sure your Convex backend is deployed and running:

```bash
# Deploy your Convex backend
npx convex deploy
```

Note down your Convex deployment URL (it will look like `https://your-deployment-name.convex.cloud`).

## Step 2: Deploy to Cloudflare Pages

### Option A: Deploy via Cloudflare Dashboard (Recommended)

1. **Go to Cloudflare Pages**
   - Log in to your Cloudflare dashboard
   - Navigate to "Pages" in the sidebar
   - Click "Create a project"

2. **Connect Your Repository**
   - Choose "Connect to Git"
   - Select your Git provider (GitHub, GitLab, or Bitbucket)
   - Authorize Cloudflare to access your repositories
   - Select this repository

3. **Configure Build Settings**
   - **Framework preset**: Vite
   - **Build command**: `npm run build:cloudflare`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (leave empty)

4. **Set Environment Variables**
   - Click "Environment variables" in the build settings
   - Add the following variable:
     - **Variable name**: `VITE_CONVEX_URL`
     - **Value**: Your Convex deployment URL (e.g., `https://your-deployment-name.convex.cloud`)

5. **Deploy**
   - Click "Save and Deploy"
   - Cloudflare will build and deploy your app
   - You'll get a URL like `https://your-project-name.pages.dev`

### Option B: Deploy via Wrangler CLI

1. **Install Wrangler CLI**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**
   ```bash
   wrangler login
   ```

3. **Deploy**
   ```bash
   # Build the project
   npm run build:cloudflare
   
   # Deploy to Cloudflare Pages
   wrangler deploy
   ```

## Step 3: Configure Custom Domain (Optional)

1. In your Cloudflare Pages dashboard, go to your project
2. Click on "Custom domains"
3. Add your domain name
4. Follow the DNS configuration instructions

## Step 4: Set Up Automatic Deployments

Your app will automatically redeploy when you push changes to your main branch. To set up preview deployments for pull requests:

1. In your Cloudflare Pages project settings
2. Go to "Builds & deployments"
3. Enable "Preview deployments" for pull requests

## Environment Variables

Make sure to set these environment variables in your Cloudflare Pages project:

- `VITE_CONVEX_URL`: Your Convex deployment URL

## Troubleshooting

### Build Failures
- Check that your `VITE_CONVEX_URL` environment variable is set correctly
- Ensure your Convex backend is deployed and accessible
- Check the build logs in Cloudflare Pages dashboard

### Runtime Issues
- Verify your Convex URL is accessible from the browser
- Check browser console for any CORS or connection errors
- Ensure your Convex functions are properly deployed

### Performance
- The app is optimized for Cloudflare's CDN
- Static assets are cached with appropriate headers
- Client-side routing is handled with `_redirects` file

## File Structure for Deployment

The following files are important for Cloudflare Pages deployment:

- `wrangler.toml` - Cloudflare configuration
- `_headers` - HTTP headers for security and caching
- `_redirects` - Client-side routing configuration
- `vite.config.ts` - Build configuration optimized for Cloudflare

## Support

If you encounter issues:
1. Check the Cloudflare Pages build logs
2. Verify your Convex deployment is working
3. Test locally with `npm run build && npm run preview`
4. Check the browser console for runtime errors

Your app should now be live on Cloudflare Pages! 🚀
