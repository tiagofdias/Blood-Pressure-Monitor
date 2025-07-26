# Database Setup

This application uses Prisma with SQLite for data persistence. SQLite is perfect for this blood pressure monitoring app as it's lightweight, serverless, and works great on platforms like Render.

## Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Generate Prisma client:**
   ```bash
   npm run db:generate
   ```

3. **Create and setup database:**
   ```bash
   npm run db:push
   ```

4. **Seed with sample data:**
   ```bash
   npm run db:seed
   ```

5. **View database (optional):**
   ```bash
   npm run db:studio
   ```

## Database Schema

### Users Table
- `id` - Primary key
- `email` - Unique email address
- `name` - User's name
- `createdAt` - Account creation timestamp

### BP Readings Table
- `id` - Primary key
- `userId` - Foreign key to users table
- `readingDate` - Date of the reading
- `readingTime` - Time of the reading
- `readingDatetime` - Combined datetime for precise ordering
- `systolic` - Systolic blood pressure (mmHg)
- `diastolic` - Diastolic blood pressure (mmHg)
- `heartRate` - Heart rate (bpm, optional)
- `category` - Blood pressure category (Normal, Elevated, etc.)
- `createdAt` - Record creation timestamp

## Production Deployment on Render

### Environment Variables
Set the following environment variable in your Render dashboard:
```
DATABASE_URL=file:./prod.db
```

### Build Command
```bash
npm install && npm run build
```

### Start Command
```bash
npm start
```

### Database Setup
The database will be automatically created when the app starts. The SQLite file will be stored in the container's filesystem.

**Note for Render:** Since Render's filesystem is ephemeral, the SQLite database will be reset on each deployment. For production with persistent data, consider upgrading to PostgreSQL using Render's PostgreSQL addon.

## Upgrading to PostgreSQL (for production)

If you need persistent data across deployments, you can easily switch to PostgreSQL:

1. **Update schema.prisma:**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **Add PostgreSQL database on Render**
3. **Update environment variable to PostgreSQL connection string**
4. **Run migrations:**
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

## Available Commands

- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio
- `npm run db:reset` - Reset database (development only)
