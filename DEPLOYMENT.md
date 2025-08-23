# 🚀 Aura Finance AI - Render Deployment Guide

This guide will help you deploy Aura Finance AI to Render with both frontend and backend services.

## 📋 Prerequisites

Before deploying to Render, ensure you have:

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Environment Variables**: Prepare your environment variables (see `.env.example`)

## 🏗️ Architecture Overview

The application consists of:
- **Frontend**: React + TypeScript + Vite (Node.js service)
- **Backend**: FastAPI (Python service)
- **Database**: PostgreSQL (optional, for data persistence)

## 🚀 Deployment Methods

### Method 1: Blueprint Deployment (Recommended)

This method deploys both services simultaneously using the `render.yaml` configuration.

#### Step 1: Prepare Your Repository
```bash
# Ensure all files are committed
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

#### Step 2: Deploy via Render Dashboard
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file
5. Configure environment variables (see section below)
6. Click **"Apply"**

### Method 2: Individual Service Deployment

Deploy each service separately for more control.

#### Deploy Backend Service
1. Go to Render Dashboard → **"New"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `aura-finance-backend`
   - **Environment**: `Python`
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Python Version**: `3.11.0`

#### Deploy Frontend Service
1. Go to Render Dashboard → **"New"** → **"Web Service"**
2. Connect your GitHub repository  
3. Configure:
   - **Name**: `aura-finance-frontend`
   - **Environment**: `Node`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`
   - **Node Version**: `18.17.0`

## 🔧 Environment Variables Configuration

### Backend Environment Variables
Set these in your backend service:

| Variable | Description | Example |
|----------|-------------|---------|
| `ENVIRONMENT` | Environment type | `production` |
| `FRONTEND_URL` | Frontend service URL | `https://aura-finance-frontend.onrender.com` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:port/db` |

### Frontend Environment Variables
Set these in your frontend service:

| Variable | Description | Example |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini AI API key | `your_api_key_here` |
| `VITE_API_URL` | Backend service URL | `https://aura-finance-backend.onrender.com` |

### Getting Service URLs
After deployment, you can find service URLs in:
1. Render Dashboard → Your Service → Settings → Domains

## 🗄️ Database Setup (Optional)

### Create PostgreSQL Database
1. Go to Render Dashboard → **"New"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `aura-finance-db`
   - **Database**: `aura_finance`
   - **User**: `aura_user`
   - **Region**: Same as your services (e.g., Oregon)

### Connect Database to Backend
1. Copy the **External Database URL** from your database dashboard
2. Add it as `DATABASE_URL` environment variable in your backend service

## 🔄 Continuous Deployment

### Auto-Deploy Setup
1. In each service settings, enable **"Auto-Deploy"**
2. Choose the branch to deploy from (usually `main`)
3. Services will automatically redeploy on git push

### Manual Deployment
You can manually trigger deployments from the Render dashboard:
1. Go to your service dashboard
2. Click **"Manual Deploy"** → **"Deploy latest commit"**

## 🏥 Health Checks & Monitoring

### Built-in Health Endpoints
- **Backend**: `https://your-backend-url.onrender.com/health`
- **Frontend**: `https://your-frontend-url.onrender.com/` (should load the app)

### Monitoring
- View logs in Render Dashboard → Service → Logs
- Monitor performance in Service → Metrics
- Set up alerts in Service → Settings → Notifications

## 🔒 Security Considerations

### Environment Variables
- Never commit sensitive data to git
- Use Render's environment variable system
- Rotate API keys regularly

### CORS Configuration
The backend is configured to allow requests from:
- `localhost` (development)
- `*.onrender.com` (production)
- Your specific frontend URL (via environment variable)

## 🐛 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check build logs in Render Dashboard
# Common fixes:
- Ensure all dependencies are in package.json/requirements.txt
- Check Node.js/Python version compatibility
- Verify build commands are correct
```

#### Service Communication Issues
```bash
# Check CORS configuration
# Verify environment variables:
- VITE_API_URL points to backend service
- FRONTEND_URL is set in backend
```

#### Database Connection Issues
```bash
# Verify DATABASE_URL format:
postgresql://username:password@host:port/database

# Check database service status
# Ensure backend and database are in the same region
```

### Viewing Logs
```bash
# Access logs via Render Dashboard:
1. Go to your service
2. Click "Logs" tab
3. Filter by time period or log level
```

## 📈 Scaling & Performance

### Service Scaling
- **Free Tier**: Services sleep after 15 minutes of inactivity
- **Paid Tiers**: Always-on services with autoscaling
- Scale resources in Service → Settings → Instance Type

### Performance Optimization
- Use CDN for static assets
- Optimize build size with proper bundling
- Monitor performance in Render Metrics

## 🔄 Updates & Maintenance

### Updating Dependencies
```bash
# Update package.json or requirements.txt
# Commit and push changes
git add .
git commit -m "Update dependencies"
git push origin main
# Services will auto-deploy if enabled
```

### Database Migrations
```bash
# For schema changes, run migrations after deployment
# Consider using a migration service or manual SQL execution
```

## 🆘 Support

### Getting Help
- **Render Documentation**: [render.com/docs](https://render.com/docs)
- **Community Support**: [community.render.com](https://community.render.com)
- **Render Status**: [status.render.com](https://status.render.com)

### Project Support
- **GitHub Issues**: Create an issue in your repository
- **Documentation**: See main README.md
- **Community**: Join the Aura Finance community

---

## 📝 Deployment Checklist

Before going live, ensure:

- [ ] All environment variables are configured
- [ ] Services can communicate (frontend → backend)
- [ ] Database is connected (if using one)
- [ ] Health checks are passing
- [ ] Domain names are configured (if using custom domains)
- [ ] SSL certificates are active
- [ ] Monitoring and alerts are set up
- [ ] Backup strategy is in place

## 🎉 Post-Deployment

After successful deployment:

1. **Test all functionality** in the production environment
2. **Monitor logs** for any issues
3. **Set up monitoring alerts** for service health
4. **Document any production-specific configurations**
5. **Share URLs** with your team or users

Your Aura Finance AI application is now live on Render! 🚀