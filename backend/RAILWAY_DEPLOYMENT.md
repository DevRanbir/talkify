# Railway Deployment Guide

This guide walks you through deploying the Talkify Course Recommendation Backend to Railway.

## 🚂 Quick Deploy to Railway

### Option 1: One-Click Deploy (Recommended)

1. **Fork or clone this repository**
2. **Click the Deploy button** (if available) or follow manual steps below

### Option 2: Manual Deployment

#### Step 1: Install Railway CLI

```bash
# Using npm
npm install -g @railway/cli

# Using yarn
yarn global add @railway/cli

# Using pnpm
pnpm install -g @railway/cli
```

#### Step 2: Login to Railway

```bash
railway login
```

This will open your browser to authenticate with Railway.

#### Step 3: Create a New Project

```bash
# Navigate to your backend directory
cd backend

# Initialize Railway project
railway create talkify-backend
```

#### Step 4: Set Environment Variables

```bash
# Set your Groq API key (REQUIRED)
railway variables set GROQ_API_KEY=your_groq_api_key_here

# Set production environment
railway variables set ENVIRONMENT=production

# Optional: Set custom port (Railway will auto-assign if not set)
railway variables set PORT=8000

# Optional: Set custom question limits
railway variables set MAX_QUESTIONS=8
railway variables set MIN_QUESTIONS=6
```

**🔑 Important**: Get your Groq API key from [console.groq.com](https://console.groq.com/)

#### Step 5: Deploy

```bash
# Deploy to Railway
railway deploy
```

Your app will be deployed and Railway will provide you with a URL like:
`https://talkify-backend-production.up.railway.app`

## 🔧 Configuration Files

The following files are configured for Railway deployment:

### `railway.toml`
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "python main.py"
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
```

### `Dockerfile` (Alternative)
If you prefer Docker deployment, Railway supports it automatically.

### `requirements.txt`
All Python dependencies are specified for Railway's automatic detection.

## 🌐 Domain and SSL

Railway automatically provides:
- **Free subdomain**: `your-app-name.up.railway.app`
- **SSL certificate**: HTTPS enabled by default
- **Custom domain**: Available in Railway dashboard

## 📊 Monitoring and Logs

### View Logs
```bash
# View real-time logs
railway logs

# View logs with follow
railway logs --follow
```

### Monitor Performance
- Access Railway dashboard for metrics
- Monitor API response times
- Track memory and CPU usage
- Set up alerts for downtime

## 🔒 Security Settings

### Environment Variables Security
- Never commit `.env` files to Git
- Use Railway's environment variables for all secrets
- Rotate API keys regularly

### CORS Configuration
Update CORS settings for production:

```python
# In main.py, update CORS for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.com"],  # Update this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🔄 CI/CD Setup

### Automatic Deployments

Connect your GitHub repository to Railway for automatic deployments:

1. Go to Railway dashboard
2. Select your project
3. Connect to GitHub repository
4. Enable automatic deployments on push to main branch

### Manual Deployments

```bash
# Deploy current directory
railway deploy

# Deploy specific folder
railway deploy --path ./backend
```

## 📈 Scaling

Railway automatically handles scaling, but you can configure:

### Vertical Scaling
- Adjust memory limits in Railway dashboard
- Monitor resource usage
- Upgrade plan if needed

### Horizontal Scaling
- Railway can handle multiple instances
- Load balancing is automatic
- Session data uses file storage (consider Redis for high scale)

## 🛠️ Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Check build logs
railway logs --build

# Common fixes:
# - Ensure requirements.txt is in root
# - Check Python version compatibility
# - Verify all imports are correct
```

#### 2. Environment Variable Issues
```bash
# List all variables
railway variables

# Update a variable
railway variables set GROQ_API_KEY=new_key_here

# Delete a variable
railway variables delete VARIABLE_NAME
```

#### 3. Health Check Failures
- Ensure `/health` endpoint is working locally
- Check if the app starts on the correct port
- Verify DATABASE_URL if using databases

#### 4. CORS Errors
- Update `allow_origins` in CORS configuration
- Ensure frontend domain is whitelisted
- Check browser developer tools for exact error

### Debug Commands

```bash
# Check deployment status
railway status

# View environment variables
railway variables

# Check service logs
railway logs --service backend

# Connect to Railway shell (if needed)
railway shell
```

## 💡 Best Practices

### Code Organization
- Keep environment variables in Railway dashboard
- Use proper error handling
- Implement health checks
- Add request logging

### Performance
- Enable response compression
- Use connection pooling for external APIs
- Implement caching where appropriate
- Monitor API response times

### Security
- Use HTTPS only
- Validate all inputs
- Implement rate limiting
- Regular security updates

## 🔗 Frontend Integration

After deployment, update your frontend configuration:

```javascript
// Update your API base URL
const API_BASE_URL = 'https://your-railway-app.up.railway.app/api/v1';
```

## 📋 Post-Deployment Checklist

- [ ] API health check returns 200
- [ ] All endpoints respond correctly
- [ ] Groq API integration works
- [ ] Course data loads properly
- [ ] Frontend can connect to backend
- [ ] CORS is properly configured
- [ ] SSL certificate is active
- [ ] Environment variables are set
- [ ] Logs are accessible
- [ ] Monitoring is set up

## 🆘 Support

If you encounter issues:

1. **Check Railway docs**: [docs.railway.app](https://docs.railway.app)
2. **Railway Discord**: Community support
3. **GitHub Issues**: For application-specific problems
4. **Groq Documentation**: For AI API issues

## 📊 Cost Optimization

### Railway Pricing
- **Hobby Plan**: $5/month with resource limits
- **Pro Plan**: Usage-based pricing
- **Team Plan**: For collaborative projects

### Cost Tips
- Monitor resource usage in dashboard
- Implement request caching
- Optimize database queries
- Use environment-based scaling

## 🔄 Updates and Maintenance

### Updating the Application
```bash
# Pull latest changes
git pull origin main

# Deploy update
railway deploy
```

### Dependency Updates
```bash
# Update requirements.txt
pip freeze > requirements.txt

# Commit and deploy
git add requirements.txt
git commit -m "Update dependencies"
git push origin main
```

### Monitoring Health
- Set up uptime monitoring
- Configure alerting for failures
- Regular health check testing
- Monitor API response times

---

Your Talkify backend is now ready for production on Railway! 🚀
