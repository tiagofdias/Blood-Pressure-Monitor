# Deploy to Render Guide

## Quick Deploy Steps

### Option 1: Using render.yaml (Recommended)
1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click "New" → "Blueprint"
4. Connect your GitHub repository
5. Render will automatically detect the `render.yaml` file and set up both:
   - Web Service (your Next.js app)
   - PostgreSQL Database

### Option 2: Manual Setup
1. **Create Database First:**
   - Go to Render Dashboard
   - Click "New" → "PostgreSQL"
   - Name: `bp-monitor-db`
   - Choose Free plan
   - Note the connection string

2. **Create Web Service:**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Settings:
     - **Name:** `bp-monitor-app`
     - **Environment:** `Node`
     - **Build Command:** `pnpm install && pnpm run db:generate && pnpm run build`
     - **Start Command:** `pnpm run start`

3. **Set Environment Variables:**
   ```
   NODE_ENV=production
   DATABASE_URL=[Your PostgreSQL connection string from step 1]
   NEXTAUTH_SECRET=[Generate a random string]
   NEXTAUTH_URL=https://your-app-name.onrender.com
   ```

## Important Notes

### Database Migration
- The first deployment will automatically run `prisma db push` to set up your database schema
- Your SQLite data won't transfer automatically - you'll need to manually migrate data if needed

### Environment Variables
- `DATABASE_URL`: Automatically provided by Render PostgreSQL
- `NEXTAUTH_SECRET`: Generate a secure random string (you can use `openssl rand -base64 32`)
- `NEXTAUTH_URL`: Will be your Render app URL (e.g., `https://bp-monitor-app.onrender.com`)

### Build Process
The build process will:
1. Install dependencies with pnpm
2. Generate Prisma client
3. Push database schema to PostgreSQL
4. Build the Next.js application

### Free Tier Limitations
- Your app will spin down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- 500 hours per month limit

## Troubleshooting

### Build Failures
- Check that all environment variables are set correctly
- Ensure PostgreSQL database is created first
- Check build logs for specific error messages

### Database Issues
- Verify `DATABASE_URL` environment variable
- Check that PostgreSQL service is running
- Review Prisma schema for PostgreSQL compatibility

### Authentication Issues
- Ensure `NEXTAUTH_URL` matches your actual domain
- Verify `NEXTAUTH_SECRET` is set and not empty
- Check that cookies work with your domain

## Post-Deployment
1. Test all functionality including:
   - User registration/login
   - Blood pressure readings
   - Chart visualization
   - Excel export
2. Monitor logs for any errors
3. Set up custom domain if needed

Your app will be available at: `https://your-app-name.onrender.com`

1. Go to your Render dashboard
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:

   **Basic Settings:**
   - Name: `bp-monitor-app` (or your preferred name)
   - Environment: `Node`
   - Region: Choose closest to your users
   - Branch: `main` (or your default branch)

   **Build & Deploy:**
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm start`

### 3. Environment Variables

In the Render dashboard, add these environment variables:

```
DATABASE_URL=file:./data/prod.db
NODE_ENV=production
```

### 4. Database Initialization

Since Render uses ephemeral storage, we need to set up the database on each deployment.

**Option A: Auto-setup on startup (Recommended)**

Update your `package.json` start script:
```json
{
  "scripts": {
    "start": "npx prisma db push && npx prisma db seed && next start"
  }
}
```

**Option B: Custom build script**

Create a build script that includes database setup:
```json
{
  "scripts": {
    "build": "npx prisma generate && npx prisma db push && npx prisma db seed && next build"
  }
}
```

### 5. Deploy

1. Click "Create Web Service"
2. Render will automatically deploy your application
3. Monitor the build logs for any errors

### 6. Access Your Application

Once deployed, you'll get a URL like: `https://your-app-name.onrender.com`

## Important Notes

### SQLite Limitations on Render

- **Ephemeral Storage**: SQLite data is lost on each deployment
- **Single Instance**: SQLite doesn't support multiple instances
- **Best for**: Development, demos, and low-traffic applications

### Upgrading to PostgreSQL (Recommended for Production)

For production applications with persistent data:

1. **Add PostgreSQL Database:**
   - In Render dashboard, create a new PostgreSQL database
   - Copy the connection string

2. **Update Prisma Schema:**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Update Environment Variable:**
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   ```

4. **Deploy:**
   - Render will automatically run migrations
   - Your data will persist across deployments

## Troubleshooting

### Common Issues

1. **Build Failures:**
   - Check that all dependencies are in `package.json`
   - Ensure Prisma schema is valid
   - Verify environment variables are set

2. **Database Errors:**
   - Check DATABASE_URL format
   - Verify Prisma schema matches database
   - Check build logs for migration errors

3. **Runtime Errors:**
   - Check start command includes database setup
   - Verify all environment variables are set
   - Check application logs in Render dashboard

### Useful Commands

Test locally before deploying:
```bash
# Build the application
npm run build

# Test the start command
npm start

# Check database connectivity
npm run db:studio
```

## Monitoring

- **Application Logs**: Available in Render dashboard
- **Performance**: Monitor response times and errors
- **Database**: Track query performance and storage usage

## Next Steps

1. Set up custom domain (if needed)
2. Configure SSL (automatically handled by Render)
3. Set up monitoring and alerts
4. Consider upgrading to PostgreSQL for production use
