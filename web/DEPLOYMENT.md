# İkinci Ses - Production Deployment Guide

Complete guide for deploying the İkinci Ses application to production.

---

## Pre-Deployment Checklist

### ✅ Environment Variables

Ensure all required environment variables are set in production:

**Required:**
- [ ] `DATABASE_URL` - MongoDB connection string (Atlas recommended)
- [ ] `JWT_SECRET` - Secure random string (32+ characters)
- [ ] `NEXT_PUBLIC_APP_URL` - Production URL (https://ikincises.com)
- [ ] `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- [ ] `CLOUDINARY_API_KEY` - Cloudinary API key
- [ ] `CLOUDINARY_API_SECRET` - Cloudinary API secret

**Optional but Recommended:**
- [ ] `SMTP_HOST` - Email server (Gmail: smtp.gmail.com)
- [ ] `SMTP_PORT` - Email port (587)
- [ ] `SMTP_USER` - Email username
- [ ] `SMTP_PASS` - Email password or app-specific password
- [ ] `PAYTR_MERCHANT_ID` - PayTR merchant ID
- [ ] `PAYTR_MERCHANT_KEY` - PayTR merchant key
- [ ] `PAYTR_MERCHANT_SALT` - PayTR merchant salt

### ✅ Database Setup

- [ ] MongoDB Atlas cluster created
- [ ] Database user created with appropriate permissions
- [ ] IP whitelist configured (allow from anywhere for serverless)
- [ ] Connection string tested
- [ ] Prisma schema synced: `npx prisma db push`
- [ ] Indexes created for performance

### ✅ Security Hardening

- [ ] All environment variables in production (not in code)
- [ ] JWT_SECRET is strong and unique
- [ ] CORS configured for production domain
- [ ] Rate limiting enabled (already in middleware)
- [ ] HTTPS enforced (automatic on Vercel)
- [ ] Security headers configured (already in middleware)
- [ ] No sensitive data in logs
- [ ] API routes protected with authentication

### ✅ Performance Optimization

- [ ] All images using CloudinaryImage component
- [ ] ISR enabled on static pages
- [ ] API routes have cache headers
- [ ] Lighthouse score 85+ (Desktop)
- [ ] Core Web Vitals passing
- [ ] Bundle size optimized

### ✅ SEO Configuration

- [ ] Meta tags on all pages
- [ ] Sitemap accessible at /api/sitemap
- [ ] robots.txt configured
- [ ] Open Graph images set
- [ ] Structured data (JSON-LD) on listing pages
- [ ] `NEXT_PUBLIC_APP_URL` updated to production URL

### ✅ Testing

- [ ] All critical user flows tested
- [ ] Authentication works (login, register, logout)
- [ ] Listing creation/edit/delete works
- [ ] Image uploads work
- [ ] Real-time messaging works (Socket.io)
- [ ] Payment flow tested (test mode)
- [ ] Email notifications work
- [ ] Mobile responsiveness verified

---

## Deployment Steps

### Option 1: Vercel (Recommended)

**Why Vercel:**
- Native Next.js support
- Automatic HTTPS
- Global CDN
- Zero configuration deployment
- Free tier available

**Steps:**

1. **Connect Repository**
   ```bash
   # Push to GitHub
   git add .
   git commit -m "Production ready"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure settings:
     - Framework Preset: Next.js
     - Build Command: `next build`
     - Output Directory: `.next`

3. **Add Environment Variables**
   - In Vercel dashboard → Settings → Environment Variables
   - Add all required variables from `.env.example`
   - Important: Add to "Production" environment

4. **Configure Custom Domain**
   - In Vercel dashboard → Settings → Domains
   - Add your domain (ikincises.com)
   - Update DNS records as instructed
   - SSL certificate auto-generated

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Visit your production URL!

**Post-Deployment:**
- [ ] Verify environment variables loaded
- [ ] Test database connection
- [ ] Test image uploads
- [ ] Test Socket.io connection (check port 3001)
- [ ] Submit sitemap to Google Search Console

---

### Option 2: Self-Hosted (VPS/Cloud)

**Requirements:**
- Node.js 18+
- MongoDB (Atlas or self-hosted)
- Nginx (reverse proxy)
- PM2 (process manager)

**Steps:**

1. **Server Setup**
   ```bash
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PM2
   sudo npm install -g pm2

   # Install Nginx
   sudo apt-get install nginx
   ```

2. **Clone and Install**
   ```bash
   git clone <your-repo>
   cd ikinci_el_muzik/web
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   nano .env
   ```

4. **Build Application**
   ```bash
   npm run build
   ```

5. **Start with PM2**
   ```bash
   # Start Next.js
   pm2 start npm --name "ikinci-ses" -- start

   # Start Socket.io server
   pm2 start npm --name "ikinci-ses-socket" -- run dev:socket

   # Save PM2 config
   pm2 save
   pm2 startup
   ```

6. **Configure Nginx**
   ```nginx
   server {
       server_name ikincises.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location /socket.io/ {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
       }
   }
   ```

7. **SSL Certificate**
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d ikincises.com
   ```

---

## Post-Deployment Configuration

### 1. Google Search Console

- [ ] Add property (https://ikincises.com)
- [ ] Verify ownership
- [ ] Submit sitemap (https://ikincises.com/api/sitemap)
- [ ] Request indexing for key pages

### 2. Analytics Setup (Optional)

**Google Analytics:**
```typescript
// app/layout.tsx
import Script from 'next/script';

<Script
    src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
    strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
    {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-XXXXXXXXXX');
    `}
</Script>
```

### 3. Error Monitoring (Optional)

**Sentry:**
```bash
npm install @sentry/nextjs

npx @sentry/wizard -i nextjs
```

### 4. Monitoring

**Vercel Analytics:**
- Automatically available in Vercel dashboard
- Monitor:
  - Page views
  - Response times
  - Error rates
  - Core Web Vitals

**Custom Monitoring:**
- Use Vercel Speed Insights
- Monitor database performance
- Set up uptime monitoring (UptimeRobot, Pingdom)

---

## Maintenance Checklist

### Daily
- [ ] Check error logs
- [ ] Monitor uptime
- [ ] Review Cloudinary usage

### Weekly
- [ ] Review analytics
- [ ] Check Core Web Vitals
- [ ] Clear old data (if applicable)
- [ ] Update content moderation

### Monthly
- [ ] Review security logs
- [ ] Update dependencies
- [ ] Database backup verification
- [ ] Cost optimization review

---

## Rollback Plan

If something goes wrong:

**Vercel:**
1. Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → Promote to Production

**Self-Hosted:**
```bash
# Revert to previous commit
git revert HEAD
git push

# Rebuild
npm run build
pm2 restart all
```

---

## Performance Targets

### Lighthouse Scores (Desktop)
- [ ] Performance: 90+
- [ ] Accessibility: 95+
- [ ] Best Practices: 95+
- [ ] SEO: 95+

### Core Web Vitals
- [ ] LCP (Largest Contentful Paint): < 2.5s
- [ ] FID (First Input Delay): < 100ms
- [ ] CLS (Cumulative Layout Shift): < 0.1

### API Response Times
- [ ] Cached routes: < 100ms
- [ ] Database routes: < 500ms
- [ ] Search: < 800ms

---

## Security Monitoring

### Regular Security Checks

```bash
# Check for vulnerable dependencies
npm audit

# Update dependencies
npm update

# Check for outdated packages
npm outdated
```

### Security Best Practices
- [ ] Regular dependency updates
- [ ] Monitor GitHub security alerts
- [ ] Review user-uploaded content
- [ ] Rate limiting working
- [ ] HTTPS enforced
- [ ] Sensitive data encrypted

---

## Troubleshooting

### Common Issues

**Database Connection Errors:**
```
Solution: Check DATABASE_URL, verify IP whitelist in MongoDB Atlas
```

**Socket.io Not Connecting:**
```
Solution: Ensure Socket.io server is running (npm run dev:socket)
Verify WebSocket support in your hosting provider
```

**Images Not Loading:**
```
Solution: Check Cloudinary credentials
Verify NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is set
```

**Build Fails:**
```
Solution: Check node version (18+)
Run: npm install --legacy-peer-deps
Clear cache: rm -rf .next node_modules
```

---

## Support & Resources

### Documentation
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas](https://docs.atlas.mongodb.com/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

### Community
- Next.js Discord
- MongoDB Forums
- Stack Overflow

---

## Cost Estimation

### Vercel (Recommended for MVP)
- **Free Tier:**
  - 100GB bandwidth/month
  - Unlimited deployments
  - HTTPS included
  - Sufficient for initial launch

- **Pro ($20/month):**
  - 1TB bandwidth
  - Advanced analytics
  - Team collaboration

### MongoDB Atlas
- **Free Tier (M0):**
  - 512MB storage
  - Shared CPU
  - Good for testing
  
- **Starter ($9/month):**
  - 2GB storage
  - Dedicated CPU
  - Production ready

### Cloudinary
- **Free Tier:**
  - 25GB storage
  - 25GB monthly bandwidth
  - Should cover initial launch

### Total Monthly Cost
- **MVP Launch:** $0-29/month
- **Growing:** $50-100/month
- **Scale:** $200+/month

---

## Next Steps After Deployment

1. **Monitor Performance**
   - Check Lighthouse scores
   - Monitor error rates
   - Track user metrics

2. **Gather Feedback**
   - User testing
   - Bug reports
   - Feature requests

3. **Iterate**
   - Fix critical bugs
   - Add requested features
   - Optimize based on metrics

4. **Marketing**
   - Social media presence
   - SEO optimization
   - Content marketing
   - Partnerships with music stores

---

## Emergency Contacts

**For Production Issues:**
- Database: MongoDB Atlas Support
- Hosting: Vercel Support
- Images: Cloudinary Support

**Critical Response Plan:**
1. Identify issue
2. Check error logs
3. Rollback if necessary
4. Fix and redeploy
5. Monitor closely

---

## Success Metrics

Track these KPIs post-launch:

### Technical
- [ ] 99.9% uptime
- [ ] < 2s page load time
- [ ] < 1% error rate
- [ ] 80%+ cache hit rate

### Business
- [ ] User registrations
- [ ] Listings created
- [ ] Messages sent
- [ ] Conversion rate

---

## Conclusion

Your application is **production-ready** with:
- ✅ Robust infrastructure
- ✅ Optimized performance
- ✅ SEO configuration
- ✅ Security hardening
- ✅ Comprehensive documentation

**Ready to launch!** 🚀

Follow this guide step-by-step for a smooth deployment. Good luck with İkinci Ses!
